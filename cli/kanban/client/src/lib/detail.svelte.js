// Shared story-detail modal state (Svelte 5 runes). Both the Kanban board and the
// Backlog open the SAME detail dialog through openDetail() — bug #3: backlog rows
// were not clickable and had no way to reach a story's details. The <StoryDetail>
// component (mounted once in App) renders whatever `detail.card` points to.

export const detail = $state({
  card: null,
  tasks: [],
  body: '',
  loading: false,
});

// Element to refocus when the modal closes (WCAG 2.4.3 focus return).
let triggerEl = null;

export async function openDetail(card) {
  if (!card) return;
  triggerEl = typeof document !== 'undefined' ? document.activeElement : null;
  detail.card = card;
  detail.tasks = [];
  detail.body = '';
  await loadDetailExtras(card.id);
}

// Reset state only. Focus return is handled by <StoryDetail> AFTER the <dialog>
// is unmounted (tick), via consumeTrigger() — focusing while the modal dialog is
// still in the DOM is unreliable (focus falls back to <body> on some AT/Safari).
export function closeDetail() {
  detail.card = null;
  detail.tasks = [];
  detail.body = '';
}

/** Hand the trigger element to the caller and forget it (single-use). */
export function consumeTrigger() {
  const el = triggerEl;
  triggerEl = null;
  return el;
}

/**
 * Load tasks + markdown body for the open story and render the markdown.
 * marked/DOMPurify are imported lazily so the board bundle stays light.
 */
async function loadDetailExtras(id) {
  detail.loading = true;
  try {
    const res = await fetch(`/api/stories/${encodeURIComponent(id)}`);
    if (!res.ok) return;
    const data = await res.json();
    if (detail.card?.id !== id) return; // a newer card was opened meanwhile
    detail.tasks = data.tasks ?? [];
    if (data.body) {
      const [{ marked }, dompurify] = await Promise.all([import('marked'), import('dompurify')]);
      const DOMPurify = dompurify.default ?? dompurify;
      if (detail.card?.id === id) detail.body = DOMPurify.sanitize(marked.parse(data.body));
    }
  } catch {
    /* keep the base details derived from the frontmatter */
  } finally {
    detail.loading = false;
  }
}
