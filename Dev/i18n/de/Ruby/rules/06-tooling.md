# Entwicklungswerkzeuge für Ruby on Rails

> Alle Befehle laufen im Anwendungscontainer. Mit `docker compose exec app` präfixen (oder `docker compose run --rm app` für einmalige Aufgaben), damit die Ergebnisse nicht von der lokalen Umgebung abhängen.

## Docker-Setup

### Dockerfile (Rails-8-Stil)

Rails 8 generiert ein produktionsreifes `Dockerfile`. Die Ruby-Version über `.ruby-version` und ein Build-Argument festlegen.

```dockerfile
# syntax=docker/dockerfile:1
ARG RUBY_VERSION=4.0.9
FROM docker.io/library/ruby:$RUBY_VERSION-slim AS base

WORKDIR /rails

RUN apt-get update -qq && \
    apt-get install --no-install-recommends -y curl libjemalloc2 libvips postgresql-client && \
    rm -rf /var/lib/apt/lists /var/cache/apt/archives

ENV RAILS_ENV="production" \
    BUNDLE_DEPLOYMENT="1" \
    BUNDLE_PATH="/usr/local/bundle" \
    BUNDLE_WITHOUT="development"

FROM base AS build
RUN apt-get update -qq && \
    apt-get install --no-install-recommends -y build-essential git libpq-dev libyaml-dev pkg-config

COPY Gemfile Gemfile.lock ./
RUN bundle install && rm -rf ~/.bundle/ "${BUNDLE_PATH}"/ruby/*/cache

COPY . .
RUN bundle exec bootsnap precompile app/ lib/
RUN SECRET_KEY_BASE_DUMMY=1 ./bin/rails assets:precompile

FROM base
COPY --from=build "${BUNDLE_PATH}" "${BUNDLE_PATH}"
COPY --from=build /rails /rails

RUN groupadd --system --gid 1000 rails && \
    useradd rails --uid 1000 --gid 1000 --create-home --shell /bin/bash && \
    chown -R rails:rails db log storage tmp
USER 1000:1000

ENTRYPOINT ["/rails/bin/docker-entrypoint"]
EXPOSE 80
CMD ["./bin/thrust", "./bin/rails", "server"]
```

Vor dem Festlegen die Ruby-Patch-Version mit den offiziellen Image-Tags abgleichen.

### compose.yaml für die Entwicklung

```yaml
services:
  app:
    build:
      context: .
      target: base
    command: bin/rails server -b 0.0.0.0
    environment:
      RAILS_ENV: development
      DATABASE_URL: postgres://postgres:postgres@db:5432/app_development
    volumes:
      - .:/rails
      - bundle:/usr/local/bundle
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
  bundle:
  pgdata:
```

Datenbank-Image und -Version an die tatsächliche Wahl des Projekts anpassen (PostgreSQL, MySQL oder SQLite).

---

## Verwaltung der Ruby-Version

| Element | Praxis |
|---------|--------|
| `.ruby-version` | Einzige Quelle der Wahrheit (zum Beispiel `4.0.9`) |
| `Gemfile` | `ruby file: ".ruby-version"` |
| Docker | `ARG RUBY_VERSION` entspricht `.ruby-version` |
| Lokale Manager | mise, rbenv oder asdf sind optional; Docker ist die Referenz |

```ruby
# Gemfile
source "https://rubygems.org"

ruby file: ".ruby-version"

gem "rails", "~> 8.1.4", ">= 8.1.4.1"
```

Hinweise zu Ruby 4.0: YJIT bleibt verfügbar (`RUBY_YJIT_ENABLE=1`); ZJIT ist der neue Compiler; `Ruby::Box` ist experimentell und darf nicht in Produktion verwendet werden.

---

## Bundler - Abhängigkeitsverwaltung

### Wichtige Befehle

