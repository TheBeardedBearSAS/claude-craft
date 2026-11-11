import { execFile } from 'node:child_process';
import os from 'node:os';

const DEFAULT_PORT = 3737;
const MAX_USER_LENGTH = 60;

/**
 * @param {unknown} value - raw --port option (the CLI parser yields `true` for `--port 4000`)
 * @returns {number} integer in 1024..65535
 */
export function parsePort(value) {
  if (value === undefined) return DEFAULT_PORT;
  const hint = `use --port=<number> (got ${JSON.stringify(value)})`;
  if (value === true || !/^\d+$/.test(String(value))) throw new Error(`Invalid port: ${hint}`);
  const port = Number(value);
  if (port < 1024 || port > 65535) throw new Error(`Invalid port ${port}: must be between 1024 and 65535`);
  return port;
}

function clean(value) {
  if (typeof value !== 'string') return '';
  return value
    .replace(/[\r\n]+/g, ' ')
    .trim()
    .slice(0, MAX_USER_LENGTH)
    .trim();
}

/** Reads `git config user.name`; resolves '' on any failure (git absent, no config, timeout). */
export function readGitUserName() {
  return new Promise((resolve) => {
    // Failure is expected (no git, unset name): identity then falls back to the OS user.
    execFile('git', ['config', 'user.name'], { timeout: 1000 }, (err, stdout) => resolve(err ? '' : stdout));
  });
}

function osUsername() {
  try {
    return os.userInfo().username;
  } catch {
    return ''; // no passwd entry (some containers)
  }
}

/**
 * Author identity for history entries: --user > CLAUDE_CRAFT_USER > git user.name > OS user > 'kanban'.
 * @param {{ user?: unknown }} options
 * @param {Record<string, string|undefined>} env
 * @param {{ gitUserName?: string }} [sources]
 */
export function resolveUser(options, env, { gitUserName = '' } = {}) {
  const candidates = [options?.user, env?.CLAUDE_CRAFT_USER, gitUserName, osUsername()];
  for (const candidate of candidates) {
    const name = clean(candidate);
    if (name) return name;
  }
  return 'kanban';
}
