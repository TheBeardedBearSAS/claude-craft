import { describe, it, expect } from 'vitest';
import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, '../..');
const SHELL_UI = path.resolve(PROJECT_ROOT, 'Dev/scripts/lib/shell-ui.sh');

/**
 * Source shell-ui.sh and run a bash snippet, returning stdout.
 */
function runShellUI(snippet) {
  return execSync(`bash -c 'source "${SHELL_UI}" && ${snippet}'`, {
    encoding: 'utf8',
    timeout: 5000,
  });
}

describe('shell-ui.sh', () => {
  it('defines all color variables', () => {
    const colors = ['RED', 'GREEN', 'YELLOW', 'BLUE', 'CYAN', 'MAGENTA', 'BOLD', 'DIM', 'NC'];
    for (const color of colors) {
      const output = runShellUI(`echo -n "\${${color}:+defined}"`);
      expect(output, `${color} not defined`).toBe('defined');
    }
  });

  it('ui_info outputs [INFO] tag', () => {
    const output = runShellUI('ui_info "test message"');
    expect(output).toContain('[INFO]');
    expect(output).toContain('test message');
  });

  it('ui_success outputs [OK] tag', () => {
    const output = runShellUI('ui_success "done"');
    expect(output).toContain('[OK]');
    expect(output).toContain('done');
  });

  it('ui_warning outputs [WARN] tag', () => {
    const output = runShellUI('ui_warning "careful"');
    expect(output).toContain('[WARN]');
    expect(output).toContain('careful');
  });

  it('ui_error outputs [ERROR] tag', () => {
    const output = runShellUI('ui_error "fail"');
    expect(output).toContain('[ERROR]');
    expect(output).toContain('fail');
  });

  it('ui_dry_run outputs [DRY-RUN] tag', () => {
    const output = runShellUI('ui_dry_run "simulated"');
    expect(output).toContain('[DRY-RUN]');
    expect(output).toContain('simulated');
  });

  it('ui_check_ok outputs checkmark', () => {
    const output = runShellUI('ui_check_ok "passed"');
    expect(output).toContain('passed');
  });

  it('ui_check_warn outputs warning', () => {
    const output = runShellUI('ui_check_warn "risky"');
    expect(output).toContain('risky');
  });

  it('ui_check_fail outputs cross', () => {
    const output = runShellUI('ui_check_fail "broken"');
    expect(output).toContain('broken');
  });

  it('ui_check_info outputs info', () => {
    const output = runShellUI('ui_check_info "note"');
    expect(output).toContain('note');
  });

  it('ui_header outputs boxed header', () => {
    const output = runShellUI('ui_header "My Title"');
    expect(output).toContain('My Title');
  });

  it('ui_box outputs colored box', () => {
    const output = runShellUI('ui_box "Box Title"');
    expect(output).toContain('Box Title');
  });

  it('ui_separator outputs separator line', () => {
    const output = runShellUI('ui_separator');
    expect(output.trim().length).toBeGreaterThan(0);
  });

  it('ui_step outputs step indicator', () => {
    const output = runShellUI('ui_step 1 5 "Installing..."');
    expect(output).toContain('[1/5]');
    expect(output).toContain('Installing...');
  });

  it('all ui_* functions are defined as functions', () => {
    const fns = [
      'ui_info', 'ui_success', 'ui_warning', 'ui_error', 'ui_dry_run',
      'ui_check_ok', 'ui_check_warn', 'ui_check_fail', 'ui_check_info',
      'ui_header', 'ui_box', 'ui_separator', 'ui_step',
    ];
    for (const fn of fns) {
      const output = runShellUI(`type -t ${fn}`);
      expect(output.trim(), `${fn} not a function`).toBe('function');
    }
  });
});

describe('shell-ui.sh sourcing from different paths', () => {
  it('can be sourced from Infra/ script path', () => {
    const infraScript = path.resolve(PROJECT_ROOT, 'Infra/install-docker-rules.sh');
    // Verify the relative path used in install-docker-rules.sh resolves correctly
    const output = execSync(
      `bash -c 'SCRIPT_DIR="${path.resolve(PROJECT_ROOT, "Infra")}" && source "\${SCRIPT_DIR}/../Dev/scripts/lib/shell-ui.sh" && ui_info "infra-ok"'`,
      { encoding: 'utf8', timeout: 5000 }
    );
    expect(output).toContain('[INFO]');
    expect(output).toContain('infra-ok');
  });

  it('can be sourced from Project/ script path', () => {
    const output = execSync(
      `bash -c 'SCRIPT_DIR="${path.resolve(PROJECT_ROOT, "Project")}" && source "\${SCRIPT_DIR}/../Dev/scripts/lib/shell-ui.sh" && ui_success "project-ok"'`,
      { encoding: 'utf8', timeout: 5000 }
    );
    expect(output).toContain('[OK]');
    expect(output).toContain('project-ok');
  });

  it('tcl-common.sh auto-sources shell-ui.sh when not already loaded', () => {
    const tclCommon = path.resolve(PROJECT_ROOT, 'Dev/scripts/tcl-common.sh');
    const output = execSync(
      `bash -c 'source "${tclCommon}" && type -t ui_info'`,
      { encoding: 'utf8', timeout: 5000 }
    );
    expect(output.trim()).toBe('function');
  });

  it('tcl-common.sh does not re-source shell-ui.sh if already loaded', () => {
    const tclCommon = path.resolve(PROJECT_ROOT, 'Dev/scripts/tcl-common.sh');
    // Source shell-ui first, then tcl-common — should not error
    const output = execSync(
      `bash -c 'source "${SHELL_UI}" && source "${tclCommon}" && ui_info "double-source-ok"'`,
      { encoding: 'utf8', timeout: 5000 }
    );
    expect(output).toContain('double-source-ok');
  });
});
