---
name: workflow-analyze
description: Executar a fase de Analise - pesquisa, exploracao e identificacao de restricoes
arguments:
  - name: focus
    description: Area especifica a analisar (mercado, tecnica, concorrentes)
    required: false
---

# /workflow:analyze

## Missao

Executar a fase de Analise do workflow Enterprise. Esta fase foca na pesquisa, exploracao e identificacao de restricoes antes do inicio do planejamento detalhado.

## Modo Plano

> O modo plano é ativado automaticamente quando o escopo abrange vários módulos ou requer investigação transversal.

## Quando Utilizar

- Projetos no track **Enterprise**
- Novas plataformas ou iniciativas de grande porte
- Quando o conhecimento do dominio e limitado
- Antes de se comprometer com uma abordagem tecnica

## Workflow

### Etapa 1: Configuracao da Analise

```
+==============================================================+
|            FASE DE ANALISE - INICIANDO                          |
+================================================================+
| Track: Enterprise                                               |
| Fase: 1 de 4 - Analise                                         |
|                                                                 |
| Objetivos:                                                      |
| - Compreender o dominio do problema                             |
| - Pesquisar solucoes existentes                                 |
| - Identificar restricoes tecnicas                               |
| - Documentar riscos e oportunidades                             |
+================================================================+
```

### Etapa 2: Areas de Pesquisa

**Perguntas de pesquisa guiadas:**

```
+-------------------------------------------------------------+
| PESQUISA DE DOMINIO                                           |
+-------------------------------------------------------------+
| 1. Qual problema estamos resolvendo?                          |
| 2. Quem sao os principais stakeholders?                       |
| 3. Quais sao os motivadores de negocio?                       |
| 4. Como se define o sucesso?                                  |
+-------------------------------------------------------------+

+-------------------------------------------------------------+
| PESQUISA DE MERCADO                                           |
+-------------------------------------------------------------+
| 1. Quais solucoes existentes ha?                              |
| 2. O que os concorrentes estao fazendo?                       |
| 3. Quais sao as melhores praticas do setor?                   |
| 4. Quais sao as tendencias emergentes?                        |
+-------------------------------------------------------------+

+-------------------------------------------------------------+
| PESQUISA TECNICA                                              |
+-------------------------------------------------------------+
| 1. Quais tecnologias poderiamos utilizar?                     |
| 2. Quais sao os requisitos de integracao?                     |
| 3. Quais sao as necessidades de escalabilidade?               |
| 4. Quais requisitos de seguranca/conformidade existem?        |
+-------------------------------------------------------------+
```

### Etapa 3: Pesquisa Context7 (Opcional)

Se o MCP Context7 estiver configurado, utilize-o para pesquisa tecnica:

```
Utilizando MCP Context7 para documentacao atualizada...

Pesquisando:
- Melhores praticas atuais da API Stripe
- Padroes de seguranca atuais para processamento de pagamentos
- Requisitos de conformidade PCI DSS
```

### Etapa 4: Identificacao de Restricoes

Documentar as restricoes descobertas:

```
+==============================================================+
|               RESTRICOES IDENTIFICADAS                          |
+================================================================+
|                                                                 |
| RESTRICOES TECNICAS:                                            |
| - Deve integrar com backend Symfony 7.x existente               |
| - Banco de dados: PostgreSQL (existente, nao pode mudar)        |
| - Deve suportar apps moveis via API existente                   |
|                                                                 |
| RESTRICOES DE NEGOCIO:                                          |
| - Orcamento: Limitado a equipe existente                        |
| - Prazo: MVP necessario no Q2 2026                              |
| - Deve manter compatibilidade retroativa                        |
|                                                                 |
| RESTRICOES REGULATORIAS:                                        |
| - Conformidade LGPD necessaria (usuarios BR)                    |
| - PCI DSS para processamento de pagamentos                     |
|                                                                 |
| RESTRICOES DE RECURSOS:                                         |
| - Equipe: 2 backend, 1 frontend developer                      |
| - Sem recurso dedicado de DevOps                                |
|                                                                 |
+================================================================+
```

### Etapa 5: Analise de Riscos e Oportunidades

```
+==============================================================+
|            RISCOS E OPORTUNIDADES                               |
+================================================================+
|                                                                 |
| RISCOS:                                                         |
| +---------+----------+------------+-------------------+         |
| | Risco   | Impacto  | Prob.      | Mitigacao          |        |
| +---------+----------+------------+-------------------+         |
| | Stripe  | Alto     | Baixa      | Provedor fallback  |        |
| | fora ar |          |            |                    |        |
| +---------+----------+------------+-------------------+         |
| | Atraso  | Medio    | Media      | Reducao do escopo  |        |
| | prazo   |          |            | do MVP             |        |
| +---------+----------+------------+-------------------+         |
|                                                                 |
| OPORTUNIDADES:                                                  |
| - Possibilidade de usar novos Payment Elements do Stripe        |
| - Potencial para expansao do modelo de assinatura               |
| - Pagamento mobile (Apple Pay, Google Pay) pronto               |
|                                                                 |
+================================================================+
```

### Etapa 6: Gerar Artefatos da Analise

Criar documentos de analise:

```
project-management/
└── analysis/
    ├── research-summary.md      # Principais descobertas
    ├── constraints.md           # Todas as restricoes identificadas
    ├── risks-opportunities.md   # Registro de riscos e oportunidades
    └── technical-options.md     # Avaliacao de tecnologias
```

### Etapa 7: Conclusao da Fase

```
+==============================================================+
|            FASE DE ANALISE CONCLUIDA                            |
+================================================================+
|                                                                 |
| Artefatos Criados:                                              |
| - research-summary.md                                           |
| - constraints.md                                                |
| - risks-opportunities.md                                        |
| - technical-options.md                                          |
|                                                                 |
| Principais Descobertas:                                         |
| - 4 restricoes tecnicas identificadas                           |
| - 3 restricoes de negocio identificadas                         |
| - 5 riscos documentados com mitigacoes                          |
| - 3 oportunidades para consideracao                             |
|                                                                 |
| ------------------------------------------------------------- |
| PROXIMA FASE: Planejamento                                      |
| Comando: /workflow:plan                                         |
| ------------------------------------------------------------- |
|                                                                 |
| A analise ira informar a criacao do PRD e a arquitetura.        |
+================================================================+
```

## Agentes Envolvidos

- **research-assistant**: Pesquisa tecnica e consulta de documentacao
- **product-owner**: Contexto de negocio e analise de stakeholders

## Arquivos de Saida

| Arquivo | Finalidade |
|---------|------------|
| `analysis/research-summary.md` | Descobertas de pesquisa consolidadas |
| `analysis/constraints.md` | Restricoes tecnicas, de negocio, regulatorias |
| `analysis/risks-opportunities.md` | Registro de riscos com mitigacoes |
| `analysis/technical-options.md` | Avaliacao e recomendacoes de tecnologias |

## Comandos Relacionados

- `/workflow:init` - Inicializar workflow (deve ser executado primeiro)
- `/workflow:plan` - Proxima fase: Planejamento
- `/workflow:status` - Verificar progresso
- `/common:research-context7` - Pesquisa aprofundada com MCP Context7
