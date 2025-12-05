# Update a User Story

Modify information of an existing User Story.

## Arguments

$ARGUMENTS (format: US-XXX [field] [value])
- **US-ID** (required): User Story ID (e.g., US-001)
- **Field** (optional): Field to modify
- **Value** (optional): New value

## Modifiable Fields

| Field | Description | Example |
|-------|-------------|---------|
| `name` | US name | "New name" |
| `points` | Story points | 1, 2, 3, 5, 8 |
| `epic` | Parent EPIC | EPIC-002 |
| `persona` | Related persona | P-001 |
| `story` | US text | "As a..." |
| `criteria` | Acceptance criteria | (interactive mode) |

## Process

### Interactive Mode (without field arguments)

```
/project:update-story US-001
```

Display information and offer modifications:

```
📖 US-001: User login

Current fields:
1. Name: User login
2. EPIC: EPIC-001
3. Points: 5
4. Persona: P-001 (Standard User)
5. Story: As a user, I want...
6. Acceptance criteria: [3 criteria]

Which field to modify? (1-6, or 'q' to quit)
>
```

### Direct Mode

```
/project:update-story US-001 points 8
```

### Modify Acceptance Criteria

In interactive mode, option to:
- Add a criterion
- Modify existing criterion
- Delete a criterion

```
Current acceptance criteria:
1. CA-1: Login with email/password
2. CA-2: Error message on failure
3. CA-3: Redirect after success

Action? (a)dd, (m)odify, (d)elete, (q)uit
> a

New criterion (Gherkin format):
GIVEN:
WHEN:
THEN:
```

### Steps

1. Validate that US exists
2. Read current file
3. Modify requested field
4. Update modification date
5. Save file
6. Update parent EPIC if changed
7. Update index

## Output Format

```
✅ User Story updated!

📖 US-001: User login

Modification:
  Points: 5 → 8

⚠️ Warning: 8 points is the maximum recommended.
   Consider splitting this US if too complex.

File: project-management/backlog/user-stories/US-001-user-login.md
```

## EPIC Change

If changing parent EPIC:

```
✅ User Story moved!

📖 US-001: User login

Modification:
  EPIC: EPIC-001 → EPIC-002

Updates:
  - EPIC-001: US removed from list
  - EPIC-002: US added to list
  - Index: Updated
```

## Examples

```
# Interactive mode
/project:update-story US-001

# Change points
/project:update-story US-001 points 3

# Change EPIC
/project:update-story US-001 epic EPIC-002

# Change name
/project:update-story US-001 name "User login with SSO"
```

## Validation

- Points: Fibonacci (1, 2, 3, 5, 8)
- If points > 8: Warning to split
- EPIC: Must exist
- Persona: Must be defined in personas.md
