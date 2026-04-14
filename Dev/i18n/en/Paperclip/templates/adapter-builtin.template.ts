// Template: Built-in Paperclip adapter entry
// Lives under `packages/adapters/<name>/src/index.ts` in the Paperclip monorepo.
// An adapter declares *which AI runtime* powers an agent; it does NOT implement
// governance (budgets, approvals) — the server does that.

export const type = "custom_local";          // stable wire identifier
export const label = "Custom Runtime (local)";

export const models = [
  { id: "custom-model-v1", label: "Custom Model v1" },
  // Add models here. Keep in sync with what the runtime actually supports.
];

export const agentConfigurationDoc = `# ${type} agent configuration

Adapter: ${type}

Core fields:
- cwd (string, optional): default working directory
- instructionsFilePath (string, optional): absolute path to instructions markdown
- model (string, optional): model id from the 'models' list
- command (string, optional): CLI binary (default: "custom")
- extraArgs (string[], optional): extra CLI args
- env (object, optional): KEY=VALUE env overrides
- workspaceStrategy (object, optional): { type: "git_worktree", baseRef?, branchTemplate?, worktreeParentDir? }

Operational fields:
- timeoutSec (number, optional): run timeout in seconds
- graceSec (number, optional): SIGTERM grace period in seconds

Notes:
- Paperclip injects PAPERCLIP_WORKSPACE_* and PAPERCLIP_RUNTIME_* env vars at runtime.
`;

// Optional additional surfaces:
// - ./server/index.ts : process spawn / lifecycle / registration
// - ./ui/index.ts     : React components surfaced in the dashboard
// - ./cli/index.ts    : CLI subcommands contributed to `paperclipai`
