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

## Sicherheit

### Umgebungsvariablen
- **Niemals** `.mcp.json`-Dateien mit echten Tokens in die Versionskontrolle committen
- Fugen Sie `.mcp.json` zu Ihrer `.gitignore` hinzu
- Verwenden Sie Umgebungsvariablen-Referenzen (`${VAR_NAME}`) in Templates
- Speichern Sie Tokens in Ihrem Shell-Profil (`~/.bashrc`, `~/.zshrc`) oder einem Secrets-Manager

### Erforderliche Umgebungsvariablen

| Template | Variable | Beschreibung |
|----------|----------|--------------|
| GitHub | `GITHUB_TOKEN` | Personlicher Zugriffstoken mit repo-Berechtigung |
| PostgreSQL | `DATABASE_URL` | Verbindungszeichenfolge (z.B. `postgresql://user:pass@host:5432/db`) |
| Slack | `SLACK_BOT_TOKEN` | Bot-Token beginnend mit `xoxb-` |
| Slack | `SLACK_TEAM_ID` | Workspace-Team-ID |

### Berechtigungen

| Server | Erforderliche Berechtigungen |
|--------|------------------------------|
| GitHub | `repo`-Berechtigung (Lese-/Schreibzugriff auf Repository) |
| PostgreSQL | Nur-Lese-Zugriff aus Sicherheitsgrunden empfohlen |
| Filesystem | Auf Projektverzeichnis beschrankt |
| Context7 | Keine Authentifizierung erforderlich |

## More Information

See the full documentation: [docs/MCP.md](/docs/MCP.md)
