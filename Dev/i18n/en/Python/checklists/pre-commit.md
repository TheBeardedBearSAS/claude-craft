# Pre-Commit Checklist

## Before Each Commit

### 1. Code Quality

- [ ] **Linting** - Code follows standards
  ```bash
  make lint
  # or
  ruff check src/ tests/
  ```

- [ ] **Formatting** - Code properly formatted
  ```bash
  make format-check
  # or
  black --check src/ tests/
  isort --check src/ tests/
  ```

- [ ] **Type Checking** - No type errors
  ```bash
  make type-check
  # or
  mypy src/
  ```

- [ ] **Security** - No obvious vulnerabilities
  ```bash
  make security-check
  # or
  bandit -r src/ -ll
  ```

### 2. Tests

- [ ] **All tests pass**
  ```bash
  make test
  # or
  pytest tests/
  ```

- [ ] **New tests written** for new code
  - [ ] Unit tests for new logic
  - [ ] Integration tests if necessary
  - [ ] E2E tests if critical flow

- [ ] **Coverage maintained** (> 80%)
  ```bash
  make test-cov
  # or
  pytest --cov=src --cov-report=term
  ```

- [ ] **Relevant tests** for fixed bugs
  - [ ] Test reproduces bug (should fail before fix)
  - [ ] Test passes after fix

### 3. Code Standards

- [ ] **PEP 8** respected
  - [ ] Max line 88 characters
  - [ ] Imports organized (stdlib, third-party, local)
  - [ ] No trailing whitespace

- [ ] **Type hints** on all public functions
  ```python
  def my_function(param: str) -> int:
      """Docstring."""
      pass
  ```

- [ ] **Docstrings** Google style
  ```python
  def function(arg1: str, arg2: int) -> bool:
      """
      Summary line.

      Args:
          arg1: Description
          arg2: Description

      Returns:
          Description

      Raises:
          ValueError: If condition
      """
      pass
  ```

- [ ] **Naming conventions**
  - [ ] Classes: PascalCase
  - [ ] Functions/variables: snake_case
  - [ ] Constants: UPPER_CASE
  - [ ] Private: _prefixed

### 4. Architecture

- [ ] **Clean Architecture** respected
  - [ ] Domain depends on nothing
  - [ ] Dependencies point inward
  - [ ] Protocols for abstractions

- [ ] **SOLID** applied
  - [ ] Single Responsibility
  - [ ] Open/Closed
  - [ ] Liskov Substitution
  - [ ] Interface Segregation
  - [ ] Dependency Inversion

- [ ] **KISS, DRY, YAGNI**
  - [ ] Simple solution
  - [ ] No duplication
  - [ ] No unnecessary code

### 5. Security

- [ ] **No secrets** hardcoded in code
  - [ ] No passwords
  - [ ] No API keys
  - [ ] No tokens

- [ ] **Environment variables**
  - [ ] Added to `.env.example` if new
  - [ ] Documented in README if necessary

- [ ] **Input validation**
  - [ ] All inputs validated (Pydantic)
  - [ ] No SQL injection (parameterized queries)
  - [ ] No XSS injection

- [ ] **Sensitive data**
  - [ ] Passwords hashed (bcrypt)
  - [ ] PII protected
  - [ ] Logs don't contain sensitive data

### 6. Database

- [ ] **Migration** created if schema change
  ```bash
  make db-migrate msg="Description"
  # or
  alembic revision --autogenerate -m "Description"
  ```

- [ ] **Migration tested**
  - [ ] Upgrade works
  - [ ] Downgrade works
  - [ ] No data loss

- [ ] **Indexes** added if necessary
  - [ ] On frequently searched columns
  - [ ] On foreign keys

### 7. Performance

- [ ] **N+1 queries** avoided
  - [ ] Use of joinedload/selectinload if necessary
  - [ ] No queries in loops

- [ ] **Pagination** for large lists
  - [ ] Limit/offset implemented
  - [ ] No loading thousands of items

- [ ] **Caching** if appropriate
  - [ ] Cache for frequently accessed data
  - [ ] Cache invalidation managed

