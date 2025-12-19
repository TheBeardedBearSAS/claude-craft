# Regel 07: CQRS - Command Query Responsibility Segregation

## Grundprinzip

**Strikt Mutationen (Commands) von Lesevorgängen (Queries) trennen.**

- **Commands** → Ändern Zustand, geben `void` oder ID zurück
- **Queries** → Lesen Zustand, geben DTOs zurück (NIEMALS Entitäten)

## CQRS Architektur

```
Presentation Layer
       ↓
Application Layer
├── Commands/        # Mutationen
│   ├── CreateClientCommand.php
│   └── CreateClientHandler.php
└── Queries/         # Lesevorgänge
    ├── GetClientByIdQuery.php
    └── GetClientByIdHandler.php
       ↓
Domain Layer
```

## Commands (Write Side)

### 1. Command-Struktur

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

**Eigenschaften**:
- ✅ `final readonly` Klasse
- ✅ Public Properties (DTO Pattern)
- ✅ Value Objects (starke Typen)
- ✅ Named Constructor Parameters
- ❌ KEINE Business-Logik
- ❌ KEINE komplexe Validierung (im Handler)

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
        // Business-Validierung
        if ($command->companyIdentifier !== null) {
            $this->companyValidator->validate($command->companyIdentifier);
        }

        // E-Mail-Eindeutigkeit prüfen
        $existing = $this->clientRepository->findByEmail($command->email);
        if ($existing !== null) {
            throw new DuplicateEmailException($command->email);
        }

        // Entität erstellen
        $client = Client::create(
            clientId: $command->clientId,
            name: $command->name,
            email: $command->email,
            companyIdentifier: $command->companyIdentifier
        );

        // Persistieren
        $this->clientRepository->save($client);

        // Domain-Events versenden
        foreach ($client->releaseEvents() as $event) {
            $this->eventBus->dispatch($event);
        }
    }
}
```

**Eigenschaften**:
- ✅ Gibt `void` zurück (oder ID wenn nötig)
- ✅ `__invoke()` Methode für direkte Aufrufe
- ✅ Komplexe Business-Validierung
- ✅ Orchestrierung (Repository + EventBus)
- ❌ KEINE Business-Logik (an Domain delegieren)

### 3. Symfony Registrierung

```yaml
# config/services.yaml
services:
    App\Commercial\Application\Handler\:
        resource: '../src/Commercial/Application/Handler'
        tags:
            - { name: messenger.message_handler, bus: command.bus }
```

### 4. Command-Versand

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

### 1. Query-Struktur

```php
// Application/Query/GetClientByIdQuery.php

final readonly class GetClientByIdQuery
{
    public function __construct(
        public ClientId $clientId
    ) {}
}
```

**Einfacher als Command**:
- ✅ Nur Suchparameter
- ✅ Unveränderlich
- ❌ KEINE Logik

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

**Warum DTOs statt Entitäten?**
- ✅ Entkopplung Präsentation/Domain
- ✅ Exakte Kontrolle über exponierte Daten
- ✅ Optimierung (custom SQL Queries)
- ✅ Vermeidet Lazy Loading N+1

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

**Eigenschaften**:
- ✅ Gibt DTO zurück (NIEMALS Entität)
- ✅ Nur Lesezugriff (kein save())
- ✅ Exception wenn nicht gefunden
- ❌ KEINE Zustandsänderung

### 4. Query mit Paginierung

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

## Query-Optimierung

### 1. Custom SQL Queries (Doctrine)

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

### 2. Optimierte Projektionen

```php
public function searchAsDto(SearchClientsQuery $query): array
{
    $qb = $this->createQueryBuilder('c')
        ->select('c.id, c.name, c.email, c.status')  // Minimale Spalten
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

## Event Sourcing (optional fortgeschritten)

Für reines CQRS mit Event Store:

```php
// Write Side - Event Store
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

// Read Side - Projektion
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

## Zu vermeidende Anti-Patterns

### ❌ Entität in Query zurückgeben

```php
// VERBOTEN
public function __invoke(GetClientByIdQuery $query): Client
{
    return $this->clientRepository->findById($query->clientId);
}
```

### ❌ Zustand in Query ändern

```php
// VERBOTEN
public function __invoke(GetClientByIdQuery $query): ClientDto
{
    $client = $this->clientRepository->findById($query->clientId);
    $client->incrementViewCount();  // ❌ Mutation in Query!
    return ClientDto::fromEntity($client);
}
```

### ❌ Komplexe ID in Command zurückgeben

```php
// VERMEIDEN
public function __invoke(CreateClientCommand $command): Client
{
    // ...
    return $client;  // ❌ Zu viel Info, nur ID reicht
}

// BEVORZUGEN
public function __invoke(CreateClientCommand $command): void
{
    // Oder ClientId wenn wirklich nötig
}
```

## CQRS Checkliste

- [ ] Commands geben `void` oder ID zurück
- [ ] Queries geben DTOs zurück
- [ ] Keine Entitäten außerhalb Domain exponiert
- [ ] Handler mit `__invoke()`
- [ ] DTOs haben `fromEntity()` Factory
- [ ] Queries optimiert (minimales SELECT)
- [ ] Paginierung auf allen Listen
- [ ] Klare Business-Exceptions
- [ ] Getrennte Tests Commands/Queries
- [ ] Symfony Message Bus konfiguriert
