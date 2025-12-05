# Checklist: New Feature

## Phase 1: Analysis (MANDATORY)

### Understand the Need

- [ ] **Objective** clearly defined
  - What functionality exactly?
  - What problem does it solve?
  - What are acceptance criteria?

- [ ] **Business context** understood
  - What business impact?
  - Which users affected?
  - Any specific business constraints?

- [ ] **Technical constraints** identified
  - Required performance?
  - Scalability?
  - Security?
  - Compatibility?

### Explore Existing Code

- [ ] **Similar patterns** identified
  ```bash
  rg "class.*Service" --type py
  rg "class.*Repository" --type py
  ```

- [ ] **Architecture** analyzed
  ```bash
  tree src/ -L 3 -I "__pycache__|*.pyc"
  ```

- [ ] **Project standards** understood
  - Naming conventions
  - Error handling patterns
  - Test structure

### Identify Impacts

- [ ] **Impact matrix** created
  - Which modules affected?
  - Which DB migrations necessary?
  - Which API changes?

- [ ] **Dependencies** identified
  - Modules depending on code to modify
  - Modules new code depends on

### Design the Solution

- [ ] **Architecture** defined
  - Which layer (Domain/Application/Infrastructure)?
  - Which classes/functions to create?
  - Which interfaces necessary?

- [ ] **Data flow** documented
  - How does data flow?
  - Which transformations?

- [ ] **Technical choices** justified
  - Why this approach?
  - Which alternatives considered?

### Plan Implementation

- [ ] **Tasks** broken down into atomic steps
- [ ] **Order** of implementation defined
- [ ] **Estimation** performed with buffer (20%)

### Identify Risks

- [ ] **Risks** identified and evaluated
- [ ] **Mitigations** planned
- [ ] **Fallbacks** defined if possible

### Define Tests

- [ ] **Test strategy** defined
  - Unit tests
  - Integration tests
  - E2E tests
- [ ] **Target coverage** defined

See `rules/01-workflow-analysis.md` for details.

## Phase 2: Implementation

### Domain Layer (If Applicable)

- [ ] **Entities** created
  - [ ] Dataclass or Python class
  - [ ] Validation in `__post_init__`
  - [ ] Business methods
  - [ ] Equality based on ID
  - [ ] Complete docstrings

- [ ] **Value Objects** created
  - [ ] `frozen=True` (immutable)
  - [ ] Strict validation
  - [ ] Value-based equality

- [ ] **Domain Services** created (if necessary)
  - [ ] Multi-entity business logic
  - [ ] Injected dependencies
  - [ ] No infrastructure dependency

- [ ] **Repository Interfaces** created
  - [ ] Protocol in domain/repositories/
  - [ ] Documented methods

- [ ] **Domain Exceptions** created
  - [ ] Inherit from DomainException
  - [ ] Clear messages

### Application Layer

- [ ] **DTOs** created
  - [ ] Pydantic BaseModel
  - [ ] from_entity() and to_dict() if necessary
  - [ ] Pydantic validation

- [ ] **Commands** created
  - [ ] Dataclass or Pydantic
  - [ ] All use case inputs

- [ ] **Use Cases** created
  - [ ] One class per use case
  - [ ] Dependencies injected via __init__
  - [ ] execute() method
  - [ ] Input validation
  - [ ] Error handling
  - [ ] Returns DTO

### Infrastructure Layer

- [ ] **Database Models** created (if new entity)
  - [ ] SQLAlchemy model
  - [ ] Appropriate columns
  - [ ] Indexes if necessary
  - [ ] Relations if necessary

- [ ] **Migrations** created
  ```bash
  make db-migrate msg="Migration description"
  ```
  - [ ] Migration tested (upgrade + downgrade)

- [ ] **Repositories** implemented
  - [ ] Implements domain interface
  - [ ] Entity <-> model conversion
  - [ ] Error handling
  - [ ] Rollback on error

- [ ] **API Routes** created
  - [ ] FastAPI router
  - [ ] Pydantic schemas
  - [ ] Dependency injection
  - [ ] Appropriate status codes
  - [ ] Error handling

- [ ] **External Services** integrated (if necessary)
  - [ ] Implements domain interface
  - [ ] Retry logic
  - [ ] Timeout handling
  - [ ] Error handling

### Configuration

- [ ] **Dependency Injection** configured
  - [ ] Container updated
  - [ ] Factories created
  - [ ] FastAPI dependencies created

- [ ] **Environment variables** added
  - [ ] Added to `.env.example`
  - [ ] Documented in README
  - [ ] Validation with Pydantic Settings

- [ ] **Configuration** updated
  - [ ] Config class updated
  - [ ] Default values defined

## Phase 3: Tests

### Unit Tests

- [ ] **Domain Layer** tested
  - [ ] Tests for each entity
  - [ ] Tests for each value object
  - [ ] Tests for each service
  - [ ] Coverage > 95%

