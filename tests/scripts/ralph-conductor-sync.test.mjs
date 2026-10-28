import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

const PROJECT_ROOT = path.resolve(import.meta.dirname, '../..');

// The in-repo agent drifted from the shipped French version (missing sections,
// no accents). Its body must stay identical to Dev/i18n/fr; only the frontmatter
// may differ (field order, comments).
const body = (rel) => fs.readFileSync(path.join(PROJECT_ROOT, rel), 'utf8').replace(/^---\n[\s\S]*?\n---\n/, '');

describe('ralph-conductor sync', () => {
  it('.claude/agents/ralph-conductor.md body matches Dev/i18n/fr', () => {
    expect(body('.claude/agents/ralph-conductor.md')).toBe(body('Dev/i18n/fr/Common/agents/ralph-conductor.md'));
  });
});
