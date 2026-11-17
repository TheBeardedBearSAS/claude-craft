import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import * as yaml from 'js-yaml';
import { TECH_REGISTRY } from '../../cli/lib/tech-registry.js';

// Distribution « un plugin Claude Code par namespace » en 5 langues : le générateur lance les vrais
// installeurs, remodèle leur sortie et garantit que chaque plugin est autonome.
const ROOT = path.resolve(import.meta.dirname, '../..');
const SCRIPT = path.join(ROOT, 'scripts/generate-plugins.mjs');
const TMP = path.join(ROOT, '.test-tmp', 'generate-plugins-test');
const GEN_A = path.join(TMP, 'a');
const GEN_B = path.join(TMP, 'b');
const COMMITTED = path.join(ROOT, 'marketplaces');
const MARKETPLACE = path.join(ROOT, '.claude-plugin', 'marketplace.json');

const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
const versions = yaml.load(fs.readFileSync(path.join(ROOT, 'config/versions.yaml'), 'utf8'));

const LANGS = ['en', 'fr', 'es', 'de', 'pt'];
const FIXED = ['common', 'workflow', 'team', 'qa', 'uiux', 'gate', 'project'];
const INFRA = ['docker', 'coolify', 'kubernetes', 'opentofu', 'ansible', 'hcloud', 'pgbouncer', 'frankenphp'];
const HOOKS = ['hooks', 'hooks-full', 'hooks-memory'];
const STACKS = Object.entries(TECH_REGISTRY)
  .filter(([, e]) => e.tier !== null)
  .map(([k]) => k);
const EXPECTED = [...new Set([...FIXED, ...STACKS, ...INFRA, ...HOOKS])].sort();

const run = (...args) => spawnSync(process.execPath, [SCRIPT, ...args], { cwd: ROOT, encoding: 'utf8' });

const walk = (dir, base = dir) =>
  fs.readdirSync(dir, { withFileTypes: true }).flatMap((d) => {
    const p = path.join(dir, d.name);
    return d.isDirectory() ? walk(p, base) : [path.relative(base, p)];
  });

