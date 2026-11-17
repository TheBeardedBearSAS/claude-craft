# Complete Workflow Tutorial: From Idea to Production

> **Who is this for?** Someone who has **never** used Claude Code or Bear Craft. We start from zero, build a real feature end to end, and explain every term the first time it appears.
>
> **What we build:** *TaskFlow* — a small team task-tracking SaaS with a REST API (Python / FastAPI) and a React web client. It is simple enough to follow in one sitting, real enough to exercise the whole workflow.
>
> **Bear Craft v8.19.2** · Estimated reading + doing time: 60–90 minutes.

---

## 0. Before you start

### What you will do

You will take TaskFlow from a one-sentence idea to a reviewed, tested first sprint — using Bear Craft's BMAD workflow. The path always flows in one direction, and **every arrow is protected by a quality gate** (a blocking check):

```
 IDEA
   │  /bear-workflow:init        ← pick the track
   ▼
 BACKLOG ──/bear-gate:check backlog──┐  (PRD ≥ 80%, INVEST 6/6)
   │  /bear-workflow:plan            │
   ▼                            │
 TECH DESIGN ──/bear-gate:check spec──┐  (Tech Spec ≥ 90%)
   │  /bear-workflow:design           │
   ▼                             │
 SPRINT PLAN ──/bear-gate:check sprint──┐  (Sprint Ready 100%)
   │  /bear-workflow:start              │
   ▼                               │
 IMPLEMENTATION (TDD) ──/bear-gate:check story──┐  (Story DoD 100%)
   │  /bear-workflow:implement                   │
   ▼                                       │
 REVIEW + RETRO ──/bear-workflow:review, /bear-workflow:retro
                                           │
   ▼
 NEXT SPRINT ↺
```

> **Golden rule of the method:** you do not move to the next step until its gate passes. This is what stops you from building on shaky foundations.

---

## 1. The basics in 5 minutes

Read this once. You will come back to it.

- **Claude Code** — the CLI where you talk to Claude in your terminal (or IDE). You type messages and *slash-commands*; Claude reads/writes files, runs commands, and answers.
- **Slash-command** — a packaged instruction starting with `/`. Example: `/bear-workflow:init`. Bear Craft ships 125 of them across 15 namespaces.
- **Agent** — a specialized Claude persona you summon with `@`. Example: `@tdd-coach`, `@symfony-reviewer`. Each has focused expertise.
- **Bear Craft** — the framework you installed: rules, commands, agents, skills, and the **BMAD** project-management layer.
- **BMAD** — Bear Craft's lightweight SCRUM-style method (Backlog → sprint → review). It writes its state to **files**, not to the conversation — which is why clearing the chat later is safe.

### Mini-glossary

| Term | Plain meaning |
|------|---------------|
| **Epic** | A large chunk of value, split into stories. |
| **User Story (US)** | A small, user-visible increment ("As a user, I can…"). |
| **Backlog** | The ordered list of epics and stories. |
| **Sprint** | A short batch of stories you commit to finishing. |
| **Task** | A story split into ≤ 30-min steps a dev (or agent) executes. |
| **Gate** | A blocking quality check between phases. |
| **DoD** | Definition of Done — the checklist a story must pass. |
| **INVEST** | The 6 qualities of a good story (Independent, Negotiable, Valuable, Estimable, Small, Testable). |
| **TDD** | Test-Driven Development: write a failing test → make it pass → refactor. |

---

## 1.5 Understanding execution modes (read this — it trips up everyone)

There are **two different things called "mode"**. Do not confuse them.

**(a) The three interaction modes** (toggle with `Shift+Tab` in Claude Code):

| Mode | Indicator | What it does |
|------|-----------|--------------|
| **Plan** | 📋 | Claude proposes a plan and edits **nothing** until you approve. |
| **Normal** | ⚡ | Claude acts, but asks permission before risky actions. **Default for this tutorial.** |
| **Auto-accept** | 🤖 | Claude executes without asking. Powerful, but only once you trust the flow. |

