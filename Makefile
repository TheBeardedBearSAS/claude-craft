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

.PHONY: help install-all install-common install-project install-infra install-coolify \
        install-tools install-tools-lib install-statusline install-multiaccount install-projectconfig \
        install-completions \
        install-web install-fullstack-js install-mobile install-backend \
        list list-agents list-commands \
        config-install config-install-all config-validate config-list config-dry-run \
        config-check config-check-fix check fix-permissions stats \
        migrate-check test-tools \
        plugin-export plugin-export-all

# Configuration
SHELL := /bin/bash
SCRIPTS_DIR := $(CURDIR)/Dev/scripts
I18N_DIR := $(CURDIR)/Dev/i18n
TOOLS_DIR := $(CURDIR)/Tools
TARGET ?= .
OPTIONS ?=
CONFIG ?= $(CURDIR)/claude-projects.yaml
PROJECT ?=
RULES_LANG ?= en

# Couleurs (utilise printf pour l'interprétation ANSI)
CYAN := $(shell printf '\033[0;36m')
GREEN := $(shell printf '\033[0;32m')
YELLOW := $(shell printf '\033[1;33m')
RED := $(shell printf '\033[0;31m')
NC := $(shell printf '\033[0m')

#===============================================================================
# Aide
#===============================================================================

help: ## Affiche cette aide
	@echo ""
	@echo "$(CYAN)╔════════════════════════════════════════════════════════════╗$(NC)"
	@echo "$(CYAN)║$(NC)  Claude Code Rules - Makefile                               $(CYAN)║$(NC)"
	@echo "$(CYAN)╚════════════════════════════════════════════════════════════╝$(NC)"
	@echo ""
	@echo "$(YELLOW)Usage:$(NC)"
	@echo "  make <target> TARGET=<chemin_projet> [OPTIONS=<options>]"
	@echo ""
	@echo "$(YELLOW)NOTE:$(NC) Individual tech installation is now handled by the CLI:"
	@echo "  npx @the-bearded-bear/claude-craft install <path> --tech=<name>"
	@echo ""
	@echo "$(YELLOW)Targets disponibles:$(NC)"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | \
		awk 'BEGIN {FS = ":.*?## "}; {printf "  $(GREEN)%-25s$(NC) %s\n", $$1, $$2}'
	@echo ""
	@echo "$(YELLOW)Variables:$(NC)"
	@echo "  $(GREEN)TARGET$(NC)   Chemin vers le projet cible (defaut: .)"
	@echo "  $(GREEN)OPTIONS$(NC)  Options supplementaires pour les scripts"
	@echo "  $(GREEN)CONFIG$(NC)   Fichier de configuration YAML (defaut: claude-projects.yaml)"
	@echo "  $(GREEN)PROJECT$(NC)  Nom du projet pour config-install"
	@echo "  $(GREEN)RULES_LANG$(NC)     Langue des regles: en, fr, es, de, pt (defaut: en)"
	@echo ""
	@echo "$(YELLOW)Options disponibles:$(NC)"
	@echo "  --dry-run      Simule sans modifier"
	@echo "  --force        Ecrase les fichiers existants"
	@echo "  --backup       Cree une sauvegarde"
	@echo "  --update       Met a jour les fichiers existants"
	@echo ""
	@echo "$(YELLOW)Exemples:$(NC)"
	@echo "  make install-all TARGET=~/Projects/myapp RULES_LANG=fr"
	@echo "  make config-install PROJECT=mon-projet"
	@echo "  make list"
	@echo ""

#===============================================================================
# Installation
#===============================================================================

install-all: ## Installe TOUTES les regles (common + toutes technos + project)
	@echo "$(CYAN)Installation complete dans $(TARGET) (lang=$(RULES_LANG))...$(NC)"
	@$(SCRIPTS_DIR)/install-common-rules.sh --lang=$(RULES_LANG) $(OPTIONS) $(TARGET)
	@for tech in symfony flutter python react reactnative angular csharp laravel vuejs php; do \
		script="$(SCRIPTS_DIR)/install-$${tech}-rules.sh"; \
		if [ -f "$$script" ]; then \
			$$script --lang=$(RULES_LANG) $(OPTIONS) $(TARGET); \
		fi; \
	done
	@if [ -f "$(CURDIR)/Infra/install-infra-rules.sh" ]; then \
		$(CURDIR)/Infra/install-infra-rules.sh --lang=$(RULES_LANG) $(OPTIONS) $(TARGET); \
	fi
	@if [ -f "$(CURDIR)/Infra/install-coolify-rules.sh" ]; then \
		$(CURDIR)/Infra/install-coolify-rules.sh --lang=$(RULES_LANG) $(OPTIONS) $(TARGET); \
	fi
	@if [ -f "$(CURDIR)/Project/install-project-commands.sh" ]; then \
		$(CURDIR)/Project/install-project-commands.sh --lang=$(RULES_LANG) $(TARGET); \
	fi
	@echo "$(GREEN)Installation complete terminee !$(NC)"

