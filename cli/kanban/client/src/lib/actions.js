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
