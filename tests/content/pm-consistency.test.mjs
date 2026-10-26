import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import * as yaml from 'js-yaml';
import { SprintStatusSchema } from '../../cli/kanban/shared/schemas.js';

const PROJECT_ROOT = path.resolve(import.meta.dirname, '../..');
const LANGS = ['en', 'fr', 'es', 'de', 'pt'];

const read = (...parts) => fs.readFileSync(path.join(PROJECT_ROOT, ...parts), 'utf8');

function listMd(dir) {
  if (!fs.existsSync(dir)) return [];
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...listMd(full));
    else if (entry.name.endsWith('.md')) out.push(full);
  }
  return out;
}

// Lines of the PM sources (Project + Dev Workflow/QA/Team) matching `pattern`.
function hits(lang, pattern) {
  const files = [
    ...listMd(path.join(PROJECT_ROOT, 'Project/i18n', lang)),
    ...['Workflow', 'QA', 'Team'].flatMap((d) => listMd(path.join(PROJECT_ROOT, 'Dev/i18n', lang, d))),
  ];
  const out = [];
  for (const f of files) {
    fs.readFileSync(f, 'utf8')
      .split('\n')
      .forEach((line, i) => {
        if (pattern.test(line)) out.push(`${path.relative(PROJECT_ROOT, f)}:${i + 1}`);
      });
  }
  return out;
}

describe('PM commands share one file layout', () => {
  it.each(LANGS)('templates live in templates/, not Scrum/templates/ (lang=%s)', (lang) => {
    expect(hits(lang, /Scrum\/templates\//)).toEqual([]);
  });

  it.each(LANGS)('gates default to project-management/ documents (lang=%s)', (lang) => {
    expect(hits(lang, /(?<!project-management\/)docs\/(prd|tech-spec)\.md/)).toEqual([]);
    expect(read('Project/i18n', lang, 'Gate/commands/validate-prd.md')).toContain('project-management/prd.md');
    expect(read('Project/i18n', lang, 'Gate/commands/validate-techspec.md')).toContain(
      'project-management/tech-spec.md'
    );
  });

  it.each(LANGS)('one board (board.md) and one file per task (TASK-*.md) (lang=%s)', (lang) => {
    expect(hits(lang, /task-board\.md|US-XXX-tasks\.md|sprint-backlog\.md/)).toEqual([]);
    const decompose = read('Project/i18n', lang, 'commands/decompose-tasks.md');
    expect(decompose).toContain('board.md');
    expect(decompose).toMatch(/TASK-/);
  });

  it.each(LANGS)('sprint folders are named sprint-{N}-{slug} (lang=%s)', (lang) => {
    expect(hits(lang, /sprint-XXX|sprint-00\d-|T-XXX-YY/)).toEqual([]);
  });
});

describe('/workflow:init bootstraps the BMAD status file', () => {
  it.each(LANGS)('creates .bmad/sprint-status.yaml with routing (lang=%s)', (lang) => {
    const init = read('Dev/i18n', lang, 'Workflow/commands/init.md');
    expect(init).toContain('.bmad/sprint-status.yaml');
    expect(init).toContain('/workflow:auto-sprint');
    const block = init.match(/```yaml\n(# \.bmad\/sprint-status\.yaml[\s\S]*?)```/);
    expect(block).not.toBeNull();
    const doc = yaml.load(block[1]);
    expect(doc.routing.auto_transitions).toBeDefined();
    expect(SprintStatusSchema.safeParse(doc).success).toBe(true);
  });
});

describe('/workflow:auto-sprint can start a sprint that does not exist yet', () => {
  it.each(LANGS)('phase 0 delegates creation to phase 1 instead of aborting (lang=%s)', (lang) => {
    const phase0 = read('Dev/i18n', lang, 'Workflow/commands/auto-sprint.md')
      .split(/\n### /)
      .find((s) => /^(Phase|Fase) 0/.test(s));
    expect(phase0).toBeDefined();
    // Step 2 resolves the sprint; a dirty tree (step 3) may still abort.
    const resolveStep = phase0.match(/\n2\. [\s\S]*?(?=\n3\. )/)[0];
    expect(resolveStep).toContain('.bmad/sprint-status.yaml');
    expect(resolveStep).not.toMatch(/\*\*Ab(ort|andon|bruch)/i);
  });
});

describe('/qa:fix points to the command that creates sprint-status.yaml', () => {
  it.each(LANGS)('sprint-status.yaml missing -> /workflow:init (lang=%s)', (lang) => {
    const row = read('Dev/i18n', lang, 'QA/commands/fix.md')
      .split('\n')
      .find((l) => /^\| "/.test(l) && /sprint-status\.yaml/i.test(l));
    expect(row).toContain('/workflow:init');
    expect(read('Dev/i18n', lang, 'Workflow/commands/init.md')).toContain('.bmad/sprint-status.yaml');
  });
});

describe('/project:generate-backlog keeps PRD traceability', () => {
  it.each(LANGS)('reads prd.md and writes Implements: from the user-story template (lang=%s)', (lang) => {
    const cmd = read('Project/i18n', lang, 'commands/generate-backlog.md');
    expect(cmd).toContain('project-management/prd.md');
    expect(cmd).toContain('templates/user-story.md');
    expect(cmd).toContain('Implements');
    // /project:trace greps the literal key in every language.
    expect(read('Project/i18n', lang, 'templates/user-story.md')).toContain('- **Implements**:');
  });
});
