import process from 'node:process';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { mkdtemp, mkdir, readFile, readdir, rm, symlink, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import * as jsYaml from 'js-yaml';
import {
  readWipLimits,
  updateWipLimits,
  wipWarnings,
  LockedError,
} from '../../cli/kanban/server/services/kanban-config.js';

let root;
let file;

beforeEach(async () => {
  root = await mkdtemp(path.join(tmpdir(), 'kanban-config-'));
  file = path.join(root, '.bmad', 'kanban.yaml');
});
afterEach(async () => {
  vi.restoreAllMocks();
  await rm(root, { recursive: true, force: true });
});

const install = async (text) => {
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, text);
};
const silence = () => vi.spyOn(globalThis.console, 'error').mockImplementation(() => {});

describe('readWipLimits', () => {
  it('returns no limit when the file is absent, without logging', async () => {
    const log = silence();
    expect(await readWipLimits(root)).toEqual({});
    expect(log).not.toHaveBeenCalled();
  });

  it('reads the configured limits', async () => {
    await install('version: 1\nwip_limits:\n  in-progress: 3\n  review: 2\n');
    expect(await readWipLimits(root)).toEqual({ 'in-progress': 3, review: 2 });
  });

  it('treats an empty file or an empty wip_limits as no limit', async () => {
    await install('');
    expect(await readWipLimits(root)).toEqual({});
    await install('version: 1\n');
    expect(await readWipLimits(root)).toEqual({});
  });

  it.each([
    ['broken yaml', 'wip_limits: [\n'],
    ['wrong version', 'version: 2\nwip_limits:\n  review: 2\n'],
    ['unknown status', 'version: 1\nwip_limits:\n  doing: 2\n'],
    ['zero limit', 'version: 1\nwip_limits:\n  review: 0\n'],
    ['not a map', '- a\n- b\n'],
  ])('ignores an invalid file (%s) and logs it', async (_, text) => {
    const log = silence();
    await install(text);
    expect(await readWipLimits(root)).toEqual({});
    expect(log).toHaveBeenCalledTimes(1);
    expect(String(log.mock.calls[0][0])).toContain('kanban.yaml');
  });

  it('does not follow a symlink to a file outside the project', async () => {
    const log = silence();
    const outside = path.join(root, 'outside.yaml');
    await writeFile(outside, 'version: 1\nwip_limits:\n  review: 2\n');
    await mkdir(path.dirname(file), { recursive: true });
    await symlink(outside, file);
    expect(await readWipLimits(root)).toEqual({});
    expect(log).toHaveBeenCalled();
  });
});

describe('updateWipLimits', () => {
  it('creates .bmad/kanban.yaml with version 1', async () => {
    const limits = await updateWipLimits(root, { 'in-progress': 3 });
    expect(limits).toEqual({ 'in-progress': 3 });
    expect(jsYaml.load(await readFile(file, 'utf8'))).toEqual({ version: 1, wip_limits: { 'in-progress': 3 } });
  });

  it('merges: a number sets, null removes, absent keys stay', async () => {
    await updateWipLimits(root, { 'in-progress': 3, review: 2 });
    const limits = await updateWipLimits(root, { review: null, blocked: 1 });
    expect(limits).toEqual({ 'in-progress': 3, blocked: 1 });
    expect(await readWipLimits(root)).toEqual(limits);
  });

  it('writes an empty map when the last limit is removed', async () => {
    await updateWipLimits(root, { review: 2 });
    expect(await updateWipLimits(root, { review: null })).toEqual({});
    expect(jsYaml.load(await readFile(file, 'utf8'))).toEqual({ version: 1, wip_limits: {} });
  });

  it('replaces an invalid file instead of failing', async () => {
    silence();
    await install('wip_limits: [\n');
    expect(await updateWipLimits(root, { review: 2 })).toEqual({ review: 2 });
  });

  it('leaves no tmp or lock file behind, even with concurrent writers', async () => {
    await Promise.all(
      ['backlog', 'ready-for-dev', 'in-progress', 'review', 'blocked'].map((s, i) =>
        updateWipLimits(root, { [s]: i + 1 })
      )
    );
    expect(Object.keys(await readWipLimits(root))).toHaveLength(5);
    expect(await readdir(path.dirname(file))).toEqual(['kanban.yaml']);
  });

  it('refuses with LockedError while a live writer holds the lock, file untouched', async () => {
    await install('version: 1\nwip_limits:\n  review: 2\n');
    await writeFile(`${file}.lock`, JSON.stringify({ pid: process.pid, ts: Date.now() }));
    await expect(
      updateWipLimits(root, { review: 5 }, { lockWait: { retries: 1, retryDelayMs: 1 } })
    ).rejects.toBeInstanceOf(LockedError);
    expect(await readWipLimits(root)).toEqual({ review: 2 });
  });
});

describe('wipWarnings', () => {
  const stories = [
    { status: 'in-progress' },
    { status: 'in-progress' },
    { status: 'in-progress' },
    { status: 'review' },
  ];

  it('warns when the column holds more stories than its limit', () => {
    expect(wipWarnings(stories, { 'in-progress': 2 }, 'in-progress')).toEqual(['wip_exceeded']);
  });

  it('counts the column as the board shows it: the stories of the active sprint only', () => {
    const mixed = [
      { status: 'in-progress', sprint_id: 'S1' },
      { status: 'in-progress', sprint_id: 'S1' },
      { status: 'in-progress', sprint_id: null },
      { status: 'in-progress', sprint_id: 'S2' },
    ];
    expect(wipWarnings(mixed, { 'in-progress': 2 }, 'in-progress', 'S1')).toEqual([]);
    expect(wipWarnings(mixed, { 'in-progress': 1 }, 'in-progress', 'S1')).toEqual(['wip_exceeded']);
    expect(wipWarnings(mixed, { 'in-progress': 3 }, 'in-progress', null)).toEqual(['wip_exceeded']);
  });

  it('does not warn at the limit', () => {
    expect(wipWarnings(stories, { 'in-progress': 3 }, 'in-progress')).toEqual([]);
  });

  it('does not warn without limit for that status', () => {
    expect(wipWarnings(stories, { review: 1 }, 'in-progress')).toEqual([]);
    expect(wipWarnings(stories, {}, 'in-progress')).toEqual([]);
    expect(wipWarnings(stories, { 'in-progress': null }, 'in-progress')).toEqual([]);
  });

  it('only counts the given status', () => {
    expect(wipWarnings(stories, { review: 1 }, 'review')).toEqual([]);
    expect(wipWarnings([...stories, { status: 'review' }], { review: 1 }, 'review')).toEqual(['wip_exceeded']);
  });
});
