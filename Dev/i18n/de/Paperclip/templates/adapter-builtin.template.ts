// Template: Built-in Paperclip Adapter Entry
// Lebt unter `packages/adapters/<name>/src/index.ts` im Paperclip-Monorepo.
// Ein Adapter deklariert, *welche AI-Runtime* einen Agent antreibt; er implementiert NICHT
// Governance (Budgets, Approvals) — der Server tut das.

export const type = "custom_local";          // stabiler Wire-Identifier
export const label = "Custom Runtime (local)";

export const models = [
  { id: "custom-model-v1", label: "Custom Model v1" },
  // Modelle hier hinzufügen. Synchron halten mit dem, was die Runtime tatsächlich unterstützt.
];

export const agentConfigurationDoc = `# ${type} agent configuration

Adapter: ${type}

Core-Felder:
- cwd (string, optional): Standard-Arbeitsverzeichnis
- instructionsFilePath (string, optional): absoluter Pfad zu Instructions-Markdown
- model (string, optional): Modell-ID aus der 'models'-Liste
- command (string, optional): CLI-Binärname (Standard: "custom")
- extraArgs (string[], optional): Extra-CLI-Args
- env (object, optional): KEY=VALUE Env-Overrides
- workspaceStrategy (object, optional): { type: "git_worktree", baseRef?, branchTemplate?, worktreeParentDir? }

Operational-Felder:
- timeoutSec (number, optional): Run-Timeout in Sekunden
- graceSec (number, optional): SIGTERM-Grace-Period in Sekunden

Hinweise:
- Paperclip injiziert PAPERCLIP_WORKSPACE_* und PAPERCLIP_RUNTIME_* Env-Vars zur Runtime.
`;

// Optionale zusätzliche Oberflächen:
// - ./server/index.ts : Prozess-Spawn / Lifecycle / Registrierung
// - ./ui/index.ts     : React-Komponenten, die im Dashboard erscheinen
// - ./cli/index.ts    : CLI-Subcommands, die zu `paperclipai` beitragen
