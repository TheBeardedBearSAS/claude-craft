# Vollständiges Vite-Konformitäts-Audit

## Argumente

$ARGUMENTS (optional: Pfad zum zu analysierenden Projekt)

## Plan-Modus

> Der Plan-Modus wird automatisch aktiviert, wenn der Umfang mehrere Module umfasst oder eine modulübergreifende Untersuchung erfordert.

## MISSION

Ein vollständiges Konformitäts-Audit des Vite-Projekts durchführen, indem die 4 wesentlichen Prüfungen orchestriert werden: Architektur, Code-Qualität, Tests und Sicherheit. Einen konsolidierten Bericht mit einem Gesamtergebnis von 100 Punkten erstellen.

> **Hinweis zum Umfang**: Dieses Audit deckt ausschließlich die framework-unabhängige Nutzung von Vite ab (Vanilla-JS/TS-Anwendungen, Bibliotheksentwicklung mit `build.lib`, Multi-Page-Anwendungen, Workers/WASM-Einstiegspunkte). Die Dev-Server-Integration spezifisch für React/Vue/Angular/Svelte nicht bewerten; sie gehört zur Konformitätsprüfung des jeweiligen Stacks.

### Schritt 1: Audit-Vorbereitung

Audit-Umgebung vorbereiten:
- [ ] Zu auditierendes Projektverzeichnis identifizieren
- [ ] Vorhandensein von Konfigurationsdateien prüfen (package.json, tsconfig.json, vite.config.ts)
- [ ] Hauptverzeichnisse auflisten (src/, pages/, public/, tests/ usw.)
- [ ] Projekttyp identifizieren: Vanilla-SPA, Bibliothek (build.lib), Multi-Page-Anwendung oder Workers/WASM-Einstiegspunkte
- [ ] Vite-Version identifizieren und bestätigen, dass kein Framework-spezifisches Plugin (`@vitejs/plugin-react`, `@vitejs/plugin-vue` usw.) im Umfang liegt

**Hinweis**: Wenn $ARGUMENTS angegeben ist, diesen als Projektpfad verwenden, andernfalls das aktuelle Verzeichnis verwenden.

### Schritt 2: Architektur-Audit (25 Punkte)

Vollständige Architekturprüfung durchführen:

**Befehl**: Slash-Befehl `/vite:check architecture` verwenden oder die Schritte in `.claude/references/vite/checks/architecture.md` manuell befolgen

**Bewertete Kriterien**:
- Erkennung der Projektform und Einstiegspunkte (index.html im Root, build.lib-Entry, Multi-Page-Input, `new URL`-Muster für Worker/WASM) (6 Pkt.)
- Struktur von vite.config.ts (defineConfig, funktionale Form, Schlüsselreihenfolge) (5 Pkt.)
- Organisation eigener Plugins (vite-plugins/, Namensschema vite-plugin-*, eine Zuständigkeit pro Plugin) (4 Pkt.)
- Externalisierung von Abhängigkeiten und exports-Map in package.json (Bibliothek) (6 Pkt.)
- Ausgabestruktur (dist/ ignoriert, ES + CJS + .d.ts via vite-plugin-dts, stabile Chunk-Namen) (4 Pkt.)

**Referenz**: `.claude/references/vite/checks/architecture.md`

### Schritt 3: Code-Qualitäts-Audit (25 Punkte)

Code-Qualitätsprüfung durchführen:

**Befehl**: Slash-Befehl `/vite:check code-quality` verwenden oder die Schritte in `.claude/references/vite/checks/code-quality.md` manuell befolgen

**Bewertete Kriterien**:
- ESLint-Analyse (no-explicit-any, no-restricted-imports, no-console) (5 Pkt.)
- TypeScript-Strenge (strict, moduleResolution: "bundler", vite/client-Typen) (6 Pkt.)
- Prüfung auf Framework-Leaks (keine Kopplung an React/Vue/Angular/Svelte) (5 Pkt.)
- Code-Komplexität (Funktions-/Dateigröße, zyklomatische Komplexität, Verschachtelung) (4 Pkt.)
- Vite-spezifische Qualität (funktionale Konfiguration, ausgelagerte Plugins, nur öffentliche VITE_*-Variablen, statische Worker/WASM-Muster) (5 Pkt.)

