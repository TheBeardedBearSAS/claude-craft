# Architecture PHP - Clean Architecture & Patterns Modernes

## Principes Architecturaux

### 1. Couches Clean Architecture

Les applications PHP doivent suivre la Clean Architecture avec une séparation claire des responsabilités :

```
src/
├── Domain/                    # Logique métier (aucune dépendance)
│   ├── Entity/                # Entités métier
│   ├── ValueObject/           # Types de valeur immuables
│   ├── Repository/            # Interfaces de repository (contrats)
│   ├── Service/               # Services de domaine
│   ├── Event/                 # Événements de domaine
│   └── Exception/             # Exceptions de domaine
│
├── Application/               # Cas d'utilisation & orchestration
│   ├── UseCase/               # Cas d'utilisation applicatifs
│   │   ├── User/
│   │   │   ├── CreateUser/
│   │   │   │   ├── CreateUserCommand.php
│   │   │   │   ├── CreateUserHandler.php
│   │   │   │   └── CreateUserResponse.php
│   │   │   └── GetUser/
│   │   └── Order/
│   ├── DTO/                   # Objets de transfert de données
│   ├── Service/               # Services applicatifs
│   └── Exception/             # Exceptions applicatives
│
├── Infrastructure/            # Préoccupations externes
│   ├── Persistence/           # Implémentations base de données
│   │   ├── Doctrine/          # Repositories Doctrine ORM
│   │   └── PDO/               # Repositories PDO brut
│   ├── Http/                  # Implémentations client HTTP
│   ├── Mailer/                # Implémentations service email
│   ├── Cache/                 # Implémentations cache
│   └── Queue/                 # Implémentations file de messages
│
└── Presentation/              # UI & couche API
    ├── Controller/            # Contrôleurs HTTP
    ├── Console/               # Commandes CLI
    ├── Api/                   # Points d'entrée API
    │   ├── v1/
    │   └── v2/
    └── Middleware/            # Middleware HTTP
```

### 2. Règle de Dépendance

```
┌─────────────────────────────────────────────────────┐
│                    Presentation                      │
│            (Contrôleurs, Commandes CLI)              │
└────────────────────────┬────────────────────────────┘
                         │ dépend de
┌────────────────────────▼────────────────────────────┐
│                   Infrastructure                     │
│          (Doctrine, Mailers, Caches)                 │
└────────────────────────┬────────────────────────────┘
                         │ dépend de
┌────────────────────────▼────────────────────────────┐
│                    Application                       │
│          (Use Cases, DTOs, Services)                 │
└────────────────────────┬────────────────────────────┘
                         │ dépend de
┌────────────────────────▼────────────────────────────┐
│                      Domain                          │
│     (Entités, Value Objects, Interfaces)             │
└─────────────────────────────────────────────────────┘
```

**CRITIQUE** : Les dépendances doivent TOUJOURS pointer vers l'intérieur. Le Domain n'a AUCUNE dépendance externe.

## Couche Domain

### Conception des Entités

```php
<?php

declare(strict_types=1);

namespace App\Domain\Entity;

use App\Domain\Event\UserCreatedEvent;
use App\Domain\ValueObject\Email;
use App\Domain\ValueObject\UserId;
use App\Domain\Enum\UserStatus;

final class User
{
    /** @var DomainEvent[] */
    private array $domainEvents = [];

    private function __construct(
        private readonly UserId $id,
        private Email $email,
        private string $name,
        private UserStatus $status,
        private readonly \DateTimeImmutable $createdAt,
    ) {}

    public static function create(UserId $id, Email $email, string $name): self
    {
        $user = new self(
            id: $id,
            email: $email,
            name: $name,
            status: UserStatus::PENDING,
            createdAt: new \DateTimeImmutable(),
        );

        $user->recordEvent(new UserCreatedEvent($id));

        return $user;
    }

    public function activate(): void
    {
        if ($this->status !== UserStatus::PENDING) {
            throw new InvalidUserStateException('Seuls les utilisateurs en attente peuvent être activés');
        }

        $this->status = UserStatus::ACTIVE;
        $this->recordEvent(new UserActivatedEvent($this->id));
    }

    public function changeEmail(Email $newEmail): void
    {
        if ($this->email->equals($newEmail)) {
            return;
        }

        $oldEmail = $this->email;
        $this->email = $newEmail;
        $this->recordEvent(new UserEmailChangedEvent($this->id, $oldEmail, $newEmail));
    }

    // Getters
    public function getId(): UserId { return $this->id; }
    public function getEmail(): Email { return $this->email; }
    public function getName(): string { return $this->name; }
    public function getStatus(): UserStatus { return $this->status; }
    public function getCreatedAt(): \DateTimeImmutable { return $this->createdAt; }

    // Gestion des événements de domaine
    private function recordEvent(DomainEvent $event): void
    {
        $this->domainEvents[] = $event;
    }

    /** @return DomainEvent[] */
    public function pullDomainEvents(): array
    {
        $events = $this->domainEvents;
        $this->domainEvents = [];
        return $events;
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
        $normalized = strtolower(trim($email));

        if (! filter_var($normalized, FILTER_VALIDATE_EMAIL)) {
            throw new InvalidEmailException(
                sprintf('"%s" n\'est pas une adresse email valide', $email)
            );
        }

        return new self($normalized);
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

### Interfaces Repository

```php
<?php

declare(strict_types=1);

namespace App\Domain\Repository;

use App\Domain\Entity\User;
use App\Domain\ValueObject\Email;
use App\Domain\ValueObject\UserId;

interface UserRepositoryInterface
{
    public function nextIdentity(): UserId;

    public function find(UserId $id): ?User;

    public function findByEmail(Email $email): ?User;

