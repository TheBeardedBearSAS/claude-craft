import { describe, it, expect } from 'vitest';
import { locateCard, reduceKey, buildCardDetails } from '../../cli/kanban/client/src/lib/kanban-nav.js';

const COLUMNS = [
  { key: 'backlog', label: 'Backlog' },
  { key: 'ready-for-dev', label: 'Ready for Dev' },
  { key: 'in-progress', label: 'In Progress' },
  { key: 'review', label: 'Review' },
  { key: 'done', label: 'Done' },
  { key: 'blocked', label: 'Blocked' },
];

const card = (id, extra = {}) => ({ id, title: id, status: 'review', _writable: true, ...extra });

// Two stories in the Review column (index 3), one in Blocked (index 5).
function fixtureBoard() {
  return {
    backlog: [],
    'ready-for-dev': [],
    'in-progress': [],
    review: [card('R-1'), card('R-2')],
    done: [],
    blocked: [card('B-1', { status: 'blocked', _writable: false })],
  };
}

const ctx = () => ({ columns: COLUMNS, storiesByStatus: fixtureBoard() });
const base = { focusedColumnIndex: 0, focusedCardIndex: -1, showMoveMenu: false };

describe('locateCard', () => {
  it('finds the column/card index of a card by id', () => {
    expect(locateCard(fixtureBoard(), COLUMNS, 'R-2')).toEqual({ columnIndex: 3, cardIndex: 1 });
    expect(locateCard(fixtureBoard(), COLUMNS, 'B-1')).toEqual({ columnIndex: 5, cardIndex: 0 });
  });

  it('returns null for an unknown card', () => {
    expect(locateCard(fixtureBoard(), COLUMNS, 'NOPE')).toBeNull();
  });
});

describe('reduceKey — vertical navigation', () => {
  it('ArrowDown clamps within the focused column and emits a focus action', () => {
    // Focused on R-1 (column 3, card 0)
    const state = { focusedColumnIndex: 3, focusedCardIndex: 0, showMoveMenu: false };
    const r1 = reduceKey(state, { key: 'ArrowDown' }, ctx());
    expect(r1.state.focusedCardIndex).toBe(1);
    expect(r1.action).toEqual({ type: 'focus', cardId: 'R-2' });

    // Already at the last card -> stays clamped
    const r2 = reduceKey(r1.state, { key: 'ArrowDown' }, ctx());
    expect(r2.state.focusedCardIndex).toBe(1);
  });

  it('ArrowUp clamps at 0', () => {
    const state = { focusedColumnIndex: 3, focusedCardIndex: 0, showMoveMenu: false };
    const r = reduceKey(state, { key: 'ArrowUp' }, ctx());
    expect(r.state.focusedCardIndex).toBe(0);
  });
});

describe('reduceKey — horizontal navigation', () => {
  it('ArrowRight moves to the next column, resets card index and focuses its first card', () => {
    // From an empty column (0) to the right; lands on review (3) which has cards only after
    // passing empty 1 and 2. Step once: column 1 (empty) -> no focus action.
    const fromReview = { focusedColumnIndex: 2, focusedCardIndex: 0, showMoveMenu: false };
    const r = reduceKey(fromReview, { key: 'ArrowRight' }, ctx());
    expect(r.state.focusedColumnIndex).toBe(3);
    expect(r.state.focusedCardIndex).toBe(0);
    expect(r.action).toEqual({ type: 'focus', cardId: 'R-1' });
  });

  it('ArrowLeft clamps at column 0', () => {
    const r = reduceKey(base, { key: 'ArrowLeft' }, ctx());
    expect(r.state.focusedColumnIndex).toBe(0);
  });

  it('ArrowRight clamps at the last column', () => {
    const state = { focusedColumnIndex: 5, focusedCardIndex: 0, showMoveMenu: false };
    const r = reduceKey(state, { key: 'ArrowRight' }, ctx());
    expect(r.state.focusedColumnIndex).toBe(5);
  });
});

