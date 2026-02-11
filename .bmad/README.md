# BMAD v6 - Build, Measure, Analyze, Deliver

## Overview

BMAD v6 is a project management enhancement framework for claude-craft that provides:

- **10 Agent-as-Code** definitions following BMAD methodology
- **Status-based routing** with automated state machine
- **5 Quality gates** with configurable thresholds
- **Batch processing** for epic/sprint execution
- **Claude Code hooks** for context injection and validation
- **Autonomous Sprint Conductor (ASC)** integration for overnight execution

## Directory Structure

```
.bmad/
├── sprint-status.yaml       # Current sprint state tracking
├── batch-queue.yaml         # Batch processing queue
├── gates/                   # Quality gate configurations
│   ├── prd-gate.yaml        # PRD validation (≥80%)
│   ├── techspec-gate.yaml   # Tech Spec validation (≥90%)
│   ├── backlog-gate.yaml    # INVEST compliance
│   ├── story-gate.yaml      # Definition of Done
│   └── sprint-ready-gate.yaml
├── hooks/                   # Claude Code integration hooks
│   ├── sprint-context.sh    # SessionStart: inject sprint context
│   ├── story-status.sh      # PreToolUse: inject story status
│   └── quality-gate.sh      # Stop: validate before completion
└── lib/                     # Core library scripts
    ├── routing-engine.sh    # State machine transitions
    ├── gate-validator.sh    # Quality gate validation
    └── batch-executor.sh    # Batch processing engine
```

## Quick Start

### 1. Initialize BMAD

If you have an existing backlog:
```
/project:analyze-backlog
/project:migrate-backlog
```

### 2. Configure Sprint

Edit `.bmad/sprint-status.yaml`:
```yaml
metadata:
  sprint_id: "sprint-1"
  name: "Walking Skeleton"
  start_date: "2026-01-29"
  end_date: "2026-02-12"
  goal: "Implement core authentication features"
```

### 3. Enable Claude Code Hooks

Add to your project's `.claude/settings.json`:
```json
{
  "hooks": {
    "SessionStart": [{
      "command": ".bmad/hooks/sprint-context.sh",
      "timeout": 5000
    }],
    "PreToolUse": [{
      "command": ".bmad/hooks/story-status.sh",
      "once": true,
      "timeout": 3000
    }],
    "Stop": [{
      "command": ".bmad/hooks/quality-gate.sh",
      "timeout": 10000
    }]
  }
}
```

## Commands Reference

### Sprint Management
| Command | Description |
|---------|-------------|
| `/sprint:bmad-status` | Display sprint status with routing |
| `/sprint:next-story` | Get next ready story |
| `/sprint:transition <ID> <status>` | Transition story status |
| `/sprint:auto-route` | Execute automatic routing rules |

### Quality Gates
| Command | Description |
|---------|-------------|
| `/gate:validate-prd` | Validate PRD (≥80%) |
| `/gate:validate-techspec` | Validate Tech Spec (≥90%) |
| `/gate:validate-backlog` | Validate INVEST compliance |
| `/gate:validate-story <ID>` | Validate story DoD |
| `/gate:validate-sprint` | Validate sprint readiness |
| `/gate:report` | Full gates report |

### Backlog Migration
| Command | Description |
|---------|-------------|
| `/project:analyze-backlog` | Analyze current backlog |
| `/project:migrate-backlog` | Convert to BMAD v6 |
| `/project:update-stories` | Add missing fields |
| `/project:sync-backlog` | Sync files ↔ YAML |

### Batch Processing
| Command | Description |
|---------|-------------|
| `/project:run-epic <ID>` | Queue epic stories |
| `/project:run-queue` | Process queue |
| `/project:run-sprint` | Execute full sprint |
| `/project:batch-status` | View queue status |

### Team Sprint (Ralph Mode)
| Command | Description |
|---------|-------------|
| `/common:team-sprint --ralph-mode` | Run autonomous sprint overnight |
| `batch-executor.sh autonomous` | Queue with Ralph integration |
| `routing-engine.sh auto-claim` | Auto-claim next ready story |
| `routing-engine.sh tdd-phase` | Update TDD phase with auto-transition |

## State Machine

```
backlog → ready-for-dev → in-progress → review → done
   ↓          ↓              ↓           ↓
   └──────────┴──────────────┴───────────┴→ blocked
```

### Valid Transitions
- `backlog` → `ready-for-dev` (after refinement)
- `ready-for-dev` → `in-progress` (developer picks up)
- `in-progress` → `review` (all tasks complete)
- `review` → `done` (DoD satisfied)
- `review` → `in-progress` (changes requested)
- `*` → `blocked` (external blocker)
- `blocked` → previous status (unblocked)

## Agents

| Agent | Role | Key Commands |
|-------|------|--------------|
| `bmad-master` | Orchestrator | `/bmad:route` |
| `pm` | Product Manager | `/pm:prd`, `/pm:vision` |
| `ba` | Business Analyst | `/ba:analyze`, `/ba:requirements` |
| `architect` | System Architect | `/arch:design`, `/arch:techspec` |
| `po` | Product Owner | `/po:prioritize`, `/po:accept` |
| `sm` | Scrum Master | `/sm:plan-sprint`, `/sm:retro` |
| `dev` | Developer | `/dev:implement`, `/dev:tdd` |
| `qa` | QA Engineer | `/qa:validate`, `/qa:automate` |
| `ux` | UX Designer | `/ux:wireframe`, `/ux:journey` |

## Quality Gate Thresholds

| Gate | Threshold | Criteria |
|------|-----------|----------|
| PRD | ≥80% | Problem, users, goals, metrics, scope |
| Tech Spec | ≥90% | Architecture, security, testing, deployment |
| Backlog | 6/6 INVEST | Independent, Negotiable, Valuable, Estimable, Small, Testable |
| Story DoD | 100% | Tasks, tests, AC, review, no blockers |
| Sprint Ready | 100% | Metadata, goal, stories ready, estimated |

## TDD Integration

Stories track TDD phase:
- 🔴 `red` - Writing failing tests
- 🟢 `green` - Implementing to pass
- 🔵 `refactor` - Cleaning up code

Update with: `/sprint:tdd <story-id> <phase>`

## Team Sprint Integration

BMAD v6 integrates with the team sprint command for overnight execution:

### Ralph Mode Features

```bash
# Run sprint overnight
/common:team-sprint --ralph-mode "Sprint 1" --overnight

# With parallel processing
/common:team-sprint --ralph-mode "Sprint 1" --parallel 3 --overnight
```

### Routing Engine Autonomous Commands

```bash
# Enable autonomous routing
./lib/routing-engine.sh enable-autonomous

# Auto-claim next story
./lib/routing-engine.sh auto-claim

# Update TDD phase (triggers auto-transition)
./lib/routing-engine.sh tdd-phase US-001 refactor

# Update test status
./lib/routing-engine.sh tests-status US-001 true
```

### Batch Executor Autonomous Mode

```bash
# Queue stories with Ralph integration
./lib/batch-executor.sh autonomous --parallel 2
```

See [Autonomous Sprint Documentation](../docs/AUTONOMOUS-SPRINT.md) for complete guide.

## Requirements

- `yq` - YAML processor (required for routing and gates)
- `bash` 4.0+ - For hooks and scripts

Install yq:
```bash
# macOS
brew install yq

# Linux
sudo wget -qO /usr/local/bin/yq https://github.com/mikefarah/yq/releases/latest/download/yq_linux_amd64
sudo chmod +x /usr/local/bin/yq
```

## License

Part of claude-craft - MIT License
