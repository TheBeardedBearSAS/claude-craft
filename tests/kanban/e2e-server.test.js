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
const FIXTURE = path.resolve(__dirname, '../fixtures/project-management');

let dir, server, port;

beforeAll(async () => {
  dir = await mkdtemp(path.join(tmpdir(), 'kb-e2e-'));
  const root = path.join(dir, 'project-management');
  await cp(FIXTURE, root, { recursive: true });
  const repo = new Repository(root);
  await repo.refresh();
  port = 0;
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

describe('E2E server boot', () => {
  it('binds 127.0.0.1 and serves /api/health', async () => {
    const res = await fetch(`http://127.0.0.1:${port}/api/health`);
    expect(res.status).toBe(200);
    const j = await res.json();
    expect(j.ok).toBe(true);
  });

  it('serves /api/stories', async () => {
    const res = await fetch(`http://127.0.0.1:${port}/api/stories`);
    const { stories, epics } = await res.json();
    expect(stories.length).toBe(2);
    expect(epics.length).toBe(1);
  });

  it('rejects PATCH with invalid Origin', async () => {
    const res = await fetch(`http://127.0.0.1:${port}/api/stories/US-001/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Origin: 'http://evil.example' },
      body: JSON.stringify({ status: 'done' }),
    });
    expect(res.status).toBe(403);
  });
});