const readJson = (p) => JSON.parse(fs.readFileSync(p, 'utf8'));
const subdirs = (dir) =>
  fs
    .readdirSync(dir, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
    .sort();
const pluginDir = (root, lang, name) => path.join(root, lang, 'plugins', `bear-${name}`);
const marketName = (lang) => (lang === 'en' ? 'bear-craft' : `bear-craft-${lang}`);

beforeAll(() => {
  fs.rmSync(TMP, { recursive: true, force: true });
  fs.mkdirSync(TMP, { recursive: true });
  for (const out of [GEN_A, GEN_B]) {
    const r = run('--all-langs', '--out', out);
    expect(r.status, r.stderr + r.stdout).toBe(0);
  }
}, 600_000);
afterAll(() => fs.rmSync(TMP, { recursive: true, force: true }));

describe('generate-plugins : plugins produits', () => {
  it('produit les mêmes plugins (commandes, stacks, infra, hooks) dans les 5 langues', () => {
    expect(subdirs(GEN_A)).toEqual([...LANGS].sort());
    for (const lang of LANGS) {
      expect(subdirs(path.join(GEN_A, lang, 'plugins')), lang).toEqual(EXPECTED.map((n) => `bear-${n}`));
    }
  });

  it('chaque manifeste porte les champs requis (version = package.json, engines = minimum)', () => {
    for (const lang of LANGS) {
      for (const name of EXPECTED) {
        const m = readJson(path.join(pluginDir(GEN_A, lang, name), '.claude-plugin/plugin.json'));
        expect(m.name, name).toBe(`bear-${name}`);
        expect(m.displayName, name).toMatch(/^Bear Craft — /);
        expect(m.description.length, name).toBeGreaterThan(20);
        expect(m.version, name).toBe(pkg.version);
        expect(m.author).toEqual({ name: 'The Bearded Bear', url: 'https://the-bearded-bear.com' });
        expect(m.repository).toBe('https://github.com/TheBeardedBearSAS/bear-craft');
        expect(m.homepage).toBe('https://github.com/TheBeardedBearSAS/bear-craft');
        expect(m.license).toBe('MIT');
        expect(m.engines).toEqual({ 'claude-code': `>=${versions.claudeCode.minimum}` });
      }
    }
  });

  it('chaque plugin a LICENSE, README (installation depuis la marketplace) et icône', () => {
    for (const name of EXPECTED) {
      const dir = pluginDir(GEN_A, 'en', name);
      expect(fs.existsSync(path.join(dir, 'LICENSE')), name).toBe(true);
      expect(fs.existsSync(path.join(dir, '.claude-plugin/icon.png')), name).toBe(true);
      const readme = fs.readFileSync(path.join(dir, 'README.md'), 'utf8');
      expect(readme.split(/\s+/).length, name).toBeGreaterThanOrEqual(40);
      expect(readme).toContain('/plugin marketplace add TheBeardedBearSAS/bear-craft');
      expect(readme).toContain(`/plugin install bear-${name}@bear-craft`);
    }
  });

  it('les commandes gardent leur nom de namespace (bear-react → /bear-react:check)', () => {
    for (const lang of LANGS) {
      expect(fs.existsSync(path.join(pluginDir(GEN_A, lang, 'react'), 'commands/check.md')), lang).toBe(true);
      expect(fs.existsSync(path.join(pluginDir(GEN_A, lang, 'workflow'), 'commands/init.md')), lang).toBe(true);
    }
    expect(fs.existsSync(path.join(pluginDir(GEN_A, 'en', 'react'), 'agents/react-reviewer.md'))).toBe(true);
    expect(fs.existsSync(path.join(pluginDir(GEN_A, 'en', 'common'), 'agents/tdd-coach.md'))).toBe(true);
  });

  it('la langue change le contenu (fr ≠ en) sans changer les noms', () => {
    const fr = fs.readFileSync(path.join(pluginDir(GEN_A, 'fr', 'workflow'), 'commands/init.md'), 'utf8');
    const en = fs.readFileSync(path.join(pluginDir(GEN_A, 'en', 'workflow'), 'commands/init.md'), 'utf8');
    expect(fr).not.toBe(en);
  });
});

describe('generate-plugins : infra', () => {
  it('chaque namespace infra est un plugin bear-<ns> dont les commandes ne répètent pas le préfixe', () => {
    for (const ns of INFRA) {
      const cmds = fs.readdirSync(path.join(pluginDir(GEN_A, 'en', ns), 'commands'));
      expect(cmds.length, ns).toBeGreaterThanOrEqual(4);
      for (const c of cmds) expect(c, `${ns}/${c}`).not.toMatch(new RegExp(`^${ns}-`));
    }
    expect(fs.existsSync(path.join(pluginDir(GEN_A, 'en', 'docker'), 'commands/architecture.md'))).toBe(true);
    expect(fs.existsSync(path.join(pluginDir(GEN_A, 'de', 'coolify'), 'commands/setup.md'))).toBe(true);
  });

  it('les agents infra sont dans le plugin infra', () => {
    expect(fs.readdirSync(path.join(pluginDir(GEN_A, 'en', 'docker'), 'agents')).length).toBeGreaterThanOrEqual(4);
  });
});

describe('generate-plugins : autonomie des plugins', () => {
  it('chaque ${CLAUDE_PLUGIN_ROOT}/<chemin> cité existe dans le même plugin (5 langues)', () => {
    let seen = 0;
    for (const lang of LANGS) {
      for (const name of EXPECTED) {
        const dir = pluginDir(GEN_A, lang, name);
        for (const file of walk(dir)) {
          if (/\.(png|ico)$/.test(file)) continue;
          const text = fs.readFileSync(path.join(dir, file), 'utf8');
          for (const m of text.matchAll(/\$\{CLAUDE_PLUGIN_ROOT\}\/([A-Za-z0-9_./-]*[A-Za-z0-9_])/g)) {
            seen += 1;
            expect(fs.existsSync(path.join(dir, m[1])), `${lang}/${name}/${file} → ${m[1]}`).toBe(true);
          }
        }
      }
    }
    expect(seen).toBeGreaterThan(250);
  });

  it("aucune référence .claude/(rules|references|templates|checklists|skills|agents) résolue n'est laissée telle quelle", () => {
    // Une référence non résolue est tolérée (rapportée), mais jamais une référence dont la cible existe dans le plugin.
    for (const name of EXPECTED) {
      const dir = pluginDir(GEN_A, 'en', name);
      for (const file of walk(dir).filter((f) => f.endsWith('.md'))) {
        const text = fs.readFileSync(path.join(dir, file), 'utf8');
        for (const m of text.matchAll(
          /(?<![\w~$}-])\.claude\/((?:rules|references|templates|checklists|skills|agents)\/[A-Za-z0-9_./-]*[A-Za-z0-9_])/g
        )) {
          const target = path.join(dir, m[1]);
          const isFile = fs.existsSync(target) && fs.statSync(target).isFile();
          expect(isFile, `${name}/${file} cite encore .claude/${m[1]}`).toBe(false);
        }
      }
    }
  });

  it('aucun stub déprécié (deprecated: true) ni commande retirée/programmée', () => {
    const removed = yaml.load(fs.readFileSync(path.join(ROOT, 'config/removed-commands.yaml'), 'utf8'));
    const listed = new Set([...(removed.removed ?? []), ...Object.keys(removed.scheduled ?? {})]);
    for (const name of EXPECTED) {
      const cmdDir = path.join(pluginDir(GEN_A, 'en', name), 'commands');
      if (!fs.existsSync(cmdDir)) continue;
      for (const f of fs.readdirSync(cmdDir)) {
        const text = fs.readFileSync(path.join(cmdDir, f), 'utf8');
        expect(text, `${name}/${f}`).not.toMatch(/^deprecated:\s*true\s*$/m);
        expect(listed.has(`${name}/${f}`), `${name}/${f}`).toBe(false);
      }
    }
    expect(fs.existsSync(path.join(pluginDir(GEN_A, 'en', 'react'), 'commands/check-security.md'))).toBe(false);
  });
});

