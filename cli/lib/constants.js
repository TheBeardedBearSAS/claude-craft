/**
 * Shared constants for the Claude-Craft CLI.
 * @module cli/lib/constants
 */

import { TECH_REGISTRY } from './tech-registry.js';

/**
 * Selectable technologies with display name and description (derived from tech-registry.js SSOT).
 * Base-layer techs (e.g. php) are excluded — they are auto-included with their framework.
 */
const TECHNOLOGIES = Object.fromEntries(
  Object.entries(TECH_REGISTRY)
    .filter(([, entry]) => !entry.baseLayer)
    .map(([key, entry]) => [key, { name: entry.displayName, desc: entry.desc }])
);

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
