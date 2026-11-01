# Check Ruby / Rails Testing

## Arguments

$ARGUMENTS (optional: path to project to analyze)

## Plan Mode

> Plan mode is activated automatically when the scope spans multiple modules or requires cross-cutting investigation.

## MISSION

Audit the test suite of the Rails 8.1 / Ruby 4.0 project. Both frameworks are supported: **RSpec** (`rspec-rails`, `spec/`) and **Minitest** (Rails default, `test/`). Detect which one is used and apply the matching commands. TDD (Red, Green, Refactor) and coverage >= 80% are mandatory. All commands run in Docker.

### Step 1: Detect Framework and Run the Suite

```bash
docker compose exec app ls spec test
docker compose exec app grep -nE "rspec-rails|minitest|factory_bot|capybara|simplecov|shoulda|webmock|vcr" Gemfile
# RSpec
docker compose exec app bundle exec rspec --format progress
# Minitest
docker compose exec app bin/rails test
docker compose exec app bin/rails test:system
```

Record: framework, number of examples, failures, pending/skipped, duration.

### Step 2: Code Coverage (7 points)

SimpleCov must be loaded first in `spec/spec_helper.rb` or `test/test_helper.rb` (before application code).

```bash
docker compose exec app grep -rn "SimpleCov" spec/spec_helper.rb test/test_helper.rb .simplecov
docker compose exec app env COVERAGE=true bundle exec rspec
docker compose exec app env COVERAGE=true bin/rails test
docker compose exec app cat coverage/.last_run.json
```

Checklist:
- [ ] SimpleCov configured with `minimum_coverage 80` (and ideally `minimum_coverage_by_file 60`)
- [ ] Branch coverage enabled (`enable_coverage :branch`)
- [ ] Parallel runs merged (`SimpleCov.collate` or `use_merging`)
- [ ] Coverage enforced in CI
- [ ] Mutation testing (`mutant` or equivalent) used on critical domain code, since coverage alone gives false confidence

**Scoring**: 7 pts. >= 90% = 7; 80-89% = 5; 70-79% = 3; 50-69% = 1; < 50% or no coverage tool = 0.

### Step 3: Model and Object Unit Tests (6 points)

```bash
docker compose exec app sh -c 'ls app/models/*.rb | wc -l; ls spec/models test/models | wc -l'
docker compose exec app sh -c 'ls app/services app/queries app/forms app/policies app/jobs'
docker compose exec app sh -c 'ls spec/services spec/queries spec/jobs test/services test/jobs'
```

Checklist:
- [ ] Every model has tests for validations, associations (shoulda-matchers or explicit), scopes, and domain methods
- [ ] Every service, form, query, and policy object has tests for the success path and each failure path
- [ ] Jobs tested for behavior and idempotency (`perform_enqueued_jobs`, `assert_enqueued_with`)
- [ ] Mailers tested for recipients, subject, and key content
- [ ] Edge cases covered: nil, empty, boundary values, time zones (`travel_to` / `freeze_time`)
- [ ] Tests follow AAA (Arrange, Act, Assert), one behavior per example, descriptive names
- [ ] Bug fixes come with a regression test written first (fails before the fix)

**Scoring**: 6 pts. Proportional to the share of models/objects with meaningful tests (assertions on behavior, not implementation).

### Step 4: Request and Integration Tests (5 points)

Prefer request specs (RSpec `type: :request`) or integration tests (`ActionDispatch::IntegrationTest`) over controller tests.

```bash
docker compose exec app sh -c 'ls spec/requests test/integration test/controllers'
docker compose exec app grep -rnE "type: :controller|ActionController::TestCase" spec test
docker compose exec app grep -rnE "get |post |patch |put |delete " spec/requests test/integration | wc -l
```

Checklist:
- [ ] Each routed resource has request tests for success, validation failure (422), unauthenticated (401/redirect), and unauthorized (403/404) cases
- [ ] Response status, body shape (JSON schema or key assertions), and persistence side effects asserted
- [ ] Authentication helper used (sign in through the session flow, not by stubbing internals)
- [ ] Tenant isolation tests: a user cannot read or modify another tenant's records
- [ ] Rate-limited endpoints tested (`rate_limit` returns 429 after the threshold)
- [ ] No legacy controller specs for new code

