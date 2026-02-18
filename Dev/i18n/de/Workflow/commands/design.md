---
name: workflow-design
description: Die Designphase (Lösungsfindung) durchführen - technische Spezifikation und Architektur
arguments:
  - name: continue
    description: Dort fortfahren, wo aufgehört wurde
    required: false
---

# /workflow:design

## Mission

Die Designphase (Lösungsfindung) des Entwicklungs-Workflows durchführen. Diese Phase konzentriert sich auf die Erstellung der technischen Spezifikation, das Architekturdesign und die Dokumentation wichtiger technischer Entscheidungen.

## Wann verwenden

- **Standard**- und **Enterprise**-Tracks
- Nach Abschluss von `/workflow:plan`
- Wenn PRD und Backlog bereit sind

## Voraussetzungen

- PRD existiert unter `project-management/prd.md`
- Backlog existiert unter `project-management/backlog/`

## Plan-Modus

> **Der Plan-Modus wird empfohlen.** Claude aktiviert den Plan-Modus, um den Ansatz zu strukturieren, Abhängigkeiten zu identifizieren und eine Generierungsstrategie vorzustellen, bevor Artefakte erstellt werden.

## Workflow

### Schritt 1: Design-Setup

```
╔══════════════════════════════════════════════════════════╗
║              DESIGNPHASE - START                          ║
╠══════════════════════════════════════════════════════════╣
║ Track: Standard                                           ║
║ Phase: 3 von 4 - Design (Lösungsfindung)                  ║
║                                                           ║
║ Ziele:                                                    ║
║ • Technische Spezifikation aus dem PRD erstellen          ║
║ • Systemarchitektur entwerfen (C4-Diagramme)              ║
║ • Datenmodell und API-Design definieren                   ║
║ • Architecture Decision Records (ADRs) dokumentieren      ║
║ • Teststrategie planen                                    ║
╚══════════════════════════════════════════════════════════╝
```

### Schritt 2: Planungsartefakte laden

```
╔══════════════════════════════════════════════════════════╗
║            PLANUNGSARTEFAKTE LADEN                        ║
╠══════════════════════════════════════════════════════════╣
║                                                           ║
║ PRD-Analyse:                                              ║
║ ├── ✅ prd.md geladen                                     ║
║ ├── Funktionale Anforderungen: 12                         ║
║ ├── Nicht-funktionale Anforderungen: 8                    ║
║ └── Erforderliche Integrationen: 2                        ║
║                                                           ║
║ Backlog-Zusammenfassung:                                  ║
║ ├── ✅ backlog/ geladen                                   ║
║ ├── EPICs: 4                                              ║
║ ├── User Stories: 18                                      ║
║ └── Gesamte Story Points: 89                              ║
║                                                           ║
║ Einschränkungen (falls Enterprise):                       ║
║ └── ✅ analysis/constraints.md geladen                    ║
║                                                           ║
╚══════════════════════════════════════════════════════════╝
```

### Schritt 3: Design-Aufgaben

Design-Aufgaben in Reihenfolge ausführen:

```
╔══════════════════════════════════════════════════════════╗
║                 DESIGN-AUFGABEN                           ║
╠══════════════════════════════════════════════════════════╣
║                                                           ║
║ □ Aufgabe 1: Tech Spec erstellen                          ║
║   Befehl: /project:generate-tech-spec                     ║
║   Ausgabe: project-management/tech-spec.md                ║
║                                                           ║
║ □ Aufgabe 2: Architektur-Design                           ║
║   C4-Diagramme erstellen (Kontext, Container, Komponente) ║
║   Ausgabe: project-management/architecture/               ║
║                                                           ║
║ □ Aufgabe 3: Datenmodell-Design                           ║
║   ERD und Datenbankschema                                 ║
║   Ausgabe: project-management/architecture/erd.md         ║
║                                                           ║
║ □ Aufgabe 4: API-Design                                   ║
║   Endpoints, Payloads, Authentifizierung                  ║
║   Ausgabe: project-management/architecture/api.md         ║
║                                                           ║
║ □ Aufgabe 5: ADRs erstellen                               ║
║   Wichtige technische Entscheidungen dokumentieren        ║
║   Ausgabe: docs/adr/                                      ║
║                                                           ║
║ □ Aufgabe 6: Sicherheitsüberprüfung                       ║
║   OWASP-Checkliste, Authentifizierungsstrategie           ║
║   Ausgabe: project-management/architecture/security.md    ║
║                                                           ║
╚══════════════════════════════════════════════════════════╝
```

