---
name: reverse-stories
description: Generate user stories from existing codebase features and endpoints
arguments:
  - name: scan-report
    description: Path to scan report (default project-management/scan-report.md)
    required: false
  - name: scope
    description: Scope to generate stories for (all, module, endpoint)
    required: false
  - name: module
    description: Specific module to generate stories for
    required: false
---

# /project:reverse-stories

## Mission

Generate user stories from an existing codebase by analyzing implemented features, endpoints, and test assertions. Each story is inferred from actual code behavior and marked as a DRAFT requiring human validation. This command bridges the gap between working code and formal product documentation.

**IMPORTANT:** All generated stories are marked as `INFERRED`. They represent what the code currently does, not necessarily what it should do. Human validation is mandatory before treating these as authoritative requirements.

## Prerequisites

- Scan report exists at `project-management/scan-report.md` (or run `/project:scan` first)
- Optional: PRD exists at `project-management/prd.md` (from `/project:reverse-prd`)
- Codebase is accessible for analysis
- Optional: Existing test files for acceptance criteria extraction

## Plan Mode

> **Plan mode is mandatory.** Before executing, Claude activates plan mode to analyze impacted code, propose an implementation plan, and wait for your validation before making any changes.

## Workflow

### Step 1: Load Context

```
+--------------------------------------------------------------+
|            REVERSE STORIES - LOADING CONTEXT                   |
+--------------------------------------------------------------+
| Loading scan report and PRD...                                 |
+--------------------------------------------------------------+
```

**Actions:**
1. Load `project-management/scan-report.md`
2. If scan report does not exist, prompt user to run `/project:scan` first
3. Load `project-management/prd.md` if available (for FR-xxx traceability)
4. Parse modules, endpoints, entities, services, and test files
5. Determine scope (all modules, specific module, or specific endpoint)

### Step 2: Feature Extraction

```
+--------------------------------------------------------------+
|            REVERSE STORIES - FEATURE EXTRACTION                |
+--------------------------------------------------------------+
| Extracting features from code...                               |
+--------------------------------------------------------------+
```

**For each endpoint/feature, extract:**

1. **Controller/Handler Analysis**
   - HTTP method and route path
   - Request validation rules (DTO, form requests)
   - Response structure and status codes
   - Authorization requirements (roles, voters, policies)

2. **Service/Use Case Analysis**
   - Business logic flow
   - Side effects (events dispatched, notifications sent)
   - External service calls
   - Error handling paths

3. **Entity/Model Analysis**
   - Fields and their constraints
   - Relationships and cascading behavior
   - State transitions (status fields, workflows)
   - Soft delete, timestamps, versioning

4. **Test Analysis**
   - Test method names (often describe behavior)
   - Assertions (define expected outcomes)
   - Test data fixtures (define valid/invalid inputs)
   - Edge cases covered

### Step 3: Story Generation

```
+--------------------------------------------------------------+
|            REVERSE STORIES - GENERATION                        |
+--------------------------------------------------------------+
| Generating user stories...                                     |
+--------------------------------------------------------------+
```

**For each feature, generate a user story:**

#### Persona Inference
- `ROLE_ADMIN` + admin routes -> "As an administrator"
- `ROLE_USER` + authenticated routes -> "As a registered user"
- `ROLE_MANAGER` + management routes -> "As a manager"
- Public routes (no auth) -> "As a visitor"
- API key routes -> "As an external system"

#### Action Inference
- `POST /api/resources` -> "I want to create a resource"
- `GET /api/resources` -> "I want to list resources"
- `GET /api/resources/{id}` -> "I want to view a resource"
- `PUT /api/resources/{id}` -> "I want to update a resource"
- `DELETE /api/resources/{id}` -> "I want to delete a resource"
- Custom actions -> Inferred from method name and business logic

#### Benefit Inference
- CRUD operations -> "So that I can manage {resource} data"
- Search/filter -> "So that I can find relevant {resources} quickly"
- Export -> "So that I can use {resource} data externally"
- Notifications -> "So that I am informed about {event}"
- Auth -> "So that my data is secure and accessible only to me"

#### Acceptance Criteria from Tests
- Test assertions become Gherkin scenarios
- Test fixtures define Given conditions
- Test actions define When conditions
- Test expectations define Then conditions

**Story Template:**

