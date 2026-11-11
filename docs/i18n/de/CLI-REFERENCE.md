# CLI-Referenz

Vollständige Referenz für die Claude Craft Kommandozeilenschnittstelle.

---

## NPX-Installation

Die empfohlene Methode zur Installation von Claude Craft ist über NPX:

```bash
npx @the-bearded-bear/claude-craft [Befehl] [Optionen]
```

### Verfügbare Befehle

| Befehl | Beschreibung |
|--------|--------------|
| `install` | Claude Craft in einem Projekt installieren |
| `flatten` | Abgeflachten Codebase-Kontext generieren |
| (kein Befehl) | Interaktiver Installationsassistent |

---

## Interaktiver Assistent

Führe ohne Argumente aus für den interaktiven Assistenten:

```bash
npx @the-bearded-bear/claude-craft
```

Der Assistent führt dich durch:
1. **Zielverzeichnis** - Wo installiert werden soll
2. **Technologie-Stack** - Welches Framework(s) zu verwenden
3. **Sprache** - Dokumentationssprache (en, fr, es, de, pt)
4. **Optionen** - Backup, erzwungenes Überschreiben, etc.

---

## Install-Befehl

### Grundlegende Verwendung

```bash
npx @the-bearded-bear/claude-craft install <Zielverzeichnis> [Optionen]
```

### Optionen

| Option | Kurzform | Beschreibung |
|--------|----------|--------------|
| `--tech=<Technologie>` | `-t` | Zu installierender Technologie-Stack |
| `--lang=<Sprache>` | `-l` | Dokumentationssprache |
| `--force` | `-f` | Vorhandene Dateien überschreiben |
| `--backup` | `-b` | Backup vor der Installation erstellen |
| `--dry-run` | `-d` | Simulieren ohne Änderungen vorzunehmen |
| `--preserve-config` | | Vorhandenes CLAUDE.md beibehalten |

### Technologie-Optionen

| Wert | Beschreibung |
|------|--------------|
| `symfony` | Symfony/PHP Backend |
| `flutter` | Flutter/Dart Mobile |
| `react` | React Frontend |
| `reactnative` | React Native Mobile |
| `python` | Python Backend |
| `angular` | Angular Frontend |
| `csharp` | C#/.NET Backend |
| `laravel` | Laravel/PHP Backend |
| `vuejs` | Vue.js Frontend |
| `php` | PHP Clean Architecture |
| `common` | Nur gemeinsame Regeln |
| `all` | Alle Technologien |

### Sprach-Optionen

| Wert | Sprache |
|------|---------|
| `en` | Englisch (Standard) |
| `fr` | Französisch |
| `es` | Spanisch |
| `de` | Deutsch |
| `pt` | Portugiesisch |

### Beispiele

```bash
# Symfony-Regeln auf Deutsch installieren
npx @the-bearded-bear/claude-craft install ~/mein-projekt --tech=symfony --lang=de

# Mehrere Technologien installieren
npx @the-bearded-bear/claude-craft install . --tech=react
npx @the-bearded-bear/claude-craft install . --tech=python

# Neuinstallation mit Backup erzwingen
npx @the-bearded-bear/claude-craft install ~/app --tech=flutter --force --backup

# Dry Run zur Vorschau der Änderungen
npx @the-bearded-bear/claude-craft install . --tech=angular --dry-run

# Alle Technologien installieren
npx @the-bearded-bear/claude-craft install ~/projekt --tech=all --lang=de
```

---

## Flatten-Befehl

Generiert eine abgeflachte Zusammenfassung deiner Codebase für KI-Assistenten.

### Verwendung

```bash
npx @the-bearded-bear/claude-craft flatten [Optionen]
```

### Optionen

| Option | Beschreibung |
|--------|--------------|
| `--output=<Datei>` | Name der Ausgabedatei (Standard: `CODEBASE.md`) |
| `--max-tokens=<n>` | Maximale Tokens vor Fragmentierung |
| `--exclude=<Muster>` | Zusätzliche auszuschließende Muster |

### Beispiele

