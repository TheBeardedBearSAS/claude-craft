# Recovery Engine

The Recovery Engine is a core component of the Autonomous Sprint Conductor (ASC) that classifies errors and applies appropriate recovery strategies to minimize human intervention.

## Overview

Located at `Tools/Ralph/lib/recovery-engine.sh`, the recovery engine:

1. Intercepts errors from Ralph loop execution
2. Classifies errors into 4 severity levels
3. Applies auto-fix strategies when possible
4. Escalates to humans only when necessary

## Error Classification

### Level 0: Transient Errors

Temporary issues that typically resolve with retry.

| Pattern | Example | Recovery Strategy |
|---------|---------|-------------------|
| `timeout` | API timeout, slow network | Exponential backoff retry |
| `rate_limit` | Rate limit exceeded | Wait + retry |
| `ETIMEDOUT` | Connection timeout | Retry with longer timeout |
| `ECONNRESET` | Connection reset | Immediate retry |
| `503 Service` | Service unavailable | Wait 30s + retry |
| `429 Too Many` | Rate limited | Wait + exponential backoff |

**Configuration:**
```yaml
recovery:
  transient:
    max_retries: 5
    base_delay_seconds: 10
    max_delay_seconds: 300
    exponential_factor: 2
```

### Level 1: Recoverable Errors

Errors that can be fixed automatically with specific actions.

| Pattern | Auto-Fix Strategy |
|---------|-------------------|
| `lint error` | Run `npm run lint:fix`, `php-cs-fixer fix`, `black .` |
| `eslint` | Run `npx eslint --fix` |
| `phpcs` | Run `./vendor/bin/phpcbf` |
| `test failed` | Retry with TDD focus on failing tests |
| `missing module` | Run `npm install`, `composer install`, `pip install` |
| `type error` | Request Claude to fix specific type error |
| `syntax error` | Request Claude to fix syntax |
| `import error` | Check and fix import statements |

**Configuration:**
```yaml
recovery:
  recoverable:
    auto_fix_lint: true
    auto_fix_tests: "retry_tdd"  # retry_tdd, skip, false
    auto_install_deps: true
    max_fix_attempts: 3
```

### Level 2: Degraded Errors

Non-critical issues where work can continue with warnings.

| Pattern | Action |
|---------|--------|
| `documentation` | Log warning, continue |
| `coverage` | Log warning if >50%, continue |
| `optional` | Skip optional validation |
| `deprecation` | Log warning, continue |
| `warning:` | Log warning, continue |

**Configuration:**
```yaml
recovery:
  degraded:
    min_coverage_threshold: 50
    allow_deprecation_warnings: true
    skip_optional_gates: true
```

### Level 3: Blocked Errors

Critical issues requiring human intervention.

| Pattern | Escalation Priority |
|---------|---------------------|
| `security` | critical |
| `vulnerability` | critical |
| `architecture violation` | high |
| `breaking change` | high |
| `data loss` | critical |
| `OWASP` | critical |
| `authentication` | high |
| `authorization` | high |

**Configuration:**
```yaml
recovery:
  blocked:
    always_escalate:
      - "security"
      - "vulnerability"
      - "data loss"
    escalation_timeout_hours: 4
    default_action: "pause"  # pause, skip, abort
```

## Auto-Fix Strategies

### Lint Errors

```bash
# Detection
grep -i "lint\|eslint\|phpcs\|black\|flake8" error_output

# Technology-specific fixes
case $STACK in
  node|react|vue|angular)
    npm run lint:fix 2>/dev/null || npx eslint --fix .
    ;;
  php|symfony|laravel)
    ./vendor/bin/php-cs-fixer fix 2>/dev/null || ./vendor/bin/phpcbf
    ;;
  python)
    black . && isort . && ruff --fix .
    ;;
  flutter|dart)
    dart fix --apply
    ;;
esac
```

### Test Failures

```bash
# Strategy: retry_tdd
# 1. Extract failing test names
# 2. Create focused prompt for Claude
# 3. Request fix for specific failing tests
# 4. Re-run only failing tests first
# 5. If pass, run full suite

# Detection
grep -E "FAILED|FAIL|Error:|failed" test_output

# Extract failing tests
FAILING_TESTS=$(parse_test_output "$test_output")

# Focused retry
prompt="Fix the following failing tests:\n$FAILING_TESTS\nApply TDD RED->GREEN cycle."
```

### Missing Dependencies

```bash
# Detection patterns
grep -E "Cannot find module|ModuleNotFoundError|Class .* not found" error_output

# Auto-install
case $PACKAGE_MANAGER in
  npm) npm install ;;
  yarn) yarn install ;;
  pnpm) pnpm install ;;
  composer) composer install ;;
  pip) pip install -r requirements.txt ;;
  flutter) flutter pub get ;;
esac
```

