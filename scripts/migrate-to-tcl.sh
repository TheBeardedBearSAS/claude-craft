#!/bin/bash
set -euo pipefail
IFS=$'\n\t'
#
# migrate-to-tcl.sh - Migration to Tiered Context Loading (TCL)
#
# This script migrates existing claude-craft projects to the new TCL structure
# that dramatically reduces token consumption (~95% reduction).
#
# Usage: ./scripts/migrate-to-tcl.sh [project_directory]
#
# Author: The Bearded CTO
# Script Version: 1.0.0 (TCL migration script version, independent of package version)

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Default to current directory
PROJECT_DIR="${1:-.}"
CLAUDE_DIR="$PROJECT_DIR/.claude"
BACKUP_SUFFIX=".backup.$(date +%Y%m%d_%H%M%S)"

echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║     Claude-Craft: Migration to Tiered Context Loading (TCL)   ║"
echo "║                                                                ║"
echo "║  This migration will reduce token consumption by ~95%         ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# Check if .claude directory exists
if [ ! -d "$CLAUDE_DIR" ]; then
    log_error "No .claude directory found in $PROJECT_DIR"
    log_info "This script is for migrating existing claude-craft projects."
    exit 1
fi

# Check if already migrated
if [ -d "$CLAUDE_DIR/references" ]; then
    log_warning "Project appears to already be migrated (references/ exists)"
    read -p "Continue anyway? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 0
    fi
fi

log_info "Starting migration for: $PROJECT_DIR"

# Step 1: Create new directory structure
log_info "Creating new directory structure..."
mkdir -p "$CLAUDE_DIR/references/base"
mkdir -p "$CLAUDE_DIR/references/csharp"
log_success "Directory structure created"

# Step 2: Backup existing files
log_info "Backing up existing files..."
if [ -f "$CLAUDE_DIR/CLAUDE.md" ]; then
    cp "$CLAUDE_DIR/CLAUDE.md" "$CLAUDE_DIR/CLAUDE.md$BACKUP_SUFFIX"
    log_success "CLAUDE.md backed up"
fi

# Step 3: Move rules to references (if rules directory exists)
if [ -d "$CLAUDE_DIR/rules" ]; then
    log_info "Moving rules to references..."

    # Map of old files to new locations
    # Base principles (language-agnostic)
    [ -f "$CLAUDE_DIR/rules/01-workflow-analysis.md" ] && cp "$CLAUDE_DIR/rules/01-workflow-analysis.md" "$CLAUDE_DIR/references/base/workflow-analysis.md"
    [ -f "$CLAUDE_DIR/rules/04-solid-principles.md" ] && cp "$CLAUDE_DIR/rules/04-solid-principles.md" "$CLAUDE_DIR/references/base/solid-principles.md"
    [ -f "$CLAUDE_DIR/rules/05-kiss-dry-yagni.md" ] && cp "$CLAUDE_DIR/rules/05-kiss-dry-yagni.md" "$CLAUDE_DIR/references/base/kiss-dry-yagni.md"
    [ -f "$CLAUDE_DIR/rules/07-testing.md" ] && cp "$CLAUDE_DIR/rules/07-testing.md" "$CLAUDE_DIR/references/base/testing-principles.md"
    [ -f "$CLAUDE_DIR/rules/09-git-workflow.md" ] && cp "$CLAUDE_DIR/rules/09-git-workflow.md" "$CLAUDE_DIR/references/base/git-workflow.md"
    [ -f "$CLAUDE_DIR/rules/10-documentation.md" ] && cp "$CLAUDE_DIR/rules/10-documentation.md" "$CLAUDE_DIR/references/base/documentation.md"
    [ -f "$CLAUDE_DIR/rules/11-security.md" ] && cp "$CLAUDE_DIR/rules/11-security.md" "$CLAUDE_DIR/references/base/security-principles.md"

    # C#-specific rules
    [ -f "$CLAUDE_DIR/rules/00-project-context.md" ] && cp "$CLAUDE_DIR/rules/00-project-context.md" "$CLAUDE_DIR/references/csharp/project-context.md"
    [ -f "$CLAUDE_DIR/rules/02-architecture-csharp.md" ] && cp "$CLAUDE_DIR/rules/02-architecture-csharp.md" "$CLAUDE_DIR/references/csharp/architecture.md"
    [ -f "$CLAUDE_DIR/rules/03-coding-standards.md" ] && cp "$CLAUDE_DIR/rules/03-coding-standards.md" "$CLAUDE_DIR/references/csharp/coding-standards.md"
    [ -f "$CLAUDE_DIR/rules/06-tooling.md" ] && cp "$CLAUDE_DIR/rules/06-tooling.md" "$CLAUDE_DIR/references/csharp/tooling.md"
    [ -f "$CLAUDE_DIR/rules/07-testing-csharp.md" ] && cp "$CLAUDE_DIR/rules/07-testing-csharp.md" "$CLAUDE_DIR/references/csharp/testing-csharp.md"
    [ -f "$CLAUDE_DIR/rules/08-quality-tools.md" ] && cp "$CLAUDE_DIR/rules/08-quality-tools.md" "$CLAUDE_DIR/references/csharp/quality-tools.md"
    [ -f "$CLAUDE_DIR/rules/11-security-csharp.md" ] && cp "$CLAUDE_DIR/rules/11-security-csharp.md" "$CLAUDE_DIR/references/csharp/security-csharp.md"
    [ -f "$CLAUDE_DIR/rules/12-aspire-cloud-native.md" ] && cp "$CLAUDE_DIR/rules/12-aspire-cloud-native.md" "$CLAUDE_DIR/references/csharp/aspire.md"

    # Backup and remove old rules directory
    mv "$CLAUDE_DIR/rules" "$CLAUDE_DIR/rules$BACKUP_SUFFIX"
    log_success "Rules moved to references/"
