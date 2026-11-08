# Boas Práticas de Segurança Rust / Axum

A segurança é uma prioridade máxima. Referências: **OWASP Top 10:2025**, OWASP ASVS 5.0, advisories do RustSec. O Rust elimina classes inteiras de bugs de segurança de memória, mas não falhas de lógica, injeção, controle de acesso quebrado ou riscos de supply chain. O cargo-deny e o cargo-audit rodam em todo build de CI.

> Os comandos executam no container: `docker compose exec app cargo deny check`, `docker compose exec app cargo audit`.

## OWASP Top 10:2025 em Rust / Axum

| # | Categoria | Defesa em Rust / Axum |
|---|-----------|-----------------------|
| A01 | Broken Access Control (incl. SSRF) | Restrinja toda consulta ao principal autenticado, extractor de autenticação tipado, negar por padrão, allow-list de hosts de saída |
| A02 | Security Misconfiguration | Layer de headers de segurança, origens CORS explícitas, TLS na borda, corpos de erro genéricos, sem endpoints de debug |
| A03 | Software Supply Chain Failures | `Cargo.lock` versionado, cargo-deny, cargo-audit, cargo-vet, SBOM (cargo-cyclonedx), actions de CI fixadas |
| A04 | Cryptographic Failures | Argon2id, JWT EdDSA, `rustls`, `secrecy`, CSPRNG do SO (`OsRng`), sem criptografia caseira |
| A05 | Injection | Parâmetros bind do SQLx, desserialização tipada, validação (validator / garde), sem interpolação em shell |
| A06 | Insecure Design | Modelagem de ameaças, rate limiting, limites de corpo, timeouts, privilégio mínimo |
| A07 | Authentication Failures | Argon2id, MFA, limites contra força bruta (tower_governor), tokens de curta duração, invalidação de sessão |
| A08 | Software or Data Integrity Failures | Assinaturas verificadas, `deny_unknown_fields`, imagens e artefatos assinados, sem desserialização insegura de formatos não confiáveis |
| A09 | Security Logging and Alerting Failures | `tracing` com IDs de requisição, redação de segredos, eventos de auditoria, alertas centralizados |
| A10 | Mishandling of Exceptional Conditions | `Result` em todo lugar, sem panics em caminhos de requisição, `AppError` com corpos genéricos, falhar de forma fechada |

---

## Segurança de Memória e `unsafe`

```rust
#![forbid(unsafe_code)]
```

- Proíba `unsafe` nos crates de aplicação via `[workspace.lints.rust] unsafe_code = "forbid"`
- Um panic é uma primitiva de negação de serviço: nenhum `unwrap()` / `expect()` / indexação em caminhos de requisição (`clippy::unwrap_used = "deny"`)
- O overflow de inteiros faz wrap em builds de release: use aritmética `checked_*` / `saturating_*` para valores monetários e quantidades, ou habilite `overflow-checks = true` no profile de release
- `cargo geiger` (ou `cargo tree`) mostra o `unsafe` nas dependências; prefira crates bem auditados

---

## A01: Broken Access Control

### Restrinja Toda Consulta ao Principal

```rust
// RUIM: referência direta insegura a objeto
async fn show(State(s): State<AppState>, Path(id): Path<Uuid>) -> Result<Json<Order>, AppError> {
    Ok(Json(s.orders.find(id).await?.ok_or(AppError::NotFound)?))
}

// BOM: somente os pedidos de quem chama podem ser encontrados
async fn show(
    State(s): State<AppState>,
    auth: AuthenticatedUser,
    Path(id): Path<Uuid>,
) -> Result<Json<Order>, AppError> {
    let order = s.orders.find_for_user(id, auth.user_id).await?.ok_or(AppError::NotFound)?;
    Ok(Json(order))
}
```

Retornar `404` para registros de outra pessoa evita revelar a existência deles.

### Autenticação e Autorização Tipadas

- Os handlers protegidos declaram um extractor `AuthenticatedUser`; uma rota sem ele é pública por construção, então revise todas as rotas públicas
- Verificações de papel por meio de um extractor tipado ou de uma função de política, nunca por uma string de papel vinda do corpo da requisição
- Nunca aceite `role`, `is_admin` ou `user_id` de payloads do cliente: os DTOs são separados dos tipos de domínio e omitem os campos privilegiados
- Negar por padrão: aplique um layer de autenticação a todo o router protegido e monte as rotas públicas separadamente

