import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { spawnSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { migrateLegacyInstall, shippedFiles } from '../../cli/lib/migrate-legacy.js';

// A copy-based installation (what 9.x and 10.0 pre-releases wrote) is produced by the REAL full installers,
// then migrated: our files go, the user's stay.
const ROOT = path.resolve(import.meta.dirname, '../..');
const TMP = path.join(ROOT, '.test-tmp', 'migrate-legacy-test');

const sh = (script, args) => {
  const r = spawnSync('bash', [path.join(ROOT, script), '--lang=en', ...args], { encoding: 'utf8', cwd: ROOT });
  expect(r.status, r.stderr).toBe(0);
};
const exists = (project, rel) => fs.existsSync(path.join(project, '.claude', rel));
const messages = () => ({ logs: [], warns: [] });

function copyInstall(name, { hooks = 'full,memory', legacyLayout = false } = {}) {
  const project = path.join(TMP, name);
  fs.mkdirSync(project, { recursive: true });
  sh('Dev/scripts/install-common-rules.sh', [`--hooks=${hooks}`, '--force', project]);
  sh('Dev/scripts/install-react-rules.sh', ['--force', project]);
  sh('Infra/install-docker-rules.sh', ['--force', project]);
  sh('Project/install-project-commands.sh', ['--skip-common', '--force', project]);
  if (legacyLayout) {
    const base = path.join(project, '.claude/commands');
    for (const d of fs.readdirSync(base)) fs.renameSync(path.join(base, d), path.join(base, d.replace(/^bear-/, '')));
  }
  return project;
}

beforeAll(() => {
  fs.rmSync(TMP, { recursive: true, force: true });
  fs.mkdirSync(TMP, { recursive: true });
});
afterAll(() => fs.rmSync(TMP, { recursive: true, force: true }));

describe('migrateLegacyInstall', { timeout: 120_000 }, () => {
  it('recognises our files from the marketplace, the sources and the removed-commands manifest', () => {
    const ours = shippedFiles(ROOT, 'en');
    for (const key of [
      'commands/react/check.md',
      'commands/react/check-security.md', // scheduled stub
      'commands/docker/docker-architecture.md', // renamed infra command
      'agents/tdd-coach.md',
      'skills/solid-principles/SKILL.md',
      'hooks/guard-network.sh',
      'hooks/memory-lifecycle/_db.sh',
      'templates/project/prd.md',
    ]) {
      expect(ours.has(key), key).toBe(true);
    }
  });

  it('removes every shipped file of a full copy installation and the folders left empty', () => {
    const project = copyInstall('clean');
    expect(exists(project, 'agents/tdd-coach.md')).toBe(true);
    expect(exists(project, 'hooks/guard-network.sh')).toBe(true);
    const m = messages();
    const res = migrateLegacyInstall({
      target: project,
      lang: 'en',
      cliRoot: ROOT,
      log: (x) => m.logs.push(x),
      warn: (x) => m.warns.push(x),
    });

    for (const dir of ['commands', 'agents', 'skills', 'templates', 'checklists', 'hooks']) {
      expect(exists(project, dir), dir).toBe(false);
    }
    expect(res.kept).toEqual([]);
    expect(res.removed).toBeGreaterThan(100);
    expect(m.warns).toEqual([]);
    // rules and references are not touched: the CLI keeps copying them
    expect(exists(project, 'rules/01-workflow-analysis.md')).toBe(true);
    expect(exists(project, 'references/react/checks/all.md')).toBe(true);
  });

  it('also migrates the pre-10.0 layout (commands/<ns>/ without the bear- prefix)', () => {
    const project = copyInstall('legacy-layout', { legacyLayout: true });
    expect(exists(project, 'commands/common')).toBe(true);
    migrateLegacyInstall({ target: project, lang: 'en', cliRoot: ROOT });
    expect(exists(project, 'commands')).toBe(false);
  });

  it('keeps the files the user added, warns, and still removes ours around them', () => {
    const project = copyInstall('mixed', { legacyLayout: true });
    fs.writeFileSync(path.join(project, '.claude/commands/common/my-own.md'), '# mine\n');
    fs.writeFileSync(path.join(project, '.claude/agents/my-agent.md'), '# mine\n');
    fs.mkdirSync(path.join(project, '.claude/skills/my-skill'), { recursive: true });
    fs.writeFileSync(path.join(project, '.claude/skills/my-skill/SKILL.md'), '# mine\n');
    fs.mkdirSync(path.join(project, '.claude/skills/community/third-party'), { recursive: true });
    fs.writeFileSync(path.join(project, '.claude/skills/community/third-party/SKILL.md'), '# community\n');
    fs.writeFileSync(path.join(project, '.claude/hooks/my-hook.sh'), '#!/bin/bash\n');

    const m = messages();
    const res = migrateLegacyInstall({ target: project, lang: 'en', cliRoot: ROOT, warn: (x) => m.warns.push(x) });

    expect(fs.readdirSync(path.join(project, '.claude/commands'))).toEqual(['common']);
    expect(fs.readdirSync(path.join(project, '.claude/commands/common'))).toEqual(['my-own.md']);
    expect(fs.readdirSync(path.join(project, '.claude/agents'))).toEqual(['my-agent.md']);
    expect(fs.readdirSync(path.join(project, '.claude/skills')).sort()).toEqual(['community', 'my-skill']);
    expect(exists(project, 'skills/community/third-party/SKILL.md')).toBe(true);
    expect(fs.readdirSync(path.join(project, '.claude/hooks'))).toEqual(['my-hook.sh']);
    expect(res.kept.sort()).toEqual([
      'agents/my-agent.md',
      'commands/common/my-own.md',
      'hooks/my-hook.sh',
      'skills/my-skill/SKILL.md',
    ]);
    expect(
      m.warns.some((w) => /\.claude\/commands\/common\/ kept for your files \(my-own\.md\).*\/bear-common:\*/.test(w))
    ).toBe(true);
    expect(m.warns.some((w) => w.includes('.claude/agents/ kept for your files (my-agent.md)'))).toBe(true);
  });

  it('removes the hooks we merged into settings.json and keeps the user settings and hooks', () => {
    const project = copyInstall('hooks');
    const file = path.join(project, '.claude/settings.json');
    const settings = JSON.parse(fs.readFileSync(file, 'utf8'));
    expect(JSON.stringify(settings.hooks)).toContain('guard-network.sh');
    expect(JSON.stringify(settings.hooks)).toContain('memory-lifecycle');
    settings.hooks.PreToolUse.push({ matcher: 'Bash', hooks: [{ type: 'command', command: 'bash ./my-check.sh' }] });
    fs.writeFileSync(file, JSON.stringify(settings));

    const res = migrateLegacyInstall({ target: project, lang: 'en', cliRoot: ROOT });

    const out = JSON.parse(fs.readFileSync(file, 'utf8'));
    expect(res.hooksRemoved).toBeGreaterThanOrEqual(10);
    expect(JSON.stringify(out.hooks)).not.toContain('guard-network.sh');
    expect(JSON.stringify(out.hooks)).not.toContain('memory-lifecycle');
    expect(JSON.stringify(out.hooks)).not.toContain('context-essentials');
    expect(JSON.stringify(out.hooks)).toContain('./my-check.sh');
    expect(out.permissions).toEqual(settings.permissions);
  });

  it('drops the hooks key once nothing is left in it', () => {
    const project = copyInstall('hooks-empty');
    migrateLegacyInstall({ target: project, lang: 'en', cliRoot: ROOT });
    expect(JSON.parse(fs.readFileSync(path.join(project, '.claude/settings.json'), 'utf8')).hooks).toBeUndefined();
  });

  it('is a no-op on a project that already uses plugins only', () => {
    const project = path.join(TMP, 'plugins-only');
    fs.mkdirSync(path.join(project, '.claude/rules'), { recursive: true });
    fs.writeFileSync(path.join(project, '.claude/rules/x.md'), '#');
    const res = migrateLegacyInstall({ target: project, lang: 'en', cliRoot: ROOT });
    expect(res).toEqual({ removed: 0, kept: [], hooksRemoved: 0 });
    expect(exists(project, 'rules/x.md')).toBe(true);
  });
});

describe('migrateLegacyInstall path safety (SonarCloud S8707)', () => {
  it('refuses a system directory and an invalid language before touching anything', () => {
    expect(() => migrateLegacyInstall({ target: '/etc', lang: 'en', cliRoot: ROOT })).toThrow(/system directory/);
    expect(() => migrateLegacyInstall({ target: TMP, lang: '../x', cliRoot: ROOT })).toThrow(/Invalid --lang/);
  });
});
