# Règle 04 : Value Objects

## Définition

Un Value Object représente un concept métier **immuable** et **sans identité**. Deux VOs avec les mêmes valeurs sont considérés égaux.

## Caractéristiques obligatoires

1. **Immutable** - Aucune modification après création
2. **Final + Readonly** - Classes non extensibles
3. **Validation dans constructeur** - Fail-fast
4. **Égalité par valeur** - Méthode `equals()`
5. **Type-safe** - Pas de valeurs primitives dans Domain

## Template de base

```php
<?php

declare(strict_types=1);

namespace App\Shared\Domain\ValueObject;

use InvalidArgumentException;

final readonly class Email
{
    private const PATTERN = '/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/';

    public function __construct(
        private string $value
    ) {
        $this->validate();
    }

    public static function fromString(string $value): self
    {
        return new self($value);
    }

    public function getValue(): string
    {
        return $this->value;
    }

    public function getDomain(): string
    {
        return substr($this->value, strpos($this->value, '@') + 1);
    }

    public function equals(Email $other): bool
    {
        return $this->value === $other->value;
    }

    private function validate(): void
    {
        if (preg_match(self::PATTERN, $this->value) !== 1) {
            throw new InvalidArgumentException(
                sprintf('Invalid email address: %s', $this->value)
            );
        }
    }

    public function __toString(): string
    {
        return $this->value;
    }
}
```

## Value Objects courants

### 1. Email
Voir template ci-dessus

### 2. Money

```php
final readonly class Money
{
    public function __construct(
        private int $amountInCents,  // Stocker en centimes !
        private Currency $currency
    ) {
        if ($amountInCents < 0) {
            throw new NegativeAmountException($amountInCents);
        }
    }

    public static function fromCents(int $cents, Currency $currency = Currency::EUR): self
    {
        return new self($cents, $currency);
    }

    public static function fromAmount(float $amount, Currency $currency = Currency::EUR): self
    {
        return new self((int) round($amount * 100), $currency);
    }

    public function getAmountInCents(): int
    {
        return $this->amountInCents;
    }

    public function getAmount(): float
    {
        return $this->amountInCents / 100;
    }

    public function getCurrency(): Currency
    {
        return $this->currency;
    }

    public function add(Money $other): self
    {
        $this->ensureSameCurrency($other);
        return new self(
            $this->amountInCents + $other->amountInCents,
            $this->currency
        );
    }

    public function subtract(Money $other): self
    {
        $this->ensureSameCurrency($other);
        return new self(
            $this->amountInCents - $other->amountInCents,
            $this->currency
        );
    }

    public function multiply(float $multiplier): self
    {
        return new self(
            (int) round($this->amountInCents * $multiplier),
            $this->currency
        );
    }

    public function isZero(): bool
    {
        return $this->amountInCents === 0;
    }

    public function isPositive(): bool
    {
        return $this->amountInCents > 0;
    }

    public function equals(Money $other): bool
    {
        return $this->amountInCents === $other->amountInCents
            && $this->currency === $other->currency;
    }

    private function ensureSameCurrency(Money $other): void
    {
        if ($this->currency !== $other->currency) {
            throw new CurrencyMismatchException($this->currency, $other->currency);
        }
    }
}

enum Currency: string
{
    case EUR = 'EUR';
    case USD = 'USD';
    case GBP = 'GBP';
}
```

### 3. IDs typés (UUID)

```php
final readonly class ClientId
{
    public function __construct(
        private string $value
    ) {
        if (!Uuid::isValid($value)) {
            throw new InvalidArgumentException('Invalid UUID format');
        }
    }

    public static function generate(): self
    {
        return new self(Uuid::v4()->toString());
    }

    public static function fromString(string $value): self
    {
        return new self($value);
    }

    public function getValue(): string
    {
        return $this->value;
    }

    public function equals(ClientId $other): bool
    {
        return $this->value === $other->value;
    }

    public function __toString(): string
    {
        return $this->value;
    }
}
```

### 4. PhoneNumber

```php
final readonly class PhoneNumber
{
    private const PATTERN = '/^\+?[1-9]\d{1,14}$/';  // E.164 format

    public function __construct(
        private string $value
    ) {
        $this->validate();
    }

    public static function fromString(string $value): self
    {
        return new self(self::normalize($value));
    }

    public function getValue(): string
    {
        return $this->value;
    }

    public function getFormattedForCountry(Country $country): string
    {
        // Logique de formatage par pays
        return match ($country) {
            Country::FR => $this->formatFrench(),
            Country::DE => $this->formatGerman(),
            default => $this->value,
        };
    }

    public function equals(PhoneNumber $other): bool
    {
        return $this->value === $other->value;
    }

    private static function normalize(string $value): string
    {
        // Retirer espaces, tirets, parenthèses
        return preg_replace('/[^0-9+]/', '', $value);
    }

    private function validate(): void
    {
        if (preg_match(self::PATTERN, $this->value) !== 1) {
            throw new InvalidPhoneNumberException($this->value);
        }
    }
}
```

### 5. PostalCode

