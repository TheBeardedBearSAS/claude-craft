# Adapters e Plugins — Paperclip

> **Fontes autoritativas:**
> - pacote `@paperclipai/plugin-sdk` (v1.0.0) — exports em `packages/plugins/sdk/`
> - Pacotes adapter em `packages/adapters/*` — ex. `@paperclipai/adapter-claude-local`
> - Docs: https://docs.paperclip.ing/
>
> **Observado no repo em** https://github.com/paperclipai/paperclip **(v2026.609.0).** APIs evoluem — quando em duvida, abra o `.d.ts` do pacote e os docs oficiais.

Paperclip expoe **dois pontos de extensao**. Nao os misture.

| | **Adapters** | **Plugins** |
|---|---|---|
| Proposito | Escolher qual runtime AI alimenta um agente (Claude Code, Codex, Gemini, Cursor, OpenCode, …) | Adicionar features: integracoes, dashboards, jobs, UI slots |
| Enviado em | `packages/adapters/<name>/` | Pacotes externos ou `packages/plugins/examples/*` |
| SDK | nenhum requerido para built-ins; pode usar `@paperclipai/adapter-utils` | `@paperclipai/plugin-sdk` |
| Forma de entrada | `export const type, label, models, agentConfigurationDoc` + subpaths `./server`, `./ui`, `./cli` | `definePlugin({ setup(ctx) })` + `runWorker(...)` |
| Transporte | In-process + processos filhos spawned por run | JSON-RPC 2.0 sobre stdio entre host e worker |
| Scaffolded via | Copie um adapter existente (`claude-local`, `pi-local`) como template | `npm create paperclip-plugin@latest` |

---

## 1. Adapters Integrados

Adapters sao descobertos por tipo. Um pacote adapter minimo expoe:

```ts
// packages/adapters/<name>/src/index.ts
export const type = "<name>_local";        // identificador estavel usado em configs de agente
export const label = "Nome legivel humano";
export const models = [
  { id: "model-id", label: "Nome exibicao modelo" },
  // ...
];

export const agentConfigurationDoc = `# <name>_local agent configuration

Adapter: <name>_local

Core fields:
- cwd (string, optional): diretorio de trabalho padrao
- model (string, optional): model id
- command (string, optional): nome binario CLI
- extraArgs (string[], optional): args CLI extras
- env (object, optional): overrides env KEY=VALUE
- workspaceStrategy (object, optional): { type: "git_worktree", ... }

Operational fields:
- timeoutSec (number, optional): timeout de run
- graceSec (number, optional): periodo de graca SIGTERM
`;
```

Exports subpath opcionais:

```
packages/adapters/<name>/src/
├── index.ts          # shared (type, label, models, doc)
├── server/index.ts   # hooks server-side (spawning, lifecycle processo)
├── ui/index.ts       # componentes UI contribuidos para o dashboard
└── cli/index.ts      # subcomandos CLI contribuidos para `paperclipai`
```

Registrado via registro server-side mutavel:

```ts
// server/src/adapters/registry.ts
registerServerAdapter(adapter);     // add
unregisterServerAdapter(type);      // remove
requireServerAdapter(type);         // lookup (throws se ausente)
```

### Regras

- O `type` e o identificador wire estavel; nunca o renomeie depois que agentes comecarem a usa-lo.
- Agentes referenciam o adapter em seu config: `{ "adapterType": "<name>_local", ... }`.
- Lista `models` dirige o seletor UI. Mantenha em sincronia com o que o runtime suporta.
- `agentConfigurationDoc` e a referencia humana-facing para todos campos. Mantenha verdadeiro e curto.
- **Nao adicione logica de governanca aqui.** Orcamentos, aprovacoes, atividade: esses sao forcados pela plataforma, nao pelo adapter.
- Adapters podem injetar env vars bem-conhecidas no processo agente (Paperclip injeta `PAPERCLIP_WORKSPACE_*` e `PAPERCLIP_RUNTIME_*` para ferramentas agent-side).

---

## 2. Plugins (`@paperclipai/plugin-sdk`)

Plugins adicionam **features** — integracoes, jobs sync, dashboards, launchers, ferramentas. Eles rodam como processos worker que conversam com o host sobre JSON-RPC 2.0 em stdio.

### Scaffolding

```bash
npm create paperclip-plugin@latest
# ou
pnpm create paperclip-plugin
```

### Entrada