### SSRF

```rust
// RUIM: URL controlada pelo usuário acessada no servidor
let body = reqwest::get(&params.url).await?.text().await?;

// BOM: allow-list, somente https, sem redirecionamentos, com timeouts
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

Quando os hosts não puderem entrar em uma allow-list, resolva o DNS você mesmo e rejeite loopback, link-local (incluindo os endereços de metadados de nuvem) e faixas privadas; depois conecte-se ao endereço resolvido.

### Open Redirects

Redirecione apenas para caminhos relativos ou origens da allow-list; nunca `Redirect::to(&query.next)` sem verificação.

---

## A05: Injection

### SQL: Somente Parâmetros Bind

```rust
// RUIM: montagem de string (injeção de SQL)
sqlx::query(&format!("SELECT * FROM users WHERE email = '{email}'"));

// BOM: parâmetros bind
sqlx::query_as::<_, User>("SELECT * FROM users WHERE email = $1")
    .bind(email)
    .fetch_optional(&pool)
    .await?;

// BOM: verificado em tempo de compilação
sqlx::query_as!(User, "SELECT id, email FROM users WHERE email = $1", email)
    .fetch_optional(&pool)
    .await?;
```

O sqlx 0.9 faz as funções `query*()` receberem `impl SqlSafeStr`: literais de string passam, mas `String`s em tempo de execução devem ser envolvidas em `AssertSqlSafe(...)`. Esse wrapper é uma promessa explícita de que a string não contém dados não confiáveis; **faça grep de `AssertSqlSafe` na revisão** e nunca envolva dados do usuário.

### Identificadores Dinâmicos (ORDER BY, colunas)

Parâmetros bind não podem carregar identificadores. Mapeie as escolhas do usuário para um enum fechado:

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

Monte a consulta final apenas com valores `&'static str`, ou use `sqlx::QueryBuilder` com `push_bind` para os valores.

### Comandos, Caminhos e Templates

- Evite `std::process::Command` com entrada do usuário; passe os argumentos como itens separados (nunca por `sh -c`)
- Parâmetros de caminho: canonicalize e verifique o prefixo, rejeite `..`, ou use IDs opacos em vez de nomes de arquivo
- Saída HTML: use um motor de templates com escape automático (askama, minijinja, maud); nunca concatene entrada do usuário em HTML

---

## Validação de Entrada

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

- Use `validator` (0.21.0) ou `garde` (0.23.0) de forma declarativa, ou construtores de newtype escritos à mão (`EmailAddress::parse`); faça o parse uma única vez na fronteira
- `#[serde(deny_unknown_fields)]` para DTOs estritos; DTOs separados por caso de uso para evitar mass assignment
- Limite os tamanhos: `RequestBodyLimitLayer`, `DefaultBodyLimit`, comprimentos máximos de strings, tetos de paginação (`limit <= 100`)
- Envolva o `Json` em um extractor que mapeie as rejeições de corpo malformado para o formato problem+json sem expor detalhes internos
- Senhas: mínimo de 12 caracteres, permita qualquer caractere imprimível, sem regras de composição, sem rotação periódica (NIST SP 800-63B-4)

---

## A04: Criptografia e Senhas

### Hash de Senhas: Argon2id

```rust
use argon2::{Algorithm, Argon2, Params, Version};

// Mínimo OWASP: 19 MiB (19_456 KiB), t=2, p=1
// Recomendação interna: 128 MiB (131_072 KiB), t>=3, p=1 (t=4 para alta segurança)
pub fn hasher() -> Result<Argon2<'static>, argon2::Error> {
    let params = Params::new(131_072, 3, 1, None)?; // m_cost em KiB, t_cost, p_cost
    Ok(Argon2::new(Algorithm::Argon2id, Version::V0x13, params))
}
```

- O Argon2id é recomendado para todo código novo; nunca MD5, SHA-1 ou um SHA-256 puro; o bcrypt é aceitável como legado apenas onde o Argon2id não estiver disponível (cost >= 12, limite de entrada de 72 bytes)
- A memória é a principal alavanca: dimensione os parâmetros de acordo com o seu orçamento de latência (mire em algumas centenas de milissegundos por hash no hardware de produção)
- O hashing consome muita CPU e memória: execute-o em `tokio::task::spawn_blocking`, nunca diretamente no executor assíncrono
- Armazene a string PHC (`$argon2id$v=19$m=...`), que incorpora os parâmetros e o salt; no login, refaça o hash quando os parâmetros estiverem desatualizados
- A geração do salt e as assinaturas de `hash_password` e `verify_password` mudaram entre as releases do `argon2` / `password-hash` (o argon2 0.6.0 é o atual): siga a página do docs.rs da versão instalada em vez de copiar trechos mais antigos
- Compare segredos em tempo constante (`subtle::ConstantTimeEq`), nunca com `==`

