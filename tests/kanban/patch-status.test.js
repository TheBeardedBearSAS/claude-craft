import { describe, it, expect, beforeEach } from 'vitest';
import { mkdtemp, cp, rm, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Repository } from '../../cli/kanban/server/services/repository.js';
import { createApp } from '../../cli/kanban/server/app.js';
import { EventBus } from '../../cli/kanban/server/services/event-bus.js';
import { parseString } from '../../cli/kanban/server/services/frontmatter.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FIXTURE = path.resolve(__dirname, '../fixtures/project-management');
const PORT = 3737;
const ORIGIN = { Origin: `http://127.0.0.1:${PORT}`, 'Content-Type': 'application/json' };

async function setup() {
  const dir = await mkdtemp(path.join(tmpdir(), 'kb-patch-'));
  const root = path.join(dir, 'project-management');
  await cp(FIXTURE, root, { recursive: true });
  const repo = new Repository(root);
  await repo.refresh();
  const bus = new EventBus();
  const app = createApp({ repository: repo, port: PORT, eventBus: bus });
  return { dir, root, repo, app, bus };
}

async function teardown(dir) {
  await rm(dir, { recursive: true, force: true });
}

async function patch(app, id, body) {
  return await app.request(`/api/stories/${id}/status`, {
    method: 'PATCH', headers: ORIGIN, body: JSON.stringify(body),
  });
}

describe('PATCH /api/stories/:id/status', () => {
  let ctx;
  beforeEach(async () => { ctx = await setup(); });

  it('transitions US-001 ready-for-dev -> in-progress (no gate)', async () => {
    const r = await patch(ctx.app, 'US-001', { status: 'in-progress' });
    expect(r.status).toBe(200);
    const { story } = await r.json();
    expect(story.status).toBe('in-progress');
    expect(story.previous_status).toBe('ready-for-dev');

    const raw = await readFile(ctx.repo.getStoryFile('US-001'), 'utf8');
    expect(parseString(raw).data.status).toBe('in-progress');
    await teardown(ctx.dir);
  });

  it('rejects illegal transition (backlog -> done)', async () => {
    const r = await patch(ctx.app, 'US-002', { status: 'done' });
    expect(r.status).toBe(409);
    const body = await r.json();
    expect(body.error).toBe('invalid_transition');
    await teardown(ctx.dir);
  });

  it('rejects backlog -> ready-for-dev when invest < 6', async () => {
    const r = await patch(ctx.app, 'US-002', { status: 'ready-for-dev' });
    expect(r.status).toBe(409);
    const body = await r.json();
    expect(body.gate).toBe('invest_gate');
    expect(body.missing[0]).toMatch(/invest_score/);
    await teardown(ctx.dir);
  });

  it('requires blocked_reason when transitioning to blocked', async () => {
    const r = await patch(ctx.app, 'US-001', { status: 'blocked' });
    expect(r.status).toBe(409);
    await teardown(ctx.dir);
  });

  it('accepts blocked transition with reason, stores previous_status', async () => {
    const r = await patch(ctx.app, 'US-001', { status: 'blocked', blocked_reason: 'waiting API' });
    expect(r.status).toBe(200);
    const { story } = await r.json();
    expect(story.status).toBe('blocked');
    expect(story.previous_status).toBe('ready-for-dev');
    expect(story.blocked_reason).toBe('waiting API');
    await teardown(ctx.dir);
  });

  it('unblocks by restoring previous_status only', async () => {
    await patch(ctx.app, 'US-001', { status: 'blocked', blocked_reason: 'x' });
    // Cannot jump to arbitrary state
    const bad = await patch(ctx.app, 'US-001', { status: 'in-progress' });
    expect(bad.status).toBe(409);
    // Must return to previous_status
    const ok = await patch(ctx.app, 'US-001', { status: 'ready-for-dev' });
    expect(ok.status).toBe(200);
    const { story } = await ok.json();
    expect(story.status).toBe('ready-for-dev');
    expect(story.blocked_reason).toBe('');
    expect(story.previous_status).toBe('');
    await teardown(ctx.dir);
  });

  it('returns 404 for unknown story', async () => {
    const r = await patch(ctx.app, 'US-999', { status: 'done' });
    expect(r.status).toBe(404);
    await teardown(ctx.dir);
  });

  it('returns 400 on invalid payload', async () => {
    const r = await patch(ctx.app, 'US-001', { status: 'pending' });
    expect(r.status).toBe(400);
    await teardown(ctx.dir);
  });

  it('publishes story:updated on the event bus', async () => {
    const received = [];
    ctx.bus.subscribe((msg) => received.push(msg));
    await patch(ctx.app, 'US-001', { status: 'in-progress' });
    expect(received.length).toBe(1);
    expect(received[0].event).toBe('story:updated');
    expect(received[0].payload.id).toBe('US-001');
    expect(received[0].payload.story.status).toBe('in-progress');
    await teardown(ctx.dir);
  });
});
