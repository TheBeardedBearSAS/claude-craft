# Anleitung zur Projekterstellung

Diese Anleitung begleitet Sie bei der Einrichtung eines neuen Projekts mit Claude-Craft.

---

## Technologie wählen

Claude-Craft unterstützt **18 Technologie-Stacks** (10 Entwicklung + 8 Infrastruktur):

### Entwicklungs-Stacks

| Technologie | Ideal für | Architektur | Hauptmerkmale |
|-------------|-----------|-------------|---------------|
| **C# / .NET** | Backend-APIs, Enterprise | Clean Architecture | CQRS, MediatR, EF Core |
| **Symfony / PHP** | Backend-APIs, Web-Apps | Clean Architecture + DDD | Doctrine, Messenger, API Platform |
| **Laravel / PHP** | Web-Apps, schnelle APIs | Clean Architecture | Actions, Pest PHP, Sanctum |
| **PHP** | Generische Clean Architecture | Clean Architecture | PSR-12, PHPStan, Pest PHP |
| **Flutter / Dart** | Mobile Apps | Feature-basiert + BLoC | Material/Cupertino, State Management |
| **Python** | APIs, Datendienste | Clean Architecture | FastAPI, async/await, Pydantic |
| **React** | Web-SPAs | Feature-basiert + Hooks | Zustand, React Query, Barrierefreiheit |
| **React Native** | Plattformübergreifend | Feature-basiert | Navigation 7, Reanimated 3 |
| **Angular** | Unternehmensanwendungen | Domain-driven | Signals, Standalone, RxJS |
| **Vue.js** | Web-SPAs | Composition API | Pinia, Vitest, TypeScript |

### Infrastruktur-Stacks

Docker, Coolify, Kubernetes, OpenTofu, Ansible, Hetzner Cloud, PgBouncer, FrankenPHP

### Wahl nach Projekttyp

| Projekttyp | Empfohlener Stack |
|------------|-------------------|
| REST-API | Symfony, Laravel oder Python |
| Mobile App (nativ) | Flutter |
| Mobile App (JS-Team) | React Native |
| Web-SPA | React, Vue.js oder Angular |
| Full-Stack Web | Symfony + React |
| Full-Stack Mobile | Symfony + Flutter |
| Microservices | Python (FastAPI) |
| Enterprise | C# / .NET oder Angular |

---

## Installationsmethoden

### Methode 1: Makefile (Empfohlen)

```bash
make install-{technologie} TARGET=pfad LANG=sprache

# Beispiele
make install-symfony TARGET=./backend LANG=de
make install-flutter TARGET=./mobile LANG=de
```

#### Optionen
```bash
OPTIONS="--dry-run"      # Vorschau ohne Änderungen
OPTIONS="--force"        # Dateien überschreiben
OPTIONS="--backup"       # Backup erstellen
OPTIONS="--interactive"  # Interaktiver Modus
OPTIONS="--update"       # Nur aktualisieren
```

### Methode 2: Direktes Skript

```bash
./Dev/scripts/install-symfony-rules.sh --lang=de ~/mein-projekt
```

### Methode 3: YAML-Konfiguration

```yaml
# claude-projects.yaml
settings:
  default_lang: "de"

projects:
  - name: "meine-plattform"
    path: "~/Projekte/meine-plattform"
    modules:
      - name: "api"
        path: "backend"
        technologies: ["symfony"]
      - name: "mobile"
        path: "app"
        technologies: ["flutter"]
```

```bash
make config-install CONFIG=claude-projects.yaml PROJECT=meine-plattform
```

---

## Einzeltechnologie-Projekte

### Symfony-Projekt
```bash
mkdir ~/meine-api && cd ~/meine-api && git init
make install-symfony TARGET=. LANG=de
```

### Flutter-Projekt
```bash
flutter create meine_app && cd meine_app && git init
make install-flutter TARGET=. LANG=de
```

### Python-Projekt
```bash
mkdir ~/meine-python-api && cd ~/meine-python-api && git init
make install-python TARGET=. LANG=de
```

---

## Konfiguration nach der Installation

### 1. Projektkontext (`rules/00-project-context.md`)

Dies ist die wichtigste Datei zum Anpassen.

**Option A: Interaktive Einrichtung (Empfohlen)**

Führen Sie diesen Befehl in Claude Code aus, um Ihren Stack zu erkennen und gezielte Fragen zu beantworten:
```bash
/common:setup-project-context
```

**Option B: Manuelle Konfiguration**

Bearbeiten Sie die Datei direkt mit Ihren Projektdetails:

```markdown
# Projektkontext

## Informationen
- **Name**: Meine E-Commerce-API
- **Typ**: REST-API für E-Commerce-Plattform

## Technischer Stack
- PHP 8.3 mit Symfony 7.0
- PostgreSQL 16
- Redis für Caching

## Konventionen
- Code auf Englisch, Dokumentation auf Deutsch
```

### 2. Hauptkonfiguration (`CLAUDE.md`)

Überprüfen und anpassen:
- Spracheinstellungen
- Architekturanforderungen
- Qualitätsanforderungen
- Docker-Anforderungen

---

## Start-Checkliste

### Vor der Installation
- [ ] Projektverzeichnis erstellt
- [ ] Git-Repository initialisiert
- [ ] Technologie-Stack entschieden

### Installation
- [ ] Claude-Craft-Regeln installiert
- [ ] Installation überprüft (`ls .claude/`)

### Konfiguration
- [ ] `00-project-context.md` angepasst
- [ ] `CLAUDE.md` überprüft

### Verifizierung
- [ ] Claude Code im Verzeichnis gestartet
- [ ] Befehle verfügbar
- [ ] Agenten reagieren

---

[&larr; Erste Schritte](01-getting-started.md) | [Feature-Entwicklung &rarr;](03-feature-development.md)
