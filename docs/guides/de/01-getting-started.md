# Erste Schritte mit Claude-Craft

Willkommen bei Claude-Craft! Dieser Leitfaden hilft Ihnen zu verstehen, was Claude-Craft ist, und Ihr erstes Projekt in nur 5 Minuten zum Laufen zu bringen.

---

## Was ist Claude-Craft?

Claude-Craft ist ein umfassendes Framework für KI-gestützte Entwicklung mit Claude Code. Es bietet:

- **133 Slash-Befehle** – Schnelle Aktionen in 15 Namespaces für Codegenerierung, Analyse und Qualitätsprüfungen
- **70 KI-Agenten (31 spezialisiert + 39 Infra auf Abruf)** – Spezialisierte Assistenten mit optimierten Aufwandsstufen und dauerhaftem Gedächtnis
- **11 Technologie-Stacks** – Von .NET/C# bis Vue.js, mit eigenen Regeln und Agenten
- **48 Skills** – Best Practices für Architektur, Tests und Sicherheit
- **21 Vorlagen** – Einsatzbereite Code-Muster für gängige Komponenten
- **10 Checklisten** – Qualitätstore für Features, Releases und Sicherheitsaudits
- **937 Testsuiten** – Umfassende Validierung (vitest + bats)

### Unterstützte Technologien

| Technologie | Fokus | Anwendungsfälle |
|-------------|-------|-----------------|
| **.NET / C#** | Clean Architecture + CQRS | APIs, Enterprise-Anwendungen |
| **Symfony** | Clean Architecture + DDD | APIs, Web-Apps, Backend-Services |
| **Flutter** | BLoC-Muster | Mobile Apps (iOS/Android) |
| **Python** | FastAPI + async/await | APIs, Datendienste, ML-Backends |
| **React** | Hooks + State Management | Web-SPAs, Dashboards |
| **React Native** | Plattformübergreifend Mobile | Mobile Apps mit JS |
| **Angular** | Signals + Standalone | Enterprise-Web-Apps |
| **Vue.js** | Composition API + Pinia | Web-SPAs, Progressive Apps |
| **Laravel** | Clean Architecture + Actions | APIs, Web-Apps |
| **PHP** | PSR-12 + PHPStan | Bibliotheken, Backend-Services |
| **Docker** | Infrastruktur | Containerisierung, CI/CD |

### Unterstützte Sprachen

Alle Inhalte sind in 5 Sprachen verfügbar:
- Englisch (en)
- Französisch (fr)
- Spanisch (es)
- Deutsch (de)
- Portugiesisch (pt)

---

## Voraussetzungen

### Erforderlich

- **Bash** – Shell zum Ausführen von Installationsskripten
- **Claude Code** – Der KI-Coding-Assistent von Anthropic

### Claude Code Kompatibilität

| Version | Status |
|---------|--------|
| **2.1.168** | Empfohlen (volle Feature-Unterstützung) |
| **2.1.97+** | Mindestversion (CVE-2025-59536 gepatcht) |

### Optional (Empfohlen)

- **yq** – YAML-Prozessor für Konfigurationsdateien
  ```bash
  # macOS
  brew install yq

  # Linux (Debian/Ubuntu)
  sudo apt install yq

  # Linux (snap)
  sudo snap install yq
  ```

- **jq** – JSON-Prozessor (für das StatusLine-Tool)
  ```bash
  # macOS
  brew install jq

  # Linux
  sudo apt install jq
  ```

---

## Schnellinstallation

### Methode 1: Makefile (Empfohlen)

```bash
# Claude-Craft klonen
git clone https://github.com/TheBeardedBearSAS/claude-craft.git
cd claude-craft

# Für ein Symfony-Projekt installieren (auf Französisch)
make install-symfony TARGET=~/my-project LANG=fr

# Oder für ein Flutter-Projekt (auf Englisch)
make install-flutter TARGET=~/my-app LANG=en
```

### Methode 2: Direktes Skript

