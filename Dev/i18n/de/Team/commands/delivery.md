---
description: Delivery-Team - Vollständiger Sprint-Lebenszyklus (Schreiben + Implementierung) mit Agent Teams
argument-hint: <sprint-name|prd-path> [--phase=all|writing|implementation] [--max-workers=3]
---

# Delivery-Team - Vollständiger Sprint-Lebenszyklus (Schreiben + Implementierung)

Den vollständigen Sprint-Zyklus mit Claude Code Agent Teams (v2.1.32+) orchestrieren. Phase 1 erstellt EPICs, User Stories (INVEST+3C+Gherkin) und Aufgaben mit Kreuzvalidierung. Phase 2 implementiert sie parallel unter Verwendung der Dateidomänen-Zuordnung aus Phase 1. Derselbe Delivery-Lead (opus) orchestriert beide Phasen und bewahrt den vollständigen Kontext über den Übergang hinweg.

## Argumente

$ARGUMENTS

- `<sprint-name|prd-path>`: Sprint-Name/ID oder Pfad zum PRD-Dokument
- `--phase=all`: Auszuführende Phase (Standard: `all`). Optionen: `all`, `writing`, `implementation`
- `--max-workers=3`: Maximale parallele Worker pro Phase (Standard: 3, max: 3)
- `--overnight`: Im Nachtmodus ausführen (begrenzt, stoppt um 6 Uhr)
- `--supervised`: Vor jeder Story für menschliche Bestätigung pausieren
- `--max-stories=10`: Maximale Anzahl zu bearbeitender Stories (Standard: 10)
- `--timeout=16`: Maximale Laufzeit in Stunden (Standard: 16)
- `--dry-run`: Team-Zusammensetzung, Kostenschätzung und Story-Zuweisungen anzeigen, ohne auszuführen
- `--quality-threshold=6`: Minimaler INVEST-Score für Phase 1 (Standard: 6/6)
- `--max-rewrites=2`: Maximale Überarbeitungsschleifen pro Artefakt in Phase 1 (Standard: 2)
- `--max-cost=<dollars>`: Maximales Budget in Dollar. Wenn die geschaetzten Parallelkosten diesen Schwellenwert ueberschreiten, wird die Ausfuehrung mit einer OVER BUDGET Meldung blockiert

## Voraussetzungen

- Claude Code v2.1.32+ mit Agent-Teams-Unterstützung
- `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1` Umgebungsvariable gesetzt
- PRD oder Tech Spec verfügbar (für Phase 1) oder BMAD-Sprint-Backlog mit `ready-for-dev`-Stories (nur für Phase 2)
- Sprint-Metadaten in `.bmad/sprint-status.yaml`
- `Tools/AgentTeams/lib/compatibility-check.sh` verfügbar
- `Tools/AgentTeams/lib/cost-estimator.sh` verfügbar
- `Tools/AgentTeams/lib/result-aggregator.sh` verfügbar

## Plan-Modus

> Der Plan-Modus wird automatisch aktiviert, wenn der Umfang mehrere Module umfasst oder eine modulübergreifende Untersuchung erfordert.

## Garde-Fou Fast Mode (Blockierende Bestaetigung)

**OBLIGATORISCH**: Vor dem Start des Teams MUSS der Delivery Lead:

1. Erkennen, ob der Fast Mode aktiv ist (Lightning-Bolt-Indikator im Terminal)
2. Wenn Fast Mode aktiv:
   - Vergleichs-Dashboard Standard vs. Fast via `cost-estimator.sh --fast-mode` anzeigen
   - **Blockierende Warnung** mit verglichenen Kosten anzeigen:
     ```
     ⚠️  FAST MODE ERKANNT — Opus-Kosten 6x hoeher!

     | Modus     | Input ($/M) | Output ($/M) | Geschaetzte Kosten dieser Lieferung |
     |-----------|-------------|--------------|-------------------------------------|
     | Standard  | $5.00       | $25.00       | ~$X.XX                              |
     | Fast      | $30.00      | $150.00      | ~$Y.YY                              |

     Moechten Sie im Fast Mode fortfahren? (ja/nein)
     Empfehlung: Tippen Sie /fast, um vor dem Fortfahren zu deaktivieren.
     ```
   - **Warten auf explizite Bestaetigung** des Benutzers vor dem Fortfahren
   - Wenn der Benutzer ablehnt, abbrechen mit Nachricht, die `/fast` zum Deaktivieren vorschlaegt

