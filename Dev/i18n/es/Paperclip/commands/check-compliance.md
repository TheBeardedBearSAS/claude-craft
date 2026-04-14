---
description: Verificar Cumplimiento Completo de Paperclip
argument-hint: [ruta-proyecto]
---

# Verificar Cumplimiento Completo de Paperclip

## Argumentos

$ARGUMENTS (opcional: ruta al proyecto Paperclip a analizar)

## MISIÓN

Realizar una auditoría de cumplimiento completa de un proyecto Paperclip orquestando las 4 verificaciones principales — Arquitectura, Calidad de Código, Tests, Seguridad — más la verificación de **Protocolo de Adaptadores** específica de Paperclip. Producir un reporte consolidado con un puntaje general sobre 100 puntos.

### Paso 1: Preparación de Auditoría

- [ ] Identificar ruta del proyecto (`$ARGUMENTS` o directorio actual)
- [ ] Confirmar que es un workspace de Paperclip: verificar `server/`, `ui/`, `cli/`, `packages/` (con `adapters/`, `plugins/sdk/`), `pnpm-workspace.yaml`, y entradas `@paperclipai/*`
- [ ] Notar versión de Paperclip (desde `@paperclipai/plugin-sdk` instalado o versión CLI de `paperclipai`)
- [ ] Listar adaptadores bajo `packages/adapters/*` y cualquier plugin bajo `packages/plugins/examples/*` o repos de plugin externos

### Paso 2: Auditoría de Arquitectura (25 puntos)

Invocar `/paperclip:check-architecture`.

Criterios evaluados:
- Separación de dos capas (control plane vs adaptadores) — 6 pts
- Límites de módulo bajo `server/src/modules/` — 5 pts
- Sin lógica de gobernanza dentro de adaptadores — 6 pts
- Forma de `shared/types` (tipos puros, sin runtime) — 3 pts
- Log de actividad emitido en cada mutación — 3 pts
- Especificación OpenAPI cubre cada ruta — 2 pts

### Paso 3: Auditoría de Calidad de Código (20 puntos)

Invocar `/paperclip:check-code-quality`.

Criterios evaluados:
- TypeScript strict + `noUncheckedIndexedAccess` — 5 pts
- Sin `any`, sin casts silenciosos — 4 pts
- ESLint flat config + Prettier pasa — 3 pts
- Convenciones de nomenclatura (archivos kebab, tipos PascalCase, etc.) — 3 pts
- Complejidad cognitiva < 10 por función — 3 pts
- Logs estructurados, sin filtración de secretos en logs — 2 pts

### Paso 4: Auditoría de Testing (20 puntos)

Invocar `/paperclip:check-testing`.

Criterios evaluados:
- Cobertura ≥ 80% (líneas, funciones, statements) — 6 pts
- Tests de contrato de adaptador pasan para cada adaptador enviado — 6 pts
- Tests de integración golpean un PostgreSQL real — 4 pts
- Sin `.only` / `.skip` en main — 2 pts
- Factories usadas sobre fixtures — 2 pts

### Paso 5: Auditoría de Seguridad (20 puntos)

Invocar `/paperclip:check-security`.

Criterios evaluados:
- Todos los endpoints con scope de tenant por `companyId` desde sesión — 4 pts
- Secretos cifrados en reposo, redactados en logs — 4 pts
- Compuertas de aprobación solo del lado del servidor, eventos solo-agregar — 3 pts
- Presupuestos = límites duros (aplicados en tests) — 3 pts
- Capacidades de plugin declaradas mínimamente (sin `network` / `filesystem` sobre-alcanzado) — 3 pts
- Headers CSP + HSTS + COOP + CORP enviados — 2 pts
- `pnpm audit --audit-level=high` limpio — 1 pt

### Paso 6: Auditoría de Extensiones (15 puntos)

Específico de Paperclip. Alcanza tanto adaptadores built-in (`packages/adapters/*`) como plugins (`@paperclipai/plugin-sdk`).

Adaptadores built-in:
- Cada adaptador exporta `type`, `label`, `models`, `agentConfigurationDoc` — 3 pts
- `type` es estable a través de versiones (sin renombrar después de que agentes enviados) — 2 pts
- Registro de servidor vía `registerServerAdapter(...)` — 2 pts
- Sin lógica de gobernanza dentro del adaptador (sin matemática de presupuesto / aprobación / permiso) — 3 pts

Plugins:
- Manifiesto declara capacidades mínimas necesarias — 2 pts
- Usa `ctx.secrets.resolve(ref)` en lugar de keys raw — 2 pts
- Estado persistido vía `ctx.state` (con scope), no disco — 1 pt

### Paso 7: Reporte Consolidado

Producir:

```
════════════════════════════════════════════════════════════════
📊 AUDITORÍA DE CUMPLIMIENTO PAPERCLIP — {PROYECTO}
════════════════════════════════════════════════════════════════

Arquitectura        : {NN}/25
Calidad de Código   : {NN}/20
Testing             : {NN}/20
Seguridad           : {NN}/20
Protocolo Adaptador : {NN}/15
────────────────────────────────────────────────────────────────
TOTAL               : {NNN}/100   →   {Calificación}

Escala de calificación: A (≥ 90), B (≥ 80), C (≥ 70), D (≥ 60), F (< 60)
```

Para cada criterio fallido, listar el archivo / símbolo y un fix de 1 línea. No reescribir el código — exponer los problemas. Terminar con las **5 prioridades de remediación principales** (mayor impacto / menor esfuerzo primero).

## Entregable

Un único reporte markdown. Sin fallos silenciosos. Si un paso no puede ejecutarse (ej. sin adaptadores en el proyecto), registrar "N/A" y redistribuir puntos proporcionalmente — notar esto explícitamente en el tope del reporte.
