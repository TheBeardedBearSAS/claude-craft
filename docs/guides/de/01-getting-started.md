# Erste Schritte mit Claude-Craft

Willkommen bei Claude-Craft! Diese Anleitung hilft Ihnen zu verstehen, was Claude-Craft ist und wie Sie Ihr erstes Projekt in nur 5 Minuten starten können.

---

## Was ist Claude-Craft?

Claude-Craft ist ein umfassendes Framework für KI-unterstützte Entwicklung mit Claude Code. Es bietet:

- **204+ Slash-Befehle** - Schnelle Aktionen in 26 Namespaces für Codegenerierung, Analyse und Qualitätsprüfungen
- **63 KI-Agenten** - Spezialisierte Assistenten für verschiedene Aufgaben (API-Design, Architektur, Code-Review, DevOps, etc.)
- **18 Technologie-Stacks** - Von .NET/C# bis Vue.js, mit eigenen Regeln und Agenten
- **37 Skills** - Best Practices für Architektur, Tests, Sicherheit und Codequalität
- **21 Vorlagen** - Einsatzbereite Code-Muster
- **10 Checklisten** - Qualitätstore für Features und Releases

### Unterstützte Technologien

| Technologie | Fokus | Anwendungsfälle |
|-------------|-------|-----------------|
| **Symfony / PHP** | Clean Architecture + DDD | APIs, Web-Apps, Backend-Services |
| **React** | Hooks + State Management | Web-SPAs, Dashboards |
| **Flutter / Dart** | BLoC-Muster | Mobile Apps (iOS/Android) |
| **Python** | FastAPI + async/await | APIs, Datendienste, ML |
| **Angular** | Signals + Standalone | Enterprise-SPAs |
| **Vue.js** | Composition API + Pinia | Web-SPAs, Dashboards |
| **React Native** | New Architecture | Plattformübergreifende Mobile Apps |
| **C# / .NET** | Clean Architecture + CQRS | Enterprise-APIs, Microservices |
| **Laravel** | Actions Pattern | APIs, CMS, E-Commerce |
| **PHP** | PSR-12 + PHPStan | Bibliotheken, APIs |
| **Docker** | Containerisierung | Lokale Entwicklung, CI/CD |
| **Coolify** | Self-hosted PaaS | Einfache Deployments |
| **Kubernetes** | Orchestrierung | Microservices, Skalierung |
| **OpenTofu** | IaC | Multi-Cloud |
| **Ansible** | Automatisierung | Konfigurationsmanagement |
| **Hcloud** | Hetzner Cloud | Europäisches Hosting |
| **PgBouncer** | Connection Pooling | PostgreSQL Hochlast |
| **FrankenPHP** | PHP/Go-Server | PHP-Performance |

### Unterstützte Sprachen

Alle Inhalte sind in 5 Sprachen verfügbar: Englisch (en), Französisch (fr), Spanisch (es), Deutsch (de), Portugiesisch (pt)

---

## Voraussetzungen

### Erforderlich
- **Bash** - Shell zum Ausführen von Installationsskripten
- **Claude Code** - Der KI-Coding-Assistent von Anthropic

### Optional (Empfohlen)
```bash
# yq - YAML-Prozessor
brew install yq  # macOS
sudo apt install yq  # Linux

# jq - JSON-Prozessor (für StatusLine)
brew install jq  # macOS
sudo apt install jq  # Linux
```

---

## Schnellinstallation

### Methode 1: Makefile (Empfohlen)

```bash
git clone https://github.com/thebeardedcto/claude-craft.git
cd claude-craft

# Für Symfony-Projekt installieren (auf Deutsch)
make install-symfony TARGET=~/mein-projekt LANG=de
```

### Methode 2: Direktes Skript

```bash
./Dev/scripts/install-symfony-rules.sh --lang=de ~/mein-projekt
```

### Methode 3: YAML-Konfiguration (für Monorepos)

```bash
cp claude-projects.yaml.example claude-projects.yaml
nano claude-projects.yaml
make config-install CONFIG=claude-projects.yaml PROJECT=mein-projekt
```

---

## Ihr erstes Projekt in 5 Minuten

```bash
# Schritt 1: Projektverzeichnis erstellen
mkdir ~/meine-api && cd ~/meine-api && git init

# Schritt 2: Claude-Craft-Regeln installieren
make install-symfony TARGET=~/meine-api LANG=de

# Schritt 3: Installation überprüfen
ls -la ~/meine-api/.claude/

# Schritt 4: Projektkontext konfigurieren (wählen Sie eine Option)
# Option A: Interaktiv (empfohlen)
cd ~/meine-api && claude
# Dann ausführen: /common:setup-project-context

# Option B: Manuell
nano ~/meine-api/.claude/rules/00-project-context.md

# Schritt 5: Claude Code starten
cd ~/meine-api && claude
```

---

## Struktur verstehen

### Regeln (`rules/`)
Richtlinien, denen Claude bei der Arbeit an Ihrem Projekt folgt, nach Priorität nummeriert (00-12+).

### Agenten (`agents/`)
```markdown
@api-designer Entwerfe die REST-API für Benutzerverwaltung
@database-architect Erstelle das Schema für das Bestell-Aggregat
@symfony-reviewer Überprüfe meine UserService-Implementierung
```

### Befehle (`commands/`)
```bash
/symfony:generate-crud User
/symfony:check-compliance
/common:architecture-decision
```

### Vorlagen (`templates/`)
service.md, value-object.md, aggregate-root.md, test-unit.md

### Checklisten (`checklists/`)
feature-checklist.md, pre-commit.md, release.md, security-audit.md

---

## Schlüsselkonzepte

### 1. TDD-Workflow
```
1. Analysieren → 2. Tests → 3. Implementieren → 4. Refactoring → 5. Review
```

### 2. Clean Architecture
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
- 80%+ Testabdeckung
- Statische Analyse bestanden
- Sicherheitsaudit bestanden
- Dokumentation aktualisiert

---

## Nächste Schritte

1. **[Anleitung zur Projekterstellung](02-project-creation.md)**
2. **[Anleitung zur Feature-Entwicklung](03-feature-development.md)**
3. **[Anleitung zur Fehlerbehebung](04-bug-fixing.md)**

---

[Weiter: Projekterstellung &rarr;](02-project-creation.md)
