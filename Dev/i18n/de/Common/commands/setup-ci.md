---
description: CI/CD-Konfiguration
argument-hint: [arguments]
---

# CI/CD-Konfiguration

Sie sind ein erfahrener DevOps-Ingenieur. Sie müssen eine CI/CD-Pipeline konfigurieren, die an die Projekttechnologien angepasst ist und Best Practices befolgt.

## Argumente
$ARGUMENTS

Argumente:
- CI-Plattform (github, gitlab, circleci)
- (Optional) Automatisch erkannte Technologien

Beispiel: `/common:setup-ci github`

## Plan-Modus

> **Plan-Modus ist obligatorisch.** Vor der Ausführung aktiviert Claude den Plan-Modus, um betroffenen Code zu analysieren, einen Implementierungsplan vorzuschlagen und Ihre Bestätigung abzuwarten, bevor Änderungen vorgenommen werden.

## AUFTRAG

### Schritt 1: Technologien erkennen

Das Projekt scannen, um Folgendes zu identifizieren:

```bash
# Konfigurationsdateien
ls -la composer.json package.json pubspec.yaml pyproject.toml requirements.txt

# Struktur
ls -la src/ lib/ app/ tests/
```

### Schritt 2: Pipeline generieren

#### GitHub Actions (.github/workflows/ci.yml)

```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

env:
  # Versionen
  PHP_VERSION: '8.3'
  NODE_VERSION: '20'
  PYTHON_VERSION: '3.12'
  FLUTTER_VERSION: '3.24'

jobs:
  #############################################
  # ÄNDERUNGSERKENNUNG
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

      - name: PHP einrichten
        uses: shivammathur/setup-php@v2
        with:
          php-version: ${{ env.PHP_VERSION }}
          extensions: mbstring, xml, pdo_pgsql, intl
          coverage: xdebug

      - name: Composer-Cache
        uses: actions/cache@v4
        with:
          path: vendor
          key: ${{ runner.os }}-composer-${{ hashFiles('**/composer.lock') }}
          restore-keys: ${{ runner.os }}-composer-

      - name: Abhängigkeiten installieren
        run: composer install --prefer-dist --no-progress

      - name: Lint
        run: |
          vendor/bin/php-cs-fixer fix --dry-run --diff
          php bin/console lint:twig templates/
          php bin/console lint:yaml config/
          php bin/console lint:container

      - name: Statische Analyse
        run: vendor/bin/phpstan analyse -l max

      - name: Sicherheitsprüfung
        run: composer audit

      - name: Tests
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test
        run: |
          php bin/console doctrine:schema:create --env=test
          vendor/bin/phpunit --coverage-text --coverage-clover=coverage.xml

      - name: Coverage hochladen
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

      - name: Node einrichten
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'

      - name: Abhängigkeiten installieren
        run: npm ci

      - name: Lint
        run: |
          npm run lint
          npm run format:check

      - name: Typprüfung
        run: npm run typecheck

      - name: Tests
        run: npm run test -- --coverage

      - name: Build
        run: npm run build

      - name: Bundle-Analyse
        run: npm run analyze || true

      - name: Coverage hochladen
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

      - name: Python einrichten
        uses: actions/setup-python@v5
        with:
          python-version: ${{ env.PYTHON_VERSION }}

      - name: pip-Cache
        uses: actions/cache@v4
        with:
          path: ~/.cache/pip
          key: ${{ runner.os }}-pip-${{ hashFiles('**/requirements*.txt') }}

      - name: Abhängigkeiten installieren
        run: |
          pip install -r requirements.txt
          pip install -r requirements-dev.txt

      - name: Lint
        run: |
          ruff check .
          ruff format --check .

      - name: Typprüfung
        run: mypy .

      - name: Sicherheitsprüfung
        run: pip-audit

      - name: Tests
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test
        run: pytest --cov --cov-report=xml

      - name: Coverage hochladen
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

      - name: Flutter einrichten
        uses: subosito/flutter-action@v2
        with:
          flutter-version: ${{ env.FLUTTER_VERSION }}
          cache: true

      - name: Abhängigkeiten installieren
        run: flutter pub get

      - name: Analysieren
        run: dart analyze --fatal-infos

      - name: Formatierung prüfen
        run: dart format --set-exit-if-changed .

      - name: Tests
        run: flutter test --coverage

      - name: Coverage hochladen
        uses: codecov/codecov-action@v4
        with:
          files: coverage/lcov.info
          flags: flutter

  #############################################
  # STAGING-DEPLOYMENT
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

      - name: In Staging deployen
        run: |
          echo "Deploying to staging..."
          # Deployment-Befehle hinzufügen

  #############################################
  # PRODUKTIONS-DEPLOYMENT
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

      - name: In Produktion deployen
        run: |
          echo "Deploying to production..."
          # Deployment-Befehle hinzufügen
```

### Schritt 3: GitLab CI-Konfiguration

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

# Globaler Cache
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
# DEPLOYMENT
#############################################
deploy-staging:
  stage: deploy
  environment:
    name: staging
  rules:
    - if: $CI_COMMIT_BRANCH == "develop"
  script:
    - echo "Deploy to staging"

deploy-production:
  stage: deploy
  environment:
    name: production
  rules:
    - if: $CI_COMMIT_BRANCH == "main"
  script:
    - echo "Deploy to production"
  when: manual
```

### Schritt 4: Ergänzende Dateien

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

### Schritt 5: Zusammenfassung

```
══════════════════════════════════════════════════════════════
✅ CI/CD-KONFIGURATION GENERIERT
══════════════════════════════════════════════════════════════

Plattform: {GitHub Actions / GitLab CI}
Erkannte Technologien: {Liste}

──────────────────────────────────────────────────────────────
📁 ERSTELLTE DATEIEN
──────────────────────────────────────────────────────────────

- .github/workflows/ci.yml (oder .gitlab-ci.yml)
- codecov.yml
- .pre-commit-config.yaml

──────────────────────────────────────────────────────────────
🔧 KONFIGURIERTE JOBS
──────────────────────────────────────────────────────────────

| Job               | Auslöser           | Aktionen                     |
|-------------------|--------------------|------------------------------|
| php               | *.php, composer.*  | lint, phpstan, tests         |
| node              | *.ts, package.*    | lint, typecheck, tests       |
| python            | *.py, requirements* | ruff, mypy, pytest          |
| flutter           | *.dart, pubspec.*  | analyze, format, tests       |
| deploy-staging    | develop            | automatisch                  |
| deploy-production | main               | manuell                      |

──────────────────────────────────────────────────────────────
🎯 NÄCHSTE SCHRITTE
──────────────────────────────────────────────────────────────

1. Geheimnisse in GitHub/GitLab konfigurieren
2. Umgebungen konfigurieren (staging, production)
3. Deployment-Befehle hinzufügen
4. Pipeline mit einem PR testen
```
