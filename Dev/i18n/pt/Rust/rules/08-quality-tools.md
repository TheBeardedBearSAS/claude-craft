# Ferramentas de Qualidade Rust / Axum

> Execute cada ferramenta dentro do container: `docker compose exec app <comando>`. Os mesmos comandos rodam na CI, de modo que os resultados locais e os do pipeline coincidam.

## Visão Geral dos Quality Gates

| Ferramenta | Finalidade | Gate |
|------------|------------|------|
| **rustfmt** (`cargo fmt`) | Formatação | `--check` passa |
| **clippy** | Lints (correção, desempenho, estilo, pedantic) | 0 avisos (`-D warnings`) |
| **lints do rustc** | `unsafe_code = "forbid"`, `unused`, `missing_docs` (libs) | 0 avisos |
| **cargo-deny** | Advisories, licenças, bans, sources | `cargo deny check` passa |
| **cargo-audit** | Varredura de advisories RustSec no `Cargo.lock` | 0 vulnerabilidades conhecidas |
| **cargo-nextest** | Runner de testes | Tudo verde |
| **cargo-llvm-cov** | Cobertura | >= 80% |
| **cargo-udeps / cargo-machete** | Dependências não utilizadas | 0 não utilizadas |
| **cargo-mutants** | Testes de mutação | Consultivo, agendado |
| **cargo-vet** | Auditorias de supply chain das dependências | Gate quando adotado |
| **sqlx prepare --check** | Atualidade dos metadados `.sqlx` | Gate |
| **cargo-semver-checks** | Quebra de API em crates de biblioteca | Gate para libs publicadas |

---

## rustfmt

```bash
docker compose exec app cargo fmt --all              # Formatar
docker compose exec app cargo fmt --all --check      # CI: falha em caso de divergência
```

```toml
# rustfmt.toml: mantenha mínimo, os padrões são o standard da comunidade
edition = "2024"
```

Evite opções exclusivas do nightly para que o formatador rode na toolchain stable fixada.

---

## Clippy

### Padrão mais Lints do Workspace

```toml
# Cargo.toml (raiz do workspace)
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
# Lints pedantic que são ruidosos para serviços web
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
docker compose exec app cargo clippy --workspace --fix --allow-dirty    # Aplica as correções automáticas
```

### Tratamento de Avisos

- Corrija o código primeiro; permita um lint localmente, com um motivo:

```rust
#[allow(clippy::too_many_lines, reason = "state machine kept flat for readability")]
fn transition(&mut self, event: Event) { /* ... */ }
```

- Prefira `#[expect(lint, reason = "...")]` (stable): ele avisa quando a supressão se torna desnecessária
- Nenhum `#![allow(clippy::all)]` em todo o crate; restrinja os allows ao mínimo
- O pedantic é opt-in: adote-o com uma lista de exceções documentada em vez de desligá-lo por completo

---

## cargo-deny

Uma única ferramenta para quatro políticas. Inicialize com `cargo deny init` e depois endureça.

```toml
# deny.toml
[graph]
all-features = true

[advisories]
version = 2
yanked = "deny"
ignore = []                          # cada entrada precisa de um motivo e de um comentário de expiração

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
docker compose exec app cargo deny check               # As quatro verificações
docker compose exec app cargo deny check advisories    # Somente os advisories RustSec
docker compose exec app cargo deny check licenses bans sources
```

Confira as chaves exatas no livro do cargo-deny para a versão instalada (0.20.2 no momento da redação); o esquema de configuração evolui entre releases.

## cargo-audit (RustSec)

```bash
docker compose exec app cargo install cargo-audit --locked
docker compose exec app cargo audit                    # Lê o Cargo.lock, baixa o advisory-db do RustSec
docker compose exec app cargo audit --deny warnings    # Também falha em unmaintained / yanked
```

O cargo-deny já cobre os advisories; mantenha o `cargo audit` como segunda opinião ou pelas integrações de `audit fix` e de relatórios. Agende uma execução diária na CI para que novos advisories sobre código inalterado sejam detectados.

