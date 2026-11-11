import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fc from 'fast-check';
import { mkdtemp, mkdir, cp, rm, readFile, writeFile, readdir, symlink } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import process from 'node:process';
import { setTimeout as delay } from 'node:timers/promises';
import { setTimeout } from 'node:timers';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as jsYaml from 'js-yaml';
import {
  mutateSprintStatus,
  revOf,
  ConflictError,
  InvalidStatusFileError,
  LockedError,
} from '../../cli/kanban/server/services/status-store.js';
import { LockedError as LockModuleLockedError } from '../../cli/kanban/server/services/lock.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(__dirname, '../..');
const WRANDLY = path.join(REPO, 'tests/fixtures/wrandly-anon/.bmad/sprint-status.yaml');
const BMAD = path.join(REPO, 'tests/fixtures/bmad-sprint-status/.bmad/sprint-status.yaml');
const TEMPLATE = path.join(REPO, 'Project/templates/sprint-status.yaml.template');

const UNKNOWN_KEYS_YAML = `# header comment
version: "1.0"
last_sync: "2026-06-15T12:00:00Z"

metadata:
  sprint_id: "sprint-1"
  name: "Sprint 1"
  start_date: "2026-06-01"
  end_date: "2026-06-14"
  goal: "Ship" # inline comment

archived_sprints:
  sprint-0:
    name: "Zero"
    stories:
      US-000: { status: done, points: 2 }

stories:
  US-001:
    title: "First"
    status: "in-progress"
    previous_status: "ready-for-dev"
    claimed_by: "worker-1"
    claimed_at: "2026-06-02T10:00:00Z"
    tdd_updated_at: "2026-06-02T11:00:00Z"
    story_points: 3
    history: []

  US-002:
    title: "Second"
    status: "done"
    previous_status: "review"
    completed_at: "2026-06-03T10:00:00Z"
    story_points: 5

  US-003:
    title: "Third"
    status: "blocked"
    previous_status: "in-progress"
    failed_at: "2026-06-04T10:00:00Z"
    blocked_reason: "waiting"

routing:
  auto_transitions:
    enabled: true

gates:
  review:
    checks:
      - "all_tests_pass"
`;

const TEMPLATE_VALUES = {
  STORY_ID: 'US-001',
  EPIC_ID: 'EPIC-001',
  TIMESTAMP: '2026-06-01T00:00:00Z',
  START_DATE: '2026-06-01',
  END_DATE: '2026-06-14',
};

let dir;
let root;
let yamlPath;

beforeEach(async () => {
  dir = await mkdtemp(path.join(tmpdir(), 'status-store-'));
  root = path.join(dir, 'project');
  yamlPath = path.join(root, '.bmad', 'sprint-status.yaml');
  await mkdir(path.dirname(yamlPath), { recursive: true });
});

afterEach(async () => {
  await rm(dir, { recursive: true, force: true });
});

const install = async (text) => writeFile(yamlPath, text, 'utf8');
const installFrom = async (file) => cp(file, yamlPath);
const current = async () => readFile(yamlPath, 'utf8');
const leftovers = async () =>
  (await readdir(path.dirname(yamlPath))).filter((f) => f.includes('.tmp-') || f.endsWith('.lock'));
const templateText = async () =>
  (await readFile(TEMPLATE, 'utf8')).replace(/\{([A-Z_]+)\}/g, (_, k) => TEMPLATE_VALUES[k] ?? k.toLowerCase());

/** Line range [start, end) of a story block under `stories:` (2-space indent). */
function storyRange(lines, id) {
  const start = lines.indexOf(`  ${id}:`);
  let end = start + 1;
  while (end < lines.length && !/^ {0,2}\S/.test(lines[end])) end++;
  return [start, end];
}

/** Asserts that everything outside the story block is byte-identical. */
function expectOnlyStoryChanged(before, after, id) {
  const a = before.split('\n');
  const b = after.split('\n');
  const [start, endA] = storyRange(a, id);
  const [startB, endB] = storyRange(b, id);
  expect(start).toBeGreaterThan(0);
  expect(startB).toBe(start);
  expect(b.slice(0, start)).toEqual(a.slice(0, start));
  expect(b.slice(endB)).toEqual(a.slice(endA));
}

/** JS port of the shell fallback: grep -A 5 "^  ${id}:" | grep "status:" | head -1 */
function shellStatus(text, id) {
  const lines = text.split('\n');
  const at = lines.findIndex((l) => l.startsWith(`  ${id}:`));
  if (at < 0) return null;
  const line = lines.slice(at, at + 6).find((l) => l.includes('status:'));
  return line?.replace(/^.*status:\s*/, '').replace(/^"|"$/g, '') ?? null;
}

