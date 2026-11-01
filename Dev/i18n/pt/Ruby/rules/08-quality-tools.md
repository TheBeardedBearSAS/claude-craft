# Ferramentas de Qualidade Ruby on Rails

> Execute cada ferramenta dentro do container: `docker compose exec app <comando>`. O Rails 8 gera os binstubs `bin/rubocop`, `bin/brakeman` e `bin/bundler-audit`; o Rails 8.1 os encadeia em `bin/ci`.

## Visão Geral dos Quality Gates

| Ferramenta | Finalidade | Gate |
|------------|------------|------|
| **RuboCop** (`rubocop-rails-omakase`) | Estilo e lint | 0 ofensas |
| **rubocop-rails / -performance / -rspec** | Cops adicionais | 0 ofensas |
| **Brakeman** | Análise estática de segurança | 0 alertas não resolvidos |
| **bundler-audit** | Scan de CVEs em gems | 0 vulnerabilidades conhecidas |
| **importmap audit** | Scan de CVEs em pins JavaScript | 0 vulnerabilidades conhecidas |
| **SimpleCov** | Cobertura | >= 80% |
| **Bullet / strict_loading** | Detecção de N+1 | 0 N+1 nos testes |
| **Steep / Sorbet** | Tipagem opcional | 0 erros de tipo quando adotada |
| **Reek / Flog / Flay** | Smells, complexidade, duplicação | Consultivo |
| **database_consistency** | Consistência entre models e schema | Consultivo ou gate |
| **strong_migrations** | Prevenção de migrations inseguras | Gate |

---

## RuboCop

### Padrão: rubocop-rails-omakase

O Rails 8 traz uma configuração opinativa e de baixo ruído.

```yaml
# .rubocop.yml
inherit_gem:
  rubocop-rails-omakase: rubocop.yml
```

```bash
docker compose exec app bin/rubocop                  # Verificar
docker compose exec app bin/rubocop -a               # Corrigir automaticamente as ofensas seguras
docker compose exec app bin/rubocop -A               # Incluir correções inseguras (revisar o diff)
docker compose exec app bin/rubocop app/models       # Limitar o escopo
docker compose exec app bin/rubocop -f github        # Anotações no CI
```

### Configuração Mais Estrita do Projeto

Quando a equipe quer mais do que os padrões do omakase, adicione os cops da comunidade:

```yaml
# .rubocop.yml
inherit_gem:
  rubocop-rails-omakase: rubocop.yml

plugins:
  - rubocop-rails
  - rubocop-performance
  - rubocop-rspec          # somente ao usar RSpec

AllCops:
  TargetRubyVersion: 4.0
  NewCops: enable
  Exclude:
    - "db/schema.rb"
    - "vendor/**/*"
    - "node_modules/**/*"
    - "bin/**/*"

Layout/LineLength:
  Max: 120

Metrics/MethodLength:
  Max: 10
  CountAsOne: ["array", "hash", "heredoc"]

Metrics/AbcSize:
  Max: 17

Metrics/CyclomaticComplexity:
  Max: 7

Metrics/ParameterLists:
  Max: 4

Style/FrozenStringLiteralComment:
  Enabled: true
  EnforcedStyle: always

Style/Documentation:
  Enabled: false

Rails/UnknownEnv:
  Environments: [development, test, production]
```

Verifique a sintaxe exata dos plugins (`plugins:` vs `require:`) na versão instalada do RuboCop, pois o carregamento de extensões mudou nas versões recentes.

### Tratamento de Ofensas

- Corrija o código; desative um cop inline somente com uma justificativa:

```ruby
# rubocop:disable Metrics/MethodLength -- state machine kept flat for readability
def transition(event)
  # ...
end
# rubocop:enable Metrics/MethodLength
```

- Gere um arquivo todo para a dívida legada e reduza-o ao longo do tempo:

```bash
docker compose exec app bin/rubocop --auto-gen-config --auto-gen-only-exclude --exclude-limit 1000
```

- Nunca faça commit de um `.rubocop_todo.yml` em crescimento contínuo; revise-o a cada sprint

---

## Brakeman

