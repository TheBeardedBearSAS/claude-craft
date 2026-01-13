# Standards de Tests PHP

## Frameworks de Test

### PHPUnit (Standard)

```php
<?php

declare(strict_types=1);

namespace App\Tests\Unit\Domain\Entity;

use App\Domain\Entity\User;
use App\Domain\ValueObject\Email;
use App\Domain\ValueObject\UserId;
use App\Domain\Enum\UserStatus;
use PHPUnit\Framework\TestCase;
use PHPUnit\Framework\Attributes\Test;
use PHPUnit\Framework\Attributes\DataProvider;
use PHPUnit\Framework\Attributes\CoversClass;

#[CoversClass(User::class)]
final class UserTest extends TestCase
{
    #[Test]
    public function it_can_be_created_with_valid_data(): void
    {
        // Arrange
        $id = UserId::generate();
        $email = Email::fromString('john@example.com');
        $name = 'John Doe';

        // Act
        $user = User::create($id, $email, $name);

        // Assert
        $this->assertTrue($user->getId()->equals($id));
        $this->assertTrue($user->getEmail()->equals($email));
        $this->assertSame($name, $user->getName());
        $this->assertSame(UserStatus::PENDING, $user->getStatus());
    }

    #[Test]
    public function it_can_be_activated(): void
    {
        // Arrange
        $user = $this->createPendingUser();

        // Act
        $user->activate();

        // Assert
        $this->assertSame(UserStatus::ACTIVE, $user->getStatus());
    }

    #[Test]
    public function it_cannot_be_activated_twice(): void
    {
        // Arrange
        $user = $this->createPendingUser();
        $user->activate();

        // Assert
        $this->expectException(InvalidUserStateException::class);
        $this->expectExceptionMessage('Seuls les utilisateurs en attente peuvent être activés');

        // Act
        $user->activate();
    }

    private function createPendingUser(): User
    {
        return User::create(
            UserId::generate(),
            Email::fromString('test@example.com'),
            'Test User',
        );
    }
}
```

### Pest (Moderne, Expressif)

```php
<?php

declare(strict_types=1);

use App\Domain\Entity\User;
use App\Domain\ValueObject\Email;
use App\Domain\ValueObject\UserId;
use App\Domain\Enum\UserStatus;
use App\Domain\Exception\InvalidUserStateException;

describe('Entité User', function () {

    it('peut être créé avec des données valides', function () {
        $id = UserId::generate();
        $email = Email::fromString('john@example.com');
        $name = 'John Doe';

        $user = User::create($id, $email, $name);

        expect($user->getId())->toEqual($id);
        expect($user->getEmail())->toEqual($email);
        expect($user->getName())->toBe($name);
        expect($user->getStatus())->toBe(UserStatus::PENDING);
    });

    it('peut être activé quand en attente', function () {
        $user = createPendingUser();

        $user->activate();

        expect($user->getStatus())->toBe(UserStatus::ACTIVE);
    });

    it('ne peut pas être activé deux fois', function () {
        $user = createPendingUser();
        $user->activate();

        $user->activate();
    })->throws(InvalidUserStateException::class, 'Seuls les utilisateurs en attente peuvent être activés');

    it('enregistre les événements de domaine lors de la création', function () {
        $user = createPendingUser();

        $events = $user->pullDomainEvents();

        expect($events)->toHaveCount(1);
        expect($events[0])->toBeInstanceOf(UserCreatedEvent::class);
    });

});

// Fonction helper
function createPendingUser(): User
{
    return User::create(
        UserId::generate(),
        Email::fromString('test@example.com'),
        'Test User',
    );
}
```

## Organisation des Tests

### Structure des Répertoires

