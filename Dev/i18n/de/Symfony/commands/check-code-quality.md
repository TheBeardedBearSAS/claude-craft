---
description: Symfony Code-Qualitäts-Audit
argument-hint: [arguments]
---

# Symfony Code-Qualitäts-Audit

## Argumente

$ARGUMENTS : Pfad zum zu auditierenden Symfony-Projekt (optional, Standard: aktuelles Verzeichnis)

## Plan-Modus

> Der Plan-Modus wird automatisch aktiviert, wenn der Umfang mehrere Module umfasst oder eine modulübergreifende Untersuchung erfordert.

## MISSION

Du bist ein Experte für Software-Qualität, der die Code-Qualität eines Symfony-Projekts nach PSR-12-Standards, PHPStan Level 9 und modernen PHP-Best Practices auditiert.

### Schritt 1: Umgebung überprüfen

1. Projektverzeichnis identifizieren
2. Qualitäts-Tools in composer.json prüfen
3. Verwendete PHP-Version prüfen

**Regelreferenz**: `.claude/rules/symfony-code-quality.md`

### Schritt 2: PSR-12-Überprüfung

PHP_CodeSniffer ausführen, um PSR-12-Konformität zu überprüfen:

```bash
# Prüfen, ob phpcs installiert ist
docker run --rm -v $(pwd):/app php:8.2-cli test -f /app/vendor/bin/phpcs && echo "✅ phpcs gefunden" || echo "❌ phpcs fehlt"

# phpcs ausführen
docker run --rm -v $(pwd):/app php:8.2-cli /app/vendor/bin/phpcs --standard=PSR12 src/ --report=summary
```

#### PSR-12-Standards (5 Punkte)

- [ ] Einrückung mit 4 Leerzeichen (keine Tabs)
- [ ] Zeilenlänge ≤ 120 Zeichen
- [ ] Geschweifte Klammern auf neuen Zeilen für Klassen und Methoden
- [ ] Use-Statements alphabetisch sortiert
- [ ] Keine Leerzeichen am Zeilenende
- [ ] Dateien enden mit Leerzeile
- [ ] `declare(strict_types=1)` nach PHP-Tag
- [ ] Eine Klasse pro Datei
- [ ] Namespace entspricht Ordnerstruktur
- [ ] Benennung: camelCase für Methoden, PascalCase für Klassen

**Erzielte Punkte**: ___/5

### Schritt 3: Statische Analyse mit PHPStan

PHPStan auf Level 9 ausführen:

```bash
# Prüfen, ob PHPStan installiert ist
docker run --rm -v $(pwd):/app php:8.2-cli test -f /app/vendor/bin/phpstan && echo "✅ PHPStan gefunden" || echo "❌ PHPStan fehlt"

# PHPStan Level 9 ausführen
docker run --rm -v $(pwd):/app phpstan/phpstan analyse src --level=9 --error-format=table
```

#### PHPStan Level 9 (10 Punkte)

- [ ] Keine PHPStan Level 9 Fehler
- [ ] Alle Rückgabetypen deklariert
- [ ] Alle Parameter typisiert
- [ ] Keine mixed-Typen
- [ ] Kein toter Code erkannt
- [ ] Keine undefinierten Variablen
- [ ] Keine undefinierten Properties
- [ ] Keine undefinierten Methoden
- [ ] Generics korrekt verwendet (PHPDoc-Templates)
- [ ] Nullability explizit (? oder Union Types)

**Erzielte Punkte**: ___/10

Erwartete PHPStan-Konfiguration in `phpstan.neon`:

```neon
parameters:
    level: 9
    paths:
        - src
    excludePaths:
        - src/Kernel.php
    checkMissingIterableValueType: true
    checkGenericClassInNonGenericObjectType: true
    reportUnmatchedIgnoredErrors: true
```

### Schritt 4: Type Hints und Strict Types

Strikte Typenverwendung überprüfen:

```bash
# declare(strict_types=1) prüfen
docker run --rm -v $(pwd):/app php:8.2-cli grep -r "declare(strict_types=1)" /app/src --include="*.php" | wc -l

# Anzahl PHP-Dateien zählen
docker run --rm -v $(pwd):/app php:8.2-cli find /app/src -name "*.php" | wc -l

# Die beiden Zahlen müssen identisch sein
```

#### Strikte Type Hints (5 Punkte)

