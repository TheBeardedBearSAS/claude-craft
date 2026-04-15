import { describe, it, expect } from 'vitest';
import { mkdtemp, writeFile, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { parseFile, parseString, stringify, parseAndValidate } from '../../cli/kanban/server/services/frontmatter.js';
import { StoryFrontmatterSchema } from '../../cli/kanban/shared/schemas.js';

async function makeTmpDir() {
  return await mkdtemp(path.join(tmpdir(), 'kb-fm-'));
}

describe('frontmatter.parseString', () => {
  it('parses YAML frontmatter and body', () => {
    const raw = '---\nid: US-001\ntitle: Login\nstatus: backlog\n---\n\n# US-001\n\nBody text.\n';
    const { data, body } = parseString(raw);
    expect(data).toEqual({ id: 'US-001', title: 'Login', status: 'backlog' });
    expect(body.trim()).toMatch(/^# US-001/);
  });

  it('returns empty data when no frontmatter', () => {
    const { data, body } = parseString('Just markdown\n');
    expect(data).toEqual({});
    expect(body).toContain('Just markdown');
  });
});

describe('frontmatter.parseFile', () => {
  it('reads and parses a file', async () => {
    const dir = await makeTmpDir();
    try {
      const fp = path.join(dir, 'story.md');
      await writeFile(fp, '---\nid: US-042\ntitle: X\n---\nBody');
      const { data, body } = await parseFile(fp);
      expect(data.id).toBe('US-042');
      expect(body).toBe('Body');
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });
});

describe('frontmatter.stringify', () => {
  it('round-trips data + body', () => {
    const out = stringify({ id: 'US-001', status: 'done' }, 'Hello');
    const parsed = parseString(out);
    expect(parsed.data).toEqual({ id: 'US-001', status: 'done' });
    expect(parsed.body.trim()).toBe('Hello');
  });
});

describe('frontmatter.parseAndValidate', () => {
  it('returns ok:true for valid story', async () => {
    const dir = await makeTmpDir();
    try {
      const fp = path.join(dir, 'US-001.md');
      await writeFile(fp, '---\nid: US-001\ntitle: Login\nstatus: backlog\n---\nbody');
      const r = await parseAndValidate(fp, StoryFrontmatterSchema);
      expect(r.ok).toBe(true);
      expect(r.data.id).toBe('US-001');
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });

  it('returns ok:false with Zod errors for invalid', async () => {
    const dir = await makeTmpDir();
    try {
      const fp = path.join(dir, 'bad.md');
      await writeFile(fp, '---\nid: WRONG\ntitle: x\n---\nbody');
      const r = await parseAndValidate(fp, StoryFrontmatterSchema);
      expect(r.ok).toBe(false);
      expect(r.errors.length).toBeGreaterThan(0);
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });
});
