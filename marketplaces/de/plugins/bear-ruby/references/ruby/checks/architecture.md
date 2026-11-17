# Check Ruby / Rails Architecture

## Arguments

$ARGUMENTS (optional: path to project to analyze)

## Plan Mode

> Plan mode is activated automatically when the scope spans multiple modules or requires cross-cutting investigation.

## MISSION

Audit the architecture of the Rails application (Rails 8.1, Ruby 4.0). Stance: **Rails Way first**. Conventions are the default architecture; extract service, form, query or policy objects only when a model or controller grows beyond a readable size ("pragmatic Clean"). Hexagonal layering is NOT required and must not be scored.

All commands run in Docker (`docker compose exec app ...`).

### Step 1: Project Structure (5 points)

```bash
docker compose exec app ls app/ config/ db/ lib/
docker compose exec app bin/rails about
docker compose exec app bin/rails stats
docker compose exec app bin/rails routes --unused | head -50
```

Checklist:
- [ ] Standard Rails layout (`app/models`, `app/controllers`, `app/views`, `app/jobs`, `app/mailers`)
- [ ] Extra objects live under `app/` (for example `app/services`, `app/queries`, `app/forms`, `app/policies`) so Zeitwerk autoloads them
- [ ] No business code in `lib/` unless it is a genuinely framework-independent library
- [ ] `config/routes.rb` uses `resources` and shallow nesting (max 1 level)
- [ ] Rails 8 defaults respected unless a documented ADR says otherwise (Propshaft, importmap or a JS bundler, Solid Queue/Cache/Cable, Kamal)

Detect anti-patterns:

```bash
# Non-RESTful custom routes
docker compose exec app grep -nE "^\s*(get|post|put|patch|delete) " config/routes.rb | head -30
# Deep nesting
docker compose exec app grep -nE "resources .* do" config/routes.rb
```

**Scoring**: 5 pts, minus 1 per violation (min 0).

### Step 2: Thin Controllers (6 points)

Controllers coordinate: authenticate, authorize, load, call, respond. No business rules.

```bash
# Largest controllers
docker compose exec app sh -c 'find app/controllers -name "*.rb" | xargs wc -l | sort -rn | head -10'
# Query building or business logic in controllers
docker compose exec app grep -rnE "\.(where|joins|includes|group|order)\(" app/controllers | head -30
# Transactions or bulk writes in controllers
docker compose exec app grep -rnE "transaction do|\.update_all|\.delete_all" app/controllers | head
```

Checklist:
- [ ] Actions are <= 10 lines (target 7)
- [ ] Only the 7 REST actions per controller; extra behavior becomes a new resource controller
- [ ] Strong parameters (`params.expect` on Rails 8, or `require(...).permit(...)`) in a private method
- [ ] Authorization on every action (`before_action`, Pundit, CanCanCan or equivalent)
- [ ] Concerns used for cross-cutting behavior only, not as a dumping ground
- [ ] `respond_to` / Turbo Stream responses handled explicitly

**Scoring**: 6 pts. Deduct 1 per controller with an action > 15 lines or query-building logic, max -6.

### Step 3: Model Design and Object Extraction (6 points)

```bash
docker compose exec app sh -c 'find app/models -name "*.rb" | xargs wc -l | sort -rn | head -10'
docker compose exec app grep -rnE "^\s*(before|after|around)_(save|create|update|destroy|commit)" app/models | wc -l
docker compose exec app grep -rnE "Net::HTTP|Faraday|HTTParty|deliver_" app/models | head
docker compose exec app ls app/services app/queries app/forms app/policies
```

Checklist:
- [ ] Models contain associations, validations, scopes, and domain behavior; no HTTP calls or mail delivery in callbacks
- [ ] Callbacks limited to data normalization; side effects moved to jobs or service objects
- [ ] Models over 200 lines have extracted concerns (cohesive) or objects
- [ ] Service objects have a single public method (`call`), return a result, no hidden state
- [ ] Form objects (`ActiveModel::Model`) for multi-model forms
- [ ] Query objects or scopes for complex reads; no raw SQL fragments scattered across controllers
- [ ] Enums and value types declared with `enum` / `attribute` rather than magic strings
- [ ] No God objects: a class named `Manager`, `Helper` or `Processor` with many unrelated methods is a smell

