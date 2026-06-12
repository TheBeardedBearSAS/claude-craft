#!/usr/bin/env node
/**
 * Auto-generate AGENTS-FULL-REFERENCE.md and COMMANDS-FULL-REFERENCE.md from
 * the canonical frontmatters in `.claude/agents/*.md` and `.claude/commands/`.
 *
 * Why: PERF-021/PERF-022 from the 2026-05-06 audit identified that the two
 * "FULL-REFERENCE" docs duplicate metadata already present in agent/command
 * files. Hand-maintenance leads to drift (counts, descriptions, model
 * choices). Generating from frontmatter eliminates the duplication and
 * makes drift impossible.
 *
 * Usage:
 *   node scripts/generate-references.mjs                # writes both files
 *   node scripts/generate-references.mjs --check        # exits non-zero if drift detected (CI)
 *   node scripts/generate-references.mjs --agents-only  # writes only AGENTS-FULL-REFERENCE.md
 *
 * The generator preserves a hand-written intro at the top of each file by
 * looking for a `<!-- AUTO-GEN-BEGIN -->` marker. Everything before the
 * marker is left untouched ; everything between the marker and
 * `<!-- AUTO-GEN-END -->` is rewritten on each run.
 *
 * @module scripts/generate-references
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import matter from 'gray-matter';
import { TECH_REGISTRY } from '../cli/lib/tech-registry.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const AGENTS_DIR = path.join(ROOT, '.claude', 'agents');
const COMMANDS_DIR = path.join(ROOT, '.claude', 'commands');
const AGENTS_OUT = path.join(ROOT, 'docs', 'AGENTS-FULL-REFERENCE.md');
const COMMANDS_OUT = path.join(ROOT, 'docs', 'COMMANDS-FULL-REFERENCE.md');

const AUTO_BEGIN = '<!-- AUTO-GEN-BEGIN -->';
const AUTO_END = '<!-- AUTO-GEN-END -->';

/**
 * @typedef {Object} AgentMeta
 * @property {string} name
 * @property {string} description
 * @property {string} [model]
 * @property {string} [effort]
 * @property {string} [memory]
 * @property {string[]} [skills]
 * @property {string[]} [tools]
 * @property {string} sourcePath  Relative path from ROOT
 */

/**
 * Read all `.md` files in a directory (non-recursive for agents, recursive for commands).
 * @param {string} dir
 * @param {boolean} recursive
 * @returns {string[]} absolute paths
 */
function listMdFiles(dir, recursive = false) {
  if (!fs.existsSync(dir)) return [];
  const out = [];
  // Sort entries for deterministic output — `--check` mode requires that two
  // consecutive runs produce byte-identical files.
  const entries = fs.readdirSync(dir, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name));
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory() && recursive) {
      out.push(...listMdFiles(full, true));
    } else if (entry.isFile() && entry.name.endsWith('.md')) {
      out.push(full);
    }
  }
  return out;
}

/**
 * Safely parse a markdown file's frontmatter. Returns `null` if the file is
 * unreadable or its YAML is malformed (some command files contain `<args>`
 * placeholders that are not valid YAML — we skip those rather than crash).
 * @param {string} filePath
 * @returns {Record<string, any>|null}
 */
function safeMatter(filePath) {
  let raw;
  try {
    raw = fs.readFileSync(filePath, 'utf8');
  } catch {
    return null;
  }
  try {
    return matter(raw).data;
  } catch {
    return null;
  }
}

/**
 * Parse an agent file and return its metadata (or null if the file lacks
 * the expected frontmatter).
 * @param {string} filePath
 * @returns {AgentMeta|null}
 */
function parseAgent(filePath) {
  const data = safeMatter(filePath);
  if (!data || !data.name) return null;
  return {
    name: data.name,
    description: data.description || '',
    model: data.model,
    effort: data.effort,
    memory: data.memory,
    skills: Array.isArray(data.skills) ? data.skills : [],
    tools: Array.isArray(data.tools) ? data.tools : [],
    sourcePath: path.relative(ROOT, filePath),
  };
}

