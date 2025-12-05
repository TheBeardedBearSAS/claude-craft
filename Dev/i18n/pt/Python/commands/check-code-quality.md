# Verificar Qualidade do Código Python

## Argumentos

$ARGUMENTS (opcional: caminho para o projeto a analisar)

## MISSÃO

Realizar uma auditoria completa da qualidade do código do projeto Python verificando conformidade com PEP8, tipagem, legibilidade e melhores práticas definidas nas regras do projeto.

### Passo 1: Padrões de Codificação PEP8

Verificar conformidade com convenções Python:
- [ ] Nomenclatura: snake_case para funções/variáveis, PascalCase para classes
- [ ] Indentação: 4 espaços (sem tabs)
- [ ] Comprimento de linha: máximo 88 caracteres (Black)
- [ ] Imports: organizados (stdlib, third-party, local) e ordenados
- [ ] Espaços: ao redor de operadores, após vírgulas
- [ ] Docstrings: presentes para módulos, classes, funções públicas

**Comando**: Executar `docker run --rm -v $(pwd):/app python:3.11 python -m flake8 /app --max-line-length=88`

**Referência**: `rules/03-coding-standards.md` seção "PEP 8 Compliance"

### Passo 2: Type Hints e MyPy

Verificar uso de tipagem estática:
- [ ] Type hints em todos os parâmetros de função
- [ ] Type hints em valores de retorno
- [ ] Anotações para atributos de classe
- [ ] Uso de `typing` para tipos complexos (Optional, Union, List, Dict)
- [ ] Sem erros de MyPy em modo strict

**Comando**: Executar `docker run --rm -v $(pwd):/app python:3.11 python -m mypy /app --strict`

**Referência**: `rules/03-coding-standards.md` seção "Type Hints"

### Passo 3: Linting com Ruff

Analisar código com Ruff (substitui Flake8, isort, pydocstyle):
- [ ] Sem imports não utilizados
- [ ] Sem variáveis não utilizadas
- [ ] Sem código morto (código inacessível)
- [ ] Complexidade ciclomática aceitável (<10)
- [ ] Regras de segurança respeitadas (regras S)

**Comando**: Executar `docker run --rm -v $(pwd):/app python:3.11 pip install ruff && ruff check /app`

**Referência**: `rules/06-tooling.md` seção "Linting and Formatting"

### Passo 4: Formatação com Black

Verificar consistência de formatação:
- [ ] Código formatado com Black
- [ ] Configuração do Black em pyproject.toml
- [ ] Sem diferenças após `black --check`
- [ ] Comprimento de linha consistente (88 caracteres)

**Comando**: Executar `docker run --rm -v $(pwd):/app python:3.11 pip install black && black --check /app`

**Referência**: `rules/06-tooling.md` seção "Code Formatting"

### Passo 5: Princípios KISS, DRY, YAGNI

Analisar simplicidade e clareza do código:
- [ ] Funções curtas (<20 linhas idealmente)
- [ ] Sem duplicação de código (DRY)
- [ ] Sem over-engineering (YAGNI)
- [ ] Nomenclatura explícita e auto-documentada
- [ ] Único nível de abstração por função
- [ ] Returns antecipados para reduzir complexidade

**Referência**: `rules/05-kiss-dry-yagni.md`

### Passo 6: Comentários e Documentação

Avaliar qualidade da documentação:
- [ ] Docstrings estilo Google ou NumPy
- [ ] Comentários apenas para "por quê", não "o quê"
- [ ] README.md completo com setup e uso
- [ ] Sem código comentado (usar git)
- [ ] Documentação de decisões arquiteturais importantes

**Referência**: `rules/03-coding-standards.md` seção "Documentation"

### Passo 7: Tratamento de Erros

Verificar robustez do código:
- [ ] Exceções específicas (não Exception genérico)
- [ ] Sem `pass` silencioso em except
- [ ] Mensagens de erro informativas
- [ ] Validação de entrada do usuário
- [ ] Gerenciamento adequado de recursos (context managers)

**Referência**: `rules/03-coding-standards.md` seção "Error Handling"

### Passo 8: Calcular Pontuação

Atribuição de pontos (de 25):
- PEP8 e formatação: 5 pontos
- Type hints e MyPy: 5 pontos
- Ruff linting: 4 pontos
- KISS/DRY/YAGNI: 4 pontos
- Documentação: 4 pontos
- Tratamento de erros: 3 pontos

## FORMATO DE SAÍDA

```
AUDITORIA DE QUALIDADE DO CÓDIGO PYTHON
================================

PONTUAÇÃO GERAL: XX/25

PONTOS FORTES:
- [Lista de boas práticas observadas]

MELHORIAS:
- [Lista de melhorias menores]

PROBLEMAS CRÍTICOS:
- [Lista de violações sérias de padrões]

DETALHES POR CATEGORIA:

1. PEP8 E FORMATAÇÃO (XX/5)
   Status: [Conformidade com padrões Python]
   Erros Flake8: XX
   Diferenças Black: XX arquivos

2. TYPE HINTS (XX/5)
   Status: [Cobertura de tipagem estática]
   Erros MyPy: XX
   Cobertura: XX%

3. RUFF LINTING (XX/4)
   Status: [Qualidade do código]
   Avisos: XX
   Imports Não Utilizados: XX
   Complexidade Máxima: XX

4. KISS/DRY/YAGNI (XX/4)
   Status: [Simplicidade e clareza]
   Funções >20 linhas: XX
   Código Duplicado: XX instâncias

5. DOCUMENTAÇÃO (XX/4)
   Status: [Qualidade da documentação]
   Docstrings Faltando: XX
   Cobertura: XX%

6. TRATAMENTO DE ERROS (XX/3)
   Status: [Robustez do código]
   Exceções Genéricas: XX
   `except pass`: XX

TOP 3 AÇÕES PRIORITÁRIAS:
1. [Ação mais crítica para melhorar qualidade]
2. [Segunda ação prioritária]
3. [Terceira ação prioritária]
```

## NOTAS

- Executar todas as ferramentas de linting disponíveis no projeto
- Usar Docker para abstrair do ambiente local
- Fornecer exemplos de arquivos/linhas problemáticos
- Sugerir correções automatizáveis (hooks de pre-commit)
- Priorizar quick wins (formatação automática) vs refatoração profunda
