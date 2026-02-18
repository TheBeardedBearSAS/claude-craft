---
description: Eine neue Technologie zu claude-craft hinzufügen mit Best Practices von Context7 und Websuche
argument-hint: <technologie-name>
---

# Technologie Hinzufügen

Sie sind ein Experte für Technologie-Integration bei claude-craft. Ihre Mission ist es, einen neuen Technologie-Stack hinzuzufügen:
1. Best Practices recherchieren mit Context7 MCP und Websuche
2. Alle notwendigen Dateien generieren (rules, commands, templates, skills, agents)
3. Das Installationsskript erstellen
4. Dokumentation und Präsentationsseite aktualisieren

## Argumente
$ARGUMENTS

Argumente:
- `technologie-name`: Name der hinzuzufügenden Technologie (z.B. "nextjs", "nestjs", "golang", "laravel")
- (Optional) `kategorie`: Kategorie der Technologie (frontend, backend, mobile, devops, fullstack)

Beispiel: `/common:add-technology "nestjs"` oder `/common:add-technology "golang" backend`

## Plan-Modus

> **Der Plan-Modus ist obligatorisch.** Vor der Ausführung aktiviert Claude den Plan-Modus, um betroffenen Code zu analysieren, einen Implementierungsplan vorzuschlagen und auf Ihre Validierung zu warten, bevor Änderungen vorgenommen werden.

## MISSION

### Schritt 1: Technologie Analysieren

Identifizieren:
- Offizieller Name und gängige Aliase
- Typ: Framework, Bibliothek, Sprache, Tool
- Kategorie: frontend, backend, mobile, devops, fullstack
- Ökosystem: verwandte Tools, Test-Frameworks, Deployment-Optionen
- Zielgruppe: Web, Mobile, API, CLI, etc.

### Schritt 2: Mit Context7 Recherchieren (MCP)

**Context7 für offizielle Dokumentation nutzen:**

```
Context7 abfragen für:
1. Offizieller Einstiegsleitfaden
2. Empfohlene Projektstruktur
3. Best Practices und Design Patterns
4. Teststrategien (Unit, Integration, E2E)
5. Sicherheits-Best-Practices
6. Tipps zur Performance-Optimierung
7. Deployment-Empfehlungen
```

#### Zu Extrahierende Informationen

| Thema | Zu Findende Details |
|-------|---------------------|
| Architektur | Empfohlene Patterns (MVC, Clean, Hexagonal, etc.) |
| Code-Standards | Stilrichtlinien, Namenskonventionen, Dateistruktur |
| Werkzeuge | CLI-Tools, Formatter, Linter, Bundler |
| Testing | Test-Frameworks, Coverage-Tools, Mocking-Strategien |
| Sicherheit | Authentifizierung, Autorisierung, häufige Schwachstellen |
| Qualität | Statische Analyse, Typprüfung, Review-Praktiken |

### Schritt 3: Mit Websuche Ergänzen

**Nach 2026-Trends und Community-Praktiken suchen:**

1. **Neueste Trends**
   - Aktuelle stabile Version
   - Kommende Features
   - Deprecation-Warnungen
   - Migrationsleitfäden

2. **Community Best Practices**
   - Beliebte Boilerplates
   - Produktionskonfigurationen
   - Performance-Benchmarks
   - Reale Architekturen

3. **Häufige Fallstricke**
   - Häufige Fehler
   - Anti-Patterns
   - Sicherheitslücken
   - Performance-Engpässe

4. **Ökosystem**
   - Empfohlene Bibliotheken
   - Test-Tools
   - DevOps-Integrationen
   - Monitoring-Lösungen

### Schritt 4: Technologie-Dateien Generieren

**Vollständige Struktur in allen 5 Sprachen erstellen (en, fr, es, de, pt):**

