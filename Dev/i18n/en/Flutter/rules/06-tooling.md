# Flutter Tooling - Tools and Commands

## Flutter CLI

### Essential Commands

```bash
# Create new project
flutter create my_app
flutter create --org com.company my_app

# Run app
flutter run
flutter run -d chrome        # Web
flutter run -d emulator-5554 # Android emulator
flutter run --release        # Release mode

# Build
flutter build apk           # Android APK
flutter build appbundle     # Android App Bundle
flutter build ios           # iOS
flutter build web           # Web

# Tests
flutter test
flutter test --coverage
flutter test test/unit/specific_test.dart

# Analysis and format
flutter analyze
flutter format lib/ test/
dart fix --dry-run          # See possible fixes
dart fix --apply            # Apply fixes

# Cleaning
flutter clean
flutter pub cache clean
```

### Pub commands

```bash
# Dependency management
flutter pub get              # Download dependencies
flutter pub upgrade          # Update
flutter pub outdated         # See outdated packages
flutter pub deps             # Dependency tree

# Code generation
flutter pub run build_runner build --delete-conflicting-outputs
flutter pub run build_runner watch  # Watch mode
```

---

## Docker for Flutter

### Dockerfile

```dockerfile
# Dockerfile.flutter
FROM ghcr.io/cirruslabs/flutter:stable

WORKDIR /app

# Copy pubspec
COPY pubspec.yaml pubspec.lock ./

# Install dependencies
RUN flutter pub get

# Copy source code
COPY . .

# Generate code if necessary
RUN flutter pub run build_runner build --delete-conflicting-outputs

# Default command
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

help: ## Show help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

setup: ## Install dependencies
	$(FLUTTER) pub get

run: ## Run application
	$(FLUTTER) run

build-apk: ## Build Android APK
	$(FLUTTER) build apk --release

build-appbundle: ## Build Android App Bundle
	$(FLUTTER) build appbundle --release

build-ios: ## Build iOS
	$(FLUTTER) build ios --release

build-web: ## Build Web
	$(FLUTTER) build web --release

test: ## Run all tests
	$(FLUTTER) test

test-unit: ## Unit tests only
	$(FLUTTER) test test/unit/

test-widget: ## Widget tests only
	$(FLUTTER) test test/widget/

test-integration: ## Integration tests
	$(FLUTTER) test integration_test/

test-coverage: ## Tests with coverage
	$(FLUTTER) test --coverage
	@echo "Coverage report: coverage/lcov.info"

analyze: ## Analyze code
	$(FLUTTER) analyze

format: ## Format code
	$(DART) format lib/ test/

format-check: ## Check formatting
	$(DART) format --output=none --set-exit-if-changed lib/ test/

fix: ## Apply automatic fixes
	$(DART) fix --apply

generate: ## Generate code (freezed, json_serializable, etc.)
	$(FLUTTER) pub run build_runner build --delete-conflicting-outputs

generate-watch: ## Generate code in watch mode
	$(FLUTTER) pub run build_runner watch --delete-conflicting-outputs

clean: ## Clean project
	$(FLUTTER) clean
	rm -rf build/
	rm -rf .dart_tool/

clean-all: clean ## Complete clean
	rm -rf .flutter-plugins
	rm -rf .flutter-plugins-dependencies
	rm -rf pubspec.lock

upgrade: ## Update dependencies
	$(FLUTTER) pub upgrade

outdated: ## Check outdated dependencies
	$(FLUTTER) pub outdated

docker-build: ## Build Docker image
	docker build -t my-flutter-app -f Dockerfile.flutter .

docker-run: ## Run in Docker
	docker run --rm -it -v $(PWD):/app my-flutter-app flutter run

docker-test: ## Tests in Docker
	docker run --rm -v $(PWD):/app my-flutter-app flutter test

docker-shell: ## Interactive shell in Docker
	docker run --rm -it -v $(PWD):/app my-flutter-app /bin/bash

ci: analyze format-check test ## Complete CI pipeline
	@echo " CI passed!"
```

---

## FVM - Flutter Version Management

### Installation

```bash
# macOS/Linux
brew tap leoafarias/fvm
brew install fvm

# Or with pub
dart pub global activate fvm
```

### Configuration

```bash
# Initialize FVM in project
fvm install stable
fvm use stable

# Specific versions
fvm install 3.16.0
fvm use 3.16.0

# List versions
fvm list
fvm releases
```

### .fvmrc

```json
{
  "flutter": "3.16.0"
}
```

### Modify Makefile for FVM

