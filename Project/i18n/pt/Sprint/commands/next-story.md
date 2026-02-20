---
description: Obter a proxima story pronta para desenvolvimento
argument-hint: [--claim]
---

# Sprint Next Story

Encontrar e opcionalmente pegar a proxima story pronta para desenvolvimento no sprint.

## Argumentos

$ARGUMENTS (formato: [--claim])
- **--claim** (opcional): Transicionar automaticamente a story para in-progress

## Processo

### Etapa 1: Carregar o status do sprint

1. Ler `.bmad/sprint-status.yaml`
2. Obter todas as stories com status `ready-for-dev`
3. Ordenar por prioridade (se definida) ou por ID

### Etapa 2: Verificar os pre-requisitos

Para cada story ready, verificar:
- [ ] Sem dependencias bloqueadoras
- [ ] Story points estimados
- [ ] Tarefas decompostas
- [ ] Criterios de aceitacao definidos
5. Verificar que as stories de `Depende de` estao em estado `done` ou `review`
6. Se as dependencias nao estiverem resolvidas, mostrar as stories bloqueantes

### Etapa 3: Selecionar a proxima story

Ordem de prioridade:
1. Stories com todas as dependencias resolvidas
2. Stories sem dependencias bloqueadoras
3. ID de story menor (mais cedo no backlog)
4. Story points menores (mais simples primeiro)

### Etapa 4: Exibir os detalhes da story

Exibir as informacoes completas:
- ID e titulo
- Story points
- Associacao ao Epic
- Resumo dos criterios de aceitacao
- Visao geral da lista de tarefas
- Notas ou contexto eventuais

### Etapa 5: Pegar a story (se --claim)

Se o flag `--claim` estiver definido:
1. Transicionar a story para `in-progress`
2. Definir `tdd_phase` como `red`
3. Definir `current_task` como a primeira tarefa
4. Registrar a transicao no historico

### Etapa 6: Fornecer as instrucoes

Exibir as proximas etapas:
- Primeira tarefa a trabalhar
- Lembrete do workflow TDD
- Comandos associados

## Formato de Saida

```
═══════════════════════════════════════════════════════
              Proxima Story Pronta para Dev
═══════════════════════════════════════════════════════

📖 US-012: Implementar a pagina de perfil do usuario
   Epic: EPIC-003 (Gestao de Usuarios)
   Pontos: 5
   Prioridade: Alta

Descricao:
──────────────────────────────────────────────────────
Como um usuario cadastrado
Eu quero ver e modificar meu perfil
Para manter minhas informacoes atualizadas

Criterios de Aceitacao (3):
──────────────────────────────────────────────────────
□ AC1: O usuario pode ver suas informacoes de perfil
□ AC2: O usuario pode modificar seu nome e email
□ AC3: As modificacoes sao validadas antes de salvar

Tarefas (4):
──────────────────────────────────────────────────────
□ TASK-031 [BE] Criar o endpoint API de perfil
□ TASK-032 [BE] Adicionar a validacao do perfil
□ TASK-033 [FE] Criar o componente de perfil
□ TASK-034 [FE] Adicionar a validacao do formulario

Pre-requisitos:
──────────────────────────────────────────────────────
✅ Sem dependencias bloqueadoras
✅ Story points estimados
✅ Tarefas decompostas
✅ Criterios de aceitacao definidos

Dependencias:
──────────────────────────────────────────────────────
✅ US-001 (Pagina de login) — done
✅ US-002 (Tokens JWT) — done

Para comecar a trabalhar:
──────────────────────────────────────────────────────
/sprint:transition US-012 in-progress

Ou usar: /sprint:next-story --claim
═══════════════════════════════════════════════════════
```

### Nenhuma Story Disponivel

```
═══════════════════════════════════════════════════════
              Nenhuma Story Pronta para Dev
═══════════════════════════════════════════════════════

📋 Status do backlog:
   - 3 stories no backlog (precisam de refinamento)
   - 2 stories em andamento
   - 1 story bloqueada

Sugestoes:
──────────────────────────────────────────────────────
1. Refinar as stories do backlog: /project:update-stories
2. Ajudar nas stories em andamento
3. Desbloquear US-003: aguardando credenciais da API
4. Ver grafo de dependencias: /project:dependencies

Comandos:
  /sprint:status --bmad  Ver o status completo do sprint
  /gate:validate-backlog Verificar a preparacao das stories
═══════════════════════════════════════════════════════
```

## Exemplo

```
/sprint:next-story
/sprint:next-story --claim
```

## Workflow TDD

Apos pegar uma story:
1. 🔴 RED: Escrever um teste falhando para o primeiro AC/tarefa
2. 🟢 GREEN: Implementar o codigo minimo para passar
3. 🔵 REFACTOR: Limpar mantendo os testes passando
4. Repetir para cada tarefa

Usar `/sprint:tdd-cycle` para acompanhar as transicoes de fase.
