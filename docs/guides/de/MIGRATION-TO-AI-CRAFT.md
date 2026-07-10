# 🚀 Migrationsleitfaden: Claude Craft → AI Craft

**Version:** 9.0.0
**Status:** In Arbeit
**Branch:** `refactor/ai-craft`
**Letzte Aktualisierung:** 2026-07-10

---

## 📌 Überblick

Dieses Dokument beschreibt den Migrationspfad von **Claude Craft** (Single-Provider, nur Claude Code) zu **AI Craft** (Multi-Provider, mit Unterstützung für Vibe, Codex, OpenCode, Claude Code, Cursor und GitHub Copilot).

### Aktueller Status

| Komponente | Status | Details |
|-----------|--------|---------|
| **Kernarchitektur** | ✅ Abgeschlossen | AI Provider Manager implementiert |
| **Provider-Integrationen** | ✅ 80% abgeschlossen | Vibe, Codex, OpenCode, Claude, Cursor |
| **Konfiguration** | ✅ Abgeschlossen | ai-craft.yaml, AI-CRAFT.md |
| **Dokumentation** | ✅ 70% abgeschlossen | README, AI-CRAFT.md aktualisiert |
| **Abwärtskompatibilität** | ✅ Abgeschlossen | Symlinks, Legacy-Modus |
| **Agenten-Migration** | ⏳ Nicht begonnen | 70 Agenten zu aktualisieren |
| **Befehls-Migration** | ⏳ Nicht begonnen | 220 Befehle zu verifizieren |
| **Tests** | ⏳ Nicht begonnen | Multi-Provider-Tests erforderlich |
| **Bundle-Updates** | ⏳ Nicht begonnen | vibe/, codex/, opencode/ Bundles |

---

## 🎯 Migrationsphasen

### Phase 1: Fundament (aktueller Branch)
**Branch:** `refactor/ai-craft`
**Status:** ✅ Abgeschlossen
**Dauer:** 2 Wochen (geschätzt)

#### Was erledigt ist

1. **AI Provider Manager** (`cli/lib/ai-provider.js`)
   - Basis-Provider-Klasse mit gemeinsamer Schnittstelle
   - Provider-Erkennung (Konfiguration, Umgebung, Binaries)
   - Befehlsausführung mit Fallback
   - Unterstützung für Sub-Agenten
   - MCP-Server-Verwaltung

2. **Provider-Implementierungen** (`cli/lib/provider/`)
   - `base-provider.js` - Abstrakte Basisklasse
   - `vibe-provider.js` - Mistral AI Vibe
   - `codex-provider.js` - Google Codex
   - `opencode-provider.js` - Selbst gehostetes OpenCode
   - `claude-provider.js` - Anthropic Claude Code
   - `cursor-provider.js` - Cursor (VSCode)

3. **Konfiguration**
   - `ai-craft.yaml` - Multi-Provider-Konfigurationsvorlage
   - `AI-CRAFT.md` - Kernanweisungen für alle Provider
   - Einstellungen zur Abwärtskompatibilität

4. **Legacy-Kompatibilität** (`cli/lib/legacy/claude-compat.js`)
   - Erkennung von Claude-Craft-Projekten
   - Automatisches Migrationstool
   - Symlink-Verwaltung (`.claude/ -> .ai-craft/`)
   - Backup- und Wiederherstellungsfunktion

5. **Paket-Updates**
   - Paketname: `@ai-craft/core` (vorher `@the-bearded-bear/claude-craft`)
   - Version: `9.0.0` (Major-Bump — SemVer-Kontinuität zur `8.19.x`-Claude-Craft-
     Serie, kein Reset auf `1.0.0`, da die Paketumbenennung als der Breaking
     Change dieses Projekts behandelt wird, nicht als brandneues Produkt)
   - Binaries: `ai-craft` + `claude-craft` (Abwärtskompatibilität)

