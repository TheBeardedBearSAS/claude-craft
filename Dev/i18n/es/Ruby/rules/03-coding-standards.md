# Estándares de código Ruby

## Visión general

Estándares para código Ruby 4.0 en aplicaciones Rails 8.1. La Ruby Style Guide de la comunidad y RuboCop son la autoridad; este documento resume las reglas del proyecto y su justificación.

## Encabezado obligatorio de archivo

```ruby
# frozen_string_literal: true
```

Todo archivo Ruby empieza con este comentario mágico (impuesto por `Style/FrozenStringLiteralComment`). Los strings pasan a ser inmutables por defecto, lo que evita mutaciones accidentales y reduce las asignaciones de memoria. Usa `+""` o `String.new` para un búfer mutable.

---

## Convenciones de nomenclatura

| Elemento | Convención | Ejemplo |
|----------|------------|---------|
| Archivos | `snake_case.rb`, coincidente con la constante | `order_item.rb` -> `OrderItem` |
| Clases, módulos | `PascalCase` | `OrderItem`, `Payments::Gateway` |
| Métodos, variables | `snake_case` | `calculate_total`, `line_items` |
| Constantes | `SCREAMING_SNAKE_CASE` | `MAX_RETRIES` |
| Predicados | Terminan en `?`, devuelven un booleano | `paid?`, `empty?` |
| Métodos peligrosos | Terminan en `!`, debe existir una contraparte segura | `save!`, `archive!` |
| Setters | `name=` | `def status=(value)` |
| Variables sin usar | Prefijo `_` | `_index` |
| Booleanos | No llevan prefijo `is_` | `active?` y no `is_active?` |

```ruby
# MAL
class order_item
  def getTotal; end
  def is_paid; end
end

# BIEN
class OrderItem
  def total; end
  def paid?; end
end
```

Evita los prefijos `get_`/`set_`: Ruby usa lectores simples y escritores `name=`.

---

## Formato

| Regla | Valor |
|-------|-------|
| Indentación | 2 espacios, sin tabulaciones |
| Longitud de línea | 120 caracteres como máximo |
| Espacios finales | Ninguno |
| Salto de línea final | Obligatorio |
| Comillas | Dobles por defecto (rubocop-rails-omakase) |
| Sintaxis de hash | `{ key: value }` con espacios dentro de las llaves |
| Paréntesis en llamadas a métodos | Omitir en llamadas DSL (`validates`, `has_many`, `puts`); usarlos en las demás |
| Comas finales | Permitidas en literales multilínea |

```ruby
# BIEN
user = User.create!(
  name: "Alice",
  email_address: "alice@example.com",
  role: :admin,
)
```

Ejecuta `docker compose exec app bin/rubocop -a` para autocorregir las infracciones seguras.

---

## Métodos

### Tamaño y complejidad (KISS)

| Métrica | Objetivo | Límite |
|---------|----------|--------|
| Líneas por método | < 10 | < 20 |
| Parámetros | 3 | 4 como máximo (usar argumentos con nombre) |
| Complejidad cognitiva | < 7 | < 10 |
| Profundidad de anidamiento | 2 | 3 como máximo |

### Guard clauses

```ruby
# MAL: condicionales anidados
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

# BIEN: guard clauses
def discount(user)
  return 0 if user.nil?
  return 0 unless user.premium?

  0.2
end
```

### Argumentos con nombre (keyword arguments)

```ruby
# MAL: booleanos posicionales
send_invoice(order, true, false)

# BIEN: argumentos con nombre
send_invoice(order, notify_customer: true, attach_pdf: false)
```

### Métodos endless

Úsalos solo para lectores de una única expresión:

```ruby
def full_name = "#{first_name} #{last_name}"
```

### Reenvío de argumentos

```ruby
def self.call(...) = new(...).call
```

### Bloque implícito e `it`

Ruby 3.4+ ofrece `it` como parámetro implícito de bloque para bloques de un argumento:

```ruby
users.map { it.name }
users.map(&:name)  # sigue siendo preferible cuando basta una referencia a método
```

---

## Condicionales

```ruby
# Preferir los modificadores para cuerpos de una línea
return if order.nil?

# Preferir unless solo para negativos simples, nunca con else
send_reminder unless user.opted_out?

# MAL
unless user.active?
  deactivate
else
  activate
end

# BIEN
if user.active?
  activate
else
  deactivate
end
```

- Nunca uses `and`/`or` para el flujo de control; usa `&&`/`||`
- Evita el ternario en expresiones anidadas
- Usa `case` con `then` para mapeos planos

### Pattern matching

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

Usa el pattern matching para datos estructurados (JSON parseado, objetos `Data`). No lo uses donde baste un `if`.

---

## Colecciones y Enumerable

```ruby
# MAL
total = 0
items.each { |i| total += i.price }

# BIEN
total = items.sum(&:price)

# Preferir
items.select(&:available?).map(&:name)
items.filter_map { |i| i.name if i.available? }
items.each_with_object({}) { |i, h| h[i.id] = i }
items.group_by(&:category)
items.partition(&:available?)
```

- Prefiere `find_each` / `in_batches` a `each` en relations grandes de Active Record
- Prefiere `pluck`/`ids` a `map(&:id)` en relations
- Prefiere `exists?` a `count > 0`; `any?` en colecciones ya cargadas
- Evita mutar los argumentos

---

## Strings y símbolos

