---
description: Auditar Arquitetura Paperclip
argument-hint: [project-path]
---

# Auditar Arquitetura Paperclip

## MISSÃO

Validar a arquitetura de duas camadas (plano de controle + adaptadores) e limites de módulos de um projeto Paperclip.

## Procedimento

### 1. Estrutura do Workspace

- [ ] Diretórios `server/`, `ui/`, `cli/`, `packages/` presentes
- [ ] `packages/` contém `shared/`, `db/`, `adapter-utils/`, `mcp-server/`, `adapters/`, `plugins/`
- [ ] `pnpm-workspace.yaml` lista os workspaces
- [ ] `package.json` raiz declara `"packageManager": "pnpm@9.15.x"`
- [ ] `pnpm run preflight:workspace-links` passa
- [ ] Sem config legada de Lerna / npm workspaces remanescente

### 2. Módulos do plano de controle

Sob `server/src/modules/` espere uma pasta por domínio (agents, approvals, costs, companies, goals, activity, secrets). Para cada módulo:

- [ ] `routes.ts` — Apenas HTTP, chama serviços, sem acesso ao DB
- [ ] `service.ts` — lógica de negócio, emite eventos de atividade
- [ ] `repository.ts` — queries parametrizadas, sem regras de negócio
- [ ] `types.ts` — re-exportado via `shared/`
- [ ] `*.test.ts` colocados
- [ ] Sem imports cruzando para internos de outro módulo (apenas via sua API de serviço)

Marcar: qualquer rota que leia o DB diretamente, qualquer serviço que construa strings SQL, qualquer import cross-module contornando a camada de serviço.

### 3. Adaptadores (built-in, `packages/adapters/*`)

- [ ] Cada adaptador vive sob `packages/adapters/<name>/` e é nomeado `@paperclipai/adapter-<name>`
- [ ] `src/index.ts` exporta `type`, `label`, `models`, `agentConfigurationDoc`
- [ ] Subpaths opcionais (`./server`, `./ui`, `./cli`) estão presentes apenas quando implementados
- [ ] **Sem lógica de governança** dentro do adaptador — o servidor possui orçamentos / aprovações / permissões
- [ ] Bootstrap do servidor registra via `registerServerAdapter(...)`

### 3b. Plugins (`@paperclipai/plugin-sdk`)

- [ ] Scaffold via `create-paperclip-plugin` (ou estruturalmente equivalente)
- [ ] `definePlugin({ setup, onHealth })` na entrada do worker
- [ ] Manifesto declara apenas capacidades necessárias
- [ ] Sem segredos lidos do disco; sempre via `ctx.secrets.resolve(ref)`

### 4. Tipos compartilhados

- [ ] `shared/types/` contém apenas declarações de tipo `.ts`
- [ ] Sem código de runtime (sem funções, sem classes)
- [ ] Sem imports de frameworks (React, Express, etc.)

### 5. UI Web

- [ ] Cliente de API `ui/src/` consome tipos do servidor via `@paperclipai/shared` — sem `fetch` artesanal com respostas sem tipo
- [ ] Sem decisões de governança em componentes (sem "if budget > X then hide button" — servidor decide, UI renderiza)

### 6. Cobertura de log de atividades

Grep para cada mutação de DB (`INSERT`, `UPDATE`, `DELETE` não em migrations/seeds). Cada uma deve estar adjacente a uma emissão de evento de atividade. Relate mutações sem um `activity.emit(...)` correspondente.

### 7. Spec OpenAPI

- [ ] `server/src/api/openapi.yaml` (ou gerado) está commitado
- [ ] Toda rota tem uma operação correspondente
- [ ] Cliente web gerado está atualizado (`pnpm generate:api` não produz diff)

## Saída

Relatório markdown com:
- Passou/falhou por checkbox acima
- Caminhos de arquivos ofensores (números de linha quando disponíveis)
- Severidade: Blocker / Major / Minor
- Pontuação /25 para uso por `/paperclip:check-compliance`
