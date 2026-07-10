# AI Craft - Multi-AI Development Framework

**Version:** 9.0.0 | **Providers:** Vibe, Codex, OpenCode, Claude Code, Cursor  
**Legacy:** Compatible with existing Claude Craft installations

A comprehensive AI-assisted development framework compatible with **multiple AI providers**. This framework extends the proven Claude Craft methodology to work seamlessly with Vibe, Codex, OpenCode, Claude Code, Cursor, and other AI coding assistants.

---

## 🎯 Core Philosophy

AI Craft maintains the same core principles as Claude Craft, but abstracts away the provider-specific dependencies to enable true multi-AI compatibility:

1. **Provider Agnostic** - Works with any supported AI provider
2. **Workflow First** - Standardized development workflows across all providers
3. **Quality Gates** - Consistent quality standards regardless of AI backend
4. **Token Optimization** - Intelligent routing and caching for all providers
5. **Backward Compatible** - Existing Claude Craft projects continue to work

---

## 🤖 Supported AI Providers

| Provider | Status | Models | CLI | MCP Support | Hooks |
|----------|--------|--------|-----|-------------|--------|
| **Vibe** (Mistral AI) | ✅ Tier 1 | mistral-large, mistral-medium, mistral-small | ✅ | ✅ | ✅ |
| **Codex** (OpenAI) | ✅ Tier 1 | gpt-5-codex, gpt-5-codex-mini | ✅ | ✅ Native | ✅ Via GitHub |
| **OpenCode** (sst/opencode) | ✅ Tier 1 | 75+ cloud providers via Models.dev (Anthropic, OpenAI, Google, DeepSeek, Qwen, ...) | ✅ | ✅ | ✅ |
| **Claude Code** (Anthropic) | ✅ Tier 1 | opus-4.8, sonnet-5, haiku-4.5 | ✅ | ✅ | ✅ |
| **Cursor CLI** | ⚠️ Tier 2 | gpt-4o, claude-3-5-sonnet, +more (multi-model) | ✅ | ✅ Native | ⚠️ Partial |

> **GitHub Copilot** is not currently supported: there is no `copilot-provider.js` in `cli/lib/provider/` (see Contributing → Adding a New AI Provider to add one). GitHub Copilot CLI is a real, separate product (`github.com/github/copilot-cli`, GA since 2026-06) and could be integrated in a future release.

---

## 📁 Project Structure (AI Craft)

```
project-root/
├── .ai-craft/                  # ✅ NEW: Primary configuration directory
│   ├── AI-CRAFT.md             # This file - core instructions
│   ├── ai-craft.yaml           # Multi-provider configuration
│   ├── ai-craft-config.json    # Generic settings
│   ├── providers/              # Provider-specific configurations
│   │   ├── vibe.yaml
│   │   ├── codex.yaml
│   │   ├── opencode.yaml
│   │   └── claude.yaml
│   ├── agents/                 # Multi-provider agents
│   ├── commands/               # Framework commands
│   ├── skills/                 # Universal skills
│   ├── templates/              # Code generation templates
│   └── memory/                 # Cross-session memory
│
├── .claude/                    # ⚠️ LEGACY: Symlink to .ai-craft/ for backward compatibility
│   └── ... (symlink to .ai-craft/ contents)
│
├── .bmad/                     # BMAD v6 framework (unchanged)
│   ├── sprint-status.yaml
│   ├── gates/
│   └── hooks/
│
└── ... (your project files)
```

---

## 🚀 Quick Start

### For New Projects

```bash
# Install AI Craft (detects your preferred AI provider automatically)
npx @ai-craft/core install ~/my-project

# Or specify a provider explicitly
npx @ai-craft/core install ~/my-project --provider=vibe
npx @ai-craft/core install ~/my-project --provider=codex
npx @ai-craft/core install ~/my-project --provider=opencode

# Start your AI assistant
cd ~/my-project
vibe                    # For Vibe users
codex                   # For Codex users
opencode                # For OpenCode users
claude                  # For Claude Code users (backward compatible)
```

