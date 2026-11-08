# Rust-/Axum-Entwicklungswerkzeuge

> Alle Befehle laufen im Anwendungscontainer. Mit `docker compose exec app` präfixieren (oder `docker compose run --rm app` für einmalige Aufgaben), damit die Ergebnisse nicht von der lokalen Umgebung abhängen.

## Docker-Setup

### Dockerfile (Multi-Stage mit cargo-chef)

cargo-chef cacht kompilierte Abhängigkeiten in einem eigenen Layer, sodass Änderungen, die nur den Quellcode betreffen, in Sekunden neu gebaut werden. Die Rust-Version über ein Build-Argument fixieren und vor der Verwendung mit den offiziellen Image-Tags abgleichen.

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
# Build dependencies only: cached until Cargo.toml / Cargo.lock change
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

Hinweise:
- `SQLX_OFFLINE=true` lässt die `query!`-Makros die eingecheckten `.sqlx`-Metadaten verwenden, zur Build-Zeit ist keine Datenbank nötig
- `rustls` verwenden (Feature von SQLx und reqwest), um die System-Abhängigkeit von OpenSSL zu vermeiden und eine Distroless- oder `scratch`-Runtime zu ermöglichen, wenn das Binary statisch gelinkt ist
- Als Nicht-Root-Benutzer ausführen; keine Secrets im Image einbinden

### compose.yaml für die Entwicklung

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

Benannte Volumes für die Registry und `target/` halten Neubuilds im Container inkrementell. Datenbank-Image und -Version an die tatsächliche Wahl des Projekts anpassen. Im Dev-Image müssen `cargo-watch` (oder `bacon`) und `sqlx-cli` installiert sein.

---

## Toolchain-Verwaltung

| Element | Praxis |
|---------|--------|
| `rust-toolchain.toml` | Einzige Quelle der Wahrheit für Channel und Komponenten |
| `Cargo.toml` | `edition = "2024"`, `rust-version` auf die MSRV gesetzt |
| Docker | `ARG RUST_VERSION` entspricht `rust-toolchain.toml` |
| Lokaler Manager | `rustup` ist optional; Docker ist die Referenz |

```toml
# rust-toolchain.toml
[toolchain]
channel = "1.99.1"
components = ["rustfmt", "clippy", "llvm-tools-preview"]
profile = "minimal"
```

```toml
# Cargo.toml (workspace root)
[workspace]
resolver = "3"
members = ["crates/*"]

[workspace.package]
edition = "2024"
rust-version = "1.99"
```

- Für Anwendungen eine exakte stabile Version fixieren; bewusst aktualisieren, nachdem das Changelog gelesen wurde
- Rust Stable war zum Zeitpunkt des Schreibens 1.99.1 (1.99.0 erschien am 2026-10-01); alle sechs Wochen erscheint eine neue Stable-Version
- Edition 2024 verwendet für neue Workspaces standardmäßig Resolver 3; bei virtuellen Workspaces ihn explizit setzen
- `rust-version` dokumentiert die MSRV und lässt Cargo kompatible Abhängigkeitsversionen auswählen

---

## Cargo - Wichtige Befehle

```bash
docker compose exec app cargo check --workspace --all-targets      # Fast type check
docker compose exec app cargo build --release -p api               # Release build
docker compose exec app cargo run -p api                           # Run the server
docker compose exec app cargo test --doc                           # Doc tests (nextest skips them)
docker compose exec app cargo add serde --features derive          # Add a dependency
docker compose exec app cargo update -p tokio                      # Targeted update
docker compose exec app cargo tree -d                              # Duplicate versions
docker compose exec app cargo tree -i openssl                      # Why is a crate pulled in
```

### Workspace-Konventionen

