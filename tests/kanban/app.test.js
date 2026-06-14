import { describe, it, expect, beforeAll, vi } from 'vitest';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Repository } from '../../cli/kanban/server/services/repository.js';
import { createApp } from '../../cli/kanban/server/app.js';
import { EventBus } from '../../cli/kanban/server/services/event-bus.js';

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

describe('security headers', () => {
  it('sets baseline hardening headers on responses', async () => {
    const r = await req('GET', '/api/health');
    expect(r.headers.get('x-content-type-options')).toBe('nosniff');
    expect(r.headers.get('cross-origin-opener-policy')).toBe('same-origin');
    expect(r.headers.get('referrer-policy')).toBeTruthy();
  });

  // SEC-003 : COEP et X-Frame-Options DENY doivent être présents
  it('sets cross-origin-embedder-policy: require-corp', async () => {
    const r = await req('GET', '/api/health');
    expect(r.headers.get('cross-origin-embedder-policy')).toBe('require-corp');
  });

  it('sets x-frame-options: DENY', async () => {
    const r = await req('GET', '/api/health');
    expect(r.headers.get('x-frame-options')).toBe('DENY');
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

describe('GET /api/events (SSE)', () => {
  it('returns 501 when no eventBus is wired', async () => {
    // default `app` is built without an eventBus
    const r = await req('GET', '/api/events');
    expect(r.status).toBe(501);
    const j = await r.json();
    expect(j.error).toBe('events_disabled');
  });

  it('streams a published event over SSE when an eventBus is wired', async () => {
    const bus = new EventBus();
    const appWithBus = createApp({ repository: repo, port: PORT + 1, eventBus: bus });
    const r = await appWithBus.request('/api/events');
    expect(r.status).toBe(200);
    expect(r.headers.get('content-type')).toContain('text/event-stream');

    const reader = r.body.getReader();
    const decoder = new TextDecoder();
    // Pulling the stream runs the SSE callback, which registers the subscriber.
    const firstChunk = reader.read();
    // Robust wiring check (no fixed sleep — audit 2026-06-01 anti-flaky): wait until
    // the subscriber is registered, then publish.
    await vi.waitFor(() => expect(bus.size).toBeGreaterThan(0), { timeout: 2000, interval: 20 });
    bus.publish('story.updated', { id: 'US-001' });

    const { value } = await firstChunk;
    const text = decoder.decode(value);
    expect(text).toContain('story.updated');
    expect(text).toContain('US-001');

    await reader.cancel();
  });
});

describe('GET /api/stories/:id', () => {
  it('returns story + tasks + markdown body', async () => {
    const r = await req('GET', '/api/stories/US-001');
    expect(r.status).toBe(200);
    const { story, tasks, body } = await r.json();
    expect(story.id).toBe('US-001');
    expect(tasks.length).toBe(1);
    expect(tasks[0].id).toBe('TASK-001');
    expect(typeof body).toBe('string');
    expect(body.length).toBeGreaterThan(0);
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

  it('also exposes backlog and sprint markdown bodies (epics, stories, goal, review, retro)', async () => {
    const r = await req('GET', '/api/docs');
    const { docs } = await r.json();
    const rels = docs.map((d) => d.rel);
    expect(rels).toContain('backlog/epics/EPIC-001-auth.md');
    expect(rels).toContain('backlog/user-stories/US-001-login.md');
    expect(rels).toContain('sprints/sprint-001-skeleton/sprint-goal.md');
    expect(rels).toContain('sprints/sprint-001-skeleton/sprint-review.md');
    expect(rels).toContain('sprints/sprint-001-skeleton/sprint-retro.md');
  });

  it('serves a sprint retro body', async () => {
    const r = await req('GET', '/api/docs/sprints/sprint-001-skeleton/sprint-retro.md');
    expect(r.status).toBe(200);
    expect(await r.text()).toContain('Rétrospective');
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

describe('GET /api/sprints', () => {
  it('lists all sprints with rolled-up counts', async () => {
    const r = await req('GET', '/api/sprints');
    expect(r.status).toBe(200);
    const { sprints } = await r.json();
    const s = sprints.find((x) => x.id === 'sprint-001-skeleton');
    expect(s).toBeTruthy();
    expect(s.has_goal).toBe(true);
    expect(s.has_review).toBe(true);
    expect(s.has_retro).toBe(true);
    expect(s.story_count).toBe(1);
    expect(s.total_points).toBe(5);
    expect(s.done_points).toBe(0);
  });
});

describe('GET /api/sprints/:id', () => {
  it('returns detail with goal, stories and tasks', async () => {
    const r = await req('GET', '/api/sprints/sprint-001-skeleton');
    expect(r.status).toBe(200);
    const body = await r.json();
    expect(body.sprint.id).toBe('sprint-001-skeleton');
    expect(body.sprint.has_goal).toBe(true);
    expect(body.goal).toContain('Walking Skeleton');
    expect(body.review).toContain('Sprint Review');
    expect(body.retro).toContain('Rétrospective');
    expect(body.stories.map((s) => s.id)).toEqual(['US-001']);
    expect(body.tasks.map((t) => t.id)).toContain('TASK-001');
  });

  it('404 on unknown sprint', async () => {
    const r = await req('GET', '/api/sprints/sprint-999');
    expect(r.status).toBe(404);
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

  // SEC-002 : Referer malformé ne doit pas produire un 500
  it('returns 403 (not 500) when Referer header is malformed', async () => {
    const r = await app.request('/api/stories/US-001/status', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Referer: 'not-a-valid-url',
      },
      body: JSON.stringify({ status: 'done' }),
    });
    expect(r.status).toBe(403);
  });

  it('returns 403 (not 500) when Referer header is empty string', async () => {
    const r = await app.request('/api/stories/US-001/status', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Referer: '',
      },
      body: JSON.stringify({ status: 'done' }),
    });
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
