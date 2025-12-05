# WCAG 2.2 AAA Accessibility Audit

You are a certified Accessibility Expert. You must perform a complete accessibility audit according to WCAG 2.2 level AAA criteria.

## Arguments
$ARGUMENTS

Arguments:
- Path to page/component to audit
- (Optional) Level: AA or AAA (default: AAA)
- (Optional) Focus: all, keyboard, contrast, aria

Example: `/common:a11y-audit src/pages/Home.tsx AAA` or `/common:a11y-audit src/components/Modal.tsx AA keyboard`

## MISSION

### Step 1: Automated audit

```bash
# Run automated tools
npx axe-cli {URL}
npx pa11y {URL} --standard WCAG2AAA
npx lighthouse {URL} --only-categories=accessibility

# Check Lighthouse score
# Objective: 100/100 on all 4 categories
```

### Step 2: Manual WCAG 2.2 audit

```
══════════════════════════════════════════════════════════════
♿ WCAG 2.2 AAA ACCESSIBILITY AUDIT
══════════════════════════════════════════════════════════════

Page/Component: {name}
Date: {date}
Auditor: Claude (A11y Expert)
Target level: AAA + Lighthouse 100/100

──────────────────────────────────────────────────────────────
📊 SCORES
──────────────────────────────────────────────────────────────

### Lighthouse
| Category | Score | Objective | Status |
|----------|-------|-----------|--------|
| Performance | /100 | 100 | ✅/❌ |
| Accessibility | /100 | 100 | ✅/❌ |
| Best Practices | /100 | 100 | ✅/❌ |
| SEO | /100 | 100 | ✅/❌ |

### WCAG 2.2
| Level | Criteria | Compliant | Non-compliant |
|-------|----------|-----------|---------------|
| A | 30 | {X} | {Y} |
| AA | 20 | {X} | {Y} |
| AAA | 28 | {X} | {Y} |

──────────────────────────────────────────────────────────────
1️⃣ PERCEIVABLE
──────────────────────────────────────────────────────────────

### 1.1 Text Alternatives

#### 1.1.1 Non-text content (A)
| Element | Alt text | Status | Action |
|---------|----------|--------|--------|
| img.logo | "Logo {name}" | ✅ | - |
| img.hero | "" (missing) | ❌ | Add descriptive alt |
| img.icon | aria-hidden="true" | ✅ | - |

### 1.3 Adaptable

#### 1.3.1 Info and Relationships (A)
| Check | Status | Detail |
|-------|--------|--------|
| Heading structure | ✅/❌ | h1 → h2 → h3 sequential |
| ARIA landmarks | ✅/❌ | header, nav, main, footer |
| Semantic lists | ✅/❌ | ul/ol/dl appropriate |
| Tables | ✅/❌ | th, scope, caption |
| Forms | ✅/❌ | label + fieldset/legend |

### 1.4 Distinguishable

#### 1.4.3 Contrast Minimum (AA) / 1.4.6 Enhanced Contrast (AAA)
| Element | Colors | Ratio | Required | Status |
|---------|--------|-------|----------|--------|
| Body text | #333 / #fff | 12.6:1 | 7:1 | ✅ |
| Muted text | #666 / #fff | 5.7:1 | 7:1 | ❌ |
| Primary button | #fff / #3B82F6 | 4.5:1 | 4.5:1 | ✅ |
| Placeholder | #9CA3AF / #fff | 2.9:1 | 4.5:1 | ❌ |

#### 1.4.10 Reflow (AA)
| Test | Status | Issue |
|------|--------|-------|
| 320px width | ✅/❌ | {horizontal scroll?} |
| 400% zoom | ✅/❌ | {content cut off?} |

#### 1.4.11 Non-text Contrast (AA)
| UI Element | Ratio | Status |
|------------|-------|--------|
| Input border | 3:1 | ✅/❌ |
| Button border | 3:1 | ✅/❌ |
| Action icon | 3:1 | ✅/❌ |
| Focus ring | 3:1 | ✅/❌ |

──────────────────────────────────────────────────────────────
2️⃣ OPERABLE
──────────────────────────────────────────────────────────────

### 2.1 Keyboard Accessible

#### 2.1.1 Keyboard (A) / 2.1.3 Keyboard No Exception (AAA)
| Element | Tab | Enter | Escape | Arrows | Status |
|---------|-----|-------|--------|--------|--------|
| Links | ✅ | ✅ | - | - | ✅ |
| Buttons | ✅ | ✅ | - | - | ✅ |
| Inputs | ✅ | ✅ | - | - | ✅ |
| Dropdown | ✅ | ✅ | ✅ | ✅ | ❌ |
| Modal | ✅ | ✅ | ✅ | - | ✅ |
| Custom div | ❌ | ❌ | - | - | ❌ |

#### 2.1.2 No Keyboard Trap (A)
| Zone | Entry | Exit | Status |
|------|-------|------|--------|
| Modal | Focus trap OK | Escape OK | ✅ |
| Dropdown | Tab OK | Tab/Escape OK | ✅ |
| Sidebar | Tab OK | Tab OK | ✅ |

### 2.4 Navigable

#### 2.4.1 Bypass Blocks (A)
| Skip link | Destination | Status |
|-----------|-------------|--------|
| "Skip to content" | #main-content | ✅/❌ |
| "Skip to navigation" | #nav | ✅/❌ |

#### 2.4.3 Focus Order (A)
| Sequence | Expected | Actual | Status |
|----------|----------|--------|--------|
| 1 | Skip link | Skip link | ✅ |
| 2 | Logo | Logo | ✅ |
| 3 | Nav item 1 | Nav item 1 | ✅ |
| ... | ... | ... | ... |

#### 2.4.7 Focus Visible (AA) / 2.4.11 Focus Enhanced (AA)
| Element | Outline | Offset | Ratio | Status |
|---------|---------|--------|-------|--------|
| Links | 2px solid | 2px | 3:1 | ✅ |
| Buttons | 2px solid | 2px | 3:1 | ✅ |
| Inputs | 2px solid | 0 | 3:1 | ✅ |
| Cards | ❌ | - | - | ❌ |

#### 2.5.5 Target Size (AAA)
| Element | Size | Min required | Status |
|---------|------|--------------|--------|
| Buttons | 44×40px | 44×44px | ❌ |
| Menu links | 120×48px | 44×44px | ✅ |
| Icon buttons | 32×32px | 44×44px | ❌ |
| Checkboxes | 24×24px | 44×44px | ❌ |

──────────────────────────────────────────────────────────────
3️⃣ UNDERSTANDABLE
──────────────────────────────────────────────────────────────

### 3.1 Readable

#### 3.1.1 Language of Page (A)
```html
<html lang="en"> <!-- ✅ Present -->
```

#### 3.1.2 Language of Parts (AA)
| Element | Language | lang attr | Status |
|---------|----------|-----------|--------|
| Foreign quote | French | ❌ | ❌ |
| Technical term | French | ❌ | ⚠️ |

### 3.3 Input Assistance

#### 3.3.1 Error Identification (A)
| Field | Error message | In text | Status |
|-------|---------------|---------|--------|
| Email | "Invalid email" | ✅ | ✅ |
| Password | Red border only | ❌ | ❌ |

#### 3.3.2 Labels or Instructions (A)
| Input | Label | Association | Status |
|-------|-------|-------------|--------|
| Email | "Email" | htmlFor OK | ✅ |
| Search | ❌ | No label | ❌ |
| Phone | Placeholder only | No label | ❌ |

──────────────────────────────────────────────────────────────
4️⃣ ROBUST
──────────────────────────────────────────────────────────────

### 4.1.2 Name, Role, Value (A)
| Component | role | aria-* | Status |
|-----------|------|--------|--------|
| Modal | dialog | aria-modal, aria-labelledby | ✅ |
| Dropdown | listbox | aria-expanded, aria-activedescendant | ✅ |
| Tabs | tablist/tab | aria-selected, aria-controls | ❌ |
| Accordion | - | aria-expanded | ❌ |

### 4.1.3 Status Messages (AA)
| Message | aria-live | aria-atomic | Status |
|---------|-----------|-------------|--------|
| Toast success | polite | true | ✅ |
| Toast error | assertive | true | ✅ |
| Loading | polite | false | ❌ |
| Form errors | assertive | - | ❌ |

──────────────────────────────────────────────────────────────
❌ CRITICAL VIOLATIONS (Blocking)
──────────────────────────────────────────────────────────────

| # | Criterion | Element | Description | Remediation |
|---|-----------|---------|-------------|-------------|
| 1 | 1.4.6 | .text-muted | Contrast 5.7:1 < 7:1 | color: #595959 |
| 2 | 2.5.5 | .btn-icon | Size 32px < 44px | min-width: 44px |
| 3 | 3.3.2 | input[type="search"] | No label | Add label |

──────────────────────────────────────────────────────────────
⚠️ MAJOR VIOLATIONS
──────────────────────────────────────────────────────────────

| # | Criterion | Element | Description | Remediation |
|---|-----------|---------|-------------|-------------|
| 4 | 2.1.1 | .card-clickable | div not focusable | Use button |
| 5 | 4.1.2 | .tabs | Incorrect ARIA | Add role="tablist" |

──────────────────────────────────────────────────────────────
ℹ️ MINOR VIOLATIONS
──────────────────────────────────────────────────────────────

| # | Criterion | Element | Description | Remediation |
|---|-----------|---------|-------------|-------------|
| 6 | 3.1.2 | blockquote | EN text without lang | lang="en" |

──────────────────────────────────────────────────────────────
✅ NOTABLE COMPLIANT POINTS
──────────────────────────────────────────────────────────────

- Correct semantic structure (headings, landmarks)
- Skip link present and functional
- Correct focus trap on modals
- Clear text error messages

──────────────────────────────────────────────────────────────
🎯 REMEDIATION PLAN
──────────────────────────────────────────────────────────────

### Priority 1 - Critical (this week)
1. [ ] Fix .text-muted contrast → #595959
2. [ ] Enlarge touch targets to 44px minimum
3. [ ] Add labels to inputs without label

### Priority 2 - Major (this sprint)
4. [ ] Replace clickable divs with button
5. [ ] Fix ARIA on Tabs component
6. [ ] Add aria-live on loading states

### Priority 3 - Minor (backlog)
7. [ ] Add lang="en" on English text
```

### Step 3: Screen reader test

- VoiceOver (macOS): complete navigation
- NVDA (Windows): announcement verification
- TalkBack (Android): if mobile app

### Step 4: Keyboard-only test

Navigate the entire interface using only the keyboard.
