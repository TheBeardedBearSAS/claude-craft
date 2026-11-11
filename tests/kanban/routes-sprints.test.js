import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { createHash } from 'node:crypto';
import { cp, mkdir, mkdtemp, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as jsYaml from 'js-yaml';
import { Repository } from '../../cli/kanban/server/services/repository.js';
import { createApp } from '../../cli/kanban/server/app.js';
import { EventBus } from '../../cli/kanban/server/services/event-bus.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const WRANDLY = path.resolve(__dirname, '../fixtures/wrandly-anon');
const PORT = 3737;
const ORIGIN = `http://localhost:${PORT}`;

const ACTIVE_YAML = `# header comment
version: "1.0"

metadata:
  sprint_id: "sprint-1-alpha"
  name: "Alpha"
  start_date: "2026-11-02"
  end_date: "2026-11-13"
  goal: "Ship alpha"
  epic: "E1"

# closed sprints
archived_sprints:
  sprint-0-boot:
    name: "Boot"
    closed_date: "2026-10-30"
    points_delivered: 8
    stories:
      US-000: { status: done, points: 8 }

stories:
  US-001:
    title: "One"
    status: "done"
    story_points: 5
  US-002:
    title: "Two"
    status: "in-progress"
    story_points: 3
  US-003:
    title: "Three"
    status: "done"
    story_points: 2
    sprint_id: "sprint-1-alpha"
  US-004:
    title: "Four"
    status: "ready-for-dev"
    story_points: 8
    sprint_id: "sprint-2-beta"
`;

const CLOSED_YAML = ACTIVE_YAML.replace('  epic: "E1"\n', '  epic: "E1"\n  closed_date: "2026-11-13"\n');

let dir;
let app;
let bus;
let events;

const yamlPath = () => path.join(dir, '.bmad', 'sprint-status.yaml');
const readYaml = async () => jsYaml.load(await readFile(yamlPath(), 'utf8'));
const sha12 = (text) => createHash('sha1').update(text).digest('hex').slice(0, 12);

async function sprintDir(id, goal) {
  const d = path.join(dir, 'project-management', 'sprints', id);
  await mkdir(d, { recursive: true });
  await writeFile(path.join(d, 'sprint-goal.md'), goal ?? `# Sprint X : ${id}\n`);
}

async function boot({ readonly = false } = {}) {
  const repo = new Repository(path.join(dir, 'project-management'));
  await repo.refresh();
  bus = new EventBus();
  events = [];
  bus.subscribe((m) => events.push(m));
  app = createApp({ repository: repo, port: PORT, eventBus: bus, projectRoot: dir, readonly });
}

const req = (method, url, { body, raw, origin = ORIGIN } = {}) => {
  const headers = { 'Content-Type': 'application/json' };
  if (origin) headers.Origin = origin;
  return app.request(url, { method, headers, body: raw ?? (body === undefined ? undefined : JSON.stringify(body)) });
};

beforeEach(async () => {
  dir = await mkdtemp(path.join(tmpdir(), 'kanban-sprints-'));
  await mkdir(path.join(dir, 'project-management', 'sprints'), { recursive: true });
  await mkdir(path.join(dir, '.bmad'), { recursive: true });
});
afterEach(async () => {
  vi.useRealTimers();
  await rm(dir, { recursive: true, force: true });
});

const NEW = {
  name: 'Hardening',
  start_date: '2026-11-16',
  end_date: '2026-11-27',
  goal: 'Make it solid',
  capacity_points: 13,
};

describe('POST /api/sprints', () => {
  it('creates sprint-<N>-<slug>/sprint-goal.md and answers 201 with the planned sprint', async () => {
    await sprintDir('sprint-4-old');
    await boot();

    const res = await req('POST', '/api/sprints', { body: NEW });

    expect(res.status).toBe(201);
    expect(await res.json()).toEqual({
      sprint: {
        id: 'sprint-5-hardening',
        name: 'Hardening',
        start_date: '2026-11-16',
        end_date: '2026-11-27',
        goal: 'Make it solid',
        capacity_points: 13,
        state: 'planned',
      },
    });
    const md = await readFile(path.join(dir, 'project-management/sprints/sprint-5-hardening/sprint-goal.md'), 'utf8');
    expect(md).toContain('# Sprint 5 : Hardening');
    expect(md).toContain('| Début | 2026-11-16 |');
    expect(md).toContain('| Fin | 2026-11-27 |');
    expect(md).toContain('| Capacité | 13 points |');
    expect(md).toContain('> Make it solid');
  });

  it('numbers after the highest sprint of the directories and of the status file', async () => {
    await sprintDir('sprint-2-a');
    await writeFile(yamlPath(), ACTIVE_YAML.replace('sprint-0-boot', 'sprint-7-zeta'));
    await boot();

    const res = await req('POST', '/api/sprints', { body: { ...NEW, name: 'Next' } });

    expect((await res.json()).sprint.id).toBe('sprint-8-next');
  });

  it('starts at 1 in an empty project and omits absent optional fields', async () => {
    await boot();
    const res = await req('POST', '/api/sprints', {
      body: { name: 'Éclair', start_date: '2026-01-01', end_date: '2026-01-01' },
    });
    expect((await res.json()).sprint).toEqual({
      id: 'sprint-1-eclair',
      name: 'Éclair',
      start_date: '2026-01-01',
      end_date: '2026-01-01',
      goal: '',
      state: 'planned',
    });
  });

  it('never writes sprint-status.yaml', async () => {
    await writeFile(yamlPath(), ACTIVE_YAML);
    await boot();
    await req('POST', '/api/sprints', { body: NEW });
    expect(await readFile(yamlPath(), 'utf8')).toBe(ACTIVE_YAML);
    expect(await readdir(path.join(dir, '.bmad'))).toEqual(['sprint-status.yaml']);
  });

  it('refuses a second sprint with the same name: 409 sprint_exists', async () => {
    await boot();
    expect((await req('POST', '/api/sprints', { body: NEW })).status).toBe(201);
    const res = await req('POST', '/api/sprints', { body: NEW });
    expect(res.status).toBe(409);
    expect(await res.json()).toEqual({ error: 'sprint_exists' });
    expect(await readdir(path.join(dir, 'project-management/sprints'))).toEqual(['sprint-1-hardening']);
  });

  it('is exposed to the board: GET /api/sprints lists it as planned, event published', async () => {
    await boot();
    await req('POST', '/api/sprints', { body: NEW });

    const list = await (await req('GET', '/api/sprints')).json();

    expect(list.sprints.find((s) => s.id === 'sprint-1-hardening')).toMatchObject({
      state: 'planned',
      name: 'Hardening',
    });
    expect(events.filter((e) => e.event === 'sprint:updated').map((e) => e.payload)).toEqual([
      { id: 'sprint-1-hardening', state: 'planned' },
    ]);
  });

  it('GET /api/sprints and /api/sprints/:id give the dates and capacity of a planned sprint', async () => {
    await boot();
    await req('POST', '/api/sprints', { body: NEW });
    const expected = { start_date: '2026-11-16', end_date: '2026-11-27', capacity_points: 13 };

    const list = await (await req('GET', '/api/sprints')).json();
    expect(list.sprints.find((s) => s.id === 'sprint-1-hardening')).toMatchObject(expected);
    const one = await (await req('GET', '/api/sprints/sprint-1-hardening')).json();
    expect(one.sprint).toMatchObject(expected);
  });

  it('GET /api/sprints gives the capacity and dates of the active sprint from the status file', async () => {
    await writeFile(yamlPath(), ACTIVE_YAML.replace('  epic: "E1"\n', '  epic: "E1"\n  capacity_points: 21\n'));
    await sprintDir('sprint-1-alpha');
    await sprintDir('sprint-0-boot');
    await boot();
    const list = await (await req('GET', '/api/sprints')).json();
    const active = list.sprints.find((s) => s.id === 'sprint-1-alpha');
    expect(active).toMatchObject({ start_date: '2026-11-02', end_date: '2026-11-13', capacity_points: 21 });
    expect((await (await req('GET', '/api/sprints/sprint-1-alpha')).json()).sprint.capacity_points).toBe(21);
    // A closed sprint has no capacity to plan against: the key is absent.
    expect(list.sprints.find((s) => s.id === 'sprint-0-boot')).not.toHaveProperty('capacity_points');
  });

  it('keeps a hostile name inside project-management/sprints/', async () => {
    await boot();
    const res = await req('POST', '/api/sprints', { body: { ...NEW, name: '../../../../etc/cron.d/x' } });

    const { sprint } = await res.json();
    expect(sprint.id).toBe('sprint-1-etc-cron-d-x');
    expect(sprint.id).not.toMatch(/[./\\]/);
    expect((await readdir(dir)).sort()).toEqual(['.bmad', 'project-management']);
    expect(await readdir(path.join(dir, 'project-management'))).toEqual(['sprints']);
  });

  it('answers without any absolute path', async () => {
    await boot();
    const text = await (await req('POST', '/api/sprints', { body: NEW })).text();
    expect(text).not.toContain(dir);
    expect(text).not.toContain('project-management');
  });

  it('keeps a multi-line goal on one line', async () => {
    await boot();
    const res = await req('POST', '/api/sprints', { body: { ...NEW, goal: 'line one\n\n## Evil\nline two' } });
    expect((await res.json()).sprint.goal).toBe('line one ## Evil line two');
    const md = await readFile(path.join(dir, 'project-management/sprints/sprint-1-hardening/sprint-goal.md'), 'utf8');
    expect(md).not.toMatch(/^## Evil/m);
  });

  describe('validation and guards', () => {
    beforeEach(boot);

    it('400 invalid_payload with issues', async () => {
      const res = await req('POST', '/api/sprints', { body: { ...NEW, end_date: '2026-11-01' } });
      expect(res.status).toBe(400);
      const body = await res.json();
      expect(body.error).toBe('invalid_payload');
      expect(body.issues[0].path).toEqual(['end_date']);
    });

    it('400 on an unknown key', async () => {
      const res = await req('POST', '/api/sprints', { body: { ...NEW, id: 'sprint-99-x' } });
      expect(res.status).toBe(400);
      expect((await res.json()).error).toBe('invalid_payload');
    });

    it('400 invalid_json', async () => {
      const res = await req('POST', '/api/sprints', { raw: '{nope' });
      expect(res.status).toBe(400);
      expect(await res.json()).toEqual({ error: 'invalid_json' });
    });

    it('403 from a foreign origin or without origin, nothing created', async () => {
      expect((await req('POST', '/api/sprints', { body: NEW, origin: 'http://evil.example' })).status).toBe(403);
      expect((await req('POST', '/api/sprints', { body: NEW, origin: null })).status).toBe(403);
      expect(await readdir(path.join(dir, 'project-management/sprints'))).toEqual([]);
    });

    it('413 over the body limit', async () => {
      const res = await req('POST', '/api/sprints', { raw: JSON.stringify({ ...NEW, goal: 'x'.repeat(70_000) }) });
      expect(res.status).toBe(413);
    });
  });

  it('403 readonly', async () => {
    await boot({ readonly: true });
    const res = await req('POST', '/api/sprints', { body: NEW });
    expect(res.status).toBe(403);
    expect((await res.json()).error).toBe('readonly');
    expect(await readdir(path.join(dir, 'project-management/sprints'))).toEqual([]);
  });
});

describe('POST /api/sprints with an Idempotency-Key', () => {
  const KEY = 'b7a1c2d3-0000-4000-8000-123456789abc';
  const send = (body, key = KEY) =>
    app.request('/api/sprints', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Origin: ORIGIN, 'Idempotency-Key': key },
      body: JSON.stringify(body),
    });
  const dirs = () => readdir(path.join(dir, 'project-management', 'sprints'));

  beforeEach(boot);

  it('a second request with the same key replays the first answer and creates nothing', async () => {
    const first = await send(NEW);
    const second = await send(NEW);
    expect(first.status).toBe(201);
    expect(second.status).toBe(201);
    expect(await second.json()).toEqual(await first.json());
    expect(await dirs()).toEqual(['sprint-1-hardening']);
  });

  it('two requests in the same tick create a single sprint', async () => {
    const [a, b] = await Promise.all([send(NEW), send(NEW)]);
    expect([a.status, b.status]).toEqual([201, 201]);
    expect((await a.json()).sprint.id).toBe((await b.json()).sprint.id);
    expect(await dirs()).toHaveLength(1);
  });

  it('another key is another request: the duplicate name is refused', async () => {
    await send(NEW);
    const other = await send(NEW, 'another-key-0001');
    expect(other.status).toBe(409);
  });

  it('a refused first request is not remembered: the retry with the same key is evaluated again', async () => {
    expect((await send({ ...NEW, name: '' })).status).toBe(400);
    expect((await send(NEW)).status).toBe(201);
  });

  it('refuses a malformed key with 400 invalid_idempotency_key', async () => {
    const res = await send(NEW, 'short');
    expect(res.status).toBe(400);
    expect((await res.json()).error).toBe('invalid_idempotency_key');
    expect(await dirs()).toEqual([]);
  });

  it('still behaves without the header', async () => {
    expect((await req('POST', '/api/sprints', { body: NEW })).status).toBe(201);
  });
});

