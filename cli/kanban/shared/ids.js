// Single source of truth for entity ids. Pure (no Node import): shared with the client.
// Ids end up in file names: only [A-Za-z0-9-] is accepted (no '/', '.', space).

const SEGMENTS = '[A-Za-z0-9]+(?:-[A-Za-z0-9]+)*';

export const STORY_ID_RE = new RegExp(`^(?:US|TT)-${SEGMENTS}$`);
export const EPIC_ID_RE = /^EPIC-\d{3,}$/;
export const TASK_ID_RE = /^TASK-\d{3,}$/;

// A file name is "<id>-<slug>.md": the slug is not part of the id, so only the
// numeric (optionally epic-style, optionally letter-suffixed) head is taken.
const FILENAME_ID_RE = /^((?:US|TT)-(?:E\d+-)?\d+[a-z]?)(?![A-Za-z0-9])/;

/** @returns {string|null} story id carried by a file name, if any */
export function storyIdFromFilename(name) {
  return FILENAME_ID_RE.exec(name)?.[1] ?? null;
}

function maxSequence(ids, re) {
  let max = 0;
  for (const id of ids) {
    const m = re.exec(id);
    if (m) max = Math.max(max, Number(m[1]));
  }
  return max;
}

/**
 * Next free story id. If the epic already uses `US-E<n>-NN` ids, continue that
 * sequence (2 digits), otherwise continue the flat `US-NNN` one (3 digits).
 * @param {string[]} existingIds
 * @param {string|null} [epicId] 'EPIC-004', 'E4' or null
 */
export function nextStoryId(existingIds, epicId = null) {
  const n = /^(?:EPIC-|E)(\d+)$/.exec(epicId ?? '')?.[1];
  if (n !== undefined) {
    const epicNum = Number(n);
    const max = maxSequence(existingIds, new RegExp(`^US-E${epicNum}-(\\d+)[a-z]?$`));
    if (max > 0) return `US-E${epicNum}-${String(max + 1).padStart(2, '0')}`;
  }
  return `US-${String(maxSequence(existingIds, /^US-(\d+)$/) + 1).padStart(3, '0')}`;
}
