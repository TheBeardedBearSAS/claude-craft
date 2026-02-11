# Claude-Craft Web Bundles

Pre-built instruction bundles for using Claude-Craft methodology outside of Claude Code.

## Available Bundles

| Platform | File | Size | Usage |
|----------|------|------|-------|
| **ChatGPT** | `chatgpt/claude-craft-bundle.md` | ~3KB | Custom Instructions or GPT config |
| **Claude** | `claude/claude-craft-bundle.md` | ~7KB | Claude Projects custom instructions |
| **Gemini** | `gemini/claude-craft-bundle.md` | ~3KB | Gemini Gems configuration |

## Installation

### ChatGPT

1. Open ChatGPT Settings → Personalization → Custom Instructions
2. Copy the content from `chatgpt/claude-craft-bundle.md`
3. Paste into the "Custom Instructions" field
4. Save

Or create a Custom GPT:
1. Create new GPT
2. Paste bundle content into Instructions
3. Configure conversation starters

### Claude Projects

1. Create a new Claude Project
2. Go to Project Settings → Custom Instructions
3. Copy and paste `claude/claude-craft-bundle.md`
4. Save

### Gemini Gems

1. Create a new Gem
2. Configure the Gem's instructions
3. Copy and paste `gemini/claude-craft-bundle.md`
4. Save and publish

## Features

All bundles include:

- **SOLID Principles** - Object-oriented design guidelines
- **KISS, DRY, YAGNI** - Code simplicity principles
- **Testing Strategy** - TDD/BDD approach with test pyramid
- **Security Standards** - OWASP-aligned security practices
- **Git Workflow** - Conventional commits
- **Architecture Patterns** - Clean Architecture, component design
- **Quality Checklists** - Pre-completion verification

## Bundle Comparison

| Feature | ChatGPT | Claude | Gemini |
|---------|---------|--------|--------|
| Core Principles | ✅ | ✅ | ✅ |
| Workflow Phases | Basic | Full | Basic |
| Architecture Diagrams | - | ✅ | - |
| Track Selection | - | ✅ | ✅ |
| Technology Guidelines | - | ✅ | - |
| Detailed Checklists | ✅ | ✅ | ✅ |

## Token Considerations

| Platform | Token Limit | Bundle Tokens |
|----------|-------------|---------------|
| ChatGPT Custom Instructions | ~1500 | ~800 |
| ChatGPT GPT | ~8000 | ~800 |
| Claude Projects | ~200K | ~1800 |
| Gemini Gems | ~32K | ~800 |

All bundles are optimized to stay well within platform limits while providing comprehensive guidance.

---

Claude-Craft v5.13.0 | https://github.com/TheBeardedBearSAS/claude-craft
