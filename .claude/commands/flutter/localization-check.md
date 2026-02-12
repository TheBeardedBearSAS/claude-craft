---
description: Vérification des Traductions
argument-hint: [arguments]
---

# Vérification des Traductions

Tu es un développeur Flutter senior. Tu dois vérifier la complétude et la cohérence des traductions (i18n) du projet.

## Arguments
$ARGUMENTS

Arguments :
- (Optionnel) Langue à vérifier (ex: `fr`, `en`, `all`)

Exemple : `/flutter:localization-check all`

## MISSION

### Étape 1 : Identifier la Configuration i18n

```yaml
# pubspec.yaml
dependencies:
  flutter_localizations:
    sdk: flutter
  intl: ^0.19.0

flutter:
  generate: true

# l10n.yaml
arb-dir: lib/l10n
template-arb-file: app_en.arb
output-localization-file: app_localizations.dart
output-class: AppLocalizations
```

### Étape 2 : Analyser les Fichiers ARB

```bash
# Lister les fichiers de traduction
ls -la lib/l10n/

# Générer les fichiers Dart
flutter gen-l10n
```

### Étape 3 : Vérifier les Clés

```dart
// Script de vérification (à exécuter manuellement ou via test)
import 'dart:convert';
import 'dart:io';

void main() {
  final arbFiles = Directory('lib/l10n')
      .listSync()
      .whereType<File>()
      .where((f) => f.path.endsWith('.arb'));

  final Map<String, Map<String, dynamic>> translations = {};

  for (final file in arbFiles) {
    final lang = file.path.split('app_').last.replaceAll('.arb', '');
    final content = jsonDecode(file.readAsStringSync()) as Map<String, dynamic>;
    translations[lang] = content;
  }

  // Trouver la langue de référence (template)
  final reference = translations['en']!;
  final referenceKeys = reference.keys
      .where((k) => !k.startsWith('@'))
      .toSet();

  print('Reference language: en');
  print('Keys count: ${referenceKeys.length}');
  print('');

  for (final entry in translations.entries) {
    if (entry.key == 'en') continue;

    final keys = entry.value.keys
        .where((k) => !k.startsWith('@'))
        .toSet();

    final missing = referenceKeys.difference(keys);
    final extra = keys.difference(referenceKeys);

    print('Language: ${entry.key}');
    print('  Keys: ${keys.length}');
    print('  Missing: ${missing.length}');
    print('  Extra: ${extra.length}');

    if (missing.isNotEmpty) {
      print('  Missing keys:');
      for (final key in missing) {
        print('    - $key');
      }
    }
    print('');
  }
}
```

### Étape 4 : Vérifier l'Utilisation

```bash
# Rechercher les clés hardcodées
grep -rn "Text('" lib/ --include="*.dart" | grep -v "AppLocalizations"
grep -rn 'Text("' lib/ --include="*.dart" | grep -v "AppLocalizations"

# Rechercher les usages corrects
grep -rn "AppLocalizations.of(context)" lib/ --include="*.dart"
grep -rn "context.l10n" lib/ --include="*.dart"  # Si extension
```

### Étape 5 : Générer le Rapport

