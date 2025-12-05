# Pre-Commit-Überprüfung

Sie sind ein Code-Qualitäts-Assistent. Sie müssen alle notwendigen Überprüfungen VOR dem Erstellen eines Commits durchführen, um sicherzustellen, dass der Code den Projektstandards entspricht.

## Argumente
$ARGUMENTS

Optionen:
- `--fix`: Behebbare Probleme automatisch beheben
- `--staged`: Nur gestage Dateien prüfen

## MISSION

### Schritt 1: Geänderte Dateien identifizieren

```bash
# Gestage Dateien
git diff --cached --name-only

# Geänderte Dateien (nicht gestaged)
git diff --name-only
```

### Schritt 2: Technologie nach Datei erkennen

| Erweiterung | Technologie | Tools |
|-----------|-------------|--------|
| `.php` | PHP/Symfony | php-cs-fixer, phpstan |
| `.dart` | Flutter | dart format, dart analyze |
| `.py` | Python | ruff, mypy |
| `.ts`, `.tsx` | React/RN | eslint, prettier |
| `.js`, `.jsx` | React/RN | eslint, prettier |

### Schritt 3: Überprüfungen ausführen

#### Für PHP-Dateien
```bash
# Formatierung
docker compose exec php vendor/bin/php-cs-fixer fix --dry-run --diff [dateien]

# Statische Analyse
docker compose exec php vendor/bin/phpstan analyse [dateien]

# Twig-Syntax (falls geändert)
docker compose exec php php bin/console lint:twig templates/

# Symfony Container
docker compose exec php php bin/console lint:container
```

#### Für Dart/Flutter-Dateien
```bash
# Formatierung
docker run --rm -v $(pwd):/app -w /app dart dart format --set-exit-if-changed [dateien]

# Analyse
docker run --rm -v $(pwd):/app -w /app dart dart analyze [dateien]

# Betroffene Tests
docker run --rm -v $(pwd):/app -w /app dart flutter test --coverage
```

#### Für Python-Dateien
```bash
# Linting + Formatierung
docker compose exec app ruff check [dateien]
docker compose exec app ruff format --check [dateien]

# Types
docker compose exec app mypy [dateien]
```

#### Für JS/TS-Dateien
```bash
# Linting
docker compose exec node npx eslint [dateien]

# Formatierung
docker compose exec node npx prettier --check [dateien]

# Types (falls TypeScript)
docker compose exec node npx tsc --noEmit
```

### Schritt 4: Globale Überprüfungen

#### Secrets
```bash
# Nach Secret-Mustern suchen
grep -rE "(password|secret|api_key|token)\s*[:=]\s*['\"][^'\"]+['\"]" --include="*.{php,py,ts,js,dart}" .
grep -rE "sk_live_|pk_live_|ghp_|gho_|AKIA" .
```

#### Verbotene Dateien
```bash
# Auf keine sensiblen Dateien prüfen
git diff --cached --name-only | grep -E "\.(env|pem|key|p12)$"
```

#### Dateigröße
```bash
# Dateien > 1MB
find . -type f -size +1M -name "*.{php,py,ts,js,dart}"
```

### Schritt 5: Bericht generieren

```
══════════════════════════════════════════════════════════════
🔍 PRE-COMMIT-ÜBERPRÜFUNG
══════════════════════════════════════════════════════════════

📁 Geprüfte Dateien: X
📅 Datum: YYYY-MM-DD HH:MM

──────────────────────────────────────────────────────────────
✅ ERFOLGREICHE ÜBERPRÜFUNGEN
──────────────────────────────────────────────────────────────

✅ PHP-Formatierung (php-cs-fixer)
✅ PHP-Statische-Analyse (phpstan)
✅ TypeScript-Formatierung (prettier)
✅ TypeScript-Linting (eslint)
✅ Keine Secrets erkannt

──────────────────────────────────────────────────────────────
⚠️ ERKANNTE PROBLEME
──────────────────────────────────────────────────────────────

❌ [PHP] src/Controller/UserController.php:45
   PHPStan: Parameter $id of method __construct() has no type hint

⚠️ [TS] src/components/Button.tsx:12
   ESLint: 'unused' is defined but never used (no-unused-vars)

──────────────────────────────────────────────────────────────
📋 ZUSAMMENFASSUNG
──────────────────────────────────────────────────────────────

| Kategorie | Status |
|-----------|--------|
| Formatierung | ✅ OK |
| Linting   | ⚠️ 1 Warnung |
| Types     | ❌ 1 Fehler |
| Secrets   | ✅ OK |

──────────────────────────────────────────────────────────────
🎯 ERFORDERLICHE AKTIONEN
──────────────────────────────────────────────────────────────

1. PHPStan-Fehler in UserController.php beheben
2. (Optional) ESLint-Warnung beheben

Commit autorisiert: ❌ NEIN (1 blockierender Fehler)
```

### --fix Option

Falls `--fix` als Argument übergeben:

```bash
# PHP
docker compose exec php vendor/bin/php-cs-fixer fix [dateien]

# Dart
docker run --rm -v $(pwd):/app -w /app dart dart format [dateien]

# Python
docker compose exec app ruff check --fix [dateien]
docker compose exec app ruff format [dateien]

# JS/TS
docker compose exec node npx eslint --fix [dateien]
docker compose exec node npx prettier --write [dateien]
```

## Blockierungsregeln

### Blockierend (Commit verboten)
- ❌ Syntaxfehler
- ❌ PHPStan/mypy/tsc-Fehler
- ❌ Secrets erkannt
- ❌ .env-Dateien committed
- ❌ Private Keys/Zertifikate

### Nicht-blockierend (Warnung)
- ⚠️ Formatierungsprobleme
- ⚠️ ESLint-Warnungen
- ⚠️ Test-Coverage gesunken
- ⚠️ TODO/FIXME hinzugefügt

## Tipp

Zum Automatisieren einen Pre-Commit-Hook konfigurieren:

```bash
# .git/hooks/pre-commit
#!/bin/sh
claude-code "/common:pre-commit-check --staged"
```
