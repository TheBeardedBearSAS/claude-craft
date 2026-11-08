# Verificação Completa de Conformidade Rust / Axum

## Argumentos

$ARGUMENTS (opcional: caminho do projeto a analisar)

## Modo Plan

> O modo Plan é ativado automaticamente quando o escopo abrange vários módulos ou exige uma investigação transversal.

## MISSÃO

Realizar uma auditoria completa de conformidade do projeto Rust / Axum orquestrando as 4 verificações principais: Arquitetura, Qualidade de Código, Testes e Segurança. Produzir um relatório consolidado com uma pontuação global sobre 100 pontos.

### Etapa 1: Preparação da Auditoria

Preparar o ambiente de auditoria:
- [ ] Identificar o caminho do projeto a auditar
- [ ] Verificar a presença dos arquivos de configuração (Cargo.toml, Cargo.lock, rust-toolchain.toml, rustfmt.toml, clippy.toml ou tabelas `[lints]`, deny.toml, `.sqlx/`)
- [ ] Listar os diretórios principais (crates/ ou src/, migrations/, tests/, benches/)
- [ ] Identificar a toolchain Rust (`rust-toolchain.toml`), a edition (`edition = "2024"`) e as versões de axum / tokio / sqlx (`Cargo.lock`)

**Nota**: Se $ARGUMENTS for informado, use-o como caminho do projeto; caso contrário, use o diretório atual.

### Etapa 2: Auditoria de Arquitetura (25 pontos)

Executar a verificação completa de arquitetura:

**Comando**: Use o slash command `/rust:check architecture` ou siga manualmente as etapas de `.claude/references/rust/checks/architecture.md`

**Critérios Avaliados**:
- Layout do workspace e fronteiras entre crates (domain livre de axum/sqlx) (6 pts)
- Handlers enxutos, casos de uso na camada de aplicação (6 pts)
- Router, State (`Arc<AppState>` / `FromRef`) e extractors (4 pts)
- Modelo de erros: `thiserror` nas bibliotecas, `AppError: IntoResponse`, problem+json (4 pts)
- Middleware Tower, tracing e graceful shutdown (3 pts)
- Direção das dependências e adapters de persistência (SQLx) (2 pts)

**Referência**: `.claude/references/rust/checks/architecture.md`

### Etapa 3: Auditoria de Qualidade de Código (25 pontos)

Executar a verificação de qualidade de código:

**Comando**: Use o slash command `/rust:check code-quality` ou siga manualmente as etapas de `.claude/references/rust/checks/code-quality.md`

**Critérios Avaliados**:
- Clippy sem avisos com `-D warnings` e lints do workspace (5 pts)
- rustfmt, nomenclatura das Rust API Guidelines, `#![forbid(unsafe_code)]` (5 pts)
- Higiene de ownership e borrowing, sem clones desnecessários, rustdoc (4 pts)
- Princípios KISS/DRY/YAGNI (4 pts)
- Tamanho das funções e complexidade cognitiva (4 pts)
- Tratamento de erros: nenhum `unwrap()` / `expect()` em caminhos de requisição (3 pts)

**Referência**: `.claude/references/rust/checks/code-quality.md`

### Etapa 4: Auditoria de Testes (25 pontos)

Executar a verificação de testes:

**Comando**: Use o slash command `/rust:check testing` ou siga manualmente as etapas de `.claude/references/rust/checks/testing.md`

**Critérios Avaliados**:
- Cobertura de código (cargo-llvm-cov, meta >= 80%) (7 pts)
- Testes unitários no módulo para domain e casos de uso (6 pts)
- Testes de integração: Router com `oneshot`, `#[sqlx::test]` (4 pts)
- Qualidade dos testes: AAA, nomenclatura, nextest, sem flakiness (3 pts)
- Testes de propriedades, de snapshot e de mutação (proptest, insta, cargo-mutants) (3 pts)
- Isolamento dos testes e mock dos ports (2 pts)

**Referência**: `.claude/references/rust/checks/testing.md`

### Etapa 5: Auditoria de Segurança (25 pontos)

Executar a verificação de segurança:

**Comando**: Use o slash command `/rust:check security` ou siga manualmente as etapas de `.claude/references/rust/checks/security.md`

**Critérios Avaliados**:
- Proteções do OWASP Top 10:2025 (6 pts)
- Gerenciamento de segredos e credenciais (`secrecy`, ambiente, vault) (5 pts)
- Validação de entrada (validator / garde), limites de corpo, codificação de saída (4 pts)
- Vulnerabilidades de dependências e supply chain (cargo-deny, cargo-audit, cargo-vet) (4 pts)
- Autenticação, autorização e rate limiting (Argon2id, JWT EdDSA, tower_governor) (3 pts)
- Configuração segura (headers de segurança, cookies, CORS, TLS) (2 pts)
- Prevenção de injeção de SQL (parâmetros bind do SQLx) (1 pt)

**Referência**: `.claude/references/rust/checks/security.md`

### Etapa 6: Consolidação e Pontuação Global

Calcular a pontuação global e produzir o relatório consolidado:
- [ ] Somar as 4 pontuações (máx. 100 pontos)
- [ ] Identificar as categorias críticas (<50%)
- [ ] Listar todos os problemas críticos transversais
- [ ] Priorizar as ações por impacto/esforço
- [ ] Produzir o relatório consolidado final

