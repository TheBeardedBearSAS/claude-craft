---
name: workflow-plan
description: "Planungsphase ausführen - Recherche (--research), PRD (--only=prd) und SCRUM-Backlog (--only=backlog)"
argument-hint: "[--research] [--only=prd|backlog] [--continue]"
arguments:
  - name: research
    description: "Zuerst den Recherche-Schritt ausführen (früheres /workflow:plan --research): Domäne, Markt, technische Recherche, Constraints, Risiken"
    required: false
  - name: only
    description: "Nur einen Schritt ausführen: prd (PRD + Personas) oder backlog (Personas, DoD, Epics, User Stories, Sprints)"
    required: false
  - name: continue
    description: Dort fortfahren, wo aufgehört wurde
    required: false
---

# /workflow:plan

## Auftrag

Die Planungsphase des Entwicklungs-Workflows ausführen: optionale Recherche, Product Requirements Document (PRD), Personas und SCRUM-Backlog (Epics, User Stories, Sprint-Ordner). Dieser Befehl enthält die gesamte Generierungslogik; es gibt keinen separaten PRD- oder Backlog-Generator mehr, der aufgerufen werden müsste.

## Usage

| Aufruf | Was er tut | Ersetzt |
|--------|------------|---------|
| `/workflow:plan` | Vollständige Phase: PRD, dann Backlog (mit `--research` beginnt sie mit der Recherche) | - |
| `/workflow:plan --research` | Recherche, Exploration, Constraints und Risiken vor dem PRD. Schreibt `project-management/analysis/` | `/workflow:plan --research` |
| `/workflow:plan --only=prd` | Nur PRD + Personas. Schreibt `project-management/prd.md` | `/workflow:plan --only=prd` |
| `/workflow:plan --only=backlog` | Nur Backlog: liest `project-management/prd.md` (+ `project-management/tech-spec.md`, falls vorhanden), schreibt Personas, DoD, Epics, User Stories mit `**Implements**`, Sprint-Ordner `sprint-{N}-{slug}` und registriert die Stories in `.bmad/sprint-status.yaml` mit dem Status `backlog` | `/workflow:plan --only=backlog` |
| `/workflow:plan --continue` | Einen unterbrochenen Lauf fortsetzen | - |

`--research` lässt sich mit `--only=prd` kombinieren (Recherche, dann PRD).

## Kanonische Reihenfolge

Die Dokumente entstehen in dieser Reihenfolge: **PRD, dann Tech Spec, dann Backlog, dann Sprint**.

- **Quick-Track**: `/workflow:plan` (ohne Option) erzeugt PRD + Backlog in einem Durchgang.
- **Standard / Enterprise (empfohlen)**: `/workflow:plan --only=prd`, dann `/workflow:design`, dann `/workflow:plan --only=backlog`. Das Backlog liest dann `project-management/prd.md` und `project-management/tech-spec.md`: Die Stories tragen die reale Architektur, und `**Implements**` verweist auf die `FR-xxx` des PRD.
- **Enterprise**: mit `/workflow:plan --research --only=prd` beginnen.

Ohne PRD greift `--only=backlog` auf die Spezifikationen in `./docs/` zurück (ARCHITECTURE_TECHNIQUE*.md, CAHIER_DES_CHARGES*.md oder jede andere Spezifikationsdatei) und warnt, dass die Rückverfolgbarkeit eingeschränkt ist.

## Wann verwenden

- Tracks **Standard** und **Enterprise**, nach `/workflow:init`
- Zu Beginn der Feature-Planung oder wenn PRD oder Backlog neu generiert werden müssen

## Plan Mode

> **Der Plan Mode ist verpflichtend.** Claude aktiviert den Plan Mode, um den Ansatz zu strukturieren, Abhängigkeiten zu erkennen und eine Generierungsstrategie vorzustellen, bevor Artefakte erstellt werden.

## Workflow

### Schritt 1: Vorbereitung und vorhandene Artefakte

Track und Phase anzeigen (Planung = Phase 2 von 4), dann `project-management/` prüfen: `prd.md`, `personas.md`, `backlog/`, `analysis/` (constraints.md, research-summary.md). Vorhandene Dateien werden nie stillschweigend überschrieben: nachfragen, ob aktualisiert, zusammengeführt oder übersprungen werden soll.

