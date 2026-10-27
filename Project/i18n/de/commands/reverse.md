---
description: "Brownfield-Reverse-Engineering-Pipeline: Codebasis scannen, dann einen PRD-Entwurf, User Stories und eine Lückenanalyse Spezifikation vs. Code ableiten"
argument-hint: "[scan|prd|stories|gaps|all] [--scope=<scope>] [--module=<name>] [--output=<path>]"
---

# /project:reverse

## Mission

Spezifikationen aus einer bestehenden Codebasis rekonstruieren (Brownfield-Projekte). Ein einziger Befehl deckt die gesamte Pipeline ab: den Code inventarisieren (`scan`), einen PRD-Entwurf ableiten (`prd`), User Stories ableiten (`stories`) und die Spezifikationen mit dem Code vergleichen (`gaps`). `all` führt die vier Schritte nacheinander aus.

## Verwendung

| Befehl | Funktion | Ersetzt |
|--------|----------|---------|
| `/project:reverse scan` | Inventar von Modulen, Endpoints, Modellen, Services, Tests, Infrastruktur | `/project:reverse scan` |
| `/project:reverse prd` | Aus dem Code abgeleiteter PRD-ENTWURF | `/project:reverse prd` |
| `/project:reverse stories` | Aus Code und Tests abgeleitete User-Story-ENTWÜRFE | `/project:reverse stories` |
| `/project:reverse gaps` | Lückenanalyse Spezifikation vs. Code, nach Schweregrad sortiert | `/project:reverse gaps` |
| `/project:reverse all` | `scan` -> `prd` -> `stories` -> `gaps`, in dieser Reihenfolge | alle vier |

## Argumente

`$ARGUMENTS` auswerten: erstes Token = Unterbefehl (`scan`, `prd`, `stories`, `gaps`, `all`). Ohne Unterbefehl nachfragen, welcher gewünscht ist (beim ersten Lauf `all` empfehlen). Flags:

| Flag | Gilt für | Beschreibung |
|------|---------|--------------|
| `--scope=<scope>` | `scan`: all, backend, frontend, api, tests / `stories`: all, module, endpoint / `gaps`: full, requirements, stories, code | Begrenzt die Analyse |
| `--module=<name>` | `stories` | Stories nur für ein Modul erzeugen |
| `--output=<path>` | `scan`, `prd` | Ausgabepfad (Standardwerte unten) |

## Gemeinsame Regeln

**Der Plan-Modus ist verpflichtend.** Vor der Ausführung den Plan-Modus aktivieren, den Plan vorschlagen und auf Freigabe warten, bevor Dateien geändert werden. Mit `all` deckt ein einziger Plan alle vier Schritte ab.

**Regeln zur Persona-Ableitung (verwendet von `prd` und `stories`):**

| Authentifizierungsmuster | Abgeleitete Persona |
|--------------------------|---------------------|
| `ROLE_ADMIN` + Admin-Routen | Administrator |
| `ROLE_USER` + authentifizierte Routen | Registrierter Benutzer |
| `ROLE_MANAGER` + Management-Routen | Manager / Vorgesetzter |
| Öffentliche Endpoints (ohne Auth) | Besucher / anonym |
| API-Key-Authentifizierung | Externes System |

**Alles Abgeleitete ist ein ENTWURF.** Der Code zeigt, was das System tut, nicht, was es tun sollte. Jedes abgeleitete Artefakt mit `INFERRED` kennzeichnen und eine menschliche Validierung verlangen, bevor es als maßgeblich gilt. Marker, der in jede abgeleitete Sektion bzw. Story eingefügt wird:

```
> INFERRED -- Durch Analyse der bestehenden Codebasis erzeugt.
> Eine menschliche Validierung ist erforderlich, bevor dies als maßgeblich gilt.
```

**Statusregel:** `.bmad/sprint-status.yaml` ist die einzige Wahrheitsquelle für den STATUS von Stories/Tasks. Erzeugte Stories enthalten nur Inhalt (kein Statusfeld); nach der Validierung in `.bmad/sprint-status.yaml` eintragen (Schema: `.claude/templates/project/sprint-status.md`).

