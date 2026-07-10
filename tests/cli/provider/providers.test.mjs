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
    expect(provider.mapCommand('some-unknown-command', ['a'])).toEqual(expect.arrayContaining(['a']));
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

describe('Claude provider extras', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('spawnSubAgent() forks with the prompt via the "task" command', async () => {
    execa.mockResolvedValue({ stdout: 'sub-agent output', stderr: '', exitCode: 0 });
    const provider = new ClaudeProvider();

    const result = await provider.spawnSubAgent('do the thing');

    // spawnSubAgent builds [prompt]; execute('task', args) then maps via
    // commandMap.task = ['--fork', ...args], adding the single '--fork' flag.
    expect(execa).toHaveBeenCalledWith('claude', ['--fork', 'do the thing'], expect.any(Object));
    expect(result).toEqual({ success: true, stdout: 'sub-agent output', stderr: '', exitCode: 0 });
  });

  it('spawnSubAgent() warns when maxIterations/timeout options are provided', async () => {
    execa.mockResolvedValue({ stdout: '', stderr: '', exitCode: 0 });
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const provider = new ClaudeProvider();

    await provider.spawnSubAgent('task', { maxIterations: 5, timeout: 60 });

    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('does not support direct iteration limits'));
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('timeout is configured via settings.json'));
  });

  it('sendMessage() warns when a non-default model is requested', async () => {
    execa.mockResolvedValue({ stdout: 'ok', stderr: '', exitCode: 0 });
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const provider = new ClaudeProvider();

    await provider.sendMessage('hi', { model: 'opus-4.8' });

    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('settings.json, not CLI arguments'));
  });

  it('getMCPServers() returns the built-in MCP server catalog', () => {
    const provider = new ClaudeProvider();
    const servers = provider.getMCPServers();

    expect(Object.keys(servers)).toEqual(['filesystem', 'git', 'process', 'browser']);
    expect(servers.filesystem).toEqual({ command: 'npx', args: ['-y', '@modelcontextprotocol/server-filesystem'] });
  });

  it('validateConfig() rejects unsupported models and null config', () => {
    const provider = new ClaudeProvider();
    expect(provider.validateConfig(null)).toBe(false);
    expect(provider.validateConfig({ model: 'not-a-real-model' })).toBe(false);
    expect(provider.validateConfig({ model: 'sonnet-5' })).toBe(true);
  });

  it('validateConfig() warns about feature version requirements but stays valid', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const provider = new ClaudeProvider();

    const result = provider.validateConfig({ features: { fork_subagents: true, mcp: true } });

    expect(result).toBe(true);
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('Fork subagents requires Claude Code v2.1.117+'));
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('MCP support requires Claude Code v2.1.97+'));
  });

  it('getEnvVars() falls back to defaults when env vars are unset', () => {
    const provider = new ClaudeProvider();
    const original = {
      CLAUDE_CODE_FORK_SUBAGENT: process.env.CLAUDE_CODE_FORK_SUBAGENT,
      ENABLE_PROMPT_CACHING_1H: process.env.ENABLE_PROMPT_CACHING_1H,
      CLAUDE_CODE_SUBAGENT_MODEL: process.env.CLAUDE_CODE_SUBAGENT_MODEL,
      FALLBACK_MODEL: process.env.FALLBACK_MODEL,
    };
    delete process.env.CLAUDE_CODE_FORK_SUBAGENT;
    delete process.env.ENABLE_PROMPT_CACHING_1H;
    delete process.env.CLAUDE_CODE_SUBAGENT_MODEL;
    delete process.env.FALLBACK_MODEL;

    try {
      expect(provider.getEnvVars()).toEqual({
        CLAUDE_CODE_FORK_SUBAGENT: '1',
        ENABLE_PROMPT_CACHING_1H: '1',
        CLAUDE_CODE_SUBAGENT_MODEL: 'sonnet',
        FALLBACK_MODEL: 'haiku',
      });
    } finally {
      Object.entries(original).forEach(([key, value]) => {
        if (value === undefined) delete process.env[key];
        else process.env[key] = value;
      });
    }
  });

  it('getSettings() returns the fixed AI Craft defaults', () => {
    const provider = new ClaudeProvider();
    expect(provider.getSettings()).toEqual({
      CLAUDE_CODE_FORK_SUBAGENT: '1',
      ENABLE_PROMPT_CACHING_1H: '1',
      CLAUDE_CODE_SUBAGENT_MODEL: 'sonnet',
      fallbackModel: 'haiku',
    });
  });
});

