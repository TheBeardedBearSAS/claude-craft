# PHP Coding Standards

## PSR Standards Compliance

### PSR-1: Basic Coding Standard

```php
<?php
// Files MUST use only <?php tags
// Files MUST use UTF-8 without BOM
// Files should EITHER declare symbols OR execute logic, not both

declare(strict_types=1);

namespace App\Domain\Entity;

// Class names MUST be declared in PascalCase
class UserAccount
{
    // Class constants MUST be declared in UPPER_SNAKE_CASE
    public const STATUS_ACTIVE = 'active';
    public const MAX_LOGIN_ATTEMPTS = 5;

    // Method names MUST be declared in camelCase
    public function getUserById(int $id): ?User
    {
        // Implementation
    }
}
```

### PSR-12: Extended Coding Style

```php
<?php

declare(strict_types=1);

namespace App\Application\Service;

use App\Domain\Entity\User;
use App\Domain\Repository\UserRepositoryInterface;
use App\Domain\ValueObject\Email;
use Psr\Log\LoggerInterface;

// Opening brace for class on new line
final class UserService
{
    // Constructor property promotion (PHP 8+)
    public function __construct(
        private readonly UserRepositoryInterface $userRepository,
        private readonly LoggerInterface $logger,
    ) {}

    // Opening brace for method on new line
    public function findByEmail(string $email): ?User
    {
        // 4 spaces indentation
        return $this->userRepository->findByEmail(
            Email::fromString($email)
        );
    }

    // Control structure braces on same line
    public function processUsers(array $users): void
    {
        if (empty($users)) {
            return;
        }

        foreach ($users as $user) {
            if (!$user->isActive()) {
                continue;
            }

            $this->processUser($user);
        }
    }
}
```

### PSR-4: Autoloading

```json
// composer.json
{
    "autoload": {
        "psr-4": {
            "App\\": "src/"
        }
    },
    "autoload-dev": {
        "psr-4": {
            "App\\Tests\\": "tests/"
        }
    }
}
```

**Namespace to file path mapping:**
- `App\Domain\Entity\User` → `src/Domain/Entity/User.php`
- `App\Application\Service\UserService` → `src/Application/Service/UserService.php`
- `App\Tests\Unit\Domain\Entity\UserTest` → `tests/Unit/Domain/Entity/UserTest.php`

## Modern PHP Features (PHP 8.x)

### Constructor Property Promotion

```php
<?php
// ❌ Old way
class UserService
{
    private UserRepositoryInterface $repository;
    private LoggerInterface $logger;

    public function __construct(
        UserRepositoryInterface $repository,
        LoggerInterface $logger
    ) {
        $this->repository = $repository;
        $this->logger = $logger;
    }
}

// ✅ PHP 8+ way
class UserService
{
    public function __construct(
        private readonly UserRepositoryInterface $repository,
        private readonly LoggerInterface $logger,
    ) {}
}
```

### Readonly Classes & Properties (PHP 8.1+)

```php
<?php
// Readonly properties (PHP 8.1)
class User
{
    public function __construct(
        public readonly string $id,
        public readonly string $email,
    ) {}
}

// Readonly class (PHP 8.2)
readonly class Email
{
    public function __construct(
        public string $value,
    ) {}
}
```

### Enums (PHP 8.1+)

```php
<?php

declare(strict_types=1);

namespace App\Domain\Enum;

// Basic enum
enum UserStatus: string
{
    case PENDING = 'pending';
    case ACTIVE = 'active';
    case SUSPENDED = 'suspended';
    case DELETED = 'deleted';

    public function isActive(): bool
    {
        return $this === self::ACTIVE;
    }

    public function canLogin(): bool
    {
        return match ($this) {
            self::ACTIVE => true,
            default => false,
        };
    }
}

// Usage
$status = UserStatus::ACTIVE;
$status->value; // 'active'
$status->name;  // 'ACTIVE'
UserStatus::from('active'); // UserStatus::ACTIVE
UserStatus::tryFrom('invalid'); // null
```

