import { describe, it, expect } from 'vitest';
import { mkdtemp, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { parseFile, parseString, parseAndValidate, stringify } from '../../cli/kanban/server/services/frontmatter.js';
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

  it('returns ok:false with raw data exposed when story_points has wrong type (string au lieu de number)', async () => {
    // Couvre la branche : safeParse échec + retour { ok: false, raw: data }
    const dir = await makeTmpDir();
    try {
      const fp = path.join(dir, 'bad-type.md');
      // story_points doit être un number — on passe une string
      await writeFile(fp, '---\nid: US-042\ntitle: Type mismatch\nstory_points: "not-a-number"\n---\nbody');
      const r = await parseAndValidate(fp, StoryFrontmatterSchema);
      expect(r.ok).toBe(false);
      expect(Array.isArray(r.errors)).toBe(true);
      expect(r.errors.some((e) => e.path.includes('story_points'))).toBe(true);
      // raw doit exposer la donnée brute parsée
      expect(r.raw).toBeDefined();
      expect(r.raw.id).toBe('US-042');
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });

  it("expose le body même en cas d'échec de validation", async () => {
    // Couvre la branche body retourné dans le chemin ok:false
    const dir = await makeTmpDir();
    try {
      const fp = path.join(dir, 'no-title-with-body.md');
      await writeFile(fp, '---\nid: US-099\n---\n# Mon contenu\n\nTexte important.');
      const r = await parseAndValidate(fp, StoryFrontmatterSchema);
      expect(r.ok).toBe(false);
      expect(typeof r.body).toBe('string');
      expect(r.body).toContain('Mon contenu');
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });

  it("throws si le fichier n'existe pas (branche readFile ENOENT)", async () => {
    // Couvre la branche d'erreur de parseFile quand le fichier est absent
    const nonExistentPath = path.join(tmpdir(), 'kb-fm-err-does-not-exist', 'ghost.md');
    await expect(parseAndValidate(nonExistentPath, StoryFrontmatterSchema)).rejects.toThrow();
  });

  it('parseString retourne data vide et body complet quand frontmatter absent', () => {
    // Couvre le chemin "no frontmatter" de parseString — distinct du test existant car vérifie data === {}
    const raw = '# Titre sans frontmatter\n\nContenu.';
    const { data, body, raw: rawOut } = parseString(raw);
    expect(data).toEqual({});
    expect(body).toContain('Titre sans frontmatter');
    expect(rawOut).toBe(raw);
  });

  it('parseString sur chaîne vide retourne data vide et body vide', () => {
    // Couvre les branches `data ?? {}` et `content ?? ''` quand raw est ''.
    const { data, body, raw } = parseString('');
    expect(data).toEqual({});
    expect(body).toBe('');
    expect(raw).toBe('');
  });

  it("stringify accepte data et body undefined (couvre les branches `?? {}` et `?? ''`)", () => {
    // Couvre les branches de coalescence dans stringify quand on l'appelle sans arguments.
    const out = stringify();
    expect(typeof out).toBe('string');
    // Round-trip : doit reparse en data vide.
    const parsed = parseString(out);
    expect(parsed.data).toEqual({});
  });

  it('stringify accepte data null et body null sans throw', () => {
    const out = stringify(null, null);
    expect(typeof out).toBe('string');
    const parsed = parseString(out);
    expect(parsed.data).toEqual({});
  });
});
