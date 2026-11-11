/**
 * Sprint lifecycle rules, on plain data (no I/O): the routes read the files, call these
 * functions, then apply the returned operations inside a `mutateSprintStatus` transaction.
 *
 * Operations: { op: 'setRoot', key, value } | { op: 'setMetadata', fields } |
 *             { op: 'setStory', id, fields } | { op: 'removeStory', id } | { op: 'setArchive', id, entry }
 */

export class SprintOpError extends Error {
  constructor(code, extra = {}) {
    super(`sprint operation refused: ${code}`);
    this.code = code;
    this.extra = extra;
  }
}

const AVERAGE_WINDOW = 3;
const SLUG_MAX = 40;
const DATE_RE = '(\\d{4}-\\d{2}-\\d{2})';

const usable = (ss) => (ss && !ss._invalid ? ss : null);
const activeId = (ss) => (ss?.metadata?.sprint_id && !ss.metadata.closed_date ? ss.metadata.sprint_id : null);
const sum = (list, pick) => list.reduce((n, item) => n + (pick(item) ?? 0), 0);

/** @returns {'active'|'closed'|'planned'|null} null when the sprint is unknown everywhere */
export function sprintState(id, ss, sprintDirIds) {
  const status = usable(ss);
  if (activeId(status) === id) return 'active';
  const closedHere = status?.metadata?.sprint_id === id && status.metadata.closed_date;
  if (closedHere || status?.archived_sprints?.[id]) return 'closed';
  return sprintDirIds.includes(id) ? 'planned' : null;
}

/** @returns {object[]} operations making `sprint` the active sprint */
export function startSprint(ss, sprint) {
  const status = usable(ss);
  if (status?.archived_sprints?.[sprint.id]) throw new SprintOpError('sprint_closed');
  const active = activeId(status);
  if (active) {
    throw new SprintOpError('sprint_already_active', { active: { id: active, name: status.metadata.name ?? active } });
  }
  const value = {
    sprint_id: sprint.id,
    name: sprint.name,
    start_date: sprint.start_date,
    end_date: sprint.end_date,
    goal: sprint.goal ?? '',
  };
  if (sprint.capacity_points !== undefined) value.capacity_points = sprint.capacity_points;
  return [{ op: 'setRoot', key: 'metadata', value }];
}

/** A story belongs to the sprint through its own `sprint_id`, or implicitly to the active one when it has none. */
const ownedBy = (story, id) => (Object.hasOwn(story, 'sprint_id') ? story.sprint_id === id : true);

function assertCarryTarget(ss, carryOver, knownSprintIds) {
  if (carryOver !== 'backlog' && sprintState(carryOver, ss, knownSprintIds ?? []) !== 'planned') {
    throw new SprintOpError('sprint_not_found');
  }
}

/**
 * @param {{ carryOver?: 'backlog'|string, today: string, knownSprintIds?: string[] }} opts
 * @returns {{ ops: object[], summary: object }}
 */
export function closeSprint(ss, id, { carryOver = 'backlog', today, knownSprintIds = null } = {}) {
  if (activeId(usable(ss)) !== id) throw new SprintOpError('not_active');
  assertCarryTarget(ss, carryOver, knownSprintIds);
  const members = Object.entries(ss.stories ?? {}).filter(([, story]) => ownedBy(story, id));
  const done = members.filter(([, story]) => story.status === 'done');
  const open = members.filter(([, story]) => story.status !== 'done');
  const target = carryOver === 'backlog' ? null : carryOver;
  const entry = archiveEntry(ss.metadata, today, members, done);
  const ops = [
    ...done.map(([storyId]) => ({ op: 'removeStory', id: storyId })),
    ...open.map(([storyId]) => ({ op: 'setStory', id: storyId, fields: { sprint_id: target } })),
    { op: 'setArchive', id, entry },
    { op: 'setMetadata', fields: { closed_date: today } },
  ];
  const summary = {
    name: entry.name,
    closed_date: today,
    points_committed: entry.points_committed,
    points_delivered: entry.points_delivered,
    archived: done.map(([storyId]) => storyId),
    carried: open.map(([storyId]) => storyId),
    carry_to: carryOver,
  };
  return { ops, summary };
}

function archiveEntry(metadata, today, members, done) {
  const entry = { name: metadata.name };
  if (metadata.epic) entry.epic = metadata.epic;
  return Object.assign(entry, {
    closed_date: today,
    points_committed: sum(members, ([, s]) => s.story_points),
    points_delivered: sum(done, ([, s]) => s.story_points),
    stories: Object.fromEntries(done.map(([storyId, s]) => [storyId, { status: 'done', points: s.story_points ?? 0 }])),
  });
}

