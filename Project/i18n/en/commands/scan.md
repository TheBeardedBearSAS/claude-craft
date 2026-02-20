---
name: scan
description: Analyze existing codebase and generate a structured inventory of modules, endpoints, models, and tests
arguments:
  - name: scope
    description: Scope to scan (all, backend, frontend, api, tests)
    required: false
  - name: output
    description: Output path (default project-management/scan-report.md)
    required: false
---

# /project:scan

## Mission

Analyze an existing codebase to generate a comprehensive, structured inventory of all modules, endpoints, models, services, and tests. This command is the entry point for brownfield projects that need reverse-engineered specifications.

## Prerequisites

- Project directory exists with source code
- Codebase is accessible (not encrypted or obfuscated)
- Optional: `README.md` with project description
- Optional: `docker-compose.yml` for infrastructure context

## Plan Mode

> **Plan mode is mandatory.** Before executing, Claude activates plan mode to analyze impacted code, propose an implementation plan, and wait for your validation before making any changes.

## Workflow

### Step 1: Stack Detection

```
+--------------------------------------------------------------+
|                 CODEBASE SCAN - DETECTION                     |
+--------------------------------------------------------------+
| Detecting technology stack...                                  |
+--------------------------------------------------------------+
```

**Automatic Detection Rules:**

| File Pattern | Detected Stack |
|-------------|----------------|
| `*.php` + `symfony.lock` | Symfony |
| `*.php` + `artisan` | Laravel |
| `*.php` + `composer.json` | PHP (generic) |
| `*.dart` + `pubspec.yaml` | Flutter |
| `*.tsx` / `*.jsx` + `next.config.*` | React (Next.js) |
| `*.tsx` / `*.jsx` + `package.json` | React |
| `*.vue` + `package.json` | Vue.js |
| `angular.json` | Angular |
| `*.cs` + `*.csproj` | .NET / C# |
| `*.py` + `pyproject.toml` | Python |
| `Dockerfile` / `docker-compose.yml` | Docker (infra) |

**Actions:**
1. Scan root directory for framework markers
2. Read `composer.json`, `package.json`, `pubspec.yaml`, `*.csproj`, or `pyproject.toml`
3. Identify framework version and key dependencies
4. Detect infrastructure (Docker, CI/CD, Redis, queues)
5. Assign the appropriate tech-specific reviewer agent

### Step 2: Structure Scan

```
+--------------------------------------------------------------+
|                 CODEBASE SCAN - STRUCTURE                      |
+--------------------------------------------------------------+
| Scanning project structure...                                  |
+--------------------------------------------------------------+
```

**Categorize all files into:**

1. **Modules / Domains**: Group files by bounded context or feature
   - Detect domain boundaries from directory structure
   - Identify shared/common modules
   - Map namespace structure

2. **Endpoints**: List all API routes and controllers
   - Parse route definitions (annotations, attributes, config files)
   - Extract HTTP methods, paths, and handler references
   - Identify middleware/guards applied

3. **Models / Entities**: List all data models
   - Parse entity/model classes
   - Extract field names, types, and relationships
   - Identify database migrations

4. **Services**: List all services, use cases, and handlers
   - Identify service classes and their dependencies
   - Map command/query handlers (CQRS patterns)
   - Detect event listeners and subscribers

5. **Tests**: List test files and coverage scope
   - Identify unit, integration, and E2E tests
   - Map test files to source files
   - Detect test frameworks in use

6. **Infrastructure**: Configuration and deployment
   - Docker configuration
   - CI/CD pipelines
   - Environment configuration
   - Third-party service integrations

### Step 3: Code Analysis

```
+--------------------------------------------------------------+
|                 CODEBASE SCAN - ANALYSIS                       |
+--------------------------------------------------------------+
| Analyzing code patterns and complexity...                      |
+--------------------------------------------------------------+
```

**Analysis Tasks:**
1. Estimate lines of code (LOC) per module
2. Identify architectural patterns in use (MVC, Clean Architecture, DDD, etc.)
3. Detect code quality indicators (linting config, static analysis)
4. Map dependency graph between modules
5. Identify potential technical debt markers
6. Use tech-specific reviewer (e.g., `@symfony-reviewer`, `@react-reviewer`) for stack-specific insights

### Step 4: Report Generation

Generate a structured Markdown report at the configured output path.

### Step 5: Next Steps

```
+--------------------------------------------------------------+
|                      NEXT STEPS                                |
+--------------------------------------------------------------+
| Scan complete! Recommended next actions:                       |
|                                                                |
| 1. /project:reverse-prd        -> Generate PRD from code      |
| 2. /project:reverse-stories    -> Generate user stories        |
| 3. /project:gap-analysis       -> Compare spec vs code         |
+--------------------------------------------------------------+
```

