# Herramientas de calidad Rust / Axum

> Ejecuta cada herramienta dentro del contenedor: `docker compose exec app <comando>`. Los mismos comandos se ejecutan en la CI, de modo que los resultados locales y los del pipeline coinciden.

## Visión general de las puertas de calidad

| Herramienta | Propósito | Puerta |
|-------------|-----------|--------|
| **rustfmt** (`cargo fmt`) | Formato | `--check` pasa |
| **clippy** | Lints (corrección, rendimiento, estilo, pedantic) | 0 warnings (`-D warnings`) |
| **Lints de rustc** | `unsafe_code = "forbid"`, `unused`, `missing_docs` (libs) | 0 warnings |
| **cargo-deny** | Advisories, licencias, bans, fuentes | `cargo deny check` pasa |
| **cargo-audit** | Escaneo de advisories RustSec de `Cargo.lock` | 0 vulnerabilidades conocidas |
| **cargo-nextest** | Runner de tests | Todo en verde |
| **cargo-llvm-cov** | Cobertura | >= 80% |
| **cargo-udeps / cargo-machete** | Dependencias no utilizadas | 0 sin usar |
| **cargo-mutants** | Mutation testing | Orientativo, programado |
| **cargo-vet** | Auditorías de la cadena de suministro de las dependencias | Puerta cuando se adopta |
| **sqlx prepare --check** | Actualidad de los metadatos `.sqlx` | Puerta |
| **cargo-semver-checks** | Rupturas de API en los crates de librería | Puerta para las librerías publicadas |

---

## rustfmt

```bash
docker compose exec app cargo fmt --all              # Formatear
docker compose exec app cargo fmt --all --check      # CI: fallar si hay deriva
```

```toml
# rustfmt.toml: mantenerlo mínimo, los valores por defecto son el estándar de la comunidad
edition = "2024"
```

Evita las opciones exclusivas de nightly para que el formateador se ejecute con el toolchain estable fijado.

---

## Clippy

### Valores por defecto más lints del workspace

```toml
# Cargo.toml (raíz del workspace)
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
# Lints pedantic que resultan ruidosos para los servicios web
module_name_repetitions = "allow"
missing_errors_doc = "allow"

# cada crate
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
docker compose exec app cargo clippy --workspace --fix --allow-dirty    # Aplicar las correcciones aplicables automáticamente
```

### Tratamiento de los warnings

- Corrige primero el código; permite un lint localmente con un motivo:

```rust
#[allow(clippy::too_many_lines, reason = "state machine kept flat for readability")]
fn transition(&mut self, event: Event) { /* ... */ }
```

- Prefiere `#[expect(lint, reason = "...")]` (estable): avisa cuando la supresión deja de ser necesaria
- Ningún `#![allow(clippy::all)]` a nivel de crate; acota los allows de forma estrecha
- Pedantic es opcional (opt-in): adóptalo con una lista de excepciones documentada en lugar de desactivarlo en bloque

---

## cargo-deny

Una sola herramienta para cuatro políticas. Inicialízala con `cargo deny init` y luego endurécela.

```toml
# deny.toml
[graph]
all-features = true

[advisories]
version = 2
yanked = "deny"
ignore = []                          # cada entrada necesita un motivo y un comentario de caducidad

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
docker compose exec app cargo deny check               # Las cuatro verificaciones
docker compose exec app cargo deny check advisories    # Solo los advisories de RustSec
docker compose exec app cargo deny check licenses bans sources
```

Verifica las claves exactas en el libro de cargo-deny para la versión instalada (0.20.2 en el momento de escribir esto); el esquema de configuración evoluciona entre versiones.

## cargo-audit (RustSec)

```bash
docker compose exec app cargo install cargo-audit --locked
docker compose exec app cargo audit                    # Lee Cargo.lock, descarga la advisory-db de RustSec
docker compose exec app cargo audit --deny warnings    # Falla también ante unmaintained / yanked
```

cargo-deny ya cubre los advisories; mantén `cargo audit` como segunda opinión o por su `audit fix` y sus integraciones de informes. Programa una ejecución diaria en la CI para detectar nuevos advisories sobre código que no ha cambiado.

