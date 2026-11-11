# Rust-/Axum-Sicherheits-Best-Practices

Sicherheit hat höchste Priorität. Referenzen: **OWASP Top 10:2025**, OWASP ASVS 5.0, RustSec-Advisories. Rust beseitigt ganze Klassen von Speichersicherheitsfehlern, nicht aber Logikfehler, Injection, fehlerhafte Zugriffskontrolle oder Lieferkettenrisiken. cargo-deny und cargo-audit laufen bei jedem CI-Build.

> Befehle laufen im Container: `docker compose exec app cargo deny check`, `docker compose exec app cargo audit`.

## OWASP Top 10:2025 in Rust / Axum

| # | Kategorie | Abwehr in Rust / Axum |
|---|-----------|-----------------------|
| A01 | Broken Access Control (inkl. SSRF) | Jede Abfrage nach dem authentifizierten Principal einschränken, typisierter Auth-Extractor, Deny by Default, ausgehende Hosts per Allow-Liste |
| A02 | Security Misconfiguration | Layer für Security-Header, explizite CORS-Origins, TLS am Rand, generische Fehler-Bodys, keine Debug-Endpunkte |
| A03 | Software Supply Chain Failures | `Cargo.lock` eingecheckt, cargo-deny, cargo-audit, cargo-vet, SBOM (cargo-cyclonedx), fixierte CI-Actions |
| A04 | Cryptographic Failures | Argon2id, EdDSA-JWT, `rustls`, `secrecy`, CSPRNG des Betriebssystems (`OsRng`), keine selbstgebaute Kryptografie |
| A05 | Injection | SQLx-Bind-Parameter, typisierte Deserialisierung, Validierung (validator / garde), keine Shell-Interpolation |
| A06 | Insecure Design | Threat Modeling, Rate Limiting, Body-Limits, Timeouts, Least Privilege |
| A07 | Authentication Failures | Argon2id, MFA, Brute-Force-Limits (tower_governor), kurzlebige Tokens, Invalidierung von Sessions |
| A08 | Software or Data Integrity Failures | Verifizierte Signaturen, `deny_unknown_fields`, signierte Images und Artefakte, keine unsichere Deserialisierung nicht vertrauenswürdiger Formate |
| A09 | Security Logging and Alerting Failures | `tracing` mit Request-IDs, Schwärzung von Secrets, Audit-Ereignisse, zentralisierte Alarme |
| A10 | Mishandling of Exceptional Conditions | `Result` überall, keine Panics auf Request-Pfaden, `AppError` mit generischen Bodys, Fail Closed |

---

## Speichersicherheit und `unsafe`

```rust
#![forbid(unsafe_code)]
```

- `unsafe` in Anwendungs-Crates über `[workspace.lints.rust] unsafe_code = "forbid"` verbieten
- Ein Panic ist ein Denial-of-Service-Primitiv: kein `unwrap()` / `expect()` / Indexzugriff auf Request-Pfaden (`clippy::unwrap_used = "deny"`)
- Ganzzahl-Überläufe laufen in Release-Builds über (Wrapping): für Geldbeträge und Mengen `checked_*` / `saturating_*`-Arithmetik verwenden oder `overflow-checks = true` im Release-Profil aktivieren
- `cargo geiger` (oder `cargo tree`) zeigt `unsafe` in Abhängigkeiten; gut geprüfte Crates bevorzugen

---

## A01: Broken Access Control

### Jede Abfrage nach dem Principal einschränken

```rust
// SCHLECHT: unsichere direkte Objektreferenz
async fn show(State(s): State<AppState>, Path(id): Path<Uuid>) -> Result<Json<Order>, AppError> {
    Ok(Json(s.orders.find(id).await?.ok_or(AppError::NotFound)?))
}

// GUT: nur die Bestellungen des Aufrufers sind auffindbar
async fn show(
    State(s): State<AppState>,
    auth: AuthenticatedUser,
    Path(id): Path<Uuid>,
) -> Result<Json<Order>, AppError> {
    let order = s.orders.find_for_user(id, auth.user_id).await?.ok_or(AppError::NotFound)?;
    Ok(Json(order))
}
```

Für Datensätze, die jemand anderem gehören, `404` zurückzugeben, verhindert, dass ihre Existenz preisgegeben wird.

### Typisierte Authentifizierung und Autorisierung