6. **Deprecation des alten Pakets** (Maintainer-Aktion, nicht von diesem Repo automatisiert)
   - Sobald `@ai-craft/core` veröffentlicht ist, muss das alte Paket als
     deprecated markiert werden, damit bestehende Installationen einen klaren
     Hinweis erhalten, statt stillschweigend veraltet zu bleiben:
     ```bash
     npm deprecate @the-bearded-bear/claude-craft "Renamed to @ai-craft/core — see https://github.com/TheBeardedBearSAS/claude-craft/blob/main/docs/guides/en/MIGRATION-TO-AI-CRAFT.md"
     ```
   - Dies erfordert npm-Publish-Zugriff auf den alten Paketnamen und wird von
     keinem Skript in diesem Repo ausgeführt — es ist ein manueller, einmaliger
     Schritt für die Person, die über diesen Zugriff verfügt.

#### Geänderte/erstellte Dateien

```
cli/
├── lib/
│   ├── ai-provider.js          # ✅ NEU: Haupt-Provider-Manager
│   ├── provider/               # ✅ NEU: Provider-Implementierungen
│   │   ├── base-provider.js
│   │   ├── vibe-provider.js
│   │   ├── codex-provider.js
│   │   ├── opencode-provider.js
│   │   ├── claude-provider.js
│   │   └── cursor-provider.js
│   └── legacy/                 # ✅ NEU: Kompatibilitätsschicht
│       └── claude-compat.js
├── index.js                    # ⚠️ TODO: Aktualisieren, um den Provider-Manager zu nutzen
│
.claude/
└── AI-CRAFT.md                # ✅ NEU: Multi-Provider-Anweisungen

ai-craft.yaml                  # ✅ NEU: Standardkonfiguration
package.json                   # ✅ AKTUALISIERT: Neuer Name und Version
README.md                      # ✅ AKTUALISIERT: Übergangshinweis
docs/guides/en/MIGRATION-TO-AI-CRAFT.md  # ✅ NEU: Diese Datei (übersetzt fr/es/de/pt)
```

---

## 📋 Migrations-Checkliste

### Für Framework-Maintainer

- [x] Branch `refactor/ai-craft` erstellen
- [x] package.json mit neuem Namen und neuer Version aktualisieren
- [x] Architektur des AI Provider Manager erstellen
- [x] Basis-Provider-Klasse implementieren
- [x] Vibe-Provider implementieren
- [x] Codex-Provider implementieren
- [x] OpenCode-Provider implementieren
- [x] Claude-Provider implementieren (abwärtskompatibel)
- [x] Cursor-Provider implementieren
- [x] ai-craft.yaml-Konfiguration erstellen
- [x] AI-CRAFT.md-Anweisungen erstellen
- [x] Abwärtskompatibilitätsschicht erstellen
- [x] README.md mit Übergangshinweis aktualisieren
- [x] Diesen Migrationsleitfaden erstellen
- [ ] CLI aktualisieren, um den Provider-Manager zu nutzen
- [ ] Installer aktualisieren, um die .ai-craft/-Struktur zu erzeugen
- [ ] Ralph für Multi-Provider-Betrieb aktualisieren
- [ ] QA Recette für Multi-Browser aktualisieren
- [ ] BMAD-Hooks für Multi-Provider aktualisieren
- [ ] Alle 70 Agenten ins Multi-Provider-Format migrieren
- [ ] Verifizieren, dass alle 220 Befehle mit allen Providern funktionieren
- [ ] Multi-Provider-Testsuite erstellen
- [ ] Dokumentation für alle Provider aktualisieren
- [ ] Providerspezifische Bundles erstellen
- [ ] Migration von Claude-Craft-Projekten testen
- [ ] GitHub Actions CI/CD aktualisieren
- [ ] npm-Paketmetadaten aktualisieren
- [ ] Release-Notes vorbereiten
- [ ] Community informieren

### Für Nutzer, die Projekte migrieren

