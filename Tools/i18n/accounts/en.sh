#!/bin/bash
# =============================================================================
# Claude Accounts - English Messages
# =============================================================================

# Header
MSG_HEADER="Claude Code Multi-Account Manager"

# Menu
MSG_MENU_TITLE="What do you want to do?"
MSG_MENU_LIST="List profiles"
MSG_MENU_ADD="Add a profile"
MSG_MENU_REMOVE="Delete a profile"
MSG_MENU_AUTH="Authenticate a profile"
MSG_MENU_LAUNCH="Launch Claude Code"
MSG_MENU_CC_FUNC="Install cc() function"
MSG_MENU_MIGRATE="Migrate a legacy profile"
MSG_MENU_HELP="Help"
MSG_MENU_QUIT="Quit"

# Status
MSG_STATUS_AUTH="authenticated"
MSG_STATUS_NOT_AUTH="not authenticated"
MSG_STATUS_LEGEND_AUTH="= authenticated"
MSG_STATUS_LEGEND_NOT_AUTH="= not authenticated"

# Profile modes
MSG_MODE_SHARED="shared"
MSG_MODE_ISOLATED="isolated"
MSG_MODE_LEGACY="legacy"
MSG_MODE_LABEL_SHARED="[shared]"
MSG_MODE_LABEL_ISOLATED="[isolated]"
MSG_MODE_LABEL_LEGACY="[legacy]"
MSG_MODE_LEGEND="config ~/.claude"
MSG_MODE_LEGEND_ISOLATED="independent config"
MSG_MODE_LEGEND_LEGACY="old profile"

# List profiles
MSG_PROFILES_TITLE="Configured profiles:"
MSG_NO_PROFILE="No profile configured"
MSG_USE_ADD="Use Add profile to get started"
MSG_PROFILES_AVAILABLE="Available profiles:"
MSG_ALIAS_LABEL="Alias:"

# Directory
MSG_PROFILES_DIR_CREATED="Profiles directory created:"

# Add profile
MSG_ADD_TITLE="Add a new profile"
MSG_ADD_NAME_PROMPT="Profile name (e.g., personal, work, client-acme):"
MSG_ADD_NAME_EMPTY="Name cannot be empty"
MSG_ADD_PROFILE_EXISTS="Profile already exists"
MSG_ADD_PROFILE_CREATED="Profile created"
MSG_ADD_AUTH_NOW="Authenticate this profile now?"
MSG_ADD_AUTH_LATER="To authenticate later:"
MSG_ADD_AUTH_OR="Or relaunch this script and choose 'Authenticate a profile'"

# Mode selection
MSG_MODE_CHOOSE="Choose profile mode:"
MSG_MODE_SHARED_DESC="Shared  - Same config as ~/.claude (switch for limits)"
MSG_MODE_ISOLATED_DESC="Isolated - Independent config (e.g., client)"
MSG_MODE_PROMPT="Mode [1]:"

# Setup messages
MSG_SYMLINK_CREATED="Symlink created to ~/.claude"
MSG_CLAUDE_DIR_MISSING="~/.claude doesn't exist, symlink will be created later"
MSG_CONFIG_COPIED="Configuration copied from ~/.claude"
MSG_EMPTY_PROFILE="~/.claude doesn't exist, empty profile created"

# Remove profile
MSG_REMOVE_TITLE="Delete a profile"
MSG_REMOVE_NO_PROFILE="No profile to delete"
MSG_REMOVE_NUMBER_PROMPT="Profile number to delete (or name):"
MSG_REMOVE_NOT_FOUND="Profile not found"
MSG_REMOVE_CONFIRM="You will delete profile"
MSG_REMOVE_CANCELLED="Deletion cancelled"
MSG_REMOVE_DONE="Profile deleted"
MSG_ALIAS_REMOVED="Alias removed from"

