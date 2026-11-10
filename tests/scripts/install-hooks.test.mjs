import { describe, it, expect, beforeEach, afterAll } from 'vitest';
import { spawnSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { pathWithout } from '../helpers/hook-harness.mjs';

// Installeur : option --hooks=default|full|none. Copie les scripts dans
// .claude/hooks/ et fusionne un fragment de hooks dans .claude/settings.json sans
// jamais écraser les hooks de l'utilisateur.
const PROJECT_ROOT = path.resolve(import.meta.dirname, '../..');
const SCRIPT = path.join(PROJECT_ROOT, 'Dev/scripts/install-common-rules.sh');
const ROOT = path.join(PROJECT_ROOT, '.test-tmp', 'install-hooks');
let target;
let n = 0;

const install = (...args) =>
  spawnSync('bash', [SCRIPT, '--rules-only', '--lang=en', ...args, target], { encoding: 'utf8' });
const settingsPath = () => path.join(target, '.claude/settings.json');
const readSettings = () => JSON.parse(fs.readFileSync(settingsPath(), 'utf8'));
const commands = (settings, event) => (settings.hooks?.[event] ?? []).flatMap((g) => g.hooks.map((h) => h.command));
const allCommands = (settings) => Object.keys(settings.hooks ?? {}).flatMap((e) => commands(settings, e));

beforeEach(() => {
  target = path.join(ROOT, `t${++n}`);
  fs.mkdirSync(target, { recursive: true });
});
afterAll(() => fs.rmSync(ROOT, { recursive: true, force: true }));

describe('install-common-rules.sh --hooks', { timeout: 60000 }, () => {
  it('par défaut : chaque script référencé existe dans .claude/hooks/', () => {
    const r = install();
    expect(r.status).toBe(0);
    const scripts = allCommands(readSettings())
      .map((c) => c.match(/\.claude\/hooks\/([\w.-]+\.sh)/)?.[1])
      .filter(Boolean);
    expect(scripts).toEqual(
      expect.arrayContaining([
        'guard-network.sh',
        'block-dangerous-commands.sh',
        'pre-commit-check.sh',
        'protect-sensitive-files.sh',
        'output-size-hint.sh',
      ])
    );
    for (const s of scripts) expect(fs.existsSync(path.join(target, '.claude/hooks', s)), s).toBe(true);
    expect(fs.existsSync(path.join(target, '.claude/hooks/lib/hook-io.sh'))).toBe(true);
  });

  it('par défaut : pas de Stop (profil full seulement) ni de PostCompact', () => {
    install();
    const s = readSettings();
    expect(s.hooks.Stop).toBeUndefined();
    expect(s.hooks.PostCompact).toBeUndefined();
    expect(s.hooks.SessionStart.some((g) => g.matcher === 'compact')).toBe(true);
  });

  it('le hook installé fonctionne depuis le projet cible (lib résolue)', () => {
    install();
    const r = spawnSync('bash', [path.join(target, '.claude/hooks/block-dangerous-commands.sh')], {
      input: JSON.stringify({ tool_input: { command: 'rm -rf /' } }),
      encoding: 'utf8',
    });
    expect(r.status).toBe(2);
  });

  it('conserve le hook et les réglages existants, et ajoute les nôtres', () => {
    fs.mkdirSync(path.join(target, '.claude'), { recursive: true });
    const mine = { type: 'command', command: 'echo mine', timeout: 3 };
    const before = { env: { KEEP: '1' }, hooks: { PreToolUse: [{ matcher: 'Bash', hooks: [mine] }] } };
    fs.writeFileSync(settingsPath(), JSON.stringify(before, null, 2));
    expect(install().status).toBe(0);
    const s = readSettings();
    expect(s.env).toEqual({ KEEP: '1' });
    const bash = s.hooks.PreToolUse.find((g) => g.matcher === 'Bash');
    expect(bash.hooks[0]).toEqual(mine);
    expect(bash.hooks.length).toBeGreaterThan(1);
  });

  it('seconde exécution : aucun doublon, fichier identique', () => {
    install();
    const first = fs.readFileSync(settingsPath(), 'utf8');
    expect(install().status).toBe(0);
    expect(fs.readFileSync(settingsPath(), 'utf8')).toBe(first);
    const cmds = allCommands(readSettings());
    expect(new Set(cmds).size).toBe(cmds.length);
  });

  it('--hooks=none : ni .claude/hooks ni hooks dans settings.json', () => {
    expect(install('--hooks=none').status).toBe(0);
    expect(fs.existsSync(path.join(target, '.claude/hooks'))).toBe(false);
    expect(readSettings().hooks).toBeUndefined();
  });

  it('--hooks=full : ajoute Stop, lint et notification', () => {
    expect(install('--hooks=full').status).toBe(0);
    const s = readSettings();
    expect(commands(s, 'Stop').join()).toContain('quality-gate.sh');
    expect(commands(s, 'PostToolUse').join()).toContain('post-edit-lint.sh');
    expect(commands(s, 'Notification').join()).toContain('notify-slack.sh');
    expect(commands(s, 'PreToolUse').join()).toContain('guard-network.sh');
  });

  it('--dry-run : aucun fichier créé, settings.json existant inchangé', () => {
    const r = install('--dry-run');
    expect(r.status).toBe(0);
    expect(fs.existsSync(path.join(target, '.claude'))).toBe(false);

    fs.mkdirSync(path.join(target, '.claude'), { recursive: true });
    const original = '{"hooks":{"Stop":[]}}\n';
    fs.writeFileSync(settingsPath(), original);
    expect(install('--dry-run').status).toBe(0);
    expect(fs.readFileSync(settingsPath(), 'utf8')).toBe(original);
    expect(fs.existsSync(path.join(target, '.claude/hooks'))).toBe(false);
  });

  it('--backup sauvegarde le settings.json existant avant fusion', () => {
    fs.mkdirSync(path.join(target, '.claude'), { recursive: true });
    fs.writeFileSync(settingsPath(), '{"env":{"A":"1"}}\n');
    expect(install('--backup').status).toBe(0);
    const backups = fs.readdirSync(path.join(target, '.claude')).filter((f) => f.startsWith('settings.json.backup.'));
    expect(backups).toHaveLength(1);
  });

  it('refuse une valeur invalide', () => {
    const r = install('--hooks=bogus');
    expect(r.status).toBe(1);
    expect(r.stdout + r.stderr).toMatch(/hooks/i);
  });
});

describe('install-common-rules.sh --hooks=…,memory', { timeout: 60000 }, () => {
  const memDir = () => path.join(target, '.claude/hooks/memory-lifecycle');
  const hasSqlite = spawnSync('sh', ['-c', 'command -v sqlite3'], { encoding: 'utf8' }).status === 0;

  it('default,memory : scripts copiés, hooks fusionnés avec les chemins installés', () => {
    expect(install('--hooks=default,memory').status).toBe(0);
    for (const f of [
      '_db.sh',
      'session-start.sh',
      'prompt-submit.sh',
      'post-tool.sh',
      'pre-compact.sh',
      'session-end.sh',
    ]) {
      expect(fs.existsSync(path.join(memDir(), f)), f).toBe(true);
    }
    const s = readSettings();
    expect(commands(s, 'SessionEnd').join()).toContain('.claude/hooks/memory-lifecycle/session-end.sh');
    expect(commands(s, 'UserPromptSubmit').join()).toContain('memory-lifecycle/prompt-submit.sh');
    expect(allCommands(s).join('\n')).not.toContain('Dev/scripts');
    expect(commands(s, 'PreToolUse').join()).toContain('guard-network.sh');
    expect(s.hooks.Stop).toBeUndefined();
  });

  it('full,memory et ordre inverse sont acceptés', () => {
    expect(install('--hooks=full,memory').status).toBe(0);
    expect(commands(readSettings(), 'Stop').join()).toContain('quality-gate.sh');
    target = path.join(ROOT, `t${++n}`);
    fs.mkdirSync(target, { recursive: true });
    expect(install('--hooks=memory,default').status).toBe(0);
    expect(fs.existsSync(path.join(memDir(), '_db.sh'))).toBe(true);
  });

  it('none,memory : add-on seul, sans les hooks du profil', () => {
    expect(install('--hooks=none,memory').status).toBe(0);
    expect(fs.existsSync(path.join(target, '.claude/hooks/guard-network.sh'))).toBe(false);
    expect(fs.existsSync(path.join(memDir(), 'session-start.sh'))).toBe(true);
    expect(Object.keys(readSettings().hooks).sort()).toEqual([
      'PostToolUse',
      'PreCompact',
      'SessionEnd',
      'SessionStart',
      'UserPromptSubmit',
    ]);
  });

  it.each(['memory', 'default,full', 'default,memory,memory', 'default,bogus', 'default,'])(
    'refuse --hooks=%s',
    (v) => {
      const r = install(`--hooks=${v}`);
      expect(r.status).toBe(1);
      expect(r.stdout + r.stderr).toMatch(/hooks/i);
    }
  );

  it('idempotent', () => {
    install('--hooks=default,memory');
    const first = fs.readFileSync(settingsPath(), 'utf8');
    expect(install('--hooks=default,memory').status).toBe(0);
    expect(fs.readFileSync(settingsPath(), 'utf8')).toBe(first);
  });

  it('--dry-run : rien écrit', () => {
    expect(install('--hooks=default,memory', '--dry-run').status).toBe(0);
    expect(fs.existsSync(path.join(target, '.claude'))).toBe(false);
  });

  it('avertit si sqlite3 est absent du PATH', () => {
    const r = spawnSync('bash', [SCRIPT, '--rules-only', '--lang=en', '--hooks=default,memory', target], {
      encoding: 'utf8',
      env: { ...process.env, PATH: pathWithout('sqlite3') },
    });
    expect(r.status).toBe(0);
    expect(r.stdout + r.stderr).toMatch(/sqlite3 not found/);
  });

  it.skipIf(!hasSqlite)('les scripts installés tournent depuis le projet cible (base créée, rappel émis)', () => {
    install('--hooks=default,memory');
    const env = { ...process.env, CLAUDE_PROJECT_DIR: target };
    const run = (s, input = '{}') =>
      spawnSync('bash', [path.join(memDir(), s)], { input, encoding: 'utf8', env, cwd: target });
    expect(run('session-start.sh').status).toBe(0);
    expect(run('prompt-submit.sh', '{"prompt":"hello"}').status).toBe(0);
    expect(run('session-end.sh').status).toBe(0);
    expect(fs.existsSync(path.join(target, '.claude/memory.db'))).toBe(true);
    // Le résumé n'est rappelé que par une AUTRE session (id = jour + hash) : on le simule.
    spawnSync('sqlite3', [
      path.join(target, '.claude/memory.db'),
      "UPDATE sessions SET id='old' WHERE summary IS NOT NULL",
    ]);
    const ctx = JSON.parse(run('session-start.sh').stdout).hookSpecificOutput;
    expect(ctx.hookEventName).toBe('SessionStart');
    expect(ctx.additionalContext).toMatch(/^Recall from last session:\n\n.*1 prompts/s);
  });

  it.skipIf(!hasSqlite)('pre-compact : texte brut, pas de JSON', () => {
    install('--hooks=default,memory');
    const r = spawnSync('bash', [path.join(memDir(), 'pre-compact.sh')], {
      input: '{}',
      encoding: 'utf8',
      env: { ...process.env, CLAUDE_PROJECT_DIR: target },
      cwd: target,
    });
    expect(r.status).toBe(0);
    expect(r.stdout).toMatch(/^When compacting/);
  });
});

describe('install-common-rules.sh : exemples de hooks', { timeout: 60000 }, () => {
  it('copiés dans .claude/templates/hooks/ (schéma imbriqué, ni post-compact ni quality-gate)', () => {
    expect(install().status).toBe(0);
    const dir = path.join(target, '.claude/templates/hooks');
    const files = fs.readdirSync(dir);
    expect(files).toEqual(
      expect.arrayContaining(['README.md', 'output-filter.json', 'pre-compact.json', 'protect-files.json'])
    );
    expect(files).not.toContain('post-compact.json');
    expect(files).not.toContain('quality-gate.json');
    for (const f of files.filter((x) => x.endsWith('.json'))) {
      for (const g of Object.values(JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')).hooks).flat()) {
        expect(Array.isArray(g.hooks), `${f} entrée plate`).toBe(true);
      }
    }
  });

  it('--hooks=none : aucun exemple copié', () => {
    install('--hooks=none');
    expect(fs.existsSync(path.join(target, '.claude/templates/hooks'))).toBe(false);
  });
});
