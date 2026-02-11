# Laravel New Feature Checklist

## Planning Phase

### 1. Requirements Analysis

- [ ] **Feature requirements documented**
  - User stories defined
  - Acceptance criteria clear
  - Edge cases identified

- [ ] **Architecture decision**
  - Which layer handles the logic?
  - New models needed?
  - External services involved?

### 2. Database Design

- [ ] **Schema designed**
  - Tables and columns identified
  - Relationships mapped
  - Indexes planned

- [ ] **Migration strategy**
  - Can be run without downtime?
  - Backward compatible?

## Implementation Phase

### 3. Database Layer

- [ ] **Create migration**
  ```bash
  php artisan make:migration create_{table}_table
  ```
  - Foreign keys defined
  - Indexes added
  - Nullable fields specified

- [ ] **Create model**
  ```bash
  php artisan make:model {Model} -f
  ```
  - `$fillable` defined
  - `$casts` configured
  - Relationships added
  - Scopes created
  - Domain methods implemented

- [ ] **Create factory**
  - States for different scenarios
  - Relationships handled

### 4. Domain Layer

- [ ] **Create Enum (if needed)**
  ```bash
  php artisan make:enum {ModelName}Status
  ```
  - All states defined
  - Labels/descriptions added

- [ ] **Create Value Objects (if needed)**
  - Immutable properties
  - Validation in constructor
  - Cast implementation

- [ ] **Create Domain Events**
  ```bash
  php artisan make:event {Model}Created
  php artisan make:event {Model}Updated
  ```

- [ ] **Create Exceptions**
  - Domain-specific exceptions
  - Meaningful error messages

### 5. Application Layer

- [ ] **Create Action/Service**
  - Single responsibility
  - Transaction handling
  - Event dispatching

- [ ] **Create DTOs**
  - Input validation via attributes
  - Type-safe data transfer

### 6. Interface Layer

- [ ] **Create Form Requests**
  ```bash
  php artisan make:request Store{Model}Request
  php artisan make:request Update{Model}Request
  ```
  - All fields validated
  - Custom messages
  - Authorization rules

- [ ] **Create API Resource**
  ```bash
  php artisan make:resource {Model}Resource
  ```
  - Consistent structure
  - Relationships conditional
  - Dates in ISO8601

- [ ] **Create Controller**
  ```bash
  php artisan make:controller {Model}Controller --api --model={Model}
  ```
  - Thin controller pattern
  - Delegates to Actions
  - Uses Resources

- [ ] **Create Policy**
  ```bash
  php artisan make:policy {Model}Policy --model={Model}
  ```
  - All actions covered
  - Registered in AuthServiceProvider

- [ ] **Define Routes**
  - RESTful naming
  - Proper middleware
  - Rate limiting if needed

### 7. Event Listeners

- [ ] **Create listeners for side effects**
  ```bash
  php artisan make:listener Send{Model}Notification
  ```
  - Email notifications
  - Logging
  - Cache invalidation

### 8. Jobs (if async processing needed)

- [ ] **Create Job**
  ```bash
  php artisan make:job Process{Model}
  ```
  - Implements `ShouldQueue`
  - Retry logic defined
  - Failed job handling

## Testing Phase

### 9. Tests

- [ ] **Feature tests**
  ```bash
  php artisan make:test {Model}ControllerTest
  ```
  - All endpoints covered
  - Authentication tested
  - Authorization tested
  - Validation tested
  - Edge cases covered

- [ ] **Unit tests**
  ```bash
  php artisan make:test {Model}Test --unit
  ```
  - Model methods tested
  - Business logic tested
  - Events tested

- [ ] **Coverage check**
  ```bash
  php artisan test --coverage --min=80
  ```

### 10. Integration

- [ ] **Database integration**
  ```bash
  php artisan migrate:fresh --seed
  ```

- [ ] **API integration**
  - Test with actual HTTP requests
  - Verify response formats

## Quality Phase

### 11. Code Quality

- [ ] **Run Pint**
  ```bash
  ./vendor/bin/pint
  ```

- [ ] **Run PHPStan**
  ```bash
  ./vendor/bin/phpstan analyse
  ```

- [ ] **Run all tests**
  ```bash
  php artisan test
  ```

### 12. Documentation

- [ ] **PHPDoc comments**
  - Public methods documented
  - Complex logic explained

- [ ] **API documentation updated**
  - New endpoints documented
  - Request/response examples

## Review Phase

### 13. Code Review Checklist

- [ ] **Naming conventions followed**
- [ ] **SOLID principles applied**
- [ ] **No code duplication**
- [ ] **No hardcoded values**
- [ ] **Error handling complete**
- [ ] **Logging appropriate**

### 14. Security Review

- [ ] **Authorization complete**
- [ ] **Input validation thorough**
- [ ] **No sensitive data exposed**
- [ ] **SQL injection prevented**
- [ ] **XSS prevented**

## Deployment Phase

### 15. Deployment Checklist

- [ ] **Migration tested in staging**
- [ ] **No breaking changes for existing clients**
- [ ] **Environment variables added to production**
- [ ] **Cache cleared after deployment**
  ```bash
  php artisan optimize:clear
  php artisan optimize
  ```

## File Structure Reference

After implementing a new feature, you should have:

```
app/
├── Domain/{Module}/
│   ├── Models/{Model}.php
│   ├── Events/{Model}Created.php
│   ├── Exceptions/{Model}Exception.php
│   └── {Model}Status.php
│
├── Application/{Module}/
│   ├── Actions/Create{Model}Action.php
│   └── DTOs/Create{Model}Data.php
│
├── Http/
│   ├── Controllers/{Model}Controller.php
│   ├── Requests/Store{Model}Request.php
│   └── Resources/{Model}Resource.php
│
└── Policies/{Model}Policy.php

database/
├── migrations/xxxx_create_{models}_table.php
└── factories/{Model}Factory.php

tests/
├── Feature/{Model}ControllerTest.php
└── Unit/{Model}Test.php
```
