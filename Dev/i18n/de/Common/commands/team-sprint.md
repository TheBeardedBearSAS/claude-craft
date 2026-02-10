---
description: Sprint-Entwicklungsteam - Parallele Story-Implementierung mit Agent Teams
argument-hint: <sprint-name> [--max-workers=3] [--overnight] [--use-teams]
---

# Sprint-Entwicklungsteam - Parallele Story-Implementierung

Parallele Sprint-Ausführung mit Claude Code Agent Teams (v2.1.32+) orchestrieren. Startet einen Sprint-Dirigenten (opus) plus 2-3 Entwickler-Worker (sonnet), die jeweils eine unabhängige Story aus dem Backlog übernehmen. Konzipiert für die Integration mit dem bestehenden Ralph-Sprint-Flow (`/common:ralph-sprint --use-teams`).

## Argumente

$ARGUMENTS

- `<sprint-name>`: Name oder ID des zu bearbeitenden Sprints
- `--max-workers=3`: Maximale parallele Entwickler-Worker (Standard: 2, max: 3)
- `--overnight`: Im Nachtmodus ausführen (begrenzt, stoppt um 6 Uhr)
- `--supervised`: Vor jeder Story für menschliche Bestätigung pausieren
- `--max-stories=10`: Maximale Anzahl zu bearbeitender Stories (Standard: 10)
- `--timeout=12`: Maximale Laufzeit in Stunden (Standard: 12)
- `--dry-run`: Team-Zusammensetzung und Story-Zuweisungen anzeigen, ohne auszuführen
- `--use-teams`: Flag, das von ralph-sprint übergeben wird, um Agent-Teams-Modus anzuzeigen
- `--ralph-mode`: Ralph-Recovery-Engine aktivieren (Fehlerklassifizierung, Auto-Retry, Eskalationsdienst) zusammen mit Agent-Teams-Parallelisierung. Kombiniert das Beste aus beiden: parallele Story-Ausführung von team-sprint mit den Recovery-/Eskalationsfähigkeiten von ralph-sprint.

## Voraussetzungen

- Claude Code v2.1.32+ mit Agent-Teams-Unterstützung
- `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1` Umgebungsvariable gesetzt
- BMAD-Sprint-Backlog mit Stories im Status `ready-for-dev`
- Sprint-Metadaten in `.bmad/sprint-status.yaml`
- Mindestens 2 unabhängige Stories (Einzelstory-Sprints verwenden sequenzielles Ralph)
- `Tools/AgentTeams/lib/ralph-teams-adapter.sh` verfügbar
- `Tools/AgentTeams/lib/compatibility-check.sh` verfügbar
- `Tools/AgentTeams/lib/cost-estimator.sh` verfügbar

## Wann verwenden (vs. sequenzieller Sprint)

| Bedingung | Team-Sprint verwenden | Sequenzielles `/common:ralph-sprint` verwenden |
|-----------|----------------------|------------------------------------------------|
| 1 Story verbleibend | Nein | Ja |
| 2+ unabhängige Stories | Ja (~2x Beschleunigung) | Ebenfalls möglich (einfacher) |
| Stories mit gemeinsamen Dateien | Nein (Schreibkonflikte) | Ja |
| Über Nacht unbeaufsichtigt | Ja (mit `--overnight`) | Ebenfalls möglich |
| Budgetbeschränkt | Nein (+25-35% Token-Overhead) | Ja |

**Wichtig**: Stories müssen vollständig unabhängig sein (keine gemeinsamen Dateidomänen). Wenn Stories überlappende Dateien ändern, weist der Dirigent sie sequenziell demselben Worker zu.

## Prozess

### Schritt 1: Sprint-Initialisierung

Der Sprint-Dirigent lädt den Sprint-Status:

