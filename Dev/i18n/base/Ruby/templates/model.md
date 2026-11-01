# Template: Active Record Model

A model owns its data integrity and domain behavior: associations, validations, scopes, enums, and small domain methods. Side effects (mail, HTTP, billing) belong in jobs or service objects, not callbacks.

## Migration

```ruby
# frozen_string_literal: true

# db/migrate/20261101120000_create_orders.rb
class CreateOrders < ActiveRecord::Migration[8.1]
  def change
    create_table :orders do |t|
      t.references :customer, null: false, foreign_key: true
      t.string :number, null: false
      t.integer :status, null: false, default: 0
      t.integer :total_cents, null: false, default: 0
      t.string :currency, null: false, default: "EUR", limit: 3
      t.datetime :placed_at
      t.integer :lock_version, null: false, default: 0

      t.timestamps
    end

    add_index :orders, :number, unique: true
    add_index :orders, [:customer_id, :status]
    add_check_constraint :orders, "total_cents >= 0", name: "orders_total_non_negative"
  end
end
```

Rules: every reference has an index and a foreign key; `null: false` and constraints mirror validations; migrations are reversible; backfills go in a separate migration or a rake task.

## Model

```ruby
# frozen_string_literal: true

# app/models/order.rb
class Order < ApplicationRecord
  CURRENCIES = %w[EUR USD GBP].freeze

  belongs_to :customer
  has_many :line_items, dependent: :destroy, inverse_of: :order
  has_many :products, through: :line_items

  enum :status, { draft: 0, placed: 1, paid: 2, shipped: 3, cancelled: 4 }, validate: true

  encrypts :delivery_notes

  normalizes :number, with: ->(value) { value.strip.upcase }

  validates :number, presence: true, uniqueness: true
  validates :currency, inclusion: { in: CURRENCIES }
  validates :total_cents, numericality: { greater_than_or_equal_to: 0, only_integer: true }
  validate :line_items_present, unless: :draft?

  before_validation :assign_number, on: :create

  scope :recent, -> { order(placed_at: :desc) }
  scope :for_customer, ->(customer) { where(customer:) }
  scope :open, -> { where(status: %i[draft placed paid]) }

  def total
    Money.new(total_cents, currency)
  end

  def cancellable?
    placed? || paid?
  end

  def cancel!
    raise InvalidTransition, "Order #{number} cannot be cancelled from #{status}" unless cancellable?

    cancelled!
  end

  class InvalidTransition < StandardError; end

  private

  def assign_number
    self.number ||= "ORD-#{SecureRandom.alphanumeric(10).upcase}"
  end

  def line_items_present
    errors.add(:line_items, :blank) if line_items.empty?
  end
end
```

Notes:
- `enum :status, { ... }, validate: true` is the positional syntax; `validate: true` makes invalid values a validation error rather than an `ArgumentError`
- `encrypts` requires Active Record Encryption keys in credentials (`bin/rails db:encryption:init`); add `deterministic: true` only when the column must be queried by equality
- `normalizes` runs on assignment and on finder arguments (Rails 7.1+)
- `Money` stands for the project's money type (for example the `money-rails` gem or a small value object); replace it with what the project uses
- Optimistic locking is active because the table has `lock_version`
- Keep callbacks to normalization; `after_create` mail delivery becomes `Orders::Place` enqueueing a job

## Concern (only when cohesive and shared)

```ruby
# frozen_string_literal: true

# app/models/concerns/archivable.rb
module Archivable
  extend ActiveSupport::Concern

  included do
    scope :active, -> { where(archived_at: nil) }
    scope :archived, -> { where.not(archived_at: nil) }
  end

  def archive! = update!(archived_at: Time.current)
  def archived? = archived_at.present?
end
```

A concern groups one cohesive behavior used by several models. Do not use concerns to hide a large model's size.

## Model Test (RSpec)

```ruby
# frozen_string_literal: true

# spec/models/order_spec.rb
require "rails_helper"

RSpec.describe Order do
  describe "validations" do
    subject(:order) { build(:order) }

    it { is_expected.to be_valid }

    it "rejects an unsupported currency" do
      order.currency = "XXX"

      expect(order).not_to be_valid
      expect(order.errors[:currency]).to be_present
    end

    it "requires line items once placed" do
      order.status = :placed

      expect(order).not_to be_valid
      expect(order.errors[:line_items]).to be_present
    end
  end

  describe "#cancel!" do
    it "cancels a placed order" do
      order = create(:order, :placed)

      expect { order.cancel! }.to change(order, :status).from("placed").to("cancelled")
    end

    it "refuses to cancel a shipped order" do
      order = create(:order, :shipped)

      expect { order.cancel! }.to raise_error(Order::InvalidTransition)
    end
  end

  describe ".open" do
    it "excludes cancelled and shipped orders" do
      open_order = create(:order, :placed)
      create(:order, :cancelled)

      expect(described_class.open).to contain_exactly(open_order)
    end
  end
end
```

## Model Test (Minitest)

```ruby
# frozen_string_literal: true

# test/models/order_test.rb
require "test_helper"

class OrderTest < ActiveSupport::TestCase
  test "is valid with fixture defaults" do
    assert_predicate orders(:draft_order), :valid?
  end

  test "rejects an unsupported currency" do
    order = orders(:draft_order)
    order.currency = "XXX"

    assert_not order.valid?
    assert_includes order.errors.attribute_names, :currency
  end

  test "cancel! moves a placed order to cancelled" do
    order = orders(:placed_order)

    order.cancel!

    assert_predicate order, :cancelled?
  end

  test "cancel! raises for a shipped order" do
    assert_raises(Order::InvalidTransition) { orders(:shipped_order).cancel! }
  end
end
```

## Factory (FactoryBot)

```ruby
# frozen_string_literal: true

# spec/factories/orders.rb
FactoryBot.define do
  factory :order do
    customer
    currency { "EUR" }
    total_cents { 0 }
    status { :draft }

    trait :placed do
      status { :placed }
      placed_at { Time.current }
      after(:build) { |order| order.line_items << build(:line_item, order:) }
    end

    trait :shipped do
      placed
      status { :shipped }
    end

    trait :cancelled do
      placed
      status { :cancelled }
    end
  end
end
```

## Checklist

- [ ] Migration reversible, with indexes, foreign keys, `null: false`, constraints
- [ ] Validations mirror database constraints (and vice versa)
- [ ] Associations declare `dependent:` and `inverse_of:` where relevant
- [ ] Enums have explicit integer values (never reorder them)
- [ ] Sensitive columns use `encrypts`
- [ ] Callbacks limited to normalization; no HTTP or mail in callbacks
- [ ] Scopes are small, chainable, and named for intent
- [ ] Domain methods have intention-revealing names and raise explicit errors
- [ ] Tests cover validations, scopes, state transitions, and edge cases
- [ ] Factories valid and minimal (`bundle exec rake factory_bot:lint`)
