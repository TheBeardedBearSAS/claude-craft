# Complete Workflow Guide: From Idea to Production

A comprehensive step-by-step guide to building a complete application using Claude Craft, from initial idea to production deployment.

---

## Overview

This guide walks you through the complete development lifecycle:

1. **Ideation** - Define your product vision
2. **Requirements** - Document what you're building
3. **Architecture** - Design the technical solution
4. **Planning** - Create actionable sprints
5. **Development** - Implement with TDD
6. **Quality** - Validate and test
7. **Deployment** - Ship to production

**Prerequisites:**
- Claude Craft v8.10.1 installed in your project
- Claude Code v2.1.159 (recommended) or v2.1.97+ (minimum, CVE-2025-59536 patched)
- Basic understanding of your chosen technology stack

---

## Phase 1: Ideation (5-10 minutes)

### Setup Your Session

Before diving in, configure your session for optimal performance:

```bash
# Adjust reasoning effort for planning (high for complex tasks)
/effort high

# Optionally set up token optimization
/common:setup-rtk
```

### Start with BMAD

```bash
# Initialize BMAD in your project
/bmad:init

# Or start a workflow
/workflow:init
```

### Define the Vision

Work with the Product Manager agent:

```
@pm I want to build an e-commerce platform for selling artisanal products.
Key features:
- Product catalog with categories
- Shopping cart and checkout
- User authentication
- Order management
```

The PM will help you:
- Clarify the problem you're solving
- Identify target users
- Define success metrics

### Create Initial Vision Document

```
@pm Create a vision document for this project
```

Output: `docs/vision.md`

---

## Phase 2: Requirements (15-30 minutes)

### Analyze Requirements

Work with the Business Analyst:

```
@ba Analyze requirements for the e-commerce platform based on the vision
```

The BA will:
- Break down features into user stories
- Identify dependencies
- Create a user story map

### Create PRD

```
@pm Create a Product Requirements Document
```

### Validate PRD

```
/gate:validate-prd docs/prd.md
```

Ensure you pass the PRD Gate (≥80%):
- [ ] Problem statement defined
- [ ] Target users identified
- [ ] Goals clear
- [ ] Success metrics defined
- [ ] Scope boundaries set

---

## Phase 3: Architecture (20-45 minutes)

### Design Architecture

Work with the Architect:

```
@architect Design the system architecture for the e-commerce platform
Consider:
- Symfony backend with API Platform
- PostgreSQL database
- Redis caching
- Docker deployment
```

The Architect will create:
- System architecture diagram
- Component design
- Data model
- API contracts

### Create Technical Specification

```
@architect Create technical specification from the PRD
```

Output: `docs/tech-spec.md`

### Document Decisions

For important choices:

```
@architect Create an ADR for choosing JWT over session-based auth
```

Output: `docs/adr/001-jwt-authentication.md`

### Validate Tech Spec

```
/gate:validate-techspec docs/tech-spec.md
```

Ensure you pass the Tech Spec Gate (≥90%):
- [ ] Architecture documented
- [ ] API contracts defined
- [ ] Security addressed
- [ ] Performance requirements set
- [ ] Testing strategy defined
- [ ] Deployment plan created

---

## Phase 4: Planning (15-30 minutes)

### Create Backlog

Work with the Product Owner:

```
@po Create user stories from the technical specification
Prioritize using MoSCoW method
```

The PO will create stories like:
```
EPIC-001: User Authentication
├── US-001: User registration
├── US-002: User login
├── US-003: Password reset
└── US-004: Social login

EPIC-002: Product Catalog
├── US-005: Browse products
├── US-006: Product search
├── US-007: Category filtering
└── US-008: Product details
```

### Validate Backlog

```
/gate:validate-backlog
```

Each story must pass INVEST:
- **I**ndependent
- **N**egotiable
- **V**aluable
- **E**stimable
- **S**mall
- **T**estable

### Plan First Sprint

Work with the Scrum Master:

```
@sm Plan sprint 1 with the highest priority stories
Include:
- US-001: User registration
- US-002: User login
- US-005: Browse products
```

### Validate Sprint

```
/gate:validate-sprint
```

---

## Phase 5: Development (Variable)

### Start Sprint Development

```
/sprint:dev 1
```

Or work story by story:

### 5.1 Get Next Story

```
/sprint:next-story --claim
```

Example: US-001 (User Registration)

### 5.2 Transition to In-Progress

```
/sprint:transition US-001 in-progress
```

### 5.3 TDD Red Phase (Write Failing Test)

Work with the Developer agent:

```
@dev Start TDD for US-001 (User Registration)
Begin with 🔴 Red phase - write failing tests
```

Create tests first:
```php
// tests/Feature/UserRegistrationTest.php
class UserRegistrationTest extends TestCase
{
    public function test_user_can_register_with_valid_data(): void
    {
        $response = $this->post('/api/register', [
            'email' => 'test@example.com',
            'password' => 'SecurePass123!',
            'name' => 'Test User'
        ]);

        $response->assertStatus(201);
        $this->assertDatabaseHas('users', ['email' => 'test@example.com']);
    }
}
```

### 5.4 TDD Green Phase (Implement)

```
@dev Now implement 🟢 Green phase - make tests pass
```

Generate code:
```
/symfony:generate-crud User
```