1. **Projekt sichern**
   ```bash
   cd ~/my-project
   git commit -am "Backup before AI Craft migration"
   ```

2. **AI Craft installieren**
   ```bash
   npx @ai-craft/core install ~/my-project
   ```

3. **Migration ausführen** (falls Claude-Craft-Projekt)
   ```bash
   npx @ai-craft/core migrate ~/my-project
   ```

4. **Installation verifizieren**
   ```bash
   # Prüfen, ob das Verzeichnis .ai-craft/ existiert
   ls -la .ai-craft/
   
   # Prüfen, ob der Symlink existiert
   ls -la .claude/  # Sollte -> .ai-craft/ anzeigen
   
   # Mit deinem Provider testen
   vibe --system .ai-craft/AI-CRAFT.md
   ```

5. **Deinen Workflow aktualisieren**
   - Verwende den Befehl `ai-craft` (oder `claude-craft` für Abwärtskompatibilität)
   - Aktualisiere alle Skripte, die auf `.claude/` verweisen, auf `.ai-craft/`
   - Konfiguriere deinen bevorzugten Provider in `ai-craft.yaml`

---

## 🔧 Technische Implementierungsdetails

### Architekturübersicht

```
┌─────────────────────────────────────────────────────────────┐
│                    AI Craft CLI                              │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────┐    ┌────────────────────────┐   │
│  │   AI Provider        │    │        Commands         │   │
│  │   Manager            │    │                         │   │
│  │                     │    │  /workflow:init         │   │
│  │  ┌───────────────┐  │    │  /team:audit           │   │
│  │  │ Provider      │  │    │  /qa:recette          │   │
│  │  │ Detection     │  │    │  /common:ralph-run    │   │
│  │  └───────────────┘  │    │                         │   │
│  │                     │    └────────────────────────┘   │
│  │  ┌───────────────┐  │                                  │
│  │  │ Provider      │  │    ┌────────────────────────┐   │
│  │  │ Execution     │  │    │        Legacy           │   │
│  │  └───────────────┘  │    │        Compat           │   │
│  │                     │    │                         │   │
│  │  ┌───────────────┐  │    │  Claude Craft          │   │
│  │  │ Fallback      │  │    │  Migration             │   │
│  │  │ Handling      │  │    │  Symlink Management    │   │
│  │  └───────────────┘  │    └────────────────────────┘   │
│  └─────────────────────┘                                  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
          │              │              │
          ▼              ▼              ▼
┌─────────────────┐ ┌──────────────┐ ┌─────────────────┐
│   Vibe Provider  │ │ Codex Provider│ │ OpenCode Provider│
│   (Mistral AI)   │ │   (Google)    │ │ (Self-Hosted)    │
└─────────────────┘ └──────────────┘ └─────────────────┘
          │              │              │
          ▼              ▼              ▼
┌─────────────────────────────────────────────────────────────┐
│                    AI Providers                              │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐    │
│  │   Vibe CLI  │ │ Codex CLI   │ │ OpenCode CLI│    │
│  │ (vibe)      │ │ (codex)     │ │ (opencode)  │    │
│  └─────────────┘ └─────────────┘ └─────────────┘    │
│                                                    │
│  ┌─────────────┐ ┌─────────────┐                    │
│  │ Claude Code │ │   Cursor    │                    │
│  │ (claude)    │ │ (VSCode)    │                    │
│  └─────────────┘ └─────────────┘                    │
└─────────────────────────────────────────────────────────────┘
```

### Provider-Schnittstelle

Alle Provider implementieren die folgende Schnittstelle:

