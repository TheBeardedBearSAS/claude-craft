# Backlog-Management Leitfaden

Vollstandiger Workflow zur Erstellung und Verwaltung eines SCRUM-Backlogs mit Claude-Craft.

---

## Ubersicht

Claude-Craft bietet einen umfassenden Satz von Befehlen zur Verwaltung Ihres Product Backlogs nach SCRUM-Methodik:

- **15 Slash-Befehle** fur Backlog-Operationen
- **5 Vorlagen** fur konsistente Struktur
- **Vertical Slicing** uber alle Schichten erforderlich
- **INVEST-Validierung** fur User Stories

---

## Initiale Backlog-Generierung

```bash
# Aus Spezifikationen in ./docs/
/project:generate-backlog symfony+flutter
```

### Generierte Struktur

```
project-management/
├── README.md                    # Projektuberblick
├── personas.md                  # Personas (min. 3)
├── definition-of-done.md        # Progressive DoD-Stufen
├── backlog/
│   ├── epics/                   # EPIC-XXX-name.md
│   └── user-stories/            # US-XXX-name.md
└── sprints/
    └── sprint-XXX-ziel/
```

---

## SCRUM-Struktur

### Personas (mindestens 3)
- Identitat, Ziele, Frustrationen
- Format: P-001, P-002...

### EPICs
- Eindeutige ID (EPIC-XXX)
- MMF (Minimum Marketable Feature)
- Geschaftsziele und Erfolgskriterien

### User Stories (INVEST-Modell)

| Buchstabe | Bedeutung |
|-----------|-----------|
| **I** | Independent - Keine Abhangigkeiten |
| **N** | Negotiable - Details verhandelbar |
| **V** | Valuable - Nutzerwert |
| **E** | Estimable - Schatzbar |
| **S** | Sized - Max 8 Punkte |
| **T** | Testable - Klare Kriterien |

#### Akzeptanzkriterien (Gherkin)
- 1 Nominal-Szenario
- 2 Alternative Szenarien
- 2 Fehlerszenarien

### Tasks (Aufgaben)

| Typ | Beschreibung |
|-----|--------------|
| `[DB]` | Datenbank |
| `[BE]` | Backend |
| `[FE-WEB]` | Frontend Web |
| `[FE-MOB]` | Frontend Mobile |
| `[TEST]` | Testing |
| `[DOC]` | Dokumentation |
| `[OPS]` | DevOps |
| `[REV]` | Code Review |

---

## Workflow

```
To Do ──→ In Progress ──→ Done
   │            │
   └────→ Blocked ←────┘
```

---

## Befehlsreferenz

### Erstellungsbefehle

| Befehl | Beschreibung |
|--------|--------------|
| `/project:generate-backlog [stack]` | Backlog aus Specs generieren |
| `/project:add-epic` | Neues EPIC erstellen |
| `/project:add-story` | User Story hinzufugen |
| `/project:add-task` | Technische Aufgabe erstellen |

### Anzeige-Befehle

| Befehl | Beschreibung |
|--------|--------------|
| `/project:list-epics` | EPICs auflisten |
| `/project:list-stories` | User Stories auflisten |
| `/project:list-tasks` | Aufgaben auflisten |
| `/project:board` | Kanban-Board |
| `/sprint:status` | Sprint-Status |

### Aktualisierungsbefehle

| Befehl | Beschreibung |
|--------|--------------|
| `/sprint:transition` | US-Status/Sprint andern |
| `/project:move-task` | Aufgabenstatus andern |
| `/project:update-epic` | EPIC bearbeiten |
| `/project:update-story` | User Story bearbeiten |

### Erweiterte Befehle

| Befehl | Beschreibung |
|--------|--------------|
| `/project:decompose-tasks` | US in Aufgaben zerlegen |
| `/gate:validate-backlog` | SCRUM-Qualitat prufen |

---

## Vollstandiges Beispiel

```markdown
## Schritt 1: Initiales Backlog generieren
/project:generate-backlog symfony+flutter

## Schritt 2: Qualitat validieren
/gate:validate-backlog

## Schritt 3: Sprint 1 anzeigen
/project:board 1

## Schritt 4: In Aufgaben zerlegen
/project:decompose-tasks 1

## Schritt 5: Arbeit beginnen
/project:move-task TASK-001 in-progress
```

---

## Verfugbare Vorlagen

| Vorlage | Zweck |
|---------|-------|
| `epic.md` | EPIC-Struktur |
| `user-story.md` | User Story-Struktur |
| `task.md` | Aufgabenstruktur |
| `board.md` | Kanban-Board |
| `index.md` | Backlog-Index |

---

## SCRUM-Regeln

| Regel | Wert |
|-------|------|
| Sprint-Dauer | 2 Wochen |
| Velocity | 20-40 Punkte/Sprint |
| Max US | 8 Punkte |
| Schatzung | Fibonacci (1,2,3,5,8,13,21) |
| Aufgabendauer | 0.5h - 8h max |

### Sprint 1 = Walking Skeleton
- Vollstandige Infrastruktur
- 1 End-to-End Feature
- Testbar auf Web und Mobile

### Vertical Slicing
Jede US muss alle Schichten durchlaufen:
```
UI → API → Geschaftslogik → Datenbank
```

---

## Checkliste

- [ ] Mindestens 3 Personas definiert
- [ ] EPICs mit MMF und Erfolgskriterien
- [ ] User Stories folgen INVEST
- [ ] Kriterien im Gherkin-Format
- [ ] Fibonacci-Schatzung
- [ ] Sprint 1 = Walking Skeleton
- [ ] Backlog validiert

---

[&larr; Fehlerbehebung](06-troubleshooting.md) | [Nachste: Neues Projekt Einrichten &rarr;](08-setup-new-project.md)