### For Existing Claude Craft Projects

```bash
# Migrate your existing project to AI Craft
npx @ai-craft/core migrate ~/my-project

# This will:
# 1. Create .ai-craft/ directory
# 2. Copy existing .claude/ contents to .ai-craft/
# 3. Create a symlink .claude/ -> .ai-craft/ for backward compatibility
# 4. Generate ai-craft.yaml with your current configuration
# 5. Update all references to use the new structure

# Continue using as before - everything still works!
claude
```

---

## 📋 Configuration

### Multi-Provider Configuration (`ai-craft.yaml`)

```yaml
version: "1.0.0"

# Primary provider and fallbacks
providers:
  primary: "vibe"             # Default provider to use
  fallback:                 # Fallback chain if primary is unavailable
    - "codex"
    - "claude:sonnet"
    - "opencode"

# Provider-specific settings
provider_settings:
  vibe:
    model: "mistral-large-3.5"
    timeout: 3600
    api_endpoint: "https://api.mistral.ai"
    
  codex:
    api_key: "${OPENAI_API_KEY}"
    model: "gpt-5-codex"
    
  opencode:
    model: "anthropic/claude-sonnet-4-20250514"  # provider-qualified id (Models.dev registry)
    # self_hosted_url: "http://localhost:8080"   # optional: `opencode run --attach <url>` for a self-hosted/OpenAI-compatible backend
    
  claude:
    model: "opus-4.8"
    fork_subagents: true

# Memory settings
memory:
  enabled: true
  scope: "project"           # "user", "project", or "session"
  storage: "file"           # "file", "sqlite", or "redis"

# Hooks settings  
hooks:
  enabled: true
  providers:               # Which hook systems to enable
    - "mcp"
    - "webhook"
    - "plugin"

# Token optimization
optimization:
  prompt_caching: true
  context_forking: true
  model_routing: "auto"    # "auto", "manual", or "disabled"

# Backward compatibility
compatibility:
  claude_craft: true      # Enable Claude Craft compatibility mode
  legacy_hooks: true       # Support old .claude/hooks/ format
```

### Provider-Specific Configuration

Each provider can have its own configuration file in `.ai-craft/providers/`.

**Example: `.ai-craft/providers/vibe.yaml`**
```yaml
# Vibe-specific settings
model: "mistral-large-3.5"
effort: "high"
temperature: 0.7
max_tokens: 128000

# MCP servers to load for Vibe
mcp_servers:
  filesystem:
    command: "npx"
    args: ["-y", "@modelcontextprotocol/server-filesystem"]
  git:
    command: "npx"
    args: ["-y", "@modelcontextprotocol/server-git"]

# Token optimization
optimization:
  compression_level: "aggressive"
  cache_ttl: 3600
```

---

## 🔌 AI Provider Manager

AI Craft introduces a **Provider Manager** that abstracts away provider-specific details:

```javascript
// In the CLI
const { providerManager } = require('./cli/lib/ai-provider.js');

// Detect the current provider
const provider = await providerManager.detectProvider();
// Returns: "vibe", "codex", "opencode", "claude", "cursor"

// Execute a command with the current provider
const result = await providerManager.execute('audit', ['--full']);

// Get provider-specific configuration
const config = providerManager.getConfig('vibe');
```

### Provider Detection Logic

1. **Explicit configuration** (highest priority) - Check `.ai-craft/ai-craft.yaml`
2. **Environment variables** - Check `VIBE_PROVIDER`, `CODEX_API_KEY`, `OPENCODE_ENDPOINT`
3. **Installed binaries** - Check for `vibe`, `codex`, `opencode`, `claude` in PATH
4. **Default fallback** - Use `claude` for backward compatibility

---

