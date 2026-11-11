# Buenas prácticas de seguridad Rust / Axum

La seguridad es una prioridad absoluta. Referencias: **OWASP Top 10:2025**, OWASP ASVS 5.0, advisories de RustSec. Rust elimina clases enteras de errores de seguridad de memoria, pero no los fallos de lógica, la inyección, el control de acceso roto ni el riesgo de la cadena de suministro. cargo-deny y cargo-audit se ejecutan en cada build de CI.

> Los comandos se ejecutan en el contenedor: `docker compose exec app cargo deny check`, `docker compose exec app cargo audit`.

## OWASP Top 10:2025 en Rust / Axum

| # | Categoría | Defensa en Rust / Axum |
|---|-----------|------------------------|
| A01 | Broken Access Control (incl. SSRF) | Acotar cada consulta al principal autenticado, extractor de autenticación tipado, denegar por defecto, lista de hosts salientes permitidos |
| A02 | Security Misconfiguration | Capa de cabeceras de seguridad, orígenes CORS explícitos, TLS en el borde, cuerpos de error genéricos, sin endpoints de depuración |
| A03 | Software Supply Chain Failures | `Cargo.lock` commiteado, cargo-deny, cargo-audit, cargo-vet, SBOM (cargo-cyclonedx), actions de CI fijadas |
| A04 | Cryptographic Failures | Argon2id, JWT EdDSA, `rustls`, `secrecy`, CSPRNG del SO (`OsRng`), sin criptografía casera |
| A05 | Injection | Parámetros enlazados de SQLx, deserialización tipada, validación (validator / garde), sin interpolación en el shell |
| A06 | Insecure Design | Modelado de amenazas, limitación de tasa, límites de cuerpo, timeouts, mínimo privilegio |
| A07 | Authentication Failures | Argon2id, MFA, límites contra la fuerza bruta (tower_governor), tokens de corta duración, invalidación de sesión |
| A08 | Software or Data Integrity Failures | Firmas verificadas, `deny_unknown_fields`, imágenes y artefactos firmados, sin deserialización insegura de formatos no confiables |
| A09 | Security Logging and Alerting Failures | `tracing` con identificadores de petición, redacción de secretos, eventos de auditoría, alertas centralizadas |
| A10 | Mishandling of Exceptional Conditions | `Result` en todas partes, sin panics en las rutas de petición, `AppError` con cuerpos genéricos, fallar en modo cerrado |

---

## Seguridad de memoria y `unsafe`

```rust
#![forbid(unsafe_code)]
```

- Prohíbe `unsafe` en los crates de aplicación mediante `[workspace.lints.rust] unsafe_code = "forbid"`
- Un panic es una primitiva de denegación de servicio: ningún `unwrap()` / `expect()` / indexación en las rutas de petición (`clippy::unwrap_used = "deny"`)
- El desbordamiento de enteros hace wrap en los builds de release: usa aritmética `checked_*` / `saturating_*` para el dinero y las cantidades, o activa `overflow-checks = true` en el perfil de release
- `cargo geiger` (o `cargo tree`) muestra el `unsafe` presente en las dependencias; prefiere crates bien auditados

---

## A01: Control de acceso roto (Broken Access Control)

### Acotar cada consulta al principal

```rust
// MAL: referencia directa e insegura a objetos
async fn show(State(s): State<AppState>, Path(id): Path<Uuid>) -> Result<Json<Order>, AppError> {
    Ok(Json(s.orders.find(id).await?.ok_or(AppError::NotFound)?))
}

// BIEN: solo se pueden encontrar los pedidos del llamante
async fn show(
    State(s): State<AppState>,
    auth: AuthenticatedUser,
    Path(id): Path<Uuid>,
) -> Result<Json<Order>, AppError> {
    let order = s.orders.find_for_user(id, auth.user_id).await?.ok_or(AppError::NotFound)?;
    Ok(Json(order))
}
```

Devolver `404` para los registros que pertenecen a otra persona evita filtrar su existencia.

### Autenticación y autorización tipadas

- Los handlers protegidos declaran un extractor `AuthenticatedUser`; una ruta sin él es pública por construcción, así que revisa cada ruta pública
- Las comprobaciones de rol pasan por un extractor tipado o una función de política, nunca por una cadena de rol procedente del cuerpo de la petición
- Nunca aceptes `role`, `is_admin` o `user_id` desde las cargas del cliente: los DTO son independientes de los tipos del dominio y omiten los campos privilegiados
- Denegar por defecto: aplica una capa de autenticación a todo el router protegido y monta las rutas públicas por separado

