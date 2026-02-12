---
description: User Flow Design
argument-hint: [arguments]
---

# User Flow Design

You are a UX/Ergonomics Expert. You must design a complete and optimized user flow.

## Arguments
$ARGUMENTS

Arguments:
- Name of the flow to design
- (Optional) Target persona
- (Optional) Specific constraints

Example: `/uiux:user-flow "User registration"` or `/uiux:user-flow "Checkout" persona:"Mobile user" constraint:"< 30 seconds"`

## MISSION

### Step 1: Define context

- User objective
- Target persona
- Usage context (device, environment)
- Business constraints

### Step 2: Design the flow

```
══════════════════════════════════════════════════════════════
🧭 USER FLOW: {NAME}
══════════════════════════════════════════════════════════════

Date: {date}
Version: 1.0

──────────────────────────────────────────────────────────────
👤 CONTEXT
──────────────────────────────────────────────────────────────

### Persona
| Attribute | Value |
|-----------|-------|
| Name | {persona} |
| Role | {role} |
| Tech level | Beginner / Intermediate / Expert |
| Primary device | Mobile / Desktop / Both |
| Context | {usage environment} |

### User objective
> "{What the user wants to accomplish}"

### Business objective
> "{What the business wants to achieve}"

### Constraints
- Max time: {X seconds/minutes}
- Max steps: {Y}
- Device: {technical constraints}
- Offline: Yes / No

──────────────────────────────────────────────────────────────
🗺️ OVERVIEW
──────────────────────────────────────────────────────────────

```
┌──────┐    ┌──────┐    ┌──────┐    ┌──────┐    ┌──────┐
│Start │───▶│Step 1│───▶│Step 2│───▶│Step 3│───▶│ End  │
└──────┘    └──────┘    └──────┘    └──────┘    └──────┘
                │            │
                ▼            ▼
           ┌────────┐   ┌────────┐
           │Error A │   │Error B │
           └────────┘   └────────┘
```

──────────────────────────────────────────────────────────────
📋 DETAILED FLOW
──────────────────────────────────────────────────────────────

### Step 0: Trigger

**Entry point**: {How the user arrives}
- Via: {menu / link / CTA / deep link}
- Prior state: {logged in / anonymous / existing data}
- Pre-conditions: {what must be true}

---

### Step 1: {Step name}

**Screen**: {Screen name}
**Objective**: {What the user must do}

#### Available actions
| Action | UI Element | Result |
|--------|------------|--------|
| Primary | {button/link} | Proceeds to step 2 |
| Secondary | {button/link} | {alternative} |
| Tertiary | {link} | {other option} |

#### Required data
| Field | Type | Validation | Required |
|-------|------|------------|----------|
| {field} | {type} | {rules} | Yes/No |

#### System feedback
| Event | Feedback | Type |
|-------|----------|------|
| Input focus | {feedback} | Visual |
| Validation error | {message} | Inline |
| Success | {feedback} | Toast/inline |

#### Attention points
- ⚠️ {potential friction}
- 💡 {improvement opportunity}

---

### Step 2: {Step name}

{Same structure...}

---

### Step N: Confirmation (End)

**Screen**: {Confirmation / Success}
**Final state**: {What has been accomplished}

#### Content
- Success message
- Action summary
- Suggested next steps

#### Next actions
| Action | Destination |
|--------|-------------|
| Primary CTA | {next flow} |
| Back | {dashboard/list} |
| Share | {if applicable} |

──────────────────────────────────────────────────────────────
⚠️ ALTERNATIVE PATHS
──────────────────────────────────────────────────────────────

### Error: {Error type}

**Trigger**: {What causes the error}
**Screen**: {Inline / Modal / Dedicated page}

#### Error message
```
Title: {Clear title}
Description: {Problem explanation}
Action: {How to resolve}
```

#### User options
- Retry: {behavior}
- Modify: {return to step X}
- Abandon: {state saved?}

---

### Abandonment: State saving

**Behavior**:
- Draft saved automatically
- Retention duration: {X days}
- Reminder notification: Yes / No

---

### Edge case: {Description}

**Situation**: {Particular context}
**Behavior**: {Flow adaptation}

──────────────────────────────────────────────────────────────
📊 METRICS & KPIs
──────────────────────────────────────────────────────────────

### Quantitative objectives

| Metric | Objective | Measurement |
|--------|-----------|-------------|
| Completion time | < {X} sec | Time-on-task |
| Completion rate | > {Y}% | Funnel analytics |
| Error rate | < {Z}% | Error rate |
| Number of clicks | ≤ {N} | Click tracking |
| Satisfaction score | > {S}/5 | Post-task survey |

### Measurement points

| Step | Event to track |
|------|----------------|
| Entry | `flow_started` |
| Step 1 | `step_1_completed` |
| Step 2 | `step_2_completed` |
| Success | `flow_completed` |
| Abandonment | `flow_abandoned` with `last_step` |
| Error | `flow_error` with `error_type` |

──────────────────────────────────────────────────────────────
🧠 ERGONOMICS
──────────────────────────────────────────────────────────────

### Cognitive load

| Step | Complexity | Justification |
|------|------------|---------------|
| 1 | Low | {1-2 simple actions} |
| 2 | Medium | {short form} |
| 3 | Low | {confirmation only} |

### Applied principles

| Principle | Application |
|-----------|-------------|
| Progressive disclosure | {how} |
| Default values | {which ones} |
| Inline validation | {when} |
| Auto-save | {frequency} |

──────────────────────────────────────────────────────────────
♿ ACCESSIBILITY
──────────────────────────────────────────────────────────────

### Keyboard navigation
- Tab order: {logical sequence}
- Skip links: {if long form}
- Focus management: {on step change}

### Screen reader
- Step announcement: "Step X of Y"
- Errors: aria-live="assertive"
- Progress: aria-describedby

### Time
- No automatic time-out
- If delay: extendable or disableable

──────────────────────────────────────────────────────────────
✅ VALIDATION CHECKLIST
──────────────────────────────────────────────────────────────

### UX
- [ ] Clear user objective
- [ ] Minimum necessary steps
- [ ] Feedback on each action
- [ ] Error paths documented
- [ ] Abandonment with save

### Measurability
- [ ] KPIs defined
- [ ] Tracking events listed
- [ ] Objectives quantified

### Accessibility
- [ ] Keyboard navigation
- [ ] SR announcements
- [ ] No time limits
```

### Step 3: Validation

- Review with stakeholders
- User testing (5 users min)
- Iteration based on feedback
