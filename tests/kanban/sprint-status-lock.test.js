import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtemp, cp, rm, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import process from 'node:process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as yaml from 'js-yaml';
import { serve } from '@hono/node-server';
import { Repository } from '../../cli/kanban/server/services/repository.js';
import { createApp } from '../../cli/kanban/server/app.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FIXTURE_ROOT = path.resolve(__dirname, '../fixtures/bmad-sprint-status');

let dir;
let root;
let yamlPath;

beforeEach(async () => {
  dir = await mkdtemp(path.join(tmpdir(), 'ssy-lock-'));
  root = path.join(dir, 'project');
  await cp(FIXTURE_ROOT, root, { recursive: true });
  yamlPath = path.join(root, '.bmad', 'sprint-status.yaml');
});

afterEach(async () => {
  await rm(dir, { recursive: true, force: true });
});

const story = async (id) => yaml.load(await readFile(yamlPath, 'utf8')).stories[id];

describe('PATCH status — author and origin on the real port', () => {
  let server;
  let port;

  beforeEach(async () => {
    const repository = new Repository(path.join(root, 'project-management'));
    await repository.refresh();
    // Configured port differs from the listening one, as in `serve({ port: 0 })`.
    const app = createApp({ repository, port: 3737, projectRoot: root, user: 'alice' });
    server = serve({ fetch: app.fetch, port: 0, hostname: '127.0.0.1' });
    await new Promise((resolve) => server.once('listening', resolve));
    port = server.address().port;
  });

  afterEach(async () => {
    await new Promise((resolve) => server.close(resolve));
  });

  const patch = (origin) =>
    globalThis.fetch(`http://127.0.0.1:${port}/api/stories/US-E1-01/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Origin: origin },
      body: JSON.stringify({ status: 'in-progress' }),
    });

  it('accepts the origin of the listening socket and records who moved the story', async () => {
    const res = await patch(`http://127.0.0.1:${port}`);

    expect(res.status).toBe(200);
    expect((await story('US-E1-01')).history.at(-1)).toMatchObject({ to: 'in-progress', by: 'kanban:alice' });
  });

  it('answers 423 while a live writer holds the YAML lock, file unchanged', async () => {
    await writeFile(`${yamlPath}.lock`, JSON.stringify({ pid: process.pid, ts: Date.now() }));
    const before = await readFile(yamlPath, 'utf8');

    const res = await patch(`http://127.0.0.1:${port}`);

    expect(res.status).toBe(423);
    expect(await res.json()).toEqual({ error: 'locked' });
    expect(await readFile(yamlPath, 'utf8')).toBe(before);
  });

  it('reclaims an orphan lock left by a crashed writer', async () => {
    await writeFile(`${yamlPath}.lock`, JSON.stringify({ pid: process.pid, ts: Date.now() - 60_000 }));

    const res = await patch(`http://127.0.0.1:${port}`);

    expect(res.status).toBe(200);
    expect((await story('US-E1-01')).status).toBe('in-progress');
  });

  it('still rejects a foreign origin', async () => {
    const res = await patch('http://evil.example');

    expect(res.status).toBe(403);
  });
});
