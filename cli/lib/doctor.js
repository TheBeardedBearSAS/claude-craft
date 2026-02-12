/**
 * CLI `doctor` command — environment diagnostics & installation health check.
 * @module cli/lib/doctor
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import c from './colors.js';
import { listDirs } from './fs-utils.js';

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

  // 3. Claude Code installed
  const claudeVer = exec('claude --version');
  if (claudeVer) {
    console.log(`  ${c.green}[OK]${c.reset} Claude Code ${claudeVer}`);
    passed++;
  } else {
    console.log(`  ${c.yellow}[WARN]${c.reset} Claude Code not found (optional for install, required for usage)`);
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

  // 5. yq available (Mike Farah version)
  const yqVer = exec('yq --version');
  if (yqVer) {
    console.log(`  ${c.green}[OK]${c.reset} ${yqVer}`);
    passed++;
  } else {
    console.log(`  ${c.yellow}[WARN]${c.reset} yq not found (required for YAML config)`);
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
