import path from 'node:path';
import { createHash, randomUUID } from 'node:crypto';
import { lstat, mkdir, open, readdir, readFile, rename, rm } from 'node:fs/promises';
import { Document, isMap, isScalar, isSeq, parseDocument, visit } from 'yaml';
import { SprintStatusSchema } from '../../shared/schemas.js';
import { STORY_ID_RE } from '../../shared/ids.js';
import { acquireLock, LockedError } from './lock.js';

/**
 * Single write point of .bmad/sprint-status.yaml.
 * Lock -> re-read -> validate -> mutate a `yaml` Document (comments, key order and
 * flow/block style survive) -> re-validate the serialized text -> tmp + fsync + rename.
 * Reads elsewhere in the server stay on js-yaml: every string we write is double-quoted
 * unless it is a safe plain word, so js-yaml never reads back a Date or a boolean.
 */

export { LockedError };

export class ConflictError extends Error {
  constructor(reason = 'conflict', current = null) {
    super(`sprint-status.yaml conflict: ${reason}`);
    this.code = 'CONFLICT';
    this.reason = reason;
    this.current = current;
  }
}

/** kind: missing | not_regular | too_large | syntax | schema | result */
export class InvalidStatusFileError extends Error {
  constructor(kind, issues = []) {
    super(`sprint-status.yaml is invalid (${kind})`);
    this.code = 'SPRINT_STATUS_INVALID';
    this.kind = kind;
    this.issues = issues;
  }
}

const MAX_BYTES = 5 * 1024 * 1024;
const STRINGIFY = { indent: 2, lineWidth: 0 };
const NODE_OPTS = { aliasDuplicateObjects: false };
const KEY_RE = /^[A-Za-z_][A-Za-z0-9_-]*$/;
const FORBIDDEN_KEYS = new Set(['__proto__', 'constructor', 'prototype']);
const SAFE_PLAIN = /^[A-Za-z][A-Za-z0-9_-]*$/;
const RESERVED_PLAIN = /^(?:true|false|null|yes|no|on|off|y|n)$/i;
const STORY_HEAD = ['title', 'status', 'previous_status', 'sprint_id'];
// Shell writers chain several yq calls inside one lock section: wait ~2 s (50 x 40 ms), not lock.js's ~200 ms.
const LOCK_WAIT = { retries: 50, retryDelayMs: 40 };
const HISTORY_KEYS = ['timestamp', 'from', 'to', 'by', 'reason'];

const sha12 = (text) => createHash('sha1').update(text).digest('hex').slice(0, 12);

function sortedJson(value) {
  if (Array.isArray(value)) return `[${value.map(sortedJson).join(',')}]`;
  if (value && typeof value === 'object') {
    const keys = Object.keys(value).sort();
    return `{${keys.map((k) => `${JSON.stringify(k)}:${sortedJson(value[k])}`).join(',')}}`;
  }
  return JSON.stringify(value ?? null);
}

/** @returns {string} sha1 (12 hex) of the key-sorted JSON of `value` */
export function revOf(value) {
  return sha12(sortedJson(value));
}

// --- validation -------------------------------------------------------------

function assertKey(key) {
  if (typeof key !== 'string' || !KEY_RE.test(key) || FORBIDDEN_KEYS.has(key)) {
    throw new TypeError(`invalid key: ${JSON.stringify(key)}`);
  }
}

function assertStoryId(id) {
  if (typeof id !== 'string' || !STORY_ID_RE.test(id)) throw new TypeError(`invalid story id: ${JSON.stringify(id)}`);
}

function entriesOf(fields) {
  if (!fields || typeof fields !== 'object' || Array.isArray(fields)) throw new TypeError('fields must be an object');
  const entries = Object.entries(fields);
  entries.forEach(([k]) => assertKey(k));
  return entries;
}

function deepFreeze(value) {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.values(value).forEach(deepFreeze);
    Object.freeze(value);
  }
  return value;
}

/** Parses and validates; throws InvalidStatusFileError(syntaxKind | schemaKind). */
function parseChecked(text, syntaxKind, schemaKind) {
  const doc = parseDocument(text, { uniqueKeys: true });
  if (doc.errors.length)
    throw new InvalidStatusFileError(
      syntaxKind,
      doc.errors.map(({ code, message }) => ({ code, message }))
    );
  let data;
  try {
    data = doc.toJS({ maxAliasCount: 100 });
  } catch (err) {
    throw new InvalidStatusFileError(syntaxKind, [{ code: 'ALIAS', message: err.message }]);
  }
  const result = SprintStatusSchema.safeParse(data);
  if (!result.success) throw new InvalidStatusFileError(schemaKind, result.error.issues);
  return { doc, data };
}

// --- node building ----------------------------------------------------------

