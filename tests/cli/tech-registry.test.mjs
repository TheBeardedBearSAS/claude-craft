import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  TECH_REGISTRY,
  INSTALLABLE_TECHS,
  getDisplayName,
  getAllTechKeys,
  getTechsByTier,
  getBaseLayerTechsFor,
} from '../../cli/lib/tech-registry.js';
import { TECHNOLOGIES } from '../../cli/lib/constants.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, '../..');

describe('tech-registry', () => {
  it('exports TECH_REGISTRY with all expected keys', () => {
    const expectedKeys = [
      'symfony',
      'flutter',
      'react',
      'reactnative',
      'angular',
      'csharp',
      'laravel',
      'vuejs',
      'php',
      'python',
      'paperclip',
      'docker',
    ];
    for (const key of expectedKeys) {
      expect(TECH_REGISTRY).toHaveProperty(key);
    }
  });

  it('every entry has required fields', () => {
    for (const [key, entry] of Object.entries(TECH_REGISTRY)) {
      expect(entry.name, `${key}.name`).toBe(key);
      expect(entry.displayName, `${key}.displayName`).toBeTruthy();
      expect(entry.desc, `${key}.desc`).toBeTruthy();
      expect(entry.namespace, `${key}.namespace`).toBeTruthy();
      expect(entry.i18nDir, `${key}.i18nDir`).toBeTruthy();
      expect(entry.installScript, `${key}.installScript`).toBeTruthy();
      expect(entry.version, `${key}.version`).toBeTruthy();
    }
  });

  it('INSTALLABLE_TECHS excludes docker and base-layer techs (php)', () => {
    expect(INSTALLABLE_TECHS).not.toContain('docker');
    expect(INSTALLABLE_TECHS).not.toContain('php');
    expect(INSTALLABLE_TECHS.length).toBe(12);
  });

  it('getDisplayName returns correct value', () => {
    expect(getDisplayName('symfony')).toBe('Symfony / PHP');
    expect(getDisplayName('unknown')).toBe('unknown');
  });

  it('getAllTechKeys returns all keys including docker', () => {
    const keys = getAllTechKeys();
    expect(keys.length).toBe(15);
    expect(keys).toContain('docker');
  });
});

describe('tech-registry tiers', () => {
  it('every installable tech has a tier of 1, 2, or 3', () => {
    for (const tech of INSTALLABLE_TECHS) {
      const entry = TECH_REGISTRY[tech];
      expect([1, 2, 3], `${tech} should have tier 1, 2, or 3`).toContain(entry.tier);
    }
  });

  it('docker and coolify have tier null', () => {
    expect(TECH_REGISTRY.docker.tier).toBeNull();
    expect(TECH_REGISTRY.coolify.tier).toBeNull();
  });

  it('getTechsByTier(1) returns core techs', () => {
    const tier1 = getTechsByTier(1);
    expect(tier1.sort()).toEqual(['flutter', 'python', 'react', 'symfony']);
  });

  it('getTechsByTier(2) returns supported techs', () => {
    const tier2 = getTechsByTier(2);
    expect(tier2.sort()).toEqual(['paperclip', 'php', 'reactnative']);
  });

  it('getTechsByTier(3) returns community techs', () => {
    const tier3 = getTechsByTier(3);
    expect(tier3.sort()).toEqual(['angular', 'csharp', 'laravel', 'vercel', 'vite', 'vuejs']);
  });
});

describe('base-layer techs (php auto-include — audit DA-PM-03)', () => {
  it('php is flagged as a base layer for symfony and laravel', () => {
    expect(TECH_REGISTRY.php.baseLayer).toBe(true);
    expect(TECH_REGISTRY.php.baseLayerFor).toEqual(['symfony', 'laravel']);
  });

  it('php is not standalone-selectable', () => {
    expect(INSTALLABLE_TECHS).not.toContain('php');
    expect(TECHNOLOGIES).not.toHaveProperty('php');
  });

  it('selecting symfony pulls in php', () => {
    expect(getBaseLayerTechsFor(['symfony'])).toEqual(['php']);
  });

  it('selecting laravel pulls in php', () => {
    expect(getBaseLayerTechsFor(['laravel'])).toEqual(['php']);
  });

  it('non-PHP-framework selections do not pull in php', () => {
    expect(getBaseLayerTechsFor(['react', 'python'])).toEqual([]);
  });

  it('does not duplicate php when already selected', () => {
    expect(getBaseLayerTechsFor(['symfony', 'php'])).toEqual([]);
  });
});

