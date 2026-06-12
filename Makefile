#===============================================================================
# Makefile - Claude Code Rules Installation
#
# Facilite l'installation des règles, agents et commandes Claude Code
# pour différentes technologies dans vos projets.
#
# Usage:
#   make help                    # Afficher l'aide
#   make install-all TARGET=~/project
#   make list                    # Lister les composants disponibles
#
# NOTE: Individual technology installation is handled by the CLI:
#   npx @the-bearded-bear/claude-craft install <path> --tech=<name>
#===============================================================================

.PHONY: help install-all install-common install-project install-infra \
        install-tools install-tools-lib install-completions \
        install-web install-fullstack-js install-mobile install-backend \
        list list-agents list-commands \
        config-install config-install-all config-validate config-list config-dry-run \
        config-check config-check-fix check fix-permissions stats \
        migrate-check test-tools test-rtk test-statusline test-agent-teams test-bats test-all \
        plugin-export plugin-export-all

# Configuration
SHELL := /bin/bash
SCRIPTS_DIR := $(CURDIR)/Dev/scripts
I18N_DIR := $(CURDIR)/Dev/i18n
TOOLS_DIR := $(CURDIR)/Tools
INFRA_DIR := $(CURDIR)/Infra
PROJECT_DIR := $(CURDIR)/Project
TARGET ?= .
OPTIONS ?=
CONFIG ?= $(CURDIR)/claude-projects.yaml
PROJECT ?=
RULES_LANG ?= en

# Couleurs
CYAN := $(shell printf '\033[0;36m')
GREEN := $(shell printf '\033[0;32m')
YELLOW := $(shell printf '\033[1;33m')
RED := $(shell printf '\033[0;31m')
NC := $(shell printf '\033[0m')

# Liste des technologies supportées (doit correspondre à INSTALLABLE_TECHS dans cli/lib/tech-registry.js)
# Note : 'php' est exclu car c'est une couche de base auto-incluse avec symfony/laravel (audit DX-07)
TECHS := symfony flutter python react reactnative angular csharp laravel vuejs paperclip
INFRA_TECHS := docker coolify kubernetes opentofu ansible hcloud pgbouncer frankenphp

help: ## Affiche cette aide
	@echo "$(CYAN)Claude Code Rules - Makefile$(NC)\n" && \
	echo "$(YELLOW)Usage:$(NC) make <target> TARGET=<path> [RULES_LANG=en]\n" && \
	grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | \
	awk 'BEGIN {FS = ":.*?## "}; {printf "  $(GREEN)%-25s$(NC) %s\n", $$1, $$2}'

#===============================================================================
# Installation - Pattern Rules
#===============================================================================

# Installation des technologies via CLI (recommended)
install-%: ## Installe les regles pour une techno (ex: make install-symfony)
	@echo "$(CYAN)Installation via CLI: $* (lang=$(RULES_LANG))...$(NC)"
	@npx @the-bearded-bear/claude-craft install $(TARGET) --tech=$* --lang=$(RULES_LANG)

# Installation infra via pattern rule
install-infra-%: ## Installe les regles infra (ex: make install-infra-docker)
	@echo "$(CYAN)Installation des regles $* (lang=$(RULES_LANG))...$(NC)"
	@$(INFRA_DIR)/install-$*-rules.sh --lang=$(RULES_LANG) $(OPTIONS) $(TARGET)

install-all: install-common $(addprefix install-,$(TECHS)) $(addprefix install-infra-,$(INFRA_TECHS)) install-project ## Installe TOUTES les regles
	@echo "$(GREEN)Installation complete terminee !$(NC)"

install-common: ## Installe les regles communes (agents transversaux, /common:)
	@echo "$(CYAN)Installation des regles communes (lang=$(RULES_LANG))...$(NC)"
	@$(SCRIPTS_DIR)/install-common-rules.sh --lang=$(RULES_LANG) $(OPTIONS) $(TARGET)

install-project: ## Installe les commandes de gestion de projet (EPICs, US, Tasks)
	@echo "$(CYAN)Installation des commandes Project (lang=$(RULES_LANG))...$(NC)"
	@$(PROJECT_DIR)/install-project-commands.sh --lang=$(RULES_LANG) $(TARGET)

install-infra: $(addprefix install-infra-,$(INFRA_TECHS)) ## Installe tous les agents infra

# Combinaisons courantes
install-web: install-common install-react ## Common + React
install-fullstack-js: install-common install-react install-python ## Common + React + Python
install-mobile: install-common install-flutter install-reactnative ## Common + Flutter + RN
install-backend: install-common install-symfony install-python ## Common + Symfony + Python

#===============================================================================
# Outils Claude Code
#===============================================================================

# Generic tool installer
TOOL_INSTALL = @echo "$(CYAN)Installation de $1...$(NC)" && mkdir -p $2 && cp "$(TOOLS_DIR)/$3" $2/$4 && chmod +x $2/$4 && echo "$(GREEN)$1 installe !$(NC)"

install-tools: install-statusline install-multiaccount install-projectconfig install-rtk ## Installe tous les outils

install-statusline: ## Installe la status line personnalisee
	$(call TOOL_INSTALL,Status Line,~/.claude,StatusLine/statusline.sh,statusline.sh)

install-multiaccount: install-tools-lib ## Installe le gestionnaire multi-comptes
	$(call TOOL_INSTALL,Multi-Account Manager,~/.local/bin,MultiAccount/claude-accounts.sh,claude-accounts)

install-projectconfig: install-tools-lib ## Installe le gestionnaire de projets YAML
	$(call TOOL_INSTALL,Project Config Manager,~/.local/bin,ProjectConfig/claude-projects.sh,claude-projects)

