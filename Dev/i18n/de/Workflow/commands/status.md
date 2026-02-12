---
name: workflow-status
description: Aktuellen Workflow-Fortschritt und empfohlene nächste Aktionen anzeigen
arguments:
  - name: verbose
    description: Detaillierten Status mit allen Artefakten anzeigen
    required: false
---

# /workflow:status

## Mission

Den aktuellen Stand des Entwicklungs-Workflows anzeigen, einschließlich abgeschlossener Phasen, aktuellem Fortschritt und empfohlenen nächsten Aktionen.

## Verwendung

```bash
/workflow:status           # Standard-Statusansicht
/workflow:status --verbose # Detailansicht mit allen Artefakten
```

## Ausgabeformat

### Standardansicht

```
╔══════════════════════════════════════════════════════════════════╗
║                       WORKFLOW-STATUS                             ║
╠══════════════════════════════════════════════════════════════════╣
║ Projekt: my-awesome-app                                           ║
║ Track: STANDARD                                                   ║
║ Gestartet: 2026-01-07                                             ║
║ Aktuelle Phase: Design ████████████░░░░ 75%                       ║
╠══════════════════════════════════════════════════════════════════╣
║                                                                   ║
║  Phase 1: Analyse                                                 ║
║  └── ⏭️  Übersprungen (Standard-Track)                             ║
║                                                                   ║
║  Phase 2: Planung                                                 ║
║  └── ✅ Abgeschlossen                                             ║
║      ├── PRD: ✅ Abgeschlossen                                    ║
║      ├── Personas: ✅ 3 definiert                                  ║
║      └── Backlog: ✅ 18 Stories (89 Pkt.)                          ║
║                                                                   ║
║  Phase 3: Design                                                  ║
║  └── 🔄 In Bearbeitung                                            ║
║      ├── Tech Spec: ✅ Abgeschlossen                              ║
║      ├── Architektur: ✅ C4-Diagramme erstellt                    ║
║      ├── API-Design: 🔄 In Bearbeitung (18/24 Endpoints)          ║
║      └── ADRs: ✅ 3 erstellt                                      ║
║                                                                   ║
║  Phase 4: Implementierung                                         ║
║  └── ⏳ Ausstehend                                                ║
║      └── Sprint 1: Bereit zum Start (21 Pkt.)                     ║
║                                                                   ║
╠══════════════════════════════════════════════════════════════════╣
║ NÄCHSTE AKTION: API-Design abschließen                            ║
║ BEFEHL: /workflow:design --continue                               ║
╚══════════════════════════════════════════════════════════════════╝
```

### Detailansicht (--verbose)