### Aleatoriedade

Use o CSPRNG do sistema operacional (`rand::rngs::OsRng` / `getrandom`) para tokens, salts e chaves de API; nunca `rand::thread_rng` com seed de tempo, nunca `fastrand` para segredos. Gere pelo menos 128 bits para tokens de sessão ou de redefinição e armazene apenas o hash deles.

### TLS

Termine o TLS no reverse proxy ou no load balancer, ou use `rustls` no próprio processo (`axum-server` com rustls). Prefira o `rustls` ao OpenSSL nativo para clientes de saída (feature rustls do `reqwest`, feature rustls do SQLx). Exija no mínimo TLS 1.2, de preferência TLS 1.3.

---

## A07: Autenticação

### JWT: EdDSA com Algoritmo Fixado

```rust
use jsonwebtoken::{decode, encode, Algorithm, DecodingKey, EncodingKey, Header, Validation};

pub fn issue(claims: &Claims, private_pem: &[u8]) -> Result<String, jsonwebtoken::errors::Error> {
    let key = EncodingKey::from_ed_pem(private_pem)?;
    encode(&Header::new(Algorithm::EdDSA), claims, &key)
}

pub fn verify(token: &str, public_pem: &[u8]) -> Result<Claims, jsonwebtoken::errors::Error> {
    let key = DecodingKey::from_ed_pem(public_pem)?;
    let mut validation = Validation::new(Algorithm::EdDSA); // algoritmo fixado pelo verificador
    validation.set_issuer(&["https://auth.example.com"]);
    validation.set_audience(&["my-api"]);
    validation.set_required_spec_claims(&["exp", "iss", "aud", "sub"]);
    validation.leeway = 5;
    Ok(decode::<Claims>(token, &key, &validation)?.claims)
}
```

- **EdDSA (Ed25519) como primeira escolha**, ES256 em seguida, RS256 menos preferido (aceitável quando o provedor de identidade o impõe)
- `Validation::new(Algorithm::EdDSA)` restringe os algoritmos aceitos: nunca leia `alg` do header do token para escolher a chave ou o algoritmo (algorithm confusion)
- Expiração curta (15 minutos), refresh tokens rotacionados e armazenados com hash; DPoP (RFC 9449) para tokens sensíveis
- Valide `iss`, `aud`, `exp`; mantenha o leeway pequeno
- O jsonwebtoken 11 exige que exatamente uma feature de provedor de criptografia (`rust_crypto` ou `aws_lc_rs`) esteja habilitada; caso contrário, `encode` / `decode` entram em panic em tempo de execução: habilite uma no `Cargo.toml` e cubra-a com um teste (versão 11.1.0 no crates.io; confirme os nomes das features na documentação)
- As chaves privadas vêm do secret store, nunca do repositório; faça a rotação com um `kid` e um endpoint JWKS

### Sessões e Cookies

Prefira cookies HTTP-only ao `localStorage` para sessões de navegador:

```rust
// Set-Cookie: session=<opaque>; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=1800
```

- `HttpOnly`, `Secure`, `SameSite=Strict` (ou `Lax` quando a navegação entre sites for necessária), expiração de 15 a 30 minutos de inatividade
- Use o `CookieJar` do `axum-extra` (`PrivateCookieJar` / `SignedCookieJar` para proteção contra adulteração) com uma chave do secret store
- Invalide no servidor no logout e na troca de senha; requisições que alteram estado com autenticação por cookie precisam de proteção CSRF (SameSite mais uma verificação de origem ou um token)

### Proteção contra Força Bruta: tower_governor

