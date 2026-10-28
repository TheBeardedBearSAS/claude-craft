#!/bin/bash
# =============================================================================
# Ralph Wiggum - Mensajes en Español
# =============================================================================

# Header
MSG_HEADER="Ralph Wiggum - Bucle Continuo de Agente IA"
MSG_VERSION="Versión"

# Status
MSG_ITERATION="Iteración"
MSG_OF="de"
MSG_SESSION="Sesión"
MSG_STATUS="Estado"
MSG_RUNNING="Ejecutando"
MSG_COMPLETE="Completado"
MSG_FAILED="Fallido"
MSG_TIMEOUT="Tiempo agotado"
MSG_CIRCUIT_BREAKER="Disyuntor"

# Session
MSG_SESSION_CREATED="Sesión creada"
MSG_SESSION_RESUMED="Sesión reanudada"
MSG_SESSION_ID="ID de sesión"
MSG_SESSION_NOT_FOUND="Sesión no encontrada"
MSG_SESSION_DIR="Directorio de sesión"

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
MSG_DOD_ALL_REQUIRED_PASSED="¡Todos los criterios requeridos aprobados!"
MSG_DOD_MISSING_REQUIRED="Criterios requeridos faltantes:"
MSG_DOD_HUMAN_GATE="Validación humana"
MSG_DOD_HUMAN_PROMPT="¿Se ve correcto? (s/n):"

# Validators
MSG_VALIDATOR_COMMAND="Ejecutando comando"
MSG_VALIDATOR_OUTPUT="Verificando patrón de salida"
MSG_VALIDATOR_FILE="Verificando cambios de archivos"
MSG_VALIDATOR_HOOK="Ejecutando hook"
MSG_VALIDATOR_HUMAN="Esperando validación humana"

# Circuit Breaker
MSG_CB_TRIGGERED="Disyuntor activado"
MSG_CB_NO_CHANGES="Sin cambios de archivos durante"
MSG_CB_ITERATIONS="iteraciones"
MSG_CB_REPEATED_ERRORS="Errores repetidos detectados"
MSG_CB_OUTPUT_DECLINE="Salida reducida en"
MSG_CB_PERCENT="porciento"
MSG_CB_MAX_REACHED="Máximo de iteraciones alcanzado"
MSG_CB_RESET="Disyuntor reiniciado"

# Gestión del contexto
MSG_CONTEXT_LIMIT_DETECTED="Límite de contexto detectado"
MSG_CONTEXT_COMPACTING="Ejecutando auto-compact"
MSG_CONTEXT_COMPACTED="Contexto compactado con éxito"
MSG_CONTEXT_COMPACT_FAILED="Fallo de auto-compact"
MSG_CONTEXT_RETRYING="Reintentando después de compact"
MSG_CONTEXT_MAX_REACHED="Máximo de compacts alcanzado"
MSG_CONTEXT_DISABLED="Auto-compact desactivado"

# Gestión avanzada del contexto
MSG_CONTEXT_NEW_SESSION="Creando sesión de continuación"
MSG_CONTEXT_EXTEND="Extensión del límite de compacts"
MSG_CONTEXT_OVERFLOW_FAIL="Límite de contexto excedido, deteniendo"
MSG_CONTEXT_PREVENTIVE="Contexto al {0}% - compact preventivo"
MSG_CONTEXT_BELOW_MIN="Contexto al {0}% - bajo umbral mínimo ({1}%), compact omitido"
MSG_CONTEXT_CONTINUATION_CREATED="Sesión de continuación creada"
MSG_CONTEXT_MAX_CONTINUATIONS="Máximo de sesiones de continuación alcanzado"
MSG_CONTEXT_RECONSTRUCTING="Reconstruyendo contexto desde archivo de progreso"

# Progreso del sprint
MSG_SPRINT_PROGRESS_SAVED="Progreso del sprint guardado"
MSG_SPRINT_PROGRESS_LOADED="Progreso del sprint cargado"
MSG_SPRINT_CURRENT_TASK="Tarea actual"
MSG_SPRINT_COMPLETED_TASKS="Tareas completadas"
MSG_SPRINT_PHASE="Fase"

# Compact estratégico
MSG_CONTEXT_SPRINT_START="Compact al inicio del sprint para contexto limpio"
MSG_CONTEXT_TASK_COMPLETE="Tarea completada - compact estratégico"
MSG_CONTEXT_US_COMPLETE="US completada - compact estratégico"

# Checkpointing
MSG_CHECKPOINT_CREATING="Creando checkpoint..."
MSG_CHECKPOINT_CREATED="Checkpoint creado"
MSG_CHECKPOINT_RESTORING="Restaurando desde checkpoint..."
MSG_CHECKPOINT_RESTORED="Checkpoint restaurado"
MSG_CHECKPOINT_BRANCH="Rama checkpoint"
MSG_CHECKPOINT_COMMIT="Commit"
MSG_CHECKPOINT_FAILED="Fallo en checkpoint"