Análise estática de problemas de segurança em Rails (SQL injection, XSS, mass assignment, redirects inseguros, command injection, desserialização insegura).

```bash
docker compose exec app bin/brakeman                              # Relatório completo
docker compose exec app bin/brakeman --no-pager --quiet
docker compose exec app bin/brakeman --exit-on-warn --exit-on-error   # Gate de CI
docker compose exec app bin/brakeman -f json -o brakeman.json
docker compose exec app bin/brakeman -I                           # Ignorar de forma interativa
```

### Ignorando Falsos Positivos

O `config/brakeman.ignore` é gerado por `brakeman -I`:

```json
{
  "ignored_warnings": [
    {
      "fingerprint": "...",
      "note": "Value comes from an allow-listed constant, reviewed 2026-11-01"
    }
  ]
}
```

Todo alerta ignorado exige uma justificativa escrita (`note`) e um revisor. Trate novos alertas como falhas de build.

---

## bundler-audit e Higiene de Dependências

```bash
docker compose exec app bin/bundler-audit                   # Escanear o Gemfile.lock
docker compose exec app bundle exec bundler-audit check --update
docker compose exec app bin/importmap audit                 # Pacotes JS fixados
docker compose exec app bundle outdated --strict
```

O `bin/bundler-audit` já vem conectado em `config/ci.rb` por padrão no Rails 8.1. Complemente-o com Dependabot ou Renovate para PRs automáticos de atualização, e com um workflow agendado noturno para que novos advisories apareçam sem uma mudança de código.

```yaml
# .github/dependabot.yml
version: 2
updates:
  - package-ecosystem: bundler
    directory: "/"
    schedule:
      interval: weekly
    open-pull-requests-limit: 5
  - package-ecosystem: github-actions
    directory: "/"
    schedule:
      interval: weekly
```

Práticas de supply chain (OWASP A03:2025): faça commit do `Gemfile.lock`, revise as novas gems, habilite MFA no RubyGems para as gems de sua propriedade, gere um SBOM (CycloneDX) no momento do build, escaneie a imagem com Trivy ou Grype.

---

## Cobertura: SimpleCov

```ruby
# test/test_helper.rb ou spec/rails_helper.rb, primeiras linhas
require "simplecov"
SimpleCov.start "rails" do
  enable_coverage :branch
  minimum_coverage line: 80, branch: 70
  minimum_coverage_by_file 60
  add_filter %w[/config/ /db/ /test/ /spec/]
end
```

A cobertura é imposta pelo SimpleCov, que encerra com código diferente de zero quando os limites não são atingidos. Publique `coverage/` como artefato do CI.

---

## Desempenho e Qualidade dos Dados

### Detecção de N+1

```ruby
# config/environments/development.rb e test.rb
config.after_initialize do
  Bullet.enable = true
  Bullet.raise = true if Rails.env.test?
  Bullet.rails_logger = true
end

# Alternativamente, o strict loading nativo do Rails
config.active_record.strict_loading_by_default = true
config.active_record.action_on_strict_loading_violation = :log
```

### strong_migrations

```ruby
# Gemfile (development, test)
gem "strong_migrations"
```

```ruby
class AddIndexToOrders < ActiveRecord::Migration[8.1]
  disable_ddl_transaction!

  def change
    add_index :orders, :status, algorithm: :concurrently
  end
end
```

O `strong_migrations` bloqueia operações inseguras (índices não concorrentes, remoções de coluna ainda lidas pelo código em execução) com uma mensagem acionável.

### database_consistency

```bash
docker compose exec app bundle exec database_consistency
```

Detecta índices ausentes por trás de validações, chaves estrangeiras ausentes e divergências de `null: false` entre os models e o schema.

---

## Complexidade e Smells

```bash
docker compose exec app bundle exec reek app/services          # Code smells
docker compose exec app bundle exec flog -g app/models         # Complexidade (ABC)
docker compose exec app bundle exec flay app                   # Duplicação
```

Limites (regra 05 do projeto): métodos < 10 linhas (limite 20), complexidade cognitiva < 7 (limite 10), complexidade ciclomática < 5 (limite 10), profundidade de aninhamento <= 3, <= 4 parâmetros. Os cops `Metrics/*` do RuboCop aproximam esses limites no CI.

