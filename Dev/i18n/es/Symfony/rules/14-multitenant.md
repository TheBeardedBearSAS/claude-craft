# Regla 08: Multitenant - Aislamiento y Seguridad

## Principio fundamental

**CADA dato pertenece a UNO y SOLO UN tenant.**

Aislamiento estricto: Un usuario del tenant A NUNCA debe ver/modificar los datos del tenant B.

## Arquitectura multitenant

### 1. Identificación del tenant

```php
// Shared/Domain/ValueObject/TenantId.php

final readonly class TenantId
{
    public function __construct(
        private string $value
    ) {
        if (!Uuid::isValid($value)) {
            throw new InvalidTenantIdException($value);
        }
    }

    public static function fromString(string $value): self
    {
        return new self($value);
    }

    public function getValue(): string
    {
        return $this->value;
    }

    public function equals(TenantId $other): bool
    {
        return $this->value === $other->value;
    }
}
```

### 2. Almacenamiento del contexto tenant

```php
// Shared/Infrastructure/Multitenant/TenantContext.php

final class TenantContext
{
    private ?TenantId $currentTenant = null;

    public function setCurrentTenant(TenantId $tenantId): void
    {
        $this->currentTenant = $tenantId;
    }

    public function getCurrentTenant(): TenantId
    {
        if ($this->currentTenant === null) {
            throw new NoTenantContextException();
        }

        return $this->currentTenant;
    }

    public function hasTenant(): bool
    {
        return $this->currentTenant !== null;
    }

    public function clear(): void
    {
        $this->currentTenant = null;
    }
}
```

### 3. Extracción del tenant (JWT)

```php
// Shared/Infrastructure/Security/TenantExtractor.php

final readonly class TenantExtractor
{
    public function extractFromToken(AccessToken $token): TenantId
    {
        $payload = $token->getPayload();

        if (!isset($payload['tenant_id'])) {
            throw new MissingTenantClaimException();
        }

        return TenantId::fromString($payload['tenant_id']);
    }
}
```

### 4. Middleware HTTP

```php
// Shared/Infrastructure/Http/Middleware/TenantMiddleware.php

final readonly class TenantMiddleware
{
    public function __construct(
        private TenantContext $tenantContext,
        private TenantExtractor $tenantExtractor
    ) {}

    public function __invoke(Request $request, callable $next): Response
    {
        try {
            // Extraer tenant del JWT token
            $token = $this->extractToken($request);
            $tenantId = $this->tenantExtractor->extractFromToken($token);

            // Definir en el contexto
            $this->tenantContext->setCurrentTenant($tenantId);

            $response = $next($request);

            // Limpiar después de la petición
            $this->tenantContext->clear();

            return $response;

        } catch (NoTenantContextException $e) {
            return new JsonResponse(
                ['error' => 'Missing tenant context'],
                403
            );
        }
    }
}
```

## Filtrado automático - Doctrine

### 1. Trait TenantAware

```php
// Shared/Infrastructure/Doctrine/TenantAwareTrait.php

trait TenantAwareTrait
{
    #[ORM\Column(type: 'uuid')]
    private string $tenantId;

    public function getTenantId(): TenantId
    {
        return TenantId::fromString($this->tenantId);
    }

    public function setTenantId(TenantId $tenantId): void
    {
        $this->tenantId = $tenantId->getValue();
    }
}
```

### 2. Doctrine Filter

```php
// Shared/Infrastructure/Doctrine/Filter/TenantFilter.php

final class TenantFilter extends SQLFilter
{
    public function addFilterConstraint(
        ClassMetadata $targetEntity,
        string $targetTableAlias
    ): string {
        // Aplicar únicamente a las entidades con TenantAwareTrait
        if (!$this->hasTenantAware($targetEntity)) {
            return '';
        }

        $tenantId = $this->getParameter('tenantId');

        return sprintf(
            '%s.tenant_id = %s',
            $targetTableAlias,
            $tenantId
        );
    }

    private function hasTenantAware(ClassMetadata $metadata): bool
    {
        return in_array(
            TenantAwareTrait::class,
            class_uses($metadata->getName()),
            true
        );
    }
}
```

### 3. Activación del filtro

```php
// Shared/Infrastructure/Doctrine/Listener/TenantFilterSubscriber.php

final readonly class TenantFilterSubscriber implements EventSubscriber
{
    public function __construct(
        private TenantContext $tenantContext
    ) {}

    public function getSubscribedEvents(): array
    {
        return [RequestEvent::class];
    }

    public function onKernelRequest(RequestEvent $event): void
    {
        if (!$this->tenantContext->hasTenant()) {
            return;
        }

        $em = $this->entityManager;
        $filter = $em->getFilters()->enable('tenant_filter');

        $filter->setParameter(
            'tenantId',
            $this->tenantContext->getCurrentTenant()->getValue()
        );
    }
}
```

## Repositories - Filtrado explícito

```php
// Commercial/Domain/Client/ClientRepositoryInterface.php

interface ClientRepositoryInterface
{
    // ❌ PROHIBIDO - Sin filtrado tenant
    public function findAll(): array;

    // ✅ OBLIGATORIO - Tenant explícito
    public function findByTenant(TenantId $tenantId, int $page = 1): ClientCollection;

    // ✅ OBLIGATORIO - Tenant + criterios
    public function findByEmail(TenantId $tenantId, Email $email): ?Client;

    // ✅ OK - ID único ya vinculado al tenant
    public function findById(ClientId $id): ?Client;
}
```

