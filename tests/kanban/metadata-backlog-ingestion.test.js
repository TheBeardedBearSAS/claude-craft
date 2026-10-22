import { describe, it, expect, beforeAll } from 'vitest';
import path from 'node:path';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { Repository } from '../../cli/kanban/server/services/repository.js';
import { createApp } from '../../cli/kanban/server/app.js';
import { groupStoriesByEpic } from '../../cli/kanban/client/src/lib/backlog.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// Backlog written from the claude-craft templates: no YAML frontmatter, metadata
// as a "## Métadonnées" bullet list. Regression: the Backlog screen was empty.
const PM_DIR = path.resolve(__dirname, '../fixtures/metadata-backlog/project-management');
const PORT = 3737;

let repo;
let app;

beforeAll(async () => {
  repo = new Repository(PM_DIR);
  await repo.refresh();
  app = createApp({ repository: repo, port: PORT });
});

describe('Repository — metadata-list backlog (no frontmatter)', () => {
  it('surfaces epics and stories', () => {
    expect(repo.listEpics().map((e) => e.id)).toEqual(['EPIC-001']);
    expect(repo.listStories().map((s) => s.id)).toEqual(['US-001', 'US-002', 'US-003']);
  });

  it('derives story fields and tags them read-only', () => {
    const byId = Object.fromEntries(repo.listStories().map((s) => [s.id, s]));
    expect(byId['US-002']).toMatchObject({
      epic_id: 'EPIC-001',
      status: 'in-progress',
      story_points: 3,
      priority: 'should',
      dependencies: ['US-001', 'US-099'],
      _source: 'markdown-metadata',
      _writable: false,
    });
    expect(byId['US-003'].status).toBe('done');
  });

  it('groups the stories under their epic in the Backlog view', () => {
    const { groups, orphans } = groupStoriesByEpic(repo.listStories(), repo.listEpics());
    expect(orphans).toHaveLength(0);
    expect(groups).toHaveLength(1);
    expect(groups[0].epic.title).toBe('Socle et exploitation');
    expect(groups[0].stories).toHaveLength(3);
  });
});

describe('PATCH /api/stories/:id/status — metadata-list story', () => {
  it('rejects with 409 read_only_source and leaves the file untouched', async () => {
    const file = repo.getStoryFile('US-001');
    const before = await readFile(file, 'utf8');
    const r = await app.request('/api/stories/US-001/status', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Origin: `http://127.0.0.1:${PORT}` },
      body: JSON.stringify({ status: 'ready-for-dev' }),
    });
    expect(r.status).toBe(409);
    expect((await r.json()).error).toBe('read_only_source');
    expect(await readFile(file, 'utf8')).toBe(before);
  });
});
