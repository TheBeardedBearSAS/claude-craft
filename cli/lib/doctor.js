/**
 * CLI `doctor` command — environment diagnostics & installation health check.
 * @module cli/lib/doctor
 */

import fs from 'fs';
import path from 'path';
import os from 'os';
import { execSync } from 'child_process';
import c from './colors.js';
import { listDirs } from './fs-utils.js';

// Single source of truth for the security baseline. Bumped from 2.1.47 in v8.3.0
// after CVE-2025-59536 (CVSS 8.7) cumulative hardening completed in 2.1.97.
const MIN_CLAUDE_CODE = '2.1.97';
const RECOMMENDED_CLAUDE_CODE = '2.1.118';

/**
 * Compare two semver-ish version strings (`major.minor.patch`).
 * Returns -1 if a < b, 0 if equal, 1 if a > b.
 * @param {string} a
 * @param {string} b
 * @returns {-1|0|1}
 */
function semverCmp(a, b) {
  const pa = a.split('.').map((n) => parseInt(n, 10));
  const pb = b.split('.').map((n) => parseInt(n, 10));
  for (let i = 0; i < 3; i++) {
    const da = pa[i] || 0;
    const db = pb[i] || 0;
    if (da !== db) return da < db ? -1 : 1;
  }
  return 0;
}

/**
 * Extract the first `X.Y.Z` triple from a free-form `claude --version` output.
 * @param {string} output
 * @returns {string|null}
 */
function extractSemver(output) {
  const m = output.match(/(\d+)\.(\d+)\.(\d+)/);
  return m ? m[0] : null;
}

/**
 * OS-specific yq installation hints. Returned as a list of one-liner instructions
 * that the user can copy/paste.
 * @returns {string[]}
 */
function yqInstallHints() {
  const platform = os.platform();
  if (platform === 'darwin') {
    return ['brew install yq'];
  }
  if (platform === 'linux') {
    return [
      'sudo apt-get install yq           # Debian/Ubuntu (snap version)',
      'sudo snap install yq              # Snap (Mike Farah build, recommended)',
      'wget https://github.com/mikefarah/yq/releases/latest/download/yq_linux_amd64 -O /usr/local/bin/yq && chmod +x /usr/local/bin/yq',
    ];
  }
  if (platform === 'win32') {
    return ['winget install --id MikeFarah.yq  # Windows native', 'Or use WSL: see Linux instructions above'];
  }
  return ['See https://github.com/mikefarah/yq#install for your platform'];
}

/**
 * Run a shell command and return the trimmed output, or null on failure.
 * @param {string} cmd - Shell command to execute
 * @returns {string|null}
 */
function tryExec(cmd) {
  try {
    return execSync(cmd, { encoding: 'utf8', timeout: 10_000 }).trim();
  } catch {
    return null;
  }
}

/**
 * Run the doctor command against a target directory.
 * @param {string} targetPath - Absolute path to the project directory
 * @param {Object} [deps] - Injectable dependencies for testing
 * @param {function} [deps.execFn] - Custom exec function
 */
