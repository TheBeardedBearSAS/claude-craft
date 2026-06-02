---
description: Verificação de Traduções
argument-hint: [arguments]
---

# Verificação de Traduções

Você é um desenvolvedor Flutter sênior. Você deve verificar a completude e a coerência das traduções (i18n) do projeto.

## Argumentos
$ARGUMENTS

Argumentos:
- (Opcional) Idioma a verificar (ex: `fr`, `en`, `all`)

Exemplo: `/flutter:localization-check all`

## Modo de Planejamento

> O modo de planejamento é ativado automaticamente quando o escopo abrange múltiplos módulos ou requer investigação transversal.

## MISSÃO

### Etapa 1: Identificar a Configuração i18n

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

### Etapa 2: Analisar os Arquivos ARB

```bash
# Listar os arquivos de tradução
ls -la lib/l10n/

# Gerar os arquivos Dart
flutter gen-l10n
```

### Etapa 3: Verificar as Chaves

```dart
// Script de verificação (executar manualmente ou via teste)
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

  // Encontrar o idioma de referência (template)
  final reference = translations['en']!;
  final referenceKeys = reference.keys
      .where((k) => !k.startsWith('@'))
      .toSet();

  print('Idioma de referência: en');
  print('Quantidade de chaves: ${referenceKeys.length}');
  print('');

  for (final entry in translations.entries) {
    if (entry.key == 'en') continue;

    final keys = entry.value.keys
        .where((k) => !k.startsWith('@'))
        .toSet();

    final missing = referenceKeys.difference(keys);
    final extra = keys.difference(referenceKeys);

    print('Idioma: ${entry.key}');
    print('  Chaves: ${keys.length}');
    print('  Faltando: ${missing.length}');
    print('  Extras: ${extra.length}');

    if (missing.isNotEmpty) {
      print('  Chaves faltando:');
      for (final key in missing) {
        print('    - $key');
      }
    }
    print('');
  }
}
```

### Etapa 4: Verificar o Uso

```bash
# Procurar chaves hardcoded
grep -rn "Text('" lib/ --include="*.dart" | grep -v "AppLocalizations"
grep -rn 'Text("' lib/ --include="*.dart" | grep -v "AppLocalizations"

# Procurar usos corretos
grep -rn "AppLocalizations.of(context)" lib/ --include="*.dart"
grep -rn "context.l10n" lib/ --include="*.dart"  # Se extensão disponível
```

### Etapa 5: Gerar o Relatório

```
══════════════════════════════════════════════════════════════
🌍 RELATÓRIO DE LOCALIZAÇÃO
══════════════════════════════════════════════════════════════

──────────────────────────────────────────────────────────────
📊 RESUMO
──────────────────────────────────────────────────────────────

| Idioma   | Chaves | Completude | Status |
|----------|--------|------------|--------|
| en (ref) | 145    | 100%       | ✅     |
| fr       | 142    | 98%        | ⚠️     |
| de       | 130    | 90%        | ⚠️     |
| es       | 145    | 100%       | ✅     |
| ja       | 120    | 83%        | ❌     |

──────────────────────────────────────────────────────────────
❌ CHAVES FALTANDO
──────────────────────────────────────────────────────────────

### fr (3 chaves faltando)

| Chave            | Valor EN          | Prioridade |
|------------------|-------------------|------------|
| `orderCancelled` | "Order cancelled" | Alta       |
| `paymentFailed`  | "Payment failed"  | Alta       |
| `retryButton`    | "Retry"           | Média      |

### de (15 chaves faltando)

| Chave            | Valor EN   | Prioridade |
|------------------|------------|------------|
| `settingsTitle`  | "Settings" | Alta       |
| `profileSection` | "Profile"  | Média      |
| ...              | ...        | ...        |

### ja (25 chaves faltando)

[Lista completa no arquivo report_ja.md]

──────────────────────────────────────────────────────────────
⚠️ CHAVES NÃO UTILIZADAS
──────────────────────────────────────────────────────────────

As seguintes chaves estão definidas mas não são utilizadas no código:

| Chave               | Idiomas    | Ação     |
|---------------------|------------|----------|
| `oldFeatureTitle`   | en, fr, de | Remover? |
| `deprecatedMessage` | en, fr     | Remover? |
| `testKey`           | en         | Remover  |

──────────────────────────────────────────────────────────────
🔍 TEXTOS HARDCODED
──────────────────────────────────────────────────────────────

Arquivos com textos potencialmente não traduzidos:

| Arquivo                      | Linha | Texto                       |
|------------------------------|-------|-----------------------------|
| lib/screens/home.dart        | 45    | `Text('Welcome')`           |
| lib/widgets/header.dart      | 23    | `Text("Loading...")`        |
| lib/screens/error.dart       | 12    | `Text('An error occurred')` |

──────────────────────────────────────────────────────────────
📝 BOAS PRÁTICAS
──────────────────────────────────────────────────────────────

### Extensão Recomendada

```dart
// lib/core/extensions/l10n_extension.dart
import 'package:flutter/widgets.dart';
import 'package:flutter_gen/gen_l10n/app_localizations.dart';

extension L10nExtension on BuildContext {
  AppLocalizations get l10n => AppLocalizations.of(this)!;
}

// Uso
Text(context.l10n.welcomeMessage)
```

### Formato das Chaves

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
🔧 COMANDOS
──────────────────────────────────────────────────────────────

# Gerar os arquivos de localização
flutter gen-l10n

# Verificar a sintaxe ARB
dart run intl_utils:check

# Extrair novas chaves (se estiver usando intl_utils)
dart run intl_utils:extract

──────────────────────────────────────────────────────────────
🎯 AÇÕES PRIORITÁRIAS
──────────────────────────────────────────────────────────────

1. [ ] Traduzir 3 chaves faltando em francês (crítico)
2. [ ] Traduzir 15 chaves faltando em alemão
3. [ ] Remover 3 chaves não utilizadas
4. [ ] Converter 3 textos hardcoded em chaves i18n
5. [ ] Atualizar as traduções em japonês (25 chaves)
```

### Etapa 6: Template ARB

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
