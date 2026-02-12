import { describe, it, expect, afterAll, beforeAll } from 'vitest';
import { execSync } from 'child_process';
import fs from 'fs';
import os from 'os';
import path from 'path';

const PROJECT_ROOT = path.resolve(import.meta.dirname, '../..');
const I18N_DIR = path.join(PROJECT_ROOT, 'Dev/i18n');
const SCRIPTS_DIR = path.join(PROJECT_ROOT, 'Dev/scripts');
const COMMON_SCRIPT = path.join(SCRIPTS_DIR, 'install-common-rules.sh');

const tmpDirs = [];

function makeTmpDir() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'cc-test-i18n-'));
  tmpDirs.push(dir);
  return dir;
}

afterAll(() => {
  for (const dir of tmpDirs) {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

describe('i18n base directory structure', () => {
  it('base/ directory exists with shared files', () => {
    expect(fs.existsSync(path.join(I18N_DIR, 'base'))).toBe(true);
    const baseFiles = [];
    const walk = (dir) => {
      for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        if (entry.isDirectory()) walk(path.join(dir, entry.name));
        else baseFiles.push(path.relative(path.join(I18N_DIR, 'base'), path.join(dir, entry.name)));
      }
    };
    walk(path.join(I18N_DIR, 'base'));
    expect(baseFiles.length).toBeGreaterThanOrEqual(100);
  });

  it('base files are not duplicated in any language directory', () => {
    const baseDir = path.join(I18N_DIR, 'base');
    const langs = ['en', 'fr', 'es', 'de', 'pt'];
    const duplicates = [];

    const walk = (dir) => {
      const files = [];
      for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        if (entry.isDirectory()) files.push(...walk(path.join(dir, entry.name)));
        else files.push(path.relative(baseDir, path.join(dir, entry.name)));
      }
      return files;
    };

    const baseFiles = walk(baseDir);
    for (const relPath of baseFiles) {
      for (const lang of langs) {
        const langFile = path.join(I18N_DIR, lang, relPath);
        if (fs.existsSync(langFile)) {
          duplicates.push(`${lang}/${relPath}`);
        }
      }
    }

    expect(duplicates, `Found ${duplicates.length} duplicates: ${duplicates.slice(0, 5).join(', ')}`).toEqual([]);
  });

  it('Common/skills/ files are all in base/', () => {
    const baseSkills = path.join(I18N_DIR, 'base/Common/skills');
    expect(fs.existsSync(baseSkills)).toBe(true);

    const skillDirs = fs.readdirSync(baseSkills, { withFileTypes: true })
      .filter(d => d.isDirectory())
      .map(d => d.name);

    // All 7 common skills should be in base
    expect(skillDirs).toContain('documentation');
    expect(skillDirs).toContain('git-workflow');
    expect(skillDirs).toContain('kiss-dry-yagni');
    expect(skillDirs).toContain('security');
    expect(skillDirs).toContain('solid-principles');
    expect(skillDirs).toContain('testing');
    expect(skillDirs).toContain('workflow-analysis');
  });

  it('00-project-context.md.template exists in base for all techs', () => {
    const techs = ['Angular', 'CSharp', 'Flutter', 'Laravel', 'PHP', 'Python', 'React', 'ReactNative', 'Symfony', 'VueJS'];
    for (const tech of techs) {
      const template = path.join(I18N_DIR, 'base', tech, 'rules', '00-project-context.md.template');
      expect(fs.existsSync(template), `Missing template for ${tech}`).toBe(true);
    }
  });
});

describe('i18n overlay helpers (shell functions)', { timeout: 30000 }, () => {
  let testI18nDir;
  let scriptPath;

  beforeAll(() => {
    // Create a temporary i18n structure to test overlay functions
    testI18nDir = fs.mkdtempSync(path.join(os.tmpdir(), 'cc-test-overlay-'));
    tmpDirs.push(testI18nDir);

    // base/Tech/rules/base-only.md
    fs.mkdirSync(path.join(testI18nDir, 'base/Tech/rules'), { recursive: true });
    fs.writeFileSync(path.join(testI18nDir, 'base/Tech/rules/base-only.md'), 'base content');
    fs.writeFileSync(path.join(testI18nDir, 'base/Tech/rules/both.md'), 'base version');

    // en/Tech/rules/lang-only.md + both.md (override)
    fs.mkdirSync(path.join(testI18nDir, 'en/Tech/rules'), { recursive: true });
    fs.writeFileSync(path.join(testI18nDir, 'en/Tech/rules/lang-only.md'), 'lang content');
    fs.writeFileSync(path.join(testI18nDir, 'en/Tech/rules/both.md'), 'lang version');

    // base-only dir for i18n_dir_exists test
    fs.mkdirSync(path.join(testI18nDir, 'base/Tech/base-only-dir'), { recursive: true });
    fs.writeFileSync(path.join(testI18nDir, 'base/Tech/base-only-dir/file.md'), 'base dir file');

    // Create a test harness script
    scriptPath = path.join(testI18nDir, 'test-harness.sh');
    fs.writeFileSync(scriptPath, `#!/bin/bash
set -euo pipefail

I18N_DIR="${testI18nDir}"
TECH_NAME="Tech"
lang="en"

# Inline the functions we need to test
resolve_i18n_file() {
    local subpath="$1"
    local lang_file="$I18N_DIR/$lang/$subpath"
    local base_file="$I18N_DIR/base/$subpath"
    if [[ -f "$lang_file" ]]; then
        echo "$lang_file"
    elif [[ -f "$base_file" ]]; then
        echo "$base_file"
    else
        echo ""
    fi
}

i18n_dir_exists() {
    local subpath="$1"
    [[ -d "$I18N_DIR/$lang/$subpath" ]] || [[ -d "$I18N_DIR/base/$subpath" ]]
}

copy_i18n_files() {
    local subpath="$1"
    local dest="$2"
    local pattern="\${3:-*}"
    local base_dir="$I18N_DIR/base/$subpath"
    local lang_dir="$I18N_DIR/$lang/$subpath"

    if [[ -d "$base_dir" ]]; then
        find "$base_dir" -maxdepth 1 -name "$pattern" -type f -exec cp {} "$dest/" \\; 2>/dev/null || true
    fi
    if [[ -d "$lang_dir" ]]; then
        find "$lang_dir" -maxdepth 1 -name "$pattern" -type f -exec cp {} "$dest/" \\; 2>/dev/null || true
    fi
}

get_source_dir() {
    local i18n_src="$I18N_DIR/$lang/$TECH_NAME"
    local base_src="$I18N_DIR/base/$TECH_NAME"
    if [[ -d "$i18n_src" ]]; then
        echo "$i18n_src"
    elif [[ -d "$base_src" ]]; then
        echo "$base_src"
    else
        echo "SCRIPT_DIR_FALLBACK"
    fi
}

# Run tests based on argument
case "\${1:-}" in
    resolve-lang)
        resolve_i18n_file "Tech/rules/lang-only.md"
        ;;
    resolve-base)
        resolve_i18n_file "Tech/rules/base-only.md"
        ;;
    resolve-override)
        resolve_i18n_file "Tech/rules/both.md"
        ;;
    resolve-missing)
        resolve_i18n_file "Tech/rules/nonexistent.md"
        ;;
    dir-exists-lang)
        i18n_dir_exists "Tech/rules" && echo "true" || echo "false"
        ;;
    dir-exists-base-only)
        i18n_dir_exists "Tech/base-only-dir" && echo "true" || echo "false"
        ;;
    dir-exists-missing)
        i18n_dir_exists "Tech/nonexistent" && echo "true" || echo "false"
        ;;
    copy-overlay)
        dest="$2"
        mkdir -p "$dest"
        copy_i18n_files "Tech/rules" "$dest" "*.md"
        ls "$dest" | sort
        ;;
    get-source-dir)
        get_source_dir
        ;;
    get-source-dir-base-only)
        lang="xx"  # nonexistent lang
        TECH_NAME="Tech"
        # Remove en dir to test base fallback
        get_source_dir
        ;;
esac
`);
    fs.chmodSync(scriptPath, 0o755);
  });

  it('resolve_i18n_file returns lang file when it exists', () => {
    const output = execSync(`bash "${scriptPath}" resolve-lang`, { encoding: 'utf8' }).trim();
    expect(output).toContain('/en/Tech/rules/lang-only.md');
  });

  it('resolve_i18n_file falls back to base when lang file missing', () => {
    const output = execSync(`bash "${scriptPath}" resolve-base`, { encoding: 'utf8' }).trim();
    expect(output).toContain('/base/Tech/rules/base-only.md');
  });

  it('resolve_i18n_file returns lang version when both exist (lang overrides base)', () => {
    const output = execSync(`bash "${scriptPath}" resolve-override`, { encoding: 'utf8' }).trim();
    expect(output).toContain('/en/Tech/rules/both.md');
  });

  it('resolve_i18n_file returns empty string for missing file', () => {
    const output = execSync(`bash "${scriptPath}" resolve-missing`, { encoding: 'utf8' }).trim();
    expect(output).toBe('');
  });

  it('i18n_dir_exists returns true for lang dir', () => {
    const output = execSync(`bash "${scriptPath}" dir-exists-lang`, { encoding: 'utf8' }).trim();
    expect(output).toBe('true');
  });

  it('i18n_dir_exists returns true for base-only dir', () => {
    const output = execSync(`bash "${scriptPath}" dir-exists-base-only`, { encoding: 'utf8' }).trim();
    expect(output).toBe('true');
  });

  it('i18n_dir_exists returns false for missing dir', () => {
    const output = execSync(`bash "${scriptPath}" dir-exists-missing`, { encoding: 'utf8' }).trim();
    expect(output).toBe('false');
  });

  it('copy_i18n_files merges base and lang with lang taking precedence', () => {
    const destDir = path.join(testI18nDir, 'copy-test-dest');
    const output = execSync(`bash "${scriptPath}" copy-overlay "${destDir}"`, { encoding: 'utf8' }).trim();
    const files = output.split('\n').sort();

    // Should have all 3 files: base-only.md, both.md (lang version), lang-only.md
    expect(files).toEqual(['base-only.md', 'both.md', 'lang-only.md']);

    // both.md should contain the lang version (override)
    const bothContent = fs.readFileSync(path.join(destDir, 'both.md'), 'utf8');
    expect(bothContent).toBe('lang version');
  });

  it('get_source_dir prefers lang dir', () => {
    const output = execSync(`bash "${scriptPath}" get-source-dir`, { encoding: 'utf8' }).trim();
    expect(output).toContain('/en/Tech');
  });

  it('get_source_dir falls back to base when lang dir missing', () => {
    const output = execSync(`bash "${scriptPath}" get-source-dir-base-only`, { encoding: 'utf8' }).trim();
    expect(output).toContain('/base/Tech');
  });
});

describe('install scripts with base overlay', { timeout: 60000 }, () => {
  it.each(['en', 'fr', 'es', 'de', 'pt'])(
    'install-common-rules.sh dry-run succeeds for lang=%s',
    (lang) => {
      const tmpDir = makeTmpDir();
      const output = execSync(
        `bash "${COMMON_SCRIPT}" --dry-run --lang=${lang} "${tmpDir}"`,
        { encoding: 'utf8', timeout: 30000 },
      );
      expect(output).toMatch(/DRY-RUN|dry.run/i);
    },
  );

  it.each(['symfony', 'angular', 'react', 'python', 'csharp'])(
    'install-%s-rules.sh dry-run with base overlay',
    (tech) => {
      const tmpDir = makeTmpDir();
      const scriptPath = path.join(SCRIPTS_DIR, `install-${tech}-rules.sh`);
      const output = execSync(
        `bash "${scriptPath}" --dry-run --lang=en "${tmpDir}"`,
        { encoding: 'utf8', timeout: 20000 },
      );
      expect(output).toMatch(/DRY-RUN|dry.run/i);
    },
  );

  it('angular install creates files from both base and lang', () => {
    const tmpDir = makeTmpDir();
    const scriptPath = path.join(SCRIPTS_DIR, 'install-angular-rules.sh');
    execSync(`bash "${scriptPath}" --install --lang=en "${tmpDir}"`, {
      encoding: 'utf8',
      timeout: 30000,
    });

    // Core structure should exist
    expect(fs.existsSync(path.join(tmpDir, '.claude'))).toBe(true);
    expect(fs.existsSync(path.join(tmpDir, '.claude', 'references', 'angular'))).toBe(true);

    // Skills should have been copied from base/Common/skills
    expect(fs.existsSync(path.join(tmpDir, '.claude', 'skills'))).toBe(true);

    // CLAUDE.md should have been generated
    expect(fs.existsSync(path.join(tmpDir, '.claude', 'CLAUDE.md'))).toBe(true);
  });

  it('common rules install creates skills from base/', () => {
    const tmpDir = makeTmpDir();
    execSync(`bash "${COMMON_SCRIPT}" --lang=en "${tmpDir}"`, {
      encoding: 'utf8',
      timeout: 20000,
    });

    // Skills directory should exist with content from base/Common/skills
    const skillsDir = path.join(tmpDir, '.claude', 'skills');
    expect(fs.existsSync(skillsDir)).toBe(true);

    // Check at least one skill exists (these were moved to base/)
    const skillDirs = fs.readdirSync(skillsDir, { withFileTypes: true })
      .filter(d => d.isDirectory())
      .map(d => d.name);
    expect(skillDirs.length).toBeGreaterThan(0);
  });
});
