import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, '../..');

// Règle 11 : $TOOL_INPUT / $TOOL_OUTPUT ne sont pas des variables d'environnement
// shell. Un hook qui les lit est silencieusement inopérant ; le payload arrive en
// JSON sur stdin (lu via jq). Seuls les champs `command` sont scannés : plusieurs
// `description` citent l'ancien pattern à titre historique.
const FORBIDDEN = /\$\{?TOOL_(INPUT|OUTPUT)\b/;

const HOOK_DIR = path.join(PROJECT_ROOT, '.claude/templates/hooks');
const FILES = [
  '.claude/settings.json',
  ...fs
    .readdirSync(HOOK_DIR)
    .filter((f) => f.endsWith('.json'))
    .map((f) => `.claude/templates/hooks/${f}`),
  'Dev/i18n/base/Common/templates/settings.json.template',
  'Dev/i18n/base/Common/hooks/templates/hooks.default.json',
  'Dev/i18n/base/Common/hooks/templates/hooks.full.json',
];

function collectCommands(node, out = []) {
  if (Array.isArray(node)) node.forEach((n) => collectCommands(n, out));
  else if (node && typeof node === 'object') {
    for (const [key, value] of Object.entries(node)) {
      if (key === 'command' && typeof value === 'string') out.push(value);
      else collectCommands(value, out);
    }
  }
  return out;
}

const commandsOf = (rel) => collectCommands(JSON.parse(fs.readFileSync(path.join(PROJECT_ROOT, rel), 'utf8')));

describe('hooks read their payload from stdin, never $TOOL_INPUT', () => {
  it('the scan finds hook commands at all', () => {
    expect(FILES.flatMap(commandsOf).length).toBeGreaterThan(0);
  });

  for (const rel of FILES) {
    it(rel, () => {
      expect(commandsOf(rel).filter((c) => FORBIDDEN.test(c))).toEqual([]);
    });
  }
});
