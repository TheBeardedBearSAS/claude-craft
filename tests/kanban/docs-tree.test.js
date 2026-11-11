import { describe, it, expect } from 'vitest';
import { buildDocsTree, groupOpenFor } from '../../cli/kanban/client/src/lib/docs-tree.js';

const docs = [
  { rel: 'README.md' },
  { rel: 'architecture/overview.md' },
  { rel: 'architecture/adr/001.md' },
  { rel: 'backlog/epics/E1.md' },
];

describe('buildDocsTree', () => {
  it('splits root files from top-level folders', () => {
    const tree = buildDocsTree(docs);
    expect(tree.root.map((d) => d.rel)).toEqual(['README.md']);
    expect(tree.groups.map((g) => g.name)).toEqual(['architecture', 'backlog']);
  });

  it('gives each child a label relative to its folder', () => {
    const arch = buildDocsTree(docs).groups[0];
    expect(arch.children.map((c) => c.label)).toEqual(['adr/001.md', 'overview.md']);
    expect(arch.children[0].doc.rel).toBe('architecture/adr/001.md');
  });

  it('copes with no docs', () => {
    expect(buildDocsTree(undefined)).toEqual({ root: [], groups: [] });
  });
});

describe('groupOpenFor', () => {
  it('returns the top-level folder of a rel path, or null at the root', () => {
    expect(groupOpenFor('architecture/adr/001.md')).toBe('architecture');
    expect(groupOpenFor('README.md')).toBeNull();
    expect(groupOpenFor(undefined)).toBeNull();
  });
});
