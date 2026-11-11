# Boas Práticas de Segurança Ruby on Rails

A segurança é uma prioridade máxima. Referências: **OWASP Top 10:2025**, OWASP ASVS 5.0, Rails Security Guide. Brakeman e bundler-audit rodam em cada build de CI (`bin/ci`).

> Os comandos rodam no container: `docker compose exec app bin/brakeman`, `docker compose exec app bin/bundler-audit`.

## OWASP Top 10:2025 no Rails

| # | Categoria | Defesa no Rails |
|---|-----------|-----------------|
| A01 | Broken Access Control (incl. SSRF) | Restringir as queries pelo usuário atual, policies (Pundit), negar por padrão |
| A02 | Security Misconfiguration | `force_ssl`, initializer de CSP, `config.hosts`, páginas de erro genéricas |
| A03 | Software Supply Chain Failures | `Gemfile.lock`, bundler-audit, Dependabot, SBOM, gems avaliadas |
| A04 | Cryptographic Failures | Credentials criptografadas, Active Record Encryption, TLS, Argon2id/bcrypt |
| A05 | Injection | Queries parametrizadas, strong parameters, escape de saída |
| A06 | Insecure Design | Threat modeling, rate limiting, menor privilégio |
| A07 | Authentication Failures | Generator de autenticação nativo, MFA, limites contra força bruta |
| A08 | Software or Data Integrity Failures | Cookies/mensagens assinados, sem desserialização insegura, deploys assinados |
| A09 | Security Logging and Alerting Failures | Filtragem de parâmetros, logs de auditoria, alertas centralizados |
| A10 | Mishandling of Exceptional Conditions | `rescue_from`, sem stack traces em produção, falhar de forma fechada |

---

## A01: Broken Access Control

### Restrinja Toda Query pelo Proprietário

```ruby
# RUIM: referência direta e insegura a objeto
def show
  @order = Order.find(params[:id])
end

# BOM: somente os pedidos do usuário atual podem ser encontrados
def show
  @order = Current.user.orders.find(params.expect(:id))
end
```

Registros não encontrados lançam `ActiveRecord::RecordNotFound` (404), o que também evita revelar sua existência.

### Policies de Autorização (Pundit)

```ruby
# frozen_string_literal: true

class OrderPolicy < ApplicationPolicy
  def show?    = owner? || user.admin?
  def update?  = owner? && record.pending?
  def destroy? = user.admin?

  class Scope < Scope
    def resolve
      user.admin? ? scope.all : scope.where(user: user)
    end
  end

  private

  def owner? = record.user_id == user.id
end

class OrdersController < ApplicationController
  after_action :verify_authorized, except: :index
  after_action :verify_policy_scoped, only: :index

  def index
    @orders = policy_scope(Order)
  end

  def show
    @order = Order.find(params.expect(:id))
    authorize @order
  end
end
```

O `verify_authorized` faz uma verificação esquecida falhar de forma ruidosa. Aplique o deny-by-default na classe base dos controllers.

### Papéis (Roles)

Não confie em atributos de papel vindos de parâmetros. Nunca permita `:admin`, `:role` ou `:user_id` nos strong parameters, a menos que a action seja explicitamente exclusiva de administradores.

### SSRF

```ruby
# RUIM: URL controlada pelo usuário buscada no servidor
Net::HTTP.get(URI(params[:url]))

# BOM: allow-list de hosts, bloquear faixas privadas, definir timeouts
ALLOWED_HOSTS = %w[api.partner.example].freeze

def safe_fetch(raw)
  uri = URI.parse(raw)
  raise ArgumentError, "host not allowed" unless uri.scheme == "https" && ALLOWED_HOSTS.include?(uri.host)

  Net::HTTP.start(uri.host, uri.port, use_ssl: true, open_timeout: 3, read_timeout: 5) do |http|
    http.get(uri.request_uri)
  end
end
```