```toml
# Cargo.toml (workspace root)
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

Die Anforderungen wurden gegen crates.io geprüft (tower 0.5.3, thiserror 2.0.21, anyhow 1.0.104, tracing 0.1.44, tracing-subscriber 0.3.23). Die Namen der SQLx-Features für Runtime und TLS haben sich in 0.9 geändert (die kombinierten Features im Stil `runtime-tokio-native-tls` wurden entfernt); für die genaue Feature-Liste daher der Dokumentation von 0.9 folgen.

| Regel | Detail |
|-------|--------|
| Gemeinsame Versionen | Nur in `[workspace.dependencies]` |
| Features | `default-features = false`, aktivieren, was genutzt wird |
| Lockfile | `Cargo.lock` für Binaries eingecheckt |
| Profile | `[profile.release]` mit `lto = "thin"`, `codegen-units = 1`, `strip = true`, wenn die Binary-Größe zählt |
| Registry | Nur crates.io, durch `cargo deny` sources erzwungen |

---

## Dev-Schleife: cargo-watch und bacon

```bash
docker compose exec app cargo watch -x check -x "nextest run" -x "run -p api"
docker compose exec app bacon              # TUI: clippy / test / run jobs, configured in bacon.toml
```

- `cargo-watch` startet den Server bei Änderungen neu; `bacon` liefert eine schnellere Feedback-Schleife für Diagnosen
- Beides sind Entwicklungswerkzeuge, die niemals im Produktions-Image installiert werden
- `cargo check` ist viel schneller als `cargo build`; ständig ausführen, clippy vor Commits ausführen

---

## SQLx CLI und Migrationen

```bash
docker compose exec app cargo install sqlx-cli --locked --no-default-features --features rustls,postgres
docker compose exec app sqlx database create
docker compose exec app sqlx migrate add -r create_orders          # Reversible migration pair
docker compose exec app sqlx migrate run
docker compose exec app sqlx migrate revert
docker compose exec app cargo sqlx prepare --workspace              # Write .sqlx offline metadata
docker compose exec app cargo sqlx prepare --check --workspace      # CI: fail if stale
```

### Offline-Modus

1. Die Migrationen gegen eine Entwicklungsdatenbank ausführen
2. `cargo sqlx prepare --workspace` ausführen; es schreibt ein einziges `.sqlx/`-Verzeichnis in die Workspace-Wurzel
3. `.sqlx/` einchecken; Builds mit `SQLX_OFFLINE=true` benötigen keine Datenbank
4. In der CI `cargo sqlx prepare --check --workspace` ausführen, damit veraltete Metadaten den Build scheitern lassen

Zu beachten: Das Speichern der Query-Metadaten muss als `cargo sqlx prepare` aufgerufen werden (die Form als `cargo`-Subcommand). Erneut ausführen, sobald sich ein `query!`- / `query_as!`-Aufruf oder eine Migration ändert.

### Migrationskonventionen

- Ein Belang pro Migration, von `sqlx migrate add` mit Zeitstempel versehen
- Zuerst additive Änderungen (Spalte nullable hinzufügen, auffüllen, dann Constraint setzen), um Rolling Deployments zu ermöglichen
- Eine bereits angewendete Migration niemals bearbeiten; eine neue hinzufügen
- Eingebettete Migrationen (`sqlx::migrate!`) laufen nur bei kleinen Deployments beim Start; für die Produktion einen separaten Migrationsschritt bevorzugen

---

## Umgebung und Konfiguration

```bash
# .env.example (committed; .env is git-ignored)
DATABASE_URL=postgres://postgres:postgres@db:5432/app_development
LISTEN_ADDR=0.0.0.0:3000
RUST_LOG=info
JWT_PUBLIC_KEY_PATH=/run/secrets/jwt_public.pem
```

- Die Konfiguration einmal beim Start in ein typisiertes `Config`-Struct laden (`envy`, `figment` oder das Crate `config`), validieren, schnell scheitern
- Secrets in `secrecy::SecretString` wickeln
- `.env`, private Schlüssel oder Zugangsdaten niemals einchecken; Docker-/Compose-Secrets oder den Vault der Plattform verwenden

---

## IDE- und Editor-Unterstützung

| Werkzeug | Zweck |
|----------|-------|
| rust-analyzer | Language Server (Vervollständigung, Inline-Fehler, Refactoring) |
| `clippy` beim Speichern | `rust-analyzer.check.command = "clippy"` |
| rustfmt beim Speichern | Formatierung |
| CodeLLDB / `rust-gdb` | Debugging |
| `tokio-console` | Inspektion der Runtime-Tasks (benötigt die cfg `tokio_unstable`, nur Entwicklung) |

Container-basierte Workflows: einen Devcontainer oder Remote-Container verwenden, damit rust-analyzer gegen dieselbe Toolchain wie die CI läuft.

---

## CI-Grundgerüst

```yaml
# .github/workflows/ci.yml (essential steps)
steps:
  - uses: actions/checkout@v4
  - run: docker compose run --rm app cargo fmt --check
  - run: docker compose run --rm app cargo clippy --workspace --all-targets --all-features -- -D warnings
  - run: docker compose run --rm app cargo nextest run --workspace
  - run: docker compose run --rm app cargo deny check
  - run: docker compose run --rm app cargo sqlx prepare --check --workspace