```
╔══════════════════════════════════════════════════════════════════╗
║                   WORKFLOW-STATUS (DETAIL)                        ║
╠══════════════════════════════════════════════════════════════════╣
║ Projekt: my-awesome-app                                           ║
║ Track: STANDARD                                                   ║
║ Gestartet: 2026-01-07T10:00:00Z                                  ║
║ Letzte Aktualisierung: 2026-01-07T15:30:00Z                      ║
║ Statusdatei: project-management/workflow-status.yaml              ║
╠══════════════════════════════════════════════════════════════════╣
║                                                                   ║
║ ══════════════════════════════════════════════════════════════   ║
║ PHASE 2: PLANUNG (Abgeschlossen)                                 ║
║ ══════════════════════════════════════════════════════════════   ║
║                                                                   ║
║ PRD: project-management/prd.md                                    ║
║ ├── Version: 1.0                                                  ║
║ ├── Funktionale Anforderungen: 12                                 ║
║ ├── Nicht-funktionale Anforderungen: 8                            ║
║ ├── Erfolgsmetriken: 5 KPIs definiert                             ║
║ └── Letzte Änderung: 2026-01-07T11:00:00Z                        ║
║                                                                   ║
║ Personas: project-management/personas.md                          ║
║ ├── Primär: Geschäftsinhaber, Freelancer                          ║
║ └── Sekundär: Buchhalter                                          ║
║                                                                   ║
║ Backlog: project-management/backlog/                              ║
║ ├── EPICs: 4                                                      ║
║ │   ├── EPIC-001: Benutzerverwaltung (21 Pkt.)                    ║
║ │   ├── EPIC-002: Zahlungsintegration (24 Pkt.)                   ║
║ │   ├── EPIC-003: Berichtswesen (23 Pkt.)                         ║
║ │   └── EPIC-004: Benachrichtigungen (21 Pkt.)                    ║
║ ├── User Stories: 18                                              ║
║ │   ├── P0 (Muss haben): 8 Stories                                ║
║ │   ├── P1 (Sollte haben): 6 Stories                              ║
║ │   └── P2 (Wäre schön): 4 Stories                                ║
║ └── Gesamte Story Points: 89                                      ║
║                                                                   ║
║ Geplante Sprints:                                                 ║
║ ├── Sprint 1: Walking Skeleton (21 Pkt.) - 5 Stories              ║
║ ├── Sprint 2: Kernfunktionen (28 Pkt.) - 6 Stories               ║
║ ├── Sprint 3: Zahlungen (24 Pkt.) - 4 Stories                    ║
║ └── Sprint 4: Feinschliff (16 Pkt.) - 3 Stories                  ║
║                                                                   ║
║ ══════════════════════════════════════════════════════════════   ║
║ PHASE 3: DESIGN (In Bearbeitung - 75%)                            ║
║ ══════════════════════════════════════════════════════════════   ║
║                                                                   ║
║ Tech Spec: project-management/tech-spec.md ✅                     ║
║ ├── Version: 1.0                                                  ║
║ ├── Architektur: Clean Architecture (Hexagonal)                   ║
║ ├── Stack: Symfony 7.x + React 18 + PostgreSQL 16                 ║
║ └── Integrationen: Stripe, SendGrid, AWS S3                       ║
║                                                                   ║
║ Architektur: project-management/architecture/ ✅                  ║
║ ├── c4-context.md - Systemkontext-Diagramm                        ║
║ ├── c4-container.md - Container-Diagramm                          ║
║ ├── c4-component.md - Komponenten-Diagramm                        ║
║ └── erd.md - Entity-Relationship-Diagramm (8 Entitäten)           ║
║                                                                   ║
║ API-Design: project-management/architecture/api.md 🔄             ║
║ ├── Entworfen: 18 Endpoints                                       ║
║ ├── Verbleibend: 6 Endpoints                                      ║
║ └── Auth: JWT mit Refresh-Tokens                                   ║
║                                                                   ║
║ ADRs: docs/adr/ ✅                                                ║
║ ├── ADR-001: Datenbank (PostgreSQL)                               ║
║ ├── ADR-002: API-Stil (REST)                                      ║
║ └── ADR-003: Authentifizierung (JWT)                              ║
║                                                                   ║
║ Sicherheit: project-management/architecture/security.md ⏳        ║
║ └── Status: Ausstehend                                            ║
║                                                                   ║
║ ══════════════════════════════════════════════════════════════   ║
║ PHASE 4: IMPLEMENTIERUNG (Ausstehend)                             ║
║ ══════════════════════════════════════════════════════════════   ║
║                                                                   ║
║ Sprint 1: sprint-001-walking-skeleton                             ║
║ ├── Status: Bereit zum Start                                      ║
║ ├── Stories: 5                                                    ║
║ ├── Punkte: 21                                                    ║
║ └── Aufgaben: 0 (noch nicht zerlegt)                              ║
║                                                                   ║
╠══════════════════════════════════════════════════════════════════╣
║ WORKFLOW-GESUNDHEIT                                               ║
╠══════════════════════════════════════════════════════════════════╣
║ ✅ PRD stimmt mit Backlog überein                                  ║
║ ✅ Tech Spec deckt alle Anforderungen ab                          ║
║ ✅ Architektur dokumentiert                                       ║
║ ⚠️  API-Design unvollständig (6 Endpoints verbleibend)             ║
║ ⚠️  Sicherheitsüberprüfung ausstehend                             ║
╠══════════════════════════════════════════════════════════════════╣
║ NÄCHSTE AKTIONEN                                                  ║
╠══════════════════════════════════════════════════════════════════╣
║ 1. API-Design abschließen (6 verbleibende Endpoints)              ║
║    Befehl: /workflow:design --continue                            ║
║                                                                   ║
║ 2. Sicherheitsüberprüfung abschließen                             ║
║    Befehl: (in der Designphase enthalten)                         ║
║                                                                   ║
║ 3. Dann Implementierung starten                                   ║
║    Befehl: /workflow:implement                                    ║
╚══════════════════════════════════════════════════════════════════╝
```

