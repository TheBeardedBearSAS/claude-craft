import { open, rename, unlink, stat } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import path from 'node:path';
import { parseFile, stringify } from './frontmatter.js';

/**
 * Atomic update of a Markdown file's frontmatter.
 *
 * Safety :
 *   1. Exclusive lock file (<path>.lock, O_CREAT|O_EXCL) — refuses concurrent writes.
 *   2. Optional mtime check (ETag-like) — rejects writes if file changed on disk.
 *   3. Write to a temp file then rename — atomic on POSIX: the original stays intact if the write fails.
 *      The temp file has a random name and is created exclusively, and no predictable side file (the former
 *      <path>.bak) is written: a symlink planted under such a name would redirect the write outside the project.
 *   4. Body of the markdown file is preserved byte-for-byte.
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
  try {
    await unlink(lockPath);
  } catch {
    /* ignore */
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
  const lockPath = await acquireLock(abs);
  try {
    if (typeof opts.expectedMtime === 'number') {
      const st = await stat(abs);
      if (st.mtimeMs !== opts.expectedMtime) {
        throw new MtimeMismatchError(abs, opts.expectedMtime, st.mtimeMs);
      }
    }

    const { data, body } = await parseFile(abs);
    const merged = { ...data, ...patch };
    await replaceFile(abs, stringify(merged, body));
    const st = await stat(abs);
    return { data: merged, body, mtime: st.mtimeMs };
  } finally {
    await releaseLock(lockPath);
  }
}

async function replaceFile(abs, content) {
  const tmp = `${abs}.tmp-${process.pid}-${randomUUID()}`;
  const fd = await open(tmp, 'wx'); // exclusive: never follows or reuses an existing name
  try {
    await fd.writeFile(content, 'utf8');
    await fd.close();
    await rename(tmp, abs);
  } catch (err) {
    await fd.close().catch(() => {}); // already closed when rename failed
    await unlink(tmp).catch(() => {}); // best effort: the original file is untouched
    throw err;
  }
}

export { LockedError, MtimeMismatchError };
