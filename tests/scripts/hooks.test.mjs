import { describe, it, expect } from 'vitest';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const PROJECT_ROOT = path.resolve(import.meta.dirname, '../..');
const HOOKS_DIR = path.join(
  PROJECT_ROOT,
  'Dev/i18n/en/Common/hooks/scripts',
);

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

describe('hook scripts', { timeout: 30000 }, () => {
  it('all hook scripts exist', () => {
    for (const script of HOOK_SCRIPTS) {
      const scriptPath = path.join(HOOKS_DIR, script);
      expect(fs.existsSync(scriptPath), `Missing: ${script}`).toBe(true);
    }
  });

  it.each(HOOK_SCRIPTS)('%s has proper shebang', (script) => {
    const scriptPath = path.join(HOOKS_DIR, script);
    const content = fs.readFileSync(scriptPath, 'utf8');
    const firstLine = content.split('\n')[0];
    expect(
      firstLine.startsWith('#!/bin/bash') ||
        firstLine.startsWith('#!/usr/bin/env bash'),
      `${script} shebang is: ${firstLine}`,
    ).toBe(true);
  });

  it.each(HOOK_SCRIPTS)('%s passes bash syntax check', (script) => {
    const scriptPath = path.join(HOOKS_DIR, script);
    const result = execSync(`bash -n "${scriptPath}" 2>&1`, {
      encoding: 'utf8',
      timeout: 10000,
    });
    expect(result.trim()).toBe('');
  });

  it.each(HOOK_SCRIPTS)('%s uses strict mode', (script) => {
    const scriptPath = path.join(HOOKS_DIR, script);
    const content = fs.readFileSync(scriptPath, 'utf8');
    const usesStrict =
      content.includes('set -euo pipefail') || content.includes('set -e');
    expect(usesStrict, `${script} does not use strict mode`).toBe(true);
  });
});
