# Ruby on Rails Architecture - Rails Way & Pragmatic Clean Design

## Architectural Principles

### 1. Rails Way First

Rails 8.1 ships a complete, opinionated architecture. Follow its conventions first and extract additional objects only when a model or controller shows real pain (size, branching, multi-model orchestration, hard-to-test logic).

```
app/
├── models/                    # Active Record models: persistence, validations, domain rules
│   └── concerns/              # Cohesive, reusable model behaviour
├── controllers/               # Thin HTTP layer
│   └── concerns/              # Authentication, authorization helpers
├── services/                  # Service objects (one use case, one `call`)
├── forms/                     # Form objects (multi-model or non-persisted input)
├── queries/                   # Query objects (complex reads)
├── policies/                  # Authorization policies (Pundit) - optional
├── jobs/                      # Active Job classes (Solid Queue)
├── mailers/
├── channels/                  # Action Cable (Solid Cable)
├── views/                     # ERB templates, Turbo Frames and Streams
├── helpers/
└── javascript/controllers/    # Stimulus controllers (importmap)
config/
├── routes.rb
├── credentials.yml.enc
├── ci.rb                      # bin/ci steps (Rails 8.1)
└── initializers/
db/
├── migrate/
├── schema.rb
└── seeds.rb
```

### 2. Pragmatic Clean: no mandatory layering

Hexagonal or Clean Architecture layering is **not required** in a Rails application. Active Record is the persistence layer by design; wrapping it in repositories rarely pays off.

| Situation | Recommended approach |
|-----------|----------------------|
| CRUD with simple rules | Plain model + controller |
| Rules touching one record | Model methods, validations, scopes |
| Workflow spanning several models or external systems | Service object |
| Form writing several models, or virtual attributes | Form object (`ActiveModel::Model`) |
| Complex, reusable read | Query object or scope |
| Cohesive behaviour shared by several models | Concern |
| Async or slow work | Active Job |
| Authorization rules | Policy object (Pundit) or controller concern |

**Rule of thumb:** extract on the second or third occurrence of pain, not before (KISS, YAGNI).

### 3. Dependency Direction

```
Controllers ──> Services / Forms / Queries ──> Models ──> Database
     │                    │
     └──────> Jobs <──────┘
```

- Models never depend on controllers, request objects or sessions
- Use `Current` (`ActiveSupport::CurrentAttributes`) sparingly, mainly for the authenticated user and request metadata
- Views never query the database directly; load data in the controller or a query object

---

## Controllers

Controllers do four things: authenticate, authorize, delegate, respond.

```ruby
# frozen_string_literal: true

class ArticlesController < ApplicationController
  before_action :set_article, only: %i[show edit update destroy]

  def index
    @articles = Article.published.includes(:author).order(published_at: :desc)
  end

  def show; end

  def create
    @article = Current.user.articles.build(article_params)

    if @article.save
      redirect_to @article, notice: "Article created."
    else
      render :new, status: :unprocessable_entity
    end
  end

  def update
    if @article.update(article_params)
      redirect_to @article, notice: "Article updated."
    else
      render :edit, status: :unprocessable_entity
    end
  end

  def destroy
    @article.destroy!
    redirect_to articles_path, status: :see_other, notice: "Article deleted."
  end

  private

  def set_article
    @article = Current.user.articles.find(params.expect(:id))
  end

  def article_params
    params.expect(article: %i[title body published_at])
  end
end
```

Guidelines:
- RESTful actions only (`index show new create edit update destroy`); model other behaviour as a new resource (`resource :publication`) instead of custom actions
- Use `params.expect` (Rails 8) for strong parameters
- Return `status: :unprocessable_entity` on failed form render and `status: :see_other` after `destroy` so Turbo handles the response
- Fewer than 10 lines per action; delegate beyond that

### Controller concerns

```ruby
# frozen_string_literal: true

module Authentication
  extend ActiveSupport::Concern

  included do
    before_action :require_authentication
  end

  class_methods do
    def allow_unauthenticated_access(**options)
      skip_before_action :require_authentication, **options
    end
  end

  private

  def require_authentication
    resume_session || request_authentication
  end
end
```

Rails 8 ships an authentication generator (`bin/rails generate authentication`) that produces this structure (`Session` model, `Authentication` concern, `Current`, password reset). Prefer it over custom schemes for new applications.

---

## Models

Models own persistence, validations, associations and domain rules for a single aggregate of records.

```ruby
# frozen_string_literal: true

class Order < ApplicationRecord
  belongs_to :user
  has_many :line_items, dependent: :destroy
  has_many :products, through: :line_items

  enum :status, { pending: 0, paid: 1, shipped: 2, cancelled: 3 }, default: :pending

  validates :user, presence: true
  validates :total_cents, numericality: { greater_than_or_equal_to: 0 }

  scope :recent, -> { order(created_at: :desc) }
  scope :overdue, -> { pending.where(created_at: ...3.days.ago) }

  def pay!
    raise InvalidTransition, "order is #{status}" unless pending?

    update!(status: :paid, paid_at: Time.current)
  end

  class InvalidTransition < StandardError; end
end
```

