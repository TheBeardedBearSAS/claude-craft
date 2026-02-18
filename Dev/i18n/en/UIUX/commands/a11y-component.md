---
description: Component Accessibility Specification
argument-hint: [arguments]
---

# Component Accessibility Specification

You are a certified Accessibility Expert. You must produce complete accessibility specifications for a UI component.

## Arguments
$ARGUMENTS

Arguments:
- Component name
- (Optional) Type: button, input, modal, dropdown, tabs, accordion, tooltip, etc.

Example: `/uiux:a11y-component Modal` or `/uiux:a11y-component "Date Picker" type:input`

## Plan Mode

> **Plan mode is mandatory.** Before executing, Claude activates plan mode to analyze impacted code, propose an implementation plan, and wait for your validation before making any changes.

## MISSION

### Step 1: Identify the ARIA pattern

Consult the ARIA Authoring Practices Guide (APG) for the corresponding pattern.

### Step 2: Produce the specification

```
══════════════════════════════════════════════════════════════
♿ ACCESSIBILITY SPECIFICATION: {COMPONENT_NAME}
══════════════════════════════════════════════════════════════

Type: {Button | Input | Dialog | Listbox | Tabs | ...}
APG Pattern: {link to official pattern}
Date: {date}

──────────────────────────────────────────────────────────────
📋 HTML SEMANTICS
──────────────────────────────────────────────────────────────

### Recommended native element

```html
<!-- Always prefer native element -->
<{element} ...>
  {content}
</{element}>
```

### If custom component required

```html
<div role="{role}" ...>
  {content}
</div>
```

### Complete structure

```html
<!-- Complete example with ARIA -->
<div
  role="{role}"
  aria-{attribute}="{value}"
  tabindex="0"
>
  <span id="{id}-label">{Label}</span>
  <div id="{id}-description">{Description}</div>
  {content}
</div>
```

──────────────────────────────────────────────────────────────
🏷️ ARIA ATTRIBUTES
──────────────────────────────────────────────────────────────

### Required attributes

| Attribute | Value | When | Description |
|-----------|-------|------|-------------|
| role | {role} | Always (if custom) | Defines the type |
| aria-label | "{text}" | If no visible label | Accessible label |
| aria-labelledby | "{id}" | If visible label | Reference to label |

### Conditional attributes

| Attribute | Value | When | Description |
|-----------|-------|------|-------------|
| aria-describedby | "{id}" | If description | Reference to description |
| aria-expanded | "true"/"false" | If expandable | Open/closed state |
| aria-controls | "{id}" | If controls other | ID of controlled element |
| aria-owns | "{id}" | If separate DOM | Parent relationship |
| aria-haspopup | "dialog"/"menu"/"listbox" | If popup | Popup type |
| aria-pressed | "true"/"false" | If toggle | Pressed state |
| aria-selected | "true"/"false" | If selection | Selected state |
| aria-checked | "true"/"false"/"mixed" | If checkbox | Checked state |
| aria-disabled | "true" | If disabled | Disabled state |
| aria-invalid | "true" | If error | Invalid state |
| aria-required | "true" | If required | Required field |
| aria-busy | "true" | If loading | In progress |
| aria-live | "polite"/"assertive" | If dynamic | Announce change |
| aria-atomic | "true" | With aria-live | Announce all |

### States by interaction

| State | ARIA attributes |
|-------|-----------------|
| Default | {base attributes} |
| Hover | No ARIA change |
| Focus | No ARIA change |
| Expanded | aria-expanded="true" |
| Collapsed | aria-expanded="false" |
| Selected | aria-selected="true" |
| Disabled | aria-disabled="true" |
| Loading | aria-busy="true" |
| Error | aria-invalid="true", aria-errormessage="{id}" |

──────────────────────────────────────────────────────────────
⌨️ KEYBOARD NAVIGATION
──────────────────────────────────────────────────────────────

### Main keys

| Key | Action | Detail |
|-----|--------|--------|
| Tab | Focus on component | Enters the component |
| Shift+Tab | Previous focus | Exits the component |
| Enter | Activate | Primary action |
| Space | Activate (toggle) | For toggle buttons |
| Escape | Close/Cancel | If popup/modal |
| ↑ Arrow Up | Previous item | List navigation |
| ↓ Arrow Down | Next item | List navigation |
| ← Arrow Left | Previous item (horizontal) | Tabs, slider |
| → Arrow Right | Next item (horizontal) | Tabs, slider |
| Home | First item | Quick navigation |
| End | Last item | Quick navigation |

### Focus management

| Situation | Behavior |
|-----------|----------|
| Opening | Focus on {first focusable element} |
| Closing | Focus returns to {trigger element} |
| Internal navigation | Roving tabindex OR aria-activedescendant |
| Focus trap | {Yes for modal / No for dropdown} |

### Roving tabindex (if applicable)

```html
<!-- Only one focusable element at a time -->
<div role="tablist">
  <button role="tab" tabindex="0" aria-selected="true">Tab 1</button>
  <button role="tab" tabindex="-1" aria-selected="false">Tab 2</button>
  <button role="tab" tabindex="-1" aria-selected="false">Tab 3</button>
</div>
```

──────────────────────────────────────────────────────────────
🎯 VISIBLE FOCUS
──────────────────────────────────────────────────────────────

### Required style (WCAG 2.4.11 AAA)

```css
.{component}:focus-visible {
  /* Visible outline */
  outline: 2px solid var(--color-focus);
  outline-offset: 2px;

  /* Contrast ratio ≥ 3:1 */
  /* Focus area ≥ visible perimeter */
}