describe('Codex provider extras', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('spawnSubAgent() runs with the AI Craft system prompt file (SEC-04: args stay distinct)', async () => {
    execa.mockResolvedValue({ stdout: 'ok', stderr: '', exitCode: 0 });
    const provider = new CodexProvider();

    await provider.spawnSubAgent('investigate bug');

    // mapCommand('run', args) must return the structured args array as-is: each
    // flag/value arrives as its own argv element, not flattened into one string.
    expect(execa).toHaveBeenCalledWith(
      'codex',
      ['--system', '.ai-craft/AI-CRAFT.md', 'investigate bug'],
      expect.any(Object)
    );
  });

  it('spawnSubAgent() warns when maxIterations is provided', async () => {
    execa.mockResolvedValue({ stdout: '', stderr: '', exitCode: 0 });
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const provider = new CodexProvider();

    await provider.spawnSubAgent('task', { maxIterations: 3 });

    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('does not support native sub-agents'));
  });

  it('sendMessage() forwards temperature, maxTokens and systemPrompt as CLI flags', async () => {
    execa.mockResolvedValue({ stdout: 'ok', stderr: '', exitCode: 0 });
    const provider = new CodexProvider();

    await provider.sendMessage('hello', { temperature: 0.5, maxTokens: 1000, systemPrompt: 'be terse' });

    // mapCommand('chat', args) has an empty commandMap.chat entry, so it falls
    // through to ['chat', ...args] rather than transforming the args.
    expect(execa).toHaveBeenCalledWith(
      'codex',
      ['chat', '--temperature', '0.5', '--max-tokens', '1000', '--system', 'be terse', 'hello'],
      expect.any(Object)
    );
  });

  it('getMCPServers() returns the GitHub MCP server only', () => {
    const provider = new CodexProvider();
    expect(provider.getMCPServers()).toEqual({
      github: { command: 'npx', args: ['-y', 'github-mcp-server'] },
    });
  });

  it('validateConfig() warns when no API key is configured', () => {
    const originalCodex = process.env.CODEX_API_KEY;
    const originalGoogle = process.env.GOOGLE_API_KEY;
    delete process.env.CODEX_API_KEY;
    delete process.env.GOOGLE_API_KEY;
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const provider = new CodexProvider();

    try {
      expect(provider.validateConfig({})).toBe(true);
      expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('CODEX_API_KEY or GOOGLE_API_KEY'));
    } finally {
      if (originalCodex === undefined) delete process.env.CODEX_API_KEY;
      else process.env.CODEX_API_KEY = originalCodex;
      if (originalGoogle === undefined) delete process.env.GOOGLE_API_KEY;
      else process.env.GOOGLE_API_KEY = originalGoogle;
    }
  });

  it('validateConfig() rejects unsupported models', () => {
    const provider = new CodexProvider();
    expect(provider.validateConfig({ model: 'not-a-real-model' })).toBe(false);
  });

  it('getEnvVars() surfaces API keys and the resolved model', () => {
    const provider = new CodexProvider();
    const originalModel = process.env.CODEX_MODEL;
    delete process.env.CODEX_MODEL;

    try {
      const envVars = provider.getEnvVars();
      expect(envVars.CODEX_MODEL).toBe('codex-pro');
      expect(envVars).toHaveProperty('CODEX_API_KEY');
      expect(envVars).toHaveProperty('GOOGLE_API_KEY');
    } finally {
      if (originalModel === undefined) delete process.env.CODEX_MODEL;
      else process.env.CODEX_MODEL = originalModel;
    }
  });
});

