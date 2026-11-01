# New Feature Development Checklist - Ruby / Rails

## Before Starting

- [ ] Feature discussed and validated with the team
- [ ] Acceptance criteria written (Given/When/Then)
- [ ] Assumptions stated explicitly (inputs, invariants, volume, authorization)
- [ ] API contract defined if exposed (OpenAPI 3.x, error format RFC 9457)
- [ ] Database changes identified (tables, columns, indexes, constraints)
- [ ] Impact analysis done: files touched, breaking changes, rollback plan
- [ ] Feature flag decided for risky changes (Flipper or equivalent)

## Development (TDD: Red, Green, Refactor)

### Design (Rails Way first)

- [ ] Start with conventional Rails: model, `resources` route, RESTful controller, views
- [ ] New behavior modeled as a resource (`resources :refunds`) rather than a custom action
- [ ] Extract a service/form/query object only when a model or controller action grows unwieldy (YAGNI)
- [ ] No speculative abstractions, options, or parameters

### Model Layer

- [ ] Validations match database constraints (`null: false`, unique index, check constraint)
- [ ] Associations declare `dependent:` and `inverse_of` where needed
- [ ] Scopes are chainable and named for intent
- [ ] Enums defined with explicit values (`enum :status, { pending: 0, paid: 1 }`)
- [ ] Callbacks limited to data normalization; side effects in jobs or services
- [ ] Sensitive attributes encrypted (`encrypts :field`)

### Database

- [ ] Migration generated with `bin/rails generate migration` and is reversible
- [ ] Foreign keys and indexes on every reference
- [ ] Large-table changes done safely (concurrent index, backfill in a separate step)
- [ ] `db/schema.rb` committed

### Controller and Routes

- [ ] Only REST actions; thin actions (<= 10 lines)
- [ ] Strong parameters via `params.expect(...)` (Rails 8) or `require/permit`
- [ ] Authentication and authorization enforced; records loaded through the current user's scope
- [ ] `rate_limit` added on sensitive endpoints (login, password reset, expensive operations)
- [ ] Turbo-friendly responses (`redirect_to` with `status: :see_other` after mutations, `turbo_stream` where useful)
- [ ] Errors rendered consistently (422 for validation, 404 for missing, 403 for forbidden)

### Views and Hotwire

- [ ] Partials and components small and reusable; no logic in templates
- [ ] Turbo Frames/Streams used for partial updates before reaching for custom JavaScript
- [ ] Stimulus controllers small, one concern each
- [ ] Output escaped by default; no `html_safe` on user input
- [ ] Accessibility checked (labels, focus order, contrast)
- [ ] I18n keys used for user-visible text (`t(".title")`)

### Background Work

- [ ] Operations > 200 ms moved to Active Job
- [ ] Jobs idempotent, take GlobalID/IDs, declare `retry_on` / `discard_on`
- [ ] Queue configured (Solid Queue by default in Rails 8) and monitored

### Code Quality

- [ ] RuboCop passes (`bin/rubocop`)
- [ ] `# frozen_string_literal: true` in new files
- [ ] Naming explicit; comments explain WHY
- [ ] Types added if the project uses RBS/Steep or Sorbet, and the checker passes

## Testing

- [ ] Model tests: validations, associations, scopes, domain methods
- [ ] Service/form/query object tests: success and each failure path
- [ ] Request (integration) tests for every new endpoint, including unauthenticated and unauthorized cases
- [ ] System test (Capybara) for the main user journey
- [ ] Job and mailer tests where added
- [ ] Factories (or fixtures) added and minimal
- [ ] Coverage stays >= 80%; time frozen with `travel_to`; external HTTP stubbed

## Security

- [ ] Brakeman clean; bundler-audit clean
- [ ] No string interpolation in SQL; no `permit!`
- [ ] IDOR checked: users cannot reach other users' or tenants' records
- [ ] Secrets in credentials, not in code
- [ ] New logs do not contain sensitive data (`filter_parameters` updated)

## Performance

- [ ] No N+1 (`includes`, `preload`, `strict_loading`)
- [ ] Pagination on list endpoints (Pagy or Kaminari)
- [ ] Caching considered for hot reads (fragment cache, `Rails.cache.fetch`)
- [ ] Query plans checked for new heavy queries (`explain`)

## Documentation

- [ ] README or docs updated
- [ ] API documentation updated
- [ ] ADR written for significant decisions
- [ ] CHANGELOG entry added

## Before Merge

- [ ] `bin/ci` passes locally and in CI
- [ ] Self-review of the diff completed
- [ ] PR description explains the why, links the ticket, lists risks and rollback
- [ ] Reviewer approval received; squash merge with Conventional Commit title

## Deployment

- [ ] Migrations run before the new code starts (Kamal deploy hook or release step)
- [ ] Feature flag default set; rollback path verified
- [ ] Monitoring and alerts in place (error tracker, job queue depth)
- [ ] Smoke test after deploy (`/up` health check and the main flow)
