---
description: PHP Test Coverage Analysis
argument-hint: [arguments]
---

# PHP Test Coverage Analysis

## Arguments

$ARGUMENTS (optional: path to PHP project to audit, defaults to current directory)

## Plan Mode

> Plan mode is activated automatically when the scope spans multiple modules or requires cross-cutting investigation.

## MISSION

Audit testing strategy, coverage, and quality of a native PHP project. Evaluate the test pyramid (unit, integration, end-to-end), Pest / PHPUnit practices, mutation score, and fixture hygiene. Produce a report with a score out of 25.

**Reference rules**: `.claude/rules/php-testing.md`

### Step 1: Test Suite Inventory

- [ ] Read `phpunit.xml` / `phpunit.xml.dist` or Pest configuration
- [ ] Check for Pest 4.5+ (`pestphp/pest`) or PHPUnit 12+
- [ ] Check for Infection (`infection/infection`) for mutation testing
- [ ] Check for Mockery, Prophecy, or PHPUnit native doubles
- [ ] Read `tests/` structure: Unit / Integration / Feature / Browser

**Expected layout**:

```
tests/
├── Unit/           # Fast, no IO, Domain + Application
├── Integration/    # DB, filesystem, external adapters
├── Feature/        # Use case level, end-to-end inside app boundary
└── Fixtures/       # Test data factories, builders
```

### Step 2: Coverage (7 pts)

```bash
docker compose exec app vendor/bin/pest --coverage --min=80
# or
docker compose exec app vendor/bin/phpunit --coverage-text --coverage-html=var/coverage
```

Check:
- [ ] Global line coverage ≥ 80%
- [ ] Domain layer coverage ≥ 95% (business logic is where bugs hurt most)
- [ ] Application layer coverage ≥ 90%
- [ ] Infrastructure coverage ≥ 70% (integration-tested)
- [ ] Coverage report published in CI

**Scoring**:
- ≥ 90%: 7 pts
- 80–89%: 5 pts
- 70–79%: 3 pts
- < 70%: 0 pts

### Step 3: Unit Tests — Domain (6 pts)

- [ ] Every Value Object has invariant tests (invalid inputs throw)
- [ ] Every Entity has identity + behavior tests
- [ ] Aggregates tested for invariant enforcement
- [ ] Domain events emission tested
- [ ] No IO / no mocks needed (true unit tests)
- [ ] AAA pattern (Arrange-Act-Assert) respected

### Step 4: Integration Tests (4 pts)

- [ ] Database adapters tested against a real DB (Postgres/MySQL in Docker)
- [ ] HTTP adapters tested with recorded fixtures (VCR pattern) or a mock server
- [ ] Filesystem adapters tested with temp directories
- [ ] **No mocks for the adapter under test** — mocks mask contract breaks (ref: user feedback for real-DB testing)

### Step 5: Test Quality — Pest / PHPUnit (3 pts)

- [ ] Test names describe behavior: `it('rejects empty email')` / `testRejectsEmptyEmail`
- [ ] One assertion group per test (multiple `expect()` OK if same behavior)
- [ ] No `$this->markTestSkipped()` without ticket reference
- [ ] No commented-out tests
- [ ] `setUp` / `beforeEach` kept minimal; prefer factories/builders

### Step 6: Fixtures & Data Builders (3 pts)

- [ ] Factories exist for aggregates (e.g., `UserFactory::make()->withEmail(...)`)
- [ ] No magic data in tests — named constants or builders
- [ ] Fixtures reset between tests (transaction rollback for DB tests)
- [ ] Faker or deterministic fake data

### Step 7: Mutation Testing & Isolation (2 pts)

```bash
docker compose exec app vendor/bin/infection --min-msi=70 --min-covered-msi=80
```

Check:
- [ ] Mutation Score Indicator (MSI) ≥ 70% (target 80%)
- [ ] Tests are independent (random order should pass)
- [ ] No shared mutable state across tests
- [ ] Time and randomness injected (no `time()` / `rand()` directly)

## OUTPUT FORMAT

```
PHP TESTING AUDIT
=================

SCORE: XX/25

COVERAGE (X/7)
  Global      : XX%
  Domain      : XX%
  Application : XX%
  Infrastructure: XX%
  Gaps:
  - src/Domain/... : 0% coverage

UNIT TESTS — DOMAIN (X/6)
  Entities tested: N/M
  Value Objects tested: N/M
  Missing:
  - src/Domain/ValueObject/Email.php

INTEGRATION (X/4)
  Real DB used: yes/no
  Adapters mocked (red flag): N

TEST QUALITY (X/3)
  Skipped tests without ticket: N
  Commented-out tests: N

FIXTURES (X/3)
  Factories present: yes/no
  Magic data count: N

MUTATION & ISOLATION (X/2)
  MSI: XX%
  Flaky tests detected: N

TOP 3 ACTIONS:
1. [CRITICAL] Add unit tests for src/Domain/...
2. Configure Infection with MSI ≥ 70
3. Replace adapter mocks with real DB in tests/Integration/
```

## IMPORTANT NOTES

- **Golden rule**: a fixed bug must never regress → add a regression test BEFORE fixing
- Coverage alone is not quality → report mutation score (Infection)
- Integration tests SHOULD NOT mock the adapter under test — mocks hide contract breaks
- Pest 4.5+ ships Browser Testing (Playwright-backed) — useful for end-to-end HTTP/CLI scenarios
- Use Docker for the entire test pipeline to avoid local-env drift