```
Dev/i18n/{lang}/{TECHNOLOGY}/
├── CLAUDE.md.template
├── rules/
│   ├── 00-project-context.md.template
│   ├── 02-architecture-{tech}.md
│   ├── 03-coding-standards.md
│   ├── 06-tooling.md
│   ├── 07-testing-{tech}.md
│   ├── 08-quality-tools.md
│   └── 11-security-{tech}.md
├── commands/
│   ├── check-compliance.md
│   ├── check-architecture.md
│   ├── check-code-quality.md
│   ├── check-testing.md
│   ├── check-security.md
│   └── [generate-*.md falls anwendbar]
├── templates/
│   └── [technologie-spezifische Templates]
├── checklists/
│   ├── pre-commit.md
│   └── new-feature.md
├── agents/
│   └── {tech}-reviewer.md
└── skills/
    └── [technologie-spezifische Skills]
```

### Schritt 5: Installationsskript Erstellen

**`Dev/scripts/install-{tech}-rules.sh` generieren:**

Muster bestehender Skripte folgen:
- Unterstützung von `--lang`, `--force`, `--update`, `--dry-run`, `--backup` Optionen
- Generische Regeln von Common/ kopieren
- Technologie-spezifische Regeln kopieren
- CLAUDE.md und 00-project-context.md generieren
- Installationszusammenfassung anzeigen

### Schritt 6: Dokumentation Aktualisieren

**Zu aktualisierende Dateien:**

| Datei | Änderungen |
|-------|------------|
| `README.md` | Technologie zur Liste der unterstützten Stacks hinzufügen |
| `docs/index.html` | Stats erhöhen, Technologie-Karte hinzufügen |
| `docs/COMMANDS.md` | Neue Befehle dokumentieren |
| `Makefile` | `install-{tech}` Target hinzufügen |

### Schritt 7: Validierung

#### Definition of Done Checkliste

```
══════════════════════════════════════════════════════════════
✅ DEFINITION OF DONE: Technologie Hinzufügen [{TECH_NAME}]
══════════════════════════════════════════════════════════════

📁 ERSTELLTE DATEIEN
──────────────────────────────────────────────────────────────
- [ ] Rules (7 Dateien × 5 Sprachen = 35 Dateien)
- [ ] Commands (5 Dateien × 5 Sprachen = 25 Dateien)
- [ ] Templates (mindestens 2 pro Sprache)
- [ ] Checklists (2 Dateien × 5 Sprachen = 10 Dateien)
- [ ] Agent {tech}-reviewer (1 Datei × 5 Sprachen = 5 Dateien)
- [ ] CLAUDE.md.template (× 5 Sprachen)
- [ ] Installationsskript (Dev/scripts/install-{tech}-rules.sh)

📄 AKTUALISIERTE DOKUMENTATION
──────────────────────────────────────────────────────────────
- [ ] README.md: Technologie zu unterstützten Stacks hinzugefügt
- [ ] docs/index.html: Stats erhöht
- [ ] docs/index.html: Technologie-Karte hinzugefügt
- [ ] docs/index.html: i18n-Übersetzungen hinzugefügt (5 Sprachen)
- [ ] docs/COMMANDS.md: Neue Befehle dokumentiert
- [ ] Makefile: install-{tech} Target hinzugefügt

🧪 VERIFIZIERUNG
──────────────────────────────────────────────────────────────
- [ ] Installationsskript läuft fehlerfrei
- [ ] Alle Dateien sind korrekt formatiert
- [ ] Befehle sind funktional
- [ ] Dokumentation ist korrekt

══════════════════════════════════════════════════════════════
```

### Wichtige Richtlinien

1. **Zuerst recherchieren** - Immer Context7 und Websuche nutzen bevor Dateien generiert werden
2. **Mustern folgen** - Bestehende Technologien (React, Symfony, Flutter) als Vorlagen verwenden
3. **Alle 5 Sprachen** - Inhalte für en, fr, es, de, pt generieren
4. **Qualität vor Geschwindigkeit** - Sicherstellen dass alle Dateien korrekt formatiert sind
5. **Alles aktualisieren** - Dokumentation und Startseite nicht vergessen

### Fehlerbehandlung

Wenn die Recherche fehlschlägt:
- Klar angeben welche Informationen fehlen
- Alternative Quellen vorschlagen
- Bei Bedarf um Klärung bitten
- NIEMALS Dateien mit Platzhalter- oder erfundenem Inhalt generieren
