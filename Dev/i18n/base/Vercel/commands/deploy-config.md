---
description: Detect the project's Vercel deployment shape and generate or validate a tailored vercel.json
argument-hint: "[--check] [--force]"
---

# Vercel Deploy Config

You are an expert Vercel deployment-configuration specialist. Detect the current project's shape by inspecting the repo, then generate or validate a `vercel.json` tailored to that shape.

> Vercel is a **deployment platform**, not a framework. This command only produces platform-level config (`vercel.json` keys). If a supported claude-craft framework stack is detected, its own build/routing/rendering config is left untouched — this command defers to it and adds only the Vercel-platform-level keys the framework doesn't already own. This is **not** a scaffold-from-npm-template wrapper (contrast with Vite's `scaffold-project`) — it inspects and adjusts an existing project, it does not create one from scratch.

## ARGUMENTS

$ARGUMENTS

- `--check`: Validate the existing `vercel.json` against the detected shape and report drift, without writing any file
- `--force`: Skip the overwrite-confirmation step (only honor this if the user explicitly requested it in the same turn — never assume it)

## Plan Mode

> **Plan mode is mandatory.** Before generating or modifying anything, Claude activates plan mode to present: the detected project shape, the detected framework (if any) and what it defers to it, the exact `vercel.json` sections it intends to add or change, and any assumption it is making due to ambiguous signals. The user confirms before a single byte is written.

## MISSION

1. Detect the project's shape and any owning framework stack
2. State assumptions explicitly before generating anything (Karpathy principle, rule 23) — never guess silently
3. Generate or validate `vercel.json` using `templates/vercel.json.template` as the base skeleton, keeping only the sections the detected shape needs
4. Never overwrite an existing `vercel.json` without explicit confirmation
5. Never invent a `regions` or `functions.maxDuration`/`memory` value not asked for — omit rather than guess (YAGNI, rule 05)

## STEP 1: Detect Project Shape

Inspect the repository for these signals:

| Signal | Check | Implies |
|---|---|---|
| `api/` directory with `*.ts`/`*.js` files | `Glob api/**/*.{ts,js}` | Serverless Functions shape |
| `api/cron/` directory | `Glob api/cron/**/*.{ts,js}` | Cron + Scheduled shape |
| `middleware.ts` at project root | `Glob middleware.ts` | Middleware present — audit its matcher and logic separately |
| Existing `vercel.json` | `Glob vercel.json` | Config already present — validate/diff, never blind-overwrite |
| Framework config files | `next.config.*`, `angular.json`, `vue.config.*`/`vite.config.*` + `vue` dependency, `vite.config.*` + `react`/`@vitejs/plugin-react` dependency | A claude-craft framework stack owns build/routing — defer to its own tooling doc |
| No `api/`, no framework config | — | Static + Rewrites shape only |

Report the detected shape(s) explicitly before proceeding — a project can combine shapes (e.g. Functions + Cron).

## STEP 2: State Assumptions Explicitly

Before generating or modifying `vercel.json`, state out loud (in the plan-mode summary):
- Which shape(s) were detected and from which concrete file(s)/signal(s)
- Which framework stack, if any, was detected and what it is assumed to own
- Any signal that was ambiguous (e.g. `api/` exists but every handler looks unused) — surface the confusion rather than guessing (Karpathy principle, rule 23)

If the detected framework stack already reads or writes a `vercel.json` key at build time (several frameworks auto-populate `functions` or `regions`), state that explicitly and exclude that key from the generated output.

## STEP 3: Generate or Validate

### If no `vercel.json` exists

Generate one from `templates/vercel.json.template`, keeping only the sections matching the detected shape(s):

| Detected shape | Sections to include |
|---|---|
| Static + Rewrites only | `rewrites`, `headers` |
| Serverless Functions | + `functions` |
| Cron + Scheduled | + `crons` |
| ISR-enabled (framework-owned) | + `regions` only if a concrete latency/data-residency need is stated by the user |

Do not add `functions.memory`/`maxDuration` values beyond the template's placeholders unless the user specifies a concrete requirement. Do not add `regions` speculatively.

### If `vercel.json` already exists

Never overwrite it silently:
1. Read the existing file and diff it against what the detected shape would produce
2. Report the diff (missing sections, drifted values, deprecated keys)
3. Ask for explicit confirmation before writing any change, unless `--force` was requested by the user in the same turn
4. With `--check`, stop here and report only — no write under any circumstance

### Framework Deferral

If a claude-craft framework stack is detected, only add platform-level keys it does not already own:
- Do **not** add `rewrites`/`redirects` that duplicate the framework's own router
- Do **not** add a `functions` entry for a route the framework's adapter already configures
- Point the user to that stack's own `06-tooling.md` for anything routing/rendering/build related

## OUTPUT FORMAT

```
══════════════════════════════════════════════════════════════
VERCEL DEPLOY CONFIG
══════════════════════════════════════════════════════════════

🔎 DETECTED SHAPE(S)
──────────────────────────────────────────────────────────────
[✓] Serverless Functions — api/webhooks/stripe.ts, api/health.ts
[✓] Cron + Scheduled — api/cron/send-digest.ts
[ ] ISR-enabled — no framework-level ISR signal found
[ ] Static + Rewrites only — N/A (Functions present)

🧩 FRAMEWORK DETECTION
──────────────────────────────────────────────────────────────
Detected: React (vite.config.ts + @vitejs/plugin-react)
Deferred to: /react:* stack's own 06-tooling.md for build/routing config
Vercel-platform keys added here: functions, crons only

📄 EXISTING vercel.json
──────────────────────────────────────────────────────────────
Status: FOUND — diffing against detected shape
Drift:
- Missing `crons` entry for api/cron/send-digest.ts
- `functions["api/webhooks/*.ts"].memory` unset (recommend confirming a value)

⚠️ ASSUMPTIONS STATED
──────────────────────────────────────────────────────────────
- Assuming api/webhooks/stripe.ts is the only high-memory handler; no
  other handler showed evidence of needing non-default memory/duration.
- No regions value added — no latency/data-residency requirement was
  stated; ask before adding one.

📝 PROPOSED CHANGES (awaiting confirmation)
──────────────────────────────────────────────────────────────
[diff of vercel.json]

══════════════════════════════════════════════════════════════
```

## PROCESS

1. Detect shape(s) via the signals in Step 1
2. Detect any owning framework stack and what it already covers
3. State all assumptions explicitly (Step 2) in the plan-mode summary
4. If `vercel.json` exists: diff, report, request confirmation (or stop if `--check`)
5. If it does not exist: generate from `templates/vercel.json.template`, restricted to the detected shape's sections only
6. Never add a `regions`/`maxDuration`/`memory` value beyond the template placeholder without an explicit, stated reason
7. Report the final state and any follow-up validation command (`npm run lint:vercel-config`)