```bash
# Abgeflachte Codebase generieren
npx @the-bearded-bear/claude-craft flatten

# Benutzerdefinierte Ausgabedatei
npx @the-bearded-bear/claude-craft flatten --output=CONTEXT.md

# Token-Anzahl begrenzen (aktiviert Fragmentierung für große Projekte)
npx @the-bearded-bear/claude-craft flatten --max-tokens=50000

# Zusätzliche Verzeichnisse ausschließen
npx @the-bearded-bear/claude-craft flatten --exclude="*.test.ts,*.spec.ts"
```

### Ausgabe

Der flatten-Befehl generiert:
- Dateibaum-Struktur
- Dateiinhalte nach Priorität geordnet
- Token-Schätzung
- Automatische Fragmentierung für große Projekte

---

## Makefile-Befehle

Wenn du das Repository klonst, kannst du Make für die Installation verwenden.

### Installationsbefehle

```bash
# Spezifische Technologie installieren
make install-symfony TARGET=~/projekt
make install-flutter TARGET=~/projekt RULES_LANG=de
make install-react TARGET=~/projekt OPTIONS="--force"

# Voreinstellungen installieren
make install-all TARGET=~/projekt         # Alles
make install-common TARGET=~/projekt      # Nur gemeinsame Regeln
make install-web TARGET=~/projekt         # React
make install-backend TARGET=~/projekt     # Symfony + Python
make install-mobile TARGET=~/projekt      # Flutter + React Native

# Tools installieren
make install-tools                         # Alle Tools
make install-statusline                    # Benutzerdefinierte Statuszeile
make install-multiaccount                  # Multi-Account-Manager
make install-projectconfig                 # Projektkonfigurations-Manager
```

### Dry-Run-Befehle

```bash
make dry-run-all TARGET=~/projekt
make dry-run-symfony TARGET=~/projekt
make dry-run-flutter TARGET=~/projekt
```

### Konfigurationsbefehle

```bash
make config-list                           # Projekte in der YAML-Config auflisten
make config-validate                       # YAML-Config validieren
make config-install PROJECT=mein-projekt   # Von Config installieren
make config-install-all                    # Alles von Config installieren
make config-dry-run PROJECT=mein-projekt   # Dry Run von Config
```

### Dienstprogramm-Befehle

```bash
make help                                  # Alle verfügbaren Befehle anzeigen
make list                                  # Verfügbare Komponenten auflisten
make list-agents                           # Alle Agenten auflisten
make list-commands                         # Alle Befehle auflisten
make stats                                 # Statistiken anzeigen
make tree                                  # Projektstruktur anzeigen
make fix-permissions                       # Script-Berechtigungen korrigieren
```

### Migrationsbefehle

```bash
make migrate-check                         # Migrationsstatus überprüfen
```

### Plugin-Export

```bash
make plugin-export                         # Als Claude Code Plugin exportieren
make plugin-export-all                     # Alle Technologien exportieren
```

---

## Direkte Script-Ausführung

Für erweiterte Kontrolle führe die Installationsskripte direkt aus.

### Syntax

```bash
./Dev/scripts/install-{tech}-rules.sh [Optionen] <Zielverzeichnis>
```

### Verfügbare Skripte

| Skript | Technologie |
|--------|-------------|
| `install-common-rules.sh` | Common/Transversal |
| `install-symfony-rules.sh` | Symfony |
| `install-flutter-rules.sh` | Flutter |
| `install-react-rules.sh` | React |
| `install-reactnative-rules.sh` | React Native |
| `install-python-rules.sh` | Python |
| `install-angular-rules.sh` | Angular |
| `install-csharp-rules.sh` | C#/.NET |
| `install-laravel-rules.sh` | Laravel |
| `install-vuejs-rules.sh` | Vue.js |
| `install-php-rules.sh` | PHP |

### Skript-Optionen

| Option | Beschreibung |
|--------|--------------|
| `--install` | Frische Installation (Standard) |
| `--update` | Nur vorhandene Dateien aktualisieren |
| `--force` | Alle Dateien überschreiben |
| `--preserve-config` | CLAUDE.md und Projektkontext beibehalten |
| `--dry-run` | Ohne Änderungen simulieren |
| `--backup` | Backup vor Änderungen erstellen |
| `--interactive` | Geführte Installation |
| `--lang=XX` | Sprache festlegen (en, fr, es, de, pt) |
| `--agents-only` | Nur Agenten installieren |
| `--commands-only` | Nur Befehle installieren |
| `--rules-only` | Nur Regeln installieren |
| `--templates-only` | Nur Templates installieren |
| `--checklists-only` | Nur Checklisten installieren |

