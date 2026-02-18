---
description: Global React Native Project Compliance Check
argument-hint: [arguments]
---

# Global React Native Project Compliance Check

## Arguments

$ARGUMENTS

## Plan Mode

> Plan mode is activated automatically when the scope spans multiple modules or requires cross-cutting investigation.

## MISSION

You are a React Native project compliance expert. Your mission is to orchestrate a complete audit by combining the specialized audits: architecture, code quality, testing, and security.

This command aggregates the results from:
1. `/reactnative:check-architecture` (25 points)
2. `/reactnative:check-code-quality` (25 points)
3. `/reactnative:check-testing` (25 points)
4. `/reactnative:check-security` (25 points)

### Step 1: Execute the 4 specialized audits

Execute sequentially (or show the commands to execute):

```bash
# 1. Architecture Audit
/reactnative:check-architecture

# 2. Code Quality Audit
/reactnative:check-code-quality

# 3. Testing Audit
/reactnative:check-testing

# 4. Security Audit
/reactnative:check-security
```

### Step 2: Aggregate results

Collect scores from each audit:

```
┌─────────────────────────┬─────────┬─────────┬────────┐
│ Audit                   │ Score   │ Maximum │ Status │
├─────────────────────────┼─────────┼─────────┼────────┤
│ Architecture            │ XX/25   │ 25      │ ✅/⚠️/❌│
│ Code Quality            │ XX/25   │ 25      │ ✅/⚠️/❌│
│ Testing                 │ XX/25   │ 25      │ ✅/⚠️/❌│
│ Security                │ XX/25   │ 25      │ ✅/⚠️/❌│
├─────────────────────────┼─────────┼─────────┼────────┤
│ TOTAL GLOBAL            │ XX/100  │ 100     │ ✅/⚠️/❌│
└─────────────────────────┴─────────┴─────────┴────────┘
```

**Legend:**
- ✅ Excellent (≥ 80/100)
- ⚠️ Warning (60-79/100)
- ❌ Critical (< 60/100)

### Step 3: Global Assessment

## 📊 GLOBAL COMPLIANCE REPORT

### 🎯 Global Score: XX/100

**Assessment:**
- 90-100: Production-ready project ✅
- 80-89: Good project, minor improvements ⚠️
- 70-79: Acceptable project, significant improvements needed ⚠️
- 60-69: Problematic project, major improvements required ❌
- < 60: Critical project, refactoring needed ❌

### 📈 Detailed Scores

#### 1. Architecture (XX/25)
- Structure Feature-Based: XX/8
- Folder Organization: XX/5
- Navigation: XX/4
- Layered Architecture: XX/4
- Assets: XX/4

**Status:** [✅/⚠️/❌]
**Priority Actions:** [Top 2-3]

#### 2. Code Quality (XX/25)
- TypeScript: XX/7
- ESLint: XX/6
- Prettier: XX/3
- SOLID: XX/4
- KISS/DRY/YAGNI: XX/5

**Status:** [✅/⚠️/❌]
**Priority Actions:** [Top 2-3]

#### 3. Testing (XX/25)
- Jest Configuration: XX/5
- Unit Tests: XX/6
- Component Tests: XX/6
- Integration Tests: XX/4
- E2E Tests: XX/4

**Status:** [✅/⚠️/❌]
**Priority Actions:** [Top 2-3]

#### 4. Security (XX/25)
- Sensitive Data: XX/6
- API Security: XX/5
- Code Security: XX/5
- Authentication: XX/5
- Platform Security: XX/4

**Status:** [✅/⚠️/❌]
**Priority Actions:** [Top 2-3]

### 🚨 Critical Issues (All Audits)

List all critical issues across all 4 audits:

1. **[Critical Issue #1]**
   - **Audit:** Architecture/Code Quality/Testing/Security
   - **Impact:** Critical
   - **Location:** [Files]
   - **Action:** [Immediate action]

2. **[Critical Issue #2]**
   - **Audit:** Architecture/Code Quality/Testing/Security
   - **Impact:** Critical
   - **Location:** [Files]
   - **Action:** [Immediate action]

### ⚠️ High Priority Issues

List all high priority issues:

1. **[Issue #1]**
   - **Audit:** [Name]
   - **Impact:** High
   - **Action:** [Required action]

2. **[Issue #2]**
   - **Audit:** [Name]
   - **Impact:** High
   - **Action:** [Required action]

### 🎯 GLOBAL ACTION PLAN

#### Phase 1: Immediate (Week 1)
- [ ] [Critical Action #1]
- [ ] [Critical Action #2]
- [ ] [Critical Action #3]

#### Phase 2: Short Term (Week 2-4)
- [ ] [High Priority Action #1]
- [ ] [High Priority Action #2]
- [ ] [High Priority Action #3]

#### Phase 3: Medium Term (Month 2)
- [ ] [Medium Priority Action #1]
- [ ] [Medium Priority Action #2]
- [ ] [Medium Priority Action #3]

### 📊 Key Metrics

```
Project Health Dashboard
════════════════════════

Code Quality
├─ ESLint Errors: XX
├─ TypeScript Errors: XX
├─ Code Duplication: XX%
└─ Technical Debt: XX hours

Testing
├─ Total Coverage: XX%
├─ Unit Tests: XX passing / XX total
├─ Component Tests: XX passing / XX total
└─ E2E Tests: XX passing / XX total

Security
├─ Dependencies Vulnerabilities: XX
├─ Exposed Secrets: XX
├─ Security Warnings: XX
└─ OWASP Issues: XX

Architecture
├─ Features: XX
├─ Shared Components: XX
├─ Custom Hooks: XX
└─ Folder Depth: XX levels
```

### 🏆 Strengths

List 5-10 overall strengths of the project:
- [Strength 1]
- [Strength 2]
- [Strength 3]

### 🎓 Learning Recommendations

Based on identified gaps, recommend training/learning for the team:
- [Recommendation 1: e.g., TypeScript strict mode training]
- [Recommendation 2: e.g., React Native performance workshop]
- [Recommendation 3: e.g., Security best practices course]

### 📚 References

- `.claude/rules/` - All project rules
- [React Native Documentation](https://reactnative.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [OWASP Mobile Security](https://owasp.org/www-project-mobile-top-10/)

---

## ✅ Compliance Checklist

Use this checklist for future compliance checks:

### Before Production Deploy
- [ ] Global score ≥ 80/100
- [ ] No critical issues
- [ ] Test coverage ≥ 70%
- [ ] 0 security vulnerabilities (high/critical)
- [ ] 0 ESLint errors
- [ ] 0 TypeScript errors
- [ ] All tests passing
- [ ] Documentation up to date

---

**Global Score: XX/100**
**Recommendation: [Production Ready / Needs Improvement / Requires Refactoring]**
