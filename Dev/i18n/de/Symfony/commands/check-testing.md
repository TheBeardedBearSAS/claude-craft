---
description: Audit Testing Symfony
argument-hint: [arguments]
---

# Audit Testing Symfony

## Argumente

$ARGUMENTS : Pfad zum zu prüfenden Symfony-Projekt (optional, Standard: aktuelles Verzeichnis)

## Plan-Modus

> Der Plan-Modus wird automatisch aktiviert, wenn der Umfang mehrere Module umfasst oder eine modulübergreifende Untersuchung erfordert.

## MISSION

Du bist ein Experte für Softwaretests und für die Prüfung der Teststrategie eines Symfony-Projekts verantwortlich: Unit-Tests, Integrationstests, funktionale Tests, Code-Coverage und Mutationstests.

### Schritt 1: Überprüfung der Testumgebung

1. Identifiziere das Projektverzeichnis
2. Überprüfe das Vorhandensein von PHPUnit in composer.json
3. Überprüfe die PHPUnit-Konfiguration (phpunit.xml.dist)
4. Überprüfe das Vorhandensein des Verzeichnisses tests/

**Verweis auf die Regeln**: `.claude/rules/symfony-testing.md`

### Schritt 2: Teststruktur

Analysiere die Struktur des Verzeichnisses tests/:

```bash
# Teststruktur auflisten
docker run --rm -v $(pwd):/app php:8.2-cli find /app/tests -type d
```

#### Testorganisation (3 Punkte)

- [ ] Verzeichnis `tests/Unit/` für Unit-Tests
- [ ] Verzeichnis `tests/Integration/` für Integrationstests
- [ ] Verzeichnis `tests/Functional/` für funktionale Tests
- [ ] Spiegelstruktur von src/ in tests/
- [ ] Namespace korrekt konfiguriert
- [ ] Fixtures in tests/Fixtures/
- [ ] Mocks in tests/Mock/ oder inline
- [ ] Separate Testkonfiguration (config/packages/test/)
- [ ] Separate Testdatenbank
- [ ] Isolierte und unabhängige Tests

**Erreichte Punkte**: ___/3

### Schritt 3: Unit-Tests

Führe die Unit-Tests aus:

```bash
# Nur Unit-Tests ausführen
docker run --rm -v $(pwd):/app php:8.2-cli /app/vendor/bin/phpunit tests/Unit --testdox

# Unit-Tests zählen
docker run --rm -v $(pwd):/app php:8.2-cli /app/vendor/bin/phpunit tests/Unit --list-tests | wc -l
```

#### Unit-Tests Domain (7 Punkte)

- [ ] Tests für alle Domain-Entities
- [ ] Tests für alle Value Objects
- [ ] Tests für alle Domain Services
- [ ] Tests für Use Cases / Application Services
- [ ] Keine externen Abhängigkeiten (DB, API, Dateisystem)
- [ ] Verwendung von Mocks für Abhängigkeiten
- [ ] Tests für Grenzfälle und Fehler
- [ ] Tests für Business-Validierungen
- [ ] Schnelles Feedback (< 1 Sekunde für alle Unit-Tests)
- [ ] Unit-Test-Coverage > 90%

Anzahl der Unit-Tests: ___
Ausführungszeit: ___ Sekunden

**Erreichte Punkte**: ___/7

### Schritt 4: Integrationstests

Führe die Integrationstests aus:

```bash
# Integrationstests ausführen
docker run --rm -v $(pwd):/app php:8.2-cli /app/vendor/bin/phpunit tests/Integration --testdox
```

#### Integrationstests Infrastructure (5 Punkte)

- [ ] Tests für alle Repositories (mit Datenbank)
- [ ] Tests für externe Adapter (E-Mail, API, etc.)
- [ ] Tests für Event Listeners / Subscribers
- [ ] Tests für Services mit Symfony-Abhängigkeiten
- [ ] Verwendung einer Testdatenbank
- [ ] Rollback oder Reset nach jedem Test
- [ ] Fixtures für Testdaten
- [ ] Tests für Transaktionen und DB-Constraints
- [ ] Isolation der Tests (keine Reihenfolge erforderlich)
- [ ] Tests für Fehlerfälle (fehlgeschlagene Verbindung, etc.)

