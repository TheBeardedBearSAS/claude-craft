# Adaptadores y Plugins — Paperclip

> **Fuentes autoritativas:**
> - Paquete `@paperclipai/plugin-sdk` (v1.0.0) — exports en `packages/plugins/sdk/`
> - Paquetes de adaptadores en `packages/adapters/*` — ej. `@paperclipai/adapter-claude-local`
> - Docs: https://docs.paperclip.ing/
>
> **Observado en el repositorio** https://github.com/paperclipai/paperclip **(v2026.529.0).** Las APIs evolucionan — en caso de duda, abrir el `.d.ts` del paquete y la documentación oficial.

Paperclip expone **dos puntos de extensión**. No los mezcles.

| | **Adapters** | **Plugins** |
|---|---|---|
| Propósito | Elegir qué runtime de IA potencia un agente (Claude Code, Codex, Gemini, Cursor, OpenCode, …) | Agregar funcionalidades: integraciones, dashboards, trabajos, slots de UI |
| Distribuido en | `packages/adapters/<name>/` | Paquetes externos o `packages/plugins/examples/*` |
| SDK | ninguno requerido para built-ins; puede usar `@paperclipai/adapter-utils` | `@paperclipai/plugin-sdk` |
| Forma de entrada | `export const type, label, models, agentConfigurationDoc` + subpaths `./server`, `./ui`, `./cli` | `definePlugin({ setup(ctx) })` + `runWorker(...)` |
| Transporte | In-process + procesos hijos spawneados por ejecución | JSON-RPC 2.0 sobre stdio entre host y worker |
| Scaffoldeado vía | Copiar un adaptador existente (`claude-local`, `pi-local`) como template | `npm create paperclip-plugin@latest` |

---

## 1. Adaptadores Built-in

Los adaptadores se descubren por tipo. Un paquete de adaptador mínimo expone:

```ts
// packages/adapters/<name>/src/index.ts
export const type = "<name>_local";        // identificador estable usado en configs de agente
export const label = "Nombre legible para humanos";
export const models = [
  { id: "model-id", label: "Nombre de visualización del modelo" },
  // ...
];

export const agentConfigurationDoc = `# Configuración de agente <name>_local

Adaptador: <name>_local

Campos principales:
- cwd (string, opcional): directorio de trabajo predeterminado
- model (string, opcional): id del modelo
- command (string, opcional): nombre del binario CLI
- extraArgs (string[], opcional): args CLI adicionales
- env (object, opcional): sobrescrituras de env KEY=VALUE
- workspaceStrategy (object, opcional): { type: "git_worktree", ... }

Campos operacionales:
- timeoutSec (number, opcional): timeout de ejecución
- graceSec (number, opcional): período de gracia SIGTERM
`;
```

Exports de subpath opcionales:

```
packages/adapters/<name>/src/
├── index.ts          # compartido (type, label, models, doc)
├── server/index.ts   # hooks del lado del servidor (spawning, ciclo de vida del proceso)
├── ui/index.ts       # componentes UI contribuidos al dashboard
└── cli/index.ts      # subcomandos CLI contribuidos a `paperclipai`
```

Registrado vía un registro mutable del lado del servidor:

```ts
// server/src/adapters/registry.ts
registerServerAdapter(adapter);     // agregar
unregisterServerAdapter(type);      // eliminar
requireServerAdapter(type);         // búsqueda (lanza error si está ausente)
```

### Reglas

- El `type` es el identificador wire estable; nunca lo renombres después de que los agentes comiencen a usarlo.
- Los agentes referencian el adaptador en su config: `{ "adapterType": "<name>_local", ... }`.
- La lista `models` impulsa el selector de UI. Mantenla sincronizada con lo que el runtime soporta.
- `agentConfigurationDoc` es la referencia orientada a humanos para todos los campos. Mantenla veraz y breve.
- **No agregues lógica de gobernanza aquí.** Presupuestos, aprobaciones, actividad: estos son aplicados por la plataforma, no por el adaptador.
- Los adaptadores pueden inyectar variables de entorno bien conocidas en el proceso del agente (Paperclip inyecta `PAPERCLIP_WORKSPACE_*` y `PAPERCLIP_RUNTIME_*` para herramientas del lado del agente).

---

## 2. Plugins (`@paperclipai/plugin-sdk`)

Los plugins agregan **funcionalidades** — integraciones, trabajos de sincronización, dashboards, lanzadores, herramientas. Se ejecutan como procesos worker que hablan con el host sobre JSON-RPC 2.0 en stdio.

### Scaffolding

```bash
npm create paperclip-plugin@latest
# o
pnpm create paperclip-plugin
```

### Entrada

```ts
// src/worker.ts
import { definePlugin, runWorker, z } from "@paperclipai/plugin-sdk";

const configSchema = z.object({
  apiKey: z.string().describe("Tu API key"),
  workspace: z.string().optional(),
});

const plugin = definePlugin({
  async setup(ctx) {
    ctx.logger.info("Plugin iniciando");

    ctx.events.on("issue.created", async (event) => {
      const config = await ctx.config.get();
      await ctx.http.fetch("https://api.example.com/webhook", {
        method: "POST",
        headers: { Authorization: `Bearer ${await ctx.secrets.resolve(config.apiKeyRef as string)}` },
        body: JSON.stringify({ issueId: event.entityId }),
      });
    });

    ctx.jobs.register("full-sync", async (job) => {
      ctx.logger.info("Sincronización completa", { runId: job.runId });
      // ...
    });

    ctx.data.register("sync-health", async ({ companyId }) => {
      const last = await ctx.state.get({
        scopeKind: "company",
        scopeId: String(companyId),
        stateKey: "last-sync-at",
      });
      return { lastSync: last };
    });
  },

  async onHealth() {
    return { status: "ok" };
  },
});

export default plugin;
runWorker(plugin, import.meta.url);
```

