/* ============================================================
   i18n réactif (Svelte 5 runes).
   - `en` est importé statiquement (référence + repli) ; chaque autre langue est un
     chunk chargé à la demande (import.meta.glob → un fichier = un chunk Vite).
   - `t()` lit `i18n.locale` et le catalogue ($state) : un composant qui appelle `t()`
     dans son template/$derived se met à jour quand la langue change.
   Ordre au démarrage : initTweaks() PUIS initI18n() (la langue sauvegardée vient des Tweaks).
   ============================================================ */
import en from './locales/en.js';
import { translate, translatePlural, formatDate, formatNumber, pickLocale, SUPPORTED_LOCALES } from './translate.js';
import { tweaks, setTweak } from '../tweaks.svelte.js';

// Tous les catalogues sauf `en` ; un fichier absent ne casse ni le build ni l'exécution.
const loaders = import.meta.glob(['./locales/*.js', '!./locales/en.js']);

export const i18n = $state({ locale: 'en' });
let catalog = $state.raw(en);
let loadToken = 0;

/** Traduit une clé ; `params` remplace les jetons {name}. */
export function t(key, params) {
  return translate(catalog, en, key, params);
}

/** Pluriel : `key.one` / `key.other` selon la langue ; `{n}` est injecté. */
export function tn(key, n, params) {
  return translatePlural(catalog, en, i18n.locale, key, n, params);
}

/** Date ISO → texte localisé (invalide → ''). */
export function fmtDate(iso, opts) {
  return formatDate(i18n.locale, iso, opts);
}

/** Nombre localisé. */
export function fmtNumber(n) {
  return formatNumber(i18n.locale, n);
}

async function loadCatalog(code) {
  const load = loaders[`./locales/${code}.js`];
  if (code === 'en' || !load) return en;
  try {
    return (await load()).default ?? en;
  } catch {
    return en; // chunk injoignable : on reste lisible en anglais
  }
}

function navigatorLanguages() {
  const nav = globalThis.navigator;
  return nav?.languages?.length ? nav.languages : nav?.language ? [nav.language] : [];
}

/**
 * Change de langue. `code` null = automatique (langue du navigateur).
 * Persiste dans les Tweaks sauf `{ persist: false }` (utilisé à l'init).
 */
export async function setLocale(code, { persist = true } = {}) {
  const locale = pickLocale(code, code ? [] : navigatorLanguages(), SUPPORTED_LOCALES);
  const token = ++loadToken;
  const next = await loadCatalog(locale);
  if (token !== loadToken) return; // une demande plus récente a gagné
  catalog = next;
  i18n.locale = locale;
  if (typeof document !== 'undefined') document.documentElement.lang = locale;
  if (persist) setTweak('lang', SUPPORTED_LOCALES.includes(code) ? code : null);
}

/** Langue sauvegardée > navigator.languages > en. À appeler après initTweaks(). */
export function initI18n() {
  return setLocale(tweaks.lang, { persist: false });
}
