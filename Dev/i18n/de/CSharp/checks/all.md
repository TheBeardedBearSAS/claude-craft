# Vollständiges C#/.NET-Konformitäts-Audit

## Argumente

$ARGUMENTS (optional: Pfad zum zu analysierenden Projekt)

## Plan-Modus

> Der Plan-Modus wird automatisch aktiviert, wenn der Umfang mehrere Module umfasst oder eine modulübergreifende Untersuchung erfordert.

## MISSION

Ein vollständiges Konformitäts-Audit des C#/.NET-Projekts durchführen, indem die 4 wesentlichen Prüfungen orchestriert werden: Architektur, Code-Qualität, Tests und Sicherheit. Einen konsolidierten Bericht mit einem Gesamtergebnis von 100 Punkten erstellen.

### Schritt 1: Audit-Vorbereitung

Audit-Umgebung vorbereiten:
- [ ] Zu auditierendes Projektverzeichnis identifizieren
- [ ] Vorhandensein von Konfigurationsdateien prüfen (.sln, .csproj, Directory.Build.props)
- [ ] Hauptverzeichnisse auflisten (src/, tests/ usw.)
- [ ] Projektstruktur und .NET-Version identifizieren

**Hinweis**: Wenn $ARGUMENTS angegeben ist, diesen als Projektpfad verwenden, andernfalls das aktuelle Verzeichnis verwenden.

### Schritt 2: Architektur-Audit (25 Punkte)

Vollständige Architekturprüfung durchführen:

**Befehl**: Slash-Befehl `/csharp:check architecture` verwenden oder die Schritte in `.claude/references/csharp/checks/architecture.md` manuell befolgen

**Bewertete Kriterien**:
- Schichtentrennung der Clean Architecture (6 Pkt.)
- Abhängigkeitsfluss (Domain hat keine externen Referenzen) (6 Pkt.)
- CQRS- und MediatR-Patterns (4 Pkt.)
- DDD-Modellierung (Entities, Value Objects, Aggregates) (4 Pkt.)
- Repository- und Unit-of-Work-Patterns (3 Pkt.)
- Projektreferenzen und Abhängigkeitsregeln (2 Pkt.)

**Referenz**: `.claude/references/csharp/checks/architecture.md`

### Schritt 3: Code-Qualitäts-Audit (25 Punkte)

Code-Qualitätsprüfung durchführen:

**Befehl**: Slash-Befehl `/csharp:check code-quality` verwenden oder die Schritte in `.claude/references/csharp/checks/code-quality.md` manuell befolgen

**Bewertete Kriterien**:
- Namenskonventionen (PascalCase, _camelCase) (5 Pkt.)
- Moderne C#-Features (Records, Pattern Matching) (5 Pkt.)
- Nullable Reference Types aktiviert (4 Pkt.)
- KISS/DRY/YAGNI-Prinzipien (4 Pkt.)
- Async/Await-Patterns (kein .Result/.Wait()) (4 Pkt.)
- Dokumentation und XML-Kommentare (3 Pkt.)

**Referenz**: `.claude/references/csharp/checks/code-quality.md`

### Schritt 4: Test-Audit (25 Punkte)

Testprüfung durchführen:

**Befehl**: Slash-Befehl `/csharp:check testing` verwenden oder die Schritte in `.claude/references/csharp/checks/testing.md` manuell befolgen

**Bewertete Kriterien**:
- Code-Abdeckung (7 Pkt.)
- Unit-Tests für Domain und Application (6 Pkt.)
- Integrationstests für die Infrastructure (4 Pkt.)
- Qualität von FluentAssertions (3 Pkt.)
- Testorganisation und Fixtures (3 Pkt.)
- Mocking-Patterns (Moq/NSubstitute) (2 Pkt.)

**Referenz**: `.claude/references/csharp/checks/testing.md`

### Schritt 5: Sicherheits-Audit (25 Punkte)

Sicherheitsprüfung durchführen:

**Befehl**: Slash-Befehl `/csharp:check security` verwenden oder die Schritte in `.claude/references/csharp/checks/security.md` manuell befolgen

**Bewertete Kriterien**:
- OWASP-Top-10-Schutzmaßnahmen (6 Pkt.)
- Verwaltung von Secrets und Zugangsdaten (5 Pkt.)
- Eingabevalidierung (FluentValidation) (4 Pkt.)
- Schwachstellen in Abhängigkeiten (4 Pkt.)
- Authentifizierung und Autorisierung (3 Pkt.)
- Sichere Konfiguration (2 Pkt.)
- SQL-Injection-Prävention (1 Pkt.)

**Referenz**: `.claude/references/csharp/checks/security.md`

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
C#/.NET-KONFORMITÄTS-AUDIT - VOLLSTÄNDIGER BERICHT
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
  • Clean-Architecture-Schichten  : XX/6
  • Abhängigkeitsfluss            : XX/6
  • CQRS und MediatR              : XX/4
  • DDD-Modellierung              : XX/4
  • Repository-Patterns           : XX/3
  • Projektreferenzen             : XX/2

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
   [Gleiches Format...]

3. EMPFOHLEN - [Maßnahme Nr. 3]
   [Gleiches Format...]

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
