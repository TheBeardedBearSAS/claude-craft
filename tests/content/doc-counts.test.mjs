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
    expect(readme, `README.md must mention "${actualNamespaces} namespaces"`).toContain(`${actualNamespaces} namespaces`);
  });

  it('CLAUDE.md does not claim the old stale counts (211 commands / 26 namespaces / 72 agents)', () => {
    expect(claudeMd).not.toContain('211 commands');
    expect(claudeMd).not.toContain('26 namespaces');
    expect(claudeMd).not.toContain('72 agents');
  });
});
