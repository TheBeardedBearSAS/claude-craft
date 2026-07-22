/**
 * Technology registry — Single Source of Truth for all supported stacks.
 *
 * This module centralizes technology metadata used across:
 * - CLI constants (TECHNOLOGIES)
 * - Install scripts (install-{tech}-rules.sh)
 * - check-config.sh validation
 * - Documentation references
 *
 * @module cli/lib/tech-registry
 */

/**
 * @typedef {Object} TechEntry
 * @property {string} name - Internal identifier (lowercase, no hyphens)
 * @property {string} displayName - Human-readable name
 * @property {string} desc - Short description for CLI display
 * @property {string} namespace - Command namespace (used in commands/{namespace}/)
 * @property {string} i18nDir - Directory name under Dev/i18n/{lang}/
 * @property {string} installScript - Install script filename
 * @property {string} version - Current supported version
 * @property {1|2|3|null} tier - Maturity tier: 1=core, 2=supported, 3=community, null=infra
 */

/** @type {Record<string, TechEntry>} */
const TECH_REGISTRY = {
  symfony: {
    name: 'symfony',
    displayName: 'Symfony / PHP',
    desc: 'PHP backend with Clean Architecture, DDD, API Platform',
    namespace: 'symfony',
    i18nDir: 'Symfony',
    installScript: 'install-symfony-rules.sh',
    version: '8.1 / PHP 8.4+',
    tier: 1,
  },
  flutter: {
    name: 'flutter',
    displayName: 'Flutter / Dart',
    desc: 'Mobile Dart with BLoC v9, Riverpod 3, Material 3, Impeller',
    namespace: 'flutter',
    i18nDir: 'Flutter',
    installScript: 'install-flutter-rules.sh',
    version: '3.44 / Dart 3.12',
    tier: 1,
  },
  react: {
    name: 'react',
    displayName: 'React',
    desc: 'Frontend JS/TS with Hooks, Compiler 1.0, Server Components',
    namespace: 'react',
    i18nDir: 'React',
    installScript: 'install-react-rules.sh',
    version: '19.2 + Compiler 1.0',
    tier: 1,
  },
  reactnative: {
    name: 'reactnative',
    displayName: 'React Native',
    desc: 'Mobile JS/TS New Architecture (JSI, TurboModules, Fabric)',
    namespace: 'reactnative',
    i18nDir: 'ReactNative',
    installScript: 'install-reactnative-rules.sh',
    version: '0.85',
    tier: 2,
  },
  angular: {
    name: 'angular',
    displayName: 'Angular',
    desc: 'Frontend TS with Signals, Zoneless, httpResource, Signal Forms',
    namespace: 'angular',
    i18nDir: 'Angular',
    installScript: 'install-angular-rules.sh',
    version: '22',
    tier: 3,
  },
  csharp: {
    name: 'csharp',
    displayName: 'C# / .NET',
    desc: 'Backend with Clean Architecture, CQRS, MediatR, EF Core',
    namespace: 'csharp',
    i18nDir: 'CSharp',
    installScript: 'install-csharp-rules.sh',
    version: '10 LTS / C# 14',
    tier: 3,
  },
  laravel: {
    name: 'laravel',
    displayName: 'Laravel',
    desc: 'PHP backend with Actions, Pest 4, Sanctum, AI SDK, Passkey',
    namespace: 'laravel',
    i18nDir: 'Laravel',
    installScript: 'install-laravel-rules.sh',
    version: '13.x / PHP 8.3+',
    tier: 3,
  },
  vuejs: {
    name: 'vuejs',
    displayName: 'Vue.js',
    desc: 'Frontend JS/TS with Composition API, Pinia, Vitest',
    namespace: 'vuejs',
    i18nDir: 'VueJS',
    installScript: 'install-vuejs-rules.sh',
    version: '3.5+',
    tier: 3,
  },
  vite: {
    name: 'vite',
    displayName: 'Vite',
    desc: 'Framework-agnostic build tool: vanilla JS/TS, library authoring, multi-page apps',
    namespace: 'vite',
    i18nDir: 'Vite',
    installScript: 'install-vite-rules.sh',
    version: '8.1',
    tier: 3,
  },
  vercel: {
    name: 'vercel',
    displayName: 'Vercel',
    desc: 'Framework-agnostic deployment platform: vercel.json, Functions (Node.js/Fluid Compute), ISR, Cron Jobs, Storage',
    namespace: 'vercel',
    i18nDir: 'Vercel',
    installScript: 'install-vercel-rules.sh',
    version: '56.5.0',
    tier: 3,
  },
  php: {
    name: 'php',
    displayName: 'PHP',
    desc: 'Backend PHP 8.5 with PSR-12, PHPStan, Pest PHP',
    namespace: 'php',
    i18nDir: 'PHP',
    installScript: 'install-php-rules.sh',
    version: '8.5',
    tier: 2,
    // Base layer: not offered standalone in the menu; auto-included when a PHP
    // framework (Symfony/Laravel) is selected. Avoids triple PHP coverage (audit DA-PM-03).
    baseLayer: true,
    baseLayerFor: ['symfony', 'laravel'],
  },
  python: {
    name: 'python',
    displayName: 'Python',
    desc: 'Backend with FastAPI, Pydantic, free-threading, JIT',
    namespace: 'python',
    i18nDir: 'Python',
    installScript: 'install-python-rules.sh',
    version: '3.14+',
    tier: 1,
  },
  paperclip: {
    name: 'paperclip',
    displayName: 'Paperclip',
    desc: 'Governance-first integration platform (control plane + adapters)',
    namespace: 'paperclip',
    i18nDir: 'Paperclip',
    installScript: 'install-paperclip-rules.sh',
    version: '2026.609.0',
    tier: 2,
  },
  docker: {
    name: 'docker',
    displayName: 'Docker',
    desc: 'Dockerfile, Compose, CI/CD, Debugging',
    namespace: 'docker',
    i18nDir: 'Docker',
    installScript: 'install-docker-rules.sh',
    version: '29.6.1',
    tier: null,
  },
  coolify: {
    name: 'coolify',
    displayName: 'Coolify',
    desc: 'Self-hosted PaaS: deploy, backup, monitor',
    namespace: 'coolify',
    i18nDir: 'Coolify',
    installScript: 'install-coolify-rules.sh',
    version: '4.1.2',
    tier: null,
  },
};

