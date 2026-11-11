# Bonnes Pratiques de Sécurité Ruby on Rails

La sécurité est une priorité absolue. Références : **OWASP Top 10:2025**, OWASP ASVS 5.0, Rails Security Guide. Brakeman et bundler-audit s'exécutent à chaque build de CI (`bin/ci`).

> Les commandes s'exécutent dans le conteneur : `docker compose exec app bin/brakeman`, `docker compose exec app bin/bundler-audit`.

## OWASP Top 10:2025 dans Rails

| # | Catégorie | Défense Rails |
|---|-----------|---------------|
| A01 | Contrôle d'accès défaillant (dont SSRF) | Restreindre les requêtes via l'utilisateur courant, policies (Pundit), refus par défaut |
| A02 | Mauvaise configuration de sécurité | `force_ssl`, initializer CSP, `config.hosts`, pages d'erreur génériques |
| A03 | Défaillances de la chaîne d'approvisionnement logicielle | `Gemfile.lock`, bundler-audit, Dependabot, SBOM, gems vérifiées |
| A04 | Défaillances cryptographiques | Credentials chiffrés, Active Record Encryption, TLS, Argon2id/bcrypt |
| A05 | Injection | Requêtes paramétrées, strong parameters, échappement des sorties |
| A06 | Conception non sécurisée | Modélisation des menaces, limitation de débit, moindre privilège |
| A07 | Défaillances d'authentification | Générateur d'authentification intégré, MFA, limites anti force brute |
| A08 | Défaillances d'intégrité des logiciels ou des données | Cookies/messages signés, aucune désérialisation dangereuse, déploiements signés |
| A09 | Défaillances de journalisation et d'alerte | Filtrage des paramètres, journaux d'audit, alertes centralisées |
| A10 | Mauvaise gestion des conditions exceptionnelles | `rescue_from`, aucune stack trace en production, échec fermé |

---

## A01 : Contrôle d'accès défaillant

### Restreindre chaque requête via le propriétaire

```ruby
# MAUVAIS : référence directe non sécurisée à un objet
def show
  @order = Order.find(params[:id])
end

# BON : seules les commandes de l'utilisateur courant peuvent être trouvées
def show
  @order = Current.user.orders.find(params.expect(:id))
end
```

Les enregistrements introuvables lèvent `ActiveRecord::RecordNotFound` (404), ce qui évite aussi de révéler leur existence.

### Politiques d'autorisation (Pundit)

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

`verify_authorized` fait échouer bruyamment une vérification oubliée. Appliquer le refus par défaut dans la classe de base des contrôleurs.

### Rôles

Ne pas faire confiance aux attributs de rôle venant des paramètres. Ne jamais autoriser `:admin`, `:role` ou `:user_id` dans les strong parameters, sauf si l'action est explicitement réservée aux administrateurs.

### SSRF

```ruby
# MAUVAIS : URL contrôlée par l'utilisateur récupérée côté serveur
Net::HTTP.get(URI(params[:url]))

# BON : liste blanche d'hôtes, bloquer les plages privées, définir des timeouts
ALLOWED_HOSTS = %w[api.partner.example].freeze

def safe_fetch(raw)
  uri = URI.parse(raw)
  raise ArgumentError, "host not allowed" unless uri.scheme == "https" && ALLOWED_HOSTS.include?(uri.host)

  Net::HTTP.start(uri.host, uri.port, use_ssl: true, open_timeout: 3, read_timeout: 5) do |http|
    http.get(uri.request_uri)
  end
end
```

Résoudre le DNS et rejeter les adresses de loopback, link-local et privées lorsque les hôtes ne peuvent pas être mis en liste blanche (une gem dédiée comme `ssrf_filter` peut aider).

### Redirections ouvertes

```ruby
# MAUVAIS
redirect_to params[:return_to]

# BON : chemins du même hôte uniquement
redirect_to params[:return_to], allow_other_host: false
# ou
redirect_back fallback_location: root_path, allow_other_host: false
```

Rails 7+ lève `UnsafeRedirectError` pour les hôtes externes par défaut ; ne jamais définir `allow_other_host: true` avec une saisie utilisateur.

---

## A02 : Mauvaise configuration de sécurité

