# Buenas prácticas de seguridad en Ruby on Rails

La seguridad es una prioridad absoluta. Referencias: **OWASP Top 10:2025**, OWASP ASVS 5.0, Rails Security Guide. Brakeman y bundler-audit se ejecutan en cada build de CI (`bin/ci`).

> Los comandos se ejecutan en el contenedor: `docker compose exec app bin/brakeman`, `docker compose exec app bin/bundler-audit`.

## OWASP Top 10:2025 en Rails

| # | Categoría | Defensa en Rails |
|---|-----------|------------------|
| A01 | Broken Access Control (incl. SSRF) | Acotar las consultas a través del usuario actual, policies (Pundit), denegar por defecto |
| A02 | Security Misconfiguration | `force_ssl`, initializer de CSP, `config.hosts`, páginas de error genéricas |
| A03 | Software Supply Chain Failures | `Gemfile.lock`, bundler-audit, Dependabot, SBOM, gems verificadas |
| A04 | Cryptographic Failures | Credentials cifradas, Active Record Encryption, TLS, Argon2id/bcrypt |
| A05 | Injection | Consultas parametrizadas, strong parameters, escape de la salida |
| A06 | Insecure Design | Threat modeling, rate limiting, mínimo privilegio |
| A07 | Authentication Failures | Generador de autenticación integrado, MFA, límites contra fuerza bruta |
| A08 | Software or Data Integrity Failures | Cookies/mensajes firmados, sin deserialización insegura, despliegues firmados |
| A09 | Security Logging and Alerting Failures | Filtrado de parámetros, logs de auditoría, alertas centralizadas |
| A10 | Mishandling of Exceptional Conditions | `rescue_from`, sin stack traces en producción, fallar cerrando el acceso (fail closed) |

---

## A01: Broken Access Control

### Acota cada consulta a través del propietario

```ruby
# MAL: referencia directa insegura a objetos
def show
  @order = Order.find(params[:id])
end

# BIEN: solo se pueden encontrar los pedidos del usuario actual
def show
  @order = Current.user.orders.find(params.expect(:id))
end
```

Los registros no encontrados lanzan `ActiveRecord::RecordNotFound` (404), lo que también evita revelar su existencia.

### Políticas de autorización (Pundit)

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

`verify_authorized` hace que una verificación olvidada falle de forma ruidosa. Aplica la denegación por defecto en la clase base de los controladores.

### Roles

No confíes en los atributos de rol que llegan por parámetros. Nunca permitas `:admin`, `:role` ni `:user_id` en los strong parameters salvo que la acción sea explícitamente solo para administradores.

### SSRF

```ruby
# MAL: URL controlada por el usuario obtenida desde el servidor
Net::HTTP.get(URI(params[:url]))

# BIEN: hosts en lista blanca, bloquear rangos privados, definir timeouts
ALLOWED_HOSTS = %w[api.partner.example].freeze

def safe_fetch(raw)
  uri = URI.parse(raw)
  raise ArgumentError, "host not allowed" unless uri.scheme == "https" && ALLOWED_HOSTS.include?(uri.host)

  Net::HTTP.start(uri.host, uri.port, use_ssl: true, open_timeout: 3, read_timeout: 5) do |http|
    http.get(uri.request_uri)
  end
end
```

Resuelve el DNS y rechaza las direcciones loopback, link-local y privadas cuando los hosts no puedan ponerse en lista blanca (una gem dedicada como `ssrf_filter` puede ayudar).

### Redirecciones abiertas

```ruby
# MAL
redirect_to params[:return_to]

# BIEN: solo rutas del mismo host
redirect_to params[:return_to], allow_other_host: false
# o
redirect_back fallback_location: root_path, allow_other_host: false
```

Rails 7+ lanza `UnsafeRedirectError` por defecto para hosts externos; nunca definas `allow_other_host: true` con una entrada del usuario.

---

## A02: Security Misconfiguration

