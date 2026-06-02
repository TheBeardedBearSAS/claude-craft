---
name: workflow-analyze
description: Executar a fase de Análise - pesquisa, exploração e identificação de restrições
arguments:
  - name: focus
    description: Área específica a analisar (mercado, técnica, concorrentes)
    required: false
---

# /workflow:analyze

## Missão

Executar a fase de Análise do fluxo de trabalho Enterprise. Esta fase foca-se em pesquisa, exploração e identificação de restrições antes de que o planejamento detalhado seja iniciado.

## Quando Usar

- Projetos do **track Enterprise**
- Novas plataformas ou iniciativas de grande porte
- Quando o conhecimento do domínio é limitado
- Antes de se comprometer com uma abordagem técnica

## Modo de Planejamento

> O modo de planejamento é ativado automaticamente quando o escopo abrange múltiplos módulos ou exige investigação transversal.

## Fluxo de Trabalho

### Etapa 1: Configuração da Análise

```
╔══════════════════════════════════════════════════════════╗
║            FASE DE ANÁLISE - INICIANDO                    ║
╠══════════════════════════════════════════════════════════╣
║ Track: Enterprise                                         ║
║ Fase: 1 de 4 - Análise                                    ║
║                                                           ║
║ Objetivos:                                                ║
║ • Compreender o domínio do problema                       ║
║ • Pesquisar soluções existentes                           ║
║ • Identificar restrições técnicas                         ║
║ • Documentar riscos e oportunidades                       ║
╚══════════════════════════════════════════════════════════╝
```

### Etapa 2: Áreas de Pesquisa

**Perguntas-Guia de Pesquisa:**

```
┌─────────────────────────────────────────────────────────┐
│ PESQUISA DE DOMÍNIO                                      │
├─────────────────────────────────────────────────────────┤
│ 1. Qual problema estamos resolvendo?                     │
│ 2. Quais são os principais stakeholders?                 │
│ 3. Quais são os motivadores do negócio?                  │
│ 4. Como é definido o sucesso esperado?                   │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ PESQUISA DE MERCADO                                      │
├─────────────────────────────────────────────────────────┤
│ 1. Quais soluções existentes estão disponíveis?          │
│ 2. O que os concorrentes estão fazendo?                  │
│ 3. Quais são as melhores práticas do setor?              │
│ 4. Quais são as tendências emergentes?                   │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ PESQUISA TÉCNICA                                         │
├─────────────────────────────────────────────────────────┤
│ 1. Quais tecnologias poderíamos utilizar?                │
│ 2. Quais são os requisitos de integração?                │
│ 3. Quais são as necessidades de escalabilidade?          │
│ 4. Quais requisitos de segurança/conformidade existem?   │
└─────────────────────────────────────────────────────────┘
```

### Etapa 3: Pesquisa com Context7 (Opcional)

Se o MCP Context7 estiver configurado, utilize-o para pesquisa técnica:

```
Usando Context7 MCP para documentação atualizada...

Pesquisando:
• Melhores práticas atuais da API Stripe
• Padrões de segurança vigentes para processamento de pagamentos
• Requisitos de conformidade PCI DSS
```

### Etapa 4: Identificação de Restrições

Documente as restrições descobertas:

```
╔══════════════════════════════════════════════════════════╗
║               RESTRIÇÕES IDENTIFICADAS                    ║
╠══════════════════════════════════════════════════════════╣
║                                                           ║
║ RESTRIÇÕES TÉCNICAS:                                      ║
║ • Deve integrar com o backend Symfony 7.x existente       ║
║ • Banco de dados: PostgreSQL (existente, não pode mudar)  ║
║ • Deve suportar apps mobile via API existente             ║
║                                                           ║
║ RESTRIÇÕES DE NEGÓCIO:                                    ║
║ • Orçamento: Limitado à equipe atual                      ║
║ • Prazo: MVP necessário no Q2 2026                        ║
║ • Deve manter compatibilidade retroativa                  ║
║                                                           ║
║ RESTRIÇÕES REGULATÓRIAS:                                  ║
║ • Conformidade com LGPD/GDPR obrigatória (usuários UE)    ║
║ • PCI DSS para processamento de pagamentos                ║
║                                                           ║
║ RESTRIÇÕES DE RECURSOS:                                   ║
║ • Equipe: 2 backend, 1 desenvolvedor frontend             ║
║ • Sem recurso dedicado de DevOps                          ║
║                                                           ║
╚══════════════════════════════════════════════════════════╝
```

