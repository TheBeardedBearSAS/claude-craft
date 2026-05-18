import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { rmSync, existsSync, readFileSync, mkdirSync } from 'node:fs';
import path from 'node:path';

const PROJECT_ROOT = path.resolve(import.meta.dirname, '../..');
const TEST_TMP_DIR = path.join(PROJECT_ROOT, '.test-tmp', 'adoption-metrics');
const SCRIPT = path.join(PROJECT_ROOT, 'scripts', 'track-adoption-metrics.mjs');

const NPM_MOCK = {
  package: '@the-bearded-bear/claude-craft',
  downloads: 1234,
  start: '2026-05-11',
  end: '2026-05-17',
};

const GITHUB_MOCK = {
  stargazers_count: 42,
  forks_count: 5,
  open_issues_count: 3,
  watchers_count: 8,
};

function makeFetchMock({ npmOk = true, githubOk = true } = {}) {
  return vi.fn((url) => {
    if (url.includes('npmjs.org')) {
      if (!npmOk) {
        return Promise.resolve({ ok: false, status: 503, statusText: 'Service Unavailable' });
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(NPM_MOCK),
      });
    }
    if (url.includes('api.github.com')) {
      if (!githubOk) {
        return Promise.resolve({ ok: false, status: 403, statusText: 'Forbidden' });
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(GITHUB_MOCK),
      });
    }
    return Promise.reject(new Error(`Unexpected URL: ${url}`));
  });
}

describe('track-adoption-metrics', () => {
  let collectMetrics;

  beforeEach(async () => {
    mkdirSync(TEST_TMP_DIR, { recursive: true });
    // Re-import each time to get a fresh module (vitest caches by default — use dynamic import)
    const mod = await import(`${SCRIPT}?t=${Date.now()}`);
    collectMetrics = mod.collectMetrics;
  });

  afterEach(() => {
    vi.restoreAllMocks();
    if (existsSync(TEST_TMP_DIR)) {
      rmSync(TEST_TMP_DIR, { recursive: true, force: true });
    }
  });

  it('writes a well-formed JSON file when both sources succeed', async () => {
    globalThis.fetch = makeFetchMock({ npmOk: true, githubOk: true });

    const now = new Date('2026-05-18T14:30:00Z');
    const result = await collectMetrics({ metricsDir: TEST_TMP_DIR, now });

    expect(result.date).toBe('2026-05-18');
    expect(result.timestamp).toBe('2026-05-18T14:30:00.000Z');

    expect(result.npm).toEqual({
      package: '@the-bearded-bear/claude-craft',
      downloads_last_week: 1234,
      period: { start: '2026-05-11', end: '2026-05-17' },
    });

    expect(result.github).toEqual({
      repo: 'the-bearded-cto/claude-craft',
      stars: 42,
      forks: 5,
      open_issues: 3,
      watchers: 8,
    });

    const outPath = path.join(TEST_TMP_DIR, 'adoption-2026-05-18.json');
    expect(existsSync(outPath)).toBe(true);

    const parsed = JSON.parse(readFileSync(outPath, 'utf8'));
    expect(parsed.npm.downloads_last_week).toBe(1234);
    expect(parsed.github.stars).toBe(42);
  });

  it('sets npm=null + npm_error when npm API fails, github still succeeds', async () => {
    globalThis.fetch = makeFetchMock({ npmOk: false, githubOk: true });

    const now = new Date('2026-05-18T10:00:00Z');
    const result = await collectMetrics({ metricsDir: TEST_TMP_DIR, now });

    expect(result.npm).toBeNull();
    expect(result.npm_error).toMatch(/503/);

    expect(result.github).not.toBeNull();
    expect(result.github.stars).toBe(42);

    const outPath = path.join(TEST_TMP_DIR, 'adoption-2026-05-18.json');
    const parsed = JSON.parse(readFileSync(outPath, 'utf8'));
    expect(parsed.npm).toBeNull();
    expect(parsed.npm_error).toBeDefined();
  });

  it('sets github=null + github_error when GitHub API fails, npm still succeeds', async () => {
    globalThis.fetch = makeFetchMock({ npmOk: true, githubOk: false });

    const now = new Date('2026-05-18T10:00:00Z');
    const result = await collectMetrics({ metricsDir: TEST_TMP_DIR, now });

    expect(result.github).toBeNull();
    expect(result.github_error).toMatch(/403/);

    expect(result.npm).not.toBeNull();
    expect(result.npm.downloads_last_week).toBe(1234);
  });

  it('creates the metrics directory if it does not exist', async () => {
    globalThis.fetch = makeFetchMock();

    const nestedDir = path.join(TEST_TMP_DIR, 'nested', 'deep');
    expect(existsSync(nestedDir)).toBe(false);

    const now = new Date('2026-05-18T10:00:00Z');
    await collectMetrics({ metricsDir: nestedDir, now });

    expect(existsSync(nestedDir)).toBe(true);
    expect(existsSync(path.join(nestedDir, 'adoption-2026-05-18.json'))).toBe(true);
  });
});
