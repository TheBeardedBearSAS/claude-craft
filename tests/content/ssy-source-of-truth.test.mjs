import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import * as yaml from 'js-yaml';
import { SprintStatusSchema } from '../../cli/kanban/shared/schemas.js';

// Decision (PM roadmap 2026-10-26): .bmad/sprint-status.yaml is the single source
// of truth for STATUS; markdown files hold CONTENT only.
const PROJECT_ROOT = path.resolve(import.meta.dirname, '../..');
const LANGS = ['en', 'fr', 'es', 'de', 'pt'];
const read = (...p) => fs.readFileSync(path.join(PROJECT_ROOT, ...p), 'utf8');

const SCHEMA_TEMPLATE = '.claude/templates/project/sprint-status.md';
const STATUS_EMOJI = /🔴|🟡|🟢|🔲|🔄|👀|🚫/u;

// Commands that change a story or task status.
// 8.25.0/8.26.0: the former writers/readers are stubs of these merged commands.
const WRITERS = [
  'Project/i18n/{lang}/commands/backlog.md',
  'Dev/i18n/{lang}/Workflow/commands/start.md',
  'Dev/i18n/{lang}/Workflow/commands/implement.md',
];
// Commands that display statuses.
const READERS = [
  'Project/i18n/{lang}/commands/backlog.md',
  'Project/i18n/{lang}/commands/report.md',
  'Dev/i18n/{lang}/Workflow/commands/status.md',
];
const at = (tpl, lang) => fs.readFileSync(path.join(PROJECT_ROOT, tpl.replace('{lang}', lang)), 'utf8');

describe('canonical sprint-status.yaml schema template', () => {
  it.each(LANGS)('documents a schema the Kanban accepts, with task statuses and routing (lang=%s)', (lang) => {
    const tpl = read('Project/i18n', lang, 'templates/sprint-status.md');
    const block = tpl.match(/```yaml\n(# \.bmad\/sprint-status\.yaml[\s\S]*?)```/);
    expect(block).not.toBeNull();
    const doc = yaml.load(block[1]);
    const parsed = SprintStatusSchema.safeParse(doc);
    expect(parsed.success).toBe(true);
    const story = Object.values(parsed.data.stories)[0];
    expect(story.tasks.status).toBeDefined();
    expect(doc.routing.auto_transitions).toBeDefined();
  });
});

describe('markdown templates hold content only', () => {
  it.each(LANGS)('no status emoji in story, epic, task and board templates (lang=%s)', (lang) => {
    for (const t of ['user-story', 'epic', 'task', 'board']) {
      expect(read('Project/i18n', lang, `templates/${t}.md`), `${lang}/templates/${t}.md`).not.toMatch(STATUS_EMOJI);
    }
  });
});

describe('status writers and readers go through sprint-status.yaml', () => {
  it.each(LANGS)('writers update .bmad/sprint-status.yaml and cite the schema (lang=%s)', (lang) => {
    for (const f of WRITERS) {
      const cmd = at(f, lang);
      expect(cmd, `${lang}/${f}`).toContain('.bmad/sprint-status.yaml');
      expect(cmd, `${lang}/${f}`).toContain(SCHEMA_TEMPLATE);
    }
  });

  it.each(LANGS)('readers take statuses from .bmad/sprint-status.yaml (lang=%s)', (lang) => {
    for (const f of READERS) expect(at(f, lang), `${lang}/${f}`).toContain('.bmad/sprint-status.yaml');
  });
});

describe('"Which path?" decision page', () => {
  const GUIDE = '11-which-path.md';

  it.each(LANGS)('exists and routes greenfield, brownfield, bugfix and autonomous sprint (lang=%s)', (lang) => {
    const guide = read('docs/guides', lang, GUIDE);
    for (const cmd of ['/workflow:init', '/workflow:auto-sprint', '/project:reverse', '/qa:tdd']) expect(guide).toContain(cmd);
  });

  it.each(LANGS)('is linked from /common:getting-started and /workflow:init (lang=%s)', (lang) => {
    expect(read('Dev/i18n', lang, 'Common/commands/getting-started.md')).toContain(GUIDE);
    expect(read('Dev/i18n', lang, 'Workflow/commands/init.md')).toContain(GUIDE);
  });

  it('is linked from the README', () => {
    expect(read('README.md')).toContain(`docs/guides/en/${GUIDE}`);
  });
});
