# C#/.NET Pre-Commit Checklist

## Code Quality

- [ ] **Build passes without warnings**
  ```bash
  dotnet build --warnaserror
  ```

- [ ] **All tests pass**
  ```bash
  dotnet test
  ```

- [ ] **Code formatting is correct**
  ```bash
  dotnet format --verify-no-changes
  ```

- [ ] **No analyzer warnings**
  - Roslyn analyzers
  - StyleCop analyzers
  - SonarAnalyzer

## Architecture

- [ ] **Clean Architecture layers respected**
  - Domain has no external dependencies
  - Application only references Domain
  - No circular dependencies

- [ ] **CQRS pattern followed**
  - Commands and Queries separated
  - Each handler has single responsibility
  - Validators exist for commands

## Code Patterns

- [ ] **Async/Await**
  - No blocking calls (.Result, .Wait())
  - CancellationToken passed to all async methods
  - Async methods suffixed with "Async"
  - No async void (except event handlers)

- [ ] **Null Safety**
  - Nullable reference types handled properly
  - No null reference warnings
  - Proper null checks or null-conditional operators

- [ ] **Exception Handling**
  - No empty catch blocks
  - Specific exceptions caught (not generic Exception)
  - Stack traces preserved (throw; not throw ex;)

## Entity Framework

- [ ] **No N+1 queries**
  - Use Include() for related data
  - Use projection (Select) where appropriate

- [ ] **AsNoTracking for read operations**

- [ ] **Migrations reviewed**
  ```bash
  dotnet ef migrations script --idempotent
  ```

## Security

- [ ] **No hardcoded secrets**
  - Connection strings from configuration
  - API keys from secrets management

- [ ] **Authorization on endpoints**
  - All endpoints have [Authorize] or explicit [AllowAnonymous]
  - Resource ownership validated

- [ ] **Input validation**
  - FluentValidation rules defined
  - No SQL injection vulnerabilities

## Testing

- [ ] **New code has tests**
  - Unit tests for business logic
  - Integration tests for repositories
  - Functional tests for new endpoints

- [ ] **Test coverage maintained**
  - Coverage not decreased
  - Critical paths covered

## Documentation

- [ ] **XML documentation on public APIs**
  - Summary for classes and methods
  - Parameter descriptions
  - Exception documentation

- [ ] **README updated if needed**

## Git

- [ ] **Meaningful commit message**
  - Follows conventional commits format
  - References issue/ticket if applicable

- [ ] **No debug code committed**
  - No Console.WriteLine
  - No commented-out code
  - No TODO without issue reference

## Final Checks

```bash
# Quick pre-commit validation
dotnet build --warnaserror && \
dotnet test --no-build && \
dotnet format --verify-no-changes
```

## If Any Check Fails

1. Fix the issue
2. Run full validation again
3. Review changes before committing
