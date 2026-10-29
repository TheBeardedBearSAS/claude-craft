import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import * as yaml from 'js-yaml';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, '../..');

// Claude Code parses skill frontmatter as strict YAML. An unquoted
// "description: Règle 05 : ..." or a stray indented "  files:" line made the
// whole block unparsable: the skill fell back to its H1 title, losing its
// "Use when ..." trigger and `context: fork`. Audit 2026-10-28.
function listSkills(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) listSkills(full, out);
    else if (entry.name === 'SKILL.md') out.push(full);
  }
  return out;
}

const FILES = ['.claude/skills', 'Dev/i18n'].flatMap((d) => listSkills(path.join(PROJECT_ROOT, d)));

describe('SKILL.md frontmatter is strict YAML', () => {
  it('finds skills to check', () => {
    expect(FILES.length).toBeGreaterThan(100);
  });

  for (const file of FILES) {
    const rel = path.relative(PROJECT_ROOT, file);
    it(`${rel} parses with a non-empty description`, () => {
      const block = fs.readFileSync(file, 'utf8').match(/^---\n([\s\S]*?)\n---/)?.[1];
      expect(block, 'frontmatter block').toBeDefined();
      const data = yaml.load(block);
      expect(typeof data?.description).toBe('string');
      expect(data.description.trim().length).toBeGreaterThan(0);
    });
  }
});