**Scoring**: 6 pts. Deduct 1 per god model (> 400 lines), 1 per side-effect callback pattern, 1 per service with more than one responsibility.

### Step 4: Data Layer (4 points)

```bash
docker compose exec app bin/rails db:migrate:status | tail -20
docker compose exec app grep -cE "add_foreign_key|add_index|null: false" db/schema.rb
# N+1 detection tooling
docker compose exec app grep -nE "bullet|prosopite|strong_migrations" Gemfile
# Foreign key columns (verify each has an index and a foreign key)
docker compose exec app grep -nE "_id\"" db/schema.rb | head -30
```

Checklist:
- [ ] Every `_id` column has an index and a database foreign key
- [ ] `null: false`, unique indexes and check constraints mirror model validations
- [ ] Migrations are reversible and safe (`strong_migrations` if used); no data backfill inside schema migrations
- [ ] `schema.rb` (or `structure.sql`) committed and in sync (`bin/rails db:migrate` produces no diff)
- [ ] N+1 prevented via `includes` / `preload` / `strict_loading`; Bullet or Prosopite in development/test
- [ ] Multi-row writes wrapped in `transaction`; optimistic locking (`lock_version`) where concurrent edits matter
- [ ] Rails 8 Solid databases (`queue`, `cache`, `cable`) configured in `config/database.yml` when used

**Scoring**: 4 pts, minus 1 per failed group above (integrity, migrations, N+1, transactions).

### Step 5: Jobs, Cache, Realtime (2 points)

```bash
docker compose exec app ls app/jobs
docker compose exec app grep -rnE "queue_adapter|solid_queue|solid_cache|solid_cable" config
docker compose exec app grep -rnE "perform_later|deliver_later" app | wc -l
```

Checklist:
- [ ] Anything slower than ~200 ms in a request is moved to Active Job (`perform_later`)
- [ ] Jobs are idempotent and take IDs or GlobalID, not large serialized objects
- [ ] Retry policy declared (`retry_on`, `discard_on`); failures are observable
- [ ] Production queue/cache/cable backend configured (Solid Queue/Cache/Cable by default in Rails 8)
- [ ] Fragment caching or `Rails.cache.fetch` with explicit keys and expiry on hot paths

**Scoring**: 2 pts (1 for jobs hygiene, 1 for caching/realtime config).

### Step 6: Autoloading and Dependency Direction (2 points)

```bash
docker compose exec app bin/rails zeitwerk:check
docker compose exec app grep -rnE "^\s*(require|require_relative) " app | head
docker compose exec app grep -rnE "ENV\[" app/models | head
```

Checklist:
- [ ] `bin/rails zeitwerk:check` passes ("All is good!")
- [ ] No `require` / `require_relative` of application files inside `app/`
- [ ] Models do not depend on controllers or request state; `Current` attributes used sparingly
- [ ] Engines or namespaces (`app/models/billing/...`) delimit large domains; cross-domain calls go through public methods
- [ ] Configuration read through `Rails.configuration` / `config_for` / credentials, not scattered `ENV[]`

**Scoring**: 2 pts (1 for Zeitwerk, 1 for dependency direction).

## OUTPUT FORMAT

```
RUBY / RAILS ARCHITECTURE AUDIT
===============================

SCORE: XX/25

Rails: X.Y.Z   Ruby: X.Y.Z   Models: N   Controllers: N   Service objects: N

SUB-SCORES:
  Structure and conventions    : XX/5
  Thin controllers             : XX/6
  Model design / extraction    : XX/6
  Data layer                   : XX/4
  Jobs, cache, realtime        : XX/2
  Autoloading / dependencies   : XX/2

STRENGTHS:
- [...]

ISSUES (by severity):
- CRITICAL: [file:line] [description] -> [fix]
- IMPORTANT: ...
- MINOR: ...

RECOMMENDATIONS:
1. [Action] (effort: Low/Medium/High, impact: Low/Medium/High)
2. ...
```

## IMPORTANT NOTES

- Findings must cite `file:line` and propose a concrete refactoring (for example "extract an `Orders::Place` service from `OrdersController#create`")
- Do not recommend new abstractions when the code is small and readable (YAGNI)
- Fat models are acceptable when cohesive; split by responsibility, not by line count alone
- Never run destructive tasks (`db:drop`, `db:reset`) during an audit
