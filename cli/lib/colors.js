/**
 * Shared ANSI color definitions for CLI modules.
 * @module cli/lib/colors
 */

/**
 * ANSI escape code map for terminal color output.
 * @type {Object<string, string>}
 * @property {string} reset - Reset all formatting
 * @property {string} bold - Bold text
 * @property {string} dim - Dimmed text
 * @property {string} red - Red foreground
 * @property {string} green - Green foreground
 * @property {string} yellow - Yellow foreground
 * @property {string} blue - Blue foreground
 * @property {string} magenta - Magenta foreground
 * @property {string} cyan - Cyan foreground
 */
const colors = {
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

export default colors;
