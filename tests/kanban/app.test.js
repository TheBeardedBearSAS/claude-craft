import { describe, it, expect, beforeAll } from 'vitest';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Repository } from '../../cli/kanban/server/services/repository.js';
import { createApp } from '../../cli/kanban/server/app.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FIXTURE = path.resolve(__dirname, '../fixtures/project-management');
const PORT = 3737;

let app;
let repo;

beforeAll(async () => {
  repo = new Repository(FIXTURE);
  await repo.refresh();
  app = createApp({ repository: repo, port: PORT });
});

async function req(method, url, { origin, body } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (origin) headers.Origin = origin;
  return await app.request(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
}

describe('GET /api/health', () => {
  it('returns ok', async () => {
    const r = await req('GET', '/api/health');
    expect(r.status).toBe(200);
    const j = await r.json();
    expect(j.ok).toBe(true);
  });
});

describe('GET /api/stories', () => {
  it('lists all stories + epics', async () => {
    const r = await req('GET', '/api/stories');
    expect(r.status).toBe(200);
    const { stories, epics } = await r.json();
    expect(stories.length).toBe(2);
    expect(epics.length).toBe(1);
    expect(stories[0].id).toBe('US-001');
  });

  it('filters by status', async () => {
    const r = await req('GET', '/api/stories?status=backlog');
    const { stories } = await r.json();
    expect(stories.length).toBe(1);
    expect(stories[0].id).toBe('US-002');
  });

  it('filters by epic_id', async () => {
    const r = await req('GET', '/api/stories?epic_id=EPIC-001');
    const { stories } = await r.json();
    expect(stories.length).toBe(2);
  });

  it('filters by sprint_id', async () => {
    const r = await req('GET', '/api/stories?sprint_id=sprint-001-skeleton');
    const { stories } = await r.json();
    expect(stories.length).toBe(1);
    expect(stories[0].id).toBe('US-001');
  });
});

describe('GET /api/stories/:id', () => {
  it('returns story + tasks', async () => {
    const r = await req('GET', '/api/stories/US-001');
    expect(r.status).toBe(200);
    const { story, tasks } = await r.json();
    expect(story.id).toBe('US-001');
    expect(tasks.length).toBe(1);
    expect(tasks[0].id).toBe('TASK-001');
  });

  it('404 on unknown id', async () => {
    const r = await req('GET', '/api/stories/US-999');
    expect(r.status).toBe(404);
  });
});

describe('GET /api/dependencies', () => {
  it('returns graph nodes + edges', async () => {
    const r = await req('GET', '/api/dependencies');
    const { nodes, edges, cycles } = await r.json();
    expect(nodes.length).toBe(2);
    expect(edges).toEqual([{ from: 'US-001', to: 'US-002' }]);
    expect(cycles).toEqual([]);
  });
});

describe('GET /api/docs', () => {
  it('lists available docs', async () => {
    const r = await req('GET', '/api/docs');
    const { docs } = await r.json();
    const rels = docs.map((d) => d.rel);
    expect(rels).toContain('prd.md');
    expect(rels).toContain('tech-spec.md');
    expect(rels).toContain('architecture/c4-context.md');
  });

  it('returns markdown content', async () => {
    const r = await req('GET', '/api/docs/prd.md');
    expect(r.status).toBe(200);
    expect(await r.text()).toContain('# PRD');
  });

  it('404 on unknown doc', async () => {
    const r = await req('GET', '/api/docs/missing.md');
    expect(r.status).toBe(404);
  });

  it('blocks path traversal', async () => {
    const r = await req('GET', '/api/docs/..%2F..%2Fetc%2Fpasswd');
    expect([400, 404]).toContain(r.status);
  });
});

describe('CSRF middleware', () => {
  it('allows GET without origin', async () => {
    const r = await req('GET', '/api/stories');
    expect(r.status).toBe(200);
  });

  it('rejects PATCH from foreign origin', async () => {
    const r = await req('PATCH', '/api/stories/US-001/status', {
      origin: 'http://evil.example',
      body: { status: 'done' },
    });
    expect(r.status).toBe(403);
  });

  it('rejects PATCH without any origin/referer', async () => {
    const r = await req('PATCH', '/api/stories/US-001/status', { body: { status: 'done' } });
    expect(r.status).toBe(403);
  });
});

describe('readonly mode', () => {
  it('blocks mutations when readonly=true', async () => {
    const ro = createApp({ repository: repo, port: PORT, readonly: true });
    const r = await ro.request('/api/stories/US-001/status', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Origin: `http://127.0.0.1:${PORT}` },
      body: JSON.stringify({ status: 'done' }),
    });
    expect(r.status).toBe(403);
  });
});

describe('resolveSafe middleware helper', () => {
  it('rejects .. sequences', async () => {
    const { resolveSafe } = await import('../../cli/kanban/server/middleware/security.js');
    expect(() => resolveSafe('/base', '../escape')).toThrow(/traversal/);
    expect(() => resolveSafe('/base', '/abs/path')).toThrow(/traversal/);
  });

  it('accepts relative paths under base', async () => {
    const { resolveSafe } = await import('../../cli/kanban/server/middleware/security.js');
    expect(resolveSafe('/base', 'sub/file.md')).toBe('/base/sub/file.md');
  });
});
