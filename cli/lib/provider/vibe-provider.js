/**
 * AI Craft - Vibe Provider
 * Implementation for Mistral AI's Vibe
 * 
 * This file is part of AI Craft (formerly Claude Craft)
 * Multi-AI Development Framework
 * 
 * @module provider/vibe-provider
 */

import { BaseProvider } from './base-provider.js';
import { execa } from 'execa';

/**
 * Vibe Provider - Mistral AI
 * 
 * Supports:
 * - Vibe CLI (https://vibe.mistral.ai)
 * - Mistral API (https://mistral.ai)
 * - MCP servers
 * - Sub-agents via context forking
 */
export class VibeProvider extends BaseProvider {
  constructor() {
    super();
    
    this.name = 'vibe';
    this.displayName = 'Vibe (Mistral AI)';
    this.mcpSupported = true;
    this.hooksSupported = true;
    this.subAgentsSupported = true;
    this.forkSupported = true;
    
    this.supportedModels = [
      'mistral-large-3.5',
      'mistral-large-2',
      'mistral-medium-3.5',
      'mistral-medium-2',
      'mistral-small-3.5',
      'mistral-small-2',
      'mistral-tiny-2',
      'codestral-latest',
      'codestral-24',
    ];
    
    this.defaultModel = 'mistral-large-3.5';
    
    // Model aliases for compatibility
    this.modelAliases = {
      'opus': 'mistral-large-3.5',
      'opus-4.8': 'mistral-large-3.5',
      'sonnet': 'mistral-medium-3.5',
      'sonnet-5': 'mistral-medium-3.5',
      'haiku': 'mistral-small-3.5',
      'haiku-4.5': 'mistral-small-3.5',
    };
  }

  /**
   * Execute a command with Vibe
   */
  async execute(command, args = [], options = {}) {
    const vibeArgs = this.mapCommand(command, args);
    
    // Merge options with defaults
    const execOptions = {
      preferLocal: true,
      localDir: process.cwd(),
      reject: false,
      ...options,
    };
    
    // Set environment variables if provided
    if (process.env.MISTRAL_API_KEY) {
      execOptions.env = {
        ...execOptions.env,
        MISTRAL_API_KEY: process.env.MISTRAL_API_KEY,
      };
    }
    
    try {
      const result = await execa('vibe', vibeArgs, execOptions);
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
   * Send a message to Vibe
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
      args.push('--system-prompt', options.systemPrompt);
    }
    
    // Add the prompt
    args.push('--prompt', prompt);
    
    // Execute
    const result = await this.execute('run', args, options);
    
    if (!result.success) {
      throw new Error(`Vibe error: ${result.stderr}`);
    }
    
    return result.stdout;
  }

  /**
   * Spawn a sub-agent with Vibe
   */
  async spawnSubAgent(prompt, options = {}) {
    // Vibe supports sub-agents via the --task flag with --loop
    const args = ['--task', prompt, '--loop'];
    
    // Add sub-agent specific options
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
   * Get MCP server configurations for Vibe
   */
  getMCPServers() {
    return {
      filesystem: {
        command: 'npx',
        args: ['-y', '@modelcontextprotocol/server-filesystem'],
        env: {
          MCP_LOG_LEVEL: 'warn',
        },
      },
      git: {
        command: 'npx',
        args: ['-y', '@modelcontextprotocol/server-git'],
      },
      process: {
        command: 'npx',
        args: ['-y', '@modelcontextprotocol/server-process'],
      },
    };
  }

  /**
   * Map generic commands to Vibe-specific commands
   */
  mapCommand(command, args) {
    const commandMap = {
      'version': ['--version'],
      'run': ['--prompt', args.join(' ')],
      'ralph': ['--task', args[0], '--loop'],
      'audit': ['--system-prompt', '.ai-craft/AI-CRAFT.md', '--prompt', 'Run a full project audit'],
      'install': ['--system-prompt', '.ai-craft/AI-CRAFT.md'],
    };
    
    if (commandMap[command]) {
      return commandMap[command];
    }
    
    // Default: pass through
    return [command, ...args];
  }

  /**
   * Check if Vibe is available
   */
  async isAvailable() {
    try {
      await execa('vibe', ['--version']);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get Vibe version
   */
  async getVersion() {
    try {
      const result = await execa('vibe', ['--version']);
      return result.stdout.trim();
    } catch {
      return 'unknown';
    }
  }

  /**
   * Validate Vibe configuration
   */
  validateConfig(config) {
    if (!super.validateConfig(config)) {
      return false;
    }
    
    // Check for API key if not using local Vibe
    if (!config.local && !process.env.MISTRAL_API_KEY) {
      console.warn('⚠️ Warning: MISTRAL_API_KEY environment variable not set');
    }
    
    return true;
  }

  /**
   * Get Vibe-specific environment variables
   */
  getEnvVars() {
    return {
      MISTRAL_API_KEY: process.env.MISTRAL_API_KEY,
      VIBE_PROVIDER: process.env.VIBE_PROVIDER || 'mistral',
      VIBE_MODEL: process.env.VIBE_MODEL || this.defaultModel,
    };
  }
}