1. `.bmad/sprint-status.yaml` für Story-Liste und Status lesen
2. Stories mit Status `ready-for-dev` filtern
3. Story-Unabhängigkeit analysieren (auf Dateidomänen-Überlappung prüfen)
4. Stories in parallelisierbare Gruppen aufteilen

**Unabhängigkeitsprüfung**: Zwei Stories sind unabhängig, wenn ihre Abnahmekriterien und ihr Implementierungsumfang nicht auf dieselben Quelldateien verweisen. Der Dirigent überprüft die Beschreibung und Tech-Spec-Referenzen jeder Story, um dies festzustellen.

### Schritt 2: Story-Zuweisung

```
Sprint-Dirigent (opus) — koordiniert über TaskCreate/SendMessage
  |
  +-- [Parallele Worker - max 3] -----------+
  |   dev-worker-1 (sonnet): US-001          |
  |   dev-worker-2 (sonnet): US-002          |
  |   dev-worker-3 (sonnet): US-003          |
  +------------------------------------------+
  |
  v (Synchronisationsbarriere - alle Stories abgeschlossen)
  |
  +-- [Sequenzielles Review] ---------------+
  |   Dirigent validiert DoD jeder Story      |
  +------------------------------------------+
```

Der Dirigent erstellt einen `TaskCreate` pro Story:

- **Betreff**: `Implement US-XXX: <story title>`
- **Beschreibung**: Vollständiger Story-Inhalt, Abnahmekriterien, Tech-Spec-Referenzen, TDD-Anforderungen
- **activeForm**: `Implementing US-XXX`

### Schritt 3: Worker-Ausführung (pro Story)

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

### Schritt 4: Story-Übergang

Wenn ein Worker abschließt, führt der Dirigent Folgendes aus:

1. Definition of Done (DoD) für die Story validieren
2. Story-Status überführen: `in-progress` -> `review`
3. Die nächste `ready-for-dev`-Story dem freigewordenen Worker zuweisen
4. Wiederholen, bis keine Stories mehr vorhanden sind oder Limits erreicht werden

**DoD-Validierungscheckliste**:
- [ ] Alle Abnahmekriterien-Tests bestanden
- [ ] Keine neuen Linting-Fehler eingeführt
- [ ] Code-Abdeckung nicht verringert
- [ ] Keine Geheimnisse im committed Code
- [ ] Story-Implementierung entspricht Tech Spec

### Schritt 5: Fehlerwiederherstellung

Der Dirigent klassifiziert Fehler gemäß der Ralph-Recovery-Engine:

| Level | Typ | Aktion | Beispiele |
|-------|-----|--------|-----------|
| 0 | Vorübergehend | Auto-Retry mit Backoff | Timeout, Rate-Limit, Netzwerk |
| 1 | Behebbar | Worker Auto-Fix + Retry | Lint-Fehler, Testfehler, Deps |
| 2 | Eingeschränkt | Mit Warnung fortfahren | Docs, optionale Gates, Abdeckungsrückgang |
| 3 | Blockiert | An Menschen eskalieren | Sicherheit, Architektur, Auth |

**Worker-Blockade-Erkennung**: Wenn ein Worker seine Aufgabe seit 10 Minuten nicht aktualisiert hat, sendet der Dirigent eine Statusprüfungsnachricht. Wenn innerhalb von 2 Minuten keine Antwort erfolgt, markiert der Dirigent die Story als blockiert und weist sie einem anderen Worker zu oder reiht sie für menschliche Überprüfung ein.

### Schritt 6: Sprint-Abschluss

Wenn alle Stories bearbeitet sind:

1. Dirigent erstellt Sprint-Zusammenfassungsbericht
2. Aktualisiert `.bmad/sprint-status.yaml` über Single-Writer-Muster
3. Sendet `shutdown_request` an alle Worker
4. Meldet abschließende Metriken

## Ausgabe

### Sprint-Zusammenfassungsbericht

