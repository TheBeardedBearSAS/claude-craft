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
        install-python install-react install-reactnative \
        install-tools install-statusline install-multiaccount install-projectconfig \
        list list-agents list-commands dry-run clean \
        config-install config-install-all config-validate config-list config-dry-run

# Configuration
SHELL := /bin/bash
SCRIPTS_DIR := $(shell pwd)/Dev
TOOLS_DIR := $(shell pwd)/Tools
TARGET ?= .
OPTIONS ?=
CONFIG ?= $(SCRIPTS_DIR)/claude-projects.yaml
PROJECT ?=

# Couleurs
CYAN := \033[0;36m
GREEN := \033[0;32m
YELLOW := \033[1;33m
RED := \033[0;31m
NC := \033[0m

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
	@echo "  $(GREEN)CONFIG$(NC)   Fichier de configuration YAML (défaut: Dev/claude-projects.yaml)"
	@echo "  $(GREEN)PROJECT$(NC)  Nom du projet pour config-install"
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
	@echo "$(CYAN)📦 Installation complète dans $(TARGET)...$(NC)"
	@$(MAKE) install-common TARGET=$(TARGET) OPTIONS=$(OPTIONS)
	@$(MAKE) install-symfony TARGET=$(TARGET) OPTIONS=$(OPTIONS)
	@$(MAKE) install-flutter TARGET=$(TARGET) OPTIONS=$(OPTIONS)
	@$(MAKE) install-python TARGET=$(TARGET) OPTIONS=$(OPTIONS)
	@$(MAKE) install-react TARGET=$(TARGET) OPTIONS=$(OPTIONS)
	@$(MAKE) install-reactnative TARGET=$(TARGET) OPTIONS=$(OPTIONS)
	@echo "$(GREEN)✅ Installation complète terminée !$(NC)"

#===============================================================================
# Installation par Technologie
#===============================================================================

install-common: ## Installe les règles communes (agents transversaux, /common:)
	@echo "$(CYAN)📦 Installation des règles communes...$(NC)"
	@if [ -f "$(SCRIPTS_DIR)/Common/install-common-rules.sh" ]; then \
		$(SCRIPTS_DIR)/Common/install-common-rules.sh $(OPTIONS) $(TARGET); \
	else \
		echo "$(RED)❌ Script non trouvé: Common/install-common-rules.sh$(NC)"; \
		exit 1; \
	fi

install-symfony: ## Installe les règles Symfony
	@echo "$(CYAN)📦 Installation des règles Symfony...$(NC)"
	@if [ -f "$(SCRIPTS_DIR)/Symfony/install-symfony-rules.sh" ]; then \
		$(SCRIPTS_DIR)/Symfony/install-symfony-rules.sh $(OPTIONS) $(TARGET); \
	else \
		echo "$(RED)❌ Script non trouvé: Symfony/install-symfony-rules.sh$(NC)"; \
		exit 1; \
	fi

install-flutter: ## Installe les règles Flutter
	@echo "$(CYAN)📦 Installation des règles Flutter...$(NC)"
	@if [ -f "$(SCRIPTS_DIR)/Flutter/install-flutter-rules.sh" ]; then \
		$(SCRIPTS_DIR)/Flutter/install-flutter-rules.sh $(OPTIONS) $(TARGET); \
	else \
		echo "$(RED)❌ Script non trouvé: Flutter/install-flutter-rules.sh$(NC)"; \
		exit 1; \
	fi

install-python: ## Installe les règles Python
	@echo "$(CYAN)📦 Installation des règles Python...$(NC)"
	@if [ -f "$(SCRIPTS_DIR)/Python/install-python-rules.sh" ]; then \
		$(SCRIPTS_DIR)/Python/install-python-rules.sh $(OPTIONS) $(TARGET); \
	else \
		echo "$(RED)❌ Script non trouvé: Python/install-python-rules.sh$(NC)"; \
		exit 1; \
	fi

install-react: ## Installe les règles React
	@echo "$(CYAN)📦 Installation des règles React...$(NC)"
	@if [ -f "$(SCRIPTS_DIR)/React/install-react-rules.sh" ]; then \
		$(SCRIPTS_DIR)/React/install-react-rules.sh $(OPTIONS) $(TARGET); \
	else \
		echo "$(RED)❌ Script non trouvé: React/install-react-rules.sh$(NC)"; \
		exit 1; \
	fi

install-reactnative: ## Installe les règles React Native
	@echo "$(CYAN)📦 Installation des règles React Native...$(NC)"
	@if [ -f "$(SCRIPTS_DIR)/ReactNative/install-reactnative-rules.sh" ]; then \
		$(SCRIPTS_DIR)/ReactNative/install-reactnative-rules.sh $(OPTIONS) $(TARGET); \
	else \
		echo "$(RED)❌ Script non trouvé: ReactNative/install-reactnative-rules.sh$(NC)"; \
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
	@$(SCRIPTS_DIR)/install-from-config.sh --project $(PROJECT) $(CONFIG)

config-install-all: ## Installe TOUS les projets depuis la config YAML
	@$(SCRIPTS_DIR)/install-from-config.sh $(CONFIG)

config-validate: ## Valide la configuration YAML sans installer
	@$(SCRIPTS_DIR)/install-from-config.sh --validate $(CONFIG)

config-list: ## Liste les projets définis dans la config YAML
	@$(SCRIPTS_DIR)/install-from-config.sh --list $(CONFIG)

config-dry-run: ## Simule l'installation depuis la config (PROJECT=nom optionnel)
	@if [ -n "$(PROJECT)" ]; then \
		$(SCRIPTS_DIR)/install-from-config.sh --dry-run --project $(PROJECT) $(CONFIG); \
	else \
		$(SCRIPTS_DIR)/install-from-config.sh --dry-run $(CONFIG); \
	fi

#===============================================================================
# Lister les Composants
#===============================================================================

list: list-agents list-commands list-templates list-checklists ## Liste tous les composants disponibles

list-agents: ## Liste les agents disponibles
	@echo ""
	@echo "$(CYAN)═══════════════════════════════════════════════════════════$(NC)"
	@echo "$(CYAN) 🤖 AGENTS DISPONIBLES$(NC)"
	@echo "$(CYAN)═══════════════════════════════════════════════════════════$(NC)"
	@echo ""
	@echo "$(YELLOW)Common (transversaux):$(NC)"
	@if [ -d "$(SCRIPTS_DIR)/Common/claude-agents" ]; then \
		ls -1 $(SCRIPTS_DIR)/Common/claude-agents/*.md 2>/dev/null | xargs -I {} basename {} .md | sed 's/^/  - /'; \
	fi
	@echo ""
	@echo "$(YELLOW)Symfony:$(NC)"
	@if [ -d "$(SCRIPTS_DIR)/Symfony/claude-agents" ]; then \
		ls -1 $(SCRIPTS_DIR)/Symfony/claude-agents/*.md 2>/dev/null | xargs -I {} basename {} .md | sed 's/^/  - /'; \
	fi
	@echo ""
	@echo "$(YELLOW)Flutter:$(NC)"
	@if [ -d "$(SCRIPTS_DIR)/Flutter/claude-agents" ]; then \
		ls -1 $(SCRIPTS_DIR)/Flutter/claude-agents/*.md 2>/dev/null | xargs -I {} basename {} .md | sed 's/^/  - /'; \
	fi
	@echo ""
	@echo "$(YELLOW)Python:$(NC)"
	@if [ -d "$(SCRIPTS_DIR)/Python/claude-agents" ]; then \
		ls -1 $(SCRIPTS_DIR)/Python/claude-agents/*.md 2>/dev/null | xargs -I {} basename {} .md | sed 's/^/  - /'; \
	fi
	@echo ""
	@echo "$(YELLOW)React:$(NC)"
	@if [ -d "$(SCRIPTS_DIR)/React/claude-agents" ]; then \
		ls -1 $(SCRIPTS_DIR)/React/claude-agents/*.md 2>/dev/null | xargs -I {} basename {} .md | sed 's/^/  - /'; \
	fi
	@echo ""
	@echo "$(YELLOW)React Native:$(NC)"
	@if [ -d "$(SCRIPTS_DIR)/ReactNative/claude-agents" ]; then \
		ls -1 $(SCRIPTS_DIR)/ReactNative/claude-agents/*.md 2>/dev/null | xargs -I {} basename {} .md | sed 's/^/  - /'; \
	fi
	@echo ""

list-commands: ## Liste les commandes disponibles
	@echo ""
	@echo "$(CYAN)═══════════════════════════════════════════════════════════$(NC)"
	@echo "$(CYAN) 📝 COMMANDES DISPONIBLES$(NC)"
	@echo "$(CYAN)═══════════════════════════════════════════════════════════$(NC)"
	@echo ""
	@echo "$(YELLOW)/common: (transversales)$(NC)"
	@if [ -d "$(SCRIPTS_DIR)/Common/claude-commands/common" ]; then \
		ls -1 $(SCRIPTS_DIR)/Common/claude-commands/common/*.md 2>/dev/null | xargs -I {} basename {} .md | sed 's/^/  - \/common:/'; \
	fi
	@echo ""
	@echo "$(YELLOW)/symfony:$(NC)"
	@if [ -d "$(SCRIPTS_DIR)/Symfony/claude-commands/symfony" ]; then \
		ls -1 $(SCRIPTS_DIR)/Symfony/claude-commands/symfony/*.md 2>/dev/null | xargs -I {} basename {} .md | sed 's/^/  - \/symfony:/'; \
	fi
	@echo ""
	@echo "$(YELLOW)/flutter:$(NC)"
	@if [ -d "$(SCRIPTS_DIR)/Flutter/claude-commands/flutter" ]; then \
		ls -1 $(SCRIPTS_DIR)/Flutter/claude-commands/flutter/*.md 2>/dev/null | xargs -I {} basename {} .md | sed 's/^/  - \/flutter:/'; \
	fi
	@echo ""
	@echo "$(YELLOW)/python:$(NC)"
	@if [ -d "$(SCRIPTS_DIR)/Python/claude-commands/python" ]; then \
		ls -1 $(SCRIPTS_DIR)/Python/claude-commands/python/*.md 2>/dev/null | xargs -I {} basename {} .md | sed 's/^/  - \/python:/'; \
	fi
	@echo ""
	@echo "$(YELLOW)/react:$(NC)"
	@if [ -d "$(SCRIPTS_DIR)/React/claude-commands/react" ]; then \
		ls -1 $(SCRIPTS_DIR)/React/claude-commands/react/*.md 2>/dev/null | xargs -I {} basename {} .md | sed 's/^/  - \/react:/'; \
	fi
	@echo ""
	@echo "$(YELLOW)/reactnative:$(NC)"
	@if [ -d "$(SCRIPTS_DIR)/ReactNative/claude-commands/reactnative" ]; then \
		ls -1 $(SCRIPTS_DIR)/ReactNative/claude-commands/reactnative/*.md 2>/dev/null | xargs -I {} basename {} .md | sed 's/^/  - \/reactnative:/'; \
	fi
	@echo ""

list-templates: ## Liste les templates disponibles
	@echo ""
	@echo "$(CYAN)═══════════════════════════════════════════════════════════$(NC)"
	@echo "$(CYAN) 📋 TEMPLATES DISPONIBLES$(NC)"
	@echo "$(CYAN)═══════════════════════════════════════════════════════════$(NC)"
	@echo ""
	@if [ -d "$(SCRIPTS_DIR)/Common/templates" ]; then \
		find $(SCRIPTS_DIR)/Common/templates -name "*.md" | sed 's|$(SCRIPTS_DIR)/Common/templates/||' | sed 's/^/  - /'; \
	fi
	@echo ""

list-checklists: ## Liste les checklists disponibles
	@echo ""
	@echo "$(CYAN)═══════════════════════════════════════════════════════════$(NC)"
	@echo "$(CYAN) ✅ CHECKLISTS DISPONIBLES$(NC)"
	@echo "$(CYAN)═══════════════════════════════════════════════════════════$(NC)"
	@echo ""
	@if [ -d "$(SCRIPTS_DIR)/Common/checklists" ]; then \
		ls -1 $(SCRIPTS_DIR)/Common/checklists/*.md 2>/dev/null | xargs -I {} basename {} .md | sed 's/^/  - /'; \
	fi
	@echo ""

#===============================================================================
# Statistiques
#===============================================================================

stats: ## Affiche les statistiques des composants
	@echo ""
	@echo "$(CYAN)═══════════════════════════════════════════════════════════$(NC)"
	@echo "$(CYAN) 📊 STATISTIQUES$(NC)"
	@echo "$(CYAN)═══════════════════════════════════════════════════════════$(NC)"
	@echo ""
	@echo "$(YELLOW)Agents:$(NC)"
	@echo "  Common:      $$(ls -1 $(SCRIPTS_DIR)/Common/claude-agents/*.md 2>/dev/null | wc -l | tr -d ' ')"
	@echo "  Symfony:     $$(ls -1 $(SCRIPTS_DIR)/Symfony/claude-agents/*.md 2>/dev/null | wc -l | tr -d ' ')"
	@echo "  Flutter:     $$(ls -1 $(SCRIPTS_DIR)/Flutter/claude-agents/*.md 2>/dev/null | wc -l | tr -d ' ')"
	@echo "  Python:      $$(ls -1 $(SCRIPTS_DIR)/Python/claude-agents/*.md 2>/dev/null | wc -l | tr -d ' ')"
	@echo "  React:       $$(ls -1 $(SCRIPTS_DIR)/React/claude-agents/*.md 2>/dev/null | wc -l | tr -d ' ')"
	@echo "  ReactNative: $$(ls -1 $(SCRIPTS_DIR)/ReactNative/claude-agents/*.md 2>/dev/null | wc -l | tr -d ' ')"
	@echo ""
	@echo "$(YELLOW)Commandes:$(NC)"
	@echo "  /common:      $$(ls -1 $(SCRIPTS_DIR)/Common/claude-commands/common/*.md 2>/dev/null | wc -l | tr -d ' ')"
	@echo "  /symfony:     $$(ls -1 $(SCRIPTS_DIR)/Symfony/claude-commands/symfony/*.md 2>/dev/null | wc -l | tr -d ' ')"
	@echo "  /flutter:     $$(ls -1 $(SCRIPTS_DIR)/Flutter/claude-commands/flutter/*.md 2>/dev/null | wc -l | tr -d ' ')"
	@echo "  /python:      $$(ls -1 $(SCRIPTS_DIR)/Python/claude-commands/python/*.md 2>/dev/null | wc -l | tr -d ' ')"
	@echo "  /react:       $$(ls -1 $(SCRIPTS_DIR)/React/claude-commands/react/*.md 2>/dev/null | wc -l | tr -d ' ')"
	@echo "  /reactnative: $$(ls -1 $(SCRIPTS_DIR)/ReactNative/claude-commands/reactnative/*.md 2>/dev/null | wc -l | tr -d ' ')"
	@echo ""
	@echo "$(YELLOW)Templates:$(NC) $$(find $(SCRIPTS_DIR)/Common/templates -name '*.md' 2>/dev/null | wc -l | tr -d ' ')"
	@echo "$(YELLOW)Checklists:$(NC) $$(ls -1 $(SCRIPTS_DIR)/Common/checklists/*.md 2>/dev/null | wc -l | tr -d ' ')"
	@echo ""

#===============================================================================
# Maintenance
#===============================================================================

check: ## Vérifie que tous les scripts sont exécutables
	@echo "$(CYAN)🔍 Vérification des scripts...$(NC)"
	@for script in $(SCRIPTS_DIR)/*/install-*.sh $(SCRIPTS_DIR)/Common/install-*.sh; do \
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
	@find $(SCRIPTS_DIR) -name "install-*.sh" -exec chmod +x {} \;
	@echo "$(GREEN)✅ Permissions corrigées$(NC)"

tree: ## Affiche l'arborescence des fichiers
	@echo ""
	@echo "$(CYAN)📂 Structure des fichiers$(NC)"
	@echo ""
	@if command -v tree &> /dev/null; then \
		tree -I '__pycache__|node_modules|.git' --dirsfirst $(SCRIPTS_DIR); \
	else \
		find $(SCRIPTS_DIR) -type f -name "*.md" -o -name "*.sh" | sort; \
	fi

#===============================================================================
# Default
#===============================================================================

.DEFAULT_GOAL := help
