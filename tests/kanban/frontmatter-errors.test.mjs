import { describe, it, expect } from 'vitest';
import { mkdtemp, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { parseAndValidate } from '../../cli/kanban/server/services/frontmatter.js';
import { StoryFrontmatterSchema } from '../../cli/kanban/shared/schemas.js';

async function makeTmpDir() {
  return mkdtemp(path.join(tmpdir(), 'kb-fm-err-'));
}

describe('frontmatter.parseAndValidate — ok:false paths', () => {
  it('returns ok:false with errors when required field id is missing', async () => {
    const dir = await makeTmpDir();
    try {
      const fp = path.join(dir, 'missing-id.md');
      await writeFile(fp, '---\ntitle: No ID here\nstatus: backlog\n---\nbody');
      const r = await parseAndValidate(fp, StoryFrontmatterSchema);
      expect(r.ok).toBe(false);
      expect(Array.isArray(r.errors)).toBe(true);
      expect(r.errors.length).toBeGreaterThan(0);
      expect(r.errors.some((e) => e.path.includes('id'))).toBe(true);
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });

  it('returns ok:false with errors when id does not match US-NNN pattern', async () => {
    const dir = await makeTmpDir();
    try {
      const fp = path.join(dir, 'bad-id.md');
      await writeFile(fp, '---\nid: WRONG-FORMAT\ntitle: Bad ID\nstatus: backlog\n---\nbody');
      const r = await parseAndValidate(fp, StoryFrontmatterSchema);
      expect(r.ok).toBe(false);
      expect(Array.isArray(r.errors)).toBe(true);
      expect(r.errors.length).toBeGreaterThan(0);
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });

  it('returns ok:false with errors when required field title is missing', async () => {
    const dir = await makeTmpDir();
    try {
      const fp = path.join(dir, 'missing-title.md');
      await writeFile(fp, '---\nid: US-001\nstatus: backlog\n---\nbody');
      const r = await parseAndValidate(fp, StoryFrontmatterSchema);
      expect(r.ok).toBe(false);
      expect(Array.isArray(r.errors)).toBe(true);
      expect(r.errors.some((e) => e.path.includes('title'))).toBe(true);
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });
});
