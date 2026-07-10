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
import { memoryManager } from './memory.js';
import { assertWithinDir } from './path-safety.js';

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

    /** @type {Map<string, Promise<BaseProvider>>} */
    this.lazyProviders = new Map();

    /** @type {Object} */
    this.cache = {
      providerAvailability: new Map(),
      providerVersions: new Map(),
      mcpServers: new Map(),
      providerConfigs: new Map(),
    };

    /** @type {number} */
    this.cacheTTL = 300000; // 5 minutes

    /** @type {Object} */
    this.performanceMetrics = {
      providerDetectionTime: 0,
      availabilityChecks: 0,
      hookExecutions: 0,
      mcpDiscoveries: 0,
    };

    // Register provider factories for lazy loading
    this.providerFactories = {
      vibe: () => new VibeProvider(),
      codex: () => new CodexProvider(),
      opencode: () => new OpenCodeProvider(),
      claude: () => new ClaudeProvider(),
      cursor: () => new CursorProvider(),
    };

    // For backward compatibility, initialize all providers by default
    // This ensures existing code that expects providers to be pre-loaded works
    this.initializeAllProviders();
  }

  /**
   * Get a provider instance with lazy loading
   * @param {string} name - Provider name
   * @returns {BaseProvider} - Provider instance
   */
  getProvider(name) {
    // Check if already loaded
    if (this.providers.has(name)) {
      return this.providers.get(name);
    }

    // Lazy load the provider if not already loaded
    const factory = this.providerFactories[name];
    if (factory) {
      const provider = factory();
      this.providers.set(name, provider);
      return provider;
    }

    return null;
  }

  /**
   * Initialize all providers (for backward compatibility)
   * This can be called to pre-load all providers
   */
  initializeAllProviders() {
    for (const [name, factory] of Object.entries(this.providerFactories)) {
      if (!this.providers.has(name)) {
        this.providers.set(name, factory());
      }
    }
  }

  /**
   * Enable lazy loading (don't pre-load providers)
   * Use this for performance optimization when you know which provider you'll use
   */
  enableLazyLoading() {
    this.providers.clear();
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
   * Get list of provider names
   * @returns {string[]} - Array of provider names
   */
  getProviderNames() {
    // Return all known provider names (from factories)
    return Object.keys(this.providerFactories);
  }

  /**
   * Get all registered providers (initializes lazy providers if needed)
   * @returns {Map<string, BaseProvider>} - All providers
   */
  getAllProviders() {
    // Initialize any lazy providers
    this.initializeAllProviders();
    return this.providers;
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
   * @param {boolean} options.useCache - Use cached detection (default: true)
   * @returns {Promise<string>} - Detected provider name
   */
  async detectProvider(options = {}) {
    const { force = false, useCache = true } = options;

    // Return cached provider if not forcing re-detection
    if (this.currentProvider && !force) {
      return this.currentProvider;
    }

    const startTime = Date.now();

    // 1. Check explicit configuration
    const config = this.loadConfig();
    if (config.providers?.primary) {
      const provider = this.getProvider(config.providers.primary);
      if (provider) {
        this.currentProvider = config.providers.primary;
        this.performanceMetrics.providerDetectionTime = Date.now() - startTime;
        return this.currentProvider;
      }
    }

    // 2. Check environment variables
    const envProvider = this.detectFromEnvironment();
    if (envProvider) {
      this.currentProvider = envProvider;
      this.performanceMetrics.providerDetectionTime = Date.now() - startTime;
      return this.currentProvider;
    }

    // 3. Check installed binaries (with caching)
    if (useCache && this.cache.providerAvailability.size > 0) {
      // Use cached detection
      for (const [name, cached] of this.cache.providerAvailability) {
        if (cached.available && cached.timestamp > Date.now() - this.cacheTTL) {
          this.currentProvider = name;
          this.performanceMetrics.providerDetectionTime = Date.now() - startTime;
          return this.currentProvider;
        }
      }
    }

    const binaryProvider = await this.detectFromBinaries();
    if (binaryProvider) {
      this.currentProvider = binaryProvider;
      this.performanceMetrics.providerDetectionTime = Date.now() - startTime;
      return this.currentProvider;
    }

    // 4. Default fallback
    this.currentProvider = 'claude';
    this.performanceMetrics.providerDetectionTime = Date.now() - startTime;
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
   * @param {Object} options - Options
   * @param {boolean} options.parallel - Use parallel detection (default: true)
   * @returns {Promise<string|null>} - Provider name or null
   */
  async detectFromBinaries(options = {}) {
    const { parallel = true } = options;
    const providersToCheck = this.getProviderNames();

    if (parallel) {
      // Parallel detection for better performance
      const promises = providersToCheck.map(async (providerName) => {
        const provider = this.getProvider(providerName);
        const available = provider ? await provider.isAvailable() : false;
        return { name: providerName, available };
      });

      const results = await Promise.all(promises);

      // Cache results
      for (const result of results) {
        this.cache.providerAvailability.set(result.name, {
          available: result.available,
          timestamp: Date.now(),
        });
      }

      const availableProvider = results.find((r) => r.available);
      return availableProvider?.name || null;
    } else {
      // Sequential detection (backward compatible)
      for (const providerName of providersToCheck) {
        const provider = this.getProvider(providerName);
        if (provider && (await provider.isAvailable())) {
          // Cache result
          this.cache.providerAvailability.set(providerName, {
            available: true,
            timestamp: Date.now(),
          });
          return providerName;
        }
      }

      return null;
    }
  }

  /**
   * Set the current provider explicitly
   * @param {string} providerName - Provider name to use
   * @throws {Error} - If provider is not registered
   */
  setProvider(providerName) {
    const provider = this.getProvider(providerName);
    if (!provider) {
      throw new Error(
        `❌ Provider '${providerName}' is not registered. Available providers: ${this.getProviderNames().join(', ')}`
      );
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
   * Get all MCP servers from all loaded providers (synchronous, simple version)
   * @returns {Object} - All MCP server configurations
   */
  getAllProviderMCPServers() {
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
   * @param {Object} options - Options
   * @param {boolean} options.parallel - Use parallel checks (default: true)
   * @param {boolean} options.useCache - Use cached results (default: true)
   * @returns {Promise<Object>} - Health status for each provider
   */
  async getHealthStatus(options = {}) {
    const { parallel = true, useCache = true } = options;
    const status = {};

    // Initialize all providers if using lazy loading
    this.initializeAllProviders();

    if (parallel) {
      // Parallel health checks for better performance
      const providerNames = this.getProviderNames();
      const promises = providerNames.map(async (name) => {
        const provider = this.getProvider(name);

        // Try to use cached version
        if (useCache && this.cache.providerVersions.has(name)) {
          const cached = this.cache.providerVersions.get(name);
          if (cached.timestamp > Date.now() - this.cacheTTL) {
            return {
              name,
              available: cached.available,
              version: cached.version,
              displayName: provider?.displayName || name,
            };
          }
        }

        try {
          const available = await provider?.isAvailable();
          const version = available ? await provider?.getVersion() : 'not available';

          // Cache result
          this.cache.providerVersions.set(name, {
            available,
            version,
            timestamp: Date.now(),
          });

          const result = {
            available,
            version,
            displayName: provider?.displayName || name,
          };

          // Add health check for OpenCode
          if (name === 'opencode' && available && provider?.getHealth) {
            const health = await provider.getHealth();
            result.health = health;
          }

          return { name, ...result };
        } catch (error) {
          return {
            name,
            available: false,
            version: 'error',
            error: error.message,
          };
        }
      });

      const results = await Promise.all(promises);
      for (const result of results) {
        status[result.name] = result;
      }

      this.performanceMetrics.availabilityChecks += providerNames.length;
    } else {
      // Sequential checks (backward compatible)
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
        fs.writeFileSync(path.join(configDir, 'default.yaml'), template.config);
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
          // MCP server auto-start is not implemented: no process is spawned here.
          // Report an honest status instead of implying a start was attempted.
          started[name] = {
            status: 'not_implemented',
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

  /**
   * Execute a hook script
   * @param {string} providerName - Provider name
   * @param {string} hookName - Hook name (pre-execute, post-execute, pre-message, post-message)
   * @param {string} projectPath - Project path
   * @param {Object} env - Environment variables to pass
   * @returns {Promise<Object>} - Execution result
   */
  async executeHook(providerName, hookName, projectPath, env = {}) {
    const provider = this.getProvider(providerName);
    if (!provider) {
      return { success: false, error: `Provider '${providerName}' not found` };
    }

    const targetPath = path.resolve(projectPath);
    const hooksDir = path.join(targetPath, '.ai-craft', 'providers', providerName, 'hooks');

    let hookPath;
    try {
      hookPath = assertWithinDir(hooksDir, path.join(hooksDir, hookName));
    } catch (error) {
      return { success: false, error: error.message };
    }

    // Check if hook exists and is executable
    if (!fs.existsSync(hookPath)) {
      return { success: true, skipped: true, message: `Hook '${hookName}' not found` };
    }

    try {
      const { execa } = await import('execa');
      const timeoutMs = (this.getDefaultConfig().security?.max_execution_time || 3600) * 1000;
      const result = await execa(hookPath, [], {
        cwd: targetPath,
        env: { PATH: process.env.PATH, HOME: process.env.HOME, ...env },
        timeout: timeoutMs,
        reject: false,
      });

      return {
        success: result.exitCode === 0,
        exitCode: result.exitCode,
        stdout: result.stdout,
        stderr: result.stderr,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        stdout: error.stdout,
        stderr: error.stderr,
      };
    }
  }

  /**
   * Execute all pre-command hooks for a provider
   * @param {string} providerName - Provider name
   * @param {string} projectPath - Project path
   * @param {Object} env - Environment variables
   * @returns {Promise<Object>} - Execution result
   */
  async executePreCommandHooks(providerName, projectPath, env = {}) {
    const providerConfig = this.loadProviderConfig(providerName, projectPath);
    const hooks = providerConfig.hooks?.pre_command || ['pre-execute.sh'];

    const results = [];
    for (const hook of hooks) {
      const result = await this.executeHook(providerName, hook, projectPath, env);
      results.push({ hook, ...result });

      // Stop if hook failed
      if (!result.success && !result.skipped) {
        break;
      }
    }

    return { hooks, results };
  }

  /**
   * Execute all post-command hooks for a provider
   * @param {string} providerName - Provider name
   * @param {string} projectPath - Project path
   * @param {Object} env - Environment variables
   * @returns {Promise<Object>} - Execution result
   */
  async executePostCommandHooks(providerName, projectPath, env = {}) {
    const providerConfig = this.loadProviderConfig(providerName, projectPath);
    const hooks = providerConfig.hooks?.post_command || ['post-execute.sh'];

    const results = [];
    for (const hook of hooks) {
      const result = await this.executeHook(providerName, hook, projectPath, env);
      results.push({ hook, ...result });
    }

    return { hooks, results };
  }

  /**
   * Execute pre-message hooks for a provider
   * @param {string} providerName - Provider name
   * @param {string} projectPath - Project path
   * @param {string} message - The message being sent
   * @returns {Promise<Object>} - Execution result
   */
  async executePreMessageHooks(providerName, projectPath, message) {
    const providerConfig = this.loadProviderConfig(providerName, projectPath);
    const hooks = providerConfig.hooks?.pre_message || [];

    const env = { ...process.env, AI_CRAFT_MESSAGE: message };

    const results = [];
    for (const hook of hooks) {
      const result = await this.executeHook(providerName, hook, projectPath, env);
      results.push({ hook, ...result });

      if (!result.success && !result.skipped) {
        break;
      }
    }

    return { hooks, results };
  }

  /**
   * Execute post-message hooks for a provider
   * @param {string} providerName - Provider name
   * @param {string} projectPath - Project path
   * @param {string} response - The AI response
   * @returns {Promise<Object>} - Execution result
   */
  async executePostMessageHooks(providerName, projectPath, response) {
    const providerConfig = this.loadProviderConfig(providerName, projectPath);
    const hooks = providerConfig.hooks?.post_message || [];

    const env = { ...process.env, AI_CRAFT_RESPONSE: response };

    const results = [];
    for (const hook of hooks) {
      const result = await this.executeHook(providerName, hook, projectPath, env);
      results.push({ hook, ...result });
    }

    return { hooks, results };
  }

  // =========================================================================
  // Memory Management Methods
  // =========================================================================

  /**
   * Get memory manager instance
   * @returns {Object} - Memory manager
   */
  getMemoryManager() {
    return memoryManager;
  }

  /**
   * Get or create a conversation with memory
   * @param {string} conversationId - Conversation ID
   * @param {Object} options - Options
   * @returns {Object} - Conversation
   */
  getConversation(conversationId, options = {}) {
    const providerName = this.currentProvider || 'unknown';
    const config = this.loadConfig();
    const defaultModel = config.providers?.model || this.getProvider(providerName)?.defaultModel || 'unknown';

    return memoryManager.getConversation(conversationId, {
      provider: providerName,
      model: options.model || defaultModel,
    });
  }

  /**
   * Add a message to conversation memory
   * @param {string} conversationId - Conversation ID
   * @param {Object} message - Message object
   */
  addToConversation(conversationId, message) {
    memoryManager.addMessage(conversationId, message);
  }

  /**
   * Get conversation history
   * @param {string} conversationId - Conversation ID
   * @param {number} limit - Maximum messages
   * @returns {Array} - Message history
   */
  getConversationHistory(conversationId, limit = 100) {
    return memoryManager.getHistory(conversationId, limit);
  }

  /**
   * Set shared project context
   * @param {Object} context - Project context
   */
  setProjectContext(context) {
    memoryManager.setProjectContext(context);
  }

  /**
   * Get shared project context
   * @returns {Object} - Project context
   */
  getProjectContext() {
    return memoryManager.getProjectContext();
  }

  /**
   * Set user preference
   * @param {string} key - Preference key
   * @param {*} value - Preference value
   */
  setPreference(key, value) {
    memoryManager.setPreference(key, value);
  }

  /**
   * Get user preference
   * @param {string} key - Preference key
   * @param {*} defaultValue - Default value
   * @returns {*} - Preference value
   */
  getPreference(key, defaultValue) {
    return memoryManager.getPreference(key, defaultValue);
  }

  /**
   * Set cached value
   * @param {string} key - Cache key
   * @param {*} value - Value to cache
   * @param {number} ttl - Time to live in ms
   */
  setCache(key, value, ttl = 0) {
    memoryManager.setCache(key, value, ttl);
  }

  /**
   * Get cached value
   * @param {string} key - Cache key
   * @returns {*} - Cached value
   */
  getCache(key) {
    return memoryManager.getCache(key);
  }

  /**
   * Get memory statistics
   * @returns {Object} - Statistics
   */
  getMemoryStats() {
    return memoryManager.getStats();
  }

  /**
   * Share context between providers
   * @param {string} fromProvider - Source provider
   * @param {string} toProvider - Target provider
   * @param {Object} context - Context to share
   */
  shareContext(fromProvider, toProvider, context) {
    const conversationId = `shared-${fromProvider}-${toProvider}-${Date.now()}`;
    const conversation = this.getConversation(conversationId, {
      provider: toProvider,
      model: this.getProvider(toProvider)?.defaultModel || 'unknown',
    });

    conversation.context = {
      ...conversation.context,
      sharedFrom: fromProvider,
      sharedContext: context,
      sharedAt: new Date().toISOString(),
    };

    return conversationId;
  }

  /**
   * Get shared context
   * @param {string} conversationId - Conversation ID
   * @returns {Object} - Shared context
   */
  getSharedContext(conversationId) {
    const conversation = memoryManager.conversations.get(conversationId);
    return conversation?.context?.sharedContext || {};
  }

  // =========================================================================
  // Performance and Cache Management
  // =========================================================================

  /**
   * Get performance metrics
   * @returns {Object} - Performance metrics
   */
  getPerformanceMetrics() {
    return { ...this.performanceMetrics };
  }

  /**
   * Reset performance metrics
   */
  resetPerformanceMetrics() {
    this.performanceMetrics = {
      providerDetectionTime: 0,
      availabilityChecks: 0,
      hookExecutions: 0,
      mcpDiscoveries: 0,
    };
  }

  /**
   * Clear all caches (provider manager's own cache + shared memory cache)
   */
  clearCache() {
    memoryManager.clearCache();
    this.cache = {
      providerAvailability: new Map(),
      providerVersions: new Map(),
      mcpServers: new Map(),
      providerConfigs: new Map(),
    };
  }

  /**
   * Clear cache for a specific provider
   * @param {string} providerName - Provider name
   */
  clearProviderCache(providerName) {
    this.cache.providerAvailability.delete(providerName);
    this.cache.providerVersions.delete(providerName);
    this.cache.mcpServers.delete(providerName);
    this.cache.providerConfigs.delete(providerName);
  }

  /**
   * Set cache TTL
   * @param {number} ttl - Time to live in milliseconds
   */
  setCacheTTL(ttl) {
    this.cacheTTL = ttl;
  }

  /**
   * Get cache statistics
   * @returns {Object} - Cache statistics
   */
  getCacheStats() {
    return {
      providerAvailability: this.cache.providerAvailability.size,
      providerVersions: this.cache.providerVersions.size,
      mcpServers: this.cache.mcpServers.size,
      providerConfigs: this.cache.providerConfigs.size,
      ttl: this.cacheTTL,
    };
  }

  /**
   * Warm up caches by pre-loading all providers
   */
  async warmUp() {
    this.initializeAllProviders();

    // Pre-detect all providers
    await this.detectFromBinaries({ parallel: true, useCache: false });

    // Pre-check health
    await this.getHealthStatus({ parallel: true, useCache: false });
  }
}

// Singleton instance
export const providerManager = new AIProviderManager();
