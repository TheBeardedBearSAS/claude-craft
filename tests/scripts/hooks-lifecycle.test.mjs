import { describe, it, expect, beforeEach, afterAll } from 'vitest';
import { spawnSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { runHook, pathWithout, HOOKS_DIR, PROJECT_ROOT } from '../helpers/hook-harness.mjs';

// Hooks de cycle de vie (profil full) : session-init (SessionStart), post-tool-failure
// (PostToolUseFailure), pre-compact (PreCompact, optionnel) et session-end (SessionEnd).
// Chaque cas tourne avec jq (s'il est installé) et en repli node.
const ROOT = path.join(PROJECT_ROOT, '.test-tmp', 'hooks-lifecycle');
let dir;
let n = 0;

beforeEach(() => {
  dir = path.join(ROOT, `p${++n}`);
  fs.rmSync(dir, { recursive: true, force: true });
  fs.mkdirSync(dir, { recursive: true });
});
afterAll(() => fs.rmSync(ROOT, { recursive: true, force: true }));

const write = (rel, content) => {
  fs.mkdirSync(path.dirname(path.join(dir, rel)), { recursive: true });
  fs.writeFileSync(path.join(dir, rel), content);
};
const read = (rel) => fs.readFileSync(path.join(dir, rel), 'utf8');
const git = (...args) =>
  spawnSync('git', ['-c', 'user.name=t', '-c', 'user.email=t@t', ...args], { cwd: dir, encoding: 'utf8' });

const MODES = [
  ['parseur : jq ou node', {}],
  ['repli node (sans jq)', { PATH: pathWithout('jq') }],
];

describe.each(MODES)('hooks de cycle de vie — %s', (_label, env) => {
  const run = (script, payload, extra = {}) =>
    runHook(path.join(HOOKS_DIR, script), { cwd: dir, ...payload }, { env: { ...env, ...extra }, cwd: PROJECT_ROOT });

  describe('post-tool-failure.sh', () => {
    const fail = (tool_name, error) => run('post-tool-failure.sh', { tool_name, error });

    it('Bash : hookSpecificOutput PostToolUseFailure, casse ignorée', () => {
      const r = fail('Bash', 'bash: foo: Command Not Found');
      expect(r.status).toBe(0);
      expect(r.json.hookSpecificOutput.hookEventName).toBe('PostToolUseFailure');
      expect(r.json.hookSpecificOutput.additionalContext).toMatch(/not (found|installed)/i);
      expect(r.json).not.toHaveProperty('additionalContext');
    });

    it('Bash : permission denied en majuscules', () => {
      const r = fail('Bash', 'PERMISSION DENIED');
      expect(r.json.hookSpecificOutput.additionalContext).toMatch(/permission/i);
    });

    it('Agent (ex-Task) : timeout => conseil de découpage', () => {
      const r = fail('Agent', 'Request TIMEOUT');
      expect(r.json.hookSpecificOutput.additionalContext).toMatch(/sub-?agent/i);
    });

    it('Task reste reconnu (anciennes versions)', () => {
      expect(fail('Task', 'timeout').json.hookSpecificOutput.additionalContext).toMatch(/sub-?agent/i);
    });

    it('outil sans piste : stdout vide, exit 0', () => {
      const r = fail('mcp__x__y', 'boom');
      expect(r.status).toBe(0);
      expect(r.stdout).toBe('');
    });

    it('journalise sur une ligne dans .claude/logs/tool-failures.log', () => {
      fail('Read', 'No such file or directory\nsecond line');
      const log = read('.claude/logs/tool-failures.log');
      expect(log.trim().split('\n')).toHaveLength(1);
      expect(log).toMatch(/^\[\d{4}-\d\d-\d\dT[\d:]+Z\] \[WARN\] \[Read\]/);
    });
  });

  describe('pre-compact.sh', () => {
    it('sans état BMAD : texte brut vide, exit 0', () => {
      const r = run('pre-compact.sh', { session_id: 's1' });
      expect(r.status).toBe(0);
      expect(r.stdout).toBe('');
    });

    it('avec état BMAD : sauvegarde + consigne en texte brut (pas de JSON)', () => {
      write('.bmad/sprint-status.yaml', 'sprint: 1\n');
      const r = run('pre-compact.sh', { session_id: 's1' });
      expect(r.status).toBe(0);
      expect(r.json).toBeUndefined(); // non-JSON : texte brut
      expect(r.stdout).toMatch(/sprint-status\.yaml/);
      expect(
        fs.readdirSync(path.join(dir, '.bmad/backups')).filter((f) => f.startsWith('sprint-status-'))
      ).toHaveLength(1);
    });

    it('conserve les 10 dernières sauvegardes (boucle portable, sans xargs -r)', () => {
      write('.bmad/sprint-status.yaml', 'sprint: 1\n');
      for (let i = 0; i < 12; i++) {
        write(`.bmad/backups/old-${String(i).padStart(2, '0')}.yaml`, 'x');
        const t = new Date(Date.now() - (100 - i) * 60_000);
        fs.utimesSync(path.join(dir, `.bmad/backups/old-${String(i).padStart(2, '0')}.yaml`), t, t);
      }
      run('pre-compact.sh', { session_id: 's1' });
      const left = fs.readdirSync(path.join(dir, '.bmad/backups'));
      expect(left).toHaveLength(10);
      expect(left.some((f) => f.startsWith('sprint-status-'))).toBe(true);
    });
  });

  describe('session-end.sh', () => {
    const end = (extra = {}) => run('session-end.sh', { session_id: 's"1', reason: 'clear', ...extra });
    const metrics = () => {
      const f = fs.readdirSync(path.join(dir, '.claude/metrics')).find((x) => x.startsWith('session-'));
      return read(`.claude/metrics/${f}`)
        .trim()
        .split('\n')
        .map((l) => JSON.parse(l));
    };

    it('lit .reason, écrit une ligne JSONL valide (échappement inclus), stdout vide', () => {
      const r = end();
      expect(r.status).toBe(0);
      expect(r.stdout).toBe('');
      const [m] = metrics();
      expect(m).toMatchObject({ session_id: 's"1', reason: 'clear', files_modified: 0, tool_failures: 0 });
      expect(read('.claude/logs/session.log')).toContain('clear');
    });

    it('files_modified = git status --porcelain (pas de find sur tout le dépôt)', () => {
      git('init', '-q');
      write('a.txt', 'a');
      write('b.txt', 'b');
      end();
      expect(metrics()[0].files_modified).toBe(2);
    });

    it("tool_failures : un seul nombre même quand grep n'a aucune correspondance", () => {
      write('.claude/logs/tool-failures.log', '[1999-01-01T00:00:00Z] [ERROR] old\n');
      end();
      expect(metrics()[0].tool_failures).toBe(0);
      const day = new Date().toISOString().slice(0, 10);
      write('.claude/logs/tool-failures.log', `[${day}T00:00:00Z] [ERROR] a\n[${day}T00:00:01Z] [ERROR] b\n`);
      end({ session_id: 's2' });
      expect(metrics().at(-1).tool_failures).toBe(2);
    });

    it('résumé quotidien JSON valide, cumulé sur les sessions du jour', () => {
      end();
      end({ session_id: 's2' });
      const f = fs.readdirSync(path.join(dir, '.claude/metrics')).find((x) => x.startsWith('daily-summary-'));
      expect(JSON.parse(read(`.claude/metrics/${f}`))).toMatchObject({ total_sessions: 2 });
    });
  });

  describe('session-init.sh', () => {
    const init = (extra = {}) => {
      const envFile = path.join(dir, 'claude-env');
      fs.writeFileSync(envFile, '');
      const r = run('session-init.sh', {}, { CLAUDE_ENV_FILE: envFile, ...extra });
      return { r, envFile: fs.readFileSync(envFile, 'utf8') };
    };

    it('projet vide : aucune sortie', () => {
      const { r, envFile } = init();
      expect(r.status).toBe(0);
      expect(r.stdout).toBe('');
      expect(envFile).toBe('');
    });

    it('stack détectée via hookSpecificOutput SessionStart ; NODE_ENV jamais écrit', () => {
      write('package.json', JSON.stringify({ dependencies: { react: '19.0.0' } }));
      write('composer.json', JSON.stringify({ require: { php: '^8.4', 'symfony/framework-bundle': '^8.1' } }));
      write('compose.yaml', 'services:\n  db:\n    image: Postgres:17\n');
      write('docker-compose.yml', 'services:\n  c:\n    image: redis\n');
      const { r, envFile } = init();
      const ctx = r.json.hookSpecificOutput;
      expect(ctx.hookEventName).toBe('SessionStart');
      expect(ctx.additionalContext).toMatch(/Symfony \^8\.1.*PHP \^8\.4.*React 19\.0\.0.*PostgreSQL.*Redis/);
      expect(envFile).not.toMatch(/NODE_ENV/);
    });

    it(".env.local : lignes sûres préfixées d'export, commentaires/secrets/injections ignorés", () => {
      write(
        '.env.local',
        [
          '# LOG_LEVEL=trace',
          '',
          'LOG_LEVEL=debug',
          'PORT=3000',
          'SECRET_KEY=abc',
          'HOST=a; touch pwned',
          'DATABASE_URL=pg://u:p@h/d',
        ].join('\n')
      );
      const { envFile } = init();
      expect(envFile.trim().split('\n')).toEqual(['export LOG_LEVEL=debug', 'export PORT=3000']);
    });
  });
});
