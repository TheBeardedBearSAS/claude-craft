#!/bin/bash
# Session initialization hook: Load project context at startup
# This runs on SessionStart event
set -e

# Read JSON input from stdin
INPUT=$(cat)
CWD=$(echo "$INPUT" | jq -r '.cwd // "."')

cd "$CWD" 2>/dev/null || true

# Set environment variables if CLAUDE_ENV_FILE is provided
if [ -n "$CLAUDE_ENV_FILE" ]; then
    # Detect and set appropriate environment

    # Node.js
    if [ -f "package.json" ]; then
        echo 'export NODE_ENV=development' >> "$CLAUDE_ENV_FILE"
    fi

    # Load .env.local or .env.development if exists (without secrets)
    if [ -f ".env.local" ]; then
        # Only export non-sensitive variables
        grep -E "^(NODE_ENV|APP_ENV|APP_DEBUG|DATABASE_URL|LOG_LEVEL|PORT|HOST)=" .env.local >> "$CLAUDE_ENV_FILE" 2>/dev/null || true
    fi
fi

# Build context information for Claude
build_context() {
    local context=""

    # Detect framework/stack
    if [ -f "composer.json" ]; then
        local symfony_version=$(jq -r '.require["symfony/framework-bundle"] // empty' composer.json 2>/dev/null)
        local php_version=$(jq -r '.require.php // empty' composer.json 2>/dev/null)
        [ -n "$symfony_version" ] && context+="Symfony $symfony_version, "
        [ -n "$php_version" ] && context+="PHP $php_version, "
    fi

    if [ -f "package.json" ]; then
        local node_version=$(jq -r '.engines.node // empty' package.json 2>/dev/null)
        local react_version=$(jq -r '.dependencies.react // empty' package.json 2>/dev/null)
        local next_version=$(jq -r '.dependencies.next // empty' package.json 2>/dev/null)
        [ -n "$react_version" ] && context+="React $react_version, "
        [ -n "$next_version" ] && context+="Next.js $next_version, "
    fi

    if [ -f "pubspec.yaml" ]; then
        context+="Flutter/Dart, "
    fi

    if [ -f "pyproject.toml" ]; then
        context+="Python, "
    fi

    # Database detection
    if [ -f "docker-compose.yml" ] || [ -f "docker-compose.yaml" ]; then
        grep -q "postgres" docker-compose.yml 2>/dev/null && context+="PostgreSQL, "
        grep -q "mysql" docker-compose.yml 2>/dev/null && context+="MySQL, "
        grep -q "redis" docker-compose.yml 2>/dev/null && context+="Redis, "
    fi

    # Remove trailing comma
    context="${context%, }"

    echo "$context"
}

CONTEXT=$(build_context)

if [ -n "$CONTEXT" ]; then
    echo "{\"hookSpecificOutput\": {\"hookEventName\": \"SessionStart\", \"additionalContext\": \"Project stack: $CONTEXT\"}}"
else
    echo '{"continue": true}'
fi

exit 0