### Schritt 2 (`--research`): Recherchephase

Früheres `/workflow:plan --research`. Recherche, Exploration und Constraints vor dem PRD.

**Geführte Fragen**

| Bereich | Fragen |
|---------|--------|
| Domäne | Welches Problem? Welche Stakeholder? Business-Treiber? Wie sieht Erfolg aus? |
| Markt | Bestehende Lösungen? Wettbewerber? Best Practices der Branche? Neue Trends? |
| Technik | Mögliche Technologien? Integrationen? Skalierbarkeit? Sicherheit / Compliance? |

Ist der MCP Context7 konfiguriert, ihn für aktuelle technische Dokumentation nutzen (`/deep-research` für tiefgehende Webrecherche; außerhalb von claude.ai der Agent `@research-assistant`).

**Constraints**: technische (bestehendes Backend, Datenbank), geschäftliche (Budget, Zeitplan, Abwärtskompatibilität), regulatorische (DSGVO, PCI DSS) und Ressourcen-Constraints (Teamgröße, kein DevOps) dokumentieren.

**Risiken und Chancen**: Risikotabelle (Risiko, Auswirkung, Wahrscheinlichkeit, Gegenmaßnahme) und Chancen.

**Artefakte**

```
project-management/analysis/
├── research-summary.md      # Wichtigste Erkenntnisse
├── constraints.md           # Alle identifizierten Constraints
├── risks-opportunities.md   # Risikoregister & Chancen
└── technical-options.md     # Technologiebewertung
```

Agenten: **research-assistant** (technische Recherche), **product-owner** (Business-Kontext). Danach: PRD (die Analyse fließt ein).

### Schritt 3 (`--only=prd` oder vollständiger Lauf): PRD-Generierung

Schreibt `project-management/prd.md` und `project-management/personas.md`.

**Phase 1 - Kontext-Erkundung**: `README.md` lesen, `./docs/` nach Spezifikationen durchsuchen, `project-management/personas.md` und `project-management/analysis/` lesen, falls vorhanden, den Code auf den Tech-Stack analysieren, die Konversation durchsehen. Gefundene Quellen auflisten.

**Phase 2 - Interaktive Klärung** (nur fragen, was fehlt):

| Thema | Fragen |
|-------|--------|
| Problem und Chance | Welches Problem? Wer leidet am meisten? Kosten des Nichtstuns? Geschäftschance? |
| Zielnutzer | Hauptnutzer (Rolle, Profil)? Ziele? Frustrationen mit aktuellen Lösungen? Sekundäre Nutzer? |
| Ziele und Metriken | Geschäftsziele? KPIs mit Zielwerten und Zeitrahmen? Wie sieht MVP-Erfolg aus? |
| Umfang und Constraints | Muss-Features (P0)? Ausdrücklich außerhalb des Umfangs? Technische, Budget-, Zeit-, Compliance-Constraints? |

**Phase 3 - Generierung**: das PRD-Template laden (`.claude/templates/project/prd.md`, falls vorhanden), jeden Abschnitt füllen, detaillierte Personas erstellen, Anforderungen als P0/P1/P2 mit stabilen IDs `FR-001`, `FR-002`... (funktional) und `NFR-001`... (nicht funktional) organisieren, damit Stories darauf zurückverweisen können, Risiken aus Constraints und Abhängigkeiten ableiten.

**Phase 4 - Review und Iteration**: eine Abschnitts-Checkliste anzeigen (Executive Summary, Problem Statement, Goals & Metrics, Target Users, Functional Requirements, Non-Functional Requirements, Scope & Constraints, Timeline, Risks & Mitigations), unvollständige Abschnitte markieren, dann anbieten, einen Abschnitt auszubauen, Personas zu detaillieren oder die Priorisierung anzupassen.

```
project-management/
├── prd.md                    # Generiertes PRD (FR-xxx / NFR-xxx)
├── personas.md               # Extrahierte/erstellte Personas
└── analysis/discovery-notes.md
```

### Schritt 4 (`--only=backlog` oder vollständiger Lauf): Backlog-Generierung

