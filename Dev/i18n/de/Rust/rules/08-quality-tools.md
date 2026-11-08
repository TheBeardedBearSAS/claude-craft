# Rust-/Axum-Qualitätswerkzeuge

> Jedes Werkzeug im Container ausführen: `docker compose exec app <command>`. Dieselben Befehle laufen in der CI, damit lokale Ergebnisse und Pipeline-Ergebnisse übereinstimmen.

## Überblick über die Quality Gates

| Werkzeug | Zweck | Gate |
|----------|-------|------|
| **rustfmt** (`cargo fmt`) | Formatierung | `--check` besteht |
| **clippy** | Lints (Korrektheit, Performance, Stil, pedantic) | 0 Warnungen (`-D warnings`) |
| **rustc-Lints** | `unsafe_code = "forbid"`, `unused`, `missing_docs` (Libs) | 0 Warnungen |
| **cargo-deny** | Advisories, Lizenzen, Bans, Quellen | `cargo deny check` besteht |
| **cargo-audit** | RustSec-Advisory-Scan von `Cargo.lock` | 0 bekannte Schwachstellen |
| **cargo-nextest** | Test-Runner | Alles grün |
| **cargo-llvm-cov** | Abdeckung | >= 80 % |
| **cargo-udeps / cargo-machete** | Ungenutzte Abhängigkeiten | 0 ungenutzte |
| **cargo-mutants** | Mutation Testing | Beratend, geplant |
| **cargo-vet** | Lieferketten-Audits der Abhängigkeiten | Gate, sobald eingeführt |
| **sqlx prepare --check** | Aktualität der `.sqlx`-Metadaten | Gate |
| **cargo-semver-checks** | API-Brüche in Library-Crates | Gate für veröffentlichte Libs |

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

Optionen, die nur auf Nightly verfügbar sind, vermeiden, damit der Formatierer auf der fixierten Stable-Toolchain läuft.

---

## Clippy

### Standard plus Workspace-Lints

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

### Umgang mit Warnungen

- Zuerst den Code korrigieren; einen Lint lokal mit Begründung erlauben:

```rust
#[allow(clippy::too_many_lines, reason = "state machine kept flat for readability")]
fn transition(&mut self, event: Event) { /* ... */ }
```

- `#[expect(lint, reason = "...")]` bevorzugen (stabil): Es warnt, wenn die Unterdrückung überflüssig wird
- Kein crateweites `#![allow(clippy::all)]`; Allows eng eingrenzen
- Pedantic ist Opt-in: Es mit einer dokumentierten Allow-Liste einführen, statt es pauschal abzuschalten

---

## cargo-deny

Ein Werkzeug für vier Richtlinien. Mit `cargo deny init` initialisieren, dann verschärfen.

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

Die exakten Schlüssel anhand des cargo-deny-Handbuchs für die installierte Version prüfen (0.20.2 zum Zeitpunkt des Schreibens); das Konfigurationsschema entwickelt sich zwischen Releases weiter.

## cargo-audit (RustSec)

```bash
docker compose exec app cargo install cargo-audit --locked
docker compose exec app cargo audit                    # Reads Cargo.lock, fetches the RustSec advisory-db
docker compose exec app cargo audit --deny warnings    # Also fail on unmaintained / yanked
```

cargo-deny deckt Advisories bereits ab; `cargo audit` als zweite Meinung oder wegen `audit fix` und der Reporting-Integrationen beibehalten. Einen täglichen CI-Lauf einplanen, damit neue Advisories zu unverändertem Code erkannt werden.

## Ungenutzte Abhängigkeiten

```bash
docker compose exec app cargo machete                  # Fast, heuristic (regex based)
docker compose exec app cargo +nightly udeps --all-targets   # Accurate, needs nightly
```

`cargo-machete` kann bei Crates, die nur über Makros verwendet werden, falsch positiv melden; diese in `Cargo.toml` auf eine Allow-Liste setzen (`[package.metadata.cargo-machete] ignored = [...]`). cargo-udeps benötigt eine Nightly-Toolchain: in einem dedizierten CI-Job ausführen, nicht im fixierten Stable-Image.

## Abdeckung und Mutation

```bash
docker compose exec app cargo llvm-cov nextest --workspace --fail-under-lines 80
docker compose exec app cargo llvm-cov report --lcov --output-path lcov.info     # For Codecov / SonarQube
docker compose exec app cargo mutants --package domain --package application
```

Mutationsläufe sind langsam: nächtlich einplanen, bei Pull Requests `--in-diff` ausführen.

## Lieferketten-Reviews (cargo-vet) und SBOM

```bash
docker compose exec app cargo vet init
docker compose exec app cargo vet                    # Verify every dependency is audited or exempted
docker compose exec app cargo cyclonedx --format json     # CycloneDX SBOM per crate
```

Mit Ausnahmen für bestehende Abhängigkeiten beginnen und schrittweise zurückfahren; Audits vertrauenswürdiger Organisationen importieren, statt alles allein zu prüfen.

## Semver-Prüfung (Bibliotheken)

`cargo semver-checks` erkennt versehentliche Breaking Changes in veröffentlichten Library-Crates; vor Releases ausführen.

---

## Metriken zu Komplexität und Größe

| Metrik | Ziel | Grenze | Werkzeug |
|--------|------|--------|----------|
| Kognitive Komplexität | < 7 | < 10 | clippy `cognitive_complexity` (nursery), Review |
| Zeilen pro Funktion | < 10 | < 20 | clippy `too_many_lines` (pedantic, `too-many-lines-threshold`) |
| Parameter | 3 | 4 | clippy `too_many_arguments` |
| Öffentliche Items dokumentiert | 100 % bei Libs | | `missing_docs` |

Tokei oder `scc` liefern schnelle Größenstatistiken; sie sind beratend.

---

## CI-Pipeline

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

- `~/.cargo/registry` und `target/` zwischen Läufen cachen (oder sich auf cargo-chef-Image-Layer stützen)
- GitHub Actions von Drittanbietern auf einen Commit-SHA fixieren (Lieferketten-Regel 11)
- `cargo audit` und Mutation Testing nach Zeitplan ausführen, nicht bei jedem Pull Request
- Dependabot oder Renovate hält `Cargo.toml` und GitHub Actions aktuell

---

## Quellen

- Clippy: https://rust-lang.github.io/rust-clippy/master/
- cargo-deny-Handbuch: https://embarkstudios.github.io/cargo-deny/ (0.20.2)
- RustSec-Advisory-Datenbank: https://rustsec.org/
- cargo-nextest 0.9.151, cargo-llvm-cov 0.9.1, cargo-mutants 27.1.0, cargo-audit 0.22.2, cargo-vet 0.10.3, cargo-machete 0.9.2, cargo-udeps 0.1.61 (crates.io)

## Checkliste

- [ ] `cargo fmt --check` und `cargo clippy -- -D warnings` sauber
- [ ] Workspace-Lints konfiguriert, `unsafe_code = "forbid"`
- [ ] `deny.toml` vorhanden; `cargo deny check` besteht
- [ ] `cargo audit` täglich und auf Release-Branches eingeplant
- [ ] Abdeckung >= 80 % mit `--fail-under-lines 80` erzwungen
- [ ] Ungenutzte Abhängigkeiten geprüft (machete im PR, udeps nächtlich)
- [ ] `cargo sqlx prepare --check --workspace` in der CI
- [ ] Dependabot oder Renovate konfiguriert
- [ ] Ignorierte Advisories und `#[allow]` tragen eine Begründung
- [ ] Die CI führt dieselben Befehle aus wie die lokale Pipeline
