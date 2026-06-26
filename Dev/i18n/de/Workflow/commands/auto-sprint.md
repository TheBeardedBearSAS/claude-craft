---
description: End-to-End-Sprint-Orchestrator (Start -> Zerlegung -> Validierung -> Implementierung -> PR -> CI -> Review -> Retro -> Merge)
argument-hint: "<N> [--auto-merge] [--max-fix-attempts=2] [--max-workers=3] [--base=main] [--dry-run] [--overnight]"
---

# Auto Sprint — End-to-End-Sprint-Orchestrator

Sie agieren als **Product Owner / Scrum Master** und steuern einen vollständigen Sprint von der Eröffnung bis zum Merge
in einem **einzigen Befehl**. Jede Zeremonie läuft in einem **isolierten Unter-Agenten**: Das eigene
Kontextfenster des Unter-Agenten ersetzt das manuelle `/clear` zwischen den Schritten, sodass der
Orchestrator-Kontext schlank bleibt. Die Implementierungsphase wird **von Ihnen als Dirigent** übernommen
(gleiche Logik wie `/team:sprint`), um verschachtelte Agent Teams zu vermeiden.

Dies automatisiert, was zuvor sechs manuelle Befehle mit einem `/clear` dazwischen erforderte:

```
/workflow:start N -> /project:decompose-tasks 00N -> /gate:validate-sprint 00N
-> /team:sprint "sprint-00N" -> /workflow:review N -> /workflow:retro N
```

…und ergänzt dies um: Branch, Commit, Pull Request, CI-Überwachung und Merge.

## Argumente

$ARGUMENTS

