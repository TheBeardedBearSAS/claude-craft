import { describe, it, expect, beforeEach, afterAll } from 'vitest';
import { spawnSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { addHooks, removeHooks } from '../../Dev/scripts/lib/merge-hooks.mjs';

const PROJECT_ROOT = path.resolve(import.meta.dirname, '../..');
const CLI = path.join(PROJECT_ROOT, 'Dev/scripts/lib/merge-hooks.mjs');
const ROOT = path.join(PROJECT_ROOT, '.test-tmp', 'merge-hooks');

const h = (command, timeout = 5) => ({ type: 'command', command, timeout });
const frag = (hooks) => ({ hooks });

describe('addHooks', () => {
  it('crée l’événement et le groupe absents', () => {
    const { settings, added } = addHooks({}, frag({ Stop: [{ matcher: '', hooks: [h('a')] }] }));
    expect(added).toBe(1);
    expect(settings.hooks.Stop).toEqual([{ matcher: '', hooks: [h('a')] }]);
  });

  it('ajoute au groupe de même matcher sans toucher aux hooks existants', () => {
    const user = { hooks: { PreToolUse: [{ matcher: 'Bash', hooks: [h('mine')] }] } };
    const { settings, added } = addHooks(user, frag({ PreToolUse: [{ matcher: 'Bash', hooks: [h('ours')] }] }));
    expect(added).toBe(1);
    expect(settings.hooks.PreToolUse).toHaveLength(1);
    expect(settings.hooks.PreToolUse[0].hooks).toEqual([h('mine'), h('ours')]);
  });

  it('un matcher absent équivaut à ""', () => {
    const user = { hooks: { Stop: [{ hooks: [h('mine')] }] } };
    const { settings } = addHooks(user, frag({ Stop: [{ matcher: '', hooks: [h('ours')] }] }));
    expect(settings.hooks.Stop).toHaveLength(1);
    expect(settings.hooks.Stop[0].hooks.map((x) => x.command)).toEqual(['mine', 'ours']);
  });

  it('crée un nouveau groupe pour un matcher différent', () => {
    const user = { hooks: { PreToolUse: [{ matcher: 'Bash', hooks: [h('mine')] }] } };
    const { settings } = addHooks(user, frag({ PreToolUse: [{ matcher: 'Edit', hooks: [h('ours')] }] }));
    expect(settings.hooks.PreToolUse.map((g) => g.matcher)).toEqual(['Bash', 'Edit']);
  });

  it('ignore une commande déjà présente dans l’événement, quel que soit le groupe', () => {
    const user = { hooks: { PreToolUse: [{ matcher: 'Edit', hooks: [h('ours')] }] } };
    const { settings, added } = addHooks(user, frag({ PreToolUse: [{ matcher: 'Bash', hooks: [h('ours')] }] }));
    expect(added).toBe(0);
    expect(settings.hooks.PreToolUse).toHaveLength(1);
  });

  it('est idempotent et conserve les autres clés', () => {
    const fragment = frag({ Stop: [{ matcher: '', hooks: [h('a')] }] });
    const once = addHooks({ env: { A: '1' }, permissions: { deny: ['x'] } }, fragment).settings;
    const twice = addHooks(once, fragment);
    expect(twice.added).toBe(0);
    expect(twice.settings).toEqual(once);
    expect(once.env).toEqual({ A: '1' });
    expect(once.permissions).toEqual({ deny: ['x'] });
  });
});

describe('removeHooks', () => {
  it('retire seulement les handlers qui contiennent la chaîne puis nettoie les groupes et événements vides', () => {
    const s = {
      hooks: {
        Stop: [{ matcher: '', hooks: [h('/.ralph/hooks/a.sh')] }],
        PreToolUse: [
          { matcher: 'Bash', hooks: [h('/.ralph/hooks/b.sh'), h('mine')] },
          { matcher: 'Edit', hooks: [h('/.ralph/hooks/c.sh')] },
        ],
      },
    };
    const { settings, removed } = removeHooks(s, '/.ralph/hooks/');
    expect(removed).toBe(3);
    expect(settings.hooks.Stop).toBeUndefined();
    expect(settings.hooks.PreToolUse).toEqual([{ matcher: 'Bash', hooks: [h('mine')] }]);
  });
});

describe('CLI', () => {
  let dir;
  let n = 0;
  const settingsPath = () => path.join(dir, 'settings.json');
  const fragPath = () => path.join(dir, 'fragment.json');
  const cli = (...args) => spawnSync('node', [CLI, ...args], { encoding: 'utf8' });

  beforeEach(() => {
    dir = path.join(ROOT, `c${++n}`);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(fragPath(), JSON.stringify(frag({ Stop: [{ matcher: '', hooks: [h('a')] }] })));
  });
  afterAll(() => fs.rmSync(ROOT, { recursive: true, force: true }));

  it('add crée le fichier de settings manquant', () => {
    const r = cli('add', '--settings', settingsPath(), '--fragment', fragPath());
    expect(r.status).toBe(0);
    expect(JSON.parse(fs.readFileSync(settingsPath(), 'utf8')).hooks.Stop[0].hooks[0].command).toBe('a');
  });

  it('add est idempotent', () => {
    cli('add', '--settings', settingsPath(), '--fragment', fragPath());
    const before = fs.readFileSync(settingsPath(), 'utf8');
    const r = cli('add', '--settings', settingsPath(), '--fragment', fragPath());
    expect(r.status).toBe(0);
    expect(fs.readFileSync(settingsPath(), 'utf8')).toBe(before);
  });

  it('add --dry-run annonce sans écrire', () => {
    const r = cli('add', '--settings', settingsPath(), '--fragment', fragPath(), '--dry-run');
    expect(r.status).toBe(0);
    expect(r.stdout).toMatch(/would add 1 handlers/);
    expect(fs.existsSync(settingsPath())).toBe(false);
  });

  it('add --dry-run ne modifie pas un fichier existant', () => {
    fs.writeFileSync(settingsPath(), '{"env":{"A":"1"}}');
    cli('add', '--settings', settingsPath(), '--fragment', fragPath(), '--dry-run');
    expect(fs.readFileSync(settingsPath(), 'utf8')).toBe('{"env":{"A":"1"}}');
  });

  it('JSON invalide : avertit, exit 0, n’écrit rien', () => {
    fs.writeFileSync(settingsPath(), '{ pas du json');
    const r = cli('add', '--settings', settingsPath(), '--fragment', fragPath());
    expect(r.status).toBe(0);
    expect(r.stderr + r.stdout).toMatch(/warning/i);
    expect(fs.readFileSync(settingsPath(), 'utf8')).toBe('{ pas du json');
  });

  it('remove --match', () => {
    cli('add', '--settings', settingsPath(), '--fragment', fragPath());
    const r = cli('remove', '--settings', settingsPath(), '--match', 'a');
    expect(r.status).toBe(0);
    expect(JSON.parse(fs.readFileSync(settingsPath(), 'utf8')).hooks.Stop).toBeUndefined();
  });

  it('remove sur un fichier absent est sans effet', () => {
    expect(cli('remove', '--settings', settingsPath(), '--match', 'a').status).toBe(0);
    expect(fs.existsSync(settingsPath())).toBe(false);
  });

  it('refuse une commande inconnue', () => {
    expect(cli('bogus').status).toBe(1);
  });
});
