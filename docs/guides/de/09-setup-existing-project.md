# Claude-Craft zu einem Bestehenden Projekt Hinzufügen

Diese umfassende Anleitung führt Sie durch das Hinzufügen von Claude-Craft zu einem Projekt, das bereits Code hat. Sie lernen, wie Sie sicher installieren, Claude Ihre Codebase verstehen lassen und Ihre ersten KI-unterstützten Änderungen pushen.

**Benötigte Zeit:** ~20-30 Minuten

---

## Inhaltsverzeichnis

1. [Bevor Sie Beginnen](#1-bevor-sie-beginnen)
2. [Ihr Projekt Sichern](#2-ihr-projekt-sichern)
3. [Projektstruktur Analysieren](#3-projektstruktur-analysieren)
4. [Konflikte Prüfen](#4-konflikte-prüfen)
5. [Technologie-Stack Wählen](#5-technologie-stack-wählen)
6. [Claude-Craft Installieren](#6-claude-craft-installieren)
7. [Konfigurationen Zusammenführen](#7-konfigurationen-zusammenführen)
8. [Claude Ihre Codebase Verstehen Lassen](#8-claude-ihre-codebase-verstehen-lassen)
9. [Ihre Erste Änderung](#9-ihre-erste-änderung)
10. [Team-Onboarding](#10-team-onboarding)
11. [Migration von Anderen KI-Tools](#11-migration-von-anderen-ki-tools)
12. [Fehlerbehebung](#12-fehlerbehebung)

---

## 1. Bevor Sie Beginnen

### Wichtige Warnungen

> **Warnung:** Die Installation von Claude-Craft erstellt ein `.claude/`-Verzeichnis in Ihrem Projekt. Falls bereits eines existiert, müssen Sie entscheiden, ob Sie es zusammenführen, ersetzen oder beibehalten möchten.

> **Warnung:** Erstellen Sie immer einen Backup-Branch vor der Installation. Dies ermöglicht ein einfaches Rollback, falls etwas schiefgeht.

### Voraussetzungen-Checkliste

- [ ] Ihr Projekt wird von Git verfolgt
- [ ] Sie haben alle aktuellen Änderungen committet
- [ ] Sie haben Schreibzugriff auf das Projektverzeichnis
- [ ] Node.js 20+ installiert (für die NPX-Methode)
- [ ] Claude Code installiert

### Wann NICHT Installieren

Erwägen Sie, die Installation zu verschieben, wenn:
- Sie nicht committete Änderungen haben
- Sie mitten in einem kritischen Release sind
- Das Projekt eine komplexe bestehende `.claude/`-Konfiguration hat
- Mehrere Teammitglieder aktiv pushen

---

## 2. Ihr Projekt Sichern

**Überspringen Sie diesen Schritt nie.** Erstellen Sie einen Backup-Branch vor der Installation.

### Backup-Branch Erstellen

```bash
# Zu Ihrem Projekt navigieren
cd ~/ihr-bestehendes-projekt

# Sicherstellen, dass alles committet ist
git status
```

Falls Sie nicht committete Änderungen sehen:
```bash
git add .
git commit -m "chore: save work before Claude-Craft installation"
```

Jetzt das Backup erstellen:
```bash
# Erstellen und auf Backup-Branch bleiben
git checkout -b backup/before-claude-craft

# Zurück zu Ihrem Hauptbranch
git checkout main  # oder 'master' oder Ihr Standard-Branch
```

### Backup Überprüfen

```bash
# Bestätigen, dass Backup-Branch existiert
git branch | grep backup
```

Erwartete Ausgabe:
```
  backup/before-claude-craft
```

### Rollback-Plan

Falls etwas schiefgeht, können Sie zurückrollen:
```bash
# Alle Änderungen verwerfen und zum Backup zurückkehren
git checkout backup/before-claude-craft
git branch -D main
git checkout -b main
```

---

## 3. Projektstruktur Analysieren

Vor der Installation verstehen Sie, was Sie bereits haben.

### Auf Bestehendes .claude-Verzeichnis Prüfen

```bash
# Prüfen ob .claude bereits existiert
ls -la .claude/ 2>/dev/null || echo "No .claude directory found"
```

**Falls .claude existiert:**
- Notieren Sie, welche Dateien darin sind
- Entscheiden Sie: zusammenführen, ersetzen oder beibehalten
- Siehe [Abschnitt 7: Konfigurationen Zusammenführen](#7-konfigurationen-zusammenführen)

### Projektstruktur Identifizieren

```bash
# Stammverzeichnis auflisten
ls -la

# Verzeichnisbaum anzeigen (erste 2 Ebenen)
find . -maxdepth 2 -type d | head -20
```

Notieren Sie:
- Haupt-Quellverzeichnisse (`src/`, `app/`, `lib/`)
- Konfigurationsdateien (`.env`, `config/`, `settings/`)
- Test-Verzeichnisse (`tests/`, `test/`, `spec/`)
- Dokumentation (`docs/`, `README.md`)

### Auf Andere KI-Tool-Konfigurationen Prüfen

```bash
# Cursor-Regeln prüfen
ls -la .cursorrules 2>/dev/null

# GitHub Copilot-Anweisungen prüfen
ls -la .github/copilot-instructions.md 2>/dev/null

# Andere Claude-Configs prüfen
ls -la CLAUDE.md 2>/dev/null
```

Notieren Sie bestehende Konfigurationen - Sie möchten diese vielleicht migrieren (siehe [Abschnitt 11](#11-migration-von-anderen-ki-tools)).

---

## 4. Konflikte Prüfen

### Dateien, die Konflikte Verursachen Können

| Datei/Verzeichnis | Claude-Craft Erstellt | Ihr Projekt Kann Haben |
|-------------------|----------------------|------------------------|
| `.claude/` | Ja | Vielleicht |
| `.claude/CLAUDE.md` | Ja | Vielleicht |
| `.claude/rules/` | Ja | Vielleicht |
| `CLAUDE.md` (Stamm) | Nein | Vielleicht |

### Entscheidungsmatrix

| Szenario | Empfehlung |
|----------|------------|
| Kein `.claude/` existiert | Normal installieren |
| Leeres `.claude/` existiert | Mit `--force` installieren |
| `.claude/` hat benutzerdefinierte Regeln | `--preserve-config` verwenden |
| `CLAUDE.md` im Stamm existiert | Behalten, wird nicht konfligieren |

---

## 5. Technologie-Stack Wählen

Identifizieren Sie die Haupttechnologie Ihres Projekts:

| Ihr Projekt Verwendet | Installationsbefehl |
|-----------------------|---------------------|
| C#/.NET | `--tech=csharp` |
| PHP/Symfony | `--tech=symfony` |
| PHP/Laravel | `--tech=laravel` |
| PHP (generisch) | `--tech=php` |
| Dart/Flutter | `--tech=flutter` |
| Python/FastAPI/Django | `--tech=python` |
| JavaScript/React | `--tech=react` |
| JavaScript/React Native | `--tech=reactnative` |
| TypeScript/Angular | `--tech=angular` |
| JavaScript/Vue.js | `--tech=vuejs` |
| Mehrere/Andere | `--tech=common` |

**Für Monorepos:** Installieren Sie in jedem Unterprojekt separat (siehe unten).

---

## 6. Claude-Craft Installieren

### Standard-Installation

**Methode A: NPX (Empfohlen)**
```bash
cd ~/ihr-bestehendes-projekt
npx @the-bearded-bear/claude-craft install . --tech=symfony --lang=de
```

**Methode B: Makefile**
```bash
cd ~/claude-craft
make install-symfony TARGET=~/ihr-bestehendes-projekt RULES_LANG=de
```

### Bestehende Konfiguration Beibehalten

Falls Sie bestehende `.claude/`-Dateien haben, die Sie behalten möchten:

```bash
# NPX mit Preserve-Flag
npx @the-bearded-bear/claude-craft install . --tech=symfony --lang=de --preserve-config

# Makefile mit Preserve-Flag
make install-symfony TARGET=~/ihr-bestehendes-projekt RULES_LANG=de OPTIONS="--preserve-config"
```

**Was `--preserve-config` behält:**
- `CLAUDE.md` (Ihre Projektbeschreibung)
- `rules/00-project-context.md` (Ihr benutzerdefinierter Kontext)
- Alle benutzerdefinierten Regeln, die Sie hinzugefügt haben

### Monorepo-Installation

Für Projekte mit mehreren Apps:

```
mein-monorepo/
├── frontend/    (React)
├── backend/     (Symfony)
└── mobile/      (Flutter)
```

In jedes Verzeichnis installieren:
```bash
# React ins Frontend installieren
npx @the-bearded-bear/claude-craft install ./frontend --tech=react --lang=de

# Symfony ins Backend installieren
npx @the-bearded-bear/claude-craft install ./backend --tech=symfony --lang=de

# Flutter ins Mobile installieren
npx @the-bearded-bear/claude-craft install ./mobile --tech=flutter --lang=de
```

### Installation Überprüfen

```bash
ls -la .claude/
```

Erwartete Struktur:
```
.claude/
├── CLAUDE.md
├── agents/
├── checklists/
├── commands/
├── rules/
└── templates/
```

---

## 7. Konfigurationen Zusammenführen

Falls Sie bestehende Konfigurationen hatten, führen Sie diese jetzt zusammen.

### CLAUDE.md Zusammenführen

Falls Sie eine benutzerdefinierte `CLAUDE.md` hatten:

1. Beide Dateien öffnen:
   ```bash
   # Ihre alte Datei (falls gesichert)
   cat .claude/CLAUDE.md.backup

   # Neue Claude-Craft-Datei
   cat .claude/CLAUDE.md
   ```

2. Ihre benutzerdefinierten Abschnitte in die neue Datei kopieren
3. Claude-Craft-Struktur beibehalten, Ihren Inhalt hinzufügen

### Benutzerdefinierte Regeln Zusammenführen

Falls Sie benutzerdefinierte Regeln in `rules/` hatten:

1. Claude-Craft-Regeln sind nummeriert `01-xx.md` bis `12-xx.md`
2. Fügen Sie Ihre benutzerdefinierten Regeln als `90-custom-rule.md`, `91-another-rule.md` hinzu
3. Höhere Nummern = niedrigere Priorität, aber immer noch enthalten

### Beispiel-Zusammenführung

```bash
# Ihre alte benutzerdefinierte Regel umbenennen
mv .claude/rules/my-custom-rules.md .claude/rules/90-project-custom-rules.md
```

---

## 8. Claude Ihre Codebase Verstehen Lassen

**Dies ist der wichtigste Abschnitt.** Eine erfolgreiche Claude-Craft-Einrichtung bedeutet nicht nur, Dateien zu installieren—es geht darum, Claude Ihr Projekt wirklich verstehen zu lassen.

### 8.1 Erste Codebase-Erkundung

Claude Code in Ihrem Projekt starten:

```bash
cd ~/ihr-bestehendes-projekt
claude
```

Mit einer breiten Erkundung beginnen:

```
Erkunde diese Codebase und gib mir eine umfassende Zusammenfassung von:
1. Der gesamten Projektstruktur
2. Hauptverzeichnissen und deren Zwecken
3. Wichtigen Einstiegspunkten
4. Konfigurationsdateien, die du findest
```

**Erwartetes Ergebnis:** Claude sollte Ihre Projektstruktur genau beschreiben. Falls es Dinge falsch versteht, korrigieren Sie es—das hilft Claude zu lernen.

**Claudes Verständnis überprüfen:**
```
Basierend auf dem, was du gefunden hast, um was für ein Projekttyp handelt es sich?
Welches Framework oder welcher Technologie-Stack wird verwendet?
```

### 8.2 Architektur Verstehen

Claude bitten, Architekturmuster zu identifizieren:

```
Analysiere die Architektur dieses Projekts:
1. Welches Architekturmuster wird befolgt? (MVC, Clean Architecture, etc.)
2. Was sind die Hauptschichten und ihre Verantwortlichkeiten?
3. Wie ist der Code in Module/Domänen organisiert?
4. Welche Designmuster siehst du verwendet werden?
```

**Mit spezifischen Fragen überprüfen:**
```
Zeig mir ein Beispiel, wie eine Anfrage durch das System fließt,
vom Einstiegspunkt zur Datenbank und zurück.
```

Falls Claudes Analyse genau ist, großartig! Falls nicht, korrigieren Sie:
```
Eigentlich verwendet dieses Projekt Clean Architecture mit diesen Schichten:
- Domain (src/Domain/)
- Application (src/Application/)
- Infrastructure (src/Infrastructure/)
- Presentation (src/Controller/)
Bitte aktualisiere dein Verständnis.
```

### 8.3 Geschäftslogik Entdecken

Claude helfen zu verstehen, was Ihr Projekt tatsächlich macht:

```
Was sind die Hauptgeschäftsdomänen oder Funktionen in dieser Codebase?
Liste die Kern-Entities auf und erkläre ihre Beziehungen.
```

**Spezialisierte Agenten verwenden:**

```
@database-architect
Analysiere das Datenbankschema in diesem Projekt.
Was sind die Haupt-Entities, ihre Beziehungen und Muster, die du bemerkst?
```

```
@api-designer
Überprüfe die API-Endpunkte in diesem Projekt.
Welche Ressourcen werden exponiert? Welche Muster werden verwendet?
```

### 8.4 Kontext Dokumentieren

Sie haben zwei Optionen zur Konfiguration des Projektkontexts:

**Option A: Interaktive Einrichtung (Empfohlen)**

Verwenden Sie den integrierten Befehl, um Ihren Stack automatisch zu erkennen und gezielte Fragen zu beantworten:

```bash
/common:setup-project-context
```

Der Befehl analysiert Ihre vorhandene Codebase, erkennt Technologien und fragt nur nach fehlenden Informationen.

**Option B: Manuelle Konfiguration**

Die Projektkontext-Datei manuell erstellen oder aktualisieren:

```bash
nano .claude/references/<your-tech>/project-context.md
```

Das Template mit dem Entdeckten ausfüllen:

```markdown
## Projektübersicht
- **Name**: [Ihr Projektname]
- **Beschreibung**: [Was Claude gelernt hat + Ihre Ergänzungen]
- **Domäne**: [z.B. E-Commerce, Gesundheitswesen, FinTech]

## Architektur
- **Muster**: [Was Claude identifiziert hat]
- **Schichten**: [Auflisten]
- **Schlüsselverzeichnisse**:
  - `src/Domain/` - Geschäftslogik und Entities
  - `src/Application/` - Use Cases und Services
  - [etc.]

## Geschäftskontext
- **Haupt-Entities**: [Kern-Domänenobjekte auflisten]
- **Schlüssel-Workflows**: [Haupt-User-Journeys beschreiben]
- **Externe Integrationen**: [APIs, Services, mit denen Sie sich verbinden]

## Entwicklungskonventionen
- **Testing**: [Ihr Testing-Ansatz]
- **Code-Stil**: [Ihre Standards]
- **Git-Workflow**: [Ihre Branch-Strategie]

## Wichtige Hinweise für KI
- [Alles, was Claude immer bedenken sollte]
- [Fallstricke zu vermeiden]
- [Besondere Überlegungen]
```

Speichern und überprüfen, ob Claude es sieht:
```
Lies die Projektkontext-Datei und fasse zusammen, was du jetzt
über dieses Projekt verstehst.
```

---

## 9. Ihre Erste Änderung

Jetzt machen wir Ihre erste KI-unterstützte Änderung und pushen sie.

### 9.1 Eine Einfache Aufgabe Wählen

Gute erste Aufgaben:
- [ ] Einen fehlenden Unit-Test hinzufügen
- [ ] Einen kleinen Bug beheben
- [ ] Dokumentation zu einer Funktion hinzufügen
- [ ] Eine Methode für Klarheit refactoren
- [ ] Input-Validierung hinzufügen

**Für die erste Aufgabe vermeiden:**
- Große Features
- Kritische Sicherheitsänderungen
- Datenbankmigrationen
- Breaking-API-Änderungen

### 9.2 Claude Analysieren Lassen

Claude bitten, vor Änderungen zu analysieren:

```
Ich möchte [beschreiben Sie Ihre Aufgabe].

Bevor du Änderungen machst:
1. Analysiere den relevanten Code
2. Erkläre deinen Ansatz
3. Liste die Dateien auf, die du ändern wirst
4. Beschreibe die Tests, die du hinzufügen oder aktualisieren wirst
```

**Claudes Plan sorgfältig überprüfen.** Fragen stellen:
```
Warum hast du diesen Ansatz gewählt?
Gibt es Risiken bei dieser Änderung?
Welche Tests werden verifizieren, dass es funktioniert?
```

### 9.3 Die Änderung Implementieren

Sobald Sie mit dem Plan zufrieden sind:
```
Fahre fort und implementiere diese Änderung nach TDD:
1. Zuerst Tests schreiben/aktualisieren
2. Dann den Code implementieren
3. Tests ausführen zur Verifizierung
```

### 9.4 Überprüfen und Committen

Vor dem Commit Qualitätsprüfungen ausführen:

```
/common:pre-commit-check
```

Alle Änderungen überprüfen:
```bash
git diff
git status
```

Falls alles gut aussieht:
```bash
# Änderungen stagen
git add .

# Commit mit beschreibender Nachricht
git commit -m "feat: [beschreiben Sie, was Sie gemacht haben]

- [Punkt zur Änderung]
- [weitere Änderung]
- Tests hinzugefügt für [Feature]

Co-Authored-By: Claude <noreply@anthropic.com>"
```

### 9.5 Ihre Änderungen Pushen

```bash
# Zum Remote pushen
git push origin main
```

Falls Ihre CI/CD läuft, verifizieren Sie, dass sie durchläuft:
```bash
# CI-Status prüfen (falls Sie GitHub verwenden)
gh run list --limit 1
```

**Herzlichen Glückwunsch!** Sie haben Ihre erste KI-unterstützte Änderung gemacht.

---

## 10. Team-Onboarding

Claude-Craft mit Ihrem Team teilen.

### Konfiguration Committen

```bash
# Claude-Craft-Dateien zu git hinzufügen
git add .claude/

# Committen
git commit -m "feat: add Claude-Craft AI development configuration

- Added rules for [Ihr Tech-Stack]
- Configured project context
- Added agents and commands"

# Pushen
git push origin main
```

### Ihr Team Benachrichtigen

Eine kurze Anleitung für Teammitglieder erstellen:

```markdown
## Claude-Craft in Diesem Projekt Verwenden

1. Claude Code installieren: [Link]
2. Neueste Änderungen pullen: `git pull`
3. Im Projekt starten: `cd project && claude`

### Schnellbefehle
- `/common:pre-commit-check` - Vor dem Committen ausführen
- `@tdd-coach` - Hilfe bei Tests
- `@{tech}-reviewer` - Code-Review

### Projektkontext
Unser KI-Assistent versteht:
- [Architekturmuster, die wir verwenden]
- [Coding-Konventionen]
- [Geschäftsdomäne]
```

### Team-Demo

Erwägen Sie eine kurze Demo:
1. Claude beim Erkunden der Codebase zeigen
2. Eine einfache Aufgabe demonstrieren
3. Den Pre-Commit-Workflow zeigen
4. Fragen beantworten

---

## 11. Migration von Anderen KI-Tools

Falls Sie andere KI-Coding-Tools verwenden, migrieren Sie deren Konfigurationen.

### Von Cursor Rules (.cursorrules)

```bash
# Prüfen ob Sie Cursor-Regeln haben
cat .cursorrules 2>/dev/null
```

Migration:
1. `.cursorrules` öffnen
2. Relevante Regeln kopieren
3. Zu `.claude/rules/90-migrated-cursor-rules.md` hinzufügen
4. Format an Claude-Craft-Stil anpassen

### Von GitHub Copilot Instructions

```bash
# Copilot-Anweisungen prüfen
cat .github/copilot-instructions.md 2>/dev/null
```

Migration:
1. Copilot-Anweisungen öffnen
2. Coding-Richtlinien extrahieren
3. Zu Projektkontext oder benutzerdefinierten Regeln hinzufügen

### Von Anderen Claude-Konfigurationen

Falls Sie eine `CLAUDE.md` im Stammverzeichnis haben:
```bash
# Bestehende Config überprüfen
cat CLAUDE.md 2>/dev/null
```

Migration:
1. Mit neuer `.claude/CLAUDE.md` vergleichen
2. Einzigartigen Inhalt zusammenführen
3. `CLAUDE.md` im Stamm behalten, falls sie Projektdokumentation enthält
4. Entfernen, falls redundant mit `.claude/`

### Migrations-Mapping-Tabelle

| Alter Ort | Claude-Craft-Ort |
|-----------|------------------|
| `.cursorrules` | `.claude/rules/90-custom.md` |
| `.github/copilot-instructions.md` | `.claude/references/<your-tech>/project-context.md` |
| `CLAUDE.md` (Stamm) | `.claude/CLAUDE.md` |
| Benutzerdefinierte Prompts | `.claude/commands/custom/` |

---

## 12. Fehlerbehebung

### Installationsprobleme

**Problem:** Fehler "Directory already exists"
```bash
# Lösung: Force-Flag verwenden
npx @the-bearded-bear/claude-craft install . --tech=symfony --force
```

**Problem:** "Permission denied"
```bash
# Lösung: Ownership prüfen
ls -la .claude/
# Berechtigungen korrigieren
chmod -R 755 .claude/
```

**Problem:** "CLAUDE.md not found" nach Installation
```bash
# Lösung: Installation erneut ausführen
npx @the-bearded-bear/claude-craft install . --tech=symfony --lang=de
```

### Probleme mit Claudes Verständnis

**Problem:** Claude versteht meine Projektstruktur nicht

Lösung: Seien Sie explizit in Ihrer Kontext-Datei und während der Konversation:
```
Dieses Projekt verwendet [spezifisches Muster]. Der Hauptquellcode ist in [Verzeichnis].
Wenn ich nach [Domänenbegriff] frage, meine ich [Erklärung].
```

**Problem:** Claude schlägt falsche Muster vor

Lösung: Korrigieren und verstärken:
```
Wir verwenden [Muster] nicht in diesem Projekt. Wir verwenden [korrektes Muster], weil [Grund].
Bitte behalte das für zukünftige Vorschläge im Gedächtnis.
```

**Problem:** Claude vergisst Kontext zwischen Sitzungen

Lösung: Stellen Sie sicher, dass `00-project-context.md` umfassend ist. Schlüsselinformationen sollten in Dateien sein, nicht nur in der Konversation.

### Rollback

Falls Sie die Installation rückgängig machen müssen:

```bash
# Claude-Craft-Dateien entfernen
rm -rf .claude/

# Vom Backup-Branch wiederherstellen
git checkout backup/before-claude-craft -- .

# Oder Hard Reset
git checkout backup/before-claude-craft
```

---

## Zusammenfassung

Sie haben erfolgreich:
- [x] Ihr Projekt gesichert
- [x] Claude-Craft sicher installiert
- [x] Claude Ihre Codebase verstehen lassen
- [x] Ihre erste KI-unterstützte Änderung gemacht
- [x] Änderungen zu Ihrem Repository gepusht
- [x] Team-Onboarding vorbereitet

### Was kommt als Nächstes?

| Aufgabe | Anleitung |
|---------|-----------|
| Den vollständigen TDD-Workflow lernen | [Feature-Entwicklung](03-feature-development.md) |
| Effektiv debuggen | [Bug-Behebung](04-bug-fixing.md) |
| Backlog mit KI verwalten | [Backlog-Management](07-backlog-management.md) |
| Erweiterte Tools erkunden | [Werkzeug-Referenz](05-tools-reference.md) |

---

[&larr; Vorherige: Setup Neues Projekt](08-setup-new-project.md) | [Zurück zum Index](../index.md)
