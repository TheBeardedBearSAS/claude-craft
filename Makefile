#===============================================================================
# Makefile - Claude Code Rules Installation
#
# Facilite l'installation des règles, agents et commandes Claude Code
# pour différentes technologies dans vos projets.
#
# Usage:
#   make help                    # Afficher l'aide
#   make install-all TARGET=~/project
#   make install-symfony TARGET=~/project
#   make list                    # Lister les composants disponibles
#===============================================================================

.PHONY: help install-all install-common install-symfony install-flutter \
        install-python install-react install-reactnative install-project install-infra \
        install-tools install-statusline install-multiaccount install-projectconfig \
        install-web install-fullstack-js install-mobile install-backend \
        list list-agents list-commands dry-run clean \
        config-install config-install-all config-validate config-list config-dry-run \
        config-check config-check-fix check fix-permissions tree stats

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
	@echo "$(CYAN)║$(NC)  📦 Claude Code Rules - Makefile                           $(CYAN)║$(NC)"
	@echo "$(CYAN)╚════════════════════════════════════════════════════════════╝$(NC)"
	@echo ""
	@echo "$(YELLOW)Usage:$(NC)"
	@echo "  make <target> TARGET=<chemin_projet> [OPTIONS=<options>]"
	@echo ""
	@echo "$(YELLOW)Targets disponibles:$(NC)"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | \
		awk 'BEGIN {FS = ":.*?## "}; {printf "  $(GREEN)%-25s$(NC) %s\n", $$1, $$2}'
	@echo ""
	@echo "$(YELLOW)Variables:$(NC)"
	@echo "  $(GREEN)TARGET$(NC)   Chemin vers le projet cible (défaut: .)"
	@echo "  $(GREEN)OPTIONS$(NC)  Options supplémentaires pour les scripts"
	@echo "  $(GREEN)CONFIG$(NC)   Fichier de configuration YAML (défaut: claude-projects.yaml)"
	@echo "  $(GREEN)PROJECT$(NC)  Nom du projet pour config-install"
	@echo "  $(GREEN)RULES_LANG$(NC)     Langue des règles: en, fr, es, de, pt (défaut: en)"
	@echo ""
	@echo "$(YELLOW)Options disponibles:$(NC)"
	@echo "  --dry-run      Simule sans modifier"
	@echo "  --force        Écrase les fichiers existants"
	@echo "  --backup       Crée une sauvegarde"
	@echo "  --update       Met à jour les fichiers existants"
	@echo "  --interactive  Mode interactif"
	@echo ""
	@echo "$(YELLOW)Exemples:$(NC)"
	@echo "  make install-symfony TARGET=~/Projects/myapp"
	@echo "  make install-symfony TARGET=~/Projects/myapp RULES_LANG=fr"
	@echo "  make install-all TARGET=~/Projects/myapp OPTIONS='--backup'"
	@echo "  make dry-run-flutter TARGET=~/Projects/myapp"
	@echo "  make list"
	@echo ""
	@echo "$(YELLOW)Exemples avec configuration YAML:$(NC)"
	@echo "  make config-list                              # Liste les projets"
	@echo "  make config-validate                          # Valide la config"
	@echo "  make config-install PROJECT=mon-projet        # Installe un projet"
	@echo "  make config-install-all                       # Installe tous les projets"
	@echo "  make config-dry-run PROJECT=mon-projet        # Simulation"
	@echo ""

#===============================================================================
# Installation Complète
#===============================================================================

install-all: ## Installe TOUTES les règles (common + toutes technos)
	@echo "$(CYAN)📦 Installation complète dans $(TARGET) (lang=$(RULES_LANG))...$(NC)"
	@$(MAKE) install-common TARGET=$(TARGET) OPTIONS=$(OPTIONS) RULES_LANG=$(RULES_LANG)
	@$(MAKE) install-symfony TARGET=$(TARGET) OPTIONS=$(OPTIONS) RULES_LANG=$(RULES_LANG)
	@$(MAKE) install-flutter TARGET=$(TARGET) OPTIONS=$(OPTIONS) RULES_LANG=$(RULES_LANG)
	@$(MAKE) install-python TARGET=$(TARGET) OPTIONS=$(OPTIONS) RULES_LANG=$(RULES_LANG)
	@$(MAKE) install-react TARGET=$(TARGET) OPTIONS=$(OPTIONS) RULES_LANG=$(RULES_LANG)
	@$(MAKE) install-reactnative TARGET=$(TARGET) OPTIONS=$(OPTIONS) RULES_LANG=$(RULES_LANG)
	@echo "$(GREEN)✅ Installation complète terminée !$(NC)"

