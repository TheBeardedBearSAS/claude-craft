#!/usr/bin/env node
/**
 * scan-claude-claims.mjs — inventaire déterministe des affirmations Claude du
 * dépôt, pour `/common:audit-claude-alignment`.
 *
 * Pourquoi : les lentilles de l'audit ne lisaient qu'une liste figée de fichiers
 * pivots (~15) alors que 160 fichiers suivis citent des IDs de modèles, des
 * versions du CLI ou des prix (run du 2026-11-10). Ce scanner parcourt tout
 * `git ls-files`, classe chaque occurrence contre `config/versions.yaml` et
 * nourrit les agents avec les seules occurrences à statuer.
 *
 * Statuts : current | legacy | history | inventory | review | stale | unknown.
 * Seul `stale` (affirmation périmée certaine) fait échouer `--fail-on-stale`.
 *
 * Usage :
 *   node scripts/scan-claude-claims.mjs [--dry-run] [--fail-on-stale]
 *        [--root=<dir>] [--versions=<yaml>] [--out=<dir>] [--files=a,b]
 *   npm run audit:claude-claims
 *
 * @module scripts/scan-claude-claims
 */
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as yaml from 'js-yaml';

const PROJECT_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DEFAULT_VERSIONS = path.join(PROJECT_ROOT, 'config', 'versions.yaml');
const DEFAULT_OUT_DIR = path.join(PROJECT_ROOT, 'docs', 'audit', 'claude-alignment');

const BINARY_EXT = new Set([
  '.png',
  '.jpg',
  '.jpeg',
  '.gif',
  '.ico',
  '.webp',
  '.svg',
  '.woff',
  '.woff2',
  '.pdf',
  '.zip',
]);

// Mots-clés des 5 langues du projet (en, fr, es, de, pt).
const CURRENT_KW =
  /courant|current|actuel|par d[ée]faut|default|aktuell|actual|atua[li]|recommand|recommend|empfohlen|recomendad/i;
const LEGACY_KW =
  /legacy|obsol|deprecat|d[ée]pr[ée]ci|ancien|previous|predecess|pr[ée]d[ée]cess|remplac|replaced|retir|veraltet|antiguo|antigo/i;
const RECO_KW = /recommand|recommend|empfohlen|recomendad/i;
const TESTED_KW = /tested up to|test[ée] jusqu|getestet bis|probado hasta|testado at[ée]/i;

const MODEL_ID_RE = /claude-(?:opus|sonnet|haiku|fable|mythos)-\d+(?:[-.]\d+)*/g;
const MODEL_NAME_RE = /\b(Opus|Sonnet|Haiku|Fable|Mythos) (\d+(?:\.\d+)?)\b/g;
const CLI_RE = /(?<![\d.])2\.1\.\d{2,3}(?!\d)/g;
// `$4/$20` (en) ou `4 $/20 $` (fr) : groupes 1-2 ou 3-4.
const PRICE_RE = /\$(\d+(?:\.\d+)?)\s*\/\s*\$(\d+(?:\.\d+)?)|(\d+(?:[.,]\d+)?)\s?\$\s*\/\s*(\d+(?:[.,]\d+)?)\s?\$/g;
const ENV_RE = /\bCLAUDE_CODE_[A-Z0-9_]+/g;
const DEPRECATED_RE = /[Ee]xtended thinking|\bbudget_tokens\b/g;

/** `claude-haiku-4-5-20251001` et `claude-opus-4.6` → forme canonique comparable. */
const normalizeId = (id) => id.replace(/\./g, '-').replace(/-\d{8}$/, '');

const nameToId = (family, version) => `claude-${family.toLowerCase()}-${version.replace('.', '-')}`;

/** Charge la vérité Claude depuis `config/versions.yaml`. */
export function loadTruth(versionsPath = DEFAULT_VERSIONS) {
  const doc = yaml.load(readFileSync(versionsPath, 'utf8'));
  const cc = doc.claudeCode ?? {};
  const current = new Set([...Object.values(cc.models ?? {}), ...(cc.limitedModels ?? [])].map(normalizeId));
  const pricing = new Map(Object.entries(cc.pricing ?? {}).map(([id, p]) => [normalizeId(id), p]));
  return {
    current,
    legacy: new Set((cc.legacyModels ?? []).map(normalizeId)),
    pricing,
    recommended: cc.recommended,
    testedUpTo: cc.testedUpTo ?? cc.recommended,
    minimum: cc.minimum,
    exclude: doc.claimScan?.exclude ?? [],
    historyFiles: doc.claimScan?.historyFiles ?? [],
  };
}

