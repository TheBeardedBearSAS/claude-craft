import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import * as yaml from 'js-yaml';
import { SprintStatusSchema } from '../../cli/kanban/shared/schemas.js';

const PROJECT_ROOT = path.resolve(import.meta.dirname, '../..');
const LANGS = ['en', 'fr', 'es', 'de', 'pt'];

// The workflow track (/workflow:plan -> /workflow:start) only wrote markdown, while
// /gate:validate-sprint and /sprint:* read .bmad/sprint-status.yaml only.
const read = (...parts) => fs.readFileSync(path.join(PROJECT_ROOT, ...parts), 'utf8');
const start = (lang) => read('Dev/i18n', lang, 'Workflow/commands/start.md');
// 8.25.0: /gate:validate-sprint is a stub of /gate:check sprint
const gate = (lang) => read('Project/i18n', lang, 'Gate/commands/check.md');

describe('/workflow:start writes .bmad/sprint-status.yaml', () => {
  it.each(LANGS)('syncs the sprint status file and archives the previous sprint (lang=%s)', (lang) => {
    const cmd = start(lang);

    expect(cmd).toContain('.bmad/sprint-status.yaml');
    expect(cmd).toContain('archived_sprints');
    expect(cmd).toContain('/gate:check sprint');
  });

  it.each(LANGS)('documents a sprint-status.yaml the kanban schema accepts (lang=%s)', (lang) => {
    const block = start(lang).match(/```yaml\n(# \.bmad\/sprint-status\.yaml[\s\S]*?)```/);

    expect(block).not.toBeNull();
    const result = SprintStatusSchema.safeParse(yaml.load(block[1]));
    expect(result.success).toBe(true);
  });
});

describe('/gate:check sprint falls back on the sprint markdown', () => {
  it.each(LANGS)('accepts a sprint id (lang=%s)', (lang) => {
    expect(gate(lang)).toMatch(/`\[N\] \[--verbose\]`[^\n]*`1`, `001`/);
  });

  it.each(LANGS)('reads sprint-goal.md / sprint-dependencies.md when the yaml is missing (lang=%s)', (lang) => {
    const cmd = gate(lang);

    expect(cmd).toContain('sprint-goal.md');
    expect(cmd).toContain('sprint-dependencies.md');
    expect(cmd).toContain('/project:migrate');
  });
});
