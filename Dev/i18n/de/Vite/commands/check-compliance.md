---
description: Vollständige Vite-Konformitätsprüfung durchführen
argument-hint: [arguments]
---

# Vollständige Vite-Konformitätsprüfung

## Argumente

$ARGUMENTS (optional: Pfad zum zu analysierenden Projekt)

## Plan-Modus

> Der Plan-Modus wird automatisch aktiviert, wenn der Umfang mehrere Module umfasst oder eine modulübergreifende Untersuchung erfordert.

## AUFTRAG

Führen Sie ein vollständiges Konformitäts-Audit des Vite-Projekts durch, indem Sie die 4 wichtigsten Prüfungen orchestrieren: Konfiguration & Architektur Vite, TypeScript & Qualität, Tests sowie Build-Ausgabe & Performance. Erstellen Sie einen konsolidierten Bericht mit einer Gesamtpunktzahl von 100 Punkten. **Hinweis zum Geltungsbereich**: Dieses Audit deckt ausschließlich die framework-agnostische Vite-Nutzung ab (Vanilla-JS/TS-Anwendungen, Bibliotheksentwicklung, Multi-Page-Anwendungen, Worker/WASM). Bewerten Sie keine React-/Vue-/Angular-/Svelte-spezifische Dev-Server-Integration — das gehört zur jeweiligen Konformitätsprüfung des betreffenden Stacks.

### Schritt 1: Audit-Vorbereitung

Audit-Umgebung vorbereiten:
- [ ] Zu prüfenden Projektpfad identifizieren
- [ ] Vorhandensein der Konfigurationsdateien überprüfen (package.json, tsconfig.json, vite.config.ts)
- [ ] Hauptverzeichnisse auflisten (src/, pages/, public/, tests/ usw.)
- [ ] Projekttyp identifizieren: Vanilla-SPA, Bibliothek (build.lib), Multi-Page-Anwendung oder Worker-/WASM-Einstiegspunkte
- [ ] Vite-Version identifizieren und bestätigen, dass kein framework-spezifisches Plugin (`@vitejs/plugin-react`, `@vitejs/plugin-vue` usw.) im Geltungsbereich dieses Audits liegt

**Hinweis**: Falls $ARGUMENTS angegeben, als Projektpfad verwenden; andernfalls das aktuelle Verzeichnis nutzen.

### Schritt 2: Audit Konfiguration & Architektur Vite (30 Punkte)

Vollständige Konfigurations- und Architekturprüfung ausführen:

**Bewertete Kriterien**:
- Korrektheit von vite.config.ts (defineConfig, Aliase synchron mit tsconfig) (8 Pkt.)
- Platzierung von index.html im Projekt-Root, niemals in public/ (6 Pkt.)
- Konfiguration von build.lib für Bibliotheken (entry, formats, external, vite-plugin-dts) (8 Pkt.)
- rollupOptions.input für Multi-Page-Anwendungen, Namenskonvention der Plugins (vite-plugin-*) (8 Pkt.)

**Referenz**: `.claude/agents/vite-reviewer.md` (Abschnitt 1)

### Schritt 3: Audit TypeScript & Qualität (20 Punkte)

Prüfung der TypeScript-Konfiguration und der Typisierungsqualität ausführen:

**Bewertete Kriterien**:
- strict: true, moduleResolution: "bundler", target ES2022+ (6 Pkt.)
- Vite-Typen vorhanden (vite/client), import.meta.env korrekt typisiert (5 Pkt.)
- Korrektheit der vite-plugin-dts-Ausgabe (rollupTypes, kein unbegründetes any) (5 Pkt.)
- Benutzerdefinierte Plugin-Hooks über das Plugin-Interface typisiert (4 Pkt.)

**Referenz**: `.claude/agents/vite-reviewer.md` (Abschnitt 2)

### Schritt 4: Test-Audit (25 Punkte)

Testprüfung ausführen:

**Bewertete Kriterien**:
- Kohärente Vitest-Konfiguration (mergeConfig oder eigene Datei), keine Divergenz zu vite.config.ts (6 Pkt.)
- Coverage >= 80% auf Business-Logik / öffentlicher API (6 Pkt.)
- Testumgebung entspricht dem Bedarf (node vs. jsdom/happy-dom) (4 Pkt.)
- Tests auf dem veröffentlichten Build (dist/), nicht nur auf dem Quellcode (5 Pkt.)
- Integrations-/E2E-Tests für Multi-Page-Anwendungen (4 Pkt.)

