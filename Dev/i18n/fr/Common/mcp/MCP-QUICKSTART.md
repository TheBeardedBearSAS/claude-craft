# MCP Quick Start Guide

Model Context Protocol (MCP) extends Claude Code with external tools and data sources.

## Quick Setup

### 1. Context7 (Recommended - Up-to-date Documentation)

Create `.mcp.json` in your project root:

```json
{
  "mcpServers": {
    "context7": {
      "command": "npx",
      "args": ["-y", "@upstash/context7-mcp"]
    }
  }
}
```

Usage: Add "use context7" to any prompt for up-to-date library documentation.

### 2. GitHub Integration

```json
{
  "mcpServers": {
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "${GITHUB_TOKEN}"
      }
    }
  }
}
```

Set your token: `export GITHUB_TOKEN=ghp_xxx`

### 3. Database (PostgreSQL)

```json
{
  "mcpServers": {
    "postgres": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-postgres"],
      "env": {
        "POSTGRES_CONNECTION_STRING": "${DATABASE_URL}"
      }
    }
  }
}
```

## Available Templates

| Template | Servers Included |
|----------|------------------|
| `context7.mcp.json` | Context7 documentation |
| `github.mcp.json` | GitHub integration |
| `postgres.mcp.json` | PostgreSQL database |
| `slack.mcp.json` | Slack messaging |
| `full-stack.mcp.json` | All of the above |

## Example Usage

```
You: use context7 to help me implement Symfony forms

Claude: [Fetches current Symfony 7.2 form documentation]
        Here's how to create forms in Symfony 7.2...
```

## Securite

### Variables d'environnement
- Ne **jamais** commiter de fichiers `.mcp.json` contenant de vrais tokens dans le controle de version
- Ajoutez `.mcp.json` a votre `.gitignore`
- Utilisez des references de variables d'environnement (`${VAR_NAME}`) dans les templates
- Stockez les tokens dans votre profil shell (`~/.bashrc`, `~/.zshrc`) ou un gestionnaire de secrets

### Variables d'environnement requises

| Template | Variable | Description |
|----------|----------|-------------|
| GitHub | `GITHUB_TOKEN` | Token d'acces personnel avec le scope repo |
| PostgreSQL | `DATABASE_URL` | Chaine de connexion (ex : `postgresql://user:pass@host:5432/db`) |
| Slack | `SLACK_BOT_TOKEN` | Token de bot commencant par `xoxb-` |
| Slack | `SLACK_TEAM_ID` | ID d'equipe du workspace |

### Permissions

| Serveur | Permissions requises |
|---------|---------------------|
| GitHub | Scope `repo` (acces lecture/ecriture au depot) |
| PostgreSQL | Acces en lecture seule recommande pour la securite |
| Filesystem | Limite au repertoire du projet uniquement |
| Context7 | Aucune authentification requise |

## More Information

See the full documentation: [docs/MCP.md](/docs/MCP.md)
