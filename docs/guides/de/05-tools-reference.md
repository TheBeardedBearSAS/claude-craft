# Werkzeug-Referenzhandbuch

Dieser Leitfaden behandelt die Hilfswerkzeuge von Claude-Craft zur Verwaltung von Profilen, Statusanzeigen, Projektkonfigurationen sowie Befehle und Funktionen von Claude Code (v8.7).

---

## Inhaltsverzeichnis

1. [Claude Code-Befehle](#claude-code-befehle)
2. [Hook-Ereignisse](#hook-ereignisse)
3. [Agent-Frontmatter](#agent-frontmatter)
4. [MCP Tool Search](#mcp-tool-search)
5. [Auto-Modus](#auto-modus)
6. [Hook-Vorlagen](#hook-vorlagen)
7. [Verwaltete Einstellungen](#verwaltete-einstellungen)
8. [MultiAccount-Manager](#multiaccount-manager)
9. [StatusLine](#statusline)
10. [ProjectConfig-Manager](#projectconfig-manager)
11. [Installation](#installation)

---

## Claude Code-Befehle

Claude Code stellt eingebaute Befehle für die Kontext- und Sitzungsverwaltung bereit. Diese sind in jeder Claude Code-Sitzung verfügbar (v2.1.47+).

### Befehle zur Kontextverwaltung

| Befehl | Version | Beschreibung |
|--------|---------|--------------|
| `/clear` | Alle | Kontext zwischen nicht zusammenhängenden Aufgaben löschen |
| `/compact` | Alle | Kontext proaktiv komprimieren (bei ca. 70 % Auslastung ausführen) |
| `/context` | v2.1.74+ | Umsetzbare Vorschläge zur Kontextoptimierung erhalten |
| `/effort low\|medium\|high` | v2.1.72+ | Reasoning-Aufwand des Modells je nach Aufgabenkomplexität anpassen |
| `/memory` | v2.1.59+ | Dauerhaftes Speichern von Erkenntnissen über Sitzungen und Komprimierungen hinweg |
| `/model haiku\|sonnet\|opus` | v2.1.72+ | Modell während einer Sitzung je nach Aufgabenkomplexität wechseln |

### Sitzungsbefehle

| Befehl | Version | Beschreibung |
|--------|---------|--------------|
| `/loop [interval] [befehl]` | v2.1.71+ | Wiederkehrende Aufgaben ausführen (z. B. `/loop 5m /common:pre-commit-check`) |
| `/proactive` | v2.1.105+ | Alias für `/loop` |
| `/color` | v2.1.94+ | Farbschema des Terminals ändern |
| `/rename` | v2.1.94+ | Aktuelle Sitzung umbenennen |
| `/powerup` | v2.1.94+ | Power-up-Funktionen aktivieren |

### Verwendungsbeispiele

```bash
# Aufwand für eine einfache Suche anpassen
/effort low

# Zu einem günstigeren Modell für die Erkundung wechseln
/model sonnet

# Wiederkehrendes CI-Monitoring einrichten
/loop 5m "Check if CI pipeline passed"

# Wichtigen Kontext vor der Komprimierung speichern
/memory "Authentication uses JWT with RS256, refresh tokens in HttpOnly cookies"
```

---

## Hook-Ereignisse

Claude Code unterstützt 24 Hook-Ereignisse (8 davon wurden in neueren Claude Code-Versionen hinzugefügt), um Workflows zu automatisieren:

### Alle Hook-Ereignisse

| Ereignis | Zeitpunkt | Anwendungsfall |
|----------|-----------|----------------|
| **PreToolUse** | Vor der Werkzeugausführung | Gefährliche Befehle blockieren, mit RTK umschreiben |
| **PostToolUse** | Nach der Werkzeugausführung | Ausführliche Ausgabe filtern, Ergebnisse zusammenfassen |
| **PreCompact** | Vor der Kontextkomprimierung | Kritischen Kontext speichern; Exit-Code 2 blockiert Komprimierung (v2.1.105+) |
| **PostCompact** | Nach der Kontextkomprimierung | Wesentlichen Kontext erneut einschleusen |
| **SessionStart** | Beim Sitzungsstart | Wesentliche Kontextdaten laden, Umgebung einrichten |
| **StopFailure** | Bei unerwartetem Stopp | Zustand speichern, bei Fehlern warnen |
| **Notification** | Bei Benachrichtigungsereignissen | Benutzerdefinierte Benachrichtigungen |
| **TaskCreated** | Wenn eine Unteragenten-Aufgabe erstellt wird | Unteragenten-Arbeit verfolgen |
| **CwdChanged** | Änderung des Arbeitsverzeichnisses | Umgebung je nach Verzeichnis aktualisieren |
| **FileChanged** | Dateiänderung erkannt | Neuerstellungen und Linting auslösen |
| **PermissionDenied** | Berechtigungsprüfung schlägt fehl | Sicherheitsereignisse protokollieren |
| **Elicitation** | Vor der Benutzeraufforderung | Elicitation-Ablauf anpassen |
| **ElicitationResult** | Nach der Benutzerantwort | Elicitation-Ergebnisse verarbeiten |
| **Stop** | Bei Sitzungsende | Aufräumen |

### Hook-Erweiterungen (v8.7)

| Funktion | Beschreibung |
|----------|--------------|
| **Bedingtes `if`** | Hooks nur ausführen, wenn die Bedingung zutrifft |
| **`defer`** | Ausführung des Hooks verschieben, um Blockierungen zu vermeiden |
| **PreCompact-Blockierung** | Exit-Code 2 im PreCompact-Hook blockiert die Komprimierung (v2.1.105+) |

### Beispiel: PostToolUse-Ausgabefilter

```json
{
  "hooks": {
    "PostToolUse": [{
      "matcher": "Bash",
      "hooks": [{
        "type": "command",
        "command": "echo '$TOOL_OUTPUT' | head -100"
      }]
    }]
  }
}
```

---

## Agent-Frontmatter

Benutzerdefinierte Agenten (v2.1.78+) unterstützen Frontmatter-Felder, um Verhalten und Kosten zu steuern:

```yaml
---
effort: low          # Reasoning-Aufwand (low/medium/high)
maxTurns: 10         # Maximale Anzahl von Gesprächsrunden
disallowedTools:     # Werkzeuge, die der Agent nicht verwenden darf
  - Edit
  - Write
---
```

| Feld | Typ | Beschreibung |
|------|-----|--------------|
| `effort` | string | `low`, `medium` oder `high` Reasoning-Aufwand |
| `maxTurns` | number | Maximale Anzahl von Runden vor dem Stopp |
| `disallowedTools` | list | Werkzeuge, die dem Agenten nicht erlaubt sind |

Dies ist nützlich, um kostengünstige Erkundungsagenten zu erstellen, die Code lesen, aber nicht ändern können.

---

## MCP Tool Search

MCP Tool Search (v2.1.80+) ermöglicht das verzögerte Laden von MCP-Werkzeugen und reduziert den Kontextverbrauch um 95 %:

| Ansatz | Kontextkosten |
|--------|--------------|
| MCP klassisch (alle Werkzeuge geladen) | ~500–2000 Token/Werkzeug/Runde |
| MCP mit Tool Search (lazy) | ~50 Token insgesamt |

### Verwendung

```bash
# Ein bestimmtes Werkzeug bei Bedarf laden
ToolSearch with query: "select:tool_name"

# Nach Schlüsselwort suchen
ToolSearch with query: "slack send"
```

Anstatt alle MCP-Server-Werkzeuge beim Start zu laden, lädt Tool Search sie nur bei Bedarf.

---

## Auto-Modus

Der Auto-Modus (v2.1.94+) ist ein KI-gestützter Berechtigungsklassifikator, der `--dangerously-skip-permissions` sicherer ersetzt:

| Modus | Schutz | Geschwindigkeit | Anwendungsfall |
|-------|--------|-----------------|----------------|
| Manuell | Maximum | Langsam | Geprüfte Workflows, hohe Sicherheit |
| Auto-Modus | Hoch | Schnell | Vertrauenswürdige Entwicklungs-Workflows |
| Berechtigungen überspringen | Minimal | Maximum | Nur lokale/persönliche Projekte |

**Sicherheitsfunktionen:**
- Ein Sicherheitsmodell im Hintergrund bewertet jeden Werkzeugaufruf
- Sichere Operationen (Lesen, Tests) werden automatisch genehmigt
- Riskante Aktionen (Massenlöschung, Exfiltration) werden blockiert
- 3 aufeinanderfolgende Blockierungen setzen den Modus auf manuell zurück
- Mehr als 20 Blockierungen in einer Sitzung setzen auf den vollständigen manuellen Modus zurück

Verfügbar für Team-Pläne mit Administratorgenehmigung.

---

## Hook-Vorlagen

Claude-Craft stellt fertig verwendbare Hook-Vorlagen in `.claude/templates/hooks/` bereit:

| Vorlage | Zweck |
|---------|-------|
| `output-filter.json` | PostToolUse-Filter für große CLI-Ausgaben |
| `pre-compact.json` | PreCompact-Hook zum Bewahren von kritischem Kontext |
| `context-reinject.json` | SessionStart-Hook zur erneuten Kontexteinschleusung nach der Komprimierung |

### Installation

Vorlagen in die `.claude/settings.json` des Projekts kopieren oder in die Hook-Konfiguration einbinden:

```bash
# Verfügbare Vorlagen anzeigen
ls .claude/templates/hooks/

# Auf das Projekt anwenden (manuell in settings.json einbinden)
cat .claude/templates/hooks/output-filter.json
```

---

## Verwaltete Einstellungen

Das Verzeichnis `managed-settings.d/` (v2.1.83+) ermöglicht eine modulare Konfiguration durch alphabetisches Zusammenführen:

```
.claude/
  managed-settings.d/
    00-base.json          # Grundkonfiguration
    10-security.json      # Sicherheitsregeln
    20-team.json          # Team-Einstellungen
```

Dateien werden in alphabetischer Reihenfolge zusammengeführt, sodass Teams Konfigurationen schichten können, ohne Konflikte zu erzeugen.

---

## MultiAccount-Manager

Mehrere Claude Code-Profile für verschiedene Konten oder Kontexte verwalten.

### Zweck

- Zwischen Claude-Konten wechseln (persönlich, Arbeit, Kunde)
- Ratenbegrenzungen durch Profilwechsel steuern
- Projektkontexte isoliert halten
- Konfigurationen teilen oder isolieren

### Installation

```bash
# Über Makefile
make install-multiaccount

# Oder manuell
cp Tools/MultiAccount/claude-accounts.sh ~/.local/bin/
chmod +x ~/.local/bin/claude-accounts.sh
```

### Verwendung

#### Interaktiver Modus

```bash
# Interaktives Menü starten
./claude-accounts.sh
# Oder wenn global installiert
claude-accounts.sh
```

Menüoptionen:
```
1. Profile auflisten
2. Profil hinzufügen
3. Profil löschen
4. Profil authentifizieren
5. Claude Code starten
6. ccsp()-Funktion installieren
7. Veraltetes Profil migrieren
8. Hilfe
9. Beenden
```

#### CLI-Modus

```bash
# Alle Profile auflisten
./claude-accounts.sh list

# Neues Profil hinzufügen
./claude-accounts.sh add <profilname>

# Profil entfernen
./claude-accounts.sh remove <profilname>

# Profil authentifizieren
./claude-accounts.sh auth <profilname>

# Claude Code mit Profil starten
./claude-accounts.sh launch <profilname>

# Hilfe anzeigen
./claude-accounts.sh --help
```

### Profilmodi

#### Gemeinsamer Modus (Standard)

Das Profil teilt die Konfiguration mit dem Hauptverzeichnis `~/.claude`:

```bash
./claude-accounts.sh add work --mode=shared
```

- Einstellungen per Symlink mit `~/.claude` verknüpft
- Geeignet für: Kontowechsel bei beibehaltenen Einstellungen
- Anwendungsfall: Ratenbegrenzungsverwaltung

#### Isolierter Modus

Das Profil hat eine vollständig unabhängige Konfiguration:

```bash
./claude-accounts.sh add client-a --mode=isolated
```

- Unabhängige Kopie der Einstellungen
- Geeignet für: Kundenarbeit mit separaten Regeln
- Anwendungsfall: Unterschiedliche Projektkonfigurationen

### Schneller Profilwechsel

Die Shell-Funktion `ccsp()` installieren:

```bash
# Über Menüoption 6 zum Profil hinzufügen
# Oder manuell in ~/.bashrc oder ~/.zshrc eintragen:

ccsp() {
    if [ -z "$1" ]; then
        claude-accounts.sh list
    else
        export CLAUDE_CONFIG_DIR="$HOME/.claude-profiles/$1"
        echo "Switched to profile: $1"
    fi
}
```

Verwendung:
```bash
# Profile auflisten
ccsp

# Zu einem Profil wechseln
ccsp work

# Claude Code starten (verwendet aktuelles Profil)
claude
```

### Profilstruktur

```
~/.claude-profiles/
├── work/
│   ├── .mode              # "shared" oder "isolated"
│   ├── config/            # Claude-Konfiguration
│   └── settings.json      # Profileinstellungen
├── client-a/
│   └── ...
└── personal/
    └── ...
```

### Sprachunterstützung

```bash
# In einer bestimmten Sprache verwenden
./claude-accounts.sh --lang=fr list
./claude-accounts.sh --lang=es add trabajo
./claude-accounts.sh --lang=de --help
```

---

## StatusLine

Kontextbezogene Informationen in der Statusleiste von Claude Code anzeigen.

### Zweck

- Aktuelles Profil anzeigen
- Verwendetes Modell anzeigen
- Git-Branch und -Status anzeigen
- Kontextauslastung in Prozent verfolgen
- Sitzungs- und Wochenkosten überwachen
- Nutzungslimits anzeigen

### Installation

```bash
# Über Makefile
make install-statusline

# Oder manuell
cp Tools/StatusLine/statusline.sh ~/.claude/statusline.sh
cp Tools/StatusLine/statusline.conf.example ~/.claude/statusline.conf
chmod +x ~/.claude/statusline.sh
```

### Claude Code konfigurieren

In `~/.claude/settings.json` einfügen:

```json
{
  "statusLine": {
    "type": "command",
    "command": "~/.claude/statusline.sh"
  }
}
```

### Format der Statusleiste

```
🔑 pro | 🧠 Opus | 🌿 main +2~1 | 📁 my-project | 📊 45% | ⏱️ 5h: 23% | 📅 Sem: 45% | 💰 $0.42 | 🕐 14:32
```

| Element | Beschreibung |
|---------|--------------|
| 🔑 pro | Name des aktiven Profils |
| 🧠 Opus | Aktuelles Modell (🧠 Opus, 🎵 Sonnet, 🍃 Haiku) |
| 🌿 main +2~1 | Git-Branch + Status (+bereitgestellt ~geändert ?unverfolgt) |
| 📁 my-project | Name des Projektverzeichnisses |
| 📊 45% | Auslastung des Kontextfensters |
| ⏱️ 5h: 23% | Auslastungsprozentsatz der Sitzung (5h) |
| 📅 Sem: 45% | Wöchentlicher Auslastungsprozentsatz |
| 💰 $0.42 | Sitzungskosten |
| 🕐 14:32 | Aktuelle Uhrzeit |

### Farbkodierung

Auslastungsanzeigen wechseln die Farbe je nach Schwellenwert:

| Farbe | Bedeutung | Schwellenwert |
|-------|-----------|---------------|
| Grün | Geringe Auslastung | < 60 % |
| Gelb | Mittlere Auslastung | 60–80 % |
| Rot | Hohe Auslastung | > 80 % |

### Konfiguration

`~/.claude/statusline.conf` bearbeiten:

```bash
# =============================================================================
# NUTZUNGSLIMITS
# =============================================================================
# Empfohlene Werte nach Plan:
#   - Pro ($20/Monat)     : SESSION=25,   WEEKLY=150
#   - Max 5x ($100/Monat) : SESSION=125,  WEEKLY=750
#   - Max 20x ($200/Monat): SESSION=500,  WEEKLY=3000

SESSION_COST_LIMIT=500.00
WEEKLY_COST_LIMIT=3000.00

# =============================================================================
# WARNSCHWELLEN (Prozentsatz)
# =============================================================================
USAGE_WARN_THRESHOLD=60    # Gelb bei 60 %
USAGE_CRIT_THRESHOLD=80    # Rot bei 80 %

# =============================================================================
# CACHE (Leistung)
# =============================================================================
SESSION_CACHE_TTL=60       # Sitzung alle 60 s aktualisieren
WEEKLY_CACHE_TTL=300       # Wöchentlich alle 5 min aktualisieren

# =============================================================================
# ANZEIGEOPTIONEN
# =============================================================================
SHOW_SESSION_LIMIT=true
SHOW_WEEKLY_LIMIT=true

# Benutzerdefinierte Bezeichnungen
SESSION_LABEL="⏱️ 5h"
WEEKLY_LABEL="📅 Sem"
```

### Abhängigkeiten

```bash
# Erforderlich: jq (JSON-Prozessor)
# macOS
brew install jq

# Linux
sudo apt install jq

# Optional: ccusage (Kostenverfolgung)
npm install -g ccusage
```

### Fehlerbehebung

**Statusleiste wird nicht angezeigt:**
```bash
# Prüfen, ob das Skript ausführbar ist
ls -la ~/.claude/statusline.sh

# Manuell testen
echo '{"model":{"display_name":"Test"}}' | ~/.claude/statusline.sh
```

**Kosten zeigen $0.00:**
```bash
# Prüfen, ob ccusage funktioniert
npx ccusage daily --json
```

**Auslastungsprozentsätze werden nicht angezeigt:**
```bash
# Cache-Dateien prüfen
ls -la /tmp/.ccusage_*

# Cache leeren, um zu aktualisieren
rm /tmp/.ccusage_*
```

---

## ProjectConfig-Manager

Claude-Craft-Projektkonfigurationen über YAML verwalten.

### Zweck

- Projekteinstellungen in YAML definieren
- Mehrere Projekte verwalten
- Monorepo-Konfigurationen verwalten
- Konfigurationen validieren
- Regeln aus der Konfiguration installieren

### Installation

```bash
# Über Makefile
make install-projectconfig

# Oder manuell
cp Tools/ProjectConfig/claude-projects.sh ~/.local/bin/
chmod +x ~/.local/bin/claude-projects.sh
```

### Abhängigkeiten

```bash
# Erforderlich: yq (YAML-Prozessor)
# macOS
brew install yq

# Linux (snap)
sudo snap install yq

# Linux (Binärdatei)
wget https://github.com/mikefarah/yq/releases/latest/download/yq_linux_amd64 -O /usr/local/bin/yq
chmod +x /usr/local/bin/yq
```

### Verwendung

#### Interaktiver Modus

```bash
./claude-projects.sh
```

Menüoptionen:
```
1. Projekte auflisten
2. Projekt hinzufügen
3. Projekt bearbeiten
4. Modul hinzufügen
5. Projekt löschen
6. Konfiguration validieren
7. Projekt installieren
8. Hilfe
9. Beenden
```

#### CLI-Modus

```bash
# Konfigurierte Projekte auflisten
./claude-projects.sh list

# Konfigurationsdatei validieren
./claude-projects.sh validate [konfigurationsdatei]

# Bestimmtes Projekt installieren
./claude-projects.sh install <projektname>

# Alle Projekte installieren
./claude-projects.sh install-all

# Projektdetails anzeigen
./claude-projects.sh show <projektname>

# Neues Projekt hinzufügen
./claude-projects.sh add <projektname> <pfad>

# Projekt entfernen
./claude-projects.sh remove <projektname>
```

### Konfigurationsdatei

Standardspeicherort: `./claude-projects.yaml`

```yaml
settings:
  default_lang: "fr"

projects:
  - name: "my-saas"
    description: "SaaS platform"
    path: "~/Projects/my-saas"
    modules:
      - name: "api"
        path: "backend"
        technologies: ["symfony"]
      - name: "web"
        path: "frontend"
        technologies: ["react"]
      - name: "mobile"
        path: "app"
        technologies: ["flutter"]

  - name: "internal-tool"
    path: "~/Projects/internal"
    technologies: ["python"]
    lang: "en"
```

### Validierung

```bash
# Konfiguration validieren
./claude-projects.sh validate

# Oder über Makefile
make config-validate CONFIG=claude-projects.yaml
```

Validierungsprüfungen:
- YAML-Syntax gültig
- Pflichtfelder vorhanden
- Pfade vorhanden
- Technologien gültig
- Sprachen gültig

### Installation aus der Konfiguration

```bash
# Einzelnes Projekt installieren
./claude-projects.sh install my-saas

# Oder über Makefile
make config-install CONFIG=claude-projects.yaml PROJECT=my-saas

# Alle Projekte installieren
make config-install-all CONFIG=claude-projects.yaml

# Probelauf (Dry run)
make config-install CONFIG=claude-projects.yaml PROJECT=my-saas OPTIONS="--dry-run"
```

### Sprachunterstützung

```bash
# In einer bestimmten Sprache verwenden
./claude-projects.sh --lang=fr list
./claude-projects.sh --lang=de validate
```

---

## Installation

### Alle Werkzeuge installieren

```bash
make install-tools
```

Dies installiert:
- MultiAccount-Manager
- StatusLine
- ProjectConfig-Manager

### Einzelne Werkzeuge installieren

```bash
# Nur MultiAccount
make install-multiaccount

# Nur StatusLine
make install-statusline

# Nur ProjectConfig
make install-projectconfig
```

### Installation überprüfen

```bash
# MultiAccount prüfen
which claude-accounts.sh
claude-accounts.sh --version

# StatusLine prüfen
ls ~/.claude/statusline.sh
cat ~/.claude/settings.json | jq '.statusLine'

# ProjectConfig prüfen
which claude-projects.sh
claude-projects.sh --version
```

---

## Kurzreferenz

### MultiAccount-Befehle

| Befehl | Beschreibung |
|--------|--------------|
| `list` | Alle Profile anzeigen |
| `add <name>` | Neues Profil erstellen |
| `remove <name>` | Profil löschen |
| `auth <name>` | Profil authentifizieren |
| `launch <name>` | Claude mit Profil starten |
| `migrate` | Veraltetes Profil konvertieren |

### StatusLine-Elemente

| Emoji | Bedeutung |
|-------|-----------|
| 🔑 | Profil |
| 🧠 | Opus-Modell |
| 🎵 | Sonnet-Modell |
| 🍃 | Haiku-Modell |
| 🌿 | Git-Branch |
| 📁 | Projekt |
| 📊 | Kontext % |
| ⏱️ | Sitzungsauslastung |
| 📅 | Wöchentliche Auslastung |
| 💰 | Kosten |
| 🕐 | Uhrzeit |

### ProjectConfig-Befehle

| Befehl | Beschreibung |
|--------|--------------|
| `list` | Alle Projekte anzeigen |
| `validate` | Konfigurationsgültigkeit prüfen |
| `install <name>` | Projektregeln installieren |
| `install-all` | Alle Projekte installieren |
| `show <name>` | Projektdetails anzeigen |
| `add <name> <pfad>` | Neues Projekt hinzufügen |
| `remove <name>` | Projekt löschen |

---

[&larr; Fehlerbehebung bei Bugs](04-bug-fixing.md) | [Problemlösung &rarr;](06-troubleshooting.md)