const setStatus = (id, status, previous) => (tx) => tx.setStory(id, { status, previous_status: previous });

describe('mutateSprintStatus — format preservation', () => {
  it.each([
    ['wrandly-anon', WRANDLY, 'US-E4-03'],
    ['bmad-sprint-status', BMAD, 'US-E1-01'],
  ])('%s: a status change only touches the lines of that story', async (_name, fixture, id) => {
    await installFrom(fixture);
    const before = await current();

    await mutateSprintStatus(root, setStatus(id, 'review', 'in-progress'));

    const after = await current();
    expectOnlyStoryChanged(before, after, id);
    const changed = after.split('\n').filter((l, i) => l !== before.split('\n')[i]);
    expect(changed).toEqual(['    status: "review"', '    previous_status: "in-progress"']);
  });

  it('keeps header comments, inline comments and flow entries of archived_sprints', async () => {
    await installFrom(WRANDLY);

    await mutateSprintStatus(root, (tx) => {
      tx.setStory('US-E4-03', { status: 'review' });
      tx.appendHistory('US-E4-03', { from: 'in-progress', to: 'review', by: 'kanban', reason: '' });
    });

    const after = await current();
    expect(after.startsWith('# BMAD v6 - Sprint Status (ANONYMIZED FIXTURE')).toBe(true);
    expect(after).toContain('# Sprints clôturés. Détail dans project-management/sprints/*/sprint-review.md');
    expect(after).toContain('      US-E0-01: { status: done, points: 3, commit: "a1b2c3d" }');
    expect(Object.keys(jsYaml.load(after))).toEqual(Object.keys(jsYaml.load(await readFile(WRANDLY, 'utf8'))));
  });

  it('keeps the template layout (placeholders filled) around the mutated story', async () => {
    await install(await templateText());
    const before = await current();

    await mutateSprintStatus(root, setStatus('US-001', 'ready-for-dev', 'backlog'));

    expectOnlyStoryChanged(before, await current(), 'US-001');
  });

  it('appends history in block style when the list was an empty flow []', async () => {
    await installFrom(WRANDLY);

    await mutateSprintStatus(
      root,
      (tx) => tx.appendHistory('US-E4-03', { from: 'in-progress', to: 'review', by: 'kanban:alice', reason: 'r' }),
      { now: () => new Date('2026-07-30T10:00:00Z') }
    );

    const after = await current();
    expect(after).toContain(
      [
        '    history:',
        '      - timestamp: "2026-07-30T10:00:00.000Z"',
        '        from: "in-progress"',
        '        to: "review"',
        '        by: "kanban:alice"',
        '        reason: "r"',
      ].join('\n')
    );
  });

  it('fills timestamp, by and reason defaults in history entries', async () => {
    await install(UNKNOWN_KEYS_YAML);

    const { data } = await mutateSprintStatus(root, (tx) => tx.appendHistory('US-001', { from: 'a', to: 'b' }), {
      now: () => new Date('2026-01-02T03:04:05Z'),
    });

    expect(data.stories['US-001'].history).toEqual([
      { timestamp: '2026-01-02T03:04:05.000Z', from: 'a', to: 'b', by: 'kanban', reason: '' },
    ]);
  });
});

