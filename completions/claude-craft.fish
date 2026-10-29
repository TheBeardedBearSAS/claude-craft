# Claude Craft - Fish Shell Completion
# Installation: copy to ~/.config/fish/completions/

# Namespaces
complete -c claude-craft -n "__fish_is_first_token" -a "angular" -d "Angular commands"
complete -c claude-craft -n "__fish_is_first_token" -a "common" -d "Common commands"
complete -c claude-craft -n "__fish_is_first_token" -a "csharp" -d "C# commands"
complete -c claude-craft -n "__fish_is_first_token" -a "flutter" -d "Flutter commands"
complete -c claude-craft -n "__fish_is_first_token" -a "laravel" -d "Laravel commands"
complete -c claude-craft -n "__fish_is_first_token" -a "php" -d "PHP commands"
complete -c claude-craft -n "__fish_is_first_token" -a "python" -d "Python commands"
complete -c claude-craft -n "__fish_is_first_token" -a "qa" -d "QA commands"
complete -c claude-craft -n "__fish_is_first_token" -a "react" -d "React commands"
complete -c claude-craft -n "__fish_is_first_token" -a "reactnative" -d "React Native commands"
complete -c claude-craft -n "__fish_is_first_token" -a "symfony" -d "Symfony commands"
complete -c claude-craft -n "__fish_is_first_token" -a "team" -d "Team commands"
complete -c claude-craft -n "__fish_is_first_token" -a "uiux" -d "UI/UX commands"
complete -c claude-craft -n "__fish_is_first_token" -a "vuejs" -d "Vue.js commands"
complete -c claude-craft -n "__fish_is_first_token" -a "workflow" -d "Workflow commands"

# Angular commands
complete -c claude-craft -n "__fish_seen_subcommand_from angular" -a "check" -d "Audit by axis (architecture, code-quality, security, testing, all)"
complete -c claude-craft -n "__fish_seen_subcommand_from angular" -a "generate-component" -d "Generate Angular component"

# Common commands
complete -c claude-craft -n "__fish_seen_subcommand_from common" -a "architecture-decision" -d "Create ADR"
complete -c claude-craft -n "__fish_seen_subcommand_from common" -a "generate-changelog" -d "Generate CHANGELOG"
complete -c claude-craft -n "__fish_seen_subcommand_from common" -a "getting-started" -d "Getting started guide"
complete -c claude-craft -n "__fish_seen_subcommand_from common" -a "init" -d "Initialize Claude Craft"
complete -c claude-craft -n "__fish_seen_subcommand_from common" -a "pack-repo" -d "Pack repository for sharing"
complete -c claude-craft -n "__fish_seen_subcommand_from common" -a "ralph-run" -d "Run Ralph continuous loop"
complete -c claude-craft -n "__fish_seen_subcommand_from common" -a "setup-ci" -d "Setup CI/CD"
complete -c claude-craft -n "__fish_seen_subcommand_from common" -a "setup-rtk" -d "Setup RTK token optimization"

# C# commands
complete -c claude-craft -n "__fish_seen_subcommand_from csharp" -a "check" -d "Audit by axis (architecture, code-quality, security, testing, all)"
complete -c claude-craft -n "__fish_seen_subcommand_from csharp" -a "generate-feature" -d "Generate C# feature"

# Flutter commands
complete -c claude-craft -n "__fish_seen_subcommand_from flutter" -a "analyze-performance" -d "Analyze Flutter performance"
complete -c claude-craft -n "__fish_seen_subcommand_from flutter" -a "check" -d "Audit by axis (architecture, code-quality, security, testing, all)"
complete -c claude-craft -n "__fish_seen_subcommand_from flutter" -a "generate-feature" -d "Generate Flutter feature"
complete -c claude-craft -n "__fish_seen_subcommand_from flutter" -a "generate-widget" -d "Generate Flutter widget"
complete -c claude-craft -n "__fish_seen_subcommand_from flutter" -a "golden-update" -d "Update golden tests"
complete -c claude-craft -n "__fish_seen_subcommand_from flutter" -a "localization-check" -d "Check localization"

# Laravel commands
complete -c claude-craft -n "__fish_seen_subcommand_from laravel" -a "check" -d "Audit by axis (architecture, code-quality, security, testing, all)"
complete -c claude-craft -n "__fish_seen_subcommand_from laravel" -a "generate-controller" -d "Generate Laravel controller"

# PHP commands
complete -c claude-craft -n "__fish_seen_subcommand_from php" -a "check" -d "Audit by axis (architecture, code-quality, security, testing, all)"

# Python commands
complete -c claude-craft -n "__fish_seen_subcommand_from python" -a "async-check" -d "Check async/await usage"
complete -c claude-craft -n "__fish_seen_subcommand_from python" -a "check" -d "Audit by axis (architecture, code-quality, security, testing, all)"
complete -c claude-craft -n "__fish_seen_subcommand_from python" -a "dependency-audit" -d "Audit dependencies"
complete -c claude-craft -n "__fish_seen_subcommand_from python" -a "generate-endpoint" -d "Generate API endpoint"
complete -c claude-craft -n "__fish_seen_subcommand_from python" -a "generate-model" -d "Generate model"
complete -c claude-craft -n "__fish_seen_subcommand_from python" -a "type-coverage" -d "Check type coverage"

