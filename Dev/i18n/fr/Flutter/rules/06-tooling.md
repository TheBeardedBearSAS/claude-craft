# Tooling Flutter - Outils et Commandes

## Flutter CLI

### Commandes essentielles

```bash
# Créer un nouveau projet
flutter create my_app
flutter create --org com.company my_app

# Exécuter l'app
flutter run
flutter run -d chrome        # Web
flutter run -d emulator-5554 # Android emulator
flutter run --release        # Mode release

# Build
flutter build apk           # Android APK
flutter build appbundle     # Android App Bundle
flutter build ios           # iOS
flutter build web           # Web

# Tests
flutter test
flutter test --coverage
flutter test test/unit/specific_test.dart

# Analyse et format
flutter analyze
flutter format lib/ test/
dart fix --dry-run          # Voir les fixes possibles
dart fix --apply            # Appliquer les fixes

# Nettoyage
flutter clean
flutter pub cache clean
```

### Pub commands

```bash
# Gestion des dépendances
flutter pub get              # Télécharger dépendances
flutter pub upgrade          # Mettre à jour
flutter pub outdated         # Voir packages obsolètes
flutter pub deps             # Arbre de dépendances

# Génération de code
flutter pub run build_runner build --delete-conflicting-outputs
flutter pub run build_runner watch  # Mode watch
```

---

## Docker pour Flutter

### Dockerfile

```dockerfile
# Dockerfile.flutter
FROM ghcr.io/cirruslabs/flutter:stable

WORKDIR /app

# Copier pubspec
COPY pubspec.yaml pubspec.lock ./

# Installer dépendances
RUN flutter pub get

# Copier code source
COPY . .

# Générer code si nécessaire
RUN flutter pub run build_runner build --delete-conflicting-outputs

# Commande par défaut
CMD ["flutter", "test"]
```

### docker-compose.yml

```yaml
version: '3.8'

services:
  flutter:
    build:
      context: .
      dockerfile: Dockerfile.flutter
    volumes:
      - .:/app
      - flutter-pub-cache:/root/.pub-cache
    working_dir: /app
    command: flutter test

volumes:
  flutter-pub-cache:
```

---

## Makefile

```makefile
.PHONY: help setup run build test clean analyze format fix generate docker-run docker-test

# Configuration
FLUTTER := docker run --rm -v $(PWD):/app -w /app ghcr.io/cirruslabs/flutter:stable flutter
DART := docker run --rm -v $(PWD):/app -w /app ghcr.io/cirruslabs/flutter:stable dart

help: ## Afficher l'aide
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

setup: ## Installer les dépendances
	$(FLUTTER) pub get

run: ## Lancer l'application
	$(FLUTTER) run

build-apk: ## Build Android APK
	$(FLUTTER) build apk --release

build-appbundle: ## Build Android App Bundle
	$(FLUTTER) build appbundle --release

build-ios: ## Build iOS
	$(FLUTTER) build ios --release

build-web: ## Build Web
	$(FLUTTER) build web --release

test: ## Lancer tous les tests
	$(FLUTTER) test

test-unit: ## Tests unitaires uniquement
	$(FLUTTER) test test/unit/

test-widget: ## Tests de widgets uniquement
	$(FLUTTER) test test/widget/

test-integration: ## Tests d'intégration
	$(FLUTTER) test integration_test/

test-coverage: ## Tests avec coverage
	$(FLUTTER) test --coverage
	@echo "Coverage report: coverage/lcov.info"

analyze: ## Analyser le code
	$(FLUTTER) analyze

format: ## Formater le code
	$(DART) format lib/ test/

format-check: ## Vérifier le formatage
	$(DART) format --output=none --set-exit-if-changed lib/ test/

fix: ## Appliquer les fixes automatiques
	$(DART) fix --apply

generate: ## Générer le code (freezed, json_serializable, etc.)
	$(FLUTTER) pub run build_runner build --delete-conflicting-outputs

generate-watch: ## Générer le code en mode watch
	$(FLUTTER) pub run build_runner watch --delete-conflicting-outputs

clean: ## Nettoyer le projet
	$(FLUTTER) clean
	rm -rf build/
	rm -rf .dart_tool/

clean-all: clean ## Nettoyage complet
	rm -rf .flutter-plugins
	rm -rf .flutter-plugins-dependencies
	rm -rf pubspec.lock

upgrade: ## Mettre à jour les dépendances
	$(FLUTTER) pub upgrade

outdated: ## Vérifier les dépendances obsolètes
	$(FLUTTER) pub outdated

docker-build: ## Build l'image Docker
	docker build -t my-flutter-app -f Dockerfile.flutter .

docker-run: ## Lancer dans Docker
	docker run --rm -it -v $(PWD):/app my-flutter-app flutter run

docker-test: ## Tests dans Docker
	docker run --rm -v $(PWD):/app my-flutter-app flutter test

docker-shell: ## Shell interactif dans Docker
	docker run --rm -it -v $(PWD):/app my-flutter-app /bin/bash

ci: analyze format-check test ## Pipeline CI complète
	@echo "✅ CI passed!"
```

---

## FVM - Flutter Version Management

### Installation

```bash
# macOS/Linux
brew tap leoafarias/fvm
brew install fvm

# Ou avec pub
dart pub global activate fvm
```

### Configuration

```bash
# Initialiser FVM dans le projet
fvm install stable
fvm use stable

# Versions spécifiques
fvm install 3.16.0
fvm use 3.16.0

# Lister versions
fvm list
fvm releases
```

