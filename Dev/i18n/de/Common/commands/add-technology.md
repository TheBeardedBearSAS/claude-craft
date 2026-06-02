---
description: Eine neue Technologie zu claude-craft hinzufügen mit Best Practices aus Context7 und Web-Suche
argument-hint: <technology-name>
---

# Technologie hinzufügen

Sie sind ein erfahrener Technologie-Integrator für claude-craft. Ihr Auftrag ist es, einen neuen Technologie-Stack hinzuzufügen, indem Sie:
1. Best Practices mithilfe von Context7 MCP und Web-Suche recherchieren
2. Alle erforderlichen Dateien generieren (Regeln, Befehle, Templates, Skills, Agenten)
3. Das Installationsskript erstellen
4. Dokumentation und Landing Page aktualisieren

## Argumente
$ARGUMENTS

Argumente:
- `technology-name`: Name der hinzuzufügenden Technologie (z. B. „nextjs", „nestjs", „golang", „laravel")
- (Optional) `category`: Kategorie der Technologie (frontend, backend, mobile, devops, fullstack)

Beispiel: `/common:add-technology "nestjs"` oder `/common:add-technology "golang" backend`

## Plan-Modus

> **Plan-Modus ist obligatorisch.** Vor der Ausführung aktiviert Claude den Plan-Modus, um betroffenen Code zu analysieren, einen Implementierungsplan vorzuschlagen und Ihre Bestätigung abzuwarten, bevor Änderungen vorgenommen werden.

## AUFTRAG

### Schritt 1: Technologie analysieren

Folgendes identifizieren:
- Offizieller Name und gebräuchliche Aliase
- Typ: Framework, Bibliothek, Sprache, Werkzeug
- Kategorie: frontend, backend, mobile, devops, fullstack
- Ökosystem: zugehörige Werkzeuge, Test-Frameworks, Deployment-Optionen
- Zielgruppe: Web, Mobile, API, CLI, usw.

### Schritt 2: Mit Context7 recherchieren (MCP)

**Context7 für den Zugriff auf offizielle Dokumentation verwenden:**

```
Context7 abfragen für:
1. Offiziellen Einstiegsleitfaden
2. Empfohlene Projektstruktur
3. Best Practices und Entwurfsmuster
4. Teststrategien (Unit, Integration, E2E)
5. Sicherheits-Best-Practices
6. Tipps zur Leistungsoptimierung
7. Deployment-Empfehlungen
```

#### Zu extrahierende Informationen

| Thema | Zu findende Details |
|-------|---------------------|
| Architektur | Empfohlene Muster (MVC, Clean, Hexagonal, usw.) |
| Coding-Standards | Style Guide, Namenskonventionen, Dateistruktur |
| Werkzeuge | CLI-Tools, Formatierer, Linter, Bundler |
| Tests | Test-Frameworks, Coverage-Tools, Mocking-Strategien |
| Sicherheit | Authentifizierung, Autorisierung, häufige Schwachstellen |
| Qualität | Statische Analyse, Typprüfung, Code-Review-Praktiken |

### Schritt 3: Mit Web-Suche ergänzen

**Nach 2026-Trends und Community-Praktiken suchen:**

1. **Neueste Trends**
   - Aktuelle stabile Version
   - Kommende Funktionen
   - Veraltungswarnungen
   - Migrationsleitfäden

2. **Community-Best-Practices**
   - Beliebte Boilerplates
   - Produktionskonfigurationen
   - Leistungs-Benchmarks
   - Architekturen aus der Praxis

3. **Häufige Fallstricke**
   - Häufige Fehler
   - Anti-Muster
   - Sicherheitslücken
   - Leistungsengpässe

4. **Ökosystem**
   - Empfohlene Bibliotheken
   - Test-Werkzeuge
   - DevOps-Integrationen
   - Monitoring-Lösungen

### Schritt 4: Technologie-Dateien generieren

