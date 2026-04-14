# Anleitung zur Problemlösung

Häufige Probleme und ihre Lösungen bei der Verwendung von Claude-Craft.

---

## Installationsprobleme

### Befehle nicht erkannt
**Lösungen:**
1. Claude Code neu starten (`exit` + `claude`)
2. Installation überprüfen: `ls -la .claude/commands/`
3. Dateiformat der Befehle überprüfen

### Dateien nicht gefunden
**Lösungen:**
1. Claude-Craft-Pfad überprüfen: `pwd && ls Dev/scripts/`
2. Sprachdateien überprüfen: `ls Dev/i18n/de/`
3. Absoluten TARGET-Pfad verwenden

### Berechtigungsfehler
```bash
chmod +x Dev/scripts/*.sh
chmod +x Tools/*/*.sh
```

---

## Agenten-Probleme

### Agent nicht verfügbar
1. Dateien überprüfen: `ls .claude/agents/`
2. Frontmatter-Format überprüfen
3. Neu installieren: `make install-common TARGET=. OPTIONS="--force"`

### Irrelevante Antworten
1. Mehr Kontext in der Anfrage bereitstellen
2. Spezifischer in der Anfrage sein
3. `00-project-context.md` überprüfen

---

## Befehlsprobleme

### Befehl nicht gefunden
1. Verzeichnis überprüfen: `ls .claude/commands/symfony/`
2. Korrekten Namespace überprüfen
3. Befehle auflisten: `/help`

### Ausführungsfehler
1. Voraussetzungen überprüfen
2. Befehlsdatei überprüfen
3. Erforderliche Parameter bereitstellen

---

## Konfigurationsprobleme

### Ungültiges YAML
```bash
yq e '.' claude-projects.yaml  # Syntax validieren
make config-validate CONFIG=claude-projects.yaml
```

### Projekt nicht gefunden
1. Namensschreibung überprüfen (Groß-/Kleinschreibung)
2. Pfad zur Konfigurationsdatei überprüfen

---

## Werkzeugprobleme

### StatusLine wird nicht angezeigt
```bash
ls -la ~/.claude/statusline.sh  # Installation überprüfen
echo '{"model":{"display_name":"Test"}}' | ~/.claude/statusline.sh  # Test
```

### MultiAccount-Profilprobleme
```bash
./claude-accounts.sh list
ls -la ~/.claude-profiles/
```

### yq-Fehler
```bash
# yq v4.x installieren (mikefarah/yq)
brew install yq  # macOS
sudo snap install yq  # Linux
yq --version  # Version überprüfen
```

---

## Leistungsprobleme

### Langsame Ausführung
1. Cache-TTL in `statusline.conf` anpassen
2. Caches leeren: `rm /tmp/.ccusage_*`
3. Netzwerkverbindung überprüfen

### Hohe Kontextnutzung
1. `/compact` verwenden, um den Kontext proaktiv zu komprimieren
2. `/clear` zwischen nicht zusammenhängenden Aufgaben verwenden
3. `/effort low` für einfache Aufgaben verwenden (reduziert Token-Verbrauch)
4. `/context` für Optimierungsvorschläge verwenden
5. RTK für 60-90% Token-Einsparung konfigurieren (`/common:setup-rtk`)
6. Untersuchungen an Sub-Agenten delegieren

---

## Hilfe erhalten

### Dokumentation
- `docs/AGENTS.md` - Agenten-Referenz
- `docs/COMMANDS.md` - Befehls-Referenz
- `docs/TECHNOLOGIES.md` - Technologie-Leitfaden

### Versionen
```bash
./Dev/scripts/install-symfony-rules.sh --version
./Tools/MultiAccount/claude-accounts.sh --version
```

---

## Schnellkorrekturen-Checkliste

- [ ] Claude Code neu starten
- [ ] Installation überprüfen (`ls .claude/`)
- [ ] Dateiberechtigungen überprüfen
- [ ] Konfiguration validieren
- [ ] Caches leeren
- [ ] Abhängigkeiten überprüfen (jq, yq)
- [ ] Neuinstallation mit `--force` versuchen

---

[&larr; Werkzeuge-Referenz](05-tools-reference.md) | [Backlog-Management &rarr;](07-backlog-management.md)
