import { lstat, open, readFile, unlink } from 'node:fs/promises';

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

const MAX_LOCK_BYTES = 1024;

// Only a small regular file is a lock: a planted symlink to a FIFO or /dev/zero would block or fill memory.
async function regularLockStat(lockPath) {
  const st = await lstat(lockPath);
  return st.isFile() && st.size <= MAX_LOCK_BYTES ? st : null;
}

async function readOwner(lockPath) {
  try {
    if (!(await regularLockStat(lockPath))) return null;
    return JSON.parse(await readFile(lockPath, 'utf8'));
  } catch {
    return null; // vanished or unreadable
  }
}

async function isStale(lockPath, ttlMs, now) {
  let st;
  try {
    st = await regularLockStat(lockPath);
  } catch {
    return true; // vanished meanwhile: just retry
  }
  if (!st) return true; // not a lock any writer of this protocol creates: remove it
  const owner = await readOwner(lockPath); // null for an old-format (empty) or half-written lock: mtime below
  if (owner && Number.isInteger(owner.pid) && typeof owner.ts === 'number') {
    return now() - owner.ts > ttlMs || !pidAlive(owner.pid);
  }
  return now() - st.mtimeMs > ttlMs;
}

async function tryCreate(lockPath, now) {
  const owner = { pid: process.pid, ts: now() };
  const fd = await open(lockPath, 'wx');
  try {
    await fd.writeFile(JSON.stringify(owner));
  } finally {
    await fd.close();
  }
  return owner;
}

async function removeQuietly(lockPath) {
  try {
    await unlink(lockPath);
  } catch (err) {
    if (err.code !== 'ENOENT') throw err;
  }
}

/** Removes the lock only while it is still ours: after a stale takeover it belongs to someone else. */
async function removeIfOwned(lockPath, owner) {
  const current = await readOwner(lockPath);
  if (current?.pid === owner.pid && current?.ts === owner.ts) await removeQuietly(lockPath);
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
      const owner = await tryCreate(lockPath, now);
      let released = false;
      return async () => {
        if (released) return;
        released = true;
        await removeIfOwned(lockPath, owner);
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
