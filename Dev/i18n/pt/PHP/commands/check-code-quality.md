---
description: Análise de Qualidade de Código PHP
argument-hint: [argumentos]
---

# Análise de Qualidade de Código PHP

## Argumentos

$ARGUMENTS (opcional: caminho para o projeto PHP a analisar, padrão é o diretório atual)

## Modo Plano

> O modo plano é ativado automaticamente quando o escopo abrange vários módulos ou requer investigação transversal.

## MISSÃO

Analise a qualidade de código de um projeto PHP nativo. Combine análise estática (PHPStan), verificações de estilo (PSR-12), dicas de modernização (Rector) e métricas de complexidade. Produza um relatório acionável com pontuação de 25.

**Regras de referência**: `.claude/rules/php-coding-standards.md`, `.claude/rules/php-quality-tools.md`

### Etapa 1: Inventário de Ferramentas

- [ ] Leia as dependências de dev do `composer.json`
- [ ] Verifique PHPStan (`phpstan.neon` / `phpstan.neon.dist`)
- [ ] Verifique PHP-CS-Fixer (`.php-cs-fixer.dist.php`) ou PHP_CodeSniffer (`phpcs.xml`)
- [ ] Verifique Rector (`rector.php`)
- [ ] Verifique Psalm (opcional) (`psalm.xml`)

**Stack esperado (2026)**:
- PHPStan nível 10 (ou Psalm nível 1)
- PHP-CS-Fixer com regras PSR-12 + `@PHP85Migration`
- Rector com `LevelSetList::UP_TO_PHP_85`

### Etapa 2: Conformidade PSR-12 (5 pts)

```bash
docker compose exec app vendor/bin/php-cs-fixer fix --dry-run --diff --verbose
```

Verificar:
- [ ] 0 violações de estilo
- [ ] `declare(strict_types=1);` em cada arquivo
- [ ] Indentação de 4 espaços, quebras de linha LF
- [ ] Visibilidade de classe / método / propriedade sempre explícita

### Etapa 3: Análise Estática — PHPStan (5 pts)

```bash
docker compose exec app vendor/bin/phpstan analyse --level=max
```

Verificar:
- [ ] Nível 10 (ou max) passa com 0 erros
- [ ] Nenhum `@phpstan-ignore` sem comentário de justificativa
- [ ] Genéricos tipados corretamente (`@template`, `@param T`, `@return T`)
- [ ] Sem tipos de retorno `mixed` em APIs públicas

### Etapa 4: Segurança de Tipos (4 pts)

- [ ] 100% dos parâmetros tipados
- [ ] 100% dos tipos de retorno declarados
- [ ] Tipos de propriedade declarados (PHP 7.4+)
- [ ] Propriedades readonly usadas onde mutação é proibida (PHP 8.1+)
- [ ] Property Hooks usados para propriedades computadas (PHP 8.4+)
- [ ] Visibilidade assimétrica usada onde relevante (PHP 8.4+)

### Etapa 5: KISS / DRY / YAGNI (4 pts)

- [ ] Complexidade cognitiva < 7 por método (alvo), < 10 máx
- [ ] Métodos < 20 linhas
- [ ] Complexidade ciclomática < 10
- [ ] Sem código morto (verificar com `vimeo/psalm --find-dead-code` ou `rector`)
- [ ] DRY: regras de negócio em um só lugar (Value Objects para validação)
- [ ] YAGNI: sem abstração especulativa — regra de 3 antes de extrair

**Comando de detecção**:

```bash
docker compose exec app vendor/bin/phpmetrics --report-cli src/
```

### Etapa 6: Nomenclatura & Documentação (4 pts)

- [ ] Nomes de classe em `PascalCase`, métodos em `camelCase`, constantes `UPPER_SNAKE_CASE`
- [ ] Nomes são explícitos (sem `getData`, `process`, `manager` sem contexto)
- [ ] PHPDoc em APIs públicas apenas com genéricos complexos (tipos já na assinatura)
- [ ] Sem comentários órfãos descrevendo O QUE (explicar apenas PORQUÊ)

### Etapa 7: Tratamento de Erros (3 pts)

- [ ] Exceções específicas do domínio, não `\Exception` genérica
- [ ] Sem erros silenciados (operador `@` proibido)
- [ ] Segurança nula: preferir tipos `Option`/`Maybe` ou nullable explícito + early return
- [ ] Exceções nunca capturadas para serem silenciosamente ignoradas

## FORMATO DE SAÍDA

```
AUDITORIA DE QUALIDADE DE CÓDIGO PHP
=====================================

PONTUAÇÃO: XX/25

PSR-12 (X/5)
  Violações php-cs-fixer: N
  Problemas Críticos:
  - [arquivo:linha] descrição

PHPSTAN (X/5)
  Nível atingido: N/10
  Erros restantes: N
  Principais bloqueadores:
  - [arquivo:linha] descrição

SEGURANÇA DE TIPOS (X/4)
  Parâmetros não tipados: N
  Retornos não tipados: N
  Tipos de propriedade ausentes: N

KISS / DRY / YAGNI (X/4)
  Métodos de alta complexidade (>10): N
  Blocos duplicados: N
  Código morto: N

NOMENCLATURA & DOCS (X/4)
  Nomes não explícitos: N
  PHPDoc obsoleto: N

TRATAMENTO DE ERROS (X/3)
  Usos de @: N
  \Exception genérica lançada: N

TOP 3 GANHOS RÁPIDOS:
1. Execute `vendor/bin/php-cs-fixer fix` — 0 esforço, corrige N violações
2. [...]
3. [...]

TOP 3 AÇÕES DE LONGO PRAZO:
1. Atingir PHPStan nível máximo — dividir em 3 sprints
2. [...]
3. [...]
```

## NOTAS IMPORTANTES

- Sempre use Docker (`docker compose exec app ...`)
- Nunca baixe níveis PHPStan sem mensagem de commit justificando
- Prefira Rector para modernização em massa (conjuntos de migração PHP 8.5)
- Cobertura de 100% sem mutation testing é uma falsa sensação de segurança — reporte pontuação de mutação se Infection estiver configurado
