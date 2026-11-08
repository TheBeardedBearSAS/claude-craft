# Vollständige Tauri-v2-Konformität prüfen

## Argumente

$ARGUMENTS (optional: Pfad zum zu analysierenden Projekt)

## Plan Mode

> Der Plan Mode wird automatisch aktiviert, wenn der Umfang mehrere Module umfasst oder eine modulübergreifende Untersuchung erfordert.

## MISSION

Ein vollständiges Konformitäts-Audit des Tauri-v2-Projekts durchführen, indem die 4 großen Prüfungen orchestriert werden: Architektur, Codequalität, Tests und Sicherheit. Einen konsolidierten Bericht mit einer Gesamtbewertung auf 100 Punkte erstellen.

### Schritt 1: Audit-Vorbereitung

Audit-Umgebung vorbereiten:
- [ ] Den zu prüfenden Projektpfad ermitteln
- [ ] Das Vorhandensein der Konfigurationsdateien prüfen (`src-tauri/Cargo.toml`, `src-tauri/tauri.conf.json`, `src-tauri/capabilities/*.json`, `src-tauri/build.rs`, `package.json`, Vite-Konfiguration)
- [ ] Die Hauptverzeichnisse auflisten (`src/`, `src-tauri/src/`, `src-tauri/capabilities/`, `src-tauri/icons/`, Tests, CI-Workflows)
- [ ] Die Tauri-Version (`tauri`, `tauri-build`, `@tauri-apps/api`, `@tauri-apps/cli` in den Lockfiles), die Rust-`rust-version` und die verwendeten offiziellen Plugins ermitteln
- [ ] Bestätigen, dass das Ziel Tauri v2 stable ist (Tauri 3 Alpha und Tauri v1 liegen außerhalb des Umfangs); ausschließlich Desktop- von Mobile-Zielen (iOS/Android) unterscheiden und festhalten

**Hinweis**: Wenn $ARGUMENTS angegeben ist, als Projektpfad verwenden, andernfalls das aktuelle Verzeichnis.

### Schritt 2: Architektur-Audit (25 Punkte)

Vollständige Architekturprüfung ausführen:

**Befehl**: Den Slash-Befehl `/tauri:check architecture` verwenden oder manuell den Schritten in `.claude/references/tauri/checks/architecture.md` folgen

**Bewertete Kriterien**:
- Projektlayout (`src/` / `src-tauri/`, Einstieg `lib.rs` `run()`, Mobile-Einstiegspunkt) und schlankes `main.rs` (5 Pkt.)
- Command-Design: schlanke `#[tauri::command]`-Handler, Logik in testbaren Rust-Modulen (6 Pkt.)
- Typisiertes Fehlermodell: `thiserror`-Enum, das `Serialize` implementiert (4 Pkt.)
- Zustandsverwaltung (`manage` / `State<'_, T>`) und Async-Korrektheit (kein Blockieren, Lock-Scope) (4 Pkt.)
- Events und `Channel<T>` für Streaming, Plugin-Nutzung (`.plugin(...)`, `#[cfg(desktop)]`) (4 Pkt.)
- Grenze Frontend/Kern: keine Geschäftslogik im Webview, typisiertes IPC (2 Pkt.)

**Referenz**: `.claude/references/tauri/checks/architecture.md`

### Schritt 3: Codequalitäts-Audit (25 Punkte)

Codequalitätsprüfung ausführen:

**Befehl**: Den Slash-Befehl `/tauri:check code-quality` verwenden oder manuell den Schritten in `.claude/references/tauri/checks/code-quality.md` folgen

**Bewertete Kriterien**:
- Clippy sauber mit `-D warnings` und `cargo fmt --check` (5 Pkt.)
- Rust-Namensgebung, Hygiene bei Ownership und Borrowing (Async-Commands mit geliehenen Argumenten liefern `Result`) (5 Pkt.)
- Frontend-Typisierung und Lint (`tsc --noEmit`, ESLint oder Biome) und konsistente `invoke`-Wrapper (4 Pkt.)
- Prinzipien KISS/DRY/YAGNI (4 Pkt.)
- Funktionsgröße und kognitive Komplexität (4 Pkt.)
- Fehlerbehandlung: kein `unwrap()` / `expect()` in Commands, keine stillen Fehler (3 Pkt.)

