# Ferramentas de Qualidade Flutter

## Dart Analyze

### Configurar analysis_options.yaml

```yaml
include: package:flutter_lints/flutter.yaml

analyzer:
  exclude:
    - "**/*.g.dart"
    - "**/*.freezed.dart"
    - "build/**"
    - "lib/generated/**"

  errors:
    invalid_annotation_target: ignore
    missing_required_param: error
    missing_return: error
    todo: ignore

  language:
    strict-casts: true
    strict-inference: true
    strict-raw-types: true

linter:
  rules:
    # Erros
    - avoid_dynamic_calls
    - avoid_empty_else
    - avoid_relative_lib_imports
    - avoid_slow_async_io
    - avoid_type_to_string
    - cancel_subscriptions
    - close_sinks
    - valid_regexps

    # Estilo
    - always_declare_return_types
    - always_put_control_body_on_new_line
    - always_put_required_named_parameters_first
    - always_use_package_imports
    - avoid_print
    - avoid_unnecessary_containers
    - prefer_const_constructors
    - prefer_const_declarations
    - prefer_final_fields
    - prefer_final_locals
    - prefer_single_quotes
    - require_trailing_commas
    - use_key_in_widget_constructors
```

### Comandos

```bash
# Analisar código
flutter analyze

# Analisar com verbosidade
flutter analyze --verbose

# Analisar arquivo específico
flutter analyze lib/features/auth/

# Modo CI
flutter analyze --no-pub --fatal-infos
```

---

## DCM (Dart Code Metrics)

### Instalação

```yaml
# pubspec.yaml
dev_dependencies:
  dart_code_metrics: ^5.7.0
```

### Configuração

```yaml
# analysis_options.yaml
dart_code_metrics:
  anti-patterns:
    - long-method
    - long-parameter-list
  metrics:
    cyclomatic-complexity: 20
    number-of-parameters: 4
    maximum-nesting-level: 5
  metrics-exclude:
    - test/**
    - "**/*.g.dart"
    - "**/*.freezed.dart"
  rules:
    - avoid-returning-widgets
    - avoid-unnecessary-setstate
    - prefer-conditional-expressions
    - prefer-moving-to-variable
    - prefer-extracting-callbacks
```

### Comandos

```bash
# Analisar
dart run dart_code_metrics:metrics analyze lib

# Verificar arquivos não utilizados
dart run dart_code_metrics:metrics check-unused-files lib

# Verificar código não utilizado
dart run dart_code_metrics:metrics check-unused-code lib
```

---

## Very Good Analysis

```yaml
# pubspec.yaml
dev_dependencies:
  very_good_analysis: ^5.1.0
```

```yaml
# analysis_options.yaml
include: package:very_good_analysis/analysis_options.yaml
```

---

## Flutter Lints

```yaml
dev_dependencies:
  flutter_lints: ^3.0.0
```

---

## Regras de Lint Personalizadas

```dart
// custom_lints/lib/custom_lints.dart

import 'package:custom_lint_builder/custom_lint_builder.dart';

 PluginBase createPlugin() => _ExamplePlugin();

class _ExamplePlugin extends PluginBase {
  @override
  List<LintRule> getLintRules(CustomLintConfigs configs) => [
        NoHardcodedStringsRule(),
      ];
}

class NoHardcodedStringsRule extends DartLintRule {
  NoHardcodedStringsRule() : super(code: _code);

  static const _code = LintCode(
    name: 'no_hardcoded_strings',
    problemMessage: 'Evite strings codificadas diretamente, use localização',
  );

  @override
  void run(
    CustomLintResolver resolver,
    ErrorReporter reporter,
    CustomLintContext context,
  ) {
    context.registry.addStringLiteral((node) {
      // Lógica para detectar strings codificadas diretamente em widgets Text
      reporter.reportErrorForNode(code, node);
    });
  }
}
```

---

## Integração CI/CD

```yaml
# .github/workflows/quality.yml
name: Quality Checks

on: [push, pull_request]

jobs:
  analyze:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: subosito/flutter-action@v2
        with:
          flutter-version: '3.16.0'

      - name: Get dependencies
        run: flutter pub get

      - name: Analyze
        run: flutter analyze --fatal-infos

      - name: DCM
        run: dart run dart_code_metrics:metrics analyze lib

      - name: Format check
        run: dart format --output=none --set-exit-if-changed .
```

---

## Makefile

```makefile
quality: analyze format-check dcm ## Todas as verificações de qualidade

analyze: ## Analisar código
	flutter analyze --fatal-infos

dcm: ## Dart Code Metrics
	dart run dart_code_metrics:metrics analyze lib

format-check: ## Verificar formatação
	dart format --output=none --set-exit-if-changed lib/ test/

fix: ## Aplicar correções automáticas
	dart fix --apply
```

---

*Essas ferramentas garantem código Flutter de alta qualidade.*