/** Replays operations on a `mutateSprintStatus` transaction. */
export function applyOps(tx, ops) {
  for (const o of ops) {
    if (o.op === 'setRoot') tx.setRoot(o.key, o.value);
    else if (o.op === 'setMetadata') tx.setMetadata(o.fields);
    else if (o.op === 'setStory') tx.setStory(o.id, o.fields);
    else if (o.op === 'removeStory') tx.removeStory(o.id);
    else if (o.op === 'setArchive') tx.setArchive(o.id, o.entry);
    else throw new TypeError(`unknown operation: ${o.op}`);
  }
}

// --- velocity ---------------------------------------------------------------

function storyPoints(archive, pred) {
  const stories = Object.values(archive.stories ?? {});
  return stories.length ? sum(stories.filter(pred), (s) => s.points) : null;
}

function velocityRow(id, archive) {
  return {
    id,
    name: archive.name ?? id,
    closed_date: archive.closed_date ?? '',
    committed: archive.points_committed ?? storyPoints(archive, () => true),
    delivered: archive.points_delivered ?? storyPoints(archive, (s) => s.status === 'done'),
  };
}

const byClosure = (a, b) =>
  a.closed_date.localeCompare(b.closed_date) || a.id.localeCompare(b.id, 'en', { numeric: true });

/** @returns {{ sprints: Array<{id,name,closed_date,committed,delivered}>, average: number|null }} oldest first */
export function velocity(ss) {
  const rows = Object.entries(usable(ss)?.archived_sprints ?? {})
    .map(([id, archive]) => velocityRow(id, archive ?? {}))
    .sort(byClosure);
  const recent = rows.filter((r) => r.delivered !== null).slice(-AVERAGE_WINDOW);
  const average = recent.length ? Math.round((sum(recent, (r) => r.delivered) / recent.length) * 10) / 10 : null;
  return { sprints: rows, average };
}

// --- sprint directory -------------------------------------------------------

/** Highest `sprint-<N>` among the ids, plus one. */
export function nextSprintNumber(ids) {
  const numbers = ids.map((id) => /^sprint-(\d+)/.exec(id)?.[1]).filter(Boolean);
  return Math.max(0, ...numbers.map(Number)) + 1;
}

/** ASCII, lowercase, dashes; never empty and never longer than 40 characters. */
export function sprintSlug(name) {
  const slug = name
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .slice(0, SLUG_MAX)
    .replace(/^-+|-+$/g, '');
  return slug || 'sprint';
}

const oneLine = (text) => text.replace(/\s+/g, ' ').trim();

/** `sprint-goal.md` in the layout of /workflow:start (`## Informations` table, `## Sprint Goal` quote). */
export function renderSprintGoal({ number, name, start_date, end_date, goal, capacity_points }) {
  const rows = [`| Numéro | ${number} |`, `| Début | ${start_date} |`, `| Fin | ${end_date} |`];
  if (capacity_points !== undefined) rows.push(`| Capacité | ${capacity_points} points |`);
  const lines = [`# Sprint ${number} : ${oneLine(name)}`, '', '## Informations', ''];
  lines.push('| Attribut | Valeur |', '|----------|--------|', ...rows, '');
  if (goal) lines.push('## Sprint Goal', '', `> ${oneLine(goal)}`, '');
  return lines.join('\n');
}

const field = (text, labels, valueRe) => new RegExp(`^\\|\\s*(?:${labels})\\s*\\|\\s*${valueRe}`, 'mi').exec(text)?.[1];

function goalOf(text) {
  const section = /^##\s+Sprint Goal\s*\n([\s\S]*?)(?=^##\s|(?![\s\S]))/m.exec(text)?.[1] ?? '';
  const quoted = section.replace(/^\s*>\s?/gm, '').replace(/^\s*["“”]|["“”]\s*$/g, '');
  return oneLine(quoted);
}

/**
 * Name, dates, goal and capacity of a sprint from its `sprint-goal.md`. Tolerant: a free-form file
 * yields the id as name and empty strings.
 */
export function parseSprintGoal(text, id) {
  const src = typeof text === 'string' ? text : '';
  const title = /^#\s+(.+)$/m.exec(src)?.[1] ?? '';
  const parsed = {
    name: title.replace(/^Sprint\s*\d+\s*[:—–-]?\s*/i, '').trim() || id,
    start_date: field(src, 'Début|Debut|Start', DATE_RE) ?? '',
    end_date: field(src, 'Fin|End', DATE_RE) ?? '',
    goal: goalOf(src),
  };
  const capacity = field(src, 'Capacité|Capacite|Capacity', '(\\d+)');
  if (capacity !== undefined) parsed.capacity_points = Number(capacity);
  return parsed;
}
