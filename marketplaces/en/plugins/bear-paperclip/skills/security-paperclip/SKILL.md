---
name: security-paperclip
description: Paperclip security — tenancy isolation, secrets, approval gates, hard budgets, signed adapter channel. Use when auditing or hardening Paperclip.
---

# Paperclip Security

`companyId` from session/path only (never client body); secrets encrypted at rest + redacted in logs + resolved via `ctx.secrets.resolve(ref)` in plugins; approval gates server-only and append-only; budgets are hard limits enforced at dispatch; Better Auth for operator auth with a rotated `BETTER_AUTH_SECRET`; CSP/HSTS/COOP/CORP shipped on UI; plugin capabilities declared minimally; `pnpm audit --audit-level=high` in CI.

See ../../rules/11-security-paperclip.md for detailed documentation.
