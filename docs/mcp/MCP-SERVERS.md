# Claude Craft MCP Servers Architecture

Spécification technique des MCP servers dédiés aux fonctionnalités killer de Claude Craft.

---

## Vue d'ensemble

Claude Craft expose ses fonctionnalités clés (Ralph, RTK, QA Recette, Kanban) sous forme de **MCP servers** pour permettre leur utilisation dans n'importe quel environnement MCP-compatible (Claude Desktop, autres clients).

**Package npm** : `@claude-craft/mcp-servers`

**Roadmap** :
- **v1.0** (mois 7) : Ralph MCP + RTK MCP
- **v1.1** (mois 8) : QA Recette MCP
- **v2.0** (mois 9) : Kanban MCP

---

## Ralph MCP Server

### Principe

Expose Ralph Wiggum (continuous AI loop) comme service MCP pour orchestrer l'exécution de tâches jusqu'à completion avec DoD validators.

### Tools exposés

| Tool | Description | Paramètres |
|------|-------------|------------|
| `ralph_run` | Exécute une tâche en loop continu | `task` (string), `max_iterations` (int, default: 10), `circuit_breaker` (bool, default: true) |
| `ralph_status` | Statut d'une tâche en cours | `task_id` (string) |
| `ralph_stop` | Arrête une tâche en cours | `task_id` (string) |
| `ralph_validators` | Liste les DoD validators disponibles | - |

### Resources exposés

| Resource | URI | Description |
|----------|-----|-------------|
| Ralph config | `ralph://config` | Configuration ralph.yml active |
| Task logs | `ralph://task/{id}/logs` | Logs d'exécution d'une tâche |
| Validators | `ralph://validators` | Liste des validators avec schemas |

### Prompts prédéfinis

| Prompt | Description | Arguments |
|--------|-------------|-----------|
| `run-feature` | Template pour implémenter une feature complète | `feature_name`, `acceptance_criteria` |
| `fix-bug` | Template pour corriger un bug avec test de régression | `bug_description`, `reproduction_steps` |

### Exemple d'utilisation

```json
{
  "mcpServers": {
    "ralph": {
      "command": "npx",
      "args": ["-y", "@claude-craft/mcp-servers", "ralph"],
      "env": {
        "RALPH_MAX_ITERATIONS": "10",
        "RALPH_CIRCUIT_BREAKER": "true"
      }
    }
  }
}
```

```javascript
// Appel depuis Claude Desktop
const result = await mcp.callTool('ralph_run', {
  task: 'Implement user authentication with JWT',
  max_iterations: 15,
  circuit_breaker: true
});
```

---

## RTK MCP Server

### Principe

Expose RTK (Rust Token Killer) pour optimiser la consommation de tokens via filtrage intelligent des outputs CLI.

### Tools exposés

| Tool | Description | Paramètres |
|------|-------------|------------|
| `rtk_proxy` | Exécute une commande via RTK proxy | `command` (string), `mode` (enum: compact/ultra-compact/raw) |
| `rtk_gain` | Affiche les statistiques de gain tokens | `period` (enum: today/week/month/all) |
| `rtk_history` | Historique des commandes avec gains | `limit` (int, default: 50) |
| `rtk_discover` | Analyse les opportunités d'optimisation | `path` (string, default: cwd) |

### Resources exposés

| Resource | URI | Description |
|----------|-----|-------------|
| RTK config | `rtk://config` | Configuration rtk.toml active |
| Gain analytics | `rtk://analytics` | Statistiques de gains agrégées |
| Command history | `rtk://history` | Historique complet des commandes |

### Prompts prédéfinis

| Prompt | Description | Arguments |
|--------|-------------|-----------|
| `optimize-workflow` | Analyse un workflow et suggère optimisations RTK | `workflow_file` |
| `setup-hooks` | Configure les hooks PostToolUse pour RTK | `hook_type` |

### Exemple d'utilisation

```json
{
  "mcpServers": {
    "rtk": {
      "command": "npx",
      "args": ["-y", "@claude-craft/mcp-servers", "rtk"]
    }
  }
}
```

```javascript
// Appel depuis Claude Desktop
const result = await mcp.callTool('rtk_proxy', {
  command: 'npm test',
  mode: 'ultra-compact'
});
// Output filtré : 60-90% de tokens en moins
```

---

## QA Recette MCP Server

### Principe

Expose QA Recette (automated acceptance testing) pour exécuter des tests d'acceptance via Chrome automation.

### Tools exposés

| Tool | Description | Paramètres |
|------|-------------|------------|
| `recette_run` | Lance une session de test | `scope` (enum: story/sprint/epic), `id` (string), `headless` (bool, default: true) |
| `recette_status` | Statut d'une session | `session_id` (string) |
| `recette_resume` | Reprend une session interrompue | `session_id` (string) |
| `recette_report` | Génère un rapport de test | `session_id` (string), `format` (enum: json/html/pdf) |

### Resources exposés

| Resource | URI | Description |
|----------|-----|-------------|
| Session logs | `recette://session/{id}/logs` | Logs d'exécution |
| Screenshots | `recette://session/{id}/screenshots` | Screenshots de test |
| Test scenarios | `recette://scenarios` | Scénarios disponibles |

### Prompts prédéfinis

| Prompt | Description | Arguments |
|--------|-------------|-----------|
| `test-story` | Template pour tester une user story | `story_id`, `acceptance_criteria` |
| `regression-check` | Template pour vérifier qu'un bug ne réapparaît pas | `bug_id`, `regression_scenario` |

