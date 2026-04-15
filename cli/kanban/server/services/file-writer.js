import { open, rename, copyFile, unlink, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { parseFile, stringify } from './frontmatter.js';

/**
 * Atomic update of a Markdown file's frontmatter.
 *
 * Safety :
 *   1. Exclusive lock file (<path>.lock, O_CREAT|O_EXCL) — refuses concurrent writes.
 *   2. Optional mtime check (ETag-like) — rejects writes if file changed on disk.
 *   3. Backup (<path>.bak) — restored if the write fails.
 *   4. Write to a temp file then rename — atomic on POSIX.
 *   5. Body of the markdown file is preserved byte-for-byte.
 */

class LockedError extends Error {
  constructor(filepath) {
    super(`File is locked: ${filepath}`);
    this.code = 'LOCKED';
  }
}

class MtimeMismatchError extends Error {
  constructor(filepath, expected, actual) {
    super(`mtime mismatch for ${filepath}: expected ${expected}, got ${actual}`);
    this.code = 'MTIME_MISMATCH';
  }
}

async function acquireLock(filepath) {
  const lockPath = `${filepath}.lock`;
  try {
    const fd = await open(lockPath, 'wx');
    await fd.close();
    return lockPath;
  } catch (err) {
    if (err.code === 'EEXIST') throw new LockedError(filepath);
    throw err;
  }
}

async function releaseLock(lockPath) {
  try { await unlink(lockPath); } catch { /* ignore */ }
}

/**
 * @param {string} filepath
 * @param {object} patch - partial frontmatter to merge
 * @param {object} [opts]
 * @param {number} [opts.expectedMtime] - if provided, write only if current mtime matches
 * @returns {Promise<{ data: object, body: string, mtime: number }>}
 */
export async function updateFrontmatter(filepath, patch, opts = {}) {
  const abs = path.resolve(filepath);
  const lockPath = await acquireLock(abs);
  const backup = `${abs}.bak`;
  try {
    if (typeof opts.expectedMtime === 'number') {
      const st = await stat(abs);
      if (st.mtimeMs !== opts.expectedMtime) {
        throw new MtimeMismatchError(abs, opts.expectedMtime, st.mtimeMs);
      }
    }

    const { data, body } = await parseFile(abs);
    await copyFile(abs, backup);

    const merged = { ...data, ...patch };
    const next = stringify(merged, body);
    const tmp = `${abs}.tmp-${process.pid}-${Date.now()}`;
    try {
      await writeFile(tmp, next, 'utf8');
      await rename(tmp, abs);
    } catch (err) {
      // Rollback from backup
      try { await copyFile(backup, abs); } catch { /* best effort */ }
      try { await unlink(tmp); } catch { /* ignore */ }
      throw err;
    }
    await unlink(backup);
    const st = await stat(abs);
    return { data: merged, body, mtime: st.mtimeMs };
  } catch (err) {
    try { await unlink(backup); } catch { /* backup may not exist yet */ }
    throw err;
  } finally {
    await releaseLock(lockPath);
  }
}

export { LockedError, MtimeMismatchError };