describe('OpenCode provider extras', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('spawnSubAgent() maps task/iteration/timeout/dod options into --run flags', async () => {
    execa.mockResolvedValue({ stdout: 'ok', stderr: '', exitCode: 0 });
    const provider = new OpenCodeProvider();

    await provider.spawnSubAgent('investigate', { maxIterations: 4, timeout: 30, dod: 'tests pass' });

    expect(execa).toHaveBeenCalledWith(
      'opencode',
      ['--prompt', '--task investigate --max-iterations 4 --timeout 30 --dod tests pass'],
      expect.any(Object)
    );
  });

  it('sendMessage() forwards model, temperature, maxTokens and systemPrompt', async () => {
    execa.mockResolvedValue({ stdout: 'ok', stderr: '', exitCode: 0 });
    const provider = new OpenCodeProvider();

    await provider.sendMessage('hello', {
      model: 'mistral-small-2',
      temperature: 0.2,
      maxTokens: 500,
      systemPrompt: 'be concise',
    });

    // mapCommand('chat', args) for OpenCode joins all args into one string element.
    expect(execa).toHaveBeenCalledWith(
      'opencode',
      ['--model mistral-small-2 --temperature 0.2 --max-tokens 500 --system be concise hello'],
      expect.any(Object)
    );
  });

  it('getMCPServers() returns the filesystem/git/process/opencode catalog', () => {
    const provider = new OpenCodeProvider();
    const servers = provider.getMCPServers();

    expect(Object.keys(servers)).toEqual(['filesystem', 'git', 'process', 'opencode']);
    expect(servers.opencode).toEqual({ command: 'opencode', args: ['mcp-server'] });
  });

  it('validateConfig() warns when no endpoint is configured', () => {
    const originalEndpoint = process.env.OPENCODE_ENDPOINT;
    const originalBaseUrl = process.env.OPENAI_API_BASE_URL;
    delete process.env.OPENCODE_ENDPOINT;
    delete process.env.OPENAI_API_BASE_URL;
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const provider = new OpenCodeProvider();

    try {
      expect(provider.validateConfig({})).toBe(true);
      expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('OPENCODE_ENDPOINT environment variable not set'));
    } finally {
      if (originalEndpoint === undefined) delete process.env.OPENCODE_ENDPOINT;
      else process.env.OPENCODE_ENDPOINT = originalEndpoint;
      if (originalBaseUrl === undefined) delete process.env.OPENAI_API_BASE_URL;
      else process.env.OPENAI_API_BASE_URL = originalBaseUrl;
    }
  });

  it('validateConfig() rejects unsupported models', () => {
    const provider = new OpenCodeProvider();
    expect(provider.validateConfig({ model: 'not-a-real-model' })).toBe(false);
  });

  it('getEnvVars() resolves endpoint, key and model from env with fallbacks', () => {
    const provider = new OpenCodeProvider();
    const envVars = provider.getEnvVars();
    expect(envVars.OPENCODE_MODEL).toBe('llama-3.2-90b');
    expect(envVars).toHaveProperty('OPENCODE_ENDPOINT');
    expect(envVars).toHaveProperty('OPENCODE_API_KEY');
  });

  describe('getHealth()', () => {
    afterEach(() => {
      vi.restoreAllMocks();
      delete process.env.OPENCODE_ENDPOINT;
    });

    it('reports unhealthy with no endpoint configured', async () => {
      delete process.env.OPENCODE_ENDPOINT;
      delete process.env.OPENAI_API_BASE_URL;
      const provider = new OpenCodeProvider();

      await expect(provider.getHealth()).resolves.toEqual({
        healthy: false,
        message: 'No endpoint configured',
      });
    });

    it('reports healthy on a 2xx response', async () => {
      process.env.OPENCODE_ENDPOINT = 'http://localhost:8080';
      execa.mockResolvedValue({ stdout: '200' });
      const provider = new OpenCodeProvider();

      await expect(provider.getHealth()).resolves.toEqual({
        healthy: true,
        message: 'Endpoint is healthy',
      });
      expect(execa).toHaveBeenCalledWith('curl', [
        '-s',
        '-o',
        '/dev/null',
        '-w',
        '%{http_code}',
        'http://localhost:8080',
      ]);
    });

    it('reports unhealthy on a non-2xx status code', async () => {
      process.env.OPENCODE_ENDPOINT = 'http://localhost:8080';
      execa.mockResolvedValue({ stdout: '503' });
      const provider = new OpenCodeProvider();

      await expect(provider.getHealth()).resolves.toEqual({
        healthy: false,
        message: 'Endpoint returned status 503',
      });
    });

    it('reports unreachable when the curl call rejects', async () => {
      process.env.OPENCODE_ENDPOINT = 'http://localhost:8080';
      execa.mockRejectedValue(Object.assign(new Error('boom'), { stderr: 'connection refused' }));
      const provider = new OpenCodeProvider();

      await expect(provider.getHealth()).resolves.toEqual({
        healthy: false,
        message: 'Endpoint unreachable: connection refused',
      });
    });
  });
});

