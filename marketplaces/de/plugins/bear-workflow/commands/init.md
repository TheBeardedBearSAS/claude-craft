---
name: workflow-init
description: Projektkontext analysieren und den optimalen Entwicklungs-Workflow-Track empfehlen
arguments:
  - name: scope
    description: Optionaler Scope-Hinweis (bug, feature, platform, migration)
    required: false
  - name: track
    description: Einen bestimmten Track erzwingen (--quick, --standard, --enterprise)
    required: false
---

# /bear-workflow:init

## Mission

Den aktuellen Projektkontext analysieren und den optimalen Entwicklungs-Workflow-Track empfehlen. Workflow-Tracking initialisieren und den Benutzer durch die entsprechenden Phasen leiten.

## Workflow

### Schritt 1: Kontext-Erkennung

```
╔══════════════════════════════════════════════════════════╗
║             WORKFLOW-INITIALISIERUNG                      ║
╠══════════════════════════════════════════════════════════╣
║ Projektkontext wird analysiert...                         ║
╚══════════════════════════════════════════════════════════╝
```

**Analysieren:**

1. **Projektstruktur**
   - `.claude/`-Verzeichnis prüfen
   - Technologie-Stack aus Dateien erkennen
   - Framework identifizieren (Symfony, Flutter, React, etc.)

2. **Vorhandene Dokumentation**
   - `project-management/prd.md` - PRD vorhanden?
   - `project-management/tech-spec.md` - Tech Spec vorhanden?
   - `project-management/backlog/` - Backlog vorhanden?
   - `README.md` - Projektbeschreibung

3. **Codebase-Umfang**
   - Quelldateien zählen
   - Komplexität einschätzen
   - Komponenten/Module identifizieren

4. **Git-Kontext**
   - Aktueller Branch
   - Letzte Commits
   - Offene Änderungen

### Schritt 2: Komplexitätsbewertung

**Bewertungsmatrix:**

| Faktor | Quick (1) | Standard (2) | Enterprise (3) |
|--------|-----------|--------------|----------------|
| Zu ändernde Dateien | 1-5 | 5-50 | 50+ |
| Neue Entitäten/Tabellen | 0 | 1-3 | 4+ |
| Externe Integrationen | 0 | 1 | 2+ |
| Geschätzte User Stories | 1-3 | 3-15 | 15+ |
| Beteiligte Teams | 1 | 1 | 2+ |
| Sicherheitsauswirkungen | Niedrig | Mittel | Hoch |

**Score berechnen:**
- Score 6-8: Quick Flow
- Score 9-14: Standard
- Score 15+: Enterprise

### Schritt 3: Track-Empfehlung

```
╔══════════════════════════════════════════════════════════╗
║               PROJEKTANALYSE ABGESCHLOSSEN               ║
╠══════════════════════════════════════════════════════════╣
║ Projekt: my-awesome-app                                   ║
║ Stack: Symfony 7.x + React 18                             ║
║ Status: Bestehendes Projekt mit Backlog                   ║
╠══════════════════════════════════════════════════════════╣
║                                                           ║
║ KOMPLEXITÄTSBEWERTUNG:                                    ║
║ ├── Betroffene Dateien:   ~25        [Standard]           ║
║ ├── Neue Entitäten:       2          [Standard]           ║
║ ├── Integrationen:        1 (Stripe) [Standard]           ║
║ ├── Geschätzte Stories:   8          [Standard]           ║
║ ├── Teams:                1          [Quick]              ║
║ └── Sicherheit:           Hoch       [Enterprise]         ║
║                                                           ║
║ ═══════════════════════════════════════════════════════  ║
║ EMPFOHLENER TRACK: STANDARD                               ║
║ ═══════════════════════════════════════════════════════  ║
║                                                           ║
║ Begründung:                                               ║
║ • Feature-Umfang erfordert Planung (8 Stories)            ║
║ • Externe Integration erfordert technisches Design        ║
║ • Sicherheitsauswirkungen erfordern sorgfältige Arch.     ║
║ • Ein Team kann ohne vollständigen Enterprise-Prozess     ║
║   arbeiten                                                ║
║                                                           ║
╚══════════════════════════════════════════════════════════╝
```

### Schritt 4: Phasenplanung

Basierend auf dem Track den Workflow anzeigen:

**Quick Flow:**
```
╔══════════════════════════════════════════════════════════╗
║              QUICK FLOW WORKFLOW                          ║
╠══════════════════════════════════════════════════════════╣
║                                                           ║
║  ┌──────────────────┐                                     ║
║  │  IMPLEMENTIERUNG │ ← Hier starten                      ║
║  └──────────────────┘                                     ║
║                                                           ║
║ Keine Dokumentation erforderlich. Direkt zum Coding.      ║
║                                                           ║
║ Befehle:                                                  ║
║ • /bear-qa:tdd    - Fix mit TDD                    ║
║ • /bear-project:backlog add task      - Arbeit verfolgen               ║
║                                                           ║
╚══════════════════════════════════════════════════════════╝
```

**Standard:**
```
╔══════════════════════════════════════════════════════════╗
║              STANDARD WORKFLOW                            ║
╠══════════════════════════════════════════════════════════╣
║                                                           ║
║  ┌──────────┐    ┌──────────┐    ┌──────────────┐        ║
║  │ PLANUNG  │ →  │  DESIGN  │ →  │IMPLEMENTIERUNG│       ║
║  └──────────┘    └──────────┘    └──────────────┘        ║
║       ↑                                                   ║
║   Hier starten                                            ║
║                                                           ║
║ Phase 1 - Planung:                                        ║
║ • /bear-workflow:plan --only=prd    - PRD erstellen/aktualisieren  ║
║ • /bear-workflow:plan --only=backlog - User Stories erstellen      ║
║                                                           ║
║ Phase 2 - Design:                                         ║
║ • /bear-workflow:design - Technisches Design        ║
║                                                           ║
║ Phase 3 - Implementierung:                                ║
║ • /bear-workflow:start N      - Sprint-Setup           ║
║ • /bear-workflow:implement    - TDD/BDD-Entwicklung    ║
║ • /bear-workflow:auto-sprint N - Sprint Ende-zu-Ende   ║
║                                                           ║
╚══════════════════════════════════════════════════════════╝
```