### Beispiele

```bash
# Grundinstallation
./Dev/scripts/install-symfony-rules.sh --lang=de ~/mein-projekt

# Vorhandene Installation aktualisieren
./Dev/scripts/install-flutter-rules.sh --update ~/meine-app

# Neuinstallation mit Backup erzwingen
./Dev/scripts/install-python-rules.sh --force --backup ~/api

# Interaktiver Modus
./Dev/scripts/install-react-rules.sh --interactive ~/frontend

# Nur Agenten installieren
./Dev/scripts/install-symfony-rules.sh --agents-only ~/projekt
```

---

## Ralph Wiggum CLI

Führt Claude in einer kontinuierlichen Schleife bis zum Abschluss der Aufgabe aus.

### Verwendung

```bash
npx @the-bearded-bear/claude-craft ralph "Aufgabenbeschreibung"
```

### Optionen

| Option | Beschreibung |
|--------|--------------|
| `--full` | Alle DoD-Validatoren aktivieren |
| `--max-iterations=<n>` | Maximale Anzahl von Iterationen (Standard: 10) |
| `--dod=<Datei>` | Benutzerdefinierte DoD-Konfigurationsdatei |

### Beispiele

```bash
# Grundlegende Aufgabe
npx @the-bearded-bear/claude-craft ralph "Benutzerauthentifizierung implementieren"

# Mit allen DoD-Überprüfungen
npx @the-bearded-bear/claude-craft ralph --full "Login-Bug beheben"

# Benutzerdefiniertes Iterationslimit
npx @the-bearded-bear/claude-craft ralph --max-iterations=20 "Zahlungsmodul refaktorieren"
```

---

## Kanban-Befehl

Startet eine lokale Weboberfläche, um das BMAD-v6-Backlog und die Sprints als Scrum-/Kanban-Board anzuzeigen und zu verwalten. Der Server lauscht ausschließlich auf `127.0.0.1` und greift nie auf das Internet zu.

### Verwendung

```bash
npx @the-bearded-bear/claude-craft kanban [Pfad] [Optionen]
```

Der `Pfad` ist standardmäßig das aktuelle Verzeichnis. Das Ziel muss ein Unterverzeichnis `project-management/` enthalten (erzeugt durch `/workflow:plan` oder `/workflow:start`).

### Optionen

| Option | Beschreibung |
|--------|--------------|
| `--port=<n>` | HTTP-Port, 1024 bis 65535 (Standard: 3737). Die Form mit `=` ist Pflicht: `--port 4000` (mit Leerzeichen) wird mit einer Verwendungshilfe abgelehnt |
| `--open` | Öffnet den Browser automatisch |
| `--readonly` | Deaktiviert jedes Schreiben: Der Server antwortet auf jedes PATCH, PUT, POST und DELETE mit 403 `readonly`, und das Board bietet keine Verschiebe-Bedienelemente |
| `--no-watch` | Deaktiviert den Datei-Watcher (kein Neuladen bei externen Änderungen) |
| `--user=<Name>` | Autor, der in der `history` der am Board vorgenommenen Änderungen steht (`kanban:<Name>`). Standard: `CLAUDE_CRAFT_USER`, dann `git config user.name`, dann der Systembenutzer, zuletzt `kanban` |

### Ansichten

Sechs Ansichten, aufgelistet in der Navigationsleiste.

