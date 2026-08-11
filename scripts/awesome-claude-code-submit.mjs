#!/usr/bin/env node
/**
 * awesome-claude-code submission helper.
 *
 * Prepares (but never submits) a resource recommendation for
 * `hesreallyhim/awesome-claude-code`. That repository FORBIDS automated
 * submissions: opening the Issue via `gh`/API gets the account auto-closed and
 * cooldown/banned (workflows `submission-enforcement-v2.yml`, Claude Haiku
 * detection, the `resource-submission` label is only settable by the web form).
 *
 * This script therefore automates only the legal parts:
 *   - sources canonical metadata from package.json + .claude-plugin/marketplace.json
 *   - computes the exact resource ID the upstream bot would generate
 *   - validates the project + npm URLs (HTTP 200)
 *   - checks for an existing entry in the upstream CSV
 *   - prints the ready-to-paste form values and a prefilled GitHub Issue URL
 *
 * The human opens the URL, reviews, ticks the checklist, and clicks Submit.
 *
 * Usage:
 *   node scripts/awesome-claude-code-submit.mjs            # print to stdout
 *   node scripts/awesome-claude-code-submit.mjs --write    # also refresh the audit prep file
 *
 * Exit codes: 0 = ready, 1 = a URL is unreachable or a duplicate already exists.
 *
 * @module scripts/awesome-claude-code-submit
 */

import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const UPSTREAM = 'https://github.com/hesreallyhim/awesome-claude-code';
const ISSUE_FORM = `${UPSTREAM}/issues/new?template=recommend-resource.yml`;
/**
 * Catalogue upstream, essayé dans l'ordre. Le fichier a été renommé
 * (`THE_RESOURCES_TABLE.csv` → `..._NEW.csv`) et l'ancien nom renvoie 404 : sans
 * repli, `findDuplicate` retombe silencieusement sur `unknown` et le contrôle
 * anti-doublon devient inopérant sans que rien ne le signale.
 */
export const CSV_CANDIDATES = [
  'https://raw.githubusercontent.com/hesreallyhim/awesome-claude-code/main/THE_RESOURCES_TABLE_NEW.csv',
  'https://raw.githubusercontent.com/hesreallyhim/awesome-claude-code/main/THE_RESOURCES_TABLE.csv',
];

const CATEGORY = 'Tooling';
const SUBCATEGORY = 'General';

// 1–3 sentences, no emoji (upstream form constraint). Kept under ~250 chars.
const DESCRIPTION =
  'Multi-stack framework for Claude Code: 11 technology stacks, 125 slash-commands across 15 namespaces, ' +
  '31 specialized agents, BMAD v6 sprint workflow, browser QA automation, and i18n in 5 languages. Installable via npx.';

// Evidence for the form's "validate_claims" field (required for frameworks).
const VALIDATE_CLAIMS =
  'Public npm package (@the-bearded-bear/claude-craft), MIT, 988 passing tests + mutation testing, ' +
  '11 stack-specific reviewers, BMAD v6 sprint workflow, and a strictly schema-valid plugin manifest.';

function readJson(relPath) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, relPath), 'utf8'));
}

function cleanRepoUrl(raw) {
  return String(raw || '')
    .replace(/^git\+/, '')
    .replace(/\.git$/, '');
}

function computeId(prefix, displayName, primaryLink) {
  const hash = createHash('sha256').update(`${displayName}${primaryLink}`).digest('hex').slice(0, 8);
  return `${prefix}-${hash}`;
}

function stamp(date) {
  const pad = (n) => String(n).padStart(2, '0');
  const d = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
  const t = `${pad(date.getHours())}-${pad(date.getMinutes())}-${pad(date.getSeconds())}`;
  return `${d}:${t}`;
}

async function urlOk(url) {
  try {
    const res = await fetch(url, { redirect: 'follow' });
    return res.status >= 200 && res.status < 400;
  } catch {
    return null; // network failure (distinct from a real non-200)
  }
}

export async function findDuplicate(displayName, primaryLink) {
  let csv;
  for (const url of CSV_CANDIDATES) {
    try {
      const res = await fetch(url, { redirect: 'follow' });
      if (res.status >= 200 && res.status < 300) {
        csv = await res.text();
        break;
      }
    } catch {
      // candidat injoignable : on tente le suivant
    }
  }
  // Aucun candidat n'a répondu : on ne prétend PAS qu'il n'y a pas de doublon.
  if (csv === undefined) return { status: 'unknown' };
  const needle = primaryLink.toLowerCase();
  const hit = csv
    .split('\n')
    .find(
      (line) => line.toLowerCase().includes(needle) || line.toLowerCase().includes(`,${displayName.toLowerCase()},`)
    );
  return hit ? { status: 'duplicate', line: hit } : { status: 'absent' };
}

function buildPrefilledUrl(fields) {
  const params = Object.entries(fields)
    .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
    .join('&');
  return `${ISSUE_FORM}&${params}`;
}

function csvLine(r) {
  // Header: ID,Display Name,Category,Sub-Category,Primary Link,Secondary Link,Author Name,Author Link,
  // Active,Date Added,Last Modified,Last Checked,License,Description,Removed From Origin,Stale,
  // Repo Created,Latest Release,Release Version,Release Source
  const desc = `"${r.description.replace(/"/g, '""')}"`;
  return [
    r.id,
    r.displayName,
    r.category,
    r.subcategory,
    r.primaryLink,
    '', // Secondary Link
    r.authorName,
    r.authorLink,
    'TRUE',
    r.dateAdded,
    '', // Last Modified
    '', // Last Checked
    r.license,
    desc,
    'FALSE', // Removed From Origin
    'FALSE', // Stale
    '', // Repo Created
    '', // Latest Release
    r.releaseVersion,
    'github-releases',
  ].join(',');
}

