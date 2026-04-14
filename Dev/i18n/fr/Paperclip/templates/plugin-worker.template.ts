// Template : Entrée de worker de plugin Paperclip
// Généré par `npm create paperclip-plugin@latest` ou /paperclip:generate-adapter <nom> plugin.
// Docs : https://docs.paperclip.ing/  SDK : @paperclipai/plugin-sdk

import { definePlugin, runWorker, z } from "@paperclipai/plugin-sdk";

// --- Config --------------------------------------------------------------
// Déclarer la forme de la configuration par instance de ce plugin. Paperclip
// expose ces champs dans l'UI. Utiliser zod pour que la validation soit partagée avec le
// JSON Schema du manifeste.

const configSchema = z.object({
  apiKeyRef: z.string().describe("Référence de secret pour la clé API amont"),
  baseUrl: z.string().url().default("https://api.example.com"),
});

// --- Plugin --------------------------------------------------------------

const plugin = definePlugin({
  async setup(ctx) {
    ctx.logger.info("plugin.starting", { plugin: ctx.manifest.id });

    // Réagir aux événements de la plateforme
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

    // Enregistrer une tâche de fond
    ctx.jobs.register("full-sync", async (job) => {
      ctx.logger.info("full-sync.start", { runId: job.runId });
      // TODO : implémenter la logique de sync en utilisant ctx.entities / ctx.state
    });

    // Fournir des données que le tableau de bord peut interroger
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
    // Retourner rapidement. Ne pas appeler l'amont depuis ici.
    return { status: "ok" };
  },
});

export default plugin;
runWorker(plugin, import.meta.url);
