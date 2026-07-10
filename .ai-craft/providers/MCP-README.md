# MCP (Model Context Protocol) Servers Configuration
# Multi-AI Development Framework - AI Craft

## Overview

MCP (Model Context Protocol) is a standard for connecting AI models to tools, APIs, and data sources. 
AI Craft supports MCP servers across all providers, enabling consistent tool access regardless of which AI you use.

## Directory Structure

```
.ai-craft/
├── providers/
│   ├── vibe/
│   │   └── mcp/           # Vibe-specific MCP servers
│   ├── codex/
│   │   └── mcp/          # Codex-specific MCP servers
│   ├── opencode/
│   │   └── mcp/          # OpenCode-specific MCP servers
│   ├── claude/
│   │   └── mcp/          # Claude-specific MCP servers
│   └── cursor/
│       └── mcp/          # Cursor-specific MCP servers
└── mcp/                 # Global MCP servers (shared across all providers)
```

## MCP Server Types

### 1. Built-in MCP Servers (Auto-Configured)

These are automatically available based on your provider:

| Provider | Built-in MCP Servers |
|----------|----------------------|
| Vibe | filesystem, git, process |
| Codex | filesystem (built-in), git (built-in) |
| OpenCode | filesystem, git, process |
| Claude Code | filesystem, git |
| Cursor | filesystem, git (native, via `agent mcp`) |

### 2. Standard MCP Servers

Available via npm packages:

```yaml
# In your ai-craft.yaml or provider config
mcp:
  servers:
    filesystem:
      command: "npx"
      args: ["-y", "@modelcontextprotocol/server-filesystem"]
    
    git:
      command: "npx"
      args: ["-y", "@modelcontextprotocol/server-git"]
    
    process:
      command: "npx"
      args: ["-y", "@modelcontextprotocol/server-process"]
    
    sqlite:
      command: "npx"
      args: ["-y", "@modelcontextprotocol/server-sqlite"]
```

### 3. Custom MCP Servers

You can create custom MCP servers in the `mcp/` directory of each provider. 
Each server should be a JSON configuration file:

```json
{
  "name": "my-custom-server",
  "description": "My custom MCP server",
  "command": "/path/to/server",
  "args": ["--arg1", "value1"],
  "env": {
    "API_KEY": "your-api-key"
  },
  "timeout": 30,
  "enabled": true
}
```

## Example: Adding a Database MCP Server

### Step 1: Create the MCP server configuration

```bash
# Create directory
mkdir -p .ai-craft/providers/vibe/mcp

# Create server config
cat > .ai-craft/providers/vibe/mcp/database-server.json << 'EOF'
{
  "name": "postgres",
  "description": "PostgreSQL database access via MCP",
  "command": "npx",
  "args": ["-y", "@modelcontextprotocol/server-postgres"],
  "env": {
    "DATABASE_URL": "postgresql://user:password@localhost:5432/db"
  }
}
EOF
```

### Step 2: Enable in provider configuration

```yaml
# In .ai-craft/providers/vibe/config/custom.yaml
mcp:
  enabled: true
  servers:
    postgres:
      enabled: true
      command: "npx"
      args: ["-y", "@modelcontextprotocol/server-postgres"]
      env:
        DATABASE_URL: "postgresql://user:password@localhost:5432/db"
```

## Common MCP Server Packages

### Official MCP Servers
- `@modelcontextprotocol/server-filesystem` - File system access
- `@modelcontextprotocol/server-git` - Git repository access
- `@modelcontextprotocol/server-process` - Process execution
- `@modelcontextprotocol/server-sqlite` - SQLite database access
- `@modelcontextprotocol/server-postgres` - PostgreSQL database access

### Community MCP Servers
- `mcp-server-fetch` - HTTP requests and web scraping
- `mcp-server-notion` - Notion API integration
- `mcp-server-github` - GitHub API integration
- `mcp-server-slack` - Slack API integration
- `mcp-server-redis` - Redis database access

## MCP Server Configuration Options

| Option | Type | Description | Default |
|--------|------|-------------|---------|
| `name` | string | Server identifier | Required |
| `description` | string | Human-readable description | "" |
| `command` | string | Executable command | Required |
| `args` | array | Command arguments | [] |
| `env` | object | Environment variables | {} |
| `timeout` | number | Timeout in seconds | 30 |
| `enabled` | boolean | Whether server is enabled | true |
| `auto_start` | boolean | Start server automatically | true |

## Provider-Specific MCP Notes

### Vibe
- Full MCP support via CLI
- Supports all standard MCP servers
- Can load custom MCP servers from npm

### Codex
- Built-in filesystem and git access
- Supports custom MCP servers
- Requires an OpenAI API key (`OPENAI_API_KEY`)

### OpenCode
- Excellent MCP support
- Built-in filesystem, git, process
- Supports custom MCP directories

### Claude Code
- MCP support via CLI
- Built-in filesystem (read-only)
- Requires manual MCP server configuration

### Cursor
- Native MCP support via the CLI (`agent mcp`, shared `mcp.json`)
- Built-in filesystem and git
- Supports custom MCP servers

## Best Practices

1. **Start with built-in servers**: Use the built-in filesystem and git servers first
2. **Add incrementally**: Add MCP servers as you need them
3. **Secure credentials**: Never commit API keys to version control
4. **Test locally**: Test MCP servers locally before deploying
5. **Monitor performance**: MCP servers add latency, monitor their impact

## Troubleshooting

### MCP server not starting

> **Auto-start is not yet implemented.** `startAllMCPServers()` (in
> `cli/lib/ai-provider.js`) currently only *registers* servers - it does
> not spawn any real process, so there is no `.ai-craft/logs/mcp.log` to
> tail. Running `ai-craft mcp start` will print `⚠️  MCP servers
> registered (N) — auto-start is not yet implemented`. Until real
> process management ships, start each MCP server manually.

```bash
# Start a server manually with the same command/args from your config
npx -y @modelcontextprotocol/server-filesystem

# Test server manually
npx @modelcontextprotocol/server-filesystem --help
```

### Permission issues
```bash
# Ensure executable permissions
chmod +x .ai-craft/providers/*/mcp/*.json

# Check directory permissions
ls -la .ai-craft/providers/*/mcp/
```

### Connection timeout
```yaml
# Increase timeout in configuration
mcp:
  servers:
    slow-server:
      timeout: 120  # 2 minutes
```

## Resources

- [MCP Specification](https://github.com/modelcontextprotocol/specification)
- [MCP Servers Registry](https://github.com/modelcontextprotocol/servers)
- [AI Craft MCP Documentation](https://github.com/TheBeardedBearSAS/ai-craft/blob/main/docs/mcp.md)
