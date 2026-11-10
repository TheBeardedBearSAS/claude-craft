# Vollständige WordPress-Konformität prüfen

## Argumente

$ARGUMENTS (optional: Pfad zum zu analysierenden Plugin/Theme)

## Plan Mode

> Der Plan Mode wird automatisch aktiviert, wenn der Umfang mehrere Module umfasst oder eine modulübergreifende Untersuchung erfordert.

## MISSION

Ein vollständiges Konformitäts-Audit des WordPress-Plugins oder -Themes durchführen, indem die 4 großen Prüfungen orchestriert werden: Architektur, Codequalität, Tests und Sicherheit. Einen konsolidierten Bericht mit einer Gesamtbewertung auf 100 Punkte erstellen.

### Schritt 1: Audit-Vorbereitung

Audit-Umgebung vorbereiten:
- [ ] Den zu prüfenden Projektpfad ermitteln
- [ ] Das Vorhandensein der Schlüsseldateien prüfen (Plugin-Header-Datei oder `style.css`/`theme.json`, `composer.json`, `package.json`, `.wp-env.json`, `phpcs.xml*`, `phpstan.neon*`, `uninstall.php`, `block.json`-Dateien)
- [ ] Die Hauptverzeichnisse auflisten (`src/` oder `includes/`, `blocks/`, `languages/`, `tests/`, CI-Workflows)
- [ ] Die deklarierten Angaben `Requires at least`, `Requires PHP`, `Requires Plugins` sowie die Tooling-Versionen in den Lockfiles ermitteln
- [ ] Den Typ bestimmen: Plugin, klassisches Theme, Block-Theme oder gemischt; festhalten, ob das Projekt von WooCommerce abhängt

**Hinweis**: Wenn $ARGUMENTS angegeben ist, als Projektpfad verwenden, andernfalls das aktuelle Verzeichnis.

### Schritt 2: Architektur-Audit (25 Punkte)

**Befehl**: Den Slash-Befehl `/wordpress:check architecture` verwenden oder manuell den Schritten in `.claude/references/wordpress/checks/architecture.md` folgen

**Bewertete Kriterien**:
- Plugin-Header, Bootstrap-Datei, ABSPATH-Guard, Composer-Autoload (5 Pkt.)
- Präfixe und Namespaces für Funktionen, Klassen, Optionen, Hooks, Handles (5 Pkt.)
- Organisation der Hooks und schlanke Callbacks (5 Pkt.)
- Blocks (`block.json` apiVersion 3, `render.php`) und Struktur von Block-Themes (`theme.json`, Templates, Parts) (5 Pkt.)
- REST-Design und Lebenszyklus (Aktivierung, Deaktivierung, Deinstallation) (5 Pkt.)

**Referenz**: `.claude/references/wordpress/checks/architecture.md`

### Schritt 3: Codequalitäts-Audit (25 Punkte)

**Befehl**: Den Slash-Befehl `/wordpress:check code-quality` verwenden oder manuell den Schritten in `.claude/references/wordpress/checks/code-quality.md` folgen

**Bewertete Kriterien**:
- WPCS (PHPCS) bestanden (7 Pkt.)
- i18n: Text Domain, Übersetzerkommentare, JS-Übersetzungen (5 Pkt.)
- PHPStan (phpstan-wordpress) und ESLint (`@wordpress/eslint-plugin`) (5 Pkt.)
- Prinzipien KISS/DRY/YAGNI (4 Pkt.)
- Funktionsgröße und kognitive Komplexität (4 Pkt.)

**Referenz**: `.claude/references/wordpress/checks/code-quality.md`

### Schritt 4: Test-Audit (25 Punkte)

**Befehl**: Den Slash-Befehl `/wordpress:check testing` verwenden oder manuell den Schritten in `.claude/references/wordpress/checks/testing.md` folgen

**Bewertete Kriterien**:
- Code-Abdeckung (Ziel >= 80 %) über PHP und JS (7 Pkt.)
- PHPUnit mit `WP_UnitTestCase` über wp-env, `yoast/phpunit-polyfills` (6 Pkt.)
- Jest über `@wordpress/scripts` für Blocks und JS (4 Pkt.)
- Playwright-End-to-End-Tests mit `@wordpress/e2e-test-utils-playwright` (3 Pkt.)
- Testqualität: AAA, Benennung, keine Flakiness, Ausführung in der CI (3 Pkt.)
- Testisolation und Einsatz von Factories (2 Pkt.)

