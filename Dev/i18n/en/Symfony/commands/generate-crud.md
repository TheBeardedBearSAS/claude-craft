---
description: Génération CRUD Complet
argument-hint: [arguments]
---

# Génération CRUD Complet

Tu es un développeur Symfony senior. Tu dois générer un CRUD complet respectant la Clean Architecture, incluant Entity, Repository, Controller, Templates, Form, et Tests.

## Arguments
$ARGUMENTS

Arguments :
- Nom de the entity (ex: `Product`, `BlogPost`)
- (Optionnel) Champs au format `nom:type` séparés par des virgules

Exemple : `/symfony:generate-crud Product name:string,price:decimal,description:text`

## MISSION

### Step 1 : Analysis des Besoins

Check :
- L'entité n'existe pas déjà
- Les conventions de nommage Symfony
- La structure du projet (DDD ou standard)

### Step 2 : Génération des Fichiers

#### Structure à créer (Clean Architecture)

```
src/
├── Domain/
│   └── {Entity}/
│       ├── Entity/
│       │   └── {Entity}.php
│       ├── Repository/
│       │   └── {Entity}RepositoryInterface.php
│       └── ValueObject/
│           └── {Entity}Id.php
├── Application/
│   └── {Entity}/
│       ├── Command/
│       │   ├── Create{Entity}Command.php
│       │   ├── Update{Entity}Command.php
│       │   └── Delete{Entity}Command.php
│       ├── Handler/
│       │   ├── Create{Entity}Handler.php
│       │   ├── Update{Entity}Handler.php
│       │   └── Delete{Entity}Handler.php
│       ├── Query/
│       │   ├── Get{Entity}Query.php
│       │   └── List{Entities}Query.php
│       └── DTO/
│           └── {Entity}DTO.php
├── Infrastructure/
│   └── Persistence/
│       └── Doctrine/
│           └── {Entity}Repository.php
└── Presentation/
    └── Controller/
        └── {Entity}Controller.php

templates/
└── {entity}/
    ├── index.html.twig
    ├── show.html.twig
    ├── new.html.twig
    ├── edit.html.twig
    └── _form.html.twig

tests/
├── Unit/
│   └── Domain/
│       └── {Entity}/
│           └── {Entity}Test.php
└── Functional/
    └── Controller/
        └── {Entity}ControllerTest.php
```

### Step 3 : Templates de Code

#### Entity (Domain)

```php
<?php

declare(strict_types=1);

namespace App\Domain\{Entity}\Entity;

use App\Domain\{Entity}\ValueObject\{Entity}Id;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: \App\Infrastructure\Persistence\Doctrine\{Entity}Repository::class)]
#[ORM\Table(name: '{entities}')]
class {Entity}
{
    #[ORM\Id]
    #[ORM\Column(type: 'uuid', unique: true)]
    private {Entity}Id $id;

    // Champs générés selon les arguments
    #[ORM\Column(type: 'string', length: 255)]
    private string $name;

    #[ORM\Column(type: 'datetime_immutable')]
    private \DateTimeImmutable $createdAt;

    #[ORM\Column(type: 'datetime_immutable', nullable: true)]
    private ?\DateTimeImmutable $updatedAt = null;

    public function __construct({Entity}Id $id, string $name)
    {
        $this->id = $id;
        $this->name = $name;
        $this->createdAt = new \DateTimeImmutable();
    }

    public function getId(): {Entity}Id
    {
        return $this->id;
    }

    public function getName(): string
    {
        return $this->name;
    }

    public function setName(string $name): self
    {
        $this->name = $name;
        $this->updatedAt = new \DateTimeImmutable();
        return $this;
    }

    // Autres getters/setters...
}
```

#### Repository Interface (Domain)

```php
<?php

declare(strict_types=1);

namespace App\Domain\{Entity}\Repository;

use App\Domain\{Entity}\Entity\{Entity};
use App\Domain\{Entity}\ValueObject\{Entity}Id;

interface {Entity}RepositoryInterface
{
    public function findById({Entity}Id $id): ?{Entity};
    public function findAll(): array;
    public function save({Entity} $entity): void;
    public function delete({Entity} $entity): void;
}
```

