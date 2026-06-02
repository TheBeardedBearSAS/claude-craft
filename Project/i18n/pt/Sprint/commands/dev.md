---
name: sprint-dev
description: Iniciar o desenvolvimento TDD/BDD de um sprint com atualizações automáticas de status
arguments:
  - name: sprint
    description: Número do sprint, "next" para o próximo sprint incompleto, ou "current"
    required: true
---

# /sprint:dev

## Propósito

Orquestrar o desenvolvimento completo do sprint no modo TDD/BDD com:
- **Modo de planejamento obrigatório** antes de cada implementação de tarefa
- **Ciclo TDD** (RED → GREEN → REFACTOR)
- **Atualizações automáticas de status** (Tarefa → User Story → Sprint)
- **Rastreamento de progresso** e métricas

## Pré-requisitos

- Sprint existe com tarefas decompostas
- Arquivos presentes: `sprint-backlog.md`, `tasks/*.md`
- Executar `/project:decompose-tasks N` primeiro se necessário

## Argumentos

```bash
/sprint:dev 1        # Sprint 1
/sprint:dev next     # Próximo sprint incompleto
/sprint:dev current  # Sprint atualmente ativo
```

---

## Fluxo de Trabalho

### Fase 1: Inicialização

1. Carregar sprint de `project-management/sprints/sprint-N-*/`
2. Ler `sprint-backlog.md` para obter as User Stories
3. Listar tarefas por US (ordenadas por dependências)
4. Exibir o quadro inicial

```
📋 Sprint 1: Walking Skeleton
   Objetivo: Completar o fluxo de autenticação end-to-end

   3 User Stories, 17 Tarefas

   🔴 A Fazer: 15 | 🟡 Em Andamento: 2 | 🟢 Concluído: 0
```

### Fase 2: Loop de User Story

Para cada User Story com status A Fazer ou Em Andamento:

1. **Marcar US → Em Andamento** (se A Fazer)
2. **Exibir critérios de aceitação** (formato Gherkin)
3. **Processar cada tarefa** desta US

```
🎯 US-001: Autenticação de Usuário (5 pts)
   Status: 🟡 Em Andamento

   Critérios de Aceitação:
   ┌─────────────────────────────────────────────────────┐
   │ DADO um usuário registrado com credenciais válidas  │
   │ QUANDO ele enviar o formulário de login             │
   │ ENTÃO ele deve ver seu painel                       │
   │ E uma sessão deve ser criada                        │
   └─────────────────────────────────────────────────────┘

   Tarefas:
   └─ TASK-001 [DB] Criar entidade User ................. 🔴 A Fazer
   └─ TASK-002 [BE] Serviço de autenticação ............. 🔴 A Fazer
   └─ TASK-003 [FE-WEB] Formulário de login ............. 🔴 A Fazer
   └─ TASK-004 [TEST] Testes E2E de autenticação ........ 🔴 A Fazer
```

### Fase 3: Loop de Tarefa (Fluxo TDD)

Para cada tarefa A Fazer:

#### 3.1 Exibir Detalhes da Tarefa

```
▶️ Iniciando TASK-001 [DB] Criar entidade User

   Estimativa: 2h
   Descrição: Criar entidade User com email, password_hash, roles
   Arquivos a modificar: src/Entity/User.php, migrations/

   Definição de Pronto:
   - [ ] Código escrito e funcional
   - [ ] Testes passam
   - [ ] Código revisado (se tarefa [REV] existe)
```

#### 3.2 Modo de Planejamento (OBRIGATÓRIO)

⚠️ **SEMPRE ativar o modo de planejamento antes de implementar**

```
⚠️ MODO DE PLANEJAMENTO ATIVADO

   Analisando tarefa TASK-001...

   📁 Arquivos a analisar:
   - src/Entity/ (padrão de entidades existentes)
   - config/packages/doctrine.yaml
   - migrations/ (última migração)

   🔍 Análise em progresso...
```

O modo de planejamento DEVE:
1. **Explorar** o código impactado e as dependências
2. **Documentar** os resultados da análise
3. **Propor** o plano de implementação com:
   - Arquivos a criar/modificar
   - Testes a escrever (TDD)
   - Riscos e mitigações
4. **Aguardar** a validação do usuário antes de prosseguir

