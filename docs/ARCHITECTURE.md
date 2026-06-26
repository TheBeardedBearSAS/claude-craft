# Claude Craft Architecture

Technical documentation of Claude Craft's internal architecture and extension points.

---

## System Overview (Mermaid)

```mermaid
graph TD
    subgraph CLI["CLI Entry (cli/)"]
        INDEX[index.js]
        FLATTENER[flattener.js]
    end

    subgraph LIB["CLI Lib Modules (cli/lib/)"]
        PARSE[parse-args.js]
        DETECT[detect-project.js]
        COLORS[colors.js]
        CONST[constants.js]
        BANNER[banner.js]
        HELP[help.js]
        INSTALLER_MOD[installer.js]
        RALPH_MOD[ralph.js]
    end

    subgraph SCRIPTS["Install Scripts (Dev/scripts/)"]
        TCL[tcl-common.sh]
        TECHLIB[lib/install-tech-common.sh]
        TECH_SCRIPTS["install-{tech}-rules.sh<br/>(10 thin wrappers)"]
    end

    subgraph I18N["i18n Layer (Dev/i18n/)"]
        EN[en/]
        FR[fr/]
        ES[es/]
        DE[de/]
        PT[pt/]
    end

    subgraph TARGET["Target Project (.claude/)"]
        CLAUDEMD[CLAUDE.md<br/>~200 tokens]
        INDEXMD[INDEX.md<br/>~1300 tokens]
        REFS[references/{tech}/]
        AGENTS_DIR[agents/]
        CMDS[commands/]
        SKILLS[skills/]
    end

    subgraph BMAD[".bmad/ Framework"]
        ROUTING[routing-engine.sh]
        GATES[gates/]
        HOOKS[hooks/]
        BACKLOG[backlog/]
    end

    subgraph RALPH_SYS["Ralph Wiggum (Tools/Ralph/)"]
        RALPH_MAIN[ralph.sh]
        CIRCUIT[circuit-breaker.sh]
        RECOVERY[recovery-engine.sh]
        CONDUCTOR[sprint-conductor.sh]
    end

    INDEX --> LIB
    INDEX --> FLATTENER
    INSTALLER_MOD --> SCRIPTS
    RALPH_MOD --> RALPH_SYS
    TECH_SCRIPTS --> TECHLIB
    TECH_SCRIPTS --> TCL
    SCRIPTS --> I18N
    SCRIPTS --> TARGET
    RALPH_SYS --> BMAD
```

---

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         User Project                                 │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │                    .claude/ directory                          │  │
│  │  ┌──────────┐ ┌───────────┐ ┌───────────┐ ┌────────────────┐  │  │
│  │  │ CLAUDE.md│ │ INDEX.md  │ │context.yaml│ │settings.json   │  │  │
│  │  │ (~200 tk)│ │(~1300 tk) │ │(triggers)  │ │(permissions)   │  │  │
│  │  └──────────┘ └───────────┘ └───────────┘ └────────────────┘  │  │
│  │  ┌────────────────────────────────────────────────────────┐   │  │
│  │  │                   references/                           │   │  │
│  │  │  ┌─────────┐ ┌──────────────────────────────────────┐  │   │  │
│  │  │  │  base/  │ │          {technology}/                │  │   │  │
│  │  │  │ SOLID   │ │  architecture.md, testing.md,         │  │   │  │
│  │  │  │ DRY     │ │  security.md, coding-standards.md     │  │   │  │
│  │  │  └─────────┘ └──────────────────────────────────────┘  │   │  │
│  │  └────────────────────────────────────────────────────────┘   │  │
│  │  ┌────────┐ ┌──────────┐ ┌─────────┐ ┌──────────────────┐    │  │
│  │  │ agents/│ │ commands/│ │ skills/ │ │ templates/       │    │  │
│  │  └────────┘ └──────────┘ └─────────┘ │ checklists/      │    │  │
│  │                                       └──────────────────┘    │  │
│  └───────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
                                   │
                                   │ Claude Code
                                   ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      Claude Craft Repository                         │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │ Dev/i18n/{lang}/                                               │  │
│  │  ├── Common/  (agents, commands, rules)                        │  │
│  │  ├── Symfony/ (tech-specific content)                          │  │
│  │  ├── Flutter/                                                  │  │
│  │  └── ...                                                       │  │
│  └───────────────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │ Dev/scripts/                                                   │  │
│  │  ├── install-{tech}-rules.sh                                   │  │
│  │  └── tcl-common.sh                                             │  │
│  └───────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Tiered Context Loading (TCL)

Claude Craft uses a tiered loading strategy to minimize token usage:

### Tier 1: Always Loaded (~200 tokens)

**File:** `CLAUDE.md`

Loaded automatically by Claude Code at session start.

