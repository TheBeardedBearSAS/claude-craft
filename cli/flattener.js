#!/usr/bin/env node

/**
 * Codebase Flattener
 * Generates a context-optimized summary of a codebase for AI assistants.
 *
 * Features:
 * - Smart file selection (ignores node_modules, vendor, etc.)
 * - Document sharding for large codebases
 * - Token estimation
 * - Priority-based file ordering
 *
 * @module cli/flattener
 */

import fs from 'fs';
import path from 'path';

// ANSI colors (shared module)
import c from './lib/colors.js';

// Default ignore patterns
const DEFAULT_IGNORES = [
  'node_modules',
  'vendor',
  '.git',
  '.claude',
  '__pycache__',
  '.pytest_cache',
  '.next',
  '.nuxt',
  'dist',
  'build',
  'coverage',
  '.idea',
  '.vscode',
  '*.log',
  '*.lock',
  'package-lock.json',
  'yarn.lock',
  'composer.lock',
  'pubspec.lock',
  '*.min.js',
  '*.min.css',
  '*.map',
  '*.pyc',
  '*.pyo',
  '.DS_Store',
  'Thumbs.db',
  '*.sqlite',
  '*.db',
  '.env',
  '.env.*',
  '*.key',
  '*.pem',
  '*.cert',
];

// Priority extensions (most relevant for understanding code)
const PRIORITY_EXTENSIONS = {
  high: ['.md', '.yaml', '.yml', '.json', '.ts', '.tsx', '.js', '.jsx', '.py', '.php', '.dart', '.sql'],
  medium: ['.html', '.css', '.scss', '.less', '.vue', '.svelte', '.graphql', '.prisma'],
  low: ['.txt', '.xml', '.ini', '.cfg', '.conf', '.toml'],
};

/**
 * Approximate tokens per character ratio for Claude models.
 * Claude models average ~4 characters per token (1/4 = 0.25).
 * Conservative estimate for mixed code/text content.
 */
const TOKENS_PER_CHAR = 0.25;

/**
 * Maximum tokens per shard.
 * 50K tokens per shard leaves ~150K tokens free in a 200K context window
 * for conversation history, system prompts, and tool results.
 */
const MAX_TOKENS_PER_SHARD = 50000;

/**
 * @typedef {Object} FlattenerOptions
 * @property {number} [maxTokens] - Max tokens per shard (default: 50000)
 * @property {number} [maxFileSize] - Max file size in bytes to include (default: 50000)
 * @property {string[]} [ignore] - Additional ignore patterns
 * @property {string[]|null} [include] - Include-only patterns (null means include all)
 * @property {boolean} [sharding] - Enable automatic sharding for large codebases (default: true)
 * @property {string} [priority] - Minimum priority level to include (default: 'high')
 */

/**
 * @typedef {Object} FileEntry
 * @property {string} path - Relative path from root
 * @property {string} fullPath - Absolute filesystem path
 * @property {number} size - File size in bytes
 * @property {number} priority - Priority rank (1=high, 2=medium, 3=low, 4=other)
 * @property {number} tokens - Estimated token count
 */

/**
 * @typedef {Object} Shard
 * @property {FileEntry[]} files - Files included in this shard
 * @property {number} tokens - Total estimated tokens in this shard
 */

class CodebaseFlattener {
  /**
   * Create a codebase flattener instance.
   * @param {string} rootPath - Path to the project root directory
   * @param {FlattenerOptions} [options={}] - Flattener configuration options
   */
  constructor(rootPath, options = {}) {
    this.rootPath = path.resolve(rootPath);
    this.options = {
      maxTokens: options.maxTokens || MAX_TOKENS_PER_SHARD,
      maxFileSize: options.maxFileSize || 50000, // 50KB max per file
      ignorePatterns: [...DEFAULT_IGNORES, ...(options.ignore || [])],
      includePatterns: options.include || null,
      sharding: options.sharding !== false,
      priority: options.priority || 'high',
      ...options,
    };

    this.stats = {
      totalFiles: 0,
      includedFiles: 0,
      totalSize: 0,
      estimatedTokens: 0,
      shards: 0,
    };

    this.files = [];
  }

