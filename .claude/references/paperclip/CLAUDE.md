# Paperclip 2026.1012.0 — Quick Reference

> **Paperclip** is a self-hosted AI agent orchestration platform (MIT). You **run** it — you do not build a control plane or write adapter integrations. The server, dashboard, CLI, and built-in adapters are all part of the Paperclip product.
> Docs: https://docs.paperclip.ing/ | Repo: https://github.com/paperclipai/paperclip

## Versions requises (2026)

| Composant | Version | Notes |
|-----------|---------|-------|
| Paperclip | 2026.1012.0+ | Self-hosted orchestration platform (MIT) |
| Node.js | 24.11+ LTS | Required by Paperclip server and CLI (`paperclipai` `engines`: `>=24.11.0`) |
| TypeScript | 5.7+ | Strict mode — for plugin/adapter development |
| Vitest | 4.1+ | Tests plugins and adapters |
| PostgreSQL | 15+ | Paperclip server persistence |
| pnpm | 9.15+ | Package manager (Paperclip monorepo) |

## Installation (self-hosted)

```bash
# Via npm (recommended for most operators)
npx paperclipai onboard --yes

# Via Docker
docker compose up -d          # see docker/ in the Paperclip repo
```

After onboarding, the server runs on `http://localhost:3100` and the dashboard is accessible at the configured port.

## Monorepo structure (Paperclip source, for contributors)

```
paperclip/
├── server/                    # @paperclipai/server — Node.js + TS HTTP API
│   └── src/
│       ├── routes/            # companies, agents, approvals, activity, ...
│       └── adapters/          # server-side adapter registry
├── ui/                        # @paperclipai/ui — React dashboard
├── cli/                       # paperclipai CLI (commander.js)
│   └── src/commands/          # onboard, doctor, company, agent, approval, ...
├── packages/
│   ├── shared/                # @paperclipai/shared — types + schemas
│   ├── db/                    # @paperclipai/db — schema, migrations
│   ├── mcp-server/            # @paperclipai/mcp-server
│   ├── adapter-utils/         # @paperclipai/adapter-utils
│   ├── adapters/              # Built-in adapters (see table below)
│   └── plugins/
│       ├── sdk/               # @paperclipai/plugin-sdk — public extension API
│       └── create-paperclip-plugin/  # Plugin scaffolder
└── tests/
    ├── e2e/                   # Playwright
    └── release-smoke/
```

## Adapter types (`adapterType`)

The `adapterType` field on an agent hire payload selects which AI runtime powers the agent.

| adapterType | Runtime | Minimal adapterConfig fields |
|---|---|---|
| `claude_local` | Claude Code (local) | `cwd`, `model`, `timeoutSec`, `graceSec`, `extraArgs`, `env` |
| `codex_local` | OpenAI Codex CLI (local) | `cwd`, `model`, `timeoutSec`, `graceSec`, `extraArgs`, `env` |
| `cursor_local` | Cursor (local) | `cwd`, `model`, `timeoutSec`, `graceSec`, `extraArgs`, `env` |
| `gemini_local` | Gemini CLI (local) | `cwd`, `model`, `timeoutSec`, `graceSec`, `extraArgs`, `env` |
| `opencode_local` | OpenCode (local) | `cwd`, `model`, `timeoutSec`, `graceSec`, `extraArgs`, `env` |
| `openclaw_gateway` | OpenClaw gateway | `endpoint`, `apiKey`, `model`, `timeoutSec` |
| `pi_local` | Pi (local) | `cwd`, `model`, `timeoutSec`, `graceSec`, `extraArgs`, `env` |

> The `agentConfigurationDoc` of each adapter (returned by the server) lists every accepted field and its constraints. Always consult it before hiring.

## Company and agent management

```bash
# Operator CLI — run after onboarding
paperclipai company list
paperclipai company get --id <companyId>

paperclipai agent list
paperclipai agent get --id <agentId>

paperclipai approval list
paperclipai activity list
```

Hiring an agent is done via the dashboard (**Agents → Hire**) or `POST /companies/:companyId/agents`. See `/paperclip:generate-agent-config` for a guided payload builder.

## Governance model (server-enforced)

Paperclip enforces governance as server-side invariants — they cannot be bypassed by adapters or plugins:

