import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtemp, rm, readFile, writeFile, stat, readdir } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import {
  slugify,
  renderStoryMarkdown,
  patchMetadataList,
  hasStatusLine,
  replaceBody,
  writeTextAtomic,
  trashFile,
  createExclusive,
} from '../../cli/kanban/server/services/story-files.js';
import { deriveStoryData } from '../../cli/kanban/server/services/markdown-metadata.js';
import { MtimeMismatchError } from '../../cli/kanban/server/services/file-writer.js';

describe('slugify', () => {
  it('lowercases, strips accents and joins words with single dashes', () => {
    expect(slugify('  Déployer le Service -- avec Docker!  ')).toBe('deployer-le-service-avec-docker');
  });

  it('is ASCII only', () => {
    expect(slugify('日本語 emoji 🎉 ok')).toBe('emoji-ok');
  });

  it('is at most 50 chars and never ends with a dash', () => {
    const slug = slugify('a'.repeat(49) + ' b' + ' c'.repeat(20));
    expect(slug.length).toBeLessThanOrEqual(50);
    expect(slug).toBe('a'.repeat(49));
    expect(slugify('x'.repeat(80))).toHaveLength(50);
  });

  it('never returns an empty slug', () => {
    expect(slugify('')).toBe('story');
    expect(slugify('***')).toBe('story');
    expect(slugify(undefined)).toBe('story');
  });

  it('cannot contain path separators or dots', () => {
    expect(slugify('../../etc/passwd')).toBe('etc-passwd');
    expect(slugify('a\\b.md')).toBe('a-b-md');
  });
});

const base = {
  id: 'US-007',
  title: 'Pay with a card',
  epic_id: 'EPIC-002',
  story_points: 5,
  priority: 'must',
  persona: 'P-001 Alex',
  sprint_id: 'sprint-3',
  date: '2026-11-11',
};

