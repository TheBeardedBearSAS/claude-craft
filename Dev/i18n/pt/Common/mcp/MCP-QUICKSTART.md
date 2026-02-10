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

## Seguranca

### Variaveis de ambiente
- **Nunca** faça commit de arquivos `.mcp.json` contendo tokens reais no controle de versão
- Adicione `.mcp.json` ao seu `.gitignore`
- Use referencias de variaveis de ambiente (`${VAR_NAME}`) nos templates
- Armazene tokens no seu perfil de shell (`~/.bashrc`, `~/.zshrc`) ou em um gerenciador de segredos

### Variaveis de ambiente obrigatorias

| Template | Variavel | Descricao |
|----------|----------|-----------|
| GitHub | `GITHUB_TOKEN` | Token de acesso pessoal com escopo repo |
| PostgreSQL | `DATABASE_URL` | String de conexao (ex: `postgresql://user:pass@host:5432/db`) |
| Slack | `SLACK_BOT_TOKEN` | Token de bot iniciando com `xoxb-` |
| Slack | `SLACK_TEAM_ID` | ID da equipe do workspace |

### Permissoes

| Servidor | Permissoes necessarias |
|----------|------------------------|
| GitHub | Escopo `repo` (acesso de leitura/escrita ao repositorio) |
| PostgreSQL | Acesso somente leitura recomendado por seguranca |
| Filesystem | Limitado ao diretorio do projeto apenas |
| Context7 | Nenhuma autenticacao necessaria |

## More Information

See the full documentation: [docs/MCP.md](/docs/MCP.md)
