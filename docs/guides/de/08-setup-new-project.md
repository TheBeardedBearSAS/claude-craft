# Claude-Craft für ein Neues Projekt Einrichten

Diese Schritt-für-Schritt-Anleitung führt Sie durch die Installation von Claude-Craft in einem brandneuen Projekt. Am Ende haben Sie eine vollständig konfigurierte Entwicklungsumgebung mit KI-Unterstützung.

**Benötigte Zeit:** ~10 Minuten

---

## Inhaltsverzeichnis

1. [Voraussetzungen-Checkliste](#1-voraussetzungen-checkliste)
2. [Projektverzeichnis Erstellen](#2-projektverzeichnis-erstellen)
3. [Git-Repository Initialisieren](#3-git-repository-initialisieren)
4. [Technologie-Stack Wählen](#4-technologie-stack-wählen)
5. [Claude-Craft Installieren](#5-claude-craft-installieren)
   - [Methode A: NPX (Ohne Klonen)](#methode-a-npx-ohne-klonen)
   - [Methode B: Makefile (Mehr Kontrolle)](#methode-b-makefile-mehr-kontrolle)
6. [Installation Überprüfen](#6-installation-überprüfen)
7. [Projektkontext Konfigurieren](#7-projektkontext-konfigurieren)
8. [Erster Start mit Claude Code](#8-erster-start-mit-claude-code)
9. [Setup Testen](#9-setup-testen)
10. [Fehlerbehebung](#10-fehlerbehebung)
11. [Nächste Schritte](#11-nächste-schritte)

---

## 1. Voraussetzungen-Checkliste

Stellen Sie vor dem Start sicher, dass Folgendes installiert ist:

### Erforderlich

- [ ] **Terminal/Kommandozeile** - Beliebige Terminal-Anwendung
- [ ] **Node.js 20+** - Erforderlich für NPX-Installation
- [ ] **Git** - Für Versionskontrolle
- [ ] **Claude Code** - Der KI-Coding-Assistent

### Voraussetzungen Überprüfen

Öffnen Sie Ihr Terminal und führen Sie diese Befehle aus:

```bash
# Node.js-Version prüfen (sollte 16 oder höher sein)
node --version
```
Erwartete Ausgabe: `v20.x.x` oder höher (z.B. `v20.10.0`)

```bash
# Git-Version prüfen
git --version
```
Erwartete Ausgabe: `git version 2.x.x` (z.B. `git version 2.43.0`)

```bash
# Prüfen ob Claude Code installiert ist
claude --version
```
Erwartete Ausgabe: Versionsnummer (z.B. `1.0.x`)

### Fehlende Voraussetzungen Installieren

Falls ein Befehl oben fehlschlägt:

**Node.js:** Download von [nodejs.org](https://nodejs.org/) oder verwenden Sie:
```bash
# macOS mit Homebrew
brew install node

# Ubuntu/Debian
sudo apt install nodejs npm
```

**Git:** Download von [git-scm.com](https://git-scm.com/) oder verwenden Sie:
```bash
# macOS mit Homebrew
brew install git

# Ubuntu/Debian
sudo apt install git
```

**Claude Code:** Folgen Sie der [offiziellen Installationsanleitung](https://code.claude.com/docs/en/installation)

---

## 2. Projektverzeichnis Erstellen

Wählen Sie, wo Sie Ihr Projekt erstellen möchten, und führen Sie aus:

```bash
# Projektverzeichnis erstellen
mkdir ~/mein-projekt

# Hinein navigieren
cd ~/mein-projekt
```

**Überprüfung:** Führen Sie `pwd` aus, um zu bestätigen, dass Sie im richtigen Verzeichnis sind:
```bash
pwd
```
Erwartete Ausgabe: `/home/ihrname/mein-projekt` (oder `/Users/ihrname/mein-projekt` auf macOS)

---

## 3. Git-Repository Initialisieren

Claude-Craft funktioniert am besten mit Git-verfolgten Projekten:

```bash
# Git-Repository initialisieren
git init
```

Erwartete Ausgabe:
```
Initialized empty Git repository in /home/ihrname/mein-projekt/.git/
```

**Überprüfung:** Prüfen Sie, ob der `.git`-Ordner existiert:
```bash
ls -la
```
Sie sollten ein `.git/`-Verzeichnis in der Ausgabe sehen.

---

## 4. Technologie-Stack Wählen

Claude-Craft unterstützt mehrere Technologie-Stacks. Wählen Sie den, der zu Ihrem Projekt passt:

| Stack | Ideal Für | Befehls-Flag |
|-------|-----------|--------------|
| **C# / .NET** | Enterprise-APIs, Microservices | `--tech=csharp` |
| **Symfony / PHP** | PHP-APIs, Web-Apps, Backend-Services | `--tech=symfony` |
| **Laravel / PHP** | Web-Apps, schnelle APIs | `--tech=laravel` |
| **PHP** | Generische Clean Architecture | `--tech=php` |
| **Flutter / Dart** | Mobile Apps (iOS/Android) | `--tech=flutter` |
| **Python** | APIs, Datendienste, ML-Backends | `--tech=python` |
| **React** | Web-SPAs, Dashboards | `--tech=react` |
| **React Native** | Plattformübergreifende Mobile Apps | `--tech=reactnative` |
| **Angular** | Unternehmensanwendungen, SPAs | `--tech=angular` |
| **Vue.js** | Web-SPAs, Dashboards | `--tech=vuejs` |
| **Nur Common** | Jedes Projekt (generische Regeln) | `--tech=common` |

**Wählen Sie Ihre Sprache:**

| Sprache | Flag |
|---------|------|
| Englisch | `--lang=en` |
| Französisch | `--lang=fr` |
| Spanisch | `--lang=es` |
| Deutsch | `--lang=de` |
| Portugiesisch | `--lang=pt` |

---

## 5. Claude-Craft Installieren

Sie haben zwei Installationsmethoden. Wählen Sie die, die zu Ihren Bedürfnissen passt:

### Methode A: NPX (Ohne Klonen)

**Ideal für:** Schnelle Einrichtung, Erstbenutzer, CI/CD-Pipelines

Diese Methode lädt Claude-Craft herunter und führt es direkt aus, ohne das Repository zu klonen.

```bash
# Ersetzen Sie 'symfony' mit Ihrem Tech-Stack und 'de' mit Ihrer Sprache
npx @the-bearded-bear/claude-craft install ~/mein-projekt --tech=symfony --lang=de
```

**Beispiel für ein Flutter-Projekt auf Englisch:**
```bash
npx @the-bearded-bear/claude-craft install ~/mein-projekt --tech=flutter --lang=en
```

Erwartete Ausgabe:
```
Installing Claude-Craft rules...
  ✓ Common rules installed
  ✓ Symfony rules installed
  ✓ Agents installed
  ✓ Commands installed
  ✓ Templates installed
  ✓ Checklists installed
  ✓ CLAUDE.md generated

Installation complete! Run 'claude' in your project directory to start.
```

**Bei einem Fehler:**
- `npm ERR! 404` → Überprüfen Sie Ihre Internetverbindung
- `EACCES: permission denied` → Führen Sie mit `sudo` aus oder korrigieren Sie npm-Berechtigungen
- `command not found: npx` → Installieren Sie zuerst Node.js

---

### Methode B: Makefile (Mehr Kontrolle)

**Ideal für:** Anpassung, Projekt-Beitragende, Offline-Nutzung

Diese Methode erfordert zuerst das Klonen des Claude-Craft-Repositories.

#### Schritt B.1: Claude-Craft Klonen

```bash
# An einen permanenten Ort klonen
git clone https://github.com/TheBeardedBearSAS/claude-craft.git ~/claude-craft
```

Erwartete Ausgabe:
```
Cloning into '/home/ihrname/claude-craft'...
remote: Enumerating objects: XXX, done.
...
Resolving deltas: 100% (XXX/XXX), done.
```

#### Schritt B.2: Installation Ausführen

```bash
# Zum Claude-Craft-Verzeichnis navigieren
cd ~/claude-craft

# Regeln in Ihr Projekt installieren
# Ersetzen Sie 'symfony' mit Ihrem Tech und 'de' mit Ihrer Sprache
make install-symfony TARGET=~/mein-projekt LANG=de
```

**Beispiele für andere Stacks:**
```bash
# Flutter auf Englisch
make install-flutter TARGET=~/mein-projekt LANG=en

# React auf Französisch
make install-react TARGET=~/mein-projekt LANG=fr

# Python auf Spanisch
make install-python TARGET=~/mein-projekt LANG=es

# Nur gemeinsame Regeln (jedes Projekt)
make install-common TARGET=~/mein-projekt LANG=de
```

Erwartete Ausgabe:
```
Installing Symfony rules to /home/ihrname/mein-projekt...
  Creating .claude directory...
  Copying rules... done
  Copying agents... done
  Copying commands... done
  Copying templates... done
  Copying checklists... done
  Generating CLAUDE.md... done

Installation complete!
```

---

## 6. Installation Überprüfen

Nach der Installation überprüfen Sie, ob alles vorhanden ist:

```bash
# Zu Ihrem Projekt navigieren
cd ~/mein-projekt

# Das .claude-Verzeichnis auflisten
ls -la .claude/
```

Erwartete Ausgabe:
```
total XX
drwxr-xr-x  8 user user 4096 Jan 12 10:00 .
drwxr-xr-x  3 user user 4096 Jan 12 10:00 ..
-rw-r--r--  1 user user 2048 Jan 12 10:00 CLAUDE.md
drwxr-xr-x  2 user user 4096 Jan 12 10:00 agents
drwxr-xr-x  2 user user 4096 Jan 12 10:00 checklists
drwxr-xr-x  4 user user 4096 Jan 12 10:00 commands
drwxr-xr-x  2 user user 4096 Jan 12 10:00 rules
drwxr-xr-x  2 user user 4096 Jan 12 10:00 templates
```

### Jede Komponente Überprüfen

```bash
# Regeln zählen (sollte 15-25 je nach Stack sein)
ls .claude/rules/*.md | wc -l

# Agenten zählen (sollte 5-12 sein)
ls .claude/agents/*.md | wc -l

# Befehle zählen (sollte Unterverzeichnisse haben)
ls .claude/commands/
```

**Falls Dateien fehlen:**
- Führen Sie den Installationsbefehl erneut aus
- Überprüfen Sie, ob Sie Schreibberechtigungen für das Verzeichnis haben
- Siehe Abschnitt [Fehlerbehebung](#10-fehlerbehebung)

---

## 7. Projektkontext Konfigurieren

Die wichtigste Datei zum Anpassen ist Ihr Projektkontext. Sie teilt Claude die Besonderheiten IHRES Projekts mit.

### Option A: Interaktive Einrichtung (Empfohlen)

Verwenden Sie den integrierten Befehl, um Ihren Stack automatisch zu erkennen und gezielte Fragen zu beantworten:

```bash
# Claude Code starten
claude

# Einrichtungsbefehl ausführen
/common:setup-project-context
```

Der Befehl wird:
1. **Auto-erkennen** Ihren Tech-Stack, Framework, Datenbank und CI/CD
2. **Fragen stellen** für fehlende Informationen (App-Typ, Domäne, Benutzer, Compliance)
3. **Generieren** einer vollständigen `.claude/rules/00-project-context.md` Datei
4. **Nächste Schritte vorschlagen** (auszuführende Agenten, zu vervollständigende Abschnitte)

**Verfügbare Modi:**
- `(Standard)` - Ausgewogene Erkennung + wesentliche Fragen
- `--auto` - Maximale Auto-Erkennung, minimale Fragen
- `--full` - Umfassender Fragebogen einschließlich Ziele und Glossar

### Option B: Manuelle Konfiguration

Wenn Sie manuell konfigurieren möchten, öffnen Sie die Datei direkt:

```bash
# In Ihrem Editor öffnen (ersetzen Sie 'nano' mit 'code', 'vim', etc.)
nano .claude/rules/00-project-context.md
```

### Abschnitte zum Anpassen

Finden und aktualisieren Sie diese Abschnitte:

```markdown
## Projektübersicht
- **Name**: [Ihr Projektname]
- **Beschreibung**: [Was macht Ihr Projekt?]
- **Typ**: [API / Web-App / Mobile App / CLI / Bibliothek]

## Technischer Stack
- **Framework**: [z.B. Symfony 7.0, Flutter 3.16]
- **Sprachversion**: [z.B. PHP 8.3, Dart 3.2]
- **Datenbank**: [z.B. PostgreSQL 16, MySQL 8]

## Team-Konventionen
- **Code-Stil**: [z.B. PSR-12, Effective Dart]
- **Branch-Strategie**: [z.B. GitFlow, Trunk-based]
- **Commit-Format**: [z.B. Conventional Commits]

## Projektspezifische Regeln
- [Fügen Sie alle benutzerdefinierten Regeln für Ihr Projekt hinzu]
```

### Beispiel: E-Commerce-API

```markdown
## Projektübersicht
- **Name**: ShopAPI
- **Beschreibung**: RESTful API für E-Commerce-Plattform
- **Typ**: API

## Technischer Stack
- **Framework**: Symfony 7.0 mit API Platform
- **Sprachversion**: PHP 8.3
- **Datenbank**: PostgreSQL 16

## Team-Konventionen
- **Code-Stil**: PSR-12
- **Branch-Strategie**: GitFlow
- **Commit-Format**: Conventional Commits

## Projektspezifische Regeln
- Alle Preise müssen in Cents gespeichert werden (Integer)
- UUID v7 für alle Entity-Identifikatoren verwenden
- Soft Delete für alle Entities erforderlich
```

Speichern Sie die Datei, wenn fertig (in nano: `Strg+O`, dann `Enter`, dann `Strg+X`).

---

## 8. Erster Start mit Claude Code

Jetzt starten wir Claude Code und überprüfen, ob alles funktioniert:

```bash
# Stellen Sie sicher, dass Sie im Projektverzeichnis sind
cd ~/mein-projekt

# Claude Code starten
claude
```

Sie sollten sehen, dass Claude Code mit einem Prompt startet.

### Testen, ob Regeln Aktiv Sind

Geben Sie diese Nachricht an Claude ein:

```
Welche Regeln und Richtlinien befolgst du für dieses Projekt?
```

Claude sollte antworten und erwähnen:
- Projektkontext aus `00-project-context.md`
- Architekturregeln
- Testing-Anforderungen
- Technologiespezifische Richtlinien

**Falls Claude Ihre Regeln nicht erwähnt:**
- Stellen Sie sicher, dass Sie im Projektstamm sind (nicht in einem Unterverzeichnis)
- Überprüfen Sie, ob das `.claude/`-Verzeichnis existiert
- Starten Sie Claude Code neu

---

## 9. Setup Testen

Führen Sie diese Schnelltests aus, um zu überprüfen, ob alles funktioniert:

### Test 1: Verfügbare Befehle Prüfen

Fragen Sie Claude:
```
Liste alle verfügbaren Slash-Befehle für dieses Projekt auf
```

Erwartet: Claude sollte Befehle wie `/common:analyze-feature`, `/{tech}:generate-crud`, etc. auflisten.

### Test 2: Einen Agenten Verwenden

Versuchen Sie, einen Agenten aufzurufen:
```
@tdd-coach Hilf mir zu verstehen, wie ich Tests für dieses Projekt schreibe
```

Erwartet: Claude sollte als TDD-Coach-Agent mit Testing-Anleitungen antworten.

### Test 3: Einen Befehl Ausführen

Versuchen Sie einen einfachen Befehl:
```
/common:pre-commit-check
```

Erwartet: Claude sollte eine Pre-Commit-Qualitätsprüfung ausführen (kann keine Änderungen melden, wenn das Projekt leer ist).

### Validierungs-Checkliste

- [ ] Claude Code startet ohne Fehler
- [ ] Claude erwähnt Projektregeln auf Nachfrage
- [ ] Slash-Befehle werden erkannt
- [ ] Agenten antworten mit Fachwissen
- [ ] Projektkontext spiegelt sich in Antworten wider

---

## 10. Fehlerbehebung

### Installationsprobleme

**Problem:** `Permission denied` während der Installation
```bash
# Lösung 1: Verzeichnisberechtigungen korrigieren
chmod 755 ~/mein-projekt

# Lösung 2: Mit sudo ausführen (nicht empfohlen für npm)
sudo npx @the-bearded-bear/claude-craft install ...
```

**Problem:** `Command not found: npx`
```bash
# Lösung: Node.js installieren
brew install node  # macOS
sudo apt install nodejs npm  # Ubuntu/Debian
```

**Problem:** `ENOENT: no such file or directory`
```bash
# Lösung: Zuerst das Zielverzeichnis erstellen
mkdir -p ~/mein-projekt
```

### Laufzeitprobleme

**Problem:** Claude sieht die Regeln nicht
- Überprüfen Sie, ob Sie im Projektstamm sind: `pwd`
- Überprüfen Sie, ob `.claude/` existiert: `ls -la .claude/`
- Starten Sie Claude Code neu: beenden und `claude` erneut ausführen

**Problem:** Befehle werden nicht erkannt
- Befehlsverzeichnis prüfen: `ls .claude/commands/`
- Dateiberechtigungen prüfen: `ls -la .claude/commands/*.md`

**Problem:** Agenten antworten nicht
- Agentenverzeichnis prüfen: `ls .claude/agents/`
- Richtige Syntax verwenden: `@agent-name nachricht`

### Hilfe Erhalten

Falls Sie noch feststecken:
1. Konsultieren Sie die [Fehlerbehebungsanleitung](06-troubleshooting.md)
2. Suchen Sie in den [GitHub Issues](https://github.com/TheBeardedBearSAS/claude-craft/issues)
3. Eröffnen Sie ein neues Issue mit Ihrer Fehlermeldung

---

## 11. Nächste Schritte

Herzlichen Glückwunsch! Ihre Claude-Craft-Umgebung ist bereit. Das kommt als Nächstes:

### Unmittelbare Nächste Schritte

1. **Ihre Konfiguration committen:**
   ```bash
   git add .claude/
   git commit -m "feat: add Claude-Craft configuration"
   ```

2. **Mit dem Aufbau Ihres Projekts beginnen** mit KI-Unterstützung

3. **Die Feature-Entwicklungsanleitung lesen**, um den TDD-Workflow zu lernen

### Empfohlene Lektüre

| Anleitung | Beschreibung |
|-----------|--------------|
| [Feature-Entwicklung](03-feature-development.md) | TDD-Workflow mit Agenten und Befehlen |
| [Fehlerbehebung](04-bug-fixing.md) | Diagnose und Regressionstests |
| [Werkzeug-Referenz](05-tools-reference.md) | Multi-Account, StatusLine-Utilities |
| [Zu Bestehendem Projekt Hinzufügen](09-setup-existing-project.md) | Für Ihre anderen Projekte |

### Schnellreferenzkarte

```bash
# Claude Code starten
claude

# Häufige Agenten
@api-designer      # API-Design
@database-architect # Datenbankschema
@tdd-coach         # Testing-Hilfe
@{tech}-reviewer   # Code-Review

# Häufige Befehle
/common:analyze-feature     # Anforderungen analysieren
/{tech}:generate-crud       # CRUD-Code generieren
/common:pre-commit-check    # Qualitätsprüfung
/common:security-audit      # Sicherheitsaudit
```

---

[&larr; Vorherige: Backlog-Management](07-backlog-management.md) | [Nächste: Zu Bestehendem Projekt Hinzufügen &rarr;](09-setup-existing-project.md)
