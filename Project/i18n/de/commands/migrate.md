---
description: "Einmalige Migration eines bestehenden Backlogs nach BMAD v6 (Analyse, Migration, Stories vervollständigen, Resynchronisation)"
argument-hint: "[--analyze|--dry-run|--resync|--stories] [--force]"
---

# Backlog migrieren

Einmalige Migration eines bestehenden Backlogs in das BMAD-v6-Layout, mit `.bmad/sprint-status.yaml` als einziger Quelle der Wahrheit für den Status von Stories und Tasks (Schema: `.claude/templates/project/sprint-status.md`). Ein einziger Befehl deckt vier Modi ab: Analyse, Migration, Ergänzung fehlender Story-Felder und Resynchronisation des Inhalts.

## Verwendung

| Aufruf | Was er tut | Ersetzt |
|--------|------------|---------|
| `/project:migrate --analyze` | Nur Bericht: Struktur, INVEST-Scores, BMAD-v6-Lücken. Schreibt nichts | `analyze-backlog` |
| `/project:migrate` | Standard: migriert das Backlog und erstellt `.bmad/sprint-status.yaml` | `migrate-backlog` |
| `/project:migrate --stories [story-id]` | Ergänzt fehlende Story-Felder (Tasks, AK, Verlauf, INVEST) | `update-stories` |
| `/project:migrate --resync` | Gleicht Inhalt und IDs zwischen Markdown und YAML ab | `sync-backlog` |
| `--dry-run` | Nur Vorschau, gilt für alle Modi | - |
| `--force` | Überschreibt vorhandene BMAD-Dateien (Migrationsmodus) | - |

## Argumente

$ARGUMENTS (Format: [--analyze|--dry-run|--resync|--stories] [--force])
- **--analyze**: Analysemodus (nur lesend)
- **--stories**: optionale `story-id` (z. B. US-001); wenn weggelassen, werden alle Stories verarbeitet
- **--resync**: Abgleichmodus
- **--dry-run**: zeigt die geplanten Änderungen, schreibt nichts
- **--force**: überschreibt eine vorhandene `sprint-status.yaml` und vorhandene BMAD-Dateien
- Die Modi schließen sich gegenseitig aus; ohne einen davon läuft die Standardmigration.

## Gemeinsame Regeln

- **Backlog-Ort**, in dieser Reihenfolge gesucht: `project-management/backlog/` (Standard), `docs/backlog/`, `backlog/`, `.bmad/` (bereits migriert).
- **Einzige Quelle der Wahrheit**: Der Status lebt ausschließlich in `.bmad/sprint-status.yaml`. Markdown enthält nur Inhalt (Titel, Beschreibung, AK, Punkte, übergeordnete Elemente).
- **Alte Status**: Die Erstmigration ist der EINZIGE Zeitpunkt, an dem alte Markdown-Status/Emojis gelesen werden; sie werden in das YAML verschoben und anschließend aus dem Markdown entfernt. `--resync` und `--stories` kopieren nie einen Status aus dem Markdown.
- **Plan Mode ist Pflicht** für die Standardmigration, `--stories` und `--resync` (außer mit `--dry-run`): Claude analysiert die Auswirkungen, schlägt einen Plan vor und wartet auf Ihre Freigabe, bevor etwas geändert wird.
- **Empfohlene Reihenfolge**: zuerst `--analyze`, dann die Migration, dann `--stories`; `--resync` danach, wenn der Inhalt auseinanderläuft.

## --analyze

Nur Bericht, keine Datei wird geändert.

