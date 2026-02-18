---
description: Automated acceptance testing with Claude in Chrome
argument-hint: --scope=<story|epic|sprint|task> --id=<target-id> [--resume|--record-gif|--dry-run]
---

# QA Recette - Automated Acceptance Testing

Execute automated acceptance tests (recette) on web applications using Claude in Chrome for browser automation. This system implements the **Golden Rule**: A fixed bug should NEVER reappear.

## Arguments

**$ARGUMENTS**

- `--scope=<type>`: Scope of testing (story, epic, sprint, task)
- `--id=<target-id>`: Target identifier (e.g., US-001, EPIC-01, Sprint-3)
- `--resume=<session-id>`: Resume from a previous session
- `--record-gif`: Record GIF of test execution
- `--dry-run`: Generate plan without executing tests
- `--base-url=<url>`: Override base URL for testing

## Key Features

| Feature | Description |
|---------|-------------|
| **Comprehensive Plans** | Generates exhaustive test plans from acceptance criteria |
| **Browser Automation** | Uses Claude in Chrome for real browser testing |
| **Session Recovery** | Checkpoint-based resume for interrupted sessions |
| **Golden Rule** | Automatic regression test generation for all errors |
| **Living Documentation** | Maintains test documentation with traceability |
| **Regression Detection** | Compares runs to detect regressions |

## Prerequisites

1. **Claude in Chrome Extension**: Version 1.0.36 or higher
2. **Chrome Browser**: Open with the extension active
3. **Claude Code**: Started with `--chrome` flag or `/chrome` command

```bash
# Start Claude Code with Chrome support
claude --chrome

# Or enable Chrome in existing session
/chrome
```

## Process

### 1. Verification

The command first verifies Chrome MCP is available:

```
┌─────────────────────────────────────────┐
│  1. check_chrome_mcp()                  │
│     - MCP claude-in-chrome present?     │
│     - Extension connected?              │
│     - Site permissions OK?              │
└─────────────────────────────────────────┘
```

### 2. Test Plan Generation

Generates comprehensive test plan covering:

| Category | Description |
|----------|-------------|
| `acceptance_criteria_validation` | Tests for each AC |
| `edge_cases` | Boundary conditions |
| `error_scenarios` | Error handling |
| `ui_ux_verification` | UI/UX consistency |
| `performance_checks` | Load times |
| `security_basics` | XSS, CSRF, injection |

### 3. Test Execution

Each test is executed via Chrome:

```
Test TC-001
├── Step 1: navigate → /login
├── Step 2: type → #email = "user@test.com"
├── Step 3: click → button[type='submit']
└── Assertions
    ├── url_matches → ^.*/dashboard$
    └── element_visible → .welcome-message
```

### 4. Error → Test → Regression

When an error is detected:

```
1. Error detected during recette
         │
         ▼
2. Classification (visual, interaction, validation, logic, security, API)
         │
         ▼
3. Generate tests based on type:
   - Logic/Validation → Unit test
   - API/Service → Functional test
   - User flow → Behat feature
         │
         ▼
4. Add to regression registry with @regression tag
         │
         ▼
5. Fix the bug (TDD workflow)
         │
         ▼
6. Verify: all regression tests pass
```

## Quick Start Examples

```bash
# Test a specific story
/qa:recette --scope=story --id=US-001

# Test all stories in a sprint
/qa:recette --scope=sprint --id=Sprint-3

# Dry run to see the test plan
/qa:recette --scope=story --id=US-001 --dry-run

# Resume an interrupted session
/qa:recette --scope=story --id=US-001 --resume=REC-20260130-143022

# Record execution as GIF
/qa:recette --scope=story --id=US-001 --record-gif
```

## Session Recovery

Sessions are checkpointed after each test:

```yaml
# .recette/sessions/{session-id}/state.yaml
session:
  id: "REC-20260130-143022"
  status: "paused"

progress:
  current_test_index: 5
  tests:
    total: 15
    passed: 4
    failed: 1
    pending: 10

recovery:
  resumable: true
  resume_from:
    test_id: "TC-005"
    step_index: 0
```

To resume:

```bash
/qa:recette --scope=story --id=US-001 --resume=REC-20260130-143022
```

## Regression Registry

All detected errors are tracked:

```yaml
# .recette/regression/registry.yaml
entries:
  - id: "REG-001"
    error_id: "ERR-001"
    source:
      scope: "story"
      target_id: "US-001"
    generated_tests:
      - type: "unit"
        path: "tests/Unit/Auth/LoginErrorTest.php"
      - type: "behat"
        path: "features/auth/login_error.feature"
    fix:
      status: "verified"
```

## Output Structure

```
.recette/
├── plans/              # Test plans (YAML)
│   └── story-US-001-plan.yaml
├── sessions/           # Session states
│   └── REC-20260130-143022/
│       ├── state.yaml
│       ├── screenshots/
│       ├── checkpoints/
│       └── logs/
├── regression/         # Regression suite
│   ├── registry.yaml
│   └── tests/
│       ├── Unit/
│       ├── Functional/
│       └── Behat/
├── metrics/            # Historical data
│   └── history.jsonl
└── reports/            # Generated reports
    └── REC-20260130-143022-report.md
```

## Related Commands

| Command | Description |
|---------|-------------|
| `/qa:recette-fix` | Fix bugs from a recette session |
| `/qa:recette-status` | Show session status |
| `/qa:recette-regression` | View regression tests |
| `/qa:recette-report` | Generate report |
| `/qa:validate` | Validate story AC |
| `/qa:automate` | Create automated tests |

## Chrome Capabilities

| Category | Actions |
|----------|---------|
| **Navigation** | navigate, back, forward, refresh |
| **Interaction** | click, type, fill_form, scroll, hover |
| **Reading** | DOM state, element text, attributes |
| **Debugging** | Console logs, network requests, errors |
| **Capture** | Screenshot, record GIF |

## Error Messages

| Error | Solution |
|-------|----------|
| "MCP not detected" | Run `claude --chrome` or `/chrome` |
| "Extension not connected" | Open Chrome, verify extension |
| "Permission required" | Allow extension on the domain |
| "Version outdated" | Update Chrome extension to v1.0.36+ |

## Best Practices

1. **Start with dry-run**: Verify the test plan before execution
2. **Use specific scopes**: Test stories individually for better tracking
3. **Review regressions**: Check `.recette/regression/` after each run
4. **Enable GIF recording**: For debugging complex failures
5. **Maintain base URL**: Configure in plan for consistent testing

## Next Step

```
╔══════════════════════════════════════════════════════════╗
║                      NEXT STEP                           ║
╠══════════════════════════════════════════════════════════╣
║                                                          ║
║  If bugs were found:                                     ║
║  → /qa:fix                                               ║
║    Automated bug fixing from recette session             ║
║  → /qa:tdd                                               ║
║    Fix bugs with TDD approach                            ║
║                                                          ║
║  If all tests pass:                                      ║
║  → /qa:report                                            ║
║    Generate the recette report                           ║
║  → /sprint:transition done                               ║
║    Mark the story as done                                ║
║                                                          ║
╚══════════════════════════════════════════════════════════╝
```
