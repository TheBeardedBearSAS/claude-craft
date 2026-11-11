import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { mkdtemp, cp, rm, readFile, writeFile, readdir, stat, mkdir } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as yaml from 'js-yaml';
import { Repository } from '../../cli/kanban/server/services/repository.js';
import { EventBus } from '../../cli/kanban/server/services/event-bus.js';
import { createApp } from '../../cli/kanban/server/app.js';
import { revOf, InvalidStatusFileError } from '../../cli/kanban/server/services/status-store.js';
import { renderStoryMarkdown } from '../../cli/kanban/server/services/story-files.js';

const hooks = vi.hoisted(() => ({ mutate: null }));
vi.mock('../../cli/kanban/server/services/status-store.js', async (importOriginal) => {
  const real = await importOriginal();
  return {
    ...real,
    mutateSprintStatus: (...args) => (hooks.mutate ? hooks.mutate(real, ...args) : real.mutateSprintStatus(...args)),
  };
});

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FIXTURES = path.resolve(__dirname, '../fixtures');
const PORT = 3737;
const ORIGIN = `http://127.0.0.1:${PORT}`;
const STORIES = 'project-management/backlog/user-stories';

let dir;
let root;
let repo;
let app;
let bus;
let events;

async function setup(fixture, { readonly = false } = {}) {
  dir = await mkdtemp(path.join(tmpdir(), 'kb-stories-'));
  root = path.join(dir, 'proj');
  await cp(path.join(FIXTURES, fixture), root, { recursive: true });
  repo = new Repository(path.join(root, 'project-management'));
  await repo.refresh();
  bus = new EventBus();
  events = [];
  bus.subscribe((e) => events.push(e));
  app = createApp({ repository: repo, port: PORT, projectRoot: root, eventBus: bus, user: 'alice', readonly });
}

beforeEach(() => {
  hooks.mutate = null;
});
afterEach(async () => {
  await rm(dir, { recursive: true, force: true });
});

const yamlFile = () => path.join(root, '.bmad', 'sprint-status.yaml');
const rawYaml = () => readFile(yamlFile(), 'utf8');
const ssy = async () => yaml.load(await rawYaml());
const inRoot = (...p) => path.join(root, ...p);

async function call(method, url, { body, text, headers = {}, origin = ORIGIN } = {}) {
  const init = { method, headers: { 'Content-Type': 'application/json', ...headers } };
  if (origin) init.headers.Origin = origin;
  if (body !== undefined) init.body = JSON.stringify(body);
  if (text !== undefined) init.body = text;
  const res = await app.request(url, init);
  const type = res.headers.get('content-type') ?? '';
  const json = type.includes('json') ? await res.json() : null;
  expect(JSON.stringify(json)).not.toContain(dir); // no absolute path ever leaves the server
  return { status: res.status, body: json };
}
const patch = (id, body, headers) => call('PATCH', `/api/stories/${id}`, { body, headers });

