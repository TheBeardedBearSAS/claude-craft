#!/bin/bash
# =============================================================================
# Claude Accounts - Mensajes en Español
# =============================================================================

# Header
MSG_HEADER="Gestor Multi-Cuentas Claude Code"

# Menu
MSG_MENU_TITLE="¿Qué quieres hacer?"
MSG_MENU_LIST="Listar perfiles"
MSG_MENU_ADD="Añadir un perfil"
MSG_MENU_REMOVE="Eliminar un perfil"
MSG_MENU_AUTH="Autenticar un perfil"
MSG_MENU_LAUNCH="Iniciar Claude Code"
MSG_MENU_CCSP_FUNC="Instalar función ccsp()"
MSG_MENU_MIGRATE="Migrar un perfil legacy"
MSG_MENU_HELP="Ayuda"
MSG_MENU_QUIT="Salir"

# Status
MSG_STATUS_AUTH="autenticado"
MSG_STATUS_NOT_AUTH="no autenticado"
MSG_STATUS_LEGEND_AUTH="= autenticado"
MSG_STATUS_LEGEND_NOT_AUTH="= no autenticado"

# Profile modes
MSG_MODE_SHARED="compartido"
MSG_MODE_ISOLATED="aislado"
MSG_MODE_LEGACY="legacy"
MSG_MODE_LABEL_SHARED="[compartido]"
MSG_MODE_LABEL_ISOLATED="[aislado]"
MSG_MODE_LABEL_LEGACY="[legacy]"
MSG_MODE_LEGEND="config ~/.claude"
MSG_MODE_LEGEND_ISOLATED="config independiente"
MSG_MODE_LEGEND_LEGACY="perfil antiguo"

# List profiles
MSG_PROFILES_TITLE="Perfiles configurados:"
MSG_NO_PROFILE="Ningún perfil configurado"
MSG_USE_ADD="Usa Añadir perfil para empezar"
MSG_PROFILES_AVAILABLE="Perfiles disponibles:"
MSG_ALIAS_LABEL="Alias:"

# Directory
MSG_PROFILES_DIR_CREATED="Directorio de perfiles creado:"

# Add profile
MSG_ADD_TITLE="Añadir un nuevo perfil"
MSG_ADD_NAME_PROMPT="Nombre del perfil (ej: personal, trabajo, cliente-acme):"
MSG_ADD_NAME_EMPTY="El nombre no puede estar vacío"
MSG_ADD_PROFILE_EXISTS="El perfil ya existe"
MSG_ADD_PROFILE_CREATED="Perfil creado"
MSG_ADD_AUTH_NOW="¿Autenticar este perfil ahora?"
MSG_ADD_AUTH_LATER="Para autenticarte más tarde:"
MSG_ADD_AUTH_OR="O reinicia este script y elige 'Autenticar un perfil'"

# Mode selection
MSG_MODE_CHOOSE="Elige el modo del perfil:"
MSG_MODE_SHARED_DESC="Compartido - Misma config que ~/.claude (cambio por límites)"
MSG_MODE_ISOLATED_DESC="Aislado    - Config independiente (ej: cliente)"
MSG_MODE_PROMPT="Modo [1]:"

# Setup messages
MSG_SYMLINK_CREATED="Symlink creado hacia ~/.claude"
MSG_CLAUDE_DIR_MISSING="~/.claude no existe, el symlink se creará después"
MSG_CONFIG_COPIED="Configuración copiada desde ~/.claude"
MSG_EMPTY_PROFILE="~/.claude no existe, perfil vacío creado"

# Remove profile
MSG_REMOVE_TITLE="Eliminar un perfil"
MSG_REMOVE_NO_PROFILE="Ningún perfil para eliminar"
MSG_REMOVE_NUMBER_PROMPT="Número del perfil a eliminar (o nombre):"
MSG_REMOVE_NOT_FOUND="Perfil no encontrado"
MSG_REMOVE_CONFIRM="Vas a eliminar el perfil"
MSG_REMOVE_CANCELLED="Eliminación cancelada"
MSG_REMOVE_DONE="Perfil eliminado"
MSG_ALIAS_REMOVED="Alias eliminado de"

