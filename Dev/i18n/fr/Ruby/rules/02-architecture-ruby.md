# Architecture Ruby on Rails - Rails Way et Conception Clean Pragmatique

## Principes architecturaux

### 1. Rails Way d'abord

Rails 8.1 fournit une architecture complète et opinionnée. Suivez d'abord ses conventions et n'extrayez des objets supplémentaires que lorsqu'un modèle ou un contrôleur montre une vraie douleur (taille, branchements, orchestration multi-modèles, logique difficile à tester).

```
app/
├── models/                    # Modèles Active Record : persistance, validations, règles du domaine
│   └── concerns/              # Comportements de modèle cohésifs et réutilisables
├── controllers/               # Couche HTTP fine
│   └── concerns/              # Authentification, helpers d'autorisation
├── services/                  # Service objects (un cas d'usage, un `call`)
├── forms/                     # Form objects (saisie multi-modèles ou non persistée)
├── queries/                   # Query objects (lectures complexes)
├── policies/                  # Politiques d'autorisation (Pundit) - optionnel
├── jobs/                      # Classes Active Job (Solid Queue)
├── mailers/
├── channels/                  # Action Cable (Solid Cable)
├── views/                     # Templates ERB, Turbo Frames et Streams
├── helpers/
└── javascript/controllers/    # Contrôleurs Stimulus (importmap)
config/
├── routes.rb
├── credentials.yml.enc
├── ci.rb                      # Étapes de bin/ci (Rails 8.1)
└── initializers/
db/
├── migrate/
├── schema.rb
└── seeds.rb
```

### 2. Clean pragmatique : pas de découpage en couches obligatoire

Un découpage en couches hexagonal ou Clean Architecture n'est **pas requis** dans une application Rails. Active Record est la couche de persistance par conception ; l'envelopper dans des repositories est rarement rentable.

| Situation | Approche recommandée |
|-----------|----------------------|
| CRUD avec règles simples | Modèle + contrôleur classiques |
| Règles touchant un seul enregistrement | Méthodes de modèle, validations, scopes |
| Workflow couvrant plusieurs modèles ou systèmes externes | Service object |
| Formulaire écrivant plusieurs modèles, ou attributs virtuels | Form object (`ActiveModel::Model`) |
| Lecture complexe et réutilisable | Query object ou scope |
| Comportement cohésif partagé par plusieurs modèles | Concern |
| Travail asynchrone ou lent | Active Job |
| Règles d'autorisation | Policy object (Pundit) ou concern de contrôleur |

**Règle empirique :** extraire à la deuxième ou troisième occurrence de la douleur, pas avant (KISS, YAGNI).

### 3. Sens des dépendances

```
Controllers ──> Services / Forms / Queries ──> Models ──> Database
     │                    │
     └──────> Jobs <──────┘
```

- Les modèles ne dépendent jamais des contrôleurs, des objets de requête ni des sessions
- Utiliser `Current` (`ActiveSupport::CurrentAttributes`) avec parcimonie, principalement pour l'utilisateur authentifié et les métadonnées de requête
- Les vues n'interrogent jamais directement la base de données ; charger les données dans le contrôleur ou un query object

---

## Contrôleurs

Les contrôleurs font quatre choses : authentifier, autoriser, déléguer, répondre.

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

Directives :
- Uniquement des actions RESTful (`index show new create edit update destroy`) ; modéliser tout autre comportement comme une nouvelle ressource (`resource :publication`) plutôt que par des actions personnalisées
- Utiliser `params.expect` (Rails 8) pour les strong parameters
- Retourner `status: :unprocessable_entity` lors d'un rendu de formulaire en échec et `status: :see_other` après `destroy` pour que Turbo gère la réponse
- Moins de 10 lignes par action ; déléguer au-delà

### Concerns de contrôleur

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

Rails 8 fournit un générateur d'authentification (`bin/rails generate authentication`) qui produit cette structure (modèle `Session`, concern `Authentication`, `Current`, réinitialisation de mot de passe). Le préférer aux schémas sur mesure pour les nouvelles applications.

---

## Modèles

Les modèles possèdent la persistance, les validations, les associations et les règles du domaine pour un seul agrégat d'enregistrements.

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

Directives :
- Appuyer chaque validation sur une contrainte de base de données (`null: false`, index unique, clé étrangère)
- Préférer `enum` avec des valeurs entières ou chaînes explicites aux chaînes de statut libres
- Préférer les scopes et méthodes de classe qui retournent des relations ; les garder chaînables
- N'utiliser les callbacks que pour des préoccupations internes au même enregistrement (normalisation, valeurs par défaut, `after_create_commit` mettant un job en file). Jamais pour des e-mails, des paiements ou des écritures inter-modèles
- Utiliser `has_secure_password`, `generates_token_for` et `normalizes` pour les besoins courants

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

Utiliser les concerns pour un **comportement cohésif et nommable** (`Archivable`, `Searchable`), jamais comme un fourre-tout pour réduire la taille d'un fichier.

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

Un service object encapsule un cas d'usage. Une seule méthode publique (`call`), des entrées explicites, un résultat explicite.

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

