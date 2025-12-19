---
description: CI/CD-Konfiguration
argument-hint: [arguments]
---

# CI/CD-Konfiguration

Sie sind ein erfahrener DevOps-Ingenieur. Sie müssen eine an die Projekttechnologien angepasste CI/CD-Pipeline konfigurieren und dabei Best Practices folgen.

## Argumente
$ARGUMENTS

Argumente:
- CI-Plattform (github, gitlab, circleci)
- (Optional) Technologien automatisch erkannt

Beispiel: `/common:setup-ci github`

## MISSION

### Schritt 1: Technologien erkennen

Projekt scannen, um zu identifizieren:

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
  # ÄNDERUNGS-ERKENNUNG
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

      - name: PHP Setup
        uses: shivammathur/setup-php@v2
        with:
          php-version: ${{ env.PHP_VERSION }}
          extensions: mbstring, xml, pdo_pgsql, intl
          coverage: xdebug

      - name: Composer Cache
        uses: actions/cache@v4
        with:
          path: vendor
          key: ${{ runner.os }}-composer-${{ hashFiles('**/composer.lock') }}
          restore-keys: ${{ runner.os }}-composer-

      - name: Dependencies installieren
        run: composer install --prefer-dist --no-progress

      - name: Lint
        run: |
          vendor/bin/php-cs-fixer fix --dry-run --diff
          php bin/console lint:twig templates/
          php bin/console lint:yaml config/
          php bin/console lint:container

      - name: Statische Analyse
        run: vendor/bin/phpstan analyse -l max

      - name: Sicherheits-Check
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

      - name: Node Setup
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'

      - name: Dependencies installieren
        run: npm ci

      - name: Lint
        run: |
          npm run lint
          npm run format:check

      - name: Type Check
        run: npm run typecheck

      - name: Tests
        run: npm run test -- --coverage

      - name: Build
        run: npm run build

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

    steps:
      - uses: actions/checkout@v4

      - name: Python Setup
        uses: actions/setup-python@v5
        with:
          python-version: ${{ env.PYTHON_VERSION }}

      - name: Dependencies installieren
        run: |
          pip install -r requirements.txt
          pip install -r requirements-dev.txt

      - name: Lint
        run: |
          ruff check .
          ruff format --check .

      - name: Type Check
        run: mypy .

      - name: Tests
        run: pytest --cov --cov-report=xml

  #############################################
  # FLUTTER
  #############################################
  flutter:
    needs: changes
    if: ${{ needs.changes.outputs.flutter == 'true' }}
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Flutter Setup
        uses: subosito/flutter-action@v2
        with:
          flutter-version: ${{ env.FLUTTER_VERSION }}
          cache: true

      - name: Dependencies installieren
        run: flutter pub get

      - name: Analyze
        run: dart analyze --fatal-infos

      - name: Format
        run: dart format --set-exit-if-changed .

      - name: Tests
        run: flutter test --coverage
```

### Schritt 3: GitLab CI Konfiguration

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

cache:
  paths:
    - vendor/
    - node_modules/

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
  script:
    - composer install
    - php bin/console doctrine:schema:create --env=test
    - vendor/bin/phpunit --coverage-text
```

### Schritt 4: Zusammenfassung

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

| Job | Trigger | Aktionen |
|-----|---------|---------|
| php | *.php, composer.* | lint, phpstan, tests |
| node | *.ts, package.* | lint, typecheck, tests |
| python | *.py, requirements* | ruff, mypy, pytest |
| flutter | *.dart, pubspec.* | analyze, format, tests |
| deploy-staging | develop | auto |
| deploy-production | main | manuell |

──────────────────────────────────────────────────────────────
🎯 NÄCHSTE SCHRITTE
──────────────────────────────────────────────────────────────

1. Secrets in GitHub/GitLab konfigurieren
2. Environments (staging, production) konfigurieren
3. Deployment-Befehle hinzufügen
4. Pipeline auf PR testen
```
