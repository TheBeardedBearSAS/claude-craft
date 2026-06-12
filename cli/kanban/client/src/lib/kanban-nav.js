// Keyboard-navigation logic for the Kanban board. Pure (no Svelte/DOM) so it is unit-testable.
// The Svelte view is a thin adapter: it builds `ctx`, calls reduceKey(), applies the returned
// state, and dispatches the returned action (focus a card, open/close the move menu, move a
// card, signal a read-only card, or open the detail modal).

/**
 * Find a card's column/card index on the board.
 * @returns {{columnIndex:number, cardIndex:number} | null}
 */
export function locateCard(storiesByStatus, columns, cardId) {
  for (let c = 0; c < columns.length; c++) {
    const cards = storiesByStatus[columns[c].key] ?? [];
    const idx = cards.findIndex((s) => s.id === cardId);
    if (idx !== -1) return { columnIndex: c, cardIndex: idx };
  }
  return null;
}

function clamp(n, min, max) {
  return Math.max(min, Math.min(n, max));
}

const noop = (state) => ({ state, action: null });

/**
 * Reduce a keyboard event into the next navigation state + an action descriptor.
 *
 * @param {{focusedColumnIndex:number, focusedCardIndex:number, showMoveMenu:boolean}} state
 * @param {{key:string, altKey?:boolean}} event
 * @param {{columns:Array<{key:string,label:string}>, storiesByStatus:Record<string,object[]>}} ctx
 * @returns {{state:object, action:object|null}}
 */
export function reduceKey(state, event, ctx) {
  const { columns, storiesByStatus } = ctx;
  const { key, altKey } = event;
  const colKey = (i) => columns[i]?.key;
  const cardsIn = (i) => storiesByStatus[colKey(i)] ?? [];

  // Alt+M : toggle the move menu, only when a card is focused.
  if (altKey && key === 'm') {
    const card = cardsIn(state.focusedColumnIndex)[state.focusedCardIndex];
    if (state.focusedCardIndex < 0 || !card) return noop(state);
    if (state.showMoveMenu) {
      return { state: { ...state, showMoveMenu: false }, action: { type: 'close-menu' } };
    }
    return { state: { ...state, showMoveMenu: true }, action: { type: 'open-menu' } };
  }

  // Vertical navigation within the focused column.
  if (key === 'ArrowDown' || key === 'ArrowUp') {
    const cards = cardsIn(state.focusedColumnIndex);
    if (cards.length === 0) return noop(state);
    const next =
      key === 'ArrowDown'
        ? clamp(state.focusedCardIndex + 1, 0, cards.length - 1)
        : clamp(state.focusedCardIndex - 1, 0, cards.length - 1);
    return { state: { ...state, focusedCardIndex: next }, action: { type: 'focus', cardId: cards[next].id } };
  }

  // Horizontal navigation between columns; reset to the first card of the new column.
  if (key === 'ArrowRight' || key === 'ArrowLeft') {
    const nextCol =
      key === 'ArrowRight'
        ? clamp(state.focusedColumnIndex + 1, 0, columns.length - 1)
        : clamp(state.focusedColumnIndex - 1, 0, columns.length - 1);
    const cards = cardsIn(nextCol);
    const action = cards.length > 0 ? { type: 'focus', cardId: cards[0].id } : null;
    return { state: { ...state, focusedColumnIndex: nextCol, focusedCardIndex: 0 }, action };
  }

  // Move menu open: number keys 1-6 target a column, Escape closes.
  if (state.showMoveMenu) {
    if (/^[1-6]$/.test(key)) {
      const target = columns[parseInt(key, 10) - 1];
      const card = cardsIn(state.focusedColumnIndex)[state.focusedCardIndex];
      if (target && card) {
        if (card._writable === false) return { state, action: { type: 'readonly', cardId: card.id } };
        return { state, action: { type: 'move', cardId: card.id, targetStatus: target.key } };
      }
      return noop(state);
    }
    if (key === 'Escape') {
      return { state: { ...state, showMoveMenu: false }, action: { type: 'close-menu' } };
    }
  }

  // Enter opens the focused card's details (when the move menu is closed).
  if (key === 'Enter' && !state.showMoveMenu) {
    const card = cardsIn(state.focusedColumnIndex)[state.focusedCardIndex];
    if (card) return { state, action: { type: 'details', card } };
    return noop(state);
  }

  return noop(state);
}

/**
 * Normalize a story into the fields the detail modal renders. Pure + defensive against
 * missing fields (YAML-only stories omit several).
 */
export function buildCardDetails(story) {
  return {
    id: story.id,
    title: story.title ?? story.id,
    status: story.status ?? '',
    priority: story.priority ?? '',
    storyPoints: story.story_points ?? 0,
    epicId: story.epic_id ?? null,
    persona: story.persona ?? '',
    assignedTo: story.assigned_to ?? '',
    tddPhase: story.tdd_phase ?? '',
    tasks: {
      total: story.tasks?.total ?? 0,
      completed: story.tasks?.completed ?? 0,
    },
    blockedReason: story.blocked_reason ?? '',
    readOnly: story._writable === false,
  };
}
