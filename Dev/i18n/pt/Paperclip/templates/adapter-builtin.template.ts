// Template: Entrada adapter Paperclip built-in
// Vive sob `packages/adapters/<name>/src/index.ts` no monorepo Paperclip.
// Um adapter declara *qual runtime AI* alimenta um agente; ele NAO implementa
// governanca (orcamentos, aprovacoes) — o server faz isso.

export const type = "custom_local";          // identificador wire estavel
export const label = "Custom Runtime (local)";

export const models = [
  { id: "custom-model-v1", label: "Custom Model v1" },
  // Adicione modelos aqui. Mantenha em sincronia com o que o runtime realmente suporta.
];

export const agentConfigurationDoc = `# ${type} agent configuration

Adapter: ${type}

Core fields:
- cwd (string, optional): diretorio trabalho padrao
- instructionsFilePath (string, optional): path absoluto para markdown instrucoes
- model (string, optional): model id da lista 'models'
- command (string, optional): binario CLI (padrao: "custom")
- extraArgs (string[], optional): args CLI extras
- env (object, optional): overrides env KEY=VALUE
- workspaceStrategy (object, optional): { type: "git_worktree", baseRef?, branchTemplate?, worktreeParentDir? }

Operational fields:
- timeoutSec (number, optional): timeout run em segundos
- graceSec (number, optional): periodo graca SIGTERM em segundos

Notes:
- Paperclip injeta env vars PAPERCLIP_WORKSPACE_* e PAPERCLIP_RUNTIME_* em runtime.
`;

// Superficies adicionais opcionais:
// - ./server/index.ts : spawn processo / lifecycle / registro
// - ./ui/index.ts     : componentes React surfaced no dashboard
// - ./cli/index.ts    : subcomandos CLI contribuidos para `paperclipai`
