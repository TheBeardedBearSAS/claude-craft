/**
 * Migration of copy-based installations (9.x and 10.0 pre-releases) to the plugin installation.
 *
 * Commands, agents, skills, templates, checklists and hooks used to be copied into `.claude/`; they now come
 * from the bear-* plugins. This removes ONLY the files we shipped (recognised by their presence in the
 * language marketplace, in `en`, in the Dev/Project/Infra sources or in config/removed-commands.yaml), keeps
 * every other file, warns about folders that still hold user files and drops folders left empty. Hooks we
 * merged into `.claude/settings.json` are removed too.
 * @module cli/lib/migrate-legacy
 */

import fs from 'fs';
import path from 'path';
import * as yaml from 'js-yaml';
import { removeHooks } from '../../Dev/scripts/lib/merge-hooks.mjs';
import { assertSafeLang, assertSafeTarget } from './path-safety.js';

const KINDS = ['commands', 'agents', 'skills', 'templates', 'checklists', 'hooks'];

const walkFiles = (dir) => {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((d) => {
    const p = path.join(dir, d.name);
    return d.isDirectory() ? walkFiles(p) : [p];
  });
};

/** Files below any directory named `kind` in a source tree, as `kind/<relative path>`. */
function collectSourceFiles(root, kind, into) {
  if (!fs.existsSync(root)) return;
  for (const entry of fs.readdirSync(root, { withFileTypes: true })) {
    if (!entry.isDirectory() || entry.name === 'node_modules') continue;
    const p = path.join(root, entry.name);
    if (entry.name === kind) {
      for (const f of walkFiles(p)) into.add(`${kind}/${path.relative(p, f).split(path.sep).join('/')}`);
    } else {
      collectSourceFiles(p, kind, into);
    }
  }
}

/**
 * Build the set of files we ship, keyed `commands/<ns>/<file>` or `<kind>/<relative path>`.
 * @param {string} cliRoot
 * @param {string} lang
 * @returns {Set<string>}
 */
export function shippedFiles(cliRoot, lang) {
  const ours = new Set();
  const langs = [...new Set([lang, 'en'])];

  for (const l of langs) {
    const pluginsDir = path.join(cliRoot, 'marketplaces', l, 'plugins');
    if (!fs.existsSync(pluginsDir)) continue;
    for (const plugin of fs.readdirSync(pluginsDir)) {
      const ns = plugin.replace(/^bear-/, '');
      const base = path.join(pluginsDir, plugin);
      for (const f of walkFiles(path.join(base, 'commands'))) ours.add(`commands/${ns}/${path.basename(f)}`);
      for (const kind of ['agents', 'skills', 'templates', 'checklists']) {
        for (const f of walkFiles(path.join(base, kind))) {
          ours.add(`${kind}/${path.relative(path.join(base, kind), f).split(path.sep).join('/')}`);
        }
      }
    }
  }

  // Sources: files the old installers copied and plugins did not need to vendor (unreferenced checklists, …).
  const roots = [];
  for (const l of [...langs, 'base']) {
    roots.push(
      path.join(cliRoot, 'Dev', 'i18n', l),
      path.join(cliRoot, 'Infra', 'i18n', l),
      path.join(cliRoot, 'Project', 'i18n', l)
    );
  }
  for (const kind of ['agents', 'skills', 'templates', 'checklists']) {
    for (const root of roots) collectSourceFiles(root, kind, ours);
  }
  // Project templates were installed under templates/project/.
  for (const l of langs) {
    for (const f of walkFiles(path.join(cliRoot, 'Project', 'i18n', l, 'templates'))) {
      ours.add(`templates/project/${path.basename(f)}`);
    }
  }

  // Hooks: scripts, lib, memory-lifecycle and the examples copied to templates/hooks/.
  const hooksSrc = path.join(cliRoot, 'Dev', 'i18n', 'base', 'Common', 'hooks');
  for (const f of walkFiles(path.join(hooksSrc, 'scripts'))) {
    ours.add(`hooks/${path.relative(path.join(hooksSrc, 'scripts'), f).split(path.sep).join('/')}`);
  }
  for (const f of walkFiles(path.join(hooksSrc, 'templates', 'examples'))) {
    ours.add(
      `templates/hooks/${path
        .relative(path.join(hooksSrc, 'templates', 'examples'), f)
        .split(path.sep)
        .join('/')}`
    );
  }
  for (const f of walkFiles(path.join(cliRoot, 'Dev', 'scripts', 'memory-lifecycle'))) {
    ours.add(`hooks/memory-lifecycle/${path.basename(f)}`);
  }

  // Retired and scheduled commands: `<ns>/<file>` (also shipped under bear-<ns>/ in pre-releases).
  try {
    const cfg = yaml.load(fs.readFileSync(path.join(cliRoot, 'config', 'removed-commands.yaml'), 'utf8'));
    for (const rel of [...(cfg.removed ?? []), ...Object.keys(cfg.scheduled ?? {})]) ours.add(`commands/${rel}`);
  } catch {
    // no manifest: only the files found above are ours
  }
  return ours;
}

