---
description: "PHP audit by axis: architecture, code-quality, security, testing, or all (scored aggregate)"
argument-hint: "<architecture|code-quality|security|testing|all> [path]"
---

# PHP Check

## Arguments

$ARGUMENTS

The first argument is the axis; the rest (for example a project path) is passed on. Without an axis, run `all`.

| Axis | Checklist to follow |
|------|---------------------|
| `architecture` | `.claude/references/php/checks/architecture.md` |
| `code-quality` | `.claude/references/php/checks/code-quality.md` |
| `security` | `.claude/references/php/checks/security.md` |
| `testing` | `.claude/references/php/checks/testing.md` |
| `all` | `.claude/references/php/checks/all.md`: the 4 axes, then a consolidated report scored out of 100 |

## MISSION

1. Read the first argument. If it is not one of the 5 axes above, list them with an example (`/php:check security src/`) and stop.
2. Read the checklist file of that axis and follow it step by step. In that file, `$ARGUMENTS` stands for the arguments that follow the axis.
3. Produce the report in the output format the checklist defines.

Examples: `/php:check architecture`, `/php:check testing ./app`, `/php:check all`.
