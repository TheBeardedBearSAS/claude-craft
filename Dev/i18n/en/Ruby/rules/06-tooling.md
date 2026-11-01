# Ruby on Rails Development Tools

> All commands run inside the application container. Prefix with `docker compose exec app` (or `docker compose run --rm app` for one-off tasks) so results do not depend on the local environment.

## Docker Setup

### Dockerfile (Rails 8 style)

Rails 8 generates a production-ready `Dockerfile`. Pin the Ruby version through `.ruby-version` and a build argument.

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

Check the Ruby patch version against the official image tags before pinning.

### compose.yaml for development

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

Adjust the database image and version to the project's actual choice (PostgreSQL, MySQL or SQLite).

---

## Ruby Version Management

| Item | Practice |
|------|----------|
| `.ruby-version` | Single source of truth (for example `4.0.9`) |
| `Gemfile` | `ruby file: ".ruby-version"` |
| Docker | `ARG RUBY_VERSION` matches `.ruby-version` |
| Local managers | mise, rbenv or asdf are optional; Docker is the reference |

```ruby
# Gemfile
source "https://rubygems.org"

ruby file: ".ruby-version"

gem "rails", "~> 8.1.0"
```

Ruby 4.0 notes: YJIT remains available (`RUBY_YJIT_ENABLE=1`); ZJIT is the new compiler; `Ruby::Box` is experimental and must not be used in production.

---

## Bundler - Dependency Management

### Essential Commands

```bash
docker compose exec app bundle install            # Install from Gemfile.lock
docker compose exec app bundle update --conservative gem_name   # Targeted update
docker compose exec app bundle add gem_name       # Add a gem
docker compose exec app bundle add rspec-rails --group "development, test"
docker compose exec app bundle remove gem_name
docker compose exec app bundle outdated           # Show outdated gems
docker compose exec app bundle exec bundler-audit check --update   # Vulnerabilities
docker compose exec app bundle lock --add-platform x86_64-linux    # Add CI platform
```

### Gemfile Conventions

