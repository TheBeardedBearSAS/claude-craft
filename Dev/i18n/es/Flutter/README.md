# Reglas de Desarrollo Flutter para Claude Code

Estructura completa de reglas de desarrollo Flutter para Claude Code.

## Estructura

```
Flutter/
├── CLAUDE.md.template          # Plantilla principal para copiar en cada proyecto
├── README.md                   # Este archivo
│
├── rules/                      # Reglas detalladas (13 archivos)
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
├── templates/                  # Plantillas de código
│   ├── widget.md
│   ├── bloc.md
│   ├── repository.md
│   ├── test-widget.md
│   └── test-unit.md
│
└── checklists/                 # Listas de verificación
    ├── pre-commit.md
    ├── new-feature.md
    ├── refactoring.md
    └── security.md
```

## Uso

### 1. Nuevo Proyecto Flutter

```bash
# Crear proyecto Flutter
flutter create mon_projet
cd mon_projet

# Crear carpeta .claude
mkdir -p .claude

# Copiar CLAUDE.md.template
cp /path/to/Flutter/CLAUDE.md.template .claude/CLAUDE.md

# Copiar rules (opcional pero recomendado)
cp -r /path/to/Flutter/rules .claude/
cp -r /path/to/Flutter/templates .claude/
cp -r /path/to/Flutter/checklists .claude/
```

### 2. Personalizar CLAUDE.md

Reemplazar los placeholders en `.claude/CLAUDE.md`:

- `{{PROJECT_NAME}}`: Nombre del proyecto
- `{{TECH_STACK}}`: Stack técnico (ej: Flutter 3.16 + Firebase + Stripe)
- `{{STATE_MANAGEMENT_PATTERN}}`: BLoC / Riverpod / Provider
- `{{STATE_MANAGEMENT_DEPENDENCIES}}`: Dependencias para gestión de estado
- `{{LEAD_DEVELOPER}}`: Nombre del líder de desarrollo
- `{{REPOSITORY_URL}}`: URL del repositorio
- `{{CI_CD_PLATFORM}}`: GitHub Actions / GitLab CI / etc.
- `{{DOCS_URL}}`: URL de la documentación
- `{{UPDATE_DATE}}`: Fecha de última actualización

### 3. Personalizar 00-project-context.md

Copiar `rules/00-project-context.md.template` y completar:

```bash
cp .claude/rules/00-project-context.md.template .claude/rules/00-project-context.md
```

Reemplazar los placeholders con información específica del proyecto.

### 4. Estructura de proyecto recomendada

```
mon_projet/
├── .claude/
│   ├── CLAUDE.md               # Reglas principales
│   ├── rules/                  # Reglas detalladas
│   ├── templates/              # Plantillas
│   └── checklists/             # Listas de verificación
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

## Makefile Estándar

Crear un `Makefile` en la raíz del proyecto:

```makefile
.PHONY: help setup run test clean analyze format

# Docker Flutter
FLUTTER := docker run --rm -v $(PWD):/app -w /app ghcr.io/cirruslabs/flutter:stable flutter
DART := docker run --rm -v $(PWD):/app -w /app ghcr.io/cirruslabs/flutter:stable dart

help: ## Mostrar ayuda
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

setup: ## Instalar dependencias
	$(FLUTTER) pub get

run: ## Ejecutar app
	$(FLUTTER) run

test: ## Todas las pruebas
	$(FLUTTER) test

test-coverage: ## Pruebas con cobertura
	$(FLUTTER) test --coverage

analyze: ## Analizar código
	$(FLUTTER) analyze

format: ## Formatear código
	$(DART) format lib/ test/

generate: ## Generar código
	$(FLUTTER) pub run build_runner build --delete-conflicting-outputs

clean: ## Limpiar
	$(FLUTTER) clean

ci: analyze format test ## Pipeline CI
	@echo "✅ CI passed!"
```

## Archivos de Configuración

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

## Flujo de Trabajo de Desarrollo

### 1. Nueva Funcionalidad

```bash
# 1. Crear rama
git checkout -b feature/ma-feature

# 2. Leer reglas
cat .claude/rules/01-workflow-analysis.md
cat .claude/checklists/new-feature.md

# 3. Desarrollar siguiendo Clean Architecture
# 4. Pruebas en paralelo
make test

# 5. Verificar calidad
make ci

# 6. Commit
git commit -m "feat(feature): add ma feature"

# 7. Push y PR
git push origin feature/ma-feature
```

### 2. Corrección de Errores

```bash
# 1. Rama
git checkout -b fix/mon-bug

# 2. Reproducir con test
# 3. Corregir
# 4. Verificar
make test

# 5. Commit
git commit -m "fix(module): resolve mon bug"
```

## Comandos Diarios

```bash
# Rutina matutina
make setup          # Actualizar dependencias
make generate       # Generar código
make run            # Ejecutar app

# Desarrollo
make test-unit      # Pruebas durante desarrollo
make analyze        # Verificar código

# Antes del commit
make ci             # Pipeline completo

# Build release
make build-apk
```

## Recursos

### Documentación
- Reglas detalladas: `.claude/rules/`
- Plantillas de código: `.claude/templates/`
- Listas de verificación: `.claude/checklists/`

### Enlaces Útiles
- [Flutter Documentation](https://docs.flutter.dev/)
- [Effective Dart](https://dart.dev/guides/language/effective-dart)
- [BLoC Library](https://bloclibrary.dev/)
- [Riverpod](https://riverpod.dev/)

## Soporte

Para preguntas o sugerencias:
- Abrir un issue en el repositorio
- Contactar al líder de desarrollo

---

**Versión**: 1.0
**Última actualización**: 2024-12-03
