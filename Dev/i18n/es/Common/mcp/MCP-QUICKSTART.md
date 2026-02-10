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

## Seguridad

### Variables de entorno
- **Nunca** commitear archivos `.mcp.json` que contengan tokens reales en el control de versiones
- Agregue `.mcp.json` a su `.gitignore`
- Use referencias de variables de entorno (`${VAR_NAME}`) en las plantillas
- Almacene los tokens en su perfil de shell (`~/.bashrc`, `~/.zshrc`) o en un gestor de secretos

### Variables de entorno requeridas

| Plantilla | Variable | Descripcion |
|-----------|----------|-------------|
| GitHub | `GITHUB_TOKEN` | Token de acceso personal con alcance repo |
| PostgreSQL | `DATABASE_URL` | Cadena de conexion (ej: `postgresql://user:pass@host:5432/db`) |
| Slack | `SLACK_BOT_TOKEN` | Token de bot que comienza con `xoxb-` |
| Slack | `SLACK_TEAM_ID` | ID de equipo del workspace |

### Permisos

| Servidor | Permisos requeridos |
|----------|---------------------|
| GitHub | Alcance `repo` (acceso lectura/escritura al repositorio) |
| PostgreSQL | Acceso de solo lectura recomendado por seguridad |
| Filesystem | Limitado al directorio del proyecto unicamente |
| Context7 | No requiere autenticacion |

## More Information

See the full documentation: [docs/MCP.md](/docs/MCP.md)
