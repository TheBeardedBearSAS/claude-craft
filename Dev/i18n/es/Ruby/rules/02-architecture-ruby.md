# Arquitectura Ruby on Rails - Rails Way y diseño Clean pragmático

## Principios arquitectónicos

### 1. Rails Way primero

Rails 8.1 incluye una arquitectura completa y opinada. Sigue primero sus convenciones y extrae objetos adicionales solo cuando un modelo o un controlador muestre un dolor real (tamaño, ramificaciones, orquestación multi-modelo, lógica difícil de probar).

```
app/
├── models/                    # Modelos Active Record: persistencia, validaciones, reglas de dominio
│   └── concerns/              # Comportamiento de modelo cohesivo y reutilizable
├── controllers/               # Capa HTTP delgada
│   └── concerns/              # Autenticación, helpers de autorización
├── services/                  # Service objects (un caso de uso, un `call`)
├── forms/                     # Form objects (entrada multi-modelo o no persistida)
├── queries/                   # Query objects (lecturas complejas)
├── policies/                  # Políticas de autorización (Pundit) - opcional
├── jobs/                      # Clases Active Job (Solid Queue)
├── mailers/
├── channels/                  # Action Cable (Solid Cable)
├── views/                     # Plantillas ERB, Turbo Frames y Streams
├── helpers/
└── javascript/controllers/    # Controladores Stimulus (importmap)
config/
├── routes.rb
├── credentials.yml.enc
├── ci.rb                      # pasos de bin/ci (Rails 8.1)
└── initializers/
db/
├── migrate/
├── schema.rb
└── seeds.rb
```

### 2. Clean pragmático: sin capas obligatorias

Las capas de la arquitectura Hexagonal o Clean **no son obligatorias** en una aplicación Rails. Active Record es la capa de persistencia por diseño; envolverlo en repositorios rara vez compensa.

| Situación | Enfoque recomendado |
|-----------|---------------------|
| CRUD con reglas simples | Modelo + controlador simples |
| Reglas que afectan a un solo registro | Métodos de modelo, validaciones, scopes |
| Workflow que abarca varios modelos o sistemas externos | Service object |
| Formulario que escribe en varios modelos, o con atributos virtuales | Form object (`ActiveModel::Model`) |
| Lectura compleja y reutilizable | Query object o scope |
| Comportamiento cohesivo compartido por varios modelos | Concern |
| Trabajo asíncrono o lento | Active Job |
| Reglas de autorización | Policy object (Pundit) o concern de controlador |

**Regla práctica:** extraer en la segunda o tercera aparición del dolor, no antes (KISS, YAGNI).

### 3. Dirección de las dependencias

```
Controllers ──> Services / Forms / Queries ──> Models ──> Database
     │                    │
     └──────> Jobs <──────┘
```

- Los modelos nunca dependen de los controladores, de los objetos request ni de las sesiones
- Usa `Current` (`ActiveSupport::CurrentAttributes`) con moderación, principalmente para el usuario autenticado y los metadatos de la request
- Las vistas nunca consultan la base de datos directamente; carga los datos en el controlador o en un query object

---

## Controladores

Los controladores hacen cuatro cosas: autenticar, autorizar, delegar, responder.

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

Directrices:
- Solo acciones RESTful (`index show new create edit update destroy`); modela cualquier otro comportamiento como un nuevo recurso (`resource :publication`) en lugar de acciones personalizadas
- Usa `params.expect` (Rails 8) para los strong parameters
- Devuelve `status: :unprocessable_entity` cuando falla el renderizado de un formulario y `status: :see_other` tras un `destroy` para que Turbo gestione la respuesta
- Menos de 10 líneas por acción; delega a partir de ahí

### Concerns de controlador

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

Rails 8 incluye un generador de autenticación (`bin/rails generate authentication`) que produce esta estructura (modelo `Session`, concern `Authentication`, `Current`, restablecimiento de contraseña). Prefiérelo a los esquemas personalizados en las aplicaciones nuevas.

---

## Modelos

Los modelos son responsables de la persistencia, las validaciones, las asociaciones y las reglas de dominio de un único agregado de registros.

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

Directrices:
- Respalda cada validación con una restricción de base de datos (`null: false`, índice único, clave foránea)
- Prefiere `enum` con valores enteros o strings explícitos en lugar de strings de estado libres
- Prefiere scopes y métodos de clase que devuelvan relations; mantenlos encadenables
- Usa callbacks solo para asuntos del mismo registro (normalización, valores por defecto, `after_create_commit` que encola un job). Nunca para correos, pagos ni escrituras entre modelos
- Usa `has_secure_password`, `generates_token_for` y `normalizes` para las necesidades comunes

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

Usa los concerns para un **comportamiento cohesivo y nombrable** (`Archivable`, `Searchable`), nunca como cajón de sastre para reducir el tamaño de un archivo.

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

Un service object encapsula un caso de uso. Un único método público (`call`), entradas explícitas, resultado explícito.

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

