---
name: workflow-plan
description: Die Planungsphase durchführen - PRD-Erstellung, Personas und Backlog-Generierung
arguments:
  - name: continue
    description: Dort fortfahren, wo aufgehört wurde
    required: false
---

# /workflow:plan

## Mission

Die Planungsphase des Entwicklungs-Workflows durchführen. Diese Phase konzentriert sich auf die Erstellung des Product Requirements Document, die Definition von Personas und die Generierung des initialen Product Backlogs.

## Wann verwenden

- **Standard**- und **Enterprise**-Tracks
- Nach `/workflow:init` (oder `/workflow:analyze` für Enterprise)
- Beim Start der Feature-Planung

## Workflow

### Schritt 1: Planungs-Setup

```
╔══════════════════════════════════════════════════════════╗
║             PLANUNGSPHASE - START                         ║
╠══════════════════════════════════════════════════════════╣
║ Track: Standard                                           ║
║ Phase: 2 von 4 - Planung                                  ║
║                                                           ║
║ Ziele:                                                    ║
║ • Product Requirements Document erstellen/aktualisieren   ║
║ • Benutzer-Personas definieren                            ║
║ • Product Backlog mit priorisierten User Stories erstellen ║
║ • Erfolgsmetriken und KPIs festlegen                      ║
╚══════════════════════════════════════════════════════════╝
```

### Schritt 2: Vorhandene Artefakte prüfen

```
╔══════════════════════════════════════════════════════════╗
║              PRÜFUNG VORHANDENER ARTEFAKTE               ║
╠══════════════════════════════════════════════════════════╣
║                                                           ║
║ Prüfe project-management/ ...                             ║
║                                                           ║
║ PRD:                                                      ║
║ ├── ❌ prd.md                    Nicht gefunden           ║
║                                                           ║
║ Personas:                                                 ║
║ ├── ❌ personas.md               Nicht gefunden           ║
║                                                           ║
║ Backlog:                                                  ║
║ ├── ❌ backlog/                  Nicht gefunden           ║
║                                                           ║
║ Analyse (Enterprise):                                     ║
║ ├── ✅ analysis/constraints.md   Verfügbar                ║
║ └── ✅ analysis/research.md      Verfügbar                ║
║                                                           ║
╚══════════════════════════════════════════════════════════╝
```

### Schritt 3: Planungsaufgaben

Planungsaufgaben in Reihenfolge ausführen:

```
╔══════════════════════════════════════════════════════════╗
║               PLANUNGSAUFGABEN                            ║
╠══════════════════════════════════════════════════════════╣
║                                                           ║
║ □ Aufgabe 1: PRD erstellen                                ║
║   Befehl: /project:generate-prd                           ║
║   Ausgabe: project-management/prd.md                      ║
║                                                           ║
║ □ Aufgabe 2: Personas definieren                          ║
║   (In PRD-Generierung enthalten)                          ║
║   Ausgabe: project-management/personas.md                 ║
║                                                           ║
║ □ Aufgabe 3: Backlog erstellen                            ║
║   Befehl: /project:generate-backlog                       ║
║   Ausgabe: project-management/backlog/                    ║
║                                                           ║
║ □ Aufgabe 4: Backlog validieren                           ║
║   Befehl: /project:validate-backlog                       ║
║   Stellt SCRUM-Konformität sicher                         ║
║                                                           ║
╚══════════════════════════════════════════════════════════╝
```

### Schritt 4: PRD-Generierung ausführen

Den PRD-Generierungsbefehl aufrufen:

```
Starte /project:generate-prd...

[PRD-Generierungsworkflow läuft]

✅ PRD erstellt: project-management/prd.md
✅ Personas extrahiert: project-management/personas.md
```

### Schritt 5: Backlog-Generierung ausführen

Nach Abschluss des PRD:

```
Starte /project:generate-backlog...

Verwende PRD als Eingabe:
• 3 Personas identifiziert
• 12 funktionale Anforderungen extrahiert
• 8 nicht-funktionale Anforderungen notiert

Generiere Backlog-Struktur...

[Backlog-Generierungsworkflow läuft]

✅ Backlog erstellt mit:
   • 4 EPICs
   • 18 User Stories
   • Sprint 1 geplant (Walking Skeleton)
```

