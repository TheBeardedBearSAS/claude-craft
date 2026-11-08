# Outils de Développement Rust / Axum

> Toutes les commandes s'exécutent dans le conteneur de l'application. Préfixez avec `docker compose exec app` (ou `docker compose run --rm app` pour les tâches ponctuelles) afin que les résultats ne dépendent pas de l'environnement local.

## Configuration Docker

### Dockerfile (multi-stage avec cargo-chef)

cargo-chef met en cache les dépendances compilées dans une couche séparée, de sorte que les changements limités au code source se reconstruisent en quelques secondes. Épinglez la version de Rust via un argument de build et vérifiez-la par rapport aux tags d'images officielles avant utilisation.

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

Notes :
- `SQLX_OFFLINE=true` fait utiliser aux macros `query!` les métadonnées `.sqlx` versionnées, aucune base de données n'est nécessaire au moment du build
- Utilisez `rustls` (feature de SQLx et reqwest) pour éviter la dépendance système à OpenSSL et permettre un runtime distroless ou `scratch` lorsque le binaire est lié statiquement
- Exécutez sous un utilisateur non-root ; ne montez aucun secret dans l'image

### compose.yaml pour le développement

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

Les volumes nommés pour le registry et `target/` gardent les rebuilds incrémentaux dans le conteneur. Adaptez l'image et la version de la base de données au choix réel du projet. L'image de développement doit avoir `cargo-watch` (ou `bacon`) et `sqlx-cli` installés.

---

## Gestion de la toolchain

| Élément | Pratique |
|---------|----------|
| `rust-toolchain.toml` | Source unique de vérité pour le canal et les composants |
| `Cargo.toml` | `edition = "2024"`, `rust-version` fixé au MSRV |
| Docker | `ARG RUST_VERSION` correspond à `rust-toolchain.toml` |
| Gestionnaire local | `rustup` est optionnel ; Docker fait référence |

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

- Épinglez une version stable exacte pour les applications ; montez de version délibérément, après lecture du changelog
- Rust stable était en 1.99.1 au moment de la rédaction (1.99.0 publiée le 2026-10-01) ; une nouvelle version stable sort toutes les six semaines
- L'édition 2024 utilise le resolver 3 par défaut pour les nouveaux workspaces ; définissez-le explicitement pour les workspaces virtuels
- `rust-version` documente le MSRV et permet à Cargo de sélectionner des versions de dépendances compatibles

---

## Cargo - Commandes essentielles

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

### Conventions de workspace

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

Les exigences ont été vérifiées sur crates.io (tower 0.5.3, thiserror 2.0.21, anyhow 1.0.104, tracing 0.1.44, tracing-subscriber 0.3.23). Les noms des features de runtime et de TLS de SQLx ont changé en 0.9 (les features combinées de style `runtime-tokio-native-tls` ont été supprimées) ; suivez donc la documentation 0.9 pour la liste exacte des features.

| Règle | Détail |
|-------|--------|
| Versions partagées | `[workspace.dependencies]` uniquement |
| Features | `default-features = false`, activer ce qui est utilisé |
| Lockfile | `Cargo.lock` versionné pour les binaires |
| Profils | `[profile.release]` avec `lto = "thin"`, `codegen-units = 1`, `strip = true` lorsque la taille du binaire compte |
| Registry | crates.io uniquement, imposé par les sources `cargo deny` |

---

## Boucle de développement : cargo-watch et bacon

```bash
docker compose exec app cargo watch -x check -x "nextest run" -x "run -p api"
docker compose exec app bacon              # TUI: clippy / test / run jobs, configured in bacon.toml
```

- `cargo-watch` redémarre le serveur à chaque changement ; `bacon` offre une boucle de retour plus rapide sur les diagnostics
- Les deux sont des outils de développement, jamais installés dans l'image de production
- `cargo check` est beaucoup plus rapide que `cargo build` ; lancez-le en permanence, lancez clippy avant les commits

---

## SQLx CLI et migrations

```bash
docker compose exec app cargo install sqlx-cli --locked --no-default-features --features rustls,postgres
docker compose exec app sqlx database create
docker compose exec app sqlx migrate add -r create_orders          # Reversible migration pair
docker compose exec app sqlx migrate run
docker compose exec app sqlx migrate revert
docker compose exec app cargo sqlx prepare --workspace              # Write .sqlx offline metadata
docker compose exec app cargo sqlx prepare --check --workspace      # CI: fail if stale
```

### Mode hors ligne

