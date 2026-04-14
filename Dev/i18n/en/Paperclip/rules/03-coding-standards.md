# Coding Standards — Paperclip (TypeScript)

## Language & Versions

| Item | Standard |
|---|---|
| Node.js | 20+ (LTS) |
| TypeScript | 5.x |
| Package manager | pnpm 9.15+ (workspace monorepo) |
| Module system | ESM only (`"type": "module"`) |

---

## TypeScript

Strict mode is **mandatory**. `tsconfig.base.json`:

```jsonc
{
  "compilerOptions": {
    "target": "ES2023",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true,
    "exactOptionalPropertyTypes": true,
    "isolatedModules": true,
    "verbatimModuleSyntax": true,
    "skipLibCheck": true
  }
}
```

**Forbidden:** `any`, `as unknown as X` casts without a comment explaining why, `// @ts-ignore`, `// @ts-expect-error` without a linked issue.

**Required:** explicit return types on exported functions, `readonly` on props / domain types, discriminated unions for variant types.

---

## Naming

| Kind | Convention | Example |
|---|---|---|
| Files | kebab-case | `agent-registry.ts`, `approval-service.ts` |
| Directories | kebab-case | `src/modules/approvals/` |
| Types / Interfaces | PascalCase | `AgentConfig`, `HeartbeatPayload` |
| React components | PascalCase (file + symbol) | `OrgChart.tsx` exports `OrgChart` |
| Functions / variables | camelCase | `reportCost`, `isApproved` |
| Constants | UPPER_SNAKE_CASE | `DEFAULT_BUDGET_TOKENS`, `HEARTBEAT_INTERVAL_MS` |
| Env vars | UPPER_SNAKE_CASE, prefixed | `PAPERCLIP_DATABASE_URL`, `PAPERCLIP_SECRET_KEY` |
| DB tables | snake_case plural | `activity_log`, `agent_registrations` |
| Domain events | `PastTense` | `AgentHired`, `BudgetExceeded` |

**No prefixes/suffixes:** don't write `IAgent` or `AgentType` — write `Agent`. Use `Props`, `State`, `Result` as explicit suffixes only when they clarify (`LoginFormProps`, `AgentsQueryResult`).

---

## Files

- One public export per file preferred. A module can export multiple symbols when they form a cohesive unit (e.g. `agent-service.ts` exports `AgentService` + its DTOs).
- File length target: **< 300 lines**. Over that, split by responsibility.
- Order inside a file:
  1. Imports (external → internal → relative)
  2. Types / interfaces
  3. Constants
  4. Public exports
  5. Private helpers

---

## Imports

- Absolute imports within a package using TS path aliases (`@/modules/...`).
- Relative imports only for sibling files inside the same folder.
- No barrel files (`index.ts`) except at package boundaries — they break tree-shaking and circular-dep detection.
- Named imports only; no default exports except for React components required by frameworks.

---

## Error Handling

Two accepted styles — pick one per module and stay consistent:

1. **Thrown `DomainError`** — preferred for server services.
   ```ts
   export class BudgetExceededError extends DomainError {
     readonly code = 'BUDGET_EXCEEDED';
     constructor(public readonly agentId: string, public readonly limit: number) {
       super(`Agent ${agentId} exceeded budget (${limit} tokens)`);
     }
   }
   ```

2. **`Result<T, E>` type** — preferred for adapter code and edge paths where throwing crosses process boundaries.

**Never:**
- Swallow errors with empty `catch {}` blocks.
- Throw strings or plain objects.
- Re-wrap an error and lose the original `cause` (always pass `{ cause: err }`).

---

## React (web UI)

- Functional components only. No class components.
- Typed props via `readonly`, no `React.FC`.
- Hooks named `useX`, one responsibility each.
- Derive state; don't mirror it. No useState that duplicates props or server data.
- Server state lives in React Query (or equivalent). Client state in a minimal store (Zustand or React context).
- **UI is dumb**: no governance decisions in the browser. Approval, budget, and permission checks round-trip to the server.

---

## Async

- `async`/`await` only. No raw `.then()` chains.
- All async boundaries that can fail return typed errors or throw `DomainError`.
- No unhandled promises — always `await`, `.catch`, or `void` (with a comment if intentional).
- Timeouts are explicit (`AbortController`); no indefinite waits.

---

## Logging

- Structured JSON logs (pino or equivalent).
- Log **events**, not strings: `log.info({ agentId, event: 'agent.hired' })`.
- Never log secrets, raw API keys, or full request bodies containing PII.
- Every mutation logs an `activity_log` event (domain-level); OS-level logs are for diagnostics only.

---

## Configuration

- All config via env vars, loaded through a typed parser (zod) at boot.
- No config reads at request time — inject the resolved config.
- Paperclip injects `PAPERCLIP_WORKSPACE_*` and `PAPERCLIP_RUNTIME_*` into spawned agent processes for agent-side tooling; keep that prefix for any agent-facing vars you add.

### Canonical env vars (observed in `.env.example`)

| Name | Purpose |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string. Omit → embedded Postgres (dev only). |
| `PORT` | HTTP port for the server (default `3100`). |
| `SERVE_UI` | `true` to have the server also serve the built UI bundle. |
| `BETTER_AUTH_SECRET` | Secret for [Better Auth](https://better-auth.com). **Must be rotated per environment.** |

Plugin / adapter config lives **inside** the plugin or adapter package, not in top-level env. Reference your own env vars from your plugin's `configSchema` (zod) rather than reading `process.env` at runtime.

---

## Linting & Formatting

- ESLint flat config (`eslint.config.js`) with `@typescript-eslint/strict-type-checked`.
- Prettier for formatting (no `semi: false` — keep semicolons).
- Enforced in CI + pre-commit hook.

---

## Checklist

- [ ] `strict: true` + `noUncheckedIndexedAccess` active
- [ ] No `any`, no silent casts
- [ ] Explicit return types on exported functions
- [ ] Kebab-case files, PascalCase types, camelCase vars
- [ ] One responsibility per file, < 300 lines
- [ ] Structured logs, no secrets in logs
- [ ] All async awaited or explicitly `void`ed
- [ ] ESLint + Prettier pass

---

**Last updated:** 2026-04 | **Version:** 1.0.0 | **Author:** The Bearded CTO
