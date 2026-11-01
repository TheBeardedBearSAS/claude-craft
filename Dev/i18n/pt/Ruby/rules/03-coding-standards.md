# Padrões de Código Ruby

## Visão Geral

Padrões para código Ruby 4.0 em aplicações Rails 8.1. O Ruby Style Guide da comunidade e o RuboCop são a autoridade; este documento resume as regras do projeto e o raciocínio por trás delas.

## Cabeçalho de Arquivo Obrigatório

```ruby
# frozen_string_literal: true
```

Todo arquivo Ruby começa com este comentário mágico (imposto por `Style/FrozenStringLiteralComment`). As strings se tornam imutáveis por padrão, o que evita mutações acidentais e reduz alocações. Use `+""` ou `String.new` para um buffer mutável.

---

## Convenções de Nomenclatura

| Elemento | Convenção | Exemplo |
|----------|-----------|---------|
| Arquivos | `snake_case.rb`, correspondendo à constante | `order_item.rb` -> `OrderItem` |
| Classes, módulos | `PascalCase` | `OrderItem`, `Payments::Gateway` |
| Métodos, variáveis | `snake_case` | `calculate_total`, `line_items` |
| Constantes | `SCREAMING_SNAKE_CASE` | `MAX_RETRIES` |
| Predicados | Terminam com `?`, retornam booleano | `paid?`, `empty?` |
| Métodos perigosos | Terminam com `!`, deve existir um equivalente seguro | `save!`, `archive!` |
| Setters | `name=` | `def status=(value)` |
| Variáveis não utilizadas | Prefixar com `_` | `_index` |
| Booleanos | Não prefixar com `is_` | `active?` e não `is_active?` |

```ruby
# RUIM
class order_item
  def getTotal; end
  def is_paid; end
end

# BOM
class OrderItem
  def total; end
  def paid?; end
end
```

Evite os prefixos `get_`/`set_`: o Ruby usa readers simples e writers `name=`.

---

## Formatação

| Regra | Valor |
|-------|-------|
| Indentação | 2 espaços, sem tabs |
| Comprimento de linha | 120 caracteres no máximo |
| Espaços no fim da linha | Nenhum |
| Quebra de linha final | Obrigatória |
| Aspas | Aspas duplas por padrão (rubocop-rails-omakase) |
| Sintaxe de hash | `{ key: value }` com espaços dentro das chaves |
| Parênteses em chamadas de método | Omitir em chamadas de DSL (`validates`, `has_many`, `puts`); usar nas demais |
| Vírgulas finais | Permitidas em literais multilinha |

```ruby
# BOM
user = User.create!(
  name: "Alice",
  email_address: "alice@example.com",
  role: :admin,
)
```

Execute `docker compose exec app bin/rubocop -a` para corrigir automaticamente as ofensas seguras.

---

## Métodos

### Tamanho e Complexidade (KISS)

| Métrica | Meta | Limite |
|---------|------|--------|
| Linhas por método | < 10 | < 20 |
| Parâmetros | 3 | 4 no máximo (use keyword arguments) |
| Complexidade cognitiva | < 7 | < 10 |
| Profundidade de aninhamento | 2 | 3 no máximo |

### Guard Clauses

```ruby
# RUIM: condicionais aninhadas
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

# BOM: guard clauses
def discount(user)
  return 0 if user.nil?
  return 0 unless user.premium?

  0.2
end
```

### Keyword Arguments

```ruby
# RUIM: booleanos posicionais
send_invoice(order, true, false)

# BOM: keyword arguments
send_invoice(order, notify_customer: true, attach_pdf: false)
```

### Métodos Endless

Use apenas para readers de uma única expressão:

```ruby
def full_name = "#{first_name} #{last_name}"
```

### Encaminhamento de Argumentos

```ruby
def self.call(...) = new(...).call
```

### Bloco Implícito e It

O Ruby 3.4+ oferece `it` como parâmetro implícito de bloco para blocos de um argumento:

```ruby
users.map { it.name }
users.map(&:name)  # ainda preferido quando uma referência de método basta
```

---

## Condicionais

```ruby
# Prefira modificadores para corpos de uma linha
return if order.nil?

# Prefira unless apenas para negativas simples, nunca com else
send_reminder unless user.opted_out?

# RUIM
unless user.active?
  deactivate
else
  activate
end

# BOM
if user.active?
  activate
else
  deactivate
end
```

- Nunca use `and`/`or` para controle de fluxo; use `&&`/`||`
- Evite o ternário em expressões aninhadas
- Use `case` com `then` para mapeamentos planos

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

Use pattern matching para dados estruturados (JSON parseado, objetos `Data`). Não o use onde um `if` basta.

---

## Coleções e Enumerable

```ruby
# RUIM
total = 0
items.each { |i| total += i.price }

# BOM
total = items.sum(&:price)

# Prefira
items.select(&:available?).map(&:name)
items.filter_map { |i| i.name if i.available? }
items.each_with_object({}) { |i, h| h[i.id] = i }
items.group_by(&:category)
items.partition(&:available?)
```

- Prefira `find_each` / `in_batches` a `each` em relations grandes do Active Record
- Prefira `pluck`/`ids` a `map(&:id)` em relations
- Prefira `exists?` a `count > 0`; `any?` em coleções já carregadas
- Evite mutar argumentos

---

## Strings e Symbols

