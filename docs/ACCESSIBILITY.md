# Accessibility

## Conformity Statement

**claude-craft** is committed to providing an accessible development tool for all users. We target **WCAG 2.2 Level AA** conformance and compliance with the **European Accessibility Act (EAA 2025)**, effective June 2025.

**Current Status:** In Progress

- ✅ CLI symbols with NO_COLOR support
- ✅ Kanban web interface reviewed against WCAG 2.2 AA (axe-core, keyboard tests, code review, Chromium) — see [Kanban Web Interface](#kanban-web-interface) for what was not verified
- ⏳ Manual testing with real screen readers and other browsers

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

### Kanban Web Interface

**Location:** `cli/kanban/client/src/` (audit and fixes: `docs/audits/KANBAN-AUDIT-2026-11.md`)

**How the board is built:**

- **Cards are native buttons in a list.** Each column is a section with a heading and a `<ul>`; a card contains a "open details" button (name = id and title, with priority, points, TDD phase, assignee and blocker read from its description) and a "Move" button. There is no custom `grid` role and no roving `tabindex`.
- **Move menu instead of drag and drop only.** The "Move" menu lists only the transitions allowed for that story, so moving a card never needs a pointer drag (WCAG 2.5.7). In `--readonly` mode the button is absent.
- **Dependency graph with an equivalent table** (story, depends on, blocks, status, cycle) with links to the stories; status and cycles are given in text, not by colour alone. The velocity chart also comes with a table.
- **Navigation kept at narrow widths.** Below 980 px the sidebar becomes a horizontal navigation bar that is always visible; the layout is checked at 320 px wide (400 % zoom).
- **One `<h1>`, one `<main>`, a title per view.** The page `<title>` changes with the view, focus moves to the content when the view changes, and a skip link is provided.
- **Live regions.** Status messages go through one polite `status` region and one `alert` region for errors; toasts have a close button, pause on hover and focus, and error toasts stay until dismissed. Real-time updates are grouped into a single announcement. At most three confirmations are shown at once, so that they never cover the board; errors are always kept. Toasts are translated when shown, so they follow a change of language.
- **Forms.** Required fields and expected formats are stated in the label; errors are listed in a summary that takes the focus and are tied to their fields. Deleting a story or closing a sprint asks for confirmation first (WCAG 3.3.4), once. Unsaved input in a story or sprint form is never discarded silently: Escape, Cancel, the backdrop, browser Back or a link ask first. After an action, focus returns to a control that still exists and is never taken from where the user has moved it meanwhile.
- **Contrast.** Text is at least 4.5:1 and component borders at least 3:1 for the four accent colours; the ratios are locked by `tests/kanban/contrast.test.js`.
- **Motion.** Animations are shortened under `prefers-reduced-motion`; targets are at least 24 px.
- **Languages.** The interface is available in English, French, Spanish, German and Portuguese, and `<html lang>` follows the chosen language. Story titles and documents are not translated and carry no `lang` attribute.

**Keyboard shortcuts (Board):**

| Key | Action |
|-----|--------|
| `Tab` / `Shift+Tab` | Standard focus navigation; buttons work with `Enter` and `Space` |
| `↑` `↓` | Navigate between cards in the current column |
| `←` `→` | Navigate between columns |
| `Alt+M` | Open the move menu of the focused card |
| `1`-`6` | Move the card to that column (move menu open) |
| `Enter` | Open the story details |
| `Esc` | Close the menu or dialog |
| `Ctrl+K` (`⌘+K`) or `/` | Move focus to the search box |

The shortcuts are accelerators: every action is available through `Tab` and the native buttons. The same list is shown in the Settings panel.

**Verification:**

```bash
bash website/tests/kanban/run.sh              # Playwright + axe-core in Docker (builds the client first)
bash website/tests/kanban/run.sh a11y.spec.ts # axe only
```

The harness runs axe-core on every view and on the transient states (dialogs, menus, forms, settings), each at 1280×800 and at 320×256, plus keyboard and reflow tests. The CI workflow runs it when Kanban files change. The previous `CC_A11Y_KANBAN` feature flag never had any effect and was removed.

**Conformance status (Kanban):** the target is WCAG 2.2 Level AA and RGAA 4.1. The checks above were run with axe-core, keyboard tests and code review, under Chromium only. This is not a statement of full conformance.

**Not verified:**

- Real screen readers (NVDA, JAWS, VoiceOver, TalkBack): ARIA behaviour is inferred from the code and the ARIA 1.2 rules.
- Firefox, Safari and touch devices.
- Windows forced-colors (high contrast) mode.

**Known limitations:**

- The side panel of a node of the dependency graph opens with a pointer only; the table is the keyboard and screen reader alternative.
- The content of the stories (titles, markdown) has no `lang` attribute, even when it is written in another language than the interface.

---

## Known Limitations

### Kanban web interface

See [Kanban Web Interface](#kanban-web-interface): no real screen reader test, Chromium only, forced-colors mode not checked, graph node panel opened with a pointer only.

### Other tools

- **CLI output:** relies on `NO_COLOR` and text symbols; no screen reader test either.

### Roadmap items still open

- Manual testing with NVDA, JAWS, VoiceOver and TalkBack
- Firefox, Safari and touch testing
- Windows forced-colors (high contrast) mode

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

# Test Kanban board (the project harness: Playwright + axe-core in Docker)
bash website/tests/kanban/run.sh

# Or point pa11y at a running board
npx @the-bearded-bear/claude-craft kanban
pa11y --standard WCAG2AA http://127.0.0.1:3737
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
- ✅ Kanban web interface: native-button cards, move menu, contrast, reflow at 320 px, 5 languages (November 2026)

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
