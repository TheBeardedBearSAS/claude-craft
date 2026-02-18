---
description: Complete UI/UX/Accessibility Audit
argument-hint: [arguments]
---

# Complete UI/UX/Accessibility Audit

You are the UI/UX Orchestrator. You must perform a complete interface audit by sequentially engaging the 3 experts: Accessibility, UX/Ergonomics, then UI Design.

## Arguments
$ARGUMENTS

Arguments:
- (Optional) URL or path to page/component to audit
- (Optional) WCAG level: AA or AAA (default: AAA)

Example: `/uiux:audit src/pages/Dashboard.tsx AAA`

## Plan Mode

> Plan mode is activated automatically when the scope spans multiple modules or requires cross-cutting investigation.

## MISSION

### Step 1: Accessibility Audit (A11y Expert)

#### 1.1 Automated audit
```bash
# Run if available
npx axe-cli {URL}
npx pa11y {URL}
# Or check Lighthouse
```

#### 1.2 Manual WCAG 2.2 AAA verification

**Perceivable**
- [ ] Images with alt text
- [ ] Semantic structure (h1-h6, landmarks)
- [ ] Contrast ≥ 7:1 (AAA)
- [ ] Reflow at 320px

**Operable**
- [ ] Complete keyboard navigation
- [ ] No keyboard trap
- [ ] Visible focus (≥ 2px)
- [ ] Touch targets ≥ 44px

**Understandable**
- [ ] lang on html
- [ ] Labels on inputs
- [ ] Clear error messages

**Robust**
- [ ] Correct ARIA
- [ ] aria-live for dynamic

### Step 2: UX/Ergonomics Audit (UX Expert)

#### 2.1 Nielsen Heuristics

| Heuristic | Score (1-5) | Observations |
|-----------|-------------|--------------|
| System status visibility | | |
| Real world match | | |
| User control | | |
| Consistency | | |
| Error prevention | | |
| Recognition vs recall | | |
| Flexibility | | |
| Minimalism | | |
| Error recovery | | |
| Help | | |

#### 2.2 Journey analysis

- Friction points identified
- Cognitive load evaluated
- Interaction patterns consistent?

### Step 3: UI Design Audit (UI Expert)

#### 3.1 Design System

- Tokens consistent?
- States complete?
- Responsive correct?

#### 3.2 Visual consistency

- Uniform typography?
- Systematic spacing?
- Consistent iconography?

### Step 4: Synthesis and Prioritization

```
══════════════════════════════════════════════════════════════
🎨 UI/UX/A11Y AUDIT REPORT
══════════════════════════════════════════════════════════════

Page/Component: {name}
Date: {date}
Target level: WCAG 2.2 AAA + Lighthouse 100/100

──────────────────────────────────────────────────────────────
📊 GLOBAL SCORES
──────────────────────────────────────────────────────────────

| Domain | Score | Status |
|--------|-------|--------|
| Accessibility | /100 | ✅/❌ |
| UX/Ergonomics | /100 | ✅/❌ |
| UI Design | /100 | ✅/❌ |
| **Global** | **/100** | |

Lighthouse:
| Performance | Accessibility | Best Practices | SEO |
|-------------|---------------|----------------|-----|
| /100 | /100 | /100 | /100 |

──────────────────────────────────────────────────────────────
❌ CRITICAL ISSUES (Blocking)
──────────────────────────────────────────────────────────────

### A11y
| # | WCAG Criterion | Description | Remediation |
|---|----------------|-------------|-------------|

### UX
| # | Heuristic | Description | Remediation |
|---|-----------|-------------|-------------|

### UI
| # | Aspect | Description | Remediation |
|---|--------|-------------|-------------|

──────────────────────────────────────────────────────────────
⚠️ MAJOR ISSUES (Important)
──────────────────────────────────────────────────────────────

{Similar table}

──────────────────────────────────────────────────────────────
ℹ️ SUGGESTED IMPROVEMENTS
──────────────────────────────────────────────────────────────

{Similar table}

──────────────────────────────────────────────────────────────
✅ POSITIVE POINTS
──────────────────────────────────────────────────────────────

- {good practice 1}
- {good practice 2}

──────────────────────────────────────────────────────────────
🎯 PRIORITIZED ACTION PLAN
──────────────────────────────────────────────────────────────

### Priority 1 - Critical (immediate)
1. [ ] {action}
2. [ ] {action}

### Priority 2 - Major (this week)
1. [ ] {action}
2. [ ] {action}

### Priority 3 - Improvements (backlog)
1. [ ] {action}
2. [ ] {action}

──────────────────────────────────────────────────────────────
📋 ARBITRATIONS MADE
──────────────────────────────────────────────────────────────

In case of conflict between recommendations:
1. AAA Accessibility (non-negotiable)
2. Lighthouse 100/100
3. UX over UI
4. Mobile-first
5. Design system consistency
```

## Arbitration Rules

| Priority | Rule |
|----------|------|
| 1 | AAA Accessibility non-negotiable |
| 2 | Lighthouse 100/100 mandatory |
| 3 | UX > Aesthetics |
| 4 | Mobile-first |
| 5 | Design system consistency |