```ruby
# Interpolação em vez de concatenação
"Hello, #{user.name}"

# Heredocs com indentação squiggly
message = <<~TEXT
  Dear #{user.name},
  Your order #{order.id} shipped.
TEXT

# Symbols para identificadores, strings para dados
status = :pending
```

---

## Classes e Módulos

### Value Objects com Data

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

`Data.define` produz value objects imutáveis com construção por keyword arguments. Prefira-o a `Struct` em código novo.

### Visibilidade

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

- API pública primeiro, seção `private` por último
- Use `private` para helpers; evite `protected`, a menos que compare instâncias
- Prefira composição e módulos a herança profunda (no máximo 2 níveis além de `ApplicationRecord`/`ApplicationController`)

### Namespacing de Módulos

```ruby
# RUIM: o estilo compacto esconde pais ausentes
class Orders::Checkout; end

# BOM: estilo aninhado, as constantes são resolvidas de forma previsível
module Orders
  class Checkout; end
end
```

O Zeitwerk aceita ambos; o estilo aninhado é a convenção do projeto.

---

## Tratamento de Erros

```ruby
# RUIM
begin
  charge(order)
rescue Exception
  nil
end

# RUIM: rescue silencioso
rescue => e
end

# BOM: rescue específico, contexto, relançar ou resultado tratado
begin
  gateway.charge!(order)
rescue Payments::Declined => e
  Rails.logger.warn("payment declined order=#{order.id} reason=#{e.message}")
  Result.failure(e.message)
end
```

Regras:
- Nunca `rescue Exception`
- Defina erros de domínio sob um namespace de módulo herdando de `StandardError`
- Use `raise` para condições excepcionais, valores de retorno para falhas esperadas
- Nos controllers, mapeie as exceções com `rescue_from`
- Use `ensure` para limpeza; prefira as formas com bloco (`File.open`, `transaction`)

```ruby
module Payments
  class Error < StandardError; end
  class Declined < Error; end
end
```

---

## Padrões Específicos do Rails

### Strong Parameters

```ruby
def article_params
  params.expect(article: %i[title body])
end
```

`params.expect` (Rails 8) é mais estrito que `require(...).permit(...)` e responde 400 diante de payloads malformados.

### Query Interface

```ruby
# RUIM
User.where("age > #{age}")
User.all.select { |u| u.active? }

# BOM
User.where(age: age..)
User.where(active: true)
```

### Tempo

```ruby
Time.current        # e não Time.now
Date.current        # e não Date.today
3.days.ago
Time.zone.parse("2026-11-01 10:00")
```

### Logging

```ruby
Rails.logger.info("order placed order_id=#{order.id}")
```

Nunca registre em log segredos, tokens ou dados pessoais. O Rails 8.1 oferece eventos estruturados (`Rails.event.notify("order.placed", order_id: order.id)`) para logs legíveis por máquina.

### Configuração

```ruby
Rails.application.credentials.dig(:stripe, :secret_key)
ENV.fetch("REDIS_URL")           # falha imediatamente se ausente
```

Use `ENV.fetch` em vez de `ENV[]` para valores obrigatórios.

---

## Comentários e Documentação

- Comente o **porquê**, não o quê
- Prefira nomes claros a comentários
- APIs públicas de services e bibliotecas: comentários no estilo YARD

```ruby
# Cobra o meio de pagamento do pedido.
#
# @param order [Order] um pedido pendente
# @return [Result]
# @raise [Payments::Declined] quando o cartão é recusado
def charge!(order)
end
```

- `TODO`/`FIXME` exigem uma referência a um ticket
- Remova código comentado

---

## Tipagem Estática Opcional

RBS com Steep ou Sorbet é opcional.

```ruby
# sig/orders/checkout.rbs
module Orders
  class Checkout
    def self.call: (user: User, cart: Cart, payment_token: String) -> Result
    def call: () -> Result
  end
end
```

Se adotada: tipe primeiro as APIs públicas dos services, execute `steep check` ou `srb tc` no CI, evite `untyped` sem um comentário.

---

## Anti-Patterns

| Anti-pattern | Correção |
|--------------|----------|
| Monkey-patching de classes do core | Refinements ou módulos auxiliares |
| `rescue Exception` | Rescue de erros específicos |
| `send` / `constantize` / `eval` sobre entrada do usuário | Allow-list |
| Estado global mutável (`$var`, variáveis de classe) | Injeção de dependência, `Current` |
| Listas de parâmetros longas | Keyword arguments ou um parameter object |
| God model > 300 linhas | Concerns para comportamento coeso, service objects para workflows |
| Callbacks que alcançam outros sistemas | Service object ou job |
| `default_scope` | Scopes explícitos |
| `update_attribute`, ignorar validações casualmente | `update!` |
| Abstração prematura | Esperar a terceira ocorrência |

---

## Checklist Rápida

- [ ] `# frozen_string_literal: true` presente
- [ ] Nomes em `snake_case`, semântica dos sufixos `?`/`!` respeitada
- [ ] Métodos < 10 linhas (limite 20), guard clauses
- [ ] Keyword arguments para 3+ parâmetros ou booleanos
- [ ] Sem `rescue Exception`, sem rescue silencioso
- [ ] `params.expect` para strong parameters
- [ ] `Time.current` em vez de `Time.now`
- [ ] `bin/rubocop` limpo
