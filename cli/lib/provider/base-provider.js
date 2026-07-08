/**
 * AI Craft - Base Provider Class
 * Abstract base class for all AI providers
 * 
 * This file is part of AI Craft (formerly Claude Craft)
 * Multi-AI Development Framework
 * 
 * @module provider/base-provider
 */

/**
 * Base class for all AI providers
 * Each provider (Vibe, Codex, OpenCode, Claude, etc.) must extend this class
 */
export class BaseProvider {
  constructor() {
    /** @type {string} */
    this.name = 'base';
    
    /** @type {string} */
    this.displayName = 'Base Provider';
    
    /** @type {boolean} */
    this.mcpSupported = false;
    
    /** @type {boolean} */
    this.hooksSupported = false;
    
    /** @type {boolean} */
    this.subAgentsSupported = false;
    
    /** @type {boolean} */
    this.forkSupported = false;
    
    /** @type {string[]} */
    this.supportedModels = [];
    
    /** @type {string} */
    this.defaultModel = '';
  }

  /**
   * Execute a command with this provider
   * @param {string} command - The command to execute
   * @param {string[]} args - Command arguments
   * @param {Object} options - Execution options
   * @returns {Promise<Object>} - Execution result
   */
  async execute(command, args = [], options = {}) {
    throw new Error(`Method 'execute' must be implemented by ${this.constructor.name}`);
  }

  /**
   * Send a message/prompt to the AI
   * @param {string} prompt - The user prompt
   * @param {Object} options - Message options
   * @returns {Promise<string>} - AI response
   */
  async sendMessage(prompt, options = {}) {
    throw new Error(`Method 'sendMessage' must be implemented by ${this.constructor.name}`);
  }

  /**
   * Spawn a sub-agent with isolated context
   * @param {string} prompt - The sub-agent's task
   * @param {Object} options - Sub-agent options
   * @returns {Promise<Object>} - Sub-agent result
   */
  async spawnSubAgent(prompt, options = {}) {
    throw new Error(`Method 'spawnSubAgent' must be implemented by ${this.constructor.name}`);
  }

  /**
   * Get MCP server configurations for this provider
   * @returns {Object} - MCP server configurations
   */
  getMCPServers() {
    return {};
  }

  /**
   * Get default configuration for this provider
   * @returns {Object} - Default configuration
   */
  getDefaultConfig() {
    return {
      model: this.defaultModel,
      timeout: 3600,
      temperature: 0.7,
      max_tokens: 128000,
    };
  }

  /**
   * Validate provider configuration
   * @param {Object} config - Configuration to validate
   * @returns {boolean} - Whether configuration is valid
   */
  validateConfig(config) {
    if (!config) return false;
    if (config.model && !this.supportedModels.includes(config.model)) {
      return false;
    }
    return true;
  }

  /**
   * Map a generic command to provider-specific format
   * @param {string} command - Generic command
   * @param {string[]} args - Command arguments
   * @returns {string[]} - Provider-specific command
   */
  mapCommand(command, args) {
    return [command, ...args];
  }

  /**
   * Check if this provider is available in the current environment
   * @returns {Promise<boolean>} - Whether provider is available
   */
  async isAvailable() {
    return false;
  }

  /**
   * Get provider version
   * @returns {Promise<string>} - Provider version
   */
  async getVersion() {
    return 'unknown';
  }
}
