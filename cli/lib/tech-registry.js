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
    version: '8.0 / PHP 8.5',
  },
  flutter: {
    name: 'flutter',
    displayName: 'Flutter / Dart',
    desc: 'Mobile Dart with BLoC pattern, Material/Cupertino',
    namespace: 'flutter',
    i18nDir: 'Flutter',
    installScript: 'install-flutter-rules.sh',
    version: '3.38 / Dart 3.10',
  },
  react: {
    name: 'react',
    displayName: 'React',
    desc: 'Frontend JS/TS with Hooks, State management, A11y',
    namespace: 'react',
    i18nDir: 'React',
    installScript: 'install-react-rules.sh',
    version: '19.x',
  },
  reactnative: {
    name: 'reactnative',
    displayName: 'React Native',
    desc: 'Mobile JS/TS with Navigation, Native modules',
    namespace: 'reactnative',
    i18nDir: 'ReactNative',
    installScript: 'install-reactnative-rules.sh',
    version: '0.76+',
  },
  angular: {
    name: 'angular',
    displayName: 'Angular',
    desc: 'Frontend TS with Signals, Standalone components, RxJS',
    namespace: 'angular',
    i18nDir: 'Angular',
    installScript: 'install-angular-rules.sh',
    version: '19.x',
  },
  csharp: {
    name: 'csharp',
    displayName: 'C# / .NET',
    desc: 'Backend with Clean Architecture, CQRS, MediatR, EF Core',
    namespace: 'csharp',
    i18nDir: 'CSharp',
    installScript: 'install-csharp-rules.sh',
    version: '10 LTS / C# 14',
  },
  laravel: {
    name: 'laravel',
    displayName: 'Laravel',
    desc: 'PHP backend with Actions, Pest PHP, Sanctum',
    namespace: 'laravel',
    i18nDir: 'Laravel',
    installScript: 'install-laravel-rules.sh',
    version: '12.x / PHP 8.5',
  },
  vuejs: {
    name: 'vuejs',
    displayName: 'Vue.js',
    desc: 'Frontend JS/TS with Composition API, Pinia, Vitest',
    namespace: 'vuejs',
    i18nDir: 'VueJS',
    installScript: 'install-vuejs-rules.sh',
    version: '3.5+',
  },
  php: {
    name: 'php',
    displayName: 'PHP',
    desc: 'Backend PHP 8.5 with PSR-12, PHPStan, Pest PHP',
    namespace: 'php',
    i18nDir: 'PHP',
    installScript: 'install-php-rules.sh',
    version: '8.5',
  },
  python: {
    name: 'python',
    displayName: 'Python',
    desc: 'Backend with FastAPI, async/await, Type hints',
    namespace: 'python',
    i18nDir: 'Python',
    installScript: 'install-python-rules.sh',
    version: '3.13+',
  },
  docker: {
    name: 'docker',
    displayName: 'Docker',
    desc: 'Dockerfile, Compose, CI/CD, Debugging',
    namespace: 'docker',
    i18nDir: 'Docker',
    installScript: 'install-infra-rules.sh',
    version: 'latest',
  },
};

/** All tech keys (excluding docker which is infra) */
const INSTALLABLE_TECHS = Object.keys(TECH_REGISTRY).filter((k) => k !== 'docker');

/** Get display name for a tech key */
function getDisplayName(tech) {
  return TECH_REGISTRY[tech]?.displayName ?? tech;
}

/** Get all tech keys */
function getAllTechKeys() {
  return Object.keys(TECH_REGISTRY);
}

export { TECH_REGISTRY, INSTALLABLE_TECHS, getDisplayName, getAllTechKeys };