## 🛠️ Framework Components

### 1. BMAD v6 Workflow (Multi-Provider)

The **Build, Measure, Analyze, Deliver** methodology works identically across all providers:

| Phase | Command | Duration | Output |
|-------|---------|----------|--------|
| **Analyze** | `/workflow:init` | < 5 min | PRD, Backlog |
| **Plan** | `/pm:prd`, `/arch:design` | < 10 min | Tech Spec |
| **Design** | `/arch:techspec` | < 15 min | ADRs |
| **Implement** | `/dev:implement` | Variable | Code + Tests |
| **QA** | `/qa:recette`, `/qa:tdd` | < 30 min | Acceptance Tests |
| **Deliver** | `/gate:validate-*` | < 10 min | Quality Report |

**Tracks (adapt to your needs):**
- **Quick Flow** (< 5 min) - Bug fixes, hotfixes
- **Standard** (< 15 min) - New features
- **Enterprise** (< 30 min) - Platforms, migrations

### 2. QA Recette (Multi-Browser + Multi-AI)

Browser-based acceptance testing that works with any AI provider:

```bash
# Run acceptance tests for a user story
/qa:recette --scope=story --id=US-001

# Resume a previous test session
/qa:recette --resume=REC-20260708-143022

# Run regression tests
/qa:regression --check
```

**Golden Rule:** A fixed bug should NEVER reappear.
- Automatically generates regression tests for every bug fix
- Tests are provider-agnostic (work with any AI for analysis)
- Supports Chrome, Firefox, Edge via Playwright

**Prerequisites:**
- Playwright installed (`npm install -g playwright`)
- Browser installed (Chrome, Firefox, or Edge)

### 3. Ralph Wiggum Loop (Multi-Provider)

Continuous AI loop that runs until Definition of Done is met:

```bash
# Run a task in continuous mode
/common:ralph-run "Implement user authentication with TDD"

# With options
/common:ralph-run "Refactor the service layer" \
  --dod="All tests pass + code review approved" \
  --max-attempts=15 \
  --timeout=30m \
  --provider=vibe
```

**DoD Validators (work with any provider):**
- `command` - Run shell commands (tests, lint, build)
- `output_contains` - Check AI output for specific patterns
- `file_changed` - Verify files were modified
- `hook` - Integrate with existing hooks
- `human` - Interactive validation

### 4. Agents (70 Specialized + Multi-Provider)

All 70 agents now support multiple providers:

```markdown
---
name: symfony-reviewer
description: Expert in Symfony/PHP code review
providers:
  vibe:
    model: "mistral-large-3.5"
    effort: high
    memory: user
  codex:
    model: "gpt-5-codex"
    effort: high
    memory: project
  opencode:
    model: "anthropic/claude-sonnet-4-20250514"
    effort: high
    memory: session
  claude:
    model: "opus-4.8"
    effort: xhigh
    memory: user
---
```

**Using Agents:**
```text
# Works with any provider
@symfony-reviewer Review this controller for Clean Architecture compliance
@tdd-coach Guide me through TDD for this feature
@api-designer Design REST endpoints for user management
```

### 5. Token Optimization (Multi-Provider)

AI Craft optimizes token usage across all providers:

| Technique | Description | Savings |
|-----------|-------------|---------|
| **Context Forking** | Isolate heavy tasks in sub-agents | 30-40% |
| **Prompt Caching** | Cache frequent prompts (1 hour TTL) | 15-20% |
| **Model Routing** | Use most cost-effective model for task | 10-15% |
| **Output Compression** | Compress AI responses | 5-10% |
| **Total** | | **55-65%** |

**Provider-Specific Optimization:**

```yaml
# In ai-craft.yaml
optimization:
  model_routing:
    architecture: "opus-4.8"      # or "mistral-large-3.5" for Vibe
    code_review: "sonnet-5"       # or "gpt-5-codex" for Codex
    implementation: "sonnet-5"    # or "openai/gpt-5" for OpenCode
    quick_tasks: "haiku-4.5"      # or "mistral-small-3.5" for Vibe
```

