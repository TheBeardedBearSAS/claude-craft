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
 * Validate option values for known flags.
 * @param {string} key - The option key (without --)
 * @param {string|boolean} value - The option value
 * @throws {Error} If validation fails
 */
function validateOption(key, value) {
  // Reject null bytes in all string values
  if (typeof value === 'string' && value.includes('\0')) {
    throw new Error(`Invalid value for --${key}: null bytes not allowed`);
  }

  switch (key) {
    case 'max-iterations': {
      const num = Number(value);
      if (!Number.isInteger(num) || num <= 0) {
        throw new Error(
          `Invalid value for --max-iterations: must be a positive integer, got "${value}"`,
        );
      }
      break;
    }
    case 'output': {
      if (typeof value === 'string') {
        if (value.split('/').includes('..') || value.split('\\').includes('..')) {
          throw new Error(
            `Invalid value for --output: path traversal ("..") not allowed`,
          );
        }
      }
      break;
    }
  }
}

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
      const resolved = value ?? true;
      validateOption(key, resolved);
      parsed.options[key] = resolved;
    } else if (!parsed.command) {
      parsed.command = arg;
    } else if (!parsed.path) {
      parsed.path = arg;
    }
  }

  return parsed;
}

module.exports = { parseArgs, validateOption };