## Wann verwenden (vs. sequenziell oder andere Teams)

| Bedingung | Team-Delivery verwenden | Alternative |
|-----------|------------------------|-------------|
| Vollständiger Zyklus (Plan + Code), 3+ Stories | **Ja (~2,2x Beschleunigung)** | Sequenziell zu langsam |
| < 3 Stories | Nein | `@product-owner` + `/team:sprint --sequential` |
| Einzelne Story | Nein | `/common:ralph-run` |
| 5+ unabhängige Stories | **Ja (bester ROI)** | Möglich, aber sequenziell langsam |
| Nur Implementierung (Stories vorhanden) | `--phase=implementation` verwenden | `/team:sprint` |
| Nur Schreiben (kein Coding nötig) | `--phase=writing` verwenden | `@product-owner` manuell |
| Sehr budgetbeschränkt | Nein (+30-40% Token-Overhead) | Sequenzieller Workflow |
| Dateidomänen-Zuordnung benötigt | **Ja (integriert)** | Manuelle Koordination |

**Rentabilitätsschwelle**: Rentabel ab 3+ Stories zum Schreiben UND Implementieren.

## Prozess

### Phase 1: Schreiben (Qualität + Zuverlässigkeit)

#### Phase-1-Team-Zusammensetzung

```
Delivery-Lead (opus) — Orchestrierung, Validierung, gemeinsamer Kontext
  |
  +-- Writer (sonnet)    : Erstellt EPICs, US (INVEST+3C+Gherkin), Aufgaben
  +-- Reviewer (haiku)   : Validiert Qualität (INVEST 6/6, AC-Abdeckung, Testbarkeit, Slicing)
  +-- Architect (sonnet) : Validiert technische Machbarkeit + Dateidomänen-Zuordnung
```

#### Schritt 1.1: Eingabevalidierung

Der Delivery-Lead validiert die Eingabe:

1. PRD oder Tech Spec vom angegebenen Pfad lesen
2. PRD-Gate validieren (>=80%) -- bei Score unter Schwellenwert mit klarer Meldung abbrechen
3. Features, Anforderungen und Abnahmekriterien-Umfang extrahieren
4. Kosten schaetzen via `cost-estimator.sh --task-type delivery --techs <worker_count>`
5. **Budgetgarantie**: Wenn `--max-cost` angegeben ist, pruefen dass geschaetzte Kosten <= max_cost. Bei Ueberschreitung: `OVER BUDGET` anzeigen, abbrechen
6. Team via `TeamCreate` erstellen

#### Schritt 1.2: Team starten (Phase 1)

Der Lead startet 3 Phase-1-Worker via `Task`-Tool:

1. **Writer** (sonnet): Angewiesen, EPICs und User Stories im INVEST+3C+Gherkin-Format zu erstellen
2. **Reviewer** (haiku): Angewiesen, Qualität gemäß der untenstehenden Prüftabelle zu validieren — haiku reicht fuer diese Klassifikationsaufgabe (12x billiger als sonnet im Output)
3. **Architect** (sonnet): Angewiesen, technische Machbarkeit zu validieren und Dateidomänen-Zuordnungen zu erstellen

**Lean Context pro Phase-1-Worker**: Jeder Worker erhaelt nur das PRD/Tech Spec und die technologische Referenz des Projekts. Laden Sie NICHT die Referenzen aller Technologien.

**Strukturiertes Spawn-Template Phase 1 (TaskCreate)**: Der Lead MUSS in jede Aufgabe einfuegen:
```
Subject: "Write <artefact-type>: <titel>"
Description:
  Projekt: <projektname>
  Technologie: <projekt-tech>
  PRD/Spec: <Inhalt oder Referenz>
  Erwartetes Artefakt: <EPIC|US|Task>
  Format: INVEST+3C+Gherkin fuer US
  Erfolgskriterien: INVEST 6/6, nominale ACs >= 1, alternative >= 2, Fehler >= 2
  Referenz: @.claude/references/<tech>/CLAUDE.md
activeForm: "Writing <artefact-type>"
```