---

## 🔄 Migration Guide from Claude Craft

### Step 1: Install AI Craft

```bash
# Install alongside your existing Claude Craft
npx @ai-craft/core install ~/my-project
```

### Step 2: Run the Migration Tool

```bash
# This will automatically migrate your project
npx @ai-craft/core migrate ~/my-project
```

What the migration does:
1. ✅ Creates `.ai-craft/` directory
2. ✅ Copies all files from `.claude/` to `.ai-craft/`
3. ✅ Creates a symlink `.claude/ -> .ai-craft/` for backward compatibility
4. ✅ Generates `ai-craft.yaml` with your current configuration
5. ✅ Updates agent frontmatter to multi-provider format
6. ✅ Validates the migration

### Step 3: Verify Everything Works

```bash
# Test with your preferred provider
cd ~/my-project
vibe

# Or continue using Claude Code - it still works!
claude
```

### Step 4: (Optional) Customize for Your Provider

```bash
# Edit your provider configuration
nano .ai-craft/providers/vibe.yaml

# Or switch to a different provider
npx @ai-craft/core config set primary codex
```

---

## 🎛️ Command Reference (Multi-Provider)

All 220 commands work identically across all providers:

### Core Commands

| Command | Description | Providers |
|---------|-------------|-----------|
| `/workflow:init` | Start development workflow | ✅ All |
| `/workflow:status` | Show current workflow status | ✅ All |
| `/workflow:auto-sprint` | Autonomous sprint orchestration | ✅ All |
| `/team:audit` | Full project audit | ✅ All |
| `/team:sprint` | Sprint management | ✅ All |

### Quality Commands

| Command | Description | Providers |
|---------|-------------|-----------|
| `/qa:tdd` | Test-Driven Development | ✅ All |
| `/qa:recette` | Browser-based acceptance testing | ✅ All |
| `/qa:fix` | Fix bugs with AI assistance | ✅ All |
| `/qa:regression` | Check regression tests | ✅ All |
| `/gate:validate-*` | Quality gate validation | ✅ All |

### Ralph Commands

| Command | Description | Providers |
|---------|-------------|-----------|
| `/common:ralph-run` | Continuous AI loop | ✅ All |
| `/common:ralph-status` | Show Ralph session status | ✅ All |
| `/common:ralph-stop` | Stop Ralph session | ✅ All |

---

## 📚 Provider-Specific Guides

### Vibe (Mistral AI)

**Installation:**
```bash
# Install Vibe CLI
curl -sSL https://vibe.mistral.ai | sh

# Install AI Craft for Vibe
npx @ai-craft/core install ~/my-project --provider=vibe

# Set your API key
export MISTRAL_API_KEY=your_api_key

# Start a session
vibe --system-prompts .ai-craft/AI-CRAFT.md
```

**Recommended Models:**
- **Architecture/Review:** `mistral-large-3.5`
- **Implementation:** `mistral-medium-3.5`
- **Quick Tasks:** `mistral-small-3.5`

**Vibe-Specific Features:**
- Native MCP support
- Excellent reasoning capabilities
- Cost-effective for most tasks

### Codex (OpenAI)

**Installation:**
```bash
# Install Codex CLI (github.com/openai/codex, developers.openai.com/codex)
npm install -g @openai/codex

# Install AI Craft for Codex
npx @ai-craft/core install ~/my-project --provider=codex

# Set your API key
export OPENAI_API_KEY=your_api_key

# Start a session
codex
```

**Recommended Models:**
- **Architecture / Implementation:** `gpt-5-codex`
- **Quick Tasks:** `gpt-5-codex-mini`

**Codex-Specific Features:**
- Deep GitHub integration
- Excellent code completion
- Strong infilling capabilities

