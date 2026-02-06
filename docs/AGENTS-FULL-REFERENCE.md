# Agents Full Reference

Complete reference for all 40 agents available in Claude Craft.

---

## Quick Reference

| Category | Count | Examples |
|----------|-------|----------|
| Common | 13 | @api-designer, @tdd-coach, @uiux-orchestrator |
| Technology Reviewers | 10 | @symfony-reviewer, @react-reviewer |
| Docker/Infrastructure | 5 | @docker-architect, @docker-debug |
| BMAD v6 | 10 | @bmad-master, @pm, @dev, @qa-recette |
| Project | 2 | @product-owner, @tech-lead |

---

## How to Use Agents

```
@agent-name Your request here
```

### Multiple Agents

```
@tdd-coach @react-reviewer Help me TDD this component
```

### With Commands

```
@dev Implement the following:
/sprint:next-story --claim
```

---

## Common Agents (13)

### @api-designer

**Expertise:** REST/GraphQL API design

**Use when:**
- Designing new APIs
- API versioning decisions
- Request/response schemas
- OpenAPI documentation

**Example prompts:**
```
@api-designer Design REST endpoints for user management
@api-designer Should this be REST or GraphQL?
@api-designer Create OpenAPI spec for the orders API
```

---

### @database-architect

**Expertise:** Database design and optimization

**Use when:**
- Schema design
- Query optimization
- Index strategies
- Migration planning

**Example prompts:**
```
@database-architect Design schema for e-commerce orders
@database-architect Optimize this slow query
@database-architect Plan migration for splitting the users table
```

---

### @devops-engineer

**Expertise:** CI/CD, Docker, deployment

**Use when:**
- Setting up pipelines
- Docker configuration
- Cloud infrastructure
- Monitoring setup

**Example prompts:**
```
@devops-engineer Set up GitHub Actions for this project
@devops-engineer Optimize this Dockerfile
@devops-engineer Design monitoring strategy
```

---

### @performance-auditor

**Expertise:** Performance analysis and optimization

**Use when:**
- Diagnosing slowness
- Memory optimization
- Caching strategies
- Load testing

**Example prompts:**
```
@performance-auditor This page loads slowly, help diagnose
@performance-auditor Review this code for performance issues
@performance-auditor Design caching strategy for API responses
```

---

### @refactoring-specialist

**Expertise:** Safe code refactoring

**Use when:**
- Code smells detected
- Legacy modernization
- Design pattern application
- Technical debt reduction

**Example prompts:**
```
@refactoring-specialist How to refactor this god class?
@refactoring-specialist Plan to modernize this legacy module
@refactoring-specialist Apply repository pattern here
```

---

### @research-assistant

**Expertise:** Technical research and documentation

**Use when:**
- Library comparisons
- Technology evaluation
- Best practices research
- Learning resources

**Example prompts:**
```
@research-assistant Compare Zustand vs Redux for this use case
@research-assistant What's the best testing library for React?
@research-assistant Research authentication options for mobile apps
```

---

### @tdd-coach

**Expertise:** Test-Driven Development

**Use when:**
- Learning TDD
- Writing tests first
- Bug fixing with tests
- Testing strategies

**Example prompts:**
```
@tdd-coach Guide me through TDD for this feature
@tdd-coach Help me write a failing test for this bug
@tdd-coach What testing strategy for this module?
```

---

### @uiux-orchestrator

**Expertise:** UI/UX coordination

**Use when:**
- Need combined UI + UX + A11y expertise
- Comprehensive interface design
- Coordinating design decisions

**Example prompts:**
```
@uiux-orchestrator Design a complete login flow
@uiux-orchestrator Review this component for UI, UX, and accessibility
```

---

### @ui-designer

**Expertise:** Design systems and visual design

**Use when:**
- Design tokens
- Component specifications
- Grid systems
- Visual consistency

**Example prompts:**
```
@ui-designer Create design tokens for a new project
@ui-designer Specify a Button component with all variants
@ui-designer Design the grid system for this app
```

---

### @ux-ergonome

**Expertise:** User experience and cognitive ergonomics

**Use when:**
- User flow design
- Form optimization
- Information architecture
- Usability issues

**Example prompts:**
```
@ux-ergonome Design the checkout flow for e-commerce
@ux-ergonome Analyze this form for usability issues
@ux-ergonome Optimize the navigation for mobile
```

