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

## Security

### Environment Variables
- **Never** commit `.mcp.json` files containing real tokens to version control
- Add `.mcp.json` to your `.gitignore`
- Use environment variable references (`${VAR_NAME}`) in templates
- Store tokens in your shell profile (`~/.bashrc`, `~/.zshrc`) or a secrets manager

### Required Environment Variables

| Template | Variable | Description |
|----------|----------|-------------|
| GitHub | `GITHUB_TOKEN` | Personal access token with repo scope |
| PostgreSQL | `DATABASE_URL` | Connection string (e.g., `postgresql://user:pass@host:5432/db`) |
| Slack | `SLACK_BOT_TOKEN` | Bot token starting with `xoxb-` |
| Slack | `SLACK_TEAM_ID` | Workspace team ID |

### Permissions

| Server | Required Permissions |
|--------|---------------------|
| GitHub | `repo` scope (read/write repository access) |
| PostgreSQL | Read-only access recommended for safety |
| Filesystem | Scoped to project directory only |
| Context7 | No authentication required |

## More Information

See the full documentation: [docs/MCP.md](/docs/MCP.md)