Guidelines:
- Back every validation with a database constraint (`null: false`, unique index, foreign key)
- Prefer `enum` with explicit integer or string values over free-form status strings
- Prefer scopes and class methods returning relations; keep them chainable
- Use callbacks only for same-record concerns (normalisation, defaults, `after_create_commit` enqueueing a job). Never for e-mails, payments or cross-model writes
- Use `has_secure_password`, `generates_token_for` and `normalizes` for common needs

```ruby
class User < ApplicationRecord
  has_secure_password
  has_many :sessions, dependent: :destroy

  normalizes :email_address, with: ->(e) { e.strip.downcase }
  generates_token_for :password_reset, expires_in: 15.minutes do
    password_salt.last(10)
  end
end
```

### Concerns

Use concerns for **cohesive, nameable behaviour** (`Archivable`, `Searchable`), never as a junk drawer to shrink file size.

```ruby
# frozen_string_literal: true

module Archivable
  extend ActiveSupport::Concern

  included do
    scope :active, -> { where(archived_at: nil) }
    scope :archived, -> { where.not(archived_at: nil) }
  end

  def archive!
    update!(archived_at: Time.current)
  end

  def archived?
    archived_at.present?
  end
end
```

---

## Service Objects

A service object encapsulates one use case. One public method (`call`), explicit inputs, explicit result.

```ruby
# frozen_string_literal: true

module Orders
  class Checkout
    Result = Data.define(:success, :order, :error) do
      def success? = success
    end

    def self.call(...) = new(...).call

    def initialize(user:, cart:, payment_token:, gateway: Payments::Gateway.new)
      @user = user
      @cart = cart
      @payment_token = payment_token
      @gateway = gateway
    end

    def call
      order = build_order

      Order.transaction do
        order.save!
        @gateway.charge!(amount: order.total_cents, token: @payment_token)
        order.pay!
      end

      SendReceiptJob.perform_later(order.id)
      Result.new(success: true, order: order, error: nil)
    rescue ActiveRecord::RecordInvalid, Payments::Declined => e
      Result.new(success: false, order: order, error: e.message)
    end

    private

    def build_order
      @user.orders.build(line_items_attributes: @cart.line_item_attributes)
    end
  end
end
```

Guidelines:
- Name services after a business action (`Orders::Checkout`, `Subscriptions::Renew`), not after patterns (`OrderManager`)
- Inject collaborators (gateway, clock) through keyword arguments with sensible defaults, to ease testing
- Wrap multi-record writes in `transaction`
- Return a result object (`Data.define`) instead of raising for expected failures
- Do not create a service for a plain `save`

---

## Form Objects

Use `ActiveModel::Model` when a form spans several models or does not map to a table.

```ruby
# frozen_string_literal: true

class RegistrationForm
  include ActiveModel::Model
  include ActiveModel::Attributes

  attribute :email_address, :string
  attribute :password, :string
  attribute :company_name, :string

  validates :email_address, :password, :company_name, presence: true
  validates :password, length: { minimum: 12 }

  def save
    return false unless valid?

    ActiveRecord::Base.transaction do
      company = Company.create!(name: company_name)
      company.users.create!(email_address: email_address, password: password)
    end
    true
  rescue ActiveRecord::RecordInvalid => e
    errors.add(:base, e.message)
    false
  end
end
```

---

## Query Objects

Extract complex or reusable reads that do not fit a scope.

```ruby
# frozen_string_literal: true

class OverdueInvoicesQuery
  def initialize(relation = Invoice.all)
    @relation = relation
  end

  def call(as_of: Time.current)
    @relation
      .where(paid_at: nil)
      .where(due_on: ...as_of.to_date)
      .includes(:customer)
      .order(:due_on)
  end
end
```

Always return an `ActiveRecord::Relation` so callers can keep chaining, paginating and eager loading.

---

## Background Jobs (Active Job + Solid Queue)

Solid Queue is the Rails 8 default Active Job backend and is database-backed.

```ruby
# frozen_string_literal: true

class SendReceiptJob < ApplicationJob
  queue_as :default
  retry_on Net::OpenTimeout, wait: :polynomially_longer, attempts: 5
  discard_on ActiveJob::DeserializationError

  def perform(order_id)
    order = Order.find(order_id)
    return if order.receipt_sent_at?

    OrderMailer.receipt(order).deliver_now
    order.update!(receipt_sent_at: Time.current)
  end
end
```

