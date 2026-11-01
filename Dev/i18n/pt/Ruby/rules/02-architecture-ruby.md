# Arquitetura Ruby on Rails - Rails Way e Design Clean Pragmático

## Princípios Arquiteturais

### 1. Rails Way Primeiro

O Rails 8.1 traz uma arquitetura completa e opinativa. Siga primeiro suas convenções e extraia objetos adicionais somente quando um model ou controller apresentar um problema real (tamanho, ramificações, orquestração de vários models, lógica difícil de testar).

```
app/
├── models/                    # Models Active Record: persistência, validações, regras de domínio
│   └── concerns/              # Comportamento de model coeso e reutilizável
├── controllers/               # Camada HTTP enxuta
│   └── concerns/              # Helpers de autenticação, autorização
├── services/                  # Service objects (um caso de uso, um `call`)
├── forms/                     # Form objects (entrada multi-model ou não persistida)
├── queries/                   # Query objects (leituras complexas)
├── policies/                  # Policies de autorização (Pundit) - opcional
├── jobs/                      # Classes Active Job (Solid Queue)
├── mailers/
├── channels/                  # Action Cable (Solid Cable)
├── views/                     # Templates ERB, Turbo Frames e Streams
├── helpers/
└── javascript/controllers/    # Controllers Stimulus (importmap)
config/
├── routes.rb
├── credentials.yml.enc
├── ci.rb                      # Etapas do bin/ci (Rails 8.1)
└── initializers/
db/
├── migrate/
├── schema.rb
└── seeds.rb
```

### 2. Clean Pragmático: sem camadas obrigatórias

Uma divisão em camadas hexagonal ou Clean Architecture **não é exigida** em uma aplicação Rails. O Active Record é a camada de persistência por design; envolvê-lo em repositories raramente compensa.

| Situação | Abordagem recomendada |
|----------|-----------------------|
| CRUD com regras simples | Model + controller simples |
| Regras que tocam um único registro | Métodos do model, validações, scopes |
| Workflow que abrange vários models ou sistemas externos | Service object |
| Formulário que grava vários models, ou com atributos virtuais | Form object (`ActiveModel::Model`) |
| Leitura complexa e reutilizável | Query object ou scope |
| Comportamento coeso compartilhado por vários models | Concern |
| Trabalho assíncrono ou lento | Active Job |
| Regras de autorização | Policy object (Pundit) ou concern de controller |

**Regra prática:** extraia na segunda ou terceira ocorrência do problema, não antes (KISS, YAGNI).

### 3. Direção das Dependências

```
Controllers ──> Services / Forms / Queries ──> Models ──> Banco de dados
     │                    │
     └──────> Jobs <──────┘
```

- Models nunca dependem de controllers, objetos de request ou sessões
- Use `Current` (`ActiveSupport::CurrentAttributes`) com moderação, principalmente para o usuário autenticado e metadados da requisição
- Views nunca consultam o banco de dados diretamente; carregue os dados no controller ou em um query object

---

## Controllers

Controllers fazem quatro coisas: autenticar, autorizar, delegar, responder.

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

Diretrizes:
- Apenas actions RESTful (`index show new create edit update destroy`); modele outros comportamentos como um novo resource (`resource :publication`) em vez de actions customizadas
- Use `params.expect` (Rails 8) para strong parameters
- Retorne `status: :unprocessable_entity` ao renderizar um formulário com falha e `status: :see_other` após `destroy` para que o Turbo trate a resposta
- Menos de 10 linhas por action; delegue além disso

### Concerns de controller

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

O Rails 8 traz um generator de autenticação (`bin/rails generate authentication`) que produz essa estrutura (model `Session`, concern `Authentication`, `Current`, redefinição de senha). Prefira-o a esquemas customizados em novas aplicações.

---

## Models

Models são responsáveis por persistência, validações, associações e regras de domínio de um único agregado de registros.

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

Diretrizes:
- Respalde toda validação com uma constraint no banco de dados (`null: false`, índice único, chave estrangeira)
- Prefira `enum` com valores inteiros ou strings explícitos a strings de status livres
- Prefira scopes e métodos de classe que retornem relations; mantenha-os encadeáveis
- Use callbacks apenas para preocupações do próprio registro (normalização, valores padrão, `after_create_commit` enfileirando um job). Nunca para e-mails, pagamentos ou gravações entre models
- Use `has_secure_password`, `generates_token_for` e `normalizes` para necessidades comuns

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

Use concerns para um **comportamento coeso e nomeável** (`Archivable`, `Searchable`), nunca como gaveta de bagunça para reduzir o tamanho de um arquivo.

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

Um service object encapsula um caso de uso. Um único método público (`call`), entradas explícitas, resultado explícito.

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

