---
description: Transicionar uma story para um novo status
argument-hint: <story-id> <status-destino>
---

# Sprint Transition

Transicionar uma story para um novo status com validacao e rastreamento do historico.

## Argumentos

$ARGUMENTS (formato: <story-id> <status-destino>)
- **story-id** (obrigatorio): Identificador da story (ex: US-001)
- **status-destino** (obrigatorio): Status de destino

Status validos:
- `backlog` - Story no product backlog
- `ready-for-dev` - Refinada e pronta para desenvolvimento
- `in-progress` - Em desenvolvimento
- `review` - Codigo concluido, aguardando revisao
- `done` - Definition of Done atingida
- `blocked` - Bloqueada por um fator externo

## Processo

### Etapa 1: Validar que a story existe

1. Ler `.bmad/sprint-status.yaml`
2. Encontrar a story pelo ID
3. Obter o status atual

### Etapa 2: Validar a transicao

Verificar as regras da maquina de estados:
```
Transicoes permitidas:
  backlog → ready-for-dev
  ready-for-dev → in-progress
  in-progress → review
  review → done
  review → in-progress (alteracoes solicitadas)
  * → blocked (qualquer estado pode ser bloqueado)
  blocked → previous_status (retomar)
```

### Etapa 3: Verificar os requisitos do gate

Antes de transicionar, verificar os requisitos do gate:

**→ ready-for-dev**
- [ ] Criterios de aceitacao definidos
- [ ] Story points estimados
- [ ] Tarefas decompostas

**→ in-progress**
- [ ] Sem dependencias bloqueadoras
- [ ] Desenvolvedor atribuido (opcional)

**→ review**
- [ ] Todas as tarefas concluidas
- [ ] Testes passando (TDD green ou refactor)
- [ ] Codigo enviado

**→ done**
- [ ] Codigo revisado
- [ ] Todos os AC validados
- [ ] Checklist DoD completa

**→ blocked**
- Fornecer blocked_reason

### Etapa 4: Executar a transicao

1. Armazenar o status anterior
2. Atualizar o campo de status
3. Definir os timestamps
4. Atualizar a fase TDD se aplicavel
5. Registrar no historico

### Etapa 5: Efeitos colaterais

De acordo com a transicao:

**→ in-progress**
- Definir `tdd_phase` como `red`
- Definir `current_task` como a primeira tarefa

**→ review**
- Definir `tdd_phase` como `refactor`
- Limpar `current_task`

**→ done**
- Limpar `tdd_phase`
- Registrar o tempo de conclusao

**→ blocked**
- Armazenar `blocked_reason`
- Armazenar `previous_status` para retomada

### Etapa 6: Atualizar o historico

Adicionar uma entrada:
```yaml
history:
  - timestamp: "2026-01-29T10:00:00Z"
    from: "in-progress"
    to: "review"
    by: "manual"
    reason: "Todas as tarefas concluidas"
```

## Formato de Saida

### Transicao Bem-sucedida

```
═══════════════════════════════════════════════════════
              Transicao de Story
═══════════════════════════════════════════════════════

📖 US-005: Autenticacao de usuario

Status: in-progress → review ✅

Verificacoes do gate:
──────────────────────────────────────────────────────
✅ Todas as tarefas concluidas (5/5)
✅ Testes passando
✅ Codigo enviado

Historico atualizado:
──────────────────────────────────────────────────────
• 2026-01-29 10:00 - in-progress → review (manual)
• 2026-01-27 09:00 - ready-for-dev → in-progress
• 2026-01-25 14:00 - backlog → ready-for-dev

Proximas etapas:
──────────────────────────────────────────────────────
A story esta agora em review. Atribuir um reviewer ou executar:
  /sprint:next-story --claim
═══════════════════════════════════════════════════════
```

### Gate Reprovado

```
═══════════════════════════════════════════════════════
              Transicao Bloqueada
═══════════════════════════════════════════════════════

📖 US-005: Autenticacao de usuario

Solicitado: in-progress → review ❌

Falhas do gate:
──────────────────────────────────────────────────────
❌ Tarefas incompletas: 3/5
❌ Fase TDD esta 'red' - os testes devem passar primeiro

Acoes necessarias:
──────────────────────────────────────────────────────
1. Concluir as tarefas restantes:
   □ TASK-015: Implementar a validacao JWT
   □ TASK-016: Adicionar suporte a refresh token

2. Passar a fase TDD para green:
   /sprint:tdd green

Depois retentar: /sprint:transition US-005 review
═══════════════════════════════════════════════════════
```

### Transicao Invalida

```
═══════════════════════════════════════════════════════
              Transicao Invalida
═══════════════════════════════════════════════════════

📖 US-005: Autenticacao de usuario

Atual: in-progress
Solicitado: done ❌

Invalido: Nao e possivel transicionar diretamente de 'in-progress' para 'done'

Transicoes validas a partir de 'in-progress':
──────────────────────────────────────────────────────
• review - Codigo concluido, pronto para revisao
• blocked - Story bloqueada

Maquina de estados:
  backlog → ready-for-dev → in-progress → review → done
═══════════════════════════════════════════════════════
```

## Exemplo

```
/sprint:transition US-005 review
/sprint:transition US-003 blocked "Aguardando credenciais da API"
/sprint:transition US-003 in-progress  # Retomar de blocked
```

## Casos Especiais

### Bloquear uma story
```
/sprint:transition US-003 blocked "Aguardando API externa"
```
Armazena o motivo e preserva o status anterior para retomada.

### Desbloquear uma story
```
/sprint:transition US-003 in-progress
```
Ao transicionar de blocked, retorna ao status anterior.

### Solicitar alteracoes em review
```
/sprint:transition US-005 in-progress
```
Transicao reversa valida a partir de review para tratar o feedback.
