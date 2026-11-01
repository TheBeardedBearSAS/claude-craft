# Security Best Practices für Ruby on Rails

Sicherheit hat höchste Priorität. Referenzen: **OWASP Top 10:2025**, OWASP ASVS 5.0, Rails Security Guide. Brakeman und bundler-audit laufen bei jedem CI-Build (`bin/ci`).

> Befehle laufen im Container: `docker compose exec app bin/brakeman`, `docker compose exec app bin/bundler-audit`.

## OWASP Top 10:2025 in Rails

| # | Kategorie | Rails-Schutzmaßnahme |
|---|-----------|----------------------|
| A01 | Broken Access Control (inkl. SSRF) | Abfragen über den aktuellen Benutzer einschränken, Policies (Pundit), Deny by Default |
| A02 | Security Misconfiguration | `force_ssl`, CSP-Initializer, `config.hosts`, generische Fehlerseiten |
| A03 | Software Supply Chain Failures | `Gemfile.lock`, bundler-audit, Dependabot, SBOM, geprüfte Gems |
| A04 | Cryptographic Failures | Verschlüsselte Credentials, Active Record Encryption, TLS, Argon2id/bcrypt |
| A05 | Injection | Parametrisierte Abfragen, Strong Parameters, Ausgabe-Escaping |
| A06 | Insecure Design | Threat Modeling, Rate Limiting, Least Privilege |
| A07 | Authentication Failures | Eingebauter Authentifizierungs-Generator, MFA, Brute-Force-Limits |
| A08 | Software or Data Integrity Failures | Signierte Cookies/Nachrichten, keine unsichere Deserialisierung, signierte Deployments |
| A09 | Security Logging and Alerting Failures | Parameterfilterung, Audit-Logs, zentralisierte Alarme |
| A10 | Mishandling of Exceptional Conditions | `rescue_from`, keine Stack Traces in Produktion, Fail Closed |

---

## A01: Broken Access Control

### Jede Abfrage über den Eigentümer einschränken

```ruby
# SCHLECHT: unsichere direkte Objektreferenz
def show
  @order = Order.find(params[:id])
end

# GUT: nur die Bestellungen des aktuellen Benutzers sind auffindbar
def show
  @order = Current.user.orders.find(params.expect(:id))
end
```

Nicht gefundene Datensätze lösen `ActiveRecord::RecordNotFound` (404) aus, was zudem verhindert, dass die Existenz preisgegeben wird.

### Autorisierungs-Policies (Pundit)

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

`verify_authorized` lässt eine vergessene Prüfung laut fehlschlagen. Deny by Default in der Basisklasse der Controller anwenden.

### Rollen

Rollenattributen aus Parametern nicht vertrauen. `:admin`, `:role` oder `:user_id` niemals in Strong Parameters erlauben, es sei denn, die Action ist ausdrücklich nur für Admins.

### SSRF

```ruby
# SCHLECHT: vom Benutzer kontrollierte URL wird serverseitig abgerufen
Net::HTTP.get(URI(params[:url]))

# GUT: Hosts per Allow-List, private Bereiche blockieren, Timeouts setzen
ALLOWED_HOSTS = %w[api.partner.example].freeze

def safe_fetch(raw)
  uri = URI.parse(raw)
  raise ArgumentError, "host not allowed" unless uri.scheme == "https" && ALLOWED_HOSTS.include?(uri.host)

  Net::HTTP.start(uri.host, uri.port, use_ssl: true, open_timeout: 3, read_timeout: 5) do |http|
    http.get(uri.request_uri)
  end
end
```

DNS auflösen und Loopback-, Link-Local- und private Adressen ablehnen, wenn Hosts nicht per Allow-List erfasst werden können (ein dediziertes Gem wie `ssrf_filter` kann helfen).

### Open Redirects

```ruby
# SCHLECHT
redirect_to params[:return_to]

# GUT: nur Pfade auf demselben Host
redirect_to params[:return_to], allow_other_host: false
# oder
redirect_back fallback_location: root_path, allow_other_host: false
```

Rails 7+ löst für externe Hosts standardmäßig `UnsafeRedirectError` aus; `allow_other_host: true` niemals mit Benutzereingaben setzen.

---

## A02: Security Misconfiguration

