# Ruby Coding Standards

## Overview

Standards for Ruby 4.0 code in Rails 8.1 applications. The community Ruby Style Guide and RuboCop are the authority; this document summarises the project rules and the reasoning behind them.

## Mandatory File Header

```ruby
# frozen_string_literal: true
```

Every Ruby file starts with this magic comment (enforced by `Style/FrozenStringLiteralComment`). Strings become immutable by default, which prevents accidental mutation and reduces allocations. Use `+""` or `String.new` for a mutable buffer.

---

## Naming Conventions

| Element | Convention | Example |
|---------|------------|---------|
| Files | `snake_case.rb`, matching the constant | `order_item.rb` -> `OrderItem` |
| Classes, modules | `PascalCase` | `OrderItem`, `Payments::Gateway` |
| Methods, variables | `snake_case` | `calculate_total`, `line_items` |
| Constants | `SCREAMING_SNAKE_CASE` | `MAX_RETRIES` |
| Predicates | End with `?`, return boolean | `paid?`, `empty?` |
| Dangerous methods | End with `!`, a safe counterpart must exist | `save!`, `archive!` |
| Setters | `name=` | `def status=(value)` |
| Unused variables | Prefix with `_` | `_index` |
| Booleans | Do not prefix with `is_` | `active?` not `is_active?` |

```ruby
# BAD
class order_item
  def getTotal; end
  def is_paid; end
end

# GOOD
class OrderItem
  def total; end
  def paid?; end
end
```

Avoid `get_`/`set_` prefixes: Ruby uses plain readers and `name=` writers.

---

## Formatting

| Rule | Value |
|------|-------|
| Indentation | 2 spaces, no tabs |
| Line length | 120 characters maximum |
| Trailing whitespace | None |
| Final newline | Required |
| Quotes | Double quotes by default (rubocop-rails-omakase) |
| Hash syntax | `{ key: value }` with spaces inside braces |
| Method call parentheses | Omit for DSL calls (`validates`, `has_many`, `puts`); use for others |
| Trailing commas | Allowed in multi-line literals |

```ruby
# GOOD
user = User.create!(
  name: "Alice",
  email_address: "alice@example.com",
  role: :admin,
)
```

Run `docker compose exec app bin/rubocop -a` to auto-correct safe offenses.

---

## Methods

### Size and Complexity (KISS)

| Metric | Target | Limit |
|--------|--------|-------|
| Lines per method | < 10 | < 20 |
| Parameters | 3 | 4 maximum (use keyword arguments) |
| Cognitive complexity | < 7 | < 10 |
| Nesting depth | 2 | 3 maximum |

### Guard Clauses

```ruby
# BAD: nested conditionals
def discount(user)
  if user
    if user.premium?
      0.2
    else
      0
    end
  else
    0
  end
end

# GOOD: guard clauses
def discount(user)
  return 0 if user.nil?
  return 0 unless user.premium?

  0.2
end
```

### Keyword Arguments

```ruby
# BAD: positional booleans
send_invoice(order, true, false)

# GOOD: keyword arguments
send_invoice(order, notify_customer: true, attach_pdf: false)
```

### Endless Methods

Use only for single-expression readers:

```ruby
def full_name = "#{first_name} #{last_name}"
```

### Argument Forwarding

```ruby
def self.call(...) = new(...).call
```

### Implicit Block and It

Ruby 3.4+ provides `it` as the implicit block parameter for one-argument blocks:

```ruby
users.map { it.name }
users.map(&:name)  # still preferred when a method reference suffices
```

---

## Conditionals

```ruby
# Prefer modifiers for one-line bodies
return if order.nil?

# Prefer unless only for simple negatives, never with else
send_reminder unless user.opted_out?

# BAD
unless user.active?
  deactivate
else
  activate
end

# GOOD
if user.active?
  activate
else
  deactivate
end
```

- Never use `and`/`or` for control flow; use `&&`/`||`
- Avoid the ternary for nested expressions
- Use `case` with `then` for flat mappings

### Pattern Matching

```ruby
case response
in { status: 200, body: { data: [first, *] } }
  handle(first)
in { status: 404 }
  nil
in { status: 500.. => code }
  raise ServerError, code
end
```

Use pattern matching for structured data (parsed JSON, `Data` objects). Do not use it where `if` suffices.

---

## Collections and Enumerable

```ruby
# BAD
total = 0
items.each { |i| total += i.price }

# GOOD
total = items.sum(&:price)

# Prefer
items.select(&:available?).map(&:name)
items.filter_map { |i| i.name if i.available? }
items.each_with_object({}) { |i, h| h[i.id] = i }
items.group_by(&:category)
items.partition(&:available?)
```

- Prefer `find_each` / `in_batches` over `each` on large Active Record relations
- Prefer `pluck`/`ids` over `map(&:id)` on relations
- Prefer `exists?` over `count > 0`; `any?` on loaded collections
- Avoid mutating arguments

---

## Strings and Symbols

```ruby
# Interpolation over concatenation
"Hello, #{user.name}"

# Heredocs with squiggly indentation
message = <<~TEXT
  Dear #{user.name},
  Your order #{order.id} shipped.
TEXT

# Symbols for identifiers, strings for data
status = :pending
```