/** Standalone-selectable tech keys (excludes infra and base-layer techs like php). */
const INSTALLABLE_TECHS = Object.keys(TECH_REGISTRY).filter(
  (k) => k !== 'docker' && k !== 'coolify' && !TECH_REGISTRY[k].baseLayer
);

/** Get display name for a tech key */
function getDisplayName(tech) {
  return TECH_REGISTRY[tech]?.displayName ?? tech;
}

/** Get all tech keys */
function getAllTechKeys() {
  return Object.keys(TECH_REGISTRY);
}

/** Get techs by tier */
function getTechsByTier(tier) {
  return Object.entries(TECH_REGISTRY)
    .filter(([_, entry]) => entry.tier === tier)
    .map(([key]) => key);
}

/**
 * Base-layer techs that must be auto-included given a list of selected techs.
 * E.g. selecting `symfony` or `laravel` pulls in `php`.
 * @param {string[]} selectedTechs
 * @returns {string[]} base-layer tech keys to add (not already in selectedTechs)
 */
function getBaseLayerTechsFor(selectedTechs) {
  const selected = new Set(selectedTechs);
  return Object.entries(TECH_REGISTRY)
    .filter(
      ([key, entry]) => entry.baseLayer && !selected.has(key) && (entry.baseLayerFor || []).some((t) => selected.has(t))
    )
    .map(([key]) => key);
}

export { TECH_REGISTRY, INSTALLABLE_TECHS, getDisplayName, getAllTechKeys, getTechsByTier, getBaseLayerTechsFor };