- **Board** — 6 Spalten (backlog, ready-for-dev, in-progress, review, done, blocked). Eine Karte wird per Drag-and-drop oder über das Menü „Verschieben“ der Karte bewegt, das nur die erlaubten Zielspalten anbietet (Alternative für Tastatur und einzelnen Zeiger). Die Gates (INVEST oder Punkte, abgeschlossene Aufgaben, TDD-Phase) werden serverseitig geprüft. Der Spaltenkopf zeigt die Anzahl der Karten oder `Anzahl/Limit`, wenn ein WIP-Limit gesetzt ist.
- **Backlog** — Epic-Baum mit dem Fortschritt je Epic. Eine oder mehrere Stories werden ausgewählt, um sie einem Sprint hinzuzufügen oder ins Backlog zurückzulegen; eine Kapazitätsleiste vergleicht die zugesagten Punkte mit der Kapazität des Ziel-Sprints.
- **Sprints** — alle Sprints (geplant, aktiv, abgeschlossen) mit Ziel, Datum, Punkten, Stories und aufklappbaren Aufgaben sowie ihren Review- und Retro-Notizen. Hier werden Sprints erstellt, gestartet und abgeschlossen.
- **Burndown** — ideale und tatsächliche Kurve des aktiven Sprints, Anzeige on-track / at-risk / behind. Das Velocity-Diagramm (zugesagte und gelieferte Punkte der abgeschlossenen Sprints, Durchschnitt der letzten drei, Prognose der verbleibenden Sprints) kommt mit einer gleichwertigen Tabelle.
- **Dependencies** — gerichteter Graph der Abhängigkeiten zwischen Stories mit hervorgehobenen Zyklen und eine gleichwertige Tabelle (Story, hängt ab von, blockiert, Status, Zyklus).
- **Docs** — Markdown-Viewer für `prd.md`, `tech-spec.md`, `personas.md`, `architecture/*.md` und die Epic-, Story- und Sprint-Dokumente. `US-XXX`-Kennungen im Text verlinken auf die Story.

### Was sich am Board erledigen lässt

