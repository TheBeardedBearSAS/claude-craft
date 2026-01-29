---
description: Autonomen Sprint-Conductor fur Overnight/unbeaufsichtigte Sprint-Ausfuhrung starten
argument-hint: <sprint-name> [--overnight|--parallel N|--supervised|--max-stories N]
---

# Ralph Sprint - Autonomer Sprint Conductor (ASC)

Fuhrt einen gesamten Sprint autonom mit minimaler menschlicher Intervention aus. Der Autonome Sprint Conductor (ASC) verwaltet Story-Claiming, Ausfuhrung, Ubergange, Fehlerwiederherstellung und Eskalation blockierender Probleme.

## Argumente

**$ARGUMENTS**

- `<sprint-name>`: Name oder ID des zu verarbeitenden Sprints
- `--overnight`: Overnight-Modus (begrenzt, stoppt um 6 Uhr)
- `--parallel N`: Bis zu N Stories parallel verarbeiten (Standard: 1)
- `--supervised`: Pause vor jeder Story zur Bestatigung
- `--max-stories N`: Maximale Stories zu verarbeiten (Standard: 10)
- `--timeout H`: Maximale Laufzeit in Stunden (Standard: 12)

## Hauptfunktionen

| Funktion | Beschreibung |
|----------|--------------|
| **Auto-Claim** | Beansprucht automatisch die nachste bereite Story |
| **Auto-Transition** | Ubergangsgeschichten basierend auf Abschlussstatus |
| **Recovery Engine** | Automatische Wiederherstellung von vorubergehenden/behebbaren Fehlern |
| **Eskalationsdienst** | Warteschlange fur blockierende Probleme zur menschlichen Losung |
| **Parallelverarbeitung** | Verarbeitet mehrere unabhangige Stories gleichzeitig |
| **Begrenzte Ausfuhrung** | Zeitfenster, Story-Limits, Fehlerschwellen |

## Prozess

### 1. Sprint-Initialisierung

1. **Sprint-Konfiguration laden**:
   - Metadaten aus `.bmad/sprint-status.yaml` lesen
   - Autonome Konfiguration aus `ralph-autonomous.yml` laden
   - Recovery Engine und Eskalationsdienst initialisieren

2. **Autonomen Modus aktivieren**:
   - Circuit Breaker auf autonomes Profil setzen
   - Wiederherstellung vor Auslosung aktivieren
   - Parallel Manager initialisieren falls aktiviert

### 2. Hauptschleife des Conductors

Der ASC fuhrt eine kontinuierliche Schleife aus:

1. Stoppbedingungen prufen
2. Nachste bereite Story holen
3. Story beanspruchen
4. Mit Ralph ausfuhren
5. Ergebnis verarbeiten (Erfolg/Fehler/Eskaliert)
6. Story transitieren
7. Checkpoint erstellen

### 3. Fehlerwiederherstellung

Die Recovery Engine klassifiziert Fehler in 4 Stufen:

| Stufe | Typ | Aktion | Beispiele |
|-------|-----|--------|-----------|
| 0 | **Vorubergehend** | Auto-Retry mit Backoff | Timeout, Rate Limit, Netzwerk |
| 1 | **Behebbar** | Auto-Fix + Retry | Lint, Tests, Deps, Syntax |
| 2 | **Degradiert** | Fortsetzen mit Warnung | Docs, optionale Gates |
| 3 | **Blockiert** | An Menschen eskalieren | Sicherheit, Architektur |

### 4. Eskalationsmanagement

Blockierende Probleme werden fur menschliche Losung in die Warteschlange gestellt.

**Losungsoptionen**:
- `proceed` - Mit der Aufgabe fortfahren
- `skip` - Diese Story uberspringen und fortfahren
- `retry` - Fehlgeschlagene Operation erneut versuchen
- `abort` - Sprint stoppen

### 5. Stoppbedingungen

| Bedingung | Standard | Beschreibung |
|-----------|----------|--------------|
| Max Stories | 10 | Maximale verarbeitete Stories |
| Max Fehler | 3 | Schwelle fur aufeinanderfolgende Fehler |
| Max Laufzeit | 12h | Maximale Gesamtlaufzeit |
| Stoppfenster | 06:00 | Zeitbasierter Stopp (Overnight) |
| Kritische Eskalation | - | Pause bei kritischen Problemen |

## Schnellstart-Beispiele

```bash
# Overnight-Sprint
/common:ralph-sprint "Sprint 3" --overnight

# Parallelverarbeitung mit 3 Sitzungen
/common:ralph-sprint "Sprint 3" --parallel 3

# Uberwachter Modus
/common:ralph-sprint "Sprint 3" --supervised

# Begrenzte Ausfuhrung
/common:ralph-sprint "Sprint 3" --max-stories 5 --timeout 4
```

## Konfiguration

Der ASC verwendet `Tools/Ralph/config/ralph-autonomous.yml`:

```yaml
autonomous:
  enabled: true
  mode: "bounded"
  schedule:
    stop_window: "06:00"
    max_runtime_hours: 12
  limits:
    max_stories_per_session: 10
    max_consecutive_failures: 3
  parallel:
    enabled: false
    max_concurrent: 3

recovery:
  enabled: true
  max_attempts: 3
  auto_fix_lint: true
  auto_fix_tests: "retry_tdd"

escalation:
  enabled: true
  timeout_hours: 4
  default_action: "skip"
  critical_action: "pause"
```

## Erfolgsmetriken

| Metrik | Aktuell | Ziel |
|--------|---------|------|
| Menschliche Eingriffe/Sprint | ~15 | <5 |
| Overnight abgeschlossene Stories | 0 | 3-5 |
| Auto-Wiederherstellungsrate | N/A | >70% |
| Zeit bis Eskalation | N/A | <15 min |
| Parallelisierungseffizienz | N/A | >60% |

## Best Practices

1. **Uberwacht beginnen**: Zuerst `--supervised` verwenden
2. **Realistische Limits**: max-stories anfangs nicht zu hoch setzen
3. **Eskalationen uberwachen**: `.ralph/escalations/queue/` regelmasig prufen
4. **Metriken analysieren**: `metrics-*.json` nach jedem Lauf untersuchen
5. **Webhooks konfigurieren**: Slack/Teams-Benachrichtigungen fur kritische Probleme

## Verwandt

- `/common:ralph-run` - Kontinuierliche Schleife fur eine Aufgabe
- `/project:run-sprint` - Standard-Sprint-Ausfuhrung
- `/sprint:next-story` - Nachste bereite Story holen
- `@ralph-conductor` - Ralph-Orchestrierungsagent