```

Siehe `rules/08-quality-tools.md` für die vollständige Pipeline (Abdeckung, Audit, Mutation Testing).

---

## Fehlerbehebung

| Symptom | Wahrscheinliche Ursache | Lösung |
|---------|-------------------------|--------|
| `query!` lässt sich in der CI nicht kompilieren | Keine Datenbank und veraltetes `.sqlx` | `cargo sqlx prepare --workspace`, einchecken, `SQLX_OFFLINE=true` setzen |
| Sehr langsame Docker-Builds | Abhängigkeiten werden jedes Mal neu gebaut | cargo-chef-Layer verwenden, benanntes `target/`-Volume in der Entwicklung |
| `the trait Handler<_, _> is not implemented` | Nicht-`Send`-Future, falsche Reihenfolge der Extractors oder falscher Rückgabetyp | Prüfen, dass der Body-Extractor zuletzt steht; `#[debug_handler]` aus `axum-macros` liefert klare Fehler |
| Link-Fehler auf musl | Native OpenSSL-Abhängigkeit | Auf `rustls`-Features umstellen |
| Doppelte Crate-Versionen | Abweichende Abhängigkeitsanforderungen | `cargo tree -d`, in `[workspace.dependencies]` angleichen |

---

## Quellen

- Rust-Releases: https://releases.rs/ und https://blog.rust-lang.org/2026/10/01/Rust-1.99.0/
- cargo-chef: https://github.com/LukeMathWalker/cargo-chef
- sqlx-cli (Offline-Modus): https://github.com/launchbadge/sqlx/blob/main/sqlx-cli/README.md
- Versionen auf crates.io (axum 0.8.9, tokio 1.54.1, sqlx 0.9.0, tower-http 0.7.1, cargo-nextest 0.9.151, cargo-deny 0.20.2)

## Checkliste

- [ ] `rust-toolchain.toml` fixiert und mit dem Dockerfile abgestimmt
- [ ] `Cargo.lock` eingecheckt; gemeinsame Versionen in `[workspace.dependencies]`
- [ ] Jeder dokumentierte Befehl mit `docker compose exec app` präfixiert
- [ ] Multi-Stage-Dockerfile mit cargo-chef, Runtime-Benutzer ohne Root-Rechte
- [ ] `.sqlx/` eingecheckt und mit `cargo sqlx prepare --check` geprüft
- [ ] `.env` ignoriert, `.env.example` eingecheckt
- [ ] rustfmt, clippy, nextest und cargo-deny laufen in der CI
- [ ] `cargo-watch` / `bacon` nur im Entwicklungs-Image
