/**
 * CLI argument parser.
 * @module cli/lib/parse-args
 */

/**
 * @typedef {Object} ParsedArgs
 * @property {string|null} command - The CLI command (install, init, flatten, ralph, help)
 * @property {string|null} path - Positional path argument
 * @property {Object<string, string|boolean>} options - Parsed --key=value flags
 */

/**
 * Parse CLI arguments into a structured object.
 * @param {string[]} args - Raw command-line arguments (without node and script path)
 * @returns {ParsedArgs} Parsed command, path, and option flags
 */
function parseArgs(args) {
  const parsed = {
    command: null,
    path: null,
    options: {},
  };

  for (const arg of args) {
    if (arg.startsWith('--')) {
      const [key, value] = arg.slice(2).split('=');
      parsed.options[key] = value ?? true;
    } else if (!parsed.command) {
      parsed.command = arg;
    } else if (!parsed.path) {
      parsed.path = arg;
    }
  }

  return parsed;
}

module.exports = { parseArgs };