```javascript
class BaseProvider {
  // Metadata
  name: string              // 'vibe', 'codex', etc.
  displayName: string       // 'Vibe (Mistral AI)'
  mcpSupported: boolean     // Supports MCP servers
  hooksSupported: boolean   // Supports hooks system
  subAgentsSupported: boolean // Supports sub-agents
  forkSupported: boolean    // Supports context forking
  
  // Configuration
  supportedModels: string[] // List of supported models
  defaultModel: string      // Default model to use
  modelAliases: Object      // Model name mappings
  
  // Methods
  async execute(command, args, options)      // Execute a command
  async sendMessage(prompt, options)         // Send a message to AI
  async spawnSubAgent(prompt, options)       // Spawn a sub-agent
  getMCPServers()                           // Get MCP server configs
  mapCommand(command, args)                 // Map generic → provider-specific
  async isAvailable()                       // Check if provider is installed
  async getVersion()                        // Get provider version
  validateConfig(config)                    // Validate provider config
  getEnvVars()                              // Get environment variables
}
```

### Konfigurationsstruktur

**Neue Struktur (`.ai-craft/`):**
```
.ai-craft/
├── AI-CRAFT.md              # Kernanweisungen (ersetzt CLAUDE.md)
├── ai-craft.yaml            # Multi-Provider-Konfiguration
├── ai-craft-config.json     # Generische Einstellungen (optional)
├── providers/               # Providerspezifische Konfigurationen
│   ├── vibe.yaml
│   ├── codex.yaml
│   ├── opencode.yaml
│   ├── claude.yaml
│   └── cursor.yaml
├── agents/                  # Multi-Provider-Agenten
│   └── api-designer.md
│   └── symfony-reviewer.md
│   └── ...
├── commands/                # Framework-Befehle
├── skills/                  # Universelle Skills
├── templates/               # Codegenerierungs-Vorlagen
├── memory/                  # Sitzungsübergreifender Speicher
├── logs/                    # Log-Dateien
└── hooks/                   # Hook-Skripte
```

**Legacy-Struktur (`.claude/`):**
```
.claude/ → .ai-craft/  (Symlink zur Abwärtskompatibilität)
```

### Modellnamen-Zuordnung

AI Craft bietet eine automatische Zuordnung von Modellnamen zwischen Providern:

| Generischer Name | Vibe (Mistral) | Codex (Google) | OpenCode | Claude (Anthropic) |
|--------------|----------------|---------------|----------|-------------------|
| `opus` | `mistral-large-3.5` | `codex-pro` | `llama-3.2-90b` | `opus-4.8` |
| `sonnet` | `mistral-medium-3.5` | `codex-plus` | `llama-3.2-70b` | `sonnet-5` |
| `haiku` | `mistral-small-3.5` | `codex` | `llama-3.2-11b` | `haiku-4.5` |

Dies ermöglicht es bestehenden Claude-Craft-Befehlen, ohne Änderungen zu funktionieren:
```bash
# Diese funktionieren identisch bei allen Providern
/workflow:init --model=opus
/team:audit --model=sonnet
```

---

## 🎛️ Providerspezifisches Setup

### Vibe (Mistral AI)

**Voraussetzungen:**
- Vibe CLI installieren: `curl -sSL https://vibe.mistral.ai | sh`
- API-Schlüssel setzen: `export MISTRAL_API_KEY=your_key`

**Konfiguration:**
```yaml
# .ai-craft/ai-craft.yaml
providers:
  primary: "vibe"

provider_settings:
  vibe:
    model: "mistral-large-3.5"
    api_endpoint: "https://api.mistral.ai"
```

### Codex (Google)

**Voraussetzungen:**
- Codex CLI installieren: `npm install -g @google-cloud/codex-cli`
- API-Schlüssel setzen: `export CODEX_API_KEY=your_key`

**Konfiguration:**
```yaml
# .ai-craft/ai-craft.yaml
providers:
  primary: "codex"

provider_settings:
  codex:
    model: "codex-pro"
```

### OpenCode (Self-Hosted)

**Voraussetzungen:**
- OpenCode installieren: `npm install -g @open-code/cli`
- LLM-Server ausführen (z. B. `llama-3.2-90b`)
- Endpoint setzen: `export OPENCODE_ENDPOINT=http://localhost:8080`

