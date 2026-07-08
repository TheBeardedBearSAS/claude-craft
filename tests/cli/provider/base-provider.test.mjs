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
