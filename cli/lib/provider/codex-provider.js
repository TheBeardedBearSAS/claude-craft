/**
 * AI Craft - Codex Provider
 * Implementation for Google's Codex
 *
 * This file is part of AI Craft (formerly Claude Craft)
 * Multi-AI Development Framework
 *
 * @module provider/codex-provider
 */

import { BaseProvider } from './base-provider.js';
import { execa } from 'execa';

/**
 * Codex Provider - Google
 *
 * Supports:
 * - Codex CLI (https://github.com/google-github/codex-cli)
 * - Google Cloud AI API
 * - GitHub integration
 */
export class CodexProvider extends BaseProvider {
  constructor() {
    super();

    this.name = 'codex';
    this.displayName = 'Codex (Google)';
    this.mcpSupported = false; // Codex has limited MCP support
    this.hooksSupported = true; // Via GitHub hooks
    this.subAgentsSupported = true;
    this.forkSupported = false; // Codex doesn't support forking in the same way

    this.supportedModels = [
      'codex-pro',
      'codex-plus',
      'codex',
      'codex-text',
      'gemini-1.5-pro',
      'gemini-1.5-flash',
      'gemini-2.0-pro',
      'gemini-2.0-flash',
    ];

    this.defaultModel = 'codex-pro';
    this.binaryName = 'codex';

    // Model aliases for compatibility
    this.modelAliases = {
      opus: 'codex-pro',
      'opus-4.8': 'codex-pro',
      sonnet: 'codex-plus',
      'sonnet-5': 'codex-plus',
      haiku: 'codex',
      'haiku-4.5': 'codex',
    };
  }

  /**
   * Execute a command with Codex
   */
  async execute(command, args = [], options = {}) {
    const codexArgs = this.mapCommand(command, args);

    // Codex requires API key
    const execOptions = {
      preferLocal: true,
      localDir: process.cwd(),
      reject: false,
      env: {
        ...process.env,
        CODEX_API_KEY: process.env.CODEX_API_KEY || process.env.GOOGLE_API_KEY,
      },
      ...options,
    };

    try {
      const result = await execa('codex', codexArgs, execOptions);
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
   * Send a message to Codex
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

    // Codex uses --prompt or just the text
    args.push(prompt);

    // Execute
    const result = await this.execute('chat', args, options);

    if (!result.success) {
      throw new Error(`Codex error: ${result.stderr}`);
    }

    return result.stdout;
  }

  /**
   * Spawn a sub-agent with Codex
   * Note: Codex doesn't support forking in the same way as Claude Code
   * We simulate it by spawning a new Codex session
   */
  async spawnSubAgent(prompt, options = {}) {
    // Codex doesn't have native sub-agent support
    // We can simulate it by creating a new session with context
    const args = ['--system', '.ai-craft/AI-CRAFT.md', prompt];

    if (options.maxIterations) {
      // Codex doesn't have native loop, but we can simulate
      console.warn('⚠️ Codex does not support native sub-agents. Using workarounds.');
    }

    return this.execute('run', args, options);
  }

  /**
   * Get MCP server configurations for Codex
   * Note: Codex has limited MCP support
   */
  getMCPServers() {
    // Codex doesn't have native MCP support yet
    // But we can use third-party servers
    return {
      // GitHub MCP server for Codex
      github: {
        command: 'npx',
        args: ['-y', 'github-mcp-server'],
      },
    };
  }

  /**
   * Map generic commands to Codex-specific commands
   */
  mapCommand(command, args) {
    const commandMap = {
      version: ['--version'],
      // Pass structured args through as-is: spawnSubAgent() already builds
      // discrete flags (--system, ...); flattening them into one string would
      // break the real CLI invocation (SEC-04).
      run: args,
      chat: [], // Default command
      audit: ['--system', '.ai-craft/AI-CRAFT.md', 'Run a full project audit'],
      install: ['--system', '.ai-craft/AI-CRAFT.md'],
    };

    if (commandMap[command]) {
      // For commands with no args, just return the command
      if (commandMap[command].length === 0) {
        return [command, ...args];
      }
      return commandMap[command];
    }

    // Default: use 'chat' command
    return ['chat', ...args];
  }

  /**
   * Validate Codex configuration
   */
  validateConfig(config) {
    if (!super.validateConfig(config)) {
      return false;
    }

    // Check for API key
    if (!process.env.CODEX_API_KEY && !process.env.GOOGLE_API_KEY) {
      console.warn('⚠️ Warning: CODEX_API_KEY or GOOGLE_API_KEY environment variable not set');
    }

    return true;
  }

  /**
   * Get Codex-specific environment variables
   */
  getEnvVars() {
    return {
      CODEX_API_KEY: process.env.CODEX_API_KEY,
      GOOGLE_API_KEY: process.env.GOOGLE_API_KEY,
      CODEX_MODEL: process.env.CODEX_MODEL || this.defaultModel,
    };
  }
}