fi

# Step 4: Create minimal CLAUDE.md
log_info "Creating minimal CLAUDE.md..."
cat > "$CLAUDE_DIR/CLAUDE.md" << 'EOF'
# Claude-Craft - C#/.NET Project

**Stack**: .NET 9, C# 13, Clean Architecture, CQRS, MediatR, EF Core, xUnit

## Quick Reference

See `@.claude/INDEX.md` for condensed checklists and patterns.

## Full Documentation

For detailed rules and examples: `@.claude/references/<topic>.md`

## Available Commands

- `/csharp:check-compliance` - Full compliance audit
- `/csharp:check-architecture` - Architecture validation
- `/csharp:check-code-quality` - Code quality analysis
- `/csharp:check-testing` - Test coverage analysis
- `/csharp:check-security` - Security audit (OWASP)
- `/csharp:generate-feature` - Generate CQRS feature

## Docker Requirement

Always use Docker for commands to abstract from local environment.
EOF
log_success "Minimal CLAUDE.md created"

# Step 5: Create INDEX.md with summaries
log_info "Creating INDEX.md with condensed summaries..."
cat > "$CLAUDE_DIR/INDEX.md" << 'EOF'
# Claude-Craft Rules Index

## Project Context

**Stack**: .NET 9, C# 13, Clean Architecture, CQRS, MediatR, EF Core, xUnit

## Architecture Quick Reference

```
src/
├── Domain/        # NO external deps, private setters, Value Objects
├── Application/   # CQRS via MediatR, FluentValidation, DTOs
├── Infrastructure/# EF Core, external services
└── WebAPI/        # Minimal APIs or Controllers
```

**Dependency Rule**: WebAPI → Infrastructure → Application → Domain (INWARD ONLY)

## Coding Standards

| Element | Convention | Example |
|---------|-----------|---------|
| Public | PascalCase | `GetOrderAsync` |
| Private fields | _camelCase | `_orderRepository` |
| Async | Suffix Async | `ProcessAsync` |
| Params | camelCase | `orderId` |

**Always**: Pass `CancellationToken`, enable nullable reference types.

## SOLID Principles

- **S**RP: One reason to change per class
- **O**CP: Open for extension, closed for modification (use interfaces)
- **L**SP: Subtypes must be substitutable for base types
- **I**SP: Small, focused interfaces (< 5 methods)
- **D**IP: Depend on abstractions, not implementations

## KISS/DRY/YAGNI

- Methods < 20 lines, complexity < 10
- No code duplication (extract after 3 occurrences)
- Only implement what's explicitly required

