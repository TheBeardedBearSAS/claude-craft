# QA Recette — Automated Acceptance Testing

> **Status:** Integrated in Claude Craft | **Version:** 1.0.36+
> **Future:** Planned extraction to standalone product (see [ARCHITECTURE.md](ARCHITECTURE.md) and [RFC.md](RFC.md))

QA Recette is an automated acceptance testing tool integrated into Claude Craft that leverages Chrome automation to run reproducible tests for user stories and sprints.

**Golden Rule:** A fixed bug should NEVER reappear.

---

## Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Setup](#setup)
4. [Usage](#usage)
   - [Scenario 1: Test a Story](#scenario-1-test-a-story)
   - [Scenario 2: Test a Sprint](#scenario-2-test-a-sprint)
   - [Scenario 3: Resume a Session](#scenario-3-resume-a-session)
5. [Session Storage](#session-storage)
6. [Troubleshooting](#troubleshooting)
7. [Architecture](#architecture)

---

## Overview

QA Recette provides automated acceptance testing capabilities through:

- **User Story Testing** — Validate acceptance criteria for individual stories
- **Sprint Testing** — Run regression tests for all stories in a sprint
- **Session Resume** — Continue interrupted test sessions
- **Chrome Automation** — Real browser testing with screenshots and traces
- **Regression Detection** — Prevent fixed bugs from reappearing

### Key Features

| Feature | Description |
|---------|-------------|
| **Story Scope** | Test individual user story with acceptance criteria |
| **Sprint Scope** | Test all stories in a sprint for regression |
| **Session Resume** | Resume interrupted sessions by ID |
| **Screenshots** | Automatic screenshot capture for test steps |
| **Trace Recording** | Full browser trace for debugging |
| **Report Generation** | Markdown reports with test results |

---

## Prerequisites

### Required

1. **Claude Code** — Version 2.1.47+ (recommended 2.1.107+)
2. **Chrome Extension** — QA Recette Chrome Extension v1.0.36+
3. **Chrome Browser** — Latest stable version

### Installation

1. **Install Claude Craft**
   ```bash
   npx @the-bearded-bear/claude-craft install . --tech=<your-tech> --lang=en
   ```

2. **Install Chrome Extension**
   - Visit Chrome Web Store (link TBD in future standalone release)
   - Current version integrated with Claude Code `--chrome` mode

3. **Verify Installation**
   ```bash
   # Start Claude Code with Chrome support
   claude --chrome
   
   # Or use /chrome command within Claude Code session
   /chrome
   ```

---

## Setup

### Project Structure

QA Recette stores test sessions locally:

```
~/.qa-recette/
├── sessions/
│   └── REC-YYYYMMDD-HHMMSS/
│       ├── config.json
│       ├── steps/
│       │   ├── 001-login.json
│       │   └── 002-checkout.json
│       ├── screenshots/
│       └── report.md
└── registry.json   # Session index for regression tests
```

### Configuration

Create a test configuration in your project (optional):

```json
{
  "baseUrl": "https://localhost:3000",
  "timeout": 30000,
  "headless": false,
  "screenshotOnFailure": true
}
```

---

## Usage

### Scenario 1: Test a Story

Test acceptance criteria for a single user story.

**Command:**
```bash
/qa:recette --scope=story --id=US-001
```

**Process:**
1. QA Recette loads the story acceptance criteria
2. Chrome extension executes each test step
3. Screenshots captured for each step
4. Report generated in `~/.qa-recette/sessions/REC-*/report.md`

**Example Output:**
```
✓ Story US-001 testing started
✓ Step 1: User login successful
✓ Step 2: Product added to cart
✓ Step 3: Checkout completed
✓ Report generated: ~/.qa-recette/sessions/REC-20260417-143022/report.md
```

### Scenario 2: Test a Sprint

Run regression tests for all stories in a sprint.

**Command:**
```bash
/qa:recette --scope=sprint --id=Sprint-3
```

**Process:**
1. QA Recette loads all stories in Sprint-3
2. Executes tests for each story in sequence
3. Aggregates results in a sprint-level report
4. Flags any regressions (previously passing tests now failing)

**Example Output:**
```
✓ Sprint Sprint-3 testing started (5 stories)
✓ US-001: Login flow — PASS
✓ US-002: Product search — PASS
✗ US-003: Checkout — FAIL (regression detected)
✓ US-004: Payment — PASS
✓ US-005: Order confirmation — PASS

⚠ 1 regression detected in US-003
📄 Full report: ~/.qa-recette/sessions/REC-20260417-150000/report.md
```

### Scenario 3: Resume a Session

Resume a previously interrupted test session.

**Command:**
```bash
/qa:recette --resume=REC-20260417-143022
```

**Process:**
1. Loads session state from `~/.qa-recette/sessions/REC-20260417-143022/`
2. Continues from last completed step
3. Appends new results to existing report

**Example Output:**
```
✓ Session REC-20260417-143022 resumed
ℹ Last completed: Step 2/5
✓ Step 3: Payment processed
✓ Step 4: Order confirmation sent
✓ Session completed
📄 Report updated: ~/.qa-recette/sessions/REC-20260417-143022/report.md
```

---

## Session Storage

### Session Directory Structure

```
~/.qa-recette/sessions/REC-20260417-143022/
├── config.json          # Test configuration
├── steps/
│   ├── 001-login.json   # Step 1 state
│   ├── 002-cart.json    # Step 2 state
│   └── 003-checkout.json# Step 3 state
├── screenshots/
│   ├── 001-login.png
│   ├── 002-cart.png
│   └── 003-checkout.png
└── report.md            # Test report
```

### Config Format

```json
{
  "sessionId": "REC-20260417-143022",
  "scope": "story",
  "id": "US-001",
  "baseUrl": "https://localhost:3000",
  "timeout": 30000,
  "createdAt": "2026-04-17T14:30:22Z"
}
```

### Report Format

```markdown
# QA Recette Report — Story US-001

**Session ID:** REC-20260417-143022
**Scope:** story
**Status:** PASS
**Date:** 2026-04-17 14:30:22

## Test Steps

### Step 1: User login
- **Status:** PASS
- **Duration:** 1.2s
- **Screenshot:** screenshots/001-login.png

### Step 2: Add product to cart
- **Status:** PASS
- **Duration:** 0.8s
- **Screenshot:** screenshots/002-cart.png

### Step 3: Complete checkout
- **Status:** PASS
- **Duration:** 2.1s
- **Screenshot:** screenshots/003-checkout.png

## Summary

- **Total Steps:** 3
- **Passed:** 3
- **Failed:** 0
- **Regressions:** 0
```

---

## Troubleshooting

### Chrome Extension Not Found

**Problem:** `/qa:recette` fails with "Chrome extension not available"

**Solution:**
1. Verify Chrome extension is installed
2. Start Claude Code with `--chrome` flag
3. Check extension is enabled in `chrome://extensions/`

### Session Not Resuming

**Problem:** `--resume=REC-*` fails with "Session not found"

**Solution:**
1. Verify session exists: `ls ~/.qa-recette/sessions/`
2. Check session ID format: `REC-YYYYMMDD-HHMMSS`
3. Ensure `config.json` is not corrupted

### Test Timeouts

**Problem:** Tests fail with timeout errors

**Solution:**
1. Increase timeout in config: `"timeout": 60000` (60s)
2. Check network connectivity
3. Verify baseUrl is accessible
4. Run in non-headless mode for debugging: `"headless": false`

### Screenshots Missing

**Problem:** Screenshots not captured

**Solution:**
1. Check permissions: `ls -la ~/.qa-recette/sessions/*/screenshots/`
2. Verify `screenshotOnFailure: true` in config
3. Ensure sufficient disk space

---

## Architecture

For detailed architectural information about QA Recette, see:

- **[ARCHITECTURE.md](ARCHITECTURE.md)** — Standalone product architecture (future extraction)
- **[RFC.md](RFC.md)** — RFC for standalone QA Recette v1.0
- **[api-spec.yaml](api-spec.yaml)** — OpenAPI spec for cloud backend (future)

### Current Architecture

QA Recette is currently integrated into Claude Craft:

```
Claude Code CLI
  ↓ /qa:recette command
.claude/commands/qa/recette.md
  ↓ invoke Chrome extension
Chrome Extension v1.0.36+
  ↓ browser automation
Test Execution + Screenshot Capture
  ↓ write results
~/.qa-recette/sessions/REC-*/
```

### Future Standalone Architecture

See [ARCHITECTURE.md](ARCHITECTURE.md) for the planned standalone product:
- **SDK open-source MIT** (`@claude-craft/qa-recette-sdk`)
- **Chrome extension proprietary**
- **Cloud backend optional** (sync + dashboards)

---

## Commands Reference

| Command | Description |
|---------|-------------|
| `/qa:recette --scope=story --id=<ID>` | Test a single story |
| `/qa:recette --scope=sprint --id=<ID>` | Test all stories in a sprint |
| `/qa:recette --resume=<SESSION_ID>` | Resume interrupted session |
| `/qa:status` | Show current test session status |
| `/qa:report` | Generate full test report |
| `/qa:tdd` | Run TDD workflow for a feature |
| `/qa:fix` | Fix a failing test |
| `/qa:regression` | Check for regressions |

For complete command documentation, see:
- `.claude/commands/qa/recette.md` — Main QA Recette command
- `.claude/commands/qa/status.md` — Status command
- `.claude/commands/qa/report.md` — Report generation
- `.claude/commands/qa/tdd.md` — TDD workflow
- `.claude/commands/qa/fix.md` — Fix failing tests
- `.claude/commands/qa/regression.md` — Regression detection

---

## Contributing

QA Recette is part of Claude Craft. To contribute:

1. See [CONTRIBUTING.md](../../CONTRIBUTING.md)
2. Open issues on [GitHub](https://github.com/TheBeardedBearSAS/claude-craft/issues)
3. Join discussions about the future standalone product in [RFC.md](RFC.md)

---

## License

Currently part of Claude Craft (see root LICENSE).

Future standalone product will use dual licensing:
- **SDK** — MIT License
- **Chrome Extension** — Proprietary EULA
- **Cloud Backend** — Proprietary SaaS

---

**Last Updated:** 2026-04-17
**Version:** 1.0.36+
**Maintainer:** The Bearded CTO
