# Commands Reference

Claude Code commands are slash commands that automate workflows and provide structured assistance.

## How to Use Commands

Type a slash command in Claude Code:

```
/common:pre-commit-check
/symfony:generate-crud User
/react:generate-component Button
```

Commands can take arguments:
```
/command:name argument1 argument2
```

## Command Namespaces

| Namespace | Technology | Count |
|-----------|------------|-------|
| `/common:` | Transversal | 14 |
| `/symfony:` | PHP/Symfony | 10 |
| `/flutter:` | Dart/Flutter | 10 |
| `/python:` | Python | 10 |
| `/react:` | React/TypeScript | 8 |
| `/reactnative:` | React Native | 7 |

---

## Common Commands (`/common:`)

Transversal commands for all projects.

### Workflow Commands

| Command | Description |
|---------|-------------|
| `/common:pre-commit-check` | Validate code before commit |
| `/common:pre-merge-check` | Validate code before merge |
| `/common:full-audit` | Complete project audit |
| `/common:release-checklist` | Pre-release validation |

### Generation Commands

| Command | Description |
|---------|-------------|
| `/common:generate-changelog` | Generate changelog from commits |
| `/common:architecture-decision` | Document an ADR |

### Sprint Commands

| Command | Description |
|---------|-------------|
| `/common:sprint-start` | Initialize a new sprint |
| `/common:sprint-review` | Generate sprint review summary |
| `/common:sprint-retro` | Conduct sprint retrospective |
| `/common:daily-standup` | Generate standup summary |

### DevOps Commands

| Command | Description |
|---------|-------------|
| `/common:setup-ci` | Configure CI/CD pipeline |
| `/common:docker-optimize` | Optimize Docker configuration |

### Development Commands

| Command | Description |
|---------|-------------|
| `/common:fix-bug-tdd` | Fix bug using TDD methodology |
| `/common:research-context7` | Deep technical research |

---

## Symfony Commands (`/symfony:`)

PHP backend development with Symfony.

### Code Generation

| Command | Description |
|---------|-------------|
| `/symfony:generate-crud <Entity>` | Generate CRUD operations |
| `/symfony:generate-command <Name>` | Generate CLI command |
| `/symfony:api-endpoint <Resource>` | Generate API endpoint |

### Analysis Commands

| Command | Description |
|---------|-------------|
| `/symfony:check-architecture` | Validate Clean Architecture |
| `/symfony:check-code-quality` | Run code quality checks |
| `/symfony:check-compliance` | Check DDD compliance |
| `/symfony:check-security` | Security audit |
| `/symfony:check-testing` | Test coverage analysis |

### Database Commands

| Command | Description |
|---------|-------------|
| `/symfony:migration-plan <Change>` | Plan database migration |
| `/symfony:optimize-doctrine` | Optimize Doctrine queries |

---

## Flutter Commands (`/flutter:`)

Mobile development with Flutter/Dart.

### Code Generation

| Command | Description |
|---------|-------------|
| `/flutter:generate-feature <Name>` | Generate feature module |
| `/flutter:generate-widget <Name>` | Generate widget |

### Analysis Commands

| Command | Description |
|---------|-------------|
| `/flutter:check-architecture` | Validate architecture |
| `/flutter:check-code-quality` | Run code quality checks |
| `/flutter:check-compliance` | Check rule compliance |
| `/flutter:check-security` | Security audit |
| `/flutter:check-testing` | Test coverage analysis |
| `/flutter:analyze-performance` | Performance analysis |

### Testing Commands

| Command | Description |
|---------|-------------|
| `/flutter:golden-update` | Update golden files |

### Localization Commands

| Command | Description |
|---------|-------------|
| `/flutter:localization-check` | Validate i18n setup |

---

## Python Commands (`/python:`)

Python backend and API development.

### Code Generation

| Command | Description |
|---------|-------------|
| `/python:generate-endpoint <Name>` | Generate API endpoint |
| `/python:generate-model <Name>` | Generate data model |

### Analysis Commands

| Command | Description |
|---------|-------------|
| `/python:check-architecture` | Validate architecture |
| `/python:check-code-quality` | Run code quality checks |
| `/python:check-compliance` | Check rule compliance |
| `/python:check-security` | Security audit |
| `/python:check-testing` | Test coverage analysis |

### Type Commands

| Command | Description |
|---------|-------------|
| `/python:type-coverage` | Analyze type hint coverage |

