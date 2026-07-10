# AI Craft User Guide
# Multi-AI Development Framework

## Table of Contents

1. [Introduction](#introduction)
2. [Installation](#installation)
3. [Getting Started](#getting-started)
4. [Provider Configuration](#provider-configuration)
5. [MCP Servers](#mcp-servers)
6. [Hooks](#hooks)
7. [Shared Memory](#shared-memory)
8. [Migration from Claude Craft](#migration-from-claude-craft)
9. [Command Reference](#command-reference)
10. [Best Practices](#best-practices)
11. [Troubleshooting](#troubleshooting)

---

## Introduction

AI Craft is a comprehensive multi-AI development framework that extends the proven Claude Craft methodology to work seamlessly with multiple AI providers. Whether you're using **Vibe (Mistral AI)**, **Codex (OpenAI)**, **OpenCode (sst/opencode)**, **Claude Code (Anthropic)**, or **Cursor CLI**, AI Craft provides a unified interface for installing rules, agents, commands, and workflows.

> **GitHub Copilot is not currently supported** — there is no `copilot-provider.js` in `cli/lib/provider/`. GitHub Copilot CLI (`github.com/github/copilot-cli`) is a real, separate product that could be added as a future provider.

### Key Features

- ✅ **Multi-Provider Support**: Works with Vibe, Codex, OpenCode, Claude Code, Cursor, and more
- ✅ **MCP Integration**: Full Model Context Protocol support with auto-discovery
- ✅ **Shared Memory**: Conversation history and context shared across providers
- ✅ **Hook System**: Pre/post command and message hooks for each provider
- ✅ **Backward Compatible**: 100% compatible with existing Claude Craft projects
- ✅ **Easy Migration**: Automatic migration tool for Claude Craft projects

### Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    AI Craft CLI                                │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │   Vibe      │  │   Codex      │  │    OpenCode         │  │
│  │ (Mistral)   │  │ (OpenAI)     │  │ (sst/opencode)      │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
│  ┌─────────────┐  ┌─────────────┐                          │
│  │   Claude    │  │   Cursor     │                          │
│  │ (Anthropic) │  │ (CLI)        │                          │
│  └─────────────┘  └─────────────┘                          │
└─────────────────────────────────────────────────────────────┘
         │              │              │
         ▼              ▼              ▼
┌─────────────────────────────────────────────────────────────┐
│                 Shared Memory & MCP                           │
├─────────────────────────────────────────────────────────────┤
│  • Conversation History                                        │
│  • Project Context                                             │
│  • User Preferences                                           │
│  • MCP Servers (filesystem, git, process, custom)             │
└─────────────────────────────────────────────────────────────┘
```

---

## Installation

### Global Installation

```bash
# Install AI Craft globally
npm install -g @ai-craft/core

# Verify installation
ai-craft --version
# Output: 9.0.0
```

### Local Installation (in a project)

```bash
# Initialize AI Craft in your project
npx @ai-craft/core init-ai-craft

# Or install to a specific directory
npx @ai-craft/core install ./my-project
```

### From Source

```bash
# Clone the repository
git clone https://github.com/TheBeardedBearSAS/ai-craft.git
cd ai-craft

# Install dependencies
npm install

# Link globally
npm link

# Run
ai-craft --version
```

---

## Getting Started

### Quick Start

```bash
# Navigate to your project
cd my-project

# Initialize AI Craft
ai-craft init-ai-craft

# List available AI providers
ai-craft providers

# Set your preferred provider
ai-craft use vibe

# Install rules for your tech stack
ai-craft install --tech=symfony
```

### Project Structure

After initialization, your project will have the following structure:

```
my-project/
├── .ai-craft/                    # AI Craft configuration
│   ├── AI-CRAFT.md              # Main AI instructions
│   ├── ai-craft.yaml            # Configuration file
│   ├── providers/               # Provider-specific configs
│   │   ├── vibe/
│   │   │   ├── config/
│   │   │   │   └── default.yaml
│   │   │   ├── hooks/
│   │   │   │   ├── pre-execute.sh
│   │   │   │   └── post-execute.sh
│   │   │   └── mcp/
│   │   ├── codex/
│   │   ├── opencode/
│   │   ├── claude/
│   │   └── cursor/
│   ├── rules/                   # AI rules
│   ├── agents/                  # AI agents
│   ├── commands/                # Slash commands
│   ├── skills/                  # Community skills
│   ├── templates/               # Project templates
│   ├── memory/                  # Shared memory
│   │   ├── conversations/
│   │   ├── project-state.json
│   │   └── user-preferences.json
│   └── mcp/                     # Global MCP servers
└── .claude/                     # Symlink to .ai-craft/ (backward compatible)
```

### Using with Different Providers

```bash
# List all available providers
ai-craft providers

# Show provider health status
ai-craft provider-status

# Set default provider for this project
ai-craft use vibe

# Override provider for a single command
ai-craft --provider=codex install ./my-project
```

---

## Provider Configuration

### Viewing Configuration

```bash
# Show current configuration
ai-craft config show

# Get a specific value
ai-craft config show | grep primary
```

### Setting Configuration

```bash
# Set default provider
ai-craft config set providers.primary vibe

# Set model routing
ai-craft config set optimization.model_routing auto

# Set memory settings
ai-craft config set memory.enabled true
```

### Provider-Specific Configuration

Each provider has its own configuration file at `.ai-craft/providers/<name>/config/default.yaml`:

**Vibe Configuration Example:**
```yaml
provider:
  name: vibe
  display_name: "Vibe (Mistral AI)"
  binary: "vibe"

model:
  default: "mistral-large-3.5"
  aliases:
    opus: "mistral-large-3.5"
    sonnet: "mistral-medium-3.5"
    haiku: "mistral-small-3.5"

mcp:
  enabled: true
  servers:
    filesystem: true
    git: true
    process: true
```

**Changing Provider Models:**
```yaml
model:
  default: "mistral-large-3.5"
  routing:
    architecture: "mistral-large-3.5"
    code_review: "mistral-medium-3.5"
    implementation: "mistral-medium-3.5"
    quick: "mistral-small-3.5"
```

---

## MCP Servers

### What is MCP?

MCP (Model Context Protocol) is a standard for connecting AI models to tools, APIs, and data sources. AI Craft supports MCP servers across all providers, enabling consistent tool access regardless of which AI you use.

### Built-in MCP Servers

Each provider comes with built-in MCP servers:

| Server | Description | Vibe | Codex | OpenCode | Claude | Cursor |
|--------|-------------|------|-------|----------|--------|--------|
| filesystem | File system access | ✅ | ✅ | ✅ | ✅ | ✅ |
| git | Git repository access | ✅ | ✅ | ✅ | ✅ | ✅ |
| process | Process execution | ✅ | ❌ | ✅ | ❌ | ❌ |

### Managing MCP Servers

```bash
# List all MCP servers for current provider
ai-craft mcp list

# Add a custom MCP server
ai-craft mcp add my-server --command="npx" --args="-y,@modelcontextprotocol/server-postgres" --description="PostgreSQL access"

# Start all MCP servers
ai-craft mcp start
```

### Custom MCP Server Configuration

Create a JSON file in `.ai-craft/providers/<name>/mcp/` or `.ai-craft/mcp/`:

```json
{
  "name": "postgres",
  "description": "PostgreSQL database access",
  "command": "npx",
  "args": ["-y", "@modelcontextprotocol/server-postgres"],
  "env": {
    "DATABASE_URL": "postgresql://user:password@localhost:5432/db"
  },
  "timeout": 30,
  "enabled": true,
  "auto_start": true
}
```

### Common MCP Servers

- `@modelcontextprotocol/server-filesystem` - File system access
- `@modelcontextprotocol/server-git` - Git repository access
- `@modelcontextprotocol/server-process` - Process execution
- `@modelcontextprotocol/server-sqlite` - SQLite database access
- `@modelcontextprotocol/server-postgres` - PostgreSQL access

---

## Hooks

Hooks allow you to execute custom scripts before and after AI commands. They're useful for:

- Environment validation
- Logging
- Custom preprocessing
- Post-processing responses
- Error handling

### Hook Types

1. **pre-execute.sh** - Runs before any command execution
2. **post-execute.sh** - Runs after command execution
3. **pre-message.sh** - Runs before sending a message
4. **post-message.sh** - Runs after receiving a response

### Hook Location

Hooks are located at `.ai-craft/providers/<name>/hooks/`:

```
.ai-craft/
└── providers/
    └── vibe/
        └── hooks/
            ├── pre-execute.sh
            └── post-execute.sh
```

### Example Hook: pre-execute.sh

```bash
#!/bin/bash
# AI Craft - Vibe Provider Pre-Execute Hook

# Check if API key is set
if [[ -z "${MISTRAL_API_KEY:-}" ]]; then
  echo "⚠️  MISTRAL_API_KEY not set" >&2
  exit 1
fi

# Set system prompt from AI-CRAFT.md
if [[ -f ".ai-craft/AI-CRAFT.md" ]]; then
  export VIBE_SYSTEM_PROMPT="$(cat .ai-craft/AI-CRAFT.md)"
fi

exit 0
```

### Creating Custom Hooks

1. Create a hooks directory:
```bash
mkdir -p .ai-craft/providers/vibe/hooks
```

2. Create your hook script:
```bash
cat > .ai-craft/providers/vibe/hooks/pre-execute.sh << 'EOF'
#!/bin/bash
# My custom pre-execute hook
echo "Running custom pre-execute hook..."
# Add your custom logic here
exit 0
EOF
chmod +x .ai-craft/providers/vibe/hooks/pre-execute.sh
```

3. Enable the hook in configuration:
```yaml
# In .ai-craft/providers/vibe/config/default.yaml
hooks:
  enabled: true
  pre_command:
    - "pre-execute.sh"
    - "custom-pre-execute.sh"
  post_command:
    - "post-execute.sh"
```

---

## Shared Memory

AI Craft provides a shared memory system that allows different providers to share:

- **Conversations**: Message history across providers
- **Project Context**: Shared project information
- **User Preferences**: User-specific settings
- **Cache**: Temporary data storage

### Using Shared Memory

```bash
# Memory is automatically available through the AI Craft CLI
# You can access it programmatically in your scripts
```

### Programmatic Access

```javascript
import { memoryManager } from '@ai-craft/core/cli/lib/memory.js';

// Get or create a conversation
const conversation = memoryManager.getConversation('session-1', {
  provider: 'vibe',
  model: 'mistral-large-3.5'
});

// Add messages
memoryManager.addMessage('session-1', {
  role: 'user',
  content: 'Hello!'
});

// Get conversation history
const history = memoryManager.getHistory('session-1', 10);

// Set user preferences
memoryManager.setPreference('theme', 'dark');
const theme = memoryManager.getPreference('theme');

// Use cache
memoryManager.setCache('temp-data', { foo: 'bar' }, 60000); // 60s TTL
const data = memoryManager.getCache('temp-data');
```

### Memory Structure

```
.ai-craft/memory/
├── conversations/           # Conversation history (JSON files)
│   ├── session-1.json
│   └── session-2.json
├── project-state.json      # Project context and state
└── user-preferences.json   # User preferences
```

---

## Migration from Claude Craft

AI Craft provides seamless migration from Claude Craft projects.

### Automatic Migration

```bash
# Navigate to your Claude Craft project
cd my-claude-craft-project

# Run the migration
npx @ai-craft/core migrate

# Or use the init command
npx @ai-craft/core init-ai-craft
```

### What Gets Migrated

| Component | Migration Status | Notes |
|-----------|-----------------|-------|
| `.claude/CLAUDE.md` | ✅ Migrated | → `.ai-craft/AI-CRAFT.md` |
| `.claude/settings.json` | ✅ Migrated | Settings adapted for multi-provider |
| `.claude/context.yaml` | ✅ Migrated | → `.ai-craft/ai-craft.yaml` |
| `.claude/rules/` | ✅ Migrated | Copied to `.ai-craft/rules/` |
| `.claude/agents/` | ✅ Migrated | Copied to `.ai-craft/agents/` |
| `.claude/commands/` | ✅ Migrated | Copied to `.ai-craft/commands/` |
| `.claude/skills/` | ✅ Migrated | Copied to `.ai-craft/skills/` |
| `.claude/templates/` | ✅ Migrated | Copied to `.ai-craft/templates/` |
| `.claude/mcp/` | ✅ Migrated | Copied to `.ai-craft/mcp/` |
| `.claude/` symlink | ✅ Created | Points to `.ai-craft/` for backward compatibility |

### Manual Migration Steps

If you prefer to migrate manually:

1. Create `.ai-craft/` directory
2. Copy all files from `.claude/` to `.ai-craft/`
3. Rename `CLAUDE.md` to `AI-CRAFT.md`
4. Update references from `.claude/` to `.ai-craft/`
5. Create provider-specific directories
6. Create symlink: `ln -s .ai-craft .claude`

### Post-Migration

After migration, you can:

```bash
# Verify the migration
ai-craft doctor

# Set your preferred provider
ai-craft use vibe

# Check provider status
ai-craft provider-status

# Start using AI Craft
npx @ai-craft/core install --tech=symfony
```

---

## Command Reference

### Main Commands

| Command | Description |
|---------|-------------|
| `ai-craft --version` | Show version |
| `ai-craft --help` | Show help |
| `ai-craft install` | Interactive installation |
| `ai-craft install <path>` | Install to specific directory |
| `ai-craft install --auto` | Auto-install (no prompts) |
| `ai-craft install --tech=<name>` | Install for specific technology |
| `ai-craft init-ai-craft` | Initialize AI Craft |

### Provider Commands

| Command | Description |
|---------|-------------|
| `ai-craft providers` | List all providers |
| `ai-craft provider-status` | Show provider health |
| `ai-craft use <provider>` | Set default provider |
| `ai-craft --provider=<name> <cmd>` | Override provider for command |

### MCP Commands

| Command | Description |
|---------|-------------|
| `ai-craft mcp list` | List MCP servers |
| `ai-craft mcp add <name> [options]` | Add custom MCP server |
| `ai-craft mcp start` | Start MCP servers |

### Configuration Commands

| Command | Description |
|---------|-------------|
| `ai-craft config show` | Show configuration |
| `ai-craft config set <key> <value>` | Set configuration value |
| `ai-craft config edit` | Edit configuration in editor |

### Migration Commands

| Command | Description |
|---------|-------------|
| `ai-craft migrate` | Migrate Claude Craft project |
| `ai-craft migrate <path>` | Migrate project at path |

### Legacy Commands (Backward Compatible)

All Claude Craft commands still work:

| Command | Description |
|---------|-------------|
| `claude-craft install` | Same as `ai-craft install` |
| `claude-craft --version` | Same as `ai-craft --version` |
| All `/workflow:*` commands | Still work |
| All `/common:*` commands | Still work |

### MCP Server Command Options

| Option | Description | Example |
|--------|-------------|---------|
| `--command=<cmd>` | Command to execute | `--command=npx` |
| `--args=<args>` | Comma-separated arguments | `--args="-y,@modelcontextprotocol/server-postgres"` |
| `--description=<desc>` | Server description | `--description="PostgreSQL access"` |
| `--timeout=<seconds>` | Timeout in seconds | `--timeout=30` |

### Configuration Keys

You can set any configuration key using dot notation:

```bash
# Set primary provider
ai-craft config set providers.primary vibe

# Set fallback providers
ai-craft config set providers.fallback[0] codex

# Set memory settings
ai-craft config set memory.enabled true

# Set optimization settings
ai-craft config set optimization.prompt_caching true
```

---

## Best Practices

### 1. Start Small

Begin with the default configuration and add customizations incrementally.

### 2. Use Provider-Specific Configurations

Each provider has different strengths. Configure them appropriately:

- **Vibe**: Great for coding tasks, use with Mistral models
- **Codex**: OpenAI's terminal coding agent, deep GitHub integration
- **OpenCode**: 75+ cloud model providers via Models.dev, optional self-hosted backend
- **Claude Code**: Proven reliability, excellent for complex tasks
- **Cursor CLI**: Full standalone terminal agent, scriptable in CI/SSH

### 3. Enable MCP Servers Incrementally

Start with built-in MCP servers (filesystem, git) and add custom servers as needed.

### 4. Use Hooks for Validation

Create pre-execute hooks to validate your environment before running AI commands.

### 5. Share Context Between Providers

Use the shared memory system to maintain context when switching between providers.

### 6. Keep Configuration Under Version Control

Commit your `.ai-craft/ai-craft.yaml` and provider configurations to version control, but exclude:

```
.ai-craft/memory/
.ai-craft/logs/
.ai-craft/mcp/*.json  # If they contain API keys
```

### 7. Regularly Update

AI Craft is actively developed. Update regularly:

```bash
npm update -g @ai-craft/core
```

---

## Troubleshooting

### Common Issues

#### "Provider not found"

```bash
# Check installed providers
ai-craft providers

# Install missing provider
# For Vibe: npm install -g @vibe/cli
# For Codex: npm install -g @openai/codex
# For OpenCode: npm install -g opencode-ai
# For Claude Code: Follow Anthropic instructions
# For Cursor: curl https://cursor.com/install -fsS | bash
```

#### "MCP server not starting"

```bash
# MCP auto-start is not yet implemented (startAllMCPServers() is a stub
# that registers servers without spawning a process) - there is no
# .ai-craft/logs/mcp.log to check. Start servers manually for now, see
# .ai-craft/providers/MCP-README.md.

# Test server manually
npx @modelcontextprotocol/server-filesystem --help

# Check permissions
ls -la .ai-craft/providers/*/mcp/
chmod +x .ai-craft/providers/*/mcp/*.json
```

#### "Hook failed"

```bash
# Check hook logs
tail -f .ai-craft/logs/*-hooks.log

# Test hook manually
bash .ai-craft/providers/vibe/hooks/pre-execute.sh

# Fix permissions
chmod +x .ai-craft/providers/*/hooks/*.sh
```

#### "Memory not persisting"

```bash
# Check memory directory exists
ls -la .ai-craft/memory/

# Check permissions
chmod -R 755 .ai-craft/memory/
```

### Debug Mode

Enable debug logging:

```bash
DEBUG=ai-craft* ai-craft providers
```

### Resetting AI Craft

```bash
# Remove AI Craft directory
rm -rf .ai-craft/

# Reinitialize
npx @ai-craft/core init-ai-craft
```

### Checking Environment

```bash
# Check Node.js version (requires >= 22.0.0)
node --version

# Check npm version
npm --version

# Check AI Craft version
ai-craft --version
```

---

## Support

- **Documentation**: [https://github.com/TheBeardedBearSAS/ai-craft](https://github.com/TheBeardedBearSAS/ai-craft)
- **Issues**: [GitHub Issues](https://github.com/TheBeardedBearSAS/ai-craft/issues)
- **Discussions**: [GitHub Discussions](https://github.com/TheBeardedBearSAS/ai-craft/discussions)
- **Original Claude Craft**: [https://github.com/TheBeardedBearSAS/claude-craft](https://github.com/TheBeardedBearSAS/claude-craft)

---

*AI Craft - Multi-AI Development Framework | Version 9.0.0 | © 2026 TheBeardedCTO*
