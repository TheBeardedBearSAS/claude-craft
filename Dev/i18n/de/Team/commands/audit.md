---
description: Full-Audit-Team - Paralleles Multi-Technologie-Audit mit Agent Teams
argument-hint: [--techs=auto|tech1,tech2] [--max-workers=4]
---

# Full-Audit-Team - Paralleles Multi-Technologie-Audit

Ein paralleles Full-Audit über mehrere Technologie-Stacks orchestrieren, mit Claude Code Agent Teams (v2.1.32+). Startet einen Lead-Agent (opus) plus N Stack-Auditor-Worker (haiku), einen pro erkanntem Technologie-Stack, bis zu einem konfigurierbaren Maximum.

## Argumente

$ARGUMENTS

- `--techs=auto`: Technologien automatisch erkennen (Standard). Oder kommagetrennt angeben: `--techs=symfony,react`
- `--max-workers=4`: Maximale parallele Auditor-Worker (Standard: 4, max: 4)
- `--output-dir=<path>`: Benutzerdefiniertes Ausgabeverzeichnis für Audit-Ergebnisse
- `--max-cost=<dollars>`: Maximales Budget in Dollar. Wenn die geschaetzten Parallelkosten diesen Schwellenwert ueberschreiten, wird die Ausfuehrung mit einer OVER BUDGET Meldung blockiert
- `--dry-run`: Team-Zusammensetzung und geschätzte Kosten anzeigen, ohne auszuführen
- `--skip-aggregation`: Ergebnisse pro Stack ohne Zusammenführung ausgeben
- `--sequential`: Audits sequenziell statt parallel ausführen (kein Agent-Teams-Overhead). Nützlich für Einzeltechnologie-Projekte oder wenn Agent Teams nicht verfügbar ist.

## Voraussetzungen

- Claude Code v2.1.32+ mit Agent-Teams-Unterstützung
- `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1` Umgebungsvariable gesetzt
- Projekt mit 2+ erkannten Technologie-Stacks (Einzelstack-Projekte sollten das `--sequential`-Flag verwenden)
- `Tools/AgentTeams/lib/compatibility-check.sh` verfügbar
- `Tools/AgentTeams/lib/result-aggregator.sh` verfügbar
- `Tools/AgentTeams/lib/cost-estimator.sh` verfügbar

> ℹ️ Diese Skripte werden automatisch von claude-craft installiert (`make install-agentteams` oder über den Installer). Fehlen sie, läuft der Befehl im **eingeschränkten Modus** weiter: manuelle Kostenschätzung und `--ralph-mode` nicht verfügbar (nicht blockierend).

## Plan-Modus

> Der Plan-Modus wird automatisch aktiviert, wenn der Umfang mehrere Module umfasst oder eine modulübergreifende Untersuchung erfordert.

## Garde-Fou Fast Mode (Confirmation Bloquante)

**OBLIGATOIRE** : Vor dem Start des Teams MUSS der Audit-Leader:

1. Erkennen, ob der Fast Mode aktiv ist (Lightning-Bolt-Indikator im Terminal)
2. Wenn Fast Mode aktiv:
   - Vergleichs-Dashboard Standard vs. Fast via `cost-estimator.sh --fast-mode` anzeigen
   - **Blockierende Warnung** mit verglichenen Kosten anzeigen:
     ```
     ⚠️  FAST MODE ERKANNT — Opus-Kosten 6x hoeher!

     | Modus     | Input ($/M) | Output ($/M) | Geschaetzte Kosten dieses Audits |
     |-----------|-------------|--------------|----------------------------------|
     | Standard  | $5.00       | $25.00       | ~$X.XX                           |
     | Fast      | $30.00      | $150.00      | ~$Y.YY                           |

     Moechten Sie im Fast Mode fortfahren? (ja/nein)
     Empfehlung: Tippen Sie /fast, um vor dem Fortfahren zu deaktivieren.
     ```
   - **Warten auf explizite Bestaetigung** des Benutzers vor dem Fortfahren
   - Wenn der Benutzer ablehnt, abbrechen mit Nachricht, die `/fast` zum Deaktivieren vorschlaegt

## Wann verwenden (vs. sequenzielles Audit)

| Bedingung | Team-Audit verwenden | `--sequential`-Flag verwenden |
|-----------|---------------------|-------------------------------|
| 1 Technologie-Stack | Nein | Ja |
| 2+ Technologie-Stacks | Ja | Ebenfalls möglich (einfacher, günstiger) |
| Zeitkritisch | Ja (2-3x Beschleunigung) | Nein |
| Budgetbeschränkt | Nein (+20-35% Token-Overhead) | Ja |

