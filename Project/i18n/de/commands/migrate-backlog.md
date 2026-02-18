---
description: Vorhandenes Backlog ins BMAD v6-Format migrieren
argument-hint: [--dry-run] [--force]
---

# Backlog migrieren

Das vorhandene Backlog ins BMAD v6-Format mit sprint-status.yaml-Tracking konvertieren.

## Argumente

$ARGUMENTS (format: [--dry-run] [--force])
- **--dry-run** (optional): Aenderungen vorschauen ohne anzuwenden
- **--force** (optional): Vorhandene BMAD-Dateien ueberschreiben

## Voraussetzungen

Fuehren Sie zuerst `/project:analyze-backlog` aus, um die aktuelle Struktur zu verstehen.

## Plan-Modus

> **Der Plan-Modus ist obligatorisch.** Vor der Ausführung aktiviert Claude den Plan-Modus, um betroffenen Code zu analysieren, einen Implementierungsplan vorzuschlagen und auf Ihre Validierung zu warten, bevor Änderungen vorgenommen werden.

## Prozess

### Schritt 1: Voraussetzungen validieren

1. Pruefen, ob `.bmad/`-Verzeichnis existiert (bei Bedarf erstellen)
2. Existenz von `sprint-status.yaml` pruefen (warnen falls vorhanden und kein --force)
3. Pruefen, ob Backlog-Analyse durchgefuehrt wurde

### Schritt 2: BMAD-Struktur erstellen

```
.bmad/
├── sprint-status.yaml       # Haupt-Tracking-Datei
├── batch-queue.yaml         # Batch-Verarbeitungswarteschlange
├── gates/                   # Quality Gate-Konfigurationen
├── hooks/                   # Claude Code Hooks
└── lib/                     # Hilfs-Skripte
```

### Schritt 3: Vorhandenes Backlog parsen

Fuer jede gefundene User Story:
1. Alle Metadaten extrahieren
2. Akzeptanzkriterien parsen (Gherkin-Format)
3. Zugehoerige Aufgaben identifizieren
4. Aktuellen Status bestimmen
5. Fortschrittsprozentsatz berechnen

### Schritt 4: sprint-status.yaml generieren

Jede Story ins BMAD v6-Format transformieren:

```yaml
stories:
  US-001:
    title: "Benutzeranmeldung"
    status: "in-progress"
    previous_status: "ready-for-dev"
    assigned_to: ""
    tdd_phase: "red"
    current_task: "TASK-001"
    story_points: 5
    epic_id: "EPIC-001"
    tasks:
      total: 4
      completed: 2
      list:
        - id: "TASK-001"
          title: "Backend-Auth-Endpoint"
          status: "in-progress"
    history:
      - timestamp: "2026-01-29T10:00:00Z"
        from: "backlog"
        to: "in-progress"
        by: "migration"
```

### Schritt 5: Status-Mapping

| Original | BMAD v6-Status |
|----------|----------------|
| 🔴 Offen | backlog |
| 🟡 In Bearbeitung | in-progress |
| 🟢 Erledigt | done |
| ⏸️ Blockiert | blocked |
| Sprint-X zugewiesen | ready-for-dev |

### Schritt 6: TDD-Phase initialisieren

Initiale TDD-Phase basierend auf Aufgaben-Abschluss setzen:
- 0% Aufgaben erledigt → `red`
- 1-99% Aufgaben erledigt → `green`
- 100% Aufgaben erledigt → `refactor` oder `done`

### Schritt 7: Backup erstellen (ausser bei --dry-run)

1. Vorhandenes Backlog nach `.bmad/backup/` kopieren
2. Backup mit Zeitstempel versehen
3. Backup-Speicherort protokollieren

### Schritt 8: Migration anwenden (ausser bei --dry-run)

1. `sprint-status.yaml` schreiben
2. Story-Dateien mit BMAD-Metadaten aktualisieren
3. `.bmad/migration-log.md` erstellen

## Ausgabeformat

```
🔄 BMAD v6-Migration
====================

## Vorpruefung
✅ Backlog-Speicherort: project-management/backlog/
✅ BMAD-Verzeichnis: .bmad/ (erstellt)
✅ Keine vorhandene sprint-status.yaml

## Migrationszusammenfassung

### Migrierte Stories: {ANZAHL}
| ID | Titel | Status | TDD-Phase |
|----|-------|--------|-----------|
| US-001 | Anmeldung | in-progress | green |

### Migrierte Aufgaben: {ANZAHL}
### Akzeptanzkriterien: {ANZAHL}

## Erstellte Dateien
- .bmad/sprint-status.yaml
- .bmad/batch-queue.yaml
- .bmad/backup/backlog-2026-01-29.tar.gz

## Naechste Schritte
1. sprint-status.yaml ueberpruefen
2. `/sprint:status` zur Verifizierung ausfuehren
3. Sprint-Metadaten konfigurieren
```

## Beispiel

```
/project:migrate-backlog --dry-run
/project:migrate-backlog
/project:migrate-backlog --force
```
