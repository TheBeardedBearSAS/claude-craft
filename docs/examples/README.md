# Claude Craft Examples

Complete working examples demonstrating Claude Craft capabilities.

---

## Available Examples

| Example | Description | Technologies |
|---------|-------------|--------------|
| [Symfony API](symfony-api/) | Complete REST API | Symfony 8.1, API Platform, PostgreSQL |
| [Flutter App](flutter-app/) | Mobile application | Flutter 3.44, BLoC, Riverpod |
| [Fullstack SaaS](fullstack-saas/) | Complete SaaS | Symfony + Flutter + Docker |

---

## How to Use These Examples

### 1. Clone the Example

```bash
# Copy example to new project
cp -r docs/examples/symfony-api ~/my-new-api
cd ~/my-new-api
```

### 2. Install Claude Craft

```bash
npx @the-bearded-bear/claude-craft install . --tech=symfony --lang=en
```

### 3. Follow the Walkthrough

Each example includes a `WALKTHROUGH.md` with step-by-step instructions.

---

## Example Structure

Each example contains:

```
example/
├── README.md           # Overview and features
├── WALKTHROUGH.md      # Step-by-step guide
├── .claude/            # Claude Craft configuration
│   ├── CLAUDE.md
│   ├── INDEX.md
│   └── ...
├── docs/
│   ├── prd.md          # Product Requirements
│   └── tech-spec.md    # Technical Specification
├── .bmad/
│   ├── config.yaml     # BMAD configuration
│   └── backlog/        # User stories
└── src/                # Source code
```

---

## Learning Path

### For Beginners

1. Start with [Symfony API](symfony-api/) - single technology
2. Learn BMAD basics
3. Practice TDD workflow

### For Intermediate

1. [Flutter App](flutter-app/) - mobile development
2. Complex state management
3. Advanced testing

### For Advanced

1. [Fullstack SaaS](fullstack-saas/) - complete system
2. Multi-technology coordination
3. Production deployment

---

## Quick Example Walkthrough

### Create a New API Endpoint (5 minutes)

```bash
# 1. Start Claude Code
cd symfony-api
claude

# 2. Initialize workflow
/workflow:init --quick

# 3. Generate endpoint
/symfony:generate-crud Product

# 4. Check quality
/symfony:check-architecture

# 5. Commit
/common:pre-commit-check
```

### Implement Feature with TDD (15 minutes)

```bash
# 1. Get next story
/sprint:next-story --claim

# 2. Start TDD
@dev Implement US-001 with TDD

# 3. Validate
/gate:validate-story US-001

# 4. Complete
/sprint:transition US-001 done
```

---

## What You'll Learn

### From Symfony API Example

- Clean Architecture setup
- API Platform configuration
- Doctrine entities and repositories
- PHPUnit testing
- Docker development environment

### From Flutter App Example

- BLoC pattern implementation
- Riverpod state management
- Widget testing
- Golden tests
- Responsive design

### From Fullstack SaaS Example

- Multi-technology coordination
- Shared contracts (OpenAPI)
- End-to-end testing
- Docker Compose orchestration
- CI/CD pipeline setup

---

## Contributing Examples

To add a new example:

1. Create directory in `docs/examples/`
2. Include README.md and WALKTHROUGH.md
3. Add working source code
4. Include Claude Craft configuration
5. Document all steps clearly

---

## See Also

- [Quickstart Guide](../QUICKSTART.md)
- [Complete Workflow Guide](../guides/en/10-complete-workflow.md)
- [BMAD Practical Guide](../BMAD-PRACTICAL-GUIDE.md)
