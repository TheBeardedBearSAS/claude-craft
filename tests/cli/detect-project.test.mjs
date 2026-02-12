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
    expect(result.hasCsproj).toBe(false);
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

  // --- Symfony detection (refined) ---
  it('detects Symfony via composer.json with symfony/ packages', () => {
    writeFileSync(join(tempDir, 'composer.json'), JSON.stringify({
      require: { 'symfony/framework-bundle': '^7.0' },
    }));
    const result = detectProject(tempDir);
    expect(result.hasComposer).toBe(true);
    expect(result.suggestedTechs).toContain('symfony');
    expect(result.suggestedTechs).not.toContain('php');
  });

  // --- Laravel detection ---
  it('detects Laravel via composer.json with laravel/framework', () => {
    writeFileSync(join(tempDir, 'composer.json'), JSON.stringify({
      require: { 'laravel/framework': '^12.0' },
    }));
    const result = detectProject(tempDir);
    expect(result.hasComposer).toBe(true);
    expect(result.suggestedTechs).toContain('laravel');
    expect(result.suggestedTechs).not.toContain('symfony');
    expect(result.suggestedTechs).not.toContain('php');
  });

  it('Laravel takes precedence over Symfony when both present', () => {
    writeFileSync(join(tempDir, 'composer.json'), JSON.stringify({
      require: { 'laravel/framework': '^12.0', 'symfony/console': '^7.0' },
    }));
    const result = detectProject(tempDir);
    expect(result.suggestedTechs).toContain('laravel');
    expect(result.suggestedTechs).not.toContain('symfony');
  });

  // --- Generic PHP detection ---
  it('detects generic PHP via composer.json without symfony or laravel', () => {
    writeFileSync(join(tempDir, 'composer.json'), JSON.stringify({
      require: { 'phpunit/phpunit': '^10.0' },
    }));
    const result = detectProject(tempDir);
    expect(result.hasComposer).toBe(true);
    expect(result.suggestedTechs).toContain('php');
    expect(result.suggestedTechs).not.toContain('symfony');
    expect(result.suggestedTechs).not.toContain('laravel');
  });

  it('detects PHP for empty composer.json', () => {
    writeFileSync(join(tempDir, 'composer.json'), '{}');
    const result = detectProject(tempDir);
    expect(result.hasComposer).toBe(true);
    expect(result.suggestedTechs).toContain('php');
  });

  // --- C# / .NET detection ---
  it('detects C# via .csproj file', () => {
    writeFileSync(join(tempDir, 'MyApp.csproj'), '<Project />');
    const result = detectProject(tempDir);
    expect(result.hasCsproj).toBe(true);
    expect(result.suggestedTechs).toContain('csharp');
  });

  it('detects C# via .sln file', () => {
    writeFileSync(join(tempDir, 'MyApp.sln'), 'Solution File');
    const result = detectProject(tempDir);
    expect(result.hasCsproj).toBe(true);
    expect(result.suggestedTechs).toContain('csharp');
  });

  // --- Angular detection ---
  it('detects Angular via package.json with @angular/core', () => {
    writeFileSync(join(tempDir, 'package.json'), JSON.stringify({
      dependencies: { '@angular/core': '^19.0.0' },
    }));
    const result = detectProject(tempDir);
    expect(result.hasPackageJson).toBe(true);
    expect(result.suggestedTechs).toContain('angular');
    expect(result.suggestedTechs).not.toContain('react');
  });

  it('Angular takes precedence over React when both present', () => {
    writeFileSync(join(tempDir, 'package.json'), JSON.stringify({
      dependencies: { '@angular/core': '^19.0.0', react: '^19.0.0' },
    }));
    const result = detectProject(tempDir);
    expect(result.suggestedTechs).toContain('angular');
    expect(result.suggestedTechs).not.toContain('react');
  });

  // --- Vue.js detection ---
  it('detects Vue.js via package.json with vue dependency', () => {
    writeFileSync(join(tempDir, 'package.json'), JSON.stringify({
      dependencies: { vue: '^3.5.0' },
    }));
    const result = detectProject(tempDir);
    expect(result.hasPackageJson).toBe(true);
    expect(result.suggestedTechs).toContain('vuejs');
    expect(result.suggestedTechs).not.toContain('react');
  });

  it('detects Vue.js from devDependencies', () => {
    writeFileSync(join(tempDir, 'package.json'), JSON.stringify({
      devDependencies: { vue: '^3.5.0' },
    }));
    const result = detectProject(tempDir);
    expect(result.suggestedTechs).toContain('vuejs');
  });

  // --- Flutter ---
  it('detects Flutter via pubspec.yaml', () => {
    writeFileSync(join(tempDir, 'pubspec.yaml'), 'name: test');
    const result = detectProject(tempDir);
    expect(result.hasPubspec).toBe(true);
    expect(result.suggestedTechs).toContain('flutter');
  });

  // --- React ---
  it('detects React via package.json with react dependency', () => {
    writeFileSync(join(tempDir, 'package.json'), JSON.stringify({
      dependencies: { react: '^19.0.0' },
    }));
    const result = detectProject(tempDir);
    expect(result.hasPackageJson).toBe(true);
    expect(result.suggestedTechs).toContain('react');
  });

  // --- React Native ---
  it('detects React Native via package.json with react-native dependency', () => {
    writeFileSync(join(tempDir, 'package.json'), JSON.stringify({
      dependencies: { react: '^19.0.0', 'react-native': '^0.76.0' },
    }));
    const result = detectProject(tempDir);
    expect(result.suggestedTechs).toContain('reactnative');
    expect(result.suggestedTechs).not.toContain('react');
  });

  // --- Python ---
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

  // --- Docker ---
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

  // --- Complexity ---
  it('sets complexity to standard for 1-2 techs', () => {
    writeFileSync(join(tempDir, 'composer.json'), JSON.stringify({
      require: { 'symfony/framework-bundle': '^7.0' },
    }));
    const result = detectProject(tempDir);
    expect(result.complexity).toBe('standard');
  });

  it('sets complexity to enterprise for 3+ techs', () => {
    writeFileSync(join(tempDir, 'composer.json'), JSON.stringify({
      require: { 'symfony/framework-bundle': '^7.0' },
    }));
    writeFileSync(join(tempDir, 'pubspec.yaml'), 'name: test');
    writeFileSync(join(tempDir, 'requirements.txt'), 'flask\n');
    const result = detectProject(tempDir);
    expect(result.suggestedTechs.length).toBeGreaterThanOrEqual(3);
    expect(result.complexity).toBe('enterprise');
  });

  // --- Edge cases ---
  it('handles package.json without react/angular/vue gracefully', () => {
    writeFileSync(join(tempDir, 'package.json'), JSON.stringify({
      dependencies: { express: '^4.0.0' },
    }));
    const result = detectProject(tempDir);
    expect(result.hasPackageJson).toBe(true);
    expect(result.suggestedTechs).not.toContain('react');
    expect(result.suggestedTechs).not.toContain('angular');
    expect(result.suggestedTechs).not.toContain('vuejs');
    expect(result.suggestedTechs).not.toContain('reactnative');
  });

  it('handles malformed package.json gracefully', () => {
    writeFileSync(join(tempDir, 'package.json'), 'not valid json');
    const result = detectProject(tempDir);
    // File exists so hasPackageJson is true, but no tech detected from it
    expect(result.hasPackageJson).toBe(true);
    expect(result.suggestedTechs).not.toContain('react');
    expect(result.suggestedTechs).not.toContain('angular');
    expect(result.suggestedTechs).not.toContain('vuejs');
  });

  it('handles malformed composer.json gracefully', () => {
    writeFileSync(join(tempDir, 'composer.json'), '{bad json}');
    const result = detectProject(tempDir);
    // File exists so hasComposer is true, but no tech detected from it
    expect(result.hasComposer).toBe(true);
    expect(result.suggestedTechs).not.toContain('symfony');
    expect(result.suggestedTechs).not.toContain('laravel');
    expect(result.suggestedTechs).not.toContain('php');
  });

  it('debug mode logs errors to console.error', () => {
    const result = detectProject(tempDir, { debug: true });
    // Just verifying it doesn't throw with debug enabled
    expect(result).toBeDefined();
  });

  it('handles non-existent directory gracefully with debug', () => {
    const result = detectProject('/non/existent/path/xxx', { debug: true });
    expect(result.suggestedTechs).toEqual([]);
  });

  it('detects multiple techs from different ecosystems', () => {
    writeFileSync(join(tempDir, 'MyApp.csproj'), '<Project />');
    writeFileSync(join(tempDir, 'package.json'), JSON.stringify({
      dependencies: { react: '^19.0.0' },
    }));
    writeFileSync(join(tempDir, 'Dockerfile'), 'FROM node:20\n');
    const result = detectProject(tempDir);
    expect(result.suggestedTechs).toContain('csharp');
    expect(result.suggestedTechs).toContain('react');
    expect(result.suggestedTechs).toContain('docker');
    expect(result.complexity).toBe('enterprise');
  });

  it('detects Symfony from require-dev', () => {
    writeFileSync(join(tempDir, 'composer.json'), JSON.stringify({
      'require-dev': { 'symfony/debug-bundle': '^7.0' },
    }));
    const result = detectProject(tempDir);
    expect(result.suggestedTechs).toContain('symfony');
  });

  it('detects Angular from devDependencies', () => {
    writeFileSync(join(tempDir, 'package.json'), JSON.stringify({
      devDependencies: { '@angular/core': '^19.0.0' },
    }));
    const result = detectProject(tempDir);
    expect(result.suggestedTechs).toContain('angular');
  });
});
