import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

// --plugin-mode: the installers copy only what the bear-* plugins do not carry.
const ROOT = path.resolve(import.meta.dirname, '../..');
const TMP = path.join(ROOT, '.test-tmp', 'plugin-mode-test');
const run = (script, args) => spawnSync('bash', [path.join(ROOT, script), ...args], { encoding: 'utf8', cwd: ROOT });
const walk = (dir) =>
  fs.existsSync(dir)
    ? fs.readdirSync(dir, { withFileTypes: true }).flatMap((d) => {
        const p = path.join(dir, d.name);
        return d.isDirectory() ? walk(p) : [path.relative(TMP, p).split(path.sep).join('/')];
      })
    : [];

let project;
beforeAll(() => {
  fs.rmSync(TMP, { recursive: true, force: true });
  project = path.join(TMP, 'p');
  fs.mkdirSync(project, { recursive: true });
  for (const [script, args] of [
    [
      'Dev/scripts/install-common-rules.sh',
      ['--lang=fr', '--tech=react,docker', '--hooks=full', '--plugin-mode', '--force'],
    ],
    ['Dev/scripts/install-react-rules.sh', ['--lang=fr', '--plugin-mode', '--force']],
    ['Project/install-project-commands.sh', ['--lang=fr', '--skip-common', '--tech=react', '--plugin-mode', '--force']],
  ]) {
    const r = run(script, [...args, project]);
    expect(r.status, r.stderr + r.stdout).toBe(0);
  }
});
afterAll(() => fs.rmSync(TMP, { recursive: true, force: true }));

describe('--plugin-mode', { timeout: 120_000 }, () => {
  it('copies rules, references, CLAUDE.md, settings, scaffold, .github and AgentTeams lib', () => {
    const files = walk(project);
    const has = (re) => files.some((f) => re.test(f));
    expect(has(/\.claude\/rules\/01-workflow-analysis\.md$/)).toBe(true);
    expect(has(/\.claude\/references\/base\/solid-principles\.md$/)).toBe(true);
    expect(has(/\.claude\/references\/react\/project-context\.md$/)).toBe(true);
    expect(has(/\.claude\/references\/react\/checks\/all\.md$/)).toBe(true);
    expect(has(/\/\.claude\/CLAUDE\.md$/)).toBe(true);
    expect(has(/\/AGENTS\.md$/)).toBe(true);
    expect(has(/\/CLAUDE\.md$/)).toBe(true);
    expect(has(/\.claude\/settings\.json$/)).toBe(true);
    expect(has(/\.claude\/settings\.local\.json$/)).toBe(true);
    expect(has(/\.claudeignore$/)).toBe(true);
    expect(has(/\.github\/PULL_REQUEST_TEMPLATE\.md$/)).toBe(true);
    expect(has(/Tools\/AgentTeams\/lib\/cost-estimator\.sh$/)).toBe(true);
    expect(has(/project-management\/backlog\/index\.md$/)).toBe(true);
  });

  it('copies no commands, agents, skills, templates, checklists or hooks', () => {
    for (const dir of ['commands', 'agents', 'skills', 'templates', 'checklists', 'hooks']) {
      expect(fs.existsSync(path.join(project, '.claude', dir)), dir).toBe(false);
    }
  });

  it('merges no hooks into settings.json (the bear-hooks plugins carry them)', () => {
    const settings = JSON.parse(fs.readFileSync(path.join(project, '.claude/settings.json'), 'utf8'));
    expect(settings.hooks).toBeUndefined();
  });

  it('never overwrites settings.json, even with --force (claude writes enabledPlugins there)', () => {
    const file = path.join(project, '.claude/settings.json');
    const settings = JSON.parse(fs.readFileSync(file, 'utf8'));
    settings.enabledPlugins = { 'bear-react@bear-craft': true };
    fs.writeFileSync(file, JSON.stringify(settings));
    const r = run('Dev/scripts/install-common-rules.sh', ['--lang=fr', '--plugin-mode', '--force', project]);
    expect(r.status, r.stderr).toBe(0);
    expect(JSON.parse(fs.readFileSync(file, 'utf8')).enabledPlugins).toEqual({ 'bear-react@bear-craft': true });
  });

  it('lists the commands as /bear-<ns>:<cmd> in .claude/CLAUDE.md', () => {
    const text = fs.readFileSync(path.join(project, '.claude/CLAUDE.md'), 'utf8');
    expect(text).toMatch(/`\/bear-workflow:init`/);
    expect(text).not.toMatch(/`\/workflow:/);
  });

  it('the full mode (make install-*) still copies everything', () => {
    const full = path.join(TMP, 'full');
    fs.mkdirSync(full, { recursive: true });
    expect(run('Dev/scripts/install-common-rules.sh', ['--lang=en', '--hooks=none', '--force', full]).status).toBe(0);
    expect(fs.existsSync(path.join(full, '.claude/commands/bear-common/init.md'))).toBe(true);
    expect(fs.existsSync(path.join(full, '.claude/agents/tdd-coach.md'))).toBe(true);
  });
});
