# Outils de Qualité Rust / Axum

> Exécutez chaque outil dans le conteneur : `docker compose exec app <commande>`. Les mêmes commandes tournent en CI, afin que les résultats locaux et ceux du pipeline coïncident.

## Vue d'ensemble des portes qualité

| Outil | Objectif | Porte |
|-------|----------|-------|
| **rustfmt** (`cargo fmt`) | Formatage | `--check` passe |
| **clippy** | Lints (correction, perf, style, pedantic) | 0 warning (`-D warnings`) |
| **lints rustc** | `unsafe_code = "forbid"`, `unused`, `missing_docs` (bibliothèques) | 0 warning |
| **cargo-deny** | Advisories, licences, bans, sources | `cargo deny check` passe |
| **cargo-audit** | Analyse RustSec des advisories de `Cargo.lock` | 0 vulnérabilité connue |
| **cargo-nextest** | Runner de tests | Tout au vert |
| **cargo-llvm-cov** | Couverture | >= 80 % |
| **cargo-udeps / cargo-machete** | Dépendances inutilisées | 0 inutilisée |
| **cargo-mutants** | Tests de mutation | Indicatif, planifié |
| **cargo-vet** | Audits supply chain des dépendances | Porte une fois adopté |
| **sqlx prepare --check** | Fraîcheur des métadonnées `.sqlx` | Porte |
| **cargo-semver-checks** | Ruptures d'API dans les crates bibliothèques | Porte pour les bibliothèques publiées |

---

## rustfmt

```bash
docker compose exec app cargo fmt --all              # Format
docker compose exec app cargo fmt --all --check      # CI: fail on drift
```

```toml
# rustfmt.toml: keep minimal, defaults are the community standard
edition = "2024"
```

Évitez les options réservées à nightly afin que le formateur s'exécute sur la toolchain stable épinglée.

---

## Clippy

### Défauts plus lints de workspace

```toml
# Cargo.toml (workspace root)
[workspace.lints.rust]
unsafe_code = "forbid"
unused_must_use = "deny"

[workspace.lints.clippy]
all = { level = "warn", priority = -1 }
pedantic = { level = "warn", priority = -1 }
unwrap_used = "deny"
expect_used = "warn"
panic = "deny"
dbg_macro = "deny"
todo = "deny"
await_holding_lock = "deny"
# Pedantic lints that are noisy for web services
module_name_repetitions = "allow"
missing_errors_doc = "allow"

# each crate
[lints]
workspace = true
```

```toml
# clippy.toml
allow-unwrap-in-tests = true
allow-expect-in-tests = true
cognitive-complexity-threshold = 10
too-many-arguments-threshold = 4
```

```bash
docker compose exec app cargo clippy --workspace --all-targets --all-features -- -D warnings
docker compose exec app cargo clippy --workspace --fix --allow-dirty    # Apply machine-applicable fixes
```

### Traitement des warnings

- Corrigez d'abord le code ; autorisez un lint localement avec une raison :

```rust
#[allow(clippy::too_many_lines, reason = "state machine kept flat for readability")]
fn transition(&mut self, event: Event) { /* ... */ }
```

- Préférez `#[expect(lint, reason = "...")]` (stable) : il avertit lorsque la suppression devient inutile
- Pas de `#![allow(clippy::all)]` au niveau de la crate ; restreignez les allow à leur portée
- Pedantic est opt-in : adoptez-le avec une liste d'exceptions documentée plutôt que de le désactiver en bloc

---

## cargo-deny

Un seul outil pour quatre politiques. Initialisez avec `cargo deny init`, puis durcissez.

```toml
# deny.toml
[graph]
all-features = true

[advisories]
version = 2
yanked = "deny"
ignore = []                          # every entry needs a reason and an expiry comment

[licenses]
version = 2
allow = ["MIT", "Apache-2.0", "BSD-3-Clause", "ISC", "Unicode-3.0"]
confidence-threshold = 0.9

[bans]
multiple-versions = "warn"
wildcards = "deny"
deny = [{ crate = "openssl-sys", reason = "use rustls" }]

[sources]
unknown-registry = "deny"
unknown-git = "deny"
allow-registry = ["https://github.com/rust-lang/crates.io-index"]
```

```bash
docker compose exec app cargo deny check               # All four checks
docker compose exec app cargo deny check advisories    # Only RustSec advisories
docker compose exec app cargo deny check licenses bans sources
```

Vérifiez les clés exactes dans le livre cargo-deny pour la version installée (0.20.2 au moment de la rédaction) ; le schéma de configuration évolue d'une release à l'autre.

## cargo-audit (RustSec)

```bash
docker compose exec app cargo install cargo-audit --locked
docker compose exec app cargo audit                    # Reads Cargo.lock, fetches the RustSec advisory-db
docker compose exec app cargo audit --deny warnings    # Also fail on unmaintained / yanked
```

