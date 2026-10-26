---
name: workflow-design
description: "Executar a fase de Design (Solutioning) - gerar a especificação técnica (padrão) ou a constituição do projeto (--constitution)"
argument-hint: "[--constitution] [--continue]"
arguments:
  - name: constitution
    description: Gerar a constituição do projeto (project-management/constitution.md) em vez da especificação técnica
    required: false
  - name: continue
    description: Continuar de onde parou
    required: false
---

# /workflow:design

## Missão

Executar a fase de Design (Solutioning): transformar o PRD em Especificação Técnica, diagramas de arquitetura, modelo de dados, design de API e ADR. Com `--constitution`, registrar em vez disso as decisões imutáveis do projeto em uma Constituição do projeto.

## Uso

| Invocação | O que faz | Substitui |
|-----------|-----------|-----------|
| `/workflow:design` | Lê `project-management/prd.md`, escreve `project-management/tech-spec.md` + arquivos de arquitetura + ADR | `/workflow:design` |
| `/workflow:design --constitution` | Escreve `project-management/constitution.md` (decisões imutáveis, usada por `/gate:check alignment`) | `/workflow:design --constitution` |
| `/workflow:design --continue` | Retoma uma sessão de design interrompida | - |

Ordem canônica dos documentos: PRD → spec técnica → backlog → sprint.

## Quando usar

- Tracks **Standard** e **Enterprise**
- Depois de `/workflow:plan --only=prd`
- `--constitution`: no início do projeto (ou sempre que for preciso travar decisões)

## Pré-requisitos

- O PRD existe em `project-management/prd.md` (`--constitution`: apenas fontes opcionais, veja abaixo)
- Stack tecnológica identificada (perguntada de forma interativa em projetos novos)

## Plan Mode

> **O plan mode é obrigatório.** O Claude ativa o plan mode para analisar o código impactado, propor uma estratégia de geração e aguardar sua validação antes de criar artefatos.

## Workflow: Spec técnica (padrão)

### Passo 1: Análise do PRD

```
╔══════════════════════════════════════════════════════════╗
║            FASE DE DESIGN - INÍCIO                        ║
║ Track: Standard | Fase: 3 de 4 - Design (Solutioning)     ║
║ Carregando project-management/prd.md ...                  ║
║ ├── Requisitos funcionais: 12                             ║
║ ├── Requisitos não funcionais: 8                          ║
║ └── Integrações necessárias: 2                            ║
╚══════════════════════════════════════════════════════════╝
```

Extrair do PRD: requisitos funcionais (`FR-xxx`), requisitos não funcionais (desempenho, segurança, escalabilidade), personas e jornadas, restrições e premissas, integrações. Se `project-management/analysis/constraints.md` existir (Enterprise), carregá-lo também.

### Passo 2: Análise da base de código

Base de código existente: detectar a stack (backend, frontend, banco de dados, cache, infraestrutura) e os padrões existentes (arquitetura, estilo de API, auth, testes) e manter a coerência com eles.

Projeto novo: fazer as perguntas tecnológicas.

```
┌─────────────────────────────────────────────────────────┐
│ PERGUNTAS - Stack tecnológica                            │
├─────────────────────────────────────────────────────────┤
│ 1. Framework backend preferido? (Symfony/Laravel/Node)   │
│ 2. Framework frontend? (React/Vue/Angular/Nenhum)        │
│ 3. Banco de dados preferido? (PostgreSQL/MySQL/MongoDB)  │
│ 4. Destino de deploy? (Docker/K8s/Serverless/VPS)        │
│ 5. Integrações existentes a considerar?                  │
└─────────────────────────────────────────────────────────┘
```

### Passo 3: Perguntas de arquitetura

```
┌─────────────────────────────────────────────────────────┐
│ PERGUNTAS - Decisões de arquitetura                      │
├─────────────────────────────────────────────────────────┤
│ 1. Monólito ou microsserviços?                           │
│ 2. Estilo de API preferido? (REST/GraphQL/gRPC)          │
│ 3. Escala esperada? (usuários, requisições/s)            │
│ 4. Funcionalidades em tempo real? (WebSockets/SSE)       │
│ 5. Necessidades de armazenamento? (S3/local/CDN)         │
│ 6. Necessidades de jobs em segundo plano?                │
│ 7. Integrações de terceiros? (pagamentos, e-mail, etc.)  │
└─────────────────────────────────────────────────────────┘
```

### Passo 4: Tarefas de design

Executar em ordem:

| # | Tarefa | Saída |
|---|--------|-------|
| 1 | Spec técnica (template `.claude/templates/project/tech-spec.md`) | `project-management/tech-spec.md` |
| 2 | Diagramas C4 (contexto, contêiner, componente) | `project-management/architecture/c4-*.md` |
| 3 | Modelo de dados: ERD (Mermaid `erDiagram`) + schemas; validar relacionamentos, entidades faltantes, indexação | `project-management/architecture/erd.md` |
| 4 | Design de API: endpoints derivados dos FR-xxx e das personas, payloads, erros, auth | `project-management/architecture/api.md` |
| 5 | Segurança e desempenho: mitigações OWASP, authN/authZ, criptografia, rate limiting, lacunas LGPD/GDPR | `project-management/architecture/security.md` |
| 6 | ADR para as decisões-chave (banco de dados, estilo de API, autenticação) | `docs/adr/ADR-00x-*.md` |
| 7 | Estratégia de testes (meta de cobertura 80 %), CI/CD e deploy, monitoramento | em `tech-spec.md` |

