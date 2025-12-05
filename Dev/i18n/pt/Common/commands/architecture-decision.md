# Registro de Decisão Arquitetural (ADR)

Você é um arquiteto de software sênior. Você deve criar um Registro de Decisão Arquitetural (ADR) para documentar uma decisão técnica importante.

## Argumentos
$ARGUMENTS

Argumentos:
- Título da decisão
- (Opcional) Número do ADR

Exemplo: `/common:architecture-decision "Escolha do PostgreSQL para banco de dados principal"`

## MISSÃO

### Etapa 1: Coletar Informações

Faça perguntas-chave:
1. Qual problema estamos tentando resolver?
2. Quais são as restrições?
3. Quais opções consideramos?
4. Por que esta opção em vez de outra?

### Etapa 2: Criar o Arquivo ADR

Localização: `docs/architecture/decisions/` ou `docs/adr/`

Nomenclatura: `NNNN-titulo-em-kebab-case.md`

### Etapa 3: Escrever o ADR

Template ADR (formato Michael Nygard):

```markdown
# ADR-{NNNN}: {Título}

**Data**: {AAAA-MM-DD}
**Status**: {Proposto | Aceito | Depreciado | Substituído por ADR-XXXX}
**Decisores**: {Nomes das pessoas envolvidas}

## Contexto

{Descreva as forças em jogo, incluindo forças tecnológicas, políticas,
sociais e relacionadas ao projeto. Essas forças provavelmente estão em tensão,
e devem ser destacadas como tal. A linguagem nesta seção é
neutra em valor - estamos simplesmente descrevendo fatos.}

### Situação Atual

{Descrição do estado atual do sistema/projeto}

### Problema

{Descrição clara do problema a resolver}

### Restrições

- {Restrição 1}
- {Restrição 2}
- {Restrição 3}

## Opções Consideradas

### Opção 1: {Nome}

{Descrição da opção}

**Vantagens**:
- {Vantagem 1}
- {Vantagem 2}

**Desvantagens**:
- {Desvantagem 1}
- {Desvantagem 2}

**Esforço Estimado**: {Baixo | Médio | Alto}

### Opção 2: {Nome}

{Descrição da opção}

**Vantagens**:
- {Vantagem 1}
- {Vantagem 2}

**Desvantagens**:
- {Desvantagem 1}
- {Desvantagem 2}

**Esforço Estimado**: {Baixo | Médio | Alto}

### Opção 3: {Nome}

{Descrição da opção}

**Vantagens**:
- {Vantagem 1}
- {Vantagem 2}

**Desvantagens**:
- {Desvantagem 1}
- {Desvantagem 2}

**Esforço Estimado**: {Baixo | Médio | Alto}

## Decisão

{Decidimos usar a **Opção X** porque...}

### Justificativa

{Explicação detalhada do porquê esta opção foi escolhida sobre
as outras. Inclua os trade-offs aceitos.}

## Consequências

### Positivas

- {Consequência positiva 1}
- {Consequência positiva 2}

### Negativas

- {Consequência negativa 1}
- {Consequência negativa 2}

### Riscos

| Risco | Probabilidade | Impacto | Mitigação |
|------|-------------|--------|------------|
| {Risco 1} | Baixo/Médio/Alto | Baixo/Médio/Alto | {Ação} |
| {Risco 2} | Baixo/Médio/Alto | Baixo/Médio/Alto | {Ação} |

## Plano de Implementação

### Fase 1: {Título}
- [ ] {Tarefa 1}
- [ ] {Tarefa 2}

### Fase 2: {Título}
- [ ] {Tarefa 3}
- [ ] {Tarefa 4}

## Métricas de Sucesso

- {Métrica 1}: {Valor alvo}
- {Métrica 2}: {Valor alvo}

## Referências

- {Link para documentação}
- {Link para estudo comparativo}
- {ADRs relacionados}

---

## Histórico

| Data | Ação | Por |
|------|--------|-----|
| {AAAA-MM-DD} | Criado | {Nome} |
| {AAAA-MM-DD} | Aceito | {Time} |
```

### Etapa 4: Exemplo Completo de ADR

