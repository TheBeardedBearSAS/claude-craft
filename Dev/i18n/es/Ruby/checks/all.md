# Verificación completa de conformidad Ruby / Rails

## Argumentos

$ARGUMENTS (opcional: ruta del proyecto a analizar)

## Modo Plan

> El modo plan se activa automáticamente cuando el alcance abarca varios módulos o requiere una investigación transversal.

## MISIÓN

Realizar una auditoría completa de conformidad del proyecto Ruby on Rails orquestando las 4 verificaciones principales: Arquitectura, Calidad de código, Tests y Seguridad. Producir un informe consolidado con una puntuación global sobre 100 puntos.

### Paso 1: Preparación de la auditoría

Preparar el entorno de auditoría:
- [ ] Identificar la ruta del proyecto a auditar
- [ ] Verificar la presencia de los archivos de configuración (Gemfile, Gemfile.lock, .rubocop.yml, config/ci.rb, spec/ o test/)
- [ ] Listar los directorios principales (app/, config/, db/, spec/ o test/, lib/)
- [ ] Identificar la versión de Ruby (`.ruby-version`) y la versión de Rails (`Gemfile.lock`)

**Nota**: Si se proporciona $ARGUMENTS, úsalo como ruta del proyecto; de lo contrario, usa el directorio actual.

### Paso 2: Auditoría de arquitectura (25 puntos)

Ejecutar la verificación completa de arquitectura:

**Comando**: Usa el comando slash `/ruby:check architecture` o sigue manualmente los pasos de `.claude/references/ruby/checks/architecture.md`

**Criterios evaluados**:
- Convenciones de Rails y estructura de `app/` (6 pts)
- Controladores delgados y disciplina de modelos ricos (fat model) (6 pts)
- Service, form y query objects cuando están justificados (4 pts)
- Uso de Active Record: asociaciones, scopes, prevención de N+1 (4 pts)
- Jobs en segundo plano, caché y uso de Hotwire (3 pts)
- Autoloading con Zeitwerk y dirección de las dependencias (2 pts)

**Referencia**: `.claude/references/ruby/checks/architecture.md`

### Paso 3: Auditoría de calidad de código (25 puntos)

Ejecutar la verificación de calidad de código:

**Comando**: Usa el comando slash `/ruby:check code-quality` o sigue manualmente los pasos de `.claude/references/ruby/checks/code-quality.md`

**Criterios evaluados**:
- Conformidad con RuboCop (rubocop-rails-omakase o configuración del proyecto) (5 pts)
- Guía de estilo de Ruby, nomenclatura y `# frozen_string_literal: true` (5 pts)
- Tipado opcional (RBS/Steep o Sorbet) y documentación (4 pts)
- Principios KISS/DRY/YAGNI (4 pts)
- Tamaño y complejidad de los métodos (4 pts)
- Manejo de errores (3 pts)

**Referencia**: `.claude/references/ruby/checks/code-quality.md`

### Paso 4: Auditoría de tests (25 puntos)

Ejecutar la verificación de tests:

**Comando**: Usa el comando slash `/ruby:check testing` o sigue manualmente los pasos de `.claude/references/ruby/checks/testing.md`

**Criterios evaluados**:
- Cobertura de código (SimpleCov, objetivo >= 80%) (7 pts)
- Tests unitarios de modelos y servicios (6 pts)
- Tests de request, de job y de sistema (Capybara) (4 pts)
- Calidad de RSpec / Minitest (3 pts)
- Datos de fixtures / FactoryBot (3 pts)
- Aislamiento de los tests y mocking (2 pts)

**Referencia**: `.claude/references/ruby/checks/testing.md`

### Paso 5: Auditoría de seguridad (25 puntos)

Ejecutar la verificación de seguridad:

**Comando**: Usa el comando slash `/ruby:check security` o sigue manualmente los pasos de `.claude/references/ruby/checks/security.md`

**Criterios evaluados**:
- Protecciones OWASP Top 10:2025 (6 pts)
- Gestión de secretos y credenciales (5 pts)
- Strong parameters, validación de entradas y escape de salidas (4 pts)
- Vulnerabilidades de dependencias (bundler-audit, Brakeman) (4 pts)
- Autenticación, autorización y rate limiting (3 pts)
- Configuración segura (CSP, SSL, cookies) (2 pts)
- Prevención de inyección SQL (1 pt)

**Referencia**: `.claude/references/ruby/checks/security.md`

### Paso 6: Consolidación y puntuación global

Calcular la puntuación global y producir el informe consolidado:
- [ ] Sumar las 4 puntuaciones (máximo 100 puntos)
- [ ] Identificar las categorías críticas (<50%)
- [ ] Listar todos los problemas críticos transversales
- [ ] Priorizar las acciones por impacto/esfuerzo
- [ ] Producir el informe consolidado final

**Escala de calificación**:
- 90-100: Excelente - Proyecto de referencia
- 75-89: Muy bueno - Algunas mejoras menores
- 60-74: Aceptable - Requiere mejoras
- 40-59: Insuficiente - Se requiere una refactorización importante
- 0-39: Crítico - Es necesaria una reestructuración completa

