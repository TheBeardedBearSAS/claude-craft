---
description: Redactar un payload de contratación de agente Paperclip (para la API o el dashboard)
argument-hint: [nombre-agente]
---

# Redactar Contratación de Agente Paperclip

## Argumentos

1. `agent-name` (requerido) — etiqueta en kebab-case para el nuevo agente (ej. `senior-coder`, `qa-bot`)

## MISIÓN

Producir un payload bien formado para contratar un agente Paperclip. Paperclip (v2026.529.0) **no** contrata agentes desde un archivo `.yaml` vía CLI — la contratación ocurre a través del dashboard o `POST /companies/:companyId/agents`. Este comando redacta el payload JSON y guía al operador a llenarlo.

## Procedimiento

### 1. Recolectar inputs (interactivo)

Preguntar en orden:
- `companyId` objetivo (debe existir — ver `/paperclip:setup-company` o `paperclipai company list`)
- `adapterType` — uno de los tipos registrados (ej. `claude_local`, `codex_local`, `gemini_local`, `cursor_local`, `opencode_local`, `pi_local`). El `agentConfigurationDoc` del adaptador elegido te dice qué sub-campos son aceptados.
- Nombre de visualización del agente (`$1`)
- Rol / título (ej. "Ingeniero senior TypeScript")
- Goal a asociar (opcional; obtener de `paperclipai company get --id <companyId>`)
- Id de modelo (debe estar en la lista `models` del adaptador)
- Presupuesto (tokens, opcional; establecer un límite **duro** si quieres aplicación)
- Configuración específica del adaptador: `cwd`, `model`, `extraArgs`, `env`, `workspaceStrategy`, `timeoutSec`, `graceSec`, y cualquier flag específico del adaptador (ej. `dangerouslySkipPermissions` para `claude_local`)

### 2. Emitir el payload

```json
{
  "name": "{{AGENT_NAME}}",
  "displayName": "{{DISPLAY_NAME}}",
  "role": "{{ROLE}}",
  "goalId": "{{GOAL_ID_OR_NULL}}",
  "adapterType": "{{ADAPTER_TYPE}}",
  "adapterConfig": {
    "model": "{{MODEL_ID}}",
    "cwd": "{{CWD_OR_NULL}}",
    "timeoutSec": 900,
    "graceSec": 15,
    "extraArgs": [],
    "env": {},
    "workspaceStrategy": {
      "type": "git_worktree",
      "baseRef": "main"
    }
  },
  "budget": {
    "tokens": {{TOKEN_BUDGET_OR_NULL}}
  }
}
```

> **Verificar la forma real.** Antes de POSTear, abrir `server/src/routes/agents.ts` (o la especificación OpenAPI servida por la instancia) para confirmar el esquema exacto — lo anterior refleja lo observado en v2026.529.0 pero los nombres de campos pueden evolucionar.

### 3. Enviar

**A — Dashboard:** pegar los campos en **Agents → Hire** y enviar.

**B — API:**
```bash
paperclipai agent list                      # confirmar que la compañía es alcanzable
curl -X POST "http://localhost:3100/companies/<companyId>/agents" \
  -H "Content-Type: application/json" \
  -H "Cookie: <cookie de sesión desde el dashboard>" \
  -d @./agent-hire.json
```

(Autenticar vía sesión Better Auth. Ver `docs.paperclip.ing` para la receta auth usada por tu despliegue.)

### 4. Verificar

```bash
paperclipai agent list
paperclipai agent get --id <agentId>
paperclipai activity list       # buscar 'agent.hired'
```

## Checklist post-redacción

- [ ] `adapterType` coincide con un adaptador actualmente registrado
- [ ] `model` existe en la lista `models` de ese adaptador
- [ ] Presupuesto establecido como entero positivo cuando se desea aplicación
- [ ] Config específico del adaptador pasa el validador propio del adaptador (el dashboard rechazará si no)
- [ ] Sin valores de secreto inline — usar refs de secreto donde el adaptador los soporta

## Output

Imprimir el JSON redactado más las instrucciones exactas de curl + dashboard. **No** enviar automáticamente.
