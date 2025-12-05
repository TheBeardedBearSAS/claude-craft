# Ferramentas Flutter - Ferramentas e Comandos

## Flutter CLI

### Comandos Essenciais

```bash
# Criar novo projeto
flutter create my_app
flutter create --org com.company my_app

# Executar app
flutter run
flutter run -d chrome        # Web
flutter run -d emulator-5554 # Emulador Android
flutter run --release        # Modo release

# Build
flutter build apk           # Android APK
flutter build appbundle     # Android App Bundle
flutter build ios           # iOS
flutter build web           # Web

# Testes
flutter test
flutter test --coverage
flutter test test/unit/specific_test.dart

# Análise e formato
flutter analyze
flutter format lib/ test/
dart fix --dry-run          # Ver correções possíveis
dart fix --apply            # Aplicar correções

# Limpeza
flutter clean
flutter pub cache clean
```

### Comandos Pub

```bash
# Gerenciamento de dependências
flutter pub get              # Baixar dependências
flutter pub upgrade          # Atualizar
flutter pub outdated         # Ver pacotes desatualizados
flutter pub deps             # Árvore de dependências

# Geração de código
flutter pub run build_runner build --delete-conflicting-outputs
flutter pub run build_runner watch  # Modo watch
```

---

## Docker para Flutter

### Dockerfile

```dockerfile
# Dockerfile.flutter
FROM ghcr.io/cirruslabs/flutter:stable

WORKDIR /app

# Copiar pubspec
COPY pubspec.yaml pubspec.lock ./

# Instalar dependências
RUN flutter pub get

# Copiar código fonte
COPY . .

# Gerar código se necessário
RUN flutter pub run build_runner build --delete-conflicting-outputs

# Comando padrão
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

# Configuração
FLUTTER := docker run --rm -v $(PWD):/app -w /app ghcr.io/cirruslabs/flutter:stable flutter
DART := docker run --rm -v $(PWD):/app -w /app ghcr.io/cirruslabs/flutter:stable dart

help: ## Mostrar ajuda
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

setup: ## Instalar dependências
	$(FLUTTER) pub get

run: ## Executar aplicação
	$(FLUTTER) run

build-apk: ## Build Android APK
	$(FLUTTER) build apk --release

build-appbundle: ## Build Android App Bundle
	$(FLUTTER) build appbundle --release

build-ios: ## Build iOS
	$(FLUTTER) build ios --release

build-web: ## Build Web
	$(FLUTTER) build web --release

test: ## Executar todos os testes
	$(FLUTTER) test

test-unit: ## Somente testes unitários
	$(FLUTTER) test test/unit/

test-widget: ## Somente testes de widget
	$(FLUTTER) test test/widget/

test-integration: ## Testes de integração
	$(FLUTTER) test integration_test/

test-coverage: ## Testes com coverage
	$(FLUTTER) test --coverage
	@echo "Relatório de coverage: coverage/lcov.info"

analyze: ## Analisar código
	$(FLUTTER) analyze

format: ## Formatar código
	$(DART) format lib/ test/

format-check: ## Verificar formatação
	$(DART) format --output=none --set-exit-if-changed lib/ test/

fix: ## Aplicar correções automáticas
	$(DART) fix --apply

generate: ## Gerar código (freezed, json_serializable, etc.)
	$(FLUTTER) pub run build_runner build --delete-conflicting-outputs

generate-watch: ## Gerar código em modo watch
	$(FLUTTER) pub run build_runner watch --delete-conflicting-outputs

clean: ## Limpar projeto
	$(FLUTTER) clean
	rm -rf build/
	rm -rf .dart_tool/

clean-all: clean ## Limpeza completa
	rm -rf .flutter-plugins
	rm -rf .flutter-plugins-dependencies
	rm -rf pubspec.lock

upgrade: ## Atualizar dependências
	$(FLUTTER) pub upgrade

outdated: ## Verificar dependências desatualizadas
	$(FLUTTER) pub outdated

docker-build: ## Build imagem Docker
	docker build -t my-flutter-app -f Dockerfile.flutter .

docker-run: ## Executar em Docker
	docker run --rm -it -v $(PWD):/app my-flutter-app flutter run

docker-test: ## Testes em Docker
	docker run --rm -v $(PWD):/app my-flutter-app flutter test

docker-shell: ## Shell interativo em Docker
	docker run --rm -it -v $(PWD):/app my-flutter-app /bin/bash

ci: analyze format-check test ## Pipeline CI completo
	@echo "CI passou!"
```

---

## FVM - Flutter Version Management

### Instalação

```bash
# macOS/Linux
brew tap leoafarias/fvm
brew install fvm

# Ou com pub
dart pub global activate fvm
```

### Configuração

```bash
# Inicializar FVM no projeto
fvm install stable
fvm use stable

# Versões específicas
fvm install 3.16.0
fvm use 3.16.0

# Listar versões
fvm list
fvm releases
```

### .fvmrc

```json
{
  "flutter": "3.16.0"
}
```

### Modificar Makefile para FVM

```makefile
# Usar FVM se disponível
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

## Scripts Úteis

### scripts/setup.sh

```bash
#!/bin/bash
set -e

echo "Configurando projeto Flutter..."

# Verificar Flutter
if ! command -v flutter &> /dev/null; then
    echo "Flutter não está instalado"
    exit 1
fi

echo "Instalando dependências..."
flutter pub get

echo "Gerando código..."
flutter pub run build_runner build --delete-conflicting-outputs

echo "Configuração completa!"
```

### scripts/test_all.sh

```bash
#!/bin/bash
set -e

echo "Executando todos os testes..."

echo "1. Testes unitários..."
flutter test test/unit/

echo "2. Testes de widget..."
flutter test test/widget/

echo "3. Testes de integração..."
flutter test integration_test/

echo "Gerando coverage..."
flutter test --coverage

echo "Todos os testes passaram!"
```

### scripts/build_all.sh

```bash
#!/bin/bash
set -e

echo "Buildando todas as plataformas..."

echo "Android APK..."
flutter build apk --release

echo "Android App Bundle..."
flutter build appbundle --release

echo "iOS..."
flutter build ios --release

echo "Web..."
flutter build web --release

echo "Builds completos!"
echo "Arquivos disponíveis em build/"
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

## Configuração VS Code

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

### Iniciar DevTools

```bash
# Do app em execução
flutter pub global activate devtools
flutter pub global run devtools

# Ou no app
# 1. flutter run
# 2. Pressione 'v' para abrir DevTools
```

### Recursos do DevTools

- **Inspector**: Árvore de widgets, explorador de layout
- **Performance**: Renderização de frames, timeline
- **Memory**: Snapshot de heap, rastreamento de memória
- **Network**: Monitoramento de requisições HTTP
- **Logging**: Logs do console
- **App size**: Análise de tamanho do app

---

## Comandos Úteis Diários

```bash
# Fluxo de desenvolvimento diário

# 1. Atualizar dependências
make setup

# 2. Gerar código
make generate

# 3. Executar app
make run

# 4. Testes durante dev
make test-unit

# 5. Antes do commit
make ci

# 6. Build release
make build-apk
```

---

*Essas ferramentas e configurações otimizam o fluxo de trabalho de desenvolvimento Flutter.*
