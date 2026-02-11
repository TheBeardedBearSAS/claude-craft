# Template: Value Object

## Basic Structure

```php
<?php

declare(strict_types=1);

namespace App\Domain\ValueObject;

use App\Domain\Exception\InvalidValueException;

/**
 * Value Object description and purpose.
 *
 * Characteristics:
 * - Immutable
 * - Self-validating
 * - Equality by value (not by reference)
 */
readonly class ValueObjectName
{
    private function __construct(
        public string $value,
    ) {}

    /**
     * Create from raw value with validation.
     *
     * @throws InvalidValueException
     */
    public static function fromString(string $value): self
    {
        $normalized = self::normalize($value);

        if (!self::isValid($normalized)) {
            throw new InvalidValueException(
                sprintf('Invalid value: %s', $value)
            );
        }

        return new self($normalized);
    }

    /**
     * Check equality with another instance.
     */
    public function equals(self $other): bool
    {
        return $this->value === $other->value;
    }

    public function __toString(): string
    {
        return $this->value;
    }

    private static function normalize(string $value): string
    {
        return trim($value);
    }

    private static function isValid(string $value): bool
    {
        return !empty($value);
    }
}
```

## Email Value Object

```php
<?php

declare(strict_types=1);

namespace App\Domain\ValueObject;

use App\Domain\Exception\InvalidEmailException;

/**
 * Email address value object.
 *
 * Validates and normalizes email addresses.
 */
readonly class Email
{
    private function __construct(
        public string $value,
    ) {}

    /**
     * Create from email string.
     *
     * @throws InvalidEmailException
     */
    public static function fromString(string $email): self
    {
        $normalized = strtolower(trim($email));

        if (!filter_var($normalized, FILTER_VALIDATE_EMAIL)) {
            throw new InvalidEmailException($email);
        }

        return new self($normalized);
    }

    public function getDomain(): string
    {
        return substr($this->value, strpos($this->value, '@') + 1);
    }

    public function getLocalPart(): string
    {
        return substr($this->value, 0, strpos($this->value, '@'));
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

## Money Value Object

```php
<?php

declare(strict_types=1);

namespace App\Domain\ValueObject;

use App\Domain\Exception\CurrencyMismatchException;
use App\Domain\Exception\InvalidAmountException;

/**
 * Money value object for handling currency amounts.
 *
 * Uses integer amounts in cents to avoid floating-point issues.
 */
readonly class Money
{
    private function __construct(
        private int $amountInCents,
        private string $currency,
    ) {}

    /**
     * Create from decimal amount.
     */
    public static function create(float|int $amount, string $currency = 'EUR'): self
    {
        if ($amount < 0) {
            throw new InvalidAmountException('Amount cannot be negative');
        }

        return new self(
            (int) round($amount * 100),
            strtoupper($currency)
        );
    }

    /**
     * Create from cents.
     */
    public static function fromCents(int $cents, string $currency = 'EUR'): self
    {
        if ($cents < 0) {
            throw new InvalidAmountException('Amount cannot be negative');
        }

        return new self($cents, strtoupper($currency));
    }

    /**
     * Create zero amount.
     */
    public static function zero(string $currency = 'EUR'): self
    {
        return new self(0, strtoupper($currency));
    }

    public function getAmount(): float
    {
        return $this->amountInCents / 100;
    }

    public function getAmountInCents(): int
    {
        return $this->amountInCents;
    }

    public function getCurrency(): string
    {
        return $this->currency;
    }

    /**
     * Add two money values.
     *
     * @throws CurrencyMismatchException
     */
    public function add(self $other): self
    {
        $this->assertSameCurrency($other);

        return new self(
            $this->amountInCents + $other->amountInCents,
            $this->currency
        );
    }

    /**
     * Subtract money value.
     *
     * @throws CurrencyMismatchException
     */
    public function subtract(self $other): self
    {
        $this->assertSameCurrency($other);

        $result = $this->amountInCents - $other->amountInCents;

        if ($result < 0) {
            throw new InvalidAmountException('Result cannot be negative');
        }

        return new self($result, $this->currency);
    }

    /**
     * Multiply by a factor.
     */
    public function multiply(float|int $factor): self
    {
        return new self(
            (int) round($this->amountInCents * $factor),
            $this->currency
        );
    }

    /**
     * Check if greater than another amount.
     *
     * @throws CurrencyMismatchException
     */
    public function isGreaterThan(self $other): bool
    {
        $this->assertSameCurrency($other);

        return $this->amountInCents > $other->amountInCents;
    }

    /**
     * Check if less than another amount.
     *
     * @throws CurrencyMismatchException
     */
    public function isLessThan(self $other): bool
    {
        $this->assertSameCurrency($other);

        return $this->amountInCents < $other->amountInCents;
    }

    public function isZero(): bool
    {
        return $this->amountInCents === 0;
    }

    public function equals(self $other): bool
    {
        return $this->amountInCents === $other->amountInCents
            && $this->currency === $other->currency;
    }

    public function format(string $locale = 'en_US'): string
    {
        $formatter = new \NumberFormatter($locale, \NumberFormatter::CURRENCY);

        return $formatter->formatCurrency($this->getAmount(), $this->currency);
    }

    public function __toString(): string
    {
        return sprintf('%.2f %s', $this->getAmount(), $this->currency);
    }

    private function assertSameCurrency(self $other): void
    {
        if ($this->currency !== $other->currency) {
            throw new CurrencyMismatchException(
                sprintf(
                    'Cannot operate on different currencies: %s and %s',
                    $this->currency,
                    $other->currency
                )
            );
        }
    }
}
```

## UUID Identifier

```php
<?php

