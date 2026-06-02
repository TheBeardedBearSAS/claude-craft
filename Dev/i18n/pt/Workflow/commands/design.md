---
name: workflow-design
description: Executar a fase de Design (Solução) - especificação técnica e arquitetura
arguments:
  - name: continue
    description: Continuar de onde parou
    required: false
---

# /workflow:design

## Missão

Executar a fase de Design (Solução) do fluxo de trabalho de desenvolvimento. Esta fase foca-se na criação da Especificação Técnica, no design da arquitetura e na documentação das principais decisões técnicas.

## Quando Usar

- Tracks **Standard** e **Enterprise**
- Após a conclusão de `/workflow:plan`
- Quando o PRD e o backlog estiverem prontos

## Pré-requisitos

- PRD existente em `project-management/prd.md`
- Backlog existente em `project-management/backlog/`

## Modo de Planejamento

> **O modo de planejamento é recomendado.** O Claude ativa o modo de planejamento para estruturar a abordagem, identificar dependências e apresentar uma estratégia de geração antes de criar os artefatos.

## Fluxo de Trabalho

### Etapa 1: Configuração do Design

```
╔══════════════════════════════════════════════════════════╗
║              FASE DE DESIGN - INICIANDO                   ║
╠══════════════════════════════════════════════════════════╣
║ Track: Standard                                           ║
║ Fase: 3 de 4 - Design (Solução)                           ║
║                                                           ║
║ Objetivos:                                                ║
║ • Criar Especificação Técnica a partir do PRD             ║
║ • Projetar arquitetura do sistema (diagramas C4)          ║
║ • Definir modelo de dados e design de API                 ║
║ • Documentar Registros de Decisão de Arquitetura (ADRs)   ║
║ • Planejar estratégia de testes                           ║
╚══════════════════════════════════════════════════════════╝
```

### Etapa 2: Carregamento dos Artefatos de Planejamento

```
╔══════════════════════════════════════════════════════════╗
║              CARREGANDO ARTEFATOS DE PLANEJAMENTO         ║
╠══════════════════════════════════════════════════════════╣
║                                                           ║
║ Análise do PRD:                                           ║
║ ├── ✅ prd.md carregado                                   ║
║ ├── Requisitos funcionais: 12                             ║
║ ├── Requisitos não-funcionais: 8                          ║
║ └── Integrações necessárias: 2                            ║
║                                                           ║
║ Resumo do Backlog:                                        ║
║ ├── ✅ backlog/ carregado                                 ║
║ ├── EPICs: 4                                              ║
║ ├── User Stories: 18                                      ║
║ └── Total de Story Points: 89                             ║
║                                                           ║
║ Restrições (se Enterprise):                               ║
║ └── ✅ analysis/constraints.md carregado                  ║
║                                                           ║
╚══════════════════════════════════════════════════════════╝
```

### Etapa 3: Tarefas de Design

Execute as tarefas de design na ordem indicada:

```
╔══════════════════════════════════════════════════════════╗
║                 TAREFAS DE DESIGN                         ║
╠══════════════════════════════════════════════════════════╣
║                                                           ║
║ □ Tarefa 1: Gerar Especificação Técnica                   ║
║   Comando: /project:generate-tech-spec                    ║
║   Saída: project-management/tech-spec.md                  ║
║                                                           ║
║ □ Tarefa 2: Design de Arquitetura                         ║
║   Criar diagramas C4 (contexto, container, componente)    ║
║   Saída: project-management/architecture/                 ║
║                                                           ║
║ □ Tarefa 3: Design do Modelo de Dados                     ║
║   DER e schema do banco de dados                          ║
║   Saída: project-management/architecture/erd.md           ║
║                                                           ║
║ □ Tarefa 4: Design de API                                 ║
║   Endpoints, payloads, autenticação                       ║
║   Saída: project-management/architecture/api.md           ║
║                                                           ║
║ □ Tarefa 5: Criar ADRs                                    ║
║   Documentar decisões técnicas principais                 ║
║   Saída: docs/adr/                                        ║
║                                                           ║
║ □ Tarefa 6: Revisão de Segurança                          ║
║   Checklist OWASP, estratégia de autenticação             ║
║   Saída: project-management/architecture/security.md      ║
║                                                           ║
╚══════════════════════════════════════════════════════════╝
```

### Etapa 4: Execução da Geração da Especificação Técnica

```
Iniciando /project:generate-tech-spec...

Analisando requisitos do PRD...
Detectando padrões do código existente...

[Fluxo de geração da Especificação Técnica executa com perguntas interativas]

✅ Especificação Técnica criada: project-management/tech-spec.md
```

### Etapa 5: Diagramas de Arquitetura

Gere os diagramas de arquitetura C4:

```
╔══════════════════════════════════════════════════════════╗
║             DIAGRAMAS DE ARQUITETURA                      ║
╠══════════════════════════════════════════════════════════╣
║                                                           ║
║ C4 Nível 1 - Contexto do Sistema:                         ║
║ ┌─────────────────────────────────────────────────────┐  ║
║ │                                                     │  ║
║ │  [Usuário] ──────► [Nosso Sistema] ──────► [Stripe] │  ║
║ │                          │                          │  ║
║ │                          ▼                          │  ║
║ │                     [SendGrid]                      │  ║
║ │                                                     │  ║
║ └─────────────────────────────────────────────────────┘  ║
║                                                           ║
║ C4 Nível 2 - Container:                                   ║
║ ┌─────────────────────────────────────────────────────┐  ║
║ │                                                     │  ║
║ │  [React SPA] ──► [Symfony API] ──► [PostgreSQL]    │  ║
║ │                       │                             │  ║
║ │                       ▼                             │  ║
║ │                    [Redis]                          │  ║
║ │                                                     │  ║
║ └─────────────────────────────────────────────────────┘  ║
║                                                           ║
║ Arquivos criados:                                         ║
║ ├── architecture/c4-context.md                            ║
║ ├── architecture/c4-container.md                          ║
║ └── architecture/c4-component.md                          ║
║                                                           ║
╚══════════════════════════════════════════════════════════╝
```

