# Quality Tools — Paperclip

Static analysis, type checking, and CI gates that keep Paperclip contributions healthy.

## Required Tools

| Tool | Purpose | Gate |
|---|---|---|
| `tsc --noEmit` | Type correctness | Fail CI on error |
| ESLint flat config | Lint (typed rules) | Fail CI on error, warnings allowed ≤ 0 |
| Prettier | Formatting | Fail CI on diff |
| Vitest + v8 coverage | Tests + coverage | Fail CI below thresholds |
| knip | Dead code / unused exports | Warn in CI, fix before release |
| `pnpm audit` (high/critical) | Vulnerable deps | Fail CI on high / critical |
| commitlint | Conventional Commits | Fail CI on bad commit |

Optional but recommended: **Stryker** mutation testing on core modules (agents, approvals, costs) — target mutation score ≥ 70%.

---

## Cognitive Complexity

Source: SonarJS plugin or `eslint-plugin-sonarjs`.

- Function limit: **< 10** (warn at 8).
- File limit: **< 200** (warn at 150).

Over the limit → refactor, don't silence.

---

## TypeScript Strictness Ratchet

Baseline `tsconfig.base.json` must keep these ON:

```
"strict": true,
"noUncheckedIndexedAccess": true,
"noImplicitOverride": true,
"exactOptionalPropertyTypes": true,
"noFallthroughCasesInSwitch": true,
"noImplicitReturns": true
```

Per-package `tsconfig.json` may narrow further but never loosen.

---

## ESLint — Non-Negotiable Rules

```js
rules: {
  '@typescript-eslint/no-explicit-any': 'error',
  '@typescript-eslint/no-floating-promises': 'error',
  '@typescript-eslint/no-misused-promises': 'error',
  '@typescript-eslint/consistent-type-imports': 'error',
  '@typescript-eslint/explicit-module-boundary-types': 'error',
  '@typescript-eslint/no-unnecessary-condition': 'error',
  '@typescript-eslint/switch-exhaustiveness-check': 'error',
  'no-restricted-syntax': ['error', {
    selector: "TSAsExpression[typeAnnotation.typeName.name='any']",
    message: 'No casts to any. Model the type properly.',
  }],
}
```

---

## CI Pipeline

```yaml
- pnpm install --frozen-lockfile
- pnpm format --check           # Prettier
- pnpm lint                     # ESLint
- pnpm typecheck                # tsc --noEmit
- pnpm test --coverage          # Vitest
- pnpm build                    # Ensures no build-only breakage
- pnpm knip                     # Dead code (warn)
- pnpm audit --prod --audit-level=high
```

Any failing step blocks merge. No "overrides" except via a PR labelled `tech-debt` with an issue linked.

---

## Coverage Thresholds

Enforced in `vitest.config.ts`:

- Lines: 80
- Functions: 80
- Branches: 75
- Statements: 80

Per module target (stricter): agents, approvals, costs, adapters → 90%.

---

## Dependency Hygiene

- `pnpm up -iL`  weekly (patch/minor only without PR review).
- Major bumps = dedicated PR with migration notes.
- Renovate or Dependabot configured with grouped PRs.
- Peer-dep drift rejected (`pnpm install` must be clean).

---

## Release Gate

Before cutting a release:

- [ ] `pnpm ci` green on main for last 10 commits
- [ ] No `TODO: remove before release` in the diff
- [ ] CHANGELOG updated (Keep a Changelog)
- [ ] Adapter contract tests pass for all shipped adapters
- [ ] `pnpm audit` clean at `high` level
- [ ] Migration guide written if any DB migration or API break

---

## Checklist

- [ ] ESLint flat config with strict-type-checked
- [ ] `tsc --noEmit` passes across workspaces
- [ ] Coverage thresholds enforced in CI
- [ ] knip reports resolved before release
- [ ] `pnpm audit` green at `high`
- [ ] Commitlint enabled

---

**Last updated:** 2026-04 | **Version:** 1.0.0 | **Author:** The Bearded CTO