Resolva o DNS e rejeite endereços de loopback, link-local e privados quando não for possível usar uma allow-list de hosts (uma gem dedicada como `ssrf_filter` pode ajudar).

### Open Redirects

```ruby
# RUIM
redirect_to params[:return_to]

# BOM: apenas caminhos no mesmo host
redirect_to params[:return_to], allow_other_host: false
# ou
redirect_back fallback_location: root_path, allow_other_host: false
```

O Rails 7+ lança `UnsafeRedirectError` para hosts externos por padrão; nunca defina `allow_other_host: true` com entrada do usuário.

---

## A02: Security Misconfiguration

```ruby
# config/environments/production.rb
config.force_ssl = true
config.assume_ssl = true                 # Atrás de um proxy que termina o TLS (Thruster/proxy do Kamal)
config.hosts << "app.example.com"        # Allow-list do header Host
config.consider_all_requests_local = false
config.log_level = :info
```

### Content Security Policy

```ruby
# config/initializers/content_security_policy.rb
Rails.application.configure do
  config.content_security_policy do |policy|
    policy.default_src :self
    policy.font_src    :self, :data
    policy.img_src     :self, :data
    policy.object_src  :none
    policy.script_src  :self
    policy.style_src   :self
    policy.frame_ancestors :none
    policy.base_uri    :self
    policy.form_action :self
  end

  config.content_security_policy_nonce_generator = ->(request) { request.session.id.to_s }
  config.content_security_policy_nonce_directives = %w[script-src style-src]
end
```

Comece com `config.content_security_policy_report_only = true`, corrija as violações e só então imponha a política. O importmap e os scripts inline precisam de `javascript_importmap_tags` e de `csp_meta_tag`/nonces.

### Headers Padrão

O Rails define `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy` e outros por meio de `config.action_dispatch.default_headers`. Revise e endureça:

```ruby
config.action_dispatch.default_headers = {
  "X-Frame-Options" => "DENY",
  "X-Content-Type-Options" => "nosniff",
  "Referrer-Policy" => "strict-origin-when-cross-origin",
  "Cross-Origin-Opener-Policy" => "same-origin",
  "Permissions-Policy" => "camera=(), microphone=(), geolocation=()"
}
```

Adicione `Strict-Transport-Security` (definido automaticamente por `force_ssl`) e avalie COEP/CORP conforme os recursos incorporados.

### Páginas de Erro

Mantenha `public/500.html` genérica. Nunca renderize detalhes de exceções em produção (A10).

---

## A03: Supply Chain

```bash
docker compose exec app bin/bundler-audit check --update
docker compose exec app bin/importmap audit
docker compose exec app bin/brakeman --no-pager
```

- Faça commit do `Gemfile.lock`; instale com `BUNDLE_DEPLOYMENT=1`
- Revise cada nova gem: mantenedores, último release, downloads, advisories abertos
- Prefira a biblioteca padrão e os recursos nativos do Rails a pequenas gems de propósito único
- Dependabot ou Renovate para atualizações semanais; workflow de auditoria noturno
- SBOM (CycloneDX 1.7 JSON) no build, assinatura cosign para as imagens, scan com Trivy/Grype
- Fixe as GitHub Actions em SHAs de commit

---

## A04: Cryptographic Failures

### Credentials Criptografadas

```bash
docker compose exec -e EDITOR=vi app bin/rails credentials:edit --environment production
```

```ruby
Rails.application.credentials.dig(:stripe, :secret_key)
```

- `config/master.key` e `config/credentials/*.key` estão no `.gitignore`; injete via `RAILS_MASTER_KEY`
- Prefira arquivos de credentials por ambiente
- Rotacione os segredos em caso de comprometimento; nunca os registre em log

### Active Record Encryption

```bash
docker compose exec app bin/rails db:encryption:init    # imprime as chaves a adicionar às credentials
```

