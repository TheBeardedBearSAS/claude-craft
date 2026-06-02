# Docker & Hadolint - Atoll Tourisme

## Descripción General

El uso de **Docker es OBLIGATORIO** para todo el proyecto Atoll Tourisme. Ningún comando debe ejecutarse directamente en la máquina local.

> **Recordatorio usuario global (CLAUDE.md):**
> - SIEMPRE usar docker para los comandos para abstraerse del entorno local
> - No almacenar archivos en /tmp

> **Referencias:**
> - `01-symfony-best-practices.md` - Estándares Symfony
> - `08-quality-tools.md` - Validación de calidad
> - `07-testing-tdd-bdd.md` - Tests con Docker

---

## Tabla de contenidos

1. [Reglas Docker obligatorias](#reglas-docker-obligatorias)
2. [Estructura Docker](#estructura-docker)
3. [Makefile obligatorio](#makefile-obligatorio)
4. [Configuración Hadolint](#configuración-hadolint)
5. [Best practices Dockerfile](#best-practices-dockerfile)
6. [Docker Compose](#docker-compose)
7. [Checklist de validación](#checklist-de-validación)

---

## Reglas Docker obligatorias

### 1. TODO pasa por Docker

```bash
# ❌ PROHIBIDO: Comandos directos
php bin/console cache:clear
composer install
npm run dev

# ✅ OBLIGATORIO: Vía Docker
make console CMD="cache:clear"
make composer-install
make npm-dev
```

### 2. TODO pasa por Makefile

```bash
# ❌ PROHIBIDO: docker-compose directamente
docker-compose exec php bin/console cache:clear

# ✅ OBLIGATORIO: Vía Makefile
make console CMD="cache:clear"
```

### 3. Sin archivos locales en /tmp

```bash
# ❌ PROHIBIDO
docker-compose exec php php -r "file_put_contents('/tmp/export.csv', 'data');"

# ✅ OBLIGATORIO: Volúmenes montados
docker-compose exec php php -r "file_put_contents('/app/var/export.csv', 'data');"
```

---

## Estructura Docker

```
atoll-symfony/
├── Dockerfile                      # Producción
├── Dockerfile.dev                  # Desarrollo
├── docker-compose.yml              # Servicios
├── compose.override.yaml           # Local overrides
├── Makefile                        # Comandos obligatorios
├── .hadolint.yaml                  # Configuración Hadolint
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

## Makefile obligatorio

### Makefile completo

```makefile
# Makefile - Atoll Tourisme
# Todos los comandos DEBEN pasar por este Makefile

.DEFAULT_GOAL := help
.PHONY: help

# Colores para la ayuda
CYAN := \033[36m
RESET := \033[0m

##
## 🚀 COMANDOS PRINCIPALES
##

help: ## Muestra la ayuda
	@grep -E '(^[a-zA-Z_-]+:.*?##.*$$)|(^##)' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[32m%-30s\033[0m %s\n", $$1, $$2}' | sed -e 's/\[32m##/[33m/'

##
## 🐳 DOCKER
##

build: ## Construye las imágenes Docker
	docker-compose build --pull

up: ## Inicia los contenedores
	docker-compose up -d

down: ## Detiene los contenedores
	docker-compose down

restart: down up ## Reinicia los contenedores

ps: ## Lista los contenedores
	docker-compose ps

logs: ## Muestra los logs
	docker-compose logs -f

logs-php: ## Logs PHP únicamente
	docker-compose logs -f php

logs-nginx: ## Logs Nginx únicamente
	docker-compose logs -f nginx

shell: ## Shell en el contenedor PHP
	docker-compose exec php sh

shell-root: ## Shell root en el contenedor PHP
	docker-compose exec -u root php sh

##
## 📦 COMPOSER
##

composer-install: ## Instala las dependencias Composer
	docker-compose exec php composer install

composer-update: ## Actualiza las dependencias Composer
	docker-compose exec php composer update

composer-require: ## Instala un paquete (uso: make composer-require PKG=vendor/package)
	docker-compose exec php composer require $(PKG)

composer-require-dev: ## Instala un paquete dev
	docker-compose exec php composer require --dev $(PKG)

##
## 📦 NPM
##

npm-install: ## Instala las dependencias NPM
	docker-compose exec php npm install

npm-dev: ## Compila los assets (dev)
	docker-compose exec php npm run dev

npm-watch: ## Watch de los assets
	docker-compose exec php npm run watch

npm-build: ## Compila los assets (prod)
	docker-compose exec php npm run build

##
## 🎯 SYMFONY
##

console: ## Ejecuta un comando Symfony (uso: make console CMD="cache:clear")
	docker-compose exec php bin/console $(CMD)

cc: ## Limpia la caché
	docker-compose exec php bin/console cache:clear

cache-warmup: ## Precalienta la caché
	docker-compose exec php bin/console cache:warmup

fixtures: ## Carga las fixtures
	docker-compose exec php bin/console doctrine:fixtures:load --no-interaction

migration-diff: ## Genera una migración
	docker-compose exec php bin/console doctrine:migrations:diff

migration-migrate: ## Ejecuta las migraciones
	docker-compose exec php bin/console doctrine:migrations:migrate --no-interaction

migration-rollback: ## Rollback de la última migración
	docker-compose exec php bin/console doctrine:migrations:migrate prev --no-interaction

##
## 🧪 TESTS
##

test: ## Lanza todos los tests
	docker-compose exec php vendor/bin/phpunit

test-unit: ## Tests unitarios únicamente
	docker-compose exec php vendor/bin/phpunit --testsuite=unit

test-integration: ## Tests de integración
	docker-compose exec php vendor/bin/phpunit --testsuite=integration

test-functional: ## Tests funcionales
	docker-compose exec php vendor/bin/phpunit --testsuite=functional

test-coverage: ## Genera el coverage
	docker-compose exec php vendor/bin/phpunit --coverage-html var/coverage

behat: ## Lanza los tests Behat
	docker-compose exec php vendor/bin/behat

infection: ## Mutation testing
	docker-compose exec php vendor/bin/infection --min-msi=80 --min-covered-msi=90

##
## 🔍 CALIDAD
##

phpstan: ## Análisis PHPStan
	docker-compose exec php vendor/bin/phpstan analyse

phpstan-baseline: ## Genera baseline PHPStan
	docker-compose exec php vendor/bin/phpstan analyse --generate-baseline

cs-fixer-dry: ## Verifica el estilo de código (dry-run)
	docker-compose exec php vendor/bin/php-cs-fixer fix --dry-run --diff

cs-fixer: ## Corrige el estilo de código
	docker-compose exec php vendor/bin/php-cs-fixer fix

rector-dry: ## Verifica Rector (dry-run)
	docker-compose exec php vendor/bin/rector process --dry-run

rector: ## Aplica Rector
	docker-compose exec php vendor/bin/rector process

deptrac: ## Analiza la arquitectura
	docker-compose exec php vendor/bin/deptrac analyze

phpcpd: ## Detecta la duplicación de código
	docker-compose exec php vendor/bin/phpcpd src/

phpmetrics: ## Genera las métricas
	docker-compose exec php vendor/bin/phpmetrics --report-html=var/phpmetrics src/

hadolint: ## Valida los Dockerfiles
	docker run --rm -i hadolint/hadolint < Dockerfile
	docker run --rm -i hadolint/hadolint < Dockerfile.dev

quality: phpstan cs-fixer-dry rector-dry deptrac phpcpd ## Lanza todas las verificaciones de calidad

quality-fix: cs-fixer rector ## Aplica las correcciones automáticas

##
## 🗄️ BASE DE DATOS
##

db-create: ## Crea la base de datos
	docker-compose exec php bin/console doctrine:database:create --if-not-exists

db-drop: ## Elimina la base de datos
	docker-compose exec php bin/console doctrine:database:drop --force --if-exists

db-reset: db-drop db-create migration-migrate fixtures ## Reset completo de la BD

db-validate: ## Valida el mapping Doctrine
	docker-compose exec php bin/console doctrine:schema:validate

##
## 🔒 SEGURIDAD
##

security-check: ## Verifica las vulnerabilidades
	docker-compose exec php composer audit

##
## 🧹 LIMPIEZA
##

clean: ## Limpia los archivos generados
	docker-compose exec php rm -rf var/cache/* var/log/*

clean-all: clean ## Limpieza completa
	docker-compose exec php rm -rf vendor/ node_modules/
	docker-compose down -v

##
## 🚀 CI/CD
##

ci: build up composer-install npm-install db-reset quality test ## Pipeline CI completa

ci-fast: quality test ## Pipeline CI rápida (sin setup)

##
## 📊 MONITOREO
##

stats: ## Estadísticas del proyecto
	@echo "$(CYAN)Líneas de código:$(RESET)"
	@docker-compose exec php find src -name '*.php' | xargs wc -l | tail -1
	@echo "$(CYAN)Número de tests:$(RESET)"
	@docker-compose exec php find tests -name '*Test.php' | wc -l
	@echo "$(CYAN)Coverage actual:$(RESET)"
	@docker-compose exec php vendor/bin/phpunit --coverage-text | grep "Lines:"
```

### Uso del Makefile

```bash
# Inicio proyecto
make build
make up
make composer-install
make npm-install
make db-reset

# Desarrollo diario
make console CMD="make:entity Participant"
make migration-diff
make migration-migrate
make test

# Calidad código
make quality
make quality-fix

# CI
make ci
```

---

## Configuración Hadolint

### .hadolint.yaml

```yaml
# .hadolint.yaml - Configuración Hadolint para Atoll Tourisme

# Ignorar ciertas reglas si es necesario
ignored:
  # DL3008: Pin versions apt packages - OK en dev
  # - DL3008

# Reglas estrictas
failure-threshold: warning

# Registries de confianza
trustedRegistries:
  - docker.io
  - ghcr.io

# Labels obligatorios
label-schema:
  author: required
  version: required
  description: required
```

### Validación Hadolint

```bash
# Vía Makefile (OBLIGATORIO)
make hadolint

# Directo (solo para debug)
docker run --rm -i hadolint/hadolint < Dockerfile
```

---

## Best practices Dockerfile

### Dockerfile (Producción)

```dockerfile
# Dockerfile - Producción - Atoll Tourisme
# Validado por Hadolint

# Metadatos obligatorios
# hadolint ignore=DL3006
FROM php:8.2-fpm-alpine AS base

LABEL author="The Bearded CTO"
LABEL version="1.0.0"
LABEL description="Atoll Tourisme - Application Symfony 6.4"

# ✅ Buenas prácticas Hadolint
# 1. Usar una versión específica
# 2. Combinar los comandos RUN
# 3. Limpiar la caché APK
# 4. Usuario no-root

# Instalación de dependencias del sistema
RUN apk add --no-cache \
        postgresql-dev \
        icu-dev \
        libzip-dev \
        oniguruma-dev \
        git \
        unzip \
    && apk add --no-cache --virtual .build-deps \
        $PHPIZE_DEPS \
    # Extensiones PHP
    && docker-php-ext-install \
        pdo_pgsql \
        intl \
        zip \
        opcache \
    # Redis
    && pecl install redis-6.0.2 \
    && docker-php-ext-enable redis \
    # Limpieza
    && apk del .build-deps \
    && rm -rf /tmp/pear

# Configuración PHP (producción)
COPY docker/php/php.ini /usr/local/etc/php/conf.d/custom.ini
COPY docker/php/php-fpm.conf /usr/local/etc/php-fpm.d/zz-custom.conf

# Composer (versión fija)
COPY --from=composer:2.7 /usr/bin/composer /usr/bin/composer

# Workdir
WORKDIR /app

# Usuario no-root
RUN addgroup -g 1000 appgroup \
    && adduser -D -u 1000 -G appgroup appuser \
    && chown -R appuser:appgroup /app

USER appuser

# Copia de archivos
COPY --chown=appuser:appgroup composer.json composer.lock symfony.lock ./
RUN composer install --no-dev --no-scripts --no-autoloader --prefer-dist

COPY --chown=appuser:appgroup . .

# Optimizaciones Composer producción
RUN composer dump-autoload --optimize --classmap-authoritative \
    && composer check-platform-reqs

# Healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
    CMD php-fpm -t || exit 1

EXPOSE 9000

CMD ["php-fpm"]
```

### Dockerfile.dev (Desarrollo)

```dockerfile
# Dockerfile.dev - Desarrollo - Atoll Tourisme

FROM php:8.2-fpm-alpine

LABEL author="The Bearded CTO"
LABEL version="1.0.0-dev"
LABEL description="Atoll Tourisme - Dev Environment"

# Instalación dependencias + herramientas dev
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
    # Extensiones PHP
    && docker-php-ext-install \
        pdo_pgsql \
        intl \
        zip \
        opcache \
    # Redis
    && pecl install redis-6.0.2 \
    && docker-php-ext-enable redis \
    # Xdebug (solo dev)
    && pecl install xdebug-3.3.1 \
    && docker-php-ext-enable xdebug \
    # Limpieza
    && apk del .build-deps \
    && rm -rf /tmp/pear

# Configuración PHP dev
COPY docker/php/php.ini /usr/local/etc/php/conf.d/custom.ini
COPY docker/php/xdebug.ini /usr/local/etc/php/conf.d/xdebug.ini

# Composer
COPY --from=composer:2.7 /usr/bin/composer /usr/bin/composer

WORKDIR /app

# Usuario no-root
RUN addgroup -g 1000 appgroup \
    && adduser -D -u 1000 -G appgroup appuser \
    && chown -R appuser:appgroup /app

USER appuser

# Sin COPY en dev (volumen montado)

EXPOSE 9000

CMD ["php-fpm"]
```

### Reglas Hadolint aplicadas

| Regla | Descripción | Aplicación |
|-------|-------------|-------------|
| **DL3006** | Always tag image version | `php:8.2-fpm-alpine` |
| **DL3008** | Pin apt/apk packages | Extensiones PHP versionadas |
| **DL3009** | Delete apt cache | `rm -rf /tmp/pear` |
| **DL3013** | Pin pip versions | N/A (sin Python) |
| **DL3018** | Pin apk packages | `redis-6.0.2`, `xdebug-3.3.1` |
| **DL3020** | Use COPY not ADD | `COPY` usado en todo |
| **DL3025** | Use CMD/ENTRYPOINT array | `CMD ["php-fpm"]` |
| **DL4006** | Set SHELL option | Alpine usa sh |
| **SC2046** | Quote to prevent splitting | Quotes en variables |

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

  # MailHog (solo dev)
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
version: '3.8'

# Overrides locales (gitignored)
services:
  php:
    environment:
      # Xdebug
      XDEBUG_MODE: debug
      XDEBUG_CLIENT_HOST: host.docker.internal
      XDEBUG_CLIENT_PORT: 9003

  nginx:
    # Puertos personalizados
    ports:
      - "80:80"
```

---

## Checklist de validación

### Antes de cada commit

- [ ] **Makefile:** Todos los comandos pasan por `make`
- [ ] **Hadolint:** `make hadolint` pasa sin error
- [ ] **Docker:** Sin comandos directos (php, composer, npm)
- [ ] **Volúmenes:** Sin archivos en `/tmp`
- [ ] **Imágenes:** Versiones fijadas (sin `latest`)
- [ ] **User:** Contenedores non-root
- [ ] **Healthchecks:** Configurados para todos los servicios
- [ ] **Networks:** Servicios aislados en un network

### Validación Hadolint

```bash
# ✅ Debe pasar
make hadolint

# Salida esperada:
# Validating Dockerfile...
# ✅ No issues found
# Validating Dockerfile.dev...
# ✅ No issues found
```

### Tests Docker

```bash
# Build e inicio
make build
make up

# Verificación servicios
make ps

# Debe mostrar:
#       Name                     State          Ports
# atoll_php         Up (healthy)   9000/tcp
# atoll_nginx       Up (healthy)   0.0.0.0:8080->80/tcp
# atoll_postgres    Up (healthy)   0.0.0.0:5432->5432/tcp
# atoll_redis       Up (healthy)   0.0.0.0:6379->6379/tcp
```

---

## Comandos prohibidos

```bash
# ❌ PROHIBIDOS (NUNCA USAR)
php bin/console cache:clear
composer install
npm run dev
./vendor/bin/phpunit
psql -U atoll

# ✅ OBLIGATORIOS (SIEMPRE USAR)
make console CMD="cache:clear"
make composer-install
make npm-dev
make test
make shell  # luego psql
```

---

## Recursos

- **Documentación:** [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)
- **Hadolint:** [GitHub](https://github.com/hadolint/hadolint)
- **Composer Docker:** [Official Image](https://hub.docker.com/_/composer)
- **PHP Docker:** [Official Image](https://hub.docker.com/_/php)

---

**Fecha de última actualización:** 2025-01-26
**Versión:** 1.0.0
**Autor:** The Bearded CTO
