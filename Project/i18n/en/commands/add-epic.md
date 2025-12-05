# Add an EPIC

Create a new EPIC in the backlog.

## Arguments

$ARGUMENTS (format: "EPIC Name" [priority])
- **Name** (required): EPIC title
- **Priority** (optional): High, Medium, Low (default: Medium)

## Process

### Step 1: Analyze arguments

Extract:
- EPIC name from $ARGUMENTS
- Priority (if provided, otherwise Medium)

### Step 2: Generate ID

1. Read files in `project-management/backlog/epics/`
2. Find the last used ID (format EPIC-XXX)
3. Increment to get the new ID

### Step 3: Collect information

Ask the user (if not provided):
- EPIC description
- MMF (Minimum Marketable Feature)
- Business objectives (2-3 points)
- Success criteria

### Step 4: Create the file

1. Use template `Scrum/templates/epic.md`
2. Replace placeholders:
   - `{ID}`: Generated ID
   - `{NOM}`: EPIC name
   - `{PRIORITE}`: Chosen priority
   - `{MINIMUM_MARKETABLE_FEATURE}`: MMF
   - `{DESCRIPTION}`: Description
   - `{DATE}`: Current date (YYYY-MM-DD)
   - `{OBJECTIF_1}`, `{OBJECTIF_2}`: Business objectives
   - `{CRITERE_1}`, `{CRITERE_2}`: Success criteria

3. Create file: `project-management/backlog/epics/EPIC-{ID}-{slug}.md`

### Step 5: Update index

1. Read `project-management/backlog/index.md`
2. Add EPIC to EPICs table
3. Update summary counters
4. Save

## Output Format

```
✅ EPIC created successfully!

📋 EPIC-{ID}: {NAME}
   Status: 🔴 To Do
   Priority: {PRIORITY}
   File: project-management/backlog/epics/EPIC-{ID}-{slug}.md

Next steps:
  /project:add-story EPIC-{ID} "User Story Name"
```

## Example

```
/project:add-epic "Authentication System" High
```

Creates:
- `project-management/backlog/epics/EPIC-001-authentication-system.md`

## Validation

- [ ] Name is not empty
- [ ] Priority is valid (High/Medium/Low)
- [ ] Directory `project-management/backlog/epics/` exists
- [ ] ID is unique
