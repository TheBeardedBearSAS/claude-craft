import process from 'node:process';
import { setTimeout } from 'node:timers';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtemp, rm, writeFile, readFile, stat, utimes } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import fsSync from 'node:fs';
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

  it('release leaves a lock that another process took over after expiry', async () => {
    const release = await acquireLock(lockPath);
    const theirs = JSON.stringify({ pid: process.pid, ts: Date.now() + 1 });
    await writeFile(lockPath, theirs);
    await release();
    expect(await readFile(lockPath, 'utf8')).toBe(theirs);
  });

  it('release leaves a lock taken over by another pid with the same ts', async () => {
    const release = await acquireLock(lockPath);
    const { ts } = JSON.parse(await readFile(lockPath, 'utf8'));
    const theirs = JSON.stringify({ pid: process.pid + 1, ts });
    await writeFile(lockPath, theirs);
    await release();
    expect(await readFile(lockPath, 'utf8')).toBe(theirs);
  });

  it('release does not fail when the lock file already vanished', async () => {
    const release = await acquireLock(lockPath);
    await rm(lockPath);
    await expect(release()).resolves.toBeUndefined();
  });

  // Seen on macOS with the shell twin of this lock (one update lost out of eight writers): a writer judges the lock
  // stale, the holder releases it and a third writer takes it, then the first one deletes that fresh lock.
  it('does not remove a lock that changed hands while it was being judged stale', async () => {
    await writeFile(lockPath, JSON.stringify({ pid: process.pid, ts: 1 })); // stale: far older than the TTL
    const fresh = JSON.stringify({ pid: process.pid, ts: Date.now() });
    let calls = 0;
    // The clock is read while the lock is judged: at that moment a third writer replaces it with its own.
    const now = () => {
      calls += 1;
      if (calls === 2) fsSync.writeFileSync(lockPath, fresh);
      return Date.now();
    };

    await expect(acquireLock(lockPath, { retries: 0, now })).rejects.toBeInstanceOf(LockedError);
    expect(await readFile(lockPath, 'utf8')).toBe(fresh);
  });
});
