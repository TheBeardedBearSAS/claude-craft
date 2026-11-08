# Herramientas de desarrollo Rust / Axum

> Todos los comandos se ejecutan dentro del contenedor de la aplicación. Usa el prefijo `docker compose exec app` (o `docker compose run --rm app` para tareas puntuales) para que los resultados no dependan del entorno local.

## Configuración de Docker

### Dockerfile (multi-stage con cargo-chef)

cargo-chef almacena en caché las dependencias compiladas en una capa separada, de modo que los cambios que solo afectan al código fuente se reconstruyen en segundos. Fija la versión de Rust mediante un argumento de build y compárala con las etiquetas oficiales de la imagen antes de usarla.

```dockerfile
# syntax=docker/dockerfile:1
ARG RUST_VERSION=1.99
FROM docker.io/library/rust:${RUST_VERSION}-slim-bookworm AS chef
RUN cargo install cargo-chef --locked
WORKDIR /app

FROM chef AS planner
COPY . .
RUN cargo chef prepare --recipe-path recipe.json

FROM chef AS builder
RUN apt-get update -qq && \
    apt-get install --no-install-recommends -y pkg-config libssl-dev && \
    rm -rf /var/lib/apt/lists/*
COPY --from=planner /app/recipe.json recipe.json
# Compilar solo las dependencias: en caché hasta que cambien Cargo.toml / Cargo.lock
RUN cargo chef cook --release --recipe-path recipe.json
COPY . .
ENV SQLX_OFFLINE=true
RUN cargo build --release -p api

FROM docker.io/library/debian:bookworm-slim AS runtime
RUN apt-get update -qq && \
    apt-get install --no-install-recommends -y ca-certificates && \
    rm -rf /var/lib/apt/lists/* && \
    groupadd --system --gid 1000 app && \
    useradd app --uid 1000 --gid 1000 --no-create-home --shell /usr/sbin/nologin
COPY --from=builder /app/target/release/api /usr/local/bin/api
USER 1000:1000
EXPOSE 3000
ENTRYPOINT ["/usr/local/bin/api"]
```

Notas:
- `SQLX_OFFLINE=true` hace que las macros `query!` usen los metadatos `.sqlx` commiteados, no se necesita ninguna base de datos en tiempo de build
- Usa `rustls` (feature de SQLx y reqwest) para evitar la dependencia del sistema con OpenSSL y habilitar un runtime distroless o `scratch` cuando el binario está enlazado estáticamente
- Ejecuta con un usuario no root; no montes secretos en la imagen

### compose.yaml para desarrollo

```yaml
services:
  app:
    build:
      context: .
      target: chef
    command: cargo watch -x "run -p api"
    environment:
      DATABASE_URL: postgres://postgres:postgres@db:5432/app_development
      RUST_LOG: info,tower_http=debug
    volumes:
      - .:/app
      - cargo-registry:/usr/local/cargo/registry
      - cargo-target:/app/target
    ports:
      - "3000:3000"
    depends_on:
      db:
        condition: service_healthy

  db:
    image: postgres:17
    environment:
      POSTGRES_PASSWORD: postgres
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 5s
      timeout: 3s
      retries: 10

volumes:
  cargo-registry:
  cargo-target:
  pgdata:
```

Los volúmenes con nombre para el registry y `target/` mantienen las recompilaciones incrementales dentro del contenedor. Ajusta la imagen y la versión de la base de datos a la elección real del proyecto. La imagen de desarrollo debe tener instalados `cargo-watch` (o `bacon`) y `sqlx-cli`.

---

## Gestión del toolchain

| Elemento | Práctica |
|----------|----------|
| `rust-toolchain.toml` | Fuente única de verdad para el canal y los componentes |
| `Cargo.toml` | `edition = "2024"`, `rust-version` fijado al MSRV |
| Docker | `ARG RUST_VERSION` coincide con `rust-toolchain.toml` |
| Gestor local | `rustup` es opcional; Docker es la referencia |

```toml
# rust-toolchain.toml
[toolchain]
channel = "1.99.1"
components = ["rustfmt", "clippy", "llvm-tools-preview"]
profile = "minimal"
```

```toml
# Cargo.toml (raíz del workspace)
[workspace]
resolver = "3"
members = ["crates/*"]

[workspace.package]
edition = "2024"
rust-version = "1.99"
```

