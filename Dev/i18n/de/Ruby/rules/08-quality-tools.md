# Qualitätswerkzeuge für Ruby on Rails

> Jedes Werkzeug im Container ausführen: `docker compose exec app <command>`. Rails 8 generiert die Binstubs `bin/rubocop`, `bin/brakeman` und `bin/bundler-audit`; Rails 8.1 verkettet sie in `bin/ci`.

## Überblick über die Quality Gates

| Werkzeug | Zweck | Gate |
|----------|-------|------|
| **RuboCop** (`rubocop-rails-omakase`) | Stil und Lint | 0 Verstöße |
| **rubocop-rails / -performance / -rspec** | Zusätzliche Cops | 0 Verstöße |
| **Brakeman** | Statische Sicherheitsanalyse | 0 ungelöste Warnungen |
| **bundler-audit** | CVE-Scan der Gems | 0 bekannte Schwachstellen |
| **importmap audit** | CVE-Scan der JavaScript-Pins | 0 bekannte Schwachstellen |
| **SimpleCov** | Abdeckung | >= 80 % |
| **Bullet / strict_loading** | N+1-Erkennung | 0 N+1 in Tests |
| **Steep / Sorbet** | Optionale Typisierung | 0 Typfehler bei Einführung |
| **Reek / Flog / Flay** | Smells, Komplexität, Duplikation | Beratend |
| **database_consistency** | Konsistenz zwischen Model und Schema | Beratend oder Gate |
| **strong_migrations** | Verhinderung unsicherer Migrationen | Gate |

---

## RuboCop

### Standard: rubocop-rails-omakase

Rails 8 liefert eine meinungsstarke, rauscharme Konfiguration mit.

```yaml
# .rubocop.yml
inherit_gem:
  rubocop-rails-omakase: rubocop.yml
```

```bash
docker compose exec app bin/rubocop                  # Prüfen
docker compose exec app bin/rubocop -a               # Sichere Verstöße automatisch korrigieren
docker compose exec app bin/rubocop -A               # Unsichere Korrekturen einschließen (Diff prüfen)
docker compose exec app bin/rubocop app/models       # Umfang begrenzen
docker compose exec app bin/rubocop -f github        # CI-Annotationen
```

### Strengere Projektkonfiguration

Wenn das Team mehr als die Omakase-Standards möchte, die Community-Cops hinzufügen:

```yaml
# .rubocop.yml
inherit_gem:
  rubocop-rails-omakase: rubocop.yml

plugins:
  - rubocop-rails
  - rubocop-performance
  - rubocop-rspec          # nur bei Verwendung von RSpec

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

Die genaue Plugin-Syntax (`plugins:` vs. `require:`) anhand der installierten RuboCop-Version prüfen, da sich das Laden von Erweiterungen in neueren Versionen geändert hat.

### Umgang mit Verstößen

- Den Code korrigieren; einen Cop inline nur mit Begründung deaktivieren:

```ruby
# rubocop:disable Metrics/MethodLength -- Zustandsautomat aus Gründen der Lesbarkeit flach gehalten
def transition(event)
  # ...
end
# rubocop:enable Metrics/MethodLength
```

- Für Legacy-Schulden eine Todo-Datei generieren und mit der Zeit verkleinern:

```bash
docker compose exec app bin/rubocop --auto-gen-config --auto-gen-only-exclude --exclude-limit 1000
```

- Niemals eine ständig wachsende `.rubocop_todo.yml` einchecken; sie jeden Sprint prüfen

---

## Brakeman

Statische Analyse auf Rails-Sicherheitsprobleme (SQL-Injection, XSS, Mass Assignment, unsichere Redirects, Command Injection, unsichere Deserialisierung).

```bash
docker compose exec app bin/brakeman                              # Vollständiger Bericht
docker compose exec app bin/brakeman --no-pager --quiet
docker compose exec app bin/brakeman --exit-on-warn --exit-on-error   # CI-Gate
docker compose exec app bin/brakeman -f json -o brakeman.json
docker compose exec app bin/brakeman -I                           # Interaktiv ignorieren
```

### Falsch-Positive ignorieren

`config/brakeman.ignore` wird von `brakeman -I` generiert:

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

Jede ignorierte Warnung erfordert eine schriftliche Begründung (`note`) und einen Reviewer. Neue Warnungen wie Build-Fehler behandeln.

---

## bundler-audit und Abhängigkeitshygiene

```bash
docker compose exec app bin/bundler-audit                   # Gemfile.lock scannen
docker compose exec app bundle exec bundler-audit check --update
docker compose exec app bin/importmap audit                 # Gepinnte JS-Pakete
docker compose exec app bundle outdated --strict
```

`bin/bundler-audit` ist in Rails 8.1 standardmäßig in `config/ci.rb` eingebunden. Ergänzen mit Dependabot oder Renovate für automatisierte Update-PRs und einem nächtlich geplanten Workflow, damit neue Advisories ohne Codeänderung sichtbar werden.

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

Supply-Chain-Praktiken (OWASP A03:2025): `Gemfile.lock` einchecken, neue Gems prüfen, MFA auf RubyGems für eigene Gems aktivieren, beim Build ein SBOM (CycloneDX) erzeugen, das Image mit Trivy oder Grype scannen.

---

## Abdeckung: SimpleCov

```ruby
# test/test_helper.rb oder spec/rails_helper.rb, erste Zeilen
require "simplecov"
SimpleCov.start "rails" do
  enable_coverage :branch
  minimum_coverage line: 80, branch: 70
  minimum_coverage_by_file 60
  add_filter %w[/config/ /db/ /test/ /spec/]
