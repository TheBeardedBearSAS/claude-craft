// Burndown table join. Pure (no DOM).
// Bug #8: the sr-only accessible table paired ideal[i] with actual[i] by array
// index, but the two series have different lengths (actual is event-driven).
// Join by DATE instead so each row is coherent.

/**
 * @param {Array<{date:string,points:number}>} ideal
 * @param {Array<{date:string,points:number}>} actual
 * @returns {Array<{date:string, ideal:number|null, actual:number|null}>}
 *   one row per distinct date, ascending.
 */
export function alignBurndownByDate(ideal = [], actual = []) {
  const idealByDate = new Map(ideal.map((p) => [p.date, p.points]));
  const actualByDate = new Map(actual.map((p) => [p.date, p.points]));
  const dates = [...new Set([...idealByDate.keys(), ...actualByDate.keys()])].sort((a, b) => a.localeCompare(b));
  return dates.map((date) => ({
    date,
    ideal: idealByDate.has(date) ? idealByDate.get(date) : null,
    actual: actualByDate.has(date) ? actualByDate.get(date) : null,
  }));
}
