# Welcher Weg? Ihren Workflow in 30 Sekunden wählen

> **Für wen?** Für alle, die gleich mit Bear Craft starten und sich fragen: „Welche Befehle führe ich in welcher Reihenfolge aus?“. Beantworten Sie zwei Fragen und folgen Sie einem Weg.
>
> **Faustregel:** eine Situation = ein Weg = eine kurze Befehlsfolge. Die übrigen 100+ Befehle brauchen Sie für den Einstieg nie.

---

## 1. Der Entscheidungsbaum

```
                    Was tun Sie heute?
                           │
        ┌──────────────┬───┴──────────┬──────────────────┐
        ▼              ▼              ▼                  ▼
  Ein neues        Bestehender      Ein Bug, der     Ein geplanter Sprint,
  Produkt von      Code, noch       behoben werden   den Sie ohne
  Grund auf        kein Backlog     muss             Aufsicht abschließen
        │              │              │                wollen
        ▼              ▼              ▼                  ▼
   GREENFIELD      BROWNFIELD      BUGFIX         AUTONOMER SPRINT
  /bear-workflow:init  /bear-project:reverse scan  /bear-qa:tdd   /bear-workflow:auto-sprint N
        │              │        (+ Quick Flow)          │
        ▼              ▼              ▼                  ▼
     Abschnitt 2    Abschnitt 3   Abschnitt 4        Abschnitt 5

  Jederzeit verloren?  →  /bear-workflow:status   (Abschnitt 6)
```

Unsicher? Stellen Sie sich diese Fragen:

1. **Gibt es bereits Code?** Nein → Greenfield. Ja → Frage 2.
2. **Gibt es bereits ein Backlog (Epics und Stories)?** Nein → Brownfield. Ja → Frage 3.
3. **Handelt es sich um einen einzelnen Bug?** Ja → Bugfix. Nein → setzen Sie den Sprint mit `/bear-workflow:start N` fort oder übergeben Sie ihn an den autonomen Sprint.

---

## 2. Greenfield: ein neues Produkt

Sie haben eine Idee und ein leeres Repository. Folgen Sie dem Hauptweg, Phase für Phase:

```
/bear-workflow:init  →  /bear-workflow:plan  →  /bear-workflow:design  →  /bear-workflow:start 1
                →  /bear-workflow:implement  →  /bear-workflow:review  →  /bear-workflow:retro
```

| Schritt | Befehl | Ergebnis |
|---------|--------|----------|
| 1 | `/bear-workflow:init` | Projektanalyse, empfohlener Track (Quick, Standard oder Enterprise) und `.bmad/sprint-status.yaml` |
| 2 | `/bear-workflow:plan` | PRD, Personas und generiertes Backlog |
| 3 | `/bear-workflow:design` | Technische Spezifikation und Architektur |
| 4 | `/bear-workflow:start 1` | Sprint 1 vorbereitet: Stories ausgewählt und bereit für die Entwicklung |
| 5 | `/bear-workflow:implement` | Stories per TDD umgesetzt (Red → Green → Refactor) |
| 6 | `/bear-workflow:review` | Vorbereitung des Sprint-Reviews |
| 7 | `/bear-workflow:retro` | Retrospektive, danach zurück zu `/bear-workflow:start 2` |

Eine erzählte Schritt-für-Schritt-Version finden Sie im [Tutorial zum kompletten Workflow](10-complete-workflow.md).

---

## 3. Brownfield: bestehender Code, kein Backlog

Sie übernehmen (oder haben bereits geschrieben) eine Codebasis, aber niemand hat dokumentiert, was sie tut. Rekonstruieren Sie zuerst das Produkt und schließen Sie sich dann dem Hauptweg an:

```
/bear-project:reverse scan  →  /bear-project:reverse prd  →  /bear-project:reverse stories
               →  /bear-project:reverse gaps  →  /bear-workflow:start
```

