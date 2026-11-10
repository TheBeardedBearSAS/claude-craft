import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { rmSync, existsSync, readFileSync, mkdirSync, writeFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import * as yaml from 'js-yaml';

/**
 * Garde-fou du collecteur de `/common:audit-freshness`.
 *
 * Le collecteur décide, sans modèle, quels stacks méritent un sous-agent : ceux
 * dont la version stable publiée a dépassé la version déclarée dans
 * `config/versions.yaml`. Une régression se paie soit en tokens (20 agents
 * relancés pour rien), soit en angle mort (une version majeure ratée).
 */

const PROJECT_ROOT = path.resolve(import.meta.dirname, '../..');
const TEST_TMP_DIR = path.join(PROJECT_ROOT, '.test-tmp', 'freshness-signals');
const SCRIPT = path.join(PROJECT_ROOT, 'scripts', 'collect-freshness-signals.mjs');
const VERSIONS = path.join(PROJECT_ROOT, 'config', 'versions.yaml');
const SOURCES = path.join(PROJECT_ROOT, 'config', 'freshness-sources.yaml');

const FIXTURE_VERSIONS = `
stacks:
  react: { registry: '19.3 + Compiler 1.0' }
  laravel: { registry: '13.x / PHP 8.3+' }
  csharp: { registry: '10 LTS / C# 14' }
infra:
  pgbouncer: '1.26.0'
`;

const FIXTURE_SOURCES = `
stacks:
  react: { kind: npm, pkg: react, paths: [a] }
  laravel: { kind: packagist, pkg: laravel/framework, paths: [b] }
  csharp: { kind: endoflife, pkg: dotnet, paths: [c] }
infra:
  pgbouncer: { kind: github, repo: pgbouncer/pgbouncer, paths: [d] }
families:
  testing: { paths: [e] }
`;

/** Réponses par défaut : tout est à jour (react 19.3.x, laravel 13.x, .NET 10, PgBouncer 1.26). */
function makeFetchMock(overrides = {}, failing = []) {
  const bodies = {
    'registry.npmjs.org/react/latest': { version: '19.3.2' },
    'repo.packagist.org/p2/laravel/framework.json': {
      packages: { 'laravel/framework': [{ version: 'v14.0.0-RC1' }, { version: 'v13.40.1' }, { version: 'v13.40.0' }] },
    },
    'endoflife.date/api/dotnet.json': [
      { cycle: '10.0', latest: '10.0.12', lts: true },
      { cycle: '9.0', latest: '9.0.11', lts: false },
    ],
    'api.github.com/repos/pgbouncer/pgbouncer/releases/latest': { tag_name: 'pgbouncer_1_26_0' },
    ...overrides,
  };
  return vi.fn((url) => {
    if (failing.some((f) => url.includes(f))) {
      return Promise.resolve({ ok: false, status: 503, statusText: 'Service Unavailable' });
    }
    const key = Object.keys(bodies).find((k) => url.includes(k));
    if (!key) return Promise.reject(new Error(`Unexpected URL: ${url}`));
    return Promise.resolve({ ok: true, json: () => Promise.resolve(bodies[key]) });
  });
}

describe('collect-freshness-signals', () => {
  let mod;
  let collect;
  const outDir = path.join(TEST_TMP_DIR, 'out');

  beforeEach(async () => {
    mkdirSync(TEST_TMP_DIR, { recursive: true });
    const versionsPath = path.join(TEST_TMP_DIR, 'versions.yaml');
    const sourcesPath = path.join(TEST_TMP_DIR, 'sources.yaml');
    writeFileSync(versionsPath, FIXTURE_VERSIONS);
    writeFileSync(sourcesPath, FIXTURE_SOURCES);
    mod = await import(`${SCRIPT}?t=${Date.now()}`);
    collect = (opts = {}) =>
      mod.collectFreshness({
        versionsPath,
        sourcesPath,
        outDir,
        auditDir: TEST_TMP_DIR,
        now: new Date('2026-11-10T08:00:00Z'),
        ...opts,
      });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    if (existsSync(TEST_TMP_DIR)) rmSync(TEST_TMP_DIR, { recursive: true, force: true });
  });

  describe('parseDeclared', () => {
    it('extrait le premier token de version de la chaîne déclarée', () => {
      expect(mod.parseDeclared('10 LTS / C# 14')).toBe('10');
      expect(mod.parseDeclared('19.3 + Compiler 1.0')).toBe('19.3');
      expect(mod.parseDeclared('13.x / PHP 8.3+')).toBe('13');
      expect(mod.parseDeclared('3.5+')).toBe('3.5');
      expect(mod.parseDeclared('2026.1012.0')).toBe('2026.1012.0');
      expect(mod.parseDeclared('24.x (Active LTS) — 22.x Maintenance LTS')).toBe('24');
      expect(mod.parseDeclared('n/a')).toBeNull();
    });
  });

  describe('extractVersion', () => {
    it('normalise les tags de release', () => {
      expect(mod.extractVersion('v1.13.1')).toBe('1.13.1');
      expect(mod.extractVersion('pgbouncer_1_26_0')).toBe('1.26.0');
      expect(mod.extractVersion('docker-v29.9.0')).toBe('29.9.0');
      expect(mod.extractVersion('v1.37.1\n')).toBe('1.37.1');
    });

    it('repère les pré-releases', () => {
      expect(mod.isPrerelease('v14.0.0-RC1')).toBe(true);
      expect(mod.isPrerelease('3.6.0-beta.2')).toBe(true);
      expect(mod.isPrerelease('4.0.0-alpha.6')).toBe(true);
      expect(mod.isPrerelease('13.40.1')).toBe(false);
    });
  });

  describe('classifyGap', () => {
    it('compare à la précision de la version déclarée', () => {
      expect(mod.classifyGap('13', '13.40.1')).toBe('aucun');
      expect(mod.classifyGap('19.3', '19.3.2')).toBe('aucun');
      expect(mod.classifyGap('29.9.0', '29.9.4')).toBe('aucun');
      expect(mod.classifyGap('19.3', '19.4.0')).toBe('mineur');
      expect(mod.classifyGap('10', '11.0.0')).toBe('majeur');
      expect(mod.classifyGap('2.12', '3.0.0')).toBe('majeur');
    });

    it("ne signale pas d'écart quand le dépôt est en avance", () => {
      expect(mod.classifyGap('3.15', '3.14.8')).toBe('aucun');
    });

    it('renvoie inconnu sans les deux versions', () => {
      expect(mod.classifyGap(null, '1.0.0')).toBe('inconnu');
      expect(mod.classifyGap('1.0', null)).toBe('inconnu');
    });
  });

  describe('semaine calme', () => {
    it('ne lance aucun agent quand tout est à jour, en ignorant les pré-releases', async () => {
      globalThis.fetch = makeFetchMock();
      const result = await collect({ write: false });
      expect(result.entries.laravel).toMatchObject({ declared: '13', stable: '13.40.1', gap: 'aucun' });
      expect(result.entries.csharp).toMatchObject({ stable: '10.0.12', gap: 'aucun' });
      expect(result.entries.pgbouncer).toMatchObject({ stable: '1.26.0', gap: 'aucun', wave: 3 });
      expect(result.entries.react.source_url).toContain('registry.npmjs.org/react/latest');
      expect(result.agents_to_launch).toEqual([]);
    });
  });

  describe('écarts', () => {
    it('réveille uniquement les stacks en retard', async () => {
      globalThis.fetch = makeFetchMock({
        'endoflife.date/api/dotnet.json': [
          { cycle: '11', latest: '11.0.0' },
          { cycle: '10.0', latest: '10.0.12' },
        ],
      });
      const result = await collect({ write: false });
      expect(result.entries.csharp.gap).toBe('majeur');
      expect(result.agents_to_launch).toEqual(['csharp']);
    });

    it('fail-open : une source injoignable donne inconnu et un agent', async () => {
      globalThis.fetch = makeFetchMock({}, ['registry.npmjs.org']);
      const result = await collect({ write: false });
      expect(result.entries.react.gap).toBe('inconnu');
      expect(result.entries.react.error).toMatch(/503/);
      expect(result.agents_to_launch).toEqual(['react']);
    });
  });

  describe('sélection', () => {
    it('--full lance toutes les entrées et les familles', async () => {
      globalThis.fetch = makeFetchMock();
      const result = await collect({ write: false, full: true });
      expect(result.agents_to_launch).toEqual(['react', 'laravel', 'csharp', 'pgbouncer', 'testing']);
    });

    it('--wave=2 ne lance que les familles transverses', async () => {
      globalThis.fetch = makeFetchMock();
      const result = await collect({ write: false, wave: '2' });
      expect(result.agents_to_launch).toEqual(['testing']);
      expect(result.families.testing.paths).toEqual(['e']);
    });

    it('--wave=3 ne collecte que l’infra', async () => {
      globalThis.fetch = makeFetchMock({
        'api.github.com/repos/pgbouncer/pgbouncer/releases/latest': { tag_name: 'pgbouncer_1_27_0' },
      });
      const result = await collect({ write: false, wave: '3' });
      expect(Object.keys(result.entries)).toEqual(['pgbouncer']);
      expect(result.agents_to_launch).toEqual(['pgbouncer']);
    });

    it('--stack force un stack même à jour', async () => {
      globalThis.fetch = makeFetchMock();
      const result = await collect({ write: false, stack: 'react' });
      expect(Object.keys(result.entries)).toEqual(['react']);
      expect(result.agents_to_launch).toEqual(['react']);
    });

    it('--stack inconnu échoue explicitement', async () => {
      globalThis.fetch = makeFetchMock();
      await expect(collect({ write: false, stack: 'cobol' })).rejects.toThrow(/cobol/);
    });
  });

  describe('écriture', () => {
    it('écrit signals-<date>.json et repère le rapport précédent', async () => {
      writeFileSync(path.join(TEST_TMP_DIR, 'freshness-2026-06-15.md'), '# ancien');
      writeFileSync(path.join(TEST_TMP_DIR, 'freshness-2026-10-13.md'), '# précédent');
      globalThis.fetch = makeFetchMock();
      const result = await collect();
      const file = path.join(outDir, 'signals-2026-11-10.json');
      expect(existsSync(file)).toBe(true);
      expect(JSON.parse(readFileSync(file, 'utf8')).date).toBe('2026-11-10');
      expect(result.previous_report).toBe('freshness-2026-10-13.md');
      expect(result.claude_craft_version).toMatch(/^\d+\.\d+\.\d+/);
    });

    it("--dry-run n'écrit rien", async () => {
      globalThis.fetch = makeFetchMock();
      await collect({ write: false });
      expect(existsSync(outDir)).toBe(false);
    });
  });

  describe('configuration réelle', () => {
    const versions = yaml.load(readFileSync(VERSIONS, 'utf8'));
    const sources = yaml.load(readFileSync(SOURCES, 'utf8'));
    const sourceKeys = [...Object.keys(sources.stacks), ...Object.keys(sources.infra)];

    it('chaque stack et outil infra de versions.yaml a une source', () => {
      const declared = [...Object.keys(versions.stacks), ...Object.keys(versions.infra)];
      expect(declared.filter((k) => !sourceKeys.includes(k))).toEqual([]);
      expect(sourceKeys.filter((k) => !declared.includes(k))).toEqual([]);
    });

    it('chaque source a un kind connu et chaque chemin existe', () => {
      const all = { ...sources.stacks, ...sources.infra, ...sources.families };
      for (const [key, src] of Object.entries(all)) {
        if (!(key in sources.families)) expect(mod.KINDS, key).toContain(src.kind);
        expect(src.paths?.length, key).toBeGreaterThan(0);
        for (const p of src.paths) expect(existsSync(path.join(PROJECT_ROOT, p)), `${key}: ${p}`).toBe(true);
      }
    });

    it('chaque dossier Dev/i18n/en d’un stack est audité', () => {
      const audited = new Set(Object.values(sources.stacks).flatMap((s) => s.paths));
      const nonStacks = ['Common', 'QA', 'Team', 'UIUX', 'Workflow'];
      const stackDirs = readdirSync(path.join(PROJECT_ROOT, 'Dev/i18n/en')).filter((d) => !nonStacks.includes(d));
      expect(stackDirs.filter((d) => !audited.has(`Dev/i18n/en/${d}`))).toEqual([]);
    });
  });
});
