/**
 * CLI `check` command — verify claude-craft installation in a project directory.
 * @module cli/lib/check
 */

import fs from 'fs';
import path from 'path';
import c from './colors.js';
import { success, warning, error } from './symbols.js';
import { detectProject } from './detect-project.js';
import { countFiles, listDirs } from './fs-utils.js';

/**
 * Run the check command against a target directory.
 * @param {string} targetPath - Absolute path to the project directory
 */
function runCheck(targetPath) {
  const claudeDir = path.join(targetPath, '.claude');
  let warnings = 0;

  console.log(`\n${c.bold}Claude Craft Installation Check${c.reset}`);
  console.log(`${c.dim}Directory: ${targetPath}${c.reset}\n`);

  // 1. .claude/ directory
  if (fs.existsSync(claudeDir)) {
    console.log(`  ${success('.claude/ directory exists')}`);
  } else {
    console.log(`  ${error('.claude/ directory not found')}`);
    console.log(`\n${error('No claude-craft installation detected.')}`);
    console.log(`Run: npx @the-bearded-bear/claude-craft install ${targetPath}\n`);
    process.exitCode = 1;
    return;
  }

  // 2. CLAUDE.md
  const claudeMd = path.join(claudeDir, 'CLAUDE.md');
  if (fs.existsSync(claudeMd)) {
    console.log(`  ${success('.claude/CLAUDE.md exists')}`);
  } else {
    console.log(`  ${warning('.claude/CLAUDE.md not found')}`);
    warnings++;
  }

  // 3. Commands — count namespace dirs and files
  const commandsDir = path.join(claudeDir, 'commands');
  const namespaces = listDirs(commandsDir);
  let totalCommands = 0;
  if (namespaces.length > 0) {
    for (const ns of namespaces) {
      totalCommands += countFiles(path.join(commandsDir, ns), '.md');
    }
    console.log(
      `  ${success(`commands/ — ${totalCommands} commands in ${namespaces.length} namespace(s): ${c.cyan}${namespaces.join(', ')}${c.reset}`)}`
    );
  } else {
    console.log(`  ${warning('commands/ — no namespaces found')}`);
    warnings++;
  }

  // 4. Agents
  const agentsDir = path.join(claudeDir, 'agents');
  const agentCount = countFiles(agentsDir, '.md');
  if (agentCount > 0) {
    console.log(`  ${c.green}[OK]${c.reset} agents/ — ${agentCount} agent(s)`);
  } else {
    console.log(`  ${c.yellow}[WARN]${c.reset} agents/ — no agents found`);
    warnings++;
  }

  // 5. References
  const refsDir = path.join(claudeDir, 'references');
  const refDirs = listDirs(refsDir);
  if (refDirs.length > 0) {
    console.log(`  ${c.green}[OK]${c.reset} references/ — ${c.cyan}${refDirs.join(', ')}${c.reset}`);
  } else {
    console.log(`  ${c.yellow}[WARN]${c.reset} references/ — no tech references found`);
    warnings++;
  }

  // 6. Skills
  const skillsDir = path.join(claudeDir, 'skills');
  const skillDirs = listDirs(skillsDir);
  let totalSkills = 0;
  for (const sd of skillDirs) {
    totalSkills += countFiles(path.join(skillsDir, sd), '.md');
  }
  // Also count top-level skill files
  totalSkills += countFiles(skillsDir, '.md');
  if (totalSkills > 0) {
    console.log(`  ${c.green}[OK]${c.reset} skills/ — ${totalSkills} skill(s)`);
  } else {
    console.log(`  ${c.yellow}[WARN]${c.reset} skills/ — no skills found`);
    warnings++;
  }

  // 7. Tech detection
  const detected = detectProject(targetPath);
  if (detected.suggestedTechs.length > 0) {
    console.log(
      `  ${c.green}[OK]${c.reset} Detected tech: ${c.cyan}${detected.suggestedTechs.join(', ')}${c.reset} (complexity: ${detected.complexity})`
    );
  } else {
    console.log(`  ${c.dim}[--]${c.reset} No technology detected from project files`);
  }

  // Summary
  console.log('');
  if (warnings === 0) {
    console.log(`${success('Installation looks good!')}\n`);
  } else {
    console.log(`${warning(`${warnings} warning(s) — some components may be missing.`)}\n`);
  }
}

export { runCheck };
