// Template : Entrée d'adaptateur Paperclip intégré
// Vit sous `packages/adapters/<nom>/src/index.ts` dans le monorepo Paperclip.
// Un adaptateur déclare *quel runtime IA* alimente un agent ; il n'implémente PAS
// la gouvernance (budgets, approbations) — le serveur le fait.

export const type = "custom_local";          // identifiant stable sur le réseau
export const label = "Runtime personnalisé (local)";

export const models = [
  { id: "custom-model-v1", label: "Modèle personnalisé v1" },
  // Ajouter des modèles ici. Garder en synchronisation avec ce que le runtime supporte réellement.
];

export const agentConfigurationDoc = `# configuration d'agent ${type}

Adaptateur : ${type}

Champs principaux :
- cwd (string, optionnel) : répertoire de travail par défaut
- instructionsFilePath (string, optionnel) : chemin absolu vers le markdown d'instructions
- model (string, optionnel) : id du modèle depuis la liste 'models'
- command (string, optionnel) : binaire CLI (par défaut : "custom")
- extraArgs (string[], optionnel) : arguments CLI supplémentaires
- env (object, optionnel) : surcharges d'env KEY=VALUE
- workspaceStrategy (object, optionnel) : { type: "git_worktree", baseRef?, branchTemplate?, worktreeParentDir? }

Champs opérationnels :
- timeoutSec (number, optionnel) : timeout d'exécution en secondes
- graceSec (number, optionnel) : période de grâce SIGTERM en secondes

Notes :
- Paperclip injecte les variables d'env PAPERCLIP_WORKSPACE_* et PAPERCLIP_RUNTIME_* au runtime.
`;

// Surfaces additionnelles optionnelles :
// - ./server/index.ts : spawn de processus / cycle de vie / enregistrement
// - ./ui/index.ts     : composants React exposés dans le tableau de bord
// - ./cli/index.ts    : sous-commandes CLI contribuées à `paperclipai`
