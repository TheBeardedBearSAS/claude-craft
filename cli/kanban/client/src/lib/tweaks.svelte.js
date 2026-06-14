/* ============================================================
   Panneau Tweaks — état réactif persisté (localStorage).
   - codingScheme : couleur de la barre des cartes (board)
   - accent       : surcharge les variables --accent* (runtime)
   - density      : compact | comfortable (attribut sur .app-shell)
   ============================================================ */
import { CODING_SCHEMES } from './config.js';

const STORAGE_KEY = 'cc-kanban-tweaks';

/** Palettes d'accent proposées (a = accent, d = dim, f = foreground). */
export const ACCENTS = {
  lime: { a: 'oklch(0.88 0.21 126)', d: 'oklch(0.72 0.16 126)', f: 'oklch(0.22 0.05 126)', hex: '#bdf03d' },
  cyan: { a: 'oklch(0.83 0.13 200)', d: 'oklch(0.68 0.11 200)', f: 'oklch(0.18 0.04 215)', hex: '#3fd0e0' },
  violet: { a: 'oklch(0.74 0.17 295)', d: 'oklch(0.62 0.16 295)', f: 'oklch(0.98 0.01 295)', hex: '#a78bfa' },
  amber: { a: 'oklch(0.84 0.15 75)', d: 'oklch(0.73 0.13 70)', f: 'oklch(0.24 0.05 70)', hex: '#f5c44e' },
};

export const DENSITIES = ['comfortable', 'compact'];

const DEFAULTS = { codingScheme: 'status', accent: 'lime', density: 'comfortable' };

/** État réactif partagé. */
export const tweaks = $state({ ...DEFAULTS });

function load() {
  if (typeof localStorage === 'undefined') return;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const saved = JSON.parse(raw);
    if (CODING_SCHEMES.includes(saved.codingScheme)) tweaks.codingScheme = saved.codingScheme;
    if (ACCENTS[saved.accent]) tweaks.accent = saved.accent;
    if (DENSITIES.includes(saved.density)) tweaks.density = saved.density;
  } catch {
    /* localStorage corrompu → on garde les défauts */
  }
}

function persist() {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...tweaks }));
  } catch {
    /* quota / mode privé → ignore */
  }
}

/** Applique l'accent courant aux variables CSS racine. */
export function applyAccent() {
  if (typeof document === 'undefined') return;
  const ac = ACCENTS[tweaks.accent] || ACCENTS.lime;
  const root = document.documentElement.style;
  root.setProperty('--accent', ac.a);
  root.setProperty('--accent-dim', ac.d);
  root.setProperty('--accent-fg', ac.f);
  root.setProperty('--accent-soft', `color-mix(in oklch, ${ac.a} 13%, transparent)`);
  root.setProperty('--accent-ring', `color-mix(in oklch, ${ac.a} 55%, transparent)`);
}

/** Met à jour un réglage, persiste, et applique si nécessaire. */
export function setTweak(key, value) {
  if (!(key in tweaks)) return;
  tweaks[key] = value;
  if (key === 'accent') applyAccent();
  persist();
}

/** À appeler une fois au démarrage (onMount). */
export function initTweaks() {
  load();
  applyAccent();
}
