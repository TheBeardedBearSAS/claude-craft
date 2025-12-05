# Flutter Development Rules für Claude Code

Vollständige Struktur der Flutter-Entwicklungsregeln für Claude Code.

## Struktur

```
Flutter/
├── CLAUDE.md.template          # Hauptvorlage zum Kopieren in jedes Projekt
├── README.md                   # Diese Datei
│
├── rules/                      # Detaillierte Regeln (13 Dateien)
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
├── templates/                  # Code-Vorlagen
│   ├── widget.md
│   ├── bloc.md
│   ├── repository.md
│   ├── test-widget.md
│   └── test-unit.md
│
└── checklists/                 # Checklisten
    ├── pre-commit.md
    ├── new-feature.md
    ├── refactoring.md
    └── security.md
```

## Verwendung

### 1. Neues Flutter-Projekt

```bash
# Flutter-Projekt erstellen
flutter create mon_projet
cd mon_projet

# .claude-Verzeichnis erstellen
mkdir -p .claude

# CLAUDE.md.template kopieren
cp /path/to/Flutter/CLAUDE.md.template .claude/CLAUDE.md

# Rules kopieren (optional aber empfohlen)
cp -r /path/to/Flutter/rules .claude/
cp -r /path/to/Flutter/templates .claude/
cp -r /path/to/Flutter/checklists .claude/
```

### 2. CLAUDE.md anpassen

Platzhalter in `.claude/CLAUDE.md` ersetzen:

- `{{PROJECT_NAME}}` : Projektname
- `{{TECH_STACK}}` : Tech-Stack (z.B.: Flutter 3.16 + Firebase + Stripe)
- `{{STATE_MANAGEMENT_PATTERN}}` : BLoC / Riverpod / Provider
- `{{STATE_MANAGEMENT_DEPENDENCIES}}` : Abhängigkeiten für State Management
- `{{LEAD_DEVELOPER}}` : Name des Lead-Entwicklers
- `{{REPOSITORY_URL}}` : Repository-URL
- `{{CI_CD_PLATFORM}}` : GitHub Actions / GitLab CI / etc.
- `{{DOCS_URL}}` : Dokumentations-URL
- `{{UPDATE_DATE}}` : Datum der letzten Aktualisierung

### 3. 00-project-context.md anpassen

`rules/00-project-context.md.template` kopieren und ausfüllen:

```bash
cp .claude/rules/00-project-context.md.template .claude/rules/00-project-context.md
```

Platzhalter mit projektspezifischen Informationen ersetzen.

### 4. Empfohlene Projektstruktur

```
mon_projet/
├── .claude/
│   ├── CLAUDE.md               # Hauptregeln
│   ├── rules/                  # Detaillierte Regeln
│   ├── templates/              # Vorlagen
│   └── checklists/             # Checklisten
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
├── Makefile                    # Docker-Befehle
├── Dockerfile.flutter
├── docker-compose.yml
├── .env.example
├── .gitignore
├── analysis_options.yaml
├── pubspec.yaml
└── README.md
```

## Standard-Makefile

Ein `Makefile` im Projektstammverzeichnis erstellen:

```makefile
.PHONY: help setup run test clean analyze format

# Docker Flutter
FLUTTER := docker run --rm -v $(PWD):/app -w /app ghcr.io/cirruslabs/flutter:stable flutter
DART := docker run --rm -v $(PWD):/app -w /app ghcr.io/cirruslabs/flutter:stable dart

help: ## Hilfe anzeigen
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

setup: ## Abhängigkeiten installieren
	$(FLUTTER) pub get

run: ## App starten
	$(FLUTTER) run

test: ## Alle Tests
	$(FLUTTER) test

test-coverage: ## Tests mit Coverage
	$(FLUTTER) test --coverage

analyze: ## Code analysieren
	$(FLUTTER) analyze

format: ## Code formatieren
	$(DART) format lib/ test/

generate: ## Code generieren
	$(FLUTTER) pub run build_runner build --delete-conflicting-outputs

clean: ## Bereinigen
	$(FLUTTER) clean

ci: analyze format test ## CI-Pipeline
	@echo "✅ CI passed!"
```

## Konfigurationsdateien

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

## Entwicklungs-Workflow

### 1. Neue Feature

```bash
# 1. Branch erstellen
git checkout -b feature/ma-feature

# 2. Regeln lesen
cat .claude/rules/01-workflow-analysis.md
cat .claude/checklists/new-feature.md

# 3. Entwicklung nach Clean Architecture
# 4. Tests parallel
make test

# 5. Qualität prüfen
make ci

# 6. Commit
git commit -m "feat(feature): add ma feature"

# 7. Push und PR
git push origin feature/ma-feature
```

### 2. Bugfix

```bash
# 1. Branch
git checkout -b fix/mon-bug

# 2. Mit Test reproduzieren
# 3. Beheben
# 4. Überprüfen
make test

# 5. Commit
git commit -m "fix(module): resolve mon bug"
```

## Tägliche Befehle

```bash
# Morning routine
make setup          # Update dependencies
make generate       # Generate code
make run            # Run app

# Entwicklung
make test-unit      # Tests pendant dev
make analyze        # Code überprüfen

# Vor Commit
make ci             # Vollständige Pipeline

# Build release
make build-apk
```

## Ressourcen

### Dokumentation
- Detaillierte Regeln: `.claude/rules/`
- Code-Vorlagen: `.claude/templates/`
- Checklisten: `.claude/checklists/`

### Nützliche Links
- [Flutter Documentation](https://docs.flutter.dev/)
- [Effective Dart](https://dart.dev/guides/language/effective-dart)
- [BLoC Library](https://bloclibrary.dev/)
- [Riverpod](https://riverpod.dev/)

## Support

Bei Fragen oder Anregungen:
- Issue im Repository öffnen
- Lead-Entwickler kontaktieren

---

**Version** : 1.0
**Letzte Aktualisierung** : 2024-12-03