install-common: ## Installe les regles communes (agents transversaux, /common:)
	@echo "$(CYAN)Installation des regles communes (lang=$(RULES_LANG))...$(NC)"
	@$(SCRIPTS_DIR)/install-common-rules.sh --lang=$(RULES_LANG) $(OPTIONS) $(TARGET)

install-project: ## Installe les commandes de gestion de projet (EPICs, US, Tasks)
	@echo "$(CYAN)Installation des commandes Project (lang=$(RULES_LANG))...$(NC)"
	@$(CURDIR)/Project/install-project-commands.sh --lang=$(RULES_LANG) $(TARGET)

install-infra: ## Installe les agents et commandes Docker + Coolify/Infrastructure
	@echo "$(CYAN)Installation des regles Docker (lang=$(RULES_LANG))...$(NC)"
	@$(CURDIR)/Infra/install-infra-rules.sh --lang=$(RULES_LANG) $(OPTIONS) $(TARGET)
	@echo "$(CYAN)Installation des regles Coolify (lang=$(RULES_LANG))...$(NC)"
	@$(CURDIR)/Infra/install-coolify-rules.sh --lang=$(RULES_LANG) $(OPTIONS) $(TARGET)

install-coolify: ## Installe les agents et commandes Coolify
	@echo "$(CYAN)Installation des regles Coolify (lang=$(RULES_LANG))...$(NC)"
	@$(CURDIR)/Infra/install-coolify-rules.sh --lang=$(RULES_LANG) $(OPTIONS) $(TARGET)

#===============================================================================
# Combinaisons Courantes
#===============================================================================

install-web: install-common ## Installe Common + React (projet web)
	@$(SCRIPTS_DIR)/install-react-rules.sh --lang=$(RULES_LANG) $(OPTIONS) $(TARGET)
	@echo "$(GREEN)Installation web terminee !$(NC)"

install-fullstack-js: install-common ## Installe Common + React + Python (fullstack)
	@$(SCRIPTS_DIR)/install-react-rules.sh --lang=$(RULES_LANG) $(OPTIONS) $(TARGET)
	@$(SCRIPTS_DIR)/install-python-rules.sh --lang=$(RULES_LANG) $(OPTIONS) $(TARGET)
	@echo "$(GREEN)Installation fullstack JS terminee !$(NC)"

install-mobile: install-common ## Installe Common + Flutter + React Native
	@$(SCRIPTS_DIR)/install-flutter-rules.sh --lang=$(RULES_LANG) $(OPTIONS) $(TARGET)
	@$(SCRIPTS_DIR)/install-reactnative-rules.sh --lang=$(RULES_LANG) $(OPTIONS) $(TARGET)
	@echo "$(GREEN)Installation mobile terminee !$(NC)"

install-backend: install-common ## Installe Common + Symfony + Python
	@$(SCRIPTS_DIR)/install-symfony-rules.sh --lang=$(RULES_LANG) $(OPTIONS) $(TARGET)
	@$(SCRIPTS_DIR)/install-python-rules.sh --lang=$(RULES_LANG) $(OPTIONS) $(TARGET)
	@echo "$(GREEN)Installation backend terminee !$(NC)"

#===============================================================================
# Outils Claude Code
#===============================================================================

install-tools: install-statusline install-multiaccount install-projectconfig ## Installe tous les outils
	@echo "$(GREEN)Installation des outils terminee !$(NC)"

install-statusline: ## Installe la status line personnalisee
	@echo "$(CYAN)Installation de la Status Line...$(NC)"
	@mkdir -p ~/.claude
	@if [ -f "$(TOOLS_DIR)/StatusLine/statusline.sh" ]; then \
		cp "$(TOOLS_DIR)/StatusLine/statusline.sh" ~/.claude/statusline.sh; \
		chmod +x ~/.claude/statusline.sh; \
		echo "$(GREEN)✓$(NC) Script copie: ~/.claude/statusline.sh"; \
		if [ -f ~/.claude/settings.json ]; then \
			if ! grep -q '"statusLine"' ~/.claude/settings.json; then \
				echo "$(YELLOW)⚠$(NC) Ajoute manuellement a ~/.claude/settings.json:"; \
				echo '  "statusLine": { "type": "command", "command": "~/.claude/statusline.sh" }'; \
			else \
				echo "$(GREEN)✓$(NC) settings.json deja configure"; \
			fi \
		else \
			cp "$(TOOLS_DIR)/StatusLine/settings.json" ~/.claude/settings.json; \
			echo "$(GREEN)✓$(NC) settings.json cree"; \
		fi \
	else \
		echo "$(RED)Script non trouve: Tools/StatusLine/statusline.sh$(NC)"; \
		exit 1; \
	fi
	@echo "$(GREEN)Status Line installee !$(NC)"

