# Regel 09: Internationalisierung (i18n)

## Unterstützte Länder

**7 europäische Länder**: FR, EN, DE, ES, IT, NL, BE

Jedes Land hat:
- Seine eigene Besteuerung (MwSt)
- Seine Formate (Daten, Zahlen, Währungen)
- Seine Validierungen (SIRET, VAT, Postleitzahlen)
- Seine spezifischen geschäftlichen Workflows

## Country Enum

```php
enum Country: string
{
    case FR = 'FR';  // Frankreich
    case EN = 'EN';  // England
    case DE = 'DE';  // Deutschland
    case ES = 'ES';  // Spanien
    case IT = 'IT';  // Italien
    case NL = 'NL';  // Niederlande
    case BE = 'BE';  // Belgien

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

## Strategy Pattern - Services pro Land

```php
// Domain Service Interface
interface TaxCalculatorInterface
{
    public function calculateVAT(Money $amount): Money;
    public function getVATRate(): TaxRate;
}

// Französische Implementierung
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

// Deutsche Implementierung
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
        // ... weitere Länder
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

## Lokalisierte Formate

### Daten

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

### Zahlen und Währungen

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

## Übersetzungen

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

Verwendung:
```php
$this->translator->trans('client.created', [], 'messages', $locale);
```

## i18n Checkliste

- [ ] Country Enum überall verwendet
- [ ] Strategy Pattern für länderspezifische Logik
- [ ] Lokalisierte Formate (Daten, Zahlen, Währungen)
- [ ] Übersetzungen für alle Benutzertexte
- [ ] Tests für jedes unterstützte Land
- [ ] Lokale Validierung (Postleitzahlen, Identifikatoren)