#===============================================================================
# Installation par Technologie
#===============================================================================

install-common: ## Installe les règles communes (agents transversaux, /common:)
	@echo "$(CYAN)📦 Installation des règles communes (lang=$(RULES_LANG))...$(NC)"
	@if [ -f "$(SCRIPTS_DIR)/install-common-rules.sh" ]; then \
		$(SCRIPTS_DIR)/install-common-rules.sh --lang=$(RULES_LANG) $(OPTIONS) $(TARGET); \
	else \
		echo "$(RED)❌ Script non trouvé: Dev/scripts/install-common-rules.sh$(NC)"; \
		exit 1; \
	fi

install-symfony: ## Installe les règles Symfony
	@echo "$(CYAN)📦 Installation des règles Symfony (lang=$(RULES_LANG))...$(NC)"
	@if [ -f "$(SCRIPTS_DIR)/install-symfony-rules.sh" ]; then \
		$(SCRIPTS_DIR)/install-symfony-rules.sh --lang=$(RULES_LANG) $(OPTIONS) $(TARGET); \
	else \
		echo "$(RED)❌ Script non trouvé: Dev/scripts/install-symfony-rules.sh$(NC)"; \
		exit 1; \
	fi

install-flutter: ## Installe les règles Flutter
	@echo "$(CYAN)📦 Installation des règles Flutter (lang=$(RULES_LANG))...$(NC)"
	@if [ -f "$(SCRIPTS_DIR)/install-flutter-rules.sh" ]; then \
		$(SCRIPTS_DIR)/install-flutter-rules.sh --lang=$(RULES_LANG) $(OPTIONS) $(TARGET); \
	else \
		echo "$(RED)❌ Script non trouvé: Dev/scripts/install-flutter-rules.sh$(NC)"; \
		exit 1; \
	fi

install-python: ## Installe les règles Python
	@echo "$(CYAN)📦 Installation des règles Python (lang=$(RULES_LANG))...$(NC)"
	@if [ -f "$(SCRIPTS_DIR)/install-python-rules.sh" ]; then \
		$(SCRIPTS_DIR)/install-python-rules.sh --lang=$(RULES_LANG) $(OPTIONS) $(TARGET); \
	else \
		echo "$(RED)❌ Script non trouvé: Dev/scripts/install-python-rules.sh$(NC)"; \
		exit 1; \
	fi

install-react: ## Installe les règles React
	@echo "$(CYAN)📦 Installation des règles React (lang=$(RULES_LANG))...$(NC)"
	@if [ -f "$(SCRIPTS_DIR)/install-react-rules.sh" ]; then \
		$(SCRIPTS_DIR)/install-react-rules.sh --lang=$(RULES_LANG) $(OPTIONS) $(TARGET); \
	else \
		echo "$(RED)❌ Script non trouvé: Dev/scripts/install-react-rules.sh$(NC)"; \
		exit 1; \
	fi

install-reactnative: ## Installe les règles React Native
	@echo "$(CYAN)📦 Installation des règles React Native (lang=$(RULES_LANG))...$(NC)"
	@if [ -f "$(SCRIPTS_DIR)/install-reactnative-rules.sh" ]; then \
		$(SCRIPTS_DIR)/install-reactnative-rules.sh --lang=$(RULES_LANG) $(OPTIONS) $(TARGET); \
	else \
		echo "$(RED)❌ Script non trouvé: Dev/scripts/install-reactnative-rules.sh$(NC)"; \
		exit 1; \
	fi

install-project: ## Installe les commandes de gestion de projet (EPICs, US, Tasks)
	@echo "$(CYAN)📦 Installation des commandes Project (lang=$(RULES_LANG))...$(NC)"
	@if [ -f "$(CURDIR)/Project/install-project-commands.sh" ]; then \
		$(CURDIR)/Project/install-project-commands.sh --lang=$(RULES_LANG) $(TARGET); \
	else \
		echo "$(RED)❌ Script non trouvé: Project/install-project-commands.sh$(NC)"; \
		exit 1; \
	fi

