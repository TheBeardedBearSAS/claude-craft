---
description: Check React Native Testing
argument-hint: [arguments]
---

# Check React Native Testing

## Arguments

$ARGUMENTS

## MISSION

You are a React Native testing audit expert. Your mission is to analyze the test strategy and coverage according to the standards defined in `.claude/rules/07-testing.md` and `.claude/rules/08-quality-tools.md`.

### Step 1: Test configuration analysis

1. Verify Jest presence and configuration
2. Verify React Native Testing Library (RNTL) presence and configuration
3. Verify Detox (E2E tests) presence and configuration
4. Analyze test scripts in package.json

### Step 2: Jest Configuration (5 points)

#### 🧪 Configuration files

- [ ] **(1 pt)** `jest.config.js` or configuration in package.json present
- [ ] **(1 pt)** React Native preset configured (`@react-native/jest-preset` or equivalent)
- [ ] **(1 pt)** Setup files configured (`setupFilesAfterEnv`)
- [ ] **(1 pt)** Code coverage enabled (coverage)
- [ ] **(1 pt)** Transformations configured for TypeScript and React Native

**Files to check:**
```bash
jest.config.js
jest.setup.js
package.json
```

#### 📊 Coverage configuration

Verify in `jest.config.js`:
```javascript
coverageThreshold: {
  global: {
    branches: 80,
    functions: 80,
    lines: 80,
    statements: 80
  }
}
```

- [ ] Coverage thresholds defined (≥ 80% recommended)
- [ ] Collect from correct folders (src/, app/)
- [ ] Appropriate exclusions (node_modules, __tests__, etc.)

### Step 3: Unit Tests with RNTL (8 points)

Reference: `.claude/rules/07-testing.md`

#### 📁 Test organization

- [ ] **(1 pt)** Tests colocated with components or in `__tests__/`
- [ ] **(1 pt)** Naming convention: `*.test.tsx` or `*.spec.tsx`
- [ ] **(1 pt)** AAA structure (Arrange, Act, Assert) respected

**Files to check:**
```bash
src/**/__tests__/
src/**/*.test.tsx
src/**/*.spec.tsx
```

#### 🧩 Unit test quality

Analyze 5-10 test files:

- [ ] **(1 pt)** Use of `@testing-library/react-native` (render, fireEvent, waitFor)
- [ ] **(1 pt)** Isolated component tests with mocked props
- [ ] **(1 pt)** Custom hooks tests with `@testing-library/react-hooks`
- [ ] **(1 pt)** Appropriate mocks for native modules (AsyncStorage, etc.)
- [ ] **(1 pt)** Edge cases and error tests

**Example of good test:**
```typescript
describe('LoginButton', () => {
  it('should call onPress when pressed', () => {
    const onPress = jest.fn();
    const { getByText } = render(<LoginButton onPress={onPress} />);

    fireEvent.press(getByText('Login'));

    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
```

### Step 4: Integration Tests (4 points)

- [ ] **(1 pt)** Complete user flow tests
- [ ] **(1 pt)** Navigation between screens tests
- [ ] **(1 pt)** Mocked API calls tests
- [ ] **(1 pt)** State management tests (Context, Redux, Zustand)

**Files to check:**
```bash
src/**/*.integration.test.tsx
__tests__/integration/
```

### Step 5: E2E Tests with Detox (4 points)

#### 🤖 Detox Configuration

- [ ] **(1 pt)** `.detoxrc.js` or Detox configuration present
- [ ] **(1 pt)** Configuration for iOS and Android
- [ ] **(1 pt)** E2E test scripts in package.json (`test:e2e`)

**Files to check:**
```bash
.detoxrc.js
.detoxrc.json
e2e/
package.json
```

#### 🎬 E2E Tests

- [ ] **(1 pt)** At least 3 critical E2E scenarios tested (login, main navigation, key action)

**Files to check:**
```bash
e2e/**/*.e2e.ts
e2e/**/*.e2e.js
```

### Step 6: Test Coverage (4 points)

Execute coverage command:

```bash
npm run test -- --coverage
# or
yarn test --coverage
```

Analyze coverage report:

- [ ] **(1 pt)** Global coverage ≥ 80%
- [ ] **(1 pt)** Branch coverage ≥ 75%
- [ ] **(1 pt)** Critical components covered at 100%
- [ ] **(1 pt)** Coverage report generated (coverage/lcov-report/)

**Files to check:**
```bash
coverage/lcov-report/index.html
coverage/coverage-summary.json
```

### Step 7: Calculate score

