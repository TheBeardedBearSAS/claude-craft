# 🚀 Migration Guide: Claude Craft → AI Craft

**Version:** 9.0.0  
**Status:** Work in Progress  
**Branch:** `refactor/ai-craft`  
**Last Updated:** 2026-07-10

---

## 📌 Overview

This document outlines the migration path from **Claude Craft** (single-provider, Claude Code only) to **AI Craft** (multi-provider, supporting Vibe, Codex, OpenCode, Claude Code, Cursor, and GitHub Copilot).

### Current Status

| Component | Status | Details |
|-----------|--------|---------|
| **Core Architecture** | ✅ Complete | AI Provider Manager implemented |
| **Provider Integrations** | ✅ 80% Complete | Vibe, Codex, OpenCode, Claude, Cursor |
| **Configuration** | ✅ Complete | ai-craft.yaml, AI-CRAFT.md |
| **Documentation** | ✅ 70% Complete | README, AI-CRAFT.md updated |
| **Backward Compatibility** | ✅ Complete | Symlinks, legacy mode |
| **Agents Migration** | ⏳ Not Started | 70 agents to update |
| **Commands Migration** | ⏳ Not Started | 220 commands to verify |
| **Tests** | ⏳ Not Started | Multi-provider tests needed |
| **Bundle Updates** | ⏳ Not Started | vibe/, codex/, opencode/ bundles |

---

## 🎯 Migration Phases

### Phase 1: Foundation (Current Branch)
**Branch:** `refactor/ai-craft`  
**Status:** ✅ Complete  
**Duration:** 2 weeks (estimated)

#### What's Done

1. **AI Provider Manager** (`cli/lib/ai-provider.js`)
   - Base provider class with common interface
   - Provider detection (config, env, binaries)
   - Command execution with fallback
   - Sub-agent support
   - MCP server management

2. **Provider Implementations** (`cli/lib/provider/`)
   - `base-provider.js` - Abstract base class
   - `vibe-provider.js` - Mistral AI Vibe
   - `codex-provider.js` - Google Codex
   - `opencode-provider.js` - Self-hosted OpenCode
   - `claude-provider.js` - Anthropic Claude Code
   - `cursor-provider.js` - Cursor (VSCode)

3. **Configuration**
   - `ai-craft.yaml` - Multi-provider configuration template
   - `AI-CRAFT.md` - Core instructions for all providers
   - Backward compatibility settings

4. **Legacy Compatibility** (`cli/lib/legacy/claude-compat.js`)
   - Claude Craft project detection
   - Automatic migration tool
   - Symlink management (`.claude/ -> .ai-craft/`)
   - Backup and restore functionality

