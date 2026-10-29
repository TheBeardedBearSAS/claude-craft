# Verificación Completa de Conformidad de C#/.NET

## Argumentos

$ARGUMENTS (opcional: ruta al proyecto a analizar)

## Modo Plan

> El modo plan se activa automáticamente cuando el alcance abarca varios módulos o requiere una investigación transversal.

## MISIÓN

Realizar una auditoría de conformidad completa del proyecto C#/.NET orquestando las 4 verificaciones principales: Arquitectura, Calidad de Código, Pruebas y Seguridad. Producir un informe consolidado con una puntuación global sobre 100 puntos.

### Paso 1: Preparación de la Auditoría

Preparar el entorno de auditoría:
- [ ] Identificar la ruta del proyecto a auditar
- [ ] Verificar la presencia de los archivos de configuración (.sln, .csproj, Directory.Build.props)
- [ ] Listar los directorios principales (src/, tests/, etc.)
- [ ] Identificar la estructura del proyecto y la versión de .NET

**Nota**: Si se proporcionan $ARGUMENTS, usarlos como ruta del proyecto; en caso contrario, usar el directorio actual.

### Paso 2: Auditoría de Arquitectura (25 puntos)

Ejecutar la verificación completa de arquitectura:

**Comando**: Usar el comando slash `/csharp:check architecture` o seguir manualmente los pasos de `.claude/references/csharp/checks/architecture.md`

**Criterios Evaluados**:
- Separación de capas de Clean Architecture (6 pts)
- Flujo de dependencias (el Dominio no tiene referencias externas) (6 pts)
- Patrones CQRS y MediatR (4 pts)
- Modelado DDD (Entidades, Value Objects, Agregados) (4 pts)
- Patrones Repository y Unit of Work (3 pts)
- Referencias de proyectos y reglas de dependencia (2 pts)

**Referencia**: `.claude/references/csharp/checks/architecture.md`

### Paso 3: Auditoría de Calidad de Código (25 puntos)

Ejecutar la verificación de calidad de código:

**Comando**: Usar el comando slash `/csharp:check code-quality` o seguir manualmente los pasos de `.claude/references/csharp/checks/code-quality.md`

**Criterios Evaluados**:
- Convenciones de nomenclatura (PascalCase, _camelCase) (5 pts)
- Características modernas de C# (records, pattern matching) (5 pts)
- Tipos de referencia anulables habilitados (4 pts)
- Principios KISS/DRY/YAGNI (4 pts)
- Patrones async/await (sin .Result/.Wait()) (4 pts)
- Documentación y comentarios XML (3 pts)

**Referencia**: `.claude/references/csharp/checks/code-quality.md`

### Paso 4: Auditoría de Pruebas (25 puntos)

Ejecutar la verificación de pruebas:

**Comando**: Usar el comando slash `/csharp:check testing` o seguir manualmente los pasos de `.claude/references/csharp/checks/testing.md`

**Criterios Evaluados**:
- Cobertura de código (7 pts)
- Pruebas unitarias del Dominio y la Aplicación (6 pts)
- Pruebas de integración de la Infraestructura (4 pts)
- Calidad de FluentAssertions (3 pts)
- Organización de pruebas y fixtures (3 pts)
- Patrones de mocking (Moq/NSubstitute) (2 pts)

**Referencia**: `.claude/references/csharp/checks/testing.md`

### Paso 5: Auditoría de Seguridad (25 puntos)

Ejecutar la verificación de seguridad:

**Comando**: Usar el comando slash `/csharp:check security` o seguir manualmente los pasos de `.claude/references/csharp/checks/security.md`

**Criterios Evaluados**:
- Protecciones OWASP Top 10 (6 pts)
- Gestión de secretos y credenciales (5 pts)
- Validación de entradas (FluentValidation) (4 pts)
- Vulnerabilidades de dependencias (4 pts)
- Autenticación y autorización (3 pts)
- Configuración segura (2 pts)
- Prevención de inyección SQL (1 pt)

**Referencia**: `.claude/references/csharp/checks/security.md`

### Paso 6: Consolidación y Puntuación Global

Calcular la puntuación global y producir el informe consolidado:
- [ ] Sumar las 4 puntuaciones (máximo 100 puntos)
- [ ] Identificar las categorías críticas (<50%)
- [ ] Enumerar todos los problemas transversales críticos
- [ ] Priorizar las acciones por impacto/esfuerzo
- [ ] Producir el informe consolidado final

**Escala de Calificación**:
- 90-100: Excelente - Proyecto de referencia
- 75-89: Muy Bueno - Algunas mejoras menores
- 60-74: Aceptable - Requiere mejoras
- 40-59: Insuficiente - Refactorización importante necesaria
- 0-39: Crítico - Revisión completa necesaria

### Paso 7: Recomendaciones y Plan de Acción

