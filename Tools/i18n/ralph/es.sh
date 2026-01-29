#!/bin/bash
# =============================================================================
# Ralph Wiggum - Mensajes en Espanol
# =============================================================================

# Header
MSG_HEADER="Ralph Wiggum - Bucle Continuo de Agente IA"
MSG_VERSION="Version"

# Status
MSG_ITERATION="Iteracion"
MSG_OF="de"
MSG_SESSION="Sesion"
MSG_STATUS="Estado"
MSG_RUNNING="Ejecutando"
MSG_COMPLETE="Completado"
MSG_FAILED="Fallido"
MSG_TIMEOUT="Tiempo agotado"
MSG_CIRCUIT_BREAKER="Disyuntor"

# Session
MSG_SESSION_CREATED="Sesion creada"
MSG_SESSION_RESUMED="Sesion reanudada"
MSG_SESSION_ID="ID de sesion"
MSG_SESSION_NOT_FOUND="Sesion no encontrada"
MSG_SESSION_DIR="Directorio de sesion"

# Loop
MSG_STARTING_LOOP="Iniciando bucle Ralph"
MSG_PROMPT="Prompt"
MSG_INVOKING_CLAUDE="Invocando Claude..."
MSG_WAITING="Esperando"
MSG_SECONDS="segundos"
MSG_LOOP_COMPLETE="Bucle completado"
MSG_LOOP_STOPPED="Bucle detenido"

# Definition of Done
MSG_DOD_TITLE="Definition of Done"
MSG_DOD_CHECKING="Verificando criterios DoD..."
MSG_DOD_PASSED="DoD APROBADO"
MSG_DOD_FAILED="DoD NO COMPLETADO"
MSG_DOD_ITEM_PASSED="OK"
MSG_DOD_ITEM_FAILED="FALLO"
MSG_DOD_ITEM_SKIPPED="OMITIDO"
MSG_DOD_REQUIRED="Requerido"
MSG_DOD_OPTIONAL="Opcional"
MSG_DOD_ALL_REQUIRED_PASSED="Todos los criterios requeridos aprobados!"
MSG_DOD_MISSING_REQUIRED="Criterios requeridos faltantes:"
MSG_DOD_HUMAN_GATE="Validacion humana"
MSG_DOD_HUMAN_PROMPT="Se ve correcto? (s/n):"

# Validators
MSG_VALIDATOR_COMMAND="Ejecutando comando"
MSG_VALIDATOR_OUTPUT="Verificando patron de salida"
MSG_VALIDATOR_FILE="Verificando cambios de archivos"
MSG_VALIDATOR_HOOK="Ejecutando hook"
MSG_VALIDATOR_HUMAN="Esperando validacion humana"

# Circuit Breaker
MSG_CB_TRIGGERED="Disyuntor activado"
MSG_CB_NO_CHANGES="Sin cambios de archivos durante"
MSG_CB_ITERATIONS="iteraciones"
MSG_CB_REPEATED_ERRORS="Errores repetidos detectados"
MSG_CB_OUTPUT_DECLINE="Salida reducida en"
MSG_CB_PERCENT="porciento"
MSG_CB_MAX_REACHED="Maximo de iteraciones alcanzado"
MSG_CB_RESET="Disyuntor reiniciado"

# Gestion del contexto
MSG_CONTEXT_LIMIT_DETECTED="Limite de contexto detectado"
MSG_CONTEXT_COMPACTING="Ejecutando auto-compact"
MSG_CONTEXT_COMPACTED="Contexto compactado con exito"
MSG_CONTEXT_COMPACT_FAILED="Fallo de auto-compact"
MSG_CONTEXT_RETRYING="Reintentando despues de compact"
MSG_CONTEXT_MAX_REACHED="Maximo de compacts alcanzado"
MSG_CONTEXT_DISABLED="Auto-compact desactivado"

