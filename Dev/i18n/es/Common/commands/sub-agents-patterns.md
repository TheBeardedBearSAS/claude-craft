# Patrones de Sub-Agentes

Guía para utilizar sub-agentes de manera efectiva en Claude Code para tareas paralelas y complejas.

## Tipos de Agentes

### 1. Agente Explore (Investigación Rápida)
Utilice para exploración rápida del código fuente y recopilación de información.

```
Task tool con subagent_type: "Explore"
- Búsquedas rápidas de patrones de archivos
- Búsquedas de palabras clave en el código
- Comprensión de la estructura del código fuente
```

**Cuando utilizarlo:**
- Buscar archivos por patrón
- Buscar patrones de código específicos
- Responder preguntas sobre la organización del código fuente

### 2. Agente de Propósito General (Tareas Complejas)
Utilice para tareas de múltiples pasos que requieren autonomía.

```
Task tool con subagent_type: "general-purpose"
- Refactorización compleja
- Actualizaciones de múltiples archivos
- Investigación e implementación
```

**Cuando utilizarlo:**
- Tareas que abarcan múltiples archivos
- Sub-tareas independientes que pueden ejecutarse en paralelo
- Tareas que requieren juicio e iteración

### 3. Agente Plan (Arquitectura)
Utilice para diseñar estrategias de implementación.

```
Task tool con subagent_type: "Plan"
- Planificación de implementación
- Decisiones de arquitectura
- Análisis de compromisos (trade-offs)
```

**Cuando utilizarlo:**
- Antes de implementar funcionalidades complejas
- Cuando existen múltiples enfoques posibles
- Para decisiones arquitectónicas

## Patrones de Tareas Paralelas

### Patrón 1: Investigación Paralela
Lance múltiples agentes Explore para diferentes aspectos:

```
# Lanzar en paralelo (un mensaje con múltiples llamadas a herramientas):
- Agente 1: Buscar patrones de autenticación
- Agente 2: Buscar endpoints de API
- Agente 3: Buscar modelos de base de datos
```

### Patrón 2: Actualizaciones Paralelas
Para actualizaciones de archivos independientes entre idiomas/módulos:

```
# Lanzar en paralelo:
- Agente 1: Actualizar plantillas en francés
- Agente 2: Actualizar plantillas en español
- Agente 3: Actualizar plantillas en alemán
- Agente 4: Actualizar plantillas en portugués
```

### Patrón 3: Verificaciones de Calidad Paralelas
Ejecute diferentes verificaciones de calidad simultáneamente:

```
# Lanzar en paralelo:
- Agente 1: Ejecutar linter
- Agente 2: Ejecutar pruebas
- Agente 3: Verificar tipos
- Agente 4: Auditoría de seguridad
```

## Agentes en Segundo Plano

Utilice `run_in_background: true` para tareas de larga duración:

```
Task tool con:
  run_in_background: true

Beneficios:
- Continuar trabajando mientras el agente se ejecuta
- Verificar el progreso mediante el archivo de salida
- Notificación cuando se completa
```

**Ideal para:**
- Suites de pruebas
- Procesos de build
- Migraciones grandes
- Pipelines de calidad

### Solicitud de Permisos (v2.1.20+)

Los agentes en segundo plano solicitan permisos **antes** de lanzarse, evitando bloqueos durante la ejecución:

```
Lanzando tarea en segundo plano: "Analizar y corregir código"

Esta tarea necesitará permisos para:
- Read (todos los archivos)
- Edit (src/**)
- Bash (npm run lint:fix)

¿Aprobar todo? [y/N/seleccionar]
```

**Opciones de respuesta:**

| Opción       | Acción                               |
|--------------|--------------------------------------|
| `y`          | Aprobar todos los permisos solicitados |
| `N`          | Rechazar y cancelar el lanzamiento  |
| `seleccionar`| Elegir permisos individualmente     |

### Métricas de la Herramienta Task (v2.1.30+)

Los resultados de la herramienta Task ahora incluyen métricas de ejecución:

| Métrica       | Descripción                                           |
|---------------|-------------------------------------------------------|
| Token count   | Total de tokens consumidos por el sub-agente          |
| Tool uses     | Número de invocaciones de herramientas durante la ejecución |
| Duration      | Tiempo total transcurrido para completar la tarea     |

## Mejores Prácticas

### Hacer
- Lanzar tareas independientes en paralelo (un mensaje, múltiples herramientas)
- Utilizar el agente Explore para búsquedas rápidas
- Utilizar el modo en segundo plano para tareas largas
- Proporcionar prompts claros y detallados

### No Hacer
- Lanzar tareas dependientes en paralelo
- Utilizar agentes para lecturas simples de un solo archivo
- Olvidar verificar los resultados de los agentes en segundo plano
- Utilizar prompts vagos que requieran aclaración

## Ejemplo: Actualización Multi-Idioma

```markdown
# Tarea: Actualizar todas las plantillas i18n al nuevo formato

## Ejecución Paralela:
1. Lanzar 4 agentes (FR, ES, DE, PT) con run_in_background: true
2. Continuar trabajando en otras fases
3. Verificar los resultados cuando se notifique

## Cada agente recibe:
- Lista de archivos a actualizar
- Formato de plantilla a seguir
- Instrucciones de lectura antes de escritura
```

## Patrones de Coordinación

### Secuencial con Puntos de Control
Para tareas que tienen dependencias:

```
1. Agente A completa la tarea A
2. Verificar resultado
3. Agente B utiliza el resultado para la tarea B
4. Verificar resultado
5. Continuar...
```

### Fan-Out/Fan-In
Para trabajo paralelo con resultados combinados:

```
1. Fan-out: Lanzar N agentes en paralelo
2. Esperar: Todos los agentes completan
3. Fan-in: Combinar/verificar resultados
4. Continuar con el estado combinado
```

## Referencias

- Documentación de la herramienta Task de Claude Code
- `.claude/rules/01-workflow-analysis.md` para patrones de análisis
- `.claude/settings.json` para la configuración de permisos