**Contains:**
- Project identity
- Technology list
- Quick command reference
- Links to other tiers

### Tier 2: On-Demand (~1,300 tokens)

**File:** `INDEX.md`

Loaded via `@.claude/INDEX.md` reference.

**Contains:**
- Condensed checklists
- Key patterns
- Quick reference tables

### Tier 3: Explicit Reference (Variable)

**Directory:** `references/`

Loaded via `@.claude/references/{tech}/architecture.md`.

**Contains:**
- Full documentation
- Detailed rules
- Complete examples

### Token Reduction

| Structure | Tokens |
|-----------|--------|
| Flat (v3) | ~70,000 |
| TCL (v4) | ~3,500 |
| **Reduction** | **95%** |

---

## Component Architecture

### Agents

```
.claude/agents/
├── api-designer.md
├── database-architect.md
├── {tech}-reviewer.md
└── ...
```

**Format:**
```yaml
---
name: agent-name
description: Brief description
---

# Agent Name

## Identity
...

## Capabilities
...

## Methodology
...
```

### Commands

```
.claude/commands/
├── common/
│   ├── pre-commit-check.md
│   └── ...
└── {tech}/
    ├── check-architecture.md
    └── ...
```

**Format:**
```yaml
---
description: What this command does
argument-hint: <required> [optional]
---

# Command Title

Instructions...
```

### Skills

```
.claude/skills/
├── testing/
│   ├── SKILL.md
│   └── REFERENCE.md
├── security/
└── ...
```

**SKILL.md:** Minimal entry point (~600 tokens)
**REFERENCE.md:** Full documentation (~8,000 tokens)

### References

```
.claude/references/
├── base/
│   ├── solid-principles.md
│   ├── kiss-dry-yagni.md
│   ├── git-workflow.md
│   └── documentation.md
└── {technology}/
    ├── architecture.md
    ├── coding-standards.md
    ├── testing.md
    ├── security.md
    └── tooling.md
```

---

## Installation Flow

```
┌──────────────────┐
│ User runs        │
│ make install-X   │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ install-X-rules.sh│
│ sources tcl-     │
│ common.sh        │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ Create TCL       │
│ structure        │
└────────┬─────────┘
         │
         ├─────────────────┐
         ▼                 ▼
┌──────────────────┐ ┌──────────────────┐
│ Copy agents,     │ │ Copy references  │
│ commands, skills │ │ from i18n/       │
└────────┬─────────┘ └────────┬─────────┘
         │                    │
         └────────┬───────────┘
                  ▼
┌──────────────────┐
│ Generate         │
│ CLAUDE.md        │
│ INDEX.md         │
│ context.yaml     │
└──────────────────┘
```

---

## BMAD Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        BMAD v6 Framework                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────┐      ┌─────────────┐      ┌─────────────┐     │
│  │ bmad-master │ ────▶│   Agents    │ ────▶│   Artifacts  │    │
│  │ Orchestrator│      │ pm,ba,arch, │      │ PRD, Tech   │     │
│  └─────────────┘      │ po,sm,dev,  │      │ Spec, Stories│    │
│         │             │ qa,ux       │      └─────────────┘     │
│         │             └─────────────┘                           │
│         │                                                        │
│         ▼                                                        │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │                    Quality Gates                             ││
│  │  PRD (≥80%) → Tech Spec (≥90%) → Backlog (INVEST) →         ││
│  │  Sprint Ready (100%) → Story DoD (100%)                      ││
│  └─────────────────────────────────────────────────────────────┘│
│         │                                                        │
│         ▼                                                        │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │                    Status Machine                            ││
│  │  backlog → ready-for-dev → in-progress → review → done      ││
│  │                     ↓ blocked ↓                              ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### BMAD Files

```
.bmad/
├── config.yaml           # Project configuration
├── sprint-status.yaml    # Current sprint state
├── backlog/
│   ├── EPIC-001.md
│   ├── US-001.md
│   └── ...
├── artifacts/
│   ├── prd.md
│   ├── tech-spec.md
│   └── adr/
└── hooks/
    ├── sprint-context.sh
    ├── story-status.sh
    └── quality-gate.sh
```

---

## Ralph Wiggum Architecture

