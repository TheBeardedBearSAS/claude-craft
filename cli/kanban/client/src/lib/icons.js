/* ============================================================
   Icônes inline (stroke-based, viewBox 0 0 24 24).
   Chaque entrée = markup interne du <svg>, rendu par Icon.svelte.
   Porté depuis le prototype Claude Design (helpers.jsx).
   ============================================================ */

export const ICONS = {
  board:
    '<rect x="3" y="3" width="6" height="18" rx="1.5"/><rect x="9.5" y="3" width="6" height="11" rx="1.5"/><rect x="16" y="3" width="5" height="15" rx="1.5"/>',
  backlog: '<path d="M4 6h16M4 12h16M4 18h10"/>',
  sprint: '<path d="M4 12a8 8 0 1 1 8 8"/><path d="M12 8v4l3 2"/><path d="M4 12l-2-2m2 2l2-2"/>',
  burndown: '<path d="M4 4v16h16"/><path d="M20 7L13 13l-3-2-3 4"/>',
  deps: '<circle cx="6" cy="6" r="2.4"/><circle cx="18" cy="9" r="2.4"/><circle cx="9" cy="18" r="2.4"/><path d="M8 7.2l7.8 1M8 16.4l8.6-6"/>',
  docs: '<path d="M6 3h8l4 4v14a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z"/><path d="M13 3v5h5M8 13h8M8 17h6"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.2-3.2"/>',
  lock: '<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
  person: '<circle cx="12" cy="8" r="3.4"/><path d="M5.5 20a6.5 6.5 0 0 1 13 0"/>',
  check: '<path d="M4 12.5 9 17.5 20 6.5"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  close: '<path d="M6 6l12 12M18 6 6 18"/>',
  chevron: '<path d="M9 6l6 6-6 6"/>',
  down: '<path d="M6 9l6 6 6-6"/>',
  settings:
    '<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2"/>',
  bell: '<path d="M6 9a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6z"/><path d="M10 19a2 2 0 0 0 4 0"/>',
  filter: '<path d="M3 5h18l-7 8v6l-4-2v-4z"/>',
  warn: '<path d="M12 3 2 20h20z"/><path d="M12 9v5M12 17h.01"/>',
  arrowR: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  link: '<path d="M10 14a4 4 0 0 0 6 .5l2-2a4 4 0 0 0-6-6l-1 1"/><path d="M14 10a4 4 0 0 0-6-.5l-2 2a4 4 0 0 0 6 6l1-1"/>',
  folder: '<path d="M3 7a1 1 0 0 1 1-1h5l2 2h8a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z"/>',
  file: '<path d="M7 3h7l4 4v14H7z"/><path d="M14 3v4h4"/>',
  copy: '<rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h8"/>',
};