- Geschützte Handler deklarieren einen `AuthenticatedUser`-Extractor; eine Route ohne ihn ist konstruktionsbedingt öffentlich, daher jede öffentliche Route prüfen
- Rollenprüfungen über einen typisierten Extractor oder eine Policy-Funktion, niemals über einen Rollen-String aus dem Request-Body
- Niemals `role`, `is_admin` oder `user_id` aus Client-Payloads akzeptieren: DTOs sind von Domänentypen getrennt und enthalten keine privilegierten Felder
- Deny by Default: einen Auth-Layer auf den gesamten geschützten Router anwenden und öffentliche Routen separat einhängen

### SSRF

```rust
// SCHLECHT: vom Benutzer kontrollierte URL wird serverseitig abgerufen
let body = reqwest::get(&params.url).await?.text().await?;

// GUT: Allow-Liste, nur https, keine Redirects, Timeouts
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

Lassen sich Hosts nicht per Allow-Liste festlegen, DNS selbst auflösen und Loopback-, Link-Local- (einschließlich Cloud-Metadaten-Adressen) und private Bereiche ablehnen, dann mit der aufgelösten Adresse verbinden.

### Open Redirects

Nur auf relative Pfade oder Origins auf der Allow-Liste weiterleiten; niemals ungeprüft `Redirect::to(&query.next)`.

---

## A05: Injection

### SQL: ausschließlich Bind-Parameter

```rust
// SCHLECHT: String-Bau (SQL-Injection)
sqlx::query(&format!("SELECT * FROM users WHERE email = '{email}'"));

// GUT: Bind-Parameter
sqlx::query_as::<_, User>("SELECT * FROM users WHERE email = $1")
    .bind(email)
    .fetch_optional(&pool)
    .await?;

// GUT: zur Compile-Zeit geprüft
sqlx::query_as!(User, "SELECT id, email FROM users WHERE email = $1", email)
    .fetch_optional(&pool)
    .await?;
```

sqlx 0.9 lässt die `query*()`-Funktionen ein `impl SqlSafeStr` entgegennehmen: String-Literale werden akzeptiert, `String`s zur Laufzeit müssen in `AssertSqlSafe(...)` gewickelt werden. Dieser Wrapper ist ein ausdrückliches Versprechen, dass der String keine nicht vertrauenswürdigen Daten enthält; **im Review per Grep nach `AssertSqlSafe` suchen** und niemals Benutzereingaben wickeln.

### Dynamische Bezeichner (ORDER BY, Spalten)

Bind-Parameter können keine Bezeichner transportieren. Benutzerauswahlen auf ein geschlossenes Enum abbilden:

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

Die endgültige Abfrage ausschließlich aus `&'static str`-Werten aufbauen oder `sqlx::QueryBuilder` mit `push_bind` für Werte verwenden.

### Befehle, Pfade und Templates

- `std::process::Command` mit Benutzereingaben vermeiden; Argumente als separate Elemente übergeben (niemals über `sh -c`)
- Pfadparameter: kanonisieren und das Präfix prüfen, `..` ablehnen oder opake IDs statt Dateinamen verwenden
- HTML-Ausgabe: eine Template-Engine mit automatischem Escaping verwenden (askama, minijinja, maud); Benutzereingaben niemals in HTML konkatenieren

---

## Eingabevalidierung

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

- `validator` (0.21.0) oder `garde` (0.23.0) deklarativ verwenden, oder handgeschriebene Newtype-Konstruktoren (`EmailAddress::parse`); einmal an der Grenze parsen
- `#[serde(deny_unknown_fields)]` für strikte DTOs; separate DTOs pro Anwendungsfall, um Mass Assignment zu verhindern
- Größen begrenzen: `RequestBodyLimitLayer`, `DefaultBodyLimit`, `max`-Längen für Strings, Obergrenzen bei der Paginierung (`limit <= 100`)
- `Json` in einen Extractor wickeln, der Rejections wegen fehlerhafter Bodys auf das Format problem+json abbildet, ohne Interna zu spiegeln
- Passwörter: mindestens 15 Zeichen (Einzelfaktor; 8 mit MFA), jedes druckbare Zeichen erlauben, keine Kompositionsregeln, keine periodische Rotation (NIST SP 800-63B-4)

---

## A04: Kryptografie und Passwörter

### Passwort-Hashing: Argon2id

```rust
use argon2::{Algorithm, Argon2, Params, Version};

// OWASP minimum: 19 MiB (19_456 KiB), t=2, p=1
// Internal recommendation: 128 MiB (131_072 KiB), t>=3, p=1 (t=4 for high security)
pub fn hasher() -> Result<Argon2<'static>, argon2::Error> {
    let params = Params::new(131_072, 3, 1, None)?; // m_cost in KiB, t_cost, p_cost
    Ok(Argon2::new(Algorithm::Argon2id, Version::V0x13, params))
}
```