## Output Format

```
project-management/
+-- scan-report.md              # Full scan report
```

**Report Structure:**

```
+==============================================================+
|                  CODEBASE SCAN REPORT                          |
+==============================================================+
| Project: {name}                                                |
| Stack: Symfony 7.x / PHP 8.4                                   |
| Size: ~15,000 LOC                                              |
| Modules: 5 bounded contexts                                    |
+==============================================================+

## Technology Stack
| Component       | Technology    | Version |
|-----------------|---------------|---------|
| Framework       | Symfony       | 7.2     |
| Language        | PHP           | 8.4     |
| Database        | PostgreSQL    | 16      |
| Cache           | Redis         | 7.x     |
| Containerization| Docker        | Yes     |

## Modules / Bounded Contexts
| Module          | Files | LOC   | Tests | Coverage |
|-----------------|-------|-------|-------|----------|
| User            | 24    | 1,800 | 12    | ~65%     |
| Order           | 31    | 2,400 | 18    | ~72%     |
| Payment         | 18    | 1,200 | 8     | ~55%     |
| Notification    | 12    | 800   | 5     | ~40%     |
| Shared/Common   | 15    | 600   | 3     | ~30%     |

## Endpoints (API)
| Method | Path                  | Controller         | Auth |
|--------|-----------------------|--------------------|------|
| GET    | /api/users            | UserController     | JWT  |
| POST   | /api/users            | UserController     | JWT  |
| GET    | /api/orders           | OrderController    | JWT  |
| POST   | /api/orders           | OrderController    | JWT  |
| ...    | ...                   | ...                | ...  |

## Models / Entities
| Entity      | Fields | Relationships       | Migrations |
|-------------|--------|---------------------|------------|
| User        | 12     | hasMany: Order      | 3          |
| Order       | 15     | belongsTo: User     | 5          |
| Product     | 10     | manyToMany: Order   | 2          |
| ...         | ...    | ...                 | ...        |

## Services
| Service              | Dependencies | Type       |
|----------------------|-------------|------------|
| CreateOrderHandler   | 3           | Command    |
| GetUserQuery         | 2           | Query      |
| PaymentGateway       | 4           | Service    |
| ...                  | ...         | ...        |

## Tests
| Type        | Count | Framework   |
|-------------|-------|-------------|
| Unit        | 42    | PHPUnit     |
| Integration | 15    | PHPUnit     |
| E2E         | 3     | Cypress     |
| Total       | 60    |             |

## Infrastructure
| Component   | Config File        | Notes              |
|-------------|--------------------|--------------------|
| Docker      | docker-compose.yml | 4 services         |
| CI/CD       | .github/workflows  | 2 pipelines        |
| Env         | .env.example       | 15 variables       |

## Complexity Summary
| Metric                    | Value          |
|---------------------------|----------------|
| Total LOC                 | ~15,000        |
| Total files               | 142            |
| Bounded contexts          | 5              |
| API endpoints             | 23             |
| Database entities         | 8              |
| Test files                | 60             |
| Estimated test coverage   | ~55%           |
| Architecture pattern      | Clean Arch     |
```

## Example Session

```
User: /project:scan

Claude: Starting codebase scan...

[Stack Detection]
Detected: Symfony 7.2 / PHP 8.4
Key dependencies: doctrine/orm, api-platform/core, lexik/jwt-auth

[Structure Scan]
Scanning directories...
Found 5 bounded contexts: User, Order, Payment, Notification, Shared
Found 23 API endpoints across 6 controllers
Found 8 Doctrine entities with 12 migrations
Found 60 test files (42 unit, 15 integration, 3 E2E)

[Code Analysis]
Architecture: Clean Architecture (Domain/Application/Infrastructure layers)
Estimated LOC: ~15,000
Code quality: PHPStan level 8, PHP-CS-Fixer configured

Scan report generated: project-management/scan-report.md

Would you like me to:
1. Run /project:reverse-prd to generate a PRD from this scan?
2. Run /project:reverse-stories to generate user stories?
3. Focus the scan on a specific module?
```

## Related Commands

- `/project:reverse-prd` - Generate a PRD from existing codebase
- `/project:reverse-stories` - Generate user stories from codebase features
- `/project:gap-analysis` - Compare specifications with actual codebase
- `/project:generate-prd` - Generate a PRD interactively (greenfield)
- `/project:generate-backlog` - Create SCRUM backlog from PRD
