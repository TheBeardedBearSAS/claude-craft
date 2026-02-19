# SOLID Principles

Universal SOLID principles guidelines for object-oriented code quality and architecture review.

Part of [Claude-Craft](https://github.com/TheBeardedBearSAS/claude-craft) -- AI-assisted development framework for Claude Code.

## Installation

Copy this directory to your project's `.claude/skills/` directory:

```bash
cp -r solid-principles/ your-project/.claude/skills/solid-principles/
```

## What's Included

- `SKILL.md` -- Skill definition with triggers and quick reference
- `REFERENCE.md` -- Comprehensive SOLID principles guidelines covering SRP, OCP, LSP, ISP, and DIP with examples, anti-patterns, and validation checklists

## Covers

- **S**ingle Responsibility Principle -- one reason to change per class
- **O**pen/Closed Principle -- extend via interfaces, don't modify existing code
- **L**iskov Substitution Principle -- subtypes must be substitutable for base types
- **I**nterface Segregation Principle -- small, focused interfaces
- **D**ependency Inversion Principle -- depend on abstractions, not implementations

## Technology Agnostic

This skill applies to any object-oriented language: C#, Java, TypeScript, Python, PHP, Ruby, Go, Kotlin, Dart, Swift, and more.

## License

MIT -- See [Claude-Craft](https://github.com/TheBeardedBearSAS/claude-craft) for full license.
