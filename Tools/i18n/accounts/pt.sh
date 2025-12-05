#!/bin/bash
# =============================================================================
# Claude Accounts - Mensagens em Português
# =============================================================================

# Header
MSG_HEADER="Gestor Multi-Contas Claude Code"

# Menu
MSG_MENU_TITLE="O que queres fazer?"
MSG_MENU_LIST="Listar perfis"
MSG_MENU_ADD="Adicionar um perfil"
MSG_MENU_REMOVE="Eliminar um perfil"
MSG_MENU_AUTH="Autenticar um perfil"
MSG_MENU_LAUNCH="Iniciar Claude Code"
MSG_MENU_CCSP_FUNC="Instalar função ccsp()"
MSG_MENU_MIGRATE="Migrar um perfil legacy"
MSG_MENU_HELP="Ajuda"
MSG_MENU_QUIT="Sair"

# Status
MSG_STATUS_AUTH="autenticado"
MSG_STATUS_NOT_AUTH="não autenticado"
MSG_STATUS_LEGEND_AUTH="= autenticado"
MSG_STATUS_LEGEND_NOT_AUTH="= não autenticado"

# Profile modes
MSG_MODE_SHARED="partilhado"
MSG_MODE_ISOLATED="isolado"
MSG_MODE_LEGACY="legacy"
MSG_MODE_LABEL_SHARED="[partilhado]"
MSG_MODE_LABEL_ISOLATED="[isolado]"
MSG_MODE_LABEL_LEGACY="[legacy]"
MSG_MODE_LEGEND="config ~/.claude"
MSG_MODE_LEGEND_ISOLATED="config independente"
MSG_MODE_LEGEND_LEGACY="perfil antigo"

# List profiles
MSG_PROFILES_TITLE="Perfis configurados:"
MSG_NO_PROFILE="Nenhum perfil configurado"
MSG_USE_ADD="Usa Adicionar perfil para começar"
MSG_PROFILES_AVAILABLE="Perfis disponíveis:"
MSG_ALIAS_LABEL="Alias:"

# Directory
MSG_PROFILES_DIR_CREATED="Diretório de perfis criado:"

# Add profile
MSG_ADD_TITLE="Adicionar um novo perfil"
MSG_ADD_NAME_PROMPT="Nome do perfil (ex: pessoal, trabalho, cliente-acme):"
MSG_ADD_NAME_EMPTY="O nome não pode estar vazio"
MSG_ADD_PROFILE_EXISTS="O perfil já existe"
MSG_ADD_PROFILE_CREATED="Perfil criado"
MSG_ADD_AUTH_NOW="Autenticar este perfil agora?"
MSG_ADD_AUTH_LATER="Para autenticar mais tarde:"
MSG_ADD_AUTH_OR="Ou reinicia este script e escolhe 'Autenticar um perfil'"

# Mode selection
MSG_MODE_CHOOSE="Escolhe o modo do perfil:"
MSG_MODE_SHARED_DESC="Partilhado - Mesma config que ~/.claude (troca por limites)"
MSG_MODE_ISOLATED_DESC="Isolado    - Config independente (ex: cliente)"
MSG_MODE_PROMPT="Modo [1]:"

# Setup messages
MSG_SYMLINK_CREATED="Symlink criado para ~/.claude"
MSG_CLAUDE_DIR_MISSING="~/.claude não existe, o symlink será criado depois"
MSG_CONFIG_COPIED="Configuração copiada de ~/.claude"
MSG_EMPTY_PROFILE="~/.claude não existe, perfil vazio criado"

# Remove profile
MSG_REMOVE_TITLE="Eliminar um perfil"
MSG_REMOVE_NO_PROFILE="Nenhum perfil para eliminar"
MSG_REMOVE_NUMBER_PROMPT="Número do perfil a eliminar (ou nome):"
MSG_REMOVE_NOT_FOUND="Perfil não encontrado"
MSG_REMOVE_CONFIRM="Vais eliminar o perfil"
MSG_REMOVE_CANCELLED="Eliminação cancelada"
MSG_REMOVE_DONE="Perfil eliminado"
MSG_ALIAS_REMOVED="Alias removido de"

