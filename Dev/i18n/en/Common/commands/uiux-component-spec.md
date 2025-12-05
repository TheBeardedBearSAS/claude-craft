# Complete Component Specification UI/UX/A11y

You are the UI/UX Orchestrator. You must produce a complete component specification by engaging the 3 experts: UX for behavior, UI for visuals, A11y for accessibility.

## Arguments
$ARGUMENTS

Arguments:
- Component name to specify
- (Optional) Usage context

Example: `/common:uiux-component-spec Button` or `/common:uiux-component-spec "Trip Card" context:"Tourism SaaS"`

## MISSION

### Step 1: UX Analysis (UX Expert)

Define behavior and usage:
- Component objective
- Main use cases
- Expected interactions
- Functional states

### Step 2: UI Specification (UI Expert)

Define visuals:
- Anatomy and structure
- Variants
- Visual states
- Tokens used
- Responsive

### Step 3: A11y Specification (A11y Expert)

Define accessibility:
- HTML semantics
- ARIA attributes
- Keyboard navigation
- Screen reader announcements

### Step 4: Synthesis

```
══════════════════════════════════════════════════════════════
📦 COMPONENT SPECIFICATION: {NAME}
══════════════════════════════════════════════════════════════

Category: Atom | Molecule | Organism
Date: {date}
Version: 1.0

──────────────────────────────────────────────────────────────
🧠 BEHAVIOR (UX)
──────────────────────────────────────────────────────────────

### Objective
{Description of role and value for user}

### Use Cases
| Case | Context | Expected Behavior |
|------|---------|-------------------|
| Primary | {context} | {behavior} |
| Secondary | {context} | {behavior} |

### Functional States
| State | Trigger | Behavior |
|-------|---------|----------|
| default | Initial | {behavior} |
| loading | Action in progress | {behavior} |
| success | Action succeeded | {behavior} |
| error | Failure | {behavior} |
| empty | No data | {behavior} |

### User Feedback
| Action | Feedback | Delay |
|--------|----------|-------|
| Click | {feedback} | Immediate |
| Hover | {feedback} | Immediate |
| Submit | {feedback} | < 200ms |

──────────────────────────────────────────────────────────────
🎨 VISUAL (UI)
──────────────────────────────────────────────────────────────

### Anatomy
```
┌─────────────────────────────────┐
│ [Icon]  Label         [Action] │
│         Description            │
└─────────────────────────────────┘
```

- **Slot 1**: {description}
- **Slot 2**: {description}

### Dimensions
| Property | Mobile | Tablet | Desktop |
|----------|--------|--------|---------|
| min-width | {val} | {val} | {val} |
| height | {val} | {val} | {val} |
| padding | {val} | {val} | {val} |

### Variants
| Variant | Usage | Visual Differences |
|---------|-------|-------------------|
| primary | Main CTA | {tokens} |
| secondary | Secondary action | {tokens} |
| ghost | Tertiary action | {tokens} |
| destructive | Deletion | {tokens} |

### Visual States
| State | Background | Border | Text | Other |
|-------|------------|--------|------|-------|
| default | --color-{x} | --color-{x} | --color-{x} | |
| hover | --color-{x} | --color-{x} | --color-{x} | cursor: pointer |
| focus | --color-{x} | --color-{x} | --color-{x} | outline: 2px |
| active | --color-{x} | --color-{x} | --color-{x} | transform |
| disabled | --color-{x} | --color-{x} | --color-{x} | opacity: 0.5 |
| loading | --color-{x} | --color-{x} | --color-{x} | spinner |

### Micro-interactions
| Trigger | Animation | Duration | Easing |
|---------|-----------|----------|--------|
| hover | {effect} | 150ms | ease-out |
| click | {effect} | 100ms | ease-in |
| focus | {effect} | 0ms | - |

### Tokens Used
```css
/* Colors */
--color-primary-500
--color-neutral-100
--color-error-500

/* Typography */
--font-size-sm
--font-weight-medium

/* Spacing */
--spacing-2
--spacing-4

/* Other */
--radius-md
--shadow-sm
--transition-fast
```

──────────────────────────────────────────────────────────────
♿ ACCESSIBILITY (A11y)
──────────────────────────────────────────────────────────────

### HTML Semantics
```html
<button type="button" class="{component}">
  <!-- Use native element -->
</button>
```

### ARIA Attributes
| Attribute | Value | Condition |
|-----------|-------|-----------|
| aria-label | "{text}" | If icon only |
| aria-describedby | "{id}" | If description |
| aria-disabled | "true" | If disabled |
| aria-busy | "true" | If loading |

### Keyboard Navigation
| Key | Action |
|-----|--------|
| Tab | Focus on element |
| Enter | Activate |
| Space | Activate |
| Escape | Cancel (if applicable) |

### Focus Management
- **Initial focus**: Automatic via tabindex
- **Focus style**: outline 2px solid, offset 2px, ratio ≥ 3:1
- **Trap**: Not applicable (not a modal)

### Contrast (AAA)
| Element | Required Ratio | Current Ratio |
|---------|----------------|---------------|
| Label text | ≥ 7:1 | ✅ {ratio} |
| Icon | ≥ 3:1 | ✅ {ratio} |
| Border | ≥ 3:1 | ✅ {ratio} |

### Screen Reader Announcements
| Moment | Announcement |
|--------|--------------|
| Focus | "{label}, button" |
| Loading | "Loading" |
| Success | "Action successful" |
| Error | "Error: {message}" |

### Touch Target
- Minimum size: 44×44px ✅
- Spacing: ≥ 8px ✅

──────────────────────────────────────────────────────────────
💻 IMPLEMENTATION
──────────────────────────────────────────────────────────────

### Props Interface (TypeScript)
```typescript
interface {Component}Props {
  /** Visual variant */
  variant?: 'primary' | 'secondary' | 'ghost' | 'destructive';
  /** Component size */
  size?: 'sm' | 'md' | 'lg';
  /** Disabled state */
  disabled?: boolean;
  /** Loading state */
  loading?: boolean;
  /** Left icon */
  leftIcon?: ReactNode;
  /** Right icon */
  rightIcon?: ReactNode;
  /** Click handler */
  onClick?: () => void;
  /** Content */
  children: ReactNode;
}
```

### Usage Example
```tsx
<Button
  variant="primary"
  size="md"
  leftIcon={<PlusIcon />}
  onClick={handleClick}
>
  Add
</Button>
```

──────────────────────────────────────────────────────────────
✅ VALIDATION CHECKLIST
──────────────────────────────────────────────────────────────

### UX
- [ ] Clear objective defined
- [ ] All functional states documented
- [ ] User feedback specified

### UI
- [ ] All variants defined
- [ ] All visual states specified
- [ ] Responsive documented
- [ ] Tokens only (no hardcode)

### A11y
- [ ] Correct HTML semantics
- [ ] Minimal and correct ARIA
- [ ] Complete keyboard navigation
- [ ] AAA contrasts verified
- [ ] Touch targets ≥ 44px
```
