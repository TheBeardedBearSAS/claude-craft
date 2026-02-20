---
name: reverse-prd
description: Generate a PRD from an existing codebase by analyzing implemented features and business logic
arguments:
  - name: scan-report
    description: Path to scan report (default project-management/scan-report.md)
    required: false
  - name: output
    description: Output path (default project-management/prd.md)
    required: false
---

# /project:reverse-prd

## Mission

Generate a DRAFT Product Requirements Document (PRD) from an existing codebase by analyzing implemented features, business logic, authentication patterns, and infrastructure. This is the brownfield counterpart to `/project:generate-prd` for projects that already have working code but lack formal specifications.

**IMPORTANT:** The output is always a DRAFT. All inferred sections are marked as requiring human validation. This command does NOT create authoritative specifications -- it creates a starting point for discussion and refinement.

## Prerequisites

- Scan report exists at `project-management/scan-report.md` (or run `/project:scan` first)
- Codebase is accessible for analysis
- Optional: Existing documentation in `./docs/`
- Optional: `README.md` with project description

## Plan Mode

> **Plan mode is mandatory.** Before executing, Claude activates plan mode to analyze impacted code, propose an implementation plan, and wait for your validation before making any changes.

## Workflow

### Step 1: Load Scan Report

```
+--------------------------------------------------------------+
|              REVERSE PRD - LOADING SCAN                        |
+--------------------------------------------------------------+
| Loading scan report...                                         |
+--------------------------------------------------------------+
```

**Actions:**
1. Load `project-management/scan-report.md`
2. If scan report does not exist, prompt user to run `/project:scan` first
3. Parse technology stack, modules, endpoints, entities, and services
4. Load any existing documentation from `./docs/` and `README.md`

### Step 2: Business Logic Analysis

```
+--------------------------------------------------------------+
|              REVERSE PRD - BUSINESS ANALYSIS                   |
+--------------------------------------------------------------+
| Analyzing business logic from code...                          |
+--------------------------------------------------------------+
```

**For each module/bounded context, analyze:**

1. **Domain Events**: What business events are dispatched?
   - Event classes and their payloads
   - Event listeners and subscribers
   - Event-driven workflows

2. **Use Cases / Commands / Queries**: What operations exist?
   - Command handlers (write operations)
   - Query handlers (read operations)
   - Service methods with business logic

3. **Validation Rules**: What constraints exist?
   - Entity validation (annotations, attributes)
   - Form/request validation
   - Business rule assertions

4. **State Machines**: What status transitions exist?
   - Enum types for statuses
   - Workflow/state machine configurations
   - Guard conditions

5. **External Integrations**: What third-party services are used?
   - Payment gateways
   - Email/notification services
   - Storage providers
   - External APIs

### Step 3: Requirement Inference

```
+--------------------------------------------------------------+
|              REVERSE PRD - INFERENCE                            |
+--------------------------------------------------------------+
| Inferring requirements from code...                            |
+--------------------------------------------------------------+
```

**Inference Rules:**

| Code Pattern | Inferred Requirement |
|-------------|---------------------|
| Auth middleware / JWT | User authentication required |
| Role-based guards | Authorization with roles |
| CRUD controllers | Data management features |
| File upload handlers | Document/media management |
| Email services | Notification system |
| Payment gateway | Payment processing |
| Export endpoints | Reporting/export features |
| Search/filter logic | Search and filtering |
| Pagination | Large dataset handling |
| Cache layers | Performance requirements |
| Queue workers | Async processing requirements |
| Rate limiting | API protection requirements |

**Persona Inference from Auth Patterns:**

| Auth Pattern | Inferred Persona |
|-------------|-----------------|
| `ROLE_ADMIN` | Administrator persona |
| `ROLE_USER` | Standard user persona |
| `ROLE_MANAGER` | Manager/supervisor persona |
| Public endpoints (no auth) | Anonymous/visitor persona |
| API key auth | External system/integration persona |

**NFR Inference from Infrastructure:**

| Infrastructure | Inferred NFR |
|---------------|-------------|
| Docker / Kubernetes | Scalability, containerization |
| Redis / Memcached | Performance caching requirements |
| Queue system (RabbitMQ, etc.) | Async processing, reliability |
| CI/CD pipelines | Deployment automation |
| Load balancer config | High availability |
| SSL/TLS configuration | Security requirements |
| Logging stack (ELK, etc.) | Monitoring requirements |

### Step 4: PRD Generation

