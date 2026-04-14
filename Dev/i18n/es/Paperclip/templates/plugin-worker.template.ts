// Template: Entrada worker de plugin Paperclip
// Generado por `npm create paperclip-plugin@latest` o /paperclip:generate-adapter <nombre> plugin.
// Docs: https://docs.paperclip.ing/  SDK: @paperclipai/plugin-sdk

import { definePlugin, runWorker, z } from "@paperclipai/plugin-sdk";

// --- Config --------------------------------------------------------------
// Declarar la forma de la configuración por-instancia de este plugin. Paperclip
// expone estos campos en la UI. Usar zod para que la validación sea compartida con el
// JSON Schema del manifiesto.

const configSchema = z.object({
  apiKeyRef: z.string().describe("Referencia de secreto para la API key upstream"),
  baseUrl: z.string().url().default("https://api.example.com"),
});

// --- Plugin --------------------------------------------------------------

const plugin = definePlugin({
  async setup(ctx) {
    ctx.logger.info("plugin.starting", { plugin: ctx.manifest.id });

    // Reaccionar a eventos de plataforma
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

    // Registrar un trabajo en segundo plano
    ctx.jobs.register("full-sync", async (job) => {
      ctx.logger.info("full-sync.start", { runId: job.runId });
      // TODO: implementar lógica de sincronización usando ctx.entities / ctx.state
    });

    // Proveer datos que el dashboard puede consultar
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
    // Retornar rápidamente. No llamar upstream desde aquí.
    return { status: "ok" };
  },
});

export default plugin;
runWorker(plugin, import.meta.url);