install-infra: ## Installe les agents et commandes Docker/Infrastructure
	@echo "$(CYAN)📦 Installation des règles Docker (lang=$(RULES_LANG))...$(NC)"
	@if [ -f "$(CURDIR)/Infra/install-infra-rules.sh" ]; then \
		$(CURDIR)/Infra/install-infra-rules.sh --lang=$(RULES_LANG) $(OPTIONS) $(TARGET); \
	else \
		echo "$(RED)❌ Script non trouvé: Infra/install-infra-rules.sh$(NC)"; \
		exit 1; \
	fi

#===============================================================================
# Combinaisons Courantes
#===============================================================================

install-web: install-common install-react ## Installe Common + React (projet web)
	@echo "$(GREEN)✅ Installation web terminée !$(NC)"

install-fullstack-js: install-common install-react install-python ## Installe Common + React + Python (fullstack)
	@echo "$(GREEN)✅ Installation fullstack JS terminée !$(NC)"

install-mobile: install-common install-flutter install-reactnative ## Installe Common + Flutter + React Native
	@echo "$(GREEN)✅ Installation mobile terminée !$(NC)"

install-backend: install-common install-symfony install-python ## Installe Common + Symfony + Python
	@echo "$(GREEN)✅ Installation backend terminée !$(NC)"

#===============================================================================
# Outils Claude Code
#===============================================================================

install-tools: install-statusline install-multiaccount install-projectconfig ## Installe tous les outils
	@echo "$(GREEN)✅ Installation des outils terminée !$(NC)"

install-statusline: ## Installe la status line personnalisée
	@echo "$(CYAN)📦 Installation de la Status Line...$(NC)"
	@mkdir -p ~/.claude
	@if [ -f "$(TOOLS_DIR)/StatusLine/statusline.sh" ]; then \
		cp "$(TOOLS_DIR)/StatusLine/statusline.sh" ~/.claude/statusline.sh; \
		chmod +x ~/.claude/statusline.sh; \
		echo "$(GREEN)✓$(NC) Script copié: ~/.claude/statusline.sh"; \
		if [ -f ~/.claude/settings.json ]; then \
			if ! grep -q '"statusLine"' ~/.claude/settings.json; then \
				echo "$(YELLOW)⚠$(NC) Ajoute manuellement à ~/.claude/settings.json:"; \
				echo '  "statusLine": { "enabled": true, "script": "~/.claude/statusline.sh" }'; \
			else \
				echo "$(GREEN)✓$(NC) settings.json déjà configuré"; \
			fi \
		else \
			cp "$(TOOLS_DIR)/StatusLine/settings.json" ~/.claude/settings.json; \
			echo "$(GREEN)✓$(NC) settings.json créé"; \
		fi \
	else \
		echo "$(RED)❌ Script non trouvé: Tools/StatusLine/statusline.sh$(NC)"; \
		exit 1; \
	fi
	@echo "$(GREEN)✅ Status Line installée !$(NC)"
	@echo ""
	@echo "$(YELLOW)Dépendances requises:$(NC)"
	@echo "  - jq (sudo apt install jq)"
	@echo "  - ccusage (npm install -g ccusage) [optionnel]"

install-multiaccount: ## Installe le gestionnaire multi-comptes
	@echo "$(CYAN)📦 Installation du Multi-Account Manager...$(NC)"
	@mkdir -p ~/.local/bin
	@if [ -f "$(TOOLS_DIR)/MultiAccount/claude-accounts.sh" ]; then \
		cp "$(TOOLS_DIR)/MultiAccount/claude-accounts.sh" ~/.local/bin/claude-accounts; \
		chmod +x ~/.local/bin/claude-accounts; \
		echo "$(GREEN)✓$(NC) Script copié: ~/.local/bin/claude-accounts"; \
		if echo "$$PATH" | grep -q "$$HOME/.local/bin"; then \
			echo "$(GREEN)✓$(NC) ~/.local/bin est dans le PATH"; \
		else \
			echo "$(YELLOW)⚠$(NC) Ajoute ~/.local/bin à ton PATH:"; \
			echo '  export PATH="$$HOME/.local/bin:$$PATH"'; \
		fi \
	else \
		echo "$(RED)❌ Script non trouvé: Tools/MultiAccount/claude-accounts.sh$(NC)"; \
		exit 1; \
	fi
	@echo "$(GREEN)✅ Multi-Account Manager installé !$(NC)"
	@echo ""
	@echo "$(YELLOW)Usage:$(NC)"
	@echo "  claude-accounts          # Menu interactif"
	@echo "  claude-accounts add pro  # Ajouter un profil"
	@echo "  claude-accounts list     # Lister les profils"