```
================================================================
SPRINT DEVELOPMENT TEAM - Summary
================================================================

Sprint: <sprint-name>
Date: YYYY-MM-DD
Mode: Parallel (Agent Teams)
Team: 1 conductor + N dev workers

----------------------------------------------------------------
STORIES COMPLETED
----------------------------------------------------------------

| Story | Title | Worker | Time | DoD |
|-------|-------|--------|------|-----|
| US-001 | Login feature | dev-1 | 12m | PASS |
| US-002 | User profile | dev-2 | 18m | PASS |
| US-003 | Dashboard | dev-3 | 15m | PASS |

----------------------------------------------------------------
STORIES BLOCKED
----------------------------------------------------------------

| Story | Title | Reason | Escalation |
|-------|-------|--------|------------|
| US-004 | Payment | Architecture dependency | Queued for human |

================================================================
EXECUTION METRICS
================================================================

| Metric | Value |
|--------|-------|
| Stories completed | X / Y |
| Stories blocked | Z |
| Total time | Xm (vs ~Ym sequential) |
| Speedup | ~X.Xx |
| Total tokens | ~XK |
| Workers spawned | N |
| Avg time per story | Xm |
```

## Leistungserwartungen

| Worker | Stories | Sequenzielle Schätzung | Team-Schätzung | Beschleunigung | Token-Overhead |
|--------|---------|----------------------|----------------|----------------|----------------|
| 2 | 4 | ~60 Min. | ~35 Min. | ~1,7x | +25% |
| 2 | 6 | ~90 Min. | ~50 Min. | ~1,8x | +25% |
| 3 | 6 | ~90 Min. | ~40 Min. | ~2,2x | +30% |
| 3 | 9 | ~135 Min. | ~55 Min. | ~2,5x | +35% |

**Hinweis**: Die Beschleunigung hängt von der Story-Unabhängigkeit und vergleichbarer Komplexität ab. Wenn eine Story 3x länger dauert als andere, begrenzt die Engpass-Story die Gesamtbeschleunigung.

## Integration mit Ralph-Sprint

Bei Aufruf über `/common:ralph-sprint --use-teams` übernimmt der Ralph-Teams-Adapter (`Tools/AgentTeams/lib/ralph-teams-adapter.sh`):

1. Übersetzung der Ralph-Session-Konfiguration in Agent-Teams-Parameter
2. Überbrückung von Checkpoint/Recovery zwischen Ralph und Agent Teams
3. Sicherstellung, dass sprint-status.yaml-Aktualisierungen dem Single-Writer-Muster folgen
4. Zuordnung der Ralph-Fehlerlevel zu Agent-Teams-Recovery-Aktionen

## Fehlerbehandlung

| Fehler | Wiederherstellung |
|--------|-------------------|
| Worker-Timeout (>15 Min. pro Story) | Dirigent weist Story neu zu |
| Worker-Absturz | Story kehrt zu `ready-for-dev` zurück, anderer Worker übernimmt |
| Alle Worker blockiert | Dirigent eskaliert an Menschen |
| sprint-status.yaml-Konflikt | Single-Writer-Muster über Dateisperre |
| Story hat Dateiüberlappung mit anderer | Dirigent weist sequenziell demselben Worker zu |
| Docker nicht verfügbar | Worker meldet Fehler, Dirigent versucht reine Quellcodeanalyse |

## Einschränkungen

- Maximal 3 parallele Entwickler-Worker (4 insgesamt einschließlich Dirigent)
- Stories müssen unabhängig sein (keine gemeinsamen Dateidomänen)
- Token-Kosten sind ~25-35% höher als sequenziell aufgrund von Kontextduplizierung
- Erfordert Agent Teams Research Preview (API kann sich ändern)
- Nachtmodus hängt von der Stabilität des Dirigenten-Agents ab (Waisenrisiko besteht)
- Nicht geeignet für Stories, die interaktive menschliche Entscheidungen während der Implementierung erfordern
