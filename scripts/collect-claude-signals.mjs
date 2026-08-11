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

const PROJECT_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DEFAULT_BASELINE = path.join(PROJECT_ROOT, 'config', 'claude-alignment-baseline.json');
const DEFAULT_OUT_DIR = path.join(PROJECT_ROOT, 'docs', 'audit', 'claude-alignment');

const NPM_REGISTRY = 'https://registry.npmjs.org/@anthropic-ai/claude-code';
const ADVISORIES = 'https://api.github.com/repos/anthropics/claude-code/security-advisories';
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
 */
const WATCHED_PAGES = {
  'models-pricing': 'https://docs.claude.com/en/docs/about-claude/models/overview.md',
  'prompt-context': 'https://docs.claude.com/en/docs/build-with-claude/prompt-engineering/overview.md',
  'cc-features': 'https://docs.claude.com/en/docs/claude-code/settings.md',
};

/** Ordre canonique des lentilles — dicte l'ordre de `agents_to_launch`. */
const LENSES = [
  'cli-release',
  'models-pricing',
  'prompt-context',
  'cc-features',
  'security-cve',
  'community',
  'internal-conformance',
];

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

/**
 * Compare deux versions segment par segment, numériquement.
 * Indispensable : en comparaison de chaînes, '2.1.9' passerait pour plus récent
 * que '2.1.193'.
 *
 * @returns {number} > 0 si `a` est plus récente, < 0 si plus ancienne, 0 si égales
 */
export function compareVersions(a, b) {
  const parse = (v) =>
    String(v)
      .split('.')
      .map((seg) => parseInt(seg, 10) || 0);
  const left = parse(a);
  const right = parse(b);
  const len = Math.max(left.length, right.length);
  for (let i = 0; i < len; i += 1) {
    const diff = (left[i] ?? 0) - (right[i] ?? 0);
    if (diff !== 0) return diff;
  }
  return 0;
}

async function fetchJson(url) {
  const res = await fetch(url, { headers: { ...UA, Accept: 'application/vnd.github+json' } });
  if (!res.ok) throw new Error(`${url} → ${res.status} ${res.statusText}`);
  return res.json();
}

async function fetchText(url) {
  const res = await fetch(url, { headers: UA });
  if (!res.ok) throw new Error(`${url} → ${res.status} ${res.statusText}`);
  return res.text();
}

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

/** Version de Claude Code actuellement déclarée par la source de vérité du repo. */
function declaredCliVersion(baseline) {
  return baseline?.cli_version_seen ?? null;
}

/**
 * Collecte les signaux et calcule le delta vs baseline.
 *
 * @param {object} opts
 * @param {string} [opts.baselinePath] chemin de la baseline versionnée
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
  const declared = declaredCliVersion(baseline);
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

  // --- Lentille 7 : conformité interne -----------------------------------------
  // Scan local pur (frontmatters, context: fork, cohérence model/effort). Aucune
  // source réseau, coût quasi nul en haiku : toujours lancée.
  lenses['internal-conformance'] = {
    changed: true,
    reason: 'scan local systématique — indépendant de toute source externe',
    sources: [],
  };

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