# Configuration
MSG_CONFIG_LOADING="Cargando configuración..."
MSG_CONFIG_LOADED="Configuración cargada"
MSG_CONFIG_NOT_FOUND="Archivo de configuración no encontrado"
MSG_CONFIG_USING_DEFAULTS="Usando configuración por defecto"
MSG_CONFIG_INVALID="Configuración inválida"
MSG_CONFIG_CREATED="Configuración creada"

# Output
MSG_OUTPUT_LOG="Archivo de log"
MSG_OUTPUT_METRICS="Archivo de métricas"
MSG_OUTPUT_WRITING="Escribiendo salida..."
MSG_OUTPUT_SAVED="Salida guardada"

# Errors
MSG_ERROR="Error"
MSG_ERROR_CLAUDE_NOT_FOUND="Comando claude no encontrado"
MSG_ERROR_NO_PROMPT="No se proporcionó prompt"
MSG_ERROR_INVALID_SESSION="Sesión inválida"
MSG_ERROR_TIMEOUT="Operación expirada"
MSG_ERROR_VALIDATION="Error de validación"
MSG_ERROR_GIT_NOT_FOUND="Git no encontrado (requerido para checkpointing)"
MSG_ERROR_JQ_NOT_FOUND="jq no encontrado (requerido para parseo JSON)"
MSG_ERROR_YQ_NOT_FOUND="yq no encontrado (requerido para parseo YAML)"

# Summary
MSG_SUMMARY_TITLE="Resumen de sesión"
MSG_SUMMARY_ITERATIONS="Iteraciones totales"
MSG_SUMMARY_DURATION="Duración"
MSG_SUMMARY_DOD_STATUS="Estado DoD"
MSG_SUMMARY_FILES_CHANGED="Archivos modificados"
MSG_SUMMARY_EXIT_REASON="Razón de salida"

# Help
MSG_HELP_USAGE="Uso"
MSG_HELP_DESCRIPTION="Ejecutar Claude en bucle continuo hasta completar la tarea"
MSG_HELP_OPTIONS="Opciones"
MSG_HELP_PROMPT="El prompt de tarea para Claude"
MSG_HELP_CONFIG="Ruta al archivo ralph.yml"
MSG_HELP_CONTINUE="Reanudar sesión existente"
MSG_HELP_MAX_ITER="Iteraciones máximas (defecto: 25)"
MSG_HELP_VERBOSE="Habilitar salida verbosa"
MSG_HELP_DRY_RUN="Mostrar qué se haría sin ejecutar"
MSG_HELP_LANG="Idioma (en, fr, es, de, pt)"
MSG_HELP_HELP="Mostrar este mensaje de ayuda"
MSG_HELP_EXAMPLES="Ejemplos"
MSG_HELP_EXAMPLE_BASIC="Uso básico con prompt"
MSG_HELP_EXAMPLE_CONFIG="Con archivo de configuración"
MSG_HELP_EXAMPLE_RESUME="Reanudar sesión anterior"

# Menu (if interactive)
MSG_MENU_TITLE="¿Qué desea hacer?"
MSG_MENU_START="Iniciar nueva sesión Ralph"
MSG_MENU_RESUME="Reanudar sesión existente"
MSG_MENU_LIST="Listar sesiones"
MSG_MENU_CONFIG="Crear configuración"
MSG_MENU_HELP="Ayuda"
MSG_MENU_QUIT="Salir"

# Misc
MSG_PRESS_ENTER="Presione Enter para continuar..."
MSG_YES="sí"
MSG_NO="no"
MSG_CANCEL="Cancelado"
MSG_GOODBYE="¡Adiós!"
MSG_INVALID_CHOICE="Opción inválida"
MSG_CONFIRM="Confirmar"
MSG_WARNING="Advertencia"
MSG_INFO="Info"
MSG_SUCCESS="Éxito"

# =============================================================================
# Mensajes v2.0
# =============================================================================

# Auto-detección
MSG_AUTO_DETECT="Detectando tipo de proyecto automáticamente..."
MSG_AUTO_DETECT_FOUND="Tipo de proyecto detectado"
MSG_AUTO_DETECT_CONFIDENCE="Confianza"
MSG_AUTO_DETECT_NOT_FOUND="No se pudo detectar el tipo de proyecto"
MSG_HELP_AUTO_DETECT="Detectar auto el tipo de proyecto y configurar DoD"
MSG_HELP_INIT="Generar config sin ejecutar (solo init)"
MSG_HELP_INTERACTIVE="Asistente de configuración interactivo"

# Dashboard
MSG_DASHBOARD_ENABLED="Dashboard habilitado"
MSG_DASHBOARD_DISABLED="Dashboard deshabilitado"
MSG_DASHBOARD_MODE="Modo dashboard"

# Métricas
MSG_METRICS_ENABLED="Recopilación de métricas habilitada"
MSG_METRICS_EXPORTED="Métricas exportadas"
MSG_METRICS_FORMAT="Formato de métricas"