```bash
docker compose exec app bundle install            # Aus Gemfile.lock installieren
docker compose exec app bundle update --conservative gem_name   # Gezieltes Update
docker compose exec app bundle add gem_name       # Ein Gem hinzufügen
docker compose exec app bundle add rspec-rails --group "development, test"
docker compose exec app bundle remove gem_name
docker compose exec app bundle outdated           # Veraltete Gems anzeigen
docker compose exec app bundle exec bundler-audit check --update   # Schwachstellen
docker compose exec app bundle lock --add-platform x86_64-linux    # CI-Plattform hinzufügen
```

### Gemfile-Konventionen

```ruby
source "https://rubygems.org"
ruby file: ".ruby-version"

gem "rails", "~> 8.1.4", ">= 8.1.4.1"
gem "pg", "~> 1.5"
gem "puma", ">= 5.0"
gem "propshaft"
gem "importmap-rails"
gem "turbo-rails"
gem "stimulus-rails"
gem "solid_queue"
gem "solid_cache"
gem "solid_cable"
gem "bootsnap", require: false
gem "kamal", require: false
gem "thruster", require: false

group :development, :test do
  gem "debug", platforms: %i[mri windows], require: "debug/prelude"
  gem "brakeman", require: false
  gem "bundler-audit", require: false
  gem "rubocop-rails-omakase", require: false
  gem "factory_bot_rails"
  gem "rspec-rails"          # bei Verwendung von Minitest weglassen
end

group :development do
  gem "web-console"
  gem "bullet"
end

group :test do
  gem "capybara"
  gem "selenium-webdriver"
  gem "simplecov", require: false
  gem "webmock"
end
```

Regeln:
- `Gemfile.lock` einchecken
- Für Frameworks pessimistische Constraints (`~>`) verwenden; Gems ohne Einschränkung vermeiden
- Gems korrekt gruppieren, damit Produktions-Images klein bleiben
- Neue Gems vor dem Hinzufügen auf Wartung, Lizenz und Sicherheitshistorie prüfen (Supply Chain, OWASP A03)
- Ungenutzte Gems entfernen (`bundle clean`, in jedem Abhängigkeits-PR prüfen)

---

## Rails-CLI

### Tägliche Befehle

```bash
docker compose exec app bin/rails server -b 0.0.0.0     # Server starten
docker compose exec app bin/rails console               # Konsole
docker compose exec app bin/rails routes -g orders      # Routen filtern
docker compose exec app bin/rails db:prepare            # Bei Bedarf anlegen/migrieren
docker compose exec app bin/rails db:migrate
docker compose exec app bin/rails db:rollback STEP=1
docker compose exec app bin/rails db:seed
docker compose exec app bin/rails about                 # Versionen und Umgebung
docker compose exec app bin/rails zeitwerk:check        # Autoloading-Prüfung
docker compose exec app bin/rails notes                 # TODO/FIXME-Liste
docker compose exec app bin/rails stats                 # Code- und Teststatistiken
```

### Generatoren

```bash
docker compose exec app bin/rails generate model Order user:references status:integer total_cents:integer
docker compose exec app bin/rails generate controller Orders index show
docker compose exec app bin/rails generate scaffold Article title:string body:text
docker compose exec app bin/rails generate migration AddPaidAtToOrders paid_at:datetime
docker compose exec app bin/rails generate authentication      # Eingebaute Auth von Rails 8
docker compose exec app bin/rails generate job SendReceipt
docker compose exec app bin/rails generate mailer Order receipt
docker compose exec app bin/rails destroy model Order          # Einen Generator rückgängig machen
```

Rails-Generatoren berücksichtigen das konfigurierte Test-Framework (`rspec-rails` generiert Specs, andernfalls werden Minitest-Tests generiert).

### Verschlüsselte Credentials

```bash
docker compose exec -e EDITOR=vi app bin/rails credentials:edit
docker compose exec -e EDITOR=vi app bin/rails credentials:edit --environment production
docker compose exec app bin/rails credentials:show
```