**Escala de Notas**:
- 90-100: Excelente - Projeto de referência
- 75-89: Muito Bom - Algumas melhorias menores
- 60-74: Aceitável - Requer melhorias
- 40-59: Insuficiente - Refatoração importante necessária
- 0-39: Crítico - Reformulação completa necessária

### Etapa 7: Recomendações e Plano de Ação

Produzir as recomendações finais:
- [ ] Identificar as 3 ações prioritárias entre todas as categorias
- [ ] Estimar o esforço (Baixo/Médio/Alto) de cada ação
- [ ] Estimar o impacto (Baixo/Médio/Alto) de cada ação
- [ ] Propor a ordem de implementação
- [ ] Sugerir quick wins (alta relação impacto/esforço)

## FORMATO DE SAÍDA

```
AUDITORIA DE CONFORMIDADE RUST / AXUM - RELATÓRIO COMPLETO
==========================================================

PONTUAÇÃO GLOBAL: XX/100

NÍVEL DE CONFORMIDADE: [Excelente/Muito Bom/Aceitável/Insuficiente/Crítico]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PONTUAÇÕES POR CATEGORIA:

ARQUITETURA        : XX/25  [██████████░░░░░░░░░░] XX%
QUALIDADE DE CÓDIGO: XX/25  [██████████░░░░░░░░░░] XX%
TESTES             : XX/25  [██████████░░░░░░░░░░] XX%
SEGURANÇA          : XX/25  [██████████░░░░░░░░░░] XX%

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PONTOS FORTES GERAIS:
1. [Ponto forte identificado em várias categorias]
2. [Outro ponto forte importante]
3. [Terceiro ponto forte]

MELHORIAS GERAIS:
1. [Melhoria transversal menor]
2. [Outra melhoria recomendada]
3. [Terceira melhoria]

PROBLEMAS CRÍTICOS:
1. [Problema crítico nº 1 - categoria afetada]
2. [Problema crítico nº 2 - categoria afetada]
3. [Problema crítico nº 3 - categoria afetada]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

DETALHES POR CATEGORIA:

┌─────────────────────────────────────────────┐
│ ARQUITETURA (XX/25)                         │
└─────────────────────────────────────────────┘

Subpontuações:
  • Workspace / fronteiras de crates : XX/6
  • Handlers enxutos / casos de uso  : XX/6
  • Router, State, extractors        : XX/4
  • Modelo de erros / problem+json   : XX/4
  • Middleware, tracing, shutdown    : XX/3
  • Dependências e adapters          : XX/2

Pontos fortes:
- [Pontos fortes da arquitetura]

Problemas:
- [Problemas de arquitetura]

[Seções semelhantes para Qualidade de Código, Testes e Segurança...]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

TOP 3 AÇÕES PRIORITÁRIAS (TODAS AS CATEGORIAS):

1. CRÍTICA - [Ação nº 1]
   Categoria : [Arquitetura/Qualidade/Testes/Segurança]
   Impacto   : [Alto/Médio/Baixo]
   Esforço   : [Alto/Médio/Baixo]
   Prioridade: IMEDIATA

   Descrição detalhada:
   [Explicação do problema e da solução proposta]

   Arquivos afetados:
   - [arquivo:linha]

   Exemplo de correção:
   [Código ou comando de correção]

2. IMPORTANTE - [Ação nº 2]
   [Mesmo formato...]

3. RECOMENDADA - [Ação nº 3]
   [Mesmo formato...]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

QUICK WINS (Alto Impacto / Baixo Esforço):

- [Quick win nº 1] - Categoria: [X] - Impacto: [X] - Esforço: [X]
- [Quick win nº 2] - Categoria: [X] - Impacto: [X] - Esforço: [X]
- [Quick win nº 3] - Categoria: [X] - Impacto: [X] - Esforço: [X]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PLANO DE AÇÃO RECOMENDADO:

SEMANA 1 (Imediato):
- [ ] [Ação crítica nº 1]
- [ ] [Quick win prioritário]

SEMANAS 2-4 (Curto prazo):
- [ ] [Ação importante nº 2]
- [ ] [Outros quick wins]

MESES 2-3 (Médio prazo):
- [ ] [Ação recomendada nº 3]
- [ ] [Melhorias progressivas]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

RESUMO EXECUTIVO:

[Parágrafo de resumo sobre o estado geral do projeto, principais pontos
fortes, principais pontos fracos e trajetória recomendada para melhorar
a conformidade. Mencionar se o projeto está pronto para produção,
requer correções ou precisa de refatoração.]

Recomendação Geral: [Pronto para produção / Correções menores /
Refatoração importante / Reformulação necessária]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## NOTAS IMPORTANTES

- Este comando orquestra as 4 auditorias especializadas
- Use o Docker para todas as ferramentas de análise (`docker compose exec app ...`)
- Forneça exemplos concretos com arquivo:linha para cada problema
- Priorize as ações com base na matriz Impacto/Esforço
- Problemas de segurança são SEMPRE a prioridade máxima
- Proponha correções automatizáveis (scripts, hooks de pre-commit, etapas de CI)
- O relatório deve ser acionável, não apenas descritivo
- Adapte as recomendações ao contexto de negócio do projeto
- Pragmatismo em primeiro lugar: não penalize um serviço pequeno por ser um único crate com módulos quando as fronteiras são respeitadas
