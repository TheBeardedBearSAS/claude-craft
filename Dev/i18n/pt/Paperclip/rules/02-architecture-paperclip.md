# Arquitetura Paperclip — Princípios e Organização

> Fonte da verdade: https://docs.paperclip.ing/ e o repositório em https://github.com/paperclipai/paperclip.
> Versão observada: v2026.609.0 (MIT, Abril 2026).

## Estrutura do Monorepo (observada no repositório)

```
paperclip/
├── server/                          # @paperclipai/server — API HTTP Node.js + TS
│   ├── src/
│   │   ├── routes/                  # Rotas HTTP (companies, agents, approvals, ...)
│   │   ├── adapters/                # Registro de adaptadores do lado do servidor + lookup
│   │   └── ...
│   └── vitest.config.ts
│
├── ui/                              # @paperclipai/ui — Dashboard React
│
├── cli/                             # CLI paperclipai (commander.js)
│   ├── src/
│   │   ├── commands/                # onboard, doctor, env, configure, ...
│   │   └── commands/client/         # company, agent, approval, activity, plugin, ...
│   └── esbuild.config.mjs
│
├── packages/
│   ├── shared/                      # @paperclipai/shared — tipos + schemas cross-cutting
│   ├── db/                          # @paperclipai/db — schema, migrations
│   ├── mcp-server/                  # @paperclipai/mcp-server
│   ├── adapter-utils/               # @paperclipai/adapter-utils — helpers para autores de adaptadores
│   ├── adapters/                    # Adaptadores built-in
│   │   ├── claude-local/            # @paperclipai/adapter-claude-local
│   │   ├── codex-local/
│   │   ├── cursor-local/
│   │   ├── gemini-local/
│   │   ├── opencode-local/
│   │   ├── openclaw-gateway/
│   │   └── pi-local/
│   └── plugins/
│       ├── sdk/                     # @paperclipai/plugin-sdk — SDK público para plugins externos
│       ├── create-paperclip-plugin/ # @paperclipai/create-paperclip-plugin — scaffolder
│       └── examples/                # plugin-hello-world-example, plugin-kitchen-sink-example, ...
│
├── tests/
│   ├── e2e/                         # Playwright
│   └── release-smoke/
│
├── docker/
├── scripts/
└── docs/                            # Site Mintlify
```

## Workspaces

O `package.json` raiz / `pnpm-workspace.yaml` define os workspaces. Cada pacote é publicado sob o escopo `@paperclipai/*`. O `packageManager` é fixado (`pnpm@9.15.x`).

## Camadas

1. **Server** — API HTTP + lógica de governança (orçamentos, aprovações, log de atividades, tenancy).
2. **UI** — Dashboard React. Renderiza, interage, nunca decide governança.
3. **CLI** — Ferramentas de operador (onboard, doctor, gerenciamento de company/agent/approval). Adaptadores podem contribuir subcomandos CLI via sua exportação `./cli`.
4. **Packages** — Bibliotecas reutilizáveis: `shared` (tipos), `db` (schema), `adapter-utils`, `mcp-server`, e duas famílias de extensão.
5. **Pontos de extensão** — Veja `12-adapter-protocol.md`:
   - **Adapters** (`packages/adapters/*`) — qual runtime de IA alimenta um agente
   - **Plugins** (`@paperclipai/plugin-sdk`, com scaffold via `create-paperclip-plugin`) — funcionalidades, integrações, jobs, slots de UI

## Domínios Centrais (rotas do servidor observadas)

- **Companies** (`/companies/...`) — fronteira de tenant
- **Agents** (`/agents`, `/companies/:companyId/agents`, `/agent-hires`) — trabalhadores registrados
- **Approvals** (`/approvals/...`) — portas human-in-the-loop
- **Activity** — auditoria append-only
- **Issues / Projects / Goals** — construções de nível de produto
- **Plugin** — gerenciamento de plugins via CLI (`paperclipai plugin ...`)

## Direção de Dependência

```
server ─► @paperclipai/shared
server ─► @paperclipai/db
ui     ─► @paperclipai/shared  (apenas tipos)
plugins ─► @paperclipai/plugin-sdk ─► @paperclipai/shared
adapters (built-in) ─► @paperclipai/adapter-utils (opcional)
```

- `shared` são tipos puros e schemas. Sem imports de frameworks, sem clientes HTTP de runtime.
- UI nunca importa de `server/` diretamente. Tipos vêm de `shared`.
- Plugins dependem apenas do SDK (e opcionalmente adapter-utils se lidam com adaptadores).
- Adaptadores (built-in) vivem em seu pacote; eles se registram no registro do servidor no boot.

## Regras Arquiteturais

| Regra | Por Que |
|---|---|
| Governança (orçamentos, aprovações, segredos, tenancy) é somente no servidor | Adaptadores/plugins não podem contornar |
| Adaptadores expõem `type`, `label`, `models`, `agentConfigurationDoc` | Contrato de transmissão estável para agentes |
| Plugins usam `definePlugin({ setup(ctx) })` e declaram capacidades | Sandbox mediado pelo SDK |
| UI consome dados tipados de `shared` via APIs do servidor | Sem acesso direto ao DB |
| Log de atividades é append-only e emitido para toda mutação | Auditabilidade não-negociável |
| Links de workspace pré-verificados antes de build/typecheck (`preflight:workspace-links`) | Previne desvio entre pacotes |

## Padrões Arquiteturais

- **Monorepo modular** — um deploy, limites forçados via pacotes de workspace.
- **Log de atividades append-only** — toda mutação emite um evento; dashboards e plugins leem dele.
- **Schemas tipados em todos os lugares** — Zod nos limites de configuração, tipos TS por toda parte.
- **JSON-RPC 2.0** — protocolo host ↔ plugin worker (veja `12-adapter-protocol.md`).
- **Registro de adaptador** — mutável, com `registerServerAdapter` / `unregisterServerAdapter` / `requireServerAdapter`.

## Anti-Padrões

- Lógica de governança em um plugin ou adaptador.
- UI computando estado de orçamento / aprovação em vez de ler uma flag computada pelo servidor.
- Adaptador que reescreve uma config de agente para pular validação da plataforma.
- Plugin armazenando estado em um arquivo no disco em vez de `ctx.state`.
- Imports cross-workspace que contornam a exportação pública do pacote.

## Checklist

- [ ] Novo pacote vive sob `server/`, `ui/`, `cli/`, ou `packages/*`
- [ ] Publicado sob o escopo `@paperclipai/*` (para novos pacotes públicos)
- [ ] `pnpm run preflight:workspace-links` passa
- [ ] Sem lógica de governança fora de `server/`
- [ ] Evento de atividade emitido para toda mutação
- [ ] Tipos consumidos de `@paperclipai/shared` ao cruzar fronteiras de workspace

---

**Última atualização:** 2026-04 | **Versão:** 2.0.0 | **Autor:** The Bearded CTO
