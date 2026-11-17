/**
 * Plugin-based installation: bear-craft installs its Claude Code plugins in project scope
 * (marketplace copied into <project>/.bear-craft/marketplace/) instead of copying commands,
 * agents and skills. Every function takes an injectable `execFn` so tests never run the real
 * `claude` binary.
 * @module cli/lib/plugin-install
 */

import fs from 'fs';
import path from 'path';
import { spawnSync } from 'child_process';
import { randomUUID } from 'crypto';
import { MIN_CLAUDE_CODE, assessClaude } from './claude-code.js';
import { assertSafeLang, assertSafeTarget } from './path-safety.js';

/** Infra namespaces published as plugins (bear-<name>). */
export const INFRA_PLUGINS = [
  'docker',
  'coolify',
  'kubernetes',
  'opentofu',
  'ansible',
  'hcloud',
  'pgbouncer',
  'frankenphp',
];

/** Plugins every installation gets (command namespaces). */
export const CORE_PLUGINS = ['common', 'workflow', 'team', 'qa', 'uiux', 'gate', 'project'];

export const BEAR_DIR = '.bear-craft';
export const MARKETPLACE_REL = './.bear-craft/marketplace';

/** Marketplace name per language: `bear-craft` (en), `bear-craft-fr`, … */
export const marketplaceName = (lang) => (lang === 'en' || !lang ? 'bear-craft' : `bear-craft-${lang}`);

/**
 * Unique marketplace id of a project: `bear-craft-<8 hex>`. Claude Code keeps ONE registry of marketplaces per
 * machine keyed by name, so two projects sharing a name would load each other's plugins.
 */
export const newMarketplaceId = () => `bear-craft-${randomUUID().replace(/-/g, '').slice(0, 8)}`;

/**
 * Marketplace name recorded for a project; installations made before the unique id used the generic
 * `bear-craft` / `bear-craft-<lang>` name.
 * @param {{marketplace?: string, lang?: string}} record
 */
export const marketplaceOf = (record) => record.marketplace ?? marketplaceName(record.lang);

/** Error whose message tells the user what to do; the CLI prints it and exits non-zero. */
export class PluginInstallError extends Error {}

/**
 * Path below the project directory. The project is validated first (`assertSafeTarget` refuses system
 * directories) and the joined path must stay inside it (CWE-22).
 * @param {string} target - project directory
 * @param {...string} segments
 * @returns {string}
 */
export function inProject(target, ...segments) {
  const root = assertSafeTarget(target);
  const resolved = path.resolve(root, ...segments);
  if (resolved !== root && !resolved.startsWith(root + path.sep)) {
    throw new PluginInstallError(`Refusing a path outside the project: ${segments.join('/')}`);
  }
  return resolved;
}

/**
 * Default executor: run a program without a shell.
 * @param {string} cmd
 * @param {string[]} args
 * @param {{cwd?: string}} [opts]
 * @returns {{status: number|null, stdout: string, stderr: string}}
 */
export function defaultExec(cmd, args, opts = {}) {
  const r = spawnSync(cmd, args, { encoding: 'utf8', cwd: opts.cwd, timeout: 180_000, stdio: 'pipe' });
  if (r.error) return { status: null, stdout: '', stderr: r.error.message };
  return { status: r.status, stdout: r.stdout ?? '', stderr: r.stderr ?? '' };
}

/**
 * Normalise `--hooks` ("default", "full,memory", "none") into plugin names.
 * @param {string|undefined} hooks
 * @returns {{profile: 'default'|'full'|'none', memory: boolean}}
 */
export function parseHooks(hooks) {
  const parts = String(hooks ?? 'default').split(',');
  const profile = parts.find((p) => ['default', 'full', 'none'].includes(p)) ?? 'default';
  return { profile, memory: parts.includes('memory') };
}

export function hookPlugins({ profile, memory }) {
  const out = [];
  if (profile === 'default' || profile === 'full') out.push('hooks');
  if (profile === 'full') out.push('hooks-full');
  if (memory) out.push('hooks-memory');
  return out;
}

/**
 * Infra namespaces to install from the installation config: explicit list, else docker when the legacy
 * `includeInfra` boolean is set.
 * @param {{infra?: string[], includeInfra?: boolean}} config
 * @returns {string[]}
 */
export function resolveInfra(config) {
  const wanted =
    Array.isArray(config.infra) && config.infra.length > 0 ? config.infra : config.includeInfra ? ['docker'] : [];
  return [...new Set(wanted.filter((n) => INFRA_PLUGINS.includes(n)))];
}

