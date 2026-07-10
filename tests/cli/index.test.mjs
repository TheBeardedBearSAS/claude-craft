import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// Hoist module mocks before any dynamic imports of cli/index.js.
// These stub out modules with side effects (spawns, servers, FS writes)
// so that switch-branch coverage can be exercised without real I/O.
vi.mock('../../cli/lib/installer.js', () => ({
  interactiveInstall: vi.fn().mockResolvedValue(undefined),
  runInstallation: vi.fn().mockResolvedValue(undefined),
  autoInstall: vi.fn().mockResolvedValue(undefined),
}));
vi.mock('../../cli/lib/install-from-url.js', () => ({
  runInstallFromUrl: vi.fn().mockResolvedValue(undefined),
}));
vi.mock('../../cli/lib/skill.js', () => ({
  runSkillAdd: vi.fn(),
  runSkillList: vi.fn(),
  runSkillRemove: vi.fn(),
}));
vi.mock('../../cli/lib/ralph.js', () => ({
  runRalph: vi.fn().mockResolvedValue(undefined),
}));
vi.mock('../../cli/lib/kanban.js', () => ({
  runKanban: vi.fn().mockResolvedValue(undefined),
}));
vi.mock('../../cli/lib/check.js', () => ({ runCheck: vi.fn() }));
vi.mock('../../cli/lib/list.js', () => ({ runList: vi.fn() }));
vi.mock('../../cli/lib/doctor.js', () => ({ runDoctor: vi.fn() }));
vi.mock('../../cli/lib/update.js', () => ({ runUpdate: vi.fn() }));
vi.mock('../../cli/lib/flattener.js', () => ({
  flatten: vi.fn().mockResolvedValue(undefined),
}));

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CLI_ROOT = path.resolve(__dirname, '..', '..');

// --- VERSION loading ---
// Note: parseArgs, TECHNOLOGIES, LANGUAGES, runRalph arg building, and
// flattenCodebase option tests were removed in v5.14.0 (TEST-15) because
// they are now covered by dedicated module test files:
//   - tests/cli/parseArgs.test.mjs
//   - tests/cli/constants.test.mjs
//   - tests/cli/ralph.test.mjs
//   - tests/cli/flattener.test.mjs

describe('VERSION loading', () => {
  it('package.json version matches expected format', () => {
    const pkg = JSON.parse(fs.readFileSync(path.join(CLI_ROOT, 'package.json'), 'utf8'));
    expect(pkg.version).toMatch(/^\d+\.\d+\.\d+/);
  });
});

describe('ClaudeCraftCLI', () => {
  let consoleSpy;
  let consoleErrorSpy;

  beforeEach(() => {
    consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });

  it('flattenCodebase delegates to flattener with options', async () => {
    // Dynamic import to get a fresh module
    const { ClaudeCraftCLI } = await import('../../cli/index.js');
    const cli = new ClaudeCraftCLI();

    // Mock the flattenCodebaseFn by intercepting the flatten call
    // We test that flattenCodebase calls printBanner and sets up parameters correctly
    const mockFlatten = vi.fn().mockResolvedValue(undefined);

    // Patch the module-level flatten import via the class method
    // Since flattenCodebase calls printBanner and flattenCodebaseFn,
    // we need to verify the method exists and handles options
    expect(typeof cli.flattenCodebase).toBe('function');

    // Test with output option
    cli.config.targetPath = '/test/path';
    // The method will throw because flattenCodebaseFn tries to read files,
    // but we can verify it processes options correctly by catching
    try {
      await cli.flattenCodebase({ output: 'test.md' });
    } catch {
      // Expected — flattenCodebaseFn will fail in test env
    }

    const output = consoleSpy.mock.calls.map((c) => c[0]).join('\n');
    expect(output).toContain('Codebase Flattener');
  });

  // CLI-08: path traversal guard on --output (audit CLI-08)
  it('flattenCodebase rejects --output pointing to a system directory', async () => {
    const { ClaudeCraftCLI } = await import('../../cli/index.js');
    const cli = new ClaudeCraftCLI();
    cli.config.targetPath = process.cwd();
    await expect(cli.flattenCodebase({ output: '/etc/evil.md' })).rejects.toThrow(/system directory|Refusing/i);
  });

  it('flattenCodebase rejects path-traversal in --output', async () => {
    const { ClaudeCraftCLI } = await import('../../cli/index.js');
    const cli = new ClaudeCraftCLI();
    cli.config.targetPath = process.cwd();
    // /var/../../etc resolves to /etc — a forbidden system dir
    await expect(cli.flattenCodebase({ output: '/var/../../etc/evil.md' })).rejects.toThrow(
      /system directory|Refusing/i
    );
  });

  it('constructor initializes with default config', async () => {
    const { ClaudeCraftCLI } = await import('../../cli/index.js');
    const cli = new ClaudeCraftCLI();
    expect(cli.config.language).toBe('en');
    expect(cli.config.includeCommon).toBe(true);
    expect(cli.config.includeProject).toBe(true);
    expect(cli.rl).toBeNull();
  });

  it('detectProject delegates to the module function', async () => {
    const { ClaudeCraftCLI } = await import('../../cli/index.js');
    const cli = new ClaudeCraftCLI();
    const result = cli.detectProject(CLI_ROOT);
    expect(result).toHaveProperty('suggestedTechs');
    expect(result).toHaveProperty('complexity');
  });

  it('parseArgs delegates to the module function', async () => {
    const { ClaudeCraftCLI } = await import('../../cli/index.js');
    const cli = new ClaudeCraftCLI();
    const result = cli.parseArgs(['install', '/tmp/test', '--lang=fr']);
    expect(result.command).toBe('install');
    expect(result.path).toBe('/tmp/test');
    expect(result.options.lang).toBe('fr');
  });
});

