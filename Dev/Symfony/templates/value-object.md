# Template: Value Object (DDD)

> **Pattern DDD** - Objet immuable représentant une valeur métier
> Référence: `.claude/rules/01-architecture-ddd.md`

## Caractéristiques d'un Value Object

- ✅ **Immuable** (readonly class, pas de setters)
- ✅ **Validation dans le constructeur**
- ✅ **Égalité par valeur** (méthode `equals()`)
- ✅ **Pas d'identité propre** (pas d'ID)
- ✅ **Auto-suffisant** (contient toute sa logique métier)

---

## Template PHP 8.2+

```php
<?php

declare(strict_types=1);

namespace App\Domain\ValueObject;

use InvalidArgumentException;

/**
 * Value Object: [NomValueObject]
 *
 * Représente: [Description métier]
 *
 * Exemples:
 * - new [NomValueObject]([valeur_valide])
 * - new [NomValueObject]([autre_valeur_valide])
 *
 * @see https://martinfowler.com/bliki/ValueObject.html
 */
final readonly class [NomValueObject]
{
    /**
     * @throws InvalidArgumentException Si la valeur est invalide
     */
    private function __construct(
        private [type] $value
    ) {
        $this->validate();
    }

    /**
     * Factory method: création depuis [source]
     */
    public static function fromString(string $value): self
    {
        return new self($value);
    }

    /**
     * Factory method: création depuis [autre source]
     */
    public static function from[Type]([type] $value): self
    {
        return new self($value);
    }

    /**
     * Validation métier
     *
     * @throws InvalidArgumentException
     */
    private function validate(): void
    {
        if (/* condition invalide */) {
            throw new InvalidArgumentException(
                sprintf('[Message erreur]: %s', $this->value)
            );
        }
    }

    /**
     * Égalité par valeur
     */
    public function equals(self $other): bool
    {
        return $this->value === $other->value;
    }

    /**
     * Conversion en type primitif
     */
    public function toString(): string
    {
        return (string) $this->value;
    }

    public function toInt(): int
    {
        return (int) $this->value;
    }

    public function toFloat(): float
    {
        return (float) $this->value;
    }

    /**
     * Représentation string (pour debug)
     */
    public function __toString(): string
    {
        return $this->toString();
    }

    /**
     * Getter de la valeur brute
     */
    public function value(): [type]
    {
        return $this->value;
    }
}
```

---

## Exemples concrets Atoll Tourisme

### 1. Money - Montant en euros

```php
<?php

declare(strict_types=1);

namespace App\Domain\ValueObject;

use InvalidArgumentException;

/**
 * Value Object: Money (Montant monétaire en EUR)
 *
 * Représente un montant en euros avec validation métier.
 * Évite les erreurs de manipulation d'argent (float precision).
 *
 * Exemples:
 * - Money::fromEuros(1299.99) → Séjour Guadeloupe
 * - Money::fromCents(129999) → Même montant en centimes
 */
final readonly class Money
{
    private const CURRENCY = 'EUR';
    private const MIN_CENTS = 0;
    private const MAX_CENTS = 99999999; // 999 999,99 EUR

    /**
     * @param int $cents Montant en centimes (pour éviter les erreurs de float)
     */
    private function __construct(
        private int $cents
    ) {
        $this->validate();
    }

    public static function fromEuros(float $euros): self
    {
        $cents = (int) round($euros * 100);
        return new self($cents);
    }

    public static function fromCents(int $cents): self
    {
        return new self($cents);
    }

    public static function zero(): self
    {
        return new self(0);
    }

    private function validate(): void
    {
        if ($this->cents < self::MIN_CENTS) {
            throw new InvalidArgumentException(
                sprintf('Le montant ne peut pas être négatif: %d centimes', $this->cents)
            );
        }

        if ($this->cents > self::MAX_CENTS) {
            throw new InvalidArgumentException(
                sprintf('Le montant dépasse la limite: %d centimes', $this->cents)
            );
        }
    }

    public function equals(self $other): bool
    {
        return $this->cents === $other->cents;
    }

    public function add(self $other): self
    {
        return new self($this->cents + $other->cents);
    }

    public function subtract(self $other): self
    {
        return new self($this->cents - $other->cents);
    }

    public function multiply(float $factor): self
    {
        return new self((int) round($this->cents * $factor));
    }

    public function isGreaterThan(self $other): bool
    {
        return $this->cents > $other->cents;
    }

    public function isZero(): bool
    {
        return $this->cents === 0;
    }

    public function toEuros(): float
    {
        return $this->cents / 100;
    }

    public function toCents(): int
    {
        return $this->cents;
    }

    public function toString(): string
    {
        return number_format($this->toEuros(), 2, ',', ' ') . ' €';
    }

    public function __toString(): string
    {
        return $this->toString();
    }
}
```

**Tests:**
```php
/** @test */
public function it_creates_money_from_euros(): void
{
    $money = Money::fromEuros(1299.99);

    $this->assertEquals(129999, $money->toCents());
    $this->assertEquals(1299.99, $money->toEuros());
    $this->assertEquals('1 299,99 €', $money->toString());
}

/** @test */
public function it_adds_two_amounts(): void
{
    $sejour = Money::fromEuros(1299.99);
    $assurance = Money::fromEuros(50.00);

    $total = $sejour->add($assurance);

    $this->assertEquals(1349.99, $total->toEuros());
}

/** @test */
public function it_throws_exception_for_negative_amount(): void
{
    $this->expectException(InvalidArgumentException::class);

    Money::fromCents(-100);
}
```