```php
final readonly class PostalCode
{
    public function __construct(
        private string $value,
        private Country $country
    ) {
        $this->validate();
    }

    public static function fromString(string $value, Country $country): self
    {
        return new self($value, $country);
    }

    public function getValue(): string
    {
        return $this->value;
    }

    public function getCountry(): Country
    {
        return $this->country;
    }

    public function equals(PostalCode $other): bool
    {
        return $this->value === $other->value
            && $this->country === $other->country;
    }

    private function validate(): void
    {
        $pattern = match ($this->country) {
            Country::FR => '/^[0-9]{5}$/',
            Country::DE => '/^[0-9]{5}$/',
            Country::BE => '/^[0-9]{4}$/',
            Country::NL => '/^[1-9][0-9]{3}\s?[A-Z]{2}$/i',
            Country::UK => '/^[A-Z]{1,2}[0-9]{1,2}\s?[0-9][A-Z]{2}$/i',
            default => '/^.+$/',
        };

        if (preg_match($pattern, $this->value) !== 1) {
            throw new InvalidPostalCodeException(
                $this->value,
                $this->country
            );
        }
    }
}
```

### 6. CompanyIdentifier (SIRET/TVA)

```php
final readonly class CompanyIdentifier
{
    public function __construct(
        private string $value,
        private Country $country,
        private CompanyIdentifierType $type
    ) {
        $this->validate();
    }

    public static function siret(string $value): self
    {
        return new self($value, Country::FR, CompanyIdentifierType::SIRET);
    }

    public static function vat(string $value, Country $country): self
    {
        return new self($value, $country, CompanyIdentifierType::VAT);
    }

    public function getValue(): string
    {
        return $this->value;
    }

    public function getCountry(): Country
    {
        return $this->country;
    }

    public function getType(): CompanyIdentifierType
    {
        return $this->type;
    }

    public function isVAT(): bool
    {
        return $this->type === CompanyIdentifierType::VAT;
    }

    public function equals(CompanyIdentifier $other): bool
    {
        return $this->value === $other->value
            && $this->country === $other->country
            && $this->type === $other->type;
    }

    private function validate(): void
    {
        match ($this->type) {
            CompanyIdentifierType::SIRET => $this->validateSiret(),
            CompanyIdentifierType::VAT => $this->validateVAT(),
        };
    }

    private function validateSiret(): void
    {
        // Algorithme Luhn pour SIRET français
        if (!preg_match('/^[0-9]{14}$/', $this->value)) {
            throw new InvalidSiretException($this->value);
        }

        // Calcul checksum Luhn
        // ...
    }

    private function validateVAT(): void
    {
        // Validation par pays
        $pattern = match ($this->country) {
            Country::FR => '/^FR[0-9A-Z]{2}[0-9]{9}$/',
            Country::DE => '/^DE[0-9]{9}$/',
            Country::BE => '/^BE[01][0-9]{9}$/',
            default => '/^.+$/',
        };

        if (preg_match($pattern, $this->value) !== 1) {
            throw new InvalidVATException($this->value, $this->country);
        }
    }
}

enum CompanyIdentifierType
{
    case SIRET;
    case VAT;
}
```

## Collections de Value Objects

```php
final readonly class EmailCollection
{
    /**
     * @param Email[] $emails
     */
    public function __construct(
        private array $emails
    ) {
        foreach ($emails as $email) {
            if (!$email instanceof Email) {
                throw new InvalidArgumentException('All items must be Email instances');
            }
        }
    }

    public static function fromStrings(array $strings): self
    {
        return new self(
            array_map(
                fn(string $email) => Email::fromString($email),
                $strings
            )
        );
    }

    public function toArray(): array
    {
        return array_map(
            fn(Email $email) => $email->getValue(),
            $this->emails
        );
    }

    public function contains(Email $email): bool
    {
        foreach ($this->emails as $item) {
            if ($item->equals($email)) {
                return true;
            }
        }

        return false;
    }

    public function count(): int
    {
        return count($this->emails);
    }

    public function isEmpty(): bool
    {
        return $this->count() === 0;
    }
}
```

## Doctrine Custom Types

```php
// Shared/Infrastructure/Doctrine/Type/EmailType.php

final class EmailType extends StringType
{
    public const NAME = 'email';

    public function convertToPHPValue($value, AbstractPlatform $platform): ?Email
    {
        if ($value === null) {
            return null;
        }

        return Email::fromString($value);
    }

    public function convertToDatabaseValue($value, AbstractPlatform $platform): ?string
    {
        if ($value === null) {
            return null;
        }

        if (!$value instanceof Email) {
            throw ConversionException::conversionFailedInvalidType(
                $value,
                $this->getName(),
                ['null', Email::class]
            );
        }

        return $value->getValue();
    }

    public function getName(): string
    {
        return self::NAME;
    }
}
```

Enregistrement :
```yaml
# config/packages/doctrine.yaml
doctrine:
    dbal:
        types:
            email: App\Shared\Infrastructure\Doctrine\Type\EmailType
            money: App\Shared\Infrastructure\Doctrine\Type\MoneyType
            client_id: App\Shared\Infrastructure\Doctrine\Type\ClientIdType
```

## Checklist Value Objects

- [ ] Classe `final readonly`
- [ ] Validation dans le constructeur
- [ ] Factory method `fromXxx()` statique
- [ ] Méthode `getValue()` ou getters spécifiques
- [ ] Méthode `equals()` pour comparaison
- [ ] Méthode `__toString()` si pertinent
- [ ] Aucun setter (immutabilité)
- [ ] Type Doctrine custom créé
- [ ] Tests unitaires couvrant validation
- [ ] Documentation des formats attendus