**Die vollständige Dateistruktur in allen 5 Sprachen (en, fr, es, de, pt) erstellen:**

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
│   └── [generate-*.md falls zutreffend]
├── templates/
│   └── [technologiespezifische Templates]
├── checklists/
│   ├── pre-commit.md
│   └── new-feature.md
├── agents/
│   └── {tech}-reviewer.md
└── skills/
    └── [technologiespezifische Skills]
```

#### Zu generierende Regeln

| Datei | Inhalt |
|-------|--------|
| `02-architecture-{tech}.md` | Architekturmuster, Ordnerstruktur, Clean-Architecture-Prinzipien |
| `03-coding-standards.md` | Style Guide, Namenskonventionen, Dateiorganisation |
| `06-tooling.md` | CLI-Befehle, Formatierer, Linter, Build-Tools |
| `07-testing-{tech}.md` | Teststrategien, Frameworks, Coverage-Anforderungen |
| `08-quality-tools.md` | Statische Analyse, Typprüfung, CI/CD-Integration |
| `11-security-{tech}.md` | Sicherheitspraktiken, häufige Schwachstellen, Authentifizierung |

#### Zu generierende Befehle

| Befehl | Zweck |
|--------|-------|
| `check-compliance.md` | Vollständiges Compliance-Audit (Punktzahl /100) |
| `check-architecture.md` | Architekturüberprüfung |
| `check-code-quality.md` | Code-Qualitätsanalyse |
| `check-testing.md` | Test-Coverage und -Qualität |
| `check-security.md` | Sicherheits-Audit |

### Schritt 5: Installationsskript erstellen

**`Dev/scripts/install-{tech}-rules.sh` generieren:**

Am Muster bestehender Skripte orientieren:
- Optionen `--lang`, `--force`, `--update`, `--dry-run`, `--backup` unterstützen
- Generische Regeln aus Common/ kopieren
- Technologiespezifische Regeln kopieren
- CLAUDE.md und 00-project-context.md generieren
- Installationszusammenfassung anzeigen

### Schritt 6: Dokumentation aktualisieren

**Zu aktualisierende Dateien:**

| Datei | Änderungen |
|-------|------------|
| `README.md` | Technologie zur Liste der unterstützten Stacks hinzufügen |
| `docs/index.html` | Statistiken erhöhen, Technologie-Karte hinzufügen |
| `docs/COMMANDS.md` | Neue Befehle dokumentieren |
| `Makefile` | `install-{tech}`-Ziel hinzufügen |

#### Landing-Page-Aktualisierungen (docs/index.html)

1. **Statistikbereich**: Zähler „Tech Stacks" erhöhen
2. **Technologie-Raster**: Neue Technologie-Karte hinzufügen:

```html
<div class="bg-slate-800/50 p-6 rounded-xl border border-white/5 hover:border-brand-500/50 transition-colors text-center group">
    <div class="h-16 w-16 mx-auto bg-black rounded-full flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform">
        <span class="text-2xl font-bold text-white">{ICON}</span>
    </div>
    <h3 class="font-bold text-white">{TECH_NAME}</h3>
    <p class="text-xs text-slate-400 mt-2" data-i18n="tech_{tech}_desc">{DESCRIPTION}</p>
</div>
```

3. **Übersetzungen**: i18n-Schlüssel für alle 5 Sprachen hinzufügen

#### Makefile-Ziel

```makefile
install-{tech}:
	./Dev/scripts/install-{tech}-rules.sh --lang=$(RULES_LANG) $(OPTIONS) $(TARGET)
```

### Schritt 7: Validierung

#### Definition-of-Done-Checkliste

```
══════════════════════════════════════════════════════════════
✅ DEFINITION OF DONE: Technologie hinzufügen [{TECH_NAME}]
══════════════════════════════════════════════════════════════

