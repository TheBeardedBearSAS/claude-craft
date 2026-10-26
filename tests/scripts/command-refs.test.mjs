import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

const PROJECT_ROOT = path.resolve(import.meta.dirname, '../..');
const LANGS = ['en', 'fr', 'es', 'de', 'pt'];
const I18N_ROOTS = ['Dev/i18n', 'Infra/i18n', 'Project/i18n'];

// `/ns:cmd` not preceded by a word char, `.`, `:`, `/` or `-` (skips URLs, `C:/`, paths).
const REF_RE = /(?<![\w.:\/-])\/([a-z][a-z0-9]*):([a-z0-9][a-z0-9-]*)/g;

// Tokens that look like `/ns:cmd` but are not commands (dotnet-sonarscanner `/d:sonar.login=...`).
const NON_COMMAND_PREFIXES = new Set(['d']);

// Distributed docs outside the i18n trees that point users at commands.
const EXTRA_FILES = ['Tools/Ralph/README.md'];

function listMd(dir) {
  if (!fs.existsSync(dir)) return [];
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...listMd(full));
    else if (entry.name.endsWith('.md')) out.push(full);
  }
  return out;
}

// `<root>/<Dir>/commands/x.md` -> `dir:x` ; flat `Project/i18n/<lang>/commands/x.md` -> `project:x`.
function commandsOf(langDir, flatNamespace) {
  const names = new Set();
  if (!fs.existsSync(langDir)) return names;
  for (const entry of fs.readdirSync(langDir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const isFlat = entry.name === 'commands';
    const cmdDir = isFlat ? path.join(langDir, 'commands') : path.join(langDir, entry.name, 'commands');
    if (!fs.existsSync(cmdDir)) continue;
    const ns = isFlat ? flatNamespace : entry.name.toLowerCase();
    for (const f of fs.readdirSync(cmdDir)) {
      if (f.endsWith('.md')) names.add(`${ns}:${f.slice(0, -3)}`);
    }
  }
  return names;
}

function validCommands(lang) {
  const names = new Set();
  for (const root of I18N_ROOTS) {
    const flatNs = root.split('/')[0].toLowerCase();
    for (const sub of ['base', lang]) {
      for (const n of commandsOf(path.join(PROJECT_ROOT, root, sub), flatNs)) names.add(n);
    }
  }
  return names;
}

function deadRefs(files, valid) {
  const dead = [];
  for (const file of files) {
    const lines = fs.readFileSync(file, 'utf8').split('\n');
    lines.forEach((line, i) => {
      for (const [, ns, cmd] of line.matchAll(REF_RE)) {
        if (NON_COMMAND_PREFIXES.has(ns)) continue;
        if (!valid.has(`${ns}:${cmd}`)) {
          dead.push(`${path.relative(PROJECT_ROOT, file)}:${i + 1} /${ns}:${cmd}`);
        }
      }
    });
  }
  return dead;
}

describe('command references resolve to existing commands', () => {
  it('finds a realistic set of commands', () => {
    const valid = validCommands('en');
    expect(valid.size).toBeGreaterThan(100);
    expect(valid.has('project:add-story')).toBe(true);
    expect(valid.has('common:init')).toBe(true); // base-only command
  });

  it.each(LANGS)('every /ns:cmd in %s sources resolves', (lang) => {
    const files = [
      ...listMd(path.join(PROJECT_ROOT, 'Project/i18n', lang)),
      ...listMd(path.join(PROJECT_ROOT, 'Dev/i18n', lang)),
      ...(lang === 'en' ? listMd(path.join(PROJECT_ROOT, 'Dev/i18n/base')) : []),
    ];
    const dead = deadRefs(files, validCommands(lang));
    expect(dead, `Dead command references:\n${dead.join('\n')}`).toEqual([]);
  });

  it('every /ns:cmd in distributed tool docs resolves', () => {
    const dead = deadRefs(EXTRA_FILES.map((f) => path.join(PROJECT_ROOT, f)), validCommands('en'));
    expect(dead, `Dead command references:\n${dead.join('\n')}`).toEqual([]);
  });
});
