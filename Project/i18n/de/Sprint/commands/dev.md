---
name: sprint-dev
description: TDD/BDD-Entwicklung eines Sprints starten mit automatischen Statusaktualisierungen
arguments:
  - name: sprint
    description: Sprint-Nummer, „next" für den nächsten unvollständigen Sprint oder „current"
    required: true
---

# /sprint:dev

## Zweck

Vollständige Sprint-Entwicklung im TDD/BDD-Modus orchestrieren mit:
- **Obligatorischem Plan-Modus** vor jeder Aufgaben-Implementierung
- **TDD-Zyklus** (ROT → GRÜN → REFACTOR)
- **Automatischen Statusaktualisierungen** (Aufgabe → User Story → Sprint)
- **Fortschrittsverfolgung** und Metriken

## Voraussetzungen

- Sprint existiert mit zerlegten Aufgaben
- Dateien vorhanden: `sprint-backlog.md`, `tasks/*.md`
- Zuerst `/project:decompose-tasks N` ausführen, falls erforderlich

## Argumente

```bash
/sprint:dev 1        # Sprint 1
/sprint:dev next     # Nächster unvollständiger Sprint
/sprint:dev current  # Aktuell aktiver Sprint
```

---

## Workflow

### Phase 1: Initialisierung

1. Sprint aus `project-management/sprints/sprint-N-*/` laden
2. `sprint-backlog.md` lesen, um User Stories zu erhalten
3. Aufgaben pro US auflisten (sortiert nach Abhängigkeiten)
4. Anfängliches Board anzeigen

```
📋 Sprint 1: Walking Skeleton
   Ziel: Vollständigen Authentifizierungsfluss von Ende zu Ende abschließen

   3 User Stories, 17 Aufgaben

   🔴 Zu erledigen: 15 | 🟡 In Bearbeitung: 2 | 🟢 Erledigt: 0
```

### Phase 2: User-Story-Schleife

Für jede User Story mit Status „Zu erledigen" oder „In Bearbeitung":

