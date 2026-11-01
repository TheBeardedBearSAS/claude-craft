# Ruby-Coding-Standards

## Überblick

Standards für Ruby-4.0-Code in Rails-8.1-Anwendungen. Der Community-Ruby-Style-Guide und RuboCop sind maßgeblich; dieses Dokument fasst die Projektregeln und deren Begründung zusammen.

## Verpflichtender Dateikopf

```ruby
# frozen_string_literal: true
```

Jede Ruby-Datei beginnt mit diesem Magic Comment (durchgesetzt von `Style/FrozenStringLiteralComment`). Strings sind dadurch standardmäßig unveränderlich, was versehentliche Mutation verhindert und Allokationen reduziert. Für einen veränderlichen Puffer `+""` oder `String.new` verwenden.

---

## Namenskonventionen

| Element | Konvention | Beispiel |
|---------|------------|----------|
| Dateien | `snake_case.rb`, entspricht der Konstante | `order_item.rb` -> `OrderItem` |
| Klassen, Module | `PascalCase` | `OrderItem`, `Payments::Gateway` |
| Methoden, Variablen | `snake_case` | `calculate_total`, `line_items` |
| Konstanten | `SCREAMING_SNAKE_CASE` | `MAX_RETRIES` |
| Prädikate | Enden auf `?`, liefern Boolean | `paid?`, `empty?` |
| Gefährliche Methoden | Enden auf `!`, eine sichere Entsprechung muss existieren | `save!`, `archive!` |
| Setter | `name=` | `def status=(value)` |
| Ungenutzte Variablen | Mit `_` präfixen | `_index` |
| Booleans | Nicht mit `is_` präfixen | `active?` nicht `is_active?` |

```ruby
# SCHLECHT
class order_item
  def getTotal; end
  def is_paid; end
end

# GUT
class OrderItem
  def total; end
  def paid?; end
end
```

Präfixe `get_`/`set_` vermeiden: Ruby verwendet schlichte Reader und `name=`-Writer.

---

## Formatierung

| Regel | Wert |
|-------|------|
| Einrückung | 2 Leerzeichen, keine Tabs |
| Zeilenlänge | maximal 120 Zeichen |
| Nachgestellte Leerzeichen | Keine |
| Abschließender Zeilenumbruch | Erforderlich |
| Anführungszeichen | Standardmäßig doppelte (rubocop-rails-omakase) |
| Hash-Syntax | `{ key: value }` mit Leerzeichen innerhalb der Klammern |
| Klammern bei Methodenaufrufen | Bei DSL-Aufrufen weglassen (`validates`, `has_many`, `puts`); bei anderen verwenden |
| Nachgestellte Kommas | In mehrzeiligen Literalen erlaubt |

```ruby
# GUT
user = User.create!(
  name: "Alice",
  email_address: "alice@example.com",
  role: :admin,
)
```

`docker compose exec app bin/rubocop -a` ausführen, um sichere Verstöße automatisch zu korrigieren.

---

## Methoden

### Größe und Komplexität (KISS)

| Metrik | Ziel | Limit |
|--------|------|-------|
| Zeilen pro Methode | < 10 | < 20 |
| Parameter | 3 | maximal 4 (Keyword-Argumente verwenden) |
| Kognitive Komplexität | < 7 | < 10 |
| Verschachtelungstiefe | 2 | maximal 3 |

### Guard Clauses

```ruby
# SCHLECHT: verschachtelte Bedingungen
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

# GUT: Guard Clauses
def discount(user)
  return 0 if user.nil?
  return 0 unless user.premium?

  0.2
end
```

### Keyword-Argumente

```ruby
# SCHLECHT: positionale Booleans
send_invoice(order, true, false)

# GUT: Keyword-Argumente
send_invoice(order, notify_customer: true, attach_pdf: false)
```

### Endless Methods

Nur für Reader mit einem einzigen Ausdruck verwenden:

```ruby
def full_name = "#{first_name} #{last_name}"
```

### Argument-Weiterleitung

