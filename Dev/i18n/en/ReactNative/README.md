# React Native Development Rules for Claude Code

Comprehensive development rules for React Native (TypeScript + Expo) for Claude Code.

---

## 📁 Structure

```
ReactNative/
├── README.md                           # This file
├── CLAUDE.md.template                  # Main template for projects
├── rules/                              # Detailed rules (15 files)
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
│   ├── 12-performance.md
│   ├── 13-state-management.md
│   └── 14-navigation.md
├── templates/                          # Code templates
│   ├── screen.md
│   ├── component.md
│   ├── hook.md
│   └── test-component.md
└── checklists/                         # Validation checklists
    ├── pre-commit.md
    ├── new-feature.md
    ├── refactoring.md
    └── security.md
```

---

## 🚀 Quick Start

### For a New Project

1. **Copy the template**:
   ```bash
   cp CLAUDE.md.template /path/to/your/project/.claude/CLAUDE.md
   ```

2. **Customize**:
   - Replace `{{PROJECT_NAME}}` with the project name
   - Replace `{{TECH_STACK}}` with the technology stack
   - Fill in specific information

3. **Copy the rules** (optional but recommended):
   ```bash
   cp -r rules/ /path/to/your/project/.claude/rules/
   cp -r templates/ /path/to/your/project/.claude/templates/
   cp -r checklists/ /path/to/your/project/.claude/checklists/
   ```

### For an Existing Project

1. **Adapt gradually**:
   - Start with CLAUDE.md
   - Add priority rules
   - Integrate checklists
   - Adopt templates

---

## 📚 Documentation

### Rules by Category

#### Fundamentals
- **00-project-context**: Project context template
- **01-workflow-analysis**: Mandatory analysis process
- **02-architecture**: React Native/Expo architecture
- **03-coding-standards**: TypeScript/React Native standards

#### Design Principles
- **04-solid-principles**: SOLID adapted to React Native
- **05-kiss-dry-yagni**: Simplicity principles

#### Tools & Quality
- **06-tooling**: Expo CLI, EAS, Metro
- **07-testing**: Jest, Testing Library, Detox
- **08-quality-tools**: ESLint, Prettier, TypeScript
- **09-git-workflow**: Git & Conventional Commits
- **10-documentation**: Documentation standards

#### Production
- **11-security**: Mobile security (SecureStore, etc.)
- **12-performance**: Optimizations (Hermes, FlatList, etc.)
- **13-state-management**: React Query, Zustand, MMKV
- **14-navigation**: Expo Router

---

## 🎯 Core Rules

### RULE #1: MANDATORY ANALYSIS
**Before any code, complete analysis.**

See: [rules/01-workflow-analysis.md](./rules/01-workflow-analysis.md)

### RULE #2: ARCHITECTURE FIRST
**Respect the established architecture.**

See: [rules/02-architecture.md](./rules/02-architecture.md)

### RULE #3: CODE STANDARDS
**TypeScript strict, ESLint, Prettier.**

See: [rules/03-coding-standards.md](./rules/03-coding-standards.md)

### RULE #4: SOLID PRINCIPLES
**Apply SOLID, KISS, DRY, YAGNI.**

See: [rules/04-solid-principles.md](./rules/04-solid-principles.md)

### RULE #5: MANDATORY TESTS
**Coverage > 80%.**

See: [rules/07-testing.md](./rules/07-testing.md)

### RULE #6: SECURITY
**Security by design.**

See: [rules/11-security.md](./rules/11-security.md)

### RULE #7: PERFORMANCE
**60 FPS target.**

See: [rules/12-performance.md](./rules/12-performance.md)

---

## 📋 Templates

### Screen Component
Complete template for creating a new screen with Expo Router.

See: [templates/screen.md](./templates/screen.md)

### Reusable Component
Template for reusable component with types, styles, tests.

See: [templates/component.md](./templates/component.md)

### Custom Hook
Template for custom hook with React Query or custom logic.

See: [templates/hook.md](./templates/hook.md)

### Component Test
Complete test template for components.

See: [templates/test-component.md](./templates/test-component.md)

---

## ✅ Checklists

### Pre-Commit
Validation before each commit.

See: [checklists/pre-commit.md](./checklists/pre-commit.md)

**Key points**:
- Code lint (0 errors)
- Tests pass
- Coverage maintained
- Performance OK
- Security check

### New Feature
Complete workflow for new feature.

See: [checklists/new-feature.md](./checklists/new-feature.md)

