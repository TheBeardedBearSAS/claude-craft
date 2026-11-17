// Text helpers of scripts/generate-plugins.mjs, written without regular expressions that backtrack
// super-linearly (SonarCloud S8786). Behaviour is pinned against the former regexes by
// tests/scripts/plugin-text.test.mjs.

/** Same order as a bare `.sort()` (UTF-16 code units), made explicit (S2871). */
export const byCodeUnit = (a, b) => (a < b ? -1 : a > b ? 1 : 0);

/** `rest.replace(/[./-]+$/, '')` */
export function trimTrailingPathPunctuation(rest) {
  let end = rest.length;
  while (end > 0 && (rest[end - 1] === '.' || rest[end - 1] === '/' || rest[end - 1] === '-')) end -= 1;
  return rest.slice(0, end);
}

const LINE_END = new Set(['\n', '\r', ' ', ' ']);
const isSpace = (ch) => /\s/.test(ch);

/**
 * Value of the first `description:` line of a frontmatter, outer quotes removed — the former
 * `/^description:\s*(.*)$/m.exec(text)?.[1]?.replace(/^["']|["']$/g, '') ?? ''`.
 */
export function descriptionFromFrontmatter(text) {
  let from = 0;
  for (;;) {
    const at = text.indexOf('description:', from);
    if (at === -1) return '';
    const atLineStart = at === 0 || LINE_END.has(text[at - 1]);
    if (atLineStart) {
      let i = at + 'description:'.length;
      while (i < text.length && isSpace(text[i])) i += 1;
      let j = i;
      while (j < text.length && !LINE_END.has(text[j])) j += 1;
      let value = text.slice(i, j);
      if (value.startsWith('"') || value.startsWith("'")) value = value.slice(1);
      if (value.endsWith('"') || value.endsWith("'")) value = value.slice(0, -1);
      return value;
    }
    from = at + 1;
  }
}