`config/master.key` und `config/credentials/*.key` werden niemals eingecheckt. Sie über `RAILS_MASTER_KEY` oder Kamal-Secrets bereitstellen.

### Wartung

```bash
docker compose exec app bin/rails log:clear tmp:clear
docker compose exec app bin/rails assets:precompile       # Propshaft-Assets
docker compose exec app bin/rails db:schema:load
docker compose exec app bin/rails db:migrate:status
docker compose exec app bin/rails runner 'puts User.count'
```

---

## Lokale CI von Rails 8.1: bin/ci

Rails 8.1 deklariert die CI-Pipeline in `config/ci.rb` und führt sie mit `bin/ci` aus.

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

Projekte mit RSpec ersetzen den Test-Schritt durch `bundle exec rspec`.

---

## Entwicklungsserver und Prozesse

### bin/dev und Procfile

```bash
docker compose up                       # Web + Datenbank
docker compose exec app bin/dev         # Wenn eine Procfile.dev existiert
```

```
# Procfile.dev
web: bin/rails server -b 0.0.0.0
jobs: bin/jobs
```

### Solid Queue

```bash
docker compose exec app bin/jobs                       # Den Solid-Queue-Supervisor ausführen
docker compose exec app bin/rails solid_queue:start
```

Die Konfiguration liegt in `config/queue.yml` (Worker, Queues, Threads) und wiederkehrende Aufgaben in `config/recurring.yml`. Für kleine Apps kann Solid Queue mit `SOLID_QUEUE_IN_PUMA=1` innerhalb von Puma laufen.

---

## Debugging

| Werkzeug | Verwendung |
|----------|------------|
| `debug`-Gem | `binding.break` (oder `debugger`) hält in der am Container angehängten Konsole an |
| `web-console` | Konsole im Browser auf Fehlerseiten (Entwicklung) |
| `Rails.logger` | `log/development.log`, `tail -f` über Compose |
| `bin/rails console --sandbox` | Setzt beim Beenden alle Änderungen zurück |
| `rack-mini-profiler` | SQL und Zeitmessung pro Request |
| `bullet` | Warnungen zu N+1 und ungenutztem Eager Loading |

Zum Verwenden des Debuggers an den Container anhängen:

```bash
docker compose up -d
docker attach $(docker compose ps -q app)    # Lösen mit Ctrl-p Ctrl-q
```

---

## Datenbank-Werkzeuge

```bash
docker compose exec app bin/rails dbconsole                 # psql / mysql / sqlite3
docker compose exec app bin/rails db:migrate:status
docker compose exec app bin/rails db:schema:dump
docker compose exec app bin/rails db:environment:set RAILS_ENV=development
```

Multi-Datenbank-Setups (`primary`, `queue`, `cache`, `cable`) sind in Rails 8 der Standard für die Solid-Adapter in Produktion:

```yaml
# config/database.yml (production)
production:
  primary: &primary
    adapter: postgresql
    url: <%= ENV["DATABASE_URL"] %>
  cache:
    <<: *primary
    migrations_paths: db/cache_migrate
  queue:
    <<: *primary
    migrations_paths: db/queue_migrate
  cable:
    <<: *primary
    migrations_paths: db/cable_migrate
```

---

## Asset-Pipeline und Frontend

Standards von Rails 8: **Propshaft** und **importmap**, daher ist kein Node.js-Build erforderlich.

```bash
docker compose exec app bin/importmap pin chart.js         # Ein JS-Paket pinnen
docker compose exec app bin/importmap audit                # Schwachstellen-Audit
docker compose exec app bin/importmap json
```

Wird ein Bundler benötigt (TypeScript, umfangreiches Frontend), `jsbundling-rails` mit esbuild oder Vite Ruby verwenden und Node.js bewusst zum Image hinzufügen.

---

## Deployment: Kamal 2 und Thruster

```bash
docker compose exec app bin/kamal setup           # Erstes Deployment
docker compose exec app bin/kamal deploy
docker compose exec app bin/kamal app logs -f
docker compose exec app bin/kamal rollback <version>
docker compose exec app bin/kamal console
```