/**
 * Parse a command file. Three layouts are supported:
 *   - `.claude/commands/<namespace>/<name>.md` — always-installed
 *   - `Dev/i18n/en/<Namespace>/commands/<name>.md` — installed by tech
 *   - `Infra/i18n/en/<Tool>/commands/<name>.md` — installed by infra tool
 *   - `Project/i18n/en/<Namespace>/commands/<name>.md` — installed by project track
 *
 * The namespace is supplied explicitly (lowercased) by the caller so we don't
 * have to second-guess the directory structure here.
 * @param {string} filePath
 * @param {string} namespace
 * @returns {{namespace: string, name: string, description: string, sourcePath: string}|null}
 */
function parseCommand(filePath, namespace) {
  const data = safeMatter(filePath);
  const name = path.basename(filePath, '.md');
  return {
    namespace,
    name,
    description: (data && data.description) || '',
    sourcePath: path.relative(ROOT, filePath),
  };
}

/**
 * Scan an i18n root (`Dev/i18n/en`, `Infra/i18n/en`, `Project/i18n/en`) and
 * return all `<RootDir>/<Tool>/commands/*.md` files paired with the lowercased
 * tool name as namespace.
 * @param {string} rootDir
 * @returns {{filePath: string, namespace: string}[]}
 */
function scanI18nCommands(rootDir) {
  if (!fs.existsSync(rootDir)) return [];
  const out = [];
  const entries = fs.readdirSync(rootDir, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name));
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    if (entry.name === 'commands') {
      // Flat layout `<RootDir>/commands/*.md` (e.g. `Project/i18n/en/commands/`):
      // namespace is the top segment of the root (`Project` -> `project`).
      const namespace = path.basename(path.dirname(path.dirname(rootDir))).toLowerCase();
      for (const f of listMdFiles(path.join(rootDir, 'commands'), false)) {
        out.push({ filePath: f, namespace });
      }
      continue;
    }
    const cmdDir = path.join(rootDir, entry.name, 'commands');
    if (!fs.existsSync(cmdDir)) continue;
    const namespace = entry.name.toLowerCase();
    for (const f of listMdFiles(cmdDir, false)) {
      out.push({ filePath: f, namespace });
    }
  }
  return out;
}

/**
 * Group agents into categories based on naming heuristics.
 * @param {AgentMeta[]} agents
 * @returns {Record<string, AgentMeta[]>}
 */
function categorizeAgents(agents) {
  const cats = {
    'Tech Reviewers': [],
    Common: [],
    Infrastructure: [],
    Project: [],
    Other: [],
  };
  // Derived from TECH_REGISTRY so new stacks are automatically included (audit CLI-06).
  const techReviewerNames = new Set(
    Object.keys(TECH_REGISTRY)
      .filter((k) => TECH_REGISTRY[k].tier !== null) // exclude infra techs (docker, coolify)
      .map((k) => `${k}-reviewer`)
  );
  const projectNames = new Set(['product-owner', 'tech-lead']);
  const infraPrefixes = [
    'docker-',
    'coolify-',
    'kubernetes-',
    'opentofu-',
    'ansible-',
    'hcloud-',
    'pgbouncer-',
    'frankenphp-',
  ];

  for (const a of agents) {
    if (techReviewerNames.has(a.name)) cats['Tech Reviewers'].push(a);
    else if (projectNames.has(a.name)) cats.Project.push(a);
    else if (infraPrefixes.some((p) => a.name.startsWith(p))) cats.Infrastructure.push(a);
    else cats.Common.push(a);
  }
  return cats;
}

/**
 * Render the auto-generated section of AGENTS-FULL-REFERENCE.md.
 * @param {AgentMeta[]} agents
 * @returns {string}
 */
