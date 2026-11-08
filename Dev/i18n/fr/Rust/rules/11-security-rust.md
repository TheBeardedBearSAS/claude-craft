# Bonnes Pratiques de Sécurité Rust / Axum

La sécurité est une priorité absolue. Références : **OWASP Top 10:2025**, OWASP ASVS 5.0, advisories RustSec. Rust élimine des classes entières de bugs de sûreté mémoire, mais pas les failles logiques, l'injection, le contrôle d'accès défaillant ni le risque supply chain. cargo-deny et cargo-audit s'exécutent à chaque build CI.

> Les commandes s'exécutent dans le conteneur : `docker compose exec app cargo deny check`, `docker compose exec app cargo audit`.

## OWASP Top 10:2025 en Rust / Axum

| # | Catégorie | Défense Rust / Axum |
|---|-----------|---------------------|
| A01 | Contrôle d'accès défaillant (SSRF inclus) | Cloisonner chaque requête par le principal authentifié, extractor d'authentification typé, refus par défaut, liste blanche des hôtes sortants |
| A02 | Mauvaise configuration de sécurité | Couche d'en-têtes de sécurité, origines CORS explicites, TLS en bordure, corps d'erreur génériques, aucun endpoint de debug |
| A03 | Défaillances de la chaîne d'approvisionnement logicielle | `Cargo.lock` versionné, cargo-deny, cargo-audit, cargo-vet, SBOM (cargo-cyclonedx), actions CI épinglées |
| A04 | Défaillances cryptographiques | Argon2id, JWT EdDSA, `rustls`, `secrecy`, CSPRNG de l'OS (`OsRng`), aucune cryptographie maison |
| A05 | Injection | Paramètres liés SQLx, désérialisation typée, validation (validator / garde), aucune interpolation dans un shell |
| A06 | Conception non sécurisée | Modélisation des menaces, rate limiting, limites de corps, timeouts, moindre privilège |
| A07 | Défaillances d'authentification | Argon2id, MFA, limites anti-brute-force (tower_governor), jetons à courte durée de vie, invalidation de session |
| A08 | Défaillances d'intégrité des logiciels ou des données | Signatures vérifiées, `deny_unknown_fields`, images et artefacts signés, aucune désérialisation dangereuse de formats non fiables |
| A09 | Défaillances de journalisation et d'alerte | `tracing` avec identifiants de requête, masquage des secrets, événements d'audit, alertes centralisées |
| A10 | Mauvaise gestion des conditions exceptionnelles | `Result` partout, aucun panic sur les chemins de requête, `AppError` avec corps génériques, échec fermé |

---

## Sûreté mémoire et `unsafe`

```rust
#![forbid(unsafe_code)]
```

- Interdisez `unsafe` dans les crates applicatives via `[workspace.lints.rust] unsafe_code = "forbid"`
- Un panic est une primitive de déni de service : pas de `unwrap()` / `expect()` / indexation sur les chemins de requête (`clippy::unwrap_used = "deny"`)
- Le dépassement d'entier boucle (wrap) en build release : utilisez l'arithmétique `checked_*` / `saturating_*` pour l'argent et les quantités, ou activez `overflow-checks = true` dans le profil release
- `cargo geiger` (ou `cargo tree`) montre l'`unsafe` dans les dépendances ; préférez des crates bien auditées

---

## A01 : Contrôle d'accès défaillant

### Cloisonner chaque requête par le principal

```rust
// BAD: insecure direct object reference
async fn show(State(s): State<AppState>, Path(id): Path<Uuid>) -> Result<Json<Order>, AppError> {
    Ok(Json(s.orders.find(id).await?.ok_or(AppError::NotFound)?))
}

// GOOD: only the caller's orders can be found
async fn show(
    State(s): State<AppState>,
    auth: AuthenticatedUser,
    Path(id): Path<Uuid>,
) -> Result<Json<Order>, AppError> {
    let order = s.orders.find_for_user(id, auth.user_id).await?.ok_or(AppError::NotFound)?;
    Ok(Json(order))
}
```

Renvoyer `404` pour les enregistrements appartenant à quelqu'un d'autre évite de divulguer leur existence.

### Authentification et autorisation typées