### Schritt 4: Tech-Spec-Generierung ausführen

```
Starte /project:generate-tech-spec...

PRD-Anforderungen analysieren...
Bestehende Codebase-Muster erkennen...

[Tech-Spec-Generierungsworkflow läuft mit interaktivem Q&A]

✅ Tech Spec erstellt: project-management/tech-spec.md
```

### Schritt 5: Architekturdiagramme

C4-Architekturdiagramme erstellen:

```
╔══════════════════════════════════════════════════════════╗
║             ARCHITEKTURDIAGRAMME                          ║
╠══════════════════════════════════════════════════════════╣
║                                                           ║
║ C4 Ebene 1 - Systemkontext:                               ║
║ ┌─────────────────────────────────────────────────────┐  ║
║ │                                                     │  ║
║ │     [Benutzer] ────► [Unser System] ────► [Stripe]  │  ║
║ │                           │                         │  ║
║ │                           ▼                         │  ║
║ │                      [SendGrid]                     │  ║
║ │                                                     │  ║
║ └─────────────────────────────────────────────────────┘  ║
║                                                           ║
║ C4 Ebene 2 - Container:                                   ║
║ ┌─────────────────────────────────────────────────────┐  ║
║ │                                                     │  ║
║ │  [React SPA] ──► [Symfony API] ──► [PostgreSQL]    │  ║
║ │                       │                             │  ║
║ │                       ▼                             │  ║
║ │                    [Redis]                          │  ║
║ │                                                     │  ║
║ └─────────────────────────────────────────────────────┘  ║
║                                                           ║
║ Erstellte Dateien:                                        ║
║ ├── architecture/c4-context.md                            ║
║ ├── architecture/c4-container.md                          ║
║ └── architecture/c4-component.md                          ║
║                                                           ║
╚══════════════════════════════════════════════════════════╝
```

### Schritt 6: ADR-Erstellung

Wichtige Architekturentscheidungen dokumentieren:

```
╔══════════════════════════════════════════════════════════╗
║        ARCHITECTURE DECISION RECORDS (ADRs)               ║
╠══════════════════════════════════════════════════════════╣
║                                                           ║
║ Erstellte ADRs:                                           ║
║                                                           ║
║ ┌─────────────────────────────────────────────────────┐  ║
║ │ ADR-001: Datenbankwahl                               │  ║
║ │ Entscheidung: PostgreSQL                             │  ║
║ │ Begründung: ACID-Konformität, JSON-Unterstützung,    │  ║
║ │             bestehend                                │  ║
║ └─────────────────────────────────────────────────────┘  ║
║                                                           ║
║ ┌─────────────────────────────────────────────────────┐  ║
║ │ ADR-002: API-Stil                                    │  ║
║ │ Entscheidung: REST mit JSON:API                      │  ║
║ │ Begründung: Team-Expertise, Caching, Einfachheit     │  ║
║ └─────────────────────────────────────────────────────┘  ║
║                                                           ║
║ ┌─────────────────────────────────────────────────────┐  ║
║ │ ADR-003: Authentifizierung                           │  ║
║ │ Entscheidung: JWT mit Refresh-Tokens                 │  ║
║ │ Begründung: Zustandslos, mobilfreundlich, Standard   │  ║
║ └─────────────────────────────────────────────────────┘  ║
║                                                           ║
║ Dateien: docs/adr/ADR-001.md, ADR-002.md, ADR-003.md     ║
║                                                           ║
╚══════════════════════════════════════════════════════════╝
```

