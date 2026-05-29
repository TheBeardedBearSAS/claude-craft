# Agents Reference

Claude Code agents are AI personas with specialized expertise. They provide focused assistance for specific domains and tasks.

## How to Use Agents

In Claude Code, mention an agent to activate its expertise:

```
@api-designer Help me design a REST API for user management
@tdd-coach Guide me through fixing this bug with TDD
@symfony-reviewer Review this controller for best practices
```

## Common Agents (16)

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

### security-auditor (v7.34)

**Expertise**: OWASP Top 10:2025, SAST, dependency scanning, secrets detection, authZ/authN review

Helps with:
- Code audits (Semgrep, CodeQL, Snyk)
- Dependency CVE scanning (Trivy, Grype)
- Secrets detection (gitleaks, trufflehog)
- JWT / OAuth2 / OIDC review
- Supply chain (SLSA, SBOM, Sigstore)
- Security headers (CSP, HSTS, COOP/COEP/CORP)

```
@security-auditor Audit this authentication flow
@security-auditor Review dependencies for known CVEs
```

---

### data-analyst (v7.34)

**Expertise**: SQL optimization, metrics design, reporting, observability, BI dashboards

Helps with:
- SQL query optimization (EXPLAIN ANALYZE)
- Metrics frameworks (AARRR, HEART, North Star)
- Cohort analysis, retention, LTV, churn
- Data quality audits (NULL rate, freshness)
- dbt / Airflow / Dagster patterns
- BI tools (Metabase, Grafana, Superset)

```
@data-analyst Design metrics for a SaaS product
@data-analyst Optimize this slow query
```

---

### migration-specialist (v7.34)

**Expertise**: Zero-downtime schema changes, data backfills, framework version upgrades, legacy rewrites

Helps with:
- Database migrations (expand-contract pattern)
- Framework upgrades (Symfony, Laravel, React, Angular, Vue)
- Blue-Green / Canary / Feature flags
- Checksums & rollback plans
- Strangler Fig pattern for legacy

```
@migration-specialist Plan a zero-downtime rename of a high-traffic column
@migration-specialist Design a React 18 → 19 migration
```

---

### cost-optimizer (v7.34)

**Expertise**: Cloud FinOps, LLM cost reduction, right-sizing, caching strategies

Helps with:
- Cloud FinOps (AWS/GCP/Azure right-sizing)
- LLM cost (Claude prompt caching, model tiering Haiku/Sonnet/Opus)
- Batch API strategy (50% savings)
- Tagging, showback, budgets, anomaly detection
- Unit economics (cost per user/transaction)

```
@cost-optimizer Audit our LLM spend and recommend savings
@cost-optimizer Right-size our Kubernetes cluster
```

---

## Agent Optimization (v7.28.0)

All 22 common and reviewer agents now include optimized frontmatter:

- **Effort control**: Each agent specifies `effort: low|medium|high|xhigh|max` to optimize reasoning depth (`xhigh`/`max` since Claude Code 2.1.111+/2.1.154 with Opus 4.8)
- **Persistent memory**: 18 agents use `memory: user` or `memory: project` for cross-session knowledge
- **Model distribution** (31 agent files): **5 opus + xhigh** (critical reasoning — database-architect, migration-specialist, ralph-conductor, security-auditor, tdd-coach), **11 sonnet** (standard common agents), **15 haiku + low** (all 11 tech reviewers + accessibility-expert, cost-optimizer, performance-auditor, research-assistant). Opus reserved for high-stakes work; reviewers stay on haiku for cost-efficient read-only review.

## Advanced Frontmatter (Claude Code 2.1.119+)

Two new frontmatter keys are available for agents since Claude Code **v2.1.119+**, enabling per-agent MCP loading and automatic worktree isolation.

### `mcpServers` — Per-Agent MCP Loading

**Requires:** Claude Code 2.1.119+

Agents can now declare their own MCP servers. These servers are loaded **only when the agent is active**, reducing global MCP overhead and enabling agent-specific tooling.

```yaml
---
name: security-auditor
model: opus
effort: xhigh
mcpServers:
  semgrep:
    command: npx
    args: ["-y", "@semgrep/mcp-server"]
  trivy:
    command: trivy
    args: ["mcp-server"]
---
```

