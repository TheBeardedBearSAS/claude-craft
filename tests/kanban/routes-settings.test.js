import process from 'node:process';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { mkdir, mkdtemp, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import * as jsYaml from 'js-yaml';
import { Repository } from '../../cli/kanban/server/services/repository.js';
import { createApp } from '../../cli/kanban/server/app.js';
import { EventBus } from '../../cli/kanban/server/services/event-bus.js';

const PORT = 3737;
const ORIGIN = `http://localhost:${PORT}`;

let dir;
let app;
let events;

const configPath = () => path.join(dir, '.bmad', 'kanban.yaml');

async function boot({ readonly = false } = {}) {
  const repo = new Repository(path.join(dir, 'project-management'));
  await repo.refresh();
  const bus = new EventBus();
  events = [];
  bus.subscribe((m) => events.push(m));
  app = createApp({ repository: repo, port: PORT, eventBus: bus, projectRoot: dir, readonly });
}

const put = (body, { raw, origin = ORIGIN } = {}) => {
  const headers = { 'Content-Type': 'application/json' };
  if (origin) headers.Origin = origin;
  return app.request('/api/settings/wip', {
    method: 'PUT',
    headers,
    body: raw ?? JSON.stringify(body),
  });
};
const health = async () => (await app.request('/api/health')).json();

beforeEach(async () => {
  dir = await mkdtemp(path.join(tmpdir(), 'kanban-settings-'));
  await mkdir(path.join(dir, 'project-management'), { recursive: true });
});
afterEach(async () => {
  vi.restoreAllMocks();
  await rm(dir, { recursive: true, force: true });
});

describe('GET /api/health wip_limits', () => {
  it('is an empty object without .bmad/kanban.yaml', async () => {
    await boot();
    expect(await health()).toEqual({ ok: true, readonly: false, user: 'kanban', wip_limits: {} });
  });

  it('exposes the configured limits', async () => {
    await mkdir(path.dirname(configPath()), { recursive: true });
    await writeFile(configPath(), 'version: 1\nwip_limits:\n  in-progress: 3\n  review: 2\n');
    await boot();
    expect((await health()).wip_limits).toEqual({ 'in-progress': 3, review: 2 });
  });

  it('stays healthy with no limit when the file is invalid', async () => {
    vi.spyOn(globalThis.console, 'error').mockImplementation(() => {});
    await mkdir(path.dirname(configPath()), { recursive: true });
    await writeFile(configPath(), 'wip_limits: [\n');
    await boot();
    const body = await health();
    expect(body.ok).toBe(true);
    expect(body.wip_limits).toEqual({});
  });
});

describe('PUT /api/settings/wip', () => {
  beforeEach(boot);

  it('writes .bmad/kanban.yaml, answers with the limits in force and reflects them in /api/health', async () => {
    const res = await put({ 'in-progress': 3, review: 2 });

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ wip_limits: { 'in-progress': 3, review: 2 } });
    expect(jsYaml.load(await readFile(configPath(), 'utf8'))).toEqual({
      version: 1,
      wip_limits: { 'in-progress': 3, review: 2 },
    });
    expect((await health()).wip_limits).toEqual({ 'in-progress': 3, review: 2 });
  });

  it('null removes a limit, absent statuses are kept', async () => {
    await put({ 'in-progress': 3, review: 2 });
    const res = await put({ review: null });
    expect(await res.json()).toEqual({ wip_limits: { 'in-progress': 3 } });
    expect((await health()).wip_limits).toEqual({ 'in-progress': 3 });
  });

  it('removing the last limit leaves no limit at all', async () => {
    await put({ review: 2 });
    expect(await (await put({ review: null })).json()).toEqual({ wip_limits: {} });
    expect((await health()).wip_limits).toEqual({});
  });

  it('publishes settings:updated with the limits', async () => {
    await put({ review: 2 });
    expect(events.filter((e) => e.event === 'settings:updated').map((e) => e.payload)).toEqual([
      { wip_limits: { review: 2 } },
    ]);
  });

  it('leaves nothing but kanban.yaml behind and answers without any absolute path', async () => {
    const text = await (await put({ review: 2 })).text();
    expect(text).not.toContain(dir);
    expect(await readdir(path.join(dir, '.bmad'))).toEqual(['kanban.yaml']);
  });

  it('replaces an unusable existing file', async () => {
    vi.spyOn(globalThis.console, 'error').mockImplementation(() => {});
    await mkdir(path.dirname(configPath()), { recursive: true });
    await writeFile(configPath(), 'wip_limits: [\n');
    expect(await (await put({ review: 2 })).json()).toEqual({ wip_limits: { review: 2 } });
  });

  it.each([
    ['an unknown status', { doing: 3 }],
    ['a zero limit', { review: 0 }],
    ['a limit over 99', { review: 100 }],
    ['a fractional limit', { review: 2.5 }],
    ['a string limit', { review: '2' }],
    ['an array', [1, 2]],
    ['a scalar', 3],
  ])('400 invalid_payload for %s, nothing written', async (_, body) => {
    const res = await put(body);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBe('invalid_payload');
    expect(json.issues.length).toBeGreaterThan(0);
    await expect(readFile(configPath())).rejects.toMatchObject({ code: 'ENOENT' });
  });

  it('400 invalid_json', async () => {
    const res = await put(null, { raw: '{nope' });
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: 'invalid_json' });
  });

  it('403 from a foreign origin or without origin, nothing written', async () => {
    expect((await put({ review: 2 }, { origin: 'http://evil.example' })).status).toBe(403);
    expect((await put({ review: 2 }, { origin: null })).status).toBe(403);
    await expect(readFile(configPath())).rejects.toMatchObject({ code: 'ENOENT' });
  });

  it('413 over the body limit', async () => {
    const res = await put(null, { raw: JSON.stringify({ review: 2, pad: 'x'.repeat(70_000) }) });
    expect(res.status).toBe(413);
  });

  it('423 locked while a live writer holds the lock, file untouched', async () => {
    await mkdir(path.dirname(configPath()), { recursive: true });
    await writeFile(configPath(), 'version: 1\nwip_limits:\n  review: 2\n');
    await writeFile(`${configPath()}.lock`, JSON.stringify({ pid: process.pid, ts: Date.now() }));
    const res = await put({ review: 5 }); // waits ~2 s for the lock, then gives up

    expect(res.status).toBe(423);
    expect(await res.json()).toEqual({ error: 'locked' });
    expect(await readFile(configPath(), 'utf8')).toBe('version: 1\nwip_limits:\n  review: 2\n');
  }, 10_000);
});

describe('PUT /api/settings/wip in --readonly', () => {
  it('403 readonly, nothing written', async () => {
    await boot({ readonly: true });
    const res = await put({ review: 2 });
    expect(res.status).toBe(403);
    expect((await res.json()).error).toBe('readonly');
    await expect(readFile(configPath())).rejects.toMatchObject({ code: 'ENOENT' });
  });
});