**(b) The "plan mode" some commands turn on by themselves.** Several Bear Craft commands (`/bear-workflow:design`, `/bear-workflow:plan`…) deliberately enter a planning step and wait for your "go" before writing files — independent of which Shift-Tab mode you are in.

> **Simple rule for beginners:** stay in **Normal (⚡)**, let commands trigger their own planning step, and approve the plans. Use auto-accept and `--auto` flags only once the flow feels familiar.

Throughout this tutorial, every command shows the mode it expects:
- **Mode: Normal (⚡)** — interactive
- **Mode: Plan required** — Claude will plan first
- **Mode: Read-only** — safe in any mode

---

## 2. Verify your install

**Mode: Read-only.** Open Claude Code in your project folder and confirm Bear Craft is present.

```bash
# In your terminal, inside the project
claude
```

Then, inside Claude Code:

```
/bear-workflow:status
```

If you see a workflow status report (even "no workflow yet"), Bear Craft is installed. If the command is unknown, (re)install:

```bash
npx @the-bearded-bear/bear-craft install . --tech=python --lang=en
```

> **About the Project Management layer.** The `/bear-gate:*` and `/bear-project:*` commands used below come from the **Project Management commands** option, included by default during install (the installer asks *"Include Project Management commands? (Y/n)"* → Yes). If those commands are missing, re-run the installer and accept that option.

### 2.x Saving tokens: context and `/clear`

The **context window** is Claude's working memory — and your most precious resource. Two habits keep it healthy:

- **`/clear`** between unrelated steps. Because BMAD writes its state to files, **nothing is lost**: after `/clear`, run `/bear-workflow:status` and Claude re-reads where you are.
- **RTK + hooks** for token optimization. Run `/bear-common:setup-rtk` once to configure the Rust Token Killer proxy and the optimization hooks (60–90% savings on dev-command output).

You will see **"Good time to `/clear`"** markers between the lettered steps below.

---

## Step A — Build the backlog

### A.1 Initialize the workflow

**Mode: Plan required.**

```
/bear-workflow:init
```

Claude analyzes your project and recommends a **track**:

| Track | Setup | Phases | Best for |
|-------|-------|--------|----------|
| **Quick Flow** | < 5 min | Implement only | Bug fixes, hotfixes |
| **Standard** | < 15 min | Plan → Design → Implement | New features (← TaskFlow uses this) |
| **Enterprise** | < 30 min | Analyze → Plan → Design → Implement | Platforms |

Pick **Standard** for TaskFlow.

### A.2 Generate the PRD and backlog

**Mode: Plan required.**

```
/bear-workflow:plan
```

Claude interviews you about TaskFlow, then drafts a **PRD** (Product Requirements Document), personas, and an initial **backlog** of epics and stories under `project-management/`. Answer concretely, e.g.:

> *"TaskFlow lets a small team create projects, add tasks, assign them, and mark them done. MVP = REST API + web list/board view. No mobile yet."*

> **What to expect:** files such as `project-management/prd.md` and `project-management/backlog/` with epics like `EPIC-001 Projects`, `EPIC-002 Tasks`, and stories like `US-001 Create a project`.

### A.3 Validate the backlog

**Mode: Read-only.**

```
/bear-gate:check backlog
```

This gate checks the backlog against **INVEST (6/6)** and PRD coverage (**≥ 80%**). If it fails, it tells you exactly which stories are too big, untestable, or unestimable. Fix them (re-run `/bear-workflow:plan` or edit the stories) until the gate is green.

> **Good time to `/clear`.** Then `/bear-workflow:status` to resume.

---

## Step B — Design, then create the sprint

### B.1 Design the technical solution

**Mode: Plan required.**

```
/bear-workflow:design
```

Claude (acting as architect) produces a **Tech Spec**: architecture choices, data model, API contract, and the libraries to use — grounded in your stack's Bear Craft references (Clean Architecture, FastAPI patterns, etc.).

### B.2 Validate the tech spec

**Mode: Read-only.**

```
/bear-gate:check spec
```

Gate threshold: **Tech Spec ≥ 90%**. It flags missing error handling, undefined contracts, or untestable designs.

### B.3 Plan the first sprint

**Mode: Plan required.**

```
/bear-workflow:start
```

