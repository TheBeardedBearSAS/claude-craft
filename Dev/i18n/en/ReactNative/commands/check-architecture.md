---
description: Check React Native Architecture
argument-hint: [arguments]
---

# Check React Native Architecture

## Arguments

$ARGUMENTS

## Plan Mode

> Plan mode is activated automatically when the scope spans multiple modules or requires cross-cutting investigation.

## MISSION

You are a React Native architecture audit expert. Your mission is to analyze the project's architectural compliance according to the standards defined in `.claude/rules/02-architecture.md`.

### Step 1: Explore structure

1. Analyze the root project structure
2. Identify architecture type (Expo, React Native CLI, Expo Router)
3. Locate main folders: `src/`, `app/`, `components/`, etc.

### Step 2: Verify architectural compliance

Perform the following checks and note each result:

#### 📁 Feature-Based Structure (8 points)

Verify if the project uses feature-based organization:

- [ ] **(2 pts)** Structure by features/domains (e.g., `src/features/auth/`, `src/features/profile/`)
- [ ] **(2 pts)** Each feature contains its own components, hooks, and logic
- [ ] **(2 pts)** Clear separation between `features/` (business) and `shared/` (common)
- [ ] **(2 pts)** Consistent organization across all features

**Files to check:**
```bash
src/features/*/
src/shared/
app/(tabs)/
```

#### 🗂️ Folder Organization (5 points)

- [ ] **(1 pt)** `components/` for reusable components
- [ ] **(1 pt)** `hooks/` for custom hooks
- [ ] **(1 pt)** `services/` or `api/` for network calls
- [ ] **(1 pt)** `utils/` or `helpers/` for utility functions
- [ ] **(1 pt)** `types/` or `models/` for TypeScript definitions

**Files to check:**
```bash
src/components/
src/hooks/
src/services/
src/utils/
src/types/
```

#### 🚦 Expo Router / Navigation (4 points)

If the project uses Expo Router:

- [ ] **(1 pt)** `app/` folder at root with file-based routing structure
- [ ] **(1 pt)** Layouts defined (`_layout.tsx`) for navigation
- [ ] **(1 pt)** Route organization by groups `(tabs)`, `(stack)`, etc.
- [ ] **(1 pt)** Navigation parameter typing

If React Navigation:

- [ ] **(1 pt)** Centralized navigator configuration
- [ ] **(1 pt)** Types for routes and parameters
- [ ] **(1 pt)** Deep linking configured
- [ ] **(1 pt)** Navigation guards if necessary

**Files to check:**
```bash
app/_layout.tsx
app/(tabs)/_layout.tsx
src/navigation/
```

#### 🔌 Layered Architecture (4 points)

- [ ] **(1 pt)** Presentation / logic separation (UI components vs containers)
- [ ] **(1 pt)** Service layer for data access
- [ ] **(1 pt)** Custom hooks for reusable logic
- [ ] **(1 pt)** Centralized state management (Context, Zustand, Redux, etc.)

**Files to check:**
```bash
src/hooks/
src/services/
src/store/ or src/contexts/
```

#### 🎨 Assets Organization (4 points)

- [ ] **(1 pt)** Structured `assets/` folder (images, fonts, icons)
- [ ] **(1 pt)** Constants used for asset paths
- [ ] **(1 pt)** Image optimization (WebP, appropriate dimensions)
- [ ] **(1 pt)** SVG via `react-native-svg` or equivalent

**Files to check:**
```bash
assets/
src/constants/assets.ts
```

### Step 3: React Native Specific Rules

Reference: `.claude/rules/02-architecture.md`

Verify the following points:

#### ⚡ Performance and optimization

- [ ] Use of `React.memo()` for expensive components
- [ ] Appropriate use of `useMemo()` and `useCallback()`
- [ ] No heavy logic in render
- [ ] FlatList/SectionList for long lists (not ScrollView)

#### 🔄 State Management

- [ ] State management solution clearly defined
- [ ] Local vs global state well separated
- [ ] No excessive props drilling

#### 📱 Mobile Specifics

- [ ] SafeAreaView management
- [ ] Platform-specific code support when necessary
- [ ] Keyboard management (KeyboardAvoidingView)
- [ ] Mobile permissions management

### Step 4: Calculate score

Add up the points obtained for each section:

```
┌──────────────────────────────────┬─────────┬────────┐
│ Criterion                        │ Score   │ Status │
├──────────────────────────────────┼─────────┼────────┤
│ Feature-Based Structure          │ XX/8    │ ✅/⚠️/❌│
│ Folder Organization              │ XX/5    │ ✅/⚠️/❌│
│ Expo Router / Navigation         │ XX/4    │ ✅/⚠️/❌│
│ Layered Architecture             │ XX/4    │ ✅/⚠️/❌│
│ Assets Organization              │ XX/4    │ ✅/⚠️/❌│
├──────────────────────────────────┼─────────┼────────┤
│ TOTAL ARCHITECTURE               │ XX/25   │ ✅/⚠️/❌│
└──────────────────────────────────┴─────────┴────────┘
```

**Legend:**
- ✅ Excellent (≥ 20/25)
- ⚠️ Warning (15-19/25)
- ❌ Critical (< 15/25)

### Step 5: Detailed report

## 📊 ARCHITECTURE AUDIT RESULTS

### ✅ Strengths

List identified good practices:
- [Practice 1 with file example]
- [Practice 2 with file example]

### ⚠️ Improvement Points

List identified issues by priority:

1. **[Issue 1]**
   - **Impact:** Critical/High/Medium
   - **Location:** [File paths]
   - **Recommendation:** [Concrete action]

2. **[Issue 2]**
   - **Impact:** Critical/High/Medium
   - **Location:** [File paths]
   - **Recommendation:** [Concrete action]

### 📈 Architecture Metrics

- **Number of features:** XX
- **Maximum folder depth:** XX levels
- **Shared components:** XX
- **Custom hooks:** XX
- **API services:** XX

### 🎯 TOP 3 PRIORITY ACTIONS

#### 1. [ACTION #1]
- **Effort:** Low/Medium/High
- **Impact:** Critical/High/Medium
- **Description:** [Detail]
- **Files:** [List]

#### 2. [ACTION #2]
- **Effort:** Low/Medium/High
- **Impact:** Critical/High/Medium
- **Description:** [Detail]
- **Files:** [List]

#### 3. [ACTION #3]
- **Effort:** Low/Medium/High
- **Impact:** Critical/High/Medium
- **Description:** [Detail]
- **Files:** [List]

---

## 📚 References

- `.claude/rules/02-architecture.md` - Architecture standards
- `.claude/rules/14-navigation.md` - Navigation standards
- `.claude/rules/13-state-management.md` - State management standards

---

**Final score: XX/25**