**Referenz**: `.claude/agents/vite-reviewer.md` (Abschnitt 3)

### Schritt 5: Audit Build-Ausgabe & Performance (25 Punkte)

Prüfung von Build-Ausgabe und Performance ausführen:

**Bewertete Kriterien**:
- Effektives Tree-Shaking (sideEffects: false, benannte Exporte, kohärente Exports-Map) (6 Pkt.)
- Abhängigkeiten für Bibliotheken externalisiert (Peer Dependencies nicht gebündelt) (6 Pkt.)
- Code-Splitting für Multi-Page-Anwendungen (manualChunks, gemeinsamer Vendor) (5 Pkt.)
- Bundle unter den Schwellenwerten, assetsInlineLimit kontrolliert (4 Pkt.)
- Asset-Hashing, angemessenes build.target, Sourcemaps in Produktion korrekt gehandhabt (4 Pkt.)

**Referenz**: `.claude/agents/vite-reviewer.md` (Abschnitt 4)

### Schritt 6: Konsolidierung und Gesamtbewertung

Gesamtpunktzahl berechnen und konsolidierten Bericht erstellen:
- [ ] Die 4 Punktzahlen summieren (30 + 20 + 25 + 25 = 100 Punkte)
- [ ] Kritische Kategorien identifizieren (<50% ihres Maximums)
- [ ] Alle kritischen bereichsübergreifenden Probleme auflisten (z. B. index.html in public/, fehlende Externalisierung von Peer Dependencies)
- [ ] Maßnahmen nach Wirkung/Aufwand priorisieren
- [ ] Endgültigen konsolidierten Bericht erstellen

**Bewertungsskala**:
- 90-100: Exzellent - Referenzprojekt
- 75-89: Sehr gut - Einige geringfügige Verbesserungen
- 60-74: Akzeptabel - Verbesserungen erforderlich
- 40-59: Unzureichend - Größeres Refactoring erforderlich
- 0-39: Kritisch - Vollständige Überarbeitung notwendig

### Schritt 7: Empfehlungen und Aktionsplan

Abschließende Empfehlungen erstellen:
- [ ] Die 3 wichtigsten priorisierten Maßnahmen über alle Kategorien hinweg identifizieren
- [ ] Aufwand (Niedrig/Mittel/Hoch) für jede Maßnahme schätzen
- [ ] Wirkung (Niedrig/Mittel/Hoch) für jede Maßnahme schätzen
- [ ] Umsetzungsreihenfolge vorschlagen
- [ ] Quick Wins vorschlagen (hohes Verhältnis von Wirkung zu Aufwand)

## AUSGABEFORMAT

