# Learning Paths

Progressive learning paths to master Claude-Craft. Start with Beginner and progress at your own pace.

---

## Overview

| Level | Duration | Focus |
|-------|----------|-------|
| **Beginner** | Day 1 | Essential setup and basic workflow |
| **Intermediate** | Week 1 | Quality checks, automation, Ralph loops |
| **Advanced** | Month 1 | Agent Teams, parallel workflows, BMAD lifecycle |

---

## Beginner (Day 1)

**Goal:** Set up your first project and understand basic workflow.

### Prerequisites

```bash
claude --version  # >= 2.1.97
```

### Step 1: Installation (10 min)

```bash
# Install claude-craft for your stack
npx @the-bearded-bear/claude-craft install . --tech=react --lang=en

# Or with Makefile
make install-react TARGET=. RULES_LANG=en
```

**Alternative stacks:** `symfony`, `flutter`, `python`, `angular`, `vuejs`, `laravel`, `reactnative`, `csharp`, `php`

### Step 2: Project Configuration (5 min)

```bash
/common:init
```

Answer the interactive questions about your project:
- Project name
- Description
- Technologies
- Team size
- Git repository URL

This creates `.claude/project-context.yaml`.

### Step 3: Workflow Initialization (5 min)

```bash
/workflow:init
```

Select your workflow track:
- **Quick Flow:** Bug fixes, hotfixes (< 5 min)
- **Standard:** New features (< 15 min)
- **Enterprise:** Platform development (< 30 min)

### Step 3b: Launch the Kanban Board (2 min)

After initialising the workflow, open the local Kanban board to visualise your project:

```bash
npx @the-bearded-bear/claude-craft kanban --open
```

The board opens at `http://127.0.0.1:3737`. If your project uses the BMAD v6 workflow (`.bmad/sprint-status.yaml`), stories appear automatically with a 🔒 icon (read-only). Use the board during stand-ups and sprint reviews.

**Tip:** Leave the board open in a browser tab while working — it live-reloads on every story change.

### Step 4: First Pre-Commit Check (5 min)

```bash
/common:pre-commit-check
```

This validates:
- Tests pass
- Linting passes
- Architecture compliance
- Security checks

**Tip:** Run this before every `git commit`.

### Step 5: First Feature (15 min)

```bash
/workflow:start "Add a login button to the homepage"
```

Claude will:
1. Analyze the requirement
2. Propose a plan
3. Generate the code
4. Run tests
5. Validate quality

**Exercise:** Complete your first feature end-to-end.

---

## Intermediate (Week 1)

**Goal:** Master quality gates, automation, and continuous loops.

### Prerequisites

- Completed Beginner path
- At least 3 commits using `/common:pre-commit-check`

### Step 1: Full Audit (20 min)

```bash
/team:audit --sequential
```

This runs a comprehensive audit across 4 categories:
- Architecture (SOLID, DDD, Clean Architecture)
- Code Quality (KISS, DRY, YAGNI, cognitive complexity)
- Testing (coverage, TDD, mutation testing)
- Security (OWASP Top 10, secrets, dependencies)

**Review the report:** `docs/audit/YYYY-MM-DD/audit-report.md`

**Exercise:** Fix 3 issues flagged by the audit.

### Step 2: Ralph Wiggum - Continuous Loop (30 min)

```bash
/common:ralph-run "Implement user registration with email confirmation"
```

Ralph will:
1. Execute Claude iteratively
2. Run tests after each iteration
3. Continue until all DoD validators pass

**Configuration:** Create `ralph.yml` in project root:

```yaml
version: 1
max_iterations: 10
circuit_breaker:
  profile: moderate

dod:
  - type: command
    name: "Tests pass"
    command: "npm test"
    expect_exit_code: 0

  - type: output_contains
    name: "Task complete"
    pattern: "✅ Done"
```

**Exercise:** Run Ralph on a complex task (15+ min of work).

### Step 3: Pre-Merge Check (10 min)

Before creating a PR:

```bash
/common:pre-merge-check
```

This runs:
- All pre-commit checks
- Integration tests
- Cross-module analysis
- Breaking change detection

**Exercise:** Create a PR and validate with pre-merge check.

### Step 4: TDD Bug Fix (20 min)

```bash
/qa:tdd "Login button doesn't work when form is empty"
```

Claude will guide you through TDD:
1. 🔴 **Red:** Write failing test
2. 🟢 **Green:** Fix the bug
3. 🔵 **Refactor:** Clean up code

**Exercise:** Fix 3 bugs using TDD methodology.

### Step 5: Context Management (15 min)

Learn to manage Claude's context window:

**When to use `/clear`:**
- Between unrelated tasks
- After long investigations
- When context exceeds 50%

**Token optimization:**

```bash
/common:setup-rtk
export CLAUDE_CODE_SUBAGENT_MODEL=sonnet
```

**Exercise:** Use `/clear` strategically during a multi-task session.

---

## Advanced (Month 1)

**Goal:** Master Agent Teams, parallel workflows, and full BMAD lifecycle.

### Prerequisites

- Completed Intermediate path
- Worked on at least 2 sprints
- Project with 2+ technology stacks (for parallel teams)

### Step 1: Parallel Audit (30 min)

```bash
export CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1
/team:audit
```

This runs audits in parallel across technology stacks:

