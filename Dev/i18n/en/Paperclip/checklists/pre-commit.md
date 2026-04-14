# Pre-Commit Checklist — Paperclip

## Quick Validation Before Each Commit

### Code Quality

- [ ] `pnpm format --check` passes
- [ ] `pnpm lint` passes (0 errors, 0 warnings)
- [ ] `pnpm typecheck` passes across workspaces
- [ ] No `any`, no `as any`, no `// @ts-ignore`
- [ ] No `console.log` / `debugger` in runtime code
- [ ] No unused exports (run `pnpm knip` locally)

### Tests

- [ ] `pnpm test --changed` passes
- [ ] New feature → new test(s) added
- [ ] Bug fix → regression test added
- [ ] Adapter change → `contract.test.ts` still green

### Governance & Security

- [ ] No governance decision added to any adapter (`adapters/**`)
- [ ] Every new DB mutation emits an activity event
- [ ] No `companyId` coming from client body/query
- [ ] No secret value hard-coded
- [ ] Logs don't expose secrets, tokens, or full bodies

### Build

- [ ] `pnpm build` succeeds
- [ ] No new deprecation warnings

### Docs

- [ ] OpenAPI spec updated for new/changed routes
- [ ] Adapter README updated if the supported actions changed
- [ ] CHANGELOG entry under `## Unreleased`

### Git

- [ ] Commit message follows Conventional Commits (`feat(adapters): …`, `fix(approvals): …`)
- [ ] Branch rebased on `main`
- [ ] No leftover `TODO: remove` or `console.log` debug statements
- [ ] `.env` is not staged

## Automated Validation

`package.json`:

```jsonc
{
  "simple-git-hooks": {
    "pre-commit": "pnpm lint-staged",
    "commit-msg": "npx --no-install commitlint --edit \"$1\"",
    "pre-push": "pnpm typecheck && pnpm test --changed"
  },
  "lint-staged": {
    "*.{ts,tsx}": ["eslint --fix", "prettier --write", "vitest related --run"],
    "*.{json,md,yaml,yml}": ["prettier --write"]
  }
}
```

## Quick Commands

```bash
pnpm lint
pnpm lint --fix
pnpm typecheck
pnpm test --changed
pnpm format
pnpm audit --audit-level=high
```

## Common Issues

### "Test requires a real DB" in CI
Use testcontainers or spin up Postgres in the workflow — never mock the DB in integration tests.

### "Adapter contract test fails"
Don't lower the suite's expectations. Fix the adapter. The suite IS the contract.

### "Activity log entry missing"
Add `this.activity.emit({ event: '<domain>.<action>', ... })` in the service after the successful mutation.

## Before Push

- [ ] All commits follow Conventional Commits
- [ ] Branch rebased on `main`
- [ ] CI will be green (lint + typecheck + test + build)
- [ ] Adapter contract tests pass locally for any touched adapter

## Notes

- Keep commits small and focused
- Never skip hooks (`--no-verify`) — if a hook fails, fix the cause
- Governance bugs are production incidents, not warnings — treat them with urgency
