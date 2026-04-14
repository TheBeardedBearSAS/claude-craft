---
name: paperclip-onboarding
description: Onboarding instancia Paperclip — instalar, bootstrap operador CEO, criar empresa via dashboard, contratar primeiro agente, instalar plugin. Use ao bootstrapar ou conectar Claude Code em Paperclip.
---

# Onboarding Paperclip

1. `npx paperclipai onboard --yes` (ou clone + `pnpm install && pnpm dev`).
2. `paperclipai doctor` — corrija quaisquer falhas rigorosas.
3. `paperclipai auth-bootstrap-ceo` — crie a conta operador inicial.
4. Entre no dashboard (padrao `http://localhost:3100`) e crie a empresa, ou importe uma com `paperclipai company import`.
5. Confirme adapters disponiveis (`claude_local`, `codex_local`, `cursor_local`, `gemini_local`, `opencode_local`, `openclaw_gateway`, `pi_local`) estao registrados.
6. Contrate o primeiro agente via dashboard (**Agents → Hire**) ou `POST /companies/:companyId/agents`.
7. Opcional: instale um plugin com `paperclipai plugin install <package>` entao `paperclipai plugin enable <key>`.
8. Commite um diretorio `.paperclip/` local ao repo com runbook e notas onboarding (sem secrets, sem `BETTER_AUTH_SECRET`).

Veja ../../commands/setup-company.md para o procedimento completo.
