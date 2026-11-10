import { describe, it, expect } from 'vitest';
import path from 'path';
import { runHook, pathWithout, HOOKS_DIR } from '../helpers/hook-harness.mjs';

// Remplace les `echo 'NOTICE: …'` inline (stdout + exit 0 en PostToolUse : jamais
// vu par le modèle). Seul hookSpecificOutput.additionalContext atteint Claude.
const HOOK = path.join(HOOKS_DIR, 'output-size-hint.sh');
const big = 'a'.repeat(60_000);

describe('output-size-hint.sh', () => {
  it('Bash > 50 Ko : additionalContext PostToolUse', () => {
    const r = runHook(HOOK, { tool_name: 'Bash', tool_response: { stdout: big, stderr: '' } });
    expect(r.status).toBe(0);
    expect(r.json.hookSpecificOutput.hookEventName).toBe('PostToolUse');
    expect(r.json.hookSpecificOutput.additionalContext).toMatch(/60000/);
    expect(r.json.additionalContext).toBeUndefined();
  });

  it('Grep > 50 Ko (réponse objet) : additionalContext', () => {
    const r = runHook(HOOK, { tool_name: 'Grep', tool_response: { content: big, numFiles: 3 } });
    expect(r.json.hookSpecificOutput.additionalContext).toBeTruthy();
  });

  it('petite sortie : stdout vide', () => {
    const r = runHook(HOOK, { tool_name: 'Bash', tool_response: { stdout: 'ok' } });
    expect(r.status).toBe(0);
    expect(r.stdout).toBe('');
  });

  it('fonctionne sans jq (repli node)', () => {
    const env = { PATH: pathWithout('jq') };
    const r = runHook(HOOK, { tool_name: 'Bash', tool_response: { stdout: big } }, { env });
    expect(r.json.hookSpecificOutput.hookEventName).toBe('PostToolUse');
  });
});
