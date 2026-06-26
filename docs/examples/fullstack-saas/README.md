# Fullstack SaaS Example

A complete SaaS application with Symfony backend and Flutter mobile app, demonstrating multi-technology coordination with Claude Craft.

---

## Overview

This example demonstrates:

- **Multi-technology Coordination** - Symfony + Flutter
- **Shared Contracts** - OpenAPI specification
- **End-to-end Testing** - API + Mobile
- **Docker Compose** - Complete orchestration
- **BMAD** - Cross-team project management

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Mobile App                           │
│                     (Flutter + BLoC)                        │
└─────────────────────────┬───────────────────────────────────┘
                          │ HTTPS
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                       API Gateway                            │
│                        (Nginx)                               │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                      Backend API                             │
│              (Symfony + API Platform)                        │
└──────────────┬──────────────────────────┬───────────────────┘
               │                          │
               ▼                          ▼
┌──────────────────────┐    ┌──────────────────────────────────┐
│     PostgreSQL       │    │           Redis                   │
│     (Database)       │    │         (Cache/Queue)             │
└──────────────────────┘    └──────────────────────────────────┘
```

---

## Project Structure

```
fullstack-saas/
├── .claude/                    # Root Claude Craft config
├── .bmad/                      # BMAD configuration
│   ├── config.yaml
│   └── backlog/
├── docs/
│   ├── prd.md
│   ├── tech-spec.md
│   └── api/
│       └── openapi.yaml        # Shared API contract
├── backend/                    # Symfony API
│   ├── .claude/
│   ├── src/
│   ├── tests/
│   └── docker/
├── mobile/                     # Flutter App
│   ├── .claude/
│   ├── lib/
│   └── test/
├── e2e/                        # End-to-end tests
│   └── tests/
├── docker-compose.yml
└── Makefile
```

---

## Features

| Feature | Backend | Mobile | Status |
|---------|---------|--------|--------|
| User Registration | `/api/register` | `AuthScreen` | Complete |
| User Login | `/api/login` | `LoginScreen` | Complete |
| Product Catalog | `/api/products` | `ProductList` | Complete |
| Shopping Cart | `/api/cart` | `CartScreen` | In Progress |
| Checkout | `/api/checkout` | `CheckoutFlow` | Backlog |
| Subscriptions | `/api/subscriptions` | `SubscriptionScreen` | Backlog |

---

## Quick Start

### 1. Clone and Setup

```bash
# Clone example
cp -r docs/examples/fullstack-saas ~/my-saas
cd ~/my-saas

# Start all services
docker compose up -d

# Install Claude Craft for each project
cd backend
npx @the-bearded-bear/claude-craft install . --tech=symfony

cd ../mobile
npx @the-bearded-bear/claude-craft install . --tech=flutter
```

### 2. Run Tests

```bash
# Backend tests
docker compose exec api ./vendor/bin/phpunit

# Mobile tests
cd mobile && flutter test

# E2E tests
docker compose exec e2e npm test
```

### 3. Start Development

```bash
claude
/workflow:init
/workflow:status
```

---

## Shared API Contract

The OpenAPI specification in `docs/api/openapi.yaml` serves as the contract between frontend and backend:

```yaml
openapi: 3.0.3
info:
  title: SaaS API
  version: 1.0.0

paths:
  /api/products:
    get:
      summary: List products
      responses:
        '200':
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: '#/components/schemas/Product'

components:
  schemas:
    Product:
      type: object
      properties:
        id:
          type: string
          format: uuid
        name:
          type: string
        price:
          type: number
```

---

## Development Workflow

### Feature Implementation

For cross-technology features, coordinate using BMAD:

```bash
# 1. Start with backend
cd backend
claude
/sprint:next-story --claim
# Implement API endpoint

# 2. Then frontend
cd ../mobile
claude
/sprint:next-story --claim
# Implement mobile feature

# 3. E2E testing
cd ../e2e
npm test
```

### Quality Checks

```bash
# Backend
cd backend
/symfony:check-architecture
/symfony:check-security

# Mobile
cd ../mobile
/flutter:check-architecture
/flutter:check-testing

# Full audit
cd ..
make audit
```

---

## Docker Commands

```bash
# Start all services
docker compose up -d

# View logs
docker compose logs -f

# Backend commands
docker compose exec api php bin/console ...
docker compose exec api ./vendor/bin/phpunit

# Database
docker compose exec db psql -U app

# Stop
docker compose down
```

---

## Makefile Commands

```bash
# Start
make up

# Stop
make down

# Tests
make test-backend
make test-mobile
make test-e2e
make test-all

# Audit
make audit

# Build for production
make build-prod
```

---

## CI/CD Pipeline

The included GitHub Actions workflow:

1. **Backend CI**
   - PHPUnit tests
   - PHPStan analysis
   - PHP CS Fixer check
   - Security audit

2. **Mobile CI**
   - Flutter tests
   - Flutter analyze
   - Build APK/IPA

3. **E2E CI**
   - Start services
   - Run E2E tests
   - Generate report

4. **Deploy**
   - Build containers
   - Push to registry
   - Deploy to staging/production

---

## BMAD Configuration

```yaml
# .bmad/config.yaml
version: 2
project:
  name: "SaaS Platform"
  methodology: "scrum"

teams:
  - name: backend
    path: backend/
    tech: symfony
  - name: mobile
    path: mobile/
    tech: flutter

routing:
  auto_route: true
  cross_team: true
```

---

## Next Steps

1. Read [WALKTHROUGH.md](WALKTHROUGH.md) for detailed steps
2. Check the [PRD](docs/prd.md) for requirements
3. Review [Tech Spec](docs/tech-spec.md) for architecture
4. Review [OpenAPI](docs/api/openapi.yaml) for API contract
5. Continue with backlog items

---

## See Also

- [Complete Workflow Guide](../../guides/en/10-complete-workflow.md)
- [BMAD Practical Guide](../../BMAD-PRACTICAL-GUIDE.md)
- [Symfony Commands](../../COMMANDS.md#symfony-commands)
- [Flutter Commands](../../COMMANDS.md#flutter-commands)
