---
description: "Ejecutar cualquier quality gate: gates documentales (PRD, tech spec, backlog, sprint, story, alineación), gates de código (commit, merge, release), el informe completo o un checkpoint de fase"
argument-hint: "<prd|spec|backlog|sprint|story|alignment|commit|merge|release|all> [--phase=pre-sprint|pre-impl|post-impl|pre-merge] [target]"
---

# Verificación de Quality Gates

Punto de entrada único para todos los quality gates de BMAD. Los gates documentales puntúan los artefactos de planificación (PRD, tech spec, backlog, sprint, story, alineación spec-código); los gates de código verifican el repositorio antes de un commit, un merge o una release. `all` agrega los gates documentales en un único informe y `--phase` ejecuta las verificaciones que corresponden a una fase del ciclo de vida.

## Uso

| Invocación | Qué hace | Reemplaza |
|------------|----------|-----------|
| `/gate:check prd [file]` | Quality gate del PRD (umbral 80%) | `/gate:check prd` |
| `/gate:check spec [file]` | Quality gate del Tech Spec (umbral 90%) | `/gate:check spec` |
| `/gate:check backlog [story-id] [--no-gate]` | Gate INVEST, 6/6 por story | `/gate:check backlog` |
| `/gate:check sprint [N] [--verbose]` | Gate Sprint Ready (todos los criterios obligatorios) | `/gate:check sprint` |
| `/gate:check story <story-id>` | Gate Definition of Done (100%) | `/gate:check story` |
| `/gate:check alignment [story-id]` | Gate de alineación spec-código (umbral 85%) | `/gate:check alignment` |
| `/gate:check commit [--fix] [--staged]` | Verificación pre-commit de los archivos modificados | `/gate:check commit` |
| `/gate:check merge [source] [target]` | Verificación pre-merge de una rama | `/gate:check merge` |
| `/gate:check release <version> [patch\|minor\|major]` | Checklist de release | `/gate:check release` |
| `/gate:check all [--detailed]` | Informe de todos los gates documentales | `/gate:check all` |
| `/gate:check --phase=<phase> [story-or-sprint]` | Checkpoint de una fase del ciclo de vida: `pre-sprint`, `pre-impl`, `post-impl`, `pre-merge` | `/gate:check --phase` |

## Argumentos

$ARGUMENTS (formato: `<gate> [target] [flags]` o `--phase=<phase> [target]`)

1. La primera palabra posicional selecciona el gate: `prd`, `spec`, `backlog`, `sprint`, `story`, `alignment`, `commit`, `merge`, `release` o `all`.
2. Las demás palabras posicionales son el `target` del gate (un archivo, un ID de story, un número de sprint, una rama o una versión; ver cada sección); los demás flags se documentan por gate.
3. `--phase=<phase>` sustituye a la palabra del gate: ejecuta el checkpoint de esa fase (ver `## --phase`). `pre-sprint` y `post-impl` aceptan un sprint o una story, `pre-impl` acepta una story.
4. Sin argumento: mostrar la tabla de uso anterior y detenerse. Gate desconocido: listar los gates válidos.

## Reglas compartidas

- **Rutas por defecto**: PRD `project-management/prd.md`, tech spec `project-management/tech-spec.md`, stories `project-management/backlog/`, sprints `project-management/sprints/sprint-{N}-{slug}/`, constitution `project-management/constitution.md` (opcional). Los umbrales de los gates se configuran en `.bmad/gates/*.yaml` (`prd-gate`, `techspec-gate`, `backlog-gate`, `sprint-ready-gate`, `story-gate`).
- **Fuente de verdad del estado**: `.bmad/sprint-status.yaml` contiene el estado de las stories y de las tareas (`backlog -> ready-for-dev -> in-progress -> review -> done`, cualquiera -> `blocked`). Los gates leen el estado de ahí y nunca de los archivos markdown, que solo contienen el contenido. Esquema: `.claude/templates/project/sprint-status.md`.
- **Puntuación**: criterios ponderados; un criterio superado suma su peso a la puntuación (puntuación final = suma de los pesos superados). Todos los criterios «obligatorios» deben superarse para que el gate sea aprobado. Símbolos: ✅ aprobado, ⚠️ parcial, ❌ ausente o fallido, ⏳ omitido o no verificado.
- **Informe**: listar siempre cada criterio con lo encontrado o lo que falta, la puntuación frente al umbral, el veredicto (`GATE PASSED` / `GATE FAILED (need X%, got Y%)`), y después «Required Actions» numeradas con un ejemplo concreto para cada fallo y el comando para volver a ejecutar (`/gate:check <gate>`).
- **Docker**: los gates de código ejecutan las herramientas del proyecto a través de Docker (`docker compose exec <service> ...` o `docker run --rm ...`), nunca en el entorno local.