describe('Vibe provider extras', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('spawnSubAgent() maps task/iteration/timeout/dod options into distinct --run flags (SEC-04)', async () => {
    execa.mockResolvedValue({ stdout: 'ok', stderr: '', exitCode: 0 });
    const provider = new VibeProvider();

    await provider.spawnSubAgent('investigate', { maxIterations: 2, timeout: 15, dod: 'green CI' });

    // mapCommand('run', args) must return the structured args array as-is: each
    // flag arrives as its own argv element, not flattened into one string.
    expect(execa).toHaveBeenCalledWith(
      'vibe',
      ['--task', 'investigate', '--loop', '--max-iterations', '2', '--timeout', '15', '--dod', 'green CI'],
      expect.any(Object)
    );
  });

  it('sendMessage() forwards temperature, maxTokens and systemPrompt', async () => {
    execa.mockResolvedValue({ stdout: 'ok', stderr: '', exitCode: 0 });
    const provider = new VibeProvider();

    await provider.sendMessage('hello', { temperature: 0.9, maxTokens: 2000, systemPrompt: 'be brief' });

    // mapCommand('run', args) now passes structured args through unchanged (SEC-04).
    expect(execa).toHaveBeenCalledWith(
      'vibe',
      ['--temperature', '0.9', '--max-tokens', '2000', '--system-prompt', 'be brief', '--prompt', 'hello'],
      expect.any(Object)
    );
  });

  it('execute() forwards MISTRAL_API_KEY into the child process env when set', async () => {
    const originalKey = process.env.MISTRAL_API_KEY;
    process.env.MISTRAL_API_KEY = 'test-key-123';
    execa.mockResolvedValue({ stdout: 'ok', stderr: '', exitCode: 0 });
    const provider = new VibeProvider();

    try {
      await provider.execute('version', []);
      const callOptions = execa.mock.calls.at(-1)[2];
      expect(callOptions.env).toEqual({ MISTRAL_API_KEY: 'test-key-123' });
    } finally {
      if (originalKey === undefined) delete process.env.MISTRAL_API_KEY;
      else process.env.MISTRAL_API_KEY = originalKey;
    }
  });

  it('getMCPServers() returns filesystem (with log-level env), git and process servers', () => {
    const provider = new VibeProvider();
    const servers = provider.getMCPServers();

    expect(Object.keys(servers)).toEqual(['filesystem', 'git', 'process']);
    expect(servers.filesystem.env).toEqual({ MCP_LOG_LEVEL: 'warn' });
  });

  it('validateConfig() skips the API key warning for local configs', () => {
    const originalKey = process.env.MISTRAL_API_KEY;
    delete process.env.MISTRAL_API_KEY;
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const provider = new VibeProvider();

    try {
      expect(provider.validateConfig({ local: true })).toBe(true);
      expect(warnSpy).not.toHaveBeenCalled();
    } finally {
      if (originalKey === undefined) delete process.env.MISTRAL_API_KEY;
      else process.env.MISTRAL_API_KEY = originalKey;
    }
  });

  it('validateConfig() warns when not local and no API key is set', () => {
    const originalKey = process.env.MISTRAL_API_KEY;
    delete process.env.MISTRAL_API_KEY;
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const provider = new VibeProvider();

    try {
      expect(provider.validateConfig({ local: false })).toBe(true);
      expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('MISTRAL_API_KEY environment variable not set'));
    } finally {
      if (originalKey === undefined) delete process.env.MISTRAL_API_KEY;
      else process.env.MISTRAL_API_KEY = originalKey;
    }
  });

  it('validateConfig() rejects unsupported models', () => {
    const provider = new VibeProvider();
    expect(provider.validateConfig({ model: 'not-a-real-model' })).toBe(false);
  });

  it('getEnvVars() resolves provider/model defaults', () => {
    const provider = new VibeProvider();
    const originalProvider = process.env.VIBE_PROVIDER;
    delete process.env.VIBE_PROVIDER;

    try {
      const envVars = provider.getEnvVars();
      expect(envVars.VIBE_PROVIDER).toBe('mistral');
      expect(envVars.VIBE_MODEL).toBe('mistral-large-3.5');
      expect(envVars).toHaveProperty('MISTRAL_API_KEY');
    } finally {
      if (originalProvider === undefined) delete process.env.VIBE_PROVIDER;
      else process.env.VIBE_PROVIDER = originalProvider;
    }
  });
});

