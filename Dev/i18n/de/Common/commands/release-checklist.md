---
description: Release-Checkliste
argument-hint: [arguments]
---

# Release-Checkliste

Sie sind ein erfahrener Release Manager. Sie müssen das Team durch alle Schritte eines qualitativ hochwertigen Releases führen und jeden kritischen Punkt überprüfen.

## Argumente
$ARGUMENTS

Argumente:
- Version (z.B. `1.2.0`, `2.0.0-beta.1`)
- Typ (patch, minor, major)

Beispiel: `/common:release-checklist 1.2.0 minor`

## MISSION

### Schritt 1: Pre-Release-Validierung

#### 1.1 Code-Zustand
```bash
# Auf richtigem Branch überprüfen
git branch --show-current  # Muss main/master oder release/* sein

# Auf keine uncommitted Änderungen überprüfen
git status

# Überprüfen, dass alle Tests bestehen
# [Tests je nach Technologie ausführen]
```

#### 1.2 Changelog
```bash
# Überprüfen, dass CHANGELOG.md aktuell ist
cat CHANGELOG.md | head -50

# Changelog seit letztem Tag generieren
git log $(git describe --tags --abbrev=0)..HEAD --pretty=format:"- %s"
```

#### 1.3 Versions-Dateien
```bash
# Versions-Dateien prüfen/aktualisieren
# PHP: composer.json
# Python: pyproject.toml, __version__.py
# Node: package.json
# Flutter: pubspec.yaml
# iOS: Info.plist
# Android: build.gradle
```

### Schritt 2: Umfassende Tests

```bash
# Unit Tests
# Integrationstests
# E2E-Tests
# Performance-Tests
# Sicherheitstests
```

### Schritt 3: Dokumentation

```bash
# Dokumentation überprüfen
# - README aktuell
# - API-Docs generiert
# - Migrationsanleitung (bei Breaking Changes)
```

### Schritt 4: Interaktive Checkliste generieren

```
══════════════════════════════════════════════════════════════
🚀 RELEASE-CHECKLISTE - v{VERSION}
══════════════════════════════════════════════════════════════

Typ: {TYPE} (patch/minor/major)
Datum: YYYY-MM-DD
Branch: main

══════════════════════════════════════════════════════════════
📋 PRE-RELEASE
══════════════════════════════════════════════════════════════

## Code-Qualität
- [ ] Alle Tests bestehen (Unit, Integration, E2E)
- [ ] Test-Coverage ≥ 80%
- [ ] Statische Analyse ohne Fehler
- [ ] Code Review auf allen PRs abgeschlossen
- [ ] Keine blockierenden TODO/FIXME

## Sicherheit
- [ ] Dependencies-Audit (keine kritischen CVEs)
- [ ] Keine Secrets im Code
- [ ] Sicherheitstests bestanden (OWASP)
- [ ] Gültige SSL-Zertifikate

## Dokumentation
- [ ] CHANGELOG.md aktualisiert
- [ ] README.md aktuell
- [ ] API-Dokumentation generiert
- [ ] Migrationsanleitung (bei Breaking Changes)
- [ ] Release Notes geschrieben

## Versionierung
- [ ] Versionsnummer erhöht
- [ ] Git-Tags vorbereitet
- [ ] Release-Branches erstellt (falls zutreffend)

══════════════════════════════════════════════════════════════
📦 BUILD & PACKAGE
══════════════════════════════════════════════════════════════

## Backend
- [ ] Produktions-Build erfolgreich
- [ ] Assets kompiliert und minifiziert
- [ ] DB-Migrationen vorbereitet
- [ ] Umgebungsvariablen dokumentiert

## Frontend Web
- [ ] Bundle optimiert (Code Splitting, Tree Shaking)
- [ ] Assets CDN-bereit
- [ ] Service Worker aktualisiert
- [ ] Sourcemaps generiert (aber nicht in Prod deployt)

## Mobile (falls zutreffend)
- [ ] iOS-Build signiert
- [ ] Android-Build signiert
- [ ] Store-Screenshots aktualisiert
- [ ] Store-Metadaten bereit

══════════════════════════════════════════════════════════════
🔧 STAGING-VALIDIERUNG
══════════════════════════════════════════════════════════════

- [ ] Staging-Deployment erfolgreich
- [ ] DB-Migrationen erfolgreich ausgeführt
- [ ] Manuelle Smoke-Tests OK
- [ ] Regressionstests bestanden
- [ ] Akzeptable Performance (< definierte Schwellenwerte)
- [ ] Monitoring funktioniert (Logs, Metriken)
- [ ] Rollback getestet

══════════════════════════════════════════════════════════════
🚀 PRODUKTIONS-DEPLOYMENT
══════════════════════════════════════════════════════════════

## Pre-Deploy
- [ ] Wartungsmodus aktiviert (falls notwendig)
- [ ] Datenbank-Backup durchgeführt
- [ ] Support-Team-Kommunikation
- [ ] Deployment-Fenster validiert

## Deploy
- [ ] Produktions-Deployment gestartet
- [ ] DB-Migrationen ausgeführt
- [ ] Health Checks bestehen
- [ ] Wartungsmodus deaktiviert

## Post-Deploy
- [ ] Produktions-Smoke-Tests OK
- [ ] Monitoring überprüft (keine Fehler)
- [ ] Nominale Performance
- [ ] Git-Tag erstellt und gepusht
- [ ] GitHub/GitLab Release erstellt

══════════════════════════════════════════════════════════════
📢 KOMMUNIKATION
══════════════════════════════════════════════════════════════

- [ ] Release Notes veröffentlicht
- [ ] Support-Team informiert
- [ ] Kunden benachrichtigt (falls zutreffend)
- [ ] Öffentliche Dokumentation aktualisiert
- [ ] Blog/Social-Media-Ankündigung (falls zutreffend)

══════════════════════════════════════════════════════════════
🔙 ROLLBACK-PLAN
══════════════════════════════════════════════════════════════

Bei kritischem Problem:

1. Problem identifizieren
   - Logs: [Monitoring-URL]
   - Alerts: [Alerting-URL]

2. Rollback-Entscheidung
   - Schwellenwert: > 5% 5xx Fehler für 5 Min
   - Entscheidungsträger: [Name]

3. Rollback ausführen
   ```bash
   # Rollback-Befehl
   [An Infrastruktur anpassen]
   ```

4. DB-Rollback (falls notwendig)
   ```bash
   # Migrationen down
   [An ORM anpassen]
   ```

5. Kommunikation
   - Team benachrichtigen
   - Vorfall öffnen
   - Post-Mortem

══════════════════════════════════════════════════════════════
✅ FINALE VALIDIERUNG
══════════════════════════════════════════════════════════════

[ ] Alle Kästchen angekreuzt
[ ] Release validiert von: _______________
[ ] Release-Datum/-Zeit: _______________

Notizen:
_________________________________________________
_________________________________________________
```

## Nützliche Befehle

```bash
# Tag erstellen
git tag -a v{VERSION} -m "Release v{VERSION}"
git push origin v{VERSION}

# GitHub Release erstellen
gh release create v{VERSION} --title "v{VERSION}" --notes-file RELEASE_NOTES.md

# Automatisches Changelog generieren
git-cliff --unreleased --tag v{VERSION} > CHANGELOG.md
```

## Erinnerung an Semantic Versioning

| Typ | Wann | Beispiel |
|------|-------|---------|
| MAJOR | Breaking Changes | 1.0.0 → 2.0.0 |
| MINOR | Neue Funktion | 1.0.0 → 1.1.0 |
| PATCH | Bugfix | 1.0.0 → 1.0.1 |
