---
description: Check React Native Code Quality
argument-hint: [arguments]
---

# Check React Native Code Quality

## Arguments

$ARGUMENTS

## Plan Mode

> Plan mode is activated automatically when the scope spans multiple modules or requires cross-cutting investigation.

## MISSION

You are a React Native code quality audit expert. Your mission is to analyze code compliance according to the standards defined in `.claude/rules/03-coding-standards.md`, `.claude/rules/04-solid-principles.md` and `.claude/rules/05-kiss-dry-yagni.md`.

### Step 1: Configuration analysis

1. Verify TypeScript presence and configuration
2. Verify ESLint presence and configuration
3. Verify Prettier presence and configuration
4. Analyze package.json configuration files

### Step 2: TypeScript Verification (7 points)

Verify TypeScript configuration:

#### 🔧 tsconfig.json Configuration

- [ ] **(2 pts)** `"strict": true` enabled
- [ ] **(1 pt)** `"noImplicitAny": true`
- [ ] **(1 pt)** `"strictNullChecks": true`
- [ ] **(1 pt)** `"noUnusedLocals": true` and `"noUnusedParameters": true`
- [ ] **(1 pt)** Path aliases configured (e.g., `@/components`, `@/utils`)
- [ ] **(1 pt)** Correct types for React Native (`@types/react`, `@types/react-native`)

**Files to check:**
```bash
tsconfig.json
package.json
```

#### 📝 TypeScript Usage in Code

Check 5-10 random TypeScript files:

- [ ] No `any` (except justified and documented cases)
- [ ] Interfaces/Types well defined for props
- [ ] Types for functions (params and return)
- [ ] No `@ts-ignore` or `@ts-nocheck` (except documented exceptions)
- [ ] Use of generics when appropriate

**Files to check:**
```bash
src/**/*.tsx
src/**/*.ts
```

### Step 3: ESLint Verification (6 points)

#### 🔍 ESLint Configuration

- [ ] **(2 pts)** `.eslintrc.js` or `.eslintrc.json` present and configured
- [ ] **(1 pt)** Plugin `@react-native` or equivalent configured
- [ ] **(1 pt)** Plugin `@typescript-eslint` configured
- [ ] **(1 pt)** React Hooks rules enabled (`react-hooks/rules-of-hooks`, `react-hooks/exhaustive-deps`)
- [ ] **(1 pt)** ESLint scripts in package.json (`lint`, `lint:fix`)

**Files to check:**
```bash
.eslintrc.js
.eslintrc.json
package.json
```

#### ⚠️ ESLint Errors Verification

Run ESLint and analyze results:

```bash
npm run lint
# or
yarn lint
```

- [ ] 0 ESLint errors
- [ ] < 10 ESLint warnings
- [ ] No disabled rules without justification

### Step 4: Prettier Verification (3 points)

- [ ] **(1 pt)** `.prettierrc` present with consistent configuration
- [ ] **(1 pt)** ESLint + Prettier integration (no conflicts)
- [ ] **(1 pt)** Format script in package.json

**Files to check:**
```bash
.prettierrc
.prettierrc.js
.prettierrc.json
package.json
```

### Step 5: SOLID Principles (4 points)

Reference: `.claude/rules/04-solid-principles.md`

Analyze 3-5 main components or modules:

- [ ] **(1 pt)** **S - Single Responsibility**: Each component/function has a single responsibility
- [ ] **(1 pt)** **O - Open/Closed**: Extensions possible without modifying existing code
- [ ] **(1 pt)** **L - Liskov Substitution**: Components are interchangeable
- [ ] **(1 pt)** **D - Dependency Inversion**: Dependencies via props/injection, no tight coupling

**Files to analyze:**
```bash
src/components/**/*.tsx
src/features/**/*.tsx
src/hooks/**/*.ts
```

### Step 6: KISS, DRY, YAGNI Principles (5 points)

Reference: `.claude/rules/05-kiss-dry-yagni.md`

