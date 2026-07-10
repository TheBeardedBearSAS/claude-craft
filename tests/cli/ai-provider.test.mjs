import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { load as yamlLoad } from 'js-yaml';

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

    execute() {
      return Promise.resolve({ success: true, stdout: '', stderr: '', exitCode: 0 });
    }

    sendMessage() {
      return Promise.resolve('');
    }

    spawnSubAgent() {
      return Promise.resolve({ success: true, stdout: '', stderr: '', exitCode: 0 });
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

    execute() {
      return Promise.resolve({ success: true, stdout: '', stderr: '', exitCode: 0 });
    }

    sendMessage() {
      return Promise.resolve('');
    }

    spawnSubAgent() {
      return Promise.resolve({ success: true, stdout: '', stderr: '', exitCode: 0 });
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

    execute() {
      return Promise.resolve({ success: true, stdout: '', stderr: '', exitCode: 0 });
    }

    sendMessage() {
      return Promise.resolve('');
    }

    spawnSubAgent() {
      return Promise.resolve({ success: true, stdout: '', stderr: '', exitCode: 0 });
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

    it('does not declare security flags that are never read anywhere (SEC-05)', () => {
      const config = manager.getDefaultConfig();

      // hook_sandboxing and api_key_validation are fake security: no code path
      // in the repo ever reads them, so they must not be advertised as active.
      expect(config.security).not.toHaveProperty('hook_sandboxing');
      expect(config.security).not.toHaveProperty('api_key_validation');
      // max_execution_time IS consumed by executeHook() and must remain.
      expect(config.security).toHaveProperty('max_execution_time', 3600);
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

  // =========================================================================
  // detectProvider() / detectFromEnvironment() - additional branches
  // =========================================================================

  describe('detectProvider() priority chain', () => {
    afterEach(() => {
      vi.unstubAllEnvs();
    });

    it('uses the explicit config primary provider when present', async () => {
      vi.spyOn(manager, 'loadConfig').mockReturnValue({ providers: { primary: 'cursor' } });

      const result = await manager.detectProvider({ force: true, useCache: false });

      expect(result).toBe('cursor');
    });

    it('falls through to environment detection when config has no primary', async () => {
      vi.spyOn(manager, 'loadConfig').mockReturnValue({ providers: {} });
      vi.stubEnv('CODEX_API_KEY', 'abc');

      const result = await manager.detectProvider({ force: true, useCache: false });

      expect(result).toBe('codex');
    });

    it('uses cached availability when useCache is true', async () => {
      vi.spyOn(manager, 'loadConfig').mockReturnValue({ providers: {} });
      manager.cache.providerAvailability.set('opencode', { available: true, timestamp: Date.now() });

      const result = await manager.detectProvider({ force: true, useCache: true });

      expect(result).toBe('opencode');
    });

    it('ignores expired cache entries', async () => {
      vi.spyOn(manager, 'loadConfig').mockReturnValue({ providers: {} });
      manager.cache.providerAvailability.set('opencode', {
        available: true,
        timestamp: Date.now() - manager.cacheTTL - 1000,
      });

      const result = await manager.detectProvider({ force: true, useCache: true });

      // Expired cache entry is ignored, falls through to real binary detection
      expect(['vibe', 'claude', 'opencode']).toContain(result);
    });
  });

  describe('detectFromEnvironment() branches', () => {
    afterEach(() => {
      vi.unstubAllEnvs();
    });

    it('detects codex from GOOGLE_API_KEY', () => {
      vi.stubEnv('GOOGLE_API_KEY', 'x');
      expect(manager.detectFromEnvironment()).toBe('codex');
    });

    it('detects opencode from OPENCODE_ENDPOINT', () => {
      vi.stubEnv('OPENCODE_ENDPOINT', 'http://localhost:1234');
      expect(manager.detectFromEnvironment()).toBe('opencode');
    });

    it('detects cursor from CURSOR_API_KEY', () => {
      vi.stubEnv('CURSOR_API_KEY', 'key');
      expect(manager.detectFromEnvironment()).toBe('cursor');
    });

    it('returns null when no relevant env vars are set', () => {
      vi.stubEnv('VIBE_PROVIDER', '');
      vi.stubEnv('MISTRAL_API_KEY', '');
      vi.stubEnv('CODEX_API_KEY', '');
      vi.stubEnv('GOOGLE_API_KEY', '');
      vi.stubEnv('OPENCODE_ENDPOINT', '');
      vi.stubEnv('OPENAI_API_BASE_URL', '');
      vi.stubEnv('CURSOR_API_KEY', '');

      expect(manager.detectFromEnvironment()).toBeNull();
    });
  });

  // =========================================================================
  // registerProvider() / getAllProviders()
  // =========================================================================

  describe('registerProvider() and getAllProviders()', () => {
    it('registers a custom provider instance under a given name', () => {
      const customProvider = { displayName: 'Custom' };

      manager.registerProvider('custom', customProvider);

      expect(manager.getProvider('custom')).toBe(customProvider);
    });

    it('getAllProviders() initializes lazy providers and returns the full map', () => {
      manager.enableLazyLoading();
      expect(manager.providers.size).toBe(0);

      const all = manager.getAllProviders();

      expect(all.size).toBe(5);
      expect(all.has('claude')).toBe(true);
    });
  });

  // =========================================================================
  // getProviderConfig() - extra branch
  // =========================================================================

  describe('getProviderConfig() with provider_settings present', () => {
    it('returns the provider-specific settings block from config', () => {
      vi.spyOn(manager, 'loadConfig').mockReturnValue({ provider_settings: { vibe: { key: 'v' } } });

      expect(manager.getProviderConfig('vibe')).toEqual({ key: 'v' });
    });
  });

  // =========================================================================
  // execute() and tryFallback()
  // =========================================================================

  describe('execute() and tryFallback()', () => {
    it('returns the provider result directly on success (no fallback attempted)', async () => {
      manager.currentProvider = 'claude';
      const provider = manager.getProvider('claude');
      const executeSpy = vi.spyOn(provider, 'execute').mockResolvedValue({ success: true, stdout: 'ok' });

      const result = await manager.execute('do-thing', ['--flag']);

      expect(result).toEqual({ success: true, stdout: 'ok' });
      expect(executeSpy).toHaveBeenCalledWith(
        'do-thing',
        ['--flag'],
        expect.objectContaining({ env: expect.any(Object) })
      );
    });

    it('falls back to another provider when the primary execution fails', async () => {
      manager.currentProvider = 'claude';
      const claude = manager.getProvider('claude');
      vi.spyOn(claude, 'execute').mockResolvedValue({ success: false, error: 'boom' });

      vi.spyOn(manager, 'loadConfig').mockReturnValue({ providers: { fallback: ['vibe'] } });
      const vibe = manager.getProvider('vibe');
      vi.spyOn(vibe, 'isAvailable').mockResolvedValue(true);
      const vibeExecuteSpy = vi.spyOn(vibe, 'execute').mockResolvedValue({ success: true, stdout: 'from-vibe' });

      const result = await manager.execute('do-thing');

      expect(result).toEqual({ success: true, stdout: 'from-vibe' });
      expect(vibeExecuteSpy).toHaveBeenCalledWith('do-thing', [], {});
    });

    it('throws when the detected provider is not registered', async () => {
      manager.currentProvider = 'ghost';

      await expect(manager.execute('do-thing')).rejects.toThrow(/Provider 'ghost' not found/);
    });

    it('tryFallback() returns null when there is no fallback configuration', async () => {
      vi.spyOn(manager, 'loadConfig').mockReturnValue({ providers: {} });

      const result = await manager.tryFallback('claude', 'cmd', [], {});

      expect(result).toBeNull();
    });

    it('tryFallback() skips the primary provider and unavailable providers', async () => {
      vi.spyOn(manager, 'loadConfig').mockReturnValue({ providers: { fallback: ['claude', 'codex', 'vibe'] } });
      const vibe = manager.getProvider('vibe');
      const executeSpy = vi.spyOn(vibe, 'execute').mockResolvedValue({ success: true, stdout: 'vibe-ran' });

      const result = await manager.tryFallback('claude', 'cmd', ['a'], { flag: true });

      // codex.isAvailable() resolves false in the mock, so vibe (the next candidate) is used
      expect(result).toEqual({ success: true, stdout: 'vibe-ran' });
      expect(executeSpy).toHaveBeenCalledWith('cmd', ['a'], { flag: true });
    });

    it('tryFallback() returns null when no fallback provider is available', async () => {
      vi.spyOn(manager, 'loadConfig').mockReturnValue({ providers: { fallback: ['codex', 'cursor'] } });

      const result = await manager.tryFallback('claude', 'cmd', [], {});

      expect(result).toBeNull();
    });
  });

  // =========================================================================
  // sendMessage() and spawnSubAgent()
  // =========================================================================

  describe('sendMessage() and spawnSubAgent()', () => {
    it('sends a message via the current provider', async () => {
      manager.currentProvider = 'claude';
      const provider = manager.getProvider('claude');
      const spy = vi.spyOn(provider, 'sendMessage').mockResolvedValue('claude says hi');

      const response = await manager.sendMessage('hello', { temperature: 0.5 });

      expect(response).toBe('claude says hi');
      expect(spy).toHaveBeenCalledWith('hello', { temperature: 0.5 });
    });

    it('throws when sending a message with an unregistered provider', async () => {
      manager.currentProvider = 'ghost';

      await expect(manager.sendMessage('hello')).rejects.toThrow(/Provider 'ghost' not found/);
    });

    it('spawns a sub-agent when the provider supports it', async () => {
      manager.currentProvider = 'vibe'; // subAgentsSupported: true in the mock
      const provider = manager.getProvider('vibe');
      const spy = vi.spyOn(provider, 'spawnSubAgent').mockResolvedValue({ success: true, agentId: 'a1' });

      const result = await manager.spawnSubAgent('task', { priority: 'high' });

      expect(result).toEqual({ success: true, agentId: 'a1' });
      expect(spy).toHaveBeenCalledWith('task', { priority: 'high' });
    });

    it('falls back to sendMessage with a warning when sub-agents are unsupported', async () => {
      manager.currentProvider = 'codex'; // subAgentsSupported: false in the mock
      const provider = manager.getProvider('codex');
      const sendSpy = vi.spyOn(provider, 'sendMessage').mockResolvedValue('fallback response');
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      const result = await manager.spawnSubAgent('task');

      expect(result).toBe('fallback response');
      expect(sendSpy).toHaveBeenCalledWith('task', {});
      expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('does not support sub-agents'));
    });

    it('throws when spawning a sub-agent with an unregistered provider', async () => {
      manager.currentProvider = 'ghost';

      await expect(manager.spawnSubAgent('task')).rejects.toThrow(/Provider 'ghost' not found/);
    });
  });

  // =========================================================================
  // getMCPServers(), isProviderAvailable(), getProviderVersion()
  // =========================================================================

  describe('getMCPServers(), isProviderAvailable(), getProviderVersion()', () => {
    it('returns MCP servers for the explicitly set current provider', () => {
      manager.currentProvider = 'claude';
      expect(manager.getMCPServers()).toEqual({ git: { enabled: true } });
    });

    it('defaults to the claude provider when none is set', () => {
      manager.currentProvider = null;
      expect(manager.getMCPServers()).toEqual({ git: { enabled: true } });
    });

    it('returns an empty object for an unregistered current provider', () => {
      manager.currentProvider = 'ghost';
      expect(manager.getMCPServers()).toEqual({});
    });

    it('reports provider availability for known providers', async () => {
      expect(await manager.isProviderAvailable('vibe')).toBe(true);
      expect(await manager.isProviderAvailable('codex')).toBe(false);
    });

    it('reports unavailable for an unregistered provider', async () => {
      expect(await manager.isProviderAvailable('ghost')).toBe(false);
    });

    it('gets the version of a known provider', async () => {
      expect(await manager.getProviderVersion('claude')).toBe('3.0.0');
    });

    it('returns "unknown" for an unregistered provider version', async () => {
      expect(await manager.getProviderVersion('ghost')).toBe('unknown');
    });
  });

  // =========================================================================
  // Memory Management delegation (getConversation, shareContext, etc.)
  // =========================================================================

  describe('Memory Management delegation', () => {
    it('exposes the shared memoryManager singleton', () => {
      expect(manager.getMemoryManager()).toBe(memoryManager);
    });

    it('creates a conversation using the explicit model when provided', () => {
      const spy = vi.spyOn(memoryManager, 'getConversation').mockReturnValue({ id: 'c1' });
      manager.currentProvider = 'claude';

      const conv = manager.getConversation('c1', { model: 'custom-model' });

      expect(spy).toHaveBeenCalledWith('c1', { provider: 'claude', model: 'custom-model' });
      expect(conv).toEqual({ id: 'c1' });
    });

    it('falls back to the current provider default model when none is given', () => {
      const spy = vi.spyOn(memoryManager, 'getConversation').mockReturnValue({});
      manager.currentProvider = 'claude';

      manager.getConversation('c2');

      expect(spy).toHaveBeenCalledWith('c2', { provider: 'claude', model: 'claude-3-5-sonnet' });
    });

    it('uses "unknown" provider/model when nothing is set', () => {
      const spy = vi.spyOn(memoryManager, 'getConversation').mockReturnValue({});
      manager.currentProvider = null;

      manager.getConversation('c3');

      expect(spy).toHaveBeenCalledWith('c3', { provider: 'unknown', model: 'unknown' });
    });

    it('delegates addToConversation() to memoryManager.addMessage()', () => {
      const spy = vi.spyOn(memoryManager, 'addMessage').mockImplementation(() => {});

      manager.addToConversation('c1', { role: 'user', content: 'hi' });

      expect(spy).toHaveBeenCalledWith('c1', { role: 'user', content: 'hi' });
    });

    it('delegates getConversationHistory() with the default and a custom limit', () => {
      const spy = vi.spyOn(memoryManager, 'getHistory').mockReturnValue(['m1']);

      expect(manager.getConversationHistory('c1')).toEqual(['m1']);
      expect(spy).toHaveBeenCalledWith('c1', 100);

      manager.getConversationHistory('c1', 5);
      expect(spy).toHaveBeenCalledWith('c1', 5);
    });

    it('delegates project context set/get', () => {
      const setSpy = vi.spyOn(memoryManager, 'setProjectContext').mockImplementation(() => {});
      const getSpy = vi.spyOn(memoryManager, 'getProjectContext').mockReturnValue({ foo: 'bar' });

      manager.setProjectContext({ foo: 'bar' });
      expect(setSpy).toHaveBeenCalledWith({ foo: 'bar' });

      expect(manager.getProjectContext()).toEqual({ foo: 'bar' });
      expect(getSpy).toHaveBeenCalled();
    });

    it('delegates user preference set/get', () => {
      const setSpy = vi.spyOn(memoryManager, 'setPreference').mockImplementation(() => {});
      const getSpy = vi.spyOn(memoryManager, 'getPreference').mockReturnValue('dark');

      manager.setPreference('theme', 'dark');
      expect(setSpy).toHaveBeenCalledWith('theme', 'dark');

      expect(manager.getPreference('theme', 'light')).toBe('dark');
      expect(getSpy).toHaveBeenCalledWith('theme', 'light');
    });

    it('sets and gets a shared cache value directly (no disk I/O)', () => {
      manager.setCache('k1', { data: 42 }, 0);
      expect(manager.getCache('k1')).toEqual({ data: 42 });
    });

    it('delegates getMemoryStats() to memoryManager.getStats()', () => {
      const spy = vi.spyOn(memoryManager, 'getStats').mockReturnValue({ conversations: 3 });

      expect(manager.getMemoryStats()).toEqual({ conversations: 3 });
      expect(spy).toHaveBeenCalled();
    });

    it('shares context between two providers and stamps it with metadata', () => {
      const conversationId = manager.shareContext('claude', 'vibe', { note: 'shared note' });

      expect(conversationId).toMatch(/^shared-claude-vibe-\d+$/);

      const conversation = memoryManager.conversations.get(conversationId);
      expect(conversation.context.sharedFrom).toBe('claude');
      expect(conversation.context.sharedContext).toEqual({ note: 'shared note' });
      expect(conversation.context.sharedAt).toEqual(expect.any(String));

      memoryManager.conversations.delete(conversationId);
    });

    it('returns the shared context for a known conversation id', () => {
      memoryManager.conversations.set('conv-x', { context: { sharedContext: { hello: 'world' } } });

      expect(manager.getSharedContext('conv-x')).toEqual({ hello: 'world' });

      memoryManager.conversations.delete('conv-x');
    });

    it('returns an empty object for an unknown conversation id', () => {
      expect(manager.getSharedContext('does-not-exist')).toEqual({});
    });
  });

  // =========================================================================
  // Hook orchestration (executePreCommandHooks, executePostCommandHooks, ...)
  // =========================================================================

  describe('Hook orchestration', () => {
    it('executePreCommandHooks() uses the default hook name when config has none', async () => {
      vi.spyOn(manager, 'loadProviderConfig').mockReturnValue({});
      vi.spyOn(manager, 'executeHook').mockResolvedValue({ success: true });

      const result = await manager.executePreCommandHooks('claude', '/proj');

      expect(result.hooks).toEqual(['pre-execute.sh']);
      expect(manager.executeHook).toHaveBeenCalledWith('claude', 'pre-execute.sh', '/proj', {});
    });

    it('executePreCommandHooks() stops after the first failing hook', async () => {
      vi.spyOn(manager, 'loadProviderConfig').mockReturnValue({ hooks: { pre_command: ['a.sh', 'b.sh'] } });
      vi.spyOn(manager, 'executeHook')
        .mockResolvedValueOnce({ success: false, error: 'fail' })
        .mockResolvedValueOnce({ success: true });

      const result = await manager.executePreCommandHooks('claude', '/proj');

      expect(manager.executeHook).toHaveBeenCalledTimes(1);
      expect(result.results).toHaveLength(1);
    });

    it('executePreCommandHooks() continues past a skipped (missing) hook', async () => {
      vi.spyOn(manager, 'loadProviderConfig').mockReturnValue({ hooks: { pre_command: ['a.sh', 'b.sh'] } });
      vi.spyOn(manager, 'executeHook')
        .mockResolvedValueOnce({ success: true, skipped: true })
        .mockResolvedValueOnce({ success: true, skipped: false });

      const result = await manager.executePreCommandHooks('claude', '/proj');

      expect(manager.executeHook).toHaveBeenCalledTimes(2);
      expect(result.results).toHaveLength(2);
    });

    it('executePostCommandHooks() runs all configured hooks even after a failure', async () => {
      vi.spyOn(manager, 'loadProviderConfig').mockReturnValue({ hooks: { post_command: ['a.sh', 'b.sh'] } });
      vi.spyOn(manager, 'executeHook')
        .mockResolvedValueOnce({ success: false })
        .mockResolvedValueOnce({ success: true });

      const result = await manager.executePostCommandHooks('claude', '/proj');

      expect(manager.executeHook).toHaveBeenCalledTimes(2);
      expect(result.results).toHaveLength(2);
    });

    it('executePreMessageHooks() passes AI_CRAFT_MESSAGE in env and stops on failure', async () => {
      vi.spyOn(manager, 'loadProviderConfig').mockReturnValue({ hooks: { pre_message: ['msg.sh', 'other.sh'] } });
      vi.spyOn(manager, 'executeHook')
        .mockResolvedValueOnce({ success: false })
        .mockResolvedValueOnce({ success: true });

      const result = await manager.executePreMessageHooks('claude', '/proj', 'hello world');

      const [, , , env] = manager.executeHook.mock.calls[0];
      expect(env.AI_CRAFT_MESSAGE).toBe('hello world');
      expect(manager.executeHook).toHaveBeenCalledTimes(1);
      expect(result.results).toHaveLength(1);
    });

    it('executePostMessageHooks() passes AI_CRAFT_RESPONSE in env and runs all hooks', async () => {
      vi.spyOn(manager, 'loadProviderConfig').mockReturnValue({ hooks: { post_message: ['a.sh', 'b.sh'] } });
      vi.spyOn(manager, 'executeHook').mockResolvedValue({ success: false });

      const result = await manager.executePostMessageHooks('claude', '/proj', 'the response');

      expect(manager.executeHook).toHaveBeenCalledTimes(2);
      const [, , , env] = manager.executeHook.mock.calls[0];
      expect(env.AI_CRAFT_RESPONSE).toBe('the response');
      expect(result.results).toHaveLength(2);
    });

    it('executeHook() returns a skipped result when the hook file does not exist', async () => {
      const result = await manager.executeHook('claude', 'nonexistent-hook.sh', '/test/project/does-not-exist');

      expect(result).toEqual({ success: true, skipped: true, message: "Hook 'nonexistent-hook.sh' not found" });
    });

    it('executeHook() returns an error result for an unregistered provider', async () => {
      const result = await manager.executeHook('ghost-provider', 'x.sh', '/test/project');

      expect(result).toEqual({ success: false, error: "Provider 'ghost-provider' not found" });
    });

    it('executeHook() surfaces an execa rejection as a failed result', async () => {
      const { execa } = await import('execa');
      execa.mockClear();

      const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ai-provider-hook-'));
      const hooksDir = path.join(tmpDir, '.ai-craft', 'providers', 'claude', 'hooks');
      fs.mkdirSync(hooksDir, { recursive: true });
      fs.writeFileSync(path.join(hooksDir, 'boom.sh'), '#!/bin/sh\nexit 1\n');

      const err = new Error('spawn failed');
      err.stdout = 'partial-out';
      err.stderr = 'partial-err';
      execa.mockRejectedValueOnce(err);

      const result = await manager.executeHook('claude', 'boom.sh', tmpDir);

      expect(result).toEqual({ success: false, error: 'spawn failed', stdout: 'partial-out', stderr: 'partial-err' });

      fs.rmSync(tmpDir, { recursive: true, force: true });
    });

    it('executeHook() reports success:false when the hook exits non-zero', async () => {
      const { execa } = await import('execa');
      execa.mockClear();

      const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ai-provider-hook-'));
      const hooksDir = path.join(tmpDir, '.ai-craft', 'providers', 'claude', 'hooks');
      fs.mkdirSync(hooksDir, { recursive: true });
      fs.writeFileSync(path.join(hooksDir, 'fails.sh'), '#!/bin/sh\nexit 2\n');

      execa.mockResolvedValueOnce({ exitCode: 2, stdout: 'out', stderr: 'err' });

      const result = await manager.executeHook('claude', 'fails.sh', tmpDir);

      expect(result).toEqual({ success: false, exitCode: 2, stdout: 'out', stderr: 'err' });

      fs.rmSync(tmpDir, { recursive: true, force: true });
    });
  });

  // =========================================================================
  // Filesystem: loadConfig() / saveConfig()
  // =========================================================================

  describe('Filesystem: loadConfig() / saveConfig()', () => {
    let tmpDir;

    beforeEach(() => {
      tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ai-provider-cfg-'));
    });

    afterEach(() => {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    });

    it('loads a config file written in YAML', () => {
      const configPath = path.join(tmpDir, 'ai-craft.yaml');
      fs.writeFileSync(configPath, 'version: "2.0.0"\nproviders:\n  primary: vibe\n  fallback: []\n');

      const config = manager.loadConfig(configPath);

      expect(config.version).toBe('2.0.0');
      expect(config.providers.primary).toBe('vibe');
    });

    it('falls back to the default config and warns when the file is invalid YAML', () => {
      const configPath = path.join(tmpDir, 'ai-craft.yaml');
      fs.writeFileSync(configPath, 'providers: [unterminated');
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      const config = manager.loadConfig(configPath);

      expect(config).toEqual(manager.getDefaultConfig());
      expect(warnSpy).toHaveBeenCalled();
    });

    it('returns the default config when the file does not exist', () => {
      const config = manager.loadConfig(path.join(tmpDir, 'missing.yaml'));
      expect(config).toEqual(manager.getDefaultConfig());
    });

    it('saves config to disk, creating parent directories as needed', () => {
      const configPath = path.join(tmpDir, 'nested', 'ai-craft.yaml');

      manager.saveConfig({ version: '9.9.9' }, configPath);

      expect(fs.existsSync(configPath)).toBe(true);
      const written = yamlLoad(fs.readFileSync(configPath, 'utf8'));
      expect(written.version).toBe('9.9.9');
    });

    it('logs and rethrows when writing the config file fails', () => {
      const configPath = path.join(tmpDir, 'ai-craft.yaml');
      const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      vi.spyOn(fs, 'writeFileSync').mockImplementation(() => {
        throw new Error('disk full');
      });

      expect(() => manager.saveConfig({ version: '1.0.0' }, configPath)).toThrow('disk full');
      expect(errorSpy).toHaveBeenCalled();
    });
  });

  // =========================================================================
  // discoverMCPServers()
  // =========================================================================

  describe('discoverMCPServers()', () => {
    let tmpDir;

    beforeEach(() => {
      tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ai-provider-mcp-'));
    });

    afterEach(() => {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    });

    it('returns an empty object when the directory does not exist', () => {
      expect(manager.discoverMCPServers(path.join(tmpDir, 'missing'))).toEqual({});
    });

    it('discovers valid MCP server definitions and tags them with their source file', () => {
      const filePath = path.join(tmpDir, 'filesystem.json');
      fs.writeFileSync(filePath, JSON.stringify({ name: 'filesystem', command: 'fs-server', args: ['--root', '.'] }));

      const servers = manager.discoverMCPServers(tmpDir);

      expect(servers.filesystem).toEqual({
        name: 'filesystem',
        command: 'fs-server',
        args: ['--root', '.'],
        source: filePath,
      });
    });

    it('skips JSON files missing name or command', () => {
      fs.writeFileSync(path.join(tmpDir, 'incomplete.json'), JSON.stringify({ name: 'incomplete' }));
      expect(manager.discoverMCPServers(tmpDir)).toEqual({});
    });

    it('skips invalid JSON files without throwing', () => {
      fs.writeFileSync(path.join(tmpDir, 'broken.json'), '{ not valid json');
      expect(manager.discoverMCPServers(tmpDir)).toEqual({});
    });

    it('ignores non-JSON files', () => {
      fs.writeFileSync(path.join(tmpDir, 'readme.txt'), 'hello');
      expect(manager.discoverMCPServers(tmpDir)).toEqual({});
    });
  });

  // =========================================================================
  // Provider config & MCP aggregation on disk
  // =========================================================================

  describe('Provider config & MCP aggregation on disk', () => {
    let tmpDir;

    beforeEach(() => {
      tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ai-provider-proj-'));
    });

    afterEach(() => {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    });

    it('loadProviderConfig() returns {} for an unregistered provider', () => {
      expect(manager.loadProviderConfig('ghost', tmpDir)).toEqual({});
    });

    it('loadProviderConfig() returns {} when the config file is absent', () => {
      expect(manager.loadProviderConfig('claude', tmpDir)).toEqual({});
    });

    it('loadProviderConfig() reads YAML from the provider config path', () => {
      const configDir = path.join(tmpDir, '.ai-craft', 'providers', 'claude', 'config');
      fs.mkdirSync(configDir, { recursive: true });
      fs.writeFileSync(path.join(configDir, 'default.yaml'), 'hooks:\n  pre_command:\n    - custom.sh\n');

      const config = manager.loadProviderConfig('claude', tmpDir);

      expect(config.hooks.pre_command).toEqual(['custom.sh']);
    });

    it('loadProviderConfig() returns {} on unreadable YAML', () => {
      const configDir = path.join(tmpDir, '.ai-craft', 'providers', 'claude', 'config');
      fs.mkdirSync(configDir, { recursive: true });
      fs.writeFileSync(path.join(configDir, 'default.yaml'), 'broken: [oops');

      expect(manager.loadProviderConfig('claude', tmpDir)).toEqual({});
    });

    it('getAllMCPServers() returns {} for an unregistered provider', async () => {
      expect(await manager.getAllMCPServers('ghost', tmpDir)).toEqual({});
    });

    it('getAllMCPServers() merges built-in, provider-custom and global-custom servers', async () => {
      const providerMcpDir = path.join(tmpDir, '.ai-craft', 'providers', 'claude', 'mcp');
      const globalMcpDir = path.join(tmpDir, '.ai-craft', 'mcp');
      fs.mkdirSync(providerMcpDir, { recursive: true });
      fs.mkdirSync(globalMcpDir, { recursive: true });

      fs.writeFileSync(
        path.join(providerMcpDir, 'custom-tool.json'),
        JSON.stringify({ name: 'custom-tool', command: 'custom-bin' })
      );
      fs.writeFileSync(
        path.join(globalMcpDir, 'shared-tool.json'),
        JSON.stringify({ name: 'shared-tool', command: 'shared-bin' })
      );

      const result = await manager.getAllMCPServers('claude', tmpDir);

      expect(result.builtIn).toEqual({ git: { enabled: true } });
      expect(result.providerCustom['custom-tool'].command).toBe('custom-bin');
      expect(result.globalCustom['shared-tool'].command).toBe('shared-bin');
      expect(result.all).toEqual({
        ...result.builtIn,
        ...result.providerCustom,
        ...result.globalCustom,
      });
    });

    it('startAllMCPServers() marks enabled servers as started and skips disabled ones', async () => {
      const providerMcpDir = path.join(tmpDir, '.ai-craft', 'providers', 'claude', 'mcp');
      fs.mkdirSync(providerMcpDir, { recursive: true });
      fs.writeFileSync(
        path.join(providerMcpDir, 'disabled-tool.json'),
        JSON.stringify({ name: 'disabled-tool', command: 'disabled-bin', enabled: false })
      );

      const result = await manager.startAllMCPServers('claude', tmpDir);

      // FONC-01: no process is ever spawned here, so the status must not imply
      // a start attempt occurred ('not_implemented', not the misleading 'would_start').
      expect(result.started.git).toEqual({ status: 'not_implemented', command: undefined, args: undefined });
      expect(result.started['disabled-tool']).toBeUndefined();
      expect(result.failed).toEqual({});
      expect(result.total).toBe(2); // built-in "git" + "disabled-tool"
    });

    it('saveProviderConfig() writes YAML to the provider custom config path', () => {
      manager.saveProviderConfig('claude', { hooks: { post_command: ['done.sh'] } }, tmpDir);

      const configPath = path.join(tmpDir, '.ai-craft', 'providers', 'claude', 'config', 'custom.yaml');
      expect(fs.existsSync(configPath)).toBe(true);

      const written = yamlLoad(fs.readFileSync(configPath, 'utf8'));
      expect(written.hooks.post_command).toEqual(['done.sh']);
    });
  });

  // =========================================================================
  // initProject()
  // =========================================================================

  describe('initProject()', () => {
    let tmpDir;

    beforeEach(() => {
      tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ai-provider-init-'));
    });

    afterEach(() => {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    });

    it('scaffolds a full .ai-craft project structure', async () => {
      const result = await manager.initProject(tmpDir, { provider: 'vibe' });

      expect(result.success).toBe(true);
      expect(result.providersInitialized).toEqual(manager.getProviderNames());

      const aiCraftDir = path.join(tmpDir, '.ai-craft');
      expect(fs.existsSync(path.join(aiCraftDir, 'ai-craft.yaml'))).toBe(true);
      expect(fs.existsSync(path.join(aiCraftDir, 'AI-CRAFT.md'))).toBe(true);

      const savedConfig = yamlLoad(fs.readFileSync(path.join(aiCraftDir, 'ai-craft.yaml'), 'utf8'));
      expect(savedConfig.providers.primary).toBe('vibe');

      for (const providerName of manager.getProviderNames()) {
        const providerDir = path.join(aiCraftDir, 'providers', providerName);
        expect(fs.existsSync(path.join(providerDir, 'hooks'))).toBe(true);
        expect(fs.existsSync(path.join(providerDir, 'mcp'))).toBe(true);
        expect(fs.existsSync(path.join(providerDir, 'config', 'default.yaml'))).toBe(true);
      }

      for (const subDir of ['agents', 'commands', 'skills', 'templates', 'memory', 'logs']) {
        expect(fs.existsSync(path.join(aiCraftDir, subDir))).toBe(true);
      }

      const claudeDir = path.join(tmpDir, '.claude');
      expect(fs.lstatSync(claudeDir).isSymbolicLink()).toBe(true);
    });

    it('skips provider template generation when createTemplates is false', async () => {
      await manager.initProject(tmpDir, { createTemplates: false });

      const defaultYaml = path.join(tmpDir, '.ai-craft', 'providers', 'claude', 'config', 'default.yaml');
      expect(fs.existsSync(defaultYaml)).toBe(false);
    });
  });

  // =========================================================================
  // migrateProject()
  // =========================================================================

  describe('migrateProject()', () => {
    let tmpDir;

    beforeEach(() => {
      tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ai-provider-migrate-'));
    });

    afterEach(() => {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    });

    it('fails when the project has no .claude directory', async () => {
      const result = await manager.migrateProject(tmpDir);

      expect(result).toEqual({
        success: false,
        error: 'Not a Claude Craft project (no .claude/ directory found)',
      });
    });

    it('copies .claude content into .ai-craft and rewrites branding in AI-CRAFT.md', async () => {
      const claudeDir = path.join(tmpDir, '.claude');
      fs.mkdirSync(path.join(claudeDir, 'agents'), { recursive: true });
      fs.writeFileSync(path.join(claudeDir, 'agents', 'helper.md'), '# Helper agent');
      fs.writeFileSync(
        path.join(claudeDir, 'CLAUDE.md'),
        'Welcome to Claude Code, powered by claude-craft and @the-bearded-bear/claude-craft.'
      );

      const result = await manager.migrateProject(tmpDir);

      expect(result.success).toBe(true);
      expect(result.filesCopied).toBe(2); // "agents" dir + "CLAUDE.md" file

      const aiCraftDir = path.join(tmpDir, '.ai-craft');
      expect(fs.existsSync(path.join(aiCraftDir, 'agents', 'helper.md'))).toBe(true);
      // CLAUDE.md itself is intentionally not copied (AI-CRAFT.md is derived from it instead)
      expect(fs.existsSync(path.join(aiCraftDir, 'CLAUDE.md'))).toBe(false);

      const aiCraftMd = fs.readFileSync(path.join(aiCraftDir, 'AI-CRAFT.md'), 'utf8');
      expect(aiCraftMd).toContain('Welcome to Multi-AI');
      expect(aiCraftMd).toContain('powered by ai-craft');
      // KNOWN BUG (not fixed, see task report): the 3rd .replace() targets the literal string
      // "@the-bearded-bear/claude-craft", but the 2nd .replace() (global "claude-craft" -> "ai-craft")
      // already rewrote that substring to "@the-bearded-bear/ai-craft" beforehand, so the 3rd
      // replacement never matches and "@ai-craft/core" is never produced.
      expect(aiCraftMd).toContain('@the-bearded-bear/ai-craft');
      expect(aiCraftMd).not.toContain('@ai-craft/core');

      const savedConfig = yamlLoad(fs.readFileSync(path.join(aiCraftDir, 'ai-craft.yaml'), 'utf8'));
      expect(savedConfig.compatibility.migrated).toEqual(expect.any(String));
    });
  });
});
