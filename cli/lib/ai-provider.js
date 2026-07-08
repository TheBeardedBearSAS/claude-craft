/**
 * AI Craft - AI Provider Manager
 * Main orchestrator for multi-AI provider support
 * 
 * This file is part of AI Craft (formerly Claude Craft)
 * Multi-AI Development Framework
 * 
 * @module ai-provider
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { load as yamlLoad, dump as yamlDump } from 'js-yaml';

// Import all provider implementations
import { BaseProvider } from './provider/base-provider.js';
import { VibeProvider } from './provider/vibe-provider.js';
import { CodexProvider } from './provider/codex-provider.js';
import { OpenCodeProvider } from './provider/opencode-provider.js';
import { ClaudeProvider } from './provider/claude-provider.js';
import { CursorProvider } from './provider/cursor-provider.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * AI Provider Manager
 * 
 * Main class for managing multiple AI providers.
 * Handles:
 * - Provider detection (auto and manual)
 * - Provider initialization
 * - Command execution routing
 * - Configuration management
 * - Fallback handling
 */
export class AIProviderManager {
  constructor() {
    /** @type {Map<string, BaseProvider>} */
    this.providers = new Map();
    
    /** @type {string|null} */
    this.currentProvider = null;
    
    /** @type {Object} */
    this.config = {};
    
    /** @type {string} */
    this.configPath = path.join(process.cwd(), '.ai-craft', 'ai-craft.yaml');
    
    /** @type {string} */
    this.legacyConfigPath = path.join(process.cwd(), '.claude', 'CLAUDE.md');
    
    // Register all providers
    this.registerProvider('vibe', new VibeProvider());
    this.registerProvider('codex', new CodexProvider());
    this.registerProvider('opencode', new OpenCodeProvider());
    this.registerProvider('claude', new ClaudeProvider());
    this.registerProvider('cursor', new CursorProvider());
  }

  /**
   * Register a new provider
   * @param {string} name - Provider name
   * @param {BaseProvider} provider - Provider instance
   */
  registerProvider(name, provider) {
    this.providers.set(name, provider);
  }

  /**
   * Get a provider by name
   * @param {string} name - Provider name
   * @returns {BaseProvider|null} - Provider instance or null
   */
  getProvider(name) {
    return this.providers.get(name) || null;
  }

  /**
   * Get all registered providers
   * @returns {Map<string, BaseProvider>} - All providers
   */
  getAllProviders() {
    return this.providers;
  }

  /**
   * Get list of provider names
   * @returns {string[]} - Array of provider names
   */
  getProviderNames() {
    return Array.from(this.providers.keys());
  }

  /**
   * Load configuration from file
   * @param {string} customPath - Custom config path (optional)
   * @returns {Object} - Loaded configuration
   */
  loadConfig(customPath = null) {
    const configPath = customPath || this.configPath;
    
    try {
      if (fs.existsSync(configPath)) {
        const content = fs.readFileSync(configPath, 'utf8');
        this.config = yamlLoad(content) || {};
        return this.config;
      }
    } catch (error) {
      console.warn(`⚠️ Warning: Could not load config from ${configPath}: ${error.message}`);
    }
    
    // Return default config
    this.config = this.getDefaultConfig();
    return this.config;
  }

