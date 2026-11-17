# Check Ruby / Rails Code Quality

## Arguments

$ARGUMENTS (optional: path to project to analyze)

## Plan Mode

> Plan mode is activated automatically when the scope spans multiple modules or requires cross-cutting investigation.

## MISSION

Audit code quality of the Ruby 4.0 / Rails 8.1 project: linting, idiomatic Ruby, simplicity, error handling, naming, and optional static typing. All commands run in Docker.

### Step 1: RuboCop (6 points)

Rails 8 ships `rubocop-rails-omakase` by default; teams may extend it with `rubocop-rails`, `rubocop-performance`, and `rubocop-rspec` or `rubocop-minitest`.

```bash
docker compose exec app bin/rubocop
docker compose exec app bundle exec rubocop --format offenses
docker compose exec app bundle exec rubocop --format json > rubocop.json
docker compose exec app grep -rnE "rubocop:disable" app lib spec test | wc -l
```

Checklist:
- [ ] `.rubocop.yml` exists and inherits a maintained style (omakase or equivalent)
- [ ] Zero offenses on the default branch
- [ ] `rubocop:disable` comments are rare, scoped to one line, and justified
- [ ] `.rubocop_todo.yml` (if any) is shrinking over time, not growing
- [ ] Linting runs in CI (`bin/ci` or GitHub Actions)

**Scoring**: 6 pts. 0 offenses = 6; 1-10 = 4; 11-50 = 2; > 50 or no config = 0. Deduct 1 for unjustified disables.

### Step 2: Idiomatic Ruby 4.0 (5 points)

```bash
docker compose exec app ruby -v
docker compose exec app sh -c 'grep -rL "frozen_string_literal" app lib --include="*.rb" | head -20'
docker compose exec app grep -rnE "\.map\(&:\w+\)\.flatten|\.select.*\.first|each_with_object\(\[\]\)" app | head
docker compose exec app grep -rnE "\beval\(|instance_variable_get|\.send\(params" app lib | head
```

Checklist:
- [ ] `# frozen_string_literal: true` in every Ruby file (or enforced by RuboCop `Style/FrozenStringLiteralComment`)
- [ ] Keyword arguments for methods with more than 2 parameters; no positional lists longer than 4
- [ ] Pattern matching (`case/in`) or `Data.define` / `Struct` with `keyword_init` for value-like objects instead of ad hoc hashes
- [ ] Safe navigation (`&.`), `then` and `tap` used sparingly and readably
- [ ] Enumerable methods preferred over manual loops and array mutation (`map`, `select`, `sum`)
- [ ] No monkey patching of core classes outside `config/initializers` with a comment; prefer refinements or wrappers
- [ ] No `eval`, `instance_variable_get`, or `send` with user-controlled input
- [ ] `.ruby-version` pins Ruby (4.0.x preferred); the Gemfile `ruby` line matches
- [ ] Experimental features (`Ruby::Box`) are not used in production code
- [ ] YJIT enabled in production when the runtime build supports it (ZJIT is the new compiler, YJIT remains available and proven)

**Scoring**: 5 pts, minus 0.5 per violated item (min 0).

### Step 3: KISS / DRY / YAGNI and Complexity (4 points)

```bash
docker compose exec app bundle exec rubocop --only Metrics/MethodLength,Metrics/AbcSize,Metrics/CyclomaticComplexity,Metrics/PerceivedComplexity,Metrics/ClassLength
# Optional deeper metrics when the gems are in the bundle
docker compose exec app bundle exec flog -g app | head -20
docker compose exec app bundle exec flay app | head -20
```

Project targets (rule 05): methods < 10 lines (limit 20), cyclomatic complexity < 5 (limit 10), nesting <= 3, parameters <= 4.

Checklist:
- [ ] Guard clauses and early returns instead of nested `if`
- [ ] No duplicated business rules (rule of three before abstracting)
- [ ] No speculative abstractions: one-implementation interfaces, unused options, unused parameters
- [ ] No metaprogramming (`define_method`, `method_missing`) where plain methods work
- [ ] No dead code and no leftover debug statements

```bash
docker compose exec app bin/rails notes
docker compose exec app grep -rnE "binding\.irb|byebug|debugger|^\s*(puts|pp) " app lib | head
```

