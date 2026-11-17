---
name: paperclip-onboarding
description: Onboard a Paperclip instance — install, bootstrap CEO operator, create a company via dashboard, hire the first agent, install a plugin. Use when bootstrapping or wiring Claude Code into Paperclip.
---

# Paperclip Onboarding

1. `npx paperclipai onboard --yes` (or clone + `pnpm install && pnpm dev`).
2. `paperclipai doctor` — fix any hard failures.
3. `paperclipai auth-bootstrap-ceo` — create the initial operator account.
4. Sign into the dashboard (default `http://localhost:3100`) and create the company, or import one with `paperclipai company import`.
5. Confirm available adapters (`claude_local`, `codex_local`, `cursor_local`, `gemini_local`, `opencode_local`, `openclaw_gateway`, `pi_local`) are registered.
6. Hire the first agent via dashboard (**Agents → Hire**) or `POST /companies/:companyId/agents`.
7. Optional: install a plugin with `paperclipai plugin install <package>` then `paperclipai plugin enable <key>`.
8. Commit a repo-local `.paperclip/` directory with runbook and onboarding notes (no secrets, no `BETTER_AUTH_SECRET`).

See ../../commands/setup-company.md for the full procedure.
