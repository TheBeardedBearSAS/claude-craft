/**
 * Team configuration sync — install Claude-Craft from a remote JSON URL.
 *
 * Allows a team to share an installation profile via a URL (Gist, internal endpoint…),
 * so a new dev just runs `claude-craft install --from=https://org.example/cc.json`.
 *
 * Expected JSON schema (all fields optional except `version`):
 *   {
 *     "version": 1,
 *     "language": "fr" | "en" | "es" | "de" | "pt",
 *     "technologies": ["symfony", "docker", ...],
 *     "includeInfra": true,
 *     "includeProject": true,
 *     "includeRtk": false
 *   }
 *
 * @module cli/lib/install-from-url
 */

import c from './colors.js';
import { TECHNOLOGIES, LANGUAGES } from './constants.js';
import { runInstallation } from './installer.js';

const SUPPORTED_SCHEMA_VERSIONS = [1];

/**
 * Validate that a URL is well-formed and uses https (http allowed for localhost only).
 * @param {string} url
 * @returns {URL}
 * @throws {Error} If URL is invalid or scheme is not allowed
 */
export function validateUrl(url) {
  let parsed;
  try {
    parsed = new URL(url);
  } catch {
    throw new Error(`--from: invalid URL "${url}"`);
  }
  if (parsed.protocol === 'https:') return parsed;
  const isLocal = parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1' || parsed.hostname === '::1';
  if (parsed.protocol === 'http:' && isLocal) return parsed;
  throw new Error(`--from: only https URLs are allowed (got ${parsed.protocol})`);
}

/**
 * Validate a parsed config object against the expected schema.
 * @param {unknown} cfg
 * @returns {Object} Validated, normalized config
 * @throws {Error} If the config is invalid
 */
export function validateConfig(cfg) {
  if (!cfg || typeof cfg !== 'object' || Array.isArray(cfg)) {
    throw new Error('--from: config must be a JSON object');
  }
  const v = cfg.version;
  if (!SUPPORTED_SCHEMA_VERSIONS.includes(v)) {
    throw new Error(`--from: unsupported schema version ${v} (supported: ${SUPPORTED_SCHEMA_VERSIONS.join(', ')})`);
  }

  const out = { version: v };

  if (cfg.language !== undefined) {
    if (!LANGUAGES[cfg.language]) {
      throw new Error(`--from: unknown language "${cfg.language}"`);
    }
    out.language = cfg.language;
  }

  if (cfg.technologies !== undefined) {
    if (!Array.isArray(cfg.technologies)) {
      throw new Error('--from: "technologies" must be an array');
    }
    for (const t of cfg.technologies) {
      if (!TECHNOLOGIES[t]) {
        throw new Error(`--from: unknown technology "${t}"`);
      }
    }
    out.technologies = cfg.technologies;
  }

  for (const flag of ['includeInfra', 'includeProject', 'includeRtk']) {
    if (cfg[flag] !== undefined) {
      if (typeof cfg[flag] !== 'boolean') {
        throw new Error(`--from: "${flag}" must be a boolean`);
      }
      out[flag] = cfg[flag];
    }
  }

  return out;
}

/**
 * Fetch a remote config JSON and run the installation with it.
 * @param {string} url - Remote URL pointing to a JSON config
 * @param {import('../index.js').ClaudeCraftCLI} cli - CLI instance
 * @param {Object} ctx - Context object
 * @param {string} ctx.CLI_ROOT - Absolute path to the CLI package root
 * @param {Function} [fetchFn=globalThis.fetch] - Injectable fetch (for testing)
 * @returns {Promise<void>}
 */
export async function runInstallFromUrl(url, cli, { CLI_ROOT }, fetchFn = globalThis.fetch) {
  validateUrl(url);

  console.log(`${c.bold}Fetching team config…${c.reset} ${c.dim}${url}${c.reset}`);

  let body;
  try {
    const res = await fetchFn(url, { redirect: 'follow' });
    if (!res.ok) {
      throw new Error(`HTTP ${res.status} ${res.statusText}`);
    }
    body = await res.text();
  } catch (err) {
    throw new Error(`--from: fetch failed (${err.message})`, { cause: err });
  }

  let cfg;
  try {
    cfg = JSON.parse(body);
  } catch (err) {
    throw new Error(`--from: response is not valid JSON (${err.message})`, { cause: err });
  }

  const validated = validateConfig(cfg);

  // Apply to CLI config (CLI flags already in cli.config win over remote config)
  if (validated.language && cli.config.language === 'en') cli.config.language = validated.language;
  if (validated.technologies && cli.config.technologies.length === 0) cli.config.technologies = validated.technologies;
  if (validated.includeInfra !== undefined) cli.config.includeInfra = validated.includeInfra;
  if (validated.includeProject !== undefined) cli.config.includeProject = validated.includeProject;
  if (validated.includeRtk !== undefined) cli.config.includeRtk = validated.includeRtk;

  console.log(`  ${c.green}✓${c.reset} Config loaded (schema v${validated.version})`);
  console.log(`  ${c.cyan}Language${c.reset}     ${LANGUAGES[cli.config.language]}`);
  console.log(
    `  ${c.cyan}Technologies${c.reset} ${cli.config.technologies.length > 0 ? cli.config.technologies.join(', ') : 'common only'}\n`
  );

  await runInstallation(cli, { CLI_ROOT });
}