**Scoring**: 4 pts. Deduct 1 per 5 methods exceeding limits, 1 for duplication hotspots, 1 for leftover debug statements, 1 for speculative abstractions.

### Step 4: Error Handling (4 points)

```bash
docker compose exec app grep -rnE "rescue Exception|^\s*rescue\s*$" app lib | head -20
docker compose exec app grep -rnE -A1 "^\s*rescue" app lib | grep -E "^\S+-\s*nil\s*$" | head
docker compose exec app grep -rnE "rescue_from" app/controllers
```

Checklist:
- [ ] No bare `rescue` or `rescue Exception`; rescue the narrowest class
- [ ] No swallowed errors (`rescue` then `nil`); handle, log with context, or re-raise
- [ ] Domain errors are explicit classes inheriting `StandardError` under a namespace
- [ ] Controllers map errors through `rescue_from` or a shared concern; no stack traces in responses
- [ ] Bang methods (`save!`, `update!`, `create!`) used where failure must abort a transaction
- [ ] Jobs declare `retry_on` / `discard_on` for known transient/permanent failures
- [ ] Errors reported through `Rails.error.report` or an error tracker

**Scoring**: 4 pts, minus 1 per violated item group.

### Step 5: Naming and Documentation (3 points)

```bash
docker compose exec app bundle exec rubocop --only Naming
docker compose exec app bundle exec yard stats --list-undoc | tail -20
docker compose exec app ls README.md CHANGELOG.md docs
```

Checklist:
- [ ] Classes/modules `CamelCase`, methods and variables `snake_case`, constants `SCREAMING_SNAKE_CASE`
- [ ] Predicate methods end in `?`; `!` only when a safer counterpart exists
- [ ] File names match constants (Zeitwerk)
- [ ] Comments explain WHY, not WHAT; no commented-out code
- [ ] Public service/query APIs have a short header comment with inputs and return value
- [ ] README documents Docker setup, `bin/setup`, `bin/ci`, and deployment (Kamal)

**Scoring**: 3 pts (1 naming, 1 comments, 1 README/docs).

### Step 6: Typing and Tooling (3 points)

Typing is optional in Ruby. Never penalize a project that deliberately has none when tests compensate.

```bash
docker compose exec app ls sig rbs_collection.yaml sorbet
docker compose exec app bundle exec steep check | tail -10
docker compose exec app bundle exec srb tc | tail -10
docker compose exec app bin/ci
docker compose exec app bundle outdated --strict | head -20
```

Checklist:
- [ ] If RBS/Steep or Sorbet is adopted, it passes with no errors in CI
- [ ] `bin/ci` (Rails 8.1) exists and runs lint, security scans, and tests
- [ ] `bundler-audit` and Brakeman are part of CI
- [ ] Gems are justified and maintained; `bundle outdated --strict` is reviewed regularly

**Scoring**: 3 pts (1 typing if adopted or tests compensate, 1 CI pipeline, 1 dependency hygiene).

## OUTPUT FORMAT

```
RUBY / RAILS CODE QUALITY AUDIT
===============================

SCORE: XX/25

RuboCop offenses: N   Files without frozen_string_literal: N   Methods over limit: N

SUB-SCORES:
  RuboCop                      : XX/6
  Idiomatic Ruby               : XX/5
  KISS / DRY / YAGNI           : XX/4
  Error handling               : XX/4
  Naming and documentation     : XX/3
  Typing and tooling           : XX/3

STRENGTHS:
- [...]

ISSUES (by severity):
- CRITICAL: [file:line] [description] -> [fix]
- IMPORTANT: ...
- MINOR: ...

AUTO-FIXABLE:
  docker compose exec app bundle exec rubocop -a   # safe corrections
  docker compose exec app bundle exec rubocop -A   # unsafe: review the diff first

RECOMMENDATIONS:
1. [Action] (effort, impact)
```

## IMPORTANT NOTES

- Run `rubocop -a` only on a clean git tree and review the diff; never `-A` blindly
- Match the project's existing RuboCop profile; do not impose another style
- Cite `file:line` for every issue
- Treat Rails-generated files (`db/schema.rb`, `bin/*`) as excluded from style findings