### Etapa 5: Análise de Riscos e Oportunidades

```
╔══════════════════════════════════════════════════════════╗
║            RISCOS E OPORTUNIDADES                         ║
╠══════════════════════════════════════════════════════════╣
║                                                           ║
║ RISCOS:                                                   ║
║ ┌─────────┬──────────┬────────────┬───────────────────┐  ║
║ │ Risco   │ Impacto  │ Probab.    │ Mitigação         │  ║
║ ├─────────┼──────────┼────────────┼───────────────────┤  ║
║ │ Stripe  │ Alto     │ Baixa      │ Provedor de       │  ║
║ │ fora do │          │            │ contingência      │  ║
║ │ ar      │          │            │                   │  ║
║ ├─────────┼──────────┼────────────┼───────────────────┤  ║
║ │ Atraso  │ Médio    │ Média      │ Redução de        │  ║
║ │ no prazo│          │            │ escopo do MVP     │  ║
║ └─────────┴──────────┴────────────┴───────────────────┘  ║
║                                                           ║
║ OPORTUNIDADES:                                            ║
║ • Pode aproveitar os novos Payment Elements do Stripe     ║
║ • Potencial para expansão do modelo de assinatura         ║
║ • Pronto para pagamento mobile (Apple Pay, Google Pay)    ║
║                                                           ║
╚══════════════════════════════════════════════════════════╝
```

### Etapa 6: Geração de Artefatos de Análise

Crie os documentos de análise:

```
project-management/
└── analysis/
    ├── research-summary.md      # Principais descobertas
    ├── constraints.md           # Todas as restrições identificadas
    ├── risks-opportunities.md   # Registro de riscos e oportunidades
    └── technical-options.md     # Avaliação de tecnologias
```

### Etapa 7: Conclusão da Fase

```
╔══════════════════════════════════════════════════════════╗
║            FASE DE ANÁLISE CONCLUÍDA                      ║
╠══════════════════════════════════════════════════════════╣
║                                                           ║
║ Artefatos Criados:                                        ║
║ ✅ research-summary.md                                    ║
║ ✅ constraints.md                                         ║
║ ✅ risks-opportunities.md                                 ║
║ ✅ technical-options.md                                   ║
║                                                           ║
║ Principais Descobertas:                                   ║
║ • 4 restrições técnicas identificadas                     ║
║ • 3 restrições de negócio identificadas                   ║
║ • 5 riscos documentados com mitigações                    ║
║ • 3 oportunidades para consideração                       ║
║                                                           ║
║ ─────────────────────────────────────────────────────────║
║ PRÓXIMA FASE: Planejamento                                ║
║ Comando: /workflow:plan                                   ║
║ ─────────────────────────────────────────────────────────║
║                                                           ║
║ A análise embasará a criação do PRD e a arquitetura.      ║
╚══════════════════════════════════════════════════════════╝
```

## Agentes Envolvidos

- **research-assistant**: Pesquisa técnica e consulta de documentação
- **product-owner**: Contexto de negócio e análise de stakeholders

## Arquivos de Saída

| Arquivo | Finalidade |
|---------|-----------|
| `analysis/research-summary.md` | Descobertas consolidadas da pesquisa |
| `analysis/constraints.md` | Restrições técnicas, de negócio e regulatórias |
| `analysis/risks-opportunities.md` | Registro de riscos com mitigações |
| `analysis/technical-options.md` | Avaliação e recomendações de tecnologias |

## Comandos Relacionados

- `/workflow:init` - Inicializar o fluxo de trabalho (deve ser executado primeiro)
- `/workflow:plan` - Próxima fase: Planejamento
- `/workflow:status` - Verificar o progresso
- `/common:research-context7` - Pesquisa aprofundada com Context7 MCP