### Paso 7: Recomendaciones y plan de acción

Producir las recomendaciones finales:
- [ ] Identificar las 3 acciones prioritarias principales de todas las categorías
- [ ] Estimar el esfuerzo (Bajo/Medio/Alto) de cada acción
- [ ] Estimar el impacto (Bajo/Medio/Alto) de cada acción
- [ ] Proponer un orden de implementación
- [ ] Sugerir quick wins (alta relación impacto/esfuerzo)

## FORMATO DE SALIDA

```
AUDITORÍA DE CONFORMIDAD RUBY / RAILS - INFORME COMPLETO
=========================================================

PUNTUACIÓN GLOBAL: XX/100

NIVEL DE CONFORMIDAD: [Excelente/Muy bueno/Aceptable/Insuficiente/Crítico]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PUNTUACIONES POR CATEGORÍA:

ARQUITECTURA       : XX/25  [██████████░░░░░░░░░░] XX%
CALIDAD DE CÓDIGO  : XX/25  [██████████░░░░░░░░░░] XX%
TESTS              : XX/25  [██████████░░░░░░░░░░] XX%
SEGURIDAD          : XX/25  [██████████░░░░░░░░░░] XX%

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PUNTOS FUERTES GLOBALES:
1. [Punto fuerte identificado en varias categorías]
2. [Otro punto fuerte importante]
3. [Tercer punto fuerte]

MEJORAS GLOBALES:
1. [Mejora transversal menor]
2. [Otra mejora recomendada]
3. [Tercera mejora]

PROBLEMAS CRÍTICOS:
1. [Problema crítico n.º 1 - categoría afectada]
2. [Problema crítico n.º 2 - categoría afectada]
3. [Problema crítico n.º 3 - categoría afectada]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

DETALLE POR CATEGORÍA:

┌─────────────────────────────────────────────┐
│ ARQUITECTURA (XX/25)                        │
└─────────────────────────────────────────────┘

Subpuntuaciones:
  • Convenciones Rails / estructura app : XX/6
  • Controladores / modelos delgados    : XX/6
  • Service, form, query objects        : XX/4
  • Uso de Active Record                : XX/4
  • Jobs, caché, Hotwire                : XX/3
  • Zeitwerk y dependencias             : XX/2

Puntos fuertes:
- [Puntos fuertes de la arquitectura]

Problemas:
- [Problemas de la arquitectura]

[Secciones similares para Calidad de código, Tests y Seguridad...]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

TOP 3 ACCIONES PRIORITARIAS (TODAS LAS CATEGORÍAS):

1. CRÍTICA - [Acción n.º 1]
   Categoría : [Arquitectura/Calidad/Tests/Seguridad]
   Impacto   : [Alto/Medio/Bajo]
   Esfuerzo  : [Alto/Medio/Bajo]
   Prioridad : INMEDIATA

   Descripción detallada:
   [Explicación del problema y de la solución propuesta]

   Archivos afectados:
   - [archivo:línea]

   Ejemplo de corrección:
   [Código o comando de corrección]

2. IMPORTANTE - [Acción n.º 2]
   [Mismo formato...]

3. RECOMENDADA - [Acción n.º 3]
   [Mismo formato...]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

QUICK WINS (Alto impacto / Bajo esfuerzo):

- [Quick win n.º 1] - Categoría: [X] - Impacto: [X] - Esfuerzo: [X]
- [Quick win n.º 2] - Categoría: [X] - Impacto: [X] - Esfuerzo: [X]
- [Quick win n.º 3] - Categoría: [X] - Impacto: [X] - Esfuerzo: [X]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PLAN DE ACCIÓN RECOMENDADO:

SEMANA 1 (Inmediato):
- [ ] [Acción crítica n.º 1]
- [ ] [Quick win prioritario]

SEMANAS 2-4 (Corto plazo):
- [ ] [Acción importante n.º 2]
- [ ] [Otros quick wins]

MES 2-3 (Medio plazo):
- [ ] [Acción recomendada n.º 3]
- [ ] [Mejoras progresivas]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

RESUMEN EJECUTIVO:

[Párrafo de síntesis sobre el estado global del proyecto, los puntos
fuertes principales, las debilidades principales y la trayectoria
recomendada para mejorar la conformidad. Indicar si el proyecto está
listo para producción, requiere correcciones o necesita una
refactorización.]

Recomendación general: [Listo para producción / Correcciones menores /
Refactorización importante / Reestructuración necesaria]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## NOTAS IMPORTANTES

- Este comando orquesta las 4 auditorías especializadas
- Usa Docker para todas las herramientas de análisis (`docker compose exec app ...`)
- Proporciona ejemplos concretos con archivo:línea para cada problema
- Prioriza las acciones según la matriz Impacto/Esfuerzo
- Los problemas de seguridad son SIEMPRE la máxima prioridad
- Propón correcciones automatizables (scripts, hooks de pre-commit, pasos de `bin/ci`)
- El informe debe ser accionable, no solo descriptivo
- Adapta las recomendaciones al contexto de negocio del proyecto
- Rails Way primero: no penalices a un proyecto por carecer de capas hexagonales cuando se siguen las convenciones
