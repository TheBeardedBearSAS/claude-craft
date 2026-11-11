import path from 'node:path';
import { readFile } from 'node:fs/promises';
import { scan, groupByCategory } from './file-scanner.js';
import { parseAndValidate } from './frontmatter.js';
import { storyIdFromFilename } from '../../shared/ids.js';
import { deriveStoryData, deriveEpicData } from './markdown-metadata.js';
import { loadSprintStatus } from './sprint-cache.js';
import {
  StoryFrontmatterSchema,
  EpicFrontmatterSchema,
  TaskFrontmatterSchema,
  SprintStatusSchema,
} from '../../shared/schemas.js';
import { mapBmadPriority } from '../../shared/priority.js';
import { parseDependencyRefs } from '../../shared/deps.js';

/**
 * In-memory cache of parsed project-management/ entities.
 * Rebuilt via refresh() ; individual files can be reloaded via reloadFile(path).
 */
export class Repository {
  #refreshChain = Promise.resolve();

  constructor(rootDir) {
    this.rootDir = path.resolve(rootDir);
    this.stories = new Map(); // id -> { data, body, path, mtime, valid, errors? }
    this.epics = new Map();
    this.tasks = new Map();
    this.docs = new Map(); // category -> [{ path, rel }]
    this.sprints = new Map(); // sprintId -> { goal?, tasks: string[], files: [] }
    this.filesByPath = new Map();
    this.fileErrors = [];
    this.sprintStatusDiag = { state: 'missing', issues: [] };
  }

  /**
   * Serialized: the watcher fires one refresh per changed file, and overlapping
   * rebuilds interleave their clear/fill steps (every doc listed twice).
   */
  refresh() {
    const run = this.#refreshChain.then(() => this.#rebuild());
    this.#refreshChain = run.catch(() => {});
    return run;
  }

  /**
   * Builds the whole new state aside, then swaps it in one go: readers never
   * see a half-filled board, and a failure leaves the previous state intact.
   */
  async #rebuild() {
    const { files } = await scan(this.rootDir);
    const next = {
      stories: new Map(),
      epics: new Map(),
      tasks: new Map(),
      docs: new Map(),
      sprints: new Map(),
      filesByPath: new Map(),
      fileErrors: [],
    };
    const groups = groupByCategory(files);

    await this.#loadEntities(next, groups);
    this.#indexDocs(next, groups);
    aggregateSprints(next.sprints, files);

    // BMAD v6 single-writer track stores stories only in .bmad/sprint-status.yaml
    // (no individual markdown files). Surface them so the board isn't empty, then
    // closed sprints (archived_sprints.*) as read-only history.
    const { ss, diag } = await readSprintStatus(path.dirname(this.rootDir));
    ingestSprintStatusStories(next.stories, ss);
    ingestArchivedSprints(next.stories, ss);