**Referenz**: `.claude/references/vite/checks/code-quality.md`

### Schritt 4: Test-Audit (25 Punkte)

Test-Prüfung durchführen:

**Befehl**: Slash-Befehl `/vite:check testing` verwenden oder die Schritte in `.claude/references/vite/checks/testing.md` manuell befolgen

**Bewertete Kriterien**:
- Code-Abdeckung mit Vitest (>= 80 % Statements, Branches, Funktionen, Zeilen) (7 Pkt.)
- Testorganisation und -isolation (4 Pkt.)
- Tests von Vanilla-Modulen (reine Funktionen, Grenzfälle, node-Umgebung) (4 Pkt.)
- Worker-Tests (ausgelagerte Handler-Logik, Nachrichtenvertrag) (4 Pkt.)
- Tests von WASM-Wrappern (gemocktes `?init`, ein Integrationstest mit echtem .wasm) (3 Pkt.)
- Tests der Build-Ausgabe der Bibliothek auf dist/ (ESM, CJS, exports-Map) (3 Pkt.)

**Referenz**: `.claude/references/vite/checks/testing.md`

### Schritt 5: Sicherheits-Audit (25 Punkte)

Sicherheitsprüfung durchführen:

**Befehl**: Slash-Befehl `/vite:check security` verwenden oder die Schritte in `.claude/references/vite/checks/security.md` manuell befolgen

**Bewertete Kriterien**:
- Secret-Leaks über env / `define()` (VITE_*-Präfix, hartkodierte Secrets) (7 Pkt.)
- CSP-Abdeckung über alle Einstiegspunkte (Multi-Page, Durchsetzung auf Server/CDN) (5 Pkt.)
- WASM-Sandboxing (COOP/COEP, wasm-unsafe-eval, minimales Imports-Objekt) (4 Pkt.)
- Validierung von Worker-Nachrichten (Formprüfung, kein eval, Origin-Prüfung) (5 Pkt.)
- Abhängigkeitsschwachstellen (npm audit) (4 Pkt.)

**Referenz**: `.claude/references/vite/checks/security.md`

### Schritt 6: Konsolidierung und Gesamtbewertung

Gesamtergebnis berechnen und konsolidierten Bericht erstellen:
- [ ] Die 4 Bewertungen addieren (max. 100 Punkte)
- [ ] Kritische Kategorien identifizieren (< 50 %)
- [ ] Alle kritischen kategorienübergreifenden Probleme auflisten (z. B. index.html in public/, über VITE_* offengelegte Secrets, fehlende Externalisierung von Peer-Dependencies)
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

> **Bibliotheksprojekte**: `/vite:check-library-build` ergänzt dieses Audit für Bibliotheksprojekte (build.lib-Ausgabe, exports-Map, Typdeklarationen, Tree-Shaking). Zusätzlich ausführen, wenn das Projekt ein Paket veröffentlicht.

## AUSGABEFORMAT

