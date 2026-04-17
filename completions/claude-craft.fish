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
complete -c claude-craft -n "__fish_seen_subcommand_from angular" -a "check-architecture" -d "Check Angular architecture compliance"
complete -c claude-craft -n "__fish_seen_subcommand_from angular" -a "check-code-quality" -d "Check Angular code quality"
complete -c claude-craft -n "__fish_seen_subcommand_from angular" -a "check-compliance" -d "Check Angular compliance"
complete -c claude-craft -n "__fish_seen_subcommand_from angular" -a "check-security" -d "Check Angular security"
complete -c claude-craft -n "__fish_seen_subcommand_from angular" -a "check-testing" -d "Check Angular testing"
complete -c claude-craft -n "__fish_seen_subcommand_from angular" -a "generate-component" -d "Generate Angular component"

# Common commands
complete -c claude-craft -n "__fish_seen_subcommand_from common" -a "add-technology" -d "Add new technology stack"
complete -c claude-craft -n "__fish_seen_subcommand_from common" -a "architecture-decision" -d "Create ADR"
complete -c claude-craft -n "__fish_seen_subcommand_from common" -a "audit-freshness" -d "Audit documentation freshness"
complete -c claude-craft -n "__fish_seen_subcommand_from common" -a "daily-standup" -d "Daily standup report"
complete -c claude-craft -n "__fish_seen_subcommand_from common" -a "generate-changelog" -d "Generate CHANGELOG"
complete -c claude-craft -n "__fish_seen_subcommand_from common" -a "getting-started" -d "Getting started guide"
complete -c claude-craft -n "__fish_seen_subcommand_from common" -a "init" -d "Initialize Claude Craft"
complete -c claude-craft -n "__fish_seen_subcommand_from common" -a "pack-repo" -d "Pack repository for sharing"
complete -c claude-craft -n "__fish_seen_subcommand_from common" -a "pre-commit-check" -d "Pre-commit checks"
complete -c claude-craft -n "__fish_seen_subcommand_from common" -a "pre-merge-check" -d "Pre-merge checks"
complete -c claude-craft -n "__fish_seen_subcommand_from common" -a "ralph-run" -d "Run Ralph continuous loop"
complete -c claude-craft -n "__fish_seen_subcommand_from common" -a "release-checklist" -d "Release checklist"
complete -c claude-craft -n "__fish_seen_subcommand_from common" -a "research-context7" -d "Research with Context7"
complete -c claude-craft -n "__fish_seen_subcommand_from common" -a "setup-ci" -d "Setup CI/CD"
complete -c claude-craft -n "__fish_seen_subcommand_from common" -a "setup-project-context" -d "Setup project context"
complete -c claude-craft -n "__fish_seen_subcommand_from common" -a "setup-rtk" -d "Setup RTK token optimization"
complete -c claude-craft -n "__fish_seen_subcommand_from common" -a "sub-agents-patterns" -d "Sub-agents patterns"

# C# commands
complete -c claude-craft -n "__fish_seen_subcommand_from csharp" -a "check-architecture" -d "Check C# architecture"
complete -c claude-craft -n "__fish_seen_subcommand_from csharp" -a "check-code-quality" -d "Check C# code quality"
complete -c claude-craft -n "__fish_seen_subcommand_from csharp" -a "check-compliance" -d "Check C# compliance"
complete -c claude-craft -n "__fish_seen_subcommand_from csharp" -a "check-security" -d "Check C# security"
complete -c claude-craft -n "__fish_seen_subcommand_from csharp" -a "check-testing" -d "Check C# testing"
complete -c claude-craft -n "__fish_seen_subcommand_from csharp" -a "generate-feature" -d "Generate C# feature"

# Flutter commands
complete -c claude-craft -n "__fish_seen_subcommand_from flutter" -a "analyze-performance" -d "Analyze Flutter performance"
complete -c claude-craft -n "__fish_seen_subcommand_from flutter" -a "check-architecture" -d "Check Flutter architecture"
complete -c claude-craft -n "__fish_seen_subcommand_from flutter" -a "check-code-quality" -d "Check Flutter code quality"
complete -c claude-craft -n "__fish_seen_subcommand_from flutter" -a "check-compliance" -d "Check Flutter compliance"
complete -c claude-craft -n "__fish_seen_subcommand_from flutter" -a "check-security" -d "Check Flutter security"
complete -c claude-craft -n "__fish_seen_subcommand_from flutter" -a "check-testing" -d "Check Flutter testing"
complete -c claude-craft -n "__fish_seen_subcommand_from flutter" -a "generate-feature" -d "Generate Flutter feature"
complete -c claude-craft -n "__fish_seen_subcommand_from flutter" -a "generate-widget" -d "Generate Flutter widget"
complete -c claude-craft -n "__fish_seen_subcommand_from flutter" -a "golden-update" -d "Update golden tests"
complete -c claude-craft -n "__fish_seen_subcommand_from flutter" -a "localization-check" -d "Check localization"

