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

# /workflow:init

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
║ • /common:fix-bug-tdd    - Fix mit TDD                    ║
║ • /project:add-task      - Arbeit verfolgen               ║
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
║ • /project:generate-prd    - PRD erstellen/aktualisieren  ║
║ • /project:generate-backlog - User Stories erstellen      ║
║                                                           ║
║ Phase 2 - Design:                                         ║
║ • /project:generate-tech-spec - Technisches Design        ║
║                                                           ║
║ Phase 3 - Implementierung:                                ║
║ • /project:sprint-dev      - TDD/BDD-Entwicklung          ║
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
║ • /workflow:analyze        - Recherche & Exploration      ║
║                                                           ║
║ Phase 2 - Planung:                                        ║
║ • /project:generate-prd    - Vollständiges PRD            ║
║ • /project:generate-backlog - Vollständiges Backlog       ║
║                                                           ║
║ Phase 3 - Design:                                         ║
║ • /project:generate-tech-spec - Vollständiges Tech Spec   ║
║ • /common:architecture-decision - ADRs                    ║
║                                                           ║
║ Phase 4 - Implementierung:                                ║
║ • /project:sprint-dev      - Sprint-weise Entwicklung     ║
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
next_command: "/project:generate-prd"
```

### Schritt 6: Nächste Aktion anzeigen

```
╔══════════════════════════════════════════════════════════╗
║                    BEREIT ZUM START                       ║
╠══════════════════════════════════════════════════════════╣
║ Workflow initialisiert: STANDARD Track                    ║
║ Statusdatei: project-management/workflow-status.yaml      ║
║                                                           ║
║ ─────────────────────────────────────────────────────────║
║ NÄCHSTER SCHRITT: Planungsphase                           ║
║ ─────────────────────────────────────────────────────────║
║                                                           ║
║ Starten mit: /workflow:plan                               ║
║                                                           ║
║ Oder direkt zu bestimmten Aufgaben:                       ║
║ • /project:generate-prd     - Anforderungsdokument erst.  ║
║ • /project:generate-backlog - User Stories erstellen      ║
║                                                           ║
║ Fortschritt jederzeit prüfen: /workflow:status            ║
╚══════════════════════════════════════════════════════════╝
```

## Override-Optionen

```bash
# Bestimmten Track erzwingen
/workflow:init --quick          # Quick Flow erzwingen
/workflow:init --standard       # Standard erzwingen
/workflow:init --enterprise     # Enterprise erzwingen

# Scope-Hinweis geben
/workflow:init bug              # Hinweis: Dies ist ein Bugfix
/workflow:init feature          # Hinweis: Neues Feature
/workflow:init platform         # Hinweis: Plattform-Arbeit
```

## Verwandte Befehle

- `/workflow:status` - Aktuellen Workflow-Fortschritt prüfen
- `/workflow:plan` - Planungsphase starten
- `/workflow:design` - Designphase starten
- `/workflow:implement` - Implementierungsphase starten
- `/workflow:analyze` - Analysephase starten (nur Enterprise)