describe('mutateSprintStatus — unknown keys survive (property)', () => {
  const ids = ['US-001', 'US-002', 'US-003'];
  const text = fc.string({ unit: 'binary-ascii', maxLength: 30 });
  const op = fc.oneof(
    fc.record({ kind: fc.constant('set'), id: fc.constantFrom(...ids), status: fc.constantFrom('review', 'done') }),
    fc.record({ kind: fc.constant('note'), id: fc.constantFrom(...ids), note: text }),
    fc.record({ kind: fc.constant('history'), id: fc.constantFrom(...ids), reason: text }),
    fc.record({ kind: fc.constant('goal'), goal: text })
  );
  const apply = (tx, o) => {
    if (o.kind === 'set') tx.setStory(o.id, { status: o.status });
    if (o.kind === 'note') tx.setStory(o.id, { note: o.note });
    if (o.kind === 'history') tx.appendHistory(o.id, { from: 'x', to: 'y', reason: o.reason });
    if (o.kind === 'goal') tx.setMetadata({ goal: o.goal });
  };
  const STORY_KEYS = { set: ['status'], note: ['note'], history: ['history'], goal: [] };

  it('leaves every untargeted value identical and applies the targeted ones', async () => {
    const original = jsYaml.load(UNKNOWN_KEYS_YAML);
    await fc.assert(
      fc.asyncProperty(fc.array(op, { minLength: 1, maxLength: 6 }), async (ops) => {
        await install(UNKNOWN_KEYS_YAML);
        for (const o of ops) await mutateSprintStatus(root, (tx) => apply(tx, o));

        const after = jsYaml.load(await current());
        for (const key of ['version', 'last_sync', 'archived_sprints', 'routing', 'gates']) {
          expect(after[key]).toEqual(original[key]);
        }
        for (const id of ids) {
          const touched = ops.filter((o) => o.id === id).flatMap((o) => STORY_KEYS[o.kind]);
          for (const [k, v] of Object.entries(original.stories[id])) {
            if (!touched.includes(k)) expect(after.stories[id][k]).toEqual(v);
          }
          const lastNote = ops.filter((o) => o.id === id && o.kind === 'note').at(-1);
          if (lastNote) expect(after.stories[id].note).toBe(lastNote.note);
          const reasons = ops.filter((o) => o.id === id && o.kind === 'history').map((o) => o.reason);
          expect((after.stories[id].history ?? []).map((h) => h.reason)).toEqual(reasons);
        }
        const lastGoal = ops.filter((o) => o.kind === 'goal').at(-1);
        expect(after.metadata.goal).toBe(lastGoal ? lastGoal.goal : 'Ship');
      }),
      { numRuns: 40 }
    );
  });
});

describe('mutateSprintStatus — shell compatibility', () => {
  it('addStory then setStory: the grep fallback sees the current status, not previous_status', async () => {
    await install(UNKNOWN_KEYS_YAML);

    await mutateSprintStatus(root, (tx) => {
      tx.addStory('US-010', { story_points: 2, previous_status: '', status: 'backlog', title: 'New' });
      tx.addStory('TT-05', { title: 'Tech', status: 'ready-for-dev', previous_status: 'backlog', sprint_id: null });
    });
    await mutateSprintStatus(root, setStatus('US-010', 'ready-for-dev', 'backlog'));

    const text = await current();
    const data = jsYaml.load(text);
    for (const [id, story] of Object.entries(data.stories)) expect(shellStatus(text, id)).toBe(story.status);
    expect(text).toContain(
      [
        '  US-010:',
        '    title: "New"',
        '    status: "ready-for-dev"',
        '    previous_status: "backlog"',
        '    story_points: 2',
      ].join('\n')
    );
    expect(text).toMatch(
      /\n {2}TT-05:\n {4}title: "Tech"\n {4}status: "ready-for-dev"\n {4}previous_status: "backlog"\n {4}sprint_id: null\n/
    );
  });

  it('rewrites a flow-style story in block style when we touch it', async () => {
    await install(
      UNKNOWN_KEYS_YAML.replace('\nstories:\n', '\nstories:\n  US-009: { title: "Flow", status: backlog }\n')
    );

    await mutateSprintStatus(root, setStatus('US-009', 'ready-for-dev', 'backlog'));

    const text = await current();
    expect(text).toContain('  US-009:\n    title: "Flow"\n    status: ready-for-dev\n');
    expect(shellStatus(text, 'US-009')).toBe('ready-for-dev');
  });

  it('keeps multi-line values on one double-quoted line so grep cannot be fooled', async () => {
    await install(UNKNOWN_KEYS_YAML);

    await mutateSprintStatus(root, (tx) => {
      tx.addStory('US-011', { title: 'evil\nstatus: done\n  US-001:', status: 'backlog' });
      tx.setStory('US-001', { title: 'line1\r\nstatus: done' });
    });

    const text = await current();
    expect(shellStatus(text, 'US-011')).toBe('backlog');
    expect(shellStatus(text, 'US-001')).toBe('in-progress');
    expect(text).toContain('    title: "evil\\nstatus: done\\n  US-001:"');
    expect(jsYaml.load(text).stories['US-011'].title).toBe('evil\nstatus: done\n  US-001:');
    expect(text).toContain('  US-001:\n    status: "in-progress"\n    title: "line1\\r\\nstatus: done"\n');
  });

  it.each([
    ['a key containing "status" before it', '    title: "T"\n    tdd_status: x\n    status: "review"\n'],
    ['a block scalar before it', '    title: |-\n      a\n      b\n    status: "review"\n'],
    ['a comment before it', '    title: "T" # status: done\n    status: "review"\n'],
    ['a collection before it', '    tags:\n      - a\n    title: "T"\n    status: "review"\n'],
    ['too many lines before it', '    title: "T"\n    a: 1\n    b: 2\n    c: 3\n    status: "review"\n'],
  ])('moves status first when %s would fool grep', async (_name, body) => {
    await install(UNKNOWN_KEYS_YAML.replace('\nstories:\n', `\nstories:\n  US-020:\n${body}`));

    await mutateSprintStatus(root, (tx) => tx.setStory('US-020', { status: 'done' }));

    const text = await current();
    expect(text).toContain('  US-020:\n    status: "done"\n');
    expect(shellStatus(text, 'US-020')).toBe('done');
  });

  it('leaves a grep-safe story order untouched', async () => {
    await install(
      UNKNOWN_KEYS_YAML.replace(
        '\nstories:\n',
        '\nstories:\n  US-020:\n    title: T\n    a: 1\n    b: 2\n    status: backlog\n'
      )
    );

    await mutateSprintStatus(root, (tx) => tx.setStory('US-020', { status: 'done' }));

    expect(await current()).toContain('  US-020:\n    title: T\n    a: 1\n    b: 2\n    status: done\n');
  });

  it('adds stories in block style into an empty flow map', async () => {
    await install('version: "1.0"\nmetadata: { sprint_id: s, name: n, start_date: "", end_date: "" }\nstories: {}\n');

    await mutateSprintStatus(root, (tx) => tx.addStory('US-001', { title: 'A', status: 'backlog' }));

    expect(await current()).toContain('stories:\n  US-001:\n    title: "A"\n    status: "backlog"\n');
  });

  it('creates the stories map in block style when the file has none', async () => {
    await install('version: "1.0"\nmetadata:\n  sprint_id: s\n  name: n\n  start_date: ""\n  end_date: ""\n');

    await mutateSprintStatus(root, (tx) => tx.addStory('US-001', { title: 'A', status: 'backlog' }));

    expect(await current()).toMatch(/\nstories:\n {2}US-001:\n {4}title: "A"\n {4}status: "backlog"\n$/);
  });

  it('separates a new story with a blank line when existing stories are', async () => {
    await install(UNKNOWN_KEYS_YAML);

    await mutateSprintStatus(root, (tx) => tx.addStory('US-012', { title: 'Z', status: 'backlog' }));

    expect(await current()).toContain('    blocked_reason: "waiting"\n\n  US-012:\n');
  });
});