/** One-line double quotes unless a plain word is safe: grep-based readers and js-yaml stay correct. */
function styleStrings(node, keepPlain = false) {
  visit(node, {
    Scalar(key, scalar) {
      if (key === 'key' || typeof scalar.value !== 'string') return;
      const plain = keepPlain && SAFE_PLAIN.test(scalar.value) && !RESERVED_PLAIN.test(scalar.value);
      scalar.type = plain ? 'PLAIN' : 'QUOTE_DOUBLE';
    },
  });
  return node;
}

function toNode(doc, value) {
  const node = doc.createNode(value, NODE_OPTS);
  if (isMap(node) || isSeq(node)) visit(node, { Collection: (_, c) => void (c.flow = false) });
  return styleStrings(node);
}

function setField(doc, map, key, value) {
  const cur = map.get(key, true);
  if (isScalar(cur) && (value === null || typeof value !== 'object')) {
    cur.value = value;
    styleStrings(cur, cur.type === 'PLAIN');
    return;
  }
  map.set(key, toNode(doc, value));
}

/** Map at `key` of `parent`, created (block style) when absent. */
function childMap(doc, parent, key) {
  let node = parent.get(key, true);
  if (!isMap(node)) {
    node = toNode(doc, {});
    parent.set(key, node);
  }
  if (node.items.length === 0) node.flow = false;
  return node;
}

// --- shell compatibility ----------------------------------------------------

const keyOf = (pair) => (isScalar(pair.key) ? pair.key.value : pair.key);

function isOneSafeLine(pair) {
  const v = pair.value;
  return (
    isScalar(v) &&
    !String(keyOf(pair)).includes('status') &&
    !String(v.value).includes('status:') &&
    !String(v.type).startsWith('BLOCK') &&
    !pair.key?.commentBefore &&
    !v.commentBefore &&
    !v.comment
  );
}

/**
 * Shell fallback: `grep -A 5 "^  <id>:" | grep "status:" | head -1`. If anything before
 * `status` could match first (or push it past 5 lines), move `status` to the top of the story.
 */
function keepStatusGreppable(story) {
  const i = story.items.findIndex((pair) => keyOf(pair) === 'status');
  if (i <= 0 || (i <= 3 && story.items.slice(0, i).every(isOneSafeLine))) return;
  story.items.unshift(...story.items.splice(i, 1));
}

// --- transaction ------------------------------------------------------------

function storyNode(doc, id) {
  assertStoryId(id);
  const node = doc.getIn(['stories', id], true);
  if (!isMap(node)) throw new RangeError(`story ${id} not found`);
  node.flow = false;
  return node;
}

function orderedEntry(entry, head) {
  const ordered = {};
  for (const k of head) if (k in entry) ordered[k] = entry[k];
  return Object.assign(ordered, entry);
}

function addStory(doc, id, entry) {
  assertStoryId(id);
  entriesOf(entry);
  const stories = childMap(doc, doc.contents, 'stories');
  if (stories.has(id)) throw new RangeError(`story ${id} already exists`);
  const pair = doc.createPair(id, toNode(doc, orderedEntry(entry, STORY_HEAD)));
  if (stories.items.at(-1)?.key?.spaceBefore) pair.key.spaceBefore = true;
  keepStatusGreppable(pair.value);
  stories.items.push(pair);
}

function appendHistory(doc, id, entry, now) {
  const story = storyNode(doc, id);
  entriesOf(entry);
  const full = orderedEntry({ timestamp: now().toISOString(), by: 'kanban', reason: '', ...entry }, HISTORY_KEYS);
  let history = story.get('history', true);
  if (!isSeq(history)) {
    history = toNode(doc, []);
    story.set('history', history);
  }
  history.flow = false;
  history.items.push(toNode(doc, full));
  keepStatusGreppable(story);
}

/** Closed-sprint entry: story leaves stay one-liners (`{ status: done, points: 3 }`) like the hand-written ones. */
function setArchive(doc, id, entry) {
  assertKey(id);
  entriesOf(entry);
  const archived = childMap(doc, doc.contents, 'archived_sprints');
  const node = toNode(doc, entry);
  const stories = node.get('stories', true);
  if (isMap(stories)) stories.items.forEach((pair) => isMap(pair.value) && (pair.value.flow = true));
  archived.set(id, node);
}

function makeTx(doc, data, now, version) {
  return {
    data: deepFreeze(data),
    version,
    setStory(id, fields) {
      const node = storyNode(doc, id);
      for (const [k, v] of entriesOf(fields)) setField(doc, node, k, v);
      keepStatusGreppable(node);
    },
    addStory: (id, entry) => addStory(doc, id, entry),
    removeStory(id) {
      assertStoryId(id);
      return doc.deleteIn(['stories', id]);
    },
    appendHistory: (id, entry) => appendHistory(doc, id, entry, now),
    setMetadata(fields) {
      const meta = childMap(doc, doc.contents, 'metadata');
      for (const [k, v] of entriesOf(fields)) setField(doc, meta, k, v);
    },
    setArchive: (id, entry) => setArchive(doc, id, entry),
    setRoot(key, value) {
      assertKey(key);
      setField(doc, doc.contents, key, value);
    },
  };
}

