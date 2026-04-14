---
name: paperclip-onboarding
description: Onboarding de una instancia Paperclip — instalar, bootstrapear operador CEO, crear una compañía vía dashboard, contratar el primer agente, instalar un plugin. Usar al bootstrapear o cablear Claude Code en Paperclip.
---

# Onboarding de Paperclip

1. `npx paperclipai onboard --yes` (o clonar + `pnpm install && pnpm dev`).
2. `paperclipai doctor` — corregir cualquier fallo duro.
3. `paperclipai auth-bootstrap-ceo` — crear la cuenta de operador inicial.
4. Ingresar al dashboard (predeterminado `http://localhost:3100`) y crear la compañía, o importar una con `paperclipai company import`.
5. Confirmar adaptadores disponibles (`claude_local`, `codex_local`, `cursor_local`, `gemini_local`, `opencode_local`, `openclaw_gateway`, `pi_local`) están registrados.
6. Contratar el primer agente vía dashboard (**Agents → Hire**) o `POST /companies/:companyId/agents`.
7. Opcional: instalar un plugin con `paperclipai plugin install <paquete>` luego `paperclipai plugin enable <key>`.
8. Commitear un directorio `.paperclip/` local del repo con runbook y notas de onboarding (sin secretos, sin `BETTER_AUTH_SECRET`).

Ver ../../commands/setup-company.md para el procedimiento completo.