| Schritt | Befehl | Ergebnis |
|---------|--------|----------|
| 1 | `/bear-project:reverse scan` | Bestandsaufnahme der Codebasis: Stack, Struktur, Module |
| 2 | `/bear-project:reverse prd` | Ein PRD, rekonstruiert aus dem, was der Code tatsächlich tut |
| 3 | `/bear-project:reverse stories` | Aus vorhandenen Funktionen abgeleitete User Stories |
| 4 | `/bear-project:reverse gaps` | Fehlende Funktionen, fehlende Tests, technische Schulden |
| 5 | `/bear-workflow:start` | Erster Sprint, aus den Lücken geplant; weiter mit `/bear-workflow:implement` |

Siehe auch den [Leitfaden zur Einrichtung in einem bestehenden Projekt](09-setup-existing-project.md).

---

## 4. Bugfix: zuerst reproduzieren, dann beheben

Ein Bug braucht kein PRD. Nutzen Sie den leichtesten Track und lassen Sie den Test die Korrektur steuern:

```
/bear-qa:tdd        ← ZUERST den Test schreiben, der den Bug reproduziert (er muss fehlschlagen)
/bear-workflow:init --quick    ← Quick-Flow-Track: nur Implementierung
```

1. Führen Sie `/bear-qa:tdd` aus und beschreiben Sie den Bug. Der reproduzierende Test wird **vor** jeder Korrektur geschrieben und muss fehlschlagen.
2. Führen Sie `/bear-workflow:init --quick` aus, um den Quick-Flow-Track zu erzwingen (keine Planungs- und Designphasen).
3. Korrigieren Sie den Code, bis der Test besteht, und refaktorieren Sie anschließend. Der Test bleibt als Regressionsschutz in der Suite: Ein behobener Bug darf nie wiederkehren.

Details finden Sie im [Leitfaden zur Fehlerbehebung](04-bug-fixing.md).

---

## 5. Autonomer Sprint: ein Befehl, vom Start bis zum Merge

Ist die Arbeit bereits geplant, lassen Sie Bear Craft den gesamten Sprint steuern:

```
/bear-workflow:auto-sprint N
```

**Voraussetzungen**

- Ein Backlog existiert (aus dem Greenfield- oder Brownfield-Weg).
- Sprint `N` ist geplant.

**Was der Befehl tut:** Er verkettet Start, Aufgabenzerlegung, Validierung, Implementierung, Pull Request, CI, Review, Retrospektive und schließlich den Merge. Der Lauf endet mit **PR, grüner CI und Merge**. Sie prüfen das Ergebnis, statt jeden Befehl einzutippen.

Kontrolle wichtiger als Tempo? Bleiben Sie auf dem manuellen Hauptweg aus Abschnitt 2.

---

## 6. Wo stehe ich?

Jederzeit, unabhängig vom Weg:

```
/bear-workflow:status
```

Der Befehl zeigt die aktuelle Phase, den Sprint-Fortschritt und die empfohlene nächste Aktion.

> **Einzige Wahrheitsquelle:** `.bmad/sprint-status.yaml` enthält den Status jeder Story (`backlog → ready-for-dev → in-progress → review → done`, oder `blocked`). Die Datei wird von `/bear-workflow:init` angelegt, und jeder Befehl liest und aktualisiert sie. Widersprechen sich zwei Ansichten, gilt diese Datei.

---

## Spickzettel

| Situation | Beginnen mit | Danach |
|-----------|--------------|--------|
| Neues Produkt | `/bear-workflow:init` | `/bear-workflow:plan` → `/bear-workflow:design` → `/bear-workflow:start 1` |
| Bestehender Code, kein Backlog | `/bear-project:reverse scan` | `/bear-project:reverse prd` → `/bear-project:reverse stories` → `/bear-project:reverse gaps` → `/bear-workflow:start` |
| Bug | `/bear-qa:tdd` | `/bear-workflow:init --quick` |
| Geplanter Sprint, ohne Eingriff | `/bear-workflow:auto-sprint N` | PR prüfen |
| Verloren | `/bear-workflow:status` | Empfohlene Aktion befolgen |
