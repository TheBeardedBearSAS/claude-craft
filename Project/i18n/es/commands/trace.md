---
name: trace
description: "Matriz de trazabilidad bidireccional (requisito → historia → código → pruebas); --gaps lista los requisitos no cubiertos, --by-priority agrupa por prioridad MoSCoW"
argument-hint: "[all|requirement|story|code] [ID] [--gaps] [--by-priority] [--level=story|code|test|all] [--format=table|mermaid|json]"
---

# /project:trace

## Misión

Relacionar cada requisito del PRD con las historias de usuario, el código y las pruebas. La vista por defecto es la matriz bidireccional completa; `--gaps` la convierte en un informe de cobertura que lista solo lo que no está cubierto (es el antiguo `/project:trace --gaps`); `--by-priority` agrupa el resultado por prioridad MoSCoW.

## Uso

| Invocación | Qué hace | Reemplaza |
|------------|----------|-----------|
| `/project:trace` o `/project:trace all` | Matriz completa: requisito → historia → código → pruebas | `/project:trace` |
| `/project:trace requirement FR-001` | Traza un requisito hacia abajo | `/project:trace --scope requirement --id FR-001` |
| `/project:trace story US-001` | Traza una historia hacia arriba (requisitos) y hacia abajo (código, pruebas) | `/project:trace --scope story` |
| `/project:trace code` | Archivos de código con y sin referencia a una historia | `/project:trace --scope code` |
| `/project:trace --gaps` | Informe de cobertura: requisitos no cubiertos por historias, código o pruebas, con acciones recomendadas | `/project:trace --gaps` |
| `/project:trace --gaps --level test` | Igual, limitado a un nivel de cobertura (`story`, `code`, `test`, `all`; por defecto `all`) | `/project:trace --gaps --level test` |
| `/project:trace --by-priority` | Agrupa requisitos y porcentajes de cobertura por prioridad MoSCoW | nuevo (antes era una sección de coverage-map) |

Las opciones se combinan: `/project:trace --gaps --by-priority` produce el informe de cobertura con el desglose por prioridad.

## Argumentos

Analizar `$ARGUMENTS`:
- Primer argumento posicional entre `all|requirement|story|code` → alcance (por defecto `all`).
- Siguiente argumento posicional que coincida con `FR-\d+` o `US-\d+` → ID a trazar (necesario para `requirement` y `story`).
- `--gaps` → modo cobertura. `--level` solo se lee en este modo.
- `--by-priority` → agrupar por prioridad: P0 = Must have, P1 = Should have, P2 = Could have / Nice to have.
- `--format` → `table` (por defecto), `mermaid`, `json`.

## Requisitos previos

- `project-management/prd.md` existe con identificadores de requisitos FR-xxx
- `project-management/backlog/` contiene historias de usuario con referencias `Implements:`
- Código con comentarios `// Story: US-xxx` o `# Story: US-xxx` (opcional para `--gaps --level story`)
- Archivos de pruebas con referencias a historias/requisitos

## Plan Mode

> **El Plan Mode es obligatorio.** Antes de ejecutar, Claude activa el Plan Mode para analizar el código afectado, proponer un plan de implementación y esperar su validación antes de realizar cualquier cambio.

## Escaneos compartidos

Ambos modos ejecutan una sola vez los mismos cuatro escaneos; los resultados alimentan la matriz o el informe de cobertura. El **estado** de una historia siempre procede de `.bmad/sprint-status.yaml` (fuente única de verdad); los archivos markdown solo aportan el contenido.

### Escaneo 1: Requisitos

1. Leer `project-management/prd.md`
2. Extraer todos los identificadores FR-xxx de la sección de requisitos funcionales
3. Registrar el texto, la prioridad (P0/P1/P2) y los criterios de aceptación
4. Registro: `{FR-001: {text, priority}}`; contar los requisitos por prioridad

### Escaneo 2: Historias de usuario

