# Ruby-on-Rails-Architektur - Rails Way & pragmatisches Clean Design

## Architekturprinzipien

### 1. Zuerst der Rails Way

Rails 8.1 liefert eine vollständige, meinungsstarke Architektur mit. Zuerst deren Konventionen befolgen und zusätzliche Objekte nur extrahieren, wenn ein Model oder Controller echten Schmerz zeigt (Größe, Verzweigungen, Orchestrierung mehrerer Models, schwer testbare Logik).

```
app/
├── models/                    # Active-Record-Models: Persistenz, Validierungen, Domänenregeln
│   └── concerns/              # Zusammenhängendes, wiederverwendbares Modellverhalten
├── controllers/               # Dünne HTTP-Schicht
│   └── concerns/              # Authentifizierungs- und Autorisierungs-Helfer
├── services/                  # Service Objects (ein Anwendungsfall, ein `call`)
├── forms/                     # Form Objects (Eingaben über mehrere Models oder ohne Persistenz)
├── queries/                   # Query Objects (komplexe Lesezugriffe)
├── policies/                  # Autorisierungs-Policies (Pundit) - optional
├── jobs/                      # Active-Job-Klassen (Solid Queue)
├── mailers/
├── channels/                  # Action Cable (Solid Cable)
├── views/                     # ERB-Templates, Turbo Frames und Streams
├── helpers/
└── javascript/controllers/    # Stimulus-Controller (importmap)
config/
├── routes.rb
├── credentials.yml.enc
├── ci.rb                      # Schritte von bin/ci (Rails 8.1)
└── initializers/
db/
├── migrate/
├── schema.rb
└── seeds.rb
```

### 2. Pragmatisches Clean: keine verpflichtende Schichtung

Eine hexagonale oder Clean-Architecture-Schichtung ist in einer Rails-Anwendung **nicht erforderlich**. Active Record ist von Haus aus die Persistenzschicht; es in Repositories zu verpacken lohnt sich selten.

| Situation | Empfohlener Ansatz |
|-----------|--------------------|
| CRUD mit einfachen Regeln | Schlichtes Model + Controller |
| Regeln, die einen Datensatz betreffen | Model-Methoden, Validierungen, Scopes |
| Workflow über mehrere Models oder externe Systeme | Service Object |
| Formular, das mehrere Models beschreibt, oder virtuelle Attribute | Form Object (`ActiveModel::Model`) |
| Komplexer, wiederverwendbarer Lesezugriff | Query Object oder Scope |
| Zusammenhängendes Verhalten, das mehrere Models teilen | Concern |
| Asynchrone oder langsame Arbeit | Active Job |
| Autorisierungsregeln | Policy Object (Pundit) oder Controller-Concern |

**Faustregel:** beim zweiten oder dritten Auftreten von Schmerz extrahieren, nicht früher (KISS, YAGNI).

### 3. Abhängigkeitsrichtung

```
Controllers ──> Services / Forms / Queries ──> Models ──> Datenbank
     │                    │
     └──────> Jobs <──────┘
```

- Models hängen niemals von Controllern, Request-Objekten oder Sessions ab
- `Current` (`ActiveSupport::CurrentAttributes`) sparsam einsetzen, hauptsächlich für den authentifizierten Benutzer und Request-Metadaten
- Views fragen die Datenbank niemals direkt ab; Daten im Controller oder in einem Query Object laden

---

## Controller

Controller tun vier Dinge: authentifizieren, autorisieren, delegieren, antworten.

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

Leitlinien:
- Nur RESTful Actions (`index show new create edit update destroy`); anderes Verhalten als neue Ressource modellieren (`resource :publication`) statt als Custom Actions
- `params.expect` (Rails 8) für Strong Parameters verwenden
- Beim fehlgeschlagenen Rendern eines Formulars `status: :unprocessable_entity` und nach `destroy` `status: :see_other` zurückgeben, damit Turbo die Antwort verarbeitet
- Weniger als 10 Zeilen pro Action; darüber hinaus delegieren

### Controller-Concerns

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

Rails 8 liefert einen Authentifizierungs-Generator (`bin/rails generate authentication`), der diese Struktur erzeugt (`Session`-Model, `Authentication`-Concern, `Current`, Passwort-Reset). Bei neuen Anwendungen ihn eigenen Lösungen vorziehen.

---

## Models

Models besitzen Persistenz, Validierungen, Assoziationen und Domänenregeln für ein einzelnes Aggregat von Datensätzen.

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

Leitlinien:
- Jede Validierung durch einen Datenbank-Constraint absichern (`null: false`, Unique-Index, Fremdschlüssel)
- `enum` mit expliziten Integer- oder String-Werten gegenüber freien Status-Strings bevorzugen
- Scopes und Klassenmethoden bevorzugen, die Relationen zurückgeben; sie verkettbar halten
- Callbacks nur für Belange desselben Datensatzes verwenden (Normalisierung, Standardwerte, `after_create_commit`, das einen Job einreiht). Niemals für E-Mails, Zahlungen oder modellübergreifende Schreibzugriffe
- `has_secure_password`, `generates_token_for` und `normalizes` für häufige Anforderungen nutzen

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

Concerns für **zusammenhängendes, benennbares Verhalten** verwenden (`Archivable`, `Searchable`), niemals als Sammelbecken, um die Dateigröße zu verkleinern.

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

Ein Service Object kapselt einen Anwendungsfall. Eine öffentliche Methode (`call`), explizite Eingaben, explizites Ergebnis.

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