- Les handlers protégés déclarent un extractor `AuthenticatedUser` ; une route qui en est dépourvue est publique par construction, donc relisez chaque route publique
- Contrôles de rôle via un extractor typé ou une fonction de politique, jamais via une chaîne de rôle issue du corps de la requête
- N'acceptez jamais `role`, `is_admin` ou `user_id` depuis les payloads clients : les DTO sont distincts des types du domaine et omettent les champs privilégiés
- Refus par défaut : appliquez une couche d'authentification à tout le router protégé et montez les routes publiques séparément

### SSRF

```rust
// BAD: user-controlled URL fetched server-side
let body = reqwest::get(&params.url).await?.text().await?;

// GOOD: allow-list, https only, no redirects, timeouts
const ALLOWED_HOSTS: &[&str] = &["api.partner.example"];

fn validate_target(raw: &str) -> Result<Url, AppError> {
    let url = Url::parse(raw).map_err(|_| AppError::Validation(vec![]))?;
    if url.scheme() != "https" || !url.host_str().is_some_and(|h| ALLOWED_HOSTS.contains(&h)) {
        return Err(AppError::Validation(vec![]));
    }
    Ok(url)
}

let client = reqwest::Client::builder()
    .redirect(reqwest::redirect::Policy::none())
    .timeout(Duration::from_secs(5))
    .build()?;
```

Lorsque les hôtes ne peuvent pas figurer dans une liste blanche, résolvez le DNS vous-même et rejetez les plages loopback, link-local (y compris les adresses de métadonnées cloud) et privées, puis connectez-vous à l'adresse résolue.

### Redirections ouvertes

Ne redirigez que vers des chemins relatifs ou des origines en liste blanche ; jamais de `Redirect::to(&query.next)` non vérifié.

---

## A05 : Injection

### SQL : paramètres liés uniquement

```rust
// BAD: string building (SQL injection)
sqlx::query(&format!("SELECT * FROM users WHERE email = '{email}'"));

// GOOD: bind parameters
sqlx::query_as::<_, User>("SELECT * FROM users WHERE email = $1")
    .bind(email)
    .fetch_optional(&pool)
    .await?;

// GOOD: compile-time checked
sqlx::query_as!(User, "SELECT id, email FROM users WHERE email = $1", email)
    .fetch_optional(&pool)
    .await?;
```

sqlx 0.9 fait prendre aux fonctions `query*()` un `impl SqlSafeStr` : les littéraux de chaîne passent, les `String` d'exécution doivent être enveloppées dans `AssertSqlSafe(...)`. Ce wrapper est une promesse explicite que la chaîne ne contient aucune donnée non fiable ; **recherchez `AssertSqlSafe` par grep en revue** et n'enveloppez jamais une entrée utilisateur.

### Identifiants dynamiques (ORDER BY, colonnes)

Les paramètres liés ne peuvent pas porter d'identifiants. Associez les choix de l'utilisateur à un enum fermé :

```rust
#[derive(Deserialize)]
#[serde(rename_all = "snake_case")]
enum SortColumn { CreatedAt, Total }

impl SortColumn {
    fn as_sql(&self) -> &'static str {
        match self { Self::CreatedAt => "created_at", Self::Total => "total_cents" }
    }
}
```

Construisez la requête finale uniquement à partir de valeurs `&'static str`, ou utilisez `sqlx::QueryBuilder` avec `push_bind` pour les valeurs.

### Commandes, chemins et templates

- Évitez `std::process::Command` avec une entrée utilisateur ; passez les arguments comme éléments séparés (jamais via `sh -c`)
- Paramètres de chemin : canonicalisez et vérifiez le préfixe, rejetez `..`, ou utilisez des identifiants opaques plutôt que des noms de fichiers
- Sortie HTML : utilisez un moteur de templates à échappement automatique (askama, minijinja, maud) ; ne concaténez jamais une entrée utilisateur dans du HTML

---

## Validation des entrées

```rust
use serde::Deserialize;
use validator::Validate;

#[derive(Deserialize, Validate)]
#[serde(deny_unknown_fields)]
pub struct CreateUserRequest {
    #[validate(email, length(max = 254))]
    pub email: String,
    #[validate(length(min = 12, max = 128))]
    pub password: String,
}

pub async fn register(Json(body): Json<CreateUserRequest>) -> Result<StatusCode, AppError> {
    body.validate().map_err(AppError::from)?;
    // ...
    Ok(StatusCode::CREATED)
}
```