describe('generate-plugins : références slash préfixées', () => {
  const NS = new RegExp(String.raw`(^|[\s\`'"(\[|>])/(${[...FIXED, ...STACKS, ...INFRA].join('|')}):[A-Za-z*]`, 'm');

  it('aucune référence /<ns>: non préfixée ne subsiste pour un namespace généré', () => {
    for (const name of EXPECTED) {
      const dir = pluginDir(GEN_A, 'en', name);
      for (const file of walk(dir).filter((f) => /\.(md|json|ya?ml|txt|template)$/.test(f))) {
        const text = fs.readFileSync(path.join(dir, file), 'utf8');
        for (const line of text.split('\n')) expect(line, `${name}/${file}`).not.toMatch(NS);
      }
    }
  });

  it('cite les commandes préfixées (/bear-workflow:plan, /bear-react:check, /bear-docker:architecture)', () => {
    const texts = EXPECTED.flatMap((n) => {
      const dir = pluginDir(GEN_A, 'en', n);
      return walk(dir)
        .filter((f) => f.endsWith('.md'))
        .map((f) => fs.readFileSync(path.join(dir, f), 'utf8'));
    });
    for (const needle of ['/bear-workflow:plan', '/bear-react:check', '/bear-docker:architecture']) {
      expect(
        texts.some((t) => t.includes(needle)),
        needle
      ).toBe(true);
    }
  });
});