1. Recorrer `project-management/backlog/` buscando `US-*.md` (o archivos `user-stories/`)
2. En cada historia, leer la línea `Implements:` o la sección `Traceability`
3. Correspondencia: `{US-001: [FR-001, FR-003]}`; leer el estado y el sprint en `.bmad/sprint-status.yaml`
4. Un requisito que ninguna historia referencia es «No Story»

### Escaneo 3: Código

1. Buscar en el código `// Story: US-xxx`, `# Story: US-xxx`, `@story US-xxx`
2. Correspondencia con archivo y línea: `{US-001: [src/Service/OrderService.php:42]}`
3. Una historia sin referencia es «No Code»; listar los archivos de código sin referencia a una historia

### Escaneo 4: Pruebas

1. Buscar en los directorios de pruebas las referencias `US-xxx` / `FR-xxx` y revisar los nombres de las pruebas
2. Correspondencia: `{US-001: [tests/OrderServiceTest.php]}`
3. Una historia con código pero sin referencia de pruebas es «No Tests»

```
╔══════════════════════════════════════════════════════════╗
║ Requirements: {n} | Stories: {n} | Files: {n} | Tests: {n}║
╚══════════════════════════════════════════════════════════╝
```

## Modo matriz (por defecto)

Combinar las cuatro correspondencias. Salida (formato table):

```
Bidirectional Traceability Matrix
=================================

FR-001 (P0) User Authentication
  ├── US-001: Login with email/password
  │   ├── src/Service/AuthService.php:25
  │   ├── tests/AuthServiceTest.php ✅
  │   └── tests/AuthControllerTest.php ✅
  └── US-002: Password reset flow
      ├── src/Service/PasswordResetService.php:10
      └── tests/PasswordResetServiceTest.php ✅

FR-002 (P0) User Registration
  └── US-003: Register with email
      ├── src/Service/RegistrationService.php:12
      └── ⚠️ NO TESTS

FR-010 (P1) Export to CSV
  └── ⚠️ NO STORIES

Coverage Summary
================
| Level | Covered | Total | Percentage |
|-------|---------|-------|------------|
| Requirements → Stories | 8 | 10 | 80% |
| Stories → Code | 7 | 8 | 87% |
| Stories → Tests | 6 | 8 | 75% |
| End-to-End (FR → Test) | 6 | 10 | 60% |

Gaps Identified
===============
| Type | ID | Description | Action Needed |
|------|----|-------------|---------------|
| No Stories | FR-010 | Export to CSV | Create user story |
| No Tests | US-003 | Register with email | Add test coverage |
```

Con un ID, solo se muestra esa rama, con el estado de la historia y el número de pruebas (p. ej. `US-001: Login [Done]`, `tests/AuthServiceTest.php ✅ (12 tests)`), seguido de `Status: Fully covered (2/2 stories, 3/3 code files, 3/3 test files)`.

### Mermaid (`--format mermaid`)

`graph LR` con cuatro subgrafos (Requirements, Stories, Code, Tests); flechas continuas para los vínculos, flechas punteadas (`-.->|NO STORY|`) hacia un nodo de brecha para los vínculos ausentes; brechas con estilo `fill:#ff6b6b`.

### JSON (`--format json`)

```json
{
  "generated_at": "2026-02-19T10:00:00Z",
  "requirements": {"FR-001": {"text": "User Authentication", "priority": "P0", "stories": ["US-001"], "covered": true}},
  "stories": {"US-001": {"title": "Login", "implements": ["FR-001"], "code_files": ["src/Service/AuthService.php"], "test_files": ["tests/AuthServiceTest.php"], "covered": true}},
  "coverage": {"requirements_to_stories": 0.80, "stories_to_code": 0.87, "stories_to_tests": 0.75, "end_to_end": 0.60},
  "gaps": [{"type": "no_stories", "id": "FR-010", "description": "Export to CSV"}]
}
```