```ruby
def self.call(...) = new(...).call
```

### Impliziter Block und It

Ab Ruby 3.4 steht `it` als impliziter Blockparameter für Blöcke mit einem Argument zur Verfügung:

```ruby
users.map { it.name }
users.map(&:name)  # weiterhin bevorzugt, wenn eine Methodenreferenz genügt
```

---

## Bedingungen

```ruby
# Modifier für einzeilige Rümpfe bevorzugen
return if order.nil?

# unless nur für einfache Negationen bevorzugen, niemals mit else
send_reminder unless user.opted_out?

# SCHLECHT
unless user.active?
  deactivate
else
  activate
end

# GUT
if user.active?
  activate
else
  deactivate
end
```

- Niemals `and`/`or` für den Kontrollfluss verwenden; `&&`/`||` nutzen
- Den ternären Operator bei verschachtelten Ausdrücken vermeiden
- `case` mit `then` für flache Zuordnungen verwenden

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

Pattern Matching für strukturierte Daten verwenden (geparstes JSON, `Data`-Objekte). Nicht dort einsetzen, wo `if` genügt.

---

## Collections und Enumerable

```ruby
# SCHLECHT
total = 0
items.each { |i| total += i.price }

# GUT
total = items.sum(&:price)

# Bevorzugen
items.select(&:available?).map(&:name)
items.filter_map { |i| i.name if i.available? }
items.each_with_object({}) { |i, h| h[i.id] = i }
items.group_by(&:category)
items.partition(&:available?)
```

- Bei großen Active-Record-Relationen `find_each` / `in_batches` gegenüber `each` bevorzugen
- Bei Relationen `pluck`/`ids` gegenüber `map(&:id)` bevorzugen
- `exists?` gegenüber `count > 0` bevorzugen; `any?` bei geladenen Collections
- Das Mutieren von Argumenten vermeiden

---

## Strings und Symbole

```ruby
# Interpolation statt Konkatenation
"Hello, #{user.name}"

# Heredocs mit Squiggly-Einrückung
message = <<~TEXT
  Dear #{user.name},
  Your order #{order.id} shipped.
TEXT

# Symbole für Bezeichner, Strings für Daten
status = :pending
```

---

## Klassen und Module

### Value Objects mit Data

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

`Data.define` erzeugt unveränderliche Value Objects mit Keyword-Konstruktion. Bei neuem Code gegenüber `Struct` bevorzugen.

### Sichtbarkeit

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

- Öffentliche API zuerst, `private`-Bereich zuletzt
- `private` für Helfer verwenden; `protected` nur beim Vergleich von Instanzen
- Komposition und Module gegenüber tiefer Vererbung bevorzugen (maximal 2 Ebenen jenseits von `ApplicationRecord`/`ApplicationController`)

### Modul-Namespacing

```ruby
# SCHLECHT: der kompakte Stil verbirgt fehlende übergeordnete Module
class Orders::Checkout; end

# GUT: verschachtelter Stil, Konstanten werden vorhersehbar aufgelöst
module Orders
  class Checkout; end
end
```

Zeitwerk akzeptiert beides; der verschachtelte Stil ist die Projektkonvention.

---

## Fehlerbehandlung

```ruby
# SCHLECHT
begin
  charge(order)
rescue Exception
  nil
end

# SCHLECHT: stilles Rescue
rescue => e
end

# GUT: spezifisches Rescue, Kontext, erneutes Auslösen oder behandeltes Ergebnis
begin
  gateway.charge!(order)
rescue Payments::Declined => e
  Rails.logger.warn("payment declined order=#{order.id} reason=#{e.message}")
  Result.failure(e.message)
end
```

Regeln:
- Niemals `rescue Exception`
- Domänenfehler unter einem Modul-Namespace definieren, der von `StandardError` erbt
- `raise` für Ausnahmesituationen verwenden, Rückgabewerte für erwartete Fehlschläge
- In Controllern Exceptions mit `rescue_from` abbilden
- `ensure` für Aufräumarbeiten verwenden; Blockformen bevorzugen (`File.open`, `transaction`)