| Invariant | Enforcement |
|---|---|
| Budget limits | Hard token cap on the server; agents are halted when exceeded |
| Approval gates | Human-in-the-loop; execution blocked until approved |
| Activity log | Append-only; emitted for every mutation by the server |
| Tenant isolation | `companyId` extracted from the authenticated session, never from the client payload |
| Adapter sandboxing | Adapters select the AI runtime; they cannot modify governance state |

## Extension via `@paperclipai/plugin-sdk`

Plugins are the extension mechanism for Paperclip. They add features, UI slots, background jobs, or custom adapter logic.

```bash
# Scaffold a new plugin
npx create-paperclip-plugin my-plugin

# Manage plugins on a running instance
paperclipai plugin list
paperclipai plugin install ./my-plugin
```

A minimal plugin entry point:

```typescript
import { definePlugin } from '@paperclipai/plugin-sdk';

export default definePlugin({
  name: 'my-plugin',
  setup(ctx) {
    // register routes, jobs, UI slots, ...
  },
});
```

## Checklist rapide

- [ ] Instance onboardée (`paperclipai onboard --yes` ou Docker)
- [ ] Company créée (`paperclipai company list`)
- [ ] `adapterType` vérifié contre les adapters enregistrés sur l'instance
- [ ] Budget défini (entier positif en tokens) si enforcement souhaité
- [ ] `workMode` choisi parmi les valeurs listées dans `agentConfigurationDoc` de l'adapter
- [ ] Activity log consulté après chaque mutation (`paperclipai activity list`)
- [ ] Plugins audités avant installation (licence, version pinée)
- [ ] OpenTelemetry activé si observabilité requise

## Documentation complémentaire

- `project-context.md` — Contexte projet, conventions équipe
- `Dev/i18n/en/Paperclip/rules/02-architecture-paperclip.md` — Architecture monorepo détaillée
- `Dev/i18n/en/Paperclip/rules/12-adapter-protocol.md` — Protocole adapter (wire contract)
- `Dev/i18n/en/Paperclip/commands/generate-agent-config.md` — Builder de payload hire
- https://docs.paperclip.ing/ — Documentation officielle

## Notes de mise à jour : changements cassants (2026.916.0 à 2026.1012.0)

Vérifié sur les notes de version GitHub officielles (paperclipai/paperclip).

- **2026.916.0** : les API d'agent ne renvoient plus les identifiants en clair (les bindings `plain` sont masqués : utiliser `secretRef`, ne jamais relire un secret) ; les « cheap model profiles » sont supprimés (la migration `0236` retire les `modelProfiles` stockés) ; `X-Forwarded-Host` n'est pris en compte que si le pair direct passe `TRUST_PROXY` (à définir derrière un reverse proxy, sinon l'en-tête `Host` brut est utilisé) ; l'option de connexion REST legacy Anthropic est retirée (les connexions d'outils REST sont validées comme REST).
- **2026.1001.0** : le broker Composio legacy est retiré (pas de migration automatique ; remplacement : Composio Connect derrière le flag `enableMcpAggregators`). Les harnesses d'exécution passent **en full auto par défaut** : ACPX/Claude `approve-all`, OpenCode `allow`, Codex `never` (aucune pause d'approbation). Pour conserver les garde-fous d'approbation côté fournisseur, définir explicitement un mode restrictif par agent : `acpxPermissionMode` (`approve-paperclip`, `approve-reads` ou `deny-all`) ou `opencodePermissionMode` (`ask` ou `deny`). Les approbations gouvernées de Paperclip restent appliquées.
- **2026.1005.0** : `PAPERCLIP_CLOUD_UI_SNIPPET` / `PAPERCLIP_CLOUD_UI_SNIPPET_B64` n'injectent plus de HTML (migrer l'intégration vers une contribution UI de plugin) ; une @-mention dans un commentaire de tâche ne sert que de contexte et ne lance plus de run (seules l'assignation explicite ou les demandes de revue le font).
- **2026.1012.0** : les verrous de restauration de workspace sont désormais des verrous de fichier SQLite sous `<instance root>/locks/directory-merge/` : arrêter tous les anciens processus serveur et worker avant de mettre à jour ou de revenir en arrière ; les tool grants à sélecteurs inconnus ou à restrictions mal formées refusent désormais l'accès (revoir les grants personnalisés).