## Modo brechas (`--gaps`)

Reutiliza los escaneos compartidos, calcula la cobertura por capa y lista solo lo que falta. `--level` restringe las capas calculadas: `story` (escaneos 1-2), `code` (1-3), `test` (1-4), `all` (por defecto).

```
Requirement Coverage Map
========================
| Layer | Covered | Total | Coverage | Status |
|-------|---------|-------|----------|--------|
| Stories | 8 | 10 | 80% | ⚠️ |
| Code | 7 | 8 | 87% | ⚠️ |
| Tests | 6 | 8 | 75% | ❌ |
| End-to-End | 6 | 10 | 60% | ❌ |

Uncovered Requirements
| ID | Requirement | Priority | Missing |
|----|-------------|----------|---------|
| FR-005 | Bulk export | P0 | Tests |
| FR-010 | CSV import | P1 | Story, Code, Tests |

Recommended Actions
1. 🔴 CRITICAL: FR-005 (P0) tiene código pero no pruebas — añadir cobertura de pruebas
2. ⚠️ HIGH: FR-010 (P1) no tiene historia — crear una historia de usuario
3. 📝 LOW: FR-020 (P2) sin empezar — planificar para sprints futuros

Next Commands
- /project:trace requirement FR-005   → traza detallada de un requisito
- /project:backlog add story         → crear las historias de usuario que faltan
- /workflow:plan --only=backlog          → regenerar el backlog con las brechas
```

Con `--level test`, mostrar una fila por historia: `US-003 | ❌ | 0 files | 0 tests` y la acción (p. ej. «Crear tests/RegistrationServiceTest.php»).

Mermaid (`--format mermaid`): `graph TD` con un subgrafo por prioridad; nodos `FR-001 ✅`, `FR-005 ⚠️ No Tests`, `FR-010 ❌ No Story`; estilos `#4caf50` (cubierto), `#ff9800` (parcial), `#f44336` (ausente).

### Umbrales de cobertura

| Umbral | Estado | Acción |
|--------|--------|--------|
| >= 90% | ✅ Excelente | Mantener |
| 80-89% | ⚠️ Bueno | Revisar las brechas |
| 60-79% | ⚠️ Por mejorar | Priorizar la cobertura |
| < 60% | ❌ Crítico | Acción inmediata requerida |

## Agrupación por prioridad (`--by-priority`)

Funciona en ambos modos. En modo matriz, los requisitos se listan bajo los encabezados `P0 Must have`, `P1 Should have`, `P2 Could have`. En modo brechas, añadir:

```
Coverage by Priority
| Priority | Requirements | Story Coverage | Code Coverage | Test Coverage |
|----------|-------------|----------------|---------------|---------------|
| P0 (Must Have) | 5 | 100% ✅ | 100% ✅ | 80% ⚠️ |
| P1 (Should Have) | 3 | 66% ⚠️ | 50% ❌ | 33% ❌ |
| P2 (Could Have) | 2 | 0% ❌ | 0% ❌ | 0% ❌ |
```

Las acciones recomendadas se ordenan entonces empezando por P0.

## Ejemplo de sesión

```
User: /project:trace
Claude: 10 requisitos encontrados (5 P0, 3 P1, 2 P2), 8 historias, 24 archivos de código, 18 archivos de pruebas.
        [matriz completa] Cobertura: 60% de extremo a extremo

User: /project:trace requirement FR-001
Claude: [solo la rama FR-001]

User: /project:trace --gaps --by-priority
Claude: [informe de cobertura con tabla por prioridad, 2 requisitos P0 requieren atención]
```

## Comandos relacionados

- `/workflow:plan --only=prd` - Generar el PRD con identificadores de requisitos
- `/workflow:plan --only=backlog` - Crear el backlog a partir del PRD
- `/workflow:design` - Generar la especificación técnica
- `/project:migrate --stories` - Añadir los campos que faltan (como `Implements:`) a las historias