describe('POST /api/sprints/:id/start', () => {
  const GOAL = renderGoal();
  function renderGoal() {
    return `# Sprint 3 : Gamma

## Informations

| Attribut | Valeur |
|----------|--------|
| Numéro | 3 |
| Début | 2026-11-16 |
| Fin | 2026-11-27 |
| Capacité | 13 points |

## Sprint Goal

> Land gamma
`;
  }

  it('creates sprint-status.yaml when absent, with the metadata read from the sprint directory', async () => {
    await sprintDir('sprint-3-gamma', GOAL);
    await boot();

    const res = await req('POST', '/api/sprints/sprint-3-gamma/start', { body: {} });

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.sprint).toEqual({
      id: 'sprint-3-gamma',
      name: 'Gamma',
      start_date: '2026-11-16',
      end_date: '2026-11-27',
      goal: 'Land gamma',
      capacity_points: 13,
      state: 'active',
    });
    expect(body.version).toMatch(/^[0-9a-f]{12}$/);
    const ss = await readYaml();
    expect(ss.metadata).toEqual({
      sprint_id: 'sprint-3-gamma',
      name: 'Gamma',
      start_date: '2026-11-16',
      end_date: '2026-11-27',
      goal: 'Land gamma',
      capacity_points: 13,
    });
    expect(body.version).toBe(sha12(await readFile(yamlPath(), 'utf8')));
  });

  it('accepts an empty body, publishes sprint:updated and exposes the sprint as active', async () => {
    await sprintDir('sprint-3-gamma', GOAL);
    await boot();

    const res = await req('POST', '/api/sprints/sprint-3-gamma/start');

    expect(res.status).toBe(200);
    expect(events.map((e) => [e.event, e.payload])).toContainEqual([
      'sprint:updated',
      { id: 'sprint-3-gamma', state: 'active' },
    ]);
    const list = await (await req('GET', '/api/sprints')).json();
    expect(list.sprints.find((s) => s.id === 'sprint-3-gamma').state).toBe('active');
  });

  it('replaces the closed sprint metadata but keeps comments, archives and stories', async () => {
    await writeFile(yamlPath(), CLOSED_YAML);
    await sprintDir('sprint-3-gamma', GOAL);
    await boot();

    const res = await req('POST', '/api/sprints/sprint-3-gamma/start', { body: {} });

    expect(res.status).toBe(200);
    const text = await readFile(yamlPath(), 'utf8');
    expect(text).toContain('# header comment');
    expect(text).toContain('# closed sprints');
    expect(text).toContain('      US-000: { status: done, points: 8 }');
    const ss = jsYaml.load(text);
    expect(ss.metadata.sprint_id).toBe('sprint-3-gamma');
    expect(ss.metadata).not.toHaveProperty('closed_date');
    expect(ss.metadata).not.toHaveProperty('epic');
    expect(Object.keys(ss.stories)).toEqual(['US-001', 'US-002', 'US-003', 'US-004']);
  });

  it('falls back to the id and empty dates for a free-form sprint-goal.md', async () => {
    await sprintDir('sprint-3-gamma', 'Just some words\n');
    await boot();
    const body = await (await req('POST', '/api/sprints/sprint-3-gamma/start', { body: {} })).json();
    expect(body.sprint).toMatchObject({ name: 'sprint-3-gamma', start_date: '', end_date: '', goal: '' });
  });

  it('404 for an unknown sprint, an invalid id or a sprint known only by the status file', async () => {
    await writeFile(yamlPath(), CLOSED_YAML);
    await boot();
    for (const id of ['sprint-9-nope', 'bad%20id', 'a%2Fb', 'sprint-0-boot']) {
      const res = await req('POST', `/api/sprints/${id}/start`, { body: {} });
      expect(res.status, id).toBe(404);
      expect(await res.json()).toEqual({ error: 'not_found' });
    }
    expect(await readFile(yamlPath(), 'utf8')).toBe(CLOSED_YAML);
  });

  it('409 sprint_already_active with the active sprint, file untouched', async () => {
    await writeFile(yamlPath(), ACTIVE_YAML);
    await sprintDir('sprint-3-gamma', GOAL);
    await boot();

    const res = await req('POST', '/api/sprints/sprint-3-gamma/start', { body: {} });

    expect(res.status).toBe(409);
    expect(await res.json()).toEqual({
      error: 'sprint_already_active',
      active: { id: 'sprint-1-alpha', name: 'Alpha' },
    });
    expect(await readFile(yamlPath(), 'utf8')).toBe(ACTIVE_YAML);
  });

  it('409 sprint_closed for a closed sprint that still has its directory', async () => {
    await writeFile(yamlPath(), CLOSED_YAML);
    await sprintDir('sprint-0-boot');
    await boot();
    const res = await req('POST', '/api/sprints/sprint-0-boot/start', { body: {} });
    expect(res.status).toBe(409);
    expect(await res.json()).toEqual({ error: 'sprint_closed' });
  });

  it('expected_version: 409 conflict when stale, accepted when it matches', async () => {
    await writeFile(yamlPath(), CLOSED_YAML);
    await sprintDir('sprint-3-gamma', GOAL);
    await boot();

    const stale = await req('POST', '/api/sprints/sprint-3-gamma/start', {
      body: { expected_version: 'aaaaaaaaaaaa' },
    });
    expect(stale.status).toBe(409);
    expect((await stale.json()).error).toBe('conflict');
    expect(await readFile(yamlPath(), 'utf8')).toBe(CLOSED_YAML);

    const fresh = await req('POST', '/api/sprints/sprint-3-gamma/start', {
      body: { expected_version: sha12(CLOSED_YAML) },
    });
    expect(fresh.status).toBe(200);
  });

  it('409 sprint_status_invalid when the status file is not understood, file untouched', async () => {
    await writeFile(yamlPath(), 'metadata: 3\n');
    await sprintDir('sprint-3-gamma', GOAL);
    await boot();
    const res = await req('POST', '/api/sprints/sprint-3-gamma/start', { body: {} });
    expect(res.status).toBe(409);
    expect((await res.json()).error).toBe('sprint_status_invalid');
    expect(await readFile(yamlPath(), 'utf8')).toBe('metadata: 3\n');
  });

  it('answers without any absolute path', async () => {
    await sprintDir('sprint-3-gamma', GOAL);
    await boot();
    const text = await (await req('POST', '/api/sprints/sprint-3-gamma/start', { body: {} })).text();
    expect(text).not.toContain(dir);
  });

  describe('validation and guards', () => {
    beforeEach(async () => {
      await sprintDir('sprint-3-gamma', GOAL);
      await boot();
    });

    it('400 on an unknown key, an empty expected_version or invalid JSON', async () => {
      const bad = await req('POST', '/api/sprints/sprint-3-gamma/start', { body: { carry_over: 'backlog' } });
      expect(bad.status).toBe(400);
      expect((await bad.json()).error).toBe('invalid_payload');
      expect((await req('POST', '/api/sprints/sprint-3-gamma/start', { body: { expected_version: '' } })).status).toBe(
        400
      );
      const json = await req('POST', '/api/sprints/sprint-3-gamma/start', { raw: '{nope' });
      expect(json.status).toBe(400);
      expect(await json.json()).toEqual({ error: 'invalid_json' });
    });

    it('403 from a foreign origin, nothing written', async () => {
      const res = await req('POST', '/api/sprints/sprint-3-gamma/start', { body: {}, origin: 'http://evil.example' });
      expect(res.status).toBe(403);
      expect(await readdir(path.join(dir, '.bmad'))).toEqual([]);
    });
  });

  it('403 readonly', async () => {
    await sprintDir('sprint-3-gamma', GOAL);
    await boot({ readonly: true });
    const res = await req('POST', '/api/sprints/sprint-3-gamma/start', { body: {} });
    expect(res.status).toBe(403);
    expect((await res.json()).error).toBe('readonly');
    expect(await readdir(path.join(dir, '.bmad'))).toEqual([]);
  });
});

