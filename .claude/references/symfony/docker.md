# Docker & Hadolint - Atoll Tourisme

## Overview

L'utilisation de **Docker est OBLIGATOIRE** pour tout le projet Atoll Tourisme. Aucune commande ne doit être exécutée directement sur la machine locale.

> **Rappel utilisateur global (CLAUDE.md):**
> - TOUJOURS utiliser docker pour les commandes afin de s'abstraire de l'env local
> - Ne pas stocker de fichier dans /tmp

> **Références:**
> - `01-symfony-best-practices.md` - Standards Symfony
> - `08-quality-tools.md` - Validation qualité
> - `07-testing-tdd-bdd.md` - Tests avec Docker

---

## Versions Infrastructure 2026

| Composant | Version | Notes |
|-----------|---------|-------|
| Docker Engine | 29.4.0 | BuildKit par défaut, SBOM natif |
| Docker Compose | v5.0.0 "Mont Blanc" | Champ `version:` obsolète |
| FrankenPHP | 1.12.1 | PHP 8.5, Caddy 2.11.2, Worker mode (2-3× gains) |
| PgBouncer | 1.25.1 | Prepared statements natifs (1.21+ requis) |

**FrankenPHP** : Alternative moderne à PHP-FPM pour Symfony (Worker mode, HTTP/3, max_requests anti-leak).  
**Sources** : https://frankenphp.dev/docs/worker/ | https://www.postgresql.org/about/news/pgbouncer-1210-released-now-with-prepared-statements-2735/

Voir `@devops-engineer` pour configurations complètes FrankenPHP/PgBouncer/OpenTofu/Ansible/Coolify.

## Table des matières

