# Verificação Completa de Conformidade WordPress

## Argumentos

$ARGUMENTS (opcional: caminho do plugin/tema a analisar)

## Modo Plan

> O modo Plan é ativado automaticamente quando o escopo abrange vários módulos ou exige uma investigação transversal.

## MISSÃO

Realizar uma auditoria completa de conformidade do plugin ou tema WordPress orquestrando as 4 verificações principais: Arquitetura, Qualidade de Código, Testes e Segurança. Produzir um relatório consolidado com uma pontuação global sobre 100 pontos.

### Etapa 1: Preparação da Auditoria

Preparar o ambiente de auditoria:
- [ ] Identificar o caminho do projeto a auditar
- [ ] Verificar a presença dos arquivos principais (arquivo de cabeçalho do plugin ou `style.css`/`theme.json`, `composer.json`, `package.json`, `.wp-env.json`, `phpcs.xml*`, `phpstan.neon*`, `uninstall.php`, arquivos `block.json`)
- [ ] Listar os diretórios principais (`src/` ou `includes/`, `blocks/`, `languages/`, `tests/`, workflows de CI)
- [ ] Identificar os valores declarados de `Requires at least`, `Requires PHP`, `Requires Plugins` e as versões das ferramentas nos lockfiles
- [ ] Determinar o tipo: plugin, tema clássico, tema de blocos ou misto; anotar se o projeto depende do WooCommerce

**Nota**: Se $ARGUMENTS for informado, use-o como caminho do projeto; caso contrário, use o diretório atual.

### Etapa 2: Auditoria de Arquitetura (25 pontos)

**Comando**: Use o slash command `/wordpress:check architecture` ou siga manualmente as etapas de `.claude/references/wordpress/checks/architecture.md`

**Critérios Avaliados**:
- Cabeçalho do plugin, arquivo de bootstrap, proteção ABSPATH, autoload do Composer (5 pts)
- Prefixos e namespaces para funções, classes, opções, hooks, handles (5 pts)
- Organização dos hooks e callbacks enxutos (5 pts)
- Blocos (`block.json` apiVersion 3, `render.php`) e estrutura do tema de blocos (`theme.json`, templates, parts) (5 pts)
- Design REST e ciclo de vida (ativação, desativação, desinstalação) (5 pts)

**Referência**: `.claude/references/wordpress/checks/architecture.md`

### Etapa 3: Auditoria de Qualidade de Código (25 pontos)

**Comando**: Use o slash command `/wordpress:check code-quality` ou siga manualmente as etapas de `.claude/references/wordpress/checks/code-quality.md`

**Critérios Avaliados**:
- WPCS (PHPCS) passa (7 pts)
- i18n: text domain, comentários para tradutores, traduções de JS (5 pts)
- PHPStan (phpstan-wordpress) e ESLint (`@wordpress/eslint-plugin`) (5 pts)
- Princípios KISS/DRY/YAGNI (4 pts)
- Tamanho das funções e complexidade cognitiva (4 pts)

**Referência**: `.claude/references/wordpress/checks/code-quality.md`

### Etapa 4: Auditoria de Testes (25 pontos)

**Comando**: Use o slash command `/wordpress:check testing` ou siga manualmente as etapas de `.claude/references/wordpress/checks/testing.md`

**Critérios Avaliados**:
- Cobertura de código (meta >= 80%) em PHP e JS (7 pts)
- PHPUnit com `WP_UnitTestCase` via wp-env, `yoast/phpunit-polyfills` (6 pts)
- Jest via `@wordpress/scripts` para blocos e JS (4 pts)
- Playwright de ponta a ponta com `@wordpress/e2e-test-utils-playwright` (3 pts)
- Qualidade dos testes: AAA, nomenclatura, ausência de flakiness, execução na CI (3 pts)
- Isolamento dos testes e uso de factories (2 pts)

**Referência**: `.claude/references/wordpress/checks/testing.md`

### Etapa 5: Auditoria de Segurança (25 pontos)

**Comando**: Use o slash command `/wordpress:check security` ou siga manualmente as etapas de `.claude/references/wordpress/checks/security.md`

**Critérios Avaliados**:
- Verificações de capability e nonces em toda alteração de estado (6 pts)
- `permission_callback` REST e validação de argumentos (5 pts)
- Escaping na saída (`esc_*`, `wp_kses_post`) (5 pts)
- Sanitização da entrada e `$wpdb->prepare()` (4 pts)
- Gestão de segredos e credenciais, proteções do OWASP Top 10:2025 (3 pts)
- Vulnerabilidades de dependências e cadeia de suprimentos (`composer audit`, `npm audit`) (2 pts)

**Referência**: `.claude/references/wordpress/checks/security.md`

### Etapa 6: WooCommerce (somente se o projeto depender dele)