```
+--------------------------------------------------------------+
|              REVERSE PRD - GENERATION                          |
+--------------------------------------------------------------+
| Generating DRAFT PRD...                                        |
+--------------------------------------------------------------+
```

**Generate the PRD with the following sections:**

1. **Executive Summary** -- `INFERRED`
   - Project name and description from README/code
   - Technology stack summary
   - Estimated scope and complexity

2. **Problem Statement** -- `INFERRED`
   - Inferred from domain model and business logic
   - Marked for human validation

3. **Goals & Metrics** -- `PLACEHOLDER`
   - Cannot be reliably inferred from code
   - Placeholder section requiring human input

4. **Target Users / Personas** -- `INFERRED`
   - Generated from authentication and authorization patterns
   - Each persona marked as draft

5. **Functional Requirements** -- `INFERRED`
   - One requirement per feature/endpoint group
   - Prioritized by code complexity and usage patterns
   - Each tagged with source module

6. **Non-Functional Requirements** -- `INFERRED`
   - Inferred from infrastructure and configuration
   - Performance, security, scalability sections

7. **Scope & Constraints** -- `INFERRED`
   - Current scope from implemented features
   - Technical constraints from stack choices

8. **Risks & Mitigations** -- `INFERRED`
   - Technical debt indicators
   - Missing test coverage areas
   - Dependency risks

**Every inferred section includes the marker:**
```
> INFERRED -- This section was generated by analyzing the existing codebase.
> Human validation is required before treating this as an authoritative requirement.
```

### Step 5: Human Validation

```
+--------------------------------------------------------------+
|              REVERSE PRD - VALIDATION                          |
+--------------------------------------------------------------+
| DRAFT PRD generated. Human validation required.                |
+--------------------------------------------------------------+
```

**Present the draft to the user for validation:**
1. Display a summary of all inferred sections
2. Highlight sections with low confidence
3. Identify sections that could not be inferred (Goals, Metrics)
4. Ask the user to validate, correct, or expand each section
5. Iterate until the user is satisfied

## Output Format

```
project-management/
+-- prd.md                       # Generated DRAFT PRD
+-- analysis/
    +-- reverse-engineering.md   # Analysis notes and confidence levels
```

**PRD Header:**

```
+==============================================================+
|                 REVERSE-ENGINEERED PRD (DRAFT)                 |
+==============================================================+
| Project: {name}                                                |
| Source: Codebase analysis                                      |
| Status: DRAFT - Requires human validation                      |
| Generated: {date}                                              |
+==============================================================+
| Confidence Levels:                                             |
| - Executive Summary:       HIGH                                |
| - Problem Statement:       MEDIUM                              |
| - Goals & Metrics:         LOW (placeholder)                   |
| - Personas:                MEDIUM                              |
| - Functional Requirements: HIGH                                |
| - Non-Functional Reqs:     MEDIUM                              |
| - Scope & Constraints:     HIGH                                |
| - Risks:                   MEDIUM                              |
+==============================================================+
```

## Example Session

```
User: /project:reverse-prd

Claude: Starting reverse PRD generation...

[Loading Scan]
Loaded scan report: project-management/scan-report.md
Stack: Symfony 7.2 / PHP 8.4
Modules: 5 bounded contexts, 23 endpoints, 8 entities

[Business Analysis]
Analyzing domain events... Found 12 event types
Analyzing use cases... Found 18 command/query handlers
Analyzing validation rules... Found 35 constraint annotations
Analyzing auth patterns... Found 3 role types (ADMIN, MANAGER, USER)

[Inference]
Inferred 3 personas from auth patterns
Inferred 14 functional requirements from endpoints
Inferred 6 non-functional requirements from infrastructure

[Generation]
DRAFT PRD generated: project-management/prd.md

Summary:
- 3 personas (Admin, Manager, User) -- INFERRED
- 14 functional requirements across 5 modules -- INFERRED
- 6 non-functional requirements -- INFERRED
- Goals & Metrics -- PLACEHOLDER (needs human input)

Sections requiring your attention:
1. Goals & Metrics (could not be inferred)
2. Problem Statement (low confidence)
3. Persona details (names, demographics)

Would you like to:
1. Review and validate each section interactively?
2. Focus on a specific section first?
3. Export the draft as-is and refine later?
```

## Related Commands

- `/project:scan` - Scan codebase (prerequisite)
- `/project:reverse-stories` - Generate user stories from codebase
- `/project:gap-analysis` - Compare spec vs code
- `/project:generate-prd` - Generate PRD interactively (greenfield)
- `/project:generate-backlog` - Create SCRUM backlog from PRD