# QA commands
complete -c claude-craft -n "__fish_seen_subcommand_from qa" -a "fix" -d "Fix failing test"
complete -c claude-craft -n "__fish_seen_subcommand_from qa" -a "recette" -d "Run acceptance testing"
complete -c claude-craft -n "__fish_seen_subcommand_from qa" -a "regression" -d "Regression testing"
complete -c claude-craft -n "__fish_seen_subcommand_from qa" -a "status" -d "QA status"
complete -c claude-craft -n "__fish_seen_subcommand_from qa" -a "tdd" -d "TDD workflow"

# React commands
complete -c claude-craft -n "__fish_seen_subcommand_from react" -a "accessibility-check" -d "Check accessibility"
complete -c claude-craft -n "__fish_seen_subcommand_from react" -a "bundle-analyze" -d "Analyze bundle size"
complete -c claude-craft -n "__fish_seen_subcommand_from react" -a "check" -d "Audit by axis (architecture, code-quality, security, testing, all)"
complete -c claude-craft -n "__fish_seen_subcommand_from react" -a "generate-component" -d "Generate React component"
complete -c claude-craft -n "__fish_seen_subcommand_from react" -a "generate-hook" -d "Generate custom hook"
complete -c claude-craft -n "__fish_seen_subcommand_from react" -a "storybook-story" -d "Generate Storybook story"

# React Native commands
complete -c claude-craft -n "__fish_seen_subcommand_from reactnative" -a "app-size" -d "Analyze app size"
complete -c claude-craft -n "__fish_seen_subcommand_from reactnative" -a "check" -d "Audit by axis (architecture, code-quality, security, testing, all)"
complete -c claude-craft -n "__fish_seen_subcommand_from reactnative" -a "deep-link" -d "Setup deep linking"
complete -c claude-craft -n "__fish_seen_subcommand_from reactnative" -a "generate-screen" -d "Generate screen"
complete -c claude-craft -n "__fish_seen_subcommand_from reactnative" -a "native-module" -d "Generate native module"
complete -c claude-craft -n "__fish_seen_subcommand_from reactnative" -a "store-prepare" -d "Prepare store submission"

# Symfony commands
complete -c claude-craft -n "__fish_seen_subcommand_from symfony" -a "api-endpoint" -d "Generate API endpoint"
complete -c claude-craft -n "__fish_seen_subcommand_from symfony" -a "check" -d "Audit by axis (architecture, code-quality, security, testing, all)"
complete -c claude-craft -n "__fish_seen_subcommand_from symfony" -a "generate-command" -d "Generate console command"
complete -c claude-craft -n "__fish_seen_subcommand_from symfony" -a "generate-crud" -d "Generate CRUD"
complete -c claude-craft -n "__fish_seen_subcommand_from symfony" -a "migration-plan" -d "Create migration plan"
complete -c claude-craft -n "__fish_seen_subcommand_from symfony" -a "optimize-doctrine" -d "Optimize Doctrine queries"

# Team commands
complete -c claude-craft -n "__fish_seen_subcommand_from team" -a "audit" -d "Team audit"
complete -c claude-craft -n "__fish_seen_subcommand_from team" -a "delivery" -d "Delivery workflow"
complete -c claude-craft -n "__fish_seen_subcommand_from team" -a "security" -d "Security audit"

# UI/UX commands
complete -c claude-craft -n "__fish_seen_subcommand_from uiux" -a "a11y-audit" -d "Accessibility audit"
complete -c claude-craft -n "__fish_seen_subcommand_from uiux" -a "a11y-component" -d "Accessible component"
complete -c claude-craft -n "__fish_seen_subcommand_from uiux" -a "audit" -d "UI/UX audit"
complete -c claude-craft -n "__fish_seen_subcommand_from uiux" -a "component-spec" -d "Component specification"
complete -c claude-craft -n "__fish_seen_subcommand_from uiux" -a "design-tokens" -d "Generate design tokens"
complete -c claude-craft -n "__fish_seen_subcommand_from uiux" -a "generate-design-md" -d "Generate DESIGN.md"
complete -c claude-craft -n "__fish_seen_subcommand_from uiux" -a "user-flow" -d "User flow analysis"

# Vue.js commands
complete -c claude-craft -n "__fish_seen_subcommand_from vuejs" -a "check" -d "Audit by axis (architecture, code-quality, security, testing, all)"
complete -c claude-craft -n "__fish_seen_subcommand_from vuejs" -a "generate-component" -d "Generate Vue component"

# Workflow commands
complete -c claude-craft -n "__fish_seen_subcommand_from workflow" -a "design" -d "Design phase"
complete -c claude-craft -n "__fish_seen_subcommand_from workflow" -a "implement" -d "Implementation phase"
complete -c claude-craft -n "__fish_seen_subcommand_from workflow" -a "init" -d "Initialize workflow"
complete -c claude-craft -n "__fish_seen_subcommand_from workflow" -a "plan" -d "Planning phase"
complete -c claude-craft -n "__fish_seen_subcommand_from workflow" -a "retro" -d "Retrospective"
complete -c claude-craft -n "__fish_seen_subcommand_from workflow" -a "review" -d "Review workflow"
complete -c claude-craft -n "__fish_seen_subcommand_from workflow" -a "start" -d "Start workflow"
complete -c claude-craft -n "__fish_seen_subcommand_from workflow" -a "status" -d "Workflow status"
