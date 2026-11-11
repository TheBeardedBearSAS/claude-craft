import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { VIEWS, DESKTOP, ZOOM400, openView } from './helpers';

// Baseline of KNOWN axe violations (audit K-12), keyed "<scene>@<WxH>" -> sorted rule ids.
// A rule outside the baseline fails; a baseline entry no longer observed also fails (forces
// cleanup). Regenerate with: UPDATE_KNOWN=1 (see run.sh). The a11y lot empties this file.
const KNOWN_FILE = path.join(path.dirname(fileURLToPath(import.meta.url)), 'known-violations.json');
const known: Record<string, string[]> = fs.existsSync(KNOWN_FILE)
  ? JSON.parse(fs.readFileSync(KNOWN_FILE, 'utf8'))
  : {};
const update = process.env.UPDATE_KNOWN === '1';
const observed: Record<string, string[]> = {};

const TAGS = ['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'];

const scenes: { name: string; open: (p: Page) => Promise<void> }[] = [
  ...VIEWS.map((v) => ({ name: v.name, open: (p: Page) => openView(p, v.name) })),
  {
    name: 'story-detail',
    open: async (p) => {
      await openView(p, 'kanban');
      await p.locator('[data-card-id]').first().click();
      await expect(p.locator('dialog.modal[open]')).toBeVisible();
    },
  },
  {
    name: 'tweaks',
    open: async (p) => {
      await openView(p, 'kanban');
      await p.getByRole('button', { name: "Réglages d'affichage" }).click();
      await expect(p.locator('dialog.tweaks-dialog[open]')).toBeVisible();
    },
  },
];

for (const vp of [DESKTOP, ZOOM400]) {
  for (const scene of scenes) {
    const key = `${scene.name}@${vp.width}x${vp.height}`;
    test(`axe: ${key}`, async ({ page }) => {
      await page.setViewportSize(vp);
      await scene.open(page);
      const { violations } = await new AxeBuilder({ page }).withTags(TAGS).analyze();
      const ids = [...new Set(violations.map((v) => v.id))].sort();
      observed[key] = ids;
      if (update) return;
      const expected = known[key] ?? [];
      expect(ids.filter((i) => !expected.includes(i)), `NEW violations in ${key}`).toEqual([]);
      expect(expected.filter((i) => !ids.includes(i)), `known violations fixed in ${key}: remove from known-violations.json`).toEqual([]);
    });
  }
}

test.afterAll(() => {
  if (!update) return;
  const sorted = Object.fromEntries(
    Object.entries(observed).filter(([, v]) => v.length).sort(([a], [b]) => a.localeCompare(b)),
  );
  fs.writeFileSync(KNOWN_FILE, JSON.stringify(sorted, null, 2) + '\n');
});