# Migrate profile
MSG_MIGRATE_TITLE="Migrate a legacy profile"
MSG_MIGRATE_NO_LEGACY="No legacy profile to migrate (all have a mode)"
MSG_MIGRATE_LEGACY_LIST="Legacy profiles (no mode):"
MSG_MIGRATE_NUMBER_PROMPT="Profile number to migrate:"
MSG_MIGRATE_TO_MODE="Migrate to which mode?"
MSG_MIGRATE_SHARED_DESC="Shared  - Create symlink to ~/.claude"
MSG_MIGRATE_ISOLATED_DESC="Isolated - Keep current config isolated"
MSG_MIGRATE_DONE_SHARED="Profile migrated to SHARED mode"
MSG_MIGRATE_DONE_ISOLATED="Profile migrated to ISOLATED mode"
MSG_MIGRATE_CONFIG_KEPT="Existing configuration kept"

# Auth profile
MSG_AUTH_TITLE="Authenticate a profile"
MSG_AUTH_CREATE_FIRST="No profile configured. Create a profile first."
MSG_AUTH_NUMBER_PROMPT="Profile number to authenticate:"
MSG_AUTH_LAUNCHING="Launching Claude Code for profile"
MSG_AUTH_CONNECT="Connect with the desired account"

# Launch profile
MSG_LAUNCH_TITLE="Launch Claude Code"
MSG_LAUNCH_DEFAULT="default (default config)"
MSG_LAUNCH_PROMPT="Choice:"
MSG_LAUNCH_WITH_DEFAULT="Launching with default config..."
MSG_LAUNCH_WITH_PROFILE="Launching profile"
MSG_LAUNCH_NO_PROFILE="No profile configured, launching with default config"

# Usage/Help
MSG_USAGE_TITLE="Usage"
MSG_USAGE_QUICK="Quick commands:"
MSG_USAGE_ADD_DESC="Add a new profile (shared or isolated)"
MSG_USAGE_RM_DESC="Delete a profile"
MSG_USAGE_LIST_DESC="List profiles with their mode"
MSG_USAGE_AUTH_DESC="Authenticate a profile"
MSG_USAGE_RUN_DESC="Launch Claude Code with a profile"
MSG_USAGE_MIGRATE_DESC="Migrate a legacy profile to shared/isolated"
MSG_USAGE_MODES="Profile modes:"
MSG_USAGE_MODE_SHARED_DESC="Common config (~/.claude), switch for limits"
MSG_USAGE_MODE_ISOLATED_DESC="Independent config, for clients"
MSG_USAGE_MODE_LEGACY_DESC="Old profile, can be migrated"
MSG_USAGE_ALIAS="After configuration, use aliases:"
MSG_USAGE_OR_CC="Or the cc() function if added:"
MSG_USAGE_LANG_DESC="Language (en, fr, es, de, pt)"

# cc() function
MSG_CC_TITLE="Install cc() function"
MSG_CC_ALREADY="cc() function is already installed"
MSG_CC_ADDED="cc() function added to"
MSG_CC_USAGE="Usage:"
MSG_CC_MENU="Selection menu"
MSG_CC_PROFILE="Profile"
MSG_CC_NOT_FOUND="not found. Available profiles:"
MSG_CC_NONE="(none)"

# Alias
MSG_ALIAS_EXISTS="Alias already present in"
MSG_ALIAS_ADDED="Alias added to"
MSG_SOURCE_OR_NEW="Run source or open a new terminal"

# Prompts
MSG_CONFIRM_YES_NO="(y/N)"
MSG_PRESS_ENTER="Press Enter to continue..."
MSG_INVALID_CHOICE="Invalid choice"
MSG_UNKNOWN_COMMAND="Unknown command:"
MSG_GOODBYE="Goodbye!"
MSG_INVALID_LANG="Invalid language:"
MSG_VALID_LANGS="Valid languages:"

# Mode in creation
MSG_MODE_IN="in mode"