describe('generate-plugins : plugins de hooks (bear-hooks*, jamais bear-common)', () => {
  const hooksOf = (name, lang = 'en') => readJson(path.join(pluginDir(GEN_A, lang, name), 'hooks/hooks.json')).hooks;
  const commandsOf = (hooks) => Object.values(hooks).flatMap((groups) => groups.flatMap((g) => g.hooks));

  it('bear-common ne porte plus de hooks', () => {
    expect(fs.existsSync(path.join(pluginDir(GEN_A, 'en', 'common'), 'hooks'))).toBe(false);
  });

  it('bear-hooks : profil default, gardes onFailure block, scripts + lib embarqués', () => {
    const cmds = commandsOf(hooksOf('hooks'));
    expect(cmds.filter((h) => h.onFailure === 'block').length).toBeGreaterThanOrEqual(3);
    for (const h of cmds) expect(h.command).not.toContain('$CLAUDE_PROJECT_DIR/.claude/hooks/');
    expect(JSON.stringify(hooksOf('hooks'))).toContain('${CLAUDE_PLUGIN_ROOT}/hooks/scripts/guard-network.sh');
    expect(fs.existsSync(path.join(pluginDir(GEN_A, 'en', 'hooks'), 'hooks/scripts/lib/hook-io.sh'))).toBe(true);
  });

  it('bear-hooks-full : uniquement le delta de full, sans les scripts de default', () => {
    const events = Object.keys(hooksOf('hooks-full'));
    expect(events).toEqual(expect.arrayContaining(['Stop', 'SessionEnd', 'Notification']));
    expect(JSON.stringify(hooksOf('hooks-full'))).not.toContain('guard-network');
    const scripts = fs.readdirSync(path.join(pluginDir(GEN_A, 'en', 'hooks-full'), 'hooks/scripts'));
    expect(scripts).toEqual(expect.arrayContaining(['quality-gate.sh', 'lib']));
    expect(scripts).not.toContain('guard-network.sh');
  });

  it('bear-hooks-memory : fragment memory et scripts memory-lifecycle', () => {
    expect(JSON.stringify(hooksOf('hooks-memory'))).toContain(
      '${CLAUDE_PLUGIN_ROOT}/hooks/scripts/memory-lifecycle/session-start.sh'
    );
    const dir = path.join(pluginDir(GEN_A, 'en', 'hooks-memory'), 'hooks/scripts/memory-lifecycle');
    expect(fs.readdirSync(dir)).toEqual(expect.arrayContaining(['_db.sh', 'session-start.sh']));
  });

  it('chaque plugin de hooks documente ses dépendances', () => {
    expect(fs.readFileSync(path.join(pluginDir(GEN_A, 'en', 'hooks'), 'README.md'), 'utf8')).toMatch(/`jq` or `node`/);
    expect(fs.readFileSync(path.join(pluginDir(GEN_A, 'en', 'hooks-memory'), 'README.md'), 'utf8')).toMatch(
      /`sqlite3`/
    );
  });

  it('un script de hook généré bloque une commande destructrice (exécuté depuis le plugin)', () => {
    const r = spawnSync(
      'bash',
      [path.join(pluginDir(GEN_A, 'en', 'hooks'), 'hooks/scripts/block-dangerous-commands.sh')],
      {
        input: JSON.stringify({ tool_input: { command: 'rm -rf /' } }),
        encoding: 'utf8',
      }
    );
    expect(r.status).toBe(2);
    expect(r.stderr).toMatch(/BLOCKED/);
  });

  it("aucun autre plugin n'embarque de hooks", () => {
    for (const name of EXPECTED.filter((n) => !HOOKS.includes(n))) {
      expect(fs.existsSync(path.join(pluginDir(GEN_A, 'en', name), 'hooks')), name).toBe(false);
    }
  });
});