```
┌────────────────────────────────────────────────────────────┐
│                    Ralph Wiggum                            │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  ┌─────────────────┐                                       │
│  │   Task Input    │                                       │
│  └────────┬────────┘                                       │
│           │                                                │
│           ▼                                                │
│  ┌─────────────────┐     ┌─────────────────┐              │
│  │ Iteration Loop  │────▶│ Claude Execution │              │
│  │                 │     └────────┬────────┘              │
│  │ max_iterations  │              │                        │
│  │ = 10            │              ▼                        │
│  └─────────────────┘     ┌─────────────────┐              │
│           ▲              │ DoD Validators   │              │
│           │              │ - command        │              │
│           │              │ - output_contains│              │
│           │              │ - file_changed   │              │
│           │              │ - hook           │              │
│           │              │ - human          │              │
│           │              └────────┬────────┘              │
│           │                       │                        │
│           │           ┌───────────┴───────────┐           │
│           │           ▼                       ▼           │
│           │    ┌────────────┐         ┌────────────┐     │
│           │    │ All Pass   │         │ Any Fail   │     │
│           │    └─────┬──────┘         └─────┬──────┘     │
│           │          │                       │            │
│           │          ▼                       │            │
│           │    ┌────────────┐               │            │
│           │    │  SUCCESS   │               │            │
│           │    └────────────┘               │            │
│           │                                  │            │
│           │    ┌────────────────────────────┘            │
│           │    │                                          │
│           │    ▼                                          │
│           │ ┌─────────────────┐                          │
│           │ │ Circuit Breaker │                          │
│           └─│ threshold < max │──────────────────────────┤
│             └─────────────────┘                          │
│                      │                                    │
│                      ▼                                    │
│             ┌─────────────────┐                          │
│             │     STOP        │                          │
│             └─────────────────┘                          │
│                                                           │
└───────────────────────────────────────────────────────────┘
```

---

## Internationalization (i18n)

```
Dev/i18n/
├── en/                    # English (primary)
│   ├── Common/
│   │   ├── agents/
│   │   ├── commands/
│   │   └── rules/
│   ├── Symfony/
│   ├── Flutter/
│   └── ...
├── fr/                    # French
├── es/                    # Spanish
├── de/                    # German
└── pt/                    # Portuguese
```

Each language directory mirrors the English structure with translated content.

---

## Extension Points

### Adding a New Technology

1. Create `Dev/i18n/{lang}/{Tech}/`
2. Add agents, commands, rules
3. Create `Dev/scripts/install-{tech}-rules.sh`
4. Update Makefile
5. Update documentation

### Adding a New Agent

1. Create `Dev/i18n/{lang}/Common/agents/{agent}.md`
2. Follow agent format
3. Install to target projects

### Adding a New Command

1. Create `Dev/i18n/{lang}/{Tech}/commands/{command}.md`
2. Follow command format
3. Install to target projects

### Adding a New Skill

1. Create `Dev/i18n/{lang}/Common/skills/{skill}/`
2. Add `SKILL.md` and `REFERENCE.md`
3. Update `context.yaml` triggers

---

## File Formats

### Agent Format

```yaml
---
name: agent-name
description: Short description
---

# Agent Title

## Identity
- **Name**: Display Name
- **Role**: Expert in X
- **Expertise**: Domain knowledge

## Capabilities
- Capability 1
- Capability 2

## Methodology
Step-by-step approach...

## Output Format
Expected output structure...
```

### Command Format

```yaml
---
description: What this command does
argument-hint: <required> [optional]
---

# Command Title

## Purpose
What this accomplishes.

## Arguments
$ARGUMENTS

## Process
1. Step 1
2. Step 2

## Output
Expected format...
```

### Skill Format

**SKILL.md:**
```yaml
---
name: skill-name
triggers:
  - pattern: "*.test.ts"
---

# Skill Name

Brief overview...

## Key Principles
- Principle 1
- Principle 2

## Quick Reference
Condensed info...
```

**REFERENCE.md:**
Full documentation with examples.

---

## Data Flow

### Context Loading

```
Session Start
     │
     ▼
Load CLAUDE.md (auto)
     │
     ▼
User references @INDEX.md
     │
     ▼
Load INDEX.md (on-demand)
     │
     ▼
User references @references/...
     │
     ▼
Load specific reference (explicit)
```

### Command Execution

```
User types /command:name
     │
     ▼
Claude Code finds command
     │
     ▼
Load command markdown
     │
     ▼
Claude executes instructions
     │
     ▼
Generate output
```

### BMAD Flow

```
/workflow:init
     │
     ▼
Create .bmad/ structure
     │
     ▼
@pm creates PRD
     │
     ▼
/gate:validate-prd
     │
     ▼
@architect creates tech spec
     │
     ▼
/gate:validate-techspec
     │
     ▼
@po creates backlog
     │
     ▼
/gate:validate-backlog
     │
     ▼
@sm plans sprint
     │
     ▼
/sprint:next-story
     │
     ▼
@dev implements (TDD)
     │
     ▼
/gate:validate-story
     │
     ▼
/sprint:transition done
```

---

## See Also

- [Installation Guide](INSTALLATION.md)
- [BMAD Practical Guide](BMAD-PRACTICAL-GUIDE.md)
- [Ralph Wiggum Guide](RALPH-GUIDE.md)
- [Contributing Guide](../CONTRIBUTING.md)
