# Checklist Nova Feature — Paperclip

Uma feature em Paperclip tipicamente toca um ou mais **modulos** (`server/src/modules/*`) e as vezes um **adapter**. Use esta checklist end-to-end.

## 0. Analise (antes de escrever codigo)

- [ ] Identifique o(s) dominio(s) afetado(s) (agents / approvals / costs / …)
- [ ] Determine se governanca e impactada (orcamentos, aprovacoes, activity log)
- [ ] Liste a migracao de dados, se houver
- [ ] Verifique implicacoes cross-tenant
- [ ] Escreva uma nota design 5-linhas: o que muda, por que, quais arquivos

## 1. Schema (se aplicavel)

- [ ] Arquivo migracao sob `server/src/db/migrations/` (forward + down)
- [ ] Novas colunas nullable OU backfilled na mesma migracao
- [ ] Indexes em qualquer coluna usada em clausulas WHERE
- [ ] Tabela activity log intocada (e append-only)
- [ ] `pnpm db:migrate` sucesso localmente

## 2. Tipos (`shared/types`)

- [ ] Novos tipos dominio adicionados em `shared/types/<domain>.ts`
- [ ] Sem codigo runtime em `shared/types/`
- [ ] Unions discriminadas usadas para tipos variantes
- [ ] Path re-export atualizado se necessario

## 3. Servico (`server/src/modules/<domain>/service.ts`)

- [ ] Logica negocio vive aqui
- [ ] Retorna resultados tipados ou lanca `DomainError`
- [ ] Emite um evento atividade em cada mutacao
- [ ] Forca gates budget / aprovacao onde relevante
- [ ] Tenancy: deriva `companyId` da sessao, filtra adequadamente
- [ ] Testes unitarios com repositorio mockado

## 4. Repositorio (`server/src/modules/<domain>/repository.ts`)

- [ ] Queries parametrizadas apenas
- [ ] Sem logica negocio
- [ ] Testes integracao contra Postgres real

## 5. Rotas (`server/src/modules/<domain>/routes.ts`)

- [ ] Uma rota por operacao
- [ ] Input validado via zod (ou equivalente)
- [ ] Respostas tipadas; erros mapeados para codigos `DomainError`
- [ ] Sem acesso DB direto
- [ ] Spec OpenAPI atualizada

## 6. UI Web (se aplicavel)

- [ ] Cliente API regenerado de OpenAPI (`pnpm generate:api`)
- [ ] Nova UI sob `ui/src/` (siga a convencao routing existente)
- [ ] Flags governanca vem do server, nao computadas cliente
- [ ] Estados loading e erro tratados
- [ ] Acessibilidade: paths teclado + leitor-tela verificados

## 7. Superficie de extensao (se a feature requer mudancas)

### Adapter integrado (runtime AI)

- [ ] `packages/adapters/<name>/src/index.ts` — `type` / `label` / `models` / `agentConfigurationDoc` ainda precisos
- [ ] Entrada registro server-side atualizada (`registerServerAdapter`)
- [ ] Configs agente existentes ainda validam (sem renomear campo breaking)

### Plugin (feature)

- [ ] Capacidades manifesto permanecem minimas (adicione apenas o que esta feature requer)
- [ ] Wiring `definePlugin({ setup })` para novos eventos / jobs / data providers
- [ ] Schema config (zod) atualizado com descricoes claras
- [ ] Plugin test harness de `@paperclipai/plugin-sdk/testing` ainda passa

## 8. Testes

- [ ] Unit: logica service + paths erro
- [ ] Integration: rotas modulo + DB com Postgres real
- [ ] Isolamento cross-tenant: usuario A de empresa X nao pode tocar dados empresa Y
- [ ] Aplicacao budget: tentativa over-limit retorna `BUDGET_EXCEEDED`
- [ ] Gating aprovacao: acao bloqueia ate aprovada ou timeout
- [ ] Contrato adapter: re-execute a suite compartilhada
- [ ] Thresholds cobertura ainda verdes (≥ 80 global, ≥ 90 para agents/approvals/costs)

## 9. Documentacao

- [ ] Entrada CHANGELOG sob `## Unreleased`
- [ ] Spec OpenAPI commitada
- [ ] README adapter atualizado se as acoes suportadas mudaram
- [ ] Runbook atualizado se a feature impacta incident response (kill switch, revocacao, export)

## 10. Revisao

- [ ] Self-review: `git diff main...HEAD`
- [ ] Execute `/paperclip:check-compliance` localmente
- [ ] Descricao PR: o que, por que, plano migracao, plano rollback
- [ ] Testes contrato adapter verdes para cada adapter tocado

## 11. Rollout

- [ ] Plano deploy: migrar forward, deploy codigo, verificar saude
- [ ] Kill switch ainda funcional apos deploy
- [ ] Activity log captura visivelmente os eventos da nova feature
