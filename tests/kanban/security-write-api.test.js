import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { lstat, mkdir, mkdtemp, readdir, readFile, rm, symlink, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import * as jsYaml from 'js-yaml';
import { Repository } from '../../cli/kanban/server/services/repository.js';
import { createApp } from '../../cli/kanban/server/app.js';
import { deriveStoryData } from '../../cli/kanban/server/services/markdown-metadata.js';
import { acquireLock } from '../../cli/kanban/server/services/lock.js';

// Failure injection for the one write that cannot be made to fail from the file system alone.
const hooks = vi.hoisted(() => ({ failWrite: null }));
vi.mock('node:fs/promises', async (importOriginal) => {
  const real = await importOriginal();
  const writeFile = (file, ...rest) =>
    hooks.failWrite?.(String(file))
      ? Promise.reject(Object.assign(new Error('ENOSPC'), { code: 'ENOSPC' }))
      : real.writeFile(file, ...rest);
  return { ...real, writeFile, default: { ...real, writeFile } };
});

// Security review of the write API: each test reproduces one concrete attack or failure.

const PORT = 3737;
const ORIGIN = `http://127.0.0.1:${PORT}`;
const STORIES = 'project-management/backlog/user-stories';

const TRACKED_YAML = `version: "1.0"
metadata:
  sprint_id: "sprint-1-a"
  name: "A"
  start_date: "2026-11-02"
  end_date: "2026-11-13"
stories:
  US-001:
    title: "One"
    status: "backlog"
    sprint_id: null
    story_points: 2
`;

const FRONTMATTER_STORY = `---
id: US-010
title: Frontmatter story
status: backlog
story_points: 3
---
# US-010

Body.
`;

const METADATA_STORY = `# US-020: Metadata story

## Metadata
- **ID**: US-020
- **Points**: 3

## Notes
`;

let dir;
let root;
let repo;
let app;

const inRoot = (...p) => path.join(root, ...p);

async function setup({ yaml = TRACKED_YAML, files = {} } = {}) {
  dir = await mkdtemp(path.join(tmpdir(), 'kb-sec-'));
  root = path.join(dir, 'proj');
  await mkdir(inRoot(STORIES), { recursive: true });
  if (yaml !== null) {
    await mkdir(inRoot('.bmad'), { recursive: true });
    await writeFile(inRoot('.bmad', 'sprint-status.yaml'), yaml);
  }
  for (const [rel, text] of Object.entries(files)) {
    await mkdir(path.dirname(inRoot(rel)), { recursive: true });
    await writeFile(inRoot(rel), text);
  }
  repo = new Repository(inRoot('project-management'));
  await repo.refresh();
  app = createApp({ repository: repo, port: PORT, projectRoot: root, user: 'alice' });
}

afterEach(async () => {
  hooks.failWrite = null;
  await rm(dir, { recursive: true, force: true });
});

async function call(method, url, body) {
  const init = { method, headers: { 'Content-Type': 'application/json', Origin: ORIGIN } };
  if (body !== undefined) init.body = JSON.stringify(body);
  const res = await app.request(url, init);
  const type = res.headers.get('content-type') ?? '';
  return { status: res.status, body: type.includes('json') ? await res.json() : null };
}

describe('planted symlinks never redirect a write outside the story file', () => {
  beforeEach(() => setup({ files: { [`${STORIES}/US-010-fm.md`]: FRONTMATTER_STORY } }));

  it('a `<story>.md.bak` symlink (hostile branch) is not written through by a frontmatter update', async () => {
    // e.g. US-010-fm.md.bak -> ../../../.git/hooks/pre-commit: the backup copy would land in the hook.
    const victim = inRoot('victim.sh');
    await writeFile(victim, 'original\n');
    await symlink('../../../victim.sh', inRoot(STORIES, 'US-010-fm.md.bak'));

    const res = await call('PATCH', '/api/stories/US-010/status', { status: 'ready-for-dev' });

    expect(res.status).toBe(200);
    expect(await readFile(victim, 'utf8')).toBe('original\n');
    expect(jsYaml.load((await readFile(inRoot(STORIES, 'US-010-fm.md'), 'utf8')).split('---')[1]).status).toBe(
      'ready-for-dev'
    );
    expect((await lstat(inRoot(STORIES, 'US-010-fm.md'))).isFile()).toBe(true);
  });
});

describe('missing .bmad/ directory', () => {
  it('PATCH status of a story the YAML tracked answers 409 sprint_status_missing, not 500', async () => {
    await setup();
    await rm(inRoot('.bmad'), { recursive: true, force: true }); // e.g. a git checkout after the last refresh

    const res = await call('PATCH', '/api/stories/US-001/status', { status: 'ready-for-dev' });

    expect(res).toEqual({ status: 409, body: { error: 'sprint_status_missing' } });
  });

  it('PATCH fields and tasks answer 409 sprint_status_missing too', async () => {
    await setup();
    await rm(inRoot('.bmad'), { recursive: true, force: true });

    expect((await call('PATCH', '/api/stories/US-001', { story_points: 2 })).body).toEqual({
      error: 'sprint_status_missing',
    });
    expect((await call('DELETE', '/api/stories/US-001')).body).toEqual({ error: 'sprint_status_missing' });
  });

  it('POST /api/sprints/:id/start creates .bmad/ and the status file', async () => {
    await setup({ yaml: null, files: { 'project-management/sprints/sprint-1-a/sprint-goal.md': '# Sprint 1 : A\n' } });

    const res = await call('POST', '/api/sprints/sprint-1-a/start');

    expect(res.status).toBe(200);
    const written = jsYaml.load(await readFile(inRoot('.bmad', 'sprint-status.yaml'), 'utf8'));
    expect(written.metadata).toMatchObject({ sprint_id: 'sprint-1-a', name: 'A' });
  });
});

describe('PUT /api/stories/:id/body cannot set a status', () => {
  it('refuses a body that would become a frontmatter of a file that has none', async () => {
    await setup({ yaml: null, files: { [`${STORIES}/US-020-meta.md`]: METADATA_STORY } });
    const story = (await call('GET', '/api/stories/US-020')).body.story;

    const markdown = `---\nid: US-020\ntitle: Hijacked\nstatus: done\n---\n${METADATA_STORY}`;
    const res = await call('PUT', '/api/stories/US-020/body', { markdown, expected_mtime: story._mtime });

    expect(res).toEqual({ status: 422, body: { error: 'status_line_forbidden', reason: 'frontmatter' } });
    expect(await readFile(inRoot(STORIES, 'US-020-meta.md'), 'utf8')).toBe(METADATA_STORY);
  });

  it('refuses a Status line split by an HTML comment (the reader strips comments first)', async () => {
    await setup({ yaml: null, files: { [`${STORIES}/US-020-meta.md`]: METADATA_STORY } });
    const story = (await call('GET', '/api/stories/US-020')).body.story;

    const markdown = METADATA_STORY.replace('- **Points**: 3', '- **Points**: 3\n- **Sta<!-- x -->tus**: Done');
    const res = await call('PUT', '/api/stories/US-020/body', { markdown, expected_mtime: story._mtime });

    expect(res).toEqual({ status: 422, body: { error: 'status_line_forbidden' } });
  });
});

// 10^levels leaves from a few hundred bytes: js-yaml shares the aliased nodes, every serializer expands them.
function aliasBomb(levels) {
  const lines = ['  a0: &a0 [x, x, x, x, x, x, x, x, x, x]'];
  for (let i = 1; i <= levels; i++)
    lines.push(
      `  a${i}: &a${i} [${Array(10)
        .fill(`*a${i - 1}`)
        .join(', ')}]`
    );
  return lines.join('\n');
}

describe('hostile repository content cannot hang the server', () => {
  it('a sprint-status.yaml alias bomb is reported invalid instead of being expanded', async () => {
    const yaml = `${TRACKED_YAML.replace('stories:', `bomb:\n${aliasBomb(7)}\nstories:`)}    extra: *a7\n`;
    expect(yaml.length).toBeLessThan(1024);
    const started = Date.now();
    await setup({ yaml });

    const res = await call('GET', '/api/stories');

    expect(Date.now() - started).toBeLessThan(2000);
    expect(res.status).toBe(200);
    expect(repo.diagnostics().sprint_status.state).toBe('invalid');
    expect((await call('GET', '/api/sprints/current')).status).toBe(503);
  });

  it('an alias bomb in a story frontmatter makes that story invalid, not the board unresponsive', async () => {
    const md = `---\nid: US-030\ntitle: Bomb\nbomb:\n${aliasBomb(7)}\nextra: *a7\n---\n# US-030\n`;
    const started = Date.now();
    await setup({ yaml: null, files: { [`${STORIES}/US-030-bomb.md`]: md } });

    const res = await call('GET', '/api/stories');

    expect(Date.now() - started).toBeLessThan(2000);
    expect(res.body.stories.map((s) => s.id)).not.toContain('US-030');
    expect(repo.diagnostics().files[0].rel).toBe('backlog/user-stories/US-030-bomb.md');
  });

  it('metadata-list parsing stays linear on long lines, blank runs and comment markers', () => {
    const started = Date.now();
    deriveStoryData(`# US-1: a${' '.repeat(100_000)}x`);
    deriveStoryData(`${'\n'.repeat(100_000)}x`);
    deriveStoryData(`- **Points**: 1${' \n'.repeat(100_000)}x`);
    deriveStoryData('<!--'.repeat(50_000)); // never closed
    deriveStoryData(`${'<!'.repeat(25_000)}${'-- -->'.repeat(25_000)}`); // each removal opens the next one
    expect(Date.now() - started).toBeLessThan(1000);
  });
});

describe('PATCH /api/stories/:id on a frontmatter story', () => {
  it('refuses an E<n> epic id that the frontmatter schema would reject (the story would vanish)', async () => {
    await setup({ yaml: null, files: { [`${STORIES}/US-010-fm.md`]: FRONTMATTER_STORY } });

    const res = await call('PATCH', '/api/stories/US-010', { epic_id: 'E4' });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('invalid_payload');
    expect((await call('GET', '/api/stories/US-010')).status).toBe(200);
  });
});

describe('user strings written to sprint-status.yaml read back identically through js-yaml', () => {
  const NASTY = [
    'yes',
    'No',
    'ON',
    'null',
    'Null',
    '~',
    'true',
    '2026-01-01',
    '2026-01-01T10:00:00Z',
    '1e3',
    '0x1F',
    '0o17',
    '.inf',
    '-.nan',
    '12:30:00',
    '- item',
    'key: value',
    'a #comment',
    '# heading',
    '&anchor',
    '*alias',
    '!!binary x',
    '!tag',
    '%TAG',
    '@at',
    '`tick',
    '"double"',
    "'single'",
    'two\nlines',
    'status: done',
    'a\n  status: done',
    'tab\tin',
    'line sep',
    'nel\u0085x',
    '﻿bom',
    'back\\slash',
    '{flow: map}',
    '[flow, seq]',
    '<<',
    '? key',
    '| block',
    '> folded',
    'émoji 🚀',
    '=',
    'E4',
    'yes please',
  ];

  it.each(NASTY)('title %j', async (title) => {
    await setup();
    const res = await call('PATCH', '/api/stories/US-001', { title, assigned_to: title.slice(0, 100) });
    expect(res.status).toBe(200);
    const text = await readFile(inRoot('.bmad', 'sprint-status.yaml'), 'utf8');
    const entry = jsYaml.load(text).stories['US-001'];
    expect(entry.title).toBe(title.trim());
    expect(entry.assigned_to).toBe(title.slice(0, 100));
    expect(entry.status).toBe('backlog');
    // Shell fallback: grep -A 5 "^  US-001:" | grep "status:" | head -1
    const after = text.split('\n');
    const at = after.indexOf('  US-001:');
    expect(after.slice(at, at + 6).find((l) => l.includes('status:'))).toMatch(/^ {4}status: "?backlog"?$/);
  });
});

describe('partial failures leave no orphan', () => {
  it('POST /api/sprints removes the new sprint folder when sprint-goal.md cannot be written', async () => {
    await setup();
    hooks.failWrite = (file) => file.endsWith('sprint-goal.md');

    const res = await call('POST', '/api/sprints', { name: 'Beta', start_date: '2026-11-16', end_date: '2026-11-27' });

    expect(res).toEqual({ status: 500, body: { error: 'write_failed' } });
    expect(await readdir(inRoot('project-management', 'sprints'))).toEqual([]);
  });

  it('POST /api/stories keeps the markdown file when only the board refresh fails after the YAML write', async () => {
    await setup();
    const refresh = repo.refresh.bind(repo);
    let calls = 0;
    repo.refresh = () => (++calls === 1 ? Promise.reject(new Error('EACCES')) : refresh());

    const res = await call('POST', '/api/stories', { title: 'Created' });

    expect(res.status).toBe(500);
    const ids = Object.keys(jsYaml.load(await readFile(inRoot('.bmad', 'sprint-status.yaml'), 'utf8')).stories);
    expect(ids).toContain('US-002');
    expect(await readdir(inRoot(STORIES))).toEqual(['US-002-created.md']);
  });
});

describe('special files planted in .bmad/ (symlinks to a FIFO or /dev/zero) do not block the server', () => {
  // A branch can commit a symlink to /dev/zero; a FIFO blocks the same read path and keeps the test cheap.
  const fifo = () => {
    const f = path.join(dir, 'fifo');
    execFileSync('mkfifo', [f]);
    return f;
  };

  it('sprint-status.yaml pointing at a FIFO is reported invalid instead of hanging the refresh', async () => {
    await setup({ yaml: null });
    await mkdir(inRoot('.bmad'));
    await symlink(fifo(), inRoot('.bmad', 'sprint-status.yaml'));

    await repo.refresh();

    expect(repo.diagnostics().sprint_status.state).toBe('invalid');
    expect((await call('GET', '/api/sprints/current')).status).toBe(503);
  }, 3000);

  it('a lock file pointing at a FIFO is judged stale and replaced, not read forever', async () => {
    await setup({ yaml: null });
    const lock = path.join(dir, 'x.lock');
    await symlink(fifo(), lock);

    const release = await acquireLock(lock, { retries: 1, retryDelayMs: 1 });

    expect((await lstat(lock)).isFile()).toBe(true);
    await release();
  }, 3000);
});

describe('every mutation route sits behind the origin and readonly guards', () => {
  const ROUTES = [
    ['PATCH', '/api/stories/US-001/status', { status: 'ready-for-dev' }],
    ['PATCH', '/api/stories/US-001', { title: 'x' }],
    ['PATCH', '/api/stories/US-001/tasks/TASK-001', { status: 'done' }],
    ['PUT', '/api/stories/US-001/body', { markdown: 'x', expected_mtime: 0 }],
    ['POST', '/api/stories', { title: 'x' }],
    ['DELETE', '/api/stories/US-001', undefined],
    ['POST', '/api/sprints', { name: 'x', start_date: '2026-11-16', end_date: '2026-11-27' }],
    ['POST', '/api/sprints/sprint-1-a/start', undefined],
    ['POST', '/api/sprints/sprint-1-a/close', undefined],
    ['PUT', '/api/settings/wip', { review: 2 }],
  ];
  const send = (method, url, body, headers) =>
    app.request(url, {
      method,
      headers: { 'Content-Type': 'text/plain', ...headers },
      body: body === undefined ? undefined : JSON.stringify(body),
    });

  it.each(ROUTES)(
    '%s %s: 403 without Origin, with Origin null or a foreign one, and in --readonly',
    async (m, url, b) => {
      await setup();
      const before = await readFile(inRoot('.bmad', 'sprint-status.yaml'), 'utf8');
      // A <form enctype="text/plain"> or sendBeacon is a "simple" request: no preflight, so the guard is all there is.
      for (const headers of [
        {},
        { Origin: 'null' },
        { Origin: 'http://evil.test' },
        { Referer: 'http://evil.test/' },
      ]) {
        expect((await send(m, url, b, headers)).status).toBe(403);
      }
      app = createApp({ repository: repo, port: PORT, projectRoot: root, readonly: true });
      const res = await send(m, url, b, { Origin: ORIGIN });
      expect(res.status).toBe(403);
      expect((await res.json()).error).toBe('readonly');
      expect(await readFile(inRoot('.bmad', 'sprint-status.yaml'), 'utf8')).toBe(before);
    }
  );
});

describe('failed or obstructed writes', () => {
  it('a failed frontmatter write leaves the story file untouched and no temp file behind', async () => {
    await setup({ yaml: null, files: { [`${STORIES}/US-010-fm.md`]: FRONTMATTER_STORY } });
    hooks.failWrite = (file) => file.includes('.md.tmp-');

    const res = await call('PATCH', '/api/stories/US-010/status', { status: 'ready-for-dev' });

    expect(res).toEqual({ status: 500, body: { error: 'write_failed' } });
    expect(await readFile(inRoot(STORIES, 'US-010-fm.md'), 'utf8')).toBe(FRONTMATTER_STORY);
    expect(await readdir(inRoot(STORIES))).toEqual(['US-010-fm.md']);
  });

  it('POST /api/sprints: a file squatting the new sprint folder name answers 409 and stays as is', async () => {
    await setup({ files: { 'project-management/sprints/sprint-2-beta': 'not a folder\n' } });

    const res = await call('POST', '/api/sprints', { name: 'Beta', start_date: '2026-11-16', end_date: '2026-11-27' });

    expect(res).toEqual({ status: 409, body: { error: 'sprint_exists' } });
    expect(await readFile(inRoot('project-management', 'sprints', 'sprint-2-beta'), 'utf8')).toBe('not a folder\n');
  });

  it('GET /api/sprints/:id degrades to goal null when sprint-goal.md became unreadable', async () => {
    const goal = 'project-management/sprints/sprint-1-a/sprint-goal.md';
    await setup({ files: { [goal]: '# Sprint 1 : A\n' } });
    await rm(inRoot(goal));
    await mkdir(inRoot(goal)); // EISDIR on read, after the last refresh

    const res = await call('GET', '/api/sprints/sprint-1-a');

    expect(res.status).toBe(200);
    expect(res.body.goal).toBeNull();
  });
});
