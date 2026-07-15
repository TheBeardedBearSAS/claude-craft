// SEO helpers shared between the VitePress build hook (`config.mts`, runs per-page
// during build) and the sitemap generator (`scripts/generate-sitemap.mjs`, runs on the
// built dist after `vitepress build`). Kept in a plain .mjs module so both a TS build
// hook and a standalone Node script can import the exact same logic without diverging
// (docs/internal/SEO_AUDIT_TRACKING_20260715.md, Vague 1, items 1-2).

import { readdirSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'

export const SITE_URL = 'https://thebeardedbearsas.github.io/claude-craft/'
export const LOCALES = ['en', 'fr', 'es', 'de', 'pt']

// VitePress page ids are the source path relative to srcDir, e.g. "en/reference/cli.md"
// or "index.md" / "en/index.md" for section roots (cleanUrls: true strips the extension).
// Mirrors the mapping used by `transformHead` in config.mts — keep both in sync.
export function pageToUrlPath(page) {
  const noExt = page.replace(/\.md$/, '')
  if (noExt === 'index') return ''
  if (noExt.endsWith('/index')) return noExt.slice(0, -'index'.length)
  return noExt
}

function walkMarkdown(dir) {
  const out = []
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name)
    if (entry.isDirectory()) {
      out.push(...walkMarkdown(full))
    } else if (entry.isFile() && entry.name.endsWith('.md')) {
      out.push(full)
    }
  }
  return out
}

// Lists every markdown page id (relative to srcDir) for the root index page plus
// every locale directory. Locale directories are scanned defensively — i18n parity
// between locales is not guaranteed (see MEMORY project_website_lighthouse gotchas).
export function listPageIds(srcDir) {
  const ids = []

  try {
    statSync(join(srcDir, 'index.md'))
    ids.push('index.md')
  } catch {
    // no root landing page — nothing to add
  }

  for (const locale of LOCALES) {
    const localeDir = join(srcDir, locale)
    let files
    try {
      files = walkMarkdown(localeDir)
    } catch {
      continue // locale directory missing entirely
    }
    for (const file of files) {
      const rel = relative(localeDir, file).split(/[\\/]/).join('/')
      ids.push(`${locale}/${rel}`)
    }
  }

  return ids
}

// Strips the locale prefix from a page id, e.g. "en/guides/x.md" -> { locale: "en", key: "guides/x.md" }.
// Returns null for pages without a locale prefix (e.g. the root "index.md" landing page,
// which is English-only and has no translated variants).
export function localeGroupKey(pageId) {
  const match = /^(en|fr|es|de|pt)\/(.+)$/.exec(pageId)
  if (!match) return null
  return { locale: match[1], key: match[2] }
}

// Builds a map: groupKey -> { locale: urlPath, ... } so callers can resolve every
// translated variant of a given page (same relative path across locale directories).
export function buildLocaleGroups(pageIds) {
  const groups = new Map()
  for (const pageId of pageIds) {
    const grouped = localeGroupKey(pageId)
    if (!grouped) continue
    const urlPath = pageToUrlPath(pageId)
    const variants = groups.get(grouped.key) ?? {}
    variants[grouped.locale] = urlPath
    groups.set(grouped.key, variants)
  }
  return groups
}

// Returns the hreflang alternates (every available locale variant + x-default -> en)
// for a page, or an empty array if the page has no locale prefix or no group exists.
export function buildHreflangAlternates(pageId, groups) {
  const grouped = localeGroupKey(pageId)
  if (!grouped) return []
  const variants = groups.get(grouped.key)
  if (!variants) return []

  const alternates = Object.entries(variants).map(([locale, urlPath]) => ({
    hreflang: locale,
    href: SITE_URL + urlPath,
  }))

  // x-default: only emit if an English variant exists (the site's reference locale).
  if (variants.en) {
    alternates.push({ hreflang: 'x-default', href: SITE_URL + variants.en })
  }

  return alternates
}