### Named Arguments

```php
<?php
// ✅ Named arguments for clarity
$user = new User(
    id: UserId::generate(),
    email: Email::fromString('john@example.com'),
    name: 'John Doe',
    status: UserStatus::PENDING,
);

// ✅ Skip optional parameters
function createNotification(
    string $message,
    string $type = 'info',
    bool $persistent = false,
    ?string $icon = null,
): Notification {
    // ...
}

createNotification(
    message: 'User created',
    persistent: true,
    // type and icon use defaults
);
```

### Match Expression

```php
<?php
// ❌ Old switch
function getStatusLabel(UserStatus $status): string
{
    switch ($status) {
        case UserStatus::PENDING:
            return 'En attente';
        case UserStatus::ACTIVE:
            return 'Actif';
        default:
            return 'Inconnu';
    }
}

// ✅ Match expression (PHP 8+)
function getStatusLabel(UserStatus $status): string
{
    return match ($status) {
        UserStatus::PENDING => 'En attente',
        UserStatus::ACTIVE => 'Actif',
        UserStatus::SUSPENDED => 'Suspendu',
        UserStatus::DELETED => 'Supprimé',
    };
}
```

### Null Safe Operator

```php
<?php
// ❌ Old way
$country = null;
if ($user !== null) {
    $address = $user->getAddress();
    if ($address !== null) {
        $country = $address->getCountry();
    }
}

// ✅ Null safe operator (PHP 8+)
$country = $user?->getAddress()?->getCountry();
```

### Union & Intersection Types

```php
<?php
// Union types (PHP 8.0)
function process(string|int $value): string|null
{
    // Can accept string or int, returns string or null
}

// Intersection types (PHP 8.1)
function handleRequest(RequestInterface&LoggableInterface $request): void
{
    // Must implement both interfaces
}

// DNF types (PHP 8.2)
function handle((A&B)|C $value): void
{
    // (A and B) or C
}
```

### Property Hooks (PHP 8.4)

