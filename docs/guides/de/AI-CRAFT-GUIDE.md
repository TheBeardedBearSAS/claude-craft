# AI Craft Benutzerhandbuch
# Multi-AI-Entwicklungsframework

## Inhaltsverzeichnis

1. [Einführung](#einführung)
2. [Installation](#installation)
3. [Erste Schritte](#erste-schritte)
4. [Provider-Konfiguration](#provider-konfiguration)
5. [MCP-Server](#mcp-server)
6. [Hooks](#hooks)
7. [Gemeinsamer Speicher](#gemeinsamer-speicher)
8. [Migration von Claude Craft](#migration-von-claude-craft)
9. [Befehlsreferenz](#befehlsreferenz)
10. [Best Practices](#best-practices)
11. [Fehlerbehebung](#fehlerbehebung)

---

## Einführung

AI Craft ist ein umfassendes Multi-AI-Entwicklungsframework, das die bewährte Claude-Craft-Methodik erweitert, um nahtlos mit mehreren KI-Providern zusammenzuarbeiten. Egal, ob du **Vibe (Mistral AI)**, **Codex (OpenAI)**, **OpenCode (sst/opencode)**, **Claude Code (Anthropic)** oder **Cursor CLI** verwendest, AI Craft bietet eine einheitliche Schnittstelle zur Installation von Regeln, Agenten, Befehlen und Workflows.

> **GitHub Copilot wird derzeit nicht unterstützt** — es gibt keine `copilot-provider.js` in `cli/lib/provider/`. Die GitHub Copilot CLI (`github.com/github/copilot-cli`) ist ein reales, eigenständiges Produkt, das künftig als weiterer Provider hinzugefügt werden könnte.

### Hauptfunktionen

- ✅ **Multi-Provider-Unterstützung**: Funktioniert mit Vibe, Codex, OpenCode, Claude Code, Cursor und weiteren
- ✅ **MCP-Integration**: Vollständige Unterstützung des Model Context Protocol mit Auto-Discovery
- ✅ **Gemeinsamer Speicher**: Konversationsverlauf und Kontext werden providerübergreifend geteilt
- ✅ **Hook-System**: Pre-/Post-Befehls- und Nachrichten-Hooks für jeden Provider
- ✅ **Abwärtskompatibel**: 100% kompatibel mit bestehenden Claude-Craft-Projekten
- ✅ **Einfache Migration**: Automatisches Migrationstool für Claude-Craft-Projekte

### Architektur

```
┌─────────────────────────────────────────────────────────────┐
│                    AI Craft CLI                                │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │   Vibe      │  │   Codex      │  │    OpenCode         │  │
│  │ (Mistral)   │  │ (OpenAI)     │  │ (sst/opencode)      │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
│  ┌─────────────┐  ┌─────────────┐                          │
│  │   Claude    │  │   Cursor     │                          │
│  │ (Anthropic) │  │ (CLI)        │                          │
│  └─────────────┘  └─────────────┘                          │
└─────────────────────────────────────────────────────────────┘
         │              │              │
         ▼              ▼              ▼
┌─────────────────────────────────────────────────────────────┐
│                 Gemeinsamer Speicher & MCP                    │
├─────────────────────────────────────────────────────────────┤
│  • Konversationsverlauf                                        │
│  • Projektkontext                                              │
│  • Benutzereinstellungen                                       │
│  • MCP-Server (filesystem, git, process, custom)               │
└─────────────────────────────────────────────────────────────┘
```

---

## Installation

### Globale Installation

```bash
# AI Craft global installieren
npm install -g @ai-craft/core

# Installation verifizieren
ai-craft --version
# Ausgabe: 9.0.0
```

### Lokale Installation (in einem Projekt)

```bash
# AI Craft in deinem Projekt initialisieren
npx @ai-craft/core init-ai-craft

# Oder in einem bestimmten Verzeichnis installieren
npx @ai-craft/core install ./my-project
```

### Aus dem Quellcode

```bash
# Repository klonen
git clone https://github.com/TheBeardedBearSAS/ai-craft.git
cd ai-craft

# Abhängigkeiten installieren
npm install

# Global verlinken
npm link

# Ausführen
ai-craft --version
```

---

## Erste Schritte

### Schnellstart

```bash
# Zu deinem Projekt navigieren
cd my-project

# AI Craft initialisieren
ai-craft init-ai-craft

# Verfügbare KI-Provider auflisten
ai-craft providers

# Deinen bevorzugten Provider festlegen
ai-craft use vibe

# Regeln für deinen Tech-Stack installieren
ai-craft install --tech=symfony
```

### Projektstruktur

Nach der Initialisierung hat dein Projekt die folgende Struktur:

```
my-project/
├── .ai-craft/                    # AI Craft Konfiguration
│   ├── AI-CRAFT.md              # Haupt-KI-Anweisungen
│   ├── ai-craft.yaml            # Konfigurationsdatei
│   ├── providers/               # Providerspezifische Konfigurationen
│   │   ├── vibe/
│   │   │   ├── config/
│   │   │   │   └── default.yaml
│   │   │   ├── hooks/
│   │   │   │   ├── pre-execute.sh
│   │   │   │   └── post-execute.sh
│   │   │   └── mcp/
│   │   ├── codex/
│   │   ├── opencode/
│   │   ├── claude/
│   │   └── cursor/
│   ├── rules/                   # KI-Regeln
│   ├── agents/                  # KI-Agenten
│   ├── commands/                # Slash-Befehle
│   ├── skills/                  # Community-Skills
│   ├── templates/               # Projektvorlagen
│   ├── memory/                  # Gemeinsamer Speicher
│   │   ├── conversations/
│   │   ├── project-state.json
│   │   └── user-preferences.json
│   └── mcp/                     # Globale MCP-Server
└── .claude/                     # Symlink zu .ai-craft/ (abwärtskompatibel)
```

### Verwendung mit verschiedenen Providern

```bash
# Alle verfügbaren Provider auflisten
ai-craft providers

# Provider-Gesundheitsstatus anzeigen
ai-craft provider-status

# Standard-Provider für dieses Projekt festlegen
ai-craft use vibe

# Provider für einen einzelnen Befehl überschreiben
ai-craft --provider=codex install ./my-project
```

---

## Provider-Konfiguration

### Konfiguration anzeigen

```bash
# Aktuelle Konfiguration anzeigen
ai-craft config show

# Einen bestimmten Wert abrufen
ai-craft config show | grep primary
```

### Konfiguration festlegen

```bash
# Standard-Provider festlegen
ai-craft config set providers.primary vibe

# Modell-Routing festlegen
ai-craft config set optimization.model_routing auto

# Speichereinstellungen festlegen
ai-craft config set memory.enabled true
```

### Providerspezifische Konfiguration

Jeder Provider hat seine eigene Konfigurationsdatei unter `.ai-craft/providers/<name>/config/default.yaml`:

**Beispiel Vibe-Konfiguration:**
```yaml
provider:
  name: vibe
  display_name: "Vibe (Mistral AI)"
  binary: "vibe"

model:
  default: "mistral-large-3.5"
  aliases:
    opus: "mistral-large-3.5"
    sonnet: "mistral-medium-3.5"
    haiku: "mistral-small-3.5"

mcp:
  enabled: true
  servers:
    filesystem: true
    git: true
    process: true
```

**Provider-Modelle ändern:**
```yaml
model:
  default: "mistral-large-3.5"
  routing:
    architecture: "mistral-large-3.5"
    code_review: "mistral-medium-3.5"
    implementation: "mistral-medium-3.5"
    quick: "mistral-small-3.5"
```

---

## MCP-Server

### Was ist MCP?

MCP (Model Context Protocol) ist ein Standard zur Verbindung von KI-Modellen mit Tools, APIs und Datenquellen. AI Craft unterstützt MCP-Server über alle Provider hinweg und ermöglicht so konsistenten Tool-Zugriff, unabhängig davon, welche KI du verwendest.

### Integrierte MCP-Server

Jeder Provider wird mit integrierten MCP-Servern ausgeliefert:

| Server | Beschreibung | Vibe | Codex | OpenCode | Claude | Cursor |
|--------|-------------|------|-------|----------|--------|--------|
| filesystem | Dateisystemzugriff | ✅ | ✅ | ✅ | ✅ | ✅ |
| git | Git-Repository-Zugriff | ✅ | ✅ | ✅ | ✅ | ✅ |
| process | Prozessausführung | ✅ | ❌ | ✅ | ❌ | ❌ |

### MCP-Server verwalten

```bash
# Alle MCP-Server für den aktuellen Provider auflisten
ai-craft mcp list

# Einen benutzerdefinierten MCP-Server hinzufügen
ai-craft mcp add my-server --command="npx" --args="-y,@modelcontextprotocol/server-postgres" --description="PostgreSQL access"

# Alle MCP-Server starten
ai-craft mcp start
```

### Benutzerdefinierte MCP-Server-Konfiguration

Erstelle eine JSON-Datei in `.ai-craft/providers/<name>/mcp/` oder `.ai-craft/mcp/`:

```json
{
  "name": "postgres",
  "description": "PostgreSQL database access",
  "command": "npx",
  "args": ["-y", "@modelcontextprotocol/server-postgres"],
  "env": {
    "DATABASE_URL": "postgresql://user:password@localhost:5432/db"
  },
  "timeout": 30,
  "enabled": true,
  "auto_start": true
}
```

### Gängige MCP-Server

- `@modelcontextprotocol/server-filesystem` - Dateisystemzugriff
- `@modelcontextprotocol/server-git` - Git-Repository-Zugriff
- `@modelcontextprotocol/server-process` - Prozessausführung
- `@modelcontextprotocol/server-sqlite` - SQLite-Datenbankzugriff
- `@modelcontextprotocol/server-postgres` - PostgreSQL-Zugriff

---

## Hooks

Hooks ermöglichen es dir, benutzerdefinierte Skripte vor und nach KI-Befehlen auszuführen. Sie sind nützlich für:

- Umgebungsvalidierung
- Logging
- Benutzerdefinierte Vorverarbeitung
- Nachverarbeitung von Antworten
- Fehlerbehandlung

### Hook-Typen

1. **pre-execute.sh** - Wird vor jeder Befehlsausführung ausgeführt
2. **post-execute.sh** - Wird nach der Befehlsausführung ausgeführt
3. **pre-message.sh** - Wird vor dem Senden einer Nachricht ausgeführt
4. **post-message.sh** - Wird nach Empfang einer Antwort ausgeführt

### Hook-Speicherort

Hooks befinden sich unter `.ai-craft/providers/<name>/hooks/`:

```
.ai-craft/
└── providers/
    └── vibe/
        └── hooks/
            ├── pre-execute.sh
            └── post-execute.sh
```

### Beispiel-Hook: pre-execute.sh

```bash
#!/bin/bash
# AI Craft - Vibe Provider Pre-Execute Hook

# Prüfen, ob der API-Schlüssel gesetzt ist
if [[ -z "${MISTRAL_API_KEY:-}" ]]; then
  echo "⚠️  MISTRAL_API_KEY not set" >&2
  exit 1
fi

# System-Prompt aus AI-CRAFT.md setzen
if [[ -f ".ai-craft/AI-CRAFT.md" ]]; then
  export VIBE_SYSTEM_PROMPT="$(cat .ai-craft/AI-CRAFT.md)"
fi

exit 0
```

### Eigene Hooks erstellen

1. Ein Hooks-Verzeichnis erstellen:
```bash
mkdir -p .ai-craft/providers/vibe/hooks
```

2. Dein Hook-Skript erstellen:
```bash
cat > .ai-craft/providers/vibe/hooks/pre-execute.sh << 'EOF'
#!/bin/bash
# My custom pre-execute hook
echo "Running custom pre-execute hook..."
# Add your custom logic here
exit 0
EOF
chmod +x .ai-craft/providers/vibe/hooks/pre-execute.sh
```

3. Den Hook in der Konfiguration aktivieren:
```yaml
# In .ai-craft/providers/vibe/config/default.yaml
hooks:
  enabled: true
  pre_command:
    - "pre-execute.sh"
    - "custom-pre-execute.sh"
  post_command:
    - "post-execute.sh"
```

---

## Gemeinsamer Speicher

AI Craft bietet ein gemeinsames Speichersystem, das es verschiedenen Providern ermöglicht, Folgendes zu teilen:

- **Konversationen**: Nachrichtenverlauf providerübergreifend
- **Projektkontext**: Geteilte Projektinformationen
- **Benutzereinstellungen**: Benutzerspezifische Einstellungen
- **Cache**: Temporäre Datenspeicherung

### Verwendung des gemeinsamen Speichers

```bash
# Der Speicher ist automatisch über die AI Craft CLI verfügbar
# Du kannst programmatisch in deinen Skripten darauf zugreifen
```

### Programmatischer Zugriff

```javascript
import { memoryManager } from '@ai-craft/core/cli/lib/memory.js';

// Eine Konversation abrufen oder erstellen
const conversation = memoryManager.getConversation('session-1', {
  provider: 'vibe',
  model: 'mistral-large-3.5'
});

// Nachrichten hinzufügen
memoryManager.addMessage('session-1', {
  role: 'user',
  content: 'Hello!'
});

// Konversationsverlauf abrufen
const history = memoryManager.getHistory('session-1', 10);

// Benutzereinstellungen festlegen
memoryManager.setPreference('theme', 'dark');
const theme = memoryManager.getPreference('theme');

// Cache verwenden
memoryManager.setCache('temp-data', { foo: 'bar' }, 60000); // 60s TTL
const data = memoryManager.getCache('temp-data');
```

### Speicherstruktur

```
.ai-craft/memory/
├── conversations/           # Konversationsverlauf (JSON-Dateien)
│   ├── session-1.json
│   └── session-2.json
├── project-state.json      # Projektkontext und -zustand
└── user-preferences.json   # Benutzereinstellungen
```

---

## Migration von Claude Craft

AI Craft bietet eine nahtlose Migration von Claude-Craft-Projekten.

### Automatische Migration

```bash
# Zu deinem Claude-Craft-Projekt navigieren
cd my-claude-craft-project

# Die Migration ausführen
npx @ai-craft/core migrate

# Oder den init-Befehl verwenden
npx @ai-craft/core init-ai-craft
```

### Was migriert wird

| Komponente | Migrationsstatus | Hinweise |
|-----------|-----------------|-------|
| `.claude/CLAUDE.md` | ✅ Migriert | → `.ai-craft/AI-CRAFT.md` |
| `.claude/settings.json` | ✅ Migriert | Einstellungen für Multi-Provider angepasst |
| `.claude/context.yaml` | ✅ Migriert | → `.ai-craft/ai-craft.yaml` |
| `.claude/rules/` | ✅ Migriert | Kopiert nach `.ai-craft/rules/` |
| `.claude/agents/` | ✅ Migriert | Kopiert nach `.ai-craft/agents/` |
| `.claude/commands/` | ✅ Migriert | Kopiert nach `.ai-craft/commands/` |
| `.claude/skills/` | ✅ Migriert | Kopiert nach `.ai-craft/skills/` |
| `.claude/templates/` | ✅ Migriert | Kopiert nach `.ai-craft/templates/` |
| `.claude/mcp/` | ✅ Migriert | Kopiert nach `.ai-craft/mcp/` |
| `.claude/` Symlink | ✅ Erstellt | Zeigt zur Abwärtskompatibilität auf `.ai-craft/` |

### Manuelle Migrationsschritte

Wenn du lieber manuell migrieren möchtest:

1. Verzeichnis `.ai-craft/` erstellen
2. Alle Dateien von `.claude/` nach `.ai-craft/` kopieren
3. `CLAUDE.md` in `AI-CRAFT.md` umbenennen
4. Referenzen von `.claude/` auf `.ai-craft/` aktualisieren
5. Providerspezifische Verzeichnisse erstellen
6. Symlink erstellen: `ln -s .ai-craft .claude`

### Nach der Migration

Nach der Migration kannst du:

```bash
# Die Migration verifizieren
ai-craft doctor

# Deinen bevorzugten Provider festlegen
ai-craft use vibe

# Provider-Status prüfen
ai-craft provider-status

# AI Craft nutzen
npx @ai-craft/core install --tech=symfony
```

---

## Befehlsreferenz

### Hauptbefehle

| Befehl | Beschreibung |
|---------|-------------|
| `ai-craft --version` | Version anzeigen |
| `ai-craft --help` | Hilfe anzeigen |
| `ai-craft install` | Interaktive Installation |
| `ai-craft install <path>` | In einem bestimmten Verzeichnis installieren |
| `ai-craft install --auto` | Automatische Installation (ohne Rückfragen) |
| `ai-craft install --tech=<name>` | Für eine bestimmte Technologie installieren |
| `ai-craft init-ai-craft` | AI Craft initialisieren |

### Provider-Befehle

| Befehl | Beschreibung |
|---------|-------------|
| `ai-craft providers` | Alle Provider auflisten |
| `ai-craft provider-status` | Provider-Gesundheit anzeigen |
| `ai-craft use <provider>` | Standard-Provider festlegen |
| `ai-craft --provider=<name> <cmd>` | Provider für einen Befehl überschreiben |

### MCP-Befehle

| Befehl | Beschreibung |
|---------|-------------|
| `ai-craft mcp list` | MCP-Server auflisten |
| `ai-craft mcp add <name> [options]` | Benutzerdefinierten MCP-Server hinzufügen |
| `ai-craft mcp start` | MCP-Server starten |

### Konfigurationsbefehle

| Befehl | Beschreibung |
|---------|-------------|
| `ai-craft config show` | Konfiguration anzeigen |
| `ai-craft config set <key> <value>` | Konfigurationswert festlegen |
| `ai-craft config edit` | Konfiguration im Editor bearbeiten |

### Migrationsbefehle

| Befehl | Beschreibung |
|---------|-------------|
| `ai-craft migrate` | Claude-Craft-Projekt migrieren |
| `ai-craft migrate <path>` | Projekt am angegebenen Pfad migrieren |

### Legacy-Befehle (abwärtskompatibel)

Alle Claude-Craft-Befehle funktionieren weiterhin:

| Befehl | Beschreibung |
|---------|-------------|
| `claude-craft install` | Identisch mit `ai-craft install` |
| `claude-craft --version` | Identisch mit `ai-craft --version` |
| Alle `/workflow:*`-Befehle | Funktionieren weiterhin |
| Alle `/common:*`-Befehle | Funktionieren weiterhin |

### MCP-Server-Befehlsoptionen

| Option | Beschreibung | Beispiel |
|--------|-------------|---------|
| `--command=<cmd>` | Auszuführender Befehl | `--command=npx` |
| `--args=<args>` | Kommagetrennte Argumente | `--args="-y,@modelcontextprotocol/server-postgres"` |
| `--description=<desc>` | Server-Beschreibung | `--description="PostgreSQL access"` |
| `--timeout=<seconds>` | Timeout in Sekunden | `--timeout=30` |

### Konfigurationsschlüssel

Du kannst jeden Konfigurationsschlüssel per Punktnotation festlegen:

```bash
# Primären Provider festlegen
ai-craft config set providers.primary vibe

# Fallback-Provider festlegen
ai-craft config set providers.fallback[0] codex

# Speichereinstellungen festlegen
ai-craft config set memory.enabled true

# Optimierungseinstellungen festlegen
ai-craft config set optimization.prompt_caching true
```

---

## Best Practices

### 1. Klein anfangen

Beginne mit der Standardkonfiguration und füge Anpassungen schrittweise hinzu.

### 2. Providerspezifische Konfigurationen verwenden

Jeder Provider hat unterschiedliche Stärken. Konfiguriere sie entsprechend:

- **Vibe**: Hervorragend für Coding-Aufgaben, in Verbindung mit Mistral-Modellen
- **Codex**: OpenAIs Terminal-Coding-Agent, tiefe GitHub-Integration
- **OpenCode**: 75+ Cloud-Modell-Provider über Models.dev, optionales selbst gehostetes Backend
- **Claude Code**: Bewährte Zuverlässigkeit, ausgezeichnet für komplexe Aufgaben
- **Cursor CLI**: Vollständiger eigenständiger Terminal-Agent, skriptfähig in CI/SSH

### 3. MCP-Server schrittweise aktivieren

Beginne mit integrierten MCP-Servern (filesystem, git) und füge bei Bedarf benutzerdefinierte Server hinzu.

### 4. Hooks zur Validierung verwenden

Erstelle Pre-Execute-Hooks, um deine Umgebung zu validieren, bevor KI-Befehle ausgeführt werden.

### 5. Kontext zwischen Providern teilen

Nutze das gemeinsame Speichersystem, um den Kontext beim Wechsel zwischen Providern beizubehalten.

### 6. Konfiguration unter Versionskontrolle halten

Committe deine `.ai-craft/ai-craft.yaml` und Provider-Konfigurationen in die Versionskontrolle, aber schließe aus:

```
.ai-craft/memory/
.ai-craft/logs/
.ai-craft/mcp/*.json  # Falls sie API-Schlüssel enthalten
```

### 7. Regelmäßig aktualisieren

AI Craft wird aktiv weiterentwickelt. Aktualisiere regelmäßig:

```bash
npm update -g @ai-craft/core
```

---

## Fehlerbehebung

### Häufige Probleme

#### „Provider not found"

```bash
# Installierte Provider prüfen
ai-craft providers

# Fehlenden Provider installieren
# Für Vibe: npm install -g @vibe/cli
# Für Codex: npm install -g @openai/codex
# Für OpenCode: npm install -g opencode-ai
# Für Claude Code: Anthropic-Anleitung befolgen
# Für Cursor: curl https://cursor.com/install -fsS | bash
```

#### „MCP server not starting"

```bash
# Der MCP-Autostart ist noch nicht implementiert (startAllMCPServers() ist ein
# Stub, der Server registriert, ohne einen Prozess zu starten) - es gibt keine
# .ai-craft/logs/mcp.log zum Prüfen. Starte die Server vorerst manuell, siehe
# .ai-craft/providers/MCP-README.md.

# Server manuell testen
npx @modelcontextprotocol/server-filesystem --help

# Berechtigungen prüfen
ls -la .ai-craft/providers/*/mcp/
chmod +x .ai-craft/providers/*/mcp/*.json
```

#### „Hook failed"

```bash
# Hook-Logs prüfen
tail -f .ai-craft/logs/*-hooks.log

# Hook manuell testen
bash .ai-craft/providers/vibe/hooks/pre-execute.sh

# Berechtigungen korrigieren
chmod +x .ai-craft/providers/*/hooks/*.sh
```

#### „Memory not persisting"

```bash
# Prüfen, ob das Speicherverzeichnis existiert
ls -la .ai-craft/memory/

# Berechtigungen prüfen
chmod -R 755 .ai-craft/memory/
```

### Debug-Modus

Debug-Logging aktivieren:

```bash
DEBUG=ai-craft* ai-craft providers
```

### AI Craft zurücksetzen

```bash
# AI-Craft-Verzeichnis entfernen
rm -rf .ai-craft/

# Neu initialisieren
npx @ai-craft/core init-ai-craft
```

### Umgebung prüfen

```bash
# Node.js-Version prüfen (erfordert >= 22.0.0)
node --version

# npm-Version prüfen
npm --version

# AI-Craft-Version prüfen
ai-craft --version
```

---

## Support

- **Dokumentation**: [https://github.com/TheBeardedBearSAS/ai-craft](https://github.com/TheBeardedBearSAS/ai-craft)
- **Issues**: [GitHub Issues](https://github.com/TheBeardedBearSAS/ai-craft/issues)
- **Diskussionen**: [GitHub Discussions](https://github.com/TheBeardedBearSAS/ai-craft/discussions)
- **Original Claude Craft**: [https://github.com/TheBeardedBearSAS/claude-craft](https://github.com/TheBeardedBearSAS/claude-craft)

---

*AI Craft - Multi-AI-Entwicklungsframework | Version 9.0.0 | © 2026 TheBeardedCTO*
