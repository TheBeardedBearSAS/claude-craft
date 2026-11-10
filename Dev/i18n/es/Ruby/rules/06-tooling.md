# Herramientas de desarrollo Ruby on Rails

> Todos los comandos se ejecutan dentro del contenedor de la aplicación. Prefíjalos con `docker compose exec app` (o `docker compose run --rm app` para tareas puntuales) para que los resultados no dependan del entorno local.

## Configuración de Docker

### Dockerfile (estilo Rails 8)

Rails 8 genera un `Dockerfile` listo para producción. Fija la versión de Ruby mediante `.ruby-version` y un argumento de build.

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

Comprueba la versión de parche de Ruby con las etiquetas de la imagen oficial antes de fijarla.

### compose.yaml para desarrollo

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

Ajusta la imagen y la versión de la base de datos a la elección real del proyecto (PostgreSQL, MySQL o SQLite).

---

## Gestión de versiones de Ruby

| Elemento | Práctica |
|----------|----------|
| `.ruby-version` | Única fuente de verdad (por ejemplo `4.0.9`) |
| `Gemfile` | `ruby file: ".ruby-version"` |
| Docker | `ARG RUBY_VERSION` coincide con `.ruby-version` |
| Gestores locales | mise, rbenv o asdf son opcionales; Docker es la referencia |

```ruby
# Gemfile
source "https://rubygems.org"

ruby file: ".ruby-version"

gem "rails", "~> 8.1.4", ">= 8.1.4.1"
```

Notas sobre Ruby 4.0: YJIT sigue disponible (`RUBY_YJIT_ENABLE=1`); ZJIT es el nuevo compilador; `Ruby::Box` es experimental y no debe usarse en producción.

---

## Bundler - Gestión de dependencias

### Comandos esenciales

```bash
docker compose exec app bundle install            # Instalar desde Gemfile.lock
docker compose exec app bundle update --conservative gem_name   # Actualización dirigida
docker compose exec app bundle add gem_name       # Añadir una gem
docker compose exec app bundle add rspec-rails --group "development, test"
docker compose exec app bundle remove gem_name
docker compose exec app bundle outdated           # Mostrar gems desactualizadas
docker compose exec app bundle exec bundler-audit check --update   # Vulnerabilidades
docker compose exec app bundle lock --add-platform x86_64-linux    # Añadir plataforma de CI
```

### Convenciones del Gemfile

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
  gem "rspec-rails"          # omitir si se usa Minitest
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

Reglas:
- Commitea `Gemfile.lock`
- Usa restricciones pesimistas (`~>`) para los frameworks; evita gems sin restricción de versión
- Agrupa correctamente las gems para que las imágenes de producción sigan siendo pequeñas
- Revisa el mantenimiento, la licencia y el historial de seguridad de las gems nuevas antes de añadirlas (cadena de suministro, OWASP A03)
- Elimina las gems sin usar (`bundle clean`, revisión en cada PR de dependencias)

---

## CLI de Rails

### Comandos diarios

```bash
docker compose exec app bin/rails server -b 0.0.0.0     # Iniciar el servidor
docker compose exec app bin/rails console               # Consola
docker compose exec app bin/rails routes -g orders      # Filtrar rutas
docker compose exec app bin/rails db:prepare            # Crear/migrar según haga falta
docker compose exec app bin/rails db:migrate
docker compose exec app bin/rails db:rollback STEP=1
docker compose exec app bin/rails db:seed
docker compose exec app bin/rails about                 # Versiones y entorno
docker compose exec app bin/rails zeitwerk:check        # Verificación del autoloading
docker compose exec app bin/rails notes                 # Listado de TODO/FIXME
docker compose exec app bin/rails stats                 # Estadísticas de código y tests
```

### Generadores

```bash
docker compose exec app bin/rails generate model Order user:references status:integer total_cents:integer
docker compose exec app bin/rails generate controller Orders index show
docker compose exec app bin/rails generate scaffold Article title:string body:text
docker compose exec app bin/rails generate migration AddPaidAtToOrders paid_at:datetime
docker compose exec app bin/rails generate authentication      # Autenticación integrada de Rails 8
docker compose exec app bin/rails generate job SendReceipt
docker compose exec app bin/rails generate mailer Order receipt
docker compose exec app bin/rails destroy model Order          # Deshacer un generador
```

Los generadores de Rails respetan el framework de tests configurado (`rspec-rails` genera specs; si no, se generan tests de Minitest).

### Credentials cifradas

```bash
docker compose exec -e EDITOR=vi app bin/rails credentials:edit
docker compose exec -e EDITOR=vi app bin/rails credentials:edit --environment production
docker compose exec app bin/rails credentials:show
```

`config/master.key` y `config/credentials/*.key` nunca se commitean. Proporciónalas mediante `RAILS_MASTER_KEY` o los secretos de Kamal.

### Mantenimiento

```bash
docker compose exec app bin/rails log:clear tmp:clear
docker compose exec app bin/rails assets:precompile       # Assets de Propshaft
docker compose exec app bin/rails db:schema:load
docker compose exec app bin/rails db:migrate:status
docker compose exec app bin/rails runner 'puts User.count'
```

---

## CI local de Rails 8.1: bin/ci

