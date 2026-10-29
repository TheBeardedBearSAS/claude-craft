---
description: "Flutter audit by axis: architecture, code-quality, security, testing, or all (scored aggregate)"
argument-hint: "<architecture|code-quality|security|testing|all> [path]"
---

# Flutter Check

## Arguments

$ARGUMENTS

The first argument is the axis; the rest (for example a project path) is passed on. Without an axis, run `all`.

| Axis | Checklist to follow |
|------|---------------------|
| `architecture` | `.claude/references/flutter/checks/architecture.md` |
| `code-quality` | `.claude/references/flutter/checks/code-quality.md` |
| `security` | `.claude/references/flutter/checks/security.md` |
| `testing` | `.claude/references/flutter/checks/testing.md` |
| `all` | `.claude/references/flutter/checks/all.md`: the 4 axes, then a consolidated report scored out of 100 |

## MISSION

1. Read the first argument. If it is not one of the 5 axes above, list them with an example (`/flutter:check security src/`) and stop.
2. Read the checklist file of that axis and follow it step by step. In that file, `$ARGUMENTS` stands for the arguments that follow the axis.
3. Produce the report in the output format the checklist defines.

Examples: `/flutter:check architecture`, `/flutter:check testing ./app`, `/flutter:check all`.