5. **Package Updates**
   - Package name: `@ai-craft/core` (was `@the-bearded-bear/claude-craft`)
   - Version: `9.0.0` (major bump — SemVer continuity from the `8.19.x` Claude Craft
     series, not a reset to `1.0.0`, since the package rename is treated as this
     project's breaking change, not a brand-new product)
   - Binaries: `ai-craft` + `claude-craft` (backward compat)

6. **Old Package Deprecation** (maintainer action, not automated by this repo)
   - Once `@ai-craft/core` is published, mark the old package as deprecated so
     existing installs surface a clear pointer instead of silently going stale:
     ```bash
     npm deprecate @the-bearded-bear/claude-craft "Renamed to @ai-craft/core — see https://github.com/TheBeardedBearSAS/claude-craft/blob/main/docs/guides/en/MIGRATION-TO-AI-CRAFT.md"
     ```
   - This requires npm publish access to the old package name and is not run by
     any script in this repo — it's a manual, one-time step for whoever holds
     that access.

#### Files Modified/Created

```
cli/
├── lib/
│   ├── ai-provider.js          # ✅ NEW: Main provider manager
│   ├── provider/               # ✅ NEW: Provider implementations
│   │   ├── base-provider.js
│   │   ├── vibe-provider.js
│   │   ├── codex-provider.js
│   │   ├── opencode-provider.js
│   │   ├── claude-provider.js
│   │   └── cursor-provider.js
│   └── legacy/                 # ✅ NEW: Compatibility layer
│       └── claude-compat.js
├── index.js                    # ⚠️ TODO: Update to use provider manager
│
.claude/
└── AI-CRAFT.md                # ✅ NEW: Multi-provider instructions

ai-craft.yaml                  # ✅ NEW: Default configuration
package.json                   # ✅ UPDATED: New name and version
README.md                      # ✅ UPDATED: Transition notice
docs/guides/en/MIGRATION-TO-AI-CRAFT.md  # ✅ NEW: This file (translated fr/es/de/pt)
```

---

## 📋 Migration Checklist

### For Framework Maintainers

- [x] Create `refactor/ai-craft` branch
- [x] Update package.json with new name and version
- [x] Create AI Provider Manager architecture
- [x] Implement base provider class
- [x] Implement Vibe provider
- [x] Implement Codex provider
- [x] Implement OpenCode provider
- [x] Implement Claude provider (backward compat)
- [x] Implement Cursor provider
- [x] Create ai-craft.yaml configuration
- [x] Create AI-CRAFT.md instructions
- [x] Create backward compatibility layer
- [x] Update README.md with transition notice
- [x] Create this migration guide
- [ ] Update CLI to use provider manager
- [ ] Update installer to create .ai-craft/ structure
- [ ] Update Ralph to work with multi-provider
- [ ] Update QA Recette for multi-browser
- [ ] Update BMAD hooks for multi-provider
- [ ] Migrate all 70 agents to multi-provider format
- [ ] Verify all 220 commands work with all providers
- [ ] Create multi-provider test suite
- [ ] Update documentation for all providers
- [ ] Create provider-specific bundles
- [ ] Test migration from Claude Craft projects
- [ ] Update GitHub Actions CI/CD
- [ ] Update npm package metadata
- [ ] Prepare release notes
- [ ] Announce to community

### For Users Migrating Projects

1. **Backup your project**
   ```bash
   cd ~/my-project
   git commit -am "Backup before AI Craft migration"
   ```

2. **Install AI Craft**
   ```bash
   npx @ai-craft/core install ~/my-project
   ```

3. **Run migration** (if Claude Craft project)
   ```bash
   npx @ai-craft/core migrate ~/my-project
   ```

4. **Verify installation**
   ```bash
   # Check .ai-craft/ directory exists
   ls -la .ai-craft/
   
   # Check symlink exists
   ls -la .claude/  # Should show -> .ai-craft/
   
   # Test with your provider
   vibe --system .ai-craft/AI-CRAFT.md
   ```

5. **Update your workflow**
   - Use `ai-craft` command (or `claude-craft` for backward compat)
   - Update any scripts that reference `.claude/` to use `.ai-craft/`
   - Configure your preferred provider in `ai-craft.yaml`

---

## 🔧 Technical Implementation Details

### Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    AI Craft CLI                              │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────┐    ┌────────────────────────┐   │
│  │   AI Provider        │    │        Commands         │   │
│  │   Manager            │    │                         │   │
│  │                     │    │  /workflow:init         │   │
│  │  ┌───────────────┐  │    │  /team:audit           │   │
│  │  │ Provider      │  │    │  /qa:recette          │   │
│  │  │ Detection     │  │    │  /common:ralph-run    │   │
│  │  └───────────────┘  │    │                         │   │
│  │                     │    └────────────────────────┘   │
│  │  ┌───────────────┐  │                                  │
│  │  │ Provider      │  │    ┌────────────────────────┐   │
│  │  │ Execution     │  │    │        Legacy           │   │
│  │  └───────────────┘  │    │        Compat           │   │
│  │                     │    │                         │   │
│  │  ┌───────────────┐  │    │  Claude Craft          │   │
│  │  │ Fallback      │  │    │  Migration             │   │
│  │  │ Handling      │  │    │  Symlink Management    │   │
│  │  └───────────────┘  │    └────────────────────────┘   │
│  └─────────────────────┘                                  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
          │              │              │
          ▼              ▼              ▼
┌─────────────────┐ ┌──────────────┐ ┌─────────────────┐
│   Vibe Provider  │ │ Codex Provider│ │ OpenCode Provider│
│   (Mistral AI)   │ │   (Google)    │ │ (Self-Hosted)    │
└─────────────────┘ └──────────────┘ └─────────────────┘
          │              │              │
          ▼              ▼              ▼
┌─────────────────────────────────────────────────────────────┐
│                    AI Providers                              │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐    │
│  │   Vibe CLI  │ │ Codex CLI   │ │ OpenCode CLI│    │
│  │ (vibe)      │ │ (codex)     │ │ (opencode)  │    │
│  └─────────────┘ └─────────────┘ └─────────────┘    │
│                                                    │
│  ┌─────────────┐ ┌─────────────┐                    │
│  │ Claude Code │ │   Cursor    │                    │
│  │ (claude)    │ │ (VSCode)    │                    │
│  └─────────────┘ └─────────────┘                    │
└─────────────────────────────────────────────────────────────┘
```

### Provider Interface

All providers implement the following interface:

```javascript
class BaseProvider {
  // Metadata
  name: string              // 'vibe', 'codex', etc.
  displayName: string       // 'Vibe (Mistral AI)'
  mcpSupported: boolean     // Supports MCP servers
  hooksSupported: boolean   // Supports hooks system
  subAgentsSupported: boolean // Supports sub-agents
  forkSupported: boolean    // Supports context forking
  
  // Configuration
  supportedModels: string[] // List of supported models
  defaultModel: string      // Default model to use
  modelAliases: Object      // Model name mappings
  
  // Methods
  async execute(command, args, options)      // Execute a command
  async sendMessage(prompt, options)         // Send a message to AI
  async spawnSubAgent(prompt, options)       // Spawn a sub-agent
  getMCPServers()                           // Get MCP server configs
  mapCommand(command, args)                 // Map generic → provider-specific
  async isAvailable()                       // Check if provider is installed
  async getVersion()                        // Get provider version
  validateConfig(config)                    // Validate provider config
  getEnvVars()                              // Get environment variables
}
```

### Configuration Structure

**New Structure (`.ai-craft/`):**
```
.ai-craft/
├── AI-CRAFT.md              # Core instructions (replaces CLAUDE.md)
├── ai-craft.yaml            # Multi-provider configuration
├── ai-craft-config.json     # Generic settings (optional)
├── providers/               # Provider-specific configs
│   ├── vibe.yaml
│   ├── codex.yaml
│   ├── opencode.yaml
│   ├── claude.yaml
│   └── cursor.yaml
├── agents/                  # Multi-provider agents
│   └── api-designer.md
│   └── symfony-reviewer.md
│   └── ...
├── commands/                # Framework commands
├── skills/                  # Universal skills
├── templates/               # Code generation templates
├── memory/                  # Cross-session memory
├── logs/                    # Log files
└── hooks/                   # Hook scripts
```

**Legacy Structure (`.claude/`):**
```
.claude/ → .ai-craft/  (symlink for backward compatibility)
```

### Model Name Mapping

AI Craft provides automatic model name mapping between providers:

| Generic Name | Vibe (Mistral) | Codex (Google) | OpenCode | Claude (Anthropic) |
|--------------|----------------|---------------|----------|-------------------|
| `opus` | `mistral-large-3.5` | `codex-pro` | `llama-3.2-90b` | `opus-4.8` |
| `sonnet` | `mistral-medium-3.5` | `codex-plus` | `llama-3.2-70b` | `sonnet-5` |
| `haiku` | `mistral-small-3.5` | `codex` | `llama-3.2-11b` | `haiku-4.5` |

This allows existing Claude Craft commands to work without modification:
```bash
# These work the same across all providers
/workflow:init --model=opus
/team:audit --model=sonnet
```

---

## 🎛️ Provider-Specific Setup

### Vibe (Mistral AI)

**Prerequisites:**
- Install Vibe CLI: `curl -sSL https://vibe.mistral.ai | sh`
- Set API key: `export MISTRAL_API_KEY=your_key`

**Configuration:**
```yaml
# .ai-craft/ai-craft.yaml
providers:
  primary: "vibe"

provider_settings:
  vibe:
    model: "mistral-large-3.5"
    api_endpoint: "https://api.mistral.ai"
```

### Codex (Google)

**Prerequisites:**
- Install Codex CLI: `npm install -g @google-cloud/codex-cli`
- Set API key: `export CODEX_API_KEY=your_key`

**Configuration:**
```yaml
# .ai-craft/ai-craft.yaml
providers:
  primary: "codex"

provider_settings:
  codex:
    model: "codex-pro"
```

### OpenCode (Self-Hosted)

**Prerequisites:**
- Install OpenCode: `npm install -g @open-code/cli`
- Run LLM server (e.g., `llama-3.2-90b`)
- Set endpoint: `export OPENCODE_ENDPOINT=http://localhost:8080`

**Configuration:**
```yaml
# .ai-craft/ai-craft.yaml
providers:
  primary: "opencode"

provider_settings:
  opencode:
    model: "llama-3.2-90b"
    base_url: "http://localhost:8080"
```

### Claude Code (Anthropic)

**Prerequisites:**
- Install Claude Code: `brew install claude-code` (macOS) or see [docs](https://code.claude.com)

**Configuration:**
```yaml
# .ai-craft/ai-craft.yaml
providers:
  primary: "claude"

provider_settings:
  claude:
    model: "sonnet-5"
```

### Cursor (VSCode)

**Prerequisites:**
- Install Cursor extension in VSCode

**Configuration:**
```json
// VSCode settings.json
{
  "cursor.rules": [
    {
      "path": ".ai-craft",
      "prompt": ".ai-craft/AI-CRAFT.md"
    }
  ]
}
```

---

## 🚀 Quick Start for Developers

### Clone and Setup

```bash
# Clone the repository
git clone https://github.com/TheBeardedBearSAS/claude-craft.git
cd claude-craft

# Switch to the AI Craft branch
git checkout refactor/ai-craft

# Install dependencies
npm install

# Link the package locally
npm link
```

### Test the Migration

```bash
# Create a test project
mkdir ~/ai-craft-test
cd ~/ai-craft-test

# Initialize AI Craft
npx @ai-craft/core install . --provider=vibe

# Or test migration from Claude Craft
npx @the-bearded-bear/claude-craft install . --tech=symfony
npx @ai-craft/core migrate .

# Test with different providers
ai-craft --provider=vibe workflow:init
ai-craft --provider=codex workflow:init
ai-craft --provider=claude workflow:init
```

### Run Tests

```bash
# Run existing tests
npm test

# Run lint
npm run lint

# Check multi-provider functionality
node tests/ai-provider.test.mjs
```

---

## 🐛 Troubleshooting

### Common Issues

**1. Provider not detected**
```
❌ Error: No AI provider detected
```
**Solution:** 
- Install the provider CLI (vibe, codex, opencode, or claude)
- Set the appropriate environment variable
- Or specify the provider explicitly: `--provider=vibe`

**2. Symlink not created**
```
❌ Error: .claude/ directory not found
```
**Solution:**
- The migration should create a symlink automatically
- Manually create it: `ln -s .ai-craft .claude`
- Or use `ai-craft` commands directly

**3. Command not found**
```
❌ Error: ai-craft: command not found
```
**Solution:**
- Ensure npm link was run: `npm link`
- Or use npx: `npx @ai-craft/core`
- Or install globally: `npm install -g .`

**4. Permission denied**
```
❌ Error: EACCES: permission denied
```
**Solution:**
- Use sudo if needed: `sudo npm link`
- Or fix npm permissions: `npm config set prefix ~/.npm-global`

**5. Configuration errors**
```
❌ Error: Invalid configuration
```
**Solution:**
- Check `ai-craft.yaml` syntax with a YAML validator
- Compare with the default configuration
- Remove and regenerate: `rm -rf .ai-craft && npx @ai-craft/core install .`

---

## 📊 Migration Progress Tracking

| Task | Status | Owner | Notes |
|------|--------|-------|-------|
| Core architecture | ✅ Done | - | Provider manager complete |
| Vibe provider | ✅ Done | - | Full implementation |
| Codex provider | ✅ Done | - | Full implementation |
| OpenCode provider | ✅ Done | - | Full implementation |
| Claude provider | ✅ Done | - | Backward compatible |
| Cursor provider | ✅ Done | - | VSCode integration |
| Configuration | ✅ Done | - | ai-craft.yaml template |
| AI-CRAFT.md | ✅ Done | - | Multi-provider instructions |
| Backward compat | ✅ Done | - | Symlink management |
| README update | ✅ Done | - | Transition notice |
| Migration guide | ✅ Done | - | This document |
| CLI integration | ⏳ TODO | Dev | Update cli/index.js |
| Installer update | ⏳ TODO | Dev | Create .ai-craft/ structure |
| Ralph adaptation | ⏳ TODO | Dev | Multi-provider loop |
| QA Recette adaptation | ⏳ TODO | Dev | Multi-browser support |
| Agent migration | ⏳ TODO | Dev | Update 70 agents |
| Command verification | ⏳ TODO | QA | Test 220 commands |
| Test suite | ⏳ TODO | QA | Multi-provider tests |
| Documentation | ⏳ TODO | Docs | Update all docs |
| Bundles | ⏳ TODO | Dev | Create bundles for each provider |
| CI/CD update | ⏳ TODO | DevOps | GitHub Actions |
| Package publish | ⏳ TODO | DevOps | npm publish |
| Community announcement | ⏳ TODO | Marketing | Release announcement |

---

## 🎯 AI Craft Migration Roadmap

### Phase 1: Foundations (Weeks 1-2) ✅ **COMPLETE**
- [x] AI Provider Manager architecture
- [x] Base provider implementations
- [x] Multi-provider configuration
- [x] Claude Craft compatibility layer
- [x] Initial documentation

### Phase 2: CLI Integration (Weeks 3-4) ⏳ **IN PROGRESS**
- [ ] Update cli/index.js to use the provider manager
- [ ] Update the installer (Dev/scripts/install-*.sh)
- [ ] Integrate Ralph with multi-provider support
- [ ] Basic integration tests

### Phase 3: Tooling Adaptation (Weeks 5-6) ⏳ **UPCOMING**
- [ ] Multi-provider Ralph Wiggum
- [ ] Multi-browser + multi-AI QA Recette
- [ ] Multi-provider BMAD hooks
- [ ] Update hook templates

### Phase 4: Agent Migration (Weeks 7-8) ⏳ **UPCOMING**
- [ ] Agent migration script
- [ ] Update the 70 existing agents
- [ ] Multi-provider frontmatter
- [ ] Agent validation

### Phase 5: Testing & Validation (Weeks 9-10) ⏳ **UPCOMING**
- [ ] Multi-provider test suite
- [ ] End-to-end integration tests
- [ ] Backward compatibility validation
- [ ] Performance benchmarking

### Phase 6: Release (Week 11-12) ⏳ **UPCOMING**
- [ ] Documentation update
- [ ] Multi-IDE bundle creation
- [ ] CI/CD update
- [ ] npm publication
- [ ] Community announcement

---

## 🤝 How to Contribute

We welcome contributions to AI Craft! Here's how you can help:

### 1. Report Issues
- Open an issue on GitHub with the `ai-craft` label
- Include details about:
  - Your operating system
  - AI provider(s) you're using
  - Steps to reproduce
  - Expected vs actual behavior

### 2. Fix Bugs
- Fork the repository
- Create a branch: `git checkout -b fix/your-issue`
- Make your changes
- Add tests for the fix
- Submit a Pull Request

### 3. Add Features
- Discuss the feature in GitHub Discussions first
- Create a branch: `git checkout -b feat/your-feature`
- Implement the feature
- Add tests and documentation
- Submit a Pull Request

### 4. Improve Documentation
- Update existing docs
- Add examples
- Improve translations (en, fr, es, de, pt)

### 5. Test New Providers
- Try AI Craft with different AI providers
- Report compatibility issues
- Help improve provider implementations

---

## 📞 Support

### Community
- **GitHub Discussions:** [TheBeardedBearSAS/ai-craft/discussions](https://github.com/TheBeardedBearSAS/ai-craft/discussions)
- **Discord:** [Join our Discord server](https://discord.gg/...) (link to be updated)
- **Twitter/X:** [@TheBeardedCTO](https://twitter.com/TheBeardedCTO)

### Documentation
- **Main Docs:** [ai-craft.the-bearded-bear.com](https://ai-craft.the-bearded-bear.com) (coming soon)
- **GitHub Wiki:** [TheBeardedBearSAS/ai-craft/wiki](https://github.com/TheBeardedBearSAS/ai-craft/wiki)

### Commercial Support
For enterprise support, custom development, or training:
- **Email:** support@the-bearded-bear.com
- **Website:** [https://the-bearded-bear.com](https://the-bearded-bear.com)

---

## 📜 License

AI Craft is **100% open-source** under the [MIT License](LICENSE).

This means you can:
- ✅ Use it for free (personal and commercial)
- ✅ Modify the source code
- ✅ Distribute modified versions
- ✅ Use it in proprietary software

You cannot:
- ❌ Use the trademarks without permission
- ❌ Hold us liable for any issues

---

## 🙏 Acknowledgments

AI Craft builds upon the foundation of **Claude Craft**, which was created and maintained by [The Bearded CTO](https://the-bearded-bear.com) with contributions from the open-source community.

Special thanks to:
- **Anthropic** for creating Claude Code
- **Mistral AI** for Vibe and open-source contributions
- **Google** for Codex and AI research
- **All contributors** who have helped shape this framework

---

**AI Craft - The Multi-AI Development Framework**  
*Formerly Claude Craft - Now Provider-Agnostic!*  
*Built with ❤️ by the AI Craft Community*
