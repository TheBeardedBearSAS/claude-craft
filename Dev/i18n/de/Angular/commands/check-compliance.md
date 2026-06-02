---
description: Vollständige Angular-Compliance-Prüfung durchführen
argument-hint: [arguments]
---

# Vollständige Angular-Compliance-Prüfung

## Argumente

$ARGUMENTS (optional: Pfad zum zu analysierenden Projekt)

## Plan-Modus

> Der Plan-Modus wird automatisch aktiviert, wenn der Umfang mehrere Module umfasst oder eine übergreifende Untersuchung erfordert.

## AUFTRAG

Führen Sie ein vollständiges Compliance-Audit des Angular-Projekts durch, indem Sie die 4 Hauptprüfungen orchestrieren: Architektur, Code-Qualität, Tests und Sicherheit. Erstellen Sie einen konsolidierten Bericht mit einer Gesamtpunktzahl von 100 Punkten.

### Schritt 1: Audit-Vorbereitung

Audit-Umgebung vorbereiten:
- [ ] Zu prüfenden Projektpfad identifizieren
- [ ] Vorhandensein von Konfigurationsdateien prüfen (angular.json, tsconfig.json, package.json)
- [ ] Hauptverzeichnisse auflisten (src/app/, e2e/, usw.)
- [ ] Projektstruktur und Angular-Version identifizieren

**Hinweis**: Wenn $ARGUMENTS angegeben ist, diesen als Projektpfad verwenden, andernfalls das aktuelle Verzeichnis verwenden.

### Schritt 2: Architektur-Audit (25 Punkte)

Vollständige Architekturprüfung durchführen:

**Befehl**: Slash-Befehl `/angular:check-architecture` verwenden oder die Schritte in `check-architecture.md` manuell befolgen

**Bewertete Kriterien**:
- Domain-getriebene Modulstruktur (6 Pkt.)
- Verwendung von Standalone-Komponenten (6 Pkt.)
- Lazy Loading und Routing (4 Pkt.)
- Core/Shared/Feature-Trennung (4 Pkt.)
- Organisation der Service-Schicht (3 Pkt.)
- Dependency-Injection-Muster (2 Pkt.)

**Referenz**: `check-architecture.md`

### Schritt 3: Code-Qualitäts-Audit (25 Punkte)

Code-Qualitätsprüfung durchführen:

**Befehl**: Slash-Befehl `/angular:check-code-quality` verwenden oder die Schritte in `check-code-quality.md` manuell befolgen

**Bewertete Kriterien**:
- TypeScript-Strict-Modus und Typsicherheit (5 Pkt.)
- ESLint-Konformität (5 Pkt.)
- Signals und moderne Angular-Muster (4 Pkt.)
- KISS/DRY/YAGNI-Prinzipien (4 Pkt.)
- Namenskonventionen und Dateistruktur (4 Pkt.)
- OnPush-Change-Detection (3 Pkt.)

**Referenz**: `check-code-quality.md`

### Schritt 4: Test-Audit (25 Punkte)

Testprüfung durchführen:

**Befehl**: Slash-Befehl `/angular:check-testing` verwenden oder die Schritte in `check-testing.md` manuell befolgen

**Bewertete Kriterien**:
- Code-Abdeckung (7 Pkt.)
- Unit-Tests für Services und Pipes (6 Pkt.)
- Komponenten-Tests mit TestBed (4 Pkt.)
- Integrationstests (3 Pkt.)
- E2E-Tests (3 Pkt.)
- Test-Isolation und Mocks (2 Pkt.)

**Referenz**: `check-testing.md`

### Schritt 5: Sicherheits-Audit (25 Punkte)

Sicherheitsprüfung durchführen:

**Befehl**: Slash-Befehl `/angular:check-security` verwenden oder die Schritte in `check-security.md` manuell befolgen

**Bewertete Kriterien**:
- XSS-Prävention und DomSanitizer (6 Pkt.)
- Verwaltung von Geheimnissen und Anmeldedaten (5 Pkt.)
- Eingabevalidierung und -bereinigung (4 Pkt.)
- Schwachstellen in Abhängigkeiten (4 Pkt.)
- Authentifizierung und Route Guards (3 Pkt.)
- CSRF und HTTP-Interceptors (2 Pkt.)
- Content Security Policy (1 Pkt.)

**Referenz**: `check-security.md`

### Schritt 6: Konsolidierung und Gesamtbewertung

Gesamtpunktzahl berechnen und konsolidierten Bericht erstellen:
- [ ] Die 4 Punktzahlen addieren (max. 100 Punkte)
- [ ] Kritische Kategorien identifizieren (<50%)
- [ ] Alle kritischen übergreifenden Probleme auflisten
- [ ] Maßnahmen nach Auswirkung/Aufwand priorisieren
- [ ] Abschließenden konsolidierten Bericht erstellen

**Bewertungsskala**:
- 90-100: Ausgezeichnet — Referenzprojekt
- 75-89: Sehr gut — Einige geringfügige Verbesserungen
- 60-74: Akzeptabel — Verbesserungen erforderlich
- 40-59: Unzureichend — Größeres Refactoring erforderlich
- 0-39: Kritisch — Vollständige Überarbeitung notwendig

