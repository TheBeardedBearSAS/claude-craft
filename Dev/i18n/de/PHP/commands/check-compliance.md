---
description: Standards Compliance Check
---

# Standards Compliance Check

Verify that the PHP project follows established coding standards and best practices.

## What This Command Does

1. **Standards Verification**
   - Check PSR-1/PSR-12 compliance
   - Verify naming conventions
   - Validate file organization
   - Check import order
   - Verify documentation standards

2. **Compliance Areas**
   - PHP 8.x best practices
   - Clean Architecture patterns
   - Testing standards
   - Git commit conventions
   - Security best practices

3. **Generated Report**
   - Non-compliant files
   - Severity levels
   - Remediation recommendations
   - Compliance score

## Coding Standards

### 1. Naming Conventions

```php
<?php
// ✅ Classes: PascalCase
class UserRepository {}
class OrderService {}

// ✅ Methods/Functions: camelCase
public function getUserById(int $id): ?User {}
public function calculateTotal(): Money {}

// ✅ Variables: camelCase
$userCount = 0;
$isActive = true;

// ✅ Constants: UPPER_SNAKE_CASE
public const MAX_ATTEMPTS = 3;
public const DEFAULT_LOCALE = 'en_US';

// ✅ Interfaces: PascalCase + Interface suffix
interface UserRepositoryInterface {}
interface PaymentGatewayInterface {}

// ✅ Enums: PascalCase
enum UserStatus: string {}
enum OrderState: string {}
```

### 2. File Organization

```
src/
├── Domain/
│   ├── Entity/
│   │   └── User.php
│   ├── ValueObject/
│   │   └── Email.php
│   ├── Repository/
│   │   └── UserRepositoryInterface.php
│   └── Exception/
│       └── UserNotFoundException.php
├── Application/
│   ├── UseCase/
│   │   └── User/
│   │       └── CreateUser/
│   │           ├── CreateUserCommand.php
│   │           └── CreateUserHandler.php
│   └── DTO/
│       └── UserDto.php
├── Infrastructure/
│   └── Persistence/
│       └── Doctrine/
│           └── DoctrineUserRepository.php
└── Presentation/
    └── Controller/
        └── UserController.php
```

### 3. Import Order

```php
<?php

declare(strict_types=1);

namespace App\Application\Service;

// 1. PHP built-in classes
use DateTimeImmutable;
use InvalidArgumentException;

// 2. Third-party packages
use Doctrine\ORM\EntityManagerInterface;
use Psr\Log\LoggerInterface;

// 3. Application classes (alphabetical)
use App\Domain\Entity\User;
use App\Domain\Repository\UserRepositoryInterface;
use App\Domain\ValueObject\Email;

final class UserService
{
    // Class implementation
}
```

### 4. Class Structure

```php
<?php

declare(strict_types=1);

namespace App\Domain\Entity;

/**
 * User entity representing a system user.
 */
final class User
{
    // 1. Constants
    public const STATUS_ACTIVE = 'active';
    public const STATUS_INACTIVE = 'inactive';

    // 2. Properties (via constructor promotion)
    public function __construct(
        private readonly UserId $id,
        private Email $email,
        private string $name,
        private UserStatus $status,
    ) {}

    // 3. Static factory methods
    public static function create(UserId $id, Email $email, string $name): self
    {
        return new self($id, $email, $name, UserStatus::PENDING);
    }

    // 4. Public methods
    public function activate(): void
    {
        $this->status = UserStatus::ACTIVE;
    }

    // 5. Getters
    public function getId(): UserId
    {
        return $this->id;
    }

    public function getEmail(): Email
    {
        return $this->email;
    }

    // 6. Private methods
    private function validateState(): void
    {
        // Validation logic
    }
}
```

## PHP Standards

### 1. Strict Type Safety

```php
<?php

declare(strict_types=1);  // ALWAYS at the top of every file

// ❌ Bad - Missing types
function process($data) {
    return $data;
}

// ✅ Good - Full type declarations
function process(array $data): ProcessResult
{
    return new ProcessResult($data);
}

// ✅ Good - Nullable types when appropriate
public function find(string $id): ?User
{
    return $this->repository->find($id);
}
```

### 2. Type Declarations

```php
<?php
// ✅ Good - Complete type declarations
final class OrderService
{
    public function __construct(
        private readonly OrderRepositoryInterface $repository,
        private readonly LoggerInterface $logger,
    ) {}

    /** @return Order[] */
    public function findByCustomer(CustomerId $customerId): array
    {
        return $this->repository->findByCustomer($customerId);
    }

    public function create(CreateOrderCommand $command): OrderId
    {
        // Implementation
    }
}
```

### 3. Readonly and Immutability

```php
<?php
// ✅ Good - Readonly class for Value Objects
readonly class Email
{
    public function __construct(
        public string $value,
    ) {}
}

// ✅ Good - Readonly properties
final class User
{
    public function __construct(
        private readonly UserId $id,
        private readonly DateTimeImmutable $createdAt,
    ) {}
}
```