  /**
   * Check whether a relative path matches any ignore pattern.
   * @param {string} relativePath - Path relative to the project root
   * @returns {boolean} True if the path should be excluded
   */
  shouldIgnore(relativePath) {
    const basename = path.basename(relativePath);

    for (const pattern of this.options.ignorePatterns) {
      if (pattern.startsWith('*')) {
        // Extension pattern
        if (basename.endsWith(pattern.slice(1))) return true;
      } else {
        // Directory/file name pattern
        if (relativePath.includes(pattern) || basename === pattern) return true;
      }
    }

    return false;
  }

  /**
   * Determine the priority rank of a file based on its extension.
   * @param {string} filePath - File path to evaluate
   * @returns {number} Priority rank (1=high, 2=medium, 3=low, 4=other)
   */
  getFilePriority(filePath) {
    const ext = path.extname(filePath).toLowerCase();

    if (PRIORITY_EXTENSIONS.high.includes(ext)) return 1;
    if (PRIORITY_EXTENSIONS.medium.includes(ext)) return 2;
    if (PRIORITY_EXTENSIONS.low.includes(ext)) return 3;
    return 4;
  }

  /**
   * Check whether a file is binary based on its extension.
   * @param {string} filePath - File path to check
   * @returns {boolean} True if the file has a known binary extension
   */
  isBinaryFile(filePath) {
    const binaryExtensions = [
      '.png',
      '.jpg',
      '.jpeg',
      '.gif',
      '.ico',
      '.svg',
      '.webp',
      '.pdf',
      '.doc',
      '.docx',
      '.xls',
      '.xlsx',
      '.ppt',
      '.pptx',
      '.zip',
      '.tar',
      '.gz',
      '.rar',
      '.7z',
      '.mp3',
      '.mp4',
      '.wav',
      '.avi',
      '.mov',
      '.exe',
      '.dll',
      '.so',
      '.dylib',
      '.ttf',
      '.otf',
      '.woff',
      '.woff2',
      '.eot',
    ];

    const ext = path.extname(filePath).toLowerCase();
    return binaryExtensions.includes(ext);
  }

  /**
   * Recursively scan a directory and populate the files list.
   * @param {string} dirPath - Absolute path of the directory to scan
   * @param {string} [relativePath=''] - Current relative path from root
   */
  scanDirectory(dirPath, relativePath = '') {
    try {
      const entries = fs.readdirSync(dirPath, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(dirPath, entry.name);
        const relPath = path.join(relativePath, entry.name);

        if (this.shouldIgnore(relPath)) continue;

        if (entry.isDirectory()) {
          this.scanDirectory(fullPath, relPath);
        } else if (entry.isFile()) {
          this.stats.totalFiles++;

          if (this.isBinaryFile(fullPath)) continue;

          try {
            const stats = fs.statSync(fullPath);
            if (stats.size > this.options.maxFileSize) continue;

            this.files.push({
              path: relPath,
              fullPath: fullPath,
              size: stats.size,
              priority: this.getFilePriority(fullPath),
              tokens: Math.ceil(stats.size * TOKENS_PER_CHAR),
            });

            this.stats.includedFiles++;
            this.stats.totalSize += stats.size;
          } catch (_e) {
            // Skip unreadable files
          }
        }
      }
    } catch (_e) {
      console.error(`${c.yellow}Warning: Cannot read directory ${dirPath}${c.reset}`);
    }
  }

  /**
   * Generate an ASCII tree representation of all included files.
   * @returns {string} Tree-formatted string with box-drawing characters
   */
  generateFileTree() {
    const tree = {};

    for (const file of this.files) {
      const parts = file.path.split(path.sep);
      let current = tree;

      for (let i = 0; i < parts.length - 1; i++) {
        if (!current[parts[i]]) current[parts[i]] = {};
        current = current[parts[i]];
      }

      current[parts[parts.length - 1]] = null;
    }

    const renderTree = (node, prefix = '', _isLast = true) => {
      let result = '';
      const entries = Object.entries(node);

      entries.forEach(([name, children], index) => {
        const isLastEntry = index === entries.length - 1;
        const connector = isLastEntry ? '└── ' : '├── ';
        const extension = isLastEntry ? '    ' : '│   ';

        result += prefix + connector + name + '\n';

        if (children !== null) {
          result += renderTree(children, prefix + extension, isLastEntry);
        }
      });

      return result;
    };

    return renderTree(tree);
  }

