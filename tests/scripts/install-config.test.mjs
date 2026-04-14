import { describe, it, expect, afterAll } from 'vitest';
import { execSync } from 'child_process';
import fs from 'fs';
import os from 'os';
import path from 'path';

const PROJECT_ROOT = path.resolve(import.meta.dirname, '../..');
const SCRIPT = path.join(PROJECT_ROOT, 'Dev/scripts/install-common-rules.sh');

const tmpDirs = [];

function makeTmpDir() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'cc-test-config-'));
  tmpDirs.push(dir);
  return dir;
}

afterAll(() => {
  for (const dir of tmpDirs) {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

describe('install_config() in install-common-rules.sh', { timeout: 60000 }, () => {
  it('installs .claudeignore at project root', () => {
    const tmpDir = makeTmpDir();
    execSync(`bash "${SCRIPT}" --lang=en "${tmpDir}"`, {
      encoding: 'utf8',
      timeout: 30000,
    });

    const claudeignore = path.join(tmpDir, '.claudeignore');
    expect(fs.existsSync(claudeignore)).toBe(true);

    const content = fs.readFileSync(claudeignore, 'utf8');
    expect(content).toContain('node_modules/');
    expect(content).toContain('coverage/');
  });

  it('installs settings.json with env block', () => {
    const tmpDir = makeTmpDir();
    execSync(`bash "${SCRIPT}" --lang=en "${tmpDir}"`, {
      encoding: 'utf8',
      timeout: 30000,
    });

    const settingsPath = path.join(tmpDir, '.claude', 'settings.json');
    expect(fs.existsSync(settingsPath)).toBe(true);

    const settings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
    expect(settings.env).toBeDefined();
    expect(settings.env.CLAUDE_CODE_SUBAGENT_MODEL).toBe('claude-sonnet-4-5');
  });

  it('settings.json contains PostCompact hook', () => {
    const tmpDir = makeTmpDir();
    execSync(`bash "${SCRIPT}" --lang=en "${tmpDir}"`, {
      encoding: 'utf8',
      timeout: 30000,
    });

    const settings = JSON.parse(
      fs.readFileSync(path.join(tmpDir, '.claude', 'settings.json'), 'utf8'),
    );
    expect(settings.hooks.PostCompact).toBeDefined();
    expect(settings.hooks.PostCompact.length).toBeGreaterThan(0);
    expect(settings.hooks.PostCompact[0].matcher).toBe('auto');
  });

  it('settings.json contains SessionStart compact hook', () => {
    const tmpDir = makeTmpDir();
    execSync(`bash "${SCRIPT}" --lang=en "${tmpDir}"`, {
      encoding: 'utf8',
      timeout: 30000,
    });

    const settings = JSON.parse(
      fs.readFileSync(path.join(tmpDir, '.claude', 'settings.json'), 'utf8'),
    );
    const sessionStartHooks = settings.hooks.SessionStart;
    expect(sessionStartHooks).toBeDefined();
    const compactHook = sessionStartHooks.find((h) => h.matcher === 'compact');
    expect(compactHook).toBeDefined();
  });

  it('settings.json contains PreToolUse security hooks', () => {
    const tmpDir = makeTmpDir();
    execSync(`bash "${SCRIPT}" --lang=en "${tmpDir}"`, {
      encoding: 'utf8',
      timeout: 30000,
    });

    const settings = JSON.parse(
      fs.readFileSync(path.join(tmpDir, '.claude', 'settings.json'), 'utf8'),
    );
    const preToolUse = settings.hooks.PreToolUse;
    expect(preToolUse).toBeDefined();

    const editHook = preToolUse.find((h) => h.matcher === 'Edit');
    expect(editHook).toBeDefined();

    const writeHook = preToolUse.find((h) => h.matcher === 'Write');
    expect(writeHook).toBeDefined();
  });

  it('installs settings.local.json with consolidated permissions', () => {
    const tmpDir = makeTmpDir();
    execSync(`bash "${SCRIPT}" --lang=en "${tmpDir}"`, {
      encoding: 'utf8',
      timeout: 30000,
    });

    const localSettingsPath = path.join(tmpDir, '.claude', 'settings.local.json');
    expect(fs.existsSync(localSettingsPath)).toBe(true);

    const localSettings = JSON.parse(fs.readFileSync(localSettingsPath, 'utf8'));
    expect(localSettings.permissions).toBeDefined();
    expect(localSettings.permissions.allow).toBeDefined();
    expect(localSettings.permissions.allow.length).toBeGreaterThan(10);

    // Verify wildcard patterns
    expect(localSettings.permissions.allow).toContain('Bash(git:*)');
    expect(localSettings.permissions.allow).toContain('Bash(npm:*)');
    expect(localSettings.permissions.allow).toContain('Bash(docker:*)');
    expect(localSettings.permissions.allow).toContain('WebSearch');
  });

  it('does not overwrite existing .claudeignore', () => {
    const tmpDir = makeTmpDir();
    const claudeignore = path.join(tmpDir, '.claudeignore');

    // Create a custom .claudeignore first
    fs.writeFileSync(claudeignore, '# custom\nmy-dir/\n');

    execSync(`bash "${SCRIPT}" --lang=en "${tmpDir}"`, {
      encoding: 'utf8',
      timeout: 30000,
    });

    const content = fs.readFileSync(claudeignore, 'utf8');
    expect(content).toContain('# custom');
    expect(content).toContain('my-dir/');
  });

  it('does not overwrite existing settings.json without --force', () => {
    const tmpDir = makeTmpDir();
    const settingsPath = path.join(tmpDir, '.claude', 'settings.json');

    fs.mkdirSync(path.join(tmpDir, '.claude'), { recursive: true });
    fs.writeFileSync(settingsPath, '{"custom": true}');

    execSync(`bash "${SCRIPT}" --lang=en "${tmpDir}"`, {
      encoding: 'utf8',
      timeout: 30000,
    });

    const settings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
    expect(settings.custom).toBe(true);
  });

  it('overwrites settings.json with --force', () => {
    const tmpDir = makeTmpDir();
    const settingsPath = path.join(tmpDir, '.claude', 'settings.json');

    fs.mkdirSync(path.join(tmpDir, '.claude'), { recursive: true });
    fs.writeFileSync(settingsPath, '{"custom": true}');

    execSync(`bash "${SCRIPT}" --force --lang=en "${tmpDir}"`, {
      encoding: 'utf8',
      timeout: 30000,
    });

    const settings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
    expect(settings.env).toBeDefined();
    expect(settings.custom).toBeUndefined();
  });

  it('does not overwrite existing settings.local.json', () => {
    const tmpDir = makeTmpDir();
    const localPath = path.join(tmpDir, '.claude', 'settings.local.json');

    fs.mkdirSync(path.join(tmpDir, '.claude'), { recursive: true });
    fs.writeFileSync(localPath, '{"my": "config"}');

    execSync(`bash "${SCRIPT}" --lang=en "${tmpDir}"`, {
      encoding: 'utf8',
      timeout: 30000,
    });

    const content = JSON.parse(fs.readFileSync(localPath, 'utf8'));
    expect(content.my).toBe('config');
  });

  it('dry-run does not create config files', () => {
    const tmpDir = makeTmpDir();
    execSync(`bash "${SCRIPT}" --dry-run --lang=en "${tmpDir}"`, {
      encoding: 'utf8',
      timeout: 30000,
    });

    expect(fs.existsSync(path.join(tmpDir, '.claudeignore'))).toBe(false);
    expect(fs.existsSync(path.join(tmpDir, '.claude', 'settings.json'))).toBe(false);
    expect(fs.existsSync(path.join(tmpDir, '.claude', 'settings.local.json'))).toBe(false);
  });
});