> **Source:** [PHP 8.4 Property Hooks RFC](https://wiki.php.net/rfc/property-hooks), [PHP Manual](https://www.php.net/manual/en/language.oop5.property-hooks.php)

Les property hooks permettent de definir une logique get/set directement sur les proprietes, simplifiant les Value Objects et entites.

```php
<?php
// PHP 8.4 property hooks - validation inline
class Email
{
    public string $value {
        set {
            if (!filter_var($value, FILTER_VALIDATE_EMAIL)) {
                throw new InvalidArgumentException('Invalid email');
            }
            $this->value = strtolower($value);
        }
    }

    public function __construct(string $value) {
        $this->value = $value; // Validation via hook
    }
}

// Virtual property (computed)
class User
{
    public function __construct(
        public string $firstName,
        public string $lastName,
    ) {}

    public string $fullName {
        get => $this->firstName . ' ' . $this->lastName;
    }
}

$user = new User('John', 'Doe');
echo $user->fullName; // "John Doe" — pas de stockage reel
```

### Asymmetric Visibility (PHP 8.4)

> **Source:** [PHP 8.4 Asymmetric Visibility RFC](https://wiki.php.net/rfc/asymmetric-visibility), [PHP Manual](https://www.php.net/manual/en/language.oop5.visibility.php#language.oop5.visibility.asymmetric)

Permet de definir une visibilite differente pour la lecture et l'ecriture (public read, private write).

```php
<?php
// Asymmetric visibility - immutabilite renforcee
final class Money
{
    public private(set) int $amount;      // Public read, private write
    public private(set) string $currency;

    public function __construct(int $amount, string $currency) {
        $this->amount = $amount;
        $this->currency = $currency;
    }

    // Methode metier pour modifier (retourne une nouvelle instance)
    public function add(self $other): self
    {
        if ($this->currency !== $other->currency) {
            throw new InvalidArgumentException('Currency mismatch');
        }
        return new self($this->amount + $other->amount, $this->currency);
    }
}

$price = new Money(1000, 'EUR');
echo $price->amount; // ✅ 1000
$price->amount = 500; // ❌ Error: Cannot modify readonly property Money::$amount
```

**Usage recommande :** Value Objects immutables, entites avec encapsulation stricte.

## Type Declarations

### Strict Types

```php
<?php
// ALWAYS declare strict_types at the top of every file
declare(strict_types=1);

namespace App\Domain\Service;

class PriceCalculator
{
    // Full type declarations
    public function calculate(
        float $basePrice,
        int $quantity,
        ?float $discount = null,
    ): float {
        $total = $basePrice * $quantity;

        if ($discount !== null) {
            $total -= $total * ($discount / 100);
        }

        return round($total, 2);
    }
}
```

### Return Types

```php
<?php
declare(strict_types=1);

class UserRepository
{
    // Single type
    public function find(string $id): ?User
    {
        // Returns User or null
    }

    // Array with PHPDoc for generics
    /** @return User[] */
    public function findAll(): array
    {
        // Returns array of User
    }

    // Void
    public function save(User $user): void
    {
        // Returns nothing
    }

    // Never (PHP 8.1) - function never returns
    public function throwException(): never
    {
        throw new RuntimeException('Error');
    }

    // Self
    public function withEmail(Email $email): self
    {
        $clone = clone $this;
        $clone->email = $email;
        return $clone;
    }
}
```

## Naming Conventions

| Element | Convention | Example |
|---------|-----------|---------|
| Classes | PascalCase | `UserRepository`, `OrderService` |
| Interfaces | PascalCase + Interface suffix | `UserRepositoryInterface` |
| Methods | camelCase | `findById`, `calculateTotal` |
| Variables | camelCase | `$userCount`, `$isActive` |
| Constants | UPPER_SNAKE_CASE | `MAX_ATTEMPTS`, `DEFAULT_LOCALE` |
| Properties | camelCase | `$createdAt`, `$emailAddress` |
| Enums | PascalCase | `UserStatus`, `OrderState` |
| Traits | PascalCase + Trait suffix | `TimestampableTrait` |

## Documentation

### PHPDoc Standards

```php
<?php

declare(strict_types=1);

namespace App\Application\Service;

use App\Domain\Entity\User;
use App\Domain\Exception\UserNotFoundException;

/**
 * Service for managing user operations.
 *
 * This service handles user creation, updates, and retrieval
 * following domain business rules.
 */
final class UserService
{
    /**
     * Find a user by their unique identifier.
     *
     * @param string $id The user's UUID
     *
     * @throws UserNotFoundException When user is not found
     *
     * @return User The found user entity
     */
    public function findOrFail(string $id): User
    {
        $user = $this->repository->find($id);

        if ($user === null) {
            throw new UserNotFoundException($id);
        }

        return $user;
    }

    /**
     * Find all active users.
     *
     * @param int $limit Maximum number of users to return
     * @param int $offset Number of users to skip
     *
     * @return User[] Array of active user entities
     */
    public function findActive(int $limit = 10, int $offset = 0): array
    {
        return $this->repository->findByStatus(
            status: UserStatus::ACTIVE,
            limit: $limit,
            offset: $offset,
        );
    }
}
```

### Generic Types with PHPStan/Psalm

```php
<?php

declare(strict_types=1);

namespace App\Domain\Repository;

/**
 * @template T of object
 */
interface RepositoryInterface
{
    /**
     * @param string $id
     * @return T|null
     */
    public function find(string $id): ?object;

    /**
     * @return array<T>
     */
    public function findAll(): array;

    /**
     * @param T $entity
     */
    public function save(object $entity): void;
}

/**
 * @implements RepositoryInterface<User>
 */
final class UserRepository implements RepositoryInterface
{
    // Implementation
}
```

## Error Handling

### Exception Hierarchy

```php
<?php

declare(strict_types=1);

namespace App\Domain\Exception;

// Base domain exception
abstract class DomainException extends \Exception
{
}

// Specific exceptions
final class UserNotFoundException extends DomainException
{
    public function __construct(string $userId)
    {
        parent::__construct(
            sprintf('User with ID "%s" was not found', $userId)
        );
    }
}

final class InvalidEmailException extends DomainException
{
    public function __construct(string $email)
    {
        parent::__construct(
            sprintf('Email "%s" is not valid', $email)
        );
    }
}
```

### Try-Catch Best Practices

```php
<?php
// ✅ Catch specific exceptions
try {
    $user = $this->userService->findOrFail($id);
} catch (UserNotFoundException $e) {
    return new JsonResponse(['error' => 'User not found'], 404);
} catch (DomainException $e) {
    $this->logger->error($e->getMessage());
    return new JsonResponse(['error' => 'An error occurred'], 400);
}

// ❌ Avoid catching generic Exception without re-throwing
try {
    $this->process();
} catch (\Exception $e) {
    // Lost the exception details
}

// ✅ If catching generic, log and re-throw or handle properly
try {
    $this->process();
} catch (\Exception $e) {
    $this->logger->critical($e->getMessage(), ['exception' => $e]);
    throw $e;
}
```

## Code Organization

### File Structure

```php
<?php
// One class per file
// File name matches class name: UserService.php

declare(strict_types=1);

namespace App\Application\Service;

// Imports ordered:
// 1. PHP built-in classes
use DateTimeImmutable;
use InvalidArgumentException;

// 2. Third-party packages
use Psr\Log\LoggerInterface;
use Doctrine\ORM\EntityManagerInterface;

// 3. Application classes (alphabetical)
use App\Domain\Entity\User;
use App\Domain\Repository\UserRepositoryInterface;
use App\Domain\ValueObject\Email;

final class UserService
{
    // Class implementation
}
```

### Final Classes by Default

```php
<?php
// ✅ Use final by default - composition over inheritance
final class UserService
{
    // Cannot be extended
}

// ✅ Use abstract when extension is intended
abstract class AbstractRepository
{
    // Meant to be extended
}

// ✅ Use interfaces for contracts
interface UserRepositoryInterface
{
    public function find(string $id): ?User;
}
```

### PHP 8.5 Features

> **Source:** [PHP 8.5 Release](https://www.php.net/releases/8.5/en.php) | [stitcher.io](https://stitcher.io/blog/new-in-php-85) — Stable depuis novembre 2025.

#### Opérateur Pipe `|>`

Chaîner des appels de fonctions de gauche à droite, sans variables intermédiaires.

```php
<?php
// ❌ Avant PHP 8.5 — lecture de l'intérieur vers l'extérieur
$result = array_filter(
    array_map('strtolower', explode(',', $input)),
    fn(string $s) => strlen($s) > 2
);

// ✅ PHP 8.5 — lecture de gauche à droite
$result = $input
    |> explode(',', ...)
    |> array_map(strtolower(...), ...)
    |> array_filter(fn(string $s) => strlen($s) > 2);
```

#### `clone` avec surcharge de propriétés (wither pattern)

Cloner un objet en remplaçant des propriétés en une seule expression. Idéal pour les Value Objects `readonly`.

```php
<?php
// ❌ Avant PHP 8.5 — méthode wither manuelle
readonly class Money
{
    public function __construct(
        public int $amount,
        public string $currency,
    ) {}

    public function withAmount(int $amount): self
    {
        return new self($amount, $this->currency);
    }
}

// ✅ PHP 8.5 — clone with
readonly class Money
{
    public function __construct(
        public int $amount,
        public string $currency,
    ) {}
}

$price = new Money(1000, 'EUR');
$discounted = clone $price with { amount: 800 };
// $discounted->amount === 800, $discounted->currency === 'EUR'
```

#### `array_first()` et `array_last()`

Fonctions pures qui n'altèrent pas le pointeur interne du tableau (contrairement à `reset()`/`end()`).

```php
<?php
$items = [3 => 'a', 7 => 'b', 1 => 'c'];

// ✅ PHP 8.5
$first = array_first($items); // 'a' — clé 3
$last  = array_last($items);  // 'c' — clé 1

// Avec prédicat (optionnel)
$firstEven = array_first($items, fn(string $v, int $k) => $k % 2 === 0); // 'a' (clé 3+... non pair)
```

#### Attribut `#[\NoDiscard]`

Émet un avertissement si la valeur de retour d'une méthode n'est pas utilisée. Utile pour les méthodes qui retournent un résultat critique.

```php
<?php
final class Result
{
    #[\NoDiscard('Le résultat doit être inspecté')]
    public function save(): bool
    {
        // ...
        return $success;
    }
}

$result = new Result();
$result->save(); // ⚠️ Deprecated: Le résultat doit être inspecté
$ok = $result->save(); // ✅ OK
```

#### Extension URI (intégrée)

Parseur URI standards-conformes (RFC 3986 + WHATWG), toujours disponible, objets immutables avec withers.

```php
<?php
use Uri\Rfc3986\Uri;
use Uri\WhatWg\Url;

// RFC 3986
$uri = Uri::parse('https://example.com/path?q=1#frag');
$updated = $uri->withHost('other.com')->withPath('/new');

// WHATWG (résolution relative, normalisation)
$url = Url::parse('https://example.com/base/');
$resolved = $url->withHref('../page');
// Lève une exception sur input invalide
```

---

## PHP 8.5 Deprecations

> **Source:** [PHP RFC: Deprecations for PHP 8.5](https://wiki.php.net/rfc/deprecations_php_8_5)

Ces constructions émettent une `E_DEPRECATED` en PHP 8.5 et seront supprimées en PHP 9.

### 1. Opérateur backtick (alias de `shell_exec`)

```php
<?php
// ❌ Déprécié PHP 8.5
$output = `ls -la`;

// ✅ Remplacement
$output = shell_exec('ls -la');
```

### 2. Casts non-canoniques

Les alias de types (`boolean`, `integer`, `double`, `binary`) sont dépréciés. Utiliser les noms canoniques.

```php
<?php
// ❌ Déprécié PHP 8.5
$a = (boolean) $value;  // → utiliser (bool)
$b = (integer) $value;  // → utiliser (int)
$c = (double)  $value;  // → utiliser (float)
$d = (binary)  $value;  // → utiliser (string)

// ✅ Canoniques
$a = (bool)   $value;
$b = (int)    $value;
$c = (float)  $value;
$d = (string) $value;
```

### 3. Point-virgule en fin de `case`

```php
<?php
// ❌ Déprécié PHP 8.5 — case terminé par ;
switch ($status) {
    case 'active';   // point-virgule !
        doSomething();
        break;
}

// ✅ Correct — case terminé par :
switch ($status) {
    case 'active':
        doSomething();
        break;
}
```

---

## Coding Standards Checklist (2026)

- [ ] `declare(strict_types=1)` at top of every file
- [ ] PSR-12 formatting applied
- [ ] PSR-4 autoloading configured
- [ ] All methods have return type declarations
- [ ] All parameters have type declarations
- [ ] Properties use readonly where appropriate
- [ ] **Property hooks (PHP 8.4+)** for Value Objects with validation
- [ ] **Asymmetric visibility (PHP 8.4+)** for immutable properties
- [ ] **Pipe operator `|>` (PHP 8.5+)** for function chains instead of nested calls
- [ ] **`clone with` (PHP 8.5+)** for wither pattern on readonly classes
- [ ] **`#[\NoDiscard]` (PHP 8.5+)** on methods whose return value must be checked
- [ ] No deprecated backtick operator, non-canonical casts `(boolean)/(integer)/(double)`, or `case;` syntax
- [ ] Enums used instead of class constants for states
- [ ] PHPDoc for complex methods and generics
- [ ] Final classes by default
- [ ] Specific exceptions for domain errors
- [ ] Named arguments for clarity on complex calls