  /**
   * Generate the complete markdown output with statistics, file tree, and contents.
   * @returns {string} Full markdown document content
   */
  generateOutput() {
    // Sort files by priority, then by path
    this.files.sort((a, b) => {
      if (a.priority !== b.priority) return a.priority - b.priority;
      return a.path.localeCompare(b.path);
    });

    let content = `# Codebase Context: ${path.basename(this.rootPath)}

Generated: ${new Date().toISOString()}
Root: ${this.rootPath}

## Statistics

- Total files scanned: ${this.stats.totalFiles}
- Files included: ${this.stats.includedFiles}
- Total size: ${(this.stats.totalSize / 1024).toFixed(2)} KB
- Estimated tokens: ~${Math.ceil(this.stats.totalSize * TOKENS_PER_CHAR).toLocaleString()}

## File Tree

\`\`\`
${path.basename(this.rootPath)}/
${this.generateFileTree()}\`\`\`

## File Contents

`;

    // Add file contents
    for (const file of this.files) {
      try {
        const fileContent = fs.readFileSync(file.fullPath, 'utf8');
        const ext = path.extname(file.path).slice(1) || 'text';

        content += `### ${file.path}

\`\`\`${ext}
${fileContent}
\`\`\`

`;
      } catch (e) {
        content += `### ${file.path}

\`\`\`
[Error reading file: ${e.message}]
\`\`\`

`;
      }
    }

    this.stats.estimatedTokens = Math.ceil(content.length * TOKENS_PER_CHAR);
    return content;
  }

  /**
   * Split included files into token-bounded shards for large codebases.
   * @returns {Shard[]} Array of shards, each within the maxTokens limit
   */
  generateShardedOutput() {
    // Sort files by priority
    this.files.sort((a, b) => {
      if (a.priority !== b.priority) return a.priority - b.priority;
      return a.path.localeCompare(b.path);
    });

    const shards = [];
    let currentShard = {
      files: [],
      tokens: 0,
    };

    const headerTokens = 500; // Approximate header tokens

    for (const file of this.files) {
      if (currentShard.tokens + file.tokens + headerTokens > this.options.maxTokens) {
        if (currentShard.files.length > 0) {
          shards.push(currentShard);
          currentShard = { files: [], tokens: 0 };
        }
      }

      currentShard.files.push(file);
      currentShard.tokens += file.tokens;
    }

    if (currentShard.files.length > 0) {
      shards.push(currentShard);
    }

    this.stats.shards = shards.length;
    return shards;
  }

  /**
   * Scan the codebase and write the flattened output to file(s).
   * Automatically shards if total tokens exceed the configured limit.
   * @param {string} outputFile - Output filename (relative or absolute)
   * @returns {Promise<void>}
   */
  async flatten(outputFile) {
    console.log(`${c.cyan}Scanning:${c.reset} ${this.rootPath}\n`);

    // Scan directory
    this.scanDirectory(this.rootPath);

    if (this.files.length === 0) {
      console.log(`${c.yellow}No files found to include.${c.reset}`);
      return;
    }

    console.log(`${c.dim}Found ${this.stats.totalFiles} files, including ${this.stats.includedFiles}${c.reset}\n`);

    // Check if sharding is needed
    const totalTokens = Math.ceil(this.stats.totalSize * TOKENS_PER_CHAR);

    if (this.options.sharding && totalTokens > this.options.maxTokens) {
      // Generate sharded output
      const shards = this.generateShardedOutput();

      console.log(`${c.yellow}Large codebase detected - generating ${shards.length} shards${c.reset}\n`);

      const baseName = outputFile.replace(/\.[^.]+$/, '');
      const ext = path.extname(outputFile) || '.md';

      for (let i = 0; i < shards.length; i++) {
        const shardFile = `${baseName}_shard${i + 1}${ext}`;
        const content = this.generateShardContent(shards[i], i + 1, shards.length);
        fs.writeFileSync(shardFile, content);
        console.log(
          `  ${c.green}Created:${c.reset} ${shardFile} (${shards[i].files.length} files, ~${shards[i].tokens.toLocaleString()} tokens)`
        );
      }

      // Generate index file
      const indexContent = this.generateIndexContent(shards, baseName, ext);
      const indexFile = `${baseName}_index${ext}`;
      fs.writeFileSync(indexFile, indexContent);
      console.log(`  ${c.green}Created:${c.reset} ${indexFile} (index)`);
    } else {
      // Generate single output
      const content = this.generateOutput();
      fs.writeFileSync(outputFile, content);
      console.log(`${c.green}Created:${c.reset} ${outputFile}`);
    }

    // Print summary
    this.printSummary();
  }

