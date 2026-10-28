import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

const PROJECT_ROOT = path.resolve(import.meta.dirname, '../..');
const COMMANDS = ['audit', 'security', 'sprint', 'delivery'];
const LOCATIONS = ['.claude/commands/team', ...['en', 'fr', 'es', 'de', 'pt'].map((l) => `Dev/i18n/${l}/Team/commands`)];

// Agent Teams is an experimental env-gated feature: without
// CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS the /team:* commands used to be unusable.
// The default engine is now plain sub-agent delegation (Agent tool), Agent Teams
// being opt-in via --engine=teams.
describe('/team:* execution engine', () => {
  for (const dir of LOCATIONS) {
    for (const cmd of COMMANDS) {
      const file = `${dir}/${cmd}.md`;
      const content = fs.readFileSync(path.join(PROJECT_ROOT, file), 'utf8');

      it(`${file} advertises --engine in argument-hint`, () => {
        const hint = content.match(/^argument-hint:\s*(.+)$/m)?.[1] ?? '';
        expect(hint).toContain('--engine=subagents|teams');
      });

      it(`${file} documents both engines and the Agent tool fallback`, () => {
        expect(content).toContain('--engine=subagents');
        expect(content).toContain('--engine=teams');
        expect(content).toContain('`Agent`');
        expect(content).toContain('claude -p');
      });

      it(`${file} only requires Agent Teams for --engine=teams`, () => {
        const gated = content.split('\n').filter((l) => /^- .*(CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1|v2\.1\.32\+)/.test(l));
        expect(gated.length).toBeGreaterThan(0);
        for (const line of gated) expect(line, line).toContain('--engine=teams');
      });
    }

    it(`${dir}/security.md keeps --scope and contrasts with native /security-review`, () => {
      const content = fs.readFileSync(path.join(PROJECT_ROOT, `${dir}/security.md`), 'utf8');
      expect(content).toContain('--scope=full|code|deps|infra');
      expect(content).toContain('/security-review');
    });
  }
});
