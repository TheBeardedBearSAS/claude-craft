# Checklist Nueva Funcionalidad — Paperclip

Una funcionalidad en Paperclip típicamente toca uno o más **módulos** (`server/src/modules/*`) y a veces un **adaptador**. Usa esta checklist end-to-end.

## 0. Análisis (antes de escribir código)

- [ ] Identificar el/los dominio(s) afectado(s) (agents / approvals / costs / …)
- [ ] Determinar si se impacta gobernanza (presupuestos, aprobaciones, log de actividad)
- [ ] Listar la migración de datos, si existe
- [ ] Verificar implicaciones cross-tenant
- [ ] Escribir una nota de diseño de 5 líneas: qué cambia, por qué, qué archivos

## 1. Schema (si aplica)

- [ ] Archivo de migración bajo `server/src/db/migrations/` (forward + down)
- [ ] Nuevas columnas nullable O backfilled en la misma migración
- [ ] Indexes en cualquier columna usada en cláusulas WHERE
- [ ] Tabla de log de actividad sin tocar (es solo-agregar)
- [ ] `pnpm db:migrate` tiene éxito localmente

## 2. Tipos (`shared/types`)

- [ ] Nuevos tipos de dominio agregados en `shared/types/<domain>.ts`
- [ ] Sin código de runtime en `shared/types/`
- [ ] Uniones discriminadas usadas para tipos variantes
- [ ] Path de re-export actualizado si es necesario

## 3. Servicio (`server/src/modules/<domain>/service.ts`)

- [ ] Lógica de negocio vive aquí
- [ ] Retorna resultados tipados o lanza `DomainError`
- [ ] Emite un evento de actividad en cada mutación
- [ ] Aplica compuertas de presupuesto / aprobación donde sea relevante
- [ ] Tenencia: deriva `companyId` desde sesión, filtra en consecuencia
- [ ] Tests unitarios con repositorio mockeado

## 4. Repositorio (`server/src/modules/<domain>/repository.ts`)

- [ ] Solo consultas parametrizadas
- [ ] Sin lógica de negocio
- [ ] Tests de integración contra un Postgres real

## 5. Rutas (`server/src/modules/<domain>/routes.ts`)

- [ ] Una ruta por operación
- [ ] Input validado vía zod (o equivalente)
- [ ] Respuestas tipadas; errores mapeados a códigos `DomainError`
- [ ] Sin acceso DB directo
- [ ] Especificación OpenAPI actualizada

## 6. Web UI (si aplica)

- [ ] Cliente API regenerado desde OpenAPI (`pnpm generate:api`)
- [ ] Nueva UI bajo `ui/src/` (seguir la convención de routing existente)
- [ ] Flags de gobernanza vienen del servidor, no computados en cliente
- [ ] Estados de loading y error manejados
- [ ] Accesibilidad: paths de teclado + lector de pantalla verificados

## 7. Superficie de extensión (si la funcionalidad requiere cambios)

### Adaptador built-in (runtime de IA)

- [ ] `packages/adapters/<name>/src/index.ts` — `type` / `label` / `models` / `agentConfigurationDoc` todavía precisos
- [ ] Entrada de registro del lado del servidor actualizada (`registerServerAdapter`)
- [ ] Configs de agente existentes todavía validan (sin renombrado de campo breaking)

### Plugin (funcionalidad)

- [ ] Capacidades del manifiesto permanecen mínimas (agregar solo lo que esta funcionalidad requiere)
- [ ] Cableado de `definePlugin({ setup })` para nuevos eventos / jobs / proveedores de datos
- [ ] Schema de config (zod) actualizado con descripciones claras
- [ ] Test harness de plugin desde `@paperclipai/plugin-sdk/testing` todavía pasa

## 8. Tests

- [ ] Unit: lógica de servicio + paths de error
- [ ] Integración: rutas de módulo + DB con Postgres real
- [ ] Aislamiento cross-tenant: usuario A de compañía X no puede tocar datos de compañía Y
- [ ] Aplicación de presupuesto: intento sobre-límite retorna `BUDGET_EXCEEDED`
- [ ] Compuerta de aprobación: acción se bloquea hasta aprobada o timeout
- [ ] Contrato de adaptador: re-ejecutar la suite compartida
- [ ] Umbrales de cobertura todavía verdes (≥ 80 global, ≥ 90 para agents/approvals/costs)

## 9. Documentación

- [ ] Entrada CHANGELOG bajo `## Unreleased`
- [ ] Especificación OpenAPI commiteada
- [ ] README de adaptador actualizado si las acciones soportadas cambiaron
- [ ] Runbook actualizado si la funcionalidad impacta respuesta a incidentes (kill switch, revocación, export)

## 10. Revisión

- [ ] Auto-revisión: `git diff main...HEAD`
- [ ] Ejecutar `/paperclip:check-compliance` localmente
- [ ] Descripción de PR: qué, por qué, plan de migración, plan de rollback
- [ ] Tests de contrato de adaptador en verde para cada adaptador tocado

## 11. Rollout

- [ ] Plan de deploy: migrar hacia adelante, deployar código, verificar salud
- [ ] Kill switch todavía funcional después del deploy
- [ ] Log de actividad visiblemente captura los eventos de la nueva funcionalidad