describe('PATCH /api/stories/:id', () => {
  beforeEach(() => setup('bmad-sprint-status'));

  it('edits a YAML-only story: YAML written, _rev refreshed, no history entry, event published', async () => {
    const before = (await ssy()).stories['US-E1-01'];
    const edit = {
      title: 'Renamed',
      story_points: 8,
      assigned_to: 'bob',
      priority: 'must',
      tdd_phase: 'red',
      epic_id: 'EPIC-002',
      dependencies: ['US-100'],
    };

    const res = await patch('US-E1-01', edit);

    expect(res.status).toBe(200);
    expect(res.body.version).toMatch(/^[0-9a-f]{12}$/);
    expect(res.body.story).toMatchObject({
      id: 'US-E1-01',
      title: 'Renamed',
      story_points: 8,
      assigned_to: 'bob',
      priority: 'must',
      tdd_phase: 'red',
      epic_id: 'EPIC-002',
      dependencies: ['US-100'],
      status: 'ready-for-dev',
    });
    const after = (await ssy()).stories['US-E1-01'];
    expect(after).toMatchObject(edit);
    expect(after.history ?? []).toEqual(before.history ?? []);
    expect(res.body.story._rev).toBe(revOf(after));
    expect(events.at(-1)).toMatchObject({ event: 'story:updated', payload: { id: 'US-E1-01' } });
    expect(await rawYaml()).toContain('# BMAD v6 - Sprint Status (test fixture)\n');
  });

  it('GET returns the same _rev as the mutation answer', async () => {
    const res = await patch('US-E1-01', { story_points: 2 });
    const get = await call('GET', '/api/stories/US-E1-01');
    expect(get.body.story._rev).toBe(res.body.story._rev);
    const list = await call('GET', '/api/stories');
    expect(list.body.stories.find((s) => s.id === 'US-E1-01')._rev).toBe(res.body.story._rev);
  });

  it('the YAML wins over a markdown file with frontmatter and leaves that file alone', async () => {
    const md = inRoot(STORIES, 'US-100-existing.md');
    const before = await readFile(md, 'utf8');

    const res = await patch('US-100', { story_points: 13, title: 'Edited in YAML' });

    expect(res.status).toBe(200);
    expect(res.body.story).toMatchObject({ story_points: 13, title: 'Edited in YAML' });
    expect((await ssy()).stories['US-100'].story_points).toBe(13);
    expect(await readFile(md, 'utf8')).toBe(before);
  });

  it('assigned_to null and epic_id null are written (nobody / no epic)', async () => {
    const res = await patch('US-E1-01', { assigned_to: null, epic_id: null });

    expect(res.status).toBe(200);
    expect(res.body.story).toMatchObject({ assigned_to: '', epic_id: null });
    const entry = (await ssy()).stories['US-E1-01'];
    expect(entry.assigned_to).toBeNull();
    expect(entry.epic_id).toBe('');
  });

  it('moving to another sprint is traced in the history with an unchanged status', async () => {
    const res = await patch('US-E1-01', { sprint_id: null });

    expect(res.status).toBe(200);
    expect(res.body.story.sprint_id).toBeNull();
    const entry = (await ssy()).stories['US-E1-01'];
    expect(entry.sprint_id).toBeNull();
    expect(entry.history.at(-1)).toMatchObject({
      from: 'ready-for-dev',
      to: 'ready-for-dev',
      by: 'kanban:alice',
      reason: 'sprint: sprint-x -> backlog',
    });

    const back = await patch('US-E1-01', { sprint_id: 'sprint-x' });
    expect(back.body.story.sprint_id).toBe('sprint-x');
    expect((await ssy()).stories['US-E1-01'].history.at(-1).reason).toBe('sprint: backlog -> sprint-x');
  });

  it('does not trace a sprint_id that is already the effective one', async () => {
    await patch('US-E1-01', { sprint_id: 'sprint-x' });
    expect((await ssy()).stories['US-E1-01'].history ?? []).toEqual([]);
  });

  it('409 sprint_not_found for a sprint that is neither active nor a known folder; file untouched', async () => {
    const before = await rawYaml();

    const res = await patch('US-E1-01', { sprint_id: 'sprint-nope' });

    expect(res.status).toBe(409);
    expect(res.body.error).toBe('sprint_not_found');
    expect(await rawYaml()).toBe(before);
  });

  it('accepts a sprint that only exists as a folder', async () => {
    await mkdir(inRoot('project-management/sprints/sprint-2-next'), { recursive: true });
    await writeFile(inRoot('project-management/sprints/sprint-2-next/sprint-goal.md'), '# Goal\n');
    await repo.refresh();

    const res = await patch('US-E1-01', { sprint_id: 'sprint-2-next' });

    expect(res.status).toBe(200);
    expect(res.body.story.sprint_id).toBe('sprint-2-next');
  });

  it('If-Match: a matching rev (plain or quoted) passes, a stale one is a 409 with the current entry', async () => {
    const rev = revOf((await ssy()).stories['US-E1-01']);
    expect((await patch('US-E1-01', { story_points: 4 }, { 'If-Match': `"${rev}"` })).status).toBe(200);

    const before = await rawYaml();
    const stale = await patch('US-E1-01', { story_points: 5 }, { 'If-Match': rev });

    expect(stale.status).toBe(409);
    expect(stale.body).toMatchObject({ error: 'conflict', reason: 'stale', current: { story_points: 4 } });
    expect(await rawYaml()).toBe(before);
  });

  it('409 conflict also gives the story in the API format (with _rev), read again from disk', async () => {
    const rev = revOf((await ssy()).stories['US-E1-01']);
    // Another tool changed the entry; the board has not refreshed yet.
    await writeFile(yamlFile(), (await rawYaml()).replace(/(\n {2}US-E1-01:\n {4}title: )[^\n]*/, '$1"Changed elsewhere"'));

    const res = await patch('US-E1-01', { story_points: 5 }, { 'If-Match': rev });

    expect(res.status).toBe(409);
    expect(res.body.story).toMatchObject({ id: 'US-E1-01', title: 'Changed elsewhere' });
    expect(res.body.story._rev).toBe(revOf((await ssy()).stories['US-E1-01']));
    expect(res.body.story._rev).not.toBe(rev);
  });

  it('409 conflict when the entry disappeared from the YAML meanwhile', async () => {
    const text = await rawYaml();
    await writeFile(yamlFile(), text.replace(/\n {2}US-E1-02:[\s\S]*$/, '\n'));
    await writeFile(yamlFile(), (await rawYaml()).replace(/\n {2}US-E1-01:[\s\S]*$/, '\n'));

    const res = await patch('US-E1-01', { story_points: 1 });

    expect(res.status).toBe(409);
    expect(res.body).toMatchObject({ error: 'conflict', reason: 'removed', story: null });
  });

  it('404 for an unknown story and for an id that cannot be a story id', async () => {
    expect((await patch('US-999', { story_points: 1 })).status).toBe(404);
    expect((await patch('..%2F..%2Fetc', { story_points: 1 })).status).toBe(404);
    expect((await patch('US-1%2F..%2Fx', { story_points: 1 })).status).toBe(404);
  });

  it('400 invalid_payload for status, unknown keys, an empty patch and a self dependency', async () => {
    for (const body of [{ status: 'done' }, { foo: 1 }, {}, { story_points: 99 }, { epic_id: '../x' }]) {
      const res = await patch('US-E1-01', body);
      expect(res.status).toBe(400);
      expect(res.body.error).toBe('invalid_payload');
      expect(res.body.issues.length).toBeGreaterThan(0);
    }
    const self = await patch('US-E1-01', { dependencies: ['US-E1-01'] });
    expect(self.status).toBe(400);
    expect(self.body.error).toBe('invalid_payload');
  });

  it('400 invalid_json', async () => {
    const res = await call('PATCH', '/api/stories/US-E1-01', { text: '{nope' });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('invalid_json');
  });

  it('a hostile title is stored as data and writes nothing outside project-management/', async () => {
    const outside = await readdir(dir);

    const res = await patch('US-E1-01', { title: '../../../../etc/passwd\n  status: "done"' });

    expect(res.status).toBe(200);
    expect(res.body.story.status).toBe('ready-for-dev');
    expect((await ssy()).stories['US-E1-01'].status).toBe('ready-for-dev');
    expect(await readdir(dir)).toEqual(outside);
  });
});

