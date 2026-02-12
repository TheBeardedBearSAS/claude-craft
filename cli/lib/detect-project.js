/**
 * Project detection utilities.
 * @module cli/lib/detect-project
 */

import fs from 'fs';
import path from 'path';

/**
 * @typedef {Object} DetectedProject
 * @property {boolean} hasClaude - Whether a .claude directory exists
 * @property {boolean} hasGit - Whether a .git directory exists
 * @property {boolean} hasPackageJson - Whether package.json exists
 * @property {boolean} hasComposer - Whether composer.json exists
 * @property {boolean} hasPubspec - Whether pubspec.yaml exists
 * @property {boolean} hasRequirements - Whether requirements.txt or pyproject.toml exists
 * @property {boolean} hasDockerfile - Whether Dockerfile or docker-compose.yml exists
 * @property {boolean} hasCsproj - Whether *.csproj or *.sln files exist
 * @property {string[]} suggestedTechs - Technology identifiers detected from project files
 * @property {string} complexity - Estimated complexity (quick, standard, enterprise)
 */

/**
 * Detect project characteristics by inspecting files in the target directory.
 * @param {string} targetPath - Absolute path to the project directory
 * @param {Object} [options] - Optional dependencies for testing
 * @param {boolean} [options.debug=false] - Enable debug output
 * @returns {DetectedProject} Detected project metadata and suggested technologies
 */
function detectProject(targetPath, options = {}) {
  const debug = options.debug || false;

  const detected = {
    hasClaude: false,
    hasGit: false,
    hasPackageJson: false,
    hasComposer: false,
    hasPubspec: false,
    hasRequirements: false,
    hasDockerfile: false,
    hasCsproj: false,
    suggestedTechs: [],
    complexity: 'standard',
  };

  // Check for .claude directory
  try {
    detected.hasClaude = fs.existsSync(path.join(targetPath, '.claude'));
  } catch (e) {
    if (debug) console.error(`Detection error (.claude): ${e.message}`);
  }

  // Check for git
  try {
    detected.hasGit = fs.existsSync(path.join(targetPath, '.git'));
  } catch (e) {
    if (debug) console.error(`Detection error (.git): ${e.message}`);
  }

  // Detect C# / .NET (*.csproj or *.sln)
  try {
    const files = fs.readdirSync(targetPath);
    if (files.some((f) => f.endsWith('.csproj') || f.endsWith('.sln'))) {
      detected.hasCsproj = true;
      detected.suggestedTechs.push('csharp');
    }
  } catch (e) {
    if (debug) console.error(`Detection error (csproj): ${e.message}`);
  }

  // Detect PHP frameworks via composer.json
  try {
    if (fs.existsSync(path.join(targetPath, 'composer.json'))) {
      detected.hasComposer = true;
      const composer = JSON.parse(fs.readFileSync(path.join(targetPath, 'composer.json'), 'utf8'));
      const require = composer.require || {};
      const requireDev = composer['require-dev'] || {};
      const allDeps = { ...require, ...requireDev };

      const hasSymfony = Object.keys(allDeps).some((dep) => dep.startsWith('symfony/'));
      const hasLaravel = 'laravel/framework' in allDeps;

      if (hasLaravel) {
        detected.suggestedTechs.push('laravel');
      } else if (hasSymfony) {
        detected.suggestedTechs.push('symfony');
      } else {
        detected.suggestedTechs.push('php');
      }
    }
  } catch (e) {
    if (debug) console.error(`Detection error (composer): ${e.message}`);
  }

  // Detect Flutter (pubspec.yaml)
  try {
    if (fs.existsSync(path.join(targetPath, 'pubspec.yaml'))) {
      detected.hasPubspec = true;
      detected.suggestedTechs.push('flutter');
    }
  } catch (e) {
    if (debug) console.error(`Detection error (pubspec): ${e.message}`);
  }

  // Detect JS frameworks via package.json (Angular, Vue.js, React, React Native)
  try {
    if (fs.existsSync(path.join(targetPath, 'package.json'))) {
      detected.hasPackageJson = true;
      const pkg = JSON.parse(fs.readFileSync(path.join(targetPath, 'package.json'), 'utf8'));
      const allDeps = { ...(pkg.dependencies || {}), ...(pkg.devDependencies || {}) };

      if ('@angular/core' in allDeps) {
        detected.suggestedTechs.push('angular');
      } else if ('react' in allDeps) {
        if ('react-native' in allDeps) {
          detected.suggestedTechs.push('reactnative');
        } else {
          detected.suggestedTechs.push('react');
        }
      } else if ('vue' in allDeps) {
        detected.suggestedTechs.push('vuejs');
      }
    }
  } catch (e) {
    if (debug) console.error(`Detection error (package.json): ${e.message}`);
  }

  // Detect Python (requirements.txt / pyproject.toml)
  try {
    if (
      fs.existsSync(path.join(targetPath, 'requirements.txt')) ||
      fs.existsSync(path.join(targetPath, 'pyproject.toml'))
    ) {
      detected.hasRequirements = true;
      detected.suggestedTechs.push('python');
    }
  } catch (e) {
    if (debug) console.error(`Detection error (python): ${e.message}`);
  }

  // Detect Docker (Dockerfile / docker-compose.yml)
  try {
    if (
      fs.existsSync(path.join(targetPath, 'Dockerfile')) ||
      fs.existsSync(path.join(targetPath, 'docker-compose.yml'))
    ) {
      detected.hasDockerfile = true;
      detected.suggestedTechs.push('docker');
    }
  } catch (e) {
    if (debug) console.error(`Detection error (docker): ${e.message}`);
  }

  // Estimate complexity
  if (detected.suggestedTechs.length > 2) {
    detected.complexity = 'enterprise';
  } else if (detected.suggestedTechs.length === 0) {
    detected.complexity = 'quick';
  }

  return detected;
}

export { detectProject };
