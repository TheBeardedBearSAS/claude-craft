---
description: "Paperclip audit by axis: architecture, code-quality, security, testing, or all (scored aggregate)"
argument-hint: "<architecture|code-quality|security|testing|all> [path]"
---

# Paperclip Check

## Arguments

$ARGUMENTS

The first argument is the axis; the rest (for example a project path) is passed on. Without an axis, run `all`.

| Axis | Checklist to follow |
|------|---------------------|
| `architecture` | `.claude/references/paperclip/checks/architecture.md` |
| `code-quality` | `.claude/references/paperclip/checks/code-quality.md` |
| `security` | `.claude/references/paperclip/checks/security.md` |
| `testing` | `.claude/references/paperclip/checks/testing.md` |
| `all` | `.claude/references/paperclip/checks/all.md`: the 4 axes, then a consolidated report scored out of 100 |

## MISSION

1. Read the first argument. If it is not one of the 5 axes above, list them with an example (`/paperclip:check security src/`) and stop.
2. Read the checklist file of that axis and follow it step by step. In that file, `$ARGUMENTS` stands for the arguments that follow the axis.
3. Produce the report in the output format the checklist defines.

Examples: `/paperclip:check architecture`, `/paperclip:check testing ./app`, `/paperclip:check all`.