**Rentabilitätsschwelle**: Parallelisierungsvorteile zeigen sich ab 2+ Stacks. Bei einem einzelnen Stack übersteigt der Koordinationsaufwand die Zeitersparnis.

## Prozess

### Schritt 1: Technologieerkennung

```
Audit-Leader (opus)
  |
  v
Projekt-Root nach Technologiemarkern scannen:
  composer.json + symfony/*      -> Symfony
  pubspec.yaml + flutter:        -> Flutter
  pyproject.toml / requirements  -> Python
  package.json + react           -> React
  package.json + react-native    -> React Native
  package.json + @angular/core   -> Angular
  package.json + vue             -> Vue.js
  artisan + laravel/*            -> Laravel
  *.csproj + dotnet              -> C#/.NET
  composer.json (no symfony)     -> PHP
```

Bei `--techs=auto` alle erkennen. Bei expliziter Angabe die angegebenen Stacks validieren.

**Entscheidungsgate**: Wenn nur 1 Technologie erkannt wird, auf sequenziellen Modus via `--sequential` zurückfallen (kein Team-Overhead nötig).

### Schritt 2: Kompatibilitätsprüfung

Vor dem Starten der Worker jeden Auditor-Agent gegen Rollenanforderungen validieren:

```bash
# Für jeden erkannten Stack den Reviewer-Agent auf erforderliche Tools prüfen
Tools/AgentTeams/lib/compatibility-check.sh \
  --agent Dev/i18n/en/<Tech>/agents/<tech>-reviewer.md \
  --require-tools Read,Glob,Grep,Bash \
  --require-model haiku
```

Wenn ein Agent die Kompatibilitätsprüfung nicht besteht, eine Warnung protokollieren und diesen Stack von der parallelen Ausführung ausschließen (Leader übernimmt sequenziell).

### Schritt 3: Kostenschätzung

Vor dem Starten des Teams die Token-Kosten schätzen:

```bash
Tools/AgentTeams/lib/cost-estimator.sh \
  --team-size <N+1> \
  --lead-model opus \
  --worker-model haiku \
  --task-type audit \
  --stacks <detected_count>
```

Geschätzte Kosten dem Benutzer anzeigen. Im `--dry-run`-Modus hier stoppen.

**Budgetgarantie**: Wenn `--max-cost` angegeben ist, pruefen dass `PAR_COST <= max_cost`. Wenn die geschaetzten Kosten das Budget ueberschreiten:
- `OVER BUDGET: geschaetzte Kosten $X.XX > Budget $Y.YY` anzeigen
- Ausfuehrung abbrechen (Worker NICHT starten)
- Vorschlagen, die Anzahl der Stacks zu reduzieren oder `--sequential` zu verwenden

### Schritt 4: Team starten (Fan-Out)

```
Audit-Leader (opus) — koordiniert über TaskCreate/SendMessage
  |
  +-- [Parallele Worker - max 4] -----------+
  |   stack-auditor-1 (haiku): Symfony       |
  |   stack-auditor-2 (haiku): React         |
  |   stack-auditor-3 (haiku): Python        |
  |   stack-auditor-4 (haiku): Angular       |
  +------------------------------------------+
```

**Team-Erstellungsmuster:**

1. Leader erstellt isolierte Ausgabeverzeichnisse pro Worker (eines pro Stack)
2. Leader erstellt Aufgaben via `TaskCreate` für jedes Stack-Audit:
   - Aufgabenbetreff: `Audit <TechName> stack`
   - Aufgabenbeschreibung: enthält check-architecture, check-code-quality, check-testing, check-security, check-compliance Anweisungen
   - Jede Aufgabe gibt ihren isolierten Ausgabepfad an
3. Worker beanspruchen Aufgaben via `TaskUpdate` (Status: in_progress)
4. Worker schreiben Ergebnisse nur in ihr isoliertes Verzeichnis

**Lean Context pro Worker (A4)**: Jeder Worker erhaelt nur die technologische Referenz seines Stacks. Laden Sie NICHT den Kontext aller Technologien.
- Symfony Worker → nur `@.claude/references/symfony/CLAUDE.md`
- React Worker → nur `@.claude/references/react/`
- Python Worker → nur `@.claude/references/python/`
- etc.

**Strukturiertes Spawn-Template (TaskCreate)**: Der Leader MUSS in jedem `TaskCreate` einfuegen:

