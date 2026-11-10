import { describe, it, expect, beforeEach, afterAll } from 'vitest';
import { spawnSync } from 'child_process';
import fs from 'fs';
import path from 'path';

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
