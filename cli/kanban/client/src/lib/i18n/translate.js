/* ============================================================
   i18n — fonctions pures (aucune dépendance Svelte ni DOM).
   Catalogue = objet plat { 'zone.cle': 'Texte avec {param}' }.
   Aucune fonction ne lève : une clé manquante s'affiche telle quelle.
   ============================================================ */

export const SUPPORTED_LOCALES = ['en', 'fr', 'es', 'de', 'pt'];

const TOKEN_RE = /\{(\w+)\}/g;

function interpolate(text, params) {
  if (!params) return text;
  return text.replace(TOKEN_RE, (token, name) =>
    params[name] === undefined || params[name] === null ? token : String(params[name])
  );
}

function lookup(catalog, key) {
  const value = catalog?.[key];
  return typeof value === 'string' ? value : undefined;
}

/** Texte du catalogue, sinon du repli (en), sinon la clé elle-même. */
export function translate(catalog, fallback, key, params) {
  const k = String(key ?? '');
  return interpolate(lookup(catalog, k) ?? lookup(fallback, k) ?? k, params);
}

/** `key.one` ou `key.other` selon `Intl.PluralRules` (autres catégories → other). */
export function pluralKey(locale, key, n) {
  let category = 'other';
  try {
    category = new Intl.PluralRules(locale).select(n);
  } catch {
    /* locale invalide → forme "other" */
  }
  return `${key}.${category === 'one' ? 'one' : 'other'}`;
}

/** Pluriel traduit ; `{n}` est injecté (surchargeable) ; repli sur `.other`. */
export function translatePlural(catalog, fallback, locale, key, n, params) {
  let k = pluralKey(locale, key, n);
  if (lookup(catalog, k) === undefined && lookup(fallback, k) === undefined) k = `${key}.other`;
  return translate(catalog, fallback, k, { n, ...params });
}

const DATE_ONLY_RE = /^\d{4}-\d{2}-\d{2}$/;

function format(Ctor, locale, options, value) {
  try {
    return new Ctor(locale, options).format(value);
  } catch {
    return new Ctor('en', options).format(value);
  }
}

/** Date ISO (jour seul ou horodatage) → texte localisé ; invalide → ''. */
export function formatDate(locale, iso, opts = { dateStyle: 'medium' }) {
  if (!iso) return '';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  // Un jour seul est interprété en UTC : on le formate en UTC pour éviter tout décalage.
  const options = DATE_ONLY_RE.test(String(iso)) ? { timeZone: 'UTC', ...opts } : opts;
  return format(Intl.DateTimeFormat, locale, options, date);
}

/** Nombre localisé ; non fini → ''. */
export function formatNumber(locale, n) {
  if (typeof n !== 'number' || !Number.isFinite(n)) return '';
  return format(Intl.NumberFormat, locale, undefined, n);
}

function baseLanguage(tag) {
  return String(tag ?? '')
    .split(/[-_]/)[0]
    .toLowerCase();
}

/** Langue sauvegardée > langues du navigateur (région ignorée) > 'en'. */
export function pickLocale(saved, navigatorLangs, supported = SUPPORTED_LOCALES) {
  if (supported.includes(saved)) return saved;
  const candidates = (navigatorLangs ?? []).map(baseLanguage);
  return candidates.find((lang) => supported.includes(lang)) ?? 'en';
}