```ruby
class Patient < ApplicationRecord
  encrypts :national_id                       # não determinístico, não pesquisável
  encrypts :email_address, deterministic: true, downcase: true  # pesquisável por igualdade
end
```

- Use criptografia não determinística, a menos que buscas por igualdade sejam necessárias
- Planeje a rotação de chaves (chaves `previous`) antes do primeiro deploy
- A criptografia protege os dados em repouso no banco de dados, não contra o acesso no nível da aplicação

### Senhas

```ruby
class User < ApplicationRecord
  has_secure_password          # bcrypt, limite de entrada de 72 bytes
  validates :password, length: { minimum: 12 }, allow_nil: true
end
```

Regra do projeto: **Argon2id é preferido para qualquer novo hash de senha customizado** (mínimo OWASP de 19 MiB de memória, t=2, p=1; recomendação interna de 128 MiB, t>=3). `has_secure_password` com bcrypt é o padrão do Rails e aceitável como legado (work factor >= 10, recomendação interna >= 12; o Rails usa o custo mínimo apenas nos testes). MD5 e SHA1 são proibidos para senhas.

```ruby
# Argon2id com a gem argon2, para esquemas customizados
hasher = Argon2::Password.new(t_cost: 3, m_cost: 17, p_cost: 1)   # m_cost 17 = 128 MiB (2^17 KiB)
digest = hasher.create(password)
Argon2::Password.verify_password(password, digest)
```

Siga a NIST SP 800-63B-4: mínimo de 15 caracteres (fator único; 8 com MFA), sem regras de complexidade obrigatórias, sem rotação periódica, permitir todos os caracteres imprimíveis, verificar contra listas de senhas vazadas.

Use `User.authenticate_by(email_address:, password:)` (seguro contra timing attacks) em vez de `find_by` seguido de `authenticate`.

### Tokens e Dados Assinados

```ruby
class User < ApplicationRecord
  generates_token_for :password_reset, expires_in: 15.minutes do
    password_salt.last(10)       # o token é invalidado quando a senha muda
  end
end

token = user.generate_token_for(:password_reset)
User.find_by_token_for(:password_reset, token)
```

Use `SecureRandom.hex`/`urlsafe_base64` para tokens aleatórios e `ActiveSupport::SecurityUtils.secure_compare` para comparações.

---

## A05: Injection

### SQL Injection

```ruby
# RUIM: interpolação
User.where("email = '#{params[:email]}'")
User.where("name LIKE '%#{params[:q]}%'")
Order.order(params[:sort])
User.find_by("email = '#{email}'")

# BOM: condições em hash, placeholders, LIKE sanitizado, order em allow-list
User.where(email: params[:email])
User.where("name LIKE ?", "%#{User.sanitize_sql_like(params[:q])}%")

SORTABLE = %w[created_at total_cents].freeze
column = SORTABLE.include?(params[:sort]) ? params[:sort] : "created_at"
Order.order(column => :desc)
```

Zonas de perigo: `where`, `order`, `group`, `pluck`, `select`, `joins`, `from`, `find_by_sql`, `connection.execute` com strings interpoladas.

### Command Injection

```ruby
# RUIM
system("convert #{params[:file]} out.png")
`ls #{params[:dir]}`

# BOM: a forma com array evita o shell
system("convert", uploaded_path, "out.png", exception: true)
```

Evite `eval`, `instance_eval`, `send`, `public_send`, `constantize` e `Kernel#open` com entrada do usuário; use allow-lists.

```ruby
# RUIM
params[:type].constantize.new
record.send(params[:method])

# BOM
TYPES = { "invoice" => Invoice, "quote" => Quote }.freeze
TYPES.fetch(params[:type]).new
```

### Mass Assignment

```ruby
# RUIM
User.create(params[:user])
User.create(params.permit!)

# BOM
User.create(params.expect(user: %i[name email_address]))
```

`params.expect` (Rails 8) também retorna 400 para parâmetros com formato incorreto. Nunca use `permit!`.