```
tests/
├── Unit/                           # Tests unitaires isolés
│   ├── Domain/
│   │   ├── Entity/
│   │   │   ├── UserTest.php
│   │   │   └── OrderTest.php
│   │   ├── ValueObject/
│   │   │   ├── EmailTest.php
│   │   │   └── MoneyTest.php
│   │   └── Service/
│   │       └── PriceCalculatorTest.php
│   └── Application/
│       └── UseCase/
│           └── CreateUserHandlerTest.php
│
├── Integration/                    # Tests avec vraies dépendances
│   ├── Infrastructure/
│   │   └── Persistence/
│   │       └── DoctrineUserRepositoryTest.php
│   └── Application/
│       └── Service/
│           └── UserServiceIntegrationTest.php
│
├── Functional/                     # Tests d'application complète
│   └── Api/
│       ├── UserApiTest.php
│       └── OrderApiTest.php
│
├── Fixtures/                       # Données de test
│   ├── UserFixture.php
│   └── OrderFixture.php
│
└── bootstrap.php                   # Bootstrap des tests
```

### Convention de Nommage des Tests

```php
<?php
// Nommage méthode: it_[comportement_attendu]_when_[condition]
public function it_creates_user_when_data_is_valid(): void {}
public function it_throws_exception_when_email_is_invalid(): void {}
public function it_returns_null_when_user_not_found(): void {}

// Ou: test_[comportement_attendu]
public function test_user_can_be_created(): void {}
public function test_user_activation(): void {}

// Style Pest
it('crée un utilisateur quand les données sont valides', function () {});
it('lance une exception quand l\'email est invalide', function () {});
```

## Mocking avec Prophecy/Mockery

### Mocks PHPUnit

```php
<?php

declare(strict_types=1);

namespace App\Tests\Unit\Application\UseCase;

use App\Application\UseCase\User\CreateUser\CreateUserCommand;
use App\Application\UseCase\User\CreateUser\CreateUserHandler;
use App\Domain\Entity\User;
use App\Domain\Repository\UserRepositoryInterface;
use App\Domain\ValueObject\Email;
use App\Domain\ValueObject\UserId;
use PHPUnit\Framework\TestCase;
use PHPUnit\Framework\MockObject\MockObject;

final class CreateUserHandlerTest extends TestCase
{
    private MockObject&UserRepositoryInterface $userRepository;
    private CreateUserHandler $handler;

    protected function setUp(): void
    {
        $this->userRepository = $this->createMock(UserRepositoryInterface::class);
        $this->handler = new CreateUserHandler($this->userRepository);
    }

    #[Test]
    public function it_creates_user_successfully(): void
    {
        // Arrange
        $command = new CreateUserCommand(
            email: 'john@example.com',
            name: 'John Doe',
            password: 'password123',
        );

        $this->userRepository
            ->expects($this->once())
            ->method('findByEmail')
            ->with($this->callback(
                fn (Email $email) => $email->getValue() === 'john@example.com'
            ))
            ->willReturn(null);

        $this->userRepository
            ->expects($this->once())
            ->method('nextIdentity')
            ->willReturn(UserId::generate());

        $this->userRepository
            ->expects($this->once())
            ->method('save')
            ->with($this->isInstanceOf(User::class));

        // Act
        $response = $this->handler->handle($command);

        // Assert
        $this->assertSame('john@example.com', $response->email);
        $this->assertSame('John Doe', $response->name);
    }

    #[Test]
    public function it_throws_exception_when_user_already_exists(): void
    {
        // Arrange
        $command = new CreateUserCommand(
            email: 'existing@example.com',
            name: 'Existing User',
            password: 'password123',
        );

        $existingUser = $this->createMock(User::class);

        $this->userRepository
            ->method('findByEmail')
            ->willReturn($existingUser);

        // Assert
        $this->expectException(UserAlreadyExistsException::class);

        // Act
        $this->handler->handle($command);
    }
}
```

### Mockery (Alternative)