### SSRF

```rust
// MAL: URL controlada por el usuario descargada desde el servidor
let body = reqwest::get(&params.url).await?.text().await?;

// BIEN: lista de permitidos, solo https, sin redirecciones, con timeouts
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

Cuando no se puedan incluir los hosts en una lista de permitidos, resuelve tú mismo el DNS y rechaza las direcciones de loopback, link-local (incluidas las de metadatos de la nube) y los rangos privados; después conéctate a la dirección resuelta.

### Redirecciones abiertas

Redirige únicamente a rutas relativas u orígenes de una lista de permitidos; nunca `Redirect::to(&query.next)` sin comprobar.

---

## A05: Inyección

### SQL: solo parámetros enlazados

```rust
// MAL: construcción de cadenas (inyección SQL)
sqlx::query(&format!("SELECT * FROM users WHERE email = '{email}'"));

// BIEN: parámetros enlazados
sqlx::query_as::<_, User>("SELECT * FROM users WHERE email = $1")
    .bind(email)
    .fetch_optional(&pool)
    .await?;

// BIEN: verificado en tiempo de compilación
sqlx::query_as!(User, "SELECT id, email FROM users WHERE email = $1", email)
    .fetch_optional(&pool)
    .await?;
```

sqlx 0.9 hace que las funciones `query*()` reciban `impl SqlSafeStr`: los literales de cadena pasan, los `String` en tiempo de ejecución deben envolverse en `AssertSqlSafe(...)`. Ese wrapper es una promesa explícita de que la cadena no contiene datos no confiables; **busca con grep `AssertSqlSafe` en las revisiones** y nunca envuelvas una entrada de usuario.

### Identificadores dinámicos (ORDER BY, columnas)

Los parámetros enlazados no pueden transportar identificadores. Mapea las elecciones del usuario a un enum cerrado:

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

Construye la consulta final únicamente con valores `&'static str`, o usa `sqlx::QueryBuilder` con `push_bind` para los valores.

### Comandos, rutas y plantillas

- Evita `std::process::Command` con entradas de usuario; pasa los argumentos como elementos separados (nunca a través de `sh -c`)
- Parámetros de ruta: canonicaliza y verifica el prefijo, rechaza `..`, o usa identificadores opacos en lugar de nombres de archivo
- Salida HTML: usa un motor de plantillas con escape automático (askama, minijinja, maud); nunca concatenes entradas de usuario en el HTML

---

## Validación de entradas

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

- Usa `validator` (0.21.0) o `garde` (0.23.0) de forma declarativa, o constructores de newtype escritos a mano (`EmailAddress::parse`); parsea una sola vez en la frontera
- `#[serde(deny_unknown_fields)]` para DTO estrictos; DTO separados por caso de uso para prevenir la asignación masiva (mass assignment)
- Limita los tamaños: `RequestBodyLimitLayer`, `DefaultBodyLimit`, longitudes `max` de las cadenas, topes de paginación (`limit <= 100`)
- Envuelve `Json` en un extractor que mapee los rechazos por cuerpo mal formado al formato problem+json sin reflejar detalles internos
- Contraseñas: mínimo 15 caracteres (factor único; 8 con MFA), permitir cualquier carácter imprimible, sin reglas de composición, sin rotación periódica (NIST SP 800-63B-4)

---

## A04: Criptografía y contraseñas

### Hash de contraseñas: Argon2id

```rust
use argon2::{Algorithm, Argon2, Params, Version};

// Mínimo OWASP: 19 MiB (19_456 KiB), t=2, p=1
// Recomendación interna: 128 MiB (131_072 KiB), t>=3, p=1 (t=4 para alta seguridad)
pub fn hasher() -> Result<Argon2<'static>, argon2::Error> {
    let params = Params::new(131_072, 3, 1, None)?; // m_cost en KiB, t_cost, p_cost
    Ok(Argon2::new(Algorithm::Argon2id, Version::V0x13, params))
}
```