**Claude Craft use cases:**

| Agent | Recommended MCP | Purpose |
|-------|----------------|---------|
| `@security-auditor` | `@semgrep/mcp-server`, Trivy MCP | SAST + CVE scanning during audit |
| `@devops-engineer` | Docker MCP, Kubernetes MCP | Live container/cluster inspection |
| `@database-architect` | PostgreSQL MCP (`@modelcontextprotocol/server-postgres`) | Direct schema introspection |
| `@observability-engineer` | Sentry MCP, Grafana MCP | Live metrics/traces during review |
| `@data-analyst` | PostgreSQL MCP, SQLite MCP | Query execution during analysis |

> **Note:** Per-agent `mcpServers` override global MCP settings for that agent's session only. Requires user approval on first use.

### `isolation: "worktree"` — Automatic Worktree Isolation

**Requires:** Claude Code 2.1.119+

When set, Claude Code automatically creates a temporary git worktree for the agent's session. Changes are isolated until the agent completes; no conflicts with the main working tree.

```yaml
---
name: refactoring-specialist
model: opus
effort: high
isolation: "worktree"
---
```

**Claude Craft use cases:**

| Agent | Why isolation helps |
|-------|---------------------|
| `@refactoring-specialist` | Large refactors can be reviewed before merging back |
| `@migration-specialist` | Schema migrations in isolation, commit only after validation |
| `@devops-engineer` | Infrastructure changes tested in isolation from dev work |
| `@ralph-conductor` | Long autonomous loops don't conflict with ongoing dev |

**Worktree lifecycle:**
- Created automatically when agent starts
- Cleaned up automatically if no changes were made
- On changes: branch and path returned for review/merge

> **See also:** `/parallel-worktrees` skill for manual multi-worktree workflows.

---

## Scoring System v2.0

All 10 reviewer agents use the **Claude Sonnet** model and share a standardized scoring and review system:

- **Quantitative scoring**: 4 categories scored out of 100 -- Architecture (/25), Code Quality (/25), Testing (/25), Security (/25)
- **Decision trees**: Automated review decisions based on score thresholds (APPROVE >= 80, REQUEST CHANGES < 50, COMMENT otherwise)
- **5-phase review process**: Static Analysis, Architecture Review, Code Quality Check, Test Assessment, Security Audit
- **Structured audit report**: Consistent output format across all stacks with findings, score breakdown, and actionable recommendations

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
@angular-reviewer Review this component for Angular 20 LTS (ou 21) best practices
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

> **Note:** Docker agents (5), Coolify agents (4), and Project agents (2) are bundled in the `Infra/` and `Project/` directories respectively. They are installed into `.claude/agents/` by the CLI during `npx @the-bearded-bear/claude-craft install`. They do not appear in the source repository's `.claude/agents/` directory but are available after installation.

---

## Coolify/Infrastructure Agents (4)

Available with `install-coolify`.

### coolify-architect

**Expertise**: Coolify infrastructure design

Specializes in designing complete Coolify deployment architectures for self-hosted applications.

Helps with:
- Application topology design
- Resource planning and allocation
- Network and domain configuration
- Multi-environment strategies
- Service orchestration on Coolify

```
@coolify-architect Design the Coolify architecture for this SaaS
@coolify-architect Plan a multi-environment setup with Coolify
```

---

### coolify-deployment

**Expertise**: Coolify application deployment

Expert in deploying and managing applications on Coolify with zero-downtime strategies.

Helps with:
- Application deployment configuration
- Environment variable management
- Build pack selection and optimization
- Domain and SSL setup
- Rollback strategies

```
@coolify-deployment Deploy this app to Coolify
@coolify-deployment Configure zero-downtime deployment
```

---

### coolify-debug

**Expertise**: Coolify troubleshooting

Specializes in diagnosing and resolving Coolify deployment issues.

Helps with:
- Build failure diagnosis
- Container startup issues
- Network connectivity problems
- Resource exhaustion diagnosis
- Log analysis and debugging

