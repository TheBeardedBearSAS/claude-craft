---
name: sprint-dev
description: Startet TDD/BDD-Entwicklung eines Sprints mit automatischer Statusaktualisierung
arguments:
  - name: sprint
    description: Sprint-Nummer, "next" fur nachsten unvollstandigen, oder "current"
    required: true
---

# /project:sprint-dev

## Zweck

Vollstandige Sprint-Entwicklung im TDD/BDD-Modus orchestrieren mit:
- **Obligatorischer Plan-Modus** vor jeder Implementierung
- **TDD-Zyklus** (RED → GREEN → REFACTOR)
- **Automatische Statusaktualisierung** (Task → User Story → Sprint)
- **Fortschrittsverfolgung** und Metriken

## Voraussetzungen

- Sprint existiert mit zerlegten Aufgaben
- Dateien vorhanden: `sprint-backlog.md`, `tasks/*.md`
- `/project:decompose-tasks N` zuerst ausfuhren falls notig

## Argumente

```bash
/project:sprint-dev 1        # Sprint 1
/project:sprint-dev next     # Nachster unvollstandiger Sprint
/project:sprint-dev current  # Aktuell aktiver Sprint
```

---

## Workflow

### Phase 1: Initialisierung

1. Sprint aus `project-management/sprints/sprint-N-*/` laden
2. `sprint-backlog.md` lesen fur User Stories
3. Aufgaben pro US auflisten (nach Abhangigkeiten sortiert)
4. Initiales Board anzeigen

### Phase 2: User Story Schleife

Fur jede US in To Do oder In Progress Status:
1. US → In Progress markieren
2. Akzeptanzkriterien anzeigen (Gherkin)
3. Jede Aufgabe der US bearbeiten

### Phase 3: Aufgaben Schleife (TDD Workflow)

Fur jede Aufgabe in To Do:

#### 3.1 Plan-Modus (OBLIGATORISCH)

⚠️ **IMMER Plan-Modus vor Implementierung aktivieren**

- Betroffenen Code erkunden
- Analyse dokumentieren
- Implementierungsplan vorschlagen
- Auf Benutzervalidierung warten

#### 3.2 TDD-Zyklus

```
🔴 RED    : Fehlschlagende Tests schreiben
🟢 GREEN  : Minimalen Code implementieren
🔧 REFACTOR : Verbessern ohne Tests zu brechen
```

#### 3.3 Definition of Done

- [ ] Code geschrieben und funktional
- [ ] Tests bestehen
- [ ] Code reviewed (wenn [REV] Aufgabe existiert)

#### 3.4 Aufgabe → Done markieren

- Metadaten aktualisieren
- Konventioneller Commit
- Board aktualisieren

### Phase 4: US Validierung

Wenn alle Aufgaben einer US Done sind:
- Akzeptanzkriterien verifizieren
- E2E Tests ausfuhren
- US → Done markieren

### Phase 5: Sprint Abschluss

Wenn alle US Done sind:
- Zusammenfassung anzeigen
- sprint-review.md generieren
- sprint-retro.md generieren

---

## Bearbeitungsreihenfolge

| Reihenfolge | Typ | Beschreibung |
|-------------|-----|--------------|
| 1 | `[DB]` | Datenbank |
| 2 | `[BE]` | Backend |
| 3 | `[FE-WEB]` | Frontend Web |
| 4 | `[FE-MOB]` | Frontend Mobile |
| 5 | `[TEST]` | Zusatzliche Tests |
| 6 | `[DOC]` | Dokumentation |
| 7 | `[REV]` | Code Review |

---

## Steuerungsbefehle

| Befehl | Aktion |
|--------|--------|
| `continue` | Plan validieren und fortfahren |
| `skip` | Diese Aufgabe uberspringen |
| `block [grund]` | Als blockiert markieren |
| `stop` | Sprint-dev stoppen |
| `status` | Fortschritt anzeigen |
| `board` | Kanban anzeigen |

---

## Blockierungsbehandlung

```
⚠️ Aufgabe Blockiert

TASK-003 kann nicht fortfahren.
Grund: Warten auf API-Spezifikationen

Optionen:
[1] Uberspringen und mit nachster Aufgabe fortfahren
[2] Versuchen die Blockierung zu losen
[3] Sprint-dev stoppen
```

---

## Automatische Aktualisierungen

Bei jeder Statusanderung:
1. Aufgabendatei: status, time_spent
2. US-Datei: Aufgabenfortschritt
3. EPIC-Datei: US-Fortschritt
4. board.md: Kanban-Spalten
5. index.md: Globale Metriken

---

## Beispiel

```bash
> /project:sprint-dev 1

📋 Sprint 1: Walking Skeleton
   3 US, 17 Aufgaben

🎯 Starte US-001: Authentifizierung (5 Pkt)

▶️ TASK-001 [DB] User Entity erstellen

⚠️ PLAN-MODUS AKTIVIERT
   Analysiere...

> continue

🧪 TDD-ZYKLUS
🔴 RED: Tests schreiben...
🟢 GREEN: Implementieren...
🔧 REFACTOR: Verbesserungen?

✅ Definition of Done: BESTANDEN

📝 Commit erstellt

▶️ TASK-002 [BE] Authentifizierungs-Service...
```

---

## Verwandte Befehle

| Befehl | Verwendung |
|--------|------------|
| `/project:decompose-tasks N` | Aufgaben vorher erstellen |
| `/project:board N` | Kanban anzeigen |
| `/project:sprint-status N` | Metriken anzeigen |
| `/project:move-task` | Aufgabenstatus andern |
| `/sprint:transition` | US-Status andern |