describe('mutateSprintStatus — tx API', () => {
  beforeEach(() => install(UNKNOWN_KEYS_YAML));

  it('exposes a frozen snapshot and returns the written data with a 12-hex version', async () => {
    let seen;
    const result = await mutateSprintStatus(root, (tx) => {
      seen = tx.data;
      expect(() => {
        tx.data.stories['US-001'].status = 'x';
      }).toThrow(TypeError);
      tx.setStory('US-001', { status: 'review' });
    });

    expect(seen.stories['US-001'].status).toBe('in-progress');
    expect(result.data.stories['US-001'].status).toBe('review');
    expect(result.version).toMatch(/^[0-9a-f]{12}$/);
    const { createHash } = await import('node:crypto');
    expect(result.version).toBe(
      createHash('sha1')
        .update(await current())
        .digest('hex')
        .slice(0, 12)
    );
  });

  it('supports an async mutate function', async () => {
    await mutateSprintStatus(root, async (tx) => {
      await delay(5);
      tx.setStory('US-002', { story_points: 8 });
    });

    expect(jsYaml.load(await current()).stories['US-002'].story_points).toBe(8);
  });

  it('writes null as is with setStory', async () => {
    await mutateSprintStatus(root, (tx) => tx.setStory('US-001', { sprint_id: null, claimed_by: null }));

    const story = jsYaml.load(await current()).stories['US-001'];
    expect(story.sprint_id).toBeNull();
    expect(story.claimed_by).toBeNull();
  });

  it('writes objects and arrays with setStory without anchors for shared references', async () => {
    const shared = { total: 1, completed: 0, list: ['a'] };
    await mutateSprintStatus(root, (tx) => tx.setStory('US-001', { tasks: shared, mirror: shared }));

    const text = await current();
    expect(text).not.toMatch(/[&*]a\d/);
    expect(jsYaml.load(text).stories['US-001'].mirror).toEqual(shared);
  });

  it('quotes strings that js-yaml would read as another type, keeps safe plain scalars plain', async () => {
    await install(
      UNKNOWN_KEYS_YAML.replace('    story_points: 3\n', '    story_points: 3\n    note: plain\n    owner: bob\n')
    );

    await mutateSprintStatus(root, (tx) =>
      tx.setStory('US-001', { note: '2026-01-01', owner: 'alice', claimed_at: '2026-06-02' })
    );

    const text = await current();
    expect(text).toContain('    note: "2026-01-01"\n    owner: alice\n');
    const story = jsYaml.load(text).stories['US-001'];
    expect(story).toMatchObject({ note: '2026-01-01', claimed_at: '2026-06-02', owner: 'alice' });
  });

  it('removes a story', async () => {
    await mutateSprintStatus(root, (tx) => tx.removeStory('US-002'));

    expect(Object.keys(jsYaml.load(await current()).stories)).toEqual(['US-001', 'US-003']);
  });

  it('sets metadata fields and root keys', async () => {
    await mutateSprintStatus(root, (tx) => {
      tx.setMetadata({ closed_date: '2026-06-14', goal: 'Done' });
      tx.setRoot('last_sync', '2026-06-14T00:00:00Z');
      tx.setRoot('custom', { a: [1, 2] });
    });

    const data = jsYaml.load(await current());
    expect(data.metadata).toMatchObject({ closed_date: '2026-06-14', goal: 'Done', sprint_id: 'sprint-1' });
    expect(data.last_sync).toBe('2026-06-14T00:00:00Z');
    expect(data.custom).toEqual({ a: [1, 2] });
  });

  it.each([
    ['setStory on an unknown story', (tx) => tx.setStory('US-404', { status: 'done' })],
    ['appendHistory on an unknown story', (tx) => tx.appendHistory('US-404', { from: 'a', to: 'b' })],
    ['addStory on an existing id', (tx) => tx.addStory('US-001', { title: 'x', status: 'backlog' })],
    ['an invalid story id', (tx) => tx.addStory('US-1\n  x', { title: 'x', status: 'backlog' })],
    ['a __proto__ story id', (tx) => tx.setStory('__proto__', { status: 'done' })],
    ['a __proto__ field', (tx) => tx.setStory('US-001', JSON.parse('{"__proto__": {"x": 1}}'))],
    ['a field name with a newline', (tx) => tx.setStory('US-001', { 'a\nb': 1 })],
    ['an invalid root key', (tx) => tx.setRoot('a: b', 1)],
    ['an invalid metadata key', (tx) => tx.setMetadata({ constructor: 1 })],
    ['a non-object fields argument', (tx) => tx.setStory('US-001', null)],
  ])('rejects %s and leaves the file unchanged', async (_name, mutate) => {
    const before = await current();

    await expect(mutateSprintStatus(root, mutate)).rejects.toThrow();

    expect(await current()).toBe(before);
    expect(await leftovers()).toEqual([]);
  });

  it('stores YAML-looking values as plain strings (no alias, anchor or key injection)', async () => {
    const values = [
      '*alias',
      '&anchor x',
      '<<: *a',
      'key: value',
      '- item',
      '# not a comment',
      '{a: 1}',
      'null',
      '123',
    ];

    const { data } = await mutateSprintStatus(root, (tx) => {
      values.forEach((v, i) => tx.setStory('US-001', { [`f${i}`]: v }));
    });

    values.forEach((v, i) => expect(data.stories['US-001'][`f${i}`]).toBe(v));
    expect(jsYaml.load(await current()).stories['US-001'].f8).toBe('123');
  });
});

