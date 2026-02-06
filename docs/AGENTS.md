# Agents Reference

Claude Code agents are AI personas with specialized expertise. They provide focused assistance for specific domains and tasks.

## How to Use Agents

In Claude Code, mention an agent to activate its expertise:

```
@api-designer Help me design a REST API for user management
@tdd-coach Guide me through fixing this bug with TDD
@symfony-reviewer Review this controller for best practices
```

## Common Agents (13)

These agents are installed with `install-common` and are useful across all technologies.

### api-designer

**Expertise**: REST/GraphQL API design

Helps with:
- API endpoint design
- Resource naming conventions
- HTTP methods and status codes
- Request/response schemas
- API versioning strategies
- OpenAPI/Swagger documentation
- GraphQL schema design

```
@api-designer Design endpoints for a booking system
@api-designer Should this be REST or GraphQL?
```

---

### database-architect

**Expertise**: Database design and optimization

Helps with:
- Schema design and normalization
- Index optimization
- Query performance analysis
- Migration strategies
- Data modeling (relational, document, graph)
- Partitioning and sharding
- Backup and recovery strategies

```
@database-architect Review this schema for e-commerce
@database-architect How to optimize this slow query?
```

---

### devops-engineer

**Expertise**: Infrastructure, CI/CD, deployment

Helps with:
- Docker and containerization
- CI/CD pipeline design
- Kubernetes deployments
- Cloud infrastructure (AWS, GCP, Azure)
- Monitoring and logging
- Security best practices
- Infrastructure as Code

```
@devops-engineer Set up GitHub Actions for this project
@devops-engineer Optimize this Dockerfile
```

---

### performance-auditor

**Expertise**: Performance analysis and optimization

Helps with:
- Performance profiling
- Bottleneck identification
- Memory optimization
- CPU optimization
- Caching strategies
- Load testing recommendations
- Performance budgets

```
@performance-auditor This page loads slowly, help me diagnose
@performance-auditor Review this code for performance issues
```

---

### refactoring-specialist

**Expertise**: Safe code refactoring

Helps with:
- Identifying code smells
- Refactoring patterns
- Step-by-step refactoring plans
- Preserving behavior during changes
- Legacy code modernization
- Design pattern application
- Technical debt reduction

```
@refactoring-specialist How to refactor this god class?
@refactoring-specialist Plan to modernize this legacy module
```

---

### research-assistant

**Expertise**: Technical research and documentation

Helps with:
- Library comparisons
- Best practices research
- Documentation lookup
- Technology evaluation
- Trend analysis
- Solution recommendations
- Learning resources

```
@research-assistant Compare Zustand vs Redux for this use case
@research-assistant What's the best testing library for React?
```

---

### tdd-coach

**Expertise**: Test-Driven Development and BDD

Helps with:
- TDD methodology (Red-Green-Refactor)
- Test-first development
- Behavior-Driven Development
- Writing effective tests
- Test coverage strategies
- Mocking and stubbing
- Bug fixing with TDD approach

```
@tdd-coach Guide me through TDD for this feature
@tdd-coach Help me write a failing test for this bug
```

---

### uiux-orchestrator

**Expertise**: UI/UX coordination and orchestration

Coordinates three specialized experts (UI Designer, UX Ergonome, Accessibility Expert) to deliver comprehensive UI/UX solutions. Acts as project manager for interface design tasks.

Helps with:
- Routing requests to appropriate UI/UX experts
- Coordinating multi-expert responses
- Synthesizing recommendations
- Arbitrating conflicts (A11y > UX > UI)
- Ensuring Lighthouse 100/100 compliance

```
@uiux-orchestrator Design a complete login flow
@uiux-orchestrator Review this component for UI, UX, and accessibility
```

---

### ui-designer

**Expertise**: Design systems and visual design

Specializes in creating scalable, consistent, and beautiful interfaces through design tokens and component specifications.

Helps with:
- Design token definition (colors, typography, spacing, shadows)
- Component specifications (states, variants, responsive)
- Grid systems and layouts
- Design system architecture
- Atomic Design patterns
- Mobile-first responsive design

```
@ui-designer Create design tokens for a new project
@ui-designer Specify a Button component with all variants
```

---

### ux-ergonome

**Expertise**: User experience and cognitive ergonomics

Focuses on creating intuitive, efficient, and delightful user journeys based on cognitive psychology and UX research.

