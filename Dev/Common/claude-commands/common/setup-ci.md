# Configuration CI/CD

Tu es un DevOps Engineer expert. Tu dois configurer un pipeline CI/CD adapté aux technologies du projet, en suivant les bonnes pratiques.

## Arguments
$ARGUMENTS

Arguments :
- Plateforme CI (github, gitlab, circleci)
- (Optionnel) Technologies détectées automatiquement

Exemple : `/common:setup-ci github`

## MISSION

### Étape 1 : Détecter les Technologies

Scanner le projet pour identifier :

```bash
# Fichiers de configuration
ls -la composer.json package.json pubspec.yaml pyproject.toml requirements.txt

# Structure
ls -la src/ lib/ app/ tests/
```

### Étape 2 : Générer le Pipeline

#### GitHub Actions (.github/workflows/ci.yml)

```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

env:
  # Versions
  PHP_VERSION: '8.3'
  NODE_VERSION: '20'
  PYTHON_VERSION: '3.12'
  FLUTTER_VERSION: '3.24'

jobs:
  #############################################
  # DÉTECTION DES CHANGEMENTS
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

      - name: Setup PHP
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

      - name: Install dependencies
        run: composer install --prefer-dist --no-progress

      - name: Lint
        run: |
          vendor/bin/php-cs-fixer fix --dry-run --diff
          php bin/console lint:twig templates/
          php bin/console lint:yaml config/
          php bin/console lint:container

      - name: Static Analysis
        run: vendor/bin/phpstan analyse -l max

      - name: Security Check
        run: composer audit

      - name: Tests
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test
        run: |
          php bin/console doctrine:schema:create --env=test
          vendor/bin/phpunit --coverage-text --coverage-clover=coverage.xml

      - name: Upload Coverage
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

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'

      - name: Install dependencies
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

      - name: Bundle Analysis
        run: npm run analyze || true

      - name: Upload Coverage
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

      - name: Setup Python
        uses: actions/setup-python@v5
        with:
          python-version: ${{ env.PYTHON_VERSION }}

      - name: Cache pip
        uses: actions/cache@v4
        with:
          path: ~/.cache/pip
          key: ${{ runner.os }}-pip-${{ hashFiles('**/requirements*.txt') }}

      - name: Install dependencies
        run: |
          pip install -r requirements.txt
          pip install -r requirements-dev.txt

      - name: Lint
        run: |
          ruff check .
          ruff format --check .

      - name: Type Check
        run: mypy .

      - name: Security Check
        run: pip-audit

      - name: Tests
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test
        run: pytest --cov --cov-report=xml

      - name: Upload Coverage
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

      - name: Setup Flutter
        uses: subosito/flutter-action@v2
        with:
          flutter-version: ${{ env.FLUTTER_VERSION }}
          cache: true

      - name: Install dependencies
        run: flutter pub get

      - name: Analyze
        run: dart analyze --fatal-infos

      - name: Format
        run: dart format --set-exit-if-changed .

      - name: Tests
        run: flutter test --coverage

      - name: Upload Coverage
        uses: codecov/codecov-action@v4
        with:
          files: coverage/lcov.info
          flags: flutter

  #############################################
  # DEPLOY STAGING
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

      - name: Deploy to Staging
        run: |
          echo "Deploying to staging..."
          # Ajouter les commandes de déploiement

  #############################################
  # DEPLOY PRODUCTION
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

      - name: Deploy to Production
        run: |
          echo "Deploying to production..."
          # Ajouter les commandes de déploiement
```

### Étape 3 : Configuration GitLab CI

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
# DEPLOY
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

### Étape 4 : Fichiers Complémentaires

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

### Étape 5 : Résumé

```
══════════════════════════════════════════════════════════════
✅ CONFIGURATION CI/CD GÉNÉRÉE
══════════════════════════════════════════════════════════════

Plateforme : {GitHub Actions / GitLab CI}
Technologies détectées : {liste}

──────────────────────────────────────────────────────────────
📁 FICHIERS CRÉÉS
──────────────────────────────────────────────────────────────

- .github/workflows/ci.yml (ou .gitlab-ci.yml)
- codecov.yml
- .pre-commit-config.yaml

──────────────────────────────────────────────────────────────
🔧 JOBS CONFIGURÉS
──────────────────────────────────────────────────────────────

| Job | Trigger | Actions |
|-----|---------|---------|
| php | *.php, composer.* | lint, phpstan, tests |
| node | *.ts, package.* | lint, typecheck, tests |
| python | *.py, requirements* | ruff, mypy, pytest |
| flutter | *.dart, pubspec.* | analyze, format, tests |
| deploy-staging | develop | auto |
| deploy-production | main | manual |

──────────────────────────────────────────────────────────────
🎯 PROCHAINES ÉTAPES
──────────────────────────────────────────────────────────────

1. Configurer les secrets dans GitHub/GitLab
2. Configurer les environnements (staging, production)
3. Ajouter les commandes de déploiement
4. Tester le pipeline sur une PR
```