describe('generate-plugins : déterminisme et mode --check', () => {
  it('deux générations successives sont identiques (5 langues)', () => {
    expect(walk(GEN_A).sort()).toEqual(walk(GEN_B).sort());
    for (const f of walk(GEN_A)) {
      expect(fs.readFileSync(path.join(GEN_A, f)).equals(fs.readFileSync(path.join(GEN_B, f))), f).toBe(true);
    }
  });

  it('--lang=fr ne génère que fr et vide sa sortie (un fichier orphelin disparaît)', () => {
    const out = path.join(TMP, 'single');
    const orphan = path.join(out, 'fr', 'plugins', 'bear-react', 'orphan.md');
    fs.mkdirSync(path.dirname(orphan), { recursive: true });
    fs.writeFileSync(orphan, 'x');
    const r = run('--lang=fr', '--out', out);
    expect(r.status, r.stderr).toBe(0);
    expect(fs.existsSync(orphan)).toBe(false);
    expect(subdirs(out)).toEqual(['fr']);
  }, 120_000);

  it("--check passe sur l'arbre committé (5 langues)", () => {
    const r = run('--check', '--all-langs');
    expect(r.status, r.stderr + r.stdout).toBe(0);
  }, 300_000);

  it("--check échoue après modification d'un fichier généré", () => {
    const copy = path.join(TMP, 'drift-modified');
    fs.cpSync(COMMITTED, copy, { recursive: true });
    fs.appendFileSync(path.join(copy, 'fr/plugins/bear-react/commands/check.md'), '\nderive\n');
    const r = run('--check', '--all-langs', '--out', copy);
    expect(r.status).not.toBe(0);
    expect(r.stderr + r.stdout).toContain('fr/plugins/bear-react/commands/check.md');
  }, 300_000);

  it('--check échoue si un fichier en trop existe (sens inverse)', () => {
    const copy = path.join(TMP, 'drift-extra');
    fs.cpSync(COMMITTED, copy, { recursive: true });
    fs.writeFileSync(path.join(copy, 'de/plugins/bear-react/commands/extra.md'), 'en trop\n');
    const r = run('--check', '--all-langs', '--out', copy);
    expect(r.status).not.toBe(0);
    expect(r.stderr + r.stdout).toContain('de/plugins/bear-react/commands/extra.md');
  }, 300_000);
});

describe('marketplaces', () => {
  it('chaque langue a sa marketplace (bear-craft, bear-craft-fr, …) avec les mêmes plugins', () => {
    const en = readJson(path.join(COMMITTED, 'en/.claude-plugin/marketplace.json'));
    for (const lang of LANGS) {
      const market = readJson(path.join(COMMITTED, lang, '.claude-plugin/marketplace.json'));
      expect(market.name).toBe(marketName(lang));
      expect(market.plugins.map((p) => p.name)).toEqual(en.plugins.map((p) => p.name));
      expect(market.plugins.map((p) => p.name).sort()).toEqual(subdirs(path.join(COMMITTED, lang, 'plugins')));
      for (const p of market.plugins) {
        expect(p.source).toBe(`./plugins/${p.name}`);
        expect(p.version).toBe(pkg.version);
      }
    }
  });

  it('la marketplace racine est la marketplace anglaise, avec des sources ./marketplaces/en/plugins/…', () => {
    const market = readJson(MARKETPLACE);
    expect(market.name).toBe('bear-craft');
    expect(market.plugins.map((p) => p.name).sort()).toEqual(subdirs(path.join(COMMITTED, 'en/plugins')));
    for (const p of market.plugins) {
      expect(p.source).toBe(`./marketplaces/en/plugins/${p.name}`);
      expect(p.version).toBe(pkg.version);
    }
  });

  it('la racine ne porte plus de plugin.json ni d’icône, ni de dossier plugins/', () => {
    expect(fs.existsSync(path.join(ROOT, '.claude-plugin/plugin.json'))).toBe(false);
    expect(fs.existsSync(path.join(ROOT, '.claude-plugin/icon.png'))).toBe(false);
    expect(fs.existsSync(path.join(ROOT, 'plugins'))).toBe(false);
  });

  it('marketplaces/ est publié dans le paquet npm', () => {
    expect(pkg.files).toContain('marketplaces/');
  });
});
