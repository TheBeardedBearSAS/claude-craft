# Schnellstart - Claude Craft in 5 Minuten

Starten Sie mit Claude Craft in nur 5 Minuten!

---

## Voraussetzungen prüfen

Bevor Sie beginnen, überprüfen Sie, ob diese Tools installiert sind:

```bash
# Node.js überprüfen (18+ erforderlich)
node --version

# npm überprüfen
npm --version

# yq überprüfen (für YAML-Konfiguration erforderlich)
yq --version

# Docker überprüfen (empfohlen)
docker --version
```

**Fehlt etwas?** Siehe [Voraussetzungen-Anleitung](PREREQUISITES.md) für Installationsanweisungen.

---

## Installation

### Methode 1: NPX (Empfohlen)

Der schnellste Weg zum Start:

```bash
# Interaktiver Assistent
npx @the-bearded-bear/claude-craft

# Oder direkt in ein Projekt installieren
npx @the-bearded-bear/claude-craft install ~/mein-projekt --tech=symfony --lang=de
```

### Methode 2: Clone + Makefile

```bash
# 1. Repository klonen
git clone https://github.com/TheBeardedBearSAS/claude-craft.git
cd claude-craft

# 2. In Ihr Projekt installieren (wählen Sie Ihre Technologie)
make install-symfony TARGET=~/mein-projekt RULES_LANG=de
```

---

## Ihr erstes Projekt in 3 Befehlen

```bash
# 1. Neues Projektverzeichnis erstellen
mkdir ~/meine-erste-app && cd ~/meine-erste-app && git init

# 2. Claude Craft Regeln installieren (Beispiel: Symfony + Deutsch)
npx @the-bearded-bear/claude-craft install . --tech=symfony --lang=de

# 3. Claude Code starten
claude
```

Das war's! Sie haben jetzt Zugriff auf alle Claude Craft Funktionen.

---

## Installation überprüfen

```bash
# Installierte Dateien auflisten
ls -la ~/meine-erste-app/.claude/

# Sie sollten sehen:
# CLAUDE.md          - Hauptkonfiguration
# INDEX.md           - Schnellreferenz
# references/        - Vollständige Dokumentation
# agents/            - KI-Spezialisten
# commands/          - Slash-Befehle
# skills/            - Best Practices
```

---

## Testen Sie Ihre ersten Befehle

In Claude Code, probieren Sie diese Befehle:

```
# Projektarchitektur überprüfen
/symfony:check-architecture

# Code-Review erhalten
@symfony-reviewer Überprüfe meinen src/ Ordner

# Neue Entität mit CRUD generieren
/symfony:generate-crud Produkt
```

---

## Was kommt als Nächstes?

| Aufgabe | Anleitung |
|---------|-----------|
| Projektstruktur verstehen | [Architektur-Guide](ARCHITECTURE.md) |
| Vollständiges Feature erstellen | [Feature-Entwicklung](../guides/de/03-feature-development.md) |
| BMAD Projektmanagement einrichten | [BMAD Praktischer Guide](BMAD-PRACTICAL-GUIDE.md) |
| Claude in Dauerschleife ausführen | [Ralph Wiggum Guide](RALPH-GUIDE.md) |

---

## Verfügbare Technologien

| Technologie | Installationsbefehl | Fokus |
|-------------|---------------------|-------|
| Symfony/PHP | `make install-symfony` | Clean Architecture, DDD |
| Flutter/Dart | `make install-flutter` | BLoC, Riverpod |
| React | `make install-react` | Hooks, State Management |
| React Native | `make install-reactnative` | Mobile, Navigation |
| Python | `make install-python` | FastAPI, async/await |
| Angular | `make install-angular` | Signals, Standalone |
| C#/.NET | `make install-csharp` | Clean Architecture, CQRS |
| Laravel | `make install-laravel` | Clean Architecture, Pest |
| Vue.js | `make install-vuejs` | Composition API, Pinia |
| PHP | `make install-php` | Clean Architecture, PSR-12 |

---

## Brauchen Sie Hilfe?

- **FAQ**: Häufige Fragen → [FAQ.md](FAQ.md)
- **Fehlerbehebung**: Häufige Fehler → [TROUBLESHOOTING.md](TROUBLESHOOTING.md)
- **GitHub Issues**: [Bug melden](https://github.com/TheBeardedBearSAS/claude-craft/issues)