# Gestion avanzada del contexto
MSG_CONTEXT_NEW_SESSION="Creando sesion de continuacion"
MSG_CONTEXT_EXTEND="Extension del limite de compacts"
MSG_CONTEXT_OVERFLOW_FAIL="Limite de contexto excedido, deteniendo"
MSG_CONTEXT_PREVENTIVE="Contexto al {0}% - compact preventivo"
MSG_CONTEXT_BELOW_MIN="Contexto al {0}% - bajo umbral minimo ({1}%), compact omitido"
MSG_CONTEXT_CONTINUATION_CREATED="Sesion de continuacion creada"
MSG_CONTEXT_MAX_CONTINUATIONS="Maximo de sesiones de continuacion alcanzado"
MSG_CONTEXT_RECONSTRUCTING="Reconstruyendo contexto desde archivo de progreso"

# Progreso del sprint
MSG_SPRINT_PROGRESS_SAVED="Progreso del sprint guardado"
MSG_SPRINT_PROGRESS_LOADED="Progreso del sprint cargado"
MSG_SPRINT_CURRENT_TASK="Tarea actual"
MSG_SPRINT_COMPLETED_TASKS="Tareas completadas"
MSG_SPRINT_PHASE="Fase"

# Compact estrategico
MSG_CONTEXT_SPRINT_START="Compact al inicio del sprint para contexto limpio"
MSG_CONTEXT_TASK_COMPLETE="Tarea completada - compact estrategico"
MSG_CONTEXT_US_COMPLETE="US completada - compact estrategico"

# Checkpointing
MSG_CHECKPOINT_CREATING="Creando checkpoint..."
MSG_CHECKPOINT_CREATED="Checkpoint creado"
MSG_CHECKPOINT_RESTORING="Restaurando desde checkpoint..."
MSG_CHECKPOINT_RESTORED="Checkpoint restaurado"
MSG_CHECKPOINT_BRANCH="Rama checkpoint"
MSG_CHECKPOINT_COMMIT="Commit"
MSG_CHECKPOINT_FAILED="Fallo en checkpoint"

# Configuration
MSG_CONFIG_LOADING="Cargando configuracion..."
MSG_CONFIG_LOADED="Configuracion cargada"
MSG_CONFIG_NOT_FOUND="Archivo de configuracion no encontrado"
MSG_CONFIG_USING_DEFAULTS="Usando configuracion por defecto"
MSG_CONFIG_INVALID="Configuracion invalida"
MSG_CONFIG_CREATED="Configuracion creada"

# Output
MSG_OUTPUT_LOG="Archivo de log"
MSG_OUTPUT_METRICS="Archivo de metricas"
MSG_OUTPUT_WRITING="Escribiendo salida..."
MSG_OUTPUT_SAVED="Salida guardada"

# Errors
MSG_ERROR="Error"
MSG_ERROR_CLAUDE_NOT_FOUND="Comando claude no encontrado"
MSG_ERROR_NO_PROMPT="No se proporciono prompt"
MSG_ERROR_INVALID_SESSION="Sesion invalida"
MSG_ERROR_TIMEOUT="Operacion expirada"
MSG_ERROR_VALIDATION="Error de validacion"
MSG_ERROR_GIT_NOT_FOUND="Git no encontrado (requerido para checkpointing)"
MSG_ERROR_JQ_NOT_FOUND="jq no encontrado (requerido para parseo JSON)"
MSG_ERROR_YQ_NOT_FOUND="yq no encontrado (requerido para parseo YAML)"

# Summary
MSG_SUMMARY_TITLE="Resumen de sesion"
MSG_SUMMARY_ITERATIONS="Iteraciones totales"
MSG_SUMMARY_DURATION="Duracion"
MSG_SUMMARY_DOD_STATUS="Estado DoD"
MSG_SUMMARY_FILES_CHANGED="Archivos modificados"
MSG_SUMMARY_EXIT_REASON="Razon de salida"