- Argon2id wird für jeden neuen Code empfohlen; niemals MD5, SHA-1 oder ein bloßes SHA-256; bcrypt ist nur dort als Legacy akzeptabel, wo Argon2id nicht verfügbar ist (Cost >= 12, Eingabelimit von 72 Byte)
- Der Speicher ist der wichtigste Hebel: Parameter am Latenzbudget ausrichten (Ziel sind einige hundert Millisekunden pro Hash auf Produktionshardware)
- Hashing ist CPU- und speicherintensiv: in `tokio::task::spawn_blocking` ausführen, niemals direkt auf dem asynchronen Executor
- Den PHC-String speichern (`$argon2id$v=19$m=...`), der Parameter und Salt einbettet; beim Login neu hashen, wenn die Parameter veraltet sind
- Die Signaturen für Salt-Erzeugung, `hash_password` und `verify_password` haben sich zwischen den Releases von `argon2` / `password-hash` geändert (argon2 0.6.0 ist aktuell): der docs.rs-Seite der installierten Version folgen, statt ältere Snippets zu kopieren
- Secrets zeitkonstant vergleichen (`subtle::ConstantTimeEq`), niemals mit `==`

### Zufall

Für Tokens, Salts und API-Schlüssel den CSPRNG des Betriebssystems verwenden (`rand::rngs::OsRng` / `getrandom`); niemals `rand::thread_rng`, das mit der Zeit initialisiert wurde, niemals `fastrand` für Secrets. Für Session- oder Reset-Tokens mindestens 128 Bit erzeugen und nur deren Hash speichern.

### TLS

TLS am Reverse Proxy oder Load Balancer terminieren oder `rustls` im Prozess verwenden (`axum-server` mit rustls). Für ausgehende Clients `rustls` gegenüber nativem OpenSSL bevorzugen (Feature `rustls` von `reqwest`, Feature `rustls` von SQLx). Mindestens TLS 1.2 verlangen, TLS 1.3 bevorzugt.

---

## A07: Authentifizierung

### JWT: EdDSA mit fixiertem Algorithmus

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

- **EdDSA (Ed25519) als erste Wahl**, danach ES256, RS256 weniger bevorzugt (akzeptabel, wenn der Identity Provider es vorschreibt)
- `Validation::new(Algorithm::EdDSA)` schränkt die akzeptierten Algorithmen ein: niemals `alg` aus dem Token-Header lesen, um Schlüssel oder Algorithmus zu wählen (Algorithm Confusion)
- Kurze Gültigkeit (15 Minuten), Refresh-Tokens rotiert und gehasht gespeichert; DPoP (RFC 9449) für sensible Tokens
- `iss`, `aud`, `exp` validieren; das Leeway klein halten
- jsonwebtoken 11 verlangt, dass genau ein Crypto-Provider-Feature (`rust_crypto` oder `aws_lc_rs`) aktiviert ist, andernfalls geraten `encode` / `decode` zur Laufzeit in Panic: eines in `Cargo.toml` aktivieren und mit einem Test absichern (Version 11.1.0 auf crates.io; Feature-Namen in der Dokumentation bestätigen)
- Private Schlüssel stammen aus dem Secret Store, niemals aus dem Repository; mit einer `kid` und einem JWKS-Endpunkt rotieren

### Sessions und Cookies

Für Browser-Sessions HTTP-only-Cookies gegenüber `localStorage` bevorzugen:

```rust
// Set-Cookie: session=<opaque>; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=1800
```

- `HttpOnly`, `Secure`, `SameSite=Strict` (oder `Lax`, wenn seitenübergreifende Navigation erforderlich ist), Ablauf nach 15-30 Minuten Inaktivität
- `CookieJar` aus `axum-extra` verwenden (`PrivateCookieJar` / `SignedCookieJar` als Manipulationsschutz) mit einem Schlüssel aus dem Secret Store
- Serverseitig bei Logout und Passwortänderung invalidieren; zustandsändernde Requests mit Cookie-Authentifizierung benötigen CSRF-Schutz (SameSite plus Origin-Prüfung oder Token)

### Brute-Force-Schutz: tower_governor

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

