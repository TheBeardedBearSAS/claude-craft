# PHP Testing Standards

## Testing Frameworks

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
        $this->expectExceptionMessage('Only pending users can be activated');

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

### Pest 4 (PHPUnit 12, Modern, Expressive)

> **Pest 4 (2026) :** Basé sur **PHPUnit 12**. Nouveautés clés :
> - **Browser Testing natif** via `pest-plugin-browser` (Playwright sous le capot) — `->browser()` dans les tests Pest, plus besoin de Dusk séparé.
> - **Test sharding** : `--shard=1/4` pour distribuer la suite sur plusieurs runners CI.
> - **Visual regression** : comparaison de screenshots via `->assertMatchesSnapshot()` dans les browser tests.
> - PHPUnit 12 : attributs PHP natifs pour les data providers (pas de `@dataProvider` annot.) déjà supportés depuis PHPUnit 11, consolidés en 12.
>
> Source : [Pest 4 Blog](https://pestphp.com/docs/pest-v4-is-here-now-with-browser-testing)

```php
<?php

declare(strict_types=1);

use App\Domain\Entity\User;
use App\Domain\ValueObject\Email;
use App\Domain\ValueObject\UserId;
use App\Domain\Enum\UserStatus;
use App\Domain\Exception\InvalidUserStateException;

describe('User Entity', function () {

    it('can be created with valid data', function () {
        $id = UserId::generate();
        $email = Email::fromString('john@example.com');
        $name = 'John Doe';

        $user = User::create($id, $email, $name);

        expect($user->getId())->toEqual($id);
        expect($user->getEmail())->toEqual($email);
        expect($user->getName())->toBe($name);
        expect($user->getStatus())->toBe(UserStatus::PENDING);
    });

    it('can be activated when pending', function () {
        $user = createPendingUser();

        $user->activate();

        expect($user->getStatus())->toBe(UserStatus::ACTIVE);
    });

    it('cannot be activated twice', function () {
        $user = createPendingUser();
        $user->activate();

        $user->activate();
    })->throws(InvalidUserStateException::class, 'Only pending users can be activated');

    it('records domain events when created', function () {
        $user = createPendingUser();

        $events = $user->pullDomainEvents();

        expect($events)->toHaveCount(1);
        expect($events[0])->toBeInstanceOf(UserCreatedEvent::class);
    });

});

// Helper function
function createPendingUser(): User
{
    return User::create(
        UserId::generate(),
        Email::fromString('test@example.com'),
        'Test User',
    );
}
```

## Test Organization

### Test Directory Structure

```
tests/
├── Unit/                           # Isolated unit tests
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
├── Integration/                    # Tests with real dependencies
│   ├── Infrastructure/
│   │   └── Persistence/
│   │       └── DoctrineUserRepositoryTest.php
│   └── Application/
│       └── Service/
│           └── UserServiceIntegrationTest.php
│
├── Functional/                     # Full application tests
│   └── Api/
│       ├── UserApiTest.php
│       └── OrderApiTest.php
│
├── Fixtures/                       # Test data
│   ├── UserFixture.php
│   └── OrderFixture.php
│
└── bootstrap.php                   # Test bootstrap
```

### Test Naming Convention

```php
<?php
// Method naming: it_[expected_behavior]_when_[condition]
public function it_creates_user_when_data_is_valid(): void {}
public function it_throws_exception_when_email_is_invalid(): void {}
public function it_returns_null_when_user_not_found(): void {}

// Or: test_[expected_behavior]
public function test_user_can_be_created(): void {}
public function test_user_activation(): void {}

// Pest style
it('creates user when data is valid', function () {});
it('throws exception when email is invalid', function () {});
```

## Mocking with Prophecy/Mockery

### PHPUnit Mocks

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

it('creates user successfully with mockery', function () {
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

### PHPUnit DataProvider

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
        yield 'simple email' => ['john@example.com'];
        yield 'with subdomain' => ['jane@mail.example.com'];
        yield 'with plus sign' => ['john+newsletter@example.com'];
        yield 'with numbers' => ['user123@example.com'];
        yield 'uppercase' => ['JOHN@EXAMPLE.COM'];
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
        yield 'no at sign' => ['johnexample.com'];
        yield 'no domain' => ['john@'];
        yield 'no username' => ['@example.com'];
        yield 'double at' => ['john@@example.com'];
        yield 'spaces' => ['john @example.com'];
        yield 'empty string' => [''];
    }
}
```

### Pest Datasets

```php
<?php

it('accepts valid emails', function (string $email) {
    $emailVo = Email::fromString($email);

    expect($emailVo->getValue())->toBe(strtolower($email));
})->with([
    'simple email' => 'john@example.com',
    'with subdomain' => 'jane@mail.example.com',
    'with plus sign' => 'john+newsletter@example.com',
    'uppercase' => 'JOHN@EXAMPLE.COM',
]);

it('rejects invalid emails', function (string $invalidEmail) {
    Email::fromString($invalidEmail);
})->throws(InvalidEmailException::class)->with([
    'no at sign' => 'johnexample.com',
    'no domain' => 'john@',
    'no username' => '@example.com',
    'empty string' => '',
]);
```

## Integration Testing

### Repository Integration Test

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

        // Start transaction for rollback
        $this->entityManager->beginTransaction();
    }

    protected function tearDown(): void
    {
        // Rollback transaction to clean up
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

### Testcontainers (Docker-based)

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

it('persists user to postgres', function () {
    $dsn = $this->container->getDsn();
    $pdo = new PDO($dsn, 'test', 'test');

    // Run migrations and test
});
```

## Functional/API Testing

### HTTP Tests

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

## Test Coverage

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

### Coverage Targets

| Layer | Target | Minimum |
|-------|--------|---------|
| Domain | 90% | 80% |
| Application | 85% | 75% |
| Infrastructure | 70% | 60% |
| Overall | 80% | 70% |

### Commands

```bash
# Generate HTML coverage
vendor/bin/phpunit --coverage-html coverage

# Text coverage summary
vendor/bin/phpunit --coverage-text

# Pest coverage
vendor/bin/pest --coverage --min=80
```

## Testing Checklist

- [ ] Unit tests for all Domain entities and value objects
- [ ] Unit tests for all Application use case handlers
- [ ] Integration tests for repository implementations
- [ ] Functional tests for API endpoints
- [ ] Data providers for edge cases
- [ ] Mocks verify expected interactions
- [ ] Tests are independent and isolated
- [ ] No test interdependencies
- [ ] Code coverage > 80%
- [ ] Tests follow AAA pattern (Arrange-Act-Assert)