```ruby
module Payments
  class Error < StandardError; end
  class Declined < Error; end
end
```

---

## Rails-spezifische Standards

### Strong Parameters

```ruby
def article_params
  params.expect(article: %i[title body])
end
```

`params.expect` (Rails 8) ist strikter als `require(...).permit(...)` und antwortet bei fehlerhaften Payloads mit 400.

### Query Interface

```ruby
# SCHLECHT
User.where("age > #{age}")
User.all.select { |u| u.active? }

# GUT
User.where(age: age..)
User.where(active: true)
```

### Zeit

```ruby
Time.current        # nicht Time.now
Date.current        # nicht Date.today
3.days.ago
Time.zone.parse("2026-11-01 10:00")
```

### Logging

```ruby
Rails.logger.info("order placed order_id=#{order.id}")
```

Niemals Secrets, Tokens oder personenbezogene Daten loggen. Rails 8.1 bietet strukturierte Events (`Rails.event.notify("order.placed", order_id: order.id)`) für maschinenlesbare Logs.

### Konfiguration

```ruby
Rails.application.credentials.dig(:stripe, :secret_key)
ENV.fetch("REDIS_URL")           # schlägt sofort fehl, wenn nicht vorhanden
```

Für erforderliche Werte `ENV.fetch` statt `ENV[]` verwenden.

---

## Kommentare und Dokumentation

- Das **Warum** kommentieren, nicht das Was
- Aussagekräftige Namen gegenüber Kommentaren bevorzugen
- Öffentliche Service- und Bibliotheks-APIs: Kommentare im YARD-Stil

```ruby
# Belastet die Zahlungsmethode der Bestellung.
#
# @param order [Order] eine ausstehende Bestellung
# @return [Result]
# @raise [Payments::Declined] wenn die Karte abgelehnt wird
def charge!(order)
end
```

- `TODO`/`FIXME` erfordern einen Ticket-Bezug
- Auskommentierten Code entfernen

---

## Optionale statische Typisierung

RBS mit Steep oder Sorbet ist optional.

```ruby
# sig/orders/checkout.rbs
module Orders
  class Checkout
    def self.call: (user: User, cart: Cart, payment_token: String) -> Result
    def call: () -> Result
  end
end
```

Bei Einführung: zuerst öffentliche Service-APIs typisieren, `steep check` oder `srb tc` in der CI ausführen, `untyped` nicht ohne Kommentar verwenden.

---

## Anti-Patterns

| Anti-Pattern | Korrektur |
|--------------|-----------|
| Monkey-Patching von Kernklassen | Refinements oder Helfer-Module |
| `rescue Exception` | Spezifische Fehler abfangen |
| `send` / `constantize` / `eval` auf Benutzereingaben | Allow-List |
| Globaler veränderlicher Zustand (`$var`, Klassenvariablen) | Dependency Injection, `Current` |
| Lange Parameterlisten | Keyword-Argumente oder ein Parameterobjekt |
| God Model > 300 Zeilen | Concerns für zusammenhängendes Verhalten, Service Objects für Workflows |
| Callbacks, die andere Systeme erreichen | Service Object oder Job |
| `default_scope` | Explizite Scopes |
| `update_attribute`, beiläufiges Überspringen von Validierungen | `update!` |
| Verfrühte Abstraktion | Auf das dritte Auftreten warten |

---

## Schnell-Checkliste

- [ ] `# frozen_string_literal: true` vorhanden
- [ ] `snake_case`-Namen, Semantik der Suffixe `?`/`!` eingehalten
- [ ] Methoden < 10 Zeilen (Limit 20), Guard Clauses
- [ ] Keyword-Argumente bei 3+ Parametern oder Booleans
- [ ] Kein `rescue Exception`, kein stilles Rescue
- [ ] `params.expect` für Strong Parameters
- [ ] `Time.current` statt `Time.now`
- [ ] `bin/rubocop` sauber
