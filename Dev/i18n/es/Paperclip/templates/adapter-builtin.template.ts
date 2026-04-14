// Template: Entrada de adaptador Paperclip built-in
// Vive bajo `packages/adapters/<name>/src/index.ts` en el monorepo de Paperclip.
// Un adaptador declara *qué runtime de IA* potencia un agente; NO implementa
// gobernanza (presupuestos, aprobaciones) — el servidor hace eso.

export const type = "custom_local";          // identificador wire estable
export const label = "Custom Runtime (local)";

export const models = [
  { id: "custom-model-v1", label: "Custom Model v1" },
  // Agregar modelos aquí. Mantener sincronizado con lo que el runtime realmente soporta.
];

export const agentConfigurationDoc = `# Configuración de agente ${type}

Adaptador: ${type}

Campos principales:
- cwd (string, opcional): directorio de trabajo predeterminado
- instructionsFilePath (string, opcional): path absoluto a markdown de instrucciones
- model (string, opcional): id de modelo de la lista 'models'
- command (string, opcional): binario CLI (predeterminado: "custom")
- extraArgs (string[], opcional): args CLI adicionales
- env (object, opcional): sobrescrituras de env KEY=VALUE
- workspaceStrategy (object, opcional): { type: "git_worktree", baseRef?, branchTemplate?, worktreeParentDir? }

Campos operacionales:
- timeoutSec (number, opcional): timeout de ejecución en segundos
- graceSec (number, opcional): período de gracia SIGTERM en segundos

Notas:
- Paperclip inyecta variables de entorno PAPERCLIP_WORKSPACE_* y PAPERCLIP_RUNTIME_* en runtime.
`;

// Superficies adicionales opcionales:
// - ./server/index.ts : spawn de proceso / ciclo de vida / registro
// - ./ui/index.ts     : componentes React expuestos en el dashboard
// - ./cli/index.ts    : subcomandos CLI contribuidos a `paperclipai`