#### Schritt 1.3: Artefakt-Pipeline

Die Pipeline ist sequenziell pro Artefakt, aber **Pipeline-artig** über Artefakte hinweg (mehrere Artefakte gleichzeitig in verschiedenen Phasen):

```
Writer erstellt → Reviewer validiert Qualität → Architect validiert Tech + Domänen → Lead akzeptiert/zurück
     ^                                                                                    |
     └──────────────── Überarbeitungsschleife (max 2x, konsolidiertes Feedback) ──────────┘
```

Der Lead koordiniert via `SendMessage`:
1. Weist dem Writer ein Artefakt per Aufgabe zu
2. Wenn der Writer abschließt, sendet das Artefakt an den Reviewer zur Qualitätsvalidierung
3. Wenn der Reviewer genehmigt, sendet an den Architect zur technischen Validierung + Domänen-Zuordnung
4. Wenn der Architect genehmigt, markiert der Lead das Artefakt als akzeptiert
5. Wenn Reviewer ODER Architect ablehnen, konsolidiert der Lead das Feedback und gibt es an den Writer zurück (max `--max-rewrites` Schleifen)
6. Wenn das Artefakt nach maximalen Überarbeitungen immer noch fehlschlägt, markiert der Lead es als `needs_human_review` und fährt fort

#### Reviewer-Qualitätsprüfungen

| Prüfung | Schwellenwert | Quelle |
|---------|--------------|--------|
| INVEST-Score | 6/6 | `backlog-gate.yaml` |
| Nominale AC | >= 1 | `@product-owner`-Muster |
| Alternative AC | >= 2 | `@product-owner`-Muster |
| Fehler-AC | >= 2 | `@product-owner`-Muster |
| Gherkin-Format | 100% | Gate-Validierung |
| Vertikales Slicing | Ja | `@tech-lead`-Muster |
| Story Points | 1-8 | INVEST-Kriterium "Small" |
| Expliziter Nutzen | Ja | INVEST-Kriterium "Valuable" |

**Gemeinsame Dateien-Erkennung (B2)**: Der Architect MUSS explizit gemeinsame Verzeichnisse (`**/Shared/**`, `**/Common/**`, `**/Utils/**`, `**/Helpers/**`) erkennen. Stories, die Dateien in diesen Verzeichnissen beruehren, erhalten automatisch einen `overlaps_with`-Marker und werden in derselben Welle sequenziert.

#### Architect-Dateidomänen-Zuordnung

Der Architect erstellt eine Dateidomänen-Zuordnung für jede User Story:

```yaml
US-001:
  file_domains: [src/Domain/User/, src/App/User/, tests/Unit/User/]
  overlaps_with: []
US-002:
  file_domains: [src/Domain/Order/, src/App/Order/, tests/Unit/Order/]
  overlaps_with: []
US-003:
  file_domains: [src/Domain/User/, src/App/Auth/]
  overlaps_with: [US-001]  # → sequenziert nach US-001 in Phase 2
```

Diese Zuordnung bestimmt die Parallelisierungswellen in Phase 2.

#### Schritt 1.4: Sprint-Ready-Gate

Wenn alle Artefakte verarbeitet sind, validiert der Lead das Sprint-Ready-Gate (100%):

1. Alle Stories haben INVEST 6/6 (oder sind als `needs_human_review` markiert)
2. Dateidomänen-Zuordnung ist vollständig
3. Parallelisierungswellen sind berechnet
4. Sprint-Backlog ist in `.bmad/sprint-status.yaml` geschrieben

#### Phase-1-Ausgabe