### Schritt 6: Validierung

Backlog-Validierung ausführen:

```
╔══════════════════════════════════════════════════════════╗
║              BACKLOG-VALIDIERUNG                          ║
╠══════════════════════════════════════════════════════════╣
║                                                           ║
║ INVEST-Kriterien-Prüfung:                                 ║
║ ├── Independent:    18/18 ✅                              ║
║ ├── Negotiable:     18/18 ✅                              ║
║ ├── Valuable:       18/18 ✅                              ║
║ ├── Estimable:      18/18 ✅                              ║
║ ├── Sized (≤8Pkt.): 16/18 ⚠️  (2 Stories müssen geteilt w.)║
║ └── Testable:       18/18 ✅                              ║
║                                                           ║
║ 3C-Kriterien-Prüfung:                                     ║
║ ├── Card:           18/18 ✅                              ║
║ ├── Conversation:   18/18 ✅                              ║
║ └── Confirmation:   18/18 ✅                              ║
║                                                           ║
║ Abnahmekriterien (Gherkin):                               ║
║ └── Gültiges Format: 18/18 ✅                             ║
║                                                           ║
║ WARNUNGEN:                                                ║
║ • US-007: 13 Punkte - Aufteilung erwägen                  ║
║ • US-012: 21 Punkte - muss aufgeteilt werden              ║
║                                                           ║
╚══════════════════════════════════════════════════════════╝
```

### Schritt 7: Phasenabschluss

```
╔══════════════════════════════════════════════════════════╗
║             PLANUNGSPHASE ABGESCHLOSSEN                   ║
╠══════════════════════════════════════════════════════════╣
║                                                           ║
║ Erstellte Artefakte:                                      ║
║ ✅ prd.md              Product Requirements Document      ║
║ ✅ personas.md         3 Benutzer-Personas                ║
║ ✅ backlog/            Vollständiges SCRUM-Backlog        ║
║    ├── epics/          4 EPICs                            ║
║    └── user-stories/   18 User Stories                    ║
║                                                           ║
║ Zusammenfassung:                                          ║
║ • Gesamte Story Points: 89                                ║
║ • Sprint 1 Umfang: 21 Punkte (Walking Skeleton)          ║
║ • Geschätzte Sprints: 4-5                                 ║
║                                                           ║
║ ─────────────────────────────────────────────────────────║
║ NÄCHSTE PHASE: Design (Lösungsfindung)                    ║
║ Befehl: /workflow:design                                  ║
║ ─────────────────────────────────────────────────────────║
║                                                           ║
║ Die technische Spezifikation basiert auf den              ║
║ PRD-Anforderungen.                                        ║
╚══════════════════════════════════════════════════════════╝
```

## Beteiligte Agenten

- **product-owner**: PRD-Erstellung, Persona-Definition, Priorisierung
- **tech-lead**: Technische Machbarkeitsprüfung, Schätzungsberatung

## Ausgabedateien

| Datei | Zweck |
|-------|-------|
| `prd.md` | Product Requirements Document |
| `personas.md` | Benutzer-Persona-Definitionen |
| `backlog/epics/` | EPIC-Definitionen |
| `backlog/user-stories/` | User-Story-Dateien |
| `sprints/sprint-001/` | Erste Sprint-Struktur |

## Fortsetzen-Option

Bei Unterbrechung `--continue` verwenden, um fortzufahren:

```bash
/workflow:plan --continue

# Erkennt:
# ✅ PRD abgeschlossen
# ⏳ Backlog in Bearbeitung (12/18 Stories)
# → Fährt ab Story 13 fort
```

## Verwandte Befehle

- `/workflow:init` - Workflow initialisieren
- `/workflow:analyze` - Vorherige Phase (Enterprise)
- `/workflow:design` - Nächste Phase
- `/workflow:status` - Fortschritt prüfen
- `/project:generate-prd` - Direkte PRD-Generierung
- `/project:generate-backlog` - Direkte Backlog-Generierung