describe('PATCH /api/stories/:id — markdown "## Metadata" synchronization', () => {
  beforeEach(async () => {
    await setup('bmad-sprint-status');
    const md = renderStoryMarkdown({
      id: 'US-300',
      title: 'Tracked metadata story',
      story_points: 1,
      date: '2026-01-01',
    });
    await writeFile(inRoot(STORIES, 'US-300-tracked.md'), md);
    const text = await rawYaml();
    await writeFile(
      yamlFile(),
      `${text.trimEnd()}\n  US-300:\n    title: "Tracked metadata story"\n    status: "backlog"\n`
    );
    await repo.refresh();
  });

  it('a markdown story without frontmatter tracked by the YAML is editable', async () => {
    const story = repo.getStory('US-300');
    expect(story).toMatchObject({ _source: 'markdown-metadata', _statusSource: 'sprint-status', _writable: true });
  });

  it('rewrites Points, EPIC, Sprint and Updated, and never a Status line', async () => {
    const md = inRoot(STORIES, 'US-300-tracked.md');
    const before = await readFile(md, 'utf8');

    const res = await patch('US-300', { story_points: 5, epic_id: 'EPIC-003', sprint_id: 'sprint-x' });

    expect(res.status).toBe(200);
    expect(res.body.warnings).toBeUndefined();
    const after = await readFile(md, 'utf8');
    expect(after).toContain('- **Points**: 5\n');
    expect(after).toContain('- **EPIC**: EPIC-003\n');
    expect(after).toContain('- **Sprint**: sprint-x\n');
    expect(after).toMatch(/- \*\*Updated\*\*: \d{4}-\d{2}-\d{2}\n/);
    expect(after).not.toMatch(/\*\*Status\*\*/i);
    expect(after.replace(/^- \*\*(Points|EPIC|Sprint|Updated)\*\*.*\n/gm, '')).toBe(
      before.replace(/^- \*\*(Points|EPIC|Sprint|Updated)\*\*.*\n/gm, '')
    );
    expect(res.body.story).toMatchObject({ story_points: 5, epic_id: 'EPIC-003', sprint_id: 'sprint-x' });
  });

  it('clears the epic and the sprint with a dash', async () => {
    await patch('US-300', { epic_id: 'EPIC-003', sprint_id: 'sprint-x' });
    const res = await patch('US-300', { epic_id: null, sprint_id: null });

    expect(res.status).toBe(200);
    const after = await readFile(inRoot(STORIES, 'US-300-tracked.md'), 'utf8');
    expect(after).toContain('- **EPIC**: —\n');
    expect(after).toContain('- **Sprint**: —\n');
    expect(res.body.story).toMatchObject({ epic_id: null, sprint_id: null });
  });

  it('a title-only edit does not touch the markdown file', async () => {
    const md = inRoot(STORIES, 'US-300-tracked.md');
    const before = await stat(md);
    await patch('US-300', { title: 'Only the title' });
    expect((await stat(md)).mtimeMs).toBe(before.mtimeMs);
  });

  it('a failed synchronization is a warning, the YAML edit stays', async () => {
    const md = inRoot(STORIES, 'US-300-tracked.md');
    await writeFile(`${md}.lock`, JSON.stringify({ pid: process.pid, ts: Date.now() + 60_000 }));
    const errors = vi.spyOn(console, 'error').mockImplementation(() => {});

    const res = await patch('US-300', { story_points: 9 });

    errors.mockRestore();
    expect(res.status).toBe(200);
    expect(res.body.warnings).toEqual(['metadata_sync_failed']);
    expect((await ssy()).stories['US-300'].story_points).toBe(9);
    expect(await readFile(md, 'utf8')).toContain('- **Points**: 1\n');
  });
});

describe('PATCH /api/stories/:id — other sources', () => {
  it('priority is written as MoSCoW and priority_raw goes away (YAML story with P0)', async () => {
    await setup('wrandly-anon');
    const before = repo.getStory('US-E4-03');
    expect(before).toMatchObject({ priority: 'must', priority_raw: 'P0' });

    const res = await patch('US-E4-03', { priority: 'could' });

    expect(res.status).toBe(200);
    expect(res.body.story).toMatchObject({ priority: 'could', priority_raw: null });
    expect((await ssy()).stories['US-E4-03'].priority).toBe('could');
    const text = await rawYaml();
    expect(text).toContain('# BMAD v6 - Sprint Status (ANONYMIZED FIXTURE');
    expect(text).toContain('# Sprints clôturés.');
  });

  it('409 archived for a story of a closed sprint', async () => {
    await setup('wrandly-anon');
    const before = await rawYaml();

    const res = await patch('US-E0-01', { story_points: 1 });

    expect(res.status).toBe(409);
    expect(res.body.error).toBe('archived');
    expect(await rawYaml()).toBe(before);
  });

  it('409 read_only_source for a markdown story without frontmatter that the YAML does not track', async () => {
    await setup('metadata-backlog');
    const res = await patch('US-001', { story_points: 1 });
    expect(res.status).toBe(409);
    expect(res.body.error).toBe('read_only_source');
  });

  it('writes the frontmatter of a legacy markdown story the YAML does not track', async () => {
    await setup('wrandly-anon');
    const yamlBefore = await rawYaml();
    const md = inRoot(STORIES, 'US-200-legacy.md');
    const body = (await readFile(md, 'utf8')).split('\n---\n')[1];

    const res = await patch('US-200', { story_points: 8, assigned_to: null });

    expect(res.status).toBe(200);
    expect(res.body.version).toBeNull();
    expect(res.body.story).toMatchObject({ story_points: 8, assigned_to: '' });
    const after = await readFile(md, 'utf8');
    expect(after).toContain('story_points: 8');
    expect(after.split('\n---\n')[1]).toBe(body);
    expect(await rawYaml()).toBe(yamlBefore);
  });

  it('legacy frontmatter story: sprint and self dependency are checked too', async () => {
    await setup('wrandly-anon');
    expect((await patch('US-200', { sprint_id: 'sprint-nope' })).body.error).toBe('sprint_not_found');
    expect((await patch('US-200', { dependencies: ['US-200'] })).status).toBe(400);
    expect((await patch('US-200', { sprint_id: 'sprint-2-design-system' })).status).toBe(200);
  });
});