/* Reset for mouse */
.{component}:focus:not(:focus-visible) {
  outline: none;
}
```

### Verifications

| Criterion | Value | Status |
|-----------|-------|--------|
| Outline thickness | ≥ 2px | ✅ |
| Outline contrast | ≥ 3:1 | ✅ |
| Visible area | ≥ perimeter | ✅ |
| Visible on all backgrounds | Yes | ✅ |

──────────────────────────────────────────────────────────────
🔊 SCREEN READER ANNOUNCEMENTS
──────────────────────────────────────────────────────────────

### On entry (focus)

```
"{Label}, {role}, {state}"

Examples:
- "Submit, button"
- "Main menu, menu, collapsed"
- "Name, text field, required"
- "Newsletter, checkbox, not checked"
```

### During interaction

| Action | Announcement |
|--------|--------------|
| Expansion | "expanded" / "collapsed" |
| Selection | "selected" |
| Toggle | "on" / "off" |
| Loading | "Loading" |
| Success | "{success message}" |
| Error | "Error: {message}" |

### Dynamic content (aria-live)

```html
<!-- Polite notifications (non-urgent) -->
<div aria-live="polite" aria-atomic="true">
  {toast message}
</div>

<!-- Urgent notifications (errors) -->
<div aria-live="assertive" aria-atomic="true">
  {error message}
</div>
```

──────────────────────────────────────────────────────────────
📏 CONTRAST (WCAG AAA)
──────────────────────────────────────────────────────────────

### Text

| Type | Required ratio | Verification |
|------|----------------|--------------|
| Normal text (< 18px) | ≥ 7:1 | {color} / {background} = {ratio} |
| Large text (≥ 18px or 14px bold) | ≥ 4.5:1 | {color} / {background} = {ratio} |

### UI Elements

| Element | Required ratio | Verification |
|---------|----------------|--------------|
| Borders | ≥ 3:1 | {color} / {background} = {ratio} |
| Icons | ≥ 3:1 | {color} / {background} = {ratio} |
| Focus outline | ≥ 3:1 | {color} / {background} = {ratio} |

### States

| State | Contrast verification |
|-------|----------------------|
| Default | ✅ {ratio} |
| Hover | ✅ {ratio} |
| Focus | ✅ {ratio} |
| Disabled | ⚠️ Not required but recommended |

──────────────────────────────────────────────────────────────
📐 TOUCH TARGETS (WCAG 2.5.5 AAA)
──────────────────────────────────────────────────────────────

### Minimum dimensions

| Criterion | Value | Status |
|-----------|-------|--------|
| Minimum size | 44 × 44 CSS pixels | ✅/❌ |
| Spacing between targets | ≥ 8px | ✅/❌ |

### Implementation

```css
.{component} {
  min-width: 44px;
  min-height: 44px;
  /* OR padding to reach 44px */
  padding: 10px 16px; /* if text height ~24px */
}

/* Icon buttons */
.{component}-icon {
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
}
```

──────────────────────────────────────────────────────────────
🧪 TESTS TO PERFORM
──────────────────────────────────────────────────────────────

### Automated

- [ ] axe DevTools: 0 violations
- [ ] Lighthouse Accessibility: 100/100
- [ ] ESLint jsx-a11y: 0 errors

### Manual

- [ ] Complete keyboard navigation
- [ ] Visible focus at each step
- [ ] No keyboard trap
- [ ] Logical focus order

### Screen reader

- [ ] VoiceOver (macOS/iOS): correct announcements
- [ ] NVDA (Windows): list/table navigation
- [ ] TalkBack (Android): if mobile

### Edge cases

- [ ] 400% zoom: no content loss
- [ ] High contrast mode: visible
- [ ] Reduced motion: animations respected

──────────────────────────────────────────────────────────────
💻 IMPLEMENTATION EXAMPLE
──────────────────────────────────────────────────────────────

```tsx
// {Component}.tsx
import { forwardRef, useId } from 'react';

interface {Component}Props {
  label: string;
  description?: string;
  disabled?: boolean;
  // ...other props
}

export const {Component} = forwardRef<HTML{Element}Element, {Component}Props>(
  ({ label, description, disabled, ...props }, ref) => {
    const id = useId();
    const descriptionId = description ? `${id}-description` : undefined;

    return (
      <{element}
        ref={ref}
        id={id}
        role="{role}"
        aria-label={label}
        aria-describedby={descriptionId}
        aria-disabled={disabled}
        tabIndex={disabled ? -1 : 0}
        {...props}
      >
        {/* Content */}

        {description && (
          <span id={descriptionId} className="sr-only">
            {description}
          </span>
        )}
      </{element}>
    );
  }
);

{Component}.displayName = '{Component}';
```

──────────────────────────────────────────────────────────────
✅ VALIDATION CHECKLIST
──────────────────────────────────────────────────────────────

### Semantics
- [ ] Native HTML element used if possible
- [ ] Correct ARIA role if custom
- [ ] Logical DOM structure

### ARIA
- [ ] Required attributes present
- [ ] Conditional attributes correct
- [ ] No ARIA overload (native > ARIA)

### Keyboard
- [ ] Focusable (appropriate tabindex)
- [ ] All actions via keyboard
- [ ] No keyboard trap
- [ ] Compliant visible focus

### Announcements
- [ ] Label announced on focus
- [ ] States announced on change
- [ ] Errors with aria-live assertive

### Contrast
- [ ] Text ≥ 7:1 (AAA)
- [ ] UI ≥ 3:1
- [ ] Focus ≥ 3:1

### Touch
- [ ] Targets ≥ 44×44px
- [ ] Spacing ≥ 8px
```