```
📋 Plano de Implementação para TASK-001

   1. Criar entidade User com propriedades:
      - id (UUID)
      - email (único)
      - password_hash
      - roles (array JSON)
      - created_at, updated_at

   2. Testes a escrever PRIMEIRO (TDD):
      - UserTest::test_user_creation()
      - UserTest::test_email_validation()
      - UserTest::test_password_hashing()

   3. Arquivos a criar:
      - src/Entity/User.php
      - tests/Unit/Entity/UserTest.php
      - migrations/VersionXXX.php

   ⏳ Aguardando validação...

   [continue] Prosseguir com a implementação
   [skip] Pular esta tarefa
   [block] Marcar como bloqueada
   [stop] Parar sprint-dev
```

#### 3.3 Marcar Tarefa → Em Andamento

Após a validação do plano:
- Atualizar o status da tarefa para Em Andamento
- Atualizar board.md
- Atualizar index.md

#### 3.4 Ciclo TDD

```
🧪 CICLO TDD - TASK-001

🔴 Fase RED: Escrever testes que falham
   Criando tests/Unit/Entity/UserTest.php...

   Executando testes... FALHOU (esperado)
   ✗ test_user_creation
   ✗ test_email_validation
   ✗ test_password_hashing

🟢 Fase GREEN: Implementar código mínimo
   Criando src/Entity/User.php...

   Executando testes... PASSOU
   ✓ test_user_creation
   ✓ test_email_validation
   ✓ test_password_hashing

🔧 Fase REFACTOR: Melhorar a qualidade do código
   - Extrair validação de email para ValueObject? [s/n]
   - Adicionar método factory? [s/n]

   Executando testes... PASSOU (sem regressão)
```

#### 3.5 Verificação da Definição de Pronto

```
✅ Definição de Pronto - TASK-001

- [x] Código escrito e funcional
- [x] Testes passam (3/3)
- [ ] Código revisado → Tratado por TASK-XXX [REV]

Todas as verificações passaram!
```

#### 3.6 Marcar Tarefa → Concluída

```
📊 Conclusão da Tarefa

TASK-001 [DB] Criar entidade User
├─ Status: 🟢 Concluído
├─ Estimado: 2h
├─ Real: 1.5h
└─ Eficiência: 133%

Inserir tempo real gasto (horas): 1.5
```

Atualizações:
- Metadados do arquivo de tarefa (status, time_spent, updated_at)
- board.md
- index.md
- Métricas do sprint

#### 3.7 Commit Convencional

```
📝 Criando commit...

feat(entity): create User entity with authentication support

- Add User entity with email, password_hash, roles
- Add UUID primary key strategy
- Add timestamps (created_at, updated_at)
- Add unit tests for User entity

Refs: TASK-001, US-001

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

### Fase 4: Validação de User Story

Quando todas as tarefas de uma US estiverem Concluídas:

```
🎯 Validação da US-001

Todas as tarefas concluídas (4/4)

Verificando critérios de aceitação:
┌─────────────────────────────────────────────────────┐
│ ✓ DADO um usuário registrado com credenciais válidas│
│ ✓ QUANDO ele enviar o formulário de login           │
│ ✓ ENTÃO ele deve ver seu painel                     │
│ ✓ E uma sessão deve ser criada                      │
└─────────────────────────────────────────────────────┘

Executando testes E2E se presentes...
✓ tests/E2E/AuthenticationTest.php passou

US-001 → 🟢 Concluída

Atualizando progresso da EPIC-001: 1/3 US concluídas (33%)
```

### Fase 5: Conclusão do Sprint

Quando todas as User Stories estiverem Concluídas:

```
🏁 Sprint 1 Concluído!

📊 Resumo
├─ Duração: 8 dias (planejado: 10)
├─ Velocidade: 15 pontos
├─ Tarefas: 17/17 concluídas
└─ Horas: 38h real vs 42h estimado (110% de eficiência)

📈 Métricas por Tipo
├─ [DB]: 4 tarefas, 6h
├─ [BE]: 5 tarefas, 12h
├─ [FE-WEB]: 4 tarefas, 10h
├─ [TEST]: 3 tarefas, 8h
└─ [DOC]: 1 tarefa, 2h

📝 Gerando sprint-review.md...
📝 Gerando template sprint-retro.md...

