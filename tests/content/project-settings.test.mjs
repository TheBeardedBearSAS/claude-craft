import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

const PROJECT_ROOT = path.resolve(import.meta.dirname, '../..');
const SETTINGS_PATH = path.join(PROJECT_ROOT, '.claude', 'settings.json');
const LOCAL_SETTINGS_PATH = path.join(PROJECT_ROOT, '.claude', 'settings.local.json');
const CLAUDEIGNORE_PATH = path.join(PROJECT_ROOT, '.claudeignore');

describe('project settings.json optimization', () => {
  const settings = JSON.parse(fs.readFileSync(SETTINGS_PATH, 'utf8'));

  it('is valid JSON', () => {
    expect(() => JSON.parse(fs.readFileSync(SETTINGS_PATH, 'utf8'))).not.toThrow();
  });

  it('has CLAUDE_CODE_SUBAGENT_MODEL in env', () => {
    expect(settings.env).toBeDefined();
    expect(settings.env.CLAUDE_CODE_SUBAGENT_MODEL).toBeDefined();
    expect(settings.env.CLAUDE_CODE_SUBAGENT_MODEL).toMatch(/sonnet/);
  });

  it('has PostCompact hook', () => {
    expect(settings.hooks.PostCompact).toBeDefined();
    expect(settings.hooks.PostCompact).toBeInstanceOf(Array);
    expect(settings.hooks.PostCompact.length).toBeGreaterThan(0);

    const hook = settings.hooks.PostCompact[0];
    expect(hook.hooks[0].command).toContain('context-essentials.md');
  });

  it('has PreCompact hook', () => {
    expect(settings.hooks.PreCompact).toBeDefined();
  });

  it('has SessionStart compact hook for context reinjection', () => {
    const sessionStart = settings.hooks.SessionStart;
    expect(sessionStart).toBeDefined();
    const compactHook = sessionStart.find((h) => h.matcher === 'compact');
    expect(compactHook).toBeDefined();
    expect(compactHook.hooks[0].command).toContain('context-essentials.md');
  });

  it('has PreToolUse security hooks for sensitive files', () => {
    const preToolUse = settings.hooks.PreToolUse;
    expect(preToolUse).toBeDefined();

    const editHook = preToolUse.find((h) => h.matcher === 'Edit');
    expect(editHook).toBeDefined();
    expect(editHook.hooks[0].command).toContain('.env');

    const writeHook = preToolUse.find((h) => h.matcher === 'Write');
    expect(writeHook).toBeDefined();
    expect(writeHook.hooks[0].command).toContain('.env');
  });

  it('has PostToolUse output filter hooks', () => {
    const postToolUse = settings.hooks.PostToolUse;
    expect(postToolUse).toBeDefined();

    const grepHook = postToolUse.find((h) => h.matcher === 'Grep');
    expect(grepHook).toBeDefined();

    const globHook = postToolUse.find((h) => h.matcher === 'Glob');
    expect(globHook).toBeDefined();
  });
});

describe('project settings.local.json optimization', () => {
  it('exists and is valid JSON', () => {
    expect(fs.existsSync(LOCAL_SETTINGS_PATH)).toBe(true);
    expect(() => JSON.parse(fs.readFileSync(LOCAL_SETTINGS_PATH, 'utf8'))).not.toThrow();
  });

  it('file size is under 5KB (no permission bloat)', () => {
    const stats = fs.statSync(LOCAL_SETTINGS_PATH);
    expect(stats.size).toBeLessThan(5120);
  });

  it('does not contain absolute home paths', () => {
    const content = fs.readFileSync(LOCAL_SETTINGS_PATH, 'utf8');
    expect(content).not.toContain('/home/fmetivier/');
    expect(content).not.toContain('commit -m');
  });

  it('does not have CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS enabled', () => {
    const settings = JSON.parse(fs.readFileSync(LOCAL_SETTINGS_PATH, 'utf8'));
    if (settings.env) {
      expect(settings.env.CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS).toBeUndefined();
    }
  });

  it('uses wildcard permissions (not specific commands)', () => {
    const settings = JSON.parse(fs.readFileSync(LOCAL_SETTINGS_PATH, 'utf8'));
    const allow = settings.permissions?.allow || [];
    for (const perm of allow) {
      if (perm.startsWith('Bash(')) {
        expect(
          perm,
          `Permission "${perm}" should use wildcard pattern (Bash(cmd:*))`,
        ).toMatch(/:\*\)$/);
      }
    }
  });
});

describe('.claudeignore', () => {
  it('exists at project root', () => {
    expect(fs.existsSync(CLAUDEIGNORE_PATH)).toBe(true);
  });

  it('excludes node_modules', () => {
    const content = fs.readFileSync(CLAUDEIGNORE_PATH, 'utf8');
    expect(content).toContain('node_modules/');
  });

  it('excludes website directory', () => {
    const content = fs.readFileSync(CLAUDEIGNORE_PATH, 'utf8');
    expect(content).toContain('website/');
  });

  it('excludes i18n source directories', () => {
    const content = fs.readFileSync(CLAUDEIGNORE_PATH, 'utf8');
    expect(content).toContain('Dev/i18n/');
    expect(content).toContain('Infra/i18n/');
  });

  it('excludes CHANGELOG.md', () => {
    const content = fs.readFileSync(CLAUDEIGNORE_PATH, 'utf8');
    expect(content).toContain('CHANGELOG.md');
  });
});
