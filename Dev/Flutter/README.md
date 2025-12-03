# Flutter Development Rules pour Claude Code

Structure complète de règles de développement Flutter pour Claude Code.

## Structure

```
Flutter/
├── CLAUDE.md.template          # Template principal à copier dans chaque projet
├── README.md                   # Ce fichier
│
├── rules/                      # Règles détaillées (13 fichiers)
│   ├── 00-project-context.md.template
│   ├── 01-workflow-analysis.md
│   ├── 02-architecture.md
│   ├── 03-coding-standards.md
│   ├── 04-solid-principles.md
│   ├── 05-kiss-dry-yagni.md
│   ├── 06-tooling.md
│   ├── 07-testing.md
│   ├── 08-quality-tools.md
│   ├── 09-git-workflow.md
│   ├── 10-documentation.md
│   ├── 11-security.md
│   ├── 12-performance.md
│   └── 13-state-management.md
│
├── templates/                  # Templates de code
│   ├── widget.md
│   ├── bloc.md
│   ├── repository.md
│   ├── test-widget.md
│   └── test-unit.md
│
└── checklists/                 # Checklists
    ├── pre-commit.md
    ├── new-feature.md
    ├── refactoring.md
    └── security.md
```

## Utilisation

### 1. Nouveau Projet Flutter

```bash
# Créer projet Flutter
flutter create mon_projet
cd mon_projet

# Créer dossier .claude
mkdir -p .claude

# Copier CLAUDE.md.template
cp /path/to/Flutter/CLAUDE.md.template .claude/CLAUDE.md

# Copier rules (optionnel mais recommandé)
cp -r /path/to/Flutter/rules .claude/
cp -r /path/to/Flutter/templates .claude/
cp -r /path/to/Flutter/checklists .claude/
```

### 2. Personnaliser CLAUDE.md

Remplacer les placeholders dans `.claude/CLAUDE.md` :

- `{{PROJECT_NAME}}` : Nom du projet
- `{{TECH_STACK}}` : Stack technique (ex: Flutter 3.16 + Firebase + Stripe)
- `{{STATE_MANAGEMENT_PATTERN}}` : BLoC / Riverpod / Provider
- `{{STATE_MANAGEMENT_DEPENDENCIES}}` : Dépendances pour state management
- `{{LEAD_DEVELOPER}}` : Nom du lead dev
- `{{REPOSITORY_URL}}` : URL du repo
- `{{CI_CD_PLATFORM}}` : GitHub Actions / GitLab CI / etc.
- `{{DOCS_URL}}` : URL de la doc
- `{{UPDATE_DATE}}` : Date de dernière mise à jour

### 3. Personnaliser 00-project-context.md

Copier `rules/00-project-context.md.template` et remplir :

```bash
cp .claude/rules/00-project-context.md.template .claude/rules/00-project-context.md
```

Remplacer les placeholders avec les infos spécifiques du projet.

### 4. Structure recommandée du projet

```
mon_projet/
├── .claude/
│   ├── CLAUDE.md               # Règles principales
│   ├── rules/                  # Règles détaillées
│   ├── templates/              # Templates
│   └── checklists/             # Checklists
│
├── lib/
│   ├── core/
│   │   ├── constants/
│   │   ├── errors/
│   │   ├── extensions/
│   │   ├── network/
│   │   ├── theme/
│   │   ├── utils/
│   │   └── widgets/
│   │
│   ├── features/
│   │   └── [feature_name]/
│   │       ├── data/
│   │       │   ├── datasources/
│   │       │   ├── models/
│   │       │   └── repositories/
│   │       ├── domain/
│   │       │   ├── entities/
│   │       │   ├── repositories/
│   │       │   └── usecases/
│   │       └── presentation/
│   │           ├── bloc/
│   │           ├── pages/
│   │           └── widgets/
│   │
│   ├── dependency_injection.dart
│   └── main.dart
│
├── test/
│   ├── unit/
│   ├── widget/
│   └── integration_test/
│
├── Makefile                    # Commandes Docker
├── Dockerfile.flutter
├── docker-compose.yml
├── .env.example
├── .gitignore
├── analysis_options.yaml
├── pubspec.yaml
└── README.md
```

