# C#/.NET New Feature Checklist

## Planning Phase

- [ ] **Requirements understood**
  - User stories reviewed
  - Acceptance criteria defined
  - Edge cases identified

- [ ] **Architecture impact assessed**
  - New entities/aggregates needed?
  - Existing entities modified?
  - New external services integrated?

- [ ] **API contract defined**
  - Endpoints documented
  - Request/Response models designed
  - Error responses planned

## Domain Layer

- [ ] **Entities created/updated**
  - Private setters
  - Factory methods for creation
  - Rich domain model (behavior in entities)
  - Domain events for side effects

- [ ] **Value Objects created**
  - Immutable
  - Equality properly implemented
  - Validation in creation

- [ ] **Repository interfaces defined**
  - In Domain/Interfaces
  - Methods return domain objects

- [ ] **Domain events defined**
  - For significant state changes
  - Named in past tense (OrderCreatedEvent)

## Application Layer

- [ ] **Commands created**
  - One command per write operation
  - Command handler implemented
  - Validator implemented (FluentValidation)

- [ ] **Queries created**
  - One query per read operation
  - Query handler implemented
  - Uses AsNoTracking()
  - Projects to DTOs

- [ ] **DTOs defined**
  - Records for immutability
  - AutoMapper profile created

- [ ] **Pipeline behaviors**
  - Validation behavior handles validators
  - Logging/performance behaviors if needed

## Infrastructure Layer

- [ ] **EF Core configuration**
  - IEntityTypeConfiguration created
  - Indexes defined
  - Relationships configured
  - Value object conversions

- [ ] **Repository implemented**
  - Implements Domain interface
  - Registered in DI

- [ ] **Migrations created**
  ```bash
  dotnet ef migrations add FeatureName --project Infrastructure --startup-project WebAPI
  ```

- [ ] **Migration reviewed**
  - No data loss
  - Rollback considered
  - Index impact assessed

## WebAPI Layer

- [ ] **Endpoints created**
  - Minimal APIs or Controllers
  - Proper HTTP methods
  - Route naming conventions
  - Authorization attributes

- [ ] **OpenAPI documentation**
  - Produces/ProducesResponseType attributes
  - XML comments for Swagger

- [ ] **Error handling**
  - Proper HTTP status codes
  - ProblemDetails format

## Testing

- [ ] **Domain tests**
  - Entity behavior tests
  - Value object tests
  - Domain service tests

- [ ] **Application tests**
  - Command handler tests
  - Query handler tests
  - Validator tests

- [ ] **Infrastructure tests**
  - Repository integration tests
  - Use Testcontainers for database

- [ ] **API tests**
  - Functional tests with WebApplicationFactory
  - Happy path tests
  - Error scenario tests

## Security

- [ ] **Authorization configured**
  - Endpoints protected
  - Resource ownership validated
  - Policies defined if needed

- [ ] **Input validation**
  - All inputs validated
  - Length limits set
  - Format validation (email, URL, etc.)

- [ ] **No sensitive data exposed**
  - DTOs don't include passwords/secrets
  - Logging doesn't include PII

## Documentation

- [ ] **API documentation**
  - Swagger annotations
  - Example requests/responses

- [ ] **Code documentation**
  - XML comments on public APIs
  - Complex logic explained

- [ ] **README updated**
  - New endpoints documented
  - Configuration changes noted

## Deployment Preparation

- [ ] **Configuration**
  - New settings in appsettings.json
  - Environment-specific values identified
  - Secrets documented (not committed!)

- [ ] **Database migration**
  - Migration script tested
  - Rollback plan documented

- [ ] **Feature flags**
  - If needed, feature flag implemented
  - Default state defined

## Final Verification

```bash
# Full validation
dotnet clean
dotnet build --warnaserror
dotnet test
dotnet format --verify-no-changes
```

- [ ] **Code review requested**
- [ ] **PR created with description**
- [ ] **CI pipeline passes**
