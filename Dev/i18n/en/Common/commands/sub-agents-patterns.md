# Sub-Agents Patterns

Guide for using sub-agents effectively in Claude Code for parallel and complex tasks.

## Agent Types

### 1. Explore Agent (Quick Research)
Use for fast codebase exploration and information gathering.

```
Task tool with subagent_type: "Explore"
- Quick file pattern searches
- Keyword searches in code
- Understanding codebase structure
```

**When to use:**
- Finding files by pattern
- Searching for specific code patterns
- Answering questions about codebase organization

### 2. General-Purpose Agent (Complex Tasks)
Use for multi-step tasks requiring autonomy.

```
Task tool with subagent_type: "general-purpose"
- Complex refactoring
- Multi-file updates
- Research and implementation
```

**When to use:**
- Tasks spanning multiple files
- Independent sub-tasks that can run in parallel
- Tasks requiring judgment and iteration

### 3. Plan Agent (Architecture)
Use for designing implementation strategies.

```
Task tool with subagent_type: "Plan"
- Implementation planning
- Architecture decisions
- Trade-off analysis
```

**When to use:**
- Before implementing complex features
- When multiple approaches are possible
- For architectural decisions

## Parallel Task Patterns

### Pattern 1: Parallel Research
Launch multiple explore agents for different aspects:

```
# Launch in parallel (single message with multiple tool calls):
- Agent 1: Search for authentication patterns
- Agent 2: Search for API endpoints
- Agent 3: Search for database models
```

### Pattern 2: Parallel Updates
For independent file updates across languages/modules:

```
# Launch in parallel:
- Agent 1: Update French templates
- Agent 2: Update Spanish templates
- Agent 3: Update German templates
- Agent 4: Update Portuguese templates
```

### Pattern 3: Parallel Quality Checks
Run different quality checks simultaneously:

```
# Launch in parallel:
- Agent 1: Run linter
- Agent 2: Run tests
- Agent 3: Check types
- Agent 4: Security audit
```

## Background Agents

Use `run_in_background: true` for long-running tasks:

```
Task tool with:
  run_in_background: true

Benefits:
- Continue working while agent runs
- Check progress via output file
- Notification when complete
```

**Best for:**
- Test suites
- Build processes
- Large migrations
- Quality pipelines

### Permission Prompting (v2.1.20+)

Background agents request permissions **before** launching, preventing mid-execution blocks:

```
Launching background task: "Analyze and fix code"

This task will need permissions for:
- Read (all files)
- Edit (src/**)
- Bash (npm run lint:fix)

Approve all? [y/N/select]
```

**Response options:**

| Option | Action |
|--------|--------|
| `y` | Approve all requested permissions |
| `N` | Refuse and cancel launch |
| `select` | Choose permissions individually |

**Benefits:**
- No mid-execution permission blocks
- Full visibility of agent actions before start
- Granular control over allowed operations

## Best Practices

### Do
- Launch independent tasks in parallel (single message, multiple tools)
- Use Explore agent for quick searches
- Use background mode for long tasks
- Provide clear, detailed prompts

### Don't
- Launch dependent tasks in parallel
- Use agents for simple single-file reads
- Forget to check background agent results
- Use vague prompts that require clarification

## Example: Multi-Language Update

```markdown
# Task: Update all i18n templates to new format

## Parallel Execution:
1. Launch 4 agents (FR, ES, DE, PT) with run_in_background: true
2. Continue working on other phases
3. Check results when notified

## Each agent receives:
- List of files to update
- Template format to follow
- Instructions to read before write
```

## Coordination Patterns

### Sequential with Checkpoints
For tasks that have dependencies:

```
1. Agent A completes task A
2. Check result
3. Agent B uses result for task B
4. Check result
5. Continue...
```

### Fan-Out/Fan-In
For parallel work with combined results:

```
1. Fan-out: Launch N parallel agents
2. Wait: All agents complete
3. Fan-in: Combine/verify results
4. Continue with merged state
```

## References

- Claude Code Task tool documentation
- `.claude/rules/01-workflow-analysis.md` for analysis patterns
- `.claude/settings.json` for permission configuration
