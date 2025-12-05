# Verificar Testes Python

## Argumentos

$ARGUMENTS (opcional: caminho para o projeto a analisar)

## MISSÃO

Realizar uma auditoria completa da estratégia de testes do projeto Python verificando cobertura, qualidade dos testes e conformidade com melhores práticas definidas nas regras do projeto.

### Passo 1: Estrutura e Organização dos Testes

Examinar organização dos testes:
- [ ] Pasta `tests/` na raiz do projeto
- [ ] Estrutura espelha código fonte (tests/domain, tests/application, etc.)
- [ ] Arquivos de teste nomeados `test_*.py` ou `*_test.py`
- [ ] Fixtures Pytest em `conftest.py`
- [ ] Separação de testes unit / integration / e2e

**Referência**: `rules/07-testing.md` seção "Test Organization"

### Passo 2: Cobertura de Código

Medir cobertura de testes:
- [ ] Cobertura geral ≥ 80%
- [ ] Cobertura da Camada Domain ≥ 90%
- [ ] Cobertura da Camada Application ≥ 85%
- [ ] Arquivos críticos a 100%
- [ ] Configuração de cobertura em pyproject.toml

**Comando**: Executar `docker run --rm -v $(pwd):/app python:3.11 sh -c "pip install pytest pytest-cov && pytest /app --cov=/app --cov-report=term-missing"`

**Referência**: `rules/07-testing.md` seção "Code Coverage"

### Passo 3: Testes Unitários

Analisar qualidade dos testes unitários:
- [ ] Testes isolados (sem dependências externas)
- [ ] Uso de mocks/stubs para dependências
- [ ] Testes rápidos (<100ms por teste)
- [ ] Um teste = Um comportamento
- [ ] Nomenclatura descritiva: `test_should_X_when_Y`
- [ ] Padrão AAA (Arrange, Act, Assert)

**Referência**: `rules/07-testing.md` seção "Unit Tests"

### Passo 4: Testes de Integração

Verificar testes de integração:
- [ ] Testes de interações entre componentes
- [ ] Testes da camada Infrastructure (BD, API, etc.)
- [ ] Uso de bancos de dados de teste (fixtures)
- [ ] Limpeza após cada teste (teardown)
- [ ] Testes isolados e independentes

**Referência**: `rules/07-testing.md` seção "Integration Tests"

### Passo 5: Assertions e Qualidade dos Testes

Verificar qualidade das assertions:
- [ ] Assertions explícitas e específicas
- [ ] Sem múltiplas assertions não relacionadas
- [ ] Mensagens de erro claras
- [ ] Testes de casos extremos
- [ ] Testes de erros e exceções
- [ ] Sem testes desabilitados sem razão (skip/xfail)

**Referência**: `rules/07-testing.md` seção "Assertions and Test Quality"

### Passo 6: Fixtures e Parametrização

Avaliar uso de fixtures pytest:
- [ ] Fixtures para setup/teardown comuns
- [ ] Escopo apropriado (function, class, module, session)
- [ ] Parametrização com `@pytest.mark.parametrize`
- [ ] Factories para objetos de teste complexos
- [ ] Sem duplicação em fixtures

**Referência**: `rules/07-testing.md` seção "Pytest Fixtures"

### Passo 7: Performance e Execução

Analisar performance dos testes:
- [ ] Tempo total de execução <30 segundos (testes unitários)
- [ ] Testes paralelizáveis (pytest-xdist)
- [ ] Sem sleep() em testes
- [ ] Configuração Pytest em pyproject.toml
- [ ] CI/CD com execução automática de testes

**Comando**: Executar `docker run --rm -v $(pwd):/app python:3.11 sh -c "pip install pytest && pytest /app -v --duration=10"`

**Referência**: `rules/07-testing.md` seção "Test Performance"

### Passo 8: Test-Driven Development (TDD)

Verificar adoção de TDD:
- [ ] Testes escritos antes do código (se aplicável)
- [ ] Ciclo Red-Green-Refactor
- [ ] Testes guiando o design
- [ ] Sem código não testado em produção

**Referência**: `rules/01-workflow-analysis.md` seção "TDD Workflow"

### Passo 9: Calcular Pontuação

Atribuição de pontos (de 25):
- Cobertura de código: 7 pontos
- Testes unitários: 6 pontos
- Testes de integração: 4 pontos
- Qualidade de assertion: 3 pontos
- Fixtures e organização: 3 pontos
- Performance: 2 pontos

## FORMATO DE SAÍDA

```
AUDITORIA DE TESTES PYTHON
================================

PONTUAÇÃO GERAL: XX/25

PONTOS FORTES:
- [Lista de boas práticas de teste observadas]

MELHORIAS:
- [Lista de melhorias menores]

PROBLEMAS CRÍTICOS:
- [Lista de lacunas críticas de testes]

DETALHES POR CATEGORIA:

1. COBERTURA (XX/7)
   Status: [Análise de cobertura]
   Cobertura Geral: XX%
   Domínio: XX%
   Aplicação: XX%
   Infraestrutura: XX%

2. TESTES UNITÁRIOS (XX/6)
   Status: [Qualidade dos testes unitários]
   Número de Testes: XX
   Testes Isolados: XX%
   Tempo Médio: XXms

3. TESTES DE INTEGRAÇÃO (XX/4)
   Status: [Testes de integração]
   Número de Testes: XX
   Cobertura Infrastructure: XX%

4. ASSERTIONS (XX/3)
   Status: [Qualidade das assertions]
   Assertions Específicas: XX%
   Testes de Casos Extremos: XX

5. FIXTURES (XX/3)
   Status: [Organização e fixtures]
   Fixtures Reutilizáveis: XX
   Testes Parametrizados: XX

6. PERFORMANCE (XX/2)
   Status: [Performance dos testes]
   Tempo Total: XXs
   Testes >1s: XX

TOP 3 AÇÕES PRIORITÁRIAS:
1. [Ação mais crítica para melhorar testes]
2. [Segunda ação prioritária]
3. [Terceira ação prioritária]
```

## NOTAS

- Executar pytest com cobertura para obter métricas
- Usar Docker para abstrair do ambiente local
- Identificar arquivos críticos sem testes
- Propor testes faltantes para funcionalidades chave
- Sugerir melhorias concretas para testes existentes
- Priorizar testes baseado no risco de negócio