function render(r, prefilledUrl, dupStatus) {
  const lines = [];
  lines.push('= awesome-claude-code — submission prep (no auto-submit)');
  lines.push('');
  lines.push(`  Resource ID (upstream-compatible) : ${r.id}`);
  lines.push(`  Duplicate check                   : ${dupStatus}`);
  lines.push('');
  lines.push('  Form field values (paste / review in the web form):');
  lines.push(`    display_name : ${r.displayName}`);
  lines.push(`    category     : ${r.category}`);
  lines.push(`    subcategory  : ${r.subcategory}`);
  lines.push(`    primary_link : ${r.primaryLink}`);
  lines.push(`    author_name  : ${r.authorName}`);
  lines.push(`    author_link  : ${r.authorLink}`);
  lines.push(`    license      : ${r.license}`);
  lines.push(`    description  : ${r.description}`);
  lines.push(`    validate_claims : ${VALIDATE_CLAIMS}`);
  lines.push('');
  lines.push('  Reference CSV line (the upstream bot regenerates this — informative only):');
  lines.push(`    ${csvLine(r)}`);
  lines.push('');
  lines.push('  Prefilled GitHub Issue form (open in a browser, review, submit):');
  lines.push(`    ${prefilledUrl}`);
  lines.push('');
  lines.push('  ⚠ Submit ONLY through the web UI above. Do NOT use gh/API to open the Issue or a PR —');
  lines.push('    that violates the upstream Code of Conduct and triggers an auto-close + account cooldown/ban.');
  lines.push('    Keep at most one open issue in that repository at a time, and tick all checklist boxes.');
  return lines.join('\n');
}

function writePrepFile(body) {
  const dir = path.join(ROOT, 'audit', '2026-06-12');
  const file = path.join(dir, 'awesome-claude-code-submission.generated.md');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(file, `# awesome-claude-code — generated submission prep\n\n\`\`\`\n${body}\n\`\`\`\n`);
  return file;
}

async function main() {
  const write = process.argv.includes('--write');

  const pkg = readJson('package.json');
  const market = readJson('.claude-plugin/marketplace.json');
  const owner = market.owner || {};

  const primaryLink = cleanRepoUrl(pkg.repository && pkg.repository.url);
  const npmUrl = `https://www.npmjs.com/package/${pkg.name}`;
  // npmjs.com returns 403 to programmatic fetch (anti-bot); the registry API is the
  // reliable existence check. The submitted primary_link is the GitHub repo anyway.
  const npmRegistry = `https://registry.npmjs.org/${pkg.name}`;

  const resource = {
    displayName: 'claude-craft',
    category: CATEGORY,
    subcategory: SUBCATEGORY,
    primaryLink,
    authorName: owner.name || 'The Bearded CTO',
    authorLink: owner.url || 'https://the-bearded-bear.com',
    license: pkg.license || 'MIT',
    description: DESCRIPTION,
    releaseVersion: `v${pkg.version}`,
    dateAdded: stamp(new Date()),
    id: computeId('tool', 'claude-craft', primaryLink),
  };

  // Validate URLs. The GitHub primary link is the submitted one and must be reachable;
  // npm existence (via the registry) is a non-fatal sanity check.
  const [projectOk, npmPublished] = await Promise.all([urlOk(primaryLink), urlOk(npmRegistry)]);
  if (projectOk === false) {
    console.error(`✗ Project URL unreachable: ${primaryLink}`);
    process.exit(1);
  }
  if (npmPublished === false) {
    console.warn(`⚠ npm package not found on the registry: ${npmRegistry} (verify ${npmUrl} manually)`);
  }

  // Duplicate check.
  const dup = await findDuplicate(resource.displayName, resource.primaryLink);
  if (dup.status === 'duplicate') {
    console.error('✗ A matching entry already exists in the upstream CSV:');
    console.error(`  ${dup.line}`);
    process.exit(1);
  }
  const dupLabel =
    dup.status === 'absent' ? 'absent (ok to submit)' : 'unknown (could not fetch upstream CSV — verify manually)';

  const prefilledUrl = buildPrefilledUrl({
    display_name: resource.displayName,
    category: resource.category,
    subcategory: resource.subcategory,
    primary_link: resource.primaryLink,
    author_name: resource.authorName,
    author_link: resource.authorLink,
    license: resource.license,
    description: resource.description,
  });

  const body = render(resource, prefilledUrl, dupLabel);
  console.log(body);

  if (write) {
    const file = writePrepFile(body);
    console.log(`\n✓ Wrote ${path.relative(ROOT, file)}`);
  }
}

// Garde d'exécution : sans elle, `main()` partirait au moindre import et rendrait
// le module intestable (appels réseau + process.exit). Même motif que
// scripts/track-adoption-metrics.mjs et scripts/collect-claude-signals.mjs.
if (process.argv[1] && import.meta.url === `file://${process.argv[1]}`) {
  main().catch((err) => {
    console.error(`✗ ${err.message}`);
    process.exit(1);
  });
}
