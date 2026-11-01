# Pre-Commit Checklist - Ruby / Rails

## Quick Validation Before Each Commit

All commands run in Docker (`docker compose exec app ...`). The fastest full gate is `bin/ci` (Rails 8.1), which runs the steps defined in `config/ci.rb`.

### Code Quality

- [ ] RuboCop clean (`bin/rubocop`, or `bundle exec rubocop`)
- [ ] Auto-correct applied only for safe cops (`rubocop -a`) and the diff reviewed
- [ ] `# frozen_string_literal: true` present in new Ruby files
- [ ] No unused `require`, dead code, or commented-out code
- [ ] No `binding.irb`, `byebug`, `debugger`, `puts`, `pp` left behind
- [ ] Methods < 10 lines (limit 20), nesting <= 3, parameters <= 4

### Tests

- [ ] All tests pass (`bundle exec rspec` or `bin/rails test`)
- [ ] System tests pass for touched user journeys (`bin/rails test:system` or `bundle exec rspec spec/system`)
- [ ] New behavior has tests written first (Red, Green, Refactor)
- [ ] Bug fixes include a regression test that failed before the fix
- [ ] Coverage maintained at 80% or higher (SimpleCov)
- [ ] No skipped or pending tests added without a ticket

### Security

- [ ] Brakeman clean (`bin/brakeman --no-pager -q`)
- [ ] `bundle exec bundler-audit check --update` reports no advisories
- [ ] No hardcoded secrets; `config/master.key` and `.env` not staged
- [ ] Strong parameters on new controller actions (no `permit!`)
- [ ] No string interpolation in `where`, `order`, or raw SQL fragments
- [ ] No new `html_safe` / `raw` on user-provided data
- [ ] New actions authorized (and rate limited when they authenticate or send mail)

### Database

- [ ] Migration is reversible, has indexes and foreign keys, and `db/schema.rb` is updated
- [ ] No data backfill mixed into the schema migration
- [ ] `bin/rails db:migrate` then `db:rollback` then `db:migrate` works locally
- [ ] N+1 checked on new queries (`includes`, `preload`, `strict_loading`, Bullet)

### Dependencies

- [ ] `Gemfile.lock` committed and consistent (`bundle check`)
- [ ] New gems justified (maintained, license compatible, no overlap with Rails built-ins)

### Documentation and Git

- [ ] README / docs updated when behavior or setup changed
- [ ] CHANGELOG updated if applicable
- [ ] Commit message follows Conventional Commits (`feat(orders): add refund endpoint`)
- [ ] Commit is atomic; branch up to date with `main`
- [ ] No unrelated files staged (`git status`, `git diff --staged`)

## Automated Validation

### Rails 8.1 `bin/ci`

```ruby
# config/ci.rb
CI.run do
  step "Setup", "bin/setup --skip-server"
  step "Style: Ruby", "bin/rubocop"
  step "Security: Gem audit", "bin/bundler-audit"
  step "Security: Brakeman", "bin/brakeman --quiet --no-pager --exit-on-warn --exit-on-error"
  step "Tests: Rails", "bin/rails test"
  step "Tests: System", "bin/rails test:system"
end
```

Run it in the container:

```bash
docker compose exec app bin/ci
```

### Git pre-commit hook (Lefthook)

```yaml
# lefthook.yml
pre-commit:
  parallel: true
  commands:
    rubocop:
      glob: "*.rb"
      run: docker compose exec -T app bundle exec rubocop --force-exclusion {staged_files}
    brakeman:
      glob: "{app,config,lib}/**/*.rb"
      run: docker compose exec -T app bin/brakeman --no-pager -q
pre-push:
  commands:
    tests:
      run: docker compose exec -T app bin/rails test
```

Replace `bin/rails test` with `bundle exec rspec` on RSpec projects. Hooks are requirements, CLAUDE.md is a suggestion.

## Quick Commands

```bash
docker compose exec app bin/rubocop -a
docker compose exec app bin/brakeman --no-pager -q
docker compose exec app bundle exec bundler-audit check --update
docker compose exec app bin/rails test        # or: bundle exec rspec
docker compose exec app bin/rails zeitwerk:check
docker compose exec app bin/ci
```

## Final Check

If any box is unchecked, do not commit. Fix first, then re-run `bin/ci`.
