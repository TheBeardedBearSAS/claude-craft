# Standards de Tests Ruby on Rails

Le TDD est obligatoire : **Red -> Green -> Refactor**. Objectif de couverture : **>= 80 %** (SimpleCov). Chaque bug corrigé reçoit un test de non-régression qui échoue avant la correction.

Toutes les commandes s'exécutent dans le conteneur (`docker compose exec app ...`).

## Choisir un framework

| Framework | Quand | Commande |
|-----------|-------|----------|
| **Minitest** (défaut de Rails) | Nouvelles applications Rails, dépendances minimales, fixtures | `bin/rails test` |
| **RSpec** (`rspec-rails`) | Équipes préférant la syntaxe BDD, les shared examples, des matchers riches | `bundle exec rspec` |

Règles :
- Choisir **un seul** framework par projet et rester cohérent
- Les deux prennent en charge les mêmes couches : modèle, service, requête, job, mailer, système
- Ce document présente les deux ; les principes s'appliquent également

## Pyramide des tests

| Type | Part | Vitesse | Emplacement Rails |
|------|------|---------|-------------------|
| Unitaires (modèles, services, queries, POROs) | 70 % | < 1 s | `test/models`, `spec/models`, `spec/services` |
| Intégration (requêtes, jobs, mailers) | 20 % | < 5 s | `test/integration`, `spec/requests` |
| Système / E2E (Capybara + navigateur) | 10 % | < 30 s | `test/system`, `spec/system` |

---

## Minitest

### Configuration

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

Démarrer SimpleCov avant de charger l'application. Avec des tests en parallèle, SimpleCov fusionne automatiquement les résultats des workers dans les versions récentes ; vérifier le rapport combiné.

### Test de modèle

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

Directives : garder les fixtures petites et nommées par rôle, référencer les associations par label, ne jamais dépendre des identifiants de fixtures.

### Test de contrôleur / de requête

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

Helper d'authentification : définir `sign_in_as(user)` une seule fois dans `test/test_helpers/` (le générateur d'authentification de Rails 8 crée un `SessionTestHelper` prêt à l'emploi) et l'inclure dans `ActionDispatch::IntegrationTest`. Garder la logique de connexion hors des tests individuels.

### Tests de jobs et de mailers

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

### Configuration

```bash
docker compose exec app bundle add rspec-rails --group "development, test"
docker compose exec app bin/rails generate rspec:install
```

```ruby
# spec/rails_helper.rb (extrait)
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

### Spec de modèle

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

### Spec de service

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

Utiliser `instance_double` / `class_double` (doublures vérifiantes) pour que les doublures échouent lorsque l'interface réelle change.

### Spec de requête

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
# spec/factories/orders.rb (ou test/factories avec Minitest)
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

Directives :
- Par défaut, l'objet valide le plus petit possible ; exprimer les variantes avec des traits
- Préférer `build` / `build_stubbed` à `create` lorsque la persistance n'est pas nécessaire
- Utiliser des séquences pour les valeurs uniques (`sequence(:email_address) { |n| "user#{n}@example.com" }`)
- Exécuter `FactoryBot.lint` en CI pour détecter les factories cassées
- Éviter les longues chaînes d'associations qui créent des dizaines d'enregistrements

Les fixtures et FactoryBot peuvent coexister, mais les mélanger dans un même projet nuit à la lisibilité. Choisir un défaut.

---

## Tests système (Capybara)

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

Directives :
- Ne couvrir que les parcours utilisateur critiques (connexion, paiement, interactions Turbo clés)
- Utiliser les matchers à attente de Capybara (`assert_text`, `have_content`), **jamais** `sleep`
- Exécuter un navigateur headless dans un service de conteneur (Selenium ou une image de test équipée de Chromium)
- Tester les Turbo Frames/Streams via des résultats visibles, pas via les internes
- Garder chaque test système indépendant et sous 30 secondes

---

## Temps, aléatoire et services externes

```ruby
# Temps
travel_to Time.zone.local(2026, 11, 1, 10, 0) do
  assert_predicate invoice, :overdue?
end
freeze_time { ... }

# HTTP : bloquer les appels réels
require "webmock/minitest"   # ou "webmock/rspec"
stub_request(:post, "https://api.payments.test/charges")
  .with(body: hash_including(amount: 1500))
  .to_return(status: 200, body: { id: "ch_1" }.to_json)
```

- WebMock bloque l'accès réseau réel dans les tests
- VCR enregistre les interactions pour les grosses intégrations tierces ; purger les secrets des cassettes (`filter_sensitive_data`)
- Injecter les horloges et les gateways plutôt que de stubber des globales

---

## Couverture avec SimpleCov

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
docker compose exec app bin/rails test              # coverage/index.html généré
docker compose exec app bundle exec rspec
```

La couverture est un plancher, pas un objectif. La compléter par du mutation testing là où c'est critique (`mutant` est l'outil de mutation Ruby le plus connu ; vérifier les conditions de sa licence pour votre projet avant de l'adopter).

---

## Règles de qualité des tests

| Règle | Détail |
|-------|--------|
| AAA | Arrange, Act, Assert, visibles dans chaque test |
| Nommage | Décrire le comportement : `"pay! rejects an already paid order"` |
| Indépendance | Aucun état partagé, aucune dépendance à l'ordre ; exécuter en ordre aléatoire |
| Déterminisme | Figer le temps, initialiser l'aléatoire, pas de `sleep` |
| Un comportement | Peu d'assertions par test, messages d'échec ciblés |
| Comportement et non implémentation | Tester l'interface publique et les résultats |
| Mocker les frontières | Mocker les services externes, pas l'objet testé ni Active Record |
| Rapide | Tests unitaires sous 1 seconde |

Anti-patterns :
- Tests qui vérifient des appels de méthodes privées
- `allow_any_instance_of` (préférer l'injection et les doublures vérifiantes)
- Tests commentés ou ignorés sans ticket
- Tests sans assertions
- Dépendance à un état de base de données laissé par d'autres tests

---

## Workflow de non-régression (correction de bug)

1. Écrire un test reproduisant le bug (il **échoue**)
2. Corriger le code (le test **passe**)
3. Refactorer avec la suite au vert
4. Commiter le test et la correction ensemble (`fix(orders): ...`)

---

## Exécution en CI

```yaml
# .github/workflows/ci.yml (extrait)
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

En local, `docker compose exec app bin/ci` exécute les mêmes étapes déclarées dans `config/ci.rb`. Épingler les actions tierces sur des SHA de commit dans les pipelines de production.

---

## Checklist des tests

- [ ] Un seul framework (Minitest ou RSpec) utilisé de façon cohérente
- [ ] Tests écrits en premier (Red -> Green -> Refactor)
- [ ] Couverture >= 80 % imposée par SimpleCov
- [ ] Couches modèle, service, requête, job et système couvertes
- [ ] Pas de `sleep` ; temps figé là où c'est pertinent
- [ ] HTTP externe bloqué (WebMock) ou enregistré (VCR, purgé)
- [ ] Autorisation testée : les utilisateurs ne peuvent pas atteindre les enregistrements des autres
- [ ] Chaque correction de bug a un test de non-régression
- [ ] La suite s'exécute en ordre aléatoire et en parallèle