/**
 * Plugin names (without the `bear-` prefix) for an installation.
 * @param {{techs: string[], infra: string[], hooks: {profile: string, memory: boolean}}} install
 * @returns {string[]}
 */
export function planPlugins({ techs, infra, hooks }) {
  return [...new Set([...CORE_PLUGINS, ...techs, ...infra, ...hookPlugins(hooks)])];
}

/**
 * Check that `claude` is installed and recent enough.
 * @param {{execFn?: typeof defaultExec, minimum?: string}} [deps]
 * @returns {string} the detected version
 * @throws {PluginInstallError} no fallback: bear-craft installs through Claude Code
 */
export function ensureClaude(deps = {}) {
  const run = deps.execFn ?? defaultExec;
  const minimum = deps.minimum ?? MIN_CLAUDE_CODE;
  const r = run('claude', ['--version']);
  const info = assessClaude(r.status === 0 ? r.stdout.trim() : null, minimum);
  if (!info.found) {
    throw new PluginInstallError(
      [
        'Claude Code (the `claude` command) was not found in your PATH.',
        'bear-craft installs its commands, agents, skills and hooks as Claude Code plugins, so it needs it.',
        '  1. Install it:   npm install -g @anthropic-ai/claude-code',
        '  2. Check it:     claude --version',
        '  3. Re-run:       bear-craft install <path>',
      ].join('\n')
    );
  }
  if (info.tooOld) {
    throw new PluginInstallError(
      [
        `Claude Code ${info.version} is older than the minimum supported version (${minimum}).`,
        '  1. Upgrade it:   npm install -g @anthropic-ai/claude-code@latest',
        '  2. Re-run:       bear-craft install <path>',
      ].join('\n')
    );
  }
  return info.version ?? info.raw;
}

/**
 * Copy marketplaces/<lang>/ of the package to <target>/.bear-craft/marketplace/ (replacing a previous copy).
 * @returns {string} destination directory
 */
export function copyMarketplace(cliRoot, lang, target, marketplace) {
  const src = path.join(cliRoot, 'marketplaces', assertSafeLang(lang));
  if (!fs.existsSync(path.join(src, '.claude-plugin', 'marketplace.json'))) {
    throw new PluginInstallError(`No marketplace for language "${lang}" in this package (${src}).`);
  }
  const dest = inProject(target, BEAR_DIR, 'marketplace');
  fs.rmSync(dest, { recursive: true, force: true });
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.cpSync(src, dest, { recursive: true });
  if (marketplace) {
    // Only the project copy is renamed: the sources of the package (and the GitHub marketplace) keep `bear-craft`.
    const file = path.join(dest, '.claude-plugin', 'marketplace.json');
    const manifest = JSON.parse(fs.readFileSync(file, 'utf8'));
    manifest.name = marketplace;
    fs.writeFileSync(file, `${JSON.stringify(manifest, null, 2)}\n`);
  }
  return dest;
}

const readJson = (file, fallback) => {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    return fallback;
  }
};

/**
 * `claude` writes an absolute path for a directory marketplace; make it relative so the project can be
 * moved or cloned. Every other key of settings.json is preserved.
 * @returns {boolean} whether the file was rewritten
 */
export function rewriteMarketplacePath(target, mktName) {
  const file = inProject(target, '.claude', 'settings.json');
  const settings = readJson(file, null);
  const entry = settings?.extraKnownMarketplaces?.[mktName];
  if (!entry?.source) return false;
  if (entry.source.source === 'directory' && entry.source.path === MARKETPLACE_REL) return false;
  entry.source = { ...entry.source, source: 'directory', path: MARKETPLACE_REL };
  fs.writeFileSync(file, `${JSON.stringify(settings, null, 2)}\n`);
  return true;
}

export const installJsonPath = (target) => inProject(target, BEAR_DIR, 'install.json');
export const readInstallJson = (target) => readJson(installJsonPath(target), null);

export function writeInstallJson(target, data) {
  fs.mkdirSync(inProject(target, BEAR_DIR), { recursive: true });
  fs.writeFileSync(installJsonPath(target), `${JSON.stringify(data, null, 2)}\n`);
}

/** Install record: what `update` and `sync` replay. */
export function buildInstallRecord({ lang, techs, infra, hooks, marketplace, version }) {
  return { lang, techs: [...techs], infra: [...infra], hooks: { ...hooks }, marketplace, version };
}

const claudeFailure = (what, r) =>
  new PluginInstallError(
    `\`claude ${what}\` failed (exit ${r.status}): ${(r.stderr || r.stdout).trim().split('\n').slice(-3).join(' ')}`
  );