Anzahl der Integrationstests: ___
Ausführungszeit: ___ Sekunden

**Erreichte Punkte**: ___/5

### Schritt 5: Funktionale Tests

Führe die funktionalen Tests aus:

```bash
# Funktionale Tests ausführen
docker run --rm -v $(pwd):/app php:8.2-cli /app/vendor/bin/phpunit tests/Functional --testdox

# Prüfen, ob Behat installiert ist
docker run --rm -v $(pwd):/app php:8.2-cli test -f /app/vendor/bin/behat && echo "✅ Behat gefunden" || echo "⚠️ Behat fehlt"
```

#### Funktionale Tests (5 Punkte)

- [ ] Tests für alle wichtigen API/Web-Routen
- [ ] Tests für Controller mit WebTestCase
- [ ] Tests für Formulare
- [ ] Tests für Authentifizierung und Autorisierung
- [ ] Tests für vollständige Workflows (User Journey)
- [ ] Tests mit Behat für Business-Szenarien (optional)
- [ ] Tests für HTTP-Antworten (Codes, Headers, Body)
- [ ] Tests für API-Validierungen
- [ ] Tests für Fehlerfälle (404, 403, 500)
- [ ] Tests für Weiterleitungen

Anzahl der funktionalen Tests: ___
Behat-Tests vorhanden: [JA|NEIN]

**Erreichte Punkte**: ___/5

### Schritt 6: Code-Coverage

Generiere den Coverage-Bericht:

```bash
# Code-Coverage generieren (benötigt xdebug oder pcov)
docker run --rm -v $(pwd):/app php:8.2-cli php -d memory_limit=-1 /app/vendor/bin/phpunit --coverage-text --coverage-html=/app/var/coverage

# Coverage-Zusammenfassung anzeigen
docker run --rm -v $(pwd):/app php:8.2-cli /app/vendor/bin/phpunit --coverage-text | grep "Lines:"
```

#### Code-Coverage (5 Punkte)

- [ ] Gesamtabdeckung ≥ 80%
- [ ] Domain-Abdeckung ≥ 90%
- [ ] Application-Abdeckung ≥ 85%
- [ ] Infrastructure-Abdeckung ≥ 70%
- [ ] Branch-Abdeckung (Conditional) ≥ 75%
- [ ] Coverage-Bericht generiert (HTML)
- [ ] Expliziter Ausschluss von nicht testbarem Code
- [ ] Kein kritischer Code ohne Abdeckung
- [ ] Tests für Exceptions und Fehlerfälle
- [ ] Coverage-Konfiguration in phpunit.xml

Gesamtabdeckung: ___%
Domain-Abdeckung: ___%
Application-Abdeckung: ___%
Infrastructure-Abdeckung: ___%

**Erreichte Punkte**: ___/5

Erwartete PHPUnit-Konfiguration:

```xml
<coverage processUncoveredFiles="true">
    <include>
        <directory suffix=".php">src</directory>
    </include>
    <exclude>
        <directory>src/Kernel.php</directory>
        <directory>src/DataFixtures</directory>
    </exclude>
    <report>
        <html outputDirectory="var/coverage"/>
        <text outputFile="php://stdout" showUncoveredFiles="false"/>
    </report>
</coverage>
```

### Schritt 7: Mutationstests mit Infection

Führe die Mutationstests aus:

```bash
# Prüfen, ob Infection installiert ist
docker run --rm -v $(pwd):/app php:8.2-cli test -f /app/vendor/bin/infection && echo "✅ Infection gefunden" || echo "❌ Infection fehlt"

# Infection ausführen
docker run --rm -v $(pwd):/app infection/infection --min-msi=70 --min-covered-msi=80 --threads=4
```

#### Mutationstests (5 Punkte)

- [ ] Infection installiert und konfiguriert
- [ ] MSI (Mutation Score Indicator) ≥ 70%
- [ ] Covered MSI ≥ 80%
- [ ] Tests erkennen Mutationen im Domain
- [ ] Tests erkennen Mutationen in Application
- [ ] Keine entkommenen Mutanten in kritischem Code
- [ ] infection.json vorhanden
- [ ] Timeout korrekt konfiguriert
- [ ] Ausschlüsse in Config begründet
- [ ] Mutationsbericht generiert