---

### @accessibility-expert

**Expertise:** WCAG 2.2 AAA accessibility

**Use when:**
- Accessibility audits
- ARIA implementation
- Keyboard navigation
- Screen reader compatibility

**Example prompts:**
```
@accessibility-expert Audit this page for WCAG 2.2 AAA
@accessibility-expert Specify ARIA attributes for a modal dialog
@accessibility-expert Review color contrast in this design
```

---

### @ralph-conductor

**Expertise:** Continuous AI loop orchestration

**Use when:**
- Setting up Ralph sessions
- Configuring Definition of Done
- Managing iteration cycles

**Example prompts:**
```
@ralph-conductor Set up a Ralph session with TDD DoD
@ralph-conductor Configure DoD for this feature implementation
@ralph-conductor What's the current Ralph iteration status?
```

---

### @workflow-orchestrator

**Expertise:** Workflow orchestration

**Use when:**
- Initializing development workflows
- Coordinating multi-phase projects
- Managing workflow transitions

**Example prompts:**
```
@workflow-orchestrator Initialize a standard workflow for this project
@workflow-orchestrator What's the current workflow status?
@workflow-orchestrator Transition to the design phase
```

---

## Technology Reviewers (10)

### @symfony-reviewer

**Expertise:** Symfony/PHP code review

**Focuses on:**
- Clean Architecture compliance
- DDD patterns
- Symfony best practices
- Doctrine ORM

**Example prompts:**
```
@symfony-reviewer Review this service class
@symfony-reviewer Is this aggregate root correct?
@symfony-reviewer Check this controller for security issues
```

---

### @flutter-reviewer

**Expertise:** Flutter/Dart code review

**Focuses on:**
- BLoC/Riverpod patterns
- Widget composition
- Performance
- Platform-specific code

**Example prompts:**
```
@flutter-reviewer Review this widget for performance
@flutter-reviewer Is this BLoC implementation correct?
@flutter-reviewer Check state management in this feature
```

---

### @react-reviewer

**Expertise:** React/TypeScript code review

**Focuses on:**
- Hooks patterns
- State management
- Accessibility
- Performance

**Example prompts:**
```
@react-reviewer Review this custom hook
@react-reviewer Check this component for re-renders
@react-reviewer Audit accessibility of this form
```

---

### @reactnative-reviewer

**Expertise:** React Native code review

**Focuses on:**
- Navigation patterns
- Native module integration
- Performance
- App store requirements

**Example prompts:**
```
@reactnative-reviewer Review this screen component
@reactnative-reviewer Check this native bridge code
@reactnative-reviewer Optimize this list for performance
```

---

### @python-reviewer

**Expertise:** Python code review

**Focuses on:**
- Pythonic patterns
- Type hints
- Async/await
- FastAPI/Django

**Example prompts:**
```
@python-reviewer Review this FastAPI endpoint
@python-reviewer Check this async code for issues
@python-reviewer Improve type hints in this module
```

---

### @angular-reviewer

**Expertise:** Angular code review

**Focuses on:**
- Signals patterns
- Standalone components
- RxJS usage
- Change detection

**Example prompts:**
```
@angular-reviewer Review this standalone component
@angular-reviewer Check RxJS usage for memory leaks
@angular-reviewer Optimize change detection strategy
```

---

### @laravel-reviewer

**Expertise:** Laravel code review

**Focuses on:**
- Actions pattern
- Pest PHP testing
- Sanctum auth
- Eloquent optimization

**Example prompts:**
```
@laravel-reviewer Review this Action class
@laravel-reviewer Check Eloquent queries for N+1
@laravel-reviewer Audit Sanctum configuration
```

---

### @vuejs-reviewer

**Expertise:** Vue.js code review

**Focuses on:**
- Composition API
- Pinia stores
- Vitest testing
- TypeScript

**Example prompts:**
```
@vuejs-reviewer Review this composable
@vuejs-reviewer Check Pinia store for best practices
@vuejs-reviewer Audit reactivity in this component
```

---

### @csharp-reviewer

**Expertise:** C#/.NET code review

**Focuses on:**
- Clean Architecture
- CQRS patterns
- Entity Framework
- Async/await

