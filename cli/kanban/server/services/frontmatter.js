import { readFile } from 'node:fs/promises';
import * as yaml from 'js-yaml';

// Frontmatter delimited by `---` lines. Strips exactly one newline after the
// closing delimiter (matches the prior gray-matter behavior the tests assert).
const FRONTMATTER_RE = /^---\r?\n([\s\S]*?)\r?\n---[ \t]*(?:\r?\n)?([\s\S]*)$/;

/**
 * Parse a Markdown file with YAML frontmatter.
 * Returns { data, body, raw } where `data` is the parsed frontmatter,
 * `body` is everything after the second '---', and `raw` is the full file.
 *
 * Missing frontmatter is handled gracefully (returns data = {}).
 *
 * @param {string} filepath
 * @returns {Promise<{ data: object, body: string, raw: string }>}
 */
export async function parseFile(filepath) {
  const raw = await readFile(filepath, 'utf8');
  return parseString(raw);
}

/**
 * Parse a Markdown string with YAML frontmatter.
 */
export function parseString(raw) {
  const match = FRONTMATTER_RE.exec(raw);
  if (!match) return { data: {}, body: raw, raw };
  // js-yaml 5 throws on empty input; an empty frontmatter block (---\n---) parses to {}.
  const parsed = match[1].trim() === '' ? {} : yaml.load(match[1]);
  const data = parsed && typeof parsed === 'object' ? parsed : {};
  return { data, body: match[2] ?? '', raw };
}

/**
 * Serialize frontmatter + body back to a Markdown string.
 *
 * @param {object} data
 * @param {string} body
 * @returns {string}
 */
export function stringify(data, body) {
  const text = body ?? '';
  if (!data || Object.keys(data).length === 0) return text;
  const dumped = yaml.dump(data, { lineWidth: -1 });
  return `---\n${dumped}---\n${text}`;
}

/**
 * Parse and validate frontmatter against a Zod schema.
 * @param {string} filepath
 * @param {import('zod').ZodTypeAny} schema
 * @returns {Promise<{ ok: true, data: object, body: string } | { ok: false, errors: Array, body: string, raw: any }>}
 */
export async function parseAndValidate(filepath, schema) {
  const { data, body } = await parseFile(filepath);
  const result = schema.safeParse(data);
  if (result.success) return { ok: true, data: result.data, body };
  return {
    ok: false,
    errors: result.error.issues,
    body,
    raw: data,
  };
}