### Implementación Doctrine

```php
final class DoctrineClientRepository implements ClientRepositoryInterface
{
    public function findByTenant(TenantId $tenantId, int $page = 1): ClientCollection
    {
        $qb = $this->createQueryBuilder('c')
            ->where('c.tenantId = :tenantId')
            ->setParameter('tenantId', $tenantId->getValue())
            ->setFirstResult(($page - 1) * self::PAGE_SIZE)
            ->setMaxResults(self::PAGE_SIZE);

        return new ClientCollection($qb->getQuery()->getResult());
    }

    public function save(Client $client): void
    {
        // Verificar que el tenant está definido
        if ($client->getTenantId() === null) {
            throw new MissingTenantException();
        }

        $this->entityManager->persist($client);
        $this->entityManager->flush();
    }
}
```

## Security - Voters Symfony

```php
// Shared/Infrastructure/Security/Voter/TenantAwareVoter.php

final class TenantAwareVoter extends Voter
{
    public function __construct(
        private TenantContext $tenantContext
    ) {}

    protected function supports(string $attribute, mixed $subject): bool
    {
        return $subject instanceof TenantAwareInterface
            && in_array($attribute, ['VIEW', 'EDIT', 'DELETE'], true);
    }

    protected function voteOnAttribute(
        string $attribute,
        mixed $subject,
        TokenInterface $token
    ): bool {
        $currentTenant = $this->tenantContext->getCurrentTenant();
        $resourceTenant = $subject->getTenantId();

        // Verificar que el tenant corresponde
        return $currentTenant->equals($resourceTenant);
    }
}
```

## Tests multitenant

### 1. Test de aislamiento

```php
final class ClientMultitenantTest extends KernelTestCase
{
    public function testClientIsolationBetweenTenants(): void
    {
        $tenantA = TenantId::fromString(Uuid::v4());
        $tenantB = TenantId::fromString(Uuid::v4());

        // Crear cliente para tenant A
        $clientA = ClientFactory::createOne([
            'tenantId' => $tenantA->getValue(),
            'name' => 'Client A',
        ]);

        // Crear cliente para tenant B
        $clientB = ClientFactory::createOne([
            'tenantId' => $tenantB->getValue(),
            'name' => 'Client B',
        ]);

        // Petición con contexto tenant A
        $this->tenantContext->setCurrentTenant($tenantA);
        $clients = $this->clientRepository->findByTenant($tenantA);

        // Debe contener únicamente cliente A
        $this->assertCount(1, $clients);
        $this->assertEquals('Client A', $clients[0]->getName());
    }
}
```

### 2. Test de fuga de datos

```php
public function testCannotAccessOtherTenantData(): void
{
    $tenantA = TenantId::fromString(Uuid::v4());
    $tenantB = TenantId::fromString(Uuid::v4());

    $clientA = ClientFactory::createOne(['tenantId' => $tenantA->getValue()]);

    // Intentar acceder al cliente A con tenant B
    $this->tenantContext->setCurrentTenant($tenantB);

    $this->expectException(AccessDeniedException::class);
    $this->clientRepository->findById($clientA->getId());
}
```

### 3. Test API con tenant

```php
public function testApiEnforcesTenan tIsolation(): void
{
    $tenantA = TenantId::fromString(Uuid::v4());
    $tenantB = TenantId::fromString(Uuid::v4());

    $clientA = ClientFactory::createOne(['tenantId' => $tenantA->getValue()]);
    $clientB = ClientFactory::createOne(['tenantId' => $tenantB->getValue()]);

    // Token para tenant A
    $tokenA = $this->getJwtTokenForTenant($tenantA);

    $client = static::createClient();
    $client->request('GET', '/api/commercial/clients', [
        'headers' => ['Authorization' => "Bearer $tokenA"],
    ]);

    $data = json_decode($client->getResponse()->getContent(), true);

    // Debe contener únicamente cliente A
    $this->assertCount(1, $data['hydra:member']);
    $this->assertEquals($clientA->getId(), $data['hydra:member'][0]['id']);
}
```

## Gestión de errores

```php
// Shared/Domain/Exception/NoTenantContextException.php

final class NoTenantContextException extends DomainException
{
    public function __construct()
    {
        parent::__construct(
            'No tenant context available. Ensure TenantMiddleware is active.'
        );
    }
}

// Shared/Domain/Exception/TenantMismatchException.php

final class TenantMismatchException extends DomainException
{
    public function __construct(TenantId $expected, TenantId $actual)
    {
        parent::__construct(sprintf(
            'Tenant mismatch: expected %s, got %s',
            $expected->getValue(),
            $actual->getValue()
        ));
    }
}
```

## Checklist multitenant

- [ ] Todas las entidades tienen `TenantAwareTrait`
- [ ] Doctrine Filter activado
- [ ] Middleware HTTP extrae tenant del JWT
- [ ] Todos los repositories filtran por tenant
- [ ] Voters verifican el tenant
- [ ] Tests de aislamiento pasan
- [ ] No hay query sin tenant (excepto entidades User/Tenant)
- [ ] Tenant definido antes de toda persistencia
- [ ] Logs incluyen el tenant ID
- [ ] Métricas por tenant disponibles
