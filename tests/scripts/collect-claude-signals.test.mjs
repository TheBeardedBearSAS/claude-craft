import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { rmSync, existsSync, readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';

/**
 * Garde-fou du collecteur de signaux de `/common:audit-claude-alignment`.
 *
 * Le collecteur est le seul composant déterministe de la commande : c'est lui
 * qui décide quelles lentilles méritent un sous-agent cette semaine. Une
 * régression ici se paie soit en tokens (on relance 7 agents pour rien), soit
 * en angle mort (on rate une sortie de CLI). Les deux cas sont testés.
 */

const PROJECT_ROOT = path.resolve(import.meta.dirname, '../..');
const TEST_TMP_DIR = path.join(PROJECT_ROOT, '.test-tmp', 'claude-signals');
const SCRIPT = path.join(PROJECT_ROOT, 'scripts', 'collect-claude-signals.mjs');

const BASELINE = {
  schema_version: 1,
  last_run: '2026-06-30',
  cli_version_seen: '2.1.193',
  page_hashes: {
    'models-pricing': 'hash-models-v1',
    'prompt-context': 'hash-prompt-v1',
    'cc-features': 'hash-features-v1',
  },
  community_csv_hash: 'hash-csv-v1',
  advisories_seen: ['GHSA-old-0001'],
};

/**
 * Le hash réel est calculé par le script sur le texte normalisé. Pour piloter
 * les tests on renvoie un corps de page stable et on aligne la baseline sur le
 * hash produit lors d'un premier passage (cf. `hashOf`).
 */
const PAGE_BODY_STABLE = 'contenu de page inchangé';
const PAGE_BODY_CHANGED = 'contenu de page mis à jour avec une nouvelle section';
const CSV_STABLE = 'id,name\n1,outil-a\n2,outil-b\n';
const CSV_CHANGED = 'id,name\n1,outil-a\n2,outil-b\n3,outil-c\n';

function makeFetchMock({
  cliVersion = '2.1.193',
  pageBody = PAGE_BODY_STABLE,
  csv = CSV_STABLE,
  advisories = [{ ghsa_id: 'GHSA-old-0001', summary: 'déjà vue', published_at: '2026-05-01T00:00:00Z' }],
  failing = [],
} = {}) {
  return vi.fn((url) => {
    const fail = failing.find((f) => url.includes(f));
    if (fail) {
      return Promise.resolve({ ok: false, status: 503, statusText: 'Service Unavailable' });
    }
    if (url.includes('registry.npmjs.org')) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ 'dist-tags': { latest: cliVersion } }),
      });
    }
    if (url.includes('/security-advisories')) {
      return Promise.resolve({ ok: true, json: () => Promise.resolve(advisories) });
    }
    if (url.includes('THE_RESOURCES_TABLE')) {
      return Promise.resolve({ ok: true, text: () => Promise.resolve(csv) });
    }
    if (url.includes('docs.claude.com') || url.includes('anthropic.com')) {
      return Promise.resolve({ ok: true, text: () => Promise.resolve(pageBody) });
    }
    return Promise.reject(new Error(`Unexpected URL: ${url}`));
  });
}

function writeBaseline(overrides = {}) {
  const file = path.join(TEST_TMP_DIR, 'baseline.json');
  writeFileSync(file, JSON.stringify({ ...BASELINE, ...overrides }, null, 2));
  return file;
}

