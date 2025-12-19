---
description: Automatische Changelog-Generierung
argument-hint: [arguments]
---

# Automatische Changelog-Generierung

Sie sind ein Dokumentations-Assistent. Sie müssen Git-Commits analysieren und ein formatiertes Changelog gemäß Conventional Commits und Keep a Changelog Konventionen generieren.

## Argumente
$ARGUMENTS

Argumente:
- Zielversion (z.B. `1.2.0`)
- Seit (vorheriger Tag, Standard: letzter Tag)

Beispiel: `/common:generate-changelog 1.2.0 v1.1.0`

## MISSION

### Schritt 1: Commits abrufen

```bash
# Letzten Tag identifizieren
LAST_TAG=$(git describe --tags --abbrev=0 2>/dev/null || echo "")

# Commits seit letztem Tag auflisten
if [ -z "$LAST_TAG" ]; then
    git log --pretty=format:"%H|%s|%an|%ad" --date=short
else
    git log ${LAST_TAG}..HEAD --pretty=format:"%H|%s|%an|%ad" --date=short
fi
```

### Schritt 2: Commits parsen (Conventional Commits)

Erwartetes Format: `type(scope): beschreibung`

| Typ | Changelog-Kategorie |
|------|---------------------|
| feat | Added |
| fix | Fixed |
| docs | Documentation |
| style | (ignoriert) |
| refactor | Changed |
| perf | Performance |
| test | (ignoriert) |
| chore | (ignoriert) |
| build | Build |
| ci | (ignoriert) |
| revert | Removed |
| BREAKING CHANGE | Breaking Changes |

### Schritt 3: PRs analysieren (falls verfügbar)

```bash
# Gemergte PRs abrufen
gh pr list --state merged --base main --json number,title,labels,author
```

### Schritt 4: Changelog generieren

Keep a Changelog Format:

```markdown
# Changelog

Alle bemerkenswerten Änderungen an diesem Projekt werden in dieser Datei dokumentiert.

Das Format basiert auf [Keep a Changelog](https://keepachangelog.com/de/1.1.0/),
und dieses Projekt hält sich an [Semantic Versioning](https://semver.org/lang/de/).

## [Unreleased]

## [{VERSION}] - {DATUM}

### Breaking Changes
- **{scope}**: {beschreibung} ({autor}) - #{PR}

### Added
- **{scope}**: {beschreibung} ({autor}) - #{PR}
- **{scope}**: {beschreibung} ({autor}) - #{PR}

### Changed
- **{scope}**: {beschreibung} ({autor}) - #{PR}

### Deprecated
- **{scope}**: {beschreibung} ({autor}) - #{PR}

### Removed
- **{scope}**: {beschreibung} ({autor}) - #{PR}

### Fixed
- **{scope}**: {beschreibung} ({autor}) - #{PR}

### Security
- **{scope}**: {beschreibung} ({autor}) - #{PR}

### Performance
- **{scope}**: {beschreibung} ({autor}) - #{PR}

## [{PREVIOUS_VERSION}] - {DATUM}
...

[Unreleased]: https://github.com/{owner}/{repo}/compare/v{VERSION}...HEAD
[{VERSION}]: https://github.com/{owner}/{repo}/compare/v{PREVIOUS_VERSION}...v{VERSION}
```

### Schritt 5: Ausgabe-Beispiel

```markdown
## [1.2.0] - 2024-01-15

### Breaking Changes
- **api**: Authentifizierung von Session zu JWT geändert (#123) - @john

### Added
- **auth**: OAuth2 Social Login Unterstützung hinzugefügt (#145) - @jane
- **users**: Benutzerprofilbild-Upload hinzugefügt (#142) - @john
- **dashboard**: Echtzeit-Benachrichtigungen hinzugefügt (#138) - @alice

### Changed
- **api**: API Platform auf v3.2 aktualisiert (#150) - @bob
- **ui**: Zu TailwindCSS v3 migriert (#148) - @jane

### Fixed
- **auth**: Passwort-Reset-E-Mail wird nicht gesendet behoben (#141) - @john
- **orders**: Berechnung der Gesamtsumme mit Rabatten behoben (#139) - @alice
- **mobile**: Absturz auf iOS 17 behoben (#137) - @bob

### Security
- **deps**: symfony/http-kernel für CVE-2024-1234 aktualisiert (#146) - @security-bot

### Performance
- **api**: Redis-Caching für Benutzersitzungen hinzugefügt (#144) - @alice
- **db**: N+1 Queries bei Bestellungsliste optimiert (#140) - @bob

---

**Vollständiges Changelog**: https://github.com/org/repo/compare/v1.1.0...v1.2.0

### Mitwirkende
- @john (4 Commits)
- @jane (3 Commits)
- @alice (3 Commits)
- @bob (3 Commits)

### Statistiken
- Commits: 13
- Geänderte Dateien: 87
- Hinzugefügte Zeilen: +2.345
- Entfernte Zeilen: -876
```

### Schritt 6: Vorgeschlagene Aktionen

```
══════════════════════════════════════════════════════════════
📝 CHANGELOG GENERIERT
══════════════════════════════════════════════════════════════

Version: 1.2.0
Zeitraum: 2024-01-01 → 2024-01-15
Analysierte Commits: 13

──────────────────────────────────────────────────────────────
📊 ZUSAMMENFASSUNG NACH KATEGORIE
──────────────────────────────────────────────────────────────

| Kategorie | Anzahl |
|-----------|--------|
| Added | 3 |
| Changed | 2 |
| Fixed | 3 |
| Security | 1 |
| Performance | 2 |
| Breaking | 1 |

──────────────────────────────────────────────────────────────
⚠️ AUFMERKSAMKEITSPUNKTE
──────────────────────────────────────────────────────────────

1. ⚠️ BREAKING CHANGE erkannt - erfordert MAJOR Version?
2. 🔒 1 Sicherheitsfix - in Release Notes erwähnen
3. 📝 5 Commits ohne Conventional Format (zu verbessern)

──────────────────────────────────────────────────────────────
🎯 NÄCHSTE SCHRITTE
──────────────────────────────────────────────────────────────

1. Generiertes Changelog überprüfen und bearbeiten
2. CHANGELOG.md Datei erstellen oder aktualisieren
3. Commit: git commit -am "docs: changelog für v1.2.0 aktualisieren"
4. Tag erstellen: git tag -a v1.2.0 -m "Release v1.2.0"
```

## Zugehörige Befehle

```bash
# Changelog speichern
# Inhalt wird angezeigt, Sie können ihn in CHANGELOG.md kopieren

# Empfohlene Tools zur Automatisierung
# - git-cliff: https://github.com/orhun/git-cliff
# - conventional-changelog: https://github.com/conventional-changelog/conventional-changelog
# - release-please: https://github.com/googleapis/release-please
```

## Erinnerung an Conventional Commits

```
<type>[optionaler scope]: <beschreibung>

[optionaler body]

[optionale footer]

# Standard-Typen
feat:     Neue Funktion
fix:      Bugfix
docs:     Nur Dokumentation
style:    Formatierung (keine Codeänderung)
refactor: Refactoring (weder neue Funktion noch Fix)
perf:     Performance-Verbesserung
test:     Tests hinzufügen/ändern
chore:    Wartung (deps, config, etc.)
build:    Build-System, externe deps
ci:       CI/CD-Konfiguration
revert:   Vorherigen Commit rückgängig machen

# Breaking Change
feat!: beschreibung
# oder
feat: beschreibung

BREAKING CHANGE: Breaking Change Erklärung
```
