# Leitfaden zur Problemlösung

Dieser Leitfaden behandelt häufige Probleme und ihre Lösungen bei der Verwendung von Claude-Craft.

---

## Inhaltsverzeichnis

1. [Installationsprobleme](#installationsprobleme)
2. [Agenten-Probleme](#agenten-probleme)
3. [Befehlsprobleme](#befehlsprobleme)
4. [Konfigurationsprobleme](#konfigurationsprobleme)
5. [Werkzeugprobleme](#werkzeugprobleme)
6. [Leistungsprobleme](#leistungsprobleme)
7. [Hilfe erhalten](#hilfe-erhalten)

---

## Installationsprobleme

### Befehle werden nach der Installation nicht erkannt

**Symptome:**
- Slash-Befehle wie `/symfony:check-compliance` funktionieren nicht
- Claude erkennt installierte Befehle nicht

**Lösungen:**

1. **Claude Code neu starten**
   ```bash
   # Claude Code vollständig beenden
   exit

   # Neu starten
   claude
   ```

2. **Installation überprüfen**
   ```bash
   ls -la .claude/commands/
   # Sollte Befehlsverzeichnisse anzeigen
   ```

3. **Dateiformat des Befehls prüfen**
   ```bash
   head -5 .claude/commands/symfony/check-compliance.md
   # Sollte mit einem korrekten Markdown-Header beginnen
   ```

### Dateien werden bei der Installation nicht gefunden

**Symptome:**
- Fehler „Quelldatei nicht gefunden"
- Fehlende Regeln oder Vorlagen

**Lösungen:**

1. **Claude-Craft-Pfad überprüfen**
   ```bash
   # Prüfen, ob man sich im claude-craft-Verzeichnis befindet
   pwd
   ls -la Dev/scripts/
   ```

2. **Vorhandensein der Sprachdateien prüfen**
   ```bash
   ls -la Dev/i18n/en/Symfony/rules/
   ```

3. **Absoluten TARGET-Pfad verwenden**
   ```bash
   # Statt
   make install-symfony TARGET=./backend

   # Verwenden
   make install-symfony TARGET=/vollständiger/pfad/zum/backend
   ```

### Fehler „Zugriff verweigert"

**Symptome:**
- Installationsskripte können nicht ausgeführt werden
- Schreibzugriff auf Zielverzeichnis nicht möglich

**Lösungen:**

1. **Skripte ausführbar machen**
   ```bash
   chmod +x Dev/scripts/*.sh
   chmod +x Project/*.sh
   chmod +x Infra/*.sh
   chmod +x Tools/*/*.sh
   ```

2. **Berechtigungen des Zielverzeichnisses prüfen**
   ```bash
   ls -la ~/my-project/
   # Sicherstellen, dass Schreibzugriff vorhanden ist
   ```

3. **Mit entsprechendem Benutzer ausführen**
   ```bash
   # sudo nur bei Notwendigkeit verwenden
   # Verzeichnisbesitz prüfen
   ls -la ~/my-project
   ```

### Installation erstellt leeres Verzeichnis

**Symptome:**
- `.claude/`-Verzeichnis erstellt, aber leer oder fehlende Dateien

**Lösungen:**

1. **Fehler in der Ausgabe prüfen**
   ```bash
   # Mit ausführlicher Ausgabe ausführen
   make install-symfony TARGET=./backend 2>&1 | tee install.log
   ```

2. **Quelle überprüfen**
   ```bash
   ls -la Dev/i18n/en/Symfony/
   ```

3. **Direktes Skript ausführen**
   ```bash
   ./Dev/scripts/install-symfony-rules.sh --lang=en ./backend
   ```

---

## Agenten-Probleme

### Agent nicht verfügbar

**Symptome:**
- `@api-designer` oder andere Agenten antworten nicht
- Fehler des Typs „Unbekannter Agent"

**Lösungen:**

1. **Vorhandensein der Agent-Dateien prüfen**
   ```bash
   ls -la .claude/agents/
   # Sollte Agent-.md-Dateien auflisten
   ```

2. **Dateiformat des Agenten prüfen**
   ```bash
   head -20 .claude/agents/api-designer.md
   # Sollte korrekte Frontmatter mit Name und Beschreibung haben
   ```

3. **Agenten neu installieren**
   ```bash
   make install-common TARGET=. OPTIONS="--force"
   ```

### Agent gibt irrelevante Antworten

**Symptome:**
- Agent befolgt seine spezialisierten Anweisungen nicht
- Generische Antworten statt Expertenrat

**Lösungen:**

1. **Mehr Kontext bereitstellen**
   ```markdown
   @symfony-reviewer Überprüfe meine UserService-Implementierung

   Kontext:
   - Symfony 7 mit API Platform
   - Clean Architecture
   - DDD-Ansatz

   Zu überprüfender Code:
   [Code hier einfügen]
   ```

2. **In der Anfrage spezifisch sein**
   ```markdown
   # Statt
   @database-architect Hilf mir mit meiner Datenbank

   # Verwenden
   @database-architect Entwirf das Schema für den User-Aggregat mit:
   - User-Entity (id, email, password_hash)
   - Role-Entity (Many-to-Many mit User)
   - Permission-Entity (Many-to-Many mit Role)
   - Audit-Trail für Benutzeränderungen
   ```

3. **Projektkontextdatei prüfen**
   ```bash
   cat .claude/rules/00-project-context.md
   # Sicherstellen, dass das Projekt korrekt beschrieben wird
   ```

### Agent widerspricht Projektregeln

**Symptome:**
- Agent-Vorschläge widersprechen Projektkonventionen
- Inkonsistenter Rat

**Lösungen:**

1. **Projektkontext aktualisieren**
   - Spezifische Konventionen zu `00-project-context.md` hinzufügen
   - Team-Präferenzen und -Einschränkungen einschließen

2. **In Anfragen explizit sein**
   ```markdown
   @api-designer Endpunkt gemäß unseren RESTful-Konventionen entwerfen
   (Siehe 00-project-context.md für unsere API-Standards)
   ```

---

## Befehlsprobleme

### Befehl nicht gefunden

**Symptome:**
- `/symfony:generate-crud` gibt „Unbekannter Befehl" zurück
- Befehlsvorschläge erscheinen nicht

**Lösungen:**

1. **Befehlsverzeichnis prüfen**
   ```bash
   ls .claude/commands/symfony/
   # Sollte generate-crud.md enthalten
   ```

2. **Namespace überprüfen**
   ```bash
   # Befehle haben das Format: /{namespace}:{befehl}
   # Verfügbare Namespaces:
   ls .claude/commands/
   # common/, symfony/, flutter/, python/, react/, reactnative/, docker/
   ```

3. **Verfügbare Befehle auflisten**
   ```bash
   # In Claude Code eingeben:
   /help
   ```

### Ausführungsfehler bei Befehlen

**Symptome:**
- Befehl startet, schlägt aber fehl
- Unerwartete Ausgabe oder Fehler

**Lösungen:**

1. **Voraussetzungen prüfen**
   - Manche Befehle benötigen bestimmte Werkzeuge
   - Erforderliche Abhängigkeiten auf Vorhandensein prüfen

2. **Befehlsdatei überprüfen**
   ```bash
   cat .claude/commands/symfony/generate-crud.md
   # Verstehen, was der Befehl erwartet
   ```

3. **Erforderliche Parameter bereitstellen**
   ```bash
   # Statt
   /symfony:generate-crud

   # Verwenden
   /symfony:generate-crud User --with-api --with-tests
   ```

### Befehlsausgabe ist falsch

**Symptome:**
- Generierter Code entspricht nicht dem Projektstil
- Falsche Technologiemuster verwendet

**Lösungen:**

1. **Projektkontext aktualisieren**
   ```bash
   # .claude/rules/00-project-context.md bearbeiten
   # Spezifische Muster und Konventionen hinzufügen
   ```

2. **Vorlagen anpassen**
   ```bash
   # Vorlagen in .claude/templates/ bearbeiten
   # An den Projektstil anpassen
   ```

---

## Konfigurationsprobleme

### YAML-Konfiguration ungültig

**Symptome:**
- `make config-validate` schlägt fehl
- Syntaxfehler in der Konfiguration

**Lösungen:**

1. **YAML-Syntax prüfen**
   ```bash
   # YAML validieren
   yq e '.' claude-projects.yaml
   ```

2. **Häufige YAML-Fehler:**
   ```yaml
   # Falsch: inkonsistente Einrückung
   projects:
     - name: "project"
       path: "/path"  # 2 Leerzeichen
        technologies: ["symfony"]  # 3 Leerzeichen – FEHLER!

   # Korrekt: konsistente Einrückung
   projects:
     - name: "project"
       path: "/path"
       technologies: ["symfony"]
   ```

3. **Mit Werkzeug validieren**
   ```bash
   make config-validate CONFIG=claude-projects.yaml
   ```

### Projekt in Konfiguration nicht gefunden

**Symptome:**
- „Projekt nicht gefunden" bei der Installation
- Projekt wird nicht aufgelistet

**Lösungen:**

1. **Schreibweise des Projektnamens prüfen**
   ```bash
   # Projekte auflisten
   make config-list CONFIG=claude-projects.yaml

   # Namen beachten Groß-/Kleinschreibung
   ```

2. **Pfad zur Konfigurationsdatei überprüfen**
   ```bash
   # Standard sucht nach claude-projects.yaml im aktuellen Verzeichnis
   # Explizit angeben:
   make config-install CONFIG=/pfad/zur/config.yaml PROJECT=meinprojekt
   ```

### Konfiguration wird nicht angewendet

**Symptome:**
- Änderungen an der Konfiguration wirken sich nicht aus
- Alte Einstellungen bleiben erhalten

**Lösungen:**

1. **Mit force neu installieren**
   ```bash
   make config-install CONFIG=claude-projects.yaml PROJECT=meinprojekt OPTIONS="--force"
   ```

2. **Konflikte prüfen**
   ```bash
   # Vorhandene Installation entfernen
   rm -rf /pfad/zum/projekt/.claude

   # Neu installieren
   make config-install CONFIG=claude-projects.yaml PROJECT=meinprojekt
   ```

---

## Werkzeugprobleme

### StatusLine wird nicht angezeigt

**Symptome:**
- Statusleiste leer oder standardmäßig
- Benutzerdefinierte Statusleiste wird nicht angezeigt

**Lösungen:**

1. **Überprüfen, ob Skript installiert ist**
   ```bash
   ls -la ~/.claude/statusline.sh
   # Sollte vorhanden und ausführbar sein
   ```

2. **settings.json prüfen**
   ```bash
   cat ~/.claude/settings.json | jq '.statusLine'
   # Sollte anzeigen:
   # {
   #   "type": "command",
   #   "command": "~/.claude/statusline.sh"
   # }
   ```

3. **Skript manuell testen**
   ```bash
   echo '{"model":{"display_name":"Test","id":"claude-opus"}}' | ~/.claude/statusline.sh
   # Sollte formatierte Statusleiste ausgeben
   ```

4. **Auf jq prüfen**
   ```bash
   which jq
   # Bei fehlendem jq installieren: brew install jq / apt install jq
   ```

### MultiAccount-Profilprobleme

**Symptome:**
- Profilwechsel nicht möglich
- Profil wird nicht erkannt

**Lösungen:**

1. **Profile auflisten**
   ```bash
   ./claude-accounts.sh list
   ```

2. **Profilverzeichnis prüfen**
   ```bash
   ls -la ~/.claude-profiles/
   # Sollte Profilverzeichnisse enthalten
   ```

3. **Profil-Modus-Datei überprüfen**
   ```bash
   cat ~/.claude-profiles/meinprofil/.mode
   # Sollte "shared" oder "isolated" enthalten
   ```

4. **Problematisches Profil neu erstellen**
   ```bash
   ./claude-accounts.sh remove meinprofil
   ./claude-accounts.sh add meinprofil --mode=shared
   ```

### ProjectConfig-yq-Fehler

**Symptome:**
- „yq: Befehl nicht gefunden"
- YAML-Parsing-Fehler

**Lösungen:**

1. **yq installieren**
   ```bash
   # macOS
   brew install yq

   # Linux
   sudo snap install yq
   # oder
   sudo wget https://github.com/mikefarah/yq/releases/latest/download/yq_linux_amd64 -O /usr/local/bin/yq
   sudo chmod +x /usr/local/bin/yq
   ```

2. **yq-Version überprüfen**
   ```bash
   yq --version
   # Sollte v4.x sein (mikefarah/yq, nicht kislyuk/yq)
   ```

---

## Hook-Probleme

### Hook wird nicht ausgelöst

**Symptome:**
- PreToolUse/PostToolUse-Hooks werden nicht ausgeführt
- Keine Ausgabe von Hook-Befehlen

**Lösungen:**

1. **Hook-Konfiguration in settings.json überprüfen**
   ```bash
   cat .claude/settings.json | jq '.hooks'
   ```

2. **Matcher-Syntax prüfen**
   ```json
   {
     "hooks": {
       "PreToolUse": [{
         "matcher": "Bash",
         "hooks": [{"type": "command", "command": "echo test"}]
       }]
     }
   }
   ```
   Der `matcher` muss exakt mit dem Werkzeugnamen übereinstimmen (z. B. `Bash`, `Edit`, `Write`).

3. **Hook-Befehl unabhängig testen**
   ```bash
   # Den Hook-Befehl manuell ausführen, um zu prüfen, ob er funktioniert
   bash -c 'echo test'
   ```

### PreCompact-Hook blockiert

**Symptome:**
- Kontextkomprimierung findet nicht wie erwartet statt
- Komprimierung scheint blockiert

**Lösung:** PreCompact-Hooks (v2.1.105+) können die Komprimierung mit Exit-Code 2 blockieren. Die eigenen Hooks prüfen:
```bash
cat .claude/settings.json | jq '.hooks.PreCompact'
# Sicherstellen, dass Hook-Skripte nicht versehentlich Exit-Code 2 zurückgeben
```

### Sandbox-Fehler

**Symptome:**
- Fehler „Sandbox nicht verfügbar"
- Berechtigungsprobleme bei Unterprozessen

**Lösungen:**

1. **Claude Code-Version prüfen** (Sandboxing erfordert v2.1.98+)
   ```bash
   claude --version
   ```

2. **Unter Linux PID-Namespace-Unterstützung prüfen**
   ```bash
   # Prüfen, ob unshare verfügbar ist
   which unshare
   ```

3. **Strenge Sandbox bei Bedarf deaktivieren** (aus Sicherheitsgründen nicht empfohlen)
   - `sandbox.failIfUnavailable` aus den Einstellungen entfernen, falls es hinzugefügt wurde

### Sicherheitsbezogene Hook-Fehler

Bei Verwendung von MCP-Servern mit Hooks sicherstellen, dass Claude Code v2.1.97+ verwendet wird, um bekannte CVEs zu vermeiden:
- CVE-2025-59536: Command-Injection über MCP-Eingaben in der Hook-Pipeline
- CVE-2026-35020: Bypass durch zusammengesetzte Befehle
- CVE-2026-35022: Umgebungsvariablen-Präfix-Injektion

---

## Leistungsprobleme

### Langsame Befehlsausführung

**Symptome:**
- Befehle brauchen lange zum Antworten
- StatusLine wird langsam aktualisiert

**Lösungen:**

1. **Cache-Einstellungen prüfen**
   ```bash
   # In ~/.claude/statusline.conf
   SESSION_CACHE_TTL=60   # Reduzieren, wenn zu langsam
   WEEKLY_CACHE_TTL=300   # Reduzieren, wenn zu langsam
   ```

2. **Caches leeren**
   ```bash
   rm /tmp/.ccusage_*
   ```

3. **Netzwerk prüfen**
   - Manche Funktionen benötigen Netzwerkzugang (ccusage)
   - Langsames Netzwerk = langsame Aktualisierungen

### Hohe Kontextfensterauslastung

**Symptome:**
- Kontextanzeige zeigt schnell hohen Prozentsatz
- Warnungen „Kontextlimit erreicht"

**Lösungen:**

1. **`/context` für Optimierungsvorschläge verwenden** (v2.1.74+)
   ```bash
   /context
   ```

2. **Aufwandsniveau für einfache Aufgaben anpassen** (v2.1.72+)
   ```bash
   /effort low    # Einfache Suchen
   /effort medium # Standardarbeit
   ```

3. **Proaktiv bei ca. 70 % Auslastung komprimieren**
   ```bash
   /compact
   ```

4. **`/clear` zwischen nicht zusammenhängenden Aufgaben verwenden**

5. **Wichtige Erkenntnisse vor der Komprimierung speichern**
   ```bash
   /memory "Wichtig: Auth verwendet JWT RS256 mit 15 Min. Ablaufzeit"
   ```

6. **RTK für 55–65 % Token-Einsparung einrichten**
   ```bash
   /common:setup-rtk
   ```

7. **Agenten für komplexe Aufgaben verwenden**
   ```markdown
   # Statt die gesamte Codebasis einzufügen
   @research-assistant Alle authentifizierungsbezogenen Dateien in src/ finden
   ```

---

## Hilfe erhalten

### Dokumentation prüfen

1. **Haupt-Docs**: Verzeichnis `docs/`
2. **Agenten-Referenz**: `docs/AGENTS.md`
3. **Befehls-Referenz**: `docs/COMMANDS.md`
4. **Technologie-Leitfaden**: `docs/TECHNOLOGIES.md`

### Versionsinformationen abrufen

```bash
# Installationsskripte
./Dev/scripts/install-symfony-rules.sh --version

# Werkzeuge
./Tools/MultiAccount/claude-accounts.sh --version
./Tools/ProjectConfig/claude-projects.sh --version
```

### Fehler melden

Bei Auftreten von Bugs:

1. Informationen sammeln:
   - Claude-Craft-Version
   - Betriebssystem
   - Reproduktionsschritte
   - Fehlermeldungen

2. Vorhandene Issues auf GitHub prüfen

3. Neues Issue mit Details erstellen

### Um Hilfe bitten

```markdown
@research-assistant Ich habe Probleme mit [Problem beschreiben]

Umgebung:
- Betriebssystem: [Ihr OS]
- Claude-Craft-Version: [Version]
- Technologie: [symfony/flutter/etc.]

Was ich versucht habe:
1. [Schritt 1]
2. [Schritt 2]

Fehlermeldung:
[Fehler einfügen]
```

---

## Schnellkorrekturen-Checkliste

Wenn etwas nicht funktioniert:

- [ ] Claude Code neu starten
- [ ] Installation überprüfen (`ls .claude/`)
- [ ] Dateiberechtigungen prüfen
- [ ] Konfiguration validieren
- [ ] Caches leeren
- [ ] Abhängigkeiten prüfen (jq, yq)
- [ ] Neuinstallation mit `--force` versuchen
- [ ] Dokumentation prüfen
- [ ] Um Hilfe bitten

---

[&larr; Werkzeug-Referenz](05-tools-reference.md) | [Backlog-Management &rarr;](07-backlog-management.md)