## prd

Valida un PRD (argumento: `[prd-file]`, por defecto `project-management/prd.md`). Umbral: **80%**.

| Criterio | Peso | Obligatorio | Descripción |
|----------|------|-------------|-------------|
| Problem Statement | 15% | Sí | Formulación clara del problema |
| Target Users | 15% | Sí | Audiencia/personas definidas |
| Goals/Objectives | 15% | Sí | Objetivos medibles |
| Success Metrics | 15% | Sí | KPIs y mediciones |
| Scope/Boundaries | 10% | Sí | Qué está dentro/fuera del alcance |
| User Stories Overview | 10% | Sí | Lista de funcionalidades de alto nivel |
| Assumptions | 10% | No | Supuestos documentados |
| Risks | 10% | No | Identificación de riesgos (con mitigaciones) |

**Proceso**: localizar y cargar el archivo (fallar si no existe); para cada criterio comprobar que la sección existe con palabras clave relevantes y una longitud mínima de contenido; sumar los pesos de los criterios superados; generar el informe.

```
PRD Quality Gate Validation
File: project-management/prd.md   Threshold: 80%
✅ Problem Statement (15%)   Found: clear problem definition in "Overview"
❌ Goals/Objectives (15%)    Missing: no measurable goals found
⚠️ Risks (10%)               Partial: risks listed but no mitigations
Score: 90/100 (90%)
✅ PRD GATE PASSED — Next: /project:generate-tech-spec
```

En caso de fallo, sugerir un ejemplo por cada carencia (p. ej. objetivo «Reduce checkout time by 30%», KPI «Conversion rate > 5%», riesgo «API rate limits; Mitigation: caching»). El gate también se verifica antes de `/project:generate-tech-spec` y en la transición del workflow BMAD.

## spec

Valida un Tech Spec (argumento: `[techspec-file]`, por defecto `project-management/tech-spec.md`). Umbral: **90%**.

| Criterio | Peso | Obligatorio | Descripción |
|----------|------|-------------|-------------|
| Architecture Overview | 12% | Sí | Descripción del diseño del sistema |
| Architecture Diagram | 10% | Sí | Representación visual (mermaid, PNG, SVG) |
| Components | 12% | Sí | Definiciones de módulos/servicios |
| Data Model | 10% | Sí | Diseño de base de datos/entidades |
| API Contracts | 10% | Sí | Especificaciones de endpoints con schemas |
| Security | 12% | Sí | Autenticación y medidas de seguridad |
| Performance | 8% | No | Requisitos de rendimiento |
| Error Handling | 8% | No | Estrategia de errores |
| Testing Strategy | 10% | Sí | Enfoque de pruebas |
| Deployment | 8% | No | CI/CD y release |

**Proceso**: localizar y cargar el archivo; comprobar secciones y palabras clave, verificar que existen diagramas y que la profundidad técnica es suficiente; puntuar; generar el informe.

```
Tech Spec Quality Gate Validation
File: project-management/tech-spec.md   Threshold: 90%
❌ Architecture Diagram (10%)  Missing: no diagram found (mermaid, PNG, SVG)
⚠️ API Contracts (10%)         Partial: endpoints listed but no schemas
Score: 68/100 (68%)
❌ TECH SPEC GATE FAILED (need 90%, got 68%)
```