**Referenz**: `.claude/references/tauri/checks/code-quality.md`

### Schritt 4: Test-Audit (25 Punkte)

Testprüfung ausführen:

**Befehl**: Den Slash-Befehl `/tauri:check testing` verwenden oder manuell den Schritten in `.claude/references/tauri/checks/testing.md` folgen

**Bewertete Kriterien**:
- Code-Abdeckung (Ziel >= 80 %) über Rust-Kern und Frontend (7 Pkt.)
- Rust-Command-Tests ohne GUI (`tauri::test`-Mock-Runtime: `mock_builder()`, `mock_context(noop_assets())`) (6 Pkt.)
- Frontend-Tests mit `@tauri-apps/api/mocks` (`mockIPC`, `clearMocks()` in `afterEach`) (4 Pkt.)
- End-to-End-Tests (WebdriverIO + `@wdio/tauri-service` oder `tauri-driver` unter Windows/Linux) auf einem Build mit `tauri build --debug --no-bundle` (3 Pkt.)
- Testqualität: AAA, Benennung, keine Flakiness, Ausführung in der CI (3 Pkt.)
- Testisolation und Mocking von IPC und Betriebssystemzugriff (2 Pkt.)

**Referenz**: `.claude/references/tauri/checks/testing.md`

### Schritt 5: Sicherheits-Audit (25 Punkte)

Sicherheitsprüfung ausführen:

**Befehl**: Den Slash-Befehl `/tauri:check security` verwenden oder manuell den Schritten in `.claude/references/tauri/checks/security.md` folgen

**Bewertete Kriterien**:
- Capabilities und Berechtigungen: eine Capability pro Fenster/Rolle, minimale Rechte (6 Pkt.)
- Scopes: `fs`- / `http`-Allow- und Deny-Listen, keine breiten Wildcards (4 Pkt.)
- CSP (`app.security.csp`) und Isolation-Pattern (`app.security.pattern`) (5 Pkt.)
- Updater-Signierung: öffentlicher Schlüssel in der Konfiguration, privater Schlüssel nie committet, CI-Secret (4 Pkt.)
- Verwaltung von Secrets und Zugangsdaten, Schutzmaßnahmen nach OWASP Top 10:2025 (3 Pkt.)
- Schwachstellen in Abhängigkeiten und Lieferkette (`cargo deny` / `cargo audit`, `npm audit`) (2 Pkt.)
- Eingabevalidierung in Commands und Denkweise „Webview ist nicht vertrauenswürdig" (1 Pkt.)

**Referenz**: `.claude/references/tauri/checks/security.md`

### Schritt 6: Konsolidierung und Gesamtbewertung

Gesamtbewertung berechnen und konsolidierten Bericht erstellen:
- [ ] Die 4 Bewertungen summieren (max. 100 Punkte)
- [ ] Kritische Kategorien identifizieren (<50 %)
- [ ] Alle kritischen übergreifenden Probleme auflisten
- [ ] Maßnahmen nach Wirkung/Aufwand priorisieren
- [ ] Den abschließenden konsolidierten Bericht erstellen

**Bewertungsskala**:
- 90-100: Ausgezeichnet - Referenzprojekt
- 75-89: Sehr gut - Einige kleinere Verbesserungen
- 60-74: Akzeptabel - Verbesserungen erforderlich
- 40-59: Unzureichend - Umfassendes Refactoring erforderlich
- 0-39: Kritisch - Vollständige Überarbeitung notwendig

### Schritt 7: Empfehlungen und Aktionsplan

Abschließende Empfehlungen erstellen:
- [ ] Die Top-3-Prioritätsmaßnahmen über alle Kategorien hinweg identifizieren
- [ ] Aufwand (Niedrig/Mittel/Hoch) für jede Maßnahme schätzen
- [ ] Wirkung (Niedrig/Mittel/Hoch) für jede Maßnahme schätzen
- [ ] Umsetzungsreihenfolge vorschlagen
- [ ] Quick Wins vorschlagen (hohes Wirkung/Aufwand-Verhältnis)

## AUSGABEFORMAT

