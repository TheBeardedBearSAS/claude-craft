import { readFile } from 'node:fs/promises';
import * as yaml from 'js-yaml';

/**
 * Splits `---`-delimited frontmatter from the body: `[yaml, body]`, or `null` without frontmatter.
 * Strips exactly one newline after the closing delimiter (the prior gray-matter behavior the tests
 * assert). Same result as /^---\r?\n([\s\S]*?)\r?\n---[ \t]*(?:\r?\n)?([\s\S]*)$/, in linear time.
 */
export function splitFrontmatter(raw) {
  const start = raw.startsWith('---\n') ? 4 : raw.startsWith('---\r\n') ? 5 : -1;
  if (start < 0) return null;
  const close = raw.indexOf('\n---', start);
  if (close < 0) return null;
  const end = close > start && raw[close - 1] === '\r' ? close - 1 : close;
  let i = close + 4;
  while (raw[i] === ' ' || raw[i] === '\t') i++;
  if (raw.startsWith('\r\n', i)) i += 2;
  else if (raw[i] === '\n') i += 1;
  return [raw.slice(start, end), raw.slice(i)];
}

// A real sprint-status.yaml is a few thousand nodes; an alias bomb ("billion laughs") is billions.
const MAX_YAML_NODES = 1_000_000;

function assertBounded(value) {
  let budget = MAX_YAML_NODES;
  const walk = (v) => {
    if (--budget < 0) throw new Error(`YAML expands to more than ${MAX_YAML_NODES} nodes (alias bomb?)`);
    if (v && typeof v === 'object') Object.values(v).forEach(walk);
  };
  walk(value);
}

/**
 * js-yaml `load` that refuses documents whose aliases expand past MAX_YAML_NODES: js-yaml shares
 * aliased nodes, but every consumer (zod, revOf, JSON responses) expands them, so a few hundred
 * bytes from a hostile branch would hang or crash the server.
 */
export function loadYaml(text) {
  const data = yaml.load(text);
  assertBounded(data);
  return data;
}

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
  const match = splitFrontmatter(raw);
  if (!match) return { data: {}, body: raw, raw };
  const [front, body] = match;
  // js-yaml 5 throws on empty input; an empty frontmatter block (---\n---) parses to {}.
  const parsed = front.trim() === '' ? {} : loadYaml(front);
  const data = parsed && typeof parsed === 'object' ? parsed : {};
  return { data, body, raw };
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
 * @param {(body: string) => object} [derive] - builds the data from the body when
 *   the file has no frontmatter (e.g. a "## Metadata" bullet list)
 * @returns {Promise<{ ok: true, data: object, body: string, derived: boolean } | { ok: false, errors: Array, body: string, raw: any, derived: boolean }>}
 */
export async function parseAndValidate(filepath, schema, derive) {
  const parsed = await parseFile(filepath);
  const derived = !!derive && Object.keys(parsed.data).length === 0;
  const data = derived ? derive(parsed.body) : parsed.data;
  const { body } = parsed;
  const result = schema.safeParse(data);
  if (result.success) return { ok: true, data: result.data, body, derived };
  return {
    ok: false,
    errors: result.error.issues,
    body,
    raw: data,
    derived,
  };
}
