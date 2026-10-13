# Checkliste: Vor jedem Commit

> **Pflicht vor git commit** - Code-Qualität sicherstellen
> Referenz: `.claude/rules/04-testing-tdd.md`, `.claude/rules/03-coding-standards.md`

## Schnellbefehl

```bash
# Alles in einem Befehl validieren
make quality && make test

# Oder wenn Makefile nicht verfügbar:
composer phpstan && composer cs-fix && docker compose exec php bin/phpunit
```

---

## 1. Automatisierte Tests

### ✅ Alle Tests bestehen

```bash
# Unit-Tests
make test-unit
# oder: docker compose exec php bin/phpunit --testsuite=unit

# Integrationstests
make test-integration
# oder: docker compose exec php bin/phpunit --testsuite=integration

# Behat-Tests (BDD)
make test-behat
# oder: docker compose exec php vendor/bin/behat

# ALLE Tests
make test
```

**Erfolgskriterium:**
- ✅ Alle Tests bestehen (0 fehlgeschlagen)
- ✅ Keine übersprungenen Tests (außer aus gutem Grund)
- ✅ Keine Warnungen

**Bei Fehler:**
- ❌ NICHT committen
- 🔧 Tests oder Code korrigieren
- 🔁 Tests erneut ausführen

---

## 2. Statische Analyse (PHPStan)

### ✅ PHPStan Level 8 ohne Fehler

```bash
make phpstan
# oder: docker compose exec php vendor/bin/phpstan analyse
```

**Erfolgskriterium:**
- ✅ 0 PHPStan-Fehler auf Level 8
- ✅ Überall korrekte Typen
- ✅ Kein toter Code erkannt

**Häufige Fehler zum Prüfen:**
```php
// ❌ Fehlender Typ
public function calculate($amount) { }

// ✅ Expliziter Typ
public function calculate(Money $amount): Money { }

// ❌ Array ohne Typ
/** @var array */
private $items;

// ✅ Typisiertes Array
/** @var array<int, Participant> */
private array $participants;
```

**Bei Fehler:**
- 🔧 Fehlende Typen hinzufügen
- 🔧 Typ-Inkonsistenzen korrigieren
- 📖 Referenz: `.claude/rules/03-coding-standards.md`

---

## 3. Coding Standards (PHP CS Fixer)

### ✅ Code nach PER-CS 3.0 formatiert

```bash
make cs-fix
# oder: docker compose exec php vendor/bin/php-cs-fixer fix
```

**Erfolgskriterium:**
- ✅ Code automatisch formatiert
- ✅ PER-CS 3.0 eingehalten
- ✅ Keine Trailing Whitespace
- ✅ Konsistente Einrückung (4 Leerzeichen)

**Automatische Prüfungen:**
- Strikte Typ-Deklaration (`declare(strict_types=1);`)
- Imports alphabetisch sortiert
- Leerzeile vor `return`
- Keine unnötigen `else`
- `final` auf allen Klassen

**Bei Fehler:**
- ✅ Fixer korrigiert automatisch
- ✅ Änderungen mit `git diff` prüfen
- ✅ Stil-Korrekturen committen

---

## 4. Docker (Hadolint)

### ✅ Dockerfile gültig (wenn geändert)

```bash
make hadolint
# oder: docker run --rm -i hadolint/hadolint < Dockerfile
```

**Erfolgskriterium:**
- ✅ Keine Hadolint-Fehler
- ✅ Docker-Best-Practices eingehalten
- ✅ Images mit fester Version (nicht `:latest`)

**Wichtige Prüfungen:**
```dockerfile
# ❌ Version nicht festgelegt
FROM php:fpm

# ✅ Explizite Version
FROM php:8.2-fpm-alpine

# ❌ apt-get ohne Cleanup
RUN apt-get install -y curl

# ✅ Cleanup im selben Layer
RUN apt-get update && apt-get install -y curl \
    && rm -rf /var/lib/apt/lists/*
```

**Bei Fehler:**
- 🔧 Dockerfile korrigieren
- 📖 Referenz: `.claude/rules/03-coding-standards.md` (Docker-Abschnitt)

---

## 5. Test-Coverage

### ✅ Mindestens 80% Coverage

```bash
make test-coverage
# oder: docker compose exec php bin/phpunit --coverage-html build/coverage

# Bericht öffnen
open build/coverage/index.html
```

**Erfolgskriterium:**
- ✅ Globale Coverage ≥ 80%
- ✅ Neue Klassen/Methoden getestet
- ✅ Hauptzweige abgedeckt

**Wenn Coverage < 80%:**
- ⚠️ Akzeptabel wenn:
  - Legacy-Code nicht berührt
  - Einfache Getter/Setter
  - Konfiguration/Bootstrap
- ❌ Nicht akzeptabel wenn:
  - Neue Geschäftslogik nicht getestet
  - Neue öffentliche Methoden nicht getestet

