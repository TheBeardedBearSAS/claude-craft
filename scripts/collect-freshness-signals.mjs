#!/usr/bin/env node
/**
 * collect-freshness-signals.mjs — pré-collecte déterministe pour
 * `/common:audit-freshness`.
 *
 * Rôle : mesurer, SANS appeler de modèle, l'écart entre la version déclarée de
 * chaque stack / outil infra (`config/versions.yaml`) et la dernière version
 * stable publiée sur son registre officiel (`config/freshness-sources.yaml`).
 * Seuls les stacks en retard reçoivent un sous-agent ; les autres sont notés
 * « à jour » dans le rapport. Les registres font foi : les index Context7 sont
 * souvent en retard sur les releases (constaté à l'audit du 2026-10-13).
 *
 * Fail-open : une source injoignable donne l'écart `inconnu`, donc un agent,
 * jamais un « à jour » silencieux.
 *
 * Usage :
 *   node scripts/collect-freshness-signals.mjs [--wave=1|2|3|all] [--stack=<clé>] [--full] [--dry-run]
 *
 * @module scripts/collect-freshness-signals
 */
import { mkdir, writeFile } from 'node:fs/promises';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as yaml from 'js-yaml';
import { compareVersions, fetchJson, fetchText } from './lib/http.mjs';

const PROJECT_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DEFAULT_VERSIONS = path.join(PROJECT_ROOT, 'config', 'versions.yaml');
const DEFAULT_SOURCES = path.join(PROJECT_ROOT, 'config', 'freshness-sources.yaml');
const DEFAULT_AUDIT_DIR = path.join(PROJECT_ROOT, 'docs', 'audit');
const DEFAULT_OUT_DIR = path.join(DEFAULT_AUDIT_DIR, 'freshness');

const UA = { 'User-Agent': 'claude-craft-freshness/1.0' };
const GH = { ...UA, Accept: 'application/vnd.github+json' };
const FLUTTER_RELEASES = 'https://storage.googleapis.com/flutter_infra_release/releases/releases_linux.json';

/** Premier token de version d'une chaîne déclarée : '10 LTS / C# 14' → '10', '13.x' → '13'. */
export function parseDeclared(raw) {
  return String(raw ?? '').match(/\d+(?:\.\d+)*/)?.[0] ?? null;
}

/** Version contenue dans un tag ou un texte : 'pgbouncer_1_26_0' → '1.26.0', 'docker-v29.9.0' → '29.9.0'. */
export function extractVersion(tag) {
  return (
    String(tag ?? '')
      .replace(/_/g, '.')
      .match(/\d+(?:\.\d+)+/)?.[0] ?? null
  );
}

export function isPrerelease(version) {
  return /-(rc|alpha|beta|dev|pre|preview|next)|^dev-|\.x-dev$/i.test(String(version));
}

/**
 * Écart à la précision de la version déclarée, plafonnée à major.minor :
 * un patch en retard n'est pas un sujet d'audit.
 */
export function classifyGap(declared, stable) {
  if (!declared || !stable) return 'inconnu';
  const d = declared.split('.').map(Number);
  const s = stable.split('.').map(Number);
  if (s[0] > d[0]) return 'majeur';
  if (s[0] === d[0] && d.length >= 2 && s[1] > d[1]) return 'mineur';
  return 'aucun';
}

const maxStable = (versions) =>
  versions
    .filter((v) => v && !isPrerelease(v))
    .map(extractVersion)
    .filter(Boolean)
    .sort(compareVersions)
    .at(-1) ?? null;

/** Résolveurs par kind : renvoient l'URL interrogée (citée comme source) et la version stable. */
const RESOLVERS = {
  npm: async ({ pkg }) => {
    const url = `https://registry.npmjs.org/${pkg}/latest`;
    return { url, version: (await fetchJson(url, UA)).version };
  },
  pypi: async ({ pkg }) => {
    const url = `https://pypi.org/pypi/${pkg}/json`;
    return { url, version: (await fetchJson(url, UA)).info?.version };
  },
  packagist: async ({ pkg }) => {
    const url = `https://repo.packagist.org/p2/${pkg}.json`;
    const versions = ((await fetchJson(url, UA)).packages?.[pkg] ?? []).map((p) => p.version);
    return { url, version: maxStable(versions) };
  },
  crates: async ({ pkg }) => {
    const url = `https://crates.io/api/v1/crates/${pkg}`;
    return { url, version: (await fetchJson(url, UA)).crate?.max_stable_version };
  },
  rubygems: async ({ pkg }) => {
    const url = `https://rubygems.org/api/v1/versions/${pkg}/latest.json`;
    return { url, version: (await fetchJson(url, UA)).version };
  },
  endoflife: async ({ pkg, lts }) => {
    const url = `https://endoflife.date/api/${pkg}.json`;
    const cycles = (await fetchJson(url, UA)).filter((c) => !lts || c.lts);
    return { url, version: maxStable(cycles.map((c) => String(c.latest))) };
  },
  github: async ({ repo }) => {
    const url = `https://api.github.com/repos/${repo}/releases/latest`;
    return { url, version: (await fetchJson(url, GH)).tag_name };
  },
  flutter: async () => {
    const data = await fetchJson(FLUTTER_RELEASES, UA);
    const hash = data.current_release?.stable;
    return { url: FLUTTER_RELEASES, version: data.releases?.find((r) => r.hash === hash)?.version };
  },
  wordpress: async () => {
    const url = 'https://api.wordpress.org/core/version-check/1.7/';
    return { url, version: (await fetchJson(url, UA)).offers?.[0]?.version };
  },
  text: async ({ url }) => ({ url, version: await fetchText(url, UA) }),
};

