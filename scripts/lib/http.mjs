/**
 * Helpers partagés des collecteurs d'audit (`collect-claude-signals.mjs`,
 * `collect-freshness-signals.mjs`) : fetch avec erreur explicite et
 * comparaison numérique de versions.
 *
 * @module scripts/lib/http
 */

export async function fetchJson(url, headers = {}) {
  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error(`${url} → ${res.status} ${res.statusText}`);
  return res.json();
}

export async function fetchText(url, headers = {}) {
  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error(`${url} → ${res.status} ${res.statusText}`);
  return res.text();
}

/**
 * Compare deux versions segment par segment, numériquement.
 * Indispensable : en comparaison de chaînes, '2.1.9' passerait pour plus récent
 * que '2.1.193'.
 *
 * @returns {number} > 0 si `a` est plus récente, < 0 si plus ancienne, 0 si égales
 */
export function compareVersions(a, b) {
  const parse = (v) =>
    String(v)
      .split('.')
      .map((seg) => parseInt(seg, 10) || 0);
  const left = parse(a);
  const right = parse(b);
  const len = Math.max(left.length, right.length);
  for (let i = 0; i < len; i += 1) {
    const diff = (left[i] ?? 0) - (right[i] ?? 0);
    if (diff !== 0) return diff;
  }
  return 0;
}