- Argon2id se recomienda para todo código nuevo; nunca MD5, SHA-1 ni un SHA-256 a secas; bcrypt solo es aceptable como legacy cuando Argon2id no está disponible (cost >= 12, límite de entrada de 72 bytes)
- La memoria es la palanca principal: dimensiona los parámetros según tu presupuesto de latencia (apunta a unos cientos de milisegundos por hash en el hardware de producción)
- El hashing consume mucha CPU y memoria: ejecútalo en `tokio::task::spawn_blocking`, nunca directamente en el executor asíncrono
- Almacena la cadena PHC (`$argon2id$v=19$m=...`), que incorpora los parámetros y la sal; al iniciar sesión, vuelve a hashear cuando los parámetros estén desfasados
- La generación de la sal y las firmas de `hash_password` y `verify_password` cambiaron entre versiones de `argon2` / `password-hash` (argon2 0.6.0 es la actual): sigue la página de docs.rs de la versión instalada en lugar de copiar fragmentos antiguos
- Compara los secretos en tiempo constante (`subtle::ConstantTimeEq`), nunca con `==`

### Aleatoriedad

Usa el CSPRNG del sistema operativo (`rand::rngs::OsRng` / `getrandom`) para tokens, sales y claves de API; nunca `rand::thread_rng` sembrado por el tiempo, nunca `fastrand` para secretos. Genera al menos 128 bits para los tokens de sesión o de restablecimiento y almacena solo su hash.

### TLS

Termina el TLS en el proxy inverso o en el balanceador de carga, o usa `rustls` en el propio proceso (`axum-server` con rustls). Prefiere `rustls` frente a OpenSSL nativo para los clientes salientes (feature rustls de `reqwest`, feature rustls de SQLx). Exige TLS 1.2 como mínimo, preferiblemente TLS 1.3.

---

## A07: Autenticación

### JWT: EdDSA con algoritmo fijado

```rust
use jsonwebtoken::{decode, encode, Algorithm, DecodingKey, EncodingKey, Header, Validation};

pub fn issue(claims: &Claims, private_pem: &[u8]) -> Result<String, jsonwebtoken::errors::Error> {
    let key = EncodingKey::from_ed_pem(private_pem)?;
    encode(&Header::new(Algorithm::EdDSA), claims, &key)
}

pub fn verify(token: &str, public_pem: &[u8]) -> Result<Claims, jsonwebtoken::errors::Error> {
    let key = DecodingKey::from_ed_pem(public_pem)?;
    let mut validation = Validation::new(Algorithm::EdDSA); // algoritmo fijado por el verificador
    validation.set_issuer(&["https://auth.example.com"]);
    validation.set_audience(&["my-api"]);
    validation.set_required_spec_claims(&["exp", "iss", "aud", "sub"]);
    validation.leeway = 5;
    Ok(decode::<Claims>(token, &key, &validation)?.claims)
}
```

- **EdDSA (Ed25519) como primera elección**, ES256 a continuación, RS256 menos recomendado (aceptable cuando lo impone el proveedor de identidad)
- `Validation::new(Algorithm::EdDSA)` restringe los algoritmos aceptados: nunca leas `alg` de la cabecera del token para elegir la clave o el algoritmo (confusión de algoritmo)
- Caducidad corta (15 minutos), refresh tokens rotados y almacenados hasheados; DPoP (RFC 9449) para los tokens sensibles
- Valida `iss`, `aud`, `exp`; mantén el leeway pequeño
- jsonwebtoken 11 exige que se active exactamente una feature de proveedor criptográfico (`rust_crypto` o `aws_lc_rs`); de lo contrario, `encode` / `decode` provocan un panic en tiempo de ejecución: activa una en `Cargo.toml` y cúbrela con un test (versión 11.1.0 en crates.io; confirma los nombres de las features en su documentación)
- Las claves privadas provienen del almacén de secretos, nunca del repositorio; rota con un `kid` y un endpoint JWKS

### Sesiones y cookies

Prefiere las cookies HTTP-only frente a `localStorage` para las sesiones de navegador:

```rust
// Set-Cookie: session=<opaque>; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=1800
```

- `HttpOnly`, `Secure`, `SameSite=Strict` (o `Lax` cuando se requiera navegación entre sitios), caducidad de 15-30 minutos por inactividad
- Usa `CookieJar` de `axum-extra` (`PrivateCookieJar` / `SignedCookieJar` para protección contra la manipulación) con una clave del almacén de secretos
- Invalida en el servidor al cerrar sesión y al cambiar la contraseña; las peticiones que modifican el estado con autenticación por cookie necesitan protección CSRF (SameSite más una comprobación de origen o un token)

### Protección contra la fuerza bruta: tower_governor

