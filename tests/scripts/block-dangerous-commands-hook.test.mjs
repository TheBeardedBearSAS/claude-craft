import { describe, it, expect } from 'vitest';
import path from 'path';
import { runHook, pathWithout, HOOKS_DIR } from '../helpers/hook-harness.mjs';

// Hook PreToolUse(Bash) distribué aux utilisateurs ET utilisé par le dépôt
// (BLOCK_RM_RF=all). Reprend les cas de l'ancien block-destructive-bash.sh.
const HOOK = path.join(HOOKS_DIR, 'block-dangerous-commands.sh');
const run = (command, mode = 'dangerous', opts = {}) =>
  runHook(HOOK, { tool_input: { command } }, { ...opts, env: { BLOCK_RM_RF: mode, ...(opts.env || {}) } });

// Bloqué quel que soit le mode.
const BLOCKED_ALWAYS = [
  // Le texte cité redevient du code après sh -c / eval, dans $(…) et `…`.
  'eval "rm -rf /"',
  // Fork bomb passée en code à un shell : le texte cité est du code ici.
  "sh -c ':(){ :|:& };:'",
  'bash -c ":(){ :|:& };:"',
  "eval ':(){ :|:& };:'",
  "cd /tmp && bash -lc 'bomb(){ bomb|bomb& };bomb'",
  'bash -c "echo hi; rm -rf /"',
  "sh -c 'cd /tmp && sudo ls'",
  'echo "$(sudo ls)"',
  'echo "`sudo ls`"',
  'x=$(rm -rf /)',
  'mkfs.ext4 /dev/sda1',
  'sudo mkfs /dev/sdb',
  'dd if=/dev/zero of=/dev/sda bs=1M',
  'dd if=x of=/dev/nvme0n1',
  'echo x > /dev/sda',
  ':(){ :|:& };:',
  ':(){:|:&};:',
  'sudo apt install x',
  'ls && sudo reboot',
  'echo a | su -c id',
  'doas rm x',
  'chmod 777 file',
  'chmod -R 777 /',
  'chmod 0777 x',
  'chown -R root /',
  'cat .env',
  'cat .env.local',
  'tail -n 5 config/.ENV',
  'head ~/.ssh/id_rsa',
  'less certs/server.pem',
  'bat .npmrc',
  'echo ok; cat .env',
  'rm -rf /',
  'rm -rf /*',
  'rm -rf ~',
  'rm -rf ~/',
  'rm -rf $HOME',
  'rm -rf ${HOME}',
  'rm -rf .',
  'rm -rf ..',
  'rm -rf *',
  'rm -rf /etc',
  'rm -fr /usr',
  'sudo rm -rf /var',
  'rm -rf build /home',
];

// Bloqué seulement en mode all.
const BLOCKED_ALL_ONLY = [
  'rm -rf build',
  'rm -fr build',
  'rm -Rf build',
  'rm -r -f build',
  'rm -f -r build',
  'rm --recursive --force build',
  'rm -rv --force build',
  'cd a && rm -rf b',
  'ls; rm -rf b',
  'find . -name x -exec rm -rf {} +',
  'printf x | xargs -0 rm -rf',
  'echo $(rm -rf x)',
  "sh -c 'rm -rf x'",
  'rm -rf /tmp/build',
];

const ALLOWED = [
  // Chaînes citées = données, même si elles contiennent des séparateurs.
  "grep 'rm -rf' fichier",
  'grep -rn "rm -rf /" docs/',
  'git commit -m "fix; rm -rf / no longer allowed"',
  'git commit -m "docs: never run && sudo rm -rf /"',
  'echo "x && sudo ls"',
  "printf '%s\\n' 'a | mkfs /dev/sda'",
  'echo "dd if=/dev/zero of=/dev/sda; done"',
  'echo "x > /dev/sda"',
  "echo ':(){ :|:& };:'",
  "grep -c 'chmod 777' README.md",
  'docker run --rm -v "$P":/w alpine chown -R 1000:1000 /w',
  'docker run --rm -v x:/w alpine chown -R 1000:1000 /w',
  'docker run --rm img git branch -D refactor/ai-craft',
  'git worktree remove --force ../x && git branch -D refactor/ai-craft',
  "grep -RlF 'rm command detected' .claude",
  'grep -r mkfs docs/',
  'git commit -m "fix rm -rf / bug"',
  'git commit -m "$(cat <<\'EOF\'\nfeat: x\n\nrm -rf / et sudo ls et cat .env\nEOF\n)"',
  'ls missing 2>/dev/null',
  'make build > /dev/null',
  'rm -f file.txt',
  'rm -r empty-dir',
  'npm rm -g some-pkg',
  'git rm -r --cached dist',
  'gh pr close 129 --delete-branch',
  'echo farm -rf',
  'echo pseudo sudo',
  'cat .env.example',
  'cat README.md',
  'chmod 755 script.sh',
  'chown -R 1000:1000 ./data',
  'dd if=in.img of=out.img',
];

describe('block-dangerous-commands.sh', () => {
  it.each(BLOCKED_ALWAYS)('bloque (dangerous) : %s', (cmd) => {
    const r = run(cmd);
    expect(r.status).toBe(2);
    expect(r.stderr).toMatch(/BLOCKED/);
  });

  it.each(BLOCKED_ALWAYS)('bloque (all) : %s', (cmd) => {
    expect(run(cmd, 'all').status).toBe(2);
  });

  it.each(BLOCKED_ALL_ONLY)('bloque en mode all : %s', (cmd) => {
    expect(run(cmd, 'all').status).toBe(2);
  });

  it.each(BLOCKED_ALL_ONLY.filter((c) => !c.includes('/tmp')))(
    'mode dangerous laisse passer une cible ordinaire : %s',
    (cmd) => {
      expect(run(cmd, 'dangerous').status).toBe(0);
    }
  );

  it('mode dangerous (défaut sans variable) autorise rm -rf /tmp/build', () => {
    expect(run('rm -rf /tmp/build', 'dangerous').status).toBe(0);
    const r = runHook(HOOK, { tool_input: { command: 'rm -rf build' } });
    expect(r.status).toBe(0);
  });

  it.each(ALLOWED)('autorise (all) : %s', (cmd) => {
    expect(run(cmd, 'all').status).toBe(0);
  });

  it.each(ALLOWED)('autorise (dangerous) : %s', (cmd) => {
    expect(run(cmd, 'dangerous').status).toBe(0);
  });

  it('fonctionne sans jq (repli node)', () => {
    const env = { PATH: pathWithout('jq') };
    expect(run('rm -rf /', 'dangerous', { env }).status).toBe(2);
    expect(run('rm -rf build', 'all', { env }).status).toBe(2);
    expect(run('ls', 'all', { env }).status).toBe(0);
  });

  it('bloque (fail closed) sans jq ni node', () => {
    const env = { PATH: pathWithout('jq', 'node') };
    expect(run('ls', 'all', { env }).status).toBe(2);
  });
});
