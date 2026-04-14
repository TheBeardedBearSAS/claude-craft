import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

const PROJECT_ROOT = path.resolve(import.meta.dirname, '../..');
const TEMPLATES_BASE = path.join(PROJECT_ROOT, 'Dev/i18n/base/Common/templates');
const TEMPLATES_EN = path.join(PROJECT_ROOT, 'Dev/i18n/en/Common/templates');

describe('template content validation', () => {
  describe('settings.json.template', () => {
    const templatePath = path.join(TEMPLATES_EN, 'settings.json.template');

    it('exists', () => {
      expect(fs.existsSync(templatePath)).toBe(true);
    });

    it('is valid JSON', () => {
      const content = fs.readFileSync(templatePath, 'utf8');
      expect(() => JSON.parse(content)).not.toThrow();
    });

    it('contains CLAUDE_CODE_SUBAGENT_MODEL env', () => {
      const settings = JSON.parse(fs.readFileSync(templatePath, 'utf8'));
      expect(settings.env).toBeDefined();
      expect(settings.env.CLAUDE_CODE_SUBAGENT_MODEL).toBe('claude-sonnet-4-5');
    });

    it('contains PostCompact hook', () => {
      const settings = JSON.parse(fs.readFileSync(templatePath, 'utf8'));
      expect(settings.hooks.PostCompact).toBeDefined();
      expect(settings.hooks.PostCompact).toBeInstanceOf(Array);
      expect(settings.hooks.PostCompact.length).toBeGreaterThan(0);
    });

    it('contains SessionStart compact hook', () => {
      const settings = JSON.parse(fs.readFileSync(templatePath, 'utf8'));
      const sessionStart = settings.hooks.SessionStart;
      expect(sessionStart).toBeDefined();
      const compactHook = sessionStart.find((h) => h.matcher === 'compact');
      expect(compactHook).toBeDefined();
    });

    it('contains PreCompact hook', () => {
      const settings = JSON.parse(fs.readFileSync(templatePath, 'utf8'));
      expect(settings.hooks.PreCompact).toBeDefined();
    });

    it('contains PreToolUse security hooks for Edit and Write', () => {
      const settings = JSON.parse(fs.readFileSync(templatePath, 'utf8'));
      const preToolUse = settings.hooks.PreToolUse;
      expect(preToolUse.find((h) => h.matcher === 'Edit')).toBeDefined();
      expect(preToolUse.find((h) => h.matcher === 'Write')).toBeDefined();
    });

    it('contains PostToolUse output filter for Bash', () => {
      const settings = JSON.parse(fs.readFileSync(templatePath, 'utf8'));
      const postToolUse = settings.hooks.PostToolUse;
      const bashHook = postToolUse.find((h) => h.matcher === 'Bash');
      expect(bashHook).toBeDefined();
    });

    it('has permissions with allow and deny arrays', () => {
      const settings = JSON.parse(fs.readFileSync(templatePath, 'utf8'));
      expect(settings.permissions.allow).toBeInstanceOf(Array);
      expect(settings.permissions.deny).toBeInstanceOf(Array);
      expect(settings.permissions.allow.length).toBeGreaterThan(5);
      expect(settings.permissions.deny.length).toBeGreaterThan(0);
    });

    it('deny list blocks dangerous patterns', () => {
      const settings = JSON.parse(fs.readFileSync(templatePath, 'utf8'));
      const deny = settings.permissions.deny;
      expect(deny).toContain('Bash(rm -rf:*)');
      expect(deny).toContain('Bash(sudo:*)');
      expect(deny.some((d) => d.includes('.env'))).toBe(true);
    });
  });

  describe('settings.local.json.template', () => {
    const templatePath = path.join(TEMPLATES_BASE, 'settings.local.json.template');

    it('exists', () => {
      expect(fs.existsSync(templatePath)).toBe(true);
    });

    it('is valid JSON', () => {
      const content = fs.readFileSync(templatePath, 'utf8');
      expect(() => JSON.parse(content)).not.toThrow();
    });

    it('contains consolidated permission wildcards', () => {
      const settings = JSON.parse(fs.readFileSync(templatePath, 'utf8'));
      expect(settings.permissions.allow).toBeInstanceOf(Array);
      expect(settings.permissions.allow).toContain('Bash(git:*)');
      expect(settings.permissions.allow).toContain('Bash(npm:*)');
      expect(settings.permissions.allow).toContain('Bash(docker:*)');
      expect(settings.permissions.allow).toContain('WebSearch');
      expect(settings.permissions.allow).toContain('WebFetch');
    });

    it('has reasonable number of wildcards (< 50)', () => {
      const settings = JSON.parse(fs.readFileSync(templatePath, 'utf8'));
      expect(settings.permissions.allow.length).toBeLessThan(50);
      expect(settings.permissions.allow.length).toBeGreaterThan(10);
    });

    it('does not contain full command paths or commit messages', () => {
      const content = fs.readFileSync(templatePath, 'utf8');
      expect(content).not.toContain('/home/');
      expect(content).not.toContain('commit -m');
      expect(content).not.toContain('Co-Authored-By');
    });

    it('file size is under 2KB', () => {
      const stats = fs.statSync(templatePath);
      expect(stats.size).toBeLessThan(2048);
    });
  });

  describe('claudeignore.template', () => {
    const templatePath = path.join(TEMPLATES_BASE, 'claudeignore.template');

    it('exists', () => {
      expect(fs.existsSync(templatePath)).toBe(true);
    });

    it('excludes node_modules', () => {
      const content = fs.readFileSync(templatePath, 'utf8');
      expect(content).toContain('node_modules/');
    });

    it('excludes coverage directory', () => {
      const content = fs.readFileSync(templatePath, 'utf8');
      expect(content).toContain('coverage/');
    });

    it('excludes build artifacts', () => {
      const content = fs.readFileSync(templatePath, 'utf8');
      expect(content).toContain('dist/');
    });

    it('excludes lock files', () => {
      const content = fs.readFileSync(templatePath, 'utf8');
      expect(content).toContain('package-lock.json');
    });

    it('excludes IDE directories', () => {
      const content = fs.readFileSync(templatePath, 'utf8');
      expect(content).toContain('.idea/');
      expect(content).toContain('.vscode/');
    });
  });
});
