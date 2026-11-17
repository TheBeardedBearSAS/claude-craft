import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { TECH_REGISTRY } from '../../cli/lib/tech-registry.js';

// Commands are published as /bear-<ns>:<cmd> in every channel (CLI install and plugins):
// no tracked file may still cite a command under its pre-10.0 name /<ns>:<cmd>.
const ROOT = path.resolve(import.meta.dirname, '../..');
const NS = [
  'common',
  'workflow',
  'team',
  'qa',
  'uiux',
  'gate',
  'project',
  ...Object.keys(TECH_REGISTRY).filter((k) => TECH_REGISTRY[k].tier !== null),
  // infra namespaces are plugins too (bear-docker, bear-kubernetes, …)
  'docker',
  'coolify',
  'kubernetes',
  'opentofu',
  'ansible',
  'hcloud',
  'pgbouncer',
  'frankenphp',
];
// History keeps the names of its time.
const HISTORY =
  /^(CHANGELOG\.md|docs\/CHANGELOG-archive\.md|docs\/audits?\/|docs\/security\/audit-2026-|docs\/marketing\/|docs\/internal\/|RESEARCH_|SEO_AUDIT_|COMMUNITY_SIGNALS_|docs\/MIGRATION-v(4|6|7|7-to-v8|9)\.md|config\/removed-commands\.yaml|package-lock\.json)/;
const RE = new RegExp(String.raw`(^|[\s\x60'"(\[|>])/(${NS.join('|')}):[A-Za-z*]`);

const tracked = () =>
  execFileSync('git', ['-c', 'safe.directory=*', 'ls-files', '-z'], { cwd: ROOT, encoding: 'utf8', maxBuffer: 1 << 28 })
    .split('\0')
    .filter(Boolean);

describe('slash references use the bear- prefix', () => {
  it('no non-history file cites /<ns>:<cmd> for a published namespace', () => {
    const offenders = [];
    for (const rel of tracked()) {
      const file = path.join(ROOT, rel);
      if (HISTORY.test(rel) || !fs.existsSync(file)) continue;
      const buf = fs.readFileSync(file);
      if (buf.includes(0)) continue;
      buf
        .toString('utf8')
        .split('\n')
        .forEach((line, i) => {
          if (RE.test(line)) offenders.push(`${rel}:${i + 1}`);
        });
    }
    expect(offenders.slice(0, 20)).toEqual([]);
  });
});
