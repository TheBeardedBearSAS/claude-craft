# Flutter Development Rules for Claude Code

Complete structure of Flutter development rules for Claude Code.

## Structure

```
Flutter/
├── CLAUDE.md.template          # Main template to copy into each project
├── README.md                   # This file
│
├── rules/                      # Detailed rules (13 files)
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
├── templates/                  # Code templates
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

## Usage

### 1. New Flutter Project

```bash
# Create Flutter project
flutter create mon_projet
cd mon_projet

# Create .claude folder
mkdir -p .claude

# Copy CLAUDE.md.template
cp /path/to/Flutter/CLAUDE.md.template .claude/CLAUDE.md

# Copy rules (optional but recommended)
cp -r /path/to/Flutter/rules .claude/
cp -r /path/to/Flutter/templates .claude/
cp -r /path/to/Flutter/checklists .claude/
```

### 2. Customize CLAUDE.md

Replace placeholders in `.claude/CLAUDE.md`:

- `{{PROJECT_NAME}}`: Project name
- `{{TECH_STACK}}`: Tech stack (e.g., Flutter 3.16 + Firebase + Stripe)
- `{{STATE_MANAGEMENT_PATTERN}}`: BLoC / Riverpod / Provider
- `{{STATE_MANAGEMENT_DEPENDENCIES}}`: State management dependencies
- `{{LEAD_DEVELOPER}}`: Lead developer name
- `{{REPOSITORY_URL}}`: Repository URL
- `{{CI_CD_PLATFORM}}`: GitHub Actions / GitLab CI / etc.
- `{{DOCS_URL}}`: Documentation URL
- `{{UPDATE_DATE}}`: Last update date

### 3. Customize 00-project-context.md

Copy `rules/00-project-context.md.template` and fill:

```bash
cp .claude/rules/00-project-context.md.template .claude/rules/00-project-context.md
```

Replace placeholders with project-specific information.

### 4. Recommended project structure

```
mon_projet/
├── .claude/
│   ├── CLAUDE.md               # Main rules
│   ├── rules/                  # Detailed rules
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
├── Makefile                    # Docker commands
├── Dockerfile.flutter
├── docker-compose.yml
├── .env.example
├── .gitignore
├── analysis_options.yaml
├── pubspec.yaml
└── README.md
```

## Standard Makefile

Create a `Makefile` at project root:

```makefile
.PHONY: help setup run test clean analyze format

# Docker Flutter
FLUTTER := docker run --rm -v $(PWD):/app -w /app ghcr.io/cirruslabs/flutter:stable flutter
DART := docker run --rm -v $(PWD):/app -w /app ghcr.io/cirruslabs/flutter:stable dart

help: ## Display help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

setup: ## Install dependencies
	$(FLUTTER) pub get

run: ## Run app
	$(FLUTTER) run

test: ## All tests
	$(FLUTTER) test

test-coverage: ## Tests with coverage
	$(FLUTTER) test --coverage

analyze: ## Analyze code
	$(FLUTTER) analyze

format: ## Format code
	$(DART) format lib/ test/

generate: ## Generate code
	$(FLUTTER) pub run build_runner build --delete-conflicting-outputs

clean: ## Clean
	$(FLUTTER) clean

ci: analyze format test ## CI pipeline
	@echo "✅ CI passed!"
```

## Configuration Files

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

## Development Workflow

### 1. New Feature

```bash
# 1. Create branch
git checkout -b feature/ma-feature

# 2. Read rules
cat .claude/rules/01-workflow-analysis.md
cat .claude/checklists/new-feature.md

# 3. Develop following Clean Architecture
# 4. Tests in parallel
make test

# 5. Check quality
make ci

# 6. Commit
git commit -m "feat(feature): add ma feature"

# 7. Push and PR
git push origin feature/ma-feature
```

### 2. Bugfix

```bash
# 1. Branch
git checkout -b fix/mon-bug

# 2. Reproduce with test
# 3. Fix
# 4. Verify
make test

# 5. Commit
git commit -m "fix(module): resolve mon bug"
```

## Daily Commands

```bash
# Morning routine
make setup          # Update dependencies
make generate       # Generate code
make run            # Run app

# Development
make test-unit      # Tests during dev
make analyze        # Check code

# Before commit
make ci             # Complete pipeline

# Build release
make build-apk
```

## Resources

### Documentation
- Detailed rules: `.claude/rules/`
- Code templates: `.claude/templates/`
- Checklists: `.claude/checklists/`

### Useful Links
- [Flutter Documentation](https://docs.flutter.dev/)
- [Effective Dart](https://dart.dev/guides/language/effective-dart)
- [BLoC Library](https://bloclibrary.dev/)
- [Riverpod](https://riverpod.dev/)

## Support

For questions or suggestions:
- Open an issue in the repo
- Contact the lead developer

---

**Version**: 1.0
**Last updated**: 2024-12-03
