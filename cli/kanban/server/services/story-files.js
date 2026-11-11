import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { mkdir, open, readFile, rename, rm, stat } from 'node:fs/promises';
import { parseString } from './frontmatter.js';
import { stripComments } from './markdown-metadata.js';
import { acquireLock } from './lock.js';
import { MtimeMismatchError } from './file-writer.js';

/**
 * Story markdown files: pure text helpers (render, patch the `## Metadata` list) and the few
 * file operations the story routes need. Status is NEVER written to markdown: it lives in
 * .bmad/sprint-status.yaml (tests/content/ssy-source-of-truth.test.mjs).
 */

const MAX_SLUG = 50;
const EMPTY = '—';
const MOSCOW = { must: 'Must', should: 'Should', could: 'Could', wont: 'Wont' };

const normalize = (s) =>
  s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();

/** @returns {string} ASCII slug, 1..50 chars, no leading/trailing dash, never empty */
export function slugify(title) {
  const slug = normalize(String(title ?? ''))
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+/, '')
    .slice(0, MAX_SLUG)
    .replace(/-+$/, '');
  return slug || 'story';
}

/** One line, no comment markers or control characters: user text cannot add or end structure. */
function oneLine(value) {
  return String(value ?? '')
    .replace(/<!--|-->/g, ' ')
    .replace(/[\p{Cc}\p{Zl}\p{Zp}]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

const orDash = (value) => oneLine(value) || EMPTY;

/**
 * Story file from the structure of Project/i18n/en/templates/user-story.md.
 * No frontmatter and no status line.
 */
export function renderStoryMarkdown({
  id,
  title,
  epic_id = null,
  story_points = 0,
  priority = 'should',
  persona = '',
  sprint_id = null,
  date,
}) {
  const who = oneLine(persona);
  const lines = [
    `# ${id}: ${oneLine(title) || id}`,
    '',
    '## Metadata',
    `- **ID**: ${id}`,
    `- **EPIC**: ${orDash(epic_id)}`,
    `- **Sprint**: ${orDash(sprint_id)}`,
    `- **Points**: ${Number(story_points) || 0}`,
    `- **MoSCoW**: ${MOSCOW[priority] ?? MOSCOW.should}`,
    ...(who ? [`- **Persona**: ${who}`] : []),
    `- **Created on**: ${oneLine(date)}`,
    `- **Updated**: ${oneLine(date)}`,
    '',
    '## Traceability',
    `- **Depends on**: ${EMPTY}`,
    '',
    '## User Story',
    '',
    `**As a** ${who || 'user'},`,
    '**I want** …,',
    '**so that** ….',
    '',
    '## Acceptance Criteria',
    '',
    '### AC-1',
    '```gherkin',
    'GIVEN …',
    'WHEN …',
    'THEN …',
    '```',
    '',
    '## Notes',
    '',
  ];
  return lines.join('\n');
}

// --- `## Metadata` list ------------------------------------------------------

const SECTION_RE = /^##\s+(?:metadata|metadonnees|metadatos|metadaten|metadados)\s*$/;
const NEXT_HEADING_RE = /^#{1,2}\s/;
const ITEM_RE = /^(\s*[-*]\s+\*\*)([^*]+?)(\*\*\s*:\s*)(.*?)(\s*)$/;
const STATUS_LABELS = new Set(['status', 'statut', 'estado']);

const LABEL_KEYS = new Map([
  ['epic', 'epic'],
  ['sprint', 'sprint'],
  ...['points', 'puntos', 'punkte', 'pontos'].map((l) => [l, 'points']),
  ...['updated', 'mis a jour', 'actualizado', 'aktualisiert', 'atualizado'].map((l) => [l, 'updated']),
]);

const ADDED = { epic: 'EPIC', sprint: 'Sprint', points: 'Points', updated: 'Updated' };

const valueOf = (v) => (v === null ? EMPTY : oneLine(v) || EMPTY);

function sectionRange(lines) {
  const start = lines.findIndex((l) => SECTION_RE.test(normalize(l)));
  if (start < 0) return null;
  const rest = lines.slice(start + 1).findIndex((l) => NEXT_HEADING_RE.test(l));
  return { start, end: rest < 0 ? lines.length : start + 1 + rest };
}

/**
 * Updates (or appends) the `Points`, `EPIC`, `Sprint` and `Updated` lines of the `## Metadata`
 * section and touches nothing else. `null` epic/sprint is written as an em dash. A text without
 * the section is returned unchanged. Never writes a Status line.
 * @param {string} text
 * @param {{ points?: number, epic?: string|null, sprint?: string|null, updated?: string }} fields
 */
export function patchMetadataList(text, fields) {
  const lines = text.split('\n');
  const range = sectionRange(lines);
  if (!range) return text;
  const pending = new Map(Object.keys(ADDED).flatMap((k) => (fields[k] === undefined ? [] : [[k, fields[k]]])));
  let last = range.start;
  for (let i = range.start + 1; i < range.end; i++) {
    const m = ITEM_RE.exec(lines[i]);
    if (!m) continue;
    last = i;
    const key = LABEL_KEYS.get(normalize(m[2]));
    if (!key || !pending.has(key)) continue;
    lines[i] = `${m[1]}${m[2]}${m[3]}${valueOf(pending.get(key))}${m[5]}`;
    pending.delete(key);
  }
  const cr = text.includes('\r\n') ? '\r' : '';
  const added = Object.keys(ADDED)
    .filter((k) => pending.has(k))
    .map((k) => `- **${ADDED[k]}**: ${valueOf(pending.get(k))}${cr}`);
  lines.splice(last + 1, 0, ...added);
  return lines.join('\n');
}

/**
 * True when a list line carries a real status (`- **Status**: 🔴 To Do`). The pointer written by the
 * templates (`- **Status**: tracked in .bmad/sprint-status.yaml`) is not a status.
 */
export function hasStatusLine(markdown) {
  // Same view as the reader (markdown-metadata.js), which drops HTML comments first: `**Sta<!-- -->tus**`.
  return stripComments(String(markdown ?? ''))
    .split('\n')
    .some((line) => {
      const m = ITEM_RE.exec(line);
      return !!m && STATUS_LABELS.has(normalize(m[2])) && !/sprint-status/i.test(m[4]);
    });
}

// --- file operations ---------------------------------------------------------

async function writeAtomic(file, text) {
  const tmp = `${file}.tmp-${process.pid}-${randomUUID()}`;
  let mode = 0o644;
  try {
    mode = (await stat(file)).mode & 0o777;
  } catch (err) {
    if (err.code !== 'ENOENT') throw err;
  }
  try {
    const fd = await open(tmp, 'wx', mode);
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

/** Lock + tmp + rename. */
export async function writeTextAtomic(file, text) {
  const release = await acquireLock(`${file}.lock`);
  try {
    await writeAtomic(file, text);
  } finally {
    await release();
  }
}

/** The new body would not be read back as the body: it opens a frontmatter (status included) in a file without one. */
export class BodyChangesFrontmatterError extends Error {
  constructor() {
    super('the markdown body would be read back as a frontmatter');
    this.code = 'BODY_CHANGES_FRONTMATTER';
  }
}

/**
 * Replaces the markdown BODY (what follows the frontmatter; the whole file when there is none),
 * keeping the frontmatter byte for byte.
 * @throws {MtimeMismatchError} when the file changed since `expectedMtime`
 * @throws {BodyChangesFrontmatterError} when `markdown` would turn into (part of) a frontmatter
 * @returns {Promise<{ mtime: number }>}
 */
export async function replaceBody(file, markdown, expectedMtime) {
  const release = await acquireLock(`${file}.lock`);
  try {
    const actual = (await stat(file)).mtimeMs;
    if (actual !== expectedMtime) throw new MtimeMismatchError(file, expectedMtime, actual);
    const raw = await readFile(file, 'utf8');
    const { body } = parseString(raw);
    const next = raw.slice(0, raw.length - body.length) + markdown;
    if (parseString(next).body !== markdown) throw new BodyChangesFrontmatterError();
    await writeAtomic(file, next);
    return { mtime: (await stat(file)).mtimeMs };
  } finally {
    await release();
  }
}

/** Creates `file` (and its folder) only if absent. @throws {Error} code EEXIST when it already exists */
export async function createExclusive(file, text) {
  await mkdir(path.dirname(file), { recursive: true });
  const fd = await open(file, 'wx');
  try {
    await fd.writeFile(text, 'utf8');
  } catch (err) {
    await rm(file, { force: true });
    throw err;
  } finally {
    await fd.close();
  }
}

async function exists(file) {
  try {
    await stat(file);
    return true;
  } catch (err) {
    if (err.code === 'ENOENT') return false;
    throw err;
  }
}

/** Moves `file` to `<dir>/.trash/` (hidden: the scanner ignores it); an earlier trashed copy is kept. */
export async function trashFile(file) {
  const trash = path.join(path.dirname(file), '.trash');
  await mkdir(trash, { recursive: true });
  const { name, ext } = path.parse(file);
  let target = path.join(trash, `${name}${ext}`);
  if (await exists(target)) target = path.join(trash, `${name}-${randomUUID().slice(0, 8)}${ext}`);
  await rename(file, target);
  return target;
}
