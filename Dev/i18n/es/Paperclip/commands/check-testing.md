---
description: Auditar Cobertura y Calidad de Tests de Paperclip
argument-hint: [ruta-proyecto]
---

# Auditar Testing de Paperclip

## MISIÓN

Verificar cobertura de tests, tests de contrato de adaptador, forma de tests de integración e higiene de tests.

## Procedimiento

### 1. Baseline

- [ ] Vitest configurado en raíz del workspace
- [ ] Umbrales de cobertura ≥ 80 (líneas, funciones, statements), ≥ 75 (branches)
- [ ] `pnpm test --coverage` completa y respeta los umbrales

### 2. Cobertura por área

Ejecutar cobertura, luego reportar por área:
- `server/src/modules/agents/` : objetivo ≥ 90%
- `server/src/modules/approvals/` : objetivo ≥ 90%
- `server/src/modules/costs/` : objetivo ≥ 90%
- `adapters/**` : objetivo ≥ 85%
- Otros módulos del servidor: ≥ 80%
- `ui/` : ≥ 70%

Listar cualquier archivo debajo de su objetivo con una nota de 1 línea sobre qué no está cubierto.

### 3. Tests de extensiones

Adaptadores built-in (`packages/adapters/*`):
- [ ] Tests unitarios cubren spawn / parse / cableado env
- [ ] `type`, `label`, `models`, `agentConfigurationDoc` están cubiertos por un test de exports
- [ ] Existen tests E2E para al menos el adaptador predeterminado

Plugins:
- [ ] Tests usan `createTestHarness` de `@paperclipai/plugin-sdk/testing`
- [ ] Happy path + un path de fallo por handler

### 4. Tests de integración

- [ ] Al menos un test de integración por módulo del servidor
- [ ] Tests de integración conectan a un PostgreSQL **real** (testcontainers o DB descartable), no un mock
- [ ] Cada test es dueño de sus datos (transacciones + rollback, o truncate entre tests)
- [ ] Existe un test de **aislamiento cross-tenant** por módulo (probar que un usuario de compañía A no puede leer datos de compañía B)

### 5. E2E

- [ ] Suite Playwright cubre: login de operador, contratar un agente, flujo de aprobación, dashboard de costos, registro de adaptador
- [ ] E2E corre contra un bundle web construido, no el servidor dev

### 6. Higiene

Grep para y fallar en:
- `.only(` en cualquier archivo de test en `main`
- `.skip(` en cualquier archivo de test en `main` (sin issue vinculado)
- `setTimeout` en tests sin `vi.useFakeTimers()`
- Fixtures mutables compartidas entre tests
- Archivos snapshot (`__snapshots__`) más viejos que 180 días sin nota

### 7. Regresiones de bug-fix

Tomar los últimos 5 commits `fix:`. Para cada uno, verificar que se agregó o modificó un test correspondiente. Reportar commits que no lo hicieron.

## Output

Reporte Markdown con pasa/falla por sección, archivos sin cubrir, adaptadores que fallan, y un puntaje /20 para `/paperclip:check-compliance`.
