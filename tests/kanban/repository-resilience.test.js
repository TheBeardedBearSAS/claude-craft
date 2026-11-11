import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtemp, rm, writeFile, mkdir } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { Repository } from '../../cli/kanban/server/services/repository.js';

let root;
let pm;

const story = (id, extra = '') => `---\nid: ${id}\ntitle: T ${id}\nstatus: backlog\n${extra}---\nbody\n`;

async function put(rel, content) {
  const file = path.join(pm, rel);
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, content, 'utf8');
}

async function putStatus(content) {
  await mkdir(path.join(root, '.bmad'), { recursive: true });
  await writeFile(path.join(root, '.bmad', 'sprint-status.yaml'), content, 'utf8');
}

beforeEach(async () => {
  root = await mkdtemp(path.join(tmpdir(), 'kanban-resilience-'));
  pm = path.join(root, 'project-management');
  await mkdir(pm, { recursive: true });
});

afterEach(() => rm(root, { recursive: true, force: true }));

describe('Repository — one bad file does not break the board', () => {
  it('survives malformed YAML frontmatter and loads the other stories', async () => {
    await put('backlog/user-stories/US-001-ok.md', story('US-001'));
    await put('backlog/user-stories/US-002-bad.md', '---\nid: [unclosed\ntitle: : :\n---\nbody\n');
    const repo = new Repository(pm);

    await expect(repo.refresh()).resolves.toBeUndefined();

    expect(repo.listStories().map((s) => s.id)).toEqual(['US-001']);
    const diag = repo.diagnostics();
    expect(diag.files.map((f) => f.rel)).toEqual(['backlog/user-stories/US-002-bad.md']);
    expect(diag.files[0].errors.length).toBeGreaterThan(0);
  });

  it('reports zod errors per file, with relative paths only', async () => {
    await put('backlog/user-stories/US-003-inv.md', '---\nid: US-003\ntitle: ""\n---\n');
    const repo = new Repository(pm);
    await repo.refresh();
    const { files } = repo.diagnostics();
    expect(files).toHaveLength(1);
    expect(files[0].rel).toBe('backlog/user-stories/US-003-inv.md');
    expect(JSON.stringify(files)).not.toContain(root);
  });

  it('keeps the previous state visible while a rebuild is in flight (no half-empty board)', async () => {
    await put('backlog/user-stories/US-001-ok.md', story('US-001'));
    await put('backlog/user-stories/US-002-ok.md', story('US-002'));
    const repo = new Repository(pm);
    await repo.refresh();

    const pending = repo.refresh();
    expect(repo.listStories().map((s) => s.id)).toEqual(['US-001', 'US-002']);
    await pending;
    expect(repo.listStories()).toHaveLength(2);
  });
});

describe('Repository — invalid markdown story also present in sprint-status.yaml', () => {
  it('stays visible from the YAML data', async () => {
    await put('backlog/user-stories/US-001-inv.md', '---\nid: US-001\ntitle: ""\nstory_points: 99\n---\nprose\n');
    await putStatus(
      'version: "1.0"\nmetadata: {sprint_id: S1, name: S1, start_date: "2026-01-01", end_date: "2026-01-10"}\n' +
        'stories:\n  US-001: {title: From yaml, status: in-progress, story_points: 3}\n'
    );
    const repo = new Repository(pm);
    await repo.refresh();

    const s = repo.getStory('US-001');
    expect(s.title).toBe('From yaml');
    expect(s.status).toBe('in-progress');
    expect(repo.getStoryBody('US-001')).toBe('prose\n');
    expect(repo.diagnostics().files.map((f) => f.rel)).toContain('backlog/user-stories/US-001-inv.md');
  });
});

describe('Repository.diagnostics — sprint-status', () => {
  it('missing when the file does not exist', async () => {
    const repo = new Repository(pm);
    await repo.refresh();
    expect(repo.diagnostics()).toEqual({ sprint_status: { state: 'missing', issues: [] }, files: [] });
  });

  it('ok for a valid file', async () => {
    await putStatus(
      'version: "1.0"\nmetadata: {sprint_id: S1, name: S1, start_date: "2026-01-01", end_date: "2026-01-10"}\nstories: {}\n'
    );
    const repo = new Repository(pm);
    await repo.refresh();
    expect(repo.diagnostics().sprint_status).toEqual({ state: 'ok', issues: [] });
  });

  it('invalid on a YAML syntax error, with the message, without crashing', async () => {
    await putStatus('metadata: [unclosed\n  stories: : :\n');
    const repo = new Repository(pm);
    await expect(repo.refresh()).resolves.toBeUndefined();
    const { sprint_status } = repo.diagnostics();
    expect(sprint_status.state).toBe('invalid');
    expect(sprint_status.issues[0]).toMatch(/\S/);
  });

  it('invalid on a schema violation, listing the issues', async () => {
    await putStatus('version: "1.0"\nstories: {}\n');
    const repo = new Repository(pm);
    await repo.refresh();
    const { sprint_status } = repo.diagnostics();
    expect(sprint_status.state).toBe('invalid');
    expect(sprint_status.issues.join(' ')).toMatch(/metadata/);
  });
});

describe('Repository — story ids from file names', () => {
  it('indexes an invalid epic-style story under its real id', async () => {
    await put('backlog/user-stories/US-E4-09-extra.md', '---\nid: US-E4-09\ntitle: ""\n---\n');
    const repo = new Repository(pm);
    await repo.refresh();
    expect(repo.stories.has('US-E4-09')).toBe(true);
  });
});