### 5.5 TDD Refactor Phase

```
@dev 🔵 Refactor - clean up the implementation
```

### 5.6 Code Review

```
@symfony-reviewer Review the user registration implementation
```

### 5.7 Validate Story DoD

```
/gate:validate-story US-001
```

### 5.8 Transition to Review

```
/sprint:transition US-001 review
```

### 5.9 QA Validation

```
@qa Validate acceptance criteria for US-001
```

### 5.10 Complete Story

```
/sprint:transition US-001 done
```

### 5.11 Repeat

Continue with next story until sprint complete.

---

## Phase 6: Quality (Throughout)

### Context Management

During development, manage your context window efficiently:

```bash
# Check context optimization suggestions
/context

# Switch to lower effort for simple tasks
/effort low

# Clear context between unrelated tasks
/clear

# Save important learnings that persist across sessions
/memory "Key architectural decision: using CQRS for order module"
```

### Continuous Quality Checks

Run regularly during development:

```bash
# Set up recurring quality monitoring
/loop 5m /common:pre-commit-check

# Architecture check
/symfony:check-architecture

# Code quality
/symfony:check-code-quality

# Security audit
/symfony:check-security

# Test coverage
/symfony:check-testing
```

### Full Audit Before Release

```
/team:audit --sequential
```

### Pre-Commit Validation

Always before committing:

```
/common:pre-commit-check
```

### Sprint Review

At end of sprint:

```
@sm Run sprint review for sprint 1
```

### Retrospective

```
@sm Run sprint retrospective
```

---

## Phase 7: Deployment (30-60 minutes)

### Prepare Docker Configuration

```
@docker-architect Design Docker architecture for production
```

### Create Docker Files

```
/docker:compose-setup symfony postgresql redis
```

### Create CI/CD Pipeline

```
/docker:cicd-pipeline github-actions
```

### Security Check

```
/docker:security-scan
```

### Pre-Release Checklist

```
/common:release-checklist
```

### Deploy

```bash
# Build and test
docker compose -f docker-compose.prod.yml build
docker compose -f docker-compose.prod.yml up -d

# Run migrations
docker compose exec app php bin/console doctrine:migrations:migrate

# Verify health
curl https://your-app.com/health
```

---

## Using Ralph for Automation

For automated development cycles, use Ralph Wiggum:

```bash
# Implement a feature automatically
/common:ralph-run "Implement user registration with TDD"

# With full DoD checks
/common:ralph-run --full "Add password reset feature"
```

Ralph will iterate until:
- All tests pass
- Lint passes
- DoD validators pass

---

## Complete Command Sequence

Here's a condensed sequence for a typical feature:

```bash
# 0. Session setup
/effort high                    # Complex planning
/common:setup-rtk               # Token optimization (first time only)

# 1. Initialize
/bmad:init

# 2. Define (PM)
@pm Create PRD for the feature
/gate:validate-prd docs/prd.md

# 3. Design (Architect)
@architect Create technical specification
/gate:validate-techspec docs/tech-spec.md

# 4. Plan (PO + SM)
@po Create user stories
@sm Plan sprint 1
/gate:validate-sprint

# 5. Develop (Dev)
/sprint:next-story --claim
@dev Implement with TDD
/gate:validate-story US-001
/sprint:transition US-001 done

# 6. Review (QA)
@qa Validate acceptance criteria
/team:audit --sequential

# 7. Deploy
/docker:cicd-pipeline github-actions
/common:release-checklist
```

---

## Tips for Success

### 0. Manage Your Context Window

The context window is your most critical resource:
- Use `/effort low` for simple tasks, `/effort high` for complex ones
- Use `/context` regularly to check optimization suggestions
- Run `/clear` between unrelated tasks
- Use `/memory` to persist key decisions across sessions
- Set up `/loop` for recurring checks instead of manual runs

### 1. Don't Skip Quality Gates

Each gate catches different issues:
- PRD Gate → Prevents building the wrong thing
- Tech Spec Gate → Prevents architectural issues
- Backlog Gate → Ensures stories are implementable
- Story DoD → Ensures quality code

### 2. Use Agents Collaboratively

Let agents hand off to each other:
```
@bmad-master Route this to the appropriate agent
```

### 3. TDD is Non-Negotiable

Always follow 🔴 Red → 🟢 Green → 🔵 Refactor.

### 4. Document Decisions

Use ADRs for important choices:
```
@architect Create ADR for choosing X over Y
```

### 5. Regular Reviews

- Daily: `/common:daily-standup`
- End of Sprint: `@sm Run sprint review`
- Continuous: `@{tech}-reviewer Review this code`

---

## Troubleshooting

### Quality Gate Fails

```
/gate:report
```

Check which criteria are missing.

### Story Blocked

```
/sprint:transition US-001 blocked --reason="Waiting for API"
```

### Need to Rollback

If using Ralph with Git checkpointing:
```bash
git log --oneline --grep="[ralph]"
git reset --hard HEAD~3
```

---

## Next Steps

- [BMAD Practical Guide](../BMAD-PRACTICAL-GUIDE.md) - Deep dive into BMAD
- [Ralph Wiggum Guide](../RALPH-GUIDE.md) - Automated development
- [Commands Reference](../COMMANDS.md) - All available commands
- [Agents Reference](../AGENTS.md) - All available agents
