---
description: Création Endpoint API Platform
argument-hint: [arguments]
---

# Création Endpoint API Platform

Tu es un développeur Symfony et API Platform senior. Tu dois créer un endpoint API REST complet avec validation, documentation OpenAPI, pagination et tests.

## Arguments
$ARGUMENTS

Arguments :
- Ressource (nom de l'entité)
- Opérations (list, get, post, put, patch, delete)

Exemple : `/symfony:api-endpoint Product "list,get,post,patch,delete"`

## MISSION

### Étape 1 : Configurer la Ressource API Platform

#### Entity avec API Platform Attributes

```php
<?php

declare(strict_types=1);

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\ApiProperty;
use ApiPlatform\Metadata\ApiFilter;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Post;
use ApiPlatform\Metadata\Patch;
use ApiPlatform\Metadata\Delete;
use ApiPlatform\Doctrine\Orm\Filter\SearchFilter;
use ApiPlatform\Doctrine\Orm\Filter\OrderFilter;
use ApiPlatform\Doctrine\Orm\Filter\DateFilter;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Validator\Constraints as Assert;
use Symfony\Component\Serializer\Annotation\Groups;

#[ORM\Entity(repositoryClass: {Entity}Repository::class)]
#[ORM\Table(name: '{entities}')]
#[ApiResource(
    operations: [
        new GetCollection(
            uriTemplate: '/{entities}',
            normalizationContext: ['groups' => ['{entity}:list']],
            paginationEnabled: true,
            paginationItemsPerPage: 20,
        ),
        new Get(
            uriTemplate: '/{entities}/{id}',
            normalizationContext: ['groups' => ['{entity}:read']],
        ),
        new Post(
            uriTemplate: '/{entities}',
            denormalizationContext: ['groups' => ['{entity}:write']],
            validationContext: ['groups' => ['Default', '{entity}:create']],
            security: "is_granted('ROLE_USER')",
        ),
        new Patch(
            uriTemplate: '/{entities}/{id}',
            denormalizationContext: ['groups' => ['{entity}:write']],
            security: "is_granted('ROLE_USER') and object.getOwner() == user",
        ),
        new Delete(
            uriTemplate: '/{entities}/{id}',
            security: "is_granted('ROLE_ADMIN')",
        ),
    ],
    order: ['createdAt' => 'DESC'],
)]
#[ApiFilter(SearchFilter::class, properties: [
    'name' => 'partial',
    'status' => 'exact',
])]
#[ApiFilter(OrderFilter::class, properties: ['createdAt', 'name'])]
#[ApiFilter(DateFilter::class, properties: ['createdAt'])]
class {Entity}
{
    #[ORM\Id]
    #[ORM\Column(type: 'uuid', unique: true)]
    #[ORM\GeneratedValue(strategy: 'CUSTOM')]
    #[ORM\CustomIdGenerator(class: 'doctrine.uuid_generator')]
    #[ApiProperty(identifier: true)]
    #[Groups(['{entity}:list', '{entity}:read'])]
    private ?string $id = null;

    #[ORM\Column(length: 255)]
    #[Assert\NotBlank(groups: ['{entity}:create'])]
    #[Assert\Length(min: 3, max: 255)]
    #[Groups(['{entity}:list', '{entity}:read', '{entity}:write'])]
    private string $name;

    #[ORM\Column(type: 'text', nullable: true)]
    #[Groups(['{entity}:read', '{entity}:write'])]
    private ?string $description = null;

    #[ORM\Column(length: 50)]
    #[Assert\Choice(choices: ['draft', 'published', 'archived'])]
    #[Groups(['{entity}:list', '{entity}:read', '{entity}:write'])]
    private string $status = 'draft';

    #[ORM\Column(type: 'decimal', precision: 10, scale: 2, nullable: true)]
    #[Assert\PositiveOrZero]
    #[Groups(['{entity}:read', '{entity}:write'])]
    private ?string $price = null;

    #[ORM\ManyToOne(targetEntity: User::class)]
    #[ORM\JoinColumn(nullable: false)]
    #[Groups(['{entity}:read'])]
    private User $owner;

    #[ORM\Column(type: 'datetime_immutable')]
    #[Groups(['{entity}:list', '{entity}:read'])]
    private \DateTimeImmutable $createdAt;

    #[ORM\Column(type: 'datetime_immutable', nullable: true)]
    #[Groups(['{entity}:read'])]
    private ?\DateTimeImmutable $updatedAt = null;

    public function __construct()
    {
        $this->createdAt = new \DateTimeImmutable();
    }

    // Getters et Setters...
}
```

### Étape 2 : State Processors (pour logique métier)

#### Processor pour la création

```php
<?php

declare(strict_types=1);

namespace App\State;

use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProcessorInterface;
use App\Entity\{Entity};
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\SecurityBundle\Security;

final class {Entity}Processor implements ProcessorInterface
{
    public function __construct(
        private readonly EntityManagerInterface $entityManager,
        private readonly Security $security,
    ) {}

    public function process(
        mixed $data,
        Operation $operation,
        array $uriVariables = [],
        array $context = []
    ): {Entity} {
        /** @var {Entity} $data */

        // Assigner le propriétaire automatiquement
        if ($data->getId() === null) {
            $data->setOwner($this->security->getUser());
        } else {
            $data->setUpdatedAt(new \DateTimeImmutable());
        }

        $this->entityManager->persist($data);
        $this->entityManager->flush();

        return $data;
    }
}
```

#### Configuration du Processor

```php
#[ApiResource(
    operations: [
        new Post(
            processor: {Entity}Processor::class,
        ),
        new Patch(
            processor: {Entity}Processor::class,
        ),
    ],
)]
```

### Étape 3 : Custom Filters

```php
<?php

declare(strict_types=1);

namespace App\Filter;

use ApiPlatform\Doctrine\Orm\Filter\AbstractFilter;
use ApiPlatform\Doctrine\Orm\Util\QueryNameGeneratorInterface;
use ApiPlatform\Metadata\Operation;
use Doctrine\ORM\QueryBuilder;

final class {Entity}StatusFilter extends AbstractFilter
{
    protected function filterProperty(
        string $property,
        mixed $value,
        QueryBuilder $queryBuilder,
        QueryNameGeneratorInterface $queryNameGenerator,
        string $resourceClass,
        ?Operation $operation = null,
        array $context = []
    ): void {
        if ($property !== 'activeOnly') {
            return;
        }

        if ($value === 'true' || $value === '1') {
            $alias = $queryBuilder->getRootAliases()[0];
            $queryBuilder
                ->andWhere("$alias.status = :status")
                ->setParameter('status', 'published');
        }
    }

    public function getDescription(string $resourceClass): array
    {
        return [
            'activeOnly' => [
                'property' => 'activeOnly',
                'type' => 'bool',
                'required' => false,
                'description' => 'Filtrer uniquement les éléments publiés',
            ],
        ];
    }
}
```

### Étape 4 : Documentation OpenAPI

```php
<?php

declare(strict_types=1);

namespace App\OpenApi;

use ApiPlatform\OpenApi\Factory\OpenApiFactoryInterface;
use ApiPlatform\OpenApi\Model;
use ApiPlatform\OpenApi\OpenApi;

final class {Entity}OpenApiDecorator implements OpenApiFactoryInterface
{
    public function __construct(
        private readonly OpenApiFactoryInterface $decorated
    ) {}

    public function __invoke(array $context = []): OpenApi
    {
        $openApi = ($this->decorated)($context);

        // Ajouter des exemples personnalisés
        $pathItem = $openApi->getPaths()->getPath('/api/{entities}');

        if ($pathItem?->getPost()) {
            $operation = $pathItem->getPost()->withRequestBody(
                new Model\RequestBody(
                    content: new \ArrayObject([
                        'application/json' => [
                            'schema' => [
                                '$ref' => '#/components/schemas/{Entity}-{entity}:write',
                            ],
                            'example' => [
                                'name' => 'Exemple de produit',
                                'description' => 'Description détaillée',
                                'price' => '29.99',
                                'status' => 'draft',
                            ],
                        ],
                    ])
                )
            );

            $openApi->getPaths()->addPath('/api/{entities}', $pathItem->withPost($operation));
        }

        return $openApi;
    }
}
```

### Étape 5 : Tests API

```php
<?php

declare(strict_types=1);

namespace App\Tests\Api;

use ApiPlatform\Symfony\Bundle\Test\ApiTestCase;
use App\Entity\{Entity};
use App\Factory\{Entity}Factory;
use App\Factory\UserFactory;
use Zenstruck\Foundry\Test\Factories;
use Zenstruck\Foundry\Test\ResetDatabase;

class {Entity}ApiTest extends ApiTestCase
{
    use ResetDatabase;
    use Factories;

    public function testGetCollection(): void
    {
        {Entity}Factory::createMany(30);

        $response = static::createClient()->request('GET', '/api/{entities}');

        $this->assertResponseIsSuccessful();
        $this->assertJsonContains([
            '@context' => '/api/contexts/{Entity}',
            '@type' => 'hydra:Collection',
            'hydra:totalItems' => 30,
        ]);
        $this->assertCount(20, $response->toArray()['hydra:member']); // Pagination
    }

    public function testGetItem(): void
    {
        $entity = {Entity}Factory::createOne(['name' => 'Test']);

        static::createClient()->request('GET', '/api/{entities}/' . $entity->getId());

        $this->assertResponseIsSuccessful();
        $this->assertJsonContains([
            'name' => 'Test',
        ]);
    }

    public function testCreateRequiresAuthentication(): void
    {
        static::createClient()->request('POST', '/api/{entities}', [
            'json' => ['name' => 'Test'],
        ]);

        $this->assertResponseStatusCodeSame(401);
    }

    public function testCreateAsAuthenticatedUser(): void
    {
        $user = UserFactory::createOne();

        static::createClient()->request('POST', '/api/{entities}', [
            'auth_bearer' => $this->getToken($user),
            'json' => [
                'name' => 'Nouveau produit',
                'description' => 'Description',
                'price' => '19.99',
            ],
        ]);

        $this->assertResponseStatusCodeSame(201);
        $this->assertJsonContains([
            'name' => 'Nouveau produit',
            'status' => 'draft',
        ]);
    }

    public function testUpdateOwnResource(): void
    {
        $user = UserFactory::createOne();
        $entity = {Entity}Factory::createOne(['owner' => $user]);

        static::createClient()->request('PATCH', '/api/{entities}/' . $entity->getId(), [
            'auth_bearer' => $this->getToken($user),
            'headers' => ['Content-Type' => 'application/merge-patch+json'],
            'json' => ['name' => 'Updated'],
        ]);

        $this->assertResponseIsSuccessful();
    }

    public function testCannotUpdateOthersResource(): void
    {
        $owner = UserFactory::createOne();
        $otherUser = UserFactory::createOne();
        $entity = {Entity}Factory::createOne(['owner' => $owner]);

        static::createClient()->request('PATCH', '/api/{entities}/' . $entity->getId(), [
            'auth_bearer' => $this->getToken($otherUser),
            'headers' => ['Content-Type' => 'application/merge-patch+json'],
            'json' => ['name' => 'Hacked'],
        ]);

        $this->assertResponseStatusCodeSame(403);
    }

    public function testDeleteRequiresAdmin(): void
    {
        $user = UserFactory::createOne();
        $entity = {Entity}Factory::createOne();

        static::createClient()->request('DELETE', '/api/{entities}/' . $entity->getId(), [
            'auth_bearer' => $this->getToken($user),
        ]);

        $this->assertResponseStatusCodeSame(403);
    }

    public function testFilters(): void
    {
        {Entity}Factory::createMany(5, ['status' => 'draft']);
        {Entity}Factory::createMany(3, ['status' => 'published']);

        $response = static::createClient()->request('GET', '/api/{entities}?status=published');

        $this->assertCount(3, $response->toArray()['hydra:member']);
    }

    private function getToken(object $user): string
    {
        // Générer un JWT token pour les tests
        return $this->getContainer()->get('lexik_jwt_authentication.jwt_manager')
            ->create($user->object());
    }
}
```

### Étape 6 : Résumé

```
══════════════════════════════════════════════════════════════
✅ ENDPOINT API PLATFORM CRÉÉ - {Entity}
══════════════════════════════════════════════════════════════

📁 Fichiers créés/modifiés :
- src/Entity/{Entity}.php (avec attributs API Platform)
- src/State/{Entity}Processor.php
- src/Filter/{Entity}StatusFilter.php
- src/OpenApi/{Entity}OpenApiDecorator.php
- tests/Api/{Entity}ApiTest.php

📌 Endpoints disponibles :

| Méthode | URI | Description | Auth |
|---------|-----|-------------|------|
| GET | /api/{entities} | Liste paginée | Non |
| GET | /api/{entities}/{id} | Détail | Non |
| POST | /api/{entities} | Création | ROLE_USER |
| PATCH | /api/{entities}/{id} | Modification | Owner |
| DELETE | /api/{entities}/{id} | Suppression | ROLE_ADMIN |

🔍 Filtres disponibles :
- ?name=xxx (recherche partielle)
- ?status=draft|published|archived
- ?createdAt[after]=2024-01-01
- ?order[createdAt]=desc

📖 Documentation :
- OpenAPI : /api/docs
- ReDoc : /api/docs?ui=re_doc

🔧 Tests :
docker compose exec php vendor/bin/phpunit tests/Api/{Entity}ApiTest.php
```