Claude proposes a **sprint goal** and selects the top backlog stories that fit. For TaskFlow, a sensible first sprint is a **walking skeleton**: project + task creation through the API, surfaced in the web list.

### B.4 Decompose stories into tasks

**Mode: Plan required.**

```
/bear-workflow:start
```

Each story is split into ≤ 30-minute, independently testable **tasks** (write the model, write the endpoint, write the test, wire the UI…). This is what makes TDD and `/bear-workflow:implement` flow smoothly.

### B.5 Validate the sprint

**Mode: Read-only.**

```
/bear-gate:check sprint
```

Gate threshold: **Sprint Ready 100%** — every story estimated, every task defined, dependencies ordered. Green means you can start coding.

> **Good time to `/clear`.**

---

## Step C — Implement the sprint with TDD

### C.1 The recommended path for beginners

**Mode: Normal (⚡).**

```
/bear-workflow:implement
```

`/bear-workflow:implement` walks the sprint **task by task**, coaching you through the **Red → Green → Refactor** TDD cycle:

1. **Red** — write a failing test that pins the expected behavior.
2. **Green** — write the minimum code to pass it.
3. **Refactor** — clean up, tests stay green.

For each story it also runs a code review and checks the **Story DoD (100%)** before moving on.

> **TDD is non-negotiable.** A test written *before* the code is what lets the agent write code you can trust. Bug fixes get a regression test first (it must fail before your fix, pass after).

### C.2 Alternatives (optional)

- `/bear-workflow:implement --auto` — runs the whole sprint more autonomously.
- `/bear-workflow:implement --parallel 3` (`/bear-team:delivery --phase=implementation`) — implements multiple stories **in parallel** using Agent Teams (advanced).
- `@tdd-coach` — summon the coach mid-task for guidance.

Stick with `/bear-workflow:implement` for your first run.

### C.3 Drive it day to day

- `/bear-project:backlog next story --claim` — grab the next story.
- `/bear-project:backlog move story US-001 in-progress` — move a story across the board.
- `/bear-qa:tdd` — fix a bug in strict TDD/BDD mode.

> **Docker reminder.** Run tests and commands through Docker so results don't depend on your local machine, e.g. `docker compose exec app pytest`.

---

## Step D — Track progress with the Kanban board

### D.1 Launch the board

**Mode: Read-only.**

```
/bear-workflow:status --board
```

This opens a local **Kanban board** (no SaaS, no lock-in) reading the BMAD state files. Columns follow the status routing:

```
backlog → ready-for-dev → in-progress → review → done   (any → blocked)
```

Companion views: `/bear-project:report burndown` (sprint burndown), `/bear-project:report deps`, `/bear-project:report deps --critical`, `/bear-project:report metrics`.

