import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

vi.mock('execa', () => ({ execa: vi.fn() }));

const { BaseProvider } = await import('../../../cli/lib/provider/base-provider.js');
const { ClaudeProvider } = await import('../../../cli/lib/provider/claude-provider.js');
const { CodexProvider } = await import('../../../cli/lib/provider/codex-provider.js');
const { OpenCodeProvider } = await import('../../../cli/lib/provider/opencode-provider.js');
const { VibeProvider } = await import('../../../cli/lib/provider/vibe-provider.js');

describe('BaseProvider default isAvailable/getVersion template', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('reports unavailable when no binaryName is set', async () => {
    const provider = new BaseProvider();
    expect(await provider.isAvailable()).toBe(false);
    expect(await provider.getVersion()).toBe('unknown');
  });

  it('checks availability by running "<binaryName> --version"', async () => {
    const { execa } = await import('execa');
    execa.mockResolvedValue({ stdout: '1.2.3' });

    const provider = new BaseProvider();
    provider.binaryName = 'some-binary';

    expect(await provider.isAvailable()).toBe(true);
    expect(execa).toHaveBeenCalledWith('some-binary', ['--version']);
  });

  it('reports unavailable when the binary is missing', async () => {
    const { execa } = await import('execa');
    execa.mockRejectedValue(new Error('not found'));

    const provider = new BaseProvider();
    provider.binaryName = 'missing-binary';

    expect(await provider.isAvailable()).toBe(false);
    expect(await provider.getVersion()).toBe('unknown');
  });
});

describe('BaseProvider abstract template methods', () => {
  it('execute() throws naming the concrete constructor', async () => {
    const provider = new BaseProvider();
    await expect(provider.execute('version', [])).rejects.toThrow(
      "Method 'execute' must be implemented by BaseProvider"
    );
  });

  it('sendMessage() throws naming the concrete constructor', async () => {
    const provider = new BaseProvider();
    await expect(provider.sendMessage('hi')).rejects.toThrow(
      "Method 'sendMessage' must be implemented by BaseProvider"
    );
  });

  it('spawnSubAgent() throws naming the concrete constructor', async () => {
    const provider = new BaseProvider();
    await expect(provider.spawnSubAgent('task')).rejects.toThrow(
      "Method 'spawnSubAgent' must be implemented by BaseProvider"
    );
  });

  it('getMCPServers() defaults to an empty object', () => {
    const provider = new BaseProvider();
    expect(provider.getMCPServers()).toEqual({});
  });

  it('getDefaultConfig() returns the shared default execution settings', () => {
    const provider = new BaseProvider();
    provider.defaultModel = 'some-model';

    expect(provider.getDefaultConfig()).toEqual({
      model: 'some-model',
      timeout: 3600,
      temperature: 0.7,
      max_tokens: 128000,
    });
  });

  it('mapCommand() passes commands through unchanged by default', () => {
    const provider = new BaseProvider();
    expect(provider.mapCommand('deploy', ['--env', 'prod'])).toEqual(['deploy', '--env', 'prod']);
  });

  describe('validateConfig()', () => {
    it('rejects a falsy config', () => {
      const provider = new BaseProvider();
      expect(provider.validateConfig(null)).toBe(false);
      expect(provider.validateConfig(undefined)).toBe(false);
    });

    it('accepts a config without a model', () => {
      const provider = new BaseProvider();
      expect(provider.validateConfig({})).toBe(true);
    });

    it('rejects a model not present in supportedModels', () => {
      const provider = new BaseProvider();
      provider.supportedModels = ['model-a', 'model-b'];
      expect(provider.validateConfig({ model: 'model-c' })).toBe(false);
    });

    it('accepts a model present in supportedModels', () => {
      const provider = new BaseProvider();
      provider.supportedModels = ['model-a', 'model-b'];
      expect(provider.validateConfig({ model: 'model-a' })).toBe(true);
    });
  });
});

describe('Concrete providers wire binaryName into the shared template', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it.each([
    ['claude', () => new ClaudeProvider()],
    ['codex', () => new CodexProvider()],
    ['opencode', () => new OpenCodeProvider()],
    ['vibe', () => new VibeProvider()],
  ])('%s provider checks its own binary via the base template', async (binaryName, factory) => {
    const { execa } = await import('execa');
    execa.mockClear();
    execa.mockResolvedValue({ stdout: `${binaryName} 1.0.0` });

    const provider = factory();
    expect(provider.binaryName).toBe(binaryName);

    const version = await provider.getVersion();
    expect(execa).toHaveBeenCalledWith(binaryName, ['--version']);
    expect(version).toBe(`${binaryName} 1.0.0`);
  });
});
