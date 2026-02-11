# Exemples de Value Objects - Atoll Tourisme

## Vue d'ensemble

Ce document présente des **implémentations complètes** de Value Objects pour le projet Atoll Tourisme.

> **Références:**
> - `.claude/rules/13-ddd-patterns.md` - Patterns DDD
> - `.claude/rules/02-architecture-clean-ddd.md` - Architecture
> - `.claude/examples/clean-architecture-structure.md` - Structure complète

---

## Table des matières

1. [Principes des Value Objects](#principes-des-value-objects)
2. [Money (Argent)](#money-argent)
3. [Email](#email)
4. [PhoneNumber (Téléphone français)](#phonenumber-téléphone-français)
5. [DateRange (Période)](#daterange-période)
6. [PersonName (Nom de personne)](#personname-nom-de-personne)
7. [PostalAddress (Adresse postale)](#postaladdress-adresse-postale)
8. [SlugValue (URL SEO)](#slugvalue-url-seo)
9. [ReservationId (Identity VO)](#reservationid-identity-vo)
10. [ReservationStatus (Enum VO)](#reservationstatus-enum-vo)

---

## Principes des Value Objects

### Caractéristiques obligatoires

1. **Immutabilité:** `readonly` class ou propriétés `private readonly`
2. **Validation:** Dans le constructeur (throw exception si invalide)
3. **Égalité par valeur:** Méthode `equals()`
4. **Named constructors:** Méthodes statiques `fromString()`, `fromInt()`, etc.
5. **Pas d'identité:** Pas de `$id`
6. **Remplaçable:** Créer nouveau VO au lieu de modifier

### Template de base

```php
<?php

declare(strict_types=1);

namespace App\Domain\Shared\ValueObject;

final readonly class ExampleValueObject
{
    private function __construct(
        private string $value,
    ) {
        $this->validate($value);
    }

    public static function fromString(string $value): self
    {
        return new self($value);
    }

    private function validate(string $value): void
    {
        if (empty($value)) {
            throw new \InvalidArgumentException('Value cannot be empty');
        }
    }

    public function equals(self $other): bool
    {
        return $this->value === $other->value;
    }

    public function getValue(): string
    {
        return $this->value;
    }

    public function __toString(): string
    {
        return $this->value;
    }
}
```

---

## Money (Argent)

**Localisation:** `src/Domain/Reservation/ValueObject/Money.php`

**Usage:** Montants monétaires avec précision (centimes).

**Règles:**
- Stockage en centimes (int) pour éviter les erreurs de float
- Immutable
- Opérations mathématiques retournent nouveau Money

```php
<?php

declare(strict_types=1);

namespace App\Domain\Reservation\ValueObject;

final readonly class Money
{
    private function __construct(
        private int $amountCents,
        private string $currency = 'EUR',
    ) {
        if ($amountCents < 0) {
            throw new \InvalidArgumentException('Amount cannot be negative');
        }

        if (empty($currency) || strlen($currency) !== 3) {
            throw new \InvalidArgumentException('Currency must be 3 characters (ISO 4217)');
        }
    }

    public static function fromEuros(float $amount): self
    {
        if ($amount < 0) {
            throw new \InvalidArgumentException('Amount cannot be negative');
        }

        return new self((int) round($amount * 100), 'EUR');
    }

    public static function fromCents(int $cents, string $currency = 'EUR'): self
    {
        return new self($cents, $currency);
    }

    public static function zero(string $currency = 'EUR'): self
    {
        return new self(0, $currency);
    }

    public function add(self $other): self
    {
        $this->ensureSameCurrency($other);

        return new self($this->amountCents + $other->amountCents, $this->currency);
    }

    public function subtract(self $other): self
    {
        $this->ensureSameCurrency($other);

        $result = $this->amountCents - $other->amountCents;

        if ($result < 0) {
            throw new \InvalidArgumentException('Subtraction would result in negative amount');
        }

        return new self($result, $this->currency);
    }

    public function multiply(float $multiplier): self
    {
        if ($multiplier < 0) {
            throw new \InvalidArgumentException('Multiplier cannot be negative');
        }

        return new self((int) round($this->amountCents * $multiplier), $this->currency);
    }

    public function divide(int $divisor): self
    {
        if ($divisor <= 0) {
            throw new \InvalidArgumentException('Divisor must be positive');
        }

        return new self((int) round($this->amountCents / $divisor), $this->currency);
    }

    public function isPositive(): bool
    {
        return $this->amountCents > 0;
    }

    public function isZero(): bool
    {
        return $this->amountCents === 0;
    }

    public function isGreaterThan(self $other): bool
    {
        $this->ensureSameCurrency($other);

        return $this->amountCents > $other->amountCents;
    }

    public function isGreaterThanOrEqual(self $other): bool
    {
        $this->ensureSameCurrency($other);

        return $this->amountCents >= $other->amountCents;
    }

    public function isLessThan(self $other): bool
    {
        $this->ensureSameCurrency($other);

        return $this->amountCents < $other->amountCents;
    }

    public function equals(self $other): bool
    {
        return $this->amountCents === $other->amountCents
            && $this->currency === $other->currency;
    }

    public function getAmountEuros(): float
    {
        return $this->amountCents / 100;
    }

    public function getAmountCents(): int
    {
        return $this->amountCents;
    }

    public function getCurrency(): string
    {
        return $this->currency;
    }

    private function ensureSameCurrency(self $other): void
    {
        if ($this->currency !== $other->currency) {
            throw new \InvalidArgumentException(
                sprintf('Currency mismatch: %s vs %s', $this->currency, $other->currency)
            );
        }
    }

    public function __toString(): string
    {
        return sprintf('%.2f %s', $this->getAmountEuros(), $this->currency);
    }
}
```

**Exemples d'utilisation:**

```php
// Création
$price = Money::fromEuros(149.99);
$discount = Money::fromEuros(15.00);

// Opérations
$total = $price->subtract($discount); // 134.99 EUR

// Calcul remise 10%
$discounted = $total->multiply(0.9); // 121.49 EUR

// Comparaison
if ($total->isGreaterThan(Money::fromEuros(100))) {
    // Offre spéciale
}

// Division (prix par participant)
$pricePerPerson = $total->divide(4); // 33.72 EUR
```

---

## Email

**Localisation:** `src/Domain/Shared/ValueObject/Email.php`

**Usage:** Adresse email avec validation.

```php
<?php

declare(strict_types=1);

namespace App\Domain\Shared\ValueObject;

final readonly class Email
{
    private function __construct(
        private string $value,
    ) {
        if (!filter_var($value, FILTER_VALIDATE_EMAIL)) {
            throw new \InvalidArgumentException(
                sprintf('Invalid email address: %s', $value)
            );
        }

        // Validation supplémentaire: longueur
        if (strlen($value) > 255) {
            throw new \InvalidArgumentException('Email address too long (max 255 characters)');
        }
    }

    public static function fromString(string $email): self
    {
        // Normalisation: lowercase + trim
        return new self(strtolower(trim($email)));
    }

    public function getValue(): string
    {
        return $this->value;
    }

    public function equals(self $other): bool
    {
        return $this->value === $other->value;
    }

    public function getDomain(): string
    {
        return explode('@', $this->value)[1];
    }

    public function getLocalPart(): string
    {
        return explode('@', $this->value)[0];
    }

    public function __toString(): string
    {
        return $this->value;
    }
}
```

**Exemples d'utilisation:**

```php
$email = Email::fromString('  Contact@Example.COM  ');
echo $email->getValue(); // contact@example.com
echo $email->getDomain(); // example.com
echo $email->getLocalPart(); // contact

$email2 = Email::fromString('contact@example.com');
$email->equals($email2); // true (normalisé)
```

---

## PhoneNumber (Téléphone français)

**Localisation:** `src/Domain/Shared/ValueObject/PhoneNumber.php`

**Usage:** Numéro de téléphone français (mobile ou fixe).

**Formats acceptés:**
- `0612345678` (mobile)
- `0143567890` (fixe)
- `+33612345678` (international)
- `06 12 34 56 78` (espaces)

```php
<?php

declare(strict_types=1);

namespace App\Domain\Shared\ValueObject;

final readonly class PhoneNumber
{
    private const PATTERN_FR = '/^(?:(?:\+|00)33|0)[1-9](?:[0-9]{8})$/';

    private function __construct(
        private string $value,
    ) {
        $this->validate($value);
    }

    public static function fromString(string $phone): self
    {
        // Normalisation: supprime espaces, points, tirets
        $normalized = preg_replace('/[\s\.\-]/', '', trim($phone));

        return new self($normalized);
    }

    private function validate(string $value): void
    {
        if (!preg_match(self::PATTERN_FR, $value)) {
            throw new \InvalidArgumentException(
                sprintf('Invalid French phone number: %s', $value)
            );
        }
    }

    public function getValue(): string
    {
        return $this->value;
    }

    public function equals(self $other): bool
    {
        return $this->value === $other->value;
    }

    /**
     * Format: +33 6 12 34 56 78
     */
    public function toInternationalFormat(): string
    {
        $number = $this->value;

        // Convertir vers format international
        if (str_starts_with($number, '0')) {
            $number = '+33' . substr($number, 1);
        } elseif (str_starts_with($number, '00')) {
            $number = '+' . substr($number, 2);
        }

        // Formater avec espaces
        return preg_replace('/(\+33)([1-9])(\d{2})(\d{2})(\d{2})(\d{2})/', '$1 $2 $3 $4 $5 $6', $number);
    }

    /**
     * Format: 06 12 34 56 78
     */
    public function toNationalFormat(): string
    {
        $number = $this->value;

        // Convertir vers format national
        if (str_starts_with($number, '+33')) {
            $number = '0' . substr($number, 3);
        } elseif (str_starts_with($number, '0033')) {
            $number = '0' . substr($number, 4);
        }

        // Formater avec espaces
        return preg_replace('/(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/', '$1 $2 $3 $4 $5', $number);
    }

    public function isMobile(): bool
    {
        $number = $this->value;

        // Convertir vers format national
        if (str_starts_with($number, '+33')) {
            $number = '0' . substr($number, 3);
        } elseif (str_starts_with($number, '0033')) {
            $number = '0' . substr($number, 4);
        }

        // Mobile: 06 ou 07
        return str_starts_with($number, '06') || str_starts_with($number, '07');
    }

    public function __toString(): string
    {
        return $this->toNationalFormat();
    }
}
```

**Exemples d'utilisation:**

```php
$phone = PhoneNumber::fromString('06 12 34 56 78');
echo $phone->getValue(); // 0612345678
echo $phone->toNationalFormat(); // 06 12 34 56 78
echo $phone->toInternationalFormat(); // +33 6 12 34 56 78
$phone->isMobile(); // true

$phone2 = PhoneNumber::fromString('+33143567890');
$phone2->isMobile(); // false (fixe: 01)
```

---

## DateRange (Période)

**Localisation:** `src/Domain/Catalog/ValueObject/DateRange.php`

**Usage:** Période avec date début et fin (séjour, réservation).

```php
<?php

declare(strict_types=1);

namespace App\Domain\Catalog\ValueObject;

final readonly class DateRange
{
    private function __construct(
        private \DateTimeImmutable $start,
        private \DateTimeImmutable $end,
    ) {
        if ($start >= $end) {
            throw new \InvalidArgumentException(
                sprintf('Start date (%s) must be before end date (%s)',
                    $start->format('Y-m-d'),
                    $end->format('Y-m-d')
                )
            );
        }
    }

    public static function fromDates(
        \DateTimeImmutable $start,
        \DateTimeImmutable $end
    ): self {
        return new self($start, $end);
    }

    public static function fromStrings(string $start, string $end): self
    {
        try {
            $startDate = new \DateTimeImmutable($start);
            $endDate = new \DateTimeImmutable($end);
        } catch (\Exception $e) {
            throw new \InvalidArgumentException('Invalid date format', 0, $e);
        }

        return new self($startDate, $endDate);
    }

    /**
     * Create a range of N days starting from a date
     */
    public static function fromStartAndDuration(\DateTimeImmutable $start, int $days): self
    {
        if ($days <= 0) {
            throw new \InvalidArgumentException('Duration must be positive');
        }

        $end = $start->modify(sprintf('+%d days', $days));

        return new self($start, $end);
    }

    public function getStart(): \DateTimeImmutable
    {
        return $this->start;
    }

    public function getEnd(): \DateTimeImmutable
    {
        return $this->end;
    }

    public function getDurationDays(): int
    {
        return (int) $this->start->diff($this->end)->days;
    }

    public function contains(\DateTimeImmutable $date): bool
    {
        return $date >= $this->start && $date <= $this->end;
    }

    public function overlaps(self $other): bool
    {
        return $this->start < $other->end && $other->start < $this->end;
    }

    public function isInFuture(): bool
    {
        return $this->start > new \DateTimeImmutable();
    }

    public function isInPast(): bool
    {
        return $this->end < new \DateTimeImmutable();
    }

    public function isCurrent(): bool
    {
        $now = new \DateTimeImmutable();

        return $this->contains($now);
    }

    public function equals(self $other): bool
    {
        return $this->start == $other->start && $this->end == $other->end;
    }

    public function __toString(): string
    {
        return sprintf(
            'Du %s au %s (%d jours)',
            $this->start->format('d/m/Y'),
            $this->end->format('d/m/Y'),
            $this->getDurationDays()
        );
    }
}
```

**Exemples d'utilisation:**

```php
// Créer un séjour du 15 au 22 juillet 2025
$period = DateRange::fromStrings('2025-07-15', '2025-07-22');
echo $period->getDurationDays(); // 7

// Vérifier si une date est dans la période
$checkDate = new \DateTimeImmutable('2025-07-18');
$period->contains($checkDate); // true

// Vérifier chevauchement de périodes
$otherPeriod = DateRange::fromStrings('2025-07-20', '2025-07-27');
$period->overlaps($otherPeriod); // true

// Créer période de 7 jours
$week = DateRange::fromStartAndDuration(new \DateTimeImmutable('2025-07-15'), 7);
```

---

## PersonName (Nom de personne)

**Localisation:** `src/Domain/Shared/ValueObject/PersonName.php`

**Usage:** Nom complet (prénom + nom de famille).

```php
<?php

declare(strict_types=1);

namespace App\Domain\Shared\ValueObject;

final readonly class PersonName
{
    private function __construct(
        private string $firstName,
        private string $lastName,
    ) {
        $this->validate($firstName, $lastName);
    }

    public static function fromParts(string $firstName, string $lastName): self
    {
        return new self(
            ucfirst(strtolower(trim($firstName))),
            strtoupper(trim($lastName))
        );
    }

    public static function fromFullName(string $fullName): self
    {
        $parts = explode(' ', trim($fullName), 2);

        if (count($parts) !== 2) {
            throw new \InvalidArgumentException('Full name must contain first and last name');
        }

        return self::fromParts($parts[0], $parts[1]);
    }

    private function validate(string $firstName, string $lastName): void
    {
        if (empty($firstName)) {
            throw new \InvalidArgumentException('First name cannot be empty');
        }

        if (empty($lastName)) {
            throw new \InvalidArgumentException('Last name cannot be empty');
        }

        if (strlen($firstName) > 100 || strlen($lastName) > 100) {
            throw new \InvalidArgumentException('Name too long (max 100 characters each)');
        }
    }

    public function getFirstName(): string
    {
        return $this->firstName;
    }

    public function getLastName(): string
    {
        return $this->lastName;
    }

    public function getFullName(): string
    {
        return sprintf('%s %s', $this->firstName, $this->lastName);
    }

    public function getFullNameReversed(): string
    {
        return sprintf('%s %s', $this->lastName, $this->firstName);
    }

    public function equals(self $other): bool
    {
        return $this->firstName === $other->firstName
            && $this->lastName === $other->lastName;
    }

    public function __toString(): string
    {
        return $this->getFullName();
    }
}
```

**Exemples d'utilisation:**

```php
$name = PersonName::fromParts('Jean', 'Dupont');
echo $name->getFullName(); // Jean DUPONT
echo $name->getFullNameReversed(); // DUPONT Jean

$name2 = PersonName::fromFullName('Marie Martin');
echo $name2->getFirstName(); // Marie
echo $name2->getLastName(); // MARTIN
```

---

## PostalAddress (Adresse postale)

**Localisation:** `src/Domain/Shared/ValueObject/PostalAddress.php`

**Usage:** Adresse postale complète.

```php
<?php

declare(strict_types=1);

namespace App\Domain\Shared\ValueObject;

final readonly class PostalAddress
{
    private function __construct(
        private string $street,
        private string $postalCode,
        private string $city,
        private string $country = 'France',
    ) {
        $this->validate();
    }

    public static function create(
        string $street,
        string $postalCode,
        string $city,
        string $country = 'France'
    ): self {
        return new self(
            trim($street),
            trim($postalCode),
            ucwords(strtolower(trim($city))),
            ucfirst(strtolower(trim($country)))
        );
    }

    private function validate(): void
    {
        if (empty($this->street)) {
            throw new \InvalidArgumentException('Street cannot be empty');
        }

        if (empty($this->postalCode)) {
            throw new \InvalidArgumentException('Postal code cannot be empty');
        }

        if (empty($this->city)) {
            throw new \InvalidArgumentException('City cannot be empty');
        }

        // Validation code postal français (5 chiffres)
        if ($this->country === 'France' && !preg_match('/^\d{5}$/', $this->postalCode)) {
            throw new \InvalidArgumentException(
                sprintf('Invalid French postal code: %s', $this->postalCode)
            );
        }
    }

    public function getStreet(): string
    {
        return $this->street;
    }

    public function getPostalCode(): string
    {
        return $this->postalCode;
    }

    public function getCity(): string
    {
        return $this->city;
    }

    public function getCountry(): string
    {
        return $this->country;
    }

    public function getFullAddress(): string
    {
        return sprintf(
            "%s\n%s %s\n%s",
            $this->street,
            $this->postalCode,
            $this->city,
            $this->country
        );
    }

    public function equals(self $other): bool
    {
        return $this->street === $other->street
            && $this->postalCode === $other->postalCode
            && $this->city === $other->city
            && $this->country === $other->country;
    }

    public function __toString(): string
    {
        return $this->getFullAddress();
    }
}
```

**Exemples d'utilisation:**

```php
$address = PostalAddress::create(
    '123 Rue de la Paix',
    '75002',
    'Paris'
);

echo $address->getFullAddress();
// 123 Rue de la Paix
// 75002 Paris
// France
```

---

## SlugValue (URL SEO)

**Localisation:** `src/Domain/Catalog/ValueObject/SlugValue.php`

**Usage:** URL SEO-friendly pour séjours.

```php
<?php

declare(strict_types=1);

namespace App\Domain\Catalog\ValueObject;

final readonly class SlugValue
{
    private const PATTERN = '/^[a-z0-9]+(?:-[a-z0-9]+)*$/';

    private function __construct(
        private string $value,
    ) {
        $this->validate($value);
    }

    public static function fromString(string $slug): self
    {
        $normalized = self::normalize($slug);

        return new self($normalized);
    }

    public static function fromTitle(string $title): self
    {
        $slug = self::slugify($title);

        return new self($slug);
    }

    private static function normalize(string $value): string
    {
        return strtolower(trim($value));
    }

    private static function slugify(string $text): string
    {
        // Translitération des caractères accentués
        $text = iconv('UTF-8', 'ASCII//TRANSLIT//IGNORE', $text);

        // Lowercase
        $text = strtolower($text);

        // Remplace espaces et caractères spéciaux par des tirets
        $text = preg_replace('/[^a-z0-9]+/', '-', $text);

        // Supprime tirets multiples
        $text = preg_replace('/-+/', '-', $text);

        // Supprime tirets en début/fin
        return trim($text, '-');
    }

    private function validate(string $value): void
    {
        if (empty($value)) {
            throw new \InvalidArgumentException('Slug cannot be empty');
        }

        if (!preg_match(self::PATTERN, $value)) {
            throw new \InvalidArgumentException(
                sprintf('Invalid slug format: %s (must be lowercase alphanumeric with hyphens)', $value)
            );
        }

        if (strlen($value) > 255) {
            throw new \InvalidArgumentException('Slug too long (max 255 characters)');
        }
    }

    public function getValue(): string
    {
        return $this->value;
    }

    public function equals(self $other): bool
    {
        return $this->value === $other->value;
    }

    public function __toString(): string
    {
        return $this->value;
    }
}
```

**Exemples d'utilisation:**

```php
// Depuis un titre
$slug = SlugValue::fromTitle('Séjour Ski à Chamonix - Février 2025');
echo $slug->getValue(); // sejour-ski-a-chamonix-fevrier-2025

// Depuis un slug existant
$slug2 = SlugValue::fromString('sejour-ski-a-chamonix-fevrier-2025');
$slug->equals($slug2); // true
```

---

## ReservationId (Identity VO)

**Localisation:** `src/Domain/Reservation/ValueObject/ReservationId.php`

**Usage:** Identifiant unique de réservation (UUID).

```php
<?php

declare(strict_types=1);

namespace App\Domain\Reservation\ValueObject;

use Symfony\Component\Uid\Uuid;

final readonly class ReservationId
{
    private function __construct(
        private string $value,
    ) {
        if (!Uuid::isValid($value)) {
            throw new \InvalidArgumentException(
                sprintf('Invalid UUID format: %s', $value)
            );
        }
    }

    public static function generate(): self
    {
        return new self(Uuid::v4()->toRfc4122());
    }

    public static function fromString(string $id): self
    {
        return new self($id);
    }

    public function getValue(): string
    {
        return $this->value;
    }

    public function equals(self $other): bool
    {
        return $this->value === $other->value;
    }

    public function __toString(): string
    {
        return $this->value;
    }
}
```

**Exemples d'utilisation:**

```php
// Générer nouvel ID
$id = ReservationId::generate();
echo $id->getValue(); // 550e8400-e29b-41d4-a716-446655440000

// Depuis string existant
$id2 = ReservationId::fromString('550e8400-e29b-41d4-a716-446655440000');
$id->equals($id2); // true
```

---

## ReservationStatus (Enum VO)

**Localisation:** `src/Domain/Reservation/ValueObject/ReservationStatus.php`

**Usage:** Statut de réservation (EN_ATTENTE, CONFIRMEE, ANNULEE, TERMINEE).

```php
<?php

declare(strict_types=1);

namespace App\Domain\Reservation\ValueObject;

enum ReservationStatus: string
{
    case EN_ATTENTE = 'en_attente';
    case CONFIRMEE = 'confirmee';
    case ANNULEE = 'annulee';
    case TERMINEE = 'terminee';

    public function isConfirmed(): bool
    {
        return $this === self::CONFIRMEE;
    }

    public function isPending(): bool
    {
        return $this === self::EN_ATTENTE;
    }

    public function isCancelled(): bool
    {
        return $this === self::ANNULEE;
    }

    public function isCompleted(): bool
    {
        return $this === self::TERMINEE;
    }

    public function canBeConfirmed(): bool
    {
        return $this === self::EN_ATTENTE;
    }

    public function canBeCancelled(): bool
    {
        return $this === self::EN_ATTENTE || $this === self::CONFIRMEE;
    }

    public function getLabel(): string
    {
        return match ($this) {
            self::EN_ATTENTE => 'En attente de confirmation',
            self::CONFIRMEE => 'Confirmée',
            self::ANNULEE => 'Annulée',
            self::TERMINEE => 'Terminée',
        };
    }

    public function getBadgeColor(): string
    {
        return match ($this) {
            self::EN_ATTENTE => 'warning',
            self::CONFIRMEE => 'success',
            self::ANNULEE => 'danger',
            self::TERMINEE => 'secondary',
        };
    }
}
```

**Exemples d'utilisation:**

```php
$status = ReservationStatus::EN_ATTENTE;

echo $status->value; // 'en_attente'
echo $status->getLabel(); // 'En attente de confirmation'
echo $status->getBadgeColor(); // 'warning'

$status->canBeConfirmed(); // true
$status->canBeCancelled(); // true

// Transition
if ($status->canBeConfirmed()) {
    $status = ReservationStatus::CONFIRMEE;
}
```

---

## Checklist Value Object

Avant de créer un nouveau Value Object:

- [ ] **Immutable:** Classe `readonly` ou propriétés `readonly`
- [ ] **Validation:** Dans constructeur privé
- [ ] **Named constructor:** `fromString()`, `fromInt()`, etc.
- [ ] **Equals:** Méthode `equals(self $other): bool`
- [ ] **ToString:** Méthode `__toString(): string`
- [ ] **Tests unitaires:** 100% couverture (TDD)
- [ ] **PHPStan:** Niveau max sans erreur
- [ ] **Documentation:** Exemples d'utilisation

---

**Date de création:** 2025-11-26
**Version:** 1.0.0
**Auteur:** The Bearded CTO
