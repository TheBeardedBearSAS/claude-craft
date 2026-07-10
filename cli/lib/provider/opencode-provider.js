/**
 * AI Craft - OpenCode Provider
 * Implementation for OpenCode (sst/opencode's terminal AI coding agent)
 *
 * This file is part of AI Craft (formerly Claude Craft)
 * Multi-AI Development Framework
 *
 * @module provider/opencode-provider
 */

import { BaseProvider } from './base-provider.js';
import { execa } from 'execa';

/**
 * OpenCode Provider
 *
 * OpenCode (https://github.com/sst/opencode, opencode.ai) is an open-source
 * terminal AI coding agent, NOT a self-hosted-only tool (CONC-02). It connects
 * to 75+ cloud model providers (Anthropic, OpenAI, Google, DeepSeek, Qwen, ...)
 * via the Vercel AI SDK / Models.dev registry, resolving credentials through
 * `opencode auth login`, `opencode.json`, or plain provider API key env vars
 * (ANTHROPIC_API_KEY, OPENAI_API_KEY, ...). Pointing at a self-hosted or
 * OpenAI-compatible server (`opencode run --attach <url>`) is one optional
 * deployment mode among many, not a requirement.
 *
 * Supports:
 * - OpenCode CLI (`opencode` binary)
 * - 75+ cloud model providers via Models.dev, plus optional self-hosted servers
 * - Full MCP support
 */
export class OpenCodeProvider extends BaseProvider {
  constructor() {
    super();

    this.name = 'opencode';
    this.displayName = 'OpenCode (sst/opencode)';
    this.mcpSupported = true;
    this.hooksSupported = true;
    this.subAgentsSupported = true;
    this.forkSupported = true;

    // Real OpenCode model identifiers are provider-qualified ("<provider>/<model>",
    // Models.dev registry format) — this is a representative sample, not the
    // full 75+ provider catalog OpenCode itself resolves at runtime.
    this.supportedModels = [
      'anthropic/claude-sonnet-4-20250514',
      'openai/gpt-5',
      'openai/gpt-4o',
      'google/gemini-2.5-pro',
      'deepseek/deepseek-v4-pro',
      'qwen/qwen3-coder-480b',
    ];

    this.defaultModel = 'anthropic/claude-sonnet-4-20250514';
    this.binaryName = 'opencode';

    // No aliases needed - OpenCode already exposes provider-qualified model ids
    this.modelAliases = {};
  }

  /**
   * Execute a command with OpenCode
   */
  async execute(command, args = [], options = {}) {
    const opencodeArgs = this.mapCommand(command, args);

    // OpenCode resolves provider credentials itself (`opencode auth login`,
    // opencode.json, or provider env vars); we just forward the common ones
    // plus the resolved model, and OPENCODE_ENDPOINT for users who explicitly
    // opted into a self-hosted/OpenAI-compatible server.
    const execOptions = {
      preferLocal: true,
      localDir: process.cwd(),
      reject: false,
      env: {
        ...process.env,
        ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
        OPENAI_API_KEY: process.env.OPENAI_API_KEY,
        GOOGLE_API_KEY: process.env.GOOGLE_API_KEY,
        OPENCODE_MODEL: process.env.OPENCODE_MODEL || this.defaultModel,
        OPENCODE_ENDPOINT: process.env.OPENCODE_ENDPOINT,
      },
      ...options,
    };

    try {
      const result = await execa('opencode', opencodeArgs, execOptions);
      return {
        success: true,
        stdout: result.stdout,
        stderr: result.stderr,
        exitCode: result.exitCode,
      };
    } catch (error) {
      return {
        success: false,
        stdout: error.stdout || '',
        stderr: error.stderr || error.message,
        exitCode: error.exitCode || 1,
      };
    }
  }

  /**
   * Send a message to OpenCode
   */
  async sendMessage(prompt, options = {}) {
    const args = [];

    // Add model if specified
    const model = options.model || this.defaultModel;
    if (model !== this.defaultModel) {
      args.push('--model', model);
    }

    // Add temperature if specified
    if (options.temperature) {
      args.push('--temperature', String(options.temperature));
    }

    // Add max tokens if specified
    if (options.maxTokens) {
      args.push('--max-tokens', String(options.maxTokens));
    }

    // Add system prompt if specified
    if (options.systemPrompt) {
      args.push('--system', options.systemPrompt);
    }

    // OpenCode uses the prompt directly
    args.push(prompt);

    // Execute
    const result = await this.execute('chat', args, options);

    if (!result.success) {
      throw new Error(`OpenCode error: ${result.stderr}`);
    }

    return result.stdout;
  }