- Fija una versión estable exacta para las aplicaciones; actualiza de forma deliberada, habiendo leído el changelog
- Rust estable era la 1.99.1 en el momento de escribir esto (la 1.99.0 se publicó el 2026-10-01); se publica una nueva versión estable cada seis semanas
- La edition 2024 usa el resolver 3 por defecto en los workspaces nuevos; defínelo explícitamente en los workspaces virtuales
- `rust-version` documenta el MSRV y permite que Cargo seleccione versiones de dependencias compatibles

---

## Cargo - Comandos esenciales

```bash
docker compose exec app cargo check --workspace --all-targets      # Comprobación rápida de tipos
docker compose exec app cargo build --release -p api               # Build de release
docker compose exec app cargo run -p api                           # Ejecutar el servidor
docker compose exec app cargo test --doc                           # Doc tests (nextest los omite)
docker compose exec app cargo add serde --features derive          # Añadir una dependencia
docker compose exec app cargo update -p tokio                      # Actualización dirigida
docker compose exec app cargo tree -d                              # Versiones duplicadas
docker compose exec app cargo tree -i openssl                      # Por qué se incorpora un crate
```

### Convenciones del workspace

```toml
# Cargo.toml (raíz del workspace)
[workspace.dependencies]
axum = "0.8"
tokio = { version = "1", features = ["rt-multi-thread", "macros", "signal"] }
tower = "0.5"
tower-http = { version = "0.7", features = ["trace", "timeout", "limit", "cors"] }
serde = { version = "1", features = ["derive"] }
thiserror = "2"
anyhow = "1"
tracing = "0.1"
tracing-subscriber = { version = "0.3", features = ["env-filter", "json"] }

# crates/api/Cargo.toml
[dependencies]
axum.workspace = true
tokio.workspace = true
```

Los requisitos se verificaron en crates.io (tower 0.5.3, thiserror 2.0.21, anyhow 1.0.104, tracing 0.1.44, tracing-subscriber 0.3.23). Los nombres de las features de runtime y TLS de SQLx cambiaron en la 0.9 (se eliminaron las features combinadas del estilo `runtime-tokio-native-tls`), así que sigue la documentación de la 0.9 para la lista exacta de features.

| Regla | Detalle |
|-------|---------|
| Versiones compartidas | Solo en `[workspace.dependencies]` |
| Features | `default-features = false`, activar lo que se usa |
| Lockfile | `Cargo.lock` commiteado para los binarios |
| Perfiles | `[profile.release]` con `lto = "thin"`, `codegen-units = 1`, `strip = true` cuando el tamaño del binario importe |
| Registry | Solo crates.io, garantizado por las sources de `cargo deny` |

---

## Bucle de desarrollo: cargo-watch y bacon

```bash
docker compose exec app cargo watch -x check -x "nextest run" -x "run -p api"
docker compose exec app bacon              # TUI: trabajos de clippy / test / run, configurados en bacon.toml
```

- `cargo-watch` reinicia el servidor al detectar cambios; `bacon` ofrece un bucle de retroalimentación más rápido sobre los diagnósticos
- Ambas son herramientas de desarrollo, nunca se instalan en la imagen de producción
- `cargo check` es mucho más rápido que `cargo build`; ejecútalo constantemente, ejecuta clippy antes de los commits

---

## SQLx CLI y migraciones

```bash
docker compose exec app cargo install sqlx-cli --locked --no-default-features --features rustls,postgres
docker compose exec app sqlx database create
docker compose exec app sqlx migrate add -r create_orders          # Par de migraciones reversibles
docker compose exec app sqlx migrate run
docker compose exec app sqlx migrate revert
docker compose exec app cargo sqlx prepare --workspace              # Escribir los metadatos sin conexión de .sqlx
docker compose exec app cargo sqlx prepare --check --workspace      # CI: fallar si están obsoletos
```

### Modo sin conexión (offline)

1. Ejecuta las migraciones contra una base de datos de desarrollo
2. Ejecuta `cargo sqlx prepare --workspace`; escribe un único directorio `.sqlx/` en la raíz del workspace
3. Commitea `.sqlx/`; los builds con `SQLX_OFFLINE=true` no necesitan base de datos
4. En la CI, ejecuta `cargo sqlx prepare --check --workspace` para que unos metadatos obsoletos hagan fallar el build

Ten en cuenta que guardar los metadatos de las consultas debe invocarse como `cargo sqlx prepare` (la forma de subcomando de `cargo`). Vuelve a ejecutarlo cada vez que cambie una llamada a `query!` / `query_as!` o una migración.

### Convenciones de migración