```makefile
# Use FVM if available
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

## Useful Scripts

### scripts/setup.sh

```bash
#!/bin/bash
set -e

echo "=� Flutter project setup..."

# Check Flutter
if ! command -v flutter &> /dev/null; then
    echo "L Flutter is not installed"
    exit 1
fi

echo "=� Installing dependencies..."
flutter pub get

echo "=' Generating code..."
flutter pub run build_runner build --delete-conflicting-outputs

echo " Setup complete!"
```

### scripts/test_all.sh

```bash
#!/bin/bash
set -e

echo ">� Running all tests..."

echo "1� Unit tests..."
flutter test test/unit/

echo "2� Widget tests..."
flutter test test/widget/

echo "3� Integration tests..."
flutter test integration_test/

echo "=� Generating coverage..."
flutter test --coverage

echo " All tests passed!"
```

### scripts/build_all.sh

```bash
#!/bin/bash
set -e

echo "<� Building all platforms..."

echo "=� Android APK..."
flutter build apk --release

echo "=� Android App Bundle..."
flutter build appbundle --release

echo "<N iOS..."
flutter build ios --release

echo "< Web..."
flutter build web --release

echo " Builds complete!"
echo "=� Files available in build/"
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

### Launch DevTools

```bash
# From running app
flutter pub global activate devtools
flutter pub global run devtools

# Or in app
# 1. flutter run
# 2. Press 'v' to open DevTools
```

### DevTools Features

- **Inspector**: Widget tree, layout explorer
- **Performance**: Frame rendering, timeline
- **Memory**: Heap snapshot, memory tracking
- **Network**: HTTP requests monitoring
- **Logging**: Console logs
- **App size**: App size analysis

---

## Daily Useful Commands

```bash
# Daily development workflow

# 1. Update dependencies
make setup

# 2. Generate code
make generate

# 3. Run app
make run

# 4. Tests during dev
make test-unit

# 5. Before commit
make ci

# 6. Build release
make build-apk
```

---

## Flutter 3.44 Watchpoints (2026)

### SwiftPM default on iOS

Flutter 3.44+ uses **Swift Package Manager (SwiftPM)** as the default iOS plugin manager, replacing CocoaPods (still supported but deprecated for new projects).

```bash
# Verify SwiftPM migration
flutter pub upgrade
flutter build ios  # auto-generates Package.swift

# If plugin is not SwiftPM-compatible (legacy CocoaPods only)
flutter config --no-use-swift-package-manager
```

```yaml
# pubspec.yaml — disable SwiftPM for legacy plugin
flutter:
  use-swift-package-manager: false
```

**Impact:** plugins without SwiftPM support require `use-swift-package-manager: false` or migration by the plugin author. Most official pub.dev plugins already support SwiftPM since Flutter 3.22+.

**Source:** https://docs.flutter.dev/packages-and-plugins/swift-package-manager/for-app-developers

### Android Gradle Plugin (AGP) 9

Flutter 3.44 requires **AGP 9.0+**. Update `android/build.gradle`:

```groovy
// android/build.gradle
buildscript {
  dependencies {
    classpath 'com.android.tools.build:gradle:9.0.0'  // AGP 9
  }
}
```

```properties
# android/gradle/wrapper/gradle-wrapper.properties
distributionUrl=https\://services.gradle.org/distributions/gradle-9.0-bin.zip
```

**Breaking AGP 9:** `android.enableR8.fullMode=true` is on by default (more aggressive proguard); check keep rules for reflection.

### Material / Cupertino Deprecations (Flutter 3.44)

Several legacy components are deprecated:

```dart
// ❌ Deprecated — MaterialButton
MaterialButton(onPressed: () {}, child: Text('OK'));
// ✅ Use ElevatedButton / FilledButton / OutlinedButton / TextButton

// ❌ Deprecated — FlatButton / RaisedButton (removed since 3.0, warning if still present)
// ✅ Migrate to TextButton / ElevatedButton

// ❌ Deprecated — CupertinoTextField without explicit padding (behavior changed)
// ✅ Specify padding: EdgeInsets.symmetric(...)

// ❌ Deprecated — showDialog without barrierDismissible: false for critical dialogs
// ✅ Always specify barrierDismissible explicitly

// ❌ Deprecated — ThemeData.colorSchemeSeed + primarySwatch together
// ✅ Use ColorScheme.fromSeed() only
```

Run `dart fix --apply` to automatically migrate detectable deprecations.

---

*These tools and configurations optimize the Flutter development workflow.*
