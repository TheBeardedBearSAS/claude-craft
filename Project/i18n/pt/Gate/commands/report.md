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

## Validações Passo a Passo

### Validação PRD

```
Arquivo: docs/prd.md
Limiar: 80%
Critérios:
  ✅ Declaração do problema (15%)
  ✅ Usuários-alvo (15%)
  ✅ Objetivos (15%)
  ✅ Métricas de sucesso (15%)
  ✅ Escopo/Limites (10%)
  ✅ Visão geral das User Stories (10%)
  ✅ Hipóteses (10%)
  ⚠️ Riscos (10%) - Parcial
```

### Validação Tech Spec

```
Arquivo: docs/tech-spec.md
Limiar: 90%
Critérios:
  ✅ Visão geral da arquitetura (12%)
  ✅ Diagrama de arquitetura (10%)
  ✅ Componentes (12%)
  ✅ Modelo de dados (10%)
  ✅ Contratos de API (10%)
  ✅ Segurança (12%)
  ✅ Performance (8%)
  ⚠️ Tratamento de erros (8%) - Básico
  ✅ Estratégia de testes (10%)
  ✅ Implantação (8%)
```

### Ações por Prioridade

```
Prioridade 1 (Bloqueante): Nenhuma
Prioridade 2 (Deve ser corrigido):
  1. US-002: Adicionar estimativa em story points
  2. US-008: Dividir em stories menores
Prioridade 3 (Desejável):
  1. Adicionar mitigações de risco ao PRD
  2. Melhorar o tratamento de erros na tech spec
```

## Configuração dos Gates

Os gates são configurados em `.bmad/gates/`:
- `prd-gate.yaml`
- `techspec-gate.yaml`
- `backlog-gate.yaml`
- `story-gate.yaml`
- `sprint-ready-gate.yaml`

## Integração

O relatório pode ser:
1. Gerado sob demanda por meio deste comando
2. Incluído na retrospectiva do sprint
3. Usado para monitorar a saúde do projeto
4. Exportado para relatórios às partes interessadas

## Detalhes dos Gates DoD Stories

```
US-010: Registro de usuário
  Status: in-progress | Score DoD: 45%
  ❌ Tarefas: 2/5 | ❌ Testes: fase vermelha
  ⚠️ CA: 1/3    | ❌ Revisão: não iniciada

US-011: Login de usuário
  Status: in-progress | Score DoD: 60%
  ⚠️ Tarefas: 3/4 | ✅ Testes: fase verde
  ⚠️ CA: 2/3    | ❌ Revisão: não iniciada

US-012: Página de perfil
  Status: review | Score DoD: 85%
  ✅ Tarefas: 4/4 | ✅ Testes: fase refactoring
  ✅ CA: 3/3    | ⚠️ Revisão: aprovação pendente

US-013: Redefinição de senha
  Status: done | Score DoD: 100%
  ✅ Todos os critérios atendidos
```
## Relatório por Gate — Detalhes Completos

### Stories do Backlog com Problemas

| Story | INVEST | Problema | Ação |
|-------|--------|----------|------|
| US-002 | 5/6 | Sem story points | Adicionar estimativa |
| US-008 | 5/6 | > 8 pontos (muito grande) | Dividir |

### Status Sprint Ready — Detalhes

| Critério | Status | Observações |
|----------|--------|-------------|
| Metadados Sprint | ✅ | sprint-3 configurado |
| Objetivo Sprint | ✅ | Gestão de usuários |
| Stories Prontas | ✅ | 5 stories ready-for-dev |
| Stories Estimadas | ✅ | Todas estimadas |
| Capacidade (84%) | ✅ | 42/50 pontos disponíveis |
| Dependências | ✅ | Nenhuma não resolvida |

### Monitoramento e Alertas

O sistema de quality gates emite alertas quando:
- Um gate crítico falha (PRD < 80%, Tech Spec < 90%)
- Uma story ultrapassa o tempo estimado sem avançar
- Dependências circulares entre stories são detectadas
- A capacidade do sprint supera 90%

**Frequência recomendada:**
- Gates PRD/TechSpec: Uma vez no início do sprint
- Gate Backlog: Antes de cada sessão de refinement
- Gate Sprint Ready: 48h antes do início do sprint
- Gates Story DoD: Diariamente para stories em andamento