#### Repository Implementation (Infrastructure)

```php
<?php

declare(strict_types=1);

namespace App\Infrastructure\Persistence\Doctrine;

use App\Domain\{Entity}\Entity\{Entity};
use App\Domain\{Entity}\Repository\{Entity}RepositoryInterface;
use App\Domain\{Entity}\ValueObject\{Entity}Id;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

class {Entity}Repository extends ServiceEntityRepository implements {Entity}RepositoryInterface
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, {Entity}::class);
    }

    public function findById({Entity}Id $id): ?{Entity}
    {
        return $this->find($id);
    }

    public function findAll(): array
    {
        return $this->createQueryBuilder('e')
            ->orderBy('e.createdAt', 'DESC')
            ->getQuery()
            ->getResult();
    }

    public function save({Entity} $entity): void
    {
        $this->getEntityManager()->persist($entity);
        $this->getEntityManager()->flush();
    }

    public function delete({Entity} $entity): void
    {
        $this->getEntityManager()->remove($entity);
        $this->getEntityManager()->flush();
    }
}
```

#### Controller (Presentation)

```php
<?php

declare(strict_types=1);

namespace App\Presentation\Controller;

use App\Application\{Entity}\Command\Create{Entity}Command;
use App\Application\{Entity}\Command\Update{Entity}Command;
use App\Application\{Entity}\Command\Delete{Entity}Command;
use App\Domain\{Entity}\Repository\{Entity}RepositoryInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Messenger\MessageBusInterface;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/{entities}')]
class {Entity}Controller extends AbstractController
{
    public function __construct(
        private readonly {Entity}RepositoryInterface $repository,
        private readonly MessageBusInterface $commandBus,
    ) {}

    #[Route('', name: '{entity}_index', methods: ['GET'])]
    public function index(): Response
    {
        return $this->render('{entity}/index.html.twig', [
            '{entities}' => $this->repository->findAll(),
        ]);
    }

    #[Route('/new', name: '{entity}_new', methods: ['GET', 'POST'])]
    public function new(Request $request): Response
    {
        // Form handling avec CQRS
        if ($request->isMethod('POST')) {
            $command = new Create{Entity}Command(
                name: $request->request->get('name'),
                // autres champs...
            );
            $this->commandBus->dispatch($command);

            $this->addFlash('success', '{Entity} créé avec succès.');
            return $this->redirectToRoute('{entity}_index');
        }

        return $this->render('{entity}/new.html.twig');
    }

    #[Route('/{id}', name: '{entity}_show', methods: ['GET'])]
    public function show(string $id): Response
    {
        $entity = $this->repository->findById(new {Entity}Id($id));

        if (!$entity) {
            throw $this->createNotFoundException('{Entity} non trouvé.');
        }

        return $this->render('{entity}/show.html.twig', [
            '{entity}' => $entity,
        ]);
    }

    #[Route('/{id}/edit', name: '{entity}_edit', methods: ['GET', 'POST'])]
    public function edit(Request $request, string $id): Response
    {
        $entity = $this->repository->findById(new {Entity}Id($id));

        if (!$entity) {
            throw $this->createNotFoundException('{Entity} non trouvé.');
        }

        if ($request->isMethod('POST')) {
            $command = new Update{Entity}Command(
                id: $id,
                name: $request->request->get('name'),
            );
            $this->commandBus->dispatch($command);

            $this->addFlash('success', '{Entity} modifié avec succès.');
            return $this->redirectToRoute('{entity}_index');
        }

        return $this->render('{entity}/edit.html.twig', [
            '{entity}' => $entity,
        ]);
    }

    #[Route('/{id}', name: '{entity}_delete', methods: ['POST'])]
    public function delete(Request $request, string $id): Response
    {
        if ($this->isCsrfTokenValid('delete'.$id, $request->request->get('_token'))) {
            $this->commandBus->dispatch(new Delete{Entity}Command($id));
            $this->addFlash('success', '{Entity} supprimé.');
        }

        return $this->redirectToRoute('{entity}_index');
    }
}
```