### .fvmrc

```json
{
  "flutter": "3.16.0"
}
```

### Modifier Makefile pour FVM

```makefile
# Utiliser FVM si disponible
FLUTTER_CMD := $(shell command -v fvm 2> /dev/null)
ifdef FLUTTER_CMD
    FLUTTER := fvm flutter
    DART := fvm dart
else
    FLUTTER := flutter
    DART := dart
endif
```

---

## Scripts utiles

### scripts/setup.sh

```bash
#!/bin/bash
set -e

echo "🚀 Setup du projet Flutter..."

# Vérifier Flutter
if ! command -v flutter &> /dev/null; then
    echo "❌ Flutter n'est pas installé"
    exit 1
fi

echo "📦 Installation des dépendances..."
flutter pub get

echo "🔧 Génération du code..."
flutter pub run build_runner build --delete-conflicting-outputs

echo "✅ Setup terminé!"
```

### scripts/test_all.sh

```bash
#!/bin/bash
set -e

echo "🧪 Lancement de tous les tests..."

echo "1️⃣ Tests unitaires..."
flutter test test/unit/

echo "2️⃣ Tests de widgets..."
flutter test test/widget/

echo "3️⃣ Tests d'intégration..."
flutter test integration_test/

echo "📊 Génération du coverage..."
flutter test --coverage

echo "✅ Tous les tests passés!"
```

### scripts/build_all.sh

```bash
#!/bin/bash
set -e

echo "🏗️ Build de toutes les plateformes..."

echo "📱 Android APK..."
flutter build apk --release

echo "📱 Android App Bundle..."
flutter build appbundle --release

echo "🍎 iOS..."
flutter build ios --release

echo "🌐 Web..."
flutter build web --release

echo "✅ Builds terminés!"
echo "📦 Fichiers disponibles dans build/"
```

---

## CI/CD

### GitHub Actions

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Flutter
        uses: subosito/flutter-action@v2
        with:
          flutter-version: '3.16.0'
          channel: 'stable'

      - name: Get dependencies
        run: flutter pub get

      - name: Analyze
        run: flutter analyze

      - name: Format check
        run: dart format --output=none --set-exit-if-changed lib/ test/

      - name: Run tests
        run: flutter test --coverage

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: coverage/lcov.info

  build-android:
    needs: test
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Flutter
        uses: subosito/flutter-action@v2
        with:
          flutter-version: '3.16.0'

      - name: Build APK
        run: flutter build apk --release

      - name: Upload APK
        uses: actions/upload-artifact@v3
        with:
          name: release-apk
          path: build/app/outputs/flutter-apk/app-release.apk
```

### GitLab CI

```yaml
# .gitlab-ci.yml
image: ghcr.io/cirruslabs/flutter:stable

stages:
  - test
  - build

before_script:
  - flutter pub get

test:
  stage: test
  script:
    - flutter analyze
    - dart format --output=none --set-exit-if-changed lib/ test/
    - flutter test --coverage
  coverage: '/lines\.*: \d+\.\d+\%/'
  artifacts:
    paths:
      - coverage/

build:android:
  stage: build
  script:
    - flutter build apk --release
  artifacts:
    paths:
      - build/app/outputs/flutter-apk/app-release.apk
  only:
    - main
    - tags
```

---

## VS Code Configuration

### .vscode/settings.json

```json
{
  "dart.flutterSdkPath": ".fvm/flutter_sdk",
  "search.exclude": {
    "**/.fvm": true
  },
  "files.watcherExclude": {
    "**/.fvm": true
  },
  "dart.lineLength": 80,
  "editor.formatOnSave": true,
  "editor.rulers": [80],
  "[dart]": {
    "editor.defaultFormatter": "Dart-Code.dart-code",
    "editor.formatOnSave": true,
    "editor.selectionHighlight": false,
    "editor.suggest.snippetsPreventQuickSuggestions": false,
    "editor.suggestSelection": "first",
    "editor.tabCompletion": "onlySnippets",
    "editor.wordBasedSuggestions": false
  }
}
```

### .vscode/launch.json

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Flutter (Development)",
      "request": "launch",
      "type": "dart",
      "args": ["--dart-define", "ENVIRONMENT=dev"]
    },
    {
      "name": "Flutter (Staging)",
      "request": "launch",
      "type": "dart",
      "args": ["--dart-define", "ENVIRONMENT=staging"]
    },
    {
      "name": "Flutter (Production)",
      "request": "launch",
      "type": "dart",
      "args": ["--dart-define", "ENVIRONMENT=production"]
    }
  ]
}
```

---

## DevTools

### Lancer DevTools

```bash
# Depuis l'app en cours
flutter pub global activate devtools
flutter pub global run devtools

# Ou dans l'app
# 1. flutter run
# 2. Presser 'v' pour ouvrir DevTools
```

### Fonctionnalités DevTools

- **Inspector** : Arbre de widgets, layout explorer
- **Performance** : Frame rendering, timeline
- **Memory** : Heap snapshot, memory tracking
- **Network** : Requêtes HTTP monitoring
- **Logging** : Console logs
- **App size** : Analyse de la taille de l'app

---

## Commandes utiles quotidiennes

```bash
# Workflow de développement quotidien

# 1. Mettre à jour dépendances
make setup

# 2. Générer code
make generate

# 3. Lancer app
make run

# 4. Tests pendant dev
make test-unit

# 5. Avant commit
make ci

# 6. Build release
make build-apk
```

---

*Ces outils et configurations optimisent le workflow de développement Flutter.*
