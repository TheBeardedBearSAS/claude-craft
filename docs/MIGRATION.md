# Migration Guide: Rules to Skills

This guide explains how to migrate from the legacy rules format to the official Claude Code skills format.

## Why Migrate?

| Aspect | Legacy Rules | Skills (New) |
|--------|--------------|--------------|
| Format | Single `.md` file | Directory with 2 files |
| Discovery | By filename | By `description` field |
| Structure | All in one | SKILL.md + REFERENCE.md |
| Official | Deprecated | Claude Code standard |
| Depth | Brief guidelines | Comprehensive reference |

**Benefits of Skills:**
- Better organization with separate index and reference
- Claude Code automatically discovers skills via description
- Cleaner separation of concerns
- Matches official Claude Code conventions

## Migration Steps

### Step 1: Identify Rules to Migrate

Rules are located in `.claude/rules/`. Check which are custom vs installed:

```bash
# List your current rules
ls -la .claude/rules/

# Installed rules from Claude Craft (can be regenerated)
# - 00-project-context.md
# - 01-*.md, 02-*.md, etc.

# Custom rules you created (need migration)
# - my-custom-rule.md
```

### Step 2: Create Skill Directory Structure

For each rule you want to migrate:

```bash
# Create skill directory
mkdir -p .claude/skills/my-custom-skill
```

### Step 3: Create SKILL.md (Index)

Create the index file with frontmatter:

```markdown
---
name: my-custom-skill
description: Brief description. Use when [specific context].
---

# My Custom Skill

This skill provides guidelines and best practices.

See @REFERENCE.md for detailed documentation.
```

**Important:** The `description` field is how Claude Code discovers your skill. Include:
- What the skill covers
- When to use it (triggers)

### Step 4: Create REFERENCE.md (Content)

Move your rule content to the reference file:

```markdown
# My Custom Skill

## Overview

[Move your rule's context/introduction here]

## Guidelines

### Section 1
[Move detailed guidelines here]

### Section 2
[More content]

## Examples

[Code examples, good/bad patterns]

## Checklist

- [ ] Verification item 1
- [ ] Verification item 2

## Anti-patterns

[What to avoid]

## Resources

- [External link 1](url)
```

### Step 5: Test the Skill

1. Restart Claude Code to load the new skill
2. Ask Claude about the topic - it should reference your skill
3. Verify the skill appears in skill discovery

### Step 6: Remove Old Rule

Once verified, remove the old rule file:

```bash
rm .claude/rules/my-custom-rule.md
```

## Migration Examples

### Example 1: Simple Rule

**Before (rules/my-api-standards.md):**
```markdown
# API Standards

Always use:
- REST conventions
- JSON responses
- Proper HTTP status codes

Don't:
- Mix REST and RPC
- Return HTML from APIs
```

**After (skills/api-standards/):**

`SKILL.md`:
```markdown
---
name: api-standards
description: API design standards. Use when creating or reviewing API endpoints.
---

# API Standards

This skill provides API design guidelines.

See @REFERENCE.md for detailed documentation.
```

`REFERENCE.md`:
```markdown
# API Standards

## Overview

Standards for designing consistent, RESTful APIs.

## Guidelines

### REST Conventions
- Use proper HTTP methods (GET, POST, PUT, DELETE)
- Resource-based URLs (/users, /orders)
- Plural nouns for collections

### Response Format
- Always return JSON
- Include appropriate status codes
- Consistent error format

## Anti-patterns

- Mixing REST and RPC styles
- Returning HTML from API endpoints
- Using verbs in URLs (/getUsers)

## Checklist

- [ ] RESTful URL structure
- [ ] Proper HTTP methods
- [ ] JSON responses
- [ ] Appropriate status codes
```

### Example 2: Complex Rule with Code

**Before (rules/testing-patterns.md):**
```markdown
# Testing Patterns

## Unit Tests
Use AAA pattern...

## Integration Tests
...
```

**After (skills/testing-patterns/):**

`SKILL.md`:
```markdown
---
name: testing-patterns
description: Testing patterns and best practices. Use when writing or reviewing tests.
---

# Testing Patterns

This skill covers unit, integration, and E2E testing.

See @REFERENCE.md for detailed documentation.
```

`REFERENCE.md`:
```markdown
# Testing Patterns

## Overview

Comprehensive testing guidelines following TDD/BDD principles.

**Objectives:**
- Code coverage ≥ 80%
- Fast unit tests (< 1s each)
- Independent, reproducible tests

## Unit Tests

### AAA Pattern

```javascript
test('calculates total correctly', () => {
  // Arrange
  const cart = new Cart();
  cart.add({ price: 10 });

  // Act
  const total = cart.getTotal();

  // Assert
  expect(total).toBe(10);
});
```

## Integration Tests

[Content here]

## Checklist

- [ ] AAA pattern followed
- [ ] No test interdependencies
- [ ] Descriptive test names
```

## Bulk Migration Script

For multiple rules, use this script:

```bash
#!/bin/bash
# migrate-rule-to-skill.sh <rule-file>

RULE_FILE="$1"
RULE_NAME=$(basename "$RULE_FILE" .md)
SKILL_DIR=".claude/skills/${RULE_NAME}"

# Create skill directory
mkdir -p "$SKILL_DIR"

# Create SKILL.md
cat > "$SKILL_DIR/SKILL.md" << EOF
---
name: ${RULE_NAME}
description: [Add description]. Use when [context].
---

# ${RULE_NAME}

This skill provides guidelines and best practices.

See @REFERENCE.md for detailed documentation.
EOF

# Copy content to REFERENCE.md
cp "$RULE_FILE" "$SKILL_DIR/REFERENCE.md"

echo "Created skill: $SKILL_DIR"
echo "TODO: Edit SKILL.md description and refine REFERENCE.md"
```

Usage:
```bash
./migrate-rule-to-skill.sh .claude/rules/my-custom-rule.md
```

## Keeping Legacy Rules

If you prefer to keep legacy rules:

1. **They still work** - Claude Code loads rules from `.claude/rules/`
2. **No action required** - Existing installations continue to function
3. **Gradual migration** - Migrate as needed, no rush

Claude Craft installs both skills and legacy rules for backward compatibility.

## Troubleshooting

### Skill Not Discovered

**Problem:** Claude doesn't seem to use your skill

**Solutions:**
1. Check `description` field is present and descriptive
2. Restart Claude Code to reload skills
3. Verify file is in `.claude/skills/<name>/SKILL.md`

### REFERENCE.md Not Found

**Problem:** Claude mentions skill but can't find details

**Solutions:**
1. Ensure REFERENCE.md exists in same directory as SKILL.md
2. Check file permissions
3. Verify markdown syntax is valid

### Duplicate Content

**Problem:** Both rule and skill exist with same content

**Solution:** Remove the old rule file after verifying skill works:
```bash
rm .claude/rules/old-rule.md
```

## Best Practices

1. **Descriptive names** - Use kebab-case: `api-standards`, `testing-react`
2. **Clear descriptions** - Include when to use the skill
3. **Structured reference** - Use consistent sections (Overview, Guidelines, Checklist)
4. **Examples included** - Show good and bad patterns
5. **Keep it focused** - One skill per domain/topic

## See Also

- [Skills Reference](SKILLS.md) - Complete skills documentation
- [CONTRIBUTING.md](../CONTRIBUTING.md) - Creating new skills