- `<N>` : Sprint-Nummer (z.B. `5`). **Erforderlich.**
- `--auto-merge` : Merge automatisch durchführen, sobald CI grün und DoD bestanden ist. **Standard: AUS** — der
  Befehl pausiert und wartet auf ein explizites menschliches GO vor dem Merge (berücksichtigt „review obligatoire",
  Regel 09, und das Karpathy-Prinzip „kein Auto-Merge ohne menschliche Review").
- `--max-fix-attempts=2` : Maximale automatische Korrekturversuche pro fehlgeschlagenem Gate vor dem Abbruch (Standard: 2).
- `--max-workers=3` : Maximale parallele Entwickler-Worker in der Implementierungsphase (Standard: 2, Maximum: 3).
- `--base=main` : Basis-Branch für den PR (Standard: `main`).
- `--dry-run` : Gibt die geplanten 9 Phasen und den aufgelösten Sprint-Kontext aus und hält dann an. **Keine Schreibvorgänge.**
- `--overnight` : Wird an die Implementierungsphase weitergegeben (begrenzt, stoppt um 6 Uhr morgens).

## Voraussetzungen

- Claude Code v2.1.32+ mit Agent Teams Unterstützung
- `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1` gesetzt
- `gh` CLI authentifiziert (PR erstellen / Prüfungen / Merge)
- Docker verfügbar (alle Tests laufen über Docker — siehe Projekt-CLAUDE.md)
- BMAD v6-Projekt mit vorhandener `.bmad/sprint-status.yaml`

> Falls eine Voraussetzung fehlt, sofort mit einer klaren, handlungsorientierten Meldung abbrechen. Eine Phase nicht stillschweigend überspringen.

## Normalisierung der Sprint-Nummer

Die verketteten Befehle sind sich über das Format uneinig. **Einmalig** in Phase 0 normalisieren und die richtige Form
an jede Phase übergeben:

| Phase | Erwartetes Format |
|-------|-------------------|
| `start`, `review`, `retro` | Reine Zahl `N` (z.B. `5`) |
| `decompose-tasks` | Null-aufgefüllt `00N` (z.B. `005`) |
| `team:sprint` (Implementierung) | Freier Sprint-Name, aus Ordner / Status-Datei aufgelöst |

Den Sprint-Ordner durch Glob-Suche `project-management/sprints/sprint-{N}-*/` auflösen und
`.bmad/sprint-status.yaml` für den kanonischen Sprint-Namen und die Story-Liste lesen.

## Prozess

### Phase 0 — Normalisieren & Branch anlegen (direkt)

1. `<N>` und Flags parsen. `N`, `00N`, Sprint-Slug und Sprint-Name ableiten.
2. `project-management/sprints/sprint-{N}-*/` und `.bmad/sprint-status.yaml` auflösen.
   **Abbruch**, falls weder das eine noch das andere existiert (nichts zu orchestrieren).
3. Sicherstellen, dass der Working Tree sauber ist und `--base` aktuell ist. **Abbruch** bei schmutzigem Tree.
4. Den Feature-Branch `feature/sprint-{N}-<slug>` von `--base` erstellen / auschecken
   (Regel 09: `main` immer deployfähig — nie direkt auf dem Basis-Branch arbeiten).
5. Bei `--dry-run`: aufgelösten Kontext + die 9 geplanten Phasen ausgeben und **hier stoppen**.

### Phase 1 — Start (Unter-Agent)

Einen isolierten Unter-Agenten starten:

> „Lesen Sie `.claude/commands/workflow/start.md` und führen Sie es für Sprint **N** aus.
> Erstellen Sie die Sprint-Ordnerstruktur, `sprint-goal.md` und die Vor-Sprint-Checkliste.
> Geben Sie eine knappe Zusammenfassung (< 50 Tokens) und die Liste der erstellten Dateien zurück."

### Phase 2 — Zerlegung (Unter-Agent)

> „Lesen Sie `.claude/commands/project/decompose-tasks.md` und führen Sie es für Sprint **00N** aus.
> Generieren Sie die Task-Dateien je US, `task-board.md` und den Abhängigkeitsgraphen.
> Geben Sie eine knappe Zusammenfassung und die erstellten Dateien zurück."

### Phase 3 — Gate-Validierung (Unter-Agent + Auto-Korrektur-Schleife)

> „Lesen Sie `.claude/commands/gate/validate-sprint.md` und führen Sie es für Sprint **00N** aus.
> Geben Sie PASS/FAIL, die Punktzahl und die Liste der fehlgeschlagenen Kriterien zurück."

**Bei FAIL → Auto-Korrektur-Schleife** (bis zu `--max-fix-attempts`):
- Einen Korrektur-Unter-Agenten starten, der die gemeldeten Lücken direkt in den Sprint-Dateien behebt
  (Stories nicht `ready-for-dev`, fehlende Schätzungen, ungelöste Abhängigkeiten).
- Den Validierungs-Unter-Agenten erneut starten.
- Falls nach `--max-fix-attempts` immer noch fehlgeschlagen → **Abbruch** mit dem Korrekturbericht.

### Phase 4 — Implementierung (Sie = Dirigent)

Direkt die **`/team:sprint`-Dirigenten-Rolle übernehmen** (kein verschachteltes Agent Team starten):

1. `.bmad/sprint-status.yaml` lesen; Stories mit Status `ready-for-dev` filtern.
2. Datei-Domain-Unabhängigkeit analysieren (`**/Shared/**`, `**/Common/**`, `**/Utils/**`,
   `**/Helpers/**` Überschneidungen markieren → beim gleichen Worker sequenzieren).
3. Kosten über `Tools/AgentTeams/lib/cost-estimator.sh` schätzen (Fast-Mode-Blockierungsschutz
   und `--max-cost` falls vorhanden berücksichtigen).
4. `TaskCreate` für einen Entwickler-Worker pro unabhängiger Story (max. `--max-workers`), schlanker Kontext
   (nur `@.claude/references/<project-tech>/CLAUDE.md`). Worker folgen TDD Rot/Grün/Refactoring
   mit **Docker**-Testbefehlen.
5. `TaskList` alle 30 Sekunden abfragen (nach 3 inaktiven Abfragen auf 60 Sekunden zurückgehen). `TaskList`
   alle 5 Worker-Abschlüsse aktualisieren (Kontext-Kompaktierungs-Absicherung). Worker-Abschlussmeldungen
   auf < 50 Tokens begrenzen.
6. **DoD** pro Story validieren; `in-progress -> review` in `sprint-status.yaml`
   über das Single-Writer-Pattern umstellen.

**Bei DoD-Verfehlung einer Story → Auto-Korrektur-Schleife** (gleiche Wiederholungsanzahl): Worker mit den
fehlgeschlagenen Prüfungen erneut beauftragen; nach `--max-fix-attempts` die Story als `blocked` markieren und fortfahren.

### Phase 5 — Commit & PR (direkt)

1. Die Implementierung mit **Conventional Commits** committen (soweit möglich atomar pro Story).
2. Den Feature-Branch pushen.
3. Einen **Entwurfs**-PR gegen `--base` über `gh pr create` öffnen (Titel + Beschreibung mit Sprint-Ziel,
   gelieferten Stories und DoD-Status).

### Phase 6 — CI-Überwachung (direkt + Auto-Korrektur-Schleife)

1. CI überwachen: `gh pr checks --watch` (ca. 30s-Abfrage).
2. **Bei Rot → Auto-Korrektur-Schleife** (bis zu `--max-fix-attempts`): Protokolle des fehlgeschlagenen Jobs lesen
   (`gh run view --log-failed`), einen Korrektur-Unter-Agenten starten, committen + pushen, erneut überwachen.
3. Nach `--max-fix-attempts` immer noch rot → **Abbruch** mit dem Bericht über fehlgeschlagene Prüfungen.

### Phase 7 — Review (Unter-Agent)

> „Lesen Sie `.claude/commands/workflow/review.md` und führen Sie es für Sprint **N** aus (verwendet
> `git log` / `gh pr` zum Sammeln von Sprint-Daten). Erstellen Sie `sprint-review.md`. Geben Sie eine knappe Zusammenfassung zurück."

### Phase 8 — Retro (Unter-Agent)

> „Lesen Sie `.claude/commands/workflow/retro.md` und führen Sie es für Sprint **N** aus.
> Erstellen Sie `sprint-retro.md` mit SMART-Maßnahmen. Geben Sie eine knappe Zusammenfassung zurück."

### Phase 9 — Merge (direkt, gesperrt)

- **Falls `--auto-merge`** UND CI ist grün UND DoD bestanden:
  `gh pr ready` dann `gh pr merge --squash --delete-branch`.
- **Andernfalls (Standard)**: **pausieren**. Die abschließende Zusammenfassung, den PR-Link, den CI-Status und den
  DoD-Bericht präsentieren, dann **auf ein explizites menschliches GO warten** bevor gemergt wird.

> **Merge-Fehler werden gemeldet, nie hartcodiert.** Falls der Merge durch Branch-Schutz blockiert wird,
> diesen melden und `--admin` vorschlagen. Falls er blockiert wird, weil der PR `.github/workflows/` berührt
> und dem Token der `workflow`-Scope fehlt, diesen melden und einen manuellen Squash-und-Push vorschlagen.
> Keine repository-spezifischen Eigenheiten in diesen generischen Befehl einbauen.

## Abschlussbericht

```
================================================================
AUTO SPRINT — Zusammenfassung
================================================================
Sprint        : sprint-<N>-<slug>
Branch        : feature/sprint-<N>-<slug>
Basis         : <base>
PR            : <url>  (CI: <grün|rot>)
----------------------------------------------------------------
Phase                  | Status  | Anmerkungen
-----------------------|---------|---------------------------------------
0 Normalisieren        | OK      | <N>/00<N>, Branch bereit
1 Start                | OK      | sprint-goal.md
2 Zerlegung            | OK      | N Task-Dateien
3 Gate-Validierung     | OK      | Punktzahl X% (Y Korrekturversuche)
4 Implementierung      | OK      | A/B Stories, C blockiert
5 Commit + PR          | OK      | <url>
6 CI-Überwachung       | OK      | grün (Z Korrekturversuche)
7 Review               | OK      | sprint-review.md
8 Retro                | OK      | sprint-retro.md
9 Merge                | PAUSIERT| wartet auf menschliches GO (oder GEMERGT)
================================================================
```

## Fehlerbehandlung

| Situation | Verhalten |
|-----------|-----------|
| Sprint-Ordner / Status-Datei fehlt | Abbruch in Phase 0 |
| Working Tree schmutzig | Abbruch in Phase 0 |
| Gate-Validierung schlägt nach Wiederholungen fehl | Abbruch mit Korrekturbericht |
| Story-DoD-Verfehlung nach Wiederholungen | Als `blocked` markieren, fortfahren, am Ende berichten |
| CI rot nach Wiederholungen | Abbruch mit Bericht über fehlgeschlagene Prüfungen |
| Merge blockiert (Schutz / Scope) | Fehler melden + vorgeschlagenes Flag, nicht erzwingen |
| Agent Teams nicht verfügbar | Abbruch von Phase 4 mit Setup-Hinweis (`CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1`) |

## Hinweise

- **Keine verschachtelten Agent Teams**: Die Dirigenten-Rolle in Phase 4 selbst übernehmen.
- **Auto-Merge ist opt-in** und absichtlich hinter einem Flag gesperrt.
- **Docker ist obligatorisch** für Tests (Projekt-CLAUDE.md).
- Die Isolation der Unter-Agenten ersetzt `/clear` — jeden Unter-Agenten-Bericht knapp halten.
