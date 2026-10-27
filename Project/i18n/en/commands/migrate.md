---
description: "One-shot migration of an existing backlog to BMAD v6 (analyze, migrate, fill stories, resync)"
argument-hint: "[--analyze|--dry-run|--resync|--stories] [--force]"
---

# Migrate Backlog

One-shot migration of an existing backlog to the BMAD v6 layout, with `.bmad/sprint-status.yaml` as the single source of truth for story and task status (schema: `.claude/templates/project/sprint-status.md`). One command covers four modes: analysis, migration, filling missing story fields, and content resync.

## Usage

| Invocation | What it does | Replaces |
|------------|--------------|----------|
| `/project:migrate --analyze` | Report only: structure, INVEST scores, BMAD v6 gaps. Writes nothing | `analyze-backlog` |
| `/project:migrate` | Default: migrate the backlog and create `.bmad/sprint-status.yaml` | `migrate-backlog` |
| `/project:migrate --stories [story-id]` | Fill missing story fields (tasks, AC, history, INVEST) | `update-stories` |
| `/project:migrate --resync` | Reconcile content and IDs between markdown and the YAML | `sync-backlog` |
| `--dry-run` | Preview only, applies to every mode | - |
| `--force` | Overwrite existing BMAD files (migration mode) | - |

## Arguments

$ARGUMENTS (format: [--analyze|--dry-run|--resync|--stories] [--force])
- **--analyze**: analysis mode (read-only)
- **--stories**: optional `story-id` (e.g. US-001); if omitted, all stories are processed
- **--resync**: reconciliation mode
- **--dry-run**: show what would change, write nothing
- **--force**: overwrite an existing `sprint-status.yaml` and BMAD files
- Modes are mutually exclusive; with none of them, the default migration runs.

## Shared rules

- **Backlog location**, searched in order: `project-management/backlog/` (standard), `docs/backlog/`, `backlog/`, `.bmad/` (already migrated).
- **Single source of truth**: status lives only in `.bmad/sprint-status.yaml`. Markdown holds content only (title, description, AC, points, parents).
- **Legacy statuses**: the initial migration is the ONLY moment legacy markdown statuses/emojis are read; they are moved into the YAML and then stripped from the markdown. `--resync` and `--stories` never copy a status from markdown.
- **Plan mode is mandatory** for the default migration, `--stories` and `--resync` (unless `--dry-run`): Claude analyzes the impact, proposes a plan and waits for validation before changing anything.
- **Order**: `--analyze` first, then the migration, then `--stories`; use `--resync` afterwards when content drifts.

## --analyze

Report only, no file is modified.

1. **Detect** the backlog location (see shared rules).
2. **Identify** epics (`EPIC-*.md`, `epic*.md`), user stories (`US-*.md`, `story*.md`), tasks (`TASK-*.md` or embedded in stories) and index files (`index.md`, `backlog.md`, `README.md`).
3. **Parse** per file: ID, title, legacy status (🔴 To Do, 🟡 In Progress, 🟢 Done, ⏸️ Blocked), sprint, story points, parents (US → EPIC, TASK → US), AC count, task count and completion.
4. **INVEST score** per story (0-6): Independent (no blocking dependency), Negotiable (has a description), Valuable (benefit stated), Estimable (has points), Small (≤ 8 points), Testable (has AC).
5. **BMAD v6 gaps**: TDD phase tracking, task list with completion, status history, sprint assignment, AC validation status.
6. **Report**: summary (counts), structure (tree), INVEST table, migration gaps table (field / % stories missing / action), recommendations.

```
📊 Backlog Analysis Report
Location: project-management/backlog/ | Epics: {N} | Stories: {N} | Tasks: {N}

| Story | Title  | INVEST | Missing   |
|-------|--------|--------|-----------|
| US-001 | Login | 5/6    | Estimable |

Migration gaps: tdd_phase 100% | tasks.list 60% | history 100%
Next: /project:migrate
```

## Default: migration

1. **Validate**: create `.bmad/` if needed; warn if `sprint-status.yaml` exists and no `--force`; the analysis should have been run.
2. **Create the structure**: `.bmad/sprint-status.yaml`, `batch-queue.yaml`, `gates/`, `hooks/`, `lib/`.
3. **Parse** each story: metadata, AC (Gherkin), related tasks, legacy status, completion.
4. **Map legacy statuses** into the YAML:

   | Original | BMAD v6 status |
   |----------|----------------|
   | 🔴 To Do | backlog |
   | 🟡 In Progress | in-progress |
   | 🟢 Done | done |
   | ⏸️ Blocked | blocked |
   | Sprint-X assigned | ready-for-dev |

