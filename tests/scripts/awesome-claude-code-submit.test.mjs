import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import path from 'node:path';

/**
 * Régression : le catalogue upstream a été renommé
 * (`THE_RESOURCES_TABLE.csv` → `THE_RESOURCES_TABLE_NEW.csv`), l'URL historique
 * renvoie 404.
 *
 * Le danger n'est pas l'erreur visible mais son absence : `findDuplicate`
 * retombe sur `{ status: 'unknown' }` en cas de non-200, donc le contrôle
 * anti-doublon devient inopérant SANS que rien ne le signale. On pourrait
 * soumettre une entrée déjà présente en croyant le contrôle passé.
 */

const PROJECT_ROOT = path.resolve(import.meta.dirname, '../..');
const SCRIPT = path.join(PROJECT_ROOT, 'scripts', 'awesome-claude-code-submit.mjs');

const CSV = [
  'id,display_name,primary_link',
  '1,Some Other Tool,https://github.com/someone/other',
  '2,Claude Craft,https://github.com/TheBeardedBearSAS/claude-craft',
].join('\n');

/** @param {string[]} failing sous-chaînes d'URL qui doivent répondre 404 */
function makeFetchMock(failing = []) {
  return vi.fn((url) => {
    if (failing.some((f) => url.includes(f))) {
      return Promise.resolve({ status: 404, text: () => Promise.resolve('Not Found') });
    }
    if (url.includes('THE_RESOURCES_TABLE')) {
      return Promise.resolve({ status: 200, text: () => Promise.resolve(CSV) });
    }
    return Promise.reject(new Error(`Unexpected URL: ${url}`));
  });
}

describe('awesome-claude-code-submit', () => {
  let findDuplicate;
  let CSV_CANDIDATES;

  beforeEach(async () => {
    const mod = await import(`${SCRIPT}?t=${Date.now()}`);
    findDuplicate = mod.findDuplicate;
    CSV_CANDIDATES = mod.CSV_CANDIDATES;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("n'exécute pas main() à l'import (module importable sans effet de bord)", () => {
    // Si main() tournait à l'import, le beforeEach aurait déjà déclenché des
    // appels réseau et potentiellement un process.exit.
    expect(findDuplicate).toBeTypeOf('function');
  });

  it('essaie le nom de fichier courant en premier', () => {
    expect(CSV_CANDIDATES[0]).toMatch(/THE_RESOURCES_TABLE_NEW\.csv$/);
    expect(CSV_CANDIDATES).toHaveLength(2);
  });

  it('détecte un doublon quand le catalogue répond', async () => {
    globalThis.fetch = makeFetchMock();

    const res = await findDuplicate('Claude Craft', 'https://github.com/TheBeardedBearSAS/claude-craft');

    expect(res.status).toBe('duplicate');
  });

  it('bascule sur le nom de repli quand le nom courant a disparu', async () => {
    globalThis.fetch = makeFetchMock(['THE_RESOURCES_TABLE_NEW.csv']);

    const res = await findDuplicate('Claude Craft', 'https://github.com/TheBeardedBearSAS/claude-craft');

    expect(res.status).toBe('duplicate');
  });

  it("conclut à l'absence quand l'entrée n'est pas au catalogue", async () => {
    globalThis.fetch = makeFetchMock();

    const res = await findDuplicate('Inconnu', 'https://github.com/nobody/nothing');

    expect(res.status).toBe('absent');
  });

  it("reste sur 'unknown' quand AUCUN candidat ne répond", async () => {
    // Dégradation explicite : on ne prétend pas qu'il n'y a pas de doublon.
    globalThis.fetch = makeFetchMock(['THE_RESOURCES_TABLE']);

    const res = await findDuplicate('Claude Craft', 'https://github.com/TheBeardedBearSAS/claude-craft');

    expect(res.status).toBe('unknown');
  });
});