```
@coolify-debug Deployment keeps failing, help me diagnose
@coolify-debug Application not reachable after deploy
```

---

### coolify-monitoring

**Expertise**: Coolify monitoring and backups

Expert in setting up monitoring, alerting, and backup strategies for Coolify deployments.

Helps with:
- Health check configuration
- Backup strategy design
- Database backup automation
- Alert configuration
- Resource monitoring
- Disaster recovery planning

```
@coolify-monitoring Set up automated backups for my databases
@coolify-monitoring Configure health monitoring for production
```

---

## PgBouncer/Infrastructure Agents (5)

Available with `install-pgbouncer`.

### pgbouncer-architect

**Expertise**: PgBouncer pool topology and sizing design

Specializes in designing optimal PgBouncer connection pooling architectures for PostgreSQL databases.

Helps with:
- Pool topology design (session, transaction, statement modes)
- Connection sizing and capacity planning
- Multi-database pool configuration
- High availability pool setups
- Pool hierarchy design

```
@pgbouncer-architect Design a connection pool topology for this microservices platform
@pgbouncer-architect Plan pool sizing for 500 concurrent users
```

---

### pgbouncer-deployment

**Expertise**: PgBouncer deployment and CI/CD pipelines

Expert in deploying and managing PgBouncer across different environments with zero-downtime strategies.

Helps with:
- Docker and Kubernetes deployment
- systemd service configuration
- Configuration management and templating
- Rolling restart strategies
- CI/CD pipeline integration

```
@pgbouncer-deployment Deploy PgBouncer with Kubernetes sidecar pattern
@pgbouncer-deployment Configure zero-downtime PgBouncer upgrades
```

---

### pgbouncer-debug

**Expertise**: PgBouncer connection issue diagnostics

Specializes in diagnosing and resolving PgBouncer connection pooling issues.

Helps with:
- Connection timeout diagnosis
- Pool saturation troubleshooting
- Client/server connection mismatches
- Query routing issues
- Log analysis and debugging

```
@pgbouncer-debug Connections timing out, help me diagnose
@pgbouncer-debug Pool saturation causing 503 errors
```

---

### pgbouncer-security

**Expertise**: PgBouncer authentication, TLS, and access control

Expert in securing PgBouncer deployments with proper authentication, encryption, and access policies.

Helps with:
- Authentication methods (md5, scram-sha-256, cert)
- TLS/SSL configuration
- Access control and user mapping
- Network security and firewall rules
- Audit logging configuration

```
@pgbouncer-security Configure SCRAM-SHA-256 authentication
@pgbouncer-security Audit PgBouncer TLS configuration
```

---

### pgbouncer-monitoring

**Expertise**: PgBouncer metrics, alerting, and performance tuning

Expert in monitoring PgBouncer health, setting up alerting, and tuning pool performance.

Helps with:
- SHOW commands and admin console usage
- Prometheus/Grafana integration
- Connection pool metrics analysis
- Alert threshold configuration
- Performance tuning and optimization

```
@pgbouncer-monitoring Set up Prometheus metrics for PgBouncer
@pgbouncer-monitoring Configure alerting for pool saturation
```

---

## FrankenPHP/Infrastructure Agents (5)

Available with `install-frankenphp`.

### frankenphp-architect

**Expertise**: FrankenPHP Caddyfile design, worker topology, and framework integration

Specializes in designing FrankenPHP serving architectures with worker mode, thread sizing, and framework integration.

Helps with:
- Worker mode vs classic mode decision
- Thread sizing and autoscaling configuration
- Caddyfile design and optimization
- Symfony Runtime / Laravel Octane integration
- Mercure real-time and Early Hints setup

```
@frankenphp-architect Design a worker mode architecture for this Symfony app
@frankenphp-architect Plan thread sizing for 1000 concurrent users
```

---

### frankenphp-deployment

**Expertise**: FrankenPHP deployment, Docker, Kubernetes, and CI/CD pipelines

Expert in deploying FrankenPHP with Docker, Kubernetes, standalone binary, and zero-downtime reload strategies.