# Migrate profile
MSG_MIGRATE_TITLE="Migrar un perfil legacy"
MSG_MIGRATE_NO_LEGACY="Ningún perfil legacy para migrar (todos tienen modo)"
MSG_MIGRATE_LEGACY_LIST="Perfiles legacy (sin modo):"
MSG_MIGRATE_NUMBER_PROMPT="Número del perfil a migrar:"
MSG_MIGRATE_TO_MODE="¿Migrar a qué modo?"
MSG_MIGRATE_SHARED_DESC="Compartido - Crear symlink hacia ~/.claude"
MSG_MIGRATE_ISOLATED_DESC="Aislado    - Mantener config actual aislada"
MSG_MIGRATE_DONE_SHARED="Perfil migrado a modo COMPARTIDO"
MSG_MIGRATE_DONE_ISOLATED="Perfil migrado a modo AISLADO"
MSG_MIGRATE_CONFIG_KEPT="La configuración existente se conserva"

# Auth profile
MSG_AUTH_TITLE="Autenticar un perfil"
MSG_AUTH_CREATE_FIRST="Ningún perfil configurado. Crea primero un perfil."
MSG_AUTH_NUMBER_PROMPT="Número del perfil a autenticar:"
MSG_AUTH_LAUNCHING="Iniciando Claude Code para el perfil"
MSG_AUTH_CONNECT="Conéctate con la cuenta deseada"

# Launch profile
MSG_LAUNCH_TITLE="Iniciar Claude Code"
MSG_LAUNCH_DEFAULT="default (config por defecto)"
MSG_LAUNCH_PROMPT="Elección:"
MSG_LAUNCH_WITH_DEFAULT="Iniciando con config por defecto..."
MSG_LAUNCH_WITH_PROFILE="Iniciando perfil"
MSG_LAUNCH_NO_PROFILE="Ningún perfil configurado, iniciando con config por defecto"

# Usage/Help
MSG_USAGE_TITLE="Uso"
MSG_USAGE_QUICK="Comandos rápidos:"
MSG_USAGE_ADD_DESC="Añade un nuevo perfil (compartido o aislado)"
MSG_USAGE_RM_DESC="Elimina un perfil"
MSG_USAGE_LIST_DESC="Lista perfiles con su modo"
MSG_USAGE_AUTH_DESC="Autentica un perfil"
MSG_USAGE_RUN_DESC="Inicia Claude Code con un perfil"
MSG_USAGE_MIGRATE_DESC="Migra un perfil legacy a shared/isolated"
MSG_USAGE_MODES="Modos de perfil:"
MSG_USAGE_MODE_SHARED_DESC="Config común (~/.claude), cambio por límites"
MSG_USAGE_MODE_ISOLATED_DESC="Config independiente, para clientes"
MSG_USAGE_MODE_LEGACY_DESC="Perfil antiguo, puede ser migrado"
MSG_USAGE_ALIAS="Después de configurar, usa los alias:"
MSG_USAGE_OR_CC="O la función ccsp() si está añadida:"
MSG_USAGE_LANG_DESC="Idioma (en, fr, es, de, pt)"

# ccsp() function
MSG_CC_TITLE="Instalar función ccsp()"
MSG_CC_ALREADY="La función ccsp() ya está instalada"
MSG_CC_ADDED="Función ccsp() añadida a"
MSG_CC_USAGE="Uso:"
MSG_CC_MENU="Menú de selección"
MSG_CC_PROFILE="Perfil"
MSG_CC_NOT_FOUND="no encontrado. Perfiles disponibles:"
MSG_CC_NONE="(ninguno)"

# Alias
MSG_ALIAS_EXISTS="Alias ya presente en"
MSG_ALIAS_ADDED="Alias añadido a"
MSG_SOURCE_OR_NEW="Ejecuta source o abre un nuevo terminal"

# Prompts
MSG_CONFIRM_YES_NO="(s/N)"
MSG_PRESS_ENTER="Pulsa Enter para continuar..."
MSG_INVALID_CHOICE="Elección inválida"
MSG_UNKNOWN_COMMAND="Comando desconocido:"
MSG_GOODBYE="¡Hasta pronto!"
MSG_INVALID_LANG="Idioma inválido:"
MSG_VALID_LANGS="Idiomas válidos:"

# Mode in creation
MSG_MODE_IN="en modo"