5. **Initial TDD phase**: 0% tasks done → `red`; 1-99% → `green`; 100% → `refactor` or `done`.
6. **Generate `sprint-status.yaml`**, one entry per story:

   ```yaml
   stories:
     US-001:
       title: "User login"
       status: "in-progress"
       previous_status: "ready-for-dev"
       tdd_phase: "red"
       current_task: "TASK-001"
       story_points: 5
       epic_id: "EPIC-001"
       tasks:
         total: 4
         completed: 2
         list:
           - { id: "TASK-001", title: "Backend auth endpoint", status: "in-progress", type: "BE" }
       acceptance_criteria: { total: 3, validated: 1 }
       history:
         - { timestamp: "2026-01-29T10:00:00Z", from: "backlog", to: "in-progress", by: "migration", reason: "BMAD v6 migration" }
   ```

7. **Backup** (unless `--dry-run`): copy the backlog to `.bmad/backup/` (timestamped) and log its location.
8. **Apply** (unless `--dry-run`): write the YAML, strip status emojis/fields from the markdown files, create `.bmad/migration-log.md`.

Dry run: lists the files that would be created (e.g. `.bmad/sprint-status.yaml`), the counts of stories/tasks/AC that would be migrated, and ends with "Run without --dry-run to apply changes."

Rollback: `tar -xzf .bmad/backup/backlog-*.tar.gz -C project-management/ && rm .bmad/sprint-status.yaml`.

Next steps: review the YAML, run `/workflow:status`, set sprint metadata (dates, goals), check quality gates with `/gate:check all`.

## --stories

Fill missing BMAD v6 fields of existing stories (all, or one `story-id`).

1. **Load** `.bmad/sprint-status.yaml` and the story files; compare.
2. **Missing fields** and defaults:

   | Field | Required | Default if missing |
   |-------|----------|--------------------|
   | tdd_phase | Yes | "red" if in-progress, "" otherwise |
   | tasks.list / total / completed | Yes | Extract from `## Tasks`, count, count done |
   | current_task | No | First in-progress task |
   | history | Yes | Initial entry with the current status (`by: "migrate"`) |
   | acceptance_criteria.total / validated | Yes | Count from the AC section / 0 |
   | story_points | Yes | Ask the user if missing |
   | epic_id | No | Extract from the file |

3. **Parse tasks** from the story's `## Tasks` table and **AC** from the Gherkin `### ACn:` blocks into `tasks.list` and `acceptance_criteria.list` (ids, titles). Task and AC statuses go to the YAML only for entries not yet tracked there; an existing YAML status is never overwritten by markdown.
4. **INVEST**: add `invest_score` (independent, negotiable, valuable, estimable, small, testable, total).
5. **Update** `sprint-status.yaml` by merging the fields; optionally add a metadata comment to story files (`<!-- BMAD v6 Metadata … -->` with `tdd_phase`, `invest_score`, `last_sync`).

Output: table of updated stories (fields added, INVEST score), summary per field (added / skipped), warnings (e.g. "US-003: missing story points", "US-007: no acceptance criteria"), modified files. Then fix the warnings, run `/project:migrate --resync` and `/gate:check backlog`.

## --resync

Reconcile content and IDs between the markdown files and the YAML. Status is never synchronized: the YAML wins.

1. **Load** both sources and build a comparison map by story ID.
2. **Detect differences** in content: missing stories, titles, story points, task lists, AC, assignment.
3. **Resolve**: the YAML is authoritative for status, TDD phase, history and task state; markdown is authoritative for titles, descriptions, AC text and points. Ask the user when both changed the same content field.
4. **Files → YAML**: add stories found only in files; update titles, points, task and AC lists.
5. **YAML → files**: refresh the metadata comment (TDD phase, history, INVEST score, sync timestamp); never write a status into markdown.
6. **Orphans**: in YAML but not in files → mark `archived` or warn; in files but not in YAML → add to the YAML (status `backlog`).
7. **Timestamps**: `last_sync` in the YAML and `<!-- last_sync: … -->` in story files.

Output: changes files → YAML, changes YAML → files, conflicts resolved, orphans (archived / added), "Last sync" time. Then review `git diff` and run `/workflow:status`.

Automation: a pre-commit hook may run `/project:migrate --resync` (`.bmad/hooks/pre-commit.sh`).

## Examples

```
/project:migrate --analyze
/project:migrate --dry-run
/project:migrate
/project:migrate --force
/project:migrate --stories US-001
/project:migrate --stories --dry-run
/project:migrate --resync --dry-run
```
