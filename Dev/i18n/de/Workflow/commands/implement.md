---
name: workflow-implement
description: Die Implementierungsphase durchführen - Sprint-Entwicklung mit TDD/BDD
arguments:
  - name: sprint
    description: Spezifische Sprint-Nummer zur Bearbeitung
    required: false
---

# /workflow:implement

## Mission

Die Implementierungsphase des Entwicklungs-Workflows durchführen. Diese Phase konzentriert sich auf die Sprint-weise Entwicklung mit TDD/BDD-Praktiken, entsprechend dem in den vorherigen Phasen erstellten technischen Design.

## Wann verwenden

- Nach Abschluss von `/workflow:design` (Standard/Enterprise-Tracks)
- Nach `/workflow:init` für Quick-Flow-Track
- Wenn bereit zum Coding

## Voraussetzungen

Für Standard/Enterprise-Tracks:
- Tech Spec existiert unter `project-management/tech-spec.md`
- Backlog existiert unter `project-management/backlog/`
- Sprint-Struktur definiert in `project-management/sprints/`

Für Quick Flow:
- Klares Verständnis des zu implementierenden Bugs/Features

## Plan-Modus

> **Der Plan-Modus ist obligatorisch.** Vor der Ausführung aktiviert Claude den Plan-Modus, um betroffenen Code zu analysieren, einen Implementierungsplan vorzuschlagen und auf Ihre Validierung zu warten, bevor Änderungen vorgenommen werden.

## Workflow

### Schritt 1: Implementierungs-Setup

```
╔══════════════════════════════════════════════════════════╗
║         IMPLEMENTIERUNGSPHASE - START                     ║
╠══════════════════════════════════════════════════════════╣
║ Track: Standard                                           ║
║ Phase: 4 von 4 - Implementierung                          ║
║                                                           ║
║ Ziele:                                                    ║
║ • Sprint-Entwicklung mit TDD/BDD durchführen              ║
║ • User Stories gemäß Tech Spec implementieren             ║
║ • Codequalität und Testabdeckung sicherstellen            ║
║ • Definition of Done für jede Story erfüllen              ║
╚══════════════════════════════════════════════════════════╝
```

### Schritt 2: Sprint-Auswahl

```
╔══════════════════════════════════════════════════════════╗
║               SPRINT-ÜBERSICHT                            ║
╠══════════════════════════════════════════════════════════╣
║                                                           ║
║ Verfügbare Sprints:                                       ║
║                                                           ║
║ ┌─────────────────────────────────────────────────────┐  ║
║ │ Sprint 1: Walking Skeleton                           │  ║
║ │ Status: Bereit zum Start                             │  ║
║ │ Stories: 5 | Punkte: 21                              │  ║
║ │ Fokus: Infrastruktur + erstes End-to-End-Feature     │  ║
║ └─────────────────────────────────────────────────────┘  ║
║                                                           ║
║ ┌─────────────────────────────────────────────────────┐  ║
║ │ Sprint 2: Kernfunktionen                             │  ║
║ │ Status: Geplant                                      │  ║
║ │ Stories: 6 | Punkte: 28                              │  ║
║ │ Fokus: Benutzerverwaltung, Authentifizierung         │  ║
║ └─────────────────────────────────────────────────────┘  ║
║                                                           ║
║ ┌─────────────────────────────────────────────────────┐  ║
║ │ Sprint 3: Zahlungsintegration                        │  ║
║ │ Status: Geplant                                      │  ║
║ │ Stories: 4 | Punkte: 24                              │  ║
║ │ Fokus: Stripe-Integration, Checkout-Flow             │  ║
║ └─────────────────────────────────────────────────────┘  ║
║                                                           ║
║ Sprint zur Bearbeitung auswählen (Standard: Sprint 1)     ║
╚══════════════════════════════════════════════════════════╝
```

### Schritt 3: Weiterleitung zur Sprint-Entwicklung

Für die vollständige Sprint-Ausführung leitet dieser Befehl zum spezialisierten sprint-dev-Befehl weiter:

```
╔══════════════════════════════════════════════════════════╗
║         SPRINT-ENTWICKLUNG WIRD GESTARTET                 ║
╠══════════════════════════════════════════════════════════╣
║                                                           ║
║ Aufrufen: /sprint:dev sprint-001-walking-skeleton ║
║                                                           ║
║ Sprint-Entwicklungsmodus-Funktionen:                      ║
║ • Obligatorischer Plan-Modus vor jeder Aufgabe            ║
║ • TDD-Zyklus: RED → GREEN → REFACTOR                      ║
║ • Automatische Statusaktualisierungen                     ║
║ • Conventional Commits mit Story-Referenzen               ║
║ • Definition-of-Done-Validierung                          ║
║                                                           ║
╚══════════════════════════════════════════════════════════╝
```

### Schritt 4: Implementierungskontext

Kontext aus der Designphase bereitstellen:

