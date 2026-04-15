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

Startet eine lokale Web-Oberfläche, die das BMAD v6 Verzeichnis `project-management/` als Scrum / Kanban Board visualisiert. Der Server hört ausschließlich auf `127.0.0.1` und kontaktiert nie das Internet.

### Verwendung

```bash
npx @the-bearded-bear/claude-craft kanban [Pfad] [Optionen]
```

Der `Pfad` ist standardmäßig das aktuelle Verzeichnis. Das Ziel muss einen Unterordner `project-management/` enthalten (generiert durch `/workflow:plan` oder `/sprint:start`).

### Optionen

| Option | Beschreibung |
|--------|--------------|
| `--port=<n>` | HTTP-Port (Standard: 3737) |
| `--open` | Öffnet automatisch den Browser |
| `--readonly` | Deaktiviert alle Mutationen (403 bei jedem PATCH) |
| `--no-watch` | Deaktiviert den Datei-Watcher |

### Ansichten

- **Kanban** — 6 Spalten. Drag-and-Drop zum Transitieren. Die Gates (INVEST 6/6, DoD, Aufgaben vollständig) werden serverseitig validiert.
- **Backlog** — Epic-Baum (nur Lesen) mit Fortschritt pro Epic.
- **Burndown** — ideale vs. tatsächliche Kurven des aktiven Sprints, Indikator on-track / at-risk / behind.
- **Dependencies** — gerichteter Graph der Inter-Story-Abhängigkeiten, Zyklen in Rot.
- **Docs** — Markdown-Viewer. Die Links `[US-XXX]` öffnen die entsprechende Karte.

### Beispiele

```bash
# Startet auf dem aktuellen Projekt und öffnet den Browser
npx @the-bearded-bear/claude-craft kanban --open

# Nur-Lese-Modus
npx @the-bearded-bear/claude-craft kanban --readonly --port=4040
```

### Sicherheit

Bind `127.0.0.1` exklusiv, CSRF same-origin, path traversal blockiert, atomares Schreiben (lock + backup + rollback + mtime check), strikte CSP, keine ausgehenden Aufrufe.

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