### Exemple d'utilisation

```json
{
  "mcpServers": {
    "qa-recette": {
      "command": "npx",
      "args": ["-y", "@claude-craft/mcp-servers", "qa-recette"],
      "env": {
        "CHROME_EXTENSION_ID": "${CHROME_EXTENSION_ID}"
      }
    }
  }
}
```

```javascript
// Appel depuis Claude Desktop
const result = await mcp.callTool('recette_run', {
  scope: 'story',
  id: 'US-001',
  headless: false
});
```

### Prérequis

- Chrome extension QA Recette v1.0.36+
- Variable d'environnement `CHROME_EXTENSION_ID`

---

## Kanban MCP Server

### Principe

Expose un système Kanban léger pour la gestion des tâches avec board, status tracking, et intégration BMAD v6.

### Tools exposés

| Tool | Description | Paramètres |
|------|-------------|------------|
| `kanban_create_task` | Crée une tâche | `title` (string), `description` (string), `type` (enum: story/task/bug), `priority` (enum: low/medium/high) |
| `kanban_update_status` | Change le statut | `task_id` (string), `status` (enum: backlog/ready/in-progress/review/done/blocked) |
| `kanban_list_tasks` | Liste les tâches | `status` (string, optional), `type` (string, optional) |
| `kanban_board` | Affiche le board complet | `format` (enum: ascii/json/html) |

### Resources exposés

| Resource | URI | Description |
|----------|-----|-------------|
| Board state | `kanban://board` | État complet du board |
| Task details | `kanban://task/{id}` | Détails d'une tâche |
| Sprint backlog | `kanban://sprint/current` | Backlog du sprint actuel |

### Prompts prédéfinis

| Prompt | Description | Arguments |
|--------|-------------|-----------|
| `plan-sprint` | Template pour planifier un sprint | `sprint_goal`, `capacity` |
| `daily-standup` | Template pour daily standup | `team_members` |

### Exemple d'utilisation

```json
{
  "mcpServers": {
    "kanban": {
      "command": "npx",
      "args": ["-y", "@claude-craft/mcp-servers", "kanban"],
      "env": {
        "KANBAN_STORAGE": "${HOME}/.claude-craft/kanban.db"
      }
    }
  }
}
```

```javascript
// Appel depuis Claude Desktop
const task = await mcp.callTool('kanban_create_task', {
  title: 'Implement login page',
  description: 'Create login UI with email/password',
  type: 'story',
  priority: 'high'
});

await mcp.callTool('kanban_update_status', {
  task_id: task.id,
  status: 'in-progress'
});
```

---

## Installation

### Package npm

```bash
npm install -g @claude-craft/mcp-servers
```

### Configuration Claude Desktop

Ajouter dans `~/.claude/mcp.json` :

```json
{
  "mcpServers": {
    "ralph": {
      "command": "npx",
      "args": ["-y", "@claude-craft/mcp-servers", "ralph"]
    },
    "rtk": {
      "command": "npx",
      "args": ["-y", "@claude-craft/mcp-servers", "rtk"]
    },
    "qa-recette": {
      "command": "npx",
      "args": ["-y", "@claude-craft/mcp-servers", "qa-recette"],
      "env": {
        "CHROME_EXTENSION_ID": "${CHROME_EXTENSION_ID}"
      }
    },
    "kanban": {
      "command": "npx",
      "args": ["-y", "@claude-craft/mcp-servers", "kanban"]
    }
  }
}
```

### Vérification

```bash
# Tester Ralph MCP
npx @claude-craft/mcp-servers ralph --test

# Tester RTK MCP
npx @claude-craft/mcp-servers rtk --test

# Tester QA Recette MCP
npx @claude-craft/mcp-servers qa-recette --test

# Tester Kanban MCP
npx @claude-craft/mcp-servers kanban --test
```

---

## Architecture technique

### Stack

- **Runtime** : Node.js 20+
- **Framework MCP** : `@modelcontextprotocol/sdk` (TypeScript)
- **Storage** : SQLite (Kanban), filesystem (Ralph logs, RTK history)
- **IPC** : stdio (MCP standard)

### Structure du package

```
@claude-craft/mcp-servers/
├── src/
│   ├── ralph/
│   │   ├── server.ts          # Ralph MCP server
│   │   ├── validators.ts      # DoD validators
│   │   └── circuit-breaker.ts
│   ├── rtk/
│   │   ├── server.ts          # RTK MCP server
│   │   ├── proxy.ts           # Command proxy
│   │   └── analytics.ts
│   ├── qa-recette/
│   │   ├── server.ts          # QA Recette MCP server
│   │   ├── chrome-client.ts   # Chrome extension client
│   │   └── scenarios.ts
│   └── kanban/
│       ├── server.ts          # Kanban MCP server
│       ├── db.ts              # SQLite storage
│       └── bmad-integration.ts
├── package.json
└── README.md
```

---

## Roadmap

### v1.0 (mois 7)

- [x] Ralph MCP server
- [x] RTK MCP server
- [x] Documentation
- [ ] Tests e2e
- [ ] Publication npm

### v1.1 (mois 8)

- [ ] QA Recette MCP server
- [ ] Intégration Chrome extension
- [ ] Documentation migration

### v2.0 (mois 9)

- [ ] Kanban MCP server
- [ ] Intégration BMAD v6
- [ ] API OpenAPI 3.2 (pour interopérabilité)

---

**Date de création** : 2026-04-17
**Version** : 1.0.0
**Auteur** : The Bearded CTO
