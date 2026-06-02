# Plantilla: Value Object (DDD)

> **Patrón DDD** - Objeto inmutable que representa un valor de negocio
> Referencia: `.claude/rules/01-architecture-ddd.md`

## Características de un Value Object

- ✅ **Inmutable** (clase readonly, sin setters)
- ✅ **Validación en el constructor**
- ✅ **Igualdad por valor** (método `equals()`)
- ✅ **Sin identidad propia** (sin ID)
- ✅ **Autosuficiente** (contiene toda su lógica de negocio)

---

## Plantilla PHP 8.2+

```php
<?php

declare(strict_types=1);

namespace App\Domain\ValueObject;

use InvalidArgumentException;

/**
 * Value Object: [NombreValueObject]
 *
 * Representa: [Descripción de negocio]
 *
 * Ejemplos:
 * - new [NombreValueObject]([valor_valido])
 * - new [NombreValueObject]([otro_valor_valido])
 *
 * @see https://martinfowler.com/bliki/ValueObject.html
 */
final readonly class [NombreValueObject]
{
    /**
     * @throws InvalidArgumentException Si el valor es inválido
     */
    private function __construct(
        private [tipo] $value
    ) {
        $this->validate();
    }

    /**
     * Factory method: creación desde [origen]
     */
    public static function fromString(string $value): self
    {
        return new self($value);
    }

    /**
     * Factory method: creación desde [otro origen]
     */
    public static function from[Tipo]([tipo] $value): self
    {
        return new self($value);
    }

    /**
     * Validación de negocio
     *
     * @throws InvalidArgumentException
     */
    private function validate(): void
    {
        if (/* condición inválida */) {
            throw new InvalidArgumentException(
                sprintf('[Mensaje de error]: %s', $this->value)
            );
        }
    }

    /**
     * Igualdad por valor
     */
    public function equals(self $other): bool
    {
        return $this->value === $other->value;
    }

    /**
     * Conversión a tipo primitivo
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
     * Representación string (para debug)
     */
    public function __toString(): string
    {
        return $this->toString();
    }

    /**
     * Getter del valor bruto
     */
    public function value(): [tipo]
    {
        return $this->value;
    }
}
```

---

## Ejemplos concretos Atoll Tourisme

### 1. Money - Monto en euros

```php
<?php

declare(strict_types=1);

namespace App\Domain\ValueObject;

use InvalidArgumentException;

/**
 * Value Object: Money (Monto monetario en EUR)
 *
 * Representa un monto en euros con validación de negocio.
 * Evita los errores de manipulación de dinero (precisión de float).
 *
 * Ejemplos:
 * - Money::fromEuros(1299.99) → Estancia Guadalupe
 * - Money::fromCents(129999) → Mismo monto en céntimos
 */
final readonly class Money
{
    private const CURRENCY = 'EUR';
    private const MIN_CENTS = 0;
    private const MAX_CENTS = 99999999; // 999 999,99 EUR

    /**
     * @param int $cents Monto en céntimos (para evitar errores de float)
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

### 2. Email - Dirección email validada

```php
<?php

declare(strict_types=1);

namespace App\Domain\ValueObject;

use InvalidArgumentException;

/**
 * Value Object: Email
 *
 * Representa una dirección email validada.
 * Garantiza que un email es siempre válido en el dominio.
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

### 3. DateRange - Período de fechas

```php
<?php

declare(strict_types=1);

namespace App\Domain\ValueObject;

use DateTimeImmutable;
use InvalidArgumentException;

/**
 * Value Object: DateRange (Período)
 *
 * Representa un período con fecha de inicio y fin.
 * Usado para las estancias, reservas, etc.
 *
 * Ejemplo:
 * - DateRange::fromDates($inicio, $fin) → Estancia del 15/02 al 22/02
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
            'Del %s al %s',
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

## Uso en una entidad Doctrine

```php
use App\Domain\ValueObject\Money;
use App\Domain\ValueObject\Email;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity]
class Reservation
{
    #[ORM\Column(type: 'integer')]
    private int $prixCents; // Almacenamiento en céntimos

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

- [ ] Clase `final readonly`
- [ ] Constructor `private`
- [ ] Factory methods `public static`
- [ ] Validación en el constructor
- [ ] Método `equals()` para comparación
- [ ] Método `toString()` para representación
- [ ] Sin setters (inmutable)
- [ ] Tests unitarios exhaustivos (>90% cobertura)
- [ ] Documentación PHPDoc completa
- [ ] Ejemplos de uso en comentarios