```
Subject: "Audit <TechName> stack"
Description:
  Projekt: <projektname>
  Technologie: <tech-name>
  Docker-Service: <docker-service-name>
  Root-Verzeichnis: <tech-root-directory>
  Referenz: @.claude/references/<tech>/CLAUDE.md
  Checks: [architecture, code-quality, testing, security]
  Ausgabeformat: result.json in <output-dir>/<tech>/
  Output-Schema:
    { "tech": "<tech>", "score": <0-100>,
      "architecture": { "score": <0-25>, "findings": [...] },
      "code_quality": { "score": <0-25>, "findings": [...] },
      "testing": { "score": <0-25>, "findings": [...] },
      "security": { "score": <0-25>, "findings": [...] } }
activeForm: "Audit <TechName>"
```

**Worker-Anweisungen** (pro Stack):

Jeder Worker führt die 4 Audit-Kategorien sequenziell innerhalb seines Stacks aus:

| Kategorie | Punkte | Was zu prüfen ist |
|-----------|--------|-------------------|
| Architektur (25 Pkt.) | Schichtentrennung, Abhängigkeitsrichtung, Ordnerkonventionen, keine Framework-Kopplung |
| Code-Qualität (25 Pkt.) | Namensstandards, Linting, Typ-Hinweise, Dokumentation, Komplexität < 10 |
| Testing (25 Pkt.) | Abdeckung >= 80%, Unit-Tests, Integrationstests, E2E-Tests, Testpyramide |
| Sicherheit (25 Pkt.) | Keine Geheimnisse, Eingabevalidierung, OWASP, Verschlüsselung, Dependency-CVEs |

Worker führen Docker-basierte Diagnose-Befehle pro Stack aus:

```bash
# Symfony
docker compose exec php php bin/console lint:container
docker compose exec php vendor/bin/phpstan analyse
docker compose exec php vendor/bin/phpunit --coverage-text
docker compose exec php composer audit

# React
docker compose exec node npm run lint
docker compose exec node npm run test -- --coverage
docker compose exec node npm audit

# Python
docker compose exec app ruff check .
docker compose exec app mypy .
docker compose exec app pytest --cov
docker compose exec app pip-audit

# Flutter
docker run --rm -v $(pwd):/app -w /app dart dart analyze
docker run --rm -v $(pwd):/app -w /app dart flutter test --coverage
```

Jeder Worker schreibt `result.json` in sein isoliertes Ausgabeverzeichnis:

```json
{
  "tech": "symfony",
  "score": 82,
  "architecture": { "score": 22, "findings": [...] },
  "code_quality": { "score": 20, "findings": [...] },
  "testing": { "score": 18, "findings": [...] },
  "security": { "score": 22, "findings": [...] }
}
```

**Completion-Nachrichten-Verbositaet (B4)**: Worker MUESSEN ihre Completion-Nachrichten auf < 50 Token begrenzen. Details in `result.json` schreiben, nicht in die Nachricht. Format: `DONE: <tech> <score>/100 | <findings_count> findings`

### Schritt 5: Synchronisationsbarriere

Leader wartet, bis alle Worker-Aufgaben den Status `completed` erreicht haben via `TaskList`-Polling.

**Polling-Kadenz (B5)**: `TaskList` alle 30 Sekunden. Nach 3 aufeinanderfolgenden Polls ohne Statusaenderung, auf 60 Sekunden reduzieren. Verwenden Sie `TeammateIdle`/`TaskCompleted` Hooks (v2.1.33+) fuer reaktivere Benachrichtigung, falls verfuegbar.

Wenn ein Worker sein Timeout (5 Minuten pro Stack) ueberschreitet, markiert der Leader ihn als fehlgeschlagen und faehrt mit Teilergebnissen fort.