```markdown
# ADR-0012: Escolha do PostgreSQL para Banco de Dados Principal

**Data**: 2024-01-15
**Status**: Aceito
**Decisores**: João Silva (Tech Lead), Maria Santos (DBA), Pedro Oliveira (CTO)

## Contexto

### Situação Atual

Nossa aplicação atualmente usa MySQL 5.7 hospedado em um servidor dedicado.
O banco de dados contém 50 tabelas, 10 milhões de linhas na tabela principal,
e processa 1000 consultas/segundo no pico.

### Problema

1. MySQL 5.7 está chegando ao fim da vida útil (EOL)
2. Necessidade crescente de consultas JSON complexas
3. Capacidades limitadas de busca full-text
4. Sem suporte nativo para tipos geoespaciais

### Restrições

- Orçamento de infraestrutura limitado
- Migração deve ser transparente para os usuários
- Equipe familiarizada com MySQL, não com PostgreSQL
- Tempo de migração: máximo 3 meses

## Opções Consideradas

### Opção 1: Atualizar para MySQL 8.0

Permanecer no MySQL atualizando para a versão 8.0.

**Vantagens**:
- Sem migração de schema
- Equipe já treinada
- Risco mínimo

**Desvantagens**:
- Consultas JSON ainda menos performáticas
- Sem busca full-text nativa em português
- Extensão geoespacial menos madura

**Esforço Estimado**: Baixo

### Opção 2: Migrar para PostgreSQL 16

Migrar para PostgreSQL com todos os recursos modernos.

**Vantagens**:
- JSONB muito performático
- Busca full-text com dicionários em português
- PostGIS para recursos geoespaciais
- Comunidade muito ativa
- Extensões ricas (pg_trgm, uuid-ossp, etc.)

**Desvantagens**:
- Migração necessária
- Treinamento da equipe necessário
- Pequenas mudanças de sintaxe SQL

**Esforço Estimado**: Médio

### Opção 3: Banco de Dados NoSQL (MongoDB)

Migrar para um banco de dados de documentos para mais flexibilidade.

**Vantagens**:
- Schema flexível
- Bom para JSON nativo
- Escalabilidade horizontal

**Desvantagens**:
- Perda de restrições relacionais
- Migração massiva de código
- Transações complexas
- Equipe não treinada

**Esforço Estimado**: Alto

## Decisão

Decidimos usar o **PostgreSQL 16** porque:

### Justificativa

1. **Performance JSON**: JSONB do PostgreSQL supera o MySQL para nossos
   casos de uso de armazenamento de metadados de usuário.

2. **Busca full-text**: Dicionário nativo em português evita instalar
   Elasticsearch para busca.

3. **PostGIS**: Nossos novos recursos de geolocalização serão
   mais simples de implementar.

4. **Maturidade**: PostgreSQL é o RDBMS open-source mais avançado,
   com uma comunidade muito ativa.

5. **Compatibilidade Doctrine**: Nosso ORM suporta perfeitamente PostgreSQL.

## Consequências

### Positivas

- Consultas JSON 3x mais rápidas (benchmark interno)
- Busca full-text sem infraestrutura adicional
- Recursos geoespaciais nativos
- Melhor suporte para tipos de dados (UUID, arrays, etc.)

### Negativas

- 2 semanas de treinamento da equipe
- Migração de dados estimada em 4h de downtime
- Algumas consultas para adaptar (sintaxe LIMIT/OFFSET)

### Riscos

| Risco | Probabilidade | Impacto | Mitigação |
|------|-------------|--------|------------|
| Regressão de performance | Baixa | Média | Testes de carga antes da migração |
| Perda de dados | Muito baixa | Crítica | Backup + dry-run |
| Bugs pós-migração | Média | Baixa | Período de estabilização de 2 semanas |

## Plano de Implementação

### Fase 1: Preparação (Semana 1-2)
- [x] Treinamento da equipe em PostgreSQL
- [x] Configurar ambiente dev PostgreSQL
- [x] Adaptar testes unitários

### Fase 2: Migração de Código (Semana 3-4)
- [ ] Adaptar consultas SQL nativas
- [ ] Configurar Doctrine para PostgreSQL
- [ ] Completar testes de integração

### Fase 3: Migração de Dados (Semana 5)
- [ ] Script de migração pgloader
- [ ] Dry-run em cópia de produção
- [ ] Migração de produção (fim de semana)

### Fase 4: Estabilização (Semana 6-8)
- [ ] Monitoramento de performance
- [ ] Correção de bugs se houver
- [ ] Documentação atualizada

## Métricas de Sucesso

- Tempo de resposta da API: ≤ atual (100ms P95)
- Consultas JSON: -50% tempo de execução
- Uptime pós-migração: 99.9%

## Referências

- [Benchmark PostgreSQL vs MySQL JSON](internal-wiki/benchmarks)
- [Guia de Migração Doctrine](internal-wiki/migration-guide)
- ADR-0008: Escolha do ORM Doctrine
```

### Etapa 5: Criar Índice de ADRs

```markdown
# Registros de Decisão Arquitetural

Esta pasta contém os ADRs do projeto.

## Índice

| # | Título | Status | Data |
|---|-------|--------|------|
| [ADR-0001](0001-use-clean-architecture.md) | Adoção da Clean Architecture | Aceito | 2023-06-15 |
| [ADR-0012](0012-postgresql-database.md) | Escolha do PostgreSQL | Aceito | 2024-01-15 |
| [ADR-0013](0013-api-versioning.md) | Estratégia de Versionamento de API | Proposto | 2024-01-20 |

## Status

- **Proposto**: Em discussão
- **Aceito**: Decisão validada
- **Depreciado**: Não mais relevante
- **Substituído**: Substituído por outro ADR
```

## Estrutura Recomendada

```
docs/
└── architecture/
    └── decisions/
        ├── README.md           # Índice de ADRs
        ├── 0001-*.md
        ├── 0002-*.md
        └── templates/
            └── adr-template.md
```