```
VITE-KONFORMITÄTS-AUDIT - VOLLSTÄNDIGER BERICHT
=============================================

GESAMTERGEBNIS: XX/100

KONFORMITÄTSNIVEAU: [Ausgezeichnet/Sehr gut/Akzeptabel/Unzureichend/Kritisch]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ERGEBNISSE NACH KATEGORIE:

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
1. [Kleinere kategorienübergreifende Verbesserung]
2. [Weitere empfohlene Verbesserung]
3. [Dritte Verbesserung]

KRITISCHE PROBLEME:
1. [Kritisches Problem - betroffene Kategorie #1]
2. [Kritisches Problem - betroffene Kategorie #2]
3. [Kritisches Problem - betroffene Kategorie #3]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

DETAILS NACH KATEGORIE:

┌─────────────────────────────────────────────┐
│ ARCHITEKTUR (XX/25)
└─────────────────────────────────────────────┘

Teilergebnisse:
  • Erkennung der Projektform und Einstiegspunkte (index.html im Root, build.lib-Entry, Multi-Page-Input, `new URL`-Muster für Worker/WASM) : XX/6
  • Struktur von vite.config.ts (defineConfig, funktionale Form, Schlüsselreihenfolge) : XX/5
  • Organisation eigener Plugins (vite-plugins/, Namensschema vite-plugin-*, eine Zuständigkeit pro Plugin) : XX/4
  • Externalisierung von Abhängigkeiten und exports-Map in package.json (Bibliothek) : XX/6
  • Ausgabestruktur (dist/ ignoriert, ES + CJS + .d.ts via vite-plugin-dts, stabile Chunk-Namen) : XX/4

Stärken:
- [Stärken der Architektur]

Probleme:
- [Architekturprobleme]

[Ähnliche Abschnitte für Code-Qualität, Tests und Sicherheit...]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

TOP 3 PRIORITÄTSMASSNAHMEN (ALLE KATEGORIEN):

1. KRITISCH - [Maßnahme #1]
   Kategorie  : [Architecture/Code Quality/Tests/Security]
   Auswirkung: [Hoch/Mittel/Niedrig]
   Aufwand   : [Hoch/Mittel/Niedrig]
   Priorität : SOFORT

   Detaillierte Beschreibung:
   [Erklärung des Problems und der vorgeschlagenen Lösung]

   Betroffene Dateien:
   - [file:line]

   Korrekturbeispiel:
   [Code oder Korrekturbefehl]

2. WICHTIG - [Maßnahme #2]
   [Gleiches Format...]

3. EMPFOHLEN - [Maßnahme #3]
   [Gleiches Format...]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

QUICK WINS (Hohe Auswirkung / Geringer Aufwand):

- [Quick win #1] - Kategorie  : [X] - Auswirkung: [X] - Aufwand   : [X]
- [Quick win #2] - Kategorie  : [X] - Auswirkung: [X] - Aufwand   : [X]
- [Quick win #3] - Kategorie  : [X] - Auswirkung: [X] - Aufwand   : [X]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

EMPFOHLENER AKTIONSPLAN:

WOCHE 1 (Sofort):
- [ ] [Kritische Maßnahme #1]
- [ ] [Prioritärer Quick Win]

WOCHE 2-4 (Kurzfristig):
- [ ] [Wichtige Maßnahme #2]
- [ ] [Weitere Quick Wins]

MONAT 2-3 (Mittelfristig):
- [ ] [Empfohlene Maßnahme #3]
- [ ] [Schrittweise Verbesserungen]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ZUSAMMENFASSUNG FÜR DAS MANAGEMENT:

[Zusammenfassender Absatz zum Gesamtzustand des Projekts, zu den
wichtigsten Stärken und Schwächen und zur empfohlenen Vorgehensweise
zur Verbesserung der Konformität. Angeben, ob das Projekt
produktionsreif ist, Korrekturen erfordert oder ein Refactoring braucht.]

Gesamtempfehlung: [Produktionsreif / Kleinere Korrekturen /
Umfangreiches Refactoring / Überarbeitung notwendig]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## WICHTIGE HINWEISE

- Dieser Befehl orchestriert die 4 spezialisierten Audits (`/vite:check architecture`, `/vite:check code-quality`, `/vite:check testing`, `/vite:check security`)
- Docker für alle Analysetools verwenden
- Konkrete Beispiele mit datei:zeile für jedes Problem angeben
- Maßnahmen nach der Auswirkung-/Aufwand-Matrix priorisieren
- Sicherheitsprobleme haben IMMER höchste Priorität (zuerst über VITE_* oder define() offengelegte Secrets)
- Automatisierbare Korrekturen vorschlagen (Skripte, Pre-Commit-Hooks)
- Der Bericht muss handlungsorientiert sein, nicht nur beschreibend
- Empfehlungen an den Projekttyp anpassen (Vanilla-Anwendung / Bibliothek / Multi-Page / Workers-WASM)
- Die Dev-Server-Integration spezifisch für ein Framework (React/Vue/Angular/Svelte) NICHT bewerten; außerhalb des Umfangs dieses Audits
