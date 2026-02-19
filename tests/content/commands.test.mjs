import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { parseFrontmatter } from './parse-frontmatter.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, '../..');
const COMMANDS_DIR = path.join(PROJECT_ROOT, '.claude', 'commands');

// Commands that are known to not use frontmatter (legacy format).
// This list should shrink over time as commands are migrated.
const KNOWN_NO_FRONTMATTER = ['common/init.md', 'common/sub-agents-patterns.md'];

function getCommandFiles() {
  const results = [];
  const namespaces = fs.readdirSync(COMMANDS_DIR).filter((entry) => {
    return fs.statSync(path.join(COMMANDS_DIR, entry)).isDirectory();
  });

  for (const ns of namespaces) {
    const nsDir = path.join(COMMANDS_DIR, ns);
    const files = fs.readdirSync(nsDir).filter((f) => f.endsWith('.md'));
    for (const file of files) {
      results.push({
        filename: file,
        filepath: path.join(nsDir, file),
        namespace: ns,
        basename: file.replace(/\.md$/, ''),
        qualifiedName: `${ns}/${file}`,
      });
    }
  }
  return results;
}

function getCommandFrontmatters() {
  return getCommandFiles().map((cmd) => {
    const content = fs.readFileSync(cmd.filepath, 'utf8');
    const frontmatter = parseFrontmatter(content);
    return { ...cmd, frontmatter };
  });
}

describe('command content validation', () => {
  const allCommands = getCommandFrontmatters();
  const commands = allCommands.filter((c) => c.frontmatter !== null);
  const commandsWithoutFrontmatter = allCommands.filter((c) => c.frontmatter === null);

  it('finds command files in .claude/commands/', () => {
    expect(allCommands.length).toBeGreaterThan(0);
  });

  it('commands without frontmatter are tracked in KNOWN_NO_FRONTMATTER', () => {
    const unexpected = commandsWithoutFrontmatter
      .filter((c) => !KNOWN_NO_FRONTMATTER.includes(c.qualifiedName))
      .map((c) => c.qualifiedName);
    expect(
      unexpected,
      `Unexpected commands without frontmatter: ${unexpected.join(', ')}. Add to KNOWN_NO_FRONTMATTER or add frontmatter.`,
    ).toHaveLength(0);
  });

  it('every command with frontmatter has a description field', () => {
    for (const cmd of commands) {
      expect(
        cmd.frontmatter.description,
        `${cmd.namespace}/${cmd.filename} missing description`,
      ).toBeTruthy();
    }
  });

  it('command namespaces are valid directory names', () => {
    const namespaces = [...new Set(allCommands.map((c) => c.namespace))];
    for (const ns of namespaces) {
      expect(ns, `Invalid namespace: ${ns}`).toMatch(/^[a-z][a-z0-9-]*$/);
    }
  });

  it('no duplicate command basenames within a namespace', () => {
    const byNamespace = {};
    for (const cmd of allCommands) {
      if (!byNamespace[cmd.namespace]) byNamespace[cmd.namespace] = [];
      byNamespace[cmd.namespace].push(cmd.basename);
    }

    for (const [ns, names] of Object.entries(byNamespace)) {
      const uniqueNames = new Set(names);
      expect(
        uniqueNames.size,
        `Duplicate commands in ${ns}: ${names.filter((n, i) => names.indexOf(n) !== i).join(', ')}`,
      ).toBe(names.length);
    }
  });

  it('command files use kebab-case filenames', () => {
    for (const cmd of allCommands) {
      expect(
        cmd.basename,
        `${cmd.namespace}/${cmd.filename} is not kebab-case`,
      ).toMatch(/^[a-z][a-z0-9]*(-[a-z0-9]+)*$/);
    }
  });

  it('every command file has markdown content after frontmatter', () => {
    for (const cmd of allCommands) {
      const content = fs.readFileSync(cmd.filepath, 'utf8');
      const afterFrontmatter = content.replace(/^---\n[\s\S]*?\n---\n*/, '');
      expect(
        afterFrontmatter.trim().length,
        `${cmd.namespace}/${cmd.filename} has no content after frontmatter`,
      ).toBeGreaterThan(0);
    }
  });
});