**Standardpfade:**

```
project-management/
+-- scan-report.md                  # scan
+-- prd.md                          # prd (ENTWURF)
+-- backlog/user-stories/US-*.md    # stories
+-- analysis/
    +-- reverse-engineering.md      # prd: Analysenotizen und Konfidenzstufen
    +-- gap-analysis.md             # gaps
```

**Voraussetzungen:** Quellcode zugänglich; `README.md`, `docker-compose.yml`, `./docs/` optional. `prd`, `stories` und `gaps` benötigen `project-management/scan-report.md` -- fehlt er, zuerst `scan` ausführen (automatisch bei `all`). `gaps` benötigt zusätzlich ein PRD (`project-management/prd.md`, aus `/workflow:plan --only=prd` oder `prd`); `stories` und `gaps` nutzen es, sofern vorhanden, für die FR-xxx-Rückverfolgbarkeit.

**Ausgabekonvention:** Jeder Schritt zeigt ein eingerahmtes Fortschrittsbanner, endet mit einer kurzen Zusammenfassung und schlägt die nächsten Schritte vor (interaktiv validieren, nächsten Unterbefehl starten). Bei `all` nach `prd` und `stories` eine Pause für die menschliche Validierung einlegen, bevor `gaps` folgt.

## scan

Einstiegspunkt der Pipeline: ein strukturiertes Inventar der Codebasis.

**1. Stack-Erkennung.** Das Wurzelverzeichnis nach Framework-Markern durchsuchen, das Manifest lesen (`composer.json`, `package.json`, `pubspec.yaml`, `*.csproj`, `pyproject.toml`), Framework-Version und wichtige Abhängigkeiten ermitteln, die Infrastruktur erkennen (Docker, CI/CD, Redis, Queues) und den passenden Reviewer-Agent wählen (`@symfony-reviewer`, `@react-reviewer`...).

| Dateimuster | Stack |
|-------------|-------|
| `*.php` + `symfony.lock` | Symfony |
| `*.php` + `artisan` | Laravel |
| `*.php` + `composer.json` | PHP (generisch) |
| `*.dart` + `pubspec.yaml` | Flutter |
| `*.tsx` / `*.jsx` + `next.config.*` | React (Next.js) |
| `*.tsx` / `*.jsx` + `package.json` | React |
| `*.vue` + `package.json` | Vue.js |
| `angular.json` | Angular |
| `*.cs` + `*.csproj` | .NET / C# |
| `*.py` + `pyproject.toml` | Python |
| `Dockerfile` / `docker-compose.yml` | Docker (Infra) |

**2. Strukturscan.** Dateien einordnen in:
1. Module / Domänen (Bounded Contexts, geteilte Module, Namespaces)
2. Endpoints (Routen, Controller, HTTP-Methoden, Pfade, Middleware/Guards)
3. Modelle / Entitäten (Felder, Typen, Beziehungen, Migrationen)
4. Services (Services, Use Cases, Command-/Query-Handler, Listener, Subscriber)
5. Tests (Unit / Integration / E2E, Zuordnung Test-Quelle, Frameworks)
6. Infrastruktur (Docker, CI/CD, Umgebungskonfiguration, Drittanbieter-Integrationen)

**3. Codeanalyse.** LOC pro Modul schätzen; das Architekturmuster erkennen (MVC, Clean Architecture, DDD...); Qualitätswerkzeuge erkennen (Linting, statische Analyse); den Abhängigkeitsgraphen zwischen Modulen abbilden; Marker technischer Schulden kennzeichnen; den stack-spezifischen Reviewer für fachspezifische Erkenntnisse nutzen.