### Etapa 6: Criação de ADRs

Documente as principais decisões de arquitetura:

```
╔══════════════════════════════════════════════════════════╗
║        REGISTROS DE DECISÃO DE ARQUITETURA (ADRs)         ║
╠══════════════════════════════════════════════════════════╣
║                                                           ║
║ ADRs Criados:                                             ║
║                                                           ║
║ ┌─────────────────────────────────────────────────────┐  ║
║ │ ADR-001: Escolha do Banco de Dados                   │  ║
║ │ Decisão: PostgreSQL                                  │  ║
║ │ Justificativa: conformidade ACID, suporte a JSON,    │  ║
║ │ já existente na infraestrutura                       │  ║
║ └─────────────────────────────────────────────────────┘  ║
║                                                           ║
║ ┌─────────────────────────────────────────────────────┐  ║
║ │ ADR-002: Estilo de API                               │  ║
║ │ Decisão: REST com JSON:API                           │  ║
║ │ Justificativa: expertise da equipe, cache, simplic.  │  ║
║ └─────────────────────────────────────────────────────┘  ║
║                                                           ║
║ ┌─────────────────────────────────────────────────────┐  ║
║ │ ADR-003: Autenticação                                │  ║
║ │ Decisão: JWT com refresh tokens                      │  ║
║ │ Justificativa: stateless, amigável ao mobile, padrão │  ║
║ └─────────────────────────────────────────────────────┘  ║
║                                                           ║
║ Arquivos: docs/adr/ADR-001.md, ADR-002.md, ADR-003.md    ║
║                                                           ║
╚══════════════════════════════════════════════════════════╝
```

### Etapa 7: Gate de Revisão do Design

```
╔══════════════════════════════════════════════════════════╗
║              GATE DE REVISÃO DO DESIGN                    ║
╠══════════════════════════════════════════════════════════╣
║                                                           ║
║ Checklist:                                                ║
║ ✅ Especificação Técnica cobre todos os requisitos do PRD ║
║ ✅ Arquitetura suporta RNFs (desempenho, segurança)       ║
║ ✅ Modelo de dados contempla todas as entidades           ║
║ ✅ Design de API cobre todas as user stories              ║
║ ✅ Considerações de segurança documentadas                ║
║ ✅ Estratégia de testes definida                          ║
║ ✅ Abordagem de implantação documentada                   ║
║                                                           ║
║ Perguntas de Revisão:                                     ║
║ 1. A arquitetura é adequada para a escala esperada?       ║
║ 2. Há alguma integração faltando?                         ║
║ 3. A abordagem de segurança é suficiente?                 ║
║ 4. Os ADRs estão completos e justificados?                ║
║                                                           ║
╚══════════════════════════════════════════════════════════╝
```

### Etapa 8: Conclusão da Fase

```
╔══════════════════════════════════════════════════════════╗
║              FASE DE DESIGN CONCLUÍDA                     ║
╠══════════════════════════════════════════════════════════╣
║                                                           ║
║ Artefatos Criados:                                        ║
║ ✅ tech-spec.md            Especificação Técnica          ║
║ ✅ architecture/                                          ║
║    ├── c4-context.md       Diagrama de contexto do sistema║
║    ├── c4-container.md     Diagrama de containers         ║
║    ├── c4-component.md     Diagrama de componentes        ║
║    ├── erd.md              Diagrama Entidade-Relacionamento║
║    ├── api.md              Design de API                  ║
║    └── security.md         Considerações de segurança     ║
║ ✅ docs/adr/               3 Registros de Decisão de Arq. ║
║                                                           ║
║ Resumo:                                                   ║
║ • 24 endpoints de API projetados                          ║
║ • 8 entidades de banco de dados definidas                 ║
║ • 3 integrações externas especificadas                    ║
║ • Meta de 80% de cobertura de testes estabelecida         ║
║                                                           ║
║ ─────────────────────────────────────────────────────────║
║ PRÓXIMA FASE: Implementação                               ║
║ Comando: /workflow:implement                              ║
║ ─────────────────────────────────────────────────────────║
║                                                           ║
║ Pronto para iniciar o desenvolvimento do Sprint 1!        ║
╚══════════════════════════════════════════════════════════╝
```

## Agentes Envolvidos

- **tech-lead**: Design técnico geral e criação de ADRs
- **api-designer**: Design de API REST/GraphQL
- **database-architect**: Design do modelo de dados e schema
- **ui-designer**: Arquitetura frontend (quando aplicável)
- **devops-engineer**: Design de implantação e infraestrutura

## Arquivos de Saída

| Arquivo | Finalidade |
|---------|-----------|
| `tech-spec.md` | Especificação Técnica completa |
| `architecture/c4-*.md` | Diagramas de arquitetura C4 |
| `architecture/erd.md` | Diagrama Entidade-Relacionamento |
| `architecture/api.md` | Documentação dos endpoints de API |
| `architecture/security.md` | Design de segurança |
| `docs/adr/*.md` | Registros de Decisão de Arquitetura |

## Comandos Relacionados

- `/workflow:plan` - Fase anterior
- `/workflow:implement` - Próxima fase
- `/workflow:status` - Verificar o progresso
- `/project:generate-tech-spec` - Geração direta da especificação técnica
- `/common:architecture-decision` - Criar ADRs individuais