```rust
use std::sync::Arc;
use tower_governor::{governor::GovernorConfigBuilder, GovernorLayer};

let login_limit = Arc::new(
    GovernorConfigBuilder::default()
        .per_second(6)      // un elemento repuesto cada 6 segundos
        .burst_size(5)      // 5 intentos por clave antes de bloquear
        .finish()
        .expect("non-zero rate limit configuration"),
);

let auth_routes = Router::new()
    .route("/login", post(login))
    .layer(GovernorLayer::new(login_limit));

// El extractor de clave por defecto usa la IP del par: servir con connect info
axum::serve(listener, app.into_make_service_with_connect_info::<SocketAddr>()).await?;
```

- Detrás de un proxy inverso, la IP del par es la del proxy: usa un extractor de clave que lea la cabecera de reenvío de confianza solo cuando el proxy la sobrescribe; de lo contrario, los límites son eludibles o compartidos por todos
- Aplica la limitación de tasa por cuenta además de por IP contra el credential stuffing; devuelve errores idénticos para usuario desconocido y contraseña incorrecta
- Expulsa periódicamente las claves obsoletas (`retain_recent`) en una tarea en segundo plano; el estado del limitador está en memoria y es por instancia, usa un almacén compartido en los despliegues con varias réplicas
- Verifica la API frente a la versión instalada de `tower_governor` (0.8.0 en el momento de escribir esto)

---

## A02: Configuración segura

### Secretos: `secrecy`

```rust
use secrecy::{ExposeSecret, SecretString};

#[derive(Clone)]
pub struct Config {
    pub database_url: SecretString,
    pub cookie_key: SecretString,
}

let pool = PgPoolOptions::new().connect(config.database_url.expose_secret()).await?;
```

- `SecretString` / `SecretBox` ocultan la salida de `Debug` y ponen a cero la memoria al hacer drop; llama a `expose_secret()` solo en el punto de uso
- Nunca registres en el log cuerpos o cabeceras de petición enteros: redacta `Authorization`, `Cookie` y los campos de contraseña (`TraceLayer` con `SensitiveRequestHeadersLayer` de tower-http)
- Secretos desde variables de entorno, secretos de Docker/Compose o Vault; nunca en el repositorio, en las capas de la imagen ni en un `.env` commiteado en git
- Escanea el historial con gitleaks o trufflehog en la CI

### Cabeceras de seguridad

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

Para una API JSON, un `Content-Security-Policy` restrictivo con `default-src 'none'` es adecuado; para las respuestas HTML usa una política CSP Level 3 a medida. Define también `Cross-Origin-Opener-Policy`, `Cross-Origin-Resource-Policy` y un `Permissions-Policy` granular. HSTS solo tiene sentido sobre HTTPS (defínelo en el terminador TLS si es ahí donde termina el TLS).

### CORS

```rust
use tower_http::cors::{AllowOrigin, CorsLayer};

let cors = CorsLayer::new()
    .allow_origin(AllowOrigin::exact(HeaderValue::from_static("https://app.example.com")))
    .allow_methods([Method::GET, Method::POST])
    .allow_headers([header::AUTHORIZATION, header::CONTENT_TYPE])
    .max_age(Duration::from_secs(600));
```

Solo orígenes explícitos; los orígenes comodín no pueden combinarse con credenciales y no deben usarse en APIs autenticadas.

### Límites de recursos

- `RequestBodyLimitLayer` (1 MiB por defecto para JSON), límites mayores por ruta para las subidas de archivos
- `TimeoutLayer` en cada petición, timeouts en cada cliente saliente y en cada adquisición de base de datos
- Concurrencia acotada (`tower::limit::ConcurrencyLimitLayer`) y colas acotadas para evitar el agotamiento de memoria
- Subida de archivos: validar el tipo de contenido por los magic bytes, limitar el tamaño, almacenar fuera de la raíz web, generar los nombres en el servidor

---

## A03: Cadena de suministro

| Control | Herramienta / práctica |
|---------|------------------------|
| Builds reproducibles | `Cargo.lock` commiteado, `cargo build --locked` en la CI y en Docker |
| Advisories | `cargo deny check advisories` + `cargo audit` programado (RustSec) |
| Licencias, bans, fuentes | `cargo deny check licenses bans sources` (solo crates.io) |
| Auditorías humanas | `cargo vet` con importaciones de confianza |
| SBOM | `cargo cyclonedx --format json` (CycloneDX) en cada build de release |
| Firma y procedencia | Firmar las imágenes y el SBOM con cosign (Sigstore keyless), procedencia SLSA desde la CI |
| Actualización de dependencias | Dependabot o Renovate, revisar los changelogs; `cargo update -p <crate>` para actualizaciones dirigidas |
| Build scripts y proc macros | Ejecutan código arbitrario en tiempo de build: revisar los nuevos `build.rs` y dependencias proc-macro, compilar en un runner de CI aislado |
| Typosquatting | Comprobar los nombres de los crates, sus propietarios y su número de descargas antes de añadir una dependencia |
| Versiones retiradas (yanked) | `yanked = "deny"` en `deny.toml` (por ejemplo, tokio 1.54.0 fue retirado, la 1.54.1 es la corrección) |

