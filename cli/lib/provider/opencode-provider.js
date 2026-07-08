/**
 * AI Craft - OpenCode Provider
 * Implementation for OpenCode (Self-Hosted)
 *
 * This file is part of AI Craft (formerly Claude Craft)
 * Multi-AI Development Framework
 *
 * @module provider/opencode-provider
 */

import { BaseProvider } from './base-provider.js';
import { execa } from 'execa';

/**
 * OpenCode Provider - Self-Hosted AI
 *
 * Supports:
 * - OpenCode CLI (https://github.com/create-open-code/open-code)
 * - Any self-hosted LLM (Llama, Mistral, Phi, etc.)
 * - Full MCP support
 * - Complete data privacy
 */
export class OpenCodeProvider extends BaseProvider {
  constructor() {
    super();

    this.name = 'opencode';
    this.displayName = 'OpenCode (Self-Hosted)';
    this.mcpSupported = true;
    this.hooksSupported = true;
    this.subAgentsSupported = true;
    this.forkSupported = true;

    // OpenCode supports any model via the endpoint
    this.supportedModels = [
      'llama-3.2-90b',
      'llama-3.2-70b',
      'llama-3.2-11b',
      'llama-3.1-405b',
      'llama-3.1-70b',
      'llama-3.1-8b',
      'mistral-large-2',
      'mistral-medium-2',
      'mistral-small-2',
      'mixtral-8x22b',
      'mixtral-8x7b',
      'phi-4',
      'phi-3.5',
      'qwen2-72b',
      'qwen2-7b',
      'gemma-2-27b',
      'gemma-2-9b',
      'deepseek-llm-67b',
      'deepseek-coder-33b',
    ];

    this.defaultModel = 'llama-3.2-90b';
    this.binaryName = 'opencode';

    // Model aliases for compatibility
    this.modelAliases = {
      opus: 'llama-3.2-90b',
      'opus-4.8': 'llama-3.2-90b',
      sonnet: 'llama-3.2-70b',
      'sonnet-5': 'llama-3.2-70b',
      haiku: 'llama-3.2-11b',
      'haiku-4.5': 'llama-3.2-11b',
    };
  }

  /**
   * Execute a command with OpenCode
   */
  async execute(command, args = [], options = {}) {
    const opencodeArgs = this.mapCommand(command, args);

    // OpenCode uses environment variables for configuration
    const execOptions = {
      preferLocal: true,
      localDir: process.cwd(),
      reject: false,
      env: {
        ...process.env,
        OPENCODE_ENDPOINT: process.env.OPENCODE_ENDPOINT || process.env.OPENAI_API_BASE_URL,
        OPENCODE_API_KEY: process.env.OPENCODE_API_KEY || process.env.OPENAI_API_KEY,
        OPENCODE_MODEL: process.env.OPENCODE_MODEL || this.defaultModel,
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

    // Check for endpoint
    if (!process.env.OPENCODE_ENDPOINT && !process.env.OPENAI_API_BASE_URL) {
      console.warn('⚠️ Warning: OPENCODE_ENDPOINT environment variable not set');
      console.warn('   OpenCode requires a running LLM server endpoint');
    }

    return true;
  }

  /**
   * Get OpenCode-specific environment variables
   */
  getEnvVars() {
    return {
      OPENCODE_ENDPOINT: process.env.OPENCODE_ENDPOINT || process.env.OPENAI_API_BASE_URL,
      OPENCODE_API_KEY: process.env.OPENCODE_API_KEY || process.env.OPENAI_API_KEY,
      OPENCODE_MODEL: process.env.OPENCODE_MODEL || this.defaultModel,
    };
  }

  /**
   * Get OpenCode health status
   */
  async getHealth() {
    const endpoint = process.env.OPENCODE_ENDPOINT || process.env.OPENAI_API_BASE_URL;
    if (!endpoint) {
      return { healthy: false, message: 'No endpoint configured' };
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