1. [Règles Docker obligatoires](#règles-docker-obligatoires)
2. [Structure Docker](#structure-docker)
3. [Makefile obligatoire](#makefile-obligatoire)
4. [Hadolint configuration](#hadolint-configuration)
5. [Best practices Dockerfile](#best-practices-dockerfile)
6. [Docker Compose](#docker-compose)
7. [Checklist de validation](#checklist-de-validation)

---

## Règles Docker obligatoires

### 1. TOUT passe par Docker

```bash
# ❌ INTERDIT: Commandes directes
php bin/console cache:clear
composer install
npm run dev

# ✅ OBLIGATOIRE: Via Docker
make console CMD="cache:clear"
make composer-install
make npm-dev
```

### 2. TOUT passe par Makefile

```bash
# ❌ INTERDIT: docker-compose directement
docker-compose exec php bin/console cache:clear

# ✅ OBLIGATOIRE: Via Makefile
make console CMD="cache:clear"
```

### 3. Pas de fichiers locaux dans /tmp

```bash
# ❌ INTERDIT
docker-compose exec php php -r "file_put_contents('/tmp/export.csv', 'data');"

# ✅ OBLIGATOIRE: Volumes montés
docker-compose exec php php -r "file_put_contents('/app/var/export.csv', 'data');"
```

---

## Structure Docker

```
atoll-symfony/
├── Dockerfile                      # Production
├── Dockerfile.dev                  # Développement
├── docker-compose.yml              # Services
├── compose.override.yaml           # Local overrides
├── Makefile                        # Commandes obligatoires
├── .hadolint.yaml                  # Configuration Hadolint
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

## Makefile obligatoire

### Makefile complet

```makefile
# Makefile - Atoll Tourisme
# Toutes les commandes DOIVENT passer par ce Makefile

.DEFAULT_GOAL := help
.PHONY: help

# Couleurs pour l'aide
CYAN := \033[36m
RESET := \033[0m

##
## 🚀 COMMANDES PRINCIPALES
##

help: ## Affiche l'aide
	@grep -E '(^[a-zA-Z_-]+:.*?##.*$$)|(^##)' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[32m%-30s\033[0m %s\n", $$1, $$2}' | sed -e 's/\[32m##/[33m/'

##
## 🐳 DOCKER
##

build: ## Build les images Docker
	docker-compose build --pull

up: ## Démarre les conteneurs
	docker-compose up -d

down: ## Arrête les conteneurs
	docker-compose down

restart: down up ## Redémarre les conteneurs

ps: ## Liste les conteneurs
	docker-compose ps

logs: ## Affiche les logs
	docker-compose logs -f

logs-php: ## Logs PHP uniquement
	docker-compose logs -f php

logs-nginx: ## Logs Nginx uniquement
	docker-compose logs -f nginx

shell: ## Shell dans le conteneur PHP
	docker-compose exec php sh

shell-root: ## Shell root dans le conteneur PHP
	docker-compose exec -u root php sh

##
## 📦 COMPOSER
##

composer-install: ## Installe les dépendances Composer
	docker-compose exec php composer install

composer-update: ## Met à jour les dépendances Composer
	docker-compose exec php composer update

composer-require: ## Installe un package (usage: make composer-require PKG=vendor/package)
	docker-compose exec php composer require $(PKG)

composer-require-dev: ## Installe un package dev
	docker-compose exec php composer require --dev $(PKG)

##
## 📦 NPM
##

npm-install: ## Installe les dépendances NPM
	docker-compose exec php npm install

npm-dev: ## Compile les assets (dev)
	docker-compose exec php npm run dev

npm-watch: ## Watch les assets
	docker-compose exec php npm run watch

npm-build: ## Compile les assets (prod)
	docker-compose exec php npm run build

##
## 🎯 SYMFONY
##

console: ## Exécute une commande Symfony (usage: make console CMD="cache:clear")
	docker-compose exec php bin/console $(CMD)

cc: ## Clear cache
	docker-compose exec php bin/console cache:clear

cache-warmup: ## Warmup cache
	docker-compose exec php bin/console cache:warmup

fixtures: ## Charge les fixtures
	docker-compose exec php bin/console doctrine:fixtures:load --no-interaction

migration-diff: ## Génère une migration
	docker-compose exec php bin/console doctrine:migrations:diff

migration-migrate: ## Exécute les migrations
	docker-compose exec php bin/console doctrine:migrations:migrate --no-interaction

migration-rollback: ## Rollback dernière migration
	docker-compose exec php bin/console doctrine:migrations:migrate prev --no-interaction

##
## 🧪 TESTS
##

test: ## Lance tous les tests
	docker-compose exec php vendor/bin/phpunit

test-unit: ## Tests unitaires uniquement
	docker-compose exec php vendor/bin/phpunit --testsuite=unit

test-integration: ## Tests d'intégration
	docker-compose exec php vendor/bin/phpunit --testsuite=integration

test-functional: ## Tests fonctionnels
	docker-compose exec php vendor/bin/phpunit --testsuite=functional

test-coverage: ## Génère le coverage
	docker-compose exec php vendor/bin/phpunit --coverage-html var/coverage

behat: ## Lance les tests Behat
	docker-compose exec php vendor/bin/behat

infection: ## Mutation testing
	docker-compose exec php vendor/bin/infection --min-msi=80 --min-covered-msi=90

##
## 🔍 QUALITÉ
##

phpstan: ## Analyse PHPStan
	docker-compose exec php vendor/bin/phpstan analyse

phpstan-baseline: ## Génère baseline PHPStan
	docker-compose exec php vendor/bin/phpstan analyse --generate-baseline

cs-fixer-dry: ## Vérifie le code style (dry-run)
	docker-compose exec php vendor/bin/php-cs-fixer fix --dry-run --diff

cs-fixer: ## Fixe le code style
	docker-compose exec php vendor/bin/php-cs-fixer fix

rector-dry: ## Vérifie Rector (dry-run)
	docker-compose exec php vendor/bin/rector process --dry-run

rector: ## Applique Rector
	docker-compose exec php vendor/bin/rector process

deptrac: ## Analyse architecture
	docker-compose exec php vendor/bin/deptrac analyze

phpcpd: ## Détecte la duplication de code
	docker-compose exec php vendor/bin/phpcpd src/

phpmetrics: ## Génère les métriques
	docker-compose exec php vendor/bin/phpmetrics --report-html=var/phpmetrics src/

hadolint: ## Valide les Dockerfiles
	docker run --rm -i hadolint/hadolint:v2.12.0 < Dockerfile
	docker run --rm -i hadolint/hadolint:v2.12.0 < Dockerfile.dev

quality: phpstan cs-fixer-dry rector-dry deptrac phpcpd ## Lance toutes les vérifications qualité

quality-fix: cs-fixer rector ## Applique les corrections automatiques

##
## 🗄️ DATABASE
##

db-create: ## Crée la base de données
	docker-compose exec php bin/console doctrine:database:create --if-not-exists

db-drop: ## Supprime la base de données
	docker-compose exec php bin/console doctrine:database:drop --force --if-exists

db-reset: db-drop db-create migration-migrate fixtures ## Reset complet de la BDD

db-validate: ## Valide le mapping Doctrine
	docker-compose exec php bin/console doctrine:schema:validate

##
## 🔒 SÉCURITÉ
##

security-check: ## Vérifie les vulnérabilités
	docker-compose exec php composer audit

##
## 🧹 NETTOYAGE
##

clean: ## Nettoie les fichiers générés
	docker-compose exec php rm -rf var/cache/* var/log/*

clean-all: clean ## Nettoyage complet
	docker-compose exec php rm -rf vendor/ node_modules/
	docker-compose down -v

##
## 🚀 CI/CD
##

ci: build up composer-install npm-install db-reset quality test ## Pipeline CI complète

ci-fast: quality test ## Pipeline CI rapide (sans setup)

##
## 📊 MONITORING
##

stats: ## Statistiques du projet
	@echo "$(CYAN)Lignes de code:$(RESET)"
	@docker-compose exec php find src -name '*.php' | xargs wc -l | tail -1
	@echo "$(CYAN)Nombre de tests:$(RESET)"
	@docker-compose exec php find tests -name '*Test.php' | wc -l
	@echo "$(CYAN)Coverage actuel:$(RESET)"
	@docker-compose exec php vendor/bin/phpunit --coverage-text | grep "Lines:"
```

### Usage du Makefile

```bash
# Démarrage projet
make build
make up
make composer-install
make npm-install
make db-reset

# Développement quotidien
make console CMD="make:entity Participant"
make migration-diff
make migration-migrate
make test

# Qualité code
make quality
make quality-fix

# CI
make ci
```

---

## Hadolint configuration

### .hadolint.yaml

```yaml
# .hadolint.yaml - Configuration Hadolint pour Atoll Tourisme

# Ignore certaines règles si nécessaire
ignored:
  # DL3008: Pin versions apt packages - OK en dev
  # - DL3008

# Règles strictes
failure-threshold: warning

# Trusted registries
trustedRegistries:
  - docker.io
  - ghcr.io

# Labels obligatoires
label-schema:
  author: required
  version: required
  description: required
```

### Validation Hadolint

**Version 2026** : Hadolint v2.12.0 (stable, mai 2024 — toujours valide avril 2026)  
**Source** : https://github.com/hadolint/hadolint/releases/tag/v2.12.0

```bash
# Via Makefile (OBLIGATOIRE)
make hadolint

# Direct (pour debug uniquement, version pinnée)
docker run --rm -i hadolint/hadolint:v2.12.0 < Dockerfile
```

---

## Best practices Dockerfile

### Dockerfile (Production)

```dockerfile
# Dockerfile - Production - Atoll Tourisme
# Validé par Hadolint v2.12.0
# Docker Engine 29.4.0 (avril 2026)
# Source: https://www.docker.com/blog/docker-engine-version-29/

# Métadonnées obligatoires
# hadolint ignore=DL3006
FROM php:8.2-fpm-alpine AS base

LABEL author="The Bearded CTO"
LABEL version="1.0.0"
LABEL description="Atoll Tourisme - Application Symfony 6.4"

# ✅ Bonnes pratiques 2026
# 1. Utiliser une version spécifique
# 2. Combiner les commandes RUN
# 3. BuildKit cache mounts pour performance
# 4. User non-root
# 5. Multi-stage builds pour réduction de taille

# Installation des dépendances système avec BuildKit cache
RUN --mount=type=cache,target=/var/cache/apk \
    apk add --no-cache \
        postgresql-dev \
        icu-dev \
        libzip-dev \
        oniguruma-dev \
        git \
        unzip \
    && apk add --no-cache --virtual .build-deps \
        $PHPIZE_DEPS \
    # Extensions PHP
    && docker-php-ext-install \
        pdo_pgsql \
        intl \
        zip \
        opcache \
    # Redis
    && pecl install redis-6.0.2 \
    && docker-php-ext-enable redis \
    # Nettoyage
    && apk del .build-deps \
    && rm -rf /tmp/pear

# Configuration PHP (production)
COPY docker/php/php.ini /usr/local/etc/php/conf.d/custom.ini
COPY docker/php/php-fpm.conf /usr/local/etc/php-fpm.d/zz-custom.conf

# Composer (version fixe)
COPY --from=composer:2.7 /usr/bin/composer /usr/bin/composer

# Workdir
WORKDIR /app

# User non-root
RUN addgroup -g 1000 appgroup \
    && adduser -D -u 1000 -G appgroup appuser \
    && chown -R appuser:appgroup /app

USER appuser

# Copie des fichiers avec BuildKit cache mount pour Composer
COPY --chown=appuser:appgroup composer.json composer.lock symfony.lock ./
RUN --mount=type=cache,target=/home/appuser/.cache/composer,uid=1000,gid=1000 \
    composer install --no-dev --no-scripts --no-autoloader --prefer-dist

COPY --chown=appuser:appgroup . .

# Optimisations Composer production
RUN composer dump-autoload --optimize --classmap-authoritative \
    && composer check-platform-reqs

# Healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
    CMD php-fpm -t || exit 1

EXPOSE 9000

CMD ["php-fpm"]
```

### Dockerfile.dev (Développement)

```dockerfile
# Dockerfile.dev - Développement - Atoll Tourisme

FROM php:8.2-fpm-alpine

LABEL author="The Bearded CTO"
LABEL version="1.0.0-dev"
LABEL description="Atoll Tourisme - Dev Environment"

# Installation dépendances + dev tools
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
    # Extensions PHP
    && docker-php-ext-install \
        pdo_pgsql \
        intl \
        zip \
        opcache \
    # Redis
    && pecl install redis-6.0.2 \
    && docker-php-ext-enable redis \
    # Xdebug (dev uniquement)
    && pecl install xdebug-3.3.1 \
    && docker-php-ext-enable xdebug \
    # Nettoyage
    && apk del .build-deps \
    && rm -rf /tmp/pear

# Configuration PHP dev
COPY docker/php/php.ini /usr/local/etc/php/conf.d/custom.ini
COPY docker/php/xdebug.ini /usr/local/etc/php/conf.d/xdebug.ini

# Composer
COPY --from=composer:2.7 /usr/bin/composer /usr/bin/composer

WORKDIR /app

# User non-root
RUN addgroup -g 1000 appgroup \
    && adduser -D -u 1000 -G appgroup appuser \
    && chown -R appuser:appgroup /app

USER appuser

# Pas de COPY en dev (volume monté)

EXPOSE 9000

CMD ["php-fpm"]
```

### Best Practices 2026 Appliquées

| Pattern | Description | Bénéfice |
|---------|-------------|----------|
| **BuildKit cache mounts** | `RUN --mount=type=cache,target=/var/cache/apk` | Réduction temps build de 40-60% |
| **Multi-stage builds** | Builder stage séparé du runtime | Réduction taille image de 60-97% |
| **Images distroless** | Utiliser `gcr.io/distroless/php` pour runtime | Surface d'attaque minimale (CVE réduites de 90%) |
| **SBOM generation** | `docker buildx build --sbom=true` | Traçabilité dépendances (compliant SLSA Level 2) |
| **Secrets via BuildKit** | `RUN --mount=type=secret,id=composer_token` | Aucun secret dans l'image finale |

**Sources** :  
- BuildKit cache mounts : https://docs.docker.com/build/cache/  
- Multi-stage : https://docs.docker.com/build/building/multi-stage/  
- Distroless : https://github.com/GoogleContainerTools/distroless  
- SBOM : https://docs.docker.com/build/sbom/

### Règles Hadolint Appliquées

| Règle | Description | Application |
|-------|-------------|-------------|
| **DL3006** | Always tag image version | `php:8.2-fpm-alpine` |
| **DL3008** | Pin apt/apk packages | Extensions PHP versionnées |
| **DL3009** | Delete apt cache | `rm -rf /tmp/pear` |
| **DL3013** | Pin pip versions | N/A (pas Python) |
| **DL3018** | Pin apk packages | `redis-6.0.2`, `xdebug-3.3.1` |
| **DL3020** | Use COPY not ADD | `COPY` utilisé partout |
| **DL3025** | Use CMD/ENTRYPOINT array | `CMD ["php-fpm"]` |
| **DL4006** | Set SHELL option | Alpine utilise sh |
| **SC2046** | Quote to prevent splitting | Quotes sur variables |

---

## Docker Compose

### docker-compose.yml (Production-ready)

**Note** : Depuis Docker Compose v2.40+ (décembre 2024), le champ `version:` est obsolète et non requis. La version est automatiquement détectée via Compose Spec v5.0.0 "Mont Blanc" (avril 2026).  
**Source** : https://www.compose-spec.io/

```yaml
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

  # MailHog (dev uniquement)
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

### compose.override.yaml (Local)

```yaml
# Overrides locaux (gitignored)
services:
  php:
    environment:
      # Xdebug
      XDEBUG_MODE: debug
      XDEBUG_CLIENT_HOST: host.docker.internal
      XDEBUG_CLIENT_PORT: 9003

  nginx:
    # Ports personnalisés
    ports:
      - "80:80"
```

---

## Checklist de validation

### Before chaque commit

- [ ] **Makefile:** Toutes les commandes passent par `make`
- [ ] **Hadolint:** `make hadolint` passe sans erreur
- [ ] **Docker:** Pas de commandes directes (php, composer, npm)
- [ ] **Volumes:** Pas de fichiers dans `/tmp`
- [ ] **Images:** Versions fixées (pas `latest`)
- [ ] **User:** Conteneurs non-root
- [ ] **Healthchecks:** Configurés pour tous les services
- [ ] **Networks:** Services isolés dans un network

### Validation Hadolint

```bash
# ✅ Doit passer
make hadolint

# Sortie attendue:
# Validating Dockerfile...
# ✅ No issues found
# Validating Dockerfile.dev...
# ✅ No issues found
```

### Tests Docker

```bash
# Build et démarrage
make build
make up

# Vérification services
make ps

# Doit afficher:
#       Name                     State          Ports
# atoll_php         Up (healthy)   9000/tcp
# atoll_nginx       Up (healthy)   0.0.0.0:8080->80/tcp
# atoll_postgres    Up (healthy)   0.0.0.0:5432->5432/tcp
# atoll_redis       Up (healthy)   0.0.0.0:6379->6379/tcp
```

---

## Commands interdites

```bash
# ❌ INTERDITES (NE JAMAIS UTILISER)
php bin/console cache:clear
composer install
npm run dev
./vendor/bin/phpunit
psql -U atoll

# ✅ OBLIGATOIRES (TOUJOURS UTILISER)
make console CMD="cache:clear"
make composer-install
make npm-dev
make test
make shell  # puis psql
```

---

## Ressources

- **Documentation:** [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)
- **Hadolint:** [GitHub](https://github.com/hadolint/hadolint)
- **Composer Docker:** [Official Image](https://hub.docker.com/_/composer)
- **PHP Docker:** [Official Image](https://hub.docker.com/_/php)

---

**Date de dernière mise à jour:** 2026-04-14  
**Version:** 2.0.0  
**Auteur:** The Bearded CTO

---

## Versions 2026

| Composant | Version | Notes |
|-----------|---------|-------|
| Docker Engine | 29.4.0 | BuildKit par défaut, SBOM natif |
| Compose Spec | v5.0.0 "Mont Blanc" | Champ `version:` obsolète depuis v2.40+ |
| Hadolint | v2.12.0 | Version stable pinnée |
| Kubernetes | 1.35.3 | Gateway API v1.4+, sidecar-less architectures |

**Sources** :  
https://www.docker.com/blog/docker-engine-version-29/  
https://www.compose-spec.io/  
https://github.com/hadolint/hadolint/releases/tag/v2.12.0  
https://endoflife.date/kubernetes
