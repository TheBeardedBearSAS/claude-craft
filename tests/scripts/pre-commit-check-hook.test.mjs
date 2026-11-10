import { describe, it, expect, beforeEach, afterAll } from 'vitest';
import { spawnSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { runHook, pathWithout, HOOKS_DIR, PROJECT_ROOT } from '../helpers/hook-harness.mjs';

// Hook PreToolUse(Bash) : avant un `git commit`, refuse les fichiers sensibles et
// les secrets à fort signal. L'ancien matcher `Bash(git commit:*)` ne correspondait
// jamais ; la détection du commit se fait donc dans le script, en position de commande.
const HOOK = path.join(HOOKS_DIR, 'pre-commit-check.sh');
const ROOT = path.join(PROJECT_ROOT, '.test-tmp', 'pre-commit-check');
let dir;
let n = 0;

// Faux secrets assemblés à l'exécution : ce fichier ne doit pas matcher les motifs.
const FAKE = {
  key: `-----BEGIN RSA ${'PRIVATE'} KEY-----\nabc\n`,
  aws: `AKIA${'ABCDEFGHIJKLMNOP'}`,
  ghp: `ghp_${'a'.repeat(36)}`,
  slack: `xoxb-${'1234567890'}-abc`,
};

const git = (...args) =>
  spawnSync('git', ['-c', 'user.name=t', '-c', 'user.email=t@t', ...args], { cwd: dir, encoding: 'utf8' });
const write = (f, content = 'x') => {
  fs.mkdirSync(path.dirname(path.join(dir, f)), { recursive: true });
  fs.writeFileSync(path.join(dir, f), content);
};
const stage = (f, content) => {
  write(f, content);
  git('add', f);
};
const run = (command, opts = {}) => runHook(HOOK, { tool_input: { command }, cwd: dir }, opts);

beforeEach(() => {
  dir = path.join(ROOT, `r${++n}`);
  fs.rmSync(dir, { recursive: true, force: true });
  fs.mkdirSync(dir, { recursive: true });
  git('init', '-q');
  stage('README.md', 'hello');
  git('commit', '-q', '-m', 'init');
});

afterAll(() => fs.rmSync(ROOT, { recursive: true, force: true }));

describe('pre-commit-check.sh', () => {
  it('bloque un .env indexé', () => {
    stage('.env', 'A=1');
    const r = run('git commit -m x');
    expect(r.status).toBe(2);
    expect(r.stderr).toMatch(/BLOCKED.*\.env/);
  });

  it('autorise .env.example', () => {
    stage('.env.example', 'A=');
    expect(run('git commit -m x').status).toBe(0);
  });

  it.each(Object.keys(FAKE))('bloque un secret à fort signal : %s', (kind) => {
    stage('notes.txt', FAKE[kind]);
    expect(run('git commit -m x').status).toBe(2);
  });

  it('autorise un fichier ordinaire (motifs `password =` ignorés)', () => {
    stage('conf.txt', 'password = "changeme"\ntoken = x\n');
    expect(run('git commit -m x').status).toBe(0);
  });

  it('git add … && git commit : inclut les secrets non indexés et non suivis', () => {
    write('leak.txt', FAKE.aws);
    expect(run('git add . && git commit -m x').status).toBe(2);
    expect(run('git commit -m x').status).toBe(0);
  });

  it('commit -a / -am / --all : inclut les modifications non indexées', () => {
    write('README.md', FAKE.ghp);
    expect(run('git commit -am x').status).toBe(2);
    expect(run('git commit -a -m x').status).toBe(2);
    expect(run('git commit --all -m x').status).toBe(2);
    expect(run('git commit -m x').status).toBe(0);
  });

  it('cd sub && git commit', () => {
    stage('.env', 'A=1');
    expect(run('cd sub && git commit -m x').status).toBe(2);
  });

  it('git -C <dir> commit examine ce dépôt-là', () => {
    stage('.env', 'A=1');
    expect(run('git -C . commit -m x').status).toBe(2);
    const other = path.join(ROOT, `other${n}`);
    fs.mkdirSync(other, { recursive: true });
    spawnSync('git', ['init', '-q'], { cwd: other });
    fs.writeFileSync(path.join(other, '.env'), 'A=1');
    spawnSync('git', ['add', '.env'], { cwd: other });
    const r = runHook(HOOK, { tool_input: { command: `git -C ${other} commit -m x` }, cwd: ROOT });
    expect(r.status).toBe(2);
  });

  it('ignore les commandes qui ne commitent pas', () => {
    stage('.env', 'A=1');
    expect(run('git status').status).toBe(0);
    expect(run('git add .env').status).toBe(0);
    expect(run('echo git commit').status).toBe(0);
    expect(run('grep "git commit" docs').status).toBe(0);
  });

  it('un message de commit en heredoc qui parle de .env ne déclenche rien', () => {
    const cmd = 'git commit -m "$(cat <<\'EOF\'\nfix: ne plus lire .env et git add .\nEOF\n)"';
    expect(run(cmd).status).toBe(0);
  });

  it('hors dépôt git : laisse passer', () => {
    const bare = path.join(ROOT, `bare${n}`);
    fs.mkdirSync(bare, { recursive: true });
    expect(runHook(HOOK, { tool_input: { command: 'git commit -m x' }, cwd: bare }).status).toBe(0);
  });

  it('fonctionne sans jq (repli node)', () => {
    stage('.env', 'A=1');
    expect(run('git commit -m x', { env: { PATH: pathWithout('jq') } }).status).toBe(2);
  });

  it('refuse (fail closed) sans jq ni node', () => {
    expect(run('git status', { env: { PATH: pathWithout('jq', 'node') } }).status).toBe(2);
  });
});
