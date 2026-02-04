# Model Context Protocol (MCP) Integration

MCP is an open standard that enables AI models to connect to external tools and data sources. Think of it as the "USB-C for AI" - a universal way to extend Claude Code's capabilities.

## Table of Contents

- [Overview](#overview)
- [Configuration](#configuration)
- [OAuth Client Credentials](#oauth-client-credentials)
- [Popular MCP Servers](#popular-mcp-servers)
- [Context7 - Documentation Server](#context7---documentation-server)
- [Custom MCP Servers](#custom-mcp-servers)
- [Security](#security)
- [Troubleshooting](#troubleshooting)

---

## Overview

MCP servers give Claude Code access to:

- **External Tools**: GitHub, Slack, Jira, etc.
- **Databases**: PostgreSQL, MySQL, MongoDB
- **APIs**: REST endpoints, GraphQL
- **File Systems**: Cloud storage, local files
- **Documentation**: Up-to-date library docs

### How It Works

```
Claude Code <---> MCP Protocol <---> MCP Server <---> External Service
```

1. Claude Code connects to MCP servers via stdio or HTTP
2. MCP servers expose tools that Claude can invoke
3. Tools return results that Claude uses to help you

---

## Configuration

### File Location

Configure MCP servers in `.mcp.json` at your project root:

```json
{
  "mcpServers": {
    "server-name": {
      "command": "npx",
      "args": ["-y", "@package/mcp-server"],
      "env": {
        "API_KEY": "${API_KEY}"
      }
    }
  }
}
```

### Configuration Options

| Option | Description | Example |
|--------|-------------|---------|
| `command` | Executable to run | `"npx"`, `"node"`, `"python"` |
| `args` | Command arguments | `["-y", "@package/server"]` |
| `env` | Environment variables | `{"API_KEY": "${API_KEY}"}` |
| `url` | HTTP server URL (alternative) | `"http://localhost:3000"` |

### Environment Variables

Reference environment variables with `${VAR_NAME}`:

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

### OAuth Client Credentials (v2.1.30+)

For MCP servers that don't support Dynamic Client Registration (e.g., Slack), use the `--client-id` and `--client-secret` flags:

```bash
claude mcp add --client-id YOUR_CLIENT_ID --client-secret YOUR_CLIENT_SECRET slack -- npx -y @modelcontextprotocol/server-slack
```

| Flag | Description |
|------|-------------|
| `--client-id` | OAuth client ID for the MCP server |
| `--client-secret` | OAuth client secret for the MCP server |

**When to use:** Servers that require pre-registered OAuth application credentials rather than relying on Dynamic Client Registration.

---

## Popular MCP Servers

### GitHub

Access issues, PRs, repositories, and actions.

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

**Available Tools:**
- `search_repositories` - Search GitHub repos
- `get_file_contents` - Read files from repos
- `create_issue` - Create new issues
- `create_pull_request` - Create PRs
- `list_commits` - Get commit history

### PostgreSQL

Query and analyze your database.

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

**Available Tools:**
- `query` - Execute SQL queries
- `list_tables` - Show database tables
- `describe_table` - Get table schema

### Slack

Send messages and manage channels.

```json
{
  "mcpServers": {
    "slack": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-slack"],
      "env": {
        "SLACK_BOT_TOKEN": "${SLACK_BOT_TOKEN}",
        "SLACK_TEAM_ID": "${SLACK_TEAM_ID}"
      }
    }
  }
}
```

**Available Tools:**
- `send_message` - Send messages to channels
- `list_channels` - Get channel list
- `get_channel_history` - Read messages

### Filesystem

Enhanced file operations.

```json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "/allowed/path"]
    }
  }
}
```

### Puppeteer

Browser automation and web scraping.

```json
{
  "mcpServers": {
    "puppeteer": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-puppeteer"]
    }
  }
}
```

---

## Context7 - Documentation Server

Context7 is a powerful MCP server that provides **up-to-date documentation** for any library directly in your prompts. No more outdated code suggestions!

### Installation

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

Or via Claude Code CLI:
```bash
claude mcp add context7 -- npx -y @upstash/context7-mcp
```

### Usage

Simply add **"use context7"** to your prompt:

```
use context7 to help me implement FastAPI authentication
```

```
Show me how to use React hooks with TypeScript (use context7)
```

### Version-Specific Docs

Mention the version you need:

```
How do I set up Next.js 14 middleware? (use context7)
```

Context7 automatically fetches the correct documentation version.

### Available Tools

| Tool | Purpose |
|------|---------|
| `resolve-library-id` | Find Context7 library ID |
| `query-docs` | Get documentation for a library |

### Example Session

```
You: use context7 to show me how to create a Symfony form with validation

Claude: [Uses Context7 to fetch current Symfony 7.2 documentation]
        Here's how to create a form with validation in Symfony 7.2...
```

### Supported Libraries

Context7 supports thousands of libraries including:
- React, Vue, Angular, Next.js, Nuxt
- Symfony, Laravel, Django, FastAPI
- Flutter, React Native
- PostgreSQL, MongoDB, Redis
- AWS SDK, Google Cloud, Azure
- And many more...

---

## Custom MCP Servers

### Creating Your Own Server

1. **Use the MCP SDK:**
   ```bash
   npm install @modelcontextprotocol/sdk
   ```

2. **Define your server:**
   ```javascript
   import { Server } from "@modelcontextprotocol/sdk/server/index.js";
   import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

   const server = new Server({
     name: "my-mcp-server",
     version: "1.0.0"
   }, {
     capabilities: {
       tools: {}
     }
   });

   server.setRequestHandler("tools/list", async () => ({
     tools: [{
       name: "my_tool",
       description: "Does something useful",
       inputSchema: {
         type: "object",
         properties: {
           param: { type: "string" }
         }
       }
     }]
   }));

   server.setRequestHandler("tools/call", async (request) => {
     if (request.params.name === "my_tool") {
       // Your tool logic here
       return { content: [{ type: "text", text: "Result" }] };
     }
   });

   const transport = new StdioServerTransport();
   await server.connect(transport);
   ```

3. **Configure in .mcp.json:**
   ```json
   {
     "mcpServers": {
       "my-server": {
         "command": "node",
         "args": ["./my-mcp-server.js"]
       }
     }
   }
   ```

### HTTP/SSE Servers

For remote servers, use HTTP transport:

```json
{
  "mcpServers": {
    "remote-server": {
      "url": "https://my-server.com/mcp",
      "headers": {
        "Authorization": "Bearer ${API_TOKEN}"
      }
    }
  }
}
```

---

## Security

### Best Practices

1. **Use environment variables for secrets:**
   ```json
   "env": {
     "API_KEY": "${MY_API_KEY}"
   }
   ```

2. **Limit file system access:**
   ```json
   "args": ["-y", "@mcp/server-filesystem", "/specific/path"]
   ```

3. **Review server source code** before using community servers

4. **Use read-only tokens** when possible

### Token Management

| Service | Token Type | Where to Get |
|---------|------------|--------------|
| GitHub | Personal Access Token | Settings > Developer Settings |
| Slack | Bot Token | api.slack.com/apps |
| PostgreSQL | Connection String | Your database provider |
| Context7 | None required | Free to use |

### Permissions

Configure MCP tool permissions in `settings.json`:

```json
{
  "permissions": {
    "allow": ["mcp__github__*"],
    "deny": ["mcp__filesystem__write_file"]
  }
}
```

---

## Troubleshooting

### Server Not Starting

1. Check command exists:
   ```bash
   npx -y @package/server --version
   ```

2. Verify environment variables are set:
   ```bash
   echo $GITHUB_TOKEN
   ```

3. Check `.mcp.json` syntax is valid JSON

### Tools Not Available

1. Restart Claude Code after adding server
2. Check server logs for errors
3. Verify server capabilities include tools

### Connection Issues

For HTTP servers:
- Check URL is accessible
- Verify authentication headers
- Check firewall rules

### Token Limits

MCP tool outputs are limited:
- Warning at 10,000 tokens
- Maximum 25,000 tokens

For large outputs, use pagination or filtering.

### Common Errors

| Error | Solution |
|-------|----------|
| "Server not found" | Check command path |
| "Connection refused" | Verify server is running |
| "Unauthorized" | Check API tokens |
| "Tool not found" | Restart Claude Code |

---

## Complete Example Configuration

```json
{
  "mcpServers": {
    "context7": {
      "command": "npx",
      "args": ["-y", "@upstash/context7-mcp"]
    },
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "${GITHUB_TOKEN}"
      }
    },
    "postgres": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-postgres"],
      "env": {
        "POSTGRES_CONNECTION_STRING": "${DATABASE_URL}"
      }
    },
    "slack": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-slack"],
      "env": {
        "SLACK_BOT_TOKEN": "${SLACK_BOT_TOKEN}",
        "SLACK_TEAM_ID": "${SLACK_TEAM_ID}"
      }
    }
  }
}
```

---

## Related Documentation

- [Hooks](/docs/HOOKS.md) - Automated workflows
- [Skills](/docs/SKILLS.md) - Model-invoked capabilities
- [Settings](/docs/CONFIGURATION.md) - Configuration options

---

## Sources

- [Claude Code MCP Documentation](https://code.claude.com/docs/en/mcp)
- [Model Context Protocol](https://modelcontextprotocol.io/)
- [Context7 GitHub](https://github.com/upstash/context7)
- [MCP Servers Collection](https://github.com/modelcontextprotocol/servers)