# Laravel commands
complete -c claude-craft -n "__fish_seen_subcommand_from laravel" -a "check-architecture" -d "Check Laravel architecture"
complete -c claude-craft -n "__fish_seen_subcommand_from laravel" -a "check-code-quality" -d "Check Laravel code quality"
complete -c claude-craft -n "__fish_seen_subcommand_from laravel" -a "check-compliance" -d "Check Laravel compliance"
complete -c claude-craft -n "__fish_seen_subcommand_from laravel" -a "check-security" -d "Check Laravel security"
complete -c claude-craft -n "__fish_seen_subcommand_from laravel" -a "check-testing" -d "Check Laravel testing"
complete -c claude-craft -n "__fish_seen_subcommand_from laravel" -a "generate-controller" -d "Generate Laravel controller"

# PHP commands
complete -c claude-craft -n "__fish_seen_subcommand_from php" -a "check-architecture" -d "Check PHP architecture"
complete -c claude-craft -n "__fish_seen_subcommand_from php" -a "check-code-quality" -d "Check PHP code quality"
complete -c claude-craft -n "__fish_seen_subcommand_from php" -a "check-compliance" -d "Check PHP compliance"
complete -c claude-craft -n "__fish_seen_subcommand_from php" -a "check-security" -d "Check PHP security"
complete -c claude-craft -n "__fish_seen_subcommand_from php" -a "check-testing" -d "Check PHP testing"

# Python commands
complete -c claude-craft -n "__fish_seen_subcommand_from python" -a "async-check" -d "Check async/await usage"
complete -c claude-craft -n "__fish_seen_subcommand_from python" -a "check-architecture" -d "Check Python architecture"
complete -c claude-craft -n "__fish_seen_subcommand_from python" -a "check-code-quality" -d "Check Python code quality"
complete -c claude-craft -n "__fish_seen_subcommand_from python" -a "check-compliance" -d "Check Python compliance"
complete -c claude-craft -n "__fish_seen_subcommand_from python" -a "check-security" -d "Check Python security"
complete -c claude-craft -n "__fish_seen_subcommand_from python" -a "check-testing" -d "Check Python testing"
complete -c claude-craft -n "__fish_seen_subcommand_from python" -a "dependency-audit" -d "Audit dependencies"
complete -c claude-craft -n "__fish_seen_subcommand_from python" -a "generate-endpoint" -d "Generate API endpoint"
complete -c claude-craft -n "__fish_seen_subcommand_from python" -a "generate-model" -d "Generate model"
complete -c claude-craft -n "__fish_seen_subcommand_from python" -a "type-coverage" -d "Check type coverage"

# QA commands
complete -c claude-craft -n "__fish_seen_subcommand_from qa" -a "fix" -d "Fix failing test"
complete -c claude-craft -n "__fish_seen_subcommand_from qa" -a "recette" -d "Run acceptance testing"
complete -c claude-craft -n "__fish_seen_subcommand_from qa" -a "regression" -d "Regression testing"
complete -c claude-craft -n "__fish_seen_subcommand_from qa" -a "report" -d "Generate QA report"
complete -c claude-craft -n "__fish_seen_subcommand_from qa" -a "status" -d "QA status"
complete -c claude-craft -n "__fish_seen_subcommand_from qa" -a "tdd" -d "TDD workflow"

# React commands
complete -c claude-craft -n "__fish_seen_subcommand_from react" -a "accessibility-check" -d "Check accessibility"
complete -c claude-craft -n "__fish_seen_subcommand_from react" -a "bundle-analyze" -d "Analyze bundle size"
complete -c claude-craft -n "__fish_seen_subcommand_from react" -a "check-architecture" -d "Check React architecture"
complete -c claude-craft -n "__fish_seen_subcommand_from react" -a "check-code-quality" -d "Check React code quality"
complete -c claude-craft -n "__fish_seen_subcommand_from react" -a "check-compliance" -d "Check React compliance"
complete -c claude-craft -n "__fish_seen_subcommand_from react" -a "check-security" -d "Check React security"
complete -c claude-craft -n "__fish_seen_subcommand_from react" -a "check-testing" -d "Check React testing"
complete -c claude-craft -n "__fish_seen_subcommand_from react" -a "generate-component" -d "Generate React component"
complete -c claude-craft -n "__fish_seen_subcommand_from react" -a "generate-hook" -d "Generate custom hook"
complete -c claude-craft -n "__fish_seen_subcommand_from react" -a "storybook-story" -d "Generate Storybook story"

# React Native commands
complete -c claude-craft -n "__fish_seen_subcommand_from reactnative" -a "app-size" -d "Analyze app size"
complete -c claude-craft -n "__fish_seen_subcommand_from reactnative" -a "check-architecture" -d "Check RN architecture"
complete -c claude-craft -n "__fish_seen_subcommand_from reactnative" -a "check-code-quality" -d "Check RN code quality"
complete -c claude-craft -n "__fish_seen_subcommand_from reactnative" -a "check-compliance" -d "Check RN compliance"
complete -c claude-craft -n "__fish_seen_subcommand_from reactnative" -a "check-security" -d "Check RN security"
complete -c claude-craft -n "__fish_seen_subcommand_from reactnative" -a "check-testing" -d "Check RN testing"
complete -c claude-craft -n "__fish_seen_subcommand_from reactnative" -a "deep-link" -d "Setup deep linking"
complete -c claude-craft -n "__fish_seen_subcommand_from reactnative" -a "generate-screen" -d "Generate screen"
complete -c claude-craft -n "__fish_seen_subcommand_from reactnative" -a "native-module" -d "Generate native module"
complete -c claude-craft -n "__fish_seen_subcommand_from reactnative" -a "store-prepare" -d "Prepare store submission"

