import { readFile } from 'node:fs/promises';
import matter from 'gray-matter';

/**
 * Parse a Markdown file with YAML frontmatter.
 * Returns { data, body, raw } where `data` is the parsed frontmatter,
 * `body` is everything after the second '---', and `raw` is the full file.
 *
 * gray-matter handles missing frontmatter gracefully (returns data = {}).
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
  // gray-matter v4 always returns { data: {}, content: '' } even for empty/no-frontmatter input.
  const { data, content } = matter(raw);
  return { data, body: content, raw };
}

/**
 * Serialize frontmatter + body back to a Markdown string.
 * Uses gray-matter's stringify which preserves YAML canonical format.
 *
 * @param {object} data
 * @param {string} body
 * @returns {string}
 */
export function stringify(data, body) {
  return matter.stringify(body, data);
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
