import { describe, it, expect } from 'vitest';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const PROJECT_ROOT = path.resolve(import.meta.dirname, '../..');
const I18N_DIR = path.join(PROJECT_ROOT, 'Dev/i18n');
const BASE_HOOKS_DIR = path.join(I18N_DIR, 'base/Common/hooks/scripts');
const LANG_HOOKS_DIR = path.join(I18N_DIR, 'en/Common/hooks/scripts');

const HOOK_SCRIPTS = [
  'pre-commit-check.sh',
  'notify-slack.sh',
  'post-tool-failure.sh',
  'post-edit-lint.sh',
  'quality-gate.sh',
  'session-init.sh',
  'session-end.sh',
  'pre-compact.sh',
  'block-dangerous-commands.sh',
];

// Resolve a hook script from lang or base (overlay pattern)
function resolveHookPath(script) {
  const langPath = path.join(LANG_HOOKS_DIR, script);
  if (fs.existsSync(langPath)) return langPath;
  const basePath = path.join(BASE_HOOKS_DIR, script);
  if (fs.existsSync(basePath)) return basePath;
  return null;
}

describe('hook scripts', { timeout: 30000 }, () => {
  it('all hook scripts exist in base or lang', () => {
    for (const script of HOOK_SCRIPTS) {
      const resolved = resolveHookPath(script);
      expect(resolved, `Missing: ${script} (checked base/ and en/)`).not.toBeNull();
    }
  });

  it.each(HOOK_SCRIPTS)('%s has proper shebang', (script) => {
    const scriptPath = resolveHookPath(script);
    if (!scriptPath) return; // Skip if not found (caught by existence test)
    const content = fs.readFileSync(scriptPath, 'utf8');
    const firstLine = content.split('\n')[0];
    expect(
      firstLine.startsWith('#!/bin/bash') ||
        firstLine.startsWith('#!/usr/bin/env bash'),
      `${script} shebang is: ${firstLine}`,
    ).toBe(true);
  });

  it.each(HOOK_SCRIPTS)('%s passes bash syntax check', (script) => {
    const scriptPath = resolveHookPath(script);
    if (!scriptPath) return;
    const result = execSync(`bash -n "${scriptPath}" 2>&1`, {
      encoding: 'utf8',
      timeout: 10000,
    });
    expect(result.trim()).toBe('');
  });

  it.each(HOOK_SCRIPTS)('%s uses strict mode', (script) => {
    const scriptPath = resolveHookPath(script);
    if (!scriptPath) return;
    const content = fs.readFileSync(scriptPath, 'utf8');
    const usesStrict =
      content.includes('set -euo pipefail') || content.includes('set -e');
    expect(usesStrict, `${script} does not use strict mode`).toBe(true);
  });
});
