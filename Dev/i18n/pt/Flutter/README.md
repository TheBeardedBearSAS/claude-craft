# Flutter Development Rules para Claude Code

Estrutura completa de regras de desenvolvimento Flutter para Claude Code.

## Estrutura

```
Flutter/
├── CLAUDE.md.template          # Template principal para copiar em cada projeto
├── README.md                   # Este arquivo
│
├── rules/                      # Regras detalhadas (13 arquivos)
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
├── templates/                  # Templates de código
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

## Uso

### 1. Novo Projeto Flutter

```bash
# Criar projeto Flutter
flutter create mon_projet
cd mon_projet

# Criar pasta .claude
mkdir -p .claude

# Copiar CLAUDE.md.template
cp /path/to/Flutter/CLAUDE.md.template .claude/CLAUDE.md

# Copiar rules (opcional mas recomendado)
cp -r /path/to/Flutter/rules .claude/
cp -r /path/to/Flutter/templates .claude/
cp -r /path/to/Flutter/checklists .claude/
```

### 2. Personalizar CLAUDE.md

Substituir os placeholders em `.claude/CLAUDE.md`:

- `{{PROJECT_NAME}}` : Nome do projeto
- `{{TECH_STACK}}` : Stack técnica (ex: Flutter 3.16 + Firebase + Stripe)
- `{{STATE_MANAGEMENT_PATTERN}}` : BLoC / Riverpod / Provider
- `{{STATE_MANAGEMENT_DEPENDENCIES}}` : Dependências para state management
- `{{LEAD_DEVELOPER}}` : Nome do lead dev
- `{{REPOSITORY_URL}}` : URL do repositório
- `{{CI_CD_PLATFORM}}` : GitHub Actions / GitLab CI / etc.
- `{{DOCS_URL}}` : URL da documentação
- `{{UPDATE_DATE}}` : Data da última atualização

### 3. Personalizar 00-project-context.md

Copiar `rules/00-project-context.md.template` e preencher:

```bash
cp .claude/rules/00-project-context.md.template .claude/rules/00-project-context.md
```

Substituir os placeholders com as informações específicas do projeto.

### 4. Estrutura recomendada do projeto

```
mon_projet/
├── .claude/
│   ├── CLAUDE.md               # Regras principais
│   ├── rules/                  # Regras detalhadas
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
├── Makefile                    # Comandos Docker
├── Dockerfile.flutter
├── docker-compose.yml
├── .env.example
├── .gitignore
├── analysis_options.yaml
├── pubspec.yaml
└── README.md
```

## Makefile Padrão

Criar um `Makefile` na raiz do projeto:

```makefile
.PHONY: help setup run test clean analyze format

# Docker Flutter
FLUTTER := docker run --rm -v $(PWD):/app -w /app ghcr.io/cirruslabs/flutter:stable flutter
DART := docker run --rm -v $(PWD):/app -w /app ghcr.io/cirruslabs/flutter:stable dart

help: ## Exibir ajuda
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

setup: ## Instalar dependências
	$(FLUTTER) pub get

run: ## Executar app
	$(FLUTTER) run

test: ## Todos os testes
	$(FLUTTER) test

test-coverage: ## Testes com coverage
	$(FLUTTER) test --coverage

analyze: ## Analisar código
	$(FLUTTER) analyze

format: ## Formatar código
	$(DART) format lib/ test/

generate: ## Gerar código
	$(FLUTTER) pub run build_runner build --delete-conflicting-outputs

clean: ## Limpar
	$(FLUTTER) clean

ci: analyze format test ## Pipeline CI
	@echo "✅ CI passed!"
```

## Arquivos de Configuração

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

## Workflow de Desenvolvimento

### 1. Nova Feature

```bash
# 1. Criar branch
git checkout -b feature/ma-feature

# 2. Ler regras
cat .claude/rules/01-workflow-analysis.md
cat .claude/checklists/new-feature.md

# 3. Desenvolver seguindo Clean Architecture
# 4. Testes em paralelo
make test

# 5. Verificar qualidade
make ci

# 6. Commit
git commit -m "feat(feature): add ma feature"

# 7. Push e PR
git push origin feature/ma-feature
```

### 2. Bugfix

```bash
# 1. Branch
git checkout -b fix/mon-bug

# 2. Reproduzir com teste
# 3. Corrigir
# 4. Verificar
make test

# 5. Commit
git commit -m "fix(module): resolve mon bug"
```

## Comandos Diários

```bash
# Morning routine
make setup          # Update dependencies
make generate       # Generate code
make run            # Run app

# Desenvolvimento
make test-unit      # Tests pendant dev
make analyze        # Verificar código

# Antes do commit
make ci             # Pipeline completa

# Build release
make build-apk
```

## Recursos

### Documentação
- Regras detalhadas: `.claude/rules/`
- Templates de código: `.claude/templates/`
- Checklists: `.claude/checklists/`

### Links Úteis
- [Flutter Documentation](https://docs.flutter.dev/)
- [Effective Dart](https://dart.dev/guides/language/effective-dart)
- [BLoC Library](https://bloclibrary.dev/)
- [Riverpod](https://riverpod.dev/)

## Suporte

Para perguntas ou sugestões:
- Abrir uma issue no repositório
- Contatar o lead developer

---

**Versão** : 1.0
**Última atualização** : 2024-12-03
