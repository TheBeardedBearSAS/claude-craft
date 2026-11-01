# Ruby on Rails Testing Standards

TDD is mandatory: **Red -> Green -> Refactor**. Coverage target: **>= 80%** (SimpleCov). Every fixed bug gets a regression test that fails before the fix.

All commands run inside the container (`docker compose exec app ...`).

## Choosing a Framework

| Framework | When | Command |
|-----------|------|---------|
| **Minitest** (Rails default) | New Rails apps, minimal dependencies, fixtures | `bin/rails test` |
| **RSpec** (`rspec-rails`) | Teams preferring BDD syntax, shared examples, rich matchers | `bundle exec rspec` |

Rules:
- Pick **one** framework per project and stay consistent
- Both support the same layers: model, service, request, job, mailer, system
- This document shows both; the principles apply equally

## Test Pyramid

| Type | Share | Speed | Rails location |
|------|-------|-------|----------------|
| Unit (models, services, queries, POROs) | 70% | < 1 s | `test/models`, `spec/models`, `spec/services` |
| Integration (requests, jobs, mailers) | 20% | < 5 s | `test/integration`, `spec/requests` |
| System / E2E (Capybara + browser) | 10% | < 30 s | `test/system`, `spec/system` |

---

## Minitest

### Setup

```ruby
# test/test_helper.rb
# frozen_string_literal: true

require "simplecov"
SimpleCov.start "rails" do
  minimum_coverage 80
  add_filter "/test/"
end

ENV["RAILS_ENV"] ||= "test"
require_relative "../config/environment"
require "rails/test_help"

module ActiveSupport
  class TestCase
    parallelize(workers: :number_of_processors)
    fixtures :all
  end
end
```

Start SimpleCov before loading the application. With parallel tests, SimpleCov merges the worker results automatically in recent versions; verify the combined report.

### Model Test

```ruby
# test/models/order_test.rb
# frozen_string_literal: true

require "test_helper"

class OrderTest < ActiveSupport::TestCase
  test "is pending by default" do
    assert_predicate Order.new, :pending?
  end

  test "pay! moves a pending order to paid" do
    order = orders(:pending_order)

    order.pay!

    assert_predicate order, :paid?
    assert_not_nil order.paid_at
  end

  test "pay! rejects an already paid order" do
    assert_raises(Order::InvalidTransition) { orders(:paid_order).pay! }
  end

  test "total cannot be negative" do
    order = Order.new(total_cents: -1)

    assert_not order.valid?
    assert_includes order.errors[:total_cents], "must be greater than or equal to 0"
  end
end
```

### Fixtures

```yaml
# test/fixtures/orders.yml
pending_order:
  user: alice
  status: 0
  total_cents: 1500

paid_order:
  user: alice
  status: 1
  total_cents: 2500
  paid_at: <%= 1.day.ago %>
```

Guidelines: keep fixtures small and named by role, reference associations by label, never depend on fixture IDs.

### Controller / Request Test

```ruby
# test/controllers/orders_controller_test.rb
# frozen_string_literal: true

require "test_helper"

class OrdersControllerTest < ActionDispatch::IntegrationTest
  setup { sign_in_as users(:alice) }

  test "index lists the user's orders" do
    get orders_url

    assert_response :success
    assert_select "li.order", count: users(:alice).orders.count
  end

  test "create with invalid params re-renders the form" do
    assert_no_difference "Order.count" do
      post orders_url, params: { order: { total_cents: -5 } }
    end

    assert_response :unprocessable_entity
  end

  test "cannot read another user's order" do
    get order_url(orders(:bobs_order))

    assert_response :not_found
  end
end
```

Authentication helper: define `sign_in_as(user)` once in `test/test_helpers/` (the Rails 8 authentication generator creates a ready-made `SessionTestHelper`) and include it in `ActionDispatch::IntegrationTest`. Keep sign-in logic out of individual tests.

### Job and Mailer Tests

```ruby
class SendReceiptJobTest < ActiveJob::TestCase
  test "sends the receipt once" do
    order = orders(:paid_order)

    assert_emails 1 do
      SendReceiptJob.perform_now(order.id)
    end

    assert_no_emails { SendReceiptJob.perform_now(order.id) }
  end

  test "is enqueued after order creation" do
    assert_enqueued_with(job: SendReceiptJob) do
      Order.create!(user: users(:alice), total_cents: 100)
    end
  end
end
```

---

## RSpec

### Setup

```bash
docker compose exec app bundle add rspec-rails --group "development, test"
docker compose exec app bin/rails generate rspec:install
```