Helps with:
- Docker and Kubernetes deployment
- Standalone binary with systemd
- Multi-stage Docker builds
- Zero-downtime reload (SIGUSR1)
- CI/CD pipeline integration

```
@frankenphp-deployment Deploy FrankenPHP to Kubernetes with HPA
@frankenphp-deployment Configure zero-downtime worker reload
```

---

### frankenphp-debug

**Expertise**: FrankenPHP worker crashes, memory leaks, and Caddyfile error diagnostics

Specializes in diagnosing and resolving FrankenPHP issues from symptoms and log analysis.

Helps with:
- Worker crash diagnosis (segfaults, OOM, fatal errors)
- Memory leak detection and max_requests tuning
- Caddyfile parse error resolution
- Framework compatibility issues
- TLS/HTTPS configuration problems

```
@frankenphp-debug Worker memory keeps growing, RSS at 2GB after 1 hour
@frankenphp-debug Caddyfile syntax error on startup
```

---

### frankenphp-security

**Expertise**: FrankenPHP auto-TLS, ECH, PQC, and Caddyfile hardening

Expert in securing FrankenPHP deployments with TLS, security headers, and container hardening.

Helps with:
- Auto-TLS configuration (Let's Encrypt)
- ECH and PQC (v1.6+) configuration
- Security headers and CSP
- Admin API lockdown
- Non-root container operation

```
@frankenphp-security Audit TLS configuration and security headers
@frankenphp-security Harden FrankenPHP for production deployment
```

---

### frankenphp-performance

**Expertise**: FrankenPHP worker tuning, thread autoscaling, Early Hints, and Mercure performance

Expert in optimizing FrankenPHP performance through worker tuning, OPcache, and benchmarking.

Helps with:
- Worker mode tuning and thread autoscaling
- OPcache preloading and JIT optimization
- Early Hints (103) configuration
- Mercure hub performance tuning
- Benchmarking methodology (wrk, k6)

```
@frankenphp-performance Optimize worker throughput for API workload
@frankenphp-performance Configure Early Hints for faster page loads
```

---

## BMAD v6 Roles (10)

> **Note:** These are personas integrated into workflow and sprint commands, not standalone agent files. They are described here for reference.

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

**Key Commands**: `/qa:recette`, `/qa:fix`, `/qa:status`, `/qa:regression`, `/qa:report`

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
| `model` | No | `haiku` \| `sonnet` \| `opus` — model routing for cost/quality |
| `effort` | No | `low` \| `medium` \| `high` \| `xhigh` \| `max` — reasoning depth (`xhigh`/`max` need Opus 4.8) |
| `memory` | No | Memory scope: `user`, `project`, or `local` (v2.1.33+) |
| `tools` | No | Allowed tools, including `Task(agent_type)` (v2.1.33+) |
| `disallowedTools` | No | Denied tools (camelCase); `disallowed-tools` kebab-case also accepted (v2.1.152+) |
| `maxTurns` | No | Cap on agent turns (cost/scope control, v2.1.78+) |
| `permissionMode` | No | Permission mode for the agent session |
| `skills` | No | Skills made available to the agent |
| `mcpServers` | No | Per-agent MCP servers loaded only when the agent is active (v2.1.117+) |
| `isolation` | No | `"worktree"` runs the agent in an auto-managed git worktree |
| `hooks` | No | Agent-scoped hooks (ignored for plugin subagents) |
| `background` | No | Run the agent as a background session |
| `color` / `initialPrompt` | No | Display color / seed prompt for the agent |

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
| Common | 12 | 60 |
| Technology Reviewers | 10 | 50 |
| Docker/Infrastructure | 5 | 25 |
| Coolify/Infrastructure | 4 | 20 |
| Kubernetes/Infrastructure | 5 | 25 |
| OpenTofu/Infrastructure | 5 | 25 |
| Ansible/Infrastructure | 5 | 25 |
| Hcloud/Infrastructure | 5 | 25 |
| PgBouncer/Infrastructure | 5 | 25 |
| FrankenPHP/Infrastructure | 5 | 25 |
| **BMAD v6** | **0** (roles, not agents) | **10** (YAML roles) |
| Project | 2 | 10 |
| **Total** | **63** | **315** |

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