Helps with:
- Information architecture
- User flow design
- Cognitive load optimization
- Fitts' Law and Hick's Law application
- Nielsen's usability heuristics
- Form design and error handling
- Micro-interactions

```
@ux-ergonome Design the checkout flow for an e-commerce site
@ux-ergonome Analyze this form for usability issues
```

---

### accessibility-expert

**Expertise**: WCAG 2.2 AAA accessibility

Ensures interfaces are accessible to all users, including those using assistive technologies. Non-negotiable accessibility compliance is the priority.

Helps with:
- WCAG 2.2 AAA compliance
- ARIA attributes and patterns (APG)
- Keyboard navigation
- Screen reader announcements
- Color contrast validation
- Touch target sizing
- Accessibility audits

```
@accessibility-expert Audit this page for WCAG 2.2 AAA
@accessibility-expert Specify ARIA attributes for a modal dialog
```

---

### ralph-conductor

**Expertise**: Continuous AI agent loop orchestration

Orchestrates Ralph Wiggum sessions - running Claude in a continuous loop until task completion with Definition of Done (DoD) validation.

Helps with:
- Ralph session management
- Definition of Done configuration
- Iteration progress tracking
- Circuit breaker monitoring
- TDD cycle guidance (RED → GREEN → REFACTOR)
- Task decomposition for iterative completion

```
@ralph-conductor Set up a Ralph session with TDD DoD
@ralph-conductor Configure DoD for this feature implementation
```

**DoD Validator Types:**
| Type | Description |
|------|-------------|
| `command` | Run shell commands (tests, lint, build) |
| `output_contains` | Check Claude output for patterns |
| `file_changed` | Verify files were modified |
| `hook` | Integrate with existing hooks |
| `human` | Interactive manual validation |

---

### workflow-orchestrator

**Expertise**: Workflow orchestration

Manages multi-phase development workflows and coordinates transitions between workflow phases.

Helps with:
- Workflow initialization and configuration
- Phase transition management
- Progress tracking across workflow phases

```
@workflow-orchestrator Initialize a standard workflow for this project
@workflow-orchestrator What's the current workflow status?
```

---

## Technology Reviewers (10)

Each technology has a specialized reviewer agent.

### symfony-reviewer

**Expertise**: Symfony/PHP code review

Focuses on:
- Clean Architecture compliance
- Domain-Driven Design patterns
- Symfony best practices
- Doctrine ORM usage
- API Platform integration
- Security (OWASP)
- Performance optimization

```
@symfony-reviewer Review this service class
@symfony-reviewer Is this aggregate root correct?
```

---

### flutter-reviewer

**Expertise**: Flutter/Dart code review

Focuses on:
- Flutter architecture patterns
- BLoC/Riverpod state management
- Widget composition
- Performance optimization
- Platform-specific code
- Testing strategies
- Material/Cupertino guidelines

```
@flutter-reviewer Review this widget for performance
@flutter-reviewer Is this BLoC implementation correct?
```

---

### python-reviewer

**Expertise**: Python code review

Focuses on:
- Pythonic code patterns
- Type hints and typing
- Async/await best practices
- FastAPI/Django patterns
- Testing with pytest
- Code organization
- Performance optimization

```
@python-reviewer Review this FastAPI endpoint
@python-reviewer Check this async code for issues
```

---

### react-reviewer

**Expertise**: React/TypeScript code review

Focuses on:
- React patterns and hooks
- State management
- Performance optimization
- Accessibility (a11y)
- Testing with Jest/Testing Library
- TypeScript best practices
- Component composition

```
@react-reviewer Review this custom hook
@react-reviewer Check this component for re-renders
```

---

### reactnative-reviewer

**Expertise**: React Native code review

Focuses on:
- React Native architecture
- Navigation patterns
- Native module integration
- Platform-specific code
- Performance optimization
- App store requirements
- Mobile-specific security

```
@reactnative-reviewer Review this screen component
@reactnative-reviewer Check this native bridge code
```

---

### angular-reviewer

**Expertise**: Angular/TypeScript code review

Focuses on:
- Angular architecture patterns
- Signals and standalone components
- RxJS best practices
- TypeScript strict mode
- Performance optimization
- Testing with Jasmine/Karma

```
@angular-reviewer Review this component for Angular 19 best practices
@angular-reviewer Check this signal implementation
```

---

### laravel-reviewer

**Expertise**: Laravel/PHP code review