**Referenz**: `.claude/references/wordpress/checks/testing.md`

### Schritt 5: Sicherheits-Audit (25 Punkte)

**Befehl**: Den Slash-Befehl `/wordpress:check security` verwenden oder manuell den Schritten in `.claude/references/wordpress/checks/security.md` folgen

**Bewertete Kriterien**:
- Capability-Prüfungen und Nonces bei jeder Zustandsänderung (6 Pkt.)
- REST-`permission_callback` und Argumentvalidierung (5 Pkt.)
- Escaping der Ausgabe (`esc_*`, `wp_kses_post`) (5 Pkt.)
- Bereinigung der Eingaben (Sanitization) und `$wpdb->prepare()` (4 Pkt.)
- Verwaltung von Secrets und Zugangsdaten, Schutzmaßnahmen nach OWASP Top 10:2025 (3 Pkt.)
- Schwachstellen in Abhängigkeiten und Lieferkette (`composer audit`, `npm audit`) (2 Pkt.)

**Referenz**: `.claude/references/wordpress/checks/security.md`

### Schritt 6: WooCommerce (nur wenn das Projekt davon abhängt)

`.claude/skills/woocommerce/checklist.md` anwenden: HPOS-Kompatibilität deklariert, `wc_get_order()` / CRUD-Objekte statt Post-Meta, Kompatibilität mit `cart_checkout_blocks`. Die Befunde in die Bewertungen für Architektur und Sicherheit einfließen lassen; diesen Schritt für Projekte ohne WooCommerce vollständig überspringen.

### Schritt 7: Konsolidierung und Gesamtbewertung

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

### Schritt 8: Empfehlungen und Aktionsplan

- [ ] Die Top-3-Prioritätsmaßnahmen über alle Kategorien hinweg identifizieren
- [ ] Aufwand und Wirkung (Niedrig/Mittel/Hoch) für jede Maßnahme schätzen
- [ ] Umsetzungsreihenfolge vorschlagen
- [ ] Quick Wins vorschlagen (hohes Wirkung/Aufwand-Verhältnis)

## AUSGABEFORMAT

```
WORDPRESS KONFORMITÄTS-AUDIT - VOLLSTÄNDIGER BERICHT
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
  • Header / Bootstrap / Autoload  : XX/5
  • Präfixe / Namespaces           : XX/5
  • Organisation der Hooks         : XX/5
  • Blocks / Theme-Struktur        : XX/5
  • REST / Lebenszyklus            : XX/5

Stärken:
- [Stärken der Architektur]

Probleme:
- [Probleme der Architektur]

[Ähnliche Abschnitte für Codequalität, Tests und Sicherheit...]

WOOCOMMERCE (falls zutreffend): [Befunde zu HPOS / CRUD / Checkout-Blocks]

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

ZUSAMMENFASSUNG FÜR DIE MANAGEMENT-EBENE:

[Zusammenfassender Absatz zum Gesamtzustand des Projekts, zu den
wesentlichen Stärken, den wesentlichen Schwächen und zur empfohlenen
Entwicklungsrichtung. Angeben, ob das Projekt produktionsreif ist,
Korrekturen benötigt oder ein Refactoring erfordert.]

Allgemeine Empfehlung: [Produktionsreif / Kleinere Korrekturen /
Umfassendes Refactoring / Vollständige Überarbeitung notwendig]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## WICHTIGE HINWEISE

- Dieser Befehl orchestriert die 4 spezialisierten Audits
- Docker für alle Analysewerkzeuge verwenden (`docker compose exec app ...` oder `npx wp-env run ...`)
- Für jedes Problem konkrete Beispiele mit Datei:Zeile liefern
- Maßnahmen anhand der Wirkung/Aufwand-Matrix priorisieren
- Sicherheitsprobleme haben IMMER höchste Priorität
- Automatisierbare Korrekturen vorschlagen (Skripte, Pre-Commit-Hooks, CI-Schritte)
- Der Bericht muss umsetzbar sein, nicht nur beschreibend
- Pragmatismus zuerst: ein kleines Plugin aus einer einzigen Datei nicht für fehlende Schichten bestrafen, solange die Verantwortlichkeiten getrennt sind
- Außerhalb des Umfangs: allgemeine PHP-Regeln (siehe den Stack `php`), Hosting und Bedrock-artige Deployments, WordPress-Core-Entwicklung
