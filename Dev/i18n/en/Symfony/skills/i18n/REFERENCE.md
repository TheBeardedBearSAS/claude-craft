# Règle 09 : Internationalisation (i18n)

## Pays supportés

**7 pays européens** : FR, EN, DE, ES, IT, NL, BE

Chaque pays a :
- Sa propre fiscalité (TVA)
- Ses formats (dates, nombres, monnaies)
- Ses validations (SIRET, VAT, codes postaux)
- Ses workflows métier spécifiques

## Country Enum

```php
enum Country: string
{
    case FR = 'FR';  // France
    case EN = 'EN';  // Angleterre
    case DE = 'DE';  // Allemagne
    case ES = 'ES';  // Espagne
    case IT = 'IT';  // Italie
    case NL = 'NL';  // Pays-Bas
    case BE = 'BE';  // Belgique

    public function getVATRate(): float
    {
        return match ($this) {
            self::FR => 0.20,
            self::DE => 0.19,
            self::ES => 0.21,
            self::IT => 0.22,
            self::NL => 0.21,
            self::BE => 0.21,
            self::EN => 0.20,
        };
    }

    public function getCurrency(): Currency
    {
        return match ($this) {
            self::EN => Currency::GBP,
            default => Currency::EUR,
        };
    }
}
```

## Strategy Pattern - Services par pays

```php
// Domain Service Interface
interface TaxCalculatorInterface
{
    public function calculateVAT(Money $amount): Money;
    public function getVATRate(): TaxRate;
}

// Implémentation France
final readonly class FrenchTaxCalculator implements TaxCalculatorInterface
{
    public function calculateVAT(Money $amount): Money
    {
        return $amount->multiply(0.20);
    }

    public function getVATRate(): TaxRate
    {
        return TaxRate::fromFloat(0.20);
    }
}

// Implémentation Allemagne
final readonly class GermanTaxCalculator implements TaxCalculatorInterface
{
    public function calculateVAT(Money $amount): Money
    {
        return $amount->multiply(0.19);
    }

    public function getVATRate(): TaxRate
    {
        return TaxRate::fromFloat(0.19);
    }
}
```

## Service Registry

```php
final readonly class TaxCalculatorRegistry
{
    public function __construct(
        private FrenchTaxCalculator $frenchCalculator,
        private GermanTaxCalculator $germanCalculator,
        private SpanishTaxCalculator $spanishCalculator,
        // ... autres pays
    ) {}

    public function get(Country $country): TaxCalculatorInterface
    {
        return match ($country) {
            Country::FR => $this->frenchCalculator,
            Country::DE => $this->germanCalculator,
            Country::ES => $this->spanishCalculator,
            Country::IT => $this->italianCalculator,
            Country::NL => $this->dutchCalculator,
            Country::BE => $this->belgianCalculator,
            Country::EN => $this->englishCalculator,
        };
    }
}
```

## Formats localisés

### Dates

```php
final readonly class DateFormatter
{
    public function format(DateTimeInterface $date, Country $country): string
    {
        $formatter = new IntlDateFormatter(
            $country->value,
            IntlDateFormatter::LONG,
            IntlDateFormatter::NONE
        );

        return $formatter->format($date);
    }
}
```

### Nombres et Monnaies

```php
final readonly class MoneyFormatter
{
    public function format(Money $money, Country $country): string
    {
        $formatter = new NumberFormatter(
            $country->value,
            NumberFormatter::CURRENCY
        );

        return $formatter->formatCurrency(
            $money->getAmount(),
            $money->getCurrency()->value
        );
    }
}
```

## Traductions

```yaml
# translations/messages.fr.yaml
client:
  created: "Client créé avec succès"
  blocked: "Client bloqué"
  validation:
    invalid_email: "Adresse email invalide"

# translations/messages.en.yaml
client:
  created: "Client created successfully"
  blocked: "Client blocked"
  validation:
    invalid_email: "Invalid email address"
```

Usage :
```php
$this->translator->trans('client.created', [], 'messages', $locale);
```

## Checklist i18n

- [ ] Country enum utilisé partout
- [ ] Strategy pattern pour logique par pays
- [ ] Formats localisés (dates, nombres, monnaies)
- [ ] Traductions pour tous les textes utilisateur
- [ ] Tests pour chaque pays supporté
- [ ] Validation locale (codes postaux, identifiants)
