# Claude-Craft Rules Index

## Stack Overview (2026)

.NET 10 LTS / C# 14 | Symfony 8 / PHP 8.5 | Flutter 3.44 / Dart 3.12 | React 19.2 | Laravel 13 | Python 3.14+

## Architecture Layers

```
WebAPI/Presentation → Infrastructure → Application → Domain (← INWARD ONLY)
```

**Domain**: NO external deps, Value Objects, private setters | **Application**: CQRS (MediatR/alternative), DTOs, validation | **Infrastructure**: DB, external services

## Coding Standards

| Element | Convention | Always |
|---------|-----------|--------|
| Public | PascalCase | Pass `CancellationToken`, enable nullable |
| Private | _camelCase | Async suffix: `ProcessAsync` |
| Params | camelCase | Methods < 20 lines, complexity < 10 |

## SOLID + KISS/DRY/YAGNI

**SRP**: 1 reason to change | **OCP**: Extend via interfaces | **LSP**: Subtypes substitutable | **ISP**: < 5 methods/interface | **DIP**: Depend on abstractions

**KISS**: < 10 complexity | **DRY**: Extract after 3 occurrences | **YAGNI**: Only what's required

## Testing Pyramid

Unit 70% (< 1s) | Integration 20% (< 5s) | E2E 10% (< 30s) — **TDD**: RED → GREEN → REFACTOR

**Stacks**: xUnit/FluentAssertions (C#), Pest 4 (PHP), Vitest 4 (JS/TS), pytest 8 (Python)

## Security Essentials

Server-side validation | Parameterized queries | Secrets in vault | CSP/HSTS headers | `[Authorize(Policy)]`

## Git Workflow

**Conventional Commits**: `<type>(<scope>): <description>` — Types: feat, fix, docs, refactor, perf, test  
**Branches**: `feature/`, `fix/`, `refactor/`

## Analysis Workflow (Mandatory)

1. Understand request → 2. Read affected files + deps → 3. Document impact/risks → 4. Validate if medium/high impact → 5. TDD first

## Technology References

| Stack | Path | Key Features |
|-------|------|--------------|
| **C# / .NET** | `@.claude/references/csharp/` | Extension Members, Span<T>, Clean Architecture |
| **Symfony / PHP** | `@.claude/references/symfony/CLAUDE.md` | JSON Streamer, ObjectMapper, DDD |
| **Flutter / Dart** | `@.claude/references/flutter/CLAUDE.md` | WASM, MCP, BLoC v9, Material 3 |

## Base Rules

`workflow-analysis.md` | `solid-principles.md` | `kiss-dry-yagni.md` | `git-workflow.md` | `security.md` | `testing.md` | `documentation.md`

## Tech-Specific Guides

**C#**: architecture, coding-standards, testing, security, tooling, quality-tools, aspire  
**Symfony**: architecture, coding-standards, quality-tools, json-streamer, object-mapper  
**Flutter**: coding-standards, wasm, mcp-integration, web-performance-2026

All in `@.claude/references/<tech>/`

## QA Recette Essentials

**Prerequisites**: Chrome extension v1.0.36+ | Claude Code `--chrome` or `/chrome`

```bash
/qa:recette --scope=story --id=US-001        # Test story
/qa:recette --resume=REC-xxx                 # Resume session
/qa:fix --session=REC-xxx --severity=critical # Fix critical bugs
/qa:regression --check                       # Check Golden Rule
```

**Golden Rule**: A fixed bug should NEVER reappear → auto-generates regression tests

**Output**: `.recette/` (plans, sessions, regression, metrics, reports)

## LSP Plugins

PHP: `php-lsp` | Python: `pyright-lsp` | TS/JS: `typescript-lsp` | Dart: `dart-analyzer` | C#: `csharp-lsp`

Install: `/plugins install <name>@claude-plugins-official`

> Full docs: `@.claude/COMPATIBILITY.md` | Technology details: `@.claude/references/<tech>/`
