import { describe, it, expect, beforeAll, beforeEach, afterEach } from 'vitest';
import { mkdtemp, cp, rm, readFile, writeFile, mkdir } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import * as yaml from 'js-yaml';
import { parseString } from '../../cli/kanban/server/services/frontmatter.js';
import { fileURLToPath } from 'node:url';
import { Repository } from '../../cli/kanban/server/services/repository.js';
import { createApp } from '../../cli/kanban/server/app.js';
import { revOf } from '../../cli/kanban/server/services/status-store.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// Project initialized BMAD-v6 style: stories live in ../.bmad/sprint-status.yaml.
const FIXTURE_ROOT = path.resolve(__dirname, '../fixtures/bmad-sprint-status');
const PM_DIR = path.join(FIXTURE_ROOT, 'project-management');
const PORT = 3737;

let repo;
let app;

beforeAll(async () => {
  repo = new Repository(PM_DIR);
  await repo.refresh();
  app = createApp({ repository: repo, port: PORT, projectRoot: FIXTURE_ROOT });
});

function req(method, url, { origin, body } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (origin) headers.Origin = origin;
  return app.request(url, { method, headers, body: body ? JSON.stringify(body) : undefined });
}

describe('Repository — .bmad/sprint-status.yaml ingestion', () => {
  it('surfaces YAML-only stories so the board is not empty', () => {
    const stories = repo.listStories();
    const ids = stories.map((s) => s.id).sort();
    // US-100 (markdown) + US-E1-01 + US-E1-02 (YAML-only)
    expect(ids).toEqual(['US-100', 'US-E1-01', 'US-E1-02']);
  });

  it('tags each story with its content source; status is writable for both', () => {
    const byId = Object.fromEntries(repo.listStories().map((s) => [s.id, s]));

    expect(byId['US-E1-01']._source).toBe('sprint-status');
    expect(byId['US-E1-01']._writable).toBe(true);
    expect(byId['US-E1-01'].sprint_id).toBe('sprint-x');
    expect(byId['US-E1-01'].status).toBe('ready-for-dev');
    expect(byId['US-E1-01'].story_points).toBe(3);
    expect(byId['US-E1-01'].epic_id).toBe('E1'); // from metadata.epic

    expect(byId['US-100']._source).toBe('markdown');
    expect(byId['US-100']._writable).toBe(true);
  });

  it('takes content from markdown and status from sprint-status.yaml (single source of status)', () => {
    const us100 = repo.getStory('US-100');
    expect(us100.title).toBe('Markdown-backed story (content from markdown)');
    expect(us100.story_points).toBe(8);
    expect(us100.status).toBe('backlog');
    expect(us100.previous_status).toBe('backlog');
    expect(us100._statusSource).toBe('sprint-status');
    expect(repo.getStoryFile('US-100')).not.toBeNull();
  });

  it('keeps no backing file for YAML-only stories', () => {
    expect(repo.getStoryFile('US-E1-01')).toBeNull();
  });
});

describe('GET /api/stories — board populated from YAML', () => {
  it('returns the three stories', async () => {
    const r = await req('GET', '/api/stories');
    expect(r.status).toBe(200);
    const { stories } = await r.json();
    expect(stories.map((s) => s.id).sort()).toEqual(['US-100', 'US-E1-01', 'US-E1-02']);
  });
});

describe('GET /api/sprints/current — no longer "no sprint"', () => {
  it('returns 200 with sprint metadata, stories and burndown', async () => {
    const r = await req('GET', '/api/sprints/current');
    expect(r.status).toBe(200);
    const data = await r.json();
    expect(data.sprint.sprint_id).toBe('sprint-x');
    expect(data.stories.map((s) => s.id).sort()).toEqual(['US-100', 'US-E1-01', 'US-E1-02']);
    // 8 (US-100 md) + 3 + 5
    expect(data.burndown.total_points).toBe(16);
    expect(data.burndown.ideal.length).toBeGreaterThan(0);
  });
});