Focuses on:
- Laravel architecture patterns
- Eloquent ORM best practices
- Actions pattern
- Security (Sanctum, policies)
- Testing with Pest PHP
- Performance optimization

```
@laravel-reviewer Review this controller for best practices
@laravel-reviewer Check this Eloquent query for N+1 issues
```

---

### vuejs-reviewer

**Expertise**: Vue.js/TypeScript code review

Focuses on:
- Composition API patterns
- Pinia state management
- TypeScript integration
- Performance optimization
- Security (XSS prevention)
- Testing with Vitest

```
@vuejs-reviewer Review this composable
@vuejs-reviewer Check this component for reactivity issues
```

---

### csharp-reviewer

**Expertise**: C#/.NET code review

Focuses on:
- Clean Architecture compliance
- CQRS/MediatR patterns
- Entity Framework Core
- SOLID principles
- Security (OWASP)
- Testing with xUnit

```
@csharp-reviewer Review this handler for Clean Architecture compliance
@csharp-reviewer Check this EF Core query for performance
```

---

### php-reviewer

**Expertise**: PHP/Clean Architecture code review

Focuses on:
- Clean Architecture compliance
- PSR-12 standards
- PHPStan level 9
- Domain-Driven Design
- Security audit
- Testing with Pest PHP

```
@php-reviewer Audit this domain layer
@php-reviewer Check this code for security vulnerabilities
```

---

## Docker/Infrastructure Agents (5)

Available with `install-infra`.

### docker-dockerfile

**Expertise**: Dockerfile creation and optimization

Specializes in creating optimized, secure, and production-ready Dockerfiles using best practices.

Helps with:
- Multi-stage build optimization
- Layer caching strategies
- Image size reduction (≥30% target)
- Security hardening (non-root users)
- Build argument management
- Health check configuration
- Best practices compliance

```
@docker-dockerfile Optimize this Dockerfile for production
@docker-dockerfile Review my multi-stage build
```

---

### docker-compose

**Expertise**: Docker Compose orchestration

Expert in designing and configuring multi-service Docker environments with proper networking, volumes, and dependencies.

Helps with:
- Service orchestration
- Network segmentation (frontend, backend, data)
- Volume management and persistence
- Health checks and dependencies
- Environment-specific overrides (dev, staging, prod)
- Secrets management
- Resource limits configuration

```
@docker-compose Design a compose file for this microservices stack
@docker-compose Help configure service dependencies
```

---

### docker-debug

**Expertise**: Docker troubleshooting and diagnostics

Specializes in diagnosing and resolving Docker issues across containers, images, networks, and resources.

Helps with:
- Container startup failures
- Network connectivity issues
- Volume and permissions problems
- Resource exhaustion diagnosis
- Log analysis and debugging
- Performance profiling
- Health check debugging

```
@docker-debug Container keeps restarting, help me diagnose
@docker-debug Network connection refused between services
```

---

### docker-cicd

**Expertise**: Docker CI/CD pipelines

Expert in designing and implementing CI/CD pipelines for containerized applications.

Helps with:
- GitHub Actions workflows
- GitLab CI pipelines
- Image building and caching
- Security scanning (Trivy, Snyk)
- Multi-environment deployments
- Rolling updates, blue-green, canary strategies
- Registry management

```
@docker-cicd Create a GitHub Actions pipeline for this app
@docker-cicd Set up automated image scanning
```

---

### docker-architect

**Expertise**: Docker architecture design

Senior architect specializing in designing complete containerized architectures from project specifications.

Helps with:
- Service topology design
- Network segmentation strategy
- Data persistence architecture
- Scaling strategies
- Security architecture
- Multi-environment setup
- Infrastructure as Code

```
@docker-architect Design the Docker architecture for this e-commerce platform
@docker-architect Review our microservices container strategy
```

---

## BMAD v6 Agents (10)

Available with BMAD v6 framework installation. These agents follow the Agent-as-Code YAML format.

### bmad-master

**Expertise**: BMAD methodology orchestration

Central coordinator for the BMAD (Build, Measure, Analyze, Deliver) methodology. Manages agent interactions, workflow routing, and quality gate enforcement.

Helps with:
- Orchestrating agent interactions and handoffs
- Managing sprint lifecycle and transitions
- Enforcing quality gates at each phase
- Coordinating batch processing operations
- Providing project-wide visibility and metrics

