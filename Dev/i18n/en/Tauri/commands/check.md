---
description: "Tauri v2 audit by axis: architecture, code-quality, security, testing, or all (scored aggregate)"
argument-hint: "<architecture|code-quality|security|testing|all> [path]"
---

# Tauri Check

## Arguments

$ARGUMENTS

The first argument is the axis; the rest (for example a project path) is passed on. Without an axis, run `all`.

| Axis | Checklist to follow |
|------|---------------------|
| `architecture` | `.claude/references/tauri/checks/architecture.md` |
| `code-quality` | `.claude/references/tauri/checks/code-quality.md` |
| `security` | `.claude/references/tauri/checks/security.md` |
| `testing` | `.claude/references/tauri/checks/testing.md` |
| `all` | `.claude/references/tauri/checks/all.md`: the 4 axes, then a consolidated report scored out of 100 |

## MISSION

1. Read the first argument. If it is not one of the 5 axes above, list them with an example (`/tauri:check security src-tauri`) and stop.
2. Read the checklist file of that axis and follow it step by step. In that file, `$ARGUMENTS` stands for the arguments that follow the axis.
3. Produce the report in the output format the checklist defines.

Examples: `/tauri:check architecture`, `/tauri:check testing ./src-tauri`, `/tauri:check all`.
