---
description: Configuración CI/CD
argument-hint: [arguments]
---

# Configuración CI/CD

Eres un Ingeniero DevOps experto. Debes configurar un pipeline de CI/CD adaptado a las tecnologías del proyecto, siguiendo las mejores prácticas.

## Argumentos
$ARGUMENTS

Argumentos:
- Plataforma CI (github, gitlab, circleci)
- (Opcional) Tecnologías detectadas automáticamente

Ejemplo: `/common:setup-ci github`

## MISIÓN

### Paso 1: Detectar Tecnologías

Escanear el proyecto para identificar:

```bash
# Archivos de configuración
ls -la composer.json package.json pubspec.yaml pyproject.toml requirements.txt

# Estructura
ls -la src/ lib/ app/ tests/
```

### Paso 2: Generar Pipeline

#### GitHub Actions (.github/workflows/ci.yml)

```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

env:
  # Versiones
  PHP_VERSION: '8.3'
  NODE_VERSION: '20'
  PYTHON_VERSION: '3.12'
  FLUTTER_VERSION: '3.24'

jobs:
  #############################################
  # DETECCIÓN DE CAMBIOS
  #############################################
  changes:
    runs-on: ubuntu-latest
    outputs:
      php: ${{ steps.filter.outputs.php }}
      node: ${{ steps.filter.outputs.node }}
      python: ${{ steps.filter.outputs.python }}
      flutter: ${{ steps.filter.outputs.flutter }}
    steps:
      - uses: actions/checkout@v4
      - uses: dorny/paths-filter@v3
        id: filter
        with:
          filters: |
            php:
              - 'src/**/*.php'
              - 'composer.json'
              - 'composer.lock'
            node:
              - 'src/**/*.{ts,tsx,js,jsx}'
              - 'package.json'
              - 'package-lock.json'
            python:
              - '**/*.py'
              - 'pyproject.toml'
              - 'requirements*.txt'
            flutter:
              - 'lib/**/*.dart'
              - 'pubspec.yaml'

  #############################################
  # PHP / SYMFONY
  #############################################
  php:
    needs: changes
    if: ${{ needs.changes.outputs.php == 'true' }}
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:16
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432

    steps:
      - uses: actions/checkout@v4

      - name: Configurar PHP
        uses: shivammathur/setup-php@v2
        with:
          php-version: ${{ env.PHP_VERSION }}
          extensions: mbstring, xml, pdo_pgsql, intl
          coverage: xdebug

      - name: Cache Composer
        uses: actions/cache@v4
        with:
          path: vendor
          key: ${{ runner.os }}-composer-${{ hashFiles('**/composer.lock') }}
          restore-keys: ${{ runner.os }}-composer-

      - name: Instalar dependencias
        run: composer install --prefer-dist --no-progress

      - name: Lint
        run: |
          vendor/bin/php-cs-fixer fix --dry-run --diff
          php bin/console lint:twig templates/
          php bin/console lint:yaml config/
          php bin/console lint:container

      - name: Análisis Estático
        run: vendor/bin/phpstan analyse -l max

      - name: Verificación de Seguridad
        run: composer audit

      - name: Tests
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test
        run: |
          php bin/console doctrine:schema:create --env=test
          vendor/bin/phpunit --coverage-text --coverage-clover=coverage.xml

      - name: Subir Cobertura
        uses: codecov/codecov-action@v4
        with:
          files: coverage.xml
          flags: php

  #############################################
  # NODE / REACT / REACT NATIVE
  #############################################
  node:
    needs: changes
    if: ${{ needs.changes.outputs.node == 'true' }}
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Configurar Node
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'

      - name: Instalar dependencias
        run: npm ci

      - name: Lint
        run: |
          npm run lint
          npm run format:check

      - name: Verificación de Tipos
        run: npm run typecheck

      - name: Tests
        run: npm run test -- --coverage

      - name: Build
        run: npm run build

      - name: Análisis del Bundle
        run: npm run analyze || true

      - name: Subir Cobertura
        uses: codecov/codecov-action@v4
        with:
          files: coverage/lcov.info
          flags: node

  #############################################
  # PYTHON
  #############################################
  python:
    needs: changes
    if: ${{ needs.changes.outputs.python == 'true' }}
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:16
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: test
        ports:
          - 5432:5432

    steps:
      - uses: actions/checkout@v4

      - name: Configurar Python
        uses: actions/setup-python@v5
        with:
          python-version: ${{ env.PYTHON_VERSION }}

      - name: Cache pip
        uses: actions/cache@v4
        with:
          path: ~/.cache/pip
          key: ${{ runner.os }}-pip-${{ hashFiles('**/requirements*.txt') }}

      - name: Instalar dependencias
        run: |
          pip install -r requirements.txt
          pip install -r requirements-dev.txt

      - name: Lint
        run: |
          ruff check .
          ruff format --check .

      - name: Verificación de Tipos
        run: mypy .

      - name: Verificación de Seguridad
        run: pip-audit

      - name: Tests
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test
        run: pytest --cov --cov-report=xml

      - name: Subir Cobertura
        uses: codecov/codecov-action@v4
        with:
          files: coverage.xml
          flags: python

  #############################################
  # FLUTTER
  #############################################
  flutter:
    needs: changes
    if: ${{ needs.changes.outputs.flutter == 'true' }}
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Configurar Flutter
        uses: subosito/flutter-action@v2
        with:
          flutter-version: ${{ env.FLUTTER_VERSION }}
          cache: true

      - name: Instalar dependencias
        run: flutter pub get

      - name: Analizar
        run: dart analyze --fatal-infos

      - name: Formatear
        run: dart format --set-exit-if-changed .

      - name: Tests
        run: flutter test --coverage

      - name: Subir Cobertura
        uses: codecov/codecov-action@v4
        with:
          files: coverage/lcov.info
          flags: flutter

  #############################################
  # DESPLIEGUE STAGING
  #############################################
  deploy-staging:
    needs: [php, node, python, flutter]
    if: |
      always() &&
      github.ref == 'refs/heads/develop' &&
      !contains(needs.*.result, 'failure')
    runs-on: ubuntu-latest
    environment: staging

    steps:
      - uses: actions/checkout@v4

      - name: Desplegar en Staging
        run: |
          echo "Desplegando en staging..."
          # Añadir comandos de despliegue

  #############################################
  # DESPLIEGUE PRODUCCIÓN
  #############################################
  deploy-production:
    needs: [php, node, python, flutter]
    if: |
      always() &&
      github.ref == 'refs/heads/main' &&
      !contains(needs.*.result, 'failure')
    runs-on: ubuntu-latest
    environment: production

    steps:
      - uses: actions/checkout@v4

      - name: Desplegar en Producción
        run: |
          echo "Desplegando en producción..."
          # Añadir comandos de despliegue
```

