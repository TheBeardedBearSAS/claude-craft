/* ============================================================
   Panneau Tweaks — état réactif persisté (localStorage).
   - codingScheme : couleur de la barre des cartes (board)
   - accent       : surcharge les variables --accent* (runtime)
   - density      : compact | comfortable (attribut sur .app-shell)
   - lang         : code de langue, null = automatique (navigateur)
   ============================================================ */
import { CODING_SCHEMES, ACCENTS } from './config.js';
import { SUPPORTED_LOCALES } from './i18n/translate.js';

const STORAGE_KEY = 'cc-kanban-tweaks';

export { ACCENTS };

export const DENSITIES = ['comfortable', 'compact'];

const DEFAULTS = { codingScheme: 'status', accent: 'lime', density: 'comfortable', lang: null };

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
    if (SUPPORTED_LOCALES.includes(saved.lang)) tweaks.lang = saved.lang;
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