- Utilisez `validator` (0.21.0) ou `garde` (0.23.0) de façon déclarative, ou des constructeurs de newtypes écrits à la main (`EmailAddress::parse`) ; parsez une seule fois à la frontière
- `#[serde(deny_unknown_fields)]` pour des DTO stricts ; des DTO distincts par cas d'usage pour prévenir le mass assignment
- Limitez les tailles : `RequestBodyLimitLayer`, `DefaultBodyLimit`, longueurs `max` des chaînes, plafonds de pagination (`limit <= 100`)
- Enveloppez `Json` dans un extractor qui convertit les rejets de corps malformés au format problem+json sans répercuter les détails internes
- Mots de passe : minimum 12 caractères, tout caractère imprimable autorisé, aucune règle de composition, aucune rotation périodique (NIST SP 800-63B-4)

---

## A04 : Cryptographie et mots de passe

### Hachage des mots de passe : Argon2id

```rust
use argon2::{Algorithm, Argon2, Params, Version};

// OWASP minimum: 19 MiB (19_456 KiB), t=2, p=1
// Internal recommendation: 128 MiB (131_072 KiB), t>=3, p=1 (t=4 for high security)
pub fn hasher() -> Result<Argon2<'static>, argon2::Error> {
    let params = Params::new(131_072, 3, 1, None)?; // m_cost in KiB, t_cost, p_cost
    Ok(Argon2::new(Algorithm::Argon2id, Version::V0x13, params))
}
```

- Argon2id est recommandé pour tout nouveau code ; jamais MD5, SHA-1 ni un SHA-256 nu ; bcrypt n'est acceptable en legacy que lorsque Argon2id est indisponible (coût >= 12, plafond d'entrée de 72 octets)
- La mémoire est le principal levier : dimensionnez les paramètres selon votre budget de latence (visez quelques centaines de millisecondes par hachage sur le matériel de production)
- Le hachage consomme beaucoup de CPU et de mémoire : exécutez-le dans `tokio::task::spawn_blocking`, jamais directement sur l'exécuteur async
- Stockez la chaîne PHC (`$argon2id$v=19$m=...`), qui embarque paramètres et sel ; à la connexion, re-hachez lorsque les paramètres sont obsolètes
- Les signatures de génération du sel, `hash_password` et `verify_password` ont changé entre les releases d'`argon2` / `password-hash` (argon2 0.6.0 est la version courante) : suivez la page docs.rs de la version installée plutôt que de copier d'anciens extraits
- Comparez les secrets en temps constant (`subtle::ConstantTimeEq`), jamais avec `==`

### Aléa

Utilisez le CSPRNG du système d'exploitation (`rand::rngs::OsRng` / `getrandom`) pour les jetons, sels et clés d'API ; jamais `rand::thread_rng` initialisé par l'horloge, jamais `fastrand` pour des secrets. Générez au moins 128 bits pour les jetons de session ou de réinitialisation et ne stockez que leur hachage.

### TLS

Terminez TLS au niveau du reverse proxy ou du load balancer, ou utilisez `rustls` dans le processus (`axum-server` avec rustls). Préférez `rustls` à OpenSSL natif pour les clients sortants (feature rustls de `reqwest`, feature rustls de SQLx). Exigez TLS 1.2 au minimum, TLS 1.3 de préférence.

---

## A07 : Authentification

### JWT : EdDSA avec algorithme épinglé

```rust
use jsonwebtoken::{decode, encode, Algorithm, DecodingKey, EncodingKey, Header, Validation};

pub fn issue(claims: &Claims, private_pem: &[u8]) -> Result<String, jsonwebtoken::errors::Error> {
    let key = EncodingKey::from_ed_pem(private_pem)?;
    encode(&Header::new(Algorithm::EdDSA), claims, &key)
}

pub fn verify(token: &str, public_pem: &[u8]) -> Result<Claims, jsonwebtoken::errors::Error> {
    let key = DecodingKey::from_ed_pem(public_pem)?;
    let mut validation = Validation::new(Algorithm::EdDSA); // algorithm pinned by the verifier
    validation.set_issuer(&["https://auth.example.com"]);
    validation.set_audience(&["my-api"]);
    validation.set_required_spec_claims(&["exp", "iss", "aud", "sub"]);
    validation.leeway = 5;
    Ok(decode::<Claims>(token, &key, &validation)?.claims)
}
```

