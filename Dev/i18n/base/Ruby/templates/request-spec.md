# Template: Request Test

Request tests exercise the full Rack stack (routing, middleware, controller, view/serializer) without a browser. They are the primary way to test controllers; prefer them over controller tests. Use RSpec (`type: :request`) or Minitest (`ActionDispatch::IntegrationTest`).

## What Every Resource Needs

| Case | Expected |
|------|----------|
| Authenticated and authorized, valid input | 2xx or redirect, state changed |
| Invalid input | 422, nothing persisted, errors rendered |
| Unauthenticated | 401 for APIs, redirect to sign-in for HTML |
| Authenticated but not allowed | 403 or 404 (do not leak existence) |
| Another user's or tenant's record | 404/403, never the data |
| Rate limited endpoint over threshold | 429 |

## Authentication Helper (RSpec)

Sign in through the real session flow, not by stubbing internals.

```ruby
# frozen_string_literal: true

# spec/support/authentication_helpers.rb
module AuthenticationHelpers
  def sign_in(user, password: "correct-horse-battery")
    post session_path, params: { email_address: user.email_address, password: }
  end
end

RSpec.configure do |config|
  config.include AuthenticationHelpers, type: :request
end
```

The path and parameter names match the Rails 8 authentication generator (`session_path`, `email_address`, `password`). Adjust them if the project uses Devise or another solution.

## Request Spec (RSpec)

```ruby
# frozen_string_literal: true

# spec/requests/orders_spec.rb
require "rails_helper"

RSpec.describe "Orders" do
  let(:user) { create(:user, password: "correct-horse-battery") }
  let(:customer) { create(:customer, user:) }
  let(:product) { create(:product, stock: 10) }

  describe "GET /orders" do
    it "redirects anonymous visitors to sign in" do
      get orders_path

      expect(response).to redirect_to(new_session_path)
    end

    it "lists only the current user's orders" do
      sign_in(user)
      mine = create(:order, :placed, customer:)
      other = create(:order, :placed)

      get orders_path

      expect(response).to have_http_status(:ok)
      expect(response.body).to include(mine.number)
      expect(response.body).not_to include(other.number)
    end
  end

  describe "POST /orders" do
    let(:valid_params) { { order: { items: [{ product_id: product.id, quantity: 2 }] } } }

    before { sign_in(user) }

    it "creates the order and redirects" do
      expect { post orders_path, params: valid_params }.to change(Order, :count).by(1)

      expect(response).to redirect_to(order_path(Order.last))
      expect(response).to have_http_status(:see_other)
    end

    it "enqueues the confirmation job" do
      expect { post orders_path, params: valid_params }
        .to have_enqueued_job(OrderConfirmationJob)
    end

    it "rejects an empty cart without persisting" do
      expect { post orders_path, params: { order: { items: [] } } }.not_to change(Order, :count)

      expect(response).to have_http_status(:unprocessable_content)
    end

    it "ignores attributes outside the permitted list" do
      post orders_path, params: valid_params.deep_merge(order: { status: "shipped", customer_id: 0 })

      expect(Order.last).to be_draft.or be_placed
      expect(Order.last.customer).to eq(customer)
    end
  end

  describe "GET /orders/:id" do
    it "returns 404 for another user's order" do
      sign_in(user)
      foreign = create(:order, :placed)

      get order_path(foreign)

      expect(response).to have_http_status(:not_found)
    end
  end
end
```

## JSON API Spec (RSpec)

```ruby
# frozen_string_literal: true

# spec/requests/api/v1/orders_spec.rb
require "rails_helper"

RSpec.describe "API V1 Orders" do
  let(:user) { create(:user) }
  let(:headers) { { "Authorization" => "Bearer #{user.api_token}", "Accept" => "application/json" } }

  it "returns 401 without a token" do
    get api_v1_orders_path, headers: { "Accept" => "application/json" }

    expect(response).to have_http_status(:unauthorized)
  end

  it "returns the order shape" do
    order = create(:order, :placed, customer: create(:customer, user:))

    get api_v1_order_path(order), headers: headers

    expect(response).to have_http_status(:ok)
    expect(response.parsed_body).to include("id" => order.id, "number" => order.number, "status" => "placed")
  end

  it "returns RFC 9457 problem details on validation errors" do
    post api_v1_orders_path, params: { order: { items: [] } }, headers: headers, as: :json

    expect(response).to have_http_status(:unprocessable_content)
    expect(response.parsed_body).to include("title", "status")
  end
end
```

