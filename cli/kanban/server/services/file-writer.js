import { randomUUID } from 'node:crypto';
import { rename, rm, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { parseFile, stringify } from './frontmatter.js';
import { acquireLock, LockedError } from './lock.js';

/**
 * Atomic update of a Markdown file's frontmatter.
 *
 * Safety :
 *   1. Exclusive lock file (<path>.lock, O_CREAT|O_EXCL) — refuses concurrent writes.
 *   2. Optional mtime check (ETag-like) — rejects writes if file changed on disk.
 *   3. Write to a fresh temp file (O_EXCL: never through a planted symlink) then rename — atomic on POSIX,
 *      so a failure leaves the original untouched. No `.bak` copy: a `<file>.bak` symlink committed in a
 *      hostile branch would have redirected that copy anywhere (e.g. .git/hooks/pre-commit).
 *   4. Body of the markdown file is preserved byte-for-byte.
 */

class MtimeMismatchError extends Error {
  constructor(filepath, expected, actual) {
    super(`mtime mismatch for ${filepath}: expected ${expected}, got ${actual}`);
    this.code = 'MTIME_MISMATCH';
  }
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
  const release = await acquireLock(`${abs}.lock`);
  try {
    if (typeof opts.expectedMtime === 'number') {
      const st = await stat(abs);
      if (st.mtimeMs !== opts.expectedMtime) {
        throw new MtimeMismatchError(abs, opts.expectedMtime, st.mtimeMs);
      }
    }

    const { data, body } = await parseFile(abs);
    const merged = { ...data, ...patch };
    const tmp = `${abs}.tmp-${process.pid}-${randomUUID()}`;
    try {
      await writeFile(tmp, stringify(merged, body), { encoding: 'utf8', flag: 'wx' });
      await rename(tmp, abs);
    } catch (err) {
      await rm(tmp, { force: true });
      throw err;
    }
    const st = await stat(abs);
    return { data: merged, body, mtime: st.mtimeMs };
  } finally {
    await release();
  }
}

export { LockedError, MtimeMismatchError };
