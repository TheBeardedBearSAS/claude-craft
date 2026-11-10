#!/usr/bin/env node
// Fusion non destructive de hooks Claude Code dans un settings.json.
//   add    --settings F --fragment G [--dry-run]   ajoute les handlers absents
//   remove --settings F --match STR                retire les handlers dont la commande contient STR
// `add` ne retire ni ne modifie jamais un hook existant et est idempotent : un handler
// est ignoré si sa commande figure déjà dans l'événement (quel que soit le groupe).
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const matcherOf = (group) => group.matcher ?? '';
const commandsOf = (groups) => new Set(groups.flatMap((g) => (g.hooks ?? []).map((x) => x.command)));

export function addHooks(settings, fragment) {
  const out = structuredClone(settings);
  let added = 0;
  out.hooks ??= {};
  for (const [event, fragGroups] of Object.entries(fragment.hooks ?? {})) {
    const groups = (out.hooks[event] ??= []);
    for (const fg of fragGroups) {
      for (const handler of fg.hooks ?? []) {
        if (commandsOf(groups).has(handler.command)) continue;
        let group = groups.find((g) => matcherOf(g) === matcherOf(fg));
        if (!group) {
          group = { ...(fg.matcher === undefined ? {} : { matcher: fg.matcher }), hooks: [] };
          groups.push(group);
        }
        (group.hooks ??= []).push(structuredClone(handler));
        added++;
      }
    }
  }
  return { settings: out, added };
}

export function removeHooks(settings, match) {
  const out = structuredClone(settings);
  let removed = 0;
  for (const [event, groups] of Object.entries(out.hooks ?? {})) {
    for (const g of groups) {
      const kept = (g.hooks ?? []).filter((x) => !String(x.command ?? '').includes(match));
      removed += (g.hooks ?? []).length - kept.length;
      g.hooks = kept;
    }
    out.hooks[event] = groups.filter((g) => g.hooks.length > 0);
    if (out.hooks[event].length === 0) delete out.hooks[event];
  }
  return { settings: out, removed };
}

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function parseArgs(argv) {
  const opts = { dryRun: false };
  for (let i = 1; i < argv.length; i++) {
    if (argv[i] === '--dry-run') opts.dryRun = true;
    else if (argv[i] === '--settings') opts.settings = argv[++i];
    else if (argv[i] === '--fragment') opts.fragment = argv[++i];
    else if (argv[i] === '--match') opts.match = argv[++i];
  }
  return opts;
}

function loadSettings(file) {
  if (!fs.existsSync(file)) return {};
  try {
    const settings = readJson(file);
    if (settings === null || typeof settings !== 'object' || Array.isArray(settings)) throw new Error('not an object');
    if (settings.hooks !== undefined && (typeof settings.hooks !== 'object' || Array.isArray(settings.hooks))) {
      throw new Error('"hooks" is not an object');
    }
    return settings;
  } catch (e) {
    console.warn(`warning: ${file} left untouched (${e.message}); merge the hooks manually`);
    return null;
  }
}

function main(argv) {
  const cmd = argv[0];
  const opts = parseArgs(argv);
  if (!['add', 'remove'].includes(cmd) || !opts.settings) {
    console.error('usage: merge-hooks.mjs add --settings F --fragment G [--dry-run] | remove --settings F --match STR');
    return 1;
  }
  const settings = loadSettings(opts.settings);
  if (settings === null) return 0;
  const exists = fs.existsSync(opts.settings);
  if (cmd === 'remove') {
    if (!exists || !opts.match) return exists ? 1 : 0;
    const { settings: next, removed } = removeHooks(settings, opts.match);
    if (removed > 0) fs.writeFileSync(opts.settings, `${JSON.stringify(next, null, 2)}\n`);
    console.log(`removed ${removed} handlers`);
    return 0;
  }
  if (!opts.fragment) return 1;
  const { settings: next, added } = addHooks(settings, readJson(opts.fragment));
  if (opts.dryRun) {
    console.log(`would add ${added} handlers to ${opts.settings}`);
    return 0;
  }
  fs.mkdirSync(path.dirname(opts.settings), { recursive: true });
  if (added > 0 || !exists) fs.writeFileSync(opts.settings, `${JSON.stringify(next, null, 2)}\n`);
  console.log(`added ${added} handlers to ${opts.settings}`);
  return 0;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) process.exitCode = main(process.argv.slice(2));
