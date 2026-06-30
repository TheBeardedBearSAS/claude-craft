# Setting Up Claude-Craft on a New Project

This step-by-step tutorial will guide you through installing Claude-Craft on a brand new project. By the end, you'll have a fully configured development environment with AI-powered assistance.

**Time required:** ~10 minutes

---

## Table of Contents

1. [Prerequisites Checklist](#1-prerequisites-checklist)
2. [Create Your Project Directory](#2-create-your-project-directory)
3. [Initialize Git Repository](#3-initialize-git-repository)
4. [Choose Your Technology Stack](#4-choose-your-technology-stack)
5. [Install Claude-Craft](#5-install-claude-craft)
   - [Method A: NPX (No Clone Required)](#method-a-npx-no-clone-required)
   - [Method B: Makefile (More Control)](#method-b-makefile-more-control)
6. [Verify Installation](#6-verify-installation)
7. [Configure Project Context](#7-configure-project-context)
8. [First Launch with Claude Code](#8-first-launch-with-claude-code)
9. [Test Your Setup](#9-test-your-setup)
10. [Troubleshooting](#10-troubleshooting)
11. [Next Steps](#11-next-steps)

---

## 1. Prerequisites Checklist

Before starting, make sure you have the following installed:

### Required

- [ ] **Terminal/Command Line** - Any terminal application
- [ ] **Node.js 22+** - Required for NPX installation
- [ ] **Git** - For version control
- [ ] **Claude Code** - The AI coding assistant (recommended: v2.1.193, minimum: v2.1.97 — CVE-2025-59536 patched)

### Verify Your Prerequisites

Open your terminal and run these commands:

```bash
# Check Node.js version (should be 22 or higher)
node --version
```
Expected output: `v22.x.x` or higher (e.g., `v22.11.0`)

```bash
# Check Git version
git --version
```
Expected output: `git version 2.x.x` (e.g., `git version 2.43.0`)

```bash
# Check Claude Code is installed
claude --version
```
Expected output: Version number (recommended: `2.1.193` or higher)

### Install Missing Prerequisites

If any command above fails:

**Node.js:** Download from [nodejs.org](https://nodejs.org/) or use:
```bash
# macOS with Homebrew
brew install node

# Ubuntu/Debian
sudo apt install nodejs npm
```

**Git:** Download from [git-scm.com](https://git-scm.com/) or use:
```bash
# macOS with Homebrew
brew install git

# Ubuntu/Debian
sudo apt install git
```

**Claude Code:** Follow the [official installation guide](https://code.claude.com/docs/en/installation)

---

## 2. Create Your Project Directory

Choose where you want to create your project and run:

```bash
# Create project directory
mkdir ~/my-project

# Navigate into it
cd ~/my-project
```

**Verify:** Run `pwd` to confirm you're in the right directory:
```bash
pwd
```
Expected output: `/home/yourname/my-project` (or `/Users/yourname/my-project` on macOS)

---

## 3. Initialize Git Repository

Claude-Craft works best with Git-tracked projects:

```bash
# Initialize Git repository
git init
```

Expected output:
```
Initialized empty Git repository in /home/yourname/my-project/.git/
```

**Verify:** Check that `.git` folder exists:
```bash
ls -la
```
You should see a `.git/` directory in the output.

---

## 4. Choose Your Technology Stack

Claude-Craft supports multiple technology stacks. Choose the one that matches your project:

| Stack | Best For | Command Flag |
|-------|----------|--------------|
| **.NET / C#** | Enterprise APIs, Clean Architecture | `--tech=csharp` |
| **Symfony** | PHP APIs, Web apps, Backend services | `--tech=symfony` |
| **Flutter** | Mobile apps (iOS/Android) | `--tech=flutter` |
| **Python** | APIs, Data services, ML backends | `--tech=python` |
| **React** | Web SPAs, Dashboards | `--tech=react` |
| **React Native** | Cross-platform mobile apps | `--tech=reactnative` |
| **Angular** | Enterprise Web apps | `--tech=angular` |
| **Vue.js** | Web SPAs, Progressive apps | `--tech=vuejs` |
| **Laravel** | PHP APIs, Web apps | `--tech=laravel` |
| **PHP** | Libraries, Backend services | `--tech=php` |
| **Common only** | Any project (generic rules) | `--tech=common` |

**Choose your language:**

| Language | Flag |
|----------|------|
| English | `--lang=en` |
| French | `--lang=fr` |
| Spanish | `--lang=es` |
| German | `--lang=de` |
| Portuguese | `--lang=pt` |

---

## 5. Install Claude-Craft

You have two installation methods. Choose the one that fits your needs:

### Method A: NPX (No Clone Required)

**Best for:** Quick setup, first-time users, CI/CD pipelines

This method downloads and runs Claude-Craft directly without cloning the repository.

```bash
# Replace 'symfony' with your tech stack and 'en' with your language
npx @the-bearded-bear/claude-craft install ~/my-project --tech=symfony --lang=en
```

**Example for a French Flutter project:**
```bash
npx @the-bearded-bear/claude-craft install ~/my-project --tech=flutter --lang=fr
```

Expected output:
```
Installing Claude-Craft rules...
  ✓ Common rules installed
  ✓ Symfony rules installed
  ✓ Agents installed
  ✓ Commands installed
  ✓ Templates installed
  ✓ Checklists installed
  ✓ CLAUDE.md generated
  ✓ settings.json configured with optimized defaults
  ✓ settings.local.json created with wildcard permissions
  ✓ .claudeignore installed
  ✓ PostCompact hook configured for context reinjection

Installation complete! Run 'claude' in your project directory to start.
```

**If you see an error:**
- `npm ERR! 404` → Check your internet connection
- `EACCES: permission denied` → Run with `sudo` or fix npm permissions
- `command not found: npx` → Install Node.js first

---

### Method B: Makefile (More Control)

**Best for:** Customization, contributing to Claude-Craft, offline use

This method requires cloning the Claude-Craft repository first.

#### Step B.1: Clone Claude-Craft

```bash
# Clone to a permanent location
git clone https://github.com/TheBeardedBearSAS/claude-craft.git ~/claude-craft
```

Expected output:
```
Cloning into '/home/yourname/claude-craft'...
remote: Enumerating objects: XXX, done.
...
Resolving deltas: 100% (XXX/XXX), done.
```

#### Step B.2: Run Installation

```bash
# Navigate to Claude-Craft directory
cd ~/claude-craft

# Install rules to your project
# Replace 'symfony' with your tech and 'en' with your language
make install-symfony TARGET=~/my-project RULES_LANG=en
```

**Examples for other stacks:**
```bash
# Flutter in French
make install-flutter TARGET=~/my-project RULES_LANG=fr

# React in Spanish
make install-react TARGET=~/my-project RULES_LANG=es

# Python in German
make install-python TARGET=~/my-project RULES_LANG=de

# Common rules only (any project)
make install-common TARGET=~/my-project RULES_LANG=en
```

Expected output:
```
Installing Symfony rules to /home/yourname/my-project...
  Creating .claude directory...
  Copying rules... done
  Copying agents... done
  Copying commands... done
  Copying templates... done
  Copying checklists... done
  Generating CLAUDE.md... done
  Configuring settings.json... done
  Creating settings.local.json... done
  Installing .claudeignore... done

Installation complete!
```

---

## 6. Verify Installation

After installation, verify everything is in place:

```bash
# Navigate to your project
cd ~/my-project

# List the .claude directory
ls -la .claude/
```

Expected output:
```
total XX
drwxr-xr-x  8 user user 4096 Jan 12 10:00 .
drwxr-xr-x  3 user user 4096 Jan 12 10:00 ..
-rw-r--r--  1 user user 2048 Jan 12 10:00 CLAUDE.md
-rw-r--r--  1 user user  512 Jan 12 10:00 .claudeignore
drwxr-xr-x  2 user user 4096 Jan 12 10:00 agents
drwxr-xr-x  2 user user 4096 Jan 12 10:00 checklists
drwxr-xr-x  4 user user 4096 Jan 12 10:00 commands
drwxr-xr-x  2 user user 4096 Jan 12 10:00 rules
-rw-r--r--  1 user user 1024 Jan 12 10:00 settings.json
-rw-r--r--  1 user user  512 Jan 12 10:00 settings.local.json
drwxr-xr-x  2 user user 4096 Jan 12 10:00 templates
```

### Verify Each Component

```bash
# Count rules (should be 15-25 depending on stack)
ls .claude/rules/*.md | wc -l

# Count agents (should be 5-12)
ls .claude/agents/*.md | wc -l

# Count commands (should have subdirectories)
ls .claude/commands/
```

**If files are missing:**
- Re-run the installation command
- Check that you have write permissions to the directory
- See [Troubleshooting](#10-troubleshooting) section

---

## 7. Configure Project Context

The most important file to customize is your project context. This tells Claude about YOUR specific project.

### Option A: Interactive Setup (Recommended)

Use the built-in command to auto-detect your stack and answer targeted questions:

```bash
# Start Claude Code
claude

# Run the setup command
/common:setup-project-context
```

The command will:
1. **Auto-detect** your tech stack, framework, database, and CI/CD
2. **Ask questions** for missing information (app type, domain, users, compliance)
3. **Generate** a complete `.claude/references/<your-tech>/project-context.md` file
4. **Suggest next steps** (agents to run, sections to complete)

**Modes available:**
- `(default)` - Balanced detection + essential questions
- `--auto` - Maximum auto-detection, minimal questions
- `--full` - Comprehensive questionnaire including goals and glossary

### Option B: Manual Configuration

If you prefer to configure manually, open the file directly:

```bash
# Open in your editor (replace 'nano' with 'code', 'vim', etc.)
nano .claude/references/<your-tech>/project-context.md
```

### Sections to Customize

Find and update these sections:

```markdown
## Project Overview
- **Name**: [Your project name]
- **Description**: [What does your project do?]
- **Type**: [API / Web App / Mobile App / CLI / Library]

## Technical Stack
- **Framework**: [e.g., Symfony 7.0, Flutter 3.16]
- **Language Version**: [e.g., PHP 8.3, Dart 3.2]
- **Database**: [e.g., PostgreSQL 16, MySQL 8]

## Team Conventions
- **Coding Style**: [e.g., PSR-12, Effective Dart]
- **Branch Strategy**: [e.g., GitFlow, Trunk-based]
- **Commit Format**: [e.g., Conventional Commits]

## Project-Specific Rules
- [Add any custom rules for your project]
```

### Example: E-commerce API

```markdown
## Project Overview
- **Name**: ShopAPI
- **Description**: RESTful API for e-commerce platform
- **Type**: API

## Technical Stack
- **Framework**: Symfony 7.0 with API Platform
- **Language Version**: PHP 8.3
- **Database**: PostgreSQL 16

## Team Conventions
- **Coding Style**: PSR-12
- **Branch Strategy**: GitFlow
- **Commit Format**: Conventional Commits

## Project-Specific Rules
- All prices must be stored in cents (integer)
- Use UUID v7 for all entity identifiers
- Soft delete required for all entities
```

Save the file when done (in nano: `Ctrl+O`, then `Enter`, then `Ctrl+X`).

---

## 8. First Launch with Claude Code

Now let's start Claude Code and verify everything works:

```bash
# Make sure you're in your project directory
cd ~/my-project

# Launch Claude Code
claude
```

You should see Claude Code start with a prompt.

### Test That Rules Are Active

Type this message to Claude:

```
What rules and guidelines are you following for this project?
```

Claude should respond mentioning:
- Project context from `00-project-context.md`
- Architecture rules
- Testing requirements
- Technology-specific guidelines

**If Claude doesn't mention your rules:**
- Make sure you're in the project directory (not a subdirectory)
- Check that `.claude/` directory exists
- Restart Claude Code

### Automatic Optimizations (v8.7)

Claude-Craft now installs optimized defaults automatically during installation:

**Installed by default:**
- ✓ `.claudeignore` file to reduce context noise
- ✓ `settings.json` with PostCompact hook for context reinjection
- ✓ `settings.local.json` with wildcard permissions for common tools
- ✓ `CLAUDE_CODE_SUBAGENT_MODEL=sonnet` enforced in settings.json env block
- ✓ RTK `--ultra-compact` mode automatically patched (if RTK is installed)

**Optional: Setup RTK for Additional Savings**

For maximum token savings (60-90% on CLI outputs), install RTK:

```bash
# In Claude Code
/common:setup-rtk
```

This configures RTK proxy integration. See [RTK.md](@RTK.md) for details.

---

## 9. Test Your Setup

Run these quick tests to verify everything works:

### Test 1: Check Available Commands

Ask Claude:
```
List all available slash commands for this project
```

Expected: Claude should list commands like `/common:analyze-feature`, `/{tech}:generate-crud`, etc.

### Test 2: Use an Agent

Try invoking an agent:
```
@tdd-coach Help me understand how to write tests for this project
```

Expected: Claude should respond as the TDD Coach agent with testing guidance.

### Test 3: Run a Command

Try a simple command:
```
/common:pre-commit-check
```

Expected: Claude should run a pre-commit quality check (may report no changes if project is empty).

### Validation Checklist

- [ ] Claude Code starts without errors
- [ ] Claude mentions project rules when asked
- [ ] Slash commands are recognized
- [ ] Agents respond with specialized knowledge
- [ ] Project context is reflected in responses

---

## 10. Troubleshooting

### Installation Issues

**Problem:** `Permission denied` during installation
```bash
# Solution 1: Fix directory permissions
chmod 755 ~/my-project

# Solution 2: Run with sudo (not recommended for npm)
sudo npx @the-bearded-bear/claude-craft install ...
```

**Problem:** `Command not found: npx`
```bash
# Solution: Install Node.js
brew install node  # macOS
sudo apt install nodejs npm  # Ubuntu/Debian
```

**Problem:** `ENOENT: no such file or directory`
```bash
# Solution: Create the target directory first
mkdir -p ~/my-project
```

### Runtime Issues

**Problem:** Claude doesn't see the rules
- Verify you're in the project root: `pwd`
- Check `.claude/` exists: `ls -la .claude/`
- Restart Claude Code: exit and run `claude` again

**Problem:** Commands not recognized
- Check commands directory: `ls .claude/commands/`
- Verify file permissions: `ls -la .claude/commands/*.md`

**Problem:** Agents not responding
- Check agents directory: `ls .claude/agents/`
- Use correct syntax: `@agent-name message`

### Getting Help

If you're still stuck:
1. Check the [Troubleshooting Guide](06-troubleshooting.md)
2. Search [GitHub Issues](https://github.com/TheBeardedBearSAS/claude-craft/issues)
3. Open a new issue with your error message

---

## 11. Next Steps

Congratulations! Your Claude-Craft environment is ready. Here's what to do next:

### Immediate Next Steps

1. **Commit your configuration:**
   ```bash
   git add .claude/
   git commit -m "feat: add Claude-Craft configuration"
   ```

2. **Start building your project** with AI assistance

3. **Read the Feature Development Guide** to learn the TDD workflow

### Recommended Reading

| Guide | Description |
|-------|-------------|
| [Feature Development](03-feature-development.md) | TDD workflow with agents and commands |
| [Bug Fixing](04-bug-fixing.md) | Diagnostic and regression testing |
| [Tools Reference](05-tools-reference.md) | Multi-account, StatusLine utilities |
| [Adding to Existing Project](09-setup-existing-project.md) | For your other projects |

### Quick Reference Card

```bash
# Launch Claude Code
claude

# Common agents
@api-designer      # API design
@database-architect # Database schema
@tdd-coach         # Testing help
@{tech}-reviewer   # Code review

# Common commands
/common:analyze-feature     # Analyze requirements
/{tech}:generate-crud       # Generate CRUD code
/common:pre-commit-check    # Quality check
/common:security-audit      # Security review
```

---

[&larr; Previous: Backlog Management](07-backlog-management.md) | [Next: Adding to Existing Project &rarr;](09-setup-existing-project.md)