```rust
use std::sync::Arc;
use tower_governor::{governor::GovernorConfigBuilder, GovernorLayer};

let login_limit = Arc::new(
    GovernorConfigBuilder::default()
        .per_second(6)      // um elemento reposto a cada 6 segundos
        .burst_size(5)      // 5 tentativas por chave antes do bloqueio
        .finish()
        .expect("non-zero rate limit configuration"),
);

let auth_routes = Router::new()
    .route("/login", post(login))
    .layer(GovernorLayer::new(login_limit));

// O extractor de chave padrão usa o IP do peer: sirva com connect info
axum::serve(listener, app.into_make_service_with_connect_info::<SocketAddr>()).await?;
```

- Atrás de um reverse proxy, o IP do peer é o do proxy: use um extractor de chave que leia o header de encaminhamento confiável somente se o proxy o sobrescrever; caso contrário, os limites podem ser contornados ou compartilhados por todos
- Aplique rate limit por conta e também por IP contra credential stuffing; retorne erros idênticos para usuário desconhecido e senha incorreta
- Remova periodicamente as chaves obsoletas (`retain_recent`) em uma task em segundo plano; o estado do limitador fica em memória e por instância, use um store compartilhado em deploys com várias réplicas
- Confira a API na versão instalada do `tower_governor` (0.8.0 no momento da redação)

---

## A02: Configuração Segura

### Segredos: `secrecy`

```rust
use secrecy::{ExposeSecret, SecretString};

#[derive(Clone)]
pub struct Config {
    pub database_url: SecretString,
    pub cookie_key: SecretString,
}

let pool = PgPoolOptions::new().connect(config.database_url.expose_secret()).await?;
```

- `SecretString` / `SecretBox` ocultam a saída de `Debug` e zeram a memória no drop; chame `expose_secret()` apenas no ponto de uso
- Nunca registre em log corpos ou headers de requisição por inteiro: redija `Authorization`, `Cookie` e campos de senha (`TraceLayer` com `SensitiveRequestHeadersLayer` do tower-http)
- Segredos a partir de variáveis de ambiente, secrets do Docker/Compose ou Vault; nunca no repositório, nas camadas da imagem ou em um `.env` versionado no git
- Varra o histórico com gitleaks ou trufflehog na CI

### Headers de Segurança

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

Para uma API JSON, uma `Content-Security-Policy` restritiva com `default-src 'none'` é apropriada; para respostas HTML, use uma política CSP Level 3 sob medida. Defina também `Cross-Origin-Opener-Policy`, `Cross-Origin-Resource-Policy` e uma `Permissions-Policy` granular. O HSTS só faz sentido sobre HTTPS (defina-o no terminador de TLS, se for onde o TLS termina).

### CORS

```rust
use tower_http::cors::{AllowOrigin, CorsLayer};

let cors = CorsLayer::new()
    .allow_origin(AllowOrigin::exact(HeaderValue::from_static("https://app.example.com")))
    .allow_methods([Method::GET, Method::POST])
    .allow_headers([header::AUTHORIZATION, header::CONTENT_TYPE])
    .max_age(Duration::from_secs(600));
```

Somente origens explícitas; origens curinga não podem ser combinadas com credenciais e não devem ser usadas em APIs autenticadas.

### Limites de Recursos

- `RequestBodyLimitLayer` (1 MiB por padrão para JSON), limites maiores por rota para uploads
- `TimeoutLayer` em toda requisição, timeouts em todo cliente de saída e na aquisição de conexões do banco de dados
- Concorrência limitada (`tower::limit::ConcurrencyLimitLayer`) e filas limitadas para evitar esgotamento de memória
- Upload de arquivos: valide o tipo de conteúdo pelos magic bytes, limite o tamanho, armazene fora da raiz web, gere os nomes no servidor

---

## A03: Supply Chain

| Controle | Ferramenta / prática |
|----------|----------------------|
| Builds reprodutíveis | `Cargo.lock` versionado, `cargo build --locked` na CI e no Docker |
| Advisories | `cargo deny check advisories` + `cargo audit` agendado (RustSec) |
| Licenças, bans, sources | `cargo deny check licenses bans sources` (somente crates.io) |
| Auditorias humanas | `cargo vet` com imports confiáveis |
| SBOM | `cargo cyclonedx --format json` (CycloneDX) em todo build de release |
| Assinatura e proveniência | Assine as imagens e o SBOM com cosign (Sigstore keyless), proveniência SLSA a partir da CI |
| Atualização de dependências | Dependabot ou Renovate, leia os changelogs; `cargo update -p <crate>` para atualizações pontuais |
| Build scripts e proc macros | Executam código arbitrário em tempo de build: revise novos `build.rs` e dependências de proc-macro, faça o build em um runner de CI isolado |
| Typosquatting | Verifique nomes, proprietários e número de downloads dos crates antes de adicionar uma dependência |
| Releases yanked | `yanked = "deny"` no `deny.toml` (por exemplo, o tokio 1.54.0 foi yanked, a 1.54.1 é a correção) |

