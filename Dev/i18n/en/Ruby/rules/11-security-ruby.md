# Ruby on Rails Security Best Practices

Security is a top priority. References: **OWASP Top 10:2025**, OWASP ASVS 5.0, Rails Security Guide. Brakeman and bundler-audit run on every CI build (`bin/ci`).

> Commands run in the container: `docker compose exec app bin/brakeman`, `docker compose exec app bin/bundler-audit`.

## OWASP Top 10:2025 in Rails

| # | Category | Rails defense |
|---|----------|---------------|
| A01 | Broken Access Control (incl. SSRF) | Scope queries through the current user, policies (Pundit), deny by default |
| A02 | Security Misconfiguration | `force_ssl`, CSP initializer, `config.hosts`, generic error pages |
| A03 | Software Supply Chain Failures | `Gemfile.lock`, bundler-audit, Dependabot, SBOM, vetted gems |
| A04 | Cryptographic Failures | Encrypted credentials, Active Record Encryption, TLS, Argon2id/bcrypt |
| A05 | Injection | Parameterised queries, strong parameters, output escaping |
| A06 | Insecure Design | Threat modelling, rate limiting, least privilege |
| A07 | Authentication Failures | Built-in authentication generator, MFA, brute-force limits |
| A08 | Software or Data Integrity Failures | Signed cookies/messages, no unsafe deserialisation, signed deploys |
| A09 | Security Logging and Alerting Failures | Parameter filtering, audit logs, centralised alerts |
| A10 | Mishandling of Exceptional Conditions | `rescue_from`, no stack traces in production, fail closed |

---

## A01: Broken Access Control

### Scope Every Query Through the Owner

```ruby
# BAD: insecure direct object reference
def show
  @order = Order.find(params[:id])
end

# GOOD: only the current user's orders can be found
def show
  @order = Current.user.orders.find(params.expect(:id))
end
```

Unfound records raise `ActiveRecord::RecordNotFound` (404), which also avoids leaking existence.

### Authorization Policies (Pundit)

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

`verify_authorized` makes a forgotten check fail loudly. Apply deny-by-default at the controller base class.

### Roles

Do not trust role attributes from parameters. Never permit `:admin`, `:role` or `:user_id` in strong parameters unless the action is explicitly admin-only.

### SSRF

```ruby
# BAD: user-controlled URL fetched server-side
Net::HTTP.get(URI(params[:url]))

# GOOD: allow-list hosts, block private ranges, set timeouts
ALLOWED_HOSTS = %w[api.partner.example].freeze

def safe_fetch(raw)
  uri = URI.parse(raw)
  raise ArgumentError, "host not allowed" unless uri.scheme == "https" && ALLOWED_HOSTS.include?(uri.host)

  Net::HTTP.start(uri.host, uri.port, use_ssl: true, open_timeout: 3, read_timeout: 5) do |http|
    http.get(uri.request_uri)
  end
end
```

Resolve DNS and reject loopback, link-local and private addresses when hosts cannot be allow-listed (a dedicated gem such as `ssrf_filter` can help).

### Open Redirects

```ruby
# BAD
redirect_to params[:return_to]

# GOOD: same-host paths only
redirect_to params[:return_to], allow_other_host: false
# or
redirect_back fallback_location: root_path, allow_other_host: false
```

Rails 7+ raises `UnsafeRedirectError` for external hosts by default; never set `allow_other_host: true` with user input.

---

## A02: Security Misconfiguration

