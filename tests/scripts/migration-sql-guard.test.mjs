import { describe, it, expect } from 'vitest';
import { spawnSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import * as yaml from 'js-yaml';

const PROJECT_ROOT = path.resolve(import.meta.dirname, '../..');
const FILES = [
  '.claude/agents/migration-specialist.md',
  ...['en', 'fr', 'es', 'de', 'pt'].map((l) => `Dev/i18n/${l}/Common/agents/migration-specialist.md`),
];

// The agent used to list "Bash(DROP DATABASE:*)" & co. in disallowedTools:
// SQL statements are arguments of a client (psql -c, mysql -e), never the
// command prefix, so those rules matched nothing — and a specifier removed
// Bash entirely. A frontmatter PreToolUse hook (active only while this
// subagent runs) inspects the Bash tool input on stdin instead.
function guardCommand(rel) {
  const block = fs.readFileSync(path.join(PROJECT_ROOT, rel), 'utf8').match(/^---\n([\s\S]*?)\n---/)[1];
  const entry = (yaml.load(block).hooks?.PreToolUse ?? []).find((h) => h.matcher === 'Bash');
  return entry?.hooks?.find((h) => h.type === 'command')?.command;
}

function run(command, bashCommand) {
  const input = JSON.stringify({ hook_event_name: 'PreToolUse', tool_name: 'Bash', tool_input: { command: bashCommand } });
  return spawnSync('bash', ['-c', command], { input, encoding: 'utf8' });
}

const BLOCKED = [
  'psql -c "DROP TABLE users;"',
  "mysql -e 'drop database app'",
  'psql -c "TRUNCATE orders"',
  'psql -c "DROP SCHEMA billing CASCADE"',
];
const ALLOWED = [
  'psql -c "SELECT count(*) FROM users"',
  'php bin/console doctrine:migrations:migrate --no-interaction',
  'grep -rn truncated src/',
  'psql -c "DROP INDEX idx_users_email"',
];

describe('migration-specialist destructive SQL guard', () => {
  for (const rel of FILES) {
    describe(rel, () => {
      const command = guardCommand(rel);

      it('declares a PreToolUse hook on Bash', () => {
        expect(command, 'hooks.PreToolUse[matcher=Bash].hooks[type=command].command').toBeTypeOf('string');
      });

      it.each(BLOCKED)('blocks %s with exit 2 and a reason', (sql) => {
        const res = run(command, sql);
        expect(res.status).toBe(2);
        expect(res.stderr.trim().length).toBeGreaterThan(0);
      });

      it.each(ALLOWED)('allows %s', (cmd) => {
        expect(run(command, cmd).status).toBe(0);
      });
    });
  }
});