**Leader-Kontextwiederherstellung (A6)**: Um den Context-Compaction-Bug (#23620) abzumildern, MUSS der Leader `TaskList` alle 5 Worker-Completions neu lesen, um sein Bewusstsein fuer den Team-Status aufzufrischen. Wenn eine laengere Ruhephase (>3 Min ohne Update) erkannt wird, ein vollstaendiges Re-Read von `TaskList` erzwingen.

### Schritt 6: Ergebnis-Aggregation

Leader führt den Ergebnis-Aggregator aus:

```bash
Tools/AgentTeams/lib/result-aggregator.sh \
  --input-dir <isolated-output-root> \
  --output-file audit-report.json
```

Der Aggregator:
- Sammelt alle `result.json`-Dateien aus isolierten Verzeichnissen
- Dedupliziert Befunde (gleiche Datei + gleiche Meldung = Duplikat)
- Löst Bewertungskonflikte über gewichteten Durchschnitt
- Erzeugt einen vereinheitlichten Bericht

### Schritt 7: Berichtserstellung

Leader erstellt den formatierten Multi-Technologie-Audit-Bericht:

```
================================================================
MULTI-TECHNOLOGY AUDIT (Agent Teams) - Global Score: XX/100
================================================================

Detected technologies: [list]
Team size: 1 leader + N workers
Execution mode: Parallel
Date: YYYY-MM-DD

----------------------------------------------------------------
SYMFONY - Score: XX/100
----------------------------------------------------------------

Architecture (XX/25)
  [PASS] Clean Architecture respected
  [PASS] CQRS implemented correctly
  [WARN] 2 services directly access Repository

Code Quality (XX/25)
  [PASS] PHPStan level 8 - 0 errors
  [WARN] 5 methods > 20 lines

Testing (XX/25)
  [PASS] Coverage: 85%
  [WARN] No Panther E2E tests

Security (XX/25)
  [PASS] No secrets in code
  [WARN] Dependency with minor CVE

----------------------------------------------------------------
REACT - Score: XX/100
----------------------------------------------------------------

[Same structure per technology]

================================================================
GLOBAL SUMMARY
================================================================

| Technology | Architecture | Code | Tests | Security | Total |
|------------|-------------|------|-------|----------|-------|
| Symfony    | XX/25       | XX/25| XX/25 | XX/25    | XX/100|
| React      | XX/25       | XX/25| XX/25 | XX/25    | XX/100|
| AVERAGE    | XX/25       | XX/25| XX/25 | XX/25    | XX/100|

================================================================
TOP 5 PRIORITY ACTIONS
================================================================

1. [CRITICAL] Action description
   -> Impact: +X points | Effort: Low/Medium/High

2. [HIGH] Action description
   -> Impact: +X points | Effort: Low/Medium/High

================================================================
EXECUTION METRICS
================================================================

| Metric | Value |
|--------|-------|
| Total time | Xs (vs ~Ys sequential) |
| Speedup | ~X.Xx |
| Total tokens | ~XK |
| Token overhead vs sequential | +XX% |
| Workers spawned | N |
| Workers completed | N |
| Workers failed | 0 |
```

### Schritt 8: Aufräumen

Leader sendet `shutdown_request` an alle Worker und bereinigt isolierte Ausgabeverzeichnisse (es sei denn, `--keep-artifacts` ist angegeben).

## Bewertungsregeln

Bewertungsregeln:

| Verstoß | Punktabzug |
|---------|-----------|
| Architekturmuster verletzt | -5 |
| Framework-/Domänen-Kopplung | -3 |
| Kritischer Linting-Fehler | -2 |
| Linting-Warnung | -1 |
| Methode > 30 Zeilen | -1 |
| Abdeckung < 80% | -5 |
| Keine Domain-Unit-Tests | -5 |
| Geheimnis im Code | -10 |
| Kritische CVE-Schwachstelle | -10 |
| Hohe CVE-Schwachstelle | -5 |

## Leistungserwartungen

| Stacks | Sequenzielle Schätzung | Team-Schätzung | Beschleunigung | Token-Overhead |
|--------|----------------------|---------------:|----------------|----------------|
| 2 | ~4 Min. | ~2,5 Min. | ~1,6x | +20% |
| 3 | ~6 Min. | ~3 Min. | ~2x | +25% |
| 4 | ~8 Min. | ~3,5 Min. | ~2,3x | +30% |
| 5+ | ~10+ Min. | ~4 Min. | ~2,5x | +35% |

**Hinweis**: Dies sind realistische Schätzungen unter Berücksichtigung des Koordinationsaufwands (Agent-Start ~5-10s, Aufgabenzuweisung, Ergebnis-Aggregation). Erwarten Sie keine lineare Beschleunigung.

## Fehlerbehandlung

| Fehler | Wiederherstellung |
|--------|-------------------|
| Worker-Timeout (>5 Min.) | Leader markiert als fehlgeschlagen, fährt mit Teilergebnissen fort |
| Worker-Absturz | Leader protokolliert Fehler, schließt Stack vom Bericht aus |
| Docker nicht verfügbar | Worker meldet Fehler, Leader fällt auf reine Quellcodeanalyse zurück |
| Keine Technologien erkannt | Abbruch mit klarer Meldung |
| Nur eine Technologie | Rückfall auf `--sequential`-Modus |
| Kompatibilitätsprüfung fehlgeschlagen | Stack von paralleler Ausführung ausschließen, Leader bearbeitet sequenziell |

## Einschränkungen

- Maximal 4 parallele Worker (Koordinationsaufwand dominiert darüber hinaus)
- Token-Kosten sind ~20-35% höher als sequenziell aufgrund von Kontextduplizierung pro Worker
- Erfordert Agent Teams Research Preview (API kann sich ändern)
- Jeder Worker lädt den Projektkontext unabhängig (~10-20K Token Overhead pro Worker)