function renderAgentsBody(agents) {
  const cats = categorizeAgents(agents);
  const lines = [];

  lines.push('## Inventory by Category', '');
  lines.push('| Category | Count |');
  lines.push('|----------|-------|');
  for (const [cat, list] of Object.entries(cats)) {
    if (list.length === 0) continue;
    lines.push(`| ${cat} | ${list.length} |`);
  }
  lines.push(`| **Total** | **${agents.length}** |`);
  lines.push('');

  for (const [cat, list] of Object.entries(cats)) {
    if (list.length === 0) continue;
    lines.push(`## ${cat}`, '');
    list.sort((a, b) => a.name.localeCompare(b.name));
    for (const a of list) {
      lines.push(`### \`@${a.name}\``, '');
      lines.push(a.description.trim() || '_no description_', '');
      const meta = [];
      if (a.model) meta.push(`**Model:** ${a.model}`);
      if (a.effort) meta.push(`**Effort:** ${a.effort}`);
      if (a.memory) meta.push(`**Memory:** ${a.memory}`);
      if (meta.length) lines.push(meta.join(' · '), '');
      if (a.skills.length) {
        lines.push(`**Skills:** ${a.skills.map((s) => `\`${s}\``).join(', ')}`);
        lines.push('');
      }
      if (a.tools.length) {
        lines.push(`**Tools:** ${a.tools.map((t) => `\`${t}\``).join(', ')}`);
        lines.push('');
      }
      lines.push(`**Source:** [\`${a.sourcePath}\`](../${a.sourcePath})`, '');
      lines.push('---', '');
    }
  }
  return lines.join('\n');
}

/**
 * Render the auto-generated section of COMMANDS-FULL-REFERENCE.md.
 * @param {{namespace: string, name: string, description: string, sourcePath: string}[]} commands
 * @returns {string}
 */
function renderCommandsBody(commands) {
  const byNs = {};
  for (const c of commands) {
    if (!byNs[c.namespace]) byNs[c.namespace] = [];
    byNs[c.namespace].push(c);
  }
  const lines = [];
  lines.push('## Commands by Namespace', '');
  lines.push('| Namespace | Count |');
  lines.push('|-----------|-------|');
  const sortedNs = Object.keys(byNs).sort();
  for (const ns of sortedNs) {
    lines.push(`| \`/${ns}:*\` | ${byNs[ns].length} |`);
  }
  lines.push(`| **Total** | **${commands.length}** |`);
  lines.push('');

  for (const ns of sortedNs) {
    lines.push(`## \`/${ns}:*\``, '');
    byNs[ns].sort((a, b) => a.name.localeCompare(b.name));
    lines.push('| Command | Description |');
    lines.push('|---------|-------------|');
    for (const c of byNs[ns]) {
      const desc = c.description
        .trim()
        .replace(/\n/g, ' ')
        .replace(/\\/g, '\\\\') // escape backslashes first, before other escapes
        .replace(/\|/g, '\\|');
      lines.push(`| [\`/${ns}:${c.name}\`](../${c.sourcePath}) | ${desc || '_no description_'} |`);
    }
    lines.push('');
  }
  return lines.join('\n');
}

/**
 * Replace the content between AUTO_BEGIN and AUTO_END in `existing` with `body`.
 * If the markers are absent, prepend a header and use the body as-is.
 * @param {string} existing
 * @param {string} body
 * @param {string} title
 * @returns {string}
 */
function spliceAutoSection(existing, body, title) {
  // Stamp must NOT contain the current date — `--check` mode compares the
  // freshly-generated content to the on-disk file, and a daily-changing
  // timestamp would make the check fail every day even without real drift.
  const stamp = `<!-- Auto-generated by scripts/generate-references.mjs — do not hand-edit between the markers. Run \`npm run docs:generate\` to refresh. -->`;
  // The wrapped section already ends with a single newline after AUTO_END.
  const wrapped = `${AUTO_BEGIN}\n${stamp}\n\n${body}\n${AUTO_END}\n`;
  if (existing.includes(AUTO_BEGIN) && existing.includes(AUTO_END)) {
    const before = existing.split(AUTO_BEGIN)[0];
    // Trim a leading newline from `after` to keep the file idempotent: the
    // wrapped section already provides exactly one trailing `\n`. Without
    // this, each run would accumulate one extra blank line.
    let after = existing.split(AUTO_END)[1] || '';
    if (after.startsWith('\n')) after = after.slice(1);
    return `${before}${wrapped}${after}`;
  }
  return `# ${title}\n\n${wrapped}`;
}