**Example prompts:**
```
@csharp-reviewer Review this command handler
@csharp-reviewer Check EF Core queries for performance
@csharp-reviewer Audit this API endpoint for security
```

---

### @php-reviewer

**Expertise:** PHP code review

**Focuses on:**
- PSR-12 compliance
- PHPStan analysis
- Pest PHP testing
- Clean Architecture

**Example prompts:**
```
@php-reviewer Review this use case
@php-reviewer Check for PSR-12 violations
@php-reviewer Audit dependency injection
```

---

## Docker/Infrastructure Agents (5)

### @docker-dockerfile

**Expertise:** Dockerfile optimization

**Use when:**
- Creating Dockerfiles
- Multi-stage builds
- Image size reduction
- Security hardening

**Example prompts:**
```
@docker-dockerfile Optimize this Dockerfile for production
@docker-dockerfile Review my multi-stage build
@docker-dockerfile Reduce image size by 30%
```

---

### @docker-compose

**Expertise:** Docker Compose orchestration

**Use when:**
- Multi-service setup
- Network configuration
- Volume management
- Environment configs

**Example prompts:**
```
@docker-compose Design compose file for microservices
@docker-compose Configure service dependencies
@docker-compose Set up development vs production overrides
```

---

### @docker-debug

**Expertise:** Docker troubleshooting

**Use when:**
- Container won't start
- Network issues
- Permission problems
- Resource exhaustion

**Example prompts:**
```
@docker-debug Container keeps restarting, help diagnose
@docker-debug Network connection refused between services
@docker-debug Why is this container running out of memory?
```

---

### @docker-cicd

**Expertise:** Docker CI/CD pipelines

**Use when:**
- GitHub Actions setup
- GitLab CI pipelines
- Security scanning
- Deployment strategies

**Example prompts:**
```
@docker-cicd Create GitHub Actions pipeline for this app
@docker-cicd Set up automated image scanning
@docker-cicd Implement blue-green deployment
```

---

### @docker-architect

**Expertise:** Docker architecture design

**Use when:**
- Complete Docker strategy
- Service topology
- Scaling strategy
- Multi-environment setup

**Example prompts:**
```
@docker-architect Design Docker architecture for e-commerce platform
@docker-architect Review our microservices container strategy
@docker-architect Plan scaling strategy for production
```

---

## BMAD v6 Agents (10)

### @qa-recette

**Expertise:** Automated Acceptance Testing with Claude in Chrome

**Use when:**
- Running acceptance tests (recette) on web applications
- Validating User Stories, Epics, or Sprints
- Detecting regressions after bug fixes
- Generating regression tests from errors

**Chrome Capabilities:**
- `navigate`, `click`, `type`, `fill_form`, `scroll`
- `read_console_logs`, `get_network_requests`
- `read_dom_state`, `take_screenshot`, `record_gif`

**Key Commands:** `/qa:recette`, `/qa:recette-fix`, `/qa:recette-status`, `/qa:recette-regression`, `/qa:recette-report`

**Golden Rule:** A fixed bug should NEVER reappear - automatic regression suite generation.

**Example prompts:**
```
@qa-recette Run acceptance tests for user story US-001
@qa-recette Check for regressions on the authentication module
@qa-recette Generate regression tests from the login error
```

---

### @bmad-master

**Role:** Central orchestrator

**Use when:**
- Starting BMAD
- Routing work
- Checking status
- Coordinating agents

**Key Commands:** `/bmad:init`, `/bmad:status`, `/bmad:route`

---

### @pm

**Role:** Product Manager

**Use when:**
- Creating PRD
- Defining vision
- Prioritizing features
- Setting metrics

**Key Commands:** `/pm:prd`, `/pm:vision`, `/pm:roadmap`

**Quality Gate:** PRD Gate (≥80%)

---

### @ba

**Role:** Business Analyst

**Use when:**
- Gathering requirements
- Creating use cases
- Story mapping
- Gap analysis

**Key Commands:** `/ba:analyze`, `/ba:use-cases`, `/ba:story-map`

---

### @architect

**Role:** System Architect

**Use when:**
- Designing architecture
- Creating tech specs
- Writing ADRs
- API design

**Key Commands:** `/arch:design`, `/arch:techspec`, `/arch:adr`

**Quality Gate:** Tech Spec Gate (≥90%)

