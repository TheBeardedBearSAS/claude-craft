# Complete Index - Flutter Development Rules

## Overview

Complete structure of Flutter development rules for Claude Code, inspired by the Symfony structure but adapted to Flutter/Dart.

**Total**: 26 files
- 1 main CLAUDE.md.template
- 1 README usage guide
- 14 rules files (rules/)
- 5 code templates (templates/)
- 4 checklists (checklists/)
- 1 index (this file)

---

## Main Files

### CLAUDE.md.template
Main file to copy into each Flutter project. Contains:
- Project context
- Fundamental rules
- Mandatory workflow
- Makefile commands
- Instructions for Claude

### README.md
Complete usage guide:
- How to initialize a new project
- Recommended structure
- Development workflow
- Tool configuration

---

## Rules (14 files)

### 00-project-context.md.template
Project context template with placeholders:
- Project overview
- Global architecture
- Technology stack
- Specificities and conventions
- Variables to replace: {{PROJECT_NAME}}, {{TECH_STACK}}, etc.

### 01-workflow-analysis.md (27 KB)
Mandatory methodology before coding:
- Phase 1: Understanding the need
- Phase 2: Exploring existing code
- Phase 3: Solution design
- Phase 4: Test plan
- Phase 5: Estimation and planning
- Phase 6: Post-implementation review
- Analysis templates
- Concrete examples (favorites feature)

### 02-architecture.md (53 KB)
Clean Architecture for Flutter:
- The 3 layers (Domain, Data, Presentation)
- Detailed folder structure
- Entities, Repositories, Use Cases
- Models, DataSources
- Complete BLoC pattern
- Dependency Injection
- Complete code examples

### 03-coding-standards.md (24 KB)
Dart/Flutter code standards:
- Naming conventions
- Formatting and style
- Code organization
- Flutter widgets (const, extraction)
- Types and inference
- Documentation (dartdoc)
- Dart extensions
- Async/await
- Linters configuration

### 04-solid-principles.md (38 KB)
SOLID principles with Flutter examples:
- S - Single Responsibility Principle
- O - Open/Closed Principle
- L - Liskov Substitution Principle
- I - Interface Segregation Principle
- D - Dependency Inversion Principle
- Concrete examples for each principle
- Widgets, BLoCs, repositories
- Dependency diagrams

### 05-kiss-dry-yagni.md (30 KB)
Simplicity principles:
- KISS: Keep It Simple, Stupid
- DRY: Don't Repeat Yourself
- YAGNI: You Aren't Gonna Need It
- Examples of over-complication vs simple solutions
- State management adapted to complexity
- Reusable widgets
- Balance between principles

### 06-tooling.md (10 KB)
Tools and commands:
- Essential Flutter CLI
- Pub commands
- Docker for Flutter
- Complete Makefile
- FVM (Flutter Version Management)
- Useful scripts
- CI/CD (GitHub Actions, GitLab CI)
- VS Code configuration
- DevTools

### 07-testing.md (19 KB)
Complete test strategy:
- Test pyramid (70% unit, 20% widget, 10% integration)
- Unit tests (entities, use cases, BLoCs)
- Widget tests
- Integration tests
- Golden tests
- Mocking with Mocktail
- Test coverage
- Best practices (AAA pattern)

### 08-quality-tools.md
Quality tools:
- Dart Analyze
- DCM (Dart Code Metrics)
- Very Good Analysis
- Flutter Lints
- Custom lint rules
- CI/CD integration
- Makefile targets

### 09-git-workflow.md
Git workflow:
- Conventional Commits
- Branch strategy (GitFlow)
- Pre-commit hooks
- CI/CD
- Useful Git commands

### 10-documentation.md
Documentation standards:
- Dartdoc format
- README.md structure
- CHANGELOG.md
- API documentation
- Complete documentation examples

### 11-security.md
Flutter security:
- flutter_secure_storage
- API keys management
- Environment variables
- Obfuscation
- HTTPS and certificate pinning
- Input validation
- Authentication (JWT)
- Permissions
- Security checklist

### 12-performance.md
Performance optimization:
- const widgets
- ListView optimization
- Images (caching, lazy loading)
- Avoiding rebuilds
- DevTools profiling
- Lazy loading & code splitting
- Performance checklist

### 13-state-management.md
State management patterns:
- Decision tree (when to use what)
- StatefulWidget
- ValueNotifier
- Provider
- Riverpod (recommended)
- BLoC (recommended for complex apps)
- Pattern comparison
- Best practices
- Recommendations by project size

---

## Templates (5 files)

### widget.md
Widget templates:
- Stateless Widget
- Stateful Widget
- Consumer Widget (BLoC)

