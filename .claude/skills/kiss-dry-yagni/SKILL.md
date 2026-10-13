---
name: kiss-dry-yagni
description: Principes KISS, DRY, YAGNI. Use when reviewing code quality or refactoring.
  files: ["*.cs", "*.java", "*.ts", "*.tsx", "*.js", "*.py", "*.php", "*.rb", "*.go", "*.kt", "*.dart", "*.swift"]
---

# Principes KISS, DRY, YAGNI

This skill provides simplicity and code quality guidelines.

See @REFERENCE.md for detailed documentation.

## Quick Reference

- **KISS**: Methods target < 10 lines (hard limit 20), cognitive complexity < 7 / limit 10 (internal thresholds, stricter than Sonar S3776 default of 15), indent < 3 levels
- **DRY**: Abstract after 3 occurrences, single source of truth
- **YAGNI**: Only build what's explicitly required NOW
- **Early returns**: Prefer guard clauses over nested else
- **Composition**: Prefer over inheritance