export const KINDS = Object.keys(RESOLVERS);

async function resolveEntry(key, source, declaredRaw, wave) {
  const declared = parseDeclared(declaredRaw);
  const entry = {
    wave,
    declared_raw: declaredRaw ?? null,
    declared,
    stable: null,
    gap: 'inconnu',
    paths: source.paths,
  };
  try {
    const resolver = RESOLVERS[source.kind];
    if (!resolver) throw new Error(`kind inconnu : ${source.kind}`);
    const { url, version } = await resolver(source);
    entry.source_url = url;
    entry.stable = extractVersion(version);
    entry.gap = classifyGap(declared, entry.stable);
  } catch (err) {
    entry.error = err.message;
  }
  return [key, entry];
}

function previousReport(auditDir) {
  if (!existsSync(auditDir)) return null;
  const reports = readdirSync(auditDir)
    .filter((f) => /^freshness-\d{4}-\d{2}-\d{2}\.md$/.test(f))
    .sort();
  return reports.at(-1) ?? null;
}

/** Clés à collecter et familles retenues selon --stack / --wave / --full. */
function select(sources, { stack, wave = 'all', full = false }) {
  if (stack) {
    if (!(stack in sources.stacks) && !(stack in sources.infra)) {
      const known = [...Object.keys(sources.stacks), ...Object.keys(sources.infra)].join(', ');
      throw new Error(`--stack=${stack} inconnu. Clés valides : ${known}`);
    }
    return { keys: [stack], families: [], forced: true };
  }
  const w = String(wave);
  const keys = [
    ...(w === 'all' || w === '1' ? Object.keys(sources.stacks) : []),
    ...(w === 'all' || w === '3' ? Object.keys(sources.infra) : []),
  ];
  const families = w === '2' || (w === 'all' && full) ? Object.keys(sources.families ?? {}) : [];
  return { keys, families, forced: full };
}

/**
 * @param {object} opts
 * @param {string} [opts.versionsPath] config/versions.yaml
 * @param {string} [opts.sourcesPath]  config/freshness-sources.yaml
 * @param {string} [opts.outDir]       répertoire du fichier de signaux daté
 * @param {string} [opts.auditDir]     répertoire des rapports freshness-*.md précédents
 * @param {Date}   [opts.now]          horloge injectable (tests)
 * @param {boolean}[opts.write]        false pour ne rien écrire (--dry-run)
 * @param {boolean}[opts.full]         audite tout, même les stacks à jour, + familles transverses
 * @param {string} [opts.wave]         '1' stacks | '2' transverse | '3' infra | 'all'
 * @param {string} [opts.stack]        une seule clé, auditée même si à jour
 */
export async function collectFreshness(opts = {}) {
  const now = opts.now ?? new Date();
  const date = now.toISOString().slice(0, 10);
  const versions = yaml.load(readFileSync(opts.versionsPath ?? DEFAULT_VERSIONS, 'utf8'));
  const sources = yaml.load(readFileSync(opts.sourcesPath ?? DEFAULT_SOURCES, 'utf8'));
  const { keys, families, forced } = select(sources, opts);

  const declaredOf = (key) => versions.stacks?.[key]?.registry ?? versions.infra?.[key];
  const resolved = await Promise.all(
    keys.map((key) => {
      const inStacks = key in sources.stacks;
      return resolveEntry(key, inStacks ? sources.stacks[key] : sources.infra[key], declaredOf(key), inStacks ? 1 : 3);
    })
  );
  const entries = Object.fromEntries(resolved);
  const pkg = JSON.parse(readFileSync(path.join(PROJECT_ROOT, 'package.json'), 'utf8'));

  const result = {
    generated_at: now.toISOString(),
    date,
    claude_craft_version: pkg.version,
    previous_report: previousReport(opts.auditDir ?? DEFAULT_AUDIT_DIR),
    entries,
    families: Object.fromEntries(families.map((f) => [f, sources.families[f]])),
    agents_to_launch: [...keys.filter((k) => forced || entries[k].gap !== 'aucun'), ...families],
  };

  if (opts.write !== false) {
    const outDir = opts.outDir ?? DEFAULT_OUT_DIR;
    await mkdir(outDir, { recursive: true });
    await writeFile(path.join(outDir, `signals-${date}.json`), `${JSON.stringify(result, null, 2)}\n`, 'utf8');
  }
  return result;
}

function parseArgs(argv) {
  const opts = {};
  for (const arg of argv) {
    if (arg === '--dry-run') opts.write = false;
    else if (arg === '--full') opts.full = true;
    else if (arg.startsWith('--wave=')) opts.wave = arg.slice('--wave='.length);
    else if (arg.startsWith('--stack=')) opts.stack = arg.slice('--stack='.length);
  }
  return opts;
}

if (process.argv[1] && import.meta.url === `file://${process.argv[1]}`) {
  const result = await collectFreshness(parseArgs(process.argv.slice(2)));
  console.log(`Fraîcheur — ${result.date} (rapport précédent : ${result.previous_report ?? 'aucun'})`);
  for (const [key, e] of Object.entries(result.entries)) {
    const flag = { aucun: '✅', mineur: '🟡', majeur: '🟠', inconnu: '⚠️' }[e.gap];
    console.log(`  ${flag} ${key.padEnd(12)} ${String(e.declared).padEnd(12)} → ${e.stable ?? e.error}`);
  }
  console.log(`  Agents : ${result.agents_to_launch.length} — ${result.agents_to_launch.join(', ') || 'aucun'}`);
  console.log(JSON.stringify(result, null, 2));
}