```
audit-leader (Opus)
  ├─ symfony-auditor (Sonnet)
  ├─ react-auditor (Sonnet)
  └─ python-auditor (Sonnet)
```

**Cost optimization:**

```bash
Tools/AgentTeams/lib/cost-dashboard.sh --techs 2 --worker-model sonnet
```

**Exercise:** Compare parallel vs sequential audit time and cost.

### Step 2: Parallel Sprint (60 min)

```bash
/team:sprint Sprint-3
```

This processes stories in parallel:

```
sprint-conductor (Opus)
  ├─ dev-worker-1 (Sonnet) → US-001
  ├─ dev-worker-2 (Sonnet) → US-002
  └─ dev-worker-3 (Sonnet) → US-003
```

**Constraints:**
- Stories must be `ready-for-dev`
- No blocking dependencies (`blocked_by`)
- Maximum 3 parallel workers

**Exercise:** Run a sprint with 5+ stories.

### Step 3: Full Lifecycle Delivery (90 min)

```bash
/team:delivery
```

This runs the complete sprint cycle:

**Phase 1 (Writing):**
- Writer creates EPICs, US, tasks
- Reviewer validates INVEST 6/6
- Architect validates tech feasibility

**Phase 2 (Implementation):**
- Dev workers implement stories in parallel
- File domain mapping prevents conflicts

**Exercise:** Run full lifecycle on a new epic.

### Step 4: Security Review (45 min)

```bash
/team:security
```

This runs parallel security audits:

```
security-lead (Opus)
  ├─ code-reviewer (Sonnet) → OWASP checks
  ├─ deps-auditor (Sonnet) → CVE scan
  └─ infra-reviewer (Sonnet) → Docker/secrets
```

**Exercise:** Fix 5 security findings.

### Step 5: QA Recette (60 min)

Automated acceptance testing via Chrome:

```bash
/qa:recette --scope=story --id=US-001
```

**Prerequisites:**
- Chrome extension v1.0.36+
- Claude Code with `--chrome` flag

**Golden Rule:** A fixed bug should NEVER reappear.

**Exercise:** Test an entire sprint with recette.

### Step 6: Parallel Worktrees (30 min)

Work on multiple features in parallel:

```bash
git worktree add ../feature-auth feature/add-authentication
git worktree add ../feature-payment feature/add-payment
```

Open separate Claude Code sessions for each worktree.

**Exercise:** Implement 2 features in parallel using worktrees.

### Step 7: Custom Agent Teams (Advanced)

Create a custom team template:

```bash
.claude/commands/team/my-custom-team.md
```

Follow the structure of existing templates (`team-audit`, `team-sprint`).

**Exercise:** Create a custom team for your specific workflow.

---

## Mastery Checklist

### Beginner

- [ ] Installed claude-craft
- [ ] Configured project context
- [ ] Initialized workflow
- [ ] Run pre-commit check before every commit
- [ ] Completed first feature end-to-end

### Intermediate

- [ ] Run full audit and fixed 3+ issues
- [ ] Used Ralph for a complex task (15+ min)
- [ ] Pre-merge check before every PR
- [ ] Fixed 3+ bugs using TDD
- [ ] Optimized token usage with RTK

### Advanced

- [ ] Run parallel audit (2+ tech stacks)
- [ ] Run parallel sprint (5+ stories)
- [ ] Run full lifecycle delivery
- [ ] Run security review and fixed 5+ findings
- [ ] Used QA recette for acceptance testing
- [ ] Used parallel worktrees for concurrent features
- [ ] Created custom agent team template

---

## Common Pitfalls

### Beginner

| Pitfall | Solution |
|---------|----------|
| Skipping `/common:init` | Always configure project context first |
| Not using pre-commit check | Automate with git hook |
| Overloading context | Use `/clear` between tasks |

### Intermediate

| Pitfall | Solution |
|---------|----------|
| Running full audit too often | Use lightweight checks daily, full audit weekly |
| Not configuring Ralph DoD | Create `ralph.yml` with appropriate validators |
| Ignoring token costs | Use `/common:setup-rtk` and `SUBAGENT_MODEL=sonnet` |

### Advanced

| Pitfall | Solution |
|---------|----------|
| Using parallel teams for 1 tech stack | Use `--sequential` instead |
| Not checking cost before parallel ops | Use `cost-dashboard.sh` |
| Creating too many custom teams | Start with 4 provided templates |

---

## Next Steps

After completing all paths:

1. **Contribute:** Submit PRs to improve templates, skills, or documentation
2. **Add Technology:** Use `/common:add-technology` to add your stack
3. **Train Team:** Onboard team members using this learning path
4. **Customize:** Create custom skills, agents, and workflows
5. **Optimize:** Fine-tune Ralph DoD, agent team sizes, and quality gates

---

## See Also

- [CHEAT-SHEET.md](CHEAT-SHEET.md) - Quick command reference
- [QUICKSTART.md](QUICKSTART.md) - 5-minute getting started
- [RALPH-GUIDE.md](RALPH-GUIDE.md) - Ralph Wiggum deep dive
- [AGENT-TEAMS-GUIDE.md](AGENT-TEAMS-GUIDE.md) - Agent Teams deep dive
- [BMAD-PRACTICAL-GUIDE.md](BMAD-PRACTICAL-GUIDE.md) - BMAD workflow guide