describe('mutateSprintStatus — locking and concurrency', () => {
  beforeEach(() => install(UNKNOWN_KEYS_YAML));

  it('re-exports the LockedError of lock.js', () => {
    expect(LockedError).toBe(LockModuleLockedError);
  });

  it('reclaims an orphan lock (stale timestamp)', async () => {
    await writeFile(`${yamlPath}.lock`, JSON.stringify({ pid: process.pid, ts: Date.now() - 60_000 }));

    await mutateSprintStatus(root, setStatus('US-001', 'review', 'in-progress'));

    expect(jsYaml.load(await current()).stories['US-001'].status).toBe('review');
    expect(await leftovers()).toEqual([]);
  });

  it('throws LockedError while a live writer holds the lock, file unchanged', async () => {
    await writeFile(`${yamlPath}.lock`, JSON.stringify({ pid: process.pid, ts: Date.now() }));
    const before = await current();

    await expect(mutateSprintStatus(root, setStatus('US-001', 'review', 'x'))).rejects.toBeInstanceOf(LockedError);

    expect(await current()).toBe(before);
    expect(await readdir(path.dirname(yamlPath))).toEqual(['sprint-status.yaml', 'sprint-status.yaml.lock']);
  });

  it('serializes concurrent mutations: no update is lost', async () => {
    const slow = (i) => async (tx) => {
      await delay(30);
      tx.appendHistory('US-001', { from: 'a', to: 'b', reason: `r${i}` });
    };

    await Promise.all(Array.from({ length: 12 }, (_, i) => mutateSprintStatus(root, slow(i))));

    const reasons = jsYaml.load(await current()).stories['US-001'].history.map((h) => h.reason);
    expect(reasons).toEqual(Array.from({ length: 12 }, (_, i) => `r${i}`));
    expect(await leftovers()).toEqual([]);
  });

  it('keeps serving the queue after a failed mutation', async () => {
    const failing = mutateSprintStatus(root, () => {
      throw new Error('boom');
    });
    const next = mutateSprintStatus(root, setStatus('US-001', 'review', 'in-progress'));

    await expect(failing).rejects.toThrow('boom');
    await expect(next).resolves.toMatchObject({ version: expect.any(String) });
  });

  it('refuses to write when the mutation outlived the lock TTL', async () => {
    const before = await current();
    const slow = async (tx) => {
      await delay(60);
      tx.setStory('US-001', { status: 'review' });
    };

    await expect(mutateSprintStatus(root, slow, { lockTtlMs: 20 })).rejects.toBeInstanceOf(LockedError);

    expect(await current()).toBe(before);
    expect(await leftovers()).toEqual([]);
  });

  it('aborts with ConflictError when the file changes on disk during the mutation (unlocked writer)', async () => {
    const before = await current();
    const external = before.replace('goal: "Ship"', 'goal: "Changed by yq"');

    const err = await mutateSprintStatus(root, async (tx) => {
      await writeFile(yamlPath, external);
      tx.setStory('US-001', { status: 'review' });
    }).catch((e) => e);

    expect(err).toBeInstanceOf(ConflictError);
    expect(err.reason).toBe('file_changed');
    expect(await current()).toBe(external);
    expect(await leftovers()).toEqual([]);
  });

  it('removes tmp files left by a dead writer, keeps those of live processes', async () => {
    const bmad = path.dirname(yamlPath);
    const dead = path.join(bmad, 'sprint-status.yaml.tmp-999999999-dead');
    const alive = path.join(bmad, 'sprint-status.yaml.tmp-1-alive'); // pid 1 always exists
    const own = path.join(bmad, `sprint-status.yaml.tmp-${process.pid}-old`);
    const other = path.join(bmad, 'notes.tmp-999999999-x');
    await Promise.all([dead, alive, own, other].map((f) => writeFile(f, 'partial')));

    await mutateSprintStatus(root, setStatus('US-001', 'review', 'in-progress'));

    const names = await readdir(bmad);
    expect(names).not.toContain(path.basename(dead));
    expect(names).not.toContain(path.basename(own));
    expect(names).toContain(path.basename(alive));
    expect(names).toContain(path.basename(other));
  });
});

