# Verificação Pré-Commit

Você é um assistente de qualidade de código. Você deve realizar todas as verificações necessárias ANTES de criar um commit, para garantir que o código atenda aos padrões do projeto.

## Argumentos
$ARGUMENTS

Opções:
- `--fix`: Corrige automaticamente problemas corrigíveis
- `--staged`: Verifica apenas arquivos preparados

## MISSÃO

### Etapa 1: Identificar Arquivos Modificados

```bash
# Arquivos preparados
git diff --cached --name-only

# Arquivos modificados (não preparados)
git diff --name-only
```

### Etapa 2: Detectar Tecnologia por Arquivo

| Extensão | Tecnologia | Ferramentas |
|-----------|-------------|--------|
| `.php` | PHP/Symfony | php-cs-fixer, phpstan |
| `.dart` | Flutter | dart format, dart analyze |
| `.py` | Python | ruff, mypy |
| `.ts`, `.tsx` | React/RN | eslint, prettier |
| `.js`, `.jsx` | React/RN | eslint, prettier |

### Etapa 3: Executar Verificações

#### Para arquivos PHP
```bash
# Formatação
docker compose exec php vendor/bin/php-cs-fixer fix --dry-run --diff [arquivos]

# Análise estática
docker compose exec php vendor/bin/phpstan analyse [arquivos]

# Sintaxe Twig (se modificado)
docker compose exec php php bin/console lint:twig templates/

# Container Symfony
docker compose exec php php bin/console lint:container
```

#### Para arquivos Dart/Flutter
```bash
# Formatação
docker run --rm -v $(pwd):/app -w /app dart dart format --set-exit-if-changed [arquivos]

# Análise
docker run --rm -v $(pwd):/app -w /app dart dart analyze [arquivos]

# Testes afetados
docker run --rm -v $(pwd):/app -w /app dart flutter test --coverage
```

#### Para arquivos Python
```bash
# Linting + formatação
docker compose exec app ruff check [arquivos]
docker compose exec app ruff format --check [arquivos]

# Tipos
docker compose exec app mypy [arquivos]
```

#### Para arquivos JS/TS
```bash
# Linting
docker compose exec node npx eslint [arquivos]

# Formatação
docker compose exec node npx prettier --check [arquivos]

# Tipos (se TypeScript)
docker compose exec node npx tsc --noEmit
```

### Etapa 4: Verificações Globais

#### Segredos
```bash
# Buscar padrões de segredos
grep -rE "(password|secret|api_key|token)\s*[:=]\s*['\"][^'\"]+['\"]" --include="*.{php,py,ts,js,dart}" .
grep -rE "sk_live_|pk_live_|ghp_|gho_|AKIA" .
```

#### Arquivos proibidos
```bash
# Verificar ausência de arquivos sensíveis
git diff --cached --name-only | grep -E "\.(env|pem|key|p12)$"
```

#### Tamanho de arquivo
```bash
# Arquivos > 1MB
find . -type f -size +1M -name "*.{php,py,ts,js,dart}"
```

### Etapa 5: Gerar Relatório

```
══════════════════════════════════════════════════════════════
🔍 VERIFICAÇÃO PRÉ-COMMIT
══════════════════════════════════════════════════════════════

📁 Arquivos verificados: X
📅 Data: YYYY-MM-DD HH:MM

──────────────────────────────────────────────────────────────
✅ VERIFICAÇÕES BEM-SUCEDIDAS
──────────────────────────────────────────────────────────────

✅ Formatação PHP (php-cs-fixer)
✅ Análise estática PHP (phpstan)
✅ Formatação TypeScript (prettier)
✅ Linting TypeScript (eslint)
✅ Nenhum segredo detectado

──────────────────────────────────────────────────────────────
⚠️ PROBLEMAS DETECTADOS
──────────────────────────────────────────────────────────────

❌ [PHP] src/Controller/UserController.php:45
   PHPStan: Parameter $id of method __construct() has no type hint

⚠️ [TS] src/components/Button.tsx:12
   ESLint: 'unused' is defined but never used (no-unused-vars)

──────────────────────────────────────────────────────────────
📋 RESUMO
──────────────────────────────────────────────────────────────

| Categoria | Status |
|-----------|--------|
| Formatação | ✅ OK |
| Linting   | ⚠️ 1 aviso |
| Tipos     | ❌ 1 erro |
| Segredos   | ✅ OK |

──────────────────────────────────────────────────────────────
🎯 AÇÕES NECESSÁRIAS
──────────────────────────────────────────────────────────────

1. Corrigir erro PHPStan em UserController.php
2. (Opcional) Corrigir aviso ESLint

Commit autorizado: ❌ NÃO (1 erro bloqueante)
```

### Opção --fix

Se `--fix` for passado como argumento:

```bash
# PHP
docker compose exec php vendor/bin/php-cs-fixer fix [arquivos]

# Dart
docker run --rm -v $(pwd):/app -w /app dart dart format [arquivos]

# Python
docker compose exec app ruff check --fix [arquivos]
docker compose exec app ruff format [arquivos]

# JS/TS
docker compose exec node npx eslint --fix [arquivos]
docker compose exec node npx prettier --write [arquivos]
```

## Regras Bloqueantes

### Bloqueante (commit proibido)
- ❌ Erros de sintaxe
- ❌ Erros PHPStan/mypy/tsc
- ❌ Segredos detectados
- ❌ Arquivos .env commitados
- ❌ Chaves privadas/certificados

### Não bloqueante (aviso)
- ⚠️ Problemas de formatação
- ⚠️ Avisos ESLint
- ⚠️ Cobertura de testes diminuída
- ⚠️ TODO/FIXME adicionados

## Dica

Para automatizar, configure um hook pre-commit:

```bash
# .git/hooks/pre-commit
#!/bin/sh
claude-code "/common:pre-commit-check --staged"
```
