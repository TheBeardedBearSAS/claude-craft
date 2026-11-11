# Outils de Développement Ruby on Rails

> Toutes les commandes s'exécutent dans le conteneur de l'application. Préfixez avec `docker compose exec app` (ou `docker compose run --rm app` pour les tâches ponctuelles) afin que les résultats ne dépendent pas de l'environnement local.

## Configuration Docker

### Dockerfile (style Rails 8)

Rails 8 génère un `Dockerfile` prêt pour la production. Épinglez la version de Ruby via `.ruby-version` et un argument de build.

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

Vérifiez la version corrective de Ruby par rapport aux tags officiels de l'image avant de l'épingler.

### compose.yaml pour le développement

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

Adaptez l'image et la version de la base de données au choix réel du projet (PostgreSQL, MySQL ou SQLite).

---

## Gestion de la version de Ruby

| Élément | Pratique |
|---------|----------|
| `.ruby-version` | Source unique de vérité (par exemple `4.0.9`) |
| `Gemfile` | `ruby file: ".ruby-version"` |
| Docker | `ARG RUBY_VERSION` correspond à `.ruby-version` |
| Gestionnaires locaux | mise, rbenv ou asdf sont optionnels ; Docker est la référence |

```ruby
# Gemfile
source "https://rubygems.org"

ruby file: ".ruby-version"

gem "rails", "~> 8.1.4", ">= 8.1.4.1"
```

Notes sur Ruby 4.0 : YJIT reste disponible (`RUBY_YJIT_ENABLE=1`) ; ZJIT est le nouveau compilateur ; `Ruby::Box` est expérimental et ne doit pas être utilisé en production.

---

## Bundler - Gestion des dépendances

### Commandes essentielles

```bash
docker compose exec app bundle install            # Installer depuis Gemfile.lock
docker compose exec app bundle update --conservative gem_name   # Mise à jour ciblée
docker compose exec app bundle add gem_name       # Ajouter une gem
docker compose exec app bundle add rspec-rails --group "development, test"
docker compose exec app bundle remove gem_name
docker compose exec app bundle outdated           # Afficher les gems obsolètes
docker compose exec app bundle exec bundler-audit check --update   # Vulnérabilités
docker compose exec app bundle lock --add-platform x86_64-linux    # Ajouter la plateforme de CI
```

### Conventions du Gemfile

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
  gem "rspec-rails"          # à omettre avec Minitest
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

Règles :
- Commiter `Gemfile.lock`
- Utiliser des contraintes pessimistes (`~>`) pour les frameworks ; éviter les gems sans contrainte
- Grouper correctement les gems pour que les images de production restent petites
- Examiner la maintenance, la licence et l'historique de sécurité des nouvelles gems avant de les ajouter (chaîne d'approvisionnement, OWASP A03)
- Supprimer les gems inutilisées (`bundle clean`, revue dans chaque PR de dépendances)

---

## CLI Rails

### Commandes quotidiennes

```bash
docker compose exec app bin/rails server -b 0.0.0.0     # Démarrer le serveur
docker compose exec app bin/rails console               # Console
docker compose exec app bin/rails routes -g orders      # Filtrer les routes
docker compose exec app bin/rails db:prepare            # Créer/migrer au besoin
docker compose exec app bin/rails db:migrate
docker compose exec app bin/rails db:rollback STEP=1
docker compose exec app bin/rails db:seed
docker compose exec app bin/rails about                 # Versions et environnement
docker compose exec app bin/rails zeitwerk:check        # Vérification de l'autoloading
docker compose exec app bin/rails notes                 # Liste des TODO/FIXME
docker compose exec app bin/rails stats                 # Statistiques de code et de tests
```

### Générateurs

```bash
docker compose exec app bin/rails generate model Order user:references status:integer total_cents:integer
docker compose exec app bin/rails generate controller Orders index show
docker compose exec app bin/rails generate scaffold Article title:string body:text
docker compose exec app bin/rails generate migration AddPaidAtToOrders paid_at:datetime
docker compose exec app bin/rails generate authentication      # Authentification intégrée de Rails 8
docker compose exec app bin/rails generate job SendReceipt
docker compose exec app bin/rails generate mailer Order receipt
docker compose exec app bin/rails destroy model Order          # Annuler un générateur
```

Les générateurs Rails respectent le framework de test configuré (`rspec-rails` génère des specs, sinon des tests Minitest sont générés).

### Credentials chiffrés

```bash
docker compose exec -e EDITOR=vi app bin/rails credentials:edit
docker compose exec -e EDITOR=vi app bin/rails credentials:edit --environment production
docker compose exec app bin/rails credentials:show
```

`config/master.key` et `config/credentials/*.key` ne sont jamais commités. Fournissez-les via `RAILS_MASTER_KEY` ou les secrets Kamal.

### Maintenance

```bash
docker compose exec app bin/rails log:clear tmp:clear
docker compose exec app bin/rails assets:precompile       # Assets Propshaft
docker compose exec app bin/rails db:schema:load
docker compose exec app bin/rails db:migrate:status
docker compose exec app bin/rails runner 'puts User.count'
```

---

## CI locale Rails 8.1 : bin/ci