describe('collect-claude-signals', () => {
  let collectSignals;
  let compareVersions;
  let hashOf;

  beforeEach(async () => {
    mkdirSync(TEST_TMP_DIR, { recursive: true });
    const mod = await import(`${SCRIPT}?t=${Date.now()}`);
    collectSignals = mod.collectSignals;
    compareVersions = mod.compareVersions;
    hashOf = mod.hashOf;
  });

  afterEach(() => {
    vi.restoreAllMocks();
    if (existsSync(TEST_TMP_DIR)) {
      rmSync(TEST_TMP_DIR, { recursive: true, force: true });
    }
  });

  describe('compareVersions', () => {
    it('compares numerically, not lexicographically', () => {
      // Le piège : '2.1.9' > '2.1.193' en comparaison de chaînes.
      expect(compareVersions('2.1.193', '2.1.9')).toBeGreaterThan(0);
      expect(compareVersions('2.1.9', '2.1.193')).toBeLessThan(0);
      expect(compareVersions('2.1.193', '2.1.193')).toBe(0);
      expect(compareVersions('2.2.0', '2.1.999')).toBeGreaterThan(0);
    });

    it('tolerates missing segments and non-numeric suffixes', () => {
      expect(compareVersions('2.2', '2.1.5')).toBeGreaterThan(0);
      expect(compareVersions('2.1.200-beta.1', '2.1.193')).toBeGreaterThan(0);
    });
  });

  describe('semaine calme (aucun delta)', () => {
    it('ne signale aucune lentille web et ne demande aucun agent web', async () => {
      globalThis.fetch = makeFetchMock();
      const stableHash = hashOf(PAGE_BODY_STABLE);
      const baselinePath = writeBaseline({
        page_hashes: {
          'models-pricing': stableHash,
          'prompt-context': stableHash,
          'cc-features': stableHash,
        },
        community_csv_hash: hashOf(CSV_STABLE),
      });

      const result = await collectSignals({
        baselinePath,
        outDir: TEST_TMP_DIR,
        now: new Date('2026-08-11T09:00:00Z'),
      });

      expect(result.lenses['cli-release'].changed).toBe(false);
      expect(result.lenses['models-pricing'].changed).toBe(false);
      expect(result.lenses['prompt-context'].changed).toBe(false);
      expect(result.lenses['cc-features'].changed).toBe(false);
      expect(result.lenses['security-cve'].changed).toBe(false);
      expect(result.lenses.community.changed).toBe(false);

      // La conformité interne est un scan local : toujours lancée, elle ne
      // dépend d'aucun signal réseau.
      expect(result.lenses['internal-conformance'].changed).toBe(true);
      expect(result.agents_to_launch).toEqual(['internal-conformance']);
    });
  });

  describe('sortie de CLI', () => {
    it('détecte une version npm plus récente que celle déclarée', async () => {
      globalThis.fetch = makeFetchMock({ cliVersion: '2.1.210' });
      const stableHash = hashOf(PAGE_BODY_STABLE);
      const baselinePath = writeBaseline({
        page_hashes: {
          'models-pricing': stableHash,
          'prompt-context': stableHash,
          'cc-features': stableHash,
        },
        community_csv_hash: hashOf(CSV_STABLE),
      });

      const result = await collectSignals({
        baselinePath,
        outDir: TEST_TMP_DIR,
        now: new Date('2026-08-11T09:00:00Z'),
      });

      expect(result.lenses['cli-release'].changed).toBe(true);
      expect(result.lenses['cli-release'].declared).toBe('2.1.193');
      expect(result.lenses['cli-release'].observed).toBe('2.1.210');
      expect(result.agents_to_launch).toContain('cli-release');
    });

    it('ne signale rien quand npm renvoie la version déjà connue', async () => {
      globalThis.fetch = makeFetchMock({ cliVersion: '2.1.193' });
      const baselinePath = writeBaseline();

      const result = await collectSignals({
        baselinePath,
        outDir: TEST_TMP_DIR,
        now: new Date('2026-08-11T09:00:00Z'),
      });

      expect(result.lenses['cli-release'].changed).toBe(false);
      expect(result.agents_to_launch).not.toContain('cli-release');
    });
  });

  describe('pages sans API (comparaison de hash)', () => {
    it('signale la lentille dont le contenu de page a bougé', async () => {
      globalThis.fetch = makeFetchMock({ pageBody: PAGE_BODY_CHANGED });
      const baselinePath = writeBaseline({
        page_hashes: {
          'models-pricing': hashOf(PAGE_BODY_STABLE),
          'prompt-context': hashOf(PAGE_BODY_STABLE),
          'cc-features': hashOf(PAGE_BODY_STABLE),
        },
      });

      const result = await collectSignals({
        baselinePath,
        outDir: TEST_TMP_DIR,
        now: new Date('2026-08-11T09:00:00Z'),
      });

      expect(result.lenses['models-pricing'].changed).toBe(true);
      expect(result.lenses['models-pricing'].hash_before).toBe(hashOf(PAGE_BODY_STABLE));
      expect(result.lenses['models-pricing'].hash_after).toBe(hashOf(PAGE_BODY_CHANGED));
      expect(result.agents_to_launch).toContain('models-pricing');
    });

    it('ignore les différences de pur espacement', async () => {
      globalThis.fetch = makeFetchMock({ pageBody: `  ${PAGE_BODY_STABLE}\n\n\t` });
      const baselinePath = writeBaseline({
        page_hashes: {
          'models-pricing': hashOf(PAGE_BODY_STABLE),
          'prompt-context': hashOf(PAGE_BODY_STABLE),
          'cc-features': hashOf(PAGE_BODY_STABLE),
        },
      });

      const result = await collectSignals({
        baselinePath,
        outDir: TEST_TMP_DIR,
        now: new Date('2026-08-11T09:00:00Z'),
      });

      expect(result.lenses['models-pricing'].changed).toBe(false);
    });
  });

  describe('sécurité', () => {
    it('signale une advisory jamais vue', async () => {
      globalThis.fetch = makeFetchMock({
        advisories: [
          { ghsa_id: 'GHSA-old-0001', summary: 'déjà vue', published_at: '2026-05-01T00:00:00Z' },
          { ghsa_id: 'GHSA-new-0002', summary: 'nouvelle', published_at: '2026-08-05T00:00:00Z' },
        ],
      });
      const baselinePath = writeBaseline();

      const result = await collectSignals({
        baselinePath,
        outDir: TEST_TMP_DIR,
        now: new Date('2026-08-11T09:00:00Z'),
      });

      expect(result.lenses['security-cve'].changed).toBe(true);
      expect(result.lenses['security-cve'].new_advisories).toEqual(['GHSA-new-0002']);
      expect(result.agents_to_launch).toContain('security-cve');
    });
  });

  describe('communauté', () => {
    it('signale un catalogue awesome-claude-code modifié', async () => {
      globalThis.fetch = makeFetchMock({ csv: CSV_CHANGED });
      const baselinePath = writeBaseline({ community_csv_hash: hashOf(CSV_STABLE) });

      const result = await collectSignals({
        baselinePath,
        outDir: TEST_TMP_DIR,
        now: new Date('2026-08-11T09:00:00Z'),
      });

      expect(result.lenses.community.changed).toBe(true);
      expect(result.agents_to_launch).toContain('community');
    });

    it('bascule sur le nom de fichier de repli quand le premier candidat a été renommé', async () => {
      // Cas réel constaté le 2026-08-11 : l'upstream a renommé THE_RESOURCES_TABLE.csv.
      // Sans repli, la lentille fail-open coûterait un agent chaque semaine sans
      // jamais rien apprendre.
      globalThis.fetch = makeFetchMock({ failing: ['THE_RESOURCES_TABLE_NEW.csv'] });
      const baselinePath = writeBaseline({ community_csv_hash: hashOf(CSV_STABLE) });

      const result = await collectSignals({
        baselinePath,
        outDir: TEST_TMP_DIR,
        now: new Date('2026-08-11T09:00:00Z'),
      });

      expect(result.errors.community).toBeUndefined();
      expect(result.lenses.community.changed).toBe(false);
      expect(result.lenses.community.sources[0]).toMatch(/THE_RESOURCES_TABLE\.csv$/);
    });

    it('fail-open quand aucun candidat de catalogue ne répond', async () => {
      globalThis.fetch = makeFetchMock({ failing: ['THE_RESOURCES_TABLE'] });
      const baselinePath = writeBaseline({ community_csv_hash: hashOf(CSV_STABLE) });

      const result = await collectSignals({
        baselinePath,
        outDir: TEST_TMP_DIR,
        now: new Date('2026-08-11T09:00:00Z'),
      });

      expect(result.lenses.community.changed).toBe(true);
      expect(result.errors.community).toMatch(/503/);
    });
  });

  describe('robustesse réseau (fail-open)', () => {
    it('marque la lentille comme à auditer quand sa source est injoignable', async () => {
      // Choix de conception : une panne réseau ne doit JAMAIS produire un faux
      // « rien à signaler ». On dégrade vers « à auditer », pas vers le silence.
      globalThis.fetch = makeFetchMock({ failing: ['registry.npmjs.org'] });
      const baselinePath = writeBaseline();

      const result = await collectSignals({
        baselinePath,
        outDir: TEST_TMP_DIR,
        now: new Date('2026-08-11T09:00:00Z'),
      });

      expect(result.lenses['cli-release'].changed).toBe(true);
      expect(result.lenses['cli-release'].reason).toMatch(/collecte/i);
      expect(result.errors['cli-release']).toMatch(/503/);
      expect(result.agents_to_launch).toContain('cli-release');
    });
  });

  describe('baseline et sortie', () => {
    it('utilise --since pour surcharger la date de baseline', async () => {
      globalThis.fetch = makeFetchMock();
      const baselinePath = writeBaseline();

      const result = await collectSignals({
        baselinePath,
        outDir: TEST_TMP_DIR,
        now: new Date('2026-08-11T09:00:00Z'),
        since: '2026-05-01',
      });

      expect(result.baseline.last_run).toBe('2026-05-01');
    });

    it('repart de zéro (tout à auditer) quand la baseline est absente', async () => {
      globalThis.fetch = makeFetchMock();

      const result = await collectSignals({
        baselinePath: path.join(TEST_TMP_DIR, 'inexistant.json'),
        outDir: TEST_TMP_DIR,
        now: new Date('2026-08-11T09:00:00Z'),
      });

      expect(result.baseline_missing).toBe(true);
      expect(result.agents_to_launch).toContain('cli-release');
      expect(result.agents_to_launch).toContain('models-pricing');
      expect(result.agents_to_launch).toContain('community');
    });

    it('écrit le fichier de signaux daté et propose la prochaine baseline', async () => {
      globalThis.fetch = makeFetchMock({ cliVersion: '2.1.210' });
      const baselinePath = writeBaseline();

      const result = await collectSignals({
        baselinePath,
        outDir: TEST_TMP_DIR,
        now: new Date('2026-08-11T09:00:00Z'),
      });

      const outPath = path.join(TEST_TMP_DIR, 'signals-2026-08-11.json');
      expect(existsSync(outPath)).toBe(true);

      const parsed = JSON.parse(readFileSync(outPath, 'utf8'));
      expect(parsed.date).toBe('2026-08-11');
      expect(parsed.lenses['cli-release'].observed).toBe('2.1.210');

      // La baseline suivante est pré-calculée pour que la commande n'ait qu'à
      // l'écrire une fois le rapport validé.
      expect(result.next_baseline.cli_version_seen).toBe('2.1.210');
      expect(result.next_baseline.last_run).toBe('2026-08-11');
      expect(result.next_baseline.schema_version).toBe(1);
    });

    it("n'écrit rien en mode dry-run", async () => {
      globalThis.fetch = makeFetchMock();
      const baselinePath = writeBaseline();

      await collectSignals({
        baselinePath,
        outDir: TEST_TMP_DIR,
        now: new Date('2026-08-11T09:00:00Z'),
        write: false,
      });

      expect(existsSync(path.join(TEST_TMP_DIR, 'signals-2026-08-11.json'))).toBe(false);
    });
  });
});
