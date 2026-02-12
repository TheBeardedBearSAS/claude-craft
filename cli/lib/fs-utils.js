/**
 * Shared filesystem utilities for CLI modules.
 * @module cli/lib/fs-utils
 */

import fs from 'fs';

/**
 * Count files matching a given extension in a directory (non-recursive).
 * @param {string} dir - Directory path
 * @param {string} ext - File extension (e.g. '.md')
 * @returns {number}
 */
function countFiles(dir, ext) {
  try {
    return fs.readdirSync(dir).filter((f) => f.endsWith(ext)).length;
  } catch {
    return 0;
  }
}

/**
 * List subdirectories of a directory.
 * @param {string} dir - Directory path
 * @returns {string[]}
 */
function listDirs(dir) {
  try {
    return fs
      .readdirSync(dir, { withFileTypes: true })
      .filter((d) => d.isDirectory())
      .map((d) => d.name);
  } catch {
    return [];
  }
}

export { countFiles, listDirs };