function main() {
  const args = process.argv.slice(2);
  const checkOnly = args.includes('--check');
  const agentsOnly = args.includes('--agents-only');
  const commandsOnly = args.includes('--commands-only');

  let drift = false;

  if (!commandsOnly) {
    // .claude/agents/ — always-installed common + tech-reviewer agents.
    const agentFiles = listMdFiles(AGENTS_DIR, false);
    // Infra/i18n/en/<Tool>/agents/ — infrastructure agents installed on-demand.
    // We scan only the `en` locale to avoid duplicating across languages.
    const infraEn = path.join(ROOT, 'Infra', 'i18n', 'en');
    if (fs.existsSync(infraEn)) {
      for (const tool of fs.readdirSync(infraEn, { withFileTypes: true })) {
        if (!tool.isDirectory()) continue;
        const agentsSub = path.join(infraEn.toString(), tool.name, 'agents');
        if (fs.existsSync(agentsSub)) {
          agentFiles.push(...listMdFiles(agentsSub, false));
        }
      }
    }
    const agents = agentFiles.map(parseAgent).filter(Boolean);
    const body = renderAgentsBody(agents);
    const existing = fs.existsSync(AGENTS_OUT) ? fs.readFileSync(AGENTS_OUT, 'utf8') : '';
    const next = spliceAutoSection(existing, body, 'Agents Full Reference');
    if (existing !== next) {
      drift = true;
      if (!checkOnly) {
        fs.writeFileSync(AGENTS_OUT, next, 'utf8');
        console.log(`✓ AGENTS-FULL-REFERENCE.md regenerated (${agents.length} agents)`);
      } else {
        console.error(`✗ AGENTS-FULL-REFERENCE.md is out of date (${agents.length} agents detected)`);
      }
    } else {
      console.log(`= AGENTS-FULL-REFERENCE.md up to date (${agents.length} agents)`);
    }
  }

  if (!agentsOnly) {
    /** @type {{filePath: string, namespace: string}[]} */
    const allCommandsRefs = [];
    /** key = `<namespace>:<name>` so we never list the same command twice */
    const seen = new Set();

    // 1) `.claude/commands/<namespace>/<name>.md` — always-installed canonical
    //    location. Prefer this source when a command exists in multiple roots.
    if (fs.existsSync(COMMANDS_DIR)) {
      for (const entry of fs.readdirSync(COMMANDS_DIR, { withFileTypes: true })) {
        if (!entry.isDirectory()) continue;
        const ns = entry.name.toLowerCase();
        for (const f of listMdFiles(path.join(COMMANDS_DIR, entry.name), true)) {
          const key = `${ns}:${path.basename(f, '.md')}`;
          if (seen.has(key)) continue;
          seen.add(key);
          allCommandsRefs.push({ filePath: f, namespace: ns });
        }
      }
    }

    // 2-4) Tech, infra, project i18n roots — only `en` locale. Skip commands
    //      already provided by `.claude/commands/` (the canonical location).
    for (const root of ['Dev/i18n/en', 'Infra/i18n/en', 'Project/i18n/en']) {
      const fullRoot = path.join(ROOT, root);
      for (const ref of scanI18nCommands(fullRoot)) {
        const key = `${ref.namespace}:${path.basename(ref.filePath, '.md')}`;
        if (seen.has(key)) continue;
        seen.add(key);
        allCommandsRefs.push(ref);
      }
    }

    const commands = allCommandsRefs
      .map(({ filePath, namespace }) => parseCommand(filePath, namespace))
      .filter(Boolean);
    const body = renderCommandsBody(commands);
    const existing = fs.existsSync(COMMANDS_OUT) ? fs.readFileSync(COMMANDS_OUT, 'utf8') : '';
    const next = spliceAutoSection(existing, body, 'Commands Full Reference');
    if (existing !== next) {
      drift = true;
      if (!checkOnly) {
        fs.writeFileSync(COMMANDS_OUT, next, 'utf8');
        console.log(`✓ COMMANDS-FULL-REFERENCE.md regenerated (${commands.length} commands)`);
      } else {
        console.error(`✗ COMMANDS-FULL-REFERENCE.md is out of date (${commands.length} commands detected)`);
      }
    } else {
      console.log(`= COMMANDS-FULL-REFERENCE.md up to date (${commands.length} commands)`);
    }
  }

  if (checkOnly && drift) {
    console.error('');
    console.error('Run `node scripts/generate-references.mjs` to regenerate, then commit.');
    process.exit(1);
  }
}

main();
