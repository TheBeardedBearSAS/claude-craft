import { open, readFile, stat, unlink } from 'node:fs/promises';

/**
 * Advisory lock file (O_CREAT|O_EXCL) holding { pid, ts }.
 * A lock is stale when older than ttlMs or when its owner process is gone, so a
 * crashed writer cannot block the file forever.
 */

export class LockedError extends Error {
  constructor(filepath) {
    super(`File is locked: ${filepath}`);
    this.code = 'LOCKED';
  }
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function pidAlive(pid) {
  try {
    process.kill(pid, 0);
    return true;
  } catch (err) {
    return err.code !== 'ESRCH'; // EPERM = alive but not ours
  }
}

async function isStale(lockPath, ttlMs, now) {
  let owner = null;
  try {
    owner = JSON.parse(await readFile(lockPath, 'utf8'));
  } catch {
    // Old-format (empty) or half-written lock: fall back to the file mtime below.
  }
  if (owner && Number.isInteger(owner.pid) && typeof owner.ts === 'number') {
    return now() - owner.ts > ttlMs || !pidAlive(owner.pid);
  }
  try {
    return now() - (await stat(lockPath)).mtimeMs > ttlMs;
  } catch {
    return true; // vanished meanwhile: just retry
  }
}

async function tryCreate(lockPath, now) {
  const fd = await open(lockPath, 'wx');
  try {
    await fd.writeFile(JSON.stringify({ pid: process.pid, ts: now() }));
  } finally {
    await fd.close();
  }
}

async function removeQuietly(lockPath) {
  try {
    await unlink(lockPath);
  } catch (err) {
    if (err.code !== 'ENOENT') throw err;
  }
}

/**
 * @param {string} lockPath
 * @param {{ ttlMs?: number, retries?: number, retryDelayMs?: number, now?: () => number }} [opts]
 * @returns {Promise<() => Promise<void>>} idempotent release function
 * @throws {LockedError} when the lock is still held after the retries
 */
export async function acquireLock(lockPath, { ttlMs = 10_000, retries = 5, retryDelayMs = 40, now = Date.now } = {}) {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      await tryCreate(lockPath, now);
      let released = false;
      return async () => {
        if (released) return;
        released = true;
        await removeQuietly(lockPath);
      };
    } catch (err) {
      if (err.code !== 'EEXIST') throw err;
    }
    if (await isStale(lockPath, ttlMs, now)) {
      await removeQuietly(lockPath);
      continue;
    }
    if (attempt < retries) await sleep(retryDelayMs);
  }
  throw new LockedError(lockPath);
}