describe('mutateSprintStatus — invalid input or result', () => {
  const expectInvalid = async (kind, mutate = setStatus('US-001', 'review', 'x'), opts) => {
    const before = await current().catch(() => null);
    const err = await mutateSprintStatus(root, mutate, opts).catch((e) => e);
    expect(err).toBeInstanceOf(InvalidStatusFileError);
    expect(err.kind).toBe(kind);
    expect(Array.isArray(err.issues)).toBe(true);
    expect(await current().catch(() => null)).toBe(before);
    expect(await leftovers()).toEqual([]);
    return err;
  };

  it('YAML syntax error → InvalidStatusFileError, file unchanged byte for byte', async () => {
    await install('version: "1.0"\nstories:\n  US-001: [unclosed\n');
    const err = await expectInvalid('syntax');
    expect(err.issues.length).toBeGreaterThan(0);
  });

  it('duplicate keys → syntax error', async () => {
    await install(UNKNOWN_KEYS_YAML.replace('  US-002:', '  US-001:'));
    await expectInvalid('syntax');
  });

  it('several documents in one file → syntax error', async () => {
    await install(`${UNKNOWN_KEYS_YAML}---\nother: 1\n`);
    await expectInvalid('syntax');
  });

  it('alias bomb → syntax error instead of memory exhaustion', async () => {
    const levels = ['a: &a [1,1,1,1,1,1,1,1,1,1]'];
    for (const [p, n] of [
      ['a', 'b'],
      ['b', 'c'],
      ['c', 'd'],
    ])
      levels.push(`${n}: &${n} [${Array(10).fill(`*${p}`).join(',')}]`);
    await install(`${UNKNOWN_KEYS_YAML}${levels.join('\n')}\n`);
    await expectInvalid('syntax');
  });

  it('schema error → InvalidStatusFileError with zod issues, file unchanged', async () => {
    await install(UNKNOWN_KEYS_YAML.replace('status: "done"', 'status: "shipped"'));
    const err = await expectInvalid('schema');
    expect(err.issues[0].path).toEqual(['stories', 'US-002', 'status']);
  });

  it('invalid result after mutation → InvalidStatusFileError(result), file unchanged', async () => {
    await install(UNKNOWN_KEYS_YAML);
    await expectInvalid('result', setStatus('US-001', 'shipped', 'x'));
  });

  it('refuses a file larger than the size cap', async () => {
    await install(`${UNKNOWN_KEYS_YAML}# ${'x'.repeat(5 * 1024 * 1024)}\n`);
    await expectInvalid('too_large');
  });

  it('refuses a symlink instead of replacing it by a regular file', async () => {
    const target = path.join(dir, 'elsewhere.yaml');
    await writeFile(target, UNKNOWN_KEYS_YAML);
    await symlink(target, yamlPath);
    await expectInvalid('not_regular');
    expect(await readFile(target, 'utf8')).toBe(UNKNOWN_KEYS_YAML);
  });

  it('missing file without create → InvalidStatusFileError(missing), nothing created', async () => {
    await expectInvalid('missing');
    expect(await readdir(path.dirname(yamlPath))).toEqual([]);
  });

  it('a mutate error leaves the file unchanged and no residue', async () => {
    await install(UNKNOWN_KEYS_YAML);
    const before = await current();

    await expect(
      mutateSprintStatus(root, (tx) => {
        tx.setStory('US-001', { status: 'review' });
        throw new ConflictError('stale', { status: 'review' });
      })
    ).rejects.toMatchObject({ code: 'CONFLICT', reason: 'stale', current: { status: 'review' } });

    expect(await current()).toBe(before);
    expect(await leftovers()).toEqual([]);
  });
});