describe('PUT /api/stories/:id/body', () => {
  const put = (id, body) => call('PUT', `/api/stories/${id}/body`, { body });

  beforeEach(() => setup('bmad-sprint-status'));

  it('replaces the body of a frontmatter story and keeps the frontmatter byte for byte', async () => {
    const md = inRoot(STORIES, 'US-100-existing.md');
    const raw = await readFile(md, 'utf8');
    const head = raw.slice(0, raw.indexOf('\n---\n') + 5);
    const mtime = repo.getStory('US-100')._mtime;

    const res = await put('US-100', { markdown: '# New body\n\nText.\n', expected_mtime: mtime });

    expect(res.status).toBe(200);
    expect(await readFile(md, 'utf8')).toBe(`${head}# New body\n\nText.\n`);
    expect(res.body.story._mtime).toBe((await stat(md)).mtimeMs);
    expect((await call('GET', '/api/stories/US-100')).body.body).toBe('# New body\n\nText.\n');
    expect(events.at(-1)).toMatchObject({ event: 'story:updated', payload: { id: 'US-100' } });
    expect(await readdir(path.dirname(md))).toEqual(['US-100-existing.md']);
  });

  it('replaces the whole file of a markdown story without frontmatter', async () => {
    const create = await call('POST', '/api/stories', { body: { title: 'Body target' } });
    const id = create.body.story.id;
    const md = inRoot(STORIES, `${id}-body-target.md`);

    const res = await put(id, { markdown: '# Rewritten\n', expected_mtime: create.body.story._mtime });

    expect(res.status).toBe(200);
    expect(await readFile(md, 'utf8')).toBe('# Rewritten\n');
  });

  it('409 conflict with a stale mtime, file untouched', async () => {
    const md = inRoot(STORIES, 'US-100-existing.md');
    const before = await readFile(md, 'utf8');

    const res = await put('US-100', { markdown: 'x', expected_mtime: 1 });

    expect(res.status).toBe(409);
    expect(res.body.error).toBe('conflict');
    expect(await readFile(md, 'utf8')).toBe(before);
  });

  it('409 no_backing_file for a YAML-only story', async () => {
    const res = await put('US-E1-01', { markdown: 'x', expected_mtime: 1 });
    expect(res.status).toBe(409);
    expect(res.body.error).toBe('no_backing_file');
  });

  it('422 status_line_forbidden, file untouched', async () => {
    const md = inRoot(STORIES, 'US-100-existing.md');
    const before = await readFile(md, 'utf8');

    const res = await put('US-100', {
      markdown: '## Metadata\n- **Status**: Done\n',
      expected_mtime: repo.getStory('US-100')._mtime,
    });

    expect(res.status).toBe(422);
    expect(res.body.error).toBe('status_line_forbidden');
    expect(await readFile(md, 'utf8')).toBe(before);
  });

  it('accepts the sprint-status pointer line that the templates contain', async () => {
    const res = await put('US-100', {
      markdown: '- **Status**: tracked in .bmad/sprint-status.yaml\n',
      expected_mtime: repo.getStory('US-100')._mtime,
    });
    expect(res.status).toBe(200);
  });

  it('400 on invalid json / payload (missing mtime, unknown key, non numeric mtime), 404 on unknown story', async () => {
    expect((await call('PUT', '/api/stories/US-100/body', { text: '{' })).body.error).toBe('invalid_json');
    for (const body of [{ markdown: 'x' }, { markdown: 'x', expected_mtime: 1, path: '/x' }, { markdown: 1 }]) {
      const res = await put('US-100', body);
      expect(res.status).toBe(400);
      expect(res.body.error).toBe('invalid_payload');
    }
    expect((await put('US-999', { markdown: 'x', expected_mtime: 1 })).status).toBe(404);
    expect((await put('US-1%2F..%2Fx', { markdown: 'x', expected_mtime: 1 })).status).toBe(404);
  });

  it('accepts up to 512 KB on this route only (the global limit stays 64 KB elsewhere)', async () => {
    const mtime = repo.getStory('US-100')._mtime;
    const big = await put('US-100', { markdown: 'x'.repeat(100_000), expected_mtime: mtime });
    expect(big.status).toBe(200);

    const huge = await put('US-100', { markdown: 'x'.repeat(600_000), expected_mtime: big.body.story._mtime });
    expect(huge.status).toBe(413);
    expect(huge.body.error).toBe('payload_too_large');

    const elsewhere = await patch('US-E1-01', { title: 'x'.repeat(100_000) });
    expect(elsewhere.status).toBe(413);
  });

  it('409 archived', async () => {
    await rm(dir, { recursive: true, force: true });
    await setup('wrandly-anon');
    const res = await put('US-E0-01', { markdown: 'x', expected_mtime: 1 });
    expect(res.status).toBe(409);
    expect(res.body.error).toBe('archived');
  });
});

