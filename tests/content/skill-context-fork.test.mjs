import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import * as yaml from 'js-yaml';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, '../..');

// Règle 12 : tout skill de plus de 60 lignes s'exécute en `context: fork` pour ne
// pas polluer le contexte principal. Contrôle autrefois confié à un agent haiku
// (lentille internal-conformance de /common:audit-claude-alignment), désormais
// déterministe.
const MAX_LINES_WITHOUT_FORK = 60;

function listSkills(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) listSkills(full, out);
    else if (entry.name === 'SKILL.md') out.push(full);
  }
  return out;
}

const LONG_SKILLS = ['.claude/skills', 'Dev/i18n']
  .flatMap((d) => listSkills(path.join(PROJECT_ROOT, d)))
  .filter((file) => fs.readFileSync(file, 'utf8').split('\n').length > MAX_LINES_WITHOUT_FORK);

describe(`SKILL.md > ${MAX_LINES_WITHOUT_FORK} lignes : context: fork`, () => {
  it('finds long skills to check', () => {
    expect(LONG_SKILLS.length).toBeGreaterThan(0);
  });

  for (const file of LONG_SKILLS) {
    it(`${path.relative(PROJECT_ROOT, file)} declares context: fork`, () => {
      const block = fs.readFileSync(file, 'utf8').match(/^---\n([\s\S]*?)\n---/)?.[1];
      expect(yaml.load(block ?? '')?.context).toBe('fork');
    });
  }
});
