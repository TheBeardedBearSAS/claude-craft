# Vollständiges Workflow-Tutorial: Von der Idee zur Produktion

> **Für wen ist das?** Für jemanden, der **noch nie** Claude Code oder Claude Craft verwendet hat. Wir starten bei null, bauen ein echtes Feature von Anfang bis Ende und erklären jeden Begriff bei seiner ersten Verwendung.
>
> **Was wir bauen:** *TaskFlow* — ein kleines SaaS zur Aufgabenverfolgung im Team mit einer REST-API (Python / FastAPI) und einem React-Web-Client. Einfach genug, um es in einer Sitzung nachzuvollziehen, real genug, um den gesamten Workflow zu durchlaufen.
>
> **Claude Craft v8.17.2** · Geschätzte Lese- und Übungszeit: 60–90 Minuten.

---

## 0. Bevor du beginnst

### Was du tun wirst

Du wirst TaskFlow von einer Einzeiler-Idee bis hin zu einem geprüften, getesteten ersten Sprint führen — mit dem BMAD-Workflow von Claude Craft. Der Pfad fließt immer in eine Richtung, und **jeder Pfeil ist durch ein Quality Gate geschützt** (eine blockierende Prüfung):

```
 IDEE
   │  /workflow:init        ← Track wählen
   ▼
 BACKLOG ──/gate:validate-backlog──┐  (PRD ≥ 80%, INVEST 6/6)
   │  /workflow:plan                │
   ▼                                │
 TECH DESIGN ──/gate:validate-techspec──┐  (Tech Spec ≥ 90%)
   │  /workflow:design                   │
   ▼                                      │
 SPRINT PLAN ──/gate:validate-sprint──┐  (Sprint Ready 100%)
   │  /workflow:start                  │
   │  /project:decompose-tasks         │
   ▼                                    │
 IMPLEMENTIERUNG (TDD) ──/gate:validate-story──┐  (Story DoD 100%)
   │  /sprint:dev                              │
   ▼                                            │
 REVIEW + RETRO ──/workflow:review, /workflow:retro
   │
   ▼
 NÄCHSTER SPRINT ↺
```

> **Goldene Regel der Methode:** Du bewegst dich erst zum nächsten Schritt, wenn sein Gate bestanden ist. Das verhindert, dass du auf wackligen Grundlagen baust.

---

## 1. Die Grundlagen in 5 Minuten

Lies dies einmal durch. Du wirst darauf zurückkommen.

- **Claude Code** — die CLI, in der du Claude in deinem Terminal (oder deiner IDE) ansprichst. Du tippst Nachrichten und *Slash-Commands*; Claude liest/schreibt Dateien, führt Befehle aus und antwortet.
- **Slash-Command** — eine gebündelte Anweisung, die mit `/` beginnt. Beispiel: `/workflow:init`. Claude Craft liefert 125 davon in 15 Namespaces.
- **Agent** — eine spezialisierte Claude-Persona, die du mit `@` aufrufst. Beispiel: `@tdd-coach`, `@symfony-reviewer`. Jeder verfügt über fokussiertes Fachwissen.
- **Claude Craft** — das installierte Framework: Regeln, Befehle, Agenten, Skills und die **BMAD**-Projektmanagement-Schicht.
- **BMAD** — die leichtgewichtige SCRUM-ähnliche Methode von Claude Craft (Backlog → Sprint → Review). Der Zustand wird in **Dateien** gespeichert, nicht im Gespräch — deshalb ist das spätere Löschen des Chats sicher.

### Mini-Glossar

