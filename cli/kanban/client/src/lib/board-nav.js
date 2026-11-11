// Keyboard-navigation logic for the Kanban board. Pure (no Svelte/DOM) so it is unit-testable.
// Replaces kanban-nav.js (same input/output shape: build `ctx`, call reduceKey(), apply the returned
// state, dispatch the returned action). Differences (audit K-16):
//   - Move menu open: arrow keys are inert, and Enter / Space are NOT intercepted (the native menu
//     buttons handle them). Only 1-6 (move) and Escape (close) are handled there.
//   - Digits 1-6 are ignored while a prompt is open (`ctx.promptOpen`): the prompt owns the keyboard.
//     Every key is inert in that case.
//   - The shortcut is Alt+M detected on `event.code === 'KeyM'` (on macOS Alt+M yields key 'µ').
//   - No environment flag: the module always applies these rules.

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

const currentCard = (state, ctx) =>
  (ctx.storiesByStatus[ctx.columns[state.focusedColumnIndex]?.key] ?? [])[state.focusedCardIndex];

function toggleMenu(state, ctx) {
  if (state.focusedCardIndex < 0 || !currentCard(state, ctx)) return noop(state);
  const open = !state.showMoveMenu;
  return { state: { ...state, showMoveMenu: open }, action: { type: open ? 'open-menu' : 'close-menu' } };
}

// Move menu open: only 1-6 and Escape; arrows, Enter and Space are left to the native buttons.
function reduceMenuKey(state, key, ctx) {
  if (key === 'Escape') return { state: { ...state, showMoveMenu: false }, action: { type: 'close-menu' } };
  if (!/^[1-6]$/.test(key)) return noop(state);
  const target = ctx.columns[parseInt(key, 10) - 1];
  const card = currentCard(state, ctx);
  if (!target || !card) return noop(state);
  if (card._writable === false) return { state, action: { type: 'readonly', cardId: card.id } };
  return { state, action: { type: 'move', cardId: card.id, targetStatus: target.key } };
}

function reduceArrow(state, key, ctx) {
  const { columns, storiesByStatus } = ctx;
  const cardsIn = (i) => storiesByStatus[columns[i]?.key] ?? [];
  if (key === 'ArrowDown' || key === 'ArrowUp') {
    const cards = cardsIn(state.focusedColumnIndex);
    if (cards.length === 0) return noop(state);
    const next = clamp(state.focusedCardIndex + (key === 'ArrowDown' ? 1 : -1), 0, cards.length - 1);
    return { state: { ...state, focusedCardIndex: next }, action: { type: 'focus', cardId: cards[next].id } };
  }
  // Horizontal: reset to the first card of the new column.
  const nextCol = clamp(state.focusedColumnIndex + (key === 'ArrowRight' ? 1 : -1), 0, columns.length - 1);
  const cards = cardsIn(nextCol);
  const action = cards.length > 0 ? { type: 'focus', cardId: cards[0].id } : null;
  return { state: { ...state, focusedColumnIndex: nextCol, focusedCardIndex: 0 }, action };
}

const ARROWS = new Set(['ArrowDown', 'ArrowUp', 'ArrowRight', 'ArrowLeft']);

/**
 * Reduce a keyboard event into the next navigation state + an action descriptor.
 *
 * @param {{focusedColumnIndex:number, focusedCardIndex:number, showMoveMenu:boolean}} state
 * @param {{key:string, code?:string, altKey?:boolean}} event
 * @param {{columns:Array<{key:string,label:string}>, storiesByStatus:Record<string,object[]>, promptOpen?:boolean}} ctx
 * @returns {{state:object, action:object|null}}
 */
export function reduceKey(state, event, ctx) {
  const { key, code, altKey } = event;
  if (ctx.promptOpen) return noop(state);
  if (altKey && code === 'KeyM') return toggleMenu(state, ctx);
  if (state.showMoveMenu) return reduceMenuKey(state, key, ctx);
  if (ARROWS.has(key)) return reduceArrow(state, key, ctx);
  if (key === 'Enter') {
    const card = currentCard(state, ctx);
    return card ? { state, action: { type: 'details', card } } : noop(state);
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
