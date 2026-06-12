/**
 * Shared constants for the Claude-Craft CLI.
 * @module cli/lib/constants
 */

import { TECH_REGISTRY, INSTALLABLE_TECHS } from './tech-registry.js';

/**
 * Selectable technologies with display name and description (derived from tech-registry.js SSOT).
 * Uses INSTALLABLE_TECHS as the authoritative list: base-layer techs (e.g. php),
 * infrastructure techs (docker, coolify) are excluded from the installation menu.
 */
const TECHNOLOGIES = Object.fromEntries(
  INSTALLABLE_TECHS.map((key) => [key, { name: TECH_REGISTRY[key].displayName, desc: TECH_REGISTRY[key].desc }])
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