function runDoctor(targetPath, deps = {}) {
  const exec = deps.execFn || tryExec;
  let passed = 0;
  let failed = 0;
  let warned = 0;

  console.log(`\n${c.bold}Claude Craft Doctor — Environment Diagnostics${c.reset}`);
  console.log(`${c.dim}Directory: ${targetPath}${c.reset}\n`);

  // 1. Node.js version >= 20
  const nodeVer = process.version;
  const major = parseInt(nodeVer.slice(1), 10);
  if (major >= 20) {
    console.log(`  ${c.green}[OK]${c.reset} Node.js ${nodeVer}`);
    passed++;
  } else {
    console.log(`  ${c.red}[FAIL]${c.reset} Node.js ${nodeVer} — requires >= 20`);
    failed++;
  }

  // 2. npm available
  const npmVer = exec('npm --version');
  if (npmVer) {
    console.log(`  ${c.green}[OK]${c.reset} npm ${npmVer}`);
    passed++;
  } else {
    console.log(`  ${c.red}[FAIL]${c.reset} npm not found`);
    failed++;
  }

  // 3. Claude Code installed and >= 2.1.97 (CVE-2025-59536 baseline)
  const claudeVerRaw = exec('claude --version');
  if (claudeVerRaw) {
    const semver = extractSemver(claudeVerRaw);
    if (semver && semverCmp(semver, MIN_CLAUDE_CODE) < 0) {
      console.log(
        `  ${c.red}[FAIL]${c.reset} Claude Code ${semver} — requires >= ${MIN_CLAUDE_CODE} (CVE-2025-59536, CVSS 8.7)`
      );
      console.log(`         Upgrade: ${c.cyan}npm install -g @anthropic-ai/claude-code@latest${c.reset}`);
      failed++;
    } else if (semver && semverCmp(semver, RECOMMENDED_CLAUDE_CODE) < 0) {
      console.log(
        `  ${c.yellow}[WARN]${c.reset} Claude Code ${semver} — recommended ${RECOMMENDED_CLAUDE_CODE} (forked subagents, native CLI)`
      );
      warned++;
    } else {
      console.log(`  ${c.green}[OK]${c.reset} Claude Code ${semver || claudeVerRaw}`);
      passed++;
    }
  } else {
    console.log(`  ${c.yellow}[WARN]${c.reset} Claude Code not found (optional for install, required for usage)`);
    console.log(`         Install: ${c.cyan}npm install -g @anthropic-ai/claude-code${c.reset}`);
    warned++;
  }

  // 4. Git available
  const gitVer = exec('git --version');
  if (gitVer) {
    console.log(`  ${c.green}[OK]${c.reset} ${gitVer}`);
    passed++;
  } else {
    console.log(`  ${c.red}[FAIL]${c.reset} git not found`);
    failed++;
  }

  // 5. yq available (Mike Farah version) — required for monorepo YAML config (claude-projects.yaml)
  const yqVer = exec('yq --version');
  if (yqVer) {
    console.log(`  ${c.green}[OK]${c.reset} ${yqVer}`);
    passed++;
  } else {
    console.log(
      `  ${c.yellow}[WARN]${c.reset} yq not found (required for monorepo YAML config — claude-projects.yaml)`
    );
    for (const hint of yqInstallHints()) {
      console.log(`         ${c.cyan}${hint}${c.reset}`);
    }
    warned++;
  }

  // 6. .claude/ structure integrity
  const claudeDir = path.join(targetPath, '.claude');
  if (fs.existsSync(claudeDir)) {
    console.log(`  ${c.green}[OK]${c.reset} .claude/ directory exists`);
    passed++;

    // Check required subdirs
    const requiredDirs = ['commands', 'agents', 'references', 'skills'];
    for (const dir of requiredDirs) {
      if (fs.existsSync(path.join(claudeDir, dir))) {
        console.log(`  ${c.green}[OK]${c.reset} .claude/${dir}/`);
        passed++;
      } else {
        console.log(`  ${c.yellow}[WARN]${c.reset} .claude/${dir}/ missing`);
        warned++;
      }
    }

    // CLAUDE.md
    if (fs.existsSync(path.join(claudeDir, 'CLAUDE.md'))) {
      console.log(`  ${c.green}[OK]${c.reset} .claude/CLAUDE.md`);
      passed++;
    } else {
      console.log(`  ${c.yellow}[WARN]${c.reset} .claude/CLAUDE.md missing`);
      warned++;
    }
  } else {
    console.log(`  ${c.yellow}[WARN]${c.reset} .claude/ directory not found (not installed here)`);
    warned++;
  }

  // 7. Shell scripts have execute permissions
  const scriptsDir = path.join(targetPath, 'Dev', 'scripts');
  if (fs.existsSync(scriptsDir)) {
    try {
      const files = fs.readdirSync(scriptsDir).filter((f) => f.endsWith('.sh'));
      let execCount = 0;
      let noExecCount = 0;
      for (const f of files) {
        try {
          fs.accessSync(path.join(scriptsDir, f), fs.constants.X_OK);
          execCount++;
        } catch {
          noExecCount++;
        }
      }
      if (noExecCount === 0 && execCount > 0) {
        console.log(`  ${c.green}[OK]${c.reset} Shell scripts executable (${execCount} scripts)`);
        passed++;
      } else if (noExecCount > 0) {
        console.log(`  ${c.yellow}[WARN]${c.reset} ${noExecCount} script(s) missing execute permission`);
        warned++;
      }
    } catch {
      // scriptsDir not readable
    }
  }

  // 8. i18n base dirs
  const i18nBase = path.join(targetPath, 'Dev', 'i18n');
  if (fs.existsSync(i18nBase)) {
    const langs = listDirs(i18nBase);
    if (langs.length > 0) {
      console.log(`  ${c.green}[OK]${c.reset} i18n base dirs: ${c.cyan}${langs.join(', ')}${c.reset}`);
      passed++;
    } else {
      console.log(`  ${c.yellow}[WARN]${c.reset} i18n/ exists but no language dirs found`);
      warned++;
    }
  }

  // Summary
  console.log('');
  if (failed === 0 && warned === 0) {
    console.log(`${c.green}All checks passed! (${passed} OK)${c.reset}\n`);
  } else if (failed === 0) {
    console.log(`${c.green}${passed} passed${c.reset}, ${c.yellow}${warned} warning(s)${c.reset}\n`);
  } else {
    console.log(
      `${c.green}${passed} passed${c.reset}, ${c.red}${failed} failed${c.reset}, ${c.yellow}${warned} warning(s)${c.reset}\n`
    );
    process.exitCode = 1;
  }
}

export { runDoctor };
