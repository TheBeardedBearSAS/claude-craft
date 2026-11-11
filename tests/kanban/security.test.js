import { describe, it, expect, beforeAll, afterAll, afterEach, vi } from 'vitest';
import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises';
import fs from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Hono } from 'hono';
import { serve } from '@hono/node-server';
import { createApp } from '../../cli/kanban/server/app.js';
import { hostGuard } from '../../cli/kanban/server/middleware/security.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = 3737;
const ORIGIN = `http://127.0.0.1:${PORT}`;
const CLIENT_INDEX = path.resolve(__dirname, '../../cli/kanban/client/dist/index.html');

/** Minimal in-memory stand-in for Repository (only what the routes under test touch). */
function fakeRepo({ stories = {}, files = {}, rootDir = '/nonexistent/project-management', diagnostics } = {}) {
  return {
    rootDir,
    getStory: (id) => stories[id],
    getStoryFile: (id) => files[id] ?? null,
    listStories: () => Object.values(stories),
    listEpics: () => [],
    listSprints: () => [],
    getSprint: () => undefined,
    refresh: async () => {},
    ...(diagnostics ? { diagnostics } : {}),
  };
}

function patchStatus(app, id, body, headers = {}) {
  return app.request(`/api/stories/${id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Origin: ORIGIN, ...headers },
    body: typeof body === 'string' ? body : JSON.stringify(body),
  });
}

afterEach(() => vi.restoreAllMocks());

describe('hostGuard (DNS rebinding)', () => {
  const app = new Hono();
  app.use('*', hostGuard(PORT));
  app.get('/x', (c) => c.text('ok'));
  const get = (host) => app.request('/x', { headers: host === undefined ? {} : { Host: host } });

  it.each([`127.0.0.1:${PORT}`, `localhost:${PORT}`, `[::1]:${PORT}`])('accepts Host %s', async (host) => {
    expect((await get(host)).status).toBe(200);
  });

  it.each(['evil.example', `evil.example:${PORT}`, 'localhost', `localhost:${PORT + 1}`, `127.0.0.1.evil:${PORT}`])(
    'rejects Host %s with 403 forbidden',
    async (host) => {
      const r = await get(host);
      expect(r.status).toBe(403);
      expect(await r.json()).toEqual({ error: 'forbidden' });
    }
  );

  it('accepts in-process requests without a Host header (no socket)', async () => {
    expect((await get(undefined)).status).toBe(200);
  });

  it('is mounted on createApp routes', async () => {
    const app2 = createApp({ repository: fakeRepo(), port: PORT });
    const r = await app2.request('/api/health', { headers: { Host: 'rebind.attacker.example' } });
    expect(r.status).toBe(403);
  });

  describe('over a real socket', () => {
    let server, port;
    beforeAll(async () => {
      const app3 = createApp({ repository: fakeRepo(), port: PORT });
      server = serve({ fetch: app3.fetch, hostname: '127.0.0.1', port: 0 });
      await new Promise((resolve) => (server.listening ? resolve() : server.once('listening', resolve)));
      port = server.address().port;
    });
    afterAll(() => new Promise((resolve) => server.close(resolve)));

    it('accepts the loopback Host of the listening socket', async () => {
      const r = await fetch(`http://127.0.0.1:${port}/api/health`);
      expect(r.status).toBe(200);
    });

    it('rejects a foreign Host on the listening socket', async () => {
      const { request } = await import('node:http');
      const status = await new Promise((resolve, reject) => {
        const req = request(
          { host: '127.0.0.1', port, path: '/api/health', headers: { Host: `evil.example:${port}` } },
          (res) => {
            res.resume();
            resolve(res.statusCode);
          }
        );
        req.on('error', reject);
        req.end();
      });
      expect(status).toBe(403);
    });
  });
});

describe('request body limit', () => {
  it('rejects a mutation body over 64 KB with 413 payload_too_large', async () => {
    const app = createApp({ repository: fakeRepo(), port: PORT });
    const big = JSON.stringify({ status: 'blocked', blocked_reason: 'x'.repeat(70 * 1024) });
    const r = await patchStatus(app, 'US-001', big);
    expect(r.status).toBe(413);
    expect(await r.json()).toEqual({ error: 'payload_too_large' });
  });
});

