# Claude-Craft Rules Index

## Project Context

**Stack**: .NET 10 LTS, C# 14, Clean Architecture, CQRS, MediatR, EF Core, xUnit

**Versions 2026:**
- .NET 10 LTS / C# 14 (Extension Members, Null-Conditional Assignment)
- Symfony 8.0 / PHP 8.5 (Pipe operator, JSON Streamer, ObjectMapper)
- Flutter 3.38 / Dart 3.10 (WebAssembly, MCP, Dot Shorthands)

## Architecture Quick Reference

```
src/
├── Domain/        # NO external deps, private setters, Value Objects
├── Application/   # CQRS via MediatR, FluentValidation, DTOs
├── Infrastructure/# EF Core, external services
└── WebAPI/        # Minimal APIs or Controllers
```

**Dependency Rule**: WebAPI → Infrastructure → Application → Domain (INWARD ONLY)

## Coding Standards

| Element | Convention | Example |
|---------|-----------|---------|
| Public | PascalCase | `GetOrderAsync` |
| Private fields | _camelCase | `_orderRepository` |
| Async | Suffix Async | `ProcessAsync` |
| Params | camelCase | `orderId` |

**Always**: Pass `CancellationToken`, enable nullable reference types.

## SOLID Principles

- **S**RP: One reason to change per class
- **O**CP: Open for extension, closed for modification (use interfaces)
- **L**SP: Subtypes must be substitutable for base types
- **I**SP: Small, focused interfaces (< 5 methods)
- **D**IP: Depend on abstractions, not implementations

## KISS/DRY/YAGNI

- Methods < 20 lines, complexity < 10
- No code duplication (extract after 3 occurrences)
- Only implement what's explicitly required

## Testing Checklist

| Type | Coverage | Speed |
|------|----------|-------|
| Unit | 70% | < 1s each |
| Integration | 20% | < 5s each |
| E2E | 10% | < 30s each |

**TDD Cycle**: RED (failing test) → GREEN (minimal code) → REFACTOR

**C# Stack**: xUnit + FluentAssertions + Moq + Bogus + Testcontainers

## Security Essentials

- Validate ALL inputs server-side
- Use parameterized queries (never concatenate SQL)
- Policy-based authorization with `[Authorize(Policy = "...")]`
- Secrets in Key Vault (never in code)
- Security headers: CSP, X-Frame-Options, HSTS

## Git Workflow

**Conventional Commits**:
```
<type>(<scope>): <description>

Types: feat, fix, docs, style, refactor, perf, test, build, ci, chore
```

**Branch naming**: `feature/`, `fix/`, `refactor/`, `docs/`

## Analysis Workflow

Before ANY code change:
1. Understand the request
2. Read affected files + dependencies
3. Document: files impacted, risks, approach
4. Validate with user if medium/high impact
5. Write tests FIRST (TDD)

## Technology Quick Links

### C# / .NET 10 LTS
See: `@.claude/references/csharp/`
- Extension Members, Null-Conditional Assignment, Span<T>

### Symfony 8 / PHP 8.5
See: `@.claude/references/symfony/CLAUDE.md`
- JSON Streamer, ObjectMapper, Pipe operator

### Flutter 3.38 / Dart 3.10
See: `@.claude/references/flutter/CLAUDE.md`
- WebAssembly, MCP, Dot Shorthands

## Full Documentation

Access complete rules via `@.claude/references/`:

### Base Principles
- `base/workflow-analysis.md` - Mandatory analysis workflow
- `base/solid-principles.md` - SOLID in depth
- `base/kiss-dry-yagni.md` - Simplicity principles
- `base/git-workflow.md` - Git & conventional commits
- `base/documentation.md` - Doc standards

### C# / .NET 10
- `csharp/architecture.md` - Clean Architecture details
- `csharp/coding-standards.md` - C# 14 conventions
- `csharp/testing.md` - Testing patterns & frameworks
- `csharp/security.md` - OWASP & .NET security
- `csharp/tooling.md` - Dev environment setup
- `csharp/quality-tools.md` - Analyzers & formatters
- `csharp/aspire.md` - .NET Aspire cloud-native

### Symfony 8 / PHP 8.5
- `symfony/CLAUDE.md` - Quick reference
- `symfony/architecture.md` - Clean Architecture DDD
- `symfony/coding-standards.md` - PHP 8.5 standards
- `symfony/quality-tools.md` - PHPStan 2.x, Rector 2.x, Deptrac v4
- `symfony/json-streamer.md` - JSON Streamer Component
- `symfony/object-mapper.md` - ObjectMapper Component
- `symfony/service-container-2026.md` - Container 2026