Las acciones requeridas proporcionan una plantilla por carencia: un esqueleto de diagrama mermaid, la estrategia de seguridad (método de autenticación, modelo de autorización, cifrado), schemas de request/response con formatos de error y versionado, etapas de CI/CD con promoción y rollback. Para decisiones significativas, sugerir un ADR: `/common:architecture-decision "JWT vs Session-based authentication"`. Si se aprueba: siguiente paso `/project:generate-backlog` y después `/gate:check backlog`.

## backlog

Valida las stories contra INVEST (argumentos: `[story-id] [--no-gate]`). Por defecto: todas las stories. `--no-gate` ejecuta solo la verificación INVEST simple (sin umbrales ni veredicto aprobado/fallido), útil durante el refinamiento. Umbral: **6/6 por cada story**.

| Letra | Criterio | Verificación |
|-------|----------|--------------|
| **I** | Independent | `blocked_by` está vacío |
| **N** | Negotiable | Tiene una descripción de longitud razonable, sin sobreespecificar (número de tareas) |
| **V** | Valuable | Tiene criterios de aceptación y una declaración de beneficio |
| **E** | Estimable | Story points > 0 |
| **S** | Small | Story points ≤ 8 |
| **T** | Testable | Número de criterios de aceptación > 0 (Gherkin) |

**Proceso**: leer `.bmad/sprint-status.yaml` y cargar la story solicitada o todas las stories; evaluar los 6 criterios por story (0-6); informar por story y de forma agregada (aprobadas 6/6, advertencias 4-5/6, fallidas < 4/6). Un criterio que no se puede evaluar (p. ej. S sin puntos) se muestra con `?`.

```
✅ US-001: User login          Score: 6/6 ✅
⚠️ US-002: User registration   [E] ✗ Estimable - No story points   Score: 4/6 ⚠️
❌ US-003: Rewrite of auth     [I] ✗ blocked by US-001, US-002  [S] ✗ 13 > 8 points   Score: 3/6 ❌
Summary: validated 8 | passing 6 | warnings 1 | failing 1
❌ BACKLOG GATE FAILED
```

Corrección de problemas comunes: story demasiado grande (S) → `/project:backlog edit story US-003` para reducir el alcance y `/project:backlog add story` para el resto; puntos ausentes (E) → `/project:backlog edit story US-002 --points 3`; criterios de aceptación ausentes (V, T) → `/project:backlog edit story US-002 "Given... When... Then..."`. Si se aprueba: siguiente `/gate:check sprint`.

## sprint

Valida la preparación del sprint (argumentos: `[N] [--verbose]`). `N` es el número de sprint y acepta `1`, `001` o `sprint-001`; por defecto: `metadata.sprint_id` de `.bmad/sprint-status.yaml`, y si no, la carpeta `project-management/sprints/sprint-*/` más reciente. `--verbose` muestra el desglose detallado de las stories. Umbral: **todos los criterios obligatorios**.

| Criterio | Peso | Obligatorio | Descripción |
|----------|------|-------------|-------------|
| Sprint Metadata | 20% | Sí | ID, nombre y fechas definidos |
| Sprint Goal | 15% | Sí | Objetivo claramente formulado (mín. 10 caracteres) |
| Stories Ready | 25% | Sí | Al menos 1 story en `ready-for-dev` (recomendado: 3) |
| Stories Estimated | 20% | Sí | Todas las stories tienen puntos |
| Capacity Check | 10% | No | Puntos ready ≤ `metadata.capacity_points` + 20% (omitido si no está definido) |
| Dependencies Resolved | 10% | No | Ninguna story bloqueada en estado ready |

**Proceso**
1. Cargar el estado del sprint, en este orden:
   1. `.bmad/sprint-status.yaml` si existe y su `metadata.sprint_id` corresponde al sprint `N`: extraer los metadatos y contar las stories por estado.
   2. En caso contrario, fallback markdown desde `project-management/sprints/sprint-{N}-*/` (escrito por `/workflow:start`): metadatos, objetivo y capacidad desde `sprint-goal.md` (inicio, fin, capacidad, objetivo); stories desde la tabla de US seleccionadas de `sprint-goal.md` y los archivos `project-management/backlog/user-stories/US-*.md` (puntos, estado), considerándose `ready-for-dev` una story planificada que aún no ha empezado; dependencias bloqueantes desde `sprint-dependencies.md`.
   3. Ninguno encontrado: fallar con «No sprint {N}: run `/workflow:start {N}`».
