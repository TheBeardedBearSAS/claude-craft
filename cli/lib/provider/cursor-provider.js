/**
 * AI Craft - Cursor Provider
 * Implementation for Cursor (VSCode)
 *
 * This file is part of AI Craft (formerly Claude Craft)
 * Multi-AI Development Framework
 *
 * @module provider/cursor-provider
 */

import { BaseProvider } from './base-provider.js';
import { execa } from 'execa';

/**
 * Cursor Provider - CLI Integration
 *
 * Note (CONC-03, verified 2026-07): the Cursor CLI (`cursor-agent`/`agent`,
 * see cursor.com/docs/cli/overview) is a full standalone headless terminal
 * agent since 2026 - not merely a VSCode extension. It is scriptable in CI/SSH
 * via `-p`/`--output-format` non-interactive mode and has a Plan mode.
 *
 * Supports:
 * - Cursor CLI (if available)
 * - Native MCP servers (cursor.com/docs/cli/mcp: `agent mcp`, shared mcp.json)
 * - Hooks via .cursor/hooks.json, though CLI event coverage is narrower than
 *   the IDE's (community reports confirm at least beforeShellExecution/
 *   afterShellExecution fire from the CLI - cursor.com/docs/hooks)
 * - Subagents ("You can use subagents in the editor, CLI, and Cloud Agents" -
 *   cursor.com/docs/subagents)
 * - No dedicated --fork flag is documented for the CLI (closest analogues are
 *   `-w/--worktree` and the `&` Cloud Agent handoff, not a literal fork)
 */
export class CursorProvider extends BaseProvider {
  constructor() {
    super();

    this.name = 'cursor';
    this.displayName = 'Cursor (VSCode)';
    this.mcpSupported = true; // Native MCP support via `agent mcp` / mcp.json
    this.hooksSupported = true; // .cursor/hooks.json, partial event coverage vs the IDE
    this.subAgentsSupported = true; // Documented CLI subagent support
    this.forkSupported = false; // No documented --fork mechanism in the CLI

    // Cursor supports various underlying models
    this.supportedModels = [
      'gpt-4o',
      'gpt-4o-mini',
      'gpt-4',
      'gpt-3.5-turbo',
      'claude-3-5-sonnet',
      'claude-3-haiku',
      'claude-3-opus',
      'llama-3.1-70b',
      'llama-3.1-8b',
      'mistral-large',
      'gemini-1.5-pro',
    ];

    this.defaultModel = 'gpt-4o';

    // Model aliases
    this.modelAliases = {
      opus: 'claude-3-5-sonnet',
      'opus-4.8': 'claude-3-5-sonnet',
      sonnet: 'gpt-4o',
      'sonnet-5': 'gpt-4o',
      haiku: 'gpt-4o-mini',
      'haiku-4.5': 'gpt-4o-mini',
    };
  }

  /**
   * Execute a command with Cursor
   * Note: Cursor is primarily VSCode-based, so CLI support is limited
   */
  async execute(command, args = [], options = {}) {
    // Cursor doesn't have a full CLI like other providers
    // We'll try to use the cursor command if available
    try {
      const cursorArgs = this.mapCommand(command, args);
      const execOptions = {
        preferLocal: true,
        localDir: process.cwd(),
        reject: false,
        ...options,
      };

      const result = await execa('cursor', cursorArgs, execOptions);
      return {
        success: true,
        stdout: result.stdout,
        stderr: result.stderr,
        exitCode: result.exitCode,
      };
    } catch (error) {
      // If cursor CLI is not available, return a helpful message
      return {
        success: false,
        stdout: '',
        stderr: 'Cursor is primarily a VSCode extension. Please use Cursor within VSCode for full functionality.',
        exitCode: 1,
      };
    }
  }

  /**
   * Send a message via Cursor
   * Note: This would typically be done through VSCode
   */
  async sendMessage(prompt, options = {}) {
    // Cursor doesn't have a direct CLI for messaging
    // This would be done through the VSCode extension
    throw new Error('Cursor messaging is only available through the VSCode extension. Please use Cursor in VSCode.');
  }

  /**
   * Spawn a sub-agent with Cursor
   * Note: Not supported in Cursor
   */
  async spawnSubAgent(prompt, options = {}) {
    throw new Error('Cursor does not support sub-agents. Please use a different provider for this feature.');
  }

  /**
   * Get MCP server configurations for Cursor
   * Note: Cursor has limited MCP support
   */
  getMCPServers() {
    // Cursor can use MCP servers through VSCode extensions
    return {
      // These would be configured in VSCode settings
      note: 'Cursor MCP servers are configured in VSCode settings.json',
    };
  }

  /**
   * Map generic commands to Cursor-specific commands
   */
  mapCommand(command, args) {
    // Cursor doesn't have a standard CLI interface
    // Most commands would be executed through VSCode
    const commandMap = {
      version: ['--version'],
      chat: [args.join(' ')],
    };

    if (commandMap[command]) {
      return commandMap[command];
    }

    // Default: return as-is (will likely fail)
    return [command, ...args];
  }

  /**
   * Check if Cursor is available
   *
   * Note (FONC-05): there is no verified, stable VSCode extension id for
   * Cursor to fall back on - Cursor is a standalone fork of VS Code, not
   * distributed as a VS Code extension (cursor.com/docs/cli/overview) - so
   * this only probes the `cursor` CLI binary.
   */
  async isAvailable() {
    try {
      await execa('cursor', ['--version']);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get Cursor version
   */
  async getVersion() {
    try {
      const result = await execa('cursor', ['--version']);
      return result.stdout.trim();
    } catch {
      return 'unknown (VSCode extension)';
    }
  }

  /**
   * Validate Cursor configuration
   */
  validateConfig(config) {
    if (!super.validateConfig(config)) {
      return false;
    }

    console.warn('⚠️ Cursor is primarily a VSCode extension. CLI support is limited.');
    console.warn('   For full functionality, use Cursor within VSCode.');

    return true;
  }

  /**
   * Get Cursor-specific configuration
   */
  getVSCodeConfig() {
    // Configuration that would go in VSCode settings.json
    return {
      'cursor.rules': [
        {
          path: '.ai-craft',
          prompt: '.ai-craft/AI-CRAFT.md',
        },
      ],
      'cursor.agentMode': true,
      'cursor.enableCodex': true,
    };
  }

  /**
   * Get instructions for VSCode setup
   */
  getVSCodeSetupInstructions() {
    return `
To use AI Craft with Cursor in VSCode:

1. Install the Cursor extension from the VSCode Marketplace
2. Open your project in VSCode with Cursor
3. Add the following to your VSCode settings.json:

${JSON.stringify(this.getVSCodeConfig(), null, 2)}

4. Restart VSCode

AI Craft commands will now be available through the Cursor chat interface.
`.trim();
  }
}