Directrices:
- Nombra los servicios según una acción de negocio (`Orders::Checkout`, `Subscriptions::Renew`), no según patrones (`OrderManager`)
- Inyecta los colaboradores (gateway, reloj) mediante argumentos con nombre y valores por defecto razonables, para facilitar las pruebas
- Envuelve las escrituras multi-registro en una `transaction`
- Devuelve un objeto resultado (`Data.define`) en lugar de lanzar excepciones para los fallos esperados
- No crees un servicio para un simple `save`

---

## Form Objects

Usa `ActiveModel::Model` cuando un formulario abarque varios modelos o no se corresponda con una tabla.

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

Extrae las lecturas complejas o reutilizables que no encajen en un scope.

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

Devuelve siempre una `ActiveRecord::Relation` para que quien llame pueda seguir encadenando, paginando y haciendo eager loading.

---

## Jobs en segundo plano (Active Job + Solid Queue)

Solid Queue es el backend de Active Job por defecto en Rails 8 y está respaldado por la base de datos.

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

Directrices:
- Pasa IDs (o registros serializables con GlobalID), nunca cargas grandes
- Haz los jobs **idempotentes**: pueden ejecutarse dos veces
- Encola después del commit (`after_create_commit`, o `perform_later` fuera de la transacción)
- Configura las colas y las tareas recurrentes en `config/queue.yml` y `config/recurring.yml`
- Rails 8.1 añade continuaciones de jobs para jobs largos y reanudables; úsalas en el trabajo por lotes en lugar de un único job gigantesco

---

## Hotwire (Turbo y Stimulus)

Prefiere el HTML renderizado en el servidor con Turbo antes de escribir JavaScript personalizado.

```erb
<%# app/views/articles/index.html.erb %>
<%= turbo_frame_tag "articles" do %>
  <%= render @articles %>
  <%= link_to "Next", articles_path(page: @next_page) %>
<% end %>
```

```ruby
# Broadcast con Turbo Streams (Solid Cable en producción)
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

Directrices:
- Un controlador Stimulus por responsabilidad, el estado en atributos `data-*`
- Las páginas deben funcionar sin JavaScript cuando sea viable (mejora progresiva)
- IDs de frames y streams derivados con `dom_id`

---

## Prácticas de Active Record

### Prevención de N+1

```ruby
# MAL
Article.all.each { |a| puts a.author.name }

# BIEN
Article.includes(:author).find_each { |a| puts a.author.name }
```

Activa `config.active_record.strict_loading_by_default = true` en desarrollo para sacar a la luz las cargas perezosas, o añade `bullet` en desarrollo/test.

### Migraciones

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

- Las migraciones deben ser reversibles (`change`, o `up`/`down` explícitos)
- Usa `strong_migrations` para evitar operaciones inseguras en tablas grandes
- Nunca edites una migración ya integrada en la rama principal

### Transacciones y bloqueos

```ruby
Account.transaction do
  from = Account.lock.find(from_id)
  to = Account.lock.find(to_id)
  from.withdraw!(amount)
  to.deposit!(amount)
end
```

---

## Caché (Solid Cache)

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

Solid Cache almacena las entradas en la base de datos y es el valor por defecto de producción en Rails 8. Usa expiración basada en claves (`cache_key_with_version`) en lugar de invalidación manual.

---

## Autoloading (Zeitwerk)

- La ruta del archivo debe coincidir con la constante: `app/services/orders/checkout.rb` define `Orders::Checkout`
- Sin `require` para el código de la aplicación
- Verifica con `docker compose exec app bin/rails zeitwerk:check`
- Los directorios bajo `app/` son raíces de autoload automáticamente (`services`, `forms`, `queries` no necesitan configuración)

---

## Aplicaciones API

Para las APIs JSON, mantén la misma estructura:

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

- Versiona mediante namespace (`/api/v1`)
- Usa un serializer o `jbuilder`, nunca `render json: record` sobre un modelo que expone columnas internas
- Devuelve los detalles de problema de la RFC 9457 para los errores
- Documenta con OpenAPI 3.x

---

## Arquitectura de despliegue

Rails 8 usa por defecto Kamal 2 con Thruster delante de Puma, y una única imagen de contenedor.

```
Browser ──> Thruster (HTTP/2, caching, compression) ──> Puma ──> Rails
                                                          └──> Solid Queue / Cache / Cable (database)
```

- Un `Dockerfile` generado por Rails; fija la versión de Ruby
- Configuración mediante variables de entorno y credentials cifradas
- `config/deploy.yml` para Kamal; secretos en `.kamal/secrets`, nunca commiteados en claro

---

## Checklist de arquitectura

- [ ] Los controladores son delgados y RESTful
- [ ] Los modelos respaldan las validaciones con restricciones de base de datos
- [ ] Sin callbacks con efectos secundarios (correo, pago, escrituras entre modelos)
- [ ] Los service/form/query objects existen solo donde están justificados
- [ ] Consultas N+1 evitadas (`includes`, `strict_loading`)
- [ ] Los jobs son idempotentes y se encolan después del commit
- [ ] `bin/rails zeitwerk:check` pasa
- [ ] Hotwire preferido sobre JavaScript personalizado
- [ ] Valores por defecto de Rails 8 (Solid Queue/Cache/Cable, Propshaft, importmap) mantenidos salvo justificación
