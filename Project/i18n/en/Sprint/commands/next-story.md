---
description: Get next story ready for development
argument-hint: [--claim]
---

# Sprint Next Story

Find and optionally claim the next story ready for development from the sprint.

## Arguments

$ARGUMENTS (format: [--claim])
- **--claim** (optional): Automatically transition story to in-progress

## Process

### Step 1: Load sprint status

1. Read `.bmad/sprint-status.yaml`
2. Get all stories with status `ready-for-dev`
3. Sort by priority (if defined) or by ID

### Step 2: Check prerequisites

For each ready story, verify:
- [ ] No blocking dependencies
- [ ] Story points estimated
- [ ] Tasks decomposed
- [ ] Acceptance criteria defined
5. Verify `Depends on` stories are all in status `done` or `review`
6. If dependencies are unresolved, show which stories are blocking

### Step 3: Select next story

Priority order:
1. Stories with all dependencies resolved
2. Stories with no blocking dependencies
3. Lower story ID (earlier in backlog)
4. Lower story points (simpler first)

### Step 4: Display story details

Show comprehensive story information:
- ID and title
- Story points
- Epic association
- Acceptance criteria summary
- Task list overview
- Any notes or context

### Step 5: Claim story (if --claim)

If `--claim` flag is set:
1. Transition story to `in-progress`
2. Set `tdd_phase` to `red`
3. Set `current_task` to first task
4. Record transition in history

### Step 6: Provide guidance

Show next steps:
- First task to work on
- TDD workflow reminder
- Related commands

## Output Format

```
═══════════════════════════════════════════════════════
              Next Story Ready for Dev
═══════════════════════════════════════════════════════

📖 US-012: Implement user profile page
   Epic: EPIC-003 (User Management)
   Points: 5
   Priority: High

Description:
──────────────────────────────────────────────────────
As a registered user
I want to view and edit my profile
So that I can keep my information up to date

Acceptance Criteria (3):
──────────────────────────────────────────────────────
□ AC1: User can view their profile information
□ AC2: User can edit their name and email
□ AC3: Changes are validated before saving

Tasks (4):
──────────────────────────────────────────────────────
□ TASK-031 [BE] Create profile API endpoint
□ TASK-032 [BE] Add profile validation
□ TASK-033 [FE] Create profile component
□ TASK-034 [FE] Add form validation

Prerequisites:
──────────────────────────────────────────────────────
✅ No blocking dependencies
✅ Story points estimated
✅ Tasks decomposed
✅ Acceptance criteria defined

Dependencies:
──────────────────────────────────────────────────────
✅ US-001 (Login Page) — done
✅ US-002 (JWT Tokens) — done

To start working:
──────────────────────────────────────────────────────
/sprint:transition US-012 in-progress

Or use: /sprint:next-story --claim
═══════════════════════════════════════════════════════
```

### No Stories Available

```
═══════════════════════════════════════════════════════
              No Stories Ready for Dev
═══════════════════════════════════════════════════════

📋 Backlog status:
   - 3 stories in backlog (need refinement)
   - 2 stories in progress
   - 1 story blocked

Suggestions:
──────────────────────────────────────────────────────
1. Refine backlog stories: /project:update-stories
2. Help with in-progress stories
3. Unblock US-003: waiting for API credentials
4. View dependency graph: /project:dependencies

Commands:
  /sprint:status --bmad  View full sprint status
  /gate:validate-backlog Check story readiness
═══════════════════════════════════════════════════════
```

## Example

```
/sprint:next-story
/sprint:next-story --claim
```

## TDD Workflow

After claiming a story:
1. 🔴 RED: Write a failing test for first AC/task
2. 🟢 GREEN: Implement minimum code to pass
3. 🔵 REFACTOR: Clean up while keeping tests green
4. Repeat for each task

Use `/sprint:tdd-cycle` to track phase transitions.