install-rtk: ## Installe RTK (Rust Token Killer)
	@bash "$(TOOLS_DIR)/RTK/install-rtk.sh" --lang=$(RULES_LANG)

install-completions: ## Installe les completions bash/zsh
	@mkdir -p ~/.local/share/bash-completion/completions ~/.zsh/completions && \
	cp "$(TOOLS_DIR)/MultiAccount/completions/claude-accounts.bash" ~/.local/share/bash-completion/completions/ && \
	cp "$(TOOLS_DIR)/MultiAccount/completions/_claude-accounts" ~/.zsh/completions/

install-tools-lib: ## Installe la librairie partagee
	@mkdir -p ~/.local/lib/claude-craft && cp "$(TOOLS_DIR)/lib/tools-ui.sh" ~/.local/lib/claude-craft/

#===============================================================================
# Tests
#===============================================================================

# Pattern rule pour tests bats
BATS_RUN = docker run --rm -v "$(CURDIR)/Tools:/mnt" bats/bats:latest /mnt/$*/tests/

test-%: ## Lance les tests bats pour un outil (ex: make test-tools)
	@$(BATS_RUN)

test-bats: test-MultiAccount test-StatusLine test-RTK test-AgentTeams ## Lance tous les tests bats

test-all: ## Lance tous les tests (vitest + bats)
	@npm test && $(MAKE) test-bats

#===============================================================================
# Configuration YAML
#===============================================================================

# Pattern rule pour config operations
CONFIG_SCRIPT = $(SCRIPTS_DIR)/install-from-config.sh

config-%: ## Operations config YAML (install/install-all/validate/list)
	@$(CONFIG_SCRIPT) --$* $(if $(PROJECT),--project $(PROJECT)) $(OPTIONS) $(CONFIG)

#===============================================================================
# Plugin Export
#===============================================================================

PLUGIN_OUTPUT ?= ./dist/plugins

plugin-export-%: ## Exporte une techno comme plugin (ex: make plugin-export-symfony)
	@$(TOOLS_DIR)/PluginExport/export-plugin.sh --tech=$* --lang=$(RULES_LANG) $(PLUGIN_OUTPUT)

plugin-export-all: ## Exporte toutes les technologies
	@$(TOOLS_DIR)/PluginExport/export-plugin.sh --all --lang=$(RULES_LANG) $(PLUGIN_OUTPUT)

#===============================================================================
# Lister les Composants
#===============================================================================

list: ## Liste les agents et commandes disponibles
	@echo "$(CYAN)AGENTS (lang=$(RULES_LANG))$(NC)" && \
	for tech in Common $(shell echo $(TECHS) | tr ' ' '\n' | sed 's/.*/\u&/'); do \
		dir="$(I18N_DIR)/$(RULES_LANG)/$$tech/agents"; \
		[ -d "$$dir" ] && echo "$(YELLOW)$$tech:$(NC)" && ls -1 "$$dir"/*.md 2>/dev/null | xargs -r -I {} basename {} .md | sed 's/^/  - /' || true; \
	done && echo "" && echo "$(CYAN)COMMANDES$(NC)" && \
	for tech in Common Workflow Team QA UIUX $(shell echo $(TECHS) | tr ' ' '\n' | sed 's/.*/\u&/'); do \
		dir="$(I18N_DIR)/$(RULES_LANG)/$$tech/commands"; prefix=$$(echo "$$tech" | tr '[:upper:]' '[:lower:]'); \
		[ -d "$$dir" ] && echo "$(YELLOW)/$$prefix:$(NC)" && ls -1 "$$dir"/*.md 2>/dev/null | xargs -r -I {} basename {} .md | sed "s|^|  - /$$prefix:|" || true; \
	done

#===============================================================================
# Statistiques & Maintenance
#===============================================================================

stats: ## Affiche les statistiques des composants
	@echo "$(CYAN)STATISTIQUES (lang=$(RULES_LANG))$(NC)"
	@for tech in Common $(shell echo $(TECHS) | tr ' ' '\n' | sed 's/.*/\u&/'); do \
		agents=$$(ls -1 "$(I18N_DIR)/$(RULES_LANG)/$$tech/agents"/*.md 2>/dev/null | wc -l | tr -d ' '); \
		cmds=$$(ls -1 "$(I18N_DIR)/$(RULES_LANG)/$$tech/commands"/*.md 2>/dev/null | wc -l | tr -d ' '); \
		[ "$$agents" -gt 0 -o "$$cmds" -gt 0 ] && \
		printf "  $(GREEN)%-14s$(NC) agents: %s  commands: %s\n" "$$tech" "$$agents" "$$cmds" || true; \
	done

check: ## Verifie que tous les scripts sont executables
	@echo "$(CYAN)Verification des scripts...$(NC)"
	@find $(SCRIPTS_DIR) $(INFRA_DIR) $(PROJECT_DIR) -name "*.sh" -type f | while read script; do \
		[ -x "$$script" ] && echo "  $(GREEN)✓$(NC) $$script" || echo "  $(RED)✗$(NC) $$script"; \
	done

fix-permissions: ## Rend tous les scripts executables
	@echo "$(CYAN)Correction des permissions...$(NC)"
	@find $(SCRIPTS_DIR) $(INFRA_DIR) $(PROJECT_DIR) -name "*.sh" -exec chmod +x {} \;
	@echo "$(GREEN)Permissions corrigees$(NC)"

#===============================================================================
# Default
#===============================================================================

.DEFAULT_GOAL := help
