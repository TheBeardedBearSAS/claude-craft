---
description: PHP Code-Qualitätsanalyse
argument-hint: [argumente]
---

# PHP Code-Qualitätsanalyse

## Argumente

$ARGUMENTS (optional: Pfad zum zu analysierenden PHP-Projekt, standardmäßig aktuelles Verzeichnis)

## Plan-Modus

> Der Plan-Modus wird automatisch aktiviert, wenn der Umfang mehrere Module umfasst oder eine modulübergreifende Untersuchung erfordert.

## MISSION

Analysieren Sie die Code-Qualität eines nativen PHP-Projekts. Kombinieren Sie statische Analyse (PHPStan), Stil-Prüfungen (PSR-12), Modernisierungshinweise (Rector) und Komplexitätsmetriken. Erstellen Sie einen umsetzbaren Report mit einer Bewertung von 25 Punkten.

**Referenzregeln**: `.claude/rules/php-coding-standards.md`, `.claude/rules/php-quality-tools.md`

### Schritt 1: Tooling-Inventar

- [ ] `composer.json` Dev-Dependencies lesen
- [ ] Nach PHPStan suchen (`phpstan.neon` / `phpstan.neon.dist`)
- [ ] Nach PHP-CS-Fixer suchen (`.php-cs-fixer.dist.php`) oder PHP_CodeSniffer (`phpcs.xml`)
- [ ] Nach Rector suchen (`rector.php`)
- [ ] Nach Psalm suchen (optional) (`psalm.xml`)

**Erwarteter Stack (2026)**:
- PHPStan Level 10 (oder Psalm Level 1)
- PHP-CS-Fixer mit PSR-12 + `@PHP85Migration` Regeln
- Rector mit `LevelSetList::UP_TO_PHP_85`

### Schritt 2: PSR-12 Konformität (5 Pkt.)

```bash
docker compose exec app vendor/bin/php-cs-fixer fix --dry-run --diff --verbose
```

Prüfen:
- [ ] 0 Stilverletzungen
- [ ] `declare(strict_types=1);` in jeder Datei
- [ ] 4-Leerzeichen-Einrückung, LF-Zeilenenden
- [ ] Klassen-/Methoden-/Property-Sichtbarkeit immer explizit

### Schritt 3: Statische Analyse — PHPStan (5 Pkt.)

```bash
docker compose exec app vendor/bin/phpstan analyse --level=max
```

Prüfen:
- [ ] Level 10 (oder max) besteht mit 0 Fehlern
- [ ] Kein `@phpstan-ignore` ohne Begründungskommentar
- [ ] Generics korrekt typisiert (`@template`, `@param T`, `@return T`)
- [ ] Keine `mixed` Return-Types in öffentlichen APIs

### Schritt 4: Typsicherheit (4 Pkt.)

- [ ] 100% der Parameter typisiert
- [ ] 100% der Return-Types deklariert
- [ ] Property-Types deklariert (PHP 7.4+)
- [ ] Readonly Properties verwendet, wo Mutation verboten ist (PHP 8.1+)
- [ ] Property Hooks für berechnete Properties verwendet (PHP 8.4+)
- [ ] Asymmetric Visibility verwendet, wo relevant (PHP 8.4+)

### Schritt 5: KISS / DRY / YAGNI (4 Pkt.)

- [ ] Kognitive Komplexität < 7 pro Methode (Ziel), < 10 max
- [ ] Methoden < 20 Zeilen
- [ ] Zyklomatische Komplexität < 10
- [ ] Kein toter Code (überprüfen mit `vimeo/psalm --find-dead-code` oder `rector`)
- [ ] DRY: Business-Regeln an einer Stelle (Value Objects für Validierung)
- [ ] YAGNI: keine spekulative Abstraktion — Regel der 3 vor Extraktion

**Erkennungsbefehl**:

```bash
docker compose exec app vendor/bin/phpmetrics --report-cli src/
```

### Schritt 6: Namensgebung & Dokumentation (4 Pkt.)

- [ ] Klassennamen in `PascalCase`, Methoden in `camelCase`, Konstanten `UPPER_SNAKE_CASE`
- [ ] Namen sind explizit (kein `getData`, `process`, `manager` ohne Kontext)
- [ ] PHPDoc auf öffentlichen APIs nur mit komplexen Generics (Types bereits in Signatur)
- [ ] Keine verwaisten Kommentare, die WAS beschreiben (nur WARUM erklären)

### Schritt 7: Fehlerbehandlung (3 Pkt.)

- [ ] Exceptions Domain-spezifisch, nicht generisch `\Exception`
- [ ] Keine unterdrückten Fehler (`@`-Operator verboten)
- [ ] Null-Safety: `Option`/`Maybe`-Types bevorzugen oder explizit nullable + Early Return
- [ ] Exceptions niemals gefangen, um stillschweigend ignoriert zu werden

## OUTPUT-FORMAT

```
PHP CODE-QUALITÄT AUDIT
========================

SCORE: XX/25

PSR-12 (X/5)
  php-cs-fixer Verletzungen: N
  Kritische Probleme:
  - [datei:zeile] beschreibung

PHPSTAN (X/5)
  Erreichtes Level: N/10
  Verbleibende Fehler: N
  Top-Blocker:
  - [datei:zeile] beschreibung

TYPSICHERHEIT (X/4)
  Nicht-typisierte Parameter: N
  Nicht-typisierte Returns: N
  Fehlende Property-Types: N

KISS / DRY / YAGNI (X/4)
  Hochkomplexe Methoden (>10): N
  Duplizierte Blöcke: N
  Toter Code: N

NAMENSGEBUNG & DOCS (X/4)
  Nicht-explizite Namen: N
  Veraltete PHPDoc: N

FEHLERBEHANDLUNG (X/3)
  Verwendung von @: N
  Generisches \Exception geworfen: N

TOP 3 QUICK WINS:
1. `vendor/bin/php-cs-fixer fix` ausführen — 0 Aufwand, behebt N Verletzungen
2. [...]
3. [...]

TOP 3 LANGFRISTIGE AKTIONEN:
1. PHPStan Level max erreichen — aufteilen über 3 Sprints
2. [...]
3. [...]
```

## WICHTIGE HINWEISE

- Immer Docker verwenden (`docker compose exec app ...`)
- PHPStan-Levels niemals ohne Begründung im Commit-Message senken
- Rector für Bulk-Modernisierung bevorzugen (PHP 8.5 Migration Sets)
- Coverage 100% ohne Mutation Testing ist ein falsches Sicherheitsgefühl — Mutation Score melden, wenn Infection konfiguriert ist