describe('POST /api/sprints/:id/close', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date('2026-11-13T10:00:00Z'));
  });

  it('archives done stories, keeps the others in the backlog and answers with the figures', async () => {
    await writeFile(yamlPath(), ACTIVE_YAML);
    await boot();

    const res = await req('POST', '/api/sprints/sprint-1-alpha/close', { body: { carry_over: 'backlog' } });

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toEqual({
      sprint: {
        id: 'sprint-1-alpha',
        name: 'Alpha',
        state: 'closed',
        closed_date: '2026-11-13',
        points_committed: 10,
        points_delivered: 7,
      },
      archived: ['US-001', 'US-003'],
      carried_over: { to: 'backlog', stories: ['US-002'] },
      version: expect.stringMatching(/^[0-9a-f]{12}$/),
    });
    const ss = await readYaml();
    expect(ss.archived_sprints['sprint-1-alpha']).toEqual({
      name: 'Alpha',
      epic: 'E1',
      closed_date: '2026-11-13',
      points_committed: 10,
      points_delivered: 7,
      stories: { 'US-001': { status: 'done', points: 5 }, 'US-003': { status: 'done', points: 2 } },
    });
    expect(Object.keys(ss.stories)).toEqual(['US-002', 'US-004']);
    expect(ss.stories['US-002']).toMatchObject({ status: 'in-progress', sprint_id: null });
    expect(ss.stories['US-004']).toEqual({
      title: 'Four',
      status: 'ready-for-dev',
      story_points: 8,
      sprint_id: 'sprint-2-beta',
    });
    expect(ss.metadata.closed_date).toBe('2026-11-13');
    expect(body.version).toBe(sha12(await readFile(yamlPath(), 'utf8')));
  });

  it('keeps the comments and the existing archives byte for byte', async () => {
    await writeFile(yamlPath(), ACTIVE_YAML);
    await boot();
    await req('POST', '/api/sprints/sprint-1-alpha/close', { body: {} });
    const text = await readFile(yamlPath(), 'utf8');
    expect(text).toContain('# header comment');
    expect(text).toContain('# closed sprints');
    expect(text).toContain(
      '  sprint-0-boot:\n    name: "Boot"\n    closed_date: "2026-10-30"\n    points_delivered: 8\n'
    );
    expect(text).toContain('      US-000: { status: done, points: 8 }');
  });

  it('carries unfinished stories to a planned sprint', async () => {
    await writeFile(yamlPath(), ACTIVE_YAML);
    await sprintDir('sprint-2-beta');
    await boot();

    const res = await req('POST', '/api/sprints/sprint-1-alpha/close', { body: { carry_over: 'sprint-2-beta' } });

    expect(res.status).toBe(200);
    expect((await res.json()).carried_over).toEqual({ to: 'sprint-2-beta', stories: ['US-002'] });
    expect((await readYaml()).stories['US-002'].sprint_id).toBe('sprint-2-beta');
  });

  it('defaults carry_over to backlog', async () => {
    await writeFile(yamlPath(), ACTIVE_YAML);
    await boot();
    const res = await req('POST', '/api/sprints/sprint-1-alpha/close');
    expect((await res.json()).carried_over.to).toBe('backlog');
  });

  it('publishes sprint:updated and refreshes the board', async () => {
    await writeFile(yamlPath(), ACTIVE_YAML);
    await boot();
    await req('POST', '/api/sprints/sprint-1-alpha/close', { body: {} });

    expect(events.filter((e) => e.event === 'sprint:updated').map((e) => e.payload)).toEqual([
      { id: 'sprint-1-alpha', state: 'closed' },
    ]);
    const { stories } = await (await req('GET', '/api/stories')).json();
    const byId = Object.fromEntries(stories.map((s) => [s.id, s]));
    expect(byId['US-002'].sprint_id).toBeNull();
    expect(byId['US-001']).toMatchObject({ sprint_id: 'sprint-1-alpha', status: 'done', _source: 'archived' });
  });

  it('409 not_active for another sprint, a closed sprint or a missing status file', async () => {
    await boot();
    const none = await req('POST', '/api/sprints/sprint-1-alpha/close', { body: {} });
    expect(none.status).toBe(409);
    expect(await none.json()).toEqual({ error: 'not_active' });

    await writeFile(yamlPath(), ACTIVE_YAML);
    await boot();
    for (const id of ['sprint-2-beta', 'sprint-0-boot']) {
      const res = await req('POST', `/api/sprints/${id}/close`, { body: {} });
      expect(res.status, id).toBe(409);
      expect(await res.json()).toEqual({ error: 'not_active' });
    }
    expect(await readFile(yamlPath(), 'utf8')).toBe(ACTIVE_YAML);
  });

  it('409 not_active the second time', async () => {
    await writeFile(yamlPath(), ACTIVE_YAML);
    await boot();
    expect((await req('POST', '/api/sprints/sprint-1-alpha/close', { body: {} })).status).toBe(200);
    expect((await req('POST', '/api/sprints/sprint-1-alpha/close', { body: {} })).status).toBe(409);
  });

  it('409 sprint_not_found for an unknown, closed or identical target, file untouched', async () => {
    await writeFile(yamlPath(), ACTIVE_YAML);
    await sprintDir('sprint-0-boot');
    await boot();
    for (const carry_over of ['sprint-9-nope', 'sprint-0-boot', 'sprint-1-alpha']) {
      const res = await req('POST', '/api/sprints/sprint-1-alpha/close', { body: { carry_over } });
      expect(res.status, carry_over).toBe(409);
      expect(await res.json()).toEqual({ error: 'sprint_not_found' });
    }
    expect(await readFile(yamlPath(), 'utf8')).toBe(ACTIVE_YAML);
  });

  it('expected_version: 409 conflict when stale, accepted when it matches', async () => {
    await writeFile(yamlPath(), ACTIVE_YAML);
    await boot();
    const stale = await req('POST', '/api/sprints/sprint-1-alpha/close', {
      body: { expected_version: 'aaaaaaaaaaaa' },
    });
    expect(stale.status).toBe(409);
    expect((await stale.json()).error).toBe('conflict');
    expect(await readFile(yamlPath(), 'utf8')).toBe(ACTIVE_YAML);
    const fresh = await req('POST', '/api/sprints/sprint-1-alpha/close', {
      body: { expected_version: sha12(ACTIVE_YAML) },
    });
    expect(fresh.status).toBe(200);
  });

  it('409 sprint_status_invalid on an incomprehensible file', async () => {
    await writeFile(yamlPath(), 'metadata: 3\n');
    await boot();
    const res = await req('POST', '/api/sprints/sprint-1-alpha/close', { body: {} });
    expect(res.status).toBe(409);
    expect((await res.json()).error).toBe('sprint_status_invalid');
  });

  describe('validation and guards', () => {
    beforeEach(async () => {
      await writeFile(yamlPath(), ACTIVE_YAML);
      await boot();
    });

    it('400 for a carry_over that is not a sprint id, an unknown key or invalid JSON', async () => {
      for (const body of [{ carry_over: '../x' }, { carry_over: 'a/b' }, { carry_over: 3 }, { archive: true }]) {
        const res = await req('POST', '/api/sprints/sprint-1-alpha/close', { body });
        expect(res.status, JSON.stringify(body)).toBe(400);
        expect((await res.json()).error).toBe('invalid_payload');
      }
      const json = await req('POST', '/api/sprints/sprint-1-alpha/close', { raw: 'nope' });
      expect(json.status).toBe(400);
      expect(await json.json()).toEqual({ error: 'invalid_json' });
      expect(await readFile(yamlPath(), 'utf8')).toBe(ACTIVE_YAML);
    });

    it('404 for an invalid id in the path', async () => {
      const res = await req('POST', '/api/sprints/bad%20id/close', { body: {} });
      expect(res.status).toBe(404);
    });

    it('403 from a foreign origin or without origin, file untouched', async () => {
      expect(
        (await req('POST', '/api/sprints/sprint-1-alpha/close', { body: {}, origin: 'http://evil.example' })).status
      ).toBe(403);
      expect((await req('POST', '/api/sprints/sprint-1-alpha/close', { body: {}, origin: null })).status).toBe(403);
      expect(await readFile(yamlPath(), 'utf8')).toBe(ACTIVE_YAML);
    });

    it('answers without any absolute path', async () => {
      const text = await (await req('POST', '/api/sprints/sprint-1-alpha/close', { body: {} })).text();
      expect(text).not.toContain(dir);
    });
  });

  it('403 readonly, file untouched', async () => {
    await writeFile(yamlPath(), ACTIVE_YAML);
    await boot({ readonly: true });
    const res = await req('POST', '/api/sprints/sprint-1-alpha/close', { body: {} });
    expect(res.status).toBe(403);
    expect((await res.json()).error).toBe('readonly');
    expect(await readFile(yamlPath(), 'utf8')).toBe(ACTIVE_YAML);
  });
});

