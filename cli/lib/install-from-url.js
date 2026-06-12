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
import { LANGUAGES } from './constants.js';
import { TECH_REGISTRY } from './tech-registry.js';
import { runInstallation } from './installer.js';

const SUPPORTED_SCHEMA_VERSIONS = [1];

/** Max number of HTTP redirects to follow (each re-validated against validateUrl). */
const MAX_REDIRECTS = 5;

/**
 * Max size of the remote config body. A team config is a tiny JSON object (~1 KB);
 * 50 KB is a generous ceiling that prevents a malicious/compromised endpoint from
 * streaming an unbounded body into memory (audit 2026-06-08 P3 — DoS hardening).
 */
const MAX_CONFIG_BYTES = 50 * 1024;

/**
 * SSRF guard: reject hostnames that resolve to private, loopback, link-local or
 * cloud-metadata addresses. Applied to the https path (the http+localhost dev
 * escape hatch in validateUrl is handled before this is reached).
 * Audit 2026-06-01 P1 — `https://169.254.169.254/…` previously passed validateUrl
 * (it only enforced the scheme), so a redirect or direct URL could hit the cloud
 * metadata endpoint.
 * @param {string} hostname
 * @returns {boolean} true if the host must be blocked
 */
export function isBlockedHost(hostname) {
  const h = hostname.replace(/^\[|\]$/g, '').toLowerCase();
  // IPv4 literal?
  const m = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/.exec(h);
  if (m) {
    const [a, b] = [Number(m[1]), Number(m[2])];
    if (a === 10) return true; // 10.0.0.0/8 private
    if (a === 127) return true; // 127.0.0.0/8 loopback
    if (a === 0) return true; // 0.0.0.0/8
    if (a === 169 && b === 254) return true; // 169.254.0.0/16 link-local (AWS/GCP/Azure metadata)
    if (a === 172 && b >= 16 && b <= 31) return true; // 172.16.0.0/12 private
    if (a === 192 && b === 168) return true; // 192.168.0.0/16 private
    if (a === 100 && b >= 64 && b <= 127) return true; // 100.64.0.0/10 CGNAT (Alibaba metadata 100.100.100.200)
    return false;
  }
  // IPv6 literal?
  if (h.includes(':')) {
    if (h === '::1' || h === '::') return true; // loopback / unspecified
    if (h.startsWith('fe80')) return true; // link-local
    if (h.startsWith('fc') || h.startsWith('fd')) return true; // fc00::/7 unique-local
    if (h.startsWith('fd00:ec2')) return true; // AWS IMDS over IPv6
    return false;
  }
  return false; // regular hostname — DNS rebinding is out of scope here
}

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
  const isLocal = parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1' || parsed.hostname === '::1';
  // Explicit dev escape hatch: plain http only for loopback.
  if (parsed.protocol === 'http:' && isLocal) return parsed;
  if (parsed.protocol !== 'https:') {
    throw new Error(`--from: only https URLs are allowed (got ${parsed.protocol})`);
  }
  // https path: block SSRF targets (private/loopback/link-local/metadata).
  if (isBlockedHost(parsed.hostname)) {
    throw new Error(
      `--from: refusing to fetch from private/link-local/metadata address "${parsed.hostname}" (SSRF protection)`
    );
  }
  return parsed;
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
      if (!TECH_REGISTRY[t]) {
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
    // Follow redirects manually, re-validating each hop against validateUrl so a
    // 3xx Location pointing at a private/metadata address cannot bypass the SSRF
    // guard (audit 2026-06-01 P1). `redirect: 'manual'` returns the 3xx response.
    let currentUrl = url;
    let res;
    for (let hop = 0; ; hop++) {
      validateUrl(currentUrl);
      res = await fetchFn(currentUrl, { redirect: 'manual' });
      const status = res.status ?? 200;
      if (status >= 300 && status < 400 && typeof res.headers?.get === 'function') {
        const loc = res.headers.get('location');
        if (!loc) break;
        if (hop >= MAX_REDIRECTS) {
          throw new Error(`too many redirects (>${MAX_REDIRECTS})`);
        }
        currentUrl = new URL(loc, currentUrl).toString();
        continue;
      }
      break;
    }
    if (!res.ok) {
      throw new Error(`HTTP ${res.status} ${res.statusText}`);
    }
    // Reject oversized payloads up front when the server advertises a length…
    const declaredLen = Number(res.headers?.get?.('content-length'));
    if (Number.isFinite(declaredLen) && declaredLen > MAX_CONFIG_BYTES) {
      throw new Error(`config too large (${declaredLen} bytes > ${MAX_CONFIG_BYTES} limit)`);
    }
    body = await res.text();
    // …and after reading, in case Content-Length was absent or understated.
    if (body.length > MAX_CONFIG_BYTES) {
      throw new Error(`config too large (${body.length} bytes > ${MAX_CONFIG_BYTES} limit)`);
    }
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
