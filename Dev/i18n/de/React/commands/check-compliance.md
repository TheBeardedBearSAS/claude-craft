---
description: Vollständige React-Konformität prüfen
argument-hint: [arguments]
---

# Vollständige React-Konformität prüfen

## Argumente

$ARGUMENTS (optional: Pfad zum zu analysierenden Projekt)

## Plan-Modus

> Der Plan-Modus wird automatisch aktiviert, wenn der Umfang mehrere Module umfasst oder eine modulübergreifende Untersuchung erfordert.

## MISSION

Ein vollständiges Konformitäts-Audit des React-Projekts durchführen, indem die 4 Hauptprüfungen orchestriert werden: Architektur, Codequalität, Tests und Sicherheit. Einen konsolidierten Bericht mit einer Gesamtbewertung von 100 Punkten erstellen.

### Schritt 1: Audit-Vorbereitung

Audit-Umgebung vorbereiten:
- [ ] Zu prüfenden Projektpfad identifizieren
- [ ] Vorhandensein von Konfigurationsdateien überprüfen (package.json, tsconfig.json)
- [ ] Hauptverzeichnisse auflisten (src/, tests/, public/ usw.)
- [ ] Projektstruktur und React-Version identifizieren

**Hinweis**: Wenn $ARGUMENTS angegeben, als Projektpfad verwenden, andernfalls aktuelles Verzeichnis.

### Schritt 2: Architektur-Audit (25 Punkte)

Vollständige Architekturprüfung ausführen:

**Befehl**: Slash-Befehl `/react:check-architecture` verwenden oder Schritte in `check-architecture.md` manuell befolgen

**Bewertete Kriterien**:
- Feature-basierte Struktur (6 Pkt)
- Komponentenorganisation und Ko-Lokation (6 Pkt)
- State-Management-Muster (4 Pkt)
- Routing und Navigation (4 Pkt)
- Shared/Common-Modul-Trennung (3 Pkt)
- Abhängigkeitsregeln und Barrel Exports (2 Pkt)

**Referenz**: `check-architecture.md`

### Schritt 3: Code-Qualitäts-Audit (25 Punkte)

Codequalitätsprüfung ausführen:

**Befehl**: Slash-Befehl `/react:check-code-quality` verwenden oder Schritte in `check-code-quality.md` manuell befolgen

**Bewertete Kriterien**:
- TypeScript Strict Mode und Type-Safety (5 Pkt)
- ESLint- und Prettier-Konformität (5 Pkt)
- React-Muster und Hook-Regeln (4 Pkt)
- KISS/DRY/YAGNI-Prinzipien (4 Pkt)
- Namenskonventionen (4 Pkt)
- Fehlerbehandlung und Error Boundaries (3 Pkt)

**Referenz**: `check-code-quality.md`

### Schritt 4: Test-Audit (25 Punkte)

Testprüfung ausführen:

**Befehl**: Slash-Befehl `/react:check-testing` verwenden oder Schritte in `check-testing.md` manuell befolgen

**Bewertete Kriterien**:
- Code-Abdeckung (7 Pkt)
- Unit-Tests für Hooks und Utilities (6 Pkt)
- Komponenten-Tests mit Testing Library (4 Pkt)
- Integrationstests (3 Pkt)
- Test-Qualität und AAA-Muster (3 Pkt)
- Mocks und Fixture-Organisation (2 Pkt)

**Referenz**: `check-testing.md`

### Schritt 5: Sicherheits-Audit (25 Punkte)

Sicherheitsprüfung ausführen:

**Befehl**: Slash-Befehl `/react:check-security` verwenden oder Schritte in `check-security.md` manuell befolgen

**Bewertete Kriterien**:
- XSS-Prävention (dangerouslySetInnerHTML) (6 Pkt)
- Secrets und Anmeldedaten-Management (5 Pkt)
- Eingabevalidierung und Sanitization (4 Pkt)
- Abhängigkeits-Schwachstellen (4 Pkt)
- Authentifizierung und Autorisierung (3 Pkt)
- Sichere API-Kommunikation (2 Pkt)
- CSRF-Schutz (1 Pkt)

**Referenz**: `check-security.md`

### Schritt 6: Konsolidierung und Gesamtbewertung

Gesamtpunktzahl berechnen und konsolidierten Bericht erstellen:
- [ ] Die 4 Punktzahlen addieren (max. 100 Punkte)
- [ ] Kritische Kategorien identifizieren (<50%)
- [ ] Alle kritischen übergreifenden Probleme auflisten
- [ ] Maßnahmen nach Impact/Aufwand priorisieren
- [ ] Abschließenden konsolidierten Bericht erstellen

**Bewertungsskala**:
- 90-100: Ausgezeichnet — Referenzprojekt
- 75-89: Sehr gut — Einige geringfügige Verbesserungen
- 60-74: Akzeptabel — Verbesserungen erforderlich
- 40-59: Unzureichend — Größere Refaktorierung erforderlich
- 0-39: Kritisch — Vollständige Überarbeitung notwendig