install-projectconfig: ## Installe le gestionnaire de projets YAML
	@echo "$(CYAN)📦 Installation du Project Config Manager...$(NC)"
	@mkdir -p ~/.local/bin
	@if [ -f "$(TOOLS_DIR)/ProjectConfig/claude-projects.sh" ]; then \
		cp "$(TOOLS_DIR)/ProjectConfig/claude-projects.sh" ~/.local/bin/claude-projects; \
		chmod +x ~/.local/bin/claude-projects; \
		echo "$(GREEN)✓$(NC) Script copié: ~/.local/bin/claude-projects"; \
		if echo "$$PATH" | grep -q "$$HOME/.local/bin"; then \
			echo "$(GREEN)✓$(NC) ~/.local/bin est dans le PATH"; \
		else \
			echo "$(YELLOW)⚠$(NC) Ajoute ~/.local/bin à ton PATH:"; \
			echo '  export PATH="$$HOME/.local/bin:$$PATH"'; \
		fi \
	else \
		echo "$(RED)❌ Script non trouvé: Tools/ProjectConfig/claude-projects.sh$(NC)"; \
		exit 1; \
	fi
	@echo "$(GREEN)✅ Project Config Manager installé !$(NC)"
	@echo ""
	@echo "$(YELLOW)Usage:$(NC)"
	@echo "  claude-projects          # Menu interactif"
	@echo "  claude-projects list     # Lister les projets"
	@echo "  claude-projects add      # Ajouter un projet"

#===============================================================================
# Dry Run (Simulation)
#===============================================================================

dry-run-all: ## Simule l'installation complète
	@$(MAKE) install-all TARGET=$(TARGET) OPTIONS="--dry-run"

dry-run-common: ## Simule l'installation des règles communes
	@$(MAKE) install-common TARGET=$(TARGET) OPTIONS="--dry-run"

dry-run-symfony: ## Simule l'installation Symfony
	@$(MAKE) install-symfony TARGET=$(TARGET) OPTIONS="--dry-run"

dry-run-flutter: ## Simule l'installation Flutter
	@$(MAKE) install-flutter TARGET=$(TARGET) OPTIONS="--dry-run"

dry-run-python: ## Simule l'installation Python
	@$(MAKE) install-python TARGET=$(TARGET) OPTIONS="--dry-run"

dry-run-react: ## Simule l'installation React
	@$(MAKE) install-react TARGET=$(TARGET) OPTIONS="--dry-run"

dry-run-reactnative: ## Simule l'installation React Native
	@$(MAKE) install-reactnative TARGET=$(TARGET) OPTIONS="--dry-run"

dry-run-infra: ## Simule l'installation Docker/Infrastructure
	@$(MAKE) install-infra TARGET=$(TARGET) OPTIONS="--dry-run"

#===============================================================================
# Installation depuis Configuration YAML
#===============================================================================

config-install: ## Installe un projet depuis la config YAML (PROJECT=nom)
	@if [ -z "$(PROJECT)" ]; then \
		echo "$(RED)❌ Erreur: PROJECT non spécifié$(NC)"; \
		echo ""; \
		echo "Usage: make config-install PROJECT=nom-projet [CONFIG=fichier.yaml]"; \
		echo ""; \
		echo "Projets disponibles:"; \
		$(SCRIPTS_DIR)/install-from-config.sh --list $(CONFIG) 2>/dev/null || echo "  Vérifiez votre fichier de configuration"; \
		exit 1; \
	fi
	@$(SCRIPTS_DIR)/install-from-config.sh --project $(PROJECT) $(OPTIONS) $(CONFIG)

config-install-all: ## Installe TOUS les projets depuis la config YAML
	@$(SCRIPTS_DIR)/install-from-config.sh $(OPTIONS) $(CONFIG)

config-validate: ## Valide la configuration YAML sans installer
	@$(SCRIPTS_DIR)/install-from-config.sh --validate $(CONFIG)

config-list: ## Liste les projets définis dans la config YAML
	@$(SCRIPTS_DIR)/install-from-config.sh --list $(CONFIG)

