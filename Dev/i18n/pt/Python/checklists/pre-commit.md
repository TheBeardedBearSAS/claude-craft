# Checklist Pré-Commit

## Antes de Cada Commit

### 1. Qualidade do Código

- [ ] **Linting** - Código segue os padrões
  ```bash
  make lint
  # ou
  ruff check src/ tests/
  ```

- [ ] **Formatação** - Código formatado adequadamente
  ```bash
  make format-check
  # ou
  black --check src/ tests/
  isort --check src/ tests/
  ```

- [ ] **Verificação de Tipos** - Sem erros de tipo
  ```bash
  make type-check
  # ou
  mypy src/
  ```

- [ ] **Segurança** - Sem vulnerabilidades óbvias
  ```bash
  make security-check
  # ou
  bandit -r src/ -ll
  ```

### 2. Testes

- [ ] **Todos os testes passam**
  ```bash
  make test
  # ou
  pytest tests/
  ```

- [ ] **Novos testes escritos** para novo código
  - [ ] Testes unitários para nova lógica
  - [ ] Testes de integração se necessário
  - [ ] Testes E2E se fluxo crítico

- [ ] **Cobertura mantida** (> 80%)
  ```bash
  make test-cov
  # ou
  pytest --cov=src --cov-report=term
  ```

- [ ] **Testes relevantes** para bugs corrigidos
  - [ ] Teste reproduz o bug (deve falhar antes da correção)
  - [ ] Teste passa após a correção

### 3. Padrões de Código

- [ ] **PEP 8** respeitado
  - [ ] Máximo 88 caracteres por linha
  - [ ] Imports organizados (stdlib, third-party, local)
  - [ ] Sem espaços em branco no final

- [ ] **Type hints** em todas as funções públicas
  ```python
  def my_function(param: str) -> int:
      """Docstring."""
      pass
  ```

- [ ] **Docstrings** estilo Google
  ```python
  def function(arg1: str, arg2: int) -> bool:
      """
      Linha de resumo.

      Args:
          arg1: Descrição
          arg2: Descrição

      Returns:
          Descrição

      Raises:
          ValueError: Se condição
      """
      pass
  ```

- [ ] **Convenções de nomenclatura**
  - [ ] Classes: PascalCase
  - [ ] Funções/variáveis: snake_case
  - [ ] Constantes: UPPER_CASE
  - [ ] Privados: _prefixado

### 4. Arquitetura

- [ ] **Arquitetura Limpa** respeitada
  - [ ] Domínio não depende de nada
  - [ ] Dependências apontam para dentro
  - [ ] Protocols para abstrações

- [ ] **SOLID** aplicado
  - [ ] Single Responsibility
  - [ ] Open/Closed
  - [ ] Liskov Substitution
  - [ ] Interface Segregation
  - [ ] Dependency Inversion

- [ ] **KISS, DRY, YAGNI**
  - [ ] Solução simples
  - [ ] Sem duplicação
  - [ ] Sem código desnecessário

### 5. Segurança

- [ ] **Sem secrets** hardcoded no código
  - [ ] Sem senhas
  - [ ] Sem chaves de API
  - [ ] Sem tokens

- [ ] **Variáveis de ambiente**
  - [ ] Adicionadas ao `.env.example` se novas
  - [ ] Documentadas no README se necessário

- [ ] **Validação de entrada**
  - [ ] Todas as entradas validadas (Pydantic)
  - [ ] Sem SQL injection (queries parametrizadas)
  - [ ] Sem XSS injection

- [ ] **Dados sensíveis**
  - [ ] Senhas com hash (bcrypt)
  - [ ] PII protegido
  - [ ] Logs não contêm dados sensíveis

### 6. Banco de Dados

- [ ] **Migração** criada se mudança de schema
  ```bash
  make db-migrate msg="Descrição"
  # ou
  alembic revision --autogenerate -m "Descrição"
  ```

- [ ] **Migração testada**
  - [ ] Upgrade funciona
  - [ ] Downgrade funciona
  - [ ] Sem perda de dados

- [ ] **Índices** adicionados se necessário
  - [ ] Em colunas frequentemente pesquisadas
  - [ ] Em chaves estrangeiras

### 7. Performance

- [ ] **Queries N+1** evitadas
  - [ ] Uso de joinedload/selectinload se necessário
  - [ ] Sem queries em loops

- [ ] **Paginação** para listas grandes
  - [ ] Limit/offset implementado
  - [ ] Sem carregamento de milhares de itens

- [ ] **Cache** se apropriado
  - [ ] Cache para dados acessados frequentemente
  - [ ] Invalidação de cache gerenciada