```php
<?php

declare(strict_types=1);

use Mockery as m;

it('crée un utilisateur avec succès avec mockery', function () {
    $repository = m::mock(UserRepositoryInterface::class);

    $repository
        ->shouldReceive('findByEmail')
        ->once()
        ->andReturn(null);

    $repository
        ->shouldReceive('nextIdentity')
        ->once()
        ->andReturn(UserId::generate());

    $repository
        ->shouldReceive('save')
        ->once()
        ->with(m::type(User::class));

    $handler = new CreateUserHandler($repository);
    $response = $handler->handle(new CreateUserCommand(...));

    expect($response->email)->toBe('john@example.com');
});

afterEach(function () {
    m::close();
});
```

## Data Providers

### DataProvider PHPUnit

```php
<?php

declare(strict_types=1);

use PHPUnit\Framework\Attributes\DataProvider;

final class EmailTest extends TestCase
{
    #[Test]
    #[DataProvider('validEmailsProvider')]
    public function it_accepts_valid_emails(string $email): void
    {
        $emailVo = Email::fromString($email);

        $this->assertSame(strtolower($email), $emailVo->getValue());
    }

    public static function validEmailsProvider(): iterable
    {
        yield 'email simple' => ['john@example.com'];
        yield 'avec sous-domaine' => ['jane@mail.example.com'];
        yield 'avec signe plus' => ['john+newsletter@example.com'];
        yield 'avec chiffres' => ['user123@example.com'];
        yield 'majuscules' => ['JOHN@EXAMPLE.COM'];
    }

    #[Test]
    #[DataProvider('invalidEmailsProvider')]
    public function it_rejects_invalid_emails(string $invalidEmail): void
    {
        $this->expectException(InvalidEmailException::class);

        Email::fromString($invalidEmail);
    }

    public static function invalidEmailsProvider(): iterable
    {
        yield 'sans arobase' => ['johnexample.com'];
        yield 'sans domaine' => ['john@'];
        yield 'sans nom utilisateur' => ['@example.com'];
        yield 'double arobase' => ['john@@example.com'];
        yield 'avec espaces' => ['john @example.com'];
        yield 'chaîne vide' => [''];
    }
}
```

### Datasets Pest

```php
<?php

it('accepte les emails valides', function (string $email) {
    $emailVo = Email::fromString($email);

    expect($emailVo->getValue())->toBe(strtolower($email));
})->with([
    'email simple' => 'john@example.com',
    'avec sous-domaine' => 'jane@mail.example.com',
    'avec signe plus' => 'john+newsletter@example.com',
    'majuscules' => 'JOHN@EXAMPLE.COM',
]);

it('rejette les emails invalides', function (string $invalidEmail) {
    Email::fromString($invalidEmail);
})->throws(InvalidEmailException::class)->with([
    'sans arobase' => 'johnexample.com',
    'sans domaine' => 'john@',
    'sans nom utilisateur' => '@example.com',
    'chaîne vide' => '',
]);
```

## Tests d'Intégration

### Test d'Intégration Repository

```php
<?php

declare(strict_types=1);

namespace App\Tests\Integration\Infrastructure\Persistence;

use App\Domain\Entity\User;
use App\Domain\ValueObject\Email;
use App\Infrastructure\Persistence\Doctrine\DoctrineUserRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Test\KernelTestCase;

final class DoctrineUserRepositoryTest extends KernelTestCase
{
    private EntityManagerInterface $entityManager;
    private DoctrineUserRepository $repository;

    protected function setUp(): void
    {
        self::bootKernel();

        $this->entityManager = self::getContainer()->get(EntityManagerInterface::class);
        $this->repository = new DoctrineUserRepository($this->entityManager);

        // Démarrer une transaction pour rollback
        $this->entityManager->beginTransaction();
    }

    protected function tearDown(): void
    {
        // Rollback la transaction pour nettoyer
        $this->entityManager->rollback();
        $this->entityManager->close();

        parent::tearDown();
    }

    #[Test]
    public function it_can_save_and_retrieve_user(): void
    {
        // Arrange
        $user = User::create(
            $this->repository->nextIdentity(),
            Email::fromString('test@example.com'),
            'Test User',
        );

        // Act
        $this->repository->save($user);
        $this->entityManager->clear();

        $found = $this->repository->find($user->getId());

        // Assert
        $this->assertNotNull($found);
        $this->assertTrue($found->getId()->equals($user->getId()));
        $this->assertSame('test@example.com', $found->getEmail()->getValue());
    }

    #[Test]
    public function it_returns_null_when_user_not_found(): void
    {
        $found = $this->repository->find(UserId::generate());

        $this->assertNull($found);
    }
}
```

