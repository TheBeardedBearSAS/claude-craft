# Outils de Qualité Ruby on Rails

> Exécutez chaque outil dans le conteneur : `docker compose exec app <commande>`. Rails 8 génère les binstubs `bin/rubocop`, `bin/brakeman` et `bin/bundler-audit` ; Rails 8.1 les enchaîne dans `bin/ci`.

## Vue d'ensemble des portes qualité

| Outil | Objectif | Porte |
|-------|----------|-------|
| **RuboCop** (`rubocop-rails-omakase`) | Style et lint | 0 offense |
| **rubocop-rails / -performance / -rspec** | Cops supplémentaires | 0 offense |
| **Brakeman** | Analyse statique de sécurité | 0 avertissement non résolu |
| **bundler-audit** | Scan des CVE des gems | 0 vulnérabilité connue |
| **importmap audit** | Scan des CVE des pins JavaScript | 0 vulnérabilité connue |
| **SimpleCov** | Couverture | >= 80 % |
| **Bullet / strict_loading** | Détection des N+1 | 0 N+1 dans les tests |
| **Steep / Sorbet** | Typage optionnel | 0 erreur de type lorsqu'adopté |
| **Reek / Flog / Flay** | Smells, complexité, duplication | Indicatif |
| **database_consistency** | Cohérence modèles vs schéma | Indicatif ou porte |
| **strong_migrations** | Prévention des migrations dangereuses | Porte |

---

## RuboCop

### Défaut : rubocop-rails-omakase

Rails 8 fournit une configuration opinionnée et peu bruyante.

```yaml
# .rubocop.yml
inherit_gem:
  rubocop-rails-omakase: rubocop.yml
```

```bash
docker compose exec app bin/rubocop                  # Vérifier
docker compose exec app bin/rubocop -a               # Corriger automatiquement les offenses sûres
docker compose exec app bin/rubocop -A               # Inclure les corrections non sûres (relire le diff)
docker compose exec app bin/rubocop app/models       # Limiter le périmètre
docker compose exec app bin/rubocop -f github        # Annotations de CI
```

### Configuration de projet plus stricte

Lorsque l'équipe veut davantage que les défauts omakase, ajouter les cops de la communauté :

```yaml
# .rubocop.yml
inherit_gem:
  rubocop-rails-omakase: rubocop.yml

plugins:
  - rubocop-rails
  - rubocop-performance
  - rubocop-rspec          # uniquement avec RSpec

AllCops:
  TargetRubyVersion: 4.0
  NewCops: enable
  Exclude:
    - "db/schema.rb"
    - "vendor/**/*"
    - "node_modules/**/*"
    - "bin/**/*"

Layout/LineLength:
  Max: 120

Metrics/MethodLength:
  Max: 10
  CountAsOne: ["array", "hash", "heredoc"]

Metrics/AbcSize:
  Max: 17

Metrics/CyclomaticComplexity:
  Max: 7

Metrics/ParameterLists:
  Max: 4

Style/FrozenStringLiteralComment:
  Enabled: true
  EnforcedStyle: always

Style/Documentation:
  Enabled: false

Rails/UnknownEnv:
  Environments: [development, test, production]
```

Vérifier la syntaxe exacte des plugins (`plugins:` vs `require:`) par rapport à la version de RuboCop installée, car le chargement des extensions a changé dans les versions récentes.

### Traiter les offenses

- Corriger le code ; ne désactiver un cop en ligne qu'avec une raison :

```ruby
# rubocop:disable Metrics/MethodLength -- machine à états laissée à plat pour la lisibilité
def transition(event)
  # ...
end
# rubocop:enable Metrics/MethodLength
```

- Générer un fichier todo pour la dette héritée et le réduire au fil du temps :

```bash
docker compose exec app bin/rubocop --auto-gen-config --auto-gen-only-exclude --exclude-limit 1000
```

- Ne jamais commiter un `.rubocop_todo.yml` toujours plus gros ; le relire à chaque sprint

---

## Brakeman

Analyse statique des problèmes de sécurité Rails (injection SQL, XSS, mass assignment, redirections dangereuses, injection de commandes, désérialisation dangereuse).

```bash
docker compose exec app bin/brakeman                              # Rapport complet
docker compose exec app bin/brakeman --no-pager --quiet
docker compose exec app bin/brakeman --exit-on-warn --exit-on-error   # Porte de CI
docker compose exec app bin/brakeman -f json -o brakeman.json
docker compose exec app bin/brakeman -I                           # Ignorer de façon interactive
```

### Ignorer les faux positifs

`config/brakeman.ignore` est généré par `brakeman -I` :

```json
{
  "ignored_warnings": [
    {
      "fingerprint": "...",
      "note": "Value comes from an allow-listed constant, reviewed 2026-11-01"
    }
  ]
}
```

Chaque avertissement ignoré exige une justification écrite (`note`) et un relecteur. Traiter les nouveaux avertissements comme des échecs de build.

---

## bundler-audit et hygiène des dépendances

```bash
docker compose exec app bin/bundler-audit                   # Scanner Gemfile.lock
docker compose exec app bundle exec bundler-audit check --update
docker compose exec app bin/importmap audit                 # Paquets JS épinglés
docker compose exec app bundle outdated --strict
```

`bin/bundler-audit` est branché par défaut dans `config/ci.rb` avec Rails 8.1. Le compléter avec Dependabot ou Renovate pour des PR de mise à jour automatiques, et un workflow planifié nocturne afin que les nouveaux avis de sécurité remontent sans changement de code.

```yaml
# .github/dependabot.yml
version: 2
updates:
  - package-ecosystem: bundler
    directory: "/"
    schedule:
      interval: weekly
    open-pull-requests-limit: 5
  - package-ecosystem: github-actions
    directory: "/"
    schedule:
      interval: weekly
```