### Flutter 3.38 / Dart 3.10
- `flutter/CLAUDE.md` - Quick reference
- `flutter/coding-standards.md` - Dart 3.10 standards
- `flutter/wasm.md` - WebAssembly compilation
- `flutter/mcp-integration.md` - Model Context Protocol
- `flutter/web-performance-2026.md` - Web performance

## Autonomous Sprint Conductor (ASC) Quick Reference

### Essential Commands

```bash
# Overnight sprint
/common:ralph-sprint "Sprint N" --overnight

# Supervised (first run)
/common:ralph-sprint "Sprint N" --supervised

# Parallel (3 stories)
/common:ralph-sprint "Sprint N" --parallel 3 --overnight

# Single story
/common:ralph-sprint "Sprint N" --story US-042

# Resume session
/common:ralph-sprint "Sprint N" --resume ASC-xxx
```

### Quick Configuration

```yaml
# ralph-autonomous.yml (minimal)
autonomous:
  enabled: true
  mode: "bounded"
  schedule:
    stop_window: "06:00"
recovery:
  enabled: true
  auto_fix_lint: true
escalation:
  enabled: true
  timeout_hours: 4
```

### Error Classification

| Level | Type | Action |
|-------|------|--------|
| 0 | Transient | Auto-retry |
| 1 | Recoverable | Auto-fix |
| 2 | Degraded | Continue |
| 3 | Blocked | Escalate |

### Key Metrics

| Metric | Target |
|--------|--------|
| Interventions/sprint | <5 |
| Stories overnight | 3-5 |
| Auto-recovery rate | >70% |

### Monitoring

```bash
# Session state
cat .ralph/conductor/state-ASC-*.yaml

# Escalations
ls .ralph/escalations/queue/

# Metrics
cat .ralph/conductor/metrics-ASC-*.json
```

---

## QA Recette Quick Reference

### Essential Commands

```bash
# Test a story
/qa:recette --scope=story --id=US-001

# Test with dry run first
/qa:recette --scope=story --id=US-001 --dry-run

# Resume interrupted session
/qa:recette --resume=REC-xxx

# Record execution as GIF
/qa:recette --scope=story --id=US-001 --record-gif

# Fix bugs from a recette session
/qa:recette-fix --session=REC-xxx

# Dry run: refine and document without fixing
/qa:recette-fix --session=REC-xxx --dry-run

# Fix only critical bugs
/qa:recette-fix --session=REC-xxx --severity=critical
```

### Prerequisites

1. Chrome extension v1.0.36+
2. Claude Code with `--chrome` or `/chrome` command

### Golden Rule

> **A fixed bug should NEVER reappear.**

All detected errors auto-generate regression tests:
- Logic/Validation → Unit test
- API/Service → Functional test
- User flow → Behat feature

### Output Structure

```
.recette/
├── plans/           # Test plans
├── sessions/        # Session states (resume)
├── regression/      # Regression tests
│   └── registry.yaml
├── metrics/         # Historical data
└── reports/         # Generated reports
```

---

## Claude Code 2.1.31 Quick Reference

### PR Integration (v2.1.27+)

```bash
# Resume session linked to PR
claude --from-pr 123
claude --from-pr https://github.com/org/repo/pull/123
```

Footer shows PR status: approved | pending | changes requested | draft | merged

### spinnerVerbs (v2.1.23+)

```json
{
  "spinnerVerbs": {
    "default": ["Thinking", "Processing"],
    "Edit": ["Editing", "Modifying"]
  }
}
```

### File Tools vs Bash (v2.1.21+)

| Use | Instead of |
|-----|------------|
| `Read` | `cat/head/tail` |
| `Edit` | `sed/awk` |
| `Write` | `echo >/cat <<EOF` |

### Task Status (v2.1.20+)

```
pending → in_progress → completed
              ↓
           deleted
```

### PDF Page Range (v2.1.30+)

Read tool: `pages: "1-5"` pour PDFs. PDFs >10 pages: ref légère avec `@`.

### OAuth MCP (v2.1.30+)

`claude mcp add --client-id <id> --client-secret <secret> <server>`

### /debug (v2.1.30+)

`/debug` : Troubleshoot current session (complète `/doctor`).

### Task Tool Metrics (v2.1.30+)

Résultats Task incluent : token count, tool uses, duration.

### Session Resume Hint (v2.1.31+)

Hint de reprise de session affiché à la sortie de Claude Code.

### PDF Limits (v2.1.31+)

Limites PDF clarifiées : max 100 pages, max 20MB.

---

## Skills

Invoke skills with `/skill-name`:
- `/testing` - Testing guidance
- `/security` - Security review
- `/git-workflow` - Git operations
- `/documentation` - Doc writing
- `/solid-principles` - SOLID review
- `/kiss-dry-yagni` - Simplicity review
- `/workflow-analysis` - Analysis workflow
