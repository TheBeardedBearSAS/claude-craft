import { describe, it, expect } from 'vitest';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const PROJECT_ROOT = path.resolve(import.meta.dirname, '../..');
const BASE_HOOKS_DIR = path.join(PROJECT_ROOT, 'Dev/i18n/base/Common/hooks/scripts');
const RALPH_HOOKS_DIR = path.join(PROJECT_ROOT, 'Tools/Ralph/hooks');

// Source unique : tous les scripts de hooks vivent dans base/ (aucune copie par langue).
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
  'guard-network.sh',
  'protect-sensitive-files.sh',
  'output-size-hint.sh',
  'output-filter.sh',
].map((s) => [s, path.join(BASE_HOOKS_DIR, s)]);

const walk = (dir) =>
  fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name);
    return e.isDirectory() ? walk(p) : p.endsWith('.sh') ? [p] : [];
  });

describe('hook scripts', { timeout: 30000 }, () => {
  it('aucune copie par langue des scripts de hooks', () => {
    const i18n = path.join(PROJECT_ROOT, 'Dev/i18n');
    for (const lang of fs.readdirSync(i18n).filter((l) => l !== 'base')) {
      const dir = path.join(i18n, lang, 'Common/hooks/scripts');
      expect(fs.existsSync(dir) ? fs.readdirSync(dir) : [], `${lang} garde des scripts`).toEqual([]);
    }
  });

  it.each(HOOK_SCRIPTS)('%s existe dans base/', (_s, scriptPath) => {
    expect(fs.existsSync(scriptPath)).toBe(true);
  });

  it.each(HOOK_SCRIPTS)('%s has proper shebang', (script, scriptPath) => {
    const firstLine = fs.readFileSync(scriptPath, 'utf8').split('\n')[0];
    expect(
      firstLine.startsWith('#!/bin/bash') || firstLine.startsWith('#!/usr/bin/env bash'),
      `${script} shebang is: ${firstLine}`
    ).toBe(true);
  });

  it.each(HOOK_SCRIPTS)('%s passes bash syntax check', (_s, scriptPath) => {
    const result = execSync(`bash -n "${scriptPath}" 2>&1`, { encoding: 'utf8', timeout: 10000 });
    expect(result.trim()).toBe('');
  });

  it.each(HOOK_SCRIPTS)('%s uses strict mode', (script, scriptPath) => {
    const content = fs.readFileSync(scriptPath, 'utf8');
    // Les hooks qui sourcent lib/hook-io.sh utilisent `set -u` sans `set -e` : un
    // jq défaillant ne doit pas les faire mourir (les gardes échouent fermé via
    // hook_require_parser, les hooks informatifs laissent passer).
    const usesStrict =
      content.includes('set -euo pipefail') ||
      content.includes('set -e') ||
      (content.includes('set -u') && content.includes('lib/hook-io.sh'));
    expect(usesStrict, `${script} does not use strict mode`).toBe(true);
  });
});

// Lint de portabilité : ces scripts tournent chez l'utilisateur (macOS/BSD, busybox,
// dash) — pas d'extensions GNU, et les sorties doivent respecter le contrat Claude Code.
const PORTABILITY_RULES = [
  ['grep -P (PCRE, absent de BSD/busybox)', /\bgrep\b[^|;&\n]*\s-[a-zA-Z]*P/],
  ['date -I (GNU seulement)', /\bdate\b[^|;&\n]*\s-I/],
  ['sed -i (syntaxe différente sous BSD)', /\bsed\s+(?:-\S+\s+)*-[a-zA-Z]*i/],
  ['sha1sum (absent de macOS)', /\bsha1sum\b/],
  ['xargs -r (GNU seulement)', /\bxargs\s+(?:-\S+\s+)*-r\b/],
  ['\\s ou \\b dans un motif grep -E', /\bgrep\s+(?:-\S*E\S*|-\S+\s+-\S*E\S*)[^|;&\n]*\\[sSbBwWdD]/],
  ['additionalContext hors hookSpecificOutput', /^(?!.*hookSpecificOutput).*additionalContext/],
  ['$TOOL_INPUT / $TOOL_OUTPUT (non définies)', /\$\{?TOOL_(INPUT|OUTPUT)\b/],
];
const LINT_FILES = [...walk(BASE_HOOKS_DIR), ...walk(RALPH_HOOKS_DIR)].map((f) => [path.relative(PROJECT_ROOT, f), f]);

describe('portabilité des scripts de hooks', () => {
  it('le lint couvre les scripts base et Ralph', () => {
    const names = LINT_FILES.map(([rel]) => rel);
    expect(names.some((n) => n.includes('base/Common/hooks/scripts/lib/hook-io.sh'))).toBe(true);
    expect(names.some((n) => n.startsWith('Tools/Ralph/hooks/'))).toBe(true);
  });

  it('chaque règle détecte bien son contre-exemple', () => {
    const bad = [
      'grep -oP "a" f',
      'date -Iseconds',
      'sed -i s/a/b/ f',
      'echo x | sha1sum',
      'ls | xargs -r rm',
      "grep -qE '\\bfoo' f",
      'echo \'{"additionalContext": "x"}\'',
      'echo $TOOL_INPUT',
    ];
    PORTABILITY_RULES.forEach(([label, re], i) => expect(re.test(bad[i]), label).toBe(true));
  });

  it.each(LINT_FILES)('%s', (_rel, file) => {
    const code = fs
      .readFileSync(file, 'utf8')
      .split('\n')
      .map((l, i) => [i + 1, l])
      .filter(([, l]) => !/^\s*#/.test(l));
    const offences = PORTABILITY_RULES.flatMap(([label, re]) =>
      code.filter(([, l]) => re.test(l)).map(([n, l]) => `${label} — l.${n}: ${l.trim()}`)
    );
    expect(offences).toEqual([]);
  });
});
