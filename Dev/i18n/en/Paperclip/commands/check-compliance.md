---
description: Check Complete Paperclip Compliance
argument-hint: [project-path]
---

# Check Complete Paperclip Compliance

## Arguments

$ARGUMENTS (optional: path to Paperclip project to analyze)

## MISSION

Perform a complete compliance audit of a Paperclip project by orchestrating the 4 major checks — Architecture, Code Quality, Tests, Security — plus the **Adapter Protocol** check which is specific to Paperclip. Produce a consolidated report with an overall score out of 100 points.

### Step 1: Audit Preparation

- [ ] Identify project path (`$ARGUMENTS` or current dir)
- [ ] Confirm it is a Paperclip workspace: check for `server/`, `ui/`, `cli/`, `packages/` (with `adapters/`, `plugins/sdk/`), `pnpm-workspace.yaml`, and `@paperclipai/*` entries
- [ ] Note Paperclip version (from installed `@paperclipai/plugin-sdk` or `paperclipai` CLI version)
- [ ] List adapters under `packages/adapters/*` and any plugins under `packages/plugins/examples/*` or external plugin repos

### Step 2: Architecture Audit (25 points)

Invoke `/paperclip:check-architecture`.

Evaluated criteria:
- Two-layer separation (control plane vs adapters) — 6 pts
- Module boundaries under `server/src/modules/` — 5 pts
- No governance logic inside adapters — 6 pts
- `shared/types` shape (pure types, no runtime) — 3 pts
- Activity log emitted on every mutation — 3 pts
- OpenAPI spec covers every route — 2 pts

### Step 3: Code Quality Audit (20 points)

Invoke `/paperclip:check-code-quality`.

Evaluated criteria:
- TypeScript strict + `noUncheckedIndexedAccess` — 5 pts
- No `any`, no silent casts — 4 pts
- ESLint flat config + Prettier pass — 3 pts
- Naming conventions (kebab files, PascalCase types, etc.) — 3 pts
- Cognitive complexity < 10 per function — 3 pts
- Structured logs, no secret leakage in logs — 2 pts

### Step 4: Testing Audit (20 points)

Invoke `/paperclip:check-testing`.

Evaluated criteria:
- Coverage ≥ 80% (lines, functions, statements) — 6 pts
- Adapter contract tests pass for every shipped adapter — 6 pts
- Integration tests hit a real PostgreSQL — 4 pts
- No `.only` / `.skip` in main — 2 pts
- Factories used over fixtures — 2 pts

### Step 5: Security Audit (20 points)

Invoke `/paperclip:check-security`.

Evaluated criteria:
- All endpoints tenant-scoped by `companyId` from session — 4 pts
- Secrets encrypted at rest, redacted in logs — 4 pts
- Approval gates server-side only, append-only events — 3 pts
- Budgets = hard limits (enforced in tests) — 3 pts
- Plugin capabilities declared minimally (no over-scoped `network` / `filesystem`) — 3 pts
- CSP + HSTS + COOP + CORP headers shipped — 2 pts
- `pnpm audit --audit-level=high` clean — 1 pt

### Step 6: Extension Audit (15 points)

Specific to Paperclip. Scopes both built-in adapters (`packages/adapters/*`) and plugins (`@paperclipai/plugin-sdk`).

Built-in adapters:
- Each adapter exports `type`, `label`, `models`, `agentConfigurationDoc` — 3 pts
- `type` is stable across versions (no rename after agents shipped) — 2 pts
- Server registration via `registerServerAdapter(...)` — 2 pts
- No governance logic inside the adapter (no budget / approval / permission math) — 3 pts

Plugins:
- Manifest declares minimum necessary capabilities — 2 pts
- Uses `ctx.secrets.resolve(ref)` instead of raw keys — 2 pts
- State persisted via `ctx.state` (scoped), not disk — 1 pt

### Step 7: Consolidated Report

Produce:

```
════════════════════════════════════════════════════════════════
📊 PAPERCLIP COMPLIANCE AUDIT — {PROJECT}
════════════════════════════════════════════════════════════════

Architecture        : {NN}/25
Code Quality        : {NN}/20
Testing             : {NN}/20
Security            : {NN}/20
Adapter Protocol    : {NN}/15
────────────────────────────────────────────────────────────────
TOTAL               : {NNN}/100   →   {Grade}

Grade scale: A (≥ 90), B (≥ 80), C (≥ 70), D (≥ 60), F (< 60)
```

For each failed criterion, list the file / symbol and a 1-line fix. Do not rewrite the code — surface the issues. End with a **top 5 remediation priorities** (highest impact / lowest effort first).

## Deliverable

A single markdown report. No silent failures. If a step cannot run (e.g. no adapters in the project), record "N/A" and redistribute points proportionally — note this explicitly at the top of the report.
