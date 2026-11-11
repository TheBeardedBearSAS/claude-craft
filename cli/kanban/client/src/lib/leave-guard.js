// Unsaved-input guard for URL changes (browser Back, links, `?story=`). Pure: the router owns the history calls.
// A form registers { dirty(), confirm() } while it is open; the router asks mayLeave() before applying a new URL.
// confirm() must resolve as soon as the user answers (ConfirmDialog does not wait for the dialog's `close` event):
// while it is pending (`busy`), every other URL change is held back without a second question.

export function createLeaveGuard() {
  const guards = new Set();
  const state = {
    busy: false,
    /** @param {{ dirty: () => boolean, confirm: () => Promise<boolean> }} guard @returns {() => void} remover */
    add(guard) {
      guards.add(guard);
      return () => guards.delete(guard);
    },
    isDirty: () => [...guards].some((g) => g.dirty()),
    /** true when nothing unsaved is at stake, or the user chose to discard it. */
    async mayLeave() {
      const dirty = [...guards].find((g) => g.dirty());
      if (!dirty) return true;
      state.busy = true;
      try {
        return await dirty.confirm();
      } finally {
        state.busy = false;
      }
    },
  };
  return state;
}
