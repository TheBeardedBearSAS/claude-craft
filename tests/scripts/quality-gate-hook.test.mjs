import { describe, it, expect, beforeEach, afterAll } from 'vitest';
import { spawnSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { runHook, pathWithout, HOOKS_DIR, PROJECT_ROOT } from '../helpers/hook-harness.mjs';

// Hook Stop (profil full). Contrat : stdout vide (succès) ou UN objet
// {"decision":"block","reason":…} ; toute la sortie des tests va dans le journal ;
// `stop_hook_active` ne bloque jamais (sinon boucle infinie).
const HOOK = path.join(HOOKS_DIR, 'quality-gate.sh');
const ROOT = path.join(PROJECT_ROOT, '.test-tmp', 'quality-gate');
let dir;
let n = 0;

const git = (...args) =>
  spawnSync('git', ['-c', 'user.name=t', '-c', 'user.email=t@t', ...args], { cwd: dir, encoding: 'utf8' });
const logPath = (f) => path.join(dir, '.claude/logs', f);
const run = (cmd, extra = {}, opts = {}) =>
  runHook(HOOK, { cwd: dir, ...extra }, { env: { QUALITY_GATE_CMD: cmd, ...(opts.env || {}) } });

beforeEach(() => {
  dir = path.join(ROOT, `p${++n}`);
  fs.rmSync(dir, { recursive: true, force: true });
  fs.mkdirSync(dir, { recursive: true });
});

afterAll(() => fs.rmSync(ROOT, { recursive: true, force: true }));

describe('quality-gate.sh', () => {
  it('succès : stdout vide, sortie des tests dans le journal', () => {
    const r = run('echo hello; true');
    expect(r.status).toBe(0);
    expect(r.stdout).toBe('');
    expect(fs.readFileSync(logPath('quality-gate.log'), 'utf8')).toContain('hello');
  });

  it('échec : un seul JSON decision=block avec les dernières lignes', () => {
    const r = run('echo noise; false');
    expect(r.status).toBe(0);
    expect(r.json).toEqual({ decision: 'block', reason: expect.stringMatching(/^Tests failing:\n.*noise/s) });
    expect(fs.readFileSync(logPath('quality-gate.log'), 'utf8')).toContain('noise');
  });

  it('ne garde que les 20 dernières lignes dans la raison', () => {
    const r = run('seq 1 50; false');
    expect(r.json.reason).toContain('50');
    expect(r.json.reason).not.toMatch(/\n10\n/);
  });

  it('stop_hook_active : silence total, sans lancer les tests', () => {
    const r = run('false', { stop_hook_active: true });
    expect(r.status).toBe(0);
    expect(r.stdout).toBe('');
    expect(fs.existsSync(logPath('quality-gate.log'))).toBe(false);
  });

  it('fonctionne sans jq (repli node)', () => {
    const r = run('echo noise; false', {}, { env: { PATH: pathWithout('jq') } });
    expect(r.json.decision).toBe('block');
  });

  it('npm : ignore le script placeholder « no test specified »', () => {
    fs.writeFileSync(
      path.join(dir, 'package.json'),
      JSON.stringify({ scripts: { test: 'echo "Error: no test specified" && exit 1' } })
    );
    const r = runHook(HOOK, { cwd: dir });
    expect(r.status).toBe(0);
    expect(r.stdout).toBe('');
  });

  it('npm : lance scripts.test et bloque sur échec', () => {
    fs.writeFileSync(path.join(dir, 'package.json'), JSON.stringify({ scripts: { test: 'echo boom; exit 1' } }));
    const r = runHook(HOOK, { cwd: dir });
    expect(r.json.decision).toBe('block');
    expect(r.json.reason).toContain('boom');
  });

  it('aucun framework détecté : laisse passer sans rien lancer', () => {
    const r = runHook(HOOK, { cwd: dir });
    expect(r.status).toBe(0);
    expect(r.stdout).toBe('');
  });

  describe('empreinte git', () => {
    const count = () => fs.readFileSync(logPath('count'), 'utf8').trim().split('\n').length;
    const CMD = 'echo x >> .claude/logs/count';

    beforeEach(() => {
      git('init', '-q');
      fs.writeFileSync(path.join(dir, 'a.txt'), '1');
      git('add', 'a.txt');
      git('commit', '-q', '-m', 'init');
      fs.mkdirSync(path.join(dir, '.claude/logs'), { recursive: true });
    });

    it('saute les tests tant que rien ne change après un succès', () => {
      run(CMD);
      run(CMD);
      expect(count()).toBe(1);
    });

    it('relance après une modification', () => {
      run(CMD);
      fs.writeFileSync(path.join(dir, 'a.txt'), '2');
      run(CMD);
      expect(count()).toBe(2);
    });

    it('relance après un échec même sans modification', () => {
      run(`${CMD}; false`);
      run(`${CMD}; false`);
      expect(count()).toBe(2);
    });
  });
});
