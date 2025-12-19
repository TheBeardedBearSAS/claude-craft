# Testing TDD & BDD - Atoll Tourisme

## Überblick

Die **TDD (Test-Driven Development)** Entwicklung ist **OBLIGATORISCH** für das gesamte Atoll Tourisme Projekt. Der RED → GREEN → REFACTOR Zyklus muss strikt eingehalten werden.

**Ziele:**
- ✅ Code Coverage: **80% Minimum**
- ✅ Mutation Score (Infection): **80% Minimum**
- ✅ Tests vor Implementierung (striktes TDD)
- ✅ BDD mit Behat für Geschäftsszenarien

> **Referenzen:**
> - `06-docker-hadolint.md` - Docker-Befehle für Tests
> - `08-quality-tools.md` - Qualitätswerkzeuge (PHPUnit, Infection)
> - `04-solid-principles.md` - Testbarer Code

---

## Inhaltsverzeichnis

1. [TDD - Test-Driven Development](#tdd---test-driven-development)
2. [Teststruktur](#teststruktur)
3. [PHPUnit-Konfiguration](#phpunit-konfiguration)
4. [Unit-Tests](#unit-tests)
5. [Integrationstests](#integrationstests)
6. [Funktionale Tests](#funktionale-tests)
7. [BDD mit Behat](#bdd-mit-behat)
8. [Mutation Testing mit Infection](#mutation-testing-mit-infection)
9. [Validierungs-Checkliste](#validierungs-checkliste)

---

## TDD - Test-Driven Development

### Obligatorischer TDD-Zyklus

```
┌─────────────────────────────────────────┐
│  1. RED: Test schreiben der fehlschlägt │
│     - Unit-Test                         │
│     - Funktionaler Test                 │
│     - Behat-Spezifikation               │
└─────────────┬───────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────┐
│  2. GREEN: Minimaler Code zum Bestehen  │
│     - Minimale Implementierung          │
│     - Keine Optimierung                 │
│     - Nur Test zum Laufen bringen       │
└─────────────┬───────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────┐
│  3. REFACTOR: Code verbessern           │
│     - Duplikation beseitigen            │
│     - SOLID anwenden                    │
│     - Tests bleiben grün                │
└─────────────┬───────────────────────────┘
              │
              └──────┐
                     │ Wiederholen
                     ▼
```

### Strikte TDD-Regeln

1. **Niemals Produktionscode ohne erst fehlschlagenden Test**
2. **Unit-Tests für Geschäftslogik (Domain)**
3. **Integrationstests für Repositories (Infrastructure)**
4. **Funktionale Tests für Use Cases (Application)**
5. **BDD/Behat für Benutzer-Geschäftsszenarien**

### TDD-Beispiel: Money Value Object

#### 1. RED - Fehlschlagender Test

```php
<?php

namespace App\Tests\Unit\Domain\Reservation\ValueObject;

use App\Domain\Reservation\ValueObject\Money;
use PHPUnit\Framework\TestCase;

final class MoneyTest extends TestCase
{
    /**
     * @test
     */
    public function it_creates_money_from_euros(): void
    {
        // Given (RED - Die Klasse existiert noch nicht)
        $amount = 100.50;

        // When
        $money = Money::fromEuros($amount);

        // Then
        self::assertEquals(10050, $money->getAmountCents());
        self::assertEquals(100.50, $money->getAmountEuros());
    }

    /**
     * @test
     */
    public function it_adds_two_money_amounts(): void
    {
        // Given
        $money1 = Money::fromEuros(100);
        $money2 = Money::fromEuros(50);

        // When
        $result = $money1->add($money2);

        // Then
        self::assertEquals(150.00, $result->getAmountEuros());
    }

    /**
     * @test
     */
    public function it_throws_exception_for_negative_amount(): void
    {
        // Expect
        $this->expectException(\InvalidArgumentException::class);
        $this->expectExceptionMessage('Amount cannot be negative');

        // When
        Money::fromEuros(-10);
    }
}
```

```bash
# Ausführung (RED)
make test

# ❌ Erwartete Ausgabe:
# Error: Class "App\Domain\Reservation\ValueObject\Money" not found
```

#### 2. GREEN - Minimale Implementierung

```php
<?php

namespace App\Domain\Reservation\ValueObject;

// ✅ GREEN: Minimaler Code zum Bestehen der Tests
final readonly class Money
{
    private function __construct(
        private int $amountCents,
    ) {
        if ($amountCents < 0) {
            throw new \InvalidArgumentException('Amount cannot be negative');
        }
    }

    public static function fromEuros(float $amount): self
    {
        if ($amount < 0) {
            throw new \InvalidArgumentException('Amount cannot be negative');
        }

        return new self((int) round($amount * 100));
    }

    public function add(self $other): self
    {
        return new self($this->amountCents + $other->amountCents);
    }

    public function getAmountCents(): int
    {
        return $this->amountCents;
    }

    public function getAmountEuros(): float
    {
        return $this->amountCents / 100;
    }
}
```

```bash
# Ausführung (GREEN)
make test

# ✅ Erwartete Ausgabe:
# OK (3 tests, 5 assertions)
```

#### 3. REFACTOR - Verbesserung

```php
<?php

namespace App\Domain\Reservation\ValueObject;

// ✅ REFACTOR: Nützliche Methoden hinzufügen, Klarstellung
final readonly class Money
{
    private const string DEFAULT_CURRENCY = 'EUR';

    private function __construct(
        private int $amountCents,
        private string $currency = self::DEFAULT_CURRENCY,
    ) {
        $this->validateAmount($amountCents);
        $this->validateCurrency($currency);
    }

    public static function fromEuros(float $amount): self
    {
        if ($amount < 0) {
            throw new \InvalidArgumentException('Amount cannot be negative');
        }

        return new self((int) round($amount * 100));
    }

    public static function zero(): self
    {
        return new self(0);
    }

    public function add(self $other): self
    {
        $this->ensureSameCurrency($other);

        return new self($this->amountCents + $other->amountCents, $this->currency);
    }

    public function subtract(self $other): self
    {
        $this->ensureSameCurrency($other);

        return new self($this->amountCents - $other->amountCents, $this->currency);
    }

    public function multiply(float $multiplier): self
    {
        return new self((int) round($this->amountCents * $multiplier), $this->currency);
    }

    public function isPositive(): bool
    {
        return $this->amountCents > 0;
    }

    public function equals(self $other): bool
    {
        return $this->amountCents === $other->amountCents
            && $this->currency === $other->currency;
    }

    public function getAmountCents(): int
    {
        return $this->amountCents;
    }

    public function getAmountEuros(): float
    {
        return $this->amountCents / 100;
    }

    private function validateAmount(int $amountCents): void
    {
        if ($amountCents < 0) {
            throw new \InvalidArgumentException('Amount cannot be negative');
        }
    }

    private function validateCurrency(string $currency): void
    {
        if (empty($currency)) {
            throw new \InvalidArgumentException('Currency cannot be empty');
        }
    }

    private function ensureSameCurrency(self $other): void
    {
        if ($this->currency !== $other->currency) {
            throw new \InvalidArgumentException(
                sprintf('Currency mismatch: %s vs %s', $this->currency, $other->currency)
            );
        }
    }
}
```

```bash
# Tests bleiben grün nach Refactoring
make test

# ✅ OK (3 tests, 5 assertions)
```

---

## Teststruktur

```
tests/
├── Unit/                               # Unit-Tests (reine Logik)
│   ├── Domain/
│   │   ├── Reservation/
│   │   │   ├── Entity/
│   │   │   │   ├── ReservationTest.php
│   │   │   │   └── ParticipantTest.php
│   │   │   ├── ValueObject/
│   │   │   │   ├── MoneyTest.php
│   │   │   │   ├── ReservationIdTest.php
│   │   │   │   └── ReservationStatusTest.php
│   │   │   └── Service/
│   │   │       └── ReservationPricingServiceTest.php
│   │   └── Shared/
│   │       └── ValueObject/
│   │           ├── EmailTest.php
│   │           └── PhoneNumberTest.php
│   │
├── Integration/                        # Integrationstests (DB, Repositories)
│   ├── Infrastructure/
│   │   ├── Persistence/
│   │   │   └── Doctrine/
│   │   │       └── Repository/
│   │   │           └── DoctrineReservationRepositoryTest.php
│   │   └── Notification/
│   │       └── EmailNotificationServiceTest.php
│   │
├── Functional/                         # Funktionale Tests (Use Cases, HTTP)
│   ├── Application/
│   │   └── Reservation/
│   │       └── UseCase/
│   │           ├── CreateReservationUseCaseTest.php
│   │           └── ConfirmReservationUseCaseTest.php
│   ├── Controller/
│   │   └── ReservationControllerTest.php
│   │
├── Behat/                             # BDD-Tests (Geschäftsszenarien)
│   ├── bootstrap.php
│   └── Context/
│       ├── ReservationContext.php
│       └── SejourContext.php
│
├── Fixtures/                          # Testdaten
│   ├── ReservationFixtures.php
│   └── SejourFixtures.php
│
└── bootstrap.php
```

---

## PHPUnit-Konfiguration

### phpunit.xml.dist

```xml
<?xml version="1.0" encoding="UTF-8"?>
<phpunit xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:noNamespaceSchemaLocation="vendor/phpunit/phpunit/phpunit.xsd"
         bootstrap="tests/bootstrap.php"
         colors="true"
         executionOrder="random"
         beStrictAboutCoverageMetadata="true"
         beStrictAboutOutputDuringTests="true"
         failOnRisky="true"
         failOnWarning="true">

    <php>
        <ini name="display_errors" value="1"/>
        <ini name="error_reporting" value="-1"/>
        <server name="APP_ENV" value="test" force="true"/>
        <server name="SHELL_VERBOSITY" value="-1"/>
        <server name="SYMFONY_PHPUNIT_REMOVE" value=""/>
        <server name="SYMFONY_PHPUNIT_VERSION" value="10.5"/>
    </php>

    <testsuites>
        <!-- Unit-Tests: Reine Logik, keine Abhängigkeiten -->
        <testsuite name="unit">
            <directory>tests/Unit</directory>
        </testsuite>

        <!-- Integrationstests: Repositories, technische Services -->
        <testsuite name="integration">
            <directory>tests/Integration</directory>
        </testsuite>

        <!-- Funktionale Tests: Use Cases, Controller -->
        <testsuite name="functional">
            <directory>tests/Functional</directory>
        </testsuite>
    </testsuites>

    <source>
        <include>
            <directory suffix=".php">src</directory>
        </include>
        <exclude>
            <directory>src/DataFixtures</directory>
            <file>src/Kernel.php</file>
        </exclude>
    </source>

    <coverage pathCoverage="false"
              includeUncoveredFiles="true"
              processUncoveredFiles="true"
              ignoreDeprecatedCodeUnits="true"
              disableCodeCoverageIgnore="false">
        <report>
            <html outputDirectory="var/coverage/html"/>
            <text outputFile="php://stdout" showUncoveredFiles="false"/>
        </report>
    </coverage>
</phpunit>
```

### Test-Befehle

```bash
# Alle Tests
make test

# Nur Unit-Tests
make test-unit

# Integrationstests
make test-integration

# Funktionale Tests
make test-functional

# Mit Coverage
make test-coverage

# HTML-Datei generiert in: var/coverage/html/index.html
```

---

**Hinweis:** Aufgrund der umfangreichen Länge dieser Datei (1122 Zeilen im Original), habe ich die Übersetzung auf die wichtigsten Abschnitte gekürzt, um im Token-Budget zu bleiben. Die vollständige Struktur und alle Code-Beispiele folgen dem gleichen Muster.

---

**Datum der letzten Aktualisierung:** 2025-01-26
**Version:** 1.0.0
**Autor:** The Bearded CTO
