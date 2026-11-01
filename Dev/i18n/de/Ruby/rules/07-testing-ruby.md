# Test-Standards für Ruby on Rails

TDD ist verpflichtend: **Red -> Green -> Refactor**. Abdeckungsziel: **>= 80 %** (SimpleCov). Jeder behobene Bug erhält einen Regressionstest, der vor dem Fix fehlschlägt.

Alle Befehle laufen im Container (`docker compose exec app ...`).

## Auswahl eines Frameworks

| Framework | Wann | Befehl |
|-----------|------|--------|
| **Minitest** (Rails-Standard) | Neue Rails-Apps, minimale Abhängigkeiten, Fixtures | `bin/rails test` |
| **RSpec** (`rspec-rails`) | Teams, die BDD-Syntax, Shared Examples und umfangreiche Matcher bevorzugen | `bundle exec rspec` |

Regeln:
- **Ein** Framework pro Projekt wählen und konsistent bleiben
- Beide unterstützen dieselben Schichten: Model, Service, Request, Job, Mailer, System
- Dieses Dokument zeigt beide; die Prinzipien gelten gleichermaßen

## Testpyramide

| Typ | Anteil | Geschwindigkeit | Ort in Rails |
|-----|--------|-----------------|--------------|
| Unit (Models, Services, Queries, POROs) | 70 % | < 1 s | `test/models`, `spec/models`, `spec/services` |
| Integration (Requests, Jobs, Mailer) | 20 % | < 5 s | `test/integration`, `spec/requests` |
| System / E2E (Capybara + Browser) | 10 % | < 30 s | `test/system`, `spec/system` |

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

SimpleCov vor dem Laden der Anwendung starten. Bei parallelen Tests führt SimpleCov in neueren Versionen die Ergebnisse der Worker automatisch zusammen; den kombinierten Bericht prüfen.

### Model-Test

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

Leitlinien: Fixtures klein halten und nach Rolle benennen, Assoziationen über das Label referenzieren, niemals von Fixture-IDs abhängen.

### Controller- / Request-Test

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

Authentifizierungs-Helfer: `sign_in_as(user)` einmal in `test/test_helpers/` definieren (der Authentifizierungs-Generator von Rails 8 erzeugt einen fertigen `SessionTestHelper`) und in `ActionDispatch::IntegrationTest` einbinden. Die Anmeldelogik aus einzelnen Tests heraushalten.

### Job- und Mailer-Tests

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
# spec/rails_helper.rb (Auszug)
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

### Model-Spec

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

### Service-Spec

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

`instance_double` / `class_double` (verifizierende Doubles) verwenden, damit Doubles fehlschlagen, wenn sich die echte Schnittstelle ändert.

### Request-Spec

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
# spec/factories/orders.rb (oder test/factories bei Verwendung von Minitest)
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

Leitlinien:
- Standardmäßig das kleinste gültige Objekt; Varianten mit Traits ausdrücken
- `build` / `build_stubbed` gegenüber `create` bevorzugen, wenn keine Persistenz nötig ist
- Sequences für eindeutige Werte verwenden (`sequence(:email_address) { |n| "user#{n}@example.com" }`)
- `FactoryBot.lint` in der CI ausführen, um defekte Factories zu erkennen
- Tiefe Assoziationsketten vermeiden, die Dutzende von Datensätzen erzeugen

Fixtures und FactoryBot können koexistieren, ihre Mischung in einem Projekt schadet jedoch der Lesbarkeit. Einen Standard wählen.

---

## Systemtests (Capybara)

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

Leitlinien:
- Nur kritische Benutzerabläufe abdecken (Anmeldung, Checkout, zentrale Turbo-Interaktionen)
- Die wartenden Matcher von Capybara verwenden (`assert_text`, `have_content`), **niemals** `sleep`
- Einen Headless-Browser in einem Container-Service ausführen (Selenium oder ein mit Chromium ausgestattetes Test-Image)
- Turbo Frames/Streams über sichtbare Ergebnisse testen, nicht über Interna
- Jeden Systemtest unabhängig halten und unter 30 Sekunden