Sie agieren als erfahrener Product Owner und Scrum Master. Das Backlog muss die 3 Scrum-Säulen (Transparenz, Inspektion, Anpassung) und die agilen Werte respektieren.

**Eingaben, nach Priorität**

1. `project-management/prd.md`: Hauptquelle. Seine `FR-xxx`-IDs speisen das Feld `**Implements**` jeder User Story.
2. `project-management/tech-spec.md`, falls vorhanden (siehe `/workflow:design`): Architektur, Entitäten, Endpunkte für die technischen Notizen.
3. Fallback ohne PRD: Spezifikationen in `./docs/`.

**Vertical Slicing (verpflichtend)**: Jede User Story durchläuft alle Schichten des Projekt-Stacks (UI, API, Persistenz). Keine Story nur für das Backend oder nur für das Frontend. Den Stack aus der Tech Spec oder dem Code erkennen und DoD sowie technische Kriterien entsprechend anpassen.

**Erzeugte Struktur**

```
project-management/
├── README.md                 # Überblick, Personas, Epics, Metriken, Roadmap
├── personas.md
├── definition-of-done.md
├── dependencies-matrix.md
├── backlog/
│   ├── epics/EPIC-XXX-name.md
│   └── user-stories/US-XXX-name.md
└── sprints/sprint-{N}-{slug}/   # z. B. sprint-1-walking_skeleton
    ├── sprint-goal.md
    └── sprint-dependencies.md
```

**personas.md**: mindestens 3 Personas (IDs P-001, P-002...; 1 primäre, 2+ sekundäre). Jede mit: Identität, repräsentatives Zitat, Kontext, 3 Ziele, mindestens 3 Frustrationen, Motivationen, Verhalten, Nutzungsszenarien (Kontext, Bedarf, Aktion, Ergebnis), Entscheidungskriterien. Eine Personas/Features-Matrix (3 Sterne kritisch, 2 wichtig, 1 nützlich) und Anti-Personas ergänzen.

**definition-of-done.md**: Code (genehmigtes Review, Konventionen, SOLID), Tests (80 % Unit, Integration, E2E, grüne CI), Kriterien je Schicht (UI, API, Parität zwischen Clients), Dokumentation, Qualität (statische Analyse auf höchster Stufe, API unter 200 ms), Deployment (Migrationen, Staging, PO-Abnahme).

**Epics** (`EPIC-XXX-name.md`): Beschreibung (Geschäftswert), Tabelle der zugehörigen Stories (ID, Titel, Punkte, Priorität, hängt ab von), Abhängigkeiten (Voraussetzungen und Abhängige), Minimum Marketable Feature (MMF) mit enthaltenen Stories, Schätzung (Größe S/M/L/XL, geschätzte Sprints).

**User Stories** (`US-XXX-name.md`), ausgehend von `.claude/templates/project/user-story.md`:

