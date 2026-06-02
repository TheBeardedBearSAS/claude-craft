---
description: Vollständige Vue.js-Konformitätsprüfung durchführen
argument-hint: [arguments]
---

# Vollständige Vue.js-Konformitätsprüfung

## Argumente

$ARGUMENTS (optional: Pfad zum zu analysierenden Projekt)

## Plan-Modus

> Der Plan-Modus wird automatisch aktiviert, wenn der Umfang mehrere Module umfasst oder eine modulübergreifende Untersuchung erfordert.

## AUFTRAG

Führen Sie ein vollständiges Konformitäts-Audit des Vue.js-Projekts durch, indem Sie die 4 wichtigsten Prüfungen orchestrieren: Architektur, Codequalität, Tests und Sicherheit. Erstellen Sie einen konsolidierten Bericht mit einer Gesamtpunktzahl von 100 Punkten.

### Schritt 1: Audit-Vorbereitung

Audit-Umgebung vorbereiten:
- [ ] Zu prüfenden Projektpfad identifizieren
- [ ] Vorhandensein der Konfigurationsdateien überprüfen (package.json, tsconfig.json, vite.config.ts)
- [ ] Hauptverzeichnisse auflisten (src/, tests/, public/ usw.)
- [ ] Projektstruktur und Vue.js-Version identifizieren

**Hinweis**: Falls $ARGUMENTS angegeben, als Projektpfad verwenden; andernfalls das aktuelle Verzeichnis nutzen.

### Schritt 2: Architektur-Audit (25 Punkte)

Vollständige Architekturprüfung durchführen:

**Befehl**: Slash-Befehl `/vuejs:check-architecture` verwenden oder die Schritte in `check-architecture.md` manuell befolgen

**Bewertete Kriterien**:
- Komponenten- und Feature-Organisation (6 Pkt.)
- Composables-Struktur und Wiederverwendung (6 Pkt.)
- Pinia-Store-Architektur (4 Pkt.)
- Router-Konfiguration und Lazy Loading (4 Pkt.)
- Trennung von gemeinsamen/gemeinsam genutzten Modulen (3 Pkt.)
- Abhängigkeitsregeln und Barrel-Exporte (2 Pkt.)

**Referenz**: `check-architecture.md`

### Schritt 3: Codequalitäts-Audit (25 Punkte)

Codequalitätsprüfung durchführen:

**Befehl**: Slash-Befehl `/vuejs:check-code-quality` verwenden oder die Schritte in `check-code-quality.md` manuell befolgen

**Bewertete Kriterien**:
- TypeScript-Strict-Modus und Typsicherheit (5 Pkt.)
- ESLint- und Prettier-Konformität (5 Pkt.)
- Verwendung der Composition API und script setup (4 Pkt.)
- KISS/DRY/YAGNI-Prinzipien (4 Pkt.)
- Namenskonventionen (4 Pkt.)
- Fehlerbehandlung (3 Pkt.)

**Referenz**: `check-code-quality.md`

### Schritt 4: Test-Audit (25 Punkte)

Test-Prüfung durchführen:

**Befehl**: Slash-Befehl `/vuejs:check-testing` verwenden oder die Schritte in `check-testing.md` manuell befolgen

**Bewertete Kriterien**:
- Codeabdeckung (7 Pkt.)
- Unit-Tests für Composables und Stores (6 Pkt.)
- Komponententests mit Vue Test Utils (4 Pkt.)
- Integrationstests (3 Pkt.)
- Testqualität und AAA-Muster (3 Pkt.)
- Organisation von Mocks und Fixtures (2 Pkt.)

**Referenz**: `check-testing.md`

### Schritt 5: Sicherheits-Audit (25 Punkte)

Sicherheitsprüfung durchführen:

**Befehl**: Slash-Befehl `/vuejs:check-security` verwenden oder die Schritte in `check-security.md` manuell befolgen

**Bewertete Kriterien**:
- XSS-Prävention (v-html-Verwendung) (6 Pkt.)
- Verwaltung von Geheimnissen und Zugangsdaten (5 Pkt.)
- Eingabevalidierung und -bereinigung (4 Pkt.)
- Abhängigkeitsschwachstellen (4 Pkt.)
- Authentifizierung und Routenschutzwächter (3 Pkt.)
- Sichere API-Kommunikation (2 Pkt.)
- CSRF-Schutz (1 Pkt.)

**Referenz**: `check-security.md`

### Schritt 6: Konsolidierung und Gesamtbewertung

