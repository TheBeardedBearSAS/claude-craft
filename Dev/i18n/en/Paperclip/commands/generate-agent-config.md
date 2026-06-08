---
description: Draft a Paperclip agent-hire payload (for the API or the dashboard)
argument-hint: [agent-name]
---

# Draft a Paperclip Agent Hire

## Arguments

1. `agent-name` (required) — kebab-case label for the new agent (e.g. `senior-coder`, `qa-bot`)

## MISSION

Produce a well-formed payload for hiring a Paperclip agent. Paperclip (v2026.529.0) does **not** hire agents from a `.yaml` file via CLI — hiring happens through the dashboard or `POST /companies/:companyId/agents`. This command drafts the JSON payload and walks the operator through filling it in.

## Procedure

### 1. Collect inputs (interactive)

Ask in order:
- Target `companyId` (must exist — see `/paperclip:setup-company` or `paperclipai company list`)
- `adapterType` — one of the registered types (e.g. `claude_local`, `codex_local`, `gemini_local`, `cursor_local`, `opencode_local`, `pi_local`). The `agentConfigurationDoc` of the chosen adapter tells you which sub-fields are accepted.
- Agent display name (`$1`)
- Role / title (e.g. "Senior TypeScript engineer")
- Goal to associate (optional; get from `paperclipai company get --id <companyId>`)
- Model id (must be in the adapter's `models` list)
- Budget (tokens, optional; set a **hard** limit if you want enforcement)
- Adapter-specific configuration: `cwd`, `model`, `extraArgs`, `env`, `workspaceStrategy`, `timeoutSec`, `graceSec`, and any adapter-specific flags (e.g. `dangerouslySkipPermissions` for `claude_local`)
- `workMode` (optional) — execution mode controlling how the agent processes assigned issues (e.g. autonomous vs. supervised). Supported values depend on the instance; consult the `agentConfigurationDoc` of the chosen adapter or the instance docs before setting this field.

### 2. Emit the payload

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

> **Check the real shape.** Before POSTing, open `server/src/routes/agents.ts` (or the OpenAPI spec served by the instance) to confirm the exact schema — the above reflects what was observed at v2026.529.0 but field names can evolve.

### 3. Submit

**A — Dashboard:** paste the fields into **Agents → Hire** and submit.

**B — API:**
```bash
paperclipai agent list                      # confirm the company is reachable
curl -X POST "http://localhost:3100/companies/<companyId>/agents" \
  -H "Content-Type: application/json" \
  -H "Cookie: <session cookie from the dashboard>" \
  -d @./agent-hire.json
```

(Authenticate via the Better Auth session. See `docs.paperclip.ing` for the auth recipe used by your deployment.)

### 4. Verify

```bash
paperclipai agent list
paperclipai agent get --id <agentId>
paperclipai activity list       # look for 'agent.hired'
```

## Post-draft checklist

- [ ] `adapterType` matches a currently registered adapter
- [ ] `model` exists in that adapter's `models` list
- [ ] Budget set as a positive integer when enforcement is desired
- [ ] Adapter-specific config passes the adapter's own validator (the dashboard will reject if not)
- [ ] No secret values inlined — use secret refs where the adapter supports them
- [ ] `workMode` value (if set) is one of the modes listed in the adapter's `agentConfigurationDoc`, not invented

## Output

Print the drafted JSON plus the exact curl + dashboard instructions. Do **not** submit automatically.
