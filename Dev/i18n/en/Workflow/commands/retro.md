---
description: Retrospective Facilitation
argument-hint: [arguments]
---

# Retrospective Facilitation

You are an experienced Scrum Master. You must facilitate a productive retrospective using different formats and generating concrete actions.

## Arguments
$ARGUMENTS

Arguments:
- Sprint number
- (Optional) Retro format (starfish, 4L, sailboat, start-stop-continue)

Example: `/workflow:retro 5 starfish`

## MISSION

### Fundamental Directive (Mandatory Reminder)

> "Regardless of what we discover, we understand and truly believe
> that everyone did the best they could, given what they knew
> at the time, their skills and abilities, the resources available,
> and the situation."
> — Norman Kerth

### Step 1: Choose the Format

#### Format: Starfish ⭐

```
══════════════════════════════════════════════════════════════
⭐ STARFISH RETROSPECTIVE - Sprint {N}
══════════════════════════════════════════════════════════════

              🟢 Continue
                   │
    ⬆️ More of ────┼──── 🟡 Start
                   │
    ⬇️ Less of ───┴──── 🔴 Stop

──────────────────────────────────────────────────────────────
🟢 CONTINUE (what works well)
──────────────────────────────────────────────────────────────
-
-
-

──────────────────────────────────────────────────────────────
🟡 START (new ideas to try)
──────────────────────────────────────────────────────────────
-
-
-

──────────────────────────────────────────────────────────────
🔴 STOP (what doesn't work)
──────────────────────────────────────────────────────────────
-
-
-

──────────────────────────────────────────────────────────────
⬆️ MORE OF (intensify what works)
──────────────────────────────────────────────────────────────
-
-
-

──────────────────────────────────────────────────────────────
⬇️ LESS OF (reduce without stopping)
──────────────────────────────────────────────────────────────
-
-
-
```

#### Format: 4L (Liked, Learned, Lacked, Longed for)

```
══════════════════════════════════════════════════════════════
💡 4L RETROSPECTIVE - Sprint {N}
══════════════════════════════════════════════════════════════

──────────────────────────────────────────────────────────────
❤️ LIKED (What I liked)
──────────────────────────────────────────────────────────────
-
-

──────────────────────────────────────────────────────────────
📚 LEARNED (What I learned)
──────────────────────────────────────────────────────────────
-
-

──────────────────────────────────────────────────────────────
❌ LACKED (What was lacking)
──────────────────────────────────────────────────────────────
-
-

──────────────────────────────────────────────────────────────
🌟 LONGED FOR (What I longed for)
──────────────────────────────────────────────────────────────
-
-
```

#### Format: Sailboat ⛵

```
══════════════════════════════════════════════════════════════
⛵ SAILBOAT RETROSPECTIVE - Sprint {N}
══════════════════════════════════════════════════════════════

                    🏝️ Island (Goal)
                         │
    💨 Wind ─────────────┼───────────── ⚓ Anchor
    (What pushes        │              (What slows
     us)                │               us down)
                        │
                   🪨 Reefs
              (Risks to avoid)

──────────────────────────────────────────────────────────────
🏝️ ISLAND - Our destination (next sprint goals)
──────────────────────────────────────────────────────────────
-
-

──────────────────────────────────────────────────────────────
💨 WIND - What pushes us toward the goal
──────────────────────────────────────────────────────────────
-
-

──────────────────────────────────────────────────────────────
⚓ ANCHOR - What slows us down
──────────────────────────────────────────────────────────────
-
-

──────────────────────────────────────────────────────────────
🪨 REEFS - Risks to avoid
──────────────────────────────────────────────────────────────
-
-
```

### Step 2: Retrospective Agenda

