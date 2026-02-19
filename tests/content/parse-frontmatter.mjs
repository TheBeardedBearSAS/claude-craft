/**
 * Parse YAML frontmatter from a markdown file content.
 * Simple parser that handles basic key-value, inline arrays, and nested keys.
 * Returns null if no frontmatter found.
 */
export function parseFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return null;

  const yaml = match[1];
  const result = {};
  let currentKey = null;

  for (const line of yaml.split('\n')) {
    // Skip empty lines
    if (line.trim() === '') continue;

    // Top-level key: value
    const kvMatch = line.match(/^(\w[\w-]*):\s*(.*)$/);
    if (kvMatch) {
      const [, key, value] = kvMatch;
      currentKey = key;

      if (value === '') {
        // Nested object or empty — store as empty object for now
        result[key] = {};
      } else if (value.startsWith('[') && value.endsWith(']')) {
        // Inline array: [item1, item2]
        result[key] = value
          .slice(1, -1)
          .split(',')
          .map((s) => s.trim().replace(/^["']|["']$/g, ''))
          .filter((s) => s.length > 0);
      } else if (value === 'true') {
        result[key] = true;
      } else if (value === 'false') {
        result[key] = false;
      } else {
        result[key] = value.replace(/^["']|["']$/g, '');
      }
      continue;
    }

    // Indented key: value (nested under currentKey)
    const nestedMatch = line.match(/^\s+(\w[\w-]*):\s*(.+)$/);
    if (nestedMatch && currentKey) {
      const [, nestedKey, nestedValue] = nestedMatch;
      if (typeof result[currentKey] !== 'object' || Array.isArray(result[currentKey])) {
        result[currentKey] = {};
      }
      if (nestedValue.startsWith('[') && nestedValue.endsWith(']')) {
        result[currentKey][nestedKey] = nestedValue
          .slice(1, -1)
          .split(',')
          .map((s) => s.trim().replace(/^["']|["']$/g, ''))
          .filter((s) => s.length > 0);
      } else if (nestedValue === 'true') {
        result[currentKey][nestedKey] = true;
      } else if (nestedValue === 'false') {
        result[currentKey][nestedKey] = false;
      } else {
        result[currentKey][nestedKey] = nestedValue.replace(/^["']|["']$/g, '');
      }
    }
  }

  return result;
}