Gesamtpunktzahl berechnen und konsolidierten Bericht erstellen:
- [ ] Die 4 Punktzahlen addieren (max. 100 Punkte)
- [ ] Kritische Kategorien identifizieren (< 50 %)
- [ ] Alle kritischen bereichsübergreifenden Probleme auflisten
- [ ] Maßnahmen nach Auswirkung/Aufwand priorisieren
- [ ] Endgültigen konsolidierten Bericht erstellen

**Bewertungsskala**:
- 90–100: Hervorragend – Referenzprojekt
- 75–89: Sehr gut – Einige geringfügige Verbesserungen
- 60–74: Akzeptabel – Erfordert Verbesserungen
- 40–59: Unzureichend – Größeres Refactoring erforderlich
- 0–39: Kritisch – Vollständige Überarbeitung notwendig

### Schritt 7: Empfehlungen und Aktionsplan

Abschließende Empfehlungen erstellen:
- [ ] Top-3-Prioritätsmaßnahmen über alle Kategorien hinweg identifizieren
- [ ] Aufwand (Niedrig/Mittel/Hoch) für jede Maßnahme schätzen
- [ ] Auswirkung (Niedrig/Mittel/Hoch) für jede Maßnahme schätzen
- [ ] Implementierungsreihenfolge vorschlagen
- [ ] Quick Wins vorschlagen (hohes Auswirkungs-/Aufwandsverhältnis)

## AUSGABEFORMAT

```
VUE.JS-KONFORMITÄTS-AUDIT – VOLLSTÄNDIGER BERICHT
=============================================

GESAMTPUNKTZAHL: XX/100

KONFORMITÄTSNIVEAU: [Hervorragend/Sehr gut/Akzeptabel/Unzureichend/Kritisch]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PUNKTZAHLEN NACH KATEGORIE:

ARCHITEKTUR       : XX/25  [██████████░░░░░░░░░░] XX%
CODEQUALITÄT      : XX/25  [██████████░░░░░░░░░░] XX%
TESTS             : XX/25  [██████████░░░░░░░░░░] XX%
SICHERHEIT        : XX/25  [██████████░░░░░░░░░░] XX%

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

GESAMTSTÄRKEN:
1. [In mehreren Kategorien identifizierte Stärke]
2. [Weitere wichtige Stärke]
3. [Dritte Stärke]

GESAMTVERBESSERUNGEN:
1. [Geringfügige bereichsübergreifende Verbesserung]
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
  • Komponenten- und Feature-Org.  : XX/6
  • Composables-Struktur           : XX/6
  • Pinia-Store-Architektur        : XX/4
  • Router und Lazy Loading        : XX/4
  • Trennung gemeinsamer Module    : XX/3
  • Abhängigkeitsregeln            : XX/2

Stärken:
- [Architekturstärken]

Probleme:
- [Architekturprobleme]

[Ähnliche Abschnitte für Codequalität, Tests und Sicherheit ...]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

TOP-3-PRIORITÄTSMANAHMEN (ALLE KATEGORIEN):

1. KRITISCH – [Maßnahme Nr. 1]
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

2. WICHTIG – [Maßnahme Nr. 2]
   [Gleiche Struktur …]

3. EMPFOHLEN – [Maßnahme Nr. 3]
   [Gleiche Struktur …]

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

WOCHE 2–4 (Kurzfristig):
- [ ] [Wichtige Maßnahme Nr. 2]
- [ ] [Weitere Quick Wins]

MONAT 2–3 (Mittelfristig):
- [ ] [Empfohlene Maßnahme Nr. 3]
- [ ] [Schrittweise Verbesserungen]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ZUSAMMENFASSUNG FÜR DIE GESCHÄFTSFÜHRUNG:

[Zusammenfassender Absatz über den Gesamtzustand des Projekts, wesentliche
Stärken, wesentliche Schwächen und empfohlene Entwicklung zur Verbesserung
der Konformität. Angabe, ob das Projekt produktionsreif ist,
Korrekturen benötigt oder ein Refactoring erfordert.]

Allgemeine Empfehlung: [Produktionsreif / Geringfügige Korrekturen /
Größeres Refactoring / Überarbeitung notwendig]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## WICHTIGE HINWEISE

- Dieser Befehl orchestriert die 4 spezialisierten Audits
- Docker für alle Analysetools verwenden
- Konkrete Beispiele mit datei:zeile für jedes Problem angeben
- Maßnahmen nach der Auswirkungs-/Aufwandsmatrix priorisieren
- Sicherheitsprobleme haben IMMER oberste Priorität
- Automatisierbare Korrekturen vorschlagen (Skripte, Pre-Commit-Hooks)
- Der Bericht muss handlungsorientiert sein, nicht nur beschreibend
- Empfehlungen an den geschäftlichen Kontext des Projekts anpassen
