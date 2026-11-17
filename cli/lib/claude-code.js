/**
 * Claude Code CLI detection shared by `doctor` and the plugin installation.
 * @module cli/lib/claude-code
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import * as yaml from 'js-yaml';

/**
 * Read a Claude Code version from config/versions.yaml (`claudeCode.<key>`).
 * Falls back to the given hardcoded value if the file is unavailable.
 * @param {'minimum'|'recommended'} key
 * @param {string} fallback
 * @returns {string}
 */
function loadClaudeCodeVersion(key, fallback) {
  try {
    const __dirname = path.dirname(fileURLToPath(import.meta.url));
    const versionsPath = path.resolve(__dirname, '..', '..', 'config', 'versions.yaml');
    if (!fs.existsSync(versionsPath)) return fallback;
    const parsed = yaml.load(fs.readFileSync(versionsPath, 'utf8'));
    return parsed?.claudeCode?.[key] ?? fallback;
  } catch {
    return fallback;
  }
}

// Security floor: plugin SHA-pin bypass (CVE-2026-86063, fixed 2.1.179), symlink
// TOCTOU write (CVE-2026-103435, 2.1.129), managed settings bypass (CVE-2026-103012, 2.1.260),
// Bash permission and MCP OAuth fixes (2.1.321), Bash/sandbox permission bypasses
// (2.1.323, 2.1.325) — no GHSA published.
export const MIN_CLAUDE_CODE = loadClaudeCodeVersion('minimum', '2.1.325');
export const RECOMMENDED_CLAUDE_CODE = loadClaudeCodeVersion('recommended', '2.1.326');

/**
 * Compare two semver-ish version strings (`major.minor.patch`).
 * Returns -1 if a < b, 0 if equal, 1 if a > b.
 * @param {string} a
 * @param {string} b
 * @returns {-1|0|1}
 */
export function semverCmp(a, b) {
  const pa = a.split('.').map((n) => Number.parseInt(n, 10));
  const pb = b.split('.').map((n) => Number.parseInt(n, 10));
  for (let i = 0; i < 3; i++) {
    const da = pa[i] || 0;
    const db = pb[i] || 0;
    if (da !== db) return da < db ? -1 : 1;
  }
  return 0;
}

/**
 * Extract the first `X.Y.Z` triple from a free-form `claude --version` output.
 * @param {string} output
 * @returns {string|null}
 */
export function extractSemver(output) {
  const m = output.match(/(?<!\d)(\d+)\.(\d+)\.(\d+)/);
  return m ? m[0] : null;
}

/**
 * Interpret the raw output of `claude --version`.
 * @param {string|null|undefined} raw - Output of `claude --version`, or null when the command failed
 * @param {string} [minimum]
 * @returns {{found: boolean, version: string|null, raw: string|null, tooOld: boolean, belowRecommended: boolean}}
 */
export function assessClaude(raw, minimum = MIN_CLAUDE_CODE) {
  if (!raw) return { found: false, version: null, raw: null, tooOld: false, belowRecommended: false };
  const version = extractSemver(raw);
  return {
    found: true,
    version,
    raw,
    tooOld: version !== null && semverCmp(version, minimum) < 0,
    belowRecommended: version !== null && semverCmp(version, RECOMMENDED_CLAUDE_CODE) < 0,
  };
}