```
┌──────────────────────────────────┬─────────┬────────┐
│ Criterion                        │ Score   │ Status │
├──────────────────────────────────┼─────────┼────────┤
│ Jest Configuration               │ XX/5    │ ✅/⚠️/❌│
│ Unit Tests (RNTL)                │ XX/8    │ ✅/⚠️/❌│
│ Integration Tests                │ XX/4    │ ✅/⚠️/❌│
│ E2E Tests (Detox)                │ XX/4    │ ✅/⚠️/❌│
│ Code Coverage                    │ XX/4    │ ✅/⚠️/❌│
├──────────────────────────────────┼─────────┼────────┤
│ TOTAL TESTING                    │ XX/25   │ ✅/⚠️/❌│
└──────────────────────────────────┴─────────┴────────┘
```

**Legend:**
- ✅ Excellent (≥ 20/25)
- ⚠️ Warning (15-19/25)
- ❌ Critical (< 15/25)

### Step 8: Detailed report

## 📊 TESTING AUDIT RESULTS

### ✅ Strengths

List identified good practices:
- [Practice 1 with test example]
- [Practice 2 with test example]

### ⚠️ Improvement Points

List identified issues by priority:

1. **[Issue 1]**
   - **Severity:** Critical/High/Medium
   - **Location:** [Untested files/components]
   - **Impact:** [Regression risk]
   - **Recommendation:** [Actions to take]

2. **[Issue 2]**
   - **Severity:** Critical/High/Medium
   - **Location:** [Untested files/components]
   - **Impact:** [Regression risk]
   - **Recommendation:** [Actions to take]

### 📈 Testing Metrics

#### Code coverage

```
┌─────────────────┬──────────┬──────────┬──────────┬──────────┐
│ Type            │ Lines    │ Branches │ Functions│ Statements│
├─────────────────┼──────────┼──────────┼──────────┼──────────┤
│ Global          │ XX.XX%   │ XX.XX%   │ XX.XX%   │ XX.XX%   │
│ Components      │ XX.XX%   │ XX.XX%   │ XX.XX%   │ XX.XX%   │
│ Hooks           │ XX.XX%   │ XX.XX%   │ XX.XX%   │ XX.XX%   │
│ Utils           │ XX.XX%   │ XX.XX%   │ XX.XX%   │ XX.XX%   │
│ Services        │ XX.XX%   │ XX.XX%   │ XX.XX%   │ XX.XX%   │
└─────────────────┴──────────┴──────────┴──────────┴──────────┘
```

#### Test statistics

- **Total number of tests:** XX
  - Unit tests: XX
  - Integration tests: XX
  - E2E tests: XX
- **Tests passed:** XX
- **Tests failed:** XX
- **Total execution time:** XX seconds
- **Tests/code ratio:** XX tests for YY lines of code

#### Components without tests

List critical untested components:
1. `[Path/Component]` - [Criticality reason]
2. `[Path/Component]` - [Criticality reason]
3. `[Path/Component]` - [Criticality reason]

#### Tested critical features

- [ ] Authentication (login, logout, refresh token)
- [ ] Main navigation
- [ ] Critical forms
- [ ] Main API calls
- [ ] Error handling
- [ ] Loading states
- [ ] Offline management

### 🎯 TOP 3 PRIORITY ACTIONS

#### 1. [ACTION #1]
- **Effort:** Low/Medium/High
- **Impact:** Critical/High/Medium
- **Description:** [Components/features to test priority]
- **Current coverage:** XX%
- **Target coverage:** YY%
- **Affected files:**
  - `[file1]` (coverage: XX%)
  - `[file2]` (coverage: XX%)
- **Example tests to add:**
```typescript
describe('[Component]', () => {
  it('should [behavior]', () => {
    // Test to implement
  });
});
```

#### 2. [ACTION #2]
- **Effort:** Low/Medium/High
- **Impact:** Critical/High/Medium
- **Description:** [Test configuration or improvement]
- **Affected files:** [List]

#### 3. [ACTION #3]
- **Effort:** Low/Medium/High
- **Impact:** Critical/High/Medium
- **Description:** [E2E or integration tests to add]
- **Scenarios to cover:**
  - [Scenario 1]
  - [Scenario 2]

---

## 🚀 Recommendations

### Quick Wins (Low effort, high impact)
- [Quick improvement 1]
- [Quick improvement 2]

### Investments (Medium/high effort, high impact)
- [Structural improvement 1]
- [Structural improvement 2]

### Best practices to adopt
- Write tests alongside code (TDD)
- Target minimum 80% coverage
- Test edge cases and errors
- Keep tests up to date with code
- Use snapshots sparingly

---

## 📚 References

- `.claude/rules/07-testing.md` - Testing standards
- `.claude/rules/08-quality-tools.md` - Quality tools
- [React Native Testing Library](https://callstack.github.io/react-native-testing-library/)
- [Detox Documentation](https://wix.github.io/Detox/)

---

**Final score: XX/25**
