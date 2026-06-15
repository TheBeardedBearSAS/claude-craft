/* ============================================================
   Config + coloration — logique pure, testée (vitest).
   Utilise les noms de champs Svelte (status, priority,
   tdd_phase, epic_id, assigned_to), pas ceux du prototype.
   ============================================================ */

/** Colonnes / statuts du board, avec la variable CSS de teinte. */
export const STATUS = {
  backlog: { label: 'Backlog', cssVar: '--st-backlog' },
  'ready-for-dev': { label: 'Ready for Dev', cssVar: '--st-ready' },
  'in-progress': { label: 'In Progress', cssVar: '--st-in-progress' },
  review: { label: 'Review', cssVar: '--st-review' },
  done: { label: 'Done', cssVar: '--st-done' },
  blocked: { label: 'Blocked', cssVar: '--st-blocked' },
};

/** Priorités MoSCoW. */
export const PRIORITY = {
  must: { label: 'Must', cssVar: '--pri-must' },
  should: { label: 'Should', cssVar: '--pri-should' },
  could: { label: 'Could', cssVar: '--pri-could' },
  wont: { label: "Won't", cssVar: '--pri-wont' },
};

/** Phases TDD. */
export const TDD = {
  red: { label: 'Red', cssVar: '--tdd-red' },
  green: { label: 'Green', cssVar: '--tdd-green' },
  refactor: { label: 'Refactor', cssVar: '--tdd-refactor' },
  done: { label: 'Done', cssVar: '--success' },
};

/** Couleurs par type de tâche (modale détail). Clés alignées sur le schéma
 *  TASK_TYPES = ['DB','BE','FE-WEB','FE-MOB','TEST','DOC','OPS','REV']. */
export const TASK_TYPE = {
  DB: 'oklch(0.74 0.13 300)',
  BE: 'oklch(0.74 0.13 236)',
  'FE-WEB': 'oklch(0.80 0.14 145)',
  'FE-MOB': 'oklch(0.80 0.14 175)',
  TEST: 'oklch(0.82 0.14 60)',
  DOC: 'oklch(0.70 0.02 264)',
  OPS: 'oklch(0.74 0.13 30)',
  REV: 'oklch(0.74 0.13 330)',
};

/** Schémas de code couleur proposés par le panneau Tweaks. */
export const CODING_SCHEMES = ['status', 'priority', 'tdd', 'epic'];

/** Hash de chaîne stable (djb2) → entier positif. */
export function hashString(str) {
  let h = 5381;
  const s = String(str ?? '');
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) >>> 0;
  return h;
}

/**
 * Teinte déterministe d'un epic (indépendante de l'ordre du tableau).
 * Retourne une couleur oklch, ou --fg-faint si l'id est vide.
 */
export function epicHue(epicId) {
  if (!epicId) return 'var(--fg-faint)';
  const hue = hashString(epicId) % 360;
  return `oklch(0.78 0.13 ${hue})`;
}

/**
 * Couleur de la barre d'accent gauche d'une carte selon le schéma actif.
 * @param {object} story  story (champs Svelte)
 * @param {string} scheme status|priority|tdd|epic
 */
export function codeColor(story, scheme) {
  if (!story) return 'var(--border)';
  if (scheme === 'priority') {
    return `var(${PRIORITY[story.priority]?.cssVar || '--fg-faint'})`;
  }
  if (scheme === 'tdd') {
    return `var(${TDD[story.tdd_phase]?.cssVar || '--fg-faint'})`;
  }
  if (scheme === 'epic') {
    return epicHue(story.epic_id);
  }
  // défaut : statut
  return `var(${STATUS[story.status]?.cssVar || '--border'})`;
}

/** Initiales (max 2 lettres majuscules) à partir d'un nom/identifiant. */
export function initials(name) {
  const s = String(name ?? '').trim();
  if (!s) return '?';
  const parts = s.split(/[\s._-]+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return s.slice(0, 2).toUpperCase();
}

/** Couleur d'avatar déterministe (fond clair, texte sombre via CSS). */
export function avatarColor(name) {
  if (!name) return 'var(--bg-inset)';
  const hue = hashString(name) % 360;
  return `oklch(0.78 0.12 ${hue})`;
}
