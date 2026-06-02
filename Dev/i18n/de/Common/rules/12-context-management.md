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
9. [Compaction-Hinweise in CLAUDE.md](#compaction-hinweise-in-claudemd)
10. [CLAUDE.local.md fuer persoenliche Einstellungen](#claudelocalmd-fuer-persoenliche-einstellungen)
11. [Kontext-Anti-Patterns](#kontext-anti-patterns)
12. [CLAUDE.md Best Practices fuer die Erstellung](#claudemd-best-practices-fuer-die-erstellung)
13. [Performance-Optimierung](#performance-optimierung)
14. [Kommunikationsmuster](#kommunikationsmuster)
15. [Neue Kontextbefehle](#neue-kontextbefehle)
16. [Agent Frontmatter](#agent-frontmatter)
17. [Managed Settings](#managed-settings)
18. [Monitor und Hintergrundereignisse](#monitor-und-hintergrundereignisse)

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
    01-workflow-analysis.md
    04-solid-principles.md
    05-kiss-dry-yagni.md
    ...
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

### Was in CLAUDE.md vs Rules gehoert

| Inhalt | Ort |
|--------|-----|
| Unterstuetzte Technologien | CLAUDE.md |
| Verfuegbare Befehle | CLAUDE.md |
| Verfuegbare Agents | CLAUDE.md |
| Claude Code Kompatibilitaet | CLAUDE.md |
| Detaillierte SOLID-Prinzipien | `.claude/rules/04-solid-principles.md` |
| Sicherheitsregeln | `.claude/rules/11-security.md` |
| Analyse-Workflow | `.claude/rules/01-workflow-analysis.md` |

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

### Muster: Untersuchung dann Implementierung

```
Session 1: Untersuchung
  -> Code lesen, Architektur verstehen
  -> Ergebnisse dokumentieren
  -> /clear

Session 2: Implementierung
  -> Nur notwendige Dateien laden
  -> Mit sauberem Kontext implementieren
```

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

### Beispiel

```
# Anstatt 20 Dateien im Hauptkontext zu lesen:

Task(Explore): "Wie funktioniert die Authentifizierung in diesem Projekt?
  Liste die Dateien, Muster und Abhaengigkeiten auf."

# Der Sub-Agent erkundet und gibt eine Zusammenfassung zurueck
# Der Hauptkontext bleibt sauber
```

### Agent Frontmatter (v2.1.78+)

Benutzerdefinierte Agents unterstuetzen Frontmatter-Felder zur Steuerung ihres Verhaltens:

```yaml
---
effort: low          # Aufwandsniveau (low/medium/high)
maxTurns: 10         # Maximale Anzahl von Turns
disallowedTools:     # Nicht erlaubte Tools
  - Edit
  - Write
---
```

Diese Felder ermoeglichen die Optimierung von Kosten und Umfang der Sub-Agents.

---

## Context Compaction

### Funktionsweise

Claude Code kompaktiert den Kontext automatisch, wenn er sich den Fenstergrenzen naehert. Aeltere Nachrichten werden zusammengefasst, um Platz freizugeben.

### Proaktive Kompaktierung

Ab 70% Kontextnutzung `/compact` proaktiv ausfuehren, um eine unkontrollierte automatische Kompaktierung zu vermeiden.

Der Befehl `/memory` (v2.1.59+) ermoeglicht das Speichern persistenter Session-Erkenntnisse, die Kompaktierungen und neue Sessions ueberleben.

### PreCompact Hook

Den `PreCompact`-Hook verwenden, um kritischen Kontext vor einer Kompaktierung zu sichern:

```json
{
  "hooks": {
    "PreCompact": [
      {
        "matcher": "auto",
        "hooks": [{
          "type": "command",
          "command": "cat .claude/context-essentials.md"
        }]
      }
    ]
  }
}
```

### PostCompact Hook

Den `PostCompact`-Hook (v2.1.76+) verwenden, um kritischen Kontext nach einer Kompaktierung erneut einzufuegen:

```json
{
  "hooks": {
    "PostCompact": [
      {
        "matcher": "auto",
        "hooks": [{
          "type": "command",
          "command": "cat .claude/context-essentials.md"
        }]
      }
    ]
  }
}
```

Ab v2.1.105 kann der `PreCompact`-Hook die Kompaktierung ueber Exit-Code 2 **blockieren**, sodass kontrolliert werden kann, wann die Kompaktierung stattfindet.

### Re-Injektions-Hooks

Den `SessionStart`-Hook mit dem `compact`-Matcher verwenden, um kritischen Kontext nach einer Kompaktierung erneut einzufuegen:

```json
{
  "hooks": {
    "SessionStart": [
      {
        "matcher": "compact",
        "hooks": [{
          "type": "command",
          "command": "cat .claude/context-essentials.md"
        }]
      }
    ]
  }
}
```

### Wesentlichen Kontext vorbereiten

Eine `.claude/context-essentials.md`-Datei erstellen mit:
- Wichtigen Architekturentscheidungen
- Projektkonventionen
- Aktuellen Aufgaben
- Kritischen Einschraenkungen

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
   -> Wiederholen bis zufriedenstellend
```

### Effektive Schleifen-Beispiele

```
TDD-Schleife:
  Test (RED) -> Code (GREEN) -> Refactor -> Test (GREEN)

UI-Schleife:
  Screenshot vorher -> Aenderung -> Screenshot nachher -> Vergleichen

API-Schleife:
  OpenAPI-Spec -> Implementierung -> curl-Test -> Antwort vergleichen

CI-Schleife:
  Code aendern -> Tests ausfuehren -> Fehler beheben -> Erneut ausfuehren
```

### Anti-Patterns

```
NICHT MACHEN:
- Ohne Tests implementieren
- Annehmen, dass es funktioniert, ohne zu pruefen
- Testfehler ignorieren
- Zur naechsten Aufgabe uebergehen ohne Verifikation
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

### Vorteile des Plan Mode

- Codebase erkunden, bevor man handelt
- Betroffene Dateien identifizieren
- Ansatz vorschlagen, bevor man implementiert
- Nacharbeit vermeiden

---

## Token-Tracking

### Statuszeile

Die Claude Code Statuszeile zeigt den Prozentsatz des verwendeten Kontexts an. Diesen Indikator ueberwachen, um Kompaktierungen vorherzusehen.

### Aktionsschwellen

| Kontext verwendet | Aktion |
|-------------------|--------|
| < 30% | Normal, weiterarbeiten |
| 30-60% | Ueberwachen, unnoetige Lesevorgaenge vermeiden |
| 60-80% | An Sub-Agents delegieren, /clear erwaegen |
| > 80% | Kompaktierung steht bevor, kritischen Kontext sichern |

### /context-Befehl (v2.1.74+)

Der `/context`-Befehl liefert umsetzbare Vorschlaege zur Optimierung der Kontextnutzung. Regelmaessig verwenden, um Verschwendungsquellen zu identifizieren.

### /effort-Befehl (v2.1.72+)

Das Aufwandsniveau des Modells je nach Aufgabenkomplexitaet anpassen:

| Befehl | Aufwand | Verwendung |
|--------|---------|------------|
| `/effort low` | Minimal | Einfache Aufgaben, Lookups |
| `/effort medium` | Standard | Routineimplementierung |
| `/effort high` | Maximum | Komplexes Reasoning, Architektur |

### Inaktivitaetswarnung (v2.1.84+)

Nach 75+ Minuten Inaktivitaet schlaegt Claude automatisch `/clear` vor, um veralteten Kontext zu vermeiden.

### Multi-Session-Strategie

Fuer komplexe Aufgaben die Arbeit in kurze, fokussierte Sessions aufteilen. Jede Session nutzt frischen Kontext und reduziert den Token-Verbrauch um etwa 55%:

```
Session 1: Untersuchung (lesen, analysieren, dokumentieren)
  -> /memory um Schlussfolgerungen zu speichern
  -> /clear

Session 2: Implementierung (kodieren, testen)
  -> Vorheriges /memory wird automatisch geladen
  -> Frischer Kontext, keine Verschmutzung
```

### Geplante Aufgaben /loop (v2.1.71+)

Der `/loop`-Befehl ermoeglicht die Planung wiederkehrender Aufgaben:

```bash
/loop 5m /common:pre-commit-check    # Alle 5 Minuten pruefen
/loop "CI-Tests ueberwachen"          # Automatische Taktung durch das Modell
```

Alias: `/proactive` (v2.1.105+).

---

## Parallele Worktrees

### Prinzip

> **"Single biggest productivity unlock"** — Boris Cherny (Anthropic)

`git worktree` verwenden, um gleichzeitig an mehreren Branches mit unabhaengigen Claude-Sessions zu arbeiten.

### Setup

Seit v2.1.53+ unterstuetzt Claude Code das native Flag `--worktree` (`-w`) zum Erstellen und Arbeiten in isolierten Worktrees:

```bash
# Natives Flag (v2.1.53+) — erstellt automatisch einen isolierten Worktree
claude --worktree "JWT-Authentifizierung implementieren"
claude -w "Authentifizierungscode ueberpruefen"

# Manuelle Methode (alle Versionen)
git worktree add ../feature-auth feature/auth
cd ../feature-auth && claude

git worktree add ../review-auth feature/auth
cd ../review-auth && claude
```

### Writer/Reviewer-Muster

```
Terminal 1 (Writer):
  cd ../feature-auth
  claude "JWT-Authentifizierung implementieren"

Terminal 2 (Reviewer):
  cd ../review-auth
  claude "Authentifizierungscode ueberpruefen"
  # Frischer Kontext, kein Autoren-Bias
```

### Bereinigung

```bash
git worktree remove ../feature-auth
git worktree remove ../review-auth
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
- [ ] Sauberer Kontext (keine Rueckstaende vorheriger Aufgaben)

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

## Compaction-Hinweise in CLAUDE.md

### Prinzip

> **Claude mitteilen, was bei einer Kompaktierung erhalten bleiben soll.**

Kompaktierungsanweisungen in CLAUDE.md hinzufuegen, um die Zusammenfassung bei automatischer Kompaktierung zu steuern:

```markdown
# In CLAUDE.md:
Bei der Kompaktierung immer erhalten:
- Die Liste der geaenderten Dateien
- Test-Befehle
- Architekturentscheidungen
```

### Nuetzliche Umgebungsvariablen

| Variable | Beschreibung |
|----------|-------------|
| `CLAUDE_CODE_SUBAGENT_MODEL` | Modell fuer Sub-Agents (z.B. `sonnet` zur Kostenoptimierung) |
| `CLAUDE_CODE_DISABLE_AUTO_MEMORY` | Auf `1` setzen, um automatischen Speicher zu deaktivieren |

---

## CLAUDE.local.md fuer persoenliche Einstellungen

### Prinzip

Eine `CLAUDE.local.md`-Datei im Projektstammverzeichnis erstellen (gitignored) fuer persoenliche Einstellungen, die nicht mit dem Team geteilt werden sollen.

```
projekt/
  .claude/CLAUDE.md      <- Geteilt (git)
  CLAUDE.local.md        <- Persoenlich (gitignore)
```

### Typischer Inhalt

- Persoenliche Stileinstellungen
- Lokale Pfade
- Bevorzugte persoenliche Tools

### Konfiguration

In `.gitignore` hinzufuegen:
```
CLAUDE.local.md
```

---

## Kontext-Anti-Patterns

| Anti-Pattern | Beschreibung | Loesung |
|-------------|-------------|---------|
| **Kitchen-sink Session** | Alles in einer Session erledigen | `/clear` zwischen Aufgaben, Sub-Agents |
| **Ueberladene CLAUDE.md** | > 200 Zeilen verduennt die Aufmerksamkeit | In `.claude/rules/` modularisieren |
| **Ueberkorrektur** | Aufeinanderfolgende Korrekturen verschmutzen den Kontext | Nach 2 Fehlschlaegen `/clear` und neu formulieren |
| **Trust-then-verify-Luecke** | Implementieren ohne zu pruefen | TDD-Schleifen, Tests vor Code |
| **Endlose Erkundung** | Zu viele Dateien ohne Ziel lesen | Umfang vor dem Erkunden definieren |

---

## CLAUDE.md Best Practices fuer die Erstellung

### Zeiger statt Kopien bevorzugen

Keinen Code in CLAUDE.md kopieren — er veraltet. `@Pfad`-Syntax verwenden, um Dateien zu referenzieren:

```markdown
# In CLAUDE.md:
Siehe @.claude/references/symfony/CLAUDE.md fuer Symfony-Konventionen.
Siehe @docs/API.md fuer API-Dokumentation.
```

### Betonung fuer kritische Regeln

`IMPORTANT`, `SIE MUESSEN`, `NIEMALS` fuer nicht verhandelbare Einschraenkungen verwenden:

```markdown
IMPORTANT: Bestehende Migrationen niemals aendern.
SIE MUESSEN Tests vor jedem Commit ausfuehren.
NIEMALS Secrets im Quellcode.
```

### CLAUDE.md Dateihierarchie

| Datei | Geltungsbereich | Verwendung |
|-------|----------------|------------|
| `~/.claude/CLAUDE.md` | Global (alle Projekte) | Universelle persoenliche Einstellungen |
| `.claude/CLAUDE.md` oder `./CLAUDE.md` | Projekt (git) | Team-Konventionen |
| `CLAUDE.local.md` | Projekt (gitignore) | Persoenliche Projekteinstellungen |

### Regelmaessige Wartung

- CLAUDE.md jedes Quartal ueberpruefen
- Fuer jede Zeile fragen: "Wenn ich diese Zeile entferne, wird Claude Fehler machen?"
- Falls nein, die Zeile entfernen
- CLAUDE.md wie Produktionscode behandeln

---

## Performance-Optimierung

### Native CLI statt MCPs

Native CLI-Tools (Glob, Grep, Read, Edit) gegenueber MCP-Aequivalenten bevorzugen. MCP-Server fuegen bei jedem Turn persistente Tool-Definitionen hinzu und verbrauchen dauerhaft Kontext.

| Ansatz | Kontextkosten |
|--------|--------------|
| Natives Tool (Glob, Grep) | 0 zusaetzliche Tokens |
| MCP-Server | ~500-2000 Tokens/Tool/Turn |
| Externes CLI (gh, aws) | Einmalig, via Bash |

### MCP Tool Search (v2.1.80+)

`ToolSearch` ermoeglicht Lazy Loading von MCP-Tools und reduziert den Kontextverbrauch um **95%**:

| Ansatz | Kontextkosten |
|--------|--------------|
| Klassisches MCP (alle Tools geladen) | ~500-2000 Tokens/Tool/Turn |
| MCP mit Tool Search (Lazy Loading) | ~50 Tokens insgesamt |

`ToolSearch` mit `query: "select:tool_name"` verwenden, um ein Tool bei Bedarf zu laden.

### Flag --bare (v2.1.81+)

Fuer geskriptete Aufrufe mit `-p` `--bare` verwenden, um Hooks, LSP und Plugin-Synchronisation zu ueberspringen:

```bash
claude --bare -p "Diese Datei analysieren" < input.txt
```

Signifikante Reduzierung der Startzeit fuer Automatisierung.

### Monitor Tool (v2.1.98+)

Das `Monitor`-Tool ermoeglicht das Streamen von Ereignissen eines Hintergrundprozesses. Jede stdout-Zeile ist eine Benachrichtigung. Statt `sleep` + Poll verwenden, um auf das Ende eines Prozesses zu warten.

### Modellwechsel waehrend der Session

`/model` verwenden, um das Modell je nach Aufgabenkomplexitaet zu wechseln:

| Befehl | Modell | Verwendung |
|--------|--------|------------|
| `/model haiku` | Haiku 4.5 | Einfache Aufgaben, Klassifikation |
| `/model sonnet` | Sonnet 4.6 | Standardaufgaben, Implementierung |
| `/model opus` | Opus 4.6 | Komplexes Reasoning, Architektur |

### Ausgabefilterung via Hooks

PostToolUse-Hooks verwenden, um ausfuehrliche Ausgaben zu filtern, bevor Claude sie verarbeitet:

```json
{
  "hooks": {
    "PostToolUse": [{
      "matcher": "Bash",
      "command": "echo '$TOOL_OUTPUT' | grep -A 5 -E '(FAIL|ERROR|WARN)' || echo 'All clear'"
    }]
  }
}
```

Potenzielle Reduzierung: 90%+ fuer ausfuehrliche Logs.

### Code Intelligence Plugins

Fuer typisierte Sprachen ersetzt ein einzelner `go-to-definition`-Aufruf mehrere grep + Datei-Lesevorgaenge:

- PHP: `php-lsp` (Intelephense)
- TypeScript: `typescript-lsp` (vtsls)
- Python: `pyright-lsp`
- Dart: `dart-analyzer`
- C#: `csharp-lsp`

---

## Kommunikationsmuster

### Interview-Muster

Fuer komplexe Features Claude bitten, Sie vor dem Kodieren zu interviewen:

```
"Ich moechte [Beschreibung] implementieren. Interviewe mich ausfuehrlich.
Stelle Fragen zur technischen Implementierung, Grenzfaellen,
Einschraenkungen und Kompromissen. Fahre fort, bis du ein vollstaendiges
Bild hast, dann schreibe die Spezifikation in SPEC.md."
```

Ergebnis: vollstaendige Spezifikation vor der Implementierung, sauberer Kontext.

### CIF-Struktur (Context, Intent, Format)

Prompts strukturieren, um die Praezision zu maximieren:

| Element | Beschreibung | Beispiel |
|---------|-------------|---------|
| **Context** | Aktuelle Situation | "Im Auth-Modul laeuft der JWT-Token nach 15min ab" |
| **Intent** | Praezises Ziel | "Refresh-Token mit Rotation hinzufuegen" |
| **Format** | Erwartetes Ausgabeformat | "Service + Unit-Tests generieren" |

### Writer/Reviewer-Muster

Zwei Sessions fuer bessere Qualitaet verwenden (siehe auch [Parallele Worktrees](#parallele-worktrees)):

- **Session A (Writer):** Implementiert das Feature
- **Session B (Reviewer):** Ueberprueoft mit frischem Kontext (kein Autoren-Bias)
- **Session A:** Integriert das Feedback

---

## Managed Settings (v2.1.83+)

### managed-settings.d/ Verzeichnis

Das `managed-settings.d/`-Verzeichnis ermoeglicht modulare Konfiguration durch alphabetische Zusammenfuehrung:

```
.claude/
  managed-settings.d/
    00-base.json          <- Basiskonfiguration
    10-security.json      <- Sicherheitsregeln
    20-team.json          <- Team-Einstellungen
```

Dateien werden in alphabetischer Reihenfolge zusammengefuehrt, sodass Teams Konfigurationen ohne Konflikte ueberlagern koennen.

---

## Neue Befehle (v2.1.105+)

| Befehl | Beschreibung | Verwendung |
|--------|--------------|------------|
| `/btw` | Schnelle Fragen ohne Kontextwechsel | Lookups, Syntax, Klarstellungen |
| `/hooks` | Interaktive Hook-Verwaltung | Aktivieren/Deaktivieren, Testen, Debuggen |
| `/reload-plugins` | Manuelles Plugin-Neuladen | Nach Plugin-Updates |
| `/proactive` | Alias fuer `/loop` | Proaktives wiederkehrendes Monitoring |

---

## Zusaetzliche Umgebungsvariablen (v2.1.105+)

| Variable | Beschreibung |
|----------|--------------|
| `CLAUDE_CODE_ADDITIONAL_DIRECTORIES_CLAUDE_MD=1` | CLAUDE.md aus `--add-dir` laden |
| `MAX_THINKING_TOKENS=8000` | Denktoken-Limit |
| `SLASH_COMMAND_TOOL_CHAR_BUDGET` | Zeichenbudget fuer Slash-Befehle |
| `CLAUDE_CODE_USE_POWERSHELL_TOOL=1` | PowerShell statt Bash (Windows, v2.1.84+) |
| `OTEL_LOG_USER_PROMPTS` | Prompts in Traces loggen (Beta) |
| `OTEL_LOG_TOOL_DETAILS` | Tool-Details loggen (Beta) |
| `OTEL_LOG_TOOL_CONTENT` | Tool-Inhalt loggen (Beta, ausfuehrlich) |

---

## Erweiterte Skills (v2.1.105+)

| Frontmatter | Beschreibung |
|-------------|--------------|
| `context: fork` | Ausfuehrung in isoliertem Kontext (keine Verschmutzung) |
| `disable-model-invocation: true` | Automatische Aufrufung durch Claude verhindern |
| `claudeMdExcludes` (Setting) | Bestimmte CLAUDE.md-Dateien in Monorepos ausschliessen |

**Auto-Kompaktierung und Skills:** Nach der Kompaktierung werden Skills automatisch neu geladen (5K Tokens/Skill, 25K gesamt max).

---

## Drittanbieter-Tools des Ökosystems (Tokens & Kontext)

Ergänzend zu RTK und nativen Hooks bietet das Claude-Code-Ökosystem Tools, die nativ nicht abgedeckte Aspekte adressieren. Keines ist in Claude Craft eingebettet – sie werden dokumentiert und empfohlen.

| Tool | Lizenz | Aspekt | Empf. |
|------|--------|--------|-------|
| **caveman** | MIT | Komprimierung der Antworten (Output) ~65 % | ✅ Integrieren |
| **code-review-graph** | MIT | AST-Graph, Blast-Radius-Lesen (−38× bis −528×) | ✅ Integrieren |
| **token-savior** | MIT | Symbolindex + Bash-Komprimierung (−80 %) | ✅ Integrieren |
| **claude-token-efficient** | MIT | CLAUDE.md-Regeln gegen Geschwätzigkeit (~63 % Output) | ✅ Integrieren |
| **context-mode** | ELv2 | Output-Sandbox, Kontinuität nach Kompaktierung | 🔶 Referenzieren (Lizenz) |
| **claude-context** | MIT | Semantische Suche (Vektor-DB erforderlich) | 🔶 Referenzieren (Infra) |

> Vollständiger Katalog, Lizenzen und Aktivierungsrezepte: `@docs/ECOSYSTEM.md`. Jedes Drittanbieter-Tool vor der Installation prüfen und auf eine Version pinnen (Regel 11).

---

## Ressourcen

- **Anthropic Best Practices:** [code.claude.com](https://code.claude.com/docs/en/overview)
- **Boris Cherny Workflow:** Parallele Worktrees + Verifikationsschleifen
- **Claude Code Kontextverwaltung:** Context Compaction, `/clear`, Sub-Agents
- **`/init`:** Generiert automatisch eine CLAUDE.md aus der Projektanalyse
- **CLAUDE.md Authoring:** [Builder.io Guide](https://www.builder.io/blog/claude-md-guide), [HumanLayer Blog](https://www.humanlayer.dev/blog/writing-a-good-claude-md)
- **Cost Optimization:** [Anthropic Costs Docs](https://code.claude.com/docs/en/costs)

---

**Letzte Aktualisierung:** 2026-04
**Version:** 1.2.0
**Autor:** The Bearded CTO
