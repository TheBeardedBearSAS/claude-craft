import process from 'node:process';
import { setTimeout } from 'node:timers';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtemp, rm, writeFile, readFile, stat, utimes } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { acquireLock, LockedError } from '../../cli/kanban/server/services/lock.js';

const FAST = { retries: 1, retryDelayMs: 1 };

async function exists(p) {
  return stat(p).then(
    () => true,
    () => false
  );
}

describe('lock', () => {
  let dir;
  let lockPath;

  beforeEach(async () => {
    dir = await mkdtemp(path.join(tmpdir(), 'kanban-lock-'));
    lockPath = path.join(dir, 'a.lock');
  });
  afterEach(() => rm(dir, { recursive: true, force: true }));

  it('writes { pid, ts } and removes the file on release', async () => {
    const release = await acquireLock(lockPath);
    const content = JSON.parse(await readFile(lockPath, 'utf8'));
    expect(content.pid).toBe(process.pid);
    expect(typeof content.ts).toBe('number');
    await release();
    expect(await exists(lockPath)).toBe(false);
  });

  it('release is idempotent', async () => {
    const release = await acquireLock(lockPath);
    await release();
    await expect(release()).resolves.toBeUndefined();
  });

  it('refuses a held lock with LockedError after retries', async () => {
    await acquireLock(lockPath);
    await expect(acquireLock(lockPath, FAST)).rejects.toBeInstanceOf(LockedError);
  });

  it('LockedError carries code LOCKED', async () => {
    await acquireLock(lockPath);
    await expect(acquireLock(lockPath, FAST)).rejects.toMatchObject({ code: 'LOCKED' });
  });

  it('steals a lock whose ts exceeds the TTL', async () => {
    await writeFile(lockPath, JSON.stringify({ pid: process.pid, ts: 1000 }));
    const release = await acquireLock(lockPath, { ...FAST, ttlMs: 500, now: () => 5000 });
    expect(JSON.parse(await readFile(lockPath, 'utf8')).pid).toBe(process.pid);
    await release();
  });

  it('steals a lock whose owner pid is dead', async () => {
    await writeFile(lockPath, JSON.stringify({ pid: 2 ** 22 + 12345, ts: Date.now() }));
    const release = await acquireLock(lockPath, FAST);
    await release();
    expect(await exists(lockPath)).toBe(false);
  });

  it('does not steal a fresh lock of a live pid', async () => {
    await writeFile(lockPath, JSON.stringify({ pid: process.pid, ts: Date.now() }));
    await expect(acquireLock(lockPath, FAST)).rejects.toBeInstanceOf(LockedError);
  });

  it('treats an unreadable old lock as stale based on mtime', async () => {
    await writeFile(lockPath, '');
    const old = new Date(Date.now() - 60_000);
    await utimes(lockPath, old, old);
    const release = await acquireLock(lockPath, { ...FAST, ttlMs: 10_000 });
    await release();
  });

  it('keeps an unreadable fresh lock', async () => {
    await writeFile(lockPath, '');
    await expect(acquireLock(lockPath, FAST)).rejects.toBeInstanceOf(LockedError);
  });

  it('retries until the holder releases', async () => {
    const release = await acquireLock(lockPath);
    setTimeout(release, 30);
    const next = await acquireLock(lockPath, { retries: 20, retryDelayMs: 20 });
    await next();
  });
});
