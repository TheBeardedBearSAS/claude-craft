import { describe, it, expect, vi, afterEach } from 'vitest';

vi.mock('execa', () => ({ execa: vi.fn() }));

const { ClaudeProvider } = await import('../../../cli/lib/provider/claude-provider.js');
const { CodexProvider } = await import('../../../cli/lib/provider/codex-provider.js');
const { OpenCodeProvider } = await import('../../../cli/lib/provider/opencode-provider.js');
const { CursorProvider } = await import('../../../cli/lib/provider/cursor-provider.js');
const { VibeProvider } = await import('../../../cli/lib/provider/vibe-provider.js');
const { execa } = await import('execa');

afterEach(() => {
  vi.restoreAllMocks();
});

describe.each([
  ['claude', () => new ClaudeProvider(), 'claude'],
  ['codex', () => new CodexProvider(), 'codex'],
  ['opencode', () => new OpenCodeProvider(), 'opencode'],
  ['vibe', () => new VibeProvider(), 'vibe'],
])('%s provider execute/sendMessage', (_label, factory, binary) => {
  it('execute() returns success result on resolved execa call', async () => {
    execa.mockResolvedValue({ stdout: 'ok', stderr: '', exitCode: 0 });
    const provider = factory();

    const result = await provider.execute('version', []);

    expect(execa).toHaveBeenCalledWith(binary, expect.any(Array), expect.any(Object));
    expect(result).toEqual({ success: true, stdout: 'ok', stderr: '', exitCode: 0 });
  });

  it('execute() returns failure result on rejected execa call', async () => {
    execa.mockRejectedValue(Object.assign(new Error('boom'), { stdout: '', stderr: 'boom', exitCode: 1 }));
    const provider = factory();

    const result = await provider.execute('version', []);

    expect(result).toEqual({ success: false, stdout: '', stderr: 'boom', exitCode: 1 });
  });

  it('sendMessage() returns stdout on success', async () => {
    execa.mockResolvedValue({ stdout: 'response text', stderr: '', exitCode: 0 });
    const provider = factory();

    await expect(provider.sendMessage('hello')).resolves.toBe('response text');
  });

  it('sendMessage() throws when execute() fails', async () => {
    execa.mockRejectedValue(Object.assign(new Error('boom'), { stdout: '', stderr: 'boom', exitCode: 1 }));
    const provider = factory();

    await expect(provider.sendMessage('hello')).rejects.toThrow('boom');
  });

  it('mapCommand() maps "version" to --version', () => {
    const provider = factory();
    expect(provider.mapCommand('version', [])).toEqual(['--version']);
  });

  it('mapCommand() falls through unknown commands', () => {
    const provider = factory();
    expect(provider.mapCommand('some-unknown-command', ['a'])).toEqual(
      expect.arrayContaining(['a']),
    );
  });
});

describe('Cursor provider (limited CLI, VSCode-based)', () => {
  it('execute() returns success result on resolved execa call', async () => {
    execa.mockResolvedValue({ stdout: 'ok', stderr: '', exitCode: 0 });
    const provider = new CursorProvider();

    const result = await provider.execute('version', []);

    expect(execa).toHaveBeenCalledWith('cursor', expect.any(Array), expect.any(Object));
    expect(result).toEqual({ success: true, stdout: 'ok', stderr: '', exitCode: 0 });
  });

  it('execute() returns a helpful failure message when cursor CLI is unavailable', async () => {
    execa.mockRejectedValue(new Error('not found'));
    const provider = new CursorProvider();

    const result = await provider.execute('version', []);

    expect(result.success).toBe(false);
    expect(result.stderr).toContain('VSCode extension');
  });

  it('sendMessage() always throws (no CLI messaging support)', async () => {
    const provider = new CursorProvider();
    await expect(provider.sendMessage('hello')).rejects.toThrow('VSCode extension');
  });

  it('mapCommand() maps "version" to --version and falls through otherwise', () => {
    const provider = new CursorProvider();
    expect(provider.mapCommand('version', [])).toEqual(['--version']);
    expect(provider.mapCommand('some-unknown-command', ['a'])).toEqual(['some-unknown-command', 'a']);
  });
});
