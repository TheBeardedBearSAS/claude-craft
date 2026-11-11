// Document tree for the Docs view. Pure (no DOM) — tested in tests/kanban/docs-tree.test.js.

const byLabel = (a, b) => a.label.localeCompare(b.label, 'en', { numeric: true });

/**
 * Root files + one group per top-level folder; a group child keeps the path below the folder as `label`.
 * @param {Array<{rel:string}>} docs
 */
export function buildDocsTree(docs = []) {
  const root = [];
  const groups = new Map();
  for (const doc of docs ?? []) {
    const [top, ...rest] = doc.rel.split('/');
    if (rest.length === 0) {
      root.push(doc);
      continue;
    }
    if (!groups.has(top)) groups.set(top, { name: top, children: [] });
    groups.get(top).children.push({ doc, label: rest.join('/') });
  }
  const sorted = [...groups.values()].sort((a, b) => a.name.localeCompare(b.name, 'en'));
  for (const g of sorted) g.children.sort(byLabel);
  return { root, groups: sorted };
}

/** Top-level folder of a document path (null for a root file or no path). */
export function groupOpenFor(rel) {
  const parts = String(rel ?? '').split('/');
  return parts.length > 1 ? parts[0] : null;
}