**Konfiguration:**
```yaml
# .ai-craft/ai-craft.yaml
providers:
  primary: "opencode"

provider_settings:
  opencode:
    model: "llama-3.2-90b"
    base_url: "http://localhost:8080"
```

### Claude Code (Anthropic)

**Voraussetzungen:**
- Claude Code installieren: `brew install claude-code` (macOS) oder siehe [Dokumentation](https://code.claude.com)

**Konfiguration:**
```yaml
# .ai-craft/ai-craft.yaml
providers:
  primary: "claude"

provider_settings:
  claude:
    model: "sonnet-5"
```

### Cursor (VSCode)

**Voraussetzungen:**
- Cursor-Erweiterung in VSCode installieren

**Konfiguration:**
```json
// VSCode settings.json
{
  "cursor.rules": [
    {
      "path": ".ai-craft",
      "prompt": ".ai-craft/AI-CRAFT.md"
    }
  ]
}
```

---

## 🚀 Schnellstart für Entwickler

### Klonen und Einrichten

```bash
# Repository klonen
git clone https://github.com/TheBeardedBearSAS/claude-craft.git
cd claude-craft

# Zum AI-Craft-Branch wechseln
git checkout refactor/ai-craft

# Abhängigkeiten installieren
npm install

# Paket lokal verlinken
npm link
```

### Die Migration testen

```bash
# Ein Testprojekt erstellen
mkdir ~/ai-craft-test
cd ~/ai-craft-test

# AI Craft initialisieren
npx @ai-craft/core install . --provider=vibe

# Oder die Migration von Claude Craft testen
npx @the-bearded-bear/claude-craft install . --tech=symfony
npx @ai-craft/core migrate .

# Mit verschiedenen Providern testen
ai-craft --provider=vibe workflow:init
ai-craft --provider=codex workflow:init
ai-craft --provider=claude workflow:init
```

### Tests ausführen

```bash
# Bestehende Tests ausführen
npm test

# Lint ausführen
npm run lint

# Multi-Provider-Funktionalität prüfen
node tests/ai-provider.test.mjs
```

---

## 🐛 Fehlerbehebung

### Häufige Probleme

**1. Provider nicht erkannt**
```
❌ Error: No AI provider detected
```
**Lösung:**
- Installiere die Provider-CLI (vibe, codex, opencode oder claude)
- Setze die passende Umgebungsvariable
- Oder gib den Provider explizit an: `--provider=vibe`

**2. Symlink nicht erstellt**
```
❌ Error: .claude/ directory not found
```
**Lösung:**
- Die Migration sollte den Symlink automatisch erstellen
- Manuell erstellen: `ln -s .ai-craft .claude`
- Oder `ai-craft`-Befehle direkt verwenden

**3. Befehl nicht gefunden**
```
❌ Error: ai-craft: command not found
```
**Lösung:**
- Sicherstellen, dass `npm link` ausgeführt wurde
- Oder npx verwenden: `npx @ai-craft/core`
- Oder global installieren: `npm install -g .`

**4. Zugriff verweigert**
```
❌ Error: EACCES: permission denied
```
**Lösung:**
- Bei Bedarf sudo verwenden: `sudo npm link`
- Oder npm-Berechtigungen korrigieren: `npm config set prefix ~/.npm-global`

**5. Konfigurationsfehler**
```
❌ Error: Invalid configuration
```
**Lösung:**
- Die Syntax von `ai-craft.yaml` mit einem YAML-Validator prüfen
- Mit der Standardkonfiguration vergleichen
- Entfernen und neu erzeugen: `rm -rf .ai-craft && npx @ai-craft/core install .`

---

## 📊 Fortschrittsverfolgung der Migration

| Aufgabe | Status | Verantwortlich | Hinweise |
|------|--------|-------|-------|
| Kernarchitektur | ✅ Erledigt | - | Provider-Manager abgeschlossen |
| Vibe-Provider | ✅ Erledigt | - | Vollständige Implementierung |
| Codex-Provider | ✅ Erledigt | - | Vollständige Implementierung |
| OpenCode-Provider | ✅ Erledigt | - | Vollständige Implementierung |
| Claude-Provider | ✅ Erledigt | - | Abwärtskompatibel |
| Cursor-Provider | ✅ Erledigt | - | VSCode-Integration |
| Konfiguration | ✅ Erledigt | - | ai-craft.yaml-Vorlage |
| AI-CRAFT.md | ✅ Erledigt | - | Multi-Provider-Anweisungen |
| Abwärtskompatibilität | ✅ Erledigt | - | Symlink-Verwaltung |
| README-Aktualisierung | ✅ Erledigt | - | Übergangshinweis |
| Migrationsleitfaden | ✅ Erledigt | - | Dieses Dokument |
| CLI-Integration | ⏳ TODO | Dev | cli/index.js aktualisieren |
| Installer-Aktualisierung | ⏳ TODO | Dev | .ai-craft/-Struktur erstellen |
| Ralph-Anpassung | ⏳ TODO | Dev | Multi-Provider-Loop |
| QA-Recette-Anpassung | ⏳ TODO | Dev | Multi-Browser-Unterstützung |
| Agenten-Migration | ⏳ TODO | Dev | 70 Agenten aktualisieren |
| Befehlsverifizierung | ⏳ TODO | QA | 220 Befehle testen |
| Testsuite | ⏳ TODO | QA | Multi-Provider-Tests |
| Dokumentation | ⏳ TODO | Docs | Gesamte Dokumentation aktualisieren |
| Bundles | ⏳ TODO | Dev | Bundles für jeden Provider erstellen |
| CI/CD-Aktualisierung | ⏳ TODO | DevOps | GitHub Actions |
| Paketveröffentlichung | ⏳ TODO | DevOps | npm publish |
| Community-Ankündigung | ⏳ TODO | Marketing | Release-Ankündigung |

---

## 🎯 Roadmap für die Migration zu AI Craft

### Phase 1: Fundament (Wochen 1-2) ✅ **ABGESCHLOSSEN**
- [x] Architektur des AI Provider Manager
- [x] Implementierung der Basis-Provider
- [x] Multi-Provider-Konfiguration
- [x] Kompatibilitätsschicht zu Claude Craft
- [x] Erste Dokumentation

### Phase 2: CLI-Integration (Wochen 3-4) ⏳ **IN ARBEIT**
- [ ] Aktualisierung von cli/index.js zur Nutzung des Provider-Managers
- [ ] Aktualisierung des Installers (Dev/scripts/install-*.sh)
- [ ] Integration von Ralph mit Multi-Provider
- [ ] Grundlegende Integrationstests

### Phase 3: Anpassung der Werkzeuge (Wochen 5-6) ⏳ **BEVORSTEHEND**
- [ ] Ralph Wiggum Multi-Provider
- [ ] QA Recette Multi-Browser + Multi-AI
- [ ] BMAD-Hooks Multi-Provider
- [ ] Aktualisierung der Hook-Vorlagen

### Phase 4: Migration der Agenten (Wochen 7-8) ⏳ **BEVORSTEHEND**
- [ ] Migrationsskript für Agenten
- [ ] Aktualisierung der 70 bestehenden Agenten
- [ ] Multi-Provider-Frontmatter
- [ ] Validierung der Agenten

### Phase 5: Tests & Validierung (Wochen 9-10) ⏳ **BEVORSTEHEND**
- [ ] Multi-Provider-Testsuite
- [ ] End-to-End-Integrationstests
- [ ] Validierung der Abwärtskompatibilität
- [ ] Performance-Benchmark

### Phase 6: Release (Woche 11-12) ⏳ **BEVORSTEHEND**
- [ ] Aktualisierung der Dokumentation
- [ ] Erstellung der Multi-IDE-Bundles
- [ ] Aktualisierung der CI/CD
- [ ] Veröffentlichung auf npm
- [ ] Ankündigung an die Community

---

## 🤝 Wie du beitragen kannst

Wir freuen uns über Beiträge zu AI Craft! So kannst du helfen:

### 1. Probleme melden
- Öffne ein Issue auf GitHub mit dem Label `ai-craft`
- Gib Details an zu:
  - Deinem Betriebssystem
  - Dem/den verwendeten KI-Provider(n)
  - Schritten zur Reproduktion
  - Erwartetem vs. tatsächlichem Verhalten

### 2. Fehler beheben
- Forke das Repository
- Erstelle einen Branch: `git checkout -b fix/your-issue`
- Nimm deine Änderungen vor
- Füge Tests für den Fix hinzu
- Reiche einen Pull Request ein

### 3. Funktionen hinzufügen
- Diskutiere die Funktion zuerst in GitHub Discussions
- Erstelle einen Branch: `git checkout -b feat/your-feature`
- Implementiere die Funktion
- Füge Tests und Dokumentation hinzu
- Reiche einen Pull Request ein

### 4. Dokumentation verbessern
- Bestehende Dokumentation aktualisieren
- Beispiele hinzufügen
- Übersetzungen verbessern (en, fr, es, de, pt)

### 5. Neue Provider testen
- Probiere AI Craft mit verschiedenen KI-Providern aus
- Melde Kompatibilitätsprobleme
- Hilf mit, die Provider-Implementierungen zu verbessern

---

## 📞 Support

### Community
- **GitHub Discussions:** [TheBeardedBearSAS/ai-craft/discussions](https://github.com/TheBeardedBearSAS/ai-craft/discussions)
- **Discord:** [Tritt unserem Discord-Server bei](https://discord.gg/...) (Link wird noch aktualisiert)
- **Twitter/X:** [@TheBeardedCTO](https://twitter.com/TheBeardedCTO)

### Dokumentation
- **Haupt-Dokumentation:** [ai-craft.the-bearded-bear.com](https://ai-craft.the-bearded-bear.com) (bald verfügbar)
- **GitHub Wiki:** [TheBeardedBearSAS/ai-craft/wiki](https://github.com/TheBeardedBearSAS/ai-craft/wiki)

### Kommerzieller Support
Für Enterprise-Support, individuelle Entwicklung oder Schulungen:
- **E-Mail:** support@the-bearded-bear.com
- **Website:** [https://the-bearded-bear.com](https://the-bearded-bear.com)

---

## 📜 Lizenz

AI Craft ist **zu 100% Open Source** unter der [MIT-Lizenz](LICENSE).

Das bedeutet, du kannst:
- ✅ Es kostenlos nutzen (privat und kommerziell)
- ✅ Den Quellcode verändern
- ✅ Modifizierte Versionen weiterverbreiten
- ✅ Es in proprietärer Software einsetzen

Du darfst nicht:
- ❌ Die Markenzeichen ohne Genehmigung verwenden
- ❌ Uns für etwaige Probleme haftbar machen

---

## 🙏 Danksagungen

AI Craft baut auf dem Fundament von **Claude Craft** auf, das von [The Bearded CTO](https://the-bearded-bear.com) mit Beiträgen aus der Open-Source-Community geschaffen und gepflegt wurde.

Besonderer Dank gilt:
- **Anthropic** für die Entwicklung von Claude Code
- **Mistral AI** für Vibe und Open-Source-Beiträge
- **Google** für Codex und KI-Forschung
- **Allen Mitwirkenden**, die dazu beigetragen haben, dieses Framework zu formen

---

**AI Craft - Das Multi-AI-Entwicklungsframework**
*Vormals Claude Craft - Jetzt Provider-unabhängig!*
*Mit ❤️ von der AI-Craft-Community erstellt*
