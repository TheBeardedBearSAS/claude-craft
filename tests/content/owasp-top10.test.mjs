import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, '../..');

// Guard against a wrong OWASP Top 10:2025 ranking in the security rule loaded
// at every session. Audit freshness 2026-10-13: 8/10 categories were misnumbered
// and A08 was missing. Official list: https://owasp.org/Top10/2025/
const OFFICIAL_2025 = [
  /Broken Access Control/i,
  /Security Misconfiguration/i,
  /Software Supply Chain Failures/i,
  /Cryptographic Failures/i,
  /Injection/i,
  /Insecure Design/i,
  /Authentication Failures/i,
  /Software or Data Integrity Failures/i,
  /Logging (and|&) Alerting Failures/i,
  /Mishandling of Exceptional Conditions/i,
];

const FILES = [
  '.claude/rules/11-security.md',
  '.claude/references/base/security.md',
  ...['en', 'fr', 'es', 'de', 'pt'].map((l) => `Dev/i18n/${l}/Common/rules/11-security.md`),
];

// Collects "rank → title" from either a markdown table row (`| A01 | Title |`)
// or a heading (`### A01. Title`), keeping the first occurrence of each rank.
function extractRanking(content) {
  const ranking = new Map();
  const patterns = [/^\|\s*A?0?(\d{1,2})\s*\|\s*([^|]+)\|/gm, /^#{2,4}\s+A?0?(\d{1,2})[.:]?\s+(.+)$/gm];
  for (const re of patterns) {
    for (const [, rank, title] of content.matchAll(re)) {
      const n = Number(rank);
      if (n >= 1 && n <= 10 && !ranking.has(n)) ranking.set(n, title.trim());
    }
  }
  return ranking;
}

describe('OWASP Top 10:2025 ranking', () => {
  for (const file of FILES) {
    const content = fs.readFileSync(path.join(PROJECT_ROOT, file), 'utf8');

    it(`${file} follows the official A01–A10 order`, () => {
      const ranking = extractRanking(content);
      OFFICIAL_2025.forEach((expected, i) => {
        expect(ranking.get(i + 1), `${file} rank ${i + 1}`).toMatch(expected);
      });
    });

    it(`${file} no longer lists "Vulnerable and Outdated Components" as a 2025 category`, () => {
      const ranking = extractRanking(content);
      for (const title of ranking.values()) expect(title).not.toMatch(/Vulnerable and Outdated Components/i);
    });
  }
});

// /symfony:check-security still graded projects against the 2021 list
// (A03:2021 Injection, "Broken Authentication", "Sensitive Data Exposure").
const SYMFONY_CHECK_SECURITY = [
  // 9.0: the checklist moved behind `/symfony:check security`
  '.claude/references/symfony/checks/security.md',
  ...['en', 'fr', 'es', 'de', 'pt'].map((l) => `Dev/i18n/${l}/Symfony/checks/security.md`),
];

describe('/symfony:check-security uses OWASP Top 10:2025 only', () => {
  for (const file of SYMFONY_CHECK_SECURITY) {
    const content = fs.readFileSync(path.join(PROJECT_ROOT, file), 'utf8');

    it(`${file} has no 2021 category or label`, () => {
      expect(content).not.toMatch(/A\d{2}:2021/);
      expect(content).not.toMatch(/Broken Authentication|Sensitive Data Exposure/i);
    });

    it(`${file} summary follows the official A01–A10:2025 order`, () => {
      const summary = new Map([...content.matchAll(/^A(\d{2}):2025 - (.+?)\s+:/gm)].map(([, n, t]) => [Number(n), t]));
      OFFICIAL_2025.forEach((expected, i) => {
        expect(summary.get(i + 1), `${file} rank ${i + 1}`).toMatch(expected);
      });
    });
  }
});