# Migrate profile
MSG_MIGRATE_TITLE="Migrar um perfil legacy"
MSG_MIGRATE_NO_LEGACY="Nenhum perfil legacy para migrar (todos têm modo)"
MSG_MIGRATE_LEGACY_LIST="Perfis legacy (sem modo):"
MSG_MIGRATE_NUMBER_PROMPT="Número do perfil a migrar:"
MSG_MIGRATE_TO_MODE="Migrar para que modo?"
MSG_MIGRATE_SHARED_DESC="Partilhado - Criar symlink para ~/.claude"
MSG_MIGRATE_ISOLATED_DESC="Isolado    - Manter config atual isolada"
MSG_MIGRATE_DONE_SHARED="Perfil migrado para modo PARTILHADO"
MSG_MIGRATE_DONE_ISOLATED="Perfil migrado para modo ISOLADO"
MSG_MIGRATE_CONFIG_KEPT="A configuração existente é mantida"

# Auth profile
MSG_AUTH_TITLE="Autenticar um perfil"
MSG_AUTH_CREATE_FIRST="Nenhum perfil configurado. Cria primeiro um perfil."
MSG_AUTH_NUMBER_PROMPT="Número do perfil a autenticar:"
MSG_AUTH_LAUNCHING="A iniciar Claude Code para o perfil"
MSG_AUTH_CONNECT="Liga-te com a conta desejada"

# Launch profile
MSG_LAUNCH_TITLE="Iniciar Claude Code"
MSG_LAUNCH_DEFAULT="default (config padrão)"
MSG_LAUNCH_PROMPT="Escolha:"
MSG_LAUNCH_WITH_DEFAULT="A iniciar com config padrão..."
MSG_LAUNCH_WITH_PROFILE="A iniciar perfil"
MSG_LAUNCH_NO_PROFILE="Nenhum perfil configurado, a iniciar com config padrão"

# Usage/Help
MSG_USAGE_TITLE="Utilização"
MSG_USAGE_QUICK="Comandos rápidos:"
MSG_USAGE_ADD_DESC="Adiciona um novo perfil (partilhado ou isolado)"
MSG_USAGE_RM_DESC="Elimina um perfil"
MSG_USAGE_LIST_DESC="Lista perfis com o seu modo"
MSG_USAGE_AUTH_DESC="Autentica um perfil"
MSG_USAGE_RUN_DESC="Inicia Claude Code com um perfil"
MSG_USAGE_MIGRATE_DESC="Migra um perfil legacy para shared/isolated"
MSG_USAGE_MODES="Modos de perfil:"
MSG_USAGE_MODE_SHARED_DESC="Config comum (~/.claude), troca por limites"
MSG_USAGE_MODE_ISOLATED_DESC="Config independente, para clientes"
MSG_USAGE_MODE_LEGACY_DESC="Perfil antigo, pode ser migrado"
MSG_USAGE_ALIAS="Após configuração, usa os aliases:"
MSG_USAGE_OR_CC="Ou a função ccsp() se adicionada:"
MSG_USAGE_LANG_DESC="Língua (en, fr, es, de, pt)"

# ccsp() function
MSG_CC_TITLE="Instalar função ccsp()"
MSG_CC_ALREADY="A função ccsp() já está instalada"
MSG_CC_ADDED="Função ccsp() adicionada a"
MSG_CC_USAGE="Utilização:"
MSG_CC_MENU="Menu de seleção"
MSG_CC_PROFILE="Perfil"
MSG_CC_NOT_FOUND="não encontrado. Perfis disponíveis:"
MSG_CC_NONE="(nenhum)"

# Alias
MSG_ALIAS_EXISTS="Alias já presente em"
MSG_ALIAS_ADDED="Alias adicionado a"
MSG_SOURCE_OR_NEW="Executa source ou abre um novo terminal"

# Prompts
MSG_CONFIRM_YES_NO="(s/N)"
MSG_PRESS_ENTER="Prime Enter para continuar..."
MSG_INVALID_CHOICE="Escolha inválida"
MSG_UNKNOWN_COMMAND="Comando desconhecido:"
MSG_GOODBYE="Até breve!"
MSG_INVALID_LANG="Língua inválida:"
MSG_VALID_LANGS="Línguas válidas:"

# Mode in creation
MSG_MODE_IN="em modo"
