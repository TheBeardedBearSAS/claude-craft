# Règle 07 : CQRS - Command Query Responsibility Segregation

## Principe fondamental

**Séparer strictement les mutations (Commands) des lectures (Queries).**

- **Commands** → Modifient l'état, retournent `void` ou ID
- **Queries** → Lisent l'état, retournent des DTOs (JAMAIS d'entités)

## Architecture CQRS

```
Presentation Layer
       ↓
Application Layer
├── Commands/        # Mutations
│   ├── CreateClientCommand.php
│   └── CreateClientHandler.php
└── Queries/         # Lectures
    ├── GetClientByIdQuery.php
    └── GetClientByIdHandler.php
       ↓
Domain Layer
```

## Commands (Write Side)

### 1. Structure d'un Command

```php
// Application/Command/CreateClientCommand.php

final readonly class CreateClientCommand
{
    public function __construct(
        public ClientId $clientId,
        public string $name,
        public Email $email,
        public ?CompanyIdentifier $companyIdentifier = null
    ) {}
}
```

**Caractéristiques** :
- ✅ `final readonly` class
- ✅ Public properties (DTO pattern)
- ✅ Value Objects (types forts)
- ✅ Named constructor parameters
- ❌ PAS de logique métier
- ❌ PAS de validation complexe (dans le Handler)

### 2. Command Handler

```php
// Application/Handler/CreateClientHandler.php

final readonly class CreateClientHandler
{
    public function __construct(
        private ClientRepositoryInterface $clientRepository,
        private EventBusInterface $eventBus,
        private CompanyIdentifierValidatorInterface $companyValidator
    ) {}

    public function __invoke(CreateClientCommand $command): void
    {
        // Validation métier
        if ($command->companyIdentifier !== null) {
            $this->companyValidator->validate($command->companyIdentifier);
        }

        // Vérifier unicité email
        $existing = $this->clientRepository->findByEmail($command->email);
        if ($existing !== null) {
            throw new DuplicateEmailException($command->email);
        }

        // Créer l'entité
        $client = Client::create(
            clientId: $command->clientId,
            name: $command->name,
            email: $command->email,
            companyIdentifier: $command->companyIdentifier
        );

        // Persister
        $this->clientRepository->save($client);

        // Dispatcher les événements domain
        foreach ($client->releaseEvents() as $event) {
            $this->eventBus->dispatch($event);
        }
    }
}
```

**Caractéristiques** :
- ✅ Retourne `void` (ou ID si nécessaire)
- ✅ Méthode `__invoke()` pour invocation directe
- ✅ Validation métier complexe
- ✅ Orchestration (Repository + EventBus)
- ❌ PAS de logique métier (déléguer au Domain)

### 3. Enregistrement Symfony

```yaml
# config/services.yaml
services:
    App\Commercial\Application\Handler\:
        resource: '../src/Commercial/Application/Handler'
        tags:
            - { name: messenger.message_handler, bus: command.bus }
```

### 4. Dispatch du Command

```php
// State/ClientProcessor.php (API Platform)

final readonly class ClientProcessor implements ProcessorInterface
{
    public function __construct(
        private CommandBusInterface $commandBus
    ) {}

    public function process(
        mixed $data,
        Operation $operation,
        array $uriVariables = [],
        array $context = []
    ): ClientResource {
        $clientId = ClientId::generate();

        $command = new CreateClientCommand(
            clientId: $clientId,
            name: $data->name,
            email: Email::fromString($data->email)
        );

        $this->commandBus->dispatch($command);

        return new ClientResource($clientId);
    }
}
```

## Queries (Read Side)

### 1. Structure d'une Query

```php
// Application/Query/GetClientByIdQuery.php

final readonly class GetClientByIdQuery
{
    public function __construct(
        public ClientId $clientId
    ) {}
}
```

**Plus simple qu'un Command** :
- ✅ Paramètres de recherche uniquement
- ✅ Immutable
- ❌ PAS de logique

### 2. Data Transfer Object (DTO)

```php
// Application/DTO/ClientDto.php

final readonly class ClientDto
{
    public function __construct(
        public string $id,
        public string $name,
        public string $email,
        public ?string $companyIdentifier,
        public string $status,
        public string $createdAt
    ) {}

    public static function fromEntity(Client $client): self
    {
        return new self(
            id: $client->getId()->getValue(),
            name: $client->getName(),
            email: $client->getEmail()->getValue(),
            companyIdentifier: $client->getCompanyIdentifier()?->getValue(),
            status: $client->getStatus()->value,
            createdAt: $client->getCreatedAt()->format(DateTimeInterface::ATOM)
        );
    }

    public function toArray(): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'companyIdentifier' => $this->companyIdentifier,
            'status' => $this->status,
            'createdAt' => $this->createdAt,
        ];
    }
}
```

**Pourquoi des DTOs au lieu d'entités ?**
- ✅ Découplage présentation/domain
- ✅ Contrôle exact des données exposées
- ✅ Optimisation (queries SQL custom)
- ✅ Évite les lazy loading N+1

### 3. Query Handler