2. Validar los campos de metadatos `sprint_id`, `name`, `start_date`, `end_date`, `goal`.
3. Validar las stories (ready, estimadas, ninguna bloqueada) y la capacidad opcional.
4. Generar el informe, empezando por la fuente utilizada: `Source: .bmad/sprint-status.yaml` o `Source: markdown (project-management/sprints/sprint-{N}-*/)`.

En modo fallback el gate se evalúa igualmente, pero el informe añade una advertencia no bloqueante: los comandos `/sprint:*` necesitan `.bmad/sprint-status.yaml`; ejecutar `/workflow:start {N}`, o `/project:migrate` para crear `.bmad/sprint-status.yaml` a partir de un backlog existente.

```
Sprint Ready Gate Validation
Sprint: sprint-3 - User Management   Period: 2026-01-29 → 2026-02-12 (14 days)
✅ Sprint Metadata (20%)  ✅ Sprint Goal (15%)  ✅ Stories Ready (25%): 5 stories, 21 points
✅ Stories Estimated (20%)  ✅ Capacity Check (10%): 21/25 = 84%  ✅ Dependencies Resolved (10%)
Score: 100/100 — ✅ SPRINT READY GATE PASSED
Commands: /workflow:start (start the sprint), /sprint:next-story (pick the first story)
```

En caso de fallo, las acciones requeridas muestran el bloque `metadata` que hay que añadir a `.bmad/sprint-status.yaml`:

```yaml
metadata:
  sprint_id: "sprint-3"
  name: "User Management"
  start_date: "2026-01-29"
  end_date: "2026-02-12"
  goal: "Implement core user management features"
  capacity_points: 25  # Optional: team capacity
```

después las estimaciones que faltan (`/project:backlog edit story US-010 --points 5`) y las stories ready bloqueadas (quitarlas del sprint, desbloquear la dependencia o reordenar).

## story

Valida una story contra la Definition of Done (argumento: `<story-id>`, obligatorio, p. ej. `US-005`). Umbral: **100% (todos los criterios obligatorios)**.

| Criterio | Peso | Obligatorio | Verificación |
|----------|------|-------------|--------------|
| Tasks Complete | 20% | Sí | `tasks.completed == tasks.total` |
| Tests Passing | 20% | Sí | `tdd_phase in ['green', 'refactor', 'done']` |
| AC Validated | 20% | Sí | `acceptance_criteria.validated == acceptance_criteria.total` |
| Code Reviewed | 15% | Sí | `status == 'review'` o `review.approved == true` (PR aprobada) |
| No Blockers | 10% | Sí | `blocked_reason == null` |
| Documentation | 10% | No | Documentación actualizada si es necesario |
| Security Review | 5% | No | Implicaciones de seguridad verificadas |

**Proceso**: leer `.bmad/sprint-status.yaml`, encontrar la story por ID y cargar sus campos; comprobar cada criterio; listar las tareas y los AC con su estado; generar el informe.

```
Story DoD Gate: US-005 — Email verification   Status: in-progress
❌ Tasks Complete (20%)   2/4 done   ✓ TASK-021 ✓ TASK-022 □ TASK-023 (in-progress) □ TASK-024 (pending)
❌ Tests Passing (20%)    TDD Phase: red
⚠️ Acceptance Criteria    1/3 validated
❌ Code Reviewed (15%)    No PR created yet
Score: 25/100 — ❌ STORY DoD GATE FAILED. Resume work: /sprint:dev US-005
```

Si se aprueba: la story puede pasar a `done` con `/sprint:transition US-005 done`. El gate también lo verifica el hook Stop (`quality-gate.sh`) y se comprueba antes de `/sprint:transition <id> done`.