config-dry-run: ## Simule l'installation depuis la config (PROJECT=nom optionnel)
	@if [ -n "$(PROJECT)" ]; then \
		$(SCRIPTS_DIR)/install-from-config.sh --dry-run --project $(PROJECT) $(OPTIONS) $(CONFIG); \
	else \
		$(SCRIPTS_DIR)/install-from-config.sh --dry-run $(OPTIONS) $(CONFIG); \
	fi

config-check: ## Vérifie l'installation des projets configurés
	@if [ -n "$(PROJECT)" ]; then \
		$(SCRIPTS_DIR)/check-config.sh --project $(PROJECT) $(CONFIG) || true; \
	else \
		$(SCRIPTS_DIR)/check-config.sh $(CONFIG) || true; \
	fi

config-check-fix: ## Vérifie et propose de corriger les problèmes
	@if [ -n "$(PROJECT)" ]; then \
		$(SCRIPTS_DIR)/check-config.sh --fix --project $(PROJECT) $(CONFIG); \
	else \
		$(SCRIPTS_DIR)/check-config.sh --fix $(CONFIG); \
	fi

#===============================================================================
# Lister les Composants
#===============================================================================

list: list-agents list-commands list-templates list-checklists ## Liste tous les composants disponibles

list-agents: ## Liste les agents disponibles
	@echo ""
	@echo "$(CYAN)═══════════════════════════════════════════════════════════$(NC)"
	@echo "$(CYAN) 🤖 AGENTS DISPONIBLES (lang=$(RULES_LANG))$(NC)"
	@echo "$(CYAN)═══════════════════════════════════════════════════════════$(NC)"
	@echo ""
	@echo "$(YELLOW)Common (transversaux):$(NC)"
	@if [ -d "$(I18N_DIR)/$(RULES_LANG)/Common/agents" ]; then \
		ls -1 $(I18N_DIR)/$(RULES_LANG)/Common/agents/*.md 2>/dev/null | xargs -I {} basename {} .md | sed 's/^/  - /'; \
	fi
	@echo ""
	@echo "$(YELLOW)Symfony:$(NC)"
	@if [ -d "$(I18N_DIR)/$(RULES_LANG)/Symfony/agents" ]; then \
		ls -1 $(I18N_DIR)/$(RULES_LANG)/Symfony/agents/*.md 2>/dev/null | xargs -I {} basename {} .md | sed 's/^/  - /'; \
	fi
	@echo ""
	@echo "$(YELLOW)Flutter:$(NC)"
	@if [ -d "$(I18N_DIR)/$(RULES_LANG)/Flutter/agents" ]; then \
		ls -1 $(I18N_DIR)/$(RULES_LANG)/Flutter/agents/*.md 2>/dev/null | xargs -I {} basename {} .md | sed 's/^/  - /'; \
	fi
	@echo ""
	@echo "$(YELLOW)Python:$(NC)"
	@if [ -d "$(I18N_DIR)/$(RULES_LANG)/Python/agents" ]; then \
		ls -1 $(I18N_DIR)/$(RULES_LANG)/Python/agents/*.md 2>/dev/null | xargs -I {} basename {} .md | sed 's/^/  - /'; \
	fi
	@echo ""
	@echo "$(YELLOW)React:$(NC)"
	@if [ -d "$(I18N_DIR)/$(RULES_LANG)/React/agents" ]; then \
		ls -1 $(I18N_DIR)/$(RULES_LANG)/React/agents/*.md 2>/dev/null | xargs -I {} basename {} .md | sed 's/^/  - /'; \
	fi
	@echo ""
	@echo "$(YELLOW)React Native:$(NC)"
	@if [ -d "$(I18N_DIR)/$(RULES_LANG)/ReactNative/agents" ]; then \
		ls -1 $(I18N_DIR)/$(RULES_LANG)/ReactNative/agents/*.md 2>/dev/null | xargs -I {} basename {} .md | sed 's/^/  - /'; \
	fi
	@echo ""

list-commands: ## Liste les commandes disponibles
	@echo ""
	@echo "$(CYAN)═══════════════════════════════════════════════════════════$(NC)"
	@echo "$(CYAN) 📝 COMMANDES DISPONIBLES (lang=$(RULES_LANG))$(NC)"
	@echo "$(CYAN)═══════════════════════════════════════════════════════════$(NC)"
	@echo ""
	@echo "$(YELLOW)/common: (transversales)$(NC)"
	@if [ -d "$(I18N_DIR)/$(RULES_LANG)/Common/commands" ]; then \
		ls -1 $(I18N_DIR)/$(RULES_LANG)/Common/commands/*.md 2>/dev/null | xargs -I {} basename {} .md | sed 's/^/  - \/common:/'; \
	fi
	@echo ""
	@echo "$(YELLOW)/symfony:$(NC)"
	@if [ -d "$(I18N_DIR)/$(RULES_LANG)/Symfony/commands" ]; then \
		ls -1 $(I18N_DIR)/$(RULES_LANG)/Symfony/commands/*.md 2>/dev/null | xargs -I {} basename {} .md | sed 's/^/  - \/symfony:/'; \
	fi
	@echo ""
	@echo "$(YELLOW)/flutter:$(NC)"
	@if [ -d "$(I18N_DIR)/$(RULES_LANG)/Flutter/commands" ]; then \
		ls -1 $(I18N_DIR)/$(RULES_LANG)/Flutter/commands/*.md 2>/dev/null | xargs -I {} basename {} .md | sed 's/^/  - \/flutter:/'; \
	fi
	@echo ""
	@echo "$(YELLOW)/python:$(NC)"
	@if [ -d "$(I18N_DIR)/$(RULES_LANG)/Python/commands" ]; then \
		ls -1 $(I18N_DIR)/$(RULES_LANG)/Python/commands/*.md 2>/dev/null | xargs -I {} basename {} .md | sed 's/^/  - \/python:/'; \
	fi
	@echo ""
	@echo "$(YELLOW)/react:$(NC)"
	@if [ -d "$(I18N_DIR)/$(RULES_LANG)/React/commands" ]; then \
		ls -1 $(I18N_DIR)/$(RULES_LANG)/React/commands/*.md 2>/dev/null | xargs -I {} basename {} .md | sed 's/^/  - \/react:/'; \
	fi
	@echo ""
	@echo "$(YELLOW)/reactnative:$(NC)"
	@if [ -d "$(I18N_DIR)/$(RULES_LANG)/ReactNative/commands" ]; then \
		ls -1 $(I18N_DIR)/$(RULES_LANG)/ReactNative/commands/*.md 2>/dev/null | xargs -I {} basename {} .md | sed 's/^/  - \/reactnative:/'; \
	fi
	@echo ""

list-templates: ## Liste les templates disponibles
	@echo ""
	@echo "$(CYAN)═══════════════════════════════════════════════════════════$(NC)"
	@echo "$(CYAN) 📋 TEMPLATES DISPONIBLES (lang=$(RULES_LANG))$(NC)"
	@echo "$(CYAN)═══════════════════════════════════════════════════════════$(NC)"
	@echo ""
	@if [ -d "$(I18N_DIR)/$(RULES_LANG)/Common/templates" ]; then \
		find $(I18N_DIR)/$(RULES_LANG)/Common/templates -name "*.md" | sed 's|$(I18N_DIR)/$(RULES_LANG)/Common/templates/||' | sed 's/^/  - /'; \
	fi
	@echo ""

list-checklists: ## Liste les checklists disponibles
	@echo ""
	@echo "$(CYAN)═══════════════════════════════════════════════════════════$(NC)"
	@echo "$(CYAN) ✅ CHECKLISTS DISPONIBLES (lang=$(RULES_LANG))$(NC)"
	@echo "$(CYAN)═══════════════════════════════════════════════════════════$(NC)"
	@echo ""
	@if [ -d "$(I18N_DIR)/$(RULES_LANG)/Common/checklists" ]; then \
		ls -1 $(I18N_DIR)/$(RULES_LANG)/Common/checklists/*.md 2>/dev/null | xargs -I {} basename {} .md | sed 's/^/  - /'; \
	fi
	@echo ""

#===============================================================================
# Statistiques
#===============================================================================

stats: ## Affiche les statistiques des composants
	@echo ""
	@echo "$(CYAN)═══════════════════════════════════════════════════════════$(NC)"
	@echo "$(CYAN) 📊 STATISTIQUES (lang=$(RULES_LANG))$(NC)"
	@echo "$(CYAN)═══════════════════════════════════════════════════════════$(NC)"
	@echo ""
	@echo "$(YELLOW)Agents:$(NC)"
	@echo "  Common:      $$(ls -1 $(I18N_DIR)/$(RULES_LANG)/Common/agents/*.md 2>/dev/null | wc -l | tr -d ' ')"
	@echo "  Symfony:     $$(ls -1 $(I18N_DIR)/$(RULES_LANG)/Symfony/agents/*.md 2>/dev/null | wc -l | tr -d ' ')"
	@echo "  Flutter:     $$(ls -1 $(I18N_DIR)/$(RULES_LANG)/Flutter/agents/*.md 2>/dev/null | wc -l | tr -d ' ')"
	@echo "  Python:      $$(ls -1 $(I18N_DIR)/$(RULES_LANG)/Python/agents/*.md 2>/dev/null | wc -l | tr -d ' ')"
	@echo "  React:       $$(ls -1 $(I18N_DIR)/$(RULES_LANG)/React/agents/*.md 2>/dev/null | wc -l | tr -d ' ')"
	@echo "  ReactNative: $$(ls -1 $(I18N_DIR)/$(RULES_LANG)/ReactNative/agents/*.md 2>/dev/null | wc -l | tr -d ' ')"
	@echo ""
	@echo "$(YELLOW)Commandes:$(NC)"
	@echo "  /common:      $$(ls -1 $(I18N_DIR)/$(RULES_LANG)/Common/commands/*.md 2>/dev/null | wc -l | tr -d ' ')"
	@echo "  /symfony:     $$(ls -1 $(I18N_DIR)/$(RULES_LANG)/Symfony/commands/*.md 2>/dev/null | wc -l | tr -d ' ')"
	@echo "  /flutter:     $$(ls -1 $(I18N_DIR)/$(RULES_LANG)/Flutter/commands/*.md 2>/dev/null | wc -l | tr -d ' ')"
	@echo "  /python:      $$(ls -1 $(I18N_DIR)/$(RULES_LANG)/Python/commands/*.md 2>/dev/null | wc -l | tr -d ' ')"
	@echo "  /react:       $$(ls -1 $(I18N_DIR)/$(RULES_LANG)/React/commands/*.md 2>/dev/null | wc -l | tr -d ' ')"
	@echo "  /reactnative: $$(ls -1 $(I18N_DIR)/$(RULES_LANG)/ReactNative/commands/*.md 2>/dev/null | wc -l | tr -d ' ')"
	@echo ""
	@echo "$(YELLOW)Templates:$(NC) $$(find $(I18N_DIR)/$(RULES_LANG)/Common/templates -name '*.md' 2>/dev/null | wc -l | tr -d ' ')"
	@echo "$(YELLOW)Checklists:$(NC) $$(ls -1 $(I18N_DIR)/$(RULES_LANG)/Common/checklists/*.md 2>/dev/null | wc -l | tr -d ' ')"
	@echo ""

#===============================================================================
# Maintenance
#===============================================================================

check: ## Vérifie que tous les scripts sont exécutables
	@echo "$(CYAN)🔍 Vérification des scripts...$(NC)"
	@for script in $(SCRIPTS_DIR)/*.sh \
		$(CURDIR)/Project/install-project-commands.sh \
		$(CURDIR)/Infra/install-infra-rules.sh; do \
		if [ -f "$$script" ]; then \
			if [ -x "$$script" ]; then \
				echo "  $(GREEN)✓$(NC) $$script"; \
			else \
				echo "  $(RED)✗$(NC) $$script (non exécutable)"; \
			fi \
		fi \
	done
	@echo ""

fix-permissions: ## Rend tous les scripts exécutables
	@echo "$(CYAN)🔧 Correction des permissions...$(NC)"
	@find $(SCRIPTS_DIR) -name "*.sh" -exec chmod +x {} \;
	@chmod +x $(CURDIR)/Project/install-project-commands.sh
	@chmod +x $(CURDIR)/Infra/install-infra-rules.sh
	@echo "$(GREEN)✅ Permissions corrigées$(NC)"

tree: ## Affiche l'arborescence des fichiers
	@echo ""
	@echo "$(CYAN)📂 Structure des fichiers$(NC)"
	@echo ""
	@if command -v tree &> /dev/null; then \
		tree -I '__pycache__|node_modules|.git' --dirsfirst $(CURDIR)/Dev; \
	else \
		find $(CURDIR)/Dev -type f -name "*.md" -o -name "*.sh" | sort; \
	fi

#===============================================================================
# Default
#===============================================================================

.DEFAULT_GOAL := help