```
══════════════════════════════════════════════════════════════
🌍 RAPPORT LOCALISATION
══════════════════════════════════════════════════════════════

──────────────────────────────────────────────────────────────
📊 RÉSUMÉ
──────────────────────────────────────────────────────────────

| Langue | Clés | Complétude | Status |
|--------|------|------------|--------|
| en (ref) | 145 | 100% | ✅ |
| fr | 142 | 98% | ⚠️ |
| de | 130 | 90% | ⚠️ |
| es | 145 | 100% | ✅ |
| ja | 120 | 83% | ❌ |

──────────────────────────────────────────────────────────────
❌ CLÉS MANQUANTES
──────────────────────────────────────────────────────────────

### fr (3 clés manquantes)

| Clé | Valeur EN | Priorité |
|-----|-----------|----------|
| `orderCancelled` | "Order cancelled" | Haute |
| `paymentFailed` | "Payment failed" | Haute |
| `retryButton` | "Retry" | Moyenne |

### de (15 clés manquantes)

| Clé | Valeur EN | Priorité |
|-----|-----------|----------|
| `settingsTitle` | "Settings" | Haute |
| `profileSection` | "Profile" | Moyenne |
| ... | ... | ... |

### ja (25 clés manquantes)

[Liste complète dans le fichier report_ja.md]

──────────────────────────────────────────────────────────────
⚠️ CLÉS NON UTILISÉES
──────────────────────────────────────────────────────────────

Les clés suivantes sont définies mais non utilisées dans le code :

| Clé | Langues | Action |
|-----|---------|--------|
| `oldFeatureTitle` | en, fr, de | Supprimer ? |
| `deprecatedMessage` | en, fr | Supprimer ? |
| `testKey` | en | Supprimer |

──────────────────────────────────────────────────────────────
🔍 TEXTES HARDCODÉS
──────────────────────────────────────────────────────────────

Fichiers avec textes potentiellement non traduits :

| Fichier | Ligne | Texte |
|---------|-------|-------|
| lib/screens/home.dart | 45 | `Text('Welcome')` |
| lib/widgets/header.dart | 23 | `Text("Loading...")` |
| lib/screens/error.dart | 12 | `Text('An error occurred')` |

──────────────────────────────────────────────────────────────
📝 BONNES PRATIQUES
──────────────────────────────────────────────────────────────

### Extension Recommandée

```dart
// lib/core/extensions/l10n_extension.dart
import 'package:flutter/widgets.dart';
import 'package:flutter_gen/gen_l10n/app_localizations.dart';

extension L10nExtension on BuildContext {
  AppLocalizations get l10n => AppLocalizations.of(this)!;
}

// Usage
Text(context.l10n.welcomeMessage)
```

### Format des Clés

```json
// app_en.arb
{
  "welcomeMessage": "Welcome, {name}!",
  "@welcomeMessage": {
    "description": "Welcome message with user name",
    "placeholders": {
      "name": {
        "type": "String",
        "example": "John"
      }
    }
  },
  "itemCount": "{count, plural, =0{No items} =1{1 item} other{{count} items}}",
  "@itemCount": {
    "description": "Number of items",
    "placeholders": {
      "count": {
        "type": "int"
      }
    }
  }
}
```

──────────────────────────────────────────────────────────────
🔧 COMMANDES
──────────────────────────────────────────────────────────────

# Générer les fichiers de localisation
flutter gen-l10n

# Vérifier la syntaxe ARB
dart run intl_utils:check

# Extraire les nouvelles clés (si utilisant intl_utils)
dart run intl_utils:extract

──────────────────────────────────────────────────────────────
🎯 ACTIONS PRIORITAIRES
──────────────────────────────────────────────────────────────

1. [ ] Traduire 3 clés manquantes en français (critique)
2. [ ] Traduire 15 clés manquantes en allemand
3. [ ] Supprimer 3 clés non utilisées
4. [ ] Convertir 3 textes hardcodés en clés i18n
5. [ ] Mettre à jour les traductions japonaises (25 clés)
```

### Étape 6 : Template ARB

```json
// lib/l10n/app_en.arb
{
  "@@locale": "en",
  "@@last_modified": "2024-01-15T10:30:00Z",

  "appTitle": "My App",
  "@appTitle": {
    "description": "The title of the application"
  },

  "welcomeMessage": "Welcome, {userName}!",
  "@welcomeMessage": {
    "description": "Welcome message shown on home screen",
    "placeholders": {
      "userName": {
        "type": "String",
        "example": "John"
      }
    }
  },

  "itemsInCart": "{count, plural, =0{Your cart is empty} =1{1 item in cart} other{{count} items in cart}}",
  "@itemsInCart": {
    "description": "Shows number of items in shopping cart",
    "placeholders": {
      "count": {
        "type": "int",
        "format": "compact"
      }
    }
  },

  "orderDate": "Ordered on {date}",
  "@orderDate": {
    "description": "Shows when an order was placed",
    "placeholders": {
      "date": {
        "type": "DateTime",
        "format": "yMMMd"
      }
    }
  },

  "price": "{amount}",
  "@price": {
    "description": "Formatted price",
    "placeholders": {
      "amount": {
        "type": "double",
        "format": "currency",
        "optionalParameters": {
          "symbol": "€",
          "decimalDigits": 2
        }
      }
    }
  }
}
```
