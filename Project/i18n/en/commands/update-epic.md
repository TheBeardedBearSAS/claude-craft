---
description: Update an EPIC
argument-hint: [arguments]
---

# Update an EPIC

Modify information of an existing EPIC.

## Arguments

$ARGUMENTS (format: EPIC-XXX [field] [value])
- **EPIC-ID** (required): EPIC ID (e.g., EPIC-001)
- **Field** (optional): Field to modify
- **Value** (optional): New value

## Plan Mode

> **Plan mode is mandatory.** Before executing, Claude activates plan mode to analyze impacted code, propose an implementation plan, and wait for your validation before making any changes.

## Modifiable Fields

| Field | Description | Example |
|-------|-------------|---------|
| `name` | EPIC name | "New name" |
| `priority` | Priority | High, Medium, Low |
| `mmf` | Minimum Marketable Feature | "MMF description" |
| `description` | Description | "New description" |

## Process

### Interactive Mode (without field arguments)

If only ID is provided:

```
/project:update-epic EPIC-001
```

Display current information and offer modifications:

```
📋 EPIC-001: Authentication system

Current fields:
1. Name: Authentication system
2. Priority: High
3. MMF: Allow users to log in
4. Description: [...]

Which field to modify? (1-4, or 'q' to quit)
>
```

### Direct Mode (with arguments)

```
/project:update-epic EPIC-001 priority Medium
```

Directly modify the specified field.

### Steps

1. Validate that EPIC exists
2. Read current file
3. Modify requested field
4. Update modification date
5. Save file
6. Update index if necessary

## Output Format

```
✅ EPIC updated!

📋 EPIC-001: Authentication system

Modification:
  Priority: High → Medium

File: project-management/backlog/epics/EPIC-001-authentication-system.md
```

## Examples

```
# Interactive mode
/project:update-epic EPIC-001

# Change name
/project:update-epic EPIC-001 name "Authentication and Authorization"

# Change priority
/project:update-epic EPIC-001 priority Low

# Change MMF
/project:update-epic EPIC-001 mmf "Allow SSO and 2FA"
```

## Validation

- Field must be modifiable
- Priority must be High, Medium or Low
- Name cannot be empty
