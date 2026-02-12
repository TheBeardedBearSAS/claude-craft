---
description: Validar uma story contra a Definition of Done
argument-hint: <story-id>
---

# Validar Story Gate (DoD)

Valida uma User Story contra os criterios da Definition of Done.
Todos os criterios devem ser aprovados para marcar a story como concluida.

## Argumentos

$ARGUMENTS (formato: <story-id>)
- **story-id** (obrigatorio): Identificador da story (ex: US-001)

## Criterios Definition of Done

| Criterio | Peso | Obrigatorio | Descricao |
|----------|------|-------------|-----------|
| Tarefas completas | 20% | Sim | Todas as tarefas marcadas como done |
| Testes passando | 20% | Sim | Ciclo TDD completo (green/refactor) |
| AC validados | 20% | Sim | Todos os criterios de aceitacao validados |
| Codigo revisado | 15% | Sim | Revisao por pares concluida |
| Sem bloqueadores | 10% | Sim | Nao esta em estado bloqueado |
| Documentacao | 10% | Nao | Docs atualizadas se necessario |
| Revisao de seguranca | 5% | Nao | Implicacoes de seguranca verificadas |

**Limite: 100% (todos os criterios obrigatorios)**

## Processo

### Etapa 1: Carregar a story

1. Ler `.bmad/sprint-status.yaml`
2. Encontrar a story pelo ID
3. Carregar todos os campos da story

### Etapa 2: Validar cada criterio

Verificar todos os criterios DoD:
- Tarefas: `tasks.completed == tasks.total`
- Testes: `tdd_phase in ['green', 'refactor', 'done']`
- AC: `acceptance_criteria.validated == acceptance_criteria.total`
- Review: `status == 'review' or review.approved == true`
- Bloqueadores: `blocked_reason == null`

### Etapa 3: Gerar o relatorio

Exibir os resultados detalhados com status aprovado/reprovado.

## Formato de Saida

### Story Valida DoD

```
═══════════════════════════════════════════════════════
          Story DoD Gate: US-005
═══════════════════════════════════════════════════════

📖 US-005: Verificacao de email
Status: review → done (pendente)

Definition of Done:
──────────────────────────────────────────────────────
✅ Tarefas completas (20%)
   Todas as tarefas concluidas: 4/4
   □ TASK-021: Endpoint backend ✓
   □ TASK-022: Servico de email ✓
   □ TASK-023: Fluxo frontend ✓
   □ TASK-024: Testes ✓

✅ Testes passando (20%)
   Fase TDD: refactor
   Todos os testes aprovados

✅ Criterios de Aceitacao (20%)
   Validados: 3/3
   ✓ AC1: Email de verificacao enviado
   ✓ AC2: Link expira apos 24h
   ✓ AC3: Status do usuario atualizado

✅ Codigo revisado (15%)
   PR #42 aprovada por @reviewer
   Status da revisao: aprovado

✅ Sem bloqueadores (10%)
   Nenhum problema bloqueador

✅ Documentacao (10%)
   Docs da API atualizadas

✅ Revisao de seguranca (5%)
   Geracao de token revisada

Pontuacao: 100/100
──────────────────────────────────────────────────────

✅ STORY DoD GATE VALIDADO

A story pode ser transicionada para 'done'.
Executar: /sprint:transition US-005 done
═══════════════════════════════════════════════════════
```

### Story Reprova DoD

```
═══════════════════════════════════════════════════════
          Story DoD Gate: US-005
═══════════════════════════════════════════════════════

📖 US-005: Verificacao de email
Status: in-progress

Definition of Done:
──────────────────────────────────────────────────────
❌ Tarefas completas (20%)
   Tarefas concluidas: 2/4
   ✓ TASK-021: Endpoint backend
   ✓ TASK-022: Servico de email
   □ TASK-023: Fluxo frontend (em andamento)
   □ TASK-024: Testes (pendente)

❌ Testes passando (20%)
   Fase TDD: red
   Os testes estao falhando

⚠️ Criterios de Aceitacao (20%)
   Validados: 1/3
   ✓ AC1: Email de verificacao enviado
   □ AC2: Link expira apos 24h
   □ AC3: Status do usuario atualizado

❌ Codigo revisado (15%)
   Nenhuma PR criada

✅ Sem bloqueadores (10%)
   Nenhum problema bloqueador

⏳ Documentacao (10%)
   Nao verificado

⏳ Revisao de seguranca (5%)
   Nao verificado

Pontuacao: 25/100
──────────────────────────────────────────────────────

❌ STORY DoD GATE REPROVADO

Acoes necessarias:
──────────────────────────────────────────────────────
1. Concluir as tarefas restantes
   - TASK-023: Fluxo frontend
   - TASK-024: Testes

2. Corrigir os testes falhando
   Fase TDD atual: red
   Executar os testes e implementar as correcoes

3. Validar os criterios de aceitacao
   - Testar AC2: Expiracao do link
   - Testar AC3: Atualizacao do status do usuario

4. Criar uma pull request para revisao
   git push && gh pr create

Trabalho restante estimado:
  Tarefas: 2 restantes
  Ciclos TDD: 2 (para as tarefas restantes)

Retomar o trabalho: /sprint:dev US-005
═══════════════════════════════════════════════════════
```

## Exemplo

```
/gate:validate-story US-005
/gate:validate-story US-001
```

## Guia de Fases TDD

| Fase | Significado | Proxima etapa |
|------|-------------|---------------|
| red | Testes falhando | Implementar o codigo |
| green | Testes passando | Refatorar |
| refactor | Limpeza | Concluir ou proxima tarefa |
| done | Ciclo completo | Passar para review |

Atualizar a fase:
```
/sprint:tdd US-005 green
```

## Integracao

Este gate e verificado:
1. Manualmente via este comando
2. No hook Stop (quality-gate.sh)
3. Antes de `/sprint:transition <id> done`

Configuracao do gate: `.bmad/gates/story-gate.yaml`
