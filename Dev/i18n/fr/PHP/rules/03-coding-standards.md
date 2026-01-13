# Standards de Code PHP

## Conformité aux Standards PSR

### PSR-1: Standard de Codage de Base

```php
<?php
// Les fichiers DOIVENT utiliser uniquement les balises <?php
// Les fichiers DOIVENT utiliser UTF-8 sans BOM
// Les fichiers DEVRAIENT SOIT déclarer des symboles SOIT exécuter de la logique, pas les deux

declare(strict_types=1);

namespace App\Domain\Entity;

// Les noms de classes DOIVENT être déclarés en PascalCase
class UserAccount
{
    // Les constantes de classe DOIVENT être déclarées en UPPER_SNAKE_CASE
    public const STATUS_ACTIVE = 'active';
    public const MAX_LOGIN_ATTEMPTS = 5;

    // Les noms de méthodes DOIVENT être déclarés en camelCase
    public function getUserById(int $id): ?User
    {
        // Implémentation
    }
}
```

### PSR-12: Style de Codage Étendu

```php
<?php

declare(strict_types=1);

namespace App\Application\Service;

use App\Domain\Entity\User;
use App\Domain\Repository\UserRepositoryInterface;
use App\Domain\ValueObject\Email;
use Psr\Log\LoggerInterface;

// Accolade ouvrante pour classe sur nouvelle ligne
final class UserService
{
    // Promotion de propriétés de constructeur (PHP 8+)
    public function __construct(
        private readonly UserRepositoryInterface $userRepository,
        private readonly LoggerInterface $logger,
    ) {}

    // Accolade ouvrante pour méthode sur nouvelle ligne
    public function findByEmail(string $email): ?User
    {
        // Indentation de 4 espaces
        return $this->userRepository->findByEmail(
            Email::fromString($email)
        );
    }

    // Accolades de structure de contrôle sur la même ligne
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

**Correspondance namespace vers chemin de fichier:**
- `App\Domain\Entity\User` → `src/Domain/Entity/User.php`
- `App\Application\Service\UserService` → `src/Application/Service/UserService.php`
- `App\Tests\Unit\Domain\Entity\UserTest` → `tests/Unit/Domain/Entity/UserTest.php`

## Fonctionnalités Modernes PHP (PHP 8.x)

### Promotion de Propriétés de Constructeur

```php
<?php
// ❌ Ancienne méthode
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

// ✅ Méthode PHP 8+
class UserService
{
    public function __construct(
        private readonly UserRepositoryInterface $repository,
        private readonly LoggerInterface $logger,
    ) {}
}
```

### Classes & Propriétés Readonly (PHP 8.1+)

```php
<?php
// Propriétés readonly (PHP 8.1)
class User
{
    public function __construct(
        public readonly string $id,
        public readonly string $email,
    ) {}
}

// Classe readonly (PHP 8.2)
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

// Enum basique
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

// Utilisation
$status = UserStatus::ACTIVE;
$status->value; // 'active'
$status->name;  // 'ACTIVE'
UserStatus::from('active'); // UserStatus::ACTIVE
UserStatus::tryFrom('invalid'); // null
```

### Arguments Nommés

```php
<?php
// ✅ Arguments nommés pour plus de clarté
$user = new User(
    id: UserId::generate(),
    email: Email::fromString('john@example.com'),
    name: 'John Doe',
    status: UserStatus::PENDING,
);

// ✅ Sauter les paramètres optionnels
function createNotification(
    string $message,
    string $type = 'info',
    bool $persistent = false,
    ?string $icon = null,
): Notification {
    // ...
}

createNotification(
    message: 'Utilisateur créé',
    persistent: true,
    // type et icon utilisent les valeurs par défaut
);
```

### Expression Match

```php
<?php
// ❌ Ancien switch
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

// ✅ Expression match (PHP 8+)
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

### Opérateur Null Safe

```php
<?php
// ❌ Ancienne méthode
$country = null;
if ($user !== null) {
    $address = $user->getAddress();
    if ($address !== null) {
        $country = $address->getCountry();
    }
}

// ✅ Opérateur null safe (PHP 8+)
$country = $user?->getAddress()?->getCountry();
```

### Types Union & Intersection

```php
<?php
// Types union (PHP 8.0)
function process(string|int $value): string|null
{
    // Peut accepter string ou int, retourne string ou null
}

// Types intersection (PHP 8.1)
function handleRequest(RequestInterface&LoggableInterface $request): void
{
    // Doit implémenter les deux interfaces
}

// Types DNF (PHP 8.2)
function handle((A&B)|C $value): void
{
    // (A et B) ou C
}
```

### Property Hooks (PHP 8.4)

```php
<?php
// Hooks de propriété PHP 8.4
class User
{
    public string $email {
        set {
            if (!filter_var($value, FILTER_VALIDATE_EMAIL)) {
                throw new InvalidArgumentException('Email invalide');
            }
            $this->email = strtolower($value);
        }
        get => $this->email;
    }

    public string $fullName {
        get => $this->firstName . ' ' . $this->lastName;
    }
}
```

