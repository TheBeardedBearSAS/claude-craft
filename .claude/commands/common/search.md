---
name: search
description: Search commands, skills and agents by keyword
tags: [search, discover, find, help]
---

# Search Claude Craft

Search commands, skills and agents by keyword across the entire Claude Craft framework.

## Usage

```bash
/common:search <keyword>
```

## Examples

```bash
/common:search testing
/common:search security
/common:search react
/common:search audit
```

## Implementation

This command searches through:
1. **Commands** in `.claude/commands/*/` (name and content)
2. **Skills** in `.claude/skills/*/` (name and description)
3. **Agents** in `.claude/agents/*/` (name and description)
4. **Rules** in `.claude/rules/` (title and content)

Results are ranked by relevance and display the top 5 matches.

## Search Algorithm

1. Search in command/skill/agent names (highest priority)
2. Search in descriptions and frontmatter
3. Search in file content (lower priority)
4. Rank by keyword frequency and position
5. Display top 5 results with context

## Output Format

```
🔍 Search results for "testing":

Commands:
  • /qa:tdd - TDD workflow (Red → Green → Refactor)
  • /symfony:check-testing - Check Symfony testing compliance
  • /react:check-testing - Check React testing compliance

Skills:
  • testing - TDD/BDD testing patterns and best practices
  • testing-symfony - Symfony-specific testing with PHPUnit/Pest

Agents:
  • @tdd-coach - Guide through Test-Driven Development

Rules:
  • 07-testing.md - Testing TDD/BDD — Quick Reference
```

---

## Instructions for Claude

When a user invokes `/common:search <keyword>`:

1. Search across all commands, skills, agents, and rules
2. Use Grep tool with case-insensitive search (`-i` flag)
3. Search patterns:
   - Command names: `find .claude/commands -name "*<keyword>*.md"`
   - Skill names: `find .claude/skills -name "*<keyword>*"`
   - Agent names: `grep -ri "<keyword>" .claude/agents/`
   - Rules: `grep -ri "<keyword>" .claude/rules/`

4. Extract and format results:
   - For commands: extract frontmatter `name` and `description`
   - For skills: extract directory name and SKILL.md frontmatter
   - For agents: extract agent name from AGENT.md frontmatter
   - For rules: extract title from markdown header

5. Rank results by relevance:
   - Exact match in name = 10 points
   - Match in description = 5 points
   - Match in content = 1 point

6. Display top 5 results grouped by category (Commands, Skills, Agents, Rules)

7. If no results found, suggest similar terms or display most popular commands

---

## Popular Searches

| Keyword | Top Results |
|---------|-------------|
| `testing` | /qa:tdd, testing skill, @tdd-coach |
| `security` | /team:security, security skill, @security-auditor |
| `architecture` | architecture skill, @database-architect |
| `react` | /react:* commands, @react-reviewer |
| `symfony` | /symfony:* commands, @symfony-reviewer |
| `audit` | /team:audit, /common:audit-freshness, /common:audit-claude-alignment |
| `claude code` | /common:audit-claude-alignment, .claude/COMPATIBILITY.md |
| `workflow` | /workflow:* commands, workflow-analysis skill |

---

**Version:** 1.0.0  
**Author:** The Bearded CTO  
**Date:** 2026-04-17