- **EdDSA (Ed25519) en premier choix**, ES256 ensuite, RS256 moins préféré (acceptable lorsque le fournisseur d'identité l'impose)
- `Validation::new(Algorithm::EdDSA)` restreint les algorithmes acceptés : ne lisez jamais `alg` dans l'en-tête du jeton pour choisir la clé ou l'algorithme (confusion d'algorithme)
- Expiration courte (15 minutes), refresh tokens en rotation et stockés hachés ; DPoP (RFC 9449) pour les jetons sensibles
- Validez `iss`, `aud`, `exp` ; gardez un leeway faible
- jsonwebtoken 11 exige qu'exactement une feature de fournisseur cryptographique (`rust_crypto` ou `aws_lc_rs`) soit activée, faute de quoi `encode` / `decode` paniquent à l'exécution : activez-en une dans `Cargo.toml` et couvrez-la par un test (version 11.1.0 sur crates.io ; confirmez les noms de features dans sa documentation)
- Les clés privées proviennent du magasin de secrets, jamais du dépôt ; effectuez la rotation avec un `kid` et un endpoint JWKS

### Sessions et cookies

Préférez les cookies HTTP-only à `localStorage` pour les sessions navigateur :

```rust
// Set-Cookie: session=<opaque>; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=1800
```

- `HttpOnly`, `Secure`, `SameSite=Strict` (ou `Lax` lorsque la navigation inter-sites est requise), expiration de 15 à 30 minutes d'inactivité
- Utilisez `CookieJar` d'`axum-extra` (`PrivateCookieJar` / `SignedCookieJar` pour la protection contre la falsification) avec une clé issue du magasin de secrets
- Invalidez côté serveur à la déconnexion et au changement de mot de passe ; les requêtes modifiant l'état avec authentification par cookie nécessitent une protection CSRF (SameSite plus vérification d'origine ou jeton)

### Protection anti-brute-force : tower_governor

```rust
use std::sync::Arc;
use tower_governor::{governor::GovernorConfigBuilder, GovernorLayer};

let login_limit = Arc::new(
    GovernorConfigBuilder::default()
        .per_second(6)      // one element replenished every 6 seconds
        .burst_size(5)      // 5 attempts per key before blocking
        .finish()
        .expect("non-zero rate limit configuration"),
);

let auth_routes = Router::new()
    .route("/login", post(login))
    .layer(GovernorLayer::new(login_limit));

// The default key extractor uses the peer IP: serve with connect info
axum::serve(listener, app.into_make_service_with_connect_info::<SocketAddr>()).await?;
```

- Derrière un reverse proxy, l'IP du pair est celle du proxy : utilisez un extractor de clé lisant l'en-tête de transfert de confiance uniquement lorsque le proxy l'écrase, sinon les limites sont contournables ou partagées par tout le monde
- Appliquez le rate limiting par compte autant que par IP contre le credential stuffing ; renvoyez des erreurs identiques pour un utilisateur inconnu et un mot de passe erroné
- Purgez périodiquement les clés obsolètes (`retain_recent`) dans une tâche d'arrière-plan ; l'état du limiteur est en mémoire et par instance, utilisez un magasin partagé pour les déploiements multi-réplicas
- Vérifiez l'API par rapport à la version installée de `tower_governor` (0.8.0 au moment de la rédaction)

---

## A02 : Configuration sécurisée

### Secrets : `secrecy`

```rust
use secrecy::{ExposeSecret, SecretString};

#[derive(Clone)]
pub struct Config {
    pub database_url: SecretString,
    pub cookie_key: SecretString,
}

let pool = PgPoolOptions::new().connect(config.database_url.expose_secret()).await?;
```

