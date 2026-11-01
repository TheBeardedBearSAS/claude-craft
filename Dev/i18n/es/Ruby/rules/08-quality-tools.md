# Herramientas de calidad Ruby on Rails

> Ejecuta cada herramienta dentro del contenedor: `docker compose exec app <comando>`. Rails 8 genera los binstubs `bin/rubocop`, `bin/brakeman` y `bin/bundler-audit`; Rails 8.1 los encadena en `bin/ci`.

## Visión general de las puertas de calidad

| Herramienta | Propósito | Puerta |
|-------------|-----------|--------|
| **RuboCop** (`rubocop-rails-omakase`) | Estilo y lint | 0 infracciones |
| **rubocop-rails / -performance / -rspec** | Cops adicionales | 0 infracciones |
| **Brakeman** | Análisis estático de seguridad | 0 advertencias sin resolver |
| **bundler-audit** | Escaneo de CVE de gems | 0 vulnerabilidades conocidas |
| **importmap audit** | Escaneo de CVE de pins JavaScript | 0 vulnerabilidades conocidas |
| **SimpleCov** | Cobertura | >= 80% |
| **Bullet / strict_loading** | Detección de N+1 | 0 N+1 en los tests |
| **Steep / Sorbet** | Tipado opcional | 0 errores de tipo cuando se adopta |
| **Reek / Flog / Flay** | Smells, complejidad, duplicación | Consultivo |
| **database_consistency** | Consistencia entre modelos y esquema | Consultivo o puerta |
| **strong_migrations** | Prevención de migraciones inseguras | Puerta |

---

## RuboCop

### Por defecto: rubocop-rails-omakase

Rails 8 incluye una configuración opinada y con poco ruido.

```yaml
# .rubocop.yml
inherit_gem:
  rubocop-rails-omakase: rubocop.yml
```

```bash
docker compose exec app bin/rubocop                  # Verificar
docker compose exec app bin/rubocop -a               # Autocorregir infracciones seguras
docker compose exec app bin/rubocop -A               # Incluir correcciones inseguras (revisar el diff)
docker compose exec app bin/rubocop app/models       # Limitar el alcance
docker compose exec app bin/rubocop -f github        # Anotaciones de CI
```

### Configuración más estricta del proyecto

Cuando el equipo quiere más que los valores por defecto de omakase, añade los cops de la comunidad:

```yaml
# .rubocop.yml
inherit_gem:
  rubocop-rails-omakase: rubocop.yml

plugins:
  - rubocop-rails
  - rubocop-performance
  - rubocop-rspec          # solo cuando se usa RSpec

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

Verifica la sintaxis exacta de los plugins (`plugins:` frente a `require:`) con la versión de RuboCop instalada, ya que la carga de extensiones cambió en las versiones recientes.

### Tratamiento de las infracciones

- Corrige el código; desactiva un cop en línea solo con una razón:

```ruby
# rubocop:disable Metrics/MethodLength -- máquina de estados mantenida plana por legibilidad
def transition(event)
  # ...
end
# rubocop:enable Metrics/MethodLength
```

- Genera un archivo todo para la deuda heredada y redúcelo con el tiempo:

```bash
docker compose exec app bin/rubocop --auto-gen-config --auto-gen-only-exclude --exclude-limit 1000
```

- Nunca commitees un `.rubocop_todo.yml` que crece sin parar; revísalo en cada sprint

---

## Brakeman

Análisis estático de los problemas de seguridad de Rails (inyección SQL, XSS, mass assignment, redirecciones inseguras, inyección de comandos, deserialización insegura).

```bash
docker compose exec app bin/brakeman                              # Informe completo
docker compose exec app bin/brakeman --no-pager --quiet
docker compose exec app bin/brakeman --exit-on-warn --exit-on-error   # Puerta de CI
docker compose exec app bin/brakeman -f json -o brakeman.json
docker compose exec app bin/brakeman -I                           # Ignorar de forma interactiva
```

### Ignorar falsos positivos

`config/brakeman.ignore` se genera con `brakeman -I`:

```json
{
  "ignored_warnings": [
    {
      "fingerprint": "...",
      "note": "El valor proviene de una constante en lista blanca, revisado el 2026-11-01"
    }
  ]
}
```

Toda advertencia ignorada requiere una justificación escrita (`note`) y un revisor. Trata las advertencias nuevas como fallos del build.

---

## bundler-audit e higiene de dependencias

```bash
docker compose exec app bin/bundler-audit                   # Escanear Gemfile.lock
docker compose exec app bundle exec bundler-audit check --update
docker compose exec app bin/importmap audit                 # Paquetes JS fijados
docker compose exec app bundle outdated --strict
```

`bin/bundler-audit` está conectado por defecto en `config/ci.rb` en Rails 8.1. Compleméntalo con Dependabot o Renovate para PRs de actualización automatizadas, y con un workflow programado nocturno para que los nuevos avisos aparezcan sin un cambio de código.

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

Prácticas de cadena de suministro (OWASP A03:2025): commitea `Gemfile.lock`, revisa las gems nuevas, activa MFA en RubyGems para las gems propias, genera un SBOM (CycloneDX) durante el build, escanea la imagen con Trivy o Grype.

---

## Cobertura: SimpleCov

```ruby
# test/test_helper.rb o spec/rails_helper.rb, primeras líneas
require "simplecov"
SimpleCov.start "rails" do
  enable_coverage :branch
  minimum_coverage line: 80, branch: 70
  minimum_coverage_by_file 60
  add_filter %w[/config/ /db/ /test/ /spec/]