### 8. Logging & Monitoramento

- [ ] **Logging apropriado**
  - [ ] Nível correto (DEBUG, INFO, WARNING, ERROR)
  - [ ] Mensagens claras e informativas
  - [ ] Contexto adicionado (user_id, request_id, etc.)

- [ ] **Sem print()** - usar logger
  ```python
  # ❌ Ruim
  print(f"User {user_id} created")

  # ✅ Bom
  logger.info(f"User created", extra={"user_id": user_id})
  ```

- [ ] **Exceções logadas**
  ```python
  try:
      risky_operation()
  except Exception as e:
      logger.error(f"Operation failed: {e}", exc_info=True)
      raise
  ```

### 9. Documentação

- [ ] **Comentários no código** para lógica complexa
  - [ ] Sem comentários óbvios
  - [ ] Explicação do "por quê", não do "o quê"

- [ ] **README** atualizado se necessário
  - [ ] Novas funcionalidades documentadas
  - [ ] Instruções de configuração atualizadas
  - [ ] Variáveis de ambiente documentadas

- [ ] **Docs da API** atualizadas
  - [ ] Novos endpoints documentados
  - [ ] Exemplos fornecidos
  - [ ] Erros documentados

### 10. Git

- [ ] **Mensagem de commit** segue Conventional Commits
  ```
  type(scope): assunto

  corpo

  rodapé
  ```
  - Tipos: feat, fix, docs, style, refactor, test, chore
  - Assunto: imperativo, minúsculas, sem ponto
  - Corpo: opcional, detalhes da mudança
  - Rodapé: breaking changes, closes issues

- [ ] **Commit atômico**
  - [ ] Um commit = uma mudança lógica
  - [ ] Sem commits gigantes
  - [ ] Sem commits "WIP" ou "fix"

- [ ] **Arquivos temporários** não incluídos
  - [ ] Sem .pyc, __pycache__
  - [ ] Sem .env (apenas .env.example)
  - [ ] Sem arquivos de IDE

### 11. Dependências

- [ ] **Novas dependências** justificadas
  - [ ] Realmente necessária?
  - [ ] Sem alternativa nas deps existentes?
  - [ ] Biblioteca mantida e segura?

- [ ] **Lock file** atualizado
  ```bash
  poetry lock
  # ou
  uv lock
  ```

- [ ] **Versão fixada** corretamente
  - [ ] Não versões muito amplas (`*`)
  - [ ] Compatível com outras deps

### 12. Limpeza

- [ ] **Código morto** removido
  - [ ] Sem código comentado
  - [ ] Sem funções não utilizadas
  - [ ] Sem imports não utilizados

- [ ] **Código de debug** removido
  - [ ] Sem breakpoint()
  - [ ] Sem prints de debug
  - [ ] Sem TODO/FIXME (ou criar issue)

- [ ] **Logs de console** removidos
  - [ ] Sem print() de debug
  - [ ] Logs apropriados utilizados

## Comando de Verificação Rápida

```bash
# Comando único para verificar tudo
make quality && make test-cov
```

## Hook de Pre-commit

Para automatizar, use hooks de pre-commit:

```bash
# .pre-commit-config.yaml já configurado
pre-commit install

# Executar manualmente
pre-commit run --all-files
```

## Se Algo Falhar

### Erros de Linting

```bash
# Auto-corrigir o que pode ser corrigido
make lint-fix
# ou
ruff check --fix src/ tests/
```

### Erros de Formatação

```bash
# Auto-formatar
make format
# ou
black src/ tests/
isort src/ tests/
```

### Testes Falhando

```bash
# Executar testes em modo verbose para debug
pytest -vv tests/

# Executar teste específico
pytest tests/path/to/test.py::test_function -vv

# Ver stdout/stderr
pytest -s tests/
```

### Erros de Tipo

```bash
# Ver erros detalhados
mypy src/ --show-error-codes

# Ignorar temporariamente (evitar!)
# type: ignore[error-code]
```

## Exceções

### Hotfix Urgente

Se hotfix urgente de produção:
- [ ] Testes mínimos passam
- [ ] Correção verificada manualmente
- [ ] PR criado imediatamente depois
- [ ] TODO criado para melhorar testes

### Commit WIP

Se realmente necessário (evitar):
- [ ] Commit em branch separada
- [ ] Prefixado com `WIP:`
- [ ] Fazer squash antes do merge para main

## Checklist Rápida (Mínimo)

- [ ] `make lint` ✅
- [ ] `make type-check` ✅
- [ ] `make test` ✅
- [ ] Mensagem de commit válida ✅
- [ ] Sem secrets ✅