Directives :
- Nommer les services d'après une action métier (`Orders::Checkout`, `Subscriptions::Renew`), pas d'après des patterns (`OrderManager`)
- Injecter les collaborateurs (gateway, horloge) via des arguments nommés avec des valeurs par défaut raisonnables, pour faciliter les tests
- Envelopper les écritures multi-enregistrements dans une `transaction`
- Retourner un objet résultat (`Data.define`) plutôt que lever une exception pour les échecs attendus
- Ne pas créer de service pour un simple `save`

---

## Form Objects

Utiliser `ActiveModel::Model` lorsqu'un formulaire couvre plusieurs modèles ou ne correspond à aucune table.

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

Extraire les lectures complexes ou réutilisables qui ne tiennent pas dans un scope.

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

Toujours retourner une `ActiveRecord::Relation` afin que les appelants puissent continuer à chaîner, paginer et précharger.

---

## Jobs en arrière-plan (Active Job + Solid Queue)

Solid Queue est le backend Active Job par défaut de Rails 8 et repose sur la base de données.

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

Directives :
- Passer des identifiants (ou des enregistrements sérialisables via GlobalID), jamais de gros payloads
- Rendre les jobs **idempotents** : ils peuvent s'exécuter deux fois
- Mettre en file après le commit (`after_create_commit`, ou `perform_later` en dehors de la transaction)
- Configurer les files et les tâches récurrentes dans `config/queue.yml` et `config/recurring.yml`
- Rails 8.1 ajoute les job continuations pour les jobs longs et reprenables ; les utiliser pour les traitements par lot plutôt qu'un unique job gigantesque

---

## Hotwire (Turbo et Stimulus)

Préférer le HTML rendu côté serveur avec Turbo avant d'écrire du JavaScript personnalisé.

```erb
<%# app/views/articles/index.html.erb %>
<%= turbo_frame_tag "articles" do %>
  <%= render @articles %>
  <%= link_to "Next", articles_path(page: @next_page) %>
<% end %>
```

```ruby
# Diffusion avec Turbo Streams (Solid Cable en production)
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

Directives :
- Un contrôleur Stimulus par préoccupation, l'état dans des attributs `data-*`
- Les pages doivent fonctionner sans JavaScript lorsque c'est faisable (amélioration progressive)
- Identifiants de frames et de streams dérivés avec `dom_id`

---

## Pratiques Active Record

### Prévenir les N+1

```ruby
# MAUVAIS
Article.all.each { |a| puts a.author.name }

# BON
Article.includes(:author).find_each { |a| puts a.author.name }
```

Activer `config.active_record.strict_loading_by_default = true` en développement pour faire apparaître les chargements paresseux, ou ajouter `bullet` en développement/test.

### Migrations

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

- Les migrations doivent être réversibles (`change`, ou `up`/`down` explicites)
- Utiliser `strong_migrations` pour empêcher les opérations dangereuses sur les grosses tables
- Ne jamais modifier une migration déjà fusionnée dans la branche principale

### Transactions et verrouillage

```ruby
Account.transaction do
  from = Account.lock.find(from_id)
  to = Account.lock.find(to_id)
  from.withdraw!(amount)
  to.deposit!(amount)
end
```

---

## Cache (Solid Cache)

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

Solid Cache stocke les entrées en base de données et constitue le choix par défaut de Rails 8 en production. Utiliser l'expiration par clé (`cache_key_with_version`) plutôt que l'invalidation manuelle.

---

## Autoloading (Zeitwerk)

- Le chemin du fichier doit correspondre à la constante : `app/services/orders/checkout.rb` définit `Orders::Checkout`
- Aucun `require` pour le code applicatif
- Vérifier avec `docker compose exec app bin/rails zeitwerk:check`
- Les répertoires sous `app/` sont automatiquement des racines d'autoload (`services`, `forms`, `queries` ne nécessitent aucune configuration)

---

## Applications API

Pour les API JSON, conserver la même structure :

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

- Versionner via un namespace (`/api/v1`)
- Utiliser un serializer ou `jbuilder`, jamais `render json: record` sur un modèle qui expose des colonnes internes
- Retourner les problem details RFC 9457 pour les erreurs
- Documenter avec OpenAPI 3.x

---

## Architecture de déploiement

Rails 8 utilise par défaut Kamal 2 avec Thruster devant Puma, et une image de conteneur unique.

```
Browser ──> Thruster (HTTP/2, caching, compression) ──> Puma ──> Rails
                                                          └──> Solid Queue / Cache / Cable (database)
```

- Un seul `Dockerfile` généré par Rails ; épingler la version de Ruby
- Configuration via variables d'environnement et credentials chiffrés
- `config/deploy.yml` pour Kamal ; secrets dans `.kamal/secrets`, jamais commités en clair

---

## Checklist d'architecture

- [ ] Les contrôleurs sont fins et RESTful
- [ ] Les modèles appuient leurs validations sur des contraintes de base de données
- [ ] Aucun callback à effets de bord (e-mail, paiement, écritures inter-modèles)
- [ ] Les service/form/query objects n'existent que là où ils sont justifiés
- [ ] Requêtes N+1 prévenues (`includes`, `strict_loading`)
- [ ] Les jobs sont idempotents et mis en file après le commit
- [ ] `bin/rails zeitwerk:check` passe
- [ ] Hotwire préféré au JavaScript personnalisé
- [ ] Valeurs par défaut de Rails 8 (Solid Queue/Cache/Cable, Propshaft, importmap) conservées sauf justification
