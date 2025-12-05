# Daily Stand-up Summary Generation

You are a Scrum assistant. You must generate a summary of development activities to facilitate the daily stand-up.

## Arguments
$ARGUMENTS

Arguments:
- (Optional) Period (default: since yesterday)

Example: `/common:daily-standup` or `/common:daily-standup "2024-01-15"`

## MISSION

### Step 1: Collect Data

```bash
# Commits since yesterday
git log --since="yesterday" --oneline --all

# Active branches
git branch -a --sort=-committerdate | head -10

# Open PRs
gh pr list --state open

# Current issues
gh issue list --assignee @me --state open

# Locally modified files
git status --short
```

### Step 2: Generate Summary

```
══════════════════════════════════════════════════════════════
📅 DAILY STAND-UP - {YYYY-MM-DD}
══════════════════════════════════════════════════════════════

──────────────────────────────────────────────────────────────
📊 SPRINT SUMMARY
──────────────────────────────────────────────────────────────

Sprint: {N}
Day: {X}/10
Points remaining: {Y}
Burndown: 📉 On track / 📈 Ahead / 📊 Behind

──────────────────────────────────────────────────────────────
✅ WHAT WAS DONE (YESTERDAY)
──────────────────────────────────────────────────────────────

### Commits
- {hash} {message} (@author)
- {hash} {message} (@author)

### Merged PRs
- PR #123: {title} (@author)

### Closed Issues
- Issue #456: {title}

──────────────────────────────────────────────────────────────
🎯 WHAT IS PLANNED (TODAY)
──────────────────────────────────────────────────────────────

### In Progress
| Branch | Issue | Assigned | Status |
|---------|-------|---------|--------|
| feature/auth | #45 | @dev1 | 🟡 70% |
| fix/login | #48 | @dev2 | 🟢 90% |

### To Start
- Issue #50: {title} (unassigned)

──────────────────────────────────────────────────────────────
🚧 BLOCKERS / RISKS
──────────────────────────────────────────────────────────────

| Blocker | Impact | Required Action |
|----------|--------|----------------|
| External API down | PR #123 blocked | Contact support |
| Review pending | PR #125 for 2 days | @dev3 available? |

──────────────────────────────────────────────────────────────
📈 ACTIVE PULL REQUESTS
──────────────────────────────────────────────────────────────

| PR | Title | Author | Age | Reviews |
|----|-------|--------|-----|---------|
| #125 | Add OAuth login | @dev1 | 2d | 1/2 ✅ |
| #127 | Fix user profile | @dev2 | 1d | 0/2 ⏳ |
| #128 | Update deps | @bot | 3d | 0/1 ⏳ |

──────────────────────────────────────────────────────────────
💡 NOTES / REMINDERS
──────────────────────────────────────────────────────────────

- 🗓️ Backlog refinement tomorrow 2pm
- ⚠️ Feature X deadline: Friday
- 📣 Sprint Review: {date}
```

### Step 3: Short Format (for Slack/Teams)

```markdown
**📅 Daily - {YYYY-MM-DD}**

**Yesterday:**
• PR #123 merged (Google OAuth)
• 5 commits on feature/auth

**Today:**
• Finish PR #125 (GitHub OAuth)
• Start Issue #50 (Password reset)

**Blockers:**
• ⚠️ Review pending PR #125 (@dev3)

**PRs to review:**
• PR #127 - Fix user profile (0/2)
```

### Step 4: Team Metrics

```
══════════════════════════════════════════════════════════════
👥 TEAM ACTIVITY (Last 7 days)
══════════════════════════════════════════════════════════════

| Member | Commits | PRs | Reviews | Issues |
|--------|---------|-----|---------|--------|
| @dev1 | 12 | 3 | 5 | 4 |
| @dev2 | 8 | 2 | 3 | 3 |
| @dev3 | 15 | 4 | 8 | 5 |

──────────────────────────────────────────────────────────────
📊 CURRENT VELOCITY
──────────────────────────────────────────────────────────────

| Day | Points Delivered | Cumulative | Ideal |
|------|---------------|--------|-------|
| D1 | 3 | 3 | 2.1 |
| D2 | 5 | 8 | 4.2 |
| D3 | 2 | 10 | 6.3 |
| D4 | 0 | 10 | 8.4 |
| D5 | ... | ... | 10.5 |

Status: 📈 Ahead by 1.6 points
```

## Daily Stand-up Tips

### The 3 Classic Questions
1. What did I do yesterday?
2. What will I do today?
3. Are there any obstacles?

### Best Practices
- **15 minutes max** for the entire team
- **Standing** (encourages brevity)
- **Same time** every day
- **No problem solving** (parking lot)
- **Focus on Sprint Goal**

### Anti-Patterns to Avoid
- ❌ Reporting to Scrum Master (talk to the team)
- ❌ Long technical discussions
- ❌ Waiting for your turn without listening
- ❌ "I worked on X" (too vague)

### Alternative Format: Walk the Board
1. Start from "Done" column
2. Move to "In Progress"
3. Then "To Do"
4. Focus on what blocks progress

## Automation

### GitHub Action for Daily Digest

```yaml
name: Daily Digest
on:
  schedule:
    - cron: '0 7 * * 1-5'  # 7am Monday to Friday
  workflow_dispatch:

jobs:
  digest:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Generate Digest
        run: |
          echo "# Daily Digest - $(date +%Y-%m-%d)" > digest.md
          echo "" >> digest.md
          echo "## Commits (24h)" >> digest.md
          git log --since="24 hours ago" --oneline >> digest.md
          echo "" >> digest.md
          echo "## Open PRs" >> digest.md
          gh pr list --state open --json number,title,author >> digest.md

      - name: Post to Slack
        uses: slackapi/slack-github-action@v1
        with:
          channel-id: 'daily-standup'
          payload-file-path: digest.md
```
