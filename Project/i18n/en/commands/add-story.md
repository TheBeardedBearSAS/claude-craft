# Add a User Story

Create a new User Story and associate it with an EPIC.

## Arguments

$ARGUMENTS (format: EPIC-XXX "US Name" [points])
- **EPIC-ID** (required): Parent EPIC ID (e.g., EPIC-001)
- **Name** (required): User Story title
- **Points** (optional): Story points in Fibonacci (1, 2, 3, 5, 8)

## Process

### Step 1: Analyze arguments

Extract from $ARGUMENTS:
- EPIC ID
- User Story name
- Story points (if provided)

### Step 2: Validate EPIC

1. Check that EPIC exists in `project-management/backlog/epics/`
2. If not found, display error with available EPICs

### Step 3: Generate ID

1. Read files in `project-management/backlog/user-stories/`
2. Find the last used ID (format US-XXX)
3. Increment to get the new ID

### Step 4: Collect information

Ask the user:
- **Persona**: Who is the user? (P-XXX or description)
- **Action**: What do they want to do?
- **Benefit**: Why do they want it?
- **Acceptance criteria**: At least 2 in Gherkin format
- **Points**: If not provided, estimate (Fibonacci: 1, 2, 3, 5, 8)

### Step 5: Create the file

1. Use template `Scrum/templates/user-story.md`
2. Replace placeholders:
   - `{ID}`: Generated ID
   - `{NOM}`: US name
   - `{EPIC_ID}`: Parent EPIC ID
   - `{SPRINT}`: "Backlog" (unassigned)
   - `{POINTS}`: Story points
   - `{PERSONA}`: Identified persona
   - `{PERSONA_ID}`: Persona ID
   - `{ACTION}`: Desired action
   - `{BENEFICE}`: Expected benefit
   - `{DATE}`: Current date (YYYY-MM-DD)

3. Add acceptance criteria in Gherkin format

4. Create file: `project-management/backlog/user-stories/US-{ID}-{slug}.md`

### Step 6: Update EPIC

1. Read EPIC file
2. Add US to User Stories table
3. Update progress
4. Save

### Step 7: Update index

1. Read `project-management/backlog/index.md`
2. Add US to "Prioritized Backlog" section
3. Update counters
4. Save

## Output Format

```
✅ User Story created successfully!

📖 US-{ID}: {NAME}
   EPIC: {EPIC_ID}
   Status: 🔴 To Do
   Points: {POINTS}
   File: project-management/backlog/user-stories/US-{ID}-{slug}.md

Next steps:
  /project:move-story US-{ID} sprint-X    # Assign to sprint
  /project:add-task US-{ID} "[BE] ..." 4h # Add tasks
```

## Example

```
/project:add-story EPIC-001 "User login" 5
```

Creates:
- `project-management/backlog/user-stories/US-001-user-login.md`

## INVEST Validation

Check that US follows INVEST:
- **I**ndependent: Can be developed alone
- **N**egotiable: Details can be discussed
- **V**aluable: Brings value to persona
- **E**stimable: Can be estimated (points provided)
- **S**mall: ≤ 8 points (otherwise suggest splitting)
- **T**estable: Has clear acceptance criteria
