import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { parseFrontmatter } from './parse-frontmatter.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, '../..');
const AGENTS_DIR = path.join(PROJECT_ROOT, '.claude', 'agents');
const SKILLS_DIR = path.join(PROJECT_ROOT, '.claude', 'skills');

const ALLOWED_MODELS = ['haiku', 'sonnet', 'opus'];
const VALID_TOOLS = [
  'Read',
  'Glob',
  'Grep',
  'Write',
  'Edit',
  'Bash',
  'WebFetch',
  'WebSearch',
  'NotebookEdit',
  'Task',
];

// Agents that are known to not use frontmatter (legacy format).
// This list should shrink over time as agents are migrated.
const KNOWN_NO_FRONTMATTER = ['csharp-reviewer.md'];

function getAgentFiles() {
  return fs
    .readdirSync(AGENTS_DIR)
    .filter((f) => f.endsWith('.md'))
    .map((f) => ({
      filename: f,
      filepath: path.join(AGENTS_DIR, f),
      basename: f.replace(/\.md$/, ''),
    }));
}

function getAgentFrontmatters() {
  return getAgentFiles().map((agent) => {
    const content = fs.readFileSync(agent.filepath, 'utf8');
    const frontmatter = parseFrontmatter(content);
    return { ...agent, frontmatter };
  });
}

describe('agent content validation', () => {
  const allAgents = getAgentFrontmatters();
  const agents = allAgents.filter((a) => a.frontmatter !== null);
  const agentsWithoutFrontmatter = allAgents.filter((a) => a.frontmatter === null);

  it('finds agent files in .claude/agents/', () => {
    expect(allAgents.length).toBeGreaterThan(0);
  });

  it('agents without frontmatter are tracked in KNOWN_NO_FRONTMATTER', () => {
    const unexpected = agentsWithoutFrontmatter
      .filter((a) => !KNOWN_NO_FRONTMATTER.includes(a.filename))
      .map((a) => a.filename);
    expect(
      unexpected,
      `Unexpected agents without frontmatter: ${unexpected.join(', ')}. Add to KNOWN_NO_FRONTMATTER or add frontmatter.`,
    ).toHaveLength(0);
  });

  it('every agent with frontmatter has required fields', () => {
    const required = ['name', 'description', 'model', 'tools'];
    for (const agent of agents) {
      for (const field of required) {
        expect(
          agent.frontmatter[field],
          `${agent.filename} missing field: ${field}`,
        ).toBeTruthy();
      }
    }
  });

  it('agent model is in allowed list', () => {
    for (const agent of agents) {
      expect(
        ALLOWED_MODELS,
        `${agent.filename} has invalid model: ${agent.frontmatter.model}`,
      ).toContain(agent.frontmatter.model);
    }
  });

  it('agent tools are valid tool names', () => {
    for (const agent of agents) {
      const tools = agent.frontmatter.tools;
      if (!Array.isArray(tools)) continue;
      for (const tool of tools) {
        expect(
          VALID_TOOLS,
          `${agent.filename} has invalid tool: ${tool}`,
        ).toContain(tool);
      }
    }
  });

  it('agent name matches filename', () => {
    for (const agent of agents) {
      expect(
        agent.frontmatter.name,
        `${agent.filename}: name "${agent.frontmatter.name}" does not match basename "${agent.basename}"`,
      ).toBe(agent.basename);
    }
  });

  it('agent skills reference existing skill directories', () => {
    for (const agent of agents) {
      const skills = agent.frontmatter.skills;
      if (!Array.isArray(skills)) continue;
      for (const skill of skills) {
        const skillDir = path.join(SKILLS_DIR, skill);
        expect(
          fs.existsSync(skillDir),
          `${agent.filename} references non-existent skill: ${skill}`,
        ).toBe(true);
      }
    }
  });

  it('no duplicate agent names', () => {
    const names = agents.map((a) => a.frontmatter.name).filter(Boolean);
    const uniqueNames = new Set(names);
    expect(
      uniqueNames.size,
      `Duplicate agent names found: ${names.filter((n, i) => names.indexOf(n) !== i).join(', ')}`,
    ).toBe(names.length);
  });

  it('agent disallowedTools are valid tool names when present', () => {
    for (const agent of agents) {
      const disallowed = agent.frontmatter.disallowedTools;
      if (!Array.isArray(disallowed)) continue;
      for (const tool of disallowed) {
        expect(
          VALID_TOOLS,
          `${agent.filename} has invalid disallowedTool: ${tool}`,
        ).toContain(tool);
      }
    }
  });
});
