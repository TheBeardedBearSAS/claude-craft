---
description: Verificação Pré-Merge
argument-hint: [arguments]
---

# Verificação Pré-Merge

Você é um assistente de qualidade de código. Você deve realizar todas as verificações necessárias ANTES de mesclar um branch, para garantir qualidade e evitar regressões.

## Argumentos
$ARGUMENTS

Argumentos esperados:
- Branch de origem (padrão: branch atual)
- Branch de destino (padrão: main ou master)

Exemplo: `/common:pre-merge-check feature/auth main`

## MISSÃO

### Etapa 1: Analisar o Diff

```bash
# Identificar branches
SOURCE_BRANCH=$(git branch --show-current)
TARGET_BRANCH=${2:-main}

# Commits a mesclar
git log $TARGET_BRANCH..$SOURCE_BRANCH --oneline

# Arquivos modificados
git diff $TARGET_BRANCH...$SOURCE_BRANCH --stat

# Linhas adicionadas/removidas
git diff $TARGET_BRANCH...$SOURCE_BRANCH --shortstat
```

### Etapa 2: Verificações de Qualidade

#### 2.1 Testes Completos
```bash
# Executar TODOS os testes
# Symfony
docker compose exec php vendor/bin/phpunit --coverage-text

# Flutter
docker run --rm -v $(pwd):/app -w /app dart flutter test --coverage

# Python
docker compose exec app pytest --cov --cov-report=term

# React/RN
docker compose exec node npm run test -- --coverage
```

#### 2.2 Análise Estática Completa
```bash
# PHPStan (nível máximo)
docker compose exec php vendor/bin/phpstan analyse -l max

# Dart Analyzer
docker run --rm -v $(pwd):/app -w /app dart dart analyze --fatal-infos

# Mypy (strict)
docker compose exec app mypy --strict .

# TypeScript
docker compose exec node npx tsc --noEmit
```

#### 2.3 Verificação de Dependências
```bash
# Auditoria de segurança
# PHP
docker compose exec php composer audit

# Python
docker compose exec app pip-audit

# Node
docker compose exec node npm audit

# Flutter
docker run --rm -v $(pwd):/app -w /app dart dart pub outdated
```

### Etapa 3: Verificações Específicas

#### Migrações de BD (se presentes)
```bash
# Verificar migrações Doctrine
git diff $TARGET_BRANCH...$SOURCE_BRANCH -- migrations/

# Se migrações presentes
docker compose exec php php bin/console doctrine:migrations:diff --no-interaction
docker compose exec php php bin/console doctrine:schema:validate
```

#### Breaking Changes na API
```bash
# Comparar especificações OpenAPI
git diff $TARGET_BRANCH...$SOURCE_BRANCH -- openapi.yaml docs/api/
```

#### Alterações de Configuração
```bash
# Arquivos de configuração modificados
git diff $TARGET_BRANCH...$SOURCE_BRANCH -- config/ .env.example docker-compose*.yml
```

### Etapa 4: Análise de Commits

```bash
# Verificar mensagens de commit
git log $TARGET_BRANCH..$SOURCE_BRANCH --pretty=format:"%s" | while read msg; do
    # Padrão convencional: type(scope): description
    if ! echo "$msg" | grep -qE "^(feat|fix|docs|style|refactor|test|chore)(\(.+\))?: .+"; then
        echo "⚠️ Mensagem não convencional: $msg"
    fi
done
```

### Etapa 5: Verificação de Cobertura

```bash
# Comparar cobertura antes/depois
# A cobertura não deve diminuir
```

### Etapa 6: Gerar Relatório

```
══════════════════════════════════════════════════════════════
🔀 VERIFICAÇÃO PRÉ-MERGE
══════════════════════════════════════════════════════════════

📌 Origem: feature/user-auth
📌 Destino: main
📅 Data: YYYY-MM-DD HH:MM

──────────────────────────────────────────────────────────────
📊 ESTATÍSTICAS
──────────────────────────────────────────────────────────────

Commits: 12
Arquivos modificados: 45
Linhas adicionadas: +1,234
Linhas removidas: -567

──────────────────────────────────────────────────────────────
🧪 TESTES
──────────────────────────────────────────────────────────────

| Suite | Testes | Passou | Falhou | Ignorado |
|-------|-------|--------|---------|---------|
| Unit  | 234   | 234    | 0       | 0       |
| Integ | 45    | 45     | 0       | 0       |
| E2E   | 12    | 12     | 0       | 0       |

Cobertura: 85.2% (anterior: 84.8%) ✅ +0.4%

──────────────────────────────────────────────────────────────
🔍 ANÁLISE ESTÁTICA
──────────────────────────────────────────────────────────────

| Ferramenta | Erros | Avisos | Status |
|-------|---------|----------|--------|
| PHPStan | 0 | 2 | ✅ |
| ESLint | 0 | 5 | ⚠️ |
| Mypy | 0 | 0 | ✅ |

──────────────────────────────────────────────────────────────
🔒 SEGURANÇA
──────────────────────────────────────────────────────────────

Auditoria de dependências: ✅ Sem vulnerabilidades
Segredos detectados: ✅ Nenhum
Arquivos sensíveis: ✅ Nenhum

──────────────────────────────────────────────────────────────
📦 MIGRAÇÕES
──────────────────────────────────────────────────────────────

Novas migrações: 2
  - Version20240115_AddUserRoles.php
  - Version20240116_CreateAuditLog.php

Validação de esquema: ✅ OK
Rollback possível: ✅ Sim

──────────────────────────────────────────────────────────────
⚠️ PONTOS DE ATENÇÃO
──────────────────────────────────────────────────────────────

1. [MÉDIO] 5 avisos ESLint para corrigir
2. [BAIXO] 2 TODOs adicionados no código
3. [INFO] 2 novas migrações - verificar no staging primeiro

──────────────────────────────────────────────────────────────
📋 CHECKLIST FINAL
──────────────────────────────────────────────────────────────

- [x] Todos os testes passam
- [x] Cobertura mantida ou melhorada
- [x] Sem erros de análise estática
- [x] Sem vulnerabilidades de segurança
- [x] Nenhum segredo commitado
- [ ] Code review aprovado (verificar manualmente)
- [ ] Testado em staging (verificar manualmente)

──────────────────────────────────────────────────────────────
🎯 VEREDICTO
──────────────────────────────────────────────────────────────

Merge autorizado: ✅ SIM

Recomendações antes do merge:
1. Resolver 5 avisos ESLint
2. Testar migrações em staging
3. Obter aprovação do code review
```

## Regras Bloqueantes

### Bloqueante (merge proibido)
- ❌ Testes falhando
- ❌ Queda significativa de cobertura (> 2%)
- ❌ Erros de análise estática
- ❌ Vulnerabilidades críticas/altas
- ❌ Segredos no código
- ❌ Migrações não reversíveis

### Não bloqueante (aviso)
- ⚠️ Avisos de análise estática
- ⚠️ TODO/FIXME adicionados
- ⚠️ Vulnerabilidades baixas/médias
- ⚠️ Cobertura ligeiramente diminuída (< 2%)