**Enterprise:**
```
╔══════════════════════════════════════════════════════════╗
║              ENTERPRISE WORKFLOW                          ║
╠══════════════════════════════════════════════════════════╣
║                                                           ║
║  ┌──────────┐  ┌──────────┐  ┌────────┐  ┌────────────┐  ║
║  │ ANALYSE  │→ │ PLANUNG  │→ │ DESIGN │→ │IMPLEMENTIER.│ ║
║  └──────────┘  └──────────┘  └────────┘  └────────────┘  ║
║       ↑                                                   ║
║   Hier starten                                            ║
║                                                           ║
║ Phase 1 - Analyse:                                        ║
║ • /bear-workflow:plan --research        - Recherche & Exploration      ║
║                                                           ║
║ Phase 2 - Planung:                                        ║
║ • /bear-workflow:plan --only=prd    - Vollständiges PRD            ║
║ • /bear-workflow:plan --only=backlog - Vollständiges Backlog       ║
║                                                           ║
║ Phase 3 - Design:                                         ║
║ • /bear-workflow:design - Vollständiges Tech Spec   ║
║ • /bear-common:architecture-decision - ADRs                    ║
║                                                           ║
║ Phase 4 - Implementierung:                                ║
║ • /bear-workflow:start N      - Sprint-Setup           ║
║ • /bear-workflow:implement    - TDD/BDD-Entwicklung    ║
║ • /bear-workflow:auto-sprint N - Sprint Ende-zu-Ende   ║
║                                                           ║
╚══════════════════════════════════════════════════════════╝
```

### Schritt 5: Tracking initialisieren

Workflow-Statusdatei erstellen:

```yaml
# project-management/workflow-status.yaml
project: my-awesome-app
track: standard
initialized_at: 2026-01-07T10:00:00Z
current_phase: planning

phases:
  analysis:
    status: skipped
    reason: "Standard track - analysis not required"
  planning:
    status: pending
    artifacts:
      prd: pending
      personas: pending
      backlog: pending
  design:
    status: pending
    artifacts:
      tech_spec: pending
      architecture: pending
  implementation:
    status: pending

next_action: "Generate or update PRD"
next_command: "/bear-workflow:plan --only=prd"
```

BMAD-Status-Skeleton erstellen (Single Source of Truth für den Story-Status, gelesen von `/bear-gate:*`, `/bear-workflow:auto-sprint` und dem Kanban). Überspringen, falls `.bmad/sprint-status.yaml` bereits existiert; `/bear-workflow:start` füllt `metadata` und `stories` später:

```yaml
# .bmad/sprint-status.yaml
version: "1.0"
metadata:
  sprint_id: "sprint-0"
  name: "Nicht gestartet"
  start_date: ""
  end_date: ""
  goal: ""
stories: {}
routing:
  auto_transitions:
    enabled: true
    run_on_session_start: false
    run_on_task_complete: true
    rules: []
```

### Schritt 6: Nächste Aktion anzeigen

```
╔══════════════════════════════════════════════════════════╗
║                    BEREIT ZUM START                       ║
╠══════════════════════════════════════════════════════════╣
║ Workflow initialisiert: STANDARD Track                    ║
║ Statusdatei: project-management/workflow-status.yaml      ║
║ Sprint-Status: .bmad/sprint-status.yaml                   ║
║                                                           ║
║ ─────────────────────────────────────────────────────────║
║ NÄCHSTER SCHRITT: Planungsphase                           ║
║ ─────────────────────────────────────────────────────────║
║                                                           ║
║ Starten mit: /bear-workflow:plan                               ║
║                                                           ║
║ Oder direkt zu bestimmten Aufgaben:                       ║
║ • /bear-workflow:plan --only=prd     - Anforderungsdokument erst.  ║
║ • /bear-workflow:plan --only=backlog - User Stories erstellen      ║
║                                                           ║
║ Fortschritt jederzeit prüfen: /bear-workflow:status            ║
╚══════════════════════════════════════════════════════════╝
```

## Override-Optionen

```bash
# Bestimmten Track erzwingen
/bear-workflow:init --quick          # Quick Flow erzwingen
/bear-workflow:init --standard       # Standard erzwingen
/bear-workflow:init --enterprise     # Enterprise erzwingen

# Scope-Hinweis geben
/bear-workflow:init bug              # Hinweis: Dies ist ein Bugfix
/bear-workflow:init feature          # Hinweis: Neues Feature
/bear-workflow:init platform         # Hinweis: Plattform-Arbeit
```

## Verwandte Befehle

- `/bear-workflow:status` - Aktuellen Workflow-Fortschritt prüfen
- `/bear-workflow:plan` - Planungsphase starten
- `/bear-workflow:design` - Designphase starten
- `/bear-workflow:implement` - Implementierungsphase starten
- `/bear-workflow:auto-sprint` - Einen ganzen Sprint Ende-zu-Ende ausführen (Start → Merge)
- `/bear-workflow:plan --research` - Analysephase starten (nur Enterprise)

> Unsicher, welchen Weg Sie wählen sollen? Siehe die Entscheidungsseite: https://github.com/TheBeardedBearSAS/bear-craft/blob/main/docs/guides/de/11-which-path.md
