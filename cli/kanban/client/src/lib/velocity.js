// Velocity helpers. Pure (no DOM, no Svelte) — unit-tested in tests/kanban/velocity.test.js.

const byClosing = (a, b) =>
  String(a.closed_date ?? '').localeCompare(String(b.closed_date ?? '')) ||
  String(a.id).localeCompare(String(b.id), undefined, { numeric: true });

const num = (v) => (Number.isFinite(v) ? v : 0);

/** Closed sprints in closing order, with numeric `committed` and `delivered` (chart and table rows). */
export function velocityRows(sprints) {
  return [...(sprints ?? [])]
    .sort(byClosing)
    .map((s) => ({ ...s, committed: num(s.committed), delivered: num(s.delivered) }));
}

/** Mean delivered points of the last `n` closed sprints (one decimal), null when none. */
export function averageVelocity(sprints, n = 3) {
  const last = velocityRows((sprints ?? []).filter((s) => Number.isFinite(s.delivered))).slice(-n);
  if (last.length === 0) return null;
  const mean = last.reduce((sum, s) => sum + s.delivered, 0) / last.length;
  return Math.round(mean * 10) / 10;
}

/** Whole sprints needed to deliver `remaining` points at `average` per sprint; null if either is unusable. */
export function forecastSprints(remaining, average) {
  if (!Number.isFinite(remaining) || !Number.isFinite(average) || average <= 0) return null;
  return remaining <= 0 ? 0 : Math.ceil(remaining / average);
}

/** Points still to deliver: every story that is neither done nor deferred. */
export function remainingPoints(stories) {
  return (stories ?? [])
    .filter((s) => s.status !== 'done' && s.status !== 'deferred')
    .reduce((sum, s) => sum + (s.story_points ?? 0), 0);
}
