/**
 * Shared ANSI color definitions for CLI modules.
 *
 * Honors the NO_COLOR convention (https://no-color.org): if the NO_COLOR
 * environment variable is set to any non-empty string, every color/style
 * sequence resolves to an empty string. Also disables colors when stdout
 * is not a TTY (e.g. piped to a file), unless FORCE_COLOR is set.
 *
 * @module cli/lib/colors
 */

const NO_COLOR =
  typeof process !== 'undefined' &&
  process.env &&
  typeof process.env.NO_COLOR === 'string' &&
  process.env.NO_COLOR.length > 0;

const FORCE_COLOR =
  typeof process !== 'undefined' &&
  process.env &&
  typeof process.env.FORCE_COLOR === 'string' &&
  process.env.FORCE_COLOR.length > 0 &&
  process.env.FORCE_COLOR !== '0';

const STDOUT_IS_TTY = typeof process !== 'undefined' && process.stdout && process.stdout.isTTY === true;

/**
 * Whether ANSI color sequences should be emitted.
 * @type {boolean}
 */
export const colorEnabled = !NO_COLOR && (FORCE_COLOR || STDOUT_IS_TTY);

const ansi = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

const empty = Object.fromEntries(Object.keys(ansi).map((k) => [k, '']));

/**
 * ANSI escape code map for terminal color output.
 * When NO_COLOR is set or stdout is not a TTY, every entry resolves to "".
 * @type {Object<string, string>}
 */
const colors = colorEnabled ? ansi : empty;

export default colors;
