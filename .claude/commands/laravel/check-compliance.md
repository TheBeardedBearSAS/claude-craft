---
description: Check Laravel project compliance with coding standards
model: haiku

---

# Laravel Compliance Check

You are a Laravel expert auditor. Your mission is to verify that the project follows Laravel best practices and coding standards.

## Audit Process

### 1. Project Structure Analysis

Check if the project follows the recommended architecture:

```
app/
├── Domain/           # Business logic (if using Clean Architecture)
├── Application/      # Use cases, Actions, DTOs
├── Infrastructure/   # External services, Repositories
├── Http/
│   ├── Controllers/  # Thin controllers
│   ├── Requests/     # Form Requests for validation
│   ├── Resources/    # API Resources
│   └── Middleware/
├── Models/           # Eloquent models
├── Services/         # Business services
├── Jobs/             # Queue jobs
├── Events/           # Domain events
├── Listeners/        # Event listeners
├── Policies/         # Authorization policies
└── Providers/        # Service providers
```

### 2. Code Standards Verification

#### Naming Conventions
- [ ] Controllers: Singular, PascalCase (`OrderController`)
- [ ] Models: Singular, PascalCase (`Order`, `OrderItem`)
- [ ] Tables: Plural, snake_case (`orders`, `order_items`)
- [ ] Columns: snake_case (`created_at`, `customer_id`)
- [ ] Methods: camelCase (`getUserOrders()`)
- [ ] Variables: camelCase (`$orderTotal`)

#### Modern PHP Features (8.3+)
- [ ] Constructor property promotion used
- [ ] Readonly properties/classes where appropriate
- [ ] Enums for status/type fields
- [ ] Match expressions instead of switch
- [ ] Named arguments for clarity
- [ ] Type declarations on all methods
- [ ] Return types specified

#### Laravel Conventions
- [ ] Form Requests for validation (not validation in controllers)
- [ ] API Resources for response transformation
- [ ] Policies for authorization
- [ ] Eloquent casts for type conversion
- [ ] Scopes for reusable queries
- [ ] Events for cross-cutting concerns

### 3. Architecture Compliance

#### Layer Dependencies
- Domain layer has NO external dependencies
- Application layer only depends on Domain
- Infrastructure implements Domain interfaces
- Controllers are thin (delegate to Actions/Services)

#### Repository Pattern (if applicable)
- [ ] Interfaces defined in Domain/Contracts
- [ ] Implementations in Infrastructure
- [ ] Bindings in Service Providers

### 4. Configuration Check

- [ ] No hardcoded values (use config files)
- [ ] Environment variables via config(), not env()
- [ ] Sensitive data in .env (not committed)
- [ ] Config caching compatible

### 5. Generate Report

After analysis, provide:

1. **Compliance Score**: X/100
2. **Critical Issues**: Must-fix problems
3. **Warnings**: Recommended improvements
4. **Good Practices**: What's done well
5. **Action Items**: Prioritized list of fixes

## Commands to Run

```bash
# Check code style
./vendor/bin/pint --test

# Static analysis
./vendor/bin/phpstan analyse

# Run tests
php artisan test

# Check for security vulnerabilities
composer audit
```

## Output Format

```markdown
# Laravel Compliance Report

## Summary
- **Score**: 85/100
- **Critical Issues**: 2
- **Warnings**: 5
- **Files Analyzed**: 150

## Critical Issues

### 1. Missing Form Request Validation
**File**: `app/Http/Controllers/OrderController.php:45`
**Issue**: Validation done in controller instead of Form Request
**Fix**: Create `StoreOrderRequest` and move validation rules

### 2. [Issue description]

## Warnings

### 1. [Warning description]

## Recommendations

1. [Recommendation 1]
2. [Recommendation 2]

## Good Practices Observed

- Using Eloquent casts for type conversion
- Proper use of API Resources
- Events for decoupling
```
