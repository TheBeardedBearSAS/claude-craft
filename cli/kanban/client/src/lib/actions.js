// Svelte actions shared by the views. DOM only — exercised by the browser specs (website/tests/kanban).

/**
 * Rendered markdown can contain code blocks and tables wider than the page. A scrollable region that holds
 * no focusable element is unreachable by keyboard (axe: scrollable-region-focusable), so make those focusable.
 * `content` is only the update trigger: pass the HTML string being rendered.
 */
export function scrollable(node, _content) {
  const apply = () => {
    for (const el of node.querySelectorAll('pre, table')) el.tabIndex = 0;
  };
  apply();
  return { update: apply };
}

/** Keyboard stop for a region that scrolls on its own (wide table): its content may hold nothing focusable. */
export function focusable(node) {
  node.tabIndex = 0;
}

/**
 * A <dialog> holding a form: Escape and the browser's other close requests call `tryClose` (which asks before
 * unsaved input is thrown away) instead of closing it. Escape is taken on keydown, before it becomes a close
 * request: Chrome/Edge honour preventDefault() on `cancel` only once per user activation, and pressing Escape
 * again would close the dialog with its input. A close request that can no longer be cancelled is let through
 * (asking would leave a question about a form that is gone).
 */
export function asksBeforeClosing(node, tryClose) {
  let ask = tryClose;
  const onKeydown = (e) => {
    if (e.key !== 'Escape' || e.defaultPrevented) return;
    e.preventDefault();
    ask();
  };
  const onCancel = (e) => {
    if (!e.cancelable) return;
    e.preventDefault();
    ask();
  };
  node.addEventListener('keydown', onKeydown);
  node.addEventListener('cancel', onCancel);
  return {
    update: (next) => (ask = next),
    destroy() {
      node.removeEventListener('keydown', onKeydown);
      node.removeEventListener('cancel', onCancel);
    },
  };
}
