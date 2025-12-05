# Check Python Architecture

## Arguments

$ARGUMENTS (optional: path to project to analyze)

## MISSION

Perform a complete architecture audit of the Python project following Clean Architecture and Hexagonal Architecture principles defined in project rules.

### Step 1: Analyze Project Structure

Examine directory structure and identify:
- [ ] Presence of Domain/Application/Infrastructure/Presentation layers
- [ ] Clear separation between layers (no inverted dependencies)
- [ ] Organization of modules by business domain
- [ ] Package structure consistent with architecture rules

**Reference**: `rules/02-architecture.md` sections "Clean Architecture" and "Hexagonal Architecture"

### Step 2: Verify Dependencies Between Layers

Analyze imports and dependencies:
- [ ] Domain depends on no other layer
- [ ] Application depends only on Domain
- [ ] Infrastructure depends on Domain and Application only
- [ ] Presentation contains no business logic
- [ ] Dependency rule respected (inward only)

**Verify**: No imports of external layers in Domain/Application

### Step 3: Interfaces and Ports

Verify ports and adapters implementation:
- [ ] Interfaces (ports) defined in Domain/Application
- [ ] Implementations (adapters) in Infrastructure
- [ ] Use of dependency injection
- [ ] No strong coupling with external frameworks

**Reference**: `rules/02-architecture.md` section "Ports and Adapters"

### Step 4: Entities and Value Objects

Check domain modeling:
- [ ] Rich entities with encapsulated business logic
- [ ] Immutable value objects
- [ ] Properly delimited aggregates
- [ ] Domain Events if applicable
- [ ] No infrastructure logic in entities

**Reference**: `rules/02-architecture.md` section "Domain Layer"

### Step 5: Services and Use Cases

Analyze application logic organization:
- [ ] Use Cases/Application Services clearly identified
- [ ] One Use Case = One business action
- [ ] Domain Services for complex business logic
- [ ] No business logic in controllers/handlers
- [ ] Transactions managed at Application level

**Reference**: `rules/02-architecture.md` section "Application Layer"

### Step 6: SOLID Principles

Verify application of SOLID principles:
- [ ] Single Responsibility: One class = One reason to change
- [ ] Open/Closed: Extension through inheritance/composition, not modification
- [ ] Liskov Substitution: Subtypes are substitutable
- [ ] Interface Segregation: Specific and minimal interfaces
- [ ] Dependency Inversion: Dependency on abstractions

**Reference**: `rules/04-solid-principles.md`

### Step 7: Calculate Score

Point attribution (out of 25):
- Structure and layer separation: 6 points
- Dependency respect: 6 points
- Ports and Adapters: 4 points
- Domain modeling: 4 points
- Use Cases and Services: 3 points
- SOLID Principles: 2 points

## OUTPUT FORMAT

```
PYTHON ARCHITECTURE AUDIT
================================

OVERALL SCORE: XX/25

STRENGTHS:
- [List of positive points identified]

IMPROVEMENTS:
- [List of minor improvements]

CRITICAL ISSUES:
- [List of serious architecture violations]

DETAILS BY CATEGORY:

1. STRUCTURE AND LAYERS (XX/6)
   Status: [Details of structure]

2. DEPENDENCIES (XX/6)
   Status: [Dependency analysis]

3. PORTS AND ADAPTERS (XX/4)
   Status: [Interface implementation]

4. DOMAIN MODELING (XX/4)
   Status: [Quality of entities and VOs]

5. USE CASES (XX/3)
   Status: [Application logic organization]

6. SOLID PRINCIPLES (XX/2)
   Status: [SOLID principles application]

TOP 3 PRIORITY ACTIONS:
1. [Most critical action with estimated impact]
2. [Second priority action]
3. [Third priority action]
```

## NOTES

- Use `grep`, `find`, and code analysis to detect violations
- Provide concrete examples of problematic files/classes
- Suggest precise refactorings for each problem identified
- Prioritize actions based on maintainability impact
