import { describe, it, expect } from 'vitest';
import { STORY_ID_RE, EPIC_ID_RE, TASK_ID_RE, storyIdFromFilename, nextStoryId } from '../../cli/kanban/shared/ids.js';

describe('STORY_ID_RE', () => {
  it.each(['US-001', 'US-E4-02', 'US-E4-09b', 'TT-012', 'US-1234'])('accepts %s', (id) => {
    expect(STORY_ID_RE.test(id)).toBe(true);
  });

  it.each(['US-', 'US', 'XX-001', 'US-001/../x', 'US-001.md', 'US-00 1', 'US--001', 'us-001', 'US-001\n'])(
    'rejects %j',
    (id) => {
      expect(STORY_ID_RE.test(id)).toBe(false);
    }
  );
});

describe('EPIC_ID_RE / TASK_ID_RE', () => {
  it('match their own prefix only', () => {
    expect(EPIC_ID_RE.test('EPIC-001')).toBe(true);
    expect(EPIC_ID_RE.test('US-001')).toBe(false);
    expect(TASK_ID_RE.test('TASK-001')).toBe(true);
    expect(TASK_ID_RE.test('TASK-1/../x')).toBe(false);
  });
});

describe('storyIdFromFilename', () => {
  it.each([
    ['US-001-login.md', 'US-001'],
    ['US-E4-09-extra.md', 'US-E4-09'],
    ['TT-012-chore.md', 'TT-012'],
    ['US-100.md', 'US-100'],
  ])('%s -> %s', (name, id) => {
    expect(storyIdFromFilename(name)).toBe(id);
  });

  it('returns null when the name carries no story id', () => {
    expect(storyIdFromFilename('notes.md')).toBeNull();
  });
});

describe('nextStoryId', () => {
  it('continues the epic-style sequence on 2 digits', () => {
    expect(nextStoryId(['US-E4-01', 'US-E4-09', 'US-E5-30', 'US-001'], 'EPIC-004')).toBe('US-E4-10');
  });

  it('starts an epic-style sequence at 01 only when the epic already uses it', () => {
    expect(nextStoryId(['US-001', 'US-002'], 'EPIC-004')).toBe('US-003');
  });

  it('falls back to the flat sequence on 3 digits', () => {
    expect(nextStoryId(['US-001', 'US-009'], null)).toBe('US-010');
    expect(nextStoryId([], 'EPIC-001')).toBe('US-001');
  });

  it('ignores suffixed and TT ids when computing the max', () => {
    expect(nextStoryId(['US-E4-09b', 'TT-050', 'US-E4-02'], 'E4')).toBe('US-E4-10');
  });
});