- `SecretString` / `SecretBox` masquent la sortie `Debug` et remettent la mémoire à zéro au drop ; n'appelez `expose_secret()` qu'au point d'utilisation
- Ne journalisez jamais les corps ou en-têtes de requête en bloc : masquez `Authorization`, `Cookie` et les champs de mot de passe (`TraceLayer` avec `SensitiveRequestHeadersLayer` de tower-http)
- Secrets issus de variables d'environnement, de secrets Docker/Compose ou de Vault ; jamais dans le dépôt, les couches d'image ou un `.env` versionné dans git
- Analysez l'historique avec gitleaks ou trufflehog en CI

### En-têtes de sécurité

```rust
use axum::http::{header, HeaderValue};
use tower_http::set_header::SetResponseHeaderLayer;

let headers = tower::ServiceBuilder::new()
    .layer(SetResponseHeaderLayer::overriding(
        header::STRICT_TRANSPORT_SECURITY,
        HeaderValue::from_static("max-age=63072000; includeSubDomains"),
    ))
    .layer(SetResponseHeaderLayer::overriding(
        header::X_CONTENT_TYPE_OPTIONS,
        HeaderValue::from_static("nosniff"),
    ))
    .layer(SetResponseHeaderLayer::overriding(
        header::X_FRAME_OPTIONS,
        HeaderValue::from_static("DENY"),
    ))
    .layer(SetResponseHeaderLayer::overriding(
        header::CONTENT_SECURITY_POLICY,
        HeaderValue::from_static("default-src 'none'; frame-ancestors 'none'"),
    ))
    .layer(SetResponseHeaderLayer::overriding(
        header::REFERRER_POLICY,
        HeaderValue::from_static("no-referrer"),
    ));
```

Pour une API JSON, une `Content-Security-Policy` restrictive `default-src 'none'` est appropriée ; pour les réponses HTML, utilisez une politique CSP Level 3 adaptée. Définissez aussi `Cross-Origin-Opener-Policy`, `Cross-Origin-Resource-Policy` et une `Permissions-Policy` granulaire. HSTS n'a de sens que sur HTTPS (définissez-le au niveau du terminateur TLS si c'est là que TLS s'arrête).

### CORS

```rust
use tower_http::cors::{AllowOrigin, CorsLayer};

let cors = CorsLayer::new()
    .allow_origin(AllowOrigin::exact(HeaderValue::from_static("https://app.example.com")))
    .allow_methods([Method::GET, Method::POST])
    .allow_headers([header::AUTHORIZATION, header::CONTENT_TYPE])
    .max_age(Duration::from_secs(600));
```

Origines explicites uniquement ; les origines génériques ne peuvent pas être combinées avec des credentials et ne doivent pas être utilisées pour des API authentifiées.

### Limites de ressources

- `RequestBodyLimitLayer` (1 MiB par défaut pour le JSON), limites plus élevées par route pour les uploads
- `TimeoutLayer` sur chaque requête, timeouts sur chaque client sortant et chaque acquisition de connexion à la base
- Concurrence bornée (`tower::limit::ConcurrencyLimitLayer`) et files bornées pour éviter l'épuisement mémoire
- Uploads de fichiers : valider le type de contenu par magic bytes, plafonner la taille, stocker hors de la racine web, générer les noms côté serveur

---

## A03 : Chaîne d'approvisionnement

| Contrôle | Outil / pratique |
|----------|------------------|
| Builds reproductibles | `Cargo.lock` versionné, `cargo build --locked` en CI et dans Docker |
| Advisories | `cargo deny check advisories` + `cargo audit` planifié (RustSec) |
| Licences, bans, sources | `cargo deny check licenses bans sources` (crates.io uniquement) |
| Audits humains | `cargo vet` avec imports de confiance |
| SBOM | `cargo cyclonedx --format json` (CycloneDX) à chaque build de release |
| Signature et provenance | Signer les images et le SBOM avec cosign (Sigstore keyless), provenance SLSA depuis la CI |
| Mises à jour des dépendances | Dependabot ou Renovate, relire les changelogs ; `cargo update -p <crate>` pour les montées de version ciblées |
| Build scripts et proc macros | Ils exécutent du code arbitraire au build : relire les nouveaux `build.rs` et dépendances proc-macro, builder dans un runner CI isolé |
| Typosquatting | Vérifier les noms de crates, propriétaires et nombres de téléchargements avant d'ajouter une dépendance |
| Releases retirées (yanked) | `yanked = "deny"` dans `deny.toml` (par exemple tokio 1.54.0 a été retirée, 1.54.1 est le correctif) |