```
@bmad-master Initialize BMAD for this project
@bmad-master Route this work to the appropriate agent
```

**Key Commands**: `/bmad:init`, `/bmad:status`, `/bmad:route`, `/bmad:handoff`

---

### pm (Product Manager)

**Expertise**: Product strategy and PRD creation

Experienced product manager focused on delivering value to users. Expert in product discovery, market analysis, and strategic planning.

Helps with:
- Define product vision and strategy
- Create Product Requirements Documents (PRD)
- Prioritize features (RICE, MoSCoW)
- Conduct market analysis
- Define success metrics and KPIs

```
@pm Create a PRD for user authentication
@pm Prioritize these features for the next quarter
```

**Key Commands**: `/pm:prd`, `/pm:vision`, `/pm:roadmap`, `/pm:prioritize`, `/pm:okr`

**Quality Gate**: PRD Gate (≥80%)

---

### ba (Business Analyst)

**Expertise**: Requirements engineering and documentation

Expert in requirements gathering, analysis, and documentation. Bridge between business stakeholders and technical teams.

Helps with:
- Gather and analyze business requirements
- Document functional specifications
- Create use cases and user story maps
- Perform gap analysis
- Validate requirements with stakeholders

```
@ba Analyze requirements for the payment module
@ba Create a user story map for checkout flow
```

**Key Commands**: `/ba:analyze`, `/ba:use-cases`, `/ba:story-map`, `/ba:gap-analysis`, `/ba:requirements`

---

### architect (System Architect)

**Expertise**: Technical architecture and design

Expert in Clean Architecture, DDD, and API design. Pragmatic approach focused on maintainability and scalability.

Helps with:
- Design system architecture from PRD
- Create Technical Specifications
- Define API contracts
- Design database schemas
- Document architectural decisions (ADRs)
- Review code for architectural compliance

```
@architect Design the architecture for this feature
@architect Create an ADR for choosing JWT over sessions
```

**Key Commands**: `/arch:design`, `/arch:techspec`, `/arch:adr`, `/arch:api`, `/arch:database`, `/arch:security`

**Quality Gate**: Tech Spec Gate (≥90%)

---

### po (Product Owner)

**Expertise**: Backlog management and sprint prioritization

Voice of the customer and guardian of the product backlog. Expert in prioritization and value delivery.

Helps with:
- Own and prioritize product backlog
- Write and refine user stories
- Define acceptance criteria
- Accept or reject completed work
- Plan releases

```
@po Prioritize this backlog for the next sprint
@po Review and accept US-005
```

**Key Commands**: `/po:prioritize`, `/po:refine`, `/po:accept`, `/po:reject`, `/po:release`

---

### sm (Scrum Master)

**Expertise**: Agile facilitation and team coordination

Servant leader facilitating agile practices and removing impediments. Expert in Scrum framework and continuous improvement.

Helps with:
- Facilitate sprint ceremonies
- Track sprint progress and velocity
- Remove impediments
- Coach team on agile practices
- Drive continuous improvement

```
@sm Plan sprint 3 with the team
@sm Run the sprint retrospective
```

**Key Commands**: `/sm:plan-sprint`, `/sm:daily`, `/sm:review`, `/sm:retro`, `/sm:velocity`, `/sm:burndown`

---

### dev (Developer)

**Expertise**: TDD implementation and clean code

Experienced developer following TDD and Clean Code principles. Expert in multiple technology stacks with focus on quality.

Helps with:
- Implement features following TDD
- Write clean, maintainable code
- Participate in code reviews
- Refactor for quality

```
@dev Implement US-005 using TDD
@dev Refactor this service for better testability
```

**Key Commands**: `/dev:implement`, `/dev:tdd`, `/dev:test`, `/dev:refactor`, `/dev:review`, `/dev:fix`

**TDD Phases**: 🔴 Red (write failing test) → 🟢 Green (implement) → 🔵 Refactor (clean up)

---

### qa (QA Engineer)

**Expertise**: Quality assurance and test automation

Quality advocate ensuring software meets requirements and standards. Expert in testing strategies and automation.

Helps with:
- Define test strategy
- Validate acceptance criteria
- Automate test suites
- Perform exploratory testing
- Track quality metrics

```
@qa Validate acceptance criteria for US-005
@qa Create automated tests for the login flow
```

**Key Commands**: `/qa:strategy`, `/qa:validate`, `/qa:automate`, `/qa:explore`, `/qa:report`, `/qa:bug`