end
```

Die Abdeckung wird erzwungen, indem SimpleCov bei verfehlten Schwellenwerten mit einem Wert ungleich null beendet. `coverage/` als CI-Artefakt veröffentlichen.

---

## Performance und Datenqualität

### N+1-Erkennung

```ruby
# config/environments/development.rb und test.rb
config.after_initialize do
  Bullet.enable = true
  Bullet.raise = true if Rails.env.test?
  Bullet.rails_logger = true
end

# Alternativ das in Rails integrierte Strict Loading
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

`strong_migrations` blockiert unsichere Operationen (nicht-nebenläufige Indizes, Spaltenentfernungen, die vom laufenden Code noch gelesen werden) mit einer umsetzbaren Meldung.

### database_consistency

```bash
docker compose exec app bundle exec database_consistency
```

Erkennt fehlende Indizes hinter Validierungen, fehlende Fremdschlüssel und `null: false`-Abweichungen zwischen Models und Schema.

---

## Komplexität und Smells

```bash
docker compose exec app bundle exec reek app/services          # Code Smells
docker compose exec app bundle exec flog -g app/models         # Komplexität (ABC)
docker compose exec app bundle exec flay app                   # Duplikation
```

Schwellenwerte (Projektregel 05): Methoden < 10 Zeilen (Limit 20), kognitive Komplexität < 7 (Limit 10), zyklomatische Komplexität < 5 (Limit 10), Verschachtelungstiefe <= 3, <= 4 Parameter. Die `Metrics/*`-Cops von RuboCop nähern diese in der CI an.

---

## Statische Typisierung (optional)

### Steep mit RBS

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

Einen Typisierungsansatz wählen, mit Services und Value Objects beginnen und ihn in der CI durchsetzen. Systeme nicht im selben Verzeichnis mischen.

---

## Lokale CI: bin/ci (Rails 8.1)

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

Projektspezifische Schritte für RSpec, Systemtests, Steep/Sorbet, `zeitwerk:check` und `database_consistency` ergänzen.

---

## GitHub-Actions-Pipeline

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

Actions für die Integrität der Supply Chain auf Commit-SHAs pinnen.

---

## Pre-Commit-Hooks

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

## Abgleich mit der Bewertung

Das Audit `/ruby:check` ordnet Werkzeuge den Achsen zu:

| Achse | Werkzeug-Nachweis |
|-------|-------------------|
| Architektur | `zeitwerk:check`, Bullet/Strict Loading, database_consistency |
| Codequalität | RuboCop, Reek/Flog, Steep/Sorbet |
| Sicherheit | Brakeman, bundler-audit, importmap audit |
| Tests | SimpleCov, Ergebnisse der Test-Suite |

---

## Qualitäts-Checkliste

- [ ] `bin/rubocop` liefert 0 Verstöße
- [ ] `bin/brakeman` liefert 0 ungelöste Warnungen
- [ ] `bin/bundler-audit` und `bin/importmap audit` sind sauber
- [ ] SimpleCov erzwingt >= 80 %
- [ ] N+1-Erkennung im Test aktiv
- [ ] `strong_migrations` aktiv
- [ ] `bin/ci` läuft lokal durch und die CI führt dieselben Schritte aus
- [ ] Dependabot oder Renovate konfiguriert
- [ ] Ignorierte Warnungen und RuboCop-Deaktivierungen enthalten eine Begründung
