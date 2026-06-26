import { describe, it, expect } from 'vitest';
import { execSync } from 'child_process';

/**
 * Guard test (REL): every other tests/scripts/*.test.mjs shells out to
 * `bash "<script>.sh"` because the scripts under test rely on bashisms
 * ([[ ]], arrays, `type -t`, `local`, `${VAR:+}`). Run inside a shell
 * environment without bash (e.g. a bare `node:*-alpine` / busybox image)
 * those 12 files fail uniformly with `/bin/sh: bash: not found`.
 *
 * This test codifies the prerequisite (docs/PREREQUISITES.md §2 "Bash Shell")
 * as an executable contract: if it fails, the docker/test image is missing
 * bash — use the bash-capable runner (`make test-scripts-docker`) instead of
 * a bare busybox image. It must never reach the AssertionError stage.
 */
describe('tests/scripts prerequisites', () => {
  it('bash is available on PATH', () => {
    let version = '';
    try {
      version = execSync('bash --version', { encoding: 'utf8', timeout: 5000 });
    } catch (err) {
      throw new Error(
        'bash is not available in this test environment. The tests/scripts ' +
          'suite requires GNU bash (the scripts use bashisms). Run the suite ' +
          'in a bash-capable image — `make test-scripts-docker` — not a bare ' +
          `busybox/alpine image. Underlying error: ${err.message}`
      );
    }
    expect(version).toContain('GNU bash');
  });
});