### Type Errors

```bash
# Detection
grep -E "TypeError|type .* is not assignable|Type error" error_output

# Extract error details
ERROR_DETAILS=$(extract_type_error "$error_output")

# Request fix
prompt="Fix the following type error:\n$ERROR_DETAILS"
```

## Configuration Reference

Full configuration in `ralph-autonomous.yml`:

```yaml
recovery:
  # Master switch
  enabled: true

  # Global settings
  max_attempts: 3
  log_file: ".ralph/recovery/recovery-log.jsonl"

  # Transient (Level 0)
  transient:
    auto_retry: true
    max_retries: 5
    base_delay_seconds: 10
    max_delay_seconds: 300
    exponential_factor: 2
    patterns:
      - "timeout"
      - "rate_limit"
      - "ETIMEDOUT"
      - "ECONNRESET"
      - "503"
      - "429"

  # Recoverable (Level 1)
  recoverable:
    auto_fix_lint: true
    auto_fix_tests: "retry_tdd"  # retry_tdd, skip, false
    auto_install_deps: true
    max_fix_attempts: 3
    patterns:
      - "lint"
      - "eslint"
      - "phpcs"
      - "test failed"
      - "missing module"
      - "type error"
      - "syntax error"

  # Degraded (Level 2)
  degraded:
    continue_on_warning: true
    min_coverage_threshold: 50
    allow_deprecation_warnings: true
    skip_optional_gates: true
    patterns:
      - "documentation"
      - "coverage"
      - "optional"
      - "deprecation"
      - "warning:"

  # Blocked (Level 3)
  blocked:
    always_escalate:
      - "security"
      - "vulnerability"
      - "data loss"
      - "OWASP"
    escalation_timeout_hours: 4
    default_action: "pause"
    patterns:
      - "security"
      - "vulnerability"
      - "architecture violation"
      - "breaking change"
      - "authentication"
      - "authorization"
```

## Recovery Log

All recovery attempts are logged to `.ralph/recovery/recovery-log.jsonl`:

```json
{
  "timestamp": "2024-01-15T03:45:12Z",
  "session_id": "ASC-20240115-120000-12345",
  "story_id": "US-042",
  "error_level": 1,
  "error_type": "lint",
  "error_message": "ESLint found 3 errors",
  "recovery_action": "auto_fix_lint",
  "success": true,
  "duration_ms": 2340,
  "attempts": 1
}
```

## Troubleshooting

### Auto-fix Not Working

1. **Check tool availability:**
   ```bash
   # Verify lint tools exist
   which npx eslint php-cs-fixer black
   ```

2. **Check permissions:**
   ```bash
   # Ensure scripts are executable
   chmod +x Tools/Ralph/lib/recovery-engine.sh
   ```

3. **Check configuration:**
   ```yaml
   recovery:
     recoverable:
       auto_fix_lint: true  # Must be true
   ```

### Too Many Retries

1. **Adjust retry limits:**
   ```yaml
   recovery:
     transient:
       max_retries: 3  # Reduce from 5
     recoverable:
       max_fix_attempts: 2  # Reduce from 3
   ```

2. **Add patterns to blocked list:**
   ```yaml
   recovery:
     blocked:
       patterns:
         - "persistent error pattern"
   ```

### False Positives in Classification

1. **Review patterns:**
   ```bash
   # Check what patterns are matching
   grep -E "lint|test|error" .ralph/recovery/recovery-log.jsonl
   ```

2. **Customize patterns:**
   ```yaml
   recovery:
     recoverable:
       patterns:
         - "^lint error"  # More specific
         - "test (failed|error)"
   ```

### Recovery Takes Too Long

1. **Reduce timeouts:**
   ```yaml
   recovery:
     transient:
       max_delay_seconds: 60  # Reduce from 300
   ```

2. **Disable slow auto-fixes:**
   ```yaml
   recovery:
     recoverable:
       auto_fix_tests: "skip"  # Don't retry tests
   ```

## Metrics

Track recovery effectiveness:

| Metric | Description | Target |
|--------|-------------|--------|
| Recovery rate | Successful recoveries / total attempts | >70% |
| Level 0 success | Transient retries that succeed | >90% |
| Level 1 success | Auto-fixes that succeed | >60% |
| Escalation rate | Blocked errors / total errors | <20% |
| Mean recovery time | Average time to recover | <5 min |

## Related Documentation

- [Autonomous Sprint Guide](../../../docs/AUTONOMOUS-SPRINT.md)
- [Parallel Processing](./PARALLEL.md)
- [Ralph Wiggum](../README.md)