- Hinter einem Reverse Proxy ist die Peer-IP der Proxy: einen Key-Extractor verwenden, der den vertrauenswürdigen Forwarding-Header nur dann liest, wenn der Proxy ihn überschreibt; andernfalls sind die Limits umgehbar oder werden von allen geteilt
- Zusätzlich zur IP auch pro Konto begrenzen, gegen Credential Stuffing; identische Fehler für unbekannten Benutzer und falsches Passwort zurückgeben
- Veraltete Schlüssel regelmäßig in einem Hintergrund-Task entfernen (`retain_recent`); der Limiter-Zustand liegt im Speicher und gilt pro Instanz, bei Deployments mit mehreren Replikas einen gemeinsamen Store verwenden
- Die API gegen die installierte `tower_governor`-Version prüfen (0.8.0 zum Zeitpunkt des Schreibens)

---

## A02: Sichere Konfiguration

### Secrets: `secrecy`

```rust
use secrecy::{ExposeSecret, SecretString};

#[derive(Clone)]
pub struct Config {
    pub database_url: SecretString,
    pub cookie_key: SecretString,
}

let pool = PgPoolOptions::new().connect(config.database_url.expose_secret()).await?;
```

- `SecretString` / `SecretBox` schwärzen die `Debug`-Ausgabe und überschreiben den Speicher beim Drop mit Nullen; `expose_secret()` nur an der Verwendungsstelle aufrufen
- Request-Bodys oder Header niemals pauschal protokollieren: `Authorization`, `Cookie` und Passwortfelder schwärzen (`TraceLayer` mit `SensitiveRequestHeadersLayer` aus tower-http)
- Secrets aus Umgebungsvariablen, Docker-/Compose-Secrets oder Vault; niemals im Repository, in Image-Layern oder in einer in Git eingecheckten `.env`
- Die Historie in der CI mit gitleaks oder trufflehog scannen

### Security-Header

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

Für eine JSON-API ist eine restriktive `Content-Security-Policy` mit `default-src 'none'` angemessen; für HTML-Antworten eine maßgeschneiderte CSP-Level-3-Richtlinie verwenden. Zusätzlich `Cross-Origin-Opener-Policy`, `Cross-Origin-Resource-Policy` und eine granulare `Permissions-Policy` setzen. HSTS ist nur über HTTPS sinnvoll (am TLS-Terminator setzen, falls dort TLS endet).

### CORS

```rust
use tower_http::cors::{AllowOrigin, CorsLayer};

let cors = CorsLayer::new()
    .allow_origin(AllowOrigin::exact(HeaderValue::from_static("https://app.example.com")))
    .allow_methods([Method::GET, Method::POST])
    .allow_headers([header::AUTHORIZATION, header::CONTENT_TYPE])
    .max_age(Duration::from_secs(600));
```

Nur explizite Origins; Wildcard-Origins lassen sich nicht mit Credentials kombinieren und sollten bei authentifizierten APIs nicht verwendet werden.

### Ressourcenlimits

- `RequestBodyLimitLayer` (Standard 1 MiB für JSON), größere Limits pro Route für Uploads
- `TimeoutLayer` bei jedem Request, Timeouts bei jedem ausgehenden Client und beim Datenbank-Acquire
- Begrenzte Nebenläufigkeit (`tower::limit::ConcurrencyLimitLayer`) und begrenzte Queues, um Speichererschöpfung zu vermeiden
- Datei-Uploads: Content-Type anhand der Magic Bytes validieren, Größe begrenzen, außerhalb des Web-Roots speichern, Namen serverseitig erzeugen

---

## A03: Lieferkette

| Kontrolle | Werkzeug / Praxis |
|-----------|-------------------|
| Reproduzierbare Builds | `Cargo.lock` eingecheckt, `cargo build --locked` in CI und Docker |
| Advisories | `cargo deny check advisories` + geplantes `cargo audit` (RustSec) |
| Lizenzen, Bans, Quellen | `cargo deny check licenses bans sources` (nur crates.io) |
| Menschliche Audits | `cargo vet` mit vertrauenswürdigen Importen |
| SBOM | `cargo cyclonedx --format json` (CycloneDX) bei jedem Release-Build |
| Signierung und Provenienz | Images und SBOM mit cosign signieren (Sigstore keyless), SLSA-Provenienz aus der CI |
| Abhängigkeits-Updates | Dependabot oder Renovate, Changelogs prüfen; `cargo update -p <crate>` für gezielte Aktualisierungen |
| Build-Skripte und Proc-Macros | Sie führen zur Build-Zeit beliebigen Code aus: neue `build.rs` und Proc-Macro-Abhängigkeiten prüfen, in einem isolierten CI-Runner bauen |
| Typosquatting | Vor dem Hinzufügen einer Abhängigkeit Crate-Namen, Eigentümer und Download-Zahlen prüfen |
| Yanked-Releases | `yanked = "deny"` in `deny.toml` (zum Beispiel wurde tokio 1.54.0 yanked, 1.54.1 ist der Fix) |

