import { describe, it, expect } from 'vitest';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Import the class (auto-run is guarded, so this is safe)
const { ClaudeCraftCLI } = await import('../../cli/index.js');

describe('ClaudeCraftCLI class', () => {
  it('constructor sets default config', () => {
    const cli = new ClaudeCraftCLI();
    expect(cli.config).toBeDefined();
    expect(cli.config.language).toBe('en');
    expect(cli.config.technologies).toEqual([]);
    expect(cli.config.includeCommon).toBe(true);
    expect(cli.config.includeProject).toBe(true);
    expect(cli.rl).toBeNull();
  });

  it('config.targetPath defaults to process.cwd()', () => {
    const cli = new ClaudeCraftCLI();
    expect(cli.config.targetPath).toBe(process.cwd());
  });

  it('parseArgs delegates to lib/parse-args and returns structured result', () => {
    const cli = new ClaudeCraftCLI();
    const result = cli.parseArgs(['install', '/some/path', '--tech=react']);
    expect(result.command).toBe('install');
    expect(result.path).toBe('/some/path');
    expect(result.options.tech).toBe('react');
  });

  it('detectProject delegates to lib/detect-project and returns result', () => {
    const cli = new ClaudeCraftCLI();
    const result = cli.detectProject(__dirname);
    expect(result).toBeDefined();
    expect(typeof result).toBe('object');
  });
});
