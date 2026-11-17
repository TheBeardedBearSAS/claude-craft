---
name: paperclip-onboarding
description: Onboarding einer Paperclip-Instanz — installieren, CEO-Operator bootstrappen, Company via Dashboard erstellen, ersten Agent einstellen, Plugin installieren. Verwenden Sie dies beim Bootstrapping oder Verdrahten von Claude Code in Paperclip.
---

# Paperclip-Onboarding

1. `npx paperclipai onboard --yes` (oder clone + `pnpm install && pnpm dev`).
2. `paperclipai doctor` — beheben Sie alle Hard-Failures.
3. `paperclipai auth-bootstrap-ceo` — erstellen Sie das initiale Operator-Konto.
4. Melden Sie sich im Dashboard an (Standard `http://localhost:3100`) und erstellen Sie die Company, oder importieren Sie eine mit `paperclipai company import`.
5. Bestätigen Sie, dass verfügbare Adapter (`claude_local`, `codex_local`, `cursor_local`, `gemini_local`, `opencode_local`, `openclaw_gateway`, `pi_local`) registriert sind.
6. Stellen Sie den ersten Agent via Dashboard ein (**Agents → Hire**) oder `POST /companies/:companyId/agents`.
7. Optional: Installieren Sie ein Plugin mit `paperclipai plugin install <package>`, dann `paperclipai plugin enable <key>`.
8. Committen Sie ein repo-lokales `.paperclip/`-Verzeichnis mit Runbook und Onboarding-Notizen (keine Secrets, kein `BETTER_AUTH_SECRET`).

Siehe ../../commands/setup-company.md für die vollständige Vorgehensweise.