```bash
# Zum Claude-Craft-Verzeichnis navigieren
cd claude-craft

# Installationsskript ausführen
./Dev/scripts/install-symfony-rules.sh --lang=fr ~/my-project
```

### Methode 3: YAML-Konfiguration (für Monorepos)

```bash
# Konfigurationsdatei erstellen
cp claude-projects.yaml.example claude-projects.yaml

# Mit Ihren Projekten bearbeiten
nano claude-projects.yaml

# Aus Konfiguration installieren
make config-install CONFIG=claude-projects.yaml PROJECT=my-project
```

---

## Ihr erstes Projekt in 5 Minuten

Erstellen wir ein neues Symfony-API-Projekt mit französischen Regeln.

### Schritt 1: Projektverzeichnis erstellen

```bash
mkdir ~/my-api
cd ~/my-api
git init
```

### Schritt 2: Claude-Craft-Regeln installieren

```bash
# Aus dem claude-craft-Verzeichnis heraus
make install-symfony TARGET=~/my-api LANG=fr
```

### Schritt 3: Installation überprüfen

```bash
ls -la ~/my-api/.claude/
```

Sie sollten Folgendes sehen:
```
.claude/
├── CLAUDE.md           # Hauptkonfiguration
├── .claudeignore       # Ignoriermuster zur Kontextreduzierung
├── settings.json       # Optimierte Standardwerte mit PostCompact-Hook
├── settings.local.json # Lokale Berechtigungen (Wildcard-Muster)
├── rules/              # 21 Regeldateien
├── agents/             # KI-Agenten mit Aufwands-/Gedächtnisoptimierung
├── commands/           # Slash-Befehle
│   ├── common/         # Übergreifende Befehle
│   └── symfony/        # Symfony-spezifische Befehle
├── templates/          # Code-Vorlagen
└── checklists/         # Qualitätstore
```

### Schritt 4: Projektkontext konfigurieren

Sie können den Projektkontext interaktiv oder manuell konfigurieren:

**Option A: Interaktiv (Empfohlen)**
```bash
cd ~/my-api && claude
# Dann ausführen:
/common:setup-project-context
```

**Option B: Manuell**
```bash
nano ~/my-api/.claude/rules/00-project-context.md
```

Aktualisieren Sie diese Abschnitte:
- Projektname und Beschreibung
- Details zum Technologie-Stack
- Team-Konventionen
- Spezifische Einschränkungen

### Schritt 5: Claude Code starten

```bash
cd ~/my-api
claude
```

Jetzt können Sie alle installierten Befehle und Agenten verwenden!

---

## Die Struktur verstehen

### Regeln (`rules/`)

Regeln sind Richtlinien, denen Claude bei der Arbeit an Ihrem Projekt folgt. Sie sind nach Priorität nummeriert:

| Nummer | Thema |
|--------|-------|
| 00 | Projektkontext (diesen anpassen!) |
| 01 | Workflow und Analyse |
| 02 | Architektur |
| 03 | Coding-Standards |
| 04 | SOLID-Prinzipien |
| 05 | KISS, DRY, YAGNI |
| 06 | Docker und Tooling |
| 07 | Testing |
| 08 | Qualitätswerkzeuge |
| 09 | Git-Workflow |
| 10 | Dokumentation |
| 11 | Sicherheit |
| 12+ | Fortgeschrittene Themen (DDD, CQRS, usw.) |

### Agenten (`agents/`)

Agenten sind spezialisierte KI-Personas, die Sie für bestimmte Aufgaben aufrufen können:

```markdown
@api-designer Design the REST API for user management
@database-architect Create the schema for the Order aggregate
@symfony-reviewer Review my UserService implementation
@tdd-coach Help me write tests for the authentication flow
```

### Befehle (`commands/`)

Slash-Befehle sind Schnellaktionen:

```bash
# Code generieren
/symfony:generate-crud User

# Qualität prüfen
/symfony:check-compliance

# Architektur analysieren
/common:architecture-decision
```

### Vorlagen (`templates/`)