declare(strict_types=1);

namespace App\Domain\ValueObject;

use App\Domain\Exception\InvalidIdException;
use Ramsey\Uuid\Uuid;
use Ramsey\Uuid\UuidInterface;

/**
 * Abstract base class for UUID identifiers.
 */
abstract readonly class AbstractId
{
    private function __construct(
        private UuidInterface $value,
    ) {}

    /**
     * Generate a new random ID.
     */
    public static function generate(): static
    {
        return new static(Uuid::uuid4());
    }

    /**
     * Create from string representation.
     *
     * @throws InvalidIdException
     */
    public static function fromString(string $value): static
    {
        if (!Uuid::isValid($value)) {
            throw new InvalidIdException(
                sprintf('Invalid UUID: %s', $value)
            );
        }

        return new static(Uuid::fromString($value));
    }

    public function getValue(): string
    {
        return $this->value->toString();
    }

    public function equals(self $other): bool
    {
        return $this->value->equals($other->value);
    }

    public function __toString(): string
    {
        return $this->value->toString();
    }
}

// Concrete implementations

readonly class UserId extends AbstractId {}

readonly class OrderId extends AbstractId {}

readonly class ProductId extends AbstractId {}

readonly class CustomerId extends AbstractId {}
```

## Date Range Value Object

```php
<?php

declare(strict_types=1);

namespace App\Domain\ValueObject;

use App\Domain\Exception\InvalidDateRangeException;

/**
 * Date range value object.
 */
readonly class DateRange
{
    private function __construct(
        public \DateTimeImmutable $startDate,
        public \DateTimeImmutable $endDate,
    ) {}

    /**
     * Create a date range.
     *
     * @throws InvalidDateRangeException
     */
    public static function create(
        \DateTimeImmutable $startDate,
        \DateTimeImmutable $endDate,
    ): self {
        if ($startDate > $endDate) {
            throw new InvalidDateRangeException(
                'Start date must be before or equal to end date'
            );
        }

        return new self($startDate, $endDate);
    }

    /**
     * Create from strings.
     */
    public static function fromStrings(string $start, string $end): self
    {
        return self::create(
            new \DateTimeImmutable($start),
            new \DateTimeImmutable($end)
        );
    }

    public function contains(\DateTimeImmutable $date): bool
    {
        return $date >= $this->startDate && $date <= $this->endDate;
    }

    public function overlaps(self $other): bool
    {
        return $this->startDate <= $other->endDate
            && $this->endDate >= $other->startDate;
    }

    public function getDays(): int
    {
        return (int) $this->startDate->diff($this->endDate)->days + 1;
    }

    public function equals(self $other): bool
    {
        return $this->startDate == $other->startDate
            && $this->endDate == $other->endDate;
    }
}
```

## Associated Tests

```php
<?php

declare(strict_types=1);

namespace App\Tests\Unit\Domain\ValueObject;

use App\Domain\Exception\InvalidEmailException;
use App\Domain\ValueObject\Email;
use PHPUnit\Framework\Attributes\DataProvider;
use PHPUnit\Framework\Attributes\Test;
use PHPUnit\Framework\TestCase;

final class EmailTest extends TestCase
{
    #[Test]
    #[DataProvider('validEmailsProvider')]
    public function it_accepts_valid_emails(string $email): void
    {
        $emailVo = Email::fromString($email);

        $this->assertNotNull($emailVo);
    }

    public static function validEmailsProvider(): iterable
    {
        yield 'simple email' => ['test@example.com'];
        yield 'with subdomain' => ['test@mail.example.com'];
        yield 'with plus' => ['test+tag@example.com'];
        yield 'uppercase' => ['TEST@EXAMPLE.COM'];
    }

    #[Test]
    #[DataProvider('invalidEmailsProvider')]
    public function it_rejects_invalid_emails(string $email): void
    {
        $this->expectException(InvalidEmailException::class);

        Email::fromString($email);
    }

    public static function invalidEmailsProvider(): iterable
    {
        yield 'no at sign' => ['testexample.com'];
        yield 'no domain' => ['test@'];
        yield 'empty' => [''];
        yield 'spaces' => ['test @example.com'];
    }

    #[Test]
    public function it_normalizes_to_lowercase(): void
    {
        $email = Email::fromString('TEST@EXAMPLE.COM');

        $this->assertSame('test@example.com', $email->value);
    }

    #[Test]
    public function it_can_extract_domain(): void
    {
        $email = Email::fromString('user@example.com');

        $this->assertSame('example.com', $email->getDomain());
    }

    #[Test]
    public function it_supports_equality_check(): void
    {
        $email1 = Email::fromString('test@example.com');
        $email2 = Email::fromString('TEST@EXAMPLE.COM');
        $email3 = Email::fromString('other@example.com');

        $this->assertTrue($email1->equals($email2));
        $this->assertFalse($email1->equals($email3));
    }
}
```

## Folder Organization

```
src/Domain/ValueObject/
├── AbstractId.php       # Base UUID class
├── UserId.php           # User identifier
├── OrderId.php          # Order identifier
├── Email.php            # Email address
├── Money.php            # Monetary amount
├── DateRange.php        # Date range
└── Address.php          # Physical address

tests/Unit/Domain/ValueObject/
├── EmailTest.php
├── MoneyTest.php
├── DateRangeTest.php
└── ...
```
