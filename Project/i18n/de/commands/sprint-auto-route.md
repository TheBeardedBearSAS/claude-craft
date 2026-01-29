---
description: Automatische Routing-Regeln fuer Story-Uebergaenge ausfuehren
argument-hint: [--dry-run]
---

# Sprint Auto-Route

Automatische Routing-Regeln ausfuehren, um Stories basierend auf ihrem aktuellen Status und Abschlussmetriken zu uebergeben.

## Argumente

$ARGUMENTS (format: [--dry-run])
- **--dry-run** (optional): Uebergaenge vorschauen ohne anzuwenden

## Prozess

### Schritt 1: Sprint-Status laden

1. `.bmad/sprint-status.yaml` lesen
2. Routing-Regeln aus `routing.auto_transitions.rules` laden
3. Alle Stories abrufen

### Schritt 2: Regeln auswerten

Fuer jede Story alle Routing-Regeln auswerten:

**Regel: all_tasks_complete**
```yaml
when: "tasks.completed == tasks.total && tasks.total > 0"
from: "in-progress"
to: "review"
```

**Regel: review_approved**
```yaml
when: "review.approved == true"
from: "review"
to: "done"
```

**Regel: blocked_detection**
```yaml
when: "blocked_reason != null"
from: "*"
to: "blocked"
```

**Regel: unblocked**
```yaml
when: "blocked_reason == null && previous_status != null"
from: "blocked"
to: "previous_status"
```

### Schritt 3: Voraussetzungen pruefen

Vor Auto-Uebergang pruefen:
- Gate-Anforderungen fuer Zielstatus
- Keine konfliktierenden Regeln
- Story nicht manuell gesperrt

### Schritt 4: Uebergaenge ausfuehren (ausser bei --dry-run)

Fuer jede ausgeloeste Regel:
1. Uebergang protokollieren
2. Status aktualisieren
3. In Historie mit `by: "auto-route"` aufzeichnen
4. Nebeneffekte anwenden (TDD-Phase, etc.)

### Schritt 5: Ergebnisse berichten

Anzeigen:
- Anzahl ausgewerteter Regeln
- Durchgefuehrte Uebergaenge
- Unveraenderte Stories
- Eventuelle Fehler oder Warnungen

## Ausgabeformat

### Dry Run

```
═══════════════════════════════════════════════════════
           Auto-Route-Vorschau (DRY RUN)
═══════════════════════════════════════════════════════

Auswertung von 4 Routing-Regeln gegen 8 Stories...

Wuerde uebergehen:
──────────────────────────────────────────────────────
📖 US-005: Benutzer-Authentifizierung
   Regel: all_tasks_complete
   in-progress → review
   Grund: 5/5 Aufgaben abgeschlossen

📖 US-008: E-Mail-Verifizierung
   Regel: all_tasks_complete
   in-progress → review
   Grund: 3/3 Aufgaben abgeschlossen

📖 US-003: OAuth-Integration
   Regel: unblocked
   blocked → in-progress
   Grund: blocked_reason geloescht

Zusammenfassung:
──────────────────────────────────────────────────────
Ausgewertete Regeln: 4
Geprufte Stories: 8
Wuerde uebergehen: 3
Keine Aenderung noetig: 5

Ohne --dry-run ausfuehren, um Uebergaenge anzuwenden.
═══════════════════════════════════════════════════════
```

### Angewendete Uebergaenge

```
═══════════════════════════════════════════════════════
              Auto-Route-Ergebnisse
═══════════════════════════════════════════════════════

Auswertung von 4 Routing-Regeln gegen 8 Stories...

Angewendete Uebergaenge:
──────────────────────────────────────────────────────
✅ US-005: in-progress → review
   Regel: all_tasks_complete
   Aufgaben: 5/5 abgeschlossen

✅ US-008: in-progress → review
   Regel: all_tasks_complete
   Aufgaben: 3/3 abgeschlossen

✅ US-003: blocked → in-progress
   Regel: unblocked
   Vorheriger Status wiederhergestellt

Zusammenfassung:
──────────────────────────────────────────────────────
Ausgewertete Regeln: 4
Geprufte Stories: 8
Uebergegangen: 3
Keine Aenderung noetig: 5

Sprint-Status aktualisiert. /sprint:bmad-status ausfuehren zum Anzeigen.
═══════════════════════════════════════════════════════
```

### Kein Uebergang noetig

```
═══════════════════════════════════════════════════════
              Auto-Route-Ergebnisse
═══════════════════════════════════════════════════════

Auswertung von 4 Routing-Regeln gegen 8 Stories...

Kein automatischer Uebergang noetig.
──────────────────────────────────────────────────────
Alle Stories befinden sich in angemessenen Zustaenden gemaess
ihrer aktuellen Abschlussmetriken.

Stories nach Status:
  📋 Backlog: 2
  🎯 Ready: 3
  🔄 In Bearbeitung: 2 (Aufgaben ausstehend)
  ✅ Erledigt: 1
═══════════════════════════════════════════════════════
```

## Beispiel

```
/sprint:auto-route --dry-run
/sprint:auto-route
```

## Benutzerdefinierte Regeln

Benutzerdefinierte Regeln in `.bmad/sprint-status.yaml` hinzufuegen:

```yaml
routing:
  auto_transitions:
    enabled: true
    rules:
      # Benutzerdefinierte Regel: Story zu lange in Review
      - name: "review_timeout"
        description: "Stories markieren, die > 2 Tage in Review sind"
        when: "status == 'review' && days_in_status > 2"
        action: "flag"  # flag | transition | notify

      # Benutzerdefinierte Regel: Hohe Prioritaet zuerst
      - name: "priority_bump"
        description: "Hoch-priorisierte Stories automatisch zuweisen"
        when: "priority == 'high' && status == 'ready-for-dev'"
        action: "notify"
```

## Integration

Auto-Route kann ausgeloest werden:
1. Manuell ueber diesen Befehl
2. Automatisch im Stop-Hook
3. Nach Aufgabenabschluss
4. Bei Session-Start (konfigurierbar)

In `.bmad/sprint-status.yaml` konfigurieren:
```yaml
routing:
  auto_transitions:
    enabled: true
    run_on_session_start: false
    run_on_task_complete: true
```