```yaml
# config/deploy.yml
service: myapp
image: myorg/myapp
servers:
  web:
    - 192.0.2.10
proxy:
  ssl: true
  host: app.example.com
registry:
  username: myorg
  password:
    - KAMAL_REGISTRY_PASSWORD
env:
  secret:
    - RAILS_MASTER_KEY
```

Thruster (im Standard-`CMD`) liefert HTTP/2, Asset-Caching und Kompression vor Puma. Secrets liegen in `.kamal/secrets`, niemals im Klartext in `deploy.yml`.

---

## Makefile-Kurzbefehle

```makefile
.PHONY: up test lint security ci console

up:
	docker compose up -d

test:
	docker compose exec app bin/rails test

lint:
	docker compose exec app bin/rubocop

security:
	docker compose exec app bin/brakeman --no-pager
	docker compose exec app bin/bundler-audit

ci:
	docker compose exec app bin/ci

console:
	docker compose exec app bin/rails console
```

---

## Editor und LSP

| Werkzeug | Zweck |
|----------|-------|
| Ruby LSP (Shopify) | Vervollständigung, Go-to-Definition, RuboCop-Integration, Rails-Add-on |
| Solargraph | Alternativer Language Server |
| `ruby-lsp` Docker | In einem Dev-Container ausführen, für containergenaue Gems |
| EditorConfig | `.editorconfig` mit `indent_size = 2` |

Die Code-Intelligence-Plugins von Claude Code für Ruby ersetzen mehrere Durchläufe aus grep + Lesen durch einen einzigen Go-to-Definition-Aufruf.

---

## Git-Hooks

```yaml
# lefthook.yml
pre-commit:
  parallel: true
  commands:
    rubocop:
      glob: "*.rb"
      run: docker compose exec -T app bin/rubocop --force-exclusion {staged_files}
    brakeman:
      run: docker compose exec -T app bin/brakeman --quiet --no-pager --exit-on-warn
pre-push:
  commands:
    tests:
      run: docker compose exec -T app bin/rails test
```

Lefthook (oder Overcommit) installiert Hooks, die die CI-Schritte spiegeln, sodass Fehler vor dem Push auftreten.

---

## Fehlerbehebung

| Symptom | Ursache | Lösung |
|---------|---------|--------|
| `Zeitwerk::NameError` | Datei- und Konstantenname weichen ab | Datei oder Konstante umbenennen, `zeitwerk:check` ausführen |
| `PG::ConnectionBad` | Datenbank nicht bereit | Compose-`depends_on` mit Healthcheck verwenden |
| Veraltete Gems nach dem Pull | Image- oder Volume-Cache | `docker compose exec app bundle install` oder neu bauen |
| `ActiveRecord::PendingMigrationError` | Fehlende Migrationen | `bin/rails db:migrate` |
| `Missing secret_key_base` | Kein Credentials-Schlüssel | `RAILS_MASTER_KEY` oder `SECRET_KEY_BASE` setzen |
| Assets in Produktion nicht gefunden | Nicht vorkompiliert | `bin/rails assets:precompile` in der Build-Stage |
| Tests hängen bei System-Specs | Kein Browser im Image | Chromium zum Test-Image hinzufügen oder einen Selenium-Service verwenden |

---

## Tooling-Checkliste

- [ ] `.ruby-version` festgelegt und mit dem Dockerfile abgeglichen
- [ ] `Gemfile.lock` eingecheckt; Gruppen korrekt
- [ ] Jeder dokumentierte Befehl mit `docker compose exec app` präfixiert
- [ ] `bin/ci` / `config/ci.rb` definiert und grün
- [ ] RuboCop, Brakeman und bundler-audit laufen in der CI
- [ ] Credentials-Schlüssel niemals eingecheckt
- [ ] Kamal-Secrets außerhalb der Versionskontrolle
