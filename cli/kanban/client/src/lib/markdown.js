// Markdown rendering shared by the detail modal, the Sprints view and the Docs view.
// Pure part (no DOM): createRenderer, linkifyStoryIds, demoteHeadings.
// DOM part: renderMarkdown, which lazily loads marked + DOMPurify (keeps them out of the main bundle).

import { STORY_ID_RE } from '../../../shared/ids.js';
import { formatHash } from './query.js';

export const RENDER_ERROR_HTML = '<p>Error rendering markdown</p>';

/** @param {{ parse: (src:string)=>string, sanitize: (html:string)=>string }} deps */
export function createRenderer({ parse, sanitize }) {
  return (src) => {
    if (!src) return '';
    try {
      return sanitize(parse(src));
    } catch {
      return RENDER_ERROR_HTML;
    }
  };
}

// Same id grammar as the server (shared/ids.js), unanchored, not preceded by an id character.
const ID_IN_TEXT = new RegExp(`(?<![A-Za-z0-9])${STORY_ID_RE.source.replace(/^\^|\$$/g, '')}`, 'g');
const OPAQUE = new Set(['a', 'code', 'pre']);

function tagInfo(token) {
  const m = /^<(\/?)([a-zA-Z][a-zA-Z0-9]*)/.exec(token);
  if (!m || token.endsWith('/>')) return null;
  return { closing: m[1] === '/', name: m[2].toLowerCase() };
}

/**
 * Turn story ids found in text nodes into links to `?story=<id>`, keeping the current route.
 * Ids inside <a>, <code> and <pre>, and inside tag attributes, are left alone.
 * @param {string} html sanitized HTML
 * @param {{ name?: string, params?: object, query?: object }} [route]
 */
export function linkifyStoryIds(html, route = {}) {
  const { name = 'kanban', params = {}, query = {} } = route;
  const href = (id) => formatHash(name, params, { ...query, story: id });
  let depth = 0;
  return String(html ?? '')
    .split(/(<[^>]*>)/)
    .map((token) => {
      if (token.startsWith('<')) {
        const tag = tagInfo(token);
        if (tag && OPAQUE.has(tag.name)) depth = Math.max(0, depth + (tag.closing ? -1 : 1));
        return token;
      }
      return depth ? token : token.replace(ID_IN_TEXT, (id) => `<a href="${href(id)}">${id}</a>`);
    })
    .join('');
}

/** Shift h1..h5 down by `by` levels (h6 is the floor) so rendered content never adds a second h1. */
export function demoteHeadings(html, by = 1) {
  return String(html ?? '').replace(
    /<(\/?)h([1-6])(?=[\s>])/g,
    (_m, slash, level) => `<${slash}h${Math.min(6, Number(level) + by)}`
  );
}

let renderer = null;

async function loadRenderer() {
  const [{ marked }, dompurify] = await Promise.all([import('marked'), import('dompurify')]);
  const DOMPurify = dompurify.default ?? dompurify;
  return createRenderer({ parse: (s) => marked.parse(s), sanitize: (h) => DOMPurify.sanitize(h) });
}

/**
 * marked + DOMPurify, default configuration (as in the former per-view copies).
 * @param {string} src markdown
 * @param {{ linkRoute?: object, demote?: number }} [opts] linkRoute: route to keep when linkifying story ids
 */
export async function renderMarkdown(src, { linkRoute, demote = 0 } = {}) {
  if (!src) return '';
  try {
    renderer ??= await loadRenderer();
  } catch {
    return RENDER_ERROR_HTML;
  }
  let html = renderer(src);
  if (demote) html = demoteHeadings(html, demote);
  return linkRoute ? linkifyStoryIds(html, linkRoute) : html;
}
