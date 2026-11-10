import { describe, it, expect, beforeEach, afterAll } from 'vitest';
import { spawnSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { PROJECT_ROOT } from '../helpers/hook-harness.mjs';

// Génération / retrait de la configuration des hooks Ralph : fusion non destructive
// (merge-hooks), scripts copiés dans le projet, commandes pointant vers des fichiers réels.
const LIB = path.join(PROJECT_ROOT, 'Tools/Ralph/lib/hooks-generator.sh');
const ROOT = path.join(PROJECT_ROOT, '.test-tmp', 'ralph-hooks-generator');
let dir;
let n = 0;

const bash = (script, env = {}) =>
  spawnSync(
    'bash',
    [
      '-c',
      `set -euo pipefail
print_verbose() { :; }; print_info() { :; }; print_success() { :; }; print_warning() { echo "WARN: $*" >&2; }
CONFIG_FILE=""
source "${LIB}"
${script}`,
    ],
    { cwd: dir, encoding: 'utf8', env: { ...process.env, ...env } }
  );

const settingsPath = () => path.join(dir, '.claude/settings.json');
const readSettings = () => JSON.parse(fs.readFileSync(settingsPath(), 'utf8'));
const generate = (mode = 'advanced') =>
  bash(`HOOKS_MODE=${mode}; init_hooks; generate_hooks_config .claude/settings.json "$PWD"`);
const allHandlers = (s) =>
  Object.values(s.hooks ?? {}).flatMap((gs) => gs.flatMap((g) => g.hooks.map((h) => ({ ...h, matcher: g.matcher }))));
const ralphHandlers = (s) => allHandlers(s).filter((h) => h.command.includes('/.ralph/hooks/'));

const USER_HOOKS = {
  model: 'opus',
  hooks: {
    PreToolUse: [{ matcher: 'Bash', hooks: [{ type: 'command', command: 'my-guard.sh' }] }],
    Stop: [{ hooks: [{ type: 'command', command: 'my-stop.sh' }] }],
  },
};

beforeEach(() => {
  dir = path.join(ROOT, `p${++n}`);
  fs.rmSync(dir, { recursive: true, force: true });
  fs.mkdirSync(path.join(dir, '.claude'), { recursive: true });
});

afterAll(() => fs.rmSync(ROOT, { recursive: true, force: true }));

describe('hooks-generator.sh : génération', () => {
  it('préserve les hooks et réglages de l’utilisateur', () => {
    fs.writeFileSync(settingsPath(), JSON.stringify(USER_HOOKS));
    const r = generate();
    expect(r.status, r.stderr).toBe(0);
    const s = readSettings();
    expect(s.model).toBe('opus');
    const cmds = allHandlers(s).map((h) => h.command);
    expect(cmds).toContain('my-guard.sh');
    expect(cmds).toContain('my-stop.sh');
    expect(ralphHandlers(s).length).toBeGreaterThanOrEqual(3);
  });

  it('est idempotente', () => {
    fs.writeFileSync(settingsPath(), JSON.stringify(USER_HOOKS));
    generate();
    const first = fs.readFileSync(settingsPath(), 'utf8');
    generate();
    expect(fs.readFileSync(settingsPath(), 'utf8')).toBe(first);
  });

  it('crée settings.json quand il est absent', () => {
    const r = generate('simple');
    expect(r.status, r.stderr).toBe(0);
    expect(ralphHandlers(readSettings()).map((h) => h.command)).toEqual([
      'bash "$CLAUDE_PROJECT_DIR/.ralph/hooks/stop-dod-gate.sh"',
    ]);
  });

  it('copie les scripts dans le projet, sans écraser ceux qui existent', () => {
    fs.mkdirSync(path.join(dir, '.ralph/hooks'), { recursive: true });
    fs.writeFileSync(path.join(dir, '.ralph/hooks/stop-dod-gate.sh'), '# custom\n');
    generate();
    for (const f of ['session-restore.sh', 'pre-tool-context.sh', 'lib/ralph-common.sh']) {
      expect(fs.existsSync(path.join(dir, '.ralph/hooks', f)), f).toBe(true);
    }
    expect(fs.readFileSync(path.join(dir, '.ralph/hooks/stop-dod-gate.sh'), 'utf8')).toBe('# custom\n');
  });

  it('n’émet ni `once`, ni PreToolUse `.*`, ni status-injector', () => {
    generate();
    const s = readSettings();
    expect(JSON.stringify(s)).not.toContain('"once"');
    expect(JSON.stringify(s)).not.toContain('status-injector');
    const pre = (s.hooks.PreToolUse ?? []).map((g) => g.matcher);
    expect(pre).toEqual(['Agent|Task']);
  });

  it('chaque commande générée désigne un fichier existant', () => {
    generate();
    const handlers = ralphHandlers(readSettings());
    expect(handlers.length).toBeGreaterThan(0);
    for (const h of handlers) {
      const m = h.command.match(/^bash "\$CLAUDE_PROJECT_DIR\/(.+)"$/);
      expect(m, h.command).not.toBeNull();
      expect(fs.existsSync(path.join(dir, m[1])), h.command).toBe(true);
    }
  });

  it('remplace les anciennes entrées Ralph (chemin absolu, once) sans toucher aux autres', () => {
    const old = {
      hooks: {
        PreToolUse: [
          {
            matcher: '.*',
            hooks: [{ type: 'command', command: '/old/proj/.ralph/hooks/status-injector.sh', once: true }],
          },
          { matcher: 'Bash', hooks: [{ type: 'command', command: 'my-guard.sh' }] },
        ],
      },
    };
    fs.writeFileSync(settingsPath(), JSON.stringify(old));
    generate();
    const s = readSettings();
    expect(JSON.stringify(s)).not.toContain('/old/proj');
    expect(allHandlers(s).map((h) => h.command)).toContain('my-guard.sh');
  });

  it('ne touche pas à settings.json si node est introuvable (avertit)', () => {
    fs.writeFileSync(settingsPath(), JSON.stringify(USER_HOOKS));
    const before = fs.readFileSync(settingsPath(), 'utf8');
    const r = bash(
      'HOOKS_MODE=advanced; RALPH_MERGE_HOOKS_JS=/nonexistent.mjs; init_hooks; generate_hooks_config .claude/settings.json "$PWD"'
    );
    expect(r.status).toBe(0);
    expect(r.stderr).toContain('WARN');
    expect(fs.readFileSync(settingsPath(), 'utf8')).toBe(before);
  });
});

describe('hooks-generator.sh : retrait', () => {
  it('ne retire que les entrées Ralph', () => {
    fs.writeFileSync(settingsPath(), JSON.stringify(USER_HOOKS));
    generate();
    const r = bash('remove_hooks_config .claude/settings.json');
    expect(r.status, r.stderr).toBe(0);
    const s = readSettings();
    expect(ralphHandlers(s)).toEqual([]);
    expect(
      allHandlers(s)
        .map((h) => h.command)
        .sort()
    ).toEqual(['my-guard.sh', 'my-stop.sh']);
    expect(s.model).toBe('opus');
  });

  it('conserve `hooks` quand il ne contient rien de Ralph', () => {
    fs.writeFileSync(settingsPath(), JSON.stringify(USER_HOOKS));
    bash('remove_hooks_config .claude/settings.json');
    expect(readSettings()).toEqual(USER_HOOKS);
  });
});