### Schritt 7: Empfehlungen und Aktionsplan

Abschließende Empfehlungen erstellen:
- [ ] Top-3-Prioritätsmaßnahmen über alle Kategorien hinweg identifizieren
- [ ] Aufwand (Gering/Mittel/Hoch) für jede Maßnahme schätzen
- [ ] Auswirkung (Gering/Mittel/Hoch) für jede Maßnahme schätzen
- [ ] Umsetzungsreihenfolge vorschlagen
- [ ] Quick Wins vorschlagen (hohes Auswirkungs-/Aufwandsverhältnis)

## AUSGABEFORMAT

```
ANGULAR COMPLIANCE AUDIT - VOLLSTÄNDIGER BERICHT
=================================================

GESAMTPUNKTZAHL: XX/100

COMPLIANCE-NIVEAU: [Ausgezeichnet/Sehr gut/Akzeptabel/Unzureichend/Kritisch]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PUNKTE NACH KATEGORIE:

ARCHITEKTUR       : XX/25  [██████████░░░░░░░░░░] XX%
CODE-QUALITÄT     : XX/25  [██████████░░░░░░░░░░] XX%
TESTS             : XX/25  [██████████░░░░░░░░░░] XX%
SICHERHEIT        : XX/25  [██████████░░░░░░░░░░] XX%

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

GESAMTSTÄRKEN:
1. [In mehreren Kategorien identifizierte Stärke]
2. [Weitere wichtige Stärke]
3. [Dritte Stärke]

GESAMTVERBESSERUNGEN:
1. [Geringfügige übergreifende Verbesserung]
2. [Weitere empfohlene Verbesserung]
3. [Dritte Verbesserung]

KRITISCHE PROBLEME:
1. [Kritisches Problem Nr. 1 — betroffene Kategorie]
2. [Kritisches Problem Nr. 2 — betroffene Kategorie]
3. [Kritisches Problem Nr. 3 — betroffene Kategorie]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

DETAILS NACH KATEGORIE:

┌─────────────────────────────────────────────┐
│ ARCHITEKTUR (XX/25)                         │
└─────────────────────────────────────────────┘

Teilpunkte:
  • Domain-getriebene Module        : XX/6
  • Standalone-Komponenten          : XX/6
  • Lazy Loading und Routing        : XX/4
  • Core/Shared/Feature             : XX/4
  • Service-Schicht                 : XX/3
  • Dependency Injection            : XX/2

Stärken:
- [Architekturstärken]

Probleme:
- [Architekturprobleme]

[Ähnliche Abschnitte für Code-Qualität, Tests und Sicherheit...]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

TOP 3 PRIORITÄTSMASSNAHMEN (ALLE KATEGORIEN):

1. KRITISCH - [Maßnahme Nr. 1]
   Kategorie  : [Architektur/Qualität/Tests/Sicherheit]
   Auswirkung : [Hoch/Mittel/Gering]
   Aufwand    : [Hoch/Mittel/Gering]
   Priorität  : SOFORT

   Detaillierte Beschreibung:
   [Erläuterung des Problems und vorgeschlagene Lösung]

   Betroffene Dateien:
   - [datei:zeile]

   Korrekturbeispiel:
   [Code oder Korrekturbefehl]

2. WICHTIG - [Maßnahme Nr. 2]
   [Gleiches Format...]

3. EMPFOHLEN - [Maßnahme Nr. 3]
   [Gleiches Format...]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

QUICK WINS (Hohe Auswirkung / Geringer Aufwand):

- [Quick Win Nr. 1] - Kategorie: [X] - Auswirkung: [X] - Aufwand: [X]
- [Quick Win Nr. 2] - Kategorie: [X] - Auswirkung: [X] - Aufwand: [X]
- [Quick Win Nr. 3] - Kategorie: [X] - Auswirkung: [X] - Aufwand: [X]

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

ZUSAMMENFASSUNG FÜR DIE GESCHÄFTSLEITUNG:

[Zusammenfassender Absatz zum Gesamtzustand des Projekts, zu den wichtigsten Stärken,
den wichtigsten Schwächen und zur empfohlenen Entwicklung zur Verbesserung
der Compliance. Angeben, ob das Projekt produktionsreif ist,
Korrekturen erfordert oder refaktoriert werden muss.]

Allgemeine Empfehlung: [Produktionsreif / Geringfügige Korrekturen /
Größeres Refactoring / Überarbeitung notwendig]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## WICHTIGE HINWEISE

- Dieser Befehl orchestriert die 4 spezialisierten Audits
- Docker für alle Analysewerkzeuge verwenden
- Konkrete Beispiele mit datei:zeile für jedes Problem bereitstellen
- Maßnahmen auf der Grundlage der Auswirkungs-/Aufwandsmatrix priorisieren
- Sicherheitsprobleme haben IMMER höchste Priorität
- Automatisierbare Korrekturen vorschlagen (Skripte, Pre-Commit-Hooks)
- Der Bericht muss umsetzbar sein, nicht nur beschreibend
- Empfehlungen an den geschäftlichen Kontext des Projekts anpassen