**Maßnahmen:**
- 🔧 Fehlende Unit-Tests hinzufügen
- 🔧 Integrationstests hinzufügen falls nötig
- 📖 Referenz: `.claude/rules/04-testing-tdd.md`

---

## 6. Commit-Nachricht (Conventional Commits)

### ✅ Nachricht konform zur Konvention

```bash
# Format:
<type>(<scope>): <description>

[optionaler Body]

[optionaler Footer]
```

**Erlaubte Typen:**
- `feat`: Neue Funktion
- `fix`: Fehlerbehebung
- `refactor`: Refactoring (keine funktionale Änderung)
- `test`: Hinzufügen/Ändern von Tests
- `docs`: Nur Dokumentation
- `style`: Formatierung (keine Code-Änderung)
- `perf`: Performance-Verbesserung
- `chore`: Technische Aufgaben (Deps, Config, etc.)

**GÜLTIGE Beispiele:**

```bash
feat(reservation): füge Einzelzimmerzuschlag für 1 Teilnehmer hinzu

Implementiert Geschäftsregel von +30% auf Preis bei nur einem Teilnehmer.

Closes #42
```

```bash
fix(participant): korrigiere Validierung Mindestalter

Hinzufügung der Prüfung, dass Teilnehmer volljährig ist (≥18 Jahre).

BREAKING CHANGE: Minderjährige Teilnehmer werden nicht mehr akzeptiert.
```

```bash
test(reservation): füge Tests für Gesamtpreisberechnung hinzu

Deckt folgende Fälle ab:
- 1 Teilnehmer (mit Zuschlag)
- 2+ Teilnehmer (ohne Zuschlag)
- Mit kostenpflichtigen Optionen
```

```bash
refactor(value-object): extrahiere Money in ein VO

Ersetzt int/float durch Money-Objekt, um Berechnungsfehler
bei Beträgen zu vermeiden.
```

**UNGÜLTIGE Beispiele:**

```bash
❌ "update code"  (zu vage)
❌ "fix bug"      (welcher Bug?)
❌ "WIP"          (kein WIP committen)
❌ "mise à jour"  (auf Französisch, Typ fehlt)
```

**Regeln:**
- Beschreibung auf Deutsch (Code auf Englisch)
- Imperativ Präsens ("füge hinzu" nicht "hinzugefügt")
- Erster Buchstabe klein
- Kein Punkt am Ende
- Max. 72 Zeichen für erste Zeile
- Detaillierter Body falls nötig (nach Leerzeile)

**Wenn nicht konform:**
- 🔧 Nachricht neu formulieren
- 📖 Referenz: https://www.conventionalcommits.org/

---

## 7. Dokumentation (falls zutreffend)

### ✅ Dokumentation aktualisiert

**Prüfen ob nötig:**
- [ ] README.md aktualisiert (neue Funktion, API-Änderung)
- [ ] PHPDoc vollständig für öffentliche Methoden
- [ ] ADR (Architecture Decision Record) bei wichtiger Entscheidung
- [ ] CHANGELOG.md aktualisiert (bei Versionierung)

**Beispiele die Dokumentation benötigen:**
- Neue API-Route
- Neuer CLI-Befehl
- Config-Änderung (Env Vars, services.yaml)
- Breaking Change

**Wenn Dokumentation fehlt:**
- 🔧 Notwendige Dokumentation hinzufügen
- 📖 Referenz: `.claude/rules/03-coding-standards.md`

---

## 8. Sicherheit & DSGVO (bei personenbezogenen Daten)

### ✅ Sicherheits-/DSGVO-Konformität

**Wenn Commit personenbezogene Daten berührt:**
- [ ] Daten in DB verschlüsselt (`doctrine-encrypt-bundle`)
- [ ] Strikte Validierung der Inputs
- [ ] Keine sensiblen Daten in Logs
- [ ] DSGVO-Einwilligung bei neuer Erfassung
- [ ] Keine Secrets im Klartext (`.env`, nicht committen)

**Prüfung:**
```bash
# Nach potentiellen Secrets suchen
git diff --cached | grep -i 'password\|secret\|api_key'

# Keine .env committet
git diff --cached --name-only | grep '.env$'
```

**Wenn Verstoß erkannt:**
- ❌ NICHT committen
- 🔧 Secrets entfernen
- 🔧 Umgebungsvariablen verwenden
- 📖 Referenz: `.claude/rules/07-security-rgpd.md`

---

## Abschließende Checkliste vor Commit

```bash
# 1. Sauberer Status
git status

# 2. Diff Review
git diff --cached

# 3. Qualität OK
make quality
✅ PHPStan: 0 Fehler
✅ CS-Fixer: Code formatiert

# 4. Tests OK
make test
✅ Unit-Tests: BESTANDEN
✅ Integrationstests: BESTANDEN
✅ Behat-Tests: BESTANDEN

# 5. Coverage OK
make test-coverage
✅ Coverage: ≥ 80%

# 6. Commit-Nachricht vorbereitet
✅ Format: <type>(<scope>): <description>
✅ Klare und prägnante Beschreibung

# 7. Wenn alles OK → COMMIT
git add .
git commit -m "feat(reservation): füge Einzelzimmerzuschlag für 1 Teilnehmer hinzu

Implementiert Geschäftsregel von +30% auf Preis bei nur einem Teilnehmer.
Unit- und Integrationstests hinzugefügt.
Coverage: 85%

Closes #42
"
```