/**
 * Register the project marketplace and install the plugins (project scope). Idempotent: an already
 * installed plugin answers "already installed" with exit code 0.
 * @param {string} target - project directory
 * @param {{lang: string, techs: string[], infra: string[], hooks: {profile: string, memory: boolean}}} install
 * @param {{execFn?: typeof defaultExec, log?: (msg: string) => void}} [deps]
 * @returns {string[]} installed plugin identifiers
 */
export function registerAndInstall(target, install, deps = {}) {
  const run = deps.execFn ?? defaultExec;
  const log = deps.log ?? (() => {});
  const mkt = marketplaceOf(install);

  const add = run('claude', ['plugin', 'marketplace', 'add', MARKETPLACE_REL, '--scope', 'project'], { cwd: target });
  if (add.status !== 0) throw claudeFailure('plugin marketplace add', add);
  if (rewriteMarketplacePath(target, mkt)) log(`marketplace path rewritten to ${MARKETPLACE_REL}`);

  const ids = [];
  for (const ns of planPlugins(install)) {
    const id = `bear-${ns}@${mkt}`;
    const r = run('claude', ['plugin', 'install', id, '--scope', 'project', '-y'], { cwd: target });
    if (r.status !== 0) throw claudeFailure(`plugin install ${id}`, r);
    ids.push(id);
    log(`plugin ${id}`);
  }
  return ids;
}

/**
 * Drop the generic-name entries (`bear-craft`, `bear-craft-<lang>`) of an installation made before projects got
 * a unique marketplace id: uninstall their plugins at project scope, then remove the settings.json entries.
 * Every other key is preserved.
 */
function migrateGenericMarketplace(target, legacyName, run, log) {
  const file = inProject(target, '.claude', 'settings.json');
  const settings = readJson(file, null);
  if (!settings) return;
  const suffix = `@${legacyName}`;
  const old = Object.keys(settings.enabledPlugins ?? {}).filter((id) => id.endsWith(suffix));
  for (const id of old) run('claude', ['plugin', 'uninstall', id, '--scope', 'project', '-y'], { cwd: target });
  // `claude` may have rewritten the file while uninstalling: read it again
  const fresh = readJson(file, settings);
  for (const id of Object.keys(fresh.enabledPlugins ?? {})) if (id.endsWith(suffix)) delete fresh.enabledPlugins[id];
  if (fresh.extraKnownMarketplaces) delete fresh.extraKnownMarketplaces[legacyName];
  fs.writeFileSync(file, `${JSON.stringify(fresh, null, 2)}\n`);
  log(`migrated from the generic marketplace ${legacyName}`);
}

/**
 * Full plugin installation: claude check, marketplace copy, registration, plugins, install.json.
 * The marketplace id is generated on the first installation and then reused (committed `enabledPlugins` depend on it).
 * @returns {{ids: string[], claudeVersion: string, marketplace: string}}
 */
export function installPlugins({ target, cliRoot, install, version }, deps = {}) {
  const run = deps.execFn ?? defaultExec;
  const log = deps.log ?? (() => {});
  const claudeVersion = ensureClaude(deps);
  const previous = readInstallJson(target);
  const marketplace = install.marketplace ?? previous?.marketplace ?? newMarketplaceId();
  copyMarketplace(cliRoot, install.lang, target, marketplace);
  fs.writeFileSync(inProject(target, BEAR_DIR, 'VERSION'), `${version}\n`);
  if (previous && !previous.marketplace) migrateGenericMarketplace(target, marketplaceName(previous.lang), run, log);
  const ids = registerAndInstall(target, { ...install, marketplace }, deps);
  writeInstallJson(target, buildInstallRecord({ ...install, marketplace, version }));
  return { ids, claudeVersion, marketplace };
}

/**
 * `bear-craft sync`: replay install.json (marketplace add, relative path, installs) without touching rules.
 * @throws {PluginInstallError} when there is no install.json or no marketplace copy
 */
export function syncPlugins(target, deps = {}) {
  const record = readInstallJson(target);
  if (!record) {
    throw new PluginInstallError(
      `No ${BEAR_DIR}/install.json in ${target}: run \`bear-craft install\` (or \`update\`) first.`
    );
  }
  if (!fs.existsSync(inProject(target, BEAR_DIR, 'marketplace', '.claude-plugin', 'marketplace.json'))) {
    throw new PluginInstallError(
      `${BEAR_DIR}/marketplace is missing in ${target}: run \`bear-craft update\` to restore it.`
    );
  }
  const claudeVersion = ensureClaude(deps);
  const ids = registerAndInstall(target, record, deps);
  return { ids, claudeVersion, record, marketplace: marketplaceOf(record) };
}

