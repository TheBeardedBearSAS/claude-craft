#!/usr/bin/env node
/**
 * generate-plugins.mjs — génère `plugins/bear-<namespace>/` : un plugin Claude Code par
 * namespace de commandes du CLI (common, workflow, team, qa, uiux, gate, project) et
 * par stack du registre (react, symfony, …).
 *
 * Le contenu vient des VRAIS installeurs (Dev/scripts/install-*-rules.sh,
 * Project/install-project-commands.sh) exécutés dans un projet temporaire ; leur
 * `.claude/` est remodelé au format plugin :
 *   - commands/<ns>/*.md   → plugins/bear-<ns>/commands/ (stubs dépréciés exclus)
 *   - agents, skills       → plugin qui les possède (delta stack vs common)
 *   - rules/references/templates/checklists → uniquement les fichiers référencés
 *     (résolution transitive, vendoring dans le plugin qui les cite)
 *   - `.claude/<dir>/x` → `${CLAUDE_PLUGIN_ROOT}/<dir>/x`
 *   - hooks : uniquement dans `common`
 *
 * Usage :
 *   node scripts/generate-plugins.mjs [--out plugins] [--report fichier.json]
 *   node scripts/generate-plugins.mjs --check [--out plugins]   (dérive ⇒ code ≠ 0)
 *
 * Déterministe (ordre trié, aucun horodatage). Vide sa sortie avant de générer.
 * Met aussi à jour la liste `plugins` de .claude-plugin/marketplace.json.
 */
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import * as yaml from 'js-yaml';
import { TECH_REGISTRY } from '../cli/lib/tech-registry.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const MARKETPLACE = path.join(ROOT, '.claude-plugin', 'marketplace.json');
const ICON_SRC = path.join(ROOT, 'Tools', 'PluginExport', 'icon.png');
const HOOKS_SRC = path.join(ROOT, 'Dev', 'i18n', 'base', 'Common', 'hooks');
const REPO_URL = 'https://github.com/TheBeardedBearSAS/bear-craft';
const AUTHOR = { name: 'The Bearded Bear', url: 'https://the-bearded-bear.com' };

/** Nom publié d'un plugin : préfixe `bear-` pour éviter les conflits avec les commandes du projet ou d'autres plugins. */
const pluginName = (ns) => `bear-${ns}`;

const REF_DIRS = ['rules', 'references', 'templates', 'checklists', 'skills', 'agents'];

/** Namespaces de commandes qui ne sont pas des stacks. */
const FIXED_PLUGINS = {
  common: 'Shared agents, skills, rules, checklists and token/CI/ADR utilities, plus the optional safety hooks.',
  workflow: 'BMAD v6 sprint workflow: init, plan, design, start, implement, review, retro and status.',
  team: 'Parallel multi-agent teams: audit, security review and sprint delivery.',
  qa: 'Browser acceptance testing (QA Recette) with regression registry and TDD bug fixing.',
  uiux: 'UI/UX/accessibility audits, component specs, design tokens, user flows and DESIGN.md.',
  gate: 'Quality gates: PRD, tech spec, backlog, sprint, story, alignment, commit, merge and release.',
  project:
    'Project management: epics, stories, tasks, backlog and sprint tracking with product-owner and tech-lead agents.',
};

const DISPLAY = {
  common: 'Common',
  workflow: 'Workflow',
  team: 'Team',
  qa: 'QA',
  uiux: 'UI/UX',
  gate: 'Gates',
  project: 'Project',
};

// --- Utilitaires fichiers -----------------------------------------------------

const walk = (dir, base = dir) =>
  fs.existsSync(dir)
    ? fs
        .readdirSync(dir, { withFileTypes: true })
        .sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0))
        .flatMap((d) => {
          const p = path.join(dir, d.name);
          return d.isDirectory() ? walk(p, base) : [path.relative(base, p).split(path.sep).join('/')];
        })
    : [];

const isText = (buf) => !buf.includes(0);
const exec = (file) => (fs.statSync(file).mode & 0o111) !== 0;
const sortedKeys = (m) => [...m.keys()].sort();

// --- Contexte ----------------------------------------------------------------------

