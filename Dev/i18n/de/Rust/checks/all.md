# Vollständige Rust-/Axum-Konformität prüfen

## Argumente

$ARGUMENTS (optional: Pfad des zu analysierenden Projekts)

## Plan Mode

> Der Plan Mode wird automatisch aktiviert, wenn der Umfang mehrere Module umfasst oder eine übergreifende Untersuchung erfordert.

## MISSION

Ein vollständiges Konformitäts-Audit des Rust-/Axum-Projekts durchführen, indem die 4 großen Prüfungen orchestriert werden: Architektur, Codequalität, Tests und Sicherheit. Einen konsolidierten Bericht mit einer Gesamtbewertung auf 100 Punkte erstellen.

### Schritt 1: Audit-Vorbereitung

Audit-Umgebung vorbereiten:
- [ ] Pfad des zu prüfenden Projekts bestimmen
- [ ] Vorhandensein der Konfigurationsdateien prüfen (Cargo.toml, Cargo.lock, rust-toolchain.toml, rustfmt.toml, clippy.toml oder `[lints]`-Tabellen, deny.toml, `.sqlx/`)
- [ ] Hauptverzeichnisse auflisten (crates/ oder src/, migrations/, tests/, benches/)
- [ ] Rust-Toolchain (`rust-toolchain.toml`), Edition (`edition = "2024"`) und die Versionen von axum / tokio / sqlx (`Cargo.lock`) bestimmen

**Hinweis**: Wenn $ARGUMENTS angegeben ist, als Projektpfad verwenden, andernfalls das aktuelle Verzeichnis.

### Schritt 2: Architektur-Audit (25 Punkte)

Vollständige Architekturprüfung ausführen:

**Befehl**: Slash-Befehl `/rust:check architecture` verwenden oder manuell den Schritten in `.claude/references/rust/checks/architecture.md` folgen

**Bewertete Kriterien**:
- Workspace-Layout und Crate-Grenzen (domain frei von axum/sqlx) (6 Pkt.)
- Dünne Handler, Anwendungsfälle in der Application-Schicht (6 Pkt.)
- Router, State (`Arc<AppState>` / `FromRef`) und Extractors (4 Pkt.)
- Fehlermodell: `thiserror` in Bibliotheken, `AppError: IntoResponse`, problem+json (4 Pkt.)
- Tower-Middleware, Tracing und Graceful Shutdown (3 Pkt.)
- Abhängigkeitsrichtung und Persistenz-Adapter (SQLx) (2 Pkt.)

**Referenz**: `.claude/references/rust/checks/architecture.md`

### Schritt 3: Codequalitäts-Audit (25 Punkte)

Codequalitätsprüfung ausführen:

**Befehl**: Slash-Befehl `/rust:check code-quality` verwenden oder manuell den Schritten in `.claude/references/rust/checks/code-quality.md` folgen

**Bewertete Kriterien**:
- Clippy sauber mit `-D warnings` und Workspace-Lints (5 Pkt.)
- rustfmt, Namensgebung nach den Rust API Guidelines, `#![forbid(unsafe_code)]` (5 Pkt.)
- Hygiene bei Ownership und Borrowing, keine überflüssigen Clones, rustdoc (4 Pkt.)
- Prinzipien KISS/DRY/YAGNI (4 Pkt.)
- Funktionsgröße und kognitive Komplexität (4 Pkt.)
- Fehlerbehandlung: kein `unwrap()` / `expect()` auf Request-Pfaden (3 Pkt.)

**Referenz**: `.claude/references/rust/checks/code-quality.md`

### Schritt 4: Test-Audit (25 Punkte)

Testprüfung ausführen:

**Befehl**: Slash-Befehl `/rust:check testing` verwenden oder manuell den Schritten in `.claude/references/rust/checks/testing.md` folgen

