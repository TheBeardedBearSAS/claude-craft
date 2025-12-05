# Verificación Completa de Cumplimiento Python

## Argumentos

$ARGUMENTS (opcional: ruta al proyecto a analizar)

## MISIÓN

Realizar una auditoría completa de cumplimiento del proyecto Python orquestando las 4 verificaciones principales: Arquitectura, Calidad del Código, Pruebas y Seguridad. Producir un informe consolidado con una puntuación general sobre 100 puntos.

### Paso 1: Preparación de Auditoría

Preparar entorno de auditoría:
- [ ] Identificar ruta del proyecto a auditar
- [ ] Verificar presencia de archivos de configuración (pyproject.toml, requirements.txt)
- [ ] Listar directorios principales (src/, tests/, etc.)
- [ ] Identificar estructura del proyecto

**Nota**: Si se proporciona $ARGUMENTS, usarlo como ruta del proyecto, de lo contrario usar directorio actual.

### Paso 2: Auditoría de Arquitectura (25 puntos)

Ejecutar verificación completa de arquitectura:

**Comando**: Usar comando slash `/check-architecture` o seguir pasos en `check-architecture.md` manualmente

**Criterios Evaluados**:
- Estructura y separación de capas (6 pts)
- Respeto de dependencias (6 pts)
- Ports and Adapters (4 pts)
- Modelado de dominio (4 pts)
- Casos de Uso y Servicios (3 pts)
- Principios SOLID (2 pts)

**Referencia**: `claude-commands/python/check-architecture.md`

### Paso 3: Auditoría de Calidad del Código (25 puntos)

Ejecutar verificación de calidad del código:

**Comando**: Usar comando slash `/check-code-quality` o seguir pasos en `check-code-quality.md` manualmente

**Criterios Evaluados**:
- PEP8 y formato (5 pts)
- Type hints y MyPy (5 pts)
- Linting con Ruff (4 pts)
- KISS/DRY/YAGNI (4 pts)
- Documentación (4 pts)
- Manejo de errores (3 pts)

**Referencia**: `claude-commands/python/check-code-quality.md`

### Paso 4: Auditoría de Pruebas (25 puntos)

Ejecutar verificación de pruebas:

**Comando**: Usar comando slash `/check-testing` o seguir pasos en `check-testing.md` manualmente

**Criterios Evaluados**:
- Cobertura de código (7 pts)
- Pruebas unitarias (6 pts)
- Pruebas de integración (4 pts)
- Calidad de aserciones (3 pts)
- Fixtures y organización (3 pts)
- Rendimiento (2 pts)

**Referencia**: `claude-commands/python/check-testing.md`

### Paso 5: Auditoría de Seguridad (25 puntos)

Ejecutar verificación de seguridad:

**Comando**: Usar comando slash `/check-security` o seguir pasos en `check-security.md` manualmente

**Criterios Evaluados**:
- Escaneo Bandit (6 pts)
- Secretos y credenciales (5 pts)
- Validación de entrada (4 pts)
- Dependencias seguras (4 pts)
- Manejo de errores (3 pts)
- Auth/Authz (2 pts)
- Inyecciones (1 pt)

**Referencia**: `claude-commands/python/check-security.md`

### Paso 6: Consolidación y Puntuación Global

Calcular puntuación general y producir informe consolidado:
- [ ] Sumar las 4 puntuaciones (máx 100 puntos)
- [ ] Identificar categorías críticas (<50%)
- [ ] Listar todos los problemas críticos transversales
- [ ] Priorizar acciones por impacto/esfuerzo
- [ ] Producir informe consolidado final

**Escala de Calificación**:
- 90-100: Excelente - Proyecto de referencia
- 75-89: Muy Bueno - Algunas mejoras menores
- 60-74: Aceptable - Requiere mejoras
- 40-59: Insuficiente - Requiere refactorización mayor
- 0-39: Crítico - Necesaria revisión completa

### Paso 7: Recomendaciones y Plan de Acción

Producir recomendaciones finales:
- [ ] Identificar top 3 acciones prioritarias entre todas las categorías
- [ ] Estimar esfuerzo (Bajo/Medio/Alto) para cada acción
- [ ] Estimar impacto (Bajo/Medio/Alto) para cada acción
- [ ] Proponer orden de implementación
- [ ] Sugerir victorias rápidas (alta relación impacto/esfuerzo)

## FORMATO DE SALIDA

```
AUDITORÍA DE CUMPLIMIENTO PYTHON - INFORME COMPLETO
=============================================

PUNTUACIÓN GENERAL: XX/100

NIVEL DE CUMPLIMIENTO: [Excelente/Muy Bueno/Aceptable/Insuficiente/Crítico]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PUNTUACIONES POR CATEGORÍA:

ARQUITECTURA       : XX/25  [██████████░░░░░░░░░░] XX%
CALIDAD DEL CÓDIGO : XX/25  [██████████░░░░░░░░░░] XX%
PRUEBAS            : XX/25  [██████████░░░░░░░░░░] XX%
SEGURIDAD          : XX/25  [██████████░░░░░░░░░░] XX%

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

FORTALEZAS GENERALES:
1. [Fortaleza identificada en múltiples categorías]
2. [Otra fortaleza importante]
3. [Tercera fortaleza]

MEJORAS GENERALES:
1. [Mejora transversal menor]
2. [Otra mejora recomendada]
3. [Tercera mejora]

PROBLEMAS CRÍTICOS:
1. [Problema crítico #1 - categoría afectada]
2. [Problema crítico #2 - categoría afectada]
3. [Problema crítico #3 - categoría afectada]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

TOP 3 ACCIONES PRIORITARIAS (TODAS LAS CATEGORÍAS):

1. CRÍTICO - [Acción #1]
   Categoría  : [Arquitectura/Calidad/Pruebas/Seguridad]
   Impacto    : [Alto/Medio/Bajo]
   Esfuerzo   : [Alto/Medio/Bajo]
   Prioridad  : INMEDIATA

2. IMPORTANTE - [Acción #2]
   [Mismo formato...]

3. RECOMENDADO - [Acción #3]
   [Mismo formato...]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

VICTORIAS RÁPIDAS (Alto Impacto / Bajo Esfuerzo):

- [Victoria rápida #1] - Categoría: [X] - Impacto: [X] - Esfuerzo: [X]
- [Victoria rápida #2] - Categoría: [X] - Impacto: [X] - Esfuerzo: [X]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

RESUMEN EJECUTIVO:

[Párrafo resumen sobre estado general del proyecto, fortalezas principales,
debilidades principales, y trayectoria recomendada para mejorar
cumplimiento. Mencionar si proyecto está listo para producción,
requiere correcciones, o necesita refactorización.]

Recomendación General: [Listo para producción / Correcciones menores /
Refactorización mayor / Revisión completa necesaria]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## NOTAS IMPORTANTES

- Este comando orquesta las 4 auditorías especializadas
- Usar Docker para todas las herramientas de análisis
- Proporcionar ejemplos concretos con archivo:línea para cada problema
- Priorizar acciones según matriz Impacto/Esfuerzo
- Los problemas de seguridad son SIEMPRE prioridad máxima
- Proponer correcciones automatizables (scripts, hooks pre-commit)
- El informe debe ser accionable, no solo descriptivo
- Adaptar recomendaciones al contexto de negocio del proyecto
