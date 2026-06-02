---
description: Vollständiges Symfony-Konformitäts-Audit durchführen
argument-hint: [arguments]
---

# Vollständiges Symfony-Konformitäts-Audit

## Argumente

$ARGUMENTS (optional: Pfad zum zu analysierenden Projekt)

## Plan-Modus

> Der Plan-Modus wird automatisch aktiviert, wenn der Umfang mehrere Module umfasst oder eine modulübergreifende Untersuchung erfordert.

## MISSION

Ein vollständiges Konformitäts-Audit des Symfony-Projekts durchführen, indem die 4 wesentlichen Prüfungen orchestriert werden: Architektur, Code-Qualität, Tests und Sicherheit. Einen konsolidierten Bericht mit einem Gesamtergebnis von 100 Punkten erstellen.

### Schritt 1: Audit-Vorbereitung

Audit-Umgebung vorbereiten:
- [ ] Zu auditierendes Projektverzeichnis identifizieren
- [ ] Vorhandensein von Konfigurationsdateien prüfen (composer.json mit symfony/*, .env)
- [ ] Hauptverzeichnisse auflisten (src/, tests/, config/ usw.)
- [ ] Projektstruktur und Symfony-Version identifizieren

**Hinweis**: Wenn $ARGUMENTS angegeben ist, diesen als Projektpfad verwenden, andernfalls das aktuelle Verzeichnis verwenden.

### Schritt 2: Architektur-Audit (25 Punkte)

Vollständige Architekturprüfung durchführen:

**Befehl**: Slash-Befehl `/symfony:check-architecture` verwenden oder die Schritte in `check-architecture.md` manuell befolgen

**Bewertete Kriterien**:
- Clean-Architecture-Struktur (6 Pkt.)
- Trennung Domain/Application/Infrastructure (6 Pkt.)
- Hexagonale Architektur / Ports & Adapters (4 Pkt.)
- DDD-Modellierung (Entities, Value Objects, Aggregates) (4 Pkt.)
- Use Cases und Application Services (3 Pkt.)
- Abhängigkeitsregeln und Deptrac (2 Pkt.)

**Referenz**: `check-architecture.md`

### Schritt 3: Code-Qualitäts-Audit (25 Punkte)

Code-Qualitätsprüfung durchführen:

**Befehl**: Slash-Befehl `/symfony:check-code-quality` verwenden oder die Schritte in `check-code-quality.md` manuell befolgen

**Bewertete Kriterien**:
- PSR-12-Konformität (5 Pkt.)
- PHPStan Level 9 (5 Pkt.)
- Strikte Type Hints und declare(strict_types=1) (4 Pkt.)
- KISS/DRY/YAGNI-Prinzipien (4 Pkt.)
- Dokumentation und PHPDoc (4 Pkt.)
- Fehlerbehandlung (3 Pkt.)

**Referenz**: `check-code-quality.md`

### Schritt 4: Test-Audit (25 Punkte)

Test-Prüfung durchführen:

**Befehl**: Slash-Befehl `/symfony:check-testing` verwenden oder die Schritte in `check-testing.md` manuell befolgen

**Bewertete Kriterien**:
- Code-Abdeckung (7 Pkt.)
- Unit-Tests für Domain (6 Pkt.)
- Integrationstests für Infrastructure (4 Pkt.)
- Funktionale Tests (WebTestCase/Behat) (3 Pkt.)
- Mutations-Testing mit Infection (3 Pkt.)
- Test-Isolation und Fixtures (2 Pkt.)

**Referenz**: `check-testing.md`

### Schritt 5: Sicherheits-Audit (25 Punkte)

Sicherheitsprüfung durchführen:

**Befehl**: Slash-Befehl `/symfony:check-security` verwenden oder die Schritte in `check-security.md` manuell befolgen

**Bewertete Kriterien**:
- Konfiguration des Symfony Security Bundle (6 Pkt.)
- OWASP-Top-10-Schutzmaßnahmen (5 Pkt.)
- Verwaltung von Secrets und Anmeldeinformationen (4 Pkt.)
- Eingabevalidierung und CSRF (4 Pkt.)
- Authentifizierung und Autorisierung (Voters) (3 Pkt.)
- Abhängigkeitsschwachstellen (2 Pkt.)
- DSGVO-Konformität (1 Pkt.)

**Referenz**: `check-security.md`

### Schritt 6: Konsolidierung und Gesamtbewertung

Gesamtergebnis berechnen und konsolidierten Bericht erstellen:
- [ ] Die 4 Bewertungen addieren (max. 100 Punkte)
- [ ] Kritische Kategorien identifizieren (< 50 %)
- [ ] Alle kritischen kategorienübergreifenden Probleme auflisten
- [ ] Maßnahmen nach Auswirkung/Aufwand priorisieren
- [ ] Abschließenden konsolidierten Bericht erstellen

**Bewertungsskala**:
- 90–100: Ausgezeichnet – Referenzprojekt
- 75–89: Sehr gut – Einige kleinere Verbesserungen
- 60–74: Akzeptabel – Verbesserungen erforderlich
- 40–59: Unzureichend – Umfangreiches Refactoring erforderlich
- 0–39: Kritisch – Vollständige Überarbeitung notwendig

### Schritt 7: Empfehlungen und Aktionsplan

Abschließende Empfehlungen erstellen:
- [ ] Top-3-Prioritätsmaßnahmen über alle Kategorien hinweg identifizieren
- [ ] Aufwand (Niedrig/Mittel/Hoch) für jede Maßnahme schätzen
- [ ] Auswirkung (Niedrig/Mittel/Hoch) für jede Maßnahme schätzen
- [ ] Umsetzungsreihenfolge vorschlagen
- [ ] Quick Wins vorschlagen (hohes Auswirkungs-/Aufwandsverhältnis)

## AUSGABEFORMAT

```
SYMFONY-KONFORMITÄTS-AUDIT - VOLLSTÄNDIGER BERICHT
=============================================

GESAMTERGEBNIS: XX/100

KONFORMITÄTSNIVEAU: [Ausgezeichnet/Sehr gut/Akzeptabel/Unzureichend/Kritisch]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ERGEBNISSE NACH KATEGORIE:

ARCHITEKTUR        : XX/25  [██████████░░░░░░░░░░] XX%
CODE-QUALITÄT      : XX/25  [██████████░░░░░░░░░░] XX%
TESTS              : XX/25  [██████████░░░░░░░░░░] XX%
SICHERHEIT         : XX/25  [██████████░░░░░░░░░░] XX%

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

GESAMTSTÄRKEN:
1. [In mehreren Kategorien identifizierte Stärke]
2. [Weitere wesentliche Stärke]
3. [Dritte Stärke]

GESAMTVERBESSERUNGEN:
1. [Kleinere kategorienübergreifende Verbesserung]
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

Teilbewertungen:
  • Clean-Architecture-Struktur   : XX/6
  • Schichtentrennung             : XX/6
  • Hexagonal / Ports & Adapters  : XX/4
  • DDD-Modellierung              : XX/4
  • Use Cases                     : XX/3
  • Abhängigkeitsregeln           : XX/2

Stärken:
- [Architekturstärken]

Probleme:
- [Architekturprobleme]

[Ähnliche Abschnitte für Code-Qualität, Tests und Sicherheit...]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

TOP 3 PRIORITÄTSMASSNAHMEN (ALLE KATEGORIEN):

1. KRITISCH - [Maßnahme Nr. 1]
   Kategorie  : [Architektur/Qualität/Tests/Sicherheit]
   Auswirkung : [Hoch/Mittel/Niedrig]
   Aufwand    : [Hoch/Mittel/Niedrig]
   Priorität  : SOFORT

   Detaillierte Beschreibung:
   [Erklärung des Problems und vorgeschlagene Lösung]

   Betroffene Dateien:
   - [datei:zeile]

   Korrekturbeispiel:
   [Code oder Korrekturbefehl]

2. WICHTIG - [Maßnahme Nr. 2]
   [Gleiche Format...]

3. EMPFOHLEN - [Maßnahme Nr. 3]
   [Gleiche Format...]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

QUICK WINS (Hohe Auswirkung / Niedriger Aufwand):

- [Quick Win Nr. 1] - Kategorie: [X] - Auswirkung: [X] - Aufwand: [X]
- [Quick Win Nr. 2] - Kategorie: [X] - Auswirkung: [X] - Aufwand: [X]
- [Quick Win Nr. 3] - Kategorie: [X] - Auswirkung: [X] - Aufwand: [X]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

EMPFOHLENER AKTIONSPLAN:

WOCHE 1 (Sofort):
- [ ] [Kritische Maßnahme Nr. 1]
- [ ] [Prioritäts-Quick-Win]

WOCHE 2–4 (Kurzfristig):
- [ ] [Wichtige Maßnahme Nr. 2]
- [ ] [Weitere Quick Wins]

MONAT 2–3 (Mittelfristig):
- [ ] [Empfohlene Maßnahme Nr. 3]
- [ ] [Schrittweise Verbesserungen]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

MANAGEMENT-ZUSAMMENFASSUNG:

[Zusammenfassender Absatz zum allgemeinen Projektzustand, wesentlichen Stärken,
wesentlichen Schwächen und empfohlenem Weg zur Verbesserung der
Konformität. Angabe, ob das Projekt produktionsbereit ist,
Korrekturen erfordert oder refaktoriert werden muss.]

Allgemeine Empfehlung: [Produktionsbereit / Kleinere Korrekturen /
Umfangreiches Refactoring / Vollständige Überarbeitung notwendig]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## WICHTIGE HINWEISE

- Dieser Befehl orchestriert die 4 spezialisierten Audits
- Docker für alle Analysetools verwenden
- Konkrete Beispiele mit datei:zeile für jedes Problem angeben
- Maßnahmen nach der Auswirkung-/Aufwand-Matrix priorisieren
- Sicherheitsprobleme haben IMMER höchste Priorität
- Automatisierbare Korrekturen vorschlagen (Skripte, Pre-Commit-Hooks)
- Der Bericht muss handlungsorientiert sein, nicht nur beschreibend
- Empfehlungen an den fachlichen Kontext des Projekts anpassen
