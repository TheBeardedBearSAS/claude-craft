# Check Rust / Axum Testing

## Arguments

$ARGUMENTS (optional: path to project to analyze)

## Plan Mode

> Plan mode is activated automatically when the scope spans multiple crates or requires cross-cutting investigation.

## MISSION

Audit the test suite of the Rust (edition 2024) / axum 0.8 project. The standard stack is the built-in test harness run through **cargo-nextest**, `tower::ServiceExt::oneshot` for in-process HTTP tests, `#[sqlx::test]` for database tests, and **cargo-llvm-cov** for coverage. TDD (Red, Green, Refactor) and coverage >= 80% are mandatory. All commands run in Docker.

### Step 1: Run the Suite

```bash
docker compose exec app cargo nextest run --workspace --all-features
docker compose exec app cargo test --workspace --doc
docker compose exec app grep -nE "nextest|llvm-cov|proptest|insta|wiremock|mockall|testcontainers|rstest" Cargo.toml crates/*/Cargo.toml
docker compose exec app ls tests/ crates/*/tests/ .config/nextest.toml
```

Record: number of tests, failures, skipped, duration, flaky retries.

### Step 2: Code Coverage (7 points)

```bash
docker compose exec app cargo llvm-cov nextest --workspace --all-features --summary-only
docker compose exec app cargo llvm-cov nextest --workspace --all-features --fail-under-lines 80
docker compose exec app cargo llvm-cov report --lcov --output-path lcov.info
docker compose exec app cargo mutants --list
```

Checklist:
- [ ] `cargo llvm-cov` configured with a threshold of 80% lines enforced in CI (`--fail-under-lines 80`)
- [ ] Coverage excludes generated code, `main.rs` wiring and test utilities explicitly (`--ignore-filename-regex`), not by lowering the threshold
- [ ] Branch coverage reviewed on critical domain code where the toolchain supports it
- [ ] Coverage report published as a CI artifact
- [ ] Mutation testing (`cargo-mutants`) used on critical domain code, since coverage alone gives false confidence

**Scoring**: 7 pts. >= 90% = 7; 80-89% = 5; 70-79% = 3; 50-69% = 1; < 50% or no coverage tool = 0.

### Step 3: Domain and Unit Tests (6 points)

```bash
docker compose exec app sh -c 'grep -rlE "#\[cfg\(test\)\]" crates src | wc -l'
docker compose exec app grep -rnE "#\[(tokio::)?test\]|#\[rstest\]" crates/domain crates/application | wc -l
docker compose exec app grep -rnE "proptest!|quickcheck|insta::assert" crates src
```

Checklist:
- [ ] Domain types test their invariants: valid and invalid construction of every newtype, state transitions, boundary values
- [ ] Use cases are tested against in-memory fakes of their ports; the success path and each failure variant are asserted
- [ ] Error enums and their HTTP mapping (`IntoResponse`) tested: status, `Content-Type: application/problem+json`, body shape
- [ ] Property-based tests (`proptest`) on parsers, validators and round-trips
- [ ] Time and randomness injected through traits (clock, id generator); no `Utc::now()` assertions against real time
- [ ] Tests follow AAA (Arrange, Act, Assert), one behavior per test, descriptive names (`rejects_empty_cart`)
- [ ] Bug fixes come with a regression test written first (fails before the fix)

**Scoring**: 6 pts. Proportional to the share of domain modules and use cases with meaningful tests (assertions on behavior, not implementation).

### Step 4: HTTP and Integration Tests (5 points)

Test the real `Router` in process with `tower::ServiceExt::oneshot` (no network port), and the real database through `#[sqlx::test]`.

```bash
docker compose exec app ls tests/ crates/http/tests/
docker compose exec app grep -rnE "oneshot|ServiceExt|Request::builder|#\[sqlx::test" tests crates
docker compose exec app grep -rnE "StatusCode::(UNAUTHORIZED|FORBIDDEN|UNPROCESSABLE_ENTITY|NOT_FOUND|TOO_MANY_REQUESTS)" tests crates
```

Checklist:
- [ ] The application factory (`fn app(state) -> Router`) is shared by `main` and tests, so tests exercise the real layers and routes
- [ ] Each endpoint has tests for success, validation failure (400/422), unauthenticated (401), unauthorized (403/404) and conflict cases
- [ ] Status, headers, JSON body shape and persistence side effects are asserted
- [ ] Database tests use `#[sqlx::test]` (fresh database per test, migrations applied) rather than a shared mutable database
- [ ] Authentication is exercised through the real middleware with a test token, not by bypassing it
- [ ] Tenant isolation tests: a user cannot read or modify another tenant's records
- [ ] Rate limits, timeouts and body limits tested (413/429/408)
- [ ] External HTTP dependencies stubbed (`wiremock`); no real network in tests