describe('POST /api/stories', () => {
  const create = (body, headers) => call('POST', '/api/stories', { body, headers });

  describe('on a BMAD v6 project', () => {
    beforeEach(() => setup('bmad-sprint-status'));

    it('creates the markdown file and the backlog entry, answers 201', async () => {
      const res = await create({
        title: 'Pay with a card',
        story_points: 3,
        priority: 'must',
        epic_id: 'EPIC-002',
        persona: 'P-001',
      });

      expect(res.status).toBe(201);
      expect(res.body.version).toMatch(/^[0-9a-f]{12}$/);
      expect(res.body.story).toMatchObject({
        id: 'US-101',
        title: 'Pay with a card',
        status: 'backlog',
        story_points: 3,
        priority: 'must',
        epic_id: 'EPIC-002',
        sprint_id: null,
        persona: 'P-001',
        _writable: true,
      });
      expect(res.body.story._rev).toBe(revOf((await ssy()).stories['US-101']));

      const entry = (await ssy()).stories['US-101'];
      expect(entry).toMatchObject({ title: 'Pay with a card', status: 'backlog', sprint_id: null, story_points: 3 });
      expect(entry.history).toHaveLength(1);
      expect(entry.history[0]).toMatchObject({ from: '', to: 'backlog', by: 'kanban:alice', reason: 'Story created' });
      expect(Object.keys(entry).slice(0, 4)).toEqual(['title', 'status', 'previous_status', 'sprint_id']);

      const md = await readFile(inRoot(STORIES, 'US-101-pay-with-a-card.md'), 'utf8');
      expect(md).toContain('# US-101: Pay with a card');
      expect(md).toContain('- **Points**: 3');
      expect(md).not.toMatch(/\*\*Status\*\*/);
      expect(events.at(-1)).toMatchObject({ event: 'story:updated', payload: { id: 'US-101' } });
      expect(await rawYaml()).toContain('# BMAD v6 - Sprint Status (test fixture)\n');
    });

    it('the new story shows up in the backlog, not in the active sprint, without the sprint epic', async () => {
      await create({ title: 'Backlog item' });
      const stories = (await call('GET', '/api/stories')).body.stories;
      const created = stories.find((s) => s.title === 'Backlog item');
      expect(created).toMatchObject({ sprint_id: null, epic_id: null, status: 'backlog', story_points: 0 });
      expect(created.priority).toBe('should');
    });

    it('continues the epic sequence of epic-style ids', async () => {
      expect((await create({ title: 'In E1', epic_id: 'E1' })).body.story.id).toBe('US-E1-03');
      expect((await create({ title: 'Again', epic_id: 'E1' })).body.story.id).toBe('US-E1-04');
    });

    it('can create straight into the active sprint', async () => {
      const res = await create({ title: 'Sprint item', sprint_id: 'sprint-x' });
      expect(res.status).toBe(201);
      expect(res.body.story.sprint_id).toBe('sprint-x');
      expect(await readFile(inRoot(STORIES, 'US-101-sprint-item.md'), 'utf8')).toContain('- **Sprint**: sprint-x');
    });

    it('never reuses the id of a deleted story (trash included)', async () => {
      const first = (await create({ title: 'Short lived' })).body.story.id;
      expect((await call('DELETE', `/api/stories/${first}`)).status).toBe(200);

      const second = (await create({ title: 'Replacement' })).body.story.id;

      expect(second).not.toBe(first);
    });

    it('409 sprint_not_found, nothing written', async () => {
      const yamlBefore = await rawYaml();
      const files = await readdir(inRoot(STORIES));

      const res = await create({ title: 'Lost', sprint_id: 'sprint-nope' });

      expect(res.status).toBe(409);
      expect(res.body.error).toBe('sprint_not_found');
      expect(await rawYaml()).toBe(yamlBefore);
      expect(await readdir(inRoot(STORIES))).toEqual(files);
    });

    it('removes the markdown file when the YAML write fails', async () => {
      const yamlBefore = await rawYaml();
      const files = await readdir(inRoot(STORIES));
      hooks.mutate = (real, projectRoot, fn, opts) =>
        real(
          projectRoot,
          async (tx) => {
            await fn(tx);
            throw new Error('disk full at /secret/path');
          },
          opts
        );
      const errors = vi.spyOn(console, 'error').mockImplementation(() => {});

      const res = await create({ title: 'Doomed' });

      errors.mockRestore();
      expect(res.status).toBe(500);
      expect(res.body).toEqual({ error: 'write_failed' });
      expect(await readdir(inRoot(STORIES))).toEqual(files);
      expect(await rawYaml()).toBe(yamlBefore);
    });

    it('the title only ever reaches a file name through its ASCII slug (no traversal)', async () => {
      const before = await readdir(dir);

      const res = await create({ title: '../../../../tmp/evil\n/../x' });

      expect(res.status).toBe(201);
      const files = await readdir(inRoot(STORIES));
      expect(files).toContain('US-101-tmp-evil-x.md');
      expect(await readdir(dir)).toEqual(before);
      expect((await readFile(inRoot(STORIES, 'US-101-tmp-evil-x.md'), 'utf8')).split('\n')[0]).toBe(
        '# US-101: ../../../../tmp/evil /../x'
      );
    });

    it('400 for a missing title, unknown keys (status, id) and a bad epic', async () => {
      for (const body of [
        {},
        { title: '  ' },
        { title: 'T', status: 'done' },
        { title: 'T', id: 'US-1' },
        { title: 'T', epic_id: 'x' },
      ]) {
        const res = await create(body);
        expect(res.status).toBe(400);
        expect(res.body.error).toBe('invalid_payload');
      }
      expect((await call('POST', '/api/stories', { text: 'nope' })).body.error).toBe('invalid_json');
      expect(await readdir(inRoot(STORIES))).toEqual(['US-100-existing.md']);
    });
  });

  it('keeps ids of archived sprints taken (wrandly-anon) and the YAML comments', async () => {
    await setup('wrandly-anon');

    const res = await create({ title: 'New in E0', epic_id: 'E0' });

    expect(res.status).toBe(201);
    expect(res.body.story.id).toBe('US-E0-06');
    const text = await rawYaml();
    expect(text).toContain('# BMAD v6 - Sprint Status (ANONYMIZED FIXTURE');
    expect(text).toContain('# Sprints clôturés.');
  });

  it('409 sprint_status_missing when there is no sprint-status.yaml; nothing is created', async () => {
    await setup('metadata-backlog');
    const files = await readdir(inRoot(STORIES));

    const res = await create({ title: 'No YAML' });

    expect(res.status).toBe(409);
    expect(res.body.error).toBe('sprint_status_missing');
    expect(await readdir(inRoot(STORIES))).toEqual(files);
    await expect(stat(inRoot('.bmad'))).rejects.toMatchObject({ code: 'ENOENT' });
  });

  it('409 sprint_status_invalid when the YAML is not understood; nothing is created', async () => {
    await setup('bmad-sprint-status');
    await writeFile(yamlFile(), (await rawYaml()).replace('status: "backlog"', 'status: "shipped"'));
    const files = await readdir(inRoot(STORIES));

    const res = await create({ title: 'Broken' });

    expect(res.status).toBe(409);
    expect(res.body.error).toBe('sprint_status_invalid');
    expect(await readdir(inRoot(STORIES))).toEqual(files);
  });
});

describe('POST /api/stories — YAML removed between the check and the lock', () => {
  it('is still a sprint_status_missing and leaves no markdown behind', async () => {
    await setup('bmad-sprint-status');
    const files = await readdir(inRoot(STORIES));
    hooks.mutate = async () => {
      throw new InvalidStatusFileError('missing');
    };

    const res = await call('POST', '/api/stories', { body: { title: 'Raced' } });

    expect(res.status).toBe(409);
    expect(res.body.error).toBe('sprint_status_missing');
    expect(await readdir(inRoot(STORIES))).toEqual(files);
  });
});