Exemplo de checklist de segurança:

```
✅ Autenticação: JWT com cookies HttpOnly
✅ Autorização: RBAC com policies
✅ Criptografia de dados: AES-256 em repouso, TLS 1.3 em trânsito
✅ Validação de entradas: validação DTO + sanitização
✅ Rate limiting: 100 req/min por usuário
⚠️  Conformidade GDPR: falta uma política de retenção de dados
```

### Passo 5: Gate de revisão do design

- A spec técnica cobre todos os requisitos do PRD (cada `FR-xxx` é rastreável)
- A arquitetura suporta os NFR (desempenho, segurança)
- O modelo de dados trata todas as entidades; o design de API cobre todas as user stories
- Segurança, estratégia de testes e abordagem de deploy documentados
- ADR completos e justificados

Oferecer iterações: estratégia de cache, documentação de API detalhada, pipeline de deploy.

### Passo 6: Conclusão

```
╔══════════════════════════════════════════════════════════╗
║            FASE DE DESIGN CONCLUÍDA                       ║
║ ✅ project-management/tech-spec.md                        ║
║ ✅ project-management/architecture/ (c4, erd, api, sec.)  ║
║ ✅ docs/adr/ (3 ADR)                                      ║
║ • 24 endpoints de API • 8 entidades • 3 integrações       ║
║                                                           ║
║ PRÓXIMO: /workflow:plan --only=backlog                    ║
║ DEPOIS: /workflow:start 1                                 ║
╚══════════════════════════════════════════════════════════╝
```

O backlog lê `project-management/prd.md` e, depois de criada, `project-management/tech-spec.md`. Após o design, recomendar `/workflow:plan --only=backlog` e em seguida `/workflow:start 1`.

## Workflow: Constituição (`--constitution`)

### Fase 1: Descoberta do contexto

Análise automática de: `README.md`, `project-management/prd.md`, `project-management/tech-spec.md`, estrutura da base de código (padrões, convenções) e configuração `.claude/`. Listar as fontes encontradas.

### Fase 2: Esclarecimento interativo

Perguntar ao usuário, por tema, para preencher as lacunas:

| Tema | Perguntas |
|------|-----------|
| Visão e Missão | Visão em uma frase; o quê, para quem, por quê; objetivos inegociáveis; o que faria o projeto fracassar |
| Restrições técnicas | Tecnologias travadas; padrão de arquitetura obrigatório; restrições de infraestrutura; integrações de terceiros obrigatórias |
| Princípios de design | Padrões obrigatórios; padrões/práticas proibidos; padrões de código; estratégia de testes exigida |
| Requisitos não funcionais | Metas de desempenho (latência, carga); segurança; conformidade (GDPR, SOC2); disponibilidade/uptime |
| Limites | Fora do escopo; sistemas externos; limites de equipe e responsabilidades; quem pode emendar a constituição |

### Fase 3: Geração

1. Carregar o template `.claude/templates/project/constitution.md`
2. Preencher visão, missão e objetivos inegociáveis
3. Travar a stack técnica (tecnologias e versões)
4. Registrar os padrões obrigatórios e proibidos
5. Anotar as metas de desempenho, segurança e conformidade
6. Documentar exclusões, limites de integração e o processo de emenda

### Fase 4: Revisão e ratificação

Saída: `project-management/constitution.md` com as seções Visão e Missão, Restrições técnicas, Princípios de design, Requisitos não funcionais, Limites, Processo de emenda. Oferecer ajustar as decisões travadas, adicionar restrições ou refinar os limites. As notas de descoberta opcionais vão para `project-management/analysis/discovery-notes.md`.

A constituição é a referência usada por `/gate:check alignment`. Próximos passos: `/workflow:plan --only=prd` se ainda não houver PRD; caso contrário, executar o `/workflow:design` padrão.

## Agentes envolvidos

- **tech-lead**: design técnico global e criação dos ADR
- **api-designer**: design de API REST/GraphQL
- **database-architect**: modelo de dados e design do schema
- **ui-designer**: arquitetura frontend (se aplicável)
- **devops-engineer**: design do deploy e da infraestrutura

## Arquivos de saída

| Arquivo | Finalidade |
|---------|------------|
| `project-management/tech-spec.md` | Especificação técnica completa |
| `project-management/constitution.md` | Constituição do projeto (`--constitution`) |
| `project-management/architecture/c4-*.md` | Diagramas de arquitetura C4 |
| `project-management/architecture/erd.md` | Diagrama entidade-relacionamento |
| `project-management/architecture/api.md` | Documentação dos endpoints de API |
| `project-management/architecture/security.md` | Design de segurança |
| `docs/adr/*.md` | Architecture Decision Records |

## Exemplo de sessão

```
User: /workflow:design

Claude: Carregando project-management/prd.md: 12 FR, 8 NFR.
Detectado: Symfony + React + PostgreSQL.
❓ A API atual é REST. Manter REST ou migrar para GraphQL?
> Manter REST
[... Q&A interativo ...]
✅ Spec técnica gerada: project-management/tech-spec.md
Próximo: /workflow:plan --only=backlog, depois /workflow:start 1
```

## Comandos relacionados

- `/workflow:plan` - Fase anterior (`--only=prd`, `--only=backlog`)
- `/workflow:start` - Iniciar o primeiro sprint
- `/workflow:implement` - Fase de implementação
- `/workflow:status` - Verificar o progresso
- `/gate:check` - Quality gates (`alignment` usa a constituição)
- `/common:architecture-decision` - Criar ADR individuais
