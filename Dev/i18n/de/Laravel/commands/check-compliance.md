---
description: Vollständige Laravel-Compliance prüfen
argument-hint: [arguments]
---

# Vollständige Laravel-Compliance prüfen

## Argumente

$ARGUMENTS (optional: Pfad zum zu analysierenden Projekt)

## Plan-Modus

> Der Plan-Modus wird automatisch aktiviert, wenn der Umfang mehrere Module umfasst oder eine übergreifende Untersuchung erfordert.

## MISSION

Führe ein vollständiges Compliance-Audit des Laravel-Projekts durch, indem die 4 wichtigsten Prüfungen orchestriert werden: Architektur, Code-Qualität, Tests und Sicherheit. Erstelle einen konsolidierten Bericht mit einem Gesamtergebnis von 100 Punkten.

### Schritt 1: Audit-Vorbereitung

Audit-Umgebung vorbereiten:
- [ ] Zu prüfenden Projektpfad identifizieren
- [ ] Vorhandensein von Konfigurationsdateien prüfen (composer.json mit laravel/*, .env.example)
- [ ] Hauptverzeichnisse auflisten (app/, tests/, config/, routes/ usw.)
- [ ] Projektstruktur und Laravel-Version identifizieren

**Hinweis**: Falls $ARGUMENTS angegeben, diesen als Projektpfad verwenden, ansonsten das aktuelle Verzeichnis nutzen.

### Schritt 2: Architektur-Audit (25 Punkte)

Vollständige Architekturprüfung durchführen:

**Befehl**: Slash-Befehl `/laravel:check-architecture` verwenden oder die Schritte in `check-architecture.md` manuell befolgen

**Bewertete Kriterien**:
- Trennung der Clean-Architecture-Schichten (6 Pkt.)
- Domain/Application/Infrastructure-Struktur (6 Pkt.)
- Actions-Pattern und schlanke Controller (4 Pkt.)
- Service-Provider-Bindings (4 Pkt.)
- Repository-Pattern und Interfaces (3 Pkt.)
- Abhängigkeitsregeln (2 Pkt.)

**Referenz**: `check-architecture.md`

### Schritt 3: Code-Qualitäts-Audit (25 Punkte)

Code-Qualitätsprüfung durchführen:

**Befehl**: Slash-Befehl `/laravel:check-code-quality` verwenden oder die Schritte in `check-code-quality.md` manuell befolgen

**Bewertete Kriterien**:
- PSR-12- und Laravel-Pint-Konformität (5 Pkt.)
- PHPStan-Statikanalyse (5 Pkt.)
- Moderne PHP-Features (Enums, readonly, typisierte Properties) (4 Pkt.)
- KISS/DRY/YAGNI-Prinzipien (4 Pkt.)
- Namenskonventionen (Laravel-Standards) (4 Pkt.)
- Fehlerbehandlung und Logging (3 Pkt.)

**Referenz**: `check-code-quality.md`

### Schritt 4: Test-Audit (25 Punkte)

Testprüfung durchführen:

**Befehl**: Slash-Befehl `/laravel:check-testing` verwenden oder die Schritte in `check-testing.md` manuell befolgen

**Bewertete Kriterien**:
- Code-Abdeckung (7 Pkt.)
- Unit-Tests für Domain-Logik (6 Pkt.)
- Feature-Tests für HTTP-Endpunkte (4 Pkt.)
- Pest-PHP-Einsatz und Testqualität (3 Pkt.)
- Datenbank-Factories und Seeders (3 Pkt.)
- Test-Isolation und Mocking (2 Pkt.)

**Referenz**: `check-testing.md`

### Schritt 5: Sicherheits-Audit (25 Punkte)

Sicherheitsprüfung durchführen:

**Befehl**: Slash-Befehl `/laravel:check-security` verwenden oder die Schritte in `check-security.md` manuell befolgen

**Bewertete Kriterien**:
- OWASP-Top-10-Schutzmaßnahmen (6 Pkt.)
- Secrets- und Zugangsdaten-Verwaltung (5 Pkt.)
- Form-Request-Validierung (4 Pkt.)
- Abhängigkeits-Schwachstellen (composer audit) (4 Pkt.)
- Authentifizierung und Autorisierung (Policies) (3 Pkt.)
- CSRF- und Middleware-Konfiguration (2 Pkt.)
- SQL-Injection-Prävention (1 Pkt.)

**Referenz**: `check-security.md`

### Schritt 6: Konsolidierung und Gesamtbewertung

Gesamtpunktzahl berechnen und konsolidierten Bericht erstellen:
- [ ] Die 4 Ergebnisse summieren (max. 100 Punkte)
- [ ] Kritische Kategorien identifizieren (<50%)
- [ ] Alle kritischen, übergreifenden Probleme auflisten
- [ ] Maßnahmen nach Auswirkung/Aufwand priorisieren
- [ ] Finalen konsolidierten Bericht erstellen

**Bewertungsskala**:
- 90-100: Ausgezeichnet – Referenzprojekt
- 75-89: Sehr gut – Einige geringfügige Verbesserungen
- 60-74: Akzeptabel – Erfordert Verbesserungen
- 40-59: Unzureichend – Größeres Refactoring erforderlich
- 0-39: Kritisch – Vollständige Überarbeitung notwendig

### Schritt 7: Empfehlungen und Aktionsplan

Abschließende Empfehlungen erstellen:
- [ ] Top-3-Prioritätsmaßnahmen über alle Kategorien hinweg identifizieren
- [ ] Aufwand (Niedrig/Mittel/Hoch) für jede Maßnahme schätzen
- [ ] Auswirkung (Niedrig/Mittel/Hoch) für jede Maßnahme schätzen
- [ ] Implementierungsreihenfolge vorschlagen
- [ ] Quick Wins vorschlagen (hohes Auswirkungs-/Aufwandsverhältnis)

## AUSGABEFORMAT

```
LARAVEL COMPLIANCE AUDIT - VOLLSTÄNDIGER BERICHT
=============================================

GESAMTERGEBNIS: XX/100

COMPLIANCE-LEVEL: [Ausgezeichnet/Sehr gut/Akzeptabel/Unzureichend/Kritisch]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ERGEBNISSE NACH KATEGORIE:

ARCHITEKTUR        : XX/25  [██████████░░░░░░░░░░] XX%
CODE-QUALITÄT      : XX/25  [██████████░░░░░░░░░░] XX%
TESTS              : XX/25  [██████████░░░░░░░░░░] XX%
SICHERHEIT         : XX/25  [██████████░░░░░░░░░░] XX%

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ALLGEMEINE STÄRKEN:
1. [In mehreren Kategorien identifizierte Stärke]
2. [Weitere wesentliche Stärke]
3. [Dritte Stärke]

ALLGEMEINE VERBESSERUNGEN:
1. [Geringfügige übergreifende Verbesserung]
2. [Weitere empfohlene Verbesserung]
3. [Dritte Verbesserung]

KRITISCHE PROBLEME:
1. [Kritisches Problem Nr. 1 – betroffene Kategorie]
2. [Kritisches Problem Nr. 2 – betroffene Kategorie]
3. [Kritisches Problem Nr. 3 – betroffene Kategorie]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

DETAILS NACH KATEGORIE:

┌─────────────────────────────────────────────┐
│ ARCHITEKTUR (XX/25)                         │
└─────────────────────────────────────────────┘

Teilpunktzahlen:
  • Clean-Architecture-Schichten    : XX/6
  • Domain/App/Infra-Struktur       : XX/6
  • Actions und schlanke Controller : XX/4
  • Service-Provider-Bindings       : XX/4
  • Repository-Pattern              : XX/3
  • Abhängigkeitsregeln             : XX/2

Stärken:
- [Architektur-Stärken]

Probleme:
- [Architektur-Probleme]

[Ähnliche Abschnitte für Code-Qualität, Tests und Sicherheit...]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

TOP 3 PRIORITÄTSMAASSNAHMEN (ALLE KATEGORIEN):

1. KRITISCH – [Maßnahme Nr. 1]
   Kategorie  : [Architektur/Qualität/Tests/Sicherheit]
   Auswirkung : [Hoch/Mittel/Niedrig]
   Aufwand    : [Hoch/Mittel/Niedrig]
   Priorität  : SOFORT

   Detaillierte Beschreibung:
   [Erläuterung des Problems und vorgeschlagene Lösung]

   Betroffene Dateien:
   - [datei:zeile]

   Korrekturbeispiel:
   [Code oder Korrekturbefehl]

2. WICHTIG – [Maßnahme Nr. 2]
   [Gleiches Format...]

3. EMPFOHLEN – [Maßnahme Nr. 3]
   [Gleiches Format...]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

QUICK WINS (Hohe Auswirkung / Geringer Aufwand):

- [Quick Win Nr. 1] – Kategorie: [X] – Auswirkung: [X] – Aufwand: [X]
- [Quick Win Nr. 2] – Kategorie: [X] – Auswirkung: [X] – Aufwand: [X]
- [Quick Win Nr. 3] – Kategorie: [X] – Auswirkung: [X] – Aufwand: [X]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

EMPFOHLENER AKTIONSPLAN:

WOCHE 1 (Sofort):
- [ ] [Kritische Maßnahme Nr. 1]
- [ ] [Prioritäts-Quick-Win]

WOCHE 2-4 (Kurzfristig):
- [ ] [Wichtige Maßnahme Nr. 2]
- [ ] [Weitere Quick Wins]

MONAT 2-3 (Mittelfristig):
- [ ] [Empfohlene Maßnahme Nr. 3]
- [ ] [Schrittweise Verbesserungen]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ZUSAMMENFASSUNG FÜR DIE GESCHÄFTSFÜHRUNG:

[Zusammenfassender Abschnitt über den Gesamtzustand des Projekts, wesentliche Stärken,
wesentliche Schwächen und die empfohlene Entwicklung zur Verbesserung
der Compliance. Angabe, ob das Projekt produktionsreif ist,
Korrekturen erfordert oder refaktoriert werden muss.]

Allgemeine Empfehlung: [Produktionsreif / Geringfügige Korrekturen /
Größeres Refactoring / Überarbeitung erforderlich]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## WICHTIGE HINWEISE

- Dieser Befehl orchestriert die 4 spezialisierten Audits
- Docker für alle Analysetools verwenden
- Konkrete Beispiele mit datei:zeile für jedes Problem angeben
- Maßnahmen anhand der Auswirkungs-/Aufwandsmatrix priorisieren
- Sicherheitsprobleme haben IMMER höchste Priorität
- Automatisierbare Korrekturen vorschlagen (Skripte, Pre-Commit-Hooks)
- Der Bericht muss handlungsorientiert sein, nicht nur beschreibend
- Empfehlungen an den geschäftlichen Kontext des Projekts anpassen