// ─── Switch branch coverage (CC-REL-03) ───────────────────────────────────────
// These tests exercise every case label in run()'s switch statement, plus the
// prompt() method, to bring cli/index.js branch coverage from ~66% to ≥85%.
describe('ClaudeCraftCLI.run() — switch branch coverage', () => {
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
    vi.clearAllMocks(); // reset call counts between tests (keeps vi.mock stubs)
  });

  afterEach(() => {
    process.argv = originalArgv;
    vi.restoreAllMocks();
  });

  it('install --from=url → runInstallFromUrl', async () => {
    process.argv = ['node', 'index.js', 'install', '--from=https://example.com/config.json'];
    const { ClaudeCraftCLI } = await import('../../cli/index.js');
    const { runInstallFromUrl } = await import('../../cli/lib/install-from-url.js');
    const cli = new ClaudeCraftCLI();
    await cli.run();
    expect(runInstallFromUrl).toHaveBeenCalledWith('https://example.com/config.json', cli, expect.any(Object));
  });

  it('install --auto → autoInstall', async () => {
    process.argv = ['node', 'index.js', 'install', '--auto'];
    const { ClaudeCraftCLI } = await import('../../cli/index.js');
    const { autoInstall } = await import('../../cli/lib/installer.js');
    const cli = new ClaudeCraftCLI();
    await cli.run();
    expect(autoInstall).toHaveBeenCalled();
  });

  it('install non-interactive: targetPath + tech → runInstallation', async () => {
    process.argv = ['node', 'index.js', 'install', '.', '--tech=react'];
    const { ClaudeCraftCLI } = await import('../../cli/index.js');
    const { runInstallation } = await import('../../cli/lib/installer.js');
    const cli = new ClaudeCraftCLI();
    await cli.run();
    expect(runInstallation).toHaveBeenCalled();
  });

  it('install interactive: no tech → interactiveInstall', async () => {
    process.argv = ['node', 'index.js', 'install', '.'];
    const { ClaudeCraftCLI } = await import('../../cli/index.js');
    const { interactiveInstall } = await import('../../cli/lib/installer.js');
    const cli = new ClaudeCraftCLI();
    await cli.run();
    expect(interactiveInstall).toHaveBeenCalled();
  });

  it('check command → runCheck', async () => {
    process.argv = ['node', 'index.js', 'check'];
    const { ClaudeCraftCLI } = await import('../../cli/index.js');
    const { runCheck } = await import('../../cli/lib/check.js');
    const cli = new ClaudeCraftCLI();
    await cli.run();
    expect(runCheck).toHaveBeenCalled();
  });

  it('list command → runList', async () => {
    process.argv = ['node', 'index.js', 'list'];
    const { ClaudeCraftCLI } = await import('../../cli/index.js');
    const { runList } = await import('../../cli/lib/list.js');
    const cli = new ClaudeCraftCLI();
    await cli.run();
    expect(runList).toHaveBeenCalled();
  });

  it('doctor command → runDoctor', async () => {
    process.argv = ['node', 'index.js', 'doctor'];
    const { ClaudeCraftCLI } = await import('../../cli/index.js');
    const { runDoctor } = await import('../../cli/lib/doctor.js');
    const cli = new ClaudeCraftCLI();
    await cli.run();
    expect(runDoctor).toHaveBeenCalled();
  });

  it('update command → runUpdate', async () => {
    process.argv = ['node', 'index.js', 'update'];
    const { ClaudeCraftCLI } = await import('../../cli/index.js');
    const { runUpdate } = await import('../../cli/lib/update.js');
    const cli = new ClaudeCraftCLI();
    await cli.run();
    expect(runUpdate).toHaveBeenCalled();
  });

  it('ralph command → runRalph', async () => {
    process.argv = ['node', 'index.js', 'ralph', 'do the thing'];
    const { ClaudeCraftCLI } = await import('../../cli/index.js');
    const { runRalph } = await import('../../cli/lib/ralph.js');
    const cli = new ClaudeCraftCLI();
    await cli.run();
    expect(runRalph).toHaveBeenCalled();
  });

  it('kanban command → runKanban (dynamic import)', async () => {
    process.argv = ['node', 'index.js', 'kanban'];
    const { ClaudeCraftCLI } = await import('../../cli/index.js');
    const { runKanban } = await import('../../cli/lib/kanban.js');
    const cli = new ClaudeCraftCLI();
    await cli.run();
    expect(runKanban).toHaveBeenCalled();
  });

  it('ERG-01: --help never falls through to interactiveInstall', async () => {
    // Regression test for ERG-01: parseArgs converts '--help' to
    // options.help=true (not a command), so command stays null and the
    // switch's default branch used to mistake this for "no command" and
    // launch interactiveInstall — which blocks on stdin and hangs in CI
    // when stdin is closed. run() now short-circuits on '--help' before
    // parseArgs is even called.
    process.argv = ['node', 'index.js', '--help'];
    const { ClaudeCraftCLI } = await import('../../cli/index.js');
    const { interactiveInstall } = await import('../../cli/lib/installer.js');
    const cli = new ClaudeCraftCLI();
    await cli.run();
    expect(interactiveInstall).not.toHaveBeenCalled();
    const output = logSpy.mock.calls.map((c) => c[0]).join('\n');
    expect(output).toContain('Usage');
  });

  it('case "--help" reachable via mocked parseArgs → printHelp', async () => {
    // Direct branch hit for the dead case '--help': label in the switch.
    process.argv = ['node', 'index.js'];
    const { ClaudeCraftCLI } = await import('../../cli/index.js');
    const cli = new ClaudeCraftCLI();
    cli.parseArgs = vi.fn().mockReturnValue({ command: '--help', path: null, options: {} });
    await cli.run();
    const output = logSpy.mock.calls.map((c) => c[0]).join('\n');
    expect(output).toContain('Usage');
  });

  it('-h command → printHelp', async () => {
    // '-h' does NOT start with '--' so parseArgs treats it as command = '-h'.
    process.argv = ['node', 'index.js', '-h'];
    const { ClaudeCraftCLI } = await import('../../cli/index.js');
    const cli = new ClaudeCraftCLI();
    await cli.run();
    const output = logSpy.mock.calls.map((c) => c[0]).join('\n');
    expect(output).toContain('Usage');
  });

  it('no args → default branch with no command → interactiveInstall', async () => {
    process.argv = ['node', 'index.js'];
    const { ClaudeCraftCLI } = await import('../../cli/index.js');
    const { interactiveInstall } = await import('../../cli/lib/installer.js');
    const cli = new ClaudeCraftCLI();
    await cli.run();
    expect(interactiveInstall).toHaveBeenCalled();
  });

  it('skill add <pkg> → runSkillAdd', async () => {
    process.argv = ['node', 'index.js', 'skill', 'add', 'claude-craft-skill-my-skill'];
    const { ClaudeCraftCLI } = await import('../../cli/index.js');
    const { runSkillAdd } = await import('../../cli/lib/skill.js');
    const cli = new ClaudeCraftCLI();
    await cli.run();
    expect(runSkillAdd).toHaveBeenCalledWith('claude-craft-skill-my-skill', expect.any(String));
  });

  it('skill add (no arg) → error + exit(1)', async () => {
    process.argv = ['node', 'index.js', 'skill', 'add'];
    const { ClaudeCraftCLI } = await import('../../cli/index.js');
    const cli = new ClaudeCraftCLI();
    await expect(cli.run()).rejects.toThrow('process.exit called');
    const errOutput = errorSpy.mock.calls.map((c) => c[0]).join('\n');
    expect(errOutput).toContain('Usage: claude-craft skill add');
    expect(exitSpy).toHaveBeenCalledWith(1);
  });

  it('skill list → runSkillList', async () => {
    process.argv = ['node', 'index.js', 'skill', 'list'];
    const { ClaudeCraftCLI } = await import('../../cli/index.js');
    const { runSkillList } = await import('../../cli/lib/skill.js');
    const cli = new ClaudeCraftCLI();
    await cli.run();
    expect(runSkillList).toHaveBeenCalled();
  });

  it('skill remove <name> → runSkillRemove', async () => {
    process.argv = ['node', 'index.js', 'skill', 'remove', 'my-skill'];
    const { ClaudeCraftCLI } = await import('../../cli/index.js');
    const { runSkillRemove } = await import('../../cli/lib/skill.js');
    const cli = new ClaudeCraftCLI();
    await cli.run();
    expect(runSkillRemove).toHaveBeenCalledWith('my-skill', expect.any(String));
  });

  it('skill rm <name> → runSkillRemove (alias)', async () => {
    process.argv = ['node', 'index.js', 'skill', 'rm', 'my-skill'];
    const { ClaudeCraftCLI } = await import('../../cli/index.js');
    const { runSkillRemove } = await import('../../cli/lib/skill.js');
    const cli = new ClaudeCraftCLI();
    await cli.run();
    expect(runSkillRemove).toHaveBeenCalledWith('my-skill', expect.any(String));
  });

  it('skill remove (no arg) → error + exit(1)', async () => {
    process.argv = ['node', 'index.js', 'skill', 'remove'];
    const { ClaudeCraftCLI } = await import('../../cli/index.js');
    const cli = new ClaudeCraftCLI();
    await expect(cli.run()).rejects.toThrow('process.exit called');
    const errOutput = errorSpy.mock.calls.map((c) => c[0]).join('\n');
    expect(errOutput).toContain('Usage: claude-craft skill remove');
    expect(exitSpy).toHaveBeenCalledWith(1);
  });

  it('skill unknown → error + exit(1)', async () => {
    process.argv = ['node', 'index.js', 'skill', 'foobar'];
    const { ClaudeCraftCLI } = await import('../../cli/index.js');
    const cli = new ClaudeCraftCLI();
    await expect(cli.run()).rejects.toThrow('process.exit called');
    const errOutput = errorSpy.mock.calls.map((c) => c[0]).join('\n');
    expect(errOutput).toContain('Unknown skill subcommand');
    expect(exitSpy).toHaveBeenCalledWith(1);
  });

  it('flattenCodebase without output option uses default filename (absolute path, audit CLI-08)', async () => {
    const { ClaudeCraftCLI } = await import('../../cli/index.js');
    const { flatten } = await import('../../cli/lib/flattener.js');
    const cli = new ClaudeCraftCLI();
    await cli.flattenCodebase({});
    // flatten is now called with the resolved absolute path (assertSafeTarget resolves relative paths)
    expect(flatten).toHaveBeenCalledWith(expect.any(String), expect.stringContaining('CODEBASE_CONTEXT.md'), {});
    const actualOutputArg = flatten.mock.calls.at(-1)[1];
    expect(actualOutputArg).toMatch(/^\//); // must be an absolute path
  });

  it('prompt() resolves with trimmed answer', async () => {
    const { ClaudeCraftCLI } = await import('../../cli/index.js');
    const cli = new ClaudeCraftCLI();
    cli.createReadline();
    vi.spyOn(cli.rl, 'question').mockImplementation((_q, cb) => cb('  hello world  '));
    const result = await cli.prompt('Enter: ');
    expect(result).toBe('hello world');
    cli.closeReadline();
  });
});
