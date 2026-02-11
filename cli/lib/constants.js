/**
 * Shared constants for the Claude-Craft CLI.
 * @module cli/lib/constants
 */

/** Available technologies with display name and description. */
const TECHNOLOGIES = {
  symfony: { name: 'Symfony', desc: 'PHP backend with Clean Architecture, DDD, API Platform' },
  flutter: { name: 'Flutter', desc: 'Mobile Dart with BLoC pattern, Material/Cupertino' },
  react: { name: 'React', desc: 'Frontend JS/TS with Hooks, State management, A11y' },
  reactnative: { name: 'React Native', desc: 'Mobile JS/TS with Navigation, Native modules' },
  angular: { name: 'Angular', desc: 'Frontend TS with Signals, Standalone components, RxJS' },
  csharp: { name: 'C# / .NET', desc: 'Backend with Clean Architecture, CQRS, MediatR, EF Core' },
  laravel: { name: 'Laravel', desc: 'PHP backend with Actions, Pest PHP, Sanctum' },
  vuejs: { name: 'Vue.js', desc: 'Frontend JS/TS with Composition API, Pinia, Vitest' },
  php: { name: 'PHP', desc: 'Backend PHP 8.5 with PSR-12, PHPStan, Pest PHP' },
  python: { name: 'Python', desc: 'Backend with FastAPI, async/await, Type hints' },
  docker: { name: 'Docker', desc: 'Dockerfile, Compose, CI/CD, Debugging' },
};

/** Available UI languages. */
const LANGUAGES = {
  en: 'English',
  fr: 'Fran\u00e7ais',
  es: 'Espa\u00f1ol',
  de: 'Deutsch',
  pt: 'Portugu\u00eas',
};

/** Workflow tracks with setup time and phase count. */
const TRACKS = {
  quick: { name: 'Quick Flow', desc: 'Bug fixes, hotfixes, small tweaks (< 5 min)', phases: 1 },
  standard: { name: 'Standard', desc: 'New features, refactoring (< 15 min)', phases: 3 },
  enterprise: { name: 'Enterprise', desc: 'Platforms, migrations, multi-team (< 30 min)', phases: 4 },
};

export { TECHNOLOGIES, LANGUAGES, TRACKS };
