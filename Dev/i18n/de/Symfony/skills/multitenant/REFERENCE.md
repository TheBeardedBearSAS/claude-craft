# Regel 08: Multitenant - Isolation und Sicherheit

## Grundprinzip

**JEDES Datum gehört zu EINEM und NUR EINEM Mandanten.**

Strikte Isolation: Ein Benutzer von Mandant A darf NIEMALS Daten von Mandant B sehen/ändern.

## Multitenant-Architektur

### 1. Mandanten-Identifikation

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

### 2. Mandanten-Kontext Speicherung

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

### 3. Mandanten-Extraktion (JWT)

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

### 4. HTTP Middleware

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
            // Mandant aus JWT Token extrahieren
            $token = $this->extractToken($request);
            $tenantId = $this->tenantExtractor->extractFromToken($token);

            // Im Kontext setzen
            $this->tenantContext->setCurrentTenant($tenantId);

            $response = $next($request);

            // Nach Request aufräumen
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

## Automatische Filterung - Doctrine

### 1. TenantAware Trait

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
        // Nur auf Entitäten mit TenantAwareTrait anwenden
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

### 3. Filter Aktivierung

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

## Repositories - Explizite Filterung

```php
// Commercial/Domain/Client/ClientRepositoryInterface.php

interface ClientRepositoryInterface
{
    // ❌ VERBOTEN - Keine Mandanten-Filterung
    public function findAll(): array;

    // ✅ VERPFLICHTEND - Expliziter Mandant
    public function findByTenant(TenantId $tenantId, int $page = 1): ClientCollection;

    // ✅ VERPFLICHTEND - Mandant + Kriterien
    public function findByEmail(TenantId $tenantId, Email $email): ?Client;

    // ✅ OK - Eindeutige ID bereits mit Mandant verknüpft
    public function findById(ClientId $id): ?Client;
}
```

### Doctrine Implementation

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
        // Prüfen dass Mandant gesetzt ist
        if ($client->getTenantId() === null) {
            throw new MissingTenantException();
        }

        $this->entityManager->persist($client);
        $this->entityManager->flush();
    }
}
```

## Security - Symfony Voters

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

        // Prüfen dass Mandant übereinstimmt
        return $currentTenant->equals($resourceTenant);
    }
}
```

## Multitenant-Tests

### 1. Isolations-Test

```php
final class ClientMultitenantTest extends KernelTestCase
{
    public function testClientIsolationBetweenTenants(): void
    {
        $tenantA = TenantId::fromString(Uuid::v4());
        $tenantB = TenantId::fromString(Uuid::v4());

        // Client für Mandant A erstellen
        $clientA = ClientFactory::createOne([
            'tenantId' => $tenantA->getValue(),
            'name' => 'Client A',
        ]);

        // Client für Mandant B erstellen
        $clientB = ClientFactory::createOne([
            'tenantId' => $tenantB->getValue(),
            'name' => 'Client B',
        ]);

        // Anfrage mit Mandant A Kontext
        $this->tenantContext->setCurrentTenant($tenantA);
        $clients = $this->clientRepository->findByTenant($tenantA);

        // Sollte nur Client A enthalten
        $this->assertCount(1, $clients);
        $this->assertEquals('Client A', $clients[0]->getName());
    }
}
```

### 2. Datenleck-Test

```php
public function testCannotAccessOtherTenantData(): void
{
    $tenantA = TenantId::fromString(Uuid::v4());
    $tenantB = TenantId::fromString(Uuid::v4());

    $clientA = ClientFactory::createOne(['tenantId' => $tenantA->getValue()]);

    // Versuch Client A mit Mandant B zuzugreifen
    $this->tenantContext->setCurrentTenant($tenantB);

    $this->expectException(AccessDeniedException::class);
    $this->clientRepository->findById($clientA->getId());
}
```

### 3. API-Test mit Mandant

```php
public function testApiEnforcesTenan tIsolation(): void
{
    $tenantA = TenantId::fromString(Uuid::v4());
    $tenantB = TenantId::fromString(Uuid::v4());

    $clientA = ClientFactory::createOne(['tenantId' => $tenantA->getValue()]);
    $clientB = ClientFactory::createOne(['tenantId' => $tenantB->getValue()]);

    // Token für Mandant A
    $tokenA = $this->getJwtTokenForTenant($tenantA);

    $client = static::createClient();
    $client->request('GET', '/api/commercial/clients', [
        'headers' => ['Authorization' => "Bearer $tokenA"],
    ]);

    $data = json_decode($client->getResponse()->getContent(), true);

    // Sollte nur Client A enthalten
    $this->assertCount(1, $data['hydra:member']);
    $this->assertEquals($clientA->getId(), $data['hydra:member'][0]['id']);
}
```

## Fehlerbehandlung

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

## Multitenant Checkliste

- [ ] Alle Entitäten haben `TenantAwareTrait`
- [ ] Doctrine Filter aktiviert
- [ ] HTTP Middleware extrahiert Mandant aus JWT
- [ ] Alle Repositories filtern nach Mandant
- [ ] Voters prüfen Mandant
- [ ] Isolations-Tests bestehen
- [ ] Keine Query ohne Mandant (außer User/Tenant Entitäten)
- [ ] Mandant vor jeder Persistierung gesetzt
- [ ] Logs enthalten Mandanten-ID
- [ ] Metriken pro Mandant verfügbar
