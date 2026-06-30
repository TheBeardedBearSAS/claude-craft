---
description: Rascunho de payload hire agente Paperclip (para a API ou o dashboard)
argument-hint: [agent-name]
---

# Rascunhar uma Contratacao de Agente Paperclip

## Argumentos

1. `agent-name` (obrigatorio) — rotulo kebab-case para o novo agente (ex. `senior-coder`, `qa-bot`)

## MISSAO

Produzir um payload bem-formado para contratar um agente Paperclip. Paperclip (v2026.609.0) **nao** contrata agentes de um arquivo `.yaml` via CLI — contratacao acontece atraves do dashboard ou `POST /companies/:companyId/agents`. Este comando rascunha o payload JSON e guia o operador atraves do preenchimento.

## Procedimento

### 1. Coletar entradas (interativo)

Pergunte em ordem:
- `companyId` alvo (deve existir — veja `/paperclip:setup-company` ou `paperclipai company list`)
- `adapterType` — um dos tipos registrados (ex. `claude_local`, `codex_local`, `gemini_local`, `cursor_local`, `opencode_local`, `pi_local`). O `agentConfigurationDoc` do adapter escolhido informa quais sub-campos sao aceitos.
- Nome exibicao agente (`$1`)
- Papel / titulo (ex. "Engenheiro TypeScript Senior")
- Goal para associar (opcional; obtenha de `paperclipai company get --id <companyId>`)
- Model id (deve estar na lista `models` do adapter)
- Orcamento (tokens, opcional; defina um limite **rigido** se voce quer aplicacao)
- Configuracao especifica adapter: `cwd`, `model`, `extraArgs`, `env`, `workspaceStrategy`, `timeoutSec`, `graceSec`, e quaisquer flags especificos adapter (ex. `dangerouslySkipPermissions` para `claude_local`)

### 2. Emitir o payload

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

> **Verifique o shape real.** Antes de POST, abra `server/src/routes/agents.ts` (ou a spec OpenAPI servida pela instancia) para confirmar o schema exato — o acima reflete o que foi observado em v2026.609.0 mas nomes de campos podem evoluir.

### 3. Enviar

**A — Dashboard:** cole os campos em **Agents → Hire** e envie.

**B — API:**
```bash
paperclipai agent list                      # confirme que a empresa e acessivel
curl -X POST "http://localhost:3100/companies/<companyId>/agents" \
  -H "Content-Type: application/json" \
  -H "Cookie: <session cookie do dashboard>" \
  -d @./agent-hire.json
```

(Autentique via sessao Better Auth. Veja `docs.paperclip.ing` para a receita auth usada por seu deployment.)

### 4. Verificar

```bash
paperclipai agent list
paperclipai agent get --id <agentId>
paperclipai activity list       # procure 'agent.hired'
```

## Checklist pos-rascunho

- [ ] `adapterType` corresponde a um adapter atualmente registrado
- [ ] `model` existe na lista `models` desse adapter
- [ ] Orcamento definido como inteiro positivo quando aplicacao e desejada
- [ ] Config especifico adapter passa o validador proprio do adapter (o dashboard rejeitara se nao)
- [ ] Sem valores secret inline — use refs secret onde o adapter suporta

## Output

Imprima o JSON rascunhado mais as instrucoes exatas curl + dashboard. **Nao** envie automaticamente.