Aplique `.claude/skills/woocommerce/checklist.md`: compatibilidade com HPOS declarada, `wc_get_order()` / objetos CRUD em vez de post meta, compatibilidade com `cart_checkout_blocks`. Incorpore os achados às pontuações de Arquitetura e Segurança; ignore esta etapa por completo em projetos sem WooCommerce.

### Etapa 7: Consolidação e Pontuação Global

Calcular a pontuação global e produzir o relatório consolidado:
- [ ] Somar as 4 pontuações (máx. 100 pontos)
- [ ] Identificar as categorias críticas (<50%)
- [ ] Listar todos os problemas críticos transversais
- [ ] Priorizar as ações por impacto/esforço
- [ ] Produzir o relatório consolidado final

**Escala de Classificação**:
- 90-100: Excelente - Projeto de referência
- 75-89: Muito Bom - Algumas melhorias menores
- 60-74: Aceitável - Requer melhorias
- 40-59: Insuficiente - Refatoração importante necessária
- 0-39: Crítico - Reformulação completa necessária

### Etapa 8: Recomendações e Plano de Ação

- [ ] Identificar as 3 ações prioritárias em todas as categorias
- [ ] Estimar esforço e impacto (Baixo/Médio/Alto) de cada uma
- [ ] Propor a ordem de implementação
- [ ] Sugerir quick wins (alta relação impacto/esforço)

## FORMATO DE SAÍDA

```
AUDITORIA DE CONFORMIDADE WORDPRESS - RELATÓRIO COMPLETO
=========================================================

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
1. [Problema crítico #1 - categoria afetada]
2. [Problema crítico #2 - categoria afetada]
3. [Problema crítico #3 - categoria afetada]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

DETALHES POR CATEGORIA:

┌─────────────────────────────────────────────┐
│ ARQUITETURA (XX/25)                         │
└─────────────────────────────────────────────┘

Subpontuações:
  • Cabeçalho / bootstrap / autoload : XX/5
  • Prefixos / namespaces            : XX/5
  • Organização dos hooks            : XX/5
  • Blocos / estrutura do tema       : XX/5
  • REST / ciclo de vida             : XX/5

Pontos fortes:
- [Pontos fortes da arquitetura]

Problemas:
- [Problemas da arquitetura]

[Seções semelhantes para Qualidade de Código, Testes e Segurança...]

WOOCOMMERCE (se aplicável): [achados de HPOS / CRUD / checkout blocks]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

TOP 3 AÇÕES PRIORITÁRIAS (TODAS AS CATEGORIAS):

1. CRÍTICA - [Ação #1]
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

2. IMPORTANTE - [Ação #2]
   [Mesmo formato...]

3. RECOMENDADA - [Ação #3]
   [Mesmo formato...]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

QUICK WINS (Alto Impacto / Baixo Esforço):

- [Quick win #1] - Categoria: [X] - Impacto: [X] - Esforço: [X]
- [Quick win #2] - Categoria: [X] - Impacto: [X] - Esforço: [X]
- [Quick win #3] - Categoria: [X] - Impacto: [X] - Esforço: [X]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PLANO DE AÇÃO RECOMENDADO:

SEMANA 1 (Imediato):
- [ ] [Ação crítica #1]
- [ ] [Quick win prioritário]

SEMANAS 2-4 (Curto prazo):
- [ ] [Ação importante #2]
- [ ] [Outros quick wins]

MÊS 2-3 (Médio prazo):
- [ ] [Ação recomendada #3]
- [ ] [Melhorias progressivas]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

RESUMO EXECUTIVO:

[Parágrafo de resumo sobre o estado geral do projeto, principais pontos
fortes, principais fraquezas e trajetória recomendada. Indicar se o
projeto está pronto para produção, requer correções ou precisa de refatoração.]

Recomendação Geral: [Pronto para produção / Correções menores /
Refatoração importante / Reformulação necessária]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## NOTAS IMPORTANTES

- Este comando orquestra as 4 auditorias especializadas
- Use Docker para todas as ferramentas de análise (`docker compose exec app ...` ou `npx wp-env run ...`)
- Forneça exemplos concretos com arquivo:linha para cada problema
- Priorize as ações com base na matriz Impacto/Esforço
- Os problemas de segurança são SEMPRE a prioridade máxima
- Proponha correções automatizáveis (scripts, hooks de pre-commit, etapas de CI)
- O relatório deve ser acionável, não apenas descritivo
- Pragmatismo em primeiro lugar: não penalize um pequeno plugin de arquivo único por não ter camadas quando as responsabilidades estão separadas
- Fora do escopo: regras genéricas de PHP (veja o stack `php`), hospedagem e implantações no estilo Bedrock, desenvolvimento do núcleo do WordPress
