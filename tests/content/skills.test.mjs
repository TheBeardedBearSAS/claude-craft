import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { parseFrontmatter } from './parse-frontmatter.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, '../..');
const SKILLS_DIR = path.join(PROJECT_ROOT, '.claude', 'skills');

// Known directory-name mismatches where the SKILL.md name differs from its
// directory. These should be fixed over time — entries are [dirname, actual name].
const KNOWN_NAME_MISMATCHES = [['remotion', 'remotion-best-practices']];

function getSkillDirs() {
  return fs
    .readdirSync(SKILLS_DIR)
    .filter((entry) => {
      return fs.statSync(path.join(SKILLS_DIR, entry)).isDirectory();
    })
    .map((dir) => ({
      dirname: dir,
      dirpath: path.join(SKILLS_DIR, dir),
      skillPath: path.join(SKILLS_DIR, dir, 'SKILL.md'),
    }));
}

function getSkillFrontmatters() {
  return getSkillDirs().map((skill) => {
    const hasSkillMd = fs.existsSync(skill.skillPath);
    let frontmatter = null;
    if (hasSkillMd) {
      const content = fs.readFileSync(skill.skillPath, 'utf8');
      frontmatter = parseFrontmatter(content);
    }
    return { ...skill, hasSkillMd, frontmatter };
  });
}

describe('skill content validation', () => {
  const skills = getSkillFrontmatters();

  it('finds skill directories in .claude/skills/', () => {
    expect(skills.length).toBeGreaterThan(0);
  });

  it('every skill directory has a SKILL.md file', () => {
    for (const skill of skills) {
      expect(
        skill.hasSkillMd,
        `${skill.dirname}/ is missing SKILL.md`,
      ).toBe(true);
    }
  });

  it('every SKILL.md has valid YAML frontmatter', () => {
    for (const skill of skills) {
      if (!skill.hasSkillMd) continue;
      expect(
        skill.frontmatter,
        `${skill.dirname}/SKILL.md has no frontmatter`,
      ).not.toBeNull();
    }
  });

  it('every SKILL.md has required frontmatter fields', () => {
    const required = ['name', 'description'];
    for (const skill of skills) {
      if (!skill.frontmatter) continue;
      for (const field of required) {
        expect(
          skill.frontmatter[field],
          `${skill.dirname}/SKILL.md missing field: ${field}`,
        ).toBeTruthy();
      }
    }
  });

  it('skill name matches directory name (excluding known mismatches)', () => {
    const knownDirs = new Set(KNOWN_NAME_MISMATCHES.map(([dir]) => dir));
    for (const skill of skills) {
      if (!skill.frontmatter?.name) continue;
      if (knownDirs.has(skill.dirname)) continue;
      expect(
        skill.frontmatter.name,
        `${skill.dirname}/SKILL.md: name "${skill.frontmatter.name}" does not match directory "${skill.dirname}"`,
      ).toBe(skill.dirname);
    }
  });

  it('known name mismatches are still present', () => {
    for (const [dirname, expectedName] of KNOWN_NAME_MISMATCHES) {
      const skill = skills.find((s) => s.dirname === dirname);
      if (!skill?.frontmatter?.name) continue;
      expect(
        skill.frontmatter.name,
        `Known mismatch ${dirname} may have been fixed — remove from KNOWN_NAME_MISMATCHES`,
      ).toBe(expectedName);
    }
  });

  it('no duplicate skill names', () => {
    const names = skills.map((s) => s.frontmatter?.name).filter(Boolean);
    const seen = new Set();
    const duplicates = [];
    for (const name of names) {
      if (seen.has(name)) duplicates.push(name);
      seen.add(name);
    }
    // Known: remotion and remotion-best-practices both have name "remotion-best-practices"
    const knownDupNames = new Set(KNOWN_NAME_MISMATCHES.map(([, name]) => name));
    const unexpectedDuplicates = duplicates.filter((d) => !knownDupNames.has(d));
    expect(
      unexpectedDuplicates,
      `Unexpected duplicate skill names: ${unexpectedDuplicates.join(', ')}`,
    ).toHaveLength(0);
  });

  it('skill directories use kebab-case names', () => {
    for (const skill of skills) {
      expect(
        skill.dirname,
        `${skill.dirname} is not kebab-case`,
      ).toMatch(/^[a-z][a-z0-9]*(-[a-z0-9]+)*$/);
    }
  });

  it('SKILL.md has content after frontmatter', () => {
    for (const skill of skills) {
      if (!skill.hasSkillMd) continue;
      const content = fs.readFileSync(skill.skillPath, 'utf8');
      const afterFrontmatter = content.replace(/^---\n[\s\S]*?\n---\n*/, '');
      expect(
        afterFrontmatter.trim().length,
        `${skill.dirname}/SKILL.md has no content after frontmatter`,
      ).toBeGreaterThan(0);
    }
  });

  it('triggers field has valid structure when present', () => {
    for (const skill of skills) {
      if (!skill.frontmatter?.triggers) continue;
      const triggers = skill.frontmatter.triggers;
      if (typeof triggers === 'object' && !Array.isArray(triggers)) {
        if (triggers.files) {
          expect(
            Array.isArray(triggers.files),
            `${skill.dirname}/SKILL.md: triggers.files should be an array`,
          ).toBe(true);
        }
        if (triggers.keywords) {
          expect(
            Array.isArray(triggers.keywords),
            `${skill.dirname}/SKILL.md: triggers.keywords should be an array`,
          ).toBe(true);
        }
      }
    }
  });
});