### Superficie de PluginContext (destacados)

| Cliente | Usar para |
|---|---|
| `ctx.logger` | Logs estructurados |
| `ctx.config` | Config de instancia resuelta (validada por Zod) |
| `ctx.events` | Suscribirse a eventos de plataforma (`issue.created`, `agent.hired`, …) |
| `ctx.jobs` | Registrar trabajos en segundo plano de larga duración |
| `ctx.launchers` | Registrar entradas UI de lanzador |
| `ctx.http` | Cliente HTTP controlado por host (respeta allowlist / capacidades) |
| `ctx.secrets` | Resolver referencias de secretos; nunca ver valores raw a menos que la ref sea propiedad de este plugin |
| `ctx.activity` | Emitir entradas de log de actividad (`PluginActivityLogEntry`) |
| `ctx.state` | Almacén de estado con scope (scope: company, project, issue, …) |
| `ctx.entities`, `ctx.projects`, `ctx.companies`, `ctx.issues`, `ctx.agents`, `ctx.goals` | Lecturas de dominio tipadas |
| `ctx.agentSessions` | Conducir una sesión de agente programáticamente |
| `ctx.data`, `ctx.actions`, `ctx.streams`, `ctx.tools` | Registrar superficies de proveedor |
| `ctx.metrics`, `ctx.telemetry` | Métricas y telemetría |

### Manifiesto

Un plugin envía un `PaperclipPluginManifestV1` describiendo trabajos, webhooks, herramientas, slots de UI, lanzadores, capacidades. Los tipos se reexportan desde `@paperclipai/plugin-sdk`:

```ts
import type { PaperclipPluginManifestV1 } from "@paperclipai/plugin-sdk";
```

Declara solo las capacidades que realmente necesitas — el host las aplica (`CapabilityDeniedError` de lo contrario).

### Testing

```ts
import { createTestHarness } from "@paperclipai/plugin-sdk/testing";

const harness = createTestHarness(plugin, { /* opciones */ });
await harness.emit({ type: "issue.created", /* ... */ });
// assert en harness.logs, harness.jobs, llamadas ctx
```

### Reglas de Oro

- **Declara capacidades honestamente.** Capacidad faltante → `CapabilityDeniedError`.
- **Nunca almacenes secretos.** Siempre pasa por `ctx.secrets.resolve(ref)`.
- **Nunca persistas datos del host.** Usa `ctx.state` con el scope correcto.
- **Un plugin = una responsabilidad.** Un plugin de sincronización Linear hace Linear; no gestiona también GitHub.
- **Respeta límites de tasa** al usar `ctx.http`.
- **Registra eventos, no strings**: `ctx.logger.info("issue sincronizado", { issueId, durationMs })`.

---

## 3. Gobernanza: dónde vive realmente

Ni los adaptadores ni los plugins son dueños de la gobernanza. La **plataforma** (servidor) aplica:

- **Presupuestos** — límites de tokens y dólares. Aplicados en tiempo de ejecución del agente en el servidor.
- **Aprobaciones** — compuertas en acciones sensibles. Decididas por operadores en la UI; adaptadores/plugins son notificados vía eventos.
- **Log de actividad** — solo-agregar. Los adaptadores contribuyen actividad indirectamente; los plugins pueden emitir entradas vía `ctx.activity`.
- **Secretos** — cifrados en reposo. Accedidos a través de `ctx.secrets.resolve(ref)`; valores raw nunca se envían al plugin.
- **Tenencia** — cada recurso tiene scope por `companyId` del lado del servidor.

El autor del adaptador/plugin **NO DEBE** intentar aplicar estos localmente. Nunca cachees decisiones de aprobación. Nunca decidas presupuestos. Nunca computes permisos localmente.

---

## Anti-Patrones

- Un plugin que lee secretos por path de disco.
- Un adaptador que reescribe la config del agente para evadir la validación de plataforma.
- Código de plugin que mantiene estado mutable global entre trabajos — usa `ctx.state`.
- Plugins que abren conexiones salientes arbitrarias sin declarar la capacidad.
- Métodos JSON-RPC ad-hoc en el lado del plugin — apégate al protocolo expuesto por el SDK.

---

## Checklist — Nuevo Adaptador Built-in

- [ ] Paquete bajo `packages/adapters/<name>/` nombrado `@paperclipai/adapter-<name>`
- [ ] `src/index.ts` exporta `type`, `label`, `models`, `agentConfigurationDoc`
- [ ] Subpaths `./server`, `./ui`, `./cli` exportados cuando se necesita
- [ ] `registerServerAdapter(adapter)` cableado al arranque del servidor
- [ ] `agentConfigurationDoc` es preciso y mínimo
- [ ] Tests unitarios para la lógica de spawn / parse / env

## Checklist — Nuevo Plugin

- [ ] Scaffoldeado con `npm create paperclip-plugin@latest`
- [ ] Manifiesto declara jobs / webhooks / tools / launchers
- [ ] Solo las capacidades que necesitas están declaradas
- [ ] `setup(ctx)` registra handlers, suscribe eventos, retorna sincrónicamente
- [ ] Config validada con `z.object(...)`
- [ ] `onHealth()` implementado
- [ ] Test harness de `@paperclipai/plugin-sdk/testing` cubre el happy path + paths de fallo
- [ ] README describe: propósito, configuración, capacidades requeridas, eventos a los que reacciona, trabajos que registra

---

**Última actualización:** 2026-04 | **Versión:** 2.0.0 | **Autor:** The Bearded CTO
