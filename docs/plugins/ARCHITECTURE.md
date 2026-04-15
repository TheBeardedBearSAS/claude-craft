# Claude Craft Plugin System — Architecture v1.0 DRAFT

> **Status** : DRAFT P3-29. RFC communautaire requis avant v1.0.0 stable.
> **Source audit** : `audit/04-FEATURES.md` §FEAT-017 (écosystème tiers, lock-in positif).
> **Objectif** : permettre à la communauté d'étendre Claude Craft sans toucher au core.

## Hypothèses explicites (Karpathy §1)

1. **Runtime** : Node.js 20+ (alignement cli/), chargement des plugins au boot CLI.
2. **Distribution** : NPM packages `claude-craft-plugin-<name>` + installation via `claude-craft plugin install <name>`.
3. **Trust model** : opt-in explicite à l'installation, permissions déclarées dans `plugin.json`, sandbox limitant accès FS/réseau.
4. **Semver plugin API** : v1.x stable pour 2 ans minimum, v2.x = breaking accepté.
5. **Scope v1** : hooks de lifecycle (avant/après commandes, audit, release). Pas de UI custom, pas d'agents custom (phase 4).

## Structure plugin

```
claude-craft-plugin-notify-slack/
├── package.json              # NPM, dépend de claude-craft-plugin-api
├── plugin.json               # Manifest (voir ci-dessous)
├── src/
│   ├── index.ts              # Export handler
│   ├── hooks/
│   │   ├── afterAudit.ts
│   │   └── afterRelease.ts
│   └── config.schema.json    # Config utilisateur (JSON Schema)
├── README.md
└── LICENSE
```

## `plugin.json` schema

```json
{
  "$schema": "https://claude-craft.dev/schema/plugin-v1.json",
  "name": "claude-craft-plugin-notify-slack",
  "version": "1.0.0",
  "displayName": "Slack Notifications",
  "description": "Send notifications to Slack on audit completion and release events",
  "author": "username <email@example.com>",
  "license": "MIT",
  "apiVersion": "1.0.0",
  "hooks": [
    "afterAudit",
    "afterRelease",
    "onCommandError"
  ],
  "permissions": {
    "fs": {
      "read": ["./reports/**"],
      "write": []
    },
    "network": {
      "outbound": ["https://hooks.slack.com/**"]
    },
    "env": ["SLACK_WEBHOOK_URL"],
    "exec": false
  },
  "config": {
    "schemaFile": "./src/config.schema.json"
  }
}
```

## Hooks exposés (v1.0)

| Hook | Quand | Args | Return |
|---|---|---|---|
| `beforeCommand` | Avant exécution d'une slash command | `{ command, args, context }` | `{ proceed: bool, reason?: string }` |
| `afterCommand` | Après exécution (succès) | `{ command, args, result }` | `void` |
| `onCommandError` | Après exécution (erreur) | `{ command, args, error }` | `void` |
| `beforeAudit` | Avant `/team:audit` | `{ scope, focus }` | `{ proceed: bool, reason?: string }` |
| `afterAudit` | Après `/team:audit` | `{ scope, reports, metrics }` | `void` |
| `beforeRelease` | Avant release | `{ version, changelog }` | `{ proceed: bool, reason?: string }` |
| `afterRelease` | Après release | `{ version, tag, url }` | `void` |
| `onReport` | Génération rapport audit | `{ report, format }` | `void \| ModifiedReport` |

Handler :
```typescript
// src/hooks/afterAudit.ts
import type { AfterAuditContext, AfterAuditHandler } from 'claude-craft-plugin-api';

export const afterAudit: AfterAuditHandler = async (ctx: AfterAuditContext) => {
  const { reports, metrics, config } = ctx;
  await fetch(config.slack.webhook, {
    method: 'POST',
    body: JSON.stringify({ text: `Audit done: ${metrics.score}%` }),
  });
};
```

## Sandboxing

**Niveau 1 — Permissions déclarées** :
- Lecture fichiers restreinte aux paths déclarés (`fs.read`)
- Écriture refusée par défaut
- Réseau : whitelist URLs (`network.outbound`)
- Env vars : whitelist (`env`)
- Exec subprocess : interdit (`exec: false`)

**Niveau 2 — Runtime enforcement (v1.1+)** :
- Wrapper `fs.readFile` vérifiant path contre glob autorisé
- Wrapper `fetch` vérifiant URL contre whitelist
- `process.env` proxifié
- Violations : plugin disabled, log warning, utilisateur notifié

**Niveau 3 — Worker isolation (v2.0 future)** :
- Plugins exécutés dans `worker_threads` avec `resourceLimits`
- Pas d'accès au main process

## CLI

```bash
# Installer
claude-craft plugin install notify-slack

# Configurer
claude-craft plugin config notify-slack
# → prompt interactif basé sur config.schema.json

# Lister
claude-craft plugin list

# Désactiver temporairement
claude-craft plugin disable notify-slack

# Désinstaller
claude-craft plugin remove notify-slack
```

## Registry

v1.0 : NPM registry standard. Convention nom `claude-craft-plugin-<name>`.

v1.1 : registre curated sur `plugins.claude-craft.dev` (index généré CI depuis NPM search).

## Compatibilité

- Plugin declare `apiVersion` dans `plugin.json`
- CLI refuse de charger un plugin si `plugin.apiVersion` major ≠ CLI plugin API major
- Deprecation cycle : 6 mois minimum avant breaking change majeur

## RFC communautaire

Avant publication NPM stable :

1. RFC sur GitHub Discussions `plugins/general`
2. Review `@tech-lead` + `@security-auditor` (sandboxing)
3. Dogfooding 3 plugins internes (cf. `examples/plugins/`)
4. Comment period 30 jours
5. Publication starter template `npx create-claude-craft-plugin`

## DoD P3-29

- [ ] API plugin v1.0.0 publiée (`claude-craft-plugin-api` NPM)
- [ ] CLI supporte install/list/remove/config
- [ ] 3 plugins examples dans `examples/plugins/`
- [ ] Starter template `create-claude-craft-plugin` publié
- [ ] Documentation `docs/plugins/` complète (architecture, tutoriel, best practices)
- [ ] Sandboxing niveau 1 implémenté
- [ ] RFC publié, ≥ 5 commentaires, closed "accepted"