## Testing Checklist

| Type | Coverage | Speed |
|------|----------|-------|
| Unit | 70% | < 1s each |
| Integration | 20% | < 5s each |
| E2E | 10% | < 30s each |

**TDD Cycle**: RED (failing test) → GREEN (minimal code) → REFACTOR

**C# Stack**: xUnit + FluentAssertions + Moq + Bogus + Testcontainers

## Security Essentials

- Validate ALL inputs server-side
- Use parameterized queries (never concatenate SQL)
- Policy-based authorization with `[Authorize(Policy = "...")]`
- Secrets in Key Vault (never in code)
- Security headers: CSP, X-Frame-Options, HSTS

## Git Workflow

**Conventional Commits**:
```
<type>(<scope>): <description>

Types: feat, fix, docs, style, refactor, perf, test, build, ci, chore
```

**Branch naming**: `feature/`, `fix/`, `refactor/`, `docs/`

## Analysis Workflow

Before ANY code change:
1. Understand the request
2. Read affected files + dependencies
3. Document: files impacted, risks, approach
4. Validate with user if medium/high impact
5. Write tests FIRST (TDD)

## Full Documentation

Access complete rules via `@.claude/references/`:

### Base Principles
- `base/workflow-analysis.md` - Mandatory analysis workflow
- `base/solid-principles.md` - SOLID in depth
- `base/kiss-dry-yagni.md` - Simplicity principles
- `base/git-workflow.md` - Git & conventional commits
- `base/documentation.md` - Doc standards

### C# Specific
- `csharp/architecture.md` - Clean Architecture details
- `csharp/coding-standards.md` - C# conventions
- `csharp/testing.md` - Testing patterns & frameworks
- `csharp/security.md` - OWASP & .NET security
- `csharp/tooling.md` - Dev environment setup
- `csharp/quality-tools.md` - Analyzers & formatters
- `csharp/aspire.md` - .NET Aspire cloud-native

## Skills

Invoke skills with `/skill-name`:
- `/testing` - Testing guidance
- `/security` - Security review
- `/git-workflow` - Git operations
- `/documentation` - Doc writing
- `/solid-principles` - SOLID review
- `/kiss-dry-yagni` - Simplicity review
- `/workflow-analysis` - Analysis workflow
EOF
log_success "INDEX.md created"

# Step 6: Create context.yaml if it doesn't exist
if [ ! -f "$CLAUDE_DIR/context.yaml" ]; then
    log_info "Creating context.yaml..."
    cat > "$CLAUDE_DIR/context.yaml" << 'EOF'
# Claude-Craft Context Configuration
version: "1.0"

file_contexts:
  "*.cs":
    suggest_skills: [solid-principles, kiss-dry-yagni]
    auto_load: false
  "*Test*.cs":
    suggest_skills: [testing]
    auto_load: false
  "*Auth*.cs":
    suggest_skills: [security]
    auto_load: false
  "*.md":
    suggest_skills: [documentation]
    auto_load: false

defaults:
  auto_load_skills: false
  suggest_workflow_analysis: true
EOF
    log_success "context.yaml created"
fi

# Summary
echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║                     Migration Complete!                        ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""
log_success "Migration completed successfully!"
echo ""
echo "Changes made:"
echo "  ✅ Created references/base/ and references/csharp/ directories"
echo "  ✅ Moved rules to references/ (original backed up)"
echo "  ✅ Created minimal CLAUDE.md (~200 tokens)"
echo "  ✅ Created INDEX.md with condensed summaries (~1,300 tokens)"
echo "  ✅ Created context.yaml for smart suggestions"
echo ""
echo "Backups created:"
echo "  📁 $CLAUDE_DIR/CLAUDE.md$BACKUP_SUFFIX"
if [ -d "$CLAUDE_DIR/rules$BACKUP_SUFFIX" ]; then
    echo "  📁 $CLAUDE_DIR/rules$BACKUP_SUFFIX/"
fi
echo ""
echo "Expected token reduction: ~70,000 → ~3,500 tokens (95% reduction)"
echo ""
echo "To access full documentation, use: @.claude/references/<topic>.md"
echo ""
