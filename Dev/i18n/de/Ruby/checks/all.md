# Vollständige Ruby-/Rails-Konformität prüfen

## Argumente

$ARGUMENTS (optional: Pfad des zu analysierenden Projekts)

## Plan Mode

> Der Plan Mode wird automatisch aktiviert, wenn der Umfang mehrere Module umfasst oder eine übergreifende Untersuchung erfordert.

## MISSION

Ein vollständiges Konformitäts-Audit des Ruby-on-Rails-Projekts durchführen, indem die 4 großen Prüfungen orchestriert werden: Architektur, Codequalität, Tests und Sicherheit. Einen konsolidierten Bericht mit einer Gesamtbewertung auf 100 Punkte erstellen.

### Schritt 1: Audit-Vorbereitung

Audit-Umgebung vorbereiten:
- [ ] Pfad des zu prüfenden Projekts bestimmen
- [ ] Vorhandensein der Konfigurationsdateien prüfen (Gemfile, Gemfile.lock, .rubocop.yml, config/ci.rb, spec/ oder test/)
- [ ] Hauptverzeichnisse auflisten (app/, config/, db/, spec/ oder test/, lib/)
- [ ] Ruby-Version (`.ruby-version`) und Rails-Version (`Gemfile.lock`) bestimmen

**Hinweis**: Wenn $ARGUMENTS angegeben ist, als Projektpfad verwenden, andernfalls das aktuelle Verzeichnis.

### Schritt 2: Architektur-Audit (25 Punkte)

Vollständige Architekturprüfung ausführen:

**Befehl**: Slash-Befehl `/ruby:check architecture` verwenden oder manuell den Schritten in `.claude/references/ruby/checks/architecture.md` folgen

**Bewertete Kriterien**:
- Rails-Konventionen und `app/`-Layout (6 Pkt.)
- Dünne Controller und Disziplin bei Fat Models (6 Pkt.)
- Service, Form und Query Objects, wo gerechtfertigt (4 Pkt.)
- Nutzung von Active Record: Assoziationen, Scopes, N+1-Vermeidung (4 Pkt.)
- Background Jobs, Caching und Hotwire-Nutzung (3 Pkt.)
- Zeitwerk-Autoloading und Abhängigkeitsrichtung (2 Pkt.)

**Referenz**: `.claude/references/ruby/checks/architecture.md`

### Schritt 3: Codequalitäts-Audit (25 Punkte)

Codequalitätsprüfung ausführen:

**Befehl**: Slash-Befehl `/ruby:check code-quality` verwenden oder manuell den Schritten in `.claude/references/ruby/checks/code-quality.md` folgen

**Bewertete Kriterien**:
- RuboCop-Konformität (rubocop-rails-omakase oder Projektkonfiguration) (5 Pkt.)
- Ruby Style Guide, Namensgebung und `# frozen_string_literal: true` (5 Pkt.)
- Optionale Typisierung (RBS/Steep oder Sorbet) und Dokumentation (4 Pkt.)
- Prinzipien KISS/DRY/YAGNI (4 Pkt.)
- Methodengröße und Komplexität (4 Pkt.)
- Fehlerbehandlung (3 Pkt.)

**Referenz**: `.claude/references/ruby/checks/code-quality.md`

### Schritt 4: Test-Audit (25 Punkte)

Testprüfung ausführen:

**Befehl**: Slash-Befehl `/ruby:check testing` verwenden oder manuell den Schritten in `.claude/references/ruby/checks/testing.md` folgen

**Bewertete Kriterien**:
- Codeabdeckung (SimpleCov, Ziel >= 80 %) (7 Pkt.)
- Unit-Tests für Models und Services (6 Pkt.)
- Request-, Job- und Systemtests (Capybara) (4 Pkt.)
- Qualität von RSpec / Minitest (3 Pkt.)
- Fixtures- / FactoryBot-Daten (3 Pkt.)
- Testisolation und Mocking (2 Pkt.)