### Kein Workflow initialisiert

```
╔══════════════════════════════════════════════════════════════════╗
║                       WORKFLOW-STATUS                             ║
╠══════════════════════════════════════════════════════════════════╣
║                                                                   ║
║  ⚠️  Kein Workflow für dieses Projekt initialisiert               ║
║                                                                   ║
║  Um zu beginnen, ausführen:                                       ║
║                                                                   ║
║    /workflow:init                                                 ║
║                                                                   ║
║  Dies wird:                                                       ║
║  • Ihren Projektkontext analysieren                               ║
║  • Den passenden Track empfehlen (Quick/Standard/Enterprise)      ║
║  • Workflow-Tracking initialisieren                               ║
║  • Sie durch die Entwicklungsphasen führen                        ║
║                                                                   ║
╚══════════════════════════════════════════════════════════════════╝
```

### Quick-Flow-Status

```
╔══════════════════════════════════════════════════════════════════╗
║                       WORKFLOW-STATUS                             ║
╠══════════════════════════════════════════════════════════════════╣
║ Projekt: my-awesome-app                                           ║
║ Track: QUICK FLOW                                                 ║
║ Gestartet: 2026-01-07                                             ║
╠══════════════════════════════════════════════════════════════════╣
║                                                                   ║
║  Quick Flow - Direkte Implementierung                             ║
║  └── 🔄 In Bearbeitung                                            ║
║                                                                   ║
║  Keine Phasen für Quick Flow erforderlich.                        ║
║  Direkte Arbeit an der Implementierung.                           ║
║                                                                   ║
║  Aktuelle Aufgabe (falls verfolgt):                               ║
║  └── TASK-042: Login-Validierungsbug beheben                      ║
║      Status: In Bearbeitung                                       ║
║                                                                   ║
╠══════════════════════════════════════════════════════════════════╣
║ VERFÜGBARE BEFEHLE                                                ║
╠══════════════════════════════════════════════════════════════════╣
║ • /qa:tdd     - Mit TDD-Ansatz fortfahren             ║
║ • /project:move-task done - Aufgabe als erledigt markieren        ║
║ • /workflow:init          - Neuen Workflow starten                ║
╚══════════════════════════════════════════════════════════════════╝
```

## Statusdatei-Struktur

Der Status wird aus `project-management/workflow-status.yaml` gelesen:

```yaml
project: my-awesome-app
track: standard  # quick | standard | enterprise
initialized_at: 2026-01-07T10:00:00Z
updated_at: 2026-01-07T15:30:00Z
current_phase: design

phases:
  analysis:
    status: skipped  # pending | in_progress | complete | skipped
    reason: "Standard track - analysis not required"
  planning:
    status: complete
    completed_at: 2026-01-07T12:00:00Z
    artifacts:
      prd:
        status: complete
        path: project-management/prd.md
      personas:
        status: complete
        path: project-management/personas.md
        count: 3
      backlog:
        status: complete
        path: project-management/backlog/
        epics: 4
        stories: 18
        points: 89
  design:
    status: in_progress
    started_at: 2026-01-07T12:00:00Z
    progress: 75
    artifacts:
      tech_spec:
        status: complete
        path: project-management/tech-spec.md
      architecture:
        status: complete
        path: project-management/architecture/
      api_design:
        status: in_progress
        progress: "18/24 endpoints"
      adrs:
        status: complete
        count: 3
        path: docs/adr/
      security:
        status: pending
  implementation:
    status: pending
    sprints:
      - name: sprint-001-walking-skeleton
        status: pending
        points: 21
        stories: 5

next_action: "Complete API design"
next_command: "/workflow:design --continue"
```

## Verwandte Befehle

- `/workflow:init` - Neuen Workflow initialisieren
- `/workflow:analyze` - Analysephase
- `/workflow:plan` - Planungsphase
- `/workflow:design` - Designphase
- `/workflow:implement` - Implementierungsphase