---

### qa-recette (QA Recette Engineer) - NEW

**Expertise**: Automated acceptance testing via Claude in Chrome

Specialized in browser-based acceptance testing with automatic regression test generation. Implements the **Golden Rule**: A fixed bug should NEVER reappear.

Helps with:
- Execute automated acceptance tests via browser
- Generate comprehensive test plans from AC
- Detect and classify errors
- Generate regression tests from errors (Unit, Functional, Behat)
- Maintain regression test registry
- Produce test reports with traceability
- Enable session recovery for interrupted tests

```
@qa-recette Run acceptance tests for US-001
@qa-recette Generate regression tests for detected errors
```

**Key Commands**: `/qa:recette`, `/qa:recette-fix`, `/qa:recette-status`, `/qa:recette-regression`, `/qa:recette-report`

**Chrome Capabilities**:
- Navigation: navigate, back, forward, refresh
- Interaction: click, type, fill_form, scroll, hover
- Reading: DOM state, element text, attributes
- Debugging: Console logs, network requests, errors
- Capture: Screenshot, GIF recording

**Error Classification**:
| Type | Generated Tests |
|------|-----------------|
| Visual/UI | Behat feature |
| Interaction | Behat + Functional |
| Validation | Unit + Functional |
| Logic | Unit test |
| Security | Functional + Unit |
| API | Functional test |

---

### ux (UX Designer)

**Expertise**: User experience and accessibility

User advocate focused on creating intuitive, accessible experiences. Expert in user research and interaction design.

Helps with:
- Conduct user research
- Create user personas and journeys
- Design wireframes and prototypes
- Ensure accessibility compliance (WCAG 2.1 AA)
- Validate designs with users

```
@ux Design the user journey for onboarding
@ux Audit this page for accessibility
```

**Key Commands**: `/ux:research`, `/ux:persona`, `/ux:journey`, `/ux:wireframe`, `/ux:flow`, `/ux:accessibility`

---

## Project Agents (2)

Available with `install-project-commands`.

### product-owner

**Expertise**: Product management (CSPO certified)

Helps with:
- User story writing
- Backlog prioritization
- Acceptance criteria
- Sprint planning
- Stakeholder communication
- Value assessment
- Release planning

```
@product-owner Help me write user stories for this feature
@product-owner Prioritize this backlog
```

---

### tech-lead

**Expertise**: Technical leadership (CSM certified)

Helps with:
- Technical task decomposition
- Architecture decisions
- Sprint estimation
- Technical debt management
- Team coordination
- Risk assessment
- Quality standards

```
@tech-lead Decompose this epic into tasks
@tech-lead Estimate this sprint backlog
```

---

## Agent Combinations

Agents can be used together for comprehensive assistance:

```
# API design + database
@api-designer @database-architect Design a REST API with proper data model

# Code review + performance
@symfony-reviewer @performance-auditor Review this controller for quality and performance

# TDD + specific tech
@tdd-coach @react-reviewer Help me TDD this React component
```

## Agent Frontmatter Format

All agents include YAML frontmatter for Claude Code discovery:

```markdown
---
name: agent-name
description: Brief description of the agent's expertise and when to use it
---

# Agent Title

Agent content...
```

### Frontmatter Fields

| Field | Required | Description |
|-------|----------|-------------|
| `name` | Yes | Agent identifier (used with @mention) |
| `description` | Yes | Brief description shown in agent discovery |
| `memory` | No | Memory scope: `user`, `project`, or `local` (v2.1.33+) |
| `tools` | No | Tool restrictions including `Task(agent_type)` (v2.1.33+) |

### Example

```markdown
---
name: api-designer
description: Expert in REST/GraphQL API design. Use for endpoint design, resource naming, and API documentation.
---

# API Designer

## Identity
- **Role**: API Architect
- **Expertise**: REST, GraphQL, OpenAPI

## Capabilities
- Design RESTful endpoints
- Schema definition
- API versioning strategies
...
```

---

## Agent Memory Frontmatter (v2.1.33+)

Agents can now persist memory across sessions using the `memory` field in frontmatter:

```yaml
---
name: my-agent
description: My specialized agent
memory: user
---
```

### Memory Scopes

