import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, '../..');

// Frontmatter `model:` only overrides CLAUDE_CODE_SUBAGENT_MODEL since Claude Code 2.1.251;
// before that the variable won. An unbounded claim stayed wrong for months (audit 2026-08-31,
// PR #174). Source: https://code.claude.com/docs/en/sub-agents
const FILES = [
  '.claude/rules/12-context-management.md',
  ...['en', 'fr', 'es', 'de', 'pt'].map((l) => `Dev/i18n/${l}/Common/rules/12-context-management.md`),
  'docs/FAQ.md',
];

describe('model precedence claims are bounded to Claude Code 2.1.251+', () => {
  for (const rel of FILES) {
    it(`${rel} states the 2.1.251 bound`, () => {
      const content = fs.readFileSync(path.join(PROJECT_ROOT, rel), 'utf8');
      const lines = content.split('\n').filter((l) => /CLAUDE_CODE_SUBAGENT_MODEL/.test(l) && /`model:/.test(l));
      expect(lines.length).toBeGreaterThan(0);
      for (const line of lines) expect(line).toContain('2.1.251');
    });
  }
});
