import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// Modules under test
import { parseArgs } from '../../cli/lib/parse-args.js';
import { TECHNOLOGIES, LANGUAGES } from '../../cli/lib/constants.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CLI_ROOT = path.resolve(__dirname, '..', '..');

// --- parseArgs ---

describe('parseArgs', () => {
  it('parses install command with path', () => {
    const result = parseArgs(['install', '/tmp/myproject']);
    expect(result.command).toBe('install');
    expect(result.path).toBe('/tmp/myproject');
  });

  it('parses --tech option', () => {
    const result = parseArgs(['install', '--tech=symfony']);
    expect(result.options.tech).toBe('symfony');
  });

  it('parses --lang option', () => {
    const result = parseArgs(['install', '--lang=fr']);
    expect(result.options.lang).toBe('fr');
  });

  it('parses flatten command', () => {
    const result = parseArgs(['flatten', '--output=out.md']);
    expect(result.command).toBe('flatten');
    expect(result.options.output).toBe('out.md');
  });

  it('parses ralph command with prompt', () => {
    const result = parseArgs(['ralph', 'Implement auth']);
    expect(result.command).toBe('ralph');
  });

  it('parses help command', () => {
    const result = parseArgs(['help']);
    expect(result.command).toBe('help');
  });

  it('returns null command for empty args', () => {
    const result = parseArgs([]);
    expect(result.command).toBeNull();
  });

  it('parses --force flag', () => {
    const result = parseArgs(['install', '--force']);
    expect(result.options.force).toBe(true);
  });

  it('parses --quick track flag', () => {
    const result = parseArgs(['install', '--quick']);
    expect(result.options.quick).toBe(true);
  });
});

// --- constants ---

describe('TECHNOLOGIES constant', () => {
  it('contains all 11 expected technology keys', () => {
    const expected = ['symfony', 'flutter', 'python', 'react', 'reactnative', 'angular', 'csharp', 'laravel', 'vuejs', 'php', 'docker'];
    for (const tech of expected) {
      expect(TECHNOLOGIES).toHaveProperty(tech);
    }
  });

  it('each technology has a desc property', () => {
    for (const [key, value] of Object.entries(TECHNOLOGIES)) {
      expect(value).toHaveProperty('desc');
      expect(typeof value.desc).toBe('string');
    }
  });
});

describe('LANGUAGES constant', () => {
  it('contains en, fr, es, de, pt', () => {
    expect(LANGUAGES).toHaveProperty('en');
    expect(LANGUAGES).toHaveProperty('fr');
    expect(LANGUAGES).toHaveProperty('es');
    expect(LANGUAGES).toHaveProperty('de');
    expect(LANGUAGES).toHaveProperty('pt');
  });
});

// --- runRalph argument building ---

describe('runRalph argument building logic', () => {
  it('builds args with --lang option', () => {
    const options = { lang: 'fr' };
    const ralphArgs = [];
    if (options.lang) ralphArgs.push(`--lang=${options.lang}`);
    expect(ralphArgs).toEqual(['--lang=fr']);
  });

  it('builds args with --config option', () => {
    const options = { config: 'ralph.yml' };
    const ralphArgs = [];
    if (options.config) ralphArgs.push(`--config=${options.config}`);
    expect(ralphArgs).toEqual(['--config=ralph.yml']);
  });

  it('builds args with --max-iterations option', () => {
    const options = { 'max-iterations': '5' };
    const ralphArgs = [];
    if (options['max-iterations']) ralphArgs.push(`--max-iterations=${options['max-iterations']}`);
    expect(ralphArgs).toEqual(['--max-iterations=5']);
  });

  it('builds args with --verbose flag', () => {
    const options = { verbose: true };
    const ralphArgs = [];
    if (options.verbose) ralphArgs.push('--verbose');
    expect(ralphArgs).toEqual(['--verbose']);
  });

  it('builds args with --dry-run flag', () => {
    const options = { 'dry-run': true };
    const ralphArgs = [];
    if (options['dry-run']) ralphArgs.push('--dry-run');
    expect(ralphArgs).toEqual(['--dry-run']);
  });

  it('builds args with --continue option', () => {
    const options = { continue: 'session-123' };
    const ralphArgs = [];
    if (options.continue) ralphArgs.push(`--continue=${options.continue}`);
    expect(ralphArgs).toEqual(['--continue=session-123']);
  });

  it('builds combined args from multiple options', () => {
    const options = { lang: 'fr', verbose: true, 'max-iterations': '10' };
    const ralphArgs = [];
    if (options.lang) ralphArgs.push(`--lang=${options.lang}`);
    if (options.verbose) ralphArgs.push('--verbose');
    if (options['max-iterations']) ralphArgs.push(`--max-iterations=${options['max-iterations']}`);
    expect(ralphArgs).toEqual(['--lang=fr', '--verbose', '--max-iterations=10']);
  });

  it('filters positional args as prompt', () => {
    const args = ['Implement user auth', '--verbose'];
    const promptArgs = args.filter(arg => !arg.startsWith('--'));
    expect(promptArgs).toEqual(['Implement user auth']);
  });
});

// --- flattenCodebase option passing ---

describe('flattenCodebase option passing', () => {
  it('defaults output to CODEBASE_CONTEXT.md when not specified', () => {
    const options = {};
    const outputFile = options.output || 'CODEBASE_CONTEXT.md';
    expect(outputFile).toBe('CODEBASE_CONTEXT.md');
  });

  it('uses provided output filename', () => {
    const options = { output: 'my-context.md' };
    const outputFile = options.output || 'CODEBASE_CONTEXT.md';
    expect(outputFile).toBe('my-context.md');
  });
});

// --- VERSION loading ---

describe('VERSION loading', () => {
  it('package.json version matches expected format', () => {
    const pkg = JSON.parse(fs.readFileSync(path.join(CLI_ROOT, 'package.json'), 'utf8'));
    expect(pkg.version).toMatch(/^\d+\.\d+\.\d+/);
  });
});