- [ ] **Application Layer** tested
  - [ ] Tests for each use case
  - [ ] Mocks for dependencies
  - [ ] Nominal cases + edge cases
  - [ ] Coverage > 90%

- [ ] **All unit tests** pass
  ```bash
  make test-unit
  ```

### Integration Tests

- [ ] **Repository** tested
  - [ ] CRUD operations
  - [ ] Search methods
  - [ ] With real DB (testcontainers)

- [ ] **API Routes** tested
  - [ ] Nominal cases
  - [ ] Errors (400, 404, 409, 500)
  - [ ] With FastAPI TestClient

- [ ] **All integration tests** pass
  ```bash
  make test-integration
  ```

### E2E Tests

- [ ] **Complete flows** tested
  - [ ] Happy path
  - [ ] Critical error cases

- [ ] **All E2E tests** pass
  ```bash
  make test-e2e
  ```

### Coverage

- [ ] **Overall coverage** > 80%
  ```bash
  make test-cov
  ```
- [ ] **Domain coverage** > 95%
- [ ] **Application coverage** > 90%

## Phase 4: Quality

### Code Quality

- [ ] **Linting** passes
  ```bash
  make lint
  ```

- [ ] **Formatting** correct
  ```bash
  make format-check
  ```

- [ ] **Type checking** passes
  ```bash
  make type-check
  ```

- [ ] **Security check** passes
  ```bash
  make security-check
  ```

### Personal Code Review

- [ ] **SOLID** respected
  - [ ] Single Responsibility
  - [ ] Open/Closed
  - [ ] Liskov Substitution
  - [ ] Interface Segregation
  - [ ] Dependency Inversion

- [ ] **KISS, DRY, YAGNI** respected
  - [ ] Simple solution
  - [ ] No duplication
  - [ ] No unnecessary code

- [ ] **Clean Architecture** respected
  - [ ] Dependencies inward
  - [ ] Independent domain
  - [ ] Abstractions (Protocols)

- [ ] **Naming** clear and consistent
- [ ] **Docstrings** complete
- [ ] **Comments** for complex logic only
- [ ] **Dead code** removed

## Phase 5: Documentation

- [ ] **API Documentation** up to date
  - [ ] New endpoints documented
  - [ ] Examples provided
  - [ ] Clear Request/Response schemas

- [ ] **README** updated if necessary
  - [ ] New features documented
  - [ ] Setup instructions up to date

- [ ] **ADR** created if important architectural decision
  ```markdown
  docs/adr/NNNN-description.md
  ```

- [ ] **Changelog** updated
  ```markdown
  ## [Unreleased]
  ### Added
  - Feature description
  ```

## Phase 6: Git & PR

### Commits

- [ ] **Commits** follow Conventional Commits
  ```
  feat(scope): add user notification system

  - Implement email notifications
  - Add SMS notification support
  - Create notification repository

  Closes #123
  ```

- [ ] **Atomic commits**
  - No giant commits
  - One commit = one logical change

### Pull Request

- [ ] **Branch** named correctly
  ```
  feature/user-notifications
  ```

- [ ] **PR description** complete
  ```markdown
  ## Summary
  - What
  - Why
  - How

  ## Changes
  - Change 1
  - Change 2

  ## Testing
  - How tested
  - Screenshots if UI

  ## Checklist
  - [x] Tests pass
  - [x] Docs updated
  ```

- [ ] **Tests** pass on CI
- [ ] **No conflicts** with main
- [ ] **Self-review** performed

## Phase 7: Deployment

### Pre-Deployment

- [ ] **DB Migration** ready
  - [ ] Tested locally
  - [ ] Tested in staging
  - [ ] Rollback plan defined

- [ ] **Environment variables** documented
  - [ ] DevOps team informed
  - [ ] Production values provided

- [ ] **Feature flags** configured (if applicable)
  - [ ] Feature disabled by default
  - [ ] Rollout plan defined

### Post-Deployment

- [ ] **Monitoring** in place
  - [ ] Logs verified
  - [ ] Metrics verified
  - [ ] Alerts configured

- [ ] **Smoke tests** performed
  - [ ] Feature tested in prod
  - [ ] No visible errors

- [ ] **Rollback plan** ready if problem

## Quick Checklist

### Minimum Vital

- [ ] Complete analysis performed
- [ ] Clean architecture (Clean + SOLID)
- [ ] Tests written and passing (> 80% coverage)
- [ ] `make quality` passes
- [ ] Documentation up to date
- [ ] Complete PR description

### Before Merge

- [ ] Approved review
- [ ] CI passes
- [ ] No conflicts
- [ ] Squash commits if necessary

### Red Flags

If any of these is true, **DO NOT MERGE**:

- ❌ Analysis not done
- ❌ Missing tests
- ❌ Coverage < 80%
- ❌ Linting/Type errors
- ❌ Hardcoded secrets
- ❌ Undocumented breaking changes
- ❌ Untested DB migration