describe('Cursor provider extras', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('spawnSubAgent() always throws (no sub-agent support)', async () => {
    const provider = new CursorProvider();
    await expect(provider.spawnSubAgent('task')).rejects.toThrow('Cursor does not support sub-agents');
  });

  it('getMCPServers() documents that MCP is configured via VSCode settings', () => {
    const provider = new CursorProvider();
    expect(provider.getMCPServers()).toEqual({
      note: 'Cursor MCP servers are configured in VSCode settings.json',
    });
  });

  it('validateConfig() warns about limited CLI support but stays valid', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const provider = new CursorProvider();

    expect(provider.validateConfig({})).toBe(true);
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('primarily a VSCode extension'));
  });

  it('validateConfig() rejects unsupported models and null config', () => {
    const provider = new CursorProvider();
    expect(provider.validateConfig(null)).toBe(false);
    expect(provider.validateConfig({ model: 'not-a-real-model' })).toBe(false);
  });

  it('getVSCodeConfig() returns the settings.json fragment for the Cursor extension', () => {
    const provider = new CursorProvider();
    expect(provider.getVSCodeConfig()).toEqual({
      'cursor.rules': [{ path: '.ai-craft', prompt: '.ai-craft/AI-CRAFT.md' }],
      'cursor.agentMode': true,
      'cursor.enableCodex': true,
    });
  });

  it('getVSCodeSetupInstructions() embeds the VSCode config as JSON', () => {
    const provider = new CursorProvider();
    const instructions = provider.getVSCodeSetupInstructions();

    expect(instructions).toContain('Install the Cursor extension from the VSCode Marketplace');
    expect(instructions).toContain(JSON.stringify(provider.getVSCodeConfig(), null, 2));
  });

  describe('isAvailable()', () => {
    it('returns true when the cursor CLI itself responds', async () => {
      execa.mockResolvedValue({ stdout: 'cursor 1.0.0' });
      const provider = new CursorProvider();

      await expect(provider.isAvailable()).resolves.toBe(true);
      expect(execa).toHaveBeenCalledWith('cursor', ['--version']);
    });

    it('falls back to checking the VSCode extension list when the cursor CLI is missing', async () => {
      execa.mockImplementation((bin) => {
        if (bin === 'cursor') return Promise.reject(new Error('not found'));
        return Promise.resolve({ stdout: 'ms-python.python\ncontensis.cursor\ndbaeumer.vscode-eslint' });
      });
      const provider = new CursorProvider();

      await expect(provider.isAvailable()).resolves.toBe(true);
      expect(execa).toHaveBeenCalledWith('code', ['--list-extensions']);
    });

    it('returns false when neither cursor nor the VSCode extension are present', async () => {
      execa.mockImplementation((bin) => {
        if (bin === 'cursor') return Promise.reject(new Error('not found'));
        return Promise.resolve({ stdout: 'ms-python.python' });
      });
      const provider = new CursorProvider();

      await expect(provider.isAvailable()).resolves.toBe(false);
    });

    it('returns false when both the cursor CLI and the code CLI are unavailable', async () => {
      execa.mockRejectedValue(new Error('not found'));
      const provider = new CursorProvider();

      await expect(provider.isAvailable()).resolves.toBe(false);
    });
  });

  describe('getVersion()', () => {
    it('returns the trimmed cursor CLI version on success', async () => {
      execa.mockResolvedValue({ stdout: '  cursor 1.2.3  \n' });
      const provider = new CursorProvider();

      await expect(provider.getVersion()).resolves.toBe('cursor 1.2.3');
    });

    it('returns a VSCode-extension placeholder when the CLI is unavailable', async () => {
      execa.mockRejectedValue(new Error('not found'));
      const provider = new CursorProvider();

      await expect(provider.getVersion()).resolves.toBe('unknown (VSCode extension)');
    });
  });
});