describe('GET /api/velocity', () => {
  it('is empty without a status file', async () => {
    await boot();
    const res = await req('GET', '/api/velocity');
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ sprints: [], average: null });
  });

  it('lists the closed sprints oldest first with the average', async () => {
    await writeFile(yamlPath(), ACTIVE_YAML);
    await boot();
    expect(await (await req('GET', '/api/velocity')).json()).toEqual({
      sprints: [{ id: 'sprint-0-boot', name: 'Boot', closed_date: '2026-10-30', committed: 8, delivered: 8 }],
      average: 8,
    });
  });

  it('degrades to an empty answer on an invalid status file', async () => {
    vi.spyOn(globalThis.console, 'error').mockImplementation(() => {});
    await writeFile(yamlPath(), 'metadata: 3\n');
    await boot();
    expect(await (await req('GET', '/api/velocity')).json()).toEqual({ sprints: [], average: null });
  });
});

describe('state on the GET sprint routes', () => {
  beforeEach(async () => {
    await writeFile(yamlPath(), ACTIVE_YAML);
    await sprintDir('sprint-0-boot');
    await sprintDir('sprint-1-alpha');
    await sprintDir('sprint-2-beta');
    await boot();
  });

  it('GET /api/sprints', async () => {
    const { sprints } = await (await req('GET', '/api/sprints')).json();
    expect(Object.fromEntries(sprints.map((s) => [s.id, s.state]))).toEqual({
      'sprint-0-boot': 'closed',
      'sprint-1-alpha': 'active',
      'sprint-2-beta': 'planned',
    });
  });

  it('GET /api/sprints/:id', async () => {
    const get = async (id) => (await (await req('GET', `/api/sprints/${id}`)).json()).sprint.state;
    expect(await get('sprint-1-alpha')).toBe('active');
    expect(await get('sprint-0-boot')).toBe('closed');
    expect(await get('sprint-2-beta')).toBe('planned');
  });

  it('GET /api/sprints/current', async () => {
    const res = await req('GET', '/api/sprints/current');
    expect(res.status).toBe(200);
    expect((await res.json()).sprint).toMatchObject({ sprint_id: 'sprint-1-alpha', state: 'active' });
  });
});

