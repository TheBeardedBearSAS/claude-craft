# Agents Reference

Claude Code agents are AI personas with specialized expertise. They provide focused assistance for specific domains and tasks.

## How to Use Agents

In Claude Code, mention an agent to activate its expertise:

```
@api-designer Help me design a REST API for user management
@tdd-coach Guide me through fixing this bug with TDD
@symfony-reviewer Review this controller for best practices
```

## Common Agents (11)

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

## Technology-Specific Agents (5)

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

## Agent Count

| Category | Unique Agents | With i18n (×5 languages) |
|----------|---------------|--------------------------|
| Common | 11 | 55 |
| Technology Reviewers | 5 | 25 |
| Docker/Infrastructure | 5 | 25 |
| Project | 2 | 10 |
| **Total** | **23** | **115** |

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

## Best Practices

1. **Be specific** - Tell the agent exactly what you need
2. **Provide context** - Share relevant code and requirements
3. **Use appropriate agent** - Match agent expertise to your task
4. **Combine when needed** - Multiple agents for complex tasks
5. **Follow suggestions** - Agents provide guidance, not just answers
