# PHP Architecture - Clean Architecture & Modern Patterns

## Architectural Principles

### 1. Clean Architecture Layers

PHP applications should follow Clean Architecture with clear separation of concerns:

```
src/
├── Domain/                    # Core business logic (no dependencies)
│   ├── Entity/                # Business entities
│   ├── ValueObject/           # Immutable value types
│   ├── Repository/            # Repository interfaces (contracts)
│   ├── Service/               # Domain services
│   ├── Event/                 # Domain events
│   └── Exception/             # Domain exceptions
│
├── Application/               # Use cases & orchestration
│   ├── UseCase/               # Application use cases
│   │   ├── User/
│   │   │   ├── CreateUser/
│   │   │   │   ├── CreateUserCommand.php
│   │   │   │   ├── CreateUserHandler.php
│   │   │   │   └── CreateUserResponse.php
│   │   │   └── GetUser/
│   │   └── Order/
│   ├── DTO/                   # Data Transfer Objects
│   ├── Service/               # Application services
│   └── Exception/             # Application exceptions
│
├── Infrastructure/            # External concerns
│   ├── Persistence/           # Database implementations
│   │   ├── Doctrine/          # Doctrine ORM repositories
│   │   └── PDO/               # Raw PDO repositories
│   ├── Http/                  # HTTP client implementations
│   ├── Mailer/                # Email service implementations
│   ├── Cache/                 # Cache implementations
│   └── Queue/                 # Queue implementations
│
└── Presentation/              # UI & API layer
    ├── Controller/            # HTTP controllers
    ├── Console/               # CLI commands
    ├── Api/                   # API endpoints
    │   ├── v1/
    │   └── v2/
    └── Middleware/            # HTTP middleware
```

### 2. Dependency Rule

```
┌─────────────────────────────────────────────────────┐
│                   Presentation                       │
│              (Controllers, Console)                  │
└────────────────────────┬────────────────────────────┘
                         │ depends on
┌────────────────────────▼────────────────────────────┐
│                   Infrastructure                     │
│         (Doctrine, PDO, HTTP Clients)                │
└────────────────────────┬────────────────────────────┘
                         │ depends on
┌────────────────────────▼────────────────────────────┐
│                    Application                       │
│           (Use Cases, Services, DTOs)                │
└────────────────────────┬────────────────────────────┘
                         │ depends on
┌────────────────────────▼────────────────────────────┐
│                      Domain                          │
│     (Entities, Value Objects, Interfaces)            │
└─────────────────────────────────────────────────────┘
```

**CRITICAL**: Dependencies MUST flow inward only. Domain has NO external dependencies.

## Domain Layer

### Entity Design

```php
<?php

declare(strict_types=1);

namespace App\Domain\Entity;

use App\Domain\ValueObject\Email;
use App\Domain\ValueObject\UserId;
use App\Domain\Event\UserCreatedEvent;
use DateTimeImmutable;

final class User
{
    private array $domainEvents = [];

    private function __construct(
        private readonly UserId $id,
        private Email $email,
        private string $name,
        private UserStatus $status,
        private readonly DateTimeImmutable $createdAt,
    ) {}

    public static function create(
        UserId $id,
        Email $email,
        string $name,
    ): self {
        $user = new self(
            id: $id,
            email: $email,
            name: $name,
            status: UserStatus::PENDING,
            createdAt: new DateTimeImmutable(),
        );

        $user->recordEvent(new UserCreatedEvent($id));

        return $user;
    }

    public function activate(): void
    {
        if ($this->status !== UserStatus::PENDING) {
            throw new InvalidUserStateException('Only pending users can be activated');
        }

        $this->status = UserStatus::ACTIVE;
        $this->recordEvent(new UserActivatedEvent($this->id));
    }

    public function changeEmail(Email $newEmail): void
    {
        $this->email = $newEmail;
    }

    public function getId(): UserId
    {
        return $this->id;
    }

    public function getEmail(): Email
    {
        return $this->email;
    }

    public function getName(): string
    {
        return $this->name;
    }

    public function getStatus(): UserStatus
    {
        return $this->status;
    }

    public function pullDomainEvents(): array
    {
        $events = $this->domainEvents;
        $this->domainEvents = [];
        return $events;
    }

    private function recordEvent(object $event): void
    {
        $this->domainEvents[] = $event;
    }
}
```

### Value Objects

```php
<?php

declare(strict_types=1);

namespace App\Domain\ValueObject;

use App\Domain\Exception\InvalidEmailException;

final readonly class Email
{
    private function __construct(
        private string $value,
    ) {}

    public static function fromString(string $email): self
    {
        $email = trim(strtolower($email));

        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            throw new InvalidEmailException($email);
        }

        return new self($email);
    }

    public function getValue(): string
    {
        return $this->value;
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

```php
<?php

declare(strict_types=1);