1. Exécutez les migrations sur une base de données de développement
2. Lancez `cargo sqlx prepare --workspace` ; il écrit un unique répertoire `.sqlx/` à la racine du workspace
3. Versionnez `.sqlx/` ; les builds avec `SQLX_OFFLINE=true` n'ont besoin d'aucune base de données
4. En CI, lancez `cargo sqlx prepare --check --workspace` pour que des métadonnées périmées fassent échouer le build

Notez que l'enregistrement des métadonnées de requêtes doit être invoqué sous la forme `cargo sqlx prepare` (la forme de sous-commande `cargo`). Relancez-le à chaque modification d'un appel `query!` / `query_as!` ou d'une migration.

### Conventions de migration

- Une préoccupation par migration, horodatée par `sqlx migrate add`
- Changements additifs d'abord (ajouter la colonne nullable, remplir, puis contraindre) pour permettre les déploiements progressifs
- Ne modifiez jamais une migration appliquée ; ajoutez-en une nouvelle
- Les migrations embarquées (`sqlx::migrate!`) ne s'exécutent au démarrage que pour les petits déploiements ; préférez une étape de migration séparée en production

---

## Environnement et configuration

```bash
# .env.example (committed; .env is git-ignored)
DATABASE_URL=postgres://postgres:postgres@db:5432/app_development
LISTEN_ADDR=0.0.0.0:3000
RUST_LOG=info
JWT_PUBLIC_KEY_PATH=/run/secrets/jwt_public.pem
```

- Chargez la configuration une seule fois au démarrage dans une struct `Config` typée (crate `envy`, `figment` ou `config`), validez, échouez vite
- Enveloppez les secrets dans `secrecy::SecretString`
- Ne versionnez jamais `.env`, les clés privées ou les identifiants ; utilisez les secrets Docker/Compose ou le vault de la plateforme

---

## Support IDE et éditeur

| Outil | Objectif |
|-------|----------|
| rust-analyzer | Serveur de langage (complétion, erreurs en ligne, refactoring) |
| `clippy` à l'enregistrement | `rust-analyzer.check.command = "clippy"` |
| rustfmt à l'enregistrement | Formatage |
| CodeLLDB / `rust-gdb` | Débogage |
| `tokio-console` | Inspection des tâches du runtime (nécessite le cfg `tokio_unstable`, développement uniquement) |

Workflows basés sur conteneur : utilisez un devcontainer ou remote-container afin que rust-analyzer s'exécute avec la même toolchain que la CI.

---

## Squelette CI

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

Voir `rules/08-quality-tools.md` pour le pipeline complet (couverture, audit, tests de mutation).

---

## Dépannage

| Symptôme | Cause probable | Correction |
|----------|----------------|------------|
| `query!` ne compile pas en CI | Pas de base de données et `.sqlx` périmé | `cargo sqlx prepare --workspace`, commit, définir `SQLX_OFFLINE=true` |
| Builds Docker très lents | Dépendances reconstruites à chaque fois | Utiliser les couches cargo-chef, volume `target/` nommé en dev |
| `the trait Handler<_, _> is not implemented` | Future non `Send`, mauvais ordre d'extractors ou mauvais type de retour | Vérifier que l'extractor de corps est le dernier ; `#[debug_handler]` d'`axum-macros` donne des erreurs claires |
| Erreurs de link sur musl | Dépendance native à OpenSSL | Passer aux features `rustls` |
| Versions de crates dupliquées | Exigences de dépendances divergentes | `cargo tree -d`, aligner dans `[workspace.dependencies]` |

---

## Sources

- Releases Rust : https://releases.rs/ et https://blog.rust-lang.org/2026/10/01/Rust-1.99.0/
- cargo-chef : https://github.com/LukeMathWalker/cargo-chef
- sqlx-cli (mode hors ligne) : https://github.com/launchbadge/sqlx/blob/main/sqlx-cli/README.md
- Versions crates.io (axum 0.8.9, tokio 1.54.1, sqlx 0.9.0, tower-http 0.7.1, cargo-nextest 0.9.151, cargo-deny 0.20.2)

## Checklist

- [ ] `rust-toolchain.toml` épinglé et aligné avec le Dockerfile
- [ ] `Cargo.lock` versionné ; versions partagées dans `[workspace.dependencies]`
- [ ] Chaque commande documentée préfixée par `docker compose exec app`
- [ ] Dockerfile multi-stage avec cargo-chef, utilisateur runtime non-root
- [ ] `.sqlx/` versionné et vérifié avec `cargo sqlx prepare --check`
- [ ] `.env` ignoré, `.env.example` versionné
- [ ] rustfmt, clippy, nextest et cargo-deny exécutés en CI
- [ ] `cargo-watch` / `bacon` uniquement dans l'image de développement