**4. Bericht** unter `project-management/scan-report.md` mit den Abschnitten: Kopfzeile (Projekt, Stack, Größe, Module), Technology Stack, Modules / Bounded Contexts (Dateien, LOC, Tests, Abdeckung), Endpoints (Methode, Pfad, Controller, Auth), Models / Entities (Felder, Beziehungen, Migrationen), Services (Abhängigkeiten, Typ), Tests (Typ, Anzahl, Framework), Infrastructure (Komponente, Konfigurationsdatei, Notizen) und eine Complexity Summary.

```
| Module   | Files | LOC   | Tests | Coverage |
| User     | 24    | 1,800 | 12    | ~65%     |
| Method | Path        | Controller     | Auth |
| GET    | /api/users  | UserController | JWT  |
```

Kennzahlen der Complexity Summary: LOC gesamt, Dateien gesamt, Bounded Contexts, API-Endpoints, Datenbank-Entitäten, Testdateien, geschätzte Testabdeckung, Architekturmuster.

## prd

Brownfield-Gegenstück zu `/workflow:plan --only=prd`: ein aus dem Code abgeleiteter PRD-ENTWURF.

**1. Laden** des Scan-Berichts (sowie `./docs/` und `README.md`); Stack, Module, Endpoints, Entitäten, Services auswerten.

**2. Analyse der Geschäftslogik**, für jedes Modul: Domain Events (Payloads, Listener, Workflows), Use Cases / Commands / Queries, Validierungsregeln (Entität, Request, fachliche Assertions), Zustandsautomaten (Status-Enums, Workflow-Konfiguration, Guards), externe Integrationen (Zahlung, E-Mail, Speicher, Drittanbieter-APIs).

**3. Ableitung von Anforderungen.**

| Code-Muster | Abgeleitete Anforderung |
|-------------|-------------------------|
| Auth-Middleware / JWT | Benutzerauthentifizierung erforderlich |
| Rollenbasierte Guards | Autorisierung mit Rollen |
| CRUD-Controller | Funktionen zur Datenverwaltung |
| Datei-Upload-Handler | Dokumenten-/Medienverwaltung |
| E-Mail-Services | Benachrichtigungssystem |
| Zahlungs-Gateway | Zahlungsabwicklung |
| Export-Endpoints | Reporting-/Exportfunktionen |
| Such-/Filterlogik | Suche und Filterung |
| Paginierung | Umgang mit großen Datenmengen |
| Cache-Schichten | Performance-Anforderungen |
| Queue-Worker | Anforderungen an asynchrone Verarbeitung |
| Rate Limiting | Anforderungen an den API-Schutz |

| Infrastruktur | Abgeleitete NFR |
|---------------|-----------------|
| Docker / Kubernetes | Skalierbarkeit, Containerisierung |
| Redis / Memcached | Performance-Caching |
| Queue-System (RabbitMQ...) | Asynchrone Verarbeitung, Zuverlässigkeit |
| CI/CD-Pipelines | Deployment-Automatisierung |
| Load-Balancer-Konfiguration | Hochverfügbarkeit |
| SSL/TLS-Konfiguration | Sicherheit |
| Logging-Stack (ELK...) | Monitoring |

Die Personas stammen aus der gemeinsamen Tabelle oben.

**4. Erzeugen** von `project-management/prd.md` mit acht Abschnitten: Executive Summary (INFERRED), Problem Statement (INFERRED), Goals & Metrics (**PLACEHOLDER** -- nicht ableitbar, menschliche Eingabe nötig), Target Users / Personas (INFERRED, jeweils als Entwurf), Functional Requirements (INFERRED, eine je Funktions-/Endpoint-Gruppe, nach Komplexität und Nutzung priorisiert, mit Quellmodul versehen), Non-Functional Requirements (INFERRED), Scope & Constraints (INFERRED), Risks & Mitigations (INFERRED: Schulden, ungetestete Bereiche, Abhängigkeitsrisiken). Analysenotizen und Konfidenz je Abschnitt (HIGH / MEDIUM / LOW) nach `project-management/analysis/reverse-engineering.md` schreiben; der PRD-Kopf zeigt `Status: DRAFT - Requires human validation` und die Konfidenztabelle.