## Makefile Standard

Créer un `Makefile` à la racine du projet :

```makefile
.PHONY: help setup run test clean analyze format

# Docker Flutter
FLUTTER := docker run --rm -v $(PWD):/app -w /app ghcr.io/cirruslabs/flutter:stable flutter
DART := docker run --rm -v $(PWD):/app -w /app ghcr.io/cirruslabs/flutter:stable dart

help: ## Afficher aide
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

setup: ## Installer dépendances
	$(FLUTTER) pub get

run: ## Lancer app
	$(FLUTTER) run

test: ## Tous les tests
	$(FLUTTER) test

test-coverage: ## Tests avec coverage
	$(FLUTTER) test --coverage

analyze: ## Analyser code
	$(FLUTTER) analyze

format: ## Formater code
	$(DART) format lib/ test/

generate: ## Générer code
	$(FLUTTER) pub run build_runner build --delete-conflicting-outputs

clean: ## Nettoyer
	$(FLUTTER) clean

ci: analyze format test ## Pipeline CI
	@echo "✅ CI passed!"
```

## Fichiers de Configuration

### analysis_options.yaml

```yaml
include: package:flutter_lints/flutter.yaml

analyzer:
  exclude:
    - "**/*.g.dart"
    - "**/*.freezed.dart"

  errors:
    invalid_annotation_target: ignore

  language:
    strict-casts: true
    strict-inference: true

linter:
  rules:
    - always_declare_return_types
    - always_put_required_named_parameters_first
    - avoid_print
    - prefer_const_constructors
    - prefer_const_declarations
    - prefer_final_fields
    - prefer_single_quotes
    - require_trailing_commas
```

### .gitignore

```
# Flutter
.dart_tool/
.flutter-plugins
.flutter-plugins-dependencies
.packages
.pub-cache/
.pub/
build/
flutter_*.png

# IDE
.idea/
.vscode/
*.iml
*.ipr
*.iws

# Environment
.env
*.env

# Generated
**/*.g.dart
**/*.freezed.dart

# Coverage
coverage/

# Docker
.dockerignore
```

## Workflow de Développement

### 1. Nouvelle Feature

```bash
# 1. Créer branche
git checkout -b feature/ma-feature

# 2. Lire règles
cat .claude/rules/01-workflow-analysis.md
cat .claude/checklists/new-feature.md

# 3. Développer en suivant Clean Architecture
# 4. Tests en parallèle
make test

# 5. Vérifier qualité
make ci

# 6. Commit
git commit -m "feat(feature): add ma feature"

# 7. Push et PR
git push origin feature/ma-feature
```

### 2. Bugfix

```bash
# 1. Branche
git checkout -b fix/mon-bug

# 2. Reproduire avec test
# 3. Fixer
# 4. Vérifier
make test

# 5. Commit
git commit -m "fix(module): resolve mon bug"
```

## Commandes Quotidiennes

```bash
# Morning routine
make setup          # Update dependencies
make generate       # Generate code
make run            # Run app

# Développement
make test-unit      # Tests pendant dev
make analyze        # Vérifier code

# Avant commit
make ci             # Pipeline complète

# Build release
make build-apk
```

## Ressources

### Documentation
- Règles détaillées : `.claude/rules/`
- Templates de code : `.claude/templates/`
- Checklists : `.claude/checklists/`

### Liens Utiles
- [Flutter Documentation](https://docs.flutter.dev/)
- [Effective Dart](https://dart.dev/guides/language/effective-dart)
- [BLoC Library](https://bloclibrary.dev/)
- [Riverpod](https://riverpod.dev/)

## Support

Pour questions ou suggestions :
- Ouvrir une issue dans le repo
- Contacter le lead developer

---

**Version** : 1.0
**Dernière mise à jour** : 2024-12-03
