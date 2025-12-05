# Auditoria de Dependências Python

Você é um especialista em segurança Python. Você deve auditar as dependências do projeto para identificar vulnerabilidades, pacotes obsoletos e problemas de licença.

## Argumentos
$ARGUMENTS

Argumentos:
- (Opcional) Foco: security, outdated, licenses, all

Exemplo: `/python:dependency-audit security` ou `/python:dependency-audit all`

## MISSÃO

### Passo 1: Identificar Configuração

```bash
# Arquivos de dependência possíveis
ls -la requirements*.txt pyproject.toml setup.py Pipfile poetry.lock

# Listar dependências instaladas
pip list --format=json
pip freeze
```

### Passo 2: Auditoria de Segurança

```bash
# Usar pip-audit (recomendado)
pip install pip-audit
pip-audit

# Ou safety (alternativa)
pip install safety
safety check -r requirements.txt

# Ou com pip nativo (Python 3.12+)
pip audit
```

### Passo 3: Verificar Atualizações

```bash
# Pacotes obsoletos
pip list --outdated --format=json

# Com pip-tools
pip install pip-tools
pip-compile --upgrade --dry-run

# Com poetry
poetry show --outdated

# Com pipenv
pipenv update --dry-run
```

### Passo 4: Auditoria de Licenças

```bash
# Instalar pip-licenses
pip install pip-licenses

# Listar licenças
pip-licenses --format=markdown

# Filtrar licenças problemáticas
pip-licenses --fail-on="GPL;AGPL"

# Exportar JSON
pip-licenses --format=json --output-file=licenses.json
```

### Passo 5: Análise de Dependências Transitivas

```bash
# Árvore de dependências
pip install pipdeptree
pipdeptree

# Formato JSON
pipdeptree --json

# Dependências reversas (quem usa o quê)
pipdeptree --reverse --packages requests
```

### Passo 6: Gerar Relatório

```
══════════════════════════════════════════════════════════════
📦 AUDITORIA DE DEPENDÊNCIAS PYTHON
══════════════════════════════════════════════════════════════

──────────────────────────────────────────────────────────────
🔒 VULNERABILIDADES DE SEGURANÇA
──────────────────────────────────────────────────────────────

| Pacote | Versão | CVE | Severidade | Corrigido Em |
|---------|---------|-----|----------|----------|
| requests | 2.25.0 | CVE-2023-32681 | HIGH | 2.31.0 |
| urllib3 | 1.26.5 | CVE-2023-45803 | MEDIUM | 1.26.18 |
| pillow | 9.0.0 | CVE-2023-44271 | CRITICAL | 10.0.1 |

⚠️ AÇÕES NECESSÁRIAS:
1. `pip install requests>=2.31.0` (prioridade HIGH)
2. `pip install urllib3>=1.26.18` (prioridade MEDIUM)
3. `pip install pillow>=10.0.1` (prioridade CRITICAL)

──────────────────────────────────────────────────────────────
📈 PACOTES OBSOLETOS
──────────────────────────────────────────────────────────────

### Atualizações MAJOR (Possíveis breaking changes)
| Pacote | Atual | Mais Recente | Changelog |
|---------|---------|--------|-----------|
| django | 3.2.23 | 5.0.1 | [Changelog](url) |
| pydantic | 1.10.13 | 2.5.3 | [Migration](url) |

### Atualizações MINOR (Recomendadas)
| Pacote | Atual | Mais Recente |
|---------|---------|--------|
| fastapi | 0.104.0 | 0.109.0 |
| sqlalchemy | 2.0.23 | 2.0.25 |

### Atualizações PATCH (Segurança/Bugfix)
| Pacote | Atual | Mais Recente |
|---------|---------|--------|
| httpx | 0.26.0 | 0.26.1 |

──────────────────────────────────────────────────────────────
📜 LICENÇAS
──────────────────────────────────────────────────────────────

### Resumo
| Tipo | Contagem | Pacotes |
|------|-------|----------|
| MIT | 45 | requests, fastapi, ... |
| Apache-2.0 | 12 | google-cloud-*, ... |
| BSD-3-Clause | 8 | numpy, pandas, ... |
| GPL-3.0 | 2 | ⚠️ package-x, package-y |
| UNKNOWN | 1 | ❓ private-package |

### ⚠️ Licenças Copyleft Detectadas
Estas licenças podem ter implicações legais:

| Pacote | Licença | Impacto |
|---------|---------|--------|
| package-x | GPL-3.0 | Código derivado deve ser GPL |
| package-y | AGPL-3.0 | Mesmo para SaaS |

**Recomendação**: Verificar compatibilidade com licença do projeto.

──────────────────────────────────────────────────────────────
📊 ESTATÍSTICAS
──────────────────────────────────────────────────────────────

| Métrica | Valor |
|--------|-------|
| Total de pacotes | 87 |
| Diretos | 23 |
| Transitivos | 64 |
| Vulnerabilidades | 3 |
| Obsoletos | 15 |
| Licenças OK | 82 |
| Licenças a verificar | 5 |

──────────────────────────────────────────────────────────────
🔧 COMANDOS DE CORREÇÃO
──────────────────────────────────────────────────────────────

# Corrigir vulnerabilidades críticas
pip install --upgrade requests>=2.31.0 urllib3>=1.26.18 pillow>=10.0.1

# Atualizar patches de segurança
pip install --upgrade httpx

# Gerar requirements.txt atualizado
pip freeze > requirements.txt

# Ou com pip-tools
pip-compile --upgrade requirements.in

──────────────────────────────────────────────────────────────
🎯 PRIORIDADES
──────────────────────────────────────────────────────────────

1. [ ] CRÍTICO: Corrigir pillow (CVE-2023-44271)
2. [ ] HIGH: Corrigir requests (CVE-2023-32681)
3. [ ] MEDIUM: Corrigir urllib3 (CVE-2023-45803)
4. [ ] Verificar licenças GPL (package-x, package-y)
5. [ ] Planejar migração pydantic v1 → v2
```