```ruby
# config/environments/production.rb
config.force_ssl = true
config.assume_ssl = true                 # Derrière un proxy terminant le TLS (Thruster/proxy Kamal)
config.hosts << "app.example.com"        # Liste blanche de l'en-tête Host
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

Commencer avec `config.content_security_policy_report_only = true`, corriger les violations, puis appliquer. Importmap et les scripts inline nécessitent `javascript_importmap_tags` et `csp_meta_tag`/nonces.

### En-têtes par défaut

Rails définit `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy` et d'autres via `config.action_dispatch.default_headers`. Les examiner et les durcir :

```ruby
config.action_dispatch.default_headers = {
  "X-Frame-Options" => "DENY",
  "X-Content-Type-Options" => "nosniff",
  "Referrer-Policy" => "strict-origin-when-cross-origin",
  "Cross-Origin-Opener-Policy" => "same-origin",
  "Permissions-Policy" => "camera=(), microphone=(), geolocation=()"
}
```

Ajouter `Strict-Transport-Security` (défini automatiquement par `force_ssl`), et évaluer COEP/CORP selon les ressources embarquées.

### Pages d'erreur

Garder `public/500.html` générique. Ne jamais afficher les détails d'une exception en production (A10).

---

## A03 : Chaîne d'approvisionnement

```bash
docker compose exec app bin/bundler-audit check --update
docker compose exec app bin/importmap audit
docker compose exec app bin/brakeman --no-pager
```

- Commiter `Gemfile.lock` ; installer avec `BUNDLE_DEPLOYMENT=1`
- Examiner chaque nouvelle gem : mainteneurs, dernière version, téléchargements, avis ouverts
- Préférer la bibliothèque standard et les fonctionnalités intégrées de Rails aux petites gems à usage unique
- Dependabot ou Renovate pour des mises à jour hebdomadaires ; workflow d'audit nocturne
- SBOM (CycloneDX 1.7 JSON) au build, signature cosign des images, scan Trivy/Grype
- Épingler les GitHub Actions sur des SHA de commit

---

## A04 : Défaillances cryptographiques

### Credentials chiffrés

```bash
docker compose exec -e EDITOR=vi app bin/rails credentials:edit --environment production
```

```ruby
Rails.application.credentials.dig(:stripe, :secret_key)
```

- `config/master.key` et `config/credentials/*.key` sont dans `.gitignore` ; les injecter via `RAILS_MASTER_KEY`
- Préférer des fichiers de credentials par environnement
- Renouveler les secrets en cas de compromission ; ne jamais les journaliser

### Active Record Encryption

```bash
docker compose exec app bin/rails db:encryption:init    # affiche les clés à ajouter aux credentials
```

```ruby
class Patient < ApplicationRecord
  encrypts :national_id                       # non déterministe, non recherchable
  encrypts :email_address, deterministic: true, downcase: true  # recherchable par égalité
end
```

- Utiliser le chiffrement non déterministe sauf si des recherches par égalité sont nécessaires
- Prévoir la rotation des clés (clés `previous`) avant le premier déploiement
- Le chiffrement protège les données au repos en base de données, pas contre un accès au niveau applicatif

### Mots de passe

```ruby
class User < ApplicationRecord
  has_secure_password          # bcrypt, limite d'entrée de 72 octets
  validates :password, length: { minimum: 12 }, allow_nil: true
end
```

Règle du projet : **Argon2id est préféré pour tout nouveau hachage de mot de passe sur mesure** (minimum OWASP 19 MiB de mémoire, t=2, p=1 ; recommandation interne 128 MiB, t>=3). `has_secure_password` avec bcrypt est le défaut de Rails et acceptable en legacy (work factor >= 10, recommandation interne >= 12 ; Rails n'utilise le coût minimal que dans les tests). MD5 et SHA1 sont interdits pour les mots de passe.

```ruby
# Argon2id avec la gem argon2, pour les schémas sur mesure
hasher = Argon2::Password.new(t_cost: 3, m_cost: 17, p_cost: 1)   # m_cost 17 = 128 MiB (2^17 KiB)
digest = hasher.create(password)
Argon2::Password.verify_password(password, digest)
```

Suivre NIST SP 800-63B-4 : 15 caractères minimum (facteur unique ; 8 avec MFA), aucune règle de complexité obligatoire, aucune rotation périodique, autoriser tous les caractères imprimables, vérifier par rapport aux listes de mots de passe compromis.

Utiliser `User.authenticate_by(email_address:, password:)` (résistant aux attaques temporelles) plutôt que `find_by` suivi de `authenticate`.

### Tokens et données signées

```ruby
class User < ApplicationRecord
  generates_token_for :password_reset, expires_in: 15.minutes do
    password_salt.last(10)       # le token est invalidé lorsque le mot de passe change
  end
end

token = user.generate_token_for(:password_reset)
User.find_by_token_for(:password_reset, token)
```

Utiliser `SecureRandom.hex`/`urlsafe_base64` pour les tokens aléatoires et `ActiveSupport::SecurityUtils.secure_compare` pour les comparaisons.

---

## A05 : Injection

### Injection SQL

```ruby
# MAUVAIS : interpolation
User.where("email = '#{params[:email]}'")
User.where("name LIKE '%#{params[:q]}%'")
Order.order(params[:sort])
User.find_by("email = '#{email}'")

# BON : conditions en hash, placeholders, LIKE assaini, order en liste blanche
User.where(email: params[:email])
User.where("name LIKE ?", "%#{User.sanitize_sql_like(params[:q])}%")

SORTABLE = %w[created_at total_cents].freeze
column = SORTABLE.include?(params[:sort]) ? params[:sort] : "created_at"
Order.order(column => :desc)
```

Zones dangereuses : `where`, `order`, `group`, `pluck`, `select`, `joins`, `from`, `find_by_sql`, `connection.execute` avec des chaînes interpolées.

### Injection de commandes

```ruby
# MAUVAIS
system("convert #{params[:file]} out.png")
`ls #{params[:dir]}`

# BON : la forme tableau évite le shell
system("convert", uploaded_path, "out.png", exception: true)
```

Éviter `eval`, `instance_eval`, `send`, `public_send`, `constantize` et `Kernel#open` avec une saisie utilisateur ; utiliser des listes blanches.

```ruby
# MAUVAIS
params[:type].constantize.new
record.send(params[:method])

# BON
TYPES = { "invoice" => Invoice, "quote" => Quote }.freeze
TYPES.fetch(params[:type]).new
```

### Mass assignment

```ruby
# MAUVAIS
User.create(params[:user])
User.create(params.permit!)

# BON
User.create(params.expect(user: %i[name email_address]))
```

`params.expect` (Rails 8) retourne aussi 400 pour des paramètres de forme incorrecte. Ne jamais utiliser `permit!`.

### XSS

```erb
<%# MAUVAIS : contourne l'échappement %>
<%= raw @comment.body %>
<%= @comment.body.html_safe %>
<%== @comment.body %>
<div <%= raw "data-name='#{@user.name}'" %>>

<%# BON : échappé par défaut %>
<%= @comment.body %>
<%= sanitize @comment.body, tags: %w[b i em strong a], attributes: %w[href] %>
<%= tag.div data: { name: @user.name } %>
<%= link_to "Site", @user.website if @user.website.to_s.start_with?("https://") %>
```

Règles :
- Ne jamais appeler `html_safe`/`raw` sur des chaînes influencées par l'utilisateur
- Utiliser `sanitize` avec une liste blanche, ou Action Text (assainit le texte riche)
- Valider les schémas d'URL (`https`, `http`) pour les liens fournis par l'utilisateur : les URL `javascript:` sont exécutables
- Dans les contextes JavaScript, utiliser `json_escape`/`to_json` plutôt que l'interpolation
- Associer à une CSP stricte

### Autres vecteurs d'injection

| Vecteur | Défense |
|---------|---------|
| Injection dans les logs | `config.filter_parameters`, retirer les retours à la ligne des saisies utilisateur journalisées |
| Injection d'en-têtes | Ne jamais placer une saisie non validée dans les en-têtes/redirections |
| Désérialisation YAML | `YAML.safe_load` avec `permitted_classes` ; jamais `YAML.load` sur des données non fiables |
| `Marshal.load` | Jamais sur des données non fiables |
| Chemins de fichiers | `File.basename`, `Pathname#cleanpath`, vérifier que le résultat reste sous la racine |

---

## A06 : Conception non sécurisée

### Limitation de débit (Rails 8)

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

Le `rate_limit` intégré stocke les compteurs dans le cache Rails (Solid Cache en production) ; utiliser un cache partagé dans les configurations multi-serveurs.

### rack-attack pour la limitation en périphérie

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

Utiliser `rate_limit` pour les règles par contrôleur et rack-attack pour la limitation globale, par IP ou pour les API.

### Modélisation des menaces

Documenter les frontières de confiance, les cas d'abus (énumération, scraping, credential stuffing) et les mesures d'atténuation pour chaque nouvelle fonctionnalité traitant de l'argent, de l'identité ou des données personnelles.

---

## A07 : Défaillances d'authentification

Préférer le générateur de Rails 8 pour les nouvelles applications :

```bash
docker compose exec app bin/rails generate authentication
```

Il crée `User` (`has_secure_password`), `Session`, le concern `Authentication`, `SessionsController`, `PasswordsController` et les mailers. L'étendre avec :

- MFA (TOTP via `rotp`, ou WebAuthn/passkeys via `webauthn-ruby`) obligatoire pour les comptes privilégiés
- Protection contre la force brute (`rate_limit`, verrouillage avec back-off exponentiel)
- Invalidation des sessions à la déconnexion et au changement de mot de passe
- Ré-authentification pour les opérations sensibles
- Messages d'erreur uniformes (« e-mail ou mot de passe invalide ») et `authenticate_by` résistant aux attaques temporelles

### Sessions et cookies

```ruby
# config/initializers/session_store.rb
Rails.application.config.session_store :cookie_store,
  key: "_app_session",
  secure: Rails.env.production?,
  httponly: true,
  same_site: :lax,
  expire_after: 30.minutes
```

- Cookies HTTP-only et secure ; ne jamais stocker de tokens dans `localStorage`
- `same_site: :strict` pour les applications d'administration lorsque les workflows le permettent
- Réinitialiser la session à la connexion (`reset_session`) pour prévenir la fixation
- Sessions côté serveur (base de données/Solid Cache) pour les besoins de révocation

### CSRF

```ruby
class ApplicationController < ActionController::Base
  protect_from_forgery with: :exception   # défaut dans Rails
end
```

- Ne jamais désactiver la protection CSRF pour les contrôleurs exposés aux navigateurs
- Garder `csrf_meta_tags` dans le layout ; Turbo et `form_with` incluent le token
- Pour les API JSON utilisant une authentification par token (sans cookies), hériter de `ActionController::API`

### Authentification d'API

- Bearer tokens à courte durée de vie, refresh tokens avec rotation
- JWT : épingler explicitement l'algorithme à la vérification (EdDSA préféré, puis ES256 ; RS256 acceptable lorsque l'IdP l'impose) ; ne jamais se fier à l'en-tête `alg` du token

```ruby
JWT.decode(token, public_key, true, algorithms: ["EdDSA"])
```

---

## A08 : Intégrité des logiciels ou des données

- Vérifier les signatures et les sommes de contrôle des artefacts téléchargés
- Ne pas désérialiser de données non fiables (`Marshal`, YAML dangereux) ; utiliser JSON
- Les cookies signés et chiffrés sont gérés par `MessageVerifier`/`MessageEncryptor` ; planifier la rotation de `secret_key_base` avec la prise en charge de la rotation de clés de Rails (`config.action_dispatch.cookies_rotations`)
- Webhooks : vérifier les signatures (HMAC) avec `ActiveSupport::SecurityUtils.secure_compare`, rejeter les horodatages périmés

```ruby
def verify_signature!
  expected = OpenSSL::HMAC.hexdigest("SHA256", Rails.application.credentials.webhook_secret, request.raw_post)
  provided = request.headers["X-Signature"].to_s
  head :unauthorized unless ActiveSupport::SecurityUtils.secure_compare(expected, provided)
end
```

- CI/CD : branches protégées, images signées, tokens de déploiement au moindre privilège, secrets Kamal hors du contrôle de version

---

## A09 : Journalisation et alertes

```ruby
# config/initializers/filter_parameter_logging.rb
Rails.application.config.filter_parameters += [
  :passw, :email, :secret, :token, :_key, :crypt, :salt, :certificate, :otp, :ssn, :cvv, :cvc
]
```

Journaliser : événements d'authentification, changements de permissions, accès aux données sensibles, échecs d'autorisation, déclenchements de limites de débit. Ne pas journaliser les mots de passe, les tokens, les données personnelles complètes ni les stack traces vers des canaux exposés aux utilisateurs.

```ruby
Rails.event.notify("auth.failed", email_hash: Digest::SHA256.hexdigest(email), ip: request.remote_ip)
```

`Rails.event` est le rapporteur d'événements structurés de Rails 8.1. Centraliser les logs, alerter sur les échecs répétés et les accès hors horaires, et les conserver au moins un an.

---

## A10 : Mauvaise gestion des conditions exceptionnelles

```ruby
class ApplicationController < ActionController::Base
  rescue_from ActiveRecord::RecordNotFound, with: :render_not_found
  rescue_from Pundit::NotAuthorizedError, with: :render_forbidden

  private

  def render_not_found = render("errors/not_found", status: :not_found)
  def render_forbidden = render("errors/forbidden", status: :forbidden)
end
```

- Échec fermé : en cas d'erreur d'autorisation, refuser l'accès
- Ne jamais exposer les messages d'exception ni les stack traces dans les réponses de production
- Remonter les exceptions à un outil de suivi d'erreurs (avec filtrage des paramètres)
- Ne pas faire de `rescue Exception` ; ne pas avaler les erreurs en silence
- Rendre les opérations transactionnelles atomiques (`transaction`) pour que les échecs partiels laissent des données cohérentes

---

## Téléversement de fichiers (Active Storage)

```ruby
class Document < ApplicationRecord
  has_one_attached :file

  validates :file, content_type: %w[application/pdf image/png image/jpeg],
                   size: { less_than: 10.megabytes }
end
```

(`active_storage_validations` fournit les validateurs.) Règles supplémentaires :
- Valider le type de contenu par inspection, pas par l'extension du fichier
- Servir les fichiers téléversés depuis un domaine séparé ou avec `Content-Disposition: attachment`
- Ne jamais utiliser les noms de fichiers fournis par l'utilisateur pour les chemins de stockage
- Scanner les fichiers à la recherche de malwares lorsque des téléversements viennent d'utilisateurs non fiables
- Garder à jour le traitement des variantes d'Active Storage (libvips)

### Niveau de correctif de sécurité Rails (8.1.4.1, 2026-11-04)

Exiger Rails 8.1.4.1 ou supérieur (`gem "rails", "~> 8.1.4", ">= 8.1.4.1"`) : cette version corrige de nombreux avis GHSA dans Active Support, Action View, Action Pack, Active Storage et Action Mailbox. Changements de comportement à vérifier lors de la mise à jour :
- `cookies_same_site_protection` s'applique désormais à tous les session stores, pas seulement à `CookieStore`
- rails-html-sanitizer 1.7.2 ou supérieur est requis ; `strip_tags` et `highlight` produisent désormais `&quot;` et `&#39;` pour les guillemets
- Des adresses client `Forwarded` et `X-Forwarded-For` contradictoires lèvent `IpSpoofAttackError` quand la détection d'usurpation est active : revoir la chaîne de proxys
- Active Storage fournit une politique ImageMagick (mini_magick 5.1 ou supérieur) ; les applications qui rendent du PostScript ou du PDF doivent réautoriser le delegate `gs` et les coders nécessaires dans leur propre `policy.xml`
- ffmpeg et ffprobe sont limités aux formats audio et vidéo courants (extensible via `config.active_storage.ffmpeg_allowed_formats`) ; les uploads directs GCS exigent `x-goog-content-length-range` dans le `responseHeader` CORS du bucket
- Un `SafeBuffer` non sûr sérialisé en MessagePack n'est plus lisible par les anciennes versions de Rails : mettre à jour toutes les instances partageant un cache avant le déploiement

Source : https://github.com/rails/rails/releases/tag/v8.1.4.1

---

## Outillage de sécurité en CI

```bash
docker compose exec app bin/brakeman --no-pager --exit-on-warn --exit-on-error
docker compose exec app bin/bundler-audit
docker compose exec app bin/importmap audit
```

À envisager également : `trivy image` pour le conteneur, `gitleaks` pour la détection de secrets, DAST (OWASP ZAP) sur la préproduction.

---

## Checklist de sécurité

- [ ] Chaque requête restreinte via l'utilisateur courant ou une policy (`verify_authorized` activé)
- [ ] `params.expect` partout ; aucun `permit!`
- [ ] Aucune interpolation de chaîne dans le SQL ; valeurs de `order` en liste blanche
- [ ] Aucun `html_safe` / `raw` sur une saisie utilisateur ; CSP appliquée
- [ ] Protection CSRF active ; cookies HTTP-only et secure
- [ ] `rate_limit` sur la connexion, la réinitialisation de mot de passe, l'inscription ; rack-attack pour la limitation globale
- [ ] Credentials chiffrés ; clé maître jamais commitée
- [ ] Les colonnes sensibles utilisent Active Record Encryption
- [ ] Mots de passe hachés avec Argon2id (nouveau code sur mesure) ou `has_secure_password` (bcrypt, acceptable en legacy)
- [ ] `force_ssl`, `config.hosts`, en-têtes par défaut sécurisés
- [ ] Brakeman, bundler-audit et importmap audit au vert en CI
- [ ] Filtrage des paramètres et journalisation d'audit configurés
- [ ] Aucun `constantize`, `send`, `eval`, `YAML.load`, `Marshal.load` sur une entrée non fiable
- [ ] Téléversements validés par type de contenu et taille