### Paso 3: Configuración GitLab CI

```yaml
# .gitlab-ci.yml
stages:
  - lint
  - test
  - build
  - deploy

variables:
  PHP_VERSION: "8.3"
  NODE_VERSION: "20"

# Cache global
cache:
  paths:
    - vendor/
    - node_modules/
    - .pub-cache/

#############################################
# PHP
#############################################
php-lint:
  stage: lint
  image: php:${PHP_VERSION}
  rules:
    - changes:
        - "src/**/*.php"
        - composer.json
  script:
    - composer install
    - vendor/bin/php-cs-fixer fix --dry-run
    - vendor/bin/phpstan analyse

php-test:
  stage: test
  image: php:${PHP_VERSION}
  services:
    - postgres:16
  variables:
    DATABASE_URL: "postgresql://postgres:postgres@postgres/test"
  rules:
    - changes:
        - "src/**/*.php"
        - composer.json
  script:
    - composer install
    - php bin/console doctrine:schema:create --env=test
    - vendor/bin/phpunit --coverage-text

#############################################
# NODE
#############################################
node-lint:
  stage: lint
  image: node:${NODE_VERSION}
  rules:
    - changes:
        - "src/**/*.{ts,tsx}"
        - package.json
  script:
    - npm ci
    - npm run lint
    - npm run typecheck

node-test:
  stage: test
  image: node:${NODE_VERSION}
  rules:
    - changes:
        - "src/**/*.{ts,tsx}"
        - package.json
  script:
    - npm ci
    - npm run test -- --coverage

#############################################
# DESPLIEGUE
#############################################
deploy-staging:
  stage: deploy
  environment:
    name: staging
  rules:
    - if: $CI_COMMIT_BRANCH == "develop"
  script:
    - echo "Desplegar en staging"

deploy-production:
  stage: deploy
  environment:
    name: production
  rules:
    - if: $CI_COMMIT_BRANCH == "main"
  script:
    - echo "Desplegar en producción"
  when: manual
```

### Paso 4: Archivos Complementarios

#### codecov.yml

```yaml
coverage:
  precision: 2
  round: down
  status:
    project:
      default:
        target: 80%
        threshold: 2%
    patch:
      default:
        target: 80%

comment:
  layout: "reach,diff,flags,files"
  behavior: default
```

#### .pre-commit-config.yaml

```yaml
repos:
  - repo: https://github.com/pre-commit/pre-commit-hooks
    rev: v4.5.0
    hooks:
      - id: trailing-whitespace
      - id: end-of-file-fixer
      - id: check-yaml
      - id: check-json
      - id: check-merge-conflict
      - id: detect-private-key

  - repo: local
    hooks:
      - id: php-cs-fixer
        name: PHP CS Fixer
        entry: vendor/bin/php-cs-fixer fix
        language: system
        types: [php]

      - id: eslint
        name: ESLint
        entry: npx eslint --fix
        language: system
        types: [javascript, typescript]
```

### Paso 5: Resumen

```
══════════════════════════════════════════════════════════════
✅ CONFIGURACIÓN CI/CD GENERADA
══════════════════════════════════════════════════════════════

Plataforma: {GitHub Actions / GitLab CI}
Tecnologías detectadas: {lista}

──────────────────────────────────────────────────────────────
📁 ARCHIVOS CREADOS
──────────────────────────────────────────────────────────────

- .github/workflows/ci.yml (o .gitlab-ci.yml)
- codecov.yml
- .pre-commit-config.yaml

──────────────────────────────────────────────────────────────
🔧 JOBS CONFIGURADOS
──────────────────────────────────────────────────────────────

| Job | Trigger | Acciones |
|-----|---------|---------|
| php | *.php, composer.* | lint, phpstan, tests |
| node | *.ts, package.* | lint, typecheck, tests |
| python | *.py, requirements* | ruff, mypy, pytest |
| flutter | *.dart, pubspec.* | analyze, format, tests |
| deploy-staging | develop | auto |
| deploy-production | main | manual |

──────────────────────────────────────────────────────────────
🎯 PRÓXIMOS PASOS
──────────────────────────────────────────────────────────────

1. Configurar secrets en GitHub/GitLab
2. Configurar entornos (staging, production)
3. Añadir comandos de despliegue
4. Probar pipeline en un PR
```