```
VITE-KONFORMITÄTSAUDIT - VOLLSTÄNDIGER BERICHT
=============================================

GESAMTPUNKTZAHL: XX/100

KONFORMITÄTSNIVEAU: [Exzellent/Sehr gut/Akzeptabel/Unzureichend/Kritisch]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PUNKTZAHLEN NACH KATEGORIE:

KONFIGURATION & ARCHITEKTUR VITE : XX/30  [██████████░░░░░░░░░░] XX%
TYPESCRIPT & QUALITÄT            : XX/20  [██████████░░░░░░░░░░] XX%
TESTS                            : XX/25  [██████████░░░░░░░░░░] XX%
BUILD-AUSGABE & PERFORMANCE      : XX/25  [██████████░░░░░░░░░░] XX%

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

GESAMTSTÄRKEN:
1. [In mehreren Kategorien festgestellte Stärke]
2. [Weitere wichtige Stärke]
3. [Dritte Stärke]

GESAMTVERBESSERUNGEN:
1. [Geringfügige bereichsübergreifende Verbesserung]
2. [Weitere empfohlene Verbesserung]
3. [Dritte Verbesserung]

KRITISCHE PROBLEME:
1. [Kritisches Problem Nr. 1 - betroffene Kategorie]
2. [Kritisches Problem Nr. 2 - betroffene Kategorie]
3. [Kritisches Problem Nr. 3 - betroffene Kategorie]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

DETAILS NACH KATEGORIE:

┌─────────────────────────────────────────────┐
│ KONFIGURATION & ARCHITEKTUR VITE (XX/30)     │
└─────────────────────────────────────────────┘

Teilpunktzahlen:
  • Korrektheit von vite.config.ts   : XX/8
  • Platzierung von index.html       : XX/6
  • Konfiguration von build.lib      : XX/8
  • rollupOptions.input / Plugins    : XX/8

Stärken:
- [Architekturstärken]

Probleme:
- [Architekturprobleme]

┌─────────────────────────────────────────────┐
│ TYPESCRIPT & QUALITÄT (XX/20)                │
└─────────────────────────────────────────────┘

Teilpunktzahlen:
  • Strict Mode / moduleResolution   : XX/6
  • Vite-Typen / import.meta.env     : XX/5
  • vite-plugin-dts-Ausgabe          : XX/5
  • Typisierte Plugin-Hooks          : XX/4

Stärken:
- [Typisierungsstärken]

Probleme:
- [Typisierungsprobleme]

┌─────────────────────────────────────────────┐
│ TESTS (XX/25)                                │
└─────────────────────────────────────────────┘

Teilpunktzahlen:
  • Kohärenz der Vitest-Konfiguration : XX/6
  • Coverage >= 80%                   : XX/6
  • Passgenauigkeit der Testumgebung  : XX/4
  • Veröffentlichter Build getestet   : XX/5
  • Integration/E2E Multi-Page        : XX/4

Stärken:
- [Teststärken]

Probleme:
- [Testprobleme]

┌─────────────────────────────────────────────┐
│ BUILD-AUSGABE & PERFORMANCE (XX/25)          │
└─────────────────────────────────────────────┘

Teilpunktzahlen:
  • Effektivität des Tree-Shakings     : XX/6
  • Externalisierung von Peer Deps     : XX/6
  • Code-Splitting Multi-Page          : XX/5
  • Bundle-Schwellenwerte              : XX/4
  • Hashing / build.target / Sourcemaps : XX/4

Stärken:
- [Performance-Stärken]

Probleme:
- [Performance-Probleme]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

TOP-3-PRIORITÄTSMASSNAHMEN (ALLE KATEGORIEN):

1. KRITISCH - [Maßnahme Nr. 1]
   Kategorie : [Architektur/TypeScript/Tests/Performance]
   Wirkung   : [Hoch/Mittel/Niedrig]
   Aufwand   : [Hoch/Mittel/Niedrig]
   Priorität : SOFORT

   Detaillierte Beschreibung:
   [Erklärung des Problems und vorgeschlagene Lösung]

   Betroffene Dateien:
   - [Datei:Zeile]

   Korrekturbeispiel:
   [Code oder Korrekturbefehl]

2. WICHTIG - [Maßnahme Nr. 2]
   [Gleiches Format...]

3. EMPFOHLEN - [Maßnahme Nr. 3]
   [Gleiches Format...]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

QUICK WINS (Hohe Wirkung / Geringer Aufwand):

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

EXECUTIVE SUMMARY:

[Zusammenfassender Absatz zum Gesamtzustand des Projekts, den wichtigsten
Stärken, den wichtigsten Schwächen und der empfohlenen Entwicklungsrichtung
zur Verbesserung der Konformität. Angeben, ob das Projekt produktionsreif ist,
Korrekturen benötigt oder ein Refactoring erfordert.]

Allgemeine Empfehlung: [Produktionsreif / Geringfügige Korrekturen /
Größeres Refactoring / Überarbeitung notwendig]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## WICHTIGE HINWEISE

- Dieser Befehl orchestriert die 4 von `@vite-reviewer` abgedeckten Kategorien
- Docker für alle Analysewerkzeuge verwenden
- Konkrete Beispiele mit Datei:Zeile für jedes Problem liefern
- Maßnahmen anhand der Wirkung/Aufwand-Matrix priorisieren
- Die Platzierung von index.html und die Externalisierung von Peer Dependencies haben IMMER oberste Priorität bei Verstößen (sie zerstören den Modulgraph oder blähen das Bundle jedes Konsumenten auf)
- Automatisierbare Korrekturen vorschlagen (Skripte, Pre-Commit-Hooks)
- Der Bericht muss umsetzbar sein, nicht nur beschreibend
- Empfehlungen an den Projekttyp anpassen (Vanilla-App / Bibliothek / Multi-Page / Worker-WASM)
- Framework-spezifische Dev-Server-Integration (React/Vue/Angular/Svelte) NICHT bewerten — außerhalb des Geltungsbereichs dieses Audits