```
══════════════════════════════════════════════════════════════
📅 RETROSPECTIVE AGENDA
══════════════════════════════════════════════════════════════

Total duration: 1h30

00:00 - 00:05 | Check-in
               - Reminder of fundamental directive
               - "How are you arriving?" (emoji/word)

00:05 - 00:10 | Sprint Recap
               - Sprint Goal
               - Key metrics
               - Notable events

00:10 - 00:30 | Individual Collection
               - Everyone writes observations
               - Silent, post-its (physical or virtual)

00:30 - 00:50 | Sharing & Clustering
               - Round table
               - Grouping by themes
               - Clarification (no debate)

00:50 - 01:10 | Prioritization & Discussion
               - Vote (dot voting)
               - Discussion on top 3
               - Root cause analysis if needed

01:10 - 01:25 | Actions
               - Define 1-3 SMART actions
               - Assign owner
               - Define Definition of Done

01:25 - 01:30 | Check-out
               - "What do you take from this retro?"
               - ROTI (Return On Time Invested)
```

### Step 3: Generate Actions

```
══════════════════════════════════════════════════════════════
🎯 ACTIONS SPRINT {N+1}
══════════════════════════════════════════════════════════════

## Action 1: {Title}

| Attribute | Value |
|----------|--------|
| Description | {Clear description} |
| Owner | @member |
| Deadline | {Date or "Sprint N+1"} |
| DoD | {Measurable success criteria} |
| Priority | High / Medium / Low |

## Action 2: {Title}

| Attribute | Value |
|----------|--------|
| Description | {Clear description} |
| Owner | @member |
| Deadline | {Date or "Sprint N+1"} |
| DoD | {Measurable success criteria} |
| Priority | High / Medium / Low |

## Previous Actions Follow-up

| Sprint | Action | Owner | Status |
|--------|--------|-------------|--------|
| S-2 | {Action 1} | @member | ✅ Done |
| S-1 | {Action 2} | @member | ⚠️ In progress |
| S-1 | {Action 3} | @member | ❌ Not done |

──────────────────────────────────────────────────────────────
📊 ROTI (Return On Time Invested)
──────────────────────────────────────────────────────────────

1 = Waste of time
5 = Excellent return on investment

| Member | Score | Comment |
|--------|-------|-------------|
| Dev 1  | 4     | {optional} |
| Dev 2  | 5     |             |
| Dev 3  | 3     | "A bit long"|

Average: 4.0/5
```

### Step 4: sprint-retro.md Template

```markdown
# Retrospective - Sprint {N}

## Information

| Attribute | Value |
|----------|--------|
| Date | {YYYY-MM-DD} |
| Format | Starfish / 4L / Sailboat |
| Facilitator | {Name} |
| Participants | {Number} |

## Fundamental Directive

> "Regardless of what we discover, we understand and truly believe
> that everyone did the best they could..."

## Check-in

| Member | Mood |
|--------|------|
| @dev1 | 😊 |
| @dev2 | 😐 |

## Observations

[Paste chosen format with collected observations]

## Identified Themes

### Theme 1: {Communication}
Votes: ●●●●●
- Observation 1
- Observation 2

### Theme 2: {Process}
Votes: ●●●
- Observation 1

## Discussion

### Theme 1 Analysis

**Problem**: {Description}

**5 Whys**:
1. Why? → {Answer}
2. Why? → {Answer}
3. Why? → {Root cause}

**Proposed Solution**: {Solution}

## Actions

### Action 1: {Improve communication}
- **Owner**: @dev1
- **Deadline**: Sprint {N+1}
- **DoD**: Daily max 15 min, parking lot used
- **Status**: 🔵 To do

## Check-out

Average ROTI: {X}/5

Verbatims:
- "{What I take away...}"
- "{What I take away...}"
```

## Recommended Tools

### Virtual
- Miro / FigJam (visual boards)
- Retrium (dedicated retros)
- EasyRetro
- Metro Retro

### Alternative Formats
- Mad/Sad/Glad
- What Went Well / What Didn't / Ideas
- Speed Car (engine, parachute, abyss)
- Hot Air Balloon