- **Eine Story verschieben** zwischen Spalten. Die erlaubten Übergänge stehen unter [Zustandsautomat](#zustandsautomat); beim Blockieren einer Story wird ein Grund verlangt.
- **Eine Story erstellen, bearbeiten und löschen** („Neue Story“ in den Ansichten Board und Backlog; das Formular befindet sich im Story-Detail). Bearbeitbare Felder: Titel, Epic, Punkte, Priorität, Zuständige/r, Sprint, TDD-Phase und Abhängigkeiten; Persona beim Erstellen. Das Löschen verlangt eine Bestätigung und verschiebt die Datei nach `project-management/backlog/user-stories/.trash/` (wiederherstellbar, indem man sie zurückschiebt). Eine Story in Arbeit oder im Review erfordert eine ausdrückliche Bestätigung, und eine Story, von der andere abhängen, kann nicht gelöscht werden (409 `has_dependents`).
- **Aufgaben hinzufügen und ihren Status ändern** (`to-do`, `in-progress`, `done`, `blocked`) im Story-Detail; die Zahl der abgeschlossenen Aufgaben wird neu berechnet. Eine Story geht erst ins Review, wenn sie Aufgaben hat und alle erledigt sind. Bei einer Story, die nur einen Aufgabenzähler hatte, speichert die erste Änderung einen Status je Aufgabe (die ersten Aufgaben, so viele wie der Zähler angab, gelten als erledigt).
- **Einen Sprint planen**: Stories in der Backlog-Ansicht auswählen und einem geplanten oder aktiven Sprint hinzufügen.
- **Einen Sprint erstellen, starten und abschließen.** Beim Erstellen (Name, Start- und Enddatum, Ziel, Kapazität) wird `sprints/sprint-<N>-<slug>/sprint-goal.md` geschrieben; der Sprint ist „geplant“. Das Starten macht ihn zum aktiven Sprint (abgelehnt, solange ein anderer Sprint aktiv ist). Beim Abschluss werden die `done`-Stories unter `archived_sprints` archiviert, und man wählt, wohin die unfertigen Stories gehen: zurück ins Backlog oder in einen geplanten Sprint.
- **WIP-Limits** je Spalte im Einstellungsfenster festlegen. Sie sind unverbindlich: Eine Überschreitung zeigt eine Warnung und blockiert eine Verschiebung nie. Eine Spalte zählt die Stories des aktiven Sprints, so wie das Board sie zeigt.
- **Ungespeicherte Eingaben sind geschützt**: Wer ein Formular schließt (Escape, Abbrechen, Klick neben das Fenster) oder die URL wechselt (Zurück im Browser, Link zu einer Story), während ein Story- oder Sprint-Formular Änderungen enthält, wird vor dem Verwerfen gefragt.
- **Suchen, filtern und sortieren**: Das Suchfeld (`Strg+K` oder `/`) filtert die Ansichten Board und Backlog; die Filter für Priorität, Zuständige/n und Epic sowie die Sortierung stehen in der URL, zum Beispiel `#/kanban?q=auth&prio=must,should&who=alice&epic=E4&sort=priority&dir=desc`. `?story=US-E4-03` öffnet eine Story aus jeder Ansicht, `#/docs/<Pfad>` öffnet ein Dokument.
- **Sprache der Oberfläche**: Englisch, Französisch, Spanisch, Deutsch oder Portugiesisch, automatisch nach dem Browser gewählt oder im Einstellungsfenster. Story-Titel und Dokumente werden unverändert angezeigt.

Die Befehle `/workflow:*` und `/project:*` bleiben gültig und schreiben dieselben Dateien.

### Wohin geschrieben wird

| Was | Datei |
|-----|-------|
| Status, Sprint-Zugehörigkeit, Aufgaben, Punkte, Zuständige/r, Priorität, Verlauf | `.bmad/sprint-status.yaml` |
| Inhalt einer Story (Beschreibung, Abnahmekriterien, Persona) | `project-management/backlog/user-stories/US-*.md` |
| Ziel eines neuen Sprints | `project-management/sprints/sprint-<N>-<slug>/sprint-goal.md` |
| WIP-Limits | `.bmad/kanban.yaml` |
| Gelöschte Stories | `project-management/backlog/user-stories/.trash/` |

Die Markdown-Dateien erhalten nie eine Statuszeile. Die optionalen Schlüssel `stories.<id>.sprint_id` und `metadata.closed_date` sind in `Project/i18n/de/templates/sprint-status.md` beschrieben.

### Nebenläufigkeit

- Schreibzugriffe auf `.bmad/sprint-status.yaml` nehmen dieselbe Sperre wie die Skripte in `.bmad/lib/` (`status-lock.sh`). Solange ein Skript sie hält, antwortet das Board mit 423 `locked`; eine von einem abgestürzten Prozess hinterlassene Sperre wird nach 10 Sekunden übernommen.
- Konflikte werden pro Story erkannt: Jede Story trägt eine Revision, die als `If-Match` zurückgesendet wird. Eine inzwischen anderswo geänderte Story wird mit 409 `conflict` abgelehnt, und die Oberfläche bietet an, sie neu zu laden.
- Die Datei wird nach erneuter Validierung geschrieben, Kommentare, Schlüsselreihenfolge und Formatierung bleiben erhalten. Eine Datei, die nicht validiert, wird nie überschrieben (409 `sprint_status_invalid`).

### Sicherheit

- Ausschließlich an `127.0.0.1` gebunden, nie `0.0.0.0` oder das lokale Netz.
- Der `Host`-Header muss die Loopback-Adresse und der bediente Port sein (Schutz vor DNS-Rebinding); der `Origin` wird bei jedem Schreibzugriff geprüft, und Schreibzugriffe von anderen Origins werden abgelehnt (403).
- Anfragekörper sind auf 64 KB begrenzt (512 KB für den Körper einer Story).
- `--readonly` blockiert jedes Schreiben.
- Path Traversal am Dokument-Endpunkt blockiert; Fehlerantworten enthalten keine Dateisystempfade.
- Atomare Schreibvorgänge (Sperre, temporäre Datei, Umbenennen).
- Strikte CSP (`script-src 'self'`, `connect-src 'self'`), kein `eval`, keine Shell-Ausführung, keine ausgehenden Verbindungen.

### Zustandsautomat

Erlaubte Übergänge (alle anderen werden mit 409 `invalid_transition` und der Liste der erlaubten Ziele abgelehnt):

```
backlog       -> ready-for-dev (invest_score >= 6, falls gesetzt, sonst story_points > 0) | blocked
ready-for-dev -> in-progress | backlog | blocked
in-progress   -> review (alle Aufgaben abgeschlossen) | blocked
review        -> done (alle Aufgaben + tdd_phase in green|refactor|done) | in-progress | blocked
blocked       -> previous_status (nur Entsperren)
done          -> (terminal)
```

### BMAD-v6-Quelle sprint-status

Die Stories stammen aus `.bmad/sprint-status.yaml` (geschrieben von `/workflow:*` und `/project:backlog`) und aus den Markdown-Dateien in `project-management/`. Wird eine Story in der YAML geführt, hat die YAML Vorrang für Status, Titel, Punkte, Priorität, Zuständige/n, Epic, Aufgaben und Sprint; das Markdown behält den Inhalt. Das Board aktualisiert sich live, sobald sich eine der Quellen ändert. Stories eines abgeschlossenen Sprints (`archived_sprints`) sind schreibgeschützt.

Ist das Board leer oder fehlt eine Story, listet das Diagnose-Banner die nicht lesbaren Dateien auf; dieselbe Liste liefert `GET /api/diagnostics`. Siehe [Fehlerbehebung](../../TROUBLESHOOTING.md#kanban-board-empty).

### HTTP-Routen

Lesezugriffe (`GET`): `/api/health` (`ok`, `readonly`, `user`, `wip_limits`), `/api/diagnostics`, `/api/stories`, `/api/stories/:id`, `/api/dependencies`, `/api/docs`, `/api/docs/<Pfad>`, `/api/sprints`, `/api/sprints/:id`, `/api/sprints/current`, `/api/velocity`, `/api/events` (Server-Sent Events).

Schreibzugriffe:

| Route | Zweck | Spezifische Fehler |
|-------|-------|--------------------|
| `PATCH /api/stories/:id/status` | Eine Story verschieben (`status`, `blocked_reason?`, `reason?`) | 409 `invalid_transition`, `archived`, `read_only_source`, `conflict` |
| `PATCH /api/stories/:id` | Titel, Punkte, Zuständige/n, Priorität, TDD-Phase, Epic, Sprint (`null` = Backlog), Abhängigkeiten ändern | 400 `invalid_payload`; 409 `archived`, `sprint_not_found`, `conflict` |
| `PUT /api/stories/:id/body` | Markdown-Körper ersetzen (`markdown`, `expected_mtime`) | 409 `no_backing_file`, `conflict`; 422 `status_line_forbidden` |
| `POST /api/stories` | Eine Story erstellen (`title`, `epic_id?`, `story_points?`, `priority?`, `persona?`, `sprint_id?`) | 409 `sprint_status_missing`, `sprint_status_invalid`, `sprint_not_found` |
| `DELETE /api/stories/:id[?force=1]` | Eine Story nach `.trash/` verschieben | 409 `story_active`, `has_dependents`, `archived` |
| `PATCH /api/stories/:id/tasks/:taskId` | Den Status einer Aufgabe setzen | 404 `task_not_found` |
| `POST /api/stories/:id/tasks` | Eine offene Aufgabe hinzufügen (`title`) | 409 `task_exists` |
| `POST /api/sprints` | Einen geplanten Sprint erstellen | 409 `sprint_exists` |
| `POST /api/sprints/:id/start` | Einen Sprint starten | 409 `sprint_already_active`, `sprint_closed`, `conflict` |
| `POST /api/sprints/:id/close` | Einen Sprint abschließen (`carry_over`: `backlog` oder eine Sprint-ID) | 409 `not_active`, `sprint_not_found`, `conflict` |
| `PUT /api/settings/wip` | WIP-Limits setzen (Status → 1..99 oder `null`) | 400 `invalid_payload` |

Allen Schreibzugriffen gemeinsame Fehler: 400 `invalid_json` / `invalid_payload`, 403 `forbidden` / `readonly`, 404 `not_found`, 413 `payload_too_large`, 423 `locked`, 500 `write_failed`. Änderungen werden über `/api/events` an geöffnete Browser gesendet.

### Tastenkürzel (Board)

| Taste | Aktion |
|-------|--------|
| `↑` `↓` | Zwischen Karten navigieren |
| `←` `→` | Spalte wechseln |
| `Alt+M` | Verschiebemenü der fokussierten Karte öffnen |
| `1`-`6` | Karte in diese Spalte verschieben (Menü geöffnet) |
| `Eingabe` | Story-Detail öffnen |
| `Esc` | Menü oder Dialog schließen |
| `Strg+K` (`⌘+K`) oder `/` | Stories suchen |

Die Tastenkürzel sind optional: Alle Aktionen bleiben mit `Tab` und den nativen Schaltflächen erreichbar.

### Beispiele

```bash
# Im aktuellen Projekt starten und den Browser öffnen
npx @the-bearded-bear/claude-craft kanban --open

# Schreibgeschützter Modus
npx @the-bearded-bear/claude-craft kanban --readonly --port=4040
```

---

## Konfigurationsdatei

### YAML-Konfiguration

Für Monorepos und Multi-Projekt-Setups verwende `claude-projects.yaml`:

```yaml
settings:
  default_lang: "de"

projects:
  - name: "mein-monorepo"
    description: "Meine Fullstack-Anwendung"
    root: "~/Projekte/mein-monorepo"
    lang: "de"
    common: true
    modules:
      - path: "frontend"
        tech: react
      - path: "backend"
        tech: symfony
      - path: "mobile"
        tech: flutter
      - path: "api"
        tech: [python, react]  # Mehrere Technologien
```

### Umgebungsvariablen

| Variable | Beschreibung | Standard |
|----------|--------------|----------|
| `CLAUDE_CRAFT_LANG` | Standardsprache | `en` |
| `CLAUDE_CRAFT_TARGET` | Standard-Zielverzeichnis | `.` |
| `CLAUDE_CRAFT_CONFIG` | Config-Dateipfad | `claude-projects.yaml` |

---

## Exit-Codes

| Code | Bedeutung |
|------|-----------|
| 0 | Erfolg |
| 1 | Allgemeiner Fehler |
| 2 | Ungültige Argumente |
| 3 | Fehlende Voraussetzungen |
| 4 | Zielverzeichnis nicht gefunden |
| 5 | Zugriff verweigert |

---

## Fehlerbehebung

### NPX-Cache-Probleme

```bash
# NPX-Cache leeren
npx clear-npx-cache
# oder
rm -rf ~/.npm/_npx
```

### Skript nicht ausführbar

```bash
chmod +x Dev/scripts/*.sh
# oder
make fix-permissions
```

### Falsche yq-Version

```bash
# Claude Craft benötigt yq v4 (Mike Farahs Version)
yq --version
# Sollte anzeigen: yq (https://github.com/mikefarah/yq/) version v4.x.x
```

---

## Token-Optimierung (RTK)

### Automatische Konfiguration

```bash
# In Claude Code alle Optimierungen mit einem Befehl konfigurieren
/common:setup-rtk
```

### RTK-Befehle

| Befehl | Beschreibung |
|--------|--------------|
| `rtk gain` | Token-Einsparungen anzeigen |
| `rtk gain --history` | Befehlsverlauf mit Einsparungen |
| `rtk discover` | Verlauf nach verpassten Möglichkeiten analysieren |
| `rtk proxy <cmd>` | Befehl ohne Filterung ausführen (Debug) |
| `rtk --version` | Installierte Version überprüfen |

### Claude Code Kontext-Befehle

| Befehl | Beschreibung |
|--------|--------------|
| `/effort low\|medium\|high` | Aufwandsniveau des Modells anpassen |
| `/context` | Kontextoptimierungsvorschläge |
| `/compact` | Kontext proaktiv kompaktieren |
| `/clear` | Zwischen nicht verwandten Aufgaben bereinigen |
| `/memory` | Persistente Lerneinheiten (v2.1.59+) |
| `/loop <Intervall> <cmd>` | Wiederkehrende Aufgaben (v2.1.71+) |
| `/model haiku\|sonnet\|opus` | Modell in der Sitzung wechseln |

---

## Siehe auch

- [Schnellstartanleitung](QUICKSTART.md)
- [Voraussetzungen](PREREQUISITES.md)
- [Installationsanleitung](../INSTALLATION.md)
- [Befehlsreferenz](../COMMANDS-FULL-REFERENCE.md)
