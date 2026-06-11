# Claude Craft Plugins

> **Status** : DRAFT P3-29. API plugin v1.0.0 en cours de validation communautaire.

## Qu'est-ce qu'un plugin Claude Craft ?

Un plugin étend Claude Craft sans modifier le core. Il s'accroche à des **hooks de lifecycle** (avant/après commande, audit, release) pour exécuter du code custom.

**Exemples de cas d'usage** :
- Notifier Slack à la fin d'un audit
- Exporter les rapports audit en PDF
- Enforcer des règles custom lors des releases
- Intégrer des outils maison (JIRA, Linear, custom CI)

## Installation rapide

```bash
claude-craft plugin install notify-slack
claude-craft plugin config notify-slack
# → prompt interactif pour SLACK_WEBHOOK_URL
```

## Écrire un plugin

### 1. Scaffold

```bash
npx create-claude-craft-plugin my-plugin
cd claude-craft-plugin-my-plugin
```

### 2. Implémenter un hook

`src/hooks/afterAudit.ts` :

```typescript
import type { AfterAuditHandler } from 'claude-craft-plugin-api';

export const afterAudit: AfterAuditHandler = async (ctx) => {
  console.log(`Audit ${ctx.scope}: ${ctx.metrics.score}%`);
};
```

### 3. Déclarer dans `plugin.json`

```json
{
  "name": "claude-craft-plugin-my-plugin",
  "version": "1.0.0",
  "apiVersion": "1.0.0",
  "hooks": ["afterAudit"],
  "permissions": {
    "network": { "outbound": ["https://api.example.com/**"] }
  }
}
```

### 4. Tester localement

```bash
npm link
cd ../my-project-using-claude-craft
npm link claude-craft-plugin-my-plugin
claude-craft plugin install my-plugin --local
```

### 5. Publier NPM

```bash
npm publish
```

## Exemples officiels

Voir `examples/plugins/` :

- `lint-custom` — règles lint custom enforcées en CI
- `notify-slack` — notifications Slack sur événements clés
- `export-pdf` — export rapports audit en PDF

## Documentation

- [ARCHITECTURE.md](./ARCHITECTURE.md) — Spec API, hooks, sandboxing
- [Best practices](./BEST-PRACTICES.md) — À venir
- [Security guide](./SECURITY.md) — À venir

## Contribuer

- Discussion générale : [GitHub Discussions `plugins`](https://github.com/TheBeardedBearSAS/claude-craft/discussions/categories/plugins)
- Feedback API : commenter le [RFC v1.0](https://github.com/TheBeardedBearSAS/claude-craft/discussions/plugin-rfc-v1)
- Bugs : issues GitHub avec label `plugins`
