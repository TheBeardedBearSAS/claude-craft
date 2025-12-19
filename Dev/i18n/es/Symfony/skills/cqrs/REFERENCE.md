# Regla 07: CQRS - Command Query Responsibility Segregation

## Principio fundamental

**Separar estrictamente las mutaciones (Commands) de las lecturas (Queries).**

- **Commands** → Modifican el estado, devuelven `void` o ID
- **Queries** → Leen el estado, devuelven DTOs (NUNCA entidades)

## Arquitectura CQRS

```
Presentation Layer
       ↓
Application Layer
├── Commands/        # Mutaciones
│   ├── CreateClientCommand.php
│   └── CreateClientHandler.php
└── Queries/         # Lecturas
    ├── GetClientByIdQuery.php
    └── GetClientByIdHandler.php
       ↓
Domain Layer
```

## Commands (Write Side)

### 1. Estructura de un Command

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

**Características**:
- ✅ `final readonly` class
- ✅ Public properties (patrón DTO)
- ✅ Value Objects (tipos fuertes)
- ✅ Named constructor parameters
- ❌ NO lógica de negocio
- ❌ NO validación compleja (en el Handler)

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
        // Validación de negocio
        if ($command->companyIdentifier !== null) {
            $this->companyValidator->validate($command->companyIdentifier);
        }

        // Verificar unicidad email
        $existing = $this->clientRepository->findByEmail($command->email);
        if ($existing !== null) {
            throw new DuplicateEmailException($command->email);
        }

        // Crear la entidad
        $client = Client::create(
            clientId: $command->clientId,
            name: $command->name,
            email: $command->email,
            companyIdentifier: $command->companyIdentifier
        );

        // Persistir
        $this->clientRepository->save($client);

        // Dispatcher los eventos domain
        foreach ($client->releaseEvents() as $event) {
            $this->eventBus->dispatch($event);
        }
    }
}
```

**Características**:
- ✅ Devuelve `void` (o ID si es necesario)
- ✅ Método `__invoke()` para invocación directa
- ✅ Validación de negocio compleja
- ✅ Orquestación (Repository + EventBus)
- ❌ NO lógica de negocio (delegar al Domain)

### 3. Registro Symfony

```yaml
# config/services.yaml
services:
    App\Commercial\Application\Handler\:
        resource: '../src/Commercial/Application/Handler'
        tags:
            - { name: messenger.message_handler, bus: command.bus }
```

### 4. Dispatch del Command

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

### 1. Estructura de una Query

```php
// Application/Query/GetClientByIdQuery.php

final readonly class GetClientByIdQuery
{
    public function __construct(
        public ClientId $clientId
    ) {}
}
```

**Más simple que un Command**:
- ✅ Parámetros de búsqueda únicamente
- ✅ Inmutable
- ❌ NO lógica

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

**¿Por qué DTOs en lugar de entidades?**
- ✅ Desacoplamiento presentación/domain
- ✅ Control exacto de los datos expuestos
- ✅ Optimización (queries SQL custom)
- ✅ Evita lazy loading N+1

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

**Características**:
- ✅ Devuelve un DTO (NUNCA la entidad)
- ✅ Solo lectura (no save())
- ✅ Excepción si no encontrado
- ❌ NO modificación de estado

### 4. Query con paginación

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

## Optimización de Queries

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

### 2. Proyecciones optimizadas

```php
public function searchAsDto(SearchClientsQuery $query): array
{
    $qb = $this->createQueryBuilder('c')
        ->select('c.id, c.name, c.email, c.status')  // Columnas mínimas
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

## Event Sourcing (opcional avanzado)

Para CQRS puro con Event Store:

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

## Anti-patterns a evitar

### ❌ Devolver una entidad en una Query

```php
// PROHIBIDO
public function __invoke(GetClientByIdQuery $query): Client
{
    return $this->clientRepository->findById($query->clientId);
}
```

### ❌ Modificar el estado en una Query

```php
// PROHIBIDO
public function __invoke(GetClientByIdQuery $query): ClientDto
{
    $client = $this->clientRepository->findById($query->clientId);
    $client->incrementViewCount();  // ❌ Mutación en una Query!
    return ClientDto::fromEntity($client);
}
```

### ❌ Devolver un ID complejo en un Command

```php
// EVITAR
public function __invoke(CreateClientCommand $command): Client
{
    // ...
    return $client;  // ❌ Demasiada info, solo el ID es suficiente
}

// PREFERIR
public function __invoke(CreateClientCommand $command): void
{
    // O ClientId si realmente necesario
}
```

## Checklist CQRS

- [ ] Commands devuelven `void` o ID
- [ ] Queries devuelven DTOs
- [ ] Ninguna entidad expuesta fuera del Domain
- [ ] Handlers con `__invoke()`
- [ ] DTOs tienen factory `fromEntity()`
- [ ] Queries optimizadas (SELECT mínimo)
- [ ] Paginación en todas las listas
- [ ] Excepciones de negocio claras
- [ ] Tests separados Commands/Queries
- [ ] Message bus Symfony configurado
