# Ferramentas de Desenvolvimento Ruby on Rails

> Todos os comandos rodam dentro do container da aplicação. Use o prefixo `docker compose exec app` (ou `docker compose run --rm app` para tarefas pontuais) para que os resultados não dependam do ambiente local.

## Configuração do Docker

### Dockerfile (estilo Rails 8)

O Rails 8 gera um `Dockerfile` pronto para produção. Fixe a versão do Ruby por meio de `.ruby-version` e de um argumento de build.

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

Confira a versão de patch do Ruby nas tags da imagem oficial antes de fixá-la.

### compose.yaml para desenvolvimento

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

Ajuste a imagem e a versão do banco de dados para a escolha real do projeto (PostgreSQL, MySQL ou SQLite).

---

## Gerenciamento de Versões do Ruby

| Item | Prática |
|------|---------|
| `.ruby-version` | Fonte única da verdade (por exemplo `4.0.9`) |
| `Gemfile` | `ruby file: ".ruby-version"` |
| Docker | `ARG RUBY_VERSION` corresponde a `.ruby-version` |
| Gerenciadores locais | mise, rbenv ou asdf são opcionais; o Docker é a referência |

```ruby
# Gemfile
source "https://rubygems.org"

ruby file: ".ruby-version"

gem "rails", "~> 8.1.0"
```

Notas sobre o Ruby 4.0: o YJIT continua disponível (`RUBY_YJIT_ENABLE=1`); o ZJIT é o novo compilador; `Ruby::Box` é experimental e não deve ser usado em produção.

---

## Bundler - Gerenciamento de Dependências

### Comandos Essenciais

```bash
docker compose exec app bundle install            # Instalar a partir do Gemfile.lock
docker compose exec app bundle update --conservative gem_name   # Atualização pontual
docker compose exec app bundle add gem_name       # Adicionar uma gem
docker compose exec app bundle add rspec-rails --group "development, test"
docker compose exec app bundle remove gem_name
docker compose exec app bundle outdated           # Mostrar gems desatualizadas
docker compose exec app bundle exec bundler-audit check --update   # Vulnerabilidades
docker compose exec app bundle lock --add-platform x86_64-linux    # Adicionar plataforma do CI
```

### Convenções do Gemfile

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
  gem "rspec-rails"          # omitir ao usar Minitest
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

Regras:
- Faça commit do `Gemfile.lock`
- Use restrições pessimistas (`~>`) para frameworks; evite gems sem restrição de versão
- Agrupe as gems corretamente para que as imagens de produção permaneçam pequenas
- Avalie manutenção, licença e histórico de segurança das novas gems antes de adicioná-las (supply chain, OWASP A03)
- Remova gems não utilizadas (`bundle clean`, revisão em cada PR de dependências)

---

## CLI do Rails

### Comandos do Dia a Dia

```bash
docker compose exec app bin/rails server -b 0.0.0.0     # Iniciar o servidor
docker compose exec app bin/rails console               # Console
docker compose exec app bin/rails routes -g orders      # Filtrar rotas
docker compose exec app bin/rails db:prepare            # Criar/migrar conforme necessário
docker compose exec app bin/rails db:migrate
docker compose exec app bin/rails db:rollback STEP=1
docker compose exec app bin/rails db:seed
docker compose exec app bin/rails about                 # Versões e ambiente
docker compose exec app bin/rails zeitwerk:check        # Verificação de autoloading
docker compose exec app bin/rails notes                 # Listagem de TODO/FIXME
docker compose exec app bin/rails stats                 # Estatísticas de código e testes
```

### Generators

```bash
docker compose exec app bin/rails generate model Order user:references status:integer total_cents:integer
docker compose exec app bin/rails generate controller Orders index show
docker compose exec app bin/rails generate scaffold Article title:string body:text
docker compose exec app bin/rails generate migration AddPaidAtToOrders paid_at:datetime
docker compose exec app bin/rails generate authentication      # Autenticação nativa do Rails 8
docker compose exec app bin/rails generate job SendReceipt
docker compose exec app bin/rails generate mailer Order receipt
docker compose exec app bin/rails destroy model Order          # Desfazer um generator
```

Os generators do Rails respeitam o framework de testes configurado (`rspec-rails` gera specs; caso contrário, são gerados testes Minitest).

### Credentials Criptografadas

```bash
docker compose exec -e EDITOR=vi app bin/rails credentials:edit
docker compose exec -e EDITOR=vi app bin/rails credentials:edit --environment production
docker compose exec app bin/rails credentials:show
```

`config/master.key` e `config/credentials/*.key` nunca são commitados. Forneça-os por meio de `RAILS_MASTER_KEY` ou dos segredos do Kamal.

### Manutenção

```bash
docker compose exec app bin/rails log:clear tmp:clear
docker compose exec app bin/rails assets:precompile       # Assets do Propshaft
docker compose exec app bin/rails db:schema:load
docker compose exec app bin/rails db:migrate:status
docker compose exec app bin/rails runner 'puts User.count'
```

---

## CI Local do Rails 8.1: bin/ci

O Rails 8.1 declara o pipeline de CI em `config/ci.rb` e o executa com `bin/ci`.

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

