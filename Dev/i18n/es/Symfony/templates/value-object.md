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
