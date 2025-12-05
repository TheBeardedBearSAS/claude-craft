# Verificar Localização/Internacionalização

Verifique se o aplicativo está corretamente internacionalizado e todas as strings estão traduzidas.

## Verificações

### 1. Configuração

```yaml
# pubspec.yaml
dependencies:
  flutter_localizations:
    sdk: flutter
  intl: any

flutter:
  generate: true
```

```yaml
# l10n.yaml
arb-dir: lib/l10n
template-arb-file: app_en.arb
output-localization-file: app_localizations.dart
```

### 2. Buscar Strings Hardcoded

```bash
# Buscar Text widgets com strings literais
grep -r "Text\s*(" lib/ | grep -v "S\.of\|AppLocalizations\|context\.l10n"

# Buscar strings entre aspas em widgets
grep -r "'\|\"" lib/presentation/ | grep -v "import\|class\|//\|key:"
```

### 3. Verificar ARB Files

```bash
# Verificar se todas as chaves existem em todos os idiomas
cd lib/l10n

# Contar chaves
for file in *.arb; do
  echo "$file: $(jq 'keys | length' $file) keys"
done

# Encontrar chaves faltantes
comm -23 <(jq -r 'keys[]' app_en.arb | sort) <(jq -r 'keys[]' app_pt.arb | sort)
```

### 4. Uso Correto

```dart
// ✅ BOM
Text(S.of(context).welcomeMessage)

// ✅ BOM
Text(AppLocalizations.of(context)!.welcomeMessage)

// ❌ RUIM
Text('Welcome') // String hardcoded
```

## Relatório

Liste:
- Strings hardcoded encontradas
- Idiomas disponíveis
- Completude da tradução (%)
- Chaves faltantes por idioma
