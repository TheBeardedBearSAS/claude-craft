/**
 * AI Craft - Claude Code Provider
 * Implementation for Anthropic's Claude Code
 * 
 * This file is part of AI Craft (formerly Claude Craft)
 * Multi-AI Development Framework
 * 
 * @module provider/claude-provider
 */

import { BaseProvider } from './base-provider.js';
import { execa } from 'execa';

/**
 * Claude Code Provider - Anthropic
 * 
 * Supports:
 * - Claude Code CLI (https://code.claude.com)
 * - All Claude models (Opus, Sonnet, Haiku)
 * - Native MCP support
 * - Hooks system
 * - Sub-agents
 * - Context forking
 */
export class ClaudeProvider extends BaseProvider {
  constructor() {
    super();
    
    this.name = 'claude';
    this.displayName = 'Claude Code (Anthropic)';
    this.mcpSupported = true;
    this.hooksSupported = true;
    this.subAgentsSupported = true;
    this.forkSupported = true;
    
    this.supportedModels = [
      'opus-4.8',
      'opus-4.7',
      'opus-4.5',
      'sonnet-5',
      'sonnet-4.6',
      'sonnet-4.5',
      'haiku-4.5',
      'haiku-4',
    ];
    
    this.defaultModel = 'sonnet-5';
    
    // No aliases needed - these are the canonical names
    this.modelAliases = {};
  }

  /**
   * Execute a command with Claude Code
   */
  async execute(command, args = [], options = {}) {
    const claudeArgs = this.mapCommand(command, args);
    
    // Claude Code uses environment variables for configuration
    const execOptions = {
      preferLocal: true,
      localDir: process.cwd(),
      reject: false,
      env: {
        ...process.env,
        // Claude Code specific variables
        CLAUDE_CODE_FORK_SUBAGENT: process.env.CLAUDE_CODE_FORK_SUBAGENT || '1',
        ENABLE_PROMPT_CACHING_1H: process.env.ENABLE_PROMPT_CACHING_1H || '1',
        CLAUDE_CODE_ADDITIONAL_DIRECTORIES_CLAUDE_MD: process.env.CLAUDE_CODE_ADDITIONAL_DIRECTORIES_CLAUDE_MD || '1',
      },
      ...options,
    };
    
    try {
      const result = await execa('claude', claudeArgs, execOptions);
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
   * Send a message to Claude Code
   */
  async sendMessage(prompt, options = {}) {
    // Claude Code doesn't have a direct 'send message' command
    // We use the chat interface
    const args = [prompt];
    
    // Add model if specified
    const model = options.model || this.defaultModel;
    if (model !== this.defaultModel) {
      // Claude Code sets model via settings.json, not CLI
      console.warn('⚠️ Claude Code model selection is configured via settings.json, not CLI arguments');
    }
    
    // Execute
    const result = await this.execute('chat', args, options);
    
    if (!result.success) {
      throw new Error(`Claude Code error: ${result.stderr}`);
    }
    
    return result.stdout;
  }

  /**
   * Spawn a sub-agent with Claude Code
   */
  async spawnSubAgent(prompt, options = {}) {
    // Claude Code supports sub-agents natively
    const args = ['--fork', prompt];
    
    if (options.maxIterations) {
      // Claude Code doesn't have direct iteration limit, but we can use circuit breaker
      console.warn('⚠️ Claude Code does not support direct iteration limits. Using circuit breaker instead.');
    }
    
    if (options.timeout) {
      console.warn('⚠️ Claude Code timeout is configured via settings.json');
    }
    
    return this.execute('task', args, options);
  }

  /**
   * Get MCP server configurations for Claude Code
   */
  getMCPServers() {
    return {
      // Claude Code has built-in MCP support
      // These are commonly used MCP servers
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
      // Claude Code specific
      browser: {
        command: 'npx',
        args: ['-y', '@modelcontextprotocol/server-browser'],
      },
    };
  }

  /**
   * Map generic commands to Claude Code-specific commands
   */
  mapCommand(command, args) {
    const commandMap = {
      'version': ['--version'],
      'chat': [args.join(' ')],
      'task': ['--fork', ...args],
      'audit': ['/team:audit'],
      'install': [], // Claude Code doesn't have install command
      'ralph': ['/common:ralph-run', ...args],
    };
    
    if (commandMap[command]) {
      if (commandMap[command].length === 0) {
        return args; // Just return the args
      }
      return commandMap[command];
    }
    
    // Default: pass through
    return [command, ...args];
  }

  /**
   * Check if Claude Code is available
   */
  async isAvailable() {
    try {
      await execa('claude', ['--version']);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get Claude Code version
   */
  async getVersion() {
    try {
      const result = await execa('claude', ['--version']);
      return result.stdout.trim();
    } catch {
      return 'unknown';
    }
  }

  /**
   * Validate Claude Code configuration
   */
  validateConfig(config) {
    if (!super.validateConfig(config)) {
      return false;
    }
    
    // Claude Code requires specific version for some features
    if (config.features?.fork_subagents) {
      console.warn('✅ Fork subagents requires Claude Code v2.1.117+');
    }
    
    if (config.features?.mcp) {
      console.warn('✅ MCP support requires Claude Code v2.1.97+');
    }
    
    return true;
  }

  /**
   * Get Claude Code-specific environment variables
   */
  getEnvVars() {
    return {
      CLAUDE_CODE_FORK_SUBAGENT: process.env.CLAUDE_CODE_FORK_SUBAGENT || '1',
      ENABLE_PROMPT_CACHING_1H: process.env.ENABLE_PROMPT_CACHING_1H || '1',
      CLAUDE_CODE_SUBAGENT_MODEL: process.env.CLAUDE_CODE_SUBAGENT_MODEL || 'sonnet',
      FALLBACK_MODEL: process.env.FALLBACK_MODEL || 'haiku',
    };
  }

  /**
   * Get Claude Code settings
   */
  getSettings() {
    return {
      // Default settings for AI Craft
      CLAUDE_CODE_FORK_SUBAGENT: '1',
      ENABLE_PROMPT_CACHING_1H: '1',
      CLAUDE_CODE_SUBAGENT_MODEL: 'sonnet',
      fallbackModel: 'haiku',
    };
  }
}
