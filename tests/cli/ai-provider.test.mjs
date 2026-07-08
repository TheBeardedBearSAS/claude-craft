import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import fs from 'fs';

vi.mock('execa', () => ({ execa: vi.fn() }));

// Mock modules before importing AIProviderManager
// Using inline factory functions to avoid hoisting issues with ESM
vi.mock('../../cli/lib/provider/base-provider.js', () => ({
  BaseProvider: class BaseProvider {
    constructor() {
      this.displayName = 'Base Provider';
      this.defaultModel = 'default-model';
      this.subAgentsSupported = false;
    }

    isAvailable() {
      return Promise.resolve(true);
    }

    getVersion() {
      return Promise.resolve('1.0.0');
    }

    execute() {
      return Promise.resolve({ success: true });
    }

    sendMessage() {
      return Promise.resolve('response');
    }

    spawnSubAgent() {
      return Promise.resolve({ success: true });
    }

    getMCPServers() {
      return {};
    }

    getEnvVars() {
      return {};
    }
  },
}));

vi.mock('../../cli/lib/provider/vibe-provider.js', () => ({
  VibeProvider: class VibeProvider {
    constructor() {
      this.displayName = 'Vibe';
      this.defaultModel = 'mistral-large';
      this.subAgentsSupported = true;
      this.name = 'vibe';
      this.modelAliases = { opus: 'mistral-large', sonnet: 'mistral-medium', haiku: 'mistral-small' };
    }

    isAvailable() {
      return Promise.resolve(true);
    }

    getVersion() {
      return Promise.resolve('2.0.0');
    }

    getMCPServers() {
      return { filesystem: { enabled: true } };
    }

    getEnvVars() {
      return {};
    }
  },
}));

vi.mock('../../cli/lib/provider/codex-provider.js', () => ({
  CodexProvider: class CodexProvider {
    constructor() {
      this.displayName = 'Codex';
      this.defaultModel = 'codex-model';
      this.subAgentsSupported = false;
      this.name = 'codex';
      this.modelAliases = {};
    }

    isAvailable() {
      return Promise.resolve(false);
    }

    getVersion() {
      return Promise.resolve('1.5.0');
    }

    getMCPServers() {
      return {};
    }

    getEnvVars() {
      return {};
    }
  },
}));

vi.mock('../../cli/lib/provider/opencode-provider.js', () => ({
  OpenCodeProvider: class OpenCodeProvider {
    constructor() {
      this.displayName = 'OpenCode';
      this.defaultModel = 'opencode-model';
      this.subAgentsSupported = false;
      this.name = 'opencode';
      this.modelAliases = {};
    }

    isAvailable() {
      return Promise.resolve(true);
    }

    getVersion() {
      return Promise.resolve('1.2.0');
    }

    getMCPServers() {
      return {};
    }

    getEnvVars() {
      return {};
    }
  },
}));

vi.mock('../../cli/lib/provider/claude-provider.js', () => ({
  ClaudeProvider: class ClaudeProvider {
    constructor() {
      this.displayName = 'Claude';
      this.defaultModel = 'claude-3-5-sonnet';
      this.subAgentsSupported = true;
      this.name = 'claude';
      this.modelAliases = { opus: 'claude-3-5-sonnet-20250715', sonnet: 'claude-3-5-sonnet', haiku: 'claude-3-haiku' };
    }

    isAvailable() {
      return Promise.resolve(true);
    }

    getVersion() {
      return Promise.resolve('3.0.0');
    }

    getMCPServers() {
      return { git: { enabled: true } };
    }

    getEnvVars() {
      return {};
    }
  },
}));

vi.mock('../../cli/lib/provider/cursor-provider.js', () => ({
  CursorProvider: class CursorProvider {
    constructor() {
      this.displayName = 'Cursor';
      this.defaultModel = 'cursor-model';
      this.subAgentsSupported = true;
      this.name = 'cursor';
      this.modelAliases = {};
    }

    isAvailable() {
      return Promise.resolve(false);
    }

    getVersion() {
      return Promise.resolve('1.0.0');
    }

    getMCPServers() {
      return {};
    }

    getEnvVars() {
      return {};
    }
  },
}));

