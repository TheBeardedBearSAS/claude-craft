# Backlog-Management-Leitfaden

Vollständiger Workflow zur Erstellung und Verwaltung eines SCRUM-Backlogs mit Claude-Craft.

---

## Überblick

Claude-Craft bietet einen umfassenden Satz von Befehlen zur Verwaltung Ihres Product Backlogs nach der SCRUM-Methodik:

- **15 Slash-Befehle** für Backlog-Operationen
- **5 Vorlagen** für eine konsistente Struktur
- **Vertical Slicing** über alle Technologieschichten hinweg
- **INVEST-Modell**-Validierung für User Stories

### Philosophie

Basiert auf:
- den Prinzipien des Agile Manifesto
- den 12 Agilen Prinzipien
- den Grundlagen von SCRUM
- Vertical Slicing (jede US berührt alle Schichten)

---

## Initiale Backlog-Generierung

### Aus Spezifikationen

Legen Sie Ihre Projektspezifikationen in `./docs/` ab und führen Sie dann aus:

```bash
/project:generate-backlog symfony+flutter
```

### Generierte Struktur

```
project-management/
├── README.md                    # Projektübersicht
├── personas.md                  # Benutzer-Personas (min. 3)
├── definition-of-done.md        # Progressive DoD-Stufen
├── dependencies-matrix.md       # Epic- und US-Abhängigkeiten
├── backlog/
│   ├── epics/                   # EPIC-XXX-name.md Dateien
│   └── user-stories/            # US-XXX-name.md Dateien
└── sprints/
    └── sprint-XXX-goal/         # Sprint-Pläne
```

---

## SCRUM-Struktur

### Personas

Mindestens 3 Personas erforderlich, jede mit:
- **Identität**: Name, Rolle, demografische Daten
- **Ziele**: Was sie erreichen möchten
- **Frustrationen**: Schmerzpunkte, die gelöst werden sollen

Format: `P-001`, `P-002`, `P-003`…

### EPICs

Große Features, die mehrere User Stories enthalten:

| Feld | Beschreibung |
|------|--------------|
| ID | Eindeutiger Bezeichner (EPIC-001, EPIC-002…) |
| MMF | Minimum Marketable Feature |
| Status | Entwurf, Bereit, In Bearbeitung, Erledigt |
| Geschäftsziele | Warum dieses EPIC wichtig ist |
| Erfolgskriterien | Wie der Erfolg gemessen wird |

### User Stories

Dem **INVEST**-Modell folgen:

| Buchstabe | Bedeutung | Validierung |
|-----------|-----------|-------------|
| **I** | Independent (Unabhängig) | Keine Abhängigkeiten von anderen US |
| **N** | Negotiable (Verhandelbar) | Details können besprochen werden |
| **V** | Valuable (Wertvoll) | Liefert Nutzwert für den Benutzer |
| **E** | Estimable (Schätzbar) | Kann in Story-Punkten bewertet werden |
| **S** | Sized (Bemessen) | Max. 8 Story-Punkte |
| **T** | Testable (Testbar) | Hat klare Akzeptanzkriterien |

#### Die 3 Cs

1. **Card**: Kurze Beschreibung
2. **Conversation**: Diskussionsdetails
3. **Confirmation**: Akzeptanzkriterien

#### Akzeptanzkriterien (Gherkin)

Jede US erfordert:
- 1 Nominalszenario (Happy Path)
- 2 alternative Szenarien
- 2 Fehlerszenarien

```gherkin
Scenario: User logs in successfully
  Given a registered user with valid credentials
  When they submit the login form
  Then they should see their dashboard
  And a session should be created
```

### Tasks (Aufgaben)

Technische Arbeitselemente innerhalb einer User Story:

| Typ | Beschreibung | Typische Dauer |
|-----|-------------|----------------|
| `[DB]` | Datenbank (Entitäten, Migrationen) | 1–3 h |
| `[BE]` | Backend (Services, APIs) | 2–4 h |
| `[FE-WEB]` | Frontend Web (Controller, Templates) | 2–4 h |
| `[FE-MOB]` | Frontend Mobile (Screens, Blocs) | 3–5 h |
| `[TEST]` | Testing (Unit, Integration, E2E) | 2–4 h |
| `[DOC]` | Dokumentation | 0,5–1 h |
| `[OPS]` | DevOps (CI/CD, Deployment) | 1–2 h |
| `[REV]` | Code Review | 1–2 h |

**Schätzregeln:**
- Aufgabendauer: 0,5 h – 8 h max.
- Story-Punkte (Fibonacci): 1, 2, 3, 5, 8, 13, 21
- Max. US-Größe: 8 Punkte (bei größeren aufteilen)

---

## Workflow

### Status-Ablauf

```
┌─────────┐     ┌─────────────┐     ┌──────┐
│  To Do  │ ──→ │ In Progress │ ──→ │ Done │
└─────────┘     └─────────────┘     └──────┘
     │                │
     │                ↓
     └────────→ ┌─────────┐
                │ Blocked │
                └─────────┘
                     │
                     ↓
              ┌─────────────┐
              │ In Progress │
              └─────────────┘
```

**Verbotene Übergänge:**
- To Do → Done (muss durch In Progress laufen)
- Beliebig → To Do (außer manuellem Wiedereröffnen)

---

## Befehlsreferenz

### Erstellungsbefehle

| Befehl | Beschreibung |
|--------|--------------|
| `/project:generate-backlog [stack]` | Vollständiges Backlog aus Specs generieren |
| `/project:add-epic` | Neues EPIC erstellen |
| `/project:add-story` | User Story zu einem EPIC hinzufügen |
| `/project:add-task` | Technische Aufgabe für eine US erstellen |