1. **US → In Bearbeitung markieren** (falls „Zu erledigen")
2. **Akzeptanzkriterien anzeigen** (Gherkin-Format)
3. **Jede Aufgabe** dieser US verarbeiten

```
🎯 US-001: Benutzerauthentifizierung (5 Pkt.)
   Status: 🟡 In Bearbeitung

   Akzeptanzkriterien:
   ┌─────────────────────────────────────────────────────┐
   │ GEGEBEN DASS ein registrierter Benutzer gültige    │
   │ Anmeldedaten hat                                    │
   │ WENN er das Anmeldeformular absendet               │
   │ DANN sollte er sein Dashboard sehen                 │
   │ UND eine Sitzung sollte erstellt werden            │
   └─────────────────────────────────────────────────────┘

   Aufgaben:
   └─ TASK-001 [DB] User-Entität erstellen .............. 🔴 Zu erledigen
   └─ TASK-002 [BE] Authentifizierungsservice ........... 🔴 Zu erledigen
   └─ TASK-003 [FE-WEB] Anmeldeformular ................. 🔴 Zu erledigen
   └─ TASK-004 [TEST] E2E-Authentifizierungstests ....... 🔴 Zu erledigen
```

### Phase 3: Aufgaben-Schleife (TDD-Workflow)

Für jede Aufgabe mit Status „Zu erledigen":

#### 3.1 Aufgabendetails anzeigen

```
▶️ Starting TASK-001 [DB] User-Entität erstellen

   Schätzung: 2 Std.
   Beschreibung: User-Entität mit E-Mail, Passwort-Hash, Rollen erstellen
   Zu ändernde Dateien: src/Entity/User.php, migrations/

   Definition of Done:
   - [ ] Code geschrieben und funktionsfähig
   - [ ] Tests bestehen
   - [ ] Code überprüft (falls [REV]-Aufgabe existiert)
```

#### 3.2 Plan-Modus (OBLIGATORISCH)

⚠️ **Plan-Modus IMMER vor der Implementierung aktivieren**

```
⚠️ PLAN-MODUS AKTIVIERT

   Aufgabe TASK-001 wird analysiert...

   📁 Zu analysierende Dateien:
   - src/Entity/ (Muster bestehender Entitäten)
   - config/packages/doctrine.yaml
   - migrations/ (neueste Migration)

   🔍 Analyse läuft...
```

Der Plan-Modus MUSS:
1. **Betroffenen Code und Abhängigkeiten erkunden**
2. **Analyseergebnisse dokumentieren**
3. **Implementierungsplan vorschlagen** mit:
   - Zu erstellenden/ändernden Dateien
   - Zu schreibenden Tests (TDD)
   - Risiken und Gegenmaßnahmen
4. **Auf Benutzerbestätigung warten**, bevor fortgefahren wird

```
📋 Implementierungsplan für TASK-001

   1. User-Entität mit Eigenschaften erstellen:
      - id (UUID)
      - email (eindeutig)
      - password_hash
      - roles (JSON-Array)
      - created_at, updated_at

   2. ZUERST zu schreibende Tests (TDD):
      - UserTest::test_user_creation()
      - UserTest::test_email_validation()
      - UserTest::test_password_hashing()

   3. Zu erstellende Dateien:
      - src/Entity/User.php
      - tests/Unit/Entity/UserTest.php
      - migrations/VersionXXX.php

   ⏳ Warte auf Bestätigung...

   [continue] Mit Implementierung fortfahren
   [skip] Diese Aufgabe überspringen
   [block] Als blockiert markieren
   [stop] sprint-dev stoppen
```

#### 3.3 Aufgabe → In Bearbeitung markieren

Nach Plan-Bestätigung:
- Aufgabenstatus auf „In Bearbeitung" aktualisieren
- board.md aktualisieren
- index.md aktualisieren

#### 3.4 TDD-Zyklus

```
🧪 TDD-ZYKLUS - TASK-001

🔴 ROT-Phase: Fehlschlagende Tests schreiben
   tests/Unit/Entity/UserTest.php wird erstellt...

   Tests ausführen... FEHLGESCHLAGEN (erwartet)
   ✗ test_user_creation
   ✗ test_email_validation
   ✗ test_password_hashing

🟢 GRÜN-Phase: Minimalen Code implementieren
   src/Entity/User.php wird erstellt...

   Tests ausführen... BESTANDEN
   ✓ test_user_creation
   ✓ test_email_validation
   ✓ test_password_hashing

🔧 REFACTOR-Phase: Code-Qualität verbessern
   - E-Mail-Validierung in ValueObject auslagern? [j/n]
   - Factory-Methode hinzufügen? [j/n]

   Tests ausführen... BESTANDEN (keine Regression)
```

#### 3.5 Definition-of-Done-Prüfung

```
✅ Definition of Done - TASK-001

- [x] Code geschrieben und funktionsfähig
- [x] Tests bestehen (3/3)
- [ ] Code überprüft → Behandelt durch TASK-XXX [REV]

Alle Prüfungen bestanden!
```

#### 3.6 Aufgabe → Erledigt markieren

```
📊 Aufgabenabschluss

TASK-001 [DB] User-Entität erstellen
├─ Status: 🟢 Erledigt
├─ Geschätzt: 2 Std.
├─ Tatsächlich: 1,5 Std.
└─ Effizienz: 133%

Tatsächlich aufgewendete Zeit eingeben (Stunden): 1.5
```

Aktualisierungen:
- Aufgaben-Datei-Metadaten (Status, time_spent, updated_at)
- board.md
- index.md
- Sprint-Metriken

#### 3.7 Conventional Commit

```
📝 Commit erstellen...

feat(entity): create User entity with authentication support

- Add User entity with email, password_hash, roles
- Add UUID primary key strategy
- Add timestamps (created_at, updated_at)
- Add unit tests for User entity

Refs: TASK-001, US-001

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

### Phase 4: User-Story-Validierung

Wenn alle Aufgaben einer US erledigt sind:

```
🎯 US-001 Validierung

Alle Aufgaben abgeschlossen (4/4)

Akzeptanzkriterien prüfen:
┌─────────────────────────────────────────────────────┐
│ ✓ GEGEBEN DASS ein registrierter Benutzer gültige  │
│   Anmeldedaten hat                                  │
│ ✓ WENN er das Anmeldeformular absendet             │
│ ✓ DANN sollte er sein Dashboard sehen               │
│ ✓ UND eine Sitzung sollte erstellt werden          │
└─────────────────────────────────────────────────────┘

E2E-Tests ausführen, falls vorhanden...
✓ tests/E2E/AuthenticationTest.php bestanden

US-001 → 🟢 Erledigt

EPIC-001-Fortschritt aktualisieren: 1/3 US abgeschlossen (33%)
```

### Phase 5: Sprint-Abschluss

Wenn alle User Stories erledigt sind:

```
🏁 Sprint 1 abgeschlossen!

📊 Zusammenfassung
├─ Dauer: 8 Tage (geplant: 10)
├─ Velocity: 15 Punkte
├─ Aufgaben: 17/17 abgeschlossen
└─ Stunden: 38 Std. tatsächlich vs. 42 Std. geschätzt (110% Effizienz)

📈 Metriken nach Typ
├─ [DB]: 4 Aufgaben, 6 Std.
├─ [BE]: 5 Aufgaben, 12 Std.
├─ [FE-WEB]: 4 Aufgaben, 10 Std.
├─ [TEST]: 3 Aufgaben, 8 Std.
└─ [DOC]: 1 Aufgabe, 2 Std.

📝 sprint-review.md wird generiert...
📝 sprint-retro.md-Template wird generiert...

Weiter: /sprint:dev 2 oder /sprint:dev next ausführen
```

---

## Aufgaben-Verarbeitungsreihenfolge

Aufgaben werden nach Typ verarbeitet, um Abhängigkeiten zu respektieren:

| Reihenfolge | Typ | Beschreibung |
|-------------|-----|--------------|
| 1 | `[DB]` | Datenbank (Entitäten, Migrationen, Repositories) |
| 2 | `[BE]` | Backend (Services, APIs, Geschäftslogik) |
| 3 | `[FE-WEB]` | Frontend Web (Controller, Templates, JS) |
| 4 | `[FE-MOB]` | Frontend Mobile (Screens, Blocs, Widgets) |
| 5 | `[TEST]` | Zusätzliche Tests (E2E, Performance) |
| 6 | `[DOC]` | Dokumentation |
| 7 | `[REV]` | Code Review |

---

## Steuerbefehle

Während der sprint-dev-Ausführung:

| Befehl | Aktion |
|--------|--------|
| `continue` | Plan bestätigen und mit Implementierung fortfahren |
| `skip` | Diese Aufgabe überspringen (bleibt „Zu erledigen") |
| `block [Grund]` | Aufgabe mit Grund als „Blockiert" markieren |
| `stop` | sprint-dev stoppen (aktuellen Zustand speichern) |
| `status` | Aktuellen Fortschritt anzeigen |
| `board` | Kanban-Board anzeigen |

---

## Blockierungsbehandlung

```
⚠️ Aufgabe blockiert

TASK-003 kann nicht fortgeführt werden.
Grund: Warten auf API-Spezifikation vom Backend-Team

Optionen:
[1] Überspringen und mit der nächsten nicht blockierten Aufgabe fortfahren
[2] Versuchen, die Blockierung zu lösen
[3] sprint-dev stoppen

Auswahl: 1

TASK-003 wird als „Blockiert" markiert...
Weiter zu TASK-004...
```

---

## Automatische Aktualisierungen

Bei jeder Statusänderung:

1. **Aufgaben-Datei**: Status, time_spent, updated_at aktualisieren
2. **User-Story-Datei**: Aufgabenfortschritt aktualisieren, Status wenn alle erledigt
3. **EPIC-Datei**: US-Fortschritt aktualisieren
4. **board.md**: Kanban-Spalten aktualisieren
5. **index.md**: Globale Metriken aktualisieren
6. **sprint-status**: Metriken neu berechnen

---

## Fortfahren nach Stopp

```bash
/sprint:dev current

📋 Sprint 1 fortsetzen: Walking Skeleton

Fortschritt: 8/17 Aufgaben (47%)

Zuletzt abgeschlossen: TASK-008 [BE] JWT-Token-Service
Nächste Aufgabe: TASK-009 [FE-WEB] Login-Controller

Von TASK-009 fortfahren? [j/n]
```

---

## Beispiel-Sitzung

```bash
> /sprint:dev 1

📋 Sprint 1: Walking Skeleton
   3 US, 17 Aufgaben
   🔴 Zu erledigen: 17 | 🟡 In Bearbeitung: 0 | 🟢 Erledigt: 0

🎯 US-001 starten: Benutzerauthentifizierung (5 Pkt.)
   Als „In Bearbeitung" markieren...

▶️ TASK-001 [DB] User-Entität erstellen

⚠️ PLAN-MODUS AKTIVIERT
   Analysieren...

   [Plandetails werden angezeigt]

> continue

   TASK-001 wird als „In Bearbeitung" markiert...

🧪 TDD-ZYKLUS

🔴 ROT: Tests schreiben...
   [Test-Code erstellt]
   Tests: 0/3 bestanden (erwartet)

🟢 GRÜN: Implementieren...
   [Implementierungscode]
   Tests: 3/3 bestanden

🔧 REFACTOR: Verbesserungen? [überspringen]

✅ Definition of Done: BESTANDEN

   Tatsächliche Zeit eingeben (geschätzt 2 Std.): 1.5

📝 Commit erstellt: feat(entity): create User entity

▶️ TASK-002 [BE] Authentifizierungsservice

⚠️ PLAN-MODUS AKTIVIERT
   ...
```

---

## Aktualisierte Dateien

| Datei | Aktualisierungen |
|-------|-----------------|
| `project-management/backlog/user-stories/US-XXX.md` | Status, Aufgabenfortschritt |
| `project-management/backlog/epics/EPIC-XXX.md` | US-Fortschritt |
| `project-management/sprints/sprint-N-*/board.md` | Kanban-Spalten |
| `project-management/sprints/sprint-N-*/tasks/*.md` | Aufgabenstatus, Zeit |
| `project-management/backlog/index.md` | Globale Metriken |
| `project-management/sprints/sprint-N-*/sprint-review.md` | Am Ende generiert |

---

## Verwandte Befehle

| Befehl | Verwendung |
|--------|-----------|
| `/project:decompose-tasks N` | Aufgaben vor sprint-dev erstellen |
| `/project:board N` | Kanban-Board anzeigen |
| `/sprint:status N` | Sprint-Metriken anzeigen |
| `/project:move-task` | Aufgabenstatus manuell ändern |
| `/sprint:transition` | US-Status manuell ändern |
