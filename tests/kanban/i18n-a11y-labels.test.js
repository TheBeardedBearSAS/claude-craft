/**
 * Accessibility of the translated labels (WCAG 2.5.3 Label in name) and French typography.
 *  - label in name : when a control shows a short visible label and carries a longer accessible name,
 *                    the visible label must appear inside the name, in every language
 *  - French        : no ordinary (breakable) space before « : ; ! ? » or inside « », and none before %
 */
import { describe, it, expect } from 'vitest';
import { SUPPORTED_LOCALES } from '../../cli/kanban/client/src/lib/i18n/translate.js';

const load = async (code) => (await import(`../../cli/kanban/client/src/lib/i18n/locales/${code}.js`)).default;
const fill = (text, params) => text.replace(/\{(\w+)\}/g, (_, k) => params[k] ?? `{${k}}`);

// [visible label, accessible name, params] — keys as used by the components.
const PAIRS = [
  ['board.card.move', 'a11y.moveCard', { id: 'US-1' }], // KanbanView: Move button
  ['docs.copy', 'docs.copy.label', {}], // DocsView: Copy button
  ['{title}', 'a11y.openCard', { id: 'US-1', title: 'Story title' }], // KanbanView: card button shows the title
  ['{column}', 'deps.table.sortBy', { column: 'Story' }], // DepsView: sortable header
  ['{name}', 'docs.group.toggle', { name: 'sprints' }], // DocsView: folder toggle shows the folder name
];

describe('label in name (2.5.3)', () => {
  for (const code of SUPPORTED_LOCALES) {
    it(`${code}: each visible label is contained in the accessible name`, async () => {
      const c = await load(code);
      for (const [visibleKey, nameKey, params] of PAIRS) {
        const visible = fill(visibleKey.startsWith('{') ? visibleKey : c[visibleKey], params).toLowerCase();
        const name = fill(c[nameKey], params).toLowerCase();
        expect(name, `${code} ${nameKey}`).toContain(visible);
      }
    });
  }
});

describe('French typography', () => {
  it('uses no-break spaces before high punctuation, inside guillemets and before %', async () => {
    const fr = await load('fr');
    const bad = Object.entries(fr).filter(([, v]) => / [:;!?»%]|« /.test(v));
    expect(bad.map(([k, v]) => `${k}: ${v}`)).toEqual([]);
  });
});