```ruby
# config/environments/production.rb
config.force_ssl = true
config.assume_ssl = true                 # Hinter einem TLS-terminierenden Proxy (Thruster/Kamal-Proxy)
config.hosts << "app.example.com"        # Allow-List für den Host-Header
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

Mit `config.content_security_policy_report_only = true` beginnen, Verstöße beheben und dann erzwingen. Importmap und Inline-Skripte benötigen `javascript_importmap_tags` und `csp_meta_tag`/Nonces.

### Standard-Header

Rails setzt `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy` und mehr über `config.action_dispatch.default_headers`. Prüfen und verschärfen:

```ruby
config.action_dispatch.default_headers = {
  "X-Frame-Options" => "DENY",
  "X-Content-Type-Options" => "nosniff",
  "Referrer-Policy" => "strict-origin-when-cross-origin",
  "Cross-Origin-Opener-Policy" => "same-origin",
  "Permissions-Policy" => "camera=(), microphone=(), geolocation=()"
}
```

`Strict-Transport-Security` ergänzen (wird von `force_ssl` automatisch gesetzt) und COEP/CORP je nach eingebetteten Ressourcen evaluieren.

### Fehlerseiten

`public/500.html` generisch halten. In Produktion niemals Details zu Exceptions rendern (A10).

---

## A03: Supply Chain

```bash
docker compose exec app bin/bundler-audit check --update
docker compose exec app bin/importmap audit
docker compose exec app bin/brakeman --no-pager
```

- `Gemfile.lock` einchecken; Installation mit `BUNDLE_DEPLOYMENT=1`
- Jedes neue Gem prüfen: Maintainer, letztes Release, Downloads, offene Advisories
- Standardbibliothek und Rails-Bordmittel gegenüber kleinen Gems mit nur einem Zweck bevorzugen
- Dependabot oder Renovate für wöchentliche Updates; nächtlicher Audit-Workflow
- SBOM (CycloneDX 1.7 JSON) beim Build, cosign-Signatur für Images, Trivy/Grype-Scan
- GitHub Actions auf Commit-SHAs pinnen

---

## A04: Cryptographic Failures

### Verschlüsselte Credentials

```bash
docker compose exec -e EDITOR=vi app bin/rails credentials:edit --environment production
```

```ruby
Rails.application.credentials.dig(:stripe, :secret_key)
```

- `config/master.key` und `config/credentials/*.key` stehen in der `.gitignore`; Injektion über `RAILS_MASTER_KEY`
- Credentials-Dateien pro Umgebung bevorzugen
- Secrets bei einer Kompromittierung rotieren; sie niemals loggen

### Active Record Encryption

```bash
docker compose exec app bin/rails db:encryption:init    # gibt Schlüssel aus, die in die Credentials gehören
```

```ruby
class Patient < ApplicationRecord
  encrypts :national_id                       # nicht deterministisch, nicht durchsuchbar
  encrypts :email_address, deterministic: true, downcase: true  # per Gleichheit durchsuchbar
end
```

- Nicht-deterministische Verschlüsselung verwenden, sofern keine Suchen per Gleichheit nötig sind
- Die Schlüsselrotation (`previous`-Schlüssel) vor dem ersten Deployment planen
- Verschlüsselung schützt Daten im Ruhezustand in der Datenbank, nicht vor Zugriff auf Anwendungsebene

### Passwörter

```ruby
class User < ApplicationRecord
  has_secure_password          # bcrypt, Eingabelimit 72 Byte
  validates :password, length: { minimum: 12 }, allow_nil: true
end
```

Projektregel: **Argon2id wird für jedes neue eigene Passwort-Hashing bevorzugt** (OWASP-Minimum 19 MiB Speicher, t=2, p=1; interne Empfehlung 128 MiB, t>=3). `has_secure_password` mit bcrypt ist der Rails-Standard und als Legacy akzeptabel (Work Factor >= 10, interne Empfehlung >= 12; Rails verwendet die minimalen Kosten nur in Tests). MD5 und SHA1 sind für Passwörter verboten.

```ruby
# Argon2id mit dem Gem argon2, für eigene Verfahren
hasher = Argon2::Password.new(t_cost: 3, m_cost: 17, p_cost: 1)   # m_cost 17 = 128 MiB (2^17 KiB)
digest = hasher.create(password)
Argon2::Password.verify_password(password, digest)
```

NIST SP 800-63B-4 befolgen: mindestens 12 Zeichen, keine verpflichtenden Komplexitätsregeln, keine periodische Rotation, alle druckbaren Zeichen erlauben, gegen Listen kompromittierter Passwörter prüfen.

`User.authenticate_by(email_address:, password:)` (timing-sicher) statt `find_by` gefolgt von `authenticate` verwenden.

### Tokens und signierte Daten

```ruby
class User < ApplicationRecord
  generates_token_for :password_reset, expires_in: 15.minutes do
    password_salt.last(10)       # Token wird ungültig, wenn sich das Passwort ändert
  end
end

token = user.generate_token_for(:password_reset)
User.find_by_token_for(:password_reset, token)
```

`SecureRandom.hex`/`urlsafe_base64` für zufällige Tokens und `ActiveSupport::SecurityUtils.secure_compare` für Vergleiche verwenden.

---

## A05: Injection

### SQL-Injection

```ruby
# SCHLECHT: Interpolation
User.where("email = '#{params[:email]}'")
User.where("name LIKE '%#{params[:q]}%'")
Order.order(params[:sort])
User.find_by("email = '#{email}'")

# GUT: Hash-Bedingungen, Platzhalter, bereinigtes LIKE, order per Allow-List
User.where(email: params[:email])
User.where("name LIKE ?", "%#{User.sanitize_sql_like(params[:q])}%")

SORTABLE = %w[created_at total_cents].freeze
column = SORTABLE.include?(params[:sort]) ? params[:sort] : "created_at"
Order.order(column => :desc)
```

Gefahrenzonen: `where`, `order`, `group`, `pluck`, `select`, `joins`, `from`, `find_by_sql`, `connection.execute` mit interpolierten Strings.

### Command Injection

```ruby
# SCHLECHT
system("convert #{params[:file]} out.png")
`ls #{params[:dir]}`

# GUT: die Array-Form umgeht die Shell
system("convert", uploaded_path, "out.png", exception: true)
```

`eval`, `instance_eval`, `send`, `public_send`, `constantize` und `Kernel#open` mit Benutzereingaben vermeiden; Allow-Lists verwenden.

```ruby
# SCHLECHT
params[:type].constantize.new
record.send(params[:method])

# GUT
TYPES = { "invoice" => Invoice, "quote" => Quote }.freeze
TYPES.fetch(params[:type]).new
```

### Mass Assignment

```ruby
# SCHLECHT
User.create(params[:user])
User.create(params.permit!)

# GUT
User.create(params.expect(user: %i[name email_address]))
```

`params.expect` (Rails 8) liefert außerdem 400 bei falsch aufgebauten Parametern. Niemals `permit!` verwenden.

### XSS

```erb
<%# SCHLECHT: umgeht das Escaping %>
<%= raw @comment.body %>
<%= @comment.body.html_safe %>
<%== @comment.body %>
<div <%= raw "data-name='#{@user.name}'" %>>

<%# GUT: standardmäßig escaped %>
<%= @comment.body %>
<%= sanitize @comment.body, tags: %w[b i em strong a], attributes: %w[href] %>
<%= tag.div data: { name: @user.name } %>
<%= link_to "Site", @user.website if @user.website.to_s.start_with?("https://") %>
```

Regeln:
- `html_safe`/`raw` niemals auf Strings anwenden, die von Benutzern beeinflusst sind
- `sanitize` mit einer Allow-List verwenden, oder Action Text (bereinigt Rich Text)
- URL-Schemata (`https`, `http`) bei vom Benutzer gelieferten Links validieren: `javascript:`-URLs sind ausführbar
- In JavaScript-Kontexten `json_escape`/`to_json` statt Interpolation verwenden
- Mit einer strikten CSP kombinieren

### Weitere Injection-Vektoren

| Vektor | Schutzmaßnahme |
|--------|----------------|
| Log Injection | `config.filter_parameters`, Zeilenumbrüche aus geloggten Benutzereingaben entfernen |
| Header Injection | Niemals nicht validierte Eingaben in Header/Redirects einsetzen |
| YAML-Deserialisierung | `YAML.safe_load` mit `permitted_classes`; niemals `YAML.load` auf nicht vertrauenswürdigen Daten |
| `Marshal.load` | Niemals auf nicht vertrauenswürdigen Daten |
| Dateipfade | `File.basename`, `Pathname#cleanpath`, prüfen, dass das Ergebnis unter dem Wurzelverzeichnis bleibt |

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

Das eingebaute `rate_limit` speichert Zähler im Rails-Cache (Solid Cache in Produktion); in Multi-Server-Setups einen gemeinsamen Cache-Store verwenden.

### rack-attack für Throttling am Rand

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

`rate_limit` für Regeln pro Controller und rack-attack für globales, IP-basiertes oder API-Throttling verwenden.

### Threat Modeling

Vertrauensgrenzen, Missbrauchsfälle (Enumeration, Scraping, Credential Stuffing) und Gegenmaßnahmen für jedes neue Feature dokumentieren, das mit Geld, Identität oder personenbezogenen Daten umgeht.

---

## A07: Authentication Failures

Für neue Anwendungen den Generator von Rails 8 bevorzugen:

```bash
docker compose exec app bin/rails generate authentication
```

Er erzeugt `User` (`has_secure_password`), `Session`, den `Authentication`-Concern, `SessionsController`, `PasswordsController` und Mailer. Erweitern mit:

- MFA (TOTP über `rotp`, oder WebAuthn/Passkeys über `webauthn-ruby`) verpflichtend für privilegierte Konten
- Brute-Force-Schutz (`rate_limit`, Sperre mit exponentiellem Back-off)
- Sitzungsinvalidierung bei Abmeldung und Passwortänderung
- Erneute Authentifizierung für sensible Vorgänge
- Einheitliche Fehlermeldungen ("invalid email or password") und timing-sicheres `authenticate_by`

### Sessions und Cookies

```ruby
# config/initializers/session_store.rb
Rails.application.config.session_store :cookie_store,
  key: "_app_session",
  secure: Rails.env.production?,
  httponly: true,
  same_site: :lax,
  expire_after: 30.minutes
```

- HTTP-only, Secure-Cookies; Tokens niemals in `localStorage` speichern
- `same_site: :strict` für Admin-Anwendungen, wenn die Workflows es erlauben
- Die Session bei der Anmeldung zurücksetzen (`reset_session`), um Fixation zu verhindern
- Serverseitige Sessions (Datenbank/Solid Cache) bei Bedarf an Widerruf

### CSRF

```ruby
class ApplicationController < ActionController::Base
  protect_from_forgery with: :exception   # Standard in Rails
end
```

- Den CSRF-Schutz für browserseitige Controller niemals deaktivieren
- `csrf_meta_tags` im Layout belassen; Turbo und `form_with` binden das Token ein
- Für JSON-APIs mit Token-Authentifizierung (ohne Cookies) von `ActionController::API` erben

### API-Authentifizierung

- Bearer-Tokens mit kurzer Gültigkeit, rotierte Refresh-Tokens
- JWT: Den Algorithmus bei der Verifikation explizit festlegen (EdDSA bevorzugt, dann ES256; RS256 akzeptabel, wenn der IdP es verlangt); dem `alg`-Header des Tokens niemals vertrauen

```ruby
JWT.decode(token, public_key, true, algorithms: ["EdDSA"])
```

---

## A08: Software or Data Integrity

- Signaturen und Prüfsummen heruntergeladener Artefakte verifizieren
- Keine nicht vertrauenswürdigen Daten deserialisieren (`Marshal`, unsicheres YAML); JSON verwenden
- Signierte und verschlüsselte Cookies werden von `MessageVerifier`/`MessageEncryptor` verarbeitet; die Rotation von `secret_key_base` mit der Rails-Unterstützung für Schlüsselrotation planen (`config.action_dispatch.cookies_rotations`)
- Webhooks: Signaturen (HMAC) mit `ActiveSupport::SecurityUtils.secure_compare` verifizieren, veraltete Zeitstempel ablehnen

```ruby
def verify_signature!
  expected = OpenSSL::HMAC.hexdigest("SHA256", Rails.application.credentials.webhook_secret, request.raw_post)
  provided = request.headers["X-Signature"].to_s
  head :unauthorized unless ActiveSupport::SecurityUtils.secure_compare(expected, provided)
end
```

- CI/CD: geschützte Branches, signierte Images, Deploy-Tokens mit minimalen Rechten, Kamal-Secrets außerhalb der Versionskontrolle

---

## A09: Logging und Alerting

```ruby
# config/initializers/filter_parameter_logging.rb
Rails.application.config.filter_parameters += [
  :passw, :email, :secret, :token, :_key, :crypt, :salt, :certificate, :otp, :ssn, :cvv, :cvc
]
```

Loggen: Authentifizierungsereignisse, Berechtigungsänderungen, Zugriffe auf sensible Daten, Autorisierungsfehler, ausgelöste Rate Limits. Keine Passwörter, Tokens, vollständigen personenbezogenen Daten oder Stack Traces in benutzersichtbare Kanäle loggen.

```ruby
Rails.event.notify("auth.failed", email_hash: Digest::SHA256.hexdigest(email), ip: request.remote_ip)
```

`Rails.event` ist der strukturierte Event-Reporter von Rails 8.1. Logs zentralisieren, bei wiederholten Fehlschlägen und Zugriffen außerhalb der Geschäftszeiten alarmieren und mindestens ein Jahr aufbewahren.

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

- Fail Closed: bei einem Autorisierungsfehler den Zugriff verweigern
- Exception-Meldungen oder Stack Traces niemals in Produktionsantworten preisgeben
- Exceptions an einen Error Tracker melden (mit Parameterfilterung)
- Kein `rescue Exception`; Fehler nicht stillschweigend verschlucken
- Transaktionale Vorgänge atomar gestalten (`transaction`), damit Teilfehler konsistente Daten hinterlassen

---

## Datei-Uploads (Active Storage)

```ruby
class Document < ApplicationRecord
  has_one_attached :file

  validates :file, content_type: %w[application/pdf image/png image/jpeg],
                   size: { less_than: 10.megabytes }
end
```

(`active_storage_validations` liefert die Validatoren.) Zusätzliche Regeln:
- Den Content-Type durch Inspektion validieren, nicht anhand der Dateiendung
- Uploads von Benutzern von einer separaten Domain oder mit `Content-Disposition: attachment` ausliefern
- Niemals vom Benutzer gelieferte Dateinamen für Speicherpfade verwenden
- Dateien auf Malware scannen, wenn Uploads von nicht vertrauenswürdigen Benutzern angenommen werden
- Die Variantenverarbeitung von Active Storage (libvips) aktuell halten

---

## Sicherheitswerkzeuge in der CI

```bash
docker compose exec app bin/brakeman --no-pager --exit-on-warn --exit-on-error
docker compose exec app bin/bundler-audit
docker compose exec app bin/importmap audit
```

Ebenfalls erwägen: `trivy image` für den Container, `gitleaks` für das Scannen auf Secrets, DAST (OWASP ZAP) auf Staging.

---

## Sicherheits-Checkliste

- [ ] Jede Abfrage über den aktuellen Benutzer oder eine Policy eingeschränkt (`verify_authorized` aktiviert)
- [ ] Überall `params.expect`; kein `permit!`
- [ ] Keine String-Interpolation in SQL; `order`-Werte per Allow-List
- [ ] Kein `html_safe` / `raw` auf Benutzereingaben; CSP erzwungen
- [ ] CSRF-Schutz aktiv; Cookies HTTP-only und Secure
- [ ] `rate_limit` bei Login, Passwort-Reset, Registrierung; rack-attack für globales Throttling
- [ ] Credentials verschlüsselt; Master Key niemals eingecheckt
- [ ] Sensible Spalten nutzen Active Record Encryption
- [ ] Passwörter mit Argon2id gehasht (neuer eigener Code) oder `has_secure_password` (bcrypt, als Legacy akzeptabel)
- [ ] `force_ssl`, `config.hosts`, sichere Standard-Header
- [ ] Brakeman, bundler-audit und importmap audit in der CI grün
- [ ] Parameterfilterung und Audit-Logging konfiguriert
- [ ] Kein `constantize`, `send`, `eval`, `YAML.load`, `Marshal.load` auf nicht vertrauenswürdigen Eingaben
- [ ] Uploads nach Content-Type und Größe validiert