### XSS

```erb
<%# RUIM: contorna o escape %>
<%= raw @comment.body %>
<%= @comment.body.html_safe %>
<%== @comment.body %>
<div <%= raw "data-name='#{@user.name}'" %>>

<%# BOM: escapado por padrão %>
<%= @comment.body %>
<%= sanitize @comment.body, tags: %w[b i em strong a], attributes: %w[href] %>
<%= tag.div data: { name: @user.name } %>
<%= link_to "Site", @user.website if @user.website.to_s.start_with?("https://") %>
```

Regras:
- Nunca chame `html_safe`/`raw` em strings influenciadas pelo usuário
- Use `sanitize` com uma allow-list, ou o Action Text (que sanitiza rich text)
- Valide os esquemas de URL (`https`, `http`) em links fornecidos pelo usuário: URLs `javascript:` são executáveis
- Em contextos JavaScript, use `json_escape`/`to_json` em vez de interpolação
- Combine com uma CSP estrita

### Outros Vetores de Injection

| Vetor | Defesa |
|-------|--------|
| Log injection | `config.filter_parameters`, remover quebras de linha da entrada do usuário registrada em log |
| Header injection | Nunca colocar entrada não validada em headers/redirects |
| Desserialização de YAML | `YAML.safe_load` com `permitted_classes`; nunca `YAML.load` em dados não confiáveis |
| `Marshal.load` | Nunca em dados não confiáveis |
| Caminhos de arquivo | `File.basename`, `Pathname#cleanpath`, verificar que o resultado permanece sob a raiz |

---

## A06: Insecure Design

### Rate Limiting (Rails 8)

```ruby
class SessionsController < ApplicationController
  allow_unauthenticated_access only: %i[new create]
  rate_limit to: 10, within: 3.minutes, only: :create,
             with: -> { redirect_to new_session_path, alert: "Try again later." }
end

class PasswordsController < ApplicationController
  rate_limit to: 5, within: 1.hour, only: :create
end
```

O `rate_limit` nativo armazena os contadores no cache do Rails (Solid Cache em produção); use um cache store compartilhado em configurações com vários servidores.

### rack-attack para Throttling na Borda

```ruby
# config/initializers/rack_attack.rb
class Rack::Attack
  throttle("logins/ip", limit: 20, period: 1.minute) do |req|
    req.ip if req.path == "/session" && req.post?
  end

  throttle("api/token", limit: 300, period: 5.minutes) do |req|
    req.get_header("HTTP_AUTHORIZATION")&.then { |h| Digest::SHA256.hexdigest(h) }
  end

  blocklist("bad-bots") { |req| req.user_agent.to_s.match?(/sqlmap|nikto/i) }
end
```

Use `rate_limit` para regras por controller e rack-attack para throttling global, baseado em IP ou de APIs.

### Threat Modeling

Documente as fronteiras de confiança, os casos de abuso (enumeração, scraping, credential stuffing) e as mitigações de cada nova funcionalidade que lide com dinheiro, identidade ou dados pessoais.

---

## A07: Authentication Failures

Prefira o generator do Rails 8 em novas aplicações:

```bash
docker compose exec app bin/rails generate authentication
```

Ele cria `User` (`has_secure_password`), `Session`, o concern `Authentication`, `SessionsController`, `PasswordsController` e mailers. Estenda-o com:

- MFA (TOTP via `rotp`, ou WebAuthn/passkeys via `webauthn-ruby`) obrigatório para contas privilegiadas
- Proteção contra força bruta (`rate_limit`, bloqueio com back-off exponencial)
- Invalidação de sessão no logout e na troca de senha
- Reautenticação para operações sensíveis
- Mensagens de erro uniformes ("e-mail ou senha inválidos") e `authenticate_by` seguro contra timing attacks

### Sessões e Cookies