| Begriff | Bedeutung |
|---------|-----------|
| **Epic** | Ein großer Wertblock, der in Stories aufgeteilt wird. |
| **User Story (US)** | Ein kleines, für den Nutzer sichtbares Inkrement („Als Nutzer kann ich…"). |
| **Backlog** | Die geordnete Liste von Epics und Stories. |
| **Sprint** | Ein kurzer Stapel von Stories, die du dir vornimmst abzuschließen. |
| **Task** | Eine Story, aufgeteilt in ≤ 30-Minuten-Schritte, die ein Entwickler (oder Agent) ausführt. |
| **Gate** | Eine blockierende Qualitätsprüfung zwischen den Phasen. |
| **DoD** | Definition of Done — die Checkliste, die eine Story bestehen muss. |
| **INVEST** | Die 6 Qualitäten einer guten Story (Independent, Negotiable, Valuable, Estimable, Small, Testable). |
| **TDD** | Test-Driven Development: schreibe einen fehlschlagenden Test → lass ihn bestehen → refaktoriere. |

---

## 1.5 Ausführungsmodi verstehen (unbedingt lesen — hier stolpert jeder)

Es gibt **zwei verschiedene Dinge, die „Modus" heißen**. Verwechsle sie nicht.

**(a) Die drei Interaktionsmodi** (umschalten mit `Shift+Tab` in Claude Code):

| Modus | Anzeige | Was er tut |
|-------|---------|------------|
| **Plan** | 📋 | Claude schlägt einen Plan vor und bearbeitet **nichts**, bis du zustimmst. |
| **Normal** | ⚡ | Claude handelt, fragt aber vor riskanten Aktionen nach Erlaubnis. **Standard für dieses Tutorial.** |
| **Auto-accept** | 🤖 | Claude führt aus, ohne zu fragen. Mächtig, aber erst wenn du dem Ablauf vertraust. |

**(b) Der „Plan-Modus", den manche Befehle selbst aktivieren.** Mehrere Claude-Craft-Befehle (`/workflow:design`, `/workflow:plan`…) treten absichtlich in einen Planungsschritt ein und warten auf dein „Los", bevor sie Dateien schreiben — unabhängig davon, welcher Shift-Tab-Modus aktiv ist.

> **Einfache Regel für Einsteiger:** Bleibe im **Normal-Modus (⚡)**, lass Befehle ihren eigenen Planungsschritt auslösen und bestätige die Pläne. Verwende Auto-accept und `--auto`-Flags erst, wenn der Ablauf vertraut ist.

Im gesamten Tutorial zeigt jeder Befehl den erwarteten Modus:
- **Modus: Normal (⚡)** — interaktiv
- **Modus: Plan erforderlich** — Claude plant zuerst
- **Modus: Schreibgeschützt** — sicher in jedem Modus

---

## 2. Installation prüfen

**Modus: Schreibgeschützt.** Öffne Claude Code in deinem Projektordner und bestätige, dass Claude Craft vorhanden ist.

```bash
# Im Terminal, innerhalb des Projekts
claude
```

Dann, innerhalb von Claude Code:

```
/workflow:status
```

Wenn du einen Workflow-Statusbericht siehst (auch „kein Workflow vorhanden"), ist Claude Craft installiert. Wenn der Befehl unbekannt ist, (re)installiere:

```bash
npx @the-bearded-bear/claude-craft install . --tech=python --lang=en
```

> **Über die Projektmanagement-Schicht.** Die unten verwendeten Befehle `/gate:*`, `/sprint:*` und `/project:*` stammen aus der Option **Project Management commands**, die standardmäßig bei der Installation enthalten ist (der Installer fragt *„Include Project Management commands? (Y/n)"* → Yes). Wenn diese Befehle fehlen, führe den Installer erneut aus und akzeptiere diese Option.

### 2.x Token sparen: Kontext und `/clear`

Das **Kontextfenster** ist Claudes Arbeitsgedächtnis — und deine kostbarste Ressource. Zwei Gewohnheiten halten es gesund:

- **`/clear`** zwischen nicht zusammenhängenden Schritten. Da BMAD seinen Zustand in Dateien schreibt, geht **nichts verloren**: Nach `/clear` führe `/workflow:status` aus und Claude liest den aktuellen Stand erneut ein.
- **RTK + Hooks** für die Token-Optimierung. Führe `/common:setup-rtk` einmalig aus, um den Rust Token Killer Proxy und die Optimierungs-Hooks zu konfigurieren (60–90 % Einsparung bei Dev-Command-Ausgabe).

Du wirst unten zwischen den Schritten **„Guter Zeitpunkt für `/clear`"**-Markierungen sehen.

---

## Schritt A — Backlog aufbauen

### A.1 Workflow initialisieren

**Modus: Plan erforderlich.**

```
/workflow:init
```

Claude analysiert dein Projekt und empfiehlt einen **Track**:

| Track | Setup | Phasen | Am besten für |
|-------|-------|--------|---------------|
| **Quick Flow** | < 5 Min | Nur Implementierung | Bug-Fixes, Hotfixes |
| **Standard** | < 15 Min | Plan → Design → Implementierung | Neue Features (← TaskFlow nutzt diesen) |
| **Enterprise** | < 30 Min | Analyse → Plan → Design → Implementierung | Plattformen |

Wähle **Standard** für TaskFlow.

### A.2 PRD und Backlog generieren

**Modus: Plan erforderlich.**

```
/workflow:plan
```

Claude interviewt dich über TaskFlow und erstellt dann ein **PRD** (Product Requirements Document), Personas und einen ersten **Backlog** aus Epics und Stories unter `project-management/`. Antworte konkret, z. B.:

> *„TaskFlow ermöglicht einem kleinen Team, Projekte zu erstellen, Aufgaben hinzuzufügen, zuzuweisen und als erledigt zu markieren. MVP = REST-API + Web-Listen-/Board-Ansicht. Noch kein Mobile."*

> **Was zu erwarten ist:** Dateien wie `project-management/prd.md` und `project-management/backlog/` mit Epics wie `EPIC-001 Projekte`, `EPIC-002 Aufgaben` und Stories wie `US-001 Projekt erstellen`.

### A.3 Backlog validieren

**Modus: Schreibgeschützt.**

```
/gate:validate-backlog
```

Dieses Gate prüft den Backlog gegen **INVEST (6/6)** und PRD-Abdeckung (**≥ 80 %**). Schlägt es fehl, zeigt es dir genau, welche Stories zu groß, nicht testbar oder nicht schätzbar sind. Korrigiere sie (führe `/workflow:plan` erneut aus oder bearbeite die Stories), bis das Gate grün ist.

> **Guter Zeitpunkt für `/clear`.** Dann `/workflow:status` zum Fortsetzen.

---

## Schritt B — Design, dann Sprint erstellen

### B.1 Technische Lösung entwerfen

**Modus: Plan erforderlich.**

```
/workflow:design
```

Claude (als Architekt) erstellt eine **Tech Spec**: Architekturentscheidungen, Datenmodell, API-Vertrag und zu verwendende Bibliotheken — verankert in den Claude-Craft-Referenzen deines Stacks (Clean Architecture, FastAPI-Muster usw.).

### B.2 Tech Spec validieren

**Modus: Schreibgeschützt.**

```
/gate:validate-techspec
```

Gate-Schwellenwert: **Tech Spec ≥ 90 %**. Es kennzeichnet fehlendes Error-Handling, undefinierte Verträge oder nicht testbare Designs.

### B.3 Ersten Sprint planen

**Modus: Plan erforderlich.**

```
/workflow:start
```

Claude schlägt ein **Sprint-Ziel** vor und wählt die wichtigsten Backlog-Stories aus, die hineinpassen. Für TaskFlow ist ein sinnvoller erster Sprint ein **Walking Skeleton**: Projekt- und Aufgabenerstellung über die API, in der Web-Liste angezeigt.

### B.4 Stories in Tasks zerlegen

**Modus: Plan erforderlich.**

```
/project:decompose-tasks
```

Jede Story wird in ≤ 30-minütige, unabhängig testbare **Tasks** aufgeteilt (Modell schreiben, Endpunkt schreiben, Test schreiben, UI verdrahten…). Das sorgt dafür, dass TDD und `/sprint:dev` reibungslos ablaufen.

### B.5 Sprint validieren

**Modus: Schreibgeschützt.**

```
/gate:validate-sprint
```

Gate-Schwellenwert: **Sprint Ready 100 %** — jede Story geschätzt, jeder Task definiert, Abhängigkeiten geordnet. Grün bedeutet, du kannst mit dem Coden beginnen.

> **Guter Zeitpunkt für `/clear`.**

---

## Schritt C — Sprint mit TDD implementieren

### C.1 Der empfohlene Weg für Einsteiger

**Modus: Normal (⚡).**

```
/sprint:dev
```

`/sprint:dev` arbeitet den Sprint **Task für Task** ab und coacht dich durch den **Red → Green → Refactor**-TDD-Zyklus:

1. **Red** — schreibe einen fehlschlagenden Test, der das erwartete Verhalten fixiert.
2. **Green** — schreibe den minimalen Code, um ihn bestehen zu lassen.
3. **Refactor** — räume auf, Tests bleiben grün.

Für jede Story führt es außerdem ein Code-Review durch und prüft die **Story DoD (100 %)**, bevor es weitermacht.

> **TDD ist nicht verhandelbar.** Ein Test, der *vor* dem Code geschrieben wird, ermöglicht es dem Agenten, Code zu schreiben, dem du vertrauen kannst. Bug-Fixes erhalten zuerst einen Regressionstest (er muss vor deiner Korrektur fehlschlagen, danach bestehen).

### C.2 Alternativen (optional)

- `/project:run-sprint` — führt den gesamten Sprint autonomer aus.
- `/team:sprint` — implementiert mehrere Stories **parallel** mit Agent Teams (fortgeschritten).
- `@tdd-coach` — rufe den Coach mitten in einem Task zur Beratung auf.

Bleibe für deinen ersten Durchlauf bei `/sprint:dev`.

### C.3 Tag für Tag steuern

- `/sprint:next-story --claim` — nimm die nächste Story an.
- `/sprint:transition US-001 in-progress` — bewege eine Story über das Board.
- `/qa:tdd` — behebe einen Bug im strikten TDD/BDD-Modus.

> **Docker-Erinnerung.** Führe Tests und Befehle über Docker aus, damit die Ergebnisse nicht von deiner lokalen Maschine abhängen, z. B. `docker compose exec app pytest`.

---

## Schritt D — Fortschritt mit dem Kanban-Board verfolgen

### D.1 Board starten

**Modus: Schreibgeschützt.**

```
/project:board
```

Dies öffnet ein lokales **Kanban-Board** (kein SaaS, kein Vendor Lock-in), das die BMAD-Statusdateien liest. Die Spalten folgen dem Status-Routing:

```
backlog → ready-for-dev → in-progress → review → done   (any → blocked)
```

Begleitansichten: `/project:burndown` (Sprint-Burndown), `/project:dependencies`, `/project:critical-path`, `/project:metrics`.

### D.2 Warum eine Karte sich weigern kann, sich zu bewegen

Das Board setzt dieselben Gates durch. Eine Story wird **done** nicht betreten, bis ihre DoD besteht — das ist die Methode, die dich schützt, kein Fehler.

> **Guter Zeitpunkt für `/clear`.**

---

## Schritt E — Sprint abschließen und wiederholen

### E.1 Sprint-Review

**Modus: Normal (⚡).**

```
/workflow:review
```

Fasst zusammen, was im Vergleich zum Sprint-Ziel geliefert wurde, mit einer Demo-Checkliste.

### E.2 Retrospektive

```
/workflow:retro
```

Hält fest, was gut lief / was verbessert werden soll. Speichere dauerhafte Erkenntnisse mit `/memory`, damit sie künftige `/clear`s überleben.

### E.3 Wiederholen

Führe `/workflow:start` erneut aus, um Sprint 2 aus dem verbleibenden Backlog zu planen. Der Zyklus wiederholt sich: Plan → Design → Implementierung → Review.

---

## Spickzettel

### Befehle, in Reihenfolge

```bash
# Schritt A — Backlog
/workflow:init                 # Track wählen
/workflow:plan                 # PRD + Backlog
/gate:validate-backlog         # INVEST 6/6, PRD ≥ 80%

# Schritt B — Design + Sprint
/workflow:design               # Tech Spec
/gate:validate-techspec        # Tech Spec ≥ 90%
/workflow:start                # Sprint planen
/project:decompose-tasks       # Stories → Tasks
/gate:validate-sprint          # Sprint Ready 100%

# Schritt C — Implementierung (TDD)
/sprint:dev                    # Task-für-Task Red/Green/Refactor
/gate:validate-story US-001    # Story DoD 100%

# Schritt D — Verfolgen
/project:board                 # Kanban
/project:burndown              # Burndown

# Schritt E — Abschließen + wiederholen
/workflow:review
/workflow:retro
```

### Wann `/clear` verwenden

Nach jedem Schritt (A→B→C→D→E). Der Zustand lebt in Dateien; `/workflow:status` liest ihn erneut ein.

### Wo Dateien liegen

| Was | Wo |
|-----|----|
| PRD, Personas | `project-management/prd.md` |
| Backlog (Epics/Stories) | `project-management/backlog/` |
| Sprints, Tasks | `project-management/sprints/` |
| BMAD-Status | `project-management/.bmad/` / `sprint-status.yaml` |

### Gate-Schwellenwerte

| Gate | Schwellenwert |
|------|---------------|
| PRD | ≥ 80 % |
| Tech Spec | ≥ 90 % |
| INVEST | 6/6 |
| Sprint Ready | 100 % |
| Story DoD | 100 % |
| Spec Alignment | ≥ 85 % |

### Häufige Probleme

| Symptom | Lösung |
|---------|--------|
| `/gate:*` / `/sprint:*` unbekannt | Neuinstallation und *Project Management commands* akzeptieren. |
| `/bmad:init` nicht gefunden | Existiert nicht — verwende `/workflow:init`. |
| Gate schlägt weiter fehl | Lies den Bericht; er nennt das genau fehlschlagende Element. |
| Karte erreicht **done** nicht | Ihre DoD ist noch nicht erfüllt — das ist so beabsichtigt. |
| Verloren nach `/clear` | Führe `/workflow:status` aus. |
| Kontext > 60 % | `/clear`, dann `/workflow:status`. |

---

## Mit Ralph automatisieren (optional)

Sobald du dich wohlfühlst, automatisiere eine Story von Anfang bis Ende mit dem kontinuierlichen Loop:

```
/common:ralph-run "Implement US-001 with full DoD validation"
```

Ralph hält Claude am Arbeiten, bis die Definition-of-Done-Validatoren bestehen. Siehe [RALPH-GUIDE.md](../../RALPH-GUIDE.md).

---

## Anhang — Ein reales Multi-Stack-Szenario

TaskFlow ist absichtlich Single-Stack. Echte Produkte sind unordentlicher — und derselbe Workflow skaliert auf sie. Als reicheres Beispiel betrachte eine Wrandly-ähnliche App (anonymisierte Version als Test-Fixture unter `tests/fixtures/wrandly-anon/`):

- **Zwei Clients:** eine Web-PWA (Symfony + React) **und** eine Flutter-Mobile-App, plus eine eigene REST-API.
- **Ein Design-Handoff existiert bereits** vor Entwicklungsbeginn (ein „Claude Design"-Paket): Quelldokumente, 5 gesperrte Architekturentscheidungen und ein phasenweiser Plan (Epics 0 → 7).

So ordnet es sich in dieses Tutorial ein:

| Design-Artefakt | Fließt ein in |
|-----------------|---------------|
| Quelldokumente | `/workflow:plan` (Eingabe für PRD + Backlog) |
| Gesperrte Architekturentscheidungen | `/workflow:design` (in der Tech Spec formalisiert) |
| Phasen 0 → 7 | Die Aufteilung Epics → Sprints |

Zwei Anpassungen für Multi-Stack:

1. **Beginne mit dem Foundation-Epic** (Epic 0): Monorepo, gemeinsame Design-Tokens, der OpenAPI-Vertrag und ein Map-Style **bevor** irgendeine UI-Komponente — ein echtes *Walking Skeleton*.
2. **Führe Web- und Mobile-Sprints parallel** mit `/team:sprint` (Agent Teams) aus, wobei jeder die Gates seines eigenen Stacks respektiert.

Alles andere — Gates, TDD, das Kanban-Board, `/clear`-Disziplin — ist identisch. Die Methode ändert sich nicht mit dem Umfang; nur die Anzahl der parallelen Tracks ändert sich.

---

## Nächste Schritte

- [Feature-Entwicklung](03-feature-development.md) — tiefer in den TDD-Loop und Agenten einsteigen.
- [Backlog-Verwaltung](07-backlog-management.md) — Epics, Stories und die 15+ Projektbefehle meistern.
- [BMAD Praktischer Leitfaden](../../BMAD-PRACTICAL-GUIDE.md) — die vollständige Befehlsreferenz für die Methode.
- [Autonomer Sprint](../AUTONOMOUS-SPRINT.md) — eine Agenten-Pipeline den gesamten Sprint ausführen lassen.
- [Lernpfade](../../LEARNING-PATHS.md) — Einsteiger → Fortgeschrittene → Experten-Progression.