describe('DELETE /api/stories/:id', () => {
  const del = (id, query = '') => call('DELETE', `/api/stories/${id}${query}`);

  describe('on a BMAD v6 project', () => {
    beforeEach(() => setup('bmad-sprint-status'));

    it('removes the entry and moves the markdown file to .trash (not scanned back)', async () => {
      const res = await del('US-100');

      expect(res.status).toBe(200);
      expect(res.body.deleted).toBe('US-100');
      expect(res.body.version).toMatch(/^[0-9a-f]{12}$/);
      expect((await ssy()).stories['US-100']).toBeUndefined();
      expect(Object.keys((await ssy()).stories)).toEqual(['US-E1-01', 'US-E1-02']);
      expect(await readdir(inRoot(STORIES))).toEqual(['.trash']);
      expect(await readdir(inRoot(STORIES, '.trash'))).toEqual(['US-100-existing.md']);
      expect(repo.getStory('US-100')).toBeNull();
      expect(repo.diagnostics().files).toEqual([]);
      expect(events.at(-1)).toMatchObject({ event: 'story:updated', payload: { id: 'US-100', deleted: true } });
      expect(await rawYaml()).toContain('# BMAD v6 - Sprint Status (test fixture)\n');
    });

    it('deletes a YAML-only story (no file to move)', async () => {
      const res = await del('US-E1-02');
      expect(res.status).toBe(200);
      expect(Object.keys((await ssy()).stories)).toEqual(['US-100', 'US-E1-01']);
      expect(await readdir(inRoot(STORIES))).toEqual(['US-100-existing.md']);
    });

    it.each(['in-progress', 'review'])('409 story_active for a %s story, unless ?force=1', async (status) => {
      await writeFile(yamlFile(), (await rawYaml()).replace('status: "ready-for-dev"', `status: "${status}"`));
      await repo.refresh();
      const before = await rawYaml();

      const refused = await del('US-E1-01');

      expect(refused.status).toBe(409);
      expect(refused.body).toMatchObject({ error: 'story_active', status });
      expect(await rawYaml()).toBe(before);
      expect((await del('US-E1-01', '?force=1')).status).toBe(200);
      expect((await ssy()).stories['US-E1-01']).toBeUndefined();
    });

    it('?force=0 does not force', async () => {
      await call('PATCH', '/api/stories/US-E1-01/status', { body: { status: 'in-progress' } });
      expect((await del('US-E1-01', '?force=0')).status).toBe(409);
    });

    it('409 has_dependents with the list, nothing removed', async () => {
      await patch('US-E1-02', { dependencies: ['US-E1-01'] });
      await patch('US-100', { dependencies: ['US-E1-01'] });
      const before = await rawYaml();

      const res = await del('US-E1-01');

      expect(res.status).toBe(409);
      expect(res.body).toEqual({ error: 'has_dependents', dependents: ['US-100', 'US-E1-02'] });
      expect(await rawYaml()).toBe(before);
    });

    it('a warning (not a failure) when the file cannot be moved to the trash', async () => {
      await writeFile(inRoot(STORIES, '.trash'), 'in the way');
      const errors = vi.spyOn(console, 'error').mockImplementation(() => {});

      const res = await del('US-100');

      errors.mockRestore();
      expect(res.status).toBe(200);
      expect(res.body.warnings).toEqual(['trash_failed']);
      expect((await ssy()).stories['US-100']).toBeUndefined();
    });

    it('404 for unknown and malformed ids', async () => {
      expect((await del('US-999')).status).toBe(404);
      expect((await del('..%2F..%2Fx')).status).toBe(404);
      expect(await readdir(inRoot(STORIES))).toEqual(['US-100-existing.md']);
    });
  });

  describe('on the anonymized Wrandly project', () => {
    beforeEach(() => setup('wrandly-anon'));

    it('409 archived', async () => {
      const res = await del('US-E0-01');
      expect(res.status).toBe(409);
      expect(res.body.error).toBe('archived');
    });

    it('trashes a markdown story the YAML does not track and leaves the YAML alone', async () => {
      const before = await rawYaml();

      const res = await del('US-E4-09');

      expect(res.status).toBe(200);
      expect(res.body.version).toBeNull();
      expect(await rawYaml()).toBe(before);
      expect(await readdir(inRoot(STORIES, '.trash'))).toEqual(['US-E4-09-extra.md']);
    });

    it('story_active also guards an untracked markdown story (frontmatter status)', async () => {
      const refused = await del('US-200'); // in-progress in its frontmatter

      expect(refused.status).toBe(409);
      expect(refused.body).toMatchObject({ error: 'story_active', status: 'in-progress' });
      expect((await del('US-200', '?force=1')).status).toBe(200);
      expect(await readdir(inRoot(STORIES, '.trash'))).toEqual(['US-200-legacy.md']);
    });

    it('keeps the YAML comments after a deletion', async () => {
      await del('US-E4-08');
      const text = await rawYaml();
      expect(text).toContain('# BMAD v6 - Sprint Status (ANONYMIZED FIXTURE');
      expect(text).toContain('# Sprints clôturés.');
    });
  });
});