### OpenCode (sst/opencode)

**Installation:**
```bash
# Install OpenCode (github.com/sst/opencode, opencode.ai)
npm install -g opencode-ai

# Install AI Craft for OpenCode
npx @ai-craft/core install ~/my-project --provider=opencode

# Authenticate with a cloud provider (or paste an API key when prompted)
opencode auth login

# Start a session
opencode
```

**Recommended Models** (provider-qualified ids, Models.dev registry — representative sample of 75+ supported providers):
- **Architecture / Implementation:** `anthropic/claude-sonnet-4-20250514`, `openai/gpt-5`
- **Alternative providers:** `google/gemini-2.5-pro`, `deepseek/deepseek-v4-pro`, `qwen/qwen3-coder-480b`

**OpenCode-Specific Features:**
- 75+ cloud model providers via Models.dev, resolved through `opencode auth login` or plain API key env vars (not self-hosted-only)
- Full MCP support
- Optional self-hosted / OpenAI-compatible backend via `opencode run --attach <url>`

### Claude Code (Anthropic)

**Backward Compatible - Works as Before:**
```bash
# Install AI Craft for Claude Code
npx @ai-craft/core install ~/my-project --provider=claude

# Or just use the existing installation
claude

# Everything continues to work!
/team:audit
/workflow:init
```

**Recommended Models:**
- **Complex Reasoning:** `opus-4.8`
- **Standard Tasks:** `sonnet-5`
- **Quick Tasks:** `haiku-4.5`

### Cursor CLI

**Installation:**
```bash
# Install Cursor CLI (cursor.com/cli, cursor.com/docs/cli/installation)
curl https://cursor.com/install -fsS | bash

# Install AI Craft for Cursor
npx @ai-craft/core install ~/my-project --provider=cursor

# Start a session (invoked as `agent`)
agent
```

**Notes:**
- Full standalone terminal agent since 2026 - not merely a VSCode extension
- Scriptable in CI/SSH via non-interactive mode (`-p`/`--output-format`)
- Native MCP support via `agent mcp` / shared `mcp.json`
- Uses underlying LLM providers (GPT-4o, Claude, etc.)

### GitHub Copilot (not implemented)

GitHub Copilot is **not currently supported** by AI Craft: no `copilot-provider.js` exists in `cli/lib/provider/`, and `--provider=copilot` is not a recognized option. GitHub Copilot CLI is a real, separate terminal agent (`github.com/github/copilot-cli`, GA since 2026-06) that could be integrated in a future release — see "Adding a New AI Provider" below if you want to contribute one.

---

## 🛡️ Security

AI Craft follows the same security principles as Claude Craft:

1. **API Key Management**
   - Never commit API keys to version control
   - Use environment variables or secret managers
   - Rotate keys regularly

2. **MCP Server Security**
   - Only use trusted MCP servers
   - Validate server URLs
   - Limit permissions

3. **Hook Validation**
   - All hooks are validated before execution
   - Sandboxing where possible
   - Input sanitization

4. **CVE Protection**
   - Regular dependency updates
   - Security audits
   - Proactive monitoring

**Security Configuration:**
```yaml
# In ai-craft.yaml
security:
  api_key_validation: true
  mcp_server_allowlist:
    - "npx -y @modelcontextprotocol/server-filesystem"
    - "npx -y @modelcontextprotocol/server-git"
  hook_sandboxing: true
  max_execution_time: 3600
```

---

## 📊 Performance & Optimization

### Model Routing Matrix

