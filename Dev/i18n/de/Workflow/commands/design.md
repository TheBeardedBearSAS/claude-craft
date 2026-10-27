---
name: workflow-design
description: "Die Designphase (Solutioning) durchführen - technische Spezifikation (Standard) oder Projekt-Constitution (--constitution) erzeugen"
argument-hint: "[--constitution] [--continue]"
arguments:
  - name: constitution
    description: Die Projekt-Constitution (project-management/constitution.md) statt der technischen Spezifikation erzeugen
    required: false
  - name: continue
    description: Dort fortfahren, wo aufgehört wurde
    required: false
---

# /workflow:design

## Auftrag

Die Designphase (Solutioning) durchführen: das PRD in eine technische Spezifikation, Architekturdiagramme, Datenmodell, API-Design und ADRs überführen. Mit `--constitution` werden stattdessen die unveränderlichen Projektentscheidungen in einer Projekt-Constitution festgehalten.

## Verwendung

| Aufruf | Was es tut | Ersetzt |
|--------|------------|---------|
| `/workflow:design` | Liest `project-management/prd.md`, schreibt `project-management/tech-spec.md` + Architekturdateien + ADRs | `/workflow:design` |
| `/workflow:design --constitution` | Schreibt `project-management/constitution.md` (unveränderliche Entscheidungen, von `/gate:check alignment` genutzt) | `/workflow:design --constitution` |
| `/workflow:design --continue` | Setzt eine unterbrochene Design-Sitzung fort | - |

Kanonische Dokumentenreihenfolge: PRD → Tech-Spec → Backlog → Sprint.

## Wann verwenden

- Tracks **Standard** und **Enterprise**
- Nach `/workflow:plan --only=prd`
- `--constitution`: zu Projektbeginn (oder sobald Entscheidungen festgeschrieben werden müssen)

## Voraussetzungen

- Das PRD existiert unter `project-management/prd.md` (`--constitution`: nur optionale Quellen, siehe unten)
- Technologie-Stack identifiziert (bei neuen Projekten interaktiv abgefragt)

## Plan Mode

> **Der Plan Mode ist verpflichtend.** Claude aktiviert den Plan Mode, um den betroffenen Code zu analysieren, eine Generierungsstrategie vorzuschlagen und Ihre Freigabe abzuwarten, bevor Artefakte erstellt werden.

## Workflow: Tech-Spec (Standard)

### Schritt 1: PRD-Analyse

```
╔══════════════════════════════════════════════════════════╗
║            DESIGNPHASE - START                            ║
║ Track: Standard | Phase: 3 von 4 - Design (Solutioning)   ║
║ Lade project-management/prd.md ...                        ║
║ ├── Funktionale Anforderungen: 12                         ║
║ ├── Nicht-funktionale Anforderungen: 8                    ║
║ └── Erforderliche Integrationen: 2                        ║
╚══════════════════════════════════════════════════════════╝
```

Aus dem PRD extrahieren: funktionale Anforderungen (`FR-xxx`), nicht-funktionale Anforderungen (Performance, Sicherheit, Skalierbarkeit), Personas und Journeys, Constraints und Annahmen, Integrationen. Falls `project-management/analysis/constraints.md` existiert (Enterprise), wird sie ebenfalls geladen.

### Schritt 2: Codebase-Analyse

Bestehende Codebase: Stack erkennen (Backend, Frontend, Datenbank, Cache, Infrastruktur) sowie vorhandene Patterns (Architektur, API-Stil, Auth, Tests) und konsistent dazu bleiben.

Neues Projekt: die Technologiefragen stellen.

```
┌─────────────────────────────────────────────────────────┐
│ FRAGEN - Technologie-Stack                               │
├─────────────────────────────────────────────────────────┤
│ 1. Bevorzugtes Backend-Framework? (Symfony/Laravel/Node) │
│ 2. Frontend-Framework? (React/Vue/Angular/Keines)        │
│ 3. Bevorzugte Datenbank? (PostgreSQL/MySQL/MongoDB)      │
│ 4. Deployment-Ziel? (Docker/K8s/Serverless/VPS)          │
│ 5. Bestehende Integrationen zu berücksichtigen?          │
└─────────────────────────────────────────────────────────┘
```

