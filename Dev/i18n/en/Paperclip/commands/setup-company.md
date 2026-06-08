---
description: Bootstrap a new Paperclip company (onboarding + first agent)
argument-hint: [company-name]
---

# Bootstrap a New Paperclip Company

## Arguments

1. `company-name` (required) — short, descriptive name (e.g. "Acme Labs")

## MISSION

Walk an operator through onboarding: install, create the instance, bootstrap the initial operator account, create the company via the UI, and run the first agent with the `claude-local` adapter.

> The real `paperclipai` CLI (v2026.529.0) does **not** expose a `companies create` command. Company creation happens either through the dashboard or by importing a package with `paperclipai company import`. Don't invent flags that don't exist — open `paperclipai company --help` and follow what's there.

## Procedure

### 1. Preconditions

- [ ] Node.js 20+ and pnpm 9.15+ installed
- [ ] PostgreSQL reachable **OR** accept the embedded Postgres for local dev
- [ ] Port 3100 available (or set `PORT`)

### 2. Install & onboard

Fastest path:

```bash
npx paperclipai onboard --yes
```

Or from a checkout:

```bash
git clone https://github.com/paperclipai/paperclip.git
cd paperclip
pnpm install
pnpm dev
```

The dashboard defaults to `http://localhost:3100` (or whatever `PORT` you set).

### 3. Diagnostic check

```bash
paperclipai doctor
# or, to attempt auto-repairs:
paperclipai doctor --repair --yes
```

Fix anything reported as a hard failure before proceeding.

### 4. Bootstrap the first operator (CEO)

```bash
paperclipai auth-bootstrap-ceo
```

This creates the initial operator account used to sign into the dashboard. **Revoke or rotate** after onboarding is complete.

### 5. Create the company

There is no CLI command to create a company from scratch. Two supported paths:

**A — Dashboard (recommended for first-time users):**
- Sign in at `http://localhost:3100` with the bootstrap operator
- **Companies → New** → set the name "$1" and a URL slug

**B — Import from a prepared package:**
```bash
paperclipai company import --target new --new-company-name "$1" path/to/company.pcpkg
```

Either way, note the returned `companyId`.

### 6. List companies to confirm

```bash
paperclipai company list
paperclipai company get --id <companyId>
```

### 7. Verify adapter availability

Paperclip ships with built-in adapters (observed v2026.529.0):
`claude_local`, `codex_local`, `cursor_local`, `gemini_local`, `opencode_local`, `openclaw_gateway`, `pi_local`.

They register themselves into the server adapter registry at boot. Use the dashboard (or the `/companies/:companyId/adapters/:type/...` routes) to confirm the one you want is present and responding.

### 8. Hire the first agent

Paperclip does **not** hire agents from a YAML file via CLI (at v2026.529.0). Hire an agent:

- **Via the dashboard**: **Agents → Hire** with adapter `claude_local`, choose a model, set a budget, assign a goal.
- **Via the HTTP API**: `POST /companies/:companyId/agents` (authenticated). Fields: `adapterType`, adapter-specific config, agent metadata. See `server/src/routes/agents.ts` for the authoritative shape.

After hiring, inspect it:

```bash
paperclipai agent list
paperclipai agent get --id <agentId>
```

### 9. Approvals inbox

Kick the tires on approvals:

```bash
paperclipai approval list
# when a request is pending:
paperclipai approval approve --id <approvalId>
# or reject / request-revision / comment
paperclipai approval reject --id <approvalId> --reason "<short reason>"
```

### 10. Optional — install a plugin

```bash
paperclipai plugin list
paperclipai plugin examples     # see scaffolded examples
paperclipai plugin install <package>
paperclipai plugin inspect <pluginKey>
paperclipai plugin enable <pluginKey>
```

### 11. Activity & audit

```bash
paperclipai activity list
# filter by company, date range, etc.
```

### 12. Document locally

Create a repo-local `.paperclip/` directory with non-secret operator notes:

```
.paperclip/
├── README.md           # who signs in, how the first agent was hired
└── runbook.md          # kill-switch, plugin-disable, export procedures
```

Commit it. **Never commit secrets, `.env`, or the `BETTER_AUTH_SECRET`.**

## Post-setup checklist

- [ ] Dashboard reachable and CEO operator can sign in
- [ ] `paperclipai doctor` fully green
- [ ] Company visible in `paperclipai company list`
- [ ] Target adapter (`claude_local` or similar) registered and responding
- [ ] First agent hired and producing activity
- [ ] Approvals flow tested end-to-end
- [ ] `.paperclip/` committed without secrets

## Output

Report: company ID, adapter(s) available, first agent ID, dashboard URL, and the exact CLI commands that worked. Link to https://docs.paperclip.ing/foundation/quickstart for follow-ups.