// --- file I/O ---------------------------------------------------------------

async function lstatOrNull(file) {
  try {
    return await lstat(file);
  } catch (err) {
    if (err.code === 'ENOENT') return null;
    throw err;
  }
}

async function readSource(yamlPath, create) {
  const st = await lstatOrNull(yamlPath);
  if (!st) {
    if (!create) throw new InvalidStatusFileError('missing');
    const doc = new Document({ version: '1.0', metadata: {}, stories: {} });
    return { doc, data: doc.toJS(), src: null, mode: 0o644 };
  }
  if (!st.isFile()) throw new InvalidStatusFileError('not_regular');
  if (st.size > MAX_BYTES) throw new InvalidStatusFileError('too_large');
  const src = await readFile(yamlPath, 'utf8');
  return { ...parseChecked(src, 'syntax', 'schema'), src, mode: st.mode & 0o777 };
}

function pidAlive(pid) {
  try {
    process.kill(pid, 0);
    return true;
  } catch (err) {
    return err.code !== 'ESRCH';
  }
}

/** Under the lock no cooperating writer is mid-write: tmp files of dead (or our own) pids are orphans. */
async function sweepOrphans(yamlPath) {
  const prefix = `${path.basename(yamlPath)}.tmp-`;
  for (const name of await readdir(path.dirname(yamlPath))) {
    const pid = name.startsWith(prefix) ? Number.parseInt(name.slice(prefix.length), 10) : NaN;
    if (Number.isInteger(pid) && (pid === process.pid || !pidAlive(pid))) {
      await rm(path.join(path.dirname(yamlPath), name), { force: true });
    }
  }
}

/** Catches a writer that ignored the lock (e.g. `yq -i`) between our read and our rename. */
async function assertUnchanged(yamlPath, src) {
  const now = (await lstatOrNull(yamlPath)) ? await readFile(yamlPath, 'utf8') : null;
  if (now !== src) throw new ConflictError('file_changed');
}

async function writeAtomic(yamlPath, text, src, mode) {
  const tmp = `${yamlPath}.tmp-${process.pid}-${randomUUID()}`;
  try {
    const fd = await open(tmp, 'wx', mode);
    try {
      await fd.writeFile(text, 'utf8');
      await fd.sync();
    } finally {
      await fd.close();
    }
    await assertUnchanged(yamlPath, src);
    await rename(tmp, yamlPath);
  } catch (err) {
    await rm(tmp, { force: true });
    throw err;
  }
}

/** No `.bmad/` folder means no status file: the lock cannot even be created there. */
async function lockStatusFile(lockPath, ttlMs) {
  try {
    return await acquireLock(lockPath, { ttlMs, ...LOCK_WAIT });
  } catch (err) {
    if (err.code === 'ENOENT') throw new InvalidStatusFileError('missing');
    throw err;
  }
}

async function runLocked(yamlPath, mutate, { now, lockTtlMs, create }) {
  if (create) await mkdir(path.dirname(yamlPath), { recursive: true });
  const lockPath = `${yamlPath}.lock`;
  const release = await lockStatusFile(lockPath, lockTtlMs);
  const started = Date.now();
  try {
    await sweepOrphans(yamlPath);
    const { doc, data, src, mode } = await readSource(yamlPath, create);
    await mutate(makeTx(doc, data, now, src === null ? null : sha12(src)));
    const text = doc.toString(STRINGIFY);
    const written = parseChecked(text, 'result', 'result').data;
    // Past the TTL another process may have reclaimed the lock as stale: do not write.
    if (Date.now() - started > lockTtlMs) throw new LockedError(lockPath);
    await writeAtomic(yamlPath, text, src, mode);
    return { data: written, version: sha12(text) };
  } finally {
    await release();
  }
}

// In-process queue per file: the file lock alone only retries ~200 ms, so concurrent
// requests of this server would otherwise fail with LockedError instead of waiting.
const queues = new Map();

function enqueue(key, task) {
  const run = (queues.get(key) ?? Promise.resolve()).then(task);
  const tail = run.catch(() => {});
  queues.set(key, tail);
  tail.then(() => queues.get(key) === tail && queues.delete(key));
  return run;
}

/**
 * @param {string} projectRoot - parent of `.bmad/`
 * @param {(tx: object) => (void|Promise<void>)} mutate - tx.data is a frozen snapshot read under the lock
 * @param {{ now?: () => Date, lockTtlMs?: number, create?: boolean }} [opts]
 * @returns {Promise<{ data: object, version: string }>} version = sha1 (12 hex) of the written text
 * @throws {LockedError|ConflictError|InvalidStatusFileError}
 */
export async function mutateSprintStatus(
  projectRoot,
  mutate,
  { now = () => new Date(), lockTtlMs = 10_000, create = false } = {}
) {
  const yamlPath = path.join(projectRoot, '.bmad', 'sprint-status.yaml');
  return enqueue(yamlPath, () => runLocked(yamlPath, mutate, { now, lockTtlMs, create }));
}