describe('tech-registry consistency with constants.js', () => {
  it('every TECHNOLOGIES key exists in TECH_REGISTRY', () => {
    for (const key of Object.keys(TECHNOLOGIES)) {
      expect(TECH_REGISTRY, `Missing registry entry for ${key}`).toHaveProperty(key);
    }
  });

  it('every INSTALLABLE_TECHS key exists in TECHNOLOGIES (docker/coolify excluded)', () => {
    for (const key of INSTALLABLE_TECHS) {
      expect(TECHNOLOGIES, `Missing TECHNOLOGIES entry for ${key}`).toHaveProperty(key);
    }
    // docker and coolify are infra techs — excluded from the installation menu (audit CLI-02)
    expect(TECHNOLOGIES).not.toHaveProperty('docker');
    expect(TECHNOLOGIES).not.toHaveProperty('coolify');
  });

  it('descriptions are consistent between registry and constants', () => {
    for (const [key, entry] of Object.entries(TECH_REGISTRY)) {
      if (TECHNOLOGIES[key]) {
        expect(entry.desc, `${key} desc mismatch`).toBe(TECHNOLOGIES[key].desc);
      }
    }
  });

  it('TECHNOLOGIES is derived from INSTALLABLE_TECHS (excludes base layers and infra)', () => {
    // INSTALLABLE_TECHS excludes php (base layer), docker and coolify (infra) — audit CLI-02.
    const techKeys = Object.keys(TECHNOLOGIES).sort();
    expect(techKeys).toEqual([...INSTALLABLE_TECHS].sort());
  });

  it('TECHNOLOGIES.name matches TECH_REGISTRY.displayName for all installable entries', () => {
    for (const key of INSTALLABLE_TECHS) {
      expect(TECHNOLOGIES[key].name, `${key} name mismatch`).toBe(TECH_REGISTRY[key].displayName);
    }
  });
});

describe('tech-registry consistency with i18n directories', () => {
  it('every installable tech has an i18n directory in at least one language', () => {
    const i18nBase = path.join(PROJECT_ROOT, 'Dev', 'i18n');
    const languages = ['en', 'fr', 'es', 'de', 'pt', 'base'];

    for (const tech of INSTALLABLE_TECHS) {
      const entry = TECH_REGISTRY[tech];
      const hasDir = languages.some((lang) => fs.existsSync(path.join(i18nBase, lang, entry.i18nDir)));
      expect(hasDir, `No i18n directory found for ${tech} (${entry.i18nDir})`).toBe(true);
    }
  });

  it('every installable tech has an install script', () => {
    const scriptsDir = path.join(PROJECT_ROOT, 'Dev', 'scripts');
    const infraDir = path.join(PROJECT_ROOT, 'Infra');

    for (const tech of INSTALLABLE_TECHS) {
      const entry = TECH_REGISTRY[tech];
      const scriptPath = path.join(scriptsDir, entry.installScript);
      expect(fs.existsSync(scriptPath), `Missing install script: ${entry.installScript}`).toBe(true);
    }
  });
});

describe('tech-registry consistency with plugin.json', () => {
  // Since v8.12.1 the plugin manifest is strictly schema-valid (custom `stacks`
  // metadata removed to pass `claude plugin validate`). Stack names now live in
  // the schema-recognized `keywords` array; this test keeps them in sync with the
  // registry so a new supported stack is surfaced in the published manifest.
  it('plugin.json keywords cover every registry application stack', () => {
    const pluginPath = path.join(PROJECT_ROOT, '.claude-plugin', 'plugin.json');
    if (!fs.existsSync(pluginPath)) return; // Skip if no plugin.json
    const plugin = JSON.parse(fs.readFileSync(pluginPath, 'utf8'));
    const keywords = plugin.keywords || [];

    for (const [key, entry] of Object.entries(TECH_REGISTRY)) {
      if (entry.tier === null) continue; // skip infra (not application stacks)
      // plugin keywords use 'react-native' for the reactnative registry key
      const keyword = key === 'reactnative' ? 'react-native' : key;
      expect(keywords, `Registry stack '${key}' missing from plugin.json keywords`).toContain(keyword);
    }
  });
});