namespace App\Domain\ValueObject;

use Ramsey\Uuid\Uuid;
use Ramsey\Uuid\UuidInterface;

final readonly class UserId
{
    private function __construct(
        private UuidInterface $value,
    ) {}

    public static function generate(): self
    {
        return new self(Uuid::uuid4());
    }

    public static function fromString(string $id): self
    {
        return new self(Uuid::fromString($id));
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
```

### Repository Interface (Domain)

```php
<?php

declare(strict_types=1);

namespace App\Domain\Repository;

use App\Domain\Entity\User;
use App\Domain\ValueObject\UserId;
use App\Domain\ValueObject\Email;

interface UserRepositoryInterface
{
    public function find(UserId $id): ?User;

    public function findByEmail(Email $email): ?User;

    /** @return User[] */
    public function findAll(): array;

    public function save(User $user): void;

    public function delete(User $user): void;

    public function nextIdentity(): UserId;
}
```

## Application Layer

### Use Case Pattern (Command/Handler)

```php
<?php

declare(strict_types=1);

namespace App\Application\UseCase\User\CreateUser;

final readonly class CreateUserCommand
{
    public function __construct(
        public string $email,
        public string $name,
        public string $password,
    ) {}
}
```

```php
<?php

declare(strict_types=1);

namespace App\Application\UseCase\User\CreateUser;

use App\Domain\Entity\User;
use App\Domain\Repository\UserRepositoryInterface;
use App\Domain\ValueObject\Email;
use App\Application\Exception\UserAlreadyExistsException;
use App\Application\Service\PasswordHasherInterface;

final readonly class CreateUserHandler
{
    public function __construct(
        private UserRepositoryInterface $userRepository,
        private PasswordHasherInterface $passwordHasher,
    ) {}

    public function handle(CreateUserCommand $command): CreateUserResponse
    {
        $email = Email::fromString($command->email);

        // Check if user exists
        if ($this->userRepository->findByEmail($email) !== null) {
            throw new UserAlreadyExistsException($email);
        }

        // Create user
        $user = User::create(
            id: $this->userRepository->nextIdentity(),
            email: $email,
            name: $command->name,
        );

        // Save
        $this->userRepository->save($user);

        return new CreateUserResponse(
            id: $user->getId()->getValue(),
            email: $user->getEmail()->getValue(),
            name: $user->getName(),
        );
    }
}
```

```php
<?php

declare(strict_types=1);

namespace App\Application\UseCase\User\CreateUser;

final readonly class CreateUserResponse
{
    public function __construct(
        public string $id,
        public string $email,
        public string $name,
    ) {}
}
```

### Query Pattern

```php
<?php

declare(strict_types=1);

namespace App\Application\UseCase\User\GetUser;

final readonly class GetUserQuery
{
    public function __construct(
        public string $userId,
    ) {}
}
```

```php
<?php

declare(strict_types=1);

namespace App\Application\UseCase\User\GetUser;

use App\Domain\Repository\UserRepositoryInterface;
use App\Domain\ValueObject\UserId;
use App\Application\Exception\UserNotFoundException;

final readonly class GetUserHandler
{
    public function __construct(
        private UserRepositoryInterface $userRepository,
    ) {}

    public function handle(GetUserQuery $query): GetUserResponse
    {
        $user = $this->userRepository->find(
            UserId::fromString($query->userId)
        );

        if ($user === null) {
            throw new UserNotFoundException($query->userId);
        }

        return new GetUserResponse(
            id: $user->getId()->getValue(),
            email: $user->getEmail()->getValue(),
            name: $user->getName(),
            status: $user->getStatus()->value,
        );
    }
}
```

## Infrastructure Layer

### Doctrine Repository Implementation

```php
<?php

declare(strict_types=1);

namespace App\Infrastructure\Persistence\Doctrine;

use App\Domain\Entity\User;
use App\Domain\Repository\UserRepositoryInterface;
use App\Domain\ValueObject\Email;
use App\Domain\ValueObject\UserId;
use Doctrine\ORM\EntityManagerInterface;
use Doctrine\ORM\EntityRepository;

final class DoctrineUserRepository implements UserRepositoryInterface
{
    private EntityRepository $repository;

    public function __construct(
        private readonly EntityManagerInterface $entityManager,
    ) {
        $this->repository = $entityManager->getRepository(User::class);
    }

    public function find(UserId $id): ?User
    {
        return $this->repository->find($id->getValue());
    }

    public function findByEmail(Email $email): ?User
    {
        return $this->repository->findOneBy(['email.value' => $email->getValue()]);
    }

    public function findAll(): array
    {
        return $this->repository->findAll();
    }

    public function save(User $user): void
    {
        $this->entityManager->persist($user);
        $this->entityManager->flush();
    }

    public function delete(User $user): void
    {
        $this->entityManager->remove($user);
        $this->entityManager->flush();
    }

    public function nextIdentity(): UserId
    {
        return UserId::generate();
    }
}
```

## Presentation Layer

### Controller (Framework-Agnostic)

```php
<?php

declare(strict_types=1);

namespace App\Presentation\Controller;

use App\Application\UseCase\User\CreateUser\CreateUserCommand;
use App\Application\UseCase\User\CreateUser\CreateUserHandler;
use App\Application\UseCase\User\GetUser\GetUserQuery;
use App\Application\UseCase\User\GetUser\GetUserHandler;
use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;

final readonly class UserController
{
    public function __construct(
        private CreateUserHandler $createUserHandler,
        private GetUserHandler $getUserHandler,
    ) {}

    public function create(ServerRequestInterface $request): ResponseInterface
    {
        $data = $request->getParsedBody();

        $command = new CreateUserCommand(
            email: $data['email'] ?? '',
            name: $data['name'] ?? '',
            password: $data['password'] ?? '',
        );

        $response = $this->createUserHandler->handle($command);

        return new JsonResponse($response, 201);
    }

    public function show(ServerRequestInterface $request, string $id): ResponseInterface
    {
        $query = new GetUserQuery($id);
        $response = $this->getUserHandler->handle($query);

        return new JsonResponse($response);
    }
}
```

## Modern PHP Project Structure

### Standard PHP Package Structure

```
project/
├── public/                    # Document root
│   └── index.php              # Single entry point
│
├── src/                       # Application source code
│   ├── Domain/
│   ├── Application/
│   ├── Infrastructure/
│   └── Presentation/
│
├── config/                    # Configuration files
│   ├── services.php           # DI container config
│   ├── routes.php             # Route definitions
│   └── packages/              # Package-specific config
│
├── tests/                     # Test suite
│   ├── Unit/
│   │   ├── Domain/
│   │   └── Application/
│   ├── Integration/
│   │   └── Infrastructure/
│   └── Functional/
│       └── Presentation/
│
├── var/                       # Generated files (gitignored)
│   ├── cache/
│   └── log/
│
├── vendor/                    # Composer dependencies
│
├── composer.json              # Dependency management
├── phpunit.xml                # PHPUnit configuration
├── phpstan.neon               # PHPStan configuration
└── .php-cs-fixer.php          # PHP-CS-Fixer config
```

## Design Patterns

### Repository Pattern

```php
// Domain defines the contract
interface OrderRepositoryInterface
{
    public function find(OrderId $id): ?Order;
    public function save(Order $order): void;
}

// Infrastructure provides implementation
final class DoctrineOrderRepository implements OrderRepositoryInterface
{
    // Implementation details hidden from domain
}
```

### Factory Pattern

```php
<?php

declare(strict_types=1);

namespace App\Domain\Factory;

use App\Domain\Entity\Order;
use App\Domain\Entity\OrderItem;
use App\Domain\ValueObject\OrderId;
use App\Domain\ValueObject\CustomerId;

final class OrderFactory
{
    public function createFromCart(
        CustomerId $customerId,
        array $cartItems,
    ): Order {
        $order = Order::create(
            id: OrderId::generate(),
            customerId: $customerId,
        );

        foreach ($cartItems as $item) {
            $order->addItem(
                new OrderItem(
                    productId: $item->getProductId(),
                    quantity: $item->getQuantity(),
                    price: $item->getPrice(),
                )
            );
        }

        return $order;
    }
}
```

### Strategy Pattern

```php
<?php

declare(strict_types=1);

namespace App\Domain\Service\Pricing;

interface PricingStrategyInterface
{
    public function calculate(Money $basePrice, int $quantity): Money;
}

final readonly class StandardPricing implements PricingStrategyInterface
{
    public function calculate(Money $basePrice, int $quantity): Money
    {
        return $basePrice->multiply($quantity);
    }
}

final readonly class BulkPricing implements PricingStrategyInterface
{
    public function __construct(
        private int $threshold,
        private float $discountPercent,
    ) {}

    public function calculate(Money $basePrice, int $quantity): Money
    {
        $total = $basePrice->multiply($quantity);

        if ($quantity >= $this->threshold) {
            return $total->subtract(
                $total->multiply($this->discountPercent / 100)
            );
        }

        return $total;
    }
}
```

## Architecture Checklist

- [ ] Domain layer has NO external dependencies
- [ ] Application layer only depends on Domain
- [ ] Infrastructure implements interfaces from Domain
- [ ] Presentation depends on Application (not Domain directly)
- [ ] Entities have private setters and factory methods
- [ ] Value Objects are immutable (readonly classes)
- [ ] Repository interfaces are in Domain layer
- [ ] DTOs are used for data transfer, not entities
- [ ] Use Cases follow single responsibility
- [ ] Dependencies are injected, not created internally