**5. Menschliche Validierung.** Eine Zusammenfassung der abgeleiteten Abschnitte zeigen, Abschnitte mit niedriger Konfidenz und nicht ableitbare (Goals, Metrics) hervorheben, den Benutzer jeden Abschnitt bestätigen / korrigieren / ergänzen lassen und iterieren, bis er zufrieden ist.

## stories

User-Story-ENTWÜRFE, abgeleitet aus Endpoints, Services, Entitäten und Tests.

**1. Laden** des Scan-Berichts und des PRD, falls vorhanden (für die FR-xxx-Rückverfolgbarkeit); den Umfang bestimmen (all, ein `--module`, ein Endpoint).

**2. Feature-Extraktion**, pro Endpoint/Feature: Controller/Handler (Methode, Route, Request-Validierung, Response und Statuscodes, Autorisierung), Service/Use Case (Geschäftsablauf, Seiteneffekte, externe Aufrufe, Fehlerpfade), Entität/Modell (Felder und Constraints, Beziehungen, Zustandsübergänge, Soft Delete/Timestamps), Tests (Methodennamen, Assertions, Fixtures, Randfälle).

**3. Story-Erzeugung.**

| Route | Abgeleitete Aktion |
|-------|--------------------|
| `POST /api/resources` | eine Ressource anlegen |
| `GET /api/resources` | Ressourcen auflisten |
| `GET /api/resources/{id}` | eine Ressource ansehen |
| `PUT /api/resources/{id}` | eine Ressource aktualisieren |
| `DELETE /api/resources/{id}` | eine Ressource löschen |
| benutzerdefinierte Aktion | aus Methodenname und Geschäftslogik |

Nutzenableitung: CRUD -> „damit ich die {resource}-Daten verwalten kann"; Suche/Filter -> „relevante {resources} schnell finden"; Export -> „die {resource}-Daten extern nutzen"; Benachrichtigungen -> „über {event} informiert werden"; Auth -> „dass meine Daten sicher und nur für mich zugänglich sind". Akzeptanzkriterien stammen aus den Tests: Fixtures -> Given, Aktionen -> When, erwartete Ergebnisse -> Then.

```markdown
# US-XXX: [Abgeleiteter Titel]

> INFERRED -- aus der Codeanalyse erzeugt. Menschliche Validierung erforderlich.

## Source
- Modul / Endpoint ({method} {path}) / Controller / Implements: FR-XXX (falls PRD vorhanden)

## User Story
As [abgeleitete Persona] I want [abgeleitete Aktion] So that [abgeleiteter Nutzen]
Conversation: [ ] Persona  [ ] Aktion entspricht der Absicht  [ ] Nutzen passt zu den Geschäftszielen
INVEST: [ ] Independent / Negotiable / Valuable / Estimable / Sized / Testable

## Acceptance Criteria (Gherkin)
Scenario: nominal (aus dem Happy Path)   Given / When / Then
Scenario: Fehler (aus der Validierung)   Given / When / Then

## Technical Notes
Entität, Validierungsregeln, Auth-Anforderungen, ausgelöste Events

## Estimation
Story Points (nach Komplexität), MoSCoW (nach Nutzungsmustern)
```

**4. Rückverfolgbarkeit** (falls `project-management/prd.md` existiert): jede Story einer FR-xxx zuordnen (`implements: FR-xxx` ergänzen), Stories ohne Anforderung (Code ohne Spezifikation) und Anforderungen ohne Story (Spezifikation ohne Code) auflisten.

**5. Ausgabe und Validierung.** Unter `project-management/backlog/user-stories/US-001-create-user.md`, `US-002-...` speichern, einen nach Modul gruppierten Übersichtsindex erzeugen (Titel, Punkte, MoSCoW, Anzahl der mit dem PRD verknüpften Stories, Anzahl der nicht verknüpften) und den Benutzer jede Story bestätigen, korrigieren oder ablehnen lassen.

## gaps

Die Spezifikationen (PRD, Stories, technische Spezifikation) mit dem tatsächlichen Code vergleichen.

