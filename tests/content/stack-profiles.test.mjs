import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { TECH_REGISTRY } from '../../cli/lib/tech-registry.js';

const PROJECT_ROOT = path.resolve(import.meta.dirname, '../..');
const PROFILES_DIR = path.join(PROJECT_ROOT, 'Dev/stack-profiles');
const INFRA_TECHS = ['kubernetes', 'opentofu', 'ansible', 'hcloud', 'pgbouncer', 'frankenphp'];
const TECHS = [...Object.keys(TECH_REGISTRY), ...INFRA_TECHS];

describe('Dev/stack-profiles', () => {
  it.each(TECHS)('%s has a stack.txt with a display name and a components line', (tech) => {
    const stackFile = path.join(PROFILES_DIR, tech, 'stack.txt');
    expect(fs.existsSync(stackFile)).toBe(true);

    const [name, components] = fs.readFileSync(stackFile, 'utf8').split('\n');
    expect(name.trim()).not.toBe('');
    expect(components.trim()).not.toBe('');
  });

  it.each(TECHS)('%s permissions.txt holds only Claude Code permission rules', (tech) => {
    const permFile = path.join(PROFILES_DIR, tech, 'permissions.txt');
    if (!fs.existsSync(permFile)) return;

    const rules = fs.readFileSync(permFile, 'utf8').split('\n').filter(Boolean);
    for (const rule of rules) {
      expect(rule).toMatch(/^Bash\([^"\\]+\)$/);
    }
  });
});