    /** @return User[] */
    public function findAll(): array;

    public function save(User $user): void;

    public function remove(User $user): void;
}
```

## Couche Application

### Pattern Command/Handler

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

final readonly class CreateUserHandler
{
    public function __construct(
        private UserRepositoryInterface $userRepository,
        private PasswordHasherInterface $passwordHasher,
        private EventDispatcherInterface $eventDispatcher,
    ) {}

    public function handle(CreateUserCommand $command): CreateUserResponse
    {
        $email = Email::fromString($command->email);

        // Vérifier si l'utilisateur existe déjà
        if ($this->userRepository->findByEmail($email) !== null) {
            throw new UserAlreadyExistsException($email);
        }

        // Créer l'utilisateur
        $user = User::create(
            id: $this->userRepository->nextIdentity(),
            email: $email,
            name: $command->name,
        );

        // Persister
        $this->userRepository->save($user);

        // Dispatcher les événements de domaine
        foreach ($user->pullDomainEvents() as $event) {
            $this->eventDispatcher->dispatch($event);
        }

        return new CreateUserResponse(
            id: $user->getId()->getValue(),
            email: $user->getEmail()->getValue(),
            name: $user->getName(),
        );
    }
}
```

## Couche Infrastructure

### Implémentation Repository Doctrine

```php
<?php

declare(strict_types=1);

namespace App\Infrastructure\Persistence\Doctrine;

use App\Domain\Entity\User;
use App\Domain\Repository\UserRepositoryInterface;
use App\Domain\ValueObject\Email;
use App\Domain\ValueObject\UserId;
use Doctrine\ORM\EntityManagerInterface;
use Ramsey\Uuid\Uuid;

final readonly class DoctrineUserRepository implements UserRepositoryInterface
{
    public function __construct(
        private EntityManagerInterface $entityManager,
    ) {}

    public function nextIdentity(): UserId
    {
        return UserId::fromString(Uuid::uuid4()->toString());
    }

    public function find(UserId $id): ?User
    {
        return $this->entityManager->find(User::class, $id->getValue());
    }

    public function findByEmail(Email $email): ?User
    {
        return $this->entityManager
            ->createQueryBuilder()
            ->select('u')
            ->from(User::class, 'u')
            ->where('u.email.value = :email')
            ->setParameter('email', $email->getValue())
            ->getQuery()
            ->getOneOrNullResult();
    }

    public function findAll(): array
    {
        return $this->entityManager
            ->getRepository(User::class)
            ->findAll();
    }

    public function save(User $user): void
    {
        $this->entityManager->persist($user);
        $this->entityManager->flush();
    }

    public function remove(User $user): void
    {
        $this->entityManager->remove($user);
        $this->entityManager->flush();
    }
}
```

## Couche Présentation

### Contrôleur API

```php
<?php

declare(strict_types=1);

namespace App\Presentation\Api\v1;

use App\Application\UseCase\User\CreateUser\CreateUserCommand;
use App\Application\UseCase\User\CreateUser\CreateUserHandler;
use App\Application\UseCase\User\GetUser\GetUserQuery;
use App\Application\UseCase\User\GetUser\GetUserHandler;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/v1/users')]
final readonly class UserController
{
    public function __construct(
        private CreateUserHandler $createUserHandler,
        private GetUserHandler $getUserHandler,
    ) {}

    #[Route('', methods: ['POST'])]
    public function create(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true, flags: JSON_THROW_ON_ERROR);

        $command = new CreateUserCommand(
            email: $data['email'],
            name: $data['name'],
            password: $data['password'],
        );

        $response = $this->createUserHandler->handle($command);

        return new JsonResponse($response, Response::HTTP_CREATED);
    }

    #[Route('/{id}', methods: ['GET'])]
    public function show(string $id): JsonResponse
    {
        $query = new GetUserQuery($id);
        $response = $this->getUserHandler->handle($query);

        if ($response === null) {
            return new JsonResponse(['error' => 'Utilisateur non trouvé'], Response::HTTP_NOT_FOUND);
        }

        return new JsonResponse($response);
    }
}
```

## Événements de Domaine

### Implémentation

```php
<?php

declare(strict_types=1);

namespace App\Domain\Event;

use App\Domain\ValueObject\UserId;

final readonly class UserCreatedEvent implements DomainEvent
{
    public function __construct(
        public UserId $userId,
        public \DateTimeImmutable $occurredAt = new \DateTimeImmutable(),
    ) {}
}
```

### Listener

```php
<?php

declare(strict_types=1);

namespace App\Application\EventListener;

use App\Domain\Event\UserCreatedEvent;
use App\Infrastructure\Mailer\WelcomeMailer;

final readonly class SendWelcomeEmailOnUserCreated
{
    public function __construct(
        private WelcomeMailer $mailer,
        private UserRepositoryInterface $userRepository,
    ) {}

    public function __invoke(UserCreatedEvent $event): void
    {
        $user = $this->userRepository->find($event->userId);

        if ($user === null) {
            return;
        }

        $this->mailer->send($user->getEmail());
    }
}
```

## Checklist Architecture

- [ ] Le Domain n'a AUCUNE dépendance externe
- [ ] Les Entités utilisent des méthodes factory et des setters privés
- [ ] Les Value Objects sont immuables et auto-validants
- [ ] Les interfaces Repository sont dans le Domain
- [ ] Les Use Cases sont des classes uniques avec méthode handle()
- [ ] L'Infrastructure implémente les interfaces du Domain
- [ ] Les Contrôleurs sont fins et délèguent aux handlers
- [ ] Les événements de domaine sont enregistrés dans les entités
- [ ] Les DTOs sont utilisés pour le transfert de données
- [ ] Les couches ne sont accessibles que par injection de dépendances