1. **Erkennen** des Backlog-Orts (siehe gemeinsame Regeln).
2. **Identifizieren** von Epics (`EPIC-*.md`, `epic*.md`), User Stories (`US-*.md`, `story*.md`), Tasks (`TASK-*.md` oder in Stories eingebettet) und Indexdateien (`index.md`, `backlog.md`, `README.md`).
3. **Auswerten** pro Datei: ID, Titel, alter Status (🔴 To Do, 🟡 In Progress, 🟢 Done, ⏸️ Blocked), Sprint, Story Points, übergeordnete Elemente (US → EPIC, TASK → US), Anzahl AK, Anzahl Tasks und Fortschritt.
4. **INVEST-Score** pro Story (0-6): Independent (keine blockierende Abhängigkeit), Negotiable (hat eine Beschreibung), Valuable (Nutzen genannt), Estimable (hat Punkte), Small (≤ 8 Punkte), Testable (hat AK).
5. **BMAD-v6-Lücken**: Verfolgung der TDD-Phase, Task-Liste mit Fortschritt, Statusverlauf, Sprint-Zuordnung, Validierungsstatus der AK.
6. **Bericht**: Zusammenfassung (Zähler), Struktur (Baum), INVEST-Tabelle, Tabelle der Migrationslücken (Feld / % betroffener Stories / Aktion), Empfehlungen.

```
📊 Backlog-Analysebericht
Ort: project-management/backlog/ | Epics: {N} | Stories: {N} | Tasks: {N}

| Story  | Titel | INVEST | Fehlt     |
|--------|-------|--------|-----------|
| US-001 | Login | 5/6    | Estimable |

Migrationslücken: tdd_phase 100% | tasks.list 60% | history 100%
Weiter: /project:migrate
```

## Standard: Migration

1. **Prüfen**: `.bmad/` bei Bedarf anlegen; warnen, wenn `sprint-status.yaml` existiert und kein `--force` gesetzt ist; die Analyse sollte zuvor gelaufen sein.
2. **Struktur anlegen**: `.bmad/sprint-status.yaml`, `batch-queue.yaml`, `gates/`, `hooks/`, `lib/`.
3. **Jede Story auswerten**: Metadaten, AK (Gherkin), zugehörige Tasks, alter Status, Fortschritt.
4. **Alte Status in das YAML überführen**:

   | Ursprung | BMAD-v6-Status |
   |----------|----------------|
   | 🔴 To Do | backlog |
   | 🟡 In Progress | in-progress |
   | 🟢 Done | done |
   | ⏸️ Blocked | blocked |
   | Sprint-X zugewiesen | ready-for-dev |

5. **Anfängliche TDD-Phase**: 0 % der Tasks erledigt → `red`; 1-99 % → `green`; 100 % → `refactor` oder `done`.
6. **`sprint-status.yaml` erzeugen**, ein Eintrag pro Story:

   ```yaml
   stories:
     US-001:
       title: "User login"
       status: "in-progress"
       previous_status: "ready-for-dev"
       tdd_phase: "red"
       current_task: "TASK-001"
       story_points: 5
       epic_id: "EPIC-001"
       tasks:
         total: 4
         completed: 2
         list:
           - { id: "TASK-001", title: "Backend auth endpoint", status: "in-progress", type: "BE" }
       acceptance_criteria: { total: 3, validated: 1 }
       history:
         - { timestamp: "2026-01-29T10:00:00Z", from: "backlog", to: "in-progress", by: "migration", reason: "BMAD v6 migration" }
   ```

7. **Backup** (außer `--dry-run`): Backlog nach `.bmad/backup/` kopieren (mit Zeitstempel) und den Speicherort protokollieren.
8. **Anwenden** (außer `--dry-run`): YAML schreiben, Status-Emojis/-Felder aus den Markdown-Dateien entfernen, `.bmad/migration-log.md` erstellen.

Dry Run: listet die Dateien auf, die erstellt würden (z. B. `.bmad/sprint-status.yaml`), die Anzahl der Stories/Tasks/AK, die migriert würden, und endet mit „Run without --dry-run to apply changes.“.

Rollback: `tar -xzf .bmad/backup/backlog-*.tar.gz -C project-management/ && rm .bmad/sprint-status.yaml`.

Nächste Schritte: das YAML prüfen, `/sprint:status` ausführen, Sprint-Metadaten festlegen (Daten, Ziele), Quality Gates mit `/gate:check all` prüfen.

## --stories

Ergänzt fehlende BMAD-v6-Felder bestehender Stories (alle oder eine einzelne per `story-id`).

