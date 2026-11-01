# Estándares de tests Ruby on Rails

El TDD es obligatorio: **Red -> Green -> Refactor**. Objetivo de cobertura: **>= 80%** (SimpleCov). Cada bug corregido recibe un test de regresión que falla antes de la corrección.

Todos los comandos se ejecutan dentro del contenedor (`docker compose exec app ...`).

## Elección de un framework

| Framework | Cuándo | Comando |
|-----------|--------|---------|
| **Minitest** (por defecto en Rails) | Aplicaciones Rails nuevas, dependencias mínimas, fixtures | `bin/rails test` |
| **RSpec** (`rspec-rails`) | Equipos que prefieren la sintaxis BDD, shared examples, matchers ricos | `bundle exec rspec` |

Reglas:
- Elige **un** framework por proyecto y mantén la consistencia
- Ambos soportan las mismas capas: modelo, servicio, request, job, mailer, sistema
- Este documento muestra ambos; los principios se aplican por igual

## Pirámide de tests

| Tipo | Proporción | Velocidad | Ubicación en Rails |
|------|------------|-----------|--------------------|
| Unitarios (modelos, servicios, queries, POROs) | 70% | < 1 s | `test/models`, `spec/models`, `spec/services` |
| Integración (requests, jobs, mailers) | 20% | < 5 s | `test/integration`, `spec/requests` |
| Sistema / E2E (Capybara + navegador) | 10% | < 30 s | `test/system`, `spec/system` |

---

## Minitest

### Configuración

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

Inicia SimpleCov antes de cargar la aplicación. Con tests en paralelo, SimpleCov fusiona automáticamente los resultados de los workers en las versiones recientes; verifica el informe combinado.

### Test de modelo

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

Directrices: mantén las fixtures pequeñas y nombradas por su rol, referencia las asociaciones por etiqueta, nunca dependas de los IDs de las fixtures.

### Test de controlador / request

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

Helper de autenticación: define `sign_in_as(user)` una sola vez en `test/test_helpers/` (el generador de autenticación de Rails 8 crea un `SessionTestHelper` listo para usar) e inclúyelo en `ActionDispatch::IntegrationTest`. Mantén la lógica de inicio de sesión fuera de cada test individual.

### Tests de jobs y mailers

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

### Configuración

```bash
docker compose exec app bundle add rspec-rails --group "development, test"
docker compose exec app bin/rails generate rspec:install
```

```ruby
# spec/rails_helper.rb (extracto)
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

### Model spec

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

### Service spec

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

Usa `instance_double` / `class_double` (dobles verificadores) para que los dobles fallen cuando cambie la interfaz real.

### Request spec

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

### Shared examples

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
# spec/factories/orders.rb (o test/factories si se usa Minitest)
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

Directrices:
- Por defecto, el objeto válido más pequeño; expresa las variantes con traits
- Prefiere `build` / `build_stubbed` a `create` cuando no se necesita persistencia
- Usa secuencias para valores únicos (`sequence(:email_address) { |n| "user#{n}@example.com" }`)
- Ejecuta `FactoryBot.lint` en CI para detectar factories rotas
- Evita las cadenas profundas de asociaciones que crean decenas de registros

Las fixtures y FactoryBot pueden coexistir, pero mezclarlas en un mismo proyecto perjudica la legibilidad. Elige una por defecto.

---

## Tests de sistema (Capybara)

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

Directrices:
- Cubre únicamente los recorridos críticos del usuario (inicio de sesión, checkout, interacciones Turbo clave)
- Usa los matchers con espera de Capybara (`assert_text`, `have_content`), **nunca** `sleep`
- Ejecuta un navegador headless en un servicio de contenedor (Selenium o una imagen de test con Chromium)
- Prueba los Turbo Frames/Streams a través de resultados visibles, no de detalles internos
- Mantén cada test de sistema independiente y por debajo de 30 segundos

---

## Tiempo, aleatoriedad y servicios externos

```ruby
# Tiempo
travel_to Time.zone.local(2026, 11, 1, 10, 0) do
  assert_predicate invoice, :overdue?
end
freeze_time { ... }

# HTTP: bloquear las llamadas reales
require "webmock/minitest"   # o "webmock/rspec"
stub_request(:post, "https://api.payments.test/charges")
  .with(body: hash_including(amount: 1500))
  .to_return(status: 200, body: { id: "ch_1" }.to_json)
```

- WebMock bloquea el acceso real a la red en los tests
- VCR graba las interacciones para grandes integraciones con terceros; elimina los secretos de los cassettes (`filter_sensitive_data`)
- Inyecta relojes y gateways en lugar de stubear globales

---

## Cobertura con SimpleCov

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
docker compose exec app bin/rails test              # se genera coverage/index.html
docker compose exec app bundle exec rspec
```

La cobertura es un mínimo, no un objetivo. Compleméntala con mutation testing donde sea crítico (`mutant` es la herramienta de mutación para Ruby más conocida; revisa sus términos de licencia para tu proyecto antes de adoptarla).

---

## Reglas de calidad de los tests

| Regla | Detalle |
|-------|---------|
| AAA | Arrange, Act, Assert, visibles en cada test |
| Nomenclatura | Describir el comportamiento: `"pay! rejects an already paid order"` |
| Independencia | Sin estado compartido, sin dependencia del orden; ejecutar en orden aleatorio |
| Determinismo | Congelar el tiempo, fijar la semilla de la aleatoriedad, sin `sleep` |
| Un comportamiento | Pocas aserciones por test, mensajes de fallo enfocados |
| Comportamiento, no implementación | Probar la interfaz pública y los resultados |
| Mockear las fronteras | Mockear los servicios externos, no el objeto bajo prueba ni Active Record |
| Rápidos | Tests unitarios por debajo de 1 segundo |

Antipatrones:
- Tests que verifican llamadas a métodos privados
- `allow_any_instance_of` (preferir la inyección y los dobles verificadores)
- Tests comentados u omitidos sin ticket
- Tests sin aserciones
- Dependencia del estado de la base de datos dejado por otros tests

---

## Flujo de regresión (corrección de un bug)

1. Escribe un test que reproduzca el bug (**falla**)
2. Corrige el código (el test **pasa**)
3. Refactoriza con la suite en verde
4. Commitea el test y la corrección juntos (`fix(orders): ...`)

---

## Ejecución en CI

```yaml
# .github/workflows/ci.yml (extracto)
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

En local, `docker compose exec app bin/ci` ejecuta los mismos pasos declarados en `config/ci.rb`. Fija las actions de terceros a SHAs de commit en los pipelines de producción.

---

## Checklist de tests

- [ ] Un solo framework (Minitest o RSpec) usado de forma consistente
- [ ] Tests escritos primero (Red -> Green -> Refactor)
- [ ] Cobertura >= 80% impuesta por SimpleCov
- [ ] Capas de modelo, servicio, request, job y sistema cubiertas
- [ ] Sin `sleep`; tiempo congelado cuando corresponda
- [ ] HTTP externo bloqueado (WebMock) o grabado (VCR, sin secretos)
- [ ] Autorización probada: los usuarios no pueden acceder a los registros de otros usuarios
- [ ] Toda corrección de bug tiene un test de regresión
- [ ] La suite se ejecuta en orden aleatorio y en paralelo
