// Template: Paperclip Plugin Worker Entry
// Generiert durch `npm create paperclip-plugin@latest` oder /paperclip:generate-adapter <name> plugin.
// Docs: https://docs.paperclip.ing/  SDK: @paperclipai/plugin-sdk

import { definePlugin, runWorker, z } from "@paperclipai/plugin-sdk";

// --- Config --------------------------------------------------------------
// Deklarieren Sie die Form der Per-Instanz-Konfiguration dieses Plugins. Paperclip
// zeigt diese Felder in der UI an. Verwenden Sie Zod, damit die Validierung mit dem
// JSON-Schema des Manifests geteilt wird.

const configSchema = z.object({
  apiKeyRef: z.string().describe("Secret-Referenz für den Upstream-API-Key"),
  baseUrl: z.string().url().default("https://api.example.com"),
});

// --- Plugin --------------------------------------------------------------

const plugin = definePlugin({
  async setup(ctx) {
    ctx.logger.info("plugin.starting", { plugin: ctx.manifest.id });

    // Auf Plattform-Events reagieren
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

    // Background-Job registrieren
    ctx.jobs.register("full-sync", async (job) => {
      ctx.logger.info("full-sync.start", { runId: job.runId });
      // TODO: Sync-Logik mit ctx.entities / ctx.state implementieren
    });

    // Daten bereitstellen, die das Dashboard abfragen kann
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
    // Schnell zurückkehren. Rufen Sie Upstream hier nicht auf.
    return { status: "ok" };
  },
});

export default plugin;
runWorker(plugin, import.meta.url);