**1. Spezifikationen laden:** `project-management/prd.md`, `project-management/backlog/user-stories/`, `project-management/tech-spec.md` (falls vorhanden), den Scan-Bericht (durch Ausführen von `scan` aktualisieren, falls er fehlt oder veraltet ist). FR-xxx, NFR-xxx und US-xxx auswerten.

**2. Code scannen:** Endpoints, Geschäftslogik, Datenmodelle, Tests und Infrastruktur in einem nach Modul indizierten Feature-Inventar katalogisieren.

**3. Vierfacher Vergleich:**

| Kategorie | Prüfungen |
|-----------|-----------|
| **Spezifikation ohne Code** (nicht implementiert) | FR-xxx ohne passenden Endpoint; US-xxx ohne passendes Feature; NFR-xxx ohne passende Konfiguration |
| **Code ohne Spezifikation** (undokumentiert) | Endpoints ohne FR-Bezug; Services ohne US-Bezug; Entitäten ohne Abdeckung in den Spezifikationen |
| **Abweichung Spezifikation-Code** (inkonsistent) | Unterschiede bei Feldern, Statusfluss, Auth, Validierung und Response-Format |
| **Testlücken** (ungetestet) | Features ohne Unit-/Integrationstests; Akzeptanzkriterien ohne E2E-Tests; Fehlerpfade ohne Tests |

**4. Nach Schweregrad klassifizieren:**

| Schweregrad | Kriterien | Maßnahme |
|-------------|-----------|----------|
| **Critical** | Kernfunktion fehlt oder defekt; Sicherheitslücke; Risiko für die Datenintegrität | Sofortige Behebung |
| **Major** | Wichtige Funktionslücke; deutliche Abweichung; kritische Tests fehlen | Aktueller Sprint |
| **Minor** | Dokumentationslücke; unkritische Abweichung; Tests für Randfälle fehlen | Nächster Sprint |
| **Info** | Stilinkonsistenz; optionales Feature; Verbesserung | Backlog |

Regeln: Spezifikation ohne Code + P0 = Critical, + P1 = Major, + P2 = Minor; Code ohne Spezifikation + Auth = Major, + CRUD = Minor; Abweichung + Datenintegrität = Critical, + UI/UX = Minor; Testlücke + Geschäftslogik = Major, + Randfall = Minor.

**5. Bericht** unter `project-management/analysis/gap-analysis.md`: Kopfzeile (Projekt, Datum, Umfang), Abdeckungsprozente für Spezifikation / Code / Tests, Anzahl der Lücken je Schweregrad, die vier Kategorietabellen mit Belegen (Dateipfade, Zeilenverweise) sowie eine nach Priorität sortierte Maßnahmenliste mit Aufwand (S < 2h, M 2-8h, L > 8h).

```
| # | Action                              | Severity | Effort |
| 1 | Implement FR-005 (password reset)   | Critical | M      |
| 2 | Add integration tests for payment   | Critical | S      |
```

Anschließend anbieten: Stories für fehlende Features anlegen, Tasks für die Maßnahmen erzeugen oder sich auf eine Lückenkategorie konzentrieren.

## all

`scan` -> `prd` -> `stories` -> `gaps` der Reihe nach ausführen und jede Ausgabe als Eingabe des nächsten Schritts wiederverwenden (kein erneuter Scan). Nach `prd` und `stories` eine Pause für die menschliche Validierung einlegen. Mit einer Zusammenfassung abschließen: geschriebene Dateien, Anzahl abgeleiteter Personas / Anforderungen / Stories, Anzahl der Lücken je Schweregrad und die 3 wichtigsten Maßnahmen.

## Verwandte Befehle

- `/workflow:plan --only=prd` - Ein PRD interaktiv erzeugen (Greenfield)
- `/workflow:plan --only=backlog` - Ein SCRUM-Backlog aus dem PRD erstellen
- `/workflow:design` - Eine technische Spezifikation erzeugen
- `/project:backlog` - Epics, Stories und Tasks verwalten