---

### 2. Email - Adresse email validée

```php
<?php

declare(strict_types=1);

namespace App\Domain\ValueObject;

use InvalidArgumentException;

/**
 * Value Object: Email
 *
 * Représente une adresse email validée.
 * Garantit qu'un email est toujours valide dans le domaine.
 */
final readonly class Email
{
    private const PATTERN = '/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/';

    private function __construct(
        private string $value
    ) {
        $this->validate();
    }

    public static function fromString(string $email): self
    {
        return new self(trim(strtolower($email)));
    }

    private function validate(): void
    {
        if (!filter_var($this->value, FILTER_VALIDATE_EMAIL)) {
            throw new InvalidArgumentException(
                sprintf('Adresse email invalide: %s', $this->value)
            );
        }

        if (!preg_match(self::PATTERN, $this->value)) {
            throw new InvalidArgumentException(
                sprintf('Format d\'email non conforme: %s', $this->value)
            );
        }
    }

    public function equals(self $other): bool
    {
        return $this->value === $other->value;
    }

    public function getDomain(): string
    {
        return substr($this->value, strpos($this->value, '@') + 1);
    }

    public function toString(): string
    {
        return $this->value;
    }

    public function __toString(): string
    {
        return $this->toString();
    }
}
```

---

### 3. DateRange - Période de dates

```php
<?php

declare(strict_types=1);

namespace App\Domain\ValueObject;

use DateTimeImmutable;
use InvalidArgumentException;

/**
 * Value Object: DateRange (Période)
 *
 * Représente une période avec date début et fin.
 * Utilisé pour les séjours, les réservations, etc.
 *
 * Exemple:
 * - DateRange::fromDates($debut, $fin) → Séjour du 15/02 au 22/02
 */
final readonly class DateRange
{
    private function __construct(
        private DateTimeImmutable $start,
        private DateTimeImmutable $end
    ) {
        $this->validate();
    }

    public static function fromDates(DateTimeImmutable $start, DateTimeImmutable $end): self
    {
        return new self($start, $end);
    }

    public static function fromStrings(string $start, string $end): self
    {
        return new self(
            new DateTimeImmutable($start),
            new DateTimeImmutable($end)
        );
    }

    private function validate(): void
    {
        if ($this->start >= $this->end) {
            throw new InvalidArgumentException(
                sprintf(
                    'La date de début doit être avant la date de fin: %s >= %s',
                    $this->start->format('Y-m-d'),
                    $this->end->format('Y-m-d')
                )
            );
        }
    }

    public function equals(self $other): bool
    {
        return $this->start == $other->start && $this->end == $other->end;
    }

    public function contains(DateTimeImmutable $date): bool
    {
        return $date >= $this->start && $date <= $this->end;
    }

    public function overlaps(self $other): bool
    {
        return $this->start < $other->end && $other->start < $this->end;
    }

    public function getDurationInDays(): int
    {
        return $this->start->diff($this->end)->days;
    }

    public function start(): DateTimeImmutable
    {
        return $this->start;
    }

    public function end(): DateTimeImmutable
    {
        return $this->end;
    }

    public function toString(): string
    {
        return sprintf(
            'Du %s au %s',
            $this->start->format('d/m/Y'),
            $this->end->format('d/m/Y')
        );
    }

    public function __toString(): string
    {
        return $this->toString();
    }
}
```

**Tests:**
```php
/** @test */
public function it_calculates_duration_in_days(): void
{
    $range = DateRange::fromStrings('2025-02-15', '2025-02-22');

    $this->assertEquals(7, $range->getDurationInDays());
}

/** @test */
public function it_detects_overlapping_periods(): void
{
    $sejour1 = DateRange::fromStrings('2025-02-15', '2025-02-22');
    $sejour2 = DateRange::fromStrings('2025-02-20', '2025-02-27');

    $this->assertTrue($sejour1->overlaps($sejour2));
}

/** @test */
public function it_throws_exception_when_start_after_end(): void
{
    $this->expectException(InvalidArgumentException::class);

    DateRange::fromStrings('2025-02-22', '2025-02-15');
}
```

---

## Utilisation dans une entité Doctrine

```php
use App\Domain\ValueObject\Money;
use App\Domain\ValueObject\Email;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity]
class Reservation
{
    #[ORM\Column(type: 'integer')]
    private int $prixCents; // Stockage en centimes

    #[ORM\Column(type: 'string')]
    private string $emailContact;

    public function getPrix(): Money
    {
        return Money::fromCents($this->prixCents);
    }

    public function setPrix(Money $prix): void
    {
        $this->prixCents = $prix->toCents();
    }

    public function getEmail(): Email
    {
        return Email::fromString($this->emailContact);
    }

    public function setEmail(Email $email): void
    {
        $this->emailContact = $email->toString();
    }
}
```

---

## Checklist Value Object

- [ ] Classe `final readonly`
- [ ] Constructeur `private`
- [ ] Factory methods `public static`
- [ ] Validation dans le constructeur
- [ ] Méthode `equals()` pour comparaison
- [ ] Méthode `toString()` pour représentation
- [ ] Pas de setters (immuable)
- [ ] Tests unitaires exhaustifs (>90% coverage)
- [ ] Documentation PHPDoc complète
- [ ] Exemples d'utilisation en commentaire