#### Template index.html.twig

```twig
{% extends 'base.html.twig' %}

{% block title %}Liste des {Entities}{% endblock %}

{% block body %}
<div class="container mx-auto px-4 py-8">
    <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold">{Entities}</h1>
        <a href="{{ path('{entity}_new') }}" class="btn btn-primary">
            Nouveau {Entity}
        </a>
    </div>

    <table class="table w-full">
        <thead>
            <tr>
                <th>Nom</th>
                <th>Créé le</th>
                <th>Actions</th>
            </tr>
        </thead>
        <tbody>
            {% for {entity} in {entities} %}
            <tr>
                <td>{{ {entity}.name }}</td>
                <td>{{ {entity}.createdAt|date('d/m/Y H:i') }}</td>
                <td>
                    <a href="{{ path('{entity}_show', {id: {entity}.id}) }}">Voir</a>
                    <a href="{{ path('{entity}_edit', {id: {entity}.id}) }}">Modifier</a>
                </td>
            </tr>
            {% else %}
            <tr>
                <td colspan="3">Aucun {entity} trouvé.</td>
            </tr>
            {% endfor %}
        </tbody>
    </table>
</div>
{% endblock %}
```

#### Test Unitaire

```php
<?php

declare(strict_types=1);

namespace App\Tests\Unit\Domain\{Entity};

use App\Domain\{Entity}\Entity\{Entity};
use App\Domain\{Entity}\ValueObject\{Entity}Id;
use PHPUnit\Framework\TestCase;

class {Entity}Test extends TestCase
{
    public function testCanBeCreated(): void
    {
        $id = {Entity}Id::generate();
        $entity = new {Entity}($id, 'Test Name');

        $this->assertSame($id, $entity->getId());
        $this->assertSame('Test Name', $entity->getName());
        $this->assertInstanceOf(\DateTimeImmutable::class, $entity->getCreatedAt());
    }

    public function testCanBeUpdated(): void
    {
        $entity = new {Entity}({Entity}Id::generate(), 'Original');

        $entity->setName('Updated');

        $this->assertSame('Updated', $entity->getName());
        $this->assertNotNull($entity->getUpdatedAt());
    }
}
```

### Step 4 : Migration Doctrine

```bash
docker compose exec php php bin/console make:migration
docker compose exec php php bin/console doctrine:migrations:migrate
```

### Step 5 : Résumé

```
══════════════════════════════════════════════════════════════
✅ CRUD GÉNÉRÉ - {Entity}
══════════════════════════════════════════════════════════════

📁 Fichiers créés :
- src/Domain/{Entity}/Entity/{Entity}.php
- src/Domain/{Entity}/Repository/{Entity}RepositoryInterface.php
- src/Domain/{Entity}/ValueObject/{Entity}Id.php
- src/Infrastructure/Persistence/Doctrine/{Entity}Repository.php
- src/Presentation/Controller/{Entity}Controller.php
- templates/{entity}/index.html.twig
- templates/{entity}/show.html.twig
- templates/{entity}/new.html.twig
- templates/{entity}/edit.html.twig
- tests/Unit/Domain/{Entity}/{Entity}Test.php
- tests/Functional/Controller/{Entity}ControllerTest.php

🔧 Commandes à exécuter :
docker compose exec php php bin/console make:migration
docker compose exec php php bin/console doctrine:migrations:migrate
docker compose exec php vendor/bin/phpunit tests/Unit/Domain/{Entity}/

📌 Routes créées :
- GET    /{entities}         {entity}_index
- GET    /{entities}/new     {entity}_new
- POST   /{entities}         {entity}_new
- GET    /{entities}/{id}    {entity}_show
- GET    /{entities}/{id}/edit  {entity}_edit
- POST   /{entities}/{id}/edit  {entity}_edit
- POST   /{entities}/{id}    {entity}_delete
```
