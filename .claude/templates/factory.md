# Template: Factory Pattern

> **Pattern** - Factory pour créer des objets sans exposer la logique de création
> Référence: `.claude/rules/04-solid-principles.md` (DIP, OCP)

## Principe

Le factory pattern encapsule la logique de création d'objets, facilitant l'ajout de nouveaux types sans modifier le code existant.

---

## Template PHP 8.4+

```php
<?php

declare(strict_types=1);

namespace App\Factory;

/**
 * Interface: [ProductInterface]
 *
 * Responsabilité: [Description]
 */
interface [ProductInterface]
{
    public function [operation](): [ReturnType];
}

/**
 * Concrete Product A
 */
final readonly class [ConcreteProductA] implements [ProductInterface]
{
    public function [operation](): [ReturnType]
    {
        return [result];
    }
}

/**
 * Concrete Product B
 */
final readonly class [ConcreteProductB] implements [ProductInterface]
{
    public function [operation](): [ReturnType]
    {
        return [result];
    }
}

/**
 * Factory: [NomFactory]
 *
 * Responsabilité: Créer des instances de [ProductInterface]
 *
 * Use cases:
 * - [Use case 1]
 * - [Use case 2]
 */
final readonly class [NomFactory]
{
    public function create(string $type): [ProductInterface]
    {
        return match ($type) {
            'type_a' => new [ConcreteProductA](),
            'type_b' => new [ConcreteProductB](),
            default => throw new \InvalidArgumentException("Unknown type: {$type}"),
        };
    }
}
```

### Exemple: Payment Method Factory

```php
<?php

declare(strict_types=1);

namespace App\Factory;

use App\Payment\PaymentMethodInterface;
use App\Payment\CreditCardPayment;
use App\Payment\PayPalPayment;
use App\Payment\BankTransferPayment;

interface PaymentMethodInterface
{
    public function process(float $amount): bool;
    public function getFeesPercent(): float;
}

final readonly class CreditCardPayment implements PaymentMethodInterface
{
    public function process(float $amount): bool
    {
        // Logique carte bancaire
        return true;
    }

    public function getFeesPercent(): float
    {
        return 2.9;
    }
}

final readonly class PayPalPayment implements PaymentMethodInterface
{
    public function process(float $amount): bool
    {
        // Logique PayPal
        return true;
    }

    public function getFeesPercent(): float
    {
        return 3.4;
    }
}

final readonly class PaymentMethodFactory
{
    public function create(string $method): PaymentMethodInterface
    {
        return match ($method) {
            'credit_card' => new CreditCardPayment(),
            'paypal' => new PayPalPayment(),
            'bank_transfer' => new BankTransferPayment(),
            default => throw new \InvalidArgumentException(
                "Unknown payment method: {$method}"
            ),
        };
    }
}

// Usage
$factory = new PaymentMethodFactory();
$payment = $factory->create('paypal');
$payment->process(100.0);
```

---

## Template C# 14

```csharp
namespace App.Factory;

/// <summary>
/// Interface: IProduct
///
/// Responsabilité: [Description]
/// </summary>
public interface IProduct
{
    [ReturnType] Operation();
}

/// <summary>
/// Concrete Product A
/// </summary>
public sealed class ConcreteProductA : IProduct
{
    public [ReturnType] Operation()
    {
        return [result];
    }
}

/// <summary>
/// Concrete Product B
/// </summary>
public sealed class ConcreteProductB : IProduct
{
    public [ReturnType] Operation()
    {
        return [result];
    }
}

/// <summary>
/// Factory: [NomFactory]
///
/// Responsabilité: Créer des instances de IProduct
/// </summary>
public sealed class [NomFactory]
{
    public IProduct Create(string type)
    {
        return type switch
        {
            "type_a" => new ConcreteProductA(),
            "type_b" => new ConcreteProductB(),
            _ => throw new ArgumentException($"Unknown type: {type}")
        };
    }
}
```

### Exemple: Abstract Factory (C#)

```csharp
// Abstract Products
public interface IButton
{
    void Render();
}

public interface ICheckbox
{
    void Render();
}

// Concrete Products (Windows)
public sealed class WindowsButton : IButton
{
    public void Render() => Console.WriteLine("Rendering Windows button");
}

public sealed class WindowsCheckbox : ICheckbox
{
    public void Render() => Console.WriteLine("Rendering Windows checkbox");
}

// Concrete Products (Mac)
public sealed class MacButton : IButton
{
    public void Render() => Console.WriteLine("Rendering Mac button");
}

public sealed class MacCheckbox : ICheckbox
{
    public void Render() => Console.WriteLine("Rendering Mac checkbox");
}

// Abstract Factory
public interface IGUIFactory
{
    IButton CreateButton();
    ICheckbox CreateCheckbox();
}

// Concrete Factory (Windows)
public sealed class WindowsFactory : IGUIFactory
{
    public IButton CreateButton() => new WindowsButton();
    public ICheckbox CreateCheckbox() => new WindowsCheckbox();
}

// Concrete Factory (Mac)
public sealed class MacFactory : IGUIFactory
{
    public IButton CreateButton() => new MacButton();
    public ICheckbox CreateCheckbox() => new MacCheckbox();
}

// Usage
IGUIFactory factory = operatingSystem == "Windows"
    ? new WindowsFactory()
    : new MacFactory();

var button = factory.CreateButton();
var checkbox = factory.CreateCheckbox();

button.Render();
checkbox.Render();
```
