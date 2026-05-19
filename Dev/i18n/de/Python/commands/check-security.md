---
description: Python-Sicherheit prüfen
argument-hint: [arguments]
---

# Python-Sicherheit prüfen

## Argumente

$ARGUMENTS (optional: Pfad zum zu analysierenden Projekt)

## Plan-Modus

> Der Plan-Modus wird automatisch aktiviert, wenn der Umfang mehrere Module umfasst oder eine modulübergreifende Untersuchung erfordert.

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

### Schritt 3: Benutzereingabe-Validierung

Datenvalidierung und -bereinigung überprüfen:
- [ ] Validierung aller Benutzereingaben
- [ ] Verwendung von Pydantic zur Validierung
- [ ] Datenbereinigung vor der Verarbeitung
- [ ] Kein blindes Vertrauen in externe Daten
- [ ] Typ- und Formatvalidierung
- [ ] Grenzen für Eingabegrößen

**Referenz**: `rules/03-coding-standards.md` Abschnitt "Input Validation"

### Schritt 4: Abhängigkeiten und Schwachstellen

Abhängigkeiten auf bekannte Schwachstellen analysieren:
- [ ] Keine Abhängigkeiten mit kritischen CVEs
- [ ] Aktuelle Bibliotheksversionen
- [ ] requirements.txt mit gepinnten Versionen
- [ ] Verwendung von `pip-audit` oder `safety`
- [ ] Keine veralteten Abhängigkeiten

**Befehl**: `docker run --rm -v $(pwd):/app python:3.11 sh -c "pip install pip-audit && pip-audit --requirement /app/requirements.txt"`

**Referenz**: `rules/06-tooling.md` Abschnitt "Dependency Management"

### Schritt 5: Fehler- und Log-Verwaltung

Sichere Fehlerbehandlung prüfen:
- [ ] Keine offengelegten Stack-Traces in der Produktion
- [ ] Generische Fehlermeldungen für Benutzer
- [ ] Sichere Logs (keine sensiblen Daten)
- [ ] Kein Debug-Modus in der Produktion
- [ ] Ordentliche Ausnahmebehandlung
- [ ] Protokollierung von Sicherheitsereignissen

**Referenz**: `rules/03-coding-standards.md` Abschnitt "Error Handling"

### Schritt 6: Authentifizierung und Autorisierung

Authentifizierungssicherheit überprüfen:
- [ ] Keine manuelle Passwortverwaltung (bcrypt/argon2 verwenden)
- [ ] JWT-Token mit Ablauf
- [ ] HTTPS obligatorisch für sensible Endpunkte
- [ ] CSRF-Schutz falls zutreffend
- [ ] Rate-Limiting auf sensiblen Endpunkten
- [ ] Berechtigungsvalidierung (RBAC/ABAC)

**Referenz**: `rules/02-architecture.md` Abschnitt "Security Layer"

### Schritt 7: Konfiguration und Umgebung

Sicherheitskonfiguration analysieren:
- [ ] Umgebungsvariablen für Geheimnisse
- [ ] Unterschiedliche Konfiguration pro Umgebung (dev/staging/prod)
- [ ] Keine Geheimnisse in docker-compose.yml
- [ ] Geheimnisse in Umgebungsvariablen oder Vault
- [ ] Dokumentiertes .env.example
- [ ] DEBUG=False in der Produktion

**Referenz**: `rules/06-tooling.md` Abschnitt "Environment Configuration"

### Schritt 8: Injektion und XSS

Schutz gegen Injektionen überprüfen:
- [ ] Keine SQL-Injection (ORM oder parametrisierte Abfragen)
- [ ] Daten-Escaping in Templates
- [ ] Keine Befehlsinjektion (sicheres subprocess)
- [ ] Dateipfad-Validierung (Path Traversal)
- [ ] Content-Security-Policy bei Webanwendungen
- [ ] HTML-Eingabe-Bereinigung

**Referenz**: `rules/03-coding-standards.md` Abschnitt "Security Best Practices"

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

DETAILS NACH KATEGORIE:

1. BANDIT-SCAN (XX/6)
   Status: [Schwachstellenanalyse]
   Kritische Probleme: XX
   Mittlere Probleme: XX
   Niedrige Probleme: XX

2. OFFENGELEGTE GEHEIMNISSE (XX/5)
   Status: [Geheimnis-Erkennung]
   Fest codierte Geheimnisse: XX
   Sichere .env-Dateien: ✅/❌

3. EINGABEVALIDIERUNG (XX/4)
   Status: [Validierung und Bereinigung]
   Nicht validierte Eingaben: XX
   Pydantic-Nutzung: ✅/❌

4. ABHÄNGIGKEITEN (XX/4)
   Status: [Abhängigkeitsschwachstellen]
   Kritische CVEs: XX
   Mittlere CVEs: XX
   Veraltete Abhängigkeiten: XX

5. FEHLERBEHANDLUNG (XX/3)
   Status: [Fehler- und Log-Sicherheit]
   Offengelegte Stack-Traces: XX
   Sensible Daten in Logs: XX

6. AUTHENTIFIZIERUNG (XX/2)
   Status: [Auth/Authz]
   Sicheres Hashing: ✅/❌
   JWT mit Ablauf: ✅/❌

7. INJEKTIONEN (XX/1)
   Status: [Injektionsschutz]
   SQL-Injection-Risiken: XX
   Befehlsinjektions-Risiken: XX

KRITISCHE SCHWACHSTELLEN:
[Detaillierte Liste der sofort zu behebenden Schwachstellen mit Datei:Zeile]

TOP 3 PRIORITÄTSMASSNAHMEN:
1. [Kritischste Sicherheitsmaßnahme - DRINGEND]
2. [Zweite Prioritätsmaßnahme - WICHTIG]
3. [Dritte Prioritätsmaßnahme - EMPFOHLEN]
```

## HINWEISE

- Sicherheitsprobleme MÜSSEN mit absoluter Priorität behandelt werden
- Docker zum Ausführen von Sicherheitstools verwenden
- Genaue Datei und Zeile für jede Schwachstelle bereitstellen
- Konkrete Korrekturen für jedes Problem vorschlagen
- Risiken und potenzielle Auswirkungen dokumentieren
- Vorgeschlagene Fixes testen
- NIEMALS Geheimnisse im Code committen