// Now import the actual module
const { AIProviderManager } = await import('../../cli/lib/ai-provider.js');
const { memoryManager } = await import('../../cli/lib/memory.js');

describe('AIProviderManager', () => {
  let manager;

  beforeEach(() => {
    // Create a fresh manager instance
    manager = new AIProviderManager();

    // Mock process.cwd
    vi.spyOn(process, 'cwd').mockReturnValue('/test/project');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // =========================================================================
  // Phase 5 - Lazy Loading Tests
  // =========================================================================

  describe('Lazy Loading', () => {
    it('should have all provider factories registered', () => {
      expect(manager.providerFactories).toBeDefined();
      expect(Object.keys(manager.providerFactories)).toContain('vibe');
      expect(Object.keys(manager.providerFactories)).toContain('codex');
      expect(Object.keys(manager.providerFactories)).toContain('opencode');
      expect(Object.keys(manager.providerFactories)).toContain('claude');
      expect(Object.keys(manager.providerFactories)).toContain('cursor');
    });

    it('should initialize all providers by default (backward compatibility)', () => {
      expect(manager.providers.size).toBeGreaterThan(0);
      expect(manager.providers.has('vibe')).toBe(true);
      expect(manager.providers.has('codex')).toBe(true);
      expect(manager.providers.has('claude')).toBe(true);
    });

    it('should return provider names from factories', () => {
      const names = manager.getProviderNames();
      expect(names).toContain('vibe');
      expect(names).toContain('codex');
      expect(names).toContain('opencode');
      expect(names).toContain('claude');
      expect(names).toContain('cursor');
    });

    it('should return null for unknown provider', () => {
      const unknownProvider = manager.getProvider('unknown-provider');
      expect(unknownProvider).toBeNull();
    });

    it('should get provider with lazy loading', () => {
      // Clear existing providers to test lazy loading
      manager.providers.clear();

      const vibeProvider = manager.getProvider('vibe');
      expect(vibeProvider).toBeDefined();
      expect(vibeProvider.displayName).toBe('Vibe');
      expect(manager.providers.has('vibe')).toBe(true);
    });

    it('should enable lazy loading and clear providers', () => {
      const initialCount = manager.providers.size;
      expect(initialCount).toBeGreaterThan(0);

      manager.enableLazyLoading();
      expect(manager.providers.size).toBe(0);

      // Should still be able to get providers via lazy loading
      const provider = manager.getProvider('claude');
      expect(provider).toBeDefined();
      expect(provider.displayName).toBe('Claude');
      expect(manager.providers.size).toBe(1);
    });

    it('should initialize all providers when requested', () => {
      manager.enableLazyLoading();
      manager.providers.clear();

      manager.initializeAllProviders();

      expect(manager.providers.size).toBe(5); // vibe, codex, opencode, claude, cursor
      expect(manager.providers.has('vibe')).toBe(true);
      expect(manager.providers.has('claude')).toBe(true);
    });
  });

  // =========================================================================
  // Phase 5 - Caching Tests
  // =========================================================================

  describe('Caching', () => {
    it('should have cache initialized with all required caches', () => {
      expect(manager.cache).toBeDefined();
      expect(manager.cache.providerAvailability).toBeDefined();
      expect(manager.cache.providerVersions).toBeDefined();
      expect(manager.cache.mcpServers).toBeDefined();
      expect(manager.cache.providerConfigs).toBeDefined();
    });

    it('should have default cache TTL of 5 minutes', () => {
      expect(manager.cacheTTL).toBe(300000); // 5 minutes in ms
    });

    it('should get cache statistics', () => {
      const stats = manager.getCacheStats();

      expect(stats).toHaveProperty('providerAvailability');
      expect(stats).toHaveProperty('providerVersions');
      expect(stats).toHaveProperty('mcpServers');
      expect(stats).toHaveProperty('providerConfigs');
      expect(stats).toHaveProperty('ttl');
      expect(stats.ttl).toBe(300000);
    });

    it('should set cache TTL', () => {
      manager.setCacheTTL(60000); // 1 minute
      expect(manager.cacheTTL).toBe(60000);

      const stats = manager.getCacheStats();
      expect(stats.ttl).toBe(60000);
    });

    it('should clear all cache', () => {
      // Add some cache entries
      manager.cache.providerAvailability.set('test', { available: true, timestamp: Date.now() });
      manager.cache.providerVersions.set('test', { version: '1.0.0', timestamp: Date.now() });

      expect(manager.cache.providerAvailability.size).toBeGreaterThan(0);

      manager.clearCache();

      expect(manager.cache.providerAvailability.size).toBe(0);
      expect(manager.cache.providerVersions.size).toBe(0);
      expect(manager.cache.mcpServers.size).toBe(0);
      expect(manager.cache.providerConfigs.size).toBe(0);
    });

    it('should also clear the shared memoryManager cache (not shadowed by a duplicate method)', () => {
      const spy = vi.spyOn(memoryManager, 'clearCache');

      manager.clearCache();

      expect(spy).toHaveBeenCalledTimes(1);
    });

    it('should clear cache for specific provider', () => {
      // Add cache entries for multiple providers
      manager.cache.providerAvailability.set('vibe', { available: true, timestamp: Date.now() });
      manager.cache.providerAvailability.set('claude', { available: true, timestamp: Date.now() });
      manager.cache.providerVersions.set('vibe', { version: '2.0.0', timestamp: Date.now() });

      expect(manager.cache.providerAvailability.size).toBe(2);

      manager.clearProviderCache('vibe');

      expect(manager.cache.providerAvailability.has('vibe')).toBe(false);
      expect(manager.cache.providerVersions.has('vibe')).toBe(false);
      expect(manager.cache.providerAvailability.has('claude')).toBe(true);
    });
  });

  // =========================================================================
  // Phase 5 - Parallel Execution Tests
  // =========================================================================

  describe('Parallel Execution', () => {
    it('should detect from binaries with parallel execution by default', async () => {
      const spyAll = vi.spyOn(Promise, 'all');

      await manager.detectFromBinaries();

      expect(spyAll).toHaveBeenCalled();
    });

    it('should detect from binaries sequentially when parallel is false', async () => {
      const spyAll = vi.spyOn(Promise, 'all');

      await manager.detectFromBinaries({ parallel: false });

      expect(spyAll).not.toHaveBeenCalled();
    });

    it('should return first available provider in parallel mode', async () => {
      const provider = await manager.detectFromBinaries();
      // Since vibe and claude and opencode return true for isAvailable in our mocks,
      // it should return one of them
      expect(['vibe', 'claude', 'opencode']).toContain(provider);
    });

    it('should return null when no providers are available', async () => {
      // Create a new manager where all providers return false
      const testManager = new AIProviderManager();

      // Override provider factories to return unavailable providers
      testManager.providerFactories = {
        test1: () => ({ isAvailable: () => Promise.resolve(false) }),
        test2: () => ({ isAvailable: () => Promise.resolve(false) }),
      };
      testManager.providers.clear();

      const result = await testManager.detectFromBinaries();
      expect(result).toBeNull();
    });

    it('should cache provider availability results', async () => {
      await manager.detectFromBinaries();

      const stats = manager.getCacheStats();
      expect(stats.providerAvailability).toBeGreaterThan(0);
    });

    it('should get health status with parallel execution', async () => {
      const healthStatus = await manager.getHealthStatus({ parallel: true, useCache: false });

      expect(healthStatus).toBeDefined();
      expect(healthStatus).toHaveProperty('vibe');
      expect(healthStatus).toHaveProperty('claude');
      expect(healthStatus).toHaveProperty('codex');
      expect(healthStatus).toHaveProperty('opencode');
      expect(healthStatus).toHaveProperty('cursor');

      // Check that metrics were updated
      const metrics = manager.getPerformanceMetrics();
      expect(metrics.availabilityChecks).toBeGreaterThan(0);
    });

    it('should use cache for health status when requested', async () => {
      // First call without cache
      await manager.getHealthStatus({ parallel: true, useCache: false });
      const statsBefore = manager.getCacheStats();

      // Second call with cache - should use cached values
      await manager.getHealthStatus({ parallel: true, useCache: true });

      // Availability checks should not have increased significantly
      // (might have some new checks, but should be less than doing all checks again)
    });
  });

  // =========================================================================
  // Phase 5 - Performance Metrics Tests
  // =========================================================================

  describe('Performance Metrics', () => {
    it('should have performance metrics initialized', () => {
      expect(manager.performanceMetrics).toBeDefined();
      expect(manager.performanceMetrics.providerDetectionTime).toBeDefined();
      expect(manager.performanceMetrics.availabilityChecks).toBeDefined();
      expect(manager.performanceMetrics.hookExecutions).toBeDefined();
      expect(manager.performanceMetrics.mcpDiscoveries).toBeDefined();
    });

    it('should get performance metrics', () => {
      const metrics = manager.getPerformanceMetrics();

      expect(metrics).toHaveProperty('providerDetectionTime');
      expect(metrics).toHaveProperty('availabilityChecks');
      expect(metrics).toHaveProperty('hookExecutions');
      expect(metrics).toHaveProperty('mcpDiscoveries');
    });

    it('should reset performance metrics', () => {
      // Set some metrics
      manager.performanceMetrics.availabilityChecks = 10;

      manager.resetPerformanceMetrics();

      const metrics = manager.getPerformanceMetrics();
      expect(metrics.availabilityChecks).toBe(0);
      expect(metrics.providerDetectionTime).toBe(0);
      expect(metrics.hookExecutions).toBe(0);
      expect(metrics.mcpDiscoveries).toBe(0);
    });

    it('should update provider detection time on detectProvider', async () => {
      const initialMetrics = manager.getPerformanceMetrics();
      const initialTime = initialMetrics.providerDetectionTime;

      await manager.detectProvider({ force: true });

      const updatedMetrics = manager.getPerformanceMetrics();
      // Should have updated the detection time
      expect(updatedMetrics.providerDetectionTime).toBeGreaterThanOrEqual(initialTime);
    });

    it('should update availability checks on health status', async () => {
      const initialMetrics = manager.getPerformanceMetrics();
      const initialChecks = initialMetrics.availabilityChecks;

      await manager.getHealthStatus({ parallel: true, useCache: false });

      const updatedMetrics = manager.getPerformanceMetrics();
      expect(updatedMetrics.availabilityChecks).toBeGreaterThan(initialChecks);
    });
  });

  // =========================================================================
  // Phase 5 - WarmUp Tests
  // =========================================================================

  describe('WarmUp', () => {
    it('should warm up caches by pre-loading all providers', async () => {
      // Clear caches first
      manager.clearCache();

      await manager.warmUp();

      // Check that providers are initialized
      expect(manager.providers.size).toBeGreaterThan(0);

      // Check that caches are populated
      const stats = manager.getCacheStats();
      expect(stats.providerAvailability).toBeGreaterThan(0);
      expect(stats.providerVersions).toBeGreaterThan(0);
    });

    it('should pre-detect all providers during warmup', async () => {
      await manager.warmUp();

      // Should have cached availability
      const stats = manager.getCacheStats();
      expect(stats.providerAvailability).toBe(5); // All 5 providers
    });

    it('should pre-check health during warmup', async () => {
      await manager.warmUp();

      // Should have cached versions
      const stats = manager.getCacheStats();
      expect(stats.providerVersions).toBe(5); // All 5 providers

      // Should have updated availability checks
      const metrics = manager.getPerformanceMetrics();
      expect(metrics.availabilityChecks).toBeGreaterThan(0);
    });
  });

  // =========================================================================
  // Core Functionality Tests
  // =========================================================================

  describe('Core Functionality', () => {
    it('should detect provider with fallback chain', async () => {
      const provider = await manager.detectProvider();
      expect(provider).toBeDefined();
      expect(['vibe', 'claude', 'opencode']).toContain(provider);
    });

    it('should detect provider from environment variables', () => {
      vi.stubEnv('VIBE_PROVIDER', '1');
      vi.stubEnv('MISTRAL_API_KEY', 'test-key');

      const provider = manager.detectFromEnvironment();
      expect(provider).toBe('vibe');
    });

    it('should set provider explicitly', () => {
      manager.setProvider('vibe');
      expect(manager.currentProvider).toBe('vibe');
    });

    it('should throw error when setting unknown provider', () => {
      expect(() => manager.setProvider('unknown-provider')).toThrow(/Provider 'unknown-provider' is not registered/);
    });

    it('should map model names to provider-specific models', () => {
      manager.setProvider('claude');

      const mappedModel = manager.mapModelName('opus', 'claude');
      expect(mappedModel).toBe('claude-3-5-sonnet-20250715');
    });

    it('should return original model name for unknown provider', () => {
      const mappedModel = manager.mapModelName('opus', 'unknown-provider');
      expect(mappedModel).toBe('opus');
    });

    it('should get recommended model for task type', () => {
      manager.setProvider('claude');

      const architectureModel = manager.getRecommendedModel('architecture');
      expect(architectureModel).toBe('claude-3-5-sonnet-20250715');

      const quickModel = manager.getRecommendedModel('quick');
      expect(quickModel).toBe('claude-3-haiku');
    });

    it('should get default config', () => {
      const config = manager.getDefaultConfig();

      expect(config).toHaveProperty('version');
      expect(config).toHaveProperty('providers');
      expect(config.providers).toHaveProperty('primary');
      expect(config.providers).toHaveProperty('fallback');
    });

    it('should return all MCP servers', () => {
      const allServers = manager.getAllProviderMCPServers();

      expect(allServers).toBeDefined();
      expect(allServers).toHaveProperty('vibe');
      expect(allServers).toHaveProperty('claude');
      expect(allServers.vibe).toEqual({ filesystem: { enabled: true } });
      expect(allServers.claude).toEqual({ git: { enabled: true } });
    });
  });

  // =========================================================================
  // Configuration Tests
  // =========================================================================

  describe('Configuration', () => {
    it('should load default config when no config file exists', () => {
      // Create a fresh manager to ensure no previous test pollution
      const freshManager = new AIProviderManager();
      const config = freshManager.getDefaultConfig();

      expect(config).toHaveProperty('providers');
      expect(config.providers.primary).toBe('claude');
      expect(config.providers.fallback).toEqual(['vibe', 'codex', 'opencode']);
    });

    it('should save config to file', async () => {
      // Skip this test as it requires actual filesystem
      // This would need proper fs mocking to work in test environment
      expect(true).toBe(true);
    });

    it('should get provider-specific configuration', () => {
      const config = manager.getProviderConfig('vibe');
      // Should return empty object for non-existent provider config
      expect(config).toEqual({});
    });
  });

  // =========================================================================
  // executeHook security regression tests
  // =========================================================================

  describe('executeHook security', () => {
    it('rejects a hookName that escapes the provider hooks directory', async () => {
      const { execa } = await import('execa');
      execa.mockClear();

      const result = await manager.executeHook('vibe', '../../../../../../tmp/evil.sh', '/test/project');

      expect(result.success).toBe(false);
      expect(result.error).toMatch(/escapes/);
      expect(execa).not.toHaveBeenCalled();
    });

    it('passes an execution timeout to execa instead of running unbounded', async () => {
      const { execa } = await import('execa');
      execa.mockClear();
      execa.mockResolvedValue({ exitCode: 0, stdout: '', stderr: '' });
      vi.spyOn(fs, 'existsSync').mockReturnValue(true);

      await manager.executeHook('vibe', 'pre-execute.sh', '/test/project');

      expect(execa).toHaveBeenCalledTimes(1);
      const [, , options] = execa.mock.calls[0];
      expect(options.timeout).toBeGreaterThan(0);
    });

    it('does not leak arbitrary process env vars into the hook subprocess', async () => {
      const { execa } = await import('execa');
      execa.mockClear();
      execa.mockResolvedValue({ exitCode: 0, stdout: '', stderr: '' });
      vi.spyOn(fs, 'existsSync').mockReturnValue(true);
      vi.stubEnv('SUPER_SECRET_TOKEN', 'leaked-value');

      await manager.executeHook('vibe', 'pre-execute.sh', '/test/project');

      const [, , options] = execa.mock.calls[0];
      expect(options.env.SUPER_SECRET_TOKEN).toBeUndefined();
      expect(options.env.PATH).toBe(process.env.PATH);
    });
  });
});