| Fase TDD | Significado | Siguiente paso |
|----------|-------------|----------------|
| red | Tests fallando | Implementar el código |
| green | Tests pasando | Refactorizar |
| refactor | Limpieza en curso | Terminar o pasar a la siguiente tarea |
| done | Ciclo completado | Pasar a review |

## alignment

Valida que la implementación corresponde a las especificaciones, es decir, que no hay deriva de la spec (argumento: `[story-id]`, por defecto: todas las stories del sprint actual). Umbral: **85%**.

| Criterio | Peso | Obligatorio | Descripción |
|----------|------|-------------|-------------|
| Requirement coverage | 20% | Sí | Todos los FR-xxx del PRD están cubiertos por stories |
| Story-code mapping | 20% | Sí | Todas las stories tienen referencias de código correspondientes |
| AC-test mapping | 20% | Sí | Todos los criterios de aceptación tienen tests |
| Tech spec adherence | 15% | Sí | La implementación sigue el diseño del tech spec |
| Constitution compliance | 15% | Sí | El código respeta la constitution del proyecto |
| Scope drift detection | 10% | No | Sin cambios de código sin referencia |

**Proceso**
1. Cargar el PRD (IDs FR-xxx), las stories (referencias `Implements:`), el tech spec y, si existe, `project-management/constitution.md`.
2. Trazar hacia adelante (spec → código): para cada FR-xxx encontrar las stories que lo implementan, para cada story los archivos de código etiquetados `// Story: US-xxx`, para cada AC el test correspondiente.
3. Trazar hacia atrás (código → spec): verificar que cada referencia a una story existe en el backlog y pertenece al sprint correcto; señalar los cambios de código sin referencia a una story (scope drift).
4. Validar la constitution: restricciones técnicas, principios de diseño, objetivos de NFR.
5. Puntuar y generar el informe.

```
SPEC-CODE ALIGNMENT GATE ❌   Story: US-012 | Score: 65%
✅ Requirement coverage   3/3 FR-xxx covered
❌ Story-code mapping     2 files missing references
❌ AC-test mapping        AC-2 has no test
⚠️ Scope drift            3 unreferenced files
Actions: 1. Add // Story: US-012 to ProfileService.ts  2. Write test for AC-2  → Fix issues before merging
```

Relacionados: `/project:trace` (matriz de trazabilidad), `/project:trace --gaps` (cobertura de requisitos).

## commit

Verifica el código antes de un commit (flags: `--fix` corrige los problemas corregibles, `--staged` comprueba solo los archivos staged).

1. **Identificar los archivos modificados**: `git diff --cached --name-only` (staged) y `git diff --name-only` (unstaged).
2. **Detectar la tecnología** por extensión: `.php` → php-cs-fixer, phpstan; `.dart` → dart format, dart analyze; `.py` → ruff, mypy; `.ts/.tsx/.js/.jsx` → eslint, prettier (+ `tsc --noEmit`).
3. **Ejecutar las verificaciones en Docker**: PHP (`docker compose exec php vendor/bin/php-cs-fixer fix --dry-run --diff`, `vendor/bin/phpstan analyse`, `lint:twig`, `lint:container`), Dart (`dart format --set-exit-if-changed`, `dart analyze`, `flutter test --coverage`), Python (`ruff check`, `ruff format --check`, `mypy`), JS/TS (`npx eslint`, `npx prettier --check`, `npx tsc --noEmit`).
4. **Verificaciones globales**: patrones de secretos (asignaciones `password|secret|api_key|token`, `sk_live_`, `pk_live_`, `ghp_`, `gho_`, `AKIA`), archivos prohibidos en staging (`.env`, `.pem`, `.key`, `.p12`), archivos fuente de más de 1 MB.
5. **Informe**: verificaciones superadas, problemas (`file:line`, herramienta, mensaje), tabla resumen (formato, linting, tipos, secretos), acciones requeridas y `Commit authorized: ✅ YES / ❌ NO`.
6. **`--fix`**: ejecutar los fixers en lugar de las verificaciones dry-run (`php-cs-fixer fix`, `dart format`, `ruff check --fix` + `ruff format`, `eslint --fix` + `prettier --write`).