Pratiques de chaîne d'approvisionnement (OWASP A03:2025) : commiter `Gemfile.lock`, relire les nouvelles gems, activer la MFA sur RubyGems pour les gems possédées, générer un SBOM (CycloneDX) au build, scanner l'image avec Trivy ou Grype.

---

## Couverture : SimpleCov

```ruby
# test/test_helper.rb ou spec/rails_helper.rb, premières lignes
require "simplecov"
SimpleCov.start "rails" do
  enable_coverage :branch
  minimum_coverage line: 80, branch: 70
  minimum_coverage_by_file 60
  add_filter %w[/config/ /db/ /test/ /spec/]
end
```

La couverture est imposée par SimpleCov, qui sort avec un code non nul lorsque les seuils ne sont pas atteints. Publier `coverage/` comme artefact de CI.

---

## Performance et qualité des données

### Détection des N+1

```ruby
# config/environments/development.rb et test.rb
config.after_initialize do
  Bullet.enable = true
  Bullet.raise = true if Rails.env.test?
  Bullet.rails_logger = true
end

# Alternativement, le strict loading intégré à Rails
config.active_record.strict_loading_by_default = true
config.active_record.action_on_strict_loading_violation = :log
```

### strong_migrations

```ruby
# Gemfile (development, test)
gem "strong_migrations"
```

```ruby
class AddIndexToOrders < ActiveRecord::Migration[8.1]
  disable_ddl_transaction!

  def change
    add_index :orders, :status, algorithm: :concurrently
  end
end
```

`strong_migrations` bloque les opérations dangereuses (index non concurrents, suppressions de colonnes encore lues par le code en cours d'exécution) avec un message exploitable.

### database_consistency

```bash
docker compose exec app bundle exec database_consistency
```

Détecte les index manquants derrière les validations, les clés étrangères manquantes et les écarts de `null: false` entre les modèles et le schéma.

---

## Complexité et smells

```bash
docker compose exec app bundle exec reek app/services          # Code smells
docker compose exec app bundle exec flog -g app/models         # Complexité (ABC)
docker compose exec app bundle exec flay app                   # Duplication
```

Seuils (règle projet 05) : méthodes < 10 lignes (limite 20), complexité cognitive < 7 (limite 10), complexité cyclomatique < 5 (limite 10), profondeur d'imbrication <= 3, <= 4 paramètres. Les cops `Metrics/*` de RuboCop les approximent en CI.

---

## Typage statique (optionnel)

### Steep avec RBS

```bash
docker compose exec app bundle exec rbs collection install
docker compose exec app bundle exec steep check
```

```ruby
# Steepfile
target :app do
  signature "sig"
  check "app/services"
  library "activerecord"
end
```

### Sorbet

```bash
docker compose exec app bundle exec srb init
docker compose exec app bundle exec srb tc
```

Adopter une seule approche de typage, commencer par les services et les value objects, et l'imposer en CI. Ne pas mélanger les systèmes dans un même répertoire.

---

## CI locale : bin/ci (Rails 8.1)

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

Ajouter des étapes de projet pour RSpec, les tests système, Steep/Sorbet, `zeitwerk:check` et `database_consistency`.

---

## Pipeline GitHub Actions

```yaml
name: CI
on:
  pull_request:
  push:
    branches: [main]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: ruby/setup-ruby@v1
        with: { bundler-cache: true }
      - run: bin/rubocop -f github

  security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: ruby/setup-ruby@v1
        with: { bundler-cache: true }
      - run: bin/brakeman --no-pager --exit-on-warn --exit-on-error
      - run: bin/bundler-audit
      - run: bin/importmap audit

  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:17
        env: { POSTGRES_PASSWORD: postgres }
        ports: ["5432:5432"]
        options: >-
          --health-cmd="pg_isready" --health-interval=10s
          --health-timeout=5s --health-retries=5
    env:
      RAILS_ENV: test
      DATABASE_URL: postgres://postgres:postgres@localhost:5432/test
    steps:
      - uses: actions/checkout@v4
      - uses: ruby/setup-ruby@v1
        with: { bundler-cache: true }
      - run: bin/rails db:test:prepare test test:system
```

Épingler les actions sur des SHA de commit pour l'intégrité de la chaîne d'approvisionnement.

---

## Hooks pre-commit

```yaml
# lefthook.yml
pre-commit:
  parallel: true
  commands:
    rubocop:
      glob: "*.{rb,rake}"
      run: docker compose exec -T app bin/rubocop --force-exclusion {staged_files}
    brakeman:
      glob: "{app,config,lib}/**/*.rb"
      run: docker compose exec -T app bin/brakeman -q --no-pager --exit-on-warn
```

---

## Alignement avec la notation

L'audit `/ruby:check` associe les outils aux axes :

| Axe | Preuves fournies par les outils |
|-----|---------------------------------|
| Architecture | `zeitwerk:check`, Bullet/strict loading, database_consistency |
| Qualité du code | RuboCop, Reek/Flog, Steep/Sorbet |
| Sécurité | Brakeman, bundler-audit, importmap audit |
| Tests | SimpleCov, résultats de la suite de tests |

---

## Checklist qualité

- [ ] `bin/rubocop` retourne 0 offense
- [ ] `bin/brakeman` retourne 0 avertissement non résolu
- [ ] `bin/bundler-audit` et `bin/importmap audit` sont propres
- [ ] SimpleCov impose >= 80 %
- [ ] Détection des N+1 active en test
- [ ] `strong_migrations` actif
- [ ] `bin/ci` passe en local et la CI exécute les mêmes étapes
- [ ] Dependabot ou Renovate configuré
- [ ] Les avertissements ignorés et les désactivations RuboCop portent une raison
