# Bear Craft Plugins

> **Status** : DRAFT P3-29. API plugin v1.0.0 en cours de validation communautaire.

## Qu'est-ce qu'un plugin Bear Craft ?

Un plugin étend Bear Craft sans modifier le core. Il s'accroche à des **hooks de lifecycle** (avant/après commande, audit, release) pour exécuter du code custom.

**Exemples de cas d'usage** :
- Notifier Slack à la fin d'un audit
- Exporter les rapports audit en PDF
- Enforcer des règles custom lors des releases
- Intégrer des outils maison (JIRA, Linear, custom CI)

## Installation rapide

```bash
bear-craft plugin install notify-slack
bear-craft plugin config notify-slack
# → prompt interactif pour SLACK_WEBHOOK_URL
```

## Écrire un plugin

### 1. Scaffold

```bash
npx create-bear-craft-plugin my-plugin
cd bear-craft-plugin-my-plugin
```

### 2. Implémenter un hook

`src/hooks/afterAudit.ts` :

```typescript
import type { AfterAuditHandler } from 'bear-craft-plugin-api';

export const afterAudit: AfterAuditHandler = async (ctx) => {
  console.log(`Audit ${ctx.scope}: ${ctx.metrics.score}%`);
};
```

### 3. Déclarer dans `plugin.json`

```json
{
  "name": "bear-craft-plugin-my-plugin",
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
cd ../my-project-using-bear-craft
npm link bear-craft-plugin-my-plugin
bear-craft plugin install my-plugin --local
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

- Discussion générale : [GitHub Discussions `plugins`](https://github.com/TheBeardedBearSAS/bear-craft/discussions/categories/plugins)
- Feedback API : commenter le [RFC v1.0](https://github.com/TheBeardedBearSAS/bear-craft/discussions/plugin-rfc-v1)
- Bugs : issues GitHub avec label `plugins`
