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
/qa:fix --session=REC-xxx

# Dry run: refine and document without fixing
/qa:fix --session=REC-xxx --dry-run

# Fix only critical bugs
/qa:fix --session=REC-xxx --severity=critical

# Show all session statuses
/qa:status --all

# Check regression tests (Golden Rule violations)
/qa:regression --check

# Generate report from session
/qa:report --session=REC-xxx
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

## Claude Code 2.1.38 Quick Reference

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

Read tool: `pages: "1-5"` for PDFs. PDFs >10 pages: lightweight ref with `@`.

### OAuth MCP (v2.1.30+)

`claude mcp add --client-id <id> --client-secret <secret> <server>`

### /debug (v2.1.30+)

`/debug` : Troubleshoot current session (complements `/doctor`).

### Task Tool Metrics (v2.1.30+)

Task results include: token count, tool uses, duration.

### Session Resume Hint (v2.1.31+)

Session resume hint displayed on Claude Code exit.

### PDF Limits (v2.1.31+)

PDF limits clarified: max 100 pages, max 20MB.

### Claude Opus 4.6 (v2.1.32+)

Model ID: `claude-opus-4-6`. 200K context (1M beta), 128K output, adaptive thinking (low/medium/high/max).

### Agent Teams (v2.1.32+ Research Preview)

Multi-agent: `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1`. Teammate/SendMessage tools, shared TaskList.

**Guide:** [Agent Teams Guide](../docs/AGENT-TEAMS-GUIDE.md)

**Team Templates:**

| Template | Use Case | Min Stacks/Stories |
|----------|----------|--------------------|
| `team-audit` | Parallel audit across tech stacks | 2+ tech stacks |
| `team-sprint` | Parallel story processing in sprints | 3+ independent stories |
| `team-security` | Parallel OWASP security review | 2+ tech stacks |

**Cost Tools:**

| Tool | Purpose |
|------|---------|
| `Tools/AgentTeams/lib/cost-estimator.sh` | Token/cost estimates (machine-readable) |
| `Tools/AgentTeams/lib/cost-dashboard.sh` | Visual cost comparison before launch |

**Quick decision:** Use parallel when 2+ tech stacks AND checks take > 3 min each. Expect 1.5-2.5x speedup (not 5-8x), +20-37% token overhead. Max 4 agents (1 leader + 3 workers).

### Automatic Memory (v2.1.32+)

Auto-records session memory after ~10K tokens. Stored in `~/.claude-profiles/`.

### --resume Agent Inheritance (v2.1.32+)

`--resume` auto-inherits `--agent` value from original session.

### TeammateIdle & TaskCompleted Hooks (v2.1.33+)

New hook events: `TeammateIdle` (teammate goes idle), `TaskCompleted` (task marked done).

### Agent Memory Frontmatter (v2.1.33+)

`memory: user|project|local` in agent frontmatter. Scopes: `user` (~/.claude/agent-memory/), `project` (.claude/agent-memory/), `local` (.claude/agent-memory-local/).

### Agent Type Restrictions (v2.1.33+)

`tools: [Task(Explore), Task(Plan)]` restricts which sub-agents an agent can spawn.

### Plugin Name in Skills (v2.1.33+)

Plugin name shown in `/skills` menu and skill descriptions.

### Fast Mode (v2.1.36+)

`/fast` toggles fast mode for Opus 4.6 (up to 2.5x faster output, same intelligence). Persists across sessions.

Pricing: $30/M input, $150/M output (fast) vs $5/M input, $25/M output (standard).

### Security: Skills Sandbox (v2.1.38+)

Writes to `.claude/skills` blocked in sandbox mode.

### Heredoc JS Template Fix (v2.1.38+)

No more "Bad substitution" errors with `${expression}` in heredocs.

### VSCode & Stability Fixes (v2.1.38+)

Plan mode crash fix, temperatureOverride fix, LSP compatibility, VSCode scroll/Tab/sessions fixes.

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
