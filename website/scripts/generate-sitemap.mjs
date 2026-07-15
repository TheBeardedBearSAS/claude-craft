#!/usr/bin/env node
// Generates dist/sitemap.xml after `vitepress build` (run as the npm "postbuild" hook).
// Not emitted as a static file under public/ because the page list changes with every
// content update (65+ pages x 5 locales, growing) — regenerating at build time keeps it
// accurate without manual upkeep.
// See docs/internal/SEO_AUDIT_TRACKING_20260715.md (Vague 1, item 1) and
// website/.vitepress/seo-locales.mjs for the shared URL/hreflang mapping logic.

import { existsSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import {
  SITE_URL,
  buildHreflangAlternates,
  buildLocaleGroups,
  listPageIds,
  pageToUrlPath,
} from '../.vitepress/seo-locales.mjs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const websiteRoot = resolve(__dirname, '..')
const distDir = resolve(websiteRoot, '.vitepress/dist')

if (!existsSync(distDir)) {
  console.error(
    `[sitemap] dist directory not found at ${distDir} — this script must run after "vitepress build" (see package.json "postbuild").`,
  )
  process.exit(1)
}

function escapeXml(value) {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

const pageIds = listPageIds(websiteRoot)
const localeGroups = buildLocaleGroups(pageIds)
const today = new Date().toISOString().slice(0, 10)

const urlEntries = pageIds.map((pageId) => {
  const loc = SITE_URL + pageToUrlPath(pageId)
  const alternates = buildHreflangAlternates(pageId, localeGroups)
  const alternateLines = alternates
    .map((alt) => `    <xhtml:link rel="alternate" hreflang="${alt.hreflang}" href="${escapeXml(alt.href)}"/>`)
    .join('\n')

  return [
    '  <url>',
    `    <loc>${escapeXml(loc)}</loc>`,
    `    <lastmod>${today}</lastmod>`,
    alternateLines,
    '  </url>',
  ]
    .filter(Boolean)
    .join('\n')
})

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urlEntries.join('\n')}
</urlset>
`

const outputPath = join(distDir, 'sitemap.xml')
writeFileSync(outputPath, xml, 'utf-8')
console.log(`[sitemap] wrote ${pageIds.length} URLs to ${outputPath}`)