describe('mutateSprintStatus — create', () => {
  it('creates the file (and .bmad/) when asked, from the minimal skeleton', async () => {
    await rm(path.dirname(yamlPath), { recursive: true });

    const { data } = await mutateSprintStatus(
      root,
      (tx) => {
        expect(tx.data).toEqual({ version: '1.0', metadata: {}, stories: {} });
        tx.setMetadata({ sprint_id: 's1', name: 'S1', start_date: '', end_date: '' });
        tx.addStory('US-001', { title: 'A', status: 'backlog' });
      },
      { create: true }
    );

    expect(data.stories['US-001'].status).toBe('backlog');
    const text = await current();
    expect(text.startsWith('version: "1.0"\nmetadata:\n  sprint_id: "s1"\n')).toBe(true);
    expect(shellStatus(text, 'US-001')).toBe('backlog');
  });

  it('refuses to create a file whose result does not satisfy the schema', async () => {
    const err = await mutateSprintStatus(root, () => {}, { create: true }).catch((e) => e);

    expect(err).toBeInstanceOf(InvalidStatusFileError);
    expect(err.kind).toBe('result');
    expect(await readdir(path.dirname(yamlPath))).toEqual([]);
  });

  it('does not overwrite a file created by someone else meanwhile', async () => {
    const err = await mutateSprintStatus(
      root,
      async (tx) => {
        await writeFile(yamlPath, UNKNOWN_KEYS_YAML);
        tx.setMetadata({ sprint_id: 's1', name: 'S1', start_date: '', end_date: '' });
      },
      { create: true }
    ).catch((e) => e);

    expect(err).toBeInstanceOf(ConflictError);
    expect(await current()).toBe(UNKNOWN_KEYS_YAML);
  });

  it('create: true on an existing file mutates it normally', async () => {
    await install(UNKNOWN_KEYS_YAML);

    await mutateSprintStatus(root, setStatus('US-001', 'review', 'in-progress'), { create: true });

    expect(jsYaml.load(await current()).stories['US-001'].status).toBe('review');
  });
});