### Schritt 3: Architekturfragen

```
┌─────────────────────────────────────────────────────────┐
│ FRAGEN - Architekturentscheidungen                       │
├─────────────────────────────────────────────────────────┤
│ 1. Monolith oder Microservices?                          │
│ 2. Bevorzugter API-Stil? (REST/GraphQL/gRPC)             │
│ 3. Erwartete Skalierung? (Nutzer, Requests/s)            │
│ 4. Echtzeit-Funktionen nötig? (WebSockets/SSE)           │
│ 5. Anforderungen an Dateispeicher? (S3/lokal/CDN)        │
│ 6. Bedarf an Hintergrund-Jobs?                           │
│ 7. Drittanbieter-Integrationen? (Zahlung, E-Mail, usw.)  │
└─────────────────────────────────────────────────────────┘
```

### Schritt 4: Design-Aufgaben

In dieser Reihenfolge ausführen:

| # | Aufgabe | Ausgabe |
|---|---------|---------|
| 1 | Tech-Spec (Template `.claude/templates/project/tech-spec.md`) | `project-management/tech-spec.md` |
| 2 | C4-Diagramme (Kontext, Container, Komponente) | `project-management/architecture/c4-*.md` |
| 3 | Datenmodell: ERD (Mermaid `erDiagram`) + Schemas; Beziehungen, fehlende Entitäten und Indexierung validieren | `project-management/architecture/erd.md` |
| 4 | API-Design: aus FR-xxx und Personas abgeleitete Endpoints, Payloads, Fehler, Auth | `project-management/architecture/api.md` |
| 5 | Sicherheit und Performance: OWASP-Maßnahmen, authN/authZ, Verschlüsselung, Rate Limiting, DSGVO-Lücken | `project-management/architecture/security.md` |
| 6 | ADRs für Schlüsselentscheidungen (Datenbank, API-Stil, Authentifizierung) | `docs/adr/ADR-00x-*.md` |
| 7 | Teststrategie (Abdeckungsziel 80 %), CI/CD und Deployment, Monitoring | in `tech-spec.md` |

Beispiel einer Sicherheits-Checkliste:

```
✅ Authentifizierung: JWT mit HttpOnly-Cookies
✅ Autorisierung: RBAC mit Policies
✅ Datenverschlüsselung: AES-256 im Ruhezustand, TLS 1.3 bei der Übertragung
✅ Eingabevalidierung: DTO-Validierung + Sanitisierung
✅ Rate Limiting: 100 Req/min pro Nutzer
⚠️  DSGVO-Konformität: Richtlinie zur Datenaufbewahrung fehlt
```

### Schritt 5: Design-Review-Gate

- Die Tech-Spec deckt alle PRD-Anforderungen ab (jede `FR-xxx` ist nachverfolgbar)
- Die Architektur unterstützt die NFRs (Performance, Sicherheit)
- Das Datenmodell behandelt alle Entitäten; das API-Design deckt alle User Stories ab
- Sicherheit, Teststrategie und Deployment-Ansatz sind dokumentiert
- ADRs vollständig und begründet

Iterationen anbieten: Caching-Strategie, erweiterte API-Dokumentation, Deployment-Pipeline.

### Schritt 6: Abschluss

```
╔══════════════════════════════════════════════════════════╗
║            DESIGNPHASE ABGESCHLOSSEN                      ║
║ ✅ project-management/tech-spec.md                        ║
║ ✅ project-management/architecture/ (c4, erd, api, sec.) ║
║ ✅ docs/adr/ (3 ADRs)                                     ║
║ • 24 API-Endpoints • 8 Entitäten • 3 Integrationen        ║
║                                                           ║
║ NÄCHSTER SCHRITT: /workflow:plan --only=backlog           ║
║ DANACH: /workflow:start 1                                 ║
╚══════════════════════════════════════════════════════════╝
```

Das Backlog liest `project-management/prd.md` und, sobald vorhanden, `project-management/tech-spec.md`. Nach dem Design `/workflow:plan --only=backlog` und anschließend `/workflow:start 1` empfehlen.

## Workflow: Constitution (`--constitution`)

### Phase 1: Kontext-Erkundung

