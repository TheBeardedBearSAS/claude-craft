import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { TECH_REGISTRY, INSTALLABLE_TECHS, getDisplayName, getAllTechKeys } from '../../cli/lib/tech-registry.js';
import { TECHNOLOGIES } from '../../cli/lib/constants.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, '../..');

describe('tech-registry', () => {
  it('exports TECH_REGISTRY with all expected keys', () => {
    const expectedKeys = [
      'symfony', 'flutter', 'react', 'reactnative', 'angular',
      'csharp', 'laravel', 'vuejs', 'php', 'python', 'docker',
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

  it('INSTALLABLE_TECHS excludes docker', () => {
    expect(INSTALLABLE_TECHS).not.toContain('docker');
    expect(INSTALLABLE_TECHS.length).toBe(10);
  });

  it('getDisplayName returns correct value', () => {
    expect(getDisplayName('symfony')).toBe('Symfony / PHP');
    expect(getDisplayName('unknown')).toBe('unknown');
  });

  it('getAllTechKeys returns all keys including docker', () => {
    const keys = getAllTechKeys();
    expect(keys.length).toBe(12);
    expect(keys).toContain('docker');
  });
});

describe('tech-registry consistency with constants.js', () => {
  it('every TECHNOLOGIES key exists in TECH_REGISTRY', () => {
    for (const key of Object.keys(TECHNOLOGIES)) {
      expect(TECH_REGISTRY, `Missing registry entry for ${key}`).toHaveProperty(key);
    }
  });

  it('every TECH_REGISTRY key (except docker) exists in TECHNOLOGIES', () => {
    for (const key of INSTALLABLE_TECHS) {
      expect(TECHNOLOGIES, `Missing TECHNOLOGIES entry for ${key}`).toHaveProperty(key);
    }
    // Docker is also in TECHNOLOGIES
    expect(TECHNOLOGIES).toHaveProperty('docker');
  });

  it('descriptions are consistent between registry and constants', () => {
    for (const [key, entry] of Object.entries(TECH_REGISTRY)) {
      if (TECHNOLOGIES[key]) {
        expect(entry.desc, `${key} desc mismatch`).toBe(TECHNOLOGIES[key].desc);
      }
    }
  });

  it('TECHNOLOGIES is derived from TECH_REGISTRY (same keys)', () => {
    const registryKeys = Object.keys(TECH_REGISTRY).sort();
    const techKeys = Object.keys(TECHNOLOGIES).sort();
    expect(techKeys).toEqual(registryKeys);
  });

  it('TECHNOLOGIES.name matches TECH_REGISTRY.displayName for all entries', () => {
    for (const [key, entry] of Object.entries(TECH_REGISTRY)) {
      expect(TECHNOLOGIES[key].name, `${key} name mismatch`).toBe(entry.displayName);
    }
  });
});

describe('tech-registry consistency with i18n directories', () => {
  it('every installable tech has an i18n directory in at least one language', () => {
    const i18nBase = path.join(PROJECT_ROOT, 'Dev', 'i18n');
    const languages = ['en', 'fr', 'es', 'de', 'pt', 'base'];

    for (const tech of INSTALLABLE_TECHS) {
      const entry = TECH_REGISTRY[tech];
      const hasDir = languages.some((lang) =>
        fs.existsSync(path.join(i18nBase, lang, entry.i18nDir)),
      );
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
  it('plugin.json technologies match registry', () => {
    const pluginPath = path.join(PROJECT_ROOT, '.claude-plugin', 'plugin.json');
    if (!fs.existsSync(pluginPath)) return; // Skip if no plugin.json
    const plugin = JSON.parse(fs.readFileSync(pluginPath, 'utf8'));
    const pluginTechs = plugin.technologies.map((t) => t.name);

    // Every plugin tech should map to a registry entry
    for (const name of pluginTechs) {
      // plugin uses 'dotnet' for csharp, 'react-native' for reactnative
      const registryKey =
        name === 'dotnet' ? 'csharp' : name === 'react-native' ? 'reactnative' : name;
      expect(TECH_REGISTRY, `Plugin tech '${name}' not in registry`).toHaveProperty(registryKey);
    }
  });
});