**Referenz**: `.claude/references/ruby/checks/testing.md`

### Schritt 5: Sicherheits-Audit (25 Punkte)

Sicherheitsprüfung ausführen:

**Befehl**: Slash-Befehl `/ruby:check security` verwenden oder manuell den Schritten in `.claude/references/ruby/checks/security.md` folgen

**Bewertete Kriterien**:
- Schutzmaßnahmen gemäß OWASP Top 10:2025 (6 Pkt.)
- Verwaltung von Secrets und Credentials (5 Pkt.)
- Strong Parameters, Eingabevalidierung und Ausgabe-Escaping (4 Pkt.)
- Schwachstellen in Abhängigkeiten (bundler-audit, Brakeman) (4 Pkt.)
- Authentifizierung, Autorisierung und Rate Limiting (3 Pkt.)
- Sichere Konfiguration (CSP, SSL, Cookies) (2 Pkt.)
- Vermeidung von SQL-Injection (1 Pkt.)

**Referenz**: `.claude/references/ruby/checks/security.md`

### Schritt 6: Konsolidierung und Gesamtbewertung

Gesamtpunktzahl berechnen und konsolidierten Bericht erstellen:
- [ ] Die 4 Bewertungen summieren (max. 100 Punkte)
- [ ] Kritische Kategorien identifizieren (<50 %)
- [ ] Alle kritischen übergreifenden Probleme auflisten
- [ ] Maßnahmen nach Wirkung/Aufwand priorisieren
- [ ] Abschließenden konsolidierten Bericht erstellen

**Bewertungsskala**:
- 90-100: Ausgezeichnet - Referenzprojekt
- 75-89: Sehr gut - einige kleinere Verbesserungen
- 60-74: Akzeptabel - Verbesserungen erforderlich
- 40-59: Unzureichend - umfassendes Refactoring erforderlich
- 0-39: Kritisch - vollständige Überarbeitung notwendig

### Schritt 7: Empfehlungen und Aktionsplan

Abschließende Empfehlungen erstellen:
- [ ] Top-3-Prioritätsmaßnahmen über alle Kategorien identifizieren
- [ ] Aufwand (Niedrig/Mittel/Hoch) für jede Maßnahme schätzen
- [ ] Wirkung (Niedrig/Mittel/Hoch) für jede Maßnahme schätzen
- [ ] Umsetzungsreihenfolge vorschlagen
- [ ] Quick Wins vorschlagen (hohes Wirkung/Aufwand-Verhältnis)

## AUSGABEFORMAT