MSI: ___%
Covered MSI: ___%
Getötete Mutanten: ___
Entkommene Mutanten: ___

**Erreichte Punkte**: ___/5

Erwartete Infection-Konfiguration (infection.json):

```json
{
    "source": {
        "directories": ["src"]
    },
    "logs": {
        "text": "var/infection.log",
        "html": "var/infection-report.html"
    },
    "mutators": {
        "@default": true
    },
    "minMsi": 70,
    "minCoveredMsi": 80
}
```

### Schritt 8: Berechnung des Testing-Scores

**TESTING-SCORE**: ___/25 Punkte

Details:
- Testorganisation: ___/3
- Unit-Tests Domain: ___/7
- Integrationstests Infrastructure: ___/5
- Funktionale Tests: ___/5
- Code-Coverage: ___/5
- Mutationstests: ___/5

### Schritt 9: Detaillierter Bericht

```
=================================================
   AUDIT TESTING SYMFONY
=================================================

📊 SCORE: ___/25

📁 Testorganisation                   : ___/3 [✅|⚠️|❌]
🎯 Unit-Tests Domain                  : ___/7 [✅|⚠️|❌]
🔌 Integrationstests Infrastructure   : ___/5 [✅|⚠️|❌]
🌐 Funktionale Tests                  : ___/5 [✅|⚠️|❌]
📊 Code-Coverage                      : ___/5 [✅|⚠️|❌]
🦠 Mutationstests                     : ___/5 [✅|⚠️|❌]

=================================================
   GLOBALE STATISTIKEN
=================================================

Gesamtanzahl Tests      : ___
Unit-Tests             : ___
Integrationstests      : ___
Funktionale Tests      : ___
Behat-Tests            : ___

Gesamt-Ausführungszeit : ___ Sekunden
Gesamtabdeckung        : ___%
MSI (Mutation Score)   : ___%

=================================================
   COVERAGE NACH SCHICHT
=================================================

Domain          : ___% [✅|⚠️|❌] (Ziel: 90%)
Application     : ___% [✅|⚠️|❌] (Ziel: 85%)
Infrastructure  : ___% [✅|⚠️|❌] (Ziel: 70%)
Presentation    : ___% [✅|⚠️|❌] (Ziel: 70%)

Dateien ohne Abdeckung  : ___
Methoden ohne Abdeckung : ___
Zeilen ohne Abdeckung   : ___

=================================================
   MUTATION TESTING
=================================================

MSI (Mutation Score)    : ___% [✅|⚠️|❌] (Ziel: 70%)
Covered MSI             : ___% [✅|⚠️|❌] (Ziel: 80%)

Generierte Mutanten     : ___
Getötete Mutanten      : ___ (von Tests erkannt)
Entkommene Mutanten    : ___ (nicht erkannt)
Timeout-Mutanten       : ___
Fehler-Mutanten        : ___

Dateien mit kritischen entkommenen Mutanten:
❌ src/Domain/Entity/Order.php - 3 entkommene Mutanten
❌ src/Application/UseCase/CreateUser.php - 2 entkommene Mutanten

=================================================
   ERKANNTE PROBLEME
=================================================

Fehlende Tests:
❌ Keine Tests für src/Domain/Entity/Invoice.php
❌ Keine Tests für src/Application/UseCase/ProcessPayment.php
⚠️ Niedrige Abdeckung für src/Infrastructure/Repository/OrderRepository.php (45%)

Langsame Tests:
⚠️ tests/Integration/RepositoryTest.php - 15s (mit Fixtures optimieren)
⚠️ tests/Functional/ApiTest.php - 12s (gemockten HTTP-Client verwenden)

Flaky Tests:
❌ tests/Integration/EmailServiceTest.php - schlägt manchmal fehl
⚠️ tests/Functional/CheckoutTest.php - abhängig von Ausführungsreihenfolge

Konfiguration:
❌ Infection nicht installiert
⚠️ Code-Coverage nicht in phpunit.xml konfiguriert
❌ Testdatenbank nicht getrennt

=================================================
   TOP 3 PRIORITÄRE AKTIONEN
=================================================

1. 🎯 [KRITISCHE AKTION] - 80% Code-Coverage erreichen
   Impact: ⭐⭐⭐⭐⭐ | Aufwand: 🔥🔥🔥🔥
   - Tests für Invoice, ProcessPayment hinzufügen
   - Alle Fehlerfälle testen
   - Alle bedingten Zweige testen

2. 🎯 [WICHTIGE AKTION] - Infection installieren und konfigurieren
   Impact: ⭐⭐⭐⭐ | Aufwand: 🔥🔥
   Befehl: composer require --dev infection/infection
   Ziel MSI ≥ 70%

3. 🎯 [EMPFOHLENE AKTION] - Tests trennen und optimieren
   Impact: ⭐⭐⭐ | Aufwand: 🔥🔥
   - Unit/Integration/Functional trennen
   - In-Memory-Datenbank für Tests verwenden
   - Fixtures optimieren

=================================================
   EMPFEHLUNGEN
=================================================

Installation der Tools:
```bash
composer require --dev phpunit/phpunit ^10.0
composer require --dev infection/infection
composer require --dev symfony/test-pack
composer require --dev behat/behat
composer require --dev friends-of-behat/symfony-extension
composer require --dev doctrine/doctrine-fixtures-bundle
```

Konfiguration phpunit.xml.dist:
```xml
<?xml version="1.0" encoding="UTF-8"?>
<phpunit xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:noNamespaceSchemaLocation="vendor/phpunit/phpunit/phpunit.xsd"
         bootstrap="tests/bootstrap.php"
         colors="true">
    <testsuites>
        <testsuite name="unit">
            <directory>tests/Unit</directory>
        </testsuite>
        <testsuite name="integration">
            <directory>tests/Integration</directory>
        </testsuite>
        <testsuite name="functional">
            <directory>tests/Functional</directory>
        </testsuite>
    </testsuites>
    <coverage processUncoveredFiles="true">
        <include>
            <directory suffix=".php">src</directory>
        </include>
    </coverage>