end
```

La cobertura se impone haciendo que SimpleCov termine con un código distinto de cero cuando no se alcanzan los umbrales. Publica `coverage/` como artefacto de CI.

---

## Rendimiento y calidad de datos

### Detección de N+1

```ruby
# config/environments/development.rb y test.rb
config.after_initialize do
  Bullet.enable = true
  Bullet.raise = true if Rails.env.test?
  Bullet.rails_logger = true
end

# Alternativamente, el strict loading integrado de Rails
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

`strong_migrations` bloquea las operaciones inseguras (índices no concurrentes, eliminación de columnas que el código en ejecución aún lee) con un mensaje accionable.

### database_consistency

```bash
docker compose exec app bundle exec database_consistency
```

Detecta índices ausentes detrás de las validaciones, claves foráneas ausentes y discrepancias de `null: false` entre los modelos y el esquema.

---

## Complejidad y smells

```bash
docker compose exec app bundle exec reek app/services          # Code smells
docker compose exec app bundle exec flog -g app/models         # Complejidad (ABC)
docker compose exec app bundle exec flay app                   # Duplicación
```

Umbrales (regla 05 del proyecto): métodos < 10 líneas (límite 20), complejidad cognitiva < 7 (límite 10), complejidad ciclomática < 5 (límite 10), profundidad de anidamiento <= 3, <= 4 parámetros. Los cops `Metrics/*` de RuboCop los aproximan en CI.

---

## Tipado estático (opcional)

### Steep con RBS

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

Adopta un único enfoque de tipado, empieza por los servicios y los value objects, e impónlo en CI. No mezcles sistemas en un mismo directorio.

---

## CI local: bin/ci (Rails 8.1)

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

Añade pasos propios del proyecto para RSpec, tests de sistema, Steep/Sorbet, `zeitwerk:check` y `database_consistency`.

---

## Pipeline de GitHub Actions

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

Fija las actions a SHAs de commit para garantizar la integridad de la cadena de suministro.

---

## Hooks de pre-commit

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

## Alineación con la puntuación

La auditoría `/ruby:check` asigna las herramientas a los ejes:

| Eje | Evidencia de herramientas |
|-----|---------------------------|
| Arquitectura | `zeitwerk:check`, Bullet/strict loading, database_consistency |
| Calidad de código | RuboCop, Reek/Flog, Steep/Sorbet |
| Seguridad | Brakeman, bundler-audit, importmap audit |
| Tests | SimpleCov, resultados de la suite de tests |

---

## Checklist de calidad

- [ ] `bin/rubocop` devuelve 0 infracciones
- [ ] `bin/brakeman` devuelve 0 advertencias sin resolver
- [ ] `bin/bundler-audit` y `bin/importmap audit` están limpios
- [ ] SimpleCov impone >= 80%
- [ ] Detección de N+1 activa en test
- [ ] `strong_migrations` activo
- [ ] `bin/ci` pasa en local y la CI ejecuta los mismos pasos
- [ ] Dependabot o Renovate configurado
- [ ] Las advertencias ignoradas y las desactivaciones de RuboCop llevan una razón
