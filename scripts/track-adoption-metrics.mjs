import { mkdir, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const PROJECT_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const METRICS_DIR = path.join(PROJECT_ROOT, '.bmad', 'metrics');
const NPM_URL =
  'https://api.npmjs.org/downloads/point/last-week/@the-bearded-bear/claude-craft';
const GITHUB_URL = 'https://api.github.com/repos/the-bearded-cto/claude-craft';

async function fetchNpm() {
  const res = await fetch(NPM_URL, { headers: { 'User-Agent': 'claude-craft-metrics/1.0' } });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  const data = await res.json();
  return {
    package: data.package,
    downloads_last_week: data.downloads,
    period: { start: data.start, end: data.end },
  };
}

async function fetchGitHub() {
  const headers = {
    'User-Agent': 'claude-craft-metrics/1.0',
    Accept: 'application/vnd.github+json',
  };
  if (process.env.GITHUB_TOKEN) {
    headers['Authorization'] = `Bearer ${process.env.GITHUB_TOKEN}`;
  }
  const res = await fetch(GITHUB_URL, { headers });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  const data = await res.json();
  return {
    repo: 'the-bearded-cto/claude-craft',
    stars: data.stargazers_count,
    forks: data.forks_count,
    open_issues: data.open_issues_count,
    watchers: data.watchers_count,
  };
}

export async function collectMetrics(opts = {}) {
  const metricsDir = opts.metricsDir ?? METRICS_DIR;
  const now = opts.now ?? new Date();
  const timestamp = now.toISOString();
  const date = timestamp.slice(0, 10);

  const result = { timestamp, date };

  const [npmResult, githubResult] = await Promise.allSettled([fetchNpm(), fetchGitHub()]);

  if (npmResult.status === 'fulfilled') {
    result.npm = npmResult.value;
  } else {
    result.npm = null;
    result.npm_error = `Failed to fetch npm downloads: ${npmResult.reason.message}`;
  }

  if (githubResult.status === 'fulfilled') {
    result.github = githubResult.value;
  } else {
    result.github = null;
    result.github_error = `Failed to fetch GitHub metrics: ${githubResult.reason.message}`;
  }

  if (!existsSync(metricsDir)) {
    await mkdir(metricsDir, { recursive: true });
  }

  const outPath = path.join(metricsDir, `adoption-${date}.json`);
  await writeFile(outPath, JSON.stringify(result, null, 2) + '\n', 'utf8');

  const npmSummary = result.npm ? `npm=${result.npm.downloads_last_week}` : 'npm=error';
  const starsSummary = result.github ? `stars=${result.github.stars}` : 'stars=error';
  console.log(`Adoption metrics saved: ${outPath} (${npmSummary}, ${starsSummary})`);

  return result;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  collectMetrics().catch((err) => {
    console.error('Fatal error:', err.message);
    process.exit(1);
  });
}