**Scoring**: 5 pts. Deduct 1 per critical resource without request tests, max -5.

### Step 5: System Tests (3 points)

```bash
docker compose exec app sh -c 'ls spec/system test/system'
docker compose exec app grep -nE "driven_by|capybara|selenium|cuprite|playwright" spec/rails_helper.rb test/application_system_test_case.rb Gemfile
docker compose exec app bin/rails test:system
```

Checklist:
- [ ] Critical user journeys (signup, login, core purchase/creation flow) covered by Capybara system tests
- [ ] Headless browser available in the Docker test image (Chrome/Chromium via Selenium or Cuprite)
- [ ] Hotwire interactions (Turbo Frames/Streams, Stimulus) verified through real browser behavior
- [ ] Tests wait with Capybara's built-in synchronization (`assert_selector`, `have_content`), never `sleep`
- [ ] System tests stay a small share of the suite (about 10%, pyramid: 70% unit, 20% integration, 10% E2E)
- [ ] Failure screenshots saved as CI artifacts

**Scoring**: 3 pts (1 coverage of critical journeys, 1 stability, 1 Hotwire/JS coverage).

### Step 6: Factories, Fixtures and Data (2 points)

```bash
docker compose exec app sh -c 'ls spec/factories test/factories test/fixtures spec/fixtures'
docker compose exec app bundle exec rake factory_bot:lint
docker compose exec app grep -rnE "create\(:|create_list" spec test | wc -l
docker compose exec app grep -rnE "build_stubbed|build\(" spec test | wc -l
```

Checklist:
- [ ] FactoryBot factories (or Rails fixtures, consistently) produce valid records; `factory_bot:lint` passes
- [ ] Factories are minimal; traits express variants; no deep association chains created by default
- [ ] `build` / `build_stubbed` preferred over `create` when persistence is not needed
- [ ] Fixtures (if used) are small, labeled, and not shared through hidden coupling
- [ ] Sensitive production data is never copied into fixtures or factories

**Scoring**: 2 pts (1 validity and lint, 1 minimalism and speed).

### Step 7: Isolation, Speed and Reliability (2 points)

```bash
docker compose exec app bundle exec rspec --order random --profile 10
docker compose exec app bin/rails test --seed 12345
docker compose exec app grep -rnE "sleep\(|sleep [0-9]|Time\.now|Date\.today|allow_any_instance_of|expect_any_instance_of" spec test
docker compose exec app grep -rnE "xit |xdescribe|skip |pending" spec test | wc -l
docker compose exec app grep -rnE "webmock|vcr|WebMock" Gemfile spec test
```

Checklist:
- [ ] Tests run in random order and pass with different seeds
- [ ] Each test uses transactional isolation or database cleaning; no order dependence
- [ ] Time is injected (`travel_to`, `freeze_time`), never `sleep`
- [ ] External HTTP is blocked and stubbed (WebMock/VCR); no real network in tests
- [ ] Mocks limited to boundaries (HTTP, clock, payments); no `allow_any_instance_of`, no mocking the object under test
- [ ] No skipped/pending tests without a ticket; no commented-out tests
- [ ] Suite is parallelized (`parallelize(workers: :number_of_processors)` or `parallel_tests`) and the unit suite runs in minutes at most
- [ ] Flaky tests tracked and fixed, not retried blindly

**Scoring**: 2 pts (1 isolation and determinism, 1 mocking discipline and speed).

## OUTPUT FORMAT

```
RUBY / RAILS TESTING AUDIT
==========================

SCORE: XX/25

Framework: [RSpec/Minitest]   Examples: N   Failures: N   Skipped: N   Duration: Ns
Coverage: XX% (line)  XX% (branch)

SUB-SCORES:
  Code coverage                : XX/7
  Model / object unit tests    : XX/6
  Request / integration tests  : XX/5
  System tests                 : XX/3
  Factories / fixtures         : XX/2
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
- Support both RSpec and Minitest; never recommend a migration between them as an audit finding