## Clean Architecture Standards

### 1. Layer Separation

```php
<?php
// ❌ Bad - Domain depends on Infrastructure
namespace App\Domain\Entity;

use Doctrine\ORM\Mapping as ORM;  // BAD!
use App\Infrastructure\Mailer;     // BAD!

// ✅ Good - Domain has no external dependencies
namespace App\Domain\Entity;

use App\Domain\Event\UserCreatedEvent;
use App\Domain\ValueObject\Email;
use App\Domain\ValueObject\UserId;
```

### 2. Repository Pattern

```php
<?php
// ✅ Good - Interface in Domain
namespace App\Domain\Repository;

interface UserRepositoryInterface
{
    public function find(UserId $id): ?User;
    public function save(User $user): void;
}

// ✅ Good - Implementation in Infrastructure
namespace App\Infrastructure\Persistence\Doctrine;

final class DoctrineUserRepository implements UserRepositoryInterface
{
    // Implementation with Doctrine
}
```

### 3. Use Cases

```php
<?php
// ✅ Good - One use case per class
final readonly class CreateUserCommand
{
    public function __construct(
        public string $email,
        public string $name,
    ) {}
}

final class CreateUserHandler
{
    public function handle(CreateUserCommand $command): UserId
    {
        // Single responsibility: create a user
    }
}
```

## Testing Standards

### 1. Test File Naming

```
src/Domain/Entity/User.php
tests/Unit/Domain/Entity/UserTest.php    ✅
```

### 2. Test Structure

```php
<?php
// ✅ Good - AAA Pattern with clear naming
#[Test]
public function it_can_be_created_with_valid_data(): void
{
    // Arrange
    $id = UserId::generate();
    $email = Email::fromString('test@example.com');

    // Act
    $user = User::create($id, $email, 'Test User');

    // Assert
    $this->assertTrue($user->getId()->equals($id));
    $this->assertSame('Test User', $user->getName());
}
```

### 3. Test Coverage

```php
<?php
// Minimum coverage targets
// Domain: 90%
// Application: 85%
// Infrastructure: 70%
// Overall: 80%
```

## Git Standards

### 1. Commit Messages

```bash
# ✅ Good - Conventional Commits
feat(user): add user registration endpoint
fix(auth): resolve JWT token expiration issue
docs(readme): update installation instructions
test(order): add integration tests for order creation
refactor(payment): extract gateway interface

# Format: <type>(<scope>): <subject>
```

### 2. Branch Naming

```bash
# ✅ Good - Descriptive names
feature/user-authentication
fix/payment-calculation-error
refactor/clean-architecture-migration
```

## Documentation Standards

### 1. PHPDoc Comments

```php
<?php
/**
 * Creates a new user in the system.
 *
 * @param string $email The user's email address
 * @param string $name The user's display name
 *
 * @throws UserAlreadyExistsException When email is already registered
 * @throws InvalidEmailException When email format is invalid
 *
 * @return UserId The created user's unique identifier
 */
public function createUser(string $email, string $name): UserId
{
    // Implementation
}
```

### 2. Class Documentation

```php
<?php
/**
 * Service responsible for user lifecycle management.
 *
 * This service handles user creation, updates, and deletion
 * following the domain business rules.
 *
 * @see UserRepositoryInterface For data persistence
 * @see UserCreatedEvent For event dispatching
 */
final class UserService
{
    // Implementation
}
```

## Automated Compliance

### PHPStan Configuration

```neon
parameters:
    level: 9
    checkMissingIterableValueType: true
    checkGenericClassInNonGenericObjectType: true
```

### PHP-CS-Fixer Configuration

```php
<?php
return (new PhpCsFixer\Config())
    ->setRules([
        '@PSR12' => true,
        '@PHP84Migration' => true,
        'declare_strict_types' => true,
        'final_class' => true,
    ]);
```

## Compliance Checklist

- [ ] `declare(strict_types=1)` in all files
- [ ] PSR-12 formatting applied
- [ ] PSR-4 autoloading configured
- [ ] Naming conventions followed
- [ ] Files properly organized (Clean Architecture)
- [ ] Imports properly ordered
- [ ] All methods have return type declarations
- [ ] All parameters have type declarations
- [ ] Readonly properties used where appropriate
- [ ] No Domain dependencies on Infrastructure
- [ ] Tests follow AAA pattern
- [ ] Test coverage > 80%
- [ ] Commits follow Conventional Commits
- [ ] PHPDoc on public APIs
- [ ] PHPStan level 8+ passes
- [ ] PHP-CS-Fixer passes

## Tools

- PHPStan for static analysis
- PHP-CS-Fixer for formatting
- PHPUnit/Pest for testing
- PHPat for architecture testing
- Rector for automated refactoring

## Resources

- [PHP-FIG PSR Standards](https://www.php-fig.org/psr/)
- [PHP The Right Way](https://phptherightway.com/)
- [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