Guidelines:
- Pass IDs (or GlobalID-serialisable records), never large payloads
- Make jobs **idempotent**: they can run twice
- Enqueue after commit (`after_create_commit`, or `perform_later` outside the transaction)
- Configure queues and recurring tasks in `config/queue.yml` and `config/recurring.yml`
- Rails 8.1 adds job continuations for long-running, resumable jobs; use them for batch work instead of one huge job

---

## Hotwire (Turbo and Stimulus)

Prefer server-rendered HTML with Turbo before writing custom JavaScript.

```erb
<%# app/views/articles/index.html.erb %>
<%= turbo_frame_tag "articles" do %>
  <%= render @articles %>
  <%= link_to "Next", articles_path(page: @next_page) %>
<% end %>
```

```ruby
# Broadcasting with Turbo Streams (Solid Cable in production)
class Message < ApplicationRecord
  belongs_to :room
  after_create_commit -> { broadcast_append_to room }
end
```

```javascript
// app/javascript/controllers/clipboard_controller.js
import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["source"]

  copy() {
    navigator.clipboard.writeText(this.sourceTarget.value)
  }
}
```

Guidelines:
- One Stimulus controller per concern, state in `data-*` attributes
- Pages must work without JavaScript where feasible (progressive enhancement)
- Frame and stream IDs derived with `dom_id`

---

## Active Record Practices

### Preventing N+1

```ruby
# BAD
Article.all.each { |a| puts a.author.name }

# GOOD
Article.includes(:author).find_each { |a| puts a.author.name }
```

Enable `config.active_record.strict_loading_by_default = true` in development to surface lazy loads, or add `bullet` in development/test.

### Migrations

```ruby
# frozen_string_literal: true

class CreateOrders < ActiveRecord::Migration[8.1]
  def change
    create_table :orders do |t|
      t.references :user, null: false, foreign_key: true
      t.integer :status, null: false, default: 0
      t.integer :total_cents, null: false, default: 0
      t.datetime :paid_at

      t.timestamps
    end

    add_index :orders, %i[user_id status]
  end
end
```

- Migrations must be reversible (`change`, or explicit `up`/`down`)
- Use `strong_migrations` to prevent unsafe operations on large tables
- Never edit a migration already merged to the main branch

### Transactions and Locking

```ruby
Account.transaction do
  from = Account.lock.find(from_id)
  to = Account.lock.find(to_id)
  from.withdraw!(amount)
  to.deposit!(amount)
end
```

---

## Caching (Solid Cache)

```ruby
<% cache article do %>
  <%= render article %>
<% end %>
```

```ruby
Rails.cache.fetch(["stats", Date.current], expires_in: 1.hour) do
  Stats::Compute.call
end
```

Solid Cache stores entries in the database and is the Rails 8 production default. Use key-based expiration (`cache_key_with_version`) rather than manual invalidation.

---

## Autoloading (Zeitwerk)

- File path must match the constant: `app/services/orders/checkout.rb` defines `Orders::Checkout`
- No `require` for application code
- Verify with `docker compose exec app bin/rails zeitwerk:check`
- Directories under `app/` are autoload roots automatically (`services`, `forms`, `queries` need no configuration)

---

## API Applications

For JSON APIs, keep the same structure:

```ruby
# frozen_string_literal: true

module Api
  module V1
    class OrdersController < ApplicationController
      def show
        order = Current.user.orders.find(params.expect(:id))
        render json: OrderSerializer.new(order).as_json
      end
    end
  end
end
```

- Version via namespace (`/api/v1`)
- Use a serializer or `jbuilder`, never `render json: record` on a model exposing internal columns
- Return RFC 9457 problem details for errors
- Document with OpenAPI 3.x

---

## Deployment Architecture

Rails 8 defaults to Kamal 2 with Thruster in front of Puma, and a single container image.

```
Browser ──> Thruster (HTTP/2, caching, compression) ──> Puma ──> Rails
                                                          └──> Solid Queue / Cache / Cable (database)
```

- One `Dockerfile` generated by Rails; pin the Ruby version
- Config through environment variables and encrypted credentials
- `config/deploy.yml` for Kamal; secrets in `.kamal/secrets`, never committed in clear text

---

## Architecture Checklist

- [ ] Controllers are thin and RESTful
- [ ] Models back validations with database constraints
- [ ] No side-effect callbacks (mail, payment, cross-model writes)
- [ ] Service/form/query objects exist only where justified
- [ ] N+1 queries prevented (`includes`, `strict_loading`)
- [ ] Jobs are idempotent and enqueued after commit
- [ ] `bin/rails zeitwerk:check` passes
- [ ] Hotwire preferred over custom JavaScript
- [ ] Rails 8 defaults (Solid Queue/Cache/Cable, Propshaft, importmap) kept unless justified