CI-Actions von Drittanbietern auf Commit-SHAs fixieren und Artefakte nach Möglichkeit mit Provenienz veröffentlichen (SLSA L1 ist realistisch; L2/L3 nicht überbewerten).

---

## A09: Logging und Monitoring

```rust
use tower_http::trace::TraceLayer;

let app = Router::new()
    // ...
    .layer(TraceLayer::new_for_http()); // spans per request with method, URI, status, latency
```

- Strukturierte JSON-Logs über `tracing-subscriber`, eine Request-ID wird weitergereicht (tower-http `SetRequestIdLayer` / `PropagateRequestIdLayer`)
- Authentifizierungsereignisse, Berechtigungsverweigerungen, Zugriffe auf sensible Daten, Rate-Limit-Treffer und Validierungsanomalien protokollieren
- Niemals Passwörter, Tokens, vollständige personenbezogene Daten, SQL mit Parameterwerten oder Stack-Traces in Client-Antworten protokollieren
- Logs aus Compliance-Gründen mindestens ein Jahr aufbewahren; bei wiederholten Authentifizierungsfehlern und Zugriffen außerhalb der Geschäftszeiten alarmieren

## A10: Außergewöhnliche Bedingungen

- Handler geben `Result<_, AppError>` zurück; `AppError` protokolliert die Ursache mit `tracing::error!` und liefert einen generischen Body nach RFC 9457
- `tower_http::catch_panic::CatchPanicLayer` als letzte Verteidigungslinie hinzufügen, um einen Panic in ein generisches 500 statt einer abgebrochenen Verbindung zu verwandeln; es ersetzt nicht das Entfernen von `unwrap()`
- Fail Closed: Lässt sich Authentifizierung oder Autorisierung nicht bestimmen, verweigern
- Geordnet herunterfahren und laufende Requests abarbeiten; `SIGTERM` behandeln

---

## Quellen

- OWASP Top 10:2025: https://owasp.org/Top10/2025/
- OWASP Password Storage Cheat Sheet (Argon2id-Minimum 19 MiB / t=2 / p=1): https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html
- RFC 9457 (Problem Details), RFC 9449 (DPoP): https://www.rfc-editor.org/rfc/rfc9457
- RustSec: https://rustsec.org/ ; cargo-deny: https://embarkstudios.github.io/cargo-deny/
- sqlx-0.9.0-Changelog (`SqlSafeStr` / `AssertSqlSafe`): https://github.com/launchbadge/sqlx/blob/main/CHANGELOG.md
- Crate-Versionen (crates.io): argon2 0.6.0, jsonwebtoken 11.1.0, secrecy 0.10.3, tower_governor 0.8.0, validator 0.21.0, garde 0.23.0, tower-http 0.7.1, cargo-audit 0.22.2, cargo-vet 0.10.3, cargo-cyclonedx 0.5.10, tokio 1.54.1

## Checkliste

- [ ] `unsafe_code = "forbid"`; kein `unwrap()` / `expect()` auf Request-Pfaden
- [ ] Jede Abfrage nach dem authentifizierten Principal eingeschränkt; geschützte Routen verwenden den Auth-Extractor
- [ ] Ausschließlich SQLx-Bind-Parameter; `AssertSqlSafe` wickelt niemals Benutzereingaben
- [ ] DTOs validiert (validator / garde), `deny_unknown_fields`, Body-Limits und Timeouts gesetzt
- [ ] Passwörter mit Argon2id in `spawn_blocking` gehasht; Parameter erfüllen das OWASP-Minimum oder strengere Werte
- [ ] JWT mit fixiertem Algorithmus (EdDSA) verifiziert, `iss` / `aud` / `exp` validiert, ein Crypto-Provider aktiviert
- [ ] Cookies HTTP-only, Secure, SameSite; CSRF bei Cookie-Authentifizierung behandelt
- [ ] Rate Limiting auf Authentifizierungsrouten (tower_governor) mit korrektem Key-Extractor
- [ ] Secrets in `secrecy` gewickelt, niemals protokolliert oder eingecheckt
- [ ] Security-Header und explizite CORS-Origins konfiguriert
- [ ] `cargo deny check` und `cargo audit` grün in der CI; `Cargo.lock` eingecheckt
- [ ] SBOM erzeugt und Artefakte signiert; CI-Actions fixiert
- [ ] Generische problem+json-Fehler-Bodys, keine Stack-Traces oder SQL-Fehler preisgegeben
