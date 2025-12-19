# Docker & Hadolint - Atoll Tourisme

## Überblick

Die Verwendung von **Docker ist OBLIGATORISCH** für das gesamte Atoll Tourisme Projekt. Kein Befehl darf direkt auf dem lokalen Rechner ausgeführt werden.

> **Globale Benutzerhinweise (CLAUDE.md):**
> - IMMER Docker für Befehle verwenden, um von der lokalen Umgebung zu abstrahieren
> - Keine Dateien in /tmp speichern

> **Referenzen:**
> - `01-symfony-best-practices.md` - Symfony Standards
> - `08-quality-tools.md` - Qualitätsvalidierung
> - `07-testing-tdd-bdd.md` - Tests mit Docker

---

## Inhaltsverzeichnis

1. [Obligatorische Docker-Regeln](#obligatorische-docker-regeln)
2. [Docker-Struktur](#docker-struktur)
3. [Obligatorisches Makefile](#obligatorisches-makefile)
4. [Hadolint-Konfiguration](#hadolint-konfiguration)
5. [Dockerfile Best Practices](#dockerfile-best-practices)
6. [Docker Compose](#docker-compose)
7. [Validierungs-Checkliste](#validierungs-checkliste)

---

## Obligatorische Docker-Regeln

### 1. ALLES läuft über Docker

```bash
# ❌ VERBOTEN: Direkte Befehle
php bin/console cache:clear
composer install
npm run dev

# ✅ OBLIGATORISCH: Über Docker
make console CMD="cache:clear"
make composer-install
make npm-dev
```

### 2. ALLES läuft über Makefile

```bash
# ❌ VERBOTEN: docker-compose direkt
docker-compose exec php bin/console cache:clear

# ✅ OBLIGATORISCH: Über Makefile
make console CMD="cache:clear"
```

### 3. Keine lokalen Dateien in /tmp

```bash
# ❌ VERBOTEN
docker-compose exec php php -r "file_put_contents('/tmp/export.csv', 'data');"

# ✅ OBLIGATORISCH: Gemountete Volumes
docker-compose exec php php -r "file_put_contents('/app/var/export.csv', 'data');"
```

---

## Docker-Struktur

```
atoll-symfony/
├── Dockerfile                      # Produktion
├── Dockerfile.dev                  # Entwicklung
├── docker-compose.yml              # Services
├── compose.override.yaml           # Lokale Overrides
├── Makefile                        # Obligatorische Befehle
├── .hadolint.yaml                  # Hadolint-Konfiguration
└── docker/
    ├── nginx/
    │   └── nginx.conf
    ├── php/
    │   ├── php.ini
    │   ├── php-fpm.conf
    │   └── www.conf
    └── postgres/
        └── init.sql
```

---

## Obligatorisches Makefile

### Vollständiges Makefile

```makefile
# Makefile - Atoll Tourisme
# Alle Befehle MÜSSEN über dieses Makefile laufen

.DEFAULT_GOAL := help
.PHONY: help

# Farben für Hilfe
CYAN := \033[36m
RESET := \033[0m

##
## 🚀 HAUPTBEFEHLE
##

help: ## Zeigt Hilfe an
	@grep -E '(^[a-zA-Z_-]+:.*?##.*$$)|(^##)' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[32m%-30s\033[0m %s\n", $$1, $$2}' | sed -e 's/\[32m##/[33m/'

##
## 🐳 DOCKER
##

build: ## Baut Docker-Images
	docker-compose build --pull

up: ## Startet Container
	docker-compose up -d

down: ## Stoppt Container
	docker-compose down

restart: down up ## Startet Container neu

ps: ## Listet Container auf
	docker-compose ps

logs: ## Zeigt Logs an
	docker-compose logs -f

logs-php: ## Nur PHP-Logs
	docker-compose logs -f php

logs-nginx: ## Nur Nginx-Logs
	docker-compose logs -f nginx

shell: ## Shell im PHP-Container
	docker-compose exec php sh

shell-root: ## Root-Shell im PHP-Container
	docker-compose exec -u root php sh

##
## 📦 COMPOSER
##

composer-install: ## Installiert Composer-Abhängigkeiten
	docker-compose exec php composer install

composer-update: ## Aktualisiert Composer-Abhängigkeiten
	docker-compose exec php composer update

composer-require: ## Installiert ein Paket (Verwendung: make composer-require PKG=vendor/package)
	docker-compose exec php composer require $(PKG)

composer-require-dev: ## Installiert ein Dev-Paket
	docker-compose exec php composer require --dev $(PKG)

##
## 📦 NPM
##

npm-install: ## Installiert NPM-Abhängigkeiten
	docker-compose exec php npm install

npm-dev: ## Kompiliert Assets (dev)
	docker-compose exec php npm run dev

npm-watch: ## Überwacht Assets
	docker-compose exec php npm run watch

npm-build: ## Kompiliert Assets (prod)
	docker-compose exec php npm run build

##
## 🎯 SYMFONY
##

console: ## Führt Symfony-Befehl aus (Verwendung: make console CMD="cache:clear")
	docker-compose exec php bin/console $(CMD)

cc: ## Clear cache
	docker-compose exec php bin/console cache:clear

cache-warmup: ## Warmup cache
	docker-compose exec php bin/console cache:warmup

fixtures: ## Lädt Fixtures
	docker-compose exec php bin/console doctrine:fixtures:load --no-interaction

migration-diff: ## Generiert Migration
	docker-compose exec php bin/console doctrine:migrations:diff

migration-migrate: ## Führt Migrationen aus
	docker-compose exec php bin/console doctrine:migrations:migrate --no-interaction

migration-rollback: ## Rollback letzte Migration
	docker-compose exec php bin/console doctrine:migrations:migrate prev --no-interaction

##
## 🧪 TESTS
##

test: ## Führt alle Tests aus
	docker-compose exec php vendor/bin/phpunit

test-unit: ## Nur Unit-Tests
	docker-compose exec php vendor/bin/phpunit --testsuite=unit

test-integration: ## Integrationstests
	docker-compose exec php vendor/bin/phpunit --testsuite=integration

test-functional: ## Funktionstests
	docker-compose exec php vendor/bin/phpunit --testsuite=functional

test-coverage: ## Generiert Coverage
	docker-compose exec php vendor/bin/phpunit --coverage-html var/coverage

behat: ## Führt Behat-Tests aus
	docker-compose exec php vendor/bin/behat

infection: ## Mutation Testing
	docker-compose exec php vendor/bin/infection --min-msi=80 --min-covered-msi=90

##
## 🔍 QUALITÄT
##

phpstan: ## PHPStan-Analyse
	docker-compose exec php vendor/bin/phpstan analyse

phpstan-baseline: ## Generiert PHPStan-Baseline
	docker-compose exec php vendor/bin/phpstan analyse --generate-baseline

cs-fixer-dry: ## Prüft Code-Style (dry-run)
	docker-compose exec php vendor/bin/php-cs-fixer fix --dry-run --diff

cs-fixer: ## Behebt Code-Style
	docker-compose exec php vendor/bin/php-cs-fixer fix

rector-dry: ## Prüft Rector (dry-run)
	docker-compose exec php vendor/bin/rector process --dry-run

rector: ## Wendet Rector an
	docker-compose exec php vendor/bin/rector process

deptrac: ## Analysiert Architektur
	docker-compose exec php vendor/bin/deptrac analyze

phpcpd: ## Erkennt Code-Duplizierung
	docker-compose exec php vendor/bin/phpcpd src/

phpmetrics: ## Generiert Metriken
	docker-compose exec php vendor/bin/phpmetrics --report-html=var/phpmetrics src/

hadolint: ## Validiert Dockerfiles
	docker run --rm -i hadolint/hadolint < Dockerfile
	docker run --rm -i hadolint/hadolint < Dockerfile.dev

quality: phpstan cs-fixer-dry rector-dry deptrac phpcpd ## Führt alle Qualitätsprüfungen aus
	@echo "✅ All quality checks passed"

quality-fix: cs-fixer rector ## Wendet automatische Korrekturen an
	@echo "✅ Code automatically fixed"

##
## 🗄️ DATABASE
##

db-create: ## Erstellt Datenbank
	docker-compose exec php bin/console doctrine:database:create --if-not-exists

db-drop: ## Löscht Datenbank
	docker-compose exec php bin/console doctrine:database:drop --force --if-exists

db-reset: db-drop db-create migration-migrate fixtures ## Vollständiges DB-Reset
	@echo "✅ Database reset complete"

db-validate: ## Validiert Doctrine-Mapping
	docker-compose exec php bin/console doctrine:schema:validate

##
## 🔒 SICHERHEIT
##

security-check: ## Prüft Sicherheitslücken
	docker-compose exec php composer audit

##
## 🧹 BEREINIGUNG
##

clean: ## Bereinigt generierte Dateien
	docker-compose exec php rm -rf var/cache/* var/log/*

clean-all: clean ## Vollständige Bereinigung
	docker-compose exec php rm -rf vendor/ node_modules/
	docker-compose down -v

##
## 🚀 CI/CD
##

ci: build up composer-install npm-install db-reset quality test ## Vollständige CI-Pipeline
	@echo "✅ CI pipeline complete"

ci-fast: quality test ## Schnelle CI-Pipeline (ohne Setup)
	@echo "✅ Fast CI pipeline complete"

##
## 📊 MONITORING
##

stats: ## Projektstatistiken
	@echo "$(CYAN)Codezeilen:$(RESET)"
	@docker-compose exec php find src -name '*.php' | xargs wc -l | tail -1
	@echo "$(CYAN)Anzahl Tests:$(RESET)"
	@docker-compose exec php find tests -name '*Test.php' | wc -l
	@echo "$(CYAN)Aktuelle Coverage:$(RESET)"
	@docker-compose exec php vendor/bin/phpunit --coverage-text | grep "Lines:"
```

### Makefile-Verwendung

```bash
# Projektstart
make build
make up
make composer-install
make npm-install
make db-reset

# Tägliche Entwicklung
make console CMD="make:entity Participant"
make migration-diff
make migration-migrate
make test

# Code-Qualität
make quality
make quality-fix

# CI
make ci
```

---

## Hadolint-Konfiguration

### .hadolint.yaml

```yaml
# .hadolint.yaml - Hadolint-Konfiguration für Atoll Tourisme

# Bestimmte Regeln bei Bedarf ignorieren
ignored:
  # DL3008: Pin versions apt packages - OK in dev
  # - DL3008

# Strikte Regeln
failure-threshold: warning

# Vertrauenswürdige Registries
trustedRegistries:
  - docker.io
  - ghcr.io

# Obligatorische Labels
label-schema:
  author: required
  version: required
  description: required
```

### Hadolint-Validierung

```bash
# Über Makefile (OBLIGATORISCH)
make hadolint

# Direkt (nur für Debug)
docker run --rm -i hadolint/hadolint < Dockerfile
```

---

## Dockerfile Best Practices

### Dockerfile (Produktion)

```dockerfile
# Dockerfile - Produktion - Atoll Tourisme
# Validiert von Hadolint

# Obligatorische Metadaten
# hadolint ignore=DL3006
FROM php:8.2-fpm-alpine AS base

LABEL author="The Bearded CTO"
LABEL version="1.0.0"
LABEL description="Atoll Tourisme - Symfony 6.4 Application"

# ✅ Hadolint Best Practices
# 1. Spezifische Version verwenden
# 2. RUN-Befehle kombinieren
# 3. APK-Cache bereinigen
# 4. Non-root User

# System-Abhängigkeiten installieren
RUN apk add --no-cache \
        postgresql-dev \
        icu-dev \
        libzip-dev \
        oniguruma-dev \
        git \
        unzip \
    && apk add --no-cache --virtual .build-deps \
        $PHPIZE_DEPS \
    # PHP-Extensions
    && docker-php-ext-install \
        pdo_pgsql \
        intl \
        zip \
        opcache \
    # Redis
    && pecl install redis-6.0.2 \
    && docker-php-ext-enable redis \
    # Bereinigung
    && apk del .build-deps \
    && rm -rf /tmp/pear

# PHP-Konfiguration (Produktion)
COPY docker/php/php.ini /usr/local/etc/php/conf.d/custom.ini
COPY docker/php/php-fpm.conf /usr/local/etc/php-fpm.d/zz-custom.conf

# Composer (feste Version)
COPY --from=composer:2.7 /usr/bin/composer /usr/bin/composer

# Workdir
WORKDIR /app

# Non-root User
RUN addgroup -g 1000 appgroup \
    && adduser -D -u 1000 -G appgroup appuser \
    && chown -R appuser:appgroup /app

USER appuser

# Dateien kopieren
COPY --chown=appuser:appgroup composer.json composer.lock symfony.lock ./
RUN composer install --no-dev --no-scripts --no-autoloader --prefer-dist

COPY --chown=appuser:appgroup . .

# Composer-Optimierungen für Produktion
RUN composer dump-autoload --optimize --classmap-authoritative \
    && composer check-platform-reqs

# Healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
    CMD php-fpm -t || exit 1

EXPOSE 9000

CMD ["php-fpm"]
```

### Dockerfile.dev (Entwicklung)

```dockerfile
# Dockerfile.dev - Entwicklung - Atoll Tourisme

FROM php:8.2-fpm-alpine

LABEL author="The Bearded CTO"
LABEL version="1.0.0-dev"
LABEL description="Atoll Tourisme - Dev Environment"

# Abhängigkeiten + Dev-Tools installieren
RUN apk add --no-cache \
        postgresql-dev \
        icu-dev \
        libzip-dev \
        oniguruma-dev \
        git \
        unzip \
        npm \
        nodejs \
    && apk add --no-cache --virtual .build-deps \
        $PHPIZE_DEPS \
        linux-headers \
    # PHP-Extensions
    && docker-php-ext-install \
        pdo_pgsql \
        intl \
        zip \
        opcache \
    # Redis
    && pecl install redis-6.0.2 \
    && docker-php-ext-enable redis \
    # Xdebug (nur dev)
    && pecl install xdebug-3.3.1 \
    && docker-php-ext-enable xdebug \
    # Bereinigung
    && apk del .build-deps \
    && rm -rf /tmp/pear

# PHP-Konfiguration dev
COPY docker/php/php.ini /usr/local/etc/php/conf.d/custom.ini
COPY docker/php/xdebug.ini /usr/local/etc/php/conf.d/xdebug.ini

# Composer
COPY --from=composer:2.7 /usr/bin/composer /usr/bin/composer

WORKDIR /app

# Non-root User
RUN addgroup -g 1000 appgroup \
    && adduser -D -u 1000 -G appgroup appuser \
    && chown -R appuser:appgroup /app

USER appuser

# Kein COPY in dev (Volume gemountet)

EXPOSE 9000

CMD ["php-fpm"]
```

### Angewendete Hadolint-Regeln

| Regel | Beschreibung | Anwendung |
|-------|-------------|-----------|
| **DL3006** | Always tag image version | `php:8.2-fpm-alpine` |
| **DL3008** | Pin apt/apk packages | Versionierte PHP-Extensions |
| **DL3009** | Delete apt cache | `rm -rf /tmp/pear` |
| **DL3013** | Pin pip versions | N/A (kein Python) |
| **DL3018** | Pin apk packages | `redis-6.0.2`, `xdebug-3.3.1` |
| **DL3020** | Use COPY not ADD | `COPY` überall verwendet |
| **DL3025** | Use CMD/ENTRYPOINT array | `CMD ["php-fpm"]` |
| **DL4006** | Set SHELL option | Alpine verwendet sh |
| **SC2046** | Quote to prevent splitting | Quotes auf Variablen |

---

## Docker Compose

### docker-compose.yml (Production-ready)

```yaml
version: '3.8'

services:
  # PHP-FPM
  php:
    build:
      context: .
      dockerfile: Dockerfile.dev
      target: base
    container_name: atoll_php
    restart: unless-stopped
    volumes:
      - ./:/app:cached
      - php_var:/app/var
    environment:
      APP_ENV: dev
      DATABASE_URL: postgresql://atoll:atoll@postgres:5432/atoll?serverVersion=16&charset=utf8
      REDIS_URL: redis://redis:6379
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    networks:
      - atoll_network
    healthcheck:
      test: ["CMD", "php-fpm", "-t"]
      interval: 30s
      timeout: 3s
      retries: 3
      start_period: 40s

  # Nginx
  nginx:
    image: nginx:1.25-alpine
    container_name: atoll_nginx
    restart: unless-stopped
    ports:
      - "8080:80"
    volumes:
      - ./public:/app/public:ro
      - ./docker/nginx/nginx.conf:/etc/nginx/conf.d/default.conf:ro
    depends_on:
      php:
        condition: service_healthy
    networks:
      - atoll_network
    healthcheck:
      test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost/health"]
      interval: 30s
      timeout: 3s
      retries: 3

  # PostgreSQL
  postgres:
    image: postgres:16-alpine
    container_name: atoll_postgres
    restart: unless-stopped
    ports:
      - "5432:5432"
    environment:
      POSTGRES_DB: atoll
      POSTGRES_USER: atoll
      POSTGRES_PASSWORD: atoll
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./docker/postgres/init.sql:/docker-entrypoint-initdb.d/init.sql:ro
    networks:
      - atoll_network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U atoll"]
      interval: 10s
      timeout: 5s
      retries: 5

  # Redis
  redis:
    image: redis:7-alpine
    container_name: atoll_redis
    restart: unless-stopped
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    networks:
      - atoll_network
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 3s
      retries: 5
    command: redis-server --appendonly yes

  # MailHog (nur dev)
  mailhog:
    image: mailhog/mailhog:v1.0.1
    container_name: atoll_mailhog
    restart: unless-stopped
    ports:
      - "8025:8025"  # Web UI
      - "1025:1025"  # SMTP
    networks:
      - atoll_network

volumes:
  postgres_data:
    driver: local
  redis_data:
    driver: local
  php_var:
    driver: local

networks:
  atoll_network:
    driver: bridge
```

### compose.override.yaml (Lokal)

```yaml
version: '3.8'

# Lokale Overrides (gitignored)
services:
  php:
    environment:
      # Xdebug
      XDEBUG_MODE: debug
      XDEBUG_CLIENT_HOST: host.docker.internal
      XDEBUG_CLIENT_PORT: 9003

  nginx:
    # Angepasste Ports
    ports:
      - "80:80"
```

---

## Validierungs-Checkliste

### Vor jedem Commit

- [ ] **Makefile:** Alle Befehle laufen über `make`
- [ ] **Hadolint:** `make hadolint` läuft ohne Fehler
- [ ] **Docker:** Keine direkten Befehle (php, composer, npm)
- [ ] **Volumes:** Keine Dateien in `/tmp`
- [ ] **Images:** Feste Versionen (nicht `latest`)
- [ ] **User:** Non-root Container
- [ ] **Healthchecks:** Für alle Services konfiguriert
- [ ] **Networks:** Services in einem Network isoliert

### Hadolint-Validierung

```bash
# ✅ Muss bestehen
make hadolint

# Erwartete Ausgabe:
# Validating Dockerfile...
# ✅ No issues found
# Validating Dockerfile.dev...
# ✅ No issues found
```

### Docker-Tests

```bash
# Build und Start
make build
make up

# Service-Überprüfung
make ps

# Sollte anzeigen:
#       Name                     State          Ports
# atoll_php         Up (healthy)   9000/tcp
# atoll_nginx       Up (healthy)   0.0.0.0:8080->80/tcp
# atoll_postgres    Up (healthy)   0.0.0.0:5432->5432/tcp
# atoll_redis       Up (healthy)   0.0.0.0:6379->6379/tcp
```

---

## Verbotene Befehle

```bash
# ❌ VERBOTEN (NIEMALS VERWENDEN)
php bin/console cache:clear
composer install
npm run dev
./vendor/bin/phpunit
psql -U atoll

# ✅ OBLIGATORISCH (IMMER VERWENDEN)
make console CMD="cache:clear"
make composer-install
make npm-dev
make test
make shell  # dann psql
```

---

## Ressourcen

- **Dokumentation:** [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)
- **Hadolint:** [GitHub](https://github.com/hadolint/hadolint)
- **Composer Docker:** [Official Image](https://hub.docker.com/_/composer)
- **PHP Docker:** [Official Image](https://hub.docker.com/_/php)

---

**Datum der letzten Aktualisierung:** 2025-01-26
**Version:** 1.0.0
**Autor:** The Bearded CTO
