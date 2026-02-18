---
description: Exibir o relatorio completo dos quality gates
argument-hint: [--detailed]
---

# Relatorio Quality Gates

Gerar um relatorio completo de todos os quality gates BMAD.

## Argumentos

$ARGUMENTS (formato: [--detailed])
- **--detailed** (opcional): Incluir os detalhes de validacao para cada gate

## Processo

### Etapa 1: Identificar os gates aplicaveis

Determinar quais gates se aplicam de acordo com o estado do projeto:
- Gate PRD: Se arquivo PRD existe
- Gate Tech Spec: Se arquivo tech spec existe
- Gate Backlog: Se existem stories
- Gate Sprint Ready: Se metadados de sprint existem
- Gates Story: Para cada story in-progress/review

### Etapa 2: Executar as validacoes

Executar cada validador de gate aplicavel.

### Etapa 3: Agregar os resultados

Compilar os resultados em um relatorio resumido.

### Etapa 4: Gerar as recomendacoes

Com base nas falhas, sugerir acoes prioritarias.

## Formato de Saida

```
═══════════════════════════════════════════════════════
            Relatorio Quality Gates BMAD
═══════════════════════════════════════════════════════

Projeto: claude-craft
Sprint: sprint-3 - Gestao de Usuarios
Gerado: 2026-01-29 10:00:00

Resumo dos Gates:
══════════════════════════════════════════════════════
| Gate | Limite | Pontuacao | Status |
|------|--------|-----------|--------|
| PRD | 80% | 90% | ✅ APROVADO |
| Tech Spec | 90% | 92% | ✅ APROVADO |
| Backlog | 6/6 | 5.8/6 media | ⚠️ ALERTA |
| Sprint Ready | 100% | 100% | ✅ APROVADO |
| Story DoD | 100% | variavel | 📊 |

Status DoD por Story:
──────────────────────────────────────────────────────
| Story | Status | Pontuacao DoD | Gate |
|-------|--------|---------------|------|
| US-010 | in-progress | 45% | ⏳ |
| US-011 | in-progress | 60% | ⏳ |
| US-012 | review | 85% | ⚠️ |
| US-013 | done | 100% | ✅ |

Saude Geral: 🟢 Boa
──────────────────────────────────────────────────────
4/5 gates aprovados
8/10 stories no caminho certo
Sem bloqueadores criticos

Recomendacoes:
──────────────────────────────────────────────────────
1. ⚠️ US-002 sem story points (INVEST: E)
   Executar: /project:update-story US-002 --points 3

2. ⚠️ US-012 necessita de revisao de codigo para conclusao
   Criar uma PR e solicitar revisao

Comandos:
  /gate:validate-prd       Reexecutar gate PRD
  /gate:validate-backlog   Reexecutar gate backlog
  /gate:validate-story US-012  Verificar story especifica
═══════════════════════════════════════════════════════
```

## Exemplo

```
/gate:report
/gate:report --detailed
```

## Próximo passo

```
╔══════════════════════════════════════════════════════════╗
║                    PRÓXIMO PASSO                         ║
╠══════════════════════════════════════════════════════════╣
║                                                          ║
║  Executar a gate específica que precisa de atenção:      ║
║                                                          ║
║  • /gate:validate-prd      — Gate qualidade PRD          ║
║  • /gate:validate-techspec — Gate spec técnica           ║
║  • /gate:validate-backlog  — Gate backlog                ║
║  • /gate:validate-sprint   — Gate prontidão sprint       ║
║  • /gate:validate-story    — Gate DoD story              ║
║                                                          ║
╚══════════════════════════════════════════════════════════╝
```
