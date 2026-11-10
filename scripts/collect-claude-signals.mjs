#!/usr/bin/env node
/**
 * collect-claude-signals.mjs — pré-collecte déterministe pour
 * `/common:audit-claude-alignment`.
 *
 * Rôle : décider, SANS appeler de modèle, quelles lentilles d'audit méritent un
 * sous-agent cette semaine. Chaque lentille dont la source externe n'a pas bougé
 * depuis la baseline est court-circuitée : la commande écrit « aucun changement »
 * dans le rapport et n'invoque aucun agent. C'est le principal levier de coût de
 * l'audit hebdomadaire.
 *
 * Conception fail-open : une source injoignable marque la lentille « à auditer »
 * plutôt que « rien à signaler ». Une panne réseau ne doit jamais se traduire par
 * un angle mort silencieux.
 *
 * Usage :
 *   node scripts/collect-claude-signals.mjs [--since=YYYY-MM-DD] [--dry-run]
 *   npm run audit:claude-signals
 *
 * @module scripts/collect-claude-signals
 */
import { createHash } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as yaml from 'js-yaml';
import { compareVersions, fetchJson as fetchJsonRaw, fetchText as fetchTextRaw } from './lib/http.mjs';

const PROJECT_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DEFAULT_BASELINE = path.join(PROJECT_ROOT, 'config', 'claude-alignment-baseline.json');
const DEFAULT_VERSIONS = path.join(PROJECT_ROOT, 'config', 'versions.yaml');
const DEFAULT_OUT_DIR = path.join(PROJECT_ROOT, 'docs', 'audit', 'claude-alignment');

const NPM_REGISTRY = 'https://registry.npmjs.org/@anthropic-ai/claude-code';
/** `per_page=100` : le défaut GitHub (30) tronquait la liste (36 avis au 2026-11-10). */
const ADVISORIES = 'https://api.github.com/repos/anthropics/claude-code/security-advisories?per_page=100';
/**
 * Catalogue communautaire. Le nom du fichier a déjà bougé upstream
 * (`THE_RESOURCES_TABLE.csv` → `..._NEW.csv`) : on essaie les candidats dans
 * l'ordre plutôt que de fail-open chaque semaine sur un 404 permanent, ce qui
 * coûterait un agent par run sans jamais rien apprendre.
 */
const COMMUNITY_CSV_CANDIDATES = [
  'https://raw.githubusercontent.com/hesreallyhim/awesome-claude-code/main/THE_RESOURCES_TABLE_NEW.csv',
  'https://raw.githubusercontent.com/hesreallyhim/awesome-claude-code/main/THE_RESOURCES_TABLE.csv',
];

/**
 * Pages sans API structurée : on suit leur contenu par empreinte. Modifier une
 * URL ici suffit à réorienter la lentille correspondante.
 *
 * Suffixe `.md` obligatoire — c'est la source markdown servie par la doc. Le
 * HTML rendu embarque un nonce qui change à CHAQUE requête : deux fetchs à
 * quelques secondes d'intervalle donnent la même taille mais deux empreintes
 * différentes, ce qui ferait croire à un changement toutes les semaines et
 * réveillerait un agent pour rien. Le markdown est stable, et 30× plus léger
 * (27 Ko contre 873 Ko) — les agents le récupèrent aussi à moindre coût.
 *
 * URLs canoniques (cibles finales des redirections `docs.claude.com`, vérifiées
 * le 2026-11-10) : les agents citent ainsi la même URL que le collecteur.
 */
const WATCHED_PAGES = {
  'models-pricing': 'https://platform.claude.com/docs/en/models/overview.md',
  'prompt-context':
    'https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices.md',
  'cc-features': 'https://code.claude.com/docs/en/settings.md',
};

/**
 * Ordre canonique des lentilles — dicte l'ordre de `agents_to_launch`.
 * La conformité interne (frontmatters, `context: fork`, model/effort, hooks)
 * n'est plus une lentille : elle est couverte par les tests de `tests/content/`,
 * exécutés comme gate local par la commande.
 */
const LENSES = ['cli-release', 'models-pricing', 'prompt-context', 'cc-features', 'security-cve', 'community'];

const UA = { 'User-Agent': 'claude-craft-alignment/1.0' };

/**
 * Empreinte stable d'un contenu textuel, insensible à la mise en forme.
 * Tronquée à 16 caractères : suffisant pour de la détection de changement,
 * lisible dans la baseline versionnée.
 */