describe('revOf', () => {
  it('is a 12-hex sha1 independent of key order, at every depth', () => {
    const a = { title: 'x', status: 'backlog', tasks: { total: 1, list: ['a'] } };
    const b = { tasks: { list: ['a'], total: 1 }, status: 'backlog', title: 'x' };

    expect(revOf(a)).toMatch(/^[0-9a-f]{12}$/);
    expect(revOf(a)).toBe(revOf(b));
  });

  it('changes when a value, an array order or a key changes', () => {
    const base = { status: 'backlog', list: ['a', 'b'] };

    expect(revOf({ ...base, status: 'done' })).not.toBe(revOf(base));
    expect(revOf({ ...base, list: ['b', 'a'] })).not.toBe(revOf(base));
    expect(revOf({ ...base, extra: null })).not.toBe(revOf(base));
  });

  it('hashes the sorted JSON (known value) and accepts primitives and undefined', async () => {
    const { createHash } = await import('node:crypto');
    const sha = (s) => createHash('sha1').update(s).digest('hex').slice(0, 12);

    expect(revOf({ b: 1, a: [true, null] })).toBe(sha('{"a":[true,null],"b":1}'));
    expect(revOf('x')).toBe(sha('"x"'));
    expect(revOf(undefined)).toBe(sha('null'));
  });
});

describe('error classes', () => {
  it('ConflictError carries code, reason and current', () => {
    const err = new ConflictError('stale', { status: 'done' });
    expect(err).toBeInstanceOf(Error);
    expect(err).toMatchObject({ code: 'CONFLICT', reason: 'stale', current: { status: 'done' } });
    expect(new ConflictError().reason).toBe('conflict');
    expect(new ConflictError().current).toBeNull();
  });

  it('InvalidStatusFileError carries code, kind and issues', () => {
    const err = new InvalidStatusFileError('schema', [{ path: ['x'] }]);
    expect(err).toMatchObject({ code: 'SPRINT_STATUS_INVALID', kind: 'schema', issues: [{ path: ['x'] }] });
    expect(err.message).toContain('schema');
    expect(new InvalidStatusFileError('missing').issues).toEqual([]);
  });
});

describe('lock wait, tx.version and tx.setArchive', () => {
  it('waits for a shell writer that holds the lock for a few hundred ms', async () => {
    await install(UNKNOWN_KEYS_YAML);
    await writeFile(`${yamlPath}.lock`, JSON.stringify({ pid: process.pid, ts: Date.now() }));
    setTimeout(() => rm(`${yamlPath}.lock`), 500);

    await expect(mutateSprintStatus(root, (tx) => tx.setStory('US-001', { story_points: 4 }))).resolves.toBeDefined();

    expect(jsYaml.load(await current()).stories['US-001'].story_points).toBe(4);
  });

  it('exposes the version of the text read under the lock (null when the file is created)', async () => {
    await install(UNKNOWN_KEYS_YAML);
    const first = await mutateSprintStatus(root, (tx) => tx.setStory('US-001', { story_points: 4 }));
    let seen;
    await mutateSprintStatus(root, (tx) => void (seen = tx.version));
    expect(seen).toBe(first.version);

    await rm(yamlPath);
    let created = 'unset';
    await mutateSprintStatus(
      root,
      (tx) => {
        created = tx.version;
        tx.setMetadata({ sprint_id: 's', name: 'S', start_date: '2026-01-01', end_date: '2026-01-02' });
      },
      { create: true }
    );
    expect(created).toBeNull();
  });

  it('setArchive adds a closed sprint without touching the existing ones, stories in flow style', async () => {
    await install(UNKNOWN_KEYS_YAML);
    const before = await current();

    await mutateSprintStatus(root, (tx) =>
      tx.setArchive('sprint-1', {
        name: 'One',
        closed_date: '2026-06-14',
        stories: { 'US-002': { status: 'done', points: 5 } },
      })
    );

    const after = await current();
    expect(after).toContain('      US-000: { status: done, points: 2 }');
    expect(after).toContain('# header comment');
    expect(after).toMatch(/US-002: \{ status: "?done"?, points: 5 \}/);
    expect(jsYaml.load(after).archived_sprints['sprint-1'].stories['US-002']).toEqual({ status: 'done', points: 5 });
    expect(after).toContain(before.slice(before.lastIndexOf('\nstories:')));
  });
});