  /**
   * Spawn a sub-agent with OpenCode
   */
  async spawnSubAgent(prompt, options = {}) {
    // OpenCode supports sub-agents via the --task flag
    const args = ['--task', prompt];

    if (options.maxIterations) {
      args.push('--max-iterations', String(options.maxIterations));
    }

    if (options.timeout) {
      args.push('--timeout', String(options.timeout));
    }

    if (options.dod) {
      args.push('--dod', options.dod);
    }

    return this.execute('run', args, options);
  }

  /**
   * Get MCP server configurations for OpenCode
   */
  getMCPServers() {
    return {
      filesystem: {
        command: 'npx',
        args: ['-y', '@modelcontextprotocol/server-filesystem'],
      },
      git: {
        command: 'npx',
        args: ['-y', '@modelcontextprotocol/server-git'],
      },
      process: {
        command: 'npx',
        args: ['-y', '@modelcontextprotocol/server-process'],
      },
      // OpenCode-specific servers
      opencode: {
        command: 'opencode',
        args: ['mcp-server'],
      },
    };
  }

  /**
   * Map generic commands to OpenCode-specific commands
   */
  mapCommand(command, args) {
    const commandMap = {
      version: ['--version'],
      run: ['--prompt', args.join(' ')],
      chat: [args.join(' ')],
      audit: ['--system', '.ai-craft/AI-CRAFT.md', 'Run a full project audit'],
      install: ['--system', '.ai-craft/AI-CRAFT.md'],
      ralph: ['--task', args[0], '--loop'],
    };

    if (commandMap[command]) {
      return commandMap[command];
    }

    // Default: pass through
    return [command, ...args];
  }

  /**
   * Validate OpenCode configuration
   */
  validateConfig(config) {
    if (!super.validateConfig(config)) {
      return false;
    }

    // OpenCode resolves credentials itself (`opencode auth login`, opencode.json,
    // or provider env vars) — none of these are required for our wrapper to run
    // the CLI. This is a soft first-run nudge, not a hard requirement.
    const hasProviderKey = ['ANTHROPIC_API_KEY', 'OPENAI_API_KEY', 'GOOGLE_API_KEY'].some((key) => process.env[key]);
    if (!hasProviderKey && !process.env.OPENCODE_ENDPOINT) {
      console.warn(
        '⚠️ Warning: no provider API key detected (e.g. ANTHROPIC_API_KEY, OPENAI_API_KEY) and OPENCODE_ENDPOINT is not set'
      );
      console.warn(
        '   Run `opencode auth login`, set a provider API key, or set OPENCODE_ENDPOINT for a self-hosted server'
      );
    }

    return true;
  }

  /**
   * Get OpenCode-specific environment variables
   */
  getEnvVars() {
    return {
      ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
      OPENAI_API_KEY: process.env.OPENAI_API_KEY,
      GOOGLE_API_KEY: process.env.GOOGLE_API_KEY,
      OPENCODE_MODEL: process.env.OPENCODE_MODEL || this.defaultModel,
      OPENCODE_ENDPOINT: process.env.OPENCODE_ENDPOINT,
    };
  }

  /**
   * Get OpenCode health status.
   * Only meaningful when the user opted into a self-hosted/OpenAI-compatible
   * endpoint via OPENCODE_ENDPOINT — OpenCode's default cloud-provider mode
   * has no local endpoint to ping.
   */
  async getHealth() {
    const endpoint = process.env.OPENCODE_ENDPOINT;
    if (!endpoint) {
      return {
        healthy: true,
        message: 'Using OpenCode-managed cloud provider routing (no self-hosted endpoint configured)',
      };
    }

    try {
      // Try to ping the endpoint
      const result = await execa('curl', ['-s', '-o', '/dev/null', '-w', '%{http_code}', endpoint]);
      const statusCode = parseInt(result.stdout.trim());

      if (statusCode >= 200 && statusCode < 300) {
        return { healthy: true, message: 'Endpoint is healthy' };
      }
      return { healthy: false, message: `Endpoint returned status ${statusCode}` };
    } catch (error) {
      return { healthy: false, message: `Endpoint unreachable: ${error.stderr}` };
    }
  }
}
