import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtempSync, writeFileSync, mkdirSync, rmSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import { detectProject } from '../../cli/lib/detect-project.js';

describe('detectProject', () => {
  let tempDir;

  beforeEach(() => {
    tempDir = mkdtempSync(join(tmpdir(), 'claude-craft-test-'));
  });

  afterEach(() => {
    rmSync(tempDir, { recursive: true, force: true });
  });

  it('returns defaults for an empty directory', () => {
    const result = detectProject(tempDir);
    expect(result.hasClaude).toBe(false);
    expect(result.hasGit).toBe(false);
    expect(result.hasPackageJson).toBe(false);
    expect(result.hasComposer).toBe(false);
    expect(result.hasPubspec).toBe(false);
    expect(result.hasRequirements).toBe(false);
    expect(result.hasDockerfile).toBe(false);
    expect(result.suggestedTechs).toEqual([]);
    expect(result.complexity).toBe('quick');
  });

  it('detects .claude directory', () => {
    mkdirSync(join(tempDir, '.claude'));
    const result = detectProject(tempDir);
    expect(result.hasClaude).toBe(true);
  });

  it('detects .git directory', () => {
    mkdirSync(join(tempDir, '.git'));
    const result = detectProject(tempDir);
    expect(result.hasGit).toBe(true);
  });

  it('detects Symfony via composer.json', () => {
    writeFileSync(join(tempDir, 'composer.json'), '{}');
    const result = detectProject(tempDir);
    expect(result.hasComposer).toBe(true);
    expect(result.suggestedTechs).toContain('symfony');
  });

  it('detects Flutter via pubspec.yaml', () => {
    writeFileSync(join(tempDir, 'pubspec.yaml'), 'name: test');
    const result = detectProject(tempDir);
    expect(result.hasPubspec).toBe(true);
    expect(result.suggestedTechs).toContain('flutter');
  });

  it('detects React via package.json with react dependency', () => {
    writeFileSync(join(tempDir, 'package.json'), JSON.stringify({
      dependencies: { react: '^19.0.0' },
    }));
    const result = detectProject(tempDir);
    expect(result.hasPackageJson).toBe(true);
    expect(result.suggestedTechs).toContain('react');
  });

  it('detects React Native via package.json with react-native dependency', () => {
    writeFileSync(join(tempDir, 'package.json'), JSON.stringify({
      dependencies: { react: '^19.0.0', 'react-native': '^0.76.0' },
    }));
    const result = detectProject(tempDir);
    expect(result.suggestedTechs).toContain('reactnative');
    expect(result.suggestedTechs).not.toContain('react');
  });

  it('detects Python via requirements.txt', () => {
    writeFileSync(join(tempDir, 'requirements.txt'), 'fastapi\n');
    const result = detectProject(tempDir);
    expect(result.hasRequirements).toBe(true);
    expect(result.suggestedTechs).toContain('python');
  });

  it('detects Python via pyproject.toml', () => {
    writeFileSync(join(tempDir, 'pyproject.toml'), '[project]\nname = "test"\n');
    const result = detectProject(tempDir);
    expect(result.hasRequirements).toBe(true);
    expect(result.suggestedTechs).toContain('python');
  });

  it('detects Docker via Dockerfile', () => {
    writeFileSync(join(tempDir, 'Dockerfile'), 'FROM node:20\n');
    const result = detectProject(tempDir);
    expect(result.hasDockerfile).toBe(true);
    expect(result.suggestedTechs).toContain('docker');
  });

  it('detects Docker via docker-compose.yml', () => {
    writeFileSync(join(tempDir, 'docker-compose.yml'), 'version: "3"\n');
    const result = detectProject(tempDir);
    expect(result.hasDockerfile).toBe(true);
    expect(result.suggestedTechs).toContain('docker');
  });

  it('sets complexity to standard for 1-2 techs', () => {
    writeFileSync(join(tempDir, 'composer.json'), '{}');
    const result = detectProject(tempDir);
    expect(result.complexity).toBe('standard');
  });

  it('sets complexity to enterprise for 3+ techs', () => {
    writeFileSync(join(tempDir, 'composer.json'), '{}');
    writeFileSync(join(tempDir, 'pubspec.yaml'), 'name: test');
    writeFileSync(join(tempDir, 'requirements.txt'), 'flask\n');
    const result = detectProject(tempDir);
    expect(result.suggestedTechs.length).toBeGreaterThanOrEqual(3);
    expect(result.complexity).toBe('enterprise');
  });

  it('handles package.json without react gracefully', () => {
    writeFileSync(join(tempDir, 'package.json'), JSON.stringify({
      dependencies: { express: '^4.0.0' },
    }));
    const result = detectProject(tempDir);
    expect(result.hasPackageJson).toBe(true);
    expect(result.suggestedTechs).not.toContain('react');
    expect(result.suggestedTechs).not.toContain('reactnative');
  });
});