Próximo: Executar /sprint:dev 2 ou /sprint:dev next
```

---

## Ordem de Processamento de Tarefas

As tarefas são processadas por tipo para respeitar as dependências:

| Ordem | Tipo | Descrição |
|-------|------|-----------|
| 1 | `[DB]` | Banco de dados (entidades, migrações, repositórios) |
| 2 | `[BE]` | Backend (serviços, APIs, lógica de negócio) |
| 3 | `[FE-WEB]` | Frontend Web (controllers, templates, JS) |
| 4 | `[FE-MOB]` | Frontend Mobile (telas, blocs, widgets) |
| 5 | `[TEST]` | Testes adicionais (E2E, performance) |
| 6 | `[DOC]` | Documentação |
| 7 | `[REV]` | Revisão de Código |

---

## Comandos de Controle

Durante a execução do sprint-dev:

| Comando | Ação |
|---------|------|
| `continue` | Validar plano e prosseguir com a implementação |
| `skip` | Pular esta tarefa (permanece A Fazer) |
| `block [reason]` | Marcar tarefa como Bloqueada com motivo |
| `stop` | Parar o sprint-dev (salva o estado atual) |
| `status` | Exibir progresso atual |
| `board` | Mostrar quadro Kanban |

---

## Tratamento de Bloqueios

```
⚠️ Tarefa Bloqueada

TASK-003 não pode prosseguir.
Motivo: Aguardando especificação de API da equipe de backend

Opções:
[1] Pular e continuar com a próxima tarefa não bloqueada
[2] Tentar resolver o bloqueio
[3] Parar o sprint-dev

Escolha: 1

Marcando TASK-003 como Bloqueada...
Avançando para TASK-004...
```

---

## Atualizações Automáticas

A cada mudança de status:

1. **Arquivo de tarefa**: Atualizar status, time_spent, updated_at
2. **Arquivo de User Story**: Atualizar progresso das tarefas, status se todas concluídas
3. **Arquivo EPIC**: Atualizar progresso das US
4. **board.md**: Atualizar colunas Kanban
5. **index.md**: Atualizar métricas globais
6. **sprint-status**: Recalcular métricas

---

## Retomar Após Parada

```bash
/sprint:dev current

📋 Retomando Sprint 1: Walking Skeleton

Progresso: 8/17 tarefas (47%)

Última concluída: TASK-008 [BE] JWT Token Service
Próxima tarefa: TASK-009 [FE-WEB] Login Controller

Continuar a partir de TASK-009? [s/n]
```

---

## Sessão de Exemplo

```bash
> /sprint:dev 1

📋 Sprint 1: Walking Skeleton
   3 US, 17 tarefas
   🔴 A Fazer: 17 | 🟡 Em Andamento: 0 | 🟢 Concluído: 0

🎯 Iniciando US-001: Autenticação de Usuário (5 pts)
   Marcando como Em Andamento...

▶️ TASK-001 [DB] Criar entidade User

⚠️ MODO DE PLANEJAMENTO ATIVADO
   Analisando...

   [Detalhes do plano exibidos]

> continue

   Marcando TASK-001 como Em Andamento...

🧪 CICLO TDD

🔴 RED: Escrevendo testes...
   [Código de teste criado]
   Testes: 0/3 passando (esperado)

🟢 GREEN: Implementando...
   [Código de implementação]
   Testes: 3/3 passando

🔧 REFACTOR: Alguma melhoria? [pular]

✅ Definição de Pronto: APROVADA

   Inserir tempo real (estimado 2h): 1.5

📝 Commit criado: feat(entity): create User entity

▶️ TASK-002 [BE] Serviço de autenticação

⚠️ MODO DE PLANEJAMENTO ATIVADO
   ...
```

---

## Arquivos Atualizados

| Arquivo | Atualizações |
|---------|--------------|
| `project-management/backlog/user-stories/US-XXX.md` | Status, progresso de tarefas |
| `project-management/backlog/epics/EPIC-XXX.md` | Progresso de US |
| `project-management/sprints/sprint-N-*/board.md` | Colunas Kanban |
| `project-management/sprints/sprint-N-*/tasks/*.md` | Status da tarefa, tempo |
| `project-management/backlog/index.md` | Métricas globais |
| `project-management/sprints/sprint-N-*/sprint-review.md` | Gerado ao final |

---

## Comandos Relacionados

| Comando | Uso |
|---------|-----|
| `/project:decompose-tasks N` | Criar tarefas antes do sprint-dev |
| `/project:board N` | Ver quadro Kanban |
| `/sprint:status N` | Ver métricas do sprint |
| `/project:move-task` | Alterar manualmente o status da tarefa |
| `/sprint:transition` | Alterar manualmente o status da US |
