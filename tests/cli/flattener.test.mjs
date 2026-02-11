import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs, { mkdtempSync, writeFileSync, mkdirSync, rmSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import {
  CodebaseFlattener,
  DEFAULT_IGNORES,
  PRIORITY_EXTENSIONS,
  TOKENS_PER_CHAR,
  MAX_TOKENS_PER_SHARD,
} from '../../cli/flattener.js';

// --- Constants ---

describe('flattener constants', () => {
  it('DEFAULT_IGNORES is a non-empty array of strings', () => {
    expect(Array.isArray(DEFAULT_IGNORES)).toBe(true);
    expect(DEFAULT_IGNORES.length).toBeGreaterThan(0);
    for (const pattern of DEFAULT_IGNORES) {
      expect(typeof pattern).toBe('string');
    }
  });

  it('DEFAULT_IGNORES contains essential patterns', () => {
    expect(DEFAULT_IGNORES).toContain('node_modules');
    expect(DEFAULT_IGNORES).toContain('.git');
    expect(DEFAULT_IGNORES).toContain('.env');
    expect(DEFAULT_IGNORES).toContain('vendor');
  });

  it('PRIORITY_EXTENSIONS has high, medium, and low tiers', () => {
    expect(PRIORITY_EXTENSIONS).toHaveProperty('high');
    expect(PRIORITY_EXTENSIONS).toHaveProperty('medium');
    expect(PRIORITY_EXTENSIONS).toHaveProperty('low');
    expect(PRIORITY_EXTENSIONS.high.length).toBeGreaterThan(0);
    expect(PRIORITY_EXTENSIONS.medium.length).toBeGreaterThan(0);
    expect(PRIORITY_EXTENSIONS.low.length).toBeGreaterThan(0);
  });

  it('TOKENS_PER_CHAR is a positive fraction', () => {
    expect(TOKENS_PER_CHAR).toBeGreaterThan(0);
    expect(TOKENS_PER_CHAR).toBeLessThan(1);
  });

  it('MAX_TOKENS_PER_SHARD is a reasonable positive number', () => {
    expect(MAX_TOKENS_PER_SHARD).toBeGreaterThan(1000);
  });
});

// --- shouldIgnore ---

describe('shouldIgnore', () => {
  it('ignores node_modules directory', () => {
    const flattener = new CodebaseFlattener('/fake');
    expect(flattener.shouldIgnore('node_modules/package/index.js')).toBe(true);
  });

  it('ignores .git directory', () => {
    const flattener = new CodebaseFlattener('/fake');
    expect(flattener.shouldIgnore('.git/config')).toBe(true);
  });

  it('ignores files matching extension patterns', () => {
    const flattener = new CodebaseFlattener('/fake');
    expect(flattener.shouldIgnore('app.min.js')).toBe(true);
    expect(flattener.shouldIgnore('styles.min.css')).toBe(true);
  });

  it('does not ignore normal source files', () => {
    const flattener = new CodebaseFlattener('/fake');
    expect(flattener.shouldIgnore('src/index.js')).toBe(false);
    expect(flattener.shouldIgnore('lib/utils.py')).toBe(false);
  });

  it('ignores .env files', () => {
    const flattener = new CodebaseFlattener('/fake');
    expect(flattener.shouldIgnore('.env')).toBe(true);
  });

  it('respects custom ignore patterns', () => {
    const flattener = new CodebaseFlattener('/fake', { ignore: ['custom_dir'] });
    expect(flattener.shouldIgnore('custom_dir/file.js')).toBe(true);
  });
});

// --- getFilePriority ---

describe('getFilePriority', () => {
  it('returns 1 for high-priority extensions', () => {
    const flattener = new CodebaseFlattener('/fake');
    expect(flattener.getFilePriority('file.ts')).toBe(1);
    expect(flattener.getFilePriority('file.js')).toBe(1);
    expect(flattener.getFilePriority('file.py')).toBe(1);
    expect(flattener.getFilePriority('file.md')).toBe(1);
    expect(flattener.getFilePriority('file.json')).toBe(1);
  });

  it('returns 2 for medium-priority extensions', () => {
    const flattener = new CodebaseFlattener('/fake');
    expect(flattener.getFilePriority('file.html')).toBe(2);
    expect(flattener.getFilePriority('file.css')).toBe(2);
    expect(flattener.getFilePriority('file.vue')).toBe(2);
  });

  it('returns 3 for low-priority extensions', () => {
    const flattener = new CodebaseFlattener('/fake');
    expect(flattener.getFilePriority('file.txt')).toBe(3);
    expect(flattener.getFilePriority('file.xml')).toBe(3);
  });

  it('returns 4 for unknown extensions', () => {
    const flattener = new CodebaseFlattener('/fake');
    expect(flattener.getFilePriority('file.xyz')).toBe(4);
    expect(flattener.getFilePriority('file.bin')).toBe(4);
  });
});

// --- isBinaryFile ---

describe('isBinaryFile', () => {
  it('detects image files as binary', () => {
    const flattener = new CodebaseFlattener('/fake');
    expect(flattener.isBinaryFile('photo.png')).toBe(true);
    expect(flattener.isBinaryFile('photo.jpg')).toBe(true);
    expect(flattener.isBinaryFile('icon.gif')).toBe(true);
    expect(flattener.isBinaryFile('icon.webp')).toBe(true);
  });

  it('detects archive files as binary', () => {
    const flattener = new CodebaseFlattener('/fake');
    expect(flattener.isBinaryFile('archive.zip')).toBe(true);
    expect(flattener.isBinaryFile('archive.tar')).toBe(true);
    expect(flattener.isBinaryFile('archive.gz')).toBe(true);
  });

  it('detects font files as binary', () => {
    const flattener = new CodebaseFlattener('/fake');
    expect(flattener.isBinaryFile('font.ttf')).toBe(true);
    expect(flattener.isBinaryFile('font.woff2')).toBe(true);
  });

  it('returns false for text files', () => {
    const flattener = new CodebaseFlattener('/fake');
    expect(flattener.isBinaryFile('index.js')).toBe(false);
    expect(flattener.isBinaryFile('style.css')).toBe(false);
    expect(flattener.isBinaryFile('README.md')).toBe(false);
  });

  it('is case-insensitive via path.extname lowercase', () => {
    const flattener = new CodebaseFlattener('/fake');
    expect(flattener.isBinaryFile('image.PNG')).toBe(true);
  });
});

// --- generateFileTree ---

describe('generateFileTree', () => {
  it('generates tree from flat file list', () => {
    const flattener = new CodebaseFlattener('/fake');
    flattener.files = [
      { path: 'src/index.js' },
      { path: 'src/utils.js' },
      { path: 'README.md' },
    ];
    const tree = flattener.generateFileTree();
    expect(tree).toContain('src');
    expect(tree).toContain('index.js');
    expect(tree).toContain('utils.js');
    expect(tree).toContain('README.md');
  });

  it('returns empty string for empty file list', () => {
    const flattener = new CodebaseFlattener('/fake');
    flattener.files = [];
    const tree = flattener.generateFileTree();
    expect(tree).toBe('');
  });

  it('handles deeply nested files', () => {
    const flattener = new CodebaseFlattener('/fake');
    flattener.files = [
      { path: 'a/b/c/deep.js' },
    ];
    const tree = flattener.generateFileTree();
    expect(tree).toContain('a');
    expect(tree).toContain('b');
    expect(tree).toContain('c');
    expect(tree).toContain('deep.js');
  });
});

// --- generateShardedOutput ---

describe('generateShardedOutput', () => {
  it('puts all files in one shard if under token limit', () => {
    const flattener = new CodebaseFlattener('/fake', { maxTokens: 50000 });
    flattener.files = [
      { path: 'a.js', size: 100, priority: 1, tokens: 25 },
      { path: 'b.js', size: 200, priority: 1, tokens: 50 },
    ];
    const shards = flattener.generateShardedOutput();
    expect(shards).toHaveLength(1);
    expect(shards[0].files).toHaveLength(2);
  });

  it('splits files across shards when exceeding token limit', () => {
    const flattener = new CodebaseFlattener('/fake', { maxTokens: 1000 });
    flattener.files = [
      { path: 'a.js', size: 2000, priority: 1, tokens: 800 },
      { path: 'b.js', size: 2000, priority: 1, tokens: 800 },
    ];
    const shards = flattener.generateShardedOutput();
    expect(shards.length).toBeGreaterThanOrEqual(2);
  });

  it('sorts files by priority before sharding', () => {
    const flattener = new CodebaseFlattener('/fake', { maxTokens: 50000 });
    flattener.files = [
      { path: 'low.txt', size: 100, priority: 3, tokens: 25 },
      { path: 'high.js', size: 100, priority: 1, tokens: 25 },
      { path: 'med.html', size: 100, priority: 2, tokens: 25 },
    ];
    const shards = flattener.generateShardedOutput();
    expect(shards[0].files[0].path).toBe('high.js');
    expect(shards[0].files[1].path).toBe('med.html');
    expect(shards[0].files[2].path).toBe('low.txt');
  });

  it('returns empty array when no files', () => {
    const flattener = new CodebaseFlattener('/fake');
    flattener.files = [];
    const shards = flattener.generateShardedOutput();
    expect(shards).toHaveLength(0);
  });
});

// --- generateOutput ---

describe('generateOutput', () => {
  it('returns markdown with statistics header', () => {
    const flattener = new CodebaseFlattener('/fake');
    flattener.files = [
      { path: 'src/app.js', fullPath: '/dev/null', size: 100, priority: 1, tokens: 25 },
    ];
    flattener.stats = { totalFiles: 5, includedFiles: 1, totalSize: 100, estimatedTokens: 0, shards: 0 };

    // Mock fs.readFileSync for file content
    const origReadFileSync = fs.readFileSync;
    fs.readFileSync = (p, enc) => {
      if (p === '/dev/null' && enc === 'utf8') return 'console.log("hello");';
      return origReadFileSync(p, enc);
    };

    try {
      const output = flattener.generateOutput();
      expect(output).toContain('# Codebase Context:');
      expect(output).toContain('## Statistics');
      expect(output).toContain('Files included: 1');
      expect(output).toContain('## File Tree');
      expect(output).toContain('## File Contents');
      expect(output).toContain('### src/app.js');
      expect(output).toContain('console.log("hello")');
    } finally {
      fs.readFileSync = origReadFileSync;
    }
  });

  it('sets estimatedTokens after generation', () => {
    const flattener = new CodebaseFlattener('/fake');
    flattener.files = [];
    flattener.stats = { totalFiles: 0, includedFiles: 0, totalSize: 0, estimatedTokens: 0, shards: 0 };
    flattener.generateOutput();
    expect(flattener.stats.estimatedTokens).toBeGreaterThan(0);
  });
});

// --- generateShardContent ---

describe('generateShardContent', () => {
  it('includes shard number and file list', () => {
    const flattener = new CodebaseFlattener('/fake');
    const shard = {
      files: [
        { path: 'a.js', fullPath: '/dev/null', size: 50, priority: 1, tokens: 12 },
        { path: 'b.js', fullPath: '/dev/null', size: 60, priority: 1, tokens: 15 },
      ],
      tokens: 27,
    };

    const origReadFileSync = fs.readFileSync;
    fs.readFileSync = (p, enc) => {
      if (enc === 'utf8') return '// content';
      return origReadFileSync(p, enc);
    };

    try {
      const content = flattener.generateShardContent(shard, 2, 5);
      expect(content).toContain('Shard 2/5');
      expect(content).toContain('Shard: 2 of 5');
      expect(content).toContain('Files in this shard: 2');
      expect(content).toContain('- a.js');
      expect(content).toContain('- b.js');
      expect(content).toContain('### a.js');
      expect(content).toContain('### b.js');
    } finally {
      fs.readFileSync = origReadFileSync;
    }
  });

  it('handles read errors gracefully', () => {
    const flattener = new CodebaseFlattener('/fake');
    const shard = {
      files: [{ path: 'missing.js', fullPath: '/nonexistent/path/missing.js', size: 10, priority: 1, tokens: 3 }],
      tokens: 3,
    };

    const content = flattener.generateShardContent(shard, 1, 1);
    expect(content).toContain('Error reading file');
  });
});

// --- generateIndexContent ---

describe('generateIndexContent', () => {
  it('includes shard map and usage instructions', () => {
    const flattener = new CodebaseFlattener('/fake');
    flattener.files = [
      { path: 'a.js' },
      { path: 'b.js' },
    ];
    flattener.stats = { totalFiles: 5, includedFiles: 2, totalSize: 200, estimatedTokens: 50, shards: 2 };

    const shards = [
      { files: [{ path: 'a.js' }], tokens: 25 },
      { files: [{ path: 'b.js' }], tokens: 25 },
    ];

    const content = flattener.generateIndexContent(shards, 'output', '.md');
    expect(content).toContain('Codebase Context Index');
    expect(content).toContain('sharded into 2 parts');
    expect(content).toContain('Shard 1');
    expect(content).toContain('Shard 2');
    expect(content).toContain('output_shard1.md');
    expect(content).toContain('output_shard2.md');
    expect(content).toContain('Usage Instructions');
    expect(content).toContain('Complete File Tree');
  });
});

// --- scanDirectory integration ---

describe('scanDirectory', () => {
  let tempDir;

  beforeEach(() => {
    tempDir = mkdtempSync(join(tmpdir(), 'flattener-test-'));
  });

  afterEach(() => {
    rmSync(tempDir, { recursive: true, force: true });
  });

  it('scans and collects text files', () => {
    mkdirSync(join(tempDir, 'src'));
    writeFileSync(join(tempDir, 'src', 'app.js'), 'console.log("hello");');
    writeFileSync(join(tempDir, 'README.md'), '# Hello');

    const flattener = new CodebaseFlattener(tempDir);
    flattener.scanDirectory(tempDir);

    expect(flattener.files.length).toBe(2);
    expect(flattener.stats.includedFiles).toBe(2);
  });

  it('skips binary files', () => {
    writeFileSync(join(tempDir, 'image.png'), Buffer.alloc(100));
    writeFileSync(join(tempDir, 'app.js'), 'const x = 1;');

    const flattener = new CodebaseFlattener(tempDir);
    flattener.scanDirectory(tempDir);

    expect(flattener.files.length).toBe(1);
    expect(flattener.files[0].path).toBe('app.js');
  });

  it('skips files exceeding maxFileSize', () => {
    writeFileSync(join(tempDir, 'big.js'), 'x'.repeat(100000));
    writeFileSync(join(tempDir, 'small.js'), 'const x = 1;');

    const flattener = new CodebaseFlattener(tempDir, { maxFileSize: 1000 });
    flattener.scanDirectory(tempDir);

    expect(flattener.files.length).toBe(1);
    expect(flattener.files[0].path).toBe('small.js');
  });

  it('skips ignored directories', () => {
    mkdirSync(join(tempDir, 'node_modules'));
    writeFileSync(join(tempDir, 'node_modules', 'pkg.js'), 'module.exports = {}');
    writeFileSync(join(tempDir, 'app.js'), 'const x = 1;');

    const flattener = new CodebaseFlattener(tempDir);
    flattener.scanDirectory(tempDir);

    expect(flattener.files.length).toBe(1);
    expect(flattener.files[0].path).toBe('app.js');
  });
});
