---
description: Scaffoldear una extensión Paperclip (plugin vía create-paperclip-plugin, o adaptador built-in)
argument-hint: [nombre] [tipo]
---

# Generar una Extensión Paperclip

## Argumentos

1. `name` (requerido) — nombre en kebab-case (ej. `linear-sync`, `custom-claude`)
2. `kind` (requerido) — uno de `plugin` | `adapter`

## ¿Cuál usar?

| Necesidad | Usar |
|---|---|
| Agregar funcionalidades, integraciones, trabajos, slots de UI, o un nuevo widget de dashboard | **plugin** |
| Agregar una nueva opción de **runtime de IA** (nuevo agente CLI, nuevo runtime remoto) | **adapter** |

Si tienes duda: comienza con un plugin.

---

## `kind = plugin` (recomendado)

Paperclip envía un scaffolder de primera parte.

```bash
# En un directorio vacío (o raíz de monorepo)
npm create paperclip-plugin@latest
# o
pnpm create paperclip-plugin
```

Sigue los prompts. Output:

```
<plugin-name>/
├── package.json
├── tsconfig.json
├── src/
│   ├── worker.ts          # definePlugin({ setup(ctx) }) + runWorker
│   ├── manifest.ts        # PaperclipPluginManifestV1
│   └── ui/                # opcional — piezas React para slots de UI
├── tests/
│   └── worker.test.ts     # createTestHarness de @paperclipai/plugin-sdk/testing
└── README.md
```

Worker mínimo:

```ts
import { definePlugin, runWorker, z } from "@paperclipai/plugin-sdk";

const configSchema = z.object({
  apiKey: z.string().describe("Referencia de API key (ctx.secrets)"),
});

const plugin = definePlugin({
  async setup(ctx) {
    ctx.logger.info(`${ctx.manifest.name} iniciando`);

    ctx.events.on("issue.created", async (event) => {
      ctx.logger.info("issue.created", { entityId: event.entityId });
      // ...
    });

    ctx.jobs.register("hello", async (job) => {
      ctx.logger.info("hello job", { runId: job.runId });
    });
  },
  async onHealth() {
    return { status: "ok" };
  },
});

export default plugin;
runWorker(plugin, import.meta.url);
```

### Esenciales del manifiesto

Declara **solo** las capacidades que necesitas:

```ts
import type { PaperclipPluginManifestV1 } from "@paperclipai/plugin-sdk";

export const manifest: PaperclipPluginManifestV1 = {
  apiVersion: 1,
  id: "acme-linear-sync",
  name: "Acme Linear Sync",
  version: "0.1.0",
  categories: ["integration"],
  capabilities: ["network.http", "events.subscribe"],  // ¡scope estrecho!
  instanceConfigSchema: { /* JSON Schema desde zod */ },
  jobs: [{ key: "full-sync", title: "Sincronización completa" }],
  // webhooks, launchers, ui slots, tools — agregar solo lo que envías
};
```

### Tests

```ts
import { describe, it, expect } from "vitest";
import { createTestHarness } from "@paperclipai/plugin-sdk/testing";
import plugin from "../src/worker";

describe("hello plugin", () => {
  it("registra al arranque", async () => {
    const harness = createTestHarness(plugin, { config: { apiKey: "secret-ref" } });
    await harness.setup();
    expect(harness.logs.some((l) => l.msg.includes("iniciando"))).toBe(true);
  });
});
```

### Instalar y habilitar en una instancia Paperclip

```bash
paperclipai plugin install ./<plugin-name>
paperclipai plugin list
paperclipai plugin enable <pluginKey>
paperclipai plugin inspect <pluginKey>
```

---

## `kind = adapter` (avanzado)

Los adaptadores built-in viven en el monorepo de Paperclip bajo `packages/adapters/<name>/`. Crear uno significa contribuir al proyecto Paperclip (o un fork).

Copia un adaptador existente (ej. `packages/adapters/pi-local/`) y adáptalo. La forma:

```
packages/adapters/<name>/
├── package.json               # @paperclipai/adapter-<name>
├── src/
│   ├── index.ts               # exports: type, label, models, agentConfigurationDoc
│   ├── server/index.ts        # ciclo de vida del proceso, lógica de spawn
│   ├── ui/index.ts            # contribuciones UI opcionales
│   └── cli/index.ts           # subcomandos CLI opcionales
└── CHANGELOG.md
```

`src/index.ts` mínimo:

```ts
export const type = "<name>_local";
export const label = "<Nombre humano> (local)";
export const models = [
  { id: "<model-id>", label: "<Nombre de visualización>" },
];
export const agentConfigurationDoc = `# Configuración de agente ${type}
Adaptador: ${type}
Campos principales: cwd, model, command, extraArgs, env, workspaceStrategy, timeoutSec, graceSec
`;
```

Registra el adaptador del lado del servidor al arranque:

```ts
// server/src/adapters/index.ts
import * as myAdapter from "@paperclipai/adapter-<name>/server";
registerServerAdapter(myAdapter);
```

Los adaptadores **no** computan presupuestos o aprobaciones. La gobernanza es trabajo del servidor — el adaptador solo spawnea y supervisa el proceso del agente.

---

## Hacer / No hacer

| Hacer | No hacer |
|---|---|
| Declarar el conjunto mínimo de capacidades | Solicitar `network` ampliamente |
| Resolver secretos con `ctx.secrets.resolve(ref)` | Pasar keys raw al código del plugin |
| Usar `ctx.state` para persistencia por scope | Escribir archivos a disco |
| Registrar handlers sincrónicamente en `setup()` | Hacer trabajo async dentro del path de return de `setup()` |
| Mantener versión del manifiesto sincronizada con `package.json` | Enviar versiones desajustadas |

## Checklist post-scaffold

- [ ] `pnpm install` tiene éxito
- [ ] `pnpm typecheck` + `pnpm test` en verde
- [ ] Manifiesto declara solo las capacidades requeridas
- [ ] README cubre: propósito, config, secretos/capacidades requeridas, eventos manejados
- [ ] Para adaptadores: `type` es estable, `models` veraz, `agentConfigurationDoc` coincide con campos reales
