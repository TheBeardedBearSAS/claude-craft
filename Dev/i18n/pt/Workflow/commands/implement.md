---
name: workflow-implement
description: Executar a fase de Implementação - desenvolvimento por sprint com TDD/BDD
arguments:
  - name: sprint
    description: Número específico do sprint a trabalhar
    required: false
---

# /workflow:implement

## Missão

Executar a fase de Implementação do fluxo de trabalho de desenvolvimento. Esta fase foca-se no desenvolvimento sprint a sprint com práticas de TDD/BDD, seguindo o design técnico estabelecido nas fases anteriores.

## Quando Usar

- Após a conclusão de `/workflow:design` (tracks Standard/Enterprise)
- Após `/workflow:init` para o track Quick Flow
- Quando estiver pronto para começar a codar

## Pré-requisitos

Para os tracks Standard/Enterprise:
- Especificação Técnica existente em `project-management/tech-spec.md`
- Backlog existente em `project-management/backlog/`
- Estrutura de sprints definida em `project-management/sprints/`

Para o Quick Flow:
- Compreensão clara do bug ou funcionalidade a implementar

## Modo de Planejamento

> **O modo de planejamento é obrigatório.** Antes de executar, o Claude ativa o modo de planejamento para analisar o código impactado, propor um plano de implementação e aguardar a sua validação antes de realizar qualquer alteração.

## Fluxo de Trabalho

### Etapa 1: Configuração da Implementação

```
╔══════════════════════════════════════════════════════════╗
║           FASE DE IMPLEMENTAÇÃO - INICIANDO               ║
╠══════════════════════════════════════════════════════════╣
║ Track: Standard                                           ║
║ Fase: 4 de 4 - Implementação                              ║
║                                                           ║
║ Objetivos:                                                ║
║ • Executar desenvolvimento dos sprints com TDD/BDD        ║
║ • Implementar user stories seguindo a especificação téc.  ║
║ • Manter qualidade do código e cobertura de testes        ║
║ • Concluir a Definição de Pronto para cada story          ║
╚══════════════════════════════════════════════════════════╝
```

### Etapa 2: Seleção do Sprint

```
╔══════════════════════════════════════════════════════════╗
║               VISÃO GERAL DOS SPRINTS                     ║
╠══════════════════════════════════════════════════════════╣
║                                                           ║
║ Sprints Disponíveis:                                      ║
║                                                           ║
║ ┌─────────────────────────────────────────────────────┐  ║
║ │ Sprint 1: Walking Skeleton                           │  ║
║ │ Status: Pronto para iniciar                          │  ║
║ │ Stories: 5 | Pontos: 21                              │  ║
║ │ Foco: Infraestrutura + primeira feature ponta a ponta│  ║
║ └─────────────────────────────────────────────────────┘  ║
║                                                           ║
║ ┌─────────────────────────────────────────────────────┐  ║
║ │ Sprint 2: Funcionalidades Principais                 │  ║
║ │ Status: Planejado                                    │  ║
║ │ Stories: 6 | Pontos: 28                              │  ║
║ │ Foco: Gestão de usuários, autenticação               │  ║
║ └─────────────────────────────────────────────────────┘  ║
║                                                           ║
║ ┌─────────────────────────────────────────────────────┐  ║
║ │ Sprint 3: Integração de Pagamento                    │  ║
║ │ Status: Planejado                                    │  ║
║ │ Stories: 4 | Pontos: 24                              │  ║
║ │ Foco: Integração Stripe, fluxo de checkout           │  ║
║ └─────────────────────────────────────────────────────┘  ║
║                                                           ║
║ Selecionar sprint para trabalhar (padrão: Sprint 1)       ║
╚══════════════════════════════════════════════════════════╝
```

### Etapa 3: Redirecionamento para Desenvolvimento do Sprint

Para execução completa do sprint, este comando redireciona para o comando especializado sprint-dev:

```
╔══════════════════════════════════════════════════════════╗
║           INICIANDO DESENVOLVIMENTO DO SPRINT             ║
╠══════════════════════════════════════════════════════════╣
║                                                           ║
║ Invocando: /sprint:dev sprint-001-walking-skeleton        ║
║                                                           ║
║ Funcionalidades do Modo de Desenvolvimento de Sprint:     ║
║ • Modo de planejamento obrigatório antes de cada tarefa   ║
║ • Ciclo TDD: RED → GREEN → REFACTOR                       ║
║ • Atualizações automáticas de status                      ║
║ • Commits convencionais com referências às stories        ║
║ • Validação da Definição de Pronto                        ║
║                                                           ║
╚══════════════════════════════════════════════════════════╝
```

### Etapa 4: Orientações de Implementação

Forneça contexto da fase de design:

```
╔══════════════════════════════════════════════════════════╗
║           CONTEXTO DE IMPLEMENTAÇÃO                       ║
╠══════════════════════════════════════════════════════════╣
║                                                           ║
║ Da Especificação Técnica:                                 ║
║ ├── Arquitetura: Clean Architecture (Hexagonal)           ║
║ ├── Estilo de API: REST com JSON:API                      ║
║ ├── Auth: JWT com refresh tokens                          ║
║ ├── Banco de dados: PostgreSQL com Doctrine ORM           ║
║ └── Testes: PHPUnit + Jest + Playwright                   ║
║                                                           ║
║ ADRs Relevantes:                                          ║
║ ├── ADR-001: Escolha do banco de dados (PostgreSQL)       ║
║ ├── ADR-002: Estilo de API (REST)                         ║
║ └── ADR-003: Autenticação (JWT)                           ║
║                                                           ║
║ Padrões de Código:                                        ║
║ ├── Seguir padrões existentes no código                   ║
║ ├── Meta de cobertura de testes: 80%                      ║
║ └── Utilizar regras específicas de tecnologia:            ║
║     /symfony:*, /react:*, etc.                            ║
║                                                           ║
╚══════════════════════════════════════════════════════════╝
```

### Etapa 5: Modo Quick Flow

Para o track Quick Flow (correção de bugs, pequenas funcionalidades):

```
╔══════════════════════════════════════════════════════════╗
║           QUICK FLOW - IMPLEMENTAÇÃO DIRETA               ║
╠══════════════════════════════════════════════════════════╣
║                                                           ║
║ Sem estrutura de sprint necessária para o Quick Flow.     ║
║                                                           ║
║ Comandos Disponíveis:                                     ║
║                                                           ║
║ Para Correção de Bugs:                                    ║
║ • /qa:tdd        - Corrigir com abordagem TDD             ║
║                                                           ║
║ Para Pequenas Funcionalidades:                            ║
║ • /{tech}:* commands         - Específicos por tecnologia ║
║                                                           ║
║ Rastreamento:                                             ║
║ • /project:add-task          - Registrar como tarefa      ║
║ • /project:move-task done    - Marcar como concluído      ║
║                                                           ║
╚══════════════════════════════════════════════════════════╝
```

### Etapa 6: Conclusão do Sprint

Após a conclusão do sprint:

```
╔══════════════════════════════════════════════════════════╗
║           SPRINT CONCLUÍDO                                ║
╠══════════════════════════════════════════════════════════╣
║                                                           ║
║ Sprint 1: Walking Skeleton                                ║
║ Status: ✅ Concluído                                      ║
║                                                           ║
║ Métricas:                                                 ║
║ ├── Stories concluídas: 5/5                               ║
║ ├── Pontos entregues: 21                                  ║
║ ├── Velocidade: 21 pts/sprint                             ║
║ ├── Cobertura de testes: 82%                              ║
║ └── Commits: 23                                           ║
║                                                           ║
║ Artefatos:                                                ║
║ ├── sprint-review.md gerado                               ║
║ └── template sprint-retro.md pronto                       ║
║                                                           ║
║ ─────────────────────────────────────────────────────────║
║ PRÓXIMAS AÇÕES:                                           ║
║ ─────────────────────────────────────────────────────────║
║                                                           ║
║ 1. /workflow:review     - Conduzir a revisão do sprint    ║
║ 2. /workflow:retro      - Realizar a retrospectiva        ║
║ 3. /workflow:implement 2 - Iniciar o Sprint 2             ║
║                                                           ║
║ Ou verificar o progresso geral: /workflow:status          ║
╚══════════════════════════════════════════════════════════╝
```

### Etapa 7: Conclusão do Fluxo de Trabalho

Quando todos os sprints estiverem concluídos:

```
╔══════════════════════════════════════════════════════════╗
║           FASE DE IMPLEMENTAÇÃO CONCLUÍDA                 ║
╠══════════════════════════════════════════════════════════╣
║                                                           ║
║ Todos os sprints planejados foram concluídos!             ║
║                                                           ║
║ Resumo do Projeto:                                        ║
║ ├── Total de Sprints: 4                                   ║
║ ├── Total de Stories: 18                                  ║
║ ├── Total de Pontos: 89                                   ║
║ ├── Velocidade Média: 22 pts/sprint                       ║
║ ├── Cobertura de Testes: 84%                              ║
║ └── Total de Commits: 87                                  ║
║                                                           ║
║ Próximos Passos:                                          ║
║ • /common:release-checklist  - Preparar para o release    ║
║ • /common:generate-changelog - Gerar notas de versão      ║
║ • Implantar em staging/produção                           ║
║                                                           ║
║ ═══════════════════════════════════════════════════════  ║
║           🎉 FLUXO DE TRABALHO DO PROJETO CONCLUÍDO! 🎉  ║
║ ═══════════════════════════════════════════════════════  ║
╚══════════════════════════════════════════════════════════╝
```

## Agentes Envolvidos

- **tech-lead**: Decomposição de tarefas, orientação de arquitetura
- **tdd-coach**: Orientação de metodologia TDD/BDD
- **{tech}-reviewer**: Revisão de código (Symfony, Flutter, React, Python, ReactNative)
- **devops-engineer**: CI/CD e implantação

## Comandos Relacionados

- `/workflow:design` - Fase anterior
- `/workflow:status` - Verificar o progresso
- `/sprint:dev` - Modo completo de desenvolvimento de sprint
- `/qa:tdd` - Correção rápida de bugs
- `/workflow:review` - Cerimônia de revisão do sprint
- `/workflow:retro` - Retrospectiva do sprint
