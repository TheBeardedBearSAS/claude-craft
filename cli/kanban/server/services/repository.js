import path from 'node:path';
import { readFile } from 'node:fs/promises';
import { scan, groupByCategory } from './file-scanner.js';
import { parseAndValidate } from './frontmatter.js';
import { loadSprintStatus } from './sprint-cache.js';
import { StoryFrontmatterSchema, EpicFrontmatterSchema, TaskFrontmatterSchema } from '../../shared/schemas.js';

/**
 * In-memory cache of parsed project-management/ entities.
 * Rebuilt via refresh() ; individual files can be reloaded via reloadFile(path).
 */
export class Repository {
  constructor(rootDir) {
    this.rootDir = path.resolve(rootDir);
    this.stories = new Map(); // id -> { data, body, path, mtime, valid, errors? }
    this.epics = new Map();
    this.tasks = new Map();
    this.docs = new Map(); // category -> [{ path, rel }]
    this.sprints = new Map(); // sprintId -> { goal?, tasks: string[], files: [] }
    this.filesByPath = new Map();
  }

  async refresh() {
    const { files } = await scan(this.rootDir);
    this.stories.clear();
    this.epics.clear();
    this.tasks.clear();
    this.docs.clear();
    this.sprints.clear();
    this.filesByPath.clear();

    const groups = groupByCategory(files);

    for (const f of groups.story ?? []) {
      const res = await parseAndValidate(f.path, StoryFrontmatterSchema);
      const entry = { path: f.path, mtime: f.mtime, ...res };
      if (res.ok) {
        this.stories.set(res.data.id, entry);
      } else {
        const idMatch = path.basename(f.path).match(/US-\d+/);
        if (idMatch) this.stories.set(idMatch[0], entry);
      }
      this.filesByPath.set(f.path, { kind: 'story', id: entry.ok ? entry.data.id : null });
    }

    for (const f of groups.epic ?? []) {
      const res = await parseAndValidate(f.path, EpicFrontmatterSchema);
      const entry = { path: f.path, mtime: f.mtime, ...res };
      if (res.ok) this.epics.set(res.data.id, entry);
      this.filesByPath.set(f.path, { kind: 'epic', id: res.ok ? res.data.id : null });
    }

    for (const f of groups.task ?? []) {
      const res = await parseAndValidate(f.path, TaskFrontmatterSchema);
      const entry = { path: f.path, mtime: f.mtime, sprintId: f.sprintId, ...res };
      if (res.ok) this.tasks.set(res.data.id, entry);
      this.filesByPath.set(f.path, { kind: 'task', id: res.ok ? res.data.id : null });
    }

    // Docs (root + architecture)
    for (const category of ['doc', 'architecture']) {
      for (const f of groups[category] ?? []) {
        const rel = path.relative(this.rootDir, f.path).split(path.sep).join('/');
        const arr = this.docs.get(category) ?? [];
        arr.push({ path: f.path, rel });
        this.docs.set(category, arr);
      }
    }

    // Sprints aggregation
    for (const f of files) {
      if (!f.sprintId) continue;
      const s = this.sprints.get(f.sprintId) ?? { id: f.sprintId, files: [], tasks: [] };
      s.files.push(f);
      if (f.category === 'task') s.tasks.push(f.path);
      if (f.category === 'sprint-goal') s.goalPath = f.path;
      this.sprints.set(f.sprintId, s);
    }

    // BMAD v6 single-writer track stores stories only in .bmad/sprint-status.yaml
    // (no individual markdown files). Surface them so the board isn't empty.
    await this.#ingestSprintStatusStories();
  }

  /**
   * Overlay stories declared in <projectRoot>/.bmad/sprint-status.yaml that have
   * no backing markdown file. Markdown-backed stories (already in this.stories)
   * always win — the YAML entry is ignored for a colliding id so there is no
   * double source of truth. Synthetic stories are read-only (path === null).
   */
  async #ingestSprintStatusStories() {
    const projectRoot = path.dirname(this.rootDir);
    let ss;
    try {
      ss = await loadSprintStatus(projectRoot);
    } catch {
      // A broken sprint-status.yaml must not break the whole board scan.
      return;
    }
    if (!ss || ss._invalid || !ss.stories) return;

    const sprintId = ss.metadata?.sprint_id ?? null;
    const epicFromMeta = ss.metadata?.epic ?? null;

    for (const [id, s] of Object.entries(ss.stories)) {
      if (this.stories.has(id)) continue; // markdown-backed story wins
      this.stories.set(id, {
        path: null, // no backing file -> read-only
        mtime: 0,
        ok: true,
        source: 'sprint-status',
        data: {
          id,
          title: s.title ?? id,
          status: s.status,
          previous_status: s.previous_status ?? '',
          assigned_to: s.assigned_to ?? '',
          tdd_phase: s.tdd_phase ?? '',
          story_points: s.story_points ?? 0,
          epic_id: s.epic_id || epicFromMeta || null,
          // BMAD priorities are P0..P3 (outside the must/should/could/wont enum),
          // so we don't map them; the board just needs a valid default.
          priority: 'should',
          sprint_id: sprintId,
          tasks: s.tasks ?? { total: 0, completed: 0, list: [] },
          dependencies: [],
        },
      });
    }
  }

  listStories({ sprintId, status, epicId } = {}) {
    const out = [];
    for (const [, entry] of this.stories) {
      if (!entry.ok) continue;
      const d = entry.data;
      if (sprintId && d.sprint_id !== sprintId) continue;
      if (status && d.status !== status) continue;
      if (epicId && d.epic_id !== epicId) continue;
      out.push({ ...d, _mtime: entry.mtime, _source: entry.source ?? 'markdown', _writable: entry.path !== null });
    }
    return out.sort((a, b) => a.id.localeCompare(b.id));
  }

  listEpics() {
    return [...this.epics.values()].filter((e) => e.ok).map((e) => ({ ...e.data, _mtime: e.mtime }));
  }

  getStory(id) {
    const entry = this.stories.get(id);
    if (!entry || !entry.ok) return null;
    return { ...entry.data, _mtime: entry.mtime, _source: entry.source ?? 'markdown', _writable: entry.path !== null };
  }

  getStoryFile(id) {
    const entry = this.stories.get(id);
    return entry ? entry.path : null;
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