### 8. Logging & Monitoring

- [ ] **Appropriate logging**
  - [ ] Correct level (DEBUG, INFO, WARNING, ERROR)
  - [ ] Clear and informative messages
  - [ ] Context added (user_id, request_id, etc.)

- [ ] **No print()** - use logger
  ```python
  # ❌ Bad
  print(f"User {user_id} created")

  # ✅ Good
  logger.info(f"User created", extra={"user_id": user_id})
  ```

- [ ] **Exceptions logged**
  ```python
  try:
      risky_operation()
  except Exception as e:
      logger.error(f"Operation failed: {e}", exc_info=True)
      raise
  ```

### 9. Documentation

- [ ] **Code comments** for complex logic
  - [ ] No obvious comments
  - [ ] Explanation of "why", not "what"

- [ ] **README** updated if necessary
  - [ ] New features documented
  - [ ] Setup instructions up to date
  - [ ] Environment variables documented

- [ ] **API docs** up to date
  - [ ] New endpoints documented
  - [ ] Examples provided
  - [ ] Errors documented

### 10. Git

- [ ] **Commit message** follows Conventional Commits
  ```
  type(scope): subject

  body

  footer
  ```
  - Types: feat, fix, docs, style, refactor, test, chore
  - Subject: imperative, lowercase, no period
  - Body: optional, change details
  - Footer: breaking changes, closes issues

- [ ] **Atomic commit**
  - [ ] One commit = one logical change
  - [ ] No giant commits
  - [ ] No "WIP" or "fix" commits

- [ ] **Temporary files** not included
  - [ ] No .pyc, __pycache__
  - [ ] No .env (only .env.example)
  - [ ] No IDE files

### 11. Dependencies

- [ ] **New dependencies** justified
  - [ ] Really necessary?
  - [ ] No alternative in existing deps?
  - [ ] Maintained and secure library?

- [ ] **Lock file** updated
  ```bash
  poetry lock
  # or
  uv lock
  ```

- [ ] **Version pinned** correctly
  - [ ] Not too broad versions (`*`)
  - [ ] Compatible with other deps

### 12. Cleanup

- [ ] **Dead code** removed
  - [ ] No commented code
  - [ ] No unused functions
  - [ ] No unused imports

- [ ] **Debug code** removed
  - [ ] No breakpoint()
  - [ ] No debug prints
  - [ ] No TODO/FIXME (or create issue)

- [ ] **Console logs** removed
  - [ ] No debug print()
  - [ ] Appropriate logs used

## Quick Check Command

```bash
# One-liner to check everything
make quality && make test-cov
```

## Pre-commit Hook

To automate, use pre-commit hooks:

```bash
# .pre-commit-config.yaml already configured
pre-commit install

# Run manually
pre-commit run --all-files
```

## If Something Fails

### Linting Errors

```bash
# Auto-fix what can be fixed
make lint-fix
# or
ruff check --fix src/ tests/
```

### Formatting Errors

```bash
# Auto-format
make format
# or
black src/ tests/
isort src/ tests/
```

### Failing Tests

```bash
# Run tests in verbose for debug
pytest -vv tests/

# Run specific test
pytest tests/path/to/test.py::test_function -vv

# See stdout/stderr
pytest -s tests/
```

### Type Errors

```bash
# See detailed errors
mypy src/ --show-error-codes

# Temporarily ignore (avoid!)
# type: ignore[error-code]
```

## Exceptions

### Urgent Hotfix

If urgent production hotfix:
- [ ] Minimum tests pass
- [ ] Fix verified manually
- [ ] PR created immediately after
- [ ] TODO created to improve tests

### WIP Commit

If really necessary (avoid):
- [ ] Commit in separate branch
- [ ] Prefixed with `WIP:`
- [ ] Squash before merge to main

## Quick Checklist (Minimum)

- [ ] `make lint` ✅
- [ ] `make type-check` ✅
- [ ] `make test` ✅
- [ ] Valid commit message ✅
- [ ] No secrets ✅