```markdown
# US-XXX: [Inferred Title]

> INFERRED -- This story was generated from codebase analysis.
> Human validation is required.

## Source
- **Module**: {module_name}
- **Endpoint**: {method} {path}
- **Controller**: {controller_class}
- **Implements**: FR-XXX (if PRD exists)

## User Story

### Card
**As** [inferred persona]
**I want** [inferred action]
**So that** [inferred benefit]

### Conversation
- [ ] Validate persona assignment
- [ ] Confirm action description matches intent
- [ ] Verify benefit aligns with business goals

### INVEST Validation
- [ ] Independent / Negotiable / Valuable / Estimable / Sized / Testable

## Acceptance Criteria (Gherkin)

### Nominal Scenario (from code behavior)
Scenario: [Inferred from happy path]
  Given [initial state from test fixtures]
  When [action from controller/handler]
  Then [expected result from assertions]

### Error Scenarios (from validation rules)
Scenario: [Inferred from validation]
  Given [context]
  When [invalid action]
  Then [error response from code]

## Technical Notes
- Entity: {entity_name}
- Validation: {validation_rules}
- Auth: {auth_requirements}
- Events: {dispatched_events}

## Estimation
- **Story Points**: [estimated from complexity]
- **MoSCoW**: [inferred from usage patterns]
```

### Step 4: Traceability Mapping

```
+--------------------------------------------------------------+
|            REVERSE STORIES - TRACEABILITY                      |
+--------------------------------------------------------------+
| Mapping stories to requirements...                             |
+--------------------------------------------------------------+
```

**If a PRD exists (`project-management/prd.md`):**
1. Map each story to a functional requirement (FR-xxx)
2. Identify stories without matching requirements (code without spec)
3. Identify requirements without matching stories (spec without code)
4. Add `implements: FR-xxx` reference to each mapped story

### Step 5: Output and Validation

```
+--------------------------------------------------------------+
|            REVERSE STORIES - COMPLETE                           |
+--------------------------------------------------------------+
| Stories generated. Human validation required.                   |
+--------------------------------------------------------------+
```

**Actions:**
1. Save stories to `project-management/backlog/user-stories/`
2. Generate a summary index of all stories
3. Present stories grouped by module for user review
4. Ask user to validate, correct, or reject each story

## Output Format

```
project-management/
+-- backlog/
    +-- user-stories/
        +-- US-001-create-user.md
        +-- US-002-list-users.md
        +-- US-003-update-user.md
        +-- US-004-create-order.md
        +-- ...
```

**Summary Output:**

```
+==============================================================+
|              REVERSE-ENGINEERED USER STORIES                   |
+==============================================================+
| Total Stories: 18                                              |
| Status: DRAFT - Requires human validation                      |
+==============================================================+
| Module: User                                                   |
|   US-001: Create user account              [3 pts] [Must]      |
|   US-002: List users with pagination       [2 pts] [Must]      |
|   US-003: Update user profile              [2 pts] [Must]      |
|   US-004: Deactivate user account          [2 pts] [Should]    |
+--------------------------------------------------------------+
| Module: Order                                                  |
|   US-005: Create new order                 [5 pts] [Must]      |
|   US-006: List orders with filters         [3 pts] [Must]      |
|   US-007: Update order status              [3 pts] [Must]      |
|   US-008: Cancel order                     [3 pts] [Should]    |
+--------------------------------------------------------------+
| Module: Payment                                                |
|   US-009: Process payment                  [5 pts] [Must]      |
|   US-010: Refund payment                   [5 pts] [Should]    |
+--------------------------------------------------------------+
| Traceability:                                                  |
|   Mapped to PRD: 14/18 stories                                 |
|   Unmapped (code without spec): 4 stories                      |
+==============================================================+
```

## Example Session

```
User: /project:reverse-stories --module=Order

Claude: Starting reverse story generation for module: Order

[Loading Context]
Loaded scan report: 5 modules, 23 endpoints
Loaded PRD: 14 functional requirements
Focusing on module: Order (7 endpoints, 3 entities)

[Feature Extraction]
Analyzing OrderController... 5 endpoints found
Analyzing CreateOrderHandler... 3 dependencies, 2 events
Analyzing Order entity... 15 fields, 4 status transitions
Analyzing OrderTest... 12 test methods

[Story Generation]
Generated 6 user stories from Order module:
- US-005: Create new order (POST /api/orders)
- US-006: List orders with filters (GET /api/orders)
- US-007: View order details (GET /api/orders/{id})
- US-008: Update order status (PATCH /api/orders/{id}/status)
- US-009: Cancel order (POST /api/orders/{id}/cancel)
- US-010: Export orders to CSV (GET /api/orders/export)

[Traceability]
5/6 stories mapped to PRD requirements
1 story unmapped: US-010 (Export) - no matching FR in PRD

Stories saved to: project-management/backlog/user-stories/

Would you like to:
1. Review each story for validation?
2. Generate stories for another module?
3. Run /project:gap-analysis to find all gaps?
```

## Related Commands

- `/project:scan` - Scan codebase (prerequisite)
- `/project:reverse-prd` - Generate PRD from codebase
- `/project:gap-analysis` - Compare spec vs code
- `/project:generate-backlog` - Create SCRUM backlog from PRD (greenfield)
- `/project:update-stories` - Update existing stories
