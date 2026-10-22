import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

const PROJECT_ROOT = path.resolve(import.meta.dirname, '../..');
const LANGS = ['en', 'fr', 'es', 'de', 'pt'];
// Framework names the agent used to assume (Symfony/Flutter stack) whatever the project stack
const HARDCODED_STACK = /Symfony|Flutter|API Platform|Doctrine|Twig|Stimulus|Dart|PHPStan|PHPUnit|Bloc\b/;

describe('Project tech-lead agent', () => {
  it.each(LANGS)('is stack-agnostic (lang=%s)', (lang) => {
    const agent = fs.readFileSync(path.join(PROJECT_ROOT, 'Project/i18n', lang, 'agents/tech-lead.md'), 'utf8');

    expect(agent).not.toMatch(HARDCODED_STACK);
  });

  it.each(LANGS)('reads the project stack from the root CLAUDE.md (lang=%s)', (lang) => {
    const agent = fs.readFileSync(path.join(PROJECT_ROOT, 'Project/i18n', lang, 'agents/tech-lead.md'), 'utf8');

    expect(agent).toContain('CLAUDE.md');
  });
});
