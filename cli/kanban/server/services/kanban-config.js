import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { lstat, mkdir, open, readFile, rename, rm } from 'node:fs/promises';
import * as yaml from 'js-yaml';
import { z } from 'zod';
import { STATUSES } from '../../shared/schemas.js';
import { acquireLock, LockedError } from './lock.js';

/**
 * Board settings: `.bmad/kanban.yaml` -> `version: 1`, `wip_limits: { <status>: <1..99> }`.
 * Absent or invalid file = no limit (the invalid case is logged): settings never break the board.
 * WIP limits are indicative: they produce a warning, never a refusal.
 */

export { LockedError };

const MAX_BYTES = 64 * 1024;
const LOCK_WAIT = { retries: 50, retryDelayMs: 40 };

const limit = z.number().int().min(1).max(99);
const FileSchema = z
  .object({
    version: z.literal(1),
    wip_limits: z
      .object(Object.fromEntries(STATUSES.map((s) => [s, limit.optional()])))
      .strict()
      .default({}),
  })
  .passthrough();

const configPath = (projectRoot) => path.join(projectRoot, '.bmad', 'kanban.yaml');

async function readText(file) {
  let st;
  try {
    st = await lstat(file);
  } catch (err) {
    if (err.code === 'ENOENT') return null;
    throw err;
  }
  if (!st.isFile() || st.size > MAX_BYTES) throw new Error('not a regular file of reasonable size');
  return readFile(file, 'utf8');
}

async function loadLimits(file) {
  const text = await readText(file);
  if (text === null || text.trim() === '') return {};
  const parsed = FileSchema.parse(yaml.load(text));
  return parsed.wip_limits;
}

/** @returns {Promise<Record<string, number>>} {} when the file is absent or unusable */
export async function readWipLimits(projectRoot) {
  const file = configPath(projectRoot);
  try {
    return await loadLimits(file);
  } catch (err) {
    console.error(`[kanban] ignoring ${path.basename(file)} (no WIP limit applied):`, err.message);
    return {};
  }
}

function merge(current, patch) {
  const next = { ...current };
  for (const [status, value] of Object.entries(patch)) {
    if (value === null) delete next[status];
    else if (value !== undefined) next[status] = value;
  }
  return next;
}

async function writeAtomic(file, text) {
  const tmp = `${file}.tmp-${process.pid}-${randomUUID()}`;
  try {
    const fd = await open(tmp, 'wx', 0o644);
    try {
      await fd.writeFile(text, 'utf8');
      await fd.sync();
    } finally {
      await fd.close();
    }
    await rename(tmp, file);
  } catch (err) {
    await rm(tmp, { force: true });
    throw err;
  }
}

/**
 * @param {Record<string, number|null>} patch - number sets the limit of a status, null removes it
 * @returns {Promise<Record<string, number>>} the limits now in force
 * @throws {LockedError}
 */
export async function updateWipLimits(projectRoot, patch, { lockWait = LOCK_WAIT } = {}) {
  const file = configPath(projectRoot);
  await mkdir(path.dirname(file), { recursive: true });
  const release = await acquireLock(`${file}.lock`, lockWait);
  try {
    const current = await loadLimits(file).catch((err) => {
      console.error(`[kanban] replacing unusable ${path.basename(file)}:`, err.message);
      return {};
    });
    const wip_limits = merge(current, patch);
    await writeAtomic(file, yaml.dump({ version: 1, wip_limits }, { indent: 2 }));
    return wip_limits;
  } finally {
    await release();
  }
}

/**
 * Counted like the board's column: the stories of the active sprint, or every story when there is none.
 * @param {Array<{status: string, sprint_id?: string|null}>} stories - the board AFTER the move
 * @param {string|null} [activeSprintId]
 * @returns {string[]} ['wip_exceeded'] when `status` holds more stories than its limit, else []
 */
export function wipWarnings(stories, limits, status, activeSprintId = null) {
  const max = limits?.[status];
  if (max === undefined || max === null) return [];
  const shown = stories.filter((s) => s.status === status && (!activeSprintId || s.sprint_id === activeSprintId));
  return shown.length > max ? ['wip_exceeded'] : [];
}