Fija las actions de CI de terceros a SHA de commit y publica los artefactos con procedencia siempre que sea posible (SLSA L1 es realista; no sobrestimes L2/L3).

---

## A09: Logging y monitorización

```rust
use tower_http::trace::TraceLayer;

let app = Router::new()
    // ...
    .layer(TraceLayer::new_for_http()); // spans por petición con método, URI, status, latencia
```

- Logs JSON estructurados mediante `tracing-subscriber`, con un identificador de petición propagado (`SetRequestIdLayer` / `PropagateRequestIdLayer` de tower-http)
- Registra los eventos de autenticación, las denegaciones de permisos, el acceso a datos sensibles, los límites de tasa alcanzados y las anomalías de validación
- Nunca registres contraseñas, tokens, datos personales completos, SQL con los valores de los parámetros, ni devuelvas trazas de pila en las respuestas al cliente
- Conserva los logs al menos un año por cumplimiento normativo; alerta ante fallos de autenticación repetidos y accesos fuera de horario

## A10: Condiciones excepcionales

- Los handlers devuelven `Result<_, AppError>`; `AppError` registra la causa con `tracing::error!` y devuelve un cuerpo genérico RFC 9457
- Añade `tower_http::catch_panic::CatchPanicLayer` como última línea de defensa para convertir un panic en un 500 genérico en lugar de una conexión cortada; no sustituye la eliminación de los `unwrap()`
- Fallar en modo cerrado: cuando no se pueda determinar la autenticación o la autorización, denegar
- Apagar de forma ordenada y drenar las peticiones en curso; gestionar `SIGTERM`

---

## Fuentes

- OWASP Top 10:2025: https://owasp.org/Top10/2025/
- OWASP Password Storage Cheat Sheet (mínimo de Argon2id 19 MiB / t=2 / p=1): https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html
- RFC 9457 (Problem Details), RFC 9449 (DPoP): https://www.rfc-editor.org/rfc/rfc9457
- RustSec: https://rustsec.org/ ; cargo-deny: https://embarkstudios.github.io/cargo-deny/
- Changelog de sqlx 0.9.0 (`SqlSafeStr` / `AssertSqlSafe`): https://github.com/launchbadge/sqlx/blob/main/CHANGELOG.md
- Versiones de los crates (crates.io): argon2 0.6.0, jsonwebtoken 11.1.0, secrecy 0.10.3, tower_governor 0.8.0, validator 0.21.0, garde 0.23.0, tower-http 0.7.1, cargo-audit 0.22.2, cargo-vet 0.10.3, cargo-cyclonedx 0.5.10, tokio 1.54.1

## Checklist

- [ ] `unsafe_code = "forbid"`; ningún `unwrap()` / `expect()` en las rutas de petición
- [ ] Cada consulta acotada al principal autenticado; las rutas protegidas usan el extractor de autenticación
- [ ] Solo parámetros enlazados de SQLx; `AssertSqlSafe` nunca envuelve una entrada de usuario
- [ ] DTO validados (validator / garde), `deny_unknown_fields`, límites de cuerpo y timeouts definidos
- [ ] Contraseñas hasheadas con Argon2id en `spawn_blocking`; parámetros que cumplen el mínimo OWASP o más estrictos
- [ ] JWT verificado con un algoritmo fijado (EdDSA), `iss` / `aud` / `exp` validados, un proveedor criptográfico activado
- [ ] Cookies HTTP-only, Secure, SameSite; CSRF gestionado para la autenticación por cookie
- [ ] Limitación de tasa en las rutas de autenticación (tower_governor) con un extractor de clave correcto
- [ ] Secretos envueltos en `secrecy`, nunca registrados en el log ni commiteados
- [ ] Cabeceras de seguridad y orígenes CORS explícitos configurados
- [ ] `cargo deny check` y `cargo audit` en verde en la CI; `Cargo.lock` commiteado
- [ ] SBOM generado y artefactos firmados; actions de CI fijadas
- [ ] Cuerpos de error problem+json genéricos, sin trazas de pila ni errores SQL expuestos