```
TAURI V2 KONFORMITÄTS-AUDIT - VOLLSTÄNDIGER BERICHT
====================================================

GESAMTBEWERTUNG: XX/100

KONFORMITÄTSNIVEAU: [Ausgezeichnet/Sehr gut/Akzeptabel/Unzureichend/Kritisch]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

BEWERTUNG NACH KATEGORIE:

ARCHITEKTUR        : XX/25  [██████████░░░░░░░░░░] XX%
CODEQUALITÄT       : XX/25  [██████████░░░░░░░░░░] XX%
TESTS              : XX/25  [██████████░░░░░░░░░░] XX%
SICHERHEIT         : XX/25  [██████████░░░░░░░░░░] XX%

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

GESAMTE STÄRKEN:
1. [In mehreren Kategorien festgestellte Stärke]
2. [Weitere wesentliche Stärke]
3. [Dritte Stärke]

GESAMTE VERBESSERUNGEN:
1. [Kleinere übergreifende Verbesserung]
2. [Weitere empfohlene Verbesserung]
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

Teilbewertungen:
  • Layout / Einstiegspunkte       : XX/5
  • Command-Design                 : XX/6
  • Typisierte Fehler              : XX/4
  • Zustand und Async              : XX/4
  • Events, Channels, Plugins      : XX/4
  • Grenze Frontend / Kern         : XX/2

Stärken:
- [Stärken der Architektur]

Probleme:
- [Probleme der Architektur]

[Ähnliche Abschnitte für Codequalität, Tests und Sicherheit...]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

TOP 3 PRIORITÄTSMASSNAHMEN (ALLE KATEGORIEN):

1. KRITISCH - [Maßnahme #1]
   Kategorie : [Architektur/Qualität/Tests/Sicherheit]
   Wirkung   : [Hoch/Mittel/Niedrig]
   Aufwand   : [Hoch/Mittel/Niedrig]
   Priorität : SOFORT

   Detaillierte Beschreibung:
   [Erklärung des Problems und vorgeschlagene Lösung]

   Betroffene Dateien:
   - [Datei:Zeile]

   Korrekturbeispiel:
   [Code oder Korrekturbefehl]

2. WICHTIG - [Maßnahme #2]
   [Gleiches Format...]

3. EMPFOHLEN - [Maßnahme #3]
   [Gleiches Format...]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

QUICK WINS (hohe Wirkung / geringer Aufwand):

- [Quick Win #1] - Kategorie: [X] - Wirkung: [X] - Aufwand: [X]
- [Quick Win #2] - Kategorie: [X] - Wirkung: [X] - Aufwand: [X]
- [Quick Win #3] - Kategorie: [X] - Wirkung: [X] - Aufwand: [X]

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

MANAGEMENT-ZUSAMMENFASSUNG:

[Zusammenfassender Absatz zum Gesamtzustand des Projekts, den
wesentlichen Stärken, den wesentlichen Schwächen und der empfohlenen
Richtung zur Verbesserung der Konformität. Angeben, ob das Projekt
produktionsreif ist, Korrekturen benötigt oder ein Refactoring
erfordert.]

Allgemeine Empfehlung: [Produktionsreif / Kleinere Korrekturen /
Umfassendes Refactoring / Vollständige Überarbeitung notwendig]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## WICHTIGE HINWEISE

- Dieser Befehl orchestriert die 4 spezialisierten Audits
- Docker für alle Analysewerkzeuge verwenden (`docker compose exec app ...`); GUI-Builds erfordern möglicherweise die CI
- Für jedes Problem konkrete Beispiele mit Datei:Zeile liefern
- Maßnahmen anhand der Wirkung/Aufwand-Matrix priorisieren
- Sicherheitsprobleme haben IMMER höchste Priorität
- Automatisierbare Korrekturen vorschlagen (Skripte, Pre-Commit-Hooks, CI-Schritte)
- Der Bericht muss umsetzbar sein, nicht nur beschreibend
- Empfehlungen an den fachlichen Kontext des Projekts anpassen
- Pragmatismus zuerst: eine kleine App nicht für ein einzelnes `lib.rs` mit Modulen bestrafen, solange die Verantwortlichkeiten getrennt sind
- Außerhalb des Umfangs: UI-Framework-Code (siehe die Stacks React / Vue / Svelte / Vite) und allgemeine Rust-Regeln (siehe den Stack `rust`)