Vorlagen stellen Code-Muster bereit:
- `service.md` – Vorlage für Service-Klassen
- `value-object.md` – Vorlage für Value Objects
- `aggregate-root.md` – Vorlage für DDD-Aggregate-Roots
- `test-unit.md` – Vorlage für Unit-Tests

### Checklisten (`checklists/`)

Qualitätstore für verschiedene Szenarien:
- `feature-checklist.md` – Vor dem Abschluss eines Features
- `pre-commit.md` – Vor dem Commit von Code
- `release.md` – Vor einem Release
- `security-audit.md` – Sicherheitsüberprüfung

---

## Schlüsselkonzepte

### 1. TDD-Workflow

Claude-Craft setzt testgetriebene Entwicklung durch:

```
1. Anforderungen analysieren
2. Fehlschlagende Tests schreiben
3. Code implementieren
4. Refaktorieren
5. Überprüfen
```

### 2. Clean Architecture

Alle Technologie-Stacks folgen den Prinzipien der Clean Architecture:

```
┌─────────────────────────────────────┐
│           Präsentation              │
├─────────────────────────────────────┤
│           Anwendung                 │
├─────────────────────────────────────┤
│             Domäne                  │
├─────────────────────────────────────┤
│          Infrastruktur              │
└─────────────────────────────────────┘
```

### 3. Qualität zuerst

Jedes Feature muss Qualitätstore passieren:
- 80 %+ Testabdeckung
- Statische Analyse bestanden
- Sicherheitsaudit bestanden
- Dokumentation aktualisiert

---

## Automatische Optimierungen (v8.7)

Claude-Craft enthält jetzt standardmäßig optimierte Voreinstellungen:

**Automatisch installiert:**
- ✓ `.claudeignore` zur Reduzierung des Kontextrauschens
- ✓ `settings.json` mit PostCompact-Hook für Kontext-Reinjektion
- ✓ `settings.local.json` mit Wildcard-Berechtigungen
- ✓ `CLAUDE_CODE_SUBAGENT_MODEL=sonnet` für Kosteneinsparungen erzwungen
- ✓ RTK `--ultra-compact` wird automatisch bei der Installation gepatcht

**Optional: RTK-Integration**

Für maximale CLI-Output-Reduzierung (60–90 % Einsparungen):

```bash
# In Claude Code den Setup-Befehl ausführen
/common:setup-rtk
```

**Erwartete Einsparungen:** 55–65 % Gesamttoken-Reduzierung mit vollständigem RTK + Optimierungen. Weitere Informationen finden Sie im [Setup-Leitfaden](08-setup-new-project.md).

---

## Nächste Schritte

Jetzt, da Sie die Grundlagen verstehen, fahren Sie fort mit:

1. **[Leitfaden zur Projekterstellung](02-project-creation.md)** – Detailliertes Setup für verschiedene Szenarien
2. **[Leitfaden zur Feature-Entwicklung](03-feature-development.md)** – TDD-Workflow mit Agenten und Befehlen
3. **[Leitfaden zur Fehlerbehebung](04-bug-fixing.md)** – Diagnose und Regressionstests-Workflow

---

## Kurzreferenz

### Gängige Befehle

```bash
# Installation
make install-{tech} TARGET=path LANG=xx

# Verfügbare Optionen auflisten
make help

# YAML-Konfiguration validieren
make config-validate CONFIG=file.yaml
```

### Nützliche Agenten

| Agent | Zweck |
|-------|-------|
| `@api-designer` | API-Design und Dokumentation |
| `@database-architect` | Datenbankschema-Design |
| `@tdd-coach` | Unterstützung beim Schreiben von Tests |
| `@{tech}-reviewer` | Code-Review für bestimmte Technologien |

### Wesentliche Befehle

| Befehl | Zweck |
|--------|-------|
| `/common:analyze-feature` | Anforderungen analysieren |
| `/{tech}:generate-crud` | CRUD-Code generieren |
| `/{tech}:check-compliance` | Vollständiges Qualitätsaudit |
| `/common:security-audit` | Sicherheitsüberprüfung |

---

[Weiter: Leitfaden zur Projekterstellung &rarr;](02-project-creation.md)