    Object.assign(this, {
      stories: next.stories,
      epics: next.epics,
      tasks: next.tasks,
      docs: next.docs,
      sprints: next.sprints,
      filesByPath: next.filesByPath,
      fileErrors: next.fileErrors,
      sprintStatusDiag: diag,
    });
  }

  async #loadEntities(next, groups) {
    for (const f of groups.story ?? []) {
      const res = await parseSafe(f.path, StoryFrontmatterSchema, deriveStoryData);
      this.#recordErrors(next, f, res);
      const entry = { path: f.path, mtime: f.mtime, ...res, ...sourceOf(res) };
      const id = res.ok ? res.data.id : storyIdFromFilename(path.basename(f.path));
      if (id) next.stories.set(id, entry);
      next.filesByPath.set(f.path, { kind: 'story', id: res.ok ? id : null });
    }

    for (const f of groups.epic ?? []) {
      const res = await parseSafe(f.path, EpicFrontmatterSchema, deriveEpicData);
      this.#recordErrors(next, f, res);
      const entry = { path: f.path, mtime: f.mtime, ...res, ...sourceOf(res) };
      if (res.ok) next.epics.set(res.data.id, entry);
      next.filesByPath.set(f.path, { kind: 'epic', id: res.ok ? res.data.id : null });
    }

    for (const f of groups.task ?? []) {
      const res = await parseSafe(f.path, TaskFrontmatterSchema);
      this.#recordErrors(next, f, res);
      const entry = { path: f.path, mtime: f.mtime, sprintId: f.sprintId, ...res };
      if (res.ok) next.tasks.set(res.data.id, entry);
      next.filesByPath.set(f.path, { kind: 'task', id: res.ok ? res.data.id : null });
    }
  }

  #recordErrors(next, file, res) {
    if (res.ok) return;
    next.fileErrors.push({ rel: this.#rel(file.path), errors: res.errors.map(formatIssue) });
  }

  #rel(absPath) {
    return path.relative(this.rootDir, absPath).split(path.sep).join('/');
  }

  // Docs browsable in the DocsView. Every markdown body that carries prose is
  // exposed ; 'task' is excluded (frontmatter-only, already in the stories API).
  #indexDocs(next, groups) {
    for (const category of DOC_CATEGORIES) {
      for (const f of groups[category] ?? []) {
        const arr = next.docs.get(category) ?? [];
        arr.push({ path: f.path, rel: this.#rel(f.path), category });
        next.docs.set(category, arr);
      }
    }
  }

  /**
   * Parse problems found by the last refresh, for GET /api/diagnostics.
   * Paths are relative to project-management/ (never absolute).
   * @returns {{ sprint_status: { state: 'ok'|'missing'|'invalid', issues: string[] }, files: Array<{ rel: string, errors: string[] }> }}
   */
  diagnostics() {
    return JSON.parse(JSON.stringify({ sprint_status: this.sprintStatusDiag, files: this.fileErrors }));
  }

  listStories({ sprintId, status, epicId } = {}) {
    const out = [];
    for (const [, entry] of this.stories) {
      if (!entry.ok) continue;
      const d = entry.data;
      if (sprintId && d.sprint_id !== sprintId) continue;
      if (status && d.status !== status) continue;
      if (epicId && d.epic_id !== epicId) continue;
      out.push(view(entry));
    }
    return out.sort((a, b) => a.id.localeCompare(b.id));
  }

  listEpics() {
    return [...this.epics.values()].filter((e) => e.ok).map((e) => ({ ...e.data, _mtime: e.mtime }));
  }

  getStory(id) {
    const entry = this.stories.get(id);
    if (!entry || !entry.ok) return null;
    return view(entry);
  }

  getStoryFile(id) {
    const entry = this.stories.get(id);
    return entry ? entry.path : null;
  }

  /** Markdown body (prose after frontmatter) of a story, '' for YAML-only stories. */
  getStoryBody(id) {
    const entry = this.stories.get(id);
    return entry?.body ?? '';
  }

  listTasksForStory(usId) {
    return [...this.tasks.values()].filter((t) => t.ok && t.data.us_id === usId).map((t) => t.data);
  }

  listDocs() {
    const out = [];
    for (const [, arr] of this.docs) {
      for (const d of arr) out.push(d);
    }
    return out.sort((a, b) => a.rel.localeCompare(b.rel));
  }

  async readDoc(rel) {
    // Caller is responsible for resolving safely
    const known = this.listDocs().find((d) => d.rel === rel);
    if (!known) return null;
    return await readFile(known.path, 'utf8');
  }

  /**
   * Summaries of every scanned sprint, sorted by id descending (most recent first).
   * @returns {Array<{id:string, has_goal:boolean, has_review:boolean, has_retro:boolean, file_count:number}>}
   */
  listSprints() {
    return [...this.sprints.values()]
      .map((s) => ({
        id: s.id,
        has_goal: !!s.goalPath,
        has_review: s.files.some((f) => f.category === 'sprint-review'),
        has_retro: s.files.some((f) => f.category === 'sprint-retro'),
        file_count: s.files.length,
      }))
      .sort((a, b) => b.id.localeCompare(a.id));
  }

  /**
   * Raw sprint aggregation entry (files + tasks + goalPath) for the detail route.
   * @param {string} id
   * @returns {{ id:string, files:object[], tasks:string[], goalPath?:string } | undefined}
   */
  getSprint(id) {
    return this.sprints.get(id);
  }

  buildDependenciesGraph() {
    const nodes = [];
    const edges = [];
    for (const s of this.listStories()) {
      nodes.push({ id: s.id, title: s.title, status: s.status, epic_id: s.epic_id ?? null });
      for (const dep of s.dependencies ?? []) {
        edges.push({ from: dep, to: s.id });
      }
    }
    return { nodes, edges, cycles: detectCycles(nodes, edges) };
  }
}

