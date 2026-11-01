# Padrões de Testes Ruby on Rails

TDD é obrigatório: **Red -> Green -> Refactor**. Meta de cobertura: **>= 80%** (SimpleCov). Toda correção de bug recebe um teste de regressão que falha antes da correção.

Todos os comandos rodam dentro do container (`docker compose exec app ...`).

## Escolhendo um Framework

| Framework | Quando | Comando |
|-----------|--------|---------|
| **Minitest** (padrão do Rails) | Novas aplicações Rails, dependências mínimas, fixtures | `bin/rails test` |
| **RSpec** (`rspec-rails`) | Equipes que preferem a sintaxe BDD, shared examples, matchers ricos | `bundle exec rspec` |

Regras:
- Escolha **um** framework por projeto e mantenha a consistência
- Ambos suportam as mesmas camadas: model, service, request, job, mailer, system
- Este documento mostra os dois; os princípios se aplicam igualmente

## Pirâmide de Testes

| Tipo | Proporção | Velocidade | Localização no Rails |
|------|-----------|------------|----------------------|
| Unitários (models, services, queries, POROs) | 70% | < 1 s | `test/models`, `spec/models`, `spec/services` |
| Integração (requests, jobs, mailers) | 20% | < 5 s | `test/integration`, `spec/requests` |
| System / E2E (Capybara + navegador) | 10% | < 30 s | `test/system`, `spec/system` |

---

## Minitest

### Configuração

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

Inicie o SimpleCov antes de carregar a aplicação. Com testes paralelos, o SimpleCov mescla automaticamente os resultados dos workers nas versões recentes; verifique o relatório combinado.

### Teste de Model

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

Diretrizes: mantenha as fixtures pequenas e nomeadas pelo papel que desempenham, referencie associações pelo label, nunca dependa dos IDs das fixtures.

### Teste de Controller / Request

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

Helper de autenticação: defina `sign_in_as(user)` uma única vez em `test/test_helpers/` (o generator de autenticação do Rails 8 cria um `SessionTestHelper` pronto) e inclua-o em `ActionDispatch::IntegrationTest`. Mantenha a lógica de login fora dos testes individuais.

### Testes de Job e Mailer

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

### Configuração

```bash
docker compose exec app bundle add rspec-rails --group "development, test"
docker compose exec app bin/rails generate rspec:install
```

```ruby
# spec/rails_helper.rb (trecho)
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

Use `instance_double` / `class_double` (verifying doubles) para que os doubles falhem quando a interface real mudar.

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
# spec/factories/orders.rb (ou test/factories ao usar Minitest)
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

Diretrizes:
- O menor objeto válido por padrão; expresse as variantes com traits
- Prefira `build` / `build_stubbed` a `create` quando a persistência não for necessária
- Use sequences para valores únicos (`sequence(:email_address) { |n| "user#{n}@example.com" }`)
- Execute `FactoryBot.lint` no CI para detectar factories quebradas
- Evite cadeias profundas de associações que criam dezenas de registros

Fixtures e FactoryBot podem coexistir, mas misturá-los em um mesmo projeto prejudica a legibilidade. Escolha um como padrão.

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

Diretrizes:
- Cubra apenas as jornadas críticas do usuário (login, checkout, interações Turbo principais)
- Use os matchers com espera do Capybara (`assert_text`, `have_content`), **nunca** `sleep`
- Execute um navegador headless em um serviço de container (Selenium ou uma imagem de teste com Chromium)
- Teste Turbo Frames/Streams por meio de resultados visíveis, não de detalhes internos
- Mantenha cada system test independente e abaixo de 30 segundos

---

## Tempo, Aleatoriedade e Serviços Externos

```ruby
# Tempo
travel_to Time.zone.local(2026, 11, 1, 10, 0) do
  assert_predicate invoice, :overdue?
end
freeze_time { ... }

# HTTP: bloquear chamadas reais
require "webmock/minitest"   # ou "webmock/rspec"
stub_request(:post, "https://api.payments.test/charges")
  .with(body: hash_including(amount: 1500))
  .to_return(status: 200, body: { id: "ch_1" }.to_json)
```

- O WebMock bloqueia o acesso real à rede nos testes
- O VCR grava as interações para integrações extensas com terceiros; remova segredos das cassettes (`filter_sensitive_data`)
- Injete clocks e gateways em vez de fazer stub de globais

---

## Cobertura com SimpleCov

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
docker compose exec app bin/rails test              # coverage/index.html gerado
docker compose exec app bundle exec rspec
```

A cobertura é um piso, não um objetivo. Complemente-a com mutation testing onde for crítico (`mutant` é a ferramenta de mutação mais conhecida para Ruby; verifique os termos de licença para o seu projeto antes de adotá-la).

---

## Regras de Qualidade dos Testes

| Regra | Detalhe |
|-------|---------|
| AAA | Arrange, Act, Assert, visíveis em cada teste |
| Nomenclatura | Descreva o comportamento: `"pay! rejects an already paid order"` |
| Independência | Sem estado compartilhado, sem dependência de ordem; execute em ordem aleatória |
| Determinismo | Congele o tempo, fixe a seed da aleatoriedade, sem `sleep` |
| Um comportamento | Poucas asserções por teste, mensagens de falha focadas |
| Comportamento, não implementação | Teste a interface pública e os resultados |
| Mockar as fronteiras | Mocke serviços externos, não o objeto sob teste nem o Active Record |
| Rápido | Testes unitários abaixo de 1 segundo |

Anti-patterns:
- Testes que verificam chamadas a métodos privados
- `allow_any_instance_of` (prefira injeção e verifying doubles)
- Testes comentados ou ignorados sem ticket
- Testes sem asserções
- Dependência do estado do banco deixado por outros testes

---

## Workflow de Regressão (Correção de Bug)

1. Escreva um teste que reproduza o bug (ele **falha**)
2. Corrija o código (o teste **passa**)
3. Refatore com a suíte verde
4. Faça commit do teste e da correção juntos (`fix(orders): ...`)

---

## Execução no CI

```yaml
# .github/workflows/ci.yml (trecho)
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

Localmente, `docker compose exec app bin/ci` executa as mesmas etapas declaradas em `config/ci.rb`. Fixe as actions de terceiros em SHAs de commit nos pipelines de produção.

---

## Checklist de Testes

- [ ] Um único framework (Minitest ou RSpec) usado de forma consistente
- [ ] Testes escritos primeiro (Red -> Green -> Refactor)
- [ ] Cobertura >= 80% imposta pelo SimpleCov
- [ ] Camadas de model, service, request, job e system cobertas
- [ ] Sem `sleep`; tempo congelado onde for relevante
- [ ] HTTP externo bloqueado (WebMock) ou gravado (VCR, com segredos removidos)
- [ ] Autorização testada: usuários não alcançam registros de outros usuários
- [ ] Toda correção de bug tem um teste de regressão
- [ ] A suíte roda em ordem aleatória e em paralelo
