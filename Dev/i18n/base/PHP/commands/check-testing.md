---
description: Test Coverage Analysis
---

# Test Coverage Analysis

Analyze test coverage and testing practices in PHP project.

## What This Command Does

1. **Coverage Analysis**
   - Line coverage percentage
   - Branch coverage percentage
   - Method coverage percentage
   - Class coverage percentage

2. **Test Quality**
   - Test naming conventions
   - AAA pattern compliance
   - Mock usage analysis
   - Assertion coverage

3. **Test Organization**
   - Directory structure
   - Test file naming
   - Test isolation
   - Fixture management

4. **Missing Tests Detection**
   - Untested classes
   - Untested methods
   - Edge cases
   - Error paths

## Coverage Standards

### Minimum Coverage Targets

| Layer | Target | Minimum |
|-------|--------|---------|
| Domain | 90% | 80% |
| Application | 85% | 75% |
| Infrastructure | 70% | 60% |
| Overall | 80% | 70% |

### PHPUnit Configuration

```xml
<?xml version="1.0" encoding="UTF-8"?>
<phpunit xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         bootstrap="tests/bootstrap.php"
         colors="true"
         failOnRisky="true"
         failOnWarning="true">

    <testsuites>
        <testsuite name="Unit">
            <directory>tests/Unit</directory>
        </testsuite>
        <testsuite name="Integration">
            <directory>tests/Integration</directory>
        </testsuite>
        <testsuite name="Functional">
            <directory>tests/Functional</directory>
        </testsuite>
    </testsuites>

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
</phpunit>
```

## Test Quality Standards

### Test Naming

```php
<?php
// ✅ Good - Descriptive test names
#[Test]
public function it_creates_user_when_data_is_valid(): void {}

#[Test]
public function it_throws_exception_when_email_is_invalid(): void {}

#[Test]
public function it_returns_null_when_user_not_found(): void {}

// ❌ Bad - Unclear test names
#[Test]
public function testUser(): void {}

#[Test]
public function test1(): void {}
```

### AAA Pattern

```php
<?php
#[Test]
public function it_can_be_activated_when_pending(): void
{
    // Arrange
    $user = User::create(
        UserId::generate(),
        Email::fromString('test@example.com'),
        'Test User',
    );

    // Act
    $user->activate();

    // Assert
    $this->assertSame(UserStatus::ACTIVE, $user->getStatus());
}
```

### Test Isolation

```php
<?php
// ✅ Good - Isolated tests
final class UserTest extends TestCase
{
    #[Test]
    public function test_first(): void
    {
        // Creates its own data
        $user = $this->createUser();
        // Test logic
    }

    #[Test]
    public function test_second(): void
    {
        // Creates its own data, independent of test_first
        $user = $this->createUser();
        // Test logic
    }

    private function createUser(): User
    {
        return User::create(
            UserId::generate(),
            Email::fromString('test@example.com'),
            'Test User',
        );
    }
}

// ❌ Bad - Tests depend on each other
final class UserTest extends TestCase
{
    private static User $user;

    #[Test]
    public function test_create(): void
    {
        self::$user = User::create(/*...*/);  // BAD: Shared state
    }

    #[Test]
    public function test_activate(): void
    {
        self::$user->activate();  // BAD: Depends on test_create
    }
}
```

## Test Types

### Unit Tests

```php
<?php
// Domain layer - Unit tests
namespace App\Tests\Unit\Domain\Entity;

use App\Domain\Entity\User;
use App\Domain\ValueObject\Email;
use App\Domain\ValueObject\UserId;
use PHPUnit\Framework\Attributes\Test;
use PHPUnit\Framework\TestCase;

final class UserTest extends TestCase
{
    #[Test]
    public function it_can_be_created_with_valid_data(): void
    {
        // Arrange
        $id = UserId::generate();
        $email = Email::fromString('test@example.com');
        $name = 'Test User';

        // Act
        $user = User::create($id, $email, $name);

        // Assert
        $this->assertTrue($user->getId()->equals($id));
        $this->assertTrue($user->getEmail()->equals($email));
        $this->assertSame($name, $user->getName());
    }

    #[Test]
    public function it_cannot_be_activated_twice(): void
    {
        // Arrange
        $user = $this->createUser();
        $user->activate();

        // Assert
        $this->expectException(InvalidUserStateException::class);

        // Act
        $user->activate();
    }
}
```

### Application Tests (With Mocks)