| Bloqueante (commit prohibido) | No bloqueante (advertencia) |
|-------------------------------|-----------------------------|
| Errores de sintaxis, errores de PHPStan/mypy/tsc, secretos detectados, archivos `.env`, claves privadas/certificados | Problemas de formato, advertencias de ESLint, cobertura de tests reducida, TODO/FIXME añadidos |

Para automatizarlo, llamarlo desde un hook pre-commit: `claude-code "/gate:check commit --staged"`.

## merge

Verifica una rama antes de fusionarla (argumentos: `[source] [target]`; source por defecto: la rama actual, target por defecto: `main` o `master`). Ejemplo: `/gate:check merge feature/auth main`.

1. **Analizar el diff**: commits a fusionar (`git log target..source --oneline`), archivos modificados (`--stat`), líneas añadidas/eliminadas (`--shortstat`).
2. **Verificaciones de calidad** (en Docker): la suite de tests completa con cobertura (phpunit, `flutter test --coverage`, `pytest --cov`, `npm run test -- --coverage`); análisis estático completo (`phpstan analyse -l max`, `dart analyze --fatal-infos`, `mypy --strict .`, `tsc --noEmit`); auditoría de dependencias (`composer audit`, `pip-audit`, `npm audit`, `dart pub outdated`).
3. **Verificaciones específicas**: migraciones de BD (`doctrine:migrations:diff`, `doctrine:schema:validate`, reversibilidad), breaking changes de la API (diff de `openapi.yaml` / `docs/api/`), cambios de configuración (`config/`, `.env.example`, `docker-compose*.yml`).
4. **Análisis de commits**: cada mensaje sigue Conventional Commits `type(scope): description`; en caso contrario, advertir.
5. **Cobertura**: comparar antes/después; la cobertura no debe disminuir.
6. **Verificaciones de spec**: ejecutar el checkpoint `pre-merge` (ver `## --phase`).
7. **Informe**: estadísticas, tabla de tests (suite, superados, fallidos, omitidos, variación de cobertura), tabla de análisis estático, seguridad (auditoría, secretos, archivos sensibles), migraciones, puntos de atención clasificados HIGH/MEDIUM/LOW/INFO, checklist final (la aprobación de la code review y los tests en staging son elementos manuales) y `Merge authorized: ✅ YES / ❌ NO`.

| Bloqueante (merge prohibido) | No bloqueante (advertencia) |
|------------------------------|-----------------------------|
| Tests fallidos, caída de cobertura > 2%, errores de análisis estático, vulnerabilidades críticas/altas, secretos en el código, migraciones no reversibles | Advertencias de análisis estático, TODO/FIXME añadidos, vulnerabilidades bajas/medias, caída de cobertura < 2% |

## release

Guía al equipo a través de una release (argumentos: `<version> [patch|minor|major]`, p. ej. `1.2.0 minor` o `2.0.0-beta.1`). Ejemplo: `/gate:check release 1.2.0 minor`.