# Symfony commands
complete -c claude-craft -n "__fish_seen_subcommand_from symfony" -a "api-endpoint" -d "Generate API endpoint"
complete -c claude-craft -n "__fish_seen_subcommand_from symfony" -a "check-architecture" -d "Check Symfony architecture"
complete -c claude-craft -n "__fish_seen_subcommand_from symfony" -a "check-code-quality" -d "Check Symfony code quality"
complete -c claude-craft -n "__fish_seen_subcommand_from symfony" -a "check-compliance" -d "Check Symfony compliance"
complete -c claude-craft -n "__fish_seen_subcommand_from symfony" -a "check-security" -d "Check Symfony security"
complete -c claude-craft -n "__fish_seen_subcommand_from symfony" -a "check-testing" -d "Check Symfony testing"
complete -c claude-craft -n "__fish_seen_subcommand_from symfony" -a "generate-command" -d "Generate console command"
complete -c claude-craft -n "__fish_seen_subcommand_from symfony" -a "generate-crud" -d "Generate CRUD"
complete -c claude-craft -n "__fish_seen_subcommand_from symfony" -a "migration-plan" -d "Create migration plan"
complete -c claude-craft -n "__fish_seen_subcommand_from symfony" -a "optimize-doctrine" -d "Optimize Doctrine queries"

# Team commands
complete -c claude-craft -n "__fish_seen_subcommand_from team" -a "audit" -d "Team audit"
complete -c claude-craft -n "__fish_seen_subcommand_from team" -a "delivery" -d "Delivery workflow"
complete -c claude-craft -n "__fish_seen_subcommand_from team" -a "security" -d "Security audit"
complete -c claude-craft -n "__fish_seen_subcommand_from team" -a "sprint" -d "Sprint planning"

# UI/UX commands
complete -c claude-craft -n "__fish_seen_subcommand_from uiux" -a "a11y-audit" -d "Accessibility audit"
complete -c claude-craft -n "__fish_seen_subcommand_from uiux" -a "a11y-component" -d "Accessible component"
complete -c claude-craft -n "__fish_seen_subcommand_from uiux" -a "audit" -d "UI/UX audit"
complete -c claude-craft -n "__fish_seen_subcommand_from uiux" -a "component-spec" -d "Component specification"
complete -c claude-craft -n "__fish_seen_subcommand_from uiux" -a "design-tokens" -d "Generate design tokens"
complete -c claude-craft -n "__fish_seen_subcommand_from uiux" -a "generate-design-md" -d "Generate DESIGN.md"
complete -c claude-craft -n "__fish_seen_subcommand_from uiux" -a "orchestrator" -d "UI/UX orchestrator"
complete -c claude-craft -n "__fish_seen_subcommand_from uiux" -a "user-flow" -d "User flow analysis"

# Vue.js commands
complete -c claude-craft -n "__fish_seen_subcommand_from vuejs" -a "check-architecture" -d "Check Vue.js architecture"
complete -c claude-craft -n "__fish_seen_subcommand_from vuejs" -a "check-code-quality" -d "Check Vue.js code quality"
complete -c claude-craft -n "__fish_seen_subcommand_from vuejs" -a "check-compliance" -d "Check Vue.js compliance"
complete -c claude-craft -n "__fish_seen_subcommand_from vuejs" -a "check-security" -d "Check Vue.js security"
complete -c claude-craft -n "__fish_seen_subcommand_from vuejs" -a "check-testing" -d "Check Vue.js testing"
complete -c claude-craft -n "__fish_seen_subcommand_from vuejs" -a "generate-component" -d "Generate Vue component"

# Workflow commands
complete -c claude-craft -n "__fish_seen_subcommand_from workflow" -a "analyze" -d "Analyze workflow"
complete -c claude-craft -n "__fish_seen_subcommand_from workflow" -a "design" -d "Design phase"
complete -c claude-craft -n "__fish_seen_subcommand_from workflow" -a "implement" -d "Implementation phase"
complete -c claude-craft -n "__fish_seen_subcommand_from workflow" -a "init" -d "Initialize workflow"
complete -c claude-craft -n "__fish_seen_subcommand_from workflow" -a "plan" -d "Planning phase"
complete -c claude-craft -n "__fish_seen_subcommand_from workflow" -a "retro" -d "Retrospective"
complete -c claude-craft -n "__fish_seen_subcommand_from workflow" -a "review" -d "Review workflow"
complete -c claude-craft -n "__fish_seen_subcommand_from workflow" -a "start" -d "Start workflow"
complete -c claude-craft -n "__fish_seen_subcommand_from workflow" -a "status" -d "Workflow status"