cargo-deny couvre déjà les advisories ; gardez `cargo audit` comme second avis ou pour son `audit fix` et ses intégrations de reporting. Planifiez une exécution CI quotidienne afin que les nouvelles advisories sur du code inchangé soient détectées.

## Dépendances inutilisées

```bash
docker compose exec app cargo machete                  # Fast, heuristic (regex based)
docker compose exec app cargo +nightly udeps --all-targets   # Accurate, needs nightly
```

`cargo-machete` peut produire des faux positifs sur des crates utilisées uniquement via des macros ; ajoutez-les à la liste d'exceptions dans `Cargo.toml` (`[package.metadata.cargo-machete] ignored = [...]`). cargo-udeps nécessite une toolchain nightly : exécutez-le dans un job CI dédié, pas dans l'image stable épinglée.

## Couverture et mutation

```bash
docker compose exec app cargo llvm-cov nextest --workspace --fail-under-lines 80
docker compose exec app cargo llvm-cov report --lcov --output-path lcov.info     # For Codecov / SonarQube
docker compose exec app cargo mutants --package domain --package application
```

Les exécutions de mutation sont lentes : planifiez-les chaque nuit, lancez `--in-diff` sur les pull requests.

## Revues supply chain (cargo-vet) et SBOM

```bash
docker compose exec app cargo vet init
docker compose exec app cargo vet                    # Verify every dependency is audited or exempted
docker compose exec app cargo cyclonedx --format json     # CycloneDX SBOM per crate
```

Commencez avec des exemptions pour les dépendances existantes puis resserrez progressivement ; importez les audits d'organisations de confiance plutôt que de tout auditer seul.

## Vérification semver (bibliothèques)

`cargo semver-checks` détecte les ruptures accidentelles dans les crates bibliothèques publiées ; lancez-le avant les releases.

---

## Métriques de complexité et de taille

| Métrique | Cible | Limite | Outil |
|----------|-------|--------|-------|
| Complexité cognitive | < 7 | < 10 | clippy `cognitive_complexity` (nursery), revue |
| Lignes par fonction | < 10 | < 20 | clippy `too_many_lines` (pedantic, `too-many-lines-threshold`) |
| Paramètres | 3 | 4 | clippy `too_many_arguments` |
| Éléments publics documentés | 100 % pour les bibliothèques | | `missing_docs` |

Tokei ou `scc` donnent des statistiques de taille rapides ; elles sont indicatives.

---

## Pipeline CI

```yaml
# .github/workflows/ci.yml
name: CI
on:
  pull_request:
  push:
    branches: [main]

jobs:
  quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: docker compose run --rm app cargo fmt --all --check
      - run: docker compose run --rm app cargo clippy --workspace --all-targets --all-features -- -D warnings
      - run: docker compose run --rm app cargo sqlx prepare --check --workspace
      - run: docker compose run --rm app cargo deny check
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: docker compose up -d db
      - run: docker compose run --rm app cargo nextest run --workspace --profile ci
      - run: docker compose run --rm app cargo test --workspace --doc
      - run: docker compose run --rm app cargo llvm-cov nextest --workspace --fail-under-lines 80
  nightly:
    if: github.event_name == 'schedule'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: docker compose run --rm app cargo audit
      - run: docker compose run --rm app cargo mutants --package domain --package application
```

- Mettez en cache `~/.cargo/registry` et `target/` entre les exécutions (ou appuyez-vous sur les couches d'image cargo-chef)
- Épinglez les GitHub Actions tierces à un SHA de commit (règle supply chain 11)
- Lancez `cargo audit` et les tests de mutation de façon planifiée, pas à chaque pull request
- Dependabot ou Renovate maintient `Cargo.toml` et les GitHub Actions à jour

---

## Sources

- Clippy : https://rust-lang.github.io/rust-clippy/master/
- Livre cargo-deny : https://embarkstudios.github.io/cargo-deny/ (0.20.2)
- Base de données d'advisories RustSec : https://rustsec.org/
- cargo-nextest 0.9.151, cargo-llvm-cov 0.9.1, cargo-mutants 27.1.0, cargo-audit 0.22.2, cargo-vet 0.10.3, cargo-machete 0.9.2, cargo-udeps 0.1.61 (crates.io)

## Checklist

- [ ] `cargo fmt --check` et `cargo clippy -- -D warnings` sans alerte
- [ ] Lints de workspace configurés, `unsafe_code = "forbid"`
- [ ] `deny.toml` présent ; `cargo deny check` passe
- [ ] `cargo audit` planifié quotidiennement et sur les branches de release
- [ ] Couverture >= 80 % imposée avec `--fail-under-lines 80`
- [ ] Dépendances inutilisées vérifiées (machete en PR, udeps en nightly)
- [ ] `cargo sqlx prepare --check --workspace` en CI
- [ ] Dependabot ou Renovate configuré
- [ ] Les advisories ignorées et les `#[allow]` portent une raison
- [ ] La CI exécute les mêmes commandes que le pipeline local
