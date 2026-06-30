---
description: "Processar a fila batch de stories"
argument-hint: "[--parallel N] [--auto] [--resume]"
---

# Run Queue

Processar as stories na fila batch sequencialmente ou em paralelo.

## Argumentos

$ARGUMENTS (formato: [--parallel N] [--auto] [--resume])
- **--parallel N** (opcional): Processar N stories em paralelo. Padrao: 1 (sequencial)
- **--auto** (opcional): Iniciar o processamento imediatamente sem confirmacao
- **--resume** (opcional): Retomar a partir do ultimo checkpoint

## Modo Plano

> **O modo plano é recomendado.** Claude ativa o modo plano para estruturar a abordagem, identificar dependências e apresentar uma estratégia de geração antes de criar artefatos.

## Processo

### Etapa 1: Carregar a fila

1. Ler `.bmad/batch-queue.yaml`
2. Obter todas as stories com status `pending`
3. Ordenar por prioridade

### Etapa 2: Verificar as dependencias

Para cada story:
- Verificar se as dependencias estao concluidas
- Ignorar se bloqueada por uma story pendente
- Sinalizar se bloqueada por uma story falhada

### Etapa 3: Processar as stories

Para cada story elegivel:
1. Marcar como `running`
2. Definir o timestamp `started_at`
3. Executar o workflow de desenvolvimento:
   - Transicao para in-progress
   - Ciclo TDD (red → green → refactor)
   - Executar os testes
   - Code review
   - Validacao do quality gate
4. Marcar como `completed` ou `failed`
5. Atualizar o checkpoint

### Etapa 4: Tratar as falhas

Se uma story falhar:
- Marcar como `failed` com mensagem de erro
- Verificar o parametro `resume_on_failure`
- Continuar ou parar de acordo com a config

### Etapa 5: Relatar os resultados

Exibir o status final e as metricas.

## Formato de Saida

### Processamento

```
═══════════════════════════════════════════════════════
              Processamento da Fila Batch
═══════════════════════════════════════════════════════

Modo: Sequencial
Fila: 5 pendentes

Processando:
──────────────────────────────────────────────────────

[1/5] US-010: Cadastro de usuario
      Iniciando... ✅
      TDD Red → Green → Refactor ✅
      Testes passando ✅
      Quality gate ✅
      Concluido em 45 min

      Checkpoint salvo.

[2/5] US-011: Login de usuario
      Iniciando... ✅
      TDD Red → Green → Refactor ✅
      Testes passando ✅
      Quality gate ✅
      Concluido em 38 min

      Checkpoint salvo.

[3/5] US-012: Pagina de perfil
      Iniciando... ✅
      TDD Red... 🔄 em andamento

      (Ctrl+C para pausar, retomara a partir do checkpoint)
```

### Concluido

```
═══════════════════════════════════════════════════════
              Fila Batch Concluida
═══════════════════════════════════════════════════════

Resultados:
──────────────────────────────────────────────────────
✅ Concluido: 5
❌ Falhou:    0
⏭️ Ignorado: 0

Stories processadas:
| Story | Status | Duracao |
|-------|--------|---------|
| US-010 | ✅ done | 45 min |
| US-011 | ✅ done | 38 min |
| US-012 | ✅ done | 52 min |
| US-013 | ✅ done | 28 min |
| US-014 | ✅ done | 35 min |

Tempo total: 3h 18min
Media por story: 40 min

Status do Sprint:
──────────────────────────────────────────────────────
📋 Backlog:     2
🎯 Ready:       0
🔄 Em andamento: 0
👀 Review:      0
✅ Done:        8

Comandos:
  /sprint:status --bmad    Ver o status atualizado
  /gate:report          Relatorio de qualidade
═══════════════════════════════════════════════════════
```

### Com Falhas

```
═══════════════════════════════════════════════════════
              Fila Batch Interrompida
═══════════════════════════════════════════════════════

Resultados:
──────────────────────────────────────────────────────
✅ Concluido: 3
❌ Falhou:    1
⏭️ Ignorado: 1 (dependencia falhou)

Detalhes da falha:
──────────────────────────────────────────────────────
❌ US-012: Pagina de perfil
   Erro: Testes falhando em ProfileController
   Fase TDD: red
   Ultimo checkpoint: TASK-033

   Stack trace:
   AssertionError: Expected 200, got 401
   at ProfileControllerTest.testGetProfile

Acoes:
──────────────────────────────────────────────────────
1. Corrigir o teste falhando
2. Retomar o processamento:
   /project:run-queue --resume

Ou resetar e retentar:
   /project:queue-reset US-012
   /project:run-queue
═══════════════════════════════════════════════════════
```

### Modo Paralelo

```
═══════════════════════════════════════════════════════
              Processamento da Fila Batch
═══════════════════════════════════════════════════════

Modo: Paralelo (3 workers)
Fila: 5 pendentes

Processando:
──────────────────────────────────────────────────────

Worker 1: US-010 - Cadastro de usuario 🔄
Worker 2: (aguardando dependencias)
Worker 3: (aguardando dependencias)

[10:05] US-010 iniciado
[10:08] US-010: Fase TDD Green
[10:12] US-010: Testes passando
[10:15] US-010 concluido ✅

[10:15] Dependencias resolvidas, iniciando batch paralelo:
Worker 1: US-011 - Login de usuario 🔄
Worker 2: US-012 - Pagina de perfil 🔄
Worker 3: US-014 - Verificacao de email 🔄

[10:20] US-014 concluido ✅
[10:22] US-011 concluido ✅
Worker 3: US-013 - Redefinicao de senha 🔄 (deps: US-010, US-011 ✅)
[10:25] US-012 concluido ✅
[10:30] US-013 concluido ✅

Todos os workers concluidos.
═══════════════════════════════════════════════════════
```

## Exemplo

```
/project:run-queue
/project:run-queue --auto
/project:run-queue --parallel 3
/project:run-queue --resume
```

## Configuracao

Parametros da fila em `.bmad/batch-queue.yaml`:

```yaml
execution:
  mode: "sequential"  # ou "parallel"
  parallel_limit: 3
  resume_on_failure: true
  checkpoint_interval: 1
  timeout_per_story: 3600

settings:
  auto_retry: true
  max_retries: 2
  retry_delay: 60
```

## Checkpoints

Os checkpoints sao salvos apos cada story:
```yaml
checkpoints:
  last_completed: "US-012"
  timestamp: "2026-01-29T14:30:00Z"
  stories_completed: 3
  stories_failed: 0
```

Retomar a partir do checkpoint:
```
/project:run-queue --resume
```