Automatische Analyse von: `README.md`, `project-management/prd.md`, `project-management/tech-spec.md`, Codebase-Struktur (Patterns, Konventionen) und `.claude/`-Konfiguration. Gefundene Quellen auflisten.

### Phase 2: Interaktive Klärung

Den Nutzer themenweise befragen, um Lücken zu schließen:

| Thema | Fragen |
|-------|--------|
| Vision & Mission | Vision in einem Satz; was, für wen, warum; nicht verhandelbare Ziele; was das Projekt scheitern ließe |
| Technische Constraints | Festgelegte Technologien; verbindliches Architekturmuster; Infrastruktur-Constraints; verpflichtende Drittanbieter-Integrationen |
| Designprinzipien | Verbindliche Patterns; verbotene Patterns/Praktiken; Code-Standards; geforderte Teststrategie |
| Nicht-funktionale Anforderungen | Performance-Ziele (Latenz, Last); Sicherheit; Compliance (DSGVO, SOC2); Verfügbarkeit/Uptime |
| Grenzen | Außerhalb des Umfangs; externe Systeme; Teamgrenzen und Verantwortlichkeiten; wer die Constitution ändern darf |

### Phase 3: Generierung

1. Template `.claude/templates/project/constitution.md` laden
2. Vision, Mission und nicht verhandelbare Ziele ausfüllen
3. Den Tech-Stack festschreiben (Technologien und Versionen)
4. Verbindliche und verbotene Patterns festhalten
5. Ziele für Performance, Sicherheit und Compliance erfassen
6. Ausschlüsse, Integrationsgrenzen und den Änderungsprozess dokumentieren

### Phase 4: Review und Ratifizierung

Ausgabe: `project-management/constitution.md` mit den Abschnitten Vision & Mission, Technische Constraints, Designprinzipien, Nicht-funktionale Anforderungen, Grenzen, Änderungsprozess. Anbieten, festgeschriebene Entscheidungen anzupassen, Constraints zu ergänzen oder Grenzen zu schärfen. Optionale Erkundungsnotizen landen in `project-management/analysis/discovery-notes.md`.

Die Constitution ist die von `/gate:check alignment` genutzte Referenz. Nächste Schritte: `/workflow:plan --only=prd`, falls noch kein PRD existiert, andernfalls das Standard-`/workflow:design` ausführen.

## Beteiligte Agents

- **tech-lead**: Gesamtes technisches Design und ADR-Erstellung
- **api-designer**: REST/GraphQL-API-Design
- **database-architect**: Datenmodell und Schema-Design
- **ui-designer**: Frontend-Architektur (falls zutreffend)
- **devops-engineer**: Deployment- und Infrastruktur-Design

## Ausgabedateien

| Datei | Zweck |
|-------|-------|
| `project-management/tech-spec.md` | Vollständige technische Spezifikation |
| `project-management/constitution.md` | Projekt-Constitution (`--constitution`) |
| `project-management/architecture/c4-*.md` | C4-Architekturdiagramme |
| `project-management/architecture/erd.md` | Entity-Relationship-Diagramm |
| `project-management/architecture/api.md` | Dokumentation der API-Endpoints |
| `project-management/architecture/security.md` | Sicherheitsdesign |
| `docs/adr/*.md` | Architecture Decision Records |

## Beispielsitzung

```
User: /workflow:design

Claude: Lade project-management/prd.md: 12 FR, 8 NFR.
Erkannt: Symfony + React + PostgreSQL.
❓ Die aktuelle API ist REST. REST beibehalten oder auf GraphQL migrieren?
> REST beibehalten
[... interaktive Q&A ...]
✅ Tech-Spec erzeugt: project-management/tech-spec.md
Weiter: /workflow:plan --only=backlog, dann /workflow:start 1
```

## Verwandte Befehle

- `/workflow:plan` - Vorherige Phase (`--only=prd`, `--only=backlog`)
- `/workflow:start` - Den ersten Sprint starten
- `/workflow:implement` - Implementierungsphase
- `/workflow:status` - Fortschritt prüfen
- `/gate:check` - Quality Gates (`alignment` nutzt die Constitution)
- `/common:architecture-decision` - Einzelne ADRs erstellen
