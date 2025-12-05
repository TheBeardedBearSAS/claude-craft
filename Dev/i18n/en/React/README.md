# React TypeScript Development Rules for Claude Code

## Overview

This folder contains a complete set of rules, templates, and checklists for React TypeScript development with Claude Code. These rules ensure consistency, quality, and maintainability of code across all your React projects.

## Folder Structure

```
React/
├── CLAUDE.md.template          # Main configuration (to copy to your project)
├── README.md                   # This file
│
├── rules/                      # Detailed development rules
│   ├── 00-project-context.md.template
│   ├── 01-workflow-analysis.md
│   ├── 02-architecture.md
│   ├── 03-coding-standards.md
│   ├── 04-solid-principles.md
│   ├── 05-kiss-dry-yagni.md
│   ├── 06-tooling.md
│   ├── 07-testing.md
│   ├── 08-quality-tools.md
│   ├── 09-git-workflow.md
│   ├── 10-documentation.md
│   ├── 11-security.md
│   ├── 12-performance.md          # To be created
│   ├── 13-state-management.md     # To be created
│   └── 14-styling.md              # To be created
│
├── templates/                  # Code templates
│   ├── component.md           # React component template
│   ├── hook.md                # Custom hook template
│   ├── context.md             # To be created
│   ├── test-component.md      # To be created
│   └── test-hook.md           # To be created
│
└── checklists/                # Validation checklists
    ├── pre-commit.md          # Pre-commit checklist
    ├── new-feature.md         # New feature checklist
    ├── refactoring.md         # To be created
    └── security.md            # To be created
```

## Usage

### 1. Initialize a New Project

1. **Copy CLAUDE.md.template** to your project:
   ```bash
   cp CLAUDE.md.template /path/to/your/project/CLAUDE.md
   ```

2. **Replace placeholders** in CLAUDE.md:
   - `{{PROJECT_NAME}}`: Your project name
   - `{{TECH_STACK}}`: Complete technology stack
   - `{{REACT_VERSION}}`: React version
   - `{{TYPESCRIPT_VERSION}}`: TypeScript version
   - `{{BUILD_TOOL}}`: Vite, Next.js, etc.
   - `{{PACKAGE_MANAGER}}`: pnpm, npm, yarn
   - Etc.

3. **Copy rules/00-project-context.md.template**:
   ```bash
   cp rules/00-project-context.md.template /path/to/your/project/docs/project-context.md
   ```

4. **Fill in project context** with specific information.

### 2. Configure Claude Code

In your project, Claude Code will automatically read the `CLAUDE.md` file and apply all defined rules.

### 3. Reference Rules

Each rules file can be referenced in the main CLAUDE.md:

```markdown
**Reference**: `rules/01-workflow-analysis.md`
```

Claude Code will have access to all these rules to assist you in development.

## Main Rules

### 1. Analysis Workflow (01-workflow-analysis.md)

**Before writing code, ALWAYS**:
- Analyze existing code
- Understand the need
- Design the solution
- Document decisions

### 2. Architecture (02-architecture.md)

- **Feature-based**: Organization by business functionality
- **Atomic Design**: Hierarchy atoms → molecules → organisms → templates
- **Container/Presenter**: Logic/presentation separation
- **Custom Hooks**: Reusable logic

### 3. Code Standards (03-coding-standards.md)

- **TypeScript Strict**: Strict mode enabled
- **ESLint**: Strict configuration
- **Prettier**: Automatic formatting
- **Conventions**: Consistent naming

### 4. SOLID Principles (04-solid-principles.md)

Application of SOLID principles in React with concrete examples.

### 5. KISS, DRY, YAGNI (05-kiss-dry-yagni.md)

- **KISS**: Simplicity first
- **DRY**: Avoid duplication intelligently
- **YAGNI**: Implement only what's necessary

### 6. Tooling (06-tooling.md)

Complete configuration of:
- Vite / Next.js
- pnpm / npm
- Docker + Makefile
- Build optimization

### 7. Testing (07-testing.md)

- **Test pyramid**: 70% unit, 20% integration, 10% E2E
- **Vitest**: Unit tests
- **React Testing Library**: Component tests
- **MSW**: API mocking
- **Playwright**: E2E tests

### 8. Quality (08-quality-tools.md)

- **ESLint**: Linting
- **Prettier**: Formatting
- **TypeScript**: Type checking
- **Husky**: Git hooks
- **Commitlint**: Conventional commits

### 9. Git Workflow (09-git-workflow.md)

- **Git Flow**: Branching strategy
- **Conventional Commits**: Standardized messages
- **Pull Requests**: Review workflow
- **Versioning**: Semantic versioning

### 10. Documentation (10-documentation.md)

- **JSDoc/TSDoc**: Code documentation
- **Storybook**: Component documentation
- **README**: Project documentation
- **Changelog**: Version history

### 11. Security (11-security.md)

- **XSS Prevention**: HTML sanitization
- **CSRF Protection**: Tokens and validation
- **Input Validation**: Zod schemas
- **Authentication**: JWT, protected routes
- **Dependencies**: Regular audits

## Code Templates

### React Component (templates/component.md)

Complete template to create React components with:
- TypeScript
- Typed props
- JSDoc
- Tests
- Storybook

### Custom Hook (templates/hook.md)

Template to create custom hooks with:
- TypeScript
- Documentation
- Tests
- Usage examples

## Checklists

### Pre-Commit (checklists/pre-commit.md)

Checklist to verify before each commit:
- Code quality
- Tests
- Documentation
- Security
- Git

### New Feature (checklists/new-feature.md)

Complete workflow to implement a new feature:
1. Analysis and planning
2. Technical design
3. Implementation
4. Tests
5. Quality and performance
6. Documentation
7. Review and merge
8. Deployment and monitoring

## Useful Commands

### Development

```bash
# Create new React + TypeScript project
npm create vite@latest my-app -- --template react-ts
cd my-app
pnpm install

# Copy rules
cp /path/to/React/CLAUDE.md.template ./CLAUDE.md
```

### Quality

```bash
# Check everything
pnpm run quality

# Detail
pnpm run lint
pnpm run type-check
pnpm run test
pnpm run build
```

## Remaining Files to Create

To complete this rules system, these files remain to be created:

### Rules

- [ ] `12-performance.md`: React optimizations (memo, lazy, code splitting)
- [ ] `13-state-management.md`: React Query, Zustand, Context API
- [ ] `14-styling.md`: Tailwind, CSS Modules, styled-components

### Templates

- [ ] `context.md`: Context Provider template
- [ ] `test-component.md`: Component test template
- [ ] `test-hook.md`: Hook test template

### Checklists

- [ ] `refactoring.md`: Secure refactoring checklist
- [ ] `security.md`: Complete security audit

## Contribution

To improve these rules:

1. Create a branch `feature/improve-react-rules`
2. Modify rules files
3. Test on a real project
4. Create a Pull Request with improvements

## Resources

### Official Documentation

- React: https://react.dev
- TypeScript: https://www.typescriptlang.org
- Vite: https://vitejs.dev
- TanStack Query: https://tanstack.com/query
- React Router: https://reactrouter.com

### Recommended Tools

- Vite: Fast build tool
- pnpm: Performant package manager
- Vitest: Fast testing framework
- Playwright: E2E tests
- Storybook: Component documentation

## License

These rules are provided "as-is" for use with Claude Code.

## Support

For questions or suggestions:
- Create an issue in the repository
- Consult Claude Code documentation

---

**Last updated**: 2025-12-03
**Version**: 1.0.0
**Maintainer**: TheBeardedCTO