export function hashOf(text) {
  const normalized = String(text).replace(/\s+/g, ' ').trim();
  return createHash('sha256').update(normalized).digest('hex').slice(0, 16);
}

export { compareVersions };

const fetchJson = (url) => fetchJsonRaw(url, { ...UA, Accept: 'application/vnd.github+json' });
const fetchText = (url) => fetchTextRaw(url, UA);

/** Premier candidat qui répond. Échoue avec l'erreur du dernier essai. */
async function fetchFirstOk(urls) {
  let last;
  for (const url of urls) {
    try {
      return { url, text: await fetchText(url) };
    } catch (err) {
      last = err;
    }
  }
  throw last;
}

function readBaseline(baselinePath) {
  if (!existsSync(baselinePath)) return null;
  return JSON.parse(readFileSync(baselinePath, 'utf8'));
}

/**
 * Version de Claude Code déclarée par le repo : la plus récente entre
 * `claudeCode.testedUpTo` (source de vérité, bumpée par les releases) et la
 * dernière version vue par l'audit. Sans cela, une release qui bumpe
 * versions.yaml hors audit réveillait `cli-release` pour rien.
 */
function declaredCliVersion(baseline, versionsPath) {
  const seen = baseline?.cli_version_seen ?? null;
  if (!existsSync(versionsPath)) return seen;
  const tested = yaml.load(readFileSync(versionsPath, 'utf8'))?.claudeCode?.testedUpTo ?? null;
  if (!tested) return seen;
  if (!seen) return String(tested);
  return compareVersions(tested, seen) > 0 ? String(tested) : seen;
}

/**
 * Collecte les signaux et calcule le delta vs baseline.
 *
 * @param {object} opts
 * @param {string} [opts.baselinePath] chemin de la baseline versionnée
 * @param {string} [opts.versionsPath] chemin de config/versions.yaml (tests)
 * @param {string} [opts.outDir] répertoire du fichier de signaux daté
 * @param {Date}   [opts.now] horloge injectable (tests)
 * @param {string} [opts.since] force la date de baseline (rattrapage de cadence)
 * @param {boolean}[opts.write] false pour ne rien écrire (--dry-run)
 */
