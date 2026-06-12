# New Feature Development Checklist - PHP

## Before Starting

- [ ] Feature has been discussed and validated with the team
- [ ] Technical specifications are clear
- [ ] User stories are written and accepted
- [ ] API contracts are defined (if applicable)
- [ ] Database schema changes identified (if applicable)

## Development

### Architecture

- [ ] Feature follows Clean Architecture layers
- [ ] Domain entities designed with rich behavior
- [ ] Value Objects identified and created
- [ ] Repository interfaces defined in Domain layer
- [ ] Use cases (Commands/Queries) structured properly
- [ ] DTOs defined for API responses

### Domain Layer

- [ ] Entities have factory methods (no public setters)
- [ ] Value Objects are readonly and self-validating
- [ ] Domain events defined for state changes
- [ ] Business rules enforced within entities
- [ ] No infrastructure dependencies in Domain

### Application Layer

- [ ] Commands are readonly data objects
- [ ] Handlers have single responsibility
- [ ] Validators created for commands
- [ ] DTOs for data transfer (not entities)
- [ ] Exception handling implemented

### Infrastructure Layer

- [ ] Repository implementations created
- [ ] Doctrine mappings configured
- [ ] External service adapters implemented
- [ ] Database migrations written

### Code Quality

- [ ] `declare(strict_types=1)` in all files
- [ ] PSR-12 coding standards followed
- [ ] PHPStan level 10 passes
- [ ] PHP-CS-Fixer rules applied
- [ ] No suppressed warnings without justification

### Type Safety

- [ ] All parameters have type declarations
- [ ] All return types declared
- [ ] Nullable types used appropriately
- [ ] Generic PHPDoc for arrays and collections
- [ ] No `mixed` type without justification

### Tests

- [ ] Unit tests for domain entities
- [ ] Unit tests for value objects
- [ ] Unit tests for command handlers (with mocks)
- [ ] Integration tests for repositories
- [ ] Functional tests for API endpoints
- [ ] Test coverage ≥ 80%
- [ ] Edge cases and error paths tested

### Security

- [ ] Input validation at API boundary
- [ ] Authorization checks implemented
- [ ] No SQL injection vulnerabilities
- [ ] Sensitive data encrypted/hashed
- [ ] CSRF protection (if applicable)
- [ ] No secrets in code

### Performance

- [ ] Database queries optimized (no N+1)
- [ ] Proper indexes on frequently queried columns
- [ ] Pagination for list endpoints
- [ ] Caching strategy defined (if needed)
- [ ] Heavy computations deferred (queues)

### Documentation

- [ ] PHPDoc on public methods
- [ ] @throws annotations for exceptions
- [ ] @param/@return types in PHPDoc
- [ ] Complex logic explained in comments
- [ ] API documentation updated (OpenAPI)

## Before Committing

- [ ] All tests pass (`vendor/bin/phpunit`)
- [ ] PHPStan passes (`vendor/bin/phpstan analyse`)
- [ ] Code formatted (`vendor/bin/php-cs-fixer fix`)
- [ ] No debug code left (var_dump, dd, etc.)
- [ ] Migrations tested locally
- [ ] Changes tested with real requests
- [ ] Commit message follows conventions

## Code Review

- [ ] PR has clear description
- [ ] Related ticket is referenced
- [ ] Architecture decisions explained
- [ ] Breaking changes documented
- [ ] Reviewers assigned
- [ ] CI pipeline passes
- [ ] At least one approval received

## After Merge

- [ ] Feature deployed to staging
- [ ] Migrations run successfully
- [ ] Feature tested in staging environment
- [ ] Performance verified
- [ ] Monitoring/logging checked
- [ ] Feature deployed to production
- [ ] Production health verified
- [ ] Documentation updated

## Notes

- This checklist is a guide, adapt it to your project
- Some items may not be applicable to all features
- Use your judgment to determine what's important
- When in doubt, ask for a code review
