# Regla 09: Internacionalización (i18n)

## Países soportados

**7 países europeos**: FR, EN, DE, ES, IT, NL, BE

Cada país tiene:
- Su propia fiscalidad (IVA)
- Sus formatos (fechas, números, monedas)
- Sus validaciones (SIRET, VAT, códigos postales)
- Sus workflows de negocio específicos

## Country Enum

```php
enum Country: string
{
    case FR = 'FR';  // Francia
    case EN = 'EN';  // Inglaterra
    case DE = 'DE';  // Alemania
    case ES = 'ES';  // España
    case IT = 'IT';  // Italia
    case NL = 'NL';  // Países Bajos
    case BE = 'BE';  // Bélgica

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

## Strategy Pattern - Servicios por país

```php
// Domain Service Interface
interface TaxCalculatorInterface
{
    public function calculateVAT(Money $amount): Money;
    public function getVATRate(): TaxRate;
}

// Implementación Francia
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

// Implementación Alemania
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
        // ... otros países
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

## Formatos localizados

### Fechas

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

### Números y Monedas

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

## Traducciones

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

Uso:
```php
$this->translator->trans('client.created', [], 'messages', $locale);
```

## Checklist i18n

- [ ] Country enum utilizado en todas partes
- [ ] Strategy pattern para lógica por país
- [ ] Formatos localizados (fechas, números, monedas)
- [ ] Traducciones para todos los textos de usuario
- [ ] Tests para cada país soportado
- [ ] Validación local (códigos postales, identificadores)