```
RUBY / RAILS COMPLIANCE AUDIT - GESAMTBERICHT
=============================================

GESAMTBEWERTUNG: XX/100

KONFORMITÄTSNIVEAU: [Ausgezeichnet/Sehr gut/Akzeptabel/Unzureichend/Kritisch]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

BEWERTUNG NACH KATEGORIE:

ARCHITEKTUR        : XX/25  [██████████░░░░░░░░░░] XX%
CODEQUALITÄT       : XX/25  [██████████░░░░░░░░░░] XX%
TESTS              : XX/25  [██████████░░░░░░░░░░] XX%
SICHERHEIT         : XX/25  [██████████░░░░░░░░░░] XX%

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

GESAMTSTÄRKEN:
1. [In mehreren Kategorien festgestellte Stärke]
2. [Weitere wesentliche Stärke]
3. [Dritte Stärke]

GESAMTVERBESSERUNGEN:
1. [Kleinere übergreifende Verbesserung]
2. [Weitere empfohlene Verbesserung]
3. [Dritte Verbesserung]

KRITISCHE PROBLEME:
1. [Kritisches Problem Nr. 1 - betroffene Kategorie]
2. [Kritisches Problem Nr. 2 - betroffene Kategorie]
3. [Kritisches Problem Nr. 3 - betroffene Kategorie]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

DETAILS NACH KATEGORIE:

┌─────────────────────────────────────────────┐
│ ARCHITEKTUR (XX/25)                         │
└─────────────────────────────────────────────┘

Teilbewertungen:
  • Rails-Konventionen / app-Layout : XX/6
  • Dünne Controller / Models       : XX/6
  • Service-, Form-, Query Objects  : XX/4
  • Nutzung von Active Record       : XX/4
  • Jobs, Caching, Hotwire          : XX/3
  • Zeitwerk und Abhängigkeiten     : XX/2

Stärken:
- [Architekturstärken]

Probleme:
- [Architekturprobleme]

[Ähnliche Abschnitte für Codequalität, Tests und Sicherheit...]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

TOP 3 PRIORITÄTSMASSNAHMEN (ALLE KATEGORIEN):

1. KRITISCH - [Maßnahme Nr. 1]
   Kategorie : [Architektur/Qualität/Tests/Sicherheit]
   Wirkung   : [Hoch/Mittel/Niedrig]
   Aufwand   : [Hoch/Mittel/Niedrig]
   Priorität : SOFORT

   Detaillierte Beschreibung:
   [Erklärung des Problems und der vorgeschlagenen Lösung]

   Betroffene Dateien:
   - [Datei:Zeile]

   Korrekturbeispiel:
   [Code oder Korrekturbefehl]

2. WICHTIG - [Maßnahme Nr. 2]
   [Gleiches Format...]

3. EMPFOHLEN - [Maßnahme Nr. 3]
   [Gleiches Format...]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

QUICK WINS (hohe Wirkung / geringer Aufwand):

- [Quick Win Nr. 1] - Kategorie: [X] - Wirkung: [X] - Aufwand: [X]
- [Quick Win Nr. 2] - Kategorie: [X] - Wirkung: [X] - Aufwand: [X]
- [Quick Win Nr. 3] - Kategorie: [X] - Wirkung: [X] - Aufwand: [X]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

EMPFOHLENER AKTIONSPLAN:

WOCHE 1 (Sofort):
- [ ] [Kritische Maßnahme Nr. 1]
- [ ] [Prioritärer Quick Win]

WOCHE 2-4 (Kurzfristig):
- [ ] [Wichtige Maßnahme Nr. 2]
- [ ] [Weitere Quick Wins]

MONAT 2-3 (Mittelfristig):
- [ ] [Empfohlene Maßnahme Nr. 3]
- [ ] [Schrittweise Verbesserungen]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ZUSAMMENFASSUNG FÜR DIE MANAGEMENT-EBENE:

[Zusammenfassender Absatz zum Gesamtzustand des Projekts, den wesentlichen
Stärken, den wesentlichen Schwächen und der empfohlenen Entwicklung zur
Verbesserung der Konformität. Angeben, ob das Projekt produktionsreif ist,
Korrekturen benötigt oder ein Refactoring erfordert.]

Allgemeine Empfehlung: [Produktionsreif / Kleinere Korrekturen /
Umfassendes Refactoring / Überarbeitung notwendig]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## WICHTIGE HINWEISE

- Dieser Befehl orchestriert die 4 spezialisierten Audits
- Docker für alle Analysewerkzeuge verwenden (`docker compose exec app ...`)
- Für jedes Problem konkrete Beispiele mit Datei:Zeile liefern
- Maßnahmen anhand der Wirkung/Aufwand-Matrix priorisieren
- Sicherheitsprobleme haben IMMER höchste Priorität
- Automatisierbare Korrekturen vorschlagen (Skripte, Pre-Commit-Hooks, `bin/ci`-Schritte)
- Der Bericht muss umsetzbar sein, nicht nur beschreibend
- Empfehlungen an den fachlichen Kontext des Projekts anpassen
- Zuerst der Rails Way: ein Projekt nicht abwerten, weil hexagonale Schichten fehlen, wenn die Konventionen eingehalten werden
