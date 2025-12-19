---
description: Check Python Testing
argument-hint: [arguments]
---

# Check Python Testing

## Arguments

$ARGUMENTS (optional: path to project to analyze)

## MISSION

Perform a complete audit of the Python project's testing strategy by verifying coverage, test quality, and best practices compliance defined in project rules.

### Step 1: Structure and Test Organization

Examine test organization:
- [ ] `tests/` folder at project root
- [ ] Mirror structure of source code (tests/domain, tests/application, etc.)
- [ ] Test files named `test_*.py` or `*_test.py`
- [ ] Pytest fixtures in `conftest.py`
- [ ] Separation of unit / integration / e2e tests

**Reference**: `rules/07-testing.md` section "Test Organization"

### Step 2: Code Coverage

Measure test coverage:
- [ ] Overall coverage ≥ 80%
- [ ] Domain Layer coverage ≥ 90%
- [ ] Application Layer coverage ≥ 85%
- [ ] Critical files at 100%
- [ ] Coverage configuration in pyproject.toml

**Command**: Run `docker run --rm -v $(pwd):/app python:3.11 sh -c "pip install pytest pytest-cov && pytest /app --cov=/app --cov-report=term-missing"`

**Reference**: `rules/07-testing.md` section "Code Coverage"

### Step 3: Unit Tests

Analyze unit test quality:
- [ ] Isolated tests (no external dependencies)
- [ ] Use of mocks/stubs for dependencies
- [ ] Fast tests (<100ms per test)
- [ ] One test = One behavior
- [ ] Descriptive naming: `test_should_X_when_Y`
- [ ] AAA pattern (Arrange, Act, Assert)

**Reference**: `rules/07-testing.md` section "Unit Tests"

### Step 4: Integration Tests

Verify integration tests:
- [ ] Tests of interactions between components
- [ ] Tests of Infrastructure layer (DB, API, etc.)
- [ ] Use of test databases (fixtures)
- [ ] Cleanup after each test (teardown)
- [ ] Isolated and independent tests

**Reference**: `rules/07-testing.md` section "Integration Tests"

### Step 5: Assertions and Test Quality

Check assertion quality:
- [ ] Explicit and specific assertions
- [ ] No multiple unrelated assertions
- [ ] Clear error messages
- [ ] Edge case tests
- [ ] Error and exception tests
- [ ] No disabled tests without reason (skip/xfail)

**Reference**: `rules/07-testing.md` section "Assertions and Test Quality"

### Step 6: Fixtures and Parameterization

Evaluate pytest fixture usage:
- [ ] Fixtures for common setup/teardown
- [ ] Appropriate scope (function, class, module, session)
- [ ] Parameterization with `@pytest.mark.parametrize`
- [ ] Factories for complex test objects
- [ ] No duplication in fixtures

**Reference**: `rules/07-testing.md` section "Pytest Fixtures"

### Step 7: Performance and Execution

Analyze test performance:
- [ ] Total execution time <30 seconds (unit tests)
- [ ] Parallelizable tests (pytest-xdist)
- [ ] No sleep() in tests
- [ ] Pytest configuration in pyproject.toml
- [ ] CI/CD with automatic test execution

**Command**: Run `docker run --rm -v $(pwd):/app python:3.11 sh -c "pip install pytest && pytest /app -v --duration=10"`

**Reference**: `rules/07-testing.md` section "Test Performance"

### Step 8: Test-Driven Development (TDD)

Verify TDD adoption:
- [ ] Tests written before code (if applicable)
- [ ] Red-Green-Refactor cycle
- [ ] Tests guiding design
- [ ] No untested code in production

**Reference**: `rules/01-workflow-analysis.md` section "TDD Workflow"

### Step 9: Calculate Score

Point attribution (out of 25):
- Code coverage: 7 points
- Unit tests: 6 points
- Integration tests: 4 points
- Assertion quality: 3 points
- Fixtures and organization: 3 points
- Performance: 2 points

## OUTPUT FORMAT

```
PYTHON TESTING AUDIT
================================

OVERALL SCORE: XX/25

STRENGTHS:
- [List of good testing practices observed]

IMPROVEMENTS:
- [List of minor improvements]

CRITICAL ISSUES:
- [List of critical testing gaps]

DETAILS BY CATEGORY:

1. COVERAGE (XX/7)
   Status: [Coverage analysis]
   Overall Coverage: XX%
   Domain: XX%
   Application: XX%
   Infrastructure: XX%

2. UNIT TESTS (XX/6)
   Status: [Unit test quality]
   Number of Tests: XX
   Isolated Tests: XX%
   Average Time: XXms

3. INTEGRATION TESTS (XX/4)
   Status: [Integration tests]
   Number of Tests: XX
   Infrastructure Coverage: XX%

4. ASSERTIONS (XX/3)
   Status: [Assertion quality]
   Specific Assertions: XX%
   Edge Case Tests: XX

5. FIXTURES (XX/3)
   Status: [Organization and fixtures]
   Reusable Fixtures: XX
   Parameterized Tests: XX

6. PERFORMANCE (XX/2)
   Status: [Test performance]
   Total Time: XXs
   Tests >1s: XX

TOP 3 PRIORITY ACTIONS:
1. [Most critical action to improve tests]
2. [Second priority action]
3. [Third priority action]
```

## NOTES

- Run pytest with coverage to obtain metrics
- Use Docker to abstract from local environment
- Identify critical files without tests
- Propose missing tests for key functionalities
- Suggest concrete improvements for existing tests
- Prioritize tests based on business risk