install-multiaccount: install-tools-lib ## Installe le gestionnaire multi-comptes
	@echo "$(CYAN)Installation du Multi-Account Manager...$(NC)"
	@mkdir -p ~/.local/bin
	@if [ -f "$(TOOLS_DIR)/MultiAccount/claude-accounts.sh" ]; then \
		cp "$(TOOLS_DIR)/MultiAccount/claude-accounts.sh" ~/.local/bin/claude-accounts; \
		chmod +x ~/.local/bin/claude-accounts; \
		echo "$(GREEN)✓$(NC) Script copie: ~/.local/bin/claude-accounts"; \
		if echo "$$PATH" | grep -q "$$HOME/.local/bin"; then \
			echo "$(GREEN)✓$(NC) ~/.local/bin est dans le PATH"; \
		else \
			echo "$(YELLOW)⚠$(NC) Ajoute ~/.local/bin a ton PATH:"; \
			echo '  export PATH="$$HOME/.local/bin:$$PATH"'; \
		fi \
	else \
		echo "$(RED)Script non trouve: Tools/MultiAccount/claude-accounts.sh$(NC)"; \
		exit 1; \
	fi
	@echo "$(GREEN)Multi-Account Manager installe !$(NC)"

install-projectconfig: install-tools-lib ## Installe le gestionnaire de projets YAML
	@echo "$(CYAN)Installation du Project Config Manager...$(NC)"
	@mkdir -p ~/.local/bin
	@if [ -f "$(TOOLS_DIR)/ProjectConfig/claude-projects.sh" ]; then \
		cp "$(TOOLS_DIR)/ProjectConfig/claude-projects.sh" ~/.local/bin/claude-projects; \
		chmod +x ~/.local/bin/claude-projects; \
		echo "$(GREEN)✓$(NC) Script copie: ~/.local/bin/claude-projects"; \
		if echo "$$PATH" | grep -q "$$HOME/.local/bin"; then \
			echo "$(GREEN)✓$(NC) ~/.local/bin est dans le PATH"; \
		else \
			echo "$(YELLOW)⚠$(NC) Ajoute ~/.local/bin a ton PATH:"; \
			echo '  export PATH="$$HOME/.local/bin:$$PATH"'; \
		fi \
	else \
		echo "$(RED)Script non trouve: Tools/ProjectConfig/claude-projects.sh$(NC)"; \
		exit 1; \
	fi
	@echo "$(GREEN)Project Config Manager installe !$(NC)"

install-completions: ## Installe les completions bash/zsh pour claude-accounts
	@echo "$(CYAN)Installation des completions...$(NC)"
	@if [ -f "$(TOOLS_DIR)/MultiAccount/completions/claude-accounts.bash" ]; then \
		mkdir -p ~/.local/share/bash-completion/completions; \
		cp "$(TOOLS_DIR)/MultiAccount/completions/claude-accounts.bash" ~/.local/share/bash-completion/completions/claude-accounts; \
		echo "$(GREEN)Y$(NC) Bash completion installee"; \
	fi
	@if [ -f "$(TOOLS_DIR)/MultiAccount/completions/_claude-accounts" ]; then \
		mkdir -p ~/.zsh/completions; \
		cp "$(TOOLS_DIR)/MultiAccount/completions/_claude-accounts" ~/.zsh/completions/_claude-accounts; \
		echo "$(GREEN)Y$(NC) Zsh completion installee"; \
		echo "$(YELLOW)!$(NC) Ajoute ~/.zsh/completions a ton fpath si necessaire:"; \
		echo '  fpath=(~/.zsh/completions $$fpath)'; \
	fi
	@echo "$(GREEN)Completions installees !$(NC)"

test-tools: ## Lance les tests bats pour les outils (via Docker)
	@echo "$(CYAN)Lancement des tests bats...$(NC)"
	@docker run --rm -v "$(CURDIR)/Tools:/mnt" bats/bats:latest /mnt/MultiAccount/tests/