**Scoring**: 5 pts. Deduct 1 per critical resource without HTTP tests, max -5.

### Step 5: Contract, End-to-End and Doc Tests (3 points)

```bash
docker compose exec app cargo test --workspace --doc
docker compose exec app grep -rnE "testcontainers|TcpListener::bind\(\"127.0.0.1:0\"" tests crates
docker compose exec app ls openapi.yaml docs/openapi*
docker compose exec app cargo insta test --check
```

Checklist:
- [ ] A few end-to-end tests start the real server on an ephemeral port (`127.0.0.1:0`) with a real database (`testcontainers` or the Compose service) for critical journeys
- [ ] The OpenAPI document (or JSON snapshots with `insta`) is checked against real responses so the contract cannot drift
- [ ] Doc tests compile and pass for public APIs
- [ ] End-to-end tests stay a small share of the suite (about 10%; pyramid: 70% unit, 20% integration, 10% E2E)
- [ ] Graceful shutdown covered by at least one test (in-flight request completes)
- [ ] Snapshots are reviewed, not blindly accepted

**Scoring**: 3 pts (1 critical journeys, 1 contract and snapshots, 1 doc tests and shutdown).

### Step 6: Fixtures and Test Data (2 points)

```bash
docker compose exec app ls tests/common tests/fixtures crates/*/tests/common
docker compose exec app grep -rnE "fn (build|make|a|an)_[a-z_]+\(|impl Default for .*Fixture|Builder" tests crates
docker compose exec app grep -rnE "fixtures\(" tests crates
```

Checklist:
- [ ] Test builders or helper functions produce valid domain objects with sensible defaults; variants overridden per test
- [ ] `#[sqlx::test(fixtures(...))]` SQL fixtures are small, named and scoped to the test that needs them
- [ ] Shared helpers live in a `tests/common` module, not copy-pasted across files
- [ ] Sensitive production data is never copied into fixtures

**Scoring**: 2 pts (1 validity and reuse, 1 minimalism).

### Step 7: Isolation, Speed and Reliability (2 points)

```bash
docker compose exec app cargo nextest run --workspace --retries 0
docker compose exec app grep -rnE "sleep\(|Instant::now|SystemTime::now|Utc::now" tests crates
docker compose exec app grep -rnE "#\[ignore" tests crates | wc -l
docker compose exec app grep -rnE "static (mut )?[A-Z_]+|lazy_static|OnceLock" tests crates
docker compose exec app grep -nE "retries|slow-timeout|test-groups" .config/nextest.toml
```

Checklist:
- [ ] Every test passes in isolation and in any order (nextest runs each test in its own process)
- [ ] No shared global state between tests; each database test gets its own database
- [ ] Time is controlled (`tokio::time::pause`, injected clocks), never real `sleep`
- [ ] Mocks limited to boundaries (HTTP, clock, payments); no mocking the unit under test
- [ ] No `#[ignore]` without a ticket; no commented-out tests
- [ ] Flaky tests are tracked and fixed; nextest `retries` is not used to hide them
- [ ] Unit suite runs in minutes at most; slow tests are grouped (`test-groups`) or tagged

**Scoring**: 2 pts (1 isolation and determinism, 1 mocking discipline and speed).

## OUTPUT FORMAT

```
RUST / AXUM TESTING AUDIT
=========================

SCORE: XX/25

Runner: cargo-nextest   Tests: N   Failures: N   Ignored: N   Duration: Ns
Coverage: XX% (lines)   Mutation score: XX% (if measured)

SUB-SCORES:
  Code coverage                : XX/7
  Domain / unit tests          : XX/6
  HTTP / integration tests     : XX/5
  Contract / E2E / doc tests   : XX/3
  Fixtures and test data       : XX/2
  Isolation / speed            : XX/2

STRENGTHS:
- [...]

ISSUES (by severity):
- CRITICAL: [file or resource] [description] -> [fix]
- IMPORTANT: ...
- MINOR: ...

UNTESTED CODE (top 10 by risk):
- [path] (coverage XX%)

RECOMMENDATIONS:
1. [Action] (effort, impact)
```

## IMPORTANT NOTES

- If the suite fails, report the failures first; a red suite caps the testing score at 10/25
- Do not modify tests during the audit; only report
- Judge tests on behavior (WHAT), not implementation (HOW)
- Do not penalize the choice between hand-written fakes and `mockall`; judge whether tests are readable and resilient to refactoring