Projetos que usam RSpec substituem a etapa de testes por `bundle exec rspec`.

---

## Servidor de Desenvolvimento e Processos

### bin/dev e Procfile

```bash
docker compose up                       # Web + banco de dados
docker compose exec app bin/dev         # Quando existe um Procfile.dev
```

```
# Procfile.dev
web: bin/rails server -b 0.0.0.0
jobs: bin/jobs
```

### Solid Queue

```bash
docker compose exec app bin/jobs                       # Executar o supervisor do Solid Queue
docker compose exec app bin/rails solid_queue:start
```

A configuração fica em `config/queue.yml` (workers, filas, threads) e as tarefas recorrentes em `config/recurring.yml`. Em aplicações pequenas, o Solid Queue pode rodar dentro do Puma com `SOLID_QUEUE_IN_PUMA=1`.

---

## Depuração

| Ferramenta | Uso |
|------------|-----|
| gem `debug` | `binding.break` (ou `debugger`) pausa no console anexado ao container |
| `web-console` | Console no navegador nas páginas de erro (desenvolvimento) |
| `Rails.logger` | `log/development.log`, `tail -f` via compose |
| `bin/rails console --sandbox` | Desfaz todas as alterações ao sair |
| `rack-mini-profiler` | SQL e tempos por requisição |
| `bullet` | Alertas de N+1 e de eager loading não utilizado |

Anexe-se ao container para usar o debugger:

```bash
docker compose up -d
docker attach $(docker compose ps -q app)    # Desanexar com Ctrl-p Ctrl-q
```

---

## Ferramentas de Banco de Dados

```bash
docker compose exec app bin/rails dbconsole                 # psql / mysql / sqlite3
docker compose exec app bin/rails db:migrate:status
docker compose exec app bin/rails db:schema:dump
docker compose exec app bin/rails db:environment:set RAILS_ENV=development
```

Configurações multi-banco (`primary`, `queue`, `cache`, `cable`) são o padrão do Rails 8 para os adapters Solid em produção:

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

## Asset Pipeline e Frontend

Padrões do Rails 8: **Propshaft** e **importmap**, portanto nenhum build com Node.js é necessário.

```bash
docker compose exec app bin/importmap pin chart.js         # Fixar um pacote JS
docker compose exec app bin/importmap audit                # Auditoria de vulnerabilidades
docker compose exec app bin/importmap json
```

Se um bundler for necessário (TypeScript, front-end pesado), use `jsbundling-rails` com esbuild ou Vite Ruby e adicione o Node.js à imagem de forma deliberada.

---

## Deploy: Kamal 2 e Thruster

```bash
docker compose exec app bin/kamal setup           # Primeiro deploy
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

O Thruster (no `CMD` padrão) fornece HTTP/2, cache de assets e compressão na frente do Puma. Os segredos ficam em `.kamal/secrets`, nunca em texto claro no `deploy.yml`.

---

## Atalhos de Makefile

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

## Editor e LSP

| Ferramenta | Finalidade |
|------------|------------|
| Ruby LSP (Shopify) | Autocompletar, go-to-definition, integração com RuboCop, add-on do Rails |
| Solargraph | Language server alternativo |
| `ruby-lsp` Docker | Executar dentro de um dev container para gems fiéis ao container |
| EditorConfig | `.editorconfig` com `indent_size = 2` |

Os plugins de Code Intelligence do Claude Code para Ruby substituem várias passagens de grep + leitura por uma única chamada de go-to-definition.

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

O Lefthook (ou Overcommit) instala hooks que espelham as etapas do CI, de modo que as falhas apareçam antes do push.

---

## Solução de Problemas

| Sintoma | Causa | Correção |
|---------|-------|----------|
| `Zeitwerk::NameError` | Nome do arquivo e da constante diferem | Renomear o arquivo ou a constante, executar `zeitwerk:check` |
| `PG::ConnectionBad` | Banco de dados não está pronto | Usar `depends_on` do compose com healthcheck |
| Gems desatualizadas após o pull | Cache da imagem ou do volume | `docker compose exec app bundle install` ou rebuild |
| `ActiveRecord::PendingMigrationError` | Migrations ausentes | `bin/rails db:migrate` |
| `Missing secret_key_base` | Sem chave de credentials | Definir `RAILS_MASTER_KEY` ou `SECRET_KEY_BASE` |
| Assets não encontrados em produção | Não foram precompilados | `bin/rails assets:precompile` na etapa de build |
| Testes travam nos system specs | Sem navegador na imagem | Adicionar o Chromium à imagem de teste ou usar um serviço Selenium |

---

## Checklist de Ferramentas

- [ ] `.ruby-version` fixado e alinhado com o Dockerfile
- [ ] `Gemfile.lock` commitado; grupos corretos
- [ ] Todo comando documentado com o prefixo `docker compose exec app`
- [ ] `bin/ci` / `config/ci.rb` definidos e verdes
- [ ] RuboCop, Brakeman e bundler-audit rodam no CI
- [ ] Chave de credentials nunca commitada
- [ ] Segredos do Kamal fora do controle de versão
