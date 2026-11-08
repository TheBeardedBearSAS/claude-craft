# Verificação Completa de Conformidade Tauri v2

## Argumentos

$ARGUMENTS (opcional: caminho do projeto a analisar)

## Modo Plan

> O modo Plan é ativado automaticamente quando o escopo abrange vários módulos ou exige uma investigação transversal.

## MISSÃO

Realizar uma auditoria completa de conformidade do projeto Tauri v2 orquestrando as 4 verificações principais: Arquitetura, Qualidade de Código, Testes e Segurança. Produzir um relatório consolidado com uma pontuação global sobre 100 pontos.

### Etapa 1: Preparação da Auditoria

Preparar o ambiente de auditoria:
- [ ] Identificar o caminho do projeto a auditar
- [ ] Verificar a presença dos arquivos de configuração (`src-tauri/Cargo.toml`, `src-tauri/tauri.conf.json`, `src-tauri/capabilities/*.json`, `src-tauri/build.rs`, `package.json`, configuração do Vite)
- [ ] Listar os diretórios principais (`src/`, `src-tauri/src/`, `src-tauri/capabilities/`, `src-tauri/icons/`, testes, workflows de CI)
- [ ] Identificar a versão do Tauri (`tauri`, `tauri-build`, `@tauri-apps/api`, `@tauri-apps/cli` nos lockfiles), o `rust-version` do Rust e os plugins oficiais em uso
- [ ] Confirmar que o alvo é o Tauri v2 estável (o Tauri 3 alpha e o Tauri v1 estão fora do escopo); anotar alvos somente desktop vs mobile (iOS/Android)

**Nota**: Se $ARGUMENTS for informado, use-o como caminho do projeto; caso contrário, use o diretório atual.

### Etapa 2: Auditoria de Arquitetura (25 pontos)

Executar a verificação completa de arquitetura:

**Comando**: Use o slash command `/tauri:check architecture` ou siga manualmente as etapas de `.claude/references/tauri/checks/architecture.md`

**Critérios Avaliados**:
- Layout do projeto (`src/` / `src-tauri/`, ponto de entrada `run()` em `lib.rs`, ponto de entrada mobile) e `main.rs` enxuto (5 pts)
- Design dos commands: handlers `#[tauri::command]` enxutos, lógica em módulos Rust testáveis (6 pts)
- Modelo de erros tipado: enum `thiserror` que implementa `Serialize` (4 pts)
- Gerenciamento de estado (`manage` / `State<'_, T>`) e correção assíncrona (sem bloqueios, escopo de locks) (4 pts)
- Eventos e `Channel<T>` para streaming, uso de plugins (`.plugin(...)`, `#[cfg(desktop)]`) (4 pts)
- Fronteira frontend/núcleo: nenhuma lógica de negócio na webview, IPC tipado (2 pts)

**Referência**: `.claude/references/tauri/checks/architecture.md`

### Etapa 3: Auditoria de Qualidade de Código (25 pontos)

Executar a verificação de qualidade de código:

**Comando**: Use o slash command `/tauri:check code-quality` ou siga manualmente as etapas de `.claude/references/tauri/checks/code-quality.md`

**Critérios Avaliados**:
- Clippy sem avisos com `-D warnings` e `cargo fmt --check` (5 pts)
- Nomenclatura Rust, higiene de ownership e borrowing (commands assíncronos com argumentos emprestados retornam `Result`) (5 pts)
- Tipagem e lint do frontend (`tsc --noEmit`, ESLint ou Biome) e wrappers de `invoke` consistentes (4 pts)
- Princípios KISS/DRY/YAGNI (4 pts)
- Tamanho das funções e complexidade cognitiva (4 pts)
- Tratamento de erros: sem `unwrap()` / `expect()` nos commands, sem falhas silenciosas (3 pts)

**Referência**: `.claude/references/tauri/checks/code-quality.md`

### Etapa 4: Auditoria de Testes (25 pontos)

Executar a verificação de testes:

**Comando**: Use o slash command `/tauri:check testing` ou siga manualmente as etapas de `.claude/references/tauri/checks/testing.md`

**Critérios Avaliados**:
- Cobertura de código (meta >= 80%) no núcleo Rust e no frontend (7 pts)
- Testes de commands Rust sem GUI (runtime mock `tauri::test`: `mock_builder()`, `mock_context(noop_assets())`) (6 pts)
- Testes do frontend com `@tauri-apps/api/mocks` (`mockIPC`, `clearMocks()` em `afterEach`) (4 pts)
- Testes end-to-end (WebdriverIO + `@wdio/tauri-service`, ou `tauri-driver` no Windows/Linux) sobre um build `tauri build --debug --no-bundle` (3 pts)
- Qualidade dos testes: AAA, nomenclatura, sem flakiness, execução na CI (3 pts)
- Isolamento dos testes e mock do IPC e do acesso ao SO (2 pts)

