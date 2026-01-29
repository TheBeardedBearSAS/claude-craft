# Claude-Craft - Multi-Technology Framework

**Supported Stacks (2026):**
- **.NET 10 LTS / C# 14** - Clean Architecture, CQRS, MediatR
- **Symfony 8.0 / PHP 8.5** - Clean Architecture, DDD, Hexagonal
- **Flutter 3.38 / Dart 3.10** - Clean Architecture, BLoC/Riverpod

## Quick Reference

See `@.claude/INDEX.md` for condensed checklists and patterns.

## Technology Quick Links

| Technology | Quick Reference |
|------------|-----------------|
| C# / .NET | `@.claude/references/csharp/` |
| Symfony / PHP | `@.claude/references/symfony/CLAUDE.md` |
| Flutter / Dart | `@.claude/references/flutter/CLAUDE.md` |

## Available Commands

### Common
- `/common:init` - Bootstrap Claude-Craft structure
- `/common:add-technology` - Add new technology references

### C# / .NET
- `/csharp:check-compliance` - Full compliance audit
- `/csharp:check-architecture` - Architecture validation
- `/csharp:check-code-quality` - Code quality analysis
- `/csharp:check-testing` - Test coverage analysis
- `/csharp:check-security` - Security audit (OWASP)
- `/csharp:generate-feature` - Generate CQRS feature

## Docker Requirement

Always use Docker for commands to abstract from local environment.