</phpunit>
```

Best Practices:
- Factories zum Erstellen von Testobjekten verwenden
- Builder für komplexe Objekte verwenden
- Benutzerdefinierte wiederverwendbare Assertions erstellen
- Tests mit setUp/tearDown isolieren
- Data Providers für mehrere Fälle verwenden
- Nur externe Abhängigkeiten mocken
- Zuerst den Happy Path testen, dann Fehlerfälle

CI/CD:
- Tests bei jedem Commit ausführen
- Merges blockieren, wenn Tests fehlschlagen
- Coverage-Berichte generieren und veröffentlichen
- Infection bei Pull Requests ausführen
- Warnung, wenn Coverage sinkt

=================================================
```

## Nützliche Docker-Befehle

```bash
# Alle Tests ausführen
docker run --rm -v $(pwd):/app php:8.2-cli /app/vendor/bin/phpunit

# Nur Unit-Tests
docker run --rm -v $(pwd):/app php:8.2-cli /app/vendor/bin/phpunit tests/Unit

# Tests mit Coverage
docker run --rm -v $(pwd):/app php:8.2-cli php -d xdebug.mode=coverage /app/vendor/bin/phpunit --coverage-text

# Infection (Mutationstests)
docker run --rm -v $(pwd):/app infection/infection --threads=4 --min-msi=70

# Behat (BDD-Tests)
docker run --rm -v $(pwd):/app php:8.2-cli /app/vendor/bin/behat

# Alle Tests auflisten
docker run --rm -v $(pwd):/app php:8.2-cli /app/vendor/bin/phpunit --list-tests

# Spezifischen Test ausführen
docker run --rm -v $(pwd):/app php:8.2-cli /app/vendor/bin/phpunit tests/Unit/Domain/Entity/UserTest.php

# Tests mit detaillierter Ausgabe
docker run --rm -v $(pwd):/app php:8.2-cli /app/vendor/bin/phpunit --testdox
```

## WICHTIG

- Verwende IMMER Docker für Befehle
- Speichere NIEMALS Dateien in /tmp (verwende var/ des Projekts)
- Liefere präzise Statistiken
- Identifiziere kritische Dateien ohne Tests
- Schlage konkrete hinzuzufügende Tests vor