**Referência**: `.claude/references/tauri/checks/testing.md`

### Etapa 5: Auditoria de Segurança (25 pontos)

Executar a verificação de segurança:

**Comando**: Use o slash command `/tauri:check security` ou siga manualmente as etapas de `.claude/references/tauri/checks/security.md`

**Critérios Avaliados**:
- Capabilities e permissões: uma capability por janela/papel, privilégio mínimo (6 pts)
- Escopos: listas allow e deny de `fs` / `http`, sem curingas amplos (4 pts)
- CSP (`app.security.csp`) e padrão Isolation (`app.security.pattern`) (5 pts)
- Assinatura do updater: chave pública na configuração, chave privada nunca versionada, segredo da CI (4 pts)
- Gerenciamento de segredos e credenciais, proteções do OWASP Top 10:2025 (3 pts)
- Vulnerabilidades de dependências e supply chain (`cargo deny` / `cargo audit`, `npm audit`) (2 pts)
- Validação de entrada nos commands e mentalidade de webview não confiável (1 pt)

**Referência**: `.claude/references/tauri/checks/security.md`

### Etapa 6: Consolidação e Pontuação Global

Calcular a pontuação global e produzir o relatório consolidado:
- [ ] Somar as 4 pontuações (máx. 100 pontos)
- [ ] Identificar as categorias críticas (<50%)
- [ ] Listar todos os problemas transversais críticos
- [ ] Priorizar as ações por impacto/esforço
- [ ] Produzir o relatório consolidado final

**Escala de Notas**:
- 90-100: Excelente - Projeto de referência
- 75-89: Muito Bom - Algumas melhorias menores
- 60-74: Aceitável - Exige melhorias
- 40-59: Insuficiente - Refatoração importante necessária
- 0-39: Crítico - Reformulação completa necessária

### Etapa 7: Recomendações e Plano de Ação

Produzir as recomendações finais:
- [ ] Identificar as 3 ações prioritárias em todas as categorias
- [ ] Estimar o esforço (Baixo/Médio/Alto) de cada ação
- [ ] Estimar o impacto (Baixo/Médio/Alto) de cada ação
- [ ] Propor a ordem de implementação
- [ ] Sugerir quick wins (alta relação impacto/esforço)

## FORMATO DE SAÍDA

```
AUDITORIA DE CONFORMIDADE TAURI V2 - RELATÓRIO COMPLETO
=========================================================

PONTUAÇÃO GLOBAL: XX/100

NÍVEL DE CONFORMIDADE: [Excelente/Muito Bom/Aceitável/Insuficiente/Crítico]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PONTUAÇÃO POR CATEGORIA:

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

Sub-pontuações:
  • Layout / pontos de entrada     : XX/5
  • Design dos commands            : XX/6
  • Erros tipados                  : XX/4
  • Estado e async                 : XX/4
  • Eventos, Channels, plugins     : XX/4
  • Fronteira frontend / núcleo    : XX/2

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

[Parágrafo de resumo sobre o estado geral do projeto, principais
pontos fortes, principais fraquezas e a trajetória recomendada para
melhorar a conformidade. Indique se o projeto está pronto para
produção, exige correções ou precisa de refatoração.]

Recomendação Geral: [Pronto para produção / Correções menores /
Refatoração importante / Reformulação necessária]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## NOTAS IMPORTANTES

- Este comando orquestra as 4 auditorias especializadas
- Use Docker para todas as ferramentas de análise (`docker compose exec app ...`); os builds de GUI podem exigir a CI
- Forneça exemplos concretos com arquivo:linha para cada problema
- Priorize as ações com base na matriz Impacto/Esforço
- Os problemas de segurança são SEMPRE a prioridade máxima
- Proponha correções automatizáveis (scripts, hooks de pre-commit, etapas de CI)
- O relatório deve ser acionável, não apenas descritivo
- Adapte as recomendações ao contexto de negócio do projeto
- Pragmatismo em primeiro lugar: não penalize um app pequeno por um único `lib.rs` com módulos quando as responsabilidades estão separadas
- Fora do escopo: código de framework de UI (consulte as stacks React / Vue / Svelte / Vite) e regras gerais de Rust (consulte a stack `rust`)