```ruby
source "https://rubygems.org"
ruby file: ".ruby-version"

gem "rails", "~> 8.1.0"
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
  gem "rspec-rails"          # omit when using Minitest
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

Rules:
- Commit `Gemfile.lock`
- Use pessimistic constraints (`~>`) for frameworks; avoid unconstrained gems
- Group gems correctly so production images stay small
- Review new gems for maintenance, licence and security history before adding them (supply chain, OWASP A03)
- Remove unused gems (`bundle clean`, review in each dependency PR)

---

## Rails CLI

### Daily Commands

```bash
docker compose exec app bin/rails server -b 0.0.0.0     # Start the server
docker compose exec app bin/rails console               # Console
docker compose exec app bin/rails routes -g orders      # Filter routes
docker compose exec app bin/rails db:prepare            # Create/migrate as needed
docker compose exec app bin/rails db:migrate
docker compose exec app bin/rails db:rollback STEP=1
docker compose exec app bin/rails db:seed
docker compose exec app bin/rails about                 # Versions and environment
docker compose exec app bin/rails zeitwerk:check        # Autoloading check
docker compose exec app bin/rails notes                 # TODO/FIXME listing
docker compose exec app bin/rails stats                 # Code and test stats
```

### Generators

```bash
docker compose exec app bin/rails generate model Order user:references status:integer total_cents:integer
docker compose exec app bin/rails generate controller Orders index show
docker compose exec app bin/rails generate scaffold Article title:string body:text
docker compose exec app bin/rails generate migration AddPaidAtToOrders paid_at:datetime
docker compose exec app bin/rails generate authentication      # Rails 8 built-in auth
docker compose exec app bin/rails generate job SendReceipt
docker compose exec app bin/rails generate mailer Order receipt
docker compose exec app bin/rails destroy model Order          # Undo a generator
```

Rails generators honour the configured test framework (`rspec-rails` generates specs, otherwise Minitest tests are generated).

### Encrypted Credentials

```bash
docker compose exec -e EDITOR=vi app bin/rails credentials:edit
docker compose exec -e EDITOR=vi app bin/rails credentials:edit --environment production
docker compose exec app bin/rails credentials:show
```

`config/master.key` and `config/credentials/*.key` are never committed. Provide them through `RAILS_MASTER_KEY` or Kamal secrets.

### Maintenance

```bash
docker compose exec app bin/rails log:clear tmp:clear
docker compose exec app bin/rails assets:precompile       # Propshaft assets
docker compose exec app bin/rails db:schema:load
docker compose exec app bin/rails db:migrate:status
docker compose exec app bin/rails runner 'puts User.count'
```

---

## Rails 8.1 Local CI: bin/ci

Rails 8.1 declares the CI pipeline in `config/ci.rb` and runs it with `bin/ci`.

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

Projects using RSpec replace the test step with `bundle exec rspec`.

---

## Development Server and Processes

### bin/dev and Procfile

```bash
docker compose up                       # Web + database
docker compose exec app bin/dev         # When a Procfile.dev exists
```

```
# Procfile.dev
web: bin/rails server -b 0.0.0.0
jobs: bin/jobs
```

### Solid Queue

```bash
docker compose exec app bin/jobs                       # Run the Solid Queue supervisor
docker compose exec app bin/rails solid_queue:start
```

Configuration lives in `config/queue.yml` (workers, queues, threads) and recurring tasks in `config/recurring.yml`. For small apps Solid Queue can run inside Puma with `SOLID_QUEUE_IN_PUMA=1`.

---

## Debugging

| Tool | Usage |
|------|-------|
| `debug` gem | `binding.break` (or `debugger`) pauses in the console attached to the container |
| `web-console` | In-browser console on error pages (development) |
| `Rails.logger` | `log/development.log`, `tail -f` through compose |
| `bin/rails console --sandbox` | Rolls back all changes on exit |
| `rack-mini-profiler` | Per-request SQL and timing |
| `bullet` | N+1 and unused eager loading alerts |

Attach to the container to use the debugger:

```bash
docker compose up -d
docker attach $(docker compose ps -q app)    # Detach with Ctrl-p Ctrl-q
```

---

## Database Tools

```bash
docker compose exec app bin/rails dbconsole                 # psql / mysql / sqlite3
docker compose exec app bin/rails db:migrate:status
docker compose exec app bin/rails db:schema:dump
docker compose exec app bin/rails db:environment:set RAILS_ENV=development
```

Multi-database setups (`primary`, `queue`, `cache`, `cable`) are the Rails 8 default for Solid adapters in production:

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

## Asset Pipeline and Frontend

Rails 8 defaults: **Propshaft** and **importmap**, so no Node.js build is required.

```bash
docker compose exec app bin/importmap pin chart.js         # Pin a JS package
docker compose exec app bin/importmap audit                # Vulnerability audit
docker compose exec app bin/importmap json
```

If a bundler is needed (TypeScript, heavy front-end), use `jsbundling-rails` with esbuild or Vite Ruby and add Node.js to the image deliberately.

---

## Deployment: Kamal 2 and Thruster

```bash
docker compose exec app bin/kamal setup           # First deploy
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

Thruster (in the default `CMD`) provides HTTP/2, asset caching and compression in front of Puma. Secrets live in `.kamal/secrets`, never in `deploy.yml` in clear text.

---

## Makefile Shortcuts

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

## Editor and LSP

| Tool | Purpose |
|------|---------|
| Ruby LSP (Shopify) | Completion, go-to-definition, RuboCop integration, Rails add-on |
| Solargraph | Alternative language server |
| `ruby-lsp` Docker | Run inside a dev container for container-accurate gems |
| EditorConfig | `.editorconfig` with `indent_size = 2` |

Claude Code Code Intelligence plugins for Ruby replace several grep + read passes with one go-to-definition call.

---

## Git Hooks

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

Lefthook (or Overcommit) installs hooks that mirror the CI steps, so failures appear before the push.

---

## Troubleshooting

| Symptom | Cause | Fix |
|---------|-------|-----|
| `Zeitwerk::NameError` | File and constant name differ | Rename file or constant, run `zeitwerk:check` |
| `PG::ConnectionBad` | Database not ready | Use compose `depends_on` with healthcheck |
| Stale gems after pull | Image or volume cache | `docker compose exec app bundle install` or rebuild |
| `ActiveRecord::PendingMigrationError` | Missing migrations | `bin/rails db:migrate` |
| `Missing secret_key_base` | No credentials key | Set `RAILS_MASTER_KEY` or `SECRET_KEY_BASE` |
| Assets not found in production | Not precompiled | `bin/rails assets:precompile` in the build stage |
| Tests hang on system specs | No browser in image | Add Chromium to the test image or use a Selenium service |

---

## Tooling Checklist

- [ ] `.ruby-version` pinned and aligned with the Dockerfile
- [ ] `Gemfile.lock` committed; groups correct
- [ ] Every documented command prefixed with `docker compose exec app`
- [ ] `bin/ci` / `config/ci.rb` defined and green
- [ ] RuboCop, Brakeman and bundler-audit run in CI
- [ ] Credentials key never committed
- [ ] Kamal secrets outside version control
