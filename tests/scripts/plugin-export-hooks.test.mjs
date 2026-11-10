import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { spawnSync } from 'child_process';
import fs from 'fs';
import path from 'path';

// Export plugin : hooks.json dérivé de hooks.default.json, les commandes pointent vers
// ${CLAUDE_PLUGIN_ROOT}/hooks/scripts/ et chaque script cité est bien copié.
const PROJECT_ROOT = path.resolve(import.meta.dirname, '../..');
const SCRIPT = path.join(PROJECT_ROOT, 'Tools/PluginExport/export-plugin.sh');
const OUT = path.join(PROJECT_ROOT, '.test-tmp', 'plugin-export');
const PLUGIN = path.join(OUT, 'claude-craft-common');

let hooksJson;
beforeAll(() => {
  fs.rmSync(OUT, { recursive: true, force: true });
  const r = spawnSync('bash', [SCRIPT, '--tech=common', '--lang=en', OUT], { encoding: 'utf8' });
  expect(r.status, r.stderr).toBe(0);
  hooksJson = JSON.parse(fs.readFileSync(path.join(PLUGIN, 'hooks/hooks.json'), 'utf8'));
});
afterAll(() => fs.rmSync(OUT, { recursive: true, force: true }));

const commands = () =>
  Object.values(hooksJson.hooks).flatMap((groups) => groups.flatMap((g) => g.hooks.map((h) => h.command)));

describe('export-plugin.sh : hooks du plugin', { timeout: 60000 }, () => {
  it('reprend les hooks du profil default (schéma imbriqué)', () => {
    const events = Object.keys(hooksJson.hooks);
    expect(events).toEqual(expect.arrayContaining(['PreToolUse', 'PostToolUse', 'PreCompact', 'SessionStart']));
    for (const groups of Object.values(hooksJson.hooks)) {
      for (const g of groups) expect(Array.isArray(g.hooks)).toBe(true);
    }
  });

  it('chaque script cité existe dans le plugin, via ${CLAUDE_PLUGIN_ROOT}', () => {
    const scripts = commands().flatMap((c) =>
      [...c.matchAll(/\$\{CLAUDE_PLUGIN_ROOT\}\/(hooks\/scripts\/[\w./-]+\.sh)/g)].map((m) => m[1])
    );
    expect(scripts.length).toBeGreaterThan(3);
    for (const s of scripts) expect(fs.existsSync(path.join(PLUGIN, s)), s).toBe(true);
  });

  it("aucune commande ne pointe vers le projet de l'utilisateur", () => {
    for (const c of commands()) expect(c).not.toMatch(/\.claude\/hooks\//);
  });

  it('la bibliothèque est copiée et un script exporté fonctionne', () => {
    expect(fs.existsSync(path.join(PLUGIN, 'hooks/scripts/lib/hook-io.sh'))).toBe(true);
    const r = spawnSync('bash', [path.join(PLUGIN, 'hooks/scripts/block-dangerous-commands.sh')], {
      input: JSON.stringify({ tool_input: { command: 'rm -rf /' } }),
      encoding: 'utf8',
    });
    expect(r.status).toBe(2);
  });
});
