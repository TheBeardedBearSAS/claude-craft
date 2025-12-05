# Ejemplos de Value Objects - Atoll Tourisme

## Overview

Este documento presenta **implementaciones completas** de Value Objects para el proyecto Atoll Tourisme.

> **Referencias:**
> - `.claude/rules/13-ddd-patterns.md` - Patrones DDD
> - `.claude/rules/02-architecture-clean-ddd.md` - Arquitectura
> - `.claude/examples/clean-architecture-structure.md` - Estructura completa

---

## Índice

1. [Principios de los Value Objects](#principios-de-los-value-objects)
2. [Money (Dinero)](#money-dinero)
3. [Email](#email)
4. [PhoneNumber (Teléfono francés)](#phonenumber-teléfono-francés)
5. [DateRange (Período)](#daterange-período)
6. [PersonName (Nombre de persona)](#personname-nombre-de-persona)
7. [ReservationId (Identity VO)](#reservationid-identity-vo)
8. [ReservationStatus (Enum VO)](#reservationstatus-enum-vo)

---

## Principios de los Value Objects

### Características obligatorias

1. **Inmutabilidad:** clase `readonly` o propiedades `private readonly`
2. **Validación:** En el constructor (lanzar excepción si es inválido)
3. **Igualdad por valor:** Método `equals()`
4. **Named constructors:** Métodos estáticos `fromString()`, `fromInt()`, etc.
5. **Sin identidad:** Sin `$id`
6. **Reemplazable:** Crear nuevo VO en lugar de modificar

### Plantilla base

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
            throw new \InvalidArgumentException('El valor no puede estar vacío');
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

## Money (Dinero)

**Ubicación:** `src/Domain/Reservation/ValueObject/Money.php`

**Uso:** Montos monetarios con precisión (centavos).

**Reglas:**
- Almacenamiento en centavos (int) para evitar errores de float
- Inmutable
- Operaciones matemáticas devuelven nuevo Money

```php
<?php

declare(strict_types=1);

namespace App\Domain\Reservation\ValueObject;

final readonly class Money
{
    private const CURRENCY = 'EUR';
    private const MIN_CENTS = 0;
    private const MAX_CENTS = 99999999; // 999 999,99 EUR

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
            throw new \InvalidArgumentException(
                sprintf('El monto no puede ser negativo: %d centavos', $this->cents)
            );
        }

        if ($this->cents > self::MAX_CENTS) {
            throw new \InvalidArgumentException(
                sprintf('El monto excede el límite: %d centavos', $this->cents)
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

---

## Email

**Ubicación:** `src/Domain/Shared/ValueObject/Email.php`

```php
<?php

declare(strict_types=1);

namespace App\Domain\Shared\ValueObject;

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
            throw new \InvalidArgumentException(
                sprintf('Dirección de email inválida: %s', $this->value)
            );
        }

        if (!preg_match(self::PATTERN, $this->value)) {
            throw new \InvalidArgumentException(
                sprintf('Formato de email no conforme: %s', $this->value)
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

## PhoneNumber (Teléfono francés)

**Ubicación:** `src/Domain/Shared/ValueObject/PhoneNumber.php`

```php
<?php

declare(strict_types=1);

namespace App\Domain\Shared\ValueObject;

final readonly class PhoneNumber
{
    // Formatos aceptados: 0612345678, +33612345678, 06 12 34 56 78, 06.12.34.56.78
    private const PATTERN_FR = '/^(?:(?:\+|00)33|0)[1-9](?:[0-9]{2}){4}$/';

    private function __construct(
        private string $value
    ) {
        $this->validate();
    }

    public static function fromString(string $phone): self
    {
        // Normalizar: eliminar espacios, puntos, guiones
        $normalized = preg_replace('/[\s\.\-]/', '', $phone);
        return new self($normalized);
    }

    private function validate(): void
    {
        if (!preg_match(self::PATTERN_FR, $this->value)) {
            throw new \InvalidArgumentException(
                sprintf('Número de teléfono francés inválido: %s', $this->value)
            );
        }
    }

    public function equals(self $other): bool
    {
        return $this->value === $other->value;
    }

    public function toString(): string
    {
        return $this->value;
    }

    public function toInternational(): string
    {
        // Convertir 0612345678 a +33612345678
        if (str_starts_with($this->value, '0')) {
            return '+33' . substr($this->value, 1);
        }
        return $this->value;
    }

    public function toFormatted(): string
    {
        // Formatear como 06 12 34 56 78
        return chunk_split($this->value, 2, ' ');
    }

    public function __toString(): string
    {
        return $this->toFormatted();
    }
}
```

---

## DateRange (Período)

**Ubicación:** `src/Domain/Catalog/ValueObject/DateRange.php`

```php
<?php

declare(strict_types=1);

namespace App\Domain\Catalog\ValueObject;

final readonly class DateRange
{
    private function __construct(
        private \DateTimeImmutable $start,
        private \DateTimeImmutable $end
    ) {
        $this->validate();
    }

    public static function fromDates(\DateTimeImmutable $start, \DateTimeImmutable $end): self
    {
        return new self($start, $end);
    }

    public static function fromStrings(string $start, string $end): self
    {
        return new self(
            new \DateTimeImmutable($start),
            new \DateTimeImmutable($end)
        );
    }

    private function validate(): void
    {
        if ($this->start >= $this->end) {
            throw new \InvalidArgumentException(
                sprintf(
                    'La fecha de inicio debe ser antes de la fecha de fin: %s >= %s',
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

    public function contains(\DateTimeImmutable $date): bool
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

    public function start(): \DateTimeImmutable
    {
        return $this->start;
    }

    public function end(): \DateTimeImmutable
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

---

## PersonName (Nombre de persona)

**Ubicación:** `src/Domain/Shared/ValueObject/PersonName.php`

```php
<?php

declare(strict_types=1);

namespace App\Domain\Shared\ValueObject;

final readonly class PersonName
{
    private function __construct(
        private string $firstName,
        private string $lastName
    ) {
        $this->validate();
    }

    public static function fromString(string $firstName, string $lastName): self
    {
        return new self(
            trim(ucfirst(strtolower($firstName))),
            trim(strtoupper($lastName))
        );
    }

    private function validate(): void
    {
        if (empty($this->firstName)) {
            throw new \InvalidArgumentException('El nombre no puede estar vacío');
        }

        if (empty($this->lastName)) {
            throw new \InvalidArgumentException('El apellido no puede estar vacío');
        }

        if (strlen($this->firstName) > 100 || strlen($this->lastName) > 100) {
            throw new \InvalidArgumentException('Nombre o apellido demasiado largo');
        }
    }

    public function equals(self $other): bool
    {
        return $this->firstName === $other->firstName
            && $this->lastName === $other->lastName;
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

    public function toString(): string
    {
        return $this->getFullName();
    }

    public function __toString(): string
    {
        return $this->toString();
    }
}
```

---

## ReservationId (Identity VO)

**Ubicación:** `src/Domain/Reservation/ValueObject/ReservationId.php`

```php
<?php

declare(strict_types=1);

namespace App\Domain\Reservation\ValueObject;

use Symfony\Component\Uid\Uuid;

final readonly class ReservationId
{
    private function __construct(
        private Uuid $value
    ) {}

    public static function generate(): self
    {
        return new self(Uuid::v4());
    }

    public static function fromString(string $value): self
    {
        return new self(Uuid::fromString($value));
    }

    public function equals(self $other): bool
    {
        return $this->value->equals($other->value);
    }

    public function toString(): string
    {
        return $this->value->toRfc4122();
    }

    public function __toString(): string
    {
        return $this->toString();
    }
}
```

---

## ReservationStatus (Enum VO)

**Ubicación:** `src/Domain/Reservation/ValueObject/ReservationStatus.php`

```php
<?php

declare(strict_types=1);

namespace App\Domain\Reservation\ValueObject;

enum ReservationStatus: string
{
    case PENDING = 'en_espera';
    case CONFIRMED = 'confirmada';
    case CANCELLED = 'cancelada';
    case COMPLETED = 'completada';

    public function isPending(): bool
    {
        return $this === self::PENDING;
    }

    public function isConfirmed(): bool
    {
        return $this === self::CONFIRMED;
    }

    public function isCancelled(): bool
    {
        return $this === self::CANCELLED;
    }

    public function canBeCancelled(): bool
    {
        return $this === self::PENDING || $this === self::CONFIRMED;
    }

    public function getLabel(): string
    {
        return match ($this) {
            self::PENDING => 'En espera',
            self::CONFIRMED => 'Confirmada',
            self::CANCELLED => 'Cancelada',
            self::COMPLETED => 'Completada',
        };
    }
}
```

---

## Checklist Value Objects

- [ ] Clase `final readonly`
- [ ] Constructor `private`
- [ ] Named constructors `public static`
- [ ] Validación en constructor
- [ ] Método `equals()` para comparación
- [ ] Método `toString()` para representación
- [ ] Sin setters (inmutable)
- [ ] Tests unitarios exhaustivos (>90% cobertura)
- [ ] Documentación PHPDoc completa

---

**Fecha de creación:** 2025-11-26
**Versión:** 1.0.0
**Autor:** The Bearded CTO
