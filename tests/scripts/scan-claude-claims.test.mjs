import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { rmSync, mkdirSync, writeFileSync, existsSync, readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import path from 'node:path';

/**
 * Garde-fou du scanner d'affirmations Claude de `/common:audit-claude-alignment`.
 *
 * Le run du 2026-11-10 n'avait confronté que ~15 fichiers pivots alors que 160
 * fichiers suivis portent des affirmations Claude (IDs, versions CLI, prix).
 * Le scanner inventorie tout le dépôt et classe chaque occurrence contre
 * `config/versions.yaml`. Un faux négatif ici = une dérive qui survit des mois.
 */

const PROJECT_ROOT = path.resolve(import.meta.dirname, '../..');
const TMP = path.join(PROJECT_ROOT, '.test-tmp', 'claude-claims');
const SCRIPT = path.join(PROJECT_ROOT, 'scripts', 'scan-claude-claims.mjs');

const VERSIONS = `claudeCode:
  minimum: '2.1.260'
  recommended: '2.1.322'
  testedUpTo: '2.1.322'
  models:
    opus: 'claude-opus-5-5'
    fable: 'claude-fable-5-2'
  limitedModels:
    - 'claude-mythos-5-2'
  legacyModels:
    - 'claude-fable-5-1'
    - 'claude-opus-4-8'
  pricing:
    claude-opus-5-5: '$4/$20'
    claude-fable-5-2: '$8/$40'
claimScan:
  exclude:
    - 'docs/audit/'
    - 'CHANGELOG.md'
  historyFiles:
    - 'docs/MIGRATION*'
`;

const { scanText, loadTruth, scanClaims } = await import(SCRIPT);

function truth() {
  return loadTruth(path.join(TMP, 'versions.yaml'));
}

function write(rel, content) {
  const abs = path.join(TMP, 'repo', rel);
  mkdirSync(path.dirname(abs), { recursive: true });
  writeFileSync(abs, content);
  return rel;
}

describe('scan-claude-claims', () => {
  beforeEach(() => {
    rmSync(TMP, { recursive: true, force: true });
    mkdirSync(TMP, { recursive: true });
    writeFileSync(path.join(TMP, 'versions.yaml'), VERSIONS);
  });
  afterEach(() => rmSync(TMP, { recursive: true, force: true }));

  describe('model-id', () => {
    it('classe un ID courant en current', () => {
      const [o] = scanText('a.md', 'Utiliser `claude-opus-5-5`.', truth());
      expect(o).toMatchObject({ category: 'model-id', match: 'claude-opus-5-5', status: 'current', line: 1 });
    });

    it('signale un ID legacy présenté comme courant', () => {
      const occ = scanText('a.md', 'Modèle courant : `claude-fable-5-1`.', truth());
      expect(occ.find((o) => o.category === 'model-id').status).toBe('stale');
    });

    it('évalue le contexte par segment : courant puis legacy sur la même ligne', () => {
      const occ = scanText(
        'a.md',
        '`claude-fable-5-1` est un modèle courant ; `claude-opus-4-8` reste legacy',
        truth()
      );
      expect(occ.filter((o) => o.category === 'model-id').map((o) => o.status)).toEqual(['stale', 'legacy']);
    });

    it('tolère un ID legacy mentionné comme legacy', () => {
      const occ = scanText('a.md', 'Legacy toujours disponibles : `claude-opus-4-8`.', truth());
      expect(occ.find((o) => o.category === 'model-id').status).toBe('legacy');
    });

    it('classe un ID absent de la vérité en unknown', () => {
      const occ = scanText('a.md', 'Voir `claude-sonnet-9-9`.', truth());
      expect(occ.find((o) => o.category === 'model-id').status).toBe('unknown');
    });

    it('reconnaît un modèle à disponibilité limitée', () => {
      const occ = scanText('a.md', '`claude-mythos-5-2`', truth());
      expect(occ.find((o) => o.category === 'model-id').status).toBe('current');
    });
  });

  describe('model-name', () => {
    it('signale « Fable 5.1 » présenté comme courant (5 langues)', () => {
      for (const line of [
        'Fable 5.1 est un modèle courant',
        'Fable 5.1 is the current model',
        'Fable 5.1 ist das aktuelle Modell',
        'Fable 5.1 es el modelo actual',
        'Fable 5.1 é o modelo atual',
        'Modelos atuais : Fable 5.1 para agentes',
      ]) {
        const o = scanText('a.md', line, truth()).find((x) => x.category === 'model-name');
        expect(o?.status, line).toBe('stale');
      }
    });

    it('accepte le nom du modèle courant', () => {
      const o = scanText('a.md', 'Fable 5.2 est le modèle courant', truth()).find((x) => x.category === 'model-name');
      expect(o.status).toBe('current');
    });
  });

  describe('cli-version', () => {
    it('signale une version recommandée périmée (5 langues)', () => {
      for (const line of [
        'version recommandée : 2.1.319',
        'recommended: v2.1.319',
        'Empfohlen 2.1.319',
        'versión recomendada 2.1.319',
        'versão recomendada 2.1.319',
      ]) {
        const o = scanText('a.md', line, truth()).find((x) => x.category === 'cli-version');
        expect(o?.status, line).toBe('stale');
      }
    });

    it('accepte la version recommandée courante et le minimum', () => {
      const occ = scanText(
        'a.md',
        'Minimum 2.1.260, recommandé 2.1.322 ; 2.1.260+ (2.1.322 recommended)',
        truth()
      ).filter((x) => x.category === 'cli-version');
      expect(occ.map((o) => o.status)).toEqual(['inventory', 'current', 'inventory', 'current']);
    });

    it('ne flagge que la version qualifiée par le mot-clé', () => {
      const occ = scanText('a.md', 'Compatibility (v2.1.20+) — **Recommended:** 2.1.322', truth()).filter(
        (x) => x.category === 'cli-version'
      );
      expect(occ.map((o) => [o.match, o.status])).toEqual([
        ['2.1.20', 'inventory'],
        ['2.1.322', 'current'],
      ]);
    });

    it('signale un « tested up to » périmé', () => {
      const o = scanText('a.md', '**Tested up to:** 2.1.319', truth()).find((x) => x.category === 'cli-version');
      expect(o.status).toBe('stale');
    });

    it('classe une ligne de table d’historique de versions en history', () => {
      const o = scanText('a.md', '| 2.1.319 | `permissions.denyInsteadOfPrompting` recommandé |', truth()).find(
        (x) => x.category === 'cli-version'
      );
      expect(o.status).toBe('history');
    });

    it('classe une note de version datée en history', () => {
      const o = scanText('a.md', '**Stacks (2026-11-09, v9.2.0) :** Claude Code recommandé : 2.1.319.', truth()).find(
        (x) => x.category === 'cli-version'
      );
      expect(o.status).toBe('history');
    });

    it('lit « version recommandée » placé après la version', () => {
      const o = scanText('a.md', '- **Claude Code 2.1.319** -- version recommandée', truth()).find(
        (x) => x.category === 'cli-version'
      );
      expect(o.status).toBe('stale');
    });

    it('classe une mention sans contexte recommandé en inventory', () => {
      const o = scanText('a.md', 'Ajouté en 2.1.316', truth()).find((x) => x.category === 'cli-version');
      expect(o.status).toBe('inventory');
    });
  });

  describe('pricing', () => {
    it('signale un prix périmé pour un modèle courant', () => {
      const o = scanText('a.md', '`claude-fable-5-2` ($10/$50)', truth()).find((x) => x.category === 'pricing');
      expect(o.status).toBe('stale');
    });

    it('tolère un palier tarifaire quand le prix de base est sur la ligne', () => {
      const occ = scanText('a.md', 'Opus 5.5 $4/$20 (≤ 200K ; $8/$40 au-delà)', truth()).filter(
        (x) => x.category === 'pricing'
      );
      expect(occ.map((o) => o.status)).toEqual(['current', 'inventory']);
    });

    it('lit le format français « 10 $/50 $ »', () => {
      const o = scanText('a.md', 'Fable 5.2 (10 $/50 $ par Mtok)', truth()).find((x) => x.category === 'pricing');
      expect(o).toMatchObject({ match: '10 $/50 $', status: 'stale' });
    });

    it('accepte le prix courant', () => {
      const o = scanText('a.md', 'Opus 5.5 — $4/$20', truth()).find((x) => x.category === 'pricing');
      expect(o.status).toBe('current');
    });
  });

  describe('autres catégories', () => {
    it('inventorie les variables CLAUDE_CODE_*', () => {
      const o = scanText('a.md', 'export CLAUDE_CODE_SUBAGENT_MODEL=sonnet', truth()).find(
        (x) => x.category === 'env-var'
      );
      expect(o).toMatchObject({ match: 'CLAUDE_CODE_SUBAGENT_MODEL', status: 'inventory' });
    });

    it('ignore une constante BUDGET_TOKENS sans rapport', () => {
      expect(scanText('a.md', '`DEFAULT_BUDGET_TOKENS`', truth()).some((x) => x.category === 'deprecated-term')).toBe(
        false
      );
    });

    it('marque les termes dépréciés à revoir', () => {
      const o = scanText('a.md', 'Activer extended thinking', truth()).find((x) => x.category === 'deprecated-term');
      expect(o.status).toBe('review');
    });
  });

  describe('scanClaims', () => {
    it('exclut les chemins configurés et classe les fichiers d’historique', async () => {
      const files = [
        write('docs/guide.md', 'recommandé : 2.1.319\n'),
        write('docs/audit/old.md', 'recommandé : 2.1.319\n'),
        write('CHANGELOG.md', 'recommandé : 2.1.319\n'),
        write('docs/MIGRATION-v9.md', 'recommandé : 2.1.319\n'),
      ];
      const r = await scanClaims({
        root: path.join(TMP, 'repo'),
        files,
        versionsPath: path.join(TMP, 'versions.yaml'),
        write: false,
      });
      expect(r.files_scanned).toBe(2);
      expect(r.stale.map((o) => o.file)).toEqual(['docs/guide.md']);
      expect(r.occurrences_by_category['cli-version'].history).toBe(1);
    });

    it('écrit claims-<date>.json', async () => {
      const files = [write('a.md', '`claude-opus-5-5`\n')];
      const outDir = path.join(TMP, 'out');
      await scanClaims({
        root: path.join(TMP, 'repo'),
        files,
        versionsPath: path.join(TMP, 'versions.yaml'),
        outDir,
        now: new Date('2026-11-10T00:00:00Z'),
      });
      const file = path.join(outDir, 'claims-2026-11-10.json');
      expect(existsSync(file)).toBe(true);
      expect(JSON.parse(readFileSync(file, 'utf8')).files_scanned).toBe(1);
    });
  });

  describe('CLI', () => {
    const run = (...args) =>
      spawnSync(
        process.execPath,
        [
          SCRIPT,
          `--root=${path.join(TMP, 'repo')}`,
          `--versions=${path.join(TMP, 'versions.yaml')}`,
          '--dry-run',
          ...args,
        ],
        { encoding: 'utf8' }
      );

    it('--fail-on-stale sort en 1 quand une occurrence est périmée', () => {
      write('a.md', 'recommandé : 2.1.319\n');
      expect(run('--files=a.md', '--fail-on-stale').status).toBe(1);
    });

    it('--fail-on-stale sort en 0 sans occurrence périmée', () => {
      write('a.md', 'recommandé : 2.1.322\n');
      expect(run('--files=a.md', '--fail-on-stale').status).toBe(0);
    });
  });
});
