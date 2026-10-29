import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

const PROJECT_ROOT = path.resolve(import.meta.dirname, '../..');
const LANGS = ['en', 'fr', 'es', 'de', 'pt'];
const AXES = ['architecture', 'code-quality', 'testing', 'security'];

// Stacks whose check-compliance used to copy the checklists of the 4 other check-*
// instead of delegating to them, like react does.
const STACKS = {
  symfony: 'Symfony',
  php: 'PHP',
  laravel: 'Laravel',
  csharp: 'CSharp',
  angular: 'Angular',
  vuejs: 'VueJS',
  vite: 'Vite',
  vercel: 'Vercel',
};

const files = Object.entries(STACKS).flatMap(([ns, dir]) => [
  [ns, `.claude/commands/${ns}/check-compliance.md`],
  ...LANGS.map((l) => [ns, `Dev/i18n/${l}/${dir}/commands/check-compliance.md`]),
]);

describe('check-compliance delegates to the 4 check-* commands', () => {
  it.each(files)('%s: %s', (ns, rel) => {
    const raw = fs.readFileSync(path.join(PROJECT_ROOT, rel), 'utf8');
    const missing = AXES.filter((a) => !raw.includes(`/${ns}:check-${a}`));
    expect(missing, `${rel} does not delegate to /${ns}:check-<axis>`).toEqual([]);
    // Only the preparation step keeps a checklist; the axes' items live in check-<axis>.
    expect((raw.match(/^\s*- \[ \]/gm) || []).length, `${rel} copies checklists`).toBeLessThanOrEqual(25);
  });
});