function loadContext() {
  const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
  const versions = yaml.load(fs.readFileSync(path.join(ROOT, 'config/versions.yaml'), 'utf8'));
  const removedCfg = yaml.load(fs.readFileSync(path.join(ROOT, 'config/removed-commands.yaml'), 'utf8'));
  const listed = new Set([...(removedCfg.removed ?? []), ...Object.keys(removedCfg.scheduled ?? {})]);
  return { version: pkg.version, minimum: versions.claudeCode.minimum, listed };
}

// --- Exécution des installeurs ---------------------------------------------------

function runInstaller(script, args, dir) {
  fs.mkdirSync(dir, { recursive: true });
  const r = spawnSync('bash', [path.join(ROOT, script), '--lang=en', ...args, dir], {
    cwd: ROOT,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  if (r.status !== 0) {
    throw new Error(
      `${script} a échoué (code ${r.status}) :\n${(r.stderr || r.stdout).split('\n').slice(-12).join('\n')}`
    );
  }
}

/** Index `.claude/` d'un projet installé : chemin relatif (sans `.claude/`) → chemin absolu. */
function indexClaude(dir) {
  const base = path.join(dir, '.claude');
  const files = new Map();
  for (const rel of walk(base)) files.set(rel, path.join(base, rel));
  return { base, files };
}

function installAll(work, techs) {
  const installs = {};
  const jobs = [
    ['common', 'Dev/scripts/install-common-rules.sh', ['--hooks=none', '--force']],
    ['project', 'Project/install-project-commands.sh', ['--skip-common', '--force']],
    ...techs.map((t) => [t, `Dev/scripts/${TECH_REGISTRY[t].installScript}`, ['--force']]),
  ];
  for (const [name, script, args] of jobs) {
    const dir = path.join(work, `install-${name}`);
    runInstaller(script, args, dir);
    installs[name] = indexClaude(dir);
  }
  return installs;
}

// --- Plugins : composants possédés -------------------------------------------------

const frontmatter = (text) => /^---\n([\s\S]*?)\n---/.exec(text)?.[1] ?? '';
const isDeprecated = (text) => /^deprecated:\s*true\s*$/m.test(frontmatter(text));

function skillNames(install) {
  return new Set([...install.files.keys()].filter((f) => f.startsWith('skills/')).map((f) => f.split('/')[1]));
}
function agentFiles(install) {
  return [...install.files.keys()].filter((f) => /^agents\/[^/]+\.md$/.test(f));
}

/**
 * Pour chaque plugin : { commands: Map<nom, absPath>, agents: Map<relPath, abs>, skills: Map<relPath, abs> }
 * Commandes : par namespace, toutes installations confondues. Agents et skills : la
 * totalité de `common`, le delta stack − common pour les autres.
 */
function collectOwned(installs, pluginNames, ctx) {
  const common = installs.common;
  const commonSkills = skillNames(common);
  const commonAgents = new Set(agentFiles(common));
  const owned = new Map(pluginNames.map((n) => [n, { commands: new Map(), agents: new Map(), skills: new Map() }]));

  for (const [source, install] of Object.entries(installs)) {
    for (const [rel, abs] of install.files) {
      const cm = /^commands\/([^/]+)\/([^/]+)$/.exec(rel);
      if (cm) {
        const [, ns, file] = cm;
        if (!owned.has(ns) || !file.endsWith('.md')) continue;
        const text = fs.readFileSync(abs, 'utf8');
        if (isDeprecated(text) || ctx.listed.has(`${ns}/${file}`)) continue;
        const prev = owned.get(ns).commands.get(file);
        if (prev && fs.readFileSync(prev, 'utf8') !== text) {
          throw new Error(`Commande ${ns}/${file} différente selon les installeurs (${source})`);
        }
        owned.get(ns).commands.set(file, abs);
      }
    }
    // Agents/skills : plugin du même nom que l'installation (common, project, stack)
    if (!owned.has(source)) continue;
    const mine = owned.get(source);
    for (const rel of agentFiles(install)) {
      if (source === 'common' || !commonAgents.has(rel)) mine.agents.set(rel, install.files.get(rel));
    }
    for (const [rel, abs] of install.files) {
      if (!rel.startsWith('skills/')) continue;
      const skill = rel.split('/')[1];
      if (source === 'common' || !commonSkills.has(skill)) mine.skills.set(rel, abs);
    }
  }
  return owned;
}

// --- Réécriture des références -----------------------------------------------------

const REF_RE = new RegExp(
  String.raw`(?<![\w~$}-])(?<![\w}]\/)(@?)\.claude\/(${REF_DIRS.join('|')}|commands)\/([A-Za-z0-9_./-]*)`,
  'g'
);

/** Dossiers de recherche d'un plugin : sa propre installation, ses couches de base, puis common et project. */
function universeFor(name, installs) {
  const base = Object.entries(TECH_REGISTRY)
    .filter(([k, e]) => e.baseLayer && (e.baseLayerFor ?? []).includes(name) && installs[k])
    .map(([k]) => installs[k]);
  return [installs[name], ...base, installs.common, installs.project]
    .filter(Boolean)
    .filter((v, i, a) => a.indexOf(v) === i);
}

/**
 * `/<ns>:<cmd>` → `/bear-<ns>:<cmd>` pour tout namespace dont un plugin est généré. Uniquement après un début de
 * ligne, un espace ou l'un des caractères ` ' " ( [ | > (jamais dans une URL ou un chemin).
 */
function prefixSlash(text, stats) {
  const re = new RegExp(String.raw`(^|[\s\`'"(\[|>])/(${[...stats.namespaces].join('|')}):(?=[A-Za-z])`, 'gm');
  return text.replace(re, (_m, before, ns) => {
    stats.slashRewritten += 1;
    return `${before}/${pluginName(ns)}:`;
  });
}

function buildPlugin(name, owned, installs, ctx, unresolved, stats) {
  const files = new Map(); // chemin plugin → { data: Buffer, mode: 'x'|'' }
  const universe = universeFor(name, installs);
  const queue = [];

  // 1. installation du plugin, ses couches de base, common, project ; 2. à défaut, les autres installeurs,
  //    à condition que le fichier soit identique partout où il existe (sinon ambigu : non résolu).
  const lookup = (rel) => {
    for (const u of universe) if (u.files.has(rel)) return { abs: u.files.get(rel) };
    const others = Object.values(installs)
      .filter((i) => i.files.has(rel))
      .map((i) => i.files.get(rel));
    if (others.length === 0) return null;
    const first = fs.readFileSync(others[0]);
    return others.every((o) => fs.readFileSync(o).equals(first)) ? { abs: others[0] } : { ambiguous: true };
  };
  const isDir = (rel) => Object.values(installs).some((u) => [...u.files.keys()].some((f) => f.startsWith(`${rel}/`)));

  const put = (pluginPath, abs) => {
    if (files.has(pluginPath)) return false;
    files.set(pluginPath, { data: fs.readFileSync(abs), mode: exec(abs) ? 'x' : '', abs, from: pluginPath });
    queue.push(pluginPath);
    return true;
  };

  const ownCommands = owned.commands;
  for (const [file, abs] of ownCommands) put(`commands/${file}`, abs);
  for (const [rel, abs] of owned.agents) put(rel, abs);
  for (const [rel, abs] of owned.skills) put(rel, abs);

  const rewrite = (text, from) =>
    text.replace(REF_RE, (match, at, dir, rest, offset, whole) => {
      const next = whole[offset + match.length];
      const trimmed = rest.replace(/[./-]+$/, '');
      const tail = rest.slice(trimmed.length);
      const report = (cause) => unresolved.push({ plugin: name, from, ref: `.claude/${dir}/${rest}`, cause });
      if (next && /[{*<$[]/.test(next)) return (report('placeholder'), match);
      if (!trimmed) return (report('directory'), match);
      const rel = `${dir}/${trimmed}`;

      if (dir === 'commands') {
        const [ns, file] = trimmed.split('/');
        if (ns === name && file && ownCommands.has(file)) return `\${CLAUDE_PLUGIN_ROOT}/commands/${file}${tail}`;
        return (report('command-outside-plugin'), match);
      }
      // project-context.md est généré dans le projet de l'utilisateur (nom du projet, stack) : ce n'est pas une référence du plugin.
      if (/(^|\/)project-context\.md$/.test(rel)) return (report('project-artifact'), match);
      const found = lookup(rel);
      if (found?.ambiguous) return (report('ambiguous'), match);
      if (!found) return (report(isDir(rel) || tail.endsWith('/') ? 'directory' : 'missing'), match);
      put(rel, found.abs);
      return `\${CLAUDE_PLUGIN_ROOT}/${rel}${tail}`;
    });

  while (queue.length > 0) {
    const p = queue.shift();
    const entry = files.get(p);
    if (!isText(entry.data) || !/\.(md|json|ya?ml|txt|template)$/.test(p)) continue;
    entry.data = Buffer.from(prefixSlash(rewrite(entry.data.toString('utf8'), p), stats), 'utf8');
  }
  return files;
}

// --- Hooks (plugin common) -----------------------------------------------------------

function addHooks(files) {
  const scriptsDir = path.join(HOOKS_SRC, 'scripts');
  for (const rel of walk(scriptsDir)) {
    const abs = path.join(scriptsDir, rel);
    files.set(`hooks/scripts/${rel}`, { data: fs.readFileSync(abs), mode: exec(abs) ? 'x' : '' });
  }
  const template = JSON.parse(fs.readFileSync(path.join(HOOKS_SRC, 'templates', 'hooks.default.json'), 'utf8'));
  const convert = (v) =>
    typeof v === 'string'
      ? v.replaceAll('$CLAUDE_PROJECT_DIR/.claude/hooks/', '${CLAUDE_PLUGIN_ROOT}/hooks/scripts/')
      : Array.isArray(v)
        ? v.map(convert)
        : v && typeof v === 'object'
          ? Object.fromEntries(Object.entries(v).map(([k, x]) => [k, convert(x)]))
          : v;
  files.set('hooks/hooks.json', { data: Buffer.from(`${JSON.stringify(convert(template), null, 2)}\n`), mode: '' });
}

// --- Manifestes et README -----------------------------------------------------------

function describe(name) {
  const entry = TECH_REGISTRY[name];
  if (FIXED_PLUGINS[name]) return { display: DISPLAY[name], description: FIXED_PLUGINS[name] };
  return {
    display: entry.displayName,
    description: `${entry.displayName} ${entry.version}: ${entry.desc}. Audit and generation commands, reviewer agent and stack skills.`,
  };
}

function keywordsFor(name) {
  const stack = name === 'reactnative' ? 'react-native' : name;
  const base = ['bear-craft', 'claude-code'];
  return TECH_REGISTRY[name] ? [...base, stack] : [...base, name];
}

function manifestFor(name, ctx) {
  const { display, description } = describe(name);
  return {
    name: pluginName(name),
    displayName: `Bear Craft — ${display}`,
    description,
    version: ctx.version,
    author: AUTHOR,
    repository: REPO_URL,
    homepage: REPO_URL,
    license: 'MIT',
    engines: { 'claude-code': `>=${ctx.minimum}` },
    keywords: keywordsFor(name),
  };
}

const descriptionOf = (abs) =>
  /^description:\s*(.*)$/m.exec(frontmatter(fs.readFileSync(abs, 'utf8')))?.[1]?.replace(/^["']|["']$/g, '') ?? '';

function readmeFor(name, owned, files, ctx) {
  const { display, description } = describe(name);
  const lines = [`# Bear Craft — ${display}`, '', description, ''];
  lines.push(
    '## Installation',
    '',
    'Inside Claude Code:',
    '',
    '```',
    '/plugin marketplace add TheBeardedBearSAS/bear-craft',
    `/plugin install ${pluginName(name)}@bear-craft`,
    '```',
    ''
  );
  lines.push(`Requires Claude Code ${ctx.minimum} or later. Version ${ctx.version}.`, '');
  const cmds = [...owned.commands.keys()].sort();
  if (cmds.length > 0) {
    lines.push('## Commands', '');
    for (const c of cmds)
      lines.push(`- \`/${pluginName(name)}:${c.replace(/\.md$/, '')}\` — ${descriptionOf(owned.commands.get(c))}`.trimEnd());
    lines.push('');
  }
  const agents = [...owned.agents.keys()].map((a) => a.replace(/^agents\/|\.md$/g, '')).sort();
  if (agents.length > 0) lines.push('## Agents', '', agents.map((a) => `\`${a}\``).join(', '), '');
  const skills = [...new Set([...owned.skills.keys()].map((s) => s.split('/')[1]))].sort();
  if (skills.length > 0) lines.push('## Skills', '', skills.map((s) => `\`${s}\``).join(', '), '');
  if (name === 'common') {
    lines.push(
      '## Hooks',
      '',
      'This plugin ships the default safety hooks (network guard, dangerous-command blocker, sensitive-file protection, output hint).',
      '',
      '**Pick a single channel**: either this plugin or the CLI installation with hooks (`bear-craft install --hooks=default`). Using both runs every guard twice.',
      ''
    );
  }
  lines.push(
    '## About',
    '',
    'Part of [Bear Craft](' +
      REPO_URL +
      ') by The Bearded Bear. Each plugin is generated from the framework installers (`npm run plugins:generate`); do not edit it by hand.',
    '',
    'License: MIT. Author: The Bearded Bear.',
    ''
  );
  return lines.join('\n');
}

// --- Orchestration -----------------------------------------------------------------

function generate(work, ctx) {
  const techs = Object.keys(TECH_REGISTRY)
    .filter(
      (k) =>
        TECH_REGISTRY[k].tier !== null && fs.existsSync(path.join(ROOT, 'Dev/scripts', TECH_REGISTRY[k].installScript))
    )
    .sort();
  const installs = installAll(work, techs);

  const namespaces = new Set();
  for (const install of Object.values(installs)) {
    for (const rel of install.files.keys()) {
      const m = /^commands\/([^/]+)\/[^/]+\.md$/.exec(rel);
      if (m) namespaces.add(m[1]);
    }
  }
  const names = [
    ...new Set([
      'common',
      ...Object.keys(FIXED_PLUGINS),
      ...techs,
      ...[...namespaces].filter((n) => FIXED_PLUGINS[n] || techs.includes(n)),
    ]),
  ].sort();

  const owned = collectOwned(installs, names, ctx);
  const unresolved = [];
  const stats = { slashRewritten: 0, namespaces: new Set(names) };
  const result = new Map(); // nom → Map(chemin → entry)
  for (const name of names) {
    const files = buildPlugin(name, owned.get(name), installs, ctx, unresolved, stats);
    if (name === 'common') addHooks(files);
    files.set('.claude-plugin/plugin.json', {
      data: Buffer.from(`${JSON.stringify(manifestFor(name, ctx), null, 2)}\n`),
      mode: '',
    });
    files.set('.claude-plugin/icon.png', { data: fs.readFileSync(ICON_SRC), mode: '' });
    files.set('LICENSE', { data: fs.readFileSync(path.join(ROOT, 'LICENSE')), mode: '' });
    files.set('README.md', { data: Buffer.from(prefixSlash(readmeFor(name, owned.get(name), files, ctx), stats)), mode: '' });
    result.set(name, files);
  }
  return { result, unresolved, owned, stats };
}

function writeTree(result, out) {
  fs.rmSync(out, { recursive: true, force: true });
  for (const name of sortedKeys(result)) {
    const files = result.get(name);
    for (const rel of sortedKeys(files)) {
      const dest = path.join(out, pluginName(name), rel);
      fs.mkdirSync(path.dirname(dest), { recursive: true });
      fs.writeFileSync(dest, files.get(rel).data);
      fs.chmodSync(dest, files.get(rel).mode === 'x' ? 0o755 : 0o644);
    }
  }
}

function marketplaceWith(result, ctx) {
  const market = JSON.parse(fs.readFileSync(MARKETPLACE, 'utf8'));
  market.plugins = sortedKeys(result).map((name) => ({
    name: pluginName(name),
    source: `./plugins/${pluginName(name)}`,
    description: describe(name).description,
    version: ctx.version,
    category: TECH_REGISTRY[name] ? 'technology-stack' : 'development-framework',
    keywords: keywordsFor(name),
    license: 'MIT',
  }));
  return `${JSON.stringify(market, null, 2)}\n`;
}

function compare(result, out, market) {
  const diffs = [];
  const expected = new Map();
  for (const name of result.keys()) for (const [rel, e] of result.get(name)) expected.set(`${pluginName(name)}/${rel}`, e);
  const actual = new Set(walk(out));
  for (const key of [...expected.keys()].sort()) {
    const file = path.join(out, key);
    if (!actual.has(key)) diffs.push(`manquant : ${key}`);
    else {
      const e = expected.get(key);
      if (!fs.readFileSync(file).equals(e.data) || exec(file) !== (e.mode === 'x')) diffs.push(`différent : ${key}`);
    }
  }
  for (const key of [...actual].sort()) if (!expected.has(key)) diffs.push(`en trop : ${key}`);
  if (fs.readFileSync(MARKETPLACE, 'utf8') !== market) diffs.push('différent : .claude-plugin/marketplace.json');
  return diffs;
}

/** Références `@agent` (laissées telles quelles) dans le contenu embarqué. */
function countAgentRefs(result) {
  const agents = new Set();
  for (const files of result.values()) {
    for (const f of files.keys()) {
      const m = /^agents\/([^/]+)\.md$/.exec(f);
      if (m) agents.add(m[1]);
    }
  }
  const re = new RegExp(String.raw`(^|[\s\`'"(\[|>])@(${[...agents].join('|')})(?![\w-])`, 'gm');
  let n = 0;
  for (const files of result.values()) {
    for (const [f, e] of files) if (/\.(md|json|ya?ml|txt|template)$/.test(f)) n += (e.data.toString('utf8').match(re) ?? []).length;
  }
  return n;
}

function summarize(result, unresolved, owned, stats) {
  const lines = ['', 'Plugins :'];
  for (const name of sortedKeys(result)) {
    const files = result.get(name);
    const count = (re) => [...files.keys()].filter((f) => re.test(f)).length;
    const refs = count(/^(rules|references|templates|checklists)\//);
    lines.push(
      `  ${name.padEnd(12)} commandes=${owned.get(name).commands.size} agents=${count(/^agents\/[^/]+\.md$/)} skills=${new Set([...files.keys()].filter((f) => f.startsWith('skills/')).map((f) => f.split('/')[1])).size} références=${refs}`
    );
  }
  lines.push('', `Références slash réécrites (/<ns>: → /bear-<ns>:) : ${stats.slashRewritten}`);
  lines.push(`Références @agent laissées telles quelles : ${countAgentRefs(result)}`);
  const unique = new Map();
  for (const u of unresolved) unique.set(`${u.ref}|${u.cause}`, u);
  lines.push('', `Références non résolues : ${unresolved.length} occurrences, ${unique.size} uniques`);
  for (const u of [...unique.values()].sort((a, b) => (a.ref + a.plugin < b.ref + b.plugin ? -1 : 1))) {
    lines.push(`  [${u.cause}] ${u.ref}  (${u.plugin}: ${u.from})`);
  }
  return lines.join('\n');
}

function main() {
  const args = process.argv.slice(2);
  const check = args.includes('--check');
  const opt = (flag) => (args.includes(flag) ? args[args.indexOf(flag) + 1] : null);
  const out = path.resolve(ROOT, opt('--out') ?? 'plugins');
  const reportFile = opt('--report');

  const tmpBase = path.join(ROOT, '.test-tmp');
  fs.mkdirSync(tmpBase, { recursive: true });
  const work = fs.mkdtempSync(path.join(tmpBase, 'plugin-gen-'));
  try {
    const ctx = loadContext();
    const { result, unresolved, owned, stats } = generate(work, ctx);
    const market = marketplaceWith(result, ctx);
    if (check) {
      const diffs = fs.existsSync(out)
        ? compare(result, out, market)
        : ['dossier absent : ' + path.relative(ROOT, out)];
      if (diffs.length > 0) {
        console.error(
          `Dérive détectée (${diffs.length}) — lancer \`npm run plugins:generate\` :\n  ${diffs.slice(0, 40).join('\n  ')}`
        );
        process.exitCode = 1;
      } else {
        console.log(`plugins/ à jour (${result.size} plugins).`);
      }
      return;
    }
    writeTree(result, out);
    if (out === path.join(ROOT, 'plugins')) fs.writeFileSync(MARKETPLACE, market);
    if (reportFile) fs.writeFileSync(path.resolve(ROOT, reportFile), `${JSON.stringify({ unresolved }, null, 2)}\n`);
    console.log(summarize(result, unresolved, owned, stats));
  } finally {
    fs.rmSync(work, { recursive: true, force: true });
  }
}

main();