**Phases**:
1. Analysis
2. Design
3. Setup
4. Implementation (bottom-up)
5. Quality Assurance
6. Documentation
7. Manual Testing
8. Code Review
9. Merge & Deploy
10. Cleanup

### Refactoring
Secure refactoring process.

See: [checklists/refactoring.md](./checklists/refactoring.md)

**Approach**:
- Tests first
- Small commits
- Test continuously
- Preserve behavior

### Security Audit
Complete security audit.

See: [checklists/security.md](./checklists/security.md)

**Areas**:
- Sensitive data storage
- API security
- Input validation
- Authentication
- Dependencies

---

## 🛠 Recommended Stack

### Core
- React Native
- Expo SDK
- TypeScript
- Node.js

### Navigation
- **Expo Router** (file-based routing)

### State Management
- **React Query** (server state)
- **Zustand** (global client state)
- **MMKV** (persistence)

### UI
- StyleSheet (native)
- Reanimated (animations)
- Gesture Handler

### Forms & Validation
- React Hook Form
- Zod

### Testing
- Jest
- React Native Testing Library
- Detox (E2E)

### Tools
- ESLint
- Prettier
- Husky
- EAS CLI

---

## 📖 Using with Claude Code

### Global Configuration

Add to `~/.claude/CLAUDE.md`:

```markdown
# React Native Projects

For React Native projects, follow the rules:
/path/to/ReactNative/CLAUDE.md.template

See complete documentation:
/path/to/ReactNative/
```

### Per-Project Configuration

In the React Native project:

```
my-react-native-app/
├── .claude/
│   ├── CLAUDE.md           # Copied from CLAUDE.md.template
│   ├── rules/              # (optional) Copied from rules/
│   ├── templates/          # (optional) Copied from templates/
│   └── checklists/         # (optional) Copied from checklists/
├── src/
├── app/
└── package.json
```

Claude Code will automatically read `.claude/CLAUDE.md`.

---

## 🎓 Philosophy

### Analysis First
**Think First, Code Later**

Always start by:
1. Understanding the need
2. Analyzing the existing
3. Designing the solution
4. THEN coding

### Architecture Matters
**Clear structure = Maintainable code**

- Feature-based organization
- Separation of concerns
- Clean architecture layers

### Quality Over Speed
**Quality code saves time**

- Tests from the start
- Systematic code review
- Strict standards
- Continuous refactoring

### Security by Design
**Security is not an option**

- Tokens in SecureStore
- Input validation
- HTTPS only
- Dependencies audit

### Performance First
**60 FPS target**

- Hermes engine
- Optimizations (memo, FlatList)
- Images optimized
- Native driver animations

---

## 🔄 Typical Workflow

### Feature Development

```
Requirement received
    ↓
ANALYSIS (mandatory)
    ↓
Design & Planning
    ↓
Setup (branch, ticket)
    ↓
Implementation (bottom-up)
    ├── 1. Types
    ├── 2. Services
    ├── 3. Hooks
    ├── 4. Components
    ├── 5. Screens
    └── 6. Integration
    ↓
Tests
    ↓
Quality Check
    ↓
Documentation
    ↓
Code Review
    ↓
Merge & Deploy
    ↓
Monitor
```

---

## 📊 Quality Metrics

### Targets

- **Code Coverage**: > 80%
- **ESLint**: 0 errors, 0 warnings
- **TypeScript**: 0 errors (strict mode)
- **npm audit**: 0 vulnerabilities
- **Bundle Size**: < 10MB
- **Startup Time**: < 3s
- **FPS**: 60 constant

---

## 🤝 Contributing

To improve these rules:

1. Fork / Clone
2. Create branch (`feature/improvement`)
3. Modify rules
4. Test with a real project
5. Document changes
6. Pull Request

---

## 📄 License

MIT

---

## 👥 Authors

- **Creator**: TheBeardedCTO
- **Contributors**: See CONTRIBUTORS.md

---

## 🔗 Resources

### Official Documentation
- [Expo Docs](https://docs.expo.dev)
- [React Native Docs](https://reactnative.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

### Guides
- [React Query Docs](https://tanstack.com/query)
- [Zustand Docs](https://github.com/pmndrs/zustand)
- [Expo Router Docs](https://docs.expo.dev/router/introduction/)

### Best Practices
- [OWASP Mobile Security](https://owasp.org/www-project-mobile-security/)
- [React Native Performance](https://reactnative.dev/docs/performance)

---

**Version**: 1.0.0
**Last Updated**: 2025-12-03

**Remember**: These rules are guides, not dogmas. Adapt them to your context.
