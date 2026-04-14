---
description: Scaffold uma extensao Paperclip (plugin via create-paperclip-plugin, ou adapter built-in)
argument-hint: [name] [kind]
---

# Gerar uma Extensao Paperclip

## Argumentos

1. `name` (obrigatorio) — nome kebab-case (ex. `linear-sync`, `custom-claude`)
2. `kind` (obrigatorio) — um de `plugin` | `adapter`

## Qual usar?

| Necessidade | Use |
|---|---|
| Adicionar features, integracoes, jobs, UI slots, ou novo widget dashboard | **plugin** |
| Adicionar uma nova opcao **runtime AI** (novo agente CLI, novo runtime remoto) | **adapter** |

Se em duvida: comece com um plugin.

---

## `kind = plugin` (recomendado)

Paperclip envia um scaffolder first-party.

```bash
# Em um diretorio vazio (ou raiz monorepo)
npm create paperclip-plugin@latest
# ou
pnpm create paperclip-plugin
```

Siga os prompts. Output:

```
<plugin-name>/
├── package.json
├── tsconfig.json
├── src/
│   ├── worker.ts          # definePlugin({ setup(ctx) }) + runWorker
│   ├── manifest.ts        # PaperclipPluginManifestV1
│   └── ui/                # opcional — pecas React para UI slots
├── tests/
│   └── worker.test.ts     # createTestHarness de @paperclipai/plugin-sdk/testing
└── README.md
```

Worker minimo:

```ts
import { definePlugin, runWorker, z } from "@paperclipai/plugin-sdk";

const configSchema = z.object({
  apiKey: z.string().describe("Referencia chave API (ctx.secrets)"),
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

### Essenciais do Manifesto

Declare **apenas** as capacidades que voce precisa:

```ts
import type { PaperclipPluginManifestV1 } from "@paperclipai/plugin-sdk";

export const manifest: PaperclipPluginManifestV1 = {
  apiVersion: 1,
  id: "acme-linear-sync",
  name: "Acme Linear Sync",
  version: "0.1.0",
  categories: ["integration"],
  capabilities: ["network.http", "events.subscribe"],  // escopo estreito!
  instanceConfigSchema: { /* JSON Schema de zod */ },
  jobs: [{ key: "full-sync", title: "Full sync" }],
  // webhooks, launchers, ui slots, tools — adicione apenas o que voce envia
};
```

### Testes

```ts
import { describe, it, expect } from "vitest";
import { createTestHarness } from "@paperclipai/plugin-sdk/testing";
import plugin from "../src/worker";

describe("hello plugin", () => {
  it("loga em startup", async () => {
    const harness = createTestHarness(plugin, { config: { apiKey: "secret-ref" } });
    await harness.setup();
    expect(harness.logs.some((l) => l.msg.includes("iniciando"))).toBe(true);
  });
});
```

### Instalar e habilitar em uma instancia Paperclip

```bash
paperclipai plugin install ./<plugin-name>
paperclipai plugin list
paperclipai plugin enable <pluginKey>
paperclipai plugin inspect <pluginKey>
```

---

## `kind = adapter` (avancado)

Adapters built-in vivem no monorepo Paperclip sob `packages/adapters/<name>/`. Criar um significa contribuir para o projeto Paperclip (ou um fork).

Copie um adapter existente (ex. `packages/adapters/pi-local/`) e adapte-o. O shape:

```
packages/adapters/<name>/
├── package.json               # @paperclipai/adapter-<name>
├── src/
│   ├── index.ts               # exports: type, label, models, agentConfigurationDoc
│   ├── server/index.ts        # lifecycle processo, logica spawn
│   ├── ui/index.ts            # contribuicoes UI opcionais
│   └── cli/index.ts           # subcomandos CLI opcionais
└── CHANGELOG.md
```

`src/index.ts` minimo:

```ts
export const type = "<name>_local";
export const label = "<Nome humano> (local)";
export const models = [
  { id: "<model-id>", label: "<Nome exibicao>" },
];
export const agentConfigurationDoc = `# ${type} agent configuration
Adapter: ${type}
Core fields: cwd, model, command, extraArgs, env, workspaceStrategy, timeoutSec, graceSec
`;
```

Registre o adapter server-side em boot:

```ts
// server/src/adapters/index.ts
import * as myAdapter from "@paperclipai/adapter-<name>/server";
registerServerAdapter(myAdapter);
```

Adapters **nao** computam orcamentos ou aprovacoes. Governanca e trabalho do server — o adapter apenas spawna e supervisiona o processo agente.

---

## Fazer / Nao Fazer

| Fazer | Nao Fazer |
|---|---|
| Declare o conjunto de capacidade minimo | Solicitar `network` amplamente |
| Resolver secrets com `ctx.secrets.resolve(ref)` | Passar chaves raw em codigo plugin |
| Usar `ctx.state` para persistencia por escopo | Escrever arquivos em disco |
| Registrar handlers sincronamente em `setup()` | Fazer trabalho async dentro de path retorno `setup()` |
| Manter versao manifest em sincronia com `package.json` | Enviar versoes desencontradas |

## Checklist pos-scaffold

- [ ] `pnpm install` sucesso
- [ ] `pnpm typecheck` + `pnpm test` verde
- [ ] Manifesto declara apenas as capacidades requeridas
- [ ] README cobre: proposito, config, secrets/capacidades requeridos, eventos tratados
- [ ] Para adapters: `type` e estavel, `models` verdadeiro, `agentConfigurationDoc` corresponde campos reais