# Help
MSG_HELP_USAGE="Uso"
MSG_HELP_DESCRIPTION="Ejecutar Claude en bucle continuo hasta completar la tarea"
MSG_HELP_OPTIONS="Opciones"
MSG_HELP_PROMPT="El prompt de tarea para Claude"
MSG_HELP_CONFIG="Ruta al archivo ralph.yml"
MSG_HELP_CONTINUE="Reanudar sesion existente"
MSG_HELP_MAX_ITER="Iteraciones maximas (defecto: 25)"
MSG_HELP_VERBOSE="Habilitar salida verbosa"
MSG_HELP_DRY_RUN="Mostrar que se haria sin ejecutar"
MSG_HELP_LANG="Idioma (en, fr, es, de, pt)"
MSG_HELP_HELP="Mostrar este mensaje de ayuda"
MSG_HELP_EXAMPLES="Ejemplos"
MSG_HELP_EXAMPLE_BASIC="Uso basico con prompt"
MSG_HELP_EXAMPLE_CONFIG="Con archivo de configuracion"
MSG_HELP_EXAMPLE_RESUME="Reanudar sesion anterior"

# Menu (if interactive)
MSG_MENU_TITLE="Que desea hacer?"
MSG_MENU_START="Iniciar nueva sesion Ralph"
MSG_MENU_RESUME="Reanudar sesion existente"
MSG_MENU_LIST="Listar sesiones"
MSG_MENU_CONFIG="Crear configuracion"
MSG_MENU_HELP="Ayuda"
MSG_MENU_QUIT="Salir"

# Misc
MSG_PRESS_ENTER="Presione Enter para continuar..."
MSG_YES="si"
MSG_NO="no"
MSG_CANCEL="Cancelado"
MSG_GOODBYE="Adios!"
MSG_INVALID_CHOICE="Opcion invalida"
MSG_CONFIRM="Confirmar"
MSG_WARNING="Advertencia"
MSG_INFO="Info"
MSG_SUCCESS="Exito"

# =============================================================================
# Mensajes v2.0
# =============================================================================

# Auto-deteccion
MSG_AUTO_DETECT="Detectando tipo de proyecto automaticamente..."
MSG_AUTO_DETECT_FOUND="Tipo de proyecto detectado"
MSG_AUTO_DETECT_CONFIDENCE="Confianza"
MSG_AUTO_DETECT_NOT_FOUND="No se pudo detectar el tipo de proyecto"
MSG_HELP_AUTO_DETECT="Detectar auto el tipo de proyecto y configurar DoD"
MSG_HELP_INIT="Generar config sin ejecutar (solo init)"
MSG_HELP_INTERACTIVE="Asistente de configuracion interactivo"

# Dashboard
MSG_DASHBOARD_ENABLED="Dashboard habilitado"
MSG_DASHBOARD_DISABLED="Dashboard deshabilitado"
MSG_DASHBOARD_MODE="Modo dashboard"

# Metricas
MSG_METRICS_ENABLED="Recopilacion de metricas habilitada"
MSG_METRICS_EXPORTED="Metricas exportadas"
MSG_METRICS_FORMAT="Formato de metricas"

# Monitor de salud
MSG_HEALTH_HEALTHY="Salud: OK"
MSG_HEALTH_WARNING="Advertencia de salud"
MSG_HEALTH_CRITICAL="Salud critica"
MSG_HEALTH_STALL="Estancamiento detectado"
MSG_HEALTH_ERROR_SPIRAL="Espiral de errores detectada"
MSG_HEALTH_CONTEXT_BLOAT="Inflacion de contexto detectada"

# Hooks
MSG_HOOKS_ENABLED="Integracion de hooks habilitada"
MSG_HOOKS_DISABLED="Integracion de hooks deshabilitada"
MSG_HOOKS_CONFIG_GENERATED="Configuracion de hooks generada"
MSG_HOOKS_DOD_BLOCKED="DoD no satisfecho - parada bloqueada"

# Disyuntor adaptativo
MSG_CB_ADAPTIVE_ENABLED="Disyuntor adaptativo habilitado"
MSG_CB_PROFILE_DETECTED="Perfil detectado"
MSG_CB_LEARNING_ENABLED="Aprendizaje historico habilitado"
MSG_CB_LEARNING_ADJUSTED="Umbrales ajustados segun historial"

# Generador de configuracion
MSG_CONFIG_GENERATED="Configuracion generada"
MSG_CONFIG_WIZARD_TITLE="Asistente de configuracion"
MSG_CONFIG_DETECTING="Detectando configuracion del proyecto..."
MSG_CONFIG_CONFIRM="Es correcto?"