```
================================================================
DELIVERY TEAM - Phase 1: Writing Summary
================================================================

Sprint: <sprint-name>
Date: YYYY-MM-DD
Team: 1 lead + 3 writers

----------------------------------------------------------------
ARTEFACTS CREATED
----------------------------------------------------------------

| Artefact | Type | INVEST | Rewrites | Status |
|----------|------|--------|----------|--------|
| EPIC-001 | Epic | - | 0 | ACCEPTED |
| US-001 | Story | 6/6 | 0 | ACCEPTED |
| US-002 | Story | 6/6 | 1 | ACCEPTED |
| US-003 | Story | 6/6 | 0 | ACCEPTED |
| US-004 | Story | 4/6 | 2 | NEEDS_HUMAN_REVIEW |

----------------------------------------------------------------
FILE DOMAIN MAP
----------------------------------------------------------------

| Story | Domains | Overlaps |
|-------|---------|----------|
| US-001 | src/Domain/User/, src/App/User/ | - |
| US-002 | src/Domain/Order/, src/App/Order/ | - |
| US-003 | src/Domain/User/, src/App/Auth/ | US-001 |

----------------------------------------------------------------
PARALLELIZATION WAVES
----------------------------------------------------------------

Wave 1: [US-001, US-002] — independent (0 overlap)
Wave 2: [US-003]         — depends on files from US-001

----------------------------------------------------------------
QUALITY METRICS
----------------------------------------------------------------

| Metric | Value |
|--------|-------|
| Avg INVEST score | 5.5/6 |
| AC coverage (nom/alt/err) | 100% / 95% / 90% |
| Stories accepted | 3/4 |
| Stories needing review | 1/4 |
| Total rewrites | 3 |
| File domain overlaps | 1 |
```

### Phasenübergang

Bei `--phase=all` führt der Lead einen sicheren Teamübergang durch:

#### Schritt T.1: Handoff-Vertrag schreiben

Der Lead schreibt eine `phase-handoff.yaml`-Datei im Sitzungsverzeichnis, bevor Phase 1 beendet wird:

```yaml
# .bmad/phase-handoff.yaml — Interphasen-Vertrag
handoff_version: "1.0"
timestamp: "2026-02-13T10:30:00Z"
sprint: "<sprint-name>"
phase1_status: "completed"

stories_accepted:
  - id: US-001
    invest_score: 6
    file_domains: [src/Domain/User/, src/App/User/, tests/Unit/User/]
  - id: US-002
    invest_score: 6
    file_domains: [src/Domain/Order/, src/App/Order/, tests/Unit/Order/]

stories_needs_review:
  - id: US-004
    reason: "INVEST 4/6 nach 2 Überarbeitungen"

parallelization_waves:
  - wave: 1
    stories: [US-001, US-002]
    reason: "0 Dateidomänen-Überlappung"
  - wave: 2
    stories: [US-003]
    reason: "hängt von Dateien aus US-001 ab"

phase1_metrics:
  artifacts_created: 4
  rewrites_total: 3
  avg_invest_score: 5.5
  duration_minutes: 20
```

#### Schritt T.2: Phase 1 herunterfahren und Phase 2 starten

