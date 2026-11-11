// Story-point totals. Pure.

/** Sum of story_points over the stories matching `pred` (all by default). Missing points count as 0. */
export function sumPoints(stories, pred = () => true) {
  return (stories ?? []).reduce((sum, s) => (pred(s) ? sum + (Number(s.story_points) || 0) : sum), 0);
}
