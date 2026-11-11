import { describe, it, expect } from 'vitest';
import { mkdtemp, writeFile, readFile, rm, stat, open, access, symlink, readlink, readdir } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { updateFrontmatter, LockedError, MtimeMismatchError } from '../../cli/kanban/server/services/file-writer.js';
import { parseString } from '../../cli/kanban/server/services/frontmatter.js';

async function makeStory(dir, name = 'US-001.md', body = 'Initial body') {
  const fp = path.join(dir, name);
  await writeFile(
    fp,
    `---\nid: US-001\ntitle: Login\nstatus: backlog\nstory_points: 3\n---\n${body}\n`,
  );
  return fp;
}

async function tmp() {
  return await mkdtemp(path.join(tmpdir(), 'kb-fw-'));
}

describe('updateFrontmatter', () => {
  it('merges patch into frontmatter', async () => {
    const dir = await tmp();
    try {
      const fp = await makeStory(dir);
      await updateFrontmatter(fp, { status: 'ready-for-dev', assigned_to: 'alice' });
      const raw = await readFile(fp, 'utf8');
      const { data, body } = parseString(raw);
      expect(data.status).toBe('ready-for-dev');
      expect(data.assigned_to).toBe('alice');
      expect(data.id).toBe('US-001');
      expect(data.story_points).toBe(3);
      expect(body).toContain('Initial body');
    } finally { await rm(dir, { recursive: true, force: true }); }
  });

  it('preserves body byte-for-byte (including trailing content)', async () => {
    const dir = await tmp();
    try {
      const fp = await makeStory(dir, 'US-002.md', '# Heading\n\nParagraph with **bold** and `code`.\n\n- list\n- items');
      await updateFrontmatter(fp, { status: 'in-progress' });
      const raw = await readFile(fp, 'utf8');
      expect(raw).toContain('# Heading');
      expect(raw).toContain('**bold**');
      expect(raw).toContain('- list');
    } finally { await rm(dir, { recursive: true, force: true }); }
  });

  it('refuses concurrent writes via lock file', async () => {
    const dir = await tmp();
    try {
      const fp = await makeStory(dir);
      const lockPath = `${fp}.lock`;
      const fd = await open(lockPath, 'wx');
      try {
        await expect(updateFrontmatter(fp, { status: 'done' })).rejects.toBeInstanceOf(LockedError);
      } finally {
        await fd.close();
        await rm(lockPath);
      }
    } finally { await rm(dir, { recursive: true, force: true }); }
  });

  it('steals a stale lock left by a dead process (K-02)', async () => {
    const dir = await tmp();
    try {
      const fp = await makeStory(dir);
      await writeFile(`${fp}.lock`, JSON.stringify({ pid: 2 ** 22 + 12345, ts: Date.now() }));
      await updateFrontmatter(fp, { status: 'done' });
      expect(parseString(await readFile(fp, 'utf8')).data.status).toBe('done');
      await expect(access(`${fp}.lock`)).rejects.toThrow();
    } finally { await rm(dir, { recursive: true, force: true }); }
  });

  it('rejects on mtime mismatch', async () => {
    const dir = await tmp();
    try {
      const fp = await makeStory(dir);
      const st = await stat(fp);
      await expect(
        updateFrontmatter(fp, { status: 'done' }, { expectedMtime: st.mtimeMs - 1000 }),
      ).rejects.toBeInstanceOf(MtimeMismatchError);
    } finally { await rm(dir, { recursive: true, force: true }); }
  });

  it('accepts correct mtime', async () => {
    const dir = await tmp();
    try {
      const fp = await makeStory(dir);
      const st = await stat(fp);
      const res = await updateFrontmatter(fp, { status: 'ready-for-dev' }, { expectedMtime: st.mtimeMs });
      expect(res.data.status).toBe('ready-for-dev');
      expect(res.mtime).toBeGreaterThanOrEqual(st.mtimeMs);
    } finally { await rm(dir, { recursive: true, force: true }); }
  });

  it('cleans up lock file on success', async () => {
    const dir = await tmp();
    try {
      const fp = await makeStory(dir);
      await updateFrontmatter(fp, { status: 'done' });
      await expect(access(`${fp}.lock`)).rejects.toBeDefined();
      await expect(access(`${fp}.bak`)).rejects.toBeDefined();
    } finally { await rm(dir, { recursive: true, force: true }); }
  });

  it('cleans up lock + backup on failure', async () => {
    const dir = await tmp();
    try {
      const fp = path.join(dir, 'does-not-exist.md');
      await expect(updateFrontmatter(fp, { status: 'done' })).rejects.toThrow();
      await expect(access(`${fp}.lock`)).rejects.toBeDefined();
      await expect(access(`${fp}.bak`)).rejects.toBeDefined();
    } finally { await rm(dir, { recursive: true, force: true }); }
  });

  // A repository can ship a `<story>.md.bak` symlink (hostile branch). The writer used to copy the story
  // through it before writing, overwriting whatever it pointed to (a git hook, for instance).
  it('never writes through a `.bak` symlink planted next to the story', async () => {
    const dir = await tmp();
    try {
      const fp = await makeStory(dir);
      const victim = path.join(dir, 'pre-commit');
      await writeFile(victim, 'untouched\n');
      await symlink(victim, `${fp}.bak`);

      await updateFrontmatter(fp, { status: 'ready-for-dev' });

      expect(await readFile(victim, 'utf8')).toBe('untouched\n');
      expect(await readlink(`${fp}.bak`)).toBe(victim);
      expect(parseString(await readFile(fp, 'utf8')).data.status).toBe('ready-for-dev');
    } finally { await rm(dir, { recursive: true, force: true }); }
  });

  it('leaves no temporary file behind', async () => {
    const dir = await tmp();
    try {
      const fp = await makeStory(dir);
      await updateFrontmatter(fp, { status: 'ready-for-dev' });
      expect(await readdir(dir)).toEqual(['US-001.md']);
    } finally { await rm(dir, { recursive: true, force: true }); }
  });
});