```ruby
# spec/rails_helper.rb (excerpt)
# frozen_string_literal: true

require "simplecov"
SimpleCov.start "rails" do
  minimum_coverage 80
  add_filter "/spec/"
end

require "spec_helper"
ENV["RAILS_ENV"] ||= "test"
require_relative "../config/environment"
abort("The Rails environment is running in production mode!") if Rails.env.production?
require "rspec/rails"

Dir[Rails.root.join("spec/support/**/*.rb")].each { |f| require f }

RSpec.configure do |config|
  config.use_transactional_fixtures = true
  config.infer_spec_type_from_file_location!
  config.filter_run_excluding :js unless ENV["SYSTEM"]
  config.include FactoryBot::Syntax::Methods
end
```

### Model Spec

```ruby
# spec/models/order_spec.rb
# frozen_string_literal: true

require "rails_helper"

RSpec.describe Order, type: :model do
  describe "validations" do
    it "rejects a negative total" do
      order = build(:order, total_cents: -1)

      expect(order).not_to be_valid
      expect(order.errors[:total_cents]).to be_present
    end
  end

  describe "#pay!" do
    it "moves a pending order to paid" do
      order = create(:order, :pending)

      order.pay!

      expect(order).to be_paid
      expect(order.paid_at).to be_present
    end

    it "raises when the order is already paid" do
      order = create(:order, :paid)

      expect { order.pay! }.to raise_error(Order::InvalidTransition)
    end
  end

  describe ".overdue" do
    it "returns pending orders older than three days" do
      old = create(:order, :pending, created_at: 4.days.ago)
      create(:order, :pending, created_at: 1.day.ago)

      expect(described_class.overdue).to contain_exactly(old)
    end
  end
end
```

### Service Spec

```ruby
# spec/services/orders/checkout_spec.rb
# frozen_string_literal: true

require "rails_helper"

RSpec.describe Orders::Checkout do
  let(:user) { create(:user) }
  let(:cart) { build(:cart, :with_items) }
  let(:gateway) { instance_double(Payments::Gateway, charge!: true) }

  subject(:result) do
    described_class.call(user: user, cart: cart, payment_token: "tok_test", gateway: gateway)
  end

  context "when payment succeeds" do
    it "creates a paid order" do
      expect(result).to be_success
      expect(result.order).to be_paid
    end

    it "enqueues the receipt" do
      expect { result }.to have_enqueued_job(SendReceiptJob)
    end
  end

  context "when the card is declined" do
    before { allow(gateway).to receive(:charge!).and_raise(Payments::Declined, "declined") }

    it "returns a failure and keeps no paid order" do
      expect(result).not_to be_success
      expect(result.error).to eq("declined")
      expect(Order.paid).to be_empty
    end
  end
end
```

Use `instance_double` / `class_double` (verifying doubles) so doubles fail when the real interface changes.

### Request Spec

```ruby
# spec/requests/orders_spec.rb
# frozen_string_literal: true

require "rails_helper"

RSpec.describe "Orders", type: :request do
  let(:user) { create(:user) }

  before { sign_in user }

  describe "GET /orders" do
    it "lists the current user's orders only" do
      mine = create(:order, user: user)
      other = create(:order)

      get orders_path

      expect(response).to have_http_status(:ok)
      expect(response.body).to include(mine.public_id)
      expect(response.body).not_to include(other.public_id)
    end
  end

  describe "POST /orders" do
    it "rejects invalid params" do
      post orders_path, params: { order: { total_cents: -5 } }

      expect(response).to have_http_status(:unprocessable_entity)
    end
  end
end
```

### Shared Examples

```ruby
RSpec.shared_examples "an archivable" do
  it "archives and restores" do
    record = create(described_class.model_name.singular)

    record.archive!

    expect(record).to be_archived
  end
end

RSpec.describe Article do
  it_behaves_like "an archivable"
end
```

---

## FactoryBot

```ruby
# spec/factories/orders.rb (or test/factories when using Minitest)
# frozen_string_literal: true

FactoryBot.define do
  factory :order do
    user
    total_cents { 1_500 }
    status { :pending }

    trait :pending do
      status { :pending }
    end

    trait :paid do
      status { :paid }
      paid_at { Time.current }
    end

    trait :with_items do
      after(:create) { |order| create_list(:line_item, 2, order: order) }
    end
  end
end
```

Guidelines:
- Smallest valid object by default; express variants with traits
- Prefer `build` / `build_stubbed` over `create` when persistence is not needed
- Use sequences for unique values (`sequence(:email_address) { |n| "user#{n}@example.com" }`)
- Run `FactoryBot.lint` in CI to detect broken factories
- Avoid deep association chains that create dozens of records