Rails 8.1 déclare le pipeline de CI dans `config/ci.rb` et l'exécute avec `bin/ci`.

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

Les projets utilisant RSpec remplacent l'étape de test par `bundle exec rspec`.

---

## Serveur de développement et processus

### bin/dev et Procfile

```bash
docker compose up                       # Web + base de données
docker compose exec app bin/dev         # Lorsqu'un Procfile.dev existe
```

```
# Procfile.dev
web: bin/rails server -b 0.0.0.0
jobs: bin/jobs
```

### Solid Queue

```bash
docker compose exec app bin/jobs                       # Lancer le superviseur Solid Queue
docker compose exec app bin/rails solid_queue:start
```

La configuration se trouve dans `config/queue.yml` (workers, files, threads) et les tâches récurrentes dans `config/recurring.yml`. Pour les petites applications, Solid Queue peut s'exécuter dans Puma avec `SOLID_QUEUE_IN_PUMA=1`.

---

## Débogage

| Outil | Usage |
|-------|-------|
| gem `debug` | `binding.break` (ou `debugger`) met en pause dans la console attachée au conteneur |
| `web-console` | Console dans le navigateur sur les pages d'erreur (développement) |
| `Rails.logger` | `log/development.log`, `tail -f` via compose |
| `bin/rails console --sandbox` | Annule tous les changements à la sortie |
| `rack-mini-profiler` | SQL et temps par requête |
| `bullet` | Alertes sur les N+1 et les chargements anticipés inutiles |

Attachez-vous au conteneur pour utiliser le débogueur :

```bash
docker compose up -d
docker attach $(docker compose ps -q app)    # Se détacher avec Ctrl-p Ctrl-q
```

---

## Outils de base de données

```bash
docker compose exec app bin/rails dbconsole                 # psql / mysql / sqlite3
docker compose exec app bin/rails db:migrate:status
docker compose exec app bin/rails db:schema:dump
docker compose exec app bin/rails db:environment:set RAILS_ENV=development
```

Les configurations multi-bases (`primary`, `queue`, `cache`, `cable`) sont le défaut de Rails 8 pour les adaptateurs Solid en production :

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

## Pipeline d'assets et frontend

Défauts de Rails 8 : **Propshaft** et **importmap**, aucun build Node.js n'est donc requis.

```bash
docker compose exec app bin/importmap pin chart.js         # Épingler un paquet JS
docker compose exec app bin/importmap audit                # Audit de vulnérabilités
docker compose exec app bin/importmap json
```

Si un bundler est nécessaire (TypeScript, front-end lourd), utilisez `jsbundling-rails` avec esbuild ou Vite Ruby et ajoutez Node.js à l'image de façon délibérée.

---

## Déploiement : Kamal 2 et Thruster

```bash
docker compose exec app bin/kamal setup           # Premier déploiement
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

Thruster (dans le `CMD` par défaut) fournit HTTP/2, la mise en cache des assets et la compression devant Puma. Les secrets résident dans `.kamal/secrets`, jamais en clair dans `deploy.yml`.

---

## Raccourcis Makefile

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

## Éditeur et LSP

| Outil | Rôle |
|-------|------|
| Ruby LSP (Shopify) | Complétion, go-to-definition, intégration RuboCop, add-on Rails |
| Solargraph | Serveur de langage alternatif |
| `ruby-lsp` Docker | À exécuter dans un dev container pour des gems fidèles au conteneur |
| EditorConfig | `.editorconfig` avec `indent_size = 2` |

Les plugins Code Intelligence de Claude Code pour Ruby remplacent plusieurs passes de grep + lecture par un seul appel go-to-definition.

---

## Hooks Git

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

Lefthook (ou Overcommit) installe des hooks qui reproduisent les étapes de la CI, de sorte que les échecs apparaissent avant le push.

---

## Dépannage

| Symptôme | Cause | Correction |
|----------|-------|------------|
| `Zeitwerk::NameError` | Le nom du fichier et celui de la constante diffèrent | Renommer le fichier ou la constante, lancer `zeitwerk:check` |
| `PG::ConnectionBad` | Base de données pas prête | Utiliser `depends_on` de compose avec un healthcheck |
| Gems obsolètes après un pull | Cache de l'image ou du volume | `docker compose exec app bundle install` ou reconstruire |
| `ActiveRecord::PendingMigrationError` | Migrations manquantes | `bin/rails db:migrate` |
| `Missing secret_key_base` | Aucune clé de credentials | Définir `RAILS_MASTER_KEY` ou `SECRET_KEY_BASE` |
| Assets introuvables en production | Non précompilés | `bin/rails assets:precompile` dans l'étape de build |
| Les tests système se bloquent | Aucun navigateur dans l'image | Ajouter Chromium à l'image de test ou utiliser un service Selenium |

---

## Checklist de l'outillage

- [ ] `.ruby-version` épinglé et aligné avec le Dockerfile
- [ ] `Gemfile.lock` commité ; groupes corrects
- [ ] Chaque commande documentée préfixée par `docker compose exec app`
- [ ] `bin/ci` / `config/ci.rb` défini et au vert
- [ ] RuboCop, Brakeman et bundler-audit exécutés en CI
- [ ] Clé de credentials jamais commitée
- [ ] Secrets Kamal hors du contrôle de version