describe('reduceKey — move menu', () => {
  it('Alt+M opens the menu when a card is focused', () => {
    const state = { focusedColumnIndex: 3, focusedCardIndex: 0, showMoveMenu: false };
    const r = reduceKey(state, { key: 'm', altKey: true }, ctx());
    expect(r.state.showMoveMenu).toBe(true);
    expect(r.action).toEqual({ type: 'open-menu' });
  });

  it('Alt+M does nothing when no card is focused', () => {
    const state = { focusedColumnIndex: 0, focusedCardIndex: -1, showMoveMenu: false };
    const r = reduceKey(state, { key: 'm', altKey: true }, ctx());
    expect(r.state.showMoveMenu).toBe(false);
    expect(r.action).toBeNull();
  });

  it('Alt+M closes the menu when already open', () => {
    const state = { focusedColumnIndex: 3, focusedCardIndex: 0, showMoveMenu: true };
    const r = reduceKey(state, { key: 'm', altKey: true }, ctx());
    expect(r.state.showMoveMenu).toBe(false);
    expect(r.action).toEqual({ type: 'close-menu' });
  });

  it('number key with menu open emits a move action for a writable card', () => {
    const state = { focusedColumnIndex: 3, focusedCardIndex: 0, showMoveMenu: true };
    const r = reduceKey(state, { key: '5' }, ctx());
    expect(r.action).toEqual({ type: 'move', cardId: 'R-1', targetStatus: 'done' });
  });

  it('number key on a read-only card emits a readonly action, not a move', () => {
    const state = { focusedColumnIndex: 5, focusedCardIndex: 0, showMoveMenu: true };
    const r = reduceKey(state, { key: '1' }, ctx());
    expect(r.action).toEqual({ type: 'readonly', cardId: 'B-1' });
  });

  it('Escape closes the menu when open', () => {
    const state = { focusedColumnIndex: 3, focusedCardIndex: 0, showMoveMenu: true };
    const r = reduceKey(state, { key: 'Escape' }, ctx());
    expect(r.state.showMoveMenu).toBe(false);
    expect(r.action).toEqual({ type: 'close-menu' });
  });
});

describe('reduceKey — details', () => {
  it('Enter on a focused card emits a details action with the card', () => {
    const state = { focusedColumnIndex: 3, focusedCardIndex: 1, showMoveMenu: false };
    const r = reduceKey(state, { key: 'Enter' }, ctx());
    expect(r.action.type).toBe('details');
    expect(r.action.card.id).toBe('R-2');
  });

  it('Enter while the menu is open does not open details', () => {
    const state = { focusedColumnIndex: 3, focusedCardIndex: 1, showMoveMenu: true };
    const r = reduceKey(state, { key: 'Enter' }, ctx());
    expect(r.action).not.toMatchObject({ type: 'details' });
  });

  it('unhandled keys return the state unchanged and a null action', () => {
    const r = reduceKey(base, { key: 'x' }, ctx());
    expect(r.state).toEqual(base);
    expect(r.action).toBeNull();
  });
});

describe('buildCardDetails', () => {
  it('maps a story into a display object', () => {
    const story = {
      id: 'US-E1-02',
      title: 'Atomes web',
      status: 'review',
      priority: 'should',
      story_points: 8,
      epic_id: 'E1',
      persona: 'P-001',
      assigned_to: 'workflow',
      tdd_phase: 'green',
      tasks: { total: 4, completed: 2 },
      _writable: false,
    };
    const d = buildCardDetails(story);
    expect(d).toMatchObject({
      id: 'US-E1-02',
      title: 'Atomes web',
      status: 'review',
      priority: 'should',
      storyPoints: 8,
      epicId: 'E1',
      persona: 'P-001',
      assignedTo: 'workflow',
      tddPhase: 'green',
      readOnly: true,
    });
    expect(d.tasks).toEqual({ total: 4, completed: 2 });
  });

  it('flags writable stories as not read-only and tolerates missing fields', () => {
    const d = buildCardDetails({ id: 'US-1', title: 'x', status: 'backlog', _writable: true });
    expect(d.readOnly).toBe(false);
    expect(d.tasks).toEqual({ total: 0, completed: 0 });
    expect(d.blockedReason).toBe('');
  });
});