Diretrizes:
- Nomeie os services segundo uma ação de negócio (`Orders::Checkout`, `Subscriptions::Renew`), não segundo padrões (`OrderManager`)
- Injete colaboradores (gateway, clock) por keyword arguments com valores padrão sensatos, para facilitar os testes
- Envolva gravações em vários registros em uma `transaction`
- Retorne um objeto de resultado (`Data.define`) em vez de lançar exceções para falhas esperadas
- Não crie um service para um simples `save`

---

## Form Objects

Use `ActiveModel::Model` quando um formulário abrange vários models ou não corresponde a uma tabela.

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

Extraia leituras complexas ou reutilizáveis que não cabem em um scope.

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

Retorne sempre uma `ActiveRecord::Relation` para que quem chama possa continuar encadeando, paginando e fazendo eager loading.

---

## Jobs em Segundo Plano (Active Job + Solid Queue)

O Solid Queue é o backend padrão do Active Job no Rails 8 e usa o banco de dados como armazenamento.

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

Diretrizes:
- Passe IDs (ou registros serializáveis via GlobalID), nunca payloads grandes
- Torne os jobs **idempotentes**: eles podem rodar duas vezes
- Enfileire após o commit (`after_create_commit`, ou `perform_later` fora da transação)
- Configure filas e tarefas recorrentes em `config/queue.yml` e `config/recurring.yml`
- O Rails 8.1 adiciona job continuations para jobs longos e retomáveis; use-as em trabalhos em lote em vez de um único job gigante

---

## Hotwire (Turbo e Stimulus)

Prefira HTML renderizado no servidor com Turbo antes de escrever JavaScript customizado.

```erb
<%# app/views/articles/index.html.erb %>
<%= turbo_frame_tag "articles" do %>
  <%= render @articles %>
  <%= link_to "Next", articles_path(page: @next_page) %>
<% end %>
```

```ruby
# Broadcast com Turbo Streams (Solid Cable em produção)
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

Diretrizes:
- Um controller Stimulus por responsabilidade, estado em atributos `data-*`
- As páginas devem funcionar sem JavaScript sempre que possível (progressive enhancement)
- IDs de frames e streams derivados com `dom_id`

---

## Práticas de Active Record

### Prevenção de N+1

```ruby
# RUIM
Article.all.each { |a| puts a.author.name }

# BOM
Article.includes(:author).find_each { |a| puts a.author.name }
```

Habilite `config.active_record.strict_loading_by_default = true` em desenvolvimento para evidenciar lazy loads, ou adicione o `bullet` em desenvolvimento/teste.

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

- As migrations devem ser reversíveis (`change`, ou `up`/`down` explícitos)
- Use `strong_migrations` para evitar operações inseguras em tabelas grandes
- Nunca edite uma migration já mergeada na branch principal

### Transações e Locking

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

O Solid Cache armazena as entradas no banco de dados e é o padrão de produção do Rails 8. Use expiração baseada em chave (`cache_key_with_version`) em vez de invalidação manual.

---

## Autoloading (Zeitwerk)

- O caminho do arquivo deve corresponder à constante: `app/services/orders/checkout.rb` define `Orders::Checkout`
- Nenhum `require` para código da aplicação
- Verifique com `docker compose exec app bin/rails zeitwerk:check`
- Os diretórios sob `app/` são autoload roots automaticamente (`services`, `forms`, `queries` não precisam de configuração)

---

## Aplicações de API

Para APIs JSON, mantenha a mesma estrutura:

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

- Versione por namespace (`/api/v1`)
- Use um serializer ou `jbuilder`, nunca `render json: record` em um model que exponha colunas internas
- Retorne problem details da RFC 9457 para os erros
- Documente com OpenAPI 3.x

---

## Arquitetura de Deploy

O Rails 8 adota por padrão o Kamal 2 com o Thruster na frente do Puma, e uma única imagem de container.

```
Navegador ──> Thruster (HTTP/2, cache, compressão) ──> Puma ──> Rails
                                                          └──> Solid Queue / Cache / Cable (banco de dados)
```

- Um único `Dockerfile` gerado pelo Rails; fixe a versão do Ruby
- Configuração por variáveis de ambiente e credentials criptografadas
- `config/deploy.yml` para o Kamal; segredos em `.kamal/secrets`, nunca commitados em texto claro

---

## Checklist de Arquitetura

- [ ] Controllers são enxutos e RESTful
- [ ] Models respaldam as validações com constraints no banco de dados
- [ ] Sem callbacks com efeitos colaterais (e-mail, pagamento, gravações entre models)
- [ ] Service/form/query objects existem somente onde justificados
- [ ] Queries N+1 prevenidas (`includes`, `strict_loading`)
- [ ] Jobs são idempotentes e enfileirados após o commit
- [ ] `bin/rails zeitwerk:check` passa
- [ ] Hotwire preferido ao JavaScript customizado
- [ ] Padrões do Rails 8 (Solid Queue/Cache/Cable, Propshaft, importmap) mantidos, salvo justificativa