**Bewertete Kriterien**:
- Codeabdeckung (cargo-llvm-cov, Ziel >= 80 %) (7 Pkt.)
- Unit-Tests im Modul für Domäne und Anwendungsfälle (6 Pkt.)
- Integrationstests: Router mit `oneshot`, `#[sqlx::test]` (4 Pkt.)
- Testqualität: AAA, Benennung, nextest, keine Flakiness (3 Pkt.)
- Property-, Snapshot- und Mutation-Testing (proptest, insta, cargo-mutants) (3 Pkt.)
- Testisolation und Mocking der Ports (2 Pkt.)

**Referenz**: `.claude/references/rust/checks/testing.md`

### Schritt 5: Sicherheits-Audit (25 Punkte)

Sicherheitsprüfung ausführen:

**Befehl**: Slash-Befehl `/rust:check security` verwenden oder manuell den Schritten in `.claude/references/rust/checks/security.md` folgen

**Bewertete Kriterien**:
- Schutzmaßnahmen gemäß OWASP Top 10:2025 (6 Pkt.)
- Verwaltung von Secrets und Zugangsdaten (`secrecy`, Umgebung, Vault) (5 Pkt.)
- Eingabevalidierung (validator / garde), Body-Limits, Ausgabe-Kodierung (4 Pkt.)
- Schwachstellen in Abhängigkeiten und Lieferkette (cargo-deny, cargo-audit, cargo-vet) (4 Pkt.)
- Authentifizierung, Autorisierung und Rate Limiting (Argon2id, JWT EdDSA, tower_governor) (3 Pkt.)
- Sichere Konfiguration (Security-Header, Cookies, CORS, TLS) (2 Pkt.)
- Schutz vor SQL-Injection (SQLx-Bind-Parameter) (1 Pkt.)

**Referenz**: `.claude/references/rust/checks/security.md`

### Schritt 6: Konsolidierung und Gesamtbewertung

Gesamtbewertung berechnen und konsolidierten Bericht erstellen:
- [ ] Die 4 Bewertungen summieren (max. 100 Punkte)
- [ ] Kritische Kategorien identifizieren (<50 %)
- [ ] Alle kritischen übergreifenden Probleme auflisten
- [ ] Maßnahmen nach Wirkung/Aufwand priorisieren
- [ ] Abschließenden konsolidierten Bericht erstellen

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
RUST / AXUM KONFORMITÄTS-AUDIT - VOLLSTÄNDIGER BERICHT
=====================================================

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
1. [Kritisches Problem #1 - betroffene Kategorie]
2. [Kritisches Problem #2 - betroffene Kategorie]
3. [Kritisches Problem #3 - betroffene Kategorie]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

DETAILS NACH KATEGORIE:

┌─────────────────────────────────────────────┐
│ ARCHITEKTUR (XX/25)                         │
└─────────────────────────────────────────────┘

Teilbewertungen:
  • Workspace / Crate-Grenzen      : XX/6
  • Dünne Handler / Anwendungsfälle: XX/6
  • Router, State, Extractors      : XX/4
  • Fehlermodell / problem+json    : XX/4
  • Middleware, Tracing, Shutdown  : XX/3
  • Abhängigkeiten und Adapter     : XX/2

Stärken:
- [Architektur-Stärken]

Probleme:
- [Architektur-Probleme]

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

QUICK WINS (Hohe Wirkung / Geringer Aufwand):

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

ZUSAMMENFASSUNG FÜR DAS MANAGEMENT:

[Zusammenfassender Absatz zum Gesamtzustand des Projekts, den
wesentlichen Stärken, den wesentlichen Schwächen und der
empfohlenen Entwicklung zur Verbesserung der Konformität.
Angeben, ob das Projekt produktionsreif ist, Korrekturen
benötigt oder refaktoriert werden muss.]

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
- Automatisierbare Korrekturen vorschlagen (Skripte, Pre-Commit-Hooks, CI-Schritte)
- Der Bericht muss umsetzbar sein, nicht nur beschreibend
- Empfehlungen an den fachlichen Kontext des Projekts anpassen
- Pragmatismus zuerst: einen kleinen Service nicht dafür bestrafen, dass er ein einzelnes Crate mit Modulen ist, solange die Grenzen eingehalten werden