```php
// Application/Handler/GetClientByIdHandler.php

final readonly class GetClientByIdHandler
{
    public function __construct(
        private ClientRepositoryInterface $clientRepository
    ) {}

    public function __invoke(GetClientByIdQuery $query): ClientDto
    {
        $client = $this->clientRepository->findById($query->clientId);

        if ($client === null) {
            throw new ClientNotFoundException($query->clientId);
        }

        return ClientDto::fromEntity($client);
    }
}
```

**Caractéristiques** :
- ✅ Retourne un DTO (JAMAIS l'entité)
- ✅ Lecture seule (pas de save())
- ✅ Exception si non trouvé
- ❌ PAS de modification d'état

### 4. Query avec pagination

```php
// Application/Query/SearchClientsQuery.php

final readonly class SearchClientsQuery
{
    public function __construct(
        public ?string $name = null,
        public ?string $email = null,
        public ?ClientStatus $status = null,
        public int $page = 1,
        public int $limit = 20
    ) {}
}

// Handler

final readonly class SearchClientsHandler
{
    public function __invoke(SearchClientsQuery $query): ClientDtoCollection
    {
        $clients = $this->clientRepository->search(
            name: $query->name,
            email: $query->email,
            status: $query->status,
            page: $query->page,
            limit: $query->limit
        );

        return ClientDtoCollection::fromEntities($clients);
    }
}
```

## Optimisation des Queries

### 1. Queries SQL custom (Doctrine)

```php
// Infrastructure/Persistence/Doctrine/DoctrineClientRepository.php

public function findByIdAsDto(ClientId $id): ?ClientDto
{
    $qb = $this->createQueryBuilder('c')
        ->select('NEW ' . ClientDto::class . '(
            c.id,
            c.name,
            c.email,
            c.companyIdentifier,
            c.status,
            c.createdAt
        )')
        ->where('c.id = :id')
        ->setParameter('id', $id->getValue());

    return $qb->getQuery()->getOneOrNullResult();
}
```

### 2. Projections optimisées

```php
public function searchAsDto(SearchClientsQuery $query): array
{
    $qb = $this->createQueryBuilder('c')
        ->select('c.id, c.name, c.email, c.status')  // Colonnes minimales
        ->where('1 = 1');

    if ($query->name !== null) {
        $qb->andWhere('c.name LIKE :name')
            ->setParameter('name', '%' . $query->name . '%');
    }

    if ($query->status !== null) {
        $qb->andWhere('c.status = :status')
            ->setParameter('status', $query->status->value);
    }

    $qb->setFirstResult(($query->page - 1) * $query->limit)
        ->setMaxResults($query->limit);

    return $qb->getQuery()->getArrayResult();
}
```

## Event Sourcing (optionnel avancé)

Pour CQRS pur avec Event Store :

```php
// Write side - Event Store
final class ClientEventStoreRepository
{
    public function save(Client $client): void
    {
        foreach ($client->releaseEvents() as $event) {
            $this->eventStore->append($event);
        }
    }

    public function load(ClientId $id): Client
    {
        $events = $this->eventStore->loadStream($id);
        return Client::reconstituteFromEvents($events);
    }
}

// Read side - Projection
final class ClientProjection
{
    public function onClientCreated(ClientCreated $event): void
    {
        $this->connection->insert('read_clients', [
            'id' => $event->clientId->getValue(),
            'name' => $event->name,
            'email' => $event->email->getValue(),
        ]);
    }

    public function onClientEmailUpdated(ClientEmailUpdated $event): void
    {
        $this->connection->update('read_clients', [
            'email' => $event->newEmail->getValue(),
        ], ['id' => $event->clientId->getValue()]);
    }
}
```

## Anti-patterns à éviter

### ❌ Retourner une entité dans une Query

```php
// INTERDIT
public function __invoke(GetClientByIdQuery $query): Client
{
    return $this->clientRepository->findById($query->clientId);
}
```

### ❌ Modifier l'état dans une Query

```php
// INTERDIT
public function __invoke(GetClientByIdQuery $query): ClientDto
{
    $client = $this->clientRepository->findById($query->clientId);
    $client->incrementViewCount();  // ❌ Mutation dans une Query!
    return ClientDto::fromEntity($client);
}
```

### ❌ Retourner un ID complexe dans un Command

```php
// ÉVITER
public function __invoke(CreateClientCommand $command): Client
{
    // ...
    return $client;  // ❌ Trop d'infos, juste l'ID suffit
}

// PRÉFÉRER
public function __invoke(CreateClientCommand $command): void
{
    // Ou ClientId si vraiment nécessaire
}
```

## Checklist CQRS

- [ ] Commands retournent `void` ou ID
- [ ] Queries retournent des DTOs
- [ ] Aucune entité exposée en dehors du Domain
- [ ] Handlers avec `__invoke()`
- [ ] DTOs ont factory `fromEntity()`
- [ ] Queries optimisées (SELECT minimal)
- [ ] Pagination sur toutes les listes
- [ ] Exceptions métier claires
- [ ] Tests séparés Commands/Queries
- [ ] Message bus Symfony configuré