/** Segment de la ligne (cellule, proposition) qui contient la position `index`. */
function segmentAt(line, index) {
  const re = /[;|—]|\. /g;
  let start = 0;
  for (const m of line.matchAll(re)) {
    if (m.index >= index) return line.slice(start, m.index);
    start = m.index + m[0].length;
  }
  return line.slice(start);
}

function classifyModel(id, line, index, truth) {
  const norm = normalizeId(id);
  if (truth.legacy.has(norm)) {
    const seg = segmentAt(line, index);
    const current = CURRENT_KW.test(seg) || (CURRENT_KW.test(line) && !LEGACY_KW.test(line));
    return current && !LEGACY_KW.test(seg) && !isHistoryRow(line) ? 'stale' : 'legacy';
  }
  return truth.current.has(norm) ? 'current' : 'unknown';
}

/**
 * Ligne de table dont la 1re cellule est une version et la 2e n'en fait pas
 * une recommandation : table d'historique (changelog, features par version).
 */
function isHistoryRow(line) {
  const cells = line.split('|').map((c) => c.replace(/\*/g, '').trim());
  if (!line.trimStart().startsWith('|') || cells.length < 3) return false;
  if (!/^v?2\.1\.\d{2,3}$/.test(cells[1])) return false;
  return !RECO_KW.test(cells[2].split(/[\s(]/)[0]) && !TESTED_KW.test(cells[2]);
}

/**
 * Le mot-clé qualifie-t-il CETTE version ? Mot-clé au plus 30 caractères avant
 * (« Recommended Version:** 2.1.x ») ou juste après (« 2.1.x recommended »),
 * sans autre chiffre entre les deux. Évite de flagger `(v2.1.20+)` sur une
 * ligne qui cite aussi la version recommandée.
 */
function qualifies(kwSource, line, index, length) {
  const kw = new RegExp(kwSource, 'gi');
  for (const k of line.matchAll(kw)) {
    const before = line.slice(k.index + k[0].length, index);
    if (k.index < index && before.length <= 30 && !/\d/.test(before.replace(/^[^\s:*|]*/, ''))) return true;
    const after = line.slice(index + length, k.index);
    if (k.index >= index + length && after.length <= 6 && !/\d/.test(after)) return true;
  }
  return false;
}

function classifyCli(m, line, truth) {
  const version = m[0];
  if (isHistoryRow(line)) return 'history';
  if (qualifies(TESTED_KW.source, line, m.index, version.length)) {
    return version === truth.testedUpTo || version === truth.minimum ? 'current' : 'stale';
  }
  if (qualifies(RECO_KW.source, line, m.index, version.length)) {
    return version === truth.recommended || version === truth.minimum ? 'current' : 'stale';
  }
  return 'inventory';
}

/** Modèle (ID ou nom) le plus proche avant `index` sur la ligne. */
function modelBefore(line, index) {
  let best = null;
  for (const m of line.matchAll(MODEL_ID_RE)) if (m.index < index) best = { at: m.index, id: m[0] };
  for (const m of line.matchAll(MODEL_NAME_RE)) {
    if (m.index < index && (!best || m.index > best.at)) best = { at: m.index, id: nameToId(m[1], m[2]) };
  }
  return best && normalizeId(best.id);
}

function classifyPrice(m, line, truth) {
  const id = modelBefore(line, m.index);
  const expected = id && truth.pricing.get(id);
  if (!expected) return 'inventory';
  const num = (x) => Number(String(x).replace(',', '.'));
  const pair = (p) => [num(p[1] ?? p[3]), num(p[2] ?? p[4])];
  const same = (a, b) => pair(a)[0] === pair(b)[0] && pair(a)[1] === pair(b)[1];
  const exp = expected.match(/\$(\d+(?:\.\d+)?)\s*\/\s*\$(\d+(?:\.\d+)?)/);
  if (same(m, exp)) return 'current';
  // Palier tarifaire (long contexte…) : le prix de base figure déjà sur la ligne.
  const base = [...line.matchAll(PRICE_RE)].some((p) => same(p, exp));
  const baseInColumns = line.includes(`$${exp[1]} `) && line.includes(`$${exp[2]} `);
  return base || baseInColumns ? 'inventory' : 'stale';
}

/** Occurrences d'affirmations Claude dans un texte. Fonction pure. */
export function scanText(file, text, truth) {
  const out = [];
  const lines = text.split('\n');
  lines.forEach((line, i) => {
    const push = (category, match, status) =>
      out.push({ file, line: i + 1, category, match, status, excerpt: line.trim().slice(0, 160) });
    for (const m of line.matchAll(MODEL_ID_RE)) push('model-id', m[0], classifyModel(m[0], line, m.index, truth));
    for (const m of line.matchAll(MODEL_NAME_RE)) {
      push('model-name', m[0], classifyModel(nameToId(m[1], m[2]), line, m.index, truth));
    }
    for (const m of line.matchAll(CLI_RE)) push('cli-version', m[0], classifyCli(m, line, truth));
    for (const m of line.matchAll(PRICE_RE)) push('pricing', m[0], classifyPrice(m, line, truth));
    for (const m of line.matchAll(ENV_RE)) push('env-var', m[0], 'inventory');
    for (const m of line.matchAll(DEPRECATED_RE)) push('deprecated-term', m[0], 'review');
  });
  return out;
}

/** Entrée exacte, préfixe de dossier (`dir/`) ou préfixe libre (`docs/MIGRATION*`). */
const matchesPrefix = (file, list) =>
  list.some(
    (p) => file === p || (p.endsWith('/') && file.startsWith(p)) || (p.endsWith('*') && file.startsWith(p.slice(0, -1)))
  );

function listGitFiles(root) {
  const raw = execFileSync('git', ['-c', 'safe.directory=*', 'ls-files', '-z'], { cwd: root, encoding: 'utf8' });
  return raw.split('\0').filter(Boolean);
}

/** Scanne le dépôt (ou `opts.files`) et écrit `claims-<date>.json` sauf `write: false`. */
export async function scanClaims(opts = {}) {
  const root = opts.root ?? PROJECT_ROOT;
  const truth = loadTruth(opts.versionsPath ?? DEFAULT_VERSIONS);
  const now = opts.now ?? new Date();
  const date = now.toISOString().slice(0, 10);
  const files = (opts.files ?? listGitFiles(root)).filter(
    (f) => !matchesPrefix(f, truth.exclude) && !BINARY_EXT.has(path.extname(f).toLowerCase())
  );

  const occurrences = [];
  let scanned = 0;
  for (const file of files) {
    let text;
    try {
      text = readFileSync(path.join(root, file), 'utf8');
    } catch {
      continue; // fichier supprimé du worktree ou illisible
    }
    if (text.includes('\0')) continue;
    scanned += 1;
    const history = matchesPrefix(file, truth.historyFiles);
    for (const o of scanText(file, text, truth)) {
      occurrences.push(history && o.status === 'stale' ? { ...o, status: 'history' } : o);
    }
  }

  const byCategory = {};
  for (const o of occurrences) {
    byCategory[o.category] ??= {};
    byCategory[o.category][o.status] = (byCategory[o.category][o.status] ?? 0) + 1;
  }
  const pick = (status) => occurrences.filter((o) => o.status === status);
  const result = {
    generated_at: now.toISOString(),
    date,
    files_scanned: scanned,
    occurrences_total: occurrences.length,
    occurrences_by_category: byCategory,
    stale: pick('stale'),
    unknown: pick('unknown'),
    review: pick('review'),
  };

  if (opts.write !== false) {
    const outDir = opts.outDir ?? DEFAULT_OUT_DIR;
    await mkdir(outDir, { recursive: true });
    await writeFile(path.join(outDir, `claims-${date}.json`), `${JSON.stringify(result, null, 2)}\n`, 'utf8');
  }
  return result;
}

function parseArgs(argv) {
  const opts = {};
  for (const arg of argv) {
    if (arg === '--dry-run') opts.write = false;
    else if (arg === '--fail-on-stale') opts.failOnStale = true;
    else if (arg.startsWith('--root=')) opts.root = arg.slice('--root='.length);
    else if (arg.startsWith('--versions=')) opts.versionsPath = arg.slice('--versions='.length);
    else if (arg.startsWith('--out=')) opts.outDir = arg.slice('--out='.length);
    else if (arg.startsWith('--files=')) opts.files = arg.slice('--files='.length).split(',').filter(Boolean);
  }
  return opts;
}

if (process.argv[1] && import.meta.url === `file://${process.argv[1]}`) {
  const opts = parseArgs(process.argv.slice(2));
  const r = await scanClaims(opts);
  console.log(`Affirmations Claude — ${r.date} : ${r.files_scanned} fichiers, ${r.occurrences_total} occurrences`);
  for (const [cat, counts] of Object.entries(r.occurrences_by_category)) {
    console.log(
      `  ${cat.padEnd(16)} ${Object.entries(counts)
        .map(([s, n]) => `${s}=${n}`)
        .join(' ')}`
    );
  }
  for (const [label, list] of [
    ['PÉRIMÉ', r.stale],
    ['INCONNU', r.unknown],
    ['À REVOIR', r.review],
  ]) {
    for (const o of list) console.log(`  [${label}] ${o.file}:${o.line} ${o.match} — ${o.excerpt}`);
  }
  if (opts.failOnStale && r.stale.length > 0) {
    console.error(`\n❌ ${r.stale.length} affirmation(s) périmée(s). Source de vérité : config/versions.yaml`);
    process.exit(1);
  }
}
