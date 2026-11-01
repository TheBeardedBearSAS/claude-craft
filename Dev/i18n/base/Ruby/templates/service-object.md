# Template: Service Object

Use a service object only when a controller action or model method grows beyond a readable size, or when an operation spans several models or external systems. Otherwise keep the logic in the model or controller (Rails Way first, YAGNI).

## Conventions

- One class per operation, one public method: `call`
- Namespaced by domain: `Orders::Place` in `app/services/orders/place.rb`
- Dependencies injected through the initializer with sensible defaults
- Returns a `Result` value object; never returns raw booleans or raises for expected failures
- Wraps multi-record writes in a transaction; enqueues side effects (mail, webhooks) after commit

## Result Value Object

```ruby
# frozen_string_literal: true

# app/services/result.rb
class Result
  Success = Data.define(:value) do
    def success? = true
    def failure? = false
  end

  Failure = Data.define(:error, :details) do
    def initialize(error:, details: {})
      super
    end

    def success? = false
    def failure? = true
  end

  def self.success(value = nil) = Success.new(value:)
  def self.failure(error, details = {}) = Failure.new(error:, details:)
end
```

## Service

```ruby
# frozen_string_literal: true

# app/services/orders/place.rb
module Orders
  # Places an order for a customer from a list of line items.
  #
  # Input:  customer (Customer), items (Array of { product_id:, quantity: })
  # Output: Result::Success(value: Order) or Result::Failure(error: Symbol, details: Hash)
  class Place
    def initialize(customer:, items:, inventory: Inventory, clock: Time)
      @customer = customer
      @items = items
      @inventory = inventory
      @clock = clock
    end

    def self.call(...) = new(...).call

    def call
      return Result.failure(:empty_cart) if @items.empty?
      return Result.failure(:customer_blocked) if @customer.blocked?

      order = build_order
      return Result.failure(:invalid_order, errors: order.errors.to_hash) unless persist(order)

      OrderConfirmationJob.perform_later(order)
      Result.success(order)
    rescue Inventory::OutOfStock => e
      Result.failure(:out_of_stock, product_id: e.product_id)
    end

    private

    def build_order
      @customer.orders.build(placed_at: @clock.current).tap do |order|
        @items.each do |item|
          order.line_items.build(product_id: item.fetch(:product_id), quantity: item.fetch(:quantity))
        end
      end
    end

    def persist(order)
      Order.transaction do
        order.line_items.each { |line| @inventory.reserve!(line.product_id, line.quantity) }
        order.save
      end
    end
  end
end
```

Notes:
- `Time.current` is reached through the injected `clock` (`Time` responds to `current` in Rails) so tests can freeze it
- `Inventory.reserve!` raises `Inventory::OutOfStock`, which rolls back the surrounding transaction
- The job is enqueued after the transaction block ends, so workers never see an uncommitted order (Rails also defers `perform_later` when `enqueue_after_transaction_commit` is enabled)

## Controller Usage

```ruby
# app/controllers/orders_controller.rb
class OrdersController < ApplicationController
  def create
    result = Orders::Place.call(customer: Current.user.customer, items: order_items)

    if result.success?
      redirect_to result.value, status: :see_other, notice: t(".created")
    else
      @error = result.error
      render :new, status: :unprocessable_content
    end
  end

  private

  def order_items
    params.expect(order: [items: [[:product_id, :quantity]]])[:items].map { |item| item.to_h.symbolize_keys }
  end
end
```

## Unit Test (RSpec)

```ruby
# frozen_string_literal: true

# spec/services/orders/place_spec.rb
require "rails_helper"

RSpec.describe Orders::Place do
  subject(:result) { described_class.call(customer:, items:) }

  let(:customer) { create(:customer) }
  let(:product) { create(:product, stock: 5) }
  let(:items) { [{ product_id: product.id, quantity: 2 }] }

  context "with valid items" do
    it "returns the persisted order" do
      expect(result).to be_success
      expect(result.value).to be_persisted
    end

    it "enqueues the confirmation job" do
      expect { result }.to have_enqueued_job(OrderConfirmationJob)
    end
  end

  context "with an empty cart" do
    let(:items) { [] }

    it "fails without touching the database" do
      expect { result }.not_to change(Order, :count)
      expect(result.error).to eq(:empty_cart)
    end
  end

  context "when stock is insufficient" do
    before { allow(Inventory).to receive(:reserve!).and_raise(Inventory::OutOfStock.new(product.id)) }

    it "rolls back and reports the product" do
      expect { result }.not_to change(Order, :count)
      expect(result.error).to eq(:out_of_stock)
      expect(result.details).to include(product_id: product.id)
    end
  end
end
```

## Unit Test (Minitest)

```ruby
# frozen_string_literal: true

# test/services/orders/place_test.rb
require "test_helper"

class Orders::PlaceTest < ActiveSupport::TestCase
  include ActiveJob::TestHelper

  setup do
    @customer = customers(:alice)
    @product = products(:keyboard)
  end

  test "places an order and enqueues confirmation" do
    result = nil
    assert_enqueued_with(job: OrderConfirmationJob) do
      result = Orders::Place.call(customer: @customer, items: [{ product_id: @product.id, quantity: 1 }])
    end

    assert_predicate result, :success?
    assert_predicate result.value, :persisted?
  end

  test "fails on empty cart" do
    result = Orders::Place.call(customer: @customer, items: [])

    assert_equal :empty_cart, result.error
  end
end
```

## Checklist

- [ ] Single public method `call`; everything else private
- [ ] No more than ~30 lines per method group; split if it grows
- [ ] Expected failures returned as `Result.failure`, unexpected ones raised
- [ ] Dependencies injected with defaults, so tests need no global stubbing
- [ ] Side effects enqueued as jobs, not performed inline
- [ ] Transaction wraps all writes that must succeed together
- [ ] Tests cover success, each failure branch, and rollback
- [ ] Not extracted prematurely: logic used once and short stays in the model or controller