- [ ] `declare(strict_types=1)` in 100% der PHP-Dateien
- [ ] Type Hints auf allen öffentlichen Methodenparametern
- [ ] Type Hints auf allen Methodenrückgaben
- [ ] Type Hints auf allen Klasseneigenschaften (PHP 7.4+)
- [ ] Verwendung von Union Types (PHP 8.0+) statt mixed
- [ ] Keine redundanten @param/@return-Docblocks mit nativen Typen
- [ ] Verwendung von readonly für unveränderliche Properties (PHP 8.1+)
- [ ] Keine Fehlerunterdrückung mit @phpstan-ignore
- [ ] Strikte Typen in Arrays: array<string, int>
- [ ] Verwendung von never-Typ für Methoden die nie zurückkehren (PHP 8.1+)

**Erzielte Punkte**: ___/5

### Schritt 5: Komplexität und Wartbarkeit

Code-Komplexität analysieren:

```bash
# phpmetrics installieren falls nötig
# Komplexität analysieren
docker run --rm -v $(pwd):/app php:8.2-cli php -r "
require '/app/vendor/autoload.php';
// Basis-Komplexitätsanalyse
"
```

#### Code-Metriken (3 Punkte)

- [ ] Durchschnittliche zyklomatische Komplexität < 5 pro Methode
- [ ] Maximale zyklomatische Komplexität < 10 pro Methode
- [ ] Durchschnittliche Methodenlänge < 15 Zeilen
- [ ] Maximale Methodenlänge < 30 Zeilen
- [ ] Klassen mit < 10 öffentlichen Methoden
- [ ] Keine Methoden mit mehr als 5 Parametern
- [ ] Wartbarkeitsindex > 70
- [ ] Ausgewogenes afferentes/efferentes Coupling
- [ ] Keine "God Object"-Klassen (> 500 Zeilen)
- [ ] Einhaltung des Single Responsibility Principle

**Erzielte Punkte**: ___/3

### Schritt 6: Dokumentation und PHPDoc

Dokumentationsqualität überprüfen:

```bash
# Fehlende PHPDocs prüfen
docker run --rm -v $(pwd):/app phpstan/phpstan analyse src --level=9 | grep -i "phpdoc"
```

#### Dokumentation (2 Punkte)

- [ ] PHPDoc für alle Klassen (Rollenbeschreibung)
- [ ] PHPDoc für alle komplexen öffentlichen Methoden
- [ ] @param mit Beschreibung für nicht offensichtliche Parameter
- [ ] @return mit Beschreibung für komplexe Rückgaben
- [ ] @throws für alle Exceptions
- [ ] Aktuelles PHPDoc (keine veralteten Parameter)
- [ ] Keine TODO/FIXME im Produktionscode
- [ ] Nutzungsbeispiele für öffentliche APIs
- [ ] Generics dokumentiert: @template, @extends, @implements
- [ ] README.md mit Architekturdokumentation

**Erzielte Punkte**: ___/2

### Schritt 7: Code-Qualitäts-Score berechnen

**CODE-QUALITÄTS-SCORE**: ___/25 Punkte

Details:
- PSR-12-Standards: ___/5
- PHPStan Level 9: ___/10
- Strikte Type Hints: ___/5
- Code-Metriken: ___/3
- Dokumentation: ___/2

### Schritt 8: Detaillierter Bericht

