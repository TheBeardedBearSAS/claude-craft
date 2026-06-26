# Symfony API Example

A complete REST API built with Symfony 8.1, API Platform, and PostgreSQL, demonstrating Claude Craft best practices.

---

## Overview

This example demonstrates:

- **Clean Architecture** - Domain, Application, Infrastructure layers
- **API Platform** - REST/GraphQL API generation
- **Doctrine ORM** - Entity mapping and repositories
- **TDD Workflow** - Test-first development
- **BMAD** - Project management with Claude Craft

---

## Features

| Feature | Status |
|---------|--------|
| User Registration | Complete |
| User Authentication (JWT) | Complete |
| Product CRUD | Complete |
| Category Management | Complete |
| Order Processing | Backlog |
| Payment Integration | Backlog |

---

## Project Structure

```
symfony-api/
├── .claude/                    # Claude Craft configuration
│   ├── CLAUDE.md
│   ├── INDEX.md
│   ├── references/symfony/
│   ├── agents/
│   └── commands/
├── .bmad/                      # BMAD configuration
│   ├── config.yaml
│   ├── sprint-status.yaml
│   └── backlog/
│       ├── EPIC-001.md
│       ├── US-001.md
│       └── ...
├── docs/
│   ├── prd.md                  # Product Requirements
│   ├── tech-spec.md            # Technical Specification
│   └── adr/                    # Architecture Decisions
├── docker/
│   ├── Dockerfile
│   └── docker-compose.yml
├── src/
│   ├── Domain/                 # Domain layer
│   │   ├── Entity/
│   │   ├── Repository/
│   │   └── ValueObject/
│   ├── Application/            # Application layer
│   │   ├── Command/
│   │   ├── Query/
│   │   └── Service/
│   └── Infrastructure/         # Infrastructure layer
│       ├── Doctrine/
│       ├── Security/
│       └── Controller/
├── tests/
│   ├── Unit/
│   ├── Integration/
│   └── Functional/
└── config/
```

---

## Quick Start

### 1. Clone and Install

```bash
# Clone example
cp -r docs/examples/symfony-api ~/my-api
cd ~/my-api

# Install Claude Craft
npx @the-bearded-bear/claude-craft install . --tech=symfony --lang=en

# Start Docker
docker compose up -d
```

### 2. Run Tests

```bash
docker compose exec app ./vendor/bin/phpunit
```

### 3. Start Development

```bash
claude
/workflow:init
```

---

## BMAD Configuration

### Current Sprint

```yaml
# .bmad/sprint-status.yaml
current_sprint: 1
sprints:
  - number: 1
    goal: "User authentication and product catalog"
    stories:
      - id: US-001
        title: "User registration"
        status: done
      - id: US-002
        title: "User login"
        status: done
      - id: US-005
        title: "Browse products"
        status: in-progress
```

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/register` | User registration |
| POST | `/api/login` | User authentication |
| GET | `/api/products` | List products |
| POST | `/api/products` | Create product |
| GET | `/api/products/{id}` | Get product |
| PUT | `/api/products/{id}` | Update product |
| DELETE | `/api/products/{id}` | Delete product |

---

## Development Workflow

### Implement New Feature

```bash
# 1. Get next story
/sprint:next-story --claim

# 2. Start TDD
@dev Implement US-003 with TDD

# 🔴 Red - Write failing test
# 🟢 Green - Implement
# 🔵 Refactor

# 3. Validate
/gate:validate-story US-003

# 4. Complete
/sprint:transition US-003 done
```

### Quality Checks

```bash
# Architecture
/symfony:check-architecture

# Code quality
/symfony:check-code-quality

# Security
/symfony:check-security

# Full audit
/team:audit --sequential
```

---

## Docker Commands

```bash
# Start
docker compose up -d

# Run tests
docker compose exec app ./vendor/bin/phpunit

# PHP CS Fixer
docker compose exec app ./vendor/bin/php-cs-fixer fix

# PHPStan
docker compose exec app ./vendor/bin/phpstan

# Migrations
docker compose exec app php bin/console doctrine:migrations:migrate
```

---

## Next Steps

1. Read [WALKTHROUGH.md](WALKTHROUGH.md) for detailed steps
2. Check the [PRD](docs/prd.md) for requirements
3. Review [Tech Spec](docs/tech-spec.md) for architecture
4. Continue with backlog items

---

## See Also

- [Complete Workflow Guide](../../guides/en/10-complete-workflow.md)
- [BMAD Practical Guide](../../BMAD-PRACTICAL-GUIDE.md)
- [Symfony Commands Reference](../../COMMANDS.md#symfony-commands)
