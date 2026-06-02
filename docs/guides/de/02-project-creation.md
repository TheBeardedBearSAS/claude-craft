# Leitfaden zur Projekterstellung

Dieser Leitfaden führt Sie durch die Einrichtung eines neuen Projekts mit Claude-Craft, von der Wahl des Technologie-Stacks bis zur Konfiguration Ihrer Entwicklungsumgebung.

---

## Inhaltsverzeichnis

1. [Ihre Technologie auswählen](#ihre-technologie-auswählen)
2. [Installationsmethoden](#installationsmethoden)
3. [Einzelne Technologieprojekte](#einzelne-technologieprojekte)
4. [Monorepo-Projekte](#monorepo-projekte)
5. [Konfiguration nach der Installation](#konfiguration-nach-der-installation)
6. [Checkliste für den Projektstart](#checkliste-für-den-projektstart)

---

## Ihre Technologie auswählen

### Technologievergleich

| Technologie | Am besten für | Architektur | Hauptmerkmale |
|-------------|---------------|-------------|---------------|
| **.NET / C#** | Enterprise-APIs | Clean Architecture + CQRS | MediatR, EF Core, C# 14 |
| **Symfony** | Backend-APIs, Web-Apps | Clean Architecture + DDD | Doctrine, Messenger, API Platform |
| **Flutter** | Mobile Apps | Feature-basiert + BLoC | Material/Cupertino, State Management |
| **Python** | APIs, Datendienste | Clean Architecture | FastAPI, async/await, Pydantic |
| **React** | Web-SPAs | Feature-basiert + Hooks | State Management, Barrierefreiheit |
| **React Native** | Plattformübergreifende Mobile-Apps | Navigationsbasiert | Native Module, plattformspezifischer Code |
| **Angular** | Enterprise-Web-Apps | Domain-driven | Signals, Standalone, RxJS |
| **Vue.js** | Web-SPAs | Composition API | Pinia, Vitest, TypeScript |
| **Laravel** | PHP-APIs, Web-Apps | Clean Architecture | Actions, Pest PHP, Sanctum |
| **PHP** | Bibliotheken, Backend | Clean Architecture | PSR-12, PHPStan, Pest PHP |

### Auswahl nach Projekttyp

| Projekttyp | Empfohlener Stack |
|------------|-------------------|
| REST-API | Symfony oder Python |
| Mobile App (natives Erscheinungsbild) | Flutter |
| Mobile App (JS-Team) | React Native |
| Web-SPA | React |
| Full-Stack-Web | Symfony + React |
| Full-Stack-Mobile | Symfony + Flutter |
| Microservices | Python (FastAPI) |

### Häufige Kombinationen

```
Web-Anwendung:          Symfony (Backend) + React (Frontend)
Mobile-Anwendung:       Symfony (API) + Flutter (Mobile)
Vollständige Plattform: Symfony (API) + React (Web) + Flutter (Mobile)
Datenplattform:         Python (API) + React (Dashboard)
```

---

## Installationsmethoden

Claude-Craft bietet mehrere Installationsmethoden für verschiedene Workflows.

### Methode 1: Makefile (Empfohlen)

Der einfachste und flexibelste Ansatz.

```bash
# Grundlegende Syntax
make install-{technology} TARGET=path LANG=language

# Beispiele
make install-symfony TARGET=./backend LANG=en
make install-flutter TARGET=./mobile LANG=fr
make install-python TARGET=./api LANG=es
make install-react TARGET=./frontend LANG=de
make install-reactnative TARGET=./app LANG=pt
```

#### Verfügbare Optionen

| Option | Beschreibung | Beispiel |
|--------|-------------|---------|
| `TARGET` | Installationspfad | `TARGET=~/projects/myapp` |
| `LANG` | Sprachcode | `LANG=fr` |
| `OPTIONS` | Zusätzliche Flags | `OPTIONS="--force --backup"` |

#### Options-Flags

```bash
# Änderungen in der Vorschau ansehen ohne anzuwenden
make install-symfony TARGET=./backend OPTIONS="--dry-run"

# Vorhandene Dateien überschreiben (erstellt Backup)
make install-symfony TARGET=./backend OPTIONS="--force"

# Backup vor der Installation erstellen
make install-symfony TARGET=./backend OPTIONS="--backup"

# Interaktiver Modus (fragt nach Projektinformationen)
make install-symfony TARGET=./backend OPTIONS="--interactive"

# Nur aktualisieren (projektspezifische Dateien beibehalten)
make install-symfony TARGET=./backend OPTIONS="--update"
```

### Methode 2: Direktes Skript-Ausführen

Installationsskripte direkt ausführen für mehr Kontrolle.

```bash
# Syntax
./Dev/scripts/install-{technology}-rules.sh [OPTIONS] [TARGET]

# Beispiele
./Dev/scripts/install-symfony-rules.sh --lang=fr ~/my-project
./Dev/scripts/install-flutter-rules.sh --lang=en --dry-run .
./Dev/scripts/install-python-rules.sh --force --backup ~/api
```

#### Skript-Optionen

```bash
--lang=XX       # Sprache (en, fr, es, de, pt)
--install       # Vollständiger Installationsmodus
--update        # Nur gemeinsame Regeln aktualisieren
--force         # Alle Dateien überschreiben
--dry-run       # Vorschau ohne Änderungen
--backup        # Zuerst Backup erstellen
--interactive   # Nach Projektinformationen fragen
--help          # Hilfe anzeigen
--version       # Version anzeigen
```

### Methode 3: YAML-Konfiguration

Am besten für Monorepos und Multi-Projekt-Setups.

```bash
# Konfiguration erstellen
cp claude-projects.yaml.example claude-projects.yaml

# Konfiguration bearbeiten
nano claude-projects.yaml

# Konfiguration validieren
make config-validate CONFIG=claude-projects.yaml

# Bestimmtes Projekt installieren
make config-install CONFIG=claude-projects.yaml PROJECT=my-project

# Alle Projekte installieren
make config-install-all CONFIG=claude-projects.yaml
```

---

## Einzelne Technologieprojekte

### Symfony-Projekt

```bash
# Projektverzeichnis erstellen
mkdir ~/my-symfony-api
cd ~/my-symfony-api
composer create-project symfony/skeleton .
git init

# Claude-Craft-Regeln installieren
make install-symfony TARGET=. LANG=fr

# Installation verifizieren
ls -la .claude/
```

**Installierter Inhalt:**
- 21 Symfony-spezifische Regeln (Clean Architecture, DDD, CQRS usw.)
- 10+ Symfony-Befehle (`/symfony:generate-crud`, `/symfony:check-compliance` usw.)
- Symfony-Reviewer-Agent
- Code-Templates (Service, ValueObject, Aggregate usw.)
- Qualitäts-Checklisten

### Flutter-Projekt

```bash
# Projekt erstellen
flutter create my_flutter_app
cd my_flutter_app
git init

# Claude-Craft-Regeln installieren
make install-flutter TARGET=. LANG=en

# Verifizieren
ls -la .claude/
```

**Installierter Inhalt:**
- 13 Flutter-spezifische Regeln (BLoC, State Management, Testing)
- 10 Flutter-Befehle
- Flutter-Reviewer-Agent
- Widget- und BLoC-Templates
- Qualitäts-Checklisten

### Python-Projekt

```bash
# Projekt erstellen
mkdir ~/my-python-api
cd ~/my-python-api
python -m venv venv
git init

# Claude-Craft-Regeln installieren
make install-python TARGET=. LANG=en

# Verifizieren
ls -la .claude/
```

**Installierter Inhalt:**
- 12 Python-spezifische Regeln (FastAPI, async, Typisierung)
- 10 Python-Befehle
- Python-Reviewer-Agent
- Service- und API-Templates
- Qualitäts-Checklisten

### React-Projekt

```bash
# Projekt erstellen
npx create-react-app my-react-app
cd my-react-app

# Claude-Craft-Regeln installieren
make install-react TARGET=. LANG=en

# Verifizieren
ls -la .claude/
```

### React-Native-Projekt

```bash
# Projekt erstellen
npx react-native init MyApp
cd MyApp

# Claude-Craft-Regeln installieren
make install-reactnative TARGET=. LANG=en

# Verifizieren
ls -la .claude/
```

---

## Monorepo-Projekte

### Monorepo-Struktur verstehen

Ein typisches Monorepo könnte so aussehen:

```
my-platform/
├── backend/          # Symfony API
├── web/              # React Frontend
├── mobile/           # Flutter App
├── shared/           # Gemeinsame Typen/Verträge
└── claude-projects.yaml
```

### YAML-Konfigurationsstruktur

```yaml
# claude-projects.yaml

settings:
  default_lang: "fr"              # Standardsprache für alle Projekte
  claude_craft_path: "~/claude-craft"  # Pfad zu claude-craft (optional)

projects:
  - name: "my-platform"
    description: "Full-stack SaaS platform"
    path: "~/Projects/my-platform"
    modules:
      - name: "api"
        path: "backend"
        technologies: ["symfony"]
        lang: "en"                # Standardsprache überschreiben

      - name: "web"
        path: "web"
        technologies: ["react"]

      - name: "mobile"
        path: "mobile"
        technologies: ["flutter"]
```

### Konfigurationsfelder

#### Projektebene

| Feld | Pflicht | Beschreibung |
|------|---------|-------------|
| `name` | Ja | Projekt-Bezeichner |
| `description` | Nein | Projektbeschreibung |
| `path` | Ja | Absoluter Pfad zum Projektstamm |
| `lang` | Nein | Sprachüberschreibung |
| `modules` | Nein | Liste von Modulen (für Monorepos) |
| `technologies` | Nein | Technologien ohne Module |

#### Modulebene

| Feld | Pflicht | Beschreibung |
|------|---------|-------------|
| `name` | Ja | Modul-Bezeichner |
| `path` | Ja | Relativer Pfad vom Projektstamm |
| `technologies` | Ja | Liste der Technologien |
| `lang` | Nein | Sprachüberschreibung |
| `skip_common` | Nein | Gemeinsame Regeln überspringen (Standard: false) |

### Installationsbefehle

```bash
# Konfiguration validieren
make config-validate CONFIG=claude-projects.yaml

# Konfigurierte Projekte auflisten
make config-list CONFIG=claude-projects.yaml

# Bestimmtes Projekt installieren
make config-install CONFIG=claude-projects.yaml PROJECT=my-platform

# Bestimmtes Modul installieren
make config-install CONFIG=claude-projects.yaml PROJECT=my-platform MODULE=api

# Dry-run zur Vorschau
make config-install CONFIG=claude-projects.yaml PROJECT=my-platform OPTIONS="--dry-run"

# Alle Projekte installieren
make config-install-all CONFIG=claude-projects.yaml
```

### Praxisbeispiele

#### Beispiel 1: SaaS-Plattform

```yaml
projects:
  - name: "saas-platform"
    path: "~/Projects/saas"
    modules:
      - name: "api"
        path: "services/api"
        technologies: ["symfony"]
      - name: "admin"
        path: "apps/admin"
        technologies: ["react"]
      - name: "mobile"
        path: "apps/mobile"
        technologies: ["flutter"]
```

#### Beispiel 2: Microservices

```yaml
projects:
  - name: "microservices"
    path: "~/Projects/micro"
    modules:
      - name: "gateway"
        path: "gateway"
        technologies: ["python"]
      - name: "users"
        path: "services/users"
        technologies: ["symfony"]
      - name: "orders"
        path: "services/orders"
        technologies: ["symfony"]
      - name: "analytics"
        path: "services/analytics"
        technologies: ["python"]
```

#### Beispiel 3: Mehrere unabhängige Projekte

```yaml
settings:
  default_lang: "fr"

projects:
  - name: "client-a"
    path: "~/Clients/client-a"
    technologies: ["symfony", "react"]

  - name: "client-b"
    path: "~/Clients/client-b"
    technologies: ["flutter"]
    lang: "en"

  - name: "internal-tool"
    path: "~/Internal/tool"
    technologies: ["python"]
```

---

## Konfiguration nach der Installation

Konfigurieren Sie nach der Installation diese Dateien für Ihr konkretes Projekt.

### 1. Projektkontext (`rules/00-project-context.md`)

Dies ist die wichtigste Datei zum Anpassen. Sie informiert Claude über Ihr spezifisches Projekt.

**Option A: Interaktive Einrichtung (Empfohlen)**

Führen Sie diesen Befehl in Claude Code aus, um Ihren Stack automatisch zu erkennen und gezielte Fragen zu beantworten:
```bash
/common:setup-project-context
```

**Option B: Manuelle Konfiguration**

Datei direkt mit Ihren Projektdetails bearbeiten:

```markdown
# Project Context

## Project Information
- **Name**: My Awesome API
- **Type**: REST API for e-commerce platform
- **Team Size**: 3 developers

## Technical Stack
- PHP 8.3 with Symfony 7.0
- PostgreSQL 16
- Redis for caching
- RabbitMQ for messaging

## Conventions
- PSR-12 coding standard
- Strict typing enabled
- English code, French documentation

## Constraints
- RGPD compliance required
- Must support multi-tenant architecture
- Maximum response time: 200ms

## External Dependencies
- Stripe for payments
- SendGrid for emails
- S3 for file storage
```

### 2. Hauptkonfiguration (`CLAUDE.md`)

Die Datei CLAUDE.md im Verzeichnis `.claude/` enthält die Hauptkonfiguration. Wichtige Abschnitte zum Prüfen:

```markdown
# Project Configuration

## Language Settings
- Code: English
- Documentation: French
- Comments: English

## Architecture
Clean Architecture + DDD + Hexagonal

## Quality Requirements
- Test coverage: 80%+
- PHPStan level: 9
- No critical security issues

## Docker Requirements
All commands must use Docker via make targets.
```

### 3. Agentenkonfiguration

Installierte Agenten in `.claude/agents/` prüfen und bei Bedarf anpassen:

```bash
ls .claude/agents/
# api-designer.md
# database-architect.md
# symfony-reviewer.md
# tdd-coach.md
# ...
```

---

## Checkliste für den Projektstart

Verwenden Sie diese Checkliste bei der Einrichtung eines neuen Projekts:

### Vor der Installation

- [ ] Projektverzeichnis erstellt
- [ ] Git-Repository initialisiert
- [ ] Technologie-Stack entschieden
- [ ] Sprachpräferenz gewählt

### Installation

- [ ] Claude-Craft-Regeln installiert
- [ ] Installation verifiziert (`ls .claude/`)
- [ ] Keine Fehler in der Installationsausgabe

### Konfiguration

- [ ] `00-project-context.md` mit Projektdetails angepasst
- [ ] `CLAUDE.md` geprüft und angepasst
- [ ] Team-Konventionen dokumentiert
- [ ] Einschränkungen und Anforderungen aufgelistet

### Verifizierung

- [ ] Claude Code im Projektverzeichnis gestartet
- [ ] Befehle verfügbar (z. B. `/symfony:check-compliance` testen)
- [ ] Agenten reagieren (z. B. `@symfony-reviewer hello` testen)

### Team-Einrichtung

- [ ] `.claude/`-Verzeichnis in Git committet
- [ ] Team-Mitglieder über verfügbare Befehle informiert
- [ ] README mit Claude-Craft-Nutzungshinweisen aktualisiert

---

## Gängige Muster

### Nur gemeinsame Regeln installieren

Für gemeinsame Bibliotheken oder Pakete, die keiner spezifischen Technologie entsprechen:

```bash
make install-common TARGET=./shared-lib LANG=en
```

### Projektmanagement-Tools installieren

Für Sprint-Tracking und Backlog-Verwaltung:

```bash
make install-project TARGET=. LANG=fr
```

### Infrastruktur-Tools installieren

Für Docker- und CI/CD-Unterstützung:

```bash
make install-infra TARGET=. LANG=en
```

### Vollständige Installation (alle Technologien)

```bash
make install-all TARGET=. LANG=fr
```

---

### Token-Optimierungs-Setup

Nach der Installation der Regeln können Sie optional RTK für Token-Einsparungen konfigurieren:

```bash
# In einer Claude Code-Session
/common:setup-rtk
```

Dies richtet den RTK-Proxy, die Sub-Agent-Modelloptimierung und Hook-Templates für eine Gesamtreduktion von 55–65 % der Token ein.

---

## Regeln aktualisieren

Wenn Claude-Craft neue Versionen veröffentlicht:

```bash
# Auf die neueste Version aktualisieren (projektspezifische Dateien werden beibehalten)
make install-symfony TARGET=./backend OPTIONS="--update"

# Vollständige Neuinstallation erzwingen (Backup wird automatisch erstellt)
make install-symfony TARGET=./backend OPTIONS="--force"
```

---

## Nächste Schritte

Ihr Projekt ist jetzt eingerichtet! Fahren Sie fort mit:

1. **[Leitfaden zur Feature-Entwicklung](03-feature-development.md)** – Den TDD-Workflow kennenlernen
2. **[Leitfaden zur Fehlerbehebung](04-bug-fixing.md)** – Bugs effektiv beheben
3. **[Tools-Referenz](05-tools-reference.md)** – Weitere Tools erkunden

---

[&larr; Erste Schritte](01-getting-started.md) | [Feature-Entwicklung &rarr;](03-feature-development.md)
