/**
 * CLI `list` command — detailed listing of installed claude-craft components.
 * @module cli/lib/list
 */

import fs from 'fs';
import path from 'path';
import c from './colors.js';
import { countFiles, listDirs } from './fs-utils.js';
import { detectProject } from './detect-project.js';

/**
 * Run the list command against a target directory.
 * @param {string} targetPath - Absolute path to the project directory
 */
function runList(targetPath) {
  const claudeDir = path.join(targetPath, '.claude');

  console.log(`\n${c.bold}Claude Craft Installation — Detailed Listing${c.reset}`);
  console.log(`${c.dim}Directory: ${targetPath}${c.reset}\n`);

  if (!fs.existsSync(claudeDir)) {
    console.log(`${c.red}No claude-craft installation detected.${c.reset}`);
    console.log(`Run: npx @the-bearded-bear/claude-craft install ${targetPath}\n`);
    process.exitCode = 1;
    return;
  }

  // 1. Commands by namespace
  const commandsDir = path.join(claudeDir, 'commands');
  const namespaces = listDirs(commandsDir);
  console.log(`${c.bold}Commands:${c.reset}`);
  if (namespaces.length > 0) {
    let totalCommands = 0;
    for (const ns of namespaces) {
      const count = countFiles(path.join(commandsDir, ns), '.md');
      totalCommands += count;
      console.log(`  ${c.cyan}/${ns}:*${c.reset} — ${count} command(s)`);
    }
    console.log(`  ${c.dim}Total: ${totalCommands} commands in ${namespaces.length} namespace(s)${c.reset}`);
  } else {
    console.log(`  ${c.yellow}No namespaces found${c.reset}`);
  }

  // 2. Agents
  const agentsDir = path.join(claudeDir, 'agents');
  const agentCount = countFiles(agentsDir, '.md');
  console.log(`\n${c.bold}Agents:${c.reset}`);
  if (agentCount > 0) {
    console.log(`  ${agentCount} agent(s) in ${c.cyan}agents/${c.reset}`);
  } else {
    console.log(`  ${c.yellow}No agents found${c.reset}`);
  }

  // 3. References (installed tech refs)
  const refsDir = path.join(claudeDir, 'references');
  const refDirs = listDirs(refsDir);
  console.log(`\n${c.bold}References:${c.reset}`);
  if (refDirs.length > 0) {
    for (const ref of refDirs) {
      console.log(`  ${c.cyan}${ref}${c.reset}`);
    }
  } else {
    console.log(`  ${c.yellow}No tech references found${c.reset}`);
  }

  // 4. Skills
  const skillsDir = path.join(claudeDir, 'skills');
  const skillDirs = listDirs(skillsDir);
  let totalSkills = 0;
  console.log(`\n${c.bold}Skills:${c.reset}`);
  for (const sd of skillDirs) {
    const count = countFiles(path.join(skillsDir, sd), '.md');
    totalSkills += count;
    if (count > 0) {
      console.log(`  ${c.cyan}${sd}/${c.reset} — ${count} skill(s)`);
    }
  }
  // Top-level skill files
  const topSkills = countFiles(skillsDir, '.md');
  totalSkills += topSkills;
  if (topSkills > 0) {
    console.log(`  ${c.dim}(+ ${topSkills} top-level)${c.reset}`);
  }
  if (totalSkills === 0) {
    console.log(`  ${c.yellow}No skills found${c.reset}`);
  } else {
    console.log(`  ${c.dim}Total: ${totalSkills} skill(s)${c.reset}`);
  }

  // 5. Tech detection
  const detected = detectProject(targetPath);
  console.log(`\n${c.bold}Detected Technologies:${c.reset}`);
  if (detected.suggestedTechs.length > 0) {
    console.log(`  ${c.cyan}${detected.suggestedTechs.join(', ')}${c.reset} (complexity: ${detected.complexity})`);
  } else {
    console.log(`  ${c.dim}No technology detected from project files${c.reset}`);
  }

  console.log('');
}

export { runList };