const DOC_CATEGORIES = [
  'doc',
  'architecture',
  'epic',
  'story',
  'sprint-goal',
  'board',
  'sprint-review',
  'sprint-retro',
  'sprint-deps',
  'sprint-other',
];

// A malformed file (YAML syntax error, unreadable) must degrade to "invalid
// entry", never abort the whole refresh.
async function parseSafe(filepath, schema, derive) {
  try {
    return await parseAndValidate(filepath, schema, derive);
  } catch (err) {
    return { ok: false, errors: [{ path: [], message: err.message }], body: '', raw: null, derived: false };
  }
}

function formatIssue(issue) {
  const where = (issue.path ?? []).join('.');
  return where ? `${where}: ${issue.message}` : issue.message;
}

function aggregateSprints(sprints, files) {
  for (const f of files) {
    if (!f.sprintId) continue;
    const s = sprints.get(f.sprintId) ?? { id: f.sprintId, files: [], tasks: [] };
    s.files.push(f);
    if (f.category === 'task') s.tasks.push(f.path);
    if (f.category === 'sprint-goal') s.goalPath = f.path;
    sprints.set(f.sprintId, s);
  }
}

async function readSprintStatus(projectRoot) {
  try {
    const ss = await loadSprintStatus(projectRoot);
    if (ss === null) return { ss, diag: { state: 'missing', issues: [] } };
    if (!ss._invalid) return { ss, diag: { state: 'ok', issues: [] } };
    const parsed = SprintStatusSchema.safeParse(ss);
    const issues = parsed.success ? ['invalid sprint-status.yaml'] : parsed.error.issues.map(formatIssue);
    return { ss, diag: { state: 'invalid', issues } };
  } catch (err) {
    return { ss: null, diag: { state: 'invalid', issues: [err.message] } };
  }
}

/**
 * .bmad/sprint-status.yaml is the single source of truth for story STATUS;
 * markdown files hold the CONTENT. For an id present in both, the markdown
 * entry keeps its content and takes its status fields from the YAML. Ids
 * only present in the YAML (or whose markdown file is invalid) become synthetic
 * stories built from the YAML. Either way the status is written back to the YAML.
 */
function ingestSprintStatusStories(stories, ss) {
  if (!ss || ss._invalid || !ss.stories) return;

  for (const [id, s] of Object.entries(ss.stories)) {
    const existing = stories.get(id);
    if (existing?.ok) {
      existing.data = {
        ...existing.data,
        status: s.status,
        previous_status: s.previous_status ?? '',
        tdd_phase: s.tdd_phase ?? existing.data.tdd_phase ?? '',
        blocked_reason: s.blocked_reason ?? '',
      };
      existing.statusSource = 'sprint-status';
      continue;
    }
    const synthetic = yamlStory(id, s, ss.metadata);
    if (existing) synthetic.body = existing.body;
    stories.set(id, synthetic);
  }
}