### Testcontainers (Basé sur Docker)

```php
<?php

declare(strict_types=1);

use Testcontainers\Container\PostgresContainer;

beforeAll(function () {
    $this->container = PostgresContainer::make('16-alpine', 'test')
        ->withUsername('test')
        ->withPassword('test');
    $this->container->start();
});

afterAll(function () {
    $this->container->stop();
});

it('persiste l\'utilisateur dans postgres', function () {
    $dsn = $this->container->getDsn();
    $pdo = new PDO($dsn, 'test', 'test');

    // Exécuter les migrations et tester
});
```

## Tests Fonctionnels/API

### Tests HTTP

```php
<?php

declare(strict_types=1);

namespace App\Tests\Functional\Api;

use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;

final class UserApiTest extends WebTestCase
{
    #[Test]
    public function it_creates_user_via_api(): void
    {
        $client = static::createClient();

        $client->request(
            method: 'POST',
            uri: '/api/v1/users',
            server: ['CONTENT_TYPE' => 'application/json'],
            content: json_encode([
                'email' => 'new@example.com',
                'name' => 'New User',
                'password' => 'password123',
            ]),
        );

        $this->assertResponseStatusCodeSame(201);
        $this->assertResponseHeaderSame('content-type', 'application/json');

        $response = json_decode($client->getResponse()->getContent(), true);

        $this->assertArrayHasKey('id', $response);
        $this->assertSame('new@example.com', $response['email']);
    }

    #[Test]
    public function it_returns_validation_errors(): void
    {
        $client = static::createClient();

        $client->request(
            method: 'POST',
            uri: '/api/v1/users',
            server: ['CONTENT_TYPE' => 'application/json'],
            content: json_encode([
                'email' => 'invalid-email',
                'name' => '',
            ]),
        );

        $this->assertResponseStatusCodeSame(422);

        $response = json_decode($client->getResponse()->getContent(), true);
        $this->assertArrayHasKey('errors', $response);
    }
}
```

## Couverture de Code

### Configuration

```xml
<!-- phpunit.xml -->
<source>
    <include>
        <directory>src</directory>
    </include>
    <exclude>
        <file>src/Kernel.php</file>
        <directory>src/Infrastructure/Migrations</directory>
    </exclude>
</source>

<coverage>
    <report>
        <html outputDirectory="coverage"/>
        <clover outputFile="coverage/clover.xml"/>
    </report>
</coverage>
```

### Objectifs de Couverture

| Couche | Objectif | Minimum |
|--------|----------|---------|
| Domain | 90% | 80% |
| Application | 85% | 75% |
| Infrastructure | 70% | 60% |
| Global | 80% | 70% |

### Commandes

```bash
# Générer la couverture HTML
vendor/bin/phpunit --coverage-html coverage

# Résumé de couverture en texte
vendor/bin/phpunit --coverage-text

# Couverture Pest
vendor/bin/pest --coverage --min=80
```

## Checklist de Tests

- [ ] Tests unitaires pour toutes les entités et value objects du Domain
- [ ] Tests unitaires pour tous les handlers de commandes/requêtes
- [ ] Tests d'intégration pour les implémentations de repository
- [ ] Tests fonctionnels pour les endpoints API
- [ ] Data providers pour les cas limites
- [ ] Les mocks vérifient les interactions attendues
- [ ] Les tests sont indépendants et isolés
- [ ] Pas d'interdépendances entre tests
- [ ] Couverture de code > 80%
- [ ] Les tests suivent le pattern AAA (Arrange-Act-Assert)
