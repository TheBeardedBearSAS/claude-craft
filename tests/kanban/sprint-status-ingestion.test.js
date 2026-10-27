import { describe, it, expect, beforeAll, beforeEach, afterEach } from 'vitest';
import { mkdtemp, cp, rm, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import * as yaml from 'js-yaml';
import { parseString } from '../../cli/kanban/server/services/frontmatter.js';
import { fileURLToPath } from 'node:url';
import { Repository } from '../../cli/kanban/server/services/repository.js';
import { createApp } from '../../cli/kanban/server/app.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// Project initialized BMAD-v6 style: stories live in ../.bmad/sprint-status.yaml.
const FIXTURE_ROOT = path.resolve(__dirname, '../fixtures/bmad-sprint-status');
const PM_DIR = path.join(FIXTURE_ROOT, 'project-management');
const PORT = 3737;

let repo;
let app;

beforeAll(async () => {
  repo = new Repository(PM_DIR);
  await repo.refresh();
  app = createApp({ repository: repo, port: PORT, projectRoot: FIXTURE_ROOT });
});

function req(method, url, { origin, body } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (origin) headers.Origin = origin;
  return app.request(url, { method, headers, body: body ? JSON.stringify(body) : undefined });
}

describe('Repository — .bmad/sprint-status.yaml ingestion', () => {
  it('surfaces YAML-only stories so the board is not empty', () => {
    const stories = repo.listStories();
    const ids = stories.map((s) => s.id).sort();
    // US-100 (markdown) + US-E1-01 + US-E1-02 (YAML-only)
    expect(ids).toEqual(['US-100', 'US-E1-01', 'US-E1-02']);
  });

  it('tags each story with its content source; status is writable for both', () => {
    const byId = Object.fromEntries(repo.listStories().map((s) => [s.id, s]));

    expect(byId['US-E1-01']._source).toBe('sprint-status');
    expect(byId['US-E1-01']._writable).toBe(true);
    expect(byId['US-E1-01'].sprint_id).toBe('sprint-x');
    expect(byId['US-E1-01'].status).toBe('ready-for-dev');
    expect(byId['US-E1-01'].story_points).toBe(3);
    expect(byId['US-E1-01'].epic_id).toBe('E1'); // from metadata.epic

    expect(byId['US-100']._source).toBe('markdown');
    expect(byId['US-100']._writable).toBe(true);
  });

  it('takes content from markdown and status from sprint-status.yaml (single source of status)', () => {
    const us100 = repo.getStory('US-100');
    expect(us100.title).toBe('Markdown-backed story (content from markdown)');
    expect(us100.story_points).toBe(8);
    expect(us100.status).toBe('backlog');
    expect(us100.previous_status).toBe('backlog');
    expect(us100._statusSource).toBe('sprint-status');
    expect(repo.getStoryFile('US-100')).not.toBeNull();
  });

  it('keeps no backing file for YAML-only stories', () => {
    expect(repo.getStoryFile('US-E1-01')).toBeNull();
  });
});

describe('GET /api/stories — board populated from YAML', () => {
  it('returns the three stories', async () => {
    const r = await req('GET', '/api/stories');
    expect(r.status).toBe(200);
    const { stories } = await r.json();
    expect(stories.map((s) => s.id).sort()).toEqual(['US-100', 'US-E1-01', 'US-E1-02']);
  });
});

describe('GET /api/sprints/current — no longer "no sprint"', () => {
  it('returns 200 with sprint metadata, stories and burndown', async () => {
    const r = await req('GET', '/api/sprints/current');
    expect(r.status).toBe(200);
    const data = await r.json();
    expect(data.sprint.sprint_id).toBe('sprint-x');
    expect(data.stories.map((s) => s.id).sort()).toEqual(['US-100', 'US-E1-01', 'US-E1-02']);
    // 8 (US-100 md) + 3 + 5
    expect(data.burndown.total_points).toBe(16);
    expect(data.burndown.ideal.length).toBeGreaterThan(0);
  });
});

describe('PATCH /api/stories/:id/status — writes the status to sprint-status.yaml', () => {
  const origin = `http://127.0.0.1:${PORT}`;
  let dir;
  let root;
  let tmpApp;

  beforeEach(async () => {
    dir = await mkdtemp(path.join(tmpdir(), 'kb-ssy-'));
    root = path.join(dir, 'proj');
    await cp(FIXTURE_ROOT, root, { recursive: true });
    const tmpRepo = new Repository(path.join(root, 'project-management'));
    await tmpRepo.refresh();
    tmpApp = createApp({ repository: tmpRepo, port: PORT, projectRoot: root });
  });
  afterEach(async () => {
    await rm(dir, { recursive: true, force: true });
  });

  const ssy = async () => yaml.load(await readFile(path.join(root, '.bmad', 'sprint-status.yaml'), 'utf8'));
  const send = (id, body) =>
    tmpApp.request(`/api/stories/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Origin: origin },
      body: JSON.stringify(body),
    });

  it('moves a YAML-only story and records the transition in history', async () => {
    const r = await send('US-E1-01', { status: 'in-progress' });
    expect(r.status).toBe(200);
    expect((await r.json()).story.status).toBe('in-progress');

    const story = (await ssy()).stories['US-E1-01'];
    expect(story.status).toBe('in-progress');
    expect(story.previous_status).toBe('ready-for-dev');
    expect(story.history.at(-1)).toMatchObject({ from: 'ready-for-dev', to: 'in-progress', by: 'kanban' });
    expect(story.tasks.total).toBe(2); // untouched fields survive
  });

  it('writes a markdown-backed story status to the YAML and leaves the markdown untouched', async () => {
    const mdPath = path.join(root, 'project-management/backlog/user-stories/US-100-existing.md');
    const before = await readFile(mdPath, 'utf8');

    const r = await send('US-100', { status: 'blocked', blocked_reason: 'waiting for API' });
    expect(r.status).toBe(200);
    const story = (await ssy()).stories['US-100'];
    expect(story.status).toBe('blocked');
    expect(story.blocked_reason).toBe('waiting for API');
    expect(await readFile(mdPath, 'utf8')).toBe(before);
    expect(parseString(before).data.status).toBe('in-progress');
  });

  it('still returns 404 for a genuinely unknown story id', async () => {
    const r = await req('PATCH', '/api/stories/US-999/status', {
      origin,
      body: { status: 'in-progress' },
    });
    expect(r.status).toBe(404);
  });
});