  /**
   * Save configuration to file
   * @param {Object} config - Configuration to save
   * @param {string} customPath - Custom config path (optional)
   */
  saveConfig(config = this.config, customPath = null) {
    const configPath = customPath || this.configPath;
    const dir = path.dirname(configPath);
    
    // Ensure directory exists
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    try {
      const yamlContent = yamlDump(config, { indent: 2 });
      fs.writeFileSync(configPath, yamlContent);
    } catch (error) {
      console.error(`❌ Error saving config to ${configPath}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get default configuration
   * @returns {Object} - Default configuration
   */
  getDefaultConfig() {
    return {
      version: '1.0.0',
      providers: {
        primary: 'claude',
        fallback: ['vibe', 'codex', 'opencode'],
      },
      memory: {
        enabled: true,
        scope: 'project',
        storage: 'file',
      },
      hooks: {
        enabled: true,
        providers: ['mcp', 'webhook', 'plugin'],
      },
      optimization: {
        prompt_caching: true,
        context_forking: true,
        model_routing: 'auto',
      },
      compatibility: {
        claude_craft: true,
        legacy_hooks: true,
      },
      security: {
        api_key_validation: true,
        hook_sandboxing: true,
        max_execution_time: 3600,
      },
    };
  }

  /**
   * Detect the current AI provider
   * 
   * Detection priority:
   * 1. Explicit configuration (ai-craft.yaml)
   * 2. Environment variables
   * 3. Installed binaries in PATH
   * 4. Default fallback (claude)
   * 
   * @param {Object} options - Detection options
   * @param {boolean} options.force - Force re-detection
   * @returns {Promise<string>} - Detected provider name
   */
  async detectProvider(options = {}) {
    const { force = false } = options;
    
    // Return cached provider if not forcing re-detection
    if (this.currentProvider && !force) {
      return this.currentProvider;
    }

    // 1. Check explicit configuration
    const config = this.loadConfig();
    if (config.providers?.primary) {
      const provider = this.getProvider(config.providers.primary);
      if (provider) {
        this.currentProvider = config.providers.primary;
        return this.currentProvider;
      }
    }

    // 2. Check environment variables
    const envProvider = this.detectFromEnvironment();
    if (envProvider) {
      this.currentProvider = envProvider;
      return this.currentProvider;
    }

    // 3. Check installed binaries
    const binaryProvider = await this.detectFromBinaries();
    if (binaryProvider) {
      this.currentProvider = binaryProvider;
      return this.currentProvider;
    }

    // 4. Default fallback
    this.currentProvider = 'claude';
    return this.currentProvider;
  }

  /**
   * Detect provider from environment variables
   * @returns {string|null} - Provider name or null
   */
  detectFromEnvironment() {
    // Vibe
    if (process.env.VIBE_PROVIDER || process.env.MISTRAL_API_KEY) {
      return 'vibe';
    }
    
    // Codex
    if (process.env.CODEX_API_KEY || process.env.GOOGLE_API_KEY) {
      return 'codex';
    }
    
    // OpenCode
    if (process.env.OPENCODE_ENDPOINT || process.env.OPENAI_API_BASE_URL) {
      return 'opencode';
    }
    
    // Cursor
    if (process.env.CURSOR_API_KEY) {
      return 'cursor';
    }
    
    return null;
  }

  /**
   * Detect provider from installed binaries
   * @returns {Promise<string|null>} - Provider name or null
   */
  async detectFromBinaries() {
    const providersToCheck = ['vibe', 'codex', 'opencode', 'claude', 'cursor'];
    
    for (const providerName of providersToCheck) {
      const provider = this.getProvider(providerName);
      if (provider && await provider.isAvailable()) {
        return providerName;
      }
    }
    
    return null;
  }

  /**
   * Set the current provider explicitly
   * @param {string} providerName - Provider name to use
   * @throws {Error} - If provider is not registered
   */
  setProvider(providerName) {
    const provider = this.getProvider(providerName);
    if (!provider) {
      throw new Error(`❌ Provider '${providerName}' is not registered. Available providers: ${this.getProviderNames().join(', ')}`);
    }
    
    this.currentProvider = providerName;
    
    // Update config
    this.config.providers = this.config.providers || {};
    this.config.providers.primary = providerName;
  }

  /**
   * Execute a command with the current provider
   * @param {string} command - Command to execute
   * @param {string[]} args - Command arguments
   * @param {Object} options - Execution options
   * @returns {Promise<Object>} - Execution result
   */
  async execute(command, args = [], options = {}) {
    const providerName = await this.detectProvider();
    const provider = this.getProvider(providerName);
    
    if (!provider) {
      throw new Error(`❌ Provider '${providerName}' not found`);
    }

    // Apply provider-specific environment variables
    const env = { ...process.env, ...provider.getEnvVars() };
    
    // Execute with fallback handling
    const result = await provider.execute(command, args, { ...options, env });
    
    // Handle fallback if command failed
    if (!result.success) {
      const fallbackResult = await this.tryFallback(providerName, command, args, options);
      if (fallbackResult) {
        return fallbackResult;
      }
    }
    
    return result;
  }

  /**
   * Try fallback providers if primary fails
   * @param {string} primaryProvider - The primary provider that failed
   * @param {string} command - Command to execute
   * @param {string[]} args - Command arguments
   * @param {Object} options - Execution options
   * @returns {Promise<Object|null>} - Fallback result or null
   */
  async tryFallback(primaryProvider, command, args, options) {
    const config = this.loadConfig();
    const fallbackProviders = config.providers?.fallback || [];
    
    for (const fallbackProviderName of fallbackProviders) {
      if (fallbackProviderName === primaryProvider) continue;
      
      const fallbackProvider = this.getProvider(fallbackProviderName);
      if (!fallbackProvider) continue;
      
      if (await fallbackProvider.isAvailable()) {
        console.warn(`⚠️ Falling back to ${fallbackProviderName}...`);
        return await fallbackProvider.execute(command, args, options);
      }
    }
    
    return null;
  }

  /**
   * Send a message to the current AI provider
   * @param {string} prompt - The message/prompt
   * @param {Object} options - Message options
   * @returns {Promise<string>} - AI response
   */
  async sendMessage(prompt, options = {}) {
    const providerName = await this.detectProvider();
    const provider = this.getProvider(providerName);
    
    if (!provider) {
      throw new Error(`❌ Provider '${providerName}' not found`);
    }
    
    return provider.sendMessage(prompt, options);
  }

  /**
   * Spawn a sub-agent
   * @param {string} prompt - Sub-agent task
   * @param {Object} options - Sub-agent options
   * @returns {Promise<Object>} - Sub-agent result
   */
  async spawnSubAgent(prompt, options = {}) {
    const providerName = await this.detectProvider();
    const provider = this.getProvider(providerName);
    
    if (!provider) {
      throw new Error(`❌ Provider '${providerName}' not found`);
    }
    
    if (!provider.subAgentsSupported) {
      console.warn(`⚠️ Provider '${providerName}' does not support sub-agents. Falling back to main provider.`);
      return provider.sendMessage(prompt, options);
    }
    
    return provider.spawnSubAgent(prompt, options);
  }

  /**
   * Get MCP servers for the current provider
   * @returns {Object} - MCP server configurations
   */
  getMCPServers() {
    const providerName = this.currentProvider || 'claude';
    const provider = this.getProvider(providerName);
    
    if (!provider) {
      return {};
    }
    
    return provider.getMCPServers();
  }

  /**
   * Get all MCP servers from all providers
   * @returns {Object} - All MCP server configurations
   */
  getAllMCPServers() {
    const allServers = {};
    
    for (const [name, provider] of this.providers) {
      const servers = provider.getMCPServers();
      if (Object.keys(servers).length > 0) {
        allServers[name] = servers;
      }
    }
    
    return allServers;
  }

  /**
   * Get provider-specific configuration
   * @param {string} providerName - Provider name
   * @returns {Object} - Provider configuration
   */
  getProviderConfig(providerName) {
    const config = this.loadConfig();
    return config.provider_settings?.[providerName] || {};
  }

  /**
   * Map a Claude Craft model name to provider-specific model
   * @param {string} modelName - Generic model name (opus, sonnet, haiku)
   * @param {string} providerName - Target provider
   * @returns {string} - Provider-specific model name
   */
  mapModelName(modelName, providerName = null) {
    const targetProvider = providerName || this.currentProvider;
    const provider = this.getProvider(targetProvider);
    
    if (!provider) {
      return modelName; // Return as-is if provider not found
    }
    
    // Use provider's model aliases if available
    return provider.modelAliases?.[modelName] || modelName;
  }

  /**
   * Get recommended model for a task type
   * @param {string} taskType - Type of task (architecture, code_review, implementation, quick)
   * @param {string} providerName - Target provider
   * @returns {string} - Recommended model
   */
  getRecommendedModel(taskType, providerName = null) {
    const targetProvider = providerName || this.currentProvider;
    const config = this.loadConfig();
    
    // Check custom model routing config
    const customRouting = config.optimization?.model_routing?.[taskType];
    if (customRouting) {
      return this.mapModelName(customRouting, targetProvider);
    }
    
    // Default model routing
    const defaultRouting = {
      architecture: 'opus',
      code_review: 'sonnet',
      implementation: 'sonnet',
      quick: 'haiku',
    };
    
    const defaultModel = defaultRouting[taskType] || 'sonnet';
    return this.mapModelName(defaultModel, targetProvider);
  }

  /**
   * Check if a provider is available
   * @param {string} providerName - Provider name
   * @returns {Promise<boolean>} - Whether provider is available
   */
  async isProviderAvailable(providerName) {
    const provider = this.getProvider(providerName);
    if (!provider) return false;
    return await provider.isAvailable();
  }

  /**
   * Get version of a provider
   * @param {string} providerName - Provider name
   * @returns {Promise<string>} - Provider version
   */
  async getProviderVersion(providerName) {
    const provider = this.getProvider(providerName);
    if (!provider) return 'unknown';
    return await provider.getVersion();
  }

  /**
   * Get health status of all providers
   * @returns {Promise<Object>} - Health status for each provider
   */
  async getHealthStatus() {
    const status = {};
    
    for (const [name, provider] of this.providers) {
      try {
        const available = await provider.isAvailable();
        const version = available ? await provider.getVersion() : 'not available';
        
        status[name] = {
          available,
          version,
          displayName: provider.displayName,
        };
        
        // Add health check for OpenCode
        if (name === 'opencode' && available) {
          const health = await provider.getHealth();
          status[name].health = health;
        }
      } catch (error) {
        status[name] = {
          available: false,
          version: 'error',
          error: error.message,
        };
      }
    }
    
    return status;
  }

  /**
   * Initialize AI Craft in a project
   * @param {string} projectPath - Path to the project
   * @param {Object} options - Initialization options
   */
  async initProject(projectPath, options = {}) {
    const targetPath = path.resolve(projectPath);
    const aiCraftDir = path.join(targetPath, '.ai-craft');
    const claudeDir = path.join(targetPath, '.claude');
    
    // Create .ai-craft directory
    if (!fs.existsSync(aiCraftDir)) {
      fs.mkdirSync(aiCraftDir, { recursive: true });
    }
    
    // Copy or create AI-CRAFT.md
    const aiCraftMdPath = path.join(aiCraftDir, 'AI-CRAFT.md');
    const sourceAiCraftMd = path.join(__dirname, '..', '..', '.claude', 'AI-CRAFT.md');
    
    if (fs.existsSync(sourceAiCraftMd)) {
      fs.copyFileSync(sourceAiCraftMd, aiCraftMdPath);
    }
    
    // Create ai-craft.yaml
    const configPath = path.join(aiCraftDir, 'ai-craft.yaml');
    if (!fs.existsSync(configPath)) {
      const defaultConfig = this.getDefaultConfig();
      
      // Set primary provider if specified
      if (options.provider) {
        defaultConfig.providers.primary = options.provider;
      }
      
      this.saveConfig(defaultConfig, configPath);
    }
    
    // Create providers directory with subdirectories
    const providersDir = path.join(aiCraftDir, 'providers');
    if (!fs.existsSync(providersDir)) {
      fs.mkdirSync(providersDir, { recursive: true });
    }
    
    // Initialize provider-specific directories
    const providerNames = this.getProviderNames();
    for (const providerName of providerNames) {
      const providerDir = path.join(providersDir, providerName);
      if (!fs.existsSync(providerDir)) {
        fs.mkdirSync(providerDir, { recursive: true });
        
        // Create hooks, mcp, and config subdirectories
        const subDirs = ['hooks', 'mcp', 'config'];
        for (const subDir of subDirs) {
          fs.mkdirSync(path.join(providerDir, subDir), { recursive: true });
        }
      }
    }
    
    // Create symlink for backward compatibility
    if (!fs.existsSync(claudeDir)) {
      fs.symlinkSync(aiCraftDir, claudeDir, 'dir');
    }
    
    // Initialize subdirectories
    const subDirs = ['agents', 'commands', 'skills', 'templates', 'memory', 'logs'];
    for (const subDir of subDirs) {
      const dirPath = path.join(aiCraftDir, subDir);
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
      }
    }
    
    // Create provider configuration templates
    if (options.createTemplates !== false) {
      await this.createProviderTemplates(aiCraftDir);
    }
    
    return {
      success: true,
      path: aiCraftDir,
      symlinkCreated: !fs.existsSync(claudeDir) ? false : true,
      providersInitialized: providerNames,
    };
  }

  /**
   * Create provider configuration templates
   * @param {string} aiCraftDir - Path to .ai-craft directory
   */
  async createProviderTemplates(aiCraftDir) {
    const templates = {
      vibe: {
        config: `# Vibe Provider Configuration
# Auto-generated by AI Craft
provider:
  name: vibe
  display_name: "Vibe (Mistral AI)"
  binary: "vibe"

model:
  default: "mistral-large-3.5"
  aliases:
    opus: "mistral-large-3.5"
    sonnet: "mistral-medium-3.5"
    haiku: "mistral-small-3.5"

mcp:
  enabled: true
  servers:
    filesystem:
      enabled: true
    git:
      enabled: true
    process:
      enabled: true
`,
      },
      codex: {
        config: `# Codex Provider Configuration
# Auto-generated by AI Craft
provider:
  name: codex
  display_name: "Codex (Google)"
  binary: "codex"

model:
  default: "gemini-2.5-flash"
  aliases:
    opus: "gemini-2.5-pro"
    sonnet: "gemini-2.5-flash"
    haiku: "gemini-2.0-flash"

mcp:
  enabled: true
`,
      },
      opencode: {
        config: `# OpenCode Provider Configuration
# Auto-generated by AI Craft
provider:
  name: opencode
  display_name: "OpenCode (Self-Hosted)"
  binary: "opencode"
  self_hosted: true

model:
  default: "open-mistral-nemo-2407"
  aliases:
    opus: "open-mistral-nemo-2407"
    sonnet: "open-mistral-7b"
    haiku: "open-mistral-7b"

server:
  host: "localhost"
  port: 12345

mcp:
  enabled: true
`,
      },
      claude: {
        config: `# Claude Code Provider Configuration
# Auto-generated by AI Craft
provider:
  name: claude
  display_name: "Claude Code (Anthropic)"
  binary: "claude"

model:
  default: "claude-sonnet-4-5"
  aliases:
    opus: "claude-opus-4-8"
    sonnet: "claude-sonnet-4-5"
    haiku: "claude-haiku-4-5"

mcp:
  enabled: true
`,
      },
      cursor: {
        config: `# Cursor Provider Configuration
# Auto-generated by AI Craft
provider:
  name: cursor
  display_name: "Cursor (VSCode)"
  binary: "cursor"
  ide: "vscode"

model:
  default: "claude-3-7-sonnet"
  aliases:
    opus: "claude-3-7-sonnet"
    sonnet: "claude-3-7-sonnet"
    haiku: "claude-3-haiku"

mcp:
  enabled: true
`,
      },
    };

    for (const [providerName, template] of Object.entries(templates)) {
      const providerDir = path.join(aiCraftDir, 'providers', providerName);
      const configDir = path.join(providerDir, 'config');
      
      if (!fs.existsSync(path.join(configDir, 'default.yaml'))) {
        fs.writeFileSync(
          path.join(configDir, 'default.yaml'),
          template.config
        );
      }
    }
  }

  /**
   * Discover MCP servers in a directory
   * @param {string} directory - Directory to search for MCP servers
   * @returns {Object} - Discovered MCP servers
   */
  discoverMCPServers(directory) {
    const servers = {};
    
    if (!fs.existsSync(directory)) {
      return servers;
    }
    
    const entries = fs.readdirSync(directory, { withFileTypes: true });
    
    for (const entry of entries) {
      if (entry.isFile() && entry.name.endsWith('.json')) {
        try {
          const filePath = path.join(directory, entry.name);
          const content = fs.readFileSync(filePath, 'utf8');
          const config = JSON.parse(content);
          
          if (config.name && config.command) {
            servers[config.name] = {
              ...config,
              source: filePath,
            };
          }
        } catch {
          // Skip invalid JSON files
        }
      }
    }
    
    return servers;
  }

  /**
   * Load provider-specific configuration
   * @param {string} providerName - Provider name
   * @param {string} projectPath - Project path
   * @returns {Object} - Provider configuration
   */
  loadProviderConfig(providerName, projectPath) {
    const provider = this.getProvider(providerName);
    if (!provider) {
      return {};
    }
    
    const targetPath = path.resolve(projectPath);
    const configPath = path.join(targetPath, '.ai-craft', 'providers', providerName, 'config', 'default.yaml');
    
    if (fs.existsSync(configPath)) {
      try {
        const content = fs.readFileSync(configPath, 'utf8');
        return yamlLoad(content) || {};
      } catch {
        return {};
      }
    }
    
    return {};
  }

  /**
   * Get all MCP servers for a provider
   * @param {string} providerName - Provider name
   * @param {string} projectPath - Project path
   * @returns {Object} - All MCP servers
   */
  async getAllMCPServers(providerName, projectPath) {
    const provider = this.getProvider(providerName);
    if (!provider) {
      return {};
    }
    
    const targetPath = path.resolve(projectPath);
    const providerMcpDir = path.join(targetPath, '.ai-craft', 'providers', providerName, 'mcp');
    const globalMcpDir = path.join(targetPath, '.ai-craft', 'mcp');
    
    // Get built-in MCP servers from provider
    const builtIn = provider.getMCPServers();
    
    // Discover custom MCP servers
    const providerCustom = this.discoverMCPServers(providerMcpDir);
    const globalCustom = this.discoverMCPServers(globalMcpDir);
    
    return {
      builtIn,
      providerCustom,
      globalCustom,
      all: { ...builtIn, ...providerCustom, ...globalCustom },
    };
  }

  /**
   * Start all MCP servers for a provider
   * @param {string} providerName - Provider name
   * @param {string} projectPath - Project path
   * @returns {Promise<Object>} - Start result
   */
  async startAllMCPServers(providerName, projectPath) {
    const { all: servers } = await this.getAllMCPServers(providerName, projectPath);
    const started = {};
    const failed = {};
    
    for (const [name, config] of Object.entries(servers)) {
      if (config.enabled !== false) {
        try {
          // In a real implementation, this would start the MCP server process
          // For now, we just log it
          started[name] = {
            status: 'would_start',
            command: config.command,
            args: config.args,
          };
        } catch (error) {
          failed[name] = {
            error: error.message,
          };
        }
      }
    }
    
    return { started, failed, total: Object.keys(servers).length };
  }

  /**
   * Save provider-specific configuration
   * @param {string} providerName - Provider name
   * @param {Object} config - Configuration to save
   * @param {string} projectPath - Project path
   */
  saveProviderConfig(providerName, config, projectPath) {
    const targetPath = path.resolve(projectPath);
    const configDir = path.join(targetPath, '.ai-craft', 'providers', providerName, 'config');
    
    if (!fs.existsSync(configDir)) {
      fs.mkdirSync(configDir, { recursive: true });
    }
    
    const configPath = path.join(configDir, 'custom.yaml');
    const yamlContent = yamlDump(config, { indent: 2 });
    fs.writeFileSync(configPath, yamlContent);
  }

  /**
   * Migrate a Claude Craft project to AI Craft
   * @param {string} projectPath - Path to the project
   * @returns {Promise<Object>} - Migration result
   */
  async migrateProject(projectPath) {
    const targetPath = path.resolve(projectPath);
    const claudeDir = path.join(targetPath, '.claude');
    const aiCraftDir = path.join(targetPath, '.ai-craft');
    
    // Check if it's a Claude Craft project
    if (!fs.existsSync(claudeDir)) {
      return {
        success: false,
        error: 'Not a Claude Craft project (no .claude/ directory found)',
      };
    }
    
    // Create .ai-craft directory
    if (!fs.existsSync(aiCraftDir)) {
      fs.mkdirSync(aiCraftDir, { recursive: true });
    }
    
    // Copy all files from .claude/ to .ai-craft/
    const entries = fs.readdirSync(claudeDir, { withFileTypes: true });
    
    for (const entry of entries) {
      const srcPath = path.join(claudeDir, entry.name);
      const destPath = path.join(aiCraftDir, entry.name);
      
      if (entry.isDirectory()) {
        // Copy directory recursively
        this.copyDirSync(srcPath, destPath);
      } else if (entry.isFile()) {
        // Skip CLAUDE.md - we'll create AI-CRAFT.md instead
        if (entry.name === 'CLAUDE.md') {
          continue;
        }
        fs.copyFileSync(srcPath, destPath);
      }
    }
    
    // Create AI-CRAFT.md from CLAUDE.md
    const claudeMdPath = path.join(claudeDir, 'CLAUDE.md');
    if (fs.existsSync(claudeMdPath)) {
      let content = fs.readFileSync(claudeMdPath, 'utf8');
      // Replace Claude-specific references
      content = content
        .replace(/Claude Code/g, 'Multi-AI')
        .replace(/claude-craft/g, 'ai-craft')
        .replace(/@the-bearded-bear\/claude-craft/g, '@ai-craft/core');
      
      fs.writeFileSync(path.join(aiCraftDir, 'AI-CRAFT.md'), content);
    }
    
    // Create ai-craft.yaml
    const config = this.getDefaultConfig();
    config.compatibility = {
      claude_craft: true,
      legacy_hooks: true,
      migrated: new Date().toISOString(),
    };
    
    this.saveConfig(config, path.join(aiCraftDir, 'ai-craft.yaml'));
    
    // Create symlink .claude/ -> .ai-craft/ if it doesn't exist
    // (it was removed during copy)
    if (!fs.existsSync(claudeDir)) {
      fs.symlinkSync(aiCraftDir, claudeDir, 'dir');
    }
    
    return {
      success: true,
      aiCraftDir,
      claudeDir,
      filesCopied: entries.length,
    };
  }

  /**
   * Copy directory recursively (synchronous)
   * @param {string} src - Source path
   * @param {string} dest - Destination path
   */
  copyDirSync(src, dest) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    
    const entries = fs.readdirSync(src, { withFileTypes: true });
    
    for (const entry of entries) {
      const srcPath = path.join(src, entry.name);
      const destPath = path.join(dest, entry.name);
      
      if (entry.isDirectory()) {
        this.copyDirSync(srcPath, destPath);
      } else if (entry.isFile()) {
        fs.copyFileSync(srcPath, destPath);
      }
    }
  }
}

// Singleton instance
export const providerManager = new AIProviderManager();
