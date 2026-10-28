import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import * as yaml from 'js-yaml';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, '../..');

// A `disallowedTools` entry with a specifier such as "Bash(rm -rf:*)" removes
// the WHOLE tool from the subagent, not only the matching commands
// (https://code.claude.com/docs/en/sub-agents.md). Seven agents had lost Bash
// this way. Command-level blocks belong to permissions.deny, which also applies
// to subagents. Audit 2026-10-28.
function listAgents(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) listAgents(full, out);
    else if (entry.name.endsWith('.md') && path.basename(path.dirname(full)) === 'agents') out.push(full);
  }
  return out;
}

const AGENTS = ['.claude/agents', 'Dev/i18n', 'Infra'].flatMap((d) => listAgents(path.join(PROJECT_ROOT, d)));
const TEMPLATES = ['en', 'fr', 'es', 'de', 'pt'].map((l) => `Dev/i18n/${l}/Common/templates/settings.json.template`);
const REQUIRED_DENY = ['Bash(dd:*)', 'Bash(mkfs:*)', 'Bash(git push --force*)', 'Bash(git push -f*)'];

describe('agents do not lose Bash through disallowedTools specifiers', () => {
  it('finds agents to check', () => {
    expect(AGENTS.length).toBeGreaterThan(100);
  });

  for (const file of AGENTS) {
    const rel = path.relative(PROJECT_ROOT, file);
    const block = fs.readFileSync(file, 'utf8').match(/^---\n([\s\S]*?)\n---/)?.[1];
    if (!block || !/^disallowedTools:/m.test(block)) continue;

    it(`${rel} lists whole tools only in disallowedTools`, () => {
      const list = yaml.load(block).disallowedTools ?? [];
      const entries = Array.isArray(list) ? list : String(list).split(',');
      for (const entry of entries) expect(String(entry), entry).not.toContain('(');
    });
  }
});

describe('distributed settings deny the commands the agents used to block', () => {
  for (const rel of TEMPLATES) {
    it(`${rel} denies ${REQUIRED_DENY.join(', ')}`, () => {
      const deny = JSON.parse(fs.readFileSync(path.join(PROJECT_ROOT, rel), 'utf8')).permissions.deny;
      for (const rule of REQUIRED_DENY) expect(deny).toContain(rule);
    });
  }
});