describe('PATCH /api/stories/:id/status — writes the status to sprint-status.yaml', () => {
  const origin = `http://127.0.0.1:${PORT}`;
  let dir;
  let root;
  let tmpApp;

  beforeEach(async () => {
    dir = await mkdtemp(path.join(tmpdir(), 'kb-ssy-'));
    root = path.join(dir, 'proj');
    await cp(FIXTURE_ROOT, root, { recursive: true });
    const tmpRepo = new Repository(path.join(root, 'project-management'));
    await tmpRepo.refresh();
    tmpApp = createApp({ repository: tmpRepo, port: PORT, projectRoot: root });
  });
  afterEach(async () => {
    await rm(dir, { recursive: true, force: true });
  });

  const ssy = async () => yaml.load(await readFile(path.join(root, '.bmad', 'sprint-status.yaml'), 'utf8'));
  const send = (id, body, headers = {}) =>
    tmpApp.request(`/api/stories/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Origin: origin, ...headers },
      body: JSON.stringify(body),
    });
  const yamlFile = () => path.join(root, '.bmad', 'sprint-status.yaml');
  const raw = () => readFile(yamlFile(), 'utf8');

  it('moves a YAML-only story and records the transition in history', async () => {
    const r = await send('US-E1-01', { status: 'in-progress' });
    expect(r.status).toBe(200);
    expect((await r.json()).story.status).toBe('in-progress');

    const story = (await ssy()).stories['US-E1-01'];
    expect(story.status).toBe('in-progress');
    expect(story.previous_status).toBe('ready-for-dev');
    expect(story.history.at(-1)).toMatchObject({ from: 'ready-for-dev', to: 'in-progress', by: 'kanban' });
    expect(story.tasks.total).toBe(2); // untouched fields survive
  });

  it('writes a markdown-backed story status to the YAML and leaves the markdown untouched', async () => {
    const mdPath = path.join(root, 'project-management/backlog/user-stories/US-100-existing.md');
    const before = await readFile(mdPath, 'utf8');

    const r = await send('US-100', { status: 'blocked', blocked_reason: 'waiting for API' });
    expect(r.status).toBe(200);
    const story = (await ssy()).stories['US-100'];
    expect(story.status).toBe('blocked');
    expect(story.blocked_reason).toBe('waiting for API');
    expect(await readFile(mdPath, 'utf8')).toBe(before);
    expect(parseString(before).data.status).toBe('in-progress');
  });

  it('returns the 12-hex version of the written file and keeps the YAML comments', async () => {
    const r = await send('US-E1-01', { status: 'in-progress' });

    expect(r.status).toBe(200);
    expect((await r.json()).version).toMatch(/^[0-9a-f]{12}$/);
    expect(await raw()).toContain('# BMAD v6 - Sprint Status (test fixture)\n');
  });

  it('accepts a matching If-Match (plain or quoted ETag form)', async () => {
    const rev = revOf((await ssy()).stories['US-E1-01']);

    expect((await send('US-E1-01', { status: 'in-progress' }, { 'If-Match': `"${rev}"` })).status).toBe(200);
  });

  it('409 conflict with the current YAML story when If-Match is stale, file unchanged', async () => {
    const before = await raw();

    const r = await send('US-E1-01', { status: 'in-progress' }, { 'If-Match': 'deadbeef0000' });

    expect(r.status).toBe(409);
    const body = await r.json();
    expect(body.error).toBe('conflict');
    expect(body.current).toMatchObject({ title: 'YAML-only story one', status: 'ready-for-dev' });
    expect(await raw()).toBe(before);
  });

  it('409 conflict when the YAML status moved since the board was loaded (no If-Match)', async () => {
    await writeFile(yamlFile(), (await raw()).replace('status: "ready-for-dev"', 'status: "in-progress"'));

    const r = await send('US-E1-01', { status: 'in-progress' });

    expect(r.status).toBe(409);
    expect((await r.json()).current.status).toBe('in-progress');
  });

  it('409 sprint_status_invalid with issues when the YAML no longer satisfies the schema', async () => {
    await writeFile(yamlFile(), (await raw()).replace('status: "backlog"', 'status: "shipped"'));
    const before = await raw();

    const r = await send('US-E1-01', { status: 'in-progress' });

    expect(r.status).toBe(409);
    const body = await r.json();
    expect(body.error).toBe('sprint_status_invalid');
    expect(body.issues.length).toBeGreaterThan(0);
    expect(await raw()).toBe(before);
  });

  it('409 sprint_status_missing when the YAML was removed meanwhile', async () => {
    await rm(yamlFile());

    const r = await send('US-E1-01', { status: 'in-progress' });

    expect(r.status).toBe(409);
    expect((await r.json()).error).toBe('sprint_status_missing');
  });

  it('records the request reason in history, else blocked_reason, else an empty string', async () => {
    await send('US-E1-01', { status: 'in-progress', reason: 'picked up' });
    await send('US-E1-02', { status: 'blocked', blocked_reason: 'waiting' });
    await send('US-E1-02', { status: 'ready-for-dev' });

    const { stories } = await ssy();
    expect(stories['US-E1-01'].history.at(-1).reason).toBe('picked up');
    expect(stories['US-E1-02'].history.map((h) => h.reason)).toEqual(['waiting', '']);
  });

  it('invalid_transition lists the allowed targets', async () => {
    const r = await send('US-E1-01', { status: 'done' });

    expect(r.status).toBe(409);
    expect(await r.json()).toMatchObject({
      error: 'invalid_transition',
      allowed: ['in-progress', 'blocked', 'backlog'],
    });
  });

  it('still returns 404 for a genuinely unknown story id', async () => {
    const r = await req('PATCH', '/api/stories/US-999/status', {
      origin,
      body: { status: 'in-progress' },
    });
    expect(r.status).toBe(404);
  });
});

describe('Repository — precedence between a markdown file and its YAML entry', () => {
  let dir;

  const MD = `---
id: US-400
title: Title from markdown
story_points: 8
priority: should
sprint_id: sprint-md
assigned_to: alice
epic_id: EPIC-001
dependencies: [US-001]
tasks:
  total: 1
  completed: 0
  list: [TASK-400]
---
Body.
`;

  async function project(storyYaml, md = MD) {
    dir = await mkdtemp(path.join(tmpdir(), 'kb-prec-'));
    await mkdir(path.join(dir, '.bmad'), { recursive: true });
    await mkdir(path.join(dir, 'project-management/backlog/user-stories'), { recursive: true });
    await writeFile(path.join(dir, 'project-management/backlog/user-stories/US-400-x.md'), md);
    await writeFile(
      path.join(dir, '.bmad/sprint-status.yaml'),
      `version: "1.0"\nmetadata:\n  sprint_id: "sprint-yaml"\n  name: "S"\n  start_date: "2026-01-01"\n  end_date: "2026-01-14"\n  epic: "E9"\nstories:\n  US-400:\n    title: "Title from YAML"\n    status: "ready-for-dev"\n${storyYaml}`
    );
    const repository = new Repository(path.join(dir, 'project-management'));
    await repository.refresh();
    return repository;
  }

  afterEach(async () => {
    await rm(dir, { recursive: true, force: true });
  });

  it('the YAML wins on every field it carries', async () => {
    const r = await project(
      [
        '    story_points: 3',
        '    priority: "must"',
        '    assigned_to: "bob"',
        '    epic_id: "EPIC-002"',
        '    sprint_id: "sprint-yaml"',
        '    dependencies: ["US-002 (note)"]',
        '    tasks: { total: 2, completed: 1, list: ["A", "B"] }',
        '',
      ].join('\n')
    );

    expect(r.getStory('US-400')).toMatchObject({
      title: 'Title from YAML',
      story_points: 3,
      priority: 'must',
      assigned_to: 'bob',
      epic_id: 'EPIC-002',
      sprint_id: 'sprint-yaml',
      dependencies: ['US-002'],
      tasks: { total: 2, completed: 1, list: ['A', 'B'] },
    });
  });

  it('the markdown keeps the fields the YAML entry does not carry', async () => {
    const r = await project('');

    expect(r.getStory('US-400')).toMatchObject({
      title: 'Title from YAML',
      story_points: 8,
      priority: 'should',
      assigned_to: 'alice',
      epic_id: 'EPIC-001',
      sprint_id: 'sprint-md',
      dependencies: ['US-001'],
      tasks: { total: 1, list: ['TASK-400'] },
    });
  });

  it('sprint_id: null in the YAML is the backlog, even when the markdown names a sprint', async () => {
    const r = await project('    sprint_id: null\n');
    expect(r.getStory('US-400').sprint_id).toBeNull();
    expect(r.listStories({ sprintId: 'sprint-md' })).toEqual([]);
  });

  it('assigned_to: null and epic_id: "" in the YAML clear the markdown values', async () => {
    const r = await project('    assigned_to: null\n    epic_id: ""\n');
    expect(r.getStory('US-400')).toMatchObject({ assigned_to: '', epic_id: null });
  });

  it('a YAML-only story keeps the active sprint and epic unless its own keys say otherwise', async () => {
    const r = await project('', 'not a story file');
    expect(r.getStory('US-400')).toMatchObject({ sprint_id: 'sprint-yaml', epic_id: 'E9' });

    const r2 = await project('    sprint_id: null\n    epic_id: ""\n', 'not a story file');
    expect(r2.getStory('US-400')).toMatchObject({ sprint_id: null, epic_id: null });
  });

  it('priority_raw survives only while the YAML holds a P0..P3 value', async () => {
    const p = await project('    priority: "P0"\n');
    expect(p.getStory('US-400')).toMatchObject({ priority: 'must', priority_raw: 'P0' });
    const m = await project('    priority: "could"\n');
    expect(m.getStory('US-400')).toMatchObject({ priority: 'could', priority_raw: null });
  });

  it('_rev is the revision of the raw YAML entry, for markdown-backed and YAML-only stories', async () => {
    const r = await project('    story_points: 3\n');
    const entry = yaml.load(await readFile(path.join(dir, '.bmad/sprint-status.yaml'), 'utf8')).stories['US-400'];
    expect(r.getStory('US-400')._rev).toBe(revOf(entry));
    expect(r.listStories()[0]._rev).toBe(revOf(entry));

    const y = await project('    story_points: 3\n', 'not a story file');
    expect(y.getStory('US-400')._rev).toBe(revOf(entry));
  });

  it('_rev changes with any change of the entry and is absent without a YAML entry', async () => {
    const a = (await project('    story_points: 3\n')).getStory('US-400')._rev;
    const b = (await project('    story_points: 4\n')).getStory('US-400')._rev;
    expect(a).not.toBe(b);
    expect((await project('', MD)).getStory('US-400')._rev).toMatch(/^[0-9a-f]{12}$/);
  });
});