### Async Commands

| Command | Description |
|---------|-------------|
| `/python:async-check` | Validate async/await usage |

### Dependency Commands

| Command | Description |
|---------|-------------|
| `/python:dependency-audit` | Audit dependencies for vulnerabilities |

---

## React Commands (`/react:`)

Frontend development with React/TypeScript.

### Code Generation

| Command | Description |
|---------|-------------|
| `/react:generate-component <Name>` | Generate React component |
| `/react:generate-hook <Name>` | Generate custom hook |
| `/react:storybook-story <Component>` | Generate Storybook story |

### Analysis Commands

| Command | Description |
|---------|-------------|
| `/react:check-architecture` | Validate architecture |
| `/react:check-code-quality` | Run code quality checks |
| `/react:check-compliance` | Check rule compliance |
| `/react:check-security` | Security audit |
| `/react:check-testing` | Test coverage analysis |

### Performance Commands

| Command | Description |
|---------|-------------|
| `/react:bundle-analyze` | Analyze bundle size |

### Accessibility Commands

| Command | Description |
|---------|-------------|
| `/react:accessibility-check` | A11y validation |

---

## React Native Commands (`/reactnative:`)

Mobile development with React Native.

### Code Generation

| Command | Description |
|---------|-------------|
| `/reactnative:generate-screen <Name>` | Generate screen component |
| `/reactnative:native-module <Name>` | Generate native module |

### Analysis Commands

| Command | Description |
|---------|-------------|
| `/reactnative:check-architecture` | Validate architecture |
| `/reactnative:check-code-quality` | Run code quality checks |
| `/reactnative:check-compliance` | Check rule compliance |
| `/reactnative:check-security` | Security audit |
| `/reactnative:check-testing` | Test coverage analysis |

### App Commands

| Command | Description |
|---------|-------------|
| `/reactnative:app-size` | Analyze app bundle size |
| `/reactnative:deep-link <Route>` | Configure deep linking |
| `/reactnative:store-prepare` | Prepare for app store |

---

## Project Commands (`/project:`)

Available with Project installation.

| Command | Description |
|---------|-------------|
| `/project:generate-backlog <Feature>` | Generate backlog |
| `/project:validate-backlog` | Validate backlog quality |
| `/project:decompose-tasks <Epic>` | Break down epic into tasks |
| `/project:add-epic <Name>` | Create a new EPIC |
| `/project:add-story <Epic> <Name>` | Create a User Story |
| `/project:add-task <US> <Desc> <Est>` | Create a task |
| `/project:list-epics` | List all EPICs |
| `/project:list-stories` | List User Stories |
| `/project:list-tasks` | List tasks |
| `/project:move-story <US> <Dest>` | Move story to sprint/status |
| `/project:move-task <Task> <Status>` | Change task status |
| `/project:board` | Display Kanban board |
| `/project:sprint-status` | Show sprint metrics |
| `/project:update-epic <Epic>` | Update an EPIC |
| `/project:update-story <US>` | Update a User Story |

---

## Command Output Formats

Commands typically output in structured formats:

### Audit Commands

```
══════════════════════════════════════════════════════════════
AUDIT REPORT
══════════════════════════════════════════════════════════════

[ ] Issue 1
[x] Check passed
[ ] Issue 2

Summary: 2 issues found
```

### Generation Commands

```
Generated files:
- src/Component/NewComponent.tsx
- src/Component/NewComponent.test.tsx
- src/Component/NewComponent.stories.tsx
```

### Check Commands

```
Architecture Check
──────────────────────────────────────────────────────────────
✓ Layer separation: PASS
✗ Dependency direction: FAIL
  - Infrastructure depends on Domain (src/Infra/Service.php:15)

Score: 85/100
```

---

## Creating Custom Commands

Add markdown files to `.claude/commands/{namespace}/`:

```markdown
# My Custom Command

Description of what this command does.

## Arguments
$ARGUMENTS

## Process

### Step 1
What to do first...

### Step 2
What to do next...

## Output
Expected output format...
```

Place in:
- `.claude/commands/common/` for `/common:` namespace
- `.claude/commands/myproject/` for `/myproject:` namespace

---

## Best Practices

1. **Use check commands** before commits
2. **Generate with commands** for consistent code
3. **Audit regularly** with full-audit
4. **Document decisions** with architecture-decision
5. **Track sprints** with sprint commands
