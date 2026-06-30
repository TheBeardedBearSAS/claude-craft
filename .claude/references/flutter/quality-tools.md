# Flutter Quality Tools

## Dart Analyze

### Configure analysis_options.yaml

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
    # Errors
    - avoid_dynamic_calls
    - avoid_empty_else
    - avoid_relative_lib_imports
    - avoid_slow_async_io
    - avoid_type_to_string
    - cancel_subscriptions
    - close_sinks
    - valid_regexps

    # Style
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

### Commands

```bash
# Analyze code
flutter analyze

# Analyze with verbosity
flutter analyze --verbose

# Analyze specific file
flutter analyze lib/features/auth/

# CI mode
flutter analyze --no-pub --fatal-infos
```

---

## DCM (Dart Code Metrics)

> **Important :** `dart_code_metrics` sur pub.dev est le package **legacy** (open-source, non maintenu activement).
> DCM est désormais un **outil commercial séparé** distribué via [dcm.dev](https://dcm.dev/) (binaire natif, licence requise).
> La base gratuite recommandée est `dart analyze` + `flutter analyze` + les lints officiels (`flutter_lints` / `very_good_analysis`).

### Base gratuite (recommandée)

`dart analyze` et `flutter analyze` couvrent l'analyse statique sans aucune dépendance externe.
Compléter avec `flutter_lints` ou `very_good_analysis` pour des règles de lint strictes (voir sections dédiées).

### DCM commercial (optionnel)

Si votre équipe dispose d'une licence DCM ([dcm.dev/pricing](https://dcm.dev/pricing/)) :

```bash
# Installation du binaire DCM (pas via pub.dev)
# Voir https://dcm.dev/docs/getting-started/installation/

# Analyser le code
dcm analyze lib

# Vérifier les fichiers inutilisés
dcm check-unused-files lib

# Vérifier le code inutilisé
dcm check-unused-code lib
```

```yaml
# analysis_options.yaml (avec licence DCM)
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

> **Ne pas ajouter** `dart_code_metrics` dans `pubspec.yaml` comme dépendance pub — le package pub.dev legacy est abandonné.
> Utiliser le binaire officiel `dcm` disponible sur [dcm.dev](https://dcm.dev/).

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
  flutter_lints: ^5.0.0  # Flutter 3.44 / Dart 3.12+ (v3.x ne couvre pas les sealed classes et dot shorthands)
```

---

## Custom Lint Rules

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
    problemMessage: 'Avoid hardcoded strings, use localization',
  );

  @override
  void run(
    CustomLintResolver resolver,
    ErrorReporter reporter,
    CustomLintContext context,
  ) {
    context.registry.addStringLiteral((node) {
      // Logic to detect hardcoded strings in Text widgets
      reporter.reportErrorForNode(code, node);
    });
  }
}
```

---

## CI/CD Integration

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
          flutter-version: '3.44.0'

      - name: Get dependencies
        run: flutter pub get

      - name: Analyze
        run: flutter analyze --fatal-infos

      # DCM est optionnel et commercial (dcm.dev) — retirer si pas de licence
      # - name: DCM
      #   run: dcm analyze lib

      - name: Format check
        run: dart format --output=none --set-exit-if-changed .
```

---

## Makefile

```makefile
quality: analyze format-check ## All quality checks (add dcm if licensed)

analyze: ## Analyze code
	flutter analyze --fatal-infos

# dcm: ## DCM (optionnel, licence commerciale requise — dcm.dev)
# 	dcm analyze lib

format-check: ## Check formatting
	dart format --output=none --set-exit-if-changed lib/ test/

fix: ## Apply automatic fixes
	dart fix --apply
```

---

*These tools ensure high-quality Flutter code.*