```ruby
# Interpolación en lugar de concatenación
"Hello, #{user.name}"

# Heredocs con indentación squiggly
message = <<~TEXT
  Dear #{user.name},
  Your order #{order.id} shipped.
TEXT

# Símbolos para identificadores, strings para datos
status = :pending
```

---

## Clases y módulos

### Value objects con Data

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

`Data.define` produce value objects inmutables con construcción mediante argumentos con nombre. Prefiérelo a `Struct` en código nuevo.

### Visibilidad

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

- Primero la API pública, la sección `private` al final
- Usa `private` para los helpers; evita `protected` salvo para comparar instancias
- Prefiere la composición y los módulos a la herencia profunda (máximo 2 niveles más allá de `ApplicationRecord`/`ApplicationController`)

### Namespacing de módulos

```ruby
# MAL: el estilo compacto oculta padres ausentes
class Orders::Checkout; end

# BIEN: estilo anidado, las constantes se resuelven de forma predecible
module Orders
  class Checkout; end
end
```

Zeitwerk acepta ambos; el estilo anidado es la convención del proyecto.

---

## Manejo de errores

```ruby
# MAL
begin
  charge(order)
rescue Exception
  nil
end

# MAL: rescue silencioso
rescue => e
end

# BIEN: rescue específico, contexto, relanzar o resultado gestionado
begin
  gateway.charge!(order)
rescue Payments::Declined => e
  Rails.logger.warn("payment declined order=#{order.id} reason=#{e.message}")
  Result.failure(e.message)
end
```

Reglas:
- Nunca `rescue Exception`
- Define los errores de dominio bajo un namespace de módulo que herede de `StandardError`
- Usa `raise` para condiciones excepcionales, valores de retorno para los fallos esperados
- En los controladores, mapea las excepciones con `rescue_from`
- Usa `ensure` para la limpieza; prefiere las formas con bloque (`File.open`, `transaction`)

```ruby
module Payments
  class Error < StandardError; end
  class Declined < Error; end
end
```

---

## Estándares específicos de Rails

### Strong parameters

```ruby
def article_params
  params.expect(article: %i[title body])
end
```

`params.expect` (Rails 8) es más estricto que `require(...).permit(...)` y responde 400 ante payloads mal formados.

### Query interface

```ruby
# MAL
User.where("age > #{age}")
User.all.select { |u| u.active? }

# BIEN
User.where(age: age..)
User.where(active: true)
```

### Tiempo

```ruby
Time.current        # no Time.now
Date.current        # no Date.today
3.days.ago
Time.zone.parse("2026-11-01 10:00")
```

### Logging

```ruby
Rails.logger.info("order placed order_id=#{order.id}")
```

Nunca registres secretos, tokens ni datos personales. Rails 8.1 ofrece eventos estructurados (`Rails.event.notify("order.placed", order_id: order.id)`) para logs legibles por máquinas.

### Configuración

```ruby
Rails.application.credentials.dig(:stripe, :secret_key)
ENV.fetch("REDIS_URL")           # falla de inmediato si falta
```

Usa `ENV.fetch` en lugar de `ENV[]` para los valores obligatorios.

---

## Comentarios y documentación

- Comenta el **porqué**, no el qué
- Prefiere nombres claros a los comentarios
- APIs públicas de servicios y de librerías: comentarios en estilo YARD

```ruby
# Cobra el método de pago del pedido.
#
# @param order [Order] un pedido pendiente
# @return [Result]
# @raise [Payments::Declined] cuando la tarjeta es rechazada
def charge!(order)
end
```

- `TODO`/`FIXME` requieren una referencia a un ticket
- Elimina el código comentado

---

## Tipado estático opcional

RBS con Steep o Sorbet es opcional.

```ruby
# sig/orders/checkout.rbs
module Orders
  class Checkout
    def self.call: (user: User, cart: Cart, payment_token: String) -> Result
    def call: () -> Result
  end
end
```

Si se adopta: tipar primero las APIs públicas de los servicios, ejecutar `steep check` o `srb tc` en CI, evitar `untyped` sin un comentario.

---

## Antipatrones

| Antipatrón | Corrección |
|------------|------------|
| Monkey-patching de clases del núcleo | Refinements o módulos helper |
| `rescue Exception` | Rescatar errores específicos |
| `send` / `constantize` / `eval` sobre entradas del usuario | Lista blanca |
| Estado global mutable (`$var`, variables de clase) | Inyección de dependencias, `Current` |
| Listas largas de parámetros | Argumentos con nombre o un objeto de parámetros |
| Modelo dios > 300 líneas | Concerns para comportamiento cohesivo, service objects para workflows |
| Callbacks que alcanzan otros sistemas | Service object o job |
| `default_scope` | Scopes explícitos |
| `update_attribute`, saltarse las validaciones a la ligera | `update!` |
| Abstracción prematura | Esperar a la tercera aparición |

---

## Checklist rápida

- [ ] `# frozen_string_literal: true` presente
- [ ] Nombres en `snake_case`, semántica de los sufijos `?`/`!` respetada
- [ ] Métodos < 10 líneas (límite 20), guard clauses
- [ ] Argumentos con nombre para 3+ parámetros o booleanos
- [ ] Sin `rescue Exception`, sin rescue silencioso
- [ ] `params.expect` para los strong parameters
- [ ] `Time.current` en lugar de `Time.now`
- [ ] `bin/rubocop` limpio