| Task Type | Vibe | Codex | OpenCode | Claude | Cursor |
|-----------|------|-------|----------|--------|--------|
| **Architecture Design** | mistral-large | gpt-5-codex | anthropic/claude-sonnet-4-20250514 | opus-4.8 | gpt-4o |
| **Code Review** | mistral-large | gpt-5-codex | openai/gpt-5 | sonnet-5 | gpt-4o |
| **Implementation** | mistral-medium | gpt-5-codex | openai/gpt-5 | sonnet-5 | gpt-4o |
| **Quick Fixes** | mistral-small | gpt-5-codex-mini | google/gemini-2.5-pro | haiku-4.5 | gpt-4o-mini |
| **Documentation** | mistral-medium | gpt-5-codex | openai/gpt-5 | sonnet-5 | gpt-4o |

### Token Usage Comparison

> **Not independently measured per provider.** The 55-65% figure quoted for Claude Craft's RTK optimization was measured specifically for Claude Code token usage. It has **not** been re-measured for this multi-provider architecture, and reusing it as-is across all six providers would be misleading: per-token cost varies radically between them (e.g. a paid Claude Opus/Sonnet or Codex API call vs. an OpenCode session routed through a near-$0 self-hosted/OpenAI-compatible backend). Until real per-provider benchmarks exist, treat any cross-provider savings claim in this document as unverified.

### Performance Benchmarks

| Operation | Vibe | Codex | OpenCode | Claude |
|-----------|------|-------|----------|--------|
| **Prompt Processing** | ⚡ Fast | ⚡ Fast | ⚡ Fast | ⚡ Fast |
| **Code Generation** | ⚡ Fast | ⚡⚡ Very Fast | ⚡ Fast | ⚡⚡ Very Fast |
| **Reasoning** | ⚡⚡⚡ Excellent | ⚡⚡ Good | ⚡⚡ Good | ⚡⚡⚡ Excellent |
| **Context Window** | 128K | 256K | 128K | 200K |

---

## 🤝 Contributing to AI Craft

AI Craft is 100% open-source (MIT License) and welcomes contributions!

### How to Contribute

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feat/my-feature`)
3. **Make your changes**
4. **Add tests** (required for all new features)
5. **Update documentation**
6. **Submit a Pull Request**

### Contribution Guidelines

- **Code Style:** Follow existing patterns
- **Tests:** 100% coverage required
- **Documentation:** Update docs for any changes
- **i18n:** Update all 5 languages (en, fr, es, de, pt)
- **Provider Support:** Test with at least 2 providers

### Adding a New AI Provider

To add support for a new AI provider:

1. Create a new provider class in `cli/lib/provider/`
2. Implement the required methods (`execute`, `spawnSubAgent`, `sendMessage`)
3. Add detection logic in `AIProviderManager.detectProvider()`
4. Create provider configuration template
5. Update documentation
6. Add tests

**Template for New Provider:**
```javascript
// cli/lib/provider/new-provider.js
import { BaseProvider } from './base-provider.js';

export class NewProvider extends BaseProvider {
  constructor() {
    super();
    this.name = 'new-provider';
    this.displayName = 'New Provider';
    this.mcpSupported = true/false;
    this.hooksSupported = true/false;
  }

  async execute(command, args, options) {
    // Implement command execution
  }

  async spawnSubAgent(prompt, options) {
    // Implement sub-agent spawning
  }

  getMCPServers() {
    return []; // Return MCP server configurations
  }
}
```

---

## 📄 License

AI Craft is licensed under the **MIT License** - see the [LICENSE](../LICENSE) file for details.

---

## 🙏 Acknowledgments

AI Craft builds upon the foundation of **Claude Craft**, which was created and maintained by [The Bearded CTO](https://the-bearded-bear.com).

Special thanks to:
- The **Claude Code** community for inspiration and feedback
- **Anthropic** for creating the original Claude Code
- **Mistral AI** for Vibe and excellent open-source contributions
- **OpenAI** for Codex
- **sst** for the open-source OpenCode terminal agent
- **Cursor** for the Cursor CLI
- All contributors who have helped shape this framework

---

*Built for Multi-AI Development by the AI Craft Community.*
*Formerly Claude Craft - Now Provider-Agnostic!*