```php
<?php
namespace App\Tests\Unit\Application\UseCase;

use App\Application\UseCase\User\CreateUser\CreateUserCommand;
use App\Application\UseCase\User\CreateUser\CreateUserHandler;
use App\Domain\Repository\UserRepositoryInterface;
use PHPUnit\Framework\MockObject\MockObject;
use PHPUnit\Framework\TestCase;

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
            email: 'test@example.com',
            name: 'Test User',
        );

        $this->userRepository
            ->expects($this->once())
            ->method('findByEmail')
            ->willReturn(null);

        $this->userRepository
            ->expects($this->once())
            ->method('nextIdentity')
            ->willReturn(UserId::generate());

        $this->userRepository
            ->expects($this->once())
            ->method('save');

        // Act
        $result = $this->handler->handle($command);

        // Assert
        $this->assertInstanceOf(UserId::class, $result);
    }
}
```

### Integration Tests

```php
<?php
namespace App\Tests\Integration\Infrastructure\Persistence;

use App\Domain\Entity\User;
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
        $this->entityManager->beginTransaction();
    }

    protected function tearDown(): void
    {
        $this->entityManager->rollback();
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
    }
}
```

### Functional/API Tests

```php
<?php
namespace App\Tests\Functional\Api;

use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;

final class UserApiTest extends WebTestCase
{
    #[Test]
    public function it_creates_user_via_api(): void
    {
        // Arrange
        $client = static::createClient();

        // Act
        $client->request(
            'POST',
            '/api/v1/users',
            [],
            [],
            ['CONTENT_TYPE' => 'application/json'],
            json_encode([
                'email' => 'new@example.com',
                'name' => 'New User',
            ])
        );

        // Assert
        $this->assertResponseStatusCodeSame(201);
        $response = json_decode($client->getResponse()->getContent(), true);
        $this->assertArrayHasKey('id', $response);
    }

    #[Test]
    public function it_returns_validation_errors_for_invalid_data(): void
    {
        // Arrange
        $client = static::createClient();

        // Act
        $client->request(
            'POST',
            '/api/v1/users',
            [],
            [],
            ['CONTENT_TYPE' => 'application/json'],
            json_encode(['email' => 'invalid'])
        );

        // Assert
        $this->assertResponseStatusCodeSame(422);
    }
}
```

## Data Providers

```php
<?php
use PHPUnit\Framework\Attributes\DataProvider;

final class EmailTest extends TestCase
{
    #[Test]
    #[DataProvider('validEmailsProvider')]
    public function it_accepts_valid_emails(string $email): void
    {
        $emailVo = Email::fromString($email);
        $this->assertNotNull($emailVo);
    }

    public static function validEmailsProvider(): iterable
    {
        yield 'simple email' => ['test@example.com'];
        yield 'with subdomain' => ['test@mail.example.com'];
        yield 'with plus' => ['test+tag@example.com'];
        yield 'uppercase' => ['TEST@EXAMPLE.COM'];
    }

    #[Test]
    #[DataProvider('invalidEmailsProvider')]
    public function it_rejects_invalid_emails(string $email): void
    {
        $this->expectException(InvalidEmailException::class);
        Email::fromString($email);
    }

    public static function invalidEmailsProvider(): iterable
    {
        yield 'no at sign' => ['testexample.com'];
        yield 'no domain' => ['test@'];
        yield 'empty' => [''];
        yield 'spaces' => ['test @example.com'];
    }
}
```

## Test Checklist

### Coverage
- [ ] Domain coverage > 80%
- [ ] Application coverage > 75%
- [ ] Overall coverage > 70%
- [ ] No untested public methods

### Quality
- [ ] Tests follow AAA pattern
- [ ] Descriptive test names
- [ ] One assertion per test (preferred)
- [ ] Tests are isolated
- [ ] No test interdependencies

### Organization
- [ ] Proper directory structure
- [ ] Test files next to source files
- [ ] Fixtures/factories used
- [ ] Clear setup/teardown

### Types
- [ ] Unit tests for Domain
- [ ] Unit tests for Application (with mocks)
- [ ] Integration tests for Infrastructure
- [ ] Functional tests for APIs

## Running Tests

```bash
# Run all tests
vendor/bin/phpunit

# Run with coverage
vendor/bin/phpunit --coverage-html coverage

# Run specific suite
vendor/bin/phpunit --testsuite=Unit

# Run specific test
vendor/bin/phpunit --filter=it_creates_user

# Run Pest tests
vendor/bin/pest
vendor/bin/pest --coverage --min=80
```
