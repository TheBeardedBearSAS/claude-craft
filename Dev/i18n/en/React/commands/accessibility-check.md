---
description: Accessibility Audit
---

# Accessibility Audit

Perform a complete accessibility (a11y) audit of the React application.

## What This Command Does

1. **Accessibility Analysis**
   - Scan components for a11y issues
   - Check ARIA labels
   - Verify semantic HTML
   - Test keyboard navigation
   - Check color contrasts

2. **Tools Used**
   - eslint-plugin-jsx-a11y
   - axe-core
   - Lighthouse
   - React DevTools

3. **Generated Report**
   - List of a11y violations
   - Severity level (critical, serious, moderate, minor)
   - Actionable recommendations
   - Code examples for fixes

## How to Use

```bash
# Run accessibility audit
npm run a11y:check

# Or with pnpm
pnpm a11y:check
```

## What to Check

### 1. Semantic HTML

```typescript
// ❌ Bad - Non-semantic
<div onClick={handleClick}>Click me</div>

// ✅ Good - Semantic
<button onClick={handleClick}>Click me</button>
```

### 2. ARIA Labels

```typescript
// ❌ Bad - Missing label
<input type="text" />

// ✅ Good - With label
<label htmlFor="name">Name</label>
<input id="name" type="text" />

// ✅ Good - With aria-label
<button aria-label="Close modal" onClick={onClose}>
  <XIcon />
</button>
```

### 3. Keyboard Navigation

```typescript
// ✅ Good - Tab navigation works
<button onClick={handleClick}>Action</button>

// ✅ Good - Custom keyboard handling
<div
  role="button"
  tabIndex={0}
  onClick={handleClick}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      handleClick();
    }
  }}
>
  Custom Button
</div>
```

### 4. Color Contrast

- Text must have sufficient contrast ratio
- WCAG AA: 4.5:1 for normal text
- WCAG AAA: 7:1 for normal text
- Use tools to verify contrasts

### 5. Alt Text for Images

```typescript
// ❌ Bad - Missing alt
<img src="photo.jpg" />

// ✅ Good - Descriptive alt
<img src="photo.jpg" alt="Company team at annual conference" />

// ✅ Good - Decorative image
<img src="decoration.jpg" alt="" role="presentation" />
```

## Configuration

### ESLint (eslint-plugin-jsx-a11y)

```json
// .eslintrc.json
{
  "extends": [
    "plugin:jsx-a11y/recommended"
  ],
  "rules": {
    "jsx-a11y/alt-text": "error",
    "jsx-a11y/anchor-is-valid": "error",
    "jsx-a11y/aria-props": "error",
    "jsx-a11y/aria-role": "error",
    "jsx-a11y/click-events-have-key-events": "error",
    "jsx-a11y/label-has-associated-control": "error",
    "jsx-a11y/no-noninteractive-element-interactions": "error"
  }
}
```

### Automated Testing with axe-core

```typescript
// test/a11y.test.tsx
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { MyComponent } from './MyComponent';

expect.extend(toHaveNoViolations);

describe('Accessibility', () => {
  it('should not have a11y violations', async () => {
    const { container } = render(<MyComponent />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
```

## Common Issues and Fixes

### Issue 1: Missing Form Labels

```typescript
// ❌ Problem
<input type="email" placeholder="Email" />

// ✅ Solution
<label htmlFor="email">Email</label>
<input id="email" type="email" placeholder="your@email.com" />
```

### Issue 2: Non-Interactive Elements with Click Handlers

```typescript
// ❌ Problem
<div onClick={handleClick}>Click me</div>

// ✅ Solution 1: Use button
<button onClick={handleClick}>Click me</button>

// ✅ Solution 2: Add proper role and keyboard support
<div
  role="button"
  tabIndex={0}
  onClick={handleClick}
  onKeyDown={(e) => e.key === 'Enter' && handleClick()}
>
  Click me
</div>
```

### Issue 3: Missing Alt Text

```typescript
// ❌ Problem
<img src="logo.png" />

// ✅ Solution
<img src="logo.png" alt="Company Logo" />
```

### Issue 4: Color-Only Information

```typescript
// ❌ Problem
<span style={{ color: 'red' }}>Error</span>

// ✅ Solution
<span style={{ color: 'red' }} aria-label="Error">
  <ErrorIcon aria-hidden="true" /> Error
</span>
```

## Testing with Lighthouse

```bash
# Install Lighthouse
npm install -g lighthouse

# Run audit
lighthouse http://localhost:3000 --view

# Save report
lighthouse http://localhost:3000 --output html --output-path ./report.html
```

## Best Practices

1. **Use semantic HTML** (button, nav, main, header, footer)
2. **Add ARIA labels** where needed
3. **Test keyboard navigation** (Tab, Enter, Escape)
4. **Check color contrasts** (WCAG AA minimum)
5. **Provide alt text** for images
6. **Support screen readers**
7. **Automated testing** with axe-core
8. **Manual testing** with screen readers (NVDA, JAWS, VoiceOver)

## Resources

- [WCAG Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [MDN Accessibility](https://developer.mozilla.org/en-US/docs/Web/Accessibility)
- [React Accessibility](https://react.dev/learn/accessibility)
- [axe DevTools](https://www.deque.com/axe/devtools/)