---

## Beispiele für vollständige Workflows

### Workflow 1: Neue Funktion

```bash
# 1. TDD-Entwicklung
vim tests/Unit/Service/ReservationServiceTest.php  # RED
vim src/Service/ReservationService.php             # GREEN
make test-unit                                     # ✅

# 2. Qualität
make cs-fix                                        # Auto-Format
make phpstan                                       # ✅ Level 8

# 3. Vollständige Tests
make test                                          # ✅ Alle bestehen

# 4. Coverage
make test-coverage                                 # ✅ 85%

# 5. Commit
git add .
git commit -m "feat(reservation): füge Preisberechnung mit Optionen hinzu

Implementiert Gesamtpreisberechnung inklusive:
- Basispreis × Anz. Teilnehmer
- Einzelzimmerzuschlag bei 1 Teilnehmer
- Kostenpflichtige Optionen (Versicherung, etc.)

Tests: 12 Tests hinzugefügt (85% Coverage)
PHPStan: Level 8 OK

Closes #45
"
```

### Workflow 2: Bug-Fix

```bash
# 1. Nicht-Regressions-Test (RED)
vim tests/Unit/ValueObject/MoneyTest.php
make test-unit                                     # ❌ Fehlgeschlagen (erwartet)

# 2. Fix (GREEN)
vim src/ValueObject/Money.php
make test-unit                                     # ✅ Bestanden

# 3. Qualität
make quality                                       # ✅ OK

# 4. Commit
git commit -m "fix(value-object): korrigiere Rundung in Money::multiply

Multiply()-Berechnung rundete Cent falsch ab,
verursachte Preisabweichungen von 0.01€.

Hinzufügung von round() mit PHP_ROUND_HALF_UP.

Fixes #67
"
```

---

## Bei Problemen

### Tests schlagen fehl

```bash
# Fehlschlagenden Test identifizieren
make test-unit --verbose

# Debug
docker compose exec php bin/phpunit --filter=testMethodName --debug

# Fixtures prüfen
docker compose exec php bin/console doctrine:fixtures:load --env=test
```

### PHPStan schlägt fehl

```bash
# Detaillierte Fehler anzeigen
make phpstan --verbose

# Spezifische Datei analysieren
docker compose exec php vendor/bin/phpstan analyse src/Service/ReservationService.php -l 8
```

### Coverage zu niedrig

```bash
# Nicht abgedeckte Dateien anzeigen
make test-coverage

# Fehlende Tests hinzufügen
vim tests/Unit/[ClassToTest]Test.php
```

---

## All-in-One-Befehl

```bash
# Skript das alles macht (zum Makefile hinzufügen)
make pre-commit
```

```makefile
# Makefile
.PHONY: pre-commit
pre-commit: ## Vollständige Validierung vor Commit
	@echo "🔍 PHPStan..."
	@$(MAKE) phpstan
	@echo "✅ PHPStan OK"
	@echo ""
	@echo "🎨 CS-Fixer..."
	@$(MAKE) cs-fix
	@echo "✅ Code formatiert"
	@echo ""
	@echo "🧪 Tests..."
	@$(MAKE) test
	@echo "✅ Tests OK"
	@echo ""
	@echo "📊 Coverage..."
	@$(MAKE) test-coverage
	@echo "✅ Coverage OK"
	@echo ""
	@echo "🐳 Hadolint..."
	@$(MAKE) hadolint || true
	@echo ""
	@echo "🎉 Bereit zum Commit!"
```

Verwendung:
```bash
make pre-commit && git commit
```

---

## Wichtige Erinnerungen

### ⚠️ NIEMALS committen

- ❌ Fehlschlagende Tests
- ❌ Code der nicht kompiliert
- ❌ PHPStan Level 8 Fehler
- ❌ Secrets/Passwörter im Klartext
- ❌ `.env`-Dateien (außer `.env.dist`)
- ❌ Auskommentierter Code (löschen, nicht kommentieren)
- ❌ `var_dump()`, `dd()`, `console.log()`
- ❌ `//TODO` ohne zugehöriges Ticket
- ❌ Unformatierter Code (CS-Fixer)

### ✅ Immer committen

- ✅ Bestandene Tests
- ✅ Formatierter Code (PER-CS 3.0)
- ✅ PHPStan Level 8 OK
- ✅ Aktualisierte Dokumentation
- ✅ Klare Commit-Nachricht
- ✅ Coverage ≥ 80%

---

**Geschätzte Zeit für diese Checkliste:** 2-5 Minuten

**Wenn es länger als 5 Minuten dauert:** Es gibt wahrscheinlich ein Problem, das vor dem Commit korrigiert werden muss.
