# Add a Task

Create a new technical task and associate it with a User Story.

## Arguments

$ARGUMENTS (format: US-XXX "[TYPE] Description" estimation)
- **US-ID** (required): Parent User Story ID (e.g., US-001)
- **Description** (required): Description with type in brackets
- **Estimation** (required): Estimation in hours (e.g., 4h, 2h, 0.5h)

## Task Types

| Type | Prefix | Description |
|------|---------|-------------|
| Database | `[DB]` | Entity, Migration, Repository |
| Backend | `[BE]` | Service, API Resource, Processor |
| Frontend Web | `[FE-WEB]` | Controller, Twig, Stimulus |
| Frontend Mobile | `[FE-MOB]` | Model, Repository, Bloc, Screen |
| Tests | `[TEST]` | Unit, Integration, E2E |
| Documentation | `[DOC]` | PHPDoc, DartDoc, README |
| DevOps | `[OPS]` | Docker, CI/CD |
| Review | `[REV]` | Code Review |

## Process

### Step 1: Analyze arguments

Extract from $ARGUMENTS:
- User Story ID
- Type (in brackets)
- Description
- Estimation in hours

### Step 2: Validate User Story

1. Check that US exists in `project-management/backlog/user-stories/`
2. Get assigned sprint (if applicable)
3. If US not found, display error

### Step 3: Validate estimation

- Minimum: 0.5h
- Maximum: 8h
- Ideal: 2-4h
- If > 8h, suggest splitting the task

### Step 4: Generate ID

1. Find last used task ID
2. Increment to get new ID

### Step 5: Create the file

1. Use template `Scrum/templates/task.md`
2. Replace placeholders:
   - `{ID}`: Generated ID
   - `{DESCRIPTION}`: Short description
   - `{US_ID}`: User Story ID
   - `{TYPE}`: Task type
   - `{ESTIMATION}`: Estimation in hours
   - `{DATE}`: Current date (YYYY-MM-DD)
   - `{DESCRIPTION_DETAILLEE}`: Detailed description

3. Determine path:
   - If US in sprint: `project-management/sprints/sprint-XXX/tasks/TASK-{ID}.md`
   - Otherwise: `project-management/backlog/tasks/TASK-{ID}.md`

### Step 6: Update User Story

1. Read US file
2. Add task to Tasks table
3. Update progress
4. Save

### Step 7: Update board (if sprint)

If US is in a sprint:
1. Read `project-management/sprints/sprint-XXX/board.md`
2. Add task to "🔴 To Do"
3. Update metrics
4. Save

## Output Format

```
✅ Task created successfully!

🔧 TASK-{ID}: {DESCRIPTION}
   US: {US_ID}
   Type: {TYPE}
   Status: 🔴 To Do
   Estimation: {ESTIMATION}h
   File: {PATH}

Next steps:
  /project:move-task TASK-{ID} in-progress  # Start task
  /project:board                             # View Kanban
```

## Examples

```
# Backend task
/project:add-task US-001 "[BE] Login API endpoint" 4h

# Database task
/project:add-task US-001 "[DB] User entity with email/password fields" 2h

# Mobile frontend task
/project:add-task US-001 "[FE-MOB] Login screen with validation" 6h

# Test task
/project:add-task US-001 "[TEST] AuthService unit tests" 3h
```

## Validation

- [ ] Type is valid (DB, BE, FE-WEB, FE-MOB, TEST, DOC, OPS, REV)
- [ ] Estimation is between 0.5h and 8h
- [ ] User Story exists
- [ ] ID is unique