```
=================================================
   SYMFONY CODE-QUALITÄTS-AUDIT
=================================================

📊 SCORE: ___/25

📏 PSR-12-Standards     : ___/5  [✅|⚠️|❌]
🔍 PHPStan Level 9      : ___/10 [✅|⚠️|❌]
🏷️  Strikte Type Hints  : ___/5  [✅|⚠️|❌]
📊 Code-Metriken        : ___/3  [✅|⚠️|❌]
📝 Dokumentation        : ___/2  [✅|⚠️|❌]

=================================================
   ERKANNTE PSR-12-FEHLER
=================================================

[Gesamtanzahl Fehler]: ___

Beispiele:
❌ src/Controller/UserController.php:45 - Zeile zu lang (145 Zeichen)
❌ src/Domain/Entity/Order.php:12 - Geschweifte Klammer falsch platziert
⚠️ src/Application/Service/EmailService.php - Use-Statements nicht sortiert

=================================================
   ERKANNTE PHPSTAN-FEHLER
=================================================

[Gesamtanzahl Fehler]: ___

Beispiele:
❌ src/Domain/Entity/User.php:32 - Fehlender Rückgabetyp
❌ src/Application/UseCase/CreateOrder.php:45 - Parameter $data nicht typisiert
⚠️ src/Infrastructure/Repository/UserRepository.php:78 - Property $entityManager hat Typ mixed

=================================================
   FEHLENDE TYPE HINTS
=================================================

Dateien ohne declare(strict_types=1): ___
Methoden ohne Rückgabetyp: ___
Parameter ohne Typ: ___
Properties ohne Typ: ___

Beispiele:
❌ src/Application/Service/OrderService.php:15 - Kein declare(strict_types=1)
❌ src/Domain/ValueObject/Email.php:23 - Methode getValue() ohne Rückgabetyp
⚠️ src/Infrastructure/Adapter/EmailAdapter.php:34 - Property $mailer nicht typisiert

=================================================
   ÜBERMÄSSIGE KOMPLEXITÄT
=================================================

Methoden mit Komplexität > 10: ___

Beispiele:
❌ src/Application/UseCase/ProcessOrder.php:execute() - Komplexität 15
⚠️ src/Domain/Service/PriceCalculator.php:calculate() - Komplexität 12
⚠️ src/Controller/ApiController.php:handleRequest() - 95 Zeilen

=================================================
   TOP 3 PRIORITÄTEN
=================================================

1. 🎯 [KRITISCH] - PHPStan Level 9 Fehler beheben
   Auswirkung: ⭐⭐⭐⭐⭐ | Aufwand: 🔥🔥🔥
   Befehl: docker run --rm -v $(pwd):/app phpstan/phpstan analyse src --level=9

2. 🎯 [WICHTIG] - declare(strict_types=1) überall hinzufügen
   Auswirkung: ⭐⭐⭐⭐ | Aufwand: 🔥
   Skript: find src -name "*.php" -exec sed -i '2i\\declare(strict_types=1);' {} \;

3. 🎯 [EMPFOHLEN] - Code nach PSR-12 formatieren
   Auswirkung: ⭐⭐⭐ | Aufwand: 🔥
   Befehl: docker run --rm -v $(pwd):/app php:8.2-cli /app/vendor/bin/phpcbf --standard=PSR12 src/

=================================================
   EMPFEHLUNGEN
=================================================

Zu installierende Tools:
```bash
composer require --dev phpstan/phpstan ^1.10
composer require --dev phpstan/phpstan-symfony
composer require --dev phpstan/phpstan-doctrine
composer require --dev squizlabs/php_codesniffer ^3.7
composer require --dev friendsofphp/php-cs-fixer ^3.0
```

PHP CS Fixer Konfiguration (.php-cs-fixer.php):
```php
<?php
return (new PhpCsFixer\Config())
    ->setRules([
        '@PSR12' => true,
        'strict_param' => true,
        'array_syntax' => ['syntax' => 'short'],
        'declare_strict_types' => true,
    ])
    ->setFinder(
        PhpCsFixer\Finder::create()->in(__DIR__ . '/src')
    );
```

CI/CD:
- PHPStan zur Pipeline hinzufügen
- Merges blockieren, wenn PHPStan fehlschlägt
- PHP CS Fixer im Check-Modus ausführen
- Qualitätsberichte generieren

=================================================
```

## Nützliche Docker-Befehle

```bash
# PSR-12 prüfen
docker run --rm -v $(pwd):/app php:8.2-cli /app/vendor/bin/phpcs --standard=PSR12 src/ --report=summary

# PSR-12 automatisch korrigieren
docker run --rm -v $(pwd):/app php:8.2-cli /app/vendor/bin/phpcbf --standard=PSR12 src/

# PHPStan Level 9
docker run --rm -v $(pwd):/app phpstan/phpstan analyse src --level=9 --error-format=table

# PHPStan Baseline generieren (für Legacy-Projekte)
docker run --rm -v $(pwd):/app phpstan/phpstan analyse src --level=9 --generate-baseline

# PHP CS Fixer
docker run --rm -v $(pwd):/app php:8.2-cli /app/vendor/bin/php-cs-fixer fix src --dry-run --diff

# declare(strict_types=1) überall prüfen
docker run --rm -v $(pwd):/app php:8.2-cli sh -c 'for f in $(find /app/src -name "*.php"); do grep -q "declare(strict_types=1)" "$f" || echo "❌ Fehlt: $f"; done'
```

## WICHTIG

- IMMER Docker für Befehle verwenden
- NIEMALS Dateien in /tmp speichern
- Konkrete Beispiele mit Zeilennummern liefern
- Automatisierbare Korrekturen priorisieren
- Kritische Fehler von Warnungen unterscheiden
