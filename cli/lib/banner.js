/**
 * CLI Banner and success message display.
 * @module cli/lib/banner
 */

import c, { colorEnabled } from './colors.js';
import { success as successSymbol } from './symbols.js';

/**
 * Print the ASCII art banner with version information.
 * Falls back to plain text when NO_COLOR is set or stdout is not a TTY.
 * @param {string} VERSION - Current package version string
 */
export function printBanner(VERSION) {
  if (!colorEnabled) {
    console.log(`Claude Craft v${VERSION}`);
    return;
  }
  console.log(`
${c.cyan}${c.bold}╔═══════════════════════════════════════════════════════════════╗${c.reset}
${c.cyan}${c.bold}║${c.reset}                                                               ${c.cyan}${c.bold}║${c.reset}
${c.cyan}${c.bold}║${c.reset}   ${c.magenta}${c.bold}██████╗██╗      █████╗ ██╗   ██╗██████╗ ███████╗${c.reset}        ${c.cyan}${c.bold}║${c.reset}
${c.cyan}${c.bold}║${c.reset}   ${c.magenta}${c.bold}██╔════╝██║     ██╔══██╗██║   ██║██╔══██╗██╔════╝${c.reset}        ${c.cyan}${c.bold}║${c.reset}
${c.cyan}${c.bold}║${c.reset}   ${c.magenta}${c.bold}██║     ██║     ███████║██║   ██║██║  ██║█████╗${c.reset}          ${c.cyan}${c.bold}║${c.reset}
${c.cyan}${c.bold}║${c.reset}   ${c.magenta}${c.bold}██║     ██║     ██╔══██║██║   ██║██║  ██║██╔══╝${c.reset}          ${c.cyan}${c.bold}║${c.reset}
${c.cyan}${c.bold}║${c.reset}   ${c.magenta}${c.bold}╚██████╗███████╗██║  ██║╚██████╔╝██████╔╝███████╗${c.reset}        ${c.cyan}${c.bold}║${c.reset}
${c.cyan}${c.bold}║${c.reset}   ${c.magenta}${c.bold} ╚═════╝╚══════╝╚═╝  ╚═╝ ╚═════╝ ╚═════╝ ╚══════╝${c.reset}        ${c.cyan}${c.bold}║${c.reset}
${c.cyan}${c.bold}║${c.reset}                                                               ${c.cyan}${c.bold}║${c.reset}
${c.cyan}${c.bold}║${c.reset}   ${c.blue}${c.bold}██████╗██████╗  █████╗ ███████╗████████╗${c.reset}                ${c.cyan}${c.bold}║${c.reset}
${c.cyan}${c.bold}║${c.reset}   ${c.blue}${c.bold}██╔════╝██╔══██╗██╔══██╗██╔════╝╚══██╔══╝${c.reset}                ${c.cyan}${c.bold}║${c.reset}
${c.cyan}${c.bold}║${c.reset}   ${c.blue}${c.bold}██║     ██████╔╝███████║█████╗     ██║${c.reset}                   ${c.cyan}${c.bold}║${c.reset}
${c.cyan}${c.bold}║${c.reset}   ${c.blue}${c.bold}██║     ██╔══██╗██╔══██║██╔══╝     ██║${c.reset}                   ${c.cyan}${c.bold}║${c.reset}
${c.cyan}${c.bold}║${c.reset}   ${c.blue}${c.bold}╚██████╗██║  ██║██║  ██║██║        ██║${c.reset}                   ${c.cyan}${c.bold}║${c.reset}
${c.cyan}${c.bold}║${c.reset}   ${c.blue}${c.bold} ╚═════╝╚═╝  ╚═╝╚═╝  ╚═╝╚═╝        ╚═╝${c.reset}                   ${c.cyan}${c.bold}║${c.reset}
${c.cyan}${c.bold}║${c.reset}                                                               ${c.cyan}${c.bold}║${c.reset}
${c.cyan}${c.bold}║${c.reset}   ${c.dim}AI-Assisted Development Framework for Claude Code${c.reset}          ${c.cyan}${c.bold}║${c.reset}
${c.cyan}${c.bold}║${c.reset}   ${c.dim}Version ${VERSION}${c.reset}${' '.repeat(Math.max(0, 46 - VERSION.length))}${c.cyan}${c.bold}║${c.reset}
${c.cyan}${c.bold}║${c.reset}                                                               ${c.cyan}${c.bold}║${c.reset}
${c.cyan}${c.bold}╚═══════════════════════════════════════════════════════════════╝${c.reset}
`);
}

/**
 * Print the post-installation success message with next steps.
 * @param {string} targetPath - The installation target directory path
 */
export function printSuccess(targetPath) {
  console.log(`
${c.green}${c.bold}╔═══════════════════════════════════════════════════════════════╗${c.reset}
${c.green}${c.bold}║${c.reset}                                                               ${c.green}${c.bold}║${c.reset}
${c.green}${c.bold}║${c.reset}   ${successSymbol('Installation Complete!')}                                    ${c.green}${c.bold}║${c.reset}
${c.green}${c.bold}║${c.reset}                                                               ${c.green}${c.bold}║${c.reset}
${c.green}${c.bold}╚═══════════════════════════════════════════════════════════════╝${c.reset}

${c.bold}Next Steps:${c.reset}

  1. ${c.cyan}cd ${targetPath}${c.reset}

  2. Start Claude Code and try the workflow:
     ${c.cyan}/workflow:init${c.reset}

  3. Or use technology-specific commands:
     ${c.cyan}/symfony:check-architecture${c.reset}
     ${c.cyan}/flutter:check-compliance${c.reset}
     ${c.cyan}/react:generate-component${c.reset}

${c.bold}Documentation:${c.reset}
  ${c.dim}https://github.com/TheBeardedBearSAS/claude-craft${c.reset}

`);
}