describe('error responses do not leak internals', () => {
  it('write_failed hides err.message and absolute paths, logs the detail', async () => {
    const story = { id: 'US-001', status: 'backlog', _writable: true, _source: 'markdown', _mtime: 0 };
    const repo = fakeRepo({ stories: { 'US-001': story }, files: { 'US-001': '/nonexistent/dir/US-001.md' } });
    const app = createApp({ repository: repo, port: PORT });
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const r = await patchStatus(app, 'US-001', { status: 'blocked', blocked_reason: 'waiting' });
    expect(r.status).toBe(500);
    const text = await r.text();
    expect(JSON.parse(text)).toEqual({ error: 'write_failed' });
    expect(text).not.toContain('/nonexistent');
    expect(spy).toHaveBeenCalled();
  });

  describe('invalid sprint-status.yaml', () => {
    let dir;
    beforeAll(async () => {
      dir = await mkdtemp(path.join(tmpdir(), 'kb-sec-'));
      await mkdir(path.join(dir, '.bmad'), { recursive: true });
      await writeFile(path.join(dir, '.bmad', 'sprint-status.yaml'), 'key: [unclosed\n  bad: indent\n:::', 'utf8');
    });
    afterAll(() => rm(dir, { recursive: true, force: true }));

    it('/api/sprints/current returns a stable code without reason, and logs', async () => {
      const app = createApp({ repository: fakeRepo(), port: PORT, projectRoot: dir });
      const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const r = await app.request('/api/sprints/current');
      expect(r.status).toBe(503);
      expect(await r.json()).toEqual({ error: 'sprint_data_unavailable' });
      expect(spy).toHaveBeenCalled();
    });

    it('/api/sprints still answers but logs the YAML failure', async () => {
      const app = createApp({ repository: fakeRepo(), port: PORT, projectRoot: dir });
      const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const r = await app.request('/api/sprints');
      expect(r.status).toBe(200);
      expect(spy).toHaveBeenCalled();
    });
  });
});

describe('GET /api/diagnostics', () => {
  it('returns repository.diagnostics() as is', async () => {
    const diag = {
      sprint_status: { state: 'invalid', issues: ['bad yaml'] },
      files: [{ rel: 'backlog/x.md', errors: ['no id'] }],
    };
    const app = createApp({ repository: fakeRepo({ diagnostics: () => diag }), port: PORT });
    const r = await app.request('/api/diagnostics');
    expect(r.status).toBe(200);
    expect(await r.json()).toEqual(diag);
  });
});

describe('GET /api/health', () => {
  it('exposes readonly and the default user', async () => {
    const app = createApp({ repository: fakeRepo(), port: PORT });
    expect(await (await app.request('/api/health')).json()).toEqual({
      ok: true,
      readonly: false,
      user: 'kanban',
      wip_limits: {},
    });
  });

  it('exposes the configured user', async () => {
    const app = createApp({ repository: fakeRepo(), port: PORT, readonly: true, user: 'alice' });
    expect(await (await app.request('/api/health')).json()).toEqual({
      ok: true,
      readonly: true,
      user: 'alice',
      wip_limits: {},
    });
  });
});

describe('PATCH on an archived story', () => {
  it('returns 409 archived with an accurate message', async () => {
    const story = { id: 'US-900', status: 'done', _writable: false, _source: 'archived', _mtime: 0 };
    const app = createApp({ repository: fakeRepo({ stories: { 'US-900': story } }), port: PORT });
    const r = await patchStatus(app, 'US-900', { status: 'review' });
    expect(r.status).toBe(409);
    expect(await r.json()).toEqual({
      error: 'archived',
      reason: 'story belongs to a closed sprint (archived_sprints): history is read-only',
    });
  });
});

describe('client index.html', () => {
  it.skipIf(!fs.existsSync(CLIENT_INDEX))('is read from disk at most once across requests', async () => {
    const spy = vi.spyOn(fs, 'readFileSync');
    const app = createApp({ repository: fakeRepo(), port: PORT });
    await app.request('/');
    await app.request('/');
    await app.request('/');
    const reads = spy.mock.calls.filter(([p]) => String(p).endsWith('index.html'));
    expect(reads.length).toBeLessThanOrEqual(1);
  });
});