`response.parsed_body` parses JSON automatically when the response content type is JSON.

## Rate Limit Spec (RSpec)

Rails 8 `rate_limit` stores counters in the cache store, which is a null store in test by default. Use a memory store for the example.

```ruby
# frozen_string_literal: true

# spec/requests/sessions_rate_limit_spec.rb
require "rails_helper"

RSpec.describe "Sign-in rate limiting" do
  before do
    allow(Rails).to receive(:cache).and_return(ActiveSupport::Cache::MemoryStore.new)
  end

  it "returns 429 after too many attempts" do
    11.times { post session_path, params: { email_address: "a@example.com", password: "wrong" } }

    expect(response).to have_http_status(:too_many_requests)
  end
end
```

The threshold (10 attempts) must match the controller's `rate_limit to: 10, within: 3.minutes, only: :create`. The controller's limiter reads `Rails.cache` by default, or the store set with `store:`.

## Integration Test (Minitest)

```ruby
# frozen_string_literal: true

# test/integration/orders_test.rb
require "test_helper"

class OrdersTest < ActionDispatch::IntegrationTest
  setup do
    @user = users(:alice)
    @product = products(:keyboard)
  end

  def sign_in(user)
    post session_path, params: { email_address: user.email_address, password: "correct-horse-battery" }
  end

  test "anonymous visitor is redirected to sign in" do
    get orders_path

    assert_redirected_to new_session_path
  end

  test "creates an order for the signed-in user" do
    sign_in(@user)

    assert_difference("Order.count", 1) do
      post orders_path, params: { order: { items: [{ product_id: @product.id, quantity: 1 }] } }
    end

    assert_redirected_to order_path(Order.last)
  end

  test "rejects an empty cart" do
    sign_in(@user)

    assert_no_difference("Order.count") do
      post orders_path, params: { order: { items: [] } }
    end

    assert_response :unprocessable_content
  end

  test "cannot read another user's order" do
    sign_in(@user)

    get order_path(orders(:bob_order))

    assert_response :not_found
  end
end
```

## System Test Companion (Capybara)

Cover only the critical journey end to end; request tests cover the rest.

```ruby
# frozen_string_literal: true

# spec/system/place_order_spec.rb
require "rails_helper"

RSpec.describe "Placing an order", type: :system do
  before { driven_by(:selenium_chrome_headless) }

  it "lets a signed-in customer place an order" do
    user = create(:user, password: "correct-horse-battery")
    create(:customer, user:)
    product = create(:product, name: "Mechanical keyboard", stock: 3)

    visit new_session_path
    fill_in "Email address", with: user.email_address
    fill_in "Password", with: "correct-horse-battery"
    click_button "Sign in"

    visit product_path(product)
    click_button "Add to cart"
    click_button "Place order"

    expect(page).to have_content("Order placed")
  end
end
```

Capybara waits automatically on `have_content` and `have_selector`; never add `sleep`.

## Checklist

- [ ] One `describe` per route and verb; examples named for behavior
- [ ] Success, validation failure, unauthenticated, unauthorized, and cross-tenant cases covered
- [ ] Assertions on status, redirect target or body shape, and persistence side effects
- [ ] Mass-assignment attempt tested on create/update
- [ ] Jobs and mails asserted with `have_enqueued_job` / `assert_enqueued_with`
- [ ] External HTTP stubbed (WebMock); time frozen with `travel_to` when needed
- [ ] No controller specs for new code; no `sleep`; tests run in random order