```ruby
# config/environments/production.rb
config.force_ssl = true
config.assume_ssl = true                 # Behind a TLS-terminating proxy (Thruster/Kamal proxy)
config.hosts << "app.example.com"        # Host header allow-list
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

Start with `config.content_security_policy_report_only = true`, fix violations, then enforce. Importmap and inline scripts need `javascript_importmap_tags` and `csp_meta_tag`/nonces.

### Default Headers

Rails sets `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy` and more through `config.action_dispatch.default_headers`. Review and tighten:

```ruby
config.action_dispatch.default_headers = {
  "X-Frame-Options" => "DENY",
  "X-Content-Type-Options" => "nosniff",
  "Referrer-Policy" => "strict-origin-when-cross-origin",
  "Cross-Origin-Opener-Policy" => "same-origin",
  "Permissions-Policy" => "camera=(), microphone=(), geolocation=()"
}
```

Add `Strict-Transport-Security` (set automatically by `force_ssl`), and evaluate COEP/CORP according to embedded resources.

### Error Pages

Keep `public/500.html` generic. Never render exception details in production (A10).

---

## A03: Supply Chain

```bash
docker compose exec app bin/bundler-audit check --update
docker compose exec app bin/importmap audit
docker compose exec app bin/brakeman --no-pager
```

- Commit `Gemfile.lock`; install with `BUNDLE_DEPLOYMENT=1`
- Review each new gem: maintainers, last release, downloads, open advisories
- Prefer the standard library and Rails built-ins over small single-purpose gems
- Dependabot or Renovate for weekly updates; nightly audit workflow
- SBOM (CycloneDX 1.7 JSON) at build, cosign signature for images, Trivy/Grype scan
- Pin GitHub Actions to commit SHAs

---

## A04: Cryptographic Failures

### Encrypted Credentials

```bash
docker compose exec -e EDITOR=vi app bin/rails credentials:edit --environment production
```

```ruby
Rails.application.credentials.dig(:stripe, :secret_key)
```

- `config/master.key` and `config/credentials/*.key` are in `.gitignore`; inject via `RAILS_MASTER_KEY`
- Prefer per-environment credentials files
- Rotate secrets on compromise; never log them

### Active Record Encryption

```bash
docker compose exec app bin/rails db:encryption:init    # prints keys to add to credentials
```

```ruby
class Patient < ApplicationRecord
  encrypts :national_id                       # non-deterministic, not searchable
  encrypts :email_address, deterministic: true, downcase: true  # searchable by equality
end
```

- Use non-deterministic encryption unless equality lookups are required
- Plan key rotation (`previous` keys) before the first deployment
- Encryption protects data at rest in the database, not against application-level access

### Passwords

```ruby
class User < ApplicationRecord
  has_secure_password          # bcrypt, 72-byte input limit
  validates :password, length: { minimum: 12 }, allow_nil: true
end
```

Project rule: **Argon2id is preferred for any new custom password hashing** (OWASP minimum 19 MiB memory, t=2, p=1; internal recommendation 128 MiB, t>=3). `has_secure_password` with bcrypt is the Rails default and acceptable as legacy (work factor >= 10, internal recommendation >= 12; Rails uses the minimum cost in tests only). MD5 and SHA1 are forbidden for passwords.

```ruby
# Argon2id with the argon2 gem, for custom schemes
hasher = Argon2::Password.new(t_cost: 3, m_cost: 17, p_cost: 1)   # m_cost 17 = 128 MiB (2^17 KiB)
digest = hasher.create(password)
Argon2::Password.verify_password(password, digest)
```

Follow NIST SP 800-63B-4: minimum 15 characters (single-factor; 8 with MFA), no mandatory complexity rules, no periodic rotation, allow all printable characters, check against breached-password lists.

Use `User.authenticate_by(email_address:, password:)` (timing-safe) rather than `find_by` followed by `authenticate`.

### Tokens and Signed Data

```ruby
class User < ApplicationRecord
  generates_token_for :password_reset, expires_in: 15.minutes do
    password_salt.last(10)       # token invalidates when the password changes
  end
end

token = user.generate_token_for(:password_reset)
User.find_by_token_for(:password_reset, token)
```

Use `SecureRandom.hex`/`urlsafe_base64` for random tokens and `ActiveSupport::SecurityUtils.secure_compare` for comparisons.

---

## A05: Injection

### SQL Injection

```ruby
# BAD: interpolation
User.where("email = '#{params[:email]}'")
User.where("name LIKE '%#{params[:q]}%'")
Order.order(params[:sort])
User.find_by("email = '#{email}'")

# GOOD: hash conditions, placeholders, sanitised LIKE, allow-listed order
User.where(email: params[:email])
User.where("name LIKE ?", "%#{User.sanitize_sql_like(params[:q])}%")

SORTABLE = %w[created_at total_cents].freeze
column = SORTABLE.include?(params[:sort]) ? params[:sort] : "created_at"
Order.order(column => :desc)
```

Danger zones: `where`, `order`, `group`, `pluck`, `select`, `joins`, `from`, `find_by_sql`, `connection.execute` with interpolated strings.

### Command Injection

```ruby
# BAD
system("convert #{params[:file]} out.png")
`ls #{params[:dir]}`

# GOOD: array form avoids the shell
system("convert", uploaded_path, "out.png", exception: true)
```

Avoid `eval`, `instance_eval`, `send`, `public_send`, `constantize` and `Kernel#open` with user input; use allow-lists.

```ruby
# BAD
params[:type].constantize.new
record.send(params[:method])

# GOOD
TYPES = { "invoice" => Invoice, "quote" => Quote }.freeze
TYPES.fetch(params[:type]).new
```

### Mass Assignment

```ruby
# BAD
User.create(params[:user])
User.create(params.permit!)

# GOOD
User.create(params.expect(user: %i[name email_address]))
```

`params.expect` (Rails 8) also returns 400 for wrongly shaped parameters. Never use `permit!`.

### XSS

```erb
<%# BAD: bypasses escaping %>
<%= raw @comment.body %>
<%= @comment.body.html_safe %>
<%== @comment.body %>
<div <%= raw "data-name='#{@user.name}'" %>>

<%# GOOD: escaped by default %>
<%= @comment.body %>
<%= sanitize @comment.body, tags: %w[b i em strong a], attributes: %w[href] %>
<%= tag.div data: { name: @user.name } %>
<%= link_to "Site", @user.website if @user.website.to_s.start_with?("https://") %>
```

Rules:
- Never call `html_safe`/`raw` on user-influenced strings
- Use `sanitize` with an allow-list, or Action Text (sanitises rich text)
- Validate URL schemes (`https`, `http`) for user-supplied links: `javascript:` URLs are executable
- In JavaScript contexts use `json_escape`/`to_json` rather than interpolation
- Pair with a strict CSP

### Other Injection Vectors

| Vector | Defense |
|--------|---------|
| Log injection | `config.filter_parameters`, strip newlines from logged user input |
| Header injection | Never place unvalidated input in headers/redirects |
| YAML deserialisation | `YAML.safe_load` with `permitted_classes`; never `YAML.load` on untrusted data |
| `Marshal.load` | Never on untrusted data |
| File paths | `File.basename`, `Pathname#cleanpath`, check the result stays under the root |

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

The built-in `rate_limit` stores counters in the Rails cache (Solid Cache in production); use a shared cache store in multi-server setups.

### rack-attack for Edge Throttling

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

Use `rate_limit` for per-controller rules and rack-attack for global, IP-based, or API throttling.

### Threat Modelling

Document trust boundaries, abuse cases (enumeration, scraping, credential stuffing) and mitigations for each new feature handling money, identity or personal data.

---

## A07: Authentication Failures

Prefer the Rails 8 generator for new applications:

```bash
docker compose exec app bin/rails generate authentication
```

It creates `User` (`has_secure_password`), `Session`, the `Authentication` concern, `SessionsController`, `PasswordsController` and mailers. Extend it with:

- MFA (TOTP via `rotp`, or WebAuthn/passkeys via `webauthn-ruby`) mandatory for privileged accounts
- Brute-force protection (`rate_limit`, lockout with exponential back-off)
- Session invalidation on logout and password change
- Re-authentication for sensitive operations
- Uniform error messages ("invalid email or password") and timing-safe `authenticate_by`

### Sessions and Cookies

```ruby
# config/initializers/session_store.rb
Rails.application.config.session_store :cookie_store,
  key: "_app_session",
  secure: Rails.env.production?,
  httponly: true,
  same_site: :lax,
  expire_after: 30.minutes
```

- HTTP-only, secure cookies; never store tokens in `localStorage`
- `same_site: :strict` for admin applications when workflows allow it
- Reset the session on login (`reset_session`) to prevent fixation
- Server-side sessions (database/Solid Cache) for revocation needs

### CSRF

```ruby
class ApplicationController < ActionController::Base
  protect_from_forgery with: :exception   # default in Rails
end
```

- Never disable CSRF protection for browser-facing controllers
- Keep `csrf_meta_tags` in the layout; Turbo and `form_with` include the token
- For JSON APIs using token authentication (no cookies), inherit from `ActionController::API`

### API Authentication

- Bearer tokens with short expiry, rotated refresh tokens
- JWT: pin the algorithm explicitly on verification (EdDSA preferred, then ES256; RS256 acceptable when the IdP requires it); never trust the token's `alg` header

```ruby
JWT.decode(token, public_key, true, algorithms: ["EdDSA"])
```

---

## A08: Software or Data Integrity

- Verify signatures and checksums of downloaded artefacts
- Do not deserialise untrusted data (`Marshal`, unsafe YAML); use JSON
- Signed and encrypted cookies are handled by `MessageVerifier`/`MessageEncryptor`; plan `secret_key_base` rotation with the Rails key rotation support (`config.action_dispatch.cookies_rotations`)
- Webhooks: verify signatures (HMAC) with `ActiveSupport::SecurityUtils.secure_compare`, reject stale timestamps

```ruby
def verify_signature!
  expected = OpenSSL::HMAC.hexdigest("SHA256", Rails.application.credentials.webhook_secret, request.raw_post)
  provided = request.headers["X-Signature"].to_s
  head :unauthorized unless ActiveSupport::SecurityUtils.secure_compare(expected, provided)
end
```

- CI/CD: protected branches, signed images, least-privilege deploy tokens, Kamal secrets outside version control

---

## A09: Logging and Alerting

```ruby
# config/initializers/filter_parameter_logging.rb
Rails.application.config.filter_parameters += [
  :passw, :email, :secret, :token, :_key, :crypt, :salt, :certificate, :otp, :ssn, :cvv, :cvc
]
```

Log: authentication events, permission changes, access to sensitive data, authorization failures, rate-limit triggers. Do not log passwords, tokens, full personal data or stack traces to user-facing channels.

```ruby
Rails.event.notify("auth.failed", email_hash: Digest::SHA256.hexdigest(email), ip: request.remote_ip)
```

`Rails.event` is the Rails 8.1 structured event reporter. Centralise logs, alert on repeated failures and off-hours access, and retain them for at least one year.

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

- Fail closed: on an authorization error deny access
- Never expose exception messages or stack traces in production responses
- Report exceptions to an error tracker (with parameter filtering)
- Do not `rescue Exception`; do not swallow errors silently
- Make transactional operations atomic (`transaction`) so partial failures leave consistent data

---

## File Uploads (Active Storage)

```ruby
class Document < ApplicationRecord
  has_one_attached :file

  validates :file, content_type: %w[application/pdf image/png image/jpeg],
                   size: { less_than: 10.megabytes }
end
```

(`active_storage_validations` provides the validators.) Additional rules:
- Validate content type by inspection, not by file extension
- Serve user uploads from a separate domain or with `Content-Disposition: attachment`
- Never use user-supplied filenames for storage paths
- Scan files for malware when accepting uploads from untrusted users
- Keep Active Storage's variant processing (libvips) updated

### Rails Security Patch Level (8.1.4.1, 2026-11-04)

Require Rails 8.1.4.1 or later (`gem "rails", "~> 8.1.4", ">= 8.1.4.1"`): it fixes many GHSA advisories across Active Support, Action View, Action Pack, Active Storage and Action Mailbox. Behavior changes to check when upgrading:
- `cookies_same_site_protection` now applies to every session store, not only `CookieStore`
- rails-html-sanitizer 1.7.2 or later is required; `strip_tags` and `highlight` now output `&quot;` and `&#39;` for quotes
- Conflicting `Forwarded` and `X-Forwarded-For` client addresses raise `IpSpoofAttackError` when spoof checking is on: review the proxy chain
- Active Storage ships an ImageMagick policy (mini_magick 5.1 or later); apps rendering PostScript or PDF must re-allow the `gs` delegate and needed coders in their own `policy.xml`
- ffmpeg and ffprobe are limited to common audio and video formats (extend with `config.active_storage.ffmpeg_allowed_formats`); GCS direct uploads need `x-goog-content-length-range` in the bucket CORS `responseHeader`
- An unsafe `SafeBuffer` serialized with MessagePack can no longer be read by older Rails versions: upgrade every app instance sharing a cache before rolling out

Source: https://github.com/rails/rails/releases/tag/v8.1.4.1

---

## Security Tooling in CI

```bash
docker compose exec app bin/brakeman --no-pager --exit-on-warn --exit-on-error
docker compose exec app bin/bundler-audit
docker compose exec app bin/importmap audit
```

Also consider: `trivy image` for the container, `gitleaks` for secret scanning, DAST (OWASP ZAP) on staging.

---

## Security Checklist

- [ ] Every query scoped through the current user or a policy (`verify_authorized` enabled)
- [ ] `params.expect` everywhere; no `permit!`
- [ ] No string interpolation in SQL; `order` values allow-listed
- [ ] No `html_safe` / `raw` on user input; CSP enforced
- [ ] CSRF protection active; cookies HTTP-only and secure
- [ ] `rate_limit` on login, password reset, sign-up; rack-attack for global throttling
- [ ] Credentials encrypted; master key never committed
- [ ] Sensitive columns use Active Record Encryption
- [ ] Passwords hashed with Argon2id (new custom code) or `has_secure_password` (bcrypt, legacy-acceptable)
- [ ] `force_ssl`, `config.hosts`, secure default headers
- [ ] Brakeman, bundler-audit and importmap audit green in CI
- [ ] Parameter filtering and audit logging configured
- [ ] No `constantize`, `send`, `eval`, `YAML.load`, `Marshal.load` on untrusted input
- [ ] Uploads validated by content type and size