## Déclarations de Types

### Types Stricts

```php
<?php
// TOUJOURS déclarer strict_types en haut de chaque fichier
declare(strict_types=1);

namespace App\Domain\Service;

class PriceCalculator
{
    // Déclarations de types complètes
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

### Types de Retour

```php
<?php
declare(strict_types=1);

class UserRepository
{
    // Type unique
    public function find(string $id): ?User
    {
        // Retourne User ou null
    }

    // Array avec PHPDoc pour les génériques
    /** @return User[] */
    public function findAll(): array
    {
        // Retourne un tableau de User
    }

    // Void
    public function save(User $user): void
    {
        // Ne retourne rien
    }

    // Never (PHP 8.1) - la fonction ne retourne jamais
    public function throwException(): never
    {
        throw new RuntimeException('Erreur');
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

## Conventions de Nommage

| Élément | Convention | Exemple |
|---------|-----------|---------|
| Classes | PascalCase | `UserRepository`, `OrderService` |
| Interfaces | PascalCase + suffixe Interface | `UserRepositoryInterface` |
| Méthodes | camelCase | `findById`, `calculateTotal` |
| Variables | camelCase | `$userCount`, `$isActive` |
| Constantes | UPPER_SNAKE_CASE | `MAX_ATTEMPTS`, `DEFAULT_LOCALE` |
| Propriétés | camelCase | `$createdAt`, `$emailAddress` |
| Enums | PascalCase | `UserStatus`, `OrderState` |
| Traits | PascalCase + suffixe Trait | `TimestampableTrait` |

## Documentation

### Standards PHPDoc

```php
<?php

declare(strict_types=1);

namespace App\Application\Service;

use App\Domain\Entity\User;
use App\Domain\Exception\UserNotFoundException;

/**
 * Service de gestion des opérations utilisateur.
 *
 * Ce service gère la création, la mise à jour et la récupération
 * des utilisateurs en suivant les règles métier du domaine.
 */
final class UserService
{
    /**
     * Trouve un utilisateur par son identifiant unique.
     *
     * @param string $id L'UUID de l'utilisateur
     *
     * @throws UserNotFoundException Lorsque l'utilisateur n'est pas trouvé
     *
     * @return User L'entité utilisateur trouvée
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
     * Trouve tous les utilisateurs actifs.
     *
     * @param int $limit Nombre maximum d'utilisateurs à retourner
     * @param int $offset Nombre d'utilisateurs à sauter
     *
     * @return User[] Tableau d'entités utilisateur actives
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

### Types Génériques avec PHPStan/Psalm

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
    // Implémentation
}
```

## Gestion des Erreurs

### Hiérarchie des Exceptions

```php
<?php

declare(strict_types=1);

namespace App\Domain\Exception;

// Exception de domaine de base
abstract class DomainException extends \Exception
{
}

// Exceptions spécifiques
final class UserNotFoundException extends DomainException
{
    public function __construct(string $userId)
    {
        parent::__construct(
            sprintf('L\'utilisateur avec l\'ID "%s" n\'a pas été trouvé', $userId)
        );
    }
}

final class InvalidEmailException extends DomainException
{
    public function __construct(string $email)
    {
        parent::__construct(
            sprintf('L\'email "%s" n\'est pas valide', $email)
        );
    }
}
```

### Bonnes Pratiques Try-Catch

```php
<?php
// ✅ Attraper des exceptions spécifiques
try {
    $user = $this->userService->findOrFail($id);
} catch (UserNotFoundException $e) {
    return new JsonResponse(['error' => 'Utilisateur non trouvé'], 404);
} catch (DomainException $e) {
    $this->logger->error($e->getMessage());
    return new JsonResponse(['error' => 'Une erreur est survenue'], 400);
}

// ❌ Éviter d'attraper Exception générique sans re-throw
try {
    $this->process();
} catch (\Exception $e) {
    // Détails de l'exception perdus
}

// ✅ Si attrape générique, logger et re-throw ou gérer correctement
try {
    $this->process();
} catch (\Exception $e) {
    $this->logger->critical($e->getMessage(), ['exception' => $e]);
    throw $e;
}
```

## Checklist Standards de Code

- [ ] `declare(strict_types=1)` en haut de chaque fichier
- [ ] Formatage PSR-12 appliqué
- [ ] Autoloading PSR-4 configuré
- [ ] Toutes les méthodes ont des déclarations de type de retour
- [ ] Tous les paramètres ont des déclarations de type
- [ ] Les propriétés utilisent readonly quand approprié
- [ ] Les enums utilisés à la place des constantes de classe pour les états
- [ ] PHPDoc pour les méthodes complexes et les génériques
- [ ] Classes finales par défaut
- [ ] Exceptions spécifiques pour les erreurs de domaine
- [ ] Arguments nommés pour plus de clarté sur les appels complexes
