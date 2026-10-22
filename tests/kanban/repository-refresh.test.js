import { describe, it, expect } from 'vitest';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Repository } from '../../cli/kanban/server/services/repository.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FIXTURE = path.resolve(__dirname, '../fixtures/project-management');

// Regression: the watcher fires one refresh() per changed file. Overlapping refreshes
// each cleared then re-filled the docs list, so every doc showed up twice in Docs.
describe('Repository.refresh — concurrent calls', () => {
  it('does not duplicate docs when refreshes overlap', async () => {
    const single = new Repository(FIXTURE);
    await single.refresh();
    const expected = single.listDocs().map((d) => d.rel);

    const repo = new Repository(FIXTURE);
    await Promise.all([repo.refresh(), repo.refresh(), repo.refresh()]);

    expect(repo.listDocs().map((d) => d.rel)).toEqual(expected);
  });
});
