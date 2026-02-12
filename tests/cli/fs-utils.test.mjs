import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import { countFiles, listDirs } from '../../cli/lib/fs-utils.js';

describe('fs-utils', () => {
  let tempDir;

  beforeEach(() => {
    tempDir = mkdtempSync(join(tmpdir(), 'claude-craft-fsutils-'));
  });

  afterEach(() => {
    rmSync(tempDir, { recursive: true, force: true });
  });

  describe('countFiles', () => {
    it('counts files with matching extension', () => {
      writeFileSync(join(tempDir, 'a.md'), '#');
      writeFileSync(join(tempDir, 'b.md'), '#');
      writeFileSync(join(tempDir, 'c.txt'), 'x');
      expect(countFiles(tempDir, '.md')).toBe(2);
    });

    it('returns 0 for empty directory', () => {
      expect(countFiles(tempDir, '.md')).toBe(0);
    });

    it('returns 0 for non-existent directory', () => {
      expect(countFiles('/no/such/dir/xxx', '.md')).toBe(0);
    });
  });

  describe('listDirs', () => {
    it('lists subdirectories', () => {
      mkdirSync(join(tempDir, 'alpha'));
      mkdirSync(join(tempDir, 'beta'));
      writeFileSync(join(tempDir, 'file.txt'), 'x');
      const dirs = listDirs(tempDir);
      expect(dirs).toContain('alpha');
      expect(dirs).toContain('beta');
      expect(dirs).not.toContain('file.txt');
    });

    it('returns empty array for non-existent directory', () => {
      expect(listDirs('/no/such/dir/xxx')).toEqual([]);
    });

    it('returns empty array for empty directory', () => {
      expect(listDirs(tempDir)).toEqual([]);
    });
  });
});