- Una sola preocupación por migración, con marca de tiempo generada por `sqlx migrate add`
- Primero los cambios aditivos (añadir la columna como nullable, rellenar, luego restringir) para permitir despliegues progresivos
- Nunca edites una migración ya aplicada; añade una nueva
- Las migraciones embebidas (`sqlx::migrate!`) se ejecutan en el arranque solo en despliegues pequeños; en producción, preferir un paso de migración separado

---

## Entorno y configuración

```bash
# .env.example (commiteado; .env está ignorado por git)
DATABASE_URL=postgres://postgres:postgres@db:5432/app_development
LISTEN_ADDR=0.0.0.0:3000
RUST_LOG=info
JWT_PUBLIC_KEY_PATH=/run/secrets/jwt_public.pem
```

- Carga la configuración una sola vez en el arranque en un struct `Config` tipado (crates `envy`, `figment` o `config`), valida y falla rápido
- Envuelve los secretos en `secrecy::SecretString`
- Nunca commitees `.env`, claves privadas ni credenciales; usa los secretos de Docker/Compose o el vault de la plataforma

---

## Soporte de IDE y editor

| Herramienta | Propósito |
|-------------|-----------|
| rust-analyzer | Servidor de lenguaje (autocompletado, errores en línea, refactorización) |
| `clippy` al guardar | `rust-analyzer.check.command = "clippy"` |
| rustfmt al guardar | Formato |
| CodeLLDB / `rust-gdb` | Depuración |
| `tokio-console` | Inspección de las tareas del runtime (requiere el cfg `tokio_unstable`, solo para desarrollo) |

Flujos de trabajo basados en contenedores: usa un devcontainer o remote-container para que rust-analyzer se ejecute con el mismo toolchain que la CI.

---

## Esqueleto de CI

```yaml
# .github/workflows/ci.yml (pasos esenciales)
steps:
  - uses: actions/checkout@v4
  - run: docker compose run --rm app cargo fmt --check
  - run: docker compose run --rm app cargo clippy --workspace --all-targets --all-features -- -D warnings
  - run: docker compose run --rm app cargo nextest run --workspace
  - run: docker compose run --rm app cargo deny check
  - run: docker compose run --rm app cargo sqlx prepare --check --workspace
```

Consulta `rules/08-quality-tools.md` para el pipeline completo (cobertura, audit, mutation testing).

---

## Resolución de problemas

| Síntoma | Causa probable | Solución |
|---------|----------------|----------|
| `query!` no compila en la CI | Sin base de datos y `.sqlx` obsoleto | `cargo sqlx prepare --workspace`, commitear, definir `SQLX_OFFLINE=true` |
| Builds de Docker muy lentos | Las dependencias se recompilan cada vez | Usar capas de cargo-chef, volumen `target/` con nombre en desarrollo |
| `the trait Handler<_, _> is not implemented` | Future no `Send`, orden de extractors o tipo de retorno incorrectos | Comprobar que el extractor de cuerpo va el último; `#[debug_handler]` de `axum-macros` da errores claros |
| Errores de enlazado en musl | Dependencia nativa de OpenSSL | Cambiar a las features de `rustls` |
| Versiones de crates duplicadas | Requisitos de dependencias divergentes | `cargo tree -d`, alinear en `[workspace.dependencies]` |

---

## Fuentes

- Lanzamientos de Rust: https://releases.rs/ y https://blog.rust-lang.org/2026/10/01/Rust-1.99.0/
- cargo-chef: https://github.com/LukeMathWalker/cargo-chef
- sqlx-cli (modo offline): https://github.com/launchbadge/sqlx/blob/main/sqlx-cli/README.md
- Versiones de crates.io (axum 0.8.9, tokio 1.54.1, sqlx 0.9.0, tower-http 0.7.1, cargo-nextest 0.9.151, cargo-deny 0.20.2)

## Checklist

- [ ] `rust-toolchain.toml` fijado y alineado con el Dockerfile
- [ ] `Cargo.lock` commiteado; versiones compartidas en `[workspace.dependencies]`
- [ ] Todos los comandos documentados llevan el prefijo `docker compose exec app`
- [ ] Dockerfile multi-stage con cargo-chef, usuario de runtime no root
- [ ] `.sqlx/` commiteado y verificado con `cargo sqlx prepare --check`
- [ ] `.env` ignorado, `.env.example` commiteado
- [ ] rustfmt, clippy, nextest y cargo-deny se ejecutan en la CI
- [ ] `cargo-watch` / `bacon` solo en la imagen de desarrollo