### Schritt 7: Design-Review-Gate

```
╔══════════════════════════════════════════════════════════╗
║              DESIGN-REVIEW-GATE                           ║
╠══════════════════════════════════════════════════════════╣
║                                                           ║
║ Checkliste:                                               ║
║ ✅ Tech Spec deckt alle PRD-Anforderungen ab              ║
║ ✅ Architektur unterstützt NFRs (Leistung, Sicherheit)   ║
║ ✅ Datenmodell behandelt alle Entitäten                   ║
║ ✅ API-Design deckt alle User Stories ab                  ║
║ ✅ Sicherheitsaspekte dokumentiert                        ║
║ ✅ Teststrategie definiert                                ║
║ ✅ Deployment-Ansatz dokumentiert                         ║
║                                                           ║
║ Review-Fragen:                                            ║
║ 1. Ist die Architektur für den Umfang angemessen?         ║
║ 2. Fehlen Integrationen?                                  ║
║ 3. Ist der Sicherheitsansatz ausreichend?                 ║
║ 4. Sind die ADRs vollständig und begründet?               ║
║                                                           ║
╚══════════════════════════════════════════════════════════╝
```

### Schritt 8: Phasenabschluss

```
╔══════════════════════════════════════════════════════════╗
║              DESIGNPHASE ABGESCHLOSSEN                    ║
╠══════════════════════════════════════════════════════════╣
║                                                           ║
║ Erstellte Artefakte:                                      ║
║ ✅ tech-spec.md            Technische Spezifikation       ║
║ ✅ architecture/                                          ║
║    ├── c4-context.md       Systemkontext-Diagramm         ║
║    ├── c4-container.md     Container-Diagramm             ║
║    ├── c4-component.md     Komponenten-Diagramm           ║
║    ├── erd.md              Entity-Relationship-Diagramm   ║
║    ├── api.md              API-Design                     ║
║    └── security.md         Sicherheitsaspekte             ║
║ ✅ docs/adr/               3 Architecture Decision Records║
║                                                           ║
║ Zusammenfassung:                                          ║
║ • 24 API-Endpoints entworfen                              ║
║ • 8 Datenbank-Entitäten definiert                         ║
║ • 3 externe Integrationen spezifiziert                    ║
║ • 80% Testabdeckungsziel festgelegt                       ║
║                                                           ║
║ ─────────────────────────────────────────────────────────║
║ NÄCHSTE PHASE: Implementierung                            ║
║ Befehl: /workflow:implement                               ║
║ ─────────────────────────────────────────────────────────║
║                                                           ║
║ Bereit für den Start der Sprint-1-Entwicklung!            ║
╚══════════════════════════════════════════════════════════╝
```

## Beteiligte Agenten

- **tech-lead**: Gesamtes technisches Design und ADR-Erstellung
- **api-designer**: REST/GraphQL API-Design
- **database-architect**: Datenmodell- und Schema-Design
- **ui-designer**: Frontend-Architektur (falls zutreffend)
- **devops-engineer**: Deployment- und Infrastruktur-Design

## Ausgabedateien

| Datei | Zweck |
|-------|-------|
| `tech-spec.md` | Vollständige technische Spezifikation |
| `architecture/c4-*.md` | C4-Architekturdiagramme |
| `architecture/erd.md` | Entity-Relationship-Diagramm |
| `architecture/api.md` | API-Endpoint-Dokumentation |
| `architecture/security.md` | Sicherheitsdesign |
| `docs/adr/*.md` | Architecture Decision Records |

## Verwandte Befehle

- `/workflow:plan` - Vorherige Phase
- `/workflow:implement` - Nächste Phase
- `/workflow:status` - Fortschritt prüfen
- `/project:generate-tech-spec` - Direkte Tech-Spec-Generierung
- `/common:architecture-decision` - Einzelne ADRs erstellen