1. **Validación pre-release**: rama correcta (`main`/`master` o `release/*`), sin cambios sin commitear, todos los tests pasan; `CHANGELOG.md` al día (cambios desde el último tag con `git log $(git describe --tags --abbrev=0)..HEAD --pretty=format:"- %s"`); archivos de versión actualizados (`composer.json`, `pyproject.toml`/`__version__.py`, `package.json`, `pubspec.yaml`, `Info.plist`, `build.gradle`).
2. **Tests exhaustivos**: unitarios, de integración, E2E, de rendimiento, de seguridad.
3. **Documentación**: README, documentación de API generada, guía de migración si hay breaking changes.
4. **Generar la checklist interactiva** `RELEASE CHECKLIST - v{VERSION}` (tipo, fecha, rama) con las secciones siguientes, cada elemento una casilla `- [ ]`:
   - **Pre-release**: calidad del código (tests pasan, cobertura ≥ 80%, sin errores de análisis estático, todas las PR revisadas, sin TODO/FIXME bloqueantes), seguridad (sin CVE críticos, sin secretos, tests OWASP, certificados SSL válidos), documentación (CHANGELOG, README, documentación de API, guía de migración, release notes), versionado (versión incrementada, tags preparados, ramas de release).
   - **Build y empaquetado**: backend (build de producción, assets, migraciones, variables de entorno documentadas), frontend (bundle optimizado, CDN, service worker, sourcemaps no desplegados), móvil si aplica (builds iOS/Android firmados, capturas y metadatos de las stores).
   - **Validación en staging**: despliegue, migraciones, smoke tests, tests de regresión, rendimiento, monitorización, rollback probado.
   - **Despliegue en producción**: pre-deploy (modo mantenimiento, copia de seguridad de la base de datos, comunicación a soporte, ventana de despliegue), deploy (lanzamiento, migraciones, health checks), post-deploy (smoke tests, monitorización, rendimiento, git tag publicado, release en GitHub/GitLab).
   - **Comunicación**: release notes, soporte, clientes, documentación pública, anuncio.
   - **Plan de rollback**: identificar el problema (logs, alertas), umbral de decisión (p. ej. > 5% de 5xx durante 5 min) y responsable de la decisión, comando de rollback, rollback de BD (migraciones down), comunicación (equipo, incidente, post-mortem).
   - **Validación final**: todas las casillas marcadas, validado por, fecha/hora de la release, notas.

Comandos útiles: `git tag -a v{VERSION} -m "Release v{VERSION}"` + `git push origin v{VERSION}`; `gh release create v{VERSION} --title "v{VERSION}" --notes-file RELEASE_NOTES.md`; `git-cliff --unreleased --tag v{VERSION} > CHANGELOG.md`.

| Tipo SemVer | Cuándo | Ejemplo |
|-------------|--------|---------|
| MAJOR | Breaking changes | 1.0.0 → 2.0.0 |
| MINOR | Nueva funcionalidad | 1.0.0 → 1.1.0 |
| PATCH | Corrección de bug | 1.0.0 → 1.0.1 |

## all

Informe agregado de los gates documentales (argumento: `[--detailed]`, que incluye los detalles de validación de cada gate).

1. **Identificar los gates aplicables**: gate PRD si existe `project-management/prd.md`, gate Tech Spec si existe `project-management/tech-spec.md`, gate Backlog si existen stories en `.bmad/sprint-status.yaml`, gate Sprint Ready si existen los metadatos del sprint, gates Story para cada story `in-progress` / `review`.
2. **Ejecutar cada gate aplicable** (`prd`, `spec`, `backlog`, `sprint`, y después `story` por cada story) y recopilar las puntuaciones.
3. **Agregar** en el resumen y después **recomendar** acciones priorizadas a partir de los fallos.

```
BMAD Quality Gates Report   Project: claude-craft   Sprint: sprint-3 - User Management
| Gate | Threshold | Score | Status |
| PRD | 80% | 90% | ✅ PASS |
| Tech Spec | 90% | 92% | ✅ PASS |
| Backlog | 6/6 | 5.8/6 avg | ⚠️ WARN |
| Sprint Ready | 100% | 100% | ✅ PASS |
| Story DoD | 100% | varies | 📊 |
Story DoD Status: US-010 in-progress 45% ⏳ | US-012 review 85% ⚠️ | US-013 done 100% ✅
Overall Health: 🟢 Good — 4/5 gates passing, 8/10 stories on track
Recommendations: 1. ⚠️ US-002 missing story points → /project:backlog edit story US-002 --points 3
```

El informe `--detailed` añade, por gate, el archivo, el umbral, la puntuación, el estado y todos los criterios, las stories con problemas (backlog), el desglose DoD de cada story y los action items por prioridad (1 bloqueante, 2 conviene corregir, 3 deseable). El informe puede generarse bajo demanda, incluirse en la retrospectiva del sprint, usarse para monitorizar la salud del proyecto o exportarse para los stakeholders. Los gates de código (`commit`, `merge`, `release`) y `alignment` no forman parte de él: ejecutarlos por separado.

## --phase

Ejecuta checkpoints automatizados en las fases críticas del ciclo de vida para asegurar que las specs son coherentes, completas y están alineadas con la implementación.