describe('PATCH /api/stories/:id/tasks/:taskId', () => {
  const FIRST = 'Backend : POST /api/v1/auth/oauth/{provider} - FAIT S8';
  const task = (id, taskId, body, headers) =>
    call('PATCH', `/api/stories/${id}/tasks/${encodeURIComponent(taskId)}`, { body, headers });

  describe('on the anonymized Wrandly project', () => {
    beforeEach(() => setup('wrandly-anon'));

    // US-E4-03 only has a counter (3 of 5 done, no per-task status): the first change seeds the statuses from it,
    // in the same mutation, so the counter is never reset and the "all tasks done" gate stays reachable.
    it('seeds per-task statuses from the counter on the first change, then recounts', async () => {
      const LAST = 'Tests backend (FAIT) + mobile + web flux réel post Phase 0';
      const res = await task('US-E4-03', LAST, { status: 'done' });

      expect(res.status).toBe(200);
      expect(res.body.version).toMatch(/^[0-9a-f]{12}$/);
      const tasks = (await ssy()).stories['US-E4-03'].tasks;
      expect(Object.values(tasks.status)).toEqual(['done', 'done', 'done', 'to-do', 'done']);
      expect(tasks.status[LAST]).toBe('done');
      expect(tasks.completed).toBe(4);
      expect(tasks.total).toBe(5);
      expect(tasks.list).toHaveLength(5);
      expect(res.body.story.tasks).toMatchObject({ completed: 4, total: 5 });
      expect(res.body.story._rev).toBe(revOf((await ssy()).stories['US-E4-03']));
      expect(events.at(-1)).toMatchObject({ event: 'story:updated', payload: { id: 'US-E4-03' } });
    });

    it('counts several done tasks and takes one back', async () => {
      const second = 'Backend : liaison compte si email existe déjà - FAIT S8';
      await task('US-E4-03', FIRST, { status: 'in-progress' });
      expect((await ssy()).stories['US-E4-03'].tasks.completed).toBe(2);

      await task('US-E4-03', second, { status: 'blocked' });
      await task('US-E4-03', FIRST, { status: 'done' });
      const tasks = (await ssy()).stories['US-E4-03'].tasks;
      expect(tasks.completed).toBe(2);
      expect(tasks.status[FIRST]).toBe('done');
      expect(tasks.status[second]).toBe('blocked');
    });

    it('every task of a counter-only story can be completed: in-progress -> review is then allowed', async () => {
      const list = (await ssy()).stories['US-E4-03'].tasks.list;
      for (const name of list.slice(3)) expect((await task('US-E4-03', name, { status: 'done' })).status).toBe(200);
      expect((await ssy()).stories['US-E4-03'].tasks).toMatchObject({ completed: 5, total: 5 });
      const moved = await call('PATCH', '/api/stories/US-E4-03/status', { body: { status: 'review' } });
      expect(moved.status).toBe(200);
    });

    it('keeps the other fields of the entry and the YAML comments', async () => {
      const before = (await ssy()).stories['US-E4-03'];
      await task('US-E4-03', FIRST, { status: 'blocked' });
      const after = (await ssy()).stories['US-E4-03'];
      expect({ ...after, tasks: null }).toEqual({ ...before, tasks: null });
      expect(await rawYaml()).toContain('# Sprints clôturés.');
    });

    it('404 task_not_found for a task that is not in tasks.list; nothing written', async () => {
      const before = await rawYaml();
      const res = await task('US-E4-03', 'Not a task', { status: 'done' });
      expect(res.status).toBe(404);
      expect(res.body.error).toBe('task_not_found');
      expect(await rawYaml()).toBe(before);
    });

    it('404 task_not_found for a story without tasks', async () => {
      const res = await task('US-E4-06', FIRST, { status: 'done' });
      expect([404]).toContain(res.status);
    });

    it('409 archived and 409 read_only_source (story not tracked by the YAML)', async () => {
      expect((await task('US-E0-01', 'x', { status: 'done' })).body.error).toBe('archived');
      expect((await task('US-200', 'x', { status: 'done' })).body.error).toBe('read_only_source');
    });

    it('If-Match: stale is a 409 conflict', async () => {
      const before = await rawYaml();
      const res = await task('US-E4-03', FIRST, { status: 'done' }, { 'If-Match': 'deadbeef0000' });
      expect(res.status).toBe(409);
      expect(res.body.error).toBe('conflict');
      expect(await rawYaml()).toBe(before);
    });

    it('400 for an unknown status or key, and invalid json; 404 for an unknown story', async () => {
      expect((await task('US-E4-03', FIRST, { status: 'review' })).body.error).toBe('invalid_payload');
      expect((await task('US-E4-03', FIRST, { status: 'done', x: 1 })).status).toBe(400);
      expect((await call('PATCH', '/api/stories/US-E4-03/tasks/x', { text: '{' })).body.error).toBe('invalid_json');
      expect((await task('US-999', FIRST, { status: 'done' })).status).toBe(404);
    });
  });

  it('works on plain-word task lists of a BMAD v6 project', async () => {
    await setup('bmad-sprint-status');
    const res = await task('US-E1-01', 'First task', { status: 'done' });
    expect(res.status).toBe(200);
    expect((await ssy()).stories['US-E1-01'].tasks).toMatchObject({
      total: 2,
      completed: 1,
      status: { 'First task': 'done' },
    });
  });
});

describe('POST /api/stories/:id/tasks', () => {
  const add = (id, body, headers) => call('POST', `/api/stories/${id}/tasks`, { body, headers });

  beforeEach(() => setup('wrandly-anon'));

  it('adds a to-do task to a story without tasks: list, status and counters written', async () => {
    const res = await add('US-E4-08', { title: '  Write the store listing  ' });
    expect(res.status).toBe(201);
    expect(res.body.version).toMatch(/^[0-9a-f]{12}$/);
    const tasks = (await ssy()).stories['US-E4-08'].tasks;
    expect(tasks).toEqual({ total: 1, completed: 0, list: ['Write the store listing'], status: { 'Write the store listing': 'to-do' } });
    expect(res.body.story.tasks).toMatchObject({ total: 1, completed: 0 });
    expect(res.body.story._rev).toBe(revOf((await ssy()).stories['US-E4-08']));
    expect(events.at(-1)).toMatchObject({ event: 'story:updated', payload: { id: 'US-E4-08' } });
    expect(await rawYaml()).toContain('# Sprints clôturés.');
  });

  it('adds a task to a counter-only story without losing the done count', async () => {
    await add('US-E4-03', { title: 'Docs' });
    const tasks = (await ssy()).stories['US-E4-03'].tasks;
    expect(tasks).toMatchObject({ total: 6, completed: 3 });
    expect(tasks.status.Docs).toBe('to-do');
    expect(Object.values(tasks.status).filter((s) => s === 'done')).toHaveLength(3);
  });

  it('a story created on the board can reach review once its tasks are done', async () => {
    const created = await call('POST', '/api/stories', { body: { title: 'Gate path', story_points: 3 } });
    const id = created.body.story.id;
    await add(id, { title: 'Only task' });
    await call('PATCH', `/api/stories/${id}/tasks/${encodeURIComponent('Only task')}`, { body: { status: 'done' } });
    for (const status of ['ready-for-dev', 'in-progress', 'review']) {
      expect((await call('PATCH', `/api/stories/${id}/status`, { body: { status } })).status).toBe(200);
    }
  });

  it('409 task_exists for a duplicate name, 400 for an empty or unknown field; nothing written', async () => {
    await add('US-E4-08', { title: 'Same' });
    const before = await rawYaml();
    expect((await add('US-E4-08', { title: 'Same' })).body.error).toBe('task_exists');
    expect((await add('US-E4-08', { title: '   ' })).body.error).toBe('invalid_payload');
    expect((await add('US-E4-08', { title: 'x', status: 'done' })).body.error).toBe('invalid_payload');
    expect(await rawYaml()).toBe(before);
  });

  it('409 archived / read_only_source, 404 unknown story, 409 conflict on a stale If-Match', async () => {
    expect((await add('US-E0-01', { title: 'x' })).body.error).toBe('archived');
    expect((await add('US-200', { title: 'x' })).body.error).toBe('read_only_source');
    expect((await add('US-999', { title: 'x' })).status).toBe(404);
    const stale = await add('US-E4-08', { title: 'x' }, { 'If-Match': 'deadbeef0000' });
    expect(stale.status).toBe(409);
    expect(stale.body.error).toBe('conflict');
  });

  it('403 readonly on a read-only server', async () => {
    await rm(dir, { recursive: true, force: true });
    await setup('wrandly-anon', { readonly: true });
    expect((await add('US-E4-08', { title: 'x' })).status).toBe(403);
  });
});