```ruby
# config/initializers/session_store.rb
Rails.application.config.session_store :cookie_store,
  key: "_app_session",
  secure: Rails.env.production?,
  httponly: true,
  same_site: :lax,
  expire_after: 30.minutes
```

- Cookies HTTP-only e secure; nunca armazene tokens em `localStorage`
- `same_site: :strict` para aplicações administrativas quando os fluxos permitirem
- Reinicie a sessão no login (`reset_session`) para evitar session fixation
- Sessões no servidor (banco de dados/Solid Cache) quando houver necessidade de revogação

### CSRF

```ruby
class ApplicationController < ActionController::Base
  protect_from_forgery with: :exception   # padrão no Rails
end
```

- Nunca desative a proteção CSRF em controllers voltados ao navegador
- Mantenha `csrf_meta_tags` no layout; Turbo e `form_with` incluem o token
- Para APIs JSON com autenticação por token (sem cookies), herde de `ActionController::API`

### Autenticação de API

- Bearer tokens com expiração curta, refresh tokens rotacionados
- JWT: fixe o algoritmo explicitamente na verificação (EdDSA preferido, depois ES256; RS256 aceitável quando o IdP exigir); nunca confie no header `alg` do token

```ruby
JWT.decode(token, public_key, true, algorithms: ["EdDSA"])
```

---

## A08: Software or Data Integrity

- Verifique assinaturas e checksums dos artefatos baixados
- Não desserialize dados não confiáveis (`Marshal`, YAML inseguro); use JSON
- Cookies assinados e criptografados são tratados por `MessageVerifier`/`MessageEncryptor`; planeje a rotação do `secret_key_base` com o suporte de rotação de chaves do Rails (`config.action_dispatch.cookies_rotations`)
- Webhooks: verifique as assinaturas (HMAC) com `ActiveSupport::SecurityUtils.secure_compare`, rejeite timestamps vencidos

```ruby
def verify_signature!
  expected = OpenSSL::HMAC.hexdigest("SHA256", Rails.application.credentials.webhook_secret, request.raw_post)
  provided = request.headers["X-Signature"].to_s
  head :unauthorized unless ActiveSupport::SecurityUtils.secure_compare(expected, provided)
end
```

- CI/CD: branches protegidas, imagens assinadas, tokens de deploy com menor privilégio, segredos do Kamal fora do controle de versão

---

## A09: Logging and Alerting

```ruby
# config/initializers/filter_parameter_logging.rb
Rails.application.config.filter_parameters += [
  :passw, :email, :secret, :token, :_key, :crypt, :salt, :certificate, :otp, :ssn, :cvv, :cvc
]
```

Registre em log: eventos de autenticação, mudanças de permissão, acesso a dados sensíveis, falhas de autorização, disparos de rate limit. Não registre senhas, tokens, dados pessoais completos nem stack traces em canais voltados ao usuário.

```ruby
Rails.event.notify("auth.failed", email_hash: Digest::SHA256.hexdigest(email), ip: request.remote_ip)
```

`Rails.event` é o reporter de eventos estruturados do Rails 8.1. Centralize os logs, alerte sobre falhas repetidas e acessos fora do horário, e retenha-os por pelo menos um ano.

---

## A10: Mishandling of Exceptional Conditions

```ruby
class ApplicationController < ActionController::Base
  rescue_from ActiveRecord::RecordNotFound, with: :render_not_found
  rescue_from Pundit::NotAuthorizedError, with: :render_forbidden

  private

  def render_not_found = render("errors/not_found", status: :not_found)
  def render_forbidden = render("errors/forbidden", status: :forbidden)
end
```

- Falhe de forma fechada: diante de um erro de autorização, negue o acesso
- Nunca exponha mensagens de exceção ou stack traces nas respostas de produção
- Reporte as exceções a um error tracker (com filtragem de parâmetros)
- Não faça `rescue Exception`; não engula erros silenciosamente
- Torne as operações transacionais atômicas (`transaction`) para que falhas parciais deixem os dados consistentes

---

