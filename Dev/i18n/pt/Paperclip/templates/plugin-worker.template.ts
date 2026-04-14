// Template: Entrada worker plugin Paperclip
// Gerado por `npm create paperclip-plugin@latest` ou /paperclip:generate-adapter <name> plugin.
// Docs: https://docs.paperclip.ing/  SDK: @paperclipai/plugin-sdk

import { definePlugin, runWorker, z } from "@paperclipai/plugin-sdk";

// --- Config --------------------------------------------------------------
// Declare o shape da configuracao por instancia deste plugin. Paperclip
// surface esses campos na UI. Use zod para que validacao seja compartilhada com o
// JSON Schema do manifesto.

const configSchema = z.object({
  apiKeyRef: z.string().describe("Referencia secret para chave API upstream"),
  baseUrl: z.string().url().default("https://api.example.com"),
});

// --- Plugin --------------------------------------------------------------

const plugin = definePlugin({
  async setup(ctx) {
    ctx.logger.info("plugin.starting", { plugin: ctx.manifest.id });

    // Reagir a eventos plataforma
    ctx.events.on("issue.created", async (event) => {
      const cfg = await ctx.config.get();
      const apiKey = await ctx.secrets.resolve(cfg.apiKeyRef);

      const res = await ctx.http.fetch(`${cfg.baseUrl}/issues`, {
        method: "POST",
        headers: { Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify({ entityId: event.entityId }),
      });

      if (!res.ok) {
        ctx.logger.warn("upstream.rejected", { status: res.status });
      }
    });

    // Registrar um job background
    ctx.jobs.register("full-sync", async (job) => {
      ctx.logger.info("full-sync.start", { runId: job.runId });
      // TODO: implementar logica sync usando ctx.entities / ctx.state
    });

    // Prover dados que o dashboard pode consultar
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
    // Retorne rapidamente. Nao chame upstream daqui.
    return { status: "ok" };
  },
});

export default plugin;
runWorker(plugin, import.meta.url);
