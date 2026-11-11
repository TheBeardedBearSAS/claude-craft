import { describe, it, expect } from 'vitest';
import {
  isLiveSearchView,
  isSearchShortcut,
  searchSubmitHash,
  diagnosticsItems,
  createConnectionTracker,
} from '../../cli/kanban/client/src/lib/shell.js';

const key = (over = {}) => ({
  key: '',
  ctrlKey: false,
  metaKey: false,
  altKey: false,
  target: { tagName: 'BODY' },
  ...over,
});

describe('isLiveSearchView', () => {
  it('filters live on the board and the backlog only', () => {
    expect(isLiveSearchView('kanban')).toBe(true);
    expect(isLiveSearchView('backlog')).toBe(true);
    for (const name of ['sprints', 'burndown', 'deps', 'docs', 'not-found']) expect(isLiveSearchView(name)).toBe(false);
  });
});

describe('isSearchShortcut', () => {
  it('accepts Ctrl+K and Cmd+K, even from a text field', () => {
    expect(isSearchShortcut(key({ key: 'k', ctrlKey: true }))).toBe(true);
    expect(isSearchShortcut(key({ key: 'K', metaKey: true, target: { tagName: 'INPUT' } }))).toBe(true);
  });
  it('accepts "/" outside editable targets only', () => {
    expect(isSearchShortcut(key({ key: '/' }))).toBe(true);
    for (const tagName of ['INPUT', 'TEXTAREA', 'SELECT']) {
      expect(isSearchShortcut(key({ key: '/', target: { tagName } }))).toBe(false);
    }
    expect(isSearchShortcut(key({ key: '/', target: { tagName: 'DIV', isContentEditable: true } }))).toBe(false);
  });
  it('ignores "/" combined with a modifier and unrelated keys', () => {
    expect(isSearchShortcut(key({ key: '/', ctrlKey: true }))).toBe(false);
    expect(isSearchShortcut(key({ key: '/', altKey: true }))).toBe(false);
    expect(isSearchShortcut(key({ key: 'k' }))).toBe(false);
    expect(isSearchShortcut(key({ key: 'a' }))).toBe(false);
  });
  it('is disabled while a modal is open', () => {
    expect(isSearchShortcut(key({ key: '/' }), { modalOpen: true })).toBe(false);
    expect(isSearchShortcut(key({ key: 'k', ctrlKey: true }), { modalOpen: true })).toBe(false);
  });
});

describe('searchSubmitHash', () => {
  it('sends the query to the backlog', () => {
    expect(searchSubmitHash('auth')).toBe('#/backlog?q=auth');
  });
  it('encodes special characters and drops an empty query', () => {
    expect(searchSubmitHash('a b&c')).toBe('#/backlog?q=a%20b%26c');
    expect(searchSubmitHash('  ')).toBe('#/backlog');
  });
});

describe('diagnosticsItems', () => {
  it('is empty for a healthy project or no data', () => {
    expect(diagnosticsItems(null)).toEqual([]);
    expect(diagnosticsItems({ sprint_status: { state: 'ok', issues: [] }, files: [] })).toEqual([]);
    expect(diagnosticsItems({ sprint_status: { state: 'missing', issues: [] }, files: [] })).toEqual([]);
  });
  it('lists the invalid sprint-status issues then every failing file', () => {
    const items = diagnosticsItems({
      sprint_status: { state: 'invalid', issues: ['stories.US-1.status: bad'] },
      files: [{ rel: 'backlog/US-2.md', errors: ['bad yaml', 'no title'] }],
    });
    expect(items).toEqual([
      { file: '.bmad/sprint-status.yaml', message: 'stories.US-1.status: bad' },
      { file: 'backlog/US-2.md', message: 'bad yaml' },
      { file: 'backlog/US-2.md', message: 'no title' },
    ]);
  });
  it('still reports an invalid sprint-status without detail', () => {
    const items = diagnosticsItems({ sprint_status: { state: 'invalid' }, files: [] });
    expect(items).toHaveLength(1);
    expect(items[0].file).toBe('.bmad/sprint-status.yaml');
  });
});

describe('createConnectionTracker', () => {
  it('stays silent on the first connection', () => {
    const track = createConnectionTracker();
    expect(track.update(false)).toBeNull();
    expect(track.update(true)).toBeNull();
  });
  it('announces only the loss and the return of the connection', () => {
    const track = createConnectionTracker();
    track.update(true);
    expect(track.update(true)).toBeNull();
    expect(track.update(false)).toBe('lost');
    expect(track.update(false)).toBeNull();
    expect(track.update(true)).toBe('restored');
    expect(track.update(true)).toBeNull();
  });
});