export async function collectSignals(opts = {}) {
  const baselinePath = opts.baselinePath ?? DEFAULT_BASELINE;
  const outDir = opts.outDir ?? DEFAULT_OUT_DIR;
  const now = opts.now ?? new Date();
  const write = opts.write !== false;
  const date = now.toISOString().slice(0, 10);

  const stored = readBaseline(baselinePath);
  const baselineMissing = stored === null;
  const baseline = {
    schema_version: 1,
    last_run: null,
    cli_version_seen: null,
    page_hashes: {},
    community_csv_hash: null,
    advisories_seen: [],
    ...(stored ?? {}),
  };
  if (opts.since) baseline.last_run = opts.since;

  const lenses = {};
  const errors = {};

  /** Marque une lentille « à auditer » sans pouvoir conclure (fail-open). */
  const failOpen = (lens, err) => {
    errors[lens] = err.message;
    lenses[lens] = { changed: true, reason: 'collecte impossible — lentille à auditer par précaution' };
  };

  const [npmRes, advisoriesRes, csvRes, ...pageResults] = await Promise.allSettled([
    fetchJson(NPM_REGISTRY),
    fetchJson(ADVISORIES),
    fetchFirstOk(COMMUNITY_CSV_CANDIDATES),
    ...Object.values(WATCHED_PAGES).map((url) => fetchText(url)),
  ]);

  // --- Lentille 1 : version du CLI Claude Code ---------------------------------
  const declared = declaredCliVersion(baseline, opts.versionsPath ?? DEFAULT_VERSIONS);
  if (npmRes.status === 'fulfilled') {
    const observed = npmRes.value?.['dist-tags']?.latest ?? null;
    const changed = baselineMissing || !declared || !observed || compareVersions(observed, declared) > 0;
    lenses['cli-release'] = {
      changed,
      declared,
      observed,
      sources: [NPM_REGISTRY, 'https://github.com/anthropics/claude-code/blob/main/CHANGELOG.md'],
    };
  } else {
    failOpen('cli-release', npmRes.reason);
    lenses['cli-release'].declared = declared;
  }

  // --- Lentilles 2-4 : pages suivies par empreinte -----------------------------
  Object.keys(WATCHED_PAGES).forEach((lens, i) => {
    const result = pageResults[i];
    if (result.status !== 'fulfilled') {
      failOpen(lens, result.reason);
      lenses[lens].sources = [WATCHED_PAGES[lens]];
      return;
    }
    const before = baseline.page_hashes?.[lens] ?? null;
    const after = hashOf(result.value);
    lenses[lens] = {
      changed: baselineMissing || before === null || before !== after,
      hash_before: before,
      hash_after: after,
      sources: [WATCHED_PAGES[lens]],
    };
  });

  // --- Lentille 5 : advisories de sécurité -------------------------------------
  if (advisoriesRes.status === 'fulfilled') {
    const seen = new Set(baseline.advisories_seen ?? []);
    const all = Array.isArray(advisoriesRes.value) ? advisoriesRes.value : [];
    const ids = all.map((a) => a.ghsa_id).filter(Boolean);
    const fresh = ids.filter((id) => !seen.has(id));
    lenses['security-cve'] = {
      changed: baselineMissing || fresh.length > 0,
      new_advisories: fresh,
      known_count: ids.length,
      sources: [ADVISORIES],
    };
  } else {
    failOpen('security-cve', advisoriesRes.reason);
    lenses['security-cve'].sources = [ADVISORIES];
  }

  // --- Lentille 6 : catalogue communautaire ------------------------------------
  if (csvRes.status === 'fulfilled') {
    const before = baseline.community_csv_hash ?? null;
    const after = hashOf(csvRes.value.text);
    lenses.community = {
      changed: baselineMissing || before === null || before !== after,
      hash_before: before,
      hash_after: after,
      row_count: csvRes.value.text.split('\n').filter((l) => l.trim() !== '').length,
      sources: [csvRes.value.url],
    };
  } else {
    failOpen('community', csvRes.reason);
    lenses.community.sources = COMMUNITY_CSV_CANDIDATES;
  }

  const agentsToLaunch = LENSES.filter((lens) => lenses[lens]?.changed);

  // Baseline suivante : on ne fige que ce qu'on a réellement pu observer, pour
  // éviter qu'une panne réseau n'écrase un état connu par du vide.
  const nextBaseline = {
    schema_version: 1,
    last_run: date,
    cli_version_seen: lenses['cli-release'].observed ?? baseline.cli_version_seen,
    page_hashes: Object.fromEntries(
      Object.keys(WATCHED_PAGES).map((lens) => [lens, lenses[lens].hash_after ?? baseline.page_hashes?.[lens] ?? null])
    ),
    community_csv_hash: lenses.community.hash_after ?? baseline.community_csv_hash,
    advisories_seen:
      advisoriesRes.status === 'fulfilled'
        ? [...new Set([...(baseline.advisories_seen ?? []), ...lenses['security-cve'].new_advisories])]
        : (baseline.advisories_seen ?? []),
  };

  const result = {
    generated_at: now.toISOString(),
    date,
    baseline_missing: baselineMissing,
    baseline: { last_run: baseline.last_run, cli_version_seen: baseline.cli_version_seen },
    lenses,
    agents_to_launch: agentsToLaunch,
    errors,
    next_baseline: nextBaseline,
  };

  if (write) {
    await mkdir(outDir, { recursive: true });
    await writeFile(path.join(outDir, `signals-${date}.json`), `${JSON.stringify(result, null, 2)}\n`, 'utf8');
  }

  return result;
}

function parseArgs(argv) {
  const opts = {};
  for (const arg of argv) {
    if (arg === '--dry-run') opts.write = false;
    else if (arg.startsWith('--since=')) opts.since = arg.slice('--since='.length);
    else if (arg.startsWith('--baseline=')) opts.baselinePath = arg.slice('--baseline='.length);
    else if (arg.startsWith('--out=')) opts.outDir = arg.slice('--out='.length);
  }
  return opts;
}

if (process.argv[1] && import.meta.url === `file://${process.argv[1]}`) {
  const result = await collectSignals(parseArgs(process.argv.slice(2)));
  const skipped = LENSES.filter((l) => !result.agents_to_launch.includes(l));
  console.log(`Signaux Claude — ${result.date} (baseline : ${result.baseline.last_run ?? 'aucune'})`);
  console.log(`  À auditer  : ${result.agents_to_launch.join(', ') || 'aucune lentille'}`);
  console.log(`  Inchangées : ${skipped.join(', ') || 'aucune'}`);
  for (const [lens, message] of Object.entries(result.errors)) {
    console.warn(`  ⚠️  ${lens} : ${message}`);
  }
  console.log(JSON.stringify(result, null, 2));
}