  /**
   * Generate the markdown content for a single shard.
   * @param {Shard} shard - The shard containing files and token count
   * @param {number} shardNum - 1-based shard index
   * @param {number} totalShards - Total number of shards
   * @returns {string} Markdown content for this shard
   */
  generateShardContent(shard, shardNum, totalShards) {
    let content = `# Codebase Context: ${path.basename(this.rootPath)} (Shard ${shardNum}/${totalShards})

Generated: ${new Date().toISOString()}
Root: ${this.rootPath}

## Shard Information

- Shard: ${shardNum} of ${totalShards}
- Files in this shard: ${shard.files.length}
- Estimated tokens: ~${shard.tokens.toLocaleString()}

## Files in This Shard

${shard.files.map((f) => `- ${f.path}`).join('\n')}

## File Contents

`;

    for (const file of shard.files) {
      try {
        const fileContent = fs.readFileSync(file.fullPath, 'utf8');
        const ext = path.extname(file.path).slice(1) || 'text';

        content += `### ${file.path}

\`\`\`${ext}
${fileContent}
\`\`\`

`;
      } catch (e) {
        content += `### ${file.path}

\`\`\`
[Error reading file: ${e.message}]
\`\`\`

`;
      }
    }

    return content;
  }

  /**
   * Generate the index file that maps all shards and provides usage instructions.
   * @param {Shard[]} shards - Array of all generated shards
   * @param {string} baseName - Base filename without extension
   * @param {string} ext - File extension including the dot (e.g. '.md')
   * @returns {string} Markdown content for the index file
   */
  generateIndexContent(shards, baseName, ext) {
    const fileTree = this.generateFileTree();

    return `# Codebase Context Index: ${path.basename(this.rootPath)}

Generated: ${new Date().toISOString()}
Root: ${this.rootPath}

## Overview

This codebase has been sharded into ${shards.length} parts for optimal context management.

### Statistics

- Total files: ${this.stats.includedFiles}
- Total size: ${(this.stats.totalSize / 1024).toFixed(2)} KB
- Total estimated tokens: ~${Math.ceil(this.stats.totalSize * TOKENS_PER_CHAR).toLocaleString()}
- Shards: ${shards.length}

### Shards

${shards.map((shard, i) => `- **Shard ${i + 1}**: ${path.basename(baseName)}_shard${i + 1}${ext} (${shard.files.length} files, ~${shard.tokens.toLocaleString()} tokens)`).join('\n')}

## Complete File Tree

\`\`\`
${path.basename(this.rootPath)}/
${fileTree}\`\`\`

## File Distribution

### Shard Contents

${shards
  .map(
    (shard, i) => `
#### Shard ${i + 1}
${shard.files.map((f) => `- ${f.path}`).join('\n')}
`
  )
  .join('\n')}

## Usage Instructions

1. Start with this index file to understand the structure
2. Load shards as needed based on the area you're working on
3. High-priority files (config, entry points) are in earlier shards
4. Each shard stays within ~${this.options.maxTokens.toLocaleString()} tokens

`;
  }

  /**
   * Print a formatted summary of the flattening results to stdout.
   */
  printSummary() {
    console.log(`
${c.bold}Summary:${c.reset}
─────────────────────────────────────
  Files scanned:    ${this.stats.totalFiles}
  Files included:   ${this.stats.includedFiles}
  Total size:       ${(this.stats.totalSize / 1024).toFixed(2)} KB
  Est. tokens:      ~${this.stats.estimatedTokens.toLocaleString()}
  ${this.stats.shards > 1 ? `Shards:           ${this.stats.shards}` : ''}
─────────────────────────────────────
`);
  }
}

/**
 * Convenience function to flatten a codebase in a single call.
 * @param {string} rootPath - Path to the project root directory
 * @param {string} outputFile - Output filename
 * @param {FlattenerOptions} [options={}] - Flattener configuration options
 * @returns {Promise<void>}
 */
async function flatten(rootPath, outputFile, options = {}) {
  const flattener = new CodebaseFlattener(rootPath, options);
  await flattener.flatten(outputFile);
}

export { flatten, CodebaseFlattener, DEFAULT_IGNORES, PRIORITY_EXTENSIONS, TOKENS_PER_CHAR, MAX_TOKENS_PER_SHARD };