**Requisitos previos**: `project-management/prd.md` con IDs FR-xxx, `project-management/backlog/` con user stories, `.bmad/sprint-status.yaml` para el contexto del sprint; opcional `project-management/constitution.md`.

**El plan mode es obligatorio**: antes de ejecutar, analizar el código afectado, proponer un plan y esperar la validación antes de cualquier cambio.

| Fase | Cuándo | Target |
|------|--------|--------|
| `pre-sprint` | Antes de iniciar un sprint (tras `/workflow:start`) | sprint |
| `pre-impl` | Antes de programar una story (tras `/sprint:next-story --claim`) | story |
| `post-impl` | Tras completar una story (antes de `/sprint:transition US-xxx review`) | story |
| `pre-merge` | Antes de fusionar en main (llamada por `merge`) | story o sprint |

**pre-sprint**: cargar las stories asignadas al sprint.

| Verificación | Obligatoria |
|--------------|-------------|
| Story AC completeness: cada story tiene AC en Gherkin | Sí |
| Story estimation: todas las stories tienen puntos | Sí |
| PRD traceability: `Implements:` referencia IDs FR-xxx válidos | Sí |
| Task decomposition: al menos 1 tarea por story | Sí |
| Dependency check: sin `Depends on:` circulares o sin resolver | Sí |
| Constitution alignment: sin contradicciones | No |

**pre-impl**: cargar la story y sus secciones del tech spec (referencia `Tech Spec:`).

| Verificación | Obligatoria |
|--------------|-------------|
| Tech spec coverage: cada FR-xxx de la story está cubierto | Sí |
| AC testability: cada AC tiene estructura GIVEN/WHEN/THEN | Sí |
| Dependencies resolved: todas las stories `Depends on` están `done` | Sí |
| Task clarity: las tareas tienen descripciones claras | Sí |
| NFR alignment: respeta los NFR de la constitution | No |

**post-impl**: cargar la story y sus tareas.

| Verificación | Obligatoria |
|--------------|-------------|
| Code traceability: los archivos de código referencian `// Story: US-xxx` (o `# Story: US-xxx`) | Sí |
| Test coverage: existen tests para cada AC | Sí |
| All tasks done | Sí |
| TDD phase: `refactor` o `done` | Sí |
| No regressions: la suite de tests sigue pasando | Sí |
| Spec drift: el alcance implementado corresponde a la spec (sin scope creep) | No |

**pre-merge**: ejecutar todos los checkpoints anteriores y después:

| Verificación | Obligatoria |
|--------------|-------------|
| AC validation: todos los criterios de aceptación validados | Sí |
| Code review realizada | Sí |
| Suite de tests en verde (suite completa) | Sí |
| Constitution respect | Sí |
| Traceability complete: FR → US → Code → Test, con `/project:trace` | Sí |
| Documentación actualizada | No |

```
CHECKPOINT FAILED ❌   Phase: pre-impl   Story: US-012   Score: 60% (3/5 checks passed)
✅ AC testability  3/3   ✅ Dependencies resolved   ✅ Task clarity  4/4
❌ Tech spec coverage  Missing FR-003 mapping   ❌ NFR alignment  Perf target undefined
Actions required: 1. Add FR-003 coverage to tech spec section 3.2  2. Define performance targets
→ Fix issues before proceeding
```

Ejemplo: `/gate:check --phase=pre-sprint Sprint-3` → «Score: 83% (5/6 passed) — WARNING: US-015 has no tasks yet». Integración: `/workflow:start` activa `pre-sprint`, `/sprint:next-story` sugiere `pre-impl`, `/sprint:transition` activa `post-impl` y `merge` activa `pre-merge`.

## Comandos relacionados

- `/project:trace` — matriz de trazabilidad y cobertura de requisitos (`--gaps`)
- `/project:generate-tech-spec`, `/project:generate-backlog` — producen los artefactos que validan los gates
- `/workflow:start` — iniciar el sprint (incluye el checkpoint pre-sprint)
- `/sprint:transition` — pasar una story al siguiente estado
