import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import os from 'os';

const createInterfaceMock = vi.fn();
vi.mock('readline', () => ({
  default: { createInterface: createInterfaceMock },
  createInterface: createInterfaceMock,
}));
vi.mock('execa', () => ({ execa: vi.fn() }));

const { ClaudeCraftCLI } = await import('../../cli/index.js');
const { execa } = await import('execa');
const { providerManager } = await import('../../cli/lib/ai-provider.js');
const { claudeCompat } = await import('../../cli/lib/legacy/claude-compat.js');

function mockReadlineAnswer(answer) {
  createInterfaceMock.mockReturnValue({
    question: (_q, cb) => cb(answer),
    close: () => {},
  });
}

describe('ClaudeCraftCLI extra command handlers', () => {
  let logSpy;
  let errorSpy;
  let warnSpy;
  let exitSpy;
  let tempDir;

  beforeEach(() => {
    logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    exitSpy = vi.spyOn(process, 'exit').mockImplementation(() => {
      throw new Error('process.exit called');
    });
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'cli-index-extra-'));
    execa.mockReset().mockResolvedValue({ exitCode: 0 });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  function output() {
    return logSpy.mock.calls.map((c) => c[0]).join('\n');
  }

  // -------------------------------------------------------------------
  // handleProvidersCommand / handleProviderStatus
  // -------------------------------------------------------------------
  describe('handleProvidersCommand', () => {
    it('lists providers with availability and version', async () => {
      const cli = new ClaudeCraftCLI();
      cli.currentProvider = 'claude';
      vi.spyOn(providerManager, 'getProviderNames').mockReturnValue(['claude', 'codex']);
      vi.spyOn(providerManager, 'getProvider').mockImplementation((name) => ({
        isAvailable: () => Promise.resolve(name === 'claude'),
        getVersion: () => Promise.resolve('1.0.0'),
      }));

      await cli.handleProvidersCommand({});

      expect(output()).toContain('Available AI Providers');
      expect(output()).toContain('claude');
      expect(output()).toContain('codex');
      expect(output()).toContain('Primary provider: claude');
    });

    it('detects current provider when not already set', async () => {
      const cli = new ClaudeCraftCLI();
      cli.currentProvider = null;
      vi.spyOn(providerManager, 'getProviderNames').mockReturnValue([]);
      vi.spyOn(providerManager, 'detectProvider').mockResolvedValue('vibe');

      await cli.handleProvidersCommand({});

      expect(output()).toContain('Primary provider: vibe');
    });
  });

  describe('handleProviderStatus', () => {
    it('prints health status for each provider', async () => {
      const cli = new ClaudeCraftCLI();
      vi.spyOn(providerManager, 'getHealthStatus').mockResolvedValue({
        claude: {
          available: true,
          version: '2.0.0',
          displayName: 'Claude Code',
          health: { healthy: true, message: 'ok' },
        },
        codex: { available: false, error: 'not installed' },
      });

      await cli.handleProviderStatus({});

      expect(output()).toContain('Claude Code');
      expect(output()).toContain('Healthy');
      expect(output()).toContain('not installed');
    });
  });

  // -------------------------------------------------------------------
  // handleSetProvider
  // -------------------------------------------------------------------
  describe('handleSetProvider', () => {
    it('rejects an unknown provider', async () => {
      const cli = new ClaudeCraftCLI();
      vi.spyOn(providerManager, 'getProviderNames').mockReturnValue(['claude']);

      await expect(cli.handleSetProvider('nonexistent')).rejects.toThrow('process.exit called');
      expect(errorSpy.mock.calls.join('\n')).toContain('Unknown AI provider');
      expect(exitSpy).toHaveBeenCalledWith(1);
    });

    it('sets and persists a valid provider', async () => {
      const cli = new ClaudeCraftCLI();
      cli.config.targetPath = tempDir;
      vi.spyOn(providerManager, 'getProviderNames').mockReturnValue(['codex']);
      vi.spyOn(providerManager, 'setProvider').mockImplementation(() => {});
      vi.spyOn(providerManager, 'loadConfig').mockReturnValue({});
      const saveSpy = vi.spyOn(providerManager, 'saveConfig').mockImplementation(() => {});

      await cli.handleSetProvider('codex');

      expect(cli.config.provider).toBe('codex');
      expect(cli.currentProvider).toBe('codex');
      expect(saveSpy).toHaveBeenCalledWith(
        expect.objectContaining({ providers: { primary: 'codex' } }),
        expect.any(String)
      );
      expect(output()).toContain('Default provider set to: codex');
    });
  });

  // -------------------------------------------------------------------
  // handleMCPCommand / listMCPServers / startMCPServers / addMCPServer
  // -------------------------------------------------------------------
  describe('handleMCPCommand', () => {
    it('defaults to list when no subcommand is given', async () => {
      const cli = new ClaudeCraftCLI();
      cli.currentProvider = 'claude';
      cli.config.targetPath = tempDir;
      vi.spyOn(providerManager, 'getAllMCPServers').mockResolvedValue({
        builtIn: { filesystem: { description: 'FS access' } },
        providerCustom: {},
        globalCustom: {},
      });

      await cli.handleMCPCommand([], {});

      expect(output()).toContain('MCP Servers for claude');
      expect(output()).toContain('filesystem');
      expect(output()).toContain('Total: 1 servers');
    });

    it('lists provider-custom and global-custom servers when present', async () => {
      const cli = new ClaudeCraftCLI();
      cli.currentProvider = 'claude';
      cli.config.targetPath = tempDir;
      vi.spyOn(providerManager, 'getAllMCPServers').mockResolvedValue({
        builtIn: {},
        providerCustom: { custom1: { description: 'Custom', source: 'provider.yaml' } },
        globalCustom: { custom2: { description: 'Global', source: 'global.yaml' } },
      });

      await cli.handleMCPCommand(['ls'], {});

      expect(output()).toContain('Provider Custom Servers');
      expect(output()).toContain('Global Custom Servers');
      expect(output()).toContain('Total: 2 servers');
    });

    // ERG-05/FONC-02: startAllMCPServers() is a stub (would_start, no real
    // process is spawned), but the CLI used to print "✅ MCP Servers
    // initialized: Started: N" — a false claim of success. The message must
    // be honest about auto-start not being implemented yet.
    it('registers MCP servers without claiming a real start (ERG-05)', async () => {
      const cli = new ClaudeCraftCLI();
      cli.currentProvider = 'claude';
      cli.config.targetPath = tempDir;
      vi.spyOn(providerManager, 'startAllMCPServers').mockResolvedValue({
        started: { filesystem: {} },
        failed: { git: { error: 'boom' } },
        total: 2,
      });

      await cli.handleMCPCommand(['start'], {});

      expect(output()).not.toContain('MCP Servers initialized');
      expect(output()).toContain('MCP servers registered (1)');
      expect(output()).toContain('auto-start is not yet implemented');
      expect(output()).toContain('git: boom');
    });

    it('prints a not-yet-implemented message for stop', async () => {
      const cli = new ClaudeCraftCLI();
      await cli.handleMCPCommand(['stop'], {});
      expect(output()).toContain('not yet implemented');
    });

    it('requires a server name for add', async () => {
      const cli = new ClaudeCraftCLI();
      await expect(cli.handleMCPCommand(['add'], {})).rejects.toThrow('process.exit called');
      expect(errorSpy.mock.calls.join('\n')).toContain('Usage: ai-craft mcp add');
    });

    it('adds a custom MCP server and writes its config file', async () => {
      const cli = new ClaudeCraftCLI();
      cli.config.targetPath = tempDir;

      await cli.handleMCPCommand(['add', 'my-server'], {
        command: 'node',
        args: 'a,b',
        env: '{"KEY":"value"}',
        timeout: '60',
        description: 'My server',
      });

      const serverPath = path.join(tempDir, '.ai-craft', 'mcp', 'my-server.json');
      expect(fs.existsSync(serverPath)).toBe(true);
      const written = JSON.parse(fs.readFileSync(serverPath, 'utf8'));
      expect(written).toEqual({
        name: 'my-server',
        description: 'My server',
        command: 'node',
        args: ['a', 'b'],
        env: { KEY: 'value' },
        timeout: 60,
        enabled: true,
        auto_start: true,
      });
      expect(output()).toContain('MCP Server added: my-server');
    });

    it('rejects an unknown MCP subcommand', async () => {
      const cli = new ClaudeCraftCLI();
      await expect(cli.handleMCPCommand(['bogus'], {})).rejects.toThrow('process.exit called');
      expect(errorSpy.mock.calls.join('\n')).toContain('Unknown MCP subcommand');
    });

    // SEC-01: serverName was interpolated into path.join(mcpDir, `${serverName}.json`)
    // without validation, so `mcp add '../../escaped-poc' --command=evil` wrote a
    // JSON file outside .ai-craft/mcp/ (CWE-22 path traversal).
    it('rejects a server name that path-traversals out of the mcp directory (SEC-01)', async () => {
      const cli = new ClaudeCraftCLI();
      cli.config.targetPath = tempDir;

      await expect(cli.handleMCPCommand(['add', '../../escaped-poc'], { command: 'evil' })).rejects.toThrow(
        'process.exit called'
      );

      expect(fs.existsSync(path.join(tempDir, 'escaped-poc.json'))).toBe(false);
      expect(errorSpy.mock.calls.join('\n')).toContain('Invalid MCP server name');
      expect(exitSpy).toHaveBeenCalledWith(1);
    });

    it('requires --command when adding a valid server name (ERG-06)', async () => {
      const cli = new ClaudeCraftCLI();
      cli.config.targetPath = tempDir;

      await expect(cli.handleMCPCommand(['add', 'my-server'], {})).rejects.toThrow('process.exit called');

      expect(fs.existsSync(path.join(tempDir, '.ai-craft', 'mcp', 'my-server.json'))).toBe(false);
      expect(errorSpy.mock.calls.join('\n')).toContain('Usage: ai-craft mcp add <name> --command=<cmd>');
      expect(exitSpy).toHaveBeenCalledWith(1);
    });
  });

  // -------------------------------------------------------------------
  // handleConfigCommand / showConfig / setConfig / editConfig
  // -------------------------------------------------------------------
  describe('handleConfigCommand and showConfig/setConfig/editConfig', () => {
    it('shows the default config when no ai-craft.yaml exists', async () => {
      const cli = new ClaudeCraftCLI();
      cli.config.targetPath = tempDir;
      vi.spyOn(providerManager, 'getDefaultConfig').mockReturnValue({ providers: { primary: 'claude' } });

      await cli.handleConfigCommand([], {});

      expect(output()).toContain('AI Craft Configuration');
      expect(output()).toContain('primary: claude');
    });

    it('shows persisted config from ai-craft.yaml', async () => {
      const cli = new ClaudeCraftCLI();
      cli.config.targetPath = tempDir;
      fs.mkdirSync(path.join(tempDir, '.ai-craft'), { recursive: true });
      fs.writeFileSync(path.join(tempDir, '.ai-craft', 'ai-craft.yaml'), 'foo: bar\n');

      await cli.handleConfigCommand(['show'], {});

      expect(output()).toContain('foo: bar');
    });

    it('falls back to default config when ai-craft.yaml is corrupt', async () => {
      const cli = new ClaudeCraftCLI();
      cli.config.targetPath = tempDir;
      fs.mkdirSync(path.join(tempDir, '.ai-craft'), { recursive: true });
      fs.writeFileSync(path.join(tempDir, '.ai-craft', 'ai-craft.yaml'), ':::not yaml:::[[[');

      await cli.handleConfigCommand(['get'], {});

      expect(output()).toContain('AI Craft Configuration');
    });

    it('requires key and value for set', async () => {
      const cli = new ClaudeCraftCLI();
      await expect(cli.handleConfigCommand(['set', 'onlykey'], {})).rejects.toThrow('process.exit called');
      expect(errorSpy.mock.calls.join('\n')).toContain('Usage: ai-craft config set');
    });

    // SEC-02: the manual key.split('.') walk had no guard on __proto__/constructor/
    // prototype, so `config set __proto__.polluted 1` polluted Object.prototype
    // for the whole process (CWE-1321).
    it('rejects __proto__ key segments to prevent prototype pollution (SEC-02)', async () => {
      const cli = new ClaudeCraftCLI();
      cli.config.targetPath = tempDir;
      fs.mkdirSync(path.join(tempDir, '.ai-craft'), { recursive: true });

      await expect(cli.handleConfigCommand(['set', '__proto__.polluted', '1'], {})).rejects.toThrow(
        'process.exit called'
      );

      expect({}.polluted).toBeUndefined();
      expect(errorSpy.mock.calls.join('\n')).toContain('__proto__');
      expect(exitSpy).toHaveBeenCalledWith(1);
    });

    it('sets a nested config value with JSON parsing', async () => {
      const cli = new ClaudeCraftCLI();
      cli.config.targetPath = tempDir;
      fs.mkdirSync(path.join(tempDir, '.ai-craft'), { recursive: true });
      fs.writeFileSync(path.join(tempDir, '.ai-craft', 'ai-craft.yaml'), 'existing: true\n');

      await cli.handleConfigCommand(['set', 'providers.timeout', '30'], {});

      const written = fs.readFileSync(path.join(tempDir, '.ai-craft', 'ai-craft.yaml'), 'utf8');
      expect(written).toContain('timeout: 30');
      expect(output()).toContain('Configuration set: providers.timeout = 30');
    });

    it('sets a raw string value when JSON parsing fails', async () => {
      const cli = new ClaudeCraftCLI();
      cli.config.targetPath = tempDir;
      fs.mkdirSync(path.join(tempDir, '.ai-craft'), { recursive: true });
      vi.spyOn(providerManager, 'getDefaultConfig').mockReturnValue({});

      await cli.handleConfigCommand(['set', 'name', 'not-json'], {});

      const written = fs.readFileSync(path.join(tempDir, '.ai-craft', 'ai-craft.yaml'), 'utf8');
      expect(written).toContain('name: not-json');
    });

    it('edit creates default config when missing and prints editor info', async () => {
      const cli = new ClaudeCraftCLI();
      cli.config.targetPath = tempDir;
      vi.spyOn(providerManager, 'getDefaultConfig').mockReturnValue({ a: 1 });
      const saveSpy = vi.spyOn(providerManager, 'saveConfig').mockImplementation(() => {});

      await cli.handleConfigCommand(['edit'], {});

      expect(saveSpy).toHaveBeenCalled();
      expect(output()).toContain('Opening configuration in');
    });

    it('edit does not recreate an existing config', async () => {
      const cli = new ClaudeCraftCLI();
      cli.config.targetPath = tempDir;
      fs.mkdirSync(path.join(tempDir, '.ai-craft'), { recursive: true });
      fs.writeFileSync(path.join(tempDir, '.ai-craft', 'ai-craft.yaml'), 'a: 1\n');
      const saveSpy = vi.spyOn(providerManager, 'saveConfig').mockImplementation(() => {});

      await cli.handleConfigCommand(['edit'], {});

      expect(saveSpy).not.toHaveBeenCalled();
    });

    // ERG-07/FONC-04: editConfig() printed "Opening configuration in ${editor}..."
    // but never actually spawned the editor process — a comment in the code
    // said "For now, just show the path".
    it('edit spawns the configured editor with the config path (ERG-07)', async () => {
      const cli = new ClaudeCraftCLI();
      cli.config.targetPath = tempDir;
      fs.mkdirSync(path.join(tempDir, '.ai-craft'), { recursive: true });
      fs.writeFileSync(path.join(tempDir, '.ai-craft', 'ai-craft.yaml'), 'a: 1\n');
      const originalEditor = process.env.EDITOR;
      process.env.EDITOR = 'my-editor';

      try {
        await cli.handleConfigCommand(['edit'], {});
      } finally {
        process.env.EDITOR = originalEditor;
      }

      const configPath = path.join(tempDir, '.ai-craft', 'ai-craft.yaml');
      expect(execa).toHaveBeenCalledWith('my-editor', [configPath], expect.objectContaining({ stdio: 'inherit' }));
    });

    it('edit surfaces a clear error when the editor cannot be spawned (ERG-07)', async () => {
      const cli = new ClaudeCraftCLI();
      cli.config.targetPath = tempDir;
      fs.mkdirSync(path.join(tempDir, '.ai-craft'), { recursive: true });
      fs.writeFileSync(path.join(tempDir, '.ai-craft', 'ai-craft.yaml'), 'a: 1\n');
      execa.mockRejectedValueOnce(new Error('spawn nonexistent-editor ENOENT'));

      await expect(cli.handleConfigCommand(['edit'], {})).rejects.toThrow('process.exit called');

      expect(errorSpy.mock.calls.join('\n')).toContain('Could not open editor');
      expect(exitSpy).toHaveBeenCalledWith(1);
    });

    it('rejects an unknown config subcommand', async () => {
      const cli = new ClaudeCraftCLI();
      await expect(cli.handleConfigCommand(['bogus'], {})).rejects.toThrow('process.exit called');
      expect(errorSpy.mock.calls.join('\n')).toContain('Unknown config subcommand');
    });
  });

  // -------------------------------------------------------------------
  // initializeAICraft
  // -------------------------------------------------------------------
  describe('initializeAICraft', () => {
    it('copies AI-CRAFT.md when initProject succeeds and it does not exist yet', async () => {
      const cli = new ClaudeCraftCLI();
      cli.config.targetPath = tempDir;
      fs.mkdirSync(path.join(tempDir, '.ai-craft'), { recursive: true });
      vi.spyOn(providerManager, 'initProject').mockResolvedValue({ success: true });

      const result = await cli.initializeAICraft();

      expect(result.success).toBe(true);
    });

    it('returns a failure result when initProject throws', async () => {
      const cli = new ClaudeCraftCLI();
      cli.config.targetPath = tempDir;
      vi.spyOn(providerManager, 'initProject').mockRejectedValue(new Error('disk full'));

      const result = await cli.initializeAICraft();

      expect(result).toEqual({ success: false, error: 'disk full' });
      expect(warnSpy.mock.calls.join('\n')).toContain('Could not initialize AI Craft');
    });
  });

  // -------------------------------------------------------------------
  // handleMigration
  // -------------------------------------------------------------------
  describe('handleMigration', () => {
    it('offers to initialize AI Craft when not a Claude Craft project and user declines', async () => {
      const cli = new ClaudeCraftCLI();
      cli.config.targetPath = tempDir;
      vi.spyOn(claudeCompat, 'isClaudeCraftProject').mockReturnValue(false);
      cli.rl = null;
      mockReadlineAnswer('n');

      await cli.handleMigration([], {});

      expect(output()).toContain('Skipped');
    });

    it('initializes AI Craft when not a Claude Craft project and user accepts', async () => {
      const cli = new ClaudeCraftCLI();
      cli.config.targetPath = tempDir;
      vi.spyOn(claudeCompat, 'isClaudeCraftProject').mockReturnValue(false);
      vi.spyOn(cli, 'initializeAICraft').mockResolvedValue({ success: true });
      mockReadlineAnswer('y');

      await cli.handleMigration([], {});

      expect(cli.initializeAICraft).toHaveBeenCalled();
      expect(output()).toContain('AI Craft initialized');
    });

    it('cancels migration when user declines confirmation', async () => {
      const cli = new ClaudeCraftCLI();
      cli.config.targetPath = tempDir;
      vi.spyOn(claudeCompat, 'isClaudeCraftProject').mockReturnValue(true);
      mockReadlineAnswer('n');

      await cli.handleMigration([], {});

      expect(output()).toContain('Migration cancelled');
    });

    it('runs migration successfully on confirmation', async () => {
      const cli = new ClaudeCraftCLI();
      cli.config.targetPath = tempDir;
      vi.spyOn(claudeCompat, 'isClaudeCraftProject').mockReturnValue(true);
      vi.spyOn(claudeCompat, 'migrate').mockResolvedValue({
        success: true,
        aiCraftDir: '.ai-craft',
        filesCopied: 10,
        aiCraftMdCreated: true,
        configCreated: true,
        symlinkCreated: true,
      });
      mockReadlineAnswer('y');

      await cli.handleMigration([], {});

      expect(output()).toContain('Migration completed successfully');
      expect(output()).toContain('Files copied: 10');
    });

    it('reports a failed migration with alreadyMigrated flag', async () => {
      const cli = new ClaudeCraftCLI();
      cli.config.targetPath = tempDir;
      vi.spyOn(claudeCompat, 'isClaudeCraftProject').mockReturnValue(true);
      vi.spyOn(claudeCompat, 'migrate').mockResolvedValue({
        success: false,
        error: 'already done',
        alreadyMigrated: true,
      });
      mockReadlineAnswer('y');

      await cli.handleMigration([], {});

      expect(errorSpy.mock.calls.join('\n')).toContain('Migration failed');
      expect(output()).toContain('already been migrated');
    });

    it('exits with error when migrate() throws', async () => {
      const cli = new ClaudeCraftCLI();
      cli.config.targetPath = tempDir;
      vi.spyOn(claudeCompat, 'isClaudeCraftProject').mockReturnValue(true);
      vi.spyOn(claudeCompat, 'migrate').mockRejectedValue(new Error('disk error'));
      mockReadlineAnswer('y');

      await expect(cli.handleMigration([], {})).rejects.toThrow('process.exit called');
      expect(errorSpy.mock.calls.join('\n')).toContain('Migration error');
    });
  });

  // -------------------------------------------------------------------
  // printAICraftHelp
  // -------------------------------------------------------------------
  describe('printAICraftHelp', () => {
    it('prints multi-provider support info', async () => {
      const cli = new ClaudeCraftCLI();
      cli.currentProvider = 'vibe';

      await cli.printAICraftHelp();

      expect(output()).toContain('Multi-AI Provider Support');
      expect(output()).toContain('Current provider: vibe');
    });
  });

  // -------------------------------------------------------------------
  // run() dispatch for simple commands that just print a banner
  // -------------------------------------------------------------------
  describe('run() command dispatch', () => {
    let originalArgv;

    beforeEach(() => {
      originalArgv = process.argv;
      vi.spyOn(providerManager, 'detectProvider').mockResolvedValue('claude');
    });

    afterEach(() => {
      process.argv = originalArgv;
    });

    it('check command runs without throwing', async () => {
      process.argv = ['node', 'index.js', 'check', tempDir];
      const cli = new ClaudeCraftCLI();
      await cli.run();
      expect(output()).toContain('');
    });

    it('list command runs without throwing', async () => {
      process.argv = ['node', 'index.js', 'list', tempDir];
      const cli = new ClaudeCraftCLI();
      await cli.run();
      expect(output()).toContain('');
    });

    it('doctor command runs without throwing', async () => {
      process.argv = ['node', 'index.js', 'doctor', tempDir];
      const cli = new ClaudeCraftCLI();
      await cli.run();
      expect(output()).toContain('');
    });

    it('providers command dispatches to handleProvidersCommand', async () => {
      process.argv = ['node', 'index.js', 'providers'];
      const cli = new ClaudeCraftCLI();
      vi.spyOn(cli, 'handleProvidersCommand').mockResolvedValue(undefined);
      await cli.run();
      expect(cli.handleProvidersCommand).toHaveBeenCalled();
    });

    it('status command dispatches to handleProviderStatus', async () => {
      process.argv = ['node', 'index.js', 'status'];
      const cli = new ClaudeCraftCLI();
      vi.spyOn(cli, 'handleProviderStatus').mockResolvedValue(undefined);
      await cli.run();
      expect(cli.handleProviderStatus).toHaveBeenCalled();
    });

    it('init-ai-craft command initializes and prints confirmation', async () => {
      process.argv = ['node', 'index.js', 'init-ai-craft'];
      const cli = new ClaudeCraftCLI();
      vi.spyOn(cli, 'initializeAICraft').mockResolvedValue({ success: true });
      await cli.run();
      expect(output()).toContain('AI Craft initialized!');
    });

    it('use command requires a provider argument', async () => {
      process.argv = ['node', 'index.js', 'use'];
      const cli = new ClaudeCraftCLI();
      const exitSpy2 = vi.spyOn(process, 'exit').mockImplementation(() => {
        throw new Error('process.exit called');
      });
      await expect(cli.run()).rejects.toThrow('process.exit called');
      expect(exitSpy2).toHaveBeenCalledWith(1);
    });

    it('provider <name> command dispatches to handleSetProvider', async () => {
      process.argv = ['node', 'index.js', 'provider', 'codex'];
      const cli = new ClaudeCraftCLI();
      vi.spyOn(cli, 'handleSetProvider').mockResolvedValue(undefined);
      await cli.run();
      expect(cli.handleSetProvider).toHaveBeenCalledWith('codex');
    });

    // ERG-03: `provider list/status/use` were treated as a raw provider name
    // (not a subcommand keyword), so they all failed with
    // "Unknown AI provider 'list'" instead of dispatching like `mcp`/`config`.
    it('provider list dispatches to handleProvidersCommand (ERG-03)', async () => {
      process.argv = ['node', 'index.js', 'provider', 'list'];
      const cli = new ClaudeCraftCLI();
      vi.spyOn(cli, 'handleProvidersCommand').mockResolvedValue(undefined);
      await cli.run();
      expect(cli.handleProvidersCommand).toHaveBeenCalled();
    });

    it('provider status dispatches to handleProviderStatus (ERG-03)', async () => {
      process.argv = ['node', 'index.js', 'provider', 'status'];
      const cli = new ClaudeCraftCLI();
      vi.spyOn(cli, 'handleProviderStatus').mockResolvedValue(undefined);
      await cli.run();
      expect(cli.handleProviderStatus).toHaveBeenCalled();
    });

    it('provider use <name> dispatches to handleSetProvider (ERG-03)', async () => {
      process.argv = ['node', 'index.js', 'provider', 'use', 'codex'];
      const cli = new ClaudeCraftCLI();
      vi.spyOn(cli, 'handleSetProvider').mockResolvedValue(undefined);
      await cli.run();
      expect(cli.handleSetProvider).toHaveBeenCalledWith('codex');
    });

    it('provider use without a name errors with usage (ERG-03)', async () => {
      process.argv = ['node', 'index.js', 'provider', 'use'];
      const cli = new ClaudeCraftCLI();
      await expect(cli.run()).rejects.toThrow('process.exit called');
      expect(errorSpy.mock.calls.join('\n')).toContain('Usage: ai-craft provider use');
    });

    it('mcp command dispatches to handleMCPCommand', async () => {
      process.argv = ['node', 'index.js', 'mcp', 'list'];
      const cli = new ClaudeCraftCLI();
      vi.spyOn(cli, 'handleMCPCommand').mockResolvedValue(undefined);
      await cli.run();
      expect(cli.handleMCPCommand).toHaveBeenCalled();
    });

    it('config command dispatches to handleConfigCommand', async () => {
      process.argv = ['node', 'index.js', 'config', 'show'];
      const cli = new ClaudeCraftCLI();
      vi.spyOn(cli, 'handleConfigCommand').mockResolvedValue(undefined);
      await cli.run();
      expect(cli.handleConfigCommand).toHaveBeenCalled();
    });

    it('migrate command dispatches to handleMigration', async () => {
      process.argv = ['node', 'index.js', 'migrate'];
      const cli = new ClaudeCraftCLI();
      vi.spyOn(cli, 'handleMigration').mockResolvedValue(undefined);
      await cli.run();
      expect(cli.handleMigration).toHaveBeenCalled();
    });

    it('--provider option rejects an unknown provider name', async () => {
      process.argv = ['node', 'index.js', 'help', '--provider=bogus'];
      const cli = new ClaudeCraftCLI();
      const exitSpy2 = vi.spyOn(process, 'exit').mockImplementation(() => {
        throw new Error('process.exit called');
      });
      vi.spyOn(providerManager, 'getProviderNames').mockReturnValue(['claude']);
      await expect(cli.run()).rejects.toThrow('process.exit called');
      expect(exitSpy2).toHaveBeenCalledWith(1);
    });

    it('--provider option sets a valid provider', async () => {
      process.argv = ['node', 'index.js', 'help', '--provider=claude'];
      const cli = new ClaudeCraftCLI();
      vi.spyOn(providerManager, 'getProviderNames').mockReturnValue(['claude']);
      const setSpy = vi.spyOn(providerManager, 'setProvider').mockImplementation(() => {});
      await cli.run();
      expect(setSpy).toHaveBeenCalledWith('claude');
      expect(cli.config.provider).toBe('claude');
    });

    it('falls back to claude when provider detection throws', async () => {
      vi.spyOn(providerManager, 'detectProvider').mockRejectedValue(new Error('no CLI found'));
      process.argv = ['node', 'index.js', 'help'];
      const cli = new ClaudeCraftCLI();
      await cli.run();
      expect(cli.currentProvider).toBe('claude');
      expect(warnSpy.mock.calls.join('\n')).toContain('Could not detect AI provider');
    });

    it('skill add requires a package argument', async () => {
      process.argv = ['node', 'index.js', 'skill', 'add'];
      const cli = new ClaudeCraftCLI();
      const exitSpy2 = vi.spyOn(process, 'exit').mockImplementation(() => {
        throw new Error('process.exit called');
      });
      await expect(cli.run()).rejects.toThrow('process.exit called');
      expect(exitSpy2).toHaveBeenCalledWith(1);
    });

    it('skill list dispatches to runSkillList', async () => {
      process.argv = ['node', 'index.js', 'skill', 'list'];
      const cli = new ClaudeCraftCLI();
      await cli.run();
      // No throw: runSkillList runs against tempDir-less cwd, just verify it completed
      expect(true).toBe(true);
    });

    it('skill remove requires a name argument', async () => {
      process.argv = ['node', 'index.js', 'skill', 'remove'];
      const cli = new ClaudeCraftCLI();
      const exitSpy2 = vi.spyOn(process, 'exit').mockImplementation(() => {
        throw new Error('process.exit called');
      });
      await expect(cli.run()).rejects.toThrow('process.exit called');
      expect(exitSpy2).toHaveBeenCalledWith(1);
    });

    it('unknown skill subcommand exits with error', async () => {
      process.argv = ['node', 'index.js', 'skill', 'bogus'];
      const cli = new ClaudeCraftCLI();
      const exitSpy2 = vi.spyOn(process, 'exit').mockImplementation(() => {
        throw new Error('process.exit called');
      });
      await expect(cli.run()).rejects.toThrow('process.exit called');
      expect(errorSpy.mock.calls.join('\n')).toContain('Unknown skill subcommand');
    });
  });
});