```ruby
# config/environments/production.rb
config.force_ssl = true
config.assume_ssl = true                 # Detrás de un proxy que termina TLS (Thruster/proxy de Kamal)
config.hosts << "app.example.com"        # Lista blanca del header Host
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

Empieza con `config.content_security_policy_report_only = true`, corrige las violaciones y luego aplícala de forma estricta. Importmap y los scripts inline necesitan `javascript_importmap_tags` y `csp_meta_tag`/nonces.

### Headers por defecto

Rails define `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy` y más mediante `config.action_dispatch.default_headers`. Revísalos y endurécelos:

```ruby
config.action_dispatch.default_headers = {
  "X-Frame-Options" => "DENY",
  "X-Content-Type-Options" => "nosniff",
  "Referrer-Policy" => "strict-origin-when-cross-origin",
  "Cross-Origin-Opener-Policy" => "same-origin",
  "Permissions-Policy" => "camera=(), microphone=(), geolocation=()"
}
```

Añade `Strict-Transport-Security` (definido automáticamente por `force_ssl`) y evalúa COEP/CORP según los recursos incrustados.

### Páginas de error

Mantén `public/500.html` genérica. Nunca muestres detalles de excepciones en producción (A10).

---

## A03: Cadena de suministro

```bash
docker compose exec app bin/bundler-audit check --update
docker compose exec app bin/importmap audit
docker compose exec app bin/brakeman --no-pager
```

- Commitea `Gemfile.lock`; instala con `BUNDLE_DEPLOYMENT=1`
- Revisa cada gem nueva: mantenedores, última versión, descargas, avisos abiertos
- Prefiere la biblioteca estándar y las utilidades integradas de Rails a pequeñas gems de propósito único
- Dependabot o Renovate para actualizaciones semanales; workflow de auditoría nocturno
- SBOM (CycloneDX 1.7 JSON) en el build, firma con cosign para las imágenes, escaneo con Trivy/Grype
- Fija las GitHub Actions a SHAs de commit

---

## A04: Cryptographic Failures

### Credentials cifradas

```bash
docker compose exec -e EDITOR=vi app bin/rails credentials:edit --environment production
```

```ruby
Rails.application.credentials.dig(:stripe, :secret_key)
```

- `config/master.key` y `config/credentials/*.key` están en `.gitignore`; inyéctalas mediante `RAILS_MASTER_KEY`
- Prefiere archivos de credentials por entorno
- Rota los secretos ante un compromiso; nunca los registres en logs

### Active Record Encryption

```bash
docker compose exec app bin/rails db:encryption:init    # imprime las claves que hay que añadir a las credentials
```

```ruby
class Patient < ApplicationRecord
  encrypts :national_id                       # no determinista, no se puede buscar
  encrypts :email_address, deterministic: true, downcase: true  # buscable por igualdad
end
```

- Usa cifrado no determinista salvo que se necesiten búsquedas por igualdad
- Planifica la rotación de claves (claves `previous`) antes del primer despliegue
- El cifrado protege los datos en reposo en la base de datos, no frente al acceso desde la aplicación

### Contraseñas

```ruby
class User < ApplicationRecord
  has_secure_password          # bcrypt, límite de entrada de 72 bytes
  validates :password, length: { minimum: 12 }, allow_nil: true
end
```

Regla del proyecto: **se prefiere Argon2id para cualquier nuevo hash de contraseñas personalizado** (mínimo OWASP 19 MiB de memoria, t=2, p=1; recomendación interna 128 MiB, t>=3). `has_secure_password` con bcrypt es el valor por defecto de Rails y es aceptable como legado (work factor >= 10, recomendación interna >= 12; Rails usa el coste mínimo solo en los tests). MD5 y SHA1 están prohibidos para contraseñas.

```ruby
# Argon2id con la gem argon2, para esquemas personalizados
hasher = Argon2::Password.new(t_cost: 3, m_cost: 17, p_cost: 1)   # m_cost 17 = 128 MiB (2^17 KiB)
digest = hasher.create(password)
Argon2::Password.verify_password(password, digest)
```

Sigue NIST SP 800-63B-4: mínimo 12 caracteres, sin reglas de complejidad obligatorias, sin rotación periódica, permitir todos los caracteres imprimibles, comprobar contra listas de contraseñas filtradas.

Usa `User.authenticate_by(email_address:, password:)` (seguro frente a ataques de temporización) en lugar de `find_by` seguido de `authenticate`.

### Tokens y datos firmados

```ruby
class User < ApplicationRecord
  generates_token_for :password_reset, expires_in: 15.minutes do
    password_salt.last(10)       # el token se invalida cuando cambia la contraseña
  end
end

token = user.generate_token_for(:password_reset)
User.find_by_token_for(:password_reset, token)
```

Usa `SecureRandom.hex`/`urlsafe_base64` para los tokens aleatorios y `ActiveSupport::SecurityUtils.secure_compare` para las comparaciones.

---

## A05: Injection

### Inyección SQL

```ruby
# MAL: interpolación
User.where("email = '#{params[:email]}'")
User.where("name LIKE '%#{params[:q]}%'")
Order.order(params[:sort])
User.find_by("email = '#{email}'")

# BIEN: condiciones con hash, placeholders, LIKE saneado, order en lista blanca
User.where(email: params[:email])
User.where("name LIKE ?", "%#{User.sanitize_sql_like(params[:q])}%")

SORTABLE = %w[created_at total_cents].freeze
column = SORTABLE.include?(params[:sort]) ? params[:sort] : "created_at"
Order.order(column => :desc)
```

Zonas de peligro: `where`, `order`, `group`, `pluck`, `select`, `joins`, `from`, `find_by_sql`, `connection.execute` con strings interpolados.

### Inyección de comandos

```ruby
# MAL
system("convert #{params[:file]} out.png")
`ls #{params[:dir]}`

# BIEN: la forma con array evita el shell
system("convert", uploaded_path, "out.png", exception: true)
```

Evita `eval`, `instance_eval`, `send`, `public_send`, `constantize` y `Kernel#open` con entradas del usuario; usa listas blancas.

```ruby
# MAL
params[:type].constantize.new
record.send(params[:method])

# BIEN
TYPES = { "invoice" => Invoice, "quote" => Quote }.freeze
TYPES.fetch(params[:type]).new
```

### Mass assignment

```ruby
# MAL
User.create(params[:user])
User.create(params.permit!)

# BIEN
User.create(params.expect(user: %i[name email_address]))
```

`params.expect` (Rails 8) también devuelve 400 ante parámetros con una forma incorrecta. Nunca uses `permit!`.

### XSS

```erb
<%# MAL: se salta el escape %>
<%= raw @comment.body %>
<%= @comment.body.html_safe %>
<%== @comment.body %>
<div <%= raw "data-name='#{@user.name}'" %>>

<%# BIEN: escapado por defecto %>
<%= @comment.body %>
<%= sanitize @comment.body, tags: %w[b i em strong a], attributes: %w[href] %>
<%= tag.div data: { name: @user.name } %>
<%= link_to "Site", @user.website if @user.website.to_s.start_with?("https://") %>
```

Reglas:
- Nunca llames a `html_safe`/`raw` sobre strings influenciados por el usuario
- Usa `sanitize` con una lista blanca, o Action Text (sanea el texto enriquecido)
- Valida los esquemas de URL (`https`, `http`) en los enlaces aportados por el usuario: las URLs `javascript:` son ejecutables
- En contextos JavaScript usa `json_escape`/`to_json` en lugar de interpolación
- Combínalo con una CSP estricta

### Otros vectores de inyección

| Vector | Defensa |
|--------|---------|
| Inyección en logs | `config.filter_parameters`, eliminar los saltos de línea de las entradas del usuario que se registran |
| Inyección de headers | Nunca colocar entradas sin validar en headers/redirecciones |
| Deserialización YAML | `YAML.safe_load` con `permitted_classes`; nunca `YAML.load` sobre datos no confiables |
| `Marshal.load` | Nunca sobre datos no confiables |
| Rutas de archivos | `File.basename`, `Pathname#cleanpath`, comprobar que el resultado permanece bajo la raíz |

---

## A06: Insecure Design

### Rate limiting (Rails 8)

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

El `rate_limit` integrado almacena los contadores en la caché de Rails (Solid Cache en producción); usa un almacén de caché compartido en configuraciones con varios servidores.

### rack-attack para el throttling en el borde

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

Usa `rate_limit` para las reglas por controlador y rack-attack para el throttling global, por IP o de la API.

### Threat modeling

Documenta las fronteras de confianza, los casos de abuso (enumeración, scraping, credential stuffing) y las mitigaciones de cada nueva funcionalidad que maneje dinero, identidad o datos personales.

---

## A07: Authentication Failures

Prefiere el generador de Rails 8 para las aplicaciones nuevas:

```bash
docker compose exec app bin/rails generate authentication
```

Crea `User` (`has_secure_password`), `Session`, el concern `Authentication`, `SessionsController`, `PasswordsController` y los mailers. Amplíalo con:

- MFA (TOTP mediante `rotp`, o WebAuthn/passkeys mediante `webauthn-ruby`) obligatorio para las cuentas con privilegios
- Protección contra fuerza bruta (`rate_limit`, bloqueo con back-off exponencial)
- Invalidación de las sesiones al cerrar sesión y al cambiar la contraseña
- Reautenticación para las operaciones sensibles
- Mensajes de error uniformes ("email o contraseña no válidos") y `authenticate_by` seguro frente a ataques de temporización

### Sesiones y cookies

```ruby
# config/initializers/session_store.rb
Rails.application.config.session_store :cookie_store,
  key: "_app_session",
  secure: Rails.env.production?,
  httponly: true,
  same_site: :lax,
  expire_after: 30.minutes
```

- Cookies HTTP-only y secure; nunca almacenes tokens en `localStorage`
- `same_site: :strict` para aplicaciones de administración cuando los flujos lo permitan
- Reinicia la sesión al iniciar sesión (`reset_session`) para evitar la fijación de sesión
- Sesiones en el servidor (base de datos/Solid Cache) cuando se necesite revocación

### CSRF

```ruby
class ApplicationController < ActionController::Base
  protect_from_forgery with: :exception   # valor por defecto en Rails
end
```

- Nunca desactives la protección CSRF en los controladores orientados al navegador
- Mantén `csrf_meta_tags` en el layout; Turbo y `form_with` incluyen el token
- Para las APIs JSON con autenticación por token (sin cookies), hereda de `ActionController::API`

### Autenticación de API

- Bearer tokens con expiración corta, refresh tokens rotados
- JWT: fija explícitamente el algoritmo al verificar (EdDSA preferido, luego ES256; RS256 es aceptable cuando el IdP lo exige); nunca confíes en el header `alg` del token

```ruby
JWT.decode(token, public_key, true, algorithms: ["EdDSA"])
```

---

## A08: Software or Data Integrity

- Verifica las firmas y los checksums de los artefactos descargados
- No deserialices datos no confiables (`Marshal`, YAML inseguro); usa JSON
- Las cookies firmadas y cifradas las gestionan `MessageVerifier`/`MessageEncryptor`; planifica la rotación de `secret_key_base` con el soporte de rotación de claves de Rails (`config.action_dispatch.cookies_rotations`)
- Webhooks: verifica las firmas (HMAC) con `ActiveSupport::SecurityUtils.secure_compare`, rechaza las marcas de tiempo obsoletas

```ruby
def verify_signature!
  expected = OpenSSL::HMAC.hexdigest("SHA256", Rails.application.credentials.webhook_secret, request.raw_post)
  provided = request.headers["X-Signature"].to_s
  head :unauthorized unless ActiveSupport::SecurityUtils.secure_compare(expected, provided)
end
```

- CI/CD: ramas protegidas, imágenes firmadas, tokens de despliegue con mínimo privilegio, secretos de Kamal fuera del control de versiones

---

## A09: Logging y alertas

```ruby
# config/initializers/filter_parameter_logging.rb
Rails.application.config.filter_parameters += [
  :passw, :email, :secret, :token, :_key, :crypt, :salt, :certificate, :otp, :ssn, :cvv, :cvc
]
```

Registra: eventos de autenticación, cambios de permisos, acceso a datos sensibles, fallos de autorización, activaciones del rate limit. No registres contraseñas, tokens, datos personales completos ni stack traces hacia canales visibles para el usuario.

```ruby
Rails.event.notify("auth.failed", email_hash: Digest::SHA256.hexdigest(email), ip: request.remote_ip)
```

`Rails.event` es el reportero de eventos estructurados de Rails 8.1. Centraliza los logs, alerta ante fallos repetidos y accesos fuera de horario, y consérvalos al menos un año.

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

- Fallar cerrando el acceso (fail closed): ante un error de autorización, denegar el acceso
- Nunca expongas mensajes de excepción ni stack traces en las respuestas de producción
- Reporta las excepciones a un rastreador de errores (con filtrado de parámetros)
- No hagas `rescue Exception`; no te tragues los errores en silencio
- Haz atómicas las operaciones transaccionales (`transaction`) para que los fallos parciales dejen datos consistentes

---

## Subida de archivos (Active Storage)

```ruby
class Document < ApplicationRecord
  has_one_attached :file

  validates :file, content_type: %w[application/pdf image/png image/jpeg],
                   size: { less_than: 10.megabytes }
end
```

(`active_storage_validations` aporta los validadores.) Reglas adicionales:
- Valida el tipo de contenido por inspección, no por la extensión del archivo
- Sirve las subidas de los usuarios desde un dominio separado o con `Content-Disposition: attachment`
- Nunca uses nombres de archivo proporcionados por el usuario para las rutas de almacenamiento
- Escanea los archivos en busca de malware cuando aceptes subidas de usuarios no confiables
- Mantén actualizado el procesamiento de variantes de Active Storage (libvips)

### Nivel de parche de seguridad de Rails (8.1.4.1, 2026-11-04)

Exigir Rails 8.1.4.1 o superior (`gem "rails", "~> 8.1.4", ">= 8.1.4.1"`): corrige numerosos avisos GHSA en Active Support, Action View, Action Pack, Active Storage y Action Mailbox. Cambios de comportamiento a comprobar al actualizar:
- `cookies_same_site_protection` se aplica ahora a todos los session stores, no solo a `CookieStore`
- Se requiere rails-html-sanitizer 1.7.2 o superior; `strip_tags` y `highlight` producen ahora `&quot;` y `&#39;` para las comillas
- Las direcciones de cliente `Forwarded` y `X-Forwarded-For` contradictorias lanzan `IpSpoofAttackError` cuando la detección de suplantación está activa: revisar la cadena de proxies
- Active Storage incluye una política de ImageMagick (mini_magick 5.1 o superior); las aplicaciones que renderizan PostScript o PDF deben volver a permitir el delegate `gs` y los coders necesarios en su propio `policy.xml`
- ffmpeg y ffprobe quedan limitados a los formatos de audio y vídeo comunes (ampliable con `config.active_storage.ffmpeg_allowed_formats`); las subidas directas a GCS requieren `x-goog-content-length-range` en el `responseHeader` CORS del bucket
- Un `SafeBuffer` no seguro serializado con MessagePack ya no puede ser leído por versiones anteriores de Rails: actualizar todas las instancias que comparten una caché antes del despliegue

Fuente: https://github.com/rails/rails/releases/tag/v8.1.4.1

---

## Herramientas de seguridad en CI

```bash
docker compose exec app bin/brakeman --no-pager --exit-on-warn --exit-on-error
docker compose exec app bin/bundler-audit
docker compose exec app bin/importmap audit
```

Considera también: `trivy image` para el contenedor, `gitleaks` para el escaneo de secretos, DAST (OWASP ZAP) en staging.

---

## Checklist de seguridad

- [ ] Toda consulta acotada a través del usuario actual o de una policy (`verify_authorized` activado)
- [ ] `params.expect` en todas partes; sin `permit!`
- [ ] Sin interpolación de strings en SQL; valores de `order` en lista blanca
- [ ] Sin `html_safe` / `raw` sobre entradas del usuario; CSP aplicada
- [ ] Protección CSRF activa; cookies HTTP-only y secure
- [ ] `rate_limit` en login, restablecimiento de contraseña, registro; rack-attack para el throttling global
- [ ] Credentials cifradas; clave maestra nunca commiteada
- [ ] Las columnas sensibles usan Active Record Encryption
- [ ] Contraseñas hasheadas con Argon2id (código personalizado nuevo) o `has_secure_password` (bcrypt, aceptable como legado)
- [ ] `force_ssl`, `config.hosts`, headers por defecto seguros
- [ ] Brakeman, bundler-audit e importmap audit en verde en CI
- [ ] Filtrado de parámetros y logs de auditoría configurados
- [ ] Sin `constantize`, `send`, `eval`, `YAML.load`, `Marshal.load` sobre entradas no confiables
- [ ] Subidas validadas por tipo de contenido y tamaño