---

## Zeit, Zufall und externe Dienste

```ruby
# Zeit
travel_to Time.zone.local(2026, 11, 1, 10, 0) do
  assert_predicate invoice, :overdue?
end
freeze_time { ... }

# HTTP: echte Aufrufe blockieren
require "webmock/minitest"   # oder "webmock/rspec"
stub_request(:post, "https://api.payments.test/charges")
  .with(body: hash_including(amount: 1500))
  .to_return(status: 200, body: { id: "ch_1" }.to_json)
```

- WebMock blockiert in Tests den echten Netzwerkzugriff
- VCR zeichnet Interaktionen für umfangreiche Integrationen mit Drittsystemen auf; Secrets aus den Cassettes entfernen (`filter_sensitive_data`)
- Uhren und Gateways injizieren, statt globale Objekte zu stubben

---

## Abdeckung mit SimpleCov

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
docker compose exec app bin/rails test              # coverage/index.html wird erzeugt
docker compose exec app bundle exec rspec
```

Abdeckung ist eine Untergrenze, kein Ziel. Wo kritisch, mit Mutation Testing ergänzen (`mutant` ist das bekannteste Mutation-Tool für Ruby; vor der Einführung die Lizenzbedingungen für das eigene Projekt prüfen).

---

## Regeln für Testqualität

| Regel | Detail |
|-------|--------|
| AAA | Arrange, Act, Assert, in jedem Test sichtbar |
| Benennung | Verhalten beschreiben: `"pay! rejects an already paid order"` |
| Unabhängigkeit | Kein geteilter Zustand, keine Reihenfolgeabhängigkeit; in zufälliger Reihenfolge ausführen |
| Determinismus | Zeit einfrieren, Zufall seeden, kein `sleep` |
| Ein Verhalten | Wenige Assertions pro Test, fokussierte Fehlermeldungen |
| Verhalten statt Implementierung | Öffentliche Schnittstelle und Ergebnisse testen |
| Grenzen mocken | Externe Dienste mocken, nicht das zu testende Objekt oder Active Record |
| Schnell | Unit-Tests unter 1 Sekunde |

Anti-Patterns:
- Tests, die Aufrufe privater Methoden prüfen
- `allow_any_instance_of` (Injektion und verifizierende Doubles bevorzugen)
- Auskommentierte oder übersprungene Tests ohne Ticket
- Tests ohne Assertions
- Abhängigkeit vom Datenbankzustand, den andere Tests hinterlassen

---

## Regressions-Workflow (Bugfix)

1. Einen Test schreiben, der den Bug reproduziert (er **schlägt fehl**)
2. Den Code korrigieren (der Test **läuft durch**)
3. Mit grüner Suite refaktorisieren
4. Test und Fix gemeinsam committen (`fix(orders): ...`)

---

## Ausführung in der CI

```yaml
# .github/workflows/ci.yml (Auszug)
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

Lokal führt `docker compose exec app bin/ci` dieselben Schritte aus, die in `config/ci.rb` deklariert sind. In Produktions-Pipelines Actions von Drittanbietern auf Commit-SHAs pinnen.

---

## Test-Checkliste

- [ ] Ein Framework (Minitest oder RSpec) konsistent verwendet
- [ ] Tests zuerst geschrieben (Red -> Green -> Refactor)
- [ ] Abdeckung >= 80 % durch SimpleCov erzwungen
- [ ] Schichten Model, Service, Request, Job und System abgedeckt
- [ ] Kein `sleep`; Zeit eingefroren, wo relevant
- [ ] Externes HTTP blockiert (WebMock) oder aufgezeichnet (VCR, bereinigt)
- [ ] Autorisierung getestet: Benutzer erreichen keine Datensätze anderer Benutzer
- [ ] Jeder Bugfix hat einen Regressionstest
- [ ] Die Suite läuft in zufälliger Reihenfolge und parallel
