---
description: Pre-Merge-Überprüfung
argument-hint: [arguments]
---

# Pre-Merge-Überprüfung

Sie sind ein Code-Qualitäts-Assistent. Sie müssen alle notwendigen Überprüfungen VOR dem Mergen eines Branches durchführen, um Qualität sicherzustellen und Regressionen zu vermeiden.

## Argumente
$ARGUMENTS

Erwartete Argumente:
- Quell-Branch (Standard: aktueller Branch)
- Ziel-Branch (Standard: main oder master)

Beispiel: `/common:pre-merge-check feature/auth main`

## MISSION

### Schritt 1: Diff analysieren

```bash
# Branches identifizieren
SOURCE_BRANCH=$(git branch --show-current)
TARGET_BRANCH=${2:-main}

# Zu mergende Commits
git log $TARGET_BRANCH..$SOURCE_BRANCH --oneline

# Geänderte Dateien
git diff $TARGET_BRANCH...$SOURCE_BRANCH --stat

# Hinzugefügte/entfernte Zeilen
git diff $TARGET_BRANCH...$SOURCE_BRANCH --shortstat
```

### Schritt 2: Qualitätsprüfungen

#### 2.1 Vollständige Tests
```bash
# ALLE Tests ausführen
# Symfony
docker compose exec php vendor/bin/phpunit --coverage-text

# Flutter
docker run --rm -v $(pwd):/app -w /app dart flutter test --coverage

# Python
docker compose exec app pytest --cov --cov-report=term

# React/RN
docker compose exec node npm run test -- --coverage
```

#### 2.2 Vollständige statische Analyse
```bash
# PHPStan (max Level)
docker compose exec php vendor/bin/phpstan analyse -l max

# Dart Analyzer
docker run --rm -v $(pwd):/app -w /app dart dart analyze --fatal-infos

# Mypy (strict)
docker compose exec app mypy --strict .

# TypeScript
docker compose exec node npx tsc --noEmit
```

#### 2.3 Dependencies prüfen
```bash
# Sicherheits-Audit
# PHP
docker compose exec php composer audit

# Python
docker compose exec app pip-audit

# Node
docker compose exec node npm audit

# Flutter
docker run --rm -v $(pwd):/app -w /app dart dart pub outdated
```

### Schritt 3: Spezifische Überprüfungen

#### DB-Migrationen (falls vorhanden)
```bash
# Doctrine-Migrationen prüfen
git diff $TARGET_BRANCH...$SOURCE_BRANCH -- migrations/

# Falls Migrationen vorhanden
docker compose exec php php bin/console doctrine:migrations:diff --no-interaction
docker compose exec php php bin/console doctrine:schema:validate
```

#### API Breaking Changes
```bash
# OpenAPI-Specs vergleichen
git diff $TARGET_BRANCH...$SOURCE_BRANCH -- openapi.yaml docs/api/
```

#### Konfigurationsänderungen
```bash
# Geänderte Config-Dateien
git diff $TARGET_BRANCH...$SOURCE_BRANCH -- config/ .env.example docker-compose*.yml
```

### Schritt 4: Commit-Analyse

```bash
# Commit-Nachrichten prüfen
git log $TARGET_BRANCH..$SOURCE_BRANCH --pretty=format:"%s" | while read msg; do
    # Conventional-Muster: type(scope): beschreibung
    if ! echo "$msg" | grep -qE "^(feat|fix|docs|style|refactor|test|chore)(\(.+\))?: .+"; then
        echo "⚠️ Nicht-konventionelle Nachricht: $msg"
    fi
done
```

### Schritt 5: Coverage-Prüfung

```bash
# Coverage vorher/nachher vergleichen
# Coverage sollte nicht sinken
```

### Schritt 6: Bericht generieren

```
══════════════════════════════════════════════════════════════
🔀 PRE-MERGE-ÜBERPRÜFUNG
══════════════════════════════════════════════════════════════

📌 Quelle: feature/user-auth
📌 Ziel: main
📅 Datum: YYYY-MM-DD HH:MM

──────────────────────────────────────────────────────────────
📊 STATISTIKEN
──────────────────────────────────────────────────────────────

Commits: 12
Geänderte Dateien: 45
Hinzugefügte Zeilen: +1.234
Entfernte Zeilen: -567

──────────────────────────────────────────────────────────────
🧪 TESTS
──────────────────────────────────────────────────────────────

| Suite | Tests | Bestanden | Fehlgeschlagen | Übersprungen |
|-------|-------|-----------|----------------|--------------|
| Unit  | 234   | 234       | 0              | 0            |
| Integ | 45    | 45        | 0              | 0            |
| E2E   | 12    | 12        | 0              | 0            |

Coverage: 85.2% (vorher: 84.8%) ✅ +0.4%

──────────────────────────────────────────────────────────────
🔍 STATISCHE ANALYSE
──────────────────────────────────────────────────────────────

| Tool | Fehler | Warnungen | Status |
|-------|---------|-----------|--------|
| PHPStan | 0 | 2 | ✅ |
| ESLint | 0 | 5 | ⚠️ |
| Mypy | 0 | 0 | ✅ |

──────────────────────────────────────────────────────────────
🔒 SICHERHEIT
──────────────────────────────────────────────────────────────

Dependencies-Audit: ✅ Keine Schwachstellen
Secrets erkannt: ✅ Keine
Sensible Dateien: ✅ Keine

──────────────────────────────────────────────────────────────
📦 MIGRATIONEN
──────────────────────────────────────────────────────────────

Neue Migrationen: 2
  - Version20240115_AddUserRoles.php
  - Version20240116_CreateAuditLog.php

Schema-Validierung: ✅ OK
Rollback möglich: ✅ Ja

──────────────────────────────────────────────────────────────
⚠️ AUFMERKSAMKEITSPUNKTE
──────────────────────────────────────────────────────────────

1. [MITTEL] 5 ESLint-Warnungen zu beheben
2. [NIEDRIG] 2 TODOs im Code hinzugefügt
3. [INFO] 2 neue Migrationen - zuerst in Staging überprüfen

──────────────────────────────────────────────────────────────
📋 FINALE CHECKLISTE
──────────────────────────────────────────────────────────────

- [x] Alle Tests bestehen
- [x] Coverage beibehalten oder verbessert
- [x] Keine Fehler in statischer Analyse
- [x] Keine Sicherheitslücken
- [x] Keine Secrets committed
- [ ] Code Review genehmigt (manuell prüfen)
- [ ] In Staging getestet (manuell prüfen)

──────────────────────────────────────────────────────────────
🎯 URTEIL
──────────────────────────────────────────────────────────────

Merge autorisiert: ✅ JA

Empfehlungen vor Merge:
1. 5 ESLint-Warnungen beheben
2. Migrationen in Staging testen
3. Code-Review-Genehmigung einholen
```

## Blockierungsregeln

### Blockierend (Merge verboten)
- ❌ Fehlgeschlagene Tests
- ❌ Signifikanter Coverage-Rückgang (> 2%)
- ❌ Fehler in statischer Analyse
- ❌ Kritische/hohe Schwachstellen
- ❌ Secrets im Code
- ❌ Nicht umkehrbare Migrationen

### Nicht-blockierend (Warnung)
- ⚠️ Warnungen in statischer Analyse
- ⚠️ TODO/FIXME hinzugefügt
- ⚠️ Niedrige/mittlere Schwachstellen
- ⚠️ Leicht gesunkene Coverage (< 2%)