/**
 * Diagnose a project's plugin setup (used by `doctor`).
 * @returns {{level: 'ok'|'warn'|'fail', message: string}[]}
 */
export function diagnosePlugins(target, deps = {}) {
  const run = deps.execFn ?? defaultExec;
  const out = [];
  const record = readInstallJson(target);
  if (!record) return out;

  const mkt = marketplaceOf(record);
  const hasMarketplace = fs.existsSync(
    inProject(target, BEAR_DIR, 'marketplace', '.claude-plugin', 'marketplace.json')
  );
  out.push(
    hasMarketplace
      ? { level: 'ok', message: `${BEAR_DIR}/marketplace present (${mkt})` }
      : { level: 'fail', message: `${BEAR_DIR}/marketplace missing — run bear-craft update` }
  );

  const settings = readJson(inProject(target, '.claude', 'settings.json'), {});
  const declared = settings.extraKnownMarketplaces?.[mkt];
  if (!declared) {
    out.push({
      level: 'fail',
      message: `marketplace ${mkt} not declared in .claude/settings.json — run bear-craft sync`,
    });
  } else if (declared.source?.path !== MARKETPLACE_REL) {
    out.push({
      level: 'warn',
      message: `marketplace path is "${declared.source?.path ?? declared.source?.url}" (expected ${MARKETPLACE_REL}) — run bear-craft sync`,
    });
  } else {
    out.push({ level: 'ok', message: `marketplace ${mkt} declared with a relative path` });
  }

  const enabled = settings.enabledPlugins ?? {};
  const missing = planPlugins(record)
    .map((ns) => `bear-${ns}@${mkt}`)
    .filter((id) => enabled[id] !== true);
  out.push(
    missing.length === 0
      ? { level: 'ok', message: `${planPlugins(record).length} plugins enabled as recorded in install.json` }
      : { level: 'fail', message: `plugins not enabled: ${missing.join(', ')} — run bear-craft sync` }
  );

  const list = run('claude', ['plugin', 'marketplace', 'list', '--json']);
  if (list.status === 0) {
    const known = parseJsonSafe(list.stdout);
    const entry = (known ?? []).find((m) => m.name === mkt);
    const expected = inProject(target, BEAR_DIR, 'marketplace');
    if (!entry) {
      out.push({
        level: 'warn',
        message: `marketplace ${mkt} is not registered on this machine — run bear-craft sync`,
      });
    } else if (entry.source === 'directory' && path.resolve(entry.path ?? '') !== expected) {
      out.push({
        level: 'warn',
        message: `marketplace ${mkt} is registered for another path (${entry.path}) — run bear-craft sync`,
      });
    } else {
      out.push({ level: 'ok', message: `marketplace ${mkt} registered on this machine` });
    }
  }
  return out;
}

function parseJsonSafe(text) {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

/**
 * Enabled bear-* plugins of a project and their content, read from `enabledPlugins` and from the marketplace
 * copy in `.bear-craft/marketplace/plugins/` (used by `list` and `check`).
 * @param {string} target
 * @returns {{record: object, marketplace: string, plugins: {id: string, name: string, commands: number, agents: number, skills: number}[]}|null}
 */
export function readPluginState(target) {
  const record = readInstallJson(target);
  if (!record) return null;
  const mkt = marketplaceOf(record);
  const settings = readJson(inProject(target, '.claude', 'settings.json'), {});
  const countDir = (dir, test) => {
    try {
      return fs.readdirSync(dir, { withFileTypes: true }).filter(test).length;
    } catch {
      return 0;
    }
  };
  const plugins = Object.entries(settings.enabledPlugins ?? {})
    .filter(([id, on]) => on === true && id.endsWith(`@${mkt}`) && /^bear-[a-z0-9-]+@/.test(id))
    .map(([id]) => {
      const name = id.slice(0, id.lastIndexOf('@'));
      const dir = inProject(target, BEAR_DIR, 'marketplace', 'plugins', name);
      return {
        id,
        name,
        commands: countDir(path.join(dir, 'commands'), (d) => d.isFile() && d.name.endsWith('.md')),
        agents: countDir(path.join(dir, 'agents'), (d) => d.isFile() && d.name.endsWith('.md')),
        skills: countDir(path.join(dir, 'skills'), (d) => d.isDirectory()),
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name));
  return { record, marketplace: mkt, plugins };
}