## Dependências Não Utilizadas

```bash
docker compose exec app cargo machete                  # Rápido, heurístico (baseado em regex)
docker compose exec app cargo +nightly udeps --all-targets   # Preciso, requer nightly
```

O `cargo-machete` pode gerar falsos positivos para crates usados apenas por meio de macros; coloque-os na lista de exceções no `Cargo.toml` (`[package.metadata.cargo-machete] ignored = [...]`). O cargo-udeps exige uma toolchain nightly: execute-o em um job de CI dedicado, não na imagem stable fixada.

## Cobertura e Mutação

```bash
docker compose exec app cargo llvm-cov nextest --workspace --fail-under-lines 80
docker compose exec app cargo llvm-cov report --lcov --output-path lcov.info     # Para Codecov / SonarQube
docker compose exec app cargo mutants --package domain --package application
```

As execuções de mutação são lentas: agende-as à noite e execute `--in-diff` nos pull requests.

## Revisões de Supply Chain (cargo-vet) e SBOM

```bash
docker compose exec app cargo vet init
docker compose exec app cargo vet                    # Verifica que cada dependência foi auditada ou isentada
docker compose exec app cargo cyclonedx --format json     # SBOM CycloneDX por crate
```

Comece com isenções para as dependências existentes e vá reduzindo-as; importe auditorias de organizações confiáveis em vez de auditar tudo sozinho.

## Verificação de Semver (bibliotecas)

O `cargo semver-checks` detecta quebras acidentais de compatibilidade em crates de biblioteca publicados; execute-o antes das releases.

---

## Métricas de Complexidade e Tamanho

| Métrica | Alvo | Limite | Ferramenta |
|---------|------|--------|------------|
| Complexidade cognitiva | < 7 | < 10 | clippy `cognitive_complexity` (nursery), revisão |
| Linhas por função | < 10 | < 20 | clippy `too_many_lines` (pedantic, `too-many-lines-threshold`) |
| Parâmetros | 3 | 4 | clippy `too_many_arguments` |
| Itens públicos documentados | 100% para libs | | `missing_docs` |

Tokei ou `scc` fornecem estatísticas rápidas de tamanho; são consultivos.

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

- Coloque em cache `~/.cargo/registry` e `target/` entre as execuções (ou conte com as camadas de imagem do cargo-chef)
- Fixe as GitHub Actions de terceiros em um SHA de commit (regra 11 de supply chain)
- Execute o `cargo audit` e os testes de mutação de forma agendada, não em todo pull request
- O Dependabot ou o Renovate mantém o `Cargo.toml` e as GitHub Actions atualizados

---

## Fontes

- Clippy: https://rust-lang.github.io/rust-clippy/master/
- Livro do cargo-deny: https://embarkstudios.github.io/cargo-deny/ (0.20.2)
- Base de advisories RustSec: https://rustsec.org/
- cargo-nextest 0.9.151, cargo-llvm-cov 0.9.1, cargo-mutants 27.1.0, cargo-audit 0.22.2, cargo-vet 0.10.3, cargo-machete 0.9.2, cargo-udeps 0.1.61 (crates.io)

## Checklist

- [ ] `cargo fmt --check` e `cargo clippy -- -D warnings` sem avisos
- [ ] Lints do workspace configurados, `unsafe_code = "forbid"`
- [ ] `deny.toml` presente; `cargo deny check` passa
- [ ] `cargo audit` agendado diariamente e nas branches de release
- [ ] Cobertura >= 80% imposta com `--fail-under-lines 80`
- [ ] Dependências não utilizadas verificadas (machete no PR, udeps no nightly)
- [ ] `cargo sqlx prepare --check --workspace` na CI
- [ ] Dependabot ou Renovate configurado
- [ ] Advisories ignorados e `#[allow]` carregam um motivo
- [ ] A CI executa os mesmos comandos do pipeline local