### Schritt 7: Empfehlungen und Aktionsplan

Abschlussempfehlungen erstellen:
- [ ] Top 3 Prioritätsmaßnahmen über alle Kategorien identifizieren
- [ ] Aufwand (Niedrig/Mittel/Hoch) für jede Maßnahme schätzen
- [ ] Auswirkung (Niedrig/Mittel/Hoch) für jede Maßnahme schätzen
- [ ] Implementierungsreihenfolge vorschlagen
- [ ] Quick Wins vorschlagen (hohes Auswirkungs-/Aufwandsverhältnis)

## AUSGABEFORMAT

```
REACT-KONFORMITÄTS-AUDIT - VOLLSTÄNDIGER BERICHT
=============================================

GESAMTBEWERTUNG: XX/100

KONFORMITÄTSSTUFE: [Ausgezeichnet/Sehr gut/Akzeptabel/Unzureichend/Kritisch]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

BEWERTUNGEN NACH KATEGORIE:

ARCHITEKTUR       : XX/25  [██████████░░░░░░░░░░] XX%
CODEQUALITÄT      : XX/25  [██████████░░░░░░░░░░] XX%
TESTS             : XX/25  [██████████░░░░░░░░░░] XX%
SICHERHEIT        : XX/25  [██████████░░░░░░░░░░] XX%

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ALLGEMEINE STÄRKEN:
1. [Stärke in mehreren Kategorien identifiziert]
2. [Andere große Stärke]
3. [Dritte Stärke]

ALLGEMEINE VERBESSERUNGEN:
1. [Geringfügige übergreifende Verbesserung]
2. [Andere empfohlene Verbesserung]
3. [Dritte Verbesserung]

KRITISCHE PROBLEME:
1. [Kritisches Problem #1 - betroffene Kategorie]
2. [Kritisches Problem #2 - betroffene Kategorie]
3. [Kritisches Problem #3 - betroffene Kategorie]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

DETAILS NACH KATEGORIE:

┌─────────────────────────────────────────────┐
│ ARCHITEKTUR (XX/25)                         │
└─────────────────────────────────────────────┘

Teilpunktzahlen:
  • Feature-basierte Struktur     : XX/6
  • Komponentenorganisation       : XX/6
  • State-Management              : XX/4
  • Routing und Navigation        : XX/4
  • Shared-Modul-Trennung         : XX/3
  • Abhängigkeitsregeln           : XX/2

Stärken:
- [Architekturstärken]

Probleme:
- [Architekturprobleme]

[Ähnliche Abschnitte für Codequalität, Tests und Sicherheit...]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

TOP 3 PRIORITÄTSMASSNAHMEN (ALLE KATEGORIEN):

1. KRITISCH - [Maßnahme #1]
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

2. WICHTIG - [Maßnahme #2]
   [Gleiches Format...]

3. EMPFOHLEN - [Maßnahme #3]
   [Gleiches Format...]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

QUICK WINS (Hohe Auswirkung / Geringer Aufwand):

- [Quick Win #1] - Kategorie: [X] - Auswirkung: [X] - Aufwand: [X]
- [Quick Win #2] - Kategorie: [X] - Auswirkung: [X] - Aufwand: [X]
- [Quick Win #3] - Kategorie: [X] - Auswirkung: [X] - Aufwand: [X]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

EMPFOHLENER AKTIONSPLAN:

WOCHE 1 (Sofort):
- [ ] [Kritische Maßnahme #1]
- [ ] [Priorisierter Quick Win]

WOCHE 2-4 (Kurzfristig):
- [ ] [Wichtige Maßnahme #2]
- [ ] [Weitere Quick Wins]

MONAT 2-3 (Mittelfristig):
- [ ] [Empfohlene Maßnahme #3]
- [ ] [Schrittweise Verbesserungen]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ZUSAMMENFASSUNG FÜR DAS MANAGEMENT:

[Zusammenfassungsabsatz zum Gesamtzustand des Projekts, den wichtigsten Stärken,
den größten Schwächen und dem empfohlenen Kurs zur Verbesserung
der Konformität. Erwähnen, ob das Projekt produktionsreif ist,
Korrekturen erfordert oder refaktoriert werden muss.]

Allgemeine Empfehlung: [Produktionsreif / Geringfügige Korrekturen /
Größere Refaktorierung / Überarbeitung notwendig]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## WICHTIGE HINWEISE

- Dieser Befehl orchestriert die 4 spezialisierten Audits
- Docker für alle Analyse-Tools verwenden
- Konkrete Beispiele mit Datei:Zeile für jedes Problem bereitstellen
- Maßnahmen nach der Impact/Effort-Matrix priorisieren
- Sicherheitsprobleme haben IMMER höchste Priorität
- Automatisierbare Korrekturen vorschlagen (Skripte, Pre-Commit-Hooks)
- Bericht muss umsetzbar sein, nicht nur beschreibend
- Empfehlungen an den Geschäftskontext des Projekts anpassen
