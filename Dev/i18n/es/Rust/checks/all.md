# Verificación completa de conformidad Rust / Axum

## Argumentos

$ARGUMENTS (opcional: ruta del proyecto a analizar)

## Modo Plan

> El modo plan se activa automáticamente cuando el alcance abarca varios módulos o requiere una investigación transversal.

## MISIÓN

Realizar una auditoría completa de conformidad del proyecto Rust / Axum orquestando las 4 verificaciones principales: Arquitectura, Calidad de código, Tests y Seguridad. Producir un informe consolidado con una puntuación global sobre 100 puntos.

### Paso 1: Preparación de la auditoría

Preparar el entorno de auditoría:
- [ ] Identificar la ruta del proyecto que se va a auditar
- [ ] Verificar la presencia de los archivos de configuración (Cargo.toml, Cargo.lock, rust-toolchain.toml, rustfmt.toml, clippy.toml o tablas `[lints]`, deny.toml, `.sqlx/`)
- [ ] Listar los directorios principales (crates/ o src/, migrations/, tests/, benches/)
- [ ] Identificar el toolchain de Rust (`rust-toolchain.toml`), la edition (`edition = "2024"`) y las versiones de axum / tokio / sqlx (`Cargo.lock`)

**Nota**: Si se proporciona $ARGUMENTS, usarlo como ruta del proyecto; de lo contrario, usar el directorio actual.

### Paso 2: Auditoría de arquitectura (25 puntos)

Ejecutar la verificación completa de arquitectura:

**Comando**: Usar el comando slash `/rust:check architecture` o seguir manualmente los pasos de `.claude/references/rust/checks/architecture.md`

**Criterios evaluados**:
- Disposición del workspace y fronteras entre crates (dominio libre de axum/sqlx) (6 pts)
- Handlers delgados, casos de uso en la capa de aplicación (6 pts)
- Router, State (`Arc<AppState>` / `FromRef`) y extractors (4 pts)
- Modelo de errores: `thiserror` en las librerías, `AppError: IntoResponse`, problem+json (4 pts)
- Middleware Tower, tracing y apagado ordenado (3 pts)
- Dirección de las dependencias y adaptadores de persistencia (SQLx) (2 pts)

**Referencia**: `.claude/references/rust/checks/architecture.md`

### Paso 3: Auditoría de calidad de código (25 puntos)

Ejecutar la verificación de calidad de código:

**Comando**: Usar el comando slash `/rust:check code-quality` o seguir manualmente los pasos de `.claude/references/rust/checks/code-quality.md`

**Criterios evaluados**:
- Clippy limpio con `-D warnings` y lints del workspace (5 pts)
- rustfmt, nomenclatura según las Rust API Guidelines, `#![forbid(unsafe_code)]` (5 pts)
- Higiene de ownership y borrowing, sin clones innecesarios, rustdoc (4 pts)
- Principios KISS/DRY/YAGNI (4 pts)
- Tamaño de las funciones y complejidad cognitiva (4 pts)
- Gestión de errores: sin `unwrap()` / `expect()` en las rutas de petición (3 pts)

**Referencia**: `.claude/references/rust/checks/code-quality.md`

### Paso 4: Auditoría de tests (25 puntos)

Ejecutar la verificación de tests:

**Comando**: Usar el comando slash `/rust:check testing` o seguir manualmente los pasos de `.claude/references/rust/checks/testing.md`

**Criterios evaluados**:
- Cobertura de código (cargo-llvm-cov, objetivo >= 80%) (7 pts)
- Tests unitarios en el módulo para el dominio y los casos de uso (6 pts)
- Tests de integración: Router con `oneshot`, `#[sqlx::test]` (4 pts)
- Calidad de los tests: AAA, nomenclatura, nextest, sin inestabilidad (flakiness) (3 pts)
- Tests basados en propiedades, de snapshots y de mutación (proptest, insta, cargo-mutants) (3 pts)
- Aislamiento de los tests y mocking de los puertos (2 pts)

**Referencia**: `.claude/references/rust/checks/testing.md`

### Paso 5: Auditoría de seguridad (25 puntos)

Ejecutar la verificación de seguridad:

**Comando**: Usar el comando slash `/rust:check security` o seguir manualmente los pasos de `.claude/references/rust/checks/security.md`