```ts
// src/worker.ts
import { definePlugin, runWorker, z } from "@paperclipai/plugin-sdk";

const configSchema = z.object({
  apiKey: z.string().describe("Sua chave API"),
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
      ctx.logger.info("Full sync", { runId: job.runId });
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

### Superficie PluginContext (destaques)

| Cliente | Use para |
|---|---|
| `ctx.logger` | Logs estruturados |
| `ctx.config` | Config de instancia resolvido (validado por Zod) |
| `ctx.events` | Inscrever eventos de plataforma (`issue.created`, `agent.hired`, …) |
| `ctx.jobs` | Registrar jobs background long-running |
| `ctx.launchers` | Registrar entradas launcher UI |
| `ctx.http` | Cliente HTTP controlado por host (respeita allowlist / capacidades) |
| `ctx.secrets` | Resolver referencias secret; nunca veja valores raw a menos que ref seja owned por este plugin |
| `ctx.activity` | Emitir entradas activity log (`PluginActivityLogEntry`) |
| `ctx.state` | Store state escopado (escopo: empresa, projeto, issue, …) |
| `ctx.entities`, `ctx.projects`, `ctx.companies`, `ctx.issues`, `ctx.agents`, `ctx.goals` | Leituras de dominio tipadas |
| `ctx.agentSessions` | Dirigir uma sessao agente programaticamente |
| `ctx.data`, `ctx.actions`, `ctx.streams`, `ctx.tools` | Registrar superficies provider |
| `ctx.metrics`, `ctx.telemetry` | Metricas e telemetria |

### Manifesto

Um plugin envia um `PaperclipPluginManifestV1` descrevendo jobs, webhooks, ferramentas, UI slots, launchers, capacidades. Tipos sao re-exportados de `@paperclipai/plugin-sdk`:

```ts
import type { PaperclipPluginManifestV1 } from "@paperclipai/plugin-sdk";
```

Declare apenas as capacidades que voce realmente precisa — o host as forca (`CapabilityDeniedError` caso contrario).

### Testing

```ts
import { createTestHarness } from "@paperclipai/plugin-sdk/testing";

const harness = createTestHarness(plugin, { /* options */ });
await harness.emit({ type: "issue.created", /* ... */ });
// assevere em harness.logs, harness.jobs, chamadas ctx
```

### Regras de Ouro

- **Declare capacidades honestamente.** Faltando capacidade → `CapabilityDeniedError`.
- **Nunca armazene secrets.** Sempre va atraves de `ctx.secrets.resolve(ref)`.
- **Nunca persista dados host.** Use `ctx.state` com o escopo certo.
- **Um plugin = uma responsabilidade.** Um plugin Linear-sync faz Linear; nao gerencia tambem GitHub.
- **Respeite rate limits** ao usar `ctx.http`.
- **Logue eventos, nao strings**: `ctx.logger.info("issue synced", { issueId, durationMs })`.

---

## 3. Governanca: onde realmente vive

Nem adapters nem plugins possuem governanca. A **plataforma** (server) forca:

- **Budgets** — caps token e dolar. Forcado em runtime agente no server.
- **Approvals** — gates em acoes sensiveis. Decidido por operadores na UI; adapters/plugins sao notificados via eventos.
- **Activity log** — append-only. Adapters contribuem atividade indiretamente; plugins podem emitir entradas via `ctx.activity`.
- **Secrets** — criptografados em repouso. Acessados atraves `ctx.secrets.resolve(ref)`; valores raw nunca sao enviados para o plugin.
- **Tenancy** — todo recurso e escopado por `companyId` server-side.

O autor adapter/plugin **NAO DEVE** tentar forcar esses localmente. Nunca cache decisoes de aprovacao. Nunca decida orcamentos. Nunca compute permissao localmente.

---

## Anti-Patterns

- Um plugin que le secrets por path disco.
- Um adapter que reescreve o config agente para bypass validacao plataforma.
- Codigo plugin que mantem estado mutavel global entre jobs — use `ctx.state`.
- Plugins que abrem conexoes outbound arbitrarias sem declarar a capacidade.
- Metodos JSON-RPC ad-hoc no lado plugin — atenha-se ao protocolo exposto pelo SDK.

---

## Checklist — Novo Adapter Integrado

- [ ] Pacote sob `packages/adapters/<name>/` nomeado `@paperclipai/adapter-<name>`
- [ ] `src/index.ts` exporta `type`, `label`, `models`, `agentConfigurationDoc`
- [ ] Subpaths `./server`, `./ui`, `./cli` exportados quando necessario
- [ ] `registerServerAdapter(adapter)` conectado em boot server
- [ ] `agentConfigurationDoc` e preciso e minimo
- [ ] Testes unitarios para logica spawn / parse / env

## Checklist — Novo Plugin

- [ ] Scaffolded com `npm create paperclip-plugin@latest`
- [ ] Manifesto declara jobs / webhooks / ferramentas / launchers
- [ ] Apenas as capacidades que voce precisa sao declaradas
- [ ] `setup(ctx)` registra handlers, inscreve eventos, retorna sincronamente
- [ ] Config validado com `z.object(...)`
- [ ] `onHealth()` implementado
- [ ] Test harness de `@paperclipai/plugin-sdk/testing` cobre happy path + failure paths
- [ ] README descreve: proposito, configuracao, capacidades requeridas, eventos que reage, jobs que registra

---

**Ultima atualizacao:** 2026-04 | **Versao:** 2.0.0 | **Autor:** The Bearded CTO