function yamlStory(id, s, metadata) {
  return {
    path: null, // no backing file: content is the YAML entry only
    mtime: 0,
    ok: true,
    source: 'sprint-status',
    statusSource: 'sprint-status',
    data: {
      id,
      title: s.title ?? id,
      status: s.status,
      previous_status: s.previous_status ?? '',
      assigned_to: s.assigned_to ?? '',
      tdd_phase: s.tdd_phase ?? '',
      story_points: s.story_points ?? 0,
      epic_id: s.epic_id || metadata?.epic || null,
      // Map BMAD P0..P3 onto MoSCoW so PriorityChip/filter aren't all "Should".
      priority: mapBmadPriority(s.priority),
      priority_raw: s.priority ?? null,
      sprint_id: metadata?.sprint_id ?? null,
      blocked_reason: s.blocked_reason ?? '',
      tasks: s.tasks ?? { total: 0, completed: 0, list: [] },
      // Freeform yaml deps -> resolved id references for the graph.
      dependencies: parseDependencyRefs(s.dependencies),
    },
  };
}

/**
 * Overlay stories from closed sprints (archived_sprints.<sprintKey>.stories).
 * These are read-only history: status as recorded (done/deferred/…), points
 * from the compact `points` field, epic from the sprint entry. A story id
 * already present (current sprint or an earlier-listed archived sprint) wins,
 * keeping ids globally unique as the board model requires.
 */
function ingestArchivedSprints(stories, ss) {
  if (!ss || ss._invalid || !ss.archived_sprints) return;

  for (const [sprintKey, sprint] of Object.entries(ss.archived_sprints)) {
    for (const [id, s] of Object.entries(sprint?.stories ?? {})) {
      if (stories.has(id)) continue; // current / earlier sprint wins
      stories.set(id, archivedStory(id, s, sprintKey, sprint?.epic ?? null));
    }
  }
}

function archivedStory(id, s, sprintKey, epic) {
  return {
    path: null, // history -> read-only
    mtime: 0,
    ok: true,
    source: 'archived',
    data: {
      id,
      title: s.note ? `${id} — ${s.note}` : id,
      status: s.status ?? 'done',
      previous_status: '',
      assigned_to: '',
      tdd_phase: '',
      story_points: s.points ?? 0,
      epic_id: epic,
      priority: 'should',
      sprint_id: sprintKey,
      blocked_reason: '',
      tasks: { total: 0, completed: 0, list: [] },
      dependencies: [],
    },
  };
}

// Metadata-list files (no frontmatter) are read-only: updateFrontmatter would
// write a frontmatter holding only the patch, which no longer validates.
function sourceOf(res) {
  return res.derived ? { source: 'markdown-metadata' } : {};
}

function isWritable(entry) {
  if (entry.statusSource === 'sprint-status') return true;
  return entry.path !== null && entry.source !== 'markdown-metadata';
}

function view(entry) {
  const source = entry.source ?? 'markdown';
  return {
    ...entry.data,
    _mtime: entry.mtime,
    _source: source,
    _statusSource: entry.statusSource ?? source,
    _writable: isWritable(entry),
  };
}

export function detectCycles(nodes, edges) {
  const adj = new Map();
  for (const n of nodes) adj.set(n.id, []);
  for (const e of edges) {
    if (!adj.has(e.from)) adj.set(e.from, []);
    adj.get(e.from).push(e.to);
  }
  const cycles = [];
  const WHITE = 0,
    GRAY = 1,
    BLACK = 2;
  const color = new Map();
  const stack = [];

  function dfs(u) {
    color.set(u, GRAY);
    stack.push(u);
    for (const v of adj.get(u) ?? []) {
      const c = color.get(v) ?? WHITE;
      if (c === WHITE) {
        dfs(v);
      } else if (c === GRAY) {
        const idx = stack.indexOf(v);
        cycles.push(stack.slice(idx).concat(v));
      }
    }
    stack.pop();
    color.set(u, BLACK);
  }
  for (const n of nodes) {
    if ((color.get(n.id) ?? WHITE) === WHITE) dfs(n.id);
  }
  return cycles;
}
