import { describe, it, expect } from 'vitest';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CLI_ROOT = path.resolve(__dirname, '..', '..');

// --- VERSION loading ---
// Note: parseArgs, TECHNOLOGIES, LANGUAGES, runRalph arg building, and
// flattenCodebase option tests were removed in v5.14.0 (TEST-15) because
// they are now covered by dedicated module test files:
//   - tests/cli/parseArgs.test.mjs
//   - tests/cli/constants.test.mjs
//   - tests/cli/ralph.test.mjs
//   - tests/cli/flattener.test.mjs

describe('VERSION loading', () => {
  it('package.json version matches expected format', () => {
    const pkg = JSON.parse(fs.readFileSync(path.join(CLI_ROOT, 'package.json'), 'utf8'));
    expect(pkg.version).toMatch(/^\d+\.\d+\.\d+/);
  });
});