describe('edge cases', () => {
  it('start works on an empty sprint directory (no sprint-goal.md): the id is the name', async () => {
    await mkdir(path.join(dir, 'project-management/sprints/sprint-3-gamma'));
    await boot();
    const res = await req('POST', '/api/sprints/sprint-3-gamma/start', { body: {} });
    expect(res.status).toBe(200);
    expect((await res.json()).sprint).toMatchObject({ id: 'sprint-3-gamma', name: 'sprint-3-gamma', start_date: '' });
  });

  it('a planned sprint without goal file keeps its id as name in the list and the detail', async () => {
    const d = path.join(dir, 'project-management/sprints/sprint-3-gamma');
    await mkdir(d);
    await writeFile(path.join(d, 'board.md'), '# board\n');
    await boot();
    const list = await (await req('GET', '/api/sprints')).json();
    expect(list.sprints.find((s) => s.id === 'sprint-3-gamma')).toMatchObject({
      name: 'sprint-3-gamma',
      state: 'planned',
    });
    const detail = await (await req('GET', '/api/sprints/sprint-3-gamma')).json();
    expect(detail.sprint).toMatchObject({ name: 'sprint-3-gamma', state: 'planned', has_goal: false });
  });

  it('the detail of a planned sprint takes name and dates from its sprint-goal.md', async () => {
    await boot();
    await req('POST', '/api/sprints', { body: NEW });
    const detail = await (await req('GET', '/api/sprints/sprint-1-hardening')).json();
    expect(detail.sprint).toMatchObject({
      name: 'Hardening',
      state: 'planned',
      start_date: '2026-11-16',
      end_date: '2026-11-27',
      has_goal: true,
    });
  });

  it('GET /api/sprints/current is 404 while the active sprint has no story', async () => {
    await writeFile(yamlPath(), ACTIVE_YAML.replace(/\nstories:[\s\S]*$/, '\nstories: {}\n'));
    await boot();
    expect((await req('GET', '/api/sprints/current')).status).toBe(404);
  });

  it('creating a sprint when sprints/ is not a directory is a generic 500 without detail', async () => {
    vi.spyOn(globalThis.console, 'error').mockImplementation(() => {});
    await rm(path.join(dir, 'project-management/sprints'), { recursive: true });
    await writeFile(path.join(dir, 'project-management/sprints'), 'not a directory');
    await boot();
    const res = await req('POST', '/api/sprints', { body: NEW });
    expect(res.status).toBe(500);
    expect(await res.json()).toEqual({ error: 'write_failed' });
  });

  it('creating a sprint creates the sprints/ directory when it is missing', async () => {
    await rm(path.join(dir, 'project-management/sprints'), { recursive: true });
    await boot();
    expect((await req('POST', '/api/sprints', { body: NEW })).status).toBe(201);
  });
});

