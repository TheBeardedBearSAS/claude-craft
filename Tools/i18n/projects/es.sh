#!/bin/bash
# =============================================================================
# Claude Projects - Mensajes en Español
# =============================================================================

# Header
MSG_HEADER="Gestor de Proyectos Claude"

# Menu
MSG_MENU_TITLE="¿Qué quieres hacer?"
MSG_MENU_LIST="Listar proyectos"
MSG_MENU_ADD="Añadir un proyecto"
MSG_MENU_EDIT="Editar un proyecto"
MSG_MENU_MODULE="Añadir un módulo"
MSG_MENU_DELETE="Eliminar un proyecto"
MSG_MENU_VALIDATE="Validar configuración"
MSG_MENU_CHANGE_CONFIG="Cambiar archivo config"
MSG_MENU_QUIT="Salir"

# Config file
MSG_CONFIG_TITLE="Archivo de configuración"
MSG_CONFIG_FILES_FOUND="Archivos encontrados:"
MSG_CONFIG_OTHER="Otra ruta..."
MSG_CONFIG_NEW="Nuevo archivo"
MSG_CONFIG_PROMPT="Elección:"
MSG_CONFIG_NEW_PATH="Ruta del nuevo archivo:"
MSG_CONFIG_PATH="Ruta del archivo:"
MSG_CONFIG_NONE="Ningún archivo encontrado."
MSG_CONFIG_DEFAULT="(por defecto:"
MSG_CONFIG_CREATING="Creando archivo de configuración..."
MSG_CONFIG_CREATED="Archivo creado:"
MSG_CONFIG_CURRENT="Configuración:"

# Projects
MSG_PROJECTS_TITLE="Proyectos configurados"
MSG_PROJECTS_NONE="Ningún proyecto configurado"
MSG_PROJECTS_USE_ADD="Usa Añadir proyecto para empezar"
MSG_PROJECTS_SELECT="Selecciona un proyecto:"
MSG_PROJECTS_MODULES="módulo(s)"
MSG_PROJECTS_COMMON="Common:"

# Add project
MSG_ADD_PROJECT_TITLE="Añadir un nuevo proyecto"
MSG_ADD_PROJECT_NAME="Nombre del proyecto (ej: mi-app):"
MSG_ADD_PROJECT_NAME_EMPTY="El nombre no puede estar vacío"
MSG_ADD_PROJECT_EXISTS="El proyecto ya existe"
MSG_ADD_PROJECT_DESC="Descripción (opcional):"
MSG_ADD_PROJECT_ROOT="Ruta raíz (ej: ~/Projects/mi-app):"
MSG_ADD_PROJECT_ROOT_EMPTY="La ruta no puede estar vacía"
MSG_ADD_PROJECT_COMMON="¿Instalar reglas comunes en la raíz?"
MSG_ADD_PROJECT_CREATED="Proyecto creado"
MSG_ADD_PROJECT_MODULES_NOW="¿Añadir módulos ahora?"

# Edit project
MSG_EDIT_PROJECT_TITLE="Editar un proyecto"
MSG_EDIT_PROJECT_SELECT="Selecciona un proyecto a editar:"
MSG_EDIT_PROJECT_EDITING="Editando"
MSG_EDIT_PROJECT_KEEP="(Pulsa Enter para mantener el valor actual)"
MSG_EDIT_PROJECT_NAME="Nombre"
MSG_EDIT_PROJECT_DESC="Descripción"
MSG_EDIT_PROJECT_ROOT="Ruta raíz"
MSG_EDIT_PROJECT_COMMON="¿Instalar common?"
MSG_EDIT_PROJECT_DONE="Proyecto modificado"
MSG_EDIT_PROJECT_MANAGE_MODULES="¿Gestionar módulos?"

# Delete project
MSG_DELETE_PROJECT_TITLE="Eliminar un proyecto"
MSG_DELETE_PROJECT_SELECT="Selecciona un proyecto a eliminar:"
MSG_DELETE_PROJECT_CONFIRM="Vas a eliminar el proyecto"
MSG_DELETE_PROJECT_CANCELLED="Eliminación cancelada"
MSG_DELETE_PROJECT_DONE="Proyecto eliminado"

# Modules
MSG_MODULES_TITLE="Módulos de"
MSG_MODULES_NONE="Ningún módulo"
MSG_MODULES_ADD="Añadir un módulo"
MSG_MODULES_DELETE="Eliminar un módulo"
MSG_MODULES_BACK="Volver"
MSG_MODULES_ADD_TO="Añadir un módulo a"
MSG_MODULES_PATH="Ruta del módulo (ej: frontend, backend, . para raíz):"
MSG_MODULES_PATH_EMPTY="La ruta no puede estar vacía"
MSG_MODULES_TECH="Tecnologías disponibles:"
MSG_MODULES_TECH_PROMPT="Elección:"
MSG_MODULES_DESC="Descripción (opcional):"
MSG_MODULES_ADDED="Módulo añadido"
MSG_MODULES_DELETE_PROMPT="Número del módulo a eliminar:"
MSG_MODULES_DELETED="Módulo eliminado"
MSG_MODULES_ADD_ANOTHER="¿Añadir otro módulo?"

# Validation
MSG_VALIDATE_TITLE="Validación de la configuración"
MSG_VALIDATE_PROJECT="Proyecto:"
MSG_VALIDATE_NAME_MISSING="Nombre faltante"
MSG_VALIDATE_ROOT_MISSING="Ruta raíz faltante"
MSG_VALIDATE_DIR_NOT_FOUND="Directorio no encontrado:"
MSG_VALIDATE_DIR_FOUND="Directorio encontrado:"
MSG_VALIDATE_NO_MODULE="Ningún módulo configurado"
MSG_VALIDATE_INVALID_TECH="tecnología inválida"
MSG_VALIDATE_MODULE="Módulo"
MSG_VALIDATE_SUMMARY="Resumen:"
MSG_VALIDATE_PROJECTS="Proyectos:"
MSG_VALIDATE_ERRORS="Errores:"
MSG_VALIDATE_WARNINGS="Advertencias:"
MSG_VALIDATE_OK="Configuración válida"
MSG_VALIDATE_FAIL="Configuración inválida - corrige los errores"

# Usage/Help
MSG_USAGE_TITLE="Uso"
MSG_USAGE_INTERACTIVE="Modo interactivo:"
MSG_USAGE_MENU="Menú interactivo"
MSG_USAGE_COMMANDS="Comandos directos:"
MSG_USAGE_LIST="Lista proyectos"
MSG_USAGE_ADD="Añade un proyecto"
MSG_USAGE_EDIT="Edita un proyecto"
MSG_USAGE_DELETE="Elimina un proyecto"
MSG_USAGE_VALIDATE="Valida la configuración"
MSG_USAGE_OPTIONS="Opciones:"
MSG_USAGE_CONFIG="Archivo de configuración"
MSG_USAGE_LANG="Idioma (en, fr, es, de, pt)"
MSG_USAGE_EXAMPLES="Ejemplos:"

# Common
MSG_YQ_REQUIRED="yq es necesario pero no está instalado"
MSG_YQ_INSTALL="Instalación:"
MSG_INVALID_CHOICE="Elección inválida"
MSG_UNKNOWN_COMMAND="Comando desconocido:"
MSG_GOODBYE="¡Hasta pronto!"
MSG_CONFIRM_YES_NO="(s/N)"
MSG_YES_NO_DEFAULT="(S/n)"
MSG_PRESS_ENTER="Pulsa Enter para continuar..."
MSG_INVALID_LANG="Idioma inválido:"
MSG_VALID_LANGS="Idiomas válidos:"
