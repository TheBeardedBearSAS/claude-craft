/**
 * E2E API tests — full @hono/node-server boot against the anonymized "Atlas"
 * BMAD v6 fixture, exercising every route that feeds a kanban screen. Asserts
 * each screen receives COMPLETE and COHERENT data.
 *
 * The 6 screens are pure renderers of these payloads, so an end-to-end assertion
 * at the API boundary directly reproduces "info doesn't show / is incoherent".
 *
 * Written BEFORE the fixes (TDD red).
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { cp, mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { serve } from '@hono/node-server';
import { Repository } from '../../cli/kanban/server/services/repository.js';
import { createApp } from '../../cli/kanban/server/app.js';
import { EventBus } from '../../cli/kanban/server/services/event-bus.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FIXTURE = path.resolve(__dirname, '../fixtures/wrandly-anon');

let dir, server, port;

beforeAll(async () => {
  dir = await mkdtemp(path.join(tmpdir(), 'kb-wrandly-e2e-'));
  await cp(FIXTURE, dir, { recursive: true });
  const repo = new Repository(path.join(dir, 'project-management'));
  await repo.refresh();
  const bus = new EventBus();
  const app = createApp({ repository: repo, port: 3737, eventBus: bus, projectRoot: dir });
  server = serve({ fetch: app.fetch, hostname: '127.0.0.1', port: 0 });
  await new Promise((resolve) => {
    if (server.listening) return resolve();
    server.once('listening', resolve);
  });
  port = server.address().port;
});

afterAll(async () => {
  if (server) await new Promise((resolve) => server.close(resolve));
  await rm(dir, { recursive: true, force: true });
});

const get = async (p) => {
  const res = await fetch(`http://127.0.0.1:${port}${p}`);
  return { status: res.status, json: res.status < 400 ? await res.json() : null };
};

describe('Kanban + Backlog screens (/api/stories)', () => {
  it('returns the full story set (history + current), not just the active sprint', async () => {
    const { json } = await get('/api/stories');
    // current sprint (6) + 8 archived sprints worth of stories + 1 markdown story.
    expect(json.stories.length).toBeGreaterThan(30);
  });

  it('never leaves every story stuck on priority "should"', async () => {
    const { json } = await get('/api/stories');
    const priorities = new Set(json.stories.map((s) => s.priority));
    expect(priorities.size).toBeGreaterThan(1);
    expect(priorities.has('must')).toBe(true);
  });
});

describe('Sprints screen (/api/sprints list)', () => {
  it('lists all 9 sprints with non-empty point roll-ups', async () => {
    const { json } = await get('/api/sprints');
    expect(json.sprints.length).toBe(9);
    const s1 = json.sprints.find((s) => s.id === 'sprint-1-infrastructure');
    expect(s1.story_count).toBe(8);
    expect(s1.total_points).toBe(25);
    expect(s1.done_points).toBe(25);
  });

  it('reports has_review / has_retro coherently with the files on disk', async () => {
    const { json } = await get('/api/sprints');
    const s1 = json.sprints.find((s) => s.id === 'sprint-1-infrastructure');
    const s2 = json.sprints.find((s) => s.id === 'sprint-2-design-system');
    const s9 = json.sprints.find((s) => s.id === 'sprint-9-auth-premium');
    expect(s1.has_retro).toBe(false); // sprint-1 has no retro file
    expect(s2.has_retro).toBe(true);
    expect(s9.has_review).toBe(false); // current sprint not closed
  });
});

describe('Sprint detail screen (/api/sprints/:id)', () => {
  it('exposes a sprint object with name and dates (shape coherent with /current)', async () => {
    const { json } = await get('/api/sprints/sprint-9-auth-premium');
    // RED: current detail returns { id, has_goal, has_review, has_retro } — no name/dates.
    expect(json.sprint.name).toBeTruthy();
    expect(json.sprint.start_date).toBeTruthy();
    expect(json.sprint.end_date).toBeTruthy();
  });

  it('returns stories with their assignee for the detail table', async () => {
    const { json } = await get('/api/sprints/sprint-1-infrastructure');
    expect(json.stories.length).toBe(8);
    expect(json.stories[0]).toHaveProperty('assigned_to');
  });
});

describe('Burndown screen (/api/sprints/current)', () => {
  it('returns 200 with the current sprint name, capacity and a coherent burndown total', async () => {
    const { status, json } = await get('/api/sprints/current');
    expect(status).toBe(200);
    expect(json.sprint.name).toBeTruthy();
    expect(json.sprint.capacity_points).toBe(13);
    const sumPoints = json.stories.reduce((n, s) => n + (s.story_points ?? 0), 0);
    expect(json.burndown.total_points).toBe(sumPoints);
  });
});

describe('Dependencies screen (/api/dependencies)', () => {
  it('builds a non-empty graph from the freeform YAML dependency strings', async () => {
    const { json } = await get('/api/dependencies');
    expect(json.nodes.length).toBeGreaterThan(0);
    expect(json.edges.length).toBeGreaterThan(0);
    const edge = json.edges.find((e) => e.to === 'US-E4-03' || e.from === 'US-E4-03');
    expect(edge).toBeDefined();
  });
});

describe('Docs screen (/api/docs)', () => {
  it('lists browsable markdown (prd, architecture, sprint goals/reviews/retros)', async () => {
    const { json } = await get('/api/docs');
    const rels = json.docs.map((d) => d.rel);
    expect(rels).toContain('prd.md');
    expect(rels.some((r) => r.startsWith('architecture/'))).toBe(true);
    expect(rels.some((r) => r.endsWith('sprint-review.md'))).toBe(true);
  });
});
