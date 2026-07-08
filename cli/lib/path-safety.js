/**
 * Path and argument safety helpers shared by all CLI commands.
 *
 * Exists to enforce a single authoritative implementation of the security
 * checks that protect against CWE-22 (path traversal) and CWE-78 (argument
 * injection). Originally inlined in `cli/lib/update.js` after the 2026-04-23
 * security audit; extracted here in v8.3.x so installer/doctor/list and any
 * future command can reuse the same guard rails.
 *
 * @module cli/lib/path-safety
 */

import path from 'path';

/**
 * System directories Claude Craft must never write into. Refusing these
 * targets prevents both accidental nukes (typo `--target=/`) and malicious
 * exploitation of an `--target` value supplied by an untrusted caller.
 */
export const FORBIDDEN_SYSTEM_DIRS = Object.freeze([
  '/',
  '/etc',
  '/usr',
  '/bin',
  '/sbin',
  '/boot',
  '/lib',
  '/var',
  '/root',
  '/proc',
  '/sys',
  '/dev',
]);

/**
 * Resolve `targetPath` to an absolute path and refuse it if it points to a
 * forbidden system directory.
 *
 * Resolution is intentional: a relative path like `./../../etc` must be
 * normalised before being compared, otherwise an attacker could bypass the
 * check by supplying a syntactic relative form.
 *
 * @param {string} targetPath - Path supplied by the caller (relative or absolute).
 * @returns {string} The resolved absolute path, safe to use as a target.
 * @throws {Error} If the resolved path is `/` or any subtree of a forbidden directory.
 */
export function assertSafeTarget(targetPath) {
  if (typeof targetPath !== 'string' || targetPath.length === 0) {
    throw new Error('Target path must be a non-empty string');
  }
  const resolved = path.resolve(targetPath);
  for (const forbidden of FORBIDDEN_SYSTEM_DIRS) {
    if (resolved === forbidden || resolved.startsWith(forbidden + path.sep)) {
      throw new Error(`Refusing to operate on system directory: ${resolved}`);
    }
  }
  return resolved;
}

/**
 * Resolve `candidatePath` and refuse it if it does not stay inside `baseDir`.
 *
 * Used to validate paths built by joining a trusted directory with an
 * untrusted segment (e.g. a hook filename read from a provider config file
 * in the target repo) before that path is passed to `execa`/`fs`.
 *
 * @param {string} baseDir - Directory the candidate must resolve inside of.
 * @param {string} candidatePath - Path to validate (typically `path.join(baseDir, untrustedName)`).
 * @returns {string} The resolved absolute candidate path, safe to use.
 * @throws {Error} If the resolved candidate escapes `baseDir`.
 */
export function assertWithinDir(baseDir, candidatePath) {
  const resolvedBase = path.resolve(baseDir);
  const resolvedCandidate = path.resolve(candidatePath);
  if (resolvedCandidate !== resolvedBase && !resolvedCandidate.startsWith(resolvedBase + path.sep)) {
    throw new Error(`Path escapes base directory: ${resolvedCandidate} (base: ${resolvedBase})`);
  }
  return resolvedCandidate;
}

/**
 * Validate a two-letter ISO 639-1 language code. Used to ensure the `--lang`
 * value cannot be turned into argument injection on the bash scripts called
 * via `spawnSync`.
 *
 * @param {string} lang - Language code to validate (e.g. `fr`).
 * @returns {string} The same code if valid.
 * @throws {Error} If `lang` is not exactly two lowercase ASCII letters.
 */
export function assertSafeLang(lang) {
  if (!/^[a-z]{2}$/.test(lang)) {
    throw new Error(`Invalid --lang value: "${lang}" (expected 2-letter lowercase code)`);
  }
  return lang;
}