```
╔══════════════════════════════════════════════════════════╗
║         IMPLEMENTIERUNGSKONTEXT                           ║
╠══════════════════════════════════════════════════════════╣
║                                                           ║
║ Aus Tech Spec:                                            ║
║ ├── Architektur: Clean Architecture (Hexagonal)           ║
║ ├── API-Stil: REST mit JSON:API                           ║
║ ├── Auth: JWT mit Refresh-Tokens                          ║
║ ├── Datenbank: PostgreSQL mit Doctrine ORM                ║
║ └── Testing: PHPUnit + Jest + Playwright                  ║
║                                                           ║
║ Relevante ADRs:                                           ║
║ ├── ADR-001: Datenbankwahl (PostgreSQL)                   ║
║ ├── ADR-002: API-Stil (REST)                              ║
║ └── ADR-003: Authentifizierung (JWT)                      ║
║                                                           ║
║ Code-Standards:                                           ║
║ ├── Bestehende Muster in der Codebase befolgen            ║
║ ├── Testabdeckungsziel: 80%                               ║
║ └── Technologiespezifische Regeln verwenden:              ║
║     /symfony:*, /react:*, etc.                            ║
║                                                           ║
╚══════════════════════════════════════════════════════════╝
```

### Schritt 5: Quick-Flow-Modus

Für Quick-Flow-Track (Bugfixes, kleine Features):

```
╔══════════════════════════════════════════════════════════╗
║         QUICK FLOW - DIREKTE IMPLEMENTIERUNG              ║
╠══════════════════════════════════════════════════════════╣
║                                                           ║
║ Keine Sprint-Struktur für Quick Flow erforderlich.        ║
║                                                           ║
║ Verfügbare Befehle:                                       ║
║                                                           ║
║ Für Bugfixes:                                             ║
║ • /qa:tdd        - Fix mit TDD-Ansatz         ║
║                                                           ║
║ Für kleine Features:                                      ║
║ • /{tech}:* Befehle          - Technologiespezifisch      ║
║                                                           ║
║ Tracking:                                                 ║
║ • /project:add-task          - Als Aufgabe verfolgen      ║
║ • /project:move-task done    - Als erledigt markieren     ║
║                                                           ║
╚══════════════════════════════════════════════════════════╝
```

### Schritt 6: Sprint-Abschluss

Nach Sprint-Abschluss:

```
╔══════════════════════════════════════════════════════════╗
║         SPRINT ABGESCHLOSSEN                              ║
╠══════════════════════════════════════════════════════════╣
║                                                           ║
║ Sprint 1: Walking Skeleton                                ║
║ Status: ✅ Abgeschlossen                                  ║
║                                                           ║
║ Metriken:                                                 ║
║ ├── Abgeschlossene Stories: 5/5                           ║
║ ├── Gelieferte Punkte: 21                                 ║
║ ├── Velocity: 21 Pkt./Sprint                              ║
║ ├── Testabdeckung: 82%                                    ║
║ └── Commits: 23                                           ║
║                                                           ║
║ Artefakte:                                                ║
║ ├── sprint-review.md erstellt                             ║
║ └── sprint-retro.md Vorlage bereit                        ║
║                                                           ║
║ ─────────────────────────────────────────────────────────║
║ NÄCHSTE AKTIONEN:                                         ║
║ ─────────────────────────────────────────────────────────║
║                                                           ║
║ 1. /workflow:review     - Sprint-Review durchführen  ║
║ 2. /workflow:retro      - Retrospektive durchführen  ║
║ 3. /workflow:implement 2     - Sprint 2 starten           ║
║                                                           ║
║ Oder Gesamtfortschritt prüfen: /workflow:status           ║
╚══════════════════════════════════════════════════════════╝
```

### Schritt 7: Workflow-Abschluss

Wenn alle Sprints abgeschlossen sind:

```
╔══════════════════════════════════════════════════════════╗
║         IMPLEMENTIERUNGSPHASE ABGESCHLOSSEN               ║
╠══════════════════════════════════════════════════════════╣
║                                                           ║
║ Alle geplanten Sprints abgeschlossen!                     ║
║                                                           ║
║ Projektzusammenfassung:                                   ║
║ ├── Gesamte Sprints: 4                                    ║
║ ├── Gesamte Stories: 18                                   ║
║ ├── Gesamte Punkte: 89                                    ║
║ ├── Durchschnittliche Velocity: 22 Pkt./Sprint            ║
║ ├── Testabdeckung: 84%                                    ║
║ └── Gesamte Commits: 87                                   ║
║                                                           ║
║ Nächste Schritte:                                         ║
║ • /common:release-checklist  - Release vorbereiten        ║
║ • /common:generate-changelog - Release Notes erstellen    ║
║ • Auf Staging/Produktion deployen                         ║
║                                                           ║
║ ═══════════════════════════════════════════════════════  ║
║           PROJEKT-WORKFLOW ABGESCHLOSSEN!                 ║
║ ═══════════════════════════════════════════════════════  ║
╚══════════════════════════════════════════════════════════╝
```

## Beteiligte Agenten

- **tech-lead**: Aufgabenzerlegung, Architekturberatung
- **tdd-coach**: TDD/BDD-Methodikberatung
- **{tech}-reviewer**: Code-Review (Symfony, Flutter, React, Python, ReactNative)
- **devops-engineer**: CI/CD und Deployment

## Verwandte Befehle

- `/workflow:design` - Vorherige Phase
- `/workflow:status` - Fortschritt prüfen
- `/sprint:dev` - Vollständiger Sprint-Entwicklungsmodus
- `/qa:tdd` - Schnelle Bugfixes
- `/workflow:review` - Sprint-Review-Zeremonie
- `/workflow:retro` - Sprint-Retrospektive