---

### @po

**Role:** Product Owner

**Use when:**
- Backlog management
- Writing stories
- Acceptance criteria
- Accepting work

**Key Commands:** `/po:prioritize`, `/po:refine`, `/po:accept`

---

### @sm

**Role:** Scrum Master

**Use when:**
- Sprint planning
- Running ceremonies
- Tracking velocity
- Removing blockers

**Key Commands:** `/sm:plan-sprint`, `/sm:daily`, `/sm:retro`

---

### @dev

**Role:** Developer

**Use when:**
- TDD implementation
- Code review
- Refactoring
- Bug fixing

**Key Commands:** `/dev:implement`, `/dev:tdd`, `/dev:refactor`

**TDD Phases:** 🔴 Red → 🟢 Green → 🔵 Refactor

---

### @qa

**Role:** QA Engineer

**Use when:**
- Test strategy
- Validating AC
- Test automation
- Quality reporting

**Key Commands:** `/qa:strategy`, `/qa:validate`, `/qa:automate`

---

### @ux

**Role:** UX Designer

**Use when:**
- User research
- Personas/journeys
- Wireframes
- Accessibility

**Key Commands:** `/ux:research`, `/ux:journey`, `/ux:wireframe`

---

## Project Agents (2)

### @product-owner

**Expertise:** Product management (CSPO)

**Use when:**
- Story writing
- Backlog prioritization
- Acceptance criteria
- Release planning

---

### @tech-lead

**Expertise:** Technical leadership (CSM)

**Use when:**
- Task decomposition
- Architecture decisions
- Sprint estimation
- Technical debt

---

## Memory Frontmatter (v2.1.33+)

The `memory` field enables persistent memory for agents across sessions. When enabled, the agent can read and write files in its memory directory, accumulating knowledge over time.

**Syntax:**
```yaml
memory: user    # or project, local
```

**Scope Details:**

| Scope | Directory | In .gitignore | Best For |
|-------|-----------|---------------|----------|
| `user` | `~/.claude/agent-memory/<agent-name>/` | N/A (user home) | Personal learnings, cross-project patterns |
| `project` | `.claude/agent-memory/<agent-name>/` | No (shared) | Team knowledge, project conventions |
| `local` | `.claude/agent-memory-local/<agent-name>/` | Yes | Local experiments, draft notes |

**Example - Research Agent with Memory:**
```yaml
---
name: research-assistant
description: Technical research with persistent knowledge
model: sonnet
memory: user
---
```

The agent will automatically have access to read/write files in `~/.claude/agent-memory/research-assistant/`, allowing it to build up knowledge across sessions.

---

## Agent Type Restrictions (v2.1.33+)

The `tools` frontmatter field now supports `Task(agent_type)` syntax to restrict which sub-agent types an agent can spawn:

```yaml
---
name: safe-researcher
tools:
  - Task(Explore)    # Can spawn Explore agents
  - Task(Plan)       # Can spawn Plan agents
  - Read             # Can read files
  - Grep             # Can search content
  - Glob             # Can find files
  # No Task(Bash) or Task(general-purpose) = cannot spawn those
---
```

**Available agent types for restriction:**
- `Task(Explore)` - Read-only exploration agents
- `Task(Plan)` - Planning agents (read-only)
- `Task(Bash)` - Command execution agents
- `Task(general-purpose)` - Full-capability agents

---

## Creating Custom Agents

Add to `.claude/agents/`:

```markdown
---
name: my-agent
description: Expert in X. Use when Y.
---

# My Agent

## Identity
- **Name**: My Agent
- **Role**: Expert
- **Expertise**: Domain knowledge

## Capabilities
- Capability 1
- Capability 2

## Methodology
How this agent approaches problems...

## Output Format
Expected output structure...
```

---

## Best Practices

1. **Be Specific** - Clear requests get better results
2. **Provide Context** - Share relevant code and requirements
3. **Use Appropriate Agent** - Match expertise to task
4. **Combine When Needed** - Multiple agents for complex tasks
5. **Follow Suggestions** - Agents guide, not just answer

---

## See Also

- [Commands Reference](COMMANDS-FULL-REFERENCE.md)
- [BMAD Practical Guide](BMAD-PRACTICAL-GUIDE.md)
- [Quick Reference](AGENTS.md)