describe('full lifecycle on a copy of the wrandly-anon fixture', () => {
  beforeEach(async () => {
    await rm(dir, { recursive: true, force: true });
    dir = await mkdtemp(path.join(tmpdir(), 'kanban-sprints-flow-'));
    await cp(WRANDLY, dir, { recursive: true });
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date('2026-08-08T10:00:00Z'));
    await boot();
  });

  it('create -> refused start -> close with carry-over to backlog -> start -> velocity -> board', async () => {
    const before = await readYaml();
    const active = before.metadata.sprint_id;
    const members = Object.entries(before.stories);
    const done = members.filter(([, s]) => s.status === 'done');
    const open = members.filter(([, s]) => s.status !== 'done');
    const points = (list) => list.reduce((n, [, s]) => n + (s.story_points ?? 0), 0);
    expect(open.length).toBeGreaterThan(0);

    // 1. create
    const created = await (await req('POST', '/api/sprints', { body: { ...NEW, name: 'Sprint dix' } })).json();
    const nextId = created.sprint.id;
    expect(nextId).toBe('sprint-10-sprint-dix');

    // 2. start refused while the active one is not closed
    const refused = await req('POST', `/api/sprints/${nextId}/start`, { body: {} });
    expect(refused.status).toBe(409);
    expect((await refused.json()).active.id).toBe(active);

    // 3. close the active sprint, unfinished stories go back to the backlog
    const closed = await req('POST', `/api/sprints/${active}/close`, { body: { carry_over: 'backlog' } });
    expect(closed.status).toBe(200);
    const closedBody = await closed.json();
    expect(closedBody.archived.sort()).toEqual(done.map(([id]) => id).sort());
    expect(closedBody.carried_over.stories.sort()).toEqual(open.map(([id]) => id).sort());
    expect(closedBody.sprint).toMatchObject({
      closed_date: '2026-08-08',
      points_committed: points(members),
      points_delivered: points(done),
    });

    // 4. start the new sprint
    const started = await req('POST', `/api/sprints/${nextId}/start`, { body: {} });
    expect(started.status).toBe(200);
    expect((await started.json()).sprint).toMatchObject({ id: nextId, state: 'active', name: 'Sprint dix' });

    // 5. the file: comments and previous archives survive
    const text = await readFile(yamlPath(), 'utf8');
    expect(text).toContain('# BMAD v6 - Sprint Status (ANONYMIZED FIXTURE');
    expect(text).toContain('# Sprints clôturés.');
    expect(text).toContain('      US-E0-01: { status: done, points: 3, commit: "a1b2c3d" }');
    const after = jsYaml.load(text);
    expect(Object.keys(after.archived_sprints).slice(0, 8)).toEqual(Object.keys(before.archived_sprints));
    expect(after.archived_sprints[active].closed_date).toBe('2026-08-08');
    expect(after.metadata.sprint_id).toBe(nextId);
    expect(after.metadata).not.toHaveProperty('closed_date');
    expect(Object.keys(after.stories).sort()).toEqual(open.map(([id]) => id).sort());
    expect(Object.values(after.stories).every((s) => s.sprint_id === null)).toBe(true);

    // 6. velocity
    const velocity = await (await req('GET', '/api/velocity')).json();
    expect(velocity.sprints.at(-1)).toEqual({
      id: active,
      name: before.metadata.name,
      closed_date: '2026-08-08',
      committed: points(members),
      delivered: points(done),
    });
    expect(velocity.sprints).toHaveLength(Object.keys(before.archived_sprints).length + 1);
    expect(velocity.average).toEqual(expect.any(Number));

    // 7. states
    const { sprints } = await (await req('GET', '/api/sprints')).json();
    const state = Object.fromEntries(sprints.map((s) => [s.id, s.state]));
    expect(state[nextId]).toBe('active');
    expect(state[active]).toBe('closed');
    expect(state['sprint-1-infrastructure']).toBe('closed');

    // 8. the board reflects it
    const { stories } = await (await req('GET', '/api/stories')).json();
    const byId = Object.fromEntries(stories.map((s) => [s.id, s]));
    for (const [id] of open) expect(byId[id].sprint_id).toBeNull();
    for (const [id] of done) expect(byId[id]).toMatchObject({ sprint_id: active, _source: 'archived' });
  });
});