1. `shutdown_request` an Writer, Reviewer, Architect senden
2. Warten, bis alle Worker heruntergefahren sind (~30s)
3. Lead behält vollständigen Kontext aus Phase 1 via `phase-handoff.yaml`
3.5. **Kontextwiederherstellung (A6)**: `phase-handoff.yaml` neu lesen, um den Status vor Start von Phase 2 aufzufrischen. Wenn der Kontext kompaktiert wurde (Bug #23620), garantiert dieser Re-Read vollstaendiges Bewusstsein fuer Phase-1-Artefakte.
4. Mit Phase-2-Start fortfahren

#### Wiederherstellung nach Absturz

Wenn der Lead zwischen den beiden Phasen neu startet:
1. Existenz von `.bmad/phase-handoff.yaml` prüfen
2. Wenn vorhanden mit `phase1_status: completed`, direkt in Phase 2 fortfahren
3. `parallelization_waves` und `file_domains` aus dem Handoff für die Zuweisung verwenden
4. Wenn nicht vorhanden oder `phase1_status != completed`, Phase 1 neu starten

### Phase 2: Implementierung (Geschwindigkeit + Delegation)

#### Phase-2-Team-Zusammensetzung

```
Delivery-Lead (opus) — gleicher Leader, Phase-1-Kontext bewahrt
  |
  +-- dev-worker-1 (sonnet) : US-001 (TDD)
  +-- dev-worker-2 (sonnet) : US-002 (TDD)
  +-- dev-worker-3 (sonnet) : US-003 (TDD)
```

#### Vorteile gegenüber team-sprint allein

1. **Dateidomänen-Zuordnung bereits berechnet** — Zuweisung ist zuverlässig, keine heuristische Laufzeitanalyse
2. **Höhere Story-Qualität** — vollständige ACs, weniger Nacharbeit bei der Implementierung
3. **Lead mit vollem Kontext** — bessere Zuweisungsentscheidungen
4. **Vorberechnete Wellen**:
   ```
   Wave 1: [US-001, US-002] — independent (0 overlap)
   Wave 2: [US-003]         — depends on files from US-001
   ```

#### Schritt 2.1: Worker starten

Der Lead startet Entwickler-Worker (bis zu `--max-workers`) und weist Stories nach Wellen zu:

1. Wave-1-Stories werden parallel zugewiesen (eine Story pro Worker)
2. Wenn Wave 1 abgeschlossen ist, werden Wave-2-Stories zugewiesen
3. Von abgeschlossenen Stories freigewordene Worker übernehmen die nächste verfügbare Story

**Lean Context pro Phase-2-Worker**: Jeder Worker erhaelt nur die zugewiesene Story und die technologische Referenz des Projekts. Laden Sie NICHT andere Stories oder das vollstaendige PRD.

Der Lead erstellt einen `TaskCreate` pro Story:

**Strukturiertes Spawn-Template Phase 2 (TaskCreate)**:
```
Subject: "Implement US-XXX: <story title>"
Description:
  Projekt: <projektname>
  Technologie: <projekt-tech>
  Story: <vollstaendiger Story-Inhalt>
  Abnahmekriterien: <vollstaendige ACs mit Gherkin>
  Dateidomaene: <Verzeichnisse aus phase-handoff.yaml>
  Ausserhalb Grenzen: <Verzeichnisse von ANDEREN in Bearbeitung befindlichen Stories>
  TDD-Befehle: <tech-spezifische Docker-Befehle>
  Erfolgskriterien: Alle AC-Tests bestanden, Lint sauber, Abdeckung nicht reduziert
  Referenz: @.claude/references/<tech>/CLAUDE.md
activeForm: "Implementing US-XXX"
```

#### Schritt 2.2: Worker-Ausführung (pro Story)

Jeder Entwickler-Worker folgt dem TDD-Zyklus für seine zugewiesene Story:

```
1. Story und Abnahmekriterien lesen
2. RED: Fehlschlagende Tests aus Abnahmekriterien schreiben
3. GREEN: Minimalen Code implementieren, um Tests zu bestehen
4. REFACTOR: Aufräumen bei grünen Tests
5. Vollständige Test-Suite ausführen (Docker-basiert)
6. Ergebnis-Zusammenfassung schreiben
7. Aufgabe als abgeschlossen markieren
```

**Worker-TDD-Befehle** (technologiespezifisch):

```bash
# Symfony
docker compose exec php vendor/bin/phpunit
docker compose exec php vendor/bin/phpstan analyse
docker compose exec php php bin/console lint:container

# React
docker compose exec node npm run test
docker compose exec node npm run lint
docker compose exec node npm run build

# Python
docker compose exec app pytest --cov
docker compose exec app ruff check .
docker compose exec app mypy .

# Flutter
docker run --rm -v $(pwd):/app -w /app dart flutter test
docker run --rm -v $(pwd):/app -w /app dart dart analyze
```

#### Schritt 2.3: Story-Übergang

Wenn ein Worker abschließt, führt der Lead Folgendes aus:

1. Definition of Done (DoD) für die Story validieren
2. Story-Status überführen: `in-progress` -> `review`
3. Die nächste Story (unter Beachtung der Wellenreihenfolge) dem freigewordenen Worker zuweisen
4. Wiederholen, bis keine Stories mehr vorhanden sind oder Limits erreicht werden

**DoD-Validierungscheckliste**:
- [ ] Alle Abnahmekriterien-Tests bestanden
- [ ] Keine neuen Linting-Fehler eingeführt
- [ ] Code-Abdeckung nicht verringert
- [ ] Keine Geheimnisse im committed Code
- [ ] Story-Implementierung entspricht Tech Spec

#### Schritt 2.4: Fehlerwiederherstellung

Der Lead klassifiziert Fehler gemäß der Ralph-Recovery-Engine:

| Level | Typ | Aktion | Beispiele |
|-------|-----|--------|-----------|
| 0 | Vorübergehend | Auto-Retry mit Backoff | Timeout, Rate-Limit, Netzwerk |
| 1 | Behebbar | Worker Auto-Fix + Retry | Lint-Fehler, Testfehler, Deps |
| 2 | Eingeschränkt | Mit Warnung fortfahren | Docs, optionale Gates, Abdeckungsrückgang |
| 3 | Blockiert | An Menschen eskalieren | Sicherheit, Architektur, Auth |

**Polling-Kadenz (B5)**: Der Lead pollt `TaskList` alle 30 Sekunden. Nach 3 aufeinanderfolgenden Polls ohne Aenderung, auf 60 Sekunden reduzieren. Verwenden Sie `TeammateIdle`/`TaskCompleted` Hooks (v2.1.33+), falls verfuegbar.

**Nachrichten-Verbositaet (B4)**: Worker MUESSEN ihre Completion-Nachrichten auf < 50 Token begrenzen. Format: `DONE: US-XXX tests pass, +X files`. Details in die Aufgabenzusammenfassung schreiben.

**Lead-Kontextwiederherstellung (A6)**: Um den Context-Compaction-Bug (#23620) abzumildern, MUSS der Lead `TaskList` alle 5 Worker-Completions neu lesen. Zu Beginn von Phase 2 systematisch `phase-handoff.yaml` neu lesen, um vollstaendiges Bewusstsein fuer Phase-1-Artefakte zu garantieren.

**Worker-Blockade-Erkennung**: Wenn ein Worker seine Aufgabe seit 10 Minuten nicht aktualisiert hat, sendet der Lead eine Statusprüfungsnachricht. Wenn innerhalb von 2 Minuten keine Antwort erfolgt, markiert der Lead die Story als blockiert und weist sie einem anderen Worker zu oder reiht sie für menschliche Überprüfung ein.

**Dateidomänen-Konflikt zur Laufzeit erkannt**: Wenn ein Worker einen Dateikonflikt mit dem Bereich eines anderen Workers meldet, stoppt der Lead den konfligierenden Worker, wartet auf den Abschluss des ersten und weist dann sequenziell zu.

### BMAD-Gate-Integration

| Gate | Schwellenwert | Wann | Validiert durch |
|------|--------------|------|-----------------|
| PRD-Gate | >=80% | Vor Phase 1 | Lead validiert Eingabe |
| Backlog-Gate | INVEST 6/6 | Phase 1 — pro Artefakt | Reviewer |
| Sprint-Ready-Gate | 100% | Ende von Phase 1 | Lead |
| Story-DoD-Gate | 100% | Phase 2 — pro Story | Lead nach Worker |

### Letzter Schritt: Sprint-Abschluss

Wenn alle Stories bearbeitet sind:

1. Lead erstellt den vollständigen Delivery-Bericht
2. Aktualisiert `.bmad/sprint-status.yaml` über Single-Writer-Muster
3. Sendet `shutdown_request` an alle Entwickler-Worker
4. Meldet abschließende Metriken

## Ausgabe

### Vollständiger Delivery-Bericht

```
================================================================
DELIVERY TEAM - Full Report
================================================================

Sprint: <sprint-name>
Date: YYYY-MM-DD
Mode: Full Lifecycle (Writing + Implementation)
Team: 1 lead + 3 writers (Phase 1) + N dev workers (Phase 2)

================================================================
PHASE 1: WRITING SUMMARY
================================================================

| Artefact | Type | INVEST | Rewrites | Status |
|----------|------|--------|----------|--------|
| US-001 | Story | 6/6 | 0 | ACCEPTED |
| US-002 | Story | 6/6 | 1 | ACCEPTED |
| US-003 | Story | 6/6 | 0 | ACCEPTED |

Parallelization waves:
  Wave 1: [US-001, US-002]
  Wave 2: [US-003]

================================================================
PHASE 2: IMPLEMENTATION SUMMARY
================================================================

| Story | Title | Worker | Wave | Time | DoD |
|-------|-------|--------|------|------|-----|
| US-001 | Login feature | dev-1 | 1 | 12m | PASS |
| US-002 | User profile | dev-2 | 1 | 18m | PASS |
| US-003 | Dashboard | dev-1 | 2 | 15m | PASS |

----------------------------------------------------------------
STORIES BLOCKED
----------------------------------------------------------------

| Story | Title | Phase | Reason | Escalation |
|-------|-------|-------|--------|------------|
| US-004 | Payment | Writing | INVEST 4/6 after 2 rewrites | needs_human_review |

================================================================
EXECUTION METRICS
================================================================

| Metric | Value |
|--------|-------|
| Stories written | X |
| Stories implemented | Y / Z |
| Stories blocked | W |
| Phase 1 time | Xm |
| Phase 2 time | Ym |
| Total time | Zm (vs ~Wm sequential) |
| Speedup | ~X.Xx |
| Total tokens | ~XK |
| Avg INVEST score | X.X/6 |
| Workers spawned | N (Phase 1) + M (Phase 2) |
```

## Kostenanalyse

Für 1 EPIC, 5 US, ~25 Aufgaben:

| Metrik | Sequenziell | Team-Delivery | Delta |
|--------|------------|---------------|-------|
| Phase-1-Token | ~350K | ~475K | +36% |
| Phase-2-Token | ~500K | ~650K | +30% |
| Phase-1-Zeit | ~45 Min. | ~20 Min. | -56% |
| Phase-2-Zeit | ~75 Min. | ~35 Min. | -53% |
| **Gesamtzeit** | **~120 Min.** | **~55 Min.** | **~2,2x** |
| Gesamtkosten* | ~$28 | ~$17 | **-38%** |

*Kosteneinsparungen, weil Sonnet ($3/$15/M) die meiste Arbeit übernimmt vs. Opus ($15/$75/M) im sequenziellen Modus.

## Leistungserwartungen

| Worker | Stories | Sequenzielle Schätzung | Team-Schätzung | Beschleunigung | Token-Overhead |
|--------|---------|----------------------|----------------|----------------|----------------|
| 3 (Schreiben) + 2 (Impl.) | 4 | ~80 Min. | ~40 Min. | ~2,0x | +30% |
| 3 (Schreiben) + 2 (Impl.) | 6 | ~120 Min. | ~55 Min. | ~2,2x | +32% |
| 3 (Schreiben) + 3 (Impl.) | 6 | ~120 Min. | ~50 Min. | ~2,4x | +35% |
| 3 (Schreiben) + 3 (Impl.) | 9 | ~180 Min. | ~75 Min. | ~2,4x | +37% |

**Hinweis**: Die Beschleunigung hängt von der Story-Unabhängigkeit und vergleichbarer Komplexität ab. Der Phasenübergang verursacht ~30s Overhead.

## Fehlerbehandlung

| Fehler | Wiederherstellung |
|--------|-------------------|
| Artefakt nach max. Überarbeitungen ungültig | Als `needs_human_review` markieren, mit nächstem Artefakt fortfahren |
| Architect-Timeout (>5 Min./US) | Mit partieller Domänenzuordnung fortfahren, Stories als `sequential-only` markiert |
| Worker-Phase-1-Absturz | Lead weist verbleibendem Worker neu zu |
| Worker-Phase-2-Absturz | Story kehrt zu `ready-for-dev` zurück, anderer Worker übernimmt |
| Dateidomänen-Konflikt bei Implementierung erkannt | Lead stoppt konfligierenden Worker, sequenziert die Stories |
| sprint-status.yaml-Konflikt | Single-Writer-Muster (nur Lead) |
| PRD-Gate scheitert (<80%) | Abbruch mit klarer Meldung, PRD-Verbesserung empfehlen |
| Alle Worker blockiert | Lead eskaliert an Menschen |

## Einschränkungen

- Maximal 5 Agents insgesamt (1 Lead + 3 pro Phase, Übergang zwischen Phasen ~30s)
- Qualität hängt von der Qualität der PRD-/Tech-Spec-Eingabe ab
- Dateidomänen-Zuordnung ist heuristisch (gemeinsame Utilities können übersehen werden)
- +30-40% Token-Overhead vs. sequenziell
- Erfordert Agent Teams Research Preview (API kann sich ändern)
- Nicht geeignet für EPICs/US, die interaktive menschliche Entscheidungen während des Prozesses erfordern
- Phasenübergang erfordert Herunterfahren + Neustart (~30s Latenz)