### Anzeigebefehle

| Befehl | Beschreibung |
|--------|--------------|
| `/project:list-epics` | Alle EPICs mit Status anzeigen |
| `/project:list-stories [filter]` | User Stories auflisten (nach EPIC, Sprint, Status) |
| `/project:list-tasks [filter]` | Aufgaben auflisten (nach US, Sprint, Typ, Status) |
| `/project:board [sprint]` | Kanban-Board anzeigen |
| `/sprint:status [sprint]` | Detaillierter Sprint-Fortschrittsbericht |

### Aktualisierungsbefehle

| Befehl | Beschreibung |
|--------|--------------|
| `/sprint:transition [id] [status/sprint]` | US-Status ändern oder Sprint zuweisen |
| `/project:move-task [id] [status]` | Aufgabenstatus ändern |
| `/project:update-epic [id]` | Bestehendes EPIC bearbeiten |
| `/project:update-story [id]` | Bestehende User Story bearbeiten |

### Erweiterte Befehle

| Befehl | Beschreibung |
|--------|--------------|
| `/project:decompose-tasks [sprint]` | Sprint-US in Aufgaben zerlegen |
| `/gate:validate-backlog` | Backlog-Qualität prüfen (SCRUM-Konformität) |

---

## Vollständiges Beispiel: Neues Projekt

### Schritt 1: Initiales Backlog generieren

```bash
# Sicherstellen, dass Specs in ./docs/ vorhanden sind
/project:generate-backlog symfony+flutter
```

### Schritt 2: Qualität validieren

```bash
/gate:validate-backlog
```

Dies generiert `scrum-validation-report.md` mit:
- INVEST-Konformitätspunktzahl
- Prüfung der 3 Cs
- SMART-Kriterienanalyse
- Konsistenz der Schätzungen

### Schritt 3: Sprint 1 überprüfen

```bash
/project:board 1
```

Zeigt Kanban-Board mit Spalten:
- To Do | In Progress | In Review | Done | Blocked

### Schritt 4: In Aufgaben zerlegen

```bash
/project:decompose-tasks 1
```

Erstellt detaillierte Aufgabenaufschlüsselung:
- Aufgaben gruppiert nach US
- Abhängigkeitsgraph (Mermaid)
- Zeitschätzungen pro Schicht

### Schritt 5: Mit der Arbeit beginnen

```bash
# Erste Aufgabe in Bearbeitung setzen
/project:move-task TASK-001 in-progress

# Später als erledigt markieren
/project:move-task TASK-001 done

# Bei Blockierung
/project:move-task TASK-002 blocked "Waiting for API specs"
```

### Schritt 6: Fortschritt verfolgen

```bash
/sprint:status 1
```

### Schritt 7: Wiederkehrendes Monitoring einrichten (Optional)

Mit `/loop` (v2.1.71+) den Sprint-Fortschritt automatisch überwachen:

```bash
# Sprint-Status alle 30 Minuten prüfen
/loop 30m /sprint:status 1

# Pre-Commit-Checks alle 5 Minuten während der Entwicklung
/loop 5m /common:pre-commit-check
```

Alias: `/proactive` (v2.1.105+).

Zeigt:
- Gesamtfortschritt und Burndown
- Metriken nach User Story
- Blocker und Risiken
- Empfohlene Maßnahmen

---

## Vorlagen

Claude-Craft bietet 5 Vorlagen für eine konsistente Backlog-Struktur:

| Vorlage | Zweck |
|---------|-------|
| `epic.md` | EPIC-Dateistruktur mit Metadaten, Zielen, US-Liste |
| `user-story.md` | US-Struktur mit Gherkin-Kriterien, Aufgabentabelle |
| `task.md` | Aufgabenstruktur mit DoD-Checkliste |
| `board.md` | Kanban-Board mit Metrikberechnung |
| `index.md` | Backlog-Index mit globalem Überblick |

---

## Durchgesetzte SCRUM-Regeln

| Regel | Wert |
|-------|------|
| Sprint-Dauer | 2 Wochen (fest) |
| Velocity | 20–40 Punkte/Sprint |
| Max. US-Größe | 8 Punkte (bei größeren aufteilen) |
| Schätzskala | Fibonacci (1, 2, 3, 5, 8, 13, 21) |
| Aufgabendauer | 0,5 h – 8 h max. |

### Sprint 1: Walking Skeleton

Der erste Sprint muss enthalten:
- Vollständige Infrastruktureinrichtung
- 1 End-to-End-Feature (nicht nur Setup)
- Testbar sowohl auf Web als auch auf Mobile

### Vertical Slicing

**Jede User Story MUSS alle Schichten durchlaufen:**

```
UI (Web/Mobile) → API → Business Logic → Database
```

User Stories, die nur Backend, nur Frontend oder nur Mobile abdecken, sind nicht erlaubt.

---

## Checkliste: Backlog bereit

- [ ] Mindestens 3 Personas definiert
- [ ] EPICs haben MMF und Erfolgskriterien
- [ ] User Stories folgen dem INVEST-Modell
- [ ] Akzeptanzkriterien im Gherkin-Format
- [ ] Stories in Fibonacci-Punkten geschätzt
- [ ] Sprint 1 = Walking Skeleton
- [ ] Definition of Done dokumentiert
- [ ] Backlog validiert (`/gate:validate-backlog`)

---

[&larr; Fehlerbehebung](06-troubleshooting.md) | [Weiter: Neues Projekt einrichten &rarr;](08-setup-new-project.md)