**Criterios evaluados**:
- Protecciones OWASP Top 10:2025 (6 pts)
- Gestión de secretos y credenciales (`secrecy`, entorno, vault) (5 pts)
- Validación de entradas (validator / garde), límites de cuerpo, codificación de salida (4 pts)
- Vulnerabilidades de las dependencias y cadena de suministro (cargo-deny, cargo-audit, cargo-vet) (4 pts)
- Autenticación, autorización y limitación de tasa (Argon2id, JWT EdDSA, tower_governor) (3 pts)
- Configuración segura (cabeceras de seguridad, cookies, CORS, TLS) (2 pts)
- Prevención de inyección SQL (parámetros enlazados de SQLx) (1 pt)

**Referencia**: `.claude/references/rust/checks/security.md`

### Paso 6: Consolidación y puntuación global

Calcular la puntuación global y producir el informe consolidado:
- [ ] Sumar las 4 puntuaciones (máx. 100 puntos)
- [ ] Identificar las categorías críticas (<50%)
- [ ] Listar todos los problemas críticos transversales
- [ ] Priorizar las acciones por impacto/esfuerzo
- [ ] Producir el informe consolidado final

**Escala de calificación**:
- 90-100: Excelente - Proyecto de referencia
- 75-89: Muy bueno - Algunas mejoras menores
- 60-74: Aceptable - Requiere mejoras
- 40-59: Insuficiente - Refactorización mayor requerida
- 0-39: Crítico - Revisión completa necesaria

### Paso 7: Recomendaciones y plan de acción

Producir las recomendaciones finales:
- [ ] Identificar las 3 acciones prioritarias principales entre todas las categorías
- [ ] Estimar el esfuerzo (Bajo/Medio/Alto) de cada acción
- [ ] Estimar el impacto (Bajo/Medio/Alto) de cada acción
- [ ] Proponer el orden de implementación
- [ ] Sugerir victorias rápidas (quick wins, alta relación impacto/esfuerzo)

## FORMATO DE SALIDA

```
AUDITORÍA DE CONFORMIDAD RUST / AXUM - INFORME COMPLETO
=======================================================

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
  • Workspace / fronteras entre crates : XX/6
  • Handlers delgados / casos de uso   : XX/6
  • Router, State, extractors          : XX/4
  • Modelo de errores / problem+json   : XX/4
  • Middleware, tracing, apagado       : XX/3
  • Dependencias y adaptadores         : XX/2

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

VICTORIAS RÁPIDAS (Alto impacto / Bajo esfuerzo):

- [Victoria rápida n.º 1] - Categoría: [X] - Impacto: [X] - Esfuerzo: [X]
- [Victoria rápida n.º 2] - Categoría: [X] - Impacto: [X] - Esfuerzo: [X]
- [Victoria rápida n.º 3] - Categoría: [X] - Impacto: [X] - Esfuerzo: [X]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PLAN DE ACCIÓN RECOMENDADO:

SEMANA 1 (Inmediato):
- [ ] [Acción crítica n.º 1]
- [ ] [Victoria rápida prioritaria]

SEMANAS 2-4 (Corto plazo):
- [ ] [Acción importante n.º 2]
- [ ] [Otras victorias rápidas]

MESES 2-3 (Medio plazo):
- [ ] [Acción recomendada n.º 3]
- [ ] [Mejoras progresivas]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

RESUMEN EJECUTIVO:

[Párrafo de resumen sobre el estado global del proyecto, los puntos
fuertes principales, las debilidades principales y la trayectoria
recomendada para mejorar la conformidad. Indicar si el proyecto está
listo para producción, requiere correcciones o necesita una
refactorización.]

Recomendación general: [Listo para producción / Correcciones menores /
Refactorización mayor / Revisión completa necesaria]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## NOTAS IMPORTANTES

- Este comando orquesta las 4 auditorías especializadas
- Usar Docker para todas las herramientas de análisis (`docker compose exec app ...`)
- Proporcionar ejemplos concretos con archivo:línea para cada problema
- Priorizar las acciones según la matriz Impacto/Esfuerzo
- Los problemas de seguridad son SIEMPRE la máxima prioridad
- Proponer correcciones automatizables (scripts, hooks pre-commit, pasos de CI)
- El informe debe ser accionable, no solo descriptivo
- Adaptar las recomendaciones al contexto de negocio del proyecto
- Pragmatismo ante todo: no penalizar a un servicio pequeño por ser un único crate con módulos cuando se respetan las fronteras