Leitlinien:
- Services nach einer fachlichen Aktion benennen (`Orders::Checkout`, `Subscriptions::Renew`), nicht nach Mustern (`OrderManager`)
- Kollaborateure (Gateway, Uhr) über Keyword-Argumente mit sinnvollen Standardwerten injizieren, um das Testen zu erleichtern
- Schreibzugriffe auf mehrere Datensätze in eine `transaction` einschließen
- Bei erwarteten Fehlschlägen ein Ergebnisobjekt (`Data.define`) zurückgeben, statt eine Exception auszulösen
- Keinen Service für ein einfaches `save` erstellen

---

## Form Objects

`ActiveModel::Model` verwenden, wenn ein Formular mehrere Models umfasst oder keiner Tabelle entspricht.

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

Komplexe oder wiederverwendbare Lesezugriffe extrahieren, die nicht in einen Scope passen.

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

Immer eine `ActiveRecord::Relation` zurückgeben, damit Aufrufer weiter verketten, paginieren und Eager Loading nutzen können.

---

## Background Jobs (Active Job + Solid Queue)

Solid Queue ist das Standard-Backend von Active Job in Rails 8 und datenbankgestützt.

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

Leitlinien:
- IDs (oder per GlobalID serialisierbare Datensätze) übergeben, niemals große Payloads
- Jobs **idempotent** machen: sie können zweimal laufen
- Nach dem Commit einreihen (`after_create_commit`, oder `perform_later` außerhalb der Transaktion)
- Queues und wiederkehrende Aufgaben in `config/queue.yml` und `config/recurring.yml` konfigurieren
- Rails 8.1 ergänzt Job Continuations für lang laufende, fortsetzbare Jobs; sie für Batch-Arbeit statt eines einzigen riesigen Jobs nutzen

---

## Hotwire (Turbo und Stimulus)

Serverseitig gerendertes HTML mit Turbo bevorzugen, bevor eigenes JavaScript geschrieben wird.

```erb
<%# app/views/articles/index.html.erb %>
<%= turbo_frame_tag "articles" do %>
  <%= render @articles %>
  <%= link_to "Next", articles_path(page: @next_page) %>
<% end %>
```

```ruby
# Broadcasting mit Turbo Streams (Solid Cable in Produktion)
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

Leitlinien:
- Ein Stimulus-Controller pro Belang, Zustand in `data-*`-Attributen
- Seiten sollen, wo machbar, auch ohne JavaScript funktionieren (Progressive Enhancement)
- Frame- und Stream-IDs mit `dom_id` ableiten

---

## Praktiken für Active Record

### N+1 vermeiden

```ruby
# SCHLECHT
Article.all.each { |a| puts a.author.name }

# GUT
Article.includes(:author).find_each { |a| puts a.author.name }
```

`config.active_record.strict_loading_by_default = true` in der Entwicklung aktivieren, um Lazy Loads sichtbar zu machen, oder `bullet` in Entwicklung/Test hinzufügen.

### Migrationen

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

- Migrationen müssen umkehrbar sein (`change`, oder explizites `up`/`down`)
- `strong_migrations` verwenden, um unsichere Operationen auf großen Tabellen zu verhindern
- Niemals eine bereits in den Hauptzweig gemergte Migration bearbeiten

### Transaktionen und Locking

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

Solid Cache speichert Einträge in der Datenbank und ist der Produktionsstandard von Rails 8. Schlüsselbasierte Ablaufsteuerung (`cache_key_with_version`) statt manueller Invalidierung verwenden.

---

## Autoloading (Zeitwerk)

- Der Dateipfad muss zur Konstante passen: `app/services/orders/checkout.rb` definiert `Orders::Checkout`
- Kein `require` für Anwendungscode
- Prüfen mit `docker compose exec app bin/rails zeitwerk:check`
- Verzeichnisse unter `app/` sind automatisch Autoload-Wurzeln (`services`, `forms`, `queries` benötigen keine Konfiguration)

---

## API-Anwendungen

Für JSON-APIs dieselbe Struktur beibehalten:

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

- Versionierung über Namespace (`/api/v1`)
- Einen Serializer oder `jbuilder` verwenden, niemals `render json: record` bei einem Model, das interne Spalten offenlegt
- Für Fehler Problem Details nach RFC 9457 zurückgeben
- Mit OpenAPI 3.x dokumentieren

---

## Deployment-Architektur

Rails 8 verwendet standardmäßig Kamal 2 mit Thruster vor Puma und ein einziges Container-Image.

```
Browser ──> Thruster (HTTP/2, Caching, Kompression) ──> Puma ──> Rails
                                                          └──> Solid Queue / Cache / Cable (Datenbank)
```

- Ein von Rails generiertes `Dockerfile`; die Ruby-Version festlegen
- Konfiguration über Umgebungsvariablen und verschlüsselte Credentials
- `config/deploy.yml` für Kamal; Secrets in `.kamal/secrets`, niemals im Klartext eingecheckt

---

## Architektur-Checkliste

- [ ] Controller sind dünn und RESTful
- [ ] Models sichern Validierungen mit Datenbank-Constraints ab
- [ ] Keine Callbacks mit Seiteneffekten (Mail, Zahlung, modellübergreifende Schreibzugriffe)
- [ ] Service-/Form-/Query-Objects existieren nur dort, wo sie gerechtfertigt sind
- [ ] N+1-Abfragen vermieden (`includes`, `strict_loading`)
- [ ] Jobs sind idempotent und werden nach dem Commit eingereiht
- [ ] `bin/rails zeitwerk:check` läuft durch
- [ ] Hotwire gegenüber eigenem JavaScript bevorzugt
- [ ] Rails-8-Standards (Solid Queue/Cache/Cable, Propshaft, importmap) beibehalten, sofern nicht begründet abgewichen wird