### bloc.md
Complete BLoC template:
- Events
- States
- BLoC class

### repository.md
Repository template:
- Interface (Domain layer)
- Implementation (Data layer)

### test-widget.md
Widget test template:
- Basic setup
- Display tests
- Interaction tests
- Update tests

### test-unit.md
Unit test template:
- Setup with mocks
- Success tests
- Error tests
- Validation tests

---

## Checklists (4 files)

### pre-commit.md
Pre-commit checklist:
- Code quality
- Tests
- Documentation
- Git
- Architecture
- Performance
- Security

### new-feature.md
New feature checklist:
- Analysis
- Domain layer
- Data layer
- Presentation layer
- Integration
- Documentation
- Quality

### refactoring.md
Safe refactoring checklist:
- Preparation
- During refactoring
- Verifications
- Before merge

### security.md
Security audit checklist:
- Sensitive data
- API & Network
- Authentication
- Validation
- Permissions
- Production

---

## Statistics

### File sizes

| File | Size | Approx. lines |
|------|------|---------------|
| 01-workflow-analysis.md | 27 KB | ~800 |
| 02-architecture.md | 53 KB | ~1600 |
| 03-coding-standards.md | 24 KB | ~700 |
| 04-solid-principles.md | 38 KB | ~1200 |
| 05-kiss-dry-yagni.md | 30 KB | ~900 |
| 06-tooling.md | 10 KB | ~300 |
| 07-testing.md | 19 KB | ~600 |
| 08-quality-tools.md | ~5 KB | ~150 |
| 09-git-workflow.md | ~4 KB | ~120 |
| 10-documentation.md | ~5 KB | ~150 |
| 11-security.md | ~6 KB | ~180 |
| 12-performance.md | ~5 KB | ~150 |
| 13-state-management.md | ~7 KB | ~210 |
| **TOTAL Rules** | **~233 KB** | **~7060 lines** |

### Coverage

**Covered topics**:
- ✅ Architecture (Complete Clean Architecture)
- ✅ Coding standards (Effective Dart)
- ✅ Design principles (SOLID, KISS, DRY, YAGNI)
- ✅ Testing (Unit, Widget, Integration, Golden)
- ✅ Tooling (CLI, Docker, Makefile, CI/CD)
- ✅ Quality (Analyze, Linters, Metrics)
- ✅ Git workflow (Conventional Commits, Branching)
- ✅ Documentation (Dartdoc, README, CHANGELOG)
- ✅ Security (Storage, API keys, HTTPS, Auth)
- ✅ Performance (Optimizations, Profiling)
- ✅ State management (BLoC, Riverpod, Provider)
- ✅ Code templates
- ✅ Practical checklists

---

## Usage

### For a new project

1. Copy `CLAUDE.md.template` to `.claude/CLAUDE.md`
2. Copy `rules/`, `templates/`, `checklists/` to `.claude/`
3. Customize with project info
4. Create `Makefile` at root
5. Configure `analysis_options.yaml`
6. Follow the rules!

### For Claude Code

Read `.claude/CLAUDE.md` at the beginning of each session to:
- Understand project architecture
- Know conventions
- Apply best practices
- Use appropriate templates
- Follow checklists

---

## Comparison with Symfony Rules

### Similarities
- Modular structure (rules/, templates/, checklists/)
- Mandatory analysis workflow
- SOLID principles
- Testing strategy
- Git workflow
- Documentation standards

### Flutter specificities
- Clean Architecture (instead of Symfony architecture)
- Widget composition
- State management (BLoC, Riverpod)
- const optimizations
- DevTools profiling
- flutter_secure_storage
- Material Design / Cupertino

### Improvements
- More detailed code templates
- More examples
- More complete checklists
- Decision trees (state management, architecture)
- Dependency diagrams

---

## Maintenance

### Updates

Update rules when:
- New Flutter/Dart version
- New best practices
- New important packages
- Project feedback

### Versioning

Format: `MAJOR.MINOR.PATCH`
- MAJOR: Architecture or principle changes
- MINOR: Rules or template additions
- PATCH: Corrections and clarifications

**Current version**: 1.0.0

---

## Additional Resources

### Documentation
- [Flutter Documentation](https://docs.flutter.dev/)
- [Effective Dart](https://dart.dev/guides/language/effective-dart)
- [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)

### Essential Packages
- flutter_bloc: State management
- riverpod: State management
- freezed: Code generation
- dartz: Functional programming
- get_it: Dependency injection
- dio: HTTP client
- mocktail: Testing

---

**Created on**: 2024-12-03
**Last updated**: 2024-12-03
**Version**: 1.0.0
**Author**: Claude Code Assistant
