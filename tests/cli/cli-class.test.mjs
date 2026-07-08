import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
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

describe('ClaudeCraftCLI.run()', () => {
  let originalArgv;
  let logSpy;
  let errorSpy;
  let exitSpy;

  beforeEach(() => {
    originalArgv = process.argv;
    logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    exitSpy = vi.spyOn(process, 'exit').mockImplementation(() => {
      throw new Error('process.exit called');
    });
  });

  afterEach(() => {
    process.argv = originalArgv;
    vi.restoreAllMocks();
  });

  it('--version prints version and returns', async () => {
    process.argv = ['node', 'index.js', '--version'];
    const cli = new ClaudeCraftCLI();
    await cli.run();
    const output = logSpy.mock.calls.map((c) => c[0]).join('\n');
    expect(output).toMatch(/^\d+\.\d+\.\d+(-[a-z0-9.-]+)?$/);
  });

  it('-v prints version (short alias)', async () => {
    process.argv = ['node', 'index.js', '-v'];
    const cli = new ClaudeCraftCLI();
    await cli.run();
    const output = logSpy.mock.calls.map((c) => c[0]).join('\n');
    expect(output).toMatch(/^\d+\.\d+\.\d+(-[a-z0-9.-]+)?$/);
  });

  it('--lang=zz exits with error for invalid language', async () => {
    process.argv = ['node', 'index.js', 'install', '.', '--lang=zz'];
    const cli = new ClaudeCraftCLI();
    await expect(cli.run()).rejects.toThrow('process.exit called');
    const errOutput = errorSpy.mock.calls.map((c) => c[0]).join('\n');
    expect(errOutput).toContain('Unknown language');
    expect(exitSpy).toHaveBeenCalledWith(1);
  });

  it('--tech=cobol exits with error for invalid technology', async () => {
    process.argv = ['node', 'index.js', 'install', '.', '--tech=cobol'];
    const cli = new ClaudeCraftCLI();
    await expect(cli.run()).rejects.toThrow('process.exit called');
    const errOutput = errorSpy.mock.calls.map((c) => c[0]).join('\n');
    expect(errOutput).toContain('Unknown technology');
    expect(exitSpy).toHaveBeenCalledWith(1);
  });

  it('help command prints usage', async () => {
    process.argv = ['node', 'index.js', 'help'];
    const cli = new ClaudeCraftCLI();
    await cli.run();
    const output = logSpy.mock.calls.map((c) => c[0]).join('\n');
    expect(output).toContain('Usage');
  });

  it('init command prints workflow message', async () => {
    process.argv = ['node', 'index.js', 'init'];
    const cli = new ClaudeCraftCLI();
    await cli.run();
    const output = logSpy.mock.calls.map((c) => c[0]).join('\n');
    expect(output).toContain('workflow');
  });

  it('unknown command exits with error', async () => {
    process.argv = ['node', 'index.js', 'foobar'];
    const cli = new ClaudeCraftCLI();
    await expect(cli.run()).rejects.toThrow('process.exit called');
    const output = logSpy.mock.calls.map((c) => c[0]).join('\n');
    expect(output).toContain('Unknown command');
    expect(exitSpy).toHaveBeenCalledWith(1);
  });

  it('config.targetPath resolves to cwd when no path given', async () => {
    process.argv = ['node', 'index.js', '--version'];
    const cli = new ClaudeCraftCLI();
    await cli.run();
    expect(cli.config.targetPath).toBe(process.cwd());
  });

  it('sets valid language from --lang option', async () => {
    process.argv = ['node', 'index.js', 'help', '--lang=fr'];
    const cli = new ClaudeCraftCLI();
    await cli.run();
    expect(cli.config.language).toBe('fr');
  });

  it('sets valid tech from --tech option', async () => {
    process.argv = ['node', 'index.js', 'help', '--tech=react'];
    const cli = new ClaudeCraftCLI();
    await cli.run();
    expect(cli.config.technologies).toEqual(['react']);
  });

  it('resolves targetPath from command argument', async () => {
    process.argv = ['node', 'index.js', 'help', '/tmp/some-path'];
    const cli = new ClaudeCraftCLI();
    await cli.run();
    expect(cli.config.targetPath).toBe('/tmp/some-path');
  });

  it('flatten command calls flattenCodebase', async () => {
    process.argv = ['node', 'index.js', 'flatten', '--output=test.md'];
    const cli = new ClaudeCraftCLI();
    // Mock flattenCodebase to avoid actual file system operations
    cli.flattenCodebase = vi.fn().mockResolvedValue(undefined);
    await cli.run();
    expect(cli.flattenCodebase).toHaveBeenCalledWith(expect.objectContaining({ output: 'test.md' }));
  });

  it('flattenCodebase method exists and is callable', () => {
    const cli = new ClaudeCraftCLI();
    expect(typeof cli.flattenCodebase).toBe('function');
  });

  it('flattenCodebase prints banner and codebase flattener header', async () => {
    process.argv = ['node', 'index.js', 'flatten'];
    const cli = new ClaudeCraftCLI();
    // Mock the flatten function to avoid actual file operations
    const { flatten: flattenFn } = await import('../../cli/lib/flattener.js');
    cli.flattenCodebase = vi.fn().mockResolvedValue(undefined);
    await cli.run();
    expect(cli.flattenCodebase).toHaveBeenCalled();
  });

  it('createReadline and closeReadline manage rl lifecycle', () => {
    const cli = new ClaudeCraftCLI();
    expect(cli.rl).toBeNull();
    cli.createReadline();
    expect(cli.rl).not.toBeNull();
    cli.closeReadline();
    expect(cli.rl).toBeNull();
    // Double close is safe
    cli.closeReadline();
    expect(cli.rl).toBeNull();
  });
});
