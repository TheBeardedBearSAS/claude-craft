---
description: Verificar Cobertura de Tipos Python
argument-hint: [arguments]
---

# Verificar Cobertura de Tipos Python

Você é um especialista Python. Você deve verificar a cobertura de anotações de tipo no projeto e identificar funções/métodos não tipados.

## Argumentos
$ARGUMENTS

Argumentos:
- (Opcional) Caminho para módulo específico
- (Opcional) Limite mínimo de cobertura (ex: `80`)

Exemplo: `/python:type-coverage app/` ou `/python:type-coverage app/api/ 90`

## Modo Plano

> O modo plano é ativado automaticamente quando o escopo abrange vários módulos ou requer investigação transversal.

## MISSÃO

### Passo 1: Configuração MyPy

[Mostrar configuração mypy em pyproject.toml]

### Passo 2: Lançar Análise

```bash
# MyPy padrão
mypy app/

# Com relatório de cobertura
mypy app/ --txt-report type-coverage/

# Relatório HTML
mypy app/ --html-report type-coverage-html/

# Modo strict progressivo
mypy app/ --strict --warn-return-any
```

### Passo 3: Script de Análise de Cobertura

[Script Python para analisar cobertura de tipos usando AST]

### Passo 4: Padrões de Tipagem

[Mostrar padrões: TypeAlias, Generics, Protocols, Callable, Overload, etc.]

### Passo 5: Gerar Relatório

```
══════════════════════════════════════════════════════════════
📊 RELATÓRIO DE COBERTURA DE TIPOS
══════════════════════════════════════════════════════════════

──────────────────────────────────────────────────────────────
📈 RESUMO GLOBAL
──────────────────────────────────────────────────────────────

| Métrica | Valor | Limite | Status |
|--------|-------|-----------|--------|
| Cobertura Global | 78.5% | 80% | ⚠️ |
| Total de Funções | 245 | - | - |
| Totalmente Tipadas | 192 | - | - |
| Parcialmente Tipadas | 38 | - | - |
| Não Tipadas | 15 | - | - |

──────────────────────────────────────────────────────────────
📁 COBERTURA POR MÓDULO
──────────────────────────────────────────────────────────────

| Módulo | Funções | Tipadas | Cobertura |
|--------|-----------|-------|----------|
| app/api/ | 45 | 45 | 100% ✅ |
| app/core/ | 32 | 30 | 93.8% ✅ |
| app/services/ | 58 | 52 | 89.7% ✅ |
| app/crud/ | 40 | 35 | 87.5% ✅ |
| app/models/ | 28 | 20 | 71.4% ⚠️ |
| app/utils/ | 42 | 10 | 23.8% ❌ |

──────────────────────────────────────────────────────────────
❌ FUNÇÕES NÃO TIPADAS
──────────────────────────────────────────────────────────────

### app/utils/helpers.py

| Linha | Função | Faltando |
|------|----------|---------|
| 15 | `parse_date` | tipo de retorno |
| 28 | `format_currency` | param: amount, retorno |
| 45 | `slugify` | tipo de retorno |
| 67 | `calculate_hash` | param: data |

──────────────────────────────────────────────────────────────
🔧 CORREÇÕES SUGERIDAS
──────────────────────────────────────────────────────────────

### app/utils/helpers.py:15

```python
# Antes
def parse_date(date_str):
    ...

# Depois
def parse_date(date_str: str) -> datetime | None:
    ...
```

──────────────────────────────────────────────────────────────
🎯 PRIORIDADES
──────────────────────────────────────────────────────────────

1. [ ] Tipar app/utils/ (23.8% → 80%+)
2. [ ] Completar app/models/ (71.4% → 90%+)
3. [ ] Corrigir 23 erros mypy
4. [ ] Adicionar plugin mypy para SQLAlchemy
5. [ ] Configurar hook pre-commit mypy
```