Épinglez les actions CI tierces à des SHA de commit, et publiez les artefacts avec provenance lorsque c'est possible (SLSA L1 est réaliste ; ne surclamez pas L2/L3).

---

## A09 : Journalisation et supervision

```rust
use tower_http::trace::TraceLayer;

let app = Router::new()
    // ...
    .layer(TraceLayer::new_for_http()); // spans per request with method, URI, status, latency
```

- Journaux JSON structurés via `tracing-subscriber`, identifiant de requête propagé (tower-http `SetRequestIdLayer` / `PropagateRequestIdLayer`)
- Journalisez les événements d'authentification, les refus de permission, les accès aux données sensibles, les atteintes de rate limit et les anomalies de validation
- Ne journalisez jamais les mots de passe, jetons, données personnelles complètes, SQL avec valeurs de paramètres, ni de stack traces dans les réponses client
- Conservez les journaux au moins un an pour la conformité ; alertez sur les échecs d'authentification répétés et les accès hors horaires

## A10 : Conditions exceptionnelles

- Les handlers retournent `Result<_, AppError>` ; `AppError` journalise la cause avec `tracing::error!` et renvoie un corps RFC 9457 générique
- Ajoutez `tower_http::catch_panic::CatchPanicLayer` comme dernière ligne de défense pour transformer un panic en 500 générique plutôt qu'en connexion coupée ; il ne remplace pas la suppression des `unwrap()`
- Échec fermé : lorsque l'authentification ou l'autorisation ne peut être déterminée, refuser
- Arrêtez-vous gracieusement et laissez se terminer les requêtes en cours ; gérez `SIGTERM`

---

## Sources

- OWASP Top 10:2025 : https://owasp.org/Top10/2025/
- OWASP Password Storage Cheat Sheet (Argon2id minimum 19 MiB / t=2 / p=1) : https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html
- RFC 9457 (Problem Details), RFC 9449 (DPoP) : https://www.rfc-editor.org/rfc/rfc9457
- RustSec : https://rustsec.org/ ; cargo-deny : https://embarkstudios.github.io/cargo-deny/
- Changelog sqlx 0.9.0 (`SqlSafeStr` / `AssertSqlSafe`) : https://github.com/launchbadge/sqlx/blob/main/CHANGELOG.md
- Versions de crates (crates.io) : argon2 0.6.0, jsonwebtoken 11.1.0, secrecy 0.10.3, tower_governor 0.8.0, validator 0.21.0, garde 0.23.0, tower-http 0.7.1, cargo-audit 0.22.2, cargo-vet 0.10.3, cargo-cyclonedx 0.5.10, tokio 1.54.1

## Checklist

- [ ] `unsafe_code = "forbid"` ; pas de `unwrap()` / `expect()` sur les chemins de requête
- [ ] Chaque requête cloisonnée par le principal authentifié ; les routes protégées utilisent l'extractor d'authentification
- [ ] Paramètres liés SQLx uniquement ; `AssertSqlSafe` n'enveloppe jamais une entrée utilisateur
- [ ] DTO validés (validator / garde), `deny_unknown_fields`, limites de corps et timeouts définis
- [ ] Mots de passe hachés avec Argon2id dans `spawn_blocking` ; paramètres au minimum OWASP ou plus stricts
- [ ] JWT vérifié avec un algorithme épinglé (EdDSA), `iss` / `aud` / `exp` validés, un fournisseur cryptographique activé
- [ ] Cookies HTTP-only, Secure, SameSite ; CSRF traité pour l'authentification par cookie
- [ ] Rate limiting sur les routes d'authentification (tower_governor) avec un extractor de clé correct
- [ ] Secrets enveloppés dans `secrecy`, jamais journalisés ni versionnés
- [ ] En-têtes de sécurité et origines CORS explicites configurés
- [ ] `cargo deny check` et `cargo audit` au vert en CI ; `Cargo.lock` versionné
- [ ] SBOM généré et artefacts signés ; actions CI épinglées
- [ ] Corps d'erreur problem+json génériques, aucune stack trace ni erreur SQL exposée
