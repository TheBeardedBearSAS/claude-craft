# Kontextverwaltung

## Ueberblick

Das Kontextfenster ist **DIE kritische Ressource** in Claude Code. Jeder Token zaehlt. Effektive Kontextverwaltung ist der Unterschied zwischen einem produktiven Assistenten und einem, der den Faden verliert.

> **Quelle:** Anthropic Best Practice #1 — "The context window is the single most important resource to manage."

**Prinzipien:**
- Kontext ist eine endliche und wertvolle Ressource
- CLAUDE.md und Regeln konkurrieren um die Aufmerksamkeit des Modells
- Sub-Agents fuer Untersuchungen verwenden
- Kontext zwischen Aufgaben bereinigen

---

## Inhaltsverzeichnis

1. [CLAUDE.md Groessenregeln](#claudemd-groessenregeln)
2. [Kontextbereinigung](#kontextbereinigung)
3. [Sub-Agents fuer Untersuchungen](#sub-agents-fuer-untersuchungen)
4. [Context Compaction](#context-compaction)
5. [Verifikationsschleifen](#verifikationsschleifen)
6. [Plan Mode](#plan-mode)
7. [Token-Tracking](#token-tracking)
8. [Checkliste](#checkliste)

---

## CLAUDE.md Groessenregeln

### Empfohlenes Limit

> **Haupt-CLAUDE.md: maximal 150-200 Zeilen.**
> Jede zusaetzliche Anweisung verduennt die Aufmerksamkeit auf bestehende Anweisungen.

### Modularitaetsstrategie

```
.claude/
  CLAUDE.md              <- Zusammenfassung (max. 150-200 Zeilen)
  rules/                 <- Detaillierte Regeln (bei Bedarf geladen)
  references/            <- Technische Dokumentation
  skills/                <- Faehigkeiten bei Bedarf
```

### Best Practices

| Praxis | Beschreibung |
|--------|-------------|
| **Kurze CLAUDE.md** | Ueberblick, Links zu Regeln |
| **Modulare Regeln** | Eine Datei pro Thema in `.claude/rules/` |
| **Separate Referenzen** | Technische Docs in `.claude/references/` |
| **Bedarfsgesteuerte Skills** | Faehigkeiten nur bei Bedarf geladen |

---

## Kontextbereinigung

### Wann `/clear` verwenden

```
/clear verwenden:
- Zwischen zwei NICHT zusammenhaengenden Aufgaben
- Nach einer langen Untersuchung
- Wenn der Kontext 50% des Fensters uebersteigt
- Vor dem Start eines neuen Features

/clear NICHT verwenden:
- Mitten in einer laufenden Aufgabe
- Wenn vorheriger Kontext benoetigt wird
- Direkt nach dem Laden relevanter Dateien
```

### Zeichen fuer Kontextverschmutzung

- Claude wiederholt bereits gegebene Informationen
- Antworten werden weniger praezise
- Claude verwechselt Elemente verschiedener Aufgaben
- Fehler nehmen trotz klarer Anweisungen zu

---

## Sub-Agents fuer Untersuchungen

### Prinzip

> **Recherchen an Sub-Agents delegieren, um den Hauptkontext sauber zu halten.**

Sub-Agents (Task-Tool) haben ihr eigenes Kontextfenster. Die Verwendung eines Sub-Agents zur Codebase-Erkundung vermeidet die Verschmutzung des Hauptkontexts.

### Wann einen Sub-Agent verwenden

| Situation | Aktion |
|-----------|--------|
| Bestimmte Datei/Muster suchen | Glob/Grep direkt |
| Unbekannte Architektur erkunden | Explore Sub-Agent |
| Multi-Datei-Untersuchung (> 3) | Explore Sub-Agent |
| Implementierung planen | Plan Sub-Agent |
| Unabhaengige parallele Aufgabe | General-Purpose Sub-Agent |

---

## Context Compaction

### Funktionsweise

Claude Code kompaktiert den Kontext automatisch, wenn er sich den Fenstergrenzen naehert. Aeltere Nachrichten werden zusammengefasst.

### Re-Injektions-Hooks

Den `SessionStart`-Hook mit dem `compact`-Matcher verwenden, um kritischen Kontext nach einer Kompaktierung erneut einzufuegen:

```json
{
  "hooks": {
    "SessionStart": [
      {
        "matcher": "compact",
        "command": "cat .claude/context-essentials.md"
      }
    ]
  }
}
```

---

## Verifikationsschleifen

### Prinzip

> **Immer Verifikationsmittel bereitstellen: Tests, Screenshots, erwartete Ausgaben.**
> Quelle: "2-3x improvement in final result quality" (Anthropic)

### Muster: Spezifikation-Implementierung-Verifikation

```
1. SPEZIFIKATION
   -> Erwartetes Verhalten definieren
   -> Input/Output-Beispiele bereitstellen
   -> Tests zuerst schreiben (TDD)

2. IMPLEMENTIERUNG
   -> Loesung kodieren

3. VERIFIKATION
   -> Tests ausfuehren
   -> Mit erwarteten Ausgaben vergleichen
   -> Bei Bedarf korrigieren
```

---

## Plan Mode

### Wann in Planung investieren

| Situation | Aktion |
|-----------|--------|
| Einfacher Bug, 1 Datei | Direkt beheben |
| Einfaches Feature, < 3 Dateien | Direkt implementieren |
| Komplexes Feature, > 3 Dateien | Plan Mode |
| Architektur-Refactoring | Plan Mode |
| Technologiewahl | Plan Mode |
| Unsichere Auswirkungen | Plan Mode |

---

## Token-Tracking

### Aktionsschwellen

| Kontext verwendet | Aktion |
|-------------------|--------|
| < 30% | Normal, weiterarbeiten |
| 30-60% | Ueberwachen, unnoetige Lesevorgaenge vermeiden |
| 60-80% | An Sub-Agents delegieren, /clear erwaegen |
| > 80% | Kompaktierung steht bevor, kritischen Kontext sichern |

---

## Parallele Worktrees

### Prinzip

> **"Single biggest productivity unlock"** — Boris Cherny (Anthropic)

`git worktree` verwenden, um gleichzeitig an mehreren Branches mit unabhaengigen Claude-Sessions zu arbeiten.

### Setup

```bash
git worktree add ../feature-auth feature/auth
cd ../feature-auth && claude
```

### Writer/Reviewer-Muster

```
Terminal 1 (Writer):
  cd ../feature-auth
  claude "JWT-Authentifizierung implementieren"

Terminal 2 (Reviewer):
  cd ../review-auth
  claude "Authentifizierungscode ueberpruefen"
```

### Empfehlungen

- Maximal 3-5 Worktrees
- Ein Worktree = eine Aufgabe
- Abgeschlossene Worktrees entfernen
- Keine Sessions zwischen Worktrees teilen

---

## Checkliste

### Vor jeder Session

- [ ] CLAUDE.md < 200 Zeilen
- [ ] Modulare Regeln in `.claude/rules/`
- [ ] Sauberer Kontext

### Waehrend der Session

- [ ] Kontext-% ueberwachen
- [ ] Untersuchungen an Sub-Agents delegieren
- [ ] `/clear` zwischen unzusammenhaengenden Aufgaben
- [ ] Tests/erwartete Ausgaben bereitstellen

### Fuer komplexe Aufgaben

- [ ] Plan Mode verwenden
- [ ] In Teilaufgaben zerlegen
- [ ] Worktrees fuer Parallelismus
- [ ] Verifikationsschleifen

---

## Ressourcen

- **Anthropic Best Practices:** [docs.anthropic.com](https://docs.anthropic.com/en/docs/claude-code/overview)
- **Boris Cherny Workflow:** Parallele Worktrees + Verifikationsschleifen
- **Claude Code Kontextverwaltung:** Context Compaction, `/clear`, Sub-Agents

---

**Letzte Aktualisierung:** 2026-02
**Version:** 1.0.0
**Autor:** The Bearded CTO
