# Feature Development Guide

This guide covers the complete workflow for developing new features using Claude-Craft, from initial analysis to final review.

---

## Table of Contents

1. [TDD Workflow Overview](#tdd-workflow-overview)
2. [Phase 1: Analysis](#phase-1-analysis)
3. [Phase 2: Design](#phase-2-design)
4. [Phase 3: Test Writing](#phase-3-test-writing)
5. [Phase 4: Implementation](#phase-4-implementation)
6. [Phase 5: Refactoring](#phase-5-refactoring)
7. [Phase 6: Review](#phase-6-review)
8. [Complete Example](#complete-example)
9. [Available Resources](#available-resources)

---

## TDD Workflow Overview

Claude-Craft enforces a Test-Driven Development workflow:

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  1. Analyze │ --> │  2. Design  │ --> │  3. Tests   │
└─────────────┘     └─────────────┘     └─────────────┘
                                              │
                                              v
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  6. Review  │ <-- │ 5. Refactor │ <-- │ 4. Implement│
└─────────────┘     └─────────────┘     └─────────────┘
```

### Why TDD?

- **Confidence**: Tests prove your code works
- **Documentation**: Tests describe expected behavior
- **Design**: Writing tests first leads to better APIs
- **Regression**: Tests catch future bugs

---

## Phase 1: Analysis

Before writing any code, understand what needs to be built.

### Set Effort Level

For analysis phases that require deep reasoning, set high effort:

```bash
/effort high
```

Use `/effort low` for simple lookups and `/effort medium` for standard implementation work.

> **Current models (June 2026):** `low` → Haiku 4.5, `medium` → **Sonnet 5** (`claude-sonnet-5`, released 2026-06-30 — agentic, intro $2/$10 per M tokens until 2026-08-31), `high`/`xhigh` → Opus 4.8. The `model:` alias auto-resolves to the latest, so `CLAUDE_CODE_SUBAGENT_MODEL=sonnet` now maps to Sonnet 5. Fable 5 is suspended — do not use it. Full pricing/routing grid: [FAQ](../../FAQ.md#grille-de-prix--routage-modèle-par-tâche-juin-2026).

### Using the Analysis Command

```bash
/common:analyze-feature "User authentication with JWT tokens and role-based access"
```

This command will:
1. Break down the feature into components
2. Identify technical requirements
3. List potential edge cases
4. Suggest implementation approach

### Using Research Agent

```markdown
@research-assistant Research best practices for JWT authentication in Symfony 7
```

The research agent will:
- Search documentation and best practices
- Summarize findings
- Provide code examples
- Highlight security considerations

### Analysis Checklist

- [ ] User story clearly defined
- [ ] Acceptance criteria documented
- [ ] Edge cases identified
- [ ] Technical approach chosen
- [ ] Dependencies identified
- [ ] Security implications reviewed

---

## Phase 2: Design

Design the architecture before implementation.

### Database Design

```markdown
@database-architect Design the schema for User entity with roles and permissions

Requirements:
- User can have multiple roles
- Roles have permissions
- Support for soft delete
- Audit trail for changes
```

The database architect will:
- Design normalized schema
- Suggest indexes
- Consider relationships
- Plan migrations

### API Design

```markdown
@api-designer Design the REST API for user management

Endpoints needed:
- CRUD operations for users
- Role assignment
- Authentication (login/logout)
- Password reset flow
```

The API designer will:
- Define endpoints and methods
- Specify request/response formats
- Document authentication requirements
- Plan error responses

### Architecture Decision

```bash
/common:architecture-decision "How to implement role-based access control"
```

Use this command for important architectural choices. It creates an Architecture Decision Record (ADR) documenting:
- Context and problem
- Considered options
- Chosen solution
- Consequences

### Design Checklist

- [ ] Database schema designed
- [ ] API endpoints defined
- [ ] Architecture decisions documented
- [ ] Security model defined
- [ ] Error handling strategy planned

---

## Phase 3: Test Writing

Write tests BEFORE implementation. This is the "TDD" in TDD.

### Using TDD Coach

```markdown
@tdd-coach Help me write tests for the UserService authentication method

The method should:
- Accept email and password
- Return JWT token on success
- Throw exception on invalid credentials
- Lock account after 5 failed attempts
```

The TDD coach will:
- Suggest test cases
- Write test code examples
- Explain assertions
- Identify edge cases

### Test Categories

#### Unit Tests

Test individual components in isolation:

```php
// tests/Unit/Domain/User/UserTest.php
public function test_user_can_change_password(): void
{
    $user = User::create(
        email: 'test@example.com',
        password: 'old-password'
    );

    $user->changePassword('new-password');

    $this->assertTrue($user->verifyPassword('new-password'));
    $this->assertFalse($user->verifyPassword('old-password'));
}
```

#### Integration Tests

Test component interactions:

```php
// tests/Integration/UserServiceTest.php
public function test_user_service_creates_user_in_database(): void
{
    $service = $this->container->get(UserService::class);

    $user = $service->createUser(
        email: 'test@example.com',
        password: 'secure-password'
    );

    $this->assertNotNull($user->getId());
    $this->assertDatabaseHas('users', ['email' => 'test@example.com']);
}
```

#### BDD/Functional Tests

Test business scenarios:

```gherkin
# features/authentication.feature
Feature: User Authentication
  As a user
  I want to log in with my credentials
  So that I can access protected resources

  Scenario: Successful login
    Given I have a registered user with email "user@example.com"
    When I submit valid credentials
    Then I should receive a JWT token
    And the token should be valid for 1 hour
```

### Technology-Specific Test Commands

```bash
# Symfony
/symfony:check-testing

# Flutter
/flutter:check-testing

# Python
/python:check-testing

# React
/react:check-testing
```

### Test Writing Checklist

- [ ] Unit tests for domain logic
- [ ] Integration tests for services
- [ ] API tests for endpoints
- [ ] Edge cases covered
- [ ] Error scenarios tested
- [ ] All tests failing (not yet implemented)

---

## Phase 4: Implementation

Now implement the code to make tests pass.

### Code Generation Commands

#### Symfony

```bash
# Generate CRUD with tests
/symfony:generate-crud User

# Generate API endpoint
/symfony:api-endpoint POST /api/users CreateUserRequest

# Generate command
/symfony:generate-command SendWelcomeEmailCommand
```

#### Flutter

```bash
# Generate BLoC
/flutter:generate-bloc Authentication

# Generate screen
/flutter:generate-screen LoginScreen

# Generate widget
/flutter:generate-widget UserAvatar
```

#### Python

```bash
# Generate FastAPI endpoint
/python:generate-endpoint POST /users CreateUser

# Generate service
/python:generate-service UserService

# Generate model
/python:generate-model User
```

#### React

```bash
# Generate component
/react:generate-component UserProfile

# Generate hook
/react:generate-hook useAuth

# Generate context
/react:generate-context AuthContext
```

### Using Templates

Templates provide ready-to-use code patterns. Access them with:

```markdown
Show me the service template for Symfony
```

Available templates by technology:

| Symfony | Flutter | Python | React |
|---------|---------|--------|-------|
| service.md | bloc.md | service.md | component.md |
| value-object.md | widget.md | repository.md | hook.md |
| aggregate-root.md | screen.md | endpoint.md | context.md |
| domain-event.md | state.md | model.md | reducer.md |
| repository.md | cubit.md | schema.md | - |

### Implementation Best Practices

1. **One test at a time**: Make one test pass before moving to the next
2. **Minimal code**: Write just enough code to pass the test
3. **No premature optimization**: Focus on correctness first
4. **Follow existing patterns**: Use templates and conventions

### Implementation Checklist

- [ ] All unit tests passing
- [ ] All integration tests passing
- [ ] All API tests passing
- [ ] No hardcoded values
- [ ] Error handling implemented
- [ ] Logging added

---

## Phase 5: Refactoring

With tests passing, improve the code quality.

### Refactoring Commands

```bash
# Check code quality
/symfony:check-code-quality
/flutter:check-code-quality
/python:check-code-quality
/react:check-code-quality

# Check architecture compliance
/symfony:check-architecture
/flutter:check-architecture
```

### Using Refactoring Specialist

```markdown
@refactoring-specialist Review this service class for potential improvements

[paste code here]
```

The refactoring specialist will:
- Identify code smells
- Suggest improvements
- Show refactored examples
- Explain trade-offs

### Common Refactoring Patterns

1. **Extract Method**: Break long methods into smaller ones
2. **Extract Class**: Split large classes
3. **Introduce Value Object**: Replace primitives with domain types
4. **Replace Conditional with Polymorphism**: Use strategy pattern
5. **Move Method**: Put methods where they belong

### Refactoring Checklist

- [ ] No code duplication
- [ ] Methods under 20 lines
- [ ] Classes under 200 lines
- [ ] Clear naming
- [ ] Consistent style
- [ ] All tests still passing

---

## Phase 6: Review

Final quality check before completion.

### Compliance Audit

```bash
# Full compliance check (returns score /100)
/symfony:check-compliance
/flutter:check-compliance
/python:check-compliance
/react:check-compliance
```

This comprehensive audit checks:
- Architecture compliance
- Code quality
- Test coverage
- Security issues
- Documentation

### Code Review with Agents

```markdown
@symfony-reviewer Review my complete User authentication implementation

Files changed:
- src/Domain/User/User.php
- src/Application/Service/AuthenticationService.php
- src/Infrastructure/Security/JwtTokenGenerator.php
- tests/Unit/Domain/User/UserTest.php
- tests/Integration/AuthenticationServiceTest.php
```

The reviewer will:
- Check architecture compliance
- Identify potential issues
- Suggest improvements
- Verify best practices

### Security Audit

```bash
/common:security-audit
```

Or use the security-focused agent:

```markdown
@devops-engineer Review security of the authentication system

Concerns:
- JWT token security
- Password storage
- Rate limiting
- CORS configuration
```

### Feature Checklist

Use the built-in checklist:

```bash
cat .claude/checklists/feature-checklist.md
```

Key items:
- [ ] User story requirements met
- [ ] All acceptance criteria verified
- [ ] Tests written and passing (80%+ coverage)
- [ ] Code reviewed
- [ ] Security audit passed
- [ ] Documentation updated
- [ ] No critical issues in static analysis
- [ ] Performance acceptable
- [ ] Ready for code review

---

## Complete Example

Let's walk through a complete feature: Adding user registration.

### Step 1: Analyze

```markdown
/common:analyze-feature "User registration with email verification"

Expected:
- User submits email and password
- System sends verification email
- User clicks link to verify
- Account becomes active
```

### Step 2: Design Database

```markdown
@database-architect Design schema for User with email verification

Fields needed:
- id, email, password_hash
- email_verified_at (nullable timestamp)
- verification_token
- created_at, updated_at
```

### Step 3: Design API

```markdown
@api-designer Design registration API endpoints

POST /api/register - Create account
POST /api/verify-email - Verify email with token
POST /api/resend-verification - Resend verification email
```

### Step 4: Write Tests

```markdown
@tdd-coach Help me write tests for UserRegistrationService

Test cases:
1. Successful registration creates user
2. Duplicate email returns error
3. Weak password returns error
4. Verification email is sent
5. Verification token activates account
6. Expired token returns error
```

### Step 5: Generate Code

```bash
/symfony:generate-crud User --with-api
/symfony:generate-command SendVerificationEmailCommand
```

### Step 6: Implement

Make tests pass one by one:

```php
// Make test 1 pass
public function register(string $email, string $password): User
{
    $user = User::create($email, $password);
    $this->repository->save($user);
    return $user;
}

// Make test 2 pass
public function register(string $email, string $password): User
{
    if ($this->repository->findByEmail($email)) {
        throw new DuplicateEmailException($email);
    }
    // ...
}

// Continue for each test...
```

### Step 7: Refactor

```bash
/symfony:check-code-quality
```

Fix any issues identified.

### Step 8: Review

```markdown
@symfony-reviewer Review my user registration implementation

Complete implementation including:
- Domain: User entity, ValueObjects
- Application: RegistrationService
- Infrastructure: DoctrineUserRepository
- API: RegisterController
- Tests: Unit, Integration, API
```

### Step 9: Final Check

```bash
/symfony:check-compliance
```

Target: Score 90+/100

---

## Available Resources

### Agents Summary

| Agent | Use For |
|-------|---------|
| `@api-designer` | API endpoint design |
| `@database-architect` | Database schema design |
| `@tdd-coach` | Test writing guidance |
| `@refactoring-specialist` | Code improvement |
| `@{tech}-reviewer` | Code review |
| `@devops-engineer` | Infrastructure review |
| `@research-assistant` | Best practices research |

### Commands Summary

| Phase | Commands |
|-------|----------|
| Analysis | `/common:analyze-feature` |
| Design | `/common:architecture-decision` |
| Testing | `/{tech}:check-testing` |
| Generation | `/{tech}:generate-*` |
| Quality | `/{tech}:check-code-quality` |
| Review | `/{tech}:check-compliance` |
| Security | `/common:security-audit` |

### Templates Location

```bash
ls .claude/templates/
```

### Checklists Location

```bash
ls .claude/checklists/
```

---

## Tips for Success

1. **Don't skip tests**: They're your safety net
2. **Use agents**: They provide expert guidance
3. **Run compliance checks often**: Catch issues early
4. **Follow the workflow**: Each phase has a purpose
5. **Document decisions**: Use ADRs for important choices
6. **Manage context**: Use `/context` to check optimization suggestions, `/clear` between phases
7. **Adjust effort**: Use `/effort high` for analysis/design, `/effort low` for code generation

---

[&larr; Project Creation](02-project-creation.md) | [Bug Fixing &rarr;](04-bug-fixing.md)
