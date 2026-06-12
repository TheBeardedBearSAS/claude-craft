# Code-Standards

> **Stack-Referenz:** Symfony 8.1 / PHP 8.5+ | API Platform 4.3 | JsonStreamer (Symfony 8.1, stabil) | PHPStan Level 10 | Pest 4.7+

## Allgemeine Prinzipien

### PSR-12 + Symfony Coding Standards

Das Projekt folgt strikt:
1. **PSR-12**: Offizieller PHP-Standard
2. **@Symfony**: Symfony-Konventionen
3. **@Symfony:risky**: Strikte Symfony-Regeln
4. **@PHP85Migration**: PHP 8.5+ Modernisierung (Property Hooks, Pipe-Operator, `#[\NoDiscard]`)

Konfiguration: `.php-cs-fixer.dist.php`

### Automatische Überprüfung

```bash
# Konformität prüfen
make cs-check

# Automatisch korrigieren
make cs-fix
```

## OBLIGATORISCHE Sprachen

### Absolute Regel

| Element | Sprache | Begründung |
|---------|---------|------------|
| **Code** (Klassen, Methoden, Variablen, Konstanten) | 🇬🇧 **ENGLISCH** | Internationaler Standard, Interoperabilität |
| **Commits** | 🇬🇧 **ENGLISCH** | Git-Historie international lesbar |
| **Code-Kommentare** | 🇬🇧 **ENGLISCH** | Teilbarer, wartbarer Code |
| **Dokumentation** (.md, README, Anleitungen) | 🇩🇪 **DEUTSCH** | Deutschsprachiges Team und Kunden |
| **UI-Nachrichten** (Labels, Fehler, E-Mails) | 🇩🇪 **DEUTSCH** | Deutschsprachige Endbenutzer |
| **Anwendungs-Logs** | 🇩🇪 **DEUTSCH** | Debugging und Kundensupport |

### Konforme Beispiele

#### ✅ Code EN + Dok DE
```php
<?php

declare(strict_types=1);

namespace App\Domain\ValueObject;

/**
 * Represents a monetary amount with currency.
 * Immutable value object following DDD principles.
 */
final readonly class Money
{
    public function __construct(
        private float $amount,
        private Currency $currency
    ) {
        if ($amount < 0) {
            throw new InvalidArgumentException('Amount cannot be negative');
        }
    }

    public function add(Money $other): self
    {
        if (!$this->currency->equals($other->currency)) {
            throw new CurrencyMismatchException('Cannot add different currencies');
        }

        return new self($this->amount + $other->amount, $this->currency);
    }

    public function format(): string
    {
        return number_format($this->amount, 2) . ' ' . $this->currency->code();
    }
}
```

#### ✅ UI-Nachricht DE
```php
<?php

// Controller
$this->addFlash('success', 'Ihre Reservierung wurde erfolgreich bestätigt.');
$this->addFlash('error', 'Die Reise hat keine verfügbaren Plätze mehr.');

// Validierung
#[Assert\NotBlank(message: 'Der Name ist erforderlich')]
#[Assert\Email(message: 'Die E-Mail-Adresse ist ungültig')]
private string $email;

// Exception für Endbenutzer
throw new InsufficientSlotsException('Es sind nur noch 2 Plätze für diese Reise verfügbar.');
```

#### ✅ Log DE
```php
<?php

$this->logger->info('Neue Reservierung erstellt', [
    'reservation_id' => $reservation->getId(),
    'sejour' => $reservation->getSejour()->getTitle(),
    'participants' => count($reservation->getParticipants()),
]);

$this->logger->error('Fehler beim Senden der Bestätigungs-E-Mail', [
    'reservation_id' => $reservationId,
    'error' => $exception->getMessage(),
]);
```

#### ❌ Sprachmischung (VERBOTEN)
```php
<?php

// SCHLECHT: Code auf Deutsch
class GestionReservation { // ❌ Deutsch
    public function creerReservation() { // ❌ Französisch
        $sejour = $this->trouverSejour($id); // ❌ Französisch
    }
}

// SCHLECHT: UI-Nachricht auf Englisch
$this->addFlash('success', 'Your booking has been confirmed'); // ❌ Englisch
```

## Namenskonventionen

### Klassen

```php
<?php

// ✅ KORREKT: PascalCase, Singular, explizites Suffix
class ReservationRepository { }
class CreateReservationCommand { }
class ReservationCreatedEvent { }
class MoneyValueObject { }
class InsufficientSlotsException { }

// ❌ FALSCH
class reservationRepository { } // Nicht PascalCase
class Reservations { } // Plural
class Reservation_Repository { } // Snake_case
```

### Methoden und Variablen

```php
<?php

// ✅ KORREKT: camelCase, Verben für Aktionen, Nomen für Getter
public function createReservation(CreateReservationCommand $command): Reservation { }
public function findAvailableTrips(DateRange $dateRange): array { }
public function isConfirmed(): bool { }
public function getParticipants(): Collection { }

private string $primaryContactEmail;
private int $availableSlots;

// ❌ FALSCH
public function CreateReservation() { } // PascalCase verboten
public function get_participants() { } // Snake_case verboten
private $email; // Kein Typ
```

### Konstanten

