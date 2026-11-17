/**
 * claude-craft devient bear-craft en 10.0.0. Le binaire `claude-craft` reste un alias
 * pendant la 10.x (retrait prévu en 11.0) : lancé sous ce nom, le CLI le signale.
 *
 * @module cli/lib/legacy-name
 */

const LEGACY_BIN = 'claude-craft';

/**
 * @param {string|undefined} argv1 - `process.argv[1]` (chemin du binaire invoqué)
 * @returns {string|null} avis de dépréciation, ou null sous le nouveau nom
 */
export function legacyNameNotice(argv1) {
  const bin = String(argv1 ?? '')
    .split(/[\\/]/)
    .pop();
  if (bin !== LEGACY_BIN) return null;
  return (
    'claude-craft is now bear-craft: run `bear-craft` instead. ' +
    'The `claude-craft` command will be removed in 11.0. ' +
    'Install: npm i -g @the-bearded-bear/bear-craft'
  );
}