- [ ] **(2 pts)** **KISS (Keep It Simple)**: Simple and readable code, no over-engineering
- [ ] **(2 pts)** **DRY (Don't Repeat Yourself)**: No code duplication, reuse via hooks/utils
- [ ] **(1 pt)** **YAGNI (You Aren't Gonna Need It)**: No unused code or speculative features

Check:
- Duplicated functions that could be factored
- Complex logic that could be simplified
- Dead or commented code that should be removed

**Files to analyze:**
```bash
src/**/*.ts
src/**/*.tsx
```

### Step 7: React Native Code Standards

Reference: `.claude/rules/03-coding-standards.md`

#### 📱 Specific Best Practices

- [ ] Correct use of `StyleSheet.create()` (not inline styles everywhere)
- [ ] Constants for colors, spacing, typography
- [ ] Functional components with hooks (no class components)
- [ ] Correct state management (useState, useReducer as needed)
- [ ] Use of `useCallback` for handlers passed as props
- [ ] Use of `useMemo` for expensive calculations

**Files to check:**
```bash
src/components/**/*.tsx
src/theme/
src/constants/
```

### Step 8: Calculate score

```
┌──────────────────────────────────┬─────────┬────────┐
│ Criterion                        │ Score   │ Status │
├──────────────────────────────────┼─────────┼────────┤
│ TypeScript Configuration         │ XX/7    │ ✅/⚠️/❌│
│ ESLint                           │ XX/6    │ ✅/⚠️/❌│
│ Prettier                         │ XX/3    │ ✅/⚠️/❌│
│ SOLID Principles                 │ XX/4    │ ✅/⚠️/❌│
│ KISS, DRY, YAGNI                 │ XX/5    │ ✅/⚠️/❌│
├──────────────────────────────────┼─────────┼────────┤
│ TOTAL CODE QUALITY               │ XX/25   │ ✅/⚠️/❌│
└──────────────────────────────────┴─────────┴────────┘
```

**Legend:**
- ✅ Excellent (≥ 20/25)
- ⚠️ Warning (15-19/25)
- ❌ Critical (< 15/25)

### Step 9: Detailed report

## 📊 CODE QUALITY AUDIT RESULTS

### ✅ Strengths

List identified good practices:
- [Practice 1 with code example]
- [Practice 2 with code example]

### ⚠️ Improvement Points

List identified issues by priority:

1. **[Issue 1]**
   - **Severity:** Critical/High/Medium
   - **Location:** [Affected files]
   - **Example:**
   ```typescript
   // Problematic code
   ```
   - **Recommendation:**
   ```typescript
   // Fixed code
   ```

2. **[Issue 2]**
   - **Severity:** Critical/High/Medium
   - **Location:** [Affected files]
   - **Example:**
   ```typescript
   // Problematic code
   ```
   - **Recommendation:**
   ```typescript
   // Fixed code
   ```

### 📈 Quality Metrics

Execute and report the following metrics:

#### ESLint Errors
```bash
npm run lint
```
- **Errors:** XX
- **Warnings:** XX
- **Files analyzed:** XX

#### Code Complexity

If SonarQube or other tool available:
- **Average cyclomatic complexity:** XX (target: < 10)
- **Lines of code:** XX
- **Duplication:** XX% (target: < 5%)
- **Technical debt:** XX hours

#### TypeScript

- **Strict typing percentage:** XX% (target: 100%)
- **Use of `any`:** XX occurrences (target: 0)
- **TypeScript errors:** XX (target: 0)

### 🎯 TOP 3 PRIORITY ACTIONS

#### 1. [ACTION #1]
- **Effort:** Low/Medium/High
- **Impact:** Critical/High/Medium
- **Description:** [Issue detail]
- **Solution:** [Concrete action]
- **Files:** [File list]
- **Example:**
```typescript
// Before
[problematic code]

// After
[fixed code]
```

#### 2. [ACTION #2]
- **Effort:** Low/Medium/High
- **Impact:** Critical/High/Medium
- **Description:** [Issue detail]
- **Solution:** [Concrete action]
- **Files:** [File list]

#### 3. [ACTION #3]
- **Effort:** Low/Medium/High
- **Impact:** Critical/High/Medium
- **Description:** [Issue detail]
- **Solution:** [Concrete action]
- **Files:** [File list]

---

## 📚 References

- `.claude/rules/03-coding-standards.md` - Code standards
- `.claude/rules/04-solid-principles.md` - SOLID principles
- `.claude/rules/05-kiss-dry-yagni.md` - KISS, DRY, YAGNI principles
- `.claude/rules/06-tooling.md` - Tool configuration

---

**Final score: XX/25**
