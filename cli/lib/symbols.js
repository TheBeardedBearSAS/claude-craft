/**
 * Accessible CLI symbols and color utilities.
 * Provides standard symbols for success/error/warning/info with NO_COLOR support.
 *
 * Follows no-color.org standard: respects NO_COLOR env var and TTY detection.
 * Symbols are ALWAYS shown even when colors are disabled, ensuring accessibility.
 *
 * @module cli/lib/symbols
 * @see https://no-color.org/
 */

import c from './colors.js';

/**
 * Standard symbols for CLI output.
 * These are ALWAYS visible, regardless of color support.
 * @type {Object<string, string>}
 */
export const symbols = {
  success: '✓',
  error: '✗',
  warning: '⚠',
  info: 'ℹ',
};

/**
 * Determine if color output should be used.
 * Respects NO_COLOR environment variable and TTY detection.
 *
 * @returns {boolean} True if colors should be used
 */
export function useColor() {
  // NO_COLOR takes precedence (no-color.org standard)
  if (process.env.NO_COLOR !== undefined) {
    return false;
  }

  // Check if output is a TTY
  if (!process.stdout.isTTY) {
    return false;
  }

  return true;
}

/**
 * Format a success message with symbol and optional color.
 * @param {string} message - Message to format
 * @returns {string} Formatted message
 */
export function success(message) {
  const color = useColor();
  const prefix = color ? `${c.green}${symbols.success}${c.reset}` : symbols.success;
  return `${prefix} ${message}`;
}

/**
 * Format an error message with symbol and optional color.
 * @param {string} message - Message to format
 * @returns {string} Formatted message
 */
export function error(message) {
  const color = useColor();
  const prefix = color ? `${c.red}${symbols.error}${c.reset}` : symbols.error;
  return `${prefix} ${message}`;
}

/**
 * Format a warning message with symbol and optional color.
 * @param {string} message - Message to format
 * @returns {string} Formatted message
 */
export function warning(message) {
  const color = useColor();
  const prefix = color ? `${c.yellow}${symbols.warning}${c.reset}` : symbols.warning;
  return `${prefix} ${message}`;
}

/**
 * Format an info message with symbol and optional color.
 * @param {string} message - Message to format
 * @returns {string} Formatted message
 */
export function info(message) {
  const color = useColor();
  const prefix = color ? `${c.cyan}${symbols.info}${c.reset}` : symbols.info;
  return `${prefix} ${message}`;
}