test-statusline: ## Lance les tests bats pour la status line (via Docker)
	@echo "$(CYAN)Lancement des tests statusline...$(NC)"
	@docker run --rm -v "$(CURDIR)/Tools:/mnt" bats/bats:latest /mnt/StatusLine/tests/

install-tools-lib: ## Installe la librairie partagee tools-ui.sh
	@mkdir -p ~/.local/lib/claude-craft
	@if [ -f "$(TOOLS_DIR)/lib/tools-ui.sh" ]; then \
		cp "$(TOOLS_DIR)/lib/tools-ui.sh" ~/.local/lib/claude-craft/tools-ui.sh; \
		echo "$(GREEN)✓$(NC) Librairie copiee: ~/.local/lib/claude-craft/tools-ui.sh"; \
	fi

#===============================================================================
# Installation depuis Configuration YAML
#===============================================================================

config-install: ## Installe un projet depuis la config YAML (PROJECT=nom)
	@if [ -z "$(PROJECT)" ]; then \
		echo "$(RED)Erreur: PROJECT non specifie$(NC)"; \
		echo "Usage: make config-install PROJECT=nom-projet [CONFIG=fichier.yaml]"; \
		$(SCRIPTS_DIR)/install-from-config.sh --list $(CONFIG) 2>/dev/null || true; \
		exit 1; \
	fi
	@$(SCRIPTS_DIR)/install-from-config.sh --project $(PROJECT) $(OPTIONS) $(CONFIG)

config-install-all: ## Installe TOUS les projets depuis la config YAML
	@$(SCRIPTS_DIR)/install-from-config.sh $(OPTIONS) $(CONFIG)

config-validate: ## Valide la configuration YAML sans installer
	@$(SCRIPTS_DIR)/install-from-config.sh --validate $(CONFIG)

config-list: ## Liste les projets definis dans la config YAML
	@$(SCRIPTS_DIR)/install-from-config.sh --list $(CONFIG)

config-dry-run: ## Simule l'installation depuis la config (PROJECT=nom optionnel)
	@if [ -n "$(PROJECT)" ]; then \
		$(SCRIPTS_DIR)/install-from-config.sh --dry-run --project $(PROJECT) $(OPTIONS) $(CONFIG); \
	else \
		$(SCRIPTS_DIR)/install-from-config.sh --dry-run $(OPTIONS) $(CONFIG); \
	fi

config-check: ## Verifie l'installation des projets configures
	@if [ -n "$(PROJECT)" ]; then \
		$(SCRIPTS_DIR)/check-config.sh --project $(PROJECT) $(CONFIG) || true; \
	else \
		$(SCRIPTS_DIR)/check-config.sh $(CONFIG) || true; \
	fi

config-check-fix: ## Verifie et propose de corriger les problemes
	@if [ -n "$(PROJECT)" ]; then \
		$(SCRIPTS_DIR)/check-config.sh --fix --project $(PROJECT) $(CONFIG); \
	else \
		$(SCRIPTS_DIR)/check-config.sh --fix $(CONFIG); \
	fi

#===============================================================================
# Vérification de Migration
#===============================================================================

migrate-check: ## Verifie le statut de migration des projets
	@echo "$(CYAN)Verification du statut de migration...$(NC)"
	@echo ""
	@for project in $$($(SCRIPTS_DIR)/install-from-config.sh --list $(CONFIG) 2>/dev/null | grep -E '^\s+-' | sed 's/.*- //'); do \
		root=$$($(SCRIPTS_DIR)/install-from-config.sh --show-root $$project $(CONFIG) 2>/dev/null); \
		if [ -d "$$root/.claude" ]; then \
			version=$$(cat "$$root/.claude/.claude-craft-version" 2>/dev/null || echo "unknown"); \
			has_hooks=$$([ -d "$$root/.claude/hooks" ] && echo "Y" || echo "N"); \
			has_mcp=$$([ -f "$$root/.mcp.json" ] && echo "Y" || echo "N"); \
			echo "  $(GREEN)$$project$(NC): v$$version | hooks:$$has_hooks | mcp:$$has_mcp"; \
		fi \
	done

#===============================================================================
# Export Plugin
#===============================================================================

PLUGIN_OUTPUT ?= ./dist/plugins
TECH ?=

plugin-export: ## Exporte une technologie comme plugin (TECH=symfony)
	@if [ -z "$(TECH)" ]; then \
		echo "$(RED)Erreur: TECH non specifie$(NC)"; \
		echo "Usage: make plugin-export TECH=symfony [RULES_LANG=fr] [PLUGIN_OUTPUT=./dist]"; \
		exit 1; \
	fi
	@$(TOOLS_DIR)/PluginExport/export-plugin.sh --tech=$(TECH) --lang=$(RULES_LANG) $(PLUGIN_OUTPUT)

