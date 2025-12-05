# Règle 08 : Multitenant - Isolation et Sécurité

## Principe fondamental

**CHAQUE donnée appartient à UN et UN SEUL tenant.**

Isolation stricte : Un utilisateur du tenant A ne doit JAMAIS voir/modifier les données du tenant B.

## Architecture multitenant

### 1. Identification du tenant

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

### 2. Stockage du contexte tenant

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

### 3. Extraction du tenant (JWT)

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
            // Extraire tenant du JWT token
            $token = $this->extractToken($request);
            $tenantId = $this->tenantExtractor->extractFromToken($token);

            // Définir dans le contexte
            $this->tenantContext->setCurrentTenant($tenantId);

            $response = $next($request);

            // Nettoyer après requête
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

## Filtrage automatique - Doctrine

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
        // Appliquer uniquement aux entités avec TenantAwareTrait
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

### 3. Activation du filtre

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

## Repositories - Filtrage explicite

```php
// Commercial/Domain/Client/ClientRepositoryInterface.php

interface ClientRepositoryInterface
{
    // ❌ INTERDIT - Pas de filtrage tenant
    public function findAll(): array;

    // ✅ OBLIGATOIRE - Tenant explicite
    public function findByTenant(TenantId $tenantId, int $page = 1): ClientCollection;

    // ✅ OBLIGATOIRE - Tenant + critères
    public function findByEmail(TenantId $tenantId, Email $email): ?Client;

    // ✅ OK - ID unique déjà lié au tenant
    public function findById(ClientId $id): ?Client;
}
```

### Implémentation Doctrine

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
        // Vérifier que le tenant est défini
        if ($client->getTenantId() === null) {
            throw new MissingTenantException();
        }

        $this->entityManager->persist($client);
        $this->entityManager->flush();
    }
}
```

## Sécurité - Voters Symfony

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

        // Vérifier que le tenant correspond
        return $currentTenant->equals($resourceTenant);
    }
}
```

## Tests multitenant

### 1. Test d'isolation

```php
final class ClientMultitenantTest extends KernelTestCase
{
    public function testClientIsolationBetweenTenants(): void
    {
        $tenantA = TenantId::fromString(Uuid::v4());
        $tenantB = TenantId::fromString(Uuid::v4());

        // Créer client pour tenant A
        $clientA = ClientFactory::createOne([
            'tenantId' => $tenantA->getValue(),
            'name' => 'Client A',
        ]);

        // Créer client pour tenant B
        $clientB = ClientFactory::createOne([
            'tenantId' => $tenantB->getValue(),
            'name' => 'Client B',
        ]);

        // Requête avec contexte tenant A
        $this->tenantContext->setCurrentTenant($tenantA);
        $clients = $this->clientRepository->findByTenant($tenantA);

        // Doit contenir uniquement client A
        $this->assertCount(1, $clients);
        $this->assertEquals('Client A', $clients[0]->getName());
    }
}
```

### 2. Test de fuite de données

```php
public function testCannotAccessOtherTenantData(): void
{
    $tenantA = TenantId::fromString(Uuid::v4());
    $tenantB = TenantId::fromString(Uuid::v4());

    $clientA = ClientFactory::createOne(['tenantId' => $tenantA->getValue()]);

    // Tenter d'accéder au client A avec tenant B
    $this->tenantContext->setCurrentTenant($tenantB);

    $this->expectException(AccessDeniedException::class);
    $this->clientRepository->findById($clientA->getId());
}
```

### 3. Test API avec tenant

```php
public function testApiEnforcesTenan tIsolation(): void
{
    $tenantA = TenantId::fromString(Uuid::v4());
    $tenantB = TenantId::fromString(Uuid::v4());

    $clientA = ClientFactory::createOne(['tenantId' => $tenantA->getValue()]);
    $clientB = ClientFactory::createOne(['tenantId' => $tenantB->getValue()]);

    // Token pour tenant A
    $tokenA = $this->getJwtTokenForTenant($tenantA);

    $client = static::createClient();
    $client->request('GET', '/api/commercial/clients', [
        'headers' => ['Authorization' => "Bearer $tokenA"],
    ]);

    $data = json_decode($client->getResponse()->getContent(), true);

    // Doit contenir uniquement client A
    $this->assertCount(1, $data['hydra:member']);
    $this->assertEquals($clientA->getId(), $data['hydra:member'][0]['id']);
}
```

## Gestion des erreurs

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

- [ ] Toutes les entités ont `TenantAwareTrait`
- [ ] Doctrine Filter activé
- [ ] Middleware HTTP extrait tenant du JWT
- [ ] Tous les repositories filtrent par tenant
- [ ] Voters vérifient le tenant
- [ ] Tests d'isolation passent
- [ ] Pas de query sans tenant (sauf User/Tenant entities)
- [ ] Tenant défini avant toute persistence
- [ ] Logs incluent le tenant ID
- [ ] Métriques par tenant disponibles