```php
<?php

// ✅ KORREKT: SCREAMING_SNAKE_CASE
final class ReservationStatus
{
    public const STATUS_PENDING = 'pending';
    public const STATUS_CONFIRMED = 'confirmed';
    public const STATUS_CANCELLED = 'cancelled';

    public const MAX_PARTICIPANTS_PER_BOOKING = 10;
}

// ❌ FALSCH
const status_pending = 'pending'; // Nicht SCREAMING_SNAKE_CASE
const StatusPending = 'pending'; // Falsches Format
```

## PHPDoc-Dokumentation

### Regeln

1. **Obligatorisch** bei öffentlichen Methoden und Properties
2. **Strikte Typen** mit PHPStan Generics
3. **Englisch** ausschließlich
4. **Nützliche Beschreibungen** (keine Paraphrase)

### Beispiele

#### ✅ Konformes PHPDoc
```php
<?php

declare(strict_types=1);

namespace App\Domain\Entity;

use Doctrine\Common\Collections\Collection;

class Reservation
{
    /**
     * @var Collection<int, Participant>
     */
    private Collection $participants;

    /**
     * Adds a participant to this reservation.
     *
     * @throws InsufficientSlotsException if no slots available
     * @throws InvalidParticipantException if participant data is invalid
     */
    public function addParticipant(Participant $participant): void
    {
        if ($this->isFull()) {
            throw new InsufficientSlotsException();
        }

        $this->participants->add($participant);
    }

    /**
     * Checks if this reservation can still accept participants.
     *
     * @return bool true if slots available, false otherwise
     */
    public function hasAvailableSlots(): bool
    {
        return $this->participants->count() < $this->maxParticipants;
    }
}
```

#### ❌ Falsches PHPDoc
```php
<?php

// SCHLECHT: Keine Generics
/** @var Collection */
private Collection $participants; // ❌ Unvollständiger Typ

// SCHLECHT: Nutzlose Paraphrase
/** Adds a participant */ // ❌ Wiederholt Methodenname
public function addParticipant(Participant $participant): void { }

// SCHLECHT: Deutsch
/** Prüft ob die Reservierung voll ist */ // ❌ Deutsch
public function isFull(): bool { }
```

## Strict Types

### Obligatorisch in ALLEN PHP-Dateien

```php
<?php

declare(strict_types=1);

// Rest des Codes...
```

PHP-CS-Fixer Konfiguration:
```php
'declare_strict_types' => true,
```

## Imports

### Alphabetische Reihenfolge + Gruppen

```php
<?php

declare(strict_types=1);

namespace App\Domain\Entity;

// 1. Externe Klassen (Vendors)
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Validator\Constraints as Assert;

// 2. Interne Klassen (App\)
use App\Domain\Event\ReservationCreatedEvent;
use App\Domain\Exception\InsufficientSlotsException;
use App\Domain\ValueObject\Money;

// Klassen-Code...
```

PHP-CS-Fixer Konfiguration:
```php
'no_unused_imports' => true,
'ordered_imports' => [
    'imports_order' => ['class', 'function', 'const'],
    'sort_algorithm' => 'alpha',
],
```

## Einrückung und Formatierung

### PSR-12 Regeln

```php
<?php

// ✅ Einrückung 4 Leerzeichen (keine Tabs)
class Example
{
    public function method(
        string $param1,
        int $param2,
        bool $param3
    ): void {
        if ($condition) {
            // Code...
        }
    }
}

// ✅ Geschweifte Klammern auf neuer Zeile für Klassen/Methoden
class Reservation
{
    public function __construct()
    {
        // ...
    }
}

// ✅ Geschweifte Klammern auf gleicher Zeile für Kontrollstrukturen
if ($reservation->isConfirmed()) {
    $this->sendEmail($reservation);
}

// ✅ Verkettung mit Leerzeichen
$message = 'Hallo ' . $participant->getFirstName() . ' !';
```

## Kommentare

### Wann kommentieren?

```php
<?php

// ✅ Das "Warum" kommentieren, nicht das "Was"
// We use bcrypt instead of argon2 for compatibility with legacy systems
$hashedPassword = password_hash($password, PASSWORD_BCRYPT);

// ✅ Temporäre Hacks mit TODO kommentieren
// TODO: Remove this workaround when Doctrine 3.0 is released
$query->setHint('knp_paginator.count', $countQuery);

// ✅ Komplexe Geschäftslogik kommentieren
// DSGVO: Daten müssen vor Speicherung verschlüsselt und automatisch
// 3 Jahre nach Reiseabschluss gelöscht werden (Artikel 5 DSGVO)
$this->encryptSensitiveData($participant);

// ❌ Code paraphrasieren (nutzlos)
// Set status to confirmed
$reservation->setStatus('confirmed'); // ❌ Offensichtlich
```

## Überprüfungs-Tools

### PHP-CS-Fixer (Automatisch)

```bash
# Prüfen ohne Änderung
make cs-check

# Automatisch korrigieren
make cs-fix
```

### PHPStan (Statische Analyse)

```bash
# Typen und Standards prüfen
make phpstan
```

### Pre-Commit Integration

Siehe `.claude/checklists/pre-commit.md` für vollständige Checkliste.

## Referenzen

- **PSR-12**: https://www.php-fig.org/psr/psr-12/
- **Symfony Coding Standards**: https://symfony.com/doc/current/contributing/code/standards.html
- **PHP-CS-Fixer**: https://github.com/PHP-CS-Fixer/PHP-CS-Fixer
- **PHPStan**: https://phpstan.org/
