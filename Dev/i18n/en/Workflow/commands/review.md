---
description: "Sprint Review Preparation"
argument-hint: [arguments]
---

# Sprint Review Preparation

You are an experienced Scrum Master. You must prepare and facilitate the Sprint Review by gathering information about accomplished work.

## Arguments
$ARGUMENTS

Arguments:
- Sprint number

Example: `/workflow:review 5`

## MISSION

### Step 1: Collect Sprint Data

```bash
# Retrieve sprint commits
git log --since="YYYY-MM-DD" --until="YYYY-MM-DD" --oneline

# Merged PRs
gh pr list --state merged --search "merged:YYYY-MM-DD..YYYY-MM-DD"

# Closed issues
gh issue list --state closed --search "closed:YYYY-MM-DD..YYYY-MM-DD"
```

### Step 2: Analyze Sprint Backlog

```
══════════════════════════════════════════════════════════════
📊 SPRINT REVIEW - Sprint {N}
══════════════════════════════════════════════════════════════

Date: {YYYY-MM-DD}
Sprint Goal: "{Goal}"

──────────────────────────────────────────────────────────────
🎯 SPRINT GOAL ACHIEVEMENT
──────────────────────────────────────────────────────────────

Sprint Goal achieved: ✅ YES / ❌ NO / ⚠️ PARTIALLY

Justification: {Explanation}

──────────────────────────────────────────────────────────────
📦 DELIVERED USER STORIES
──────────────────────────────────────────────────────────────

| ID | Title | Points | Demo | Status |
|----|-------|--------|------|--------|
| US-045 | User registration | 5 | ✅ | ✅ Delivered |
| US-046 | Google OAuth login | 8 | ✅ | ✅ Delivered |
| US-047 | GitHub OAuth login | 5 | ✅ | ✅ Delivered |
| US-048 | Password reset | 3 | ⏳ | ⚠️ 80% |

**Delivered: 18/21 points (86%)**

──────────────────────────────────────────────────────────────
❌ UNFINISHED USER STORIES
──────────────────────────────────────────────────────────────

| ID | Title | Points | Progress | Reason |
|----|-------|--------|------------|--------|
| US-048 | Password reset | 3 | 80% | Email API unavailable |

Action: Carry over to Sprint {N+1}

──────────────────────────────────────────────────────────────
📈 METRICS
──────────────────────────────────────────────────────────────

| Metric | Value | Trend |
|----------|--------|----------|
| Planned points | 21 | - |
| Delivered points | 18 | - |
| Velocity | 18 | ↗️ (+2 vs S-1) |
| Completion rate | 86% | ↗️ |
| Bugs discovered | 2 | ↘️ |
| Bugs fixed | 3 | ↗️ |

──────────────────────────────────────────────────────────────
🎬 DEMONSTRATION
──────────────────────────────────────────────────────────────

## Suggested demo order

1. **US-045: User registration** (~5 min)
   - Show registration form
   - Confirmation email
   - Account activation
   - Demo by: @dev1

2. **US-046: Google OAuth login** (~5 min)
   - "Sign in with Google" button
   - OAuth flow
   - Automatic account creation
   - Demo by: @dev2

3. **US-047: GitHub OAuth login** (~3 min)
   - Same flow with GitHub
   - Demo by: @dev1

## Demo scenario

```gherkin
# Complete scenario for demo
Given I am on the home page
When I click on "Sign up"
And I fill out the form
Then I receive a confirmation email
And I can activate my account

Given I am on the login page
When I click on "Google"
Then I am redirected to Google
And after auth, I am logged in
```

──────────────────────────────────────────────────────────────
💬 FEEDBACK TO COLLECT
──────────────────────────────────────────────────────────────

Questions for stakeholders:

1. "Is the registration flow clear?"
2. "Are we missing any OAuth providers?" (Apple, Microsoft, etc.)
3. "Does the design meet expectations?"
4. "Priority for next sprint?"

──────────────────────────────────────────────────────────────
📝 SESSION NOTES
──────────────────────────────────────────────────────────────

Feedback received:
- {Feedback 1}
- {Feedback 2}

New requests:
- {Request 1} → Create US-XXX
- {Request 2} → Add to backlog

Decisions made:
- {Decision 1}
- {Decision 2}
```