describe('renderStoryMarkdown', () => {
  it('has no status line and no frontmatter', () => {
    const md = renderStoryMarkdown(base);
    expect(md.startsWith('# US-007: Pay with a card\n')).toBe(true);
    expect(md).not.toMatch(/^---/m);
    expect(hasStatusLine(md)).toBe(false);
    expect(md).not.toMatch(/\*\*(Status|Statut|Estado)\*\*/);
  });

  it('is read back by the metadata parser (round trip)', () => {
    expect(deriveStoryData(renderStoryMarkdown(base))).toEqual({
      id: 'US-007',
      title: 'Pay with a card',
      epic_id: 'EPIC-002',
      sprint_id: 'sprint-3',
      persona: 'P-001 Alex',
      story_points: 5,
      priority: 'must',
      dependencies: [],
    });
  });

  it('round-trips epic-style ids and leaves empty epic / sprint / persona out', () => {
    const md = renderStoryMarkdown({ ...base, id: 'US-E4-03', epic_id: null, sprint_id: null, persona: undefined });
    const data = deriveStoryData(md);
    expect(data).toMatchObject({ id: 'US-E4-03', title: 'Pay with a card', story_points: 5 });
    expect(data.epic_id).toBeUndefined();
    expect(data.sprint_id).toBeUndefined();
    expect(data.persona).toBeUndefined();
  });

  it('defaults points to 0 and priority to should', () => {
    const data = deriveStoryData(renderStoryMarkdown({ id: 'US-001', title: 'T', date: '2026-11-11' }));
    expect(data).toMatchObject({ story_points: 0, priority: 'should' });
  });

  it('writes the creation and update dates', () => {
    const md = renderStoryMarkdown(base);
    expect(md).toContain('- **Created on**: 2026-11-11');
    expect(md).toContain('- **Updated**: 2026-11-11');
  });

  it.each([
    ['newline', 'Real title\n- **Points**: 99\n- **Sprint**: evil'],
    ['frontmatter marker', 'Title\n---\nstatus: done\n---'],
    ['list marker', '- **Status**: done'],
    ['comment', 'a <!-- b\n- **Points**: 99 --> c'],
    ['nested comment', '<!<!-- -->-- x -->'],
    ['carriage return', 'a\r\n## Metadata\r\n- **EPIC**: EPIC-999'],
  ])('user text cannot break the structure (%s)', (_, hostile) => {
    const md = renderStoryMarkdown({ ...base, title: hostile, persona: hostile });
    const data = deriveStoryData(md);
    expect(data).toMatchObject({ id: 'US-007', story_points: 5, sprint_id: 'sprint-3', epic_id: 'EPIC-002' });
    expect(data.title).not.toMatch(/[\r\n]/);
    expect(md.match(/^## Metadata$/gm)).toHaveLength(1);
    expect(md.match(/^- \*\*Points\*\*/gm)).toHaveLength(1);
    expect(hasStatusLine(md)).toBe(false);
    expect(md.startsWith('# US-007: ')).toBe(true);
    expect(md.split('\n')[0]).not.toContain('<!--');
  });
});

const TEMPLATE = `# US-001: Login

## Metadata
- **ID**: US-001
- **EPIC**: EPIC-001
- **Sprint**: 1
- **Status**: tracked in .bmad/sprint-status.yaml
- **Points**: 3
- **Persona**: P-001
- **Updated**: 2026-01-01

## Notes

- **Points**: not metadata
`;

describe('patchMetadataList', () => {
  it('updates existing lines in place and touches nothing else', () => {
    const out = patchMetadataList(TEMPLATE, { points: 8, epic: 'EPIC-009', sprint: 'sprint-4', updated: '2026-11-11' });
    expect(out).toContain('- **Points**: 8\n');
    expect(out).toContain('- **EPIC**: EPIC-009\n');
    expect(out).toContain('- **Sprint**: sprint-4\n');
    expect(out).toContain('- **Updated**: 2026-11-11\n');
    expect(out).toContain('- **Status**: tracked in .bmad/sprint-status.yaml\n');
    expect(out).toContain('- **Persona**: P-001\n');
    expect(out).toContain('## Notes\n\n- **Points**: not metadata\n');
    expect(out.split('\n')).toHaveLength(TEMPLATE.split('\n').length);
  });

  it('adds the missing lines at the end of the section, with English labels', () => {
    const text = '# US-002: X\n\n## Metadata\n- **ID**: US-002\n\n## Notes\nhi\n';
    const out = patchMetadataList(text, { points: 2, epic: 'EPIC-001', sprint: null, updated: '2026-11-11' });
    expect(out).toBe(
      '# US-002: X\n\n## Metadata\n- **ID**: US-002\n- **EPIC**: EPIC-001\n- **Sprint**: —\n- **Points**: 2\n' +
        '- **Updated**: 2026-11-11\n\n## Notes\nhi\n'
    );
  });

  it('writes an em dash for a cleared epic or sprint (read back as absent)', () => {
    const out = patchMetadataList(TEMPLATE, { epic: null, sprint: null });
    expect(out).toContain('- **EPIC**: —\n');
    const data = deriveStoryData(out);
    expect(data.epic_id).toBeUndefined();
    expect(data.sprint_id).toBeUndefined();
  });

  it('recognizes localized headings and labels', () => {
    const fr = '# US-003: X\n\n## Métadonnées\n- **ID**: US-003\n- **Points**: 1\n- **Mis à jour**: 2026-01-01\n';
    const out = patchMetadataList(fr, { points: 4, updated: '2026-11-11' });
    expect(out).toContain('- **Points**: 4');
    expect(out).toContain('- **Mis à jour**: 2026-11-11');
    expect(out.match(/Updated/g)).toBeNull();
    const de = '## Metadaten\n- **Punkte**: 1\n';
    expect(patchMetadataList(de, { points: 6 })).toBe('## Metadaten\n- **Punkte**: 6\n');
  });

  it('returns the text unchanged when there is no metadata section', () => {
    const text = '# No section\n\n- **Points**: 3\n';
    expect(patchMetadataList(text, { points: 9 })).toBe(text);
  });

  it('returns the text unchanged for no field', () => {
    expect(patchMetadataList(TEMPLATE, {})).toBe(TEMPLATE);
  });

  it('never writes a Status line, even when asked', () => {
    const out = patchMetadataList(TEMPLATE, { status: 'done', Status: 'done', points: 1 });
    expect(out).not.toContain('done');
    const added = patchMetadataList('## Metadata\n- **ID**: US-1\n', { points: 1 });
    expect(hasStatusLine(added)).toBe(false);
  });

  it('keeps CRLF line endings', () => {
    const out = patchMetadataList('## Metadata\r\n- **Points**: 1\r\n- **ID**: US-1\r\n', { points: 2 });
    expect(out).toBe('## Metadata\r\n- **Points**: 2\r\n- **ID**: US-1\r\n');
  });

  it('flattens hostile values to one line', () => {
    const out = patchMetadataList(TEMPLATE, { sprint: 'a\n- **Status**: done\n## Metadata' });
    expect(hasStatusLine(out)).toBe(false);
    expect(out.match(/^## Metadata$/gm)).toHaveLength(1);
    expect(out.match(/^- \*\*Sprint\*\*/gm)).toHaveLength(1);
  });

  it('stops the section at the next heading of any level up to 2', () => {
    const text = '## Metadata\n- **ID**: US-1\n# Other\n- **Points**: 1\n';
    expect(patchMetadataList(text, { points: 5 })).toBe(
      '## Metadata\n- **ID**: US-1\n- **Points**: 5\n# Other\n- **Points**: 1\n'
    );
  });
});

describe('hasStatusLine', () => {
  it.each(['- **Status**: 🔴 To Do', '- **Statut** : In Progress', '* **Estado**: done', '  - **status**: Review'])(
    'detects %s',
    (line) => {
      expect(hasStatusLine(`## Metadata\n${line}\n`)).toBe(true);
    }
  );

  it('allows the pointer to sprint-status.yaml written by the templates', () => {
    expect(hasStatusLine('- **Status**: tracked in .bmad/sprint-status.yaml\n')).toBe(false);
    expect(hasStatusLine('- **Statut**: suivi dans .bmad/sprint-status.yaml\n')).toBe(false);
  });

  it('ignores prose and other labels', () => {
    expect(hasStatusLine('The status of the work is fine.\n- **Points**: 3\n- **Status board**: x\n')).toBe(false);
    expect(hasStatusLine('')).toBe(false);
  });
});

describe('file helpers', () => {
  let dir;
  beforeEach(async () => {
    dir = await mkdtemp(path.join(tmpdir(), 'kb-sf-'));
  });
  afterEach(() => rm(dir, { recursive: true, force: true }));

  it('writeTextAtomic replaces the file and leaves no tmp or lock file', async () => {
    const f = path.join(dir, 'a.md');
    await writeFile(f, 'old');
    await writeTextAtomic(f, 'new');
    expect(await readFile(f, 'utf8')).toBe('new');
    expect(await readdir(dir)).toEqual(['a.md']);
  });

  it('replaceBody keeps the frontmatter byte for byte', async () => {
    const f = path.join(dir, 'b.md');
    const head = '---\nid: US-001\ntitle: "T"   # keep me\n---\n';
    await writeFile(f, `${head}old body\n`);
    const { mtimeMs } = await stat(f);
    const res = await replaceBody(f, 'new body\n', mtimeMs);
    expect(await readFile(f, 'utf8')).toBe(`${head}new body\n`);
    expect(res.mtime).toBe((await stat(f)).mtimeMs);
  });

  it('replaceBody replaces the whole file when there is no frontmatter', async () => {
    const f = path.join(dir, 'c.md');
    await writeFile(f, '# old\n');
    await replaceBody(f, '# new\n', (await stat(f)).mtimeMs);
    expect(await readFile(f, 'utf8')).toBe('# new\n');
  });

  it('replaceBody refuses a stale mtime and leaves the file alone', async () => {
    const f = path.join(dir, 'd.md');
    await writeFile(f, 'x');
    await expect(replaceBody(f, 'y', 1)).rejects.toBeInstanceOf(MtimeMismatchError);
    expect(await readFile(f, 'utf8')).toBe('x');
    expect(await readdir(dir)).toEqual(['d.md']);
  });

  it('trashFile moves the file under .trash and never overwrites an earlier one', async () => {
    const f = path.join(dir, 'US-001-x.md');
    await writeFile(f, 'one');
    await trashFile(f);
    await writeFile(f, 'two');
    await trashFile(f);
    const trashed = (await readdir(path.join(dir, '.trash'))).sort();
    expect(trashed).toHaveLength(2);
    expect(trashed.every((n) => n.startsWith('US-001-x'))).toBe(true);
    expect(await readdir(dir)).toEqual(['.trash']);
  });

  it('createExclusive creates missing folders and never overwrites', async () => {
    const f = path.join(dir, 'sub', 'e.md');
    await createExclusive(f, 'first');
    expect(await readFile(f, 'utf8')).toBe('first');
    await expect(createExclusive(f, 'second')).rejects.toMatchObject({ code: 'EEXIST' });
    expect(await readFile(f, 'utf8')).toBe('first');
  });
});
