// Unsaved-input guard for URL changes (browser Back, links, `?story=`). Pure: the router owns the history calls.
// A form registers { dirty(), confirm() } while it is open; the router asks mayLeave() before applying a new URL.

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
