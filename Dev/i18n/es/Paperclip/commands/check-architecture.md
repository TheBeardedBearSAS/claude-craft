---
description: Auditar Arquitectura Paperclip
argument-hint: [ruta-proyecto]
---

# Auditar Arquitectura Paperclip

## MISIÓN

Validar la arquitectura de dos capas (control plane + adaptadores) y los límites de módulos de un proyecto Paperclip.

## Procedimiento

### 1. Forma del workspace

- [ ] Directorios `server/`, `ui/`, `cli/`, `packages/` presentes
- [ ] `packages/` contiene `shared/`, `db/`, `adapter-utils/`, `mcp-server/`, `adapters/`, `plugins/`
- [ ] `pnpm-workspace.yaml` lista los workspaces
- [ ] `package.json` raíz declara `"packageManager": "pnpm@9.15.x"`
- [ ] `pnpm run preflight:workspace-links` pasa
- [ ] No queda configuración legacy de Lerna / npm workspaces

### 2. Módulos del control plane

Bajo `server/src/modules/` esperar una carpeta por dominio (agents, approvals, costs, companies, goals, activity, secrets). Para cada módulo:

- [ ] `routes.ts` — Solo HTTP, llama servicios, sin acceso DB
- [ ] `service.ts` — lógica de negocio, emite eventos de actividad
- [ ] `repository.ts` — consultas parametrizadas, sin reglas de negocio
- [ ] `types.ts` — reexportado vía `shared/`
- [ ] `*.test.ts` colocados
- [ ] Sin imports cruzando a internos de otro módulo (solo vía su API de servicio)

Señalar: cualquier ruta que lea la DB directamente, cualquier servicio que construya strings SQL, cualquier import cross-module evadiendo la capa de servicio.

### 3. Adaptadores (built-in, `packages/adapters/*`)

- [ ] Cada adaptador vive bajo `packages/adapters/<name>/` y se nombra `@paperclipai/adapter-<name>`
- [ ] `src/index.ts` exporta `type`, `label`, `models`, `agentConfigurationDoc`
- [ ] Subpaths opcionales (`./server`, `./ui`, `./cli`) están presentes solo cuando implementados
- [ ] **Sin lógica de gobernanza** dentro del adaptador — el servidor es dueño de presupuestos / aprobaciones / permisos
- [ ] Bootstrap del servidor lo registra vía `registerServerAdapter(...)`

### 3b. Plugins (`@paperclipai/plugin-sdk`)

- [ ] Scaffoldeado vía `create-paperclip-plugin` (o estructuralmente equivalente)
- [ ] `definePlugin({ setup, onHealth })` en la entrada del worker
- [ ] Manifiesto declara solo capacidades necesarias
- [ ] Sin secretos leídos desde disco; siempre vía `ctx.secrets.resolve(ref)`

### 4. Tipos compartidos

- [ ] `shared/types/` contiene solo declaraciones de tipo `.ts`
- [ ] Sin código de runtime (sin funciones, sin clases)
- [ ] Sin imports de framework (React, Express, etc.)

### 5. Web UI

- [ ] Cliente API de `ui/src/` consume tipos del servidor vía `@paperclipai/shared` — sin `fetch` hecho a mano con respuestas sin tipo
- [ ] Sin decisiones de gobernanza en componentes (sin "if budget > X then hide button" — el servidor decide, la UI renderiza)

### 6. Cobertura del log de actividad

Grep para cada mutación DB (`INSERT`, `UPDATE`, `DELETE` no en migrations/seeds). Cada una debe estar adyacente a una emisión de evento de actividad. Reportar mutaciones sin un `activity.emit(...)` coincidente.

### 7. Especificación OpenAPI

- [ ] `server/src/api/openapi.yaml` (o generado) está commiteado
- [ ] Cada ruta tiene una operación coincidente
- [ ] Cliente web generado está actualizado (`pnpm generate:api` produce sin diff)

## Output

Reporte Markdown con:
- Pasa/falla por checkbox arriba
- Paths de archivo ofensores (números de línea cuando esté disponible)
- Severidad: Blocker / Major / Minor
- Puntaje /25 para uso por `/paperclip:check-compliance`