Producir las recomendaciones finales:
- [ ] Identificar las 3 acciones prioritarias principales en todas las categorías
- [ ] Estimar el esfuerzo (Bajo/Medio/Alto) para cada acción
- [ ] Estimar el impacto (Bajo/Medio/Alto) para cada acción
- [ ] Proponer un orden de implementación
- [ ] Sugerir victorias rápidas (alta relación impacto/esfuerzo)

## FORMATO DE SALIDA

```
AUDITORÍA DE CONFORMIDAD C#/.NET - INFORME COMPLETO
=============================================

PUNTUACIÓN GLOBAL: XX/100

NIVEL DE CONFORMIDAD: [Excelente/Muy Bueno/Aceptable/Insuficiente/Crítico]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PUNTUACIONES POR CATEGORÍA:

ARQUITECTURA       : XX/25  [██████████░░░░░░░░░░] XX%
CALIDAD DE CÓDIGO  : XX/25  [██████████░░░░░░░░░░] XX%
PRUEBAS            : XX/25  [██████████░░░░░░░░░░] XX%
SEGURIDAD          : XX/25  [██████████░░░░░░░░░░] XX%

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

FORTALEZAS GLOBALES:
1. [Fortaleza identificada en múltiples categorías]
2. [Otra fortaleza principal]
3. [Tercera fortaleza]

MEJORAS GLOBALES:
1. [Mejora transversal menor]
2. [Otra mejora recomendada]
3. [Tercera mejora]

PROBLEMAS CRÍTICOS:
1. [Problema crítico #1 - categoría afectada]
2. [Problema crítico #2 - categoría afectada]
3. [Problema crítico #3 - categoría afectada]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

DETALLES POR CATEGORÍA:

┌─────────────────────────────────────────────┐
│ ARQUITECTURA (XX/25)                        │
└─────────────────────────────────────────────┘

Sub-puntuaciones:
  • Capas Clean Architecture  : XX/6
  • Flujo de dependencias     : XX/6
  • CQRS y MediatR            : XX/4
  • Modelado DDD              : XX/4
  • Patrones Repository       : XX/3
  • Referencias de proyectos  : XX/2

Fortalezas:
- [Fortalezas de arquitectura]

Problemas:
- [Problemas de arquitectura]

[Secciones similares para Calidad de Código, Pruebas y Seguridad...]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

TOP 3 ACCIONES PRIORITARIAS (TODAS LAS CATEGORÍAS):

1. CRÍTICO - [Acción #1]
   Categoría : [Arquitectura/Calidad/Pruebas/Seguridad]
   Impacto   : [Alto/Medio/Bajo]
   Esfuerzo  : [Alto/Medio/Bajo]
   Prioridad : INMEDIATA

   Descripción detallada:
   [Explicación del problema y solución propuesta]

   Archivos afectados:
   - [archivo:línea]

   Ejemplo de corrección:
   [Código o comando de corrección]

2. IMPORTANTE - [Acción #2]
   [Mismo formato...]

3. RECOMENDADA - [Acción #3]
   [Mismo formato...]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

VICTORIAS RÁPIDAS (Alto Impacto / Bajo Esfuerzo):

- [Victoria rápida #1] - Categoría: [X] - Impacto: [X] - Esfuerzo: [X]
- [Victoria rápida #2] - Categoría: [X] - Impacto: [X] - Esfuerzo: [X]
- [Victoria rápida #3] - Categoría: [X] - Impacto: [X] - Esfuerzo: [X]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PLAN DE ACCIÓN RECOMENDADO:

SEMANA 1 (Inmediato):
- [ ] [Acción crítica #1]
- [ ] [Victoria rápida prioritaria]

SEMANAS 2-4 (Corto plazo):
- [ ] [Acción importante #2]
- [ ] [Otras victorias rápidas]

MESES 2-3 (Medio plazo):
- [ ] [Acción recomendada #3]
- [ ] [Mejoras progresivas]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

RESUMEN EJECUTIVO:

[Párrafo de resumen sobre el estado general del proyecto, las principales
fortalezas, las principales debilidades y la trayectoria recomendada para
mejorar la conformidad. Indicar si el proyecto está listo para producción,
requiere correcciones o necesita refactorización.]

Recomendación General: [Listo para producción / Correcciones menores /
Refactorización importante / Revisión completa necesaria]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## NOTAS IMPORTANTES

- Este comando orquesta las 4 auditorías especializadas
- Usar Docker para todas las herramientas de análisis
- Proporcionar ejemplos concretos con archivo:línea para cada problema
- Priorizar las acciones según la matriz Impacto/Esfuerzo
- Los problemas de seguridad son SIEMPRE la máxima prioridad
- Proponer correcciones automatizables (scripts, hooks de pre-commit)
- El informe debe ser accionable, no solo descriptivo
- Adaptar las recomendaciones al contexto de negocio del proyecto