1. **Laden** von `.bmad/sprint-status.yaml` und den Story-Dateien; beide vergleichen.
2. **Fehlende Felder** und Standardwerte:

   | Feld | Pflicht | Standard, wenn fehlend |
   |------|---------|------------------------|
   | tdd_phase | Ja | "red" bei in-progress, sonst "" |
   | tasks.list / total / completed | Ja | Aus `## Tasks` extrahieren, zählen, erledigte zählen |
   | current_task | Nein | Erste Task im Status in-progress |
   | history | Ja | Anfangseintrag mit dem aktuellen Status (`by: "migrate"`) |
   | acceptance_criteria.total / validated | Ja | Im AK-Abschnitt zählen / 0 |
   | story_points | Ja | Benutzer fragen, wenn fehlend |
   | epic_id | Nein | Aus der Datei extrahieren |

3. **Tasks auswerten** aus der `## Tasks`-Tabelle der Story und **AK** aus den Gherkin-Blöcken `### ACn:`, um `tasks.list` und `acceptance_criteria.list` (IDs, Titel) zu füllen. Task- und AK-Status gelangen nur für noch nicht im YAML geführte Einträge dorthin; ein bereits vorhandener YAML-Status wird nie durch Markdown überschrieben.
4. **INVEST**: `invest_score` hinzufügen (independent, negotiable, valuable, estimable, small, testable, total).
5. **`sprint-status.yaml` aktualisieren** durch Zusammenführen der Felder; optional einen Metadaten-Kommentar in die Story-Dateien schreiben (`<!-- BMAD v6 Metadata … -->` mit `tdd_phase`, `invest_score`, `last_sync`).

Ausgabe: Tabelle der aktualisierten Stories (ergänzte Felder, INVEST-Score), Zusammenfassung pro Feld (ergänzt / übersprungen), Warnungen (z. B. „US-003: Story Points fehlen“, „US-007: keine Akzeptanzkriterien“), geänderte Dateien. Danach die Warnungen beheben und `/project:migrate --resync` sowie `/gate:check backlog` ausführen.

## --resync

Gleicht Inhalt und IDs zwischen den Markdown-Dateien und dem YAML ab. Der Status wird nie synchronisiert: Das YAML gilt.

1. **Laden** beider Quellen und Aufbau einer Vergleichstabelle nach Story-ID.
2. **Abweichungen im Inhalt erkennen**: fehlende Stories, Titel, Story Points, Task-Listen, AK, Zuordnung.
3. **Auflösen**: Das YAML ist maßgeblich für Status, TDD-Phase, Verlauf und Task-Zustand; Markdown ist maßgeblich für Titel, Beschreibungen, AK-Texte und Punkte. Den Benutzer fragen, wenn beide dasselbe Inhaltsfeld geändert haben.
4. **Dateien → YAML**: nur in Dateien vorhandene Stories hinzufügen; Titel, Punkte, Task- und AK-Listen aktualisieren.
5. **YAML → Dateien**: den Metadaten-Kommentar aktualisieren (TDD-Phase, Verlauf, INVEST-Score, Sync-Zeitstempel); nie einen Status ins Markdown schreiben.
6. **Waisen**: im YAML, aber nicht in den Dateien → als `archived` markieren oder warnen; in den Dateien, aber nicht im YAML → zum YAML hinzufügen (Status `backlog`).
7. **Zeitstempel**: `last_sync` im YAML und `<!-- last_sync: … -->` in den Story-Dateien.

Ausgabe: Änderungen Dateien → YAML, Änderungen YAML → Dateien, aufgelöste Konflikte, Waisen (archiviert / hinzugefügt), Zeitpunkt der letzten Synchronisation. Danach `git diff` prüfen und `/sprint:status` ausführen.

Automatisierung: Ein Pre-Commit-Hook kann `/project:migrate --resync` ausführen (`.bmad/hooks/pre-commit.sh`).

## Beispiele

```
/project:migrate --analyze
/project:migrate --dry-run
/project:migrate
/project:migrate --force
/project:migrate --stories US-001
/project:migrate --stories --dry-run
/project:migrate --resync --dry-run
```
