import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, '../..');
const COMMANDS_DIR = path.join(PROJECT_ROOT, '.claude', 'commands');
const AGENTS_DIR = path.join(PROJECT_ROOT, '.claude', 'agents');

// Guard against stale count claims in the most-read docs (CLAUDE.md, README).
// Counts are DERIVED from the filesystem, so the test self-adjusts: adding a
// command/agent forces the docs to be updated to match. See audit 2026-05-29 (DA-02):
// CLAUDE.md once claimed "211 commands across 26 namespaces" while only 125 / 15 existed.

function listNamespaces() {
  return fs.readdirSync(COMMANDS_DIR).filter((e) => fs.statSync(path.join(COMMANDS_DIR, e)).isDirectory());
}

function countCommands() {
  return listNamespaces().reduce(
    (sum, ns) => sum + fs.readdirSync(path.join(COMMANDS_DIR, ns)).filter((f) => f.endsWith('.md')).length,
    0
  );
}

function countAgents() {
  return fs.readdirSync(AGENTS_DIR).filter((f) => f.endsWith('.md')).length;
}

describe('documentation count accuracy', () => {
  const actualCommands = countCommands();
  const actualNamespaces = listNamespaces().length;
  const actualAgents = countAgents();

  const claudeMd = fs.readFileSync(path.join(PROJECT_ROOT, '.claude', 'CLAUDE.md'), 'utf8');
  const readme = fs.readFileSync(path.join(PROJECT_ROOT, 'README.md'), 'utf8');

  it('CLAUDE.md states the real command count', () => {
    expect(claudeMd, `CLAUDE.md must mention "${actualCommands} commands"`).toContain(`${actualCommands} commands`);
  });

  it('CLAUDE.md states the real namespace count', () => {
    expect(claudeMd, `CLAUDE.md must mention "${actualNamespaces} namespaces"`).toContain(
      `${actualNamespaces} namespaces`
    );
  });

  it('CLAUDE.md states the real specialized-agent count', () => {
    expect(claudeMd, `CLAUDE.md must mention "${actualAgents} specialized"`).toContain(`${actualAgents} specialized`);
  });

  it('README states the real command count', () => {
    expect(readme, `README.md must mention "${actualCommands} commands"`).toContain(`${actualCommands} commands`);
  });

  it('README states the real namespace count', () => {
    expect(readme, `README.md must mention "${actualNamespaces} namespaces"`).toContain(
      `${actualNamespaces} namespaces`
    );
  });

  it('CLAUDE.md does not claim the old stale counts (211 commands / 26 namespaces / 72 agents)', () => {
    expect(claudeMd).not.toContain('211 commands');
    expect(claudeMd).not.toContain('26 namespaces');
    expect(claudeMd).not.toContain('72 agents');
  });
});

// Every "N commands|commandes" / "N namespaces" claim in public-facing docs must be one of
// the two canonical figures (validated 2026-10-28, lot 13):
//   - headline  = everything under .claude/commands/ (count + namespaces)
//   - installable total = docs/COMMANDS-FULL-REFERENCE.md (deprecated stubs included until 9.0)
// Lines carrying a version marker (e.g. "(v8.10.x)", "v8.26.0") are dated release notes and
// keep the figures of their time.
describe('command count claims use a canonical figure', () => {
  const fullRef = fs.readFileSync(path.join(PROJECT_ROOT, 'docs', 'COMMANDS-FULL-REFERENCE.md'), 'utf8');
  const installableCommands = Number(fullRef.match(/\|\s*\*\*Total\*\*\s*\|\s*\*\*(\d+)\*\*/)[1]);
  const installableNamespaces = (fullRef.match(/^\| `\/[a-z]+:\*` \|/gm) || []).length;

  const allowed = {
    commands: new Set([countCommands(), installableCommands]),
    namespaces: new Set([listNamespaces().length, installableNamespaces]),
  };

  const CLAIM_RE = /(\d+)\s+(?:core\s+|slash\s+)?(commands|commandes|namespaces)\b/g;
  const VERSION_MARKER_RE = /\bv\d+\.\d+/;
  // website/en/ is gitignored (generated from docs/ by website/scripts/sync-docs.sh): the
  // generated page is only checked when it exists locally.
  const FILES = ['README.md', 'website/en/reference/commands.md', 'scripts/awesome-claude-code-submit.mjs'];

  for (const file of FILES) {
    it.skipIf(!fs.existsSync(path.join(PROJECT_ROOT, file)))(
      `${file} only states canonical command/namespace counts`,
      () => {
        const offending = fs
          .readFileSync(path.join(PROJECT_ROOT, file), 'utf8')
          .split('\n')
          .flatMap((line, i) =>
            VERSION_MARKER_RE.test(line)
              ? []
              : [...line.matchAll(CLAIM_RE)]
                  .filter(([, n, unit]) => !allowed[unit === 'namespaces' ? 'namespaces' : 'commands'].has(Number(n)))
                  .map(([claim]) => `${file}:${i + 1}: "${claim}"`)
          );
        expect(offending, `allowed: ${[...allowed.commands]} commands, ${[...allowed.namespaces]} namespaces`).toEqual(
          []
        );
      }
    );
  }
});
