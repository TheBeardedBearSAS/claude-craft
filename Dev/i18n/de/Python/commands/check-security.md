# Python-Sicherheit prüfen

## Argumente

$ARGUMENTS (optional: Pfad zum zu analysierenden Projekt)

## MISSION

Führen Sie ein vollständiges Sicherheits-Audit des Python-Projekts durch, indem Sie Schwachstellen, offengelegte Geheimnisse und in den Projektregeln definierte Sicherheits-Bad-Practices identifizieren.

### Schritt 1: Sicherheitsanalyse mit Bandit

Code mit Bandit scannen, um Schwachstellen zu erkennen:
- [ ] Keine fest codierten Passwörter/Geheimnisse
- [ ] Keine Verwendung von `eval()` oder `exec()`
- [ ] Keine unsichere Deserialisierung (pickle)
- [ ] Keine SQL-Injection (ORM oder parametrisierte Abfragen)
- [ ] Keine Shell-Befehlsinjektion
- [ ] Sichere Kryptographie (nicht MD5/SHA1)

**Befehl**: `docker run --rm -v $(pwd):/app python:3.11 sh -c "pip install bandit && bandit -r /app -f json"`

**Referenz**: `rules/06-tooling.md` Abschnitt "Security Analysis"

### Schritt 2: Geheimnis-Erkennung

Nach Geheimnissen und Anmeldedaten im Code suchen:
- [ ] Keine API-Schlüssel im Quellcode
- [ ] Keine Token in Dateien
- [ ] Keine Passwörter im Klartext
- [ ] Umgebungsvariablen für sensible Konfiguration
- [ ] .env in .gitignore
- [ ] .env.example bereitgestellt (ohne echte Werte)

**Befehl**: grep/Suche verwenden, um Geheimnismuster zu erkennen

**Zu suchende Muster**:
- `password\s*=\s*["'][^"']+["']`
- `api_key\s*=\s*["'][^"']+["']`
- `secret\s*=\s*["'][^"']+["']`
- `token\s*=\s*["'][^"']+["']`

**Referenz**: `rules/03-coding-standards.md` Abschnitt "Security Best Practices"

### Schritt 3-9: [Weitere Sicherheitsprüfungen...]

### Schritt 9: Bewertung berechnen

Punktevergabe (von 25):
- Bandit (Schwachstellen): 6 Punkte
- Geheimnisse und Anmeldedaten: 5 Punkte
- Eingabevalidierung: 4 Punkte
- Sichere Abhängigkeiten: 4 Punkte
- Fehlerbehandlung: 3 Punkte
- Auth/Authz: 2 Punkte
- Injection/XSS: 1 Punkt

## AUSGABEFORMAT

```
PYTHON-SICHERHEITS-AUDIT
================================

GESAMTBEWERTUNG: XX/25

STÄRKEN:
- [Liste beobachteter Sicherheits-Good-Practices]

VERBESSERUNGEN:
- [Liste geringfügiger Sicherheitsverbesserungen]

KRITISCHE PROBLEME:
- [Liste kritischer Schwachstellen, die SOFORT behoben werden müssen]

[...]
```

## HINWEISE

- Sicherheitsprobleme MÜSSEN mit absoluter Priorität behandelt werden
- Docker zum Ausführen von Sicherheitstools verwenden
- Genaue Datei und Zeile für jede Schwachstelle bereitstellen
- Konkrete Korrekturen für jedes Problem vorschlagen
- Risiken und potenzielle Auswirkungen dokumentieren
- Vorgeschlagene Fixes testen
- NIEMALS Geheimnisse im Code committen
