import { describe, it, expect } from 'vitest';
import path from 'path';
import { runHook, pathWithout, HOOKS_DIR } from '../helpers/hook-harness.mjs';

// Remplace la regex inline Edit/Write `credentials|secrets?|private.*key|\.env(\.|$)…`
// appliquée au chemin absolu, sensible à la casse : bloquait `.env.example`,
// `docs/secrets.md`, `tests/credentials.test.mjs`, laissait passer `.ENV`.
const HOOK = path.join(HOOKS_DIR, 'protect-sensitive-files.sh');
const run = (tool, file, opts) => {
  const key = tool === 'NotebookEdit' ? 'notebook_path' : 'file_path';
  return runHook(HOOK, { tool_name: tool, tool_input: { [key]: file } }, opts);
};

const BLOCKED = [
  '/p/.env',
  '/p/.ENV',
  '/p/.env.local',
  '/p/.envrc',
  '/home/u/.ssh/id_ed25519',
  '/home/u/.ssh/config',
  '/p/certs/server.PEM',
  '/p/tls/private.key',
  '/p/.npmrc',
  '/home/u/.aws/credentials',
  '/p/config/secrets.yml',
  '/p/.kube/config',
  '/p/Credentials.json',
];

const ALLOWED = [
  '/p/.env.example',
  '/p/.env.dist',
  '/p/.envrc.sample',
  '/p/docs/secrets.md',
  '/p/tests/credentials.test.mjs',
  '/p/.claude/skills/security/secret-scanning.md',
  '/p/id_rsa.pub',
  '/home/u/secrets-manager/src/index.ts',
  '/p/src/environment.ts',
  '/p/src/private/keyboard.ts',
  '/p/docs/kubeconfig-guide.md',
];

describe('protect-sensitive-files.sh', () => {
  it.each(BLOCKED)('bloque Edit : %s', (file) => {
    const r = run('Edit', file);
    expect(r.status).toBe(2);
    expect(r.stderr).toMatch(/BLOCKED/);
  });

  it.each(ALLOWED)('autorise Edit : %s', (file) => {
    expect(run('Edit', file).status).toBe(0);
  });

  it('couvre Write et NotebookEdit', () => {
    expect(run('Write', '/p/.env').status).toBe(2);
    expect(run('NotebookEdit', '/p/.env').status).toBe(2);
    expect(run('Write', '/p/README.md').status).toBe(0);
  });

  it('fonctionne sans jq (repli node)', () => {
    const env = { PATH: pathWithout('jq') };
    expect(run('Edit', '/p/.env', { env }).status).toBe(2);
    expect(run('Edit', '/p/.env.example', { env }).status).toBe(0);
  });
});
