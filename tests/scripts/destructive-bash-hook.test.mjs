import { describe, it, expect, beforeAll } from 'vitest';
import { spawnSync } from 'child_process';
import fs from 'fs';
import path from 'path';

// Hook PreToolUse(Bash) du projet (.claude/settings.json). L'ancienne regex inline
// cherchait `rm<espace>` n'importe où puis un `-…r…` / `-…f…` n'importe où après :
// `docker run --rm … chown -R`, `--rm … ai-craft`, `2>/dev/null` étaient bloqués.
const PROJECT_ROOT = path.resolve(import.meta.dirname, '../..');
const HOOK = path.join(PROJECT_ROOT, '.claude/hooks/block-destructive-bash.sh');
// L'image node:24 de `make test-scripts-docker` n'a pas jq : shim Node limité à
// l'unique appel du hook (`jq -r '.tool_input.command // empty'`).
const SHIM_DIR = path.join(PROJECT_ROOT, '.test-tmp', 'destructive-bash-hook');

beforeAll(() => {
  fs.mkdirSync(SHIM_DIR, { recursive: true });
  const shim = path.join(SHIM_DIR, 'jq');
  fs.writeFileSync(
    shim,
    '#!/bin/sh\nexec node -e \'let s="";process.stdin.on("data",d=>s+=d).on("end",()=>process.stdout.write((JSON.parse(s).tool_input?.command ?? "")+"\\n"))\'\n'
  );
  fs.chmodSync(shim, 0o755);
});

function run(command) {
  const res = spawnSync('bash', [HOOK], {
    input: JSON.stringify({ tool_input: { command } }),
    encoding: 'utf8',
    env: { ...process.env, PATH: `${SHIM_DIR}:${process.env.PATH}` },
  });
  return res.status;
}

const BLOCKED = [
  'rm -rf build',
  'rm -fr build',
  'rm -Rf build',
  'rm -r -f build',
  'rm -f -r build',
  'rm --recursive --force build',
  'rm -rv --force build',
  'cd a && rm -rf b',
  'ls; rm -rf b',
  'sudo rm -rf /var/x',
  'find . -name x -exec rm -rf {} +',
  'printf x | xargs -0 rm -rf',
  'echo $(rm -rf x)',
  "sh -c 'rm -rf x'",
  'mkfs.ext4 /dev/sda1',
  'dd if=/dev/zero of=disk.img',
  'chmod -R 777 /',
  'echo x > /dev/sda',
  ':(){ :|:& };:',
];

const ALLOWED = [
  'docker run --rm -v "$P":/w alpine chown -R 1000:1000 /w',
  'docker run --rm img git branch -D refactor/ai-craft',
  'git worktree remove --force ../x && git branch -D refactor/ai-craft',
  "grep -RlF 'rm command detected' .claude",
  'ls missing 2>/dev/null',
  'make build > /dev/null',
  'rm -f file.txt',
  'rm -r empty-dir',
  'npm rm -g some-pkg',
  'git rm -r --cached dist',
  'gh pr close 129 --delete-branch',
  'echo farm -rf',
];

describe('block-destructive-bash.sh', () => {
  it.each(BLOCKED)('bloque : %s', (cmd) => {
    expect(run(cmd)).toBe(2);
  });

  it.each(ALLOWED)('autorise : %s', (cmd) => {
    expect(run(cmd)).toBe(0);
  });
});