describe('PATCH /api/stories/:id/status — unchanged behavior', () => {
  beforeEach(() => setup('bmad-sprint-status'));

  it('still answers { story, version } with the story _rev', async () => {
    const res = await call('PATCH', '/api/stories/US-E1-01/status', { body: { status: 'in-progress' } });
    expect(res.status).toBe(200);
    expect(res.body.story._rev).toBe(revOf((await ssy()).stories['US-E1-01']));
    expect(res.body.version).toMatch(/^[0-9a-f]{12}$/);
  });
});

describe('PATCH /api/stories/:id/status — WIP limits', () => {
  beforeEach(() => setup('bmad-sprint-status'));

  const move = (id, status) => call('PATCH', `/api/stories/${id}/status`, { body: { status } });
  const limit = (n) => writeFile(inRoot('.bmad', 'kanban.yaml'), `version: 1\nwip_limits:\n  in-progress: ${n}\n`);

  it('warns wip_exceeded when the target column goes over its limit; the move still happens', async () => {
    await limit(1);
    await call('PATCH', '/api/stories/US-E1-01/status', { body: { status: 'in-progress' } });

    const res = await move('US-E1-02', 'in-progress');

    expect(res.status).toBe(200);
    expect(res.body.warnings).toEqual(['wip_exceeded']);
    expect(res.body.story.status).toBe('in-progress');
    expect((await ssy()).stories['US-E1-02'].status).toBe('in-progress');
  });

  it('counts only the stories shown on the board (active sprint), like the column header', async () => {
    await limit(1);
    const created = await call('POST', '/api/stories', { body: { title: 'Outside the sprint', story_points: 2 } });
    const outside = created.body.story.id;
    await move(outside, 'ready-for-dev');
    expect((await move(outside, 'in-progress')).status).toBe(200);

    const res = await move('US-E1-01', 'in-progress');
    expect(res.body.warnings).toBeUndefined();
  });

  it('no warning within the limit, without a limit file, or for another column', async () => {
    expect((await move('US-E1-01', 'in-progress')).body.warnings).toBeUndefined();
    await limit(2);
    expect((await move('US-E1-02', 'in-progress')).body.warnings).toBeUndefined();
    expect((await move('US-E1-02', 'blocked')).body.warnings).toBeUndefined();
  });
});

describe('guards cover the write routes', () => {
  const ROUTES = [
    ['PATCH', '/api/stories/US-E1-01', { story_points: 1 }],
    ['PUT', '/api/stories/US-100/body', { markdown: 'x', expected_mtime: 1 }],
    ['POST', '/api/stories', { title: 'T' }],
    ['DELETE', '/api/stories/US-E1-01', undefined],
    ['PATCH', '/api/stories/US-E1-01/tasks/First%20task', { status: 'done' }],
    ['PATCH', '/api/stories/US-E1-01/status', { status: 'in-progress' }],
  ];

  describe('foreign origin', () => {
    beforeEach(() => setup('bmad-sprint-status'));

    it.each(ROUTES)('%s %s is a 403 without the local origin', async (method, url, body) => {
      const before = await rawYaml();
      for (const origin of ['http://evil.example', `http://127.0.0.1:${PORT + 1}`, null]) {
        const res = await call(method, url, { body, origin });
        expect(res.status).toBe(403);
        expect(res.body.error).toBe('forbidden');
      }
      expect(await rawYaml()).toBe(before);
      expect(await readdir(inRoot(STORIES))).toEqual(['US-100-existing.md']);
    });
  });

  describe('--readonly', () => {
    beforeEach(() => setup('bmad-sprint-status', { readonly: true }));

    it.each(ROUTES)('%s %s is a 403 readonly', async (method, url, body) => {
      const before = await rawYaml();
      const res = await call(method, url, { body });
      expect(res.status).toBe(403);
      expect(res.body.error).toBe('readonly');
      expect(await rawYaml()).toBe(before);
      expect(await readdir(inRoot(STORIES))).toEqual(['US-100-existing.md']);
    });

    it('reads stay available', async () => {
      expect((await call('GET', '/api/stories')).status).toBe(200);
    });
  });
});

describe('repository precedence for stories tracked by the YAML', () => {
  it('exposes _rev only for stories the YAML tracks', async () => {
    await setup('wrandly-anon');
    const byId = Object.fromEntries(repo.listStories().map((s) => [s.id, s]));
    expect(byId['US-E4-03']._rev).toBe(revOf((await ssy()).stories['US-E4-03']));
    expect(byId['US-E0-01']._rev).toBeUndefined(); // archived
    expect(byId['US-200']._rev).toBeUndefined(); // markdown only
  });
});
