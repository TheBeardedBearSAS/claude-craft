# Accessibility

## Conformity Statement

**claude-craft** is committed to providing an accessible development tool for all users. We target **WCAG 2.2 Level AA** conformance and compliance with the **European Accessibility Act (EAA 2025)**, effective June 2025.

**Current Status:** In Progress (Phase 1 complete)

- ✅ CLI symbols with NO_COLOR support
- ✅ Kanban keyboard navigation
- ⏳ Full WCAG 2.2 AA audit (Phase 2)

---

## Features Implemented

### CLI Symbols & NO_COLOR Support

**Location:** `cli/lib/symbols.js`

The CLI now uses accessible symbols that are ALWAYS visible, even when color is disabled:

- ✓ Success messages (green checkmark)
- ✗ Error messages (red cross)
- ⚠ Warning messages (yellow warning)
- ℹ Info messages (cyan info)

**NO_COLOR Support:**

Following the [no-color.org](https://no-color.org/) standard, colors are automatically disabled when:
- `NO_COLOR` environment variable is set (any value)
- Output is not a TTY (e.g., piped to file)

**Usage:**

```bash
# Disable colors
NO_COLOR=1 claude-craft install .

# Normal usage (colors enabled)
claude-craft check
```

**Implementation:**

```javascript
import { success, error, warning, info } from './lib/symbols.js';

console.log(success('Installation complete!'));
console.log(error('Installation failed.'));
console.log(warning('Some components missing.'));
console.log(info('Analyzing project...'));
```

---

### Kanban Keyboard Navigation

**Location:** `cli/kanban/client/src/views/KanbanView.svelte`

The Kanban board now supports full keyboard navigation for screen reader users and keyboard-only users.

**Keyboard Shortcuts:**

| Key | Action |
|-----|--------|
| `↑` `↓` | Navigate between cards in current column |
| `←` `→` | Navigate between columns |
| `Alt+M` | Open move menu for current card |
| `1-6` | Move card to column (when menu is open) |
| `Escape` | Close move menu |
| `Enter` | Announce card details to screen reader |
| `Tab` | Standard focus navigation |

**Screen Reader Support:**

- **aria-label** on each card with ID and title
- **aria-live region** announces card movements
- **role="button"** on cards for semantic meaning
- **aria-describedby** links cards to keyboard help text
- **tabindex="0"** enables keyboard focus

**Feature Flag:**

Keyboard navigation is enabled by default. To disable (for testing regression):

```bash
CC_A11Y_KANBAN=0 npm run kanban:dev
```

**Example Usage:**

1. Open Kanban board
2. Press `Tab` to focus first card
3. Use `↓` to navigate to next card
4. Press `Alt+M` to open move menu
5. Press `3` to move card to "In Progress" column
6. Screen reader announces: "Card US-001 moved to In Progress"

---

## Known Limitations

### Phase 1 (Current)

- **Color contrast:** Not yet audited (requires manual testing with tools)
- **Form labels:** Some forms may lack explicit labels
- **Focus indicators:** Not all interactive elements have visible focus states
- **ARIA landmarks:** Not all views have semantic regions

### Phase 2 (Roadmap)

- Full WCAG 2.2 AA audit with automated tools
- Contrast ratio verification (4.5:1 for text, 3:1 for UI components)
- ARIA landmark roles for all views
- Focus trap for modal dialogs
- Skip navigation links for complex UIs

---

## Testing

### Automated Tools

**Recommended tools for accessibility testing:**

| Tool | Purpose | Command/URL |
|------|---------|-------------|
| **axe-core** | WCAG violations detection | Browser DevTools extension |
| **pa11y** | CLI accessibility testing | `npm i -g pa11y && pa11y http://localhost:3000` |
| **Lighthouse** | Overall accessibility score | Chrome DevTools > Lighthouse |
| **Contrast Analyzer** | Color contrast verification | [TPGi Contrast Analyzer](https://www.tpgi.com/color-contrast-checker/) |
| **WAVE** | Visual feedback on accessibility | [WAVE Browser Extension](https://wave.webaim.org/extension/) |

**Running automated tests:**

```bash
# Install pa11y
npm install -g pa11y

# Test Kanban board
npm run kanban:dev
pa11y http://localhost:5173

# Test with specific WCAG level
pa11y --standard WCAG2AA http://localhost:5173
```

### Screen Readers

**Recommended screen readers for manual testing:**

| OS | Screen Reader | Download |
|----|---------------|----------|
| **Windows** | NVDA (free) | [nvaccess.org](https://www.nvaccess.org/) |
| **Windows** | JAWS (commercial) | [freedomscientific.com](https://www.freedomscientific.com/products/software/jaws/) |
| **macOS** | VoiceOver (built-in) | System Preferences > Accessibility > VoiceOver |
| **Linux** | Orca (built-in) | `sudo apt install orca` |

**Manual testing checklist:**

- [ ] All interactive elements are reachable via keyboard
- [ ] Tab order is logical (left-to-right, top-to-bottom)
- [ ] Focus indicator is visible on all elements
- [ ] Screen reader announces all status changes
- [ ] Escape key closes all dialogs and menus
- [ ] No keyboard traps (focus can always move away)
- [ ] Images and icons have text alternatives
- [ ] Form inputs have associated labels

---

## Feedback & Bug Reporting

We welcome feedback on accessibility issues. If you encounter any barriers using claude-craft, please report them:

### GitHub Issues

Create an issue with the `accessibility` label:

**Template:**

```markdown
## Accessibility Issue

**Description:**
[Describe the barrier or WCAG violation]

**Steps to Reproduce:**
1. [Step 1]
2. [Step 2]

**Expected Behavior:**
[What should happen for accessibility]

**Actual Behavior:**
[What currently happens]

**Assistive Technology:**
- Screen reader: [e.g., NVDA 2024.1]
- Browser: [e.g., Firefox 128]
- OS: [e.g., Windows 11]

**WCAG Guideline:**
[e.g., 2.1.1 Keyboard (Level A)]
```

### Discord

Join our Discord server and post in the `#accessibility` channel:

[Discord Invite Link](#) *(to be added in Phase 2)*

---

## Roadmap

### Phase 1 (Complete)

- ✅ CLI symbols with NO_COLOR support
- ✅ Kanban keyboard navigation
- ✅ Basic ARIA attributes
- ✅ Screen reader live region

### Phase 2 (Q2 2026)

- ⏳ Full WCAG 2.2 AA audit
- ⏳ Contrast ratio fixes
- ⏳ Focus management improvements
- ⏳ ARIA landmark roles
- ⏳ Automated accessibility CI checks

### Phase 3 (Q3 2026)

- ⏳ Reduced motion support (`prefers-reduced-motion`)
- ⏳ High contrast mode
- ⏳ Font size scaling (200% zoom support)
- ⏳ RTL (right-to-left) language support

---

## Resources

### Standards & Guidelines

- **WCAG 2.2:** [w3.org/WAI/WCAG22/quickref/](https://www.w3.org/WAI/WCAG22/quickref/)
- **EAA 2025:** [European Accessibility Act](https://ec.europa.eu/social/main.jsp?catId=1202)
- **ARIA Authoring Practices:** [w3.org/WAI/ARIA/apg/](https://www.w3.org/WAI/ARIA/apg/)
- **NO_COLOR:** [no-color.org](https://no-color.org/)

### Tools

- **axe DevTools:** [deque.com/axe/devtools/](https://www.deque.com/axe/devtools/)
- **Lighthouse:** [developers.google.com/web/tools/lighthouse](https://developers.google.com/web/tools/lighthouse)
- **pa11y:** [pa11y.org](https://pa11y.org/)

### Training

- **WebAIM:** [webaim.org](https://webaim.org/)
- **Deque University:** [dequeuniversity.com](https://dequeuniversity.com/)
- **A11y Project:** [a11yproject.com](https://www.a11yproject.com/)

---

## License

This accessibility statement is part of claude-craft, licensed under MIT.

**Last Updated:** 2026-04-15
**Version:** 1.0.0
**Contact:** [GitHub Issues](https://github.com/TheBeardedBearSAS/claude-craft/issues)
