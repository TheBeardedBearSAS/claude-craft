import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as fc from 'fast-check';

/**
 * Property: detectProject must be deterministic (same inputs → same outputs).
 * We mock fs so we don't need an actual filesystem.
 */

describe('detectProject — property-based', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('complexity is deterministic: same file presence → same complexity', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          hasCsproj: fc.boolean(),
          hasComposer: fc.boolean(),
          hasPubspec: fc.boolean(),
          hasPackageJson: fc.boolean(),
          hasRequirements: fc.boolean(),
          hasDockerfile: fc.boolean(),
        }),
        async (presence) => {
          vi.mock('fs', async () => {
            const original = await vi.importActual('fs');
            return {
              ...original,
              existsSync: vi.fn((filePath) => {
                const name = filePath.split('/').pop();
                if (name === '.claude') return false;
                if (name === '.git') return false;
                if (name === 'composer.json') return presence.hasComposer;
                if (name === 'pubspec.yaml') return presence.hasPubspec;
                if (name === 'package.json') return presence.hasPackageJson;
                if (name === 'requirements.txt' || name === 'pyproject.toml')
                  return presence.hasRequirements;
                if (name === 'Dockerfile' || name === 'docker-compose.yml')
                  return presence.hasDockerfile;
                return false;
              }),
              readdirSync: vi.fn((p) => {
                const files = [];
                if (presence.hasCsproj) files.push('app.csproj');
                return files;
              }),
              readFileSync: vi.fn(() => '{"require":{}}'),
            };
          });

          const { detectProject } = await import('../../cli/lib/detect-project.js');

          const result1 = detectProject('/project');
          const result2 = detectProject('/project');

          expect(result1.complexity).toBe(result2.complexity);
          expect(result1.suggestedTechs).toEqual(result2.suggestedTechs);
          vi.unmock('fs');
        },
      ),
      { numRuns: 20 },
    );
  });

  it('complexity is "enterprise" iff more than 2 techs are detected', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          hasCsproj: fc.boolean(),
          hasComposer: fc.boolean(),
          hasPubspec: fc.boolean(),
          hasPackageJson: fc.boolean(),
          hasRequirements: fc.boolean(),
          hasDockerfile: fc.boolean(),
        }),
        async (presence) => {
          vi.mock('fs', async () => {
            const original = await vi.importActual('fs');
            return {
              ...original,
              existsSync: vi.fn((filePath) => {
                const name = filePath.split('/').pop();
                if (name === 'composer.json') return presence.hasComposer;
                if (name === 'pubspec.yaml') return presence.hasPubspec;
                if (name === 'package.json') return presence.hasPackageJson;
                if (name === 'requirements.txt') return presence.hasRequirements;
                if (name === 'Dockerfile') return presence.hasDockerfile;
                return false;
              }),
              readdirSync: vi.fn(() => (presence.hasCsproj ? ['app.csproj'] : [])),
              readFileSync: vi.fn(() => '{"require":{}}'),
            };
          });

          const { detectProject } = await import('../../cli/lib/detect-project.js');
          const result = detectProject('/project');

          if (result.suggestedTechs.length > 2) {
            expect(result.complexity).toBe('enterprise');
          } else if (result.suggestedTechs.length === 0) {
            expect(result.complexity).toBe('quick');
          } else {
            expect(result.complexity).toBe('standard');
          }

          vi.unmock('fs');
        },
      ),
      { numRuns: 20 },
    );
  });
});
