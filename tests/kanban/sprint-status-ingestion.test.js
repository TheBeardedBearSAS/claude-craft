import { describe, it, expect, beforeAll } from 'vitest';
import path from 'node:path';
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

  it('tags YAML-sourced stories as read-only and markdown stories as writable', () => {
    const byId = Object.fromEntries(repo.listStories().map((s) => [s.id, s]));

    expect(byId['US-E1-01']._source).toBe('sprint-status');
    expect(byId['US-E1-01']._writable).toBe(false);
    expect(byId['US-E1-01'].sprint_id).toBe('sprint-x');
    expect(byId['US-E1-01'].status).toBe('ready-for-dev');
    expect(byId['US-E1-01'].story_points).toBe(3);
    expect(byId['US-E1-01'].epic_id).toBe('E1'); // from metadata.epic

    expect(byId['US-100']._source).toBe('markdown');
    expect(byId['US-100']._writable).toBe(true);
  });

  it('lets a markdown story win over a same-id YAML entry (no double source)', () => {
    const us100 = repo.getStory('US-100');
    // markdown title + status, not the YAML ones
    expect(us100.title).toBe('Markdown-backed story (wins over YAML)');
    expect(us100.status).toBe('in-progress');
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

describe('PATCH /api/stories/:id/status — read-only YAML source', () => {
  const origin = `http://127.0.0.1:${PORT}`;

  it('rejects a transition on a YAML-only story with 409 read_only_source (not a misleading 404)', async () => {
    const r = await req('PATCH', '/api/stories/US-E1-01/status', {
      origin,
      body: { status: 'in-progress' },
    });
    expect(r.status).toBe(409);
    const body = await r.json();
    expect(body.error).toBe('read_only_source');
  });

  it('still returns 404 for a genuinely unknown story id', async () => {
    const r = await req('PATCH', '/api/stories/US-999/status', {
      origin,
      body: { status: 'in-progress' },
    });
    expect(r.status).toBe(404);
  });
});