| Scope | Location | Shared via VCS | Use Case |
|-------|----------|----------------|----------|
| `user` | `~/.claude/agent-memory/<name>/` | No | Cross-project learnings (recommended) |
| `project` | `.claude/agent-memory/<name>/` | Yes | Project-specific knowledge |
| `local` | `.claude/agent-memory-local/<name>/` | No | Local-only project knowledge |

## Agent Type Restrictions (v2.1.33+)

Control which sub-agent types an agent can spawn using `Task(agent_type)` syntax in the `tools` frontmatter:

```yaml
---
name: research-only-agent
tools:
  - Task(Explore)
  - Task(Plan)
  - Read
  - Grep
  - Glob
---
```

This restricts the agent to only spawn `Explore` and `Plan` sub-agents, preventing it from spawning `general-purpose` or `Bash` agents.

---

## Agent Count

| Category | Unique Agents | With i18n (×5 languages) |
|----------|---------------|--------------------------|
| Common | 11 | 55 |
| Technology Reviewers | 5 | 25 |
| Docker/Infrastructure | 5 | 25 |
| **BMAD v6** | **10** | **10** (YAML format) |
| Project | 2 | 10 |
| **Total** | **33** | **125** |

---

## Creating Custom Agents

You can create your own agents by adding markdown files to `.claude/agents/`:

```markdown
---
name: my-custom-agent
description: Expert in [domain]. Use when [context].
---

# My Custom Agent

## Identity
- **Name**: Custom Agent
- **Expertise**: Your domain

## Capabilities
What this agent can do...

## Methodology
How this agent approaches problems...
```

## Agent Behavior in Autonomous Mode

When running with the Autonomous Sprint Conductor (ASC), agents adapt their behavior to minimize human intervention while maintaining quality.

### @ralph-conductor in ASC Mode

The `@ralph-conductor` agent operates differently in autonomous mode:

| Behavior | Interactive Mode | Autonomous Mode |
|----------|-----------------|-----------------|
| Story claiming | Manual confirmation | Auto-claim next ready |
| Circuit breaker | Hard stop | Recovery engine attempt |
| TDD transitions | User validates | Auto-detect phase completion |
| Error handling | Ask user | Classify → auto-fix or escalate |
| Progress reporting | Real-time | Logged to metrics file |

**Autonomous-specific capabilities:**
- Monitors stop conditions (time window, max stories, failures)
- Creates checkpoints for session recovery
- Manages parallel session coordination
- Aggregates metrics across stories

```
@ralph-conductor Start autonomous sprint for Sprint 3
```

### BMAD Agents Auto-Escalation

In autonomous mode, BMAD agents follow escalation protocols:

| Agent | Auto-Escalate When | Default Action |
|-------|-------------------|----------------|
| `@dev` | Security vulnerabilities, architecture violations | Block + escalate |
| `@qa` | Critical test failures (>20%), security tests fail | Block + escalate |
| `@architect` | Breaking changes, API contract violations | Block + escalate |
| `@po` | Scope creep detected, unclear acceptance criteria | Pause + clarify |
| `@sm` | Sprint scope exceeded, blockers accumulating | Notify + continue |

**Escalation flow:**
```
Agent detects issue → Classify severity → Auto-fix attempt →
  ├─ Success: Continue
  └─ Failure: Create escalation → Apply timeout → Default action
```

### Timeouts and Fallbacks

| Operation | Timeout | Fallback |
|-----------|---------|----------|
| Story processing | 30 min | Escalate as blocked |
| Quality gate retry | 3 attempts | Skip with warning |
| Auto-fix attempt | 5 min | Escalate to recovery |
| Escalation resolution | 4 hours | Apply default action |
| Parallel session sync | 2 min | Continue independently |

**Configuring timeouts:**
```yaml
# ralph-autonomous.yml
autonomous:
  timeouts:
    story_processing_minutes: 30
    gate_retry_attempts: 3
    autofix_minutes: 5
    escalation_hours: 4
```

### Agent Communication in Parallel Mode

When multiple stories process in parallel, agents maintain isolation:

- Each story gets a dedicated agent context
- No shared state between parallel sessions
- Dependency conflicts detected by parallel manager
- Resource contention triggers automatic throttling

---

## Best Practices

1. **Be specific** - Tell the agent exactly what you need
2. **Provide context** - Share relevant code and requirements
3. **Use appropriate agent** - Match agent expertise to your task
4. **Combine when needed** - Multiple agents for complex tasks
5. **Follow suggestions** - Agents provide guidance, not just answers