---

## Classes and Modules

### Value Objects with Data

```ruby
# frozen_string_literal: true

Money = Data.define(:cents, :currency) do
  def initialize(cents:, currency: "EUR")
    raise ArgumentError, "cents must be an Integer" unless cents.is_a?(Integer)

    super
  end

  def +(other)
    raise ArgumentError, "currency mismatch" unless currency == other.currency

    with(cents: cents + other.cents)
  end

  def to_s = format("%.2f %s", cents / 100.0, currency)
end
```

`Data.define` produces immutable value objects with keyword construction. Prefer it to `Struct` for new code.

### Visibility

```ruby
class ReportBuilder
  def call
    header + body
  end

  private

  def header = "..."
  def body = "..."
end
```

- Public API first, `private` section last
- Use `private` for helpers; avoid `protected` unless comparing instances
- Prefer composition and modules over deep inheritance (maximum 2 levels beyond `ApplicationRecord`/`ApplicationController`)

### Module Namespacing

```ruby
# BAD: compact style hides missing parents
class Orders::Checkout; end

# GOOD: nested style, constants resolve predictably
module Orders
  class Checkout; end
end
```

Zeitwerk accepts both; the nested style is the project convention.

---

## Error Handling

```ruby
# BAD
begin
  charge(order)
rescue Exception
  nil
end

# BAD: silent rescue
rescue => e
end

# GOOD: specific rescue, context, re-raise or handled result
begin
  gateway.charge!(order)
rescue Payments::Declined => e
  Rails.logger.warn("payment declined order=#{order.id} reason=#{e.message}")
  Result.failure(e.message)
end
```

Rules:
- Never `rescue Exception`
- Define domain errors under a module namespace inheriting `StandardError`
- Use `raise` for exceptional conditions, return values for expected failures
- In controllers, map exceptions with `rescue_from`
- Use `ensure` for cleanup; prefer block forms (`File.open`, `transaction`)

```ruby
module Payments
  class Error < StandardError; end
  class Declined < Error; end
end
```

---

## Rails-Specific Standards

### Strong Parameters

```ruby
def article_params
  params.expect(article: %i[title body])
end
```

`params.expect` (Rails 8) is stricter than `require(...).permit(...)` and answers 400 on malformed payloads.

### Query Interface

```ruby
# BAD
User.where("age > #{age}")
User.all.select { |u| u.active? }

# GOOD
User.where(age: age..)
User.where(active: true)
```

### Time

```ruby
Time.current        # not Time.now
Date.current        # not Date.today
3.days.ago
Time.zone.parse("2026-11-01 10:00")
```

### Logging

```ruby
Rails.logger.info("order placed order_id=#{order.id}")
```

Never log secrets, tokens or personal data. Rails 8.1 offers structured events (`Rails.event.notify("order.placed", order_id: order.id)`) for machine-readable logs.

### Configuration

```ruby
Rails.application.credentials.dig(:stripe, :secret_key)
ENV.fetch("REDIS_URL")           # fails fast when missing
```

Use `ENV.fetch` rather than `ENV[]` for required values.

---

## Comments and Documentation

- Comment the **why**, not the what
- Prefer clear names over comments
- Public service and library APIs: YARD-style comments

```ruby
# Charges the order's payment method.
#
# @param order [Order] a pending order
# @return [Result]
# @raise [Payments::Declined] when the card is refused
def charge!(order)
end
```

- `TODO`/`FIXME` require a ticket reference
- Remove commented-out code

---

## Optional Static Typing

RBS with Steep or Sorbet is optional.

```ruby
# sig/orders/checkout.rbs
module Orders
  class Checkout
    def self.call: (user: User, cart: Cart, payment_token: String) -> Result
    def call: () -> Result
  end
end
```

If adopted: type public service APIs first, run `steep check` or `srb tc` in CI, avoid `untyped` without a comment.

---

## Anti-Patterns

| Anti-pattern | Fix |
|--------------|-----|
| Monkey-patching core classes | Refinements or helper modules |
| `rescue Exception` | Rescue specific errors |
| `send` / `constantize` / `eval` on user input | Allow-list |
| Global mutable state (`$var`, class variables) | Dependency injection, `Current` |
| Long parameter lists | Keyword arguments or a parameter object |
| God model > 300 lines | Concerns for cohesive behaviour, service objects for workflows |
| Callbacks reaching other systems | Service object or job |
| `default_scope` | Explicit scopes |
| `update_attribute`, skipping validations casually | `update!` |
| Premature abstraction | Wait for the third occurrence |

---

## Quick Checklist

- [ ] `# frozen_string_literal: true` present
- [ ] `snake_case` names, `?`/`!` suffix semantics respected
- [ ] Methods < 10 lines (limit 20), guard clauses
- [ ] Keyword arguments for 3+ parameters or booleans
- [ ] No `rescue Exception`, no silent rescue
- [ ] `params.expect` for strong parameters
- [ ] `Time.current` instead of `Time.now`
- [ ] `bin/rubocop` clean