/** Commands of ours listed under both layouts: `commands/<ns>/<file>` for `<ns>/` and `bear-<ns>/`. */
const keyFor = (kind, rel) => {
  if (kind !== 'commands') return `${kind}/${rel}`;
  const [dir, ...rest] = rel.split('/');
  return `commands/${dir.replace(/^bear-/, '')}/${rest.join('/')}`;
};

/** Handlers of the default/full/memory fragments, removed from settings.json when we merged them. */
function fragmentCommands(cliRoot) {
  const dir = path.join(cliRoot, 'Dev', 'i18n', 'base', 'Common', 'hooks', 'templates');
  const commands = [];
  for (const name of ['hooks.default.json', 'hooks.full.json', 'hooks.memory.json']) {
    try {
      const fragment = JSON.parse(fs.readFileSync(path.join(dir, name), 'utf8'));
      for (const groups of Object.values(fragment.hooks ?? {})) {
        for (const g of groups) for (const h of g.hooks ?? []) if (h.command) commands.push(h.command);
      }
    } catch {
      // fragment unavailable
    }
  }
  return commands;
}

function removeEmptyDirs(dir) {
  if (!fs.existsSync(dir)) return;
  for (const d of fs.readdirSync(dir, { withFileTypes: true })) {
    if (d.isDirectory()) removeEmptyDirs(path.join(dir, d.name));
  }
  if (fs.readdirSync(dir).length === 0) fs.rmdirSync(dir);
}

/**
 * Migrate a copy-based installation.
 * @param {{target: string, lang: string, cliRoot: string, log?: (m: string) => void, warn?: (m: string) => void}} opts
 * @returns {{removed: number, kept: string[], hooksRemoved: number}}
 */
export function migrateLegacyInstall({ target, lang, cliRoot, log = () => {}, warn = () => {} }) {
  // The project and the language are validated before any read or delete (CWE-22).
  const projectRoot = assertSafeTarget(target);
  const claude = path.join(projectRoot, '.claude');
  const ours = shippedFiles(cliRoot, assertSafeLang(lang));
  let removed = 0;
  const keptByDir = new Map();

  for (const kind of KINDS) {
    const root = path.join(claude, kind);
    for (const file of walkFiles(root)) {
      const rel = path.relative(root, file).split(path.sep).join('/');
      if (kind === 'skills' && rel.startsWith('community/')) continue; // third-party skills stay
      if (ours.has(keyFor(kind, rel))) {
        fs.rmSync(file);
        removed += 1;
        continue;
      }
      const parts = rel.split('/');
      const folder = kind === 'commands' ? `${kind}/${parts[0]}` : kind;
      const name = kind === 'commands' ? parts.slice(1).join('/') : rel;
      keptByDir.set(folder, [...(keptByDir.get(folder) ?? []), name]);
    }
    removeEmptyDirs(root);
  }

  const kept = [];
  for (const [folder, names] of keptByDir) {
    kept.push(...names.map((n) => `${folder}/${n}`));
    const moved = folder.startsWith('commands/')
      ? `/bear-${folder.split('/')[1].replace(/^bear-/, '')}:*`
      : `the bear-* plugins (${folder}/)`;
    warn(`.claude/${folder}/ kept for your files (${names.join(', ')}): our files moved to ${moved}`);
  }

  // Hooks merged into settings.json by the copy-based installer.
  let hooksRemoved = 0;
  const settingsFile = path.join(claude, 'settings.json');
  if (fs.existsSync(settingsFile)) {
    try {
      let settings = JSON.parse(fs.readFileSync(settingsFile, 'utf8'));
      if (settings.hooks) {
        for (const command of fragmentCommands(cliRoot)) {
          const res = removeHooks(settings, command);
          settings = res.settings ?? res;
          hooksRemoved += res.removed ?? 0;
        }
        if (Object.keys(settings.hooks ?? {}).length === 0) delete settings.hooks;
        fs.writeFileSync(settingsFile, `${JSON.stringify(settings, null, 2)}\n`);
      }
    } catch {
      warn('.claude/settings.json could not be parsed: merged hooks were left untouched');
    }
  }

  if (removed > 0 || hooksRemoved > 0) {
    log(
      `migrated to plugins: ${removed} copied file(s) removed${hooksRemoved ? `, ${hooksRemoved} merged hook(s) removed` : ''}`
    );
  }
  return { removed, kept, hooksRemoved };
}