Fixtures and FactoryBot can coexist, but mixing them in one project hurts readability. Choose one default.

---

## System Tests (Capybara)

```ruby
# test/system/checkout_test.rb
# frozen_string_literal: true

require "application_system_test_case"

class CheckoutTest < ApplicationSystemTestCase
  test "a customer places an order" do
    sign_in_as users(:alice)
    visit new_order_path

    fill_in "Shipping address", with: "1 rue de Rivoli, Paris"
    click_on "Place order"

    assert_text "Order placed"
    assert_current_path order_path(Order.last)
  end
end
```

```ruby
# spec/system/checkout_spec.rb
RSpec.describe "Checkout", type: :system do
  before { driven_by(:selenium, using: :headless_chrome, screen_size: [1400, 900]) }

  it "lets a customer place an order" do
    sign_in create(:user)
    visit new_order_path

    fill_in "Shipping address", with: "1 rue de Rivoli, Paris"
    click_on "Place order"

    expect(page).to have_content("Order placed")
  end
end
```

Guidelines:
- Cover critical user journeys only (sign-in, checkout, key Turbo interactions)
- Use Capybara's waiting matchers (`assert_text`, `have_content`), **never** `sleep`
- Run a headless browser in a container service (Selenium or a Chromium-equipped test image)
- Test Turbo Frames/Streams through visible outcomes, not internals
- Keep each system test independent and under 30 seconds

---

## Time, Randomness and External Services

```ruby
# Time
travel_to Time.zone.local(2026, 11, 1, 10, 0) do
  assert_predicate invoice, :overdue?
end
freeze_time { ... }

# HTTP: block real calls
require "webmock/minitest"   # or "webmock/rspec"
stub_request(:post, "https://api.payments.test/charges")
  .with(body: hash_including(amount: 1500))
  .to_return(status: 200, body: { id: "ch_1" }.to_json)
```

- WebMock blocks real network access in tests
- VCR records interactions for large third-party integrations; scrub secrets from cassettes (`filter_sensitive_data`)
- Inject clocks and gateways instead of stubbing globals

---

## Coverage with SimpleCov

```ruby
SimpleCov.start "rails" do
  enable_coverage :branch
  minimum_coverage line: 80, branch: 70
  add_group "Services", "app/services"
  add_group "Forms", "app/forms"
  add_group "Queries", "app/queries"
  add_filter "/config/"
  add_filter "/db/"
end
```

```bash
docker compose exec app bin/rails test              # coverage/index.html generated
docker compose exec app bundle exec rspec
```

Coverage is a floor, not a goal. Complement it with mutation testing where critical (`mutant` is the best-known Ruby mutation tool; check its licence terms for your project before adoption).

---

## Test Quality Rules

| Rule | Detail |
|------|--------|
| AAA | Arrange, Act, Assert, visible in each test |
| Naming | Describe behaviour: `"pay! rejects an already paid order"` |
| Independence | No shared state, no ordering dependence; run with random order |
| Determinism | Freeze time, seed randomness, no `sleep` |
| One behaviour | Few assertions per test, focused failure messages |
| Behaviour not implementation | Test public interface and outcomes |
| Mock boundaries | Mock external services, not the object under test or Active Record |
| Fast | Unit tests under 1 second |

Anti-patterns:
- Tests asserting private method calls
- `allow_any_instance_of` (prefer injection and verifying doubles)
- Commented-out or skipped tests without ticket
- Tests without assertions
- Reliance on database state left by other tests

---

## Regression Workflow (Bug Fix)

1. Write a test reproducing the bug (it **fails**)
2. Fix the code (the test **passes**)
3. Refactor with the suite green
4. Commit the test and the fix together (`fix(orders): ...`)

---

## CI Execution

```yaml
# .github/workflows/ci.yml (excerpt)
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: ruby/setup-ruby@v1
        with:
          bundler-cache: true
      - run: bin/rails db:test:prepare test
      - run: bin/rails test:system
```

Locally, `docker compose exec app bin/ci` runs the same steps declared in `config/ci.rb`. Pin third-party actions to commit SHAs in production pipelines.

---

## Testing Checklist

- [ ] One framework (Minitest or RSpec) used consistently
- [ ] Tests written first (Red -> Green -> Refactor)
- [ ] Coverage >= 80% enforced by SimpleCov
- [ ] Model, service, request, job and system layers covered
- [ ] No `sleep`; time frozen where relevant
- [ ] External HTTP blocked (WebMock) or recorded (VCR, scrubbed)
- [ ] Authorization tested: users cannot reach other users' records
- [ ] Every bug fix has a regression test
- [ ] Suite runs in random order and in parallel