Rails 8.1 declara el pipeline de CI en `config/ci.rb` y lo ejecuta con `bin/ci`.

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

Los proyectos que usan RSpec sustituyen el paso de tests por `bundle exec rspec`.

---

## Servidor de desarrollo y procesos

### bin/dev y Procfile

```bash
docker compose up                       # Web + base de datos
docker compose exec app bin/dev         # Cuando existe un Procfile.dev
```

```
# Procfile.dev
web: bin/rails server -b 0.0.0.0
jobs: bin/jobs
```

### Solid Queue

```bash
docker compose exec app bin/jobs                       # Ejecutar el supervisor de Solid Queue
docker compose exec app bin/rails solid_queue:start
```

La configuración vive en `config/queue.yml` (workers, colas, threads) y las tareas recurrentes en `config/recurring.yml`. En aplicaciones pequeñas Solid Queue puede ejecutarse dentro de Puma con `SOLID_QUEUE_IN_PUMA=1`.

---

## Depuración

| Herramienta | Uso |
|-------------|-----|
| gem `debug` | `binding.break` (o `debugger`) pausa en la consola adjunta al contenedor |
| `web-console` | Consola en el navegador en las páginas de error (desarrollo) |
| `Rails.logger` | `log/development.log`, `tail -f` a través de compose |
| `bin/rails console --sandbox` | Revierte todos los cambios al salir |
| `rack-mini-profiler` | SQL y tiempos por request |
| `bullet` | Alertas de N+1 y de eager loading innecesario |

Adjúntate al contenedor para usar el depurador:

```bash
docker compose up -d
docker attach $(docker compose ps -q app)    # Desadjuntar con Ctrl-p Ctrl-q
```

---

## Herramientas de base de datos

```bash
docker compose exec app bin/rails dbconsole                 # psql / mysql / sqlite3
docker compose exec app bin/rails db:migrate:status
docker compose exec app bin/rails db:schema:dump
docker compose exec app bin/rails db:environment:set RAILS_ENV=development
```

Las configuraciones multi-base de datos (`primary`, `queue`, `cache`, `cable`) son el valor por defecto de Rails 8 para los adaptadores Solid en producción:

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

## Asset Pipeline y frontend

Valores por defecto de Rails 8: **Propshaft** e **importmap**, por lo que no se necesita un build con Node.js.

```bash
docker compose exec app bin/importmap pin chart.js         # Fijar un paquete JS
docker compose exec app bin/importmap audit                # Auditoría de vulnerabilidades
docker compose exec app bin/importmap json
```

Si se necesita un bundler (TypeScript, frontend pesado), usa `jsbundling-rails` con esbuild o Vite Ruby y añade Node.js a la imagen de forma deliberada.

---

## Despliegue: Kamal 2 y Thruster

```bash
docker compose exec app bin/kamal setup           # Primer despliegue
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

Thruster (en el `CMD` por defecto) aporta HTTP/2, caché de assets y compresión delante de Puma. Los secretos viven en `.kamal/secrets`, nunca en `deploy.yml` en texto claro.

---

## Atajos de Makefile

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

## Editor y LSP

| Herramienta | Propósito |
|-------------|-----------|
| Ruby LSP (Shopify) | Autocompletado, go-to-definition, integración con RuboCop, add-on de Rails |
| Solargraph | Servidor de lenguaje alternativo |
| `ruby-lsp` Docker | Ejecutar dentro de un dev container para tener gems fieles al contenedor |
| EditorConfig | `.editorconfig` con `indent_size = 2` |

Los plugins de Code Intelligence de Claude Code para Ruby sustituyen varias pasadas de grep + lectura por una sola llamada a go-to-definition.

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

Lefthook (u Overcommit) instala hooks que replican los pasos de CI, de modo que los fallos aparecen antes del push.

---

## Resolución de problemas

| Síntoma | Causa | Solución |
|---------|-------|----------|
| `Zeitwerk::NameError` | El nombre del archivo y de la constante difieren | Renombrar el archivo o la constante, ejecutar `zeitwerk:check` |
| `PG::ConnectionBad` | Base de datos no lista | Usar `depends_on` de compose con healthcheck |
| Gems obsoletas tras un pull | Caché de la imagen o del volumen | `docker compose exec app bundle install` o reconstruir |
| `ActiveRecord::PendingMigrationError` | Migraciones pendientes | `bin/rails db:migrate` |
| `Missing secret_key_base` | Sin clave de credentials | Definir `RAILS_MASTER_KEY` o `SECRET_KEY_BASE` |
| Assets no encontrados en producción | No precompilados | `bin/rails assets:precompile` en la etapa de build |
| Los tests se cuelgan en los system specs | Sin navegador en la imagen | Añadir Chromium a la imagen de test o usar un servicio Selenium |

---

## Checklist de herramientas

- [ ] `.ruby-version` fijado y alineado con el Dockerfile
- [ ] `Gemfile.lock` commiteado; grupos correctos
- [ ] Todo comando documentado prefijado con `docker compose exec app`
- [ ] `bin/ci` / `config/ci.rb` definidos y en verde
- [ ] RuboCop, Brakeman y bundler-audit se ejecutan en CI
- [ ] La clave de credentials nunca se commitea
- [ ] Secretos de Kamal fuera del control de versiones