# Monitor de salud
MSG_HEALTH_HEALTHY="Salud: OK"
MSG_HEALTH_WARNING="Advertencia de salud"
MSG_HEALTH_CRITICAL="Salud critica"
MSG_HEALTH_STALL="Estancamiento detectado"
MSG_HEALTH_ERROR_SPIRAL="Espiral de errores detectada"
MSG_HEALTH_CONTEXT_BLOAT="Inflación de contexto detectada"

# Hooks
MSG_HOOKS_ENABLED="Integración de hooks habilitada"
MSG_HOOKS_DISABLED="Integración de hooks deshabilitada"
MSG_HOOKS_CONFIG_GENERATED="Configuración de hooks generada"
MSG_HOOKS_DOD_BLOCKED="DoD no satisfecho - parada bloqueada"

# Disyuntor adaptativo
MSG_CB_ADAPTIVE_ENABLED="Disyuntor adaptativo habilitado"
MSG_CB_PROFILE_DETECTED="Perfil detectado"
MSG_CB_LEARNING_ENABLED="Aprendizaje histórico habilitado"
MSG_CB_LEARNING_ADJUSTED="Umbrales ajustados según historial"

# Generador de configuración
MSG_CONFIG_GENERATED="Configuración generada"
MSG_CONFIG_WIZARD_TITLE="Asistente de configuración"
MSG_CONFIG_DETECTING="Detectando configuración del proyecto..."
MSG_CONFIG_CONFIRM="¿Es correcto?"

# Prompts enviados a Claude ({0} = contexto reconstruido)
MSG_PROMPT_CONTINUATION="# Continuación del Sprint

Retoma el trabajo de este sprint tras una compactación del contexto.
El archivo sprint-progress.md contiene el estado completo del trabajo realizado.

{0}

## Instrucciones

1. **Lee** el progreso anterior para entender el estado actual
2. **Verifica** los archivos modificados si es necesario
3. **Retoma** la tarea en curso donde se detuvo
4. **Continúa** el flujo TDD (RED -> GREEN -> REFACTOR)
5. **Actualiza** sprint-progress.md tras cada tarea terminada

## Comandos Importantes

- Tras cada tarea: actualizar sprint-progress.md
- Si hay un bloqueo: anotarlo en la sección Blockers
- Si hay una decisión importante: añadirla en Key Decisions

Continúa la implementación."

# {0} = id de la sesión anterior, {1} = contexto reconstruido
MSG_PROMPT_HANDOFF="# Nueva Sesión de Continuación

Esta sesión continúa el trabajo de la sesión anterior ({0}).
El contexto se ha reiniciado, pero el archivo sprint-progress.md contiene todo el progreso.

{1}

## Contexto de la Transición

- Sesión anterior: {0}
- Motivo: límite de contexto alcanzado (max compacts)
- El trabajo se guardó en sprint-progress.md
- Los archivos están en el estado del último checkpoint git

## Instrucciones

1. **Verifica** el estado actual con git status
2. **Lee** sprint-progress.md para el contexto completo
3. **Identifica** la tarea en curso y su estado
4. **Continúa** exactamente donde se detuvo la sesión anterior

Retoma el trabajo."

# Secciones del contexto reconstruido enviadas a Claude ({0} = fase)
MSG_SECTION_PROGRESS="## Progreso del Sprint"
MSG_SECTION_CURRENT_STATE="### Estado Actual"
MSG_SECTION_UNKNOWN="Desconocido"
MSG_SECTION_COMPLETED_TASKS="### Tareas Completadas"
MSG_SECTION_NONE_YET="Ninguna todavía"
MSG_SECTION_KEY_DECISIONS="### Decisiones Clave"
MSG_SECTION_NONE_RECORDED="Ninguna registrada"
MSG_SECTION_NO_PROGRESS_FILE="No se encontró ningún archivo de progreso del sprint."
MSG_SECTION_GIT="## Cambios Recientes"
MSG_SECTION_NOT_GIT="No está en un repositorio git."
MSG_SECTION_MODIFIED_FILES="### Archivos Modificados (commits recientes)"
MSG_SECTION_NO_RECENT_CHANGES="Sin cambios recientes"
MSG_SECTION_NO_COMMITS="Todavía no hay commits"
MSG_SECTION_RECENT_COMMITS="### Commits Recientes"
MSG_SECTION_UNCOMMITTED="### Cambios Sin Confirmar"
MSG_SECTION_NO_UNCOMMITTED="No hay cambios sin confirmar."
MSG_SECTION_TESTS="## Estado de las Pruebas"
MSG_SECTION_UNIT_TESTS="Pruebas Unitarias"
MSG_SECTION_INTEGRATION_TESTS="Pruebas de Integración"
MSG_SECTION_TASK="## Tarea Actual"
MSG_SECTION_TASK_LABEL="Tarea"
MSG_SECTION_CONTINUE_PHASE="Continúe donde lo dejó en la fase {0}."
MSG_SECTION_NO_TASK="Ninguna tarea en curso."
MSG_SECTION_NO_TASK_INFO="No hay información sobre la tarea actual."
