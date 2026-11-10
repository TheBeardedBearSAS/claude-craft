import { describe, it, expect } from 'vitest';
import path from 'path';
import { runHook, pathWithout, HOOKS_DIR } from '../helpers/hook-harness.mjs';

// PostToolUse(Bash) opt-in : remplace une sortie > 50 000 caractères par un extrait,
// en respectant la forme de la sortie Bash ({stdout, stderr, interrupted, isImage}).
const HOOK = path.join(HOOKS_DIR, 'output-filter.sh');
const payload = (stdout, extra = {}) => ({
  tool_name: 'Bash',
  tool_response: { stdout, stderr: 'warn', interrupted: false, isImage: false, ...extra },
});

describe.each([
  ['jq ou node', {}],
  ['repli node', { PATH: pathWithout('jq') }],
])('output-filter.sh — %s', (_l, env) => {
  const run = (p) => runHook(HOOK, p, { env });

  it('sortie courte : silence', () => {
    const r = run(payload('x'.repeat(50000)));
    expect(r.status).toBe(0);
    expect(r.stdout).toBe('');
  });

  it('sortie volumineuse : objet Bash complet dans updatedToolOutput', () => {
    const r = run(payload('abcdefghij'.repeat(6000), { interrupted: true }));
    expect(r.status).toBe(0);
    const h = r.json.hookSpecificOutput;
    expect(h.hookEventName).toBe('PostToolUse');
    expect(Object.keys(h.updatedToolOutput).sort()).toEqual(['interrupted', 'isImage', 'stderr', 'stdout']);
    expect(h.updatedToolOutput).toMatchObject({ stderr: 'warn', interrupted: true, isImage: false });
    expect(h.updatedToolOutput.stdout).toContain('60000 chars total');
    expect(h.updatedToolOutput.stdout.length).toBeLessThan(8500);
  });

  it('charge utile vide ou sans stdout : silence', () => {
    expect(run({}).stdout).toBe('');
    expect(run({ tool_response: 'texte' }).stdout).toBe('');
  });
});