## Dependencias no utilizadas

```bash
docker compose exec app cargo machete                  # Rápido, heurístico (basado en regex)
docker compose exec app cargo +nightly udeps --all-targets   # Preciso, requiere nightly
```

`cargo-machete` puede dar falsos positivos en crates usados solo a través de macros; añádelos a la lista de excepciones en `Cargo.toml` (`[package.metadata.cargo-machete] ignored = [...]`). cargo-udeps necesita un toolchain nightly: ejecútalo en un job de CI dedicado, no en la imagen estable fijada.

## Cobertura y mutación

```bash
docker compose exec app cargo llvm-cov nextest --workspace --fail-under-lines 80
docker compose exec app cargo llvm-cov report --lcov --output-path lcov.info     # Para Codecov / SonarQube
docker compose exec app cargo mutants --package domain --package application
```

Las ejecuciones de mutación son lentas: prográmalas de forma nocturna y ejecuta `--in-diff` en las pull requests.

## Revisiones de la cadena de suministro (cargo-vet) y SBOM

```bash
docker compose exec app cargo vet init
docker compose exec app cargo vet                    # Verificar que cada dependencia está auditada o exenta
docker compose exec app cargo cyclonedx --format json     # SBOM CycloneDX por crate
```

Empieza con exenciones para las dependencias existentes y ve reduciéndolas; importa auditorías de organizaciones de confianza en lugar de auditarlo todo en solitario.

## Verificación de semver (librerías)

`cargo semver-checks` detecta cambios incompatibles accidentales en los crates de librería publicados; ejecútalo antes de las releases.

---

## Métricas de complejidad y tamaño

| Métrica | Objetivo | Límite | Herramienta |
|---------|----------|--------|-------------|
| Complejidad cognitiva | < 7 | < 10 | clippy `cognitive_complexity` (nursery), revisión |
| Líneas por función | < 10 | < 20 | clippy `too_many_lines` (pedantic, `too-many-lines-threshold`) |
| Parámetros | 3 | 4 | clippy `too_many_arguments` |
| Elementos públicos documentados | 100% para libs | | `missing_docs` |

Tokei o `scc` ofrecen estadísticas rápidas de tamaño; son orientativas.

---

## Pipeline de CI

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

- Almacena en caché `~/.cargo/registry` y `target/` entre ejecuciones (o apóyate en las capas de imagen de cargo-chef)
- Fija las GitHub Actions de terceros a un SHA de commit (regla 11 de cadena de suministro)
- Ejecuta `cargo audit` y el mutation testing de forma programada, no en cada pull request
- Dependabot o Renovate mantiene al día `Cargo.toml` y las GitHub Actions

---

## Fuentes

- Clippy: https://rust-lang.github.io/rust-clippy/master/
- Libro de cargo-deny: https://embarkstudios.github.io/cargo-deny/ (0.20.2)
- Base de datos de advisories de RustSec: https://rustsec.org/
- cargo-nextest 0.9.151, cargo-llvm-cov 0.9.1, cargo-mutants 27.1.0, cargo-audit 0.22.2, cargo-vet 0.10.3, cargo-machete 0.9.2, cargo-udeps 0.1.61 (crates.io)

## Checklist

- [ ] `cargo fmt --check` y `cargo clippy -- -D warnings` limpios
- [ ] Lints del workspace configurados, `unsafe_code = "forbid"`
- [ ] `deny.toml` presente; `cargo deny check` pasa
- [ ] `cargo audit` programado a diario y en las ramas de release
- [ ] Cobertura >= 80% garantizada con `--fail-under-lines 80`
- [ ] Dependencias no utilizadas verificadas (machete en las PR, udeps de forma nocturna)
- [ ] `cargo sqlx prepare --check --workspace` en la CI
- [ ] Dependabot o Renovate configurado
- [ ] Los advisories ignorados y los `#[allow]` llevan un motivo
- [ ] La CI ejecuta los mismos comandos que el pipeline local