📁 ERSTELLTE DATEIEN
──────────────────────────────────────────────────────────────
- [ ] Regeln (7 Dateien × 5 Sprachen = 35 Dateien)
- [ ] Befehle (5 Dateien × 5 Sprachen = 25 Dateien)
- [ ] Templates (mindestens 2 pro Sprache)
- [ ] Checklisten (2 Dateien × 5 Sprachen = 10 Dateien)
- [ ] Agent {tech}-reviewer (1 Datei × 5 Sprachen = 5 Dateien)
- [ ] CLAUDE.md.template (× 5 Sprachen)
- [ ] Installationsskript (Dev/scripts/install-{tech}-rules.sh)

📄 DOKUMENTATION AKTUALISIERT
──────────────────────────────────────────────────────────────
- [ ] README.md: Technologie zu unterstützten Stacks hinzugefügt
- [ ] docs/index.html: Statistiken erhöht
- [ ] docs/index.html: Technologie-Karte hinzugefügt
- [ ] docs/index.html: i18n-Übersetzungen hinzugefügt (5 Sprachen)
- [ ] docs/COMMANDS.md: Neue Befehle dokumentiert
- [ ] Makefile: install-{tech}-Ziel hinzugefügt

🧪 VERIFIKATION
──────────────────────────────────────────────────────────────
- [ ] Installationsskript läuft fehlerfrei
- [ ] Alle Dateien sind korrekt formatiert
- [ ] Befehle sind funktionsfähig
- [ ] Dokumentation ist korrekt

══════════════════════════════════════════════════════════════
```

### Ausgabeformat

Nach Abschluss aller Schritte Folgendes bereitstellen:

```
══════════════════════════════════════════════════════════════
🎉 TECHNOLOGIE HINZUGEFÜGT: {TECH_NAME}
══════════════════════════════════════════════════════════════

📊 ZUSAMMENFASSUNG
──────────────────────────────────────────────────────────────
Technologie: {TECH_NAME}
Kategorie: {CATEGORY}
Version: {CURRENT_VERSION}

Erstellte Dateien: {COUNT}
- Regeln: 35 Dateien
- Befehle: 25 Dateien
- Templates: {COUNT}
- Checklisten: 10 Dateien
- Agenten: 5 Dateien

📁 STRUKTUR
──────────────────────────────────────────────────────────────
Dev/i18n/
├── en/{TECH}/
├── fr/{TECH}/
├── es/{TECH}/
├── de/{TECH}/
└── pt/{TECH}/

Dev/scripts/
└── install-{tech}-rules.sh

🔧 INSTALLATION
──────────────────────────────────────────────────────────────
# Über Makefile
make install-{tech} TARGET=~/my-project RULES_LANG=en

# Direktes Skript
./Dev/scripts/install-{tech}-rules.sh ~/my-project

📚 DOKUMENTATION
──────────────────────────────────────────────────────────────
- README.md ✅ Aktualisiert
- docs/index.html ✅ Aktualisiert
- docs/COMMANDS.md ✅ Aktualisiert
- Makefile ✅ Aktualisiert

✅ DEFINITION OF DONE: VOLLSTÄNDIG
══════════════════════════════════════════════════════════════
```

### Wichtige Richtlinien

1. **Zuerst recherchieren** — Immer Context7 und Web-Suche verwenden, bevor Dateien generiert werden
2. **Muster befolgen** — Bestehende Technologien (React, Symfony, Flutter) als Vorlagen verwenden
3. **Alle 5 Sprachen** — Inhalte für en, fr, es, de, pt generieren
4. **Qualität vor Geschwindigkeit** — Sicherstellen, dass alle Dateien korrekt formatiert und funktionsfähig sind
5. **Alles aktualisieren** — Dokumentation und Landing Page nicht vergessen

### Fehlerbehandlung

Wenn die Recherche fehlschlägt:
- Klar angeben, welche Informationen fehlen
- Alternative Quellen vorschlagen
- Den Benutzer bei Bedarf um Klärung bitten
- NIEMALS Dateien mit Platzhalter- oder erfundenem Inhalt generieren
