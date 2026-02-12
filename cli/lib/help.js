/**
 * CLI help text display.
 * @module cli/lib/help
 */

import c from './colors.js';
import { TECHNOLOGIES, LANGUAGES } from './constants.js';

/** Available namespaces with short descriptions. */
const NAMESPACES = [
  { prefix: 'common', desc: 'Shared tools: pre-commit, standup, changelog, CI setup' },
  { prefix: 'workflow', desc: 'Development lifecycle: init, analyze, plan, design, implement' },
  { prefix: 'team', desc: 'Agent Teams: parallel audit, sprint, security, delivery' },
  { prefix: 'qa', desc: 'Quality assurance: recette, fix, regression, TDD' },
  { prefix: 'uiux', desc: 'UI/UX: audit, a11y, component-spec, design-tokens' },
  { prefix: 'sprint', desc: 'Sprint management: next-story, transition, status, dev' },
  { prefix: 'gate', desc: 'Quality gates: validate PRD, story, backlog, techspec' },
  { prefix: 'project', desc: 'Project execution: run-sprint, run-epic, batch-status' },
  { prefix: 'docker', desc: 'Docker: compose-setup, architecture, debug, optimize' },
  { prefix: 'csharp', desc: 'C#/.NET: compliance, architecture, code-quality, security' },
  { prefix: 'symfony', desc: 'Symfony: architecture, compliance, CRUD, security' },
  { prefix: 'flutter', desc: 'Flutter: architecture, generate-feature, performance' },
  { prefix: 'react', desc: 'React: generate-component, architecture, accessibility' },
  { prefix: 'angular', desc: 'Angular: architecture, compliance, testing' },
  { prefix: 'laravel', desc: 'Laravel: architecture, compliance, testing' },
  { prefix: 'vuejs', desc: 'Vue.js: architecture, compliance, testing' },
  { prefix: 'python', desc: 'Python: endpoints, async, typing, FastAPI' },
  { prefix: 'reactnative', desc: 'React Native: screens, navigation, native modules' },
  { prefix: 'php', desc: 'PHP: entities, value objects, use cases, Clean Architecture' },
];

/**
 * Print the CLI usage help with commands, options, and examples.
 */
export function printHelp() {
  console.log(`
${c.bold}Usage:${c.reset} npx @the-bearded-bear/claude-craft [command] [options]

${c.bold}Commands:${c.reset}
  ${c.green}install${c.reset}              Interactive installation wizard
  ${c.green}install <path>${c.reset}       Install to specific directory
  ${c.green}init${c.reset}                 Initialize workflow in current project
  ${c.green}check${c.reset}                Verify claude-craft installation
  ${c.green}list${c.reset}                 List installed components
  ${c.green}doctor${c.reset}               Environment diagnostics
  ${c.green}update${c.reset}               Refresh existing installation
  ${c.green}flatten${c.reset}              Generate flattened codebase summary
  ${c.green}ralph${c.reset}                Run Ralph Wiggum continuous loop
  ${c.green}help${c.reset}                 Show this help message

${c.bold}Options:${c.reset}
  ${c.yellow}--version, -v${c.reset}        Show version
  ${c.yellow}--lang=XX${c.reset}            Language (en, fr, es, de, pt)
  ${c.yellow}--tech=NAME${c.reset}          Technology (${Object.keys(TECHNOLOGIES).join(', ')})
  ${c.yellow}--force${c.reset}              Overwrite existing files
  ${c.yellow}--quick${c.reset}              Quick Flow track (bug fixes)
  ${c.yellow}--standard${c.reset}           Standard track (features)
  ${c.yellow}--enterprise${c.reset}         Enterprise track (platforms)

${c.bold}Available Namespaces:${c.reset}
${NAMESPACES.map((ns) => `  ${c.cyan}/${ns.prefix}:*${c.reset}`.padEnd(30 + c.cyan.length + c.reset.length) + ns.desc).join('\n')}

  ${c.dim}Example: /common:pre-commit-check, /workflow:init, /team:sprint${c.reset}

${c.bold}Examples:${c.reset}
  ${c.dim}# Interactive installation${c.reset}
  npx @the-bearded-bear/claude-craft install

  ${c.dim}# Install Symfony rules in French${c.reset}
  npx @the-bearded-bear/claude-craft install ~/my-project --tech=symfony --lang=fr

  ${c.dim}# Initialize workflow${c.reset}
  npx @the-bearded-bear/claude-craft init --standard

  ${c.dim}# Flatten codebase for context${c.reset}
  npx @the-bearded-bear/claude-craft flatten --output=context.md

  ${c.dim}# Run Ralph continuous loop${c.reset}
  npx @the-bearded-bear/claude-craft ralph "Implement user authentication"

${c.bold}Technologies:${c.reset}
${Object.entries(TECHNOLOGIES)
  .map(([key, val]) => `  ${c.cyan}${key.padEnd(12)}${c.reset} ${val.desc}`)
  .join('\n')}

${c.bold}Languages:${c.reset}
${Object.entries(LANGUAGES)
  .map(([key, val]) => `  ${c.cyan}${key}${c.reset} - ${val}`)
  .join('\n')}
`);
}
