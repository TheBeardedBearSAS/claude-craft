#!/usr/bin/env node
// split-commands.mjs — split the dense Commands reference into one light index page
// plus one small page per command namespace. Keeps the page Lighthouse-100-friendly
// (each page small) while preserving all content and search. Idempotent: re-running on
// an already-split index is a no-op. Locale-agnostic (operates on markdown structure).
//
// Usage: node split-commands.mjs <path/to/commands.md> <baseUrlPath>
//   e.g. node split-commands.mjs website/en/reference/commands.md /claude-craft/en/reference/commands

import { readFileSync, writeFileSync, mkdirSync, rmSync } from 'node:fs';
import { dirname, join, basename } from 'node:path';

const [file, baseUrl = ''] = process.argv.slice(2);
if (!file) {
  console.error('usage: split-commands.mjs <commands.md> <baseUrlPath>');
  process.exit(1);
}

const raw = readFileSync(file, 'utf8');

// Split off YAML frontmatter (kept on the index page).
let frontmatter = '';
let body = raw;
const fm = raw.match(/^---\n[\s\S]*?\n---\n/);
if (fm) {
  frontmatter = fm[0];
  body = raw.slice(fm[0].length);
}

// Partition the body into the preamble (before the first H2) and H2 sections.
const lines = body.split('\n');
const preamble = [];
const sections = []; // { heading, text, lines: [] }
let cur = null;
for (const line of lines) {
  const m = line.match(/^## (.+?)\s*$/);
  if (m) {
    cur = { heading: line, text: m[1], lines: [line] };
    sections.push(cur);
  } else if (cur) {
    cur.lines.push(line);
  } else {
    preamble.push(line);
  }
}

// A namespace section's heading carries a `(`/xxx:`)` command-namespace marker.
const NS_RE = /\(`\/[a-z0-9-]+:`\)/i;
const isNamespace = (s) => NS_RE.test(s.text);
const nsSections = sections.filter(isNamespace);

if (nsSections.length === 0) {
  // Already split (or nothing to split) — leave the file untouched.
  console.log(`split-commands: no namespace sections in ${basename(file)} — skipped`);
  process.exit(0);
}

const slug = (text) =>
  text
    .replace(/\(`[^`]*`\)/g, '') // drop the (`/xxx:`) marker
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const outDir = join(dirname(file), 'commands');
rmSync(outDir, { recursive: true, force: true });
mkdirSync(outDir, { recursive: true });

const indexEntries = [];
for (const s of nsSections) {
  const id = slug(s.text);
  const title = s.text.replace(/\s*-\s*NEW\s*$/i, '').trim();
  // Section body = everything after its `## heading` line. The section's `###` subheadings
  // must shift up one level (### -> ##) so the sub-page reads h1 -> h2 with no skipped
  // level (WCAG heading-order). Skip fenced code blocks so `#` comments aren't touched.
  let inFence = false;
  const sectionBody = s.lines
    .slice(1)
    .map((line) => {
      if (/^\s*```/.test(line)) inFence = !inFence;
      if (inFence) return line;
      return line.replace(/^(#{3,6}) /, (_, h) => `${h.slice(1)} `);
    })
    .join('\n')
    .trim();
  const page =
    `---\ntitle: ${JSON.stringify(title)}\ndescription: ${JSON.stringify(`${title} reference`)}\n---\n\n` +
    `# ${title}\n\n` +
    `[← All command namespaces](${baseUrl})\n\n` +
    `${sectionBody}\n`;
  writeFileSync(join(outDir, `${id}.md`), page);
  indexEntries.push({ id, title });
}

// Rebuild the index: preamble + non-namespace sections, with a single link table
// inserted where the namespace sections used to be (preserves document order).
const out = [];
out.push(preamble.join('\n').trimEnd());
let tableInserted = false;
for (const s of sections) {
  if (isNamespace(s)) {
    if (!tableInserted) {
      out.push('');
      out.push('## Command Reference by Namespace');
      out.push('');
      out.push('Each namespace has its own focused page:');
      out.push('');
      out.push('| Namespace | Reference |');
      out.push('| --- | --- |');
      for (const e of indexEntries) {
        out.push(`| ${e.title} | [View commands](${baseUrl}/${e.id}) |`);
      }
      tableInserted = true;
    }
    continue;
  }
  out.push('');
  out.push(s.lines.join('\n').trimEnd());
}

writeFileSync(
  file,
  `${frontmatter}${out
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()}\n`
);
console.log(`split-commands: ${basename(file)} → index + ${indexEntries.length} namespace pages in ${outDir}`);