- **INVEST** (verpflichtend): Independent, Negotiable, Valuable, Estimable, Sized (max. 8 Punkte), Testable.
- **3 Cs** (verpflichtend): Card („Als [P-XXX]... möchte ich... damit..."), Conversation (offene Fragen), Confirmation (Akzeptanzkriterien).
- **Akzeptanzkriterien** in SMART-Gherkin: 1 Nominalszenario, mindestens 2 alternative, mindestens 2 Fehlerszenarien.
- Eltern-Epic, zugehörige Persona, Kriterien je Schicht, technische Notizen, Schätzung (Fibonacci-Punkte, MoSCoW), Abhängigkeiten (blockierend und blockiert), zugewiesener Sprint.
- **Rückverfolgbarkeit**: den Abschnitt `## Traceability` mit `**Implements**: {FR-001, FR-003}` füllen (IDs der PRD-Anforderungen, die die Story liefert). Eine Story ohne `FR-xxx` wird markiert.

**dependencies-matrix.md**: Mermaid-Graph zwischen Epics, Abhängigkeitstabelle, kritischer Pfad, Abhängigkeiten zwischen Stories.

**Sprints** (`sprint-{N}-{slug}/`): `sprint-goal.md` (Ziel in einem Satz, Zeremonien, ausgewählte Stories und Gesamtpunkte, Ausführungsreihenfolge, Mermaid-Abhängigkeitsgraph, auslieferbares Inkrement, Retrospektiven-Leitsatz und Starfish-Format) und `sprint-dependencies.md`.

**Registrierung in `.bmad/sprint-status.yaml`**: für jede Story einen Eintrag mit `status: backlog` hinzufügen (Schema: `Project/templates/sprint-status.yaml.template`): `title`, `story_points`, `epic_id`, `tasks` (total 0), `acceptance_criteria.total` und einen `history`-Eintrag „Story created". `.bmad/sprint-status.yaml` ist die einzige Wahrheitsquelle für den Status; Markdown-Dateien enthalten nur Inhalt, nie einen Status. Die Datei aus dem Template erstellen, falls sie fehlt, vorhandene Einträge nie überschreiben.

**Scrum-Regeln**: 2-Wochen-Sprints, Velocity 20-40 Punkte, max. 8 Punkte pro Story (sonst teilen), Fibonacci-Skala (1, 2, 3, 5, 8, 13, 21), Sprint 1 = Walking Skeleton (Infrastruktur + ein vollständiger Ablauf).

### Schritt 5: Validierung

`/gate:check backlog` ausführen (oder inline prüfen):

| Prüfung | Kriterien |
|---------|-----------|
| INVEST | Alle 6 Kriterien je Story; max. 8 Punkte (13+ muss geteilt werden) |
| 3 Cs | Card, Conversation, Confirmation vorhanden |
| Gherkin | Gültiges Format; 1 nominal + 2 alternativ + 2 Fehler |
| Personas | Mindestens 3, Matrix vorhanden |
| Epics | MMF identifiziert, Mermaid-Abhängigkeiten |
| Sprints | Sprint 1 = Walking Skeleton, Ziel in einem Satz, Abhängigkeitsgraph |
| Rückverfolgbarkeit | Jede Story hat `**Implements**`; jedes P0-`FR-xxx` ist von mindestens einer Story abgedeckt |
| Status | Jede Story ist in `.bmad/sprint-status.yaml` als `backlog` registriert |

Warnungen melden (zum Beispiel „US-012: 21 Punkte - muss geteilt werden") und vor Abschluss beheben.

### Schritt 6: Phasenabschluss

Die Artefakte zusammenfassen (PRD, Personas, Epics, Anzahl Stories, Gesamtpunkte, Umfang von Sprint 1, geschätzte Sprints) und den nächsten Schritt empfehlen: nach `--only=prd` `/workflow:design`, dann `/workflow:plan --only=backlog`; nach dem Backlog `/workflow:design` (falls noch keine Tech Spec existiert) oder `/workflow:start 1`.

## Beteiligte Agenten

- **product-owner**: PRD-Erstellung, Personas, Priorisierung, Backlog
- **tech-lead**: Prüfung der technischen Machbarkeit, Schätzungshilfe
- **research-assistant**: Recherche (`--research`)

## Ausgabedateien

| Datei | Zweck | Modus |
|-------|-------|-------|
| `analysis/*.md` | Recherche, Constraints, Risiken | `--research` |
| `prd.md`, `personas.md` | PRD mit `FR-xxx` / `NFR-xxx`, Personas | `--only=prd` |
| `definition-of-done.md`, `dependencies-matrix.md`, `README.md` | Rahmen des Backlogs | `--only=backlog` |
| `backlog/epics/`, `backlog/user-stories/` | Epics und Stories (`**Implements**`) | `--only=backlog` |
| `sprints/sprint-{N}-{slug}/` | Sprint-Ordner | `--only=backlog` |
| `.bmad/sprint-status.yaml` | Als `backlog` registrierte Stories | `--only=backlog` |

## Fortsetzungsoption

Bei Unterbrechung erkennt `/workflow:plan --continue`, was vorhanden ist (PRD fertig, Backlog bei 12/18 Stories), und macht beim nächsten fehlenden Element weiter.

## Verwandte Befehle

- `/workflow:init` - Workflow initialisieren
- `/workflow:design` - Tech Spec (zwischen PRD und Backlog)
- `/workflow:start` - Einen Sprint aus dem Backlog starten
- `/workflow:status` - Fortschritt prüfen
- `/project:backlog` - Stories danach hinzufügen, auflisten, bearbeiten und verschieben
- `/gate:check` - Das Backlog validieren