### Step 3: Prepare Materials

#### 3.1 Burndown Chart

```
Points |
  21   |██░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
  18   |████████░░░░░░░░░░░░░░░░░░░░░░░░
  15   |████████████░░░░░░░░░░░░░░░░░░░░
  12   |████████████████░░░░░░░░░░░░░░░░
   9   |████████████████████░░░░░░░░░░░░
   6   |████████████████████████░░░░░░░░
   3   |████████████████████████████████ (ideal)
   3   |███████████████████████████████░ (actual)
       D1  D2  D3  D4  D5  D6  D7  D8  D9  D10

Legend: ██ Actual  ░░ Ideal
```

#### 3.2 Cumulative Flow

```
US |
 4 |                    ████████████████
 3 |            ████████████████████████
 2 |    ████████████████████████████████
 1 |████████████████████████████████████
   |________________________________
   D1  D2  D3  D4  D5  D6  D7  D8  D9  D10

██ Done  ░░ In Progress  ▒▒ To Do
```

### Step 4: Sprint Review Agenda

```
══════════════════════════════════════════════════════════════
📅 SPRINT REVIEW AGENDA
══════════════════════════════════════════════════════════════

Total duration: 2h

00:00 - 00:10 | Introduction & Context
               - Sprint Goal reminder
               - Participants present
               - Agenda

00:10 - 01:00 | Demonstration of delivered US
               - US by US
               - Questions/feedback after each demo

01:00 - 01:20 | Metrics & Results
               - Burndown chart
               - Velocity
               - Undelivered points

01:20 - 01:40 | Discussion & Feedback
               - Stakeholder reactions
               - New ideas
               - Prioritization

01:40 - 02:00 | Next steps
               - Impact on Product Backlog
               - Next sprint vision
               - Questions

══════════════════════════════════════════════════════════════
```

### Step 5: sprint-review.md Template

```markdown
# Sprint Review - Sprint {N}

## Information

| Attribute | Value |
|----------|--------|
| Date | {YYYY-MM-DD} |
| Duration | 2h |
| Facilitator | {Name} |

## Participants

- [ ] Product Owner
- [ ] Scrum Master
- [ ] Dev Team
- [ ] Stakeholder 1
- [ ] Stakeholder 2

## Sprint Goal

> "{Goal}"

**Achieved: ✅ / ❌ / ⚠️**

## Demonstration

### US-XXX: Title
- **Demo by**: @member
- **Feedback**: {notes}

### US-XXX: Title
- **Demo by**: @member
- **Feedback**: {notes}

## Metrics

| Metric | Value |
|----------|--------|
| Planned | X pts |
| Delivered | Y pts |
| Velocity | Y pts |
| Rate | Z% |

## Stakeholder Feedback

### Positive
- {Positive feedback 1}
- {Positive feedback 2}

### To improve
- {Improvement point 1}
- {Improvement point 2}

### New ideas
- {Idea 1} → US-XXX created
- {Idea 2} → To refine

## Impact on Backlog

| Action | US | Description |
|--------|-----|-------------|
| Added | US-XXX | {Title} |
| Reprioritized | US-XXX | {Reason} |
| Removed | US-XXX | {Reason} |

## Next steps

1. {Action 1}
2. {Action 2}
3. {Action 3}
```

## Sprint Review Tips

### What it is
- An inspection of the increment
- A feedback moment
- A collaboration with stakeholders

### What it is NOT
- A status meeting
- A technical demo
- A report for management

### Best practices
- Demo on real environment (staging/prod)
- Team demonstrates, not just SM
- Actively collect feedback
- Adapt backlog in real-time

## Next Step

```
╔══════════════════════════════════════════════════════════╗
║                      NEXT STEP                           ║
╠══════════════════════════════════════════════════════════╣
║                                                          ║
║  → /workflow:retro                                       ║
║    Facilitate the sprint retrospective                   ║
║                                                          ║
║  See also:                                               ║
║  • /workflow:status  — Check overall progress            ║
║  • /workflow:status    — View sprint metrics               ║
║                                                          ║
╚══════════════════════════════════════════════════════════╝
```