plugin-export-all: ## Exporte toutes les technologies comme plugins
	@$(TOOLS_DIR)/PluginExport/export-plugin.sh --all --lang=$(RULES_LANG) $(PLUGIN_OUTPUT)

#===============================================================================
# Lister les Composants
#===============================================================================

list: list-agents list-commands ## Liste les agents et commandes disponibles

list-agents: ## Liste les agents disponibles
	@echo ""
	@echo "$(CYAN)AGENTS DISPONIBLES (lang=$(RULES_LANG))$(NC)"
	@echo ""
	@for tech in Common Symfony Flutter Python React ReactNative Angular Laravel Vuejs PHP; do \
		dir="$(I18N_DIR)/$(RULES_LANG)/$$tech/agents"; \
		if [ -d "$$dir" ]; then \
			echo "$(YELLOW)$$tech:$(NC)"; \
			ls -1 "$$dir"/*.md 2>/dev/null | xargs -r -I {} basename {} .md | sed 's/^/  - /'; \
			echo ""; \
		fi; \
	done

list-commands: ## Liste les commandes disponibles
	@echo ""
	@echo "$(CYAN)COMMANDES DISPONIBLES (lang=$(RULES_LANG))$(NC)"
	@echo ""
	@for tech in Common Workflow Team QA UIUX Symfony Flutter Python React ReactNative Angular Laravel Vuejs PHP Docker; do \
		dir="$(I18N_DIR)/$(RULES_LANG)/$$tech/commands"; \
		base_dir="$(I18N_DIR)/base/$$tech/commands"; \
		prefix=$$(echo "$$tech" | tr '[:upper:]' '[:lower:]'); \
		if [ -d "$$dir" ] || [ -d "$$base_dir" ]; then \
			echo "$(YELLOW)/$$prefix:$(NC)"; \
			{ ls -1 "$$dir"/*.md 2>/dev/null; ls -1 "$$base_dir"/*.md 2>/dev/null; } | xargs -r -I {} basename {} .md | sort -u | sed "s/^/  - \/$$prefix:/"; \
			echo ""; \
		fi; \
	done

#===============================================================================
# Statistiques & Maintenance
#===============================================================================

stats: ## Affiche les statistiques des composants
	@echo ""
	@echo "$(CYAN)STATISTIQUES (lang=$(RULES_LANG))$(NC)"
	@echo ""
	@for tech in Common Symfony Flutter Python React ReactNative Angular Laravel Vuejs PHP; do \
		agents=$$(ls -1 "$(I18N_DIR)/$(RULES_LANG)/$$tech/agents"/*.md 2>/dev/null | wc -l | tr -d ' '); \
		cmds=$$(ls -1 "$(I18N_DIR)/$(RULES_LANG)/$$tech/commands"/*.md 2>/dev/null | wc -l | tr -d ' '); \
		if [ "$$agents" -gt 0 ] || [ "$$cmds" -gt 0 ]; then \
			printf "  $(GREEN)%-14s$(NC) agents: %s  commands: %s\n" "$$tech" "$$agents" "$$cmds"; \
		fi; \
	done
	@echo ""

check: ## Verifie que tous les scripts sont executables
	@echo "$(CYAN)Verification des scripts...$(NC)"
	@for script in $(SCRIPTS_DIR)/*.sh \
		$(CURDIR)/Project/install-project-commands.sh \
		$(CURDIR)/Infra/install-infra-rules.sh \
		$(CURDIR)/Infra/install-coolify-rules.sh; do \
		if [ -f "$$script" ]; then \
			if [ -x "$$script" ]; then \
				echo "  $(GREEN)Y$(NC) $$script"; \
			else \
				echo "  $(RED)N$(NC) $$script (non executable)"; \
			fi \
		fi \
	done
	@echo ""

fix-permissions: ## Rend tous les scripts executables
	@echo "$(CYAN)Correction des permissions...$(NC)"
	@find $(SCRIPTS_DIR) -name "*.sh" -exec chmod +x {} \;
	@chmod +x $(CURDIR)/Project/install-project-commands.sh
	@chmod +x $(CURDIR)/Infra/install-infra-rules.sh
	@chmod +x $(CURDIR)/Infra/install-coolify-rules.sh
	@echo "$(GREEN)Permissions corrigees$(NC)"

#===============================================================================
# Default
#===============================================================================

.DEFAULT_GOAL := help