---

## Tipagem Estática (Opcional)

### Steep com RBS

```bash
docker compose exec app bundle exec rbs collection install
docker compose exec app bundle exec steep check
```

```ruby
# Steepfile
target :app do
  signature "sig"
  check "app/services"
  library "activerecord"
end
```

### Sorbet

```bash
docker compose exec app bundle exec srb init
docker compose exec app bundle exec srb tc
```

Adote uma única abordagem de tipagem, comece pelos services e value objects e imponha-a no CI. Não misture sistemas no mesmo diretório.

---

## CI Local: bin/ci (Rails 8.1)

```ruby
# config/ci.rb
CI.run do
  step "Setup", "bin/setup --skip-server"
  step "Style: Ruby", "bin/rubocop"
  step "Security: Gem audit", "bin/bundler-audit"
  step "Security: Importmap vulnerability audit", "bin/importmap audit"
  step "Security: Brakeman code analysis", "bin/brakeman --quiet --no-pager --exit-on-warn --exit-on-error"
  step "Tests: Rails", "bin/rails test"
  step "Tests: Seeds", "env RAILS_ENV=test bin/rails db:seed:replant"
end
```

```bash
docker compose exec app bin/ci
```

Adicione etapas do projeto para RSpec, system tests, Steep/Sorbet, `zeitwerk:check` e `database_consistency`.

---

## Pipeline do GitHub Actions

```yaml
name: CI
on:
  pull_request:
  push:
    branches: [main]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: ruby/setup-ruby@v1
        with: { bundler-cache: true }
      - run: bin/rubocop -f github

  security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: ruby/setup-ruby@v1
        with: { bundler-cache: true }
      - run: bin/brakeman --no-pager --exit-on-warn --exit-on-error
      - run: bin/bundler-audit
      - run: bin/importmap audit

  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:17
        env: { POSTGRES_PASSWORD: postgres }
        ports: ["5432:5432"]
        options: >-
          --health-cmd="pg_isready" --health-interval=10s
          --health-timeout=5s --health-retries=5
    env:
      RAILS_ENV: test
      DATABASE_URL: postgres://postgres:postgres@localhost:5432/test
    steps:
      - uses: actions/checkout@v4
      - uses: ruby/setup-ruby@v1
        with: { bundler-cache: true }
      - run: bin/rails db:test:prepare test test:system
```

Fixe as actions em SHAs de commit para garantir a integridade da supply chain.

---

## Hooks de Pre-commit

```yaml
# lefthook.yml
pre-commit:
  parallel: true
  commands:
    rubocop:
      glob: "*.{rb,rake}"
      run: docker compose exec -T app bin/rubocop --force-exclusion {staged_files}
    brakeman:
      glob: "{app,config,lib}/**/*.rb"
      run: docker compose exec -T app bin/brakeman -q --no-pager --exit-on-warn
```

---

## Alinhamento com a Pontuação

A auditoria `/ruby:check` associa as ferramentas aos eixos:

| Eixo | Evidência das ferramentas |
|------|---------------------------|
| Arquitetura | `zeitwerk:check`, Bullet/strict loading, database_consistency |
| Qualidade de código | RuboCop, Reek/Flog, Steep/Sorbet |
| Segurança | Brakeman, bundler-audit, importmap audit |
| Testes | SimpleCov, resultados da suíte de testes |

---

## Checklist de Qualidade

- [ ] `bin/rubocop` retorna 0 ofensas
- [ ] `bin/brakeman` retorna 0 alertas não resolvidos
- [ ] `bin/bundler-audit` e `bin/importmap audit` estão limpos
- [ ] SimpleCov impõe >= 80%
- [ ] Detecção de N+1 ativa nos testes
- [ ] `strong_migrations` ativo
- [ ] `bin/ci` passa localmente e o CI executa as mesmas etapas
- [ ] Dependabot ou Renovate configurado
- [ ] Alertas ignorados e desativações do RuboCop trazem uma justificativa