Fixe as actions de CI de terceiros em SHAs de commit e publique os artefatos com proveniência sempre que possível (o SLSA L1 é realista; não declare L2/L3 em excesso).

---

## A09: Logging e Monitoramento

```rust
use tower_http::trace::TraceLayer;

let app = Router::new()
    // ...
    .layer(TraceLayer::new_for_http()); // spans por requisição com método, URI, status, latência
```

- Logs JSON estruturados via `tracing-subscriber`, com um ID de requisição propagado (`SetRequestIdLayer` / `PropagateRequestIdLayer` do tower-http)
- Registre eventos de autenticação, negações de permissão, acessos a dados sensíveis, atingimentos de rate limit e anomalias de validação
- Nunca registre senhas, tokens, dados pessoais completos, SQL com valores de parâmetros nem stack traces nas respostas ao cliente
- Retenha os logs por pelo menos um ano para conformidade; alerte sobre falhas repetidas de autenticação e acessos fora do horário

## A10: Condições Excepcionais

- Os handlers retornam `Result<_, AppError>`; o `AppError` registra a causa com `tracing::error!` e retorna um corpo genérico conforme a RFC 9457
- Adicione `tower_http::catch_panic::CatchPanicLayer` como última linha de defesa para transformar um panic em um 500 genérico em vez de uma conexão interrompida; ele não substitui a remoção dos `unwrap()`
- Falhe de forma fechada: quando a autenticação ou a autorização não puder ser determinada, negue
- Encerre de forma graciosa e drene as requisições em andamento; trate o `SIGTERM`

---

## Fontes

- OWASP Top 10:2025: https://owasp.org/Top10/2025/
- OWASP Password Storage Cheat Sheet (mínimo Argon2id de 19 MiB / t=2 / p=1): https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html
- RFC 9457 (Problem Details), RFC 9449 (DPoP): https://www.rfc-editor.org/rfc/rfc9457
- RustSec: https://rustsec.org/ ; cargo-deny: https://embarkstudios.github.io/cargo-deny/
- Changelog do sqlx 0.9.0 (`SqlSafeStr` / `AssertSqlSafe`): https://github.com/launchbadge/sqlx/blob/main/CHANGELOG.md
- Versões dos crates (crates.io): argon2 0.6.0, jsonwebtoken 11.1.0, secrecy 0.10.3, tower_governor 0.8.0, validator 0.21.0, garde 0.23.0, tower-http 0.7.1, cargo-audit 0.22.2, cargo-vet 0.10.3, cargo-cyclonedx 0.5.10, tokio 1.54.1

## Checklist

- [ ] `unsafe_code = "forbid"`; nenhum `unwrap()` / `expect()` em caminhos de requisição
- [ ] Toda consulta restrita ao principal autenticado; as rotas protegidas usam o extractor de autenticação
- [ ] Somente parâmetros bind do SQLx; `AssertSqlSafe` nunca envolve dados do usuário
- [ ] DTOs validados (validator / garde), `deny_unknown_fields`, limites de corpo e timeouts definidos
- [ ] Senhas com hash Argon2id em `spawn_blocking`; parâmetros atendem ao mínimo da OWASP ou mais rigorosos
- [ ] JWT verificado com algoritmo fixado (EdDSA), `iss` / `aud` / `exp` validados, um provedor de criptografia habilitado
- [ ] Cookies HTTP-only, Secure, SameSite; CSRF tratado para a autenticação por cookie
- [ ] Rate limiting nas rotas de autenticação (tower_governor) com um extractor de chave correto
- [ ] Segredos envolvidos em `secrecy`, nunca registrados em log nem versionados
- [ ] Headers de segurança e origens CORS explícitas configurados
- [ ] `cargo deny check` e `cargo audit` verdes na CI; `Cargo.lock` versionado
- [ ] SBOM gerado e artefatos assinados; actions de CI fixadas
- [ ] Corpos de erro problem+json genéricos, sem expor stack traces nem erros SQL