The board is also a management tool: from the same Kanban (`npx @the-bearded-bear/bear-craft kanban`) you can create and edit stories, plan the backlog into a sprint, and create, start and close sprints. The `/bear-workflow:*` and `/bear-project:*` commands remain valid and write the same file, `.bmad/sprint-status.yaml`. See the [CLI reference](../../CLI-REFERENCE.md#kanban-command).

### D.2 Why a card may refuse to move

The board enforces the same gates. A story won't enter **done** until its DoD passes — that's the method protecting you, not a bug.

> **Good time to `/clear`.**

---

## Step E — Close the sprint and loop

### E.1 Sprint review

**Mode: Normal (⚡).**

```
/bear-workflow:review
```

Summarizes what shipped against the sprint goal, with a demo checklist.

### E.2 Retrospective

```
/bear-workflow:retro
```

Captures what went well / what to improve. Persist durable learnings with `/memory` so they survive future `/clear`s.

### E.3 Loop

Run `/bear-workflow:start` again to plan sprint 2 from the remaining backlog. The cycle repeats: plan → design → implement → review.

---

## Cheat sheet

### Commands, in order

```bash
# Step A — Backlog
/bear-workflow:init                 # pick the track
/bear-workflow:plan                 # PRD + backlog
/bear-gate:check backlog            # INVEST 6/6, PRD ≥ 80%

# Step B — Design + sprint
/bear-workflow:design               # tech spec
/bear-gate:check spec               # Tech Spec ≥ 90%
/bear-workflow:start                # plan the sprint
/bear-workflow:start       # stories → tasks
/bear-gate:check sprint             # Sprint Ready 100%

# Step C — Implement (TDD)
/bear-workflow:implement                    # task-by-task Red/Green/Refactor
/bear-gate:check story US-001       # Story DoD 100%

# Step D — Track
/bear-workflow:status --board                 # Kanban
/bear-project:report burndown       # burndown

# Step E — Close + loop
/bear-workflow:review
/bear-workflow:retro
```

### When to `/clear`

After each lettered step (A→B→C→D→E). State lives in files; `/bear-workflow:status` re-reads it.

### Where files live

| What | Where |
|------|-------|
| PRD, personas | `project-management/prd.md` |
| Backlog (epics/stories) | `project-management/backlog/` |
| Sprints, tasks | `project-management/sprints/` |
| BMAD status | `project-management/.bmad/` / `sprint-status.yaml` |

### Gate thresholds

| Gate | Threshold |
|------|-----------|
| PRD | ≥ 80% |
| Tech Spec | ≥ 90% |
| INVEST | 6/6 |
| Sprint Ready | 100% |
| Story DoD | 100% |
| Spec Alignment | ≥ 85% |

### Common problems

| Symptom | Fix |
|---------|-----|
| `/bear-gate:*` / `/bear-project:*` unknown | Re-install and accept *Project Management commands*. |
| `/bmad:init` not found | It doesn't exist — use `/bear-workflow:init`. |
| Gate keeps failing | Read its report; it names the exact failing item. |
| Card won't reach **done** | Its DoD isn't met yet — that's intended. |
| Lost after `/clear` | Run `/bear-workflow:status`. |
| Context > 60% | `/clear`, then `/bear-workflow:status`. |

---

## Automating with Ralph (optional)

Once comfortable, automate a story end to end with the continuous loop:

```
/bear-common:ralph-run "Implement US-001 with full DoD validation"
```

Ralph keeps Claude working until the Definition of Done validators pass. See [RALPH-GUIDE.md](../../RALPH-GUIDE.md).

---

## Appendix — A real-world multi-stack scenario

TaskFlow is single-stack on purpose. Real products are messier — and the **same** workflow scales to them. As a richer example, consider a Wrandly-style app (anonymized version shipped as a test fixture under `tests/fixtures/wrandly-anon/`):

- **Two clients:** a web PWA (Symfony + React) **and** a Flutter mobile app, plus a custom REST API.
- **A design handoff already exists** before development starts (a "Claude Design" package): source documents, 5 locked architecture decisions, and a phased plan (Epics 0 → 7).

How it maps to this tutorial:

| Design artifact | Feeds into |
|-----------------|-----------|
| Source documents | `/bear-workflow:plan` (input for the PRD + backlog) |
| Locked architecture decisions | `/bear-workflow:design` (formalized in the Tech Spec) |
| Phases 0 → 7 | The epics → sprints split |

Two adjustments for multi-stack:

1. **Start with the foundation epic** (Epic 0): monorepo, shared design tokens, the OpenAPI contract, and a map style **before** any UI component — a true *walking skeleton*.
2. **Run web and mobile sprints in parallel** with `/bear-team:delivery --phase=implementation` (Agent Teams), each respecting its own stack's gates.

Everything else — gates, TDD, the Kanban board, `/clear` discipline — is identical. The method does not change with scale; only the number of parallel tracks does.

---

## Next steps

- [Feature Development](03-feature-development.md) — go deeper on the TDD loop and agents.
- [Backlog Management](07-backlog-management.md) — master epics, stories, and the 15+ project commands.
- [BMAD Practical Guide](../../BMAD-PRACTICAL-GUIDE.md) — the full command reference for the method.
- [Autonomous Sprint](../AUTONOMOUS-SPRINT.md) — let an agent pipeline run the whole sprint.
- [Learning Paths](../../LEARNING-PATHS.md) — Beginner → Intermediate → Advanced progression.