## Upload de Arquivos (Active Storage)

```ruby
class Document < ApplicationRecord
  has_one_attached :file

  validates :file, content_type: %w[application/pdf image/png image/jpeg],
                   size: { less_than: 10.megabytes }
end
```

(`active_storage_validations` fornece os validadores.) Regras adicionais:
- Valide o content type por inspeção, não pela extensão do arquivo
- Sirva os uploads dos usuários a partir de um domínio separado ou com `Content-Disposition: attachment`
- Nunca use nomes de arquivo fornecidos pelo usuário em caminhos de armazenamento
- Escaneie os arquivos em busca de malware ao aceitar uploads de usuários não confiáveis
- Mantenha atualizado o processamento de variantes do Active Storage (libvips)

### Nível de patch de segurança do Rails (8.1.4.1, 04/11/2026)

Exigir Rails 8.1.4.1 ou superior (`gem "rails", "~> 8.1.4", ">= 8.1.4.1"`): corrige diversos avisos GHSA em Active Support, Action View, Action Pack, Active Storage e Action Mailbox. Mudanças de comportamento a verificar ao atualizar:
- `cookies_same_site_protection` agora se aplica a todos os session stores, não apenas ao `CookieStore`
- rails-html-sanitizer 1.7.2 ou superior é obrigatório; `strip_tags` e `highlight` agora produzem `&quot;` e `&#39;` para aspas
- Endereços de cliente `Forwarded` e `X-Forwarded-For` conflitantes lançam `IpSpoofAttackError` quando a verificação de spoofing está ativa: revisar a cadeia de proxies
- O Active Storage inclui uma política do ImageMagick (mini_magick 5.1 ou superior); apps que renderizam PostScript ou PDF devem reautorizar o delegate `gs` e os coders necessários no próprio `policy.xml`
- ffmpeg e ffprobe ficam limitados aos formatos de áudio e vídeo comuns (extensível via `config.active_storage.ffmpeg_allowed_formats`); uploads diretos para o GCS exigem `x-goog-content-length-range` no `responseHeader` do CORS do bucket
- Um `SafeBuffer` inseguro serializado com MessagePack não pode mais ser lido por versões antigas do Rails: atualizar todas as instâncias que compartilham um cache antes do rollout

Fonte: https://github.com/rails/rails/releases/tag/v8.1.4.1

---

## Ferramentas de Segurança no CI

```bash
docker compose exec app bin/brakeman --no-pager --exit-on-warn --exit-on-error
docker compose exec app bin/bundler-audit
docker compose exec app bin/importmap audit
```

Considere também: `trivy image` para o container, `gitleaks` para detecção de segredos, DAST (OWASP ZAP) em staging.

---

## Checklist de Segurança

- [ ] Toda query restrita pelo usuário atual ou por uma policy (`verify_authorized` habilitado)
- [ ] `params.expect` em todo lugar; nenhum `permit!`
- [ ] Nenhuma interpolação de strings em SQL; valores de `order` em allow-list
- [ ] Nenhum `html_safe` / `raw` sobre entrada do usuário; CSP imposta
- [ ] Proteção CSRF ativa; cookies HTTP-only e secure
- [ ] `rate_limit` em login, redefinição de senha e cadastro; rack-attack para throttling global
- [ ] Credentials criptografadas; chave mestra nunca commitada
- [ ] Colunas sensíveis usam Active Record Encryption
- [ ] Senhas com hash Argon2id (novo código customizado) ou `has_secure_password` (bcrypt, aceitável como legado)
- [ ] `force_ssl`, `config.hosts`, headers padrão seguros
- [ ] Brakeman, bundler-audit e importmap audit verdes no CI
- [ ] Filtragem de parâmetros e logs de auditoria configurados
- [ ] Nenhum `constantize`, `send`, `eval`, `YAML.load`, `Marshal.load` sobre entrada não confiável
- [ ] Uploads validados por content type e tamanho
