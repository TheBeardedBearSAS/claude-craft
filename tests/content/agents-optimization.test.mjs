import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { parseFrontmatter } from './parse-frontmatter.mjs';

const PROJECT_ROOT = path.resolve(import.meta.dirname, '../..');
const AGENTS_DIR = path.join(PROJECT_ROOT, '.claude', 'agents');

// xhigh/max added per Claude Code 2.1.111+/2.1.154 (Opus 4.8): critical agents route to xhigh
const ALLOWED_EFFORTS = ['low', 'medium', 'high', 'xhigh', 'max'];
const ALLOWED_MEMORIES = ['user', 'project', 'local'];

function getAgentFrontmatters() {
  return fs
    .readdirSync(AGENTS_DIR)
    .filter((f) => f.endsWith('.md'))
    .map((f) => {
      const content = fs.readFileSync(path.join(AGENTS_DIR, f), 'utf8');
      const frontmatter = parseFrontmatter(content);
      return { filename: f, basename: f.replace(/\.md$/, ''), frontmatter };
    })
    .filter((a) => a.frontmatter !== null);
}

describe('agent optimization fields', () => {
  const agents = getAgentFrontmatters();

  describe('effort field', () => {
    it('every agent has an effort field', () => {
      for (const agent of agents) {
        expect(agent.frontmatter.effort, `${agent.filename} missing 'effort' field`).toBeDefined();
      }
    });

    it('effort values are valid', () => {
      for (const agent of agents) {
        if (agent.frontmatter.effort) {
          expect(ALLOWED_EFFORTS, `${agent.filename} has invalid effort: ${agent.frontmatter.effort}`).toContain(
            agent.frontmatter.effort
          );
        }
      }
    });

    it('haiku agents use effort: low', () => {
      const haikuAgents = agents.filter((a) => a.frontmatter.model === 'haiku');
      for (const agent of haikuAgents) {
        expect(agent.frontmatter.effort, `Haiku agent ${agent.filename} should use effort: low`).toBe('low');
      }
    });

    it('opus agents use effort: high or xhigh (critical reasoning)', () => {
      const opusAgents = agents.filter((a) => a.frontmatter.model === 'opus');
      for (const agent of opusAgents) {
        expect(['high', 'xhigh', 'max'], `Opus agent ${agent.filename} should use effort: high/xhigh/max`).toContain(
          agent.frontmatter.effort
        );
      }
    });

    it('reviewer agents use effort: low (cost optimization, audit 2026-05-18 TKN-006)', () => {
      const reviewers = agents.filter((a) => a.filename.endsWith('-reviewer.md'));
      for (const agent of reviewers) {
        expect(
          agent.frontmatter.effort,
          `Reviewer ${agent.filename} should use effort: low (haiku model, read-only)`
        ).toBe('low');
      }
    });
  });

  describe('memory field', () => {
    it('memory values are valid when present', () => {
      for (const agent of agents) {
        if (agent.frontmatter.memory) {
          expect(ALLOWED_MEMORIES, `${agent.filename} has invalid memory: ${agent.frontmatter.memory}`).toContain(
            agent.frontmatter.memory
          );
        }
      }
    });

    it('reviewer agents have memory: project', () => {
      const reviewers = agents.filter((a) => a.filename.endsWith('-reviewer.md'));
      for (const agent of reviewers) {
        expect(agent.frontmatter.memory, `Reviewer ${agent.filename} should have memory: project`).toBe('project');
      }
    });

    it('ralph-conductor has memory: user', () => {
      const ralph = agents.find((a) => a.basename === 'ralph-conductor');
      expect(ralph).toBeDefined();
      expect(ralph.frontmatter.memory).toBe('user');
    });

    it('research-assistant has memory: user', () => {
      const research = agents.find((a) => a.basename === 'research-assistant');
      expect(research).toBeDefined();
      expect(research.frontmatter.memory).toBe('user');
    });

    it('tdd-coach has memory: user', () => {
      const tdd = agents.find((a) => a.basename === 'tdd-coach');
      expect(tdd).toBeDefined();
      expect(tdd.frontmatter.memory).toBe('user');
    });

    it('refactoring-specialist has memory: user', () => {
      const refactor = agents.find((a) => a.basename === 'refactoring-specialist');
      expect(refactor).toBeDefined();
      expect(refactor.frontmatter.memory).toBe('user');
    });

    it('devops-engineer has memory: user', () => {
      const devops = agents.find((a) => a.basename === 'devops-engineer');
      expect(devops).toBeDefined();
      expect(devops.frontmatter.memory).toBe('user');
    });
  });

  describe('model cost optimization', () => {
    it('api-designer uses sonnet (not opus)', () => {
      const agent = agents.find((a) => a.basename === 'api-designer');
      expect(agent).toBeDefined();
      expect(agent.frontmatter.model, 'api-designer should use sonnet for cost optimization').toBe('sonnet');
    });

    it('database-architect uses opus (critical schema decisions, audit 2026-05-20)', () => {
      const agent = agents.find((a) => a.basename === 'database-architect');
      expect(agent).toBeDefined();
      expect(agent.frontmatter.model, 'database-architect should use opus for critical schema decisions').toBe('opus');
    });

    it('only critical-reasoning agents use opus (cost optimization)', () => {
      // Opus reserved for high-stakes work: autonomous loops, migrations, schema, security audits, TDD coaching.
      // All tech reviewers stay on haiku; standard agents on sonnet. See audit 2026-05-20 + Opus 4.8 routing.
      const opusAgents = agents
        .filter((a) => a.frontmatter.model === 'opus')
        .map((a) => a.basename)
        .sort();
      expect(opusAgents).toEqual([
        'database-architect',
        'migration-specialist',
        'ralph-conductor',
        'security-auditor',
        'tdd-coach',
      ]);
    });

    it('all reviewer agents have maxTurns <= 6', () => {
      const reviewers = agents.filter((a) => a.filename.endsWith('-reviewer.md'));
      for (const agent of reviewers) {
        const maxTurns = parseInt(agent.frontmatter.maxTurns, 10);
        expect(maxTurns, `${agent.filename} maxTurns (${maxTurns}) should be <= 6`).toBeLessThanOrEqual(6);
      }
    });
  });
});
